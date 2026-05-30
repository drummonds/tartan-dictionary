# URLs and crawlers

Two invariants the migration to a dynamic Go app must hold (see
[architecture.md](architecture.md)).

## Invariant 1 — every existing URL keeps working

The current URLs carry years of search-engine value, much of it pre-AI; losing them is not
acceptable. The dynamic app must serve or redirect every path the static site exposes.

- **Golden corpus.** Every path under `content/**` (and the built `public/**`) is a URL search
  engines already know. It becomes a regression fixture: the app must answer `200` or `301`
  for each. URL preservation is a passing test, not a hope.
- **Algorithmic URLs regenerate identically.** `/tartans/…` and `/variants/…` are computed
  from structure; porting the existing `ToHugoURL` canonicalisation (lowercase, trailing
  slash, slash-as-reflective-marker) reproduces them byte-for-byte.
- **Normalisation = 301 canonicalisation, for free.** Parse an incoming thread-count URL and
  normalise it; if the incoming form differs from canonical, `301` to canonical. This
  preserves the old link *and* consolidates link equity onto one page instead of splitting it
  across equivalent setts.
- **Editorial/taxonomy routes** (`/posts/…`, `/families/…`, `/about/`, `/stripes/…`) are a
  finite, enumerable set — mapped explicitly.

| Incoming URL                          | Response                       |
| ------------------------------------- | ------------------------------ |
| Known curated / enriched page         | `200`                          |
| Canonical virtual page                | `200` (noindex — see below)    |
| Non-canonical / legacy thread count   | `301` → canonical              |
| Unparseable                           | `404`                          |

## Invariant 2 — only curated pages are indexable; the virtual space is crawler-invisible

The library is near-infinite and served on the fly, so an unguarded crawler is an unbounded
cost and an index-pollution risk. The defence is the front page's *virtual vs prepared*
distinction made operational:

- **Curated / enriched pages** (those with clan/family history) are the only pages that are
  `index`-able, listed in `sitemap.xml`, and reachable by real `<a href>` links.
- **Virtual on-the-fly pages** carry `noindex,nofollow`, are excluded from the sitemap,
  `robots.txt`-disallowed on the deep parametric prefixes, and `rel=canonical` (for variants)
  back to their tartan.
- **The explorer's links are generated client-side in WASM**, so the combinatorial space is
  absent from static HTML — a crawler has nothing to follow into the trap, while a human
  explores freely.
- **Backstop:** a per-IP rate limit and a cheap-render budget on the dynamic render endpoint.

Net: humans reach everything; crawlers reach only the curated set.
