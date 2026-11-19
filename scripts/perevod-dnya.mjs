// Машинный перевод дня на языки сайта (Р603, Р686 п.8, Р688): новая карточка дня сама уходит в перевод.
// Карточка src/content/dni-shablon/<музей>/ММ-ДД.yaml → файл строк src/data/perevod/<музей>-<ММ-ДД>.json в формате
// docs/perevod-standart.md: { "_", "ru": { путь поля: текст }, "<код>": { путь: перевод }, "_otpechatki" } — перевод
// пишет zapisatPerevod(), что делать заново — ustarevshie() (src/lib/otpechatok.mjs). Переводятся только строки с кириллицей;
// цитата на другом языке (citaty[].yazyk, п.43) — нет. Языки — src/data/yazyki.json (кроме ru): язык добавляется строкой там.
// Переводчик — Argos Translate, бесплатно и офлайн (scripts/perevod-argos.py). Только данные: страницы на других языках
// этим не строятся, вид сайта не меняется. Зовёт .github/workflows/perevod.yml; руками: node scripts/perevod-dnya.mjs <карточка.yaml>…
// Файл строк игры дня src/data/igry/stroki/<музей>-<ММ-ДД>.json (игры-данными и ручные январские, п. 164), если есть,
// переводится тем же проходом: его ru пишут stroki-igr / stroki-ruchnyh-igr, здесь — только языки. Узкие места (хук, подписи,
// кнопки), где перевод длиннее потолка (src/lib/potolok-dliny.mjs, п. 162), печатаются строкой «длинно: …» — не ошибка.
// Как в мире: машинный перевод после слияния исходника — Crowdin/Weblate «pre-translate»
// (https://docs.weblate.org/en/latest/admin/machine.html), открытый переводчик — https://github.com/argosopentech/argos-translate .
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { zapisatPerevod, ustarevshie, gotovnost } from '../src/lib/otpechatok.mjs';
import { dlinnye } from '../src/lib/potolok-dliny.mjs';
import { pamyat, slovar, podskazki } from '../src/lib/perevod-pamyat.mjs';

const KODY = JSON.parse(fs.readFileSync('src/data/yazyki.json', 'utf8')).yazyki.map((y) => y.code).filter((c) => c !== 'ru');
const KIR = /[а-яё]/i;
// Код языка сайта — BCP 47 с письмом (zh-Hans, п. 145); переводчик знает только основной подтег (zh). Файл строк — под кодом сайта.
const kodPerevodchika = (code) => code.split('-')[0];

/** Русские строки карточки: { 'bloki.0.tekst': '…' } — каждая строка с кириллицей, кроме цитат не на русском. */
export function russkieStroki(d) {
  const out = {};
  const obhod = (v, p) => {
    if (typeof v === 'string') { if (KIR.test(v)) out[p] = v; return; }
    if (!v || typeof v !== 'object' || (v.yazyk && v.yazyk !== 'ru')) return;
    for (const [k, x] of Object.entries(v)) obhod(x, p ? `${p}.${k}` : k);
  };
  obhod(d, '');
  return out;
}

const PAMYAT = pamyat(); // п.141: готовый перевод той же строки из других дней
const fayly = process.argv.slice(2).filter((f) => /dni-shablon\/[^/]+\/\d\d-\d\d\.yaml$/.test(f) && fs.existsSync(f));
const sobrat = (kuda, fayl, id, otstup) => {
  for (const { code, kluch, prichina } of ustarevshie(fayl)) if (prichina === 'net-ru') delete fayl[code][kluch];
  const staroe = new Set(ustarevshie(fayl).map((u) => `${u.code} ${u.kluch}`));
  const nado = Object.fromEntries(KODY.map((c) => [c, Object.keys(fayl.ru).filter((k) => !(k in (fayl[c] ?? {})) || staroe.has(`${c} ${k}`))]));
  let izPamyati = 0;
  const pisalis = new Set();
  for (const c of KODY) nado[c] = nado[c].filter((k) => {
    const gotov = PAMYAT[c]?.get(fayl.ru[k]);
    if (gotov === undefined) return true;
    zapisatPerevod(fayl, c, k, gotov); izPamyati++; pisalis.add(c); return false;
  });
  return { kuda, fayl, nado, izPamyati, sdelano: new Set(KODY.filter((c) => nado[c].length || pisalis.has(c))), id, otstup };
};
const dni = fayly.flatMap((f) => {
  const d = YAML.parse(fs.readFileSync(f, 'utf8'));
  const kuda = `src/data/perevod/${d.muzei}-${d.key}.json`;
  const fayl = fs.existsSync(kuda) ? JSON.parse(fs.readFileSync(kuda, 'utf8'))
    : { _: `Машинный перевод дня ${d.muzei} ${d.key} (scripts/perevod-dnya.mjs, Argos Translate). Руками не правится.` };
  fayl.ru = russkieStroki(d);
  const igra = `src/data/igry/stroki/${d.muzei}-${d.key}.json`;
  return [sobrat(kuda, fayl, `${d.muzei}/${d.key}`, 1),
    ...(fs.existsSync(igra) ? [sobrat(igra, JSON.parse(fs.readFileSync(igra, 'utf8')), `${d.muzei}/${d.key} игра`, 2)] : [])];
});
// одна задача на язык для всех дней — модель грузится один раз
const zadachi = KODY.map((code) => ({ code, teksty: dni.flatMap((x) => x.nado[code].map((k) => x.fayl.ru[k])) })).filter((z) => z.teksty.length);
const vPerevodchik = zadachi.map((z) => ({ ...z, code: kodPerevodchika(z.code) }));
const gotovo = zadachi.length
  ? JSON.parse(execFileSync('python3', ['scripts/perevod-argos.py'], { input: JSON.stringify({ zadachi: vPerevodchik }), maxBuffer: 1 << 28, stdio: ['pipe', 'pipe', 'inherit'] }).toString())
  : {};
for (const { code } of zadachi) {
  let i = 0;
  for (const x of dni) for (const k of x.nado[code]) zapisatPerevod(x.fayl, code, k, gotovo[kodPerevodchika(code)][i++]);
}
fs.mkdirSync('src/data/perevod', { recursive: true });
for (const x of dni) {
  // готовность языков (п. 147) — только у файла дня; файл строк игры её не несёт
  if (x.kuda.startsWith('src/data/perevod/')) x.fayl._gotovo = gotovnost(x.fayl, KODY, new Date().toISOString().slice(0, 10), x.sdelano);
  fs.writeFileSync(x.kuda, JSON.stringify(x.fayl, null, x.otstup) + '\n');
  const n = Object.keys(x.fayl.ru).length;
  console.log(`${x.id}: строк ${n}, переведено ${KODY.filter((c) => Object.keys(x.fayl[c] ?? {}).length === n).length} из ${KODY.length} языков (${KODY.join(', ')}), из памяти переводов ${x.izPamyati}`);
  for (const u of dlinnye(x.fayl)) console.log(`длинно: ${u.code} ${u.kluch} ${u.dlina} > ${u.potolok}`);
}
// п.141, Р627: словарь терминов — только подсказка в журнал, ничего не останавливает
const SLOVA = slovar();
for (const x of dni) for (const c of KODY) for (const [k, ru] of Object.entries(x.fayl.ru)) {
  const net = podskazki(SLOVA, ru, x.fayl[c]?.[k] ?? '', c);
  if (net.length) console.log(`подсказка словаря: ${x.id} ${c} ${k} — нет «${net.join('», «')}»`);
}
