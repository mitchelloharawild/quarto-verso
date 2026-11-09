// quarto-i18n CLI: translate | status | check | build | hook
//
// Run from a project directory (or pass --project <dir>):
//   node _extensions/quarto-i18n/i18n.mjs <command> [options]

import path from 'node:path';
import { renderMode } from '../adapters/host.ts';
import { buildAll, postProcess } from './build.ts';
import { checkPr, checkProject, formatChecks, formatFindings, formatStatus, readGitPr, status } from './check.ts';
import { findProjectRoot, Project } from './project.ts';
import { migrate, syncParallel } from './storage.ts';
import { applyWork, exportWork, workPath } from './translate.ts';

const HELP = `quarto-i18n: managed translations for Quarto projects

Usage: i18n <command> [options]

Commands
  translate            Write a work file of missing and stale units for a translator
                       (provider "external")
    --only missing     only units never translated
    --apply <file>     validate a filled-in work file and write the translation files
    --answers <file>   with --apply: merge a compact answers file first
  status [--json]      Units, review counts, stale and missing per file and language
  check                Author requirements, validation, glossary use, workflow warnings
    --base <ref> --head <ref> --author <login> [--branch <name>]
                       check a contribution between two git refs
  build [files]        Build language versions now (renders the mirror projects)
  hook                 post-render entry point (runs build on full renders only)
  sync                 Parallel storage: record translations edited in the documents
                       and rewrite them from the current source
    --by <login>       who made the edits (recorded as origin and review)
    --reset            also rewrite documents whose structure no longer matches
  migrate --to <yaml|parallel>
                       Convert all translations to the other storage

Options
  --lang fr,es         languages (default: translate.targets; env QUARTO_I18N_LANGUAGES)
  --project <dir>      project directory (default: nearest _quarto.yml)
`;

function parseArgs(argv: string[]) {
  const opts: Record<string, string | boolean> = {};
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=', 2);
      if (v !== undefined) opts[k] = v;
      else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') && !['json', 'help', 'reset'].includes(k)) opts[k] = argv[++i];
      else opts[k] = true;
    } else rest.push(a);
  }
  return { cmd: rest[0], args: rest.slice(1), opts };
}

const log = (prefix: string) => (m: string) => console.log(`[i18n${prefix ? ' ' + prefix : ''}] ${m}`);

async function main(): Promise<number> {
  const { cmd, args, opts } = parseArgs(process.argv.slice(2));
  if (!cmd || opts.help || cmd === 'help') {
    console.log(HELP);
    return 0;
  }
  const root = typeof opts.project === 'string' ? path.resolve(opts.project) : findProjectRoot();
  if (cmd === 'migrate') {
    if (opts.to !== 'yaml' && opts.to !== 'parallel') throw new Error('--to yaml or --to parallel');
    await migrate(root, opts.to, log(''));
    return 0;
  }
  const p = new Project(root);
  const lang = typeof opts.lang === 'string' ? opts.lang : undefined;

  switch (cmd) {
    case 'hook': {
      const mode = renderMode();
      const langs = p.languages(lang);
      if (!mode.full && !process.env.QUARTO_I18N_LANGUAGES) {
        // Keep existing language builds; refresh the switcher on re-rendered source pages.
        const outs = (process.env.QUARTO_PROJECT_OUTPUT_FILES ?? '').split('\n').filter(Boolean)
          .map((f) => path.relative(p.outputDir, path.resolve(root, f)).split(path.sep).join('/'));
        if (outs.length) postProcess(p, outs);
        log('')(`${mode.reason}: language builds skipped (full \`quarto render\` or \`i18n build\` builds them)`);
        return 0;
      }
      if (!langs.length) return 0;
      await buildAll(p, langs, log);
      log('')(`built ${langs.join(', ')}`);
      return 0;
    }
    case 'build': {
      if (args.length) console.warn('[i18n] building selected files is not supported yet; building whole languages');
      const reports = await buildAll(p, p.languages(lang), log);
      for (const r of reports) {
        log(r.lang)(`translated ${Math.round(r.stats.translated * 100)}%, reviewed ${Math.round(r.stats.reviewed * 100)}%, ${r.stats.stale} stale, ${r.stats.missing} missing, ${r.reverted.length} reverted cells`);
      }
      return 0;
    }
    case 'translate': {
      const provider = p.tc.backend?.provider ?? 'external';
      if (typeof opts.apply === 'string') {
        const r = await applyWork(p, path.resolve(opts.apply), log(''), typeof opts.answers === 'string' ? path.resolve(opts.answers) : undefined);
        for (const x of r.rejected) console.log(`  rejected ${x.key}: ${x.reason}`);
        for (const x of r.skipped) console.log(`  skipped ${x.key}: ${x.reason}`);
        return r.rejected.length ? 1 : 0;
      }
      if (process.env.CI) {
        console.error('[i18n] translate never runs in CI');
        return 1;
      }
      if (provider !== 'external') {
        console.error(`[i18n] provider "${provider}" is not implemented yet; use backend: {provider: external}`);
        return 1;
      }
      for (const l of p.languages(lang)) {
        const r = await exportWork(p, l, opts.only === 'missing' ? 'missing' : 'stale');
        log(l)(r.count ? `${r.count} items to translate in ${path.relative(process.cwd(), r.path)}` : 'nothing to translate');
      }
      return 0;
    }
    case 'status': {
      const rows = await status(p, p.languages(lang));
      console.log(opts.json ? JSON.stringify(rows, null, 2) : formatStatus(rows));
      return 0;
    }
    case 'check': {
      if (typeof opts.base === 'string') {
        const prefix = p.tc.review?.dir ? p.tc.review.dir.replace(/\/?$/, '/') : '';
        const pr = readGitPr(root, String(opts.base), String(opts.head ?? 'HEAD'), String(opts.author ?? ''), typeof opts.branch === 'string' ? opts.branch : undefined);
        if (!pr.author) throw new Error('--author is required');
        const res = await checkPr(p, pr, prefix);
        console.log(formatChecks(res));
        return res.every((r) => r.ok) ? 0 : 1;
      }
      const f = await checkProject(p, p.languages(lang));
      console.log(formatFindings(f));
      return f.some((x) => x.level === 'error') ? 1 : 0;
    }
    case 'sync': {
      const r = await syncParallel(p, p.languages(lang), { by: typeof opts.by === 'string' ? opts.by : undefined, reset: !!opts.reset }, log(''));
      for (const x of r.filter((x) => x.error)) console.log(`  ✖ ${x.lang} ${x.file}: ${x.error}`);
      if (!r.some((x) => x.changed || x.recorded.length || x.error)) log('')('nothing to sync');
      return r.some((x) => x.error) ? 1 : 0;
    }
    default:
      console.error(`unknown command ${cmd}\n\n${HELP}`);
      return 2;
  }
}

main().then(
  (code) => process.exit(code),
  (e) => {
    console.error(`[i18n] error: ${e instanceof Error ? e.message : e}`);
    if (process.env.QUARTO_I18N_DEBUG) console.error(e);
    process.exit(1);
  },
);

export { workPath };
