/* Cookie consent for Pétros Biokinetics.
 * Google Analytics / Tag Manager load only after the visitor clicks "Accept".
 * IDs are set in the page <head> (window.PETROS_GA_ID, window.PETROS_GTM_ID). */
(function () {
  'use strict';
  var KEY = 'petros_cookie_consent_v1'; // same key as the old banner, so earlier choices are kept

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) { } }

  function loadAnalytics() {
    if (window.__petrosAnalytics) return;
    window.__petrosAnalytics = true;
    window.dataLayer = window.dataLayer || [];
    if (window.PETROS_GTM_ID) {
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      add('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(window.PETROS_GTM_ID));
    }
    if (window.PETROS_GA_ID) {
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', window.PETROS_GA_ID);
      add('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(window.PETROS_GA_ID));
    }
  }
  function add(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }

  function banner() {
    if (document.getElementById('cookie-banner')) return;
    var el = document.createElement('div');
    el.id = 'cookie-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Cookie choice');
    el.className = 'fixed bottom-4 left-4 right-24 z-40 max-w-md rounded-2xl border border-black/5 bg-white p-5 text-sm text-petros-slate shadow-lift md:bottom-6 md:left-6 md:right-auto';
    el.innerHTML =
      '<p>We use analytics cookies to see how people use this website. They are only set if you accept. ' +
      '<a class="text-petros-moss underline" href="/privacy-policy.html">Privacy Policy</a></p>' +
      '<div class="mt-4 flex gap-3"><button type="button" class="btn-primary min-h-[44px] px-5" data-c="accepted">Accept</button>' +
      '<button type="button" class="btn-outline min-h-[44px] px-5" data-c="declined">Decline</button></div>';
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]');
      if (!b) return;
      set(b.getAttribute('data-c'));
      if (b.getAttribute('data-c') === 'accepted') loadAnalytics();
      el.remove();
    });
    document.body.appendChild(el);
  }

  function init() {
    var choice = get();
    if (choice === 'accepted') loadAnalytics();
    else if (choice !== 'declined') banner();
    document.querySelectorAll('[data-cookie-settings]').forEach(function (b) {
      b.addEventListener('click', function () { banner(); var f = document.querySelector('#cookie-banner button'); if (f) f.focus(); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
