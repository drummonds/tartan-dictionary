---
title: "Neighbourhood maps — a flat picture of a many-dimensional space"
date: 2026-07-12
slug: neighbourhood-maps
tags: ["ΔTartan", "nearest tartans", "neighbourhood map", "pca", "data"]
---

Under the **nearest tartans** table, many pages in the Dictionary carry a small scatter — the
**neighbourhood map**. Every grey dot is a cloth in the corpus, the red dot is the cloth whose
page you are on, and the blue dots are its nearest neighbours. This post explains what the map
is, and — just as important — what it is not.

## Where the dots come from

[ΔTartan]({{< ref "DeltaTartan" >}}) describes each cloth by a bundle of measured features — its
colour ladder, its proportions, how its sequence jogs against others — and measures the distance
between two cloths in that **feature space**. That space has many dimensions: two tartans can
differ in ground colour, in the shade of one overstripe, in the count of a band, in the order
the colours cycle, in scale, each an axis of its own.

A page is flat, so the map has to squash all of that into two. It uses the standard trick —
**principal component analysis** (PCA): find the direction along which the corpus varies most,
then the second-most at right angles to it, and place every cloth by those two coordinates
alone.

## Half the story, by design

The caption under each map states how much of the corpus's variance the two plotted components
carry — typically **around half**. That is not a defect to be tuned away; it is what flattening
a genuinely many-dimensional space costs. The other half of the variation lives in the
dimensions the picture had to drop.

Two consequences are worth keeping in mind when you read the map:

- **Close on the map does not always mean close in cloth.** Two dots can land near each other
  while sitting far apart along a dropped dimension — the projection folds distant points
  together, the way two towns on opposite sides of a hill can look adjacent from directly above.
- **The blue dots may not look like the red dot's nearest dots.** The neighbours are chosen by
  the **full** ΔTartan distance, in all dimensions — not by map distance. A blue dot that seems
  oddly far away on the map is usually a cloth whose similarity lives in the dimensions the
  picture cannot show.

The division of labour is deliberate: the **table** above the map ranks by the true distance
and is the thing to trust; the **map** gives the corpus a geography — which region of tartan
space a cloth lives in, whether its neighbourhood is dense (a well-trodden design) or sparse
(an outlier) — at the cost of precision.

## Reading it well

Treat the map as a locator, not a ruler. If the red dot sits in a tight grey cloud, the design
is one of a crowd; if it sits alone at an edge, the corpus holds little like it. Follow the
blue dots by clicking them, but judge their closeness by the ΔTartan numbers in the table, not
by the millimetres between dots. The map is one 2-D shadow of the space the Dictionary actually
searches — useful for orientation, silent about every dimension it had to leave out.
