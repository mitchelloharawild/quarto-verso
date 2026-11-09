// build: materialise each language as a mirror project, render it, copy it to
// <output>/<lang>, write review data, and add hreflang and the switcher.

import fs from 'node:fs';
import path from 'node:path';
import { failingCell, renderProject } from '../adapters/host.ts';
import { materialise, type Materialised, type PageUnit } from '../core/materialise.ts';
import { mergeStats, pageStats, pct, type PageStats } from '../core/score.ts';
import { documentShape } from '../core/skeleton.ts';
import { endonym, fill, languageName, uiStrings } from '../core/strings.ts';
import { validate, type Candidate } from '../core/validate.ts';
import type { SyncedUnit } from '../core/types.ts';
import { PROJECT_FILE, type FileState, type Project } from './project.ts';

export type Log = (msg: string) => void;

export function pageOf(file: string): string {
  return file.replace(/\.(qmd|md)$/, '.html');
}

function rel(fromPage: string, toPage: string): string {
  const r = path.posix.relative(path.posix.dirname(fromPage), toPage);
  return r || path.posix.basename(toPage);
}

/** Validate every translation that would be shown; returns `${file}#${id}` → reason. */
export async function validateStates(p: Project, states: FileState[]): Promise<Map<string, string>> {
  const cands: Candidate[] = [];
  const onStale = p.tc['on-stale'] ?? 'source';
  for (const st of states) {
    for (const u of st.synced) {
      const t = u.stored;
      if (!t) continue;
      if (u.status === 'current') {
        cands.push({ id: `${st.file}#${u.id}`, src: u.src, text: t.text });
      } else if (u.status === 'stale' && onStale === 'previous' && u.src.kind === 'block' && t.text && t.source) {
        // The previous translation is checked against the previous source.
        cands.push({ id: `${st.file}#${u.id}`, src: { ...u.src, source: t.source }, text: t.text });
      }
    }
  }
  return validate(cands, p.md);
}

function forFile<T>(m: Map<string, T>, file: string): Map<string, T> {
  const out = new Map<string, T>();
  for (const [k, v] of m) if (k.startsWith(file + '#')) out.set(k.slice(file.length + 1), v);
  return out;
}

function symlinkOrCopy(target: string, link: string): void {
  try {
    fs.symlinkSync(path.relative(path.dirname(link), target), link);
  } catch {
    fs.cpSync(target, link, { recursive: true });
  }
}

function hasSources(abs: string): boolean {
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    if (e.isDirectory() ? hasSources(path.join(abs, e.name)) : /\.(qmd|md)$/.test(e.name)) return true;
  }
  return false;
}

/** Recreate the mirror's directory skeleton: links to everything except documents and config. */
function prepareMirror(p: Project, lang: string, mirror: string, sources: Set<string>): void {
  fs.mkdirSync(mirror, { recursive: true });
  const outName = path.basename(p.outputDir);
  for (const e of fs.readdirSync(mirror)) {
    if (e === outName || e === '.quarto') continue;
    fs.rmSync(path.join(mirror, e), { recursive: true, force: true });
  }
  const skip = new Set([PROJECT_FILE, '_i18n', outName, '.quarto', '_freeze', '.git', 'node_modules', '.Rproj.user']);
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(path.join(p.root, dir), { withFileTypes: true })) {
      const relPath = dir ? `${dir}/${e.name}` : e.name;
      if (!dir && skip.has(e.name)) continue;
      const src = path.join(p.root, relPath);
      const dst = path.join(mirror, relPath);
      if (e.isDirectory() && !e.name.startsWith('_') && hasSources(src)) {
        fs.mkdirSync(dst, { recursive: true });
        walk(relPath);
      } else if (!sources.has(relPath)) {
        symlinkOrCopy(src, dst);
      }
    }
  };
  walk('');
  const freeze = path.join(p.i18nDir, lang, '_freeze');
  fs.mkdirSync(freeze, { recursive: true });
  symlinkOrCopy(freeze, path.join(mirror, '_freeze'));
}

