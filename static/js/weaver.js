/* The in-browser weaver behind the TTD (Total Tartan Dictionary) editor at /ttd/edit/, plus two
 * smaller jobs. The editor page boots the Go WASM tartan engine and is where tartans are woven
 * from scratch, varied shade by shade, and explored through their ΔTartan nearest neighbours —
 * arriving with #slug=<slug> opens that variant for editing (/ttd/ itself is the prose landing
 * page; it forwards any old #slug= address here). On the 404 app-shell, any /setts/s<n>/<slug>/
 * URL that has no static page is woven read-only — the slug alone encodes the whole cloth — and
 * the old .../edit/ and /setts/new/ addresses forward to the TTD editor. On static variant pages
 * the script only hydrates the print controls; the pages must read exactly as they do without it.
 * Plain JS, no framework. */
(function () {
  'use strict';

  var SETT_PATH = /^\/setts\/s\d+\/[0-9a-z-]+\/(edit\/)?$/;
  var NEW_PATH = '/setts/new/';
  var TTD_PATH = '/ttd/edit/';
  var t0 = performance.now();

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();

  var booted = false;
  function init() {
    if (booted) return;
    booted = true;
    var shell = document.getElementById('weaver-app');
    if (shell && shell.dataset.weaver === 'ttd') {
      bootTTD(shell);
      // Neighbour "open in TTD" links and shared addresses only change the fragment; bring the
      // fresh weaving into view, since the click came from deep in the neighbour list.
      window.addEventListener('hashchange', function () {
        bootTTD(shell);
        shell.scrollIntoView();
      });
      return;
    }
    if (shell && shell.dataset.weaver === 'shell') {
      var path = location.pathname;
      if (path === NEW_PATH) { // the old blank-form address — the TTD took the job
        location.replace(TTD_PATH);
        return;
      }
      if (!SETT_PATH.test(path)) return; // a genuinely unknown page: leave the 404 text
      if (/edit\/$/.test(path)) {
        // The old in-place editor: forward to the TTD, carrying the slug (hashed-leaf addresses
        // already carry theirs in the fragment; the leaf serves for everything else).
        var fm = /[#&]slug=([0-9a-z-]+)/.exec(location.hash);
        var leaf = path.replace(/edit\/$/, '').replace(/\/$/, '').split('/').pop();
        location.replace(TTD_PATH + '#slug=' + (fm ? fm[1] : leaf));
        return;
      }
      boot(shell, path).catch(function (err) {
        status(shell, 'The weaver could not start: ' + err);
      });
      return;
    }
    hydrateStatic();
  }

  /* On a static variant page, add the print controls (and honour the ?weaverprint= dev hook).
   * Editing and neighbour exploration live in the TTD — the page's "Edit this in the TTD" link
   * is plain HTML in the layout, so reading never pays for the engine. */
  function hydrateStatic() {
    var header = document.querySelector('.post-header h1');
    var text = document.querySelector('.post-text');
    var m = /^\/setts\/s\d+\/([0-9a-z-]+)\/$/.exec(location.pathname);
    var edit = document.querySelector('a.weaver-edit');
    var em = edit && /[#&]slug=([0-9a-z-]+)/.exec(edit.getAttribute('href') || '');
    var slug = (em && em[1]) || (m && m[1]);
    if (!slug || !text) return;

    if (!document.getElementById('weaver-print-controls')) {
      text.parentNode.insertBefore(
        printControls(slug, header ? header.textContent : document.title), text);
    }

    var pm = /[?&]weaverprint=(A[34])/.exec(location.search);
    if (pm) printSample(slug, pm[1], header ? header.textContent : document.title, true);
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

  /* The TTD entry: #slug=<slug> opens that variant for editing; no fragment starts from a blank
   * form. Re-entered on every fragment change. */
  function bootTTD(shell) {
    var m = /[#&]slug=([0-9a-z-]+)/.exec(location.hash);
    status(shell, m ? 'Weaving this tartan in your browser…' : 'Starting the weaver…');
    loadEngine().then(function () {
      if (!m) {
        shell.querySelector('.post-header h1').textContent = 'Weave a tartan';
        shell.querySelector('.post-text').innerHTML = '';
        showForm(shell, { palette: 'K#101010 W#F4F4F0', threadcount: 'K24 W24', name: '' });
        return;
      }
      var info = window.weaver.parseSlug(m[1]);
      if (info.error) {
        status(shell, 'This sett address could not be read: ' + info.error);
        return;
      }
      render(shell, info, true);
    }).catch(function (err) {
      status(shell, 'The weaver could not start: ' + err);
    });
  }

  /* The 404 app-shell: a sett URL with no static page is woven read-only. */
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
      if (info.corrected) setAddress(info, false);
      render(shell, info, false);
    });
  }

  /* Keeps the address bar on the canonical form of whatever is shown. In the TTD the cloth rides
   * in the fragment; on the 404 shell it is the path itself, with the full slug carried in the
   * fragment when the URL's leaf is a hashed file name. */
  function setAddress(info, ttd) {
    if (ttd) {
      history.replaceState(null, '', TTD_PATH + '#slug=' + info.slug);
      return;
    }
    var hashed = info.path.indexOf(info.slug) === -1;
    history.replaceState(null, '', info.path + (hashed ? '#slug=' + info.slug : ''));
  }

  /* Renders a variant into the shell. In the TTD editor (ttd=true) the layout is the working
   * one — woven cloth first, then the sett, the palette with its shade-jog controls, and the
   * nearest-neighbour sections — kept deliberately spare; the read-only 404 shell keeps the
   * variant pages' reading order and links into the editor instead. */
  function render(shell, info, ttd) {
    var tWasm = performance.now();
    var h = [];
    if (ttd) {
      h.push('<p><img id="weaver-tartan" alt="Tartan detail" title="' + esc(info.threadcount) + ' tartan"></p>');
      h.push('<p>In pattern <a href="' + info.patternURL + '">' + esc(info.pattern) + '</a> · <a href="/stripes/stripes' +
        info.stripes + '/">' + info.stripes + ' stripes</a></p>');
      h.push('<h2>Thread count</h2>');
      h.push('<p>' + esc(info.threadcount) + '</p>');
      h.push('<p><img id="weaver-sett" alt="Sett"></p>');
      h.push('<h2>Palette</h2>');
      h.push('<div id="weaver-palette">' + paletteTable(info.palette, shadeRowsFor(info)) + '</div>');
      h.push('<div id="weaver-nn"><h2>Nearest tartans</h2><p>Measuring ΔTartan distances…</p></div>');
      h.push('<p>ID: <a href="' + info.path + '">' + esc(info.path) + '</a> — this address alone encodes the cloth.</p>');
    } else {
      h.push('<p>In pattern <a href="' + info.patternURL + '">' + esc(info.pattern) + '</a>.</p>');
      h.push('<p>Woven on demand in your browser. It is a <a href="/stripes/stripes' +
        info.stripes + '/">' + info.stripes + ' stripes tartan</a>.</p>');
      h.push('<h2>Thread count</h2>');
      h.push('<p>' + esc(info.threadcount) + '</p>');
      h.push('<p><img id="weaver-sett" alt="Sett"></p>');
      h.push('<h2>Palette</h2>');
      h.push('<p>Each colour and its ΔE from the base-6 reference it is a variant of.</p>');
      h.push('<div id="weaver-palette">' + paletteTable(info.palette, null) + '</div>');
      h.push('<h1>Sample pattern</h1>');
      h.push('<p><img id="weaver-tartan" alt="Tartan detail" title="' + esc(info.threadcount) + ' tartan"></p>');
      h.push('<p>ID: ' + esc(info.path) + '</p>');
    }
    h.push('<p id="weaver-print-slot"></p>');
    if (!ttd) {
      h.push('<p><a href="' + TTD_PATH + '#slug=' + info.slug +
        '">⌗ Edit this in the TTD</a> · <a href="' + TTD_PATH + '">weave a new one</a></p>');
    }
    h.push('<p id="weaver-stats" style="color:#888;font-size:smaller"></p>');
    shell.querySelector('.post-text').innerHTML = h.join('\n');
    shell.querySelector('.post-header h1').textContent = info.name || 'Tartan variant (generated)';
    if (ttd) {
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

    if (ttd) wireShadeButtons(shell, info);
    var slot = document.getElementById('weaver-print-slot');
    if (slot) slot.replaceWith(printControls(info.slug, info.name || 'Tartan variant'));

    var tRender = performance.now();
    statLine('engine ' + Math.round(tWasm - t0) + ' ms, images ' + Math.round(tRender - tWasm) + ' ms');

    if (ttd) renderExtras(document.getElementById('weaver-nn'), info.slug);
  }

  /* The embedded supplier shade tables — the palettes (Tartan Dictionary roles, the STA legend,
   * mill cards as they land) the weaver navigates against. The chooser keeps its selection across
   * re-renders. */
  var supplierCache = null;
  var supplierId = null;
  function suppliers() {
    if (supplierCache === null) {
      var list = window.weaver.suppliers();
      supplierCache = (list && !list.error && list.length) ? list : [];
      if (supplierCache.length && supplierId === null) supplierId = supplierCache[0].id;
    }
    return supplierCache;
  }
  function supplier() {
    var list = suppliers();
    for (var i = 0; i < list.length; i++) if (list[i].id === supplierId) return list[i];
    return list.length ? list[0] : false;
  }

  function shadeRowsFor(info) {
    var sup = supplier();
    if (!sup) return null;
    /* Defensive: a wasm/js skew (or an engine fault) must degrade to a plain palette table,
     * not kill the whole page boot. */
    if (typeof window.weaver.shadeWheel !== 'function') return null;
    var rows = window.weaver.shadeWheel(info.slug, sup.id);
    return (!rows || rows.error) ? null : rows;
  }

  /* One jog on the supplier wheel — darker/lighter along the ladder or round the hue ring:
   * re-derive the variant, move the address bar to its canonical TTD address, re-render in place.
   * The palette chooser swaps the supplier and redraws the table without changing the tartan. */
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
    box.addEventListener('change', function (ev) {
      var sel = ev.target.closest('select[data-shade-supplier]');
      if (!sel) return;
      supplierId = sel.value;
      box.innerHTML = paletteTable(info.palette, shadeRowsFor(info));
    });
  }

  /* The entry form, shown above the rendered page in the TTD. Weaving re-renders in place and
   * moves the address bar to the new variant's TTD address, so the result is shareable. */
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
      (shadeRows ? '<th>Standard shade ' + supplierChooser() + '</th>' : '') + '</tr>';
    return '<table><thead>' + head + '</thead><tbody>' + rows.join('') + '</tbody></table>';
  }

  /* The palette chooser: plain text for a single table, a select once several are embedded. */
  function supplierChooser() {
    var list = suppliers();
    if (list.length < 2) return '(' + esc(supplier().name) + ')';
    var opts = list.map(function (s) {
      return '<option value="' + esc(s.id) + '"' + (s.id === supplier().id ? ' selected' : '') +
        '>' + esc(s.name) + '</option>';
    });
    return '<select data-shade-supplier>' + opts.join('') + '</select>';
  }

  /* The jog cell: the matched standard shade (≈ when the dye is not exactly standard, [ref] when
   * the supplier has a catalogue number), ▼/▲ one rung darker/lighter — past a family's ends the
   * black and white caps — and ◀/▶ one stop round the hue ring at the same lightness. */
  function shadeCell(code, row) {
    if (!row || !row.match) return '—';
    var html = stepBtn(code, row.prev, '◀', 'previous hue');
    html += ' ' + stepBtn(code, row.darker, '▼', 'darker');
    html += ' ' + (row.exact ? '' : '≈ ') + esc(row.match.name) +
      (row.match.ref ? ' [' + esc(row.match.ref) + ']' : '') + ' ' + swatch(row.match.hex) + ' ';
    html += stepBtn(code, row.lighter, '▲', 'lighter');
    html += ' ' + stepBtn(code, row.next, '▶', 'next hue');
    return html;
  }

  function stepBtn(code, step, arrow, title) {
    if (!step) return '<button disabled title="nothing that way">' + arrow + '</button>';
    return '<button data-shade-code="' + esc(code) + '" data-shade-hex="' + esc(step.hex) +
      '" title="' + title + ': ' + esc(step.name) + ' ' + esc(step.hex) + '">' + arrow + '</button>';
  }

  /* Mirrors the static pages' colour chip (internal/dictionary cSwatch). */
  function swatch(hex) {
    return '<code style="background-color:' + hex + ';"><span style="color:' + hex +
      ';filter:grayscale(1) invert(1) contrast(100);">' + esc(hex) + '</span></code>';
  }

  /* Fetches the shipped ΔTartan index lazily, then fills container with the ten nearest existing
   * variants and the neighbour map. Each neighbour can be opened either in the TTD (staying in
   * the navigator) or on its own page in the dictionary; hashed-leaf URLs cannot be re-encoded as
   * a fragment slug, so those offer only their page. */
  function renderExtras(container, slug) {
    container.innerHTML = '<h2>Nearest tartans</h2><p>Measuring ΔTartan distances…</p>';
    var tFetch = performance.now();
    loadIndexOnce().then(function (loaded) {
      var nn = window.weaver.neighbours(slug, 10);
      if (nn.error) throw new Error(nn.error);
      nn.hits.forEach(function (hit) {
        var dec = window.weaver.parsePath(hit.url);
        hit.ttdSlug = dec.error ? null : dec.slug;
      });
      var items = nn.hits.map(function (hit) {
        var name = hit.name || 'Unnamed variant';
        return '<li>' +
          (hit.ttdSlug ? '<a href="' + TTD_PATH + '#slug=' + hit.ttdSlug + '">' + esc(name) + '</a>' : esc(name)) +
          ' — ΔTartan ' + hit.dist.toFixed(2) +
          ' · <a href="' + hit.url + '">page</a></li>';
      });
      var pct = Math.round((loaded.explained[0] + loaded.explained[1]) * 100);
      container.innerHTML = '<h2>Nearest tartans</h2><p>The ten nearest existing variants by ΔTartan ' +
        'distance. A name opens its neighbour here in the TTD; <em>page</em> steps out to its entry ' +
        'in the dictionary.</p>' +
        '<ol>' + items.join('') + '</ol>' +
        '<h2>Neighbour map</h2><p>Every grey dot is one of ' + loaded.count +
        ' existing variants placed by the first two principal components of the ΔTartan feature space (' +
        pct + '% of its variance). Red is this tartan; blue dots are its ten nearest — click one to open it here.</p>';
      var cloud = window.weaver.plotCloud(2500);
      if (!cloud.error) drawPlot(container, cloud, nn);
      statLine('neighbours over ' + loaded.count + ' variants in ' +
        Math.round(performance.now() - tFetch) + ' ms (fetch + index + query)');
    }).catch(function (err) {
      container.innerHTML = '<h2>Nearest tartans</h2><p>Unavailable: ' + esc(err.message || err) + '</p>';
    });
  }

  /* The neighbour map: corpus cloud in grey, the ten nearest in blue (clickable, opening in the
   * TTD where the slug allows, else on their page), this tartan in red. Plain canvas — 2,500
   * background points is nothing to draw but plenty of shape. */
  function drawPlot(container, cloud, nn) {
    var W = Math.min(640, container.clientWidth || 640), H = 380, pad = 14;
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.style.cssText = 'max-width:100%;border:1px solid #e0e0e0;border-radius:4px;display:block';
    container.appendChild(canvas);

    // Frame the bulk of the cloud (1st–99th percentile), not its extreme outliers, but always
    // include this tartan and its neighbours; background points outside the frame are skipped.
    function pct(sorted, q) { return sorted[Math.floor(q * (sorted.length - 1))]; }
    var xs = cloud.map(function (p) { return p[0]; }).sort(function (a, b) { return a - b; });
    var ys = cloud.map(function (p) { return p[1]; }).sort(function (a, b) { return a - b; });
    var minX = pct(xs, 0.01), maxX = pct(xs, 0.99), minY = pct(ys, 0.01), maxY = pct(ys, 0.99);
    function grow(x, y) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    grow(nn.x, nn.y);
    nn.hits.forEach(function (h) { grow(h.x, h.y); });
    if (maxX === minX) maxX = minX + 1;
    if (maxY === minY) maxY = minY + 1;
    function sx(x) { return pad + (x - minX) / (maxX - minX) * (W - 2 * pad); }
    function sy(y) { return H - pad - (y - minY) / (maxY - minY) * (H - 2 * pad); }

    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#d8d8d8';
    cloud.forEach(function (p) {
      if (p[0] < minX || p[0] > maxX || p[1] < minY || p[1] > maxY) return;
      ctx.fillRect(sx(p[0]) - 1, sy(p[1]) - 1, 2, 2);
    });

    function dot(x, y, r, fill) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = fill;
      ctx.fill();
    }
    var marks = nn.hits.map(function (h) {
      return { x: sx(h.x), y: sy(h.y), url: h.url, slug: h.ttdSlug, name: h.name };
    });
    marks.forEach(function (m) { dot(m.x, m.y, 4, '#3465a4'); });
    dot(sx(nn.x), sy(nn.y), 5, '#c00000');

    function markAt(ev) {
      var r = canvas.getBoundingClientRect();
      var x = (ev.clientX - r.left) * (W / r.width), y = (ev.clientY - r.top) * (H / r.height);
      for (var i = 0; i < marks.length; i++) {
        var dx = marks[i].x - x, dy = marks[i].y - y;
        if (dx * dx + dy * dy <= 64) return marks[i];
      }
      return null;
    }
    canvas.addEventListener('mousemove', function (ev) {
      var m = markAt(ev);
      canvas.style.cursor = m ? 'pointer' : 'default';
      canvas.title = m ? (m.name || 'Unnamed variant') : '';
    });
    canvas.addEventListener('click', function (ev) {
      var m = markAt(ev);
      if (!m) return;
      if (m.slug) location.hash = '#slug=' + m.slug; // stays in the TTD; hashchange re-boots
      else location.href = m.url;
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
      return loaded; // {count, explained}
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

  /* "Print sample sheet: A4 A3" — on static variant pages and weaver pages alike. The engine
   * loads on first click, so the buttons cost nothing until used. */
  function printControls(slug, title) {
    var p = document.createElement('p');
    p.id = 'weaver-print-controls';
    p.appendChild(document.createTextNode('Print sample sheet: '));
    ['A4', 'A3'].forEach(function (size) {
      var b = document.createElement('button');
      b.textContent = size;
      b.addEventListener('click', function () { printSample(slug, size, title, false); });
      p.appendChild(b);
      p.appendChild(document.createTextNode(' '));
    });
    return p;
  }

  /* Builds the dedicated print sheet — title, threadcount, palette, woven sample re-rendered at
   * print resolution from the slug — then prints it at the chosen paper size. print.css hides
   * everything else while body carries the weaver-printing class. preview=true (the ?weaverprint=
   * dev hook) shows the sheet on screen instead of printing. */
  function printSample(slug, size, title, preview) {
    loadEngine().then(function () {
      var info = window.weaver.parseSlug(slug);
      if (info.error) throw new Error(info.error);

      var old = document.getElementById('weaver-print-sheet');
      if (old) old.remove();
      var sheet = document.createElement('div');
      sheet.id = 'weaver-print-sheet';
      sheet.style.display = 'none';
      sheet.innerHTML =
        '<h1>' + esc(title || 'Tartan variant') + '</h1>' +
        '<p class="weaver-print-id">' + esc(location.origin + info.path) + '</p>' +
        '<h2>Thread count</h2>' +
        '<p class="weaver-print-threadcount">' + esc(info.threadcount) + '</p>' +
        '<p><img class="weaver-print-sett" alt="Sett"></p>' +
        '<h2>Palette</h2>' +
        paletteTable(info.palette) +
        '<div class="weaver-print-sample"><h2>Woven sample</h2>' +
        '<p><img class="weaver-print-tartan" alt="Woven sample"></p></div>';
      document.body.appendChild(sheet);

      var settPNG = window.weaver.renderSett(info.slug, 2000, 120);
      var wovenPNG = window.weaver.renderWoven(info.slug, 2048);
      if (settPNG.error || wovenPNG.error) throw new Error(settPNG.error || wovenPNG.error);
      var settImg = sheet.querySelector('.weaver-print-sett');
      var wovenImg = sheet.querySelector('.weaver-print-tartan');
      settImg.src = pngURL(settPNG);
      wovenImg.src = pngURL(wovenPNG);

      var style = document.getElementById('weaver-page-size');
      if (!style) {
        style = document.createElement('style');
        style.id = 'weaver-page-size';
        document.head.appendChild(style);
      }
      style.textContent = '@page { size: ' + size + ' }';

      // Both images must be decoded before print, or the sheet comes out blank.
      return Promise.all([settImg.decode(), wovenImg.decode()]).then(function () {
        if (preview) {
          sheet.style.display = 'block';
          return;
        }
        document.body.classList.add('weaver-printing');
        var done = function () {
          document.body.classList.remove('weaver-printing');
          window.removeEventListener('afterprint', done);
        };
        window.addEventListener('afterprint', done);
        window.print();
      });
    }).catch(function (err) {
      alert('Could not build the print sheet: ' + (err.message || err));
    });
  }
})();
