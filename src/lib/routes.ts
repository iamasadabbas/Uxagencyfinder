// Single source of truth for every public HTML route. Used by sitemap.xml, llms.txt and tests.
import { site, getIndustries, getAgencies, agencyUrl, guides } from './data';

export type RouteEntry = { path: string; priority: number; changefreq: 'weekly' | 'monthly' | 'yearly'; lastmod: string };

export function getRoutes(): RouteEntry[] {
  const lastmod = site.lastReviewed;
  const r = (path: string, priority: number, changefreq: RouteEntry['changefreq'] = 'monthly'): RouteEntry => ({ path, priority, changefreq, lastmod });
  return [
    r('/', 1.0, 'weekly'),
    r('/agencies/', 0.9, 'weekly'),
    ...getIndustries().map((i) => r(i.route, 0.9, 'weekly')),
    r('/directory/', 0.8, 'weekly'),
    ...getAgencies().map((a) => r(agencyUrl(a), 0.7)),
    r('/guides/', 0.7),
    ...guides.map((g) => r(`/guides/${g.slug}/`, 0.6)),
    r('/methodology/', 0.5),
    r('/about/', 0.4),
    r('/editorial-policy/', 0.4),
    ...(site.editor ? [r(`/authors/${site.editor.slug}/`, 0.3)] : []),
    r('/contact/', 0.3, 'yearly'),
    r('/privacy/', 0.2, 'yearly'),
    r('/terms/', 0.2, 'yearly'),
  ];
}

