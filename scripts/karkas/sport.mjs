// Адаптер «каркас из старой страницы» для музея спорта (Р493). razobrat(html, json, den) → поля карточки-образца.
import { razobratStranicu, proba, poKlassu, razdel, tekst } from './lib/prochie.mjs';

const N = {
  muzei: 'sport',
  oblozhka: (h) => { const f = razdel(h, 'hero'); return { teg: f?.match(/<img\b[^>]*>/)?.[0], podpis: f?.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1] }; },
  chip: (h) => tekst(poKlassu(h, 'eyebrow') ?? poKlassu(h, 'date-chip') ?? '').replace(/^\d+ [а-я]+ · /, ''),
  stamp: (h) => [...(poKlassu(h, 'stats') ?? '').matchAll(/<div[^>]*>\s*<b>([\s\S]*?)<\/b>([\s\S]*?)<\/div>/g)].map((m) => ({ v: tekst(m[1]), k: tekst(m[2]) })),
  istoriya: 'story',
  fakty: ['europe', 'okean', 'shtorka'],
  sluzhebnye: ['hero', 'calendar-section'],
  kalendar: 'calendar-section', istochniki: 'sources-rights', kuda: 'kuda-dalshe',
  interaktiv: ['vybor'],
};

export const razobrat = (html, json, den) => razobratStranicu(N, html, json, den);

if (process.argv.includes("--proba")) process.exitCode = proba(N.muzei, razobrat) ? 0 : 1;
