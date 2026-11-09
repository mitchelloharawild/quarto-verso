// Project model: config, sources, translation files, glossaries. Node side.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml, parseDocument } from 'yaml';
import { pandocMarkdown } from '../adapters/markdown.ts';
import { parseLangGlossary, parseSourceGlossary, stringifyLangGlossary, termHashes } from '../core/glossary.ts';
import { syncUnits } from '../core/sync.ts';
import { parseTrack, readDoc, stringifyTrack, withPolicy, writeDoc, type DocRead } from '../core/tdoc.ts';
import { parseTFile, stringifyTFile } from '../core/tfile.ts';
import { extractUnits, projectUnits, type Issue } from '../core/units.ts';
import { sourcesFromHistory } from './history.ts';
import type { GlossaryEntry, LangGlossaryEntry, MarkdownAdapter, SourceUnit, SyncedUnit, TFile, TranslateConfig } from '../core/types.ts';

/** Directory holding tr.lua and review.js (the installed extension). */
export function extensionDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  for (const c of [here, path.resolve(here, '../../_extensions/verso')]) {
    if (fs.existsSync(path.join(c, 'tr.lua'))) return c;
  }
  throw new Error('cannot locate the quarto-i18n extension directory');
}

export const PROJECT_FILE = '_quarto.yml';
/** The _quarto.yml block that configures translation. */
export const CONFIG_KEY = 'verso-translate';

/** The shared verso-i18n PR service, used when `review.service` is not set. */
export const DEFAULT_SERVICE = 'https://verso.nectric.com.au';

/** Quarto's default output directory per project type. */
const DEFAULT_OUTPUT: Record<string, string> = { book: '_book', website: '_site', manuscript: '_manuscript' };
export const PROJECT_TFILE = '_project.yml';

export interface FileState {
  file: string;
  units: SourceUnit[];
  synced: SyncedUnit[];
  tfile?: TFile;
  issues: Issue[];
  /** How the translated document was read (documents only, not the project file). */
  doc?: DocRead;
}

/** Reads a file by its path relative to the project root; undefined when absent. */
export type FileGetter = (rel: string) => string | undefined;

export class Project {
  readonly root: string;
  readonly config: any;
  readonly tc: TranslateConfig;
  readonly md: MarkdownAdapter;
  private unitCache = new Map<string, { units: SourceUnit[]; issues: Issue[] }>();
  private historyCache = new Map<string, Map<string, string>>();

  constructor(root: string) {
    this.root = path.resolve(root);
    const cfgPath = path.join(this.root, PROJECT_FILE);
    if (!fs.existsSync(cfgPath)) throw new Error(`no ${PROJECT_FILE} in ${this.root}`);
    this.config = parseYaml(fs.readFileSync(cfgPath, 'utf8')) ?? {};
    const tc = this.config[CONFIG_KEY];
    if (!tc || !tc.source || !Array.isArray(tc.targets)) throw new Error(`${PROJECT_FILE}: ${CONFIG_KEY}.source and ${CONFIG_KEY}.targets are required`);
    this.tc = tc;
    this.md = pandocMarkdown();
  }

  /** The installed extension (needed to build; the PR service never asks). */
  get extDir(): string {
    return extensionDir();
  }

  /**
   * The Quarto project type (book, website, manuscript, default, ...). The
   * extension adds no type of its own; the legacy `quarto-i18n` type was a book.
   */
  get type(): string {
    const t = this.config.project?.type;
    if (typeof t === 'string' && t !== 'quarto-i18n') return t;
    if (this.config.book || t === 'quarto-i18n') return 'book';
    return this.config.website ? 'website' : 'default';
  }

  get outputDir(): string {
    const out = this.config.project?.['output-dir'] ?? DEFAULT_OUTPUT[this.type];
    if (!out) throw new Error(`${PROJECT_FILE}: set project.output-dir (project type '${this.type}' has no default output directory)`);
    return path.join(this.root, out);
  }

  get i18nDir(): string {
    return path.join(this.root, '_i18n');
  }

