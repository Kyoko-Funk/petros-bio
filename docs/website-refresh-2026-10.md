# Website refresh, October 2026

Work done from the "Pétros Biokinetics website: refresh brief" (14 October 2026), Parts 1–3. Part 4 (patient portal etc.) was not built.

Backup: git tag `backup-before-refresh-2026-10-14` points at the site exactly as it was before this work.

## Part 1: site-wide fixes
- **One shared header, footer and head** on every page (`partials/`, synced with `npm run build`). One desktop menu and one mobile menu; Book Now in the header and footer of every page. Nav order: Home · Method · Services · Fees · Medical Aid · FAQ · About · Contact · Book Now.
- **Leaked code/leftovers:** removed `loader.html` and its iframe, `gradient-test.html`, the stray About-page class text and the broken lightbox image. Canonical is now a real `<link rel="canonical">` (it was a `<meta name="canonical">`, which search engines ignore). `meta keywords` removed. `og:type` is `website` everywhere.
- **Analytics:** Google Analytics and Tag Manager now load only after a visitor clicks Accept on a new, simpler cookie banner ("Cookie settings" in the footer lets people change their mind). Before, they loaded for everyone, before consent.
- **Name and encoding:** "Pétros Biokinetics" everywhere, UTF-8, no `&amp;` in titles or alt text. Logo alt text fixed.
- **URL style:** the live server is Microsoft IIS, which ignores `.htaccess`. Pages therefore use `.html` addresses everywhere (`/contact.html`): links, canonicals, sitemap and structured data, with real `<link rel="canonical">` tags (the old site used a meta tag Google ignores). `web.config` gives IIS the custom 404 page, the .webp file type, security headers and hides source folders. When uploading, delete `loader.html` and `gradient-test.html` from the server.
- **Footer:** identical on every page, clean hours list, one phone format, practice number, new tagline, one Facebook link. The second WhatsApp number (+264 81 650 3103) is removed.
- **Images:** descriptive alt text (decorative hero photos use empty alt); Cloudinary images now use `f_auto,q_auto` with sized widths; `loading="lazy"` below the fold; the home page no longer repeats the clinic photo. `3d-render.png` (506 KB) is now `assets/img/anatomy-figure.webp` (18 KB). Logo and favicons regenerated from the Pétros logo (the old favicon was a different "P" mark).
- **Privacy:** the online Patient Assessment Form (medical history, allergies, medication…) is removed. Booking and contact forms collect only name, phone, email, preferred date and time, medical aid yes/no and a general reason. The "Website" field is a hidden spam trap (Formspree `_gotcha`), off-screen and out of the tab order.
- **Wording:** absolute or unsupported claims replaced per the brief's table (checked automatically by `npm run check`).
- **Structured data:** removed the made-up 5-star / 24-review rating; hours match the footer.
- **Server config (`.htaccess`):** removed a `<Directory>` block that is not allowed in `.htaccess` (on Apache it causes a 500 error) and the `Cross-Origin-Embedder-Policy: require-corp` header, which blocks Cloudinary images, Google Fonts and the map. The Content Security Policy now lists exactly the services the site uses (it previously blocked Google Analytics, Tag Manager and the map).

## Part 2: page copy
All pages use the brief's text, titles and meta descriptions: Home, Method, Services (three groups; neurological cards merged; "Helps with"), Fees (2026 schedule, 12-hour cancellation), **new Medical Aid page**, FAQ (12 answers, readable without JavaScript), About, Contact (email shown, map regenerated from the address), Book Now (correct "we'll contact you to confirm" message, no 13:00 slot, weekends blocked), plain-English Privacy Policy and Terms, house-style 404 and 500 pages.