function mirrorConfig(p: Project, lang: string, proj: Materialised): string {
  const doc = p.configDocument();
  doc.setIn(['project', 'type'], p.type);
  const typeNode = (doc.getIn(['project'], true) as any)?.items?.find((it: any) => it.key?.value === 'type');
  if (typeNode?.value) typeNode.value.comment = null;
  doc.deleteIn(['project', 'output-dir']);
  for (const hook of ['pre-render', 'post-render']) {
    const v = doc.getIn(['project', hook]) as any;
    const list: string[] = v?.toJSON?.() ?? (typeof v === 'string' ? [v] : []);
    const kept = list.filter((s) => !/i18n\.mjs/.test(String(s)));
    if (kept.length) doc.setIn(['project', hook], kept);
    else doc.deleteIn(['project', hook]);
  }
  doc.delete('translate');
  doc.set('lang', lang);
  for (const u of proj.units) {
    if (u.text !== undefined && u.field) doc.setIn(u.field.split('.').map((k) => (/^\d+$/.test(k) ? Number(k) : k)), u.text);
  }
  const top = p.type;
  const siteUrl = doc.getIn([top, 'site-url']);
  if (typeof siteUrl === 'string') doc.setIn([top, 'site-url'], siteUrl.replace(/\/?$/, `/${lang}/`));
  doc.deleteIn([top, 'repo-actions']);
  // The installed extension path works inside the mirror (its _extensions is linked).
  const installed = path.join(p.root, '_extensions', 'quarto-i18n', 'tr.lua');
  const lua = fs.existsSync(installed) ? '_extensions/quarto-i18n/tr.lua' : path.join(p.extDir, 'tr.lua');
  const filters = (doc.get('filters') as any)?.toJSON?.() ?? [];
  doc.set('filters', [lua, ...filters.filter((f: string) => f !== lua)]);
  return `# Generated by quarto-i18n for ${lang}. Do not edit.\n` + doc.toString({ lineWidth: 0 });
}

function noticeMarkdown(p: Project, lang: string, stats: PageStats, page: string): string {
  const S = uiStrings(lang);
  const src = languageName(p.tc.source, lang);
  if (stats.translated <= 0.0001) {
    const original = '../'.repeat(page.split('/').length) + page;
    return `${fill(S.untranslated, { src })} [${S.viewOriginal.replace(/[[\]]/g, '\\$&')}](${original}){.tr-original}`;
  }
  const parts = [fill(S.notice, { src })];
  if (stats.full >= 0.999) parts.push(S.allReviewed);
  else if (stats.reviewed <= 0.0001) parts.push(S.noneReviewed);
  else {
    parts.push(fill(S.someReviewed, { p: pct(stats.reviewed) }));
    if (stats.full > 0.0001) parts[parts.length - 1] = parts[parts.length - 1].replace(/\.$/, ',') + ' ' + fill(S.fullReviewed, { p: pct(stats.full), n: stats.target });
  }
  if (stats.fallback > 0.0001) parts.push(fill(S.fallback, { p: pct(stats.fallback), src }));
  const original = '../'.repeat(page.split('/').length) + page;
  const toLink = (s: string) => s.replace(/[[\]]/g, '\\$&');
  return `${parts.join(' ')} [${toLink(S.viewOriginal)}](${original}){.tr-original} · [${toLink(S.review)}](?review=1){.tr-review-toggle}`;
}

export interface BuildReport {
  lang: string;
  pages: { file: string; stats: PageStats }[];
  rejected: Record<string, string>;
  reverted: string[];
  fallbackFiles: string[];
  stats: PageStats;
}

