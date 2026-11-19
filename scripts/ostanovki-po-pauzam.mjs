// Метки остановок аудиогида — по самому mp3 (Р830/Р831: на 02-14…02-28 «Не сдаются» метки стояли сеткой через 22 с,
// часть — дальше конца файла). Границы абзацев — самые длинные паузы (ffmpeg silencedetect), их столько, сколько
// остановок минус одна; t — конец паузы. Сверка: доля времени до остановки ≈ доля слов транскрипта до абзаца
// (расхождение больше 0,1 — день не трогается, строка «не сходится»). Конвейер (scripts/ns-konveyer.mjs) берёт метки
// из облачного замера; этот скрипт — для дней, где гид уже лежит, а замера нет.
// Запуск: node scripts/ostanovki-po-pauzam.mjs --muzey ne-sdayutsya ММ-ДД … [--zapisat]
// mp3 — из public/, а в лёгкой копии без public — из origin/main (git show). Откат — git checkout дней.
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { failPublic } from '../src/lib/den-obshchee.mjs';
import { mp3Sek } from '../src/lib/mp3-sek.mjs';

const argi = process.argv.slice(2), muzey = argi[argi.indexOf('--muzey') + 1], zapisat = argi.includes('--zapisat');
const dni = argi.filter((x, i) => /^\d\d-\d\d$/.test(x) && argi[i - 1] !== '--muzey');
const mmss = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
let plokho = 0;
for (const den of dni) {
  const put = `src/content/dni-shablon/${muzey}/${den}.yaml`;
  const ag = YAML.parse(fs.readFileSync(put, 'utf8')).audioguide, f = failPublic(muzey, ag.audioSrc);
  const buf = fs.existsSync(f) ? fs.readFileSync(f) : execFileSync('git', ['show', `origin/main:${f}`], { maxBuffer: 1 << 28 });
  const tmp = `/tmp/ostanovki-${muzey}-${den}.mp3`;
  fs.writeFileSync(tmp, buf);
  const log = spawnSync('ffmpeg', ['-nostdin', '-hide_banner', '-i', tmp, '-af', 'silencedetect=n=-35dB:d=0.45', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  fs.rmSync(tmp);
  const pauzy = [...log.matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)].map((m) => ({ konec: +m[1], dl: +m[2] }));
  const n = ag.stops.length, vse = mp3Sek(buf);
  const granicy = pauzy.filter((p) => p.konec < vse - 1).sort((a, b) => b.dl - a.dl).slice(0, n - 1).map((p) => p.konec).sort((a, b) => a - b);
  const slova = ag.transcript.map((t) => t.split(/\s+/).length), S = slova.reduce((a, b) => a + b, 0);
  let c = 0;
  const doli = slova.map((w) => { const r = c / S; c += w; return r; });
  const t = [0, ...granicy].map(Math.round);
  const raskhod = Math.max(...t.map((x, i) => Math.abs(x / vse - (doli[i] ?? 1))));
  const ok = granicy.length === n - 1 && ag.transcript.length === n && raskhod <= 0.1;
  console.log(`${muzey}/${den}: ${Math.round(vse)} с, было ${ag.stops.map((s) => s.mark).join(' ')} → ${t.map(mmss).join(' ')}, расхождение с текстом ${raskhod.toFixed(2)}${ok ? '' : ' — не сходится, не трогаю'}`);
  if (!ok) { plokho++; continue; }
  if (zapisat) {
    // правка текстом — только строки t/mark внутри audioguide.stops, остальная вёрстка файла не трогается
    // отступ списка в файлах разный («  - t:» и «    - t:») — берём его из первой строки после stops:
    const stroki = fs.readFileSync(put, 'utf8').split('\n'), nach = stroki.indexOf('  stops:');
    const ots = (stroki[nach + 1] || '').match(/^ */)[0];
    let i = -1;
    for (let k = nach + 1; k < stroki.length && stroki[k].startsWith(ots) && /^[- ] /.test(stroki[k].slice(ots.length)); k++) {
      if (stroki[k].startsWith(`${ots}- t: `)) stroki[k] = `${ots}- t: ${t[++i]}`;
      else if (stroki[k].startsWith(`${ots}  mark: `)) stroki[k] = `${ots}  mark: '${mmss(t[i])}'`;
    }
    if (i !== n - 1) { console.log(`  ${den}: остановок в тексте ${i + 1}, а не ${n} — не записано`); plokho++; continue; }
    fs.writeFileSync(put, stroki.join('\n'));
  }
}
process.exit(plokho ? 1 : 0);
