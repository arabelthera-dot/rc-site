// Сторож пропорций ролика дня (r413, находка r402b 28.10: на 18 янв. изобретений телефон 390×844 показывал
// обложку 9:16, а играл ролик 16:9). Обложка и ролик одного формата — и на телефоне, и на ПК.
// Меряются настоящие файлы в public/ (JPEG — заголовок SOF, MP4 — tkhd видеодорожки), не числа из реестра:
//   1) реестр public/video/registry/<музей>/<id>.json (scripts/reestr-rolikov.mjs): poster ↔ horizontal, poster_vertical ↔ vertical (у выпуска с файлами в public/);
//   2) дни общего шаблона src/content/dni-shablon/<музей>/ММ-ДД.yaml: запасная пара video.poster ↔ video.mp4 из HTML
//      и выпуск video.klyuch в реестре (его пары — п.1);
//   3) движок public/assets/museum-video.js подменяет адрес и при событии play (запуск мимо касания) — иначе
//      под обложкой 9:16 играет запасной 16:9 из HTML (корень r413);
//   4) ЗАМОК 9:16 (Р550, дыра 26 янв.): рядом с horizontal.local лежит <имя>-9x16.mp4, а в реестре нет vertical —
//      код 1 (телефон получает 16:9, хотя ролик 9:16 сделан). Долг — «9x16-bez-reestra» в src/data/dyry-dolg.json.
// Расхождение пропорций больше 2% — код 1 и ::error::. Файла пары нет — ::warning:: (жёлтая строка, отдельный долг),
// мерить нечего. Без сборки и браузера, секунды.
// Запуск: node scripts/proporcii-rolika.mjs [--proba]. Стоит в начале npm run build (package.json): красный — сборка не идёт. Откат — убрать вызов оттуда.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { chitat, zapisatVypusk } from './reestr-rolikov.mjs';

const est = (k) => process.argv.includes(k);
const DOPUSK = 0.02;

// Размер JPEG: первый маркер SOF0..SOF15 (кроме DHT/JPG/DAC).
export function jpegRazmer(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
    i += 2 + len;
  }
  return null;
}

// Размер MP4: tkhd первой дорожки с ненулевой шириной (moov → trak → tkhd), с учётом поворота из матрицы.
export function mp4Razmer(buf) {
  const boxes = (from, to, cb) => {
    let i = from;
    while (i + 8 <= to) {
      let size = buf.readUInt32BE(i), hdr = 8;
      const type = buf.toString('latin1', i + 4, i + 8);
      if (size === 1) { size = Number(buf.readBigUInt64BE(i + 8)); hdr = 16; } else if (size === 0) size = to - i;
      if (size < hdr) return null;
      const r = cb(type, i + hdr, Math.min(i + size, to));
      if (r) return r;
      i += size;
    }
    return null;
  };
  return boxes(0, buf.length, (t, a, b) => t !== 'moov' ? null : boxes(a, b, (t2, a2, b2) => t2 !== 'trak' ? null :
    boxes(a2, b2, (t3, a3) => {
      if (t3 !== 'tkhd') return null;
      const v1 = buf[a3] === 1, base = a3 + (v1 ? 52 : 40); // матрица 9×4 байт, затем ширина и высота 16.16
      const w = buf.readUInt32BE(base + 36) / 65536, h = buf.readUInt32BE(base + 40) / 65536;
      if (!w || !h) return null;
      const povorot = buf.readInt32BE(base) === 0 && buf.readInt32BE(base + 4) !== 0; // a=0, b≠0 — 90°/270°
      return povorot ? { w: h, h: w } : { w, h };
    })));
}

export function razmer(file) {
  if (!fs.existsSync(file)) return null;
  const buf = fs.readFileSync(file);
  return /\.mp4$/i.test(file) ? mp4Razmer(buf) : jpegRazmer(buf);
}

const fmt = (r) => r ? `${r.w}×${r.h}` : '?';
const rashod = (a, b) => Math.abs(a.w / a.h - b.w / b.h) / (b.w / b.h);

// Сверка одной пары. Возвращает строку ошибки или null; файла нет — в zhyoltye (пропорцию не сверить).
function para(gde, poster, rolik, zhyoltye) {
  const p = razmer(poster), v = razmer(rolik);
  if (!p) { zhyoltye.push(`${gde}: обложка ${path.basename(poster)} не найдена или не JPEG`); return null; }
  if (!v) { zhyoltye.push(`${gde}: ролик ${path.basename(rolik)} не найден или не MP4`); return null; }
  if (rashod(p, v) > DOPUSK) return `${gde}: обложка ${fmt(p)} (${path.basename(poster)}) и ролик ${fmt(v)} (${path.basename(rolik)}) разных пропорций`;
  return null;
}

