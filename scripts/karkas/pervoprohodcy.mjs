// Адаптер «каркас из старой страницы» для музея «Первопроходцы» (Р493). razobrat(html, json, den) → поля карточки-образца.
// Вёрстка у трёх дней разная: викторина — window.MUSEUM_QUIZ, var QUIZ=[{q,opts,correct,why}] или const quiz=[{q,o,c,e}].
import { razobratStranicu, proba, poKlassu, razdel, tekst, massiv, voprosyIzZapisi } from './lib/prochie.mjs';

const N = {
  muzei: 'pervoprohodcy',
  oblozhka: (h) => { const f = poKlassu(h, 'hero-fig', 'figure'); return { teg: f?.match(/<img\b[^>]*>/)?.[0], podpis: f?.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1] }; },
  chip: (h) => tekst(poKlassu(h, 'date-chip') ?? '').replace(/^\d+ [а-я]+ · /, ''),
  kto: (h) => tekst(poKlassu(h, 'who', 'div') ?? ''),
  stamp: (h) => [...(poKlassu(h, 'hero-lead', 'header') ?? '').matchAll(/<div class="(?:stat|num)[^"]*"[^>]*>\s*<b>([\s\S]*?)<\/b>([\s\S]*?)<\/div>/g)].map((m) => ({ v: tekst(m[1]), k: tekst(m[2]) })),
  istoriya: 'story',
  fakty: ['put', 'voice', 'deep', 'world', 'momenty', 'kadry', 'more'],
  viktorina: (h, o) => voprosyIzZapisi(o.MUSEUM_QUIZ?.items ?? massiv(h, 'quiz') ?? massiv(h, 'QUIZ')),
  sluzhebnye: ['result'],
  kalendar: 'calendar', istochniki: 'sources', kuda: (h) => (razdel(h, 'next') ? 'next' : 'kuda-dalshe'),
  interaktiv: ['atlas', 'pohod', 'order', 'karta', 'fork', 'chat-sec', 'games', 'excursion'],
};

export function razobrat(html, json, den) {
  const k = razobratStranicu({ ...N, kuda: N.kuda(html), viktorinaPochemu: /id="quiz-box"/.test(html) && !/MUSEUM_QUIZ|(?:var|const)\s+quiz\s*=/i.test(html) ? 'вопросы лежат во внешнем скрипте, в самой странице их нет' : '' }, html, json, den);
  return k;
}

if (process.argv.includes("--proba")) process.exitCode = proba(N.muzei, razobrat) ? 0 : 1;
