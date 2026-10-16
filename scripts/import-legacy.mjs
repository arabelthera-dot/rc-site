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
const HOLD = {};
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

// Картинки дня — кадры готовой страницы старого сайта, но только с записью о правах. Записи четыре, как их вели
// музеи: паспорт выпуска (rc-museum-production/<музей>/<выпуск>/passport/issue.json, images[]: путь, источник,
// подпись автора, rights.status), ведомость rights.json в папке кадра или музея (её ведёт tools/audit-prava.py),
// манифест выпуска media-manifest.json (источник, автор, лицензия — берётся, только если строки ведомости нет;
// расходятся — побеждает ведомость, расхождение в журнале импорта), атрибуты data-source и data-license на кадре.
// Тот же кадр в другом формате (pogost-1280.jpg при записи pogost-1280.webp) берёт запись своего кадра.
// Записи нет или права не подтверждены — кадр не идёт, причина в журнале импорта: источник не выдумывается.
// Подпись — figcaption страницы, иначе описание из записи, иначе alt кадра.
const decode = (t) => t.replace(/&quot;/g, '"').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
  .replace(/&mdash;/g, '—').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const strip = (t) => squash(decode(t.replace(/<[^>]+>/g, ' '))).replace(/\s+([.,;:!?»)])/g, '$1');
