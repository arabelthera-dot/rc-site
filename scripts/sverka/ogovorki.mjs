// Замки страницы дня по Р504 (Сергей 04.11.2026: «Жёсткая позиция, мы победили … по всем фактам») и хуку (Р524, r533).
// 1) оговорки — в видимом тексте страницы нет слов, которые ставят победу под сомнение: «легенда», «историки спорят»,
//    «по преданию», «считается», «Пометка:», «один/единственный источник», «мнение». Машина их не выводит; если фраза
//    в утверждённом тексте Сергея — день красный, править текст может только он (список «день → фраза» в отчёте).
// 2) хук — lead.hook страницы дословно равен hook карточки календаря src/content/days/<музей>/ММ-ДД.json.
// Вызывается из scripts/sverka-utverzhdeno.mjs (строгий шаг заявки) для изменённых в заявке дней.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export const OGOVORKI = [
  ['легенда', /легенд[а-яё]*/i],
  ['историки спорят', /историк[а-яё]*(?:\s+[а-яё]+){0,3}\s+спор[а-яё]*|спор[а-яё]*(?:\s+[а-яё]+){0,3}\s+историк[а-яё]*/i],
  ['по преданию', /по\s+преданию/i],
  ['считается', /(?<![а-яё])считается/i],
  ['Пометка:', /Пометка(?:\s+проверки)?\s*:/i],
  ['один источник', /(?<![а-яё])(?:один|единственн[а-яё]*)\s+источник[а-яё]*|известн[а-яё]*\s+только\s+по\s/i],
  ['мнение', /(?<![а-яё])(?:мнени[еяюи]|по\s+мнению)(?![а-яё])/i],
];

// Ключи YAML, которые посетитель не видит (служебные поля, адреса, разметка).
const SKRYTYE = new Set(['muzei', 'key', 'adres', 'canonical', 'ld', 'og', 'proof', 'klyuch', 'pole', 'klass', 'data_source', 'utverzhden', 'id', 'format', 'suffix', 'poster', 'mp3', 'mp4', 'file', 'url', 'href']);
const bezTegov = (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ').trim();

function stroki(v, put, out) {
  if (typeof v === 'string') { out.push([put, bezTegov(v)]); return out; }
  if (Array.isArray(v)) v.forEach((x, i) => stroki(x, `${put}[${i}]`, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!SKRYTYE.has(k)) stroki(x, put ? `${put}.${k}` : k, out);
  return out;
}

// Видимые строки страницы: [[где, текст]] — YAML шаблона или старая full-pages (без тегов, скриптов, комментариев).
export function strokiStranicy(muzey, key, koren) {
  const y = path.join(koren, 'src/content/dni-shablon', muzey, `${key}.yaml`);
  if (fs.existsSync(y)) return stroki(YAML.parse(fs.readFileSync(y, 'utf8')), '', []);
  const h = path.join(koren, 'src/data/full-pages', muzey, `${key}.html`);
  if (!fs.existsSync(h)) return [];
  const t = fs.readFileSync(h, 'utf8').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ');
  return [['страница', bezTegov(t)]];
}

// Оговорки в строках: [«фраза» (где): …кусок…].
export function ogovorki(str) {
  const o = [];
  for (const [gde, t] of str) for (const [imya, re] of OGOVORKI) {
    const m = t.match(re); if (!m) continue;
    o.push(`оговорка «${imya}» (${gde || 'страница'}): …${t.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40)}…`);
  }
  return o;
}

// Хук страницы против карточки календаря. Нет карточки календаря или хука на странице — пропуск (сверяет конвейер).
export function hukNeTot(muzey, key, koren) {
  const y = path.join(koren, 'src/content/dni-shablon', muzey, `${key}.yaml`);
  const k = path.join(koren, 'src/content/days', muzey, `${key}.json`);
  if (!fs.existsSync(y) || !fs.existsSync(k)) return [];
  const str = YAML.parse(fs.readFileSync(y, 'utf8'))?.lead?.hook, kal = JSON.parse(fs.readFileSync(k, 'utf8')).hook;
  if (!kal || str == null) return [];
  return bezTegov(str) === bezTegov(kal) ? [] : [`хук страницы «${bezTegov(str)}» ≠ хук карточки календаря «${bezTegov(kal)}» (src/content/days/${muzey}/${key}.json)`];
}

export const zamkiStranicy = (muzey, key, koren) => [...hukNeTot(muzey, key, koren), ...ogovorki(strokiStranicy(muzey, key, koren))];
