// Unit extraction: walk the Pandoc AST (with source positions) of one
// source file and produce units in document order.

import { parse as parseYaml } from 'yaml';
import { codeHash, textHash } from './hash.ts';
import { hasTranslatableText } from './protect.ts';
import type { MarkdownAdapter, SourceUnit } from './types.ts';

export interface Issue {
  level: 'error' | 'warning';
  line?: number;
  message: string;
}

export interface Extracted {
  units: SourceUnit[];
  issues: Issue[];
}

const META_FIELDS = ['title', 'subtitle', 'description', 'abstract'];
const CAPTION_OPTIONS = ['fig-cap', 'tbl-cap', 'fig-alt', 'lst-cap'];

/** Line/column (1-based, columns in code points) to UTF-16 offsets. */
export class Positions {
  readonly text: string;
  private starts: number[] = [0];
  constructor(text: string) {
    this.text = text;
    for (let i = 0; i < text.length; i++) if (text[i] === '\n') this.starts.push(i + 1);
  }
  lineStart(line: number): number {
    return this.starts[Math.min(line - 1, this.starts.length - 1)] ?? this.text.length;
  }
  line(line: number): string {
    const s = this.lineStart(line);
    const e = line < this.starts.length ? this.starts[line] - 1 : this.text.length;
    return this.text.slice(s, e);
  }
  offset(line: number, col: number): number {
    if (line > this.starts.length) return this.text.length;
    const s = this.lineStart(line);
    let off = s;
    for (let c = 1; c < col; c++) {
      const cp = this.text.codePointAt(off);
      if (cp === undefined || this.text[off] === '\n') break;
      off += cp > 0xffff ? 2 : 1;
    }
    return off;
  }
  lineOf(offset: number): number {
    let lo = 0;
    let hi = this.starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  }
}

type Pos = { l1: number; c1: number; l2: number; c2: number };

function parseDataPos(v: string): Pos[] {
  const spec = v.slice(v.lastIndexOf('@') + 1);
  return spec.split(';').flatMap((r) => {
    const m = /^(\d+):(\d+)-(\d+):(\d+)$/.exec(r);
    return m ? [{ l1: +m[1], c1: +m[2], l2: +m[3], c2: +m[4] }] : [];
  });
}

function kv(attr: any, key: string): string | undefined {
  const kvs: [string, string][] = attr?.[2] ?? [];
  return kvs.find(([k]) => k === key)?.[1];
}

/** Collect data-pos ranges in an inline subtree, not descending into notes. */
function collectPos(x: any, out: Pos[]): void {
  if (Array.isArray(x)) {
    if (x.length === 2 && x[0] === 'data-pos' && typeof x[1] === 'string') {
      out.push(...parseDataPos(x[1]));
      return;
    }
    for (const y of x) collectPos(y, out);
  } else if (x && typeof x === 'object') {
    if (x.t === 'Note') return;
    collectPos(x.c, out);
  }
}

function findNotes(x: any, out: any[][]): void {
  if (Array.isArray(x)) for (const y of x) findNotes(y, out);
  else if (x && typeof x === 'object') {
    if (x.t === 'Note') out.push(x.c);
    else findNotes(x.c, out);
  }
}

function frontMatter(text: string): { yaml: string; data: any } | null {
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/.exec(text);
  if (!m) return null;
  try {
    return { yaml: m[1], data: parseYaml(m[1]) ?? {} };
  } catch {
    return null;
  }
}

