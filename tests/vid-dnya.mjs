#!/usr/bin/env node
// Сторож вида дня музея изобретений (Р303, r370): каждая собранная страница dist/muzei/izobreteniya/den/ММ-ДД/index.html,
// которую нарисовал шаблон src/layouts/DenIzobreteniya.astro (метка шаблона <html data-shablon="den-izobreteniya">),
// сверяется с собранным эталоном 13 января. Старые HTML и анкеты (без метки) не проверяются — их перевод на шаблон
// отдельной задачей. Шаблонных страниц нет или меньше, чем карточек с adres: den, — тоже ошибка (не стать молча зелёным).
//  (а) упорядоченный набор общих стилей — встроенный базовый <style> 13-го ≡ izobreteniya-den.css; css игры дня
//      (только файл igra-<igra.imya>.css карточки; у 13-го — k278-kilometr) и общесайтовые файлы конвейера (rc-*.css,
//      <style data-…>) не сравниваются; всё прочее должно совпасть в том же порядке — лишний css (свой css дня) — ошибка;
//      в <body> нет ни одного <link rel=stylesheet>/<style>, которого нет в <body> у 13-го (разделы дня не тащат свой css);
//  (б) порядок главных блоков: блоки верхнего уровня страницы 13-го (дети <body>/<main>), у дня отфильтрованные по этому
//      списку, — те же, все и в том же порядке.
// Списки стилей и блоков берутся из собранного 01-13, не из кода. Исключений нет. Расхождение — exit 1.
// Запуск: node tests/vid-dnya.mjs [dist] [--pervyi]  (--pervyi — только отчёт замка «первый», см. ниже)
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const DIST = process.argv[2] ?? 'dist';
const DEN = path.join(DIST, 'muzei/izobreteniya/den');
const ETALON = '01-13';
// Игра 13-го нарисована старой страницей без карточки — её css называем здесь (единственное, чего нет в собранной странице).
const IGRA_13 = ['k278-kilometr.css'];
const BAZA = 'izobreteniya-den.css';
const KARTOCHKI = 'src/content/dni-shablon/izobreteniya';
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

const norm = (s) => s.replace(/\s+/g, ' ').trim();

