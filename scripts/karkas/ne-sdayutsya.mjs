// Адаптер каркаса «Русские не сдаются» (Р493): старая страница + запись дня → поля карточки. Договор — scripts/karkas/README.md.
// razobrat(html, json, den) — все виды старых страниц НС: история в #istoriya или в разделе дня (put, plen, pereval…,
// иначе первый не служебный); викторина — const quiz=[…] или window.MUSEUM_QUIZ.items. Чего нет — поле пустое, имя в nety.
// material(den) — цитаты и кадры из ~/workspace/knowledge/ns-material/ММ-ДД.md (все пять видов записи: «## Факт N» с ключами,
// «Факт N — строка» под «## Цитаты», стрелочный «Факт N → «цитата» → адрес»; кадры «### Кадр N», «Кадр N», «Кадр N → …»).
// Проверка: node scripts/karkas/ne-sdayutsya.mjs --proba — разбирает все старые страницы, «N из N».
// Образец полей — карточки 01-01…01-05 (r602). Шаблон не знает чата, разбора, «трудно поверить» — они в nety как «выброшено».
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { IGRA } from '../../src/lib/dni-ne-sdayutsya.mjs';
import { POMETKI as VIDNYE, POMETKI_SLUZHEBNYE } from '../../src/lib/den-obshchee.mjs';

