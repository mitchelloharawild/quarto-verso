// Hashing on normalised text, never on host AST shapes.

const encoder = new TextEncoder();

/** 32-bit FNV-1a as 8 hex digits. */
export function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (const byte of encoder.encode(s)) {
    h ^= byte;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function normalise(s: string): string {
  return s.normalize('NFC').replace(/\s+/g, ' ').trim();
}

export function textHash(s: string): string {
  return fnv1a(normalise(s));
}

/** Code is hashed without normalising inner whitespace (indentation matters). */
export function codeHash(s: string): string {
  return fnv1a(s.normalize('NFC').replace(/[ \t]+$/gm, '').trim());
}
