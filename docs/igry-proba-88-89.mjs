// Проба Р662 (пункты 88, 89): схема поля igra принимает образец и отвергает образец без поля или с механикой не из списка.
// Образцы — docs/igry-obrazcy/<mehanika>.json (январь «Изобретений», 01-08 и 01-10); сами дни не трогаются.
// Запуск: node --experimental-strip-types docs/igry-proba-88-89.mjs
import fs from 'node:fs';
import path from 'node:path';
import { igraDannymi, MEHANIKI } from '../src/lib/igry-mehaniki.ts';

const vse = Object.keys(MEHANIKI);
console.log(`механик в закрытом списке: ${vse.length}; со схемой dannye и движком: ${vse.filter((k) => MEHANIKI[k].dannye && MEHANIKI[k].dvizhok).length}`);
let plokho = 0;
const proba = (imya, obrazec, zhdu) => {
  const r = igraDannymi.safeParse(obrazec);
  const ok = r.success === zhdu;
  if (!ok) plokho++;
  console.log(`${ok ? 'верно' : 'ОШИБКА'} | ${imya}: ${r.success ? 'принят' : 'отвергнут — ' + r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
};
for (const m of ['razbey-ldiny-po-prochnosti', 'tri-usloviya-ldoloma']) {
  const obrazec = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'igry-obrazcy', `${m}.json`), 'utf8'));
  proba(`${m} целиком`, obrazec, true);
  const bezPolya = structuredClone(obrazec);
  delete bezPolya.dannye.pobeda_ru; delete bezPolya.dannye.pobeda;
  proba(`${m} без dannye.pobeda`, bezPolya, false);
  proba(`${m} без zagolovok`, { ...obrazec, zagolovok: undefined }, false);
}
proba('механика не из списка', { mehanika: 'pridumal-sam', zagolovok: 'x', pravilo_ru: 'x', dannye: {} }, false);
proba('механика из списка, но без схемы', { mehanika: 'paket-stupeney', zagolovok: 'x', pravilo_ru: 'x', dannye: {} }, false);
process.exit(plokho ? 1 : 0);
