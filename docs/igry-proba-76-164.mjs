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
// kazhdomu-svoyo-mesto (02-01, 02-02): одна подпись на место, место подписи есть в mesta; с картинкой — у места x и y.
const mesto = JSON.parse(fs.readFileSync(new URL('./igry-obrazcy/kazhdomu-svoyo-mesto.json', import.meta.url), 'utf8'));
const pravka = (fn) => { const o = structuredClone(mesto); fn(o.dannye); return igraDannymi.safeParse(o).success; };
proba('76: данные к механике kazhdomu-svoyo-mesto приняты', igraDannymi.safeParse(mesto).success);
proba('76: подпись на место, которого нет, — отказ', !pravka((d) => { d.podpisi[0].mesto = 'net-takogo'; }));
proba('76: две подписи на одно место — отказ', !pravka((d) => { d.podpisi[1].mesto = d.podpisi[0].mesto; }));
proba('76: картинка есть, у места нет x — отказ', !pravka((d) => { delete d.mesta[0].x; }));
proba('76: без картинки места плитками — приняты', pravka((d) => { delete d.kartinka; d.mesta.forEach((m) => { delete m.x; delete m.y; }); }));
proba('164: тексты kazhdomu-svoyo-mesto в перевод, коды и src — нет', (() => {
  const k = Object.keys(vynutStroki(mesto, 'izobreteniya', '02-02'));
  return k.some((x) => x.endsWith('dannye.podpisi.0.tekst')) && k.some((x) => x.endsWith('dannye.mesta.0.verno_ru'))
    && !k.some((x) => /\.(kod|mesto|src)$/.test(x));
})());
// nastroy-volnu-priyomnika (01-04): числа как в январской игре, цель внутри шкалы, счёт с {n}.
const volna = JSON.parse(fs.readFileSync(new URL('./igry-obrazcy/nastroy-volnu-priyomnika.json', import.meta.url), 'utf8'));
const pravkaV = (fn) => { const o = structuredClone(volna); fn(o.dannye); return igraDannymi.safeParse(o).success; };
proba('76: данные к механике nastroy-volnu-priyomnika приняты', igraDannymi.safeParse(volna).success);
proba('76: цель «до» не больше «от» — отказ', !pravkaV((d) => { d.cel_do = d.cel_ot; }));
proba('76: счёт без {n} — отказ', !pravkaV((d) => { d.schet_ru = 'Команд принято'; }));
proba('164: тексты nastroy-volnu-priyomnika в перевод, числа — нет', (() => {
  const k = Object.keys(vynutStroki(volna, 'izobreteniya', '01-04'));
  return k.some((x) => x.endsWith('dannye.knopka_ru')) && k.some((x) => x.endsWith('dannye.pobeda.soobshchenie_ru'))
    && !k.some((x) => /\.(komand|dopusk|cel_ot|polzunok_start)$/.test(x));
})());
// ugol-v-koridor-luny (01-02): угол старта между min и max, удар меньше коридора; тексты исходов в перевод, цвета — нет.
const luna = JSON.parse(fs.readFileSync(new URL('./igry-obrazcy/ugol-v-koridor-luny.json', import.meta.url), 'utf8'));
const pravkaL = (fn) => { const o = structuredClone(luna); fn(o.dannye); return igraDannymi.safeParse(o).success; };
proba('76: данные к механике ugol-v-koridor-luny приняты', igraDannymi.safeParse(luna).success);
proba('76: угол старта вне min–max — отказ', !pravkaL((d) => { d.ugol.start = 90; }));
proba('76: удар не меньше коридора — отказ', !pravkaL((d) => { d.udar = d.koridor; }));
proba('164: тексты ugol-v-koridor-luny в перевод, цвета — нет', (() => {
  const k = Object.keys(vynutStroki(luna, 'izobreteniya', '01-02'));
  return k.some((x) => x.endsWith('dannye.teksty.popal_ru')) && k.some((x) => x.endsWith('dannye.cel.podpis')) && !k.some((x) => /\.cvet\.\d$/.test(x));
})());
// tri-usloviya-bulata (01-03): январская игра данными; верно и start — среди вариантов, узор от 0 до 1.
const bulat = JSON.parse(fs.readFileSync(new URL('./igry-obrazcy/tri-usloviya-bulata.json', import.meta.url), 'utf8'));
const pravkaB = (fn) => { const o = structuredClone(bulat); fn(o.dannye); return igraDannymi.safeParse(o).success; };
proba('76: данные к механике tri-usloviya-bulata приняты', igraDannymi.safeParse(bulat).success);
proba('76: верный вариант не из списка — отказ', !pravkaB((d) => { d.usloviya[0].verno = 'net'; }));
proba('76: сила узора больше 1 — отказ', !pravkaB((d) => { d.pobeda.vid.uzor = 2; }));
proba('76: без «под микроскопом» — принято', pravkaB((d) => { delete d.blizhe; }));
proba('164: тексты tri-usloviya-bulata в перевод, коды и числа — нет', (() => {
  const k = Object.keys(vynutStroki(bulat, 'izobreteniya', '01-03'));
  return k.some((x) => x.endsWith('dannye.blizhe.knopka_ru')) && k.some((x) => x.endsWith('dannye.usloviya.0.neudacha.kadr_ru'))
    && !k.some((x) => /\.(kod|start|verno|ton|uzor|ochki)$/.test(x));
})());
// smeta-truboprovoda (01-05): ползунки по уровням, start — существующий уровень, сцена ссылается на существующий ползунок.
const smeta = JSON.parse(fs.readFileSync(new URL('./igry-obrazcy/smeta-truboprovoda.json', import.meta.url), 'utf8'));
const pravkaS = (fn) => { const o = structuredClone(smeta); fn(o.dannye); return igraDannymi.safeParse(o).success; };
proba('76: данные к механике smeta-truboprovoda приняты', igraDannymi.safeParse(smeta).success);
proba('76: start ползунка вне уровней — отказ', !pravkaS((d) => { d.polzunki[0].start = 9; }));
proba('76: сцена на ползунок, которого нет, — отказ', !pravkaS((d) => { d.scena.stancii = 7; }));
// zvenya-pod-koleso (январь 01-09, данными): число звеньев 3–12, без шагов — отказ.
const zv = JSON.parse(fs.readFileSync(new URL('./igry-obrazcy/zvenya-pod-koleso.json', import.meta.url), 'utf8'));
const pravkaZv = (fn) => { const o = structuredClone(zv); fn(o.dannye); return igraDannymi.safeParse(o).success; };
proba('76: данные к механике zvenya-pod-koleso (01-09) приняты', igraDannymi.safeParse(zv).success);
proba('76: zvenya-pod-koleso — звеньев 1 — отказ', !pravkaZv((d) => { d.zvenev = 1; }));
proba('76: zvenya-pod-koleso — без шага «edet» — отказ', !pravkaZv((d) => { delete d.edet; }));
console.log(`${verno} из ${vsego} верно`);
process.exit(verno === vsego ? 0 : 1);
