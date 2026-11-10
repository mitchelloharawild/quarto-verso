// Reader contributions: unit operations, and the checks that both the
// PR service (before committing) and CI (`i18n check --pr`) run.

import { isPlainText, parseLangGlossary } from './glossary.ts';
import { syncUnits } from './sync.ts';
import { outsideUnits, parseTrack, readDoc } from './tdoc.ts';
import { knownPart, parseTFile, stringifyTFile, unknownKeys } from './tfile.ts';
import { normaliseBlockText, normaliseCode, validate, type Candidate } from './validate.ts';
import type { MarkdownAdapter, SourceUnit, SyncedUnit, TFile, TUnit } from './types.ts';

export type UnitOp =
  | { op: 'approve'; id: string }
  | { op: 'replace'; id: string; text: string };

export interface OpResult {
  tfile: TFile;
  applied: UnitOp[];
  /** `done`: already in effect (a resubmission), so nothing is lost by dropping it. */
  dropped: { op: UnitOp; reason: string; done?: boolean }[];
}

const clone = <T>(x: T): T => structuredClone(x);

/** Apply one contributor's operations; those on stale or missing units are dropped. */
export function applyOps(tfile: TFile, synced: SyncedUnit[], ops: UnitOp[], author: string, date: string): OpResult {
  const t = clone(tfile);
  const status = new Map(synced.map((s) => [s.id, s.status]));
  const applied: UnitOp[] = [];
  const dropped: OpResult['dropped'] = [];
  const touchedText = new Set<string>();
  for (const op of ops) {
    const u = t.units.find((x) => x.id === op.id);
    if (!u) {
      dropped.push({ op, reason: 'unknown unit' });
      continue;
    }
    const st = status.get(op.id);
    // A stale unit can't be approved (its translation is of older source), but a
    // new translation of the current source can replace it.
    if (st !== 'current' && !(st === 'stale' && op.op === 'replace')) {
      dropped.push({ op, reason: `unit is ${st ?? 'not in the current source'}` });
      continue;
    }
    if (op.op === 'approve') {
      if ((u.reviews ?? []).some((r) => r.by === author)) {
        dropped.push({ op, reason: 'already reviewed by you', done: true });
        continue;
      }
      if (!touchedText.has(u.id)) u.reviews = [...(u.reviews ?? []), { by: author, date }];
      applied.push(op);
      continue;
    }
    if (typeof op.text !== 'string' || op.text.length > 20000) {
      dropped.push({ op, reason: 'invalid text' });
      continue;
    }
    // Code keeps its lines; prose is one line.
    const text = u.kind === 'code' ? normaliseCode(op.text) : normaliseBlockText(op.text);
    if (text === u.text) {
      dropped.push({ op, reason: 'already the translation', done: true });
      continue;
    }
    u.text = text;
    if (st === 'stale') {
      // Re-anchor the unit to the current source.
      const src = synced.find((x) => x.id === op.id)!.src;
      u['source-hash'] = src.hash;
      u.source = src.source;
      delete u.terms;
    }
    u.origin = { by: author, date };
    u.reviews = [{ by: author, date }];
    touchedText.add(u.id);
    applied.push(op);
  }
  return { tfile: t, applied, dropped };
}


export interface CheckResult {
  check: number;
  name: string;
  ok: boolean;
  messages: string[];
  /** Not failures, but things a maintainer must look at before merging or rendering. */
  attention?: string[];
}

export interface ContribContext {
  /** Login of the PR author, as written in reviews (`gh:alice`). */
  author: string;
  /** Head branch name, if known. */
  branch?: string;
  /** Site directory prefix inside the repo ('' or e.g. 'book/'). */
  prefix: string;
  /** Current source units for a source file path (relative to the site), from the base branch. */
  units(sourceFile: string): Promise<SourceUnit[] | null>;
  md: MarkdownAdapter;
  /** Reads an unchanged file (path in the repo) from the base branch. */
  readUnchanged: (path: string) => string | undefined;
}

