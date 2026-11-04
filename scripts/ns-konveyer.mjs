#!/usr/bin/env node
// Конвейер дня «Русские не сдаются» (Р524, пункт Б): утверждённая карточка → ролик на страницу → adres: den → сверка комплекта.
// Шаги на день ММ-ДД:
//   1. ролик: в реестре public/video/registry.json нет nesdayutsya/ДДmon-… — машина берёт последний собранный в облаке
//      rc-rolik (render.yml) ролик nsДДmon (артефакты nsДДmon-A-16x9 и -9x16), кладёт mp4 и кадр-обложку в
//      public/muzei/ne-sdayutsya/video/ и пишет выпуск в реестр. Сам ролик здесь не собирается (Р243) — только скачивается.
//   2. карточка без блока video получает его из реестра (тем же rolikIzReestra, что каркас) и пункт «Видео» в daynav.
//   3. scripts/ns-iz-utverzhdennyh.mjs ДЕНЬ — утверждённые факты и adres: den, если замки прошли.
//   4. сверка комплекта: adres: den, страница, аудиогид (файл), ролик 16:9 и 9:16 (файлы), хук ролика = хук страницы.
// Нет части — день не уходит: строка «✗ шаг: причина»; с --kartochki на доске заводится карточка с причиной.
// Запуск: node scripts/ns-konveyer.mjs 01-02..01-08 [--sverka] [--kartochki] [--utverzhden ГГГГ-ММ-ДД]
//   --sverka — только сверка, ничего не писать.
// Код выхода: 0 — все дни комплектом; 2 — хотя бы один день не прошёл.
// Откат: удалить этот файл; выпуски из реестра и файлы роликов удаляются вместе с днём.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { rolikIzReestra } from './karkas/ne-sdayutsya.mjs';

const KOREN = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const VYHOD = path.join(KOREN, 'src/content/dni-shablon/ne-sdayutsya');
const REESTR = path.join(KOREN, 'public/video/registry.json');
const VIDEO = 'muzei/ne-sdayutsya/video';
const ROLIK = 'arabelthera-dot/rc-rolik';
const MES_KL = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const argi = process.argv.slice(2);
const SVERKA = argi.includes('--sverka'), KARTOCHKI = argi.includes('--kartochki');
// --utverzhden ГГГГ-ММ-ДД — передаётся машине фактов, если в утверждённом файле нет строки «Утверждено Сергеем …» (01-02; январь — Р488).
const UTV = argi.includes('--utverzhden') ? ['--utverzhden', argi[argi.indexOf('--utverzhden') + 1]] : [];
const dni = [];
for (const a of argi.filter((x, i) => !x.startsWith('--') && argi[i - 1] !== '--utverzhden')) {
  const m = a.match(/^(\d\d)-(\d\d)(?:\.\.(\d\d)-(\d\d))?$/);
  if (!m) { console.error(`ОСТАНОВ: день — ММ-ДД или ММ-ДД..ММ-ДД, а не ${a}`); process.exit(1); }
  for (let d = +m[2]; d <= +(m[4] ?? m[2]); d++) dni.push(`${m[1]}-${String(d).padStart(2, '0')}`);
}
if (!dni.length) { console.error('запуск: node scripts/ns-konveyer.mjs 01-02..01-08 [--sverka] [--kartochki]'); process.exit(1); }

const gh = (...a) => execFileSync('gh', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const idRolika = (dd, mes) => `ns${dd}${MES_KL[mes]}`;
// Название и хук дня — только из утверждённой карточки календаря src/content/days/ne-sdayutsya/ММ-ДД.json, дословно (r533).
const kartochkaDnya = (key) => { const f = path.join(KOREN, 'src/content/days/ne-sdayutsya', `${key}.json`); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; };
const norm = (s) => String(s ?? '').replace(/<[^>]+>/g, '').toLowerCase().replace(/ё/g, 'е').replace(/[^0-9a-zа-я]+/g, ' ').trim();

// Последний живой артефакт ролика: { run, imena: { '16x9': name, '9x16': name } } или null.
let vseArtefakty;
function artefakty(id) {
  vseArtefakty ??= JSON.parse(gh('api', '--paginate', `repos/${ROLIK}/actions/artifacts?per_page=100`,
    '-q', '[.artifacts[] | select(.expired | not) | {name, run: .workflow_run.id, created_at}]').replace(/\]\s*\[/g, ','));
  for (const a of vseArtefakty.filter((x) => x.name === `${id}-A-16x9`).sort((x, y) => y.created_at.localeCompare(x.created_at))) {
    if (vseArtefakty.some((x) => x.run === a.run && x.name === `${id}-A-9x16`)) return a.run;
  }
  return null;
}

const ffprobeSec = (f) => +(+execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f],
  { encoding: 'utf8' })).toFixed(1);
const obsozhka = (mp4, jpg) => execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '1', '-i', mp4, '-frames:v', '1', '-q:v', '3', jpg]);