export async function extractUnits(text: string, md: MarkdownAdapter): Promise<Extracted> {
  const pos = new Positions(text);
  const units: SourceUnit[] = [];
  const issues: Issue[] = [];

  // Front matter fields.
  const fm = frontMatter(text);
  if (fm && fm.data && typeof fm.data === 'object') {
    if (fm.data['verso-translate'] === false) return { units: [], issues };
    for (const f of META_FIELDS) {
      const v = fm.data[f];
      if (typeof v === 'string' && hasTranslatableText(v)) {
        units.push({ kind: 'meta', field: f, source: v, hash: textHash(v), range: { start: -1000 + units.length, end: -1000 + units.length } });
      }
    }
  }

  const ast = await md.parseWithPositions(text);
  let section: string | undefined;

  const leaf = (inlines: any[], heading?: number, autoId?: string): void => {
    const ps: Pos[] = [];
    collectPos(inlines, ps);
    if (!ps.length) return;
    let start = Infinity;
    let end = -Infinity;
    for (const p of ps) {
      start = Math.min(start, pos.offset(p.l1, p.c1));
      end = Math.max(end, pos.offset(p.l2, p.c2));
    }
    const src = text.slice(start, end).replace(/\s+$/, '');
    end = start + src.length;
    if (hasTranslatableText(src)) {
      units.push({ kind: 'block', source: src, hash: textHash(src), range: { start, end }, section, heading, ...(autoId ? { autoId } : {}) });
    }
    const notes: any[][] = [];
    findNotes(inlines, notes);
    for (const n of notes) {
      const np: Pos[] = [];
      collectPos(n, np);
      // Inline notes (^[...]) lie inside the parent's range and are translated with it.
      const inside = np.some((p) => {
        const o = pos.offset(p.l1, p.c1);
        return o >= start && o < end;
      });
      if (!inside) walk(n, false);
    }
  };

  const walk = (blocks: any[], inCallout: boolean): void => {
    for (const b of blocks ?? []) {
      switch (b.t) {
        case 'Div': {
          const attr = b.c[0];
          if (kv(attr, 'verso-translate') === 'false') break;
          const callout = (attr[1] as string[]).some((c) => c.startsWith('callout'));
          walk(b.c[1], inCallout || callout);
          break;
        }
        case 'Para':
        case 'Plain':
          leaf(b.c);
          break;
        case 'Header': {
          const [level, attr, inl] = b.c;
          if (kv(attr, 'verso-translate') === 'false') break;
          const p = kv(attr, 'data-pos');
          const line = p ? parseDataPos(p)[0]?.l1 : undefined;
          const explicit = line !== undefined && /\{[^}]*#[\w:.-]+[^}]*\}\s*$/.test(pos.line(line));
          if (!inCallout) {
            if (explicit) section = attr[0];
            else issues.push({ level: 'error', line, message: `heading without an explicit id: add {#sec-…}` });
          }
          leaf(inl, level, !inCallout && !explicit && attr[0] ? attr[0] : undefined);
          break;
        }
        case 'BulletList':
          for (const item of b.c) walk(item, inCallout);
          break;
        case 'OrderedList':
          for (const item of b.c[1]) walk(item, inCallout);
          break;
        case 'BlockQuote':
          walk(b.c, inCallout);
          break;
        case 'DefinitionList':
          for (const [term, defs] of b.c) {
            leaf(term);
            for (const d of defs) walk(d, inCallout);
          }
          break;
        case 'CodeBlock':
          codeBlock(b);
          break;
        case 'Table': {
          const p = kv(b.c[0], 'data-pos');
          issues.push({ level: 'warning', line: p ? parseDataPos(p)[0]?.l1 : undefined, message: 'tables are not translated yet' });
          break;
        }
        default:
          break;
      }
    }
  };

  const codeBlock = (b: any): void => {
    const [attr, body] = b.c;
    const cls: string = attr[1][0] ?? '';
    const m = /^\{([A-Za-z0-9_]+)/.exec(cls);
    if (!m) return; // a plain listing, not an executable cell
    const lang = m[1].toLowerCase();
    const p = kv(attr, 'data-pos');
    const ps = p ? parseDataPos(p) : [];
    if (!ps.length) return;
    const fenceLine = ps[0].l1;
    if (!/^(`{3,}|~{3,})/.test(pos.line(fenceLine))) {
      issues.push({ level: 'warning', line: fenceLine, message: 'indented code cells are not translated' });
      return;
    }
    const codeOffset = pos.lineStart(fenceLine + 1);
    if (text.slice(codeOffset, codeOffset + body.length) !== body) {
      issues.push({ level: 'warning', line: fenceLine, message: 'could not locate cell code in the source' });
      return;
    }
    // Cell options.
    const opts: Record<string, { value: any; start: number; end: number }> = {};
    let off = 0;
    for (const ln of body.split('\n')) {
      const om = /^#\|\s*([\w.-]+)\s*:\s*(.*)$/.exec(ln);
      if (!/^#\|/.test(ln)) break;
      if (om) {
        let value: any = om[2];
        try {
          value = parseYaml(om[2]);
        } catch { /* keep raw */ }
        opts[om[1]] = { value, start: codeOffset + off, end: codeOffset + off + ln.length };
      }
      off += ln.length + 1;
    }
    const label = typeof opts.label?.value === 'string' ? opts.label.value : undefined;
    if (!label) {
      issues.push({ level: 'error', line: fenceLine, message: 'executable cell without a label: add #| label: …' });
      return;
    }
    const tr = opts['verso-translate']?.value;
    if (tr === false) return;
    for (const name of CAPTION_OPTIONS) {
      const o = opts[name];
      const raw = o ? text.slice(o.start, o.end) : '';
      if (o && typeof o.value === 'string' && !/:\s*[|>]/.test(raw) && hasTranslatableText(o.value)) {
        units.push({ kind: 'caption', cell: label, field: name, source: o.value, hash: textHash(o.value), range: { start: o.start, end: o.end }, section });
      }
    }
    // The code unit is the cell body after its option lines: the whole text is
    // translated as one unit, for any language. Options stay as in the source.
    const bodyStart = codeOffset + off;
    const code = text.slice(bodyStart, codeOffset + body.length);
    if (hasTranslatableText(code)) {
      units.push({ kind: 'code', cell: label, lang, source: code, hash: codeHash(code), range: { start: bodyStart, end: bodyStart + code.length }, section });
    }
  };

  walk(ast.blocks, false);

  units.sort((a, b) => a.range!.start - b.range!.start);
  // Never splice overlapping ranges.
  const out: SourceUnit[] = [];
  let lastEnd = -Infinity;
  for (const u of units) {
    if (u.kind === 'meta' || u.range!.start >= lastEnd) {
      out.push(u);
      if (u.kind !== 'meta') lastEnd = u.range!.end;
    } else {
      issues.push({ level: 'warning', line: pos.lineOf(u.range!.start), message: 'overlapping unit skipped' });
    }
  }
  for (const u of out) if (u.kind === 'meta') delete u.range;
  return { units: out, issues };
}

// ---- project file (_quarto.yml) ---------------------------------------------

export interface ProjectField {
  path: (string | number)[];
  value: string;
}

/** Translatable text in the project config: titles, parts, navbar and footer text. */
export function projectFields(config: any): ProjectField[] {
  const out: ProjectField[] = [];
  const add = (path: (string | number)[], v: unknown) => {
    if (typeof v === 'string' && hasTranslatableText(v) && !/\.(qmd|md|ipynb)$/.test(v)) out.push({ path, value: v });
  };
  for (const top of ['book', 'website']) {
    const s = config?.[top];
    if (!s) continue;
    add([top, 'title'], s.title);
    add([top, 'subtitle'], s.subtitle);
    add([top, 'description'], s.description);
    (s.chapters ?? []).forEach((c: any, i: number) => {
      if (c && typeof c === 'object' && typeof c.part === 'string') add([top, 'chapters', i, 'part'], c.part);
    });
    (s.appendices ?? []).forEach((c: any, i: number) => {
      if (c && typeof c === 'object' && typeof c.part === 'string') add([top, 'appendices', i, 'part'], c.part);
    });
    for (const side of ['left', 'right']) {
      (s.navbar?.[side] ?? []).forEach((it: any, i: number) => {
        if (it && typeof it === 'object') add([top, 'navbar', side, i, 'text'], it.text);
      });
    }
    const pf = s['page-footer'];
    if (typeof pf === 'string') add([top, 'page-footer'], pf);
    else if (pf && typeof pf === 'object') for (const k of ['left', 'center', 'right']) add([top, 'page-footer', k], pf[k]);
  }
  return out;
}

export function projectUnits(config: any): SourceUnit[] {
  return projectFields(config).map((f) => ({ kind: 'meta', field: f.path.join('.'), source: f.value, hash: textHash(f.value) }));
}