export const CHECK_NAMES = [
  'only translation files changed',
  'schema, ids, order and source unchanged',
  'changed units are current',
  'changed text resets reviews to the contributor',
  'added reviews are by the contributor, once per person',
  'prose skeleton identical to the source',
  'code cells stay inside the cell and keep their options (changes need maintainer review)',
  'glossary entries are plain text',
];

export async function checkContribution(base: Map<string, string>, head: Map<string, string>, changed: string[], ctx: ContribContext): Promise<CheckResult[]> {
  const res: CheckResult[] = CHECK_NAMES.map((name, i) => ({ check: i + 1, name, ok: true, messages: [] }));
  const fail = (n: number, m: string) => {
    res[n - 1].ok = false;
    res[n - 1].messages.push(m);
  };
  const esc = ctx.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  ({ base, head, changed } = await expandDocs(base, head, changed, ctx, esc, fail));
  const allowed = new RegExp(`^${esc}_i18n/([A-Za-z]{2,3}(?:-[A-Za-z0-9]+)*)/(?!_freeze/|build/)[^\\0]+\\.yml$`);

  // 1. Paths and branch.
  if (ctx.branch !== undefined && !ctx.branch.startsWith('i18n/')) fail(1, `branch ${ctx.branch} is not under i18n/`);
  const files: { path: string; lang: string }[] = [];
  for (const p of changed) {
    const m = allowed.exec(p);
    if (!m || p.includes('..') || p.split('/').includes('build')) fail(1, `${p} is not a translation file`);
    else files.push({ path: p, lang: m[1] });
  }

  const cands: Candidate[] = [];
  const reanchored = new Map<string, string[]>();
  for (const f of files) {
    const rel = f.path.slice(ctx.prefix.length + `_i18n/${f.lang}/`.length);
    const headText = head.get(f.path);
    const baseText = base.get(f.path);
    if (headText === undefined) {
      fail(1, `${f.path} was deleted`);
      continue;
    }
    if (rel === '_glossary.yml') {
      checkGlossary(baseText, headText, ctx, fail, f.path);
      continue;
    }
    if (baseText === undefined) {
      fail(2, `${f.path} is a new file; translation files are created by \`i18n translate\``);
      continue;
    }
    let a: TFile;
    let b: TFile;
    try {
      a = parseTFile(baseText);
      b = parseTFile(headText);
    } catch (e) {
      fail(2, `${f.path}: ${(e as Error).message}`);
      continue;
    }
    // 2. Schema, ids, order, source.
    if (a.source !== b.source || a.lang !== b.lang) fail(2, `${f.path}: source or lang changed`);
    if (a.units.length !== b.units.length || a.units.some((u, i) => u.id !== b.units[i].id)) {
      fail(2, `${f.path}: unit ids or order changed`);
      continue;
    }
    const changedUnits: { a: TUnit; b: TUnit }[] = [];
    for (let i = 0; i < a.units.length; i++) {
      const ua = a.units[i];
      const ub = b.units[i];
      // Source fields may only change by re-anchoring a stale unit to the current source (checked below).
      const moved: string[] = [];
      for (const k of ['kind', 'section', 'cell', 'field', 'source-hash', 'source'] as const) {
        if (ua[k] === ub[k]) continue;
        if (k === 'source-hash' || k === 'source') moved.push(k);
        else fail(2, `${f.path} ${ua.id}: ${k} changed`);
      }
      if (moved.length) reanchored.set(ua.id + '\0' + f.path, moved);
      // Unknown keys already on the default branch are not the contributor's doing;
      // only adding or changing one fails. Removing one is a harmless cleanup.
      const extra = unknownKeys(ub).filter((k) => JSON.stringify((ua as any)[k]) !== JSON.stringify((ub as any)[k]));
      if (extra.length) fail(2, `${f.path} ${ua.id}: unknown keys added or changed: ${extra.join(', ')}`);
      if (JSON.stringify(knownPart(ua)) !== JSON.stringify(knownPart(ub))) changedUnits.push({ a: ua, b: ub });
    }
    if (!changedUnits.length) continue;

    // 3. Changed units are current.
    const srcFile = b.source;
    const units = rel === '_project.yml' ? await ctx.units('_quarto.yml') : await ctx.units(srcFile);
    if (!units) {
      fail(3, `${f.path}: source ${srcFile} not found`);
      continue;
    }
    const synced = syncUnits(srcFile, units, a);
    const byId = new Map(synced.map((s) => [s.id, s]));
    for (const { a: ua, b: ub } of changedUnits) {
      const s = byId.get(ua.id);
      const textChanged = ua.text !== ub.text;
      const moved = reanchored.get(ua.id + '\0' + f.path);
      const stale = !!s && s.status !== 'missing' && s.src.hash !== ua['source-hash'];
      if (!s || s.status === 'missing' || (stale && !(textChanged && s.src.hash === ub['source-hash'] && s.src.source === ub.source))) {
        fail(3, `${f.path} ${ua.id}: unit is stale or not in the current source`);
        continue;
      }
      if (moved && !stale) fail(2, `${f.path} ${ua.id}: ${moved.join(', ')} changed`);
      const ra = (ua.reviews ?? []).map((r) => r.by);
      const rb = (ub.reviews ?? []).map((r) => r.by);
      if (new Set(rb).size !== rb.length) fail(5, `${f.path} ${ua.id}: a person reviewed twice`);
      if (textChanged) {
        // 4. Changed text resets reviews.
        if (rb.length !== 1 || rb[0] !== ctx.author) fail(4, `${f.path} ${ua.id}: text changed, so reviews must be exactly [${ctx.author}] (found [${rb.join(', ')}])`);
        if (ub.origin?.by !== ctx.author) fail(4, `${f.path} ${ua.id}: origin must be ${ctx.author}`);
        cands.push({ id: `${f.path}#${ua.id}`, src: s.src, text: ub.text });
        if (ua.kind === 'code') {
          // Without a parser nothing proves the code still does the same thing:
          // rendering this PR runs the contributor's code.
          (res[6].attention ??= []).push(`${f.path} ${ua.id} (cell ${ua.cell}): code changed; read the diff before merging or rendering`);
        }
      } else {
        // 5. Only additions by the contributor.
        const removed = ra.filter((r) => !rb.includes(r));
        const added = rb.filter((r) => !ra.includes(r));
        if (removed.length) fail(5, `${f.path} ${ua.id}: reviews removed (${removed.join(', ')})`);
        if (added.some((r) => r !== ctx.author)) fail(5, `${f.path} ${ua.id}: review added for someone else (${added.join(', ')})`);
        if (JSON.stringify(ua.origin) !== JSON.stringify(ub.origin) || JSON.stringify(ua.terms) !== JSON.stringify(ub.terms)) fail(5, `${f.path} ${ua.id}: origin changed without a text change`);
      }
    }
  }

  // 6–7. Same validation as materialise.
  if (cands.length) {
    const rejected = await validate(cands, ctx.md);
    for (const c of cands) {
      const r = rejected.get(c.id);
      if (r) fail(c.src.kind === 'code' ? 7 : 6, `${c.id}: ${r}`);
    }
  }
  return res;
}

