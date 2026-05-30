# Colour

How the Dictionary treats colour identity. A colour **code** (R, DB, G …) is a *role* in a
[Pattern](glossary.md); a [Palette](glossary.md) maps each role to a concrete shade for one
[Variant](glossary.md). This document is the durable conceptual view; the colour logic —
conversion, distance, classification — is the contract in `tartan_data`. Where they disagree,
the code wins and this file is updated. See [thesis.md](thesis.md) for why the unit of meaning
is the Pattern, not the exact shades.

## Why colour is its own problem

A Pattern factors out exact shades and keeps colour *roles*; a Variant pins those roles to
actual cloth. The same role — "the dark blue" — is woven in dozens of shades across mills,
dye-lots and centuries. So the Dictionary must answer two perceptual questions the thread-count
notation alone cannot:

- **Rendering** — given only codes, what shade stands in for each role?
- **Classification** — given a measured shade (from a kilt photo or a dye recipe), which role
  is it, and *how far* can it move before it is honestly a different colour?

Both are distance questions, and distance is the whole difficulty: equal steps in sRGB are not
equal perceptual steps, so sRGB is the wrong space to measure in.

## OKLab is the working space

sRGB is for storage and display; **OKLab** (Ottosson 2020) is for distance. It is near
perceptually uniform, so colour difference is plain Euclidean distance — ΔE = √(ΔL²+Δa²+Δb²) —
and the cylindrical form **OKLCH** (lightness, chroma, hue) maps directly onto how cloth colour
is talked about: how light, how saturated, what hue. The transform from linear sRGB is a closed
form (two 3×3 matrices and a cube root), exact and reversible, so no colour library or lookup is
needed.

```d2
direction: right
sRGB:    "sRGB hex\n(storage · display)"
OKLab:   "OKLab / OKLCH\n(distance · classification)"
part:    "derived partition\n(roles · tolerance)"
sRGB -> OKLab: closed form (reversible)
OKLab -> part: Voronoi over centroids
```

Working ΔE scale in OKLab (L ranges 0–1). These are order-of-magnitude figures; the exact
threshold is being pinned down in the tolerance thread below:

| ΔE (OKLab) | meaning |
| ---------- | ------- |
| ~0.002 | near threshold — one just-noticeable difference |
| ~0.02 | comfortably visible side by side |
| ~0.05 | unambiguously a different colour |

## The Tartan Registry colour list, audited

The Register's published list is the obvious starting palette, and the [Colours
post](../content/posts/Colours/index.md) currently leans on it. Run through OKLab, our copy
(`data/TartanRegistryColours2022.json`) holds **131 sRGB entries across 24 codes** — not the 19
the post claims. The audit treats each code's OKLab centroid as its nominal colour and asks how
cleanly the named bins partition the space.

**It is a list of example shades, not a partition.** Three measurements:

- **The bins overlap.** Classifying every entry to its nearest code-centroid, **28 of 131 (21%)
  land in a *different* code's cell than the one they are labelled with** — e.g. `#0000CD`
  labelled Blue is nearer Dark Blue; `#505050` "Dark Grey" (coded N) is nearer Brown. A list
  that misfiles a fifth of its own members cannot serve as a classifier.
- **Half the resolution is redundant.** **12 of the 24 centroids sit within ΔE 0.10 of another
  centroid** — closer than the "unambiguously different" threshold. The list claims 24
  distinctions but perceptually resolves about half that. Intra-bin spread reaches ΔE 0.36
  (Blue) while neighbouring centroids are 0.065–0.20 apart: **the bins are wider than the gaps
  between them.**
- **Coverage is lumpy, and lumpy with a cause.** Chromatic entries per 30° OKLCH hue wedge:

  | hue | n | | hue | n |
  | --- | -: | --- | --- | -: |
  | red (0°) | 16 | | cyan (180°) | **2** |
  | orange (30°) | 6 | | blue (210°) | 5 |
  | yellow (60°) | 15 | | blue (240°) | 18 |
  | yellow-green (90°) | 11 | | violet (270°) | 5 |
  | green (120°) | 13 | | magenta (300°) | 9 |
  | green-cyan (150°) | 6 | | pink-purple (330°) | **2** |

  Plus 23 achromatic (grey/black/white). The peaks fall on madder/cochineal red, weld/heather
  yellow, the dark earth greens and indigo blue — the **natural-dye palette**. The holes are
  cyan and clean pink, the colours that need synthetic dyes. The historical warp of the dye
  space is visible directly in the distribution; the list is a faithful record of *what was
  woven*, which is exactly why it is not a uniform grid.

There is real structure underneath, though. The light/mid/dark prefixes form a genuine
**lightness ladder** — within every hue family the centroid L decreases monotonically (Blue
0.84 → 0.55 → 0.27). But the levels are not shared across families (Yellow's "mid" L 0.85 is
lighter than Red's "light" L 0.74), and hue drifts down the ladder (indigo darkens toward
violet: H 217° → 254° → 268°). So the list is implicitly **hue-family × lightness-level**, just
an uncalibrated one.

