/* Service worker — render via the weaver wasm engine on demand. Two jobs:
 *
 *  1. A missing sett.png / tartan.png. Network-first and fallback-only: if the statically generated
 *     image exists it is served unchanged. Only a miss — the build's skipped (>10s render) or
 *     weave-capped thumbnails, and the read-only/dynamic sett pages that never had a file — falls
 *     through to a live render. So no page loses an image it used to have, and no-JS reading is
 *     untouched. The slug comes from the image URL's ?s= (needed for hashed-leaf setts, whose path
 *     leaf is opaque), else from the decodable path leaf. tartan.png honours ?w= (width) and ?tpcm=
 *     (life-size thread density).
 *
 *  2. The TTD editor fragment: GET /x/ttd/page?s=&base=&sup= returns the whole #weaver-app HTML,
 *     rendered by wasmapi.EditorPage from the shared internal/render components (HTML-over-the-wire,
 *     approach C — ADR 0001 / research/ttd-c-migration.md). The canonical slug rides back in the
 *     X-Sett-Slug header. This is what collapses the dual renderer (issue #47): one Go renderer for
 *     both the static pages and the live editor.
 *
 * The engine (cmd/wasmweaver, installed on self.weaver) loads lazily on the first request.
 * Built by tartan-weaver `task wasm:build`; see tartan-weaver issue #47. */
'use strict';

// The Go runtime glue must be imported during the worker's initial evaluation — a service worker
// forbids importScripts() from a fetch handler (InvalidStateError). It is small (~18KB); the heavy
// weaver.wasm still loads lazily on the first miss. If wasm_exec.js is absent the SW fails to
// install and registration is simply skipped (the catch in scripts.html), leaving pages untouched.
importScripts('/wasm/wasm_exec.js');

var WASM = '/wasm/weaver.wasm';
var IMG = /\/(sett|tartan)\.png$/;
var XTTD = /^\/x\/ttd\/page$/;
var enginePromise = null;

/* Lazily instantiate the weaver wasm, once. go.run() parks in select{}, so self.weaver is
 * installed by the time run() yields. cache:'reload' bypasses the HTTP cache so a redeployed wasm
 * is never served stale (the wasm URL is stable across builds). */
function engine() {
  if (enginePromise) return enginePromise;
  var go = new Go();
  enginePromise = WebAssembly.instantiateStreaming(fetch(WASM, { cache: 'reload' }), go.importObject)
    .then(function (r) { go.run(r.instance); return self.weaver; })
    .catch(function (err) { enginePromise = null; throw err; }); // allow a retry on the next request
  return enginePromise;
}

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  // Only same-origin GETs; everything else is left to the browser.
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (IMG.test(url.pathname)) { e.respondWith(renderOnMiss(e.request, url)); return; }
  if (XTTD.test(url.pathname)) { e.respondWith(renderPage(url)); return; }
});

/* Serve the static file if it exists; otherwise render it. A fetch made here is NOT re-dispatched
 * to this handler, so there is no loop. */
function renderOnMiss(request, url) {
  return fetch(request).then(function (net) {
    if (net && net.ok) return net;
    return render(url);
  }).catch(function () { return render(url); }); // offline / network error — try a render
}

function render(url) {
  var kind = IMG.exec(url.pathname)[1];
  var slug = url.searchParams.get('s') || slugFromPath(url.pathname);
  if (!slug) return new Response('no slug', { status: 404 });
  // The woven sample honours ?w= (content width) and ?tpcm= (life-size thread density) so the editor
  // gets the same 880px life-size cloth weaver.js draws today; absent ⇒ the legacy 480px square.
  var width = parseInt(url.searchParams.get('w'), 10) || 480;
  var tpcm = parseFloat(url.searchParams.get('tpcm')) || 0;
  return engine().then(function (w) {
    var png = kind === 'sett' ? w.renderSett(slug, 1000, 64) : w.renderWoven(slug, width, tpcm);
    if (!png || png.error) return new Response((png && png.error) || 'render failed', { status: 422 });
    return new Response(png, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' } });
  }).catch(function (err) {
    return new Response(String(err), { status: 500 });
  });
}

/* GET /x/ttd/page?s=&base=&sup= → the TTD editor #weaver-app fragment, rendered by the Go engine
 * (wasmapi.EditorPage). The canonical slug is echoed in X-Sett-Slug so the page can keep the address
 * bar canonical without re-parsing. */
function renderPage(url) {
  var slug = url.searchParams.get('s');
  if (!slug) return new Response('no slug', { status: 404 });
  var base = url.searchParams.get('base') || '';
  var sup = url.searchParams.get('sup') || '';
  return engine().then(function (w) {
    var html = w.editorPage(slug, base, sup);
    if (!html || html.error) return new Response((html && html.error) || 'render failed', { status: 422 });
    var info = w.parseSlug(slug);
    var canon = (info && !info.error && info.slug) ? info.slug : slug;
    return new Response(html, { headers: {
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Sett-Slug': canon
    } });
  }).catch(function (err) {
    return new Response(String(err), { status: 500 });
  });
}

/* The path leaf is the slug for an ordinary sett: /setts/s<n>/<slug>/{sett,tartan}.png. The leaf
 * can carry the ~xN scale and other slug characters, so take it whole; a hashed-leaf sett's opaque
 * name simply won't decode (parseSlug rejects it) and falls back to ?s=. */
function slugFromPath(p) {
  var m = /\/variants\/s\d+\/([^/]+)\/(?:sett|tartan)\.png$/.exec(p);
  return m ? decodeURIComponent(m[1]) : null;
}
