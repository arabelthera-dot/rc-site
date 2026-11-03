// Адаптер «каркас из старой страницы» для музея «Русские сказки» (Р493). razobrat(html, json, den) → поля карточки-образца.
import { razobratStranicu, proba, poKlassu, razdel, tekst, vsePoKlassu } from './lib/prochie.mjs';

const N = {
  muzei: 'skazki',
  oblozhka: (h) => ({ teg: razdel(h, 'hero')?.match(/<img\b[^>]*>/)?.[0], podpis: razdel(h, 'heroCap') }),
  chip: (h) => tekst(poKlassu(h, 'eyebrow')).replace(/^\d+ [а-я]+ · /, ''),
  stamp: (h) => vsePoKlassu(poKlassu(h, 'stats') ?? '', '[a-z-]*', 'div').length ? [] : [...(poKlassu(h, 'stats') ?? '').matchAll(/<div[^>]*>\s*<b>([\s\S]*?)<\/b>([\s\S]*?)<\/div>/g)].map((m) => ({ v: tekst(m[1]), k: tekst(m[2]) })),
  fakty: ['eshche'],
  sluzhebnye: ['hero'],
  sources: 'sources-rights', istochniki: 'sources-rights', kuda: 'kuda-dalshe',
  interaktiv: ['games', 'slovo'],
};

export function razobrat(html, json, den) {
  const k = razobratStranicu(N, html, json, den);
  if (!k.story) k.nety = k.nety.map((n) => (n.endsWith('история') ? 'нет на старой странице: история (сказка идёт игрой «выбери ход» — MUSEUM_CHOICE_TALE, связного рассказа нет)' : n));
  return k;
}

if (process.argv.includes("--proba")) process.exitCode = proba(N.muzei, razobrat) ? 0 : 1;
