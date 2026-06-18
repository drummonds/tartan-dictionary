---
title: "Band definitions vs thread counts — styling comparison"
date: 2026-06-18
background: /bg/band.png
---

A human-palette **shortcut** interleaves *band definitions* (the colour codes — `G`, `DB`, `K`…)
with *thread counts* (the numbers), e.g. `G/56 W4 G28 …`. Issue #16 asks us to make the two
visually distinct so a reader never confuses a colour for a count. Below, a few real threadcounts
from two sources are shown three ways — plain, then the two candidate stylings — so we can pick one
before committing it to the live pages.

- **Option A — italic + bold:** band definitions in **_bold italic_**, counts plain.
- **Option B — colour:** band definitions in a muted grey, counts in the normal text colour.

<style>
  .bd-demo { width: 100%; border-collapse: collapse; }
  .bd-demo th, .bd-demo td { text-align: left; padding: .5em .8em; vertical-align: top; border-bottom: 1px solid #0002; }
  .shortcut { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .95em; white-space: normal; word-break: break-word; }
  .opt-bold .bd { font-weight: 700; font-style: italic; }
  .opt-colour .bd { color: #8a8f98; }
</style>

<table class="bd-demo">
  <thead>
    <tr><th>Tartan (source)</th><th>Plain</th><th>A · italic + bold</th><th>B · colour</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>Abercrombie <small>(Register of Tartans)</small></td>
      <td><code class="shortcut">G/56 W4 G28 K28 B8 K8 B8 K8 B/28</code></td>
      <td><code class="shortcut opt-bold">G/56 W4 G28 K28 B8 K8 B8 K8 B/28</code></td>
      <td><code class="shortcut opt-colour">G/56 W4 G28 K28 B8 K8 B8 K8 B/28</code></td>
    </tr>
    <tr>
      <td>Abercrombie (McKinlay) <small>(Register of Tartans)</small></td>
      <td><code class="shortcut">K/4 B16 R2 K28 G28 W2 G28 R2 K/24</code></td>
      <td><code class="shortcut opt-bold">K/4 B16 R2 K28 G28 W2 G28 R2 K/24</code></td>
      <td><code class="shortcut opt-colour">K/4 B16 R2 K28 G28 W2 G28 R2 K/24</code></td>
    </tr>
    <tr>
      <td>Abercrombie (Wilsons No 2/64) <small>(Register of Tartans)</small></td>
      <td><code class="shortcut">K/4 P24 K24 G24 Y4 G24 K/24</code></td>
      <td><code class="shortcut opt-bold">K/4 P24 K24 G24 Y4 G24 K/24</code></td>
      <td><code class="shortcut opt-colour">K/4 P24 K24 G24 Y4 G24 K/24</code></td>
    </tr>
    <tr>
      <td>Drummond of Megginch — 1849 Kilt <small>(Research)</small></td>
      <td><code class="shortcut">R/14 DB2 R4 DB4 R70 LB4 R4 DB20 R4 G4 R4 G74 R6 DB4 R/12</code></td>
      <td><code class="shortcut opt-bold">R/14 DB2 R4 DB4 R70 LB4 R4 DB20 R4 G4 R4 G74 R6 DB4 R/12</code></td>
      <td><code class="shortcut opt-colour">R/14 DB2 R4 DB4 R70 LB4 R4 DB20 R4 G4 R4 G74 R6 DB4 R/12</code></td>
    </tr>
    <tr>
      <td>Black/White check <small>(Research)</small></td>
      <td><code class="shortcut">DT24 W24</code></td>
      <td><code class="shortcut opt-bold">DT24 W24</code></td>
      <td><code class="shortcut opt-colour">DT24 W24</code></td>
    </tr>
  </tbody>
</table>

<script>
  // Wrap every letter run (a band definition) in <span class="bd"> so the two options can style the
  // colour codes apart from the counts. Pure presentation — the text content is untouched.
  document.querySelectorAll('.shortcut').forEach(function (el) {
    el.innerHTML = el.textContent.replace(/[A-Za-z]+/g, function (m) {
      return '<span class="bd">' + m + '</span>';
    });
  });
</script>

Once a style is chosen, it moves into the live threadcount rendering (the `## Thread count` block on
every sett page) and the `{{</* pat */>}}`-style shortcuts.
