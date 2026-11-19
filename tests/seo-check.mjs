// Static SEO audit of dist/: titles, descriptions, canonicals, robots, sitemap coverage, dashes.
// Usage: node tests/seo-check.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve('dist');
const site = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
const pages = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : f.endsWith('.html') && pages.push(p); } })(dist);

const issues = [];
const titles = new Map(), descs = new Map();
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const file of pages) {
  const rel = '/' + file.slice(dist.length + 1).replace(/\\/g, '/').replace(/index\.html$/, '');
  const html = readFileSync(file, 'utf8');
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const canon = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? '';
  const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  if (rel === '/404.html') continue;
  if (title.length < 20 || title.length > 65) issues.push(`${rel}: title length ${title.length} "${title}"`);
  if (desc.length < 70 || desc.length > 160) issues.push(`${rel}: description length ${desc.length}`);
  if (canon !== site.siteUrl + rel) issues.push(`${rel}: canonical ${canon}`);
  if (!site.noindex && robots.includes('noindex')) issues.push(`${rel}: noindex present`);
  if (!html.includes('og:image')) issues.push(`${rel}: missing og:image`);
  if (!locs.includes(site.siteUrl + rel)) issues.push(`${rel}: not in sitemap.xml`);
  if (titles.has(title)) issues.push(`${rel}: duplicate title with ${titles.get(title)}`); else titles.set(title, rel);
  if (descs.has(desc)) issues.push(`${rel}: duplicate description with ${descs.get(desc)}`); else descs.set(desc, rel);
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
  if (/[\u2014\u2013]/.test(text)) issues.push(`${rel}: contains an em/en dash`);
}
for (const loc of locs) {
  const path = loc.replace(site.siteUrl, '');
  if (!existsSync(join(dist, path, 'index.html'))) issues.push(`sitemap: ${loc} has no page`);
}
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', 'llm.txt', 'llms-full.txt', 'og-image.png', 'apple-touch-icon.png', 'favicon.svg']) {
  if (!existsSync(join(dist, f))) issues.push(`missing /${f}`);
}
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt']) {
  if (existsSync(join(dist, f)) && /[\u2014\u2013]/.test(readFileSync(join(dist, f), 'utf8'))) issues.push(`/${f} contains an em/en dash`);
}
const robots = readFileSync(join(dist, 'robots.txt'), 'utf8');
if (!site.noindex && !robots.includes(`Sitemap: ${site.siteUrl}/sitemap.xml`)) issues.push('robots.txt does not reference sitemap');
console.log(`Checked ${pages.length - 1} pages, ${locs.length} sitemap URLs.`);
console.log(issues.length ? issues.map((i) => '  x ' + i).join('\n') : 'OK: no SEO issues found.');
process.exit(issues.length ? 1 : 0);

