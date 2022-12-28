---
title: Tartan Threadcounts
date: 2022-12-26
---

## Aim is to define the way thread counts are specified.

```ebnf
Tartan = WarpThreadCountList { "|" WeftThreadCountList } {Pallette}. 
Pallette = ColourSpec { ColourSpec}
ColourSpec = ColourCode "#" ColourHex
ColourHex = Red Green Blue
Red = Hex
Green = Hex
Blue = Hex
Hex = HexChar HexChar
HexChar = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9 | "a" | "b" | "c" | "d" | "e" | "f" 
WarpThreadCountList = ThreadCountList .
WeftThreadCountList = ThreadCountList .
ThreadCountList = FirstThreadCount {ThreadCount} {LastThreadCount}.
ThreadCount = ColourCode Integer .
FirstThreadCount = ColourCode ReflectiveSettSpecifier Integer | RepeatingSettSpecifier ThreadCount
LastThreadCount = ColourCode ReflectiveSettSpecifier Integer | ThreadCount RepeatingSettSpecifier 
ReflectiveSettSpecifier = "/" 
RepeatingSettSpecifier = "..."
ColourCode = "LR" | "R" | "DR" | "O" | "DO" | "LY" | "Y" | "DY" |
    "LG" | "G" | "DG" | "LB" | "B" | "DB" | "LP" | "P" | "DP" | "W" |
    "LN" | "N" | "DN" | "K" | "LT" | "T" | "DT".
```

Notes:
1. See below for expansion of ColourCode
2. Where only a WarpThreadCountList is given then it is assumed that the WeftThreadCountList is the same. 
3. The default is that the first and last of each part of the pattern are pivots with a mirror reflection.   So W2 G4 R6 is woven as:
```
    W2 G4 **R6** G4 **W2** G4 **R6** G4 **W2** G4 R6
    aaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeee
```
4. The Tartan Registry specifies reflective setts with ColourCode "/" Integer eg `B/24 W4 B24 R2 K24 G24 W/2`.  However it can be elided and is not universally used.
5. Palette should include all the colours (otherwise the standard palete will be used.)


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