/** Turn changed documents and tracking files into translation files, with document-only checks. */
async function expandDocs(base: Map<string, string>, head: Map<string, string>, changed: string[], ctx: ContribContext, esc: string, fail: (n: number, m: string) => void) {
  const doc = new RegExp(`^${esc}_i18n/[A-Za-z]{2,3}(?:-[A-Za-z0-9]+)*/(?!_freeze/|build/)[^\\0]+\\.(?:qmd|md)$`);
  const groups = new Set<string>();
  const rest: string[] = [];
  for (const p of changed) {
    if (doc.test(p)) groups.add(p + '.yml');
    else if (/\.(?:qmd|md)\.yml$/.test(p) && doc.test(p.slice(0, -4))) groups.add(p);
    else rest.push(p);
  }
  if (!groups.size) return { base, head, changed };
  const b2 = new Map(base);
  const h2 = new Map(head);
  const side = (m: Map<string, string>, p: string) => (m.has(p) ? m.get(p) : changed.includes(p) ? undefined : ctx.readUnchanged(p));
  for (const track of groups) {
    const docPath = track.slice(0, -4);
    for (const p of [docPath, track]) {
      b2.delete(p);
      h2.delete(p);
    }
    const [bd, bt, hd, ht] = [side(base, docPath), side(base, track), side(head, docPath), side(head, track)];
    if (hd === undefined || ht === undefined) {
      fail(1, `${hd === undefined ? docPath : track} was deleted`);
      continue;
    }
    if (bd === undefined || bt === undefined) {
      fail(2, `${track}: a new translation; translated documents are created by \`i18n translate\``);
      continue;
    }
    let a, b;
    try {
      [a, b] = await Promise.all([readDoc(bd, parseTrack(bt), ctx.md), readDoc(hd, parseTrack(ht), ctx.md)]);
    } catch (e) {
      fail(2, `${track}: ${(e as Error).message}`);
      continue;
    }
    for (const i of b.issues) {
      if (i.kind === 'structure' && !a.issues.some((x) => x.kind === 'structure')) fail(2, `${docPath}: ${i.message}`);
      if (i.kind === 'untracked' && !a.untracked.has(i.id!)) fail(4, `${docPath} ${i.id}: text changed but the tracking file was not updated; run \`i18n sync --by ${ctx.author}\` and commit both files`);
    }
    if (a.docUnits && b.docUnits) {
      const oa = outsideUnits(bd, a.docUnits).split('\n');
      const ob = outsideUnits(hd, b.docUnits).split('\n');
      const k = oa.findIndex((l, i) => l !== ob[i]);
      if (k !== -1 || oa.length !== ob.length) {
        const line = (ob[k === -1 ? oa.length : k] ?? oa[k] ?? '').replace(/\u0000\d+\u0000/g, '…').trim().slice(0, 80);
        fail(2, `${docPath}: changes outside translatable text (structure, cell options, attributes or markup)${line ? ` at "${line}"` : ''}; only the text of headings, paragraphs, captions and code cells may change`);
      }
    }
    // An unrecorded edit is reported above; the generic check 4 would repeat it.
    const head2 = { ...b.tfile, units: b.tfile.units.map((u) => (b.untracked.has(u.id) && !a.untracked.has(u.id) ? { ...u, origin: { by: ctx.author, date: '' }, reviews: [{ by: ctx.author, date: '' }] } : u)) };
    b2.set(track, stringifyTFile(a.tfile));
    h2.set(track, stringifyTFile(head2));
    rest.push(track);
  }
  return { base: b2, head: h2, changed: rest };
}

