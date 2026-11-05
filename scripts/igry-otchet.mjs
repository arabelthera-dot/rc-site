// Отчёт «день, начали, доиграли, доля» (Р286 п.3) для Джарвиса: node scripts/igry-otchet.mjs [музей] [--igry]
// Берёт сводку https://russian-civilization.ru/schet/igry.json (пишет крон на msk-new, deploy/schet-igr/svod.py).
// --igry — строка на каждую игру дня, иначе игры дня складываются. RC_IGRY_URL — другой адрес сводки (или путь к файлу).
import fs from 'node:fs';
const args = process.argv.slice(2), poIgram = args.includes('--igry'), muzey = args.find((a) => !a.startsWith('--'));
const url = process.env.RC_IGRY_URL || 'https://russian-civilization.ru/schet/igry.json';
const svod = /^https?:/.test(url) ? await (await fetch(url, { cache: 'no-store' })).json() : JSON.parse(fs.readFileSync(url, 'utf8'));
const sum = new Map();
for (const r of svod.stroki) {
  if (muzey && r.muzey !== muzey) continue;
  const k = poIgram ? `${r.muzey} ${r.den} ${r.igra}` : `${r.muzey} ${r.den}`;
  const s = sum.get(k) ?? sum.set(k, { nachal: 0, vyigral: 0, proigral: 0 }).get(k);
  for (const e of ['nachal', 'vyigral', 'proigral']) s[e] += r[e];
}
const dolya = (a, b) => (b ? `${Math.round((a / b) * 100)} %` : '—');
console.log(`Сводка на ${svod.obnovleno}\n`);
console.log(['день', 'начали', 'доиграли', 'доля', 'выиграли', 'проиграли'].join('\t'));
for (const [k, s] of [...sum].sort()) {
  const doigrali = s.vyigral + s.proigral;
  console.log([k, s.nachal, doigrali, dolya(doigrali, s.nachal), s.vyigral, s.proigral].join('\t'));
}
