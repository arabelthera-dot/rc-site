// Сторож «День по дате» от задвоения (баг 19.10.2026: повторное нажатие «Показать дни» давало 24 строки вместо 12).
// Открывает главную локальной сборки, жмёт кнопку трижды подряд без ожидания + меняет дату (change),
// ждёт ответы и сверяет: строк в списке ровно столько, сколько карточек в segodnya/<ММ-ДД>.json, заметка одна.
// Запуск: node scripts/po-date-dubl.mjs --dist dist   (нужен playwright; PW=<путь> — свой экземпляр)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
const pw = await import(process.env.PW || 'playwright'); const chromium = pw.chromium || pw.default.chromium;

const argv = process.argv.slice(2), opt = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
const ROOT = path.resolve(opt.dist || 'dist'), BASE = '/rc-site/';
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]);
  if (!u.startsWith(BASE)) { r.writeHead(404); return r.end(); }
  let f = path.join(ROOT, u.slice(BASE.length));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  // Задержка ответа, чтобы запросы гарантированно пересекались, как на медленной связи.
  setTimeout(() => { r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); },
    f.endsWith('.json') ? 150 : 0);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const SITE = `http://127.0.0.1:${server.address().port}${BASE}`;

const browser = await chromium.launch();
let fail = 0;
try {
  const page = await browser.newPage();
  await page.goto(SITE, { waitUntil: 'load' });
  for (const date of ['2026-10-19', '2026-01-05']) {
    const key = date.slice(5);
    const want = JSON.parse(fs.readFileSync(path.join(ROOT, 'segodnya', key + '.json'), 'utf8')).cards?.length || 0;
    await page.fill('#p-dpd-in', date);
    await page.dispatchEvent('#p-dpd-in', 'change');
    for (let i = 0; i < 3; i++) await page.click('.p-dpd__btn--go');
    await page.waitForTimeout(1200);
    const got = await page.$$eval('#po-date .p-dpd__list li', (x) => x.length);
    const notes = await page.$$eval('#po-date .p-dpd__note', (x) => x.length);
    const lists = await page.$$eval('#po-date .p-dpd__list', (x) => x.length);
    const ok = got === want && notes === 1 && lists <= 1;
    if (!ok) fail++;
    console.log(`${ok ? 'OK ' : 'ПРОВАЛ'} ${key}: строк ${got} (ждём ${want}), заметок ${notes}, списков ${lists}`);
  }
} finally { await browser.close(); server.close(); }
if (fail) { console.error(`po-date-dubl: провалов ${fail}`); process.exit(1); }
console.log('po-date-dubl: задвоения нет');
