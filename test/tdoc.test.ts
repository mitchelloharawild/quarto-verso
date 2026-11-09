// Translated documents plus tracking files.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pandocMarkdown } from '../src/adapters/markdown.ts';
import { applyOps, checkContribution } from '../src/core/contrib.ts';
import { parseTrack, readDoc, stringifyTrack, withPolicy, writeDoc } from '../src/core/tdoc.ts';
import { displayStatus, syncUnits, toTFile, translatedUnit } from '../src/core/sync.ts';
import { extractUnits } from '../src/core/units.ts';
import type { TFile } from '../src/core/types.ts';

const md = pandocMarkdown();
const origin = { by: 'llm', model: 'test', date: '2026-11-09' };

const DOC = `---
title: "A title"
---

# Heading one {#sec-one}

First paragraph with \`code\` and @fig-x.

Second paragraph, quite plain.

- Item one.
- Item two.

\`\`\`{r}
#| label: fig-x
#| fig-cap: "A caption."
# Draw it
plot(1, main = "Plot title")
\`\`\`

Last paragraph.
`;

const FR: Record<string, string> = {
  'A title': 'Un titre',
  'Heading one': 'Titre un',
  'First paragraph with `code` and @fig-x.': 'Premier paragraphe avec `code` et @fig-x.',
  'Second paragraph, quite plain.': 'Deuxième paragraphe, tout simple.',
  'Item one.': 'Élément un.',
  'Item two.': 'Élément deux.',
  'A caption.': 'Une légende.',
  'Last paragraph.': 'Dernier paragraphe.',
};

async function translated(src = DOC): Promise<{ t: TFile; doc: string; track: string }> {
  const { units } = await extractUnits(src, md);
  const s0 = syncUnits('a.qmd', units, undefined);
  const t = toTFile('a.qmd', 'fr', s0);
  t.units = s0.map((u) => translatedUnit(u, u.src.kind === 'code' ? '# Le dessiner\nplot(1, main = "Titre")' : FR[u.src.source], origin));
  t.units[3].reviews = [{ by: 'gh:claire', date: '2026-11-09' }];
  const w = writeDoc('a.qmd', src, units, t);
  return { t, doc: w.doc, track: stringifyTrack(w.track, 'a.qmd') };
}

