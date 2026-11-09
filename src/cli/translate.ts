// translate: write a work file for the translator; `--apply` validates and stores it.

import fs from 'node:fs';
import path from 'node:path';
import { entryHash, hits, isPlainText, targetHash } from '../core/glossary.ts';
import { protect, unprotect } from '../core/protect.ts';
import { languageName } from '../core/strings.ts';
import { toTFile, translatedUnit } from '../core/sync.ts';
import { normaliseCode, validate, type Candidate } from '../core/validate.ts';
import type { LangGlossaryEntry, SyncedUnit } from '../core/types.ts';
import type { Log } from './build.ts';
import { CONFIG_KEY, PROJECT_FILE, type FileState, type Project } from './project.ts';

export const WORK_VERSION = 1;

export interface WorkItem {
  key: string;
  kind: 'glossary' | 'block' | 'caption' | 'meta' | 'code';
  file?: string;
  id?: string;
  hash?: string;
  /** Source text with protected tokens replaced by ⟦n⟧; for code, the cell body as is. */
  source?: string;
  tokens?: string[];
  heading?: boolean;
  field?: string;
  cell?: string;
  context?: { section?: string; before?: string; after?: string };
  previous?: { source?: string; text?: string };
  terms?: string[];
  /** Code items: the cell's language. */
  lang?: string;
  // glossary items
  term?: string;
  variants?: string[] | null;
  definition?: string;
  note?: string | null;
  /** Filled in by the translator. */
  text: string | null;
}

export interface WorkFile {
  version: number;
  tool: 'quarto-i18n';
  lang: string;
  'source-lang': string;
  'language-names': { source: string; target: string };
  instructions?: string;
  rules: string[];
  /** Who translated: set by the translator, e.g. "claude-code/claude-opus-5-5". */
  model: string | null;
  glossary: { key: string; term: string; variants?: string[]; definition?: string; keep?: boolean; target?: string; 'target-variants'?: string[] }[];
  items: WorkItem[];
}

const RULES = [
  'Translate each item\'s `source` into the target language and write it to `text`. Leave `text` null to skip an item.',
  'Keep every placeholder ⟦n⟧ exactly once, unchanged; they stand for code, math, links targets, citations, shortcodes and markup. Move them where the target grammar needs them.',
  'Keep Markdown emphasis and link brackets ([text]⟦n⟧) balanced. Translate the link text, never the target.',
  'Write each block as one line. Do not add headings, list markers, line breaks or new markup.',
  'Code items: `source` is a whole code cell (without its #| option lines). Return the whole cell in `text`, with comments and user-facing text (plot titles, axis labels, messages) translated. Keep every line of code that does not hold such text exactly as it is: identifiers, data values, column names, keys, file paths, URLs, format strings and interpolation ({x}, %s, $(y)) never change. Keep the line structure; do not add #| lines or code fences.',
  'Use the glossary: translate terms with their `target` form (or keep them when `keep` is true). Glossary items come first; translate them before the units that use them.',
  'For items with `previous`, the source changed: reuse the previous translation where the meaning is unchanged.',
  'Set `model` at the top of the file to who translated (e.g. "claude-code/<model id>").',
];

