// Host adapter: binaries, render mode and nested renders (Quarto 1).

import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function which(cmd: string): string | null {
  for (const dir of (process.env.PATH ?? '').split(path.delimiter)) {
    for (const ext of process.platform === 'win32' ? ['.exe', '.cmd', ''] : ['']) {
      const p = path.join(dir, cmd + ext);
      try {
        if (fs.statSync(p).isFile()) return p;
      } catch { /* next */ }
    }
  }
  return null;
}

/** The quarto binary (QUARTO_BIN_PATH is set inside project scripts). */
export function quartoBin(): string {
  const env = process.env.QUARTO_BIN_PATH;
  if (env) {
    const p = path.join(env, process.platform === 'win32' ? 'quarto.exe' : 'quarto');
    if (fs.existsSync(p)) return p;
  }
  return which('quarto') ?? 'quarto';
}

/** Quarto's bundled pandoc, else `quarto pandoc`, else `pandoc` on the PATH. */
export function pandocCommand(): { cmd: string; args: string[] } {
  const q = quartoBin();
  if (q === 'quarto') {
    const pd = which('pandoc');
    if (pd) return { cmd: pd, args: [] };
  }
  try {
    const real = fs.realpathSync(q);
    const p = path.join(path.dirname(real), 'tools', process.platform === 'win32' ? 'pandoc.exe' : 'pandoc');
    if (fs.existsSync(p)) return { cmd: p, args: [] };
    const p2 = path.join(path.dirname(real), 'tools', process.arch === 'arm64' ? 'aarch64' : 'x86_64', 'pandoc');
    if (fs.existsSync(p2)) return { cmd: p2, args: [] };
  } catch { /* fall through */ }
  return { cmd: q, args: ['pandoc'] };
}

export function run(cmd: string, args: string[], input?: string, cwd?: string): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (d) => (stdout += d));
    child.stderr.setEncoding('utf8').on('data', (d) => (stderr += d));
    child.on('error', reject);
    child.on('close', (code) => resolve({ code: code ?? 1, stdout, stderr }));
    child.stdin.end(input ?? '');
  });
}

/** Is this post-render call part of a full project render (not preview, not one file)? */
export function renderMode(): { full: boolean; preview: boolean; reason: string } {
  const preview = underPreview();
  if (preview) return { full: false, preview, reason: 'quarto preview' };
  if (!process.env.QUARTO_PROJECT_RENDER_ALL) return { full: false, preview, reason: 'single-file render' };
  return { full: true, preview, reason: 'full render' };
}

function underPreview(): boolean {
  if (process.platform === 'win32') return false; // untested; use VERSO_TRANSLATE_LANGUAGES
  try {
    let pid = process.ppid;
    for (let i = 0; i < 6 && pid > 1; i++) {
      const out = execFileSync('ps', ['-o', 'ppid=,args=', '-p', String(pid)], { encoding: 'utf8' }).trim();
      const m = /^(\d+)\s+(.*)$/.exec(out);
      if (!m) break;
      if (/\bquarto(\.js)?\b.*\bpreview\b/.test(m[2])) return true;
      pid = Number(m[1]);
    }
  } catch { /* ps unavailable */ }
  return false;
}

/** Render a mirror project. Environment from the parent render is removed. */
export async function renderProject(dir: string, onLine?: (l: string) => void): Promise<{ code: number; stderr: string }> {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k.startsWith('QUARTO_PROJECT_')) delete env[k];
  return new Promise((resolve, reject) => {
    const child = spawn(quartoBin(), ['render'], { cwd: dir, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    const feed = (d: string) => {
      for (const l of d.split('\n')) if (l.trim()) onLine?.(l);
    };
    child.stdout.setEncoding('utf8').on('data', feed);
    child.stderr.setEncoding('utf8').on('data', (d) => {
      stderr += d;
      feed(d);
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code: code ?? 1, stderr }));
  });
}

/** The failing cell from a nested render's stderr (knitr or Jupyter). */
export function failingCell(stderr: string): { file?: string; label: string } | null {
  const plain = stderr.replace(/\x1b\[[0-9;]*m/g, '');
  let m = /Quitting from (?:lines \d+-\d+ \[([^\]]+)\] \(([^)]+)\)|([^\s:]+):\d+-\d+ \[([^\]]+)\])/.exec(plain);
  if (m) return m[1] ? { label: m[1], file: m[2] } : { label: m[4], file: m[3] };
  m = /Cell \d+\/\d+: '([^']+)'/.exec(plain);
  if (m) {
    const f = /(?:Starting|Executing) '?([^\s']+\.(?:qmd|ipynb))'?/.exec(plain);
    return { label: m[1], file: f?.[1] };
  }
  return null;
}
