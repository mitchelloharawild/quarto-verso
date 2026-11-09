# quarto-verso

A Quarto extension that manages translations of a single-language source. The
author writes only the source `.qmd` files and `_quarto.yml`. Translations are
produced locally, checked mechanically, built into `/<lang>/` mirrors of the
site, and improved by readers through reviewer mode and pull requests opened
by a GitHub App (in the style of giscus).

Status: in development. The GitHub App PR service is not built yet.

## Layout

| Path | What |
|------|------|
| `src/core/` | Pure library (no `node:*`): units, hashing, alignment, translated documents and tracking files, validation, materialise, glossary, contribution checks |
| `src/adapters/` | Pandoc (Markdown), Quarto host (binaries, render mode, nested render) |
| `src/cli/` | `translate`, `status`, `check`, `build`, `hook`, `sync` |
| `_extensions/verso/` | The installable extension: bundled `i18n.mjs`, `hook.ts`, `tr.lua`, `review.js`/`review.css` |
| `templates/i18n-check.yml` | GitHub Actions workflow for site repositories: checks contribution PRs |
| `test/` | `node --test` suite for the core |

## Requirements

Node 24 or later and Quarto 1.10. The tool itself needs no language runtime.

## Commands

Install into a project with `quarto add mitchelloharawild/quarto-verso`, which puts
the extension in `_extensions/mitchelloharawild/verso/`. Run commands from the
project directory: `node _extensions/mitchelloharawild/verso/i18n.mjs <command>`.

```sh
i18n status                         # units, reviews, stale and missing per file
i18n translate [--lang fr]          # work file for the translator (_i18n/_work/fr.json)
i18n translate --apply _i18n/_work/fr.json --answers _i18n/_work/fr.answers.json
i18n check [--lang fr]              # author requirements, validation, glossary, workflows
i18n check --base origin/main --head HEAD --author alice   # the 8 contribution checks (CI)
i18n build [--lang fr]              # build languages without re-rendering the source
i18n sync [--by <login>]            # record edits made in the translated documents
```

Each language keeps a translated copy of every document at
`_i18n/<lang>/<file>.qmd`, which translators can edit directly, next to a
tracking file `_i18n/<lang>/<file>.qmd.yml` with unit ids, hashes, origins and
reviews (no text). The project's own strings (`_quarto.yml`) are translated in
`_i18n/<lang>/_project.yml`.

The project keeps its own Quarto type (book, website, manuscript, ...), and the
only addition to `_quarto.yml` is the `verso-translate:` block:

```yaml
project:
  type: book

verso-translate:
  source: en
  targets: [fr, es]
```

The extension contributes its own post-render hook (`contributes: metadata:
project:` in `_extension.yml`), so installing it is the whole setup. Quarto
resolves the hook script, `hook.ts`, against the extension's folder and runs it
with its bundled Deno; the script runs `i18n.mjs hook` with Node. A full
`quarto render` then builds every language; preview and single-file renders
build the source only. Set `VERSO_TRANSLATE_LANGUAGES` to limit a render to some
languages (`fr,es`) or to none (`none`). The hook does nothing in projects without a
`verso-translate:` block. (The earlier `type: quarto-i18n` is still read as a book.)

### Leaving content untranslated

Every option the extension reads sits under the `verso-translate` key:

| Where | Option |
|-------|--------|
| A whole document (front matter) | `verso-translate: false` |
| A section, div or heading | `{verso-translate=false}`, e.g. `::: {verso-translate=false}` |
| A span inside a paragraph | `[Name]{verso-translate=false}` (kept verbatim) |
| An executable cell's captions | `#| verso-translate: false` |

## Development

```sh
npm install          # dev dependencies only (yaml, esbuild, typescript)
npm run typecheck && npm test && npm run build
```