test('documents: the translated document is a Quarto document, and reads back as the same translation', async () => {
  const { t, doc, track } = await translated();
  assert.match(doc, /^title: "Un titre"$/m);
  assert.match(doc, /^# Titre un \{#sec-one\}$/m, 'heading ids come from the source');
  assert.match(doc, /^#\| label: fig-x\n#\| fig-cap: "Une légende."\n# Le dessiner$/m, 'options from the source, translated caption and code');
  assert.doesNotMatch(track, /Premier paragraphe/, 'the tracking file holds no translation');
  const r = await readDoc(doc, parseTrack(track), md);
  assert.deepEqual(r.issues, []);
  assert.deepEqual(r.tfile.units.map((u) => u.text), t.units.map((u) => u.text));
  // Writing again is a fixed point.
  const { units } = await extractUnits(DOC, md);
  assert.equal(writeDoc('a.qmd', DOC, units, r.tfile, r.raw).doc, doc);
});

test('documents: an edit in the document is a new translation; reviews of the old text stop counting', async () => {
  const { doc, track } = await translated();
  const edited = doc.replace('Deuxième paragraphe, tout simple.', 'Deuxième paragraphe,\ntrès simple.');
  const r = await readDoc(edited, parseTrack(track), md);
  const id = r.tfile.units[3].id;
  assert.deepEqual([...r.untracked], [id]);
  assert.equal(r.tfile.units[3].reviews!.length, 1, 'as stored (the PR checks compare it)');
  assert.deepEqual(withPolicy(r).units[3].reviews, [], 'as displayed');
  // Rewriting keeps the translator's line break.
  const { units } = await extractUnits(DOC, md);
  assert.match(writeDoc('a.qmd', DOC, units, r.tfile, r.raw).doc, /Deuxième paragraphe,\ntrès simple\./);
});

test('documents: source edits go through the tracking file, so nothing is guessed', async () => {
  const { doc, track } = await translated();
  const src2 = DOC.replace('Second paragraph, quite plain.', 'A new paragraph.\n\nSecond paragraph, quite plain.').replace('Last paragraph.', 'Last paragraph, edited.');
  const r = await readDoc(doc, parseTrack(track), md);
  const { units } = await extractUnits(src2, md);
  const synced = syncUnits('a.qmd', units, withPolicy(r));
  assert.deepEqual(synced.map((u) => u.status), ['current', 'current', 'current', 'missing', 'current', 'current', 'current', 'current', 'current', 'stale']);
  const w = writeDoc('a.qmd', src2, units, withPolicy(r), r.raw);
  assert.match(w.doc, /et @fig-x\.\n\nA new paragraph\.\n\nDeuxième paragraphe/, 'new units appear in the source language');
  assert.match(w.doc, /Dernier paragraphe\.\n$/, 'a stale unit keeps its old translation in the document');
  const again = await readDoc(w.doc, w.track, md);
  assert.deepEqual(again.issues, []);
  // An untranslated unit is told from a hand translation by its source-hash
  // alone: tracking files keep no source text.
  const track2 = stringifyTrack(w.track, 'a.qmd');
  assert.doesNotMatch(track2, /^ +source:/m);
  const hand = await readDoc(w.doc.replace('A new paragraph.', 'Un nouveau paragraphe.'), parseTrack(track2), md);
  assert.deepEqual([...hand.untracked], [synced[3].id]);
  assert.equal(hand.tfile.units[3].text, 'Un nouveau paragraphe.');
});

test('documents: a split or moved block is a structure error; only units holding their recorded text are used', async () => {
  const { doc, track } = await translated();
  const split = doc.replace('Premier paragraphe avec `code` et @fig-x.', 'Premier paragraphe\n\navec `code` et @fig-x.');
  const r = await readDoc(split, parseTrack(track), md);
  assert.equal(r.issues[0].kind, 'structure');
  const { units } = await extractUnits(DOC, md);
  const shown = syncUnits('a.qmd', units, withPolicy(r)).map(displayStatus);
  // Before the split: title and heading. After it, by position from the end:
  // caption, code and last paragraph. In between, the shifted paragraphs and
  // list items fail their text hash and show the source.
  assert.deepEqual(shown, ['machine', 'machine', 'missing', 'missing', 'missing', 'missing', 'machine', 'machine', 'machine']);
  // Merging two paragraphs and splitting another keeps the count, but moves text.
  const moved = doc.replace('et @fig-x.\n\nDeuxième', 'et @fig-x. Deuxième').replace('- Élément deux.', '- Élément deux.\n\n  Suite.');
  const m = await readDoc(moved, parseTrack(track), md);
  assert.ok(m.issues.some((i) => i.kind === 'structure'), JSON.stringify(m.issues));
});

test('documents: contribution checks on a translated document and its tracking file', async () => {
  const { t, doc, track } = await translated();
  const { units } = await extractUnits(DOC, md);
  const r0 = await readDoc(doc, parseTrack(track), md);
  const synced = syncUnits('a.qmd', units, r0.tfile);
  const id = synced[4].id;
  const D = '_i18n/fr/a.qmd';
  const T = '_i18n/fr/a.qmd.yml';
  const base = new Map([[D, doc], [T, track]]);
  const ctx = { prefix: '', md, units: async () => units, author: 'gh:carol', branch: 'i18n/carol/fr', readUnchanged: (p: string) => base.get(p) };
  const run = (head: Map<string, string>) => checkContribution(base, head, [...head.keys()], ctx);
  const failed = (res: Awaited<ReturnType<typeof run>>) => res.filter((c) => !c.ok).map((c) => `${c.check}: ${c.messages.join('; ')}`);

  // What the service or `i18n sync --by` writes: both files.
  const e = applyOps(r0.tfile, synced, [{ op: 'replace', id, text: 'Élément un, revu.' }, { op: 'approve', id: synced[1].id }], 'gh:carol', '2026-11-11');
  const w = writeDoc('a.qmd', DOC, units, e.tfile, r0.raw);
  const good = await run(new Map([[D, w.doc], [T, stringifyTrack(w.track, 'a.qmd')]]));
  assert.deepEqual(failed(good), []);
  // An approval changes only the tracking file; the document is read from the base.
  const a = applyOps(r0.tfile, synced, [{ op: 'approve', id }], 'gh:carol', '2026-11-11');
  const onlyTrack = await run(new Map([[T, stringifyTrack(writeDoc('a.qmd', DOC, units, a.tfile).track, 'a.qmd')]]));
  assert.deepEqual(failed(onlyTrack), []);
  // Editing the document without recording it.
  const noTrack = await run(new Map([[D, doc.replace('Élément un.', 'Élément un, revu.')]]));
  assert.match(failed(noTrack).join(), /^4: .*tracking file was not updated/);
  // Changing anything outside the units: a cell option, or a new block without text.
  const option = await run(new Map([[D, doc.replace('#| label: fig-x', '#| label: fig-x\n#| eval: false')]]));
  assert.match(failed(option).join(), /^2: .*outside translatable text/);
  const shortcode = await run(new Map([[D, doc.replace('Dernier paragraphe.', 'Dernier paragraphe.\n\n{{< include secrets.qmd >}}')]]));
  assert.match(failed(shortcode).join(), /^2: .*outside translatable text/);
  // Prose validation still applies to text edited in the document.
  const e2 = applyOps(r0.tfile, synced, [{ op: 'replace', id, text: 'Élément {{< env HOME >}}.' }], 'gh:carol', '2026-11-11');
  const w2 = writeDoc('a.qmd', DOC, units, e2.tfile, r0.raw);
  assert.match(failed(await run(new Map([[D, w2.doc], [T, stringifyTrack(w2.track, 'a.qmd')]]))).join(), /^6: /);
  void t;
});
