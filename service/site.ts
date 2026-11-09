// The site repository as of its default branch: downloaded once per commit
// (tarball, App installation token with contents: read) and opened as a Project.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { Project } from '../src/cli/project.ts';
import { gh, type Installations } from './github.ts';

export interface Site {
  repo: string;
  defaultBranch: string;
  sha: string;
  /** Repository checkout (read-only snapshot). */
  dir: string;
  /** Path of the Quarto project inside the repository: '' or 'book/'. */
  prefix: string;
  project: Project;
  /** Origins allowed to submit (_i18n/_service.yml). */
  origins: string[];
  /** A file at the default branch, by path in the repository. */
  read(repoPath: string): string | undefined;
}

const REPO = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/;
const DIR = /^(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]*$/;

export class Sites {
  /** Latest commit per repository, re-checked after a short time. */
  private head = new Map<string, { sha: string; branch: string; at: number }>();
  private cacheDir: string;
  private reader: Installations;
  constructor(cacheDir: string, reader: Installations) {
    this.cacheDir = cacheDir;
    this.reader = reader;
  }

  async get(repo: string, dir = ''): Promise<Site> {
    if (!REPO.test(repo)) throw new Error('invalid repository name');
    if (!DIR.test(dir) || dir.split('/').includes('..')) throw new Error('invalid site directory');
    const token = await this.reader.token(repo);
    let h = this.head.get(repo);
    if (!h || Date.now() - h.at > 15_000) {
      const info = await gh(token, 'GET', `/repos/${repo}`);
      const c = await gh(token, 'GET', `/repos/${repo}/commits/${encodeURIComponent(info.default_branch)}`);
      h = { sha: c.sha, branch: info.default_branch, at: Date.now() };
      this.head.set(repo, h);
    }
    const root = path.join(this.cacheDir, repo, h.sha);
    if (!fs.existsSync(path.join(root, '.complete'))) await this.download(token, repo, h.sha, root);
    const prefix = dir ? dir.replace(/\/?$/, '/') : '';
    const projectDir = path.join(root, prefix);
    if (!fs.existsSync(path.join(projectDir, '_quarto.yml'))) throw new Error(`no _quarto.yml in ${repo}/${prefix}`);
    const project = new Project(projectDir);
    const read = (p: string) => {
      const f = path.resolve(root, p);
      return f.startsWith(root + path.sep) && fs.existsSync(f) && fs.statSync(f).isFile() ? fs.readFileSync(f, 'utf8') : undefined;
    };
    const conf = read(`${prefix}_i18n/_service.yml`);
    const origins = conf ? (parseYaml(conf)?.origins ?? []).map(String) : [];
    return { repo, defaultBranch: h.branch, sha: h.sha, dir: root, prefix, project, origins, read };
  }

  private async download(token: string, repo: string, sha: string, root: string): Promise<void> {
    const r = await fetch(`https://api.github.com/repos/${repo}/tarball/${sha}`, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'verso-i18n-service', Accept: 'application/vnd.github+json' },
    });
    if (!r.ok) throw new Error(`could not download ${repo}@${sha.slice(0, 7)}: ${r.status}`);
    const tmp = `${root}.tmp-${process.pid}`;
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.mkdirSync(tmp, { recursive: true });
    execFileSync('tar', ['-xzf', '-', '--strip-components=1', '-C', tmp], { input: Buffer.from(await r.arrayBuffer()) });
    fs.writeFileSync(path.join(tmp, '.complete'), sha);
    fs.rmSync(root, { recursive: true, force: true });
    fs.renameSync(tmp, root);
    // Keep the three newest snapshots per repository.
    const parent = path.dirname(root);
    const old = fs.readdirSync(parent).filter((d) => !d.includes('.tmp-')).map((d) => ({ d, t: fs.statSync(path.join(parent, d)).mtimeMs })).sort((a, b) => b.t - a.t).slice(3);
    for (const { d } of old) fs.rmSync(path.join(parent, d), { recursive: true, force: true });
  }
}