// Замок «первый — только в мире» (Р342–Р343, r443/r445): «первый/впервые» на портале — только мировое первенство.
// Во всех собранных днях музеев, где заявлено первенство (muzei/*/den/ММ-ДД; костюмные пропускаются — первенства не
// заявляют), видимый текст без цитат в «ёлочках» ищется двумя образцами: (1) «первый … в России/СССР/Европе/на Урале/…»;
// (2) «первый в мире» и место через ≤6 слов («первый в мире алмаз в Якутии»). ТОЛЬКО ОТЧЁТ: предупреждение в логе
// со списком страниц и строк, код выхода не меняется, своя ошибка проверки сборку не роняет («Сторож»: косметика — отчёт).
// Откат — константа PERVYI_ZAMOK ниже: true → false (одна строка; локально то же даёт env PERVYI_ZAMOK=0).
// Только этот отчёт: node tests/vid-dnya.mjs dist --pervyi
const PERVYI_ZAMOK = true;
const SL = '[\\p{L}\\p{N}-]+', RAZD = '[\\s,;:—–]+';
const MESTO = '(?:в|на)\\s+(?:Росси|СССР|стран|Европ|импери|Сибир|Урал|Якути|Москв|Петербург|област|кра[ею]|город)';
const PERV = '(?<![\\p{L}\\p{N}])(?:перв\\p{L}*|впервые)';
const PERVYI = [
  new RegExp(`${PERV}(?:\\s+${SL}){0,2}\\s+${MESTO}`, 'giu'),
  new RegExp(`${PERV}(?:\\s+${SL}){0,2}\\s+в\\s+мире(?:${RAZD}${SL}){0,6}?${RAZD}${MESTO}`, 'giu'),
];
const tekst = (html) => html.replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1\s*>|<!--[\s\S]*?-->/gi, ' ')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const bezCitat = (t) => { let x = t, y; while ((y = x.replace(/«[^«»]*»/g, ' ')) !== x) x = y; return x; };
function pervyiZamok(dist) {
  const muzei = path.join(dist, 'muzei');
  const naydeno = [];
  let stranic = 0;
  for (const m of fs.readdirSync(muzei).filter((m) => !/kostyum/.test(m)).sort()) {
    const den = path.join(muzei, m, 'den');
    if (!fs.existsSync(den)) continue;
    for (const k of fs.readdirSync(den).filter((k) => /^\d\d-\d\d$/.test(k)).sort()) {
      const f = path.join(den, k, 'index.html');
      if (!fs.existsSync(f)) continue;
      stranic++;
      const t = bezCitat(tekst(fs.readFileSync(f, 'utf8')));
      const vidano = new Set();
      for (const re of PERVYI) for (const x of t.matchAll(re)) {
        const stroka = norm(t.slice(Math.max(0, x.index - 60), x.index + x[0].length + 40));
        if (![...vidano].some((v) => v.includes(x[0]))) { vidano.add(x[0]); naydeno.push(`  /muzei/${m}/den/${k}/: …${stroka}…`); }
      }
    }
  }
  if (naydeno.length) {
    console.log(`::warning title=pervyi-zamok::«первый» не в мировом смысле — ${naydeno.length} строк на ${new Set(naydeno.map((s) => s.split(':')[0])).size} страницах (из ${stranic}); список в логе шага. Только отчёт (Р342).`);
    console.log(`pervyi-zamok: ${naydeno.length} строк:\n${naydeno.join('\n')}`);
  } else console.log(`pervyi-zamok: страниц дней ${stranic}, «первый» не в мировом смысле — 0`);
}
if (PERVYI_ZAMOK && process.env.PERVYI_ZAMOK !== '0') {
  try { pervyiZamok(DIST); } catch (e) { console.log(`::warning title=pervyi-zamok::проверка не прошла (${e.message}) — сборку не роняет`); }
}
if (process.argv.includes('--pervyi')) process.exit(0);
const attr = (tag, a) => (tag.match(new RegExp(`\\s${a}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i')) ?? []).slice(1).find((x) => x !== undefined);

// Разбор: стили по порядку и элементы верхнего уровня (дети body, а если конвейер обернул в <main> — дети main).
function razbor(html) {
  const stili = [], bloki = [];
  let shablon;
  const re = /<!--[\s\S]*?-->|<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>|<\/?([a-zA-Z][\w-]*)\b[^>]*>/g;
  const stek = [];
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith('<!--')) continue;
    if (m[1]) {
      if (m[1].toLowerCase() === 'style') stili.push({ style: m[2].trim(), css: m[3], body: stek.includes('body') });
      continue;
    }
    const tag = m[4].toLowerCase(), close = m[0].startsWith('</');
    if (close) { const i = stek.lastIndexOf(tag); if (i >= 0) stek.length = i; continue; }
    if (tag === 'link' && /rel\s*=\s*["']?stylesheet/i.test(m[0])) stili.push({ href: attr(m[0], 'href'), body: stek.includes('body') });
    if (tag === 'html') shablon = attr(m[0], 'data-shablon');
    const roditel = stek.at(-1);
    if ((roditel === 'body' || roditel === 'main') && tag !== 'main' && !['noscript', 'template'].includes(tag)) {
      // Ключ блока: у <section> — id, у прочих — тег и первый класс (figure.hero-fig, nav.daynav, footer).
      // Общесайтовое, что конвейер добавляет всем страницам (id/класс rc-*), — не главный блок.
      const id = attr(m[0], 'id'), klass = (attr(m[0], 'class') ?? '').split(/\s+/).filter(Boolean);
      if (![id, ...klass].some((x) => x && x.startsWith('rc-')))
        bloki.push(tag === 'section' && id ? `#${id}` : klass.length ? `${tag}.${klass[0]}` : id ? `${tag}#${id}` : tag);
    }
    if (!VOID.has(tag) && !m[0].endsWith('/>')) stek.push(tag);
  }
  return { stili, bloki, shablon };
}