const bezV = (s) => String(s).split('?')[0].replace(/^\//, '');

export function proverit(root) {
  const pub = (p) => path.join(root, 'public', bezV(p));
  const oshibki = [], zhyoltye = [];
  let par = 0;
  const reg = chitat(path.join(root, 'public')).releases;
  const fDolg = path.join(root, 'src/data/dyry-dolg.json');
  const dolg9x16 = new Set(fs.existsSync(fDolg) ? JSON.parse(fs.readFileSync(fDolg, 'utf8'))['9x16-bez-reestra'] ?? [] : []);
  for (const [k, rel] of Object.entries(reg)) {
    for (const [pk, vk] of [['poster', 'horizontal'], ['poster_vertical', 'vertical']]) {
      if (!rel[pk] || !rel[vk]) continue;
      // Выпуск без файлов в public/ (только облако) — не мерим: файлов нет и у страницы.
      if (!fs.existsSync(pub(rel[pk].local)) && !fs.existsSync(pub(rel[vk].local))) continue;
      par++;
      const e = para(`реестр ${k} ${pk}↔${vk}`, pub(rel[pk].local), pub(rel[vk].local), zhyoltye);
      if (e) oshibki.push(e);
    }
    if (rel.vertical && !rel.poster_vertical && fs.existsSync(pub(rel.vertical.local)))
      oshibki.push(`реестр ${k}: есть ролик 9:16, нет poster_vertical — на телефоне обложка 16:9 над роликом 9:16`);
    const f9x16 = rel.horizontal?.local && !rel.vertical ? pub(bezV(rel.horizontal.local).replace(/\.mp4$/i, '-9x16.mp4')) : null;
    if (f9x16 && fs.existsSync(f9x16)) {
      if (!dolg9x16.has(k)) oshibki.push(`реестр ${k}: лежит ${path.basename(f9x16)}, а в реестре нет vertical — телефон получит 16:9 (Р550; записать vertical и poster_vertical в public/video/registry/${k}.json)`);
    } else if (dolg9x16.has(k)) zhyoltye.push(`реестр ${k}: дыры 9:16 больше нет — снять из долга «9x16-bez-reestra» (src/data/dyry-dolg.json)`);
  }
  const shablon = path.join(root, 'src/content/dni-shablon');
  for (const muzey of fs.existsSync(shablon) ? fs.readdirSync(shablon) : []) {
    for (const f of fs.readdirSync(path.join(shablon, muzey)).filter((x) => /\.ya?ml$/.test(x)).sort()) {
      const txt = fs.readFileSync(path.join(shablon, muzey, f), 'utf8');
      const blok = txt.match(/^video:\n((?:[ \t]+.*\n?)*)/m);
      if (!blok) continue;
      const pole = (n) => (blok[1].match(new RegExp(`^\\s+${n}:\\s*["']?([^"'\\n]+?)["']?\\s*$`, 'm')) || [])[1];
      const gde = `${muzey}/${f}`;
      const poster = pole('poster'), mp4 = pole('mp4'), klyuch = pole('klyuch');
      if (poster && mp4) {
        par++;
        const e = para(`${gde} запасная пара в HTML`, pub(`muzei/${muzey}/${poster}`), pub(`muzei/${muzey}/${mp4}`), zhyoltye);
        if (e) oshibki.push(e);
      }
      if (klyuch && !reg[klyuch]) oshibki.push(`${gde}: выпуска ${klyuch} нет в реестре`);
    }
  }
  const dvizhok = path.join(root, 'public/assets/museum-video.js');
  if (fs.existsSync(dvizhok) && !/addEventListener\('play'/.test(fs.readFileSync(dvizhok, 'utf8')))
    oshibki.push('museum-video.js: нет подмены адреса по событию play — запуск мимо касания играет запасной 16:9 под обложкой 9:16');
  return { oshibki, zhyoltye, par };
}

if (est('--proba')) {
  // Пробы на заведомых файлах: минимальные JPEG (SOF0) и MP4 (moov/trak/tkhd) нужного размера.
  const jpg = (w, h) => Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0, 17, 8, h >> 8, h & 255, w >> 8, w & 255, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1, 0xff, 0xd9]);
  const mp4 = (w, h) => {
    const tkhd = Buffer.alloc(8 + 84); tkhd.writeUInt32BE(92, 0); tkhd.write('tkhd', 4, 'latin1');
    tkhd.writeInt32BE(0x10000, 8 + 40); tkhd.writeInt32BE(0x10000, 8 + 56); tkhd.writeInt32BE(0x40000000, 8 + 72);
    tkhd.writeUInt32BE(w * 65536, 8 + 76); tkhd.writeUInt32BE(h * 65536, 8 + 80);
    const box = (t, b) => { const h8 = Buffer.alloc(8); h8.writeUInt32BE(8 + b.length, 0); h8.write(t, 4, 'latin1'); return Buffer.concat([h8, b]); };
    return Buffer.concat([box('ftyp', Buffer.from('isom0000')), box('moov', box('trak', tkhd))]);
  };
  const DV_OK = "video.addEventListener('play', onPlay);";
  const proby = [ // [имя, ролик 16:9, обложка, ролик 9:16, обложка 9:16, движок, ждём красный, реестр без vertical: '' | 'да' | 'в долге']
    ['всё в пару', [1920, 1080], [1920, 1080], [1080, 1920], [1080, 1920], DV_OK, false],
    ['обложка 9:16 над роликом 16:9', [1920, 1080], [1080, 1920], [1080, 1920], [1080, 1920], DV_OK, true],
    ['обложка 16:9 над роликом 9:16', [1920, 1080], [1920, 1080], [1080, 1920], [1280, 720], DV_OK, true],
    ['движок без подмены по play', [1920, 1080], [1920, 1080], [1080, 1920], [1080, 1920], '', true],
    ['файл 9:16 лежит, в реестре нет vertical', [1920, 1080], [1920, 1080], [1080, 1920], [1080, 1920], DV_OK, true, 'да'],
    ['то же, но выпуск в долге', [1920, 1080], [1920, 1080], [1080, 1920], [1080, 1920], DV_OK, false, 'в долге'],
  ];
  let plokho = 0;
  for (const [imya, h, p, v, pv, dv, zhdu, bezVert = ''] of proby) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'proporcii-proba-'));
    const vid = path.join(tmp, 'public/muzei/proba/video');
    fs.mkdirSync(vid, { recursive: true }); fs.mkdirSync(path.join(tmp, 'public/assets'));
    fs.mkdirSync(path.join(tmp, 'src/content/dni-shablon/proba'), { recursive: true });
    fs.writeFileSync(path.join(vid, 'r.mp4'), mp4(...h)); fs.writeFileSync(path.join(vid, 'r.jpg'), jpg(...p));
    fs.writeFileSync(path.join(vid, 'r-9x16.mp4'), mp4(...v)); fs.writeFileSync(path.join(vid, 'r-9x16.jpg'), jpg(...pv));
    fs.writeFileSync(path.join(tmp, 'public/assets/museum-video.js'), dv);
    const e = (f) => ({ local: `muzei/proba/video/${f}`, v: 1 });
    zapisatVypusk(path.join(tmp, 'public'), 'proba/r', bezVert ? { horizontal: e('r.mp4'), poster: e('r.jpg') } : {
      horizontal: e('r.mp4'), poster: e('r.jpg'), vertical: e('r-9x16.mp4'), poster_vertical: e('r-9x16.jpg') });
    if (bezVert === 'в долге') {
      fs.mkdirSync(path.join(tmp, 'src/data'), { recursive: true });
      fs.writeFileSync(path.join(tmp, 'src/data/dyry-dolg.json'), JSON.stringify({ '9x16-bez-reestra': ['proba/r'] }));
    }
    fs.writeFileSync(path.join(tmp, 'src/content/dni-shablon/proba/01-01.yaml'),
      'video:\n  klyuch: proba/r\n  poster: video/r.jpg?v=1\n  mp4: video/r.mp4?v=1\n');
    const { oshibki } = proverit(tmp);
    const krasnyy = oshibki.length > 0;
    console.log(`${krasnyy === zhdu ? 'ок ' : 'БРАК'} проба «${imya}»: ${krasnyy ? 'красный' : 'зелёный'}${oshibki.length ? ' — ' + oshibki[0] : ''}`);
    if (krasnyy !== zhdu) plokho++;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  if (plokho) { console.log(`::error::proporcii-rolika: ${plokho} проб не сработали`); process.exit(1); }
  console.log('proporcii-rolika: пробы прошли');
  process.exit(0);
}

const { oshibki, zhyoltye, par } = proverit(process.cwd());
for (const e of zhyoltye) console.log(`::warning::proporcii-rolika: ${e}`);
for (const e of oshibki) console.log(`::error::proporcii-rolika: ${e}`);
console.log(`proporcii-rolika: пар обложка↔ролик ${par}, расхождений ${oshibki.length}, без файла ${zhyoltye.length}`);
process.exit(oshibki.length ? 1 : 0);
