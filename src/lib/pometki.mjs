// Р396 (30.10.2026): общие пометки страниц дней всех музеев — одно место для полных страниц и шаблона дня
// (src/integrations/full-pages.mjs). Вид — public/assets/rc-pometki.css.
// п.1 — говорящий собеседник (блок «Поговори/Спроси»): плашка «Вымышленный собеседник…» над диалогом;
//   обещания «ответит сам …», «как человек 1939 года», «спрашивай о чём угодно» и подпись «сформированы на основе
//   документальных источников» заменяются при сборке (ZAMENY); оставшееся обещание — сборка красная.
// п.3 — 3D-модель или сцена (canvas.scene / #hero3d): строка происхождения из src/data/modeli-3d.json под подписью;
//   у придуманной сцены (scena: true) подпись начинается «Так могло выглядеть» (нет в исходнике — дописывается). Нет записи — сборка красная.
import fs from 'node:fs';

export const PLASHKA = 'Вымышленный собеседник. Отвечает программа. Его слова — не исторический источник; проверенные факты — в разделе «Факты».';
const MODELI = JSON.parse(fs.readFileSync('src/data/modeli-3d.json', 'utf8'));
// Блок собеседника: секция с полем вопроса чата (chatInput, cin) или интервью (#chat с кнопками-вопросами).
const CHAT = /<section\b[^>]*\bid=["'](?:chat-sec|chat)["'][^>]*>[\s\S]*?<\/section>/gi;
const ESTCHAT = (s) => /id=["'](?:chatInput|cin|chatBox|chat-q|chatLog)["']|class=["'][^"']*\b(?:chat-q|q-btn|interview)/i.test(s) || /Спросите|Спроси/.test(s);
// Обещания собеседника → нейтральная подпись. Применяются при сборке ко всей странице (и к строкам скрипта чата):
// полные страницы изобретений по Р383 в исходнике не правятся, а у части страниц других музеев правка исходника
// тянет требование инструкции к игре (igra-pravila). Логику чата не трогают — только текст строк.
const NEUTR = 'Задай вопрос — программа ответит пересказом по источникам дня.';
const ROD = { 'Котельникову': 'Котельникова', 'Лобачевскому': 'Лобачевского' };
export const ZAMENY = [
  [/Задай вопрос — ответит смотритель зала\./g, 'Задай вопрос вымышленному смотрителю зала — отвечает программа.'],
  [/Задай вопрос — ответит (?:сам [^.<]{1,40}|воевода|командир брига|собирательный голос [^.<]{1,60})\./g, NEUTR],
  [/Ответы сформированы на основе документальных источников\./g, 'Ответы — пересказ по источникам дня.'],
  [/Ответы составлены по документальным источникам страницы\./g, 'Ответы — пересказ по источникам дня.'],
  [/Задай (Котельникову|Лобачевскому) вопрос — он ответит своими словами\. Он помнит ([^<]*?)\. Спрашивай о чём угодно\./g,
    (m, kto, chto) => `Задай вопрос вымышленному собеседнику — программа ответит от лица ${ROD[kto]}. Спроси про ${chto.replace(/свою /g, 'его ').replace(/свои /g, 'его ')}. Ответы — пересказ по источникам дня.`],
  [/Отвечу как было\./g, 'Отвечу пересказом по источникам дня.'],
  [/Спрашивайте — про ([^'"<]{1,80}?) расскажу как было\./g, 'Спрашивайте — про $1 отвечу пересказом по источникам дня.'],
  [/— спрашивайте, расскажу как было\./g, '— спрашивайте, отвечу пересказом по источникам дня.'],
  [/Спрашивайте о чём угодно: /g, 'Спрашивайте: '],
];
// Правки ответов собеседника по страницам (имена, даты, цифры сверх фактов страницы) — src/data/sobesednik-pravki.json.
const PRAVKI = JSON.parse(fs.readFileSync('src/data/sobesednik-pravki.json', 'utf8'));
export const OBESCHANIYA = /ответит сам\b|ответит своими словами|как человек \d{4}|спрашива\S* о ч[её]м угодно|сформированы на основе документальных/i;

export function pometki(html, museum, key) {
  const bedy = [];
  for (const [bylo, stalo] of PRAVKI[`${museum}/${key}`] ?? []) {
    // У дня на шаблоне без чата (живой den/ при копии staraya/) правок нет — проверяем только страницу с собеседником.
    if (!html.includes(bylo) && [...html.matchAll(CHAT)].some(([sec]) => ESTCHAT(sec))) bedy.push(`${museum}/${key}: в src/data/sobesednik-pravki.json нет на странице «${bylo.slice(0, 50)}…» — убрать пару`);
    html = html.split(bylo).join(stalo);
  }
  for (const [re, na] of ZAMENY) html = html.replace(re, na);
  html = html.replace(CHAT, (sec) => {
    if (!ESTCHAT(sec) || /<video\b/i.test(sec)) return sec;
    const o = OBESCHANIYA.exec(sec.replace(/<script\b[\s\S]*?<\/script>/gi, ''));
    if (o) bedy.push(`${museum}/${key}: в блоке собеседника обещание «${o[0]}» (Р396 п.1)`);
    if (/class=["']rc-vymysel["']/.test(sec)) return sec;
    return sec.replace(/(<h2\b[^>]*>[\s\S]*?<\/h2>)/i, `$1\n<p class="rc-vymysel" role="note">${PLASHKA}</p>`);
  });
  if (/<canvas\b[^>]*\bid=["']hero3d["']|<model-viewer\b/i.test(html)) {
    const m = MODELI[`${museum}/${key}`];
    if (!m?.proishozhdenie || !/^(?:Реконструкция по описанию|Модель снята с предмета): \S/.test(m.proishozhdenie))
      bedy.push(`${museum}/${key}: 3D-сцена без строки происхождения в src/data/modeli-3d.json (Р396 п.3)`);
    else {
      // Подпись сцены — первая .scene-cap после самой модели (выше по странице бывают подписи снимков с тем же классом).
      const ot = html.search(/<canvas\b[^>]*\bid=["']hero3d["']|<model-viewer\b/i);
      const CAP = /<div class="scene-cap"[^>]*>([\s\S]*?)<\/div>/i;
      const cap = CAP.exec(html.slice(ot));
      // Придуманная сцена: подпись начинается «Так могло выглядеть:» — в исходнике или здесь (исходник по Р383 заморожен).
      if (m.scena && cap && !/^\s*Так могло выглядеть/.test(cap[1])) {
        html = html.slice(0, ot) + html.slice(ot).replace(CAP, (c, t) => c.replace(t, t.replace(/^(\s*)(\S)/, (x, sp, b) => `${sp}Так могло выглядеть: ${b.toLowerCase()}`)));
      }
      if (cap && !/class="rc-model-proish"/.test(html)) html = html.slice(0, ot) + html.slice(ot).replace(CAP, (c) => `${c}\n<p class="rc-model-proish">${m.proishozhdenie}</p>`);
    }
  }
  if (bedy.length) throw new Error(bedy.join('\n'));
  return html;
}