const POMETKI = [...VIDNYE, ...POMETKI_SLUZHEBNYE];

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MATERIAL = path.join(os.homedir(), 'workspace/knowledge/ns-material');
const SAYT = 'https://russian-civilization.ru';
const MES = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const MES_R = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MES_KL = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const LITSENZIYA = 'цитирование в информационных и учебных целях с указанием автора и источника (ст. 1274 ГК РФ)';
// Раздел истории у старых страниц без #istoriya (01-07…01-29): путь героя, плен, перевал, корабль, город, грамота.
const ISTORIYA = ['istoriya', 'put', 'plen', 'pereval', 'sergokala', 'korabl', 'gorod', 'gramota'];
// Разделы, которые шаблон берёт; прочие идут в nety как выброшенные (визуализацию дня переносит человек, Р436).
const SLUZHEBNYE = ['video', 'audioguide', 'quiz', 'itog', 'sources-rights', 'calendar', 'kuda-dalshe'];
const ENT = { nbsp: ' ', gt: '>', lt: '<', amp: '&', quot: '"', laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…' };
const ent = (s) => s.replace(/&(#\d+|[a-z]+);/g, (x, k) => (k[0] === '#' ? String.fromCodePoint(+k.slice(1)) : ENT[k] ?? x));
const tekst = (s) => ent((s ?? '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const vnutri = (s) => ent((s ?? '').replace(/\s+/g, ' ').trim());
const atr = (teg, k) => teg?.match(new RegExp(`\\s${k}="([^"]*)"`))?.[1];
const URL_ = /https?:\/\/[^\s()«»"]+?(?=[.,;]?(?:\s|\)|»|$))/;
const put = (src) => `/${String(src).replace(/^\//, '')}`;

// Размер кадра из файла (JPEG — маркер SOF, PNG — IHDR), если в материале его нет.
// Ролик дня из реестра public/video/registry.json — выпуск nesdayutsya/ДДmon-… (ролик rc-rolik к дню без ролика на старой
// странице, 10 янв., r521). Пути — абсолютные, с версией выпуска.
export function rolikIzReestra(dd, mes) {
  const f = path.join(KOREN, 'public/video/registry.json');
  if (!fs.existsSync(f)) return null;
  const vse = JSON.parse(fs.readFileSync(f, 'utf8')).releases ?? {};
  const klyuch = Object.keys(vse).find((k) => k.startsWith(`nesdayutsya/${dd}${MES_KL[mes]}-`));
  const r = klyuch && vse[klyuch];
  if (!r?.horizontal?.local || !r.poster?.local) return null;
  return { h2: r.title, klyuch, format: 'horizontal', pole: `${klyuch}:horizontal.sec`, suffix: 'сек',
    badge: `${Math.round(r.horizontal.sec)} сек`, intro: r.intro ?? '', poster: `/${r.poster.local}?v=${r.poster.v ?? 1}`,
    mp4: `/${r.horizontal.local}?v=${r.horizontal.v ?? 1}`, note: r.note ?? '' };
}

function razmer(src) {
  const f = path.join(KOREN, 'public', src);
  if (!fs.existsSync(f)) return null;
  const b = fs.readFileSync(f);
  if (b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG') return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  for (let i = 2; i + 9 < b.length;) {
    if (b[i] !== 0xff) return null;
    const m = b[i + 1], len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
    i += 2 + len;
  }
  return null;
}

// «…» от первой ёлочки до парной (с вложенными); без ёлочек — null.
function vKavychkah(s) {
  const i = s.indexOf('«');
  if (i < 0) return null;
  let g = 0;
  for (let k = i; k < s.length; k++) {
    if (s[k] === '«') g++;
    else if (s[k] === '»' && --g === 0) return s.slice(i, k + 1);
  }
  const j = s.lastIndexOf('»'); // вложенная «» не закрыта (как в источнике) — до последней ёлочки строки
  return j > i ? s.slice(i, j + 1) : null;
}

// ── Материал дня: факты (до раздела кадров) и кадры. ──
export function material(den) {
  const file = path.join(MATERIAL, `${den}.md`);
  const out = { file, fakty: new Map(), kadry: [], sokr: new Map() }; // sokr — «Сокращения адресов»: РИА-2010 = https://…
  if (!fs.existsSync(file)) return out;
  let rezhim = 'fakty', blok = null;
  const zakryt = () => {
    if (blok?.vid === 'fakt' && !out.fakty.has(blok.n)) out.fakty.set(blok.n, fakt(blok, out.sokr));
    if (blok?.vid === 'kadr') { const k = kadrMateriala(blok); if (k) out.kadry.push(k); }
    blok = null;
  };
  for (const stroka of fs.readFileSync(file, 'utf8').split('\n')) {
    const s = stroka.replace(/\*\*/g, '').trim();
    const zag = s.match(/^#+\s*(.*)$/)?.[1];
    if (zag !== undefined && !/^(Факт|Кадр)\s+\d/.test(zag)) {
      zakryt();
      if (/^#\s/.test(s)) continue; // заголовок файла («… материал (цитаты, кадры, визуализация)») разделов не меняет
      if (/^Кадры/i.test(zag)) rezhim = 'kadry';
      else if (/Визуализац|Итог|Расхожден/i.test(zag)) rezhim = 'stop';
      continue;
    }
    const sh = (zag ?? s).match(/^(Факт|Кадр)\s+(\d+)\b\s*(.*)$/);
    if (sh && !(sh[1] === 'Факт' && rezhim !== 'fakty')) {
      zakryt();
      if (sh[1] === 'Кадр' && rezhim === 'stop') continue;
      blok = { vid: sh[1] === 'Факт' ? 'fakt' : 'kadr', n: +sh[2], polya: {}, ostatok: sh[3] };
      if (blok.vid === 'kadr' && rezhim === 'fakty') rezhim = 'kadry';
      if (/^\(?[^→]*\)?\s*→/.test(sh[3])) blok.strelki = ` ${sh[3]}`.split(/\s+→\s+/).map((x) => x.trim());
      continue;
    }
    const sokr = !blok && s.match(/^[-•]\s*(\S+)\s*=\s*(https?:\/\/\S+)/);
    if (sokr) { out.sokr.set(sokr[1], sokr[2]); continue; }
    const kv = blok && s.match(/^[-•]?\s*([А-Яа-яЁёA-Za-z][А-Яа-яЁёA-Za-z0-9 ×]*?)\s*:\s*(.*)$/);
    if (kv) { const k = kv[1].toLowerCase(); blok.polya[k] ??= kv[2].trim(); }
  }
  zakryt();
  return out;
}

// Адрес: URL в строке, иначе сокращение из списка в начале файла (самое длинное совпавшее).
const adres = (s, sokr) => s.match(URL_)?.[0] ?? [...sokr].filter(([k]) => s.includes(k)).sort((x, y) => y[0].length - x[0].length)[0]?.[1];

function fakt(b, sokr) {
  const p = b.polya;
  if (b.strelki) {
    const otryvok = vKavychkah(b.strelki[1] ?? ''), href = (b.strelki[2] ?? '').match(URL_)?.[0];
    return { otryvok, href, stranica: null, pometka: null, pometkaTekst: null };
  }
  const otryvok = vKavychkah(p['цитата'] ?? p['цитата 1'] ?? ''), href = adres(p['адрес'] ?? p['адрес 1'] ?? '', sokr);
  const stranica = p['страница'] ? p['страница'].replace(/^«([^«»]+)»/, '$1').trim() : null;
  const pt = (p['пометка'] ?? '').toLowerCase();
  return { otryvok, href, stranica, pometka: POMETKI.find((m) => pt.startsWith(m)) ?? null, pometkaTekst: p['пометка'] ?? null };
}

function kadrMateriala(b) {
  const p = b.polya;
  let src, istochnik, podpis, alt, prava, credit, wh, kf;
  if (b.strelki) {
    const [, put_, ist, pod, pr] = b.strelki;
    src = put_?.match(/\/\S+?\.(?:jpe?g|png|webp)/i)?.[0]; wh = put_?.match(/(\d+)\s*×\s*(\d+)/);
    istochnik = ist ?? ''; podpis = pod; prava = pr;
    credit = istochnik.replace(URL_, '').replace(/,\s*,/g, ',').replace(/^[\s,]+|[\s,]+$/g, '');
  } else {
    src = (p['файл'] ?? '').match(/\/\S+?\.(?:jpe?g|png|webp)/i)?.[0];
    istochnik = p['источник'] ?? ''; podpis = p['подпись'] ?? p['podpis']; alt = p['alt'];
    prava = p['license'] ?? p['права']; credit = p['credit'] ?? p['хранитель'] ?? p['держатель'];
    wh = (p['размер'] ?? p['ширина×высота'] ?? '').match(/(\d+)\s*×\s*(\d+)/);
    kf = p['к факту'];
  }
  if (!src) return null;
  const data_source = (istochnik.match(URL_) ?? (credit ?? '').match(URL_))?.[0];
  if (!credit && istochnik) credit = istochnik.replace(URL_, '').replace(/^[\s,]+|[\s,]+$/g, '') || undefined;
  // обложка — «Кадр 1 (обложка)» или «к факту: обложка» (README материала)
  const k = { src: put(src), alt: alt || podpis, data_source, license: prava || LITSENZIYA, podpis: podpis && `${podpis.replace(/\.$/, '')}.`, credit,
    kFaktu: [...(kf ?? '').matchAll(/\d+/g)].map((m) => +m[0]), oblozhka: /обложка/.test(`${b.ostatok} ${kf ?? ''}`), staryy: /старый/.test(`${b.ostatok} ${p['файл'] ?? ''}`), altIzPodpisi: !alt, est: fs.existsSync(path.join(KOREN, 'public', src)) };
  if (wh) Object.assign(k, { width: +wh[1], height: +wh[2] });
  return k;
}

// Кадр материала → кадр карточки (без служебных полей); без адреса, подписи или файла — null.
export function kadrKartochki(m) {
  if (!m?.data_source || !m.podpis || !m.alt || !m.est) return null;
  const k = { src: m.src, alt: m.alt, data_source: m.data_source, license: m.license, podpis: m.podpis };
  if (m.credit) k.credit = m.credit;
  const r = m.width ? m : razmer(m.src);
  if (r) Object.assign(k, { width: +r.width, height: +r.height });
  return k;
}

// ── Старая страница → поля карточки. html === null (страницы нет, 01-30) — что есть в записи дня. ──
export function razobrat(html, json, den) {
  const h = html ?? '', j = json ?? {}, nety = [];
  if (!html) nety.push('старой страницы нет — шапка и история из записи дня, остального нет');
  const sekciya = (id) => h.match(new RegExp(`<section[^>]*\\sid="${id}"[^>]*>([\\s\\S]*?)</section>`))?.[1];
  const klass = (s, k, teg = 'div') => s?.match(new RegExp(`<${teg}[^>]*class="${k}"[^>]*>([\\s\\S]*?)</${teg}>`))?.[1];
  const h2 = (s) => s?.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1];
  const abzacy = (s) => [...(s ?? '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => vnutri(m[1])).filter(Boolean);

  // window.MUSEUM_* — JS-литералы старой страницы: исполняются в пустой песочнице, без document.
  const okno = {};
  for (const [, kod] of h.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    if (!/window\.MUSEUM_/.test(kod)) continue;
    try { vm.runInNewContext(kod, { window: okno }); } catch { /* скрипт с document — не литерал, пропуск */ }
  }
  const quizKod = h.match(/const quiz=\[([\s\S]*?)\n\];/)?.[1];
  const voprosy = quizKod ? vm.runInNewContext(`[${quizKod}]`) : okno.MUSEUM_QUIZ?.items ?? [];

  const [, mm, dd] = den.match(/^(\d\d)-(\d\d)$/), d = +dd, mes = +mm - 1;
  const h1 = tekst(h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]) || j.title || '';
  const chip = tekst(klass(h, 'date-chip'));
  const god = chip.match(/\b(\d{3,4})\b/)?.[1];
  const opisanie = ent(h.match(/<meta property="og:description" content="([^"]*)"/)?.[1] ?? '') || j.hook || '';
  if (!h1) nety.push('h1 (и title записи дня)');
  if (!opisanie) nety.push('og:description (и hook записи дня)');
  const url = `${SAYT}/muzei/ne-sdayutsya/den/${den}/`, title = `${h1} — «Русские не сдаются» — Русская цивилизация`;
  const og = `${SAYT}/og/og-default.jpg`;

  const karta = {};
  karta.head = {
    title, description: opisanie, canonical: url, sobytie: j.title ?? h1, ...(god ? { god } : {}),
    og: { type: 'article', site_name: 'Русская цивилизация', title, description: opisanie, url, image: og },
    ld: { '@context': 'https://schema.org', '@type': 'Article', headline: `${h1} — «Русские не сдаются»`, description: opisanie, url, image: og,
      inLanguage: 'ru-RU', isAccessibleForFree: true, publisher: { '@type': 'Organization', name: 'Русская цивилизация', url: `${SAYT}/` } },
  };
  if (!god) nety.push('год события (date-chip)');

  // Кадры: материал дня главнее записи дня (там адрес, права, alt); запись — подпись и credit Госкаталога.
  const mat = material(den);
  const izZapisi = (src) => {
    const z = j.images?.find((i) => put(i.src) === src);
    const credit = z?.credit ?? '', data_source = credit.match(URL_)?.[0];
    if (!z || !data_source) return null;
    return { src, alt: z.caption ?? '', data_source, license: credit.match(/Права:\s*(.+?)\.?$/)?.[1] ?? LITSENZIYA,
      podpis: `${(z.caption ?? '').replace(/\.$/, '')}.`, credit: credit.split(/\s*Источник:/)[0].trim(), est: fs.existsSync(path.join(KOREN, 'public', src)) };
  };
  const kadrPo = (src) => mat.kadry.find((k) => k.src === src) ?? izZapisi(src);

  const geroy = h.match(/<img[^>]*class="st-scene[^"]*"[^>]*>/)?.[0];
  // Пометка «(обложка)» в материале главнее кадра героя старой страницы: обложку выбирает редактор дня (Р513).
  let obl = kadrKartochki(mat.kadry.find((k) => k.oblozhka && kadrKartochki(k)));
  if (!obl && geroy) {
    const src = atr(geroy, 'src'), m = kadrPo(src);
    obl = m && kadrKartochki({ ...m, alt: m.alt || ent(atr(geroy, 'alt') ?? ''), width: atr(geroy, 'width') ?? m.width, height: atr(geroy, 'height') ?? m.height });
    if (!obl) nety.push(`обложка ${src} (кадр героя старой страницы): ни в материале, ни в записи дня нет адреса источника или подписи`);
  }
  if (!obl) {
    // Метки «(обложка)» нет — старый кадр дня (пометка «старый»), иначе «Кадр 1» материала; так и пишется в nety.
    let m = mat.kadry.find((k) => k.oblozhka && kadrKartochki(k));
    const negodnaya = mat.kadry.find((k) => k.oblozhka && !kadrKartochki(k));
    if (negodnaya) nety.push(`обложка ${negodnaya.src} (в материале «обложка»): нет адреса источника, подписи, alt или файла${m ? ` — взята другая «обложка» ${m.src}` : ''}`);
    if (!m) {
      m = mat.kadry.find((k) => k.staryy && kadrKartochki(k)) ?? mat.kadry.find((k) => kadrKartochki(k));
      if (m) nety.push(`обложка: в материале нет кадра «(обложка)» — взят ${m.staryy ? 'старый кадр дня' : 'первый годный кадр'} ${m.src}`);
    }
    obl = m && kadrKartochki(m);
    if (!obl) nety.push('обложка: на старой странице нет кадра героя, в материале нет годного кадра');
  }
  if (obl && !obl.width) { nety.push(`обложка ${obl.src}: размер не известен`); obl = null; }
  if (obl) karta.oblozhka = { ...obl, hint: tekst(klass(h, 'st-src', 'span')) || chip || h1, celikom: true };

  karta.kroshka = `День ${d} · ${h1}`;
  karta.lead = { data: `День ${d} · ${MES[mes]}${chip ? ` · ${chip}` : ''}`,
    privyazka: `Дата условная: ${d} ${MES_R[mes]} — ${d}-й день музея${chip ? `; событие — ${chip}` : ''}.`,
    kto: vnutri(klass(h, 'who')), h1, hook: tekst(h.match(/<p class="hook">([\s\S]*?)<\/p>/)?.[1]) || j.hook || '' };
  if (!karta.lead.kto) nety.push('кто (div.who)');
  karta.stamp = [...(klass(h, 'stamp') ? h.matchAll(/<div class="v">([\s\S]*?)<\/div><div class="k">([\s\S]*?)<\/div>/g) : [])]
    .map((m) => ({ v: tekst(m[1]), k: tekst(m[2]) }));
  if (!karta.stamp.length) nety.push('штамп (div.stamp)');

  const vid = sekciya('video');
  const video = vid && vid.match(/<video[^>]*>/)?.[0];
  const rolik = !video && rolikIzReestra(dd, mes);
  const ids = [...h.matchAll(/<section[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
  const istId = ISTORIYA.find((id) => ids.includes(id)) ?? ids.find((id) => !SLUZHEBNYE.includes(id));
  const ist = istId && sekciya(istId);
  const kal = sekciya('calendar');
  // Звук не переписать машиной: аудиогид, который вслух зовёт «игру» (Р436), не переносится — переписать и перезаписать.
  const agStaryy = okno.MUSEUM_AUDIOGUIDE, agIgra = agStaryy && JSON.stringify(agStaryy).match(IGRA);
  const ag = agIgra ? null : agStaryy;
  if (agIgra) nety.push(`audioguide — в тексте звука «${agIgra[0]}» (Р436): нужен новый текст и новая запись`);
  karta.daynav = [(video || rolik) && { id: 'video', label: 'Видео' }, { id: 'story', label: 'Читать' }, ag && { id: 'audioguide', label: 'Слушать' },
    { id: 'fakty', label: 'Факты' }, voprosy.length && { id: 'quiz', label: 'Викторина' }, kal && { id: 'calendar', label: 'Календарь' }].filter(Boolean);
  // Пути ролика на старой странице — от папки музея; на адресе /den/ММ-ДД/ относительные сломаются.
  const ot = (u) => (u && !/^(\/|https?:)/.test(u) ? `/muzei/ne-sdayutsya/${u}` : u);
  if (video) {
    const klyuch = atr(video, 'data-rc-video'), format = atr(video, 'data-rc-format') ?? 'horizontal', p = abzacy(vid);
    karta.video = { h2: tekst(h2(vid)), klyuch, format, pole: `${klyuch}:${format}.sec`, suffix: 'сек',
      badge: tekst(vid.match(/<\/h2>\s*<span[^>]*>([\s\S]*?)<\/span>/)?.[1]) || 'ролик', intro: tekst(p[0]),
      poster: ot(atr(video, 'poster')), mp4: ot(atr(vid.match(/<source[^>]*>/)?.[0], 'src')), note: tekst(p.at(-1)) };
  } else if (rolik) {
    karta.video = rolik;
    nety.push(`video — ролика на старой странице нет, взят выпуск реестра ${rolik.klyuch}`);
  } else nety.push('video (ролика нет ни на старой странице, ни в реестре public/video/registry.json)');

  if (ist) karta.story = { kicker: tekst(klass(ist, 'kicker')) || 'Подвиг', h2: tekst(h2(ist)) || h1, abzacy: abzacy(ist) };
  else if (j.gist) karta.story = { kicker: 'Подвиг', h2: h1, abzacy: [j.gist] };
  else karta.story = { kicker: 'Подвиг', h2: h1, abzacy: [] };
  if (!ist) nety.push(`история (#${ISTORIYA.join('/#')}) — ${j.gist ? 'взят gist записи дня' : 'пусто'}`);
  else if (istId !== 'istoriya') nety.push(`история — из раздела #${istId} (#istoriya нет)`);

  if (ag) karta.audioguide = Object.fromEntries(['audioSrc', 'durationLabel', 'lead', 'stops', 'transcript', 'note'].map((k) => [k, ag[k]]));
  else if (!agIgra) nety.push('audioguide (MUSEUM_AUDIOGUIDE)');
  karta.razdely = [];
  const vybrosheno = ids.filter((id) => id !== istId && !SLUZHEBNYE.includes(id));
  if (vybrosheno.length) nety.push(`выброшено (в шаблоне нет; визуализацию дня — перенести человеку, Р436): ${vybrosheno.join(', ')}`);

  if (voprosy.length) {
    karta.quiz = { kicker: `Проверь себя · ${voprosy.length} вопросов`, h2: 'Викторина', intro: 'На каждый вопрос — одна попытка. После ответа покажем объяснение.',
      noscript: `Для викторины нужен JavaScript. Ответы: ${voprosy.map((v, i) => `${i + 1} — ${v.o[v.c]}`).join('; ')}.`, ball: 10,
      voprosy: voprosy.map((v) => ({ q: v.q, o: v.o, a: v.c, e: v.e })) };
    karta.result = { h2: 'Итог дня', intro: 'Викторина даёт баллы. Прогресс не сохраняется: перезагрузка страницы начинает день заново.',
      zvanie: `0 / ${voprosy.length * 10} · звание: Гость дня`, note: 'Ответь на вопросы викторины.' };
  } else nety.push('викторина (const quiz и MUSEUM_QUIZ)');
  if (kal) karta.kalendar = { kicker: tekst(klass(kal, 'kicker')) || 'Календарь подвига', h2: tekst(h2(kal)), intro: tekst(abzacy(kal)[0]) };
  else nety.push('календарь (#calendar)');

  // figures — все кадры материала и записи дня, кроме обложки, без повторов; кадры «к факту» ставит машина фактов.
  const vse = [...mat.kadry, ...(j.images ?? []).map((i) => put(i.src)).filter((s) => !mat.kadry.some((k) => k.src === s)).map(izZapisi).filter(Boolean)];
  const vidno = new Set([karta.oblozhka?.src]);
  karta.figures = [];
  for (const m of vse) {
    if (vidno.has(m.src)) continue;
    const k = kadrKartochki(m);
    if (!k) { nety.push(`кадр ${m.src}: ${!m.est ? 'файла нет в public' : 'нет адреса источника, подписи или alt'}`); continue; }
    if (m.altIzPodpisi) nety.push(`кадр ${m.src}: alt в материале нет — взята подпись`);
    vidno.add(m.src); karta.figures.push(k);
  }
  if (!karta.figures.length) nety.push('кадры (figures): ни в материале, ни в записи дня');

  karta.sources = [...(sekciya('sources-rights') ?? '').matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => ({ html: vnutri(m[1]) }));
  if (!karta.sources.length) nety.push('источники (#sources-rights) — машина фактов соберёт из утверждённых');
  karta.kuda = [...h.matchAll(/<div class="ncard( main)?"><span class="lbl">([\s\S]*?)<\/span><a href="([^"]+)">([\s\S]*?)<\/a><br>([\s\S]*?)<\/div>/g)]
    .filter((m) => !m[3].startsWith('../')) // «Город-музей» — у r602 тоже не переносится
    .map((m) => ({ lbl: tekst(m[2]), href: m[3], title: tekst(m[4]).replace(/\s*→$/, ''), hook: tekst(m[5]), main: !!m[1] }));
  karta.score = { awards: { q: [voprosy.length, 10] }, ranks: [[0, 'Гость дня']] };
  const ch = okno.MUSEUM_CHROME;
  if (ch) { const { museum, city, ...ost } = ch; karta.chrome = { ...ost, random: ost.random ?? [] }; } else nety.push('chrome (MUSEUM_CHROME)');
  const vozvrat = okno.MUSEUM_RETURN;
  if (vozvrat) karta.return = { q: vozvrat.q, a: vozvrat.a, ...(vozvrat.src ? { src: vozvrat.src } : {}) };
  else if (voprosy.length) { karta.return = { q: voprosy[0].q, a: voprosy[0].o[voprosy[0].c] }; nety.push('MUSEUM_RETURN — вопрос возврата из первого вопроса викторины'); }
  else nety.push('вопрос возврата (MUSEUM_RETURN и викторины нет)');
  karta.proof = { status: 'ne_utverzhdeno', note: 'Карточка собрана машиной из старой страницы; факты — утверждённые Сергеем, цитаты и кадры — из материала дня, остальное перенесено со старой страницы без правки.' };
  return { ...karta, nety };
}

// ── --proba: все старые страницы НС; день прошёл, если разбор не упал и есть история и викторина. ──
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv.includes('--proba')) {
  const STARYE = path.join(KOREN, 'src/data/full-pages/ne-sdayutsya'), ZAPISI = path.join(KOREN, 'src/content/days/ne-sdayutsya');
  const dni = fs.readdirSync(STARYE).filter((f) => /^\d\d-\d\d\.html$/.test(f)).map((f) => f.slice(0, 5)).sort();
  let ok = 0;
  for (const den of dni) {
    const z = path.join(ZAPISI, `${den}.json`);
    try {
      const r = razobrat(fs.readFileSync(path.join(STARYE, `${den}.html`), 'utf8'), fs.existsSync(z) ? JSON.parse(fs.readFileSync(z, 'utf8')) : null, den);
      const proshel = r.story.abzacy.length > 0 && (r.quiz?.voprosy.length ?? 0) > 0;
      if (proshel) ok++;
      console.log(`${den}: ${proshel ? 'да' : 'НЕТ'} — история ${r.story.abzacy.length} абз., вопросов ${r.quiz?.voprosy.length ?? 0}, кадров ${r.figures.length}${r.oblozhka ? ' + обложка' : ''}`);
      for (const s of r.nety) console.log(`    нет: ${s}`);
    } catch (e) { console.log(`${den}: НЕТ — упал: ${e.message}`); }
  }
  console.log(`итог: ${ok} из ${dni.length}`);
  process.exit(ok === dni.length ? 0 : 2);
}
