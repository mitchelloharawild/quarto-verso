// materialise(source, translations, lang) → translated .qmd, spliced at unit ranges.

import { Document, parseDocument } from 'yaml';
import { displayStatus, reviewCount } from './sync.ts';
import { normaliseBlockText, normaliseCode } from './validate.ts';
import type { DisplayStatus, Review, SyncedUnit } from './types.ts';

export interface PageUnit {
  id: string;
  kind: string;
  status: DisplayStatus;
  reviews: Review[];
  count: number;
  /** Source text (Markdown, plain text, or the source cell body). */
  source: string;
  /** Translation shown, or undefined when the source is shown. */
  text?: string;
  /** Previous translation, for stale units. */
  previous?: string;
  previousSource?: string;
  section?: string;
  cell?: string;
  field?: string;
  heading?: number;
  hash: string;
  lang?: string;
  reason?: string;
  /** Who wrote the translation shown (`llm`, `gh:<login>`, `unknown`). */
  by?: string;
  weight: number;
}

export interface MaterialiseOptions {
  lang: string;
  sourceLang: string;
  onStale: 'source' | 'previous';
  /** Unit id → reason: translations that failed validation (shown as source). */
  rejected?: Map<string, string>;
  /** Code units reverted after an execution failure. */
  reverted?: Set<string>;
  /** Extra front matter (e.g. the `i18n` block read by the Lua filter). */
  meta?: Record<string, unknown>;
}

export interface Materialised {
  text: string;
  units: PageUnit[];
}

function attrValue(s: string): string {
  return s.replace(/"/g, '&quot;');
}

export function materialise(text: string, synced: SyncedUnit[], o: MaterialiseOptions): Materialised {
  const edits: { start: number; end: number; text: string }[] = [];
  const metaSet: { path: (string | number)[]; value: string }[] = [];
  const page: PageUnit[] = [];

  for (const u of synced) {
    const s = u.src;
    const reason = o.rejected?.get(u.id) ?? (o.reverted?.has(u.id) ? 'reverted after an execution failure' : undefined);
    let status = displayStatus(u);
    const usable = u.status === 'current' && !reason;
    if (u.status === 'current' && reason) status = 'missing';
    const st = u.stored;
    const previous = u.status === 'stale' && o.onStale === 'previous' && !reason ? st?.text : undefined;
    const pu: PageUnit = {
      id: u.id, kind: s.kind, status, reviews: usable ? (st?.reviews ?? []) : [], count: usable ? reviewCount(u) : 0,
      source: s.source, section: s.section, cell: s.cell, field: s.field, heading: s.heading, lang: s.lang, hash: s.hash, reason,
      by: usable ? st?.origin?.by : undefined, weight: s.source.length,
    };
    if (u.status === 'stale' && st) {
      pu.previous = st.text;
      pu.previousSource = st.source;
    }

    if (s.kind === 'block') {
      const shown = usable ? normaliseBlockText(st!.text!) : previous !== undefined ? normaliseBlockText(previous) : s.source;
      if (usable) pu.text = shown;
      const fallback = !usable && previous === undefined;
      const attrs = [`data-tr-id="${u.id}"`, `data-tr-status="${status}"`, `data-tr-reviews="${pu.count}"`];
      if (fallback) attrs.push(`lang="${attrValue(o.sourceLang)}"`);
      if (s.heading) {
        // Headings carry the attributes in their own {…} block: Quarto reuses raw
        // heading text for book navigation, so no wrapper span there.
        const nl = text.indexOf('\n', s.range!.end);
        const lineEnd = nl === -1 ? text.length : nl;
        const rest = text.slice(s.range!.end, lineEnd);
        const m = /^(\s*)\{([^}]*)\}\s*$/.exec(rest);
        const inner = [m ? m[2].trim() : '', s.autoId ? `#${s.autoId}` : '', ...attrs].filter(Boolean).join(' ');
        edits.push({ start: s.range!.start, end: lineEnd, text: `${shown} {${inner}}` });
      } else {
        edits.push({ start: s.range!.start, end: s.range!.end, text: `[${shown}]{.tr ${attrs.join(' ')}}` });
      }
    } else if (s.kind === 'caption') {
      if (usable) {
        pu.text = normaliseBlockText(st!.text!);
        const line = text.slice(s.range!.start, s.range!.end);
        const prefix = /^#\|\s*/.exec(line)![0];
        edits.push({ start: s.range!.start, end: s.range!.end, text: `${prefix}${s.field}: ${JSON.stringify(pu.text)}` });
      }
    } else if (s.kind === 'meta') {
      if (usable) {
        pu.text = normaliseBlockText(st!.text!);
        metaSet.push({ path: s.field!.split('.').map((k) => (/^\d+$/.test(k) ? Number(k) : k)), value: pu.text });
      }
    } else if (s.kind === 'code') {
      // The whole cell body is replaced; option lines stay as in the source.
      // A stale cell always runs the source code (a previous translation was
      // written for different code).
      if (usable) {
        pu.text = normaliseCode(st!.text!);
        edits.push({ start: s.range!.start, end: s.range!.end, text: pu.text });
      }
    }
    page.push(pu);
  }

  let out = applyEdits(text, edits);
  out = setFrontMatter(out, metaSet, o.meta);
  return { text: out, units: page };
}

export function applyEdits(text: string, edits: { start: number; end: number; text: string }[]): string {
  let out = text;
  for (const e of [...edits].sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}

const FM = /^---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/;

export function setFrontMatter(text: string, set: { path: (string | number)[]; value: string }[], extra?: Record<string, unknown>): string {
  if (!set.length && !extra) return text;
  const m = FM.exec(text);
  const doc = m ? parseDocument(m[1]) : new Document({});
  for (const s of set) doc.setIn(s.path, s.value);
  for (const [k, v] of Object.entries(extra ?? {})) doc.set(k, v);
  const yaml = doc.toString({ lineWidth: 0 }).trimEnd();
  const block = `---\n${yaml}\n---\n`;
  return m ? block + text.slice(m[0].length) : block + '\n' + text;
}
