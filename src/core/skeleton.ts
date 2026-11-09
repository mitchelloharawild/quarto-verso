// Pandoc-based structure check: a translated unit must parse to the same block
// shape as its source, with identical code, math, raw markup, link and image
// targets, attributes, citations and notes.

function attrKey(attr: any): string {
  if (!Array.isArray(attr)) return '';
  const [id, classes, kvs] = attr;
  const kv = (kvs as [string, string][]).filter(([k]) => k !== 'data-pos' && k !== 'wrapper');
  return JSON.stringify([id, classes, kv]);
}

function inlineItems(inlines: any[], out: string[]): void {
  for (const x of inlines ?? []) {
    const t = x?.t;
    const c = x?.c;
    switch (t) {
      case 'Code':
        out.push(`code ${attrKey(c[0])} ${c[1]}`);
        break;
      case 'Math':
        out.push(`math ${c[0].t} ${c[1]}`);
        break;
      case 'RawInline':
        out.push(`raw ${c[0]} ${c[1]}`);
        break;
      case 'Link':
        out.push(`link ${attrKey(c[0])} ${c[2][0]}`);
        inlineItems(c[1], out);
        break;
      case 'Image':
        out.push(`image ${attrKey(c[0])} ${c[2][0]}`);
        inlineItems(c[1], out);
        break;
      case 'Span': {
        const k = attrKey(c[0]);
        if (k !== JSON.stringify(['', [], []])) out.push(`span ${k}`);
        inlineItems(c[1], out);
        break;
      }
      case 'Cite':
        out.push(`cite ${c[0].map((ct: any) => ct.citationId).join(';')}`);
        inlineItems(c[1], out);
        break;
      case 'Note':
        out.push('note');
        blockItems(c, out);
        break;
      case 'Emph': case 'Strong': case 'Underline': case 'Strikeout':
      case 'Superscript': case 'Subscript': case 'SmallCaps':
        inlineItems(c, out);
        break;
      case 'Quoted':
        inlineItems(c[1], out);
        break;
      default:
        break;
    }
  }
}

function blockItems(blocks: any[], out: string[]): void {
  for (const b of blocks ?? []) {
    if (b.t === 'Para' || b.t === 'Plain') inlineItems(b.c, out);
    else if (b.t === 'Div') blockItems(b.c[1], out);
    else out.push(`block ${b.t}`);
  }
}

function shape(blocks: any[]): string {
  return (blocks ?? []).map((b: any) => (b.t === 'Plain' ? 'Para' : b.t)).join(',');
}

/**
 * Block structure of a whole document, ignoring text and the wrapper divs that
 * sourcepos adds: used to check a materialised file against its source.
 */
export function documentShape(blocks: any[]): string {
  const out: string[] = [];
  const walk = (bs: any[]) => {
    for (const b of bs ?? []) {
      switch (b.t) {
        case 'Div': {
          const kvs: [string, string][] = b.c[0][2];
          if (kvs.some(([k]) => k === 'wrapper')) {
            walk(b.c[1]);
            break;
          }
          out.push(`Div#${b.c[0][0]}.${b.c[0][1].join('.')}(`);
          walk(b.c[1]);
          out.push(')');
          break;
        }
        case 'Header':
          out.push(`H${b.c[0]}`);
          break;
        case 'BulletList':
        case 'OrderedList': {
          const items = b.t === 'BulletList' ? b.c : b.c[1];
          out.push(`${b.t}[${items.length}](`);
          for (const it of items) walk(it);
          out.push(')');
          break;
        }
        case 'BlockQuote':
          out.push('Quote(');
          walk(b.c);
          out.push(')');
          break;
        case 'CodeBlock':
          out.push(`Code.${b.c[0][1].join('.')}`);
          break;
        case 'Plain':
        case 'Para':
          out.push('P');
          break;
        default:
          out.push(b.t);
      }
    }
  };
  walk(blocks);
  return out.join(' ');
}

/** Compare parsed source and translation; null when equivalent, else a reason. */
export function compareSkeleton(src: any[], tr: any[]): string | null {
  if (shape(src) !== shape(tr)) return `block structure differs (${shape(src)} vs ${shape(tr)})`;
  const a: string[] = [];
  const b: string[] = [];
  blockItems(src, a);
  blockItems(tr, b);
  a.sort();
  b.sort();
  if (a.join('\n') !== b.join('\n')) {
    const lost = a.filter((x) => !b.includes(x));
    const extra = b.filter((x) => !a.includes(x));
    const parts = [];
    if (lost.length) parts.push(`missing ${lost.slice(0, 3).join(' | ')}`);
    if (extra.length) parts.push(`added ${extra.slice(0, 3).join(' | ')}`);
    if (!parts.length) parts.push('inline elements repeated or dropped');
    return `inline skeleton differs: ${parts.join('; ')}`;
  }
  return null;
}
