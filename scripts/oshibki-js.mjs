// Замок «ошибок JS на странице дня нет» (задание Джарвиса r253, 24.10.2026). Корень: сборка переписывает
// href="#…" и внутри строк инлайн-скриптов ('<a href="#'+id+'">' → '/muzei/…/den/ММ-ДД/#id'), а syncProgress
// карикатуры 01-03 делал querySelector(a.getAttribute('href')) — на каждой прокрутке SyntaxError, 260 ошибок
// в консоли, а проверки заявки молчали: glazami мягкая и страницу не листает.
// Проверка: каждая полная страница дня (src/data/full-pages/<музей>/<ММ-ДД>.html) из сборки — телефон 390×844,
// загрузка и прокрутка до низа; любая неперехваченная ошибка JS (pageerror) или console.error не про загрузку
// файла — брак, код 1. --proba: подложенная страница с той же ошибкой обязана дать брак.
// Запуск: node scripts/oshibki-js.mjs [--dist dist] [--proba]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
const pw = await import(process.env.PW || 'playwright'); const chromium = pw.chromium || pw.default.chromium;

const argv = process.argv.slice(2), i = argv.indexOf('--dist'), PROBA = argv.includes('--proba');
const ROOT = path.resolve(i >= 0 ? argv[i + 1] : 'dist'), POTOKOV = 4;
const PROBA_HTML = `<!doctype html><meta charset="utf-8"><div id="acts"><a href="/muzei/x/den/01-01/#hero">1</a></div>
<div style="height:3000px" id="hero"></div><script>addEventListener('scroll',()=>document.querySelector(
document.querySelector('#acts a').getAttribute('href')))</script>`;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/__proba/') { res.writeHead(200, { 'content-type': MIME['.html'] }); return res.end(PROBA_HTML); }
  let f = path.join(ROOT, u);
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const SITE = `http://127.0.0.1:${server.address().port}`;

let adresa;
if (PROBA) adresa = ['/__proba/'];
else {
  const FP = 'src/data/full-pages';
  adresa = fs.readdirSync(FP).flatMap(m => fs.readdirSync(path.join(FP, m)).filter(f => /^\d\d-\d\d\.html$/.test(f))
    .map(f => `/muzei/${m}/den/${f.slice(0, 5)}/`)).sort();
  const net = adresa.filter(a => !fs.existsSync(path.join(ROOT, a, 'index.html')));
  if (net.length) { console.log(`БРАК: полной страницы нет в сборке (${net.length}): ${net.join(' ')}`); process.exitCode = 1; }
  adresa = adresa.filter(a => !net.includes(a));
}

const browser = await chromium.launch();
const brak = [];
async function proverit(a) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(), osh = [];
  p.on('pageerror', e => osh.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) osh.push(m.text()); });
  // Наружу из проверки не ходим: внешние запросы (счётчик, карты) обрываются, их отказ — не ошибка страницы.
  await p.route(u => !u.href.startsWith(SITE), rt => rt.abort());
  try { await p.goto(SITE + a, { waitUntil: 'load', timeout: 30000 }); } catch (e) { osh.push('не открылась: ' + e.message); }
  await p.waitForTimeout(500);
  for (let n = 0; n < 80; n++) {
    const konec = await p.evaluate(() => { scrollBy(0, innerHeight * 0.8); return innerHeight + scrollY >= document.documentElement.scrollHeight - 2; }).catch(() => true);
    await p.waitForTimeout(60);
    if (konec) break;
  }
  await p.waitForTimeout(300);
  await ctx.close();
  if (osh.length) brak.push(a);
  console.log(`${a} — ${osh.length ? `БРАК: ошибок JS ${osh.length}: ${[...new Set(osh)].slice(0, 2).join(' | ')}` : 'ок'}`);
}
const ochered = [...adresa];
await Promise.all(Array.from({ length: POTOKOV }, async () => { while (ochered.length) await proverit(ochered.shift()); }));
await browser.close(); server.close();

if (PROBA) {
  if (brak.length) console.log('Проба: подложенная ошибка syncProgress поймана — замок работает.');
  else { console.log('Проба ПРОВАЛЕНА: подложенная ошибка JS не поймана.'); process.exitCode = 1; }
} else {
  console.log(`\nСтраниц ${adresa.length}, с ошибками JS ${brak.length}.`);
  if (brak.length) process.exitCode = 1;
}
