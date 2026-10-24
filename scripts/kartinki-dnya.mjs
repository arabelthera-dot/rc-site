// Замок картинок дня (Р231, Сергей 24.10.2026: «И фото сверху, и фото, либо картинки обязательные в тексте»).
// Каждая страница дня, изменённая в заявке, в собранном dist открывается в браузере и должна иметь:
//   1) обложку — figure.hero-fig с загруженной картинкой (naturalWidth > 0);
//   2) хотя бы одну загруженную картинку в тексте — вне обложки, вне игры и вне навигации (календарь, «Куда дальше», каталог);
//   3) ни одной видимой картинки без src или битой. Картинки внутри игры не в счёт: игра заполняет их сама (в финале).
// Изменённые дни — git diff с базой: src/data/full-pages/<музей>/ММ-ДД.html и карточки src/content/days/<музей>/ММ-ДД.json
// (карточка — только если у дня есть полная страница: дни без полной страницы — пустые, замок их не касается).
// Нарушение — код 1 и ::error:: по-русски: какой день, чего нет. Откат — удалить шаг из .github/workflows/proverka.yml.
// Запуск: node scripts/kartinki-dnya.mjs [--dist dist] [--baza origin/main] [--proba]
//         node scripts/kartinki-dnya.mjs --vse [--muzei izobreteniya,...] — таблица по всем полным страницам музеев, без падения.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
const pw = await import(process.env.PW || 'playwright'); const chromium = pw.chromium || pw.default.chromium;

const FULL = 'src/data/full-pages';
const DAYS = 'src/content/days';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const est = (k) => process.argv.includes(k);
const DIST = arg('--dist', 'dist');

// Где картинка не считается «в тексте» и не проверяется на пустой src: игра (заполняет кадры сама) и навигация.
const IGRA = ['#games', '[id^="game"]', '[id$="-game"]', '[id^="igra"]', '[data-game]', '[data-game-section]',
  '[data-igra-scena]', '.igra-blok', '.igra-ruka-zona', '[class*="-igra"]', '[class^="igra"]'].join(',');
const NAVIGACIYA = ['header.site-header', 'nav', 'footer', '#calendar', '#kuda-dalshe', '.kd', '#catalog'].join(',');

function server(root) {
  const ROOT = path.resolve(root);
  const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg' };
  const s = http.createServer((req, res) => {
    let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch {}
    fs.readFile(f, (err, buf) => {
      if (err) { res.writeHead(404); return res.end('404'); }
      res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
      res.end(buf);
    });
  });
  return new Promise((r) => s.listen(0, '127.0.0.1', () => r(s)));
}

// Что не так с картинками открытой страницы: [] — всё на месте; плюс счёт для таблицы.
async function proverit(page, url) {
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  // Ленивые картинки — грузить сразу и прокрутить страницу, чтобы сработали наблюдатели.
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
    window.scrollTo(0, 0);
    const imgs = [...document.images].filter((i) => i.getAttribute('src'));
    await Promise.race([
      Promise.all(imgs.map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))),
      new Promise((r) => setTimeout(r, 15000)),
    ]);
  });
  return page.evaluate(({ IGRA, NAVIGACIYA }) => {
    const vidna = (el) => {
      const cs = getComputedStyle(el);
      return el.getClientRects().length > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
    };
    const imya = (i) => (i.getAttribute('src') || '').split('/').pop() || i.alt?.slice(0, 40) || i.className || 'img';
    const zagruzhena = (i) => i.getAttribute('src') && i.complete && i.naturalWidth > 0;
    const o = [];
    const hero = document.querySelector('figure.hero-fig');
    const heroImg = hero && hero.querySelector('img');
    let oblozhka = 'нет';
    if (!hero) o.push('нет обложки — figure.hero-fig');
    else if (!heroImg) o.push('в обложке figure.hero-fig нет картинки');
    else if (!zagruzhena(heroImg)) o.push(`картинка обложки не загрузилась (${imya(heroImg)})`);
    else oblozhka = 'да';
    let vTekste = 0;
    const bitye = [];
    for (const i of document.querySelectorAll('img')) {
      if (i.closest(IGRA)) continue;
      const vObl = hero && hero.contains(i);
      if (vidna(i) && !zagruzhena(i)) bitye.push(i.getAttribute('src') ? `битая ${imya(i)}` : `без src: ${imya(i)}`);
      if (!vObl && !i.closest(NAVIGACIYA) && zagruzhena(i) && i.naturalWidth >= 100) vTekste++;
    }
    if (!vTekste) o.push('нет ни одной загруженной картинки в тексте (вне обложки и игры)');
    if (bitye.length) o.push(`видимые картинки не загрузились: ${bitye.join(', ')}`);
    return { o, oblozhka, vTekste, bitye: bitye.length };
  }, { IGRA, NAVIGACIYA });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
async function prognat(root, dni) {
  const s = await server(root);
  const base = `http://127.0.0.1:${s.address().port}`;
  const itog = [];
  for (const d of dni) {
    const f = path.join(root, d.adres, 'index.html');
    if (!fs.existsSync(f)) { itog.push({ ...d, o: [`страницы нет в сборке (${d.adres})`], oblozhka: '—', vTekste: 0, bitye: 0 }); continue; }
    try { itog.push({ ...d, ...(await proverit(page, base + d.adres)) }); }
    catch (e) { itog.push({ ...d, o: [`страница не открылась: ${e.message.split('\n')[0]}`], oblozhka: '—', vTekste: 0, bitye: 0 }); }
  }
  s.close();
  return itog;
}
const den = (muzey, key) => ({ muzey, key, adres: `/muzei/${muzey}/den/${key}/` });

