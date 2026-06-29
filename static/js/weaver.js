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

  var SETT_PATH = /^\/variants\/s\d+\/[0-9a-z~-]+\/(edit\/)?$/; // the variant path (#69a)
  // A /tartans/<bare-sett>/ URL with no page is a singleton tartan (one sett) — the id IS a valid
  // unit slug, so the shell opens it straight in the TTD (tartan-weaver issue follow-up).
  var TARTAN_PATH = /^\/setts\/([0-9a-z!~-]+)\/$/; // a singleton sett's structure path (#69a)
  var NEW_PATH = '/variants/new/';
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
      var tm = TARTAN_PATH.exec(path); // a singleton tartan's /tartans/ URL: open the bare sett in the TTD
      if (tm) {
        location.replace(TTD_PATH + '#slug=' + tm[1]);
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
    var m = /^\/variants\/s\d+\/([0-9a-z~-]+)\/$/.exec(location.pathname);
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
          stampBuild(window.weaver);
        });
    });
  }

  /* Append the engine's link-time build stamp (commit + UTC date) at the foot of the weaver app,
   * so the tool always says which weaver wove it. buildInfo() is stamped by `task wasm:build`;
   * an older binary without it (or a dev build) is simply not stamped. Runs once. */
  function stampBuild(engine) {
    var shell = document.getElementById('weaver-app');
    if (!shell || !engine || typeof engine.buildInfo !== 'function') return;
    if (document.getElementById('weaver-build')) return;
    var b = engine.buildInfo();
    if (!b || b.error) return;
    var el = document.createElement('p');
    el.id = 'weaver-build';
    el.className = 'weaver-build';
    el.textContent = 'weaver ' + b.commit + ' · built ' + b.built;
    shell.appendChild(el);
  }

  function pngURL(bytes) {
    return URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
  }

  /* Weave the whole sett tessellated across a page-sized image (at the cloth's real density), open it
   * in a new tab, and offer it for download. Popup-blocked? fall back to a direct download. */
  function weaveFullPage(info) {
    var tpcm = (typeof window.weaver.tpcmOf === 'function') ? window.weaver.tpcmOf(info.slug) : 16;
    var png = window.weaver.renderWoven(info.slug, 1400, tpcm, 1800, overlayArg());
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

  /* Render a print-ready 4×6" postcard (1800×1200 @300dpi, woven full-bleed with a QR back to the
   * tartan's dictionary page) in pure Go via the wasm engine, and offer it as a direct image download. */
  function weavePostcard(info) {
    var tpcm = (typeof window.weaver.tpcmOf === 'function') ? window.weaver.tpcmOf(info.slug) : 16;
    var png = window.weaver.postcard(info.slug, tpcm, ed.name || info.name || '', overlayArg());
    if (!png || png.error) {
      statLine('postcard failed: ' + ((png && png.error) || 'unknown'));
      return;
    }
    var url = pngURL(png);
    var file = ((info.name || 'tartan').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'tartan') + '-postcard.png';
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
    var pc = document.getElementById('weaver-postcard');
    if (pc) pc.addEventListener('click', function () { weavePostcard(info); });
  }

  /* Build the sample sheet as a PDF (rendered in pure Go via the wasm engine — name, woven sample,
   * thread count, palette) and download it directly, no server and no browser print dialog. */
  function downloadSheet(info, paper) {
    var res = window.weaver.sampleSheet(info.slug, paper || 'A4');
    if (!res || res.error) {
      statLine('sample sheet failed: ' + ((res && res.error) || 'unknown'));
      return;
    }
    var base = ((info.name || 'tartan').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'tartan');
    var url = URL.createObjectURL(new Blob([res], { type: 'application/pdf' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = base + '.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function wirePdf(shell, info) {
    var btn = document.getElementById('weaver-pdf');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var sel = document.getElementById('weaver-pdf-paper');
      downloadSheet(info, sel ? sel.value : 'A4');
    });
  }

  /* The TTD entry: #slug=<slug> opens that variant for editing; no fragment starts from a blank
   * form. Re-entered on every fragment change. */
  // The editor's whole state is the address: ed.slug (#slug=), ed.base (&base=) and the supplier the
  // jog navigates (a transient view choice). ed.ttd false is the read-only 404 sett shell.
  var ed = { shell: null, slug: '', base: '', ttd: true, palette: {} };
  var ttdSup = '';

  /* The editor carries the cloth's EXACT colours as ed.palette ({code:"#RRGGBB"}) alongside the slug,
   * because the slug rounds every colour to its human-palette cell — so a fine-grid / superfine / fine-
   * supplier jog would otherwise round straight back and look dead (#15). overlayArg passes it to the
   * Go engine (image + page renders, and applyShade, all take it as a trailing JSON arg); palMap reads
   * the exact palette back out of a render result so the next render/jog steps from it. */
  function overlayArg() {
    return (ed.palette && Object.keys(ed.palette).length) ? JSON.stringify(ed.palette) : '';
  }
  function palMap(info) {
    var m = {};
    if (info && info.palette) info.palette.forEach(function (p) { m[p.code] = p.hex; });
    return m;
  }

  function bootTTD(shell) {
    var m = /[#&]slug=([0-9a-z~-]+)/.exec(location.hash);
    status(shell, m ? 'Weaving this tartan in your browser…' : 'Starting the weaver…');
    loadEngine().then(function () {
      ed.shell = shell; ed.ttd = true; ed.base = baseSlugFromHash() || ''; ed.palette = paletteFromHash(); ed.name = nameFromHash() || '';
      if (!m) {
        // No sett chosen: open a plain starter cloth straight in the editor.
        var blank = window.weaver.fromInput('', 'K#101010 W#F4F4F0', 'K24 W24');
        if (blank.error) { status(shell, 'The weaver could not start: ' + blank.error); return; }
        ed.slug = blank.slug;
      } else {
        ed.slug = m[1];
      }
      renderEditor();
    }).catch(function (err) {
      status(shell, 'The weaver could not start: ' + err);
    });
  }

  /* The 404 app-shell: a /setts/ URL with no static page is woven in the editor — read here, and an
   * edit continues in the TTD. The slug is the path leaf, or the fragment for a hashed-leaf address. */
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
      ed.shell = shell; ed.ttd = false; ed.base = ''; ed.slug = info.slug; ed.palette = {}; ed.name = '';
      renderEditor();
    });
  }

  /* The editor is rendered whole by the Go engine (window.weaver.editorPage); this is the thin glue
   * the B→C migration collapsed weaver.js onto. It injects that HTML into the shell, fills the bits
   * that need the page — the cloth's images, the ΔTartan distance and nearest-neighbour map from the
   * loaded index, the print controls — and turns each edit into a new slug (applyShade for a jog,
   * fromInput for a thread/colour edit, a ~xN swap for a scale step), then re-renders. The cloth's
   * whole state rides in the address, so every change is shareable and reloadable. */
  function renderEditor() {
    var info = window.weaver.parseSlug(ed.slug);
    if (info.error) { status(ed.shell, 'This sett address could not be read: ' + info.error); return; }
    ed.slug = info.slug; // canonical
    var name = (typeof window.weaver.title === 'function' && (window.weaver.title(info.slug, '') || {}).text) || 'Tartan variant';
    info.name = name;
    var ov = overlayArg();
    ed.shell.innerHTML = window.weaver.editorPage(info.slug, ed.base || '', ttdSup, ed.name || '', ov);

    // The working cloth's images, rendered in-page (no dependency on the image service worker), with
    // the exact-colour overlay so a fine edit shows in the weave, not just the palette.
    var settEl = document.getElementById('weaver-sett');
    if (settEl) { var sp = window.weaver.renderSett(info.slug, 1000, 64, ov); if (!sp.error) settEl.src = pngURL(sp); }
    var tartanEl = document.getElementById('weaver-tartan');
    if (tartanEl) {
      var tpcm = (typeof window.weaver.tpcmOf === 'function') ? window.weaver.tpcmOf(info.slug) : 16;
      var wp = window.weaver.renderWoven(info.slug, 880, tpcm, 0, ov);
      if (!wp.error) tartanEl.src = pngURL(wp);
    }

    // ΔTartan distance from the baseline, and the nearest-tartans table + map, both need the index.
    var dtEl = document.getElementById('weaver-dt');
    if (dtEl && ed.base) {
      loadIndexOnce().then(function () {
        var dt = window.weaver.distance(ed.base, info.slug);
        dtEl.textContent = (typeof dt === 'number') ? 'ΔTartan ' + dt.toFixed(2) : 'ΔTartan —';
      }).catch(function () { dtEl.textContent = 'ΔTartan —'; });
    }
    var nnEl = document.getElementById('weaver-nn');
    if (nnEl) renderExtras(nnEl, info.slug);

    // Print + full-page controls (page-side: canvas / anchor / print dialog).
    var slot = document.getElementById('weaver-print-slot');
    if (slot) slot.replaceWith(printControls(info.slug, name));
    wireFullPage(ed.shell, info);
    wirePdf(ed.shell, info);

    // Keep the address on the canonical cloth (replaceState ⇒ no hashchange, so no re-boot loop).
    if (ed.ttd) setTTDFragment(ed.slug, ed.base);
    stampBuild(window.weaver); // the whole-shell re-render wiped the build stamp; re-add it (idempotent)
    statLine('engine ' + Math.round(performance.now() - t0) + ' ms');
    wireEditor();
  }

  /* Delegated editing, attached once to the shell (it persists; only its innerHTML is replaced). */
  function wireEditor() {
    if (ed.shell._wired) return;
    ed.shell._wired = true;
    ed.shell.addEventListener('click', onEditorClick);
    ed.shell.addEventListener('change', onEditorChange);
  }

  /* Move the editor to a freshly-derived slug. On the read-only 404 shell an edit continues in the
   * TTD (a full navigation into /ttd/edit/), so reading a giant sett can flow straight into editing. */
  function gotoSlug(slug) {
    if (ed.ttd) { ed.slug = slug; renderEditor(); }
    else location.assign(TTD_PATH + '#slug=' + slug + (ed.base ? '&base=' + ed.base : ''));
  }

  function onEditorClick(ev) {
    var btn = ev.target.closest('button');
    if (!btn) return;
    ev.preventDefault();
    if (btn.hasAttribute('data-shade-hex')) {
      // Step from the cloth's current EXACT colours, and keep the new exact palette so the next jog
      // accumulates instead of snapping back to the slug's rounded shade (#15).
      var nx = window.weaver.applyShade(ed.slug, btn.dataset.shadeCode, btn.dataset.shadeHex, overlayArg());
      if (nx.error) { statLine('shade step failed: ' + nx.error); return; }
      ed.palette = palMap(nx);
      gotoSlug(nx.slug); return;
    }
    if (btn.hasAttribute('data-pin') || btn.hasAttribute('data-repin')) { ed.base = ed.slug; renderEditor(); return; }
    if (btn.hasAttribute('data-unpin')) { ed.base = ''; renderEditor(); return; }
    if (btn.hasAttribute('data-reset')) { if (ed.base) { ed.slug = ed.base; ed.palette = {}; renderEditor(); } return; }
    if (btn.hasAttribute('data-scale')) {
      var cur = (window.weaver.parseSlug(ed.slug).scale) || 1;
      var n = Math.max(1, cur + parseInt(btn.dataset.scale, 10));
      if (n === cur) return;
      var structure = ed.slug.replace(/~x\d+$/, '');
      var ns = window.weaver.parseSlug(n > 1 ? structure + '~x' + n : structure);
      if (!ns.error) gotoSlug(ns.slug);
      return;
    }
    if (btn.hasAttribute('data-step')) { var step = parseInt(btn.dataset.step, 10); editStripes(function (a, i) { a[i].count = Math.max(1, a[i].count + step); return a; }, stripeIndex(btn)); return; }
    if (btn.hasAttribute('data-ins')) { editStripes(function (a, i) { a.splice(i + 1, 0, { hex: a[i].hex, count: a[i].count }); return a; }, stripeIndex(btn)); return; }
    if (btn.hasAttribute('data-del')) { editStripes(function (a, i) { if (a.length <= 2) { statLine('a sett needs at least two stripes'); return null; } a.splice(i, 1); return a; }, stripeIndex(btn)); return; }
    if (btn.hasAttribute('data-add')) { editStripes(function (a) { a.push({ hex: a[a.length - 1].hex, count: 2 }); return a; }, 0); return; }
  }

  function onEditorChange(ev) {
    var el = ev.target;
    // The name is metadata, not structure — record it and push it into the address (&name=), but do
    // NOT re-render (that would steal focus mid-edit). It feeds the postcard + share link from ed.name.
    if (el.matches && el.matches('#weaver-name')) { ed.name = el.value.trim(); if (ed.ttd) setTTDFragment(ed.slug, ed.base); return; }
    if (el.matches && el.matches('select[data-shade-supplier]')) { ttdSup = el.value; renderEditor(); return; }
    if (el.matches && el.matches('input[data-count]')) { var v = Math.max(1, parseInt(el.value, 10) || 1); editStripes(function (a, i) { a[i].count = v; return a; }, stripeIndex(el)); return; }
    if (el.matches && el.matches('input[data-hex]')) { var hex = el.value.toUpperCase(); editStripes(function (a, i) { a[i].hex = hex; return a; }, stripeIndex(el)); return; }
  }

  function stripeIndex(el) { var r = el.closest('.thread-stripe'); return r ? +r.dataset.i : -1; }

  /* Read the per-stripe {hex,count} from the rendered rows, apply fn, then rebuild the slug via
   * fromInput — transient codes → canonical; unit counts × the ~xN repeat; first + last are pivots. */
  function editStripes(fn, i) {
    // Each thread-count row carries its own colour (a per-stripe recolour input) and count, so a
    // recolour can change one stripe or introduce a new colour. fromInput re-letters by hex, so a new
    // shade splits off its own code and a matched shade merges.
    var arr = [];
    ed.shell.querySelectorAll('.thread-stripe').forEach(function (r) {
      var c = r.querySelector('input[data-hex]'), n = r.querySelector('input[data-count]');
      arr.push({ hex: (c && c.value) || '#cccccc', count: Math.max(1, parseInt(n && n.value, 10) || 1) });
    });
    var out = fn(arr, i);
    if (!out) return;
    var scale = (window.weaver.parseSlug(ed.slug).scale) || 1;
    var codeOf = {}, pal = [], k = 0;
    function codeFor(hex) { hex = hex.toUpperCase(); if (!(hex in codeOf)) { var cc = k < 26 ? String.fromCharCode(65 + k) : 'Z' + k; k++; codeOf[hex] = cc; pal.push(cc + hex); } return codeOf[hex]; }
    var last = out.length - 1;
    var tc = out.map(function (s, j) { return codeFor(s.hex) + ((j === 0 || j === last) ? '/' : '') + (s.count * scale); }).join(' ');
    var next = window.weaver.fromInput('', pal.join(' '), tc);
    if (next.error) { statLine('thread edit failed: ' + next.error); return; }
    // The rows already carry the exact colours (the overlay rendered them), so the rebuilt cloth keeps
    // them — carry its exact palette forward so a structural edit doesn't drop a fine shade.
    ed.palette = palMap(next);
    gotoSlug(next.slug);
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

  // The exact-colour palette an edited cloth carries in the fragment (&pal=<json>). A custom shade is a
  // different cloth, so it rides in the address — the URL changes on a fine jog and the edit is
  // shareable/reloadable, while the canonical &slug= stays the human-palette identity.
  function paletteFromHash() {
    var m = /[#&]pal=([^&]*)/.exec(location.hash);
    if (!m) return {};
    try { var o = JSON.parse(decodeURIComponent(m[1])); return (o && typeof o === 'object') ? o : {}; }
    catch (e) { return {}; }
  }

  function setTTDFragment(slug, base) {
    var nm = (typeof ed.name === 'string') ? ed.name : nameFromHash();
    var pal = (ed.palette && Object.keys(ed.palette).length) ?
      '&pal=' + encodeURIComponent(JSON.stringify(ed.palette)) : '';
    history.replaceState(null, '', TTD_PATH + '#slug=' + slug +
      (base ? '&base=' + base : '') + (nm ? '&name=' + encodeURIComponent(nm) : '') + pal);
  }

  /* Fetches the shipped ΔTartan index lazily, then fills container with the nearest existing
   * variants (capped by ΔTartan distance, so up to ten) and the neighbour map. Each neighbour can
   * be opened either in the TTD (staying in
   * the navigator) or on its own page in the dictionary; hashed-leaf URLs cannot be re-encoded as
   * a fragment slug, so those offer only their page. */
  function renderExtras(container, slug) {
    container.innerHTML = '<h2>Nearest tartans</h2><p>Measuring ΔTartan distances…</p>';
    var tFetch = performance.now();
    loadIndexOnce().then(function (loaded) {
      var nn = window.weaver.neighbours(slug, 10);
      if (nn.error) throw new Error(nn.error);
      var pct = Math.round((loaded.explained[0] + loaded.explained[1]) * 100);
      // The table is built in Go by the shared nntable.Table — the SAME builder the static /setts/
      // page uses — so the page and the TTD render one table from one piece of code (issue #54). It
      // leads with this tartan so the swatches line up against it. The list is ΔTartan-capped
      // (nn.ListDistCap), so a sett in a sparse region shows fewer than ten — or none, sitting alone.
      var listHtml = nn.hits.length
        ? '<p>The nearest existing variants by ΔTartan distance, with this tartan at the top so the ' +
          'swatches line up against it. A name opens that neighbour here in the TTD; <em>↗</em> steps ' +
          'out to its entry in the dictionary.</p>' + nn.html
        : '<p>No existing variant lies within ΔTartan range — this sett sits on its own.</p>';
      container.innerHTML = '<h2>Nearest tartans</h2>' + listHtml +
        '<h2>Neighbour map</h2><p>Every grey dot is one of ' + loaded.count +
        ' existing variants placed by the first two principal components of the ΔTartan feature space (' +
        pct + '% of its variance). Red is this tartan; blue dots are its nearest — click one to open it here.</p>';
      var cloud = window.weaver.plotCloud(2500);
      if (!cloud.error) drawPlot(container, cloud, nn);
      statLine('neighbours over ' + loaded.count + ' variants in ' +
        Math.round(performance.now() - tFetch) + ' ms (fetch + index + query)');
    }).catch(function (err) {
      container.innerHTML = '<h2>Nearest tartans</h2><p>Unavailable: ' + esc(err.message || err) + '</p>';
    });
  }

  /* The neighbour map: corpus cloud in grey, the nearest in blue (clickable, opening in the
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
        window.weaver.paletteHTML(info.slug) +
        '<div class="weaver-print-sample"><h2>Woven sample</h2>' +
        '<p><img class="weaver-print-tartan" alt="Woven sample"></p></div>';
      document.body.appendChild(sheet);

      var settPNG = window.weaver.renderSett(info.slug, 2000, 120, overlayArg());
      var wovenPNG = window.weaver.renderWoven(info.slug, PAPER[size].px, 0, 0, overlayArg());
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
