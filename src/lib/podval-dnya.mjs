// Общий подвал страницы дня (опись Р84, А2 + Б6, 21.10.2026): один на все шаблоны дня — карточку ([key].astro)
// и полную страницу (src/integrations/full-pages.mjs вставляет его в последний <footer>, не копией в файле дня).
// Состав: «Нашли ошибку? Сообщите нам» (письмо на nastroyki.pochtaOshibka) и рядом «Исправления» (Р290, только ru), «Детям», «Контакты», автор и почта,
// источники картинок — по факту: «в подписи к каждому кадру» + сводная «Авторы изображений» (не огульно «Commons»).
// Метка data-rc-podval-dnya — по ней проверка №2 (scripts/podval-dnya.mjs) ищет подвал в dist.
import nastroyki from '../data/nastroyki.json' with { type: 'json' };
import { stroka } from './yazyki.mjs';

export const AVTOR = 'Сергей Ефименко';
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function oshibkaPismo({ title, url, code = 'ru' }) {
  const s = (k) => stroka(code, k);
  return `mailto:${nastroyki.pochtaOshibka}?subject=${encodeURIComponent(`${s('oshibkaTema')}: ${title}`)}`
    + `&body=${encodeURIComponent(`${s('oshibkaStranica')}: ${url}\n\n${s('oshibkaChtoNeTak')}:\n\n`)}`;
}

export function podvalDnyaHtml({ base, title, url, code = 'ru', kartinki = true }) {
  const s = (k) => stroka(code, k);
  const p = nastroyki.pochtaOshibka;
  return `<div class="dp-err" data-rc-podval-dnya>${esc(s('oshibkaVopros'))} <a class="oshibka-den" href="${esc(oshibkaPismo({ title, url, code }))}" rel="nofollow">${esc(s('oshibkaSsylka'))}</a> ${esc(s('oshibkaKonec'))}`
    + (code === 'ru' ? ` Что уже исправили — <a href="${base}ispravleniya/">«${esc(s('podvalIspravleniya'))}»</a>.` : '')
    + `<br><a href="${base}detyam/">${esc(s('podvalDetyam'))}</a> · <a href="${base}kontakty/">${esc(s('podvalKontakty'))}</a>`
    + ` · Автор проекта — <a href="${base}o-proekte/">${AVTOR}</a> · <a href="mailto:${p}">${p}</a>`
    + (kartinki ? `<br>Изображения: источник, автор и лицензия — в подписи к каждому кадру; все вместе — <a href="${base}avtory-izobrazheniy/">«Авторы изображений»</a>.` : '')
    + `</div>`;
}
