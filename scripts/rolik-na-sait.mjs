// Ролик и аудиогид из облака — на сайт заявкой (r538, Р524/Р525/Р529; корень «забыл ролик»).
// Пять вопросов до изменения (Сергей, 28.09.2026):
// Что задевает — public/muzei/<музей>/video/ (ролики, обложки), public/muzei/<музей>/<audioSrc>.mp3 (гид) и файл
//   выпуска public/video/registry/<реестр>/<imya>.json; страницу дня не трогает (ключ video в дне уже указывает на выпуск).
// Что нужно — выпуски rc-rolik: render.yml публикует vypusk-<день>-<прогон> (по полю sajt в days/<день>.json),
//   audiogid.yml — vypusk-ag-<музей>-<день>-<прогон> (по muzei и audioguide.audioSrc дня); в каждом vypusk.json.
// Что будет без нужного — ролик лежит в артефакте облака 14 дней и на сайт не приходит, пока его не перенесут руками.
// Проверка до слияния — заявка бота проходит сборку (DenMedia требует файл ролика) и все проверки сайта.
// Откат — revert заявки выпуска; выключить машину — удалить .github/workflows/rolik-na-sait.yml.
// Запуск: node scripts/rolik-na-sait.mjs spisok — новые выпуски (по одному последнему на место), тег в строке;
//   node scripts/rolik-na-sait.mjs primenit <тег> — разложить выпуск в public/ и записать реестр; путь — в выводе.
// Записи реестра — как у ns-konveyer (rolikVReestr): тот же note «прогон N)» — по нему видно, что выпуск уже на сайте.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chitat, zapisatVypusk } from './reestr-rolikov.mjs';

