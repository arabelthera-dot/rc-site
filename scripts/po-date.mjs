// Сторож блока «Найти день по дате» (#po-date) на главной (брак сценариев посетителя 18.10.2026:
// список дней выводился дважды — 24 пункта вместо 12, на телефоне всегда). Корень был в гонке:
// change от выбора даты + submit кнопкой давали два fetch, и оба дописывали список.
// Проверка: медленная сеть (задержка 400 мс на segodnya/*.json), выбор даты + «Показать дни» —
// в блоке ровно один список и ни одной повторной ссылки. Ширины 390 и 1280. Код 1 при браке.
// Пропажа блока с главной — тоже брак (19.10.2026: раньше «пропуск» с кодом 0 прятал потерю сценария).
// Запуск: node scripts/po-date.mjs [--dist dist]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
const pw = await import(process.env.PW || 'playwright'); const chromium = pw.chromium || pw.default.chromium;

const i = process.argv.indexOf('--dist'), ROOT = path.resolve(i > 0 ? process.argv[i + 1] : 'dist'), BASE = '/';
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (!u.startsWith(BASE)) { res.writeHead(404); return res.end(); }
  let f = path.join(ROOT, u.slice(BASE.length));
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const SITE = `http://127.0.0.1:${server.address().port}${BASE}`;

const browser = await chromium.launch();
let brak = 0;
for (const w of [390, 1280]) {
  const mob = w < 500;
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, isMobile: mob, hasTouch: mob });
  const p = await ctx.newPage();
  await p.route('**/segodnya/*.json', async rt => { await new Promise(s => setTimeout(s, 400)); await rt.continue(); });
  await p.goto(SITE, { waitUntil: 'load' });
  if (!(await p.locator('#po-date').count())) { brak++; console.log(`${w}: БРАК: блока #po-date на главной нет`); await ctx.close(); continue; }
  await p.fill('#p-dpd-in', '2026-10-18');                       // change
  await p.locator('#po-date button[type=submit]').click();       // submit — второй вызов, пока первый в пути
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const b = document.getElementById('po-date'), hrefs = [...b.querySelectorAll('li a')].map(a => a.getAttribute('href'));
    return { lists: b.querySelectorAll('ul').length, items: hrefs.length, unique: new Set(hrefs).size, notes: b.querySelectorAll('.p-dpd__note').length };
  });
  const ok = r.lists <= 1 && r.items === r.unique && r.notes === 1;
  if (!ok) brak++;
  console.log(`${w}: списков ${r.lists}, пунктов ${r.items}, разных ${r.unique}, подписей ${r.notes} — ${ok ? 'ок' : 'БРАК: список задвоен'}`);
  // Дата в адресе (19.10.2026): выбор пишет ?d=ММ-ДД, а заход по ссылке с ?d= сразу показывает эту дату.
  const url = new URL(p.url()).searchParams.get('d');
  await p.goto(SITE + '?d=01-29', { waitUntil: 'load' }); await p.waitForTimeout(1200);
  const d = await p.evaluate(() => ({ v: document.getElementById('p-dpd-in').value, note: (document.querySelector('#po-date .p-dpd__note') || {}).textContent || '' }));
  const okD = url === '10-18' && d.v.endsWith('-01-29') && /29 января/.test(d.note);
  if (!okD) brak++;
  console.log(`${w}: адрес после выбора ?d=${url}, по ссылке ?d=01-29 — поле ${d.v}, «${d.note}» — ${okD ? 'ок' : 'БРАК: дата не в адресе'}`);
  // Календарь музея: ?d= открывает выбранный день, клик по дню пишет его в адрес.
  await p.goto(SITE + 'muzei/izobreteniya/calendar/?d=01-16', { waitUntil: 'load' });
  const c = await p.evaluate(() => { const on = document.querySelector('#calyear .cday.on'); return on ? on.dataset.k : null; });
  const other = await p.locator('#calyear .cday.full:not(.on)').first();
  const ok2k = await other.getAttribute('data-k'); await other.click();
  const cu = new URL(p.url()).searchParams.get('d');
  const okC = c === '01-16' && cu === ok2k;
  if (!okC) brak++;
  console.log(`${w}: календарь ?d=01-16 → выбран ${c}; клик ${ok2k} → ?d=${cu} — ${okC ? 'ок' : 'БРАК: день календаря не в адресе'}`);
  await ctx.close();
}
await browser.close(); server.close();
process.exit(brak ? 1 : 0);
