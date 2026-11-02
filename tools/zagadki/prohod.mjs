import { createRequire } from 'module';
const { chromium } = createRequire('/home/agent/rc-site/node_modules/')('playwright');
const b = await chromium.launch();
const B = 'http://127.0.0.1:8569/muzei/izobreteniya/vau/zagadka.html';
const data = JSON.parse(await (await fetch('http://127.0.0.1:8569/muzei/izobreteniya/vau/zagadki-01.json')).text());
let ok = 0, oshibki = [];
for (let d = 1; d <= 31; d++) {
  const k = `01-${String(d).padStart(2, '0')}`, den = data.dni[k];
  const ctx = await b.newContext({ viewport: d === 12 ? { width: 390, height: 844 } : { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await ctx.newPage(); const kons = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) kons.push(m.text()); }); p.on('pageerror', (e) => kons.push(String(e)));
  await p.goto(`${B}?d=${k}`); await p.waitForSelector('.vopros.tek');
  const plan = [true, false, true];
  for (let i = 0; i < 3; i++) {
    const a = den.voprosy[i].a, j = plan[i] ? a : (a + 1) % den.voprosy[i].o.length;
    await p.locator(`.vopros[data-i="${i}"] button`).nth(j).click();
  }
  await p.click('#podelitsya');
  await p.waitForFunction(() => window.__zagadka.podelilis, null, { timeout: 5000 });
  const txt = await p.evaluate(() => window.__zagadka.podelilis);
  const zhd = `Русская цивилизация · ${d} января · ${den.predmet} 🟩⬛🟩 — 2 из 3\n${den.url}`;
  const vidno = await p.locator('.poyasn:visible').count();
  await p.waitForTimeout(900);
  if (d === 12 || d === 1) await p.screenshot({ path: `/tmp/r523/r569-zagadka-${k}-${d === 12 ? 390 : 1440}.png`, fullPage: true });
  if (txt === zhd && !kons.length && vidno === 3) ok++; else oshibki.push(`${k}: ${txt} | конс ${kons.join(';')} | пояснений ${vidno}`);
  if (d === 12) console.log('пример:', txt);
  await ctx.close();
}
console.log(`прошли ${ok} из 31`); oshibki.forEach((o) => console.log(o));
await b.close();
