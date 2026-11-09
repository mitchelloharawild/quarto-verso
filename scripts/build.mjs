// Bundle src/cli/main.ts (and the yaml library) into the extension's single entry file.
import { build } from 'esbuild';

await build({
  entryPoints: ['src/cli/main.ts'],
  outfile: '_extensions/quarto-i18n/i18n.mjs',
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
