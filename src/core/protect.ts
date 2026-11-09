// Protected inline tokens in Markdown units.
//
// Everything that is code, an identifier or a target is protected: inline code
// (including `{r} expr`), math, shortcodes, raw HTML, link and image targets,
// attribute blocks, citations and cross-references, footnote references, and
// spans marked translate=false. Only the text between them may change.

const PATTERNS: RegExp[] = [
  /\[[^\]\n]*\]\{[^}\n]*\btranslate\s*=\s*"?false"?[^}\n]*\}/y, // [text]{translate=false}
  /(`+)(?:(?!\1)[\s\S])+?\1(?!`)/y, // inline code
  /\$\$[\s\S]+?\$\$/y, // display math
  /\$(?=\S)[^$\n]*?\S\$(?!\d)/y, // inline math
  /\{\{[<%][\s\S]*?[>%]\}\}/y, // shortcodes
  /<!--[\s\S]*?-->/y, // HTML comments
  /<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/y, // HTML tags
  /<(?:https?|mailto|ftp):[^\s<>]*>/y, // autolinks
  /\]\((?:[^()\s]|\([^()\s]*\))*(?:\s+(?:"[^"]*"|'[^']*'))?\)/y, // ](target "title")
  /\]\[[^\]\n]*\]/y, // ][reference]
  /\{(?:[#.][^}\n]*|[^}\n]*=[^}\n]*)\}/y, // attribute blocks {#id .class k=v}
  /\[\^[^\]\s]+\]/y, // footnote reference
  /\[-?@[^\]\n]*\]/y, // [@citation; @other]
  /(?<![\w@.])-?@[A-Za-z0-9_][\w:.#$%&\-+?<>~/]*[A-Za-z0-9_]/y, // @key, @fig-x
  /\\./y, // backslash escapes
];

export interface Protected {
  masked: string;
  tokens: string[];
}

/** Split text into protected tokens and the text between them. */
export function scan(text: string): { tokens: string[]; parts: (string | number)[] } {
  const tokens: string[] = [];
  const parts: (string | number)[] = [];
  let buf = '';
  let i = 0;
  outer: while (i < text.length) {
    for (const re of PATTERNS) {
      re.lastIndex = i;
      const m = re.exec(text);
      if (m && m[0].length > 0) {
        if (buf) parts.push(buf);
        buf = '';
        parts.push(tokens.length);
        tokens.push(m[0]);
        i += m[0].length;
        continue outer;
      }
    }
    buf += text[i++];
  }
  if (buf) parts.push(buf);
  return { tokens, parts };
}

export function protectedTokens(text: string): string[] {
  return scan(text).tokens.filter((t) => !/^\\.$/.test(t));
}

/** Replace protected tokens with numbered placeholders ⟦n⟧ for the translator. */
export function protect(text: string): Protected {
  const { tokens, parts } = scan(text);
  const masked = parts.map((p) => (typeof p === 'number' ? `⟦${p}⟧` : p)).join('');
  return { masked, tokens };
}

/** Restore placeholders. Fails if any placeholder is missing, repeated or unknown. */
export function unprotect(masked: string, tokens: string[]): { ok: true; text: string } | { ok: false; error: string } {
  const seen = new Map<number, number>();
  const text = masked.replace(/⟦(\d+)⟧/g, (_m, d) => {
    const k = Number(d);
    seen.set(k, (seen.get(k) ?? 0) + 1);
    return tokens[k] ?? `⟦${d}⟧`;
  });
  for (let k = 0; k < tokens.length; k++) {
    if (/^\\.$/.test(tokens[k])) continue; // escapes may be dropped
    const c = seen.get(k) ?? 0;
    if (c !== 1) return { ok: false, error: `placeholder ⟦${k}⟧ appears ${c} times (expected once)` };
  }
  for (const k of seen.keys()) {
    if (k >= tokens.length) return { ok: false, error: `unknown placeholder ⟦${k}⟧` };
  }
  return { ok: true, text };
}

/** Same protected tokens (as a multiset) in source and translation. */
export function sameTokens(source: string, text: string): string | null {
  const a = protectedTokens(source).sort();
  const b = protectedTokens(text).sort();
  const extra = b.filter((t) => !a.includes(t));
  const lost = a.filter((t) => !b.includes(t));
  if (extra.length || lost.length || a.length !== b.length) {
    const msg: string[] = [];
    if (lost.length) msg.push(`missing ${lost.map(show).join(', ')}`);
    if (extra.length) msg.push(`not in source ${extra.map(show).join(', ')}`);
    if (!msg.length) msg.push('protected tokens repeated or dropped');
    return msg.join('; ');
  }
  return null;
}

function show(t: string): string {
  return '`' + (t.length > 40 ? t.slice(0, 37) + '…' : t) + '`';
}

/** Does the text contain anything a person would translate? */
export function hasTranslatableText(text: string): boolean {
  const { parts } = scan(text);
  return parts.some((p) => typeof p === 'string' && /\p{L}/u.test(p));
}
