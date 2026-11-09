// Positional alignment of stored units with the current source.

export type AlignOp =
  | { op: 'equal'; a: number; b: number }
  | { op: 'replace'; a: number; b: number }
  | { op: 'insert'; b: number }
  | { op: 'delete'; a: number };

/**
 * Align sequence `a` (stored) with `b` (current) by longest common subsequence
 * of keys. Between matches, deletions and insertions are paired in order as
 * replacements when `pairable` allows (same unit kind), so an edited paragraph
 * keeps its id and becomes stale instead of being dropped and re-added.
 */
export function align<T, U>(
  a: T[],
  b: U[],
  keyA: (x: T) => string,
  keyB: (x: U) => string,
  pairable: (x: T, y: U) => boolean = () => true,
): AlignOp[] {
  const n = a.length;
  const m = b.length;
  const ka = a.map(keyA);
  const kb = b.map(keyB);
  // LCS table, suffix form: L[i][j] = LCS of a[i..] and b[j..].
  const L: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      L[i][j] = ka[i] === kb[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    }
  }
  const ops: AlignOp[] = [];
  let i = 0;
  let j = 0;
  let dels: number[] = [];
  let ins: number[] = [];
  const flush = () => {
    // Pair deletions with insertions in order, by kind.
    const usedIns = new Set<number>();
    const pending: AlignOp[] = [];
    for (const d of dels) {
      const k = ins.find((x) => !usedIns.has(x) && pairable(a[d], b[x]));
      if (k !== undefined) {
        usedIns.add(k);
        pending.push({ op: 'replace', a: d, b: k });
      } else {
        pending.push({ op: 'delete', a: d });
      }
    }
    for (const x of ins) if (!usedIns.has(x)) pending.push({ op: 'insert', b: x });
    // Keep output ordered by position in b (deletes first).
    pending.sort((p, q) => posB(p) - posB(q));
    ops.push(...pending);
    dels = [];
    ins = [];
  };
  while (i < n || j < m) {
    if (i < n && j < m && ka[i] === kb[j]) {
      flush();
      ops.push({ op: 'equal', a: i, b: j });
      i++;
      j++;
    } else if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) {
      ins.push(j++);
    } else {
      dels.push(i++);
    }
  }
  flush();
  return ops;
}

function posB(op: AlignOp): number {
  return op.op === 'delete' ? -1 : op.b;
}