// Общие стили страницы: имена файлов без ?v=, базовый <style> — как izobreteniya-den.css (если совпадает с 13-м),
// без общесайтовых (rc-*, <style data-…>) и без css игры.
function obshchieStili(stili, baza13, igra) {
  const out = [];
  for (const s of stili) {
    if ('href' in s) {
      const f = path.basename(String(s.href ?? '').split(/[?#]/)[0]);
      if (/^rc-/.test(f) || igra.includes(f)) continue;
      out.push(f);
    } else if (s.style === '') out.push(baza13 === null || norm(s.css) === baza13 ? BAZA : '<style> своей страницы (не как у 13-го)');
  }
  return out;
}

// Стиль в <body> — ключом: файл без ?v= или <style> с его атрибутами.
const vTele = (stili) => stili.filter((s) => s.body).map((s) => ('href' in s ? path.basename(String(s.href ?? '').split(/[?#]/)[0]) : `<style ${s.style}>`));
const read = (k) => fs.readFileSync(path.join(DEN, k, 'index.html'), 'utf8');
if (!fs.existsSync(path.join(DEN, ETALON, 'index.html'))) { console.error(`vid-dnya: нет собранного эталона ${DEN}/${ETALON}/index.html — сначала npm run build`); process.exit(1); }
const e = razbor(read(ETALON));
const baza13 = norm(e.stili.find((s) => s.style === '')?.css ?? '');
const stili13 = obshchieStili(e.stili, null, IGRA_13);
const bloki13 = e.bloki;
const nabor13 = new Set(bloki13);
const telo13 = new Set(vTele(e.stili));
if (!stili13.includes(BAZA) || bloki13.length < 5) { console.error('vid-dnya: эталон 01-13 разобрать не удалось (нет базового <style> или блоков)'); process.exit(1); }

// Карточки шаблона на живом адресе (adres: den) и css их игры: из сравнения выпадает только igra-<igra.imya>.css.
const kartochki = fs.readdirSync(KARTOCHKI).filter((f) => f.endsWith('.yaml')).map((f) => YAML.parse(fs.readFileSync(path.join(KARTOCHKI, f), 'utf8'))).filter((d) => d.adres === 'den');
const igraDnya = (k) => { const d = kartochki.find((x) => x.key === k); return d ? [`igra-${d.igra.imya}.css`] : []; };

const vse = fs.readdirSync(DEN).filter((k) => /^\d\d-\d\d$/.test(k) && k !== ETALON && fs.existsSync(path.join(DEN, k, 'index.html'))).sort();
const razobrano = new Map(vse.map((k) => [k, razbor(read(k))]));
const dni = vse.filter((k) => razobrano.get(k).shablon === 'den-izobreteniya');
if (!dni.length || dni.length < kartochki.length) {
  const net = kartochki.map((d) => d.key).filter((k) => !dni.includes(k));
  console.error(`vid-dnya: шаблонных страниц (data-shablon="den-izobreteniya") в ${DEN} — ${dni.length}, а карточек с adres: den — ${kartochki.length}` +
    `${net.length ? `; нет страниц: ${net.join(', ')}` : ''}. Шаблон не ставит метку или страницы не собрались.`);
  process.exit(1);
}
console.log(`vid-dnya: карточек с adres: den — ${kartochki.length} (${kartochki.map((d) => d.key).join(', ')}); шаблонных страниц — ${dni.length} (${dni.join(', ')})`);
const MEDIA = ['#video', '#audioguide'];
const oshibki = [];
for (const k of dni) {
  const r = razobrano.get(k);
  const st = obshchieStili(r.stili, baza13, igraDnya(k));
  const chto = [];
  if (st.join(' → ') !== stili13.join(' → ')) {
    const lishnie = st.filter((f) => !stili13.includes(f)), net = stili13.filter((f) => !st.includes(f));
    chto.push(`стили: ${st.join(' → ') || '(нет)'}; нужно как у 13-го: ${stili13.join(' → ')}` +
      `${lishnie.length ? `; лишнее: ${lishnie.join(', ')}` : ''}${net.length ? `; нет: ${net.join(', ')}` : ''}`);
  }
  const bl = r.bloki.filter((b) => nabor13.has(b));
  // Ролика и аудиогида может не быть, пока их не сделали (недоделка дня, Р232; замок медиа — media-dnya): не ошибка вида,
  // но строка в выводе. Остальные блоки и порядок — строго как у 13-го.
  const bezMedia = MEDIA.filter((b) => bloki13.includes(b) && !bl.includes(b));
  if (bezMedia.length) console.log(`vid-dnya: ${k}: нет ${bezMedia.join(', ')} — недоделка (ролик/аудиогид), вид не нарушен`);
  const nuzhno = bloki13.filter((b) => !bezMedia.includes(b));
  if (bl.join(' ') !== nuzhno.join(' ')) {
    const net = nuzhno.filter((b) => !bl.includes(b));
    chto.push(`блоки: ${net.length ? `нет ${net.join(', ')}; ` : ''}порядок ${bl.join(' ')} — нужно ${nuzhno.join(' ')}`);
  }
  const chuzhie = vTele(r.stili).filter((x) => !telo13.has(x));
  if (chuzhie.length) chto.push(`в <body> стили, которых нет у 13-го: ${[...new Set(chuzhie)].join(', ')}`);
  if (chto.length) oshibki.push(`  ${k}: ${chto.join('\n         ')}`);
}
console.log(`vid-dnya: эталон 01-13 — стили ${stili13.join(' → ')}; блоки ${bloki13.join(' ')}`);
if (oshibki.length) {
  console.error(`vid-dnya: не в виде 13 января — ${oshibki.length} из ${dni.length} дней:\n${oshibki.join('\n')}`);
  process.exit(1);
}
console.log(`vid-dnya: все ${dni.length} шаблонных дней (${dni.join(', ')}) в виде 13 января; старые HTML и анкеты (${vse.length - dni.length}) не проверяются`);
