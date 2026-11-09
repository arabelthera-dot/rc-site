// Устройство под перевод (очередь 0, пп. 41–42): пометки HTML translate="no" и lang — по образцу W3C ITS 2.0
// (https://www.w3.org/TR/its20/#trans-datacat, https://html.spec.whatwg.org/multipage/dom.html#the-translate-attribute).
// Сами переводы не делаются; на русской странице lang у русских кусков не ставится — HTML там не меняется.
import { poUmolchaniyu } from './yazyki.mjs';

/** Пометка «не переводить» (ITS 2.0 Translate, local): шифры, номера, коды — переводчик и браузер оставляют их как есть. */
export const NE_PEREVODIT = { translate: 'no' };

/** Пометка языка куска text языка kod на странице языка stranica: совпадают — пусто (lang наследуется от <html>). */
export const yazykVstavki = (stranica, kod = poUmolchaniyu) => (stranica && stranica !== kod ? { lang: kod } : {});

/** То же строкой атрибута для разметки, собранной строкой: ' lang="ru"' или ''. */
export const yazykVstavkiAttr = (stranica, kod = poUmolchaniyu) => (stranica && stranica !== kod ? ` lang="${kod}"` : '');

const ekran = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Каждое вхождение строк spisok (поле дня ne_perevodit) в тексте html — в <span translate="no">.
 *  Трогает только текст между тегами: атрибуты, теги и уже помеченное (translate="no" рядом) не меняются.
 *  Пустой список — html как был, байт в байт. Длинные строки ищутся первыми («ф. 1, оп. 2» раньше «ф. 1»). */
export function nePerevodit(html, spisok) {
  const slova = [...new Set((spisok ?? []).filter((s) => typeof s === 'string' && s.trim()))].sort((a, b) => b.length - a.length);
  if (!slova.length || !html) return html;
  const re = new RegExp(`(${slova.map(ekran).join('|')})`, 'g');
  let vnutri = 0; // глубина уже помеченного translate="no"
  return html.split(/(<[^>]*>)/).map((kusok) => {
    if (kusok.startsWith('<')) {
      if (/^<span\b[^>]*\btranslate="no"/.test(kusok)) vnutri++;
      else if (vnutri && /^<span\b/.test(kusok)) vnutri++;
      else if (vnutri && kusok === '</span>') vnutri--;
      return kusok;
    }
    return vnutri ? kusok : kusok.replace(re, '<span translate="no">$1</span>');
  }).join('');
}
