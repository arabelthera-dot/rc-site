// Замер «глазами посетителя» по списку из 21 пункта (knowledge/glazami-posetitelya.md, Сергей 17.10.2026).
// Телефон 390×844. Выборка: главная, карта, все музеи, все календари и по 3 дня на музей
// (первый, середина, последний по карте сайта). Итог — таблица TSV и сводка «сколько страниц не проходят».
// Запуск: node scripts/glazami.mjs [адрес сайта] [папка отчёта] [--dist dist] [--porog scripts/glazami-porog.json] [--zapisat]
//   --dist <папка>  — мерить локальную сборку: свой статический сервер, сайт от корня (как на домене).
//   --porog <файл>  — сторож от отката: код 1, если хоть по одному пункту провалов больше эталона.
//   --zapisat       — записать эталон в файл --porog (только вниз: число может уменьшиться, но не вырасти).
// Пункты 10 (контраст) и 21 (счётчик, после М26) здесь не мерятся: контраст — в axe, счётчика ещё нет.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
const pw = await import(process.env.PW || 'playwright'); const chromium = pw.chromium || pw.default.chromium;

const argv = process.argv.slice(2), opt = {}, pos = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--zapisat') opt.zapisat = true;
  else if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
  else pos.push(argv[i]);
}
const ZHIVOY = 'https://russian-civilization.ru/';
let SITE = (pos[0] || ZHIVOY).replace(/\/?$/, '/');
const OUT = pos[1] || '/tmp/glazami';
const W = 390, H = 844, POTOKOV = +(opt.potokov || 4);
fs.mkdirSync(OUT, { recursive: true });

let server = null;
if (opt.dist) {
  const ROOT = path.resolve(opt.dist), BASE = '/';
  const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
    '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.txt': 'text/plain' };
  server = http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0]);
    if (!u.startsWith(BASE)) { res.writeHead(404); return res.end(); }
    let f = path.join(ROOT, u.slice(BASE.length));
    if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch {}
    fs.readFile(f, (err, buf) => {
      if (err) { res.writeHead(404); return res.end('404'); }
      res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'content-length': buf.length });
      res.end(buf);
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  SITE = `http://127.0.0.1:${server.address().port}${BASE}`;
}

