// Сверка по снимкам экрана после правки шаблона (п. 84 очереди 1, Р716/Р717) — ПОДСКАЗЧИК Агента.
// Снимает одни и те же страницы дней в двух местах — «было» (A, по умолчанию живой сайт = main)
// и «стало» (B, сборка ветки), на ПК и телефоне; попиксельно сравнивает (pixelmatch, как
// Playwright toHaveScreenshot), кладёт картинки разницы в папку и пишет отчёт «где сдвинулось».
// Ничего не останавливает: код выхода всегда 0, страниц не правит, в сборку и CI не встраивается.
//
// Запуск (shot подставляет библиотеки Chromium):
//   shot ~/rc-site/tools/snimki-sverka.mjs --b dist:<папка dist ветки>        # A = живой сайт
//   shot ~/rc-site/tools/snimki-sverka.mjs --a dist:<dist main> --b dist:<dist ветки>
//   shot ~/rc-site/tools/snimki-sverka.mjs --a <URL> --b <URL> --stranicy /muzei/x/den/01-10/,…
//   --vyhod <папка>   куда класть снимки и отчёт (по умолчанию /tmp/snimki-sverka)
//   --porog 0.1       порог цвета пикселя pixelmatch (0…1)
// dist:<папка> — свой мини-сервер; чего нет в папке (копия без public/: картинки, звук),
// берётся с живого сайта, так что расходятся только файлы самой сборки.
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const SHOT = process.env.SHOT_DIR || path.join(os.homedir(), 'tools/shot');
const req = createRequire(path.join(SHOT, 'package.json'));
const { chromium } = req('playwright');
// pngjs и pixelmatch лежат внутри playwright-core (поле exports их не отдаёт — берём по пути файла).
const PWC = path.join(SHOT, 'node_modules/playwright-core/lib');
const { PNG } = req(path.join(PWC, 'utilsBundle.js'));
const pixelmatch = req(path.join(PWC, 'third_party/pixelmatch.js'));

const ZHIVOY = 'https://russian-civilization.ru';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const A = arg('--a', ZHIVOY), B = arg('--b');
const VYHOD = arg('--vyhod', '/tmp/snimki-sverka');
const POROG = +arg('--porog', '0.1');
// По три дня двух музеев — январь, над которым работаем.
const STRANICY = arg('--stranicy', [
  '/muzei/izobreteniya/den/01-10/', '/muzei/izobreteniya/den/01-11/', '/muzei/izobreteniya/den/01-12/',
  '/muzei/kalendar-pobed/den/01-10/', '/muzei/kalendar-pobed/den/01-11/', '/muzei/kalendar-pobed/den/01-12/',
].join(',')).split(',').filter(Boolean);
const EKRANY = { pk: { width: 1440, height: 900 }, telefon: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } };

if (!B) { console.log('Нужно --b (dist:<папка> или URL). Ничего не сделано.'); process.exit(0); }