function oneLine(s: string | undefined, n = 300): string | undefined {
  if (!s) return undefined;
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

export function workPath(p: Project, lang: string): string {
  return path.join(p.i18nDir, '_work', `${lang}.json`);
}

export async function exportWork(p: Project, lang: string, mode: 'missing' | 'stale'): Promise<{ path: string; count: number }> {
  const glossary = p.glossary();
  const lg = p.langGlossary(lang);
  const items: WorkItem[] = [];
  for (const e of glossary) {
    if (e.keep) continue;
    const cur = lg[e.key];
    if (cur && cur['source-hash'] === entryHash(e)) continue;
    items.push({ key: `glossary:${e.key}`, kind: 'glossary', term: e.term, variants: null, definition: e.definition, note: null, text: null, ...(cur ? { previous: { source: undefined, text: cur.term } } : {}) });
  }
  for (const file of p.allFiles()) {
    const st = await p.state(lang, file);
    st.synced.forEach((u, i) => {
      if (u.status === 'current') return;
      if (u.status === 'stale' && mode === 'missing') return;
      items.push(workItem(p, st, u, i));
    });
  }
  const wf: WorkFile = {
    version: WORK_VERSION, tool: 'quarto-i18n', lang, 'source-lang': p.tc.source,
    'language-names': { source: languageName(p.tc.source, 'en'), target: languageName(lang, 'en') },
    instructions: p.tc.instructions, rules: RULES, model: null,
    glossary: glossary.map((e) => ({ key: e.key, term: e.term, variants: e.variants?.length ? e.variants : undefined, definition: e.definition, keep: e.keep || undefined, target: lg[e.key]?.term, 'target-variants': lg[e.key]?.variants })),
    items,
  };
  const out = workPath(p, lang);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(wf, null, 2) + '\n');
  return { path: out, count: items.length };
}

function workItem(p: Project, st: FileState, u: SyncedUnit, i: number): WorkItem {
  const s = u.src;
  const glossary = p.glossary();
  const base: WorkItem = { key: `${st.file}#${u.id}`, kind: s.kind, file: st.file, id: u.id, hash: s.hash, text: null };
  const terms = hits(glossary, s.source).map((e) => e.key);
  if (terms.length) base.terms = terms;
  if (s.kind === 'code') {
    const item: WorkItem = { ...base, cell: s.cell, lang: s.lang, source: s.source };
    if (u.status === 'stale' && u.stored?.text) item.previous = { source: u.stored.source, text: u.stored.text };
    return item;
  }
  const { masked, tokens } = protect(s.source);
  const neighbour = (k: number) => {
    const n = st.synced[k]?.src;
    return n && n.kind === 'block' ? oneLine(n.source) : undefined;
  };
  const item: WorkItem = {
    ...base, source: masked, tokens: tokens.length ? tokens : undefined,
    heading: s.heading ? true : undefined, field: s.field, cell: s.cell,
    context: s.kind === 'block' ? { section: s.section, before: neighbour(i - 1), after: neighbour(i + 1) } : undefined,
  };
  if (u.status === 'stale' && u.stored?.text) item.previous = { source: u.stored.source, text: u.stored.text };
  return item;
}

export interface ApplyResult {
  applied: number;
  glossary: number;
  skipped: { key: string; reason: string }[];
  rejected: { key: string; reason: string }[];
}

/**
 * Answers: a compact alternative to editing the work file.
 *   { "model": "...", "answers": { "<key>": "text" | {"text": "...", "variants": [...], "note": "..."} } }
 * Code items take the whole translated cell as a string.
 */
export function mergeAnswers(wf: WorkFile, answersFile: string): number {
  const a = JSON.parse(fs.readFileSync(answersFile, 'utf8'));
  if (a.model) wf.model = a.model;
  let n = 0;
  for (const [key, v] of Object.entries<any>(a.answers ?? {})) {
    const it = wf.items.find((x) => x.key === key);
    if (!it) throw new Error(`${answersFile}: unknown key ${key}`);
    if (it.kind === 'glossary' && v && typeof v === 'object') {
      it.text = String(v.text);
      it.variants = Array.isArray(v.variants) ? v.variants.map(String) : null;
      it.note = typeof v.note === 'string' ? v.note : null;
    } else {
      it.text = String(v);
    }
    n++;
  }
  return n;
}