// Весь сайт — обе волны карты сайта (Е6, src/integrations/karta-volnami.mjs): файлы волн пишутся и закрытыми.
const VOLNY = ['sitemap-volna-1.xml', 'sitemap-volna-2.xml'];
const sm = (await Promise.all(VOLNY.map(async f => opt.dist ? fs.readFileSync(path.join(opt.dist, f), 'utf8') : (await fetch(SITE + f)).text()))).join('');
const all = [...sm.matchAll(/<loc>([^<]*)/g)].map(m => m[1].replace(ZHIVOY, SITE)).sort();
const dni = {};
for (const u of all) { const m = u.match(/muzei\/([^/]+)\/den\//); if (m) (dni[m[1]] ||= []).push(u); }
const vyborka = all.filter(u => !/\/den\//.test(u));
for (const list of Object.values(dni)) {
  const pick = [list[0], list[list.length >> 1], list[list.length - 1]];
  vyborka.push(...new Set(pick));
}
// Дни, чья полная страница правится в заявке, — в выборку обязательно (01-26 не попал в «первый/средний/последний»).
try {
  const { execFileSync } = await import('node:child_process');
  const izm = execFileSync('git', ['diff', '--name-only', 'origin/main...HEAD', '--', 'src/data/full-pages'], { encoding: 'utf8' }).match(/[^/\s]+\/\d\d-\d\d(?=\.html)/g) || [];
  for (const k of izm) { const u = all.find(x => x.endsWith(`muzei/${k}/`.replace(/\/(\d\d-\d\d)\/$/, '/den/$1/'))); if (u && !vyborka.includes(u)) vyborka.push(u); }
} catch {}

const POROGI = {
  'og': r => r.og === 3, 'title≤60': r => r.titleLen > 0 && r.titleLen <= 60,
  'desc70–160': r => r.descLen >= 70 && r.descLen <= 160, 'schema': r => r.schema > 0,
  'h1 на экране': r => r.h1Bottom > 0 && r.h1Bottom <= H, 'хук на экране': r => r.hookBottom === null || r.hookBottom <= H,
  'кадр 45–60%': r => r.kadr === null || (r.kadr >= 45 && r.kadr <= 60),
  'шапка ≤56, одна': r => r.shapka <= 56 && r.shapok <= 1, 'нет вылезания': r => r.shire <= W,
  'текст ≥17': r => r.font === null || r.font >= 17, 'межстрочный 1.5–1.65': r => r.lh === null || (r.lh >= 1.5 && r.lh <= 1.65),
  'подпись ≤2 строк': r => r.podpis === null || r.podpis <= 2,
  'вчера/завтра': r => !r.den || r.sosedi > 0, 'поделиться 1': r => !r.den || r.share === 1,
  'цели ≥44': r => r.melkie === 0, 'поддержать в 1/3': r => process.env.PUBLIC_PODDERZHKA === '0' || (r.podderzhat !== null && r.podderzhat <= 33), // Р31: выключено — не требуется
  'подписка': r => r.podpiska > 0, 'вес ≤1 МБ': r => r.kb <= 1024, 'картинки с размерами': r => r.bezRazmera === 0,
  'CLS<0.1': r => r.cls < 0.1, 'нет ошибок': r => r.oshibki === 0 && r.bitye === 0,
  'обложка дня': r => !r.den || r.zaglushka || (r.oblozhka && r.pustyeImg === 0),
  'нет заглушки': r => !r.zaglushka, 'без своих стилей': r => r.svoiStili === 0,
};

// CLS по определению web-vitals: худшее окно сессии (сдвиги с разрывом <1 с, окно ≤5 с), а не сумма за жизнь страницы
const SLED_CLS = () => {
  let okno = 0, nachalo = 0, posl = 0; window.__cls = 0;
  new PerformanceObserver(l => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      if (okno && e.startTime - posl < 1000 && e.startTime - nachalo < 5000) okno += e.value;
      else { okno = e.value; nachalo = e.startTime; }
      posl = e.startTime; window.__cls = Math.max(window.__cls, okno);
    }
  }).observe({ type: 'layout-shift', buffered: true });
};
// повторный замер одного CLS — для страниц за порогом (как numberOfRuns в Lighthouse CI)
async function tolkoCls(url) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.addInitScript(SLED_CLS);
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); } catch {}
  await page.waitForTimeout(800);
  const cls = await page.evaluate(() => +window.__cls.toFixed(3)).catch(() => null);
  await ctx.close();
  return cls;
}

