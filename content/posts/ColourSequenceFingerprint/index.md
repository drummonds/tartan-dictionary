---
title: "A tartan's colour order is nearly its name"
date: 2026-06-01
tags: ["sett", "pattern", "colour", "Scottish Register", "data"]
---

Reduce a tartan to almost nothing — six colours, and the *order* they run in, with every thread
count thrown away — and you would expect to be left with something far too coarse to tell one
tartan from another. Hundreds of designs ought to collapse together. They don't. In the Scottish
Register of Tartans, that stripped-down **colour sequence** is very nearly a fingerprint.

## What we kept, and what we threw away

We took the **register-of-tartans** dataset on its own — 7,393 setts — so that every match is two
genuinely distinct tartans, not the same tartan re-listed across sources. Each stripe was
quantised to the nearest of six base colours (blue, black, red, green, yellow, white), and the
thread counts were discarded entirely. What survives is the **Pattern**: the bare order of
coloured stripes across the half-sett, folded so a reflective sett and its mirror count
as one. So `B24 K8 G24 R4` and `B6 K2 G6 R1` both reduce to the same four-colour Pattern,
{{< pat "BKGR" >}}.

Then we binned the 7,393 tartans by that Pattern and asked: how many tartans land in each bin?

## The colour order alone identifies five tartans in six

There are 6,774 distinct colour sequences across the 7,393 tartans — a mean of just **1.09
tartans per sequence**. The full distribution:

| tartans sharing a sequence | sequences | tartans | cumulative |
| --- | ---: | ---: | ---: |
| 1 — unique | 6,323 | 6,323 | 85.5% |
| 2 | 346 | 692 | 94.9% |
| 3 | 72 | 216 | 97.8% |
| 4 | 19 | 76 | 98.8% |
| 5 | 6 | 30 | 99.2% |
| 6–10 | 8 | 56 | 100.0% |

**85.5% of register tartans are the only tartan with their colour sequence** — and that is with
the thread counts gone, ordering alone. Only 1,070 tartans (14.5%) share a sequence with anyone at
all, and when they do the company is tiny: 95% of tartans are either unique or in a pair, and the
most crowded sequence in the whole register holds just eight tartans. For a typical register
tartan, the median number of others sharing its colour order is **zero**.

## Where the clashes do live

The few collisions are not scattered at random — they sit almost entirely among the short, simple
patterns, where there is little room to be different. The most crowded sequences are exactly the
ones you would name from memory:

{{< pat "BKGR" >}} {{< pat "BRGRBR" >}} {{< pat "BGBG" >}} {{< pat "BKBKBK" >}} {{< pat "KRKRKR" >}} {{< pat "BWBWBW" >}}

Break the count down by the number of stripes in the half-sett and the pattern is plain:

| stripes in half-sett | tartans | distinct sequences | mean per bin |
| ---: | ---: | ---: | ---: |
| 2 | 23 | 12 | 1.92 |
| 4 | 209 | 158 | 1.32 |
| 5 | 352 | 289 | 1.22 |
| 7 | 676 | 612 | 1.10 |
| 10 | 633 | 607 | 1.04 |
| 16+ | … | … | ≈ 1.0 |

A two-stripe tartan has only fifteen possible distinct colour pairs to choose from, so crowding is
unavoidable — nearly two tartans to a sequence. By about seven stripes the combinatorial space is
so large that the colour order is essentially unique, and from there up almost every sequence
belongs to exactly one tartan. All the clashes live in the 2-to-5-stripe band.

## Why this matters for the Dictionary

This is the empirical reason the Dictionary can organise the whole corpus around six colours
without losing tartans to each other. The colour order alone already separates 85% of the
register; the handful that share a sequence are nearly all simple, few-stripe designs, and those
are pulled back apart the moment you let the thread counts back in — the relative stripe widths
finish the job the colours started. Six colours are not a compromise forced on us by the data;
they are, very nearly, enough on their own.

*The figures come from binning the register-of-tartans dataset by six-colour Pattern; the
analysis is reproducible from the `binseq` tool in the tartan engine.*
