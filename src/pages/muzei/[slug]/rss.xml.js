// Лента новых дней одного музея (src/lib/rss.ts); название — title_ru из museums.json дословно.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { rssItems } from '../../../lib/rss';

export async function getStaticPaths() {
  return (await getCollection('museums')).map((m) => ({ params: { slug: m.data.slug }, props: { m: m.data } }));
}

export async function GET(context) {
  const { m } = context.props;
  return rss({
    title: `${m.title_ru} — новые дни`,
    description: m.promise_ru ?? m.title_ru,
    site: new URL(`${import.meta.env.BASE_URL}muzei/${m.slug}/`, context.site).href,
    items: await rssItems(context.site, m.slug),
    customData: '<language>ru</language>',
    trailingSlash: true,
  });
}
