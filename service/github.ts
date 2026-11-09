// GitHub REST access for the PR service: App JWTs, installation tokens, user
// OAuth (GitHub App user authorization), and a small request helper.

import crypto from 'node:crypto';

const API = 'https://api.github.com';
const UA = 'verso-i18n-service';

export interface AppCreds {
  appId: string;
  privateKey: string;
}

export class GitHubError extends Error {
  readonly status: number;
  readonly body?: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/** One REST call. `token` is an installation or user token, or an App JWT. */
export async function gh<T = any>(token: string, method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(path.startsWith('https://') ? path : API + path, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': UA,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  const json = text ? safeJson(text) : undefined;
  if (!r.ok) throw new GitHubError(r.status, `${method} ${path}: ${r.status} ${(json as any)?.message ?? text.slice(0, 200)}`, json);
  return json as T;
}

/** Like gh(), but a 404 is undefined. */
export async function ghMaybe<T = any>(token: string, method: string, path: string, body?: unknown): Promise<T | undefined> {
  try {
    return await gh<T>(token, method, path, body);
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return undefined;
    throw e;
  }
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

const b64url = (b: Buffer | string) => Buffer.from(b).toString('base64url');

/** A 9-minute App JWT (RS256), backdated a minute for clock drift. */
export function appJwt(app: AppCreds): string {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: app.appId }));
  const sig = crypto.createSign('RSA-SHA256').update(`${head}.${claims}`).sign(app.privateKey);
  return `${head}.${claims}.${b64url(sig)}`;
}

/** Installation tokens, cached until five minutes before they expire. */
export class Installations {
  private cache = new Map<string, { token: string; expires: number }>();
  private app: AppCreds;
  constructor(app: AppCreds) {
    this.app = app;
  }

  /** Token for the installation on a repository (`owner/name`) or an account (`owner`). */
  async token(target: string): Promise<string> {
    const hit = this.cache.get(target);
    if (hit && hit.expires - Date.now() > 300_000) return hit.token;
    const jwt = appJwt(this.app);
    const inst = target.includes('/')
      ? await ghMaybe(jwt, 'GET', `/repos/${target}/installation`)
      : (await ghMaybe(jwt, 'GET', `/orgs/${target}/installation`)) ?? (await ghMaybe(jwt, 'GET', `/users/${target}/installation`));
    if (!inst) throw new GitHubError(404, `the GitHub App ${this.app.appId} is not installed on ${target}`);
    const t = await gh(jwt, 'POST', `/app/installations/${inst.id}/access_tokens`);
    this.cache.set(target, { token: t.token, expires: Date.parse(t.expires_at) });
    return t.token;
  }
}

// ---- user authorization (OAuth web flow of a GitHub App) ----------------------

export interface OAuthCreds {
  clientId: string;
  clientSecret: string;
}

export interface UserTokens {
  access: string;
  refresh?: string;
  /** ms since epoch; undefined when the App does not expire user tokens. */
  expires?: number;
}

export function authorizeUrl(c: OAuthCreds, redirectUri: string, state: string): string {
  const u = new URL('https://github.com/login/oauth/authorize');
  u.searchParams.set('client_id', c.clientId);
  u.searchParams.set('redirect_uri', redirectUri);
  u.searchParams.set('state', state);
  u.searchParams.set('allow_signup', 'true');
  return u.toString();
}

async function tokenRequest(params: Record<string, string>): Promise<UserTokens> {
  const r = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify(params),
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new GitHubError(401, `GitHub sign-in failed: ${j.error_description ?? j.error ?? r.status}`);
  return { access: j.access_token, refresh: j.refresh_token, expires: j.expires_in ? Date.now() + Number(j.expires_in) * 1000 : undefined };
}

export const exchangeCode = (c: OAuthCreds, code: string, redirectUri: string) =>
  tokenRequest({ client_id: c.clientId, client_secret: c.clientSecret, code, redirect_uri: redirectUri });

export const refreshTokens = (c: OAuthCreds, refresh: string) =>
  tokenRequest({ client_id: c.clientId, client_secret: c.clientSecret, grant_type: 'refresh_token', refresh_token: refresh });
