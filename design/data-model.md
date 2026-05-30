# Data model

The conceptual model behind the dictionary. **The authoritative model is the code and SQL
schema in `tartan_data`** (`tartandb/*.go`, `models/*.go`, `tartan.sql`); this document is the
durable conceptual view that survives refactors. Where this and the code disagree, the code
is right and this file should be updated.

## Entities

The Dictionary's **unit of meaning is the Pattern** — the design abstracted from exact counts
and shades (see [thesis.md](thesis.md)). A Pattern groups the **Tartans** (specific normalised
thread counts) that express it; each Tartan has **Variants** (specific colourings). The model
separates the *design* from the *records of it* — the distinction that name- and
thread-count-based catalogues blur.

```d2
Clan -> Family: groups
Pattern -> Tartan: groups many
Family -> Tartan: has many
Tartan -> Variant: has many
Variant -> Source: cited by
Pattern: {
  the design\n (relative sizes · colour roles)
}
Tartan: {
  threadcount\n stripeCount\n majorVariant
}
Variant: {
  palette
}
```

| Entity     | What it is                                                                                  | Identity                                  |
| ---------- | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Clan**   | A clan/surname grouping (e.g. Drummond). Attribution metadata.                               | name                                      |
| **Family** | A family's set of tartans where usage exceeds a couple of generations (e.g. Drummond of Megginch). | name; references an exemplar Tartan |
| **Pattern**| **The unit of meaning** — the design abstracted from exact counts and shades (relative stripe sizes + colour roles). Groups the many weavings of one design. | reduced sequence |
| **Tartan** | One normalised thread count — a specific structural form that expresses a Pattern.           | normalised thread count                   |
| **Variant**| A specific *palette* of a Tartan's thread count — one concrete colouring. A *record* of the design. | thread count + palette               |
| **Source** | Provenance of a Variant (a kilt, a plaid, a Wilson pattern book, the Register).              | reference                                 |

A *design vs the record of it*: the **Pattern** (and the **Tartans** expressing it) is the
design; a **Variant** is a record of it in particular threads and colours. The 1849 kilt, 1997
kilt and 1820 plaid of Megginch are Variants (and Sources) of related Tartans — all expressing
the one Megginch Pattern.

## Value objects (in the engine)

These live in `tartandb` and have no database identity of their own:

| Type              | Role                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| `Threadcount`     | One stripe: a colour code + an even thread count (e.g. `R14`).              |
| `ThreadcountList` | A full sett. Owns `Parse`, `Normalised`, `Reduced`, `NumStripes`, URL gen.  |
| `Palette`         | Map from colour code → RGB; supports original/normal text and substitution. |
| `TartanVariant`   | A thread count bound to a palette; renders (`ToSettSVG`/`ToSettPNG`) and emits Hugo URLs. |

## Normalisation and reduction

Two distinct operations, both in `ThreadcountList`:

- **Normalise** (`Normalised`) — canonicalise an equivalent-but-differently-written sett to a
  single representative, so it can serve as identity (reflective-vs-repeating, reversal, pivot
  choice all resolved). This is the identity operation from the thesis.
- **Reduce** (`Reduced`, GCD-based) — divide through to the smallest integer pattern to compare
  *shape* independent of absolute scale; with a thickness tolerance this lets a plaid and a
  child's kilt of one design classify as the same **Pattern**. Lossy, deliberately.

Thread counts are normalised to a minimum of 2 to preserve the 2/2 twill, so all counts are
even; larger setts are integer multiples.

## URL composition (identity made addressable)

The structural identity is the URL. A Tartan's thread count and a Variant's palette compose
into unique, stable paths (`ToHugoURL`, `ToHugoTartanURL`):

```
/tartans/r/14/db2/r4/db4/r70/lb4/r4/db20/r4/g4/r4/g74/r6/db4/r/12/        (Tartan)
/variants/<same>-db000064-g004c00-lb98c8e8-rc80000/                       (Variant: + palette)
```

`!` separates warp/weft when they differ (chosen over `|` to avoid URL escaping). The palette
suffix is the sorted `code-hexrgb` list.

## Generated vs hand-authored content

This matters operationally: most of `content/` is **generated** and must not be hand-edited.

| Path                                   | Origin                                                        |
| -------------------------------------- | ------------------------------------------------------------- |
| `content/tartans/**`, `variants/**`, `families/**`, `stripes/**`, `patterns/**` | **Generated** by `tartan_data/cmd/export` from the SQLite DB. Regenerate, don't edit. |
| `content/posts/**`, `content/about/`, `content/_index.md` | Hand-authored editorial. |
| `design/**`                            | Hand-authored canonical arguments (this folder).              |