const PRODUCTION = path.join(PROJECT, 'rc-museum-production');
const stem = (p) => p.replace(/\.(jpe?g|png|webp|avif)$/i, '');
const PASSPORT = {};
for (const museum of fs.existsSync(PRODUCTION) ? fs.readdirSync(PRODUCTION) : []) {
  const dir = path.join(PRODUCTION, museum);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const issue of fs.readdirSync(dir)) {
    const f = path.join(dir, issue, 'passport/issue.json');
    if (!fs.existsSync(f)) continue;
    for (const im of JSON.parse(fs.readFileSync(f, 'utf8')).images ?? [])
      if (im.local_path) PASSPORT[stem(path.normalize(im.local_path))] = im;
  }
}
const RIGHTS = {};
const MANIFEST = {};
// Манифест выпуска в трёх схемах архитектуры: images[] {file, source}, items[] {file, source_url},
// items[] {path, source_url}. Приводится к строкам {file, source, author, license}; производный кадр
// (derived_from: hero-480 от hero) без своих полей берёт их у оригинала.
const manifestRows = (j) => {
  const rows = (j.images ?? j.items ?? []).map((r) => ({ file: r.file ?? r.path, source: r.source ?? r.source_url,
    author: r.author, license: r.license, from: r.derived_from }));
  const byFile = Object.fromEntries(rows.map((r) => [r.file, r]));
  return rows.filter((r) => r.file).map(({ from, ...r }) => ({ ...r, source: r.source ?? byFile[from]?.source,
    author: r.author ?? byFile[from]?.author, license: r.license ?? byFile[from]?.license }));
};
const walk = (dir) => { for (const e of fs.readdirSync(path.join(LEGACY, dir), { withFileTypes: true })) {
  if (e.isDirectory()) walk(path.join(dir, e.name));
  else if (e.name === 'rights.json') {
    // Ведомость двух видов: массив строк (музеи) или {"files": […]} (zum искусства: author, source_url, object).
    const j = JSON.parse(fs.readFileSync(path.join(LEGACY, dir, e.name), 'utf8'));
    for (const r of Array.isArray(j) ? j : j.files ?? []) if (r.file) RIGHTS[stem(path.normalize(path.join(dir, r.file)))] = r;
  } else if (e.name === 'media-manifest.json') {
    const j = JSON.parse(fs.readFileSync(path.join(LEGACY, dir, e.name), 'utf8'));
    for (const r of manifestRows(j)) MANIFEST[stem(path.normalize(path.join(dir, r.file)))] = r;
  }
} };
walk('muzei');
// Расхождения ведомости и манифеста по одному кадру: ссылка — по имени файла Commons, лицензия и автор —
// без регистра, пробелов и знаков. В журнал импорта музея; на сайт идёт ведомость.
const norm = (t) => (t ?? '').toLowerCase().replace(/public domain|^pd\b.*/, 'pd').replace(/[^\p{L}\p{N}.]+/gu, '');
const fileOf = (u) => { try { u = decodeURI(u ?? ''); } catch {} return u.replace(/^.*[/:](File|Файл):/i, '').replace(/ /g, '_'); };
const CONFLICTS = Object.entries(MANIFEST).filter(([k]) => RIGHTS[k]).flatMap(([k, m]) => {
  const r = RIGHTS[k];
  const diff = [['лицензия', r.license, m.license, norm], ['источник', r.source ?? r.source_url ?? r.url, m.source, fileOf],
    ['автор', r.artist ?? r.author, m.author, norm]].filter(([, a, b, f]) => a && b && f(a) !== f(b))
    .map(([what, a, b]) => `${what} «${a}» ≠ «${b}»`);
  return diff.length ? [`${k}: ${diff.join(', ')}`] : [];
});
const UNKNOWN = /^\s*(unknown|pending|нет данных|неизвестн)/i;
const commons = (url, credit = '') => (/commons\.wikimedia\.org/.test(url ?? '') && !/commons/i.test(credit) ? 'Wikimedia Commons' : '');
const attr = (tag, name) => decode(tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? '');
function rightsOf(rel, tag) {
  const p = PASSPORT[stem(rel)];
  if (p) return p.rights?.status === 'cleared'
    ? { credit: [p.credit_ru, commons(p.source_url, p.credit_ru)].filter(Boolean).join(', '), about: p.alt_ru }
    : { why: `права в паспорте «${p.rights?.status ?? 'нет статуса'}»` };
  const r = RIGHTS[stem(rel)];
  if (r) {
    // Строка ведомости — подтверждение, только если в ней есть лицензия и источник и права не помечены
    // неизвестными; иначе кадр в журнал с причиной (строки «unknown» ведутся как список недоделок).
    const src = r.source ?? r.source_url ?? r.url, lic = r.license;
    const why = UNKNOWN.test(r.status ?? r.rights?.status ?? '') || UNKNOWN.test(lic ?? '') ? 'права «unknown»'
      : !lic ? 'нет лицензии' : !src ? 'нет источника' : '';
    if (why) return { why: `rights.json: ${why}` };
    return { credit: [r.artist ?? r.author, lic, commons(src) || src].filter(Boolean).join(', '),
      about: (r.description ?? r.object)?.replace(/\s*—\s*замена кадра[\s\S]*$/, '') };
  }
  const m = MANIFEST[stem(rel)];
  if (m) {
    const why = UNKNOWN.test(m.license ?? '') ? 'права «unknown»' : !m.license ? 'нет лицензии'
      : !/^https?:/.test(m.source ?? '') ? 'нет источника' : '';
    if (why) return { why: `media-manifest.json: ${why}` };
    return { credit: [m.author, m.license, commons(m.source) || m.source].filter(Boolean).join(', ') };
  }
  const lic = attr(tag, 'data-license'), src = attr(tag, 'data-source');
  if (UNKNOWN.test(lic)) return { why: 'права «unknown» в атрибутах кадра' };
  if (lic && src) return { credit: [lic, commons(src) || src].join(', ') };
  return { why: 'нет записи о правах' };
}
function pageImages(museum, legacyPage, skipped) {
  const html = fs.readFileSync(path.join(LEGACY, legacyPage), 'utf8');
  const caps = {};
  for (const f of html.matchAll(/<figure[\s\S]*?<\/figure>/g)) {
    const src = f[0].match(/<img[^>]*\ssrc="([^"]+)"/)?.[1];
    // Ссылка подписи на ведомость старого сайта («Паспорт кадра») не переносится: права — в credit кадра.
    const cap = f[0].match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1]
      ?.replace(/<a[^>]*\shref="[^"]*rights\.json"[^>]*>[\s\S]*?<\/a>\.?/g, '');
    if (src && cap && !caps[src]) caps[src] = strip(cap);
  }
  const seen = new Set();
  const images = [];
  for (const m of html.matchAll(/<img[^>]*>/g)) {
    const file = m[0].match(/\ssrc="([^"]+)"/)?.[1];
    if (!file || seen.has(file) || /^(https?:|data:)/.test(file)) continue;
    seen.add(file);
    const rel = path.normalize(path.join(path.dirname(legacyPage), file));
    const r = rightsOf(rel, m[0]);
    if (!r.credit) { skipped.push(`${legacyPage}: ${file} — ${r.why}`); continue; }
    const out = path.join('muzei', museum, 'img', path.relative(path.join('muzei', museum), rel));
    fs.mkdirSync(path.join('public', path.dirname(out)), { recursive: true });
    fs.copyFileSync(path.join(LEGACY, rel), path.join('public', out));
    images.push({ src: out, caption: caps[file] || squash(r.about || attr(m[0], 'alt')), credit: r.credit });
  }
  return images;
}