const browser = await chromium.launch();
const rows = [];
const t0 = Date.now();
async function zamer(url) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  let oshibki = 0, bitye = 0, bytes = 0;
  page.on('pageerror', () => oshibki++);
  page.on('console', m => { if (m.type() === 'error') oshibki++; });
  page.on('response', async res => {
    if (res.status() >= 400) bitye++;
    const len = +(res.headers()['content-length'] || 0); bytes += len;
  });
  await page.addInitScript(SLED_CLS);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch { oshibki++; }
  await page.waitForTimeout(800);
  const r = await page.evaluate(({ W, H }) => {
    const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)];
    const vis = e => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const absBottom = e => e ? e.getBoundingClientRect().bottom + scrollY : null;
    const meta = n => q(`meta[property="${n}"],meta[name="${n}"]`)?.content || '';
    const h1 = q('h1');
    const hook = q('.hook') || null;
    // кадр — самая большая картинка/видео на первом экране, доля площади экрана
    let kadr = null;
    for (const e of qa('img,video,picture,canvas')) {
      const b = e.getBoundingClientRect(); if (b.top >= H || b.bottom <= 0 || !vis(e)) continue;
      const a = Math.max(0, Math.min(b.bottom, H) - Math.max(b.top, 0)) * Math.max(0, Math.min(b.right, W) - Math.max(b.left, 0));
      kadr = Math.max(kadr || 0, Math.round(a / (W * H) * 100));
    }
    // шапки: липкие/фиксированные полосы у верха
    const sticky = qa('body *').filter(e => { const p = getComputedStyle(e).position; if (p !== 'sticky' && p !== 'fixed') return false; const b = e.getBoundingClientRect(); return vis(e) && b.top < 60 && b.width > W * 0.8; });
    // шапка — навигационная полоса; <header> с h1 — это обложка (header.mh-cover, header.hero-lead), не шапка
    const navs = qa('header,nav,.crumbs,a.back').filter(e => vis(e) && e.getBoundingClientRect().top + scrollY < 400
      && !e.parentElement.closest('header,nav') && !(e.tagName === 'HEADER' && e.querySelector('h1')));
    const p = qa('main p, article p, p').find(e => vis(e) && e.textContent.trim().length > 120);
    const cs = p ? getComputedStyle(p) : null;
    const fig = qa('figcaption').find(vis);
    const fcs = fig ? getComputedStyle(fig) : null;
    const podpis = fig ? Math.round(fig.getBoundingClientRect().height / (parseFloat(fcs.lineHeight) || parseFloat(fcs.fontSize) * 1.3)) : null;
    const links = qa('a,button,[role=button],input,select').filter(vis);
    const melkie = links.filter(e => { const b = e.getBoundingClientRect(); return (b.height < 44 || b.width < 44) && !e.closest('p,li p,figcaption'); }).length;
    const total = document.documentElement.scrollHeight;
    const sup = qa('a,button').filter(vis).find(e => /поддерж/i.test(e.textContent));
    const txt = document.body.innerText;
    return {
      og: ['og:title', 'og:description', 'og:image'].filter(n => meta(n)).length,
      title: document.title, titleLen: document.title.length, descLen: meta('description').length,
      schema: qa('script[type="application/ld+json"]').length,
      h1Bottom: h1 ? Math.round(absBottom(h1)) : -1, hookBottom: hook ? Math.round(absBottom(hook)) : null,
      kadr, shapka: sticky.length ? Math.round(Math.max(...sticky.map(e => e.getBoundingClientRect().height))) : 0,
      shapok: navs.length, shire: document.documentElement.scrollWidth,
      font: cs ? parseFloat(cs.fontSize) : null, lh: cs ? +(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)).toFixed(2) || null : null,
      podpis, melkie, celey: links.length,
      sosedi: qa('a[rel=prev],a[rel=next]').length + qa('a').filter(a => /вчера|завтра|предыдущ|следующ/i.test(a.textContent)).length,
      share: qa('a,button').filter(e => vis(e) && /поделит/i.test(e.textContent)).length,
      podderzhat: sup ? Math.round(absBottom(sup) / total * 100) : null,
      podpiska: qa('a[href*="t.me"],a[href*="vk.com"],a[href*="dzen"]').length,
      bezRazmera: qa('img').filter(i => !i.getAttribute('width') || !i.getAttribute('height')).length,
      zaglushka: /День готовится/.test(txt), svoiStili: qa('body style, [style]').filter(e => e.tagName === 'STYLE' || e.getAttribute('style').length > 60).length,
      den: /\/den\//.test(location.pathname), cls: +window.__cls.toFixed(3),
      // обложка дня (r230, 01-26 вышел без hero-fig): кадр в figure.hero-fig загружен; видимая img без src или битая — брак
      oblozhka: qa('figure.hero-fig img').some(i => i.naturalWidth > 0),
      pustyeImg: qa('img').filter(i => (vis(i) && !i.getAttribute('src')) || (i.complete && i.getAttribute('src') && i.naturalWidth === 0)).length,
    };
  }, { W, H }).catch(() => null);
  await ctx.close();
  if (!r) { rows.push({ url: url.replace(SITE, '/'), sloman: 1 }); return; }
  r.url = url.replace(SITE, '/'); r.kb = Math.round(bytes / 1024); r.oshibki = oshibki; r.bitye = bitye;
  rows.push(r);
  process.stdout.write('.');
}
// --dni vse | --dni izobreteniya/01- — все страницы дней (Р384, r486: «машина смотрит все дни с телефона после каждой
// выкладки»), по шесть мерок на день; итог — dni.tsv «день → цифры» и dni-svodka.md: недостаток на 2+ днях одного
// музея — «чинить в шаблоне». С --porog — свой раздел «dni» в эталоне: хуже — код 1, лучше — с --zapisat понижается.
if (opt.dni) { await rezhimDni(); await browser.close(); server?.close(); process.exit(process.exitCode || 0); }
// --tolko izobreteniya/01-25,izobreteniya/01-26 — замер только этих дней (ручная проверка одной правки)
if (opt.tolko) vyborka.splice(0, vyborka.length, ...opt.tolko.split(',').map(k => all.find(u => u.endsWith(`muzei/${k.replace('/', '/den/')}/`))).filter(Boolean));
// несколько страниц одновременно — укладываемся в ~3 минуты в проверке заявки
const ochered = [...vyborka];
await Promise.all(Array.from({ length: POTOKOV }, async () => { while (ochered.length) await zamer(ochered.shift()); }));
// CLS за порогом — ещё два замера по одному, в зачёт медиана трёх: один шумный прогон не красит заявку
for (const r of rows.filter(r => !r.sloman && r.cls >= 0.1)) {
  const z = [r.cls, await tolkoCls(SITE + r.url.slice(1)), await tolkoCls(SITE + r.url.slice(1))].map(v => v ?? r.cls).sort((a, b) => a - b);
  r.clsZamery = z; r.cls = z[1];
}
await browser.close();
server?.close();
rows.sort((a, b) => vyborka.indexOf(SITE + a.url.slice(1)) - vyborka.indexOf(SITE + b.url.slice(1)));

