// Адаптер каркаса карточки из старой страницы — «Музей русской архитектуры и зодчества» (Р493).
// razobrat(html, json, den) → поля карточки как в src/content/dni-shablon/ne-sdayutsya/01-01.yaml + nety[] + vybrosheno[].
// node scripts/karkas/arhitektura.mjs --proba — разобрать все старые страницы, ничего не писать.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chist, sekciya, h2, abzacy, kicker, tekst, vnutri, atr, osnova, istochniki, kuda, itog, vybrosheno, proba } from './_obshchee-arh-kar.mjs';

const MUZEI = 'arhitektura', IMYA = 'Музей русской архитектуры и зодчества';

// Викторина вида A (01-01…01-03): кнопки data-answer="good|bad" (в .quiz-card или прямо в разделе); объяснение — data-feedback верной кнопки или p.quiz-feedback.
function vidA(s, nety) {
  const out = [], karty = [...s.matchAll(/<article class="quiz-card"[^>]*>([\s\S]*?)<\/article>/g)].map((m) => m[1]);
  for (const karta of karty.length ? karty : [s]) {
    const kn = [...karta.matchAll(/<button[^>]*data-answer="(good|bad)"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => Object.assign(m, { 0: m[0].slice(0, m[0].indexOf('>') + 1) }));
    if (!kn.length) continue;
    const vern = kn.find((m) => m[1] === 'good');
    const e = tekst(atr(vern?.[0], 'data-feedback') ?? karta.match(/<p class="quiz-feedback"[^>]*>([\s\S]*?)<\/p>/)?.[1]);
    if (!e) nety.push(`викторина: у вопроса «${tekst(karta.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1])}» объяснения на странице нет (пишет скрипт после ответа)`);
    out.push({ q: tekst(karta.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1]) || h2(s), o: kn.map((m) => tekst(m[2])), a: kn.findIndex((m) => m[1] === 'good'), e });
  }
  return out;
}

// Викторина вида B (01-06…01-09): кнопки data-quiz="ключ"; верный ключ и объяснение — в public/assets/<имя>-page.js.
function vidB(h, s, nety) {
  const kn = [...s.matchAll(/<button[^>]*data-quiz="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)];
  if (!kn.length) return [];
  const skript = [...h.matchAll(/<script src="(?:\.\.\/)+assets\/([a-z0-9-]+-page\.js)"/g)].at(-1)?.[1];
  const put = skript && fileURLToPath(new URL(`../../public/assets/${skript}`, import.meta.url));
  const js = put && fs.existsSync(put) ? fs.readFileSync(put, 'utf8') : '';
  const m = js.match(/dataset\.quiz\s*===\s*'([^']+)'/);
  if (!m) { nety.push(`викторина: верный ответ не найден${skript ? ` в ${skript}` : ' — нет скрипта страницы'}`); return []; }
  const e = js.slice(m.index).match(/\?\s*'<strong>Верно\.<\/strong>\s*([^']*)'/)?.[1] ?? '';
  if (!e) nety.push(`викторина: объяснения верного ответа в ${skript} нет`);
  const q = [tekst(s.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]), tekst(s.slice(s.indexOf('</h2>')).match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1])].filter(Boolean).join(' ');
  return [{ q, o: kn.map((x) => tekst(x[2])), a: kn.findIndex((x) => x[1] === m[1]), e: tekst(e) }];
}

export function razobrat(html, json, den) {
  html = chist(html);
  const nety = [], vid = [];
  const { k } = osnova(html, json, den, MUZEI, IMYA, nety);
  const vzyato = ['rolik', 'audioguide', 'calendar', 'kuda-dalshe', 'sources', 'sources-rights', 'quiz', 'facts', 'istoriya', 'history'];

  // Плашки героя: <span><b>1230–1234</b> строительство</span>.
  const geroy = html.match(/<div class="hero-facts"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '';
  k.stamp = [...geroy.matchAll(/<span[^>]*><b>([\s\S]*?)<\/b>([\s\S]*?)<\/span>/g)].map((m) => ({ v: tekst(m[1]), k: tekst(m[2]) }));
  if (!k.stamp.length) nety.push('нет на старой странице: плашки героя (stamp)');
  // У этого музея хук — абзац p.lead после h1; общая основа берёт первый абзац, уточняем.
  const lead = tekst(html.match(/<p class="(?:lead|hook)"[^>]*>([\s\S]*?)<\/p>/)?.[1]);
  if (lead) k.lead.hook = lead;

  const ist = sekciya(html, 'istoriya', 'history');
  if (ist) {
    vid.push(`история #${ist.id}`);
    k.story = { kicker: kicker(ist.html) || 'История', h2: h2(ist.html), abzacy: abzacy(ist.html).filter((p) => !/class="kicker"/.test(p)) };
    if (k.story.abzacy[0] && tekst(k.story.abzacy[0]) === k.story.kicker) k.story.abzacy.shift();
  } else { k.story = null; nety.push('нет на старой странице: история (#istoriya / #history)'); }

  const f = sekciya(html, 'facts');
  if (f) {
    vid.push('факты #facts');
    // Три вида записи: article с <b>/<span>-меткой (+ h3) и абзацем; абзац «<strong>Факт:</strong> …».
    let udary = [...f.html.matchAll(/<article[^>]*>\s*<(?:b|span)>([\s\S]*?)<\/(?:b|span)>\s*(?:<h3[^>]*>([\s\S]*?)<\/h3>)?\s*<p>([\s\S]*?)<\/p>/g)]
      .map((m) => ({ summary: `${tekst(m[1])}${m[2] ? ` · ${tekst(m[2])}` : ''}. ${vnutri(m[3])}` }));
    if (!udary.length) udary = [...f.html.matchAll(/<p>\s*<strong>([^<]*?):?<\/strong>:?\s*([\s\S]*?)<\/p>/g)].map((m) => ({ summary: `${tekst(m[1])}: ${vnutri(m[2])}` }));
    if (!udary.length) nety.push('в #facts нет ни карточек, ни абзацев «Факт: …»');
    k.fakty = [{ id: 'facts', kicker: kicker(f.html), h2: h2(f.html), udary }];
  } else nety.push('нет на старой странице: факты (#facts)');

  const qs = sekciya(html, 'quiz');
  let voprosy = [];
  if (!qs) nety.push('нет на старой странице: викторина');
  else if (/data-answer="/.test(qs.html)) { voprosy = vidA(qs.html, nety); vid.push('викторина A (data-answer)'); }
  else if (/data-quiz="/.test(qs.html)) { voprosy = vidB(html, qs.html, nety); vid.push('викторина B (data-quiz + скрипт страницы)'); }
  else nety.push('нет на старой странице: викторина (#quiz — вопросы на понимание без вариантов ответа)');
  itog(k, voprosy);

  k.sources = istochniki(html, nety, 'sources', 'sources-rights');
  k.kuda = kuda(html, nety, 'kuda-dalshe');
  k.nety = nety;
  k.vybrosheno = vybrosheno(html, vzyato);
  k.vid = vid;
  return k;
}

if (process.argv.includes('--proba')) proba(MUZEI, razobrat);
