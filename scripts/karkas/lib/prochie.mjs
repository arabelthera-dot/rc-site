// Общие приёмы разбора старой страницы для адаптеров scripts/karkas/{skazki,kalendar-pobed,pervoprohodcy,sport,iskusstvo}.mjs (Р493).
// Адаптер описывает, где у его музея лежит блок; здесь — только чтение HTML и приведение к полям карточки-образца
// src/content/dni-shablon/ne-sdayutsya/01-01.yaml. Чего на странице нет — поле пустое и строка в nety, не останов.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export const SAYT = 'https://russian-civilization.ru';
const MES = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const MES_R = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const ENT = { nbsp: ' ', gt: '>', lt: '<', amp: '&', quot: '"', laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…', thinsp: ' ', shy: '' };
export const ent = (s) => (s ?? '').replace(/&(#x?[\da-f]+|[a-z]+);/gi, (x, k) =>
  (k[0] === '#' ? String.fromCodePoint(k[1] === 'x' ? parseInt(k.slice(2), 16) : +k.slice(1)) : ENT[k] ?? x));
const bezSkriptov = (s) => (s ?? '').replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, '');
export const tekst = (s) => ent(bezSkriptov(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s([,.;:!?»)])/g, '$1').replace(/([«(])\s/g, '$1').trim();
export const vnutri = (s) => ent(bezSkriptov(s).replace(/\s+/g, ' ').trim());
export const atr = (teg, k) => { const v = teg?.match(new RegExp(`\\s${k}="([^"]*)"`))?.[1]; return v === undefined ? undefined : ent(v); };

// Элемент с id="…" целиком, с учётом вложенных одноимённых тегов (у сказок <section id="quiz"> внутри <section id="quiz-wrap">).
export function razdel(h, id) {
  const m = new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*\\sid="${id}"[^>]*>`, 'i').exec(h);
  if (!m) return null;
  return vnutrennee(h, m.index, m[1]);
}
// Первый элемент с классом k (точное слово в class).
export function poKlassu(h, k, teg = '[a-z][a-z0-9]*') {
  const m = new RegExp(`<(${teg})\\b[^>]*\\sclass="(?:[^"]*\\s)?${k}(?:\\s[^"]*)?"[^>]*>`, 'i').exec(h ?? '');
  return m ? vnutrennee(h, m.index, m[1]) : null;
}
export function vsePoKlassu(h, k, teg = '[a-z][a-z0-9]*') {
  const re = new RegExp(`<(${teg})\\b[^>]*\\sclass="(?:[^"]*\\s)?${k}(?:\\s[^"]*)?"[^>]*>`, 'gi'), out = [];
  for (let m; (m = re.exec(h ?? ''));) out.push(vnutrennee(h, m.index, m[1]));
  return out;
}
function vnutrennee(h, start, teg) {
  const open = h.indexOf('>', start) + 1;
  const re = new RegExp(`<(/?)${teg}\\b[^>]*>`, 'gi');
  re.lastIndex = open;
  let glub = 1;
  for (let m; (m = re.exec(h));) {
    if (m[0].endsWith('/>')) continue;
    glub += m[1] ? -1 : 1;
    if (!glub) return h.slice(open, m.index);
  }
  return h.slice(open);
}
export const idRazdelov = (h) => [...h.matchAll(/<section\b[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
export const h2 = (s) => tekst(s?.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]);
export const abzacy = (s) => [...bezSkriptov(s).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) => vnutri(m[1])).filter((p) => tekst(p));

// window.MUSEUM_* — литералы старой страницы; исполняются в пустой песочнице, без document.
export function okno(h) {
  const o = {};
  for (const [, kod] of h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    if (!/window\.MUSEUM_/.test(kod)) continue;
    try { vm.runInNewContext(kod, { window: o }); } catch { /* скрипт с document — не литерал */ }
  }
  return o;
}
// Литерал массива `var|const|let ИМЯ=[…];` внутри скрипта (const quiz=[…], var QUIZ=[…], const qs=[…]).
export function massiv(h, imya) {
  const m = new RegExp(`(?:var|const|let)\\s+${imya}\\s*=\\s*\\[`).exec(h);
  if (!m) return null;
  let i = m.index + m[0].length - 1, glub = 0, str = null;
  for (let k = i; k < h.length; k++) {
    const c = h[k];
    if (str) { if (c === '\\') k++; else if (c === str) str = null; continue; }
    if (c === '"' || c === "'" || c === '`') str = c;
    else if (c === '[') glub++;
    else if (c === ']' && !--glub) {
      try { return vm.runInNewContext(`(${h.slice(i, k + 1)})`); } catch { return null; }
    }
  }
  return null;
}

// Викторина — к виду образца {q, o, a, e}. Встречаются: {q,o,c,e} (MUSEUM_QUIZ.items, const quiz), {q,opts,correct,why} (var QUIZ),
// и разметка <div class="q"><h3>…</h3><button class="opt" data-q data-ok="1">…<p class="expl"> (искусство).
export function voprosyIzZapisi(spisok) {
  return (spisok ?? []).map((v) => ({ q: tekst(v.q), o: (v.o ?? v.opts ?? v.options ?? []).map(tekst), a: v.c ?? v.correct ?? v.a, e: tekst(v.e ?? v.why ?? v.expl ?? '') }))
    .filter((v) => v.q && v.o.length && Number.isInteger(v.a));
}
export function voprosyIzRazmetki(s) {
  return vsePoKlassu(s, 'q', 'div').map((q) => {
    const knopki = [...q.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
    return { q: tekst(q.match(/<h3[^>]*>(?:<em>[\s\S]*?<\/em>)?([\s\S]*?)<\/h3>/)?.[1]), o: knopki.map((b) => tekst(b[2])),
      a: knopki.findIndex((b) => /data-ok="1"/.test(b[1])), e: tekst(poKlassu(q, 'expl', 'p')) };
  }).filter((v) => v.q && v.o.length && v.a >= 0);
}
export function viktorina(voprosy, { kicker, h2: zag, intro, ball } = {}) {
  return { kicker: kicker || `Проверь себя · ${voprosy.length} вопросов`, h2: zag || 'Викторина',
    intro: intro || 'На каждый вопрос — одна попытка. После ответа покажем объяснение.',
    noscript: `Для викторины нужен JavaScript. Ответы: ${voprosy.map((v, i) => `${i + 1} — ${v.o[v.a]}`).join('; ')}.`,
    ball: ball ?? 10, voprosy };
}

// Кадр: путь от корня сайта, адрес источника и права — из атрибутов img или из записи дня (credit «… Права: …»).
export const otKornya = (muzei, u) => (!u ? u : /^(\/|https?:|data:)/.test(u) ? u : `/muzei/${muzei}/${u.replace(/^\.\//, '')}`);
export function kadr(muzei, teg, zapis, podpisHtml) {
  const src = otKornya(muzei, atr(teg, 'src'));
  const zap = (zapis?.images ?? []).find((i) => `/${i.src.replace(/^\//, '')}` === src);
  const credit = tekst(zap?.credit ?? poKlassu(podpisHtml, 'credit', 'span') ?? '');
  const data_source = atr(teg, 'data-source') || credit.match(/https?:\/\/\S+?(?=[.,;)]?(?:\s|$))/)?.[0] || '';
  const alt = atr(teg, 'alt') ?? '';
  const k = { src, alt, data_source, license: atr(teg, 'data-license') || credit.match(/Права:\s*(.+?)\.?$/)?.[1] || '',
    podpis: tekst(zap?.caption ?? (podpisHtml ? podpisHtml.replace(/<span class="credit">[\s\S]*?<\/span>/, '') : alt)), credit };
  const sh = atr(teg, 'width'), vy = atr(teg, 'height');
  if (sh && vy) Object.assign(k, { width: +sh, height: +vy });
  return k;
}
// Все кадры страницы с источником (data-source или запись в записи дня), без повторов; обложка — отдельно.
export function kadryStranicy(muzei, h, zapis, krome) {
  const vidno = new Set(krome ? [krome] : []), out = [];
  for (const m of bezSkriptov(h).matchAll(/<img\b[^>]*>/g)) {
    const src = otKornya(muzei, atr(m[0], 'src'));
    if (!src || vidno.has(src) || /\.svg$|^data:/.test(src)) continue;
    vidno.add(src);
    const k = kadr(muzei, m[0], zapis);
    if (k.data_source) out.push(k);
  }
  for (const i of zapis?.images ?? []) {
    const src = `/${i.src.replace(/^\//, '')}`;
    if (vidno.has(src) || /\.svg$/.test(src)) continue;
    vidno.add(src);
    const k = kadr(muzei, `<img src="${src}" alt="${(i.caption ?? '').replace(/"/g, '&quot;')}">`, zapis);
    if (k.data_source) out.push(k);
  }
  return out;
}

export function shapka(h, muzei, den, nazvanie) {
  const meta = (k) => ent(h.match(new RegExp(`<meta (?:property|name)="${k}" content="([^"]*)"`))?.[1] ?? '');
  const title = tekst(h.match(/<title>([\s\S]*?)<\/title>/)?.[1]), opisanie = meta('og:description') || meta('description');
  const url = `${SAYT}/muzei/${muzei}/den/${den}/`, image = meta('og:image');
  return { title, description: opisanie, canonical: url,
    og: { type: 'article', site_name: 'Русская цивилизация', title: meta('og:title') || title, description: opisanie, url, ...(image ? { image } : {}) },
    ld: { '@context': 'https://schema.org', '@type': 'Article', headline: tekst(h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]) + (nazvanie ? ` — «${nazvanie}»` : ''),
      description: opisanie, url, inLanguage: 'ru', isAccessibleForFree: true, publisher: { '@type': 'Organization', name: 'Русская цивилизация' } } };
}
export function lead(h, den, { chip, kto, hook } = {}) {
  const [, mm, dd] = den.match(/^(\d\d)-(\d\d)$/);
  const h1 = tekst(h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]);
  return { data: [`${+dd} ${MES_R[+mm - 1]}`, MES[+mm - 1], chip].filter(Boolean).join(' · '), h1, ...(kto ? { kto } : {}),
    hook: hook ?? tekst(h.match(/<(p|div) class="hook[^"]*">([\s\S]*?)<\/\1>/)?.[2]) };
}
export const kroshka = (den, h1) => { const [, mm, dd] = den.match(/^(\d\d)-(\d\d)$/); return `${+dd} ${MES_R[+mm - 1]} · ${h1}`; };

export function rolik(muzei, h) {
  const v = h.match(/<video\b[^>]*>/)?.[0];
  if (!v) return null;
  const blok = h.slice(h.indexOf(v), h.indexOf('</video>', h.indexOf(v)));
  const klyuch = atr(v, 'data-rc-video'), format = atr(v, 'data-rc-format') ?? 'horizontal';
  return { ...(klyuch ? { klyuch, format, pole: `${klyuch}:${format}.sec`, suffix: 'сек' } : {}),
    poster: otKornya(muzei, atr(v, 'poster')), mp4: otKornya(muzei, atr(v, 'src') ?? atr(blok.match(/<source[^>]*>/)?.[0], 'src')) };
}
export function audiogid(o) {
  const ag = o.MUSEUM_AUDIOGUIDE;
  return ag ? Object.fromEntries(['audioSrc', 'heading', 'durationLabel', 'lead', 'stops', 'transcript', 'note'].filter((k) => ag[k] !== undefined).map((k) => [k, ag[k]])) : null;
}
export function istochniki(s) {
  return [...(s ?? '').matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => {
    const a = [...m[1].matchAll(/<a\b[^>]*href="(https?:[^"]+)"[^>]*>/g)];
    return a.length === 1 && tekst(m[1]) ? { href: ent(a[0][1]), title: tekst(m[1]) } : { html: vnutri(m[1]) };
  }).filter((x) => x.html || x.title);
}
// «Куда дальше»: все ссылки блока; адреса старых страниц музея — как есть (переводит диспетчер), внутренние якоря — мимо.
export function kuda(s) {
  return [...(s ?? '').matchAll(/<a\b[^>]*href="([^"#][^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => {
    const b = m[2].match(/<(h3|b|strong)[^>]*>([\s\S]*?)<\/\1>/)?.[2], p = m[2].match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1];
    return { href: ent(m[1]), title: tekst(b ?? m[2]).replace(/\s*→$/, ''),
      hook: p ? tekst(p) : b ? tekst(m[2].replace(/<(h3|b|strong)[^>]*>[\s\S]*?<\/\1>/, '')).replace(/\s*→$/, '') : '' };
  }).filter((k) => k.title);
}
export function chrome(o) {
  const ch = o.MUSEUM_CHROME;
  if (!ch) return null;
  const { museum, city, ...ost } = ch;
  return { ...ost, random: ost.random ?? [] };
}
export const ochki = (o) => (o.MUSEUM_SCORE ? { awards: o.MUSEUM_SCORE.awards, ranks: o.MUSEUM_SCORE.ranks } : null);

// Пустые поля — не ошибка: для каждого обязательного блока образца без содержимого — строка «нет на старой странице: …».
const BLOKI = { head: 'шапка', oblozhka: 'обложка', lead: 'вводная', story: 'история', fakty: 'факты', quiz: 'викторина', audioguide: 'аудиогид',
  video: 'ролик', figures: 'кадры', sources: 'источники', kuda: '«Куда дальше»', kalendar: 'календарь', chrome: 'обвязка (MUSEUM_CHROME)', stamp: 'цифры шапки' };
export function itog(karta, nety, vybrosheno) {
  const pusto = (v) => v == null || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);
  for (const [k, imya] of Object.entries(BLOKI)) if (pusto(karta[k]) && !nety.some((n) => n.includes(imya))) nety.push(`нет на старой странице: ${imya}`);
  return { ...karta, nety, vybrosheno };
}

