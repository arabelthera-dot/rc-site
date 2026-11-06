// Замок аудиогида и ролика дня (Р232, Сергей 24.10.2026: «аудиогид обязателен, ролик обязателен»).
// Каждая страница дня, изменённая в заявке, должна иметь:
//   1) аудиогид — блок (section#audioguide, window.MUSEUM_AUDIOGUIDE или <audio> гида) и mp3 гида в public/:
//      файл есть, не пустой и звучит не меньше 30 с (длительность — из самого mp3: Xing/VBRI или по битрейту);
//   2) ролик — <video> вне игры с файлом mp4 в public/ (data-rc-video — через video/registry.json, иначе src/<source>):
//      файл есть и не пустой. Секция «Видео создаётся» без <video> — заглушка, не ролик.
// Пути — как у браузера: страница дня стоит с <base href="/muzei/<музей>/"> (src/integrations/full-pages.mjs).
// Аудиогид — СТРОГО: нарушение — код 1 и ::error::. Ролик здесь — только строка таблицы, без жёлтого и красного:
// строгость ролика — у судьи рамки scripts/ramka-proverki.mjs, только для дней data/rabochie-dni.json (Р558, 05.11.2026).
// Изменённые дни — git diff с базой, как у kartinki-dnya: full-pages/<музей>/ММ-ДД.html и карточки days/<музей>/ММ-ДД.json
// (карточка — только если у дня есть полная страница). Без сборки и браузера, секунды. Описание — scripts/media-dnya.README.md.
// Откат — удалить шаг из .github/workflows/proverka.yml.
// Запуск: node scripts/media-dnya.mjs [--baza origin/main] [--proba]
//         node scripts/media-dnya.mjs --vse [--muzei izobreteniya,...] — таблица по всем полным страницам, без падения.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { mp3Sek } from '../src/lib/mp3-sek.mjs';
import { chitat, zapisatVypusk } from './reestr-rolikov.mjs';

const FULL = 'src/data/full-pages';
const DAYS = 'src/content/days';
const MIN_SEK = 30;
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const est = (k) => process.argv.includes(k);

// Длительность mp3 — общий модуль src/lib/mp3-sek.mjs (его же берёт замок дня src/lib/den-obshchee.mjs, r602).
export { mp3Sek };
// Длительность mp4, с: коробка mvhd (timescale, duration). null — не нашлась.
export function mp4Sek(buf) {
  const i = buf.indexOf('mvhd', 0, 'latin1');
  if (i < 4 || i + 32 > buf.length) return null;
  const v1 = buf[i + 4] === 1;
  const ts = buf.readUInt32BE(i + (v1 ? 24 : 16));
  const dur = v1 ? Number(buf.readBigUInt64BE(i + 28)) : buf.readUInt32BE(i + 20);
  return ts ? dur / ts : null;
}

