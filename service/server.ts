// verso-i18n PR service (Node). Readers sign in with GitHub (verso-i18n, a
// GitHub App with user authorization); their reviews are committed to a fork
// owned by the service (verso-i18n-writer) and proposed as a PR in their name.
//
//   node service/server.ts [--port 8787] [--env ~/.config/verso/secrets.env]
//                          [--public-url https://…] [--static <rendered site>]
//
// Configuration (environment, or the --env file):
//   VERSO_APP_ID, VERSO_CLIENT_ID, VERSO_CLIENT_SECRET   verso-i18n
//   VERSO_PRIVATE_KEY               PEM, or VERSO_PRIVATE_KEY_FILE
//                                   (default ~/.config/verso/verso-i18n.pem)
//   VERSO_WRITER_APP_ID             verso-i18n-writer
//   VERSO_WRITER_PRIVATE_KEY        PEM, or VERSO_WRITER_PRIVATE_KEY_FILE
//                                   (default ~/.config/verso/verso-i18n-writer.pem)
//   VERSO_SESSION_KEY               32 bytes, base64
//   VERSO_FORK_OWNER                organisation that owns the forks
//   VERSO_PUBLIC_URL                public address (the OAuth callback is <url>/auth/callback)
//   VERSO_CACHE                     repository snapshots (default service/.cache)
//   PORT                            default 8787
//
// Routes:
//   GET  /healthz                         liveness (no GitHub calls)
//   GET  /auth/login?repo=&dir=&return=   start "Sign in with GitHub"
//   GET  /auth/callback                   GitHub returns here; back to the page
//                                         with #verso-session=…&verso-login=…
//   POST /api/submit?repo=&dir=           unit operations → commit + PR
//   GET  /status?repo=&dir=               is everything installed for this site?
//   GET  /*                               the rendered site, with --static (local testing)

import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { authorizeUrl, exchangeCode, gh, GitHubError, Installations, refreshTokens } from './github.ts';
import { Sealer, type Session } from './session.ts';
import { Sites } from './site.ts';
import { submit } from './submit.ts';

const args = process.argv.slice(2);
const opt = (k: string, d?: string) => {
  const i = args.indexOf(`--${k}`);
  return i !== -1 ? args[i + 1] : d;
};
const home = (p: string) => p.replace(/^~(?=\/|$)/, os.homedir());

