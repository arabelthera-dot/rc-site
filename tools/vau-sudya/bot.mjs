// Бот судьи «вау по кадру»: открывает 3D-сцену дня (страницу или голую модель .glb), снимает 4 стороны,
// меряет загрузку, кадры/с, текст поверх сцены; режим «слабый телефон» и режим «без WebGL».
// Запуск — только через tools/vau-sudya.py (он ставит окружение). Вход — переменная VS (JSON):
//   {url, start, stage, rezhim: 'pk'|'tel'|'bez-webgl', out, glb: true|false}
import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
const require = createRequire(process.env.PW_FROM || '/home/agent/projects/agent-env/shot/x.js');
const { chromium } = require('playwright');
const A = JSON.parse(process.env.VS);
mkdirSync(A.out, { recursive: true });
const R = { rezhim: A.rezhim, url: A.url, kadry: [], oshibki: [], vremya: {}, fps: null, render: null, tekst_poverh: [], zapas: null };

const GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const b = await chromium.launch({ executablePath: process.env.CH, args: A.rezhim === 'bez-webgl' ? ['--disable-webgl', '--disable-3d-apis'] : GL });
const okno = A.rezhim === 'tel'
  ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
  : { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 };
const ctx = await b.newContext(okno);
// Счётчик отрисовок: каждый вызов draw* в WebGL; кадр считается отрисованным, если между двумя rAF были draw-вызовы.
await ctx.addInitScript(() => {
  const V = (window.__vs = { draws: 0, frames: 0, gl: [] });
  const og = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, ...r) {
    const c = og.call(this, t, ...r);
    if (c && /webgl/.test(t) && !c.__vs) {
      c.__vs = 1; V.gl.push(this);
      for (const m of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced', 'drawRangeElements']) {
        const f = c[m]; if (f) c[m] = function (...a) { V.draws++; return f.apply(this, a); };
      }
    }
    return c;
  };
  let last = 0;
  const tick = () => { if (V.draws !== last) { V.frames++; last = V.draws; } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const p = await ctx.newPage();
p.on('pageerror', (e) => R.oshibki.push('pageerror: ' + e.message.slice(0, 200)));
p.on('console', (m) => { if (m.type() === 'error') R.oshibki.push('console.error: ' + m.text().slice(0, 200)); });
if (A.rezhim === 'tel') {
  // Слабый телефон: процессор ×4 медленнее, сеть «быстрый 3G» (1,6 Мбит/с, 150 мс).
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 90000 });
}

const stageSel = A.stage || '[data-igra-scena]';
const glCanvas = () => p.evaluate((sel) => {
  const st = document.querySelector(sel);
  const c = __vs.gl.find((c) => c.isConnected && c.getBoundingClientRect().width > 50 && (!st || st.contains(c) || c.contains(st) || st === c));
  if (!c) return null;
  const r = c.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
}, stageSel);
const snimok = async (imya) => {
  const f = `${A.out}/${imya}.png`;
  const el = A.glb ? p.locator('canvas') : p.locator(stageSel).first();
  await el.screenshot({ path: f, animations: 'allow', timeout: 20000 });
  R.kadry.push(imya);
};
// Поворот на 90°: OrbitControls поворачивает на 2π·dx/высота, значит четверть оборота — сдвиг на высоту/4.
const povorot = async (g) => {
  if (A.glb) { await p.evaluate(() => __vs.povorot(90)); return; }
  const cx = g.x + g.w / 2, cy = g.y + g.h / 2, dx = g.h / 4;
  await p.mouse.move(cx, cy); await p.mouse.down();
  for (let i = 1; i <= 10; i++) await p.mouse.move(cx + (dx * i) / 10, cy, { steps: 2 });
  await p.mouse.up();
};

