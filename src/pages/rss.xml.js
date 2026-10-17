// Общая лента новых дней всех музеев (src/lib/rss.ts): 500 свежих (~40 дней по всем музеям, ~300 КБ);
// целиком все 4000+ дней — 2,4 МБ, читалки такое режут. Полный год — в ленте каждого музея.
import rss from '@astrojs/rss';
import { rssItems } from '../lib/rss';

export async function GET(context) {
  return rss({
    title: 'Русская цивилизация — новые дни музеев',
    description: 'Экспонаты дня всех музеев города-музея «Русская цивилизация».',
    site: new URL(import.meta.env.BASE_URL, context.site).href,
    items: (await rssItems(context.site)).slice(0, 500),
    customData: '<language>ru</language>',
    trailingSlash: true,
  });
}
