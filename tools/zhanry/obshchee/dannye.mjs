// Общее для всех жанров (Р424/Р425, r554): чтение карточки дня, подстановка в шаблон, подключение игры в yaml дня,
// поиск 3D-модели предмета. Жанр берёт отсюда, своё (вариации, сцена, движок) держит в своей папке. Описание — README.md рядом.
import fs from 'node:fs';
import YAML from 'yaml';

export const bezTegov = (s = '') => String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
export const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Год — четыре цифры от 1000 до 2100 («5000 франков» — не год).
export const god = (v) => /^\d{4}$/.test(String(v).trim()) && +v >= 1000 && +v <= 2100;
// «1 027,5 м» → 1027.5; «×170 000» → 170000.
export const chislo = (v) => { const m = String(v).replace(/[\s ]/g, '').replace(',', '.').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; };
// Минус — типографский «−», не дефис.
export const krasivo = (x, znakov = 0) => x.toLocaleString('ru-RU', { maximumFractionDigits: znakov }).replace(/\u00a0/g, ' ').replace(/^-/, '−');

// Общие поля дня (r554, «Общее для всех жанров»): предмет, год, картинка, главная цифра, факт, удары истории.
export function obshchieDannye(d) {
  const predmet = (d.kroshka.split(' · ')[1] || d.lead.h1).trim();
  // Картинка: обложка, если не портрет, иначе первый кадр дня не портрет. Все кадры дня (и у ударов) — для kadrPo.
  const vseKadry = [d.oblozhka, ...(d.figures || []), ...(d.story.udary || []).map((u) => u.kadr),
    ...[d.fakty ?? []].flat().flatMap((b) => b.udary || []).map((u) => u.kadr)].filter((f) => f && f.src && f.klass !== 'portret');
  const k = vseKadry[0] || d.oblozhka;
  const kadr = (f) => ({ src: f.src, alt: f.alt, podpis: bezTegov(f.podpis || f.alt), w: f.width, h: f.height });
  const udaryVse = [...(d.story.udary ? d.story.udary.map((u) => u.summary) : d.story.abzacy),
    ...[d.fakty ?? []].flat().flatMap((b) => b.udary).map((u) => u.summary)].map(bezTegov);
  const fakt = bezTegov(d.pervenstvo.granica).replace(/^(Граница (первенства|рекорда)|Что сделано):\s*/, '');
  return {
    key: d.key, predmet, h1: d.lead.h1, zagolovok: `${d.lead.h1} ${d.kroshka} ${d.head.title || ''} ${d.head.description || ''}`,
    stamp: d.stamp || [], udaryVse, fakt: fakt[0].toUpperCase() + fakt.slice(1),
    img: kadr(k), kadry: vseKadry.map(kadr),
  };
}
// Кадр дня, где на снимке то, что нужно жанру (по словам в alt — он описывает, что видно); нет такого — обычная картинка дня.
export const kadrPo = (x, slova) => x.kadry.find((f) => slova.test(f.alt || '')) || x.img;

// Удары истории под игру: от min до max штук, суммарно не длиннее chtenie знаков (≈15 знаков в секунду).
export function vybratUdary(x, { min = 3, max = 4, chtenie = 600 } = {}) {
  const out = [];
  for (const u of x.udaryVse.slice(0, max + 2)) { if (out.length >= max) break; if (out.length >= min && out.join('').length + u.length > chtenie) break; if (u.length <= 260) out.push(u); }
  if (out.length < min) throw new Error(`${x.key}: коротких ударов истории ${out.length}, жанру нужно не меньше ${min}`);
  return out;
}

// {{pole}} — экранированный текст, {{{pole}}} — готовая разметка. Неизвестное поле — ошибка, а не пустое место.
export function shablonom(shablon, pole) {
  return shablon.replace(/\{\{\{(\w+)\}\}\}|\{\{(\w+)\}\}/g, (_, syroe, k) => {
    const imya = syroe || k;
    if (!(imya in pole)) throw new Error(`в шаблоне поле {{${imya}}}, генератор его не знает`);
    return syroe ? String(pole[imya]) : e(pole[imya]);
  });
}
export const jsonVHtml = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

// 3D-модель предмета дня: public/muzei/<музей>/igry/rc3d/assets/models/predmety/ММ-ДД.glb (кладёт конвейер моделей:
// видеокарта, Tripo). Есть файл — жанр собирает и 3D-сцену, нет — только 2D по фото. Код не меняется.
export const PAPKA_MODELEY = (muzei) => `public/muzei/${muzei}/igry/rc3d/assets/models/predmety`;
export function modelDnya(muzei, den) {
  const f = `${PAPKA_MODELEY(muzei)}/${den}.glb`;
  return fs.existsSync(f) ? { src: `models/predmety/${den}.glb`, bayt: fs.statSync(f).size } : null;
}

// Подключить игру в карточку дня правкой нескольких строк (остальной yaml не трогаем):
// igra.vtoraya — 2D-игра жанра под игрой дня; css — стиль жанра; igra.rc3d — 3D-сцена жанра, если есть модель,
// и снять её, если модель убрали (только свою: scen начинается с «zhanr-»).
export function podklyuchit(put, { imya, css, rc3d }) {
  let t = fs.readFileSync(put, 'utf8');
  const d = YAML.parse(t);
  if (d.igra.vtoraya && d.igra.vtoraya !== imya) throw new Error(`${put}: igra.vtoraya уже занята (${d.igra.vtoraya})`);
  if (d.igra.rc3d && !d.igra.rc3d.scen.startsWith('zhanr-')) throw new Error(`${put}: igra.rc3d уже занята (${d.igra.rc3d.scen})`);
  if (!d.igra.vtoraya) t = t.replace(/^(igra:\n(\s+)imya: .*\n)/m, `$1$2vtoraya: ${imya}\n`);
  if (!d.igra.css.includes(css)) {
    if (/^ {2}css: \[(.*)\]$/m.test(t)) t = t.replace(/^( {2}css: \[)(.*)\]$/m, (_m, a, b) => `${a}${b ? b + ', ' : ''}${css}]`);
    // Список столбиком: отступ пунктов — как у соседей (в карточках бывает и 2, и 4 пробела).
    else t = t.replace(/^( {2}css:\n(?:( {2,4})- .*\n)+)/m, (m, _a, ots) => `${m}${ots}- ${css}\n`);
  }
  t = t.replace(/^ {2}rc3d:\n(?: {4}.*\n)+/m, '');
  if (rc3d) t = t.replace(/^(igra:\n(?: {2}.*\n)*? {2}css:.*\n(?: {2,4}- .*\n)*)/m, `$1  rc3d:\n${Object.entries(rc3d).map(([k, v]) => `    ${k}: ${JSON.stringify(v)}\n`).join('')}`);
  const posle = YAML.parse(t);
  if (posle.igra.vtoraya !== imya || !posle.igra.css.includes(css) || !!posle.igra.rc3d !== !!rc3d) throw new Error(`${put}: не смог подключить игру`);
  fs.writeFileSync(put, t);
}
