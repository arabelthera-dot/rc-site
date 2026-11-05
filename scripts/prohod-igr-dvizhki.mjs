// Проход игр января в движках iPhone (webkit) и firefox (Р204, Р205, Р545; наряд p544-f, 05.11.2026).
// Дополняет проходчик игр на chromium: тот же вопрос «проходится ли игра до финала», но в двух других движках
// браузеров, которыми открывают сайт (Safari и Telegram на iPhone — это webkit). Касания — средствами Playwright,
// одинаковыми для всех движков: tap — locator.tap (нужен hasTouch), «повернуть модель» — ведение указателем.
// Каждая игра — в новом контексте браузера (чистый лист, пустой кэш).
//
// Что считается финалом (по виду игры; вид определяется по разметке живой страницы):
//   модель (assets/igra-dnya.js, data-igra-dnya + data-glb) — 3D загрузилась (data-igra-rezhim="3d", #igdStage[data-gotovo]),
//     ведение пальцем по холсту меняет картинку, каждая часть модели (details[data-uzel]) открывается тапом и показывает факт;
//     ушла в запасную 2D — провал с причиной из data-igra-prichina;
//   rc3d (движок src/data/igry/rc3d) — «Играть», сцена готова, перебор выборов тапами и «Пуск», пока исход не «ok»;
//   развилка (.fork-opt) — тап по каждому варианту, после него виден #forkReal.
// Ошибка скрипта страницы, ошибка консоли или незагруженный файл своего сайта — провал.
//
// Сравнение снимков: снимок страницы (холсты закрыты маской — 3D крутится и каждый раз разный) против той же страницы
// на живом сайте. Это отчёт, а не шлюз: доля несовпавших точек и картинка разницы — в отчёте и артефакте.
//
// Запуск: node scripts/prohod-igr-dvizhki.mjs [--dist dist | --url https://…] [--dvizhki webkit,firefox]
//         [--sravni https://russian-civilization.ru | --sravni net] [--igry izobreteniya/01-30,ne-sdayutsya/01-01]
// Выход: /tmp/prohod-igr-dvizhki/otchet.md (+ сводка шага CI), снимки рядом; код выхода 1, если хоть одна игра не прошла.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { webkit, firefox, chromium, devices } from 'playwright';
import sharp from 'sharp';
import { estIgra } from './igra-pravila.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const DIST = path.resolve(arg('--dist', 'dist'));
const URL0 = arg('--url', '').replace(/\/$/, '');
const ZHIVOY = 'https://russian-civilization.ru';
const SRAVNI = arg('--sravni', URL0 ? 'net' : ZHIVOY).replace(/\/$/, '');
const DVIZHKI = arg('--dvizhki', 'webkit,firefox').split(',').filter(Boolean);
const OUT = '/tmp/prohod-igr-dvizhki';
// Только январь и только два музея (Р545, Р520).
const MUZEI = ['izobreteniya', 'ne-sdayutsya'];
const DNI = Array.from({ length: 31 }, (_, i) => `01-${String(i + 1).padStart(2, '0')}`);
const BRAUZER = { webkit, firefox, chromium };
// У firefox в Playwright нет isMobile — тот же экран и касания, что у iPhone 13, без мобильного режима.
const PROFIL = {
  webkit: devices['iPhone 13'],
  chromium: devices['iPhone 13'],
  firefox: { viewport: { width: 390, height: 664 }, hasTouch: true, deviceScaleFactor: 2 },
};

const TIPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg', '.mp4': 'video/mp4', '.webm': 'video/webm', '.wasm': 'application/wasm', '.txt': 'text/plain; charset=utf-8' };

