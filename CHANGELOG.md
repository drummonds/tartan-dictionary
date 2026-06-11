# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- "The Drummonds of Megginch Tartan Collection" post: the whole collection — 1820 plaid, 1849
  kilt and its faded face, c. 1890 child's kilt, 1967 carpet, 1997 kilt, 2022 proposal and 2023
  kilt — gathered with thread counts, measured shades and the woven-sample photographs.
- Printable collection posters: a `collection_poster` shortcode whose items weaver.js weaves on
  demand into a one-page poster (hero band + grid) at A4, A3 or A2; the per-variant print
  sample sheets gain A2 alongside A4/A3.
- The TTD (Total Tartan Dictionary) navigator at `/ttd/`, its own nav entry: the in-browser
  weaver, shade jogging, and the ΔTartan nearest-neighbour list + map now live there instead of
  piggybacking on variant pages; each neighbour opens either in the TTD or on its page.
- Per-page tartan backgrounds: every nav landing page names its cloth in `background:` front
  matter (home is the faded Falkirk, Scotland's first tartan); tiles woven seamlessly by
  tartan-weaver's `task site:assets` into `static/bg/`.
- Favicon: the Dictionary's own six-colour sett at `static/favicon.png` (the head partial's
  favicon condition also fixed — it never emitted before).
- Documentation backbone: `README.md`, `ROADMAP.md`, project `CLAUDE.md`.
- `design/` — canonical arguments: `thesis.md`, `data-model.md`, `glossary.md`.
- `task-plus.yml`; `check` task in `Taskfile.yaml`.

### Changed
- Same-cloth source records (identical canonical URL) are collapsed into one variant page with
  an Attestations section; the oldest record owns the page. Ends the run-to-run churn where
  duplicates raced for the same page directory (~1,700 pages flip-flopped per build), and drops
  the duplicate rows from stripe listings and the ΔTartan index (18,859 → 15,726 variants).
- Variant pages now link "⌗ Edit this in the TTD" (`/ttd/#slug=…`); the old `…/edit/` and
  `/setts/new/` addresses forward there. The 404 app-shell still weaves unknown sett URLs
  read-only.
- "Setts" left the navigation, usurped by the name search (placeholder now leads with
  tartans); `/setts/` keeps a small generated landing page as the address-space root.

## [0.1.0] - 2026-05-30

### Added
- Initial alpha Hugo site (theme `simpleness`): hand-authored posts on tartan history,
  colour, symmetry, thread counts, and the Drummond of Megginch case study.
- Generated taxonomy content (`tartans/`, `variants/`, `families/`, `stripes/`, `patterns/`)
  produced by the `tartan_data` engine.
