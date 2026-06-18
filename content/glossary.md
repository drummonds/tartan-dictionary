---
title: Glossary
date: 2026-06-18
background: /bg/band.png
---

The ubiquitous language of the Tartan Dictionary — one concept, one name. The tiers run from the
loosest grouping down to a real piece of cloth: **bands → stripe pattern → sett → tartan → variant →
attestation**.

## The hierarchy

| Term | Meaning |
| --- | --- |
| **Band** | One colour of the six base colours (`R O Y G B` plus black/white/neutral) — the coarsest colour resolution. |
| **Bands** | A sett's colour sequence read in the six base colours, e.g. `KR`. The loosest "same design?" grouping; lives under [/bands/](/bands/). |
| **Stripe** | One run of a single colour within the sett — a colour code and an even thread count, e.g. `R14`. |
| **Stripe pattern** | A sett's colour sequence read in the ~25 named **human-palette** shades (Maroon, Navy, Bottle …), e.g. `DR R K`. Finer than bands; reduces to its bands by colouring each slot down. Lives under [/stripes/](/stripes/). |
| **Sett** | The complete repeating unit of a tartan — the structure (stripe order) in human colours with thread counts, dye- and loom-independent. The base unit is `1` and the overall scale rides as an `×N` multiplier on the sett, never on the tartan. |
| **Tartan** | A *named* design: a stripe pattern bound to a master (exemplar) sett, with family/clan and age. |
| **Variant** | One concrete colouring of a sett (sett + grid/idealised palette) — a record of the idea. |
| **Attestation** | A real, found instance of a sett — its measured colours, how it was woven, and the evidence for it. |

## Structure and notation

| Term | Meaning |
| --- | --- |
| **Thread count** | A sett written as a colour-and-count sequence, e.g. `R14 DB2 R4 …` — the band definitions (colour codes) interleaved with their thread counts. |
| **Pivot** | An end point of a reflective sett about which the pattern mirrors. Written with `/` in the Register notation. |
| **Reflective sett** | A sett that mirrors about its first and last pivots; it has defined end points. |
| **Repeating sett** | A sett that simply repeats, with no privileged start — any rotation is the same pattern. |
| **Palette** | The mapping from colour codes to concrete RGB colours. A normalised sett carries no palette of its own: its codes *are* the named human-palette shades. |
| **Normalisation** | Reducing an equivalent-but-differently-written sett to one canonical representative, so it can serve as an identity (the `/setts/` URL). |
| **Reduction** | Dividing a sett through by its GCD to its smallest integer proportion, to compare shape independent of absolute scale. |
| **Twill (2/2)** | The weave that offsets the over/under by one thread each row, giving tartan's diagonal structure. The dictionary covers only 2/2-twill, symmetric setts. |
| **Pattern** | *Historical / loose.* The old single "unit of meaning" tier; now split into the explicit **bands** (base-six) and **stripe pattern** (human-palette) tiers above. |

## People and provenance

| Term | Meaning |
| --- | --- |
| **Family** | A set of tartans associated with a family over more than a couple of generations. |
| **Seat** | The place a family takes its territorial designation from — a castle, tower house or house held long enough to name the line (e.g. Megginch, Drummond Castle). The *seat* is the family-to-place bond over time, distinct from the building itself. |
| **Source** | The provenance of a variant or attestation: a specific kilt, plaid, pattern book, or register entry. |

## The human palette

The named mid-range tier the stripe patterns are read in: the eleven Berlin & Kay basic colour
terms, their light/dark relatives, and the two between-hue variations **T** (Teal, blue-green) and
**M** (Magenta, purple-red). A `D_` prefix is the dark rung, `L_` the light rung.

<style>
  .hp-table td:first-child { font-family: ui-monospace, monospace; font-weight: 600; }
  .hp-sw { display: inline-block; width: 14px; height: 11px; border: 1px solid #0003; vertical-align: middle; margin-right: .4em; }
</style>

<table class="hp-table">
  <thead><tr><th>Code</th><th>Name</th><th>sRGB</th></tr></thead>
  <tbody>
    <tr><td>K</td><td><span class="hp-sw" style="background:#000000"></span>Black</td><td>#000000</td></tr>
    <tr><td>N</td><td><span class="hp-sw" style="background:#636363"></span>Grey</td><td>#636363</td></tr>
    <tr><td>W</td><td><span class="hp-sw" style="background:#F7F7F7"></span>White</td><td>#F7F7F7</td></tr>
    <tr><td>DR</td><td><span class="hp-sw" style="background:#55120C"></span>Maroon</td><td>#55120C</td></tr>
    <tr><td>R</td><td><span class="hp-sw" style="background:#D60020"></span>Red</td><td>#D60020</td></tr>
    <tr><td>LR</td><td><span class="hp-sw" style="background:#FF9C97"></span>Pink</td><td>#FF9C97</td></tr>
    <tr><td>DO</td><td><span class="hp-sw" style="background:#412714"></span>Brown</td><td>#412714</td></tr>
    <tr><td>O</td><td><span class="hp-sw" style="background:#A65C11"></span>Orange</td><td>#A65C11</td></tr>
    <tr><td>LO</td><td><span class="hp-sw" style="background:#FF9C34"></span>Peach</td><td>#FF9C34</td></tr>
    <tr><td>DY</td><td><span class="hp-sw" style="background:#3A2B0D"></span>Olive</td><td>#3A2B0D</td></tr>
    <tr><td>Y</td><td><span class="hp-sw" style="background:#8B6E00"></span>Yellow</td><td>#8B6E00</td></tr>
    <tr><td>LY</td><td><span class="hp-sw" style="background:#DCBC32"></span>Lemon</td><td>#DCBC32</td></tr>
    <tr><td>DG</td><td><span class="hp-sw" style="background:#053819"></span>Bottle</td><td>#053819</td></tr>
    <tr><td>G</td><td><span class="hp-sw" style="background:#008B2A"></span>Green</td><td>#008B2A</td></tr>
    <tr><td>LG</td><td><span class="hp-sw" style="background:#82D67A"></span>Lime</td><td>#82D67A</td></tr>
    <tr><td>DT</td><td><span class="hp-sw" style="background:#023535"></span>Petrol</td><td>#023535</td></tr>
    <tr><td>T</td><td><span class="hp-sw" style="background:#00879F"></span>Teal</td><td>#00879F</td></tr>
    <tr><td>LT</td><td><span class="hp-sw" style="background:#64D1D9"></span>Aqua</td><td>#64D1D9</td></tr>
    <tr><td>DB</td><td><span class="hp-sw" style="background:#082077"></span>Navy</td><td>#082077</td></tr>
    <tr><td>B</td><td><span class="hp-sw" style="background:#466CC8"></span>Blue</td><td>#466CC8</td></tr>
    <tr><td>LB</td><td><span class="hp-sw" style="background:#B5BBDE"></span>Sky</td><td>#B5BBDE</td></tr>
    <tr><td>DP</td><td><span class="hp-sw" style="background:#4B0B4F"></span>Aubergine</td><td>#4B0B4F</td></tr>
    <tr><td>P</td><td><span class="hp-sw" style="background:#AA2DBD"></span>Purple</td><td>#AA2DBD</td></tr>
    <tr><td>LP</td><td><span class="hp-sw" style="background:#E4A6DB"></span>Lilac</td><td>#E4A6DB</td></tr>
    <tr><td>M</td><td><span class="hp-sw" style="background:#CA047B"></span>Magenta</td><td>#CA047B</td></tr>
  </tbody>
</table>
