// «Сегодня в Русской цивилизации» (главная портала): карточки всех музеев на одну дату ММ-ДД.
// Одно место для страниц-данных segodnya/<ММ-ДД>.json и для компонента portal/Segodnya.astro.
// Сайт статический: при сборке готовятся все 366 дат, «сегодня» выбирает браузер по Москве.
import fs from 'node:fs';
import { getCollection } from 'astro:content';
import { isDated, beyondYear } from './kalendar';
import { stroka, poUmolchaniyu } from './yazyki.mjs';

const LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const p2 = (n: number) => String(n).padStart(2, '0');

// 366 ключей по порядку года, с 02-29
export const KEYS = LEAP.flatMap((len, m) => Array.from({ length: len }, (_, d) => `${p2(m + 1)}-${p2(d + 1)}`));
// месяцы и заголовки — из словаря языка (Г20), по умолчанию русский
export const whenOf = (key: string, code: string = poUmolchaniyu) => `${+key.slice(3)} ${stroka(code, 'mesyacyR')[+key.slice(0, 2) - 1]}`;

export interface Takzhe { museumTitle: string; href: string }
// sv — ключи двойника (lyudi: из slovar, «название|год»); takzhe — тот же человек/событие в других музеях этой даты
export interface Card { museum: string; museumTitle: string; title: string; hook?: string; img?: string; alt?: string; credit?: string; href: string; full: boolean; year?: string; sv: string[]; takzhe?: Takzhe[] }
// cards[0] — «вещь дня» (poKrugu), остальные — «ещё сегодня»
export interface Today { key: string; when: string; heading: string; shown: string; cards: Card[] }

let cache: Map<string, Card[]> | undefined;

// Двойник (20.10): одно событие/человек в один день в нескольких музеях — совпадение человека в slovar
// (lyudi:…) или нормализованного «название + год». Показывается один раз, остальные музеи — «Ещё в музее …».
const norm = (t: string) => t.toLowerCase().replace(/ё/g, 'е').replace(/[^0-9a-zа-я]+/g, ' ').trim();
function klyuchiDvoynika(slovar: string[] | undefined, title: string, year: unknown): string[] {
  const k = (slovar ?? []).filter((x) => x.startsWith('lyudi:'));
  if (year !== undefined && year !== '') k.push(`t:${norm(title)}|${year}`);
  return k;
}
// Ручной приоритет (необязательный): { "ММ-ДД": ["slug музея", …] } — названные музеи идут первыми в этом порядке
// сразу за вещью дня. Пустой файл — порядок только по весу.
const PORYADOK: Record<string, string[]> = (() => {
  try { return JSON.parse(fs.readFileSync('src/data/glavnaya-poryadok.json', 'utf8')); } catch { return {}; }
})();
// Год сборки по Москве — для «круглой годовщины»
const GOD = +new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', year: 'numeric' }).format(new Date());
// Вес истории (20.10, прозрачно): полная страница +2, картинка +1, круглая годовщина: кратно 50 — +2, кратно 10 — +1.
export function ves(c: Card): number {
  const y = c.year && /^\d{3,4}$/.test(c.year.trim()) ? GOD - +c.year.trim() : 0;
  return (c.full ? 2 : 0) + (c.img ? 1 : 0) + (y > 0 && y % 50 === 0 ? 2 : y > 0 && y % 10 === 0 ? 1 : 0);
}
// Склеивает двойников: остаётся первая по порядку карточка, у неё — ссылки на остальные музеи.
function bezDvoynikov(cards: Card[]): Card[] {
  const out: Card[] = [];
  for (const c of cards) {
    const twin = out.find((o) => o.sv.some((x) => c.sv.includes(x)));
    if (twin) (twin.takzhe ??= []).push({ museumTitle: c.museumTitle, href: c.href });
    else out.push({ ...c, takzhe: undefined });
  }
  return out;
}
// музеи с календарём по номеру — круг чередования «вещи дня»
let krug: string[] = [];

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
    const card: Card = {
      museum: slug, museumTitle: m.data.title_ru, title: d.data.title, hook: d.data.hook,
      img: first && url(first.src), alt: first?.caption, credit: first?.credit,
      href: `${base}muzei/${slug}/den/${d.data.key}/`,
      full: fs.existsSync(`src/data/full-pages/${slug}/${d.data.key}.html`),
      year: d.data.year === undefined ? undefined : String(d.data.year),
      sv: klyuchiDvoynika(d.data.slovar, d.data.title, d.data.year),
    };
    // А5 (Р84, 21.10): на главной только заполненные дни — пустой день (заголовок и фраза) в «Открыть день» не ведём.
    if (!card.full) continue;
    (cache.get(d.data.key) ?? cache.set(d.data.key, []).get(d.data.key)!).push(card);
  }
  krug = museums.filter((m) => days.some((d) => d.data.museum === m.id)).sort((a, b) => a.data.number - b.data.number).map((m) => m.id);
  return cache;
}

