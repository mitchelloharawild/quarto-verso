// status and check.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { checkContribution, type CheckResult } from '../core/contrib.ts';
import { termWarnings } from '../core/glossary.ts';
import { pct } from '../core/score.ts';
import { displayStatus, reviewCount } from '../core/sync.ts';
import { unknownKeys } from '../core/tfile.ts';
import type { Log } from './build.ts';
import { validateStates } from './build.ts';
import { PROJECT_FILE, type Project } from './project.ts';

export interface StatusRow {
  lang: string;
  file: string;
  units: number;
  machine: number;
  reviewed: number;
  full: number;
  stale: number;
  missing: number;
  reviewedShare: number;
}

export async function status(p: Project, langs: string[]): Promise<StatusRow[]> {
  const rows: StatusRow[] = [];
  for (const lang of langs) {
    for (const file of p.allFiles()) {
      const st = await p.state(lang, file);
      const w = (f: (x: (typeof st.synced)[number]) => boolean) => st.synced.filter(f).reduce((n, u) => n + u.src.source.length, 0);
      const total = w(() => true) || 1;
      rows.push({
        lang, file, units: st.synced.length,
        machine: st.synced.filter((u) => displayStatus(u) === 'machine').length,
        reviewed: st.synced.filter((u) => displayStatus(u) === 'reviewed').length,
        full: st.synced.filter((u) => reviewCount(u) >= p.reviewTarget).length,
        stale: st.synced.filter((u) => u.status === 'stale').length,
        missing: st.synced.filter((u) => u.status === 'missing').length,
        reviewedShare: w((u) => reviewCount(u) > 0) / total,
      });
    }
  }
  return rows;
}

export function formatStatus(rows: StatusRow[]): string {
  const head = ['lang', 'file', 'units', 'machine', 'reviewed', `≥target`, 'stale', 'missing', 'reviewed %'];
  const body = rows.map((r) => [r.lang, r.file, r.units, r.machine, r.reviewed, r.full, r.stale, r.missing, pct(r.reviewedShare)].map(String));
  const widths = head.map((h, i) => Math.max(h.length, ...body.map((b) => b[i].length)));
  const line = (cells: string[]) => cells.map((c, i) => (i < 2 ? c.padEnd(widths[i]) : c.padStart(widths[i]))).join('  ');
  return [line(head), line(widths.map((n) => '-'.repeat(n))), ...body.map(line)].join('\n');
}

export interface Finding {
  level: 'error' | 'warning' | 'info';
  where: string;
  message: string;
}