// дубли title между страницами (пункт 2)
const t = {}; for (const r of rows) if (r.title) t[r.title] = (t[r.title] || 0) + 1;
const tip = u => u === '/' ? 'главная' : /\/den\//.test(u) ? 'день' : /calendar/.test(u) ? 'календарь' : /^\/muzei\/[^/]+\/$/.test(u) ? 'музей' : 'прочее';
const names = Object.keys(POROGI);
const lines = [['адрес', 'вид', ...names, 'дубль title'].join('\t')];
const svod = Object.fromEntries(names.map(n => [n, {}]));
for (const r of rows) {
  if (r.sloman) { lines.push(r.url + '\tне открылась'); continue; }
  const k = tip(r.url);
  const cells = names.map(n => { const ok = POROGI[n](r); if (!ok) svod[n][k] = (svod[n][k] || 0) + 1; return ok ? '+' : '−'; });
  lines.push([r.url, k, ...cells, t[r.title] > 1 ? '−' : '+'].join('\t'));
}
fs.writeFileSync(`${OUT}/tablica.tsv`, lines.join('\n') + '\n');
fs.writeFileSync(`${OUT}/syroe.json`, JSON.stringify(rows, null, 1));
const vidy = {}; for (const r of rows) vidy[tip(r.url)] = (vidy[tip(r.url)] || 0) + 1;
let s = `Замер ${new Date().toISOString().slice(0, 16)} UTC, ${opt.dist ? 'сборка ' + opt.dist : SITE}, 390×844, страниц ${rows.length}, ${Math.round((Date.now() - t0) / 1000)} с (${Object.entries(vidy).map(([k, v]) => k + ' ' + v).join(', ')})\n`;
s += `дубли title: ${Object.values(t).filter(v => v > 1).reduce((a, b) => a + b, 0)}\n`;
for (const n of names) { const f = svod[n]; const sum = Object.values(f).reduce((a, b) => a + b, 0); s += `${sum ? '✗' : '✓'} ${n}: ${sum}${sum ? ' (' + Object.entries(f).map(([k, v]) => k + ' ' + v).join(', ') + ')' : ''}\n`; }
fs.writeFileSync(`${OUT}/svodka.txt`, s);
console.log('\n' + s);

