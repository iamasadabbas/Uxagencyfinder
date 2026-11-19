# Analytics event map

Analytics uses **Umami Cloud** (free and cookieless). The script loads only when `site.json -> analytics.umamiWebsiteId` is set, and only counts visits on `uxagencyfinder.com`. Setup steps for the client are in [ANALYTICS-GUIDE.md](./ANALYTICS-GUIDE.md).

| Event | Trigger | Properties | Where |
| --- | --- | --- | --- |
| page view | Every page load | (automatic) | All pages |
| `official_site_click` | Click on an agency's official website | `agency`, `industry` (on industry pages) | Industry assessments, agency profiles, directory |
| `evidence_click` | Click on a case-study source link | `agency`, `source`, `industry` | Industry assessments, profile evidence table |
| `search_select` | Choosing a search suggestion | `type` (industry/agency) | Header-area search (homepage, 404) |
| `directory_filter` | Choosing an industry chip | `industry` | Directory |
| `worksheet_copy` | Copy button on a worksheet | `guide` | Hiring guides |
| `contact_compose` | Contact form opens the email app | `topic` | Contact page |

How it works:
- Links carry `data-track="event"` and optional `data-agency`, `data-industry` and `data-source` attributes. One click listener in `src/components/Analytics.astro` sends them.
- Code can call `window.uafTrack('event', { key: 'value' })`. It does nothing when analytics isn't loaded.
- Only allowlisted IDs are sent: no personal data and no free text (the brief, section 18).
- Each event property counts toward Umami's monthly event quota, so keep properties minimal.
