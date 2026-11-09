// Review score: page numbers weighted by source length.

import type { PageUnit } from './materialise.ts';

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
}

export function pageStats(units: PageUnit[], target: number): PageStats {
  const total = units.reduce((n, u) => n + u.weight, 0) || 1;
  const share = (f: (u: PageUnit) => boolean) => units.filter(f).reduce((n, u) => n + u.weight, 0) / total;
  return {
    units: units.length,
    translated: share((u) => u.status === 'machine' || u.status === 'reviewed'),
    reviewed: share((u) => u.count >= 1),
    full: share((u) => u.count >= target),
    fallback: share((u) => u.status === 'stale' || u.status === 'missing'),
    stale: units.filter((u) => u.status === 'stale').length,
    missing: units.filter((u) => u.status === 'missing').length,
    target,
  };
}

export function mergeStats(all: PageStats[], weights: number[], target: number): PageStats {
  const W = weights.reduce((a, b) => a + b, 0) || 1;
  const avg = (k: keyof PageStats) => all.reduce((n, s, i) => n + (s[k] as number) * weights[i], 0) / W;
  return {
    units: all.reduce((n, s) => n + s.units, 0),
    translated: avg('translated'), reviewed: avg('reviewed'), full: avg('full'), fallback: avg('fallback'),
    stale: all.reduce((n, s) => n + s.stale, 0), missing: all.reduce((n, s) => n + s.missing, 0), target,
  };
}

export function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}
