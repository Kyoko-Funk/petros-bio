#!/usr/bin/env node
/*
 * Keeps the shared parts of every page in sync, so the header, footer and <head> basics
 * are identical everywhere. Run `npm run build` after editing anything in partials/.
 *
 * In each page:
 *   <!-- @head -->…<!-- /@head -->       ← partials/head.html
 *   <!-- @header -->…<!-- /@header -->   ← partials/header.html (current page marked via <body data-page="…">)
 *   <!-- @footer -->…<!-- /@footer -->   ← partials/footer.html
 *   <svg data-icon="phone" class="…"></svg>   ← filled with the Lucide icon (or "si:whatsapp" for brand icons)
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const partials = { head: read('partials/head.html'), header: read('partials/header.html'), footer: read('partials/footer.html') };

const iconCache = {};
function icon(name) {
  if (iconCache[name]) return iconCache[name];
  let file, svg;
  if (name.startsWith('si:')) {
    file = path.join(root, 'node_modules/simple-icons/icons', name.slice(3) + '.svg');
    svg = fs.readFileSync(file, 'utf8');
    const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>[\s\S]*?<\/title>/, '');
    iconCache[name] = { attrs: 'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"', inner };
  } else {
    file = path.join(root, 'node_modules/lucide-static/icons', name + '.svg');
    svg = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s*\n\s*/g, '');
    iconCache[name] = { attrs: 'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"', inner };
  }
  return iconCache[name];
}

function expandIcons(html, file) {
  return html.replace(/<svg\b([^>]*?)\sdata-icon="([^"]+)"([^>]*)>[\s\S]*?<\/svg>/g, (m, before, name, after) => {
    let rest = (before + after)
      .replace(/\s(xmlns|width|height|viewBox|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|aria-hidden|focusable)="[^"]*"/g, '')
      .trim();
    let ic;
    try { ic = icon(name); } catch (e) { throw new Error(`${file}: unknown icon "${name}"`); }
    return `<svg data-icon="${name}"${rest ? ' ' + rest : ''} ${ic.attrs} aria-hidden="true" focusable="false">${ic.inner}</svg>`;
  });
}

function markCurrent(html, page) {
  return html.replace(/(<a\b[^>]*?data-nav="([^"]+)"[^>]*?)(\saria-current="page")?>/g, (m, open, key) =>
    key === page ? `${open} aria-current="page">` : `${open}>`);
}

const pages = fs.readdirSync(root).filter((f) => f.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(f));
let changed = 0;
for (const f of pages) {
  const src = read(f);
  const page = (src.match(/<body[^>]*\sdata-page="([^"]+)"/) || [])[1] || '';
  let out = src;
  for (const key of Object.keys(partials)) {
    const re = new RegExp(`(<!-- @${key} -->)[\\s\\S]*?(<!-- /@${key} -->)`);
    if (re.test(out)) {
      let part = partials[key].trim();
      if (key === 'header') part = markCurrent(part, page);
      out = out.replace(re, (m, a, b) => `${a}\n    ${part}\n    ${b}`);
    }
  }
  out = expandIcons(out, f);
  if (out !== src) { fs.writeFileSync(path.join(root, f), out); changed++; }
}
console.log(`build: ${pages.length} pages checked, ${changed} updated`);
