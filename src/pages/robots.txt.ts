// robots.txt для поисковиков: всё открыто, адрес карты сайта (@astrojs/sitemap). Адрес берётся из site/base.
import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(`${import.meta.env.BASE_URL}sitemap-index.xml`, site).href}\n`);
