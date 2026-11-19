import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '../lib/llms';

// Alias of /llms.txt for tools that request the singular filename.
export const GET: APIRoute = () => new Response(buildLlmsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

