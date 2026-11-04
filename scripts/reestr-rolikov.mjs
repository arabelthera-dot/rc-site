// Реестр роликов — файл на выпуск (Р524, Сергей 04.11.2026; корень конфликтов дней #801, #803, #804).
// Пять вопросов до изменения (Сергей, 28.09.2026):
// Что задевает — все читатели реестра (DenMedia.astro, karkas/ne-sdayutsya, media-dnya, proporcii-rolika) и движок
//   public/assets/museum-video.js (он грузит собранный video/registry.json от корня сайта — его адрес не меняется).
// Что нужно — выпуск «<музей>/<id>» лежит в своём файле public/video/registry/<музей>/<id>.json (только запись выпуска),
//   общие поля (version, hosting) — public/video/registry/_obshchee.json. Общий public/video/registry.json собирает эта
//   машина в начале npm run build; в git его нет (.gitignore). Заявки дней пишут каждая свой файл — не сталкиваются.
// Что будет без нужного — каждая заявка дня дописывает строки в один файл: слили один день — у остальных конфликт.
// Проверка до слияния — пробы (--proba); сборка: каждый файл — валидный JSON, ключ из пути вида музей/id без дублей
//   (и без дублей по регистру), у выпуска есть horizontal; иначе код 1 и сборка не идёт. Перенос — N из N выпусков.
// Откат — revert заявки: вернётся public/video/registry.json в git и чтение его читателями.
// Запуск: node scripts/reestr-rolikov.mjs [--proba] — проверить и собрать public/video/registry.json;
//   node scripts/reestr-rolikov.mjs --razrezat <файл.json> — разложить старый общий реестр (или его строки из ветки дня)
//   по файлам выпусков; записи, которые уже есть и отличаются, не перезаписываются — список в выводе, код 1.
// Писатели (rolik-na-sait и др.) — zapisatVypusk(public, klyuch, zapis) отсюда.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const KLYUCH = /^[a-z0-9-]+\/[a-z0-9-]+$/;
const papka = (pub) => path.join(pub, 'video/registry');

// Собрать реестр из файлов выпусков. Возвращает { reestr, oshibki }; при ошибках reestr всё равно собран из целых.
export function sobrat(pub = 'public') {
  const dir = papka(pub), oshibki = [], releases = {}, nizhnie = new Map();
  let obshchee = {};
  const ob = path.join(dir, '_obshchee.json');
  if (fs.existsSync(ob)) {
    try { obshchee = JSON.parse(fs.readFileSync(ob, 'utf8')); } catch (e) { oshibki.push(`_obshchee.json: не JSON — ${e.message}`); }
  }
  const muzei = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [];
  for (const m of muzei) {
    for (const f of fs.readdirSync(path.join(dir, m)).sort()) {
      const klyuch = `${m}/${f.replace(/\.json$/, '')}`;
      if (!f.endsWith('.json') || !KLYUCH.test(klyuch)) { oshibki.push(`${m}/${f}: имя не вида <музей>/<id>.json (строчные латиница, цифры, дефис)`); continue; }
      const nizh = klyuch.toLowerCase();
      if (nizhnie.has(nizh)) { oshibki.push(`${klyuch}: повтор id (${nizhnie.get(nizh)})`); continue; }
      nizhnie.set(nizh, klyuch);
      let z;
      try { z = JSON.parse(fs.readFileSync(path.join(dir, m, f), 'utf8')); } catch (e) { oshibki.push(`${klyuch}: не JSON — ${e.message}`); continue; }
      if (!z || typeof z !== 'object' || Array.isArray(z)) { oshibki.push(`${klyuch}: запись выпуска — не объект`); continue; }
      if (!z.horizontal?.file && !z.horizontal?.local) oshibki.push(`${klyuch}: нет horizontal (file/local)`);
      releases[klyuch] = z;
    }
  }
  const reestr = { _: 'СОБРАНО scripts/reestr-rolikov.mjs из public/video/registry/<музей>/<id>.json. Руками не править — правится файл выпуска.', ...obshchee, releases };
  return { reestr, oshibki };
}

// Для читателей в Node и Astro: собранный реестр; битый — исключение (битый плеер не выкладывается).
export function chitat(pub = 'public') {
  const { reestr, oshibki } = sobrat(pub);
  if (oshibki.length) throw new Error(`реестр роликов: ${oshibki.join('; ')}`);
  return reestr;
}

// Для писателей: один выпуск — один файл, общий реестр не трогается.
export function zapisatVypusk(pub, klyuch, zapis) {
  if (!KLYUCH.test(klyuch)) throw new Error(`ключ выпуска «${klyuch}» не вида <музей>/<id>`);
  const f = path.join(papka(pub), `${klyuch}.json`);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(zapis, null, 2) + '\n');
  return f;
}