function server(root) {
  const s = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.join(root, p);
    if (!f.startsWith(root)) { res.writeHead(403); res.end(); return; }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) { res.writeHead(404); res.end('нет'); return; }
    res.writeHead(200, { 'content-type': TIPY[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((ok) => s.listen(0, '127.0.0.1', () => ok(s)));
}

// ---------- какие игры ----------
async function spisok(baza) {
  const zadano = arg('--igry', '');
  const out = [];
  for (const m of MUZEI) for (const d of DNI) {
    const id = `${m}/${d}`;
    if (zadano && !zadano.split(',').includes(id)) continue;
    let html = '';
    if (!URL0) { const f = path.join(DIST, 'muzei', m, 'den', d, 'index.html'); if (fs.existsSync(f)) html = fs.readFileSync(f, 'utf8'); }
    else { const r = await fetch(`${baza}/muzei/${m}/den/${d}/`).catch(() => null); if (r?.ok) html = await r.text(); }
    if (!html || !estIgra(html)) continue;
    const vid = /data-igra-dnya[^>]*>\s*<div id="rc3d"|id="rc3d"/.test(html) ? 'rc3d'
      : /data-glb=/.test(html) ? 'model' : /class="fork-opt"/.test(html) ? 'razvilka' : 'neizvestno';
    out.push({ id, m, d, put: `/muzei/${m}/den/${d}/`, vid });
  }
  return out;
}

// ---------- проходы ----------
async function snimokHolsta(page, loc) { return (await loc.screenshot({ timeout: 60_000 }).catch(() => null)) || Buffer.alloc(0); }

const PROHOD = {
  async model(page, shag) {
    shag('жду 3D: data-igra-rezhim и #igdStage[data-gotovo]');
    await page.locator('[data-igra-dnya]').first().evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForFunction(() => document.documentElement.dataset.igraRezhim || document.querySelector('#igdStage[data-gotovo]'), null, { timeout: 30_000 });
    const rezhim = await page.evaluate(() => document.documentElement.dataset.igraRezhim || '');
    if (rezhim && rezhim !== '3d') {
      const prichina = await page.evaluate(() => document.documentElement.dataset.igraPrichina || '');
      throw new Error(`3D не запустилась, режим «${rezhim}», причина «${prichina || 'не указана'}»`);
    }
    await page.waitForSelector('#igdStage[data-gotovo]', { timeout: 30_000 });
    const holst = page.locator('#igdStage canvas').first();
    await holst.scrollIntoViewIfNeeded();
    shag('веду пальцем по модели — картинка должна повернуться');
    const b = await holst.boundingBox();
    if (!b) throw new Error('холст модели без размера');
    const do_ = await snimokHolsta(page, holst);
    const y = b.y + b.height / 2;
    await page.mouse.move(b.x + b.width * 0.3, y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) await page.mouse.move(b.x + b.width * (0.3 + 0.04 * i), y, { steps: 2 });
    await page.mouse.up();
    await page.waitForTimeout(600);
    const posle = await snimokHolsta(page, holst);
    if (!do_.length || do_.equals(posle)) throw new Error('после ведения пальцем картинка модели не изменилась');
    const chasti = page.locator('details[data-uzel]');
    const n = await chasti.count();
    for (let i = 0; i < n; i++) {
      const d = chasti.nth(i), s = d.locator('summary').first();
      const imya = (await s.innerText()).trim().slice(0, 40);
      shag(`открываю часть «${imya}»`);
      await s.scrollIntoViewIfNeeded();
      await s.tap();
      await page.waitForFunction((el) => el.open, await d.elementHandle(), { timeout: 3_000 }).catch(() => { throw new Error(`часть «${imya}» не открылась по тапу`); });
      const fakt = d.locator('p').first();
      if (!(await fakt.isVisible()) || !(await fakt.innerText()).trim()) throw new Error(`у части «${imya}» не виден факт`);
    }
    return `3D повернулась пальцем${n ? `, открыто частей: ${n} из ${n}` : ''}`;
  },

  async rc3d(page, shag) {
    shag('тап «Играть»');
    await page.locator('#rc3dRun').scrollIntoViewIfNeeded();
    await page.locator('#rc3dRun').tap();
    shag('жду сцену: data-sostoyanie="gotovo"');
    await page.waitForFunction(() => {
      // #rc3G — блок игры; #rc3Z (заставка) готов раньше сцены. Программный WebGL в CI грузит сцену до минуты.
      const b = document.querySelector('#rc3G[data-sostoyanie]');
      return b && b.dataset.sostoyanie !== 'gruzit' && (b.dataset.sostoyanie !== 'gotovo' || window.__rc3d?.ready);
    }, null, { timeout: 150_000 });
    const sost = await page.evaluate(() => document.querySelector('#rc3G[data-sostoyanie]')?.dataset.sostoyanie);
    if (sost !== 'gotovo') throw new Error(`сцена не готова: data-sostoyanie="${sost}"`);
    if (!(await page.evaluate(() => !!window.__rc3d?.g))) throw new Error('у сцены нет игры (нет блока выбора)');
    // Один пуск в программном WebGL CI идёт 2–5 минут — перебор всех сочетаний не уложится. Сочетания с исходом
    // «ok» по сценарию (та же сверка when, что в igrok.mjs) идут первыми: проход до финала — путь читателя к «Получилось».
    const kombinacii = await page.evaluate(() => {
      const G = window.__rc3d.sc?.igra || {};
      const ishod = (sel) => (G.outcomes || []).find((o) => Object.entries(o.when || {}).every(([k, v]) => v === '*' || (Array.isArray(v) ? v.includes(sel[k]) : sel[k] === v)));
      const vse = window.__rc3d.g.combos();
      return [...vse.filter((k) => ishod(k)?.result === 'ok'), ...vse.filter((k) => ishod(k)?.result !== 'ok')];
    });
    for (const [i, k] of kombinacii.entries()) {
      if (i) { shag('тап «Сначала»'); await page.locator('#gReset').tap(); }
      for (const [kl, v] of Object.entries(k)) {
        const seg = page.locator(`button.seg[data-k="${kl}"][data-v="${v}"]`);
        shag(`выбор: ${(await seg.innerText()).trim().slice(0, 40)}`);
        await seg.scrollIntoViewIfNeeded();
        await seg.tap();
      }
      shag('тап «Пуск», жду исход');
      await page.locator('#gGo').scrollIntoViewIfNeeded();
      await page.locator('#gGo').tap();
      // Сцена стоит на паузе, пока её холст за краем экрана (scena.mjs, IntersectionObserver) — смотрим на неё, как читатель.
      await page.evaluate(() => window.__rc3d.g.S.stage.scrollIntoView({ block: 'center' }));
      await page.waitForFunction(() => window.__rc3d.g.st().result, null, { timeout: 420_000 })
        .catch(() => { throw new Error('после «Пуск» нет исхода за 7 минут'); });
      if ((await page.evaluate(() => window.__rc3d.g.st().result)) === 'ok') return `исход «Получилось» на сочетании ${i + 1} из ${kombinacii.length}`;
    }
    throw new Error(`ни одно из ${kombinacii.length} сочетаний не дало исход «ok»`);
  },

  async razvilka(page, shag) {
    const v = page.locator('.fork-opt');
    const n = await v.count();
    if (!n) throw new Error('нет вариантов .fork-opt');
    for (let i = 0; i < n; i++) {
      shag(`тап по варианту ${i + 1} из ${n}`);
      await page.goto(page.url()); // каждый вариант — с чистого экрана: финал не должен быть виден до выбора
      if (await page.locator('#forkReal').isVisible()) throw new Error('ответ #forkReal виден до выбора');
      await v.nth(i).scrollIntoViewIfNeeded();
      await v.nth(i).tap();
      await page.locator('#forkReal').waitFor({ state: 'visible', timeout: 3_000 })
        .catch(() => { throw new Error(`после тапа по варианту ${i + 1} не появился ответ #forkReal`); });
    }
    return `все ${n} варианта ведут к ответу`;
  },

  async neizvestno() { throw new Error('вид игры не распознан — нужен свой проход'); },
};

// ---------- снимки ----------
async function snimokStranicy(page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  return page.screenshot({ fullPage: true, animations: 'disabled', mask: [page.locator('canvas, video, iframe')], timeout: 30_000 });
}

// Доля точек, где цвет отличается заметно (по любому каналу больше 40 из 255); высота сравнивается по меньшей.
async function raznica(a, b, kuda) {
  const [A, B] = await Promise.all([a, b].map((x) => sharp(x).ensureAlpha().raw().toBuffer({ resolveWithObject: true })));
  const w = Math.min(A.info.width, B.info.width), h = Math.min(A.info.height, B.info.height);
  const out = Buffer.alloc(w * h * 4);
  let raz = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ia = (y * A.info.width + x) * 4, ib = (y * B.info.width + x) * 4, io = (y * w + x) * 4;
    const d = Math.max(Math.abs(A.data[ia] - B.data[ib]), Math.abs(A.data[ia + 1] - B.data[ib + 1]), Math.abs(A.data[ia + 2] - B.data[ib + 2]));
    if (d > 40) { raz++; out[io] = 230; out[io + 1] = 0; out[io + 2] = 0; out[io + 3] = 255; }
    else { const g = (A.data[ia] + A.data[ia + 1] + A.data[ia + 2]) / 3; out[io] = out[io + 1] = out[io + 2] = 160 + g / 4; out[io + 3] = 255; }
  }
  await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toFile(kuda);
  return { dolya: raz / (w * h), vysota: [A.info.height, B.info.height] };
}

// ---------- один проход ----------
async function proiti(brauzer, dvizhok, baza, igra) {
  const ctx = await brauzer.newContext({ ...PROFIL[dvizhok], locale: 'ru-RU' });
  const page = await ctx.newPage();
  page.setDefaultTimeout(90_000); // тап при живом программном WebGL подтверждается секундами
  const svoy = new URL(baza).origin;
  const oshibki = [], log = [];
  page.on('pageerror', (e) => oshibki.push(`ошибка скрипта: ${e.message.slice(0, 200)}`));
  page.on('console', (m) => { if (m.type() === 'error' && (!m.location()?.url || m.location().url.startsWith(svoy))) oshibki.push(`консоль: ${m.text().slice(0, 200)}`); });
  page.on('requestfailed', (r) => { if (r.url().startsWith(svoy) && !/favicon/.test(r.url())) oshibki.push(`не загрузился ${r.url().replace(svoy, '')}: ${r.failure()?.errorText}`); });
  page.on('response', (r) => { if (r.url().startsWith(svoy) && r.status() >= 400 && !/favicon/.test(r.url())) oshibki.push(`${r.status()} ${r.url().replace(svoy, '')}`); });
  let tekushchiy = '';
  const shag = (t) => { log.push(t); tekushchiy = `шаг ${log.length}: ${t}`; };
  const imya = `${igra.m}-${igra.d}-${dvizhok}`;
  const rez = { id: igra.id, vid: igra.vid, dvizhok, ok: false, itog: '', snimok: '', sravnenie: null };
  try {
    shag(`открываю ${igra.put}`);
    await page.goto(baza + igra.put, { waitUntil: 'load', timeout: 60_000 });
    const s = await snimokStranicy(page).catch(() => null);
    if (s) { rez.snimok = `${imya}.png`; fs.writeFileSync(path.join(OUT, rez.snimok), s); }
    rez.itog = await Promise.race([PROHOD[igra.vid](page, shag),
      new Promise((_, no) => setTimeout(() => no(new Error('игра не пройдена за 10 минут')), 600_000))]);
    await page.waitForTimeout(300);
    if (oshibki.length) throw new Error(oshibki[0] + (oshibki.length > 1 ? ` (и ещё ${oshibki.length - 1})` : ''));
    rez.ok = true;
    await page.screenshot({ path: path.join(OUT, `${imya}-final.png`) }).catch(() => {});
  } catch (e) {
    rez.itog = `${tekushchiy} — ${e.message.split('\n')[0]}`;
    await page.screenshot({ path: path.join(OUT, `${imya}-proval.png`) }).catch(() => {});
  }
  await ctx.close();
  return rez;
}

async function sravnit(brauzer, dvizhok, igra, snimok) {
  if (SRAVNI === 'net' || !snimok) return null;
  const ctx = await brauzer.newContext({ ...PROFIL[dvizhok], locale: 'ru-RU' });
  const page = await ctx.newPage();
  try {
    const r = await page.goto(SRAVNI + igra.put, { waitUntil: 'load', timeout: 60_000 });
    if (!r?.ok()) return { net: `на ${SRAVNI} страницы нет (${r?.status()})` };
    const s = await snimokStranicy(page);
    const imya = `${igra.m}-${igra.d}-${dvizhok}`;
    fs.writeFileSync(path.join(OUT, `${imya}-zhivoy.png`), s);
    return await raznica(fs.readFileSync(path.join(OUT, snimok)), s, path.join(OUT, `${imya}-raznica.png`));
  } catch (e) { return { net: e.message.split('\n')[0] }; } finally { await ctx.close(); }
}

// ---------- главный ход ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let srv = null, baza = URL0;
if (!URL0) { srv = await server(DIST); baza = `http://127.0.0.1:${srv.address().port}`; }
const igry = await spisok(baza);
const vse = [];
for (const dv of DVIZHKI) {
  const brauzer = await BRAUZER[dv].launch();
  for (const igra of igry) {
    const r = await proiti(brauzer, dv, baza, igra);
    r.sravnenie = await sravnit(brauzer, dv, igra, r.snimok);
    vse.push(r);
    const sr = r.sravnenie ? (r.sravnenie.net ? ` | снимок: ${r.sravnenie.net}` : ` | снимок: отличие ${(r.sravnenie.dolya * 100).toFixed(2)} %`) : '';
    console.log(`${dv.padEnd(8)} ${igra.id} [${igra.vid}] ${r.ok ? 'ок' : 'провал'} — ${r.itog}${sr}`);
  }
  await brauzer.close();
}
srv?.close();

const proshli = igry.filter((g) => vse.filter((r) => r.id === g.id).every((r) => r.ok)).length;
const stroki = [
  `# Проход игр января в движках ${DVIZHKI.join(', ')}`,
  '',
  `Игр проходят во всех движках этого прогона (${DVIZHKI.join(', ')}): **${proshli} из ${igry.length}**.`,
  `Проверялось: ${URL0 || 'сборка dist'}; снимки сравнивались с ${SRAVNI === 'net' ? '— (сравнение выключено)' : SRAVNI}.`,
  '',
  '| Игра | Вид | Движок | Итог | Снимок против живого |',
  '|---|---|---|---|---|',
  ...vse.map((r) => `| [${r.id}](${ZHIVOY}/muzei/${r.id.replace('/', '/den/')}/) | ${r.vid} | ${r.dvizhok} | ${r.ok ? 'ок' : 'провал'} — ${r.itog.replace(/\|/g, '/')} | ${
    !r.sravnenie ? '—' : r.sravnenie.net ? r.sravnenie.net.replace(/\|/g, '/') : `${(r.sravnenie.dolya * 100).toFixed(2)} %${r.sravnenie.vysota[0] !== r.sravnenie.vysota[1] ? `, высота ${r.sravnenie.vysota.join(' → ')}` : ''}`} |`),
  '',
  'Снимки, финалы, места провала и картинки разницы (красное — несовпавшие точки) — в артефакте прогона.',
];
fs.writeFileSync(path.join(OUT, 'otchet.md'), stroki.join('\n') + '\n');
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, stroki.join('\n') + '\n');
console.log(`\nИгр проходят во всех движках прогона: ${proshli} из ${igry.length}. Отчёт: ${OUT}/otchet.md`);
process.exit(proshli === igry.length && igry.length ? 0 : 1);
