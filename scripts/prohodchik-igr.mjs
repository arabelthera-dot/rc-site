// Проходчик игр (Р204, 23.10.2026; повод — Р203: игру 29 января показали, а на телефоне она не проходилась).
// Сквозная проверка как в CI крупных команд: Playwright, профиль телефона (iPhone 13: 390×664, isMobile, hasTouch),
// реальные касания — тап через touchscreen.tap, «держи» и «веди» через CDP Input.dispatchTouchEvent. Каждая игра —
// в новом контексте браузера (пустой кэш). Игра пройдена, когда виден её финальный экран; ошибка консоли, ошибка
// скрипта или незагруженный свой файл — провал. Выход: строка на игру «ок» / «провал — шаг N: что не так»,
// снимки в /tmp/prohod-igr/ (финал или место провала), сводка /tmp/prohod-igr/otchet.md; код выхода 1 при провале.
//
// Как идёт проход. Есть файл сценария tests/igry/scenarii/<музей>-<ММ-ДД>.mjs — по нему (нестандартная игра).
// Нет — общий проходчик по разметке игры (контракт в public/assets/igra-pravila.js):
//   data-igra-sekciya — корень игры; data-igra-start — «Начать»; data-igra-final — финальный экран;
//   data-igra-hod="tap|derzhi|vedi" — чем играть элемент; data-igra-sejchas — ход, который игра ждёт сейчас.
// Где разметки нет (старые страницы), проходчик ищет сам: корень — секция игры как в scripts/igra-pravila.mjs,
// финал — скрытый на старте блок с final/finale/result/ending/itog/pobed/win в class или id, ходы — видимые кнопки,
// ползунки и холст игры; перебирает их, как ребёнок, пока на экране что-то меняется.
//
// Запуск: npm run prohod-igr [-- --igry chernovik/izobreteniya-01-29-igra.html,muzei/izobreteniya/den/01-07/]
//   --dist dist        что проверять (по умолчанию собранный dist/, свой сервер на 127.0.0.1)
//   --url https://…    или живой сайт
//   --baza origin/main только игры, задетые заявкой (страницы игр и общие assets), иначе — все игры в dist
//   --telefon "iPhone 13"   профиль из playwright devices
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { chromium, devices } from 'playwright';
import { estIgra } from './igra-pravila.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const DIST = path.resolve(arg('--dist', 'dist'));
const URL0 = arg('--url', '');
const TELEFON = arg('--telefon', 'iPhone 13');
const OUT = '/tmp/prohod-igr';
const SCENARII = path.resolve('tests/igry/scenarii');
const VREMYA_IGRY = 120_000;

// ---------- какие игры ----------
// id игры — путь страницы от корня сайта: chernovik/<музей>-<ММ-ДД>-igra.html или muzei/<музей>/den/<ММ-ДД>/.
const klyuch = (id) => {
  let m = /chernovik\/([\w-]+?-\d\d-\d\d)-igra\.html$/.exec(id);
  if (m) return m[1];
  m = /muzei\/([\w-]+)\/den\/(\d\d-\d\d)\/?$/.exec(id);
  return m ? `${m[1]}-${m[2]}` : id.replace(/[^\w-]+/g, '_');
};

function vseIgry() {
  const out = [];
  const ch = path.join(DIST, 'chernovik');
  for (const f of fs.existsSync(ch) ? fs.readdirSync(ch).sort() : []) if (/-igra\.html$/.test(f)) out.push(`chernovik/${f}`);
  const mz = path.join(DIST, 'muzei');
  for (const m of fs.existsSync(mz) ? fs.readdirSync(mz).sort() : []) {
    const den = path.join(mz, m, 'den');
    for (const d of fs.existsSync(den) ? fs.readdirSync(den).sort() : []) {
      const f = path.join(den, d, 'index.html');
      if (fs.existsSync(f) && estIgra(fs.readFileSync(f, 'utf8'))) out.push(`muzei/${m}/den/${d}/`);
    }
  }
  return out;
}

