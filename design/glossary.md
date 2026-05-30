# Glossary

The ubiquitous language. Use these terms consistently across `design/`, posts, code, and the
engine. One concept, one name.

| Term                | Meaning                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Sett**            | The complete repeating unit of a tartan pattern — the design that tiles across the cloth.                     |
| **Thread count**    | The sett written as a colour-and-count sequence, e.g. `R14 DB2 R4 …`. The dictionary's identifier.           |
| **Stripe**          | One run of a single colour within the sett (a colour code + an even thread count, e.g. `R14`).               |
| **Pivot**           | An end point of a reflective sett about which the pattern mirrors. Written with `/` in the Register notation. |
| **Reflective sett** | A sett that mirrors about its first and last pivots; has defined end points.                                  |
| **Repeating sett**  | A sett that simply repeats; has no privileged start, so any rotation is the same pattern.                     |
| **Palette**         | The mapping from colour codes (R, DB, LB, G, …) to concrete RGB colours for a given Variant.                  |
| **Normalisation**   | Reducing an equivalent-but-differently-written sett to one canonical representative, so it can be an identity. |
| **Reduction**       | Dividing a sett through to its smallest integer pattern (GCD) to compare shape independent of absolute scale.  |
| **Pattern**         | The Dictionary's **unit of meaning**: the design abstracted from a sett — relative stripe sizes and colour roles, with absolute size and exact shades factored out. Groups the many weavings of one design. |
| **Twill (2/2)**     | The weave that offsets the over/under by one thread each row, giving the diagonal structure of tartan. The dictionary covers only 2/2-twill, H/V-symmetric setts. |
| **Tartan**          | One normalised thread count — a specific structural form that expresses a Pattern.                            |
| **Variant**         | One concrete colouring of a Tartan (thread count + palette) — a *record* of the idea.                         |
| **Family**          | A set of tartans associated with a family over more than a couple of generations.                            |
| **Source**          | The provenance of a Variant: a specific kilt, plaid, pattern book, or register entry.                        |
