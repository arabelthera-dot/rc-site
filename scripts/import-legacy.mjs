// Перенос данных из старого превью-репо в карточки нового сайта.
// Каталог музеев копируется как есть; данные календаря (calendar-*.js) — по карточке на день.
// Запуск: npm run import  (LEGACY — путь к rc-museum-preview, по умолчанию ~/rc-museum-preview)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import os from 'node:os';

const LEGACY = process.env.LEGACY || path.join(os.homedir(), 'rc-museum-preview');
const CATALOG = process.env.CATALOG ||
  path.join(os.homedir(), 'projects/russian-civilization/platform/catalog/museums.json');
const CALENDARS = { 'ne-sdayutsya': 'muzei/ne-sdayutsya/calendar-nesdayutsya.js' };

fs.copyFileSync(CATALOG, 'src/data/museums.json');

for (const [museum, rel] of Object.entries(CALENDARS)) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(LEGACY, rel), 'utf8'), ctx);
  const cal = ctx.window.MUSEUM_CALENDAR;
  const meta = { total: cal.total ?? 365, dated: cal.dated !== false };
  const out = path.join('src/content/days', museum);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  let n = 0;
  for (const [key, it] of Object.entries(cal)) {
    if (!/^\d\d-\d\d$/.test(key)) continue;
    const card = { museum, key, title: it.t, year: it.y ?? undefined, hook: it.d,
      mechanic: it.mech ?? undefined, source: it.src ?? undefined,
      legacy_page: it.href ? `${path.dirname(rel)}/${it.href}` : undefined };
    fs.writeFileSync(path.join(out, `${key}.json`), JSON.stringify(card, null, 2) + '\n');
    n++;
  }
  fs.writeFileSync(path.join('src/data', `calendar-meta-${museum}.json`), JSON.stringify(meta) + '\n');
  console.log(`${museum}: ${n} карточек`);
}
