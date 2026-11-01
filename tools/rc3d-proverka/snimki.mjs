// Бот вида rc3d: открывает сцену в заданном окне, снимает ключевые кадры, меряет кадры/с, вес и консоль.
// Запуск — только через proverka.py (он ставит окружение). Аргументы: S=<сцена> W H OUT=<папка>.
import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
const require = createRequire(process.env.PW_FROM || '/home/agent/projects/agent-env/shot/x.js');
const { chromium } = require('playwright');
const S = process.env.S, W = +process.env.W, H = +process.env.H, OUT = process.env.OUT, PORT = process.env.PORT || 8777;
mkdirSync(OUT, { recursive: true });
const R = { scena: S, okno: `${W}x${H}`, kadry: [], oshibki: [], preduprezhdeniya: [], propushcheno: [], zaprosy: [], fps: { z: [], g: [] }, vremya: {} };
const AUDIO = /AudioContext was not allowed to start/;
const b = await chromium.launch({ executablePath: process.env.CH, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
p.on('pageerror', (e) => R.oshibki.push('pageerror: ' + e.message));
p.on('console', (m) => {
  const t = m.type(), x = m.text();
  if (AUDIO.test(x)) { R.propushcheno.push(x.slice(0, 80)); return; }
  if (t === 'error') R.oshibki.push('console.error: ' + x);
  else if (t === 'warning') R.oshibki.push('console.warn: ' + x);
});
p.on('requestfailed', (q) => R.oshibki.push('запрос не прошёл: ' + q.url() + ' ' + (q.failure()?.errorText || '')));
p.on('response', (r) => { R.zaprosy.push({ url: r.url(), status: r.status() }); if (r.status() >= 400) R.oshibki.push(`HTTP ${r.status()}: ${r.url()}`); });
const shot = async (sel, imya) => { const f = `${OUT}/${imya}.png`; await p.locator(sel).screenshot({ path: f, animations: 'allow', timeout: 120000 }); R.kadry.push(imya); };
// Самый длинный идущий прогон таймлайна (setup-прогоны мгновенные и в runs не попадают).
const RUN = (k) => `(() => { const rs = __rc3d.${k}.S.runs; return rs.length ? rs.reduce((a, r) => (r.end > a.end ? r : a)) : null; })()`;
// Стоп-кадр: на первом кадре, где таймлайн дошёл до h, время сцены замирает (timeK = 0) — снимок повторяем.
const freeze = (k, h) => p.waitForFunction(new Function('h', `const r = ${RUN(k)}, S = __rc3d.${k}.S; if (!r || r.T >= h) { S.__k = S.timeK; S.timeK = 0; return true; } return false;`), h, { timeout: 240000, polling: 'raf' });
const thaw = (k) => p.evaluate(`(S => { S.timeK = S.__k ?? 1; })(__rc3d.${k}.S)`);
const sample = (k, ms) => { const id = setInterval(async () => { try { const f = await p.evaluate(`__rc3d.${k}.S.fps`); if (f) R.fps[k].push(f); } catch {} }, 500); return () => clearInterval(id); };
const t0 = Date.now();
try {
  await p.goto(`http://localhost:${PORT}/muzei/izobreteniya/_proba-rc3d.html?s=${S}&v=${Date.now()}`);
  await p.waitForFunction(() => window.__rc3d && window.__rc3d.ready, null, { timeout: 90000 });
  R.vremya.zagruzka = (Date.now() - t0) / 1000;
  // ── Заставка: середина ──
  if (await p.evaluate(() => !!(__rc3d.z && __rc3d.z.S))) {
    await p.locator('#zStage').scrollIntoViewIfNeeded();
    await p.waitForFunction(new Function(`const r = ${RUN('z')}; return r && r.T > 0;`), null, { timeout: 60000, polling: 100 });
    const end = await p.evaluate(new Function(`return ${RUN('z')}.end;`));
    R.vremya.zastavka = end;
    const stop = sample('z');
    await freeze('z', end / 2); stop();
    await p.waitForTimeout(300); await shot('#zStage', 'z-seredina'); await thaw('z');
  }
  // ── Игра: верный вариант — начало, середина, итог ──
  const ok = await p.evaluate(() => (__rc3d.sc.igra.outcomes || []).find((o) => o.result === 'ok'));
  if (!ok) R.oshibki.push('в сценарии нет верного исхода (result: ok)');
  else {
    const when = Object.fromEntries(Object.entries(ok.when || {}).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]).filter(([, v]) => v !== '*'));
    R.verno = when;
    await p.locator('#gStage').scrollIntoViewIfNeeded();
    await p.evaluate((c) => { for (const [k, v] of Object.entries(c)) __rc3d.g.pick(k, v); }, when);
    await p.waitForTimeout(2500); await shot('#gStage', 'g-nachalo');
    await p.evaluate(() => __rc3d.g.go());
    await p.waitForFunction(new Function(`const r = ${RUN('g')}; return r && r.T > 0;`), null, { timeout: 30000, polling: 100 });
    const end = await p.evaluate(new Function(`return ${RUN('g')}.end;`));
    R.vremya.igra = end;
    const stop = sample('g');
    await freeze('g', end / 2); stop();
    await p.waitForTimeout(300); await shot('#gStage', 'g-seredina'); await thaw('g');
    const stop2 = sample('g');
    await p.waitForFunction(() => __rc3d.g.st().phase === 'itog', null, { timeout: 240000, polling: 200 });
    stop2(); await p.waitForTimeout(1200); await shot('#gStage', 'g-itog');
    R.itog = await p.evaluate(() => __rc3d.g.st());
  }
} catch (e) { R.oshibki.push('бот: ' + e.message.split('\n')[0]); }
R.vremya.vsego = (Date.now() - t0) / 1000;
writeFileSync(`${OUT}/bot.json`, JSON.stringify(R, null, 1));
await b.close();
