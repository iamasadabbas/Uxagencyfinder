# Analytics event map

The brief (section 18) asks us to track how visitors use the site. No analytics product has been chosen yet, so nothing is sent today and no tracking script is loaded. The links already carry `data-track` attributes, so connecting a tool later only takes a small script.

| Event | Trigger | Attributes | Where |
| --- | --- | --- | --- |
| `page_view` | Every page load | page path (industry list, profile, guide, directory) | All pages (handled by the analytics tool itself) |
| `official_site_click` | Click on an agency's official website | `data-agency`, `data-industry` (on industry pages) | Industry assessments, agency profiles, directory |
| `evidence_click` | Click on a case-study source link | `data-agency`, `data-source`, `data-industry` | Industry assessments, agency profile evidence table |
| `worksheet_copy` | Copy button on a guide worksheet | guide path | Hiring guides |
| `contact_compose` | Contact form opens the email app | topic | Contact page |

Rules from the brief:
- Send only the allowlisted IDs above (agency, industry, source). Never send personal data or free text.
- An outbound click is interest, not a verified lead or sale.
- Set a baseline before setting growth targets. Connect Google Search Console separately.

To connect a privacy-friendly tool (for example Plausible or GA4), add its snippet to `src/layouts/BaseLayout.astro`, plus a listener like this:

```js
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-track]');
  if (!el) return;
  const props = { agency: el.dataset.agency, industry: el.dataset.industry, source: el.dataset.source };
  // plausible(el.dataset.track, { props })  or  gtag('event', el.dataset.track, props)
});
```

When a tool is added, update `src/pages/privacy.md` first.

