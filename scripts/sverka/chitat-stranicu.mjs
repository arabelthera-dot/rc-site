// Чтение страницы дня любого музея — для сверщика «страница = утверждённая карточка» на всех 12 музеях (Р511).
// chitatStranicu(muzey, key) → { istochnik, format, fakty: [{ zagolovok, podrobnee, kadr, kadry }], oblozhka, galereya: [kadr],
//   vse_kadry: [{ gde, kadr, src }] } или null, если страницы нет. kadr — устойчивый id кадра:
//   номер Госкаталога («12931201»), «camo:<номер>» для ссылки на «Память народа» (ЦАМО), иначе имя файла («merkuriy-1848.jpg»).
// Два входа:
//  1) YAML шаблона src/content/dni-shablon/<музей>/ММ-ДД.yaml (izobreteniya, ne-sdayutsya) — если есть, он и есть страница:
//     факты — все fakty[].udary[] подряд (как в scripts/sverka-utverzhdeno.mjs), заголовок — <b> в summary, кадр — udar.kadr;
//     обложка — oblozhka; галерея — figures и kadry.
//  2) Старая готовая страница src/data/full-pages/<музей>/ММ-ДД.html. Форматы фактов (таблица FORMATY ниже, выведена
//     обзором всех страниц 04.11.2026; где какой — в --proba):
//     «удары»        ol.udary > li, заголовок — <b> в summary, кадр — картинка внутри li (izobreteniya 01-06…01-29);
//     «сетка фактов» .fact / .fact-grid > article / #facts > p|article (arhitektura, karikatura, kalendar-pobed);
//     «моменты»      article.moment (literatura), article.mom (sport);
//     «подробности»  details в разделе #momenty и article.chapter (pervoprohodcy);
//     «трудно поверить» div.q в разделах «трудно поверить» и «картина и художник» (iskusstvo, ne-sdayutsya);
//     «раздел фактов» — любой раздел, чей заголовок или надзаголовок про факты/подробности, — его повторяющиеся
//                      дочерние блоки с заголовком (страховка для новых раскладок).
//     Обложка — первая картинка шапки (.hero*, .cover, #hero, #top), иначе og:image; галерея — все прочие картинки
//     страницы (кроме обложки и кадров фактов), по одной на кадр.
// Модуль ни к чему не подключён (Р511, часть «чтение страниц»); сверщик подключит его сам.
// Запуск: node scripts/sverka/chitat-stranicu.mjs --proba [музей]  — прогон по всем страницам, счёт по музеям;
//         node scripts/sverka/chitat-stranicu.mjs <музей> <ММ-ДД>    — разбор одной страницы (JSON).
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { razobrat, obhod, elementy, chistyj, klassy } from './derevo.mjs';
import { faktyIzUtverzhdeno } from '../../src/lib/fakty-iz-utverzhdeno.mjs';

const KOREN = new URL('../..', import.meta.url).pathname;
const SHABLON = 'src/content/dni-shablon';
const FULL = 'src/data/full-pages';

