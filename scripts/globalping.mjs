// п.500 (Р745, 10.11.2026): открывается ли сайт из других стран — главная и одна страница дня
// через бесплатный открытый API Globalping (https://globalping.io/docs/api.globalping.io, без ключа — до 250 замеров в час).
// Откуда: Китай, Индия, Иран, Турция, ЕС, США. Пишет отчёт в Markdown (stdout и файл), выход 1 — если хоть откуда не открылось.
// Запуск: node scripts/globalping.mjs [--out globalping.md]   (раз в сутки — .github/workflows/globalping.yml)
import fs from 'node:fs';

const SAYT = 'russian-civilization.ru';
const API = 'https://api.globalping.io/v1/measurements';
const OTKUDA = [
  ['Китай', { country: 'CN' }], ['Индия', { country: 'IN' }], ['Иран', { country: 'IR' }],
  ['Турция', { country: 'TR' }], ['ЕС', { magic: 'EU' }], ['США', { country: 'US' }],
];

// главная и постоянная страница дня (готовый день первого музея)
const ADRESA = ['/', '/muzei/izobreteniya/den/01-01/'];
const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : null;
const pauza = (ms) => new Promise((r) => setTimeout(r, ms));

async function zamer(put) {
  const r = await fetch(API, {
    method: 'POST', headers: { 'content-type': 'application/json', 'user-agent': 'rc-site-globalping' },
    body: JSON.stringify({
      type: 'http', target: SAYT, inProgressUpdates: false,
      locations: OTKUDA.map(([, l]) => ({ ...l, limit: 1 })),
      measurementOptions: { protocol: 'HTTPS', request: { method: 'GET', path: put } },
    }),
  });
  if (!r.ok) throw new Error(`Globalping ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const { id } = await r.json();
  for (let i = 0; i < 30; i++) {
    await pauza(2000);
    const m = await (await fetch(`${API}/${id}`)).json();
    if (m.status !== 'in-progress') return m;
  }
  throw new Error(`Globalping ${id}: замер не закончился за минуту`);
}

const stroki = [`# Открываемость из других стран — ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`, ''];
let bed = 0;
for (const put of ADRESA) {
  const m = await zamer(put);
  stroki.push(`## https://${SAYT}${put}`, '', '| Откуда | Город | Ответ | Время, мс |', '|---|---|---|---|');
  const est = new Set();
  for (const r of m.results ?? []) {
    const p = r.probe ?? {};
    const kto = OTKUDA.find(([, l]) => l.country === p.country || (l.magic === 'EU' && p.continent === 'EU'))?.[0] ?? p.country;
    est.add(kto);
    const kod = r.result?.statusCode;
    const ok = r.result?.status === 'finished' && kod >= 200 && kod < 400;
    if (!ok) bed++;
    stroki.push(`| ${kto} | ${p.city ?? ''} (${p.country ?? ''}) | ${ok ? '✅' : '❌'} ${kod ?? r.result?.status ?? ''} | ${r.result?.timings?.total ?? ''} |`);
  }
  for (const [kto] of OTKUDA) if (!est.has(kto)) stroki.push(`| ${kto} | нет точки замера Globalping | — | — |`);
  stroki.push('');
}
stroki.push(bed ? `Не открылось: ${bed}.` : 'Открылось отовсюду.');
const txt = stroki.join('\n');
console.log(txt);
if (out) fs.writeFileSync(out, txt + '\n');
process.exit(bed ? 1 : 0);