## Verdict: source, not partition

Keep the Register list as the empirical **source of historical shades** — it is the ground
truth for where tartan colour actually lives. Do **not** use it raw as the Dictionary's
classifier, because it overlaps itself (21%), over-claims its resolution (12/24 redundant) and
is deliberately non-uniform.

Instead **derive** a clean partition from it: take OKLab centroids from the registry samples so
the partition stays historically grounded, then define each cell by Voronoi assignment in OKLab.
Classification becomes unambiguous by construction (every shade has exactly one nearest
centroid), while the centroids still sit where the dyes historically sat. "Use my own version"
means this derived partition, not a palette invented from nothing. Regularising the registry's
own 24 codes into clean centroids already classifies **103 of 131 shades (79%) into their own
code** — the majority match the Register, and the remaining 21% are precisely the
self-inconsistent entries we are content to call misclassified.

## How many colours?

There is no perceptually privileged *n*. OKLab is continuous; fix a tolerance radius and *n*
falls out of it, with no value the space prefers. The special numbers are **linguistic**, from
Berlin & Kay's basic colour terms:

| n | set | status |
| -: | --- | --- |
| 6 | white, black, red, green, yellow, blue | the universal core (Berlin–Kay stage before brown) |
| 11 | + brown, orange, purple, pink, grey | the full basic-colour-term set |
| ~12 | — | what the registry actually *resolves* (24 centroids, half redundant) |
| 24 | the registry codes | an artisan list, over-claimed |

What *n* costs you in separation: building partitions at each count and measuring the
nearest-neighbour ΔE between cells (min = the tightest, most confusable pair; mean = typical
gap), two ways — spaced evenly over the whole displayable gamut, versus weighted to the dye
distribution (k-means over the registry shades):

| n | equal-spacing min ΔE | equal mean | dye-weighted min ΔE | dye-weighted mean | dye-weighted cell radius |
| -: | -: | -: | -: | -: | -: |
| 6  | 0.343 | 0.365 | 0.202 | 0.215 | 0.251 |
| 11 | 0.239 | 0.271 | 0.171 | 0.200 | 0.173 |
| 25 | 0.159 | 0.175 | 0.104 | 0.142 | 0.115 |

Read against the ΔE scale above (~0.05 = unambiguously different): 6 and 11 colours sit far
above the confusion floor either way. At **25 the dye-weighted min ΔE is 0.104** — only twice
the "clearly different" threshold — so **~25 is the practical ceiling**; pack more cells in and
neighbours start to merge. That is the same conclusion the redundancy count reached (24 codes,
~12 truly resolved) from the other direction.

So the honest framing for the post: **6 and 11 are special to language, not to the gamut.** The
registry's nominal 24 collapses to roughly 12–25 perceptually distinct cells, an artisan
compromise rather than a principled count. A defensible target is the 11 basic-term roles,
extended by a short lightness ladder only where the dye history earns the extra cell.

## Weight to the dyes, not to equal spacing

The equal-spacing and dye-weighted columns differ for a reason that matters. Equal spacing keeps
the widest gaps but spends cells on cyan and clean pink — regions **no vegetable dye reaches**,
so empty in tartan. Weighting to the dye distribution concentrates the same budget where colour
actually occurs, buying finer distinctions among the many madder reds, indigo blues and earth
greens at the cost of tighter spacing. For this Dictionary that is the right bias: the partition
should resolve the colours weavers used, not waste resolution on colours they could never make.

The bias shows up in *which cells exist*, not just where they sit. An unsupervised dye-weighted
6-set comes out as grey · red · cream · green · black · dark-blue — **not** the Berlin–Kay
white/black/red/green/yellow/blue — because the cloth holds more reds and blues than it holds
yellows, so a yellow cell only earns its place later. The linguistic categories and the dye
clusters genuinely disagree; we follow the dyes.

Concretely the weighting is the natural-dye sources: **madder / cochineal** (reds, hue ~20–30°),
**indigo / woad** (blues deepening toward violet, 215→270°), **weld / heather / lichen** (yellows
and yellow-greens, 60–100°), and the iron/tannin **earth darks** (the low-L greens and browns).
Hue wedges those dyes never fill — cyan (180°) and pink-purple (330°) — stay sparse by design.

## Colour roles: a regular, dye-ragged grid

The naming scheme is the registry's own structure, regularised: an achromatic ladder plus hue
families carrying a Light / mid / Dark lightness level. It is deliberately **ragged** — a family
gets the levels its dyes support, not a fixed three — which is the dye weighting expressed in the
names rather than the geometry:

| role | levels | codes | note |
| ---- | ------ | ----- | ---- |
| achromatic | white · grey · black | W · N · K | optional LN / DN |
| red | light · mid · dark | LR · R · DR | madder ladder, full |
| blue | light · mid · dark | LB · B · DB | indigo ladder, full — DB (navy) is core to tartan |
| green | light · mid · dark | LG · G · DG | weld-over-indigo + earth darks, full |
| yellow | light · mid · dark | LY · Y · DY | full |
| purple | light · mid · dark | LP · P · DP | full |
| orange | mid · dark | O · DO | dye-sparse, two levels |
| brown | light · mid | LT · T | dye-sparse, two levels |

