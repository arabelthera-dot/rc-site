// Ролики в хранилище media.russian-civilization.ru (Р825 задача A, 18.11.2026): mp4 уходят из public/ — git, сборка
// и выкладка без 3 ГБ роликов. Что лежит в хранилище, знает манифест src/data/hranilishche-rolikov.sha256 — формат
// sha256sum (GNU coreutils, «хэш␠␠путь»), путь — от корня сайта, как в хранилище (/srv/rc-media/<путь>).
// Пять вопросов до изменения (Сергей, 28.09.2026):
// Что задевает — читатели «есть ли файл ролика»: DenMedia.astro, bezMedia (den-obshchee), media-base, media-dnya,
//   adres-dnya, ns-konveyer; писатель — rolik-na-sait (новый ролик — в хранилище и строкой сюда).
// Что нужно — ролик есть, если файл в public/ ИЛИ строка в манифесте; адрес на странице ставит media-base (MEDIA_BASE).
// Что будет без нужного — mp4 нет в public/ → сборка падает «нет файла ролика» или молча снимает блок ролика.
// Проверка до слияния — --proba; сверка с хранилищем — `sha256sum -c` по манифесту в /srv/rc-media.
// Откат — revert заявки: читатели снова смотрят только public/.
// Запуск: node scripts/hranilishche-rolikov.mjs --proba
//         node scripts/hranilishche-rolikov.mjs --dopisat <путь от корня сайта> <файл> — строка ролика (новая или замена)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export const MANIFEST = 'src/data/hranilishche-rolikov.sha256';
const STROKA = /^([0-9a-f]{64}) [ *](.+)$/;
const bezPublic = (p) => String(p).split(/[?#]/)[0].replace(/^\/+/, '').replace(/^public\//, '');

const kesh = new Map();
// Манифест: Map путь от корня сайта → sha256. Битая строка — исключение (как битый реестр роликов).
export function chitatManifest(f = MANIFEST) {
  if (kesh.has(f)) return kesh.get(f);
  const m = new Map();
  if (fs.existsSync(f)) fs.readFileSync(f, 'utf8').split('\n').forEach((s, i) => {
    if (!s.trim()) return;
    const r = s.match(STROKA);
    if (!r) throw new Error(`${f}:${i + 1}: строка не вида «sha256␠␠путь»`);
    m.set(r[2], r[1]);
  });
  kesh.set(f, m);
  return m;
}

// Ролик есть: файл в public/ или он в хранилище. p — «public/…», «/muzei/…» или «muzei/…».
export function rolikEst(p, { pub = 'public', manifest = MANIFEST } = {}) {
  const rel = bezPublic(p);
  const f = path.join(pub, rel);
  return (fs.existsSync(f) && fs.statSync(f).isFile()) || chitatManifest(manifest).has(rel);
}
export const vHranilishche = (p, manifest = MANIFEST) => chitatManifest(manifest).has(bezPublic(p));

// Строка ролика в манифест (писатель — rolik-na-sait после заливки в хранилище). Порядок — по пути, как у sort.
export function dopisat(rel, fail, manifest = MANIFEST) {
  const m = new Map(chitatManifest(manifest));
  m.set(bezPublic(rel), crypto.createHash('sha256').update(fs.readFileSync(fail)).digest('hex'));
  fs.writeFileSync(manifest, [...m].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([p, h]) => `${h}  ${p}\n`).join(''));
  kesh.delete(manifest);
  return m.get(bezPublic(rel));
}

const zapusk = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (zapusk && process.argv.includes('--proba')) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hranilishche-proba-'));
  const man = path.join(tmp, 'm.sha256'), pub = path.join(tmp, 'public');
  fs.mkdirSync(path.join(pub, 'muzei/p/video'), { recursive: true });
  fs.writeFileSync(path.join(pub, 'muzei/p/video/lokal.mp4'), 'x');
  fs.writeFileSync(path.join(tmp, 'r.mp4'), 'rolik');
  dopisat('public/muzei/p/video/r.mp4', path.join(tmp, 'r.mp4'), man);
  dopisat('/muzei/a/b.mp4', path.join(tmp, 'r.mp4'), man);
  const o = { pub, manifest: man };
  const sluchai = [
    ['файл в public/', rolikEst('public/muzei/p/video/lokal.mp4', o), true],
    ['в манифесте, в public/ нет', rolikEst('/muzei/p/video/r.mp4?v=3', o), true],
    ['нигде нет', rolikEst('muzei/p/video/net.mp4', o), false],
    ['папка — не ролик', rolikEst('muzei/p/video', o), false],
    ['манифест по пути, sha256 как у sha256sum', fs.readFileSync(man, 'utf8') === `${crypto.createHash('sha256').update('rolik').digest('hex')}  muzei/a/b.mp4\n${crypto.createHash('sha256').update('rolik').digest('hex')}  muzei/p/video/r.mp4\n`, true],
  ];
  fs.writeFileSync(path.join(tmp, 'bityy.sha256'), 'abc  x.mp4\n');
  let bityy = false;
  try { chitatManifest(path.join(tmp, 'bityy.sha256')); } catch { bityy = true; }
  sluchai.push(['битая строка — ошибка', bityy, true]);
  fs.rmSync(tmp, { recursive: true, force: true });
  const ne = sluchai.filter(([, est, zhdu]) => est !== zhdu);
  for (const [imya, est, zhdu] of sluchai) console.log(`${est === zhdu ? 'ок ' : 'БРАК'} проба «${imya}»`);
  if (ne.length) { console.log(`::error::hranilishche-rolikov: ${ne.length} проб не сработали`); process.exit(1); }
  console.log(`hranilishche-rolikov: пробы прошли (${sluchai.length})`);
  process.exit(0);
}
if (zapusk && process.argv.includes('--dopisat')) {
  const i = process.argv.indexOf('--dopisat');
  const [rel, fail] = process.argv.slice(i + 1, i + 3);
  console.log(`hranilishche-rolikov: ${bezPublic(rel)} ${dopisat(rel, fail)}`);
}
