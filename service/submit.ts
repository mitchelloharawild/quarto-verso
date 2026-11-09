// A reader's submission: unit operations in; a commit on the reader's branch
// in the service-owned fork, and a pull request opened with the reader's token.
//
//   site repo  owner/name         read with verso-i18n (contents: read)
//   fork       <fork-owner>/owner--name, branch i18n/<login>/<lang>
//                                 written with verso-i18n-writer (contents: write)
//   PR         opened and updated with the reader's own token

import { applyOps, checkContribution, type CheckResult, type UnitOp } from '../src/core/contrib.ts';
import { PROJECT_FILE, PROJECT_TFILE, type Project } from '../src/cli/project.ts';
import { gh, ghMaybe, GitHubError, type Installations } from './github.ts';
import type { Site } from './site.ts';

export interface SubmitContext {
  reader: Installations;
  writer: Installations;
  forkOwner: string;
  log: (m: string) => void;
}

export interface Reader {
  id: number;
  login: string;
  token: string;
}

type FileOp = UnitOp & { file: string };
type Dropped = { file: string; op: UnitOp; reason: string; done?: boolean };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const forkName = (repo: string) => repo.replace('/', '--');

function groupByFile(ops: FileOp[]): Map<string, UnitOp[]> {
  const m = new Map<string, UnitOp[]>();
  for (const { file, ...op } of ops) m.set(file, [...(m.get(file) ?? []), op as UnitOp]);
  return m;
}
const stripFile = ({ file: _f, ...op }: FileOp): UnitOp => op as UnitOp;

/** Validate the request body against the site: known language, files and operation shapes. */
export function parseOps(p: Project, body: any): { lang: string; ops: FileOp[] } | { error: string } {
  const { lang, ops } = body ?? {};
  if (!p.tc.targets.map(String).includes(lang)) return { error: 'unknown language' };
  if (!Array.isArray(ops) || !ops.length || ops.length > 200) return { error: 'expected 1–200 operations' };
  const sources = new Set(p.sources());
  const clean: FileOp[] = [];
  for (const o of ops) {
    const file = o?.file;
    if (typeof file !== 'string' || (file !== PROJECT_FILE && !sources.has(file))) return { error: `unknown file ${file}` };
    if (o?.op === 'approve' && typeof o.id === 'string') clean.push({ op: 'approve', id: o.id, file });
    else if (o?.op === 'replace' && typeof o.id === 'string' && typeof o.text === 'string' && o.text.length < 20_000) clean.push({ op: 'replace', id: o.id, text: o.text, file });
    else return { error: 'invalid operation' };
  }
  return { lang, ops: clean };
}

/**
 * Apply operations, grouped by page, on top of `startFrom` (the open PR's
 * files, by path in the repo) or the default branch.
 */
async function applyAll(site: Site, lang: string, ops: FileOp[], login: string, startFrom: Record<string, string>) {
  const p = site.project;
  const date = new Date().toISOString().slice(0, 10);
  const head: Record<string, string> = {};
  const applied: FileOp[] = [];
  const dropped: Dropped[] = [];
  for (const [file, fops] of groupByFile(ops)) {
    const st = await p.state(lang, file);
    if (!st.tfile) {
      for (const op of fops) dropped.push({ file, op, reason: 'no translation file for this page' });
      continue;
    }
    const stored = p.storedPaths(lang, file);
    const fromBranch = stored.some((r) => startFrom[site.prefix + r] !== undefined);
    const from = fromBranch ? await p.loadTFile(lang, file, (r) => startFrom[site.prefix + r] ?? site.read(site.prefix + r)) : { tfile: st.tfile, parallel: st.parallel };
    const res = applyOps(from.tfile!, st.synced, fops, `gh:${login}`, date);
    for (const d of res.dropped) dropped.push({ file, ...d });
    if (!res.applied.length) continue;
    applied.push(...res.applied.map((op) => ({ ...op, file })));
    for (const [r, content] of Object.entries(await p.serialise(res.tfile, from.parallel?.raw))) {
      const k = site.prefix + r;
      if (content === site.read(k) && startFrom[k] === undefined) continue;
      head[k] = content;
    }
  }
  return { head, applied, dropped };
}

function runChecks(site: Site, login: string, branch: string, head: Record<string, string>): Promise<CheckResult[]> {
  const p = site.project;
  const changed = Object.keys(head).sort();
  const base = new Map(changed.flatMap((f) => (site.read(f) === undefined ? [] : [[f, site.read(f)!] as [string, string]])));
  return checkContribution(base, new Map(Object.entries(head)), changed, {
    author: `gh:${login}`, branch, prefix: site.prefix, md: p.md,
    readUnchanged: p.storage === 'parallel' ? (f) => site.read(f) : undefined,
    units: async (f) => (f === PROJECT_FILE || p.sources().includes(f) ? (await p.units(f)).units : null),
  });
}