function checkGlossary(baseText: string | undefined, headText: string, ctx: ContribContext, fail: (n: number, m: string) => void, path: string): void {
  if (baseText === undefined) {
    fail(2, `${path} is a new file`);
    return;
  }
  let a, b;
  try {
    a = parseLangGlossary(baseText);
    b = parseLangGlossary(headText);
  } catch (e) {
    fail(2, `${path}: ${(e as Error).message}`);
    return;
  }
  if (Object.keys(a).join() !== Object.keys(b).join()) fail(2, `${path}: glossary keys changed`);
  for (const [k, eb] of Object.entries(b)) {
    const ea = a[k];
    if (!ea) continue;
    if (ea['source-hash'] !== eb['source-hash']) fail(2, `${path} ${k}: source-hash changed`);
    for (const s of [eb.term, ...(eb.variants ?? []), eb.note ?? '']) if (s && !isPlainText(s)) fail(8, `${path} ${k}: "${s}" is not plain text`);
    const changed = ea.term !== eb.term || JSON.stringify(ea.variants) !== JSON.stringify(eb.variants) || ea.note !== eb.note;
    const ra = (ea.reviews ?? []).map((r) => r.by);
    const rb = (eb.reviews ?? []).map((r) => r.by);
    if (changed && (rb.length !== 1 || rb[0] !== ctx.author)) fail(4, `${path} ${k}: term changed, so reviews must be exactly [${ctx.author}]`);
    if (!changed) {
      if (ra.some((r) => !rb.includes(r))) fail(5, `${path} ${k}: reviews removed`);
      if (rb.filter((r) => !ra.includes(r)).some((r) => r !== ctx.author)) fail(5, `${path} ${k}: review added for someone else`);
    }
    if (new Set(rb).size !== rb.length) fail(5, `${path} ${k}: a person reviewed twice`);
  }
}
