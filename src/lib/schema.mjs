// Shared data schemas + integrity validation.
// Used by: scripts/validate-data.mjs (runs before every build) and src/lib/data.ts (runs during build/dev).
// If you edit src/data/*.json, run `npm run validate` - the build refuses to run on invalid data.

import { z } from 'zod';

export const EXCLUDED_AGENCIES = ['clay', 'eleken'];
export const PUBLICATION_STATES = ['draft', 'researched', 'reviewed', 'published', 'needs-review', 'archived'];

const state = z.enum(PUBLICATION_STATES);
const url = z.string().url();

export const SiteSchema = z.object({
  name: z.string(),
  domain: z.string(),
  siteUrl: url,
  tagline: z.string(),
  contactEmail: z.string().email(),
  publisher: z.object({ name: z.string(), description: z.string() }),
  editor: z.object({ name: z.string(), slug: z.string(), role: z.string(), bio: z.string() }).nullable(),
  lastReviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  researchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  showDrafts: z.boolean(),
  noindex: z.boolean(),
  testSiteBanner: z.string().nullable(),
  disclosure: z.string(),
});

export const AgencySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  aliases: z.array(z.string()),
  official_website: url,
  summary: z.string().min(1),
  limits_and_questions: z.string().min(1),
  project_evidence: z.string(),
  capability_tags: z.array(z.string()),
  commercial_facts: z.object({
    status: z.enum(['not-researched', 'no-public-figure', 'sourced']),
    note: z.string(),
    items: z.array(z.object({ label: z.string(), value: z.string(), source_id: z.string(), checked: z.string() })).optional(),
  }),
  disclosures: z.array(z.string()),
  logo: z.string().regex(/^\/logos\/[a-z0-9-]+\.(svg|png|webp|jpg|ico)$/).optional(),
  logo_source: z.object({ url: z.string(), retrieved: z.string(), basis: z.string() }).optional(),
  logo_fit: z.enum(['full', 'padded']).optional(),
  publication_state: state,
});

export const PlacementSchema = z.object({
  agency_id: z.string(),
  position: z.number().int().positive(),
  project: z.string().min(1),
  subfield: z.string().min(1),
  contribution: z.string().min(1),
  work_stage: z.string().min(1),
  fit_and_scope: z.string().min(1),
  source_ids: z.array(z.string()),
  selection_basis: z.enum(['editorial', 'owner-directed']),
  evidence_depth: z.string(),
  qualification_label: z.string().optional(),
  publication_state: state,
});

export const IndustrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string(),
  title: z.string(),
  h1: z.string(),
  metaDescription: z.string(),
  intro: z.string(),
  contexts: z.array(z.string()),
  checklist: z.array(z.string()).min(1),
  rationaleNote: z.string().optional(),
  related: z.array(z.string()),
  route: z.string().regex(/^\/agencies\/[a-z0-9-]+\/$/),
  selection_emphasis: z.string(),
  publication_state: state,
  placements: z.array(PlacementSchema),
});

export const SourceSchema = z.object({
  id: z.string().regex(/^E\d{2}$/),
  agency_id: z.string().nullable(),
  label: z.string(),
  url,
  supported_context: z.string(),
  qualification: z.string(),
  accessed_date: z.string(),
  publisher_type: z.string(),
  supplementary: z.boolean().optional(),
});

/**
 * Validates all data. Returns { errors: string[], warnings: string[] }.
 * @param {{site:unknown, agencies:unknown, industries:unknown, sources:unknown}} raw
 */
