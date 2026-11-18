// Single data access layer. Every page, list, profile, sitemap entry and JSON-LD block reads from here,
// so visible content and structured data always come from the same snapshot.
import siteRaw from '../data/site.json';
import agenciesRaw from '../data/agencies.json';
import industriesRaw from '../data/industries.json';
import sourcesRaw from '../data/sources.json';
import { validateData } from './schema.mjs';
import type { z } from 'zod';
import type { SiteSchema, AgencySchema, IndustrySchema, PlacementSchema, SourceSchema } from './schema.mjs';

export type Site = z.infer<typeof SiteSchema>;
export type Agency = z.infer<typeof AgencySchema>;
export type Industry = z.infer<typeof IndustrySchema>;
export type Placement = z.infer<typeof PlacementSchema>;
export type Source = z.infer<typeof SourceSchema>;

const result = validateData({ site: siteRaw, agencies: agenciesRaw, industries: industriesRaw, sources: sourcesRaw });
if (result.errors.length) {
  throw new Error('Invalid site data:\n' + result.errors.map((e) => ' - ' + e).join('\n'));
}

export const site = result.data.site as Site;
const allAgencies = result.data.agencies as Agency[];
const allIndustries = result.data.industries as Industry[];
const allSources = result.data.sources as Source[];

/** A record is visible when it is published, or when the test-site flag showDrafts is on (archived never shows). */
const visible = (state: string) => state === 'published' || (site.showDrafts && state !== 'archived');

export function getIndustries(): Industry[] {
  return allIndustries
    .filter((i) => visible(i.publication_state))
    .map((i) => ({
      ...i,
      placements: i.placements.filter((p) => visible(p.publication_state) && isAgencyVisible(p.agency_id)),
    }))
    .filter((i) => i.placements.length > 0);
}

function isAgencyVisible(id: string) {
  const a = allAgencies.find((x) => x.id === id);
  return !!a && visible(a.publication_state);
}

export function getIndustry(id: string) {
  return getIndustries().find((i) => i.id === id);
}

export function getAgencies(): Agency[] {
  const placed = new Set(getIndustries().flatMap((i) => i.placements.map((p) => p.agency_id)));
  return allAgencies
    .filter((a) => visible(a.publication_state) && placed.has(a.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

export function getAgency(id: string) {
  return getAgencies().find((a) => a.id === id);
}

export function getSource(id: string) {
  return allSources.find((s) => s.id === id);
}

export function getSourcesForAgency(agencyId: string) {
  return allSources.filter((s) => s.agency_id === agencyId);
}

/** Industry placements for an agency, in industry navigation order. */
export function getPlacementsForAgency(agencyId: string) {
  return getIndustries().flatMap((ind) =>
    ind.placements.filter((p) => p.agency_id === agencyId).map((p) => ({ industry: ind, placement: p })),
  );
}

export const agencyUrl = (a: Pick<Agency, 'slug'>) => `/agency/${a.slug}/`;
export const absolute = (path: string) => new URL(path, site.siteUrl).toString();

export function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export const guides = [
  { slug: 'ux-agency-brief-template', title: 'UX agency brief template', description: 'A copyable worksheet for writing a project brief that agencies can quote against properly.', featured: true },
  { slug: 'compare-ux-design-proposals', title: 'How to compare UX design proposals', description: 'A side-by-side worksheet for comparing scope, team, assumptions and pricing basis.', featured: true },
  { slug: 'ux-agency-portfolio-checklist', title: 'UX agency portfolio checklist', description: 'What to check in a case study before you treat it as industry evidence.', featured: false },
  { slug: 'ux-agency-pricing-models', title: 'UX agency pricing models explained', description: 'Fixed price, time and materials, retained teams, subscriptions and discovery-only work.', featured: false },
];
