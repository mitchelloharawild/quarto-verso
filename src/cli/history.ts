// Old source text from git history, for stale units of translated documents
// (whose tracking files keep only the source hash). Best effort: outside a git
// repository, or when no commit holds the text, nothing is found.

import { execFileSync } from 'node:child_process';
import { extractUnits } from '../core/units.ts';
import type { MarkdownAdapter } from '../core/types.ts';

const MAX_COMMITS = 100;

function git(cwd: string, args: string[]): string | undefined {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return undefined;
  }
}

/**
 * Source text for each wanted `source-hash`, from earlier committed versions of
 * `file` (newest first).
 */
export async function sourcesFromHistory(root: string, file: string, wanted: Set<string>, md: MarkdownAdapter): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  if (!wanted.size) return found;
  const log = git(root, ['log', `-n${MAX_COMMITS}`, '--format=%H', '--', file]);
  if (!log) return found;
  for (const commit of log.split('\n').filter(Boolean)) {
    const text = git(root, ['show', `${commit}:./${file}`]);
    if (text === undefined) continue;
    for (const u of (await extractUnits(text, md)).units) {
      if (wanted.has(u.hash) && !found.has(u.hash)) found.set(u.hash, u.source);
    }
    if (found.size === wanted.size) break;
  }
  return found;
}
