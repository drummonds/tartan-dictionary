# The argument

The canonical statement of *why* the Dictionary treats tartans the way it does. The published
posts express this; where they drift, this document wins and the posts are corrected. See
[vision.md](vision.md) for the broader mission, and [glossary.md](glossary.md) /
[data-model.md](data-model.md) for terms and entities.

## Two ways a tartan loses its identity

A tartan is usually pinned down in one of two ways, and both fragment a single design into many:

- **By name** — "Drummond of Megginch", "New Grant". A name records *attribution*, not the
  pattern; the same name has been woven to materially different setts, and near-identical
  patterns travel under different names.
- **By thread count** — the weavers' exact recipe, colour by colour, thread by thread. Precise
  and essential for *making* the cloth, but it treats every rescaling, re-colouring and copy as
  a different tartan. A plaid, a child's kilt and a modern re-weave of one design carry three
  different thread counts.

## The claim: the unit is the pattern, not the recipe

The Dictionary's distinctive — and deliberately delicate — departure from the weavers' world is
to identify and relate tartans at the level of the **pattern**: the design abstracted from exact
thread counts and exact shades. Two cloths share a pattern when, once absolute scale is set
aside and colours are reduced to their roles, they are the same design. Thread counts are the
shared *notation and raw material*; the pattern is what the Dictionary is *about*.

This is what lets the many weavings of one design — across centuries, mills and sizes — be
recognised as one design, which a thread-count catalogue cannot do.

## How a pattern is derived

The engine turns a thread count into a pattern by:

1. **Normalisation** — canonicalising an equivalent-but-differently-written sett to a single
   representative (reflective-vs-repeating, reversal and pivot choice all resolved), so a design
   has one form.
2. **Reduction** — dividing through to the smallest integer pattern (GCD) and bucketing
   near-equal stripe sizes (~45% tolerance), so absolute scale drops out.
3. **Colour-role abstraction** — mapping shades to their basic-colour roles, so re-colourings of
   one design collapse together.

(Specified and implemented in the engine — `ToPattern`, `Reduced`, `Normalised` — not
re-specified here.) The process is intentionally **lossy**: that is the feature, not a defect.

## The proof: Megginch is not Grant

Drummond of Megginch and Wilson's "New Bruce" / "New Grant" have been confused for ~180 years.
Compared as thread counts they look like near-duplicates or arbitrary variants. Seen as
**patterns**, they are distinct, and the distinction is a single structural relationship: the
ratio of the small azure square to the large square — ~85% in Grant, ~65% in Megginch (which
carries a larger green). That relationship holds across *all* the different thread-count weavings
of each design — which is exactly why the pattern level, not the recipe, is where identity lives.

## Ordering the patterns

Because the space of patterns is astronomically large, the Dictionary orders them structurally —
the way a kanji dictionary orders characters by stroke count — in three dimensions:

1. **Colour palette** — nested sets: 2 (black/white) → 6 (the colours common to nearly all
   languages: + blue, green, red, yellow) → 12 → the ~25 Scottish Tartan Register colours.
2. **Number of stripes** — in the pattern.
3. **Main colour and thickness** — the dominant colour by thread area, alphabetical on a tie.

## Scope

The core is the Scottish Celtic tradition: **2/2-twill, horizontally-and-vertically symmetric
setts**. Asymmetric patterns — which look similar and clutter name-based catalogues — are out of
scope. Holding the 2/2 twill constant is what makes the pattern a clean unit.
