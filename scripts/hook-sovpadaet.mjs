// Замок «хук дня один» (Р563, 06.11.2026): хук карточки src/content/days/<музей>/<ДД-ММ>.json (календарь, главная)
// совпадает с lead.hook страницы src/content/dni-shablon/<музей>/<ДД-ММ>.yaml. Брак 06.11: у 5 дней изобретений
// (01-03, 01-15, 01-20, 01-22, 01-26) в карточке остался старый хук, а smoke ловил это только после выкладки
// и только на днях заявки. Проверяются все дни, где есть обе записи. Сравнение — по той же мерке, что smoke
// (без тегов, регистра, ё/е и знаков). Нарушение — код 1 и ::error::. Откат — удалить вызов из package.json (build).
// Запуск: node scripts/hook-sovpadaet.mjs [--proba]
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export const norm = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ')
  .toLowerCase().replace(/ё/g, 'е').replace(/[^0-9a-zа-я]+/g, ' ').trim();

if (process.argv.includes('--proba')) {
  const ok = norm('Лунин <i>первым</i> в мире — ёж!') === norm('лунин первым в мире еж');
  const raz = norm('Один хук.') !== norm('Другой хук.');
  if (!ok || !raz) { console.log('::error::hook-sovpadaet: проба не прошла'); process.exit(1); }
  console.log('hook-sovpadaet: проба прошла');
  process.exit(0);
}

const KOREN = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SHABLON = path.join(KOREN, 'src/content/dni-shablon');
let vsego = 0, bad = 0;
for (const muzej of fs.readdirSync(SHABLON)) {
  const papka = path.join(SHABLON, muzej);
  if (!fs.statSync(papka).isDirectory()) continue;
  for (const f of fs.readdirSync(papka).filter((x) => /^\d\d-\d\d\.ya?ml$/.test(x))) {
    const den = f.slice(0, 5);
    const kart = path.join(KOREN, 'src/content/days', muzej, `${den}.json`);
    if (!fs.existsSync(kart)) continue;
    const stranica = YAML.parse(fs.readFileSync(path.join(papka, f), 'utf8'))?.lead?.hook;
    const kartochka = JSON.parse(fs.readFileSync(kart, 'utf8')).hook;
    if (!stranica || !kartochka) continue;
    vsego++;
    if (norm(stranica) !== norm(kartochka)) {
      bad++;
      console.log(`::error file=src/content/days/${muzej}/${den}.json::хук карточки не совпадает со страницей ${muzej}/${den}: карточка «${kartochka}», страница «${stranica}»`);
    }
  }
}
console.log(`hook-sovpadaet: дней с карточкой и страницей ${vsego}, расхождений ${bad}`);
process.exit(bad ? 1 : 0);
