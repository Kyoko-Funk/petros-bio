/* cookie-consent.js (Pétros Biokinetics) */
(function () {
  'use strict';

  const KEY = 'petros_cookie_consent_v1';
  const SESSION_SHOWN = 'petros_cookie_shown_v1';
  const SESSION_DISMISS = 'petros_cookie_dismissed_v1';

  // ✅ Production: keep false.
  // Set true temporarily to force banner open for testing.
  const DEBUG_FORCE_SHOW = false;

  // ✅ Optional: show console logs while testing
  const DEBUG_LOGS = false;

  function log(...args) {
    if (DEBUG_LOGS) console.log('[cookie]', ...args);
  }

  // Load external CSS
  (function loadCSS() {
    try {
      if (document.querySelector('link[href*="cookie-consent.css"]')) return;
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'cookie-consent.css';
      document.head.appendChild(link);
    } catch (e) {}
  })();

  // Helper: safe storage wrappers
  function safeGet(storage, key) {
    try { return storage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(storage, key, val) {
    try { storage.setItem(key, val); return true; } catch (e) { return false; }
  }

  function isAccepted() {
    return safeGet(localStorage, KEY) === 'accepted';
  }

  // Load external script helper
  function loadScript(src, id, attrs) {
    if (id && document.getElementById(id)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      try {
        const s = document.createElement('script');
        if (id) s.id = id;
        s.src = src;
        s.async = true;
        if (attrs) Object.keys(attrs).forEach(k => s.setAttribute(k, attrs[k]));
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load ' + src));
        document.head.appendChild(s);
      } catch (e) {
        reject(e);
      }
    });
  }

  // Provide enableAnalytics() if site didn't define it
  (function registerEnableAnalytics() {
    if (typeof window.enableAnalytics === 'function') return;

    window.enableAnalytics = function () {
      try {
        log('enableAnalytics(): enabling providers');

        // Google Analytics (gtag) via window.PETROS_GA_ID (e.g. 'G-XXXXXXXX')
        if (window.PETROS_GA_ID) {
          window.dataLayer = window.dataLayer || [];
          function gtag() { window.dataLayer.push(arguments); }
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', window.PETROS_GA_ID);

          loadScript(
            'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(window.PETROS_GA_ID),
            'petros-gtag'
          ).catch(() => console.warn('gtag.js failed to load'));
        }

        // Google Tag Manager via window.PETROS_GTM_ID
        if (window.PETROS_GTM_ID) {
          (function (w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
            var f = d.getElementsByTagName(s)[0];
            var j = d.createElement(s);
            j.async = true;
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i;
            f.parentNode.insertBefore(j, f);
          })(window, document, 'script', 'dataLayer', window.PETROS_GTM_ID);
        }

        // Plausible via window.PLAUSIBLE_DOMAIN
        if (window.PLAUSIBLE_DOMAIN) {
          loadScript(
            'https://plausible.io/js/plausible.js',
            'petros-plausible',
            { 'data-domain': window.PLAUSIBLE_DOMAIN }
          ).catch(() => console.warn('plausible failed to load'));
        }

        // Matomo via window.MATOMO = { siteUrl:'https://...', siteId:'1' }
        if (window.MATOMO && window.MATOMO.siteUrl && window.MATOMO.siteId) {
          var _paq = window._paq = window._paq || [];
          _paq.push(['setTrackerUrl', window.MATOMO.siteUrl.replace(/\/?$/, '/') + 'matomo.php']);
          _paq.push(['setSiteId', window.MATOMO.siteId]);
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);

          loadScript(
            window.MATOMO.siteUrl.replace(/\/?$/, '/') + 'matomo.js',
            'petros-matomo'
          ).catch(() => console.warn('matomo failed to load'));
        }

      } catch (e) {
        console.error('enableAnalytics error', e);
      }
    };
  })();

  // If already accepted, auto-enable analytics once per page load
  (function maybeEnableAnalyticsOnLoad() {
    if (!isAccepted()) return;
    if (window.__PETROS_ANALYTICS_ENABLED__) return;
    window.__PETROS_ANALYTICS_ENABLED__ = true;
    try { window.enableAnalytics(); } catch (e) {}
  })();

  function removeBanner() {
    const b = document.getElementById('cookie-banner');
    if (b) {
      // cleanup outside click listener if attached
      if (b.__petros_doc_click__) document.removeEventListener('click', b.__petros_doc_click__);
      if (b.__petros_keydown__) document.removeEventListener('keydown', b.__petros_keydown__);
      b.remove();
    }
  }
function openPreferencesModal() {
  // If already open, do nothing
  if (document.querySelector('.cc-modal-overlay')) return;

  const current = safeGet(localStorage, KEY);
  const analyticsOn = (current === 'accepted'); // simple model: accepted => analytics on

  const overlay = document.createElement('div');
  overlay.className = 'cc-modal-overlay';
  overlay.innerHTML = `
    <div class="cc-modal" role="dialog" aria-modal="true" aria-label="Cookie preferences">
      <h3>Cookie preferences</h3>
      <p>We use essential cookies to make the site work. You can choose whether to allow analytics cookies to help us improve the website.</p>

      <div class="cc-row">
        <div>
          <strong>Essential cookies</strong>
          <small>Always on. Needed for basic site functionality.</small>
        </div>
        <div class="cc-switch" role="switch" aria-checked="true" aria-label="Essential cookies" style="opacity:.6; cursor:not-allowed"></div>
      </div>

      <div class="cc-row">
        <div>
          <strong>Analytics cookies</strong>
          <small>Helps us understand visits and improve pages.</small>
        </div>
        <div id="cc-analytics-switch" class="cc-switch" role="switch" tabindex="0" aria-checked="${analyticsOn ? 'true' : 'false'}" aria-label="Analytics cookies"></div>
      </div>

      <div class="cc-modal-actions">
        <button type="button" class="cookie-btn cookie-notnow" id="cc-cancel">Cancel</button>
        <button type="button" class="cookie-btn cookie-manage" id="cc-policy">Privacy Policy</button>
        <button type="button" class="cookie-btn cookie-accept" id="cc-save">Save</button>
      </div>
    </div>
  `;

  function close() { overlay.remove(); }

  function toggleSwitch(el) {
    const isOn = el.getAttribute('aria-checked') === 'true';
    el.setAttribute('aria-checked', isOn ? 'false' : 'true');
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  const sw = overlay.querySelector('#cc-analytics-switch');
  sw.addEventListener('click', () => toggleSwitch(sw));
  sw.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      toggleSwitch(sw);
    }
    if (ev.key === 'Escape') close();
  });

  overlay.querySelector('#cc-cancel').addEventListener('click', close);
  overlay.querySelector('#cc-policy').addEventListener('click', () => {
    window.open('/privacy-policy.html', '_blank', 'noopener');
  });

  overlay.querySelector('#cc-save').addEventListener('click', () => {
    const analyticsEnabled = sw.getAttribute('aria-checked') === 'true';

    if (analyticsEnabled) {
      safeSet(localStorage, KEY, 'accepted');
      if (!window.__PETROS_ANALYTICS_ENABLED__) {
        window.__PETROS_ANALYTICS_ENABLED__ = true;
        try { window.enableAnalytics(); } catch (e) {}
      }
    } else {
      // simplest "reject": store something other than accepted
      safeSet(localStorage, KEY, 'rejected');
    }

    safeSet(sessionStorage, SESSION_DISMISS, '1');
    close();
    removeBanner(); // hide banner after saving
  });

  document.body.appendChild(overlay);

  // Focus switch for accessibility
  setTimeout(() => {
    try { sw.focus(); } catch (e) {}
  }, 0);
}

  function createBanner() {
    const div = document.createElement('div');
    div.id = 'cookie-banner';
    div.className = 'cookie-banner collapsed'; // start collapsed by default
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-live', 'polite');
    div.setAttribute('aria-label', 'Cookie consent');
    div.setAttribute('aria-expanded', 'false');

    div.innerHTML = `
<div class="icon" aria-hidden="true" title="Privacy & cookies">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
       width="22" height="22" fill="none"
       stroke="currentColor" stroke-width="1.7"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
</div>




      <div class="cookie-content">
        <p>
          <strong>Pétros Biokinetics</strong> uses minimal cookies to keep the site working and improve experience.
          By clicking <strong>Accept</strong> you consent to cookies.
          <a href="/privacy-policy.html">Privacy Policy</a>
        </p>
      </div>

      <div class="actions">
        <button class="cookie-btn cookie-notnow" type="button" aria-label="Not now">Not now</button>
        <button class="cookie-btn cookie-manage" type="button" aria-label="Manage cookies">Manage</button>
        <button class="cookie-btn cookie-accept" type="button" aria-label="Accept cookies">Accept</button>
      </div>
    `;

    // Expand / collapse logic
    function expand() {
      if (!div.classList.contains('collapsed')) return;
      div.classList.remove('collapsed');
      div.setAttribute('aria-expanded', 'true');
      const acceptBtn = div.querySelector('.cookie-accept');
      if (acceptBtn) acceptBtn.focus();
    }

    function collapse() {
      if (div.classList.contains('collapsed')) return;
      div.classList.add('collapsed');
      div.setAttribute('aria-expanded', 'false');
    }

    // Click anywhere on the pill expands, but don't hijack button/link clicks
    div.addEventListener('click', function (e) {
      if (e.target.closest('button, a')) return;
      if (div.classList.contains('collapsed')) expand();
      e.stopPropagation();
    });

    // Prevent banner clicks from bubbling to document
    div.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
    });

    // Buttons
    div.querySelector('.cookie-accept').addEventListener('click', function (e) {
      e.preventDefault();
      safeSet(localStorage, KEY, 'accepted');
      safeSet(sessionStorage, SESSION_DISMISS, '1');
      removeBanner();
      // enable analytics immediately
      if (!window.__PETROS_ANALYTICS_ENABLED__) {
        window.__PETROS_ANALYTICS_ENABLED__ = true;
        try { window.enableAnalytics(); } catch (err) {}
      }
      log('Accepted');
    });

    div.querySelector('.cookie-notnow').addEventListener('click', function (e) {
      e.preventDefault();
      safeSet(sessionStorage, SESSION_DISMISS, '1');
      removeBanner();
      log('Dismissed for session');
    });

    div.querySelector('.cookie-manage').addEventListener('click', function (e) {
  e.preventDefault();
  openPreferencesModal();
});


    // Desktop-only: collapse when clicking outside or pressing Escape
    if (window.innerWidth > 640) {
      const onDocClick = function () { collapse(); };
      const onKeyDown = function (ev) {
        if (ev.key === 'Escape') collapse();
      };
      div.__petros_doc_click__ = onDocClick;
      div.__petros_keydown__ = onKeyDown;
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKeyDown);
    }

    // Make icon keyboard reachable if you want (optional)
    const icon = div.querySelector('.icon');
    if (icon) {
      icon.style.cursor = 'pointer';
      icon.setAttribute('tabindex', '0');
      icon.addEventListener('click', function (e) {
        e.stopPropagation();
        expand();
      });
      icon.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          expand();
        }
      });
    }

    return div;
  }

  function shouldShowBanner() {
    // If accepted, never show (unless forced for debug)
    if (DEBUG_FORCE_SHOW) return true;
    if (isAccepted()) return false;

    // If already shown this session or dismissed, don't show again this session
    if (safeGet(sessionStorage, SESSION_SHOWN) === '1') return false;
    if (safeGet(sessionStorage, SESSION_DISMISS) === '1') return false;

    // mark shown for this session
    safeSet(sessionStorage, SESSION_SHOWN, '1');
    return true;
  }

  function avoidFloatingButtons(banner) {
    // Keep this conservative: only adjust desktop expanded banner
    if (!banner) return;
    if (window.innerWidth <= 640) return;

    try {
      const wa = document.querySelector('a[href*="wa.me"], a[href*="whatsapp"]');
      if (!wa) return;

      const r = wa.getBoundingClientRect();
      const offset = Math.round(r.width + 20);
      banner.style.setProperty('--wa-offset', offset + 'px');
      banner.classList.add('avoid-wa');

      // if wa is on left side, move collapsed pill to right
      const waIsRightHalf = (r.left > window.innerWidth / 2);
      if (!waIsRightHalf) banner.classList.add('collapsed-right');
      else banner.classList.remove('collapsed-right');

      window.addEventListener('resize', () => {
        try {
          const nr = wa.getBoundingClientRect();
          banner.style.setProperty('--wa-offset', Math.round(nr.width + 20) + 'px');
        } catch (e) {}
      });
    } catch (e) {}
  }

  function init() {
    try {
      if (!shouldShowBanner()) return;

      const banner = createBanner();

      // On mobile, always start expanded so it's readable
      if (window.innerWidth <= 640) {
        banner.classList.remove('collapsed');
        banner.setAttribute('aria-expanded', 'true');
      }

      // If forcing debug show, expand (desktop too)
      if (DEBUG_FORCE_SHOW) {
        banner.classList.remove('collapsed');
        banner.setAttribute('aria-expanded', 'true');
      }

      document.body.appendChild(banner);

      // CSS-driven "enter" animation without breaking translateX
      requestAnimationFrame(() => {
        banner.classList.add('cc-show');
      });

      avoidFloatingButtons(banner);

      // If expanded, focus accept
      if (!banner.classList.contains('collapsed')) {
        const accept = banner.querySelector('.cookie-accept');
        if (accept) accept.focus();
      }

      log('Banner shown');
    } catch (e) {
      console.error('cookie-consent init error', e);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