  /**
   * The PR service the review tray submits to: `review.service`, else the
   * shared service when the site names a repository; null when off.
   */
  get reviewService(): string | null {
    const s = this.tc.review?.service;
    if (s === false || !this.tc.review?.repo) return null;
    return typeof s === 'string' && s ? s : DEFAULT_SERVICE;
  }

  get reviewTarget(): number {
    return this.tc.review?.target ?? 2;
  }

  languages(filter?: string): string[] {
    const env = process.env.VERSO_TRANSLATE_LANGUAGES;
    const want = filter ?? (env && env !== 'all' ? env : undefined);
    if (want === 'none') return [];
    const all = this.tc.targets.map(String);
    if (!want) return all;
    const sel = want.split(',').map((s) => s.trim());
    for (const l of sel) if (!all.includes(l)) throw new Error(`${l} is not in ${CONFIG_KEY}.targets`);
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

  /** The translated copy of a document. */
  docPath(lang: string, file: string): string {
    return path.join(this.i18nDir, lang, file);
  }

  rel(abs: string): string {
    return path.relative(this.root, abs).split(path.sep).join('/');
  }

  /**
   * The files that hold a translation, relative to the root: the translated
   * document and its tracking file, or the project file's translation file.
   */
  storedPaths(lang: string, file: string): string[] {
    const track = this.rel(this.tfilePath(lang, file));
    return file === PROJECT_FILE ? [track] : [this.rel(this.docPath(lang, file)), track];
  }

  private readonly disk: FileGetter = (rel) => {
    const p = path.join(this.root, rel);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : undefined;
  };

  /**
   * The translation of one document as stored, from disk or from another
   * version of the files (`get`, e.g. a PR branch). For a document, also how
   * the translated copy was read.
   */
  async loadTFile(lang: string, file: string, get: FileGetter = this.disk): Promise<{ tfile?: TFile; doc?: DocRead }> {
    const paths = this.storedPaths(lang, file);
    const track = paths[paths.length - 1];
    try {
      const t = get(track);
      if (t === undefined) return {};
      if (file === PROJECT_FILE) return { tfile: parseTFile(t) };
      const doc = get(paths[0]);
      if (doc === undefined) throw new Error(`${paths[0]} is missing (its tracking file exists)`);
      const r = await readDoc(doc, parseTrack(t), this.md);
      return { tfile: withPolicy(r), doc: r };
    } catch (e) {
      throw new Error(`${track}: ${(e as Error).message}`);
    }
  }

  /** The stored form of a translation: path (relative to the root) → content. */
  async serialise(t: TFile, raw?: Map<string, string>): Promise<Record<string, string>> {
    const paths = this.storedPaths(t.lang, t.source);
    if (t.source === PROJECT_FILE) return { [paths[0]]: stringifyTFile(t) };
    const { units } = await this.units(t.source);
    const w = writeDoc(t.source, this.readSource(t.source), units, t, raw);
    return { [paths[0]]: w.doc, [paths[1]]: stringifyTrack(w.track, path.posix.basename(paths[0])) };
  }

  /**
   * Write a translation. A translated document whose structure no longer
   * matches its tracking file is never overwritten (its translations could not
   * be carried over) unless `reset` is set.
   */
  async saveTFile(t: TFile, raw?: Map<string, string>, opts: { reset?: boolean } = {}): Promise<void> {
    if (t.source !== PROJECT_FILE && !opts.reset) {
      const cur = await this.loadTFile(t.lang, t.source);
      const bad = cur.doc?.issues.find((i) => i.kind === 'structure');
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
    const { tfile, doc } = await this.loadTFile(lang, file);
    const synced = syncUnits(file, units, tfile, { termHashes: termHashes(this.glossary(), this.langGlossary(lang)) });
    if (doc) await this.recoverSources(file, synced);
    return { file, units, synced, tfile, issues, doc };
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

/** Whether the project at `root` is set up for translation (has a `verso-translate:` block). */
export function hasTranslateConfig(root: string): boolean {
  const cfg = path.join(root, PROJECT_FILE);
  return fs.existsSync(cfg) && !!(parseYaml(fs.readFileSync(cfg, 'utf8')) ?? {})[CONFIG_KEY];
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