// «Вещь дня» (Е7, 20.10.2026: первым не всегда один музей). Кандидаты даты — музеи с картинкой дня (нет ни у
// кого — все музеи даты), по номеру музея; вещь дня — кандидат номер (день года mod число кандидатов). Совпал
// со вчерашней — следующий кандидат. Детерминированно: весь московский день вещь одна, назавтра — другой музей.
// Остальные карточки (20.10) — ручной приоритет glavnaya-poryadok.json, затем вес ves() по убыванию, при равенстве —
// по кругу от вещи дня. Двойники склеиваются (bezDvoynikov), вещь дня остаётся первой.
function kandidaty(k: string): Card[] {
  const cards = cache!.get(k) ?? [];
  const sImg = cards.filter((c) => c.img);
  return [...(sImg.length ? sImg : cards)].sort((a, b) => krug.indexOf(a.museum) - krug.indexOf(b.museum));
}
function veshch(k: string, vchera?: string): Card | undefined {
  const kand = kandidaty(k);
  if (!kand.length) return undefined;
  let i = KEYS.indexOf(k) % kand.length;
  if (kand.length > 1 && kand[i].museum === vchera) i = (i + 1) % kand.length;
  return kand[i];
}
function poKrugu(k: string, cards: Card[]): Card[] {
  const n = KEYS.length, d = KEYS.indexOf(k);
  const v = veshch(k, veshch(KEYS[(d - 1 + n) % n])?.museum)!;
  const M = krug.length || 1, start = krug.indexOf(v.museum);
  const mesto = (c: Card) => (krug.indexOf(c.museum) - start + M) % M;
  const ruch = PORYADOK[k] ?? [];
  const r = (c: Card) => (ruch.includes(c.museum) ? ruch.indexOf(c.museum) : ruch.length);
  const pervaya = (c: Card) => (c === v ? 0 : 1);
  return bezDvoynikov([...cards].sort((a, b) => pervaya(a) - pervaya(b) || r(a) - r(b) || ves(b) - ves(a) || mesto(a) - mesto(b)));
}

// Карточки даты; нет ни одной — ближайшая следующая дата с карточками («Завтра в …» / «20 октября в …»).
export async function today(key: string, code: string = poUmolchaniyu): Promise<Today> {
  const all = await byKey();
  const i = KEYS.indexOf(key);
  for (let s = 0; s < KEYS.length; s++) {
    const k = KEYS[(i + s) % KEYS.length];
    const cards = all.get(k);
    if (!cards?.length) continue;
    const heading = s === 0 ? stroka(code, 'segodnyaVRC') : s === 1 ? stroka(code, 'zavtraVRC') : stroka(code, 'dataVRC').replace('{d}', whenOf(k, code));
    return { key, when: whenOf(key, code), heading, shown: k, cards: poKrugu(k, cards) };
  }
  return { key, when: whenOf(key, code), heading: stroka(code, 'segodnyaVRC'), shown: key, cards: [] };
}
