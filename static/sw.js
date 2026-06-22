/* Service worker — render a missing sett.png / tartan.png on demand via the weaver wasm engine.
 *
 * Network-first and fallback-only: if the statically generated image exists it is served
 * unchanged. Only a miss — the build's skipped (>10s render) or weave-capped thumbnails, and the
 * read-only/dynamic sett pages that never had a file — falls through to a live render in the
 * worker. So no page loses an image it used to have, and the no-JS reading path is untouched.
 *
 * The slug (the full cloth encoding) comes from the image URL's ?s= when the generator emits it
 * (needed for hashed-leaf setts, whose path leaf is an opaque file name), else from the decodable
 * path leaf. The engine (cmd/wasmweaver, installed on self.weaver) loads lazily on the first miss.
 *
 * Built by tartan-weaver `task wasm:build`; see tartan-weaver issue #47. */
'use strict';

// The Go runtime glue must be imported during the worker's initial evaluation — a service worker
// forbids importScripts() from a fetch handler (InvalidStateError). It is small (~18KB); the heavy
// weaver.wasm still loads lazily on the first miss. If wasm_exec.js is absent the SW fails to
// install and registration is simply skipped (the catch in scripts.html), leaving pages untouched.
importScripts('/wasm/wasm_exec.js');

var WASM = '/wasm/weaver.wasm';
var IMG = /\/(sett|tartan)\.png$/;
var enginePromise = null;

/* Lazily instantiate the weaver wasm, once. go.run() parks in select{}, so self.weaver is
 * installed by the time run() yields. */
function engine() {
  if (enginePromise) return enginePromise;
  var go = new Go();
  enginePromise = WebAssembly.instantiateStreaming(fetch(WASM), go.importObject)
    .then(function (r) { go.run(r.instance); return self.weaver; })
    .catch(function (err) { enginePromise = null; throw err; }); // allow a retry on the next miss
  return enginePromise;
}

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  // Only same-origin GETs for the two cloth images; everything else is left to the browser.
  if (e.request.method !== 'GET' || url.origin !== self.location.origin || !IMG.test(url.pathname)) return;
  e.respondWith(renderOnMiss(e.request, url));
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
  return engine().then(function (w) {
    var png = kind === 'sett' ? w.renderSett(slug, 1000, 64) : w.renderWoven(slug, 480);
    if (!png || png.error) return new Response((png && png.error) || 'render failed', { status: 422 });
    return new Response(png, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' } });
  }).catch(function (err) {
    return new Response(String(err), { status: 500 });
  });
}

/* The path leaf is the slug for an ordinary sett: /setts/s<n>/<slug>/{sett,tartan}.png. The leaf
 * can carry the ~xN scale and other slug characters, so take it whole; a hashed-leaf sett's opaque
 * name simply won't decode (parseSlug rejects it) and falls back to ?s=. */
function slugFromPath(p) {
  var m = /\/setts\/s\d+\/([^/]+)\/(?:sett|tartan)\.png$/.exec(p);
  return m ? decodeURIComponent(m[1]) : null;
}
