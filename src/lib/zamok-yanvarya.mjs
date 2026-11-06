// Замок января (Р570 п.2, Сергей 06.11.2026: «давай менять», метка skhema:da-sergeya): брак ловит схема записи дня,
// а не сторож после сборки. Только январь двух музеев — «Изобретения» и «Русские не сдаются»; остальные дни не краснеют.
// Три правила, сообщение — «<музей> ММ-ДД, факт N: …» (или «…, поле <путь>: …» вне фактов):
//   а) Р504 «мы победили, мы первые» без смягчений: оговорки SMYAGCHENIYA (список scripts/ns-zamki.mjs, перенесён сюда,
//      и примеры Р504 — «одним из первых», «впервые в России», «по некоторым данным», «возможно»); у изобретений
//      в lead.h1 и lead.hook — «в мире» (VMIRE, закон Р365, scripts/pervyj-v-mire.mjs);
//   б) запретные лица и организации — сильное совпадение со снимками реестров Минюста data/reestry/*.json тем же разбором,
//      что сборка (src/lib/zakon.mjs: пометка рядом и data/reestry/isklyucheniya.json снимают совпадение);
//   в) у каждого факта (fakty[].udary[]) адрес источника href — http(s) (храповик Р550).
// Брак, найденный при включении (06.11.2026), — снимок src/data/yanvar-dolg.json { 'музей/ММ-ДД': ['строка ошибки'] }:
// эти строки не роняют сборку, новые — роняют; исправленная строка печатается «снять из долга». Пополнять долг руками нельзя.
// Откат — убрать вызовы zamokYanvarya из src/lib/den-obshchee.mjs и src/content.config.ts.
import fs from 'node:fs';
import { sverkaTekstov, tekst } from './zakon.mjs';

export const MUZEI_YANVARYA = ['izobreteniya', 'ne-sdayutsya'];
export const yanvar = (muzei, key) => MUZEI_YANVARYA.includes(muzei) && /^01-\d\d$/.test(key ?? '');

// «в мире» в заголовке и хуке дня изобретений (Р365).
export const VMIRE = /в\s+мире/i;
// Оговорки, которых в тексте дня быть не может (Р504; этим же списком сторож scripts/ns-zamki.mjs). «Легендарный» — не оговорка: (?![а-яё]) после окончаний;
// «стал легендой» — похвала, «под легендой» — прикрытие разведчика, тоже не оговорки (01-18 Кузнецов, r544).
export const OGOVORKI = [
  ['легенда', /(?<![а-яё])(?<!(?:стал[аио]?|под)\s+)легенд(?:а|ы|е|у|ой|ою|ам|ами|ах)?(?![а-яё])/i],
  ['историки спорят', /историки\s+(?:до\s+сих\s+пор\s+)?спорят/i],
  ['по преданию', /по\s+преданию/i],
  ['считается', /(?<![а-яё])считает?ся(?![а-яё])|(?<![а-яё])считаются(?![а-яё])/i],
  ['Пометка:', /пометка\s*:/i],
  ['один источник', /один\s+источник/i],
  ['мнение', /(?<![а-яё])мнени(?:е|я|ю|ем|и|й|ям|ями|ях)(?![а-яё])/i],
];
export const SMYAGCHENIYA = [
  ...OGOVORKI,
  // Р504 (04.11, примеры из задания Р570): первенство не размывается.
  ['одним из первых', /(?<![а-яё])(?:одн(?:им|ой|ого|а|о|у|их)|один)\s+из\s+перв(?:ых|ыми)(?![а-яё])/i],
  ['впервые в России', /впервые\s+в\s+росси[ия]/i],
  ['по некоторым данным', /по\s+некоторым\s+(?:данным|сведениям)/i],
  ['возможно', /(?<![а-яё])возможно(?![а-яё])/i],
];
// Служебные пометки фактов на страницу не идут (src/lib/den-obshchee.mjs POMETKI_SLUZHEBNYE) — не текст.
const SLUZHEBNYE = ['один источник', 'мнение', 'воспоминание'];
// Поля, где не текст, а адрес или служебное значение.
const NE_TEKST = new Set(['href', 'src', 'data_source', 'poster', 'license', 'width', 'height', 'utverzhden', 'id', 'key',
  'muzei', 'adres', 'canonical', 'audioSrc', 'mp4', 'klass']);