That is ~22–24 roles ("25 or so"), every one an existing registry code, so the majority of
registry shades map straight onto it. Collapsing the lightness levels gives **11** (the seven hue
families + W · N · K, plus navy DB as the one lightness split tartan can't do without); dropping
to the Berlin–Kay core gives **6** (W · K · R · G · Y · B). One scheme, three resolutions, all
named consistently.

## Tolerance: two radii, not one

"How far can a shade be nudged before the colour has definitely changed" is not a single number.
A two-colour tartan exists to *show a difference*, which splits the question into two relations:

- **Strict change — *between* roles.** The colours of a sett must read as unambiguously
  different, or the pattern collapses to one colour. This is a separation *floor* `s`: two roles
  in one sett are distinct iff their perceptual ΔE ≥ s.
- **Nuanced shading — *within* a role.** Each role tolerates dye-lot and weave drift. A role
  woven at colour c covers a ball ΔE ≤ t; two weavings are the same colour iff their role-balls
  nest. `t` is the small "same colour" radius, `s` the larger "clearly different" floor, `t < s`.

Both are **perceptual** (ΔE in OKLab, or ΔE₀₀ for the chroma/hue anisotropy a flat OKLab metric
drops). Dye density does **not** enter either radius — whether a colour has changed is a fact
about vision, independent of how rare the colour is. Density's job is elsewhere: placing the
*name* boundaries (in the low-density valleys between dye clusters) and acting as a classification
prior. Two anisotropies, two jobs: perception shapes the tolerance ball; the dye prior places the
lines between names.

The two radii couple only *per sett*: a role's shading ball cannot grow past the midpoint to the
nearest other role, so the effective tolerance is `min(t, ½·nearest-inter-role-gap)`. In practice
that constraint **does not bind**: weavers respect `s` by design. Two-colour setts use strong
contrast (no one weaves red against dark-red); and where two levels of one hue co-occur in a
multi-colour sett, the registry's own centroids sit ΔE ≥ 0.17 apart (the tightest being
yellow/dark-yellow at 0.168), 2–4× any sensible `t`. So `s` is an emergent property of the corpus,
not a constraint we engineer, and the effective shading tolerance reduces to a single global `t`.
The one place gaps turn dangerous is the near-duplicate achromatics (white/light-grey at ΔE
0.065) — but those are the registry's redundancy, not distinct roles, and tight derived centroids
dissolve them.

This needs confirming against the real corpus rather than the legend centroids, which is the
purpose of the experiment below.

## Method: collision counting fixes the colour count empirically

There is no perceptually privileged *n* (above), so the resolution is set **experimentally**,
against the actual tartans, by quantisation collision counting. The protocol:

1. Build an n-colour palette (equal-spaced, or dye-weighted by k-means over real corpus colour
   usage).
2. Map every tartan's stripes to the nearest of the n categories, collapsing each thread count to
   its categorised, normalised form.
3. Count **collisions** — originally-distinct tartans that land on the same categorised string.
4. Sweep n (6 → 11 → ~25) and read the collision curve.

The curve starts high, falls as n rises, and bottoms on a floor of irreducible duplicates. **A
knee above the floor is a candidate natural number; a smooth curve means no preferred n** — either
way the question is settled against data, not asserted.

Raw collisions conflate two opposite things, and separating them is the whole point (it is the
[thesis](thesis.md): the unit of meaning is the Pattern, not the recipe):

| collision kind | what it is | verdict |
| -------------- | ---------- | ------- |
| **good** | two records of the *same Pattern* under different names/sources | a *find* — the Dictionary wants this collapse |
| **bad** | distinct tartans conflated only because the palette was too coarse to carry a shade distinction that mattered (`R` swallowing a maroon at n=6, splitting to `R`/`DR` at n=11) | a resolution failure |

The signal is **bad collisions vs n**, cross-referenced against name/family metadata. The n where
bad collisions reach ≈0 is the resolution the corpus demands; the good-collision count there is a
bonus — the Dictionary quantifying how many "different" tartans are really one design.

Two properties fall out for free. The sweep **self-isolates colour**: collisions only occur among
structurally-identical normalised setts, so structure is held constant and only colour resolution
is under test. And it gives a **palette bake-off** — the dye-weighted palette should clear the bad
collisions at a lower n than the equal-spaced one, proving the dye-weighting bias by collision
count rather than assertion.

The experiment must run in `tartan_data` — it needs the full imported corpus plus the engine's
`ThreadcountList.Normalised()` / `Reduced()` and `Palette`. The detailed protocol lives there as a
research proposal (`research/colour-resolution.md`); this repo holds only the conceptual model and
the colour legend.
