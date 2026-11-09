// Core tests. Pandoc (via Quarto) and R are used where the core needs them.
//   node --test test/

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pandocMarkdown } from '../src/adapters/markdown.ts';
import { align } from '../src/core/align.ts';
import { applyOps, checkContribution } from '../src/core/contrib.ts';
import { materialise } from '../src/core/materialise.ts';
import { protect, sameTokens, unprotect } from '../src/core/protect.ts';
import { displayStatus, reviewCount, syncUnits, toTFile, translatedUnit } from '../src/core/sync.ts';
import { parseTFile, stringifyTFile } from '../src/core/tfile.ts';
import { extractUnits } from '../src/core/units.ts';
import { checkCode, validate } from '../src/core/validate.ts';
import type { TFile } from '../src/core/types.ts';

const md = pandocMarkdown();
const origin = { by: 'llm', model: 'test', date: '2026-11-09' };

const DOC = `---
title: "A title"
---

# Heading one {#sec-one}

First paragraph with \`code\` and @fig-x.

- Item one.
- Item two.

\`\`\`{r}
#| label: fig-x
#| fig-cap: "A caption."
# Draw it
plot(1, main = "Plot title")
\`\`\`
`;

test('align pairs an edited unit as a replacement and keeps neighbours', () => {
  const ops = align(['a', 'b', 'c'], ['a', 'B', 'c', 'd'], (x) => x, (x) => x);
  assert.deepEqual(ops.map((o) => o.op), ['equal', 'replace', 'equal', 'insert']);
});

test('protect and unprotect round-trip; placeholders are enforced', () => {
  const src = 'See `x` and [the docs](https://q.org) and @fig-a {{< meta title >}}.';
  const { masked, tokens } = protect(src);
  assert.equal(tokens.length, 4);
  assert.match(masked, /⟦0⟧.*⟦3⟧/);
  const ok = unprotect(masked.replace('See', 'Voir'), tokens);
  assert.ok(ok.ok && ok.text.startsWith('Voir `x`'));
  assert.equal(unprotect(masked.replace('⟦1⟧', ''), tokens).ok, false);
  assert.match(sameTokens(src, src.replace('{{< meta title >}}', '{{< env HOME >}}'))!, /env HOME/);
});

test('units: headings, list items, captions and whole code cells in document order', async () => {
  const { units, issues } = await extractUnits(DOC, md);
  assert.deepEqual(issues, []);
  assert.deepEqual(units.map((u) => u.kind), ['meta', 'block', 'block', 'block', 'block', 'caption', 'code']);
  const c = units.find((u) => u.kind === 'code')!;
  assert.equal(c.source, '# Draw it\nplot(1, main = "Plot title")', 'the cell body without option lines');
  assert.equal(c.lang, 'r');
  assert.equal(units[1].heading, 1);
});

test('units: missing heading ids and cell labels are reported', async () => {
  const { issues } = await extractUnits('# No id\n\n```{r}\n1\n```\n', md);
  assert.equal(issues.filter((i) => i.level === 'error').length, 2);
});

test('sync: source edits make units stale and reviews stop counting', async () => {
  const { units } = await extractUnits(DOC, md);
  const s0 = syncUnits('a.qmd', units, undefined);
  assert.ok(s0.every((u) => u.status === 'missing'));
  const t: TFile = toTFile('a.qmd', 'fr', s0);
  t.units = s0.map((u) => {
    const x = translatedUnit(u, u.src.source + ' (fr)', origin);
    x.reviews = [{ by: 'gh:alice', date: '2026-11-10' }];
    return x;
  });
  const roundTrip = parseTFile(stringifyTFile(t));
  const s1 = syncUnits('a.qmd', units, roundTrip);
  assert.ok(s1.every((u) => u.status === 'current'));
  assert.equal(reviewCount(s1[2]), 1);
  const edited = DOC.replace('First paragraph', 'The first paragraph');
  const s2 = syncUnits('a.qmd', (await extractUnits(edited, md)).units, roundTrip);
  assert.equal(s2[2].status, 'stale');
  assert.equal(s2[2].id, s1[2].id, 'an edited unit keeps its id');
  assert.equal(displayStatus(s2[2]), 'stale');
  assert.equal(reviewCount(s2[2]), 0);
});