// Игры, задетые заявкой: изменённая страница игры, её сценарий или общий файл assets/, который игра подключает.
function zadetye(vse, baza) {
  const files = execFileSync('git', ['diff', '--name-only', `${baza}...HEAD`], { encoding: 'utf8' }).split('\n').filter(Boolean);
  const nado = new Set();
  const assets = files.filter((f) => /^public\/assets\/.+\.(?:js|css)$/.test(f)).map((f) => f.slice('public/'.length));
  for (const f of files) {
    let m = /^src\/data\/full-pages\/([\w-]+)\/(\d\d-\d\d)\.html$/.exec(f);
    if (m) nado.add(`muzei/${m[1]}/den/${m[2]}/`);
    m = /^public\/(chernovik\/[\w-]+-igra\.html)$/.exec(f);
    if (m) nado.add(m[1]);
    m = /^tests\/igry\/scenarii\/([\w-]+)\.mjs$/.exec(f);
    if (m) vse.filter((id) => klyuch(id) === m[1]).forEach((id) => nado.add(id));
  }
  if (assets.length) {
    for (const id of vse) {
      const f = path.join(DIST, id.endsWith('/') ? `${id}index.html` : id);
      const html = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
      if (assets.some((a) => html.includes(a))) nado.add(id);
    }
  }
  return vse.filter((id) => nado.has(id));
}

// ---------- свой сервер для dist ----------
const TIPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon', '.txt': 'text/plain' };
function server(root) {
  const s = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.join(root, p);
    if (!f.startsWith(root)) { res.writeHead(403); res.end(); return; }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) { res.writeHead(404); res.end('нет'); return; }
    res.writeHead(200, { 'content-type': TIPY[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((ok) => s.listen(0, '127.0.0.1', () => ok(s)));
}

// ---------- касания ----------
class Palec {
  constructor(page, cdp, log) { this.page = page; this.cdp = cdp; this.log = log; this.n = 0; }
  shag(t) { this.n++; this.log.push(`${this.n}. ${t}`); this.tekushchiy = `шаг ${this.n}: ${t}`; }
  async element(sel, { zhdat = 10_000 } = {}) {
    const loc = typeof sel === 'string' ? this.page.locator(sel).filter({ visible: true }).first() : sel;
    await loc.waitFor({ state: 'visible', timeout: zhdat }).catch(() => { throw new Error(`не видно «${sel}» за ${zhdat / 1000} с`); });
    await loc.scrollIntoViewIfNeeded();
    return loc;
  }
  // Точка на элементе (доли ширины/высоты) и проверка, что палец попадёт именно в него, а не в то, что сверху.
  async tochka(loc, fx = 0.5, fy = 0.5) {
    const b = await loc.boundingBox();
    if (!b || b.width < 1 || b.height < 1) throw new Error('элемент нулевого размера');
    const x = b.x + b.width * fx, y = b.y + b.height * fy;
    const vp = this.page.viewportSize();
    if (x < 0 || y < 0 || x > vp.width || y > vp.height) throw new Error(`элемент за краем экрана (${Math.round(x)},${Math.round(y)})`);
    const pokryt = await loc.evaluate((el, [x, y]) => {
      const hit = document.elementFromPoint(x, y);
      if (!hit || el === hit || el.contains(hit) || hit.contains(el)) return '';
      return `${hit.tagName.toLowerCase()}${hit.id ? '#' + hit.id : ''}${hit.className && typeof hit.className === 'string' ? '.' + hit.className.trim().split(/\s+/).join('.') : ''}`;
    }, [x, y]);
    if (pokryt) throw new Error(`палец попадает не в элемент, а в ${pokryt}`);
    return { x, y };
  }
  async tap(sel, opis) {
    this.shag(opis || `тап ${sel}`);
    const loc = await this.element(sel);
    const { x, y } = await this.tochka(loc);
    await this.page.touchscreen.tap(x, y);
    await this.page.waitForTimeout(250);
  }
  async touch(type, pts) {
    await this.cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(({ x, y }) => ({ x, y, id: 1, radiusX: 8, radiusY: 8, force: 1 })) });
  }
  // Держать палец, пока не выполнится poka (селектор становится видим или функция в браузере вернёт true), не дольше ms.
  async derzhi(sel, { poka, ms = 8000, opis } = {}) {
    this.shag(opis || `держать ${sel}${poka ? ` до «${poka}»` : ` ${ms} мс`}`);
    const loc = await this.element(sel);
    const p = await this.tochka(loc);
    await this.touch('touchStart', [p]);
    const t0 = Date.now();
    let dozhdalis = !poka;
    while (Date.now() - t0 < ms) {
      await this.page.waitForTimeout(100);
      await this.touch('touchMove', [p]);
      if (poka && await this.vidno(poka)) { dozhdalis = true; break; }
    }
    await this.touch('touchEnd', []);
    if (!dozhdalis) throw new Error(`держал ${ms / 1000} с — «${poka}» не появилось`);
    await this.page.waitForTimeout(250);
  }
  // Вести палец по элементу от доли ot до доли do (по горизонтали, или по вертикали при os='y'),
  // шагами shag px с паузой pauza мс; stop — селектор/функция, при которой палец останавливается и поднимается.
  async vedi(sel, { ot = 0.05, do: k = 0.95, os = 'x', shag = 6, pauza = 40, stop, derzhatPosle = 0, opis } = {}) {
    this.shag(opis || `вести по ${sel} ${ot}→${k}${stop ? ` до «${typeof stop === 'string' ? stop : 'условия'}»` : ''}`);
    const loc = await this.element(sel);
    const b = await loc.boundingBox();
    const a = await this.tochka(loc, os === 'x' ? ot : 0.5, os === 'y' ? ot : 0.5);
    const z = os === 'x' ? { x: b.x + b.width * k, y: a.y } : { x: a.x, y: b.y + b.height * k };
    const dlina = Math.hypot(z.x - a.x, z.y - a.y), n = Math.max(2, Math.ceil(dlina / shag));
    await this.touch('touchStart', [a]);
    let ostanovlen = false;
    for (let i = 1; i <= n; i++) {
      const p = { x: a.x + (z.x - a.x) * i / n, y: a.y + (z.y - a.y) * i / n };
      await this.touch('touchMove', [p]);
      await this.page.waitForTimeout(pauza);
      if (stop && await this.vidno(stop)) { ostanovlen = true; break; }
    }
    if (derzhatPosle) await this.page.waitForTimeout(derzhatPosle);
    await this.touch('touchEnd', []);
    await this.page.waitForTimeout(250);
    return ostanovlen;
  }
  async vidno(usl) {
    if (typeof usl === 'function') return this.page.evaluate(usl).catch(() => false);
    return this.page.locator(usl).filter({ visible: true }).count().then((c) => c > 0).catch(() => false);
  }
  async zhdi(usl, ms = 10_000, opis) {
    this.shag(opis || `ждать «${typeof usl === 'string' ? usl : 'условия'}»`);
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { if (await this.vidno(usl)) return; await this.page.waitForTimeout(150); }
    throw new Error(`за ${ms / 1000} с не дождался «${typeof usl === 'string' ? usl : 'условия'}»`);
  }
}

