// Проба пунктов 76 и 164 (Р661, Р662). Запуск: node --experimental-strip-types docs/igry-proba-76-164.mjs
// 76: новая игра — только данные к готовой механике (dvizhok: true); механика без движка или своя — отказ.
// 164: все тексты игры уходят в файл переводов src/data/igry/stroki/<muzey>-<ММ-ДД>.json и возвращаются из него на язык.
import fs from 'node:fs';
import { igraDannymi } from '../src/lib/igry-mehaniki.ts';
import { vynutStroki, igraNaYazyke } from '../src/data/igry/stroki-igr.mjs';

const obrazec = JSON.parse(fs.readFileSync(new URL('./igry-obrazcy/razbey-ldiny-po-prochnosti.json', import.meta.url), 'utf8'));
const fayl = JSON.parse(fs.readFileSync(new URL('../src/data/igry/stroki/izobreteniya-01-08.json', import.meta.url), 'utf8'));
let verno = 0, vsego = 0;
const proba = (imya, ok) => { vsego++; if (ok) verno++; console.log(`${ok ? 'верно' : 'НЕВЕРНО'} — ${imya}`); };

proba('76: данные к готовой механике razbey-ldiny-po-prochnosti приняты', igraDannymi.safeParse(obrazec).success);
proba('76: январская механика без движка данными (lovi-signal-v-okno) — отказ', !igraDannymi.safeParse({ ...obrazec, mehanika: 'lovi-signal-v-okno' }).success);
proba('76: своя механика не из списка — отказ', !igraDannymi.safeParse({ ...obrazec, mehanika: 'moya-novaya-igra' }).success);

const ru = vynutStroki(obrazec, 'izobreteniya', '01-08');
proba(`164: в файле переводов ровно все тексты игры (${Object.keys(ru).length})`, JSON.stringify(ru) === JSON.stringify(fayl.ru));
proba('164: технические строки (mehanika, cvet) в перевод не попали', !Object.keys(ru).some((k) => /\.(mehanika|cvet)$/.test(k)));
const proba_yazyk = { xx: Object.fromEntries(Object.keys(ru).map((k) => [k, `[xx] ${k}`])) };
const xx = igraNaYazyke(obrazec, 'izobreteniya', '01-08', proba_yazyk, 'xx');
proba('164: игра на языке — каждый текст из файла переводов', Object.keys(vynutStroki(xx, 'izobreteniya', '01-08')).length === 0
  && xx.mehanika === obrazec.mehanika && xx.dannye.chislo === obrazec.dannye.chislo);
proba('164: нет перевода — остаётся русский текст', JSON.stringify(igraNaYazyke(obrazec, 'izobreteniya', '01-08', fayl, 'de')) === JSON.stringify(obrazec));
proba('164: игра на языке по-прежнему проходит схему механики', igraDannymi.safeParse(xx).success);
console.log(`${verno} из ${vsego} верно`);
process.exit(verno === vsego ? 0 : 1);
