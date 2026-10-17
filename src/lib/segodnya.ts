// «Сегодня в Русской цивилизации» (главная портала): карточки всех музеев на одну дату ММ-ДД.
// Одно место для страниц-данных segodnya/<ММ-ДД>.json и для компонента portal/Segodnya.astro.
// Сайт статический: при сборке готовятся все 366 дат, «сегодня» выбирает браузер по Москве.
import fs from 'node:fs';
import { getCollection } from 'astro:content';
import { isDated, beyondYear } from './kalendar';

const MONR = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const p2 = (n: number) => String(n).padStart(2, '0');

// 366 ключей по порядку года, с 02-29
export const KEYS = LEAP.flatMap((len, m) => Array.from({ length: len }, (_, d) => `${p2(m + 1)}-${p2(d + 1)}`));
export const whenOf = (key: string) => `${+key.slice(3)} ${MONR[+key.slice(0, 2) - 1]}`;

export interface Card { museum: string; museumTitle: string; title: string; hook?: string; img?: string; alt?: string; href: string; full: boolean }
export interface Today { key: string; when: string; heading: string; shown: string; cards: Card[] }

let cache: Map<string, Card[]> | undefined;

async function byKey() {
  if (cache) return cache;
  const base = import.meta.env.BASE_URL;
  const url = (src: string) => (/^https?:/.test(src) ? src : `${base}${src.replace(/^\//, '')}`);
  const museums = await getCollection('museums');
  const days = await getCollection('days');
  const dated = new Map<string, boolean>();
  cache = new Map();
  for (const d of days) {
    const slug = d.data.museum;
    if (!dated.has(slug)) dated.set(slug, isDated(slug));
    if (beyondYear(d.data.key, dated.get(slug)!)) continue;
    const m = museums.find((x) => x.id === slug);
    if (!m) continue;
    const first = d.data.images[0];
    // Обложка музея public/og/<музей>_index.jpg запасной картинкой НЕ берётся: на ней набрано имя музея
    // (текст на картинке запрещён, 03.08) и при обрезке 16:10 оно режется. Нет картинки дня — карточка без картинки.
    // Адрес дня собирается у каждой карточки (den/[key].astro); полная страница — src/data/full-pages.
    const card: Card & { n: number } = {
      museum: slug, museumTitle: m.data.title_ru, title: d.data.title, hook: d.data.hook,
      img: first && url(first.src), alt: first?.caption,
      href: `${base}muzei/${slug}/den/${d.data.key}/`,
      full: fs.existsSync(`src/data/full-pages/${slug}/${d.data.key}.html`), n: m.data.number,
    };
    (cache.get(d.data.key) ?? cache.set(d.data.key, []).get(d.data.key)!).push(card);
  }
  // Первой — полная страница дня с картинкой, дальше с картинкой, дальше по номеру музея.
  const rank = (c: Card) => (c.full && c.img ? 0 : c.full ? 1 : c.img ? 2 : 3);
  for (const list of cache.values()) list.sort((a, b) => rank(a) - rank(b) || (a as any).n - (b as any).n);
  for (const list of cache.values()) list.forEach((c) => delete (c as any).n);
  return cache;
}

// Карточки даты; нет ни одной — ближайшая следующая дата с карточками («Завтра в …» / «20 октября в …»).
export async function today(key: string): Promise<Today> {
  const all = await byKey();
  const i = KEYS.indexOf(key);
  for (let s = 0; s < KEYS.length; s++) {
    const k = KEYS[(i + s) % KEYS.length];
    const cards = all.get(k);
    if (!cards?.length) continue;
    const heading = s === 0 ? 'Сегодня в Русской цивилизации' : s === 1 ? 'Завтра в Русской цивилизации' : `${whenOf(k)} в Русской цивилизации`;
    return { key, when: whenOf(key), heading, shown: k, cards };
  }
  return { key, when: whenOf(key), heading: 'Сегодня в Русской цивилизации', shown: key, cards: [] };
}
