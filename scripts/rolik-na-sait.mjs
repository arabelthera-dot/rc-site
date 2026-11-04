// Ролик дня из rc-rolik → сайт (Р518, Р521): готовые out/<id>-A-16x9.mp4 и -9x16.mp4 кладутся
// в public/muzei/<музей>/video/day-<ДДмес>-<slug>[-9x16].mp4, постеры — кадр ffmpeg, запись — в
// public/video/registry.json (releases["<музейкод>/<ДДмес>-<slug>"]). Раньше и то и другое делали руками,
// а генератор реестра (tools/video-sync.py) давно удалён — этот шаг его заменяет для роликов rc-rolik.
// Каркас карточки (scripts/karkas/ne-sdayutsya.mjs) берёт запись реестра, если на старой странице ролика нет.
// Останов (код 1): нет mp4 в out/, не вариант A, кадр json дня не из Госкаталога или не лежит в
// public/muzei/<музей>/img/ — тогда подпись «кадры подлинные» была бы неправдой.
// Запуск: node scripts/rolik-na-sait.mjs <музей> <ММ-ДД> <slug> --rolik <папка rc-rolik> --id <id дня rc-rolik>
// Откат — удалить скрипт, файлы ролика и запись реестра.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const stop = (s) => { console.error(`rolik-na-sait: ${s}`); process.exit(1); };

const [muzey, den, slug] = process.argv.slice(2);
const rolik = arg('--rolik'), id = arg('--id');
if (!muzey || !/^\d\d-\d\d$/.test(den ?? '') || !/^[a-z0-9-]+$/.test(slug ?? '') || !rolik || !id)
  stop('запуск: <музей> <ММ-ДД> <slug> --rolik <папка rc-rolik> --id <id>');

const [mm, dd] = den.split('-');
const kod = muzey.replace(/-/g, '');
const imya = `${dd}${MES[+mm - 1]}-${slug}`;
const klyuch = `${kod}/${imya}`;

// Кадры: только наши, из Госкаталога, и те же файлы, что на странице.
const dayJson = JSON.parse(fs.readFileSync(path.join(rolik, 'days', `${id}.json`), 'utf8'));
const kadry = Object.values(dayJson.images ?? {}).map((k) => path.basename(k.src));
if (!kadry.length) stop(`в days/${id}.json нет кадров`);
for (const k of kadry) {
  if (!new RegExp(`^${den}-goskatalog-\\d+\\.jpg$`).test(k)) stop(`кадр ${k} — не из Госкаталога этого дня`);
  if (!fs.existsSync(path.join(KOREN, 'public/muzei', muzey, 'img', k))) stop(`кадра ${k} нет в public/muzei/${muzey}/img/`);
}

const probe = (f) => {
  const [w, h, sec] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration',
    '-of', 'csv=p=0:s=,', f], { encoding: 'utf8' }).trim().split(/[\n,]+/).map(Number);
  return { w, h, sec: Math.round(sec * 10) / 10, mb: Math.round(fs.statSync(f).size / 1e5) / 10 };
};

const reg = path.join(KOREN, 'public/video/registry.json');
const data = JSON.parse(fs.readFileSync(reg, 'utf8'));
const staraya = data.releases[klyuch] ?? {};
const dir = path.join(KOREN, 'public/muzei', muzey, 'video');
fs.mkdirSync(dir, { recursive: true });

// Постер — последний кадр хука: за 0,4 с до первой смены кадра 16:9 (переходы — наплыв, порог сцены низкий).
// Шкала у 16:9 и 9:16 общая. Смены не нашлось — 1,5 с.
const out = (fmt) => path.join(rolik, 'out', `${id}-A-${fmt}.mp4`);
for (const fmt of ['16x9', '9x16']) if (!fs.existsSync(out(fmt))) stop(`нет ${out(fmt)} (нужен вариант A из облака, render.yml)`);
const smena = spawnSync('ffmpeg', ['-hide_banner', '-i', out('16x9'), '-vf', "select='gt(scene,0.08)',showinfo", '-an', '-f', 'null', '-'],
  { encoding: 'utf8' }).stderr.match(/pts_time:([\d.]+)/);
const posterSek = smena ? Math.max(0, +smena[1] - 0.4) : 1.5;
const zapis = {};
for (const [pole, fmt, suf] of [['horizontal', '16x9', ''], ['vertical', '9x16', '-9x16']]) {
  const iz = out(fmt);
  const mp4 = `day-${imya}${suf}.mp4`, poster = `day-${imya}${suf}-poster.jpg`;
  fs.copyFileSync(iz, path.join(dir, mp4));
  const p = probe(iz);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(Number(posterSek.toFixed(2))), '-i', iz, '-frames:v', '1', '-q:v', '3', path.join(dir, poster)]);
  zapis[pole] = { file: `${klyuch}/${mp4}`, local: `muzei/${muzey}/video/${mp4}`, v: (staraya[pole]?.v ?? 0) + 1, ...p };
  zapis[pole === 'horizontal' ? 'poster' : 'poster_vertical'] = {
    file: `${klyuch}/${poster}`, local: `muzei/${muzey}/video/${poster}`, v: (staraya[pole === 'horizontal' ? 'poster' : 'poster_vertical']?.v ?? 0) + 1 };
}

// Пишется только своя запись и дата: JSON.stringify всего файла потерял бы «11.0» у чужих записей.
const novaya = {
  title: `История в ${Math.round(zapis.horizontal.sec)} секунд`,
  note: 'Кадры ролика — подлинные фотографии из Государственного каталога музейного фонда России. '
    + 'Сгенерированных нейросетью кадров нет. Закадровый текст озвучен синтезом речи.',
  horizontal: zapis.horizontal, vertical: zapis.vertical, poster: zapis.poster, poster_vertical: zapis.poster_vertical,
};
let txt = fs.readFileSync(reg, 'utf8');
const blok = `    ${JSON.stringify(klyuch)}: ${JSON.stringify(novaya, null, 2).replace(/\n/g, '\n    ')}`;
const nach = txt.indexOf(`\n    ${JSON.stringify(klyuch)}: {`);
if (nach >= 0) txt = txt.slice(0, nach + 1) + blok + txt.slice(txt.indexOf('\n    }', nach) + 6);
else txt = txt.replace(/\n  \}\n\}\s*$/, `,\n${blok}\n  }\n}\n`);
txt = txt.replace(/("updated":\s*")[^"]*"/, `$1${new Date().toISOString().slice(0, 10)}"`);
JSON.parse(txt);
fs.writeFileSync(reg, txt);
console.log(`rolik-na-sait: ${klyuch} — ${zapis.horizontal.sec} с 16:9, ${zapis.vertical.sec} с 9:16, кадров ${kadry.length}`);
