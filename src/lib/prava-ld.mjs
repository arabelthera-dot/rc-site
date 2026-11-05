// Р396 п.2 (30.10.2026): в JSON-LD лицензия CC BY 4.0 — только у наших текстов (Р35), у каждого кадра — своя лицензия
// и держатель из паспорта кадра (data-license, подпись, credit). Одно место для шаблонов (Base.astro) и полных страниц
// (src/integrations/full-pages.mjs). Чужой кадр без названной лицензии свободным не объявляется: license не ставим.
import { licName } from './podpisi.mjs';
import { LICENZIYA } from './redakciya.mjs';

export const TEKSTY_NOTICE = 'Тексты — CC BY 4.0. Изображения — по лицензиям и у держателей, указанных у каждого кадра.';

const strip = (s = '') => String(s).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const obrez = (s) => s.replace(/[\s.,;:·—-]+$/, '').trim().slice(0, 200);

function licUrl(t) {
  const cc = t.match(/\bCC[ -]?(BY(?:[ -](?:SA|ND|NC))*)(?:[ -]?(\d\.\d))?/i);
  if (cc) return `https://creativecommons.org/licenses/${cc[1].toLowerCase().replace(/ /g, '-')}/${cc[2] ?? '4.0'}/deed.ru`;
  if (/\bCC[ -]?0\b/i.test(t)) return 'https://creativecommons.org/publicdomain/zero/1.0/deed.ru';
  if (/обществен\S* достоян|public domain|PD-/i.test(t)) return 'https://creativecommons.org/publicdomain/mark/1.0/deed.ru';
  return undefined;
}

/** Держатель прав из паспорта кадра: «Хранится: …», «© …», «Фото: …», «Источник: …»; '' — не назван. */
// Конец имени — «;», «·» или точка в конце предложения; точки сокращений («им.», «акад.», инициалы «И. П.») имя не рвут.
const IMYA = String.raw`((?:[^.;·]|\.(?<=(?:\s|^)(?:[А-ЯЁA-Z]|им|акад|св|г|ул|д|т|проф)\.))+)`;
export function derzhatel(t) {
  const m = t.match(new RegExp(String.raw`©\s*` + IMYA)) ?? t.match(new RegExp(String.raw`Хранится:\s*` + IMYA, 'i'))
    ?? t.match(new RegExp(String.raw`(?:Фото|Источник|Автор)\s*:\s*` + IMYA, 'i'));
  return m ? obrez(m[1]) : '';
}

/** ImageObject кадра: { src (абсолютный), license (data-license), text (подпись + credit) }. */
export function kadrLd({ src, license = '', text = '' }) {
  const pasport = strip(`${license} ${text}`);
  const nash = /Русская цивилизация,?\s*CC BY/i.test(pasport) || /^\s*Русская цивилизация/i.test(strip(license));
  const o = { '@type': 'ImageObject', contentUrl: src };
  const url = nash ? LICENZIYA : licUrl(pasport);
  const imya = licName(pasport) || strip(license);
  // Держатель — из строки прав кадра (data-license «© …»), иначе из подписи и credit.
  const kto = nash ? 'Русская цивилизация' : (/^©/.test(strip(license)) ? derzhatel(strip(license)) : '') || derzhatel(pasport);
  if (url) o.license = url;
  const kopirayt = /^©/.test(strip(license)) ? `© ${kto}` : '';
  if (kopirayt && kto) o.copyrightNotice = kopirayt;
  else if (imya) o.copyrightNotice = imya.startsWith('©') || !kto ? imya : `${imya}; ${kto}`;
  else o.copyrightNotice = 'Права — у держателя, указанного в подписи кадра; свободной лицензии нет';
  if (kto) o.copyrightHolder = { '@type': 'Organization', name: kto };
  const credit = strip(text);
  if (credit) o.creditText = credit.slice(0, 300);
  return o;
}