const TIPY = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml' };
// Мини-сервер папки dist: нет файла — сервер сам берёт его с живого сайта и отдаёт с того же адреса
// (переадресация 302 ломала подгрузку данных скриптами страницы: чужой адрес, CORS).
const server = (dir) => new Promise((ok) => {
  const s = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    let f = path.join(dir, p);
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
    if (f.startsWith(path.resolve(dir)) && fs.existsSync(f)) {
      r.writeHead(200, { 'content-type': TIPY[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(r);
    } else fetch(ZHIVOY + q.url).then(async (o) => {
      r.writeHead(o.status, { 'content-type': o.headers.get('content-type') || 'application/octet-stream' });
      r.end(Buffer.from(await o.arrayBuffer()));
    }).catch(() => { r.writeHead(502); r.end(); });
  }).listen(0, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${s.address().port}`, s }));
});
const otkryt = async (x) => x.startsWith('dist:') ? server(path.resolve(x.slice(5))) : { url: x.replace(/\/$/, '') };

const [sa, sb] = [await otkryt(A), await otkryt(B)];
fs.mkdirSync(VYHOD, { recursive: true });
const brauzer = await chromium.launch();

// Снимок всей страницы без анимаций + положения заголовков, чтобы назвать место сдвига словами.
async function snyat(baza, stranica, ekran, fayl) {
  const ctx = await brauzer.newContext({ viewport: { width: ekran.width, height: ekran.height }, ...ekran, reducedMotion: 'reduce' });
  const pg = await ctx.newPage();
  try {
    const otv = await pg.goto(baza + stranica, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => pg.goto(baza + stranica, { waitUntil: 'load', timeout: 60000 }));
    if (!otv || otv.status() >= 400) return { oshibka: `ответ ${otv ? otv.status() : 'нет'}` };
    await pg.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
    await pg.evaluate(() => document.fonts && document.fonts.ready);
    await pg.waitForTimeout(800);
    const metki = await pg.evaluate(() => [...document.querySelectorAll('h1,h2,h3,header,footer,section[id],nav')]
      .map((e) => ({ y: Math.round(e.getBoundingClientRect().top + scrollY), t: (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + ' «' + (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40) + '»') }))
      .sort((a, b) => a.y - b.y));
    await pg.screenshot({ path: fayl, fullPage: true, animations: 'disabled' });
    return { metki };
  } catch (e) { return { oshibka: e.message.split('\n')[0] }; } finally { await ctx.close(); }
}

// Дотянуть снимок до общего размера белым, чтобы сравнить страницы разной высоты.
const dotyanut = (png, w, h) => {
  const o = new PNG({ width: w, height: h }); o.data.fill(255);
  PNG.bitblt(png, o, 0, 0, png.width, png.height, 0, 0); return o;
};
// Полосы строк, где есть отличия (склеиваем строки ближе 20 px).
const polosy = (diff, w, h) => {
  const est = []; for (let y = 0; y < h; y++) { let n = 0; for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (diff.data[i] === 255 && diff.data[i + 1] === 0) n++; } if (n) est.push(y); }
  const p = []; for (const y of est) { const l = p[p.length - 1]; if (l && y - l[1] <= 20) l[1] = y; else p.push([y, y]); } return p;
};
const gde = (metki, y) => { let m = null; for (const k of metki || []) { if (k.y <= y + 5) m = k; else break; } return m ? `под ${m.t} (y=${m.y})` : 'в начале страницы'; };

const stroki = [], itog = [];
for (const stranica of STRANICY) for (const [imya, ekran] of Object.entries(EKRANY)) {
  const klyuch = stranica.replace(/^\/|\/$/g, '').replace(/[\/]/g, '_') + '__' + imya;
  const fa = path.join(VYHOD, klyuch + '__bylo.png'), fb = path.join(VYHOD, klyuch + '__stalo.png'), fd = path.join(VYHOD, klyuch + '__raznica.png');
  const [ra, rb] = [await snyat(sa.url, stranica, ekran, fa), await snyat(sb.url, stranica, ekran, fb)];
  if (ra.oshibka || rb.oshibka) { stroki.push(`- ${stranica} · ${imya}: не снято (было: ${ra.oshibka || 'ок'}, стало: ${rb.oshibka || 'ок'})`); continue; }
  const [pa, pb] = [PNG.sync.read(fs.readFileSync(fa)), PNG.sync.read(fs.readFileSync(fb))];
  const w = Math.max(pa.width, pb.width), h = Math.max(pa.height, pb.height);
  const [da, db] = [dotyanut(pa, w, h), dotyanut(pb, w, h)];
  const diff = new PNG({ width: w, height: h });
  const n = pixelmatch(da.data, db.data, diff.data, w, h, { threshold: POROG, alpha: 0.2, diffColor: [255, 0, 0], aaColor: [255, 255, 0] });
  const dolya = (100 * n / (w * h));
  const vys = pa.height === pb.height ? `высота ${pa.height}` : `высота ${pa.height} → ${pb.height} (${pb.height - pa.height > 0 ? '+' : ''}${pb.height - pa.height} px)`;
  itog.push({ stranica, imya, n, dolya });
  if (!n) { fs.rmSync(fd, { force: true }); stroki.push(`- ${stranica} · ${imya}: без изменений, ${vys}`); continue; }
  fs.writeFileSync(fd, PNG.sync.write(diff));
  const ps = polosy(diff, w, h);
  const pervye = ps.slice(0, 3).map(([y0, y1]) => `y ${y0}–${y1} ${gde(ra.metki, y0)}`).join('; ');
  stroki.push(`- ${stranica} · ${imya}: отличается ${n} пикс. (${dolya.toFixed(2)} %), ${vys}; полос ${ps.length}, первые: ${pervye}\n  разница: ${fd}`);
}
await brauzer.close();
for (const s of [sa, sb]) s.s && s.s.close();

const izm = itog.filter((x) => x.n).length;
const otchet = `# Сверка по снимкам: было ${A} → стало ${B}\n\n` +
  `Снято пар: ${itog.length} из ${STRANICY.length * 2}; с изменениями: ${izm}. Порог пикселя ${POROG}.\n` +
  `Подсказка, не приговор (Р716/Р717): смотреть картинки разницы глазами (красное — отличие, жёлтое — сглаживание).\n\n` +
  stroki.join('\n') + '\n';
fs.writeFileSync(path.join(VYHOD, 'otchet.md'), otchet);
console.log(otchet + `\nОтчёт: ${path.join(VYHOD, 'otchet.md')}`);
process.exit(0);
