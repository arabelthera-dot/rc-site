// Курсы 7–10 дней с тестом (п.506 плана, Р746, 10.11.2026): /kursy/ — все курсы, /kursy/<id>/ — курс.
// Курс — тема из src/data/temy.json (разметка дней — src/lib/temy.mjs): 7–10 уже готовых дней разных музеев,
// новых текстов нет. Тест в конце — вопросы викторин этих же дней (quiz.voprosy карточек src/content/dni-shablon).
// Тему и состав отбирает машина: тема со страницей темы, от MIN_DNEY готовых дней, от MIN_VOPROSOV вопросов.
// Пройденное — ключи п.496 «Мой прогресс» (rc-return:<музей>.days, museum-return.js): день открыт — отмечен;
// итог теста — rc-kurs:<id> в localStorage. Скрипт — public/assets/rc-kursy.js.
// ВЫКЛЮЧЕНО до показа Сергею: VKLYUCHENO = false — страниц /kursy/ нет. Проба у себя — PUBLIC_KURSY=1 npm run build.
import fs from 'node:fs';
import YAML from 'yaml';
import { temyStranic } from './temy.mjs';

const VKLYUCHENO = false;
export const kursyOn = () => VKLYUCHENO || process.env.PUBLIC_KURSY === '1';

const MIN_DNEY = 7, MAKS_DNEY = 10, MIN_VOPROSOV = 10, MAKS_VOPROSOV = 10;
export const adresKursa = (base, id) => `${base}kursy/${id}/`;

// Вопросы викторины дня: [{ q, o[], a, e }] или [].
export function voprosyDnya(museum, key) {
  const f = `src/content/dni-shablon/${museum}/${key}.yaml`;
  if (!fs.existsSync(f)) return [];
  return YAML.parse(fs.readFileSync(f, 'utf8'))?.quiz?.voprosy ?? [];
}

// Состав: сначала дни с викториной, потом остальные — по одному дню от музея по кругу, пока не MAKS_DNEY;
// в курсе дни идут по дате. Тест — по одному вопросу с дня по кругу, до MAKS_VOPROSOV.
function sostav(dni) {
  const s = dni.map((d) => ({ ...d, voprosy: voprosyDnya(d.museum, d.key) }))
    .sort((a, b) => (b.voprosy.length > 0) - (a.voprosy.length > 0) || a.key.localeCompare(b.key));
  const poMuzeyam = new Map();
  for (const d of s) (poMuzeyam.get(d.museum) ?? poMuzeyam.set(d.museum, []).get(d.museum)).push(d);
  const out = [], ocheredi = [...poMuzeyam.values()];
  while (out.length < MAKS_DNEY && ocheredi.some((o) => o.length)) for (const o of ocheredi) if (o.length && out.length < MAKS_DNEY) out.push(o.shift());
  return out.sort((a, b) => a.key.localeCompare(b.key) || a.museum.localeCompare(b.museum));
}

function test(dni) {
  const out = [], s = dni.filter((d) => d.voprosy.length);
  for (let i = 0; out.length < MAKS_VOPROSOV && s.some((d) => d.voprosy[i]); i++)
    for (const d of s) if (d.voprosy[i] && out.length < MAKS_VOPROSOV) out.push({ ...d.voprosy[i], museum: d.museum, key: d.key });
  return out;
}

let cache;
export function kursy() {
  if (cache) return cache;
  cache = [];
  for (const t of temyStranic()) {
    if (t.dni.length < MIN_DNEY) continue;
    const dni = sostav(t.dni);
    const voprosy = test(dni);
    if (dni.length < MIN_DNEY || voprosy.length < MIN_VOPROSOV || new Set(dni.map((d) => d.museum)).size < 2) continue;
    cache.push({ id: t.id, nazvanie: t.nazvanie, kratko: t.kratko, dni: dni.map(({ voprosy: _, ...d }) => d), voprosy });
  }
  return cache;
}
