// Опись старых музейных адресов rc-museum-preview → адрес нового сайта (план, шаг 4:
// «ни одна разосланная ссылка не умирает»). Пишет src/data/redirects.json — его читает
// src/integrations/legacy-redirects.mjs — и печатает, куда ушёл каждый адрес и почему.
// Порядок: страница-переадресация старого сайта → идём по её цепочке; карточка дня
// с legacy_page → её день; index/calendar → музей/календарь; иначе главная музея,
// а музея на новом сайте нет — главная города. Адрес, совпадающий с новым
// (muzei/<м>/index.html = /muzei/<м>/), в опись не идёт — переадресовывать нечего.
// Запуск: node scripts/redirects.mjs  (LEGACY — путь к rc-museum-preview); --check — сверка без записи.
// src/data/redirects.json руками не править: правка — в генератор (PEREEZD/ROOT_EXTRA) и перезапуск.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const LEGACY = process.env.LEGACY || path.join(os.homedir(), 'rc-museum-preview');
// Пилоты pilot-<музей>/ публиковались из рабочего проекта — ссылки на них разосланы (17.10).
const RC = process.env.RC || path.join(os.homedir(), 'projects', 'russian-civilization');
// Старое имя папки → slug нового сайта (нет в списке и нет музея — главная города).
const ALIAS = { nesdayutsya: 'ne-sdayutsya', 'kostyum-russkiy': 'narodnyy-kostyum', kostyum: 'narodnyy-kostyum',
  'russkiy-kostyum': 'narodnyy-kostyum' };
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
// А5 (20.10): обход показал 404 у корневых day-*.html, calendar.html и control/pilot-*/… — их не было
// в описи (gitOld смотрит только muzei/ и TOP). Добираем из всей истории: корень старого сайта
// (это был Музей изобретений), calendar/*, control/pilot-*/*, review/*.
const gitExtra = (() => {
  try {
    return execFileSync('git', ['-C', LEGACY, 'log', '--all', '--name-only', '--format='],
      { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n')
      .filter((f) => /^([^/]+|calendar\/[^/]+|control\/pilot-[^/]+\/.+|review\/.+)\.html$/.test(f));
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
// Опись публичных html старого main (scripts/legacy-paths.txt, 19.10): review/*, прототипы, версии —
// всё, на что могли разослать ссылку; scripts/polnota.mjs проверяет, что каждый путь есть в сборке.
const opis = fs.readFileSync('scripts/legacy-paths.txt', 'utf8').split('\n').map((s) => s.trim())
  .filter((s) => s && !s.startsWith('#') && s !== 'index.html');
const old = [...new Set([...['muzei', ...TOP]
  .filter((d) => fs.existsSync(path.join(LEGACY, d))).flatMap(walk), ...gitOld, ...gitExtra, ...pilotFiles, ...roots, ...opis])]
  .filter((f) => !['index.html', '404.html', 'yandex_c1516645b4f9cca5.html'].includes(f)).sort();

// Старая страница «переехала» — куда ведёт её meta refresh (путь от корня старого сайта).
const refresh = (rel) => {
  const html = fs.readFileSync(path.join(LEGACY, rel), 'utf8');
  const m = html.match(/http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"'>\s]+)/i);
  if (!m || /^[a-z]+:/i.test(m[1])) return null;
  const to = path.normalize(path.join(path.dirname(rel), m[1].split(/[?#]/)[0]));
  return to.endsWith('/') || !to.endsWith('.html') ? path.join(to, 'index.html') : to;
};

// Старый адрес → день, когда legacy_page у дня нет (19.10): день пересобран прямо в rc-site
// (full-pages не трогает день без legacy_page, а legacy_page ему ставить нельзя — перезапишет
// новую страницу) или старая страница жила только в ветке. Ручной выбор, сильнее общего правила;
// цель обязана быть днём сборки — иначе генератор падает.
const PEREEZD = {
  'muzei/ne-sdayutsya/podvig-gastello.html': '/muzei/ne-sdayutsya/den/01-07/', // большая страница #110
  'muzei/kalendar-pobed/day-06jan-belev.html': '/muzei/kalendar-pobed/den/01-06/', // Белёв
  'muzei/iskusstvo/day-01jan-yolochnyj-torg.html': '/muzei/iskusstvo/den/01-01/', // Кустодиев, «Ёлочный торг»
};
for (const to of Object.values(PEREEZD)) {
  const [, m, k] = to.match(/^\/muzei\/([^/]+)\/den\/([^/]+)\/$/) || [];
  if (!m || !fs.existsSync(path.join(DAYS, m, `${k}.json`))) throw new Error(`PEREEZD: нет дня ${to}`);
}

// А5: корневые страницы старого сайта — Музей изобретений. Ручные двойники дней без даты в имени.
const ROOT_DAY = { kotelnikov: '01-30', 'day-kotelnikov': '01-30', luna1: '01-02', luna9: '01-03',
  lobachevsky: '12-01', jan01: '01-01', cabletv: '01-01' };
const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const izoDay = (k) => fs.existsSync(path.join(DAYS, 'izobreteniya', `${k}.json`)) && `/muzei/izobreteniya/den/${k}/`;
const resolveRoot = (rel) => {
  const base = rel.replace(/\.html$/, '');
  if (base === 'calendar') return ['/muzei/izobreteniya/calendar/', 'корень: календарь изобретений'];
  if (base === 'izobreteniya') return ['/muzei/izobreteniya/', 'корень: главная изобретений'];
  // day-08-25nov-pirogov (номер волны) и …-v2 → имя страницы дня Музея изобретений.
  const name = base.replace(/^day-\d{2}-/, 'day-').replace(/-(v\d+|final)$/, '');
  const viaLegacy = byLegacy.get(`muzei/izobreteniya/${name}.html`);
  if (viaLegacy) return [viaLegacy, 'корень: день изобретений'];
  const d = name.match(/^day-(\d{2})([a-z]{3})-/);
  const byDate = d && MON[d[2]] && izoDay(`${String(MON[d[2]]).padStart(2, '0')}-${d[1]}`);
  if (byDate) return [byDate, 'корень: день изобретений по дате'];
  const manual = ROOT_DAY[name] && izoDay(ROOT_DAY[name]);
  if (manual) return [manual, 'корень: день изобретений (ручной двойник)'];
  return null;
};

const resolve = (rel, seen = new Set()) => {
  if (!rel.includes('/')) { const r = resolveRoot(rel); if (r) return r; }
  // calendar/yanvar-1-10-<музей>(-v2).html — черновые календари месяца → календарь музея.
  const calDir = rel.match(/^calendar\/[a-z]+-\d+-\d+-([a-z-]+?)(-v\d+)?\.html$/);
  if (calDir) {
    const m = slugOf(calDir[1]);
    if (withDays.has(m)) return [`/muzei/${m}/calendar/`, 'calendar/: календарь музея'];
    if (museums.has(m)) return [`/muzei/${m}/`, 'calendar/ → главная музея'];
  }
  // control/pilot-<музей>/… — рабочие страницы пилотов: calendar-* → календарь, прочее → главная музея.
  const ctl = rel.match(/^control\/pilot-([^/]+)\/(.+)$/);
  if (ctl) {
    const m = slugOf(ctl[1]);
    if (/^calendar/.test(ctl[2]) && withDays.has(m)) return [`/muzei/${m}/calendar/`, 'control: календарь музея'];
    if (museums.has(m)) return [`/muzei/${m}/`, 'control → главная музея'];
    return ['/', 'control: музея на новом сайте нет → главная города'];
  }
  const cal = rel.match(REVIEW_CAL);
  if (cal && withDays.has(slugOf(cal[1]))) return [`/muzei/${slugOf(cal[1])}/calendar/`, 'календарь'];
  // Рабочие страницы review/ (19.10): review/calendar-<месяц> — месячные календари Музея архитектуры
  // (в заголовке «Музей русской архитектуры»; якоря месяца у нового календаря нет → календарь целиком);
  // review/<музей>/… и review/<музей>-… → главная музея; прочее (etnografiya, museum-launch-map) → главная города.
  if (rel.startsWith('review/')) {
    if (/^review\/calendar-[a-z]+\.html$/.test(rel)) return ['/muzei/arhitektura/calendar/', 'review: календарь архитектуры'];
    const r = slugOf(rel.slice(7).split(/[/.]|-calendar-|-mehaniki-/)[0]);
    if (museums.has(r)) return [`/muzei/${r}/`, 'review → главная музея'];
    return ['/', 'review: музея на новом сайте нет → главная города'];
  }
  const q0 = rel.startsWith('muzei/') ? rel : `muzei/${rel.replace(/^pilot-/, '')}`;
  const [, m0, file] = q0.match(/^muzei\/([^/]+)\/(.+)$/) || [];
  const m = slugOf(m0);
  const q = `muzei/${m}/${file}`;
  if (byLegacy.has(q)) return [byLegacy.get(q), 'день'];
  if (PEREEZD[q]) return [PEREEZD[q], 'день'];
  // Версии дня нового сайта (den/<ключ>/staraya/ и т. п., ветка site старого домена) → сам день.
  const sub = file && file.match(/^den\/([^/]+)\/.+\.html$/);
  if (sub && fs.existsSync(path.join(DAYS, m, `${sub[1]}.json`))) return [`/muzei/${m}/den/${sub[1]}/`, 'день'];
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
const NEW_SHAPE = /^muzei\/[^/]+\/(den\/[^/]+|calendar|tablica)\/index\.html$/;
for (const rel of old) {
  if (NEW_SHAPE.test(rel)) { why['адрес тот же'] = (why['адрес тот же'] || 0) + 1; continue; }
  const [to, reason] = resolve(rel);
  if (`/${rel}` === `${to}index.html`) { why['адрес тот же'] = (why['адрес тот же'] || 0) + 1; continue; }
  out[`/${rel}`] = to;
  why[reason.replace(/ \(.*/, '')] = (why[reason.replace(/ \(.*/, '')] || 0) + 1;
  if (!/^(день|музей|календарь)$/.test(reason)) console.log(`${rel} → ${to} — ${reason}`);
}
// Корневые страницы старого сайта вне музейных папок (опись 19.10: 18 адресов отдавали 404 на новом домене).
// Прототип/рабочая страница без нового двойника → ближайший музей или главная города.
const ROOT_EXTRA = {
  '/arhitektura-v2.html': '/muzei/arhitektura/', '/arhitektura-v2.1.html': '/muzei/arhitektura/',
  '/arhitektura-v2.2.html': '/muzei/arhitektura/', '/arhitektura-v2.3.html': '/muzei/arhitektura/',
  '/arhitektura-v2.4.html': '/muzei/arhitektura/', '/arhitektura-v2.5.html': '/muzei/arhitektura/',
  '/calendar/arhitektura-yanvar.html': '/muzei/arhitektura/calendar/',
  '/film.html': '/muzei/izobreteniya/den/01-30/', '/game-3d-jump.html': '/muzei/izobreteniya/den/01-30/',
  '/map.html': '/', '/video/index.html': '/', '/glazami/index.html': '/', '/razbor-telefon/index.html': '/',
  '/handkerchief.html': '/', '/competitors.html': '/', '/control.html': '/', '/daily-report.html': '/',
  '/glavnaya-proto-0810.html': '/',
};
// ROOT_EXTRA — ручной выбор, он сильнее общего правила (корневые файлы теперь идут и из описи).
for (const [k, v] of Object.entries(ROOT_EXTRA)) out[k] = v;
// --check: json обязан совпадать с выводом генератора (находка 19.10: 67 целей разошлись,
// потому что json правили руками и не перегенерировали после переноса дней).
const json = JSON.stringify(out, null, 2) + '\n';
if (process.argv.includes('--check')) {
  const cur = JSON.parse(fs.readFileSync('src/data/redirects.json', 'utf8'));
  const diff = [...new Set([...Object.keys(cur), ...Object.keys(out)])].filter((k) => cur[k] !== out[k]);
  for (const k of diff) console.log(`  ${k}: в json ${cur[k] ?? '—'}, генератор ${out[k] ?? '—'}`);
  console.log(`redirects --check: расхождений ${diff.length}`);
  process.exit(diff.length ? 1 : 0);
}
fs.writeFileSync('src/data/redirects.json', json);
console.log(`старых адресов ${old.length}:`, why);
