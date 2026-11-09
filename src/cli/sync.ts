// sync: record translations edited by hand in the translated documents.

import fs from 'node:fs';
import path from 'node:path';
import type { Log } from './build.ts';
import type { Project } from './project.ts';

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
export async function syncDocs(p: Project, langs: string[], opts: { by?: string; reset?: boolean }, log: Log): Promise<SyncResult[]> {
  const date = new Date().toISOString().slice(0, 10);
  const by = opts.by ? (opts.by.includes(':') ? opts.by : `gh:${opts.by}`) : undefined;
  const out: SyncResult[] = [];
  for (const lang of langs) {
    for (const file of p.sources()) {
      const st = await p.state(lang, file);
      if (!st.tfile || !st.doc) continue;
      const res: SyncResult = { file, lang, recorded: [], changed: false };
      const structure = st.doc.issues.find((i) => i.kind === 'structure');
      if (structure && !opts.reset) {
        res.error = structure.message;
        out.push(res);
        continue;
      }
      const tfile = structuredClone(st.tfile);
      for (const u of tfile.units) {
        if (!st.doc.untracked.has(u.id)) continue;
        u.origin = { by: by ?? 'unknown', date };
        u.reviews = by ? [{ by, date }] : [];
        delete u.terms;
        res.recorded.push(u.id);
      }
      const before = p.storedPaths(lang, file).map((r) => readOr(p, r));
      await p.saveTFile(tfile, st.doc.raw, { reset: opts.reset });
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
