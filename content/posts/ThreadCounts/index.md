---
title: Tartan Threadcounts
date: 2022-12-26
---

## Aim is to define the way thread counts are specified.

```ebnf
Tartan = WarpThreadCountList { "|" WeftThreadCountList }. 
WarpThreadCountList = ThreadCountList .
WeftThreadCountList = ThreadCountList .
ThreadCountList = [SymmetrySpecifier] ThreadCount { ThreadCount}[SymmetrySpecifier].
ThreadCount = ColourCode Integer .
SymmetrySpecifier = ReflectiveSettSpecifier | RepeatingSettSpecifier
ReflectiveSettSpecifier = "" 
RepeatingSettSpecifier = "..."
ColourCode = "LR" | "R" | "DR" | "O" | "DO" | "LY" | "Y" | "DY" |
    "LG" | "G" | "DG" | "LB" | "B" | "DB" | "LP" | "P" | "DP" | "W" |
    "LN" | "N" | "DN" | "K" | "LT" | "T" | "DT".
```

Notes:
1. See below for expansion of ColourCode
2. Where only a WarpThreadCountList is given then it is assumed that the WeftThreadCountList is the same. 
3. The default is that the first and last of each part of the pattern are pivots with a mirror relection.   So W2 G4 R6 is woven as:
```
    W2 G4 **R6** G4 **W2** G4 **R6** G4 **W2** G4 R6
    aaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeee
```
4. The Tartan Registry specifices reflective setts with ColourCode "/" Integer eg `B/24 W4 B24 R2 K24 G24 W/2`.  However it can be elided and is not univerasaly used.


## End points

The Tartan Register uses [whole thread counts][] for each pivot points.

[whole thread counts]: https://www.tartanregister.gov.uk/threadcount

## Colours

The tartan register has a series of [abbreviated colour codes][] each of which may have a range of colours associated with it.

[abbreviated colour codes]: https://www.tartanregister.gov.uk/docs/Colour_shades.pdf

| Colour Code | SVG Colour name |
| ----------- | --------------- |
| LR          | lightred        |
| R           | red             |
| DR          | darkred         |
| O           | orange          |
| DO          | darkorange      |
| LY          | lightyellow     |
| Y           | yellow          |
| DY          | darkyellow      |
| LG          | lightreen       |
| G           | green           |
| DG          | darkreen        |
| LB          | lightblue       |
| B           | blue            |
| DB          | darkblue        |
| LP          | lightpurple     |
| P           | purple          |
| DP          | darkpurple      |
| W           | white           |
| LN          | lightgray       |
| N           | gray            |
| DN          | darkgray        |
| K           | black           |
| LT          | lightbrown      |
| T           | brown           |
| DT          | darkbrown       |
