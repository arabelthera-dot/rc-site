// r405 (28.10.2026): регрессия сверки с реестрами (src/lib/zakon.mjs); с r415k — и стоп-листа Р316
// (Сергей 28.10.2026: «убирай полностью … вообще все упоминания … и не ставить на странице»).
// 1) на текущих файлах: стоп-лист пуст, сверка с реестрами зелёная, исключений для стоп-листа в isklyucheniya.json нет;
// 2) проба во временной папке: упоминание из стоп-листа красное без исключения, с исключением, с пометкой,
//    в разделе «ждёт решения», в таблице года, в шаблоне дня и даже без снимков реестров (SLUZHEBNOE не мешает);
// 3) обычная сверка: иноагент без пометки — красная, с исключением или пометкой — зелёная (на постороннем имени).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { sverkaReestrov, stopList, stopDist, STOP } from '../src/lib/zakon.mjs';

let oshibok = 0;
const proverka = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) oshibok++; };

// Слова стоп-листа собираются из кусков, чтобы сам тест не попадал в поиск по репо.
const K = 'Кас' + 'паров';
const F = 'Face' + 'book';
const M = 'Me' + 'ta';

const st = stopList('.');
proverka(st.length === 0, `стоп-лист на текущих файлах пуст${st.length ? ': ' + st.slice(0, 5).map((x) => `${x.gde} «${x.naydeno}»`).join('; ') : ''}`);
const isk = JSON.stringify(JSON.parse(fs.readFileSync('data/reestry/isklyucheniya.json', 'utf8')));
proverka(!STOP.some((s) => s.re.test(isk)), 'в isklyucheniya.json нет строк для стоп-листа');
const s = sverkaReestrov('.');
proverka(s.sovpadeniya.length === 0, `сверка с реестрами зелёная (совпадений ${s.sovpadeniya.length}, ждут решения ${s.zhdut.length})`);

// Проба: свой корень с теми же реестрами (или без них), одной карточкой json, одной yaml и таблицей года.
const proba = ({ isk = {}, hook = 'Проба.', yaml = 'Проба.', tablica = '', reestry = true } = {}) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zakon-'));
  fs.mkdirSync(path.join(root, 'data/reestry'), { recursive: true });
  if (reestry) for (const f of fs.readdirSync('data/reestry')) if (f !== 'isklyucheniya.json') fs.copyFileSync(path.join('data/reestry', f), path.join(root, 'data/reestry', f));
  fs.writeFileSync(path.join(root, 'data/reestry/isklyucheniya.json'), JSON.stringify(isk));
  fs.mkdirSync(path.join(root, 'src/content/days/proba'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/content/days/proba/01-01.json'), JSON.stringify({ key: '01-01', title: 'Проба', hook }));
  fs.mkdirSync(path.join(root, 'src/content/dni-shablon/proba'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/content/dni-shablon/proba/01-02.yaml'), `karty:\n  - det:\n      - ${yaml}\n`);
  fs.mkdirSync(path.join(root, 'data/tablicy/proba'), { recursive: true });
  fs.writeFileSync(path.join(root, 'data/tablicy/proba/god.md'), `| 1 янв | Проба | ${tablica || 'Проба.'} |\n`);
  const r = { stop: stopList(root), sverka: reestry ? sverkaReestrov(root) : null };
  fs.rmSync(root, { recursive: true, force: true });
  return r;
};
const krasno = (r, n, msg) => proverka(r.stop.length === n, `${msg} (стоп-лист: ${r.stop.map((x) => `${x.gde} «${x.naydeno}»`).join('; ') || 'пусто'})`);

krasno(proba({ hook: `Гарри ${K} сыграл с машиной.` }), 1, 'имя из стоп-листа в хуке — красная');
krasno(proba({ hook: `Крамник обыграл ${K}а.` }), 1, 'косвенный падеж ловится');
krasno(proba({ hook: `Гарри ${K.toUpperCase()} и ${K.toLowerCase()}.` }), 2, 'оба регистра кириллицы ловятся');
krasno(proba({ hook: `Гарри ${K} (признан в РФ иностранным агентом) сыграл с машиной.` }), 1, 'пометка «иноагент» не снимает');
const k = K.toLowerCase();
const isk1 = { [`proba/01-01|гарри ${k}`]: 'проба', [`proba/01-02|${F.toLowerCase()}`]: 'проба', 'ждёт решения Сергея, r380': { [`proba/01-01|${k}`]: 'проба' } };
krasno(proba({ isk: isk1, hook: `Гарри ${K}.`, yaml: `Статью написали в ${F} AI Research.` }), 2, 'исключение и «ждёт решения» не снимают');
krasno(proba({ yaml: `Статью написали в ${F} AI Research (${M} Platforms Inc., запрещена в России).` }), 3, `${F} и ${M} с пометкой «запрещена» — красная`);
krasno(proba({ hook: `Пост в ${'фей' + 'сбуке'} и в ${'ФЭЙ' + 'СБУКЕ'}.` }), 2, 'кириллическое написание (е и э) ловится');
krasno(proba({ tablica: `${K} — Deep Blue` }), 1, 'таблица года (страница «таблица») ловится');
krasno(proba({ hook: `Аккаунт в ${F}.`, reestry: false }), 1, `без снимков реестров (SLUZHEBNOE prava.mjs ни при чём) ${F} всё равно красный`);
krasno(proba({ hook: 'Металлург Мета, <meta charset> и metaKey.' }), 0, 'тег meta, «Металлург» и metaKey — не компания');

// Собранный сайт: упоминание в dist — красная.
const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'zakon-dist-'));
fs.writeFileSync(path.join(dist, 'index.html'), `<html><head><meta charset="utf-8"></head><body>${K}</body></html>`);
fs.writeFileSync(path.join(dist, 'chisto.html'), '<html><head><meta charset="utf-8"></head><body>Крамник</body></html>');
const d = stopDist(dist);
fs.rmSync(dist, { recursive: true, force: true });
proverka(d.length === 1 && d[0].gde.startsWith('index.html'), `dist: упоминание в готовой странице ловится (${d.map((x) => x.gde).join('; ')})`);

// Обычная сверка с реестрами не сломана: посторонний иноагент без пометки — красная, с исключением или пометкой — зелёная.
const ino = JSON.parse(fs.readFileSync('data/reestry/inoagenty.json', 'utf8')).zapisi
  .find((z) => /^[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+$/.test(z.imya) && !STOP.some((x) => x.re.test(z.imya)));
const [fam, im] = ino.imya.split(' ');
const variant = `${im} ${fam}`.toLowerCase().replace(/ё/g, 'е');
const bezPom = proba({ hook: `${im} ${fam} выступил.` }).sverka;
proverka(bezPom.sovpadeniya.some((x) => x.imya === ino.imya), `иноагент «${im} ${fam}» без пометки — красная`);
const sIsk = proba({ isk: { [`proba/01-01|${variant}`]: 'проба' }, hook: `${im} ${fam} выступил.` }).sverka;
proverka(!sIsk.sovpadeniya.some((x) => x.imya === ino.imya), 'с исключением — зелёная');
const sPom = proba({ hook: `${im} ${fam} (признан в РФ иностранным агентом) выступил.` }).sverka;
proverka(!sPom.sovpadeniya.some((x) => x.imya === ino.imya), 'с пометкой «иностранный агент» — зелёная');
process.exit(oshibok ? 1 : 0);
