// Sealed values (AES-256-GCM): the reader's session and the OAuth state. The
// service keeps no database; the browser holds the sealed session.

import crypto from 'node:crypto';

export class Sealer {
  private key: Buffer;
  constructor(base64Key: string) {
    this.key = Buffer.from(base64Key, 'base64');
    if (this.key.length !== 32) throw new Error('VERSO_SESSION_KEY must be 32 bytes, base64 (openssl rand -base64 32)');
  }

  seal(value: unknown, purpose: string): string {
    const iv = crypto.randomBytes(12);
    const c = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    c.setAAD(Buffer.from(purpose));
    const body = Buffer.concat([c.update(JSON.stringify(value), 'utf8'), c.final()]);
    return Buffer.concat([iv, c.getAuthTag(), body]).toString('base64url');
  }

  /** undefined when tampered with, sealed for another purpose, or not a sealed value. */
  open<T>(sealed: string, purpose: string): T | undefined {
    try {
      const b = Buffer.from(sealed, 'base64url');
      const d = crypto.createDecipheriv('aes-256-gcm', this.key, b.subarray(0, 12));
      d.setAAD(Buffer.from(purpose));
      d.setAuthTag(b.subarray(12, 28));
      return JSON.parse(Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8')) as T;
    } catch {
      return undefined;
    }
  }
}

/** What the browser holds, sealed. */
export interface Session {
  /** GitHub user id and login, as of sign-in. */
  id: number;
  login: string;
  access: string;
  refresh?: string;
  expires?: number;
}
