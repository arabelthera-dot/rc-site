// Календарь музея для движка возврата museum-return.js на страницах дня: window.MUSEUM_CALENDAR
// (ключ дня → название t, год y, хук d, адрес href) — один файл на музей, браузер берёт его из кэша.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { isDated } from '../../../lib/kalendar';

export async function getStaticPaths() {
  const days = await getCollection('days');
  return [...new Set(days.map((d) => d.data.museum))].map((slug) => ({
    params: { slug }, props: { days: days.filter((d) => d.data.museum === slug).map((d) => d.data) } }));
}

export const GET: APIRoute = ({ params, props }) => {
  const base = import.meta.env.BASE_URL;
  const cal: Record<string, unknown> = { dated: isDated(params.slug!) };
  for (const d of props.days as { key: string; title: string; year?: string | number; hook?: string }[])
    cal[d.key] = { t: d.title, y: d.year, d: d.hook, href: `${base}muzei/${params.slug}/den/${d.key}/` };
  return new Response(`window.MUSEUM_CALENDAR=${JSON.stringify(cal)};\n`, { headers: { 'Content-Type': 'text/javascript' } });
};