// Сторож от отката: мерка — «не хуже вчерашнего», а не идеал.
if (opt.porog) {
  const itog = { 'не открылась': rows.filter(r => r.sloman).length, 'дубли title': Object.values(t).filter(v => v > 1).reduce((a, b) => a + b, 0) };
  for (const n of names) itog[n] = Object.values(svod[n]).reduce((a, b) => a + b, 0);
  fs.writeFileSync(`${OUT}/porog-zamer.json`, JSON.stringify(itog, null, 2) + '\n');
  const staryy = fs.existsSync(opt.porog) ? JSON.parse(fs.readFileSync(opt.porog, 'utf8')) : null;
  if (opt.zapisat) {
    const punkty = {};
    for (const [n, v] of Object.entries(itog)) punkty[n] = staryy?.punkty?.[n] !== undefined ? Math.min(staryy.punkty[n], v) : v;
    // Ни одно число не снизилось — файл не трогаем, чтобы храповик не плодил пустых заявок.
    if (staryy && JSON.stringify(punkty) === JSON.stringify(staryy.punkty)) console.log('Эталон не изменился.');
    else fs.writeFileSync(opt.porog, JSON.stringify({ ...staryy,
      'что это': 'Эталон замера «глазами посетителя»: сколько страниц выборки проваливают пункт. Заявка, где провалов больше, — красная. Понижать можно, повышать нельзя.',
      'снят': new Date().toISOString().slice(0, 10), 'страниц': rows.length, punkty }, null, 2) + '\n');
    if (!staryy || JSON.stringify(punkty) !== JSON.stringify(staryy.punkty)) console.log(`Эталон записан: ${opt.porog}`);
  } else {
    if (!staryy) { console.log(`Нет эталона ${opt.porog}`); process.exit(1); }
    const huzhe = [], luchshe = [];
    for (const [n, v] of Object.entries(itog)) {
      const p = staryy.punkty[n] ?? 0;
      if (v > p) huzhe.push(`  ✗ ${n}: было ${p}, стало ${v} (+${v - p})`);
      else if (v < p) luchshe.push(`  ↓ ${n}: было ${p}, стало ${v}`);
    }
    let o = `\nСторож «не хуже вчерашнего» (эталон ${opt.porog} от ${staryy['снят']}):\n`;
    o += huzhe.length ? `ХУЖЕ эталона — ${huzhe.length} п.:\n${huzhe.join('\n')}\nПодробно по страницам — tablica.tsv в отчёте замера.\n` : 'Ни один пункт не стал хуже. ✓\n';
    if (luchshe.length) o += `Стало лучше — эталон можно понизить (node scripts/glazami.mjs … --porog ${opt.porog} --zapisat):\n${luchshe.join('\n')}\n`;
    console.log(o);
    fs.appendFileSync(`${OUT}/svodka.txt`, o);
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '```\n' + s + o + '```\n');
    if (huzhe.length) process.exit(1);
  }
}

