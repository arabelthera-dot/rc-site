// Один общий проходчик игр (Р204–Р205). Игра описана коротким сценарием tests/igry/scenarii/<страница>.mjs:
//   put    — адрес страницы от корня сайта (без «/» в начале — работает и на превью с подпапкой);
//   igra   — корень игры (по умолчанию [data-igra-sekciya], иначе #games);
//   final  — что видно, когда игра пройдена (по умолчанию контракт: [data-igra-final] или
//            [data-igra-sostoyanie="final"], см. assets/igra-pravila.js);
//   shagi  — шаги пальцем: { tap }, { hold, ms }, { swipe, dx, dy, ot, ms }, { zhdi }, { pauza },
//            { povtor: [...], poka, max }; у шага — imya для отчёта, gde: [доля x, доля y] внутри элемента.
//            Нет shagi — игра проходится сама по разметке: элементы с data-igra-hod="tap|hold:мс|swipe:dx,dy"
//            по порядку (data-igra-poryadok), пока не появится финал.
// Провал: шаг не выполнился, финал не появился, ошибка JS или консоли, битый ресурс своего сайта.
// Перед игрой — «Начать» блока «Как играть» (data-igra-start), если он есть.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { palec } from './palec.mjs';

const PAPKA = path.join(import.meta.dirname, 'scenarii');
const TOLKO = process.env.IGRY_TOLKO?.split(',');
const SNIMKI = process.env.IGRY_SNIMKI !== '0';
const FINAL_KONTRAKT = '[data-igra-final]:not([hidden]), [data-igra-sostoyanie="final"]';

const scenarii = [];
for (const f of fs.readdirSync(PAPKA).filter((f) => f.endsWith('.mjs')).sort()) {
  const id = f.replace(/\.mjs$/, '');
  if (TOLKO && !TOLKO.some((t) => id.includes(t))) continue;
  scenarii.push({ id, ...(await import(path.join(PAPKA, f))).default });
}

const vidimyy = (page, sel) => page.locator(sel).filter({ visible: true }).first();

async function shag(page, p, s, final) {
  if (s.povtor) {
    for (let i = 0; i < (s.max ?? 20); i++) {
      if (s.poka && await page.locator(s.poka).filter({ visible: true }).count()) return;
      for (const v of s.povtor) await shag(page, p, v, final);
    }
    if (s.poka) await expect(page.locator(s.poka).filter({ visible: true }).first(), `не дождались «${s.poka}»`).toBeVisible();
    return;
  }
  const imya = s.imya || Object.entries(s).filter(([k]) => k !== 'gde').map(([k, v]) => `${k} ${v}`).join(', ');
  await test.step(imya, async () => {
    if (s.pauza) return page.waitForTimeout(s.pauza);
    const sel = s.tap || s.hold || s.swipe || s.zhdi;
    const loc = vidimyy(page, sel);
    await expect(loc, `не появилось «${sel}»`).toBeVisible({ timeout: s.zhdat ?? 10_000 });
    if (s.tap) await p.tap(loc, s.gde);
    else if (s.hold) await p.hold(loc, s.ms ?? 1500, s.gde);
    else if (s.swipe) await p.swipe(loc, s.dx ?? 0, s.dy ?? 0, { ot: s.gde, ms: s.ms });
    if (s.posle) await page.waitForTimeout(s.posle);
  });
}

// Проход по разметке data-igra-hod — для игр без сценария.
async function avto(page, p, igra, final) {
  for (let i = 0; i < 60; i++) {
    if (await page.locator(final).filter({ visible: true }).count()) return;
    const hody = await igra.locator('[data-igra-hod]').filter({ visible: true }).all();
    const zhivye = [];
    for (const h of hody) if (await h.isEnabled() && (await h.getAttribute('aria-disabled')) !== 'true') zhivye.push(h);
    if (!zhivye.length) throw new Error('нет ни хода data-igra-hod, ни финала');
    const nomer = await Promise.all(zhivye.map(async (h) => +(await h.getAttribute('data-igra-poryadok') ?? 1e9)));
    const h = zhivye[nomer.indexOf(Math.min(...nomer))];
    const [vid, arg = ''] = (await h.getAttribute('data-igra-hod')).split(':');
    await test.step(`ход ${i + 1}: ${vid} «${(await h.innerText()).trim().slice(0, 40)}»`, async () => {
      if (vid === 'hold') await p.hold(h, +arg || 1500);
      else if (vid === 'swipe') { const [dx, dy] = arg.split(',').map(Number); await p.swipe(h, dx || 0, dy || 0); }
      else await p.tap(h);
      await page.waitForTimeout(300);
    });
  }
}

for (const sc of scenarii) {
  test(`${sc.id} (${sc.imya})`, async ({ page, browserName }, info) => {
    const oshibki = [];
    page.on('pageerror', (e) => oshibki.push(`ошибка JS: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') oshibki.push(`консоль: ${m.text().slice(0, 200)}`); });
    const svoy = new URL(info.project.use.baseURL).origin;
    page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(svoy)) oshibki.push(`${r.status()} ${r.url()}`); });
    page.on('requestfailed', (r) => { if (r.url().startsWith(svoy)) oshibki.push(`не загрузилось ${r.url()}`); });

    const p = await palec(page, browserName);
    info.annotations.push({ type: 'ввод', description: p.vvod });
    const otvet = await test.step('открыть страницу', () => page.goto(sc.put, { waitUntil: 'load' }));
    if (otvet?.status() === 404) test.skip(true, `страницы ${sc.put} нет в сборке`);
    expect(otvet?.status(), 'код ответа').toBe(200);
    const igra = page.locator(sc.igra || '[data-igra-sekciya], #games').first();
    await expect(igra, 'нет игры на странице').toBeVisible();
    await igra.scrollIntoViewIfNeeded();
    const maska = [page.locator('canvas, video')];
    if (SNIMKI) await test.step('снимок старта против эталона', () =>
      expect.soft(page, 'снимок старта отличается от эталона').toHaveScreenshot(`${sc.id}-start.png`, { mask: maska }));

    const start = igra.locator('[data-igra-start]').filter({ visible: true });
    if (await start.count()) await test.step('«Начать» в «Как играть»', () => p.tap(start.first()));

    const final = sc.final || FINAL_KONTRAKT;
    if (sc.shagi) for (const s of sc.shagi) await shag(page, p, s, final);
    else await avto(page, p, igra, final);

    await test.step('финал игры', async () => {
      const f = page.locator(final).filter({ visible: true }).first();
      await expect(f, `финал «${final}» не появился`).toBeVisible({ timeout: sc.zhdatFinal ?? 15_000 });
      await f.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800); // плавная прокрутка к финалу у игр
      await info.attach('финал', { body: await page.screenshot(), contentType: 'image/png' });
      if (SNIMKI) await expect.soft(page, 'снимок финала отличается от эталона').toHaveScreenshot(`${sc.id}-final.png`, { mask: maska });
    });
    await test.step('ошибок консоли нет', () => expect(oshibki, 'ошибки на странице').toEqual([]));
  });
}
