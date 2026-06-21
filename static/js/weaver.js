/* The in-browser weaver behind the TTD (Total Tartan Dictionary) editor at /ttd/edit/, plus two
 * smaller jobs. The editor page boots the Go WASM tartan engine and is where tartans are woven
 * from scratch, varied shade by shade, and explored through their ΔTartan nearest neighbours —
 * arriving with #slug=<slug> opens that variant for editing (/ttd/ itself is the prose landing
 * page; it forwards any old #slug= address here). On the 404 app-shell, any /setts/s<n>/<slug>/
 * URL that has no static page is woven read-only — the slug alone encodes the whole cloth — and
 * the old .../edit/ and /setts/new/ addresses forward to the TTD editor. On static variant pages
 * the script only hydrates the print controls; the pages must read exactly as they do without it.
 * Posts carrying a {{< collection_poster >}} shortcode get "Print collection poster: A4 A3 A2"
 * controls the same way — the poster is woven at print resolution on first click.
 * Plain JS, no framework. */
(function () {
  'use strict';

  var SETT_PATH = /^\/setts\/s\d+\/[0-9a-z~-]+\/(edit\/)?$/;
  var NEW_PATH = '/setts/new/';
  var TTD_PATH = '/ttd/edit/';
  var t0 = performance.now();

  /* The paper sizes the print sheets come in. A2 is not a CSS @page keyword, so it goes by
   * measure; px sizes the woven render so the printed cloth stays comfortably crisp. Assigned
   * before init() can run — the deferred script calls it synchronously. */
  var PAPER = {
    A4: { page: 'A4', px: 1400 },
    A3: { page: 'A3', px: 2000 },
    A2: { page: '420mm 594mm', px: 2800 }
  };

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
        var fm = /[#&]slug=([0-9a-z~-]+)/.exec(location.hash);
        var leaf = path.replace(/edit\/$/, '').replace(/\/$/, '').split('/').pop();
        location.replace(TTD_PATH + '#slug=' + (fm ? fm[1] : leaf));
        return;
      }
      boot(shell, path).catch(function (err) {
        status(shell, 'The weaver could not start: ' + err);
      });
      return;
    }
    hydrateCollections();
    hydrateStatic();
  }

  /* On a static variant page, add the print controls (and honour the ?weaverprint= dev hook).
   * Editing and neighbour exploration live in the TTD — the page's "Edit this in the TTD" link
   * is plain HTML in the layout, so reading never pays for the engine. */
  function hydrateStatic() {
    var header = document.querySelector('.post-header h1');
    var text = document.querySelector('.post-text');
    var m = /^\/setts\/s\d+\/([0-9a-z~-]+)\/$/.exec(location.pathname);
    var edit = document.querySelector('a.weaver-edit');
    var em = edit && /[#&]slug=([0-9a-z~-]+)/.exec(edit.getAttribute('href') || '');
    var slug = (em && em[1]) || (m && m[1]);
    if (!slug || !text) return;

    if (!document.getElementById('weaver-print-controls')) {
      text.parentNode.insertBefore(
        printControls(slug, header ? header.textContent : document.title), text);
    }

    var pm = /[?&]weaverprint=(A[234])/.exec(location.search);
    if (pm && PAPER[pm[1]]) printSample(slug, pm[1], header ? header.textContent : document.title, true);
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

  /* Weave the whole sett tessellated across a page-sized image (at the cloth's real density), open it
   * in a new tab, and offer it for download. Popup-blocked? fall back to a direct download. */
  function weaveFullPage(info) {
    var tpcm = (typeof window.weaver.tpcmOf === 'function') ? window.weaver.tpcmOf(info.slug) : 16;
    var png = window.weaver.renderWoven(info.slug, 1400, tpcm, 1800);
    if (!png || png.error) {
      statLine('full-page weave failed: ' + ((png && png.error) || 'unknown'));
      return;
    }
    var url = pngURL(png);
    var file = ((info.name || 'tartan').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'tartan') + '.png';
    var win = window.open('', '_blank');
    if (win) {
      win.document.write('<!doctype html><meta charset="utf-8"><title>' + esc(file) + '</title>' +
        '<body style="margin:0;background:#222;text-align:center;font:14px system-ui">' +
        '<p style="margin:.5em"><a href="' + url + '" download="' + esc(file) + '" style="color:#9cf">⤓ Download ' + esc(file) + '</a></p>' +
        '<img src="' + url + '" style="max-width:100%;height:auto">' +
        '</body>');
      win.document.close();
    } else {
      var a = document.createElement('a');
      a.href = url;
      a.download = file;
      a.click();
    }
  }

  function wireFullPage(shell, info) {
    var btn = document.getElementById('weaver-fullpage');
    if (btn) btn.addEventListener('click', function () { weaveFullPage(info); });
  }

  /* The TTD entry: #slug=<slug> opens that variant for editing; no fragment starts from a blank
   * form. Re-entered on every fragment change. */
  function bootTTD(shell) {
    var m = /[#&]slug=([0-9a-z~-]+)/.exec(location.hash);
    status(shell, m ? 'Weaving this tartan in your browser…' : 'Starting the weaver…');
    loadEngine().then(function () {
      if (!m) {
        // No sett chosen: open a plain starter cloth straight in the inline editor (recolour stripes,
        // change the counts, add or delete stripes) — there is no separate entry form any more.
        var blank = window.weaver.fromInput('', 'K#101010 W#F4F4F0', 'K24 W24');
        if (blank.error) { status(shell, 'The weaver could not start: ' + blank.error); return; }
        setAddress(blank, true);
        render(shell, blank, true);
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
        var m = /[#&]slug=([0-9a-z~-]+)/.exec(location.hash);
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
      // Keep any pinned baseline AND any custom (unregistered) name in the fragment, so both survive
      // shade jogs, scale steps and sharing.
      var base = baseSlugFromHash();
      var nm = customName(info);
      history.replaceState(null, '', TTD_PATH + '#slug=' + info.slug +
        (base ? '&base=' + base : '') + (nm ? '&name=' + encodeURIComponent(nm) : ''));
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
    // A registered sett carries its name and Scottish Register badge from the embedded lookup, and the
    // name is not editable. An unregistered cloth carries the name you give it in the fragment
    // (&name=…); the slug alone has none.
    var reg = registryRef(info.slug);
    if (reg) {
      info.name = (typeof window.weaver.nameOf === 'function' && window.weaver.nameOf(info.slug)) || info.name || '';
    } else if (!info.name) {
      info.name = nameFromHash();
    }
    var h = [];
    if (ttd) {
      // The palette list is the working surface: one row per stripe, in sett order — recolour it,
      // step its thread count, and jog its standard shade, all in one place. Base/ΔE live in
      // base-tartan comparison (the pinned baseline), not in editing a cloth on its own.
      h.push('<h2>Palette &amp; thread count</h2>');
      h.push('<div id="weaver-palette">' + paletteEditor(info) + '</div>');
      h.push(scaleControls(info));
      h.push('<p><img id="weaver-tartan" alt="Tartan detail" title="' + esc(info.threadcount) + ' tartan"></p>');
      h.push('<p><button type="button" id="weaver-fullpage">⤢ Weave full page</button> — tessellate the sett across a page (opens a downloadable image)</p>');
      h.push('<p>In pattern <a href="' + info.patternURL + '">' + esc(info.pattern) + '</a> · <a href="/stripes/stripes' +
        info.stripes + '/">' + info.stripes + ' stripes</a></p>');
      // For a registered tartan, link out to its Tartan Dictionary pages: the parent tartan (the
      // /tartans/ identity these variants share) and this variant's own page.
      if (reg) {
        h.push('<p>On the Tartan Dictionary: <a href="' + info.tartanURL + '">parent tartan</a> · <a href="' +
          info.path + '">this variant</a></p>');
      }
      h.push(baselineSection(info));
      h.push('<p><img id="weaver-sett" alt="Sett"></p>');
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
    var head1 = shell.querySelector('.post-header h1');
    head1.textContent = info.name || 'Tartan variant (generated)';
    // The registry badge sits beside the name, linking the tartan's page on the Scottish Register.
    if (reg) head1.insertAdjacentHTML('beforeend', ' ' + regBadge(reg));
    // Render by bare slug, not path: a giant sett's path leaf is a hashed file name the engine
    // cannot decode, while the slug always can be.
    var sett = window.weaver.renderSett(info.slug, 1000, 64);
    if (!sett.error) document.getElementById('weaver-sett').src = pngURL(sett);
    // Weave the woven sample across the full content width (880px) at the cloth's real thread density
    // (threads/cm), so it reads life-size — the default ~16, a coarse cloth like Falkirk ~8.
    var tpcm = (typeof window.weaver.tpcmOf === 'function') ? window.weaver.tpcmOf(info.slug) : 16;
    var woven = window.weaver.renderWoven(info.slug, 880, tpcm);
    if (!woven.error) document.getElementById('weaver-tartan').src = pngURL(woven);

    if (ttd) {
      wireThreadEditor(shell, info);
      wireShadeButtons(shell, info);
      wireScale(shell, info);
      wireBaseline(shell, info);
      wireFullPage(shell, info);
    }
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
      box.innerHTML = paletteEditor(info);
    });
  }

  /* The sett's repeat/scale — the ~x<n> factor the canonical slug carries: one number scaling the
   * whole cloth, so a fine 2/2 and a broad 50/50 of one structure differ only here. −/+ step the
   * multiple of the unit sett; ×1 is the bare unit proportion (no scale tail). */
  function scaleControls(info) {
    var n = info.scale || 1;
    var box = 'width:1.8em;height:1.8em;padding:0;line-height:1.8em;vertical-align:middle;cursor:pointer';
    return '<p id="weaver-scale">Repeat / scale: ' +
      '<button data-scale="-1"' + (n <= 1 ? ' disabled' : '') +
      ' title="decrease scale (×' + (n - 1) + ')" style="' + box + '">−</button> ' +
      '<strong>×' + n + '</strong> ' +
      '<button data-scale="1" title="increase scale (×' + (n + 1) + ')" style="' + box + '">+</button> ' +
      '<span style="color:#888;font-size:smaller">whole-sett thread scale</span></p>';
  }

  /* One scale step: rebuild the slug at the new ~x<n> (dropping the tail at x1) and re-render in
   * place, exactly as a shade jog does — the structure (unit proportion) is untouched. */
  function wireScale(shell, info) {
    var box = document.getElementById('weaver-scale');
    if (!box) return;
    box.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button[data-scale]');
      if (!btn) return;
      ev.preventDefault();
      var cur = info.scale || 1;
      var n = Math.max(1, cur + parseInt(btn.dataset.scale, 10));
      if (n === cur) return;
      var structure = info.slug.replace(/~x\d+$/, '');
      var next = window.weaver.parseSlug(n > 1 ? structure + '~x' + n : structure);
      if (next.error) { statLine('scale change failed: ' + next.error); return; }
      next.name = info.name || '';
      setAddress(next, true);
      render(shell, next, true);
    });
  }

  /* ---- Stage 2: inline thread-count editing (epic #36) ----
   * parseStripes turns the canonical thread count back into an ordered [{code,pivot,count,hex}]
   * list the editor mutates. Count edits keep the colour and only re-factor the ~xN scale when the
   * GCD changes; Stage 3 (below) reuses this to add/delete/recolour stripes. */
  function parseStripes(info) {
    var hex = {};
    (info.palette || []).forEach(function (p) { hex[p.code] = p.hex; });
    return String(info.threadcount).split(/\s+/).filter(Boolean).map(function (t) {
      var m = /^([A-Za-z]+)(\/?)(\d+)$/.exec(t);
      if (!m) return null;
      var code = m[1].toUpperCase();
      return { code: code, pivot: m[2] === '/', count: parseInt(m[3], 10), hex: hex[code] || '#ccc' };
    }).filter(Boolean);
  }

  /* ---- Stage 3: add / delete threads, recolour per stripe (epic #36) ----
   * Rebuild the whole sett from a per-stripe [{hex,count}] list: each distinct colour gets a
   * transient code, then fromInput re-derives the canonical human-palette codes. This makes a
   * per-stripe colour picker recolour one stripe (or introduce a brand-new colour) without
   * touching its neighbours, and lets stripes be inserted/deleted. Pivots are by position (the
   * reflective half-sett's first and last), so add/delete re-marks them automatically. */
  function rebuildFromStripes(shell, info, stripes) {
    var codeOf = {}, pal = [], n = 0;
    function codeFor(hex) {
      hex = hex.toUpperCase();
      if (!(hex in codeOf)) {
        var c = n < 26 ? String.fromCharCode(65 + n) : 'Z' + n;
        n++; codeOf[hex] = c; pal.push(c + hex);
      }
      return codeOf[hex];
    }
    var last = stripes.length - 1;
    var tc = stripes.map(function (s, i) {
      return codeFor(s.hex) + ((i === 0 || i === last) ? '/' : '') + s.count;
    }).join(' ');
    var next = window.weaver.fromInput(info.name || '', pal.join(' '), tc);
    if (next.error) { statLine('thread edit failed: ' + next.error); return; }
    next.name = info.name || '';
    setAddress(next, true);
    render(shell, next, true);
  }

  /* The combined palette list (epic #36): one row per stripe in sett order, folding the thread-count
   * editor and the per-colour shade jog into a single surface — recolour the stripe, step its count,
   * insert/delete it, and jog its standard shade. Returns the inner HTML for #weaver-palette (the
   * supplier-change redraw reuses it). Base/ΔE are deliberately absent — they belong to base-tartan
   * comparison, not to editing a cloth on its own. */
  function paletteEditor(info) {
    var shadeRows = shadeRowsFor(info);
    var byCode = {};
    (shadeRows || []).forEach(function (r) { byCode[r.code] = r; });
    var btn = 'width:1.6em;height:1.7em;padding:0;line-height:1.7em;vertical-align:middle;cursor:pointer';
    var rows = parseStripes(info).map(function (s, i) {
      var jog = shadeRows ? shadeCell(s.code, byCode[s.code]) : '';
      return '<div class="thread-stripe" data-i="' + i + '" style="display:flex;align-items:center;' +
        'gap:.3em;flex-wrap:wrap;padding:3px 0;border-top:1px solid #f0f0f0">' +
        '<input type="color" data-hex value="' + s.hex.toLowerCase() + '" title="recolour this stripe (' +
        esc(s.code) + ') — pick any shade, or a new colour" aria-label="' + esc(s.code) + ' colour" ' +
        'style="width:1.8em;height:1.8em;padding:0;border:1px solid #0003;cursor:pointer">' +
        '<strong style="min-width:2.2em;text-align:center">' + esc(s.code) + (s.pivot ? '/' : '') + '</strong>' +
        '<button data-step="-1" title="one thread fewer" style="' + btn + '">−</button>' +
        '<input type="number" min="1" value="' + s.count + '" data-count aria-label="' + esc(s.code) +
        ' threads" style="width:3.4em;text-align:center;margin:0 1px">' +
        '<button data-step="1" title="one thread more" style="' + btn + '">＋</button>' +
        '<button data-ins title="insert a stripe after this one" style="' + btn + ';margin-left:2px">⊕</button>' +
        '<button data-del title="delete this stripe" style="' + btn + '">✕</button>' +
        (jog ? '<span style="margin-left:.5em">' + jog + '</span>' : '') +
        '</div>';
    });
    return rows.join('') +
      '<div style="margin-top:.5em">' +
      '<button data-add title="add a stripe at the end">＋ stripe</button>' +
      (shadeRows ? ' <span style="color:#888;font-size:smaller">standard shade ' + supplierChooser() + '</span>' : '') +
      '</div>';
  }

  function wireThreadEditor(shell, info) {
    var box = document.getElementById('weaver-palette');
    if (!box) return;
    // Apply fn to a fresh {hex,count} copy of the stripes; null ⇒ no-op (nothing changed / blocked).
    function mutate(fn) {
      var out = fn(parseStripes(info).map(function (s) { return { hex: s.hex, count: s.count }; }));
      if (out) rebuildFromStripes(shell, info, out);
    }
    function idx(el) { var c = el.closest('.thread-stripe'); return c ? +c.dataset.i : -1; }
    box.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      ev.preventDefault();
      var i = idx(b);
      if (b.hasAttribute('data-step')) {
        mutate(function (s) {
          var v = Math.max(1, s[i].count + parseInt(b.dataset.step, 10));
          if (v === s[i].count) return null; s[i].count = v; return s;
        });
      } else if (b.hasAttribute('data-ins')) {
        mutate(function (s) { s.splice(i + 1, 0, { hex: s[i].hex, count: s[i].count }); return s; });
      } else if (b.hasAttribute('data-del')) {
        mutate(function (s) {
          if (s.length <= 2) { statLine('a sett needs at least two stripes'); return null; }
          s.splice(i, 1); return s;
        });
      } else if (b.hasAttribute('data-add')) {
        mutate(function (s) { s.push({ hex: s[s.length - 1].hex, count: 2 }); return s; });
      }
    });
    box.addEventListener('change', function (ev) {
      var el = ev.target;
      if (el.matches && el.matches('input[data-count]')) {
        var i = idx(el);
        mutate(function (s) {
          var v = Math.max(1, parseInt(el.value, 10) || 1);
          if (v === s[i].count) return null; s[i].count = v; return s;
        });
      } else if (el.matches && el.matches('input[data-hex]')) {
        var j = idx(el);
        mutate(function (s) { s[j].hex = el.value.toUpperCase(); return s; });
      }
    });
  }

  /* ---- Stage 1: pin a baseline, reset to it, diff against it (epic #36) ----
   * The baseline rides in the fragment as &base=<slug> next to the working &slug=, so a comparison
   * is shareable and survives the per-edit re-render. */
  function baseSlugFromHash() {
    var m = /[#&]base=([0-9a-z~-]+)/.exec(location.hash);
    return m ? m[1] : null;
  }

  // The custom name an unregistered cloth carries in the fragment (&name=…). Empty for a registered
  // sett, whose name comes from the lookup instead.
  function nameFromHash() {
    var m = /[#&]name=([^&]*)/.exec(location.hash);
    try { return m ? decodeURIComponent(m[1]) : ''; } catch (e) { return ''; }
  }

  function registryRef(slug) {
    return (typeof window.weaver.registryRefOf === 'function') ? (window.weaver.registryRefOf(slug) || '') : '';
  }

  // The editable name applies only to an unregistered cloth; a registered sett's name is the lookup's.
  function customName(info) {
    return (info.name && !registryRef(info.slug)) ? info.name : '';
  }

  // The Scottish Register badge: a pill beside the name linking the tartan's page on the register. The
  // register's emblem (currentColor, so it takes the pill's blue) stands in for the letters "SRT".
  function regBadge(ref) {
    return '<a href="https://www.tartanregister.gov.uk/tartanDetails?ref=' + encodeURIComponent(ref) +
      '" target="_blank" rel="noopener" title="Scottish Register of Tartans #' + esc(ref) + '" ' +
      'style="display:inline-block;padding:.05em .55em;border:1px solid #1a4f8b;border-radius:1em;' +
      'font-size:.8rem;font-weight:400;color:#1a4f8b;text-decoration:none;background:#1a4f8b14;vertical-align:middle">' +
      '<img src="/img/srt.svg" alt="Scottish Register of Tartans" style="height:1em;width:auto;vertical-align:-.15em">&nbsp;#' +
      esc(ref) + '</a>';
  }

  function setTTDFragment(slug, base) {
    var nm = nameFromHash();
    history.replaceState(null, '', TTD_PATH + '#slug=' + slug +
      (base ? '&base=' + base : '') + (nm ? '&name=' + encodeURIComponent(nm) : ''));
  }

  /* The baseline card: pin when none is set; once pinned, show the baseline, a reset/re-pin/unpin
   * row and the diff from it to the current cloth. */
  function baselineSection(info) {
    var baseSlug = baseSlugFromHash();
    var s = '<div id="weaver-baseline" style="border:1px solid #ddd;border-radius:6px;padding:.6em .9em;margin:1em 0">';
    if (!baseSlug) {
      return s + '<button data-pin title="Remember this tartan as the baseline to compare your edits against">📌 Pin as baseline</button>' +
        ' <span style="color:#888;font-size:smaller">Pin a starting point, then watch how your edits differ from it.</span></div>';
    }
    var base = window.weaver.parseSlug(baseSlug);
    if (base.error) {
      return s + 'Baseline could not be read. <button data-unpin>✕ Unpin</button></div>';
    }
    var same = base.slug === info.slug;
    s += '<strong>Baseline:</strong> <code>' + esc(base.threadcount) + '</code>' +
      (base.scale > 1 ? ' ×' + base.scale : '') +
      ' <button data-reset' + (same ? ' disabled' : '') + ' title="Return to the pinned baseline">↺ Reset</button>' +
      ' <button data-repin title="Pin the current tartan as the new baseline">📌 Re-pin here</button>' +
      ' <button data-unpin title="Stop comparing">✕ Unpin</button>';
    s += '<div style="margin-top:.5em">' + (same ? '<em>No change from baseline.</em>' : diffHTML(base, info)) + '</div>';
    return s + '</div>';
  }

  function wireBaseline(shell, info) {
    var box = document.getElementById('weaver-baseline');
    if (!box) return;
    box.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      ev.preventDefault();
      if (b.hasAttribute('data-pin') || b.hasAttribute('data-repin')) {
        setTTDFragment(info.slug, info.slug);          // pin the current cloth as baseline
        render(shell, info, true);
      } else if (b.hasAttribute('data-unpin')) {
        setTTDFragment(info.slug, null);
        render(shell, info, true);
      } else if (b.hasAttribute('data-reset')) {
        var baseSlug = baseSlugFromHash();
        var bi = window.weaver.parseSlug(baseSlug);
        if (bi.error) { statLine('baseline unreadable: ' + bi.error); return; }
        bi.name = info.name || '';
        setTTDFragment(bi.slug, baseSlug);             // working returns to baseline; pin stays
        render(shell, bi, true);
      }
    });
  }

  /* Per-stripe / scale diff from baseline to current. A small colour chip leads each stripe; an
   * equal-length pair is compared positionally (count changes, recolours), otherwise an LCS pass
   * reports inserted (+) and removed (−) stripes. */
  function diffHTML(base, info) {
    var hex = {};
    (base.palette || []).forEach(function (p) { hex[p.code] = p.hex; });
    (info.palette || []).forEach(function (p) { hex[p.code] = p.hex; });
    var lines = [];
    if ((base.scale || 1) !== (info.scale || 1)) {
      lines.push('Scale ×' + (base.scale || 1) + ' → ×' + (info.scale || 1));
    }
    threadDiff(tokenize(base.threadcount), tokenize(info.threadcount), hex).forEach(function (l) { lines.push(l); });
    if (!lines.length) lines.push('Identical thread count; differs only in address form.');
    return '<ul style="margin:.2em 0 0 1.1em;padding:0">' +
      lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>';
  }

  function tokenize(tc) {
    return String(tc).split(/\s+/).filter(Boolean).map(function (t) {
      var m = /^([A-Za-z]+)\/?(\d+)$/.exec(t);
      return m ? { code: m[1].toUpperCase(), count: parseInt(m[2], 10) } : null;
    }).filter(Boolean);
  }

  function diffChip(hex) {
    return '<span style="display:inline-block;width:.8em;height:.8em;background:' + (hex || '#ccc') +
      ';border:1px solid #0003;vertical-align:middle;border-radius:2px"></span>';
  }
  function stripeLabel(t, hex) { return diffChip(hex[t.code]) + ' ' + esc(t.code) + t.count; }
  function signed(n) { return (n > 0 ? '+' : '') + n; }

  function threadDiff(a, b, hex) {
    if (a.length === b.length) {
      var out = [];
      for (var i = 0; i < a.length; i++) {
        var x = a[i], y = b[i];
        if (x.code === y.code && x.count === y.count) continue;
        if (x.code === y.code) {
          out.push(diffChip(hex[x.code]) + ' ' + esc(x.code) + ' ' + x.count + '→' + y.count + ' (' + signed(y.count - x.count) + ')');
        } else if (x.count === y.count) {
          out.push('recolour ' + stripeLabel({ code: x.code, count: x.count }, hex) + ' → ' + diffChip(hex[y.code]) + ' ' + esc(y.code));
        } else {
          out.push(stripeLabel(x, hex) + ' → ' + stripeLabel(y, hex));
        }
      }
      return out;
    }
    return lcsDiff(a, b, hex);
  }

  function lcsDiff(a, b, hex) {
    var n = a.length, m = b.length, key = function (t) { return t.code + t.count; };
    var dp = [];
    for (var i = 0; i <= n; i++) { dp[i] = []; for (var j = 0; j <= m; j++) dp[i][j] = 0; }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) {
      dp[i][j] = key(a[i]) === key(b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
    var out = []; i = 0; j = 0;
    while (i < n && j < m) {
      if (key(a[i]) === key(b[j])) { i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push('− ' + stripeLabel(a[i], hex)); i++; }
      else { out.push('+ ' + stripeLabel(b[j], hex)); j++; }
    }
    while (i < n) { out.push('− ' + stripeLabel(a[i], hex)); i++; }
    while (j < m) { out.push('+ ' + stripeLabel(b[j], hex)); j++; }
    return out;
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
   * the supplier has a catalogue number) and the three jog axes — ▼/▲ one rung darker/lighter
   * (past a family's ends the black and white caps), ◀/▶ one stop round the hue ring at the same
   * lightness, ⊖/⊕ one dye duller/brighter (past the dullest dye, the spine's grey). */
  function shadeCell(code, row) {
    if (!row || !row.match) return '—';
    // Fixed-width slots in a nowrap flex row: every button keeps its place across re-renders, and the
    // matched-shade name (the only variable-width part) is boxed to a fixed width so the brighter/
    // lighter/next buttons to its right never shift under the cursor between jogs.
    var name = (row.exact ? '' : '≈ ') + row.match.name + (row.match.ref ? ' [' + row.match.ref + ']' : '');
    var nameBox = '<span title="' + esc(row.match.name) + '" style="display:inline-block;width:9em;' +
      'overflow:hidden;text-overflow:ellipsis;text-align:center;vertical-align:middle">' + esc(name) + '</span>';
    return '<span style="display:inline-flex;align-items:center;gap:3px;white-space:nowrap">' +
      stepBtn(code, row.prev, '◀', 'previous hue') +
      stepBtn(code, row.darker, '▼', 'darker') +
      stepBtn(code, row.duller, '⊖', 'duller (less saturated)') +
      nameBox + swatch(row.match.hex) +
      stepBtn(code, row.brighter, '⊕', 'brighter (more saturated)') +
      stepBtn(code, row.lighter, '▲', 'lighter') +
      stepBtn(code, row.next, '▶', 'next hue') +
      '</span>';
  }

  // A jog button painted in the colour it will apply, so the destination shade reads at a glance
  // (the arrow rides on top in contrasting ink). Disabled steps keep the same footprint — they go
  // blank rather than shrinking — so nothing reflows when an axis runs out at a family's end.
  function stepBtn(code, step, arrow, title) {
    var box = 'width:1.7em;height:1.7em;padding:0;line-height:1.7em;vertical-align:middle;' +
      'border:1px solid #0003;border-radius:3px;font-size:.85em;cursor:pointer;flex:0 0 auto';
    if (!step) {
      return '<button disabled title="nothing that way" style="' + box +
        ';background:transparent;color:#ccc;cursor:default">' + arrow + '</button>';
    }
    return '<button data-shade-code="' + esc(code) + '" data-shade-hex="' + esc(step.hex) +
      '" title="' + title + ': ' + esc(step.name) + ' ' + esc(step.hex) +
      '" style="' + box + ';background:' + esc(step.hex) + ';color:' + readableInk(step.hex) + '">' +
      arrow + '</button>';
  }

  // Black or white ink for legibility on a coloured button, by perceived luminance of the background.
  function readableInk(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#000' : '#fff';
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
      var rows = nn.hits.map(function (hit) {
        var name = hit.name || 'Unnamed variant';
        var nameCell = (hit.ttdSlug ? '<a href="' + TTD_PATH + '#slug=' + hit.ttdSlug + '">' + esc(name) + '</a>' : esc(name)) +
          ' <a href="' + hit.url + '" title="open its dictionary page">↗</a>';
        // The full sett colour pattern: the neighbour's own sett bar (static file, or SW-rendered on a
        // miss via ?s=). Shown whole — width-fit, not cropped — so the colour sequence reads across.
        var sett = '<img src="' + hit.url + 'sett.png' + (hit.ttdSlug ? '?s=' + encodeURIComponent(hit.ttdSlug) : '') +
          '" alt="sett" loading="lazy" style="display:block;width:320px;max-width:100%;height:auto;' +
          'border:1px solid #ddd;border-radius:2px">';
        return '<tr><td style="text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap">' +
          hit.dist.toFixed(2) + '</td><td>' + nameCell + '</td><td>' + sett + '</td></tr>';
      });
      var pct = Math.round((loaded.explained[0] + loaded.explained[1]) * 100);
      container.innerHTML = '<h2>Nearest tartans</h2><p>The ten nearest existing variants by ΔTartan ' +
        'distance. A name opens its neighbour here in the TTD; <em>↗</em> steps out to its entry ' +
        'in the dictionary.</p>' +
        '<table class="nn-table"><thead><tr><th>ΔTartan</th><th>Tartan</th><th>Sett</th></tr></thead><tbody>' +
        rows.join('') + '</tbody></table>' +
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

  /* "Print sample sheet: A4 A3 A2" — on static variant pages and weaver pages alike. The engine
   * loads on first click, so the buttons cost nothing until used. */
  function printControls(slug, title) {
    var p = document.createElement('p');
    p.id = 'weaver-print-controls';
    p.appendChild(document.createTextNode('Print sample sheet: '));
    Object.keys(PAPER).forEach(function (size) {
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
      var wovenPNG = window.weaver.renderWoven(info.slug, PAPER[size].px);
      if (settPNG.error || wovenPNG.error) throw new Error(settPNG.error || wovenPNG.error);
      var settImg = sheet.querySelector('.weaver-print-sett');
      var wovenImg = sheet.querySelector('.weaver-print-tartan');
      settImg.src = pngURL(settPNG);
      wovenImg.src = pngURL(wovenPNG);

      // Both images must be decoded before print, or the sheet comes out blank.
      return showAndPrint(sheet, size, preview, Promise.all([settImg.decode(), wovenImg.decode()]));
    }).catch(function (err) {
      alert('Could not build the print sheet: ' + (err.message || err));
    });
  }

  /* A post's {{< collection_poster >}} shortcode: the items (name, slug, note) ride hidden in
   * its markup; the visible part gains the A4/A3/A2 buttons here. ?weaverprint=<size> previews
   * the poster on screen, as on the variant pages. */
  function hydrateCollections() {
    var boxes = document.querySelectorAll('.weaver-collection');
    Array.prototype.forEach.call(boxes, function (box) {
      var controls = box.querySelector('.weaver-collection-controls');
      if (!controls || controls.dataset.hydrated) return;
      var items = Array.prototype.map.call(
        box.querySelectorAll('[data-collection-item]'),
        function (el) {
          return { name: el.dataset.name, slug: el.dataset.slug, note: el.dataset.note || '' };
        });
      if (!items.length) return;
      controls.dataset.hydrated = '1';
      Object.keys(PAPER).forEach(function (size) {
        var b = document.createElement('button');
        b.textContent = size;
        b.addEventListener('click', function () { printCollection(box, items, size, false); });
        controls.appendChild(b);
        controls.appendChild(document.createTextNode(' '));
      });
      var pm = /[?&]weaverprint=(A[234])/.exec(location.search);
      if (pm && PAPER[pm[1]]) printCollection(box, items, pm[1], true);
    });
  }

  /* Builds the collection poster — title and subtitle, the first tartan as a full-width hero
   * band, the rest as a grid of woven squares, each captioned with its name, note and thread
   * count — then prints it at the chosen paper size. Same print.css mechanics as the sample
   * sheet; the weaver-poster classes carry the per-size layout. */
  function printCollection(box, items, size, preview) {
    loadEngine().then(function () {
      var old = document.getElementById('weaver-print-sheet');
      if (old) old.remove();
      var sheet = document.createElement('div');
      sheet.id = 'weaver-print-sheet';
      sheet.className = 'weaver-poster weaver-poster-' + size.toLowerCase();
      sheet.style.display = 'none';

      var h = ['<h1>' + esc(box.dataset.title || 'Tartan collection') + '</h1>'];
      if (box.dataset.subtitle) {
        h.push('<p class="weaver-poster-subtitle">' + esc(box.dataset.subtitle) + '</p>');
      }
      h.push('<div class="weaver-poster-grid">');
      items.forEach(function (it, i) {
        var info = window.weaver.parseSlug(it.slug);
        if (info.error) throw new Error(it.name + ': ' + info.error);
        h.push('<figure' + (i === 0 ? ' class="weaver-poster-hero"' : '') + '>' +
          '<img id="weaver-poster-img-' + i + '" alt="' + esc(it.name) + '">' +
          '<figcaption><strong>' + esc(it.name) + '</strong>' +
          (it.note ? ' — ' + esc(it.note) : '') +
          '<br><code>' + esc(info.threadcount) + '</code></figcaption></figure>');
      });
      h.push('</div>');
      h.push('<p class="weaver-print-id">' + esc(location.origin + location.pathname) +
        ' — every sample woven on demand from its thread count</p>');
      sheet.innerHTML = h.join('\n');
      document.body.appendChild(sheet);

      // The hero band runs the full page width; the grid squares sit three to a row, so half
      // the resolution still prints crisply and weaves in a quarter of the time.
      var decoded = Promise.all(items.map(function (it, i) {
        var px = i === 0 ? PAPER[size].px : Math.round(PAPER[size].px / 2);
        var png = window.weaver.renderWoven(it.slug, px);
        if (png.error) throw new Error(it.name + ': ' + png.error);
        var img = document.getElementById('weaver-poster-img-' + i);
        img.src = pngURL(png);
        return img.decode();
      }));
      return showAndPrint(sheet, size, preview, decoded);
    }).catch(function (err) {
      alert('Could not build the poster: ' + (err.message || err));
    });
  }

  /* The shared tail of both print paths: inject the @page size, wait for the images to decode
   * (or the print comes out blank), then either show the sheet on screen (the ?weaverprint=
   * preview hook) or print it. */
  function showAndPrint(sheet, size, preview, decoded) {
    var style = document.getElementById('weaver-page-size');
    if (!style) {
      style = document.createElement('style');
      style.id = 'weaver-page-size';
      document.head.appendChild(style);
    }
    style.textContent = '@page { size: ' + PAPER[size].page + ' }';

    return decoded.then(function () {
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
  }
})();
