# Pétros Biokinetics website

Static site for petrosbiokinetics.com: plain HTML pages at the repo root, no framework.

## Editing rules
- Header, footer and the shared `<head>` basics live in `partials/`. Never edit them inside a page:
  edit the partial, then run `npm run build` to copy it into every page (between the `<!-- @header -->` style markers).
- Icons: write `<svg data-icon="phone" class="h-5 w-5"></svg>` (Lucide names, or `si:whatsapp` / `si:instagram` / `si:facebook`)
  and `npm run build` fills them in.
- Styles: Tailwind, compiled. Edit `src/site.css` / `tailwind.config.js` or use Tailwind classes in pages, then
  `npm run build` (it also runs `build:css`). Commit the generated `assets/css/site.css`.
- Run `npm run check` before committing: it checks titles, descriptions, canonicals, links, alt text, banned claims.
- Links and canonicals use clean addresses without `.html` (`/contact`, `/the-method`). `.htaccess` serves `contact.html`
  for `/contact`, redirects old `.html` and `www.` addresses, and serves `404.html` for missing pages.
- Name is always "Pétros Biokinetics" (with the accent). No absolute or unsupported health claims.
- No health information may be collected by website forms. Forms post to Formspree (`xbddjlny`) and email the practice.
- `TODO [CONFIRM]` comments mark facts the practitioner still has to confirm. Don't remove them without an answer.
- The 3D spine (`assets/js/spine.js`) and hero particles (`assets/js/particles.js`) use the vendored three.js r128
  in `assets/vendor/`. They load only on the home and Method pages.
