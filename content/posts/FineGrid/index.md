---
title: "The fine grid — a colour space sampled evenly"
date: 2026-06-13
slug: fine-grid
tags: ["tartan", "colour", "oklab", "reference"]
---

A specifier book like Pantone or Munsell samples colour space unevenly — densely where its trade
cares, thinly elsewhere — because it is a record of what people actually made. The Dictionary
needs the opposite: a frame in which *equal distance is equal perceived difference*, filled
evenly, so that "how far is this shade from that one" has a single honest answer. That frame is
the **fine grid**.

## What it is

Take OKLab — the perceptual colour space the [colour list](/posts/colours/) already uses — and
simply fill it at one spacing in every direction:

- a **lightness level** every 0.025 from black to white (41 levels);
- on each level, a **chroma ring** every 0.025 outward from the grey at the centre;
- round each ring, points at an **arc spacing** of ~0.025, so outer rings carry more hues.

That spacing is two to three *just-noticeable differences*: close enough that nothing finer
would be visible on cloth, far enough that no two grid colours look the same side by side. The
result is about **5,100 colours** — Pantone scale, but evenly spread rather than editorially
chosen.

## Clipped to what cloth can actually be

A screen can show colours no dye can reach, so the grid is not filled out to the sRGB edge but to
the **dyeable** boundary — one grid step beyond the real-surface gamut measured by Pointer in
1980, with the black and white caps added. Four limits were drawn and compared on the way:

| boundary | what it is | colours |
|---|---|---|
| sRGB | what a screen shows | 3,489 |
| real-surface (Pointer) | measured physical dyes & pigments | 4,231 |
| **fine grid (dyeable)** | **the Dictionary's working gamut** | **~5,100** |
| optimal (MacAdam) | the theoretical reflectance limit | 9,337 |

So real dyeable colour is roughly a *tenth* of the visible cone — and the fine grid sits just
inside the measured edge of it.

## Naming a colour

Every fine-grid colour is a lattice point, so its name *is* its coordinates: `level-ring-hue`,
three numbers — level (0 black cap → 40 white cap), ring (the chroma step out from grey), and the
dot's index round its ring. The greys are `level-00`. Any dye anyone quotes, from any supplier's
card, sits within one step of exactly one code — which is what makes the grid a common frame for
comparing palettes that were never designed to line up.

The full genesis — why 0.025, why a cylinder and not a cube, the colorimetry behind the four
limits — is in the project's research notes; this is the short version. The fine grid is the
substrate the [six-colour reference palette](/posts/six-colour-palette/) is anchored to.
