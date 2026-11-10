// Sync: align a translation file with the current source units and classify
// each unit as current, stale or missing. Pure and in memory.

import { align } from './align.ts';
import { fnv1a } from './hash.ts';
import type { DisplayStatus, SourceUnit, SyncedUnit, TFile, TUnit } from './types.ts';

export function syncUnits(file: string, units: SourceUnit[], tfile: TFile | undefined): SyncedUnit[] {
  const stored = tfile?.units ?? [];
  const ops = align(
    stored,
    units,
    (s) => `${s.kind}:${s['source-hash']}`,
    (u) => `${u.kind}:${u.hash}`,
    (s, u) => s.kind === u.kind,
  );
  const used = new Set(stored.map((s) => s.id));
  const out: SyncedUnit[] = new Array(units.length);
  for (const op of ops) {
    if (op.op === 'equal') {
      const s = stored[op.a];
      out[op.b] = { id: s.id, src: units[op.b], stored: s, status: hasText(s) ? 'current' : 'missing' };
    } else if (op.op === 'replace') {
      const s = stored[op.a];
      out[op.b] = { id: s.id, src: units[op.b], stored: s, status: hasText(s) ? 'stale' : 'missing' };
    } else if (op.op === 'insert') {
      out[op.b] = { id: newId(file, units, op.b, used), src: units[op.b], status: 'missing' };
    }
  }
  return out;
}

function hasText(s: TUnit): boolean {
  return typeof s.text === 'string' && s.text.length > 0;
}

/** Deterministic id for a new unit: from file, source hash and occurrence index. */
function newId(file: string, units: SourceUnit[], i: number, used: Set<string>): string {
  const occurrence = units.slice(0, i).filter((u) => u.hash === units[i].hash).length;
  let salt = 0;
  let id: string;
  do {
    id = 'u' + fnv1a(`${file}\u0000${units[i].hash}\u0000${occurrence}\u0000${salt++}`).slice(0, 6);
  } while (used.has(id));
  used.add(id);
  return id;
}

/** Number of distinct reviewers that count (only while the source is unchanged). */
export function reviewCount(u: SyncedUnit): number {
  if (u.status !== 'current') return 0;
  return new Set((u.stored?.reviews ?? []).map((r) => r.by)).size;
}

export function displayStatus(u: SyncedUnit): DisplayStatus {
  if (u.status === 'missing') return 'missing';
  if (u.status === 'stale') return 'stale';
  return reviewCount(u) > 0 ? 'reviewed' : 'machine';
}

/**
 * The translation file that `translate` writes: one entry per current source
 * unit in order. Stale entries keep their old hash, source and text (so the
 * translator sees what changed) until replaced.
 */
export function toTFile(file: string, lang: string, synced: SyncedUnit[]): TFile {
  return {
    source: file,
    lang,
    units: synced.map((u) => {
      if (u.stored) return u.stored;
      return blankUnit(u);
    }),
  };
}

export function blankUnit(u: SyncedUnit): TUnit {
  const s = u.src;
  const t: TUnit = { id: u.id, kind: s.kind, 'source-hash': s.hash };
  // Key order in the file comes from tfile.ts.
  if (s.section) t.section = s.section;
  if (s.cell) t.cell = s.cell;
  if (s.field) t.field = s.field;
  t.source = s.source;
  t.reviews = [];
  return t;
}

/** A fresh translation of a unit (from `translate`): new text, reviews cleared. */
export function translatedUnit(u: SyncedUnit, text: string, origin: TUnit['origin']): TUnit {
  const t = blankUnit(u);
  t.text = text;
  t.origin = origin;
  t.reviews = [];
  return t;
}
