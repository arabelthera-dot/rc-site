// Адаптер «каркас из старой страницы» для музея искусства (Р493). razobrat(html, json, den) → поля карточки-образца.
// Викторина здесь — разметка (button.opt с data-ok="1"), факты — блоки «Факт N».
import { razobratStranicu, proba, razdel, shapkaRazdela, tekst, vnutri, voprosyIzRazmetki, vsePoKlassu } from './lib/prochie.mjs';

const N = {
  muzei: 'iskusstvo',
  oblozhka: (h) => { const f = h.match(/<figure\b[^>]*>([\s\S]*?)<\/figure>/)?.[1]; return { teg: f?.match(/<img\b[^>]*>/)?.[0], podpis: f?.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1] }; },
  chip: (h) => tekst(h.match(/<h1[^>]*>[\s\S]*?<\/h1>/)?.[0].match(/<small>([\s\S]*?)<\/small>/)?.[1] ?? ''),
  istoriya: 'istoriya',
  fakty: ['razbor', 'kontekst'],
  sluzhebnye: ['kartina-i-hudozhnik'],
  // «Факт N» — div.q с h3 и абзацем, без кнопок ответа
  faktyIzRazmetki: (h) => {
    const s = razdel(h, 'kartina-i-hudozhnik') ?? '';
    const u = vsePoKlassu(s, 'q', 'div').filter((q) => /<em>\s*Факт/.test(q) && !/<button/.test(q))
      .map((q) => ({ summary: tekst(q.match(/<h3[^>]*>(?:<em>[\s\S]*?<\/em>)?([\s\S]*?)<\/h3>/)?.[1]), det: [...q.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) => vnutri(m[1])) }));
    const sh = shapkaRazdela(s);
    return u.length ? [{ id: 'kartina-i-hudozhnik', nav: sh.h2, ...sh, udary: u }] : [];
  },
  viktorina: (h) => voprosyIzRazmetki(razdel(h, 'quiz') ?? ''),
  kalendar: 'calendar', istochniki: 'sources-rights', kuda: 'kuda-dalshe',
  interaktiv: ['rolik-kartiny', 'glubokiy-zum', 'chat', 'game', 'sharada'],
};

export const razobrat = (html, json, den) => razobratStranicu(N, html, json, den);

if (process.argv.includes("--proba")) process.exitCode = proba(N.muzei, razobrat) ? 0 : 1;