// ---------- общий проходчик по разметке ----------
const KOREN = '[data-igra-sekciya], section:has([data-igra-pravila]), #games, #game, [id^="game-"], [id$="-game"], [id^="igra"], [data-game-section], [data-game], section:has(canvas[id*="game"]), section:has(canvas[aria-label*="игр"])';
const FINAL_SAM = '[class*="final"], [class*="ending"], [class*="result"], [id*="result"], [id*="final"], [class*="itog"], [class*="pobed"], [class*="win"]';
const NE_TROGAT = /правила|ещё раз|еще раз|заново|сначала|снова играть|поделит|скопир|share|again|reset|restart|replay/i;

async function obshchiy(page, palec, scen) {
  palec.shag('найти игру');
  const koren = page.locator(scen.koren || KOREN).first();
  if (!await koren.count()) throw new Error('на странице не найден корень игры');
  await koren.scrollIntoViewIfNeeded();
  // Финал: размеченный или скрытые на старте «финальные» блоки внутри игры.
  await koren.evaluate((r, [sel, sam]) => {
    const vid = (el) => el.checkVisibility ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : !!el.offsetParent;
    const kand = sel ? [...document.querySelectorAll(sel)] : [...r.querySelectorAll('[data-igra-final]')];
    const list = kand.length ? kand : [...r.querySelectorAll(sam)].filter((el) => !vid(el));
    list.forEach((el) => el.setAttribute('data-prohod-final', ''));
  }, [scen.final || '', FINAL_SAM]);
  const finalLoc = page.locator('[data-prohod-final]');
  if (!await finalLoc.count()) throw new Error('не найден финальный экран: нет data-igra-final и скрытого блока final/result/ending');
  const final = () => finalLoc.filter({ visible: true }).filter({ hasText: /\S/ }).count().then((c) => c > 0);

  const start = koren.locator('[data-igra-start]').filter({ visible: true }).first();
  if (await start.count()) await palec.tap(start, 'тап «Начать»');

  const t0 = Date.now();
  const isprobovano = new Set();
  for (let hod = 0; hod < 150 && Date.now() - t0 < VREMYA_IGRY; hod++) {
    if (await final()) return;
    // Снимок состояния и список ходов — в браузере.
    const { tekst, sost, hody } = await koren.evaluate((r, neTrogat) => {
      r.querySelectorAll('[data-prohod-hod]').forEach((el) => el.removeAttribute('data-prohod-hod'));
      const vid = (el) => (el.checkVisibility ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : !!el.offsetParent)
        && !el.closest('[inert]') && !el.disabled && el.getBoundingClientRect().width > 4;
      const ne = new RegExp(neTrogat, 'i');
      const els = [...r.querySelectorAll('[data-igra-hod], button, [role="button"], input[type="range"], canvas')]
        .filter((el) => vid(el) && !el.closest('[data-igra-pravila], [data-prohod-final]') && !el.matches('[data-igra-pravila-open]')
          && !ne.test(el.textContent + ' ' + (el.getAttribute('aria-label') || '')));
      const hody = els.map((el, i) => {
        el.setAttribute('data-prohod-hod', String(i));
        const t = (el.getAttribute('data-igra-hod') || '').toLowerCase();
        const vid2 = t || (el.matches('input[type="range"]') ? 'vedi' : el.matches('canvas') ? 'kholst'
          : /держи|удерживай|не отпускай|hold/i.test(el.textContent + ' ' + (el.getAttribute('aria-label') || '')) ? 'derzhi' : 'tap');
        const sejchas = el.matches('[data-igra-sejchas], .hint, .next, .pulse, .blink, .active-target, [class*="hint"]') ? 1 : 0;
        return { i, vid: vid2, sejchas, imya: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40) };
      });
      const tekst = r.innerText.length + ':' + r.innerText.slice(0, 400).replace(/\d+/g, '#');
      const sost = tekst + ':' + hody.map((h) => h.imya).join('|')
        + ':' + [...r.querySelectorAll('[class]')].slice(0, 300).map((e) => e.className && e.className.baseVal === undefined ? e.className : '').join(' ').length;
      return { tekst, sost, hody };
    }, NE_TROGAT.source);
    const ne = hody.filter((h) => !isprobovano.has(sost + '#' + h.imya + '#' + h.i));
    if (!ne.length) throw new Error(hody.length ? `застрял: перепробовал ${hody.length} ход(ов), экран не меняется` : 'застрял: на экране игры нечего нажать');
    ne.sort((a, b) => b.sejchas - a.sejchas || (a.vid === 'kholst') - (b.vid === 'kholst'));
    const h = ne[0];
    isprobovano.add(sost + '#' + h.imya + '#' + h.i);
    const loc = koren.locator(`[data-prohod-hod="${h.i}"]`);
    const izmenilos = async () => (await koren.evaluate((r) => r.innerText.length + ':' + r.innerText.slice(0, 400).replace(/\d+/g, '#'))) !== tekst || await final();
    if (h.vid === 'derzhi') await palec.derzhi(loc, { poka: izmenilos, ms: 8000, opis: `держать «${h.imya}»` }).catch(() => {});
    else if (h.vid === 'vedi') await palec.vedi(loc, { opis: `вести «${h.imya}»`, shag: 4, pauza: 60, stop: izmenilos, derzhatPosle: 1500 });
    else if (h.vid === 'kholst') {
      await palec.tap(loc, `тап по холсту «${h.imya}»`).catch(() => {});
      if (!await izmenilos()) await palec.vedi(loc, { opis: `провести по холсту «${h.imya}»`, ot: 0.2, do: 0.8 }).catch(() => {});
    } else await palec.tap(loc, `тап «${h.imya}»`);
    await page.waitForTimeout(500);
  }
  if (await final()) return;
  throw new Error(`за ${VREMYA_IGRY / 1000} с финал не появился`);
}

