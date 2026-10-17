// Лента RSS «новые дни Русской цивилизации» (решение Сергея 17.10: подписка = Telegram-канал на всё +
// бот с выбором музеев + RSS; канал потом берёт посты из этой ленты). Общая — /rss.xml, своя у музея —
// /muzei/<slug>/rss.xml. В ленту идут только готовые дни (isReady: есть хук или текст), «День готовится» — нет.
// pubDate — дата дня в последний раз, когда она наступила по Москве на момент сборки (17 октября → 17.10.2026,
// 18 октября → 18.10.2025): лента идёт от сегодняшнего дня назад по году, свежий элемент — день сегодняшней
// даты. Дата добавления карточки из git не берётся: сборка на CI клонирует без истории, даты были бы ложные.
// Ключ недатированного музея (День N · месяц, бывает 12-32) — число зажимается длиной месяца.
import fs from 'node:fs';
import { getCollection } from 'astro:content';
import { isReady, beyondYear, isDated } from './kalendar';

const LEN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MIME: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif' };

function pubDate(key: string, now: Date) {
  const msk = new Date(now.getTime() + 3 * 3600e3);
  const y = msk.getUTCFullYear();
  const m = +key.slice(0, 2) - 1;
  const at = (yy: number) => {
    const leap = (yy % 4 === 0 && yy % 100 !== 0) || yy % 400 === 0;
    const d = Math.min(+key.slice(3), m === 1 && !leap ? 28 : LEN[m]);
    return new Date(Date.UTC(yy, m, d, 6, 0, 0)); // 09:00 по Москве
  };
  const cur = at(y);
  return cur.getTime() - 3 * 3600e3 <= now.getTime() ? cur : at(y - 1);
}

export async function rssItems(site: URL, museum?: string) {
  const base = import.meta.env.BASE_URL;
  const museums = await getCollection('museums');
  const now = new Date();
  const days = (await getCollection('days')).map((d) => d.data)
    .filter((d) => (!museum || d.museum === museum) && isReady(d) && !beyondYear(d.key, isDated(d.museum)));
  const items = [];
  for (const d of days) {
    const m = museums.find((x) => x.id === d.museum);
    if (!m) continue;
    const link = new URL(`${base}muzei/${d.museum}/den/${d.key}/`, site).href;
    const img = d.images.find((i) => !/^https?:/.test(i.src) && fs.existsSync(`public/${i.src.replace(/^\//, '')}`));
    const ext = img?.src.split('.').pop()?.toLowerCase() ?? '';
    items.push({
      title: d.title,
      description: d.hook ?? d.gist!.split(/(?<=[.!?…])\s+/)[0],
      link,
      pubDate: pubDate(d.key, now),
      categories: [m.data.title_ru],
      ...(img && MIME[ext] ? { enclosure: { url: new URL(`${base}${img.src.replace(/^\//, '')}`, site).href,
        length: fs.statSync(`public/${img.src.replace(/^\//, '')}`).size, type: MIME[ext] } } : {}),
    });
  }
  return items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime() || a.link.localeCompare(b.link));
}
