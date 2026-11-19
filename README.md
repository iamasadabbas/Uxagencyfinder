# UX Agency Finder (uxagencyfinder.com)

A curated, **frontend-only** static website listing the best UX design agencies by industry: Healthcare, Fintech, Ecommerce, Logistics, Real Estate, Education, Robotics, and AI & ML. It has 21 agencies and 52 editorial placements.

- **Stack:** Astro (static output) + TypeScript + plain CSS. No backend, database, CMS or server functions.
- **Data:** JSON files in `src/data/`, validated with Zod before every build.
- **Spec:** `UXAgencyFinder-Developer-Handoff/01-brief/UXAgencyFinder-Developer-Brief.md` (client brief v1.6).

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Local dev server at http://localhost:4321 |
| `npm run validate` | Check the data rules (exclusions, positions, references, CorLab label) |
| `npm run build` | Validate, then build the static site into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run import:handoff -- --force` | Re-import from the handoff package (**overwrites** `src/data/` edits) |

> On Windows PowerShell with script execution disabled, use `npm.cmd` instead of `npm`.

## Editing content

See **[CLAUDE.md](./CLAUDE.md)**. It's the guide for both people and Claude: where everything lives, the hard rules and common tasks (reorder, add or remove agencies, publish).

## Project structure

```
src/
  data/            site.json, agencies.json, industries.json, sources.json  <- content
  lib/schema.mjs   Zod schemas + integrity rules (shared by build + validate script)
  lib/data.ts      the only data access layer used by pages
  components/      Header, Footer, ComparisonTable, AgencyAssessment, IndustryCard, FAQ, ...
  layouts/         BaseLayout (meta/SEO), ProseLayout (Markdown pages)
  pages/           routes (industry lists, profiles, directory, guides, policies, robots.txt)
  scripts/         directory.ts (client-side search/filter/sort)
scripts/           validate-data.mjs, import-handoff.mjs
```

## Frontend-only decisions

| Brief item | Implementation |
| --- | --- |
| Headless CMS | JSON/Markdown in Git, edited directly or through Claude |
| Contact/correction form | `mailto:` links plus a compose form that opens the visitor's email app. Nothing is stored |
| Search visibility | Indexable. `/sitemap.xml`, `/robots.txt`, `/llms.txt` (+ `/llm.txt`, `/llms-full.txt`), canonical URLs, Open Graph image and JSON-LD are generated from the data. `site.json -> noindex: true` turns a copy into a hidden staging site. |
| Publication workflow | `publication_state` per record, plus a `showDrafts` test-mode flag |
| Directory filters | Client-side JavaScript, with state kept in the URL hash (`/directory/#industry=healthcare`) |

## Deploying

Any static host works (Netlify, Vercel, Cloudflare Pages, GitHub Pages):
- **Build command:** `npm run build`
- **Output directory:** `dist`

**Rollback:** redeploy a previous build or Git commit.

## Before public launch

The site is configured for public indexing. Before or after launch: submit `https://uxagencyfinder.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools, mark reviewed records as `published`, and set `showDrafts: false` once every published record is reviewed.

Tests: `npm run test:seo` (static SEO audit), `npm run test:e2e` and `npm run test:lighthouse` (both need `npm run preview` running).

