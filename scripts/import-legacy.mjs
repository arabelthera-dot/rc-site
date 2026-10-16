// Перенос данных в карточки нового сайта.
// Каталог музеев копируется как есть. Календари — все muzei/<музей>/calendar-*.js старого сайта.
// Есть утверждённые месячные файлы музея (APPROVED) — карточка из них (название, год, хук, механика,
// источник, суть), из calendar-*.js только ссылка на готовую страницу дня и конфиг года.
// Нет — карточка 1:1 из calendar-*.js: t → название, y → год, d → хук, mech/m → механика, src → источник.
// Запуск: npm run import  (LEGACY — путь к rc-museum-preview, по умолчанию ~/rc-museum-preview)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import os from 'node:os';

const LEGACY = process.env.LEGACY || path.join(os.homedir(), 'rc-museum-preview');
const CATALOG = process.env.CATALOG ||
  path.join(os.homedir(), 'projects/russian-civilization/platform/catalog/museums.json');
const PROJECT = process.env.PROJECT || path.join(os.homedir(), 'projects/russian-civilization');
const APPROVED = { 'ne-sdayutsya': 'pilot-nesdayutsya' };
// Музей не переносится, пока у него недоделка переноса; старый календарь работает (план переезда 15.10).
// Текст, который паспорту дня не отвечает, переносится как есть (Сергей 16.10) — исключение в passport-waivers.json.
const HOLD = {
  // Не решение Сергея — недоделка переноса: источник дня в старом календаре не записан, он внутри страницы.
  arhitektura: 'у 7 дней со страницей источник только внутри страницы — извлечение следующим куском',
  izobreteniya: 'у 25 дней со страницей источник только внутри страницы — извлечение следующим куском',
  karikatura: 'у 6 дней со страницей источник только внутри страницы — извлечение следующим куском',
  literatura: 'у 1 дня со страницей источник только внутри страницы — извлечение следующим куском',
  pervoprohodcy: 'у 5 дней со страницей источник только внутри страницы — извлечение следующим куском',
};
const loadCalendar = (rel) => {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(LEGACY, rel), 'utf8'), ctx);
  return ctx.window.MUSEUM_CALENDAR;
};
// Календарь музея — тот calendar-*.js, где лежит MUSEUM_CALENDAR (у изобретений calendar-data.js пустой).
const CALENDARS = {};
for (const museum of fs.readdirSync(path.join(LEGACY, 'muzei')).sort()) {
  const dir = path.join(LEGACY, 'muzei', museum);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir).filter((x) => /^calendar-.*\.js$/.test(x)).sort()) {
    if (loadCalendar(`muzei/${museum}/${f}`)) { CALENDARS[museum] = `muzei/${museum}/${f}`; break; }
  }
}
const isKey = (k) => /^\d\d-\d\d$/.test(k);
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

// Картинки дня — кадры готовой страницы старого сайта, но только записанные в ведомости прав музея
// (muzei/<музей>/rights.json: автор, лицензия, источник). Кадра нет в ведомости — в карточку не идёт:
// источник не выдумывается. Подпись — figcaption страницы, иначе описание из ведомости.
const decode = (t) => t.replace(/&quot;/g, '"').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
  .replace(/&mdash;/g, '—').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const strip = (t) => squash(decode(t.replace(/<[^>]+>/g, ' ')));
function pageImages(museum, legacyPage, rights, skipped) {
  const html = fs.readFileSync(path.join(LEGACY, legacyPage), 'utf8');
  const caps = {};
  for (const f of html.matchAll(/<figure[\s\S]*?<\/figure>/g)) {
    const src = f[0].match(/<img[^>]*\ssrc="([^"]+)"/)?.[1];
    const cap = f[0].match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1];
    if (src && cap && !caps[src]) caps[src] = strip(cap);
  }
  const seen = new Set();
  const images = [];
  for (const m of html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)) {
    const file = m[1];
    if (seen.has(file) || file.includes('/')) continue;
    seen.add(file);
    const r = rights.find((x) => x.file === file);
    if (!r) { skipped.push(`${legacyPage}: ${file}`); continue; }
    fs.mkdirSync(path.join('public/muzei', museum, 'img'), { recursive: true });
    fs.copyFileSync(path.join(LEGACY, path.dirname(legacyPage), file), path.join('public/muzei', museum, 'img', file));
    images.push({ src: `muzei/${museum}/img/${file}`, caption: caps[file] || squash(r.description.replace(/\s*—\s*замена кадра[\s\S]*$/, '')),
      credit: `${r.artist}, ${r.license}, Wikimedia Commons: ${r.source}` });
  }
  return images;
}

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
  const out = path.join('src/content/days', museum);
  fs.rmSync(out, { recursive: true, force: true });
  if (HOLD[museum]) { fs.rmSync(path.join('src/data', `calendar-meta-${museum}.json`), { force: true }); console.log(`${museum}: не перенесён — ${HOLD[museum]}`); continue; }
  const cal = loadCalendar(rel);
  const keys = Object.keys(cal).filter(isKey);
  // Состав карточки календаря — как у старого: механика и источник только там, где они были.
  const card = ['mech', 'src'].filter((f) => keys.some((k) => cal[k][f]));
  const meta = { total: cal.total ?? 365, dated: cal.dated !== false, ...(card.length && { card }) };
  fs.mkdirSync(out, { recursive: true });
  const rightsFile = path.join(LEGACY, path.dirname(rel), 'rights.json');
  const rights = fs.existsSync(rightsFile) ? JSON.parse(fs.readFileSync(rightsFile, 'utf8')) : [];
  const skipped = [];
  fs.rmSync(path.join('public/muzei', museum, 'img'), { recursive: true, force: true });
  let n = 0;
  const write = (key, card) => {
    const href = cal[key]?.href;
    card.legacy_page = href ? `${path.dirname(rel)}/${href}` : undefined;
    if (card.legacy_page) card.images = pageImages(museum, card.legacy_page, rights, skipped);
    fs.writeFileSync(path.join(out, `${key}.json`), JSON.stringify({ museum, key, ...card }, null, 2) + '\n');
    n++;
  };
  if (APPROVED[museum]) MONTHS.forEach((name, i) => {
    const file = path.join(PROJECT, APPROVED[museum], `calendar-${name}.md`);
    for (const u of parseMonth(file)) {
      write(`${String(i + 1).padStart(2, '0')}-${String(u.day).padStart(2, '0')}`, { title: u.title,
        year: u.year ? Number(u.year) : undefined, hook: u.hook, mechanic: u.mechanic, source: u.source,
        gist: u.gist?.replace(NOTE, '').trim() });
    }
  });
  else for (const key of keys) {
    const it = cal[key];
    write(key, { title: it.t, year: it.y, hook: it.d, mechanic: it.mech ?? it.m, source: it.src });
  }
  fs.writeFileSync(path.join('src/data', `calendar-meta-${museum}.json`), JSON.stringify(meta) + '\n');
  console.log(`${museum}: ${n} карточек`);
  if (skipped.length) console.log(`  без записи в ведомости прав, не перенесено (${skipped.length}): ${skipped.join('; ')}`);
}
