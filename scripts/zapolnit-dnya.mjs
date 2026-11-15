#!/usr/bin/env node
// Машина заполняет то, что вписывали руками (Р784, 15.11.2026): node scripts/zapolnit-dnya.mjs <музей> <ММ-ДД>
// Новых проверок нет — дописывает карточку src/content/dni-shablon/<музей>/ММ-ДД.yaml, проверяют её те же сборка
// и tools/proverka-dnya.mjs. Зовёт её и заготовка дня (scripts/zagotovka-dnya.mjs) в конце.
//   1. width/height картинок (обложка, кадры, kadr фактов и истории) — размером самого файла в public/: так же меряет
//      сборка (src/lib/kartinki-fajly.mjs, sharp, поворот EXIF). Расходится с файлом — переписывает; нет поля — не
//      трогает (обложке размеры добавляет сборка). Нет файла — пропуск с предупреждением. Брак: brak-stranic п. 2.
//   2. data_staryj_stil у события до 1918-02-14 — из data_sobytiya (григорианская → юлианская через юлианский день,
//      как в календарных таблицах: 10 дней в XVII в., 11 — с 1700-03-11, 12 — с 1800-03-12, 13 — с 1900-03-13).
//      Только если поле пустое. Если текст дня сам называет дату «по старому стилю» и она не совпала с расчётом —
//      не пишет, а показывает (значит, в data_sobytiya, может быть, старый стиль). Брак: brak-stranic п. 34.
// Файл меняется строками на месте: остальное в карточке не переписывается.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { opisat, kartinkiKartochki } from '../src/lib/kartinki-fajly.mjs';

const NOVYJ_STIL = '1918-02-14'; // как в src/lib/standart-dnya.mjs
const MESYACY = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const dd = (n, w = 2) => String(n).padStart(w, '0');

