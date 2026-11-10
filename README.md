# quarto-verso <picture><source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg"><img src="assets/logo.svg" alt="verso logo" align="right" height="110"></picture>

A Quarto extension for translating a single-language project. Authors write
the source; translations are stored under `_i18n/`, built into `/<lang>/`
mirrors of the site, and improved by readers through pull requests.

Status: in development. Licence: MIT.

## Install

Requires Quarto 1.10 and Node 24.

```sh
quarto add mitchelloharawild/quarto-verso
```

```yaml
# _quarto.yml
verso-translate:
  source: en
  targets: [fr, es]
  review:
    repo: owner/name   # optional: reader reviews as pull requests
```

A full `quarto render` builds every language. `VERSO_TRANSLATE_LANGUAGES`
limits a render to some languages (`fr,es`) or none (`none`).

## Commands

Run `node _extensions/mitchelloharawild/verso/i18n.mjs <command>` from the project:

```sh
status                    # translation and review status per file
translate [--lang fr]     # write a work file for the translator
translate --apply <file>  # validate and store the translations
check [--lang fr]         # validate translations (CI: --base, --head, --author)
build [--lang fr]         # build languages without re-rendering the source
sync [--by <login>]       # record edits made to translated documents
```

## Leaving content untranslated

| Where | Option |
|-------|--------|
| Document front matter | `verso-translate: false` |
| Section, div or heading | `{verso-translate=false}` |
| Span | `[Name]{verso-translate=false}` |
| Cell captions | `#| verso-translate: false` |

## Review service

Reader submissions go through the shared service at
`https://verso.nectric.com.au`; see [`service/README.md`](service/README.md) to
set up a site or run your own instance.

## Development

```sh
npm install
npm run typecheck && npm test && npm run build
```