function loadEnv(file: string): void {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    // KEY=value, KEY="value" or KEY='value'; an unquoted value ends at " #" (a comment).
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(?:(['"])(.*?)\2|(.*?))\s*(?:\s#.*)?$/.exec(line);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2] ? m[3] : m[4];
  }
}
loadEnv(home(opt('env', '~/.config/verso/secrets.env')!));

function need(k: string): string {
  const v = process.env[k];
  if (!v) throw new Error(`${k} is not set`);
  return v;
}

const PORT = Number(opt('port', process.env.PORT ?? '8787'));
const PUBLIC_URL = (opt('public-url', process.env.VERSO_PUBLIC_URL) ?? `http://localhost:${PORT}`).replace(/\/$/, '');
const CALLBACK = `${PUBLIC_URL}/auth/callback`;
const STATIC = opt('static') ? path.resolve(home(opt('static')!)) : undefined;
const CACHE = path.resolve(home(opt('cache', process.env.VERSO_CACHE ?? path.join(path.dirname(new URL(import.meta.url).pathname), '.cache'))!));

const oauth = { clientId: need('VERSO_CLIENT_ID'), clientSecret: need('VERSO_CLIENT_SECRET') };
/** A private key from `<k>` (PEM; `\n` escapes allowed) or the file named by `<k>_FILE`. */
const readKey = (k: string, d: string) =>
  process.env[k]?.replace(/\\n/g, '\n') ?? fs.readFileSync(home(process.env[`${k}_FILE`] ?? d), 'utf8');
const reader = new Installations({ appId: need('VERSO_APP_ID'), privateKey: readKey('VERSO_PRIVATE_KEY', '~/.config/verso/verso-i18n.pem') });
const writer = new Installations({ appId: need('VERSO_WRITER_APP_ID'), privateKey: readKey('VERSO_WRITER_PRIVATE_KEY', '~/.config/verso/verso-i18n-writer.pem') });
const sealer = new Sealer(need('VERSO_SESSION_KEY'));
const FORK_OWNER = need('VERSO_FORK_OWNER');
const sites = new Sites(CACHE, reader);
const log = (m: string) => console.log(`[verso] ${m}`);

// ---- helpers ----------------------------------------------------------------------

type Headers = Record<string, string>;

function send(res: http.ServerResponse, status: number, body: string | Buffer, type = 'text/html; charset=utf-8', extra: Headers = {}) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(body);
}
const json = (res: http.ServerResponse, status: number, body: unknown, extra: Headers = {}) => send(res, status, JSON.stringify(body), 'application/json', extra);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const page = (title: string, body: string) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:40rem;margin:3rem auto;padding:0 16px}</style></head><body><h1>${esc(title)}</h1>${body}</body></html>`;

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let s = '';
    req.setEncoding('utf8');
    req.on('data', (d) => {
      s += d;
      if (s.length > 1_000_000) reject(new Error('body too large'));
    });
    req.on('end', () => resolve(s));
    req.on('error', reject);
  });
}

const corsFor = (origin: string): Headers => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '600',
  Vary: 'Origin',
});

const hits = new Map<string, number[]>();
function limited(key: string, max = 30): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < 3600_000);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

/** The reader behind a sealed session, refreshing the GitHub token when it is about to expire. */
async function readerFrom(header: string | undefined): Promise<{ reader: { id: number; login: string; token: string }; session?: string } | undefined> {
  const m = /^Bearer (.+)$/.exec(header ?? '');
  const s = m ? sealer.open<Session>(m[1], 'session') : undefined;
  if (!s) return undefined;
  let renewed: string | undefined;
  if (s.expires && s.expires - Date.now() < 120_000) {
    if (!s.refresh) return undefined;
    try {
      const t = await refreshTokens(oauth, s.refresh);
      Object.assign(s, { access: t.access, refresh: t.refresh ?? s.refresh, expires: t.expires });
      renewed = sealer.seal(s, 'session');
    } catch {
      return undefined;
    }
  }
  try {
    const u = await gh(s.access, 'GET', '/user'); // also catches revoked authorizations
    return { reader: { id: u.id, login: u.login, token: s.access }, session: renewed };
  } catch (e) {
    if (e instanceof GitHubError && e.status === 401) return undefined;
    throw e;
  }
}

// ---- routes ----------------------------------------------------------------------------

async function login(url: URL, res: http.ServerResponse) {
  const repo = url.searchParams.get('repo') ?? '';
  const ret = url.searchParams.get('return') ?? '';
  let back: URL;
  try {
    back = new URL(ret);
  } catch {
    return send(res, 400, page('Cannot sign in', '<p>Missing or invalid return address.</p>'));
  }
  const site = await sites.get(repo, url.searchParams.get('dir') ?? '');
  if (!site.origins.includes(back.origin)) {
    return send(res, 403, page('Cannot sign in', `<p><code>${esc(back.origin)}</code> is not listed in <code>${esc(site.prefix)}_i18n/_service.yml</code> of <code>${esc(repo)}</code>.</p>`));
  }
  back.hash = '';
  const state = sealer.seal({ ret: back.toString(), exp: Date.now() + 600_000 }, 'state');
  send(res, 302, '', 'text/plain', { Location: authorizeUrl(oauth, CALLBACK, state) });
}

async function callback(url: URL, res: http.ServerResponse) {
  const st = sealer.open<{ ret: string; exp: number }>(url.searchParams.get('state') ?? '', 'state');
  if (!st || st.exp < Date.now()) return send(res, 400, page('Sign-in expired', '<p>Go back to the page and choose “Sign in with GitHub” again.</p>'));
  const back = new URL(st.ret);
  if (url.searchParams.get('error')) {
    back.hash = 'verso-error=denied';
    return send(res, 302, '', 'text/plain', { Location: back.toString() });
  }
  const t = await exchangeCode(oauth, url.searchParams.get('code') ?? '', CALLBACK);
  const u = await gh(t.access, 'GET', '/user');
  const session: Session = { id: u.id, login: u.login, access: t.access, refresh: t.refresh, expires: t.expires };
  back.hash = `verso-session=${sealer.seal(session, 'session')}&verso-login=${encodeURIComponent(u.login)}`;
  log(`${u.login} signed in`);
  send(res, 302, '', 'text/plain', { Location: back.toString() });
}

async function apiSubmit(req: http.IncomingMessage, url: URL, res: http.ServerResponse) {
  const origin = String(req.headers.origin ?? '');
  const cors = origin ? corsFor(origin) : {};
  const site = await sites.get(url.searchParams.get('repo') ?? '', url.searchParams.get('dir') ?? '');
  if (!origin || !site.origins.includes(origin)) return json(res, 403, { error: `origin not allowed (see ${site.prefix}_i18n/_service.yml)` }, cors);
  const who = await readerFrom(req.headers.authorization);
  if (!who) return json(res, 401, { error: 'sign in with GitHub first', signin: true }, cors);
  if (limited(`submit:${who.reader.id}`)) return json(res, 429, { error: 'too many submissions; try again later' }, cors);
  const r = await submit({ reader, writer, forkOwner: FORK_OWNER, log }, site, who.reader, JSON.parse(await readBody(req)));
  log(`${who.reader.login} submit → ${r.status}`);
  json(res, r.status, { ...r.json, ...(who.session ? { session: who.session } : {}) }, cors);
}

async function status(url: URL, res: http.ServerResponse) {
  const repo = url.searchParams.get('repo') ?? '';
  const out: Record<string, unknown> = { service: PUBLIC_URL, callback: CALLBACK, forkOwner: FORK_OWNER };
  try {
    const site = await sites.get(repo, url.searchParams.get('dir') ?? '');
    Object.assign(out, { reader: `verso-i18n can read ${repo} (${site.defaultBranch} @ ${site.sha.slice(0, 7)})`, origins: site.origins, languages: site.project.languages(), review: site.project.tc.review ?? null });
  } catch (e) {
    out.reader = `error: ${(e as Error).message}`;
  }
  try {
    await writer.token(FORK_OWNER);
    out.writer = `verso-i18n-writer is installed on ${FORK_OWNER}`;
  } catch (e) {
    out.writer = `error: ${(e as Error).message}`;
  }
  json(res, 200, out);
}

const MIME: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };

function serveStatic(url: URL, res: http.ServerResponse) {
  if (!STATIC) return send(res, 404, page('verso-i18n', '<p>The verso-i18n PR service. Nothing to see here.</p>'));
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.resolve(STATIC, '.' + rel);
  if (!file.startsWith(STATIC + path.sep)) return send(res, 403, 'forbidden', 'text/plain');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, page('Not found', `<p>${esc(rel)} not found. Has the site been rendered?</p>`));
  send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] ?? 'application/octet-stream');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', PUBLIC_URL);
  try {
    if (req.method === 'OPTIONS') {
      // Preflight grants nothing by itself; the POST checks the site's origin list.
      return send(res, 204, '', 'text/plain', req.headers.origin ? corsFor(String(req.headers.origin)) : {});
    }
    if (url.pathname === '/healthz' && req.method === 'GET') return send(res, 200, 'ok', 'text/plain');
    if (url.pathname === '/auth/login' && req.method === 'GET') return await login(url, res);
    if (url.pathname === '/auth/callback' && req.method === 'GET') return await callback(url, res);
    if (url.pathname === '/api/submit' && req.method === 'POST') return await apiSubmit(req, url, res);
    if (url.pathname === '/status' && req.method === 'GET') return await status(url, res);
    if (req.method === 'GET') return serveStatic(url, res);
    send(res, 405, 'method not allowed', 'text/plain');
  } catch (e) {
    const msg = (e as Error).message;
    console.error(`[verso] ${req.method} ${url.pathname}: ${msg}`);
    const origin = req.headers.origin ? corsFor(String(req.headers.origin)) : {};
    if (url.pathname.startsWith('/api/')) return json(res, e instanceof GitHubError && e.status < 500 ? 502 : 500, { error: msg }, origin);
    send(res, 500, page('Something went wrong', `<p>${esc(msg)}</p>`));
  }
});

server.listen(PORT, () => {
  log(`PR service on ${PUBLIC_URL} (callback ${CALLBACK}); forks in ${FORK_OWNER}`);
  if (STATIC) log(`serving ${STATIC} at ${PUBLIC_URL}/`);
});

// Containers stop with SIGTERM; finish requests in flight (a submission can take seconds).
for (const sig of ['SIGTERM', 'SIGINT'] as const) {
  process.on(sig, () => {
    log(`${sig}: stopping`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 20_000).unref();
  });
}