// Шаг 1: ролик из облака в public/ и реестр. Возвращает причину отказа или null.
function rolikVReestr(key, karta, dd, mes) {
  const reestr = JSON.parse(fs.readFileSync(REESTR, 'utf8'));
  const id = idRolika(dd, mes), hook = kartochkaDnya(key).hook ?? '';
  const est = Object.keys(reestr.releases).find((k) => k.startsWith(`nesdayutsya/${dd}${MES_KL[mes]}-`));
  const run = artefakty(id);
  // Выпуск уже в реестре — перекачиваем, только если в облаке ролик новее (сценарий поправили и пересобрали, r533).
  if (est && (!run || reestr.releases[est].note?.includes(`прогон ${run})`))) return null;
  if (!run) return `в облаке rc-rolik нет собранного ролика ${id} (нет сценария days/${id}.json или render.yml не запускался)`;
  const slug = String(karta.audioguide?.audioSrc ?? '').match(/audio-guide-(.+?)-ru/)?.[1];
  if (!slug) return 'нет имени дня для файлов ролика (audioguide.audioSrc audio-guide-<имя>-ru.mp3)';
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `ns-konveyer-${key}-`));
  const imya = `${dd}${MES_KL[mes]}-${slug}`, vypusk = `nesdayutsya/${imya}`, fajly = {};
  try {
    for (const [f, suf] of [['16x9', ''], ['9x16', '-9x16']]) {
      gh('run', 'download', String(run), '-R', ROLIK, '-n', `${id}-A-${f}`, '-D', path.join(tmp, f));
      const mp4 = fs.readdirSync(path.join(tmp, f), { recursive: true }).find((x) => String(x).endsWith('.mp4'));
      if (!mp4) return `в артефакте ${id}-A-${f} прогона ${run} нет mp4`;
      const cel = path.join(KOREN, 'public', VIDEO, `day-${imya}${suf}.mp4`);
      fs.copyFileSync(path.join(tmp, f, String(mp4)), cel);
      obsozhka(cel, cel.replace(/\.mp4$/, '-poster.jpg'));
      fajly[f] = { cel, sec: ffprobeSec(cel), mb: +(fs.statSync(cel).size / 1048576).toFixed(1) };
    }
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  const v = est ? (reestr.releases[est].horizontal?.v ?? 1) + 1 : 1; // новая версия — сбросить кэш у зрителя
  const fail = (suf, w, h, x) => ({ file: `${vypusk}/day-${imya}${suf}.mp4`, local: `${VIDEO}/day-${imya}${suf}.mp4`, v, w, h, sec: x.sec, mb: x.mb });
  reestr.releases[vypusk] = {
    title: `История в ${sekund(Math.round(fajly['16x9'].sec))}`,
    intro: hook,
    note: `Ролик собран в облаке rc-rolik (render.yml, прогон ${run}) из сценария days/${id}.json и кадров дня. Закадровый текст озвучен синтезом речи.`,
    horizontal: fail('', 1920, 1080, fajly['16x9']),
    vertical: fail('-9x16', 1080, 1920, fajly['9x16']),
    poster: { file: `${vypusk}/day-${imya}-poster.jpg`, local: `${VIDEO}/day-${imya}-poster.jpg`, v },
    poster_vertical: { file: `${vypusk}/day-${imya}-9x16-poster.jpg`, local: `${VIDEO}/day-${imya}-9x16-poster.jpg`, v },
  };
  fs.writeFileSync(REESTR, `${JSON.stringify(reestr, null, 2)}\n`);
  console.log(`  ролик: ${vypusk} из прогона ${run}, ${fajly['16x9'].sec} с${est ? `, замена старого (v${v})` : ''}`);
  return null;
}