// ——— устойчивый id кадра ———
export function idKadra(src = '', istochnik = '') {
  const s = `${istochnik} ${src}`;
  const gk = s.match(/goskatalog\.ru\/portal\/#\/collections\?id=(\d+)/)?.[1] || s.match(/(?:gk|goskatalog)[-_](\d{5,})/)?.[1];
  if (gk) return gk;
  // ЦАМО: номер документа «Памяти народа»; без ссылки — имя файла (01-03-camo-58-977531-39-l780.jpg), как в карточке
  const camo = s.match(/pamyat-naroda\.ru\/[^\s"]*?(\d{5,})/)?.[1];
  if (camo) return `camo:${camo}`;
  const fajl = String(src).split(/[?#]/)[0].split('/').pop();
  return fajl || '';
}

// ——— вход 1: YAML шаблона ———
export function izYaml(y) {
  const kd = (k) => (k && (k.src || k.data_source) ? idKadra(k.src, k.data_source) : '');
  const fakty = [];
  for (const blok of y.fakty || []) for (const u of blok.udary || []) {
    const sum = String(u.summary ?? '');
    const zagolovok = chistka(sum.match(/<b>([\s\S]*?)<\/b>/)?.[1] ?? sum);
    const kadry = [u.kadr].flat().filter(Boolean).map(kd).filter(Boolean);
    fakty.push({ zagolovok, podrobnee: chistka([sum.replace(/<b>[\s\S]*?<\/b>/, ''), ...[u.det].flat()].filter(Boolean).join(' ')), kadr: kadry[0] || '', kadry });
  }
  const vse = [];
  const oblozhka = kd(y.oblozhka);
  if (oblozhka) vse.push({ gde: 'обложка', kadr: oblozhka, src: y.oblozhka.src || '' });
  fakty.forEach((f, i) => f.kadry.forEach((k) => vse.push({ gde: `факт ${i + 1}`, kadr: k, src: '' })));
  const galereya = [];
  for (const k of [y.figures, y.kadry].flat().filter((x) => x?.src)) { galereya.push(kd(k)); vse.push({ gde: 'галерея', kadr: kd(k), src: k.src }); }
  // прочие картинки записи (story, quiz, poster…) — в vse_kadry с именем поля
  const uchteno = new Set([y.oblozhka, y.figures, y.kadry].flat().filter(Boolean));
  for (const u of y.fakty || []) for (const ud of u.udary || []) [ud.kadr].flat().forEach((k) => uchteno.add(k));
  const projti = (o, gde) => {
    if (!o || typeof o !== 'object' || uchteno.has(o)) return;
    if (Array.isArray(o)) return o.forEach((x) => projti(x, gde));
    for (const pole of ['src', 'poster']) if (typeof o[pole] === 'string' && KARTINKA.test(o[pole])) vse.push({ gde, kadr: idKadra(o[pole], o.data_source), src: o[pole] });
    for (const v of Object.values(o)) projti(v, gde);
  };
  for (const [k, v] of Object.entries(y)) if (!['head', 'chrome', 'oblozhka', 'figures', 'kadry'].includes(k)) projti(v, k);
  return { istochnik: 'yaml', format: 'шаблон', fakty, oblozhka, galereya, vse_kadry: vse };
}
const KARTINKA = /\.(jpe?g|png|webp|avif|gif)(\?|$)/i;
const chistka = (t) => String(t ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// ——— вход 2: HTML готовой страницы ———
const est = (u, k) => klassy(u).includes(k);
const vVerh = (u, f) => { for (let p = u.roditel; p && p.tag !== '#root'; p = p.roditel) if (f(p)) return p; return null; };
const razdel = (u) => vVerh(u, (p) => p.tag === 'section') || vVerh(u, (p) => p.at.id);
// Заголовок факта: первый h2–h5 / .t / <b> / summary внутри блока (у удара — <b> в summary).
function zagolovokBloka(e) {
  for (const u of obhod(e)) if (/^h[2-5]$/.test(u.tag) || est(u, 't') || est(u, 'fact-title') || est(u, 'mom-title')) return chistyj(u);
  // шок-цифра календаря побед: .fact > .v (число) + .l (подпись)
  for (const u of elementy(e)) if (est(u, 'v')) return chistyj(u);
  for (const u of obhod(e)) if (u.tag === 'b' || u.tag === 'strong') return chistyj(u);
  for (const u of obhod(e)) if (u.tag === 'summary' || u.tag === 'dt') return chistyj(u);
  return '';
}
// Подпись раздела: h2 + надзаголовок (.kicker, .eyebrow).
const podpisRazdela = (s) => {
  const a = [];
  for (const u of obhod(s)) { if (u.tag === 'h2' || est(u, 'kicker') || est(u, 'eyebrow')) a.push(chistyj(u)); if (a.length >= 3) break; }
  return a.join(' · ');
};
const PRO_FAKTY = /факт|подробност|трудно поверить|не может быть|удивительн|моменты/i;
const NE_FAKTY = /викторин|вопрос|источник|календар|игра|как играть|продолжить|музей продолжается|итог/i;

// Формат: имя, отбор блоков-фактов (в порядке страницы), отказ для вложенных.
const FORMATY = [
  ['удары', (u) => u.tag === 'li' && est(u.roditel, 'udary')],
  ['сетка фактов', (u) => (est(u, 'fact') && !/^(span|b|i|em)$/.test(u.tag))
    || (u.tag === 'article' && (est(u.roditel, 'fact-grid') || est(u.roditel, 'factgrid') || est(u.roditel, 'facts')))
    || (/^(p|article)$/.test(u.tag) && u.roditel && vVerh(u, (p) => p.at.id === 'facts') && est(u.roditel, 'narrow') && zagolovokBloka(u))],
  ['моменты', (u) => u.tag === 'article' && (est(u, 'moment') || est(u, 'mom'))],
  ['подробности', (u) => (u.tag === 'details' && vVerh(u, (p) => p.at.id === 'momenty') && !vVerh(u, (p) => p.tag === 'details'))
    || (u.tag === 'article' && est(u, 'chapter'))],
  ['трудно поверить', (u) => u.tag === 'div' && est(u, 'q') && vVerh(u, (p) => /trudno-poverit|kartina-i-hudozhnik/.test(p.at.id || ''))],
];
const sig = (u) => `${u.tag}.${klassy(u)[0] || ''}`;
function razdelFaktov(d) {
  // Повторяющиеся (≥3) дочерние блоки с заголовком в разделе, чья подпись — про факты.
  const out = [];
  for (const s of obhod(d)) {
    if (s.tag !== 'section') continue;
    const p = podpisRazdela(s);
    if (!PRO_FAKTY.test(p) || NE_FAKTY.test(p)) continue;
    for (const u of obhod(s)) {
      const c = new Map();
      for (const e of elementy(u)) if (!/^(h\d|span|b|i|em|strong|a|br|img|button|script|style|svg)$/.test(e.tag) && !est(e, 'kicker') && !est(e, 'eyebrow')) c.set(sig(e), [...(c.get(sig(e)) || []), e]);
      for (const a of c.values()) if (a.length >= 3 && a.filter(zagolovokBloka).length >= 3) out.push(...a);
    }
  }
  return out;
}
const kartinki = (u) => {
  const a = [];
  const add = (src, ist, e) => { if (src && !/\.svg(\?|$)|^data:|logo|icon|favicon/i.test(src)) a.push({ src, ist: ist || '', e }); };
  for (const e of [u, ...obhod(u)]) {
    if (e.tag === 'img') add(e.at.src || e.at['data-src'], e.at['data-source'] || vVerh(e, (p) => p.at['data-source'])?.at['data-source'], e);
    if (e.tag === 'video' && e.at.poster) add(e.at.poster, e.at['data-source'], e);
    const bg = (e.at?.style || '').match(/url\(['"]?([^'")#]+)['"]?\)/)?.[1];
    if (bg) add(bg, e.at['data-source'], e);
  }
  return a;
};
const SHAPKA = (p) => /^(hero|top|cover|oblozhka)$/.test(p.at.id || '') || klassy(p).some((k) => /^(hero|cover|hero-scene|hero-fig|hero-img|oblozhka)/.test(k));

export function izHtml(html) {
  const d = razobrat(html);
  const body = [...obhod(d)].find((u) => u.tag === 'body') || d;
  // факты: все форматы таблицы, в порядке страницы, без вложенных друг в друга
  const vybor = new Set(); const formaty = new Set();
  for (const u of obhod(body)) for (const [imya, f] of FORMATY) if (f(u)) { vybor.add(u); formaty.add(imya); break; }
  if (vybor.size < 10) { const r = razdelFaktov(body); if (r.length) { r.forEach((u) => vybor.add(u)); formaty.add('раздел фактов'); } }
  const bloki = [...obhod(body)].filter((u) => vybor.has(u) && !vVerh(u, (p) => vybor.has(p)));
  const fakty = bloki.map((b) => {
    const kadry = [...new Set(kartinki(b).map((k) => idKadra(k.src, k.ist)).filter(Boolean))];
    // «<em>Факт 1</em>Могли остаться» → «Могли остаться» (ne-sdayutsya)
    const zagolovok = zagolovokBloka(b).replace(/^Факт\s*\d+\s*/, '').replace(/[.:]\s*$/, '');
    return { zagolovok, podrobnee: chistyj(b).replace(zagolovokBloka(b), '').trim(), kadr: kadry[0] || '', kadry, razdel: razdel(b)?.at.id || '' };
  });
  // кадры страницы
  const vse = []; const bylo = new Set();
  const vFakte = new Map(); bloki.forEach((b, i) => kartinki(b).forEach((k) => vFakte.set(k.e, i)));
  let oblozhka = '';
  for (const k of kartinki(body)) {
    const id = idKadra(k.src, k.ist); if (!id) continue;
    if (vFakte.has(k.e)) { vse.push({ gde: `факт ${vFakte.get(k.e) + 1}`, kadr: id, src: k.src }); continue; }
    if (!oblozhka && (SHAPKA(k.e) || vVerh(k.e, SHAPKA))) { oblozhka = id; vse.push({ gde: 'обложка', kadr: id, src: k.src }); continue; }
    vse.push({ gde: 'галерея', kadr: id, src: k.src });
  }
  if (!oblozhka) {
    const og = [...obhod(d)].find((u) => u.tag === 'meta' && u.at.property === 'og:image')?.at.content;
    if (og) { oblozhka = idKadra(og); vse.unshift({ gde: 'обложка', kadr: oblozhka, src: og }); }
  }
  const galereya = [];
  bylo.add(oblozhka); for (const f of fakty) f.kadry.forEach((k) => bylo.add(k));
  for (const k of vse) if (k.gde === 'галерея' && !bylo.has(k.kadr)) { bylo.add(k.kadr); galereya.push(k.kadr); }
  // Страница без списка фактов: статья (#articleBody — izobreteniya, pervoprohodcy) или маршрут-игра (arhitektura, skazki).
  const bezFaktov = [...obhod(body)].some((u) => u.at.id === 'articleBody' || est(u, 'body') && u.tag === 'div' && vVerh(u, (p) => p.tag === 'article')) ? 'статья' : 'без фактов';
  return { istochnik: 'html', format: [...formaty].join(' + ') || bezFaktov, fakty, oblozhka, galereya, vse_kadry: vse };
}

export function chitatStranicu(muzey, key, koren = KOREN) {
  const y = path.join(koren, SHABLON, muzey, `${key}.yaml`);
  if (fs.existsSync(y)) return izYaml(faktyIzUtverzhdeno(YAML.parse(fs.readFileSync(y, 'utf8')), muzey, key, koren).syroe);
  const h = path.join(koren, FULL, muzey, `${key}.html`);
  if (fs.existsSync(h)) return izHtml(fs.readFileSync(h, 'utf8'));
  return null;
}

// Все страницы музея: ключи YAML шаблона и full-pages (YAML главнее — он и стоит по адресу дня).
export function stranicyMuzeya(muzey, koren = KOREN) {
  const k = new Set();
  for (const [dir, ext] of [[SHABLON, '.yaml'], [FULL, '.html']]) {
    const p = path.join(koren, dir, muzey);
    if (fs.existsSync(p)) for (const f of fs.readdirSync(p)) if (f.endsWith(ext) && /^\d\d-\d\d\./.test(f)) k.add(f.slice(0, 5));
  }
  return [...k].sort();
}
export const muzei = (koren = KOREN) => fs.readdirSync(path.join(koren, 'src/data')).map((f) => f.match(/^calendar-meta-(.+)\.json$/)?.[1]).filter(Boolean).sort();
// Прочитано полностью: фактов не меньше 10 и у каждого есть заголовок.
export const polnostyu = (s) => !!s && s.fakty.length >= 10 && s.fakty.every((f) => f.zagolovok);

function proba(tolko) {
  const itog = []; let vsego = 0; let ok = 0;
  for (const m of muzei()) {
    if (tolko && m !== tolko) continue;
    const kl = stranicyMuzeya(m); let pr = 0; const formaty = new Map(); const plohie = [];
    for (const k of kl) {
      let s; try { s = chitatStranicu(m, k); } catch (e) { plohie.push(`${k}: ошибка ${e.message}`); continue; }
      const f = `${s.istochnik}:${s.format}`; formaty.set(f, (formaty.get(f) || 0) + 1);
      if (polnostyu(s)) pr++;
      else plohie.push(`${k} [${f}] фактов ${s.fakty.length}${s.fakty.some((x) => !x.zagolovok) ? ', без заголовка ' + s.fakty.filter((x) => !x.zagolovok).length : ''}`);
    }
    vsego += kl.length; ok += pr;
    itog.push({ m, n: kl.length, pr, formaty, plohie });
  }
  for (const { m, n, pr, formaty, plohie } of itog) {
    console.log(`${m.padEnd(18)} страниц ${String(n).padStart(3)}  прочитано полностью ${String(pr).padStart(3)}  ${[...formaty].map(([f, c]) => `${f}×${c}`).join(', ')}`);
    if (process.argv.includes('--podrobno')) for (const p of plohie) console.log(`    ${p}`);
  }
  console.log(`ВСЕГО: страниц ${vsego}, прочитано полностью ${ok}, не полностью ${vsego - ok}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const a = process.argv.slice(2).filter((x) => !x.startsWith('--'));
  if (process.argv.includes('--proba')) proba(a[0]);
  else if (a.length === 2) console.log(JSON.stringify(chitatStranicu(a[0], a[1]), null, 1));
  else { console.error('Запуск: node scripts/sverka/chitat-stranicu.mjs --proba [музей] [--podrobno] | <музей> <ММ-ДД>'); process.exit(2); }
}
