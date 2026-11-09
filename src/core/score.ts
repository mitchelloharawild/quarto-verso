// Review score: page numbers weighted by source length, plus the unit counts
// and contributors shown in the translation banner.

import type { PageUnit } from './materialise.ts';

export interface Contributor {
  /** GitHub login. */
  login: string;
  /** Units on the page this person translated or reviewed. */
  units: number;
}

export interface PageStats {
  units: number;
  /** Share of text translated and shown (machine or reviewed). */
  translated: number;
  /** Share reviewed by at least one person. */
  reviewed: number;
  /** Share reviewed by at least `target` people. */
  full: number;
  /** Share showing source text (stale, missing or rejected). */
  fallback: number;
  stale: number;
  missing: number;
  target: number;
  /** Units shown with a translation written by a person. */
  human: number;
  /** Units shown with a machine translation that a person reviewed. */
  verified: number;
  /** Units shown with a machine translation no one has reviewed. */
  machine: number;
  /** People who translated or reviewed units shown, most units first. */
  people: Contributor[];
}

const login = (by: string | undefined): string | undefined => (by?.startsWith('gh:') ? by.slice(3) : undefined);

export function pageStats(units: PageUnit[], target: number): PageStats {
  const total = units.reduce((n, u) => n + u.weight, 0) || 1;
  const share = (f: (u: PageUnit) => boolean) => units.filter(f).reduce((n, u) => n + u.weight, 0) / total;
  const shown = units.filter((u) => u.status === 'machine' || u.status === 'reviewed');
  const humanMade = (u: PageUnit) => u.by !== undefined && u.by !== 'llm';
  const people = new Map<string, number>();
  for (const u of shown) {
    const who = new Set([login(u.by), ...u.reviews.map((r) => login(r.by))].filter((x): x is string => !!x));
    for (const w of who) people.set(w, (people.get(w) ?? 0) + 1);
  }
  return {
    units: units.length,
    translated: share((u) => u.status === 'machine' || u.status === 'reviewed'),
    reviewed: share((u) => u.count >= 1),
    full: share((u) => u.count >= target),
    fallback: share((u) => u.status === 'stale' || u.status === 'missing'),
    stale: units.filter((u) => u.status === 'stale').length,
    missing: units.filter((u) => u.status === 'missing').length,
    target,
    human: shown.filter(humanMade).length,
    verified: shown.filter((u) => !humanMade(u) && u.count >= 1).length,
    machine: shown.filter((u) => !humanMade(u) && u.count === 0).length,
    people: sortPeople(people),
  };
}

function sortPeople(m: Map<string, number>): Contributor[] {
  return [...m].map(([login, units]) => ({ login, units })).sort((a, b) => b.units - a.units || a.login.localeCompare(b.login));
}

export function mergeStats(all: PageStats[], weights: number[], target: number): PageStats {
  const W = weights.reduce((a, b) => a + b, 0) || 1;
  const avg = (k: 'translated' | 'reviewed' | 'full' | 'fallback') => all.reduce((n, s, i) => n + s[k] * weights[i], 0) / W;
  const sum = (k: 'units' | 'stale' | 'missing' | 'human' | 'verified' | 'machine') => all.reduce((n, s) => n + s[k], 0);
  const people = new Map<string, number>();
  for (const s of all) for (const c of s.people) people.set(c.login, (people.get(c.login) ?? 0) + c.units);
  return {
    units: sum('units'),
    translated: avg('translated'), reviewed: avg('reviewed'), full: avg('full'), fallback: avg('fallback'),
    stale: sum('stale'), missing: sum('missing'), target,
    human: sum('human'), verified: sum('verified'), machine: sum('machine'), people: sortPeople(people),
  };
}

export type BannerState = 'untranslated' | 'machine' | 'partial' | 'reviewed' | 'human';

/**
 * The banner's status label, from the share of units on the page that people
 * translated or verified (units shown in the source language count against it).
 */
export function bannerState(s: PageStats): BannerState {
  if (s.human + s.verified + s.machine === 0) return 'untranslated';
  const all = s.units || 1;
  const touched = (s.human + s.verified) / all;
  if (touched < 0.2) return 'machine';
  if (touched < 0.8) return 'partial';
  return s.human / all >= 0.5 ? 'human' : 'reviewed';
}

export function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}