function failureReason(checks: CheckResult[], id: string): string {
  const failed = checks.filter((c) => !c.ok);
  const about = failed.flatMap((c) => c.messages.filter((m) => m.includes(id)).map((m) => `check ${c.check}: ${m}`));
  return (about.length ? about : failed.flatMap((c) => c.messages.map((m) => `check ${c.check}: ${m}`))).join('; ') || 'checks failed';
}

/** Source pages a PR's files belong to (for its title). */
function pagesOf(site: Site, lang: string, files: string[]): string[] {
  const dir = `${site.prefix}_i18n/${lang}/`;
  const pages = files.filter((f) => f.startsWith(dir)).map((f) => f.slice(dir.length).replace(/\.yml$/, '')).map((f) => (f === PROJECT_TFILE.replace(/\.yml$/, '') ? PROJECT_FILE : f));
  return [...new Set(pages)].sort();
}

const prTitle = (lang: string, pages: string[]) =>
  `${lang}: review of ${pages.length <= 3 ? pages.join(', ') : `${pages.slice(0, 2).join(', ')} and ${pages.length - 2} more`}`;

/** The service-owned fork of the site repo, created on first use and synced with it. */
export async function ensureFork(ctx: SubmitContext, site: Site, token: string): Promise<string> {
  const full = `${ctx.forkOwner}/${forkName(site.repo)}`;
  let f = await ghMaybe(token, 'GET', `/repos/${full}`);
  if (!f) {
    ctx.log(`forking ${site.repo} to ${full}`);
    await gh(token, 'POST', `/repos/${site.repo}/forks`, { organization: ctx.forkOwner, name: forkName(site.repo), default_branch_only: true });
    for (let i = 0; i < 30 && !f; i++) {
      await sleep(2000);
      f = await ghMaybe(token, 'GET', `/repos/${full}`);
    }
    if (!f) throw new Error(`the fork ${full} did not appear`);
  }
  if (!f.fork || f.parent?.full_name !== site.repo) throw new Error(`${full} exists but is not a fork of ${site.repo}`);
  // The default branch's commit must exist in the fork before commits can build on it.
  for (let i = 0; i < 15; i++) {
    if (await ghMaybe(token, 'GET', `/repos/${full}/git/commits/${site.sha}`)) return full;
    try {
      await gh(token, 'POST', `/repos/${full}/merge-upstream`, { branch: f.default_branch });
    } catch (e) {
      ctx.log(`merge-upstream on ${full}: ${(e as Error).message}`);
    }
    await sleep(2000);
  }
  throw new Error(`${full} does not have ${site.sha.slice(0, 7)} from ${site.repo}`);
}

