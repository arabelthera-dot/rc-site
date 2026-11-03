// Общий разбор старых страниц для адаптеров arhitektura.mjs и karikatura.mjs (Р493).
// Страницы этих музеев свёрстаны свободно: у каждого поля несколько видов записи, разбор пробует их по очереди.
// Блока нет — поле пустое и строка в nety, не останов. Ничего не пишет.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export const SAYT = 'https://russian-civilization.ru';
const MES = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const LITSENZIYA = 'цитирование в информационных и учебных целях с указанием автора и источника (ст. 1274 ГК РФ)';
const ENT = { nbsp: ' ', gt: '>', lt: '<', amp: '&', quot: '"', laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…', rarr: '→', larr: '←', shy: '' };
export const ent = (s) => s.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (x, k) => (k[0] === '#' ? String.fromCodePoint(k[1] === 'x' ? parseInt(k.slice(2), 16) : +k.slice(1)) : ENT[k] ?? x));
export const tekst = (s) => ent((s ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([.,;:!?»)])/g, '$1').replace(/([«(])\s+/g, '$1').trim();
export const vnutri = (s) => ent((s ?? '').replace(/\s+/g, ' ').trim());
// Пробелы и переносы перед «>» внутри тегов (</b\n>) мешают разбору — убираются до всего остального.
export const chist = (h) => h.replace(/\s+>/g, '>');
export const atr = (teg, k) => teg?.match(new RegExp(`\\s${k}="([^"]*)"`))?.[1];

// Раздел <section id="…"> целиком; первый найденный из списка id.
export function sekciya(h, ...idy) {
  for (const id of idy) {
    const m = h.match(new RegExp(`<section[^>]*\\sid="${id}"[^>]*>([\\s\\S]*?)</section>`));
    if (m) return { id, html: m[1] };
  }
  return null;
}
export const h2 = (s) => tekst(s?.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]);
export const abzacy = (s) => [...(s ?? '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => vnutri(m[1])).filter((p) => tekst(p));
// Подзаголовок раздела: первый .kicker / .number / .eyebrow / первый <p> до h2.
export function kicker(s) {
  const m = s?.match(/class="[^"]*\b(?:kicker|number|eyebrow|label|asta-number)\b[^"]*"[^>]*>([\s\S]*?)<\/(?:p|div|span)>/);
  return tekst(m?.[1]);
}

// JS-литерал после «имя=» (массив или объект) — вырезается по скобкам с учётом строк, исполняется в пустой песочнице.
export function literal(h, imya) {
  const m = h.match(new RegExp(`(?:(?:const|let|var)\\s+|window\\.)${imya}\\s*=\\s*([\\[{])`));
  if (!m) return null;
  let i = m.index + m[0].length - 1, glub = 0, str = null;
  const nach = i;
  for (; i < h.length; i++) {
    const c = h[i];
    if (str) { if (c === '\\') i++; else if (c === str) str = null; continue; }
    if (c === "'" || c === '"' || c === '`') str = c;
    else if (c === '[' || c === '{') glub++;
    else if (c === ']' || c === '}') { if (--glub === 0) break; }
  }
  try { return vm.runInNewContext(`(${h.slice(nach, i + 1)})`); } catch { return null; }
}

// window.MUSEUM_* — исполняются в пустой песочнице; скрипт с document пропускается.
export function okno(h) {
  const o = {};
  for (const [, kod] of h.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    if (!/window\.MUSEUM_/.test(kod)) continue;
    // Скрипт страницы трогает document — тогда литералы window.MUSEUM_* вырезаются по скобкам.
    try { vm.runInNewContext(kod, { window: o }); } catch {
      for (const [, imya] of kod.matchAll(/window\.(MUSEUM_[A-Z_]+)\s*=/g)) if (!(imya in o)) { const v = literal(kod, imya); if (v) o[imya] = v; }
    }
  }
  return o;
}

// Кадр с правами: адрес источника и права — из подписи кадра в записи дня.
export function kartinka(src, alt, zap, nety, sh, vy) {
  const credit = zap?.credit ?? '';
  const data_source = credit.match(/https?:\/\/\S+?(?=[.,;]?(?:\s|$))/)?.[0]
    ?? (credit.match(/Госкаталог[^№]*№\s*(\d+)/) ? `https://goskatalog.ru/portal/#/collections?id=${credit.match(/Госкаталог[^№]*№\s*(\d+)/)[1]}` : null);
  if (!data_source) { nety.push(`кадр ${src}: в записи дня нет адреса источника — кадр не перенесён`); return null; }
  const k = { src, alt, data_source, license: credit.match(/Права:\s*(.+?)\.?$/)?.[1] ?? LITSENZIYA,
    podpis: `${(zap.caption ?? alt).replace(/\.$/, '')}.`, credit: credit.split(/\s*Источник:/)[0].trim() };
  if (sh && vy) Object.assign(k, { width: +sh, height: +vy });
  return k;
}

const norm = (u) => `/${(u ?? '').replace(/^(\.\.\/)+|^\//g, '')}`;

// Скелет карточки: то, что у обоих музеев записано одинаково (шапка, обложка, ролик, аудиогид, календарь, кадры, chrome).
export function osnova(h, j, den, muzei, imya, nety) {
  const [, mm, dd] = den.match(/^(\d\d)-(\d\d)$/), d = +dd, mes = +mm - 1;
  const ok = okno(h);
  const h1 = tekst(h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]);
  const opisanie = ent(h.match(/<meta (?:property|name)="(?:og:)?description" content="([^"]*)"/)?.[1] ?? '') || (j?.hook ?? '');
  const url = `${SAYT}/muzei/${muzei}/den/${den}/`, title = `${h1} — «${imya}» — Русская цивилизация`;
  const ogImg = atr(h.match(/<meta property="og:image"[^>]*>/)?.[0], 'content') ?? `${SAYT}/og/og-default.jpg`;
  const ld = (() => { try { return JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]); } catch { return null; } })();
  const god = (j?.year ? String(j.year) : null) ?? tekst(h.slice(0, h.indexOf('<h1') + 1)).match(/\b(1[0-9]{3}|20[0-2]\d)\b/)?.[1]
    ?? (ld?.temporalCoverage ?? ld?.dateCreated ?? '').match?.(/\d{3,4}/)?.[0];
  if (!h1) nety.push('нет на старой странице: заголовок h1');
  if (!opisanie) nety.push(`нет на старой странице: описание (meta description)${j?.hook ? ' — взят хук записи дня' : ''}`);

  const k = { muzei, key: den };
  k.head = {
    title, description: opisanie, canonical: url, sobytie: j?.title ?? h1, ...(god ? { god } : {}),
    og: { type: 'article', site_name: 'Русская цивилизация', title, description: opisanie, url, image: ogImg },
    ld: { '@context': 'https://schema.org', '@type': 'Article', headline: `${h1} — «${imya}»`, description: opisanie, url, image: ogImg,
      inLanguage: 'ru-RU', isAccessibleForFree: true, publisher: { '@type': 'Organization', name: 'Русская цивилизация', url: `${SAYT}/` } },
  };

  // Обложка: первый кадр страницы, для которого есть подпись в записи дня; иначе первый кадр из записи дня.
  const zapKadra = (src) => j?.images?.find((i) => norm(i.src) === norm(src));
  const kadry = [...h.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]).filter((t) => /\/img\/|goskatalog/.test(atr(t, 'src') ?? ''));
  const geroy = kadry.find((t) => zapKadra(atr(t, 'src')));
  const cap = tekst(h.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1]);
  if (geroy) {
    const src = norm(atr(geroy, 'src')), ob = kartinka(src, ent(atr(geroy, 'alt') ?? ''), zapKadra(src), nety, atr(geroy, 'width'), atr(geroy, 'height'));
    if (ob) k.oblozhka = { ...ob, hint: cap.slice(0, 80) || god || '', celikom: true };
  } else if (j?.images?.length) {
    const z = j.images[0], ob = kartinka(norm(z.src), z.caption ?? '', z, nety);
    if (ob) { k.oblozhka = { ...ob, hint: god ?? '', celikom: true }; nety.push('на старой странице кадр с подписью не найден — обложка взята из первого кадра записи дня'); }
  } else nety.push('нет на старой странице: кадр обложки');
  if (!k.oblozhka) k.oblozhka = null;

  // Плашка перед h1: «6 января · …» — дата дня и, если есть, событие.
  const doH1 = h.slice(0, h.indexOf('<h1'));
  const plashka = tekst([...doH1.matchAll(/<(?:p|div|span)[^>]*>([^<]*\d{1,2} (?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)[^<]*)</g)].at(-1)?.[1]);
  const hook = tekst(h.match(/<p class="hook"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? h.slice(h.indexOf('</h1>')).match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1]) || j?.hook || '';
  if (!hook) nety.push('нет на старой странице: хук');
  k.kroshka = `${d} ${['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'][mes]} · ${h1}`;
  k.lead = { data: `День ${d} · ${MES[mes]}${god ? ` · ${god}` : ''}`, plashka, h1, hook };
  nety.push('нет на старой странице: привязка даты (privyazka) — пишет человек');

  // Ролик: <video> с data-rc-video / src.
  const video = h.match(/<video\b[^>]*>/)?.[0];
  const vsek = video && [...h.matchAll(/<section[^>]*>([\s\S]*?)<\/section>/g)].map((m) => m[1]).find((s) => s.includes('<video'));
  const ot = (u) => (u && !/^(\/|https?:)/.test(u) ? `/muzei/${muzei}/${u.replace(/^(\.\.\/)+/, '')}` : u);
  if (video) {
    const klyuch = atr(video, 'data-rc-video'), format = atr(video, 'data-rc-format') ?? 'horizontal', p = abzacy(vsek);
    k.video = { h2: h2(vsek), klyuch: klyuch ?? null, format, ...(klyuch ? { pole: `${klyuch}:${format}.sec` } : {}), suffix: 'сек',
      badge: kicker(vsek) || 'ролик', intro: tekst(p[0]), poster: ot(atr(video, 'poster')) ?? null,
      mp4: ot(atr(video, 'src') ?? atr(vsek.match(/<source[^>]*>/)?.[0], 'src') ?? atr(vsek.match(/<source[^>]*>/)?.[0], 'data-src')) ?? null, note: tekst(p.at(-1)) };
  } else { k.video = null; nety.push('нет на старой странице: ролик'); }

  // Аудиогид: window.MUSEUM_AUDIOGUIDE или голый <audio data-src> в #audioguide.
  const ag = ok.MUSEUM_AUDIOGUIDE, agSek = sekciya(h, 'audioguide');
  if (ag) k.audioguide = Object.fromEntries(['audioSrc', 'durationLabel', 'lead', 'stops', 'transcript', 'note'].filter((x) => ag[x] != null).map((x) => [x, ag[x]]));
  else if (agSek && /<audio/.test(agSek.html)) {
    const a = agSek.html.match(/<audio\b[^>]*>/)[0];
    k.audioguide = { audioSrc: ot(atr(a, 'data-src') ?? atr(a, 'src')), lead: tekst(abzacy(agSek.html)[0]), stops: [], transcript: [] };
    nety.push('аудиогид без window.MUSEUM_AUDIOGUIDE: взят файл и вводный абзац, остановок и расшифровки на странице в виде данных нет');
  } else { k.audioguide = null; nety.push('нет на старой странице: аудиогид'); }

  const kal = sekciya(h, 'calendar', 'calendar-section');
  k.kalendar = kal ? { kicker: kicker(kal.html) || 'Календарь', h2: h2(kal.html), intro: tekst(abzacy(kal.html)[0]) } : null;
  if (!kal) nety.push('нет на старой странице: календарь');

  k.figures = (j?.images ?? []).map((i) => norm(i.src)).filter((src) => src !== k.oblozhka?.src)
    .map((src) => kartinka(src, zapKadra(src)?.caption ?? '', zapKadra(src), nety)).filter(Boolean);
  if (!j) nety.push('нет записи дня src/content/days — кадры без прав не переносятся');
  if (!k.figures.length) nety.push('кадров, кроме обложки, нет — figures пусто');

  const ch = ok.MUSEUM_CHROME;
  if (ch) { const { museum, city, ...ost } = ch; k.chrome = { ...ost, random: ost.random ?? [] }; } else { k.chrome = null; nety.push('нет на старой странице: MUSEUM_CHROME'); }
  const voz = ok.MUSEUM_RETURN;
  k.return = voz ? { q: voz.q, a: voz.a, ...(voz.src ? { src: voz.src } : {}) } : null;
  if (!voz) nety.push('нет на старой странице: вопрос возврата (MUSEUM_RETURN)');
  k.stamp = [];
  k.fakty = [];
  k.razdely = [];
  k.proof = { status: 'ne_utverzhdeno', note: 'Каркас собран машиной из старой страницы (scripts/karkas, Р493); фактов, утверждённых Сергеем, нет.' };
  return { k, ok, h1 };
}