// ---------- одна игра ----------
async function proyti(browser, base, id) {
  const imya = klyuch(id);
  const scenFile = path.join(SCENARII, `${imya}.mjs`);
  const scen = fs.existsSync(scenFile) ? await import(pathToFileURL(scenFile).href) : {};
  const { defaultBrowserType, ...telefon } = devices[TELEFON]; // движок — chromium (касания через CDP), профиль — телефона
  const ctx = await browser.newContext({ ...telefon, locale: 'ru-RU', serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const host = new URL(base).host;
  // Чужие адреса (счётчик, шрифты с CDN) — пустой ответ: проверяем игру, а не чужую сеть.
  await ctx.route((u) => u.host !== host, (r) => r.fulfill({ status: 200, body: '' }));
  const oshibki = [];
  page.on('console', (m) => { if (m.type() === 'error') oshibki.push(`консоль: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => oshibki.push(`ошибка скрипта: ${String(e.message || e).slice(0, 200)}`));
  page.on('response', (r) => { if (r.status() >= 400 && new URL(r.url()).host === host) oshibki.push(`не загрузилось ${r.status()}: ${new URL(r.url()).pathname}`); });
  const cdp = await ctx.newCDPSession(page);
  const log = [];
  const palec = new Palec(page, cdp, log);
  const snimok = path.join(OUT, `${imya}.png`);
  let itog;
  try {
    palec.shag('открыть страницу');
    await page.goto(new URL(id, base).href, { waitUntil: 'load', timeout: 30_000 });
    await page.waitForTimeout(800);
    // Плашка cookie внизу закрывает пол-экрана телефона — посетитель сначала её закрывает, так и проходчик.
    const cookie = page.locator('.rc-cookie-b .net').filter({ visible: true });
    if (await cookie.count()) await palec.tap(cookie.first(), 'закрыть плашку cookie («Отказаться»)');
    if (scen.default) {
      await scen.default(palec, page);
      palec.shag('финальный экран');
      if (scen.final) await palec.zhdi(scen.final, 8000, 'финальный экран');
    } else await obshchiy(page, palec, scen);
    await page.waitForTimeout(600);
    const fin = page.locator(scen.final || '[data-prohod-final]').filter({ visible: true }).first();
    if (await fin.count()) await fin.scrollIntoViewIfNeeded().catch(() => {});
    if (oshibki.length) throw new Error(oshibki[0]);
    itog = { id, ok: true, stroka: `ок      ${id} — финал за ${palec.n} шаг(ов)${scen.default ? ', по сценарию' : ''}` };
  } catch (e) {
    const prichina = oshibki.length && !/^(?:консоль|ошибка скрипта|не загрузилось)/.test(e.message) ? `${e.message}; ${oshibki[0]}` : e.message;
    itog = { id, ok: false, stroka: `провал  ${id} — ${palec.tekushchiy || 'старт'}: ${prichina}` };
  }
  await page.screenshot({ path: snimok }).catch(() => {});
  itog.snimok = snimok; itog.log = log; itog.oshibki = oshibki;
  await ctx.close();
  return itog;
}

// ---------- запуск ----------
async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let igry = arg('--igry', '') ? arg('--igry').split(',').map((s) => s.trim()).filter(Boolean) : null;
  let srv = null, base = URL0;
  if (!base) {
    if (!fs.existsSync(DIST)) { console.error(`prohod-igr: нет ${DIST} — сначала npm run build или --url`); process.exit(2); }
    srv = await server(DIST);
    base = `http://127.0.0.1:${srv.address().port}/`;
    if (!igry) igry = vseIgry();
    if (arg('--baza')) igry = zadetye(igry, arg('--baza'));
  }
  if (!igry || !igry.length) { console.log('prohod-igr: игр для прохода нет'); srv?.close(); return; }
  const browser = await chromium.launch();
  const itogi = [];
  for (const id of igry) {
    const r = await proyti(browser, base, id);
    console.log(r.stroka);
    itogi.push(r);
  }
  await browser.close();
  srv?.close();
  const ok = itogi.filter((r) => r.ok).length;
  const md = [`## Проходчик игр — прошли ${ok} из ${itogi.length} (телефон ${TELEFON})`, '',
    ...itogi.map((r) => `- ${r.stroka}`), '', '<details><summary>Шаги</summary>', '',
    ...itogi.flatMap((r) => [`### ${r.id}`, '', ...r.log.map((l) => `    ${l}`), ...r.oshibki.map((o) => `    ! ${o}`), '']), '</details>', ''];
  fs.writeFileSync(path.join(OUT, 'otchet.md'), md.join('\n'));
  console.log(`\nПроходчик: прошли ${ok} из ${itogi.length}; снимки и отчёт — ${OUT}/`);
  process.exit(ok === itogi.length ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(2); });
