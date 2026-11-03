// Адаптер каркаса карточки из старой страницы — «Музей русской карикатуры» (Р493).
// razobrat(html, json, den) → поля карточки как в src/content/dni-shablon/ne-sdayutsya/01-01.yaml + nety[] + vybrosheno[].
// node scripts/karkas/karikatura.mjs --proba — разобрать все старые страницы, ничего не писать.
import { chist, sekciya, h2, abzacy, tekst, osnova, istochniki, kuda, itog, vybrosheno, literal, proba } from './_obshchee-arh-kar.mjs';

const MUZEI = 'karikatura', IMYA = 'Музей русской карикатуры';

// Раздел карикатуры: div.actno — подзаголовок, h2, абзацы текста (кнопки и подписи кадров не берутся).
const razdel = (id, s) => ({ id, kicker: tekst(s.match(/<div class="actno"[^>]*>([\s\S]*?)<\/div>/)?.[1]), h2: h2(s),
  abzacy: abzacy(s.replace(/<figure[\s\S]*?<\/figure>|<button[\s\S]*?<\/button>/g, '')) });

export function razobrat(html, json, den) {
  html = chist(html);
  const nety = [], vid = [];
  const { k } = osnova(html, json, den, MUZEI, IMYA, nety);
  const vzyato = ['film', 'audioguide', 'calendar', 'calendar-section', 'quiz', 'sources-rights', 'rights', 'kuda-dalshe', 'next-links'];

  // История: акты act1…actN (01-01…01-04, 01-06, 01-07) или разделы редакции (01-05). Первый — story, остальные — razdely.
  const akty = [...html.matchAll(/<section[^>]*\sid="(act\d+)"[^>]*>([\s\S]*?)<\/section>/g)].map((m) => razdel(m[1], m[2]));
  const red = ['redakciya', 'sberi-nomer', 'granica-smekha'].map((id) => sekciya(html, id)).filter(Boolean).map((s) => razdel(s.id, s.html));
  const chasti = (akty.length ? akty : red).filter((r) => r.h2 || r.abzacy.length);
  if (chasti.length) {
    vid.push(akty.length ? `акты ${akty.map((a) => a.id).join(', ')}` : `разделы ${red.map((r) => r.id).join(', ')}`);
    const [p, ...ost] = chasti;
    k.story = { kicker: p.kicker || 'История', h2: p.h2, abzacy: p.abzacy };
    k.razdely = ost;
    vzyato.push(...chasti.map((r) => r.id));
    for (const r of chasti) if (!r.abzacy.length) nety.push(`раздел #${r.id}: текст только в игре/кадрах, абзацев нет`);
  } else { k.story = null; nety.push('нет на старой странице: акты истории'); }

  // Факты: «На что смотреть» (article.fact: h3 + p), «В это трудно поверить» и «Миф и факт» (абзацы) — 01-01…01-04.
  k.fakty = ['chto-smotret', 'trudno-poverit', 'general-moroz'].map((id) => sekciya(html, id)).filter(Boolean).map((s) => {
    const karty = [...s.html.matchAll(/<article class="fact"[^>]*>\s*<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/g)];
    const udary = karty.length ? karty.map((m) => ({ summary: `${tekst(m[1])}. ${tekst(m[2])}` })) : abzacy(s.html).map((p) => ({ summary: tekst(p) }));
    return { id: s.id, kicker: tekst(s.html.match(/<div class="actno"[^>]*>([\s\S]*?)<\/div>/)?.[1]), h2: h2(s.html), udary };
  });
  if (k.fakty.length) { vid.push(`факты ${k.fakty.map((f) => f.id).join(', ')}`); vzyato.push(...k.fakty.map((f) => f.id)); }
  else nety.push('нет на старой странице: факты (На что смотреть / В это трудно поверить)');

  // Викторина: const questions=[[q,[o…],a,e],…] (01-01…01-05) или var QUIZ=[{q,o,a,e},…] (01-06, 01-07).
  let voprosy = [];
  const mas = literal(html, 'questions'), obj = literal(html, 'QUIZ');
  if (Array.isArray(mas)) { voprosy = mas.map(([q, o, a, e]) => ({ q, o, a, e: e ?? '' })); vid.push('викторина questions[[…]]'); }
  else if (Array.isArray(obj)) { voprosy = obj.map(({ q, o, a, e }) => ({ q, o, a, e: e ?? '' })); vid.push('викторина QUIZ[{…}]'); }
  else nety.push('нет на старой странице: викторина');
  for (const v of voprosy) if (!v.e) nety.push(`викторина: у вопроса «${v.q}» объяснения нет`);
  itog(k, voprosy);
  const qs = sekciya(html, 'quiz');
  if (k.quiz && qs) Object.assign(k.quiz, { h2: h2(qs.html) || k.quiz.h2, intro: tekst(abzacy(qs.html)[0]) || k.quiz.intro });

  k.sources = istochniki(html, nety, 'sources-rights', 'rights');
  if (k.sources.length) vid.push(/<tr/.test(sekciya(html, 'sources-rights', 'rights').html) && !/<li/.test(sekciya(html, 'sources-rights', 'rights').html) ? 'источники таблицей' : 'источники списком');
  k.kuda = kuda(html, nety, 'kuda-dalshe', 'next-links');
  k.nety = nety;
  k.vybrosheno = vybrosheno(html, vzyato);
  k.vid = vid;
  return k;
}

if (process.argv.includes('--proba')) proba(MUZEI, razobrat);
