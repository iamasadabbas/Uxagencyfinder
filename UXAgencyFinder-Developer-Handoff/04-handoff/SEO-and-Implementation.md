# UX Agency Finder: SEO and implementation requirements

Extracted from sections 14-16 of master brief version 1.6. Reference IDs resolve in section 21 of the master brief. These requirements have not been executed against a built website.

## 14. Data model and editorial workflow

Recommended stack: Astro + TypeScript, pre-rendered content, structured collections, and small client scripts for directory filtering. Use current supported versions during implementation and deliver the lockfile. [R12]

| Collection | Key fields |
| --- | --- |
| Agencies | Stable ID/slug, identity, official site, original profile, publication state, author/review record, public disclosures. |
| Industries | Stable ID, display name, scope/subfields, title/H1, intro, criteria, buying checklist, metadata, ordered published placements. |
| Placements | Industry ID, agency ID, editorial position, relevant evidence IDs, selection basis (editorial/owner-directed), evidence depth, original fit explanation, limits/questions, editorial state. |
| Sources | URL, publisher, source type, accessed date, supported scope, limitations, link status. |
| Evidence | Named product/item or explicit service-page label, evidence type/depth, agency, actual industry/subfield, users/problem, documented contribution or unknown, work stage or unknown, source IDs, attributed results. |
| Capability tags | Sourced research, dashboard, AI, mobile, SaaS, design-system, or other experience; kept separate from industry membership. |
| Commercial/location facts | Exact type/value, unit/currency/basis, scope, source, check date, unknown/review status. |
| Guides and policies | Original content, worksheet where relevant, metadata, real author/review information, factual operating details. |

Industry membership and capability tags are separate relations. Do not infer one from the other. The profile can show capabilities across its projects while each industry/technology-market placement points only to appropriate evidence. AI & ML is a primary niche when AI is central to the documented product; an AI capability tag alone does not establish that membership.

Workflow: draft -> researched -> editorially reviewed -> published -> needs review/archived. Human editorial approval and source-access dates are separate. Build validation checks referential integrity, publication state, industry support, and sequence consistency.

Provide a maintained Git-backed editor or headless CMS with relationships, draft/preview/publish, export/backup, and documented recurring costs. No custom agency-account administration is required.

Use one published snapshot for visible lists, profiles, directory data, and structured data. Client data is an explicit allowlisted public projection. Drafts, private deliberations, contact details, and submissions must not enter public bundles, JSON, or source maps.


## 15. Implementation, accessibility, and performance

Pre-render the complete page text, agency links, and source links. Lists must be useful before JavaScript interaction. No live scraping at page load and no generated agency assessments from user prompts.

Static hosting is sufficient for editorial pages. A contact/correction form needs a secure form service or server-side handler. Validate input, limit abuse, store submissions privately, and show truthful success/failure states. Configure the actual destination and retention policy.

Use real locally hosted logo/image assets only with a recorded reuse basis. Text-only cards must look complete. Do not hotlink case-study images, invent logos, or depend on remote logo providers.

Target WCAG 2.2 AA for implementation, with keyboard, focus, contrast, screen-reader, table, and form checks. This is a delivery target rather than an audited certification claim. Use semantic headings, table captions/headers, visible labels, accessible dropdowns, and a polite results count for directory filters. [R13]

Project performance targets: editorial first-party JavaScript around or below 75 KB compressed where practical, optimized images, reserved asset dimensions, and restrained third-party scripts. This is a project budget, not a Google ranking threshold.

Aim for good field Core Web Vitals: LCP <= 2.5 seconds, INP <= 200 ms, CLS <= 0.1 at the 75th percentile. Use mobile lab diagnostics before enough field data exists and report that limitation honestly. [R14]


## 16. Technical SEO and search/AI visibility

### Keyword ownership

| Page | Intent |
| --- | --- |
| Homepage | Best UX design agencies by industry; UX agency finder. |
| Industry hub | UX agencies by industry and discovery across published sectors. |
| Each industry list | Its specific best-agency query family and buying context. |
| Directory | Browse the complete published agency set. |
| Agency profile | The agency's work, documented industry fit, facts, and evaluation. |
| Each guide | A practical hiring decision. |

Validate demand during SEO operations. Do not assert volumes or difficulty without data. Avoid competing duplicate landing pages, empty industry archives, automatically generated subniche combinations, and year URLs.

### Crawling and canonicals

Proposed canonical host: `https://uxagencyfinder.com/`. Configure HTTPS/www redirects when ownership and hosting are ready. Use consistent trailing slashes, unique titles/descriptions, self-canonicals, and crawlable links.

The sitemap uses the actual published route manifest. The completed eight-niche architecture contains 22 + P + A HTML pages; staged releases contain fewer. Do not use 15 as the public profile count or claim all eight lists until publication.

Filter fragments do not create separate server routes. Tracking parameters return the clean page with its clean canonical. Missing paths return actual 404 statuses. Protect staging with access controls and noindex. [R7]

### Structured data

| Page | Representation |
| --- | --- |
| Site | Truthful publisher Organization and WebSite. |
| Industry hub/directory | CollectionPage and ItemList matching visible published content/order. |
| Industry list | CollectionPage and ItemList in the visible editorial sequence. |
| Agency profile | WebPage with the actual agency Organization as mainEntity, separate from the publisher. |
| Guide | Article with real author and dates. |
| Inner pages | BreadcrumbList matching visible navigation. |

Positions describe editorial display order, not measured scores. Do not invent Review/AggregateRating data or import external stars as a site-owned rating. No rich result is promised. [R11]

Indexable, useful, source-supported content is the basis for search and AI visibility. Google's guidance does not require a special AI schema or llms.txt for search/AI eligibility. Keep key facts and reasoning in visible text. [R9]

Original assessments and domain-specific buying guidance should distinguish the industry pages. Do not manufacture research, clients, team identities, or hands-on experience. [R6]