export async function buildLanguage(p: Project, lang: string, log: Log): Promise<BuildReport> {
  const mirror = path.join(p.i18nDir, 'build', lang);
  const files = p.sources();
  prepareMirror(p, lang, mirror, new Set(files));
  const states = await Promise.all(files.map((f) => p.state(lang, f)));
  const projState = await p.state(lang, PROJECT_FILE);
  const rejected = await validateStates(p, [...states, projState]);
  for (const [k, r] of rejected) log(`warning: ${k} shown in source language: ${r}`);
  const reverted = new Set<string>();
  const structureFallback = new Set<string>();
  const onStale = p.tc['on-stale'] ?? 'source';
  const results = new Map<string, Materialised>();
  const statsOf = new Map<string, PageStats>();

  const proj = materialise('', projState.synced, { lang, sourceLang: p.tc.source, onStale, rejected: forFile(rejected, PROJECT_FILE) });
  fs.writeFileSync(path.join(mirror, PROJECT_FILE), mirrorConfig(p, lang, proj));

  const writeDoc = async (st: FileState) => {
    const text = p.readSource(st.file);
    const page = pageOf(st.file);
    const rej = forFile(rejected, st.file);
    if (structureFallback.has(st.file)) for (const u of st.synced) rej.set(u.id, rej.get(u.id) ?? 'file failed the structure check');
    const opts = { lang, sourceLang: p.tc.source, onStale, rejected: rej, reverted: new Set([...reverted].filter((k) => k.startsWith(st.file + '#')).map((k) => k.slice(st.file.length + 1))) };
    // Two passes: stats need the units, the notice needs the stats.
    const first = materialise(text, st.synced, opts);
    const stats = pageStats(first.units, p.reviewTarget);
    // Thin pages (mostly source-language fallback) are published with noindex.
    const minCoverage = p.tc['min-coverage'] ?? 0.5;
    const extra: Record<string, unknown> = { i18n: { lang, notice: noticeMarkdown(p, lang, stats, page) } };
    if (stats.translated < minCoverage) extra['include-in-header'] = [{ text: '<meta name="robots" content="noindex">' }];
    const m = materialise(text, st.synced, { ...opts, meta: extra });
    // Structure check: same block structure as the source.
    if (!structureFallback.has(st.file)) {
      const [a, b] = await Promise.all([p.md.parseWithPositions(text), p.md.parseWithPositions(m.text)]);
      if (documentShape(a.blocks) !== documentShape(b.blocks)) {
        log(`warning: ${st.file}: structure differs from the source after translation; showing the source`);
        structureFallback.add(st.file);
        return writeDoc(st);
      }
    }
    fs.mkdirSync(path.dirname(path.join(mirror, st.file)), { recursive: true });
    fs.writeFileSync(path.join(mirror, st.file), m.text);
    results.set(st.file, m);
    statsOf.set(st.file, stats);
  };
  for (const st of states) await writeDoc(st);

  // Render, reverting failing translated cells.
  for (let attempt = 0; ; attempt++) {
    log(`rendering ${path.relative(p.root, mirror)}`);
    const r = await renderProject(mirror, (l) => {
      if (/^\s*(\[\s*\d+\/\d+\]|ERROR|WARN|Quitting|Error)/.test(l)) log('  ' + l.trim());
    });
    if (r.code === 0) break;
    const fc = failingCell(r.stderr);
    // knitr reports the file's basename; the label (unique per file) disambiguates.
    const st = fc && states.find((s) => (!fc.file || path.posix.basename(s.file) === path.posix.basename(fc.file)) && s.synced.some((u) => u.src.kind === 'code' && u.src.cell === fc.label));
    const unit = st && st.synced.find((u) => u.src.kind === 'code' && u.src.cell === fc!.label);
    const key = st && unit ? `${st.file}#${unit.id}` : '';
    if (!st || !unit || reverted.has(key) || attempt >= 5) {
      const lines = r.stderr.replace(/\x1b\[[0-9;]*m/g, '').split('\n').filter((l) => l.trim() && !/^\s+at /.test(l));
      throw new Error(`rendering ${lang} failed (${path.relative(p.root, mirror)}):\n${lines.slice(-15).join('\n')}`);
    }
    log(`cell ${fc!.label} in ${st.file} failed in ${lang}; reverting it to the source and retrying`);
    reverted.add(key);
    await writeDoc(st);
  }

  // Publish.
  const built = path.join(mirror, path.basename(p.outputDir));
  const dest = path.join(p.outputDir, lang);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(built, dest, { recursive: true });

  const repo = p.tc.review?.repo;
  const S = uiStrings(lang);
  for (const st of states) {
    const m = results.get(st.file)!;
    const page = pageOf(st.file);
    const data = {
      lang, sourceLang: p.tc.source, file: st.file, page,
      // "Edit on GitHub" opens the file that holds the text.
      tfile: p.storedPaths(lang, st.file)[0],
      original: '../'.repeat(page.split('/').length) + page,
      repo, dir: p.tc.review?.dir ?? '', service: p.tc.review?.service ?? null, target: p.reviewTarget,
      strings: S, stats: statsOf.get(st.file), units: m.units.map(slim),
    };
    const out = path.join(dest, page.replace(/\.html$/, '.tr.json'));
    if (fs.existsSync(path.dirname(out))) fs.writeFileSync(out, JSON.stringify(data));
  }
  const pages = files.map((f) => ({ file: f, stats: statsOf.get(f)! }));
  const report: BuildReport = {
    lang, pages, rejected: Object.fromEntries(rejected), reverted: [...reverted], fallbackFiles: [...structureFallback],
    stats: mergeStats(pages.map((x) => x.stats), states.map((s) => s.units.reduce((n, u) => n + u.source.length, 0)), p.reviewTarget),
  };
  fs.writeFileSync(path.join(mirror, 'i18n-report.json'), JSON.stringify(report, null, 2));
  return report;
}

function slim(u: PageUnit) {
  const { weight: _w, ...rest } = u;
  return rest;
}

// ---- HTML post-processing ----------------------------------------------------

const START = '<!-- quarto-i18n:start -->';
const END = '<!-- quarto-i18n:end -->';

function stripInjected(html: string): string {
  return html.replace(new RegExp(`${START}[\\s\\S]*?${END}\\n?`, 'g'), '');
}

function listHtml(dir: string, exclude: Set<string>, base = ''): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of fs.readdirSync(path.join(dir, base), { withFileTypes: true })) {
    const r = base ? `${base}/${e.name}` : e.name;
    if (!base && exclude.has(e.name)) continue;
    if (e.isDirectory()) {
      if (e.name !== 'site_libs') out.push(...listHtml(dir, exclude, r));
    } else if (e.name.endsWith('.html')) out.push(r);
  }
  return out;
}

