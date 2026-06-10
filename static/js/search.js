// Name search over the static index the weaver exports (task search:export →
// /search/index.v1.json): clans, families, septs, spellings and types. The index is small
// (tens of entries), so it is fetched once on first focus and filtered in full on every
// keystroke — no worker, no tokeniser.
(function () {
  'use strict';

  var box = document.getElementById('site-search');
  if (!box) return;
  var input = box.querySelector('input');
  var list = box.querySelector('.search-results');

  var entries = null; // null until the index loads; [] on a failed load
  var selected = -1; // index of the keyboard-highlighted result

  function loadIndex() {
    if (entries !== null) return;
    entries = []; // claim the slot so concurrent events fetch once
    fetch('/search/index.v1.json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        entries = d.entries || [];
        render(); // a query may already be typed
      })
      .catch(function () { /* leave entries empty; search just finds nothing */ });
  }

  // Matches sort: prefix matches first, then the index rank (clans before families before
  // aliases before types), then alphabetically.
  function matches(q) {
    var hits = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var at = e.name.indexOf(q);
      if (at < 0) continue;
      hits.push({ e: e, prefix: at === 0 ? 0 : 1 });
    }
    hits.sort(function (a, b) {
      return (a.prefix - b.prefix) || (a.e.rank - b.e.rank) || a.e.name.localeCompare(b.e.name);
    });
    return hits.slice(0, 12).map(function (h) { return h.e; });
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    selected = -1;
    if (!q || entries === null) {
      list.hidden = true;
      list.innerHTML = '';
      return;
    }
    var hits = matches(q);
    list.innerHTML = '';
    if (!hits.length) {
      list.hidden = true;
      return;
    }
    hits.forEach(function (e) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = e.url;
      a.textContent = e.display;
      var kind = document.createElement('span');
      kind.className = 'kind';
      kind.textContent = e.kind;
      a.appendChild(kind);
      li.appendChild(a);
      list.appendChild(li);
    });
    list.hidden = false;
  }

  function select(delta) {
    var items = list.querySelectorAll('li');
    if (!items.length) return;
    if (selected >= 0) items[selected].classList.remove('selected');
    selected = (selected + delta + items.length) % items.length;
    items[selected].classList.add('selected');
    items[selected].scrollIntoView({ block: 'nearest' });
  }

  input.addEventListener('focus', loadIndex);
  input.addEventListener('input', function () { loadIndex(); render(); });
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowDown') { select(1); ev.preventDefault(); }
    else if (ev.key === 'ArrowUp') { select(-1); ev.preventDefault(); }
    else if (ev.key === 'Enter') {
      if (list.hidden) return;
      var target = selected >= 0 ? list.querySelectorAll('li a')[selected]
                                 : list.querySelector('li a');
      if (target) window.location.href = target.href;
    } else if (ev.key === 'Escape') {
      list.hidden = true;
      input.blur();
    }
  });
  // Hide on click-away; mousedown on a result still navigates because it fires first.
  document.addEventListener('click', function (ev) {
    if (!box.contains(ev.target)) list.hidden = true;
  });
})();
