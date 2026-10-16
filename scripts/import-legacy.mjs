// Перенос данных в карточки нового сайта.
// Каталог музеев копируется как есть. Карточка дня — из утверждённых месячных файлов музея
// (название, год, хук, механика, источник, суть); из старого calendar-*.js — только ссылка
// на готовую страницу дня и конфиг года.
// Запуск: npm run import  (LEGACY — путь к rc-museum-preview, по умолчанию ~/rc-museum-preview)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import os from 'node:os';

const LEGACY = process.env.LEGACY || path.join(os.homedir(), 'rc-museum-preview');
const CATALOG = process.env.CATALOG ||
  path.join(os.homedir(), 'projects/russian-civilization/platform/catalog/museums.json');
const PROJECT = process.env.PROJECT || path.join(os.homedir(), 'projects/russian-civilization');
const CALENDARS = { 'ne-sdayutsya': 'muzei/ne-sdayutsya/calendar-nesdayutsya.js' };
const APPROVED = { 'ne-sdayutsya': 'pilot-nesdayutsya' };
const MONTHS = ['01-yanvar', '02-fevral', '03-mart', '04-aprel', '05-may', '06-iyun',
  '07-iyul', '08-avgust', '09-sentyabr', '10-oktyabr', '11-noyabr', '12-dekabr'];

// Разбор утверждённого месяца — те же правила, что у pilot-nesdayutsya/gen-calendar.py.
const HEAD = /^##\s+День\s+(\d+)\s+—\s+(.+?)\s*$/;
const HOOK = /^\*\*Хук:\*\*\s*«(.+)»/;
const MECH = /^\*\*Механика:\*\*\s*M-\d+\s*·\s*«[^»]+»\s*—\s*(.+?)\s*$/;
const SRC = /^\*\*Источник:\*\*\s*(.+?)\s*$/;
const GIST = /^Суть:\s*(.+?)\s*$/;
const YEAR = /\b(1[0-9]{3}|20[0-2][0-9])\b/;
const squash = (t) => t.replace(/\s+/g, ' ').trim();
// Рабочие пометки авторов («(Детали — факт-чек.)») посетителю не показываются; в таблицах остаются.
const NOTE = /\s*\([^()]*факт-чек[^()]*\)/g;

function parseMonth(file) {
  const units = [];
  let u = null;
  let inGist = false;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    // «Суть» в утверждённых таблицах бывает в несколько строк — до пустой строки или нового поля.
    if (inGist && line.trim() && !/^(\*\*|##)/.test(line)) { u.gist = squash(`${u.gist} ${line}`); continue; }
    inGist = false;
    const h = line.match(HEAD);
    if (h) {
      u = { day: Number(h[1]), title: h[2].replace(/\s*\([^()]*\)\s*$/, '').trim(),
        year: h[2].match(YEAR)?.[1] };
      units.push(u);
      continue;
    }
    if (!u) continue;
    let m;
    if (!u.hook && (m = line.match(HOOK))) u.hook = squash(m[1]).replace(/„([^„“"«»]*)["“]/g, '«$1»');
    else if (!u.mechanic && (m = line.match(MECH))) {
      const t = m[1].replace(/\s*\([^()]*\bM-\d+[^()]*\)/g, '').trim();
      u.mechanic = t[0].toUpperCase() + t.slice(1);
    } else if (!u.source && (m = line.match(SRC))) u.source = squash(m[1]);
    else if (!u.gist && (m = line.match(GIST))) { u.gist = squash(m[1]); inGist = true; }
  }
  return units;
}

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
  MONTHS.forEach((name, i) => {
    const file = path.join(PROJECT, APPROVED[museum], `calendar-${name}.md`);
    for (const u of parseMonth(file)) {
      const key = `${String(i + 1).padStart(2, '0')}-${String(u.day).padStart(2, '0')}`;
      const href = cal[key]?.href;
      const card = { museum, key, title: u.title, year: u.year ? Number(u.year) : undefined,
        hook: u.hook, mechanic: u.mechanic, source: u.source, gist: u.gist?.replace(NOTE, '').trim(),
        legacy_page: href ? `${path.dirname(rel)}/${href}` : undefined };
      fs.writeFileSync(path.join(out, `${key}.json`), JSON.stringify(card, null, 2) + '\n');
      n++;
    }
  });
  fs.writeFileSync(path.join('src/data', `calendar-meta-${museum}.json`), JSON.stringify(meta) + '\n');
  console.log(`${museum}: ${n} карточек`);
}
