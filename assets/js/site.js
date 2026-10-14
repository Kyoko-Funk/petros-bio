/* Shared behaviour for every page: header, mobile menu, scroll reveal, forms. */
(function () {
  'use strict';

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function () {
    // Header turns solid once the page scrolls
    var header = document.querySelector('[data-header]');
    function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 40); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile menu
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.getElementById('mobile-menu');
    if (toggle && panel) {
      var label = toggle.querySelector('[data-menu-label]');
      var setOpen = function (open) {
        panel.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.querySelector('[data-menu-open]').classList.toggle('hidden', open);
        toggle.querySelector('[data-menu-close]').classList.toggle('hidden', !open);
        if (label) label.textContent = open ? 'Close menu' : 'Open menu';
        document.body.style.overflow = open ? 'hidden' : '';
        if (header) header.classList.toggle('is-scrolled', open || window.scrollY > 40);
        if (open) { var first = panel.querySelector('a'); if (first) first.focus(); }
      };
      toggle.addEventListener('click', function () { setOpen(panel.hidden); });
      panel.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); }
      });
      window.addEventListener('resize', function () { if (window.innerWidth >= 1024 && !panel.hidden) setOpen(false); });
    }

    // Reveal on scroll
    var items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add('is-visible'); });
    }

    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // Forms post to Formspree (emails petrosbiokinetics@gmail.com). Without JS they still submit normally.
    document.querySelectorAll('form[data-ajax]').forEach(function (form) {
      var status = form.querySelector('.form-status');
      var button = form.querySelector('button[type="submit"]');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var original = button.innerHTML;
        button.disabled = true;
        button.textContent = 'Sending…';
        fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error('bad status ' + r.status); })
          .then(function () {
            form.reset();
            show('ok', form.getAttribute('data-success'));
          })
          .catch(function () {
            show('error', 'Sorry, something went wrong and your message was not sent. Please WhatsApp or call us on +264 81 683 5055.');
          })
          .finally(function () { button.disabled = false; button.innerHTML = original; });
      });
      function show(state, msg) {
        if (!status) return;
        status.hidden = false;
        status.setAttribute('data-state', state);
        status.textContent = msg;
        status.focus();
      }
    });

    // Booking date: no past dates, no weekends
    document.querySelectorAll('input[type="date"][data-weekdays]').forEach(function (input) {
      var d = new Date();
      input.min = d.toISOString().slice(0, 10);
      input.addEventListener('change', function () {
        var day = new Date(input.value + 'T12:00:00').getDay();
        input.setCustomValidity(day === 0 || day === 6 ? 'We are closed on weekends. Please choose a weekday.' : '');
      });
    });
  });
})();
