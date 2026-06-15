// Nav dropdowns (Clan, Tartans, Info). On desktop, CSS opens them on hover/focus.
// Touch devices don't hover, so a tap on the label toggles an .open class instead.
// Tapping outside, pressing Escape, or opening another dropdown closes the rest.
(function () {
  'use strict';

  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.nav-dropdown'));
  if (!dropdowns.length) return;

  function setOpen(d, open) {
    d.classList.toggle('open', open);
    var label = d.querySelector('.nav-dropdown-label');
    if (label) label.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeAll(except) {
    dropdowns.forEach(function (d) { if (d !== except) setOpen(d, false); });
  }

  dropdowns.forEach(function (d) {
    var label = d.querySelector('.nav-dropdown-label');
    if (!label) return;
    label.setAttribute('role', 'button');
    label.setAttribute('aria-haspopup', 'true');
    label.setAttribute('aria-expanded', 'false');

    function toggle(e) {
      e.preventDefault();
      var willOpen = !d.classList.contains('open');
      closeAll(d);
      setOpen(d, willOpen);
    }

    label.addEventListener('click', toggle);
    label.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') toggle(e);
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) closeAll(null);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();
