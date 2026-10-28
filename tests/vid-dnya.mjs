#!/usr/bin/env node
// Сторож вида дня музея изобретений (Р303, r370): каждая собранная страница dist/muzei/izobreteniya/den/ММ-ДД/index.html
// (кроме самого эталона 01-13 и копий staraya) сверяется с собранным эталоном 13 января:
//  (а) упорядоченный набор общих стилей — встроенный базовый <style> 13-го ≡ izobreteniya-den.css; css игры дня
//      (igra.css карточки src/content/dni-shablon; у 13-го — k278-kilometr) и общесайтовые файлы конвейера (rc-*.css,
//      <style data-…>) не сравниваются; всё прочее должно совпасть в том же порядке — лишний css (свой css дня) — ошибка;
//  (б) порядок главных блоков: блоки верхнего уровня страницы 13-го (дети <body>/<main>), у дня отфильтрованные по этому
//      списку, — те же, все и в том же порядке.
// Списки стилей и блоков берутся из собранного 01-13, не из кода. Исключений нет. Расхождение — exit 1.
// Запуск: node tests/vid-dnya.mjs [dist]
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
const attr = (tag, a) => (tag.match(new RegExp(`\\s${a}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i')) ?? []).slice(1).find((x) => x !== undefined);

// Разбор: стили по порядку и элементы верхнего уровня (дети body, а если конвейер обернул в <main> — дети main).
function razbor(html) {
  const stili = [], bloki = [];
  const re = /<!--[\s\S]*?-->|<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>|<\/?([a-zA-Z][\w-]*)\b[^>]*>/g;
  const stek = [];
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith('<!--')) continue;
    if (m[1]) {
      if (m[1].toLowerCase() === 'style') stili.push({ style: m[2].trim(), css: m[3] });
      continue;
    }
    const tag = m[4].toLowerCase(), close = m[0].startsWith('</');
    if (close) { const i = stek.lastIndexOf(tag); if (i >= 0) stek.length = i; continue; }
    if (tag === 'link' && /rel\s*=\s*["']?stylesheet/i.test(m[0])) stili.push({ href: attr(m[0], 'href') });
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
  return { stili, bloki };
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

const read = (k) => fs.readFileSync(path.join(DEN, k, 'index.html'), 'utf8');
if (!fs.existsSync(path.join(DEN, ETALON, 'index.html'))) { console.error(`vid-dnya: нет собранного эталона ${DEN}/${ETALON}/index.html — сначала npm run build`); process.exit(1); }
const e = razbor(read(ETALON));
const baza13 = norm(e.stili.find((s) => s.style === '')?.css ?? '');
const stili13 = obshchieStili(e.stili, null, IGRA_13);
const bloki13 = e.bloki;
const nabor13 = new Set(bloki13);
if (!stili13.includes(BAZA) || bloki13.length < 5) { console.error('vid-dnya: эталон 01-13 разобрать не удалось (нет базового <style> или блоков)'); process.exit(1); }

const igraDnya = (k) => {
  const f = path.join(KARTOCHKI, `${k}.yaml`);
  if (!fs.existsSync(f)) return [];
  const d = YAML.parse(fs.readFileSync(f, 'utf8'));
  return d.adres === 'den' ? (d.igra?.css ?? []).map((c) => `${c}.css`) : [];
};

const dni = fs.readdirSync(DEN).filter((k) => /^\d\d-\d\d$/.test(k) && k !== ETALON && fs.existsSync(path.join(DEN, k, 'index.html'))).sort();
const oshibki = [];
for (const k of dni) {
  const r = razbor(read(k));
  const st = obshchieStili(r.stili, baza13, igraDnya(k));
  const chto = [];
  if (st.join(' → ') !== stili13.join(' → ')) {
    const lishnie = st.filter((f) => !stili13.includes(f)), net = stili13.filter((f) => !st.includes(f));
    chto.push(`стили: ${st.join(' → ') || '(нет)'}; нужно как у 13-го: ${stili13.join(' → ')}` +
      `${lishnie.length ? `; лишнее: ${lishnie.join(', ')}` : ''}${net.length ? `; нет: ${net.join(', ')}` : ''}`);
  }
  const bl = r.bloki.filter((b) => nabor13.has(b));
  if (bl.join(' ') !== bloki13.join(' ')) {
    const net = bloki13.filter((b) => !bl.includes(b));
    chto.push(`блоки: ${net.length ? `нет ${net.join(', ')}; ` : ''}порядок ${bl.join(' ')} — нужно ${bloki13.join(' ')}`);
  }
  if (chto.length) oshibki.push(`  ${k}: ${chto.join('\n         ')}`);
}
console.log(`vid-dnya: эталон 01-13 — стили ${stili13.join(' → ')}; блоки ${bloki13.join(' ')}`);
if (oshibki.length) {
  console.error(`vid-dnya: не в виде 13 января — ${oshibki.length} из ${dni.length} дней:\n${oshibki.join('\n')}`);
  process.exit(1);
}
console.log(`vid-dnya: все ${dni.length} дней в виде 13 января`);
