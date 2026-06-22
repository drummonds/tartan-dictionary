/* The in-browser logo→tartan matcher behind /logo/. Drop in a logo image and it weaves nothing of
 * its own: it reads the logo's few principal colours (dropping the background), counts its colour
 * blocks, and suggests the existing tartans closest on stripe count, colour count and palette,
 * each linking to its page in the dictionary.
 *
 * The Go WASM engine (cmd/wasmlogo, installed on globalThis.logoWeaver) and the match corpus
 * (/logo/corpus.v1.json) load lazily on the first logo, so the page costs nothing until used.
 * Plain JS, no framework — mirrors weaver.js's boot. */
(function () {
  'use strict';

  var WASM_URL = '/wasm/logoweaver.wasm';
  var CORPUS_URL = '/logo/corpus.v1.json';
  var K = 8; // how many tartan suggestions to show

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();

  var booted = false;
  function init() {
    if (booted) return;
    booted = true;
    var app = document.getElementById('logoweaver-app');
    if (app) wireUI(app);
  }

  function wireUI(app) {
    var zone = app.querySelector('#logo-drop');
    var input = app.querySelector('#logo-file');
    if (!zone || !input) return;

    input.addEventListener('change', function () {
      if (input.files && input.files[0]) handle(input.files[0]);
    });
    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); input.click(); }
    });
    ['dragenter', 'dragover'].forEach(function (e) {
      zone.addEventListener(e, function (ev) { ev.preventDefault(); zone.classList.add('logo-drop--over'); });
    });
    ['dragleave', 'drop'].forEach(function (e) {
      zone.addEventListener(e, function (ev) { ev.preventDefault(); zone.classList.remove('logo-drop--over'); });
    });
    zone.addEventListener('drop', function (ev) {
      var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
      if (f) handle(f);
    });
  }

  function handle(file) {
    if (!/^image\/(png|jpeg)$/.test(file.type)) {
      status('Please choose a PNG or JPEG image.');
      return;
    }
    showPreview(file);
    status('Reading the logo…');
    Promise.all([ready(), file.arrayBuffer()]).then(function (parts) {
      var loaded = parts[0], buf = parts[1];
      var res = window.logoWeaver.matchLogo(new Uint8Array(buf), K);
      if (res.error) throw new Error(res.error);
      renderResult(res, loaded.count);
    }).catch(function (err) {
      status('Could not match this logo: ' + (err.message || err));
    });
  }

  /* Lazily boot the engine and load the match corpus, once. */
  var readyPromise = null;
  function ready() {
    if (readyPromise) return readyPromise;
    status('Starting the matcher…');
    readyPromise = loadEngine()
      .then(function () {
        return fetch(CORPUS_URL).then(function (r) {
          if (!r.ok) throw new Error('corpus.v1.json: HTTP ' + r.status);
          return r.text();
        });
      })
      .then(function (json) {
        var res = window.logoWeaver.loadLogoCorpus(json);
        if (res.error) throw new Error(res.error);
        return res; // {count}
      })
      .catch(function (err) {
        readyPromise = null; // allow a retry on the next logo
        throw err;
      });
    return readyPromise;
  }

  /* Loads wasm_exec.js then instantiates the engine; go.run() parks in select{}, so
   * globalThis.logoWeaver is installed by the time run() yields. */
  function loadEngine() {
    if (window.logoWeaver) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = '/wasm/wasm_exec.js';
      s.onload = resolve;
      s.onerror = function () { reject(new Error('wasm_exec.js failed to load')); };
      document.head.appendChild(s);
    }).then(function () {
      var go = new Go();
      return WebAssembly.instantiateStreaming(fetch(WASM_URL), go.importObject)
        .then(function (result) {
          go.run(result.instance); // parks; do not await
          if (!window.logoWeaver) throw new Error('engine did not install its API');
          stampBuild(window.logoWeaver);
        });
    });
  }

  /* Append the engine's link-time build stamp (commit + UTC date) at the foot of the matcher, so
   * the tool always says which weaver built it. buildInfo() is stamped by `task wasm:logo`; an
   * older binary without it (or a dev build) is simply not stamped. Runs once. */
  function stampBuild(engine) {
    var app = document.getElementById('logoweaver-app');
    if (!app || !engine || typeof engine.buildInfo !== 'function') return;
    if (document.getElementById('weaver-build')) return;
    var b = engine.buildInfo();
    if (!b || b.error) return;
    var el = document.createElement('p');
    el.id = 'weaver-build';
    el.className = 'weaver-build';
    el.textContent = 'weaver ' + b.commit + ' · built ' + b.built;
    app.appendChild(el);
  }

  function showPreview(file) {
    var el = document.getElementById('logo-preview');
    if (!el) return;
    var url = URL.createObjectURL(file);
    el.innerHTML = '<img alt="Your logo" src="' + url + '">';
  }

  function renderResult(res, corpusCount) {
    status('');

    var pal = (res.palette || []).map(function (c) {
      return swatch(c.hex) + ' <code>' + esc(c.hex) + '</code>';
    }).join(' ');
    var bg = res.background
      ? swatch(res.background) + ' <code>' + esc(res.background) + '</code>'
      : '<em>none detected</em>';
    document.getElementById('logo-analysis').innerHTML =
      '<h2>Your logo</h2>' +
      '<p><strong>' + res.colours + '</strong> colour' + (res.colours === 1 ? '' : 's') +
      ' across <strong>' + res.blocks + '</strong> block' + (res.blocks === 1 ? '' : 's') +
      ', background excluded.</p>' +
      '<p>Colours: ' + (pal || '<em>none</em>') + '</p>' +
      '<p>Background: ' + bg + '</p>';

    renderGenerated(res.generated || []);

    var out = document.getElementById('logo-results');
    if (!res.hits || !res.hits.length) {
      out.innerHTML = '<p>No matching tartan found.</p>';
      return;
    }
    var cards = res.hits.map(function (h, i) {
      var name = h.name || 'Unnamed tartan';
      return '<a class="logo-hit' + (i === 0 ? ' logo-hit--top' : '') + '" href="' + esc(h.url) + '">' +
        '<img loading="lazy" src="' + esc(h.url) + 'sett.png" alt="' + esc(name) + ' sett">' +
        '<span class="logo-hit-name">' + esc(name) + '</span>' +
        '<span class="logo-hit-meta">' + h.stripes + ' stripes · ' + h.colours + ' colours</span>' +
        '</a>';
    }).join('');
    out.innerHTML =
      '<h2>Closest tartans</h2>' +
      '<p>The ' + res.hits.length + ' tartans nearest your logo by stripe count, colour count and ' +
      'palette, out of ' + corpusCount.toLocaleString() + '. The first is the closest match.</p>' +
      '<div class="logo-hits">' + cards + '</div>';
  }

  /* The tartans woven from the logo's own colours: each a sett built straight from the palette at a
   * given stripe count, in the original colours or reduced to standard human-palette shades. Drawn
   * as a flat sett bar on a canvas (no engine needed); each links to the TTD to weave and adjust it,
   * and to its dictionary page. */
  function renderGenerated(gen) {
    var box = document.getElementById('logo-generated');
    if (!gen.length) { box.innerHTML = ''; return; }
    box.innerHTML =
      '<h2>Tartans from your colours</h2>' +
      '<p>Setts built straight from your palette — in your original colours, and reduced to ' +
      'standard worsted shades — at 4, 8, 12 and 20 stripes. Open one in the TTD to weave and ' +
      'tune it.</p><div class="logo-gen"></div>';
    var grid = box.querySelector('.logo-gen');
    gen.forEach(function (g) {
      var card = document.createElement('div');
      card.className = 'logo-gen-card';
      var label = (g.mode === 'human' ? 'Standard shades' : 'Original colours') + ' · ' + g.stripes + ' stripes';
      card.innerHTML =
        '<canvas width="400" height="56"></canvas>' +
        '<span class="logo-gen-title">' + esc(label) + '</span>' +
        '<span class="logo-gen-tc">' + esc(g.threadcount) + '</span>' +
        '<span class="logo-gen-links"><a href="' + esc(g.ttdURL) + '">⌗ Open in TTD</a>' +
        '<a href="' + esc(g.url) + '">page</a></span>';
      grid.appendChild(card);
      drawSettBar(card.querySelector('canvas'), g.bars);
    });
  }

  /* Draws a sett as proportional vertical stripes across the canvas width. */
  function drawSettBar(canvas, bars) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var total = 0;
    bars.forEach(function (b) { total += b.count; });
    if (total <= 0) return;
    var x = 0;
    bars.forEach(function (b, i) {
      var w = (i === bars.length - 1) ? (W - x) : Math.round(b.count / total * W);
      ctx.fillStyle = b.hex;
      ctx.fillRect(x, 0, w, H);
      x += w;
    });
  }

  function status(msg) {
    var el = document.getElementById('logo-status');
    if (el) el.textContent = msg;
  }

  /* Mirrors the static pages' colour chip (weaver.js swatch / internal/dictionary cSwatch). */
  function swatch(hex) {
    return '<code style="background-color:' + hex + ';"><span style="color:' + hex +
      ';filter:grayscale(1) invert(1) contrast(100);">' + esc(hex) + '</span></code>';
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }
})();
