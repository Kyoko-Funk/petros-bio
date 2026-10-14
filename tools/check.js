#!/usr/bin/env node
/* Quick pre-launch checks for every page. Run with `npm run check`. Exits non-zero on problems. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pages = fs.readdirSync(root).filter((f) => f.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(f));
const problems = [];
const ids = {};
const html = {};
for (const f of pages) {
  html[f] = fs.readFileSync(path.join(root, f), 'utf8');
  ids[f] = new Set([...html[f].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
}

const banned = [
  /loader\.html/, /cdn\.tailwindcss\.com/, /lucide@latest/, /name="keywords"/, /meta-canonical|meta-og:/,
  /P├|Ã©|&amp;amp;/, /resolve chronic pathology/i, /absolute (mobility|fluidity|serenity)/i, /total body fluidity/i,
  /complete restoration/i, /root cause/i, /weightless/i, /medically approved/i, /every outcome is quantified/i, /pioneering/i,
  /264816503103/, /24 hours beforehand/i, /aggregateRating/,
];

for (const f of pages) {
  const s = html[f];
  const err = (m) => problems.push(`${f}: ${m}`);
  const isError = /^(404|500)\.html$/.test(f);
  if (!/<meta charset="utf-8">/i.test(s)) err('missing <meta charset="utf-8">');
  const title = (s.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title) err('missing <title>');
  else if (/&amp;|Petros(?!\w)/.test(title)) err(`bad title text: ${title}`);
  if (!isError && !/<meta name="description" content="[^"]{50,}">/.test(s)) err('missing or short meta description');
  if (!isError && !/<link rel="canonical" href="https:\/\/petrosbiokinetics\.com\/[^"]*">/.test(s)) err('missing canonical');
  if ((s.match(/<h1\b/g) || []).length !== 1) err('should have exactly one <h1>');
  if ((s.match(/<nav class="nav-shell"/g) || []).length !== 1) err('should have exactly one main navigation');
  for (const re of banned) if (re.test(s)) err(`contains banned text ${re}`);
  for (const m of s.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(m[0])) err(`image without alt: ${m[0].slice(0, 90)}`);
    if (/alt="[^"]*(&amp;|Petros )/.test(m[0])) err(`bad alt text: ${m[0].slice(0, 90)}`);
  }
  if (/<svg data-icon="[^"]+"[^>]*><\/svg>/.test(s)) err('icon placeholder not built (run npm run build)');
  const visible = s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
  if (/\bPetros\b/.test(visible)) err('"Petros" without the accent in visible text');
  for (const m of s.matchAll(/href="(\/[^"#?]*)?(#[^"]*)?"/g)) {
    let [, p, hash] = m;
    if (p === undefined && !hash) continue;
    let target = p === undefined ? f : p === '/' ? 'index.html' : p.slice(1);
    if (!fs.existsSync(path.join(root, target))) { err(`broken link ${m[1] || ''}${hash || ''}`); continue; }
    if (hash && hash.length > 1 && target.endsWith('.html') && ids[target] && !ids[target].has(hash.slice(1))) err(`missing anchor ${target}${hash}`);
  }
  for (const m of s.matchAll(/(?:src|href)="(\/(?:assets|[^"/]+\.(?:png|jpg|webp|js|css|webmanifest)))"/g)) {
    if (!fs.existsSync(path.join(root, m[1]))) err(`missing file ${m[1]}`);
  }
}

const todoSet = new Set();
for (const f of pages) for (const m of html[f].matchAll(/TODO \[CONFIRM[^\]]*\]:?\s*([^\n]*?)\s*-->/g)) todoSet.add(m[1]);
const todos = todoSet.size;
if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} problem(s) found.`);
  process.exit(1);
}
console.log(`check: ${pages.length} pages OK. ${todos} TODO [CONFIRM] notes left for the practitioner (grep "TODO \\[CONFIRM").`);