// Разложить общий реестр по файлам. Вернёт { novye, te_zhe, raznye }.
export function razrezat(pub, obshchiy) {
  const { releases = {}, _, updated, ...obshchee } = obshchiy;
  const itog = { novye: [], te_zhe: [], raznye: [] };
  const ob = path.join(papka(pub), '_obshchee.json');
  if (!fs.existsSync(ob)) { fs.mkdirSync(papka(pub), { recursive: true }); fs.writeFileSync(ob, JSON.stringify(obshchee, null, 2) + '\n'); }
  for (const [k, z] of Object.entries(releases)) {
    const f = path.join(papka(pub), `${k}.json`);
    if (fs.existsSync(f)) {
      const bylo = JSON.parse(fs.readFileSync(f, 'utf8'));
      (JSON.stringify(bylo) === JSON.stringify(z) ? itog.te_zhe : itog.raznye).push(k);
      continue;
    }
    zapisatVypusk(pub, k, z);
    itog.novye.push(k);
  }
  return itog;
}

const zapusk = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (zapusk && process.argv.includes('--proba')) {
  let plokho = 0;
  const proba = (imya, faily, zhdu) => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reestr-proba-'));
    for (const [p, t] of Object.entries(faily)) {
      fs.mkdirSync(path.dirname(path.join(tmp, p)), { recursive: true });
      fs.writeFileSync(path.join(tmp, p), t);
    }
    const { oshibki } = sobrat(tmp);
    const krasnyy = oshibki.length > 0;
    console.log(`${krasnyy === zhdu ? 'ок ' : 'БРАК'} проба «${imya}»: ${krasnyy ? 'красный — ' + oshibki[0] : 'зелёный'}`);
    if (krasnyy !== zhdu) plokho++;
    fs.rmSync(tmp, { recursive: true, force: true });
  };
  const v = JSON.stringify({ horizontal: { local: 'muzei/p/video/r.mp4' } });
  const R = 'video/registry/';
  proba('два выпуска', { [`${R}_obshchee.json`]: '{"version":2}', [`${R}p/01jan-a.json`]: v, [`${R}p/02jan-b.json`]: v }, false);
  proba('битый JSON', { [`${R}p/01jan-a.json`]: '{"horizontal":' }, true);
  proba('повтор id по регистру', { [`${R}p/01jan-a.json`]: v, [`${R}p/01JAN-a.json`]: v }, true);
  proba('без horizontal', { [`${R}p/01jan-a.json`]: '{"title":"x"}' }, true);
  // Разрезать и собрать обратно — те же выпуски.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reestr-proba-'));
  const star = { _: 'x', version: 2, updated: '2026-01-01', hosting: { base: '' }, releases: { 'p/01jan-a': JSON.parse(v), 'q/02jan-b': JSON.parse(v) } };
  razrezat(tmp, star);
  const povtor = razrezat(tmp, { releases: { 'p/01jan-a': { horizontal: { local: 'drugoy.mp4' } } } });
  const { reestr } = sobrat(tmp);
  const ok = JSON.stringify(reestr.releases) === JSON.stringify(star.releases) && reestr.hosting?.base === '' && povtor.raznye.length === 1;
  console.log(`${ok ? 'ок ' : 'БРАК'} проба «разрезать → собрать, чужая запись не перезаписана»`);
  if (!ok) plokho++;
  fs.rmSync(tmp, { recursive: true, force: true });
  if (plokho) { console.log(`::error::reestr-rolikov: ${plokho} проб не сработали`); process.exit(1); }
  console.log('reestr-rolikov: пробы прошли');
  process.exit(0);
}

if (zapusk && process.argv.includes('--razrezat')) {
  const f = process.argv[process.argv.indexOf('--razrezat') + 1];
  const it = razrezat('public', JSON.parse(fs.readFileSync(f, 'utf8')));
  console.log(`reestr-rolikov: новых ${it.novye.length}, уже есть ${it.te_zhe.length}, отличаются ${it.raznye.length}`);
  for (const k of it.novye) console.log(`  + ${k}`);
  for (const k of it.raznye) console.log(`::error::reestr-rolikov: ${k} уже есть и отличается — не перезаписан, решить руками`);
  process.exit(it.raznye.length ? 1 : 0);
}

if (zapusk) {
  const { reestr, oshibki } = sobrat('public');
  for (const e of oshibki) console.log(`::error::reestr-rolikov: ${e}`);
  if (oshibki.length) process.exit(1);
  fs.writeFileSync('public/video/registry.json', JSON.stringify(reestr, null, 2) + '\n');
  console.log(`reestr-rolikov: выпусков ${Object.keys(reestr.releases).length}, собран public/video/registry.json`);
}
