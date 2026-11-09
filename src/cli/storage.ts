// sync and migrate for parallel storage.

import fs from 'node:fs';
import path from 'node:path';
import type { Log } from './build.ts';
import type { TFile } from '../core/types.ts';
import { sourcesFromHistory } from './history.ts';
import { PROJECT_FILE, Project } from './project.ts';

export interface SyncResult {
  file: string;
  lang: string;
  recorded: string[];
  changed: boolean;
  error?: string;
}

/**
 * Bring each translated document and its tracking file up to date: record
 * translations edited in the document (origin `by`, which also counts as that
 * person's review), and rewrite the document from the current source so new
 * source units appear (in the source language) and removed ones disappear.
 */
export async function syncParallel(p: Project, langs: string[], opts: { by?: string; reset?: boolean }, log: Log): Promise<SyncResult[]> {
  if (p.storage !== 'parallel') throw new Error('sync is for parallel storage (translate.storage: parallel)');
  const date = new Date().toISOString().slice(0, 10);
  const by = opts.by ? (opts.by.includes(':') ? opts.by : `gh:${opts.by}`) : undefined;
  const out: SyncResult[] = [];
  for (const lang of langs) {
    for (const file of p.sources()) {
      const st = await p.state(lang, file);
      if (!st.tfile || !st.parallel) continue;
      const res: SyncResult = { file, lang, recorded: [], changed: false };
      const structure = st.parallel.issues.find((i) => i.kind === 'structure');
      if (structure && !opts.reset) {
        res.error = structure.message;
        out.push(res);
        continue;
      }
      const tfile = structuredClone(st.tfile);
      for (const u of tfile.units) {
        if (!st.parallel.untracked.has(u.id)) continue;
        u.origin = { by: by ?? 'unknown', date };
        u.reviews = by ? [{ by, date }] : [];
        delete u.terms;
        res.recorded.push(u.id);
      }
      const before = p.storedPaths(lang, file).map((r) => readOr(p, r));
      await p.saveTFile(tfile, st.parallel.raw, { reset: opts.reset });
      const after = p.storedPaths(lang, file).map((r) => readOr(p, r));
      res.changed = before.some((b, i) => b !== after[i]);
      if (res.changed || res.recorded.length) log(`${lang} ${file}: ${res.recorded.length ? `recorded ${res.recorded.length} edited units` : 'updated from the source'}`);
      out.push(res);
    }
  }
  return out;
}

function readOr(p: Project, rel: string): string {
  const f = path.join(p.root, rel);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
}

/**
 * YAML translation files keep a snapshot of each translated unit's source:
 * taken from the current source where the hash matches, else from git history.
 */
async function fillSources(p: Project, file: string, tfile: TFile): Promise<void> {
  const current = new Map((await p.units(file)).units.map((u) => [u.hash, u.source]));
  const need = tfile.units.filter((u) => u.text && u.source === undefined);
  const old = await sourcesFromHistory(p.root, file, new Set(need.map((u) => u['source-hash']).filter((h) => !current.has(h))), p.md);
  for (const u of need) {
    const s = current.get(u['source-hash']) ?? old.get(u['source-hash']);
    if (s !== undefined) u.source = s;
  }
}

/** Convert every translation between yaml and parallel storage, and set translate.storage. */
export async function migrate(root: string, to: 'yaml' | 'parallel', log: Log): Promise<number> {
  const from = new Project(root);
  if (from.storage === to) throw new Error(`translate.storage is already ${to}`);
  const target = new Project(root, { storage: to });
  let n = 0;
  for (const lang of from.languages()) {
    for (const file of from.sources()) {
      const { tfile, parallel } = await from.loadTFile(lang, file);
      if (!tfile) continue;
      if (parallel?.issues.some((i) => i.kind === 'structure')) throw new Error(`${from.storedPaths(lang, file)[0]}: fix its structure first (i18n check)`);
      if (to === 'yaml') await fillSources(from, file, tfile);
      const old = from.storedPaths(lang, file);
      await target.saveTFile(tfile, parallel?.raw, { reset: true });
      const now = new Set(target.storedPaths(lang, file));
      for (const r of old) if (!now.has(r)) fs.rmSync(path.join(root, r), { force: true });
      n++;
    }
  }
  const doc = from.configDocument();
  if (to === 'yaml') doc.deleteIn(['translate', 'storage']);
  else doc.setIn(['translate', 'storage'], to);
  fs.writeFileSync(path.join(root, PROJECT_FILE), doc.toString({ lineWidth: 0 }));
  log(`converted ${n} translations to ${to} storage; set translate.storage in ${PROJECT_FILE}`);
  return n;
}
