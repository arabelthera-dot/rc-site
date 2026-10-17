// Общая лента новых дней всех музеев (src/lib/rss.ts).
import rss from '@astrojs/rss';
import { rssItems } from '../lib/rss';

export async function GET(context) {
  return rss({
    title: 'Русская цивилизация — новые дни музеев',
    description: 'Экспонаты дня всех музеев города-музея «Русская цивилизация».',
    site: new URL(import.meta.env.BASE_URL, context.site).href,
    items: await rssItems(context.site),
    customData: '<language>ru</language>',
    trailingSlash: true,
  });
}
