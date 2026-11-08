// Р649 п.15 шаг 2: слепок правил CSS страницы дня — блоки <style> (и вставленные скриптами), подключённые файлы.
// Нужен proba.mjs: значения, записанные в этих правилах числом, а не переменной таблицы, тоже сводятся к цели.
// Запуск: node dizayn/proba/pravila.mjs <адрес страницы> <выход.json>; браузер — playwright из devDependencies.
import { chromium } from 'playwright';
import fs from 'node:fs';
const [U, OUT] = process.argv.slice(2);
const b = await chromium.launch();
const vse = new Map();
for (const width of [1440, 390]) {
  const page = await b.newPage({ viewport: { width, height: 900 } });
  await page.goto(U, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(1500);
  const pr = await page.evaluate(() => {
    const out = [];
    const walk = (list, media) => { for (const r of list) {
      if (r instanceof CSSMediaRule) walk(r.cssRules, [...media, r.conditionText]);
      else if (r instanceof CSSSupportsRule) walk(r.cssRules, media);
      else if (r instanceof CSSStyleRule) { const d = {}; for (const p of r.style) d[p] = [r.style.getPropertyValue(p), r.style.getPropertyPriority(p)]; out.push({ media, sel: r.selectorText, d }); } } };
    for (const s of document.styleSheets) { const href = s.href || ''; if (/rc-dizayn|\/fonts\//.test(href)) continue; try { walk(s.cssRules, s.media.mediaText && s.media.mediaText !== 'all' ? [s.media.mediaText] : []); } catch {} }
    return out;
  });
  for (const r of pr) vse.set(JSON.stringify(r), r);
  await page.close();
}
await b.close();
fs.writeFileSync(OUT, JSON.stringify([...vse.values()]));
console.log(`${OUT}: ${vse.size} правил`);