// Файл в public по адресу со страницы — как failPublic в src/lib/den-obshchee.mjs (тот модуль при загрузке меряет все дни).
const failPublic = (muzei, src) => {
  const u = String(src).split(/[?#]/)[0];
  return path.posix.join('public', u.startsWith('/') ? path.posix.normalize(u) : path.posix.join(`/muzei/${muzei}/`, u));
};

/** Григорианская дата «ГГГГ-ММ-ДД» → та же дата по юлианскому календарю (старому стилю). */
export function staryjStil(data) {
  const [Y, M, D] = data.split('-').map(Number);
  const a = Math.floor((14 - M) / 12), y = Y + 4800 - a, m = M + 12 * a - 3;
  const jd = D + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const c = jd + 32082, d = Math.floor((4 * c + 3) / 1461), e = c - Math.floor((1461 * d) / 4), mm = Math.floor((5 * e + 2) / 153);
  const den = e - Math.floor((153 * mm + 2) / 5) + 1, mes = mm + 3 - 12 * Math.floor(mm / 10), god = d - 4800 + Math.floor(mm / 10);
  return `${dd(god, 4)}-${dd(mes)}-${dd(den)}`;
}

// Даты, которые текст дня прямо называет по старому стилю: «14 мая 1888 года (по старому стилю)», «(8 января по старому стилю)».
function yavnyeStarye(yamlTekst, godPoUmolch) {
  const out = new Set();
  const re = new RegExp(`(\\d{1,2})\\s+(${MESYACY.join('|')})(?:\\s+(\\d{3,4}))?(?:\\s+года)?[^.;\\n]{0,12}?(?:по старому стилю|ст\\.\\s?ст\\.|старого стиля)`, 'gi');
  const re2 = new RegExp(`(?:по старому стилю|ст\\.\\s?ст\\.)\\s*[—–-]?\\s*(\\d{1,2})\\s+(${MESYACY.join('|')})(?:\\s+(\\d{3,4}))?`, 'gi');
  for (const r of [re, re2]) for (const m of yamlTekst.matchAll(r))
    out.add(`${dd(m[3] ? +m[3] : godPoUmolch, 4)}-${dd(MESYACY.indexOf(m[2].toLowerCase()) + 1)}-${dd(+m[1])}`);
  return [...out];
}

// Строки width/height того же объекта, что строка «src: <адрес>» (тот же отступ ключей, до конца объекта).
function zamenitRazmery(stroki, src, w, h) {
  let izm = 0;
  for (let i = 0; i < stroki.length; i++) {
    const m = /^(\s*)(- )?src:\s*['"]?([^'"\s#]+)/.exec(stroki[i]);
    if (!m || m[3] !== src) continue;
    const otstup = m[1].length + (m[2] ? 2 : 0);
    const zameny = { width: w, height: h };
    // Назад (ключи до src) и вперёд — пока отступ не меньше отступа ключей объекта.
    for (const shag of [-1, 1]) {
      for (let j = i + shag; j >= 0 && j < stroki.length; j += shag) {
        const s = stroki[j];
        if (!s.trim()) continue;
        const ots = s.length - s.trimStart().length;
        const elem = /^\s*- /.test(s);
        if (ots < otstup || (ots === otstup - 2 && elem)) break;
        if (ots !== otstup) continue;
        const k = /^(\s*)(width|height):\s*(\d+)\s*$/.exec(s);
        if (k && +k[3] !== zameny[k[2]]) { stroki[j] = `${k[1]}${k[2]}: ${zameny[k[2]]}`; izm++; }
      }
    }
  }
  return izm;
}

export async function zapolnitDen(muzei, den) {
  const file = `src/content/dni-shablon/${muzei}/${den}.yaml`;
  if (!fs.existsSync(file)) { console.log(`zapolnit-dnya: нет ${file} — заполнять нечего`); return { razmery: 0, staryj: '' }; }
  let tekst = fs.readFileSync(file, 'utf8');
  const k = YAML.parse(tekst) ?? {};
  const stroki = tekst.split('\n');

  // 1. Размеры картинок.
  let razmery = 0;
  const videl = new Set();
  for (const [o] of kartinkiKartochki(k)) {
    if (typeof o.src !== 'string' || /^https?:/i.test(o.src) || videl.has(o.src)) continue;
    videl.add(o.src);
    if (o.width == null && o.height == null) continue;
    const f = failPublic(muzei, o.src);
    const mera = fs.existsSync(f) ? await opisat(f) : null;
    if (!mera?.width) { console.warn(`zapolnit-dnya: ${o.src} — нет файла ${f}, размеры не сверены`); continue; }
    if (o.width === mera.width && o.height === mera.height) continue;
    const n = zamenitRazmery(stroki, o.src, mera.width, mera.height);
    if (n) { razmery++; console.log(`размер: ${o.src} — было ${o.width}×${o.height}, стало ${mera.width}×${mera.height}`); }
  }

  // 2. Старый стиль.
  let staryj = '';
  const ds = k.data_sobytiya == null ? '' : String(k.data_sobytiya);
  const pusto = k.data_staryj_stil == null || String(k.data_staryj_stil).trim() === '';
  if (/^\d{3,4}-\d\d-\d\d$/.test(ds) && ds.padStart(10, '0') < NOVYJ_STIL && pusto) {
    const raschet = staryjStil(ds);
    const yavnye = yavnyeStarye(tekst, +raschet.slice(0, 4));
    if (yavnye.length && !yavnye.includes(raschet.padStart(10, '0'))) {
      console.warn(`старый стиль: не пишу — по расчёту из data_sobytiya ${ds} выходит ${raschet}, а текст дня называет по старому стилю ${yavnye.join(', ')}; сверь data_sobytiya (она по новому стилю)`);
    } else {
      staryj = raschet;
      const i = stroki.findIndex((s) => /^data_staryj_stil:/.test(s));
      const stroka = `data_staryj_stil: '${raschet}'`;
      if (i >= 0) stroki[i] = stroka;
      else stroki.splice(stroki.findIndex((s) => /^data_sobytiya:/.test(s)) + 1, 0, stroka);
      console.log(`старый стиль: data_sobytiya ${ds} → data_staryj_stil ${raschet}${yavnye.length ? ' (совпало с датой в тексте дня)' : ''}`);
    }
  }

  const novyj = stroki.join('\n');
  if (novyj !== tekst) {
    YAML.parse(novyj); // карточка осталась YAML
    fs.writeFileSync(file, novyj);
  }
  console.log(`zapolnit-dnya ${muzei}/${den}: размеров переписано ${razmery}, старый стиль ${staryj || 'не нужен или уже есть'}`);
  return { razmery, staryj };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [muzei, den] = process.argv.slice(2);
  if (!muzei || !/^\d\d-\d\d$/.test(den || '')) {
    console.error('node scripts/zapolnit-dnya.mjs <музей> <ММ-ДД>');
    process.exit(2);
  }
  await zapolnitDen(muzei, den);
}