const sekund = (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'секунду' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'секунды' : 'секунд'}`;

// Шаг 2: блок video в карточку из реестра.
function videoVKartochku(fail, dd, mes) {
  const doc = YAML.parseDocument(fs.readFileSync(fail, 'utf8'));
  const r = rolikIzReestra(dd, mes);
  if (!r) return doc.has('video') ? null : 'ролика нет в реестре public/video/registry.json';
  if (doc.has('video')) { // блок есть — обновить, если реестр новее (замена ролика)
    if (JSON.stringify(doc.toJS().video) === JSON.stringify(r)) return null;
    doc.set('video', doc.createNode(r));
    fs.writeFileSync(fail, doc.toString({ lineWidth: 0 }));
    console.log('  карточка: блок video обновлён из реестра');
    return null;
  }
  const items = doc.contents.items;
  const i = items.findIndex((p) => p.key?.value === 'daynav');
  items.splice(i < 0 ? items.length : i + 1, 0, doc.createPair('video', r));
  const nav = doc.get('daynav');
  if (nav && !nav.items.some((x) => x.get?.('id') === 'video')) nav.items.unshift(doc.createNode({ id: 'video', label: 'Видео' }));
  fs.writeFileSync(fail, doc.toString({ lineWidth: 0 }));
  console.log('  карточка: блок video из реестра');
  return null;
}

// Шаг 4: сверка комплекта. Возвращает список причин.
const scenarii = {};
function sverka(key, fail, dd, mes) {
  const net = [];
  const k = YAML.parse(fs.readFileSync(fail, 'utf8')), kal = kartochkaDnya(key);
  if (!kal.title || !kal.hook) net.push(`карточка календаря: нет title или hook в src/content/days/ne-sdayutsya/${key}.json`);
  else {
    if (k.head?.sobytie !== kal.title) net.push(`название: на странице «${k.head?.sobytie}», в карточке календаря «${kal.title}»`);
    if (k.lead?.hook !== kal.hook) net.push(`хук: на странице «${k.lead?.hook}», в карточке календаря «${kal.hook}»`);
    if (k.video && k.video.intro !== kal.hook) net.push(`ролик: подпись «${k.video.intro}», в карточке календаря «${kal.hook}»`);
  }
  if (k.adres !== 'den') net.push('страница: нет adres: den — замки ns-iz-utverzhdennyh не прошли');
  const ag = k.audioguide?.audioSrc;
  if (!ag) net.push('аудиогид: нет audioguide.audioSrc');
  else if (!fs.existsSync(path.join(KOREN, 'public/muzei/ne-sdayutsya', ag))) net.push(`аудиогид: нет файла ${ag}`);
  const v = k.video?.mp4?.split('?')[0];
  if (!v) net.push('ролик: нет блока video');
  else for (const f of [v, v.replace(/\.mp4$/, '-9x16.mp4')]) if (!fs.existsSync(path.join(KOREN, 'public', f))) net.push(`ролик: нет файла ${f}`);
  const id = idRolika(dd, mes);
  if (!(id in scenarii)) {
    try { scenarii[id] = JSON.parse(gh('api', `repos/${ROLIK}/contents/days/${id}.json`, '-H', 'Accept: application/vnd.github.raw')); }
    catch { scenarii[id] = null; }
  }
  const s = scenarii[id]?.segments?.[0];
  if (!s) net.push(`хук: нет сценария ролика days/${id}.json в rc-rolik`);
  else if (norm(s.show ?? s.say) !== norm(k.lead?.hook)) net.push(`хук: в ролике «${s.show ?? s.say}», на странице «${k.lead?.hook}»`);
  return net;
}

let vse = true;
const otchet = [];
for (const key of dni) {
  const [mm, dd] = key.split('-'), mes = +mm - 1;
  const fail = path.join(VYHOD, `${key}.yaml`);
  console.log(`${key}:`);
  let net = [];
  if (!fs.existsSync(fail)) net.push(`карточка: нет ${path.relative(KOREN, fail)} — сначала node scripts/ns-iz-utverzhdennyh.mjs ${key} --iz-staroy`);
  else {
    if (!SVERKA) {
      const karta = YAML.parse(fs.readFileSync(fail, 'utf8'));
      const p1 = rolikVReestr(key, karta, dd, mes) ?? videoVKartochku(fail, dd, mes);
      if (p1) console.log(`  ролик: ${p1}`);
      const r = spawnSync('node', [path.join(KOREN, 'scripts/ns-iz-utverzhdennyh.mjs'), key, ...UTV], { cwd: KOREN, encoding: 'utf8' });
      for (const s of `${r.stdout}${r.stderr}`.split('\n').filter((x) => x && !x.startsWith('  ·'))) console.log(`  ${s}`);
      if (r.status === 1) net.push('страница: ns-iz-utverzhdennyh остановилась (ОСТАНОВ выше)');
    }
    net = net.concat(sverka(key, fail, dd, mes));
  }
  // Комплект неполный — день не уходит: adres снимаем (откат дня — тоже снять adres).
  if (net.length && !SVERKA && fs.existsSync(fail)) {
    const doc = YAML.parseDocument(fs.readFileSync(fail, 'utf8'));
    if (doc.has('adres')) { doc.delete('adres'); fs.writeFileSync(fail, doc.toString({ lineWidth: 0 })); console.log('  страница: adres снят — комплект неполный'); }
  }
  if (net.length) vse = false;
  for (const n of net) console.log(`  ✗ ${n}`);
  if (!net.length) console.log('  ✓ комплект: страница, аудиогид, ролик 16:9 и 9:16, хук один');
  otchet.push({ key, net });
}

if (KARTOCHKI) {
  for (const { key, net } of otchet.filter((x) => x.net.length)) {
    const telo = `Конвейер дня (scripts/ns-konveyer.mjs, Р524): день не ушёл на сайт.\n\n${net.map((n) => `- ${n}`).join('\n')}`;
    const url = gh('issue', 'create', '-R', 'arabelthera-dot/rc-site', '-t', `НС ${key}: день не ушёл — ${net[0].split(':')[0]}`, '-b', telo).trim();
    console.log(`${key}: карточка ${url}`);
  }
}
process.exit(vse ? 0 : 2);
