# Architecture

The project splits into a **presentation layer** and an **engine/data layer**.

- **Presentation** — today the Hugo site in this repo; the north star is a Go (HTMX + WASM)
  web app that serves the dictionary dynamically. Migrated strangler-fig (see
  [`ROADMAP.md`](../ROADMAP.md)); Hugo stays live until cutover.
- **Engine/data — `tartan_weaver`** (new Go module, [go-postgres](https://codeberg.org/hum3/go-postgres)).
  It owns three responsibilities:
  1. **Collection** — adapters that ingest tartans from external sources (Scottish Tartan
     Register, the GitHub tartan-database, the existing CSVs), normalising each into the
     domain model with provenance.
  2. **Historical storage** — go-postgres persistence of clans/families/tartans/variants/
     sources, keeping the *record-over-time*: a design's many weavings (Megginch 1820 plaid →
     1849 kilt → 1997 kilt), each a Variant with a Source and date.
  3. **Rendering** — a `Renderer` interface with several implementations (sett **strip** → 2-D
     **twill weave** → …), selectable per request.

`tartan_weaver` supersedes `tartan_data` (Go + SQLite). The valuable, tested domain logic
(parse, normalise, reduce, palette, the existing SVG renderer) ports across; the
sqlboiler/SQLite layer is replaced by go-postgres.

## Layering — one pure-Go stack, deployable both sides

Because [go-postgres](https://codeberg.org/hum3/go-postgres) (`pglike`) is pure Go — a
`database/sql` driver that runs PostgreSQL syntax over ncruces' WASM-built SQLite — the
**whole** stack, storage included, compiles and runs under `js/wasm`. (What blocks a WASM
build today is specifically `tartan_data`'s `modernc.org/sqlite`/`libc` dependency; moving to
go-postgres removes it.) So *where* a layer runs is a **deployment choice, not a compile
constraint**:

- **server-side** — the dynamic app holds the canonical data and renders/serves pages;
- **client-side** — the curated dataset can be shipped as a SQLite file into the browser, and
  the explorer can parse → query → render **entirely in WASM**, with no server round-trip.

The layering is therefore by **responsibility**:

```d2
direction: down
core: "core/  (pure — runs both sides)" {
  sett: "sett — threadcount · parse · normalise · reduce"
  palette: "palette — colours · distance"
  url: "url — parse / canonicalise (301 target)"
  render: "render — Renderer iface: strip · weave · …"
}
store: "store/  (go-postgres — server canonical, or read-only in browser)"
collect: "collect/  (server — Register · tartan-database · CSV ingest)"
cmd: "cmd/ — wasm (core + read-only store) · weaver (http) · import"
core -> store
core -> collect
core -> cmd
store -> collect
store -> cmd
```

**Rule:** `core/` stays pure and dependency-light. `collect/` is the ingest side (network,
writes the canonical store) and runs server-side. `store/` is go-postgres and can run either
side. The same Go serves the dynamic app and the in-browser explorer — one isomorphic stack;
`core/` never imports `collect/`.

## Renderers

```go
type Renderer interface {
    // RenderSVG returns a standalone <svg> string for the variant.
    RenderSVG(v *TartanVariant, opts Options) (string, error)
}
```

| Renderer | Output                              | Status                                      |
| -------- | ----------------------------------- | ------------------------------------------- |
| `strip`  | 1-D sett bar (the stripe sequence)  | port existing `ToSettSVG`, return a string  |
| `weave`  | 2-D plaid, 2/2-twill diagonal       | new                                         |
| (future) | realistic thread-level / raster     | later                                       |

The request (URL/query) selects the renderer: the strip is the default swatch, the weave the
full view.

## See also

- [thesis.md](thesis.md) — why structural identity; the virtual-vs-prepared distinction this
  layering implements.
- [data-model.md](data-model.md) — entities (the authoritative model is the engine code).
- [urls-and-crawlers.md](urls-and-crawlers.md) — the URL-preservation and crawl-safety invariants.