export function validateData(raw) {
  const errors = [];
  const warnings = [];
  const parse = (schema, value, label) => {
    const r = schema.safeParse(value);
    if (!r.success) {
      for (const issue of r.error.issues) errors.push(`${label} -> ${issue.path.join('.')}: ${issue.message}`);
      return null;
    }
    return r.data;
  };

  const site = parse(SiteSchema, raw.site, 'site.json');
  const agencies = parse(z.array(AgencySchema), raw.agencies, 'agencies.json') ?? [];
  const industries = parse(z.array(IndustrySchema), raw.industries, 'industries.json') ?? [];
  const sources = parse(z.array(SourceSchema), raw.sources, 'sources.json') ?? [];

  // --- Owner exclusions: Clay and Eleken must never appear anywhere ---
  const blob = JSON.stringify({ agencies, industries, sources }).toLowerCase();
  for (const name of EXCLUDED_AGENCIES) {
    const re = new RegExp(`(^|[^a-z])${name}([^a-z]|$)`);
    if (re.test(blob)) errors.push(`Owner exclusion violated: "${name}" appears in the data. Clay and Eleken must never be included.`);
  }

  // --- Uniqueness ---
  const dup = (arr, key, label) => {
    const seen = new Set();
    for (const x of arr) {
      if (seen.has(x[key])) errors.push(`Duplicate ${label} ${key}: "${x[key]}"`);
      seen.add(x[key]);
    }
  };
  dup(agencies, 'id', 'agency');
  dup(agencies, 'slug', 'agency');
  dup(industries, 'id', 'industry');
  dup(industries, 'slug', 'industry');
  dup(sources, 'id', 'source');

  const agencyById = new Map(agencies.map((a) => [a.id, a]));
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const industryIds = new Set(industries.map((i) => i.id));

  for (const s of sources) {
    if (s.agency_id && !agencyById.has(s.agency_id)) errors.push(`Source ${s.id} points to unknown agency "${s.agency_id}"`);
  }

  // --- Placements ---
  let placementCount = 0;
  for (const ind of industries) {
    const positions = ind.placements.map((p) => p.position).sort((a, b) => a - b);
    if (positions.some((pos, i) => pos !== i + 1)) {
      errors.push(`${ind.id}: positions must be 1..${positions.length} with no gaps/duplicates (got ${positions.join(',')})`);
    }
    const declared = ind.placements.map((p) => p.position);
    if (declared.some((p, i) => i > 0 && p < declared[i - 1])) errors.push(`${ind.id}: placements must be stored in position order`);
    const seenAgency = new Set();
    for (const p of ind.placements) {
      placementCount++;
      const where = `${ind.id} #${p.position} (${p.agency_id})`;
      if (seenAgency.has(p.agency_id)) errors.push(`${where}: agency listed twice in the same industry`);
      seenAgency.add(p.agency_id);
      const agency = agencyById.get(p.agency_id);
      if (!agency) errors.push(`${where}: unknown agency_id`);
      if (p.source_ids.length === 0 && p.selection_basis !== 'owner-directed') errors.push(`${where}: no evidence sources and not an owner-directed exception`);
      for (const sid of p.source_ids) {
        const s = sourceById.get(sid);
        if (!s) errors.push(`${where}: unknown source ${sid}`);
        else if (s.agency_id && s.agency_id !== p.agency_id) errors.push(`${where}: source ${sid} belongs to ${s.agency_id}`);
      }
      if (p.evidence_depth === 'service-page' && !p.qualification_label) errors.push(`${where}: service-page evidence must carry a qualification_label`);
      if (p.publication_state === 'published' && agency && agency.publication_state !== 'published') errors.push(`${where}: published placement depends on unpublished agency`);
      if (p.publication_state === 'published' && ind.publication_state !== 'published') warnings.push(`${where}: published placement inside unpublished industry`);
    }
    for (const r of ind.related) if (!industryIds.has(r)) errors.push(`${ind.id}: related industry "${r}" does not exist`);
  }

  // CorLab Tech must keep its service-level label in Logistics (owner rule)
  const corlab = industries.find((i) => i.id === 'logistics')?.placements.find((p) => p.agency_id === 'corlab-tech');
  if (corlab && (!corlab.qualification_label || !/service-level/i.test(corlab.qualification_label))) {
    errors.push('logistics / corlab-tech: must keep a "Service-level evidence" qualification_label (owner rule).');
  }

  // Every agency should appear in at least one industry
  const placed = new Set(industries.flatMap((i) => i.placements.map((p) => p.agency_id)));
  for (const a of agencies) if (!placed.has(a.id)) warnings.push(`Agency ${a.id} has no industry placement - it will not be listed in any niche.`);

  // Expected roster counts (warnings only - the owner may change the roster later)
  if (agencies.length !== 21) warnings.push(`Roster has ${agencies.length} agencies (brief v1.6 expects 21).`);
  if (placementCount !== 52) warnings.push(`There are ${placementCount} placements (brief v1.6 expects 52).`);
  if (sources.length !== 52) warnings.push(`There are ${sources.length} sources (brief v1.6 expects 52).`);

  return { errors, warnings, data: { site, agencies, industries, sources } };
}
