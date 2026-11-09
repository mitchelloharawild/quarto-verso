// Bundle an entry point (and the yaml library) into a single file.
//   node scripts/build.mjs            the extension (_extensions/verso/i18n.mjs)
//   node scripts/build.mjs --service  the PR service (service/dist/server.mjs)
import { build } from 'esbuild';

const service = process.argv.includes('--service');

await build({
  entryPoints: [service ? 'service/server.ts' : 'src/cli/main.ts'],
  outfile: service ? 'service/dist/server.mjs' : '_extensions/verso/i18n.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  banner: {
    js: [
      '// quarto-i18n: built from src/ by scripts/build.mjs. Do not edit.',
      "import { createRequire as __i18nCreateRequire } from 'node:module';",
      'const require = __i18nCreateRequire(import.meta.url);',
    ].join('\n'),
  },
  legalComments: 'none',
  logLevel: 'info',
});
