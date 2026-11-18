import type { APIRoute } from 'astro';
import site from '../data/site.json';

// robots.txt is generated from site.json: while `noindex` is true (test site) all crawling is disallowed.
export const GET: APIRoute = () => {
  const body = site.noindex
    ? `User-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site.siteUrl).toString()}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