export async function submit(ctx: SubmitContext, site: Site, reader: Reader, body: any): Promise<{ status: number; json: any }> {
  const parsed = parseOps(site.project, body);
  if ('error' in parsed) return { status: 400, json: { error: parsed.error } };
  const { lang, ops } = parsed;
  const branch = `i18n/${reader.login}/${lang}`;
  const readToken = await ctx.reader.token(site.repo);

  // One PR per reader and language: further submissions add commits to it.
  const prs: any[] = await gh(readToken, 'GET', `/repos/${site.repo}/pulls?state=open&head=${encodeURIComponent(`${ctx.forkOwner}:${branch}`)}`);
  const open = prs.find((x) => x.user?.id === reader.id) ?? prs[0];
  const writeToken = await ctx.writer.token(ctx.forkOwner);
  const startFrom: Record<string, string> = {};
  if (open) {
    const files: any[] = await gh(readToken, 'GET', `/repos/${site.repo}/pulls/${open.number}/files?per_page=100`);
    for (const f of files) {
      if (f.status === 'removed' || !f.filename.startsWith(`${site.prefix}_i18n/`)) continue;
      const c = await gh(writeToken, 'GET', `/repos/${open.head.repo.full_name}/contents/${f.filename.split('/').map(encodeURIComponent).join('/')}?ref=${open.head.sha}`);
      startFrom[f.filename] = Buffer.from(c.content, 'base64').toString('utf8');
    }
  }

  const attempt = async (subset: FileOp[]) => {
    const res = await applyAll(site, lang, subset, reader.login, startFrom);
    const head = { ...startFrom, ...res.head };
    const checks = res.applied.length ? await runChecks(site, reader.login, branch, head) : [];
    return { res, head, checks, ok: checks.every((c) => c.ok) };
  };

  // Never lose a reader's work to one bad operation: keep the operations that
  // pass (page by page, then one at a time) and return the rest with the reason.
  let t = await attempt(ops);
  const rejected: Dropped[] = [];
  if (!t.ok) {
    const accepted: FileOp[] = [];
    for (const [file, fops] of groupByFile(ops)) {
      const withFile = fops.map((op) => ({ ...op, file }) as FileOp);
      if ((await attempt([...accepted, ...withFile])).ok) {
        accepted.push(...withFile);
        continue;
      }
      for (const op of withFile) {
        const r = await attempt([...accepted, op]);
        if (r.ok) accepted.push(op);
        else rejected.push({ file, op: stripFile(op), reason: failureReason(r.checks, op.id) });
      }
    }
    t = await attempt(accepted);
    for (const r of rejected) ctx.log(`${reader.login} ${lang} ${r.file} ${r.op.op} ${r.op.id} held back: ${r.reason}`);
  }
  const { res, head } = t;
  if (!res.applied.length) {
    return rejected.length
      ? { status: 422, json: { error: 'checks failed', rejected, dropped: res.dropped } }
      : { status: 422, json: { error: 'nothing to submit', dropped: res.dropped } };
  }

  // Commit to the fork: the default branch's tree plus this PR's files. When
  // the PR branch was made on an older default branch, the commit also has the
  // current default branch as a parent, so the PR only ever shows its own files.
  const fork = await ensureFork(ctx, site, writeToken);
  const baseCommit = await gh(writeToken, 'GET', `/repos/${fork}/git/commits/${site.sha}`);
  const tree = await gh(writeToken, 'POST', `/repos/${fork}/git/trees`, {
    base_tree: baseCommit.tree.sha,
    tree: Object.entries(head).map(([p, content]) => ({ path: p, mode: '100644', type: 'blob', content })),
  });
  let parents = [site.sha];
  const ref = await ghMaybe(writeToken, 'GET', `/repos/${fork}/git/ref/heads/${branch}`);
  if (open && ref) {
    const cmp = await gh(writeToken, 'GET', `/repos/${fork}/compare/${site.sha}...${ref.object.sha}`);
    parents = cmp.status === 'ahead' || cmp.status === 'identical' ? [ref.object.sha] : [ref.object.sha, site.sha];
  }
  const approvals = res.applied.filter((o) => o.op === 'approve').length;
  const edits = res.applied.length - approvals;
  const pagesNow = [...new Set(res.applied.map((o) => o.file))];
  const summary = [edits && `${edits} suggested edit${edits > 1 ? 's' : ''}`, approvals && `${approvals} approval${approvals > 1 ? 's' : ''}`].filter(Boolean).join(', ');
  const message = `i18n(${lang}): ${summary} ${pagesNow.length === 1 ? `for ${pagesNow[0]}` : `on ${pagesNow.length} pages`}`;
  const commit = await gh(writeToken, 'POST', `/repos/${fork}/git/commits`, {
    message, tree: tree.sha, parents,
    author: { name: reader.login, email: `${reader.id}+${reader.login}@users.noreply.github.com`, date: new Date().toISOString() },
  });
  if (ref) await gh(writeToken, 'PATCH', `/repos/${fork}/git/refs/heads/${branch}`, { sha: commit.sha, force: true });
  else await gh(writeToken, 'POST', `/repos/${fork}/git/refs`, { ref: `refs/heads/${branch}`, sha: commit.sha });

  // Open or update the PR as the reader.
  const title = prTitle(lang, pagesOf(site, lang, Object.keys(head)));
  let pr: any;
  if (open) {
    pr = open.title === title || open.user?.id !== reader.id ? open : await gh(reader.token, 'PATCH', `/repos/${site.repo}/pulls/${open.number}`, { title });
  } else {
    try {
      pr = await gh(reader.token, 'POST', `/repos/${site.repo}/pulls`, {
        title, head: `${ctx.forkOwner}:${branch}`, base: site.defaultBranch,
        body: [
          `Translation review (${lang}) submitted from the site by @${reader.login} through verso-i18n.`,
          '',
          'Each further submission by the same reader in this language adds a commit here.',
          'The contribution checks ran before every commit; CI runs them again.',
        ].join('\n'),
      });
    } catch (e) {
      if (e instanceof GitHubError && (e.status === 403 || e.status === 404)) {
        throw new GitHubError(e.status, `committed to ${fork}:${branch}, but GitHub refused to open the pull request with your sign-in (${e.message}). Is verso-i18n installed on ${site.repo}?`);
      }
      throw e;
    }
  }
  ctx.log(`${reader.login} ${lang}: ${message} → ${site.repo}#${pr.number}`);
  return { status: 200, json: { pr: { number: pr.number, title: pr.title, url: pr.html_url, branch }, applied: res.applied, dropped: res.dropped, rejected } };
}