## Part 3: new features
- Forms send to petrosbiokinetics@gmail.com via Formspree (`https://formspree.io/f/xbddjlny`, the endpoint the old site already used), with clear success and error messages.
- Floating WhatsApp button on every page with the pre-filled booking message.
- Accessibility: 17–18 px body text, 44–48 px buttons, contrast-checked colours (small green text uses `#566643`), skip link, keyboard-usable menu (Escape closes), labelled form fields, reduced-motion support.
- Performance: Tailwind is compiled (no 300 KB runtime CDN script), unused scripts removed, three.js is loaded only on Home and Method, and the 3D effects pause when off screen.
- New favicon set, web manifest, sitemap.xml and robots.txt.

## The 3D spine (Method page)
Kept and improved: tap a region on phones (there's no hover on touch), region buttons under the model (also keyboard accessible), "Drag to rotate" shows once, vertical swipes still scroll the page, it pauses off screen, respects reduced motion, and shows a still image if the device can't run 3D or JavaScript is off.

## Still to confirm with Jean-Pierre
Every item is also marked in the code as `TODO [CONFIRM]` (run `grep -rn "TODO \[CONFIRM" *.html partials`).
1. Opening hours: Mon–Fri 06:00–18:00, closed 13:00–14:00.
2. Facebook: which page is current (now using `profile.php?id=61570341071678`).
3. The removed second WhatsApp number (+264 81 650 3103): whose is it?
4. Fees: still the 2026 schedule? Does a full evaluation include all three assessments? Session length? Virtual consultations are offered and paid by EFT (confirmed); their prices (N$ 300 / 250 / 350, from the old site) still need confirming.
5. OK to publish banking details? PayToday still accepted? Not VAT-registered?
6. OK to state the session tariff of N$ 379.80 on the Medical Aid page (left off for now)?
7. Referral wording; "short health questionnaire at your first visit" wording; first assessment duration.
8. All FAQ answers.
9. About: exact qualification, HPCNA registration number, a 3–5 sentence bio, the pugs ("Meet the team"?).
10. Cloudinary file names (e.g. the rehab-area photo named "ChatGPT_Image_Jan_10_2026…") can only be renamed in the Cloudinary account. Years of experience ("8+") to confirm.
11. Aquatherapy: offered, and where?
12. "We usually reply within one working day."
13. Map pin location.
14. Privacy Policy and Terms: legal check, including Namibian data-protection requirements.
15. Hosting: the server is IIS. After uploading `web.config`, open a page: if it shows a 500 error, the host has locked a setting; delete `web.config` and check with the host. A `www.` to non-www redirect, if wanted, is set in the host's dashboard.

## Notes
- Fonts and colours stayed as on the current site (Playfair Display, Inter, sage/forest green) because the brief says to keep the visual style. The brand sheet's Belleza font and blue-grey #7E8DA4 can be swapped in through `tailwind.config.js` if wanted.
- Alt text for stock photos was written from their file names and context, because the images couldn't be viewed during the work. Worth a quick look.

## Hydrotherapy page (added 15 October 2026)
New page `hydrotherapy.html`, linked from Services, the home page and the footer (it highlights "Services" in the menu).
- Warm Scandinavian look used only on this page: linen and oat backgrounds, oak accents, the brand blue-grey as the water colour.
- Hero: a live water surface with soft sunlight patterns that ripples where you move or tap (`assets/js/hydrotherapy.js`, plain WebGL, about 8 KB, no library). It pauses off screen, shows a still frame for people who reduce motion, and falls back to a gradient.
- "How much does the water carry?": a slider with a figure that shows the approximate share of body weight carried at hip, waist, chest and neck depth.
- Sections: what hydrotherapy is, why water helps, who it can help, what a session looks like, "Is it right for me?", what to bring, fees, medical aid, a short FAQ, and a call to action.
- "Book hydrotherapy" opens the booking form with "Hydrotherapy (aquatherapy)" already selected (`/book-now.html?reason=hydrotherapy`).

Still to confirm with Jean-Pierre (all marked `TODO [CONFIRM]` on the page): which pool and where, water temperature, session length, one-on-one or group, fees, medical aid cover, the conditions list, the "please tell us first" list, the weight percentages, and the FAQ answers. A real photo of the pool would be a good addition.

## Going live (host: Namhost Plesk, Windows/IIS)
Findings from a check of the live site and Google Search Console (15 Oct 2026): 9 pages indexed, 13 not. The real problem is
4 × "Not found (404)" for `/terms`, `/privacy-policy`, `/faq` and `/contact`: the live pages point Google to those clean addresses,
but IIS can't serve them. This branch points every canonical to the working `/page.html` address, and `web.config` redirects
those old clean addresses to the `.html` pages using IIS's built-in HTTP Redirection (no URL Rewrite add-on needed).

1. Back up the current live files in Plesk (File Manager → select all → Archive, or download).
2. Upload the site files from this branch: the `.html` pages, `assets/`, `.well-known/`, `web.config`, `robots.txt`,
   `sitemap.xml`, `site.webmanifest`, `favicon.png`, `apple-touch-icon.png` and `googleb72ec79db06fb2cb.html`.
   Source files (`partials/`, `src/`, `tools/`, `docs/`, `node_modules/`, `package*.json`, `tailwind.config.js`,
   `CLAUDE.md`, `.htaccess`) are not needed on the server; `web.config` hides them if they are uploaded.
3. Delete from the server: `loader.html`, `gradient-test.html`, `3d-render.png`, `logo.png`, `og-image.jpg`, and the old
   scripts no longer used (`tilt.js`, `magnetic-button.js`, `smooth-scroll.js`, `effects.js`, `draw-animations.js`,
   `particles.js`, `spine.js`, `cookie-consent.js`, `cookie-consent.css`, `index.css`, `book-now.css`).
4. Check straight away: the home page loads (no "500" error), `/contact.html` loads, `/contact` redirects to it,
   `/does-not-exist` shows the house-style "Page not found", and the anatomy image (`.webp`) shows on the home page.
   If any page shows a 500 error: delete `web.config` and report the error code.
5. Google Search Console: submit `https://petrosbiokinetics.com/sitemap.xml`, open the "Not found (404)" reason and click
   "Validate fix", then "Request indexing" for the home page and `/services.html`.

## Overhaul (15 October 2026)
After comparing the branch with the live site and the brief:
- **Brand palette and fonts from brief section 5:** blue-grey primary, olive and deep green accents, warm off-white,
  Belleza headings, Barlow Condensed labels (free stand-in for Heartland Sans Condensed), Inter body text. The 3D spine,
  particles, favicons and theme colour follow the new palette.
- **Hand-drawn pen strokes** (as on the live site) on every page title and a few key headings; they draw themselves in on scroll.
- **Real practice photos** instead of stock: rehab area (home closing section, Method step 3, About), consultation room
  (Book Now hero, Method step 1), reception (About hero), practice exterior (Contact hero), and a new
  "Meet Jean-Pierre" section with his portrait on the home page.
- **Phones:** a Call button above the WhatsApp button.
- **About:** practice photos open full size when tapped.
- Virtual consultations added back to Fees (offered, paid by EFT; prices to confirm). Still left out until confirmed: PayToday.
- Still missing: the watercolour pug illustration (for About and the 404 page) and a pool photo for Hydrotherapy.

## Images added 15 October 2026
- `hero-namib*.webp`: AI-generated dunes-meeting-the-sea landscape (home hero, decorative).
- `exercise-band-*.webp`: stock photo of guided resistance-band exercise (home, "What is biokinetics").
- Ready for the next pages: `knee-assessment-*` (hands-on knee assessment), `skeleton-illustration-*` (AI anatomy
  illustration, accurate enough for the Method page), `knee-taping-*` (sports taping, for performance/sports injuries).
- Not used: a wrist-mobilisation photo showing another company's logo on the sleeve.
