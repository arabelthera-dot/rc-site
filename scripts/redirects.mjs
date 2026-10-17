// Опись старых музейных адресов rc-museum-preview → адрес нового сайта (план, шаг 4:
// «ни одна разосланная ссылка не умирает»). Пишет src/data/redirects.json — его читает
// src/integrations/legacy-redirects.mjs — и печатает, куда ушёл каждый адрес и почему.
// Порядок: страница-переадресация старого сайта → идём по её цепочке; карточка дня
// с legacy_page → её день; index/calendar → музей/календарь; иначе главная музея,
// а музея на новом сайте нет — главная города. Адрес, совпадающий с новым
// (muzei/<м>/index.html = /muzei/<м>/), в опись не идёт — переадресовывать нечего.
// Запуск: node scripts/redirects.mjs  (LEGACY — путь к rc-museum-preview)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const LEGACY = process.env.LEGACY || path.join(os.homedir(), 'rc-museum-preview');
// Пилоты pilot-<музей>/ публиковались из рабочего проекта — ссылки на них разосланы (17.10).
const RC = process.env.RC || path.join(os.homedir(), 'projects', 'russian-civilization');
// Старое имя папки → slug нового сайта (нет в списке и нет музея — главная города).
const ALIAS = { nesdayutsya: 'ne-sdayutsya', 'kostyum-russkiy': 'narodnyy-kostyum', kostyum: 'narodnyy-kostyum' };
const slugOf = (d) => ALIAS[d] || d;
const DAYS = 'src/content/days';

// Страница музея на новом сайте есть у каждого музея каталога, календарь — у музеев с днями.
const museums = new Set(JSON.parse(fs.readFileSync('src/data/museums.json', 'utf8')).museums.map((m) => m.slug));
const withDays = new Set(fs.readdirSync(DAYS));
const byLegacy = new Map();
for (const m of withDays) for (const f of fs.readdirSync(path.join(DAYS, m))) {
  const d = JSON.parse(fs.readFileSync(path.join(DAYS, m, f), 'utf8'));
  if (d.legacy_page) byLegacy.set(d.legacy_page, `/muzei/${m}/den/${d.key}/`);
}

const walk = (dir) => fs.readdirSync(path.join(LEGACY, dir), { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.html') ? [path.join(dir, e.name)] : []);
// Служебные календари месяца review/<музей>-calendar-*.html — на них ссылаются полные страницы дней.
const REVIEW_CAL = /^review\/([a-z-]+?)-calendar-[^/]+\.html$/;
const TOP = ['izobreteniya', 'iskusstvo', 'pervoprohodcy', 'karikatura', 'dengi', 'sport'];
// Опись: нынешние файлы старого сайта + всё, что когда-либо было в его истории (удалённые
// страницы тоже могли быть разосланы) + пилоты рабочего проекта + корни папок (…/ → index.html).
const gitOld = (() => {
  try {
    return execFileSync('git', ['-C', LEGACY, 'log', '--all', '--name-only', '--format=', '--', 'muzei', ...TOP],
      { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').filter((f) => f.endsWith('.html'));
  } catch { return []; }
})();
const pilots = fs.existsSync(RC) ? fs.readdirSync(RC).filter((d) => /^pilot-/.test(d)) : [];
const pilotFiles = pilots.flatMap((d) => {
  const w = (dir) => fs.readdirSync(path.join(RC, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? w(path.join(dir, e.name)) : e.name.endsWith('.html') ? [path.join(dir, e.name)] : []);
  return w(d);
});
const roots = [...TOP, ...pilots, 'nesdayutsya'].map((d) => `${d}/index.html`);
const oldDirs = new Set(gitOld.filter((f) => f.startsWith('muzei/')).map((f) => f.split('/')[1]));
for (const d of [...oldDirs, 'nesdayutsya']) roots.push(`muzei/${d}/index.html`);
const old = [...new Set([...['muzei', ...TOP, 'review']
  .filter((d) => fs.existsSync(path.join(LEGACY, d))).flatMap(walk), ...gitOld, ...pilotFiles, ...roots])]
  .filter((rel) => !rel.startsWith('review/') || withDays.has((rel.match(REVIEW_CAL) || [])[1])).sort();

// Старая страница «переехала» — куда ведёт её meta refresh (путь от корня старого сайта).
const refresh = (rel) => {
  const html = fs.readFileSync(path.join(LEGACY, rel), 'utf8');
  const m = html.match(/http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"'>\s]+)/i);
  if (!m || /^[a-z]+:/i.test(m[1])) return null;
  const to = path.normalize(path.join(path.dirname(rel), m[1].split(/[?#]/)[0]));
  return to.endsWith('/') || !to.endsWith('.html') ? path.join(to, 'index.html') : to;
};

const resolve = (rel, seen = new Set()) => {
  const cal = rel.match(REVIEW_CAL);
  if (cal) return [`/muzei/${cal[1]}/calendar/`, 'календарь'];
  const q0 = rel.startsWith('muzei/') ? rel : `muzei/${rel.replace(/^pilot-/, '')}`;
  const [, m0, file] = q0.match(/^muzei\/([^/]+)\/(.+)$/) || [];
  const m = slugOf(m0);
  const q = `muzei/${m}/${file}`;
  if (byLegacy.has(q)) return [byLegacy.get(q), 'день'];
  if (museums.has(m) && file === 'index.html') return [`/muzei/${m}/`, 'музей'];
  if (withDays.has(m) && file === 'calendar.html') return [`/muzei/${m}/calendar/`, 'календарь'];
  const next = fs.existsSync(path.join(LEGACY, rel)) && refresh(rel);
  if (next && !seen.has(next) && fs.existsSync(path.join(LEGACY, next))) {
    seen.add(rel);
    const [to, why] = resolve(next, seen);
    return [to, `${why} (старая переадресация → ${next})`];
  }
  if (museums.has(m)) return [`/muzei/${m}/`, 'вне календаря → главная музея'];
  return ['/', 'музея на новом сайте нет → главная города'];
};

const out = {};
const why = {};
// Путь, совпадающий со схемой нового сайта (den/MM-DD/, calendar/), — страница нового сайта, не переадресация.
const NEW_SHAPE = /^muzei\/[^/]+\/(den\/[^/]+|calendar)\/index\.html$/;
for (const rel of old) {
  if (NEW_SHAPE.test(rel)) { why['адрес тот же'] = (why['адрес тот же'] || 0) + 1; continue; }
  const [to, reason] = resolve(rel);
  if (`/${rel}` === `${to}index.html`) { why['адрес тот же'] = (why['адрес тот же'] || 0) + 1; continue; }
  out[`/${rel}`] = to;
  why[reason.replace(/ \(.*/, '')] = (why[reason.replace(/ \(.*/, '')] || 0) + 1;
  if (!/^(день|музей|календарь)$/.test(reason)) console.log(`${rel} → ${to} — ${reason}`);
}
fs.writeFileSync('src/data/redirects.json', JSON.stringify(out, null, 2) + '\n');
console.log(`старых адресов ${old.length}:`, why);
