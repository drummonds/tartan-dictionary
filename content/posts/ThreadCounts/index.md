---
title: Tartan Threadcounts
date: 2023-01-15
mermaid: true
---

## Aim is to define the way thread counts are specified.

This uses an ebnf specifcation which is [elaborated here][] which includes further references.

[elaborated here]:https://www.bytestone.uk/posts/ebnf/

```ebnf
Tartan = WarpThreadCountList { "!" WeftThreadCountList } {Pallette}. 
Pallette = ColourSpec { ColourSpec}
ColourSpec = ColourCode HexChar ColourHex | ColourCode "~"  OKLabColour
HexChar = "#"|"$"
ColourHex = Red Green Blue
Red = Hex
Green = Hex
Blue = Hex
Hex = HexChar HexChar
OKLabColour = LightNess "%" A-Axis "~" B-Axis
LightNess =  "1" | "0" {"."  Digit {Digit {Digit {Digit}}}}
A-Axis = AxisNumber
B-Axis = AxisNumber
AxisNumber = "0" | {"-"} "1" | {"-"} "0" "."  Digit {Digit {Digit {Digit}}}
Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;
HexChar = Digit | "A" | "B" | "C" | "D" | "E" | "F" 
WarpThreadCountList = ThreadCountList .
WeftThreadCountList = ThreadCountList .
ThreadCountList = FirstThreadCount {ThreadCount} {LastThreadCount}.
ThreadCount = ColourCode Integer .
FirstThreadCount = ColourCode ReflectiveSettSpecifier Integer | RepeatingSettSpecifier ThreadCount
LastThreadCount = ColourCode ReflectiveSettSpecifier Integer | ThreadCount RepeatingSettSpecifier 
ReflectiveSettSpecifier = "/" 
RepeatingSettSpecifier = "..."
CoreColourCode =    "W" |"R" | "G" | "B" | "Y" | "K" 
ColourCode = CoreColourCode | "LR" | "DR" | "O" | "DO" | "LY" | "DY" |
    "LG" |  "DG" | "LB"  | "DB" | "LP" | "P" | "DP" | 
    "LN" | "N" | "DN" | "LT" | "T" | "DT".
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
5. Palette should include all the colours (otherwise the standard palette will be used.)
6. Optional separator for warp and weft if specified is ! rather than | to not require escaping as URLs
   


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

## URL composition

Tartans are comprised so that their URL's are unique.  Each threadcount may have a number of colour variations of which one will be specified as the major version with more information than the others.
Sometimes the choice of this major version will be arbitrary.

So the Drummond of Megginch tartan is:
https://tartandictionary.org/tc/R/14DB2R4DB4R70LB4R4DB20R4G4R4G74R6DB4R/12/

A particular pallette would be:
https://tartandictionary.org/tc/R/14DB2R4DB4R70LB4R4DB20R4G4R4G74R6DB4R/12/DB#000064G#004c00LB#98c8e8R#c80000/

The URLs of each colour variation also have a unique reference.  They have the following relationship.


{{< mermaid >}}
erDiagram
    TARTANFAMILY |o--|{ TARTAN : has
    TARTANFAMILY {
        string name
        string description
        string referenceTartan FK "Exemplar pattern"
    }
    TARTAN ||--|{ VARIANT : has
    TARTAN {
        string name
        string description
        string majorVariant
        string threadcount
        string stripeCount
    }
    VARIANT {
        string palette
    }
{{< /mermaid >}}

The tartan family is a slightly more abstract concept.  Eg in the [Wikipedia entry] on tartan the following quote from a letter to Sir Walter Scott is the following which shows how vague a concept can be:

[Wikipedia entry]:https://en.wikipedia.org/wiki/Tartan

{{% hint info %}}
MacLeod (of Dunvegan) has got a sketch of this splendid tartan, three black stryps upon ain yellow fylde.
{{% /hint %}}

The interesting thing is that concept gets replicated and modified over time, eg larger setts for plaids, small setts for a child's kilt and simple mistakes in copying when new tartan gets woven.