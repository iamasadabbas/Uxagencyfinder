// Downloads each agency's logo/icon from its OFFICIAL website and stores it locally in public/logos/.
// The site never hotlinks logos at runtime. Source URL + date are recorded in src/data/agencies.json (logo, logo_source).
// Usage: node scripts/fetch-logos.mjs [agency-id ...]   (no args = all agencies without a logo)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = resolve(root, 'src/data/agencies.json');
const outDir = resolve(root, 'public/logos');
mkdirSync(outDir, { recursive: true });

const agencies = JSON.parse(readFileSync(dataPath, 'utf8'));
const only = process.argv.slice(2);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

const extFor = (type, url) => {
  if (/svg/.test(type) || /\.svg(\?|$)/i.test(url)) return 'svg';
  if (/png/.test(type) || /\.png(\?|$)/i.test(url)) return 'png';
  if (/webp/.test(type)) return 'webp';
  if (/jpe?g/.test(type) || /\.jpe?g(\?|$)/i.test(url)) return 'jpg';
  if (/icon|ico/.test(type) || /\.ico(\?|$)/i.test(url)) return 'ico';
  return null;
};

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: '*/*' }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
}

function candidates(html, base) {
  const out = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = (tag.match(/rel=["']([^"']+)["']/i) || [])[1]?.toLowerCase() ?? '';
    const href = (tag.match(/href=["']([^"']+)["']/i) || [])[1];
    if (!href || !/icon/.test(rel)) continue;
    const sizes = (tag.match(/sizes=["'](\d+)x\d+["']/i) || [])[1];
    let score = Number(sizes) || 32;
    if (/apple-touch-icon/.test(rel)) score += 1000;
    if (/\.svg/i.test(href) || /svg/.test(tag)) score += 500;
    if (/mask-icon/.test(rel)) score -= 2000; // monochrome mask
    out.push({ url: new URL(href, base).toString(), score });
  }
  out.push({ url: new URL('/apple-touch-icon.png', base).toString(), score: 900 });
  out.push({ url: new URL('/favicon.ico', base).toString(), score: 1 });
  return out.sort((a, b) => b.score - a.score);
}

for (const a of agencies) {
  if (only.length ? !only.includes(a.id) : a.logo) continue;
  let saved = null;
  try {
    const page = await get(a.official_website);
    const html = await page.text();
    for (const c of candidates(html, page.url)) {
      try {
        const r = await get(c.url);
        const type = r.headers.get('content-type') || '';
        const ext = extFor(type, c.url);
        if (!ext || /text\/html/.test(type)) continue;
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length < 200) continue;
        const file = `${a.id}.${ext}`;
        writeFileSync(resolve(outDir, file), buf);
        saved = { file: `/logos/${file}`, src: c.url };
        break;
      } catch {}
    }
  } catch (e) {
    console.log(`x ${a.id}: ${e.message}`);
  }
  if (saved) {
    a.logo = saved.file;
    a.logo_source = { url: saved.src, retrieved: new Date().toISOString().slice(0, 10), basis: 'Official agency website; used at site owner direction to identify the agency.' };
    console.log(`OK ${a.id} <- ${saved.src}`);
  } else console.log(`-- ${a.id}: no logo found`);
}
writeFileSync(dataPath, JSON.stringify(agencies, null, 2) + '\n');

