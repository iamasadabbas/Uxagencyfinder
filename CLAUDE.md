# CLAUDE.md: rules for editing the UX Agency Finder website

This is a **frontend-only static website** (Astro + TypeScript). There's **no backend, database, CMS or server API**. All content lives in files in this repo. To change the site, edit the files, validate, build and redeploy.

## Where content lives

| What | File |
| --- | --- |
| Site settings (name, contact email, review date, test-site flags, disclosure text) | `src/data/site.json` |
| Agencies (name, website, summary, limits, aliases, disclosures) | `src/data/agencies.json` |
| Industries and their **ordered placements** (rankings) | `src/data/industries.json` |
| Evidence sources (E01-E56) | `src/data/sources.json` |
| Hiring guides | `src/pages/guides/*.md` |
| Methodology, About, Editorial policy, Privacy, Terms | `src/pages/*.md` |
| Guide list (titles shown on home and guides index) | `guides` array in `src/lib/data.ts` |
| Styles | `src/styles/global.css` |

Pages are generated from the data automatically: the 8 industry pages, 21 agency profiles, directory, homepage previews, sitemap and JSON-LD. **Never hand-edit `dist/`.**

## Hard rules (the build fails if they're broken)

1. **Clay and Eleken must never appear** anywhere in `src/data/`: not as agencies, aliases, sources or text.
2. **CorLab Tech** stays in Logistics with a `qualification_label` containing "Service-level evidence".
3. In each industry, `position` values must be **1..n with no gaps or duplicates**, and placements must be **stored in position order**.
4. Every placement's `agency_id` must exist in `agencies.json`, and every `source_ids` entry must exist in `sources.json` and belong to that agency.
5. A placement with no sources is only allowed when `selection_basis` is `"owner-directed"`.
6. `evidence_depth: "service-page"` requires a `qualification_label`.

## Editorial rules (not enforced by code, but required)

- Positions are **editorial order, not scores**. Never add ratings, stars, review counts or "9.8/10" style numbers.
- **Capability tags don't create industry membership.** Only add an agency to an industry with a named, relevant project source.
- Keep existing qualification labels (wellness, portfolio-level, simulation-only, POC/MVP, institutional website).
- Don't invent budgets, rates, offices, clients, outcomes or compliance claims. Unknown stays unknown.
- HTEC Momentum and Momentum Design Lab are **one agency** (alias). Don't create a duplicate.
- The AI list has one route: `/agencies/ai-ux/` (industry id `ai-and-ml`).

## Common tasks

### Reorder agencies in an industry
In `src/data/industries.json`, find the industry. Move the placement objects into the new order **and** renumber `position` 1..n.

### Add an agency to an industry
1. If the agency is new, add it to `agencies.json` (unique `id`/`slug`, kebab-case).
2. Add its evidence source(s) to `sources.json` with the next free `E##` id and `agency_id` set.
3. Add a placement object to the industry in `industries.json` with `project`, `subfield`, `contribution`, `work_stage`, `fit_and_scope`, `source_ids`, `selection_basis`, `evidence_depth`, `publication_state`. Renumber positions.

### Remove an agency from an industry
Delete the placement and renumber positions. If the agency has no placements left, it disappears from the site automatically. You can also remove it from `agencies.json`.

### Publish vs draft
- `publication_state` can be `draft | researched | reviewed | published | needs-review | archived`.
- `site.json -> showDrafts: true` shows everything except `archived` records. Set it to `false` to show only `published` records. Visitors never see draft status either way.
- `site.json -> noindex: true` keeps search engines out (meta robots and robots.txt) while the site isn't public. Set it to `false` at launch. Visitors can't see this setting.
- `site.json -> testSiteBanner` must stay `null`. The site must never look like a test site.

### Visual design
- Design tokens (colours, radius, shadows) are in `src/styles/global.css`. The font is Inter Variable (self-hosted via `@fontsource-variable/inter`).
- Industry icon and colour: `src/lib/visuals.ts` (`industryTheme`) and `src/components/Icon.astro`. A new industry needs an entry in both, otherwise it falls back to a neutral style.
- Agency avatars are generated monograms. Don't hotlink or invent agency logos.

### Change the contact email
Edit `contactEmail` in `src/data/site.json`.

## After every edit, run

```
npm run validate
npm run build
```

(On Windows PowerShell, use `npm.cmd` if script execution is blocked.) Fix any reported errors before committing. Deploy the `dist/` folder or push to the connected Git host.

