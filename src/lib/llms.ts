// Builds llms.txt (concise index) and llms-full.txt (complete editorial content) from the same data as the site.
// Spec: https://llmstxt.org - an H1, a blockquote summary, then H2 sections of markdown links.
import { site, getIndustries, getAgencies, getAgency, getPlacementsForAgency, getSource, agencyUrl, absolute, guides, formatDate } from './data';

const clean = (s: string) => s.replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim();

export function buildLlmsTxt() {
  const industries = getIndustries();
  const agencies = getAgencies();
  const L: string[] = [];
  L.push(`# ${site.name}`, '');
  L.push(`> ${site.name} (${site.domain}) is a curated guide to the best UX design agencies for each industry. Every agency is listed because of named, publicly documented project work in that industry, with the agency's contribution, work stage and source links. Positions are editorial order, not ratings or paid placements.`, '');
  L.push(`Coverage: ${industries.length} industries, ${agencies.length} agencies, ${industries.reduce((n, i) => n + i.placements.length, 0)} industry placements. Last updated ${formatDate(site.lastReviewed)}. Full content: ${absolute('/llms-full.txt')}`, '');

  L.push('## Industry lists', '');
  for (const i of industries) {
    const top = i.placements.slice(0, 3).map((p) => getAgency(p.agency_id)!.name).join(', ');
    L.push(`- [${i.h1}](${absolute(i.route)}): ${i.placements.length} agencies. Top picks: ${top}. ${clean(i.intro)}`);
  }
  L.push('');

  L.push('## Agency profiles', '');
  for (const a of agencies) {
    const where = getPlacementsForAgency(a.id).map(({ industry, placement }) => `${industry.name} #${placement.position}`).join(', ');
    L.push(`- [${a.name}](${absolute(agencyUrl(a))}): ${where}. ${clean(a.summary)}`);
  }
  L.push('');

  L.push('## Hiring guides', '');
  for (const g of guides) L.push(`- [${g.title}](${absolute(`/guides/${g.slug}/`)}): ${clean(g.description)}`);
  L.push('');

  L.push('## About the selection', '');
  L.push(`- [How we select agencies](${absolute('/methodology/')}): inclusion rules, how positions are set, and where evidence comes from.`);
  L.push(`- [Editorial policy](${absolute('/editorial-policy/')}): independence, no pay-to-rank, disclosures and corrections.`);
  L.push(`- [Agency directory](${absolute('/directory/')}): all agencies A-Z with their industry positions.`);
  L.push('');

  L.push('## Optional', '');
  L.push(`- [About](${absolute('/about/')})`);
  L.push(`- [Contact](${absolute('/contact/')}): corrections and agency suggestions (${site.contactEmail}).`);
  L.push(`- [Privacy](${absolute('/privacy/')})`);
  L.push(`- [Terms](${absolute('/terms/')})`);
  L.push(`- [Sitemap](${absolute('/sitemap.xml')})`);
  return L.join('\n') + '\n';
}

export function buildLlmsFullTxt() {
  const L: string[] = [];
  L.push(`# ${site.name}: full editorial content`, '');
  L.push(`> ${clean(site.disclosure)} Source: ${site.siteUrl}. Updated ${formatDate(site.lastReviewed)}.`, '');
  for (const i of getIndustries()) {
    L.push(`## ${i.h1}`, '');
    L.push(`URL: ${absolute(i.route)}`, '');
    L.push(clean(i.intro), '');
    L.push(`Selection emphasis: ${clean(i.selection_emphasis)}`, '');
    if (i.rationaleNote) L.push(clean(i.rationaleNote), '');
    for (const p of i.placements) {
      const a = getAgency(p.agency_id)!;
      L.push(`### ${p.position}. ${a.name}`, '');
      L.push(`- Profile: ${absolute(agencyUrl(a))}`);
      L.push(`- Website: ${a.official_website}`);
      L.push(`- Subfield: ${clean(p.subfield)}`);
      L.push(`- Named project: ${clean(p.project)}`);
      L.push(`- Agency contribution: ${clean(p.contribution)}`);
      L.push(`- Work stage: ${clean(p.work_stage)}`);
      if (p.qualification_label) L.push(`- Note: ${clean(p.qualification_label)}`);
      L.push(`- Why it is listed: ${clean(p.fit_and_scope)}`);
      for (const sid of p.source_ids) {
        const s = getSource(sid);
        if (s) L.push(`- Source: [${clean(s.label)}](${s.url}) (${clean(s.qualification)})`);
      }
      L.push('');
    }
    L.push('How to choose:', '');
    for (const c of i.checklist) L.push(`- ${clean(c)}`);
    L.push('');
  }
  L.push('## Agency summaries', '');
  for (const a of getAgencies()) {
    L.push(`### ${a.name}`, '');
    L.push(clean(a.summary), '');
    L.push(`Before you hire: ${clean(a.limits_and_questions)}`, '');
  }
  return L.join('\n') + '\n';
}