export async function applyWork(p: Project, file: string, log: Log, answersFile?: string): Promise<ApplyResult> {
  const wf = JSON.parse(fs.readFileSync(file, 'utf8')) as WorkFile;
  if (wf.tool !== 'quarto-i18n' || wf.version !== WORK_VERSION) throw new Error(`${file} is not a quarto-i18n work file (version ${WORK_VERSION})`);
  if (answersFile) log(`merged ${mergeAnswers(wf, answersFile)} answers from ${path.basename(answersFile)}`);
  const lang = wf.lang;
  if (!p.tc.targets.map(String).includes(lang)) throw new Error(`${lang} is not in ${CONFIG_KEY}.targets`);
  const date = new Date().toISOString().slice(0, 10);
  const origin = { by: 'llm', model: wf.model ?? 'unknown', date };
  const res: ApplyResult = { applied: 0, glossary: 0, skipped: [], rejected: [] };

  // Glossary first, so units record the terms they were translated with.
  const glossary = p.glossary();
  const lg = p.langGlossary(lang);
  for (const it of wf.items.filter((x) => x.kind === 'glossary')) {
    if (it.text === null || it.text === undefined) continue;
    const key = it.key.replace(/^glossary:/, '');
    const e = glossary.find((g) => g.key === key);
    if (!e) {
      res.skipped.push({ key: it.key, reason: 'not in the source glossary' });
      continue;
    }
    const forms = [it.text, ...(it.variants ?? []), it.note ?? ''];
    if (forms.some((f) => f && !isPlainText(f))) {
      res.rejected.push({ key: it.key, reason: 'glossary entries must be plain text' });
      continue;
    }
    const entry: LangGlossaryEntry = { 'source-hash': entryHash(e), term: it.text.trim() };
    if (it.variants?.length) entry.variants = it.variants.map((v) => v.trim());
    if (it.note) entry.note = it.note.trim();
    entry.origin = origin;
    entry.reviews = [];
    lg[key] = entry;
    res.glossary++;
  }
  if (res.glossary) p.writeLangGlossary(lang, lg);

  // Units, grouped by file.
  const unitItems = wf.items.filter((x) => x.kind !== 'glossary' && x.text !== null && x.text !== undefined);
  const byFile = new Map<string, WorkItem[]>();
  for (const it of unitItems) byFile.set(it.file!, [...(byFile.get(it.file!) ?? []), it]);
  for (const [f, list] of byFile) {
    if (f !== PROJECT_FILE && !p.sources().includes(f)) {
      for (const it of list) res.skipped.push({ key: it.key, reason: 'source file no longer exists' });
      continue;
    }
    const st = await p.state(lang, f);
    const cands: (Candidate & { item: WorkItem; u: SyncedUnit })[] = [];
    for (const it of list) {
      const u = st.synced.find((x) => x.id === it.id);
      if (!u || u.src.hash !== it.hash) {
        res.skipped.push({ key: it.key, reason: 'source changed since export; export again' });
        continue;
      }
      if (u.src.kind === 'code') {
        cands.push({ id: u.id, src: u.src, text: it.text!, item: it, u });
      } else {
        const r = unprotect(it.text!, it.tokens ?? []);
        if (!r.ok) {
          res.rejected.push({ key: it.key, reason: r.error });
          continue;
        }
        cands.push({ id: u.id, src: u.src, text: r.text, item: it, u });
      }
    }
    const rejected = await validate(cands, p.md);
    const tfile = toTFile(f, lang, st.synced);
    for (const c of cands) {
      const r = rejected.get(c.id);
      if (r) {
        res.rejected.push({ key: c.item.key, reason: r });
        continue;
      }
      const used = hits(glossary, c.src.source);
      const terms = Object.fromEntries(used.filter((e) => lg[e.key]).map((e) => [e.key, targetHash(lg[e.key])]));
      const k = tfile.units.findIndex((x) => x.id === c.id);
      tfile.units[k] = translatedUnit(c.u, c.src.kind === 'code' ? normaliseCode(c.text!) : c.text!, origin, terms);
      res.applied++;
    }
    await p.saveTFile(tfile, st.doc?.raw);
  }
  log(`${lang}: applied ${res.applied} units and ${res.glossary} glossary entries; ${res.rejected.length} rejected; ${res.skipped.length} skipped`);
  return res;
}
