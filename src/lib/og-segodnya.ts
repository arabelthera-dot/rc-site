// Паспорт пересылки главной = «вещь дня» (20.10.2026): og:title — событие, og:description — хук (одно предложение),
// og:image — сам кадр вещи дня, обрезанный sharp в 1200×630 (src/pages/og/segodnya-[key].jpg.ts). Текста на картинке нет.
// Дата — московская дата сборки, как в portal/Segodnya.astro; сайт пересобирается каждую ночь (deploy.yml, schedule).
// Нет кадра, нет автора/лицензии (credit) или файла нет в public/ — общая картинка сайта (Base.astro, og-default.jpg).
import fs from 'node:fs';
import { today, type Card } from './segodnya';

export const klyuchMsk = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${p.month}-${p.day}`;
};

// файл кадра в public/ (адрес вида /rc-site/... или /...); внешний адрес — undefined
export function kadrFile(src?: string): string | undefined {
  if (!src || /^https?:/i.test(src)) return undefined;
  const f = `public/${decodeURIComponent(src.split(/[?#]/)[0].replace(/^\/(?:rc-site\/)?/, ''))}`;
  return fs.existsSync(f) ? f : undefined;
}

export const pervoePredlozhenie = (s?: string) => (s ? (s.trim().match(/^.+?[.!?…](?=\s|$)/)?.[0] ?? s.trim()) : undefined);

// og:title = событие « — » полное имя музея (title_ru из museums.json), если вместе ≤ 90 знаков; иначе только событие
export const OG_TITLE_MAX = 90;
export function ogZagolovok(v?: Card): string | undefined {
  if (!v?.title) return undefined;
  const s = v.museumTitle ? `${v.title} — ${v.museumTitle}` : v.title;
  return [...s].length <= OG_TITLE_MAX ? s : v.title;
}

export interface OgSegodnya { key: string; vesch?: Card; file?: string; title?: string; description?: string; alt?: string }
export async function ogSegodnya(code?: string): Promise<OgSegodnya> {
  const t = await today(klyuchMsk(), code);
  const v = t.cards[0];
  const file = v?.credit ? kadrFile(v.img) : undefined;
  return { key: t.key, vesch: v, file, title: ogZagolovok(v), description: pervoePredlozhenie(v?.hook), alt: v?.alt ?? v?.title };
}