const atr = (tag, a) => tag.match(new RegExp(`\\b${a}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
// Игра: ролики и звуки внутри неё — не ролик и не гид дня.
const vIgre = (html, at) => {
  const do_ = html.slice(0, at);
  const otkr = [...do_.matchAll(/<(section|div)\b[^>]*\b(?:id=["'](?:games|game[^"']*|[^"']*-game|igra[^"']*)["']|data-game|data-igra-scena)[^>]*>/gi)].pop();
  if (!otkr) return false;
  // Игра закрылась раньше, если глубина от её открывающего тега дошла до нуля (r558: простой счёт «открытых больше» ловил
  // секцию самого ролика, идущую после игры, — так izobreteniya 01-29 с роликом считалась без ролика).
  let gl = 0;
  for (const t of do_.slice(otkr.index).match(new RegExp(`<\\/?${otkr[1]}\\b`, 'gi')) || []) {
    gl += t.startsWith('</') ? -1 : 1;
    if (gl === 0) return false;
  }
  return true;
};

// Что не так с медиа страницы дня: { ag: [...], rolik: [...] } — пусто, значит на месте; плюс сведения для таблицы.
export function proverit(html, muzey, root) {
  const ot = (ref) => decodeURIComponent(new URL(ref.split('#')[0], `http://x/muzei/${muzey}/`).pathname).slice(1);
  const fail = (rel) => { const f = path.join(root, rel); return fs.existsSync(f) && fs.statSync(f).isFile() ? f : null; };
  const r = { ag: [], rolik: [], agSek: null, rolikSek: null };

  // 1) Аудиогид.
  const ist = [];
  const cfg = html.match(/MUSEUM_AUDIOGUIDE\s*=\s*\{[\s\S]*?\baudioSrc\s*:\s*["'`]([^"'`]+)["'`]/);
  if (cfg) ist.push(cfg[1]);
  for (const m of html.matchAll(/<audio\b[^>]*>([\s\S]*?)<\/audio>/gi)) {
    const tag = m[0].slice(0, m[0].indexOf('>') + 1);
    const src = atr(tag, 'data-src') || atr(tag, 'src') || atr(m[1].match(/<source\b[^>]*>/i)?.[0] || '', 'src');
    if (!src || /\bdata-film-audio\b/i.test(tag) || vIgre(html, m.index)) continue;
    if (/\bdata-guide-audio\b|\bid=["']agaudio["']/i.test(tag) || /audio-?guide/i.test(src)) ist.push(src);
  }
  const blok = /\bid=["']audioguide["']/i.test(html) || ist.length > 0;
  const agFaily = [...new Set(ist)];
  if (!blok) r.ag.push('нет блока аудиогида (section#audioguide / MUSEUM_AUDIOGUIDE)');
  else if (!agFaily.length) r.ag.push('блок аудиогида без файла mp3');
  for (const ref of agFaily) {
    const rel = ot(ref), f = fail(rel);
    if (!f) { r.ag.push(`нет файла аудиогида ${rel}`); continue; }
    const buf = fs.readFileSync(f);
    if (!buf.length) { r.ag.push(`файл аудиогида пустой ${rel}`); continue; }
    const sek = mp3Sek(buf);
    r.agSek = sek;
    if (sek === null) r.ag.push(`файл аудиогида не mp3 ${rel}`);
    else if (sek < MIN_SEK) r.ag.push(`аудиогид ${Math.round(sek)} с — меньше ${MIN_SEK} с (${rel})`);
  }

  // 2) Ролик.
  let reg;
  const rolik = [];
  for (const m of html.matchAll(/<video\b[^>]*>([\s\S]*?)<\/video>/gi)) {
    if (vIgre(html, m.index)) continue;
    const tag = m[0].slice(0, m[0].indexOf('>') + 1);
    const klyuch = atr(tag, 'data-rc-video');
    if (klyuch) {
      reg ??= chitat(root);
      const fmt = atr(tag, 'data-rc-format') || 'horizontal';
      const zap = reg.releases?.[klyuch]?.[fmt];
      rolik.push(zap?.local ? { rel: zap.local, kto: `реестр ${klyuch}` } : { net: `выпуска ${klyuch} (${fmt}) нет в video/registry/` });
      continue;
    }
    const src = atr(tag, 'src') || atr(tag, 'data-src') || atr(m[1].match(/<source\b[^>]*>/i)?.[0] || '', 'src')
      || atr(m[1].match(/<source\b[^>]*>/i)?.[0] || '', 'data-src');
    rolik.push(src ? { rel: ot(src) } : { net: '<video> без файла' });
  }
  if (!rolik.length) {
    r.rolik.push(/\bid=["']video["']/i.test(html) ? 'секция ролика — заглушка, <video> нет' : 'нет блока ролика (<video>)');
  }
  for (const v of rolik) {
    if (v.net) { r.rolik.push(v.net); continue; }
    const f = fail(v.rel);
    if (!f) { r.rolik.push(`нет файла ролика ${v.rel}${v.kto ? ` (${v.kto})` : ''}`); continue; }
    const buf = fs.readFileSync(f);
    if (!buf.length) { r.rolik.push(`файл ролика пустой ${v.rel}`); continue; }
    r.rolikSek ??= mp4Sek(buf);
  }
  return r;
}

function otchet(itog, zagolovok) {
  const sek = (s) => (s == null ? '—' : `${Math.round(s)} с`);
  const agOk = itog.filter((r) => !r.ag.length), rOk = itog.filter((r) => !r.rolik.length);
  const stroki = ['| день | аудиогид | ролик | итог |', '|---|---|---|---|',
    ...itog.map((r) => `| ${r.muzey} ${r.key} | ${r.ag.length ? 'нет' : sek(r.agSek)} | ${r.rolik.length ? 'нет' : sek(r.rolikSek)} | ${
      [r.ag.length ? 'КРАСНЫЙ: ' + r.ag.join('; ') : '', r.rolik.length ? 'ролик: ' + r.rolik.join('; ') : '']
        .filter(Boolean).join(' · ') || 'зелёный'} |`)];
  return `### ${zagolovok}: аудиогид ${agOk.length} из ${itog.length}, ролик ${rOk.length} из ${itog.length}`
    + ` (ролик — отчёт; строго — судья рамки, Р558)\n\n${stroki.join('\n')}\n`;
}

// Модуль подключает судья рамки (scripts/ramka-proverki.mjs) — без запуска главной части.
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) glavnaya();

function glavnaya() {
if (est('--proba')) {
  // Заведомые страницы: замок пропускает хорошую и ловит каждый брак.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'media-proba-'));
  const m = path.join(tmp, 'muzei/proba');
  fs.mkdirSync(path.join(m, 'video'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'video'), { recursive: true });
  // CBR 128 кбит/с, 44,1 кГц, стерео: кадр 417 байт = 1152/44100 с.
  const kadr = Buffer.alloc(417); kadr.set([0xff, 0xfb, 0x90, 0x44]);
  const mp3 = (sek) => Buffer.concat(Array(Math.ceil(sek * 44100 / 1152)).fill(kadr));
  fs.writeFileSync(path.join(m, 'gid.mp3'), mp3(60));
  fs.writeFileSync(path.join(m, 'korotkiy.mp3'), mp3(10));
  fs.writeFileSync(path.join(m, 'pustoy.mp3'), '');
  const mvhd = Buffer.alloc(40); mvhd.write('mvhd', 4, 'latin1'); mvhd.writeUInt32BE(1000, 20); mvhd.writeUInt32BE(45000, 24);
  fs.writeFileSync(path.join(m, 'video/rolik.mp4'), mvhd);
  fs.writeFileSync(path.join(m, 'video/pustoy.mp4'), '');
  zapisatVypusk(tmp, 'proba/r', { horizontal: { local: 'muzei/proba/video/rolik.mp4' } });
  const ag = (src) => `<section class="block" id="audioguide"></section><script>window.MUSEUM_AUDIOGUIDE={\n  audioSrc:'${src}',\n};</script>`;
  const AG = ag('gid.mp3'), V = '<video controls><source src="video/rolik.mp4" type="video/mp4"></video>';
  const proba = [ // [имя, html, ждём красный аудиогид, ждём замечание по ролику]
    ['всё на месте', AG + V, 0, 0],
    ['ролик через реестр', AG + '<video data-rc-video="proba/r" data-rc-format="horizontal"><source src="video/x.mp4"></video>', 0, 0],
    ['гид — <audio data-guide-audio>, путь от корня', '<audio controls data-guide-audio data-src="/muzei/proba/gid.mp3"></audio>' + V, 0, 0],
    ['нет аудиогида', V, 1, 0],
    ['блок гида без файла', '<section id="audioguide"></section>' + V, 1, 0],
    ['нет файла гида', ag('net.mp3') + V, 1, 0],
    ['пустой mp3', ag('pustoy.mp3') + V, 1, 0],
    ['гид 10 с', ag('korotkiy.mp3') + V, 1, 0],
    ['звук фильма — не гид', '<audio data-film-audio data-src="gid.mp3"></audio>' + V, 1, 0],
    ['гид только в игре', '<section id="games"><audio data-guide-audio data-src="gid.mp3"></audio></section>' + V, 1, 0],
    ['нет ролика', AG, 0, 1],
    ['заглушка ролика', AG + '<section class="block" id="video"><div>Видео создаётся</div></section>', 0, 1],
    ['нет файла ролика', AG + '<video><source src="video/net.mp4"></video>', 0, 1],
    ['пустой mp4', AG + '<video src="video/pustoy.mp4"></video>', 0, 1],
    ['выпуска нет в реестре', AG + '<video data-rc-video="proba/net"></video>', 0, 1],
    ['ролик только в игре', AG + '<div id="game-1"><video src="video/rolik.mp4"></video></div>', 0, 1],
    ['ролик в своей секции после игры', AG + '<section id="games"><section>и</section></section><section id="video"><video src="video/rolik.mp4"></video></section>', 0, 0],
  ];
  let mimo = 0;
  for (const [imya, html, zhduAg, zhduR] of proba) {
    const r = proverit(html, 'proba', tmp);
    const ok = (r.ag.length > 0 ? 1 : 0) === zhduAg && (r.rolik.length > 0 ? 1 : 0) === zhduR;
    if (!ok) mimo++;
    console.log(`${ok ? 'ок ' : 'МИМО'} ${imya}: ${[...r.ag, ...r.rolik].join('; ') || `чисто (гид ${Math.round(r.agSek)} с, ролик ${r.rolikSek} с)`}`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  if (mimo) { console.log(`::error::media-dnya: проба мимо — ${mimo} из ${proba.length}`); process.exit(1); }
  console.log(`media-dnya: проба ${proba.length} из ${proba.length}`);
  process.exit(0);
}

const den = (muzey, key) => ({ muzey, key });
let dni;
if (est('--vse')) {
  const muzei = arg('--muzei', '') ? arg('--muzei').split(',') : fs.readdirSync(FULL);
  dni = muzei.flatMap((m) => fs.readdirSync(path.join(FULL, m)).filter((f) => /^\d\d-\d\d\.html$/.test(f)).sort()
    .map((f) => den(m, f.slice(0, 5))));
} else {
  const baza = arg('--baza', process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/main');
  let izm;
  try {
    izm = execFileSync('git', ['diff', '--name-only', '--diff-filter=AMR', `${baza}...HEAD`, '--', FULL, DAYS], { encoding: 'utf8' })
      .split('\n').filter(Boolean);
  } catch {
    console.log(`::error::media-dnya: нет базы ${baza} — изменённые дни не определить`);
    process.exit(1);
  }
  const vse = new Map();
  for (const f of izm) {
    const m = /^src\/(?:data\/full-pages|content\/days)\/([\w-]+)\/(\d\d-\d\d)\.(html|json)$/.exec(f);
    if (!m || !fs.existsSync(path.join(FULL, m[1], `${m[2]}.html`))) continue;
    vse.set(`${m[1]}/${m[2]}`, den(m[1], m[2]));
  }
  dni = [...vse.values()];
  if (!dni.length) { console.log('media-dnya: в заявке нет изменённых страниц дней — проверять нечего'); process.exit(0); }
}

const itog = dni.map((d) => ({ ...d, ...proverit(fs.readFileSync(path.join(FULL, d.muzey, `${d.key}.html`), 'utf8'), d.muzey, 'public') }));
const tekst = otchet(itog, 'Аудиогид и ролик дня (Р232)');
console.log(tekst);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, tekst + '\n');
if (est('--vse')) process.exit(0);
for (const r of itog) {
  if (r.ag.length) console.log(`::error::День ${r.muzey} ${r.key}: аудиогид — ${r.ag.join('; ')}`);
}
const krasnyy = itog.some((r) => r.ag.length);
process.exit(krasnyy ? 1 : 0);
}
