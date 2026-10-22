/* Shared behaviour for every page: header, mobile menu, scroll reveal, forms. */
(function () {
  'use strict';

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function () {
    // Header turns solid once the page scrolls
    var header = document.querySelector('[data-header]');
    function onScroll() {
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
      // Floating call and WhatsApp buttons appear once the first screen is passed (phones only, see site.css)
      document.body.classList.toggle('floats-on', window.scrollY > window.innerHeight * 0.5);
    }
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
    var items = document.querySelectorAll('.reveal, .draw, .draw-circle');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add(en.target.classList.contains('reveal') ? 'is-visible' : 'is-drawn');
          io.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add('is-visible', 'is-drawn'); });
    }

    // Photo lightbox: <button class="lightbox-trigger" data-lightbox="full-size-url"><img alt="…"></button>
    var triggers = document.querySelectorAll('[data-lightbox]');
    if (triggers.length && window.HTMLDialogElement) {
      var dlg = document.createElement('dialog');
      dlg.className = 'lightbox';
      dlg.setAttribute('aria-label', 'Enlarged photo');
      dlg.innerHTML = '<button type="button" aria-label="Close photo"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button><img alt=""><p></p>';
      document.body.appendChild(dlg);
      var big = dlg.querySelector('img');
      var cap = dlg.querySelector('p');
      dlg.querySelector('button').addEventListener('click', function () { dlg.close(); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      triggers.forEach(function (t) {
        t.addEventListener('click', function () {
          var small = t.querySelector('img');
          big.src = t.getAttribute('data-lightbox');
          big.alt = small ? small.alt : '';
          cap.textContent = t.getAttribute('data-caption') || '';
          dlg.showModal();
        });
      });
    }

    // SVG (SMIL) animations ignore the CSS reduced-motion rule, so pause them here
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('svg[data-pulse]').forEach(function (svg) { if (svg.pauseAnimations) { svg.setCurrentTime(3.3); svg.pauseAnimations(); } });
    }

    // Spotlight cards: soft glow follows the pointer (mouse only)
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      document.querySelectorAll('[data-spotlight]').forEach(function (card) {
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
      });
    }

    // Tilt cards: lean gently towards the pointer (mouse only, not with reduced motion)
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!calm && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      document.querySelectorAll('[data-tilt]').forEach(function (card) {
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = 'perspective(900px) rotateX(' + (-y * 6).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
        });
        card.addEventListener('pointerleave', function () { card.style.transform = ''; });
      });
    }

    // Scrollspy: highlight the tab of the section in view (Services group tabs)
    document.querySelectorAll('[data-scrollspy]').forEach(function (nav) {
      var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
      var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
      if (!sections.length || !('IntersectionObserver' in window)) return;
      var setActive = function (id) {
        links.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + id)); });
      };
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (sec) { spy.observe(sec); });
    });

    // Fees: switch between adult and pensioner / student prices
    document.querySelectorAll('[data-fees]').forEach(function (box) {
      var btns = box.querySelectorAll('[data-rate-btn]');
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          box.setAttribute('data-rate-shown', b.getAttribute('data-rate-btn'));
          btns.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        });
      });
    });

    // Copy buttons (e.g. bank account number)
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var label = btn.querySelector('[data-copy-label]');
        var done = function () { if (label) { label.textContent = 'Copied'; setTimeout(function () { label.textContent = 'Copy'; }, 2000); } };
        if (navigator.clipboard) navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(done, function () {});
      });
    });

    // Medical aid picker: show how paying works for the chosen scheme
    document.querySelectorAll('[data-aid]').forEach(function (box) {
      var chips = box.querySelectorAll('[data-scheme]');
      chips.forEach(function (c) {
        c.addEventListener('click', function () {
          box.setAttribute('data-kind', c.getAttribute('data-kind'));
          chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); });
          box.querySelectorAll('[data-aid-name]').forEach(function (n) { n.textContent = c.getAttribute('data-full'); });
        });
      });
    });

    // FAQ search: show only matching questions, open them, hide empty groups
    var faqSearch = document.querySelector('[data-faq-search]');
    if (faqSearch) {
      var faqItems = Array.prototype.slice.call(document.querySelectorAll('[data-faq]'));
      var groups = document.querySelectorAll('[data-faq-group]');
      var none = document.querySelector('[data-faq-none]');
      faqSearch.addEventListener('input', function () {
        var q = faqSearch.value.trim().toLowerCase();
        var shown = 0;
        faqItems.forEach(function (it) {
          var hit = !q || it.textContent.toLowerCase().indexOf(q) !== -1;
          it.hidden = !hit;
          if (q) it.open = hit; else it.open = false;
          if (hit) shown++;
        });
        groups.forEach(function (g) { g.hidden = !g.querySelector('[data-faq]:not([hidden])'); });
        if (none) none.classList.toggle('hidden', shown > 0);
      });
    }

    // Opening hours: highlight today and show "Open now" in Namibian time (keep in sync with the hours on the page)
    var hours = document.querySelector('[data-hours]');
    var badge = document.querySelector('[data-open-status]');
    if (hours) {
      var parts = {};
      try {
        new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Windhoek', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
          .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
      } catch (e) { parts = null; }
      if (parts) {
        var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
        var mins = parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10);
        var row = hours.querySelector('[data-day="' + day + '"]');
        if (row) row.classList.add('is-today');
        if (badge) {
          var weekday = day >= 1 && day <= 5;
          var text, open = false;
          if (weekday && mins >= 390 && mins < 720) { open = true; text = 'Open now · until 12:00'; }
          else if (weekday && mins >= 780 && mins < 1080) { open = true; text = 'Open now · until 18:00'; }
          else if (weekday && mins >= 720 && mins < 780) { text = 'Lunch · back at 13:00'; }
          else if (weekday && mins < 390) { text = 'Closed · opens at 06:30'; }
          else { text = 'Closed · opens ' + (day === 5 || day === 6 ? 'Monday' : 'tomorrow') + ' at 06:30'; }
          badge.setAttribute('data-state', open ? 'open' : 'closed');
          badge.querySelector('[data-open-text]').textContent = text;
          badge.hidden = false;
        }
      }
    }

    // Booking: three steps, each checked before moving on
    document.querySelectorAll('[data-book]').forEach(function (form) {
      var steps = Array.prototype.slice.call(form.querySelectorAll('.book-step'));
      var bar = document.querySelectorAll('[data-book-progress] li');
      var current = 0;
      var show = function (i, focus) {
        current = i;
        steps.forEach(function (st, n) { st.classList.toggle('is-current', n === i); });
        bar.forEach(function (li, n) { li.classList.toggle('is-active', n === i); li.classList.toggle('is-done', n < i); });
        if (focus) {
          var first = steps[i].querySelector('input:not([type=hidden]), select, textarea');
          steps[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 300);
        }
      };
      var valid = function (st) {
        var fields = st.querySelectorAll('input, select, textarea');
        for (var k = 0; k < fields.length; k++) { if (!fields[k].checkValidity()) { fields[k].reportValidity(); return false; } }
        return true;
      };
      form.querySelectorAll('[data-next]').forEach(function (b) { b.addEventListener('click', function () { if (valid(steps[current])) show(current + 1, true); }); });
      form.querySelectorAll('[data-back]').forEach(function (b) { b.addEventListener('click', function () { show(current - 1, true); }); });
      show(0, false);

      // Body map and area list stay in sync (the checkboxes are what is sent)
      var map = form.querySelector('[data-body-map]');
      if (map) {
        var boxes = form.querySelectorAll('[data-area-list] input');
        var sync = function () {
          boxes.forEach(function (bx) {
            var spot = map.querySelector('[data-area="' + bx.value + '"]');
            if (spot) spot.classList.toggle('is-on', bx.checked);
          });
        };
        map.addEventListener('click', function (e) {
          var spot = e.target.closest('[data-area]');
          if (!spot) return;
          boxes.forEach(function (bx) { if (bx.value === spot.getAttribute('data-area')) bx.checked = !bx.checked; });
          sync();
        });
        boxes.forEach(function (bx) { bx.addEventListener('change', sync); });
      }
    });

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
            if (form.hasAttribute('data-book')) {
              form.querySelectorAll('.book-step').forEach(function (st) { st.classList.remove('is-current'); });
              form.querySelectorAll('.body-spot.is-on').forEach(function (sp) { sp.classList.remove('is-on'); });
            }
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

    // Booking reason can be pre-selected from a link, e.g. /book-now.html?reason=hydrotherapy
    // Body areas can be ticked from a link too, e.g. /book-now.html?area=Left%20knee (from the Method page figure)
    var areaParam = new URLSearchParams(window.location.search).get('area');
    if (areaParam) {
      areaParam.split(',').forEach(function (v) {
        document.querySelectorAll('input[name="areas"]').forEach(function (box) {
          if (box.value.toLowerCase() === v.trim().toLowerCase() && !box.checked) {
            box.checked = true;
            box.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      });
    }
    var reason = new URLSearchParams(window.location.search).get('reason');
    var reasonSelect = document.getElementById('book-reason');
    if (reason && reasonSelect) {
      var match = Array.prototype.find.call(reasonSelect.options, function (o) {
        return o.value && o.text.toLowerCase().indexOf(reason.toLowerCase()) !== -1;
      });
      if (match) reasonSelect.value = match.value;
    }

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
