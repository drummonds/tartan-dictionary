# Roadmap

Where the Tartan Dictionary is going. The mission and aims are in
[`design/vision.md`](design/vision.md); the *why* in [`design/thesis.md`](design/thesis.md);
the *how* in [`design/architecture.md`](design/architecture.md). In short: support the Scottish
Celtic tartan tradition, treat tartans as **patterns not thread counts**, support family
traditions, and — as a public good — connect people to makers. Built on a new Go engine,
`tartan_weaver` (go-postgres, isomorphic pure-Go stack that also runs in the browser via WASM),
migrating strangler-fig with the current Hugo site live until cutover.

## Done

- **Phase 1 — Documentation backbone:** README, CHANGELOG, project CLAUDE.md, task-plus.yml,
  and the `design/` set.

## Brick 0 — Direction & intent *(current focus)*

Get crisp on what the site is and who it is for, in both registers.

- **Documentation** — `design/{vision,thesis,architecture,data-model,glossary,urls-and-crawlers}.md`.
  *(Largely done; pending confirmation of the "pattern" framing.)*
- **Published material** — rewrite the home page (`content/_index.md`) and About to express the
  mission (welcome → support the tradition → tartans-as-patterns → ways in: explore / find your
  family tartan / get tartan goods), and align the posts (the refresh below) to the pattern
  thesis and glossary.

## Posts refresh

Make the published posts express `design/`: a mechanical pass (UK spelling, tighten, fix dead
links) then an editorial pass aligning each to the pattern thesis and cross-linking to `design/`.

## Build track — `tartan_weaver` *(deferred behind Brick 0; strangler-fig, Hugo stays live)*

- **Brick 1 — pure core (→ js/wasm):** parse · normalise · reduce-to-**Pattern** · palette ·
  strip renderer (returns a string) · URL parse/round-trip. TDD; `GOOS=js GOARCH=wasm` builds.
  This is the URL-driven WASM renderer.
- **Brick 2 — storage on go-postgres:** schema (clans/families/tartans/variants/sources;
  normalised thread count as natural key) + import the existing CSV/SQL data. Build the
  **golden-URL corpus** from `content/**` as a preservation fixture.
- **Brick 3 — weaver app:** serve `/tartans` and `/variants` dynamically with the
  301-to-canonical + noindex-virtual policy ([urls-and-crawlers.md](design/urls-and-crawlers.md));
  WASM renders the SVG; add the **weave** (2-D twill) renderer; runs alongside Hugo. Option:
  ship the curated dataset into the browser for a fully client-side explorer.
- **Brick 4 — collectors:** ingest the Scottish Tartan Register and the GitHub tartan-database
  into Postgres with provenance; dedupe by Pattern so one design collapses its many names.
- **Brick 5 — migrate & cut over:** move sections (families, then posts) off Hugo, preserving
  every URL (golden corpus test); cut `tartandictionary.org` over to `tartan_weaver`.
- **Ops:** task-plus release; go-postgres deploy; fix remotes (`origin` → Codeberg, `github`
  mirror); favicons and a logo that echoes the 2/2-twill weave; retire `tartan_data` and the
  Hugo generator once cutover holds.

## Outreach & public good

The non-software aims from [`design/vision.md`](design/vision.md).

- **Makers / suppliers directory** — a neutral, public-good signpost from tartans to the weavers
  and manufacturers who can make them, so people can get tartan goods from a choice of suppliers.
- **Falkirk weaving kit** — a beginner kit to weave the **Falkirk tartan** (the oldest Scottish
  sett: a 2/2 twill, ~W8 K8, in the National Museum of Scotland). Pitch to the **National Museum
  of Scotland shop**. Connects the tradition's origin to a hands-on product and supports a maker.

## Research threads

Open historical-data questions that would enrich the family/clan pages.

- **The 1822 "King's Jaunt" roll** — George IV's August 1822 visit to Edinburgh (stage-managed by
  Walter Scott) gathered the clans in their "tails". The open question is whether a usable
  *nominal* list of the ~5,000 Highlanders present can be assembled — almost certainly not as one
  document, but possibly from Celtic Society membership, individual clan muster/tail lists, and
  Scott's accounts. Feeds the clan-map and family pages (cf. `content/posts/ClanMap`). Note: the
  event was **1822**, not 1823/1820 — correct the Megginch family date at the engine when next
  regenerating.