const t0 = Date.now();
try {
  await p.goto(A.url, { waitUntil: 'load', timeout: 60000 });
  R.vremya.stranica = (Date.now() - t0) / 1000;
  if (!A.glb) {
    await p.locator(stageSel).first().scrollIntoViewIfNeeded({ timeout: 10000 });
    if (A.start) {
      const s = p.locator(A.start).first();
      if (await s.isVisible().catch(() => false)) await s.click();
    }
  }
  if (A.rezhim === 'bez-webgl') {
    // Запас 2D: сцены нет, а человек видит рабочую игру — видимую ссылку/блок «без 3D» или 2D-рисунок на месте сцены.
    await p.waitForTimeout(6000);
    R.zapas = await p.evaluate((sel) => {
      const vid = (e) => { if (!e) return false; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const st = document.querySelector(sel);
      const ssylki = [...document.querySelectorAll('a[href^="#"]')].filter(vid).filter((a) => /2d|без 3d/i.test(a.textContent + a.getAttribute('href')));
      const cel = ssylki.map((a) => document.querySelector(a.getAttribute('href'))).find((e) => e && e.querySelector('button, canvas, svg, [role=button]'));
      const risunok = st && [...st.querySelectorAll('img, svg, canvas, video')].some((e) => vid(e) && !__vs.gl.includes(e));
      const tekst = st ? (st.closest('[data-igra]') || st.parentElement).innerText.match(/[^.\n]*(2D|без 3D)[^.\n]*/i)?.[0] || '' : '';
      return { webgl: __vs.gl.length, ssylka: ssylki[0]?.textContent.trim() || '', cel_rabochaya: !!cel, risunok_v_scene: !!risunok, tekst };
    }, stageSel);
    await snimok('bez-webgl');
  } else {
    // Готово = есть WebGL-холст и на нём уже нарисовано ≥ 3 кадров.
    await p.waitForFunction((sel) => {
      const c = __vs.gl.find((c) => c.isConnected && c.getBoundingClientRect().width > 50);
      return c && __vs.frames >= 3;
    }, stageSel, { timeout: A.rezhim === 'tel' ? 90000 : 45000, polling: 100 });
    R.vremya.do_3d = (Date.now() - t0) / 1000;
    R.render = await p.evaluate(() => {
      const c = document.createElement('canvas').getContext('webgl');
      const e = c && c.getExtension('WEBGL_debug_renderer_info');
      return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : '?';
    });
    await p.waitForTimeout(2500);   // дать сцене дорисовать модели и свет после первого кадра
    // Кадры/с: отрисованные кадры за 4 с.
    const f0 = await p.evaluate(() => __vs.frames); await p.waitForTimeout(4000);
    R.fps = Math.round(((await p.evaluate(() => __vs.frames)) - f0) / 4 * 10) / 10;
    // Шапка и плашки сайта (fixed/sticky) не часть сцены: прячем на время снимков, иначе закрывают верх кадра и путают проверку текста.
    if (!A.glb) {
      await p.evaluate((sel) => {
        const st = document.querySelector(sel);
        for (const e of document.querySelectorAll('body *')) {
          const ps = getComputedStyle(e).position;
          if ((ps === 'fixed' || ps === 'sticky') && !e.contains(st) && !st.contains(e)) e.style.visibility = 'hidden';
        }
        st.scrollIntoView({ block: 'center' });
      }, stageSel);
      await p.waitForTimeout(800);
    }
    const g = await glCanvas();
    R.holst = g;
    if (A.rezhim === 'tel') await snimok('tel');
    else {
      // Текст поверх сцены: элемент со своим видимым текстом, лежащий на холсте и видимый в точке (не закрыт холстом).
      R.tekst_poverh = await p.evaluate((g) => {
        const out = [];
        for (const e of document.querySelectorAll('body *')) {
          const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
          if (own.length < 2) continue;
          const r = e.getBoundingClientRect(), s = getComputedStyle(e);
          if (!r.width || !r.height || s.visibility === 'hidden' || +s.opacity === 0) continue;
          const ix = Math.max(0, Math.min(r.right, g.x + g.w) - Math.max(r.left, g.x)), iy = Math.max(0, Math.min(r.bottom, g.y + g.h) - Math.max(r.top, g.y));
          if (ix * iy < 0.3 * r.width * r.height) continue;
          const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          if (t && (t === e || e.contains(t))) out.push(own.slice(0, 60));
        }
        return out;
      }, g);
      for (const [i, imya] of ['1-pered', '2-bok', '3-zad', '4-bok2'].entries()) {
        if (i) { await povorot(g); await p.waitForTimeout(4000); }   // плавное затухание камеры доворачивает угол за десятки кадров
        await snimok(imya);
      }
    }
  }
} catch (e) { R.oshibki.push('бот: ' + e.message.split('\n')[0]); }
R.vremya.vsego = (Date.now() - t0) / 1000;
writeFileSync(`${A.out}/bot.json`, JSON.stringify(R, null, 1));
await b.close();