// --proba: разобрать все свои страницы, ничего не писать, напечатать «прошла N из M» и причины.
export function proba(muzei, razobrat) {
  const dir = `src/data/full-pages/${muzei}`, zap = `src/content/days/${muzei}`;
  const dni = fs.readdirSync(dir).filter((f) => /^\d\d-\d\d\.html$/.test(f)).sort();
  let ok = 0;
  const strochki = [];
  for (const f of dni) {
    const den = f.slice(0, 5), j = path.join(zap, `${den}.json`);
    try {
      const k = razobrat(fs.readFileSync(path.join(dir, f), 'utf8'), fs.existsSync(j) ? JSON.parse(fs.readFileSync(j, 'utf8')) : null, den);
      ok++;
      strochki.push(`  ${den}: ${k.lead?.h1} — вопросов ${k.quiz?.voprosy?.length ?? 0}, ударов истории ${k.story?.udary?.length ?? 0}, фактов ${k.fakty?.reduce((n, b) => n + b.udary.length, 0) ?? 0}, кадров ${k.figures?.length ?? 0}, источников ${k.sources?.length ?? 0}`);
      for (const n of k.nety) strochki.push(`    · ${n}`);
      if (k.vybrosheno.length) strochki.push(`    · не перенесено (в образце нет): ${k.vybrosheno.join(', ')}`);
    } catch (e) { strochki.push(`  ${den}: НЕ ПРОШЛА — ${e.message}`); }
  }
  console.log(`${muzei}: прошла ${ok} из ${dni.length}`);
  console.log(strochki.join('\n'));
  return ok === dni.length;
}

