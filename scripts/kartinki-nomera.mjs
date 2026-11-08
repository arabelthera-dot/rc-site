// Перевод путей картинок в карточках дней на постоянные номера (Р649, очередь 222/258; разворот — src/lib/kartinki.mjs).
//   node scripts/kartinki-nomera.mjs --dni izobreteniya/01-06,ne-sdayutsya/01-06   — только эти дни (проба)
//   node scripts/kartinki-nomera.mjs --vse                                         — все дни всех музеев
// Правится только значение поля src/poster в своей строке (путь → kartinka:NNNNNN), остальное в файле не трогается.
// Повторный запуск безопасен: номер уже стоит — строка пропускается; путь уже в реестре — берётся его номер.
// Файла картинки нет в public/ (по git) — путь остаётся как был и попадает в отчёт.
// Источник и права в реестр — из соседних полей той же картинки (data_source/license, credit «Источник: … Права: …»).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { REESTR, NOMER } from '../src/lib/kartinki.mjs';

const PAPKI = { 'src/content/days': { ext: '.json', klyuchi: ['src'] }, 'src/content/dni-shablon': { ext: '.yaml', klyuchi: ['src', 'poster'] } };
const KARTINKA = /\.(jpe?g|png|webp|svg|avif|gif)$/i;
const STROKA = /^(\s*-?\s*"?)(src|poster)("?\s*:\s*)(["']?)([^"'\s]+?)\4(,?)\s*$/;

const arg = process.argv.slice(2);
const dni = arg.includes('--vse') ? null : new Set((arg[arg.indexOf('--dni') + 1] ?? '').split(',').filter(Boolean));
if (!arg.includes('--vse') && !dni.size) { console.error('нужно --vse или --dni музей/ММ-ДД,…'); process.exit(2); }

const pub = new Set(execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', 'public/'], { encoding: 'utf8', maxBuffer: 64 << 20 })
  .split('\n').filter(Boolean).map((f) => f.slice('public/'.length)));
const r = fs.existsSync(REESTR) ? JSON.parse(fs.readFileSync(REESTR, 'utf8')) : { kartinki: {} };
const poPuti = new Map(Object.entries(r.kartinki).map(([n, k]) => [k.put, n]));
let sled = Math.max(0, ...Object.keys(r.kartinki).map(Number)) + 1;

// Сведения рядом с картинкой: объект, где лежит этот путь.
function svedeniya(dannye, znachenie) {
  let nashel = {};
  const obhod = (x) => {
    if (Array.isArray(x)) return x.forEach(obhod);
    if (!x || typeof x !== 'object') return;
    if ([x.src, x.poster].includes(znachenie) && !nashel.istochnik) {
      const cr = String(x.credit ?? '');
      nashel = { istochnik: x.data_source ?? /Источник:[^]*?(https?:\/\/\S+?)\.?(?=\s|$)/.exec(cr)?.[1] ?? '',
        licenziya: x.license ?? /Права:\s*([^]*?)\.?$/.exec(cr)?.[1] ?? '' };
    }
    Object.values(x).forEach(obhod);
  };
  obhod(dannye);
  return nashel;
}

const itog = { strok: 0, perevedeno: 0, uzhe: 0, netFajla: [], fajlov: 0 };
for (const [papka, { ext, klyuchi }] of Object.entries(PAPKI)) {
  for (const muzei of fs.readdirSync(papka).sort()) {
    for (const f of fs.readdirSync(path.join(papka, muzei)).filter((f) => f.endsWith(ext)).sort()) {
      if (dni && !dni.has(`${muzei}/${f.slice(0, -ext.length)}`)) continue;
      const file = path.join(papka, muzei, f);
      const t = fs.readFileSync(file, 'utf8');
      const dannye = ext === '.json' ? JSON.parse(t) : YAML.parse(t);
      let izm = 0;
      const novyy = t.split('\n').map((line, i) => {
        const m = STROKA.exec(line);
        if (!m || !klyuchi.includes(m[2])) return line;
        const [znach, zapros = ''] = m[5].split(/(?=\?)/);
        if (NOMER.test(m[5])) { itog.strok++; itog.uzhe++; return line; }
        if (!KARTINKA.test(znach) || /^https?:/.test(znach)) return line;
        itog.strok++;
        // days: «muzei/…» от public/; dni-shablon: «/muzei/…» или относительно <base href="/muzei/<музей>/">.
        const put = /^\/|^muzei\//.test(znach) ? znach.replace(/^\//, '') : `muzei/${muzei}/${znach}`;
        if (!pub.has(put)) { itog.netFajla.push(`${file}:${i + 1}: ${znach}`); return line; }
        let n = poPuti.get(put);
        if (!n) {
          n = String(sled++).padStart(6, '0');
          poPuti.set(put, n);
          r.kartinki[n] = { put, ...svedeniya(dannye, m[5]) };
        } else if (!r.kartinki[n].istochnik) Object.assign(r.kartinki[n], { put, ...svedeniya(dannye, m[5]) });
        izm++; itog.perevedeno++;
        return line.replace(m[5], `kartinka:${n}${zapros}`);
      }).join('\n');
      if (izm) { fs.writeFileSync(file, novyy); itog.fajlov++; }
    }
  }
}
r.kartinki = Object.fromEntries(Object.entries(r.kartinki).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(REESTR, JSON.stringify({
  _o: 'Реестр картинок: постоянный номер → путь от public/ (+ источник и права, если были рядом в карточке). Разворот — src/lib/kartinki.mjs.',
  kartinki: r.kartinki }, null, 1) + '\n');
console.log(`ссылок на картинки: ${itog.strok}; переведено сейчас: ${itog.perevedeno}; уже были номером: ${itog.uzhe}; файлов изменено: ${itog.fajlov}; номеров в реестре: ${Object.keys(r.kartinki).length}`);
if (itog.netFajla.length) console.log(`нет файла в public/ — оставлено путём (${itog.netFajla.length}):\n${itog.netFajla.join('\n')}`);
