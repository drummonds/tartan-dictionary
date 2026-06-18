// Navigation behaviour:
//  - Hamburger: on mobile a tap on .nav-toggle opens/closes the whole nav (.nav-open).
//  - Dropdowns (Clan, Tartans, Info): on desktop CSS opens them on hover/focus; touch
//    devices don't hover, so a tap on the label toggles an .open class instead. Tapping
//    outside, pressing Escape, or opening another dropdown closes the rest.
(function () {
  'use strict';

  var nav = document.querySelector('.navigation');
  if (!nav) return;

  var dropdowns = Array.prototype.slice.call(nav.querySelectorAll('.nav-dropdown'));

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

  // Hamburger: toggle the whole nav open/closed on mobile.
  var toggle = nav.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) closeAll(null);
    });
  }

  function collapseNav() {
    if (nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) closeAll(null);
    if (!e.target.closest('.navigation')) collapseNav();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAll(null); collapseNav(); }
  });
})();