// Ударами раздела становятся его готовые единицы: <details> (summary → summary, p → det), карточки-«моменты»/главы (h3 + p, раскрытие → det),
// плашки цифр .fact (v + l); если их нет — абзацы подряд. Источник удара — только если он подписан на самой странице.
export function udary(s) {
  if (!s) return [];
  const chist = bezSkriptov(s).replace(/<svg\b[\s\S]*?<\/svg>/g, '');
  const src = (t) => t.match(/<span[^>]*>\s*(Источники?:[\s\S]*?)<\/span>/)?.[1];
  const karty = [...vsePoKlassu(chist, 'mom', 'article'), ...vsePoKlassu(chist, 'chapter', 'article'), ...vsePoKlassu(chist, 'kd', 'div')];
  if (karty.length) return karty.map((k) => {
    const det = [...(k.match(/<details\b[\s\S]*?<\/details>/g) ?? [])].flatMap((d) => abzacy(d.replace(/<summary[\s\S]*?<\/summary>/, '')));
    const glava = k.replace(/<details\b[\s\S]*?<\/details>/g, '').replace(/<figure\b[\s\S]*?<\/figure>/g, '');
    const kogda = tekst(poKlassu(glava, 'when', 'span') ?? ''), zag = tekst(glava.match(/<(h3|h4|b)\b[^>]*>([\s\S]*?)<\/\1>/)?.[2]);
    const ab = abzacy(glava);
    return { summary: [kogda, zag].filter(Boolean).join(' · ') + (zag || kogda ? '. ' : '') + (ab[0] ?? ''), det: [...ab.slice(1), ...det] };
  }).filter((u) => tekst(u.summary));
  const det = [...chist.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)];
  if (det.length) return det.map((m) => ({ summary: vnutri(m[1].match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1]), det: abzacy(m[1].replace(/<summary[\s\S]*?<\/summary>/, '')) })).filter((u) => tekst(u.summary));
  const fakty = vsePoKlassu(chist, 'fact', 'div');
  const ab = abzacy(vsePoKlassu(chist, 'facts', 'div').reduce((t, f) => t.replace(f, ''), chist));
  if (fakty.length && !ab.length) return fakty.map((f) => {
    const l = poKlassu(f, 'l', 'div') ?? '', s0 = src(l);
    return { summary: `${tekst(poKlassu(f, 'v', 'div'))} — ${tekst(l.replace(/<span[^>]*>\s*Источник[\s\S]*?<\/span>/, ''))}`, det: [], ...(s0 ? { src: tekst(s0) } : {}) };
  });
  // абзац «Источник: …» — подпись к предыдущему удару, не удар
  const out = [];
  for (const p of ab) {
    if (/^(?:<[^>]+>)*\s*Источники?:/.test(p) && out.length) out[out.length - 1].src = tekst(p);
    else if (!/^(?:<[^>]+>)*\s*Источники?:/.test(p)) out.push({ summary: p, det: [] });
  }
  return out;
}
export function shapkaRazdela(s) {
  const kicker = tekst((s.match(/<(?:div|span|p)\s+class="(?:kicker|eyebrow|actno)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|span|p)>/) ?? s.match(/<h2[^>]*>\s*<small>([\s\S]*?)<\/small>/))?.[1]);
  const zag = tekst((s.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? '').replace(/<small>[\s\S]*?<\/small>/, '').replace(/<br\s*\/?>/g, ' '));
  const intro = tekst((s.match(/<(?:p|div)\s+class="(?:lead|lead-p|sec-sub|mb lead)"[^>]*>([\s\S]*?)<\/(?:p|div)>/) ?? s.match(/<div class="section-head">[\s\S]*?<\/h2>\s*<p>([\s\S]*?)<\/p>/))?.[1]);
  return { kicker, h2: zag, intro };
}
// Раздел без шапки и вступления — для ударов (вступление уже взято в intro, повторять его ударом не надо).
const bezShapki = (s) => s.replace(/<div class="section-head">[\s\S]*?<\/div>/, '').replace(/<h2[\s\S]*?<\/h2>/, '')
  .replace(/<(?:p|div)\s+class="(?:lead|lead-p|sec-sub|mb lead)"[^>]*>[\s\S]*?<\/(?:p|div)>/, '').replace(/<(div|span)\s+class="(?:kicker|eyebrow|actno)[^"]*"[^>]*>[\s\S]*?<\/\1>/, '');
export function blok(h, id) {
  const s = razdel(h, id);
  if (!s) return null;
  const sh = shapkaRazdela(s), u = udary(bezShapki(s));
  return u.length ? { id, nav: sh.h2, ...sh, udary: u } : null;
}

// Общий ход разбора; адаптер передаёт, где у его музея что лежит:
// { muzei, istoriya, fakty:[id], viktorina:(h,o)=>[…], kalendar, istochniki, kuda, oblozhka:(h)=>{teg,podpis}, chip, kto, interaktiv:[id] }
export function razobratStranicu(n, html, json, den) {
  if (!/^\d\d-\d\d$/.test(den ?? '')) throw new Error(`день «${den}» не в виде ММ-ДД`);
  if (!/<h1\b/.test(html ?? '')) throw new Error('на странице нет <h1> — это не страница дня');
  const nety = [], vybrosheno = [], o = okno(html), m = n.muzei;
  const ld = lead(html, den, { chip: n.chip?.(html), kto: n.kto?.(html), hook: n.hook?.(html) });
  const ob = n.oblozhka?.(html);
  const oblozhka = ob?.teg ? kadr(m, ob.teg, json, ob.podpis) : null;
  if (oblozhka && !oblozhka.data_source) nety.push('нет на старой странице: источник обложки (картинка без data-source и без записи в записи дня)');

  const stamp = (n.stamp?.(html) ?? []).filter((x) => x.v && x.k);
  let story = null;
  const sIst = n.istoriya && razdel(html, n.istoriya);
  if (sIst) story = { ...shapkaRazdela(sIst), udary: udary(bezShapki(sIst)) };
  else if (n.story) story = n.story(html);
  const fakty = [], vzyato = new Set([n.istoriya, n.kalendar, n.istochniki, n.kuda, ...(n.sluzhebnye ?? [])]);
  for (const id of n.fakty ?? []) { vzyato.add(id); const b = blok(html, id); if (b) fakty.push(b); else if (razdel(html, id)) vybrosheno.push(`${id} (раздел без текста — только рисунок или игра)`); }
  for (const f of n.faktyIzRazmetki?.(html) ?? []) fakty.push(f);

  const voprosy = n.viktorina?.(html, o) ?? voprosyIzZapisi(o.MUSEUM_QUIZ?.items);
  const qz = o.MUSEUM_QUIZ ?? {};
  const quiz = voprosy.length ? viktorina(voprosy, { h2: qz.title, intro: qz.lead, ball: qz.points }) : null;
  if (!quiz) nety.push(`нет на старой странице: викторина${n.viktorinaPochemu ? ` (${n.viktorinaPochemu})` : ''}`);

  const sKal = n.kalendar && razdel(html, n.kalendar);
  const kalendar = sKal ? shapkaRazdela(sKal) : null;
  if (kalendar && !kalendar.intro) kalendar.intro = tekst(sKal.match(/<p class="caption"[^>]*>([\s\S]*?)<\/p>/)?.[1]);
  const sIs = n.istochniki && razdel(html, n.istochniki);
  const sources = istochniki(sIs);
  const sKu = n.kuda && razdel(html, n.kuda);
  for (const id of idRazdelov(html)) {
    if (vzyato.has(id) || /audioguide|quiz|^video$|^rolik/.test(id)) continue;
    if ([...vzyato].some((v) => v && razdel(html, v)?.includes(`id="${id}"`))) continue;
    vybrosheno.push(`${id}${(n.interaktiv ?? []).includes(id) ? ' (игра или интерактив — в образце карточки места нет)' : ''}`);
  }
  const video = rolik(m, html);
  const karta = {
    muzei: m, key: den, head: shapka(html, m, den, n.nazvanie), ...(oblozhka ? { oblozhka } : {}), kroshka: kroshka(den, ld.h1), lead: ld, stamp,
    ...(video ? { video } : {}), story: story && story.udary.length ? story : null, fakty, razdely: [], quiz, kalendar,
    figures: kadryStranicy(m, html, json, oblozhka?.src), sources, kuda: kuda(sKu), score: ochki(o), chrome: chrome(o), audioguide: audiogid(o),
    proof: { status: 'ne_utverzhdeno', note: `Каркас собран машиной из старой страницы /muzei/${m}/den/${den}/ (Р493); текст не сверен с утверждённым днём.` },
  };
  if (!video) delete karta.video;
  return itog(karta, nety, vybrosheno);
}
