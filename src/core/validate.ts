// Validation of translations against their source units. Used by translate
// (on import), materialise (render), check, and the PR service: the same rules
// everywhere.

import { sameTokens } from './protect.ts';
import { compareSkeleton } from './skeleton.ts';
import type { MarkdownAdapter, SourceUnit } from './types.ts';

export interface Candidate {
  id: string;
  src: SourceUnit;
  text?: string;
}

/** Prose translations are stored and spliced as a single line (no fence or list can start inside). */
export function normaliseBlockText(s: string): string {
  return s.replace(/[ \t]*\r?\n[ \t]*/g, ' ').trim();
}

/** Code translations keep their lines; only line endings and trailing blank lines are normalised. */
export function normaliseCode(s: string): string {
  return s.replace(/\r\n?/g, '\n').replace(/\s+$/, '');
}

const FENCE = /^\s*(`{3,}|~{3,})/m;
const OPTION = /^\s*(#|\/\/|--|%%)\|/m;

/**
 * A translated cell body is free text in the cell's language. Without a
 * parser the checks are structural: it must stay inside the cell (no fence
 * line), must not add cell options (which control execution, e.g. `eval` or
 * knitr's `!expr`), and must stay a plausible size.
 */
export function checkCode(src: string, text: string): string | null {
  const t = normaliseCode(text);
  if (!t) return 'empty translation';
  if (FENCE.test(t)) return 'a code fence line would end the cell';
  if (OPTION.test(t)) return 'cell option lines (#| …) cannot be added or changed by a translation';
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(t)) return 'control characters';
  if (t.length > src.length * 3 + 2000) return 'translation is much longer than the source cell';
  return null;
}

/** Returns unit id → reason for every candidate that fails. */
export async function validate(cands: Candidate[], md: MarkdownAdapter): Promise<Map<string, string>> {
  const rejected = new Map<string, string>();
  for (const c of cands.filter((x) => x.src.kind === 'code' && typeof x.text === 'string')) {
    const r = checkCode(c.src.source, c.text!);
    if (r) rejected.set(c.id, r);
  }
  const prose = cands.filter((c) => c.src.kind !== 'code' && typeof c.text === 'string');
  // 1. Protected tokens (regex), cheap.
  const toParse: Candidate[] = [];
  for (const c of prose) {
    const text = normaliseBlockText(c.text!);
    if (!text) {
      rejected.set(c.id, 'empty translation');
      continue;
    }
    if (c.src.kind === 'meta' && /[\r\n]/.test(c.text!)) {
      rejected.set(c.id, 'meta text must be one line');
      continue;
    }
    const r = sameTokens(c.src.source, text);
    if (r) rejected.set(c.id, r);
    else toParse.push(c);
  }
  // 2. Pandoc skeleton, one parse for all.
  if (toParse.length) {
    const parsed = await md.parseMany([...toParse.map((c) => c.src.source), ...toParse.map((c) => normaliseBlockText(c.text!))]);
    toParse.forEach((c, k) => {
      const r = compareSkeleton(parsed[k], parsed[k + toParse.length]);
      if (r) rejected.set(c.id, r);
    });
  }
  return rejected;
}