// Источник дня, у которого в старом календаре его нет, — со старой страницы, как на ней записан:
// первая ссылка блока «Источники» (без Википедии и лицензий) — «название (сайт)»; ссылки нет —
// строка «Источники: …». Нет и её — источник не выдумывается, день идёт с исключением паспорта.
const NOT_SRC = /wikipedia|wikimedia|wikisource|creativecommons|youtube|googleapis|github|t\.me|telegram|boosty|yoomoney|netlify/;
const cyr = (t) => /[А-Яа-яЁё]/.test(t);
function pageSource(legacyPage) {
  const html = fs.readFileSync(path.join(LEGACY, legacyPage), 'utf8').replace(/<(script|style)[\s\S]*?<\/\1>/g, '');
  const start = html.search(/id="sources"|class="[^"]*\b(sources|source-list|rights-sources|dossier|source)\b/);
  for (const scope of start >= 0 ? [html.slice(start), html] : [html]) {
    for (const a of scope.matchAll(/<a[^>]*\shref="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a\s*>/g)) {
      if (NOT_SRC.test(a[1])) continue;
      let t = strip(a[2]).replace(/\s*[→↗]+$/, '');
      if (!cyr(t) || t.length < 6 || /^Источник/.test(t)) {
        const before = scope.slice(0, a.index);
        const open = Math.max(before.lastIndexOf('<li'), before.lastIndexOf('<p'));
        const close = scope.slice(a.index).search(/<\/(li|p)>/);
        if (open >= 0 && close >= 0) t = strip(scope.slice(open, a.index + close));
        if (t.length > 200) continue;
      }
      if (cyr(t)) return `${t} (${new URL(a[1]).hostname.replace(/^www\./, '')})`;
    }
    if (start >= 0 && scope !== html) continue;
  }
  const line = strip(html).match(/Источники?:\s*([^А-ЯЁ]*?[a-z0-9-]+\.[a-z]{2,}(?:\s*·\s*[a-z0-9.-]+\.[a-z]{2,})*)/);
  return line ? `Источники: ${line[1].trim()}` : undefined;
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
  const skipped = [];
  fs.rmSync(path.join('public/muzei', museum, 'img'), { recursive: true, force: true });
  let n = 0;
  const write = (key, card) => {
    const href = cal[key]?.href;
    card.legacy_page = href ? `${path.dirname(rel)}/${href}` : undefined;
    if (card.legacy_page) card.images = pageImages(museum, card.legacy_page, skipped);
    if (card.legacy_page && !card.source) card.source = pageSource(card.legacy_page);
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
  if (skipped.length) console.log(`  кадры без подтверждённых прав, не перенесены (${skipped.length}): ${skipped.join('; ')}`);
  const conflicts = CONFLICTS.filter((c) => c.startsWith(`muzei/${museum}/`));
  if (conflicts.length) console.log(`  ведомость rights.json и media-manifest.json расходятся, взята ведомость (${conflicts.length}): ${conflicts.join('; ')}`);
}