// ——— Режим --dni: все страницы дней ———
// Мерки дня: экран, на котором начинается блок фактов (1 — первый экран 844 px); открывается ли лупа у первого кадра
// (касание по кадру, как посетитель: если плашка закрыла кадр — не откроется); ширина страницы; битые картинки
// (ленивые грузятся все); ошибки консоли; плашки (fixed/sticky), закрывающие >10% экрана — сверху и после прокрутки.
async function rezhimDni() {
  const filtr = opt.dni === 'vse' ? '' : opt.dni;
  const spisok = Object.values(dni).flat().filter(u => u.includes('muzei/' + filtr.replace(/^([^/]+)\//, '$1/den/')));
  const PUNKTY = {
    'не открылась': d => d.sloman, 'факты ниже 2-го экрана': d => d.fakty > 2, 'нет блока фактов': d => !d.sloman && d.fakty === null,
    'лупа не открылась': d => d.lupa === 'нет', 'кадр без лупы': d => d.bezLupy > 0, 'шире 390': d => d.shire > W, 'битые картинки': d => d.bitye > 0,
    'ошибки консоли': d => d.oshibki > 0, 'плашка >10%': d => d.plashka > 10,
  };
  const out = [], t1 = Date.now();
  async function zamerDnya(url) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const d = { den: url.match(/muzei\/([^/]+)\/den\/([^/]+)/).slice(1).join('/'), oshibki: 0, chto: [] };
    const bityeAdr = new Set();
    page.on('pageerror', e => { d.oshibki++; d.chto.push(String(e.message).slice(0, 80)); });
    page.on('console', m => { if (m.type() === 'error') { d.oshibki++; d.chto.push(m.text().slice(0, 80)); } });
    page.on('response', res => { if (res.status() >= 400 && res.request().resourceType() === 'image') bityeAdr.add(res.url()); });
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 45000 });
      // плашка cookie (src/lib/metrika.mjs) встаёт, когда догрузится её стиль, — ждём её до 1,5 с, иначе мерка видит пустой экран
      await page.locator('.rc-cookie').first().waitFor({ state: 'visible', timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(300);
      // липкая (sticky) наверху страницы стоит в потоке и ничего не закрывает — её мерим только после прокрутки
      const PLASHKI = ({ W, H, lipkie }) => [...document.querySelectorAll('body *')].map(e => {
        const cs = getComputedStyle(e); if (cs.position !== 'fixed' && !(lipkie && cs.position === 'sticky')) return null;
        if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return null;
        const b = e.getBoundingClientRect();
        const a = Math.max(0, Math.min(b.bottom, H) - Math.max(b.top, 0)) * Math.max(0, Math.min(b.right, W) - Math.max(b.left, 0));
        return { p: Math.round(a / (W * H) * 100), kto: e.tagName.toLowerCase() + (e.id ? '#' + e.id : e.classList[0] ? '.' + e.classList[0] : '') };
      }).filter(x => x && x.p > 0).sort((a, b) => b.p - a.p)[0] || { p: 0, kto: '' };
      const p1 = await page.evaluate(PLASHKI, { W, H, lipkie: false }).catch(() => ({ p: 0, kto: '' }));
      const r = await page.evaluate(async ({ W, H }) => {
        const vis = e => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
        const f = [...document.querySelectorAll('#fakty, #fakty-dnya, [id*="fakt"], [class*="fakt"]')].find(vis)
          || [...document.querySelectorAll('h2,h3')].find(e => vis(e) && /факт/i.test(e.textContent));
        const fakty = f ? Math.floor((f.getBoundingClientRect().top + scrollY) / H) + 1 : null;
        // ленивые картинки — грузим все, ждём до 8 с
        const imgs = [...document.querySelectorAll('img[src]')];
        imgs.forEach(i => { i.loading = 'eager'; });
        await Promise.race([Promise.all(imgs.map(i => i.complete ? 0 : new Promise(ok => { i.onload = i.onerror = ok; }))), new Promise(ok => setTimeout(ok, 8000))]);
        return {
          fakty, shire: document.documentElement.scrollWidth,
          bitye: imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src),
          kadrov: imgs.filter(i => i.closest('figure') && vis(i)).length, sLupoy: document.querySelectorAll('img[data-lupa]').length,
          bezLupy: imgs.filter(i => i.closest('figure') && vis(i) && !i.hasAttribute('data-lupa')).length,
        };
      }, { W, H });
      Object.assign(d, r);
      await page.evaluate(() => window.scrollTo(0, innerHeight * 2));
      await page.waitForTimeout(400);
      const p2 = await page.evaluate(PLASHKI, { W, H, lipkie: true }).catch(() => ({ p: 0, kto: '' }));
      const pl = p2.p > p1.p ? p2 : p1; d.plashka = pl.p; d.plashkaKto = pl.kto;
      await page.evaluate(() => window.scrollTo(0, 0));
      // лупа: касание по первому кадру с лупой — открылся ли просмотрщик
      d.lupa = '—';
      if (d.sLupoy) {
        const k = page.locator('img[data-lupa]').first();
        try {
          await k.click({ timeout: 3000 });
          await page.locator('.pswp--open, .pswp').first().waitFor({ state: 'visible', timeout: 4000 });
          d.lupa = 'да'; await page.keyboard.press('Escape');
        } catch { d.lupa = 'нет'; }
      }
      for (const u of d.bitye) bityeAdr.add(u);
      d.bitye = bityeAdr.size; d.bityeAdr = [...bityeAdr].slice(0, 3).map(u => u.replace(SITE, '/'));
    } catch (e) { d.sloman = 1; d.chto.push(String(e.message).split('\n')[0].slice(0, 80)); }
    await ctx.close();
    out.push(d);
    if (out.length % 100 === 0) console.log(`дни: ${out.length} из ${spisok.length}`);
  }
  const och = [...spisok];
  await Promise.all(Array.from({ length: POTOKOV }, async () => { while (och.length) await zamerDnya(och.shift()); }));
  out.sort((a, b) => a.den.localeCompare(b.den));
  const zn = v => v ?? '—';
  const tsv = [['день', 'факты, экран', 'кадров', 'с лупой', 'кадров без лупы', 'лупа открылась', 'ширина', 'битых картинок', 'ошибок консоли', 'плашка, % экрана', 'плашка', 'недостатки'].join('\t')];
  for (const d of out) tsv.push([d.den, d.sloman ? 'не открылась' : zn(d.fakty), zn(d.kadrov), zn(d.sLupoy), zn(d.bezLupy), zn(d.lupa), zn(d.shire), zn(d.bitye), d.oshibki, zn(d.plashka), d.plashkaKto || '',
    Object.keys(PUNKTY).filter(n => PUNKTY[n](d)).join('; ')].join('\t'));
  fs.writeFileSync(`${OUT}/dni.tsv`, tsv.join('\n') + '\n');
  fs.writeFileSync(`${OUT}/dni-syroe.json`, JSON.stringify(out, null, 1));
  // сводка по музеям: недостаток на 2+ днях одного музея — «чинить в шаблоне», на одном — «чинить в дне»
  const muzei = {}; for (const d of out) (muzei[d.den.split('/')[0]] ||= []).push(d);
  const itog = {}; for (const n of Object.keys(PUNKTY)) itog[n] = out.filter(PUNKTY[n]).length;
  fs.writeFileSync(`${OUT}/dni-itog.json`, JSON.stringify(itog, null, 2) + '\n');
  let md = `# Все дни глазами посетителя, 390×844\n\nзамер на ${out.filter(d => !d.sloman).length} из ${spisok.length} страниц дней, ${opt.dist ? 'сборка ' + opt.dist : SITE}, ${Math.round((Date.now() - t1) / 1000)} с\n\n`;
  md += `| недостаток | дней |\n|---|---|\n${Object.entries(itog).map(([n, v]) => `| ${n} | ${v} |`).join('\n')}\n\n`;
  for (const [m, list] of Object.entries(muzei)) {
    const str = Object.keys(PUNKTY).map(n => [n, list.filter(PUNKTY[n]).map(d => d.den.split('/')[1])]).filter(([, l]) => l.length);
    md += `## ${m} — ${list.length} дн.\n`;
    md += str.length ? str.map(([n, l]) => `- ${l.length >= 2 ? '**чинить в шаблоне**' : 'чинить в дне'}: ${n} — ${l.length} дн. (${l.slice(0, 12).join(', ')}${l.length > 12 ? ' …' : ''})`).join('\n') : '- недостатков нет';
    const pl = [...new Set(list.filter(PUNKTY['плашка >10%']).map(d => d.plashkaKto))];
    if (pl.length) md += `\n- плашки: ${pl.join(', ')}`;
    md += '\n\n';
  }
  fs.writeFileSync(`${OUT}/dni-svodka.md`, md);
  console.log(md.split('\n## ')[0]);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  if (!opt.porog) return;
  // храповик дней — раздел «dni» эталона, тот же закон: понижать можно, повышать нельзя
  const staryy = fs.existsSync(opt.porog) ? JSON.parse(fs.readFileSync(opt.porog, 'utf8')) : {};
  const bylo = staryy.dni?.punkty;
  const huzhe = bylo ? Object.entries(itog).filter(([n, v]) => v > (bylo[n] ?? 0)).map(([n, v]) => `  ✗ ${n}: было ${bylo[n] ?? 0}, стало ${v}`) : [];
  let o = bylo ? (huzhe.length ? `\nДни: ХУЖЕ эталона — ${huzhe.length} п.:\n${huzhe.join('\n')}\nПо дням — dni.tsv, по музеям — dni-svodka.md.\n` : '\nДни: ни один пункт не стал хуже. ✓\n')
    : '\nДни: эталона ещё нет — снят этим замером.\n';
  if (opt.zapisat) {
    const punkty = Object.fromEntries(Object.entries(itog).map(([n, v]) => [n, bylo?.[n] !== undefined ? Math.min(bylo[n], v) : v]));
    if (JSON.stringify(punkty) !== JSON.stringify(bylo)) {
      staryy.dni = { 'что это': 'Все страницы дней (r486): сколько дней проваливают пункт. Хуже — храповик красный. Понижать можно, повышать нельзя.',
        'снят': new Date().toISOString().slice(0, 10), 'страниц': spisok.length, punkty };
      fs.writeFileSync(opt.porog, JSON.stringify(staryy, null, 2) + '\n');
      o += `Эталон дней записан: ${opt.porog}\n`;
    }
  }
  console.log(o);
  fs.appendFileSync(`${OUT}/dni-svodka.md`, '```' + o + '```\n');
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '```' + o + '```\n');
  if (huzhe.length) process.exitCode = 1;
}
