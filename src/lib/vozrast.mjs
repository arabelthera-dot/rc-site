// Знак информационной продукции (436-ФЗ) и всё, что от него зависит (Р41, Е3, Сергей 20.10.2026):
// знак в шапке каждой страницы, строка «Родителю» на 12+/16+, typicalAgeRange в JSON-LD, без очков на 12+/16+,
// отбор для /detyam/. Данные — src/data/vozrast.json; один источник для Base.astro и full-pages.mjs.
import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('src/data/vozrast.json', 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const chislo = (znak) => parseInt(znak, 10);

export const znakMuzeya = (museum) => data.muzei[museum] ?? data.sajt;

// Знак страницы: день-исключение → музей → сайт.
export function znak(museum, key) {
  const den = museum && key ? data.dni[museum]?.[key] : undefined;
  return den?.znak ?? (museum ? znakMuzeya(museum) : data.sajt);
}

// 12+ и старше — трагические страницы: без очков, баллов и званий в интерактивах (п.3 задачи).
export const bezOchkov = (z) => chislo(z) >= 12;

// schema.org typicalAgeRange: «12-» — с 12 лет и старше.
export const typicalAgeRange = (z) => `${chislo(z)}-`;

// Адрес → музей и день: /muzei/<slug>/ и /muzei/<slug>/den/<ключ>/ (с языковой приставкой и без).
export function poPuti(pathname, base = '/') {
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  const m = /(?:^|\/)muzei\/([\w-]+)\/(?:den\/(\d\d-\d\d)\/)?/.exec(rest);
  return { museum: m?.[1], key: m?.[2] };
}

export const znakHtml = (z) =>
  `<span class="rc-vozrast" role="note" aria-label="Возрастная маркировка: ${z}" title="Знак информационной продукции (436-ФЗ): ${z}">${z}</span>`;

// Строка «Родителю»: о чём день и с какого возраста лучше смотреть вместе. Только на 12+/16+.
export function roditelyu(museum, key) {
  const z = znak(museum, key);
  if (!bezOchkov(z)) return undefined;
  if (!key) return data.roditelyuMuzej[museum];
  const f = `src/content/days/${museum}/${key}.json`;
  const d = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
  const o = d.title ? `день о том, кто не сдался: ${d.title}${d.year ? `, ${d.year}` : ''}` : 'день о стойкости людей на войне и в беде';
  const den = data.dni[museum]?.[key];
  return den
    ? `${o}. В рассказе — ${den.prichina}. С 16 лет; подростку 12–15 лет — только вместе со взрослым.`
    : `${o}. Есть война и гибель людей, без жестоких подробностей. С 12 лет; младшим — вместе со взрослым.`;
}

export const roditelyuHtml = (text) =>
  text ? `<p class="rc-roditelyu"><b>Родителю:</b> ${esc(text)}</p>` : '';
