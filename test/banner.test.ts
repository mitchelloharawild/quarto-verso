// Banner counts and labels, from page units as the build sees them.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bannerHtml } from '../src/cli/banner.ts';
import type { PageUnit } from '../src/core/materialise.ts';
import { bannerState, pageStats } from '../src/core/score.ts';

let n = 0;
const unit = (status: PageUnit['status'], by?: string, reviewers: string[] = []): PageUnit => ({
  id: `u${n++}`, kind: 'block', status, by, hash: 'h', source: 'x', weight: 1,
  reviews: reviewers.map((r) => ({ by: r, date: '2026-11-10' })), count: reviewers.length,
});
const page = (spec: [number, () => PageUnit][]) => spec.flatMap(([k, f]) => Array.from({ length: k }, f));

test('banner: units counted as human, verified, machine and fallback', () => {
  const units = page([
    [6, () => unit('reviewed', 'gh:ana', ['gh:ana'])],
    [15, () => unit('reviewed', 'llm', ['gh:luis'])],
    [12, () => unit('machine', 'llm')],
    [1, () => unit('stale')],
    [1, () => unit('missing')],
  ]);
  const s = pageStats(units, 2);
  assert.deepEqual([s.human, s.verified, s.machine, s.stale + s.missing], [6, 15, 12, 2]);
  assert.deepEqual(s.people, [{ login: 'luis', units: 15 }, { login: 'ana', units: 6 }]);
  assert.equal(bannerState(s), 'partial');
  const html = bannerHtml({ lang: 'en', sourceLang: 'es', stats: s, original: '../a.html' });
  assert.match(html, /15 machine translated, verified by people/);
  assert.match(html, /6 human translated/);
  assert.match(html, /2 not yet translated/);
  assert.match(html, /With thanks to <a [^>]+>@luis<\/a> and <a [^>]+>@ana<\/a>/);
  assert.match(html, /class="tr-review-toggle tr-banner-button"[^>]*>.*Improve the translation/);
});

test('banner: states from machine-only to human translated', () => {
  const machine = pageStats(page([[10, () => unit('machine', 'llm')]]), 2);
  assert.equal(bannerState(machine), 'machine');
  const html = bannerHtml({ lang: 'es', sourceLang: 'en', stats: machine, original: '../a.html' });
  assert.match(html, /Los 10 párrafos traducidos automáticamente/);
  assert.match(html, /Nadie ha revisado esta página todavía/);
  assert.match(html, /Revisar la traducción/);

  const human = pageStats(page([[6, () => unit('reviewed', 'gh:a', ['gh:a'])], [3, () => unit('reviewed', 'llm', ['gh:b', 'gh:c'])], [1, () => unit('machine', 'llm')]]), 2);
  assert.equal(bannerState(human), 'human');
  const h = bannerHtml({ lang: 'en', sourceLang: 'es', stats: human, original: '../a.html' });
  assert.match(h, /Human translated and reviewed/);
  assert.match(h, /tr-banner-button-quiet/);
  assert.match(h, /Translated and reviewed by .*@a.*@b.* and .*@c/);

  const many = pageStats(page([[10, () => unit('reviewed', 'llm', ['gh:a', 'gh:b', 'gh:c', 'gh:d', 'gh:e', 'gh:f'])]]), 2);
  const m = bannerHtml({ lang: 'en', sourceLang: 'es', stats: many, original: '../a.html' });
  assert.equal((m.match(/<img /g) ?? []).length, 5);
  assert.match(m, /\+1</);
  assert.match(m, /and 4 others for helping/);
  assert.equal(bannerState(pageStats([unit('missing')], 2)), 'untranslated');
  const one = pageStats([unit('reviewed', 'gh:a', ['gh:a']), unit('machine', 'llm'), unit('machine', 'llm')], 2);
  assert.match(bannerHtml({ lang: 'fr', sourceLang: 'en', stats: one, original: '../a.html' }), /1 traduit par des personnes.*2 traduits automatiquement, pas encore relus/);
});
