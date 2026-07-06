---
title: "ΔTartan: how far apart are two tartans?"
date: 2026-07-06
tags: ["ΔTartan", "sett", "nearest tartans", "drummond", "megginch", "data"]
---

Every cloth page in the Dictionary carries a **nearest tartans** table: the most similar cloths
in the whole corpus, each with a number in the ΔTartan column. This post explains what that
number measures — why a faded, two-hundred-year-old kilt sits a whisker from its own younger
self while two tartans that share most of their colours sit far apart.

## Judged the way a weaver would

A tartan is a small palette deployed in a strict order, and that is how ΔTartan reads it. Each
[sett]({{< ref "Tartan" >}}) becomes a **colour ladder**: its colours are grouped into hue
families (red, green, blue…), ranked dark-to-light within each family, and split by prominence
into the **ground** — the broad foundation colours that set the cloth's character — and the
**decoration** — the thin overstripes and dark accents laid over it.

To compare two setts, the Dictionary first re-reads the second cloth's stripes in the first
cloth's ladder — a deep charcoal-navy takes the role of the other's bright navy if it holds the
same rung of the blue family — and then counts the **jogs**: the fewest stripe edits (a recolour,
an added band, a removed band) that turn one sequence into the other, tried at every alignment,
so a sett recorded from the other end or from a different starting stripe costs nothing. Before
any of that, both setts are folded to one canonical form, so a source that wrote out the full
mirrored sett and one that wrote the half sett are read as the same recording; and the measure is
scale-free, so the same proportions woven at twice the thread count read identical.

The edit costs are a weaver's judgement, not a statistician's:

- an edit on a **ground** colour costs **1** — change the foundation and you have made a new
  tartan;
- an edit on a **decoration** stripe costs about **0.3** — overstripes come and go within one
  tartan's life, added by a weaver's flourish or lost in a coarse recording;
- **stripe-width drift** and the **ground ratio** — the balance between the two main colours,
  say red against green — add smaller fractional terms, so that geometry alone stays below 1;
- **shade travel** — how far each dye has drifted within its rung, measured perceptually — adds
  the smallest term of all, scaled so it can never carry a pair across the same-tartan line: it
  grades *within* the band, it never decides it.

## The same-tartan band: Δ < 1

Those costs are calibrated so that one line can be read off the number: **ΔTartan below 1 means
the same tartan**. Decoration changes, width drift, re-shading, fading, scale — everything a
single tartan does across two centuries of weavings — lands inside [0, 1). Only a change of
ground clears 1.

The worked example is the
[Drummond of Megginch collection]({{< ref "DrummondsOfMegginchCollection" >}}): eight recorded
weavings of one design — a plaid at roughly twice the kilt's scale, three kilts, a Victorian
child's kilt, even a carpet, in dye lots from bright Victorian reds to the deep, almost-charcoal
[1997 reweave]({{< ref "DrummondsOfMegginch1997Kilt" >}}). Every pair in the family reads at
**0.83 or less** — one tartan, as the family has always known. The starkest single reading: the
1849 kilt against its own faded outer face is **0.14**. Fading moved every dye in the cloth but
not a single stripe, and the number says exactly that — a little bit different, nowhere near a
different tartan. (Only a bit-identical recording reads 0.00; the deliberate deep re-dye of 1997
reads 0.30, twice the fade, still family.)

A distance built on colour statistics gets this badly wrong: it puts the kilt 1.4 from its own
faded face, and scatters the Megginch family out to 4.5 — further apart than many pairs of
genuinely different tartans. That is the failure ΔTartan was calibrated against.

The boundary behaves too. Wilson's 1819
[New Bruce]({{< ref "DrummondsNewBruce" >}}) — the sett sold as *Grant or Drummond*, the same
layout in a different colourway — reads 2.6 to 4.7 from the Megginch weavings: visibly kin,
never inside the band.

## Grading the far field

Past the calibrated range the edit count goes coarse. Once nearly every stripe differs, "fourteen
edits" against "twelve" is no longer a judgement a weaver would stand behind — both just mean
*not this tartan*. So in the far field the Dictionary changes instrument: distance is graded by
the cloths' overall colour and complexity statistics — ground shade, colourfulness, stripe
complexity, the same statistics that place each cloth on the neighbour map — proportioned onto
the jog scale so the two readings meet without a seam. The exact rule:

```
ΔTartan = w·J + (1 − w)·max(2.13·L, 1)

J = the ladder distance (the weighted jogs, width, ratio and shade terms)
L = the colour/complexity statistics distance
w = 1 up to J = 2, 0 from J = 4, blending smoothly between
```

Up to ΔTartan 2 the number *is* the weaver's reading, untouched. From 4 upward it is the
statistical grading, scaled to match. The floor of 1 inside the far term is deliberate: the
statistics may order the strangers, but only the ladder is ever allowed to pronounce two cloths
the *same tartan*.

## Where you meet the number

The nearest-tartans table on each cloth page lists neighbours out to ΔTartan 4 — the near ones at
full strength, anything past 2 progressively muted — with each cloth's sett drawn to the same
width under the page's own, so the comparison is made by eye as well as by number. The ΔTartan
figure itself is a link: it opens that neighbour in the tartan designer pinned against the cloth
you came from, so you can see exactly where the distance lives.

A short reading guide:

| ΔTartan | reading |
| --- | --- |
| 0 | the identical sett — another recording of the same dyes, or a pure change of scale |
| under 1 | the same tartan — shading, fading, dye lots, decoration or width variation |
| 1 – 2 | the grey zone — deep re-dyes and close structural kin; judged case by case |
| 2 – 4 | cousins — shared bones, different cloth |
| over 4 | strangers, ranked by overall look |

*The calibration study — the Megginch ground truth, the Grant/Drummond distance triangles, and
the fitted constants — lives in the engine's research notes (`research/delta-blend.md` in the
source repository) and is reproducible with the `deltablend` tool.*
