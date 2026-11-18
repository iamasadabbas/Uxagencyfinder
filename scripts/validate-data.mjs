// Validates src/data/*.json. Runs automatically before `npm run build`.
// Usage: npm run validate
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateData } from '../src/lib/schema.mjs';

const dataDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data');
const load = (f) => {
  try {
    return JSON.parse(readFileSync(resolve(dataDir, f), 'utf8'));
  } catch (e) {
    console.error(`x Could not read/parse src/data/${f}: ${e.message}`);
    process.exit(1);
  }
};

const { errors, warnings, data } = validateData({
  site: load('site.json'),
  agencies: load('agencies.json'),
  industries: load('industries.json'),
  sources: load('sources.json'),
});

for (const w of warnings) console.warn(`! ${w}`);
if (errors.length) {
  console.error(`\nx Data validation failed with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
const placements = data.industries.reduce((n, i) => n + i.placements.length, 0);
console.log(`OK Data valid: ${data.agencies.length} agencies, ${data.industries.length} industries, ${placements} placements, ${data.sources.length} sources.`);
