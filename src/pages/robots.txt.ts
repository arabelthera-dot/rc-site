// robots.txt для поисковиков: всё открыто, адрес индекса карт сайта (волны — src/data/karta-sayta.json, Е6). Адрес — из site/base.
// Служебные страницы не закрываются здесь: им нужен noindex на странице, а Disallow спрятал бы его от поисковика.
// Превью-сборка (PUBLIC_NOINDEX=1, .github/workflows/deploy.yml, задача build) — всё закрыто; по умолчанию открыто.
import type { APIRoute } from 'astro';
const noindex = import.meta.env.PUBLIC_NOINDEX === '1';
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\n${noindex ? 'Disallow: /' : 'Allow: /'}\n\nSitemap: ${new URL(`${import.meta.env.BASE_URL}sitemap-index.xml`, site).href}\n`);