const ADRES = /^(?:\/|https?:\/\/|\.\.?\/)\S*$/;
// Чужие слова — не наше утверждение, смягчение в них не ищется (реестры — ищутся): дословный отрывок документа,
// выходные данные источника (заглавие статьи «Рождение легенды» — не оговорка), пометка — перечень схемы POMETKI.
const CHUZHOE = new Set(['otryvok', 'stranica', 'pometka', 'source']);
const chuzhoe = (put) => CHUZHOE.has(put.at(-1)) || (put.at(-1) === 'title' && ['sources', 'proof'].includes(put[0]));
const chisto = (t) => String(t).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

// Строки записи: [{ put: ['fakty', 0, 'udary', 3, 'summary'], t }].
function stroki(d) {
  const out = [];
  const obhod = (v, put) => {
    if (v == null) return;
    if (Array.isArray(v)) return v.forEach((x, i) => obhod(x, [...put, i]));
    if (typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) if (!NE_TEKST.has(k) && !(k === 'pometka' && SLUZHEBNYE.includes(x))) obhod(x, [...put, k]);
      return;
    }
    if (typeof v === 'string' && !ADRES.test(v.trim())) out.push({ put, t: chisto(v) });
  };
  obhod(d, []);
  return out;
}

// «факт N» — сквозной номер факта дня (по всем блокам fakty), иначе «поле путь».
function gde(d, put) {
  if (put[0] === 'fakty' && put[2] === 'udary' && Number.isInteger(put[3])) {
    const bloki = [d.fakty ?? []].flat();
    const n = bloki.slice(0, put[1]).reduce((s, b) => s + (b.udary?.length ?? 0), 0) + put[3] + 1;
    return `факт ${n}${put.length > 4 ? ` (${put.slice(4).join('.')})` : ''}`;
  }
  return `поле ${put.join('.')}`;
}

// Ошибки записи дня: [{ put, message }]. muzei — папка музея (у карточки шаблона — d.muzei, у записи календаря — d.museum).
export function oshibkiYanvarya(d, muzei) {
  const den = `${muzei} ${d.key}`, o = [];
  const add = (put, tekstOshibki) => o.push({ put, message: `${den}, ${gde(d, put)}: ${tekstOshibki}` });
  const vse = stroki(d);
  // а) смягчения
  for (const { put, t } of vse.filter((x) => !chuzhoe(x.put)))
    for (const [slovo, re] of SMYAGCHENIYA) {
      const m = t.match(re);
      if (m) add(put, `смягчение «${slovo}» (Р504: «мы победили, мы первые», без оговорок): «…${t.slice(Math.max(0, m.index - 40), m.index + m[0].length + 30).trim()}…»`);
    }
  // а) «в мире» в заголовке и хуке изобретений
  if (muzei === 'izobreteniya' && d.lead)
    for (const k of ['h1', 'hook'])
      if (!VMIRE.test(chisto(d.lead[k] ?? ''))) add(['lead', k], `нет «в мире» (Р365/Р504: «первый в мире …» по границе первенства дня): «${chisto(d.lead[k] ?? '').trim()}»`);
  // б) реестры Минюста — тот же разбор, что у сборки; gde начинается с «музей/ключ» — по нему снимаются исключения
  const tx = vse.map(({ put, t }, i) => ({ ...tekst(`${muzei}/${d.key} ${i}`, t), put }));
  for (const s of sverkaTekstov(tx).sovpadeniya) {
    const put = tx[Number(s.gde.split(' ')[1])].put;
    add(put, `запретное имя «${s.imya}» — ${s.reestr} (найдено «${s.variant}»): убрать или пометка по закону`);
  }
  // в) адрес источника у каждого факта
  [d.fakty ?? []].flat().forEach((b, bi) => (b.udary ?? []).forEach((u, i) => {
    if (!/^https?:\/\/\S+$/.test(u.href ?? '')) add(['fakty', bi, 'udary', i, 'href'], `нет адреса источника (href http…, храповик Р550)${u.src ? ` — источник «${chisto(u.src).slice(0, 60)}»` : ''}`);
  }));
  return o;
}

const DOLG = JSON.parse(fs.readFileSync('src/data/yanvar-dolg.json', 'utf8'));

// superRefine: только январь двух музеев; строки долга не роняют, новые — роняют.
export function zamokYanvarya(d, ctx, muzei) {
  if (!yanvar(muzei, d.key)) return;
  const dolg = new Set(DOLG[`${muzei}/${d.key}`] ?? []), bylo = new Set();
  for (const { put, message } of oshibkiYanvarya(d, muzei)) {
    if (dolg.has(message)) { bylo.add(message); continue; }
    ctx.addIssue({ code: 'custom', path: put, message });
  }
  for (const s of dolg) if (!bylo.has(s)) console.log(`::warning::${muzei}/${d.key}: исправлено — снять из src/data/yanvar-dolg.json: ${s.slice(0, 120)}`);
}
