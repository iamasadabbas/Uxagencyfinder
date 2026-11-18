// One-time import: converts the client's handoff package (UXAgencyFinder-Developer-Handoff/03-data)
// into the site's canonical data files in src/data/. After the first import, src/data/*.json is the
// source of truth - edit those files directly (or ask Claude to). Re-running this script OVERWRITES them.
//
// Usage: node scripts/import-handoff.mjs [--force]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const handoff = resolve(root, 'UXAgencyFinder-Developer-Handoff/03-data');
const out = resolve(root, 'src/data');
mkdirSync(out, { recursive: true });

if (existsSync(resolve(out, 'agencies.json')) && !process.argv.includes('--force')) {
  console.error('src/data/agencies.json already exists. Re-run with --force to overwrite edited data.');
  process.exit(1);
}

const EXCLUDED = ['clay', 'eleken'];

// ---------- CSV parser (quoted fields, BOM) ----------
function parseCsv(text) {
  text = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

const agenciesIn = JSON.parse(readFileSync(resolve(handoff, 'agencies.json'), 'utf8')).records;
const rankingsIn = JSON.parse(readFileSync(resolve(handoff, 'industry-rankings.json'), 'utf8'));
const sourcesIn = parseCsv(readFileSync(resolve(handoff, 'source-register.csv'), 'utf8'));

// ---------- helpers ----------
function section(md, label) {
  const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*|$)`);
  const m = md.match(re);
  return m ? m[1].trim() : '';
}
const stripRefs = (s) => s.replace(/;?\s*E\d{2}(\/E\d{2})*\s*$/, '').replace(/;\s*$/, '').trim();

// ---------- Industry editorial metadata (brief sections 4, 6, 7, 11) ----------
const industryMeta = {
  healthcare: {
    name: 'Healthcare', slug: 'healthcare-ux', label: 'Healthcare / HealthTech',
    title: 'Best Healthcare UX Design Agencies',
    h1: 'Best healthcare UX design agencies',
    metaDescription: 'Compare UX design agencies with documented healthcare work: EHR, clinical tools, patient apps, health administration and public-health reporting.',
    intro: 'These agencies have public, named healthcare projects: clinical and administrative software, patient and clinician apps, health-data dashboards and medical-coding tools. One wellness entry is labelled separately because wellness work is not clinical evidence.',
    contexts: ['Telemedicine', 'EHR & patient records', 'Patient portals', 'Clinical tools', 'Care operations', 'Health administration'],
    checklist: [
      'Separate clinical (treatment, charting, EHR) work from administrative, insurance and wellness work.',
      'Ask which users the agency actually researched: clinicians, patients, families, coders or administrators.',
      'Confirm the agency\'s contribution versus the client\'s in-house product and engineering teams.',
      'Ask how integration, data and regulatory constraints were handled. Agency case studies are not compliance certification.',
      'Request a comparable project at a similar stage: concept, prototype, rollout or live product.',
    ],
    rationaleNote: 'Fuselab Creative leads because this list weighs complex, data-rich healthcare platforms most heavily. For a narrower home-health EHR brief, GoInvo may be the stronger first call, and Guidea\'s specialist portfolio may suit a medical-device brief better. Lazarev.agency appears last for wellness only. WellSet is not clinical validation.',
    related: ['ai-and-ml', 'education'],
  },
  fintech: {
    name: 'Fintech', slug: 'fintech-ux', label: 'Fintech / Financial Services',
    title: 'Best Fintech UX Design Agencies',
    h1: 'Best fintech UX design agencies',
    metaDescription: 'Compare UX design agencies with documented fintech work across banking, payments, crypto trading and AI-assisted financial research.',
    intro: 'These agencies have named financial-product work. Retail banking, payments, crypto trading, internal bank AI and financial-research tools are different jobs, so each entry states which one it covers.',
    contexts: ['Banking', 'Payments', 'Investing & trading', 'Lending', 'Insurance technology', 'Financial research'],
    checklist: [
      'Match the financial task: retail banking, payments, trading, lending, or internal and analyst tools.',
      'Ask how trust, permissions, error recovery and onboarding were designed and tested.',
      'Confirm whether the agency worked on the live product or on a vision or prototype phase.',
      'Treat compliance and performance claims in case studies as agency-reported unless independently verified.',
      'Ask who from the proposed team worked on the referenced financial project.',
    ],
    related: ['ai-and-ml', 'ecommerce'],
  },
  ecommerce: {
    name: 'Ecommerce', slug: 'ecommerce-ux', label: 'Ecommerce / Retail',
    title: 'Best Ecommerce UX Design Agencies',
    h1: 'Best ecommerce UX design agencies',
    metaDescription: 'Compare UX design agencies with documented ecommerce work: product discovery, catalog, checkout, mobile commerce and B2B industrial purchasing.',
    intro: 'These agencies have documented shopping or procurement journeys, covering product discovery, catalog and product pages, checkout and supplier workflows. Consumer retail and industrial B2B commerce are labelled separately.',
    contexts: ['Online stores', 'Marketplaces', 'Product discovery', 'Checkout', 'Customer accounts', 'Merchant operations'],
    checklist: [
      'Decide whether you need consumer retail or B2B and industrial purchasing experience.',
      'Ask for the catalog, search, product-detail and checkout decisions the agency was responsible for.',
      'Check whether the work is current or historical, and who maintains the product today.',
      'Confirm how the agency measured or tested changes. Treat reported uplifts as agency claims.',
      'Clarify design-system and implementation scope across app, web and in-store channels.',
    ],
    related: ['fintech', 'logistics'],
  },
  logistics: {
    name: 'Logistics', slug: 'logistics-ux', label: 'Logistics / Supply Chain',
    title: 'Best Logistics UX Design Agencies',
    h1: 'Best logistics UX design agencies',
    metaDescription: 'Compare UX design agencies with logistics and supply-chain work: transportation management, shipper insights, warehouse fleets, distribution and driver tools.',
    intro: 'These agencies have worked on transport, distribution, warehouse or fleet products. Each entry names its scope (shipper, distribution, warehouse or driver) because one does not prove the others.',
    contexts: ['Fleet management', 'Freight', 'Dispatch', 'Warehouse systems', 'Delivery exceptions', 'Distribution'],
    checklist: [
      'Identify the operational users: shippers, dispatchers, warehouse staff, field sales or drivers.',
      'Ask how the agency designed for exceptions, alerts and time-critical decisions.',
      'Check whether research happened in the field (depots, warehouses, vehicles) or only remotely.',
      'Confirm a comparable named logistics engagement and the agency\'s actual design contribution.',
      'Clarify integration with TMS, WMS or telematics systems and who builds it.',
    ],
    rationaleNote: 'CorLab Tech is at position 5 at the owner\'s direction. Its evidence comes from service pages, not a named logistics client case. Confirm a comparable project and the actual UX contribution before relying on it.',
    related: ['robotics', 'ai-and-ml'],
  },
  'real-estate': {
    name: 'Real Estate', slug: 'real-estate-ux', label: 'Real Estate / PropTech',
    title: 'Best Real Estate UX Design Agencies',
    h1: 'Best real estate UX design agencies',
    metaDescription: 'Compare UX design agencies with documented real estate and PropTech work: property marketplaces, broker apps, co-ownership and home buying.',
    intro: 'These agencies have documented property-marketplace, broker, home-buying or co-ownership work. Full product work is labelled separately from acquisition websites and short portfolio entries.',
    contexts: ['Property search', 'Leasing', 'Transactions', 'Tenant services', 'Property management', 'Broker tools'],
    checklist: [
      'Decide which journey matters: search, broker workflow, buying, ownership, leasing or management.',
      'Separate product work from marketing websites and acquisition funnels.',
      'Ask how listing data, maps and booking or transaction steps were designed and tested.',
      'For portfolio-level entries, request a fuller case study before relying on the claim.',
      'Confirm the proposed team and the agency\'s role alongside the client\'s engineers.',
    ],
    rationaleNote: 'CoHome gives this list a fourth source-backed agency. Work & Co stays as a portfolio-level entry: its Lennar evidence is much thinner than its IKEA case.',
    related: ['ecommerce', 'fintech'],
  },
  education: {
    name: 'Education', slug: 'education-ux', label: 'Education / EdTech',
    title: 'Best Education UX Design Agencies',
    h1: 'Best education UX design agencies',
    metaDescription: 'Compare UX design agencies with documented education work: K-12 assessment, learning platforms, academic tools, educational robotics and university websites.',
    intro: 'These agencies have named education work. Learning platforms, assessment tools, academic tools, educational hardware and institutional websites are different jobs, and each entry says which one it covers.',
    contexts: ['Learning platforms', 'Assessment', 'Course delivery', 'Student & teacher tools', 'Education administration'],
    checklist: [
      'Identify the users: students, parents, teachers, academics or administrators.',
      'Separate learning-platform work from institutional websites and marketing sites.',
      'Ask how the agency researched with learners, including children where relevant.',
      'Check accessibility practice for learners with different needs and devices.',
      'Confirm whether the work was a vision or prototype or a shipped product change.',
    ],
    related: ['robotics', 'healthcare'],
  },
  robotics: {
    name: 'Robotics', slug: 'robotics-ux', label: 'Robotics',
    title: 'Best Robotics UX Design Agencies',
    h1: 'Best robotics UX design agencies',
    metaDescription: 'Compare UX design agencies with documented robotics work: industrial and warehouse robot fleets, consumer robot apps, educational robotics and simulation tools.',
    intro: 'These agencies have designed interfaces for real robots or robotics tools. Industrial, consumer, educational and simulation work are listed separately because none of them proves the others.',
    contexts: ['Robot fleet management', 'AGV / AMR control', 'Industrial robot interfaces', 'Simulation & testing', 'Educational robotics'],
    checklist: [
      'Match the context: industrial or warehouse fleets, consumer devices, education, or developer simulation.',
      'Ask how robot state, missions, alerts and manual overrides were designed.',
      'Clarify the boundary between interface design and hardware or safety engineering.',
      'Check whether research involved real operators or users with physical robots.',
      'A robotics UX case is not a safety audit or industrial-controls certification.',
    ],
    rationaleNote: 'This list is not an industrial-controls certification or a safety audit. Consumer and educational robotics work does not carry over as proof of industrial-robotics experience.',
    related: ['logistics', 'ai-and-ml', 'education'],
  },
  'ai-and-ml': {
    name: 'AI & ML', slug: 'ai-ux', label: 'AI & ML',
    title: 'Best UX Design Agencies for AI Products',
    h1: 'Best UX design agencies for AI products',
    metaDescription: 'Compare UX design agencies with documented AI product work: assistants, generative tools, conversational data, AI research tools and model monitoring.',
    intro: 'These agencies have designed products where AI is central: assistants, generative tools, conversational data workspaces, AI research tools and model monitoring. A website for an AI company does not count.',
    contexts: ['AI assistants', 'Generative tools', 'Model monitoring', 'AI developer platforms', 'Agent workflows', 'Conversational data'],
    checklist: [
      'Confirm AI was central to the product, not just a marketing site for an AI company.',
      'Ask how the agency handled uncertainty, errors, citations and generated-output review.',
      'Check how user feedback loops and trust signals were designed and tested.',
      'Distinguish shipped work from prototypes, POCs and vision work.',
      'Clarify the agency\'s contribution versus the client\'s model and engineering teams.',
    ],
    related: ['fintech', 'healthcare', 'robotics'],
  },
};

// [subfield, contribution, workStage, qualificationLabel?]
const P = {
  'healthcare:fuselab-creative': ['Provider dashboards & public-health reporting', 'Patient/provider research, dashboard UI/UX and an API contribution (ClyHealth); research, design and data-visualization development for LTSS reporting (DHCS).', 'Agency-reported'],
  'healthcare:goinvo': ['Home-health EHR', 'Clinical and administrative workflow design for a home-health EHR.', 'Source-reported working product'],
  'healthcare:guidea': ['Digital & population health', 'Platform design across named digital-health clients (Amalgam Rx, Humana, Express Scripts).', 'Portfolio-level'],
  'healthcare:think-company': ['Pediatric care & telemedicine', 'Interviews, a telemedicine pilot and later product evolution with the care organization.', 'Agency-reported'],
  'healthcare:ustwo': ['Kidney care apps', 'Clinician and patient app design informed by user research.', 'Source-reported working product'],
  'healthcare:cieden': ['Clinical practice management / EMR', 'Modernization of patient records, billing and charting, with design-system direction.', 'Validated direction, continued rollout'],
  'healthcare:qubstudio': ['Clinic & patient SaaS', 'Clinic/patient roles, appointments, telemedicine and records interfaces.', 'Prototype / deliverable scope'],
  'healthcare:fuzzy-math': ['Enterprise healthcare R&D', 'Research, data visualization and reusable interaction patterns across clinical, imaging and admin products.', 'R&D / exploration'],
  'healthcare:neuron': ['Medical coding & risk adjustment', 'Workflow research with subject-matter experts, interface modernization and a React frontend.', 'Agency-reported'],
  'healthcare:netguru': ['Software for medical professionals', 'Healthcare product design and development.', 'Agency-reported'],
  'healthcare:lazarev-agency': ['Wellness (not clinical)', 'Wellness content discovery, live-session scheduling and personalization.', 'Agency-reported', 'Wellness only - not clinical/EHR evidence'],

  'fintech:uxda': ['Retail banking', 'Redesign of customer banking tasks and mobile financial flows.', 'Agency-reported'],
  'fintech:qubstudio': ['Banking', 'Banking UX/UI work for Gulf Bank and ila Bank.', 'Portfolio-level'],
  'fintech:ustwo': ['Payments', 'Multi-market payment research, tested flows and prototypes.', 'Vision / prototype'],
  'fintech:htec-momentum': ['Crypto trading', 'Product strategy and new trading-app user experience.', 'Agency-reported'],
  'fintech:lazarev-agency': ['AI financial research', 'Financial-research AI workspace combining prompts, widgets and reports.', 'Agency-reported'],
  'fintech:fantasy': ['Internal bank AI', 'Enterprise AI vision, interface and coded design-system contribution.', 'Agency-reported'],
  'fintech:arounda': ['Banking & microloans', 'UX, wireframes and UI for banking, microloan and insurance flows, including onboarding.', 'Agency-reported'],

  'ecommerce:work-and-co': ['Omnichannel retail', 'Shopping app, website ecosystem, cross-channel experience and reusable design system.', 'Agency-reported'],
  'ecommerce:ustwo': ['Mobile commerce', 'Mobile-commerce discovery, research and delivery.', 'Historical engagement'],
  'ecommerce:qubstudio': ['Industrial B2B commerce', 'Research, architecture, negotiation and transaction design for chemical commerce.', 'Agency-reported'],
  'ecommerce:agente': ['Fashion ecommerce', 'Information architecture, catalog/product pages and checkout redesign.', 'Historical engagement'],
  'ecommerce:lazarev-agency': ['Chemical B2B marketplace', 'Sourcing, product selection, purchasing and supplier workflows.', 'Agency-reported'],

  'logistics:qubstudio': ['Transportation management', 'Information architecture and UX for a transportation-management product.', 'Portfolio-level'],
  'logistics:htec-momentum': ['Supply-chain intelligence', 'Platform redesign and accessible ML recommendations for shippers.', 'Agency-reported'],
  'logistics:fuselab-creative': ['Warehouse robot fleets', 'Fleet, mission, monitoring, alert and manual-control interfaces for warehouse AGVs.', 'Agency-reported'],
  'logistics:aufait-ux': ['Food distribution', 'Field research and distribution, loadout, route and reconciliation workflow design.', 'Agency-reported'],
  'logistics:corlab-tech': ['Logistics software services', 'Unconfirmed. The service pages describe dashboard, map and logistics-software services, not a named project contribution.', 'Unknown', 'Service-level evidence - no named logistics client case'],
  'logistics:ustwo': ['Fleet-driver self-service', 'Fleet-driver app research, redesign, delivery and service lifecycle.', 'Agency-reported'],

  'real-estate:netguru': ['Property marketplace', 'Embedded research, UI design and testing for a property marketplace.', 'Agency-reported'],
  'real-estate:aufait-ux': ['Broker property app', 'Agent-facing property search, scanning, details and booking.', 'Agency-reported'],
  'real-estate:lazarev-agency': ['Co-ownership acquisition', 'Property exploration, co-ownership calculator and website/funnel UX.', 'Agency-reported'],
  'real-estate:work-and-co': ['Home buying', 'Home-buying experience contribution (portfolio entry only).', 'Portfolio-level', 'Portfolio-level evidence - limited public detail'],

  'education:qubstudio': ['K-12 assessment', 'Student assessment, parent/student portal and staff portal redesign.', 'Agency-reported'],
  'education:ustwo': ['Online learning', 'Learning-engagement vision, prototypes, research and interaction work.', 'Tested vision / concept'],
  'education:agente': ['Learning platform', 'UX/UI redesign of an automation learning platform.', 'Portfolio-level'],
  'education:netguru': ['Academic app creation', 'App-creation UX/UI for academics.', 'Agency-reported'],
  'education:ux-studio': ['Educational robotics', 'Research and configuration, coding and control UX for an educational robotics app.', 'Agency-reported'],
  'education:aufait-ux': ['University website', 'Information architecture and reusable templates for a large university website.', 'Agency-reported', 'Institutional website - not an LMS'],

  'robotics:fuselab-creative': ['Industrial & warehouse robots', 'Warehouse fleet/mission controls (Robodog) and industrial robot operations and simulation interfaces (Hyperfab).', 'Agency-reported'],
  'robotics:ustwo': ['Consumer robot vacuum', 'Robot-vacuum app features, map editing, pairing and control UX.', 'Agency-reported'],
  'robotics:ux-studio': ['Educational robotics', 'Robot configuration, coding and control with child-user research.', 'Agency-reported'],
  'robotics:metalab': ['Robotics simulation & testing', 'Robotics virtual-testing infrastructure (portfolio entry).', 'Portfolio-level', 'Portfolio-level - simulation/testing only, no physical control claim'],

  'ai-and-ml:fuselab-creative': ['Conversational enterprise data', 'Conversational enterprise-data workspace UI/UX with source verification.', 'Agency-reported'],
  'ai-and-ml:metalab': ['Generative AI products', 'Product design and implementation for selected AI products (Midjourney, Suno).', 'Portfolio-level'],
  'ai-and-ml:ustwo': ['AI assistant', 'Pi interface, continuous research, mobile launch and ongoing product work.', 'Agency-reported'],
  'ai-and-ml:goinvo': ['AI research tools', 'Guided generative-AI research workflows with citations.', 'Mixed: shipped + prototypes'],
  'ai-and-ml:lazarev-agency': ['AI financial research', 'Prompt, widget and report workflows for financial analysts.', 'Agency-reported'],
  'ai-and-ml:fantasy': ['Enterprise banking AI', 'Enterprise AI vision, interface and coded design-system contribution.', 'Agency-reported'],
  'ai-and-ml:htec-momentum': ['ML recommendations', 'Discovery of and action on AI/ML recommendations in a logistics product.', 'Agency-reported'],
  'ai-and-ml:qubstudio': ['Conversational recruitment', 'Conversational recruitment SaaS, research and design system.', 'Historical engagement'],
  'ai-and-ml:ux-studio': ['Model monitoring', 'AI-model monitoring product research and interface concepts.', 'POC / MVP', 'POC/MVP stage'],
};

// ---------- Build ----------
const agencySourceMap = {};
for (const a of agenciesIn) for (const s of a.source_ids) agencySourceMap[s] = a.id;

const sources = sourcesIn.map((s) => ({
  id: s.id,
  agency_id: agencySourceMap[s.id] ?? null,
  label: s.label,
  url: s.url,
  supported_context: s.supported_context,
  qualification: s.qualification,
  accessed_date: s.accessed_date,
  publisher_type: s.publisher_type,
}));

// Attach orphan sources (not referenced by any agency record) by label prefix, so profiles can show them.
const prefixMap = { Cieden: 'cieden', Guidea: 'guidea', 'Think Company': 'think-company', 'UX Studio': 'ux-studio' };
for (const s of sources) {
  if (!s.agency_id) {
    const prefix = s.label.split(':')[0].trim();
    s.agency_id = prefixMap[prefix] ?? null;
    s.supplementary = true; // not used as evidence for any placement
  }
}

const agencies = agenciesIn
  .filter((a) => !EXCLUDED.includes(a.id) && !EXCLUDED.includes(a.name.toLowerCase()))
  .map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    aliases: a.aliases,
    official_website: a.official_website,
    summary: section(a.assessment_markdown, 'Why include'),
    limits_and_questions: section(a.assessment_markdown, 'Limits and questions'),
    project_evidence: section(a.assessment_markdown, 'Project evidence').replace(/\.$/, ''),
    capability_tags: [],
    commercial_facts: { status: 'not-researched', note: 'Budgets, rates, offices and availability have not been researched.' },
    disclosures: [],
    publication_state: a.publication_state,
  }));

const industries = rankingsIn.industries.map((ind) => {
  const meta = industryMeta[ind.id];
  if (!meta) throw new Error(`No metadata for industry ${ind.id}`);
  return {
    id: ind.id,
    ...meta,
    route: `/agencies/${meta.slug}/`,
    selection_emphasis: ind.selection_emphasis,
    publication_state: ind.publication_state,
    placements: ind.placements
      .filter((p) => !EXCLUDED.includes(p.agency_id))
      .sort((x, y) => x.position - y.position)
      .map((p) => {
        const key = `${ind.id}:${p.agency_id}`;
        const extra = P[key];
        if (!extra) throw new Error(`No placement detail for ${key}`);
        const [subfield, contribution, work_stage, qualification_label] = extra;
        return {
          agency_id: p.agency_id,
          position: p.position,
          project: stripRefs(p.evidence_summary),
          subfield,
          contribution,
          work_stage,
          fit_and_scope: p.fit_and_scope,
          source_ids: p.source_ids,
          selection_basis: p.selection_basis,
          evidence_depth: p.evidence_depth,
          ...(qualification_label ? { qualification_label } : {}),
          publication_state: p.publication_state,
        };
      }),
  };
});

const write = (name, data) => writeFileSync(resolve(out, name), JSON.stringify(data, null, 2) + '\n', 'utf8');
write('agencies.json', agencies);
write('industries.json', industries);
write('sources.json', sources);
console.log(`Imported ${agencies.length} agencies, ${industries.length} industries, ${industries.reduce((n, i) => n + i.placements.length, 0)} placements, ${sources.length} sources.`);

