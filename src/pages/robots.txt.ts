import type { APIRoute } from 'astro';
import site from '../data/site.json';

// robots.txt is generated from site.json. With noindex=false (live) everything is crawlable and the sitemap is advertised.
export const GET: APIRoute = () => {
  const base = site.siteUrl.replace(/\/$/, '');
  const body = site.noindex
    ? `User-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
