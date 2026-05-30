# Tartan Dictionary

The website for [tartandictionary.org](https://www.tartandictionary.org/) — a dictionary that
identifies tartans by their **pattern** (the design abstracted from exact thread counts and
shades) rather than by name, and orders the near-infinite space of patterns the way a kanji
dictionary orders characters by stroke count. Its mission is to support the living Scottish
Celtic tartan tradition.

The mission is in [`design/vision.md`](design/vision.md) and the full argument in
[`design/thesis.md`](design/thesis.md). It is an alpha-stage [Hugo](https://gohugo.io/) site
(theme: `simpleness`).

## Architecture

This repo is the **presentation layer** only. The engine that parses, normalises, classifies
and renders tartans lives in a separate Go module, [`tartan_data`][tartan_data], which
*generates* most of this site's content.

```d2
tartan_data: codeberg.org/hum3/tartan_data {
  shape: rectangle
  "cmd/import  -> SQLite": {}
  "cmd/enhance (normalise/classify)": {}
  "cmd/export  (templates)": {}
  "tartandb: parse · normalise · palette · render SVG": {}
}
tartan-dictionary: this repo {
  shape: rectangle
  "content/posts, about (hand-authored)": {}
  "content/tartans,variants,families,… (GENERATED)": {}
  "layouts · themes · static": {}
}
tartan_data -> tartan-dictionary: generates content
```

So: `content/{tartans,variants,families,stripes,patterns}/**` are **generated** by
`tartan_data/cmd/export` and must not be hand-edited. Only `content/posts/**`,
`content/about/`, `content/_index.md` and `design/**` are hand-authored. See
[`design/data-model.md`](design/data-model.md).

## Quickstart

```sh
task serve     # hugo dev server on 0.0.0.0
task build     # production build (hugo --minify)
task check     # build smoke test (hugo --gc --minify)
```

## Documentation

- [`design/thesis.md`](design/thesis.md) — the argument (canonical; posts express it).
- [`design/data-model.md`](design/data-model.md) — entities, normalisation, URL scheme.
- [`design/glossary.md`](design/glossary.md) — ubiquitous language.
- [`ROADMAP.md`](ROADMAP.md) — where this is going.

## Links

|                   |                                                                  |
| ----------------- | ---------------------------------------------------------------- |
| Site              | https://www.tartandictionary.org/                                |
| Source (Codeberg) | https://codeberg.org/hum3/tartan-dictionary *(remote setup pending — see ROADMAP Phase 7)* |
| Mirror (GitHub)   | https://github.com/drummonds/tartan-dictionary                   |
| Engine            | [`tartan_data`][tartan_data]                                     |

[tartan_data]: https://codeberg.org/hum3/tartan_data
