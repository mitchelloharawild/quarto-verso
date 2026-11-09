// Project model: config, sources, translation files, glossaries. Node side.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml, parseDocument } from 'yaml';
import { pandocMarkdown } from '../adapters/markdown.ts';
import { parseLangGlossary, parseSourceGlossary, stringifyLangGlossary, termHashes } from '../core/glossary.ts';
import { parseTrack, readParallel, stringifyTrack, withPolicy, writeParallel, type ParallelRead } from '../core/parallel.ts';
import { syncUnits } from '../core/sync.ts';
import { parseTFile, stringifyTFile } from '../core/tfile.ts';
import { extractUnits, projectUnits, type Issue } from '../core/units.ts';
import { sourcesFromHistory } from './history.ts';
import type { GlossaryEntry, LangGlossaryEntry, MarkdownAdapter, SourceUnit, SyncedUnit, TFile, TranslateConfig } from '../core/types.ts';

/** Directory holding tr.lua and review.js (the installed extension). */
export function extensionDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  for (const c of [here, path.resolve(here, '../../_extensions/quarto-i18n')]) {
    if (fs.existsSync(path.join(c, 'tr.lua'))) return c;
  }
  throw new Error('cannot locate the quarto-i18n extension directory');
}

export const PROJECT_FILE = '_quarto.yml';
export const PROJECT_TFILE = '_project.yml';

export interface FileState {
  file: string;
  units: SourceUnit[];
  synced: SyncedUnit[];
  tfile?: TFile;
  issues: Issue[];
  /** Parallel storage: how the translated document was read. */
  parallel?: ParallelRead;
}

/** Reads a file by its path relative to the project root; undefined when absent. */
export type FileGetter = (rel: string) => string | undefined;

export class Project {
  readonly root: string;
  readonly config: any;
  readonly tc: TranslateConfig;
  readonly md: MarkdownAdapter;
  readonly extDir: string;
  private unitCache = new Map<string, { units: SourceUnit[]; issues: Issue[] }>();
  private historyCache = new Map<string, Map<string, string>>();

  constructor(root: string, opts: { storage?: 'yaml' | 'parallel' } = {}) {
    this.root = path.resolve(root);
    const cfgPath = path.join(this.root, PROJECT_FILE);
    if (!fs.existsSync(cfgPath)) throw new Error(`no ${PROJECT_FILE} in ${this.root}`);
    this.config = parseYaml(fs.readFileSync(cfgPath, 'utf8')) ?? {};
    const tc = this.config.translate;
    if (!tc || !tc.source || !Array.isArray(tc.targets)) throw new Error(`${PROJECT_FILE}: translate.source and translate.targets are required`);
    this.tc = opts.storage ? { ...tc, storage: opts.storage } : tc;
    this.extDir = extensionDir();
    this.md = pandocMarkdown();
  }

  get type(): 'book' | 'website' {
    return this.config.book ? 'book' : 'website';
  }

  get outputDir(): string {
    return path.join(this.root, this.config.project?.['output-dir'] ?? (this.type === 'book' ? '_book' : '_site'));
  }

  get i18nDir(): string {
    return path.join(this.root, '_i18n');
  }

  get reviewTarget(): number {
    return this.tc.review?.target ?? 2;
  }

  languages(filter?: string): string[] {
    const env = process.env.QUARTO_I18N_LANGUAGES;
    const want = filter ?? (env && env !== 'all' ? env : undefined);
    if (want === 'none') return [];
    const all = this.tc.targets.map(String);
    if (!want) return all;
    const sel = want.split(',').map((s) => s.trim());
    for (const l of sel) if (!all.includes(l)) throw new Error(`${l} is not in translate.targets`);
    return sel;
  }