// Источники: <li> в разделе источников; если списка нет — строки таблицы.
export function istochniki(h, nety, ...idy) {
  const s = sekciya(h, ...idy);
  if (!s) { nety.push('нет на старой странице: источники'); return []; }
  let li = [...s.html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => ({ html: vnutri(m[1]) }));
  if (!li.length) li = [...s.html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].filter((m) => !/<th/.test(m[1]))
    .map((m) => ({ html: [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((t) => vnutri(t[1])).join(' · ') }));
  if (!li.length) nety.push(`в разделе #${s.id} нет ни списка, ни таблицы источников`);
  return li;
}

// «Куда дальше»: ссылки раздела; заголовок — первая жирная/h3 часть, хук — остальное.
export function kuda(h, nety, ...idy) {
  // Раздел без id находится по подзаголовку «Куда дальше».
  const s = sekciya(h, ...idy) ?? [...h.matchAll(/<section(?![^>]*\sid=)[^>]*>([\s\S]*?)<\/section>/g)]
    .filter((m) => />\s*Куда дальше\s*</.test(m[1])).map((m) => ({ id: 'без id, «Куда дальше»', html: m[1] }))[0];
  if (!s) { nety.push('нет на старой странице: «Куда дальше»'); return []; }
  const out = [];
  for (const m of s.html.matchAll(/<(article|a)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
    const href = m[1] === 'a' ? atr(` ${m[2]}`, 'href') : atr(m[3].match(/<a\b[^>]*>/)?.[0], 'href');
    if (!href || href.startsWith('#') || /^(\.\.\/){2,}/.test(href)) continue; // «Город-музей» и якоря не переносятся
    const glav = tekst(m[3].match(/<(?:b|strong|h3|span class="lbl")[^>]*>([\s\S]*?)<\/(?:b|strong|h3|span)>/)?.[1]);
    const vse = tekst(m[3]);
    out.push({ lbl: glav.match(/^\d{1,2} [а-я]+/)?.[0] ?? '', href, title: glav || vse, hook: vse.replace(glav, '').trim(), main: out.length === 0 });
  }
  if (!out.length) nety.push(`в разделе #${s.id} ссылок нет`);
  return out;
}

// Викторина в данных карточки: q, o, a (номер верного), e.
export function quizIz(voprosy, ball = 10) {
  return { kicker: `Проверь себя · ${voprosy.length} ${voprosy.length === 1 ? 'вопрос' : voprosy.length < 5 ? 'вопроса' : 'вопросов'}`, h2: 'Викторина',
    intro: 'На каждый вопрос — одна попытка. После ответа покажем объяснение.',
    noscript: `Для викторины нужен JavaScript. Ответы: ${voprosy.map((v, i) => `${i + 1} — ${v.o[v.a]}`).join('; ')}.`, ball, voprosy };
}
export function itog(k, voprosy) {
  k.quiz = voprosy.length ? quizIz(voprosy) : null;
  k.result = voprosy.length ? { h2: 'Итог дня', intro: 'Викторина даёт баллы. Прогресс не сохраняется: перезагрузка страницы начинает день заново.',
    zvanie: `0 / ${voprosy.length * 10} · звание: Гость дня`, note: 'Ответь на вопросы викторины.' } : null;
  k.score = { awards: { q: [voprosy.length, 10] }, ranks: [[0, 'Гость дня']] };
  k.daynav = [k.video && { id: 'video', label: 'Видео' }, k.story && { id: 'story', label: 'Читать' }, k.audioguide && { id: 'audioguide', label: 'Слушать' },
    k.fakty.length && { id: 'fakty', label: 'Факты' }, k.quiz && { id: 'quiz', label: 'Викторина' }, k.kalendar && { id: 'calendar', label: 'Календарь' }].filter(Boolean);
}

export const vybrosheno = (h, vzyato) => [...h.matchAll(/<section[^>]*\sid="([^"]+)"/g)].map((m) => m[1]).filter((id) => !vzyato.includes(id));

// --proba: разобрать все свои страницы, ничего не писать, «прошла N из M» и причины.
export function proba(muzei, razobrat) {
  const papka = `src/data/full-pages/${muzei}`, zapisi = `src/content/days/${muzei}`;
  const dni = fs.readdirSync(papka).filter((f) => /^\d\d-\d\d\.html$/.test(f)).map((f) => f.slice(0, 5)).sort();
  let ok = 0;
  const stroki = [];
  for (const den of dni) {
    const h = fs.readFileSync(path.join(papka, `${den}.html`), 'utf8');
    const zp = path.join(zapisi, `${den}.json`);
    const j = fs.existsSync(zp) ? JSON.parse(fs.readFileSync(zp, 'utf8')) : null;
    try {
      const k = razobrat(h, j, den);
      const pusto = ['story', 'quiz', 'sources'].filter((p) => !k[p] || (Array.isArray(k[p]) && !k[p].length));
      ok++;
      stroki.push(`${den}: прошла${pusto.length ? ` (пусто: ${pusto.join(', ')})` : ''}; вид: ${k.vid.join(', ')}\n    nety: ${k.nety.join(' | ') || '—'}\n    выброшено: ${k.vybrosheno.join(', ') || '—'}`);
    } catch (e) { stroki.push(`${den}: ОСТАНОВ — ${e.message}`); }
  }
  console.log(`${muzei}: прошла ${ok} из ${dni.length}`);
  console.log(stroki.join('\n'));
}
