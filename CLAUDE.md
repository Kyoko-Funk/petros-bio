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
- The live server is Microsoft IIS: it ignores `.htaccess` and uses `web.config`. IIS has no clean-URL support without
  an add-on, so links and canonicals use `.html` addresses (`/contact.html`); the home page is `/`. `web.config` sets the
  404 page, file types (.webp), security headers and hides source folders. `.htaccess` is kept for Apache hosts only.
- Brand (brief section 5): blue-grey `petros-blue` #7E8DA4 primary (`petros-navy` #4E5D73 for buttons/small text),
  olive #708238 and deep green `petros-moss` #566643 accents, warm off-white #FAFAF7, ink #2B2F36. Headings in Belleza
  (no italic: accent words use `<em>` in blue), labels in Barlow Condensed, body in Inter. Hand-drawn pen strokes:
  `<em class="draw">` (underline) or `draw-circle` (oval); use sparingly.
- Name is always "Pétros Biokinetics" (with the accent). No absolute or unsupported health claims.
- No health information may be collected by website forms. Forms post to Formspree (`xbddjlny`) and email the practice.
- `TODO [CONFIRM]` comments mark facts the practitioner still has to confirm. Don't remove them without an answer.
- The 3D spine (`assets/js/spine.js`) uses the vendored three.js r128
  in `assets/vendor/` and loads only on the Method page. Hero particles use the light 2D `assets/js/particles-lite.js`
  (`assets/js/particles.js` is the old three.js version, no longer used).