const KOREN = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PUB = path.join(KOREN, 'public');
const ROLIK = 'arabelthera-dot/rc-rolik';
const SAIT = process.env.GITHUB_REPOSITORY || 'arabelthera-dot/rc-site';
const IMYA = /^[a-z0-9-]+$/;
const gh = (...a) => execFileSync('gh', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 });
const sekund = (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'секунду' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'секунды' : 'секунд'}`;
const muzeiSajta = () => new Set(JSON.parse(fs.readFileSync(path.join(KOREN, 'src/data/museums.json'), 'utf8')).museums.map((m) => m.slug));
const vetka = (teg) => `avto/rolik-${teg}`;

function manifest(teg) {
  const m = JSON.parse(gh('release', 'download', teg, '-R', ROLIK, '-p', 'vypusk.json', '-O', '-'));
  const muzei = muzeiSajta();
  if (!muzei.has(m.muzei)) throw new Error(`${teg}: музея «${m.muzei}» нет в src/data/museums.json`);
  if (m.vid === 'rolik') {
    if (![m.reestr, m.imya].every((x) => IMYA.test(x ?? ''))) throw new Error(`${teg}: reestr/imya не латиницей`);
    return { ...m, mesto: `${m.reestr}/${m.imya}` };
  }
  if (m.vid === 'audiogid') {
    if (!/^[a-z0-9-]+\.mp3$/.test(m.fajl ?? '')) throw new Error(`${teg}: fajl гида не вида <имя>.mp3`);
    return { ...m, mesto: `${m.muzei}/${m.fajl}` };
  }
  throw new Error(`${teg}: неизвестный vid «${m.vid}»`);
}

// Гид уже на сайте — тот же mp3 лежит в main (сравнение по git-хэшу, без выгрузки public/).
function gidNaSaite(m, teg) {
  const put = `public/muzei/${m.muzei}/${m.fajl}`;
  let blob;
  try { blob = execFileSync('git', ['-C', KOREN, 'rev-parse', `origin/main:${put}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return false; }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rolik-na-sait-'));
  try {
    gh('release', 'download', teg, '-R', ROLIK, '-p', m.fajl, '-D', tmp);
    const b = fs.readFileSync(path.join(tmp, m.fajl));
    return crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex') === blob;
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

function spisok() {
  // новые сначала: «дата тег» по строке
  const tegi = gh('api', '--paginate', `repos/${ROLIK}/releases?per_page=100`, '-q', '.[] | select(.tag_name | startswith("vypusk-")) | "\\(.created_at) \\(.tag_name)"')
    .split('\n').filter(Boolean).sort().reverse().map((s) => s.split(' ')[1]);
  const reestr = chitat(PUB).releases ?? {}, vzyato = new Set();
  for (const teg of tegi) {
    let m;
    try { m = manifest(teg); } catch (e) { console.error(`  ✗ ${e.message}`); continue; }
    if (vzyato.has(m.mesto)) continue; // на это место есть выпуск новее
    vzyato.add(m.mesto);
    if (m.vid === 'rolik' && reestr[m.mesto]?.note?.includes(`прогон ${m.run})`)) continue;
    if (gh('pr', 'list', '-R', SAIT, '--head', vetka(teg), '--state', 'all', '--json', 'number', '-q', 'length').trim() !== '0') continue;
    if (m.vid === 'audiogid' && gidNaSaite(m, teg)) continue;
    console.log(teg);
  }
}

function primenit(teg) {
  const m = manifest(teg);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rolik-na-sait-'));
  const fajly = [];
  try {
    gh('release', 'download', teg, '-R', ROLIK, '-D', tmp);
    const vzyat = (imya, kuda) => {
      const ot = path.join(tmp, imya);
      if (!fs.existsSync(ot)) throw new Error(`${teg}: в выпуске нет ${imya}`);
      fs.mkdirSync(path.dirname(path.join(PUB, kuda)), { recursive: true });
      fs.copyFileSync(ot, path.join(PUB, kuda));
      fajly.push(`public/${kuda}`);
    };
    if (m.vid === 'audiogid') {
      vzyat(m.fajl, `muzei/${m.muzei}/${m.fajl}`);
      console.log(`гид ${m.muzei} ${m.den} → public/muzei/${m.muzei}/${m.fajl}, ${m.sec} с, прогон ${m.run}`);
    } else {
      const VIDEO = `muzei/${m.muzei}/video`, { imya, mesto: vypusk } = m;
      for (const suf of ['', '-9x16']) for (const x of ['.mp4', '-poster.jpg']) vzyat(`day-${imya}${suf}${x}`, `${VIDEO}/day-${imya}${suf}${x}`);
      const est = chitat(PUB).releases?.[vypusk];
      const v = est ? (est.horizontal?.v ?? 1) + 1 : 1; // новая версия — сбросить кэш у зрителя
      const fail = (suf, w, h, x) => ({ file: `${vypusk}/day-${imya}${suf}.mp4`, local: `${VIDEO}/day-${imya}${suf}.mp4`, v, w, h, sec: x.sec, mb: x.mb });
      fajly.push(path.relative(KOREN, zapisatVypusk(PUB, vypusk, {
        title: `История в ${sekund(Math.round(m.fajly['16x9'].sec))}`,
        intro: est?.intro || m.hook, // крючок страницы главнее: день один, хук один
        note: `Ролик собран в облаке rc-rolik (render.yml, прогон ${m.run}) из сценария days/${m.den}.json и кадров дня. Закадровый текст озвучен синтезом речи.`,
        horizontal: fail('', 1920, 1080, m.fajly['16x9']),
        vertical: fail('-9x16', 1080, 1920, m.fajly['9x16']),
        poster: { file: `${vypusk}/day-${imya}-poster.jpg`, local: `${VIDEO}/day-${imya}-poster.jpg`, v },
        poster_vertical: { file: `${vypusk}/day-${imya}-9x16-poster.jpg`, local: `${VIDEO}/day-${imya}-9x16-poster.jpg`, v },
      })));
      console.log(`ролик ${vypusk} из прогона ${m.run}, ${m.fajly['16x9'].sec} с${est ? `, замена (v${v})` : ''}`);
    }
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  for (const f of fajly) console.log(`  ${f}`);
}

const [cmd, teg] = process.argv.slice(2);
if (cmd === 'spisok') spisok();
else if (cmd === 'primenit' && /^vypusk-[a-z0-9-]+$/.test(teg ?? '')) primenit(teg);
else { console.error('запуск: node scripts/rolik-na-sait.mjs spisok | primenit <тег vypusk-…>'); process.exit(2); }