  /** Source documents, relative to the root, in a stable order. */
  sources(): string[] {
    const out: string[] = [];
    const skip = new Set([path.basename(this.outputDir), 'node_modules', 'renv', 'venv', '.venv']);
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(path.join(this.root, dir), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (e.name.startsWith('_') || e.name.startsWith('.') || skip.has(e.name)) continue;
        const rel = dir ? `${dir}/${e.name}` : e.name;
        if (e.isDirectory()) walk(rel);
        else if (/\.(qmd|md)$/.test(e.name) && !/^(README|LICENSE|CHANGELOG)/i.test(e.name)) out.push(rel);
      }
    };
    walk('');
    return out;
  }

  tfilePath(lang: string, file: string): string {
    return path.join(this.i18nDir, lang, file === PROJECT_FILE ? PROJECT_TFILE : `${file}.yml`);
  }

  get storage(): 'yaml' | 'parallel' {
    return this.tc.storage === 'parallel' ? 'parallel' : 'yaml';
  }

  /** Parallel storage keeps documents as translated copies; the project file stays YAML. */
  isParallel(file: string): boolean {
    return this.storage === 'parallel' && file !== PROJECT_FILE;
  }

  /** The translated copy of a document (parallel storage). */
  docPath(lang: string, file: string): string {
    return path.join(this.i18nDir, lang, file);
  }

  rel(abs: string): string {
    return path.relative(this.root, abs).split(path.sep).join('/');
  }

  /** The files that hold a document's translation, relative to the root. */
  storedPaths(lang: string, file: string): string[] {
    const track = this.rel(this.tfilePath(lang, file));
    return this.isParallel(file) ? [this.rel(this.docPath(lang, file)), track] : [track];
  }

  private readonly disk: FileGetter = (rel) => {
    const p = path.join(this.root, rel);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : undefined;
  };

  /**
   * The translation of one document as stored, from disk or from another
   * version of the files (`get`, e.g. a PR branch). Parallel storage also
   * returns how the document was read.
   */
  async loadTFile(lang: string, file: string, get: FileGetter = this.disk): Promise<{ tfile?: TFile; parallel?: ParallelRead }> {
    const [first, second] = this.storedPaths(lang, file);
    try {
      if (!this.isParallel(file)) {
        const t = get(first);
        return { tfile: t === undefined ? undefined : parseTFile(t) };
      }
      const doc = get(first);
      const track = get(second);
      if (track === undefined) return {};
      if (doc === undefined) throw new Error(`${first} is missing (its tracking file exists)`);
      const r = await readParallel(doc, parseTrack(track), this.md);
      return { tfile: withPolicy(r), parallel: r };
    } catch (e) {
      throw new Error(`${this.isParallel(file) ? second : first}: ${(e as Error).message}`);
    }
  }

  /** The stored form of a translation: path (relative to the root) → content. */
  async serialise(t: TFile, raw?: Map<string, string>): Promise<Record<string, string>> {
    const paths = this.storedPaths(t.lang, t.source);
    if (!this.isParallel(t.source)) return { [paths[0]]: stringifyTFile(t) };
    const { units } = await this.units(t.source);
    const w = writeParallel(t.source, this.readSource(t.source), units, t, raw);
    return { [paths[0]]: w.doc, [paths[1]]: stringifyTrack(w.track, path.posix.basename(paths[0])) };
  }

  /**
   * Write a translation. With parallel storage, a translated document whose
   * structure no longer matches its tracking file is never overwritten (its
   * translations could not be carried over) unless `reset` is set.
   */
  async saveTFile(t: TFile, raw?: Map<string, string>, opts: { reset?: boolean } = {}): Promise<void> {
    if (this.isParallel(t.source) && !opts.reset) {
      const cur = await this.loadTFile(t.lang, t.source);
      const bad = cur.parallel?.issues.find((i) => i.kind === 'structure');
      if (bad) throw new Error(`${this.storedPaths(t.lang, t.source)[0]}: not written, ${bad.message}`);
    }
    for (const [rel, content] of Object.entries(await this.serialise(t, raw))) {
      const p = path.join(this.root, rel);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, content);
    }
  }

  glossary(): GlossaryEntry[] {
    const g = this.tc.glossary;
    if (!g) return [];
    if (typeof g === 'string') {
      const p = path.join(this.root, g);
      return fs.existsSync(p) ? parseSourceGlossary(parseYaml(fs.readFileSync(p, 'utf8'))) : [];
    }
    return parseSourceGlossary(g);
  }

  langGlossaryPath(lang: string): string {
    return path.join(this.i18nDir, lang, '_glossary.yml');
  }

  langGlossary(lang: string): Record<string, LangGlossaryEntry> {
    const p = this.langGlossaryPath(lang);
    return fs.existsSync(p) ? parseLangGlossary(fs.readFileSync(p, 'utf8')) : {};
  }

  writeLangGlossary(lang: string, g: Record<string, LangGlossaryEntry>): void {
    const p = this.langGlossaryPath(lang);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, stringifyLangGlossary(lang, g));
  }

  readSource(file: string): string {
    return fs.readFileSync(path.join(this.root, file), 'utf8');
  }

  async units(file: string): Promise<{ units: SourceUnit[]; issues: Issue[] }> {
    if (!this.unitCache.has(file)) {
      if (file === PROJECT_FILE) this.unitCache.set(file, { units: projectUnits(this.config), issues: [] });
      else this.unitCache.set(file, await extractUnits(this.readSource(file), this.md));
    }
    return this.unitCache.get(file)!;
  }

  async state(lang: string, file: string): Promise<FileState> {
    const { units, issues } = await this.units(file);
    const { tfile, parallel } = await this.loadTFile(lang, file);
    const synced = syncUnits(file, units, tfile, { termHashes: termHashes(this.glossary(), this.langGlossary(lang)) });
    if (parallel) await this.recoverSources(file, synced);
    return { file, units, synced, tfile, issues, parallel };
  }

  /**
   * Tracking files keep no source text; stale translations get their old source
   * back from git history (for retranslation and `on-stale: previous`).
   */
  private async recoverSources(file: string, synced: SyncedUnit[]): Promise<void> {
    const need = synced.filter((u) => u.status === 'stale' && u.stored?.text && u.stored.source === undefined);
    if (!need.length) return;
    const key = `${file}\u0000${need.map((u) => u.stored!['source-hash']).sort().join(',')}`;
    let found = this.historyCache.get(key);
    if (!found) {
      found = await sourcesFromHistory(this.root, file, new Set(need.map((u) => u.stored!['source-hash'])), this.md);
      this.historyCache.set(key, found);
    }
    for (const u of need) {
      const s = found.get(u.stored!['source-hash']);
      if (s !== undefined) u.stored = { ...u.stored!, source: s };
    }
  }

  /** All documents plus the project file. */
  allFiles(): string[] {
    return [PROJECT_FILE, ...this.sources()];
  }

  configDocument() {
    return parseDocument(fs.readFileSync(path.join(this.root, PROJECT_FILE), 'utf8'));
  }
}

export function findProjectRoot(start = process.cwd()): string {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, PROJECT_FILE))) return dir;
    const up = path.dirname(dir);
    if (up === dir) throw new Error(`no ${PROJECT_FILE} found from ${start}`);
    dir = up;
  }
}