/** hreflang alternates, the language switcher and review-data pointer, in every page. */
export function postProcess(p: Project, onlyPages?: string[]): void {
  const langs = p.tc.targets.map(String).filter((l) => fs.existsSync(path.join(p.outputDir, l)));
  const versions = [p.tc.source, ...langs];
  const exclude = new Set(langs);
  const pagesOf = new Map<string, Set<string>>();
  pagesOf.set(p.tc.source, new Set(listHtml(p.outputDir, exclude)));
  for (const l of langs) pagesOf.set(l, new Set(listHtml(path.join(p.outputDir, l), new Set())));
  const siteUrl: string | undefined = p.config[p.type]?.['site-url'];

  for (const v of versions) {
    const isSource = v === p.tc.source;
    const dir = isSource ? p.outputDir : path.join(p.outputDir, v);
    for (const page of pagesOf.get(v)!) {
      if (onlyPages && !(isSource && onlyPages.includes(page))) continue;
      const file = path.join(dir, page);
      let html = stripInjected(fs.readFileSync(file, 'utf8'));
      const here = isSource ? page : `${v}/${page}`;
      const href = (lang: string) => {
        const target = lang === p.tc.source ? page : `${lang}/${page}`;
        return siteUrl ? `${siteUrl.replace(/\/$/, '')}/${target}` : rel(here, target);
      };
      const available = versions.filter((l) => pagesOf.get(l)!.has(page));
      const head = [
        ...available.map((l) => `<link rel="alternate" hreflang="${l}" href="${href(l)}">`),
        `<link rel="alternate" hreflang="x-default" href="${href(p.tc.source)}">`,
        ...(isSource ? [] : [`<meta name="i18n-review-data" content="${path.posix.basename(page).replace(/\.html$/, '.tr.json')}">`]),
      ];
      html = html.replace('</head>', `${START}\n${head.join('\n')}\n${END}\n</head>`);
      const links = versions.map((l) => {
        const has = pagesOf.get(l)!.has(page);
        const target = has ? href(l) : (l === p.tc.source ? rel(here, 'index.html') : rel(here, `${l}/index.html`));
        const cur = l === v ? ' aria-current="page"' : '';
        return `<a class="tr-switcher-link" href="${target}" lang="${l}" hreflang="${l}"${cur}>${endonym(l)}</a>`;
      });
      const label = uiStrings(v).languages;
      const nav = `${START}\n<nav class="tr-switcher" aria-label="${label}">${links.join('')}</nav>\n${END}\n`;
      // Book and website sidebars and navbars; otherwise the top of the body.
      if (/<div class="sidebar-title[^"]*">[\s\S]*?<\/div>/.test(html)) html = html.replace(/(<div class="sidebar-title[^"]*">[\s\S]*?<\/div>)/, `$1\n${nav}`);
      else if (/<div class="sidebar-tools-main[^"]*">/.test(html)) html = html.replace(/(<div class="sidebar-tools-main[^"]*">)/, `${nav}$1`);
      else if (/<div class="quarto-navbar-tools[^"]*">/.test(html)) html = html.replace(/(<div class="quarto-navbar-tools[^"]*">)/, `$1${nav}`);
      else html = html.replace(/(<body[^>]*>)/, `$1\n${nav}`);
      if (!/tr-switcher-style/.test(html)) {
        html = html.replace('</head>', `${START}\n<style id="tr-switcher-style">${SWITCHER_CSS}</style>\n${END}\n</head>`);
      }
      fs.writeFileSync(file, html);
    }
  }
}

const SWITCHER_CSS = `.tr-switcher{display:flex;flex-wrap:wrap;gap:.25rem .75rem;font-size:.875rem;margin:.25rem 0 .5rem}` +
  `.tr-switcher-link{text-decoration:none}.tr-switcher-link[aria-current]{font-weight:600;text-decoration:underline;text-underline-offset:3px}`;

export async function buildAll(p: Project, langs: string[], log: (lang: string) => Log): Promise<BuildReport[]> {
  if (!fs.existsSync(p.outputDir)) throw new Error(`${path.relative(process.cwd(), p.outputDir)} not found: render the source site first (quarto render)`);
  const reports: BuildReport[] = [];
  for (const lang of langs) reports.push(await buildLanguage(p, lang, log(lang)));
  postProcess(p);
  return reports;
}

export type { SyncedUnit };
