// Знак информационной продукции (436-ФЗ) и признак трагического дня (Р87, Сергей 21.10.2026, заменяет Р41):
// знак в шапке каждой страницы (сайт 6+, сказки 0+), typicalAgeRange в JSON-LD, отбор для /detyam/.
// Трагический день (Р40) — не знак: без очков и «Итога дня», строка «Родителю», в пост 9:00 не идёт.
// Данные — src/data/vozrast.json; один источник для Base.astro, full-pages.mjs и проверки поста.
import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('src/data/vozrast.json', 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const chislo = (znak) => parseInt(znak, 10);

export const znakMuzeya = (museum) => data.muzei[museum] ?? data.sajt;

// Знак страницы: музей → сайт (знаков у отдельных дней нет, Р87).
export const znak = (museum) => (museum ? znakMuzeya(museum) : data.sajt);

// Трагический день (Р40): причина или undefined.
export const tragicheskij = (museum, key) => (museum && key ? data.tragicheskieDni[museum]?.[key] : undefined);

// Трагический день — без очков, баллов и званий в интерактивах; интерактив остаётся.
export const bezOchkov = (museum, key) => Boolean(tragicheskij(museum, key));

// schema.org typicalAgeRange: «6-» — с 6 лет и старше.
export const typicalAgeRange = (z) => `${chislo(z)}-`;

// Адрес → музей и день: /muzei/<slug>/ и /muzei/<slug>/den/<ключ>/ (с языковой приставкой и без).
export function poPuti(pathname, base = '/') {
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  const m = /(?:^|\/)muzei\/([\w-]+)\/(?:den\/(\d\d-\d\d)\/)?/.exec(rest);
  return { museum: m?.[1], key: m?.[2] };
}

export const znakHtml = (z) =>
  `<span class="rc-vozrast" role="note" aria-label="Возрастная маркировка: ${z}" title="Знак информационной продукции (436-ФЗ): ${z}">${z}</span>`;

// Строка «Родителю» — только на трагическом дне: о чём день, без возраста (Р87).
export function roditelyu(museum, key) {
  const prichina = tragicheskij(museum, key);
  if (!prichina) return undefined;
  const f = `src/content/days/${museum}/${key}.json`;
  const d = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
  const o = d.title ? `день о том, кто не сдался: ${d.title}${d.year ? `, ${d.year}` : ''}` : 'день о стойкости людей на войне и в беде';
  return `${o}. В рассказе — ${prichina}. Ребёнку лучше смотреть вместе со взрослым.`;
}

export const roditelyuHtml = (text) =>
  text ? `<p class="rc-roditelyu"><b>Родителю:</b> ${esc(text)}</p>` : '';
