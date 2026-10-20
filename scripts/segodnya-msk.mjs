// Сторож «сегодня — по Москве» (B11, 19.10.2026). Брак: home/Today.astro брал местную дату браузера,
// portal/Segodnya.astro — московскую; у посетителя в другом поясе главная музея показывала не тот день,
// что главная портала. Проверка: встроенные скрипты обоих блоков исполняются в node:vm при подменённом
// «сейчас» в трёх поясах (Лос-Анджелес, Москва, Владивосток) и в моменты, когда в Москве дата уже/ещё другая.
// Ключ дня обоих блоков обязан совпасть с московским. Плюс запрет getDate()/getMonth() на «сегодня»
// во встроенных скриптах src/components и src/pages. Код 1 при браке. Без сборки и браузера.
// Запуск: node scripts/segodnya-msk.mjs
// 20.10.2026: заглушка DOM отвечала '1' на любой getAttribute; после Г20 (data-stroki — JSON строк)
// Today.astro выходил на `if (!S.mon) return` и давал Today=null — ложный брак 12 из 12. Теперь заглушка
// отдаёт атрибуты по имени, Today проверяется в обоих режимах data-dated, плюс подпись дня (текст «Сегодня»).
// Пути блоков можно подменить (SEGODNYA_TODAY / SEGODNYA_PORTAL) — так работает самотест
// scripts/segodnya-msk.test.mjs: верный блок → 0, блок с местной датой → брак.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TODAY = process.env.SEGODNYA_TODAY || 'src/components/home/Today.astro';
const PORTAL = process.env.SEGODNYA_PORTAL || 'src/components/portal/Segodnya.astro';
const inline = (rel) => {
  const s = fs.readFileSync(path.resolve(ROOT, rel), 'utf8');
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
  // Атрибуты блока — по имени, как в разметке: data-stroki (JSON строк), data-dated ('0'/'1').
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const STROKI = JSON.stringify({ mon: MON, monR: MON, den: '{d} {m}', seg: 'Сегодня, ', bliz: 'Ближайший день: ' });
  for (const dated of ['0', '1']) {
    const C = {};
    for (let m = 1; m <= 12; m++) for (let d = 1; d <= 31; d++) {
      const k = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; C[k] = { t: k, d: k, href: k };
    }
    let href = null; const nodes = {};
    const node = () => ({ textContent: '', setAttribute: (n, v) => { if (n === 'href') href = v; } });
    const attrs = { 'data-stroki': STROKI, 'data-dated': dated };
    const box = { getAttribute: (n) => (n in attrs ? attrs[n] : null), querySelector: (s) => (nodes[s] ||= node()) };
    const ctx = { window: { MUSEUM_CALENDAR: C }, document: { querySelector: () => box }, Date: FakeDate, Intl, Object, JSON };
    vm.runInNewContext(inline(TODAY), ctx);
    const when = nodes['[data-today-when]']?.textContent || '';
    // Ключ дня берём из href; подпись обязана быть «Сегодня, <д> <месяц>» того же дня.
    const want = href && `Сегодня, ${+href.slice(3)} ${MON[+href.slice(0, 2) - 1]}`;
    out['today' + dated] = href && when === want ? href : `${href} «${when}»`;
  }
  out.today = out.today0 === out.today1 ? out.today0 : `${out.today0}|${out.today1}`;
  // portal/Segodnya.astro: при расхождении с data-key скрипт запрашивает segodnya/<ключ>.json.
  {
    let url = null;
    const el = { style: {}, offsetHeight: 0, classList: { add() {}, remove() {} } };
    const box = { getAttribute: (n) => (n === 'data-key' ? 'xx-xx' : '/'), querySelector: () => el, classList: el.classList };
    const fetch = (u) => { url = u; return new Promise(() => {}); };
    const ctx = { window: { fetch }, fetch, document: { getElementById: () => box }, Date: FakeDate, Intl };
    vm.runInNewContext(inline(PORTAL), ctx);
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

// Запрет местной даты во встроенных скриптах .astro (только боевое дерево; самотест его выключает).
if (!process.env.SEGODNYA_BEZ_ZAPRETA) {
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of ['src/components', 'src/pages'].flatMap((d) => walk(path.join(ROOT, d))).filter((f) => f.endsWith('.astro'))) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
    if (/\.get(Date|Month)\(\)/.test(m[1]) && !/Europe\/Moscow/.test(m[1])) {
      console.log(`БРАК ${path.relative(ROOT, f)}: getDate()/getMonth() без Europe/Moscow во встроенном скрипте`); brak++;
    }
  }
}
}
console.log(brak ? `segodnya-msk: брак ${brak}` : 'segodnya-msk: все блоки берут московскую дату');
process.exit(brak ? 1 : 0);