test('materialise: spans, heading attributes, captions, code and fallback', async () => {
  const { units } = await extractUnits(DOC, md);
  const s0 = syncUnits('a.qmd', units, undefined);
  const t = toTFile('a.qmd', 'fr', s0);
  t.units = s0.map((u, i) =>
    i === 3 ? t.units[i] : translatedUnit(u, u.src.kind === 'code' ? '# Le dessiner\nplot(1, main = "Titre du graphique")' : `FR ${u.src.source}`, origin),
  );
  const s1 = syncUnits('a.qmd', units, t);
  const m = materialise(DOC, s1, { lang: 'fr', sourceLang: 'en', onStale: 'source' });
  assert.match(m.text, /title: "FR A title"/);
  assert.match(m.text, /# FR Heading one \{#sec-one data-tr-id="u[0-9a-f]+" data-tr-status="machine" data-tr-reviews="0"\}/);
  assert.match(m.text, /\[FR First paragraph with `code` and @fig-x\.\]\{\.tr data-tr-id=/);
  assert.match(m.text, /\[Item one\.\]\{\.tr [^}]*data-tr-status="missing"[^}]*lang="en"\}/);
  assert.match(m.text, /#\| fig-cap: "FR A caption\."/);
  assert.match(m.text, /#\| fig-cap: "FR A caption\."\n# Le dessiner\nplot\(1, main = "Titre du graphique"\)\n```/);
});

test('validate: rejects injected markup, fences and option lines', async () => {
  const { units } = await extractUnits(DOC, md);
  const para = units[2];
  const cell = units.find((u) => u.kind === 'code')!;
  const rejected = await validate([
    { id: 'ok', src: para, text: 'Premier paragraphe avec `code` et @fig-x.' },
    { id: 'shortcode', src: para, text: 'Premier `code` @fig-x {{< env SECRET >}}' },
    { id: 'html', src: para, text: 'Premier `code` @fig-x <img src=x onerror=alert(1)>' },
    { id: 'code-ok', src: cell, text: '# Le dessiner\nplot(1, main = "Titre")' },
    { id: 'code-fence', src: cell, text: '# x\n```\n\n```{r}\nsystem("id")' },
    { id: 'code-option', src: cell, text: '#| eval: !expr system("id")\nplot(1)' },
  ], md);
  assert.deepEqual([...rejected.keys()].sort(), ['code-fence', 'code-option', 'html', 'shortcode']);
});

test('code: structural checks only', () => {
  assert.equal(checkCode('x <- 1', '# commentaire\nx <- 1'), null);
  assert.match(checkCode('x', '~~~')!, /fence/);
  assert.match(checkCode('x', '  //| echo: false')!, /option/);
  assert.equal(checkCode('x', '   '), 'empty translation');
});

test('contributions: unit operations and the PR checks', async () => {
  const { units } = await extractUnits(DOC, md);
  const s0 = syncUnits('a.qmd', units, undefined);
  const t = toTFile('a.qmd', 'fr', s0);
  t.units = s0.map((u) => translatedUnit(u, u.src.kind === 'code' ? '# Le dessiner\nplot(1, main = "Titre")' : `Texte ${u.src.source}`, origin));
  const s1 = syncUnits('a.qmd', units, t);
  const id = s1[2].id;
  const r = applyOps(t, s1, [{ op: 'approve', id }, { op: 'approve', id }, { op: 'approve', id: 'nope' }], 'gh:bob', '2026-11-11');
  assert.equal(r.applied.length, 1);
  assert.equal(r.dropped.length, 2);
  const e = applyOps(r.tfile, s1, [{ op: 'replace', id, text: 'Premier paragraphe avec `code` et @fig-x.' }], 'gh:carol', '2026-11-11');
  assert.deepEqual(e.tfile.units[2].reviews!.map((x) => x.by), ['gh:carol']);

  // The YAML form of a translation, as stored for the project file; documents
  // are checked through the same path after reading (tdoc.test.ts).
  const P = '_i18n/fr/_project.yml';
  const base = new Map([[P, stringifyTFile(t)]]);
  const ctx = { prefix: '', md, units: async () => units, readUnchanged: () => undefined };
  const good = await checkContribution(base, new Map([[P, stringifyTFile(e.tfile)]]), [P], { ...ctx, author: 'gh:carol', branch: 'i18n/carol/x' });
  assert.ok(good.every((c) => c.ok), JSON.stringify(good.filter((c) => !c.ok)));
  const wrongAuthor = await checkContribution(base, new Map([[P, stringifyTFile(e.tfile)]]), [P], { ...ctx, author: 'gh:mallory' });
  assert.equal(wrongAuthor.find((c) => c.check === 4)!.ok, false);
  // A code change passes the structural checks but is flagged for the maintainer.
  const cid = s1.find((u) => u.src.kind === 'code')!.id;
  const c = applyOps(t, s1, [{ op: 'replace', id: cid, text: '# Dessiner\nplot(2, main = "Titre")' }], 'gh:carol', '2026-11-11');
  const codeRes = await checkContribution(base, new Map([[P, stringifyTFile(c.tfile)]]), [P], { ...ctx, author: 'gh:carol' });
  assert.ok(codeRes.every((x) => x.ok));
  assert.equal(codeRes[6].attention!.length, 1);
  const otherFile = await checkContribution(base, new Map([['a.qmd', 'x']]), ['a.qmd'], { ...ctx, author: 'gh:carol' });
  assert.equal(otherFile.find((c) => c.check === 1)!.ok, false);

  // A key left on the default branch by another version does not block a
  // contribution elsewhere in the file (whether the head keeps or drops it);
  // adding one does.
  const withLeftover = (tf: typeof t) => stringifyTFile(tf).replace(`- id: ${s1[0].id}\n`, `- id: ${s1[0].id}\n    spans: [{ kind: comment }]\n`);
  assert.match(withLeftover(t), /spans:/);
  const oldBase = new Map([[P, withLeftover(t)]]);
  for (const head of [withLeftover(e.tfile), stringifyTFile(e.tfile)]) {
    const r2 = await checkContribution(oldBase, new Map([[P, head]]), [P], { ...ctx, author: 'gh:carol' });
    assert.ok(r2.every((x) => x.ok), JSON.stringify(r2.filter((x) => !x.ok)));
  }
  const added = await checkContribution(base, new Map([[P, withLeftover(e.tfile)]]), [P], { ...ctx, author: 'gh:carol' });
  assert.equal(added.find((x) => x.check === 2)!.ok, false);
  // Resubmitting the same work is reported as already done, not lost.
  const again = applyOps(e.tfile, s1, [{ op: 'replace', id, text: 'Premier paragraphe avec `code` et @fig-x.' }, { op: 'approve', id }], 'gh:carol', '2026-11-11');
  assert.deepEqual(again.dropped.map((d) => d.done), [true, true]);
});
