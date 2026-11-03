// Адаптер «каркас из старой страницы» для музея «Календарь побед» (Р493). razobrat(html, json, den) → поля карточки-образца.
import { razobratStranicu, proba, poKlassu, razdel, tekst, vsePoKlassu } from './lib/prochie.mjs';

const N = {
  muzei: 'kalendar-pobed',
  oblozhka: (h) => ({ teg: razdel(h, 'hero')?.match(/<img\b[^>]*>/)?.[0] }),
  chip: () => 'день календаря',
  kto: (h) => tekst(poKlassu(h, 'who', 'div')),
  // цифры шапки — плашки .fact первого раздела истории: число и подпись стоят на странице рядом
  stamp: (h) => vsePoKlassu(razdel(h, 'story') ?? '', 'fact', 'div').map((f) => ({ v: tekst(poKlassu(f, 'v', 'div')), k: tekst(poKlassu(f, 'l', 'div')) })),
  istoriya: 'story',
  fakty: ['day', 'shock', 'price', 'balance', 'name', 'echo'],
  sluzhebnye: ['hero'],
  kalendar: 'calendar', istochniki: 'sources',
  interaktiv: ['map'],
};

export const razobrat = (html, json, den) => razobratStranicu(N, html, json, den);

if (process.argv.includes("--proba")) process.exitCode = proba(N.muzei, razobrat) ? 0 : 1;
