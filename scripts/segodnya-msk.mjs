// Сторож «сегодня — по Москве» (B11, 19.10.2026). Брак: home/Today.astro брал местную дату браузера,
// portal/Segodnya.astro — московскую; у посетителя в другом поясе главная музея показывала не тот день,
// что главная портала. Проверка: встроенные скрипты обоих блоков исполняются в node:vm при подменённом
// «сейчас» в трёх поясах (Лос-Анджелес, Москва, Владивосток) и в моменты, когда в Москве дата уже/ещё другая.
// Ключ дня обоих блоков обязан совпасть с московским. Плюс запрет getDate()/getMonth() на «сегодня»
// во встроенных скриптах src/components и src/pages. Код 1 при браке. Без сборки и браузера.
// Запуск: node scripts/segodnya-msk.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inline = (rel) => {
  const s = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const m = s.match(/<script is:inline>([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`нет встроенного скрипта в ${rel}`);
  return m[1];
};

// Моменты (UTC): Москва = UTC+3 круглый год.
const MOMENTS = [
  '2026-10-19T22:30:00Z', // Москва 20.10 01:30; Лос-Анджелес 19.10; Владивосток 20.10
  '2026-10-19T15:30:00Z', // Москва 19.10 18:30; Владивосток уже 20.10
  '2026-12-31T21:15:00Z', // Москва 01.01 00:15; Лос-Анджелес 31.12
  '2026-03-01T20:59:00Z', // Москва 01.03 23:59; Владивосток 02.03
];
const ZONES = ['America/Los_Angeles', 'Europe/Moscow', 'Asia/Vladivostok'];

if (process.argv[2] === '--child') {
  // Дочерний процесс: TZ уже выставлен, подменяем Date.now/new Date() на заданный момент.
  const at = Date.parse(process.argv[3]);
  const RealDate = Date;
  class FakeDate extends RealDate { constructor(...a) { super(...(a.length ? a : [at])); } static now() { return at; } }
  const out = {};
  // home/Today.astro: календарь с каждым днём года, ключ дня = href выбранного дня.
  {
    const C = {};
    for (let m = 1; m <= 12; m++) for (let d = 1; d <= 31; d++) {
      const k = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; C[k] = { t: k, d: k, href: k };
    }
    let href = null; const node = () => ({ textContent: '', setAttribute: (n, v) => { if (n === 'href') href = v; } });
    const nodes = {};
    const box = { getAttribute: () => '1', querySelector: (s) => (nodes[s] ||= node()) };
    const ctx = { window: { MUSEUM_CALENDAR: C }, document: { querySelector: () => box }, Date: FakeDate, Intl, Object };
    vm.runInNewContext(inline('src/components/home/Today.astro'), ctx);
    out.today = href;
  }
  // portal/Segodnya.astro: при расхождении с data-key скрипт запрашивает segodnya/<ключ>.json.
  {
    let url = null;
    const el = { style: {}, offsetHeight: 0, classList: { add() {}, remove() {} } };
    const box = { getAttribute: (n) => (n === 'data-key' ? 'xx-xx' : '/'), querySelector: () => el, classList: el.classList };
    const fetch = (u) => { url = u; return new Promise(() => {}); };
    const ctx = { window: { fetch }, fetch, document: { getElementById: () => box }, Date: FakeDate, Intl };
    vm.runInNewContext(inline('src/components/portal/Segodnya.astro'), ctx);
    out.segodnya = url && url.match(/segodnya\/(\d\d-\d\d)\.json$/)?.[1];
  }
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
}

let brak = 0;
for (const at of MOMENTS) {
  const msk = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date(at)).map((x) => [x.type, x.value]));
  const want = `${msk.month}-${msk.day}`;
  for (const tz of ZONES) {
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--child', at], { env: { ...process.env, TZ: tz }, encoding: 'utf8' });
    if (r.status !== 0) { console.log(`БРАК ${tz} ${at}: ${r.stderr.trim()}`); brak++; continue; }
    const got = JSON.parse(r.stdout);
    const ok = got.today === want && got.segodnya === want;
    if (!ok) brak++;
    console.log(`${ok ? 'ок  ' : 'БРАК'} ${tz.padEnd(20)} ${at}  Москва ${want}  Today ${got.today}  Segodnya ${got.segodnya}`);
  }
}

// Запрет местной даты во встроенных скриптах .astro.
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of ['src/components', 'src/pages'].flatMap((d) => walk(path.join(ROOT, d))).filter((f) => f.endsWith('.astro'))) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
    if (/\.get(Date|Month)\(\)/.test(m[1]) && !/Europe\/Moscow/.test(m[1])) {
      console.log(`БРАК ${path.relative(ROOT, f)}: getDate()/getMonth() без Europe/Moscow во встроенном скрипте`); brak++;
    }
  }
}
console.log(brak ? `segodnya-msk: брак ${brak}` : 'segodnya-msk: все блоки берут московскую дату');
process.exit(brak ? 1 : 0);
