// The translation banner at the top of each translated page: status label,
// a bar of how the page's units were translated, the people who helped, and
// a call to review through GitHub. Built from the page's stats (which come
// from the tracking files), so only merged contributions count.

import { bannerState, type PageStats } from '../core/score.ts';
import { fill, languageName, uiLang, uiStrings } from '../core/strings.ts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MAX_AVATARS = 5;

const ICON_TRANSLATE =
  '<svg class="tr-banner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>';
const ICON_CHECK =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const ICON_PLUS =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
const ICON_GITHUB =
  '<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';

export interface BannerInput {
  lang: string;
  sourceLang: string;
  stats: PageStats;
  /** Link to the page in the source language. */
  original: string;
}

export function bannerHtml(b: BannerInput): string {
  const S = uiStrings(b.lang);
  const ui = uiLang(b.lang);
  const s = b.stats;
  const src = languageName(b.sourceLang, ui);
  const state = bannerState(s);
  const fallback = s.stale + s.missing;
  const touched = s.human + s.verified;

  // Header: what this is, its status, and the original.
  const label = esc(S[`state_${state}`]);
  const badge = `<span class="tr-banner-state" data-state="${state}">${state === 'human' ? ICON_CHECK : ''}${label}</span>`;
  const head =
    `<div class="tr-banner-head">${ICON_TRANSLATE}` +
    `<span class="tr-banner-title">${esc(state === 'untranslated' ? fill(S.untranslated, { src }) : fill(S.translatedFrom, { src }))}</span>` +
    `${state === 'untranslated' ? '' : badge}` +
    `<a class="tr-original" href="${esc(b.original)}" hreflang="${esc(b.sourceLang)}">${esc(S.readOriginal)}</a></div>`;

  // Bar and legend: one segment per kind of unit, in a fixed order.
  let bar = '';
  if (state !== 'untranslated') {
    const segs = [
      { kind: 'human', n: s.human, text: S.segHuman },
      { kind: 'verified', n: s.verified, text: S.segVerified },
      { kind: 'machine', n: s.machine, text: S.segMachine },
      { kind: 'fallback', n: fallback, text: S.segFallback },
    ].filter((x) => x.n > 0);
    const allMachine = segs.length === 1 && segs[0].kind === 'machine';
    const items = allMachine ? [{ ...segs[0], text: S.segAllMachine }] : segs;
    const say = (x: { n: number; text: string }) => fill(x.text, { n: x.n, src }, ui);
    bar =
      `<div class="tr-banner-bar" role="img" aria-label="${esc(items.map(say).join('; '))}">` +
      segs.map((x) => `<span data-kind="${x.kind}" style="flex-grow:${x.n}"></span>`).join('') +
      `</div><ul class="tr-banner-legend" aria-hidden="true">` +
      items.map((x) => `<li><span class="tr-banner-key" data-kind="${x.kind}"></span>${esc(say(x))}</li>`).join('') +
      `</ul>`;
  }

  // People: avatars and thanks, or an invitation to be the first.
  let people = '';
  if (s.people.length) {
    const shown = s.people.slice(0, MAX_AVATARS);
    const extra = s.people.length - shown.length;
    const avatars =
      `<span class="tr-banner-avatars" aria-hidden="true">` +
      shown.map((c) => `<img src="https://github.com/${encodeURIComponent(c.login)}.png?size=64" alt="" width="30" height="30" loading="lazy" title="@${esc(c.login)}">`).join('') +
      (extra > 0 ? `<span class="tr-banner-more">+${extra}</span>` : '') +
      `</span>`;
    const link = (l: string) => `<a href="https://github.com/${encodeURIComponent(l)}">@${esc(l)}</a>`;
    const named = s.people.length <= 3 ? s.people : s.people.slice(0, 2);
    const parts = named.map((c) => link(c.login));
    if (named.length < s.people.length) parts.push(esc(fill(S.others, { n: s.people.length - named.length }, ui)));
    const names = new Intl.ListFormat(ui, { type: 'conjunction' }).format(parts);
    const text = fill(state === 'human' ? esc(S.credit) : esc(S.thanks), { names });
    people = `<div class="tr-banner-people">${avatars}<p>${text}</p></div>`;
  } else if (touched === 0) {
    people = `<div class="tr-banner-people"><span class="tr-banner-empty" aria-hidden="true">${ICON_PLUS}</span><p>${esc(S.nobody)}</p></div>`;
  }

  // Call to action: opens reviewer mode, which signs in with GitHub.
  const lang = languageName(b.lang, ui);
  const cta =
    state === 'human' ? { title: S.ctaHumanTitle, body: S.ctaHumanBody, button: S.improveTranslation }
    : touched === 0 ? { title: fill(S.ctaFirstTitle, { lang }), body: S.ctaFirstBody, button: S.reviewTranslation }
    : { title: fill(S.ctaTitle, { lang }), body: S.ctaBody, button: S.improveTranslation };
  const action =
    `<div class="tr-banner-cta"><div class="tr-banner-cta-text"><strong>${esc(cta.title)}</strong><span>${esc(cta.body)}</span></div>` +
    `<a class="tr-review-toggle tr-banner-button${state === 'human' ? ' tr-banner-button-quiet' : ''}" href="?review=1">${ICON_GITHUB}<span class="tr-toggle-text">${esc(cta.button)}</span></a></div>`;

  return (
    `<aside class="tr-banner" data-state="${state}" aria-label="${esc(S.bannerLabel)}">` +
    `<div class="tr-banner-main">${head}${bar}${people}</div>${action}</aside>`
  );
}
