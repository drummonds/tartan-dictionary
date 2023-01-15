---
title: Tartan Symmetry and Normalisation
date: 2023-01-15
mermaid: true
---

## Symmetry.
The simplest tartans have reflective symmetry in both the warp and weft (x,y) directions and are identical.  They are defined by pivot points in the symmetry.

So.

    R/2 B2 G/2

creates a non repeating pattern:

    R2 B2 G2 B2 R2 B2 G2 B2 R2 B2 G2 B2 R2

This is a repeating pattern of:

    ...R2 B2 G2 B2... 

but whereas the reflective pattern has defined end points the repeating pattern can choose any starting point so the following are all the same pattern:

    ...R2 B2 G2 B2... 
    ...B2 G2 B2 R2... 
    ...G2 B2 R2 B2... 
    ...B2 R2 B2 G2...

## Reflective identities
The same problem is also found in reflective patterns, the reversal of the pattern is also the same pattern:

    R/2 B2 G/2
    G/2 B2 R/2

## Normalisation algorythm

The aim is to put the largest stripes to the right of the pattern and where they are the same to sort alphabetically, so the following are the normalised versions of the above:

    G/2 B2 R/2
    ...B2 G2 B2 R2... 

 excepting that a repeating pattern should be normalised to a reflective pattern if it has reflective symmetry so the normalised version is:

     G/2 B2 R/2

This is important when using the thread count as an identifier for the tartan to make sure you don't get confusion.