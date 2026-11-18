// Lighthouse audit (mobile, simulated throttling) for key pages. Requires `npm run preview` running.
// Usage: node tests/lighthouse.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const out = resolve('tests/lighthouse');
mkdirSync(out, { recursive: true });
const pages = ['/', '/agencies/healthcare-ux/', '/directory/', '/agency/ustwo/', '/guides/ux-agency-brief-template/'];
const cli = resolve('node_modules/lighthouse/cli/index.js');

console.log('Page'.padEnd(40), 'Perf', 'A11y', 'BestP', 'SEO*', ' LCP    CLS   TBT');
for (const path of pages) {
  const file = resolve(out, (path.replace(/\//g, '_') || '_home') + '.json');
  execFileSync(process.execPath, [cli, BASE + path, '--quiet', '--output=json', `--output-path=${file}`, `--chrome-path=${CHROME}`, '--chrome-flags=--headless=new --no-sandbox', '--only-categories=performance,accessibility,best-practices,seo'], { stdio: 'ignore' });
  const r = JSON.parse(readFileSync(file, 'utf8'));
  const s = (k) => String(Math.round(r.categories[k].score * 100)).padStart(4);
  const a = r.audits;
  console.log(path.padEnd(40), s('performance'), s('accessibility'), s('best-practices'), s('seo'), ' ', a['largest-contentful-paint'].displayValue.padEnd(6), a['cumulative-layout-shift'].displayValue.padEnd(5), a['total-blocking-time'].displayValue);
  const fails = Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && ['binary', 'numeric'].includes(x.scoreDisplayMode) && r.categories.accessibility.auditRefs.some((ref) => ref.id === x.id));
  for (const f of fails) console.log('    a11y:', f.id, '-', f.title);
}
console.log('\n*SEO is reduced while site.json noindex=true (intentional for the unlaunched site).');