function gitRoot(dir: string): string | null {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

export async function checkProject(p: Project, langs: string[]): Promise<Finding[]> {
  const out: Finding[] = [];
  for (const file of p.sources()) {
    const { issues } = await p.units(file);
    for (const i of issues) out.push({ level: i.level, where: `${file}${i.line ? ':' + i.line : ''}`, message: i.message });
  }
  const glossary = p.glossary();
  for (const lang of langs) {
    const states = await Promise.all(p.allFiles().map((f) => p.state(lang, f)));
    const rejected = await validateStates(p, states);
    for (const [k, r] of rejected) out.push({ level: 'warning', where: `${lang} ${k}`, message: `translation fails validation and falls back to the source: ${r}` });
    const lg = p.langGlossary(lang);
    let stale = 0;
    let missing = 0;
    for (const st of states) {
      for (const i of st.doc?.issues ?? []) {
        const where = `${lang} ${p.storedPaths(lang, st.file)[0]}${i.id ? '#' + i.id : i.line ? ':' + i.line : ''}`;
        out.push({ level: i.kind === 'untracked' ? 'warning' : 'error', where, message: i.kind === 'structure' ? `${i.message} Until then the units in between show the source.` : i.message });
      }
      for (const u of st.doc ? [] : st.tfile?.units ?? []) {
        const extra = unknownKeys(u);
        if (extra.length) out.push({ level: 'warning', where: `${lang} ${st.file}#${u.id}`, message: `unknown keys ${extra.join(', ')} in the translation file (left by another version; \`i18n translate\` removes them)` });
      }
      for (const u of st.synced) {
        if (u.status === 'stale') stale++;
        if (u.status === 'missing') missing++;
        if (u.status === 'current' && u.stored?.text && u.src.kind !== 'code') {
          for (const w of termWarnings(glossary, lg, u.src.source, u.stored.text)) out.push({ level: 'warning', where: `${lang} ${st.file}#${u.id}`, message: `glossary: ${w}` });
        }
      }
    }
    if (stale || missing) out.push({ level: 'info', where: lang, message: `${stale} stale and ${missing} missing units (run \`i18n translate\`)` });
  }
  // Maintainer guidance.
  const root = gitRoot(p.root);
  const wf = root ? path.join(root, '.github', 'workflows') : null;
  if (wf && fs.existsSync(wf)) {
    for (const f of fs.readdirSync(wf).filter((x) => /\.ya?ml$/.test(x))) {
      const text = fs.readFileSync(path.join(wf, f), 'utf8');
      if (/\bpull_request_target\b/.test(text)) out.push({ level: 'warning', where: `.github/workflows/${f}`, message: 'pull_request_target runs with secrets on PR content; never check out or render contribution PRs in it' });
    }
  }
  return out;
}

export function formatFindings(f: Finding[]): string {
  if (!f.length) return 'No problems found.';
  const icon = { error: '✖', warning: '!', info: '·' } as const;
  return f.map((x) => `${icon[x.level]} ${x.level.padEnd(7)} ${x.where}: ${x.message}`).join('\n');
}

// ---- check --base --head ---------------------------------------------------------------

export interface PrInput {
  author: string;
  branch?: string;
  base: Map<string, string>;
  head: Map<string, string>;
  changed: string[];
  /** Reads a file the PR did not change (path in the repo), from the base. */
  readUnchanged: (path: string) => string | undefined;
}

/** A PR in git: changed files between the merge base and head. */
export function readGitPr(repoDir: string, base: string, head: string, author: string, branch?: string): PrInput {
  const git = (...a: string[]) => execFileSync('git', a, { cwd: repoDir, encoding: 'utf8', maxBuffer: 64 << 20 });
  const mb = git('merge-base', base, head).trim();
  const changed = git('diff', '--name-only', '--no-renames', mb, head).split('\n').filter(Boolean);
  const show = (ref: string, f: string) => {
    try {
      return git('show', `${ref}:${f}`);
    } catch {
      return undefined;
    }
  };
  const baseMap = new Map<string, string>();
  const headMap = new Map<string, string>();
  for (const f of changed) {
    const a = show(mb, f);
    const b = show(head, f);
    if (a !== undefined) baseMap.set(f, a);
    if (b !== undefined) headMap.set(f, b);
  }
  return { author, branch, base: baseMap, head: headMap, changed, readUnchanged: (f) => show(mb, f) };
}

export async function checkPr(p: Project, pr: PrInput, prefix: string): Promise<CheckResult[]> {
  return checkContribution(pr.base, pr.head, pr.changed, {
    author: pr.author.startsWith('gh:') ? pr.author : `gh:${pr.author}`,
    branch: pr.branch, prefix, md: p.md,
    readUnchanged: pr.readUnchanged,
    units: async (file) => {
      if (file !== PROJECT_FILE && !p.sources().includes(file)) return null;
      return (await p.units(file)).units;
    },
  });
}

export function formatChecks(res: CheckResult[]): string {
  return res.map((r) => {
    const icon = !r.ok ? '✖' : r.attention?.length ? '!' : '✔';
    return `${icon} ${r.check}. ${r.name}${[...r.messages, ...(r.attention ?? [])].map((m) => `\n    ${m}`).join('')}`;
  }).join('\n');
}

export type { Log };
