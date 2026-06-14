---
title: "The six-colour reference palette"
date: 2026-06-13
slug: six-colour-palette
tags: ["tartan", "colour", "oklab", "reference"]
---

The Dictionary names every pattern in a simplified six-colour vocabulary — white, black, red,
green, yellow, blue, *"the rest are shades of these six."* These are not screen primaries
(tartans are not woven in `#FF0000`); they are representative cloth shades, chosen to **maximise
discrimination** — to keep the colour distinctions that genuinely separate one tartan from
another and throw the rest away. This post re-anchors those six onto the [fine
grid](/posts/fine-grid/) and re-runs the experiment that picked them.

## The six, as grid points

Each colour is now a point on the fine grid, with a `level-ring-hue` address. Black and white
are *fixed*: black at the lattice black cap, white as the cream one level below the white cap.

| | colour | grid code | hue |
|---|---|---|---|
| **W** White | {{< c "#F7F7F7" >}} | `39-00` | — (near-white) |
| **K** Black | {{< c "#000000" >}} | `00-00` | — (black cap) |
| **R** Red | {{< c "#CC0000" >}} | `21-09-05` | 32° |
| **G** Green | {{< c "#006100" >}} | `17-06-15` | 142° |
| **Y** Yellow | {{< c "#F2BF00" >}} | `33-07-11` | 90° |
| **B** Blue | {{< c "#2A418A" >}} | `16-05-23` | 267° |

## Why these, and not others

Two searches were run against the grid and the full corpus of ~19,000 setts, and they agree.

**Black and white are the natural extremes.** Spread points across the dyeable space to maximise
separation and the first two it chooses are the black and white caps — they are literally the
farthest-apart pair. Fixing them does not override the geometry; it formalises it.

**Red, green and blue fall out on their own.** The next three points a max-min spread picks are
blue, red and green — almost exactly the old anchors. Independently, clustering the corpus's vivid
stripes by how much thread is dyed each colour gives the same three as its largest masses (green
35%, blue 31%, red 26%).

**Yellow is the cultural sixth.** Geometry does *not* volunteer yellow: its colours are light, so
a vivid yellow sits perceptually close to white, and white has already claimed that corner. The
maximally-distinct sixth colour would be a dark brown or a purple. Yellow earns its place in the
vocabulary because tartan uses it — it is a genuine, distinct dye cluster (about 8% of vivid
thread), just a smaller one than its neighbours. It is the colour the six keep for *recognition*
rather than for separation.

So the old hand-placed anchors turn out to be right where they should be: their hue positions are
confirmed by both the geometry and the cloth, and they are now exact lattice points rather than
free-floating values — the reference every shade is read against, and the precursor to a larger
mid-range palette of named colours.
