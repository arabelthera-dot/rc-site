// Связи между музеями по теме (Р289 п.2, 27.10.2026): словарь тем src/data/temy.json, общий для всех музеев,
// разметка готовых дней src/data/temy-dni.json, блок «По этой теме в других музеях» внизу полной страницы дня
// (full-pages.mjs, рядом с «Этот день в других музеях») и страницы /tema/<id>/ (src/pages/tema/). Чистый node.
// Разметка — машиной по тексту дня (scripts/temy-razmetka.mjs пишет temy-dni.json, правка глазом — в нём же);
// готовый день, которого в temy-dni.json ещё нет, размечается той же машиной при сборке — темы у дня есть всегда.
// Люди и места поимённо — словарь src/data/slovar.json (Р37); здесь — широкие темы, связывающие разные музеи.
// ВЫКЛЮЧЕН: VKLYUCHENO = false — полные страницы дня те же байт в байт, страниц /tema/ нет. Проба у себя —
// PUBLIC_TEMY=1 npm run build. Включение — заявкой VKLYUCHENO = true после снимков 390/1440 на трёх днях.
import fs from 'node:fs';
import path from 'node:path';
import { gotovyeDni, adresDnya, kogda } from './etot-den.mjs';

const VKLYUCHENO = false;
export const temyOn = () => VKLYUCHENO || process.env.PUBLIC_TEMY === '1';

export const TEMY = JSON.parse(fs.readFileSync('src/data/temy.json', 'utf8')).temy;
const PO_ID = Object.fromEntries(TEMY.map((t) => [t.id, t]));
const DNI = 'src/data/temy-dni.json';
const POROG = 8, DOLYA = 0.25, MAKS = 3, KARTOCHEK = 6, MIN_KARTOCHEK = 3;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const adresTemy = (base, id) => `${base}tema/${id}/`;

// \b в JS — только латиница: граница слова для кириллицы — по \p{L}.
const GR = '(?:(?<!\\p{L})(?=\\p{L})|(?<=\\p{L})(?!\\p{L})|(?<!\\p{N})(?=\\p{N})|(?<=\\p{N})(?!\\p{N}))';
const RE = Object.fromEntries(TEMY.map((t) => [t.id, new RegExp(t.slova.map((s) => s.replaceAll('\\b', GR)).join('|'), 'giu')]));
const skolko = (s, re) => (s.match(re) ?? []).length;

