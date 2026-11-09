// markdown adapter: Pandoc (bundled with Quarto) as the Markdown parser.

import { fnv1a } from '../core/hash.ts';
import type { MarkdownAdapter, PandocAst } from '../core/types.ts';
import { pandocCommand, run } from './host.ts';

const READER = 'commonmark_x';

async function pandocJson(text: string, reader: string): Promise<PandocAst> {
  const { cmd, args } = pandocCommand();
  const r = await run(cmd, [...args, '-f', reader, '-t', 'json'], text);
  if (r.code !== 0) throw new Error(`pandoc failed: ${r.stderr.trim()}`);
  return JSON.parse(r.stdout);
}

export function pandocMarkdown(): MarkdownAdapter {
  const cache = new Map<string, PandocAst>();
  return {
    async parseWithPositions(text) {
      const k = fnv1a(text) + text.length;
      if (!cache.has(k)) cache.set(k, await pandocJson(text, `${READER}+sourcepos`));
      return cache.get(k)!;
    },
    async parseMany(texts) {
      if (!texts.length) return [];
      const doc = texts.map((t, k) => `::: {#i18n-snippet-${k}}\n${t}\n:::\n`).join('\n');
      const ast = await pandocJson(doc, READER);
      const out: any[][] = new Array(texts.length);
      for (const b of ast.blocks) {
        const m = b.t === 'Div' ? /^i18n-snippet-(\d+)$/.exec(b.c[0][0]) : null;
        if (!m) throw new Error('snippet parse lost its boundaries');
        const k = Number(m[1]);
        if (out[k]) throw new Error('snippet parse produced a duplicate boundary');
        out[k] = b.c[1];
      }
      if (out.some((x) => x === undefined) || out.length !== texts.length) throw new Error('snippet parse lost a snippet');
      return out;
    },
  };
}
