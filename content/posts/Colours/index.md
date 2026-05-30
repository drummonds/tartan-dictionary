---
title: "Tartan Colours"
date: 2023-01-22
lastmod: 2026-05-30
slug: colours
---

A dictionary needs a colour list because the *same* design is woven in many shades: you must
allow variation and still call it the same thread count. So the real question is not "what are
the colours" but "when are two shades the same colour" — a distance question, best asked in a
perceptually uniform space (OKLab), not in sRGB.

## Is the Tartan Registry list good enough?

The Register's list is the obvious starting point. Run through OKLab it turns out to be a list
of **131 example shades under 24 codes** (not 19), and as a *partition* of colour space it does
not hold up:

- **It overlaps itself.** 21% of its own shades sit closer to a different code's centroid than
  to their own — a fifth are mislabelled against the list's own logic.
- **Half its resolution is redundant.** 12 of the 24 code-centroids are within ΔE 0.10 of a
  neighbour — closer than "clearly a different colour". The list claims 24 distinctions and
  resolves about 12.
- **Its coverage is lumpy, and tellingly so.** The shades cluster on madder red, weld yellow,
  earth green and indigo blue — the natural-dye palette — and thin out at cyan and clean pink,
  the colours that need synthetic dyes. The list is a faithful record of *what was woven*, which
  is exactly why it is not a uniform grid.

So the Register list stays as the **source** of historical shades, but the dictionary's
classifier is a clean partition *derived* from it (OKLab centroids, Voronoi cells) rather than
the raw list. Regularising the Register's own 24 codes already classifies 79% of its shades into
their own code, so the majority still match the Register; the 21% that don't are its own
inconsistencies.

## How many colours, and how far apart?

There is no perceptually magic number — 6 (white, black, red, green, yellow, blue) and 11 are
special to *language* (Berlin & Kay's basic colour terms), not to the gamut. What a count costs
you is separation. Building a partition at each size and measuring the ΔE between neighbouring
colours (≥0.05 is "clearly a different colour"), spaced evenly versus weighted to the dyes:

| colours | even spacing, min ΔE | dye-weighted, min ΔE |
| ------: | -------------------: | -------------------: |
| 6  | 0.34 | 0.20 |
| 11 | 0.24 | 0.17 |
| 25 | 0.16 | 0.10 |

6 and 11 sit far above the confusion floor; by 25 the colours are only twice "clearly
different" apart, so ~25 is about the ceiling. The two columns differ because **even spacing
wastes cells on cyan and clean pink — colours no vegetable dye reaches** — while weighting to
the dyes spends the budget on the madder reds, indigo blues and earth greens that tartan
actually used. That bias is deliberate: the colours should resolve the cloth, not the gamut. The
full reasoning, with the naming scheme, is in the design notes (`design/colour.md` in the source
repository).

## The full Tartan Registry colour list

Corrected for errors as of 2023-01-23:

{{< colour_table >}}

## Colour conversion sites from Pantone to sRGB

Pantone don't publish all their colours on the web so require you to log into their web site.
There are a number of sites on the web that puport to offer Pantone colours but they seem to
be off from the ones the Pantone do advertise, eg Pantone 2728 C. They also don't tend to
specify if they are uncoated or coated colours.

[ediy][] reports the exact same colours that [Pantone-colours][] do. They seem closer to the uncoated Pantone colours
but still quite a bit different. The following seem to have different values [qconv][] and [Ramweb][]

[qconv]: https://qconv.com/en/convert-pantone-to-rgb
[ediy]: https://www.ediy.co.nz/pantone-to-rgb
[ramweb]: http://www.ramwebsolutions.com/colors/pantone.php
[pantone-colours]: http://www.pantone-colours.com/

| Colour       | [qconv][]           | [Ramweb][]          | [Pantone-colours][] |
| ------------ | ------------------- | ------------------- | ------------------- |
| Pantone 160  | {{< c "#AF4200" >}} | {{< c "#9E5205" >}} | {{< c "#9E540A" >}} |
| Pantone 180  | -                   | -                   | {{< c "#C13828" >}} |
| Pantone 654  | -                   | -                   | {{< c "#0F2B5B" >}} |
| Pantone 543  | -                   | -                   | {{< c "#93B7D1" >}} |
| Pantone 364  | -                   | -                   | {{< c "#3A7728" >}} |
| Pantone 2728 |                     |                     | {{< c "#3044b5" >}} |

[e-paint]: https://www.e-paint.co.uk/lab-hlc-rgb-lrv-values.asp
[theembroiderynerd]: https://theembroiderynerd.com/pantone-thread-chart/

[e-paint][] seems a much better website with matching for a variety of different colour systems. Note the [theembroiderynerd][] also seems to have
colours that match the C versions.

Pantone publish 2728C as {{< c "#0047bb" >}} on [their website] (as of 2023-02-15)

[their website]: https://www.pantone.com/pantone-connect

| Colour | Uncoated            | Coated              |
| ------ | ------------------- | ------------------- |
| 160    | {{< c "#A16A47" >}} | {{< c "#A5551D" >}} |
| 180    | {{< c "#C26158" >}} | {{< c "#C23C33" >}} |
| 2728   | {{< c "#4f69c1" >}} | {{< c "#0047bb" >}} |
| 654    | {{< c "#55688B" >}} | {{< c "#003A70" >}} |
| 543    | {{< c "#79AAD2" >}} | {{< c "#A4C7E2" >}} |
| 364    | {{< c "#5B794E" >}} | {{< c "#49762A" >}} |

Note these colours are using the sRGB conversion system used is IEC 61966:2-1 1999 D50 adapted which may differ from other conversions.

I am planning where possible to use the C versions of colours, where pantone colours are stated.