// Текст дня: заголовок и хук — отдельно (вес 5), тело — полная страница без скриптов и стилей или анкета.
export function tekstDnya(museum, key) {
  const card = JSON.parse(fs.readFileSync(`src/content/days/${museum}/${key}.json`, 'utf8'));
  const html = path.join('src/data/full-pages', museum, `${key}.html`);
  const telo = fs.existsSync(html)
    ? fs.readFileSync(html, 'utf8').replace(/<(script|style|svg|nav|footer)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
    : JSON.stringify(card.body ?? []);
  return { golova: `${card.title ?? ''} ${card.hook ?? ''}`, telo, slovar: card.slovar ?? [] };
}

// Машинная разметка: очки = 5 × совпадения в заголовке и хуке + совпадения в теле + 10 за связь словаря.
// Тема — от POROG очков и не меньше DOLYA от лучшей темы дня; не больше MAKS тем на день.
export function razmetit(museum, key) {
  const { golova, telo, slovar } = tekstDnya(museum, key);
  const och = TEMY.map((t) => [t.id, skolko(golova, RE[t.id]) * 5 + skolko(telo, RE[t.id]) + (t.slovar.some((s) => slovar.includes(s)) ? 10 : 0)])
    .filter(([, o]) => o >= POROG).sort((a, b) => b[1] - a[1]);
  return och.filter(([, o]) => o >= och[0]?.[1] * DOLYA).slice(0, MAKS);
}

let cache;
// Map «музей/ММ-ДД» → [id тем] для всех готовых дней: из temy-dni.json, нет записи — машиной.
export function temyDnej() {
  if (cache) return cache;
  const ruchnye = fs.existsSync(DNI) ? JSON.parse(fs.readFileSync(DNI, 'utf8')).dni : {};
  cache = new Map();
  for (const [key, dni] of gotovyeDni()) for (const d of dni) {
    const k = `${d.museum}/${key}`;
    const temy = (ruchnye[k] ?? razmetit(d.museum, key).map(([id]) => id)).filter((id) => {
      if (!PO_ID[id]) throw new Error(`temy-dni.json: у ${k} тема «${id}», её нет в src/data/temy.json`);
      return true;
    });
    cache.set(k, { ...d, temy });
  }
  return cache;
}
export const temaDnya = (museum, key) => temyDnej().get(`${museum}/${key}`)?.temy ?? [];

// Темы со страницей: только где готовые дни хотя бы двух разных музеев — иначе это не связь между музеями.
export function temyStranic() {
  const out = [];
  for (const t of TEMY) {
    const dni = [...temyDnej().values()].filter((d) => d.temy.includes(t.id));
    if (new Set(dni.map((d) => d.museum)).size >= 2) out.push({ ...t, dni });
  }
  return out;
}

// Блок «По этой теме в других музеях» для дня museum/key: 3–6 карточек других музеев, по темам дня по очереди,
// от каждого музея — по одному дню на тему, без повторов и без дней «Этот день в других музеях» (они уже стоят выше).
// Меньше трёх карточек — блока нет. Ссылки — только на собранные готовые дни и на страницы тем со страницей.
export function blokPoTeme(base, museum, key) {
  const svoi = temaDnya(museum, key);
  if (!svoi.length) return '';
  const est = new Set(temyStranic().map((t) => t.id));
  const vse = [...temyDnej().values()];
  const vybor = [], bylo = new Set();
  const kolonki = svoi.map((id) => vse.filter((d) => d.museum !== museum && d.key !== key && d.temy.includes(id))
    .sort((a, b) => a.key.localeCompare(b.key)).map((d) => ({ d, id })));
  // По кругу: тема 1, тема 2, … — первый ещё не взятый день нового для блока музея, затем любого.
  for (let krug = 0; vybor.length < KARTOCHEK && kolonki.some((k) => k.length); krug++) {
    for (const k of kolonki) {
      const i = k.findIndex(({ d }) => !bylo.has(`${d.museum}/${d.key}`) && !vybor.some((v) => v.d.museum === d.museum));
      const j = i >= 0 ? i : k.findIndex(({ d }) => !bylo.has(`${d.museum}/${d.key}`));
      if (j < 0) { k.length = 0; continue; }
      const [v] = k.splice(j, 1);
      bylo.add(`${v.d.museum}/${v.d.key}`);
      vybor.push(v);
      if (vybor.length >= KARTOCHEK) break;
    }
  }
  if (vybor.length < MIN_KARTOCHEK) return '';
  const li = vybor.map(({ d, id }) => `<li class="rc-ed-item"><a class="rc-ed-link" href="${adresDnya(base, d.museum, d.key)}">`
    + `<span class="rc-ed-muzey">${esc(d.museumTitle)} · ${esc(PO_ID[id].nazvanie)}</span><span class="rc-ed-title">${esc(d.title)}</span></a></li>`).join('');
  const ssylki = svoi.filter((id) => est.has(id)).map((id) => `<a href="${adresTemy(base, id)}">${esc(PO_ID[id].nazvanie)}</a>`).join(' · ');
  return `<section class="rc-etot-den rc-po-teme" aria-labelledby="rc-pt-h"><h2 class="rc-ed-h" id="rc-pt-h">По этой теме в других музеях</h2>`
    + `<ul class="rc-ed-list">${li}</ul>${ssylki ? `<p class="rc-ed-vse rc-pt-temy">Все дни по теме: ${ssylki}</p>` : ''}</section>`;
}
export { kogda };
