/* The in-browser weaver: boots the Go WASM tartan engine on the 404 app-shell and renders a full
 * variant page for any /setts/s<n>/<slug>/ URL that has no static page — the slug alone encodes
 * the whole cloth. Static pages keep working without this; the shell only takes over when the URL
 * looks like a sett address. Plain JS, no framework. */
(function () {
  'use strict';

  var SETT_PATH = /^\/setts\/s\d+\/[0-9a-z-]+\/(edit\/)?$/;
  var t0 = performance.now();

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();

  var booted = false;
  function init() {
    if (booted) return;
    booted = true;
    var shell = document.getElementById('weaver-app');
    if (!shell || shell.dataset.weaver !== 'shell') return;
    var path = location.pathname;
    if (!SETT_PATH.test(path)) return; // a genuinely unknown page: leave the 404 text alone
    boot(shell, path.replace(/edit\/$/, '')).catch(function (err) {
      status(shell, 'The weaver could not start: ' + err);
    });
  }

  function status(shell, msg) {
    shell.querySelector('.post-text').innerHTML = '<p>' + esc(msg) + '</p>';
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  /* Loads wasm_exec.js then instantiates the engine. go.run() executes main() until it parks, so
   * globalThis.weaver is installed by the time run() yields. */
  function loadEngine() {
    if (window.weaver) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = '/wasm/wasm_exec.js';
      s.onload = resolve;
      s.onerror = function () { reject(new Error('wasm_exec.js failed to load')); };
      document.head.appendChild(s);
    }).then(function () {
      var go = new Go();
      return WebAssembly.instantiateStreaming(fetch('/wasm/weaver.wasm'), go.importObject)
        .then(function (result) {
          go.run(result.instance); // parks in select{}; do not await
          if (!window.weaver) throw new Error('engine did not install its API');
        });
    });
  }

  function pngURL(bytes) {
    return URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
  }

  function boot(shell, path) {
    status(shell, 'Weaving this tartan in your browser…');
    return loadEngine().then(function () {
      var info = window.weaver.parsePath(path);
      if (info.error && info.hashed) {
        var m = /[#&]slug=([0-9a-z-]+)/.exec(location.hash);
        if (m) info = window.weaver.parseSlug(m[1]);
      }
      if (info.error) {
        status(shell, 'This sett address could not be read: ' + info.error);
        return;
      }
      if (info.corrected && info.path !== location.pathname) {
        history.replaceState(null, '', info.path + location.hash);
      }
      render(shell, info);
    });
  }

  function render(shell, info) {
    var tWasm = performance.now();
    var h = [];
    h.push('<p>In pattern <a href="' + info.patternURL + '">' + esc(info.pattern) + '</a>.</p>');
    h.push('<p>Woven on demand in your browser. It is a <a href="/stripes/stripes' +
      info.stripes + '/">' + info.stripes + ' stripes tartan</a>.</p>');
    h.push('<h2>Thread count</h2>');
    h.push('<p>' + esc(info.threadcount) + '</p>');
    h.push('<p><img id="weaver-sett" alt="Sett"></p>');
    h.push('<h2>Palette</h2>');
    h.push('<p>Each colour and its ΔE from the base-6 reference it is a variant of.</p>');
    h.push(paletteTable(info.palette));
    h.push('<h1>Sample pattern</h1>');
    h.push('<p><img id="weaver-tartan" alt="Tartan detail" title="' + esc(info.threadcount) + ' tartan"></p>');
    h.push('<div id="weaver-nn"><h2>Nearest tartans</h2><p>Measuring ΔTartan distances…</p></div>');
    h.push('<p>ID: ' + esc(info.path) + '</p>');
    h.push('<p id="weaver-stats" style="color:#888;font-size:smaller"></p>');
    shell.querySelector('.post-text').innerHTML = h.join('\n');
    shell.querySelector('.post-header h1').textContent = 'Tartan variant (generated)';

    var sett = window.weaver.renderSett(info.path, 1000, 64);
    if (!sett.error) document.getElementById('weaver-sett').src = pngURL(sett);
    var woven = window.weaver.renderWoven(info.path, 480);
    if (!woven.error) document.getElementById('weaver-tartan').src = pngURL(woven);

    var tRender = performance.now();
    statLine('engine ' + Math.round(tWasm - t0) + ' ms, images ' + Math.round(tRender - tWasm) + ' ms');

    neighbours(info);
  }

  function paletteTable(palette) {
    var rows = palette.map(function (p) {
      return '<tr><td>' + esc(p.code) + '</td>' +
        '<td>' + swatch(p.hex) + ' <code>' + esc(p.hex) + '</code></td>' +
        '<td>' + esc(p.baseCode) + ' ' + swatch(p.baseHex) + '</td>' +
        '<td>' + p.deltaE.toFixed(2) + '</td></tr>';
    });
    return '<table><thead><tr><th>Colour</th><th>Shade</th><th>Base</th><th>ΔE (OKLab)</th></tr></thead>' +
      '<tbody>' + rows.join('') + '</tbody></table>';
  }

  /* Mirrors the static pages' colour chip (internal/dictionary cSwatch). */
  function swatch(hex) {
    return '<code style="background-color:' + hex + ';"><span style="color:' + hex +
      ';filter:grayscale(1) invert(1) contrast(100);">' + esc(hex) + '</span></code>';
  }

  /* Fetches the shipped ΔTartan index lazily — after the page is on screen — then lists the ten
   * nearest existing variants, linking into the static dictionary. */
  function neighbours(info) {
    var box = document.getElementById('weaver-nn');
    var tFetch = performance.now();
    Promise.all([
      fetch('/nn/index.v1.json').then(function (r) {
        if (!r.ok) throw new Error('index.v1.json: HTTP ' + r.status);
        return r.text();
      }),
      fetch('/nn/vecs.v1.bin').then(function (r) {
        if (!r.ok) throw new Error('vecs.v1.bin: HTTP ' + r.status);
        return r.arrayBuffer();
      })
    ]).then(function (parts) {
      var loaded = window.weaver.loadIndex(parts[0], new Uint8Array(parts[1]));
      if (loaded.error) throw new Error(loaded.error);
      var nn = window.weaver.neighbours(info.path, 10);
      if (nn.error) throw new Error(nn.error);
      var items = nn.hits.map(function (hit) {
        var name = hit.name || 'Unnamed variant';
        return '<li><a href="' + hit.url + '">' + esc(name) + '</a> — ΔTartan ' +
          hit.dist.toFixed(2) + '</li>';
      });
      box.innerHTML = '<h2>Nearest tartans</h2><p>The ten nearest existing variants by ΔTartan distance.</p>' +
        '<ol>' + items.join('') + '</ol>';
      statLine('neighbours over ' + loaded.count + ' variants in ' +
        Math.round(performance.now() - tFetch) + ' ms (fetch + index + query)');
    }).catch(function (err) {
      box.innerHTML = '<h2>Nearest tartans</h2><p>Unavailable: ' + esc(err.message || err) + '</p>';
    });
  }

  function statLine(msg) {
    var el = document.getElementById('weaver-stats');
    if (el) el.textContent = (el.textContent ? el.textContent + ' · ' : '') + msg;
  }
})();
