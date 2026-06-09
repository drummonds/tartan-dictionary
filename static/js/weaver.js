/* The in-browser weaver: boots the Go WASM tartan engine on the 404 app-shell and renders a full
 * variant page for any /setts/s<n>/<slug>/ URL that has no static page — the slug alone encodes
 * the whole cloth. Three entries: a bare sett URL renders read-only; an .../edit/ URL (linked from
 * every static variant page) adds the entry form pre-filled with that variant; /setts/new/ starts
 * from a blank form. Static pages keep working without this. Plain JS, no framework. */
(function () {
  'use strict';

  var SETT_PATH = /^\/setts\/s\d+\/[0-9a-z-]+\/(edit\/)?$/;
  var NEW_PATH = '/setts/new/';
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
    if (path !== NEW_PATH && !SETT_PATH.test(path)) return; // a genuinely unknown page: leave the 404 text
    var edit = path === NEW_PATH || /edit\/$/.test(path);
    boot(shell, path.replace(/edit\/$/, ''), edit).catch(function (err) {
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

  function boot(shell, path, edit) {
    status(shell, 'Weaving this tartan in your browser…');
    return loadEngine().then(function () {
      if (path === NEW_PATH) {
        shell.querySelector('.post-header h1').textContent = 'Weave a tartan';
        shell.querySelector('.post-text').innerHTML = '';
        showForm(shell, { palette: 'K#101010 W#F4F4F0', threadcount: 'K24 W24', name: '' });
        return;
      }
      var info = window.weaver.parsePath(path);
      if (info.error && info.hashed) {
        var m = /[#&]slug=([0-9a-z-]+)/.exec(location.hash);
        if (m) info = window.weaver.parseSlug(m[1]);
      }
      if (info.error) {
        status(shell, 'This sett address could not be read: ' + info.error);
        return;
      }
      if (info.corrected) setAddress(info, edit);
      render(shell, info, edit);
    });
  }

  /* Keeps the address bar on the canonical form of whatever is shown, preserving edit mode and
   * carrying the full slug in the fragment when the URL's leaf is a hashed file name. */
  function setAddress(info, edit) {
    var hashed = info.path.indexOf(info.slug) === -1;
    var url = info.path + (edit ? 'edit/' : '') + (hashed ? '#slug=' + info.slug : '');
    history.replaceState(null, '', url);
  }

  function render(shell, info, edit) {
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
    h.push('<div id="weaver-palette">' + paletteTable(info.palette, edit ? shadeRowsFor(info) : null) + '</div>');
    h.push('<h1>Sample pattern</h1>');
    h.push('<p><img id="weaver-tartan" alt="Tartan detail" title="' + esc(info.threadcount) + ' tartan"></p>');
    h.push('<div id="weaver-nn"><h2>Nearest tartans</h2><p>Measuring ΔTartan distances…</p></div>');
    h.push('<p>ID: ' + esc(info.path) + '</p>');
    if (!edit) {
      h.push('<p><a href="' + info.path + 'edit/' +
        (info.path.indexOf(info.slug) === -1 ? '#slug=' + info.slug : '') +
        '">⌗ Vary this tartan in the weaver</a> · <a href="/setts/new/">weave a new one</a></p>');
    }
    h.push('<p id="weaver-stats" style="color:#888;font-size:smaller"></p>');
    shell.querySelector('.post-text').innerHTML = h.join('\n');
    shell.querySelector('.post-header h1').textContent = info.name || 'Tartan variant (generated)';
    if (edit) {
      showForm(shell, {
        name: info.name || '',
        threadcount: info.threadcount,
        palette: info.palette.map(function (p) { return p.code + p.hex; }).join(' ')
      });
    }

    // Render by bare slug, not path: a giant sett's path leaf is a hashed file name the engine
    // cannot decode, while the slug always can be.
    var sett = window.weaver.renderSett(info.slug, 1000, 64);
    if (!sett.error) document.getElementById('weaver-sett').src = pngURL(sett);
    var woven = window.weaver.renderWoven(info.slug, 480);
    if (!woven.error) document.getElementById('weaver-tartan').src = pngURL(woven);

    if (edit) wireShadeButtons(shell, info);

    var tRender = performance.now();
    statLine('engine ' + Math.round(tWasm - t0) + ' ms, images ' + Math.round(tRender - tWasm) + ' ms');

    neighbours(info);
  }

  /* The first embedded supplier shade table (the STA legend for now; a chooser when more land). */
  var supplierCache = null;
  function supplier() {
    if (supplierCache === null) {
      var list = window.weaver.suppliers();
      supplierCache = (list && !list.error && list.length) ? list[0] : false;
    }
    return supplierCache;
  }

  function shadeRowsFor(info) {
    var sup = supplier();
    if (!sup) return null;
    var rows = window.weaver.shadeSteps(info.slug, sup.id);
    return rows.error ? null : rows;
  }

  /* One darker/lighter step along the supplier ladder: re-derive the variant, move the address
   * bar to its canonical URL, re-render in place. */
  function wireShadeButtons(shell, info) {
    var box = document.getElementById('weaver-palette');
    if (!box) return;
    box.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button[data-shade-hex]');
      if (!btn) return;
      ev.preventDefault();
      var next = window.weaver.applyShade(info.slug, btn.dataset.shadeCode, btn.dataset.shadeHex);
      if (next.error) {
        statLine('shade step failed: ' + next.error);
        return;
      }
      next.name = info.name || '';
      setAddress(next, true);
      render(shell, next, true);
    });
  }

  /* The entry form, shown above the rendered page in edit mode. Weaving re-renders in place and
   * moves the address bar to the new variant's canonical URL, so the result is shareable and a
   * reload lands on the static page when one exists. */
  function showForm(shell, fill) {
    var old = document.getElementById('weaver-form');
    if (old) old.remove();
    var form = document.createElement('form');
    form.id = 'weaver-form';
    form.style.cssText = 'border:1px solid #ddd;border-radius:6px;padding:0.8em 1em;margin:1em 0;';
    form.innerHTML =
      '<label style="display:block;margin:0.3em 0">Name (optional)<br>' +
      '<input name="name" style="width:100%" value="' + esc(fill.name) + '"></label>' +
      '<label style="display:block;margin:0.3em 0">Palette — colour codes and shades, e.g. <code>DB#00004C W#F4F4F0</code><br>' +
      '<input name="palette" style="width:100%" required value="' + esc(fill.palette) + '"></label>' +
      '<label style="display:block;margin:0.3em 0">Thread count — e.g. <code>DB24 W24</code><br>' +
      '<input name="threadcount" style="width:100%" required value="' + esc(fill.threadcount) + '"></label>' +
      '<button type="submit">Weave</button> <span id="weaver-form-err" style="color:#a00"></span>';
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = new FormData(form);
      var info = window.weaver.fromInput(
        String(f.get('name') || ''), String(f.get('palette')), String(f.get('threadcount')));
      var errEl = document.getElementById('weaver-form-err');
      if (info.error) {
        errEl.textContent = info.error;
        return;
      }
      errEl.textContent = '';
      info.name = String(f.get('name') || '');
      setAddress(info, true);
      render(shell, info, true);
    });
    var text = shell.querySelector('.post-text');
    text.parentNode.insertBefore(form, text);
  }

  function paletteTable(palette, shadeRows) {
    var byCode = {};
    (shadeRows || []).forEach(function (r) { byCode[r.code] = r; });
    var rows = palette.map(function (p) {
      var tr = '<tr><td>' + esc(p.code) + '</td>' +
        '<td>' + swatch(p.hex) + ' <code>' + esc(p.hex) + '</code></td>' +
        '<td>' + esc(p.baseCode) + ' ' + swatch(p.baseHex) + '</td>' +
        '<td>' + p.deltaE.toFixed(2) + '</td>';
      if (shadeRows) tr += '<td style="white-space:nowrap">' + shadeCell(p.code, byCode[p.code]) + '</td>';
      return tr + '</tr>';
    });
    var head = '<tr><th>Colour</th><th>Shade</th><th>Base</th><th>ΔE (OKLab)</th>' +
      (shadeRows ? '<th>Standard shade (' + esc(supplier().name) + ')</th>' : '') + '</tr>';
    return '<table><thead>' + head + '</thead><tbody>' + rows.join('') + '</tbody></table>';
  }

  /* The stepping cell: ▼ to the darker rung, the matched standard shade (≈ when the dye is not
   * exactly standard), ▲ to the lighter rung. */
  function shadeCell(code, row) {
    if (!row || !row.match) return '—';
    var html = stepBtn(code, row.prev, '▼', 'darker');
    html += ' ' + (row.exact ? '' : '≈ ') + esc(row.match.name) + ' ' + swatch(row.match.hex) + ' ';
    html += stepBtn(code, row.next, '▲', 'lighter');
    return html;
  }

  function stepBtn(code, step, arrow, title) {
    if (!step) return '<button disabled title="end of ladder">' + arrow + '</button>';
    return '<button data-shade-code="' + esc(code) + '" data-shade-hex="' + esc(step.hex) +
      '" title="' + title + ': ' + esc(step.name) + ' ' + esc(step.hex) + '">' + arrow + '</button>';
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
    loadIndexOnce().then(function (count) {
      var nn = window.weaver.neighbours(info.slug, 10);
      if (nn.error) throw new Error(nn.error);
      var items = nn.hits.map(function (hit) {
        var name = hit.name || 'Unnamed variant';
        return '<li><a href="' + hit.url + '">' + esc(name) + '</a> — ΔTartan ' +
          hit.dist.toFixed(2) + '</li>';
      });
      box.innerHTML = '<h2>Nearest tartans</h2><p>The ten nearest existing variants by ΔTartan distance.</p>' +
        '<ol>' + items.join('') + '</ol>';
      statLine('neighbours over ' + count + ' variants in ' +
        Math.round(performance.now() - tFetch) + ' ms (fetch + index + query)');
    }).catch(function (err) {
      box.innerHTML = '<h2>Nearest tartans</h2><p>Unavailable: ' + esc(err.message || err) + '</p>';
    });
  }

  var indexPromise = null;
  function loadIndexOnce() {
    if (indexPromise) return indexPromise;
    indexPromise = Promise.all([
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
      return loaded.count;
    }).catch(function (err) {
      indexPromise = null; // allow a retry on the next render
      throw err;
    });
    return indexPromise;
  }

  function statLine(msg) {
    var el = document.getElementById('weaver-stats');
    if (el) el.textContent = (el.textContent ? el.textContent + ' · ' : '') + msg;
  }
})();
