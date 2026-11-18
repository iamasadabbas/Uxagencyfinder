# UX Agency Finder: developer handoff

Website: uxagencyfinder.com  
Prepared: 18 November 2026  
Master brief: version 1.6, source file revision 6  
Scope: 8 niches, 21 agencies, 52 industry placements, 52 agency source records.

Start with **01-brief/UXAgencyFinder-Developer-Brief.md**. It is the complete specification for the website, including positioning, page templates, functionality, editorial rules, technical SEO, analytics, accessibility, performance and handoff requirements.

## Package contents

| Path | Purpose |
| --- | --- |
| `01-brief/UXAgencyFinder-Developer-Brief.md` | Unchanged latest master brief. |
| `02-research/UXAgencyFinder-Agency-Research.md` | Agency assessments, exact industry orders, position matrix and portfolio/source register extracted from sections 10-12. |
| `03-data/agencies.json` | 21 agency records, official sites, aliases, niche memberships, source IDs and full assessment notes. |
| `03-data/industry-rankings.json` | Eight industries and their 52 ordered placements, with evidence references and scope qualifications. |
| `03-data/industry-rankings.csv` | One row per industry placement for import/review. |
| `03-data/agency-position-matrix.csv` | Agencies compared across all eight niche positions. |
| `03-data/source-register.csv` | All 52 agency evidence sources with URLs and limitations. |
| `03-data/routes.csv` | Planned fixed pages and route templates. |
| `04-handoff/Developer-Checklist.md` | Acceptance criteria and delivery requirements. |
| `04-handoff/SEO-and-Implementation.md` | Technical stack, data model, SEO, accessibility and performance requirements extracted from sections 14-16. |
| `04-handoff/Owner-Inputs-and-Publication.md` | Practical owner inputs and content tasks before publication. |
| `04-handoff/Data-Notes.md` | Import conventions and instructions for preserving evidence and order. |
| `package-manifest.json` | File checksums and package consistency results. |

## Essential implementation decisions

- Build the industry discovery flow first: niche -> ordered agency selection -> relevant project/source -> agency profile.
- Use the eight categories and exact placement orders from section 11. The directory remains alphabetical.
- Keep Clay and Eleken excluded from the entire dataset, public profiles, recommendations, related suggestions and imports.
- Store positions per industry. These positions are editorial order, not review ratings.
- CorLab Tech is Logistics #5 with the source qualification preserved.
- Use the single AI route `/agencies/ai-ux/`. Preserve the canonical route plan in the brief.
- HTEC Momentum and Momentum Design Lab are one agency identity.
- Use one published snapshot for visible lists, profiles and structured data.
- Keep publication workflow, source access dates and actual editorial review dates separate.

## Scope and sequence

Read the brief, estimate design/build/content work separately, establish the content schema and route plan, build reusable templates, populate reviewed content, then complete staging QA and launch preparation.

The planned fixed set has 22 pages. With 21 agency profiles and one real author page, the full plan has 44 indexable HTML pages. The actual release count depends on completed published records.

The archive is a specification and structured research handoff. It does not contain an implemented application, production accounts, credentials, or licensed brand assets. Related-project links retained in the master brief are context, not extra build dependencies.

If a convenience extract or data export appears inconsistent with the master brief, resolve it against the master brief before implementation. All exports in this archive were checked against its industry orders and counts.
