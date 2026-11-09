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
| `src/core/` | Pure library (no `node:*`): units, hashing, alignment, translation files, validation, materialise, glossary, contribution checks |
| `src/adapters/` | Pandoc (Markdown), Quarto host (binaries, render mode, nested render) |
| `src/cli/` | `translate`, `status`, `check`, `build`, `hook`, `sync`, `migrate` |
| `_extensions/quarto-i18n/` | The installable extension: bundled `i18n.mjs`, `tr.lua`, `review.js`/`review.css` |
| `templates/i18n-check.yml` | GitHub Actions workflow for site repositories: checks contribution PRs |
| `test/` | `node --test` suite for the core |

## Requirements

Node 24 or later and Quarto 1.10. The tool itself needs no language runtime.

## Commands

Run from a project directory: `node _extensions/quarto-i18n/i18n.mjs <command>`.

```sh
i18n status                         # units, reviews, stale and missing per file
i18n translate [--lang fr]          # work file for the translator (_i18n/_work/fr.json)
i18n translate --apply _i18n/_work/fr.json --answers _i18n/_work/fr.answers.json
i18n check [--lang fr]              # author requirements, validation, glossary, workflows
i18n check --base origin/main --head HEAD --author alice   # the 8 contribution checks (CI)
i18n build [--lang fr]              # build languages without re-rendering the source
i18n sync [--by <login>]            # parallel storage: record edits made in the documents
i18n migrate --to parallel|yaml     # convert translations to the other storage
```

A full `quarto render` builds every language through the project type's
`post-render` hook; preview and single-file renders build the source only.

## Development

```sh
npm install          # dev dependencies only (yaml, esbuild, typescript)
npm run typecheck && npm test && npm run build
```