if (est('--proba')) {
  // Заведомые страницы: замок пропускает хорошую и ловит каждый брак.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kartinki-proba-'));
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100"/></svg>';
  const hero = '<figure class="hero-fig"><img src="a.svg"></figure>';
  const tekst = '<p>Текст</p><figure><img src="b.svg"></figure>';
  const proba = [
    ['всё на месте', hero + tekst, 0],
    ['кадр игры без src — не в счёт', hero + tekst + '<section id="games"><img class="final"></section>', 0],
    ['нет обложки', tekst, 1],
    ['битая обложка', '<figure class="hero-fig"><img src="net.svg"></figure>' + tekst, 1],
    ['нет картинки в тексте', hero + '<p>Сухой текст</p>', 1],
    ['в тексте только игра', hero + '<section id="games"><img src="b.svg"></section>', 1],
    ['в тексте только «Куда дальше»', hero + '<section class="block kd" id="kuda-dalshe"><img src="b.svg"></section>', 1],
    ['битая картинка в тексте', hero + tekst + '<img src="net.jpg">', 1],
    ['видимая картинка без src', hero + tekst + '<img alt="пусто">', 1],
  ];
  const dni = proba.map(([, html], n) => {
    const d = den('proba', String(n).padStart(2, '0'));
    fs.mkdirSync(path.join(tmp, d.adres), { recursive: true });
    fs.writeFileSync(path.join(tmp, d.adres, 'index.html'), `<!doctype html><meta charset="utf-8"><body>${html}</body>`);
    fs.writeFileSync(path.join(tmp, d.adres, 'a.svg'), svg);
    fs.writeFileSync(path.join(tmp, d.adres, 'b.svg'), svg);
    return d;
  });
  const itog = await prognat(tmp, dni);
  let mimo = 0;
  itog.forEach((r, n) => {
    const [imya, , zhdu] = proba[n];
    const ok = (r.o.length > 0 ? 1 : 0) === zhdu;
    if (!ok) mimo++;
    console.log(`${ok ? 'ок ' : 'МИМО'} ${imya}: ${r.o.join('; ') || 'чисто'}`);
  });
  fs.rmSync(tmp, { recursive: true, force: true });
  await browser.close();
  if (mimo) { console.log(`::error::kartinki-dnya: проба мимо — ${mimo} из ${proba.length}`); process.exit(1); }
  console.log(`kartinki-dnya: проба ${proba.length} из ${proba.length}`);
  process.exit(0);
}

let dni;
if (est('--vse')) {
  const muzei = arg('--muzei', '') ? arg('--muzei').split(',') : fs.readdirSync(FULL);
  dni = muzei.flatMap((m) => fs.readdirSync(path.join(FULL, m)).filter((f) => /^\d\d-\d\d\.html$/.test(f)).sort()
    .map((f) => den(m, f.slice(0, 5))));
} else {
  const baza = arg('--baza', process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/main');
  let izm;
  try {
    izm = execFileSync('git', ['diff', '--name-only', '--diff-filter=AMR', `${baza}...HEAD`, '--', FULL, DAYS], { encoding: 'utf8' })
      .split('\n').filter(Boolean);
  } catch {
    console.log(`::error::kartinki-dnya: нет базы ${baza} — изменённые дни не определить`);
    process.exit(1);
  }
  const vse = new Map();
  for (const f of izm) {
    const m = /^src\/(?:data\/full-pages|content\/days)\/([\w-]+)\/(\d\d-\d\d)\.(html|json)$/.exec(f);
    if (!m || !fs.existsSync(path.join(FULL, m[1], `${m[2]}.html`))) continue;
    vse.set(`${m[1]}/${m[2]}`, den(m[1], m[2]));
  }
  dni = [...vse.values()];
  if (!dni.length) { console.log('kartinki-dnya: в заявке нет изменённых страниц дней — проверять нечего'); await browser.close(); process.exit(0); }
}

const itog = await prognat(DIST, dni);
await browser.close();
const proshli = itog.filter((r) => !r.o.length);
const stroki = ['| день | обложка | картинок в тексте | битые | итог |', '|---|---|---|---|---|',
  ...itog.map((r) => `| ${r.muzey} ${r.key} | ${r.oblozhka} | ${r.vTekste} | ${r.bitye} | ${r.o.length ? 'КРАСНЫЙ: ' + r.o.join('; ') : 'зелёный'} |`)];
const otchet = `### Картинки дня (Р231): прошли ${proshli.length} из ${itog.length}\n\n${stroki.join('\n')}\n`;
console.log(otchet);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, otchet + '\n');
if (est('--vse')) process.exit(0);
for (const r of itog.filter((x) => x.o.length)) console.log(`::error::День ${r.muzey} ${r.key}: ${r.o.join('; ')}`);
process.exit(proshli.length === itog.length ? 0 : 1);
