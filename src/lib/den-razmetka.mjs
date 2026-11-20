// Общие куски разметки страницы дня (r602): вынесены из src/layouts/DenIzobreteniya.astro без изменения вывода
// (собранный HTML 31 дня изобретений — байт-в-байт как до выноса), их же берёт src/layouts/DenNeSdayutsya.astro.
// JS-строка в одинарных кавычках — как в старых страницах: конвейер (src/lib/sosedi-polnye.mjs) ищет
// prev/next в window.MUSEUM_CHROME именно в таком виде и переписывает на ближайшие полные страницы.
import { POMETKI } from './den-obshchee.mjs';
import { stroka } from './yazyki.mjs';

export const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/</g, '\\u003c')}'`;
export const json = (x) => JSON.stringify(x).replace(/</g, '\\u003c');
export const chromeJs = (d, muzeyName) => { const c = d.chrome; return c && `window.MUSEUM_CHROME={
  museum:{title:${q(muzeyName)},href:'index.html'},
  share:{title:${q(c.share.title)},
         text:${q(c.share.text)}},${c.prev ? `
  prev:{href:${q(c.prev.href)},title:${q(c.prev.title)}},` : ''}${c.next ? `
  next:{href:${q(c.next.href)},title:${q(c.next.title)}},` : ''}
  all:{href:${q(c.all.href)},label:${q(c.all.label)}},
  city:'../../index.html',
  random:[${c.random.map(q).join(',')}]
};` };
// «Итог дня» (Р831): intro и note — из того, что есть на странице. Есть игра — как в карточке; нет игры — текст
// утверждённого февраля без игры (src/data/stroki/ru.json), карточка, обещающая игру или опыт, на вывод не влияет.
export const itogDnya = (result, estIgra) => (estIgra ? result
  : { ...result, intro: stroka('ru', 'denResultIntroBezIgry'), note: stroka('ru', 'denResultNoteBezIgry') });
// Реестр баллов (Р831, сверка r832): из того, что на странице правда вызывает award(), а не из рукописного
// score.awards карточки — там q писали списком по вопросам и держали баллы игр, которых на странице нет.
// Викторина — пара [вопросов, балл] (quizJs); игра на данных — ключ рамки «<mehanika>:pobeda» (assets/igry/ramka.js),
// столько, сколько даст её движок; сцена rc3d — игровые ключи карточки (igry/rc3d-den.js даёт lab и причины);
// свои скрипты и разделы дня — их award('ключ', N). 2D-запас 3D-дня и модель .glb баллов не дают — не в счёт.
export const ballyDnya = (d) => {
  const a = {};
  if (d.igra?.rc3d) for (const [k, v] of Object.entries(d.score.awards)) if (k !== 'q' && typeof v === 'number') a[k] = v;
  const pobeda = d.igra?.mehanika && d.igra.dannye?.pobeda;
  if (pobeda) a[`${d.igra.mehanika}:pobeda`] = Number(pobeda.ochki) || 0;
  const kod = [...(d.skripty ?? []).map((s) => s.js ?? ''), ...(d.razdely ?? []).map((r) => r.html)].join('\n');
  for (const [, k, n] of kod.matchAll(/award\(\s*['"](\w+)['"]\s*,\s*(\d+)\s*\)/g)) a[k] = Number(n);
  a.q = [d.quiz.voprosy.length, d.quiz.ball];
  return a;
};
// Есть ли на странице баллы, кроме викторины, — от этого текст «Итога дня» (itogDnya).
export const ballyZaIgru = (d) => Object.keys(ballyDnya(d)).some((k) => k !== 'q');
// Звания — в шкале 0–100, которую видит посетитель (museum-score.js). Верхний порог карточки ниже 100 — лестницу
// писали под недостижимый максимум (0 / 50): растягивается до 100. Одно звание [0, …] не меняется до 100 —
// сверху лестница самого движка (museum-score.js, ranks по умолчанию), снизу звание карточки.
export const zvaniyaDnya = (ranks) => {
  const verh = Math.max(...ranks.map((r) => r[0]));
  if (verh <= 0) return [[70, 'Знаток'], [40, 'Экскурсант'], ...ranks];
  return verh < 100 ? ranks.map(([t, z]) => [Math.round(t * 100 / verh), z]) : ranks;
};
// Строка счёта до первого ответа — та же, что пишет museum-score.js render(), а не result.zvanie карточки («0 / 50»).
export const schetNol = (d) => { const r = zvaniyaDnya(d.score.ranks); return `0 / 100 · звание: ${(r.find((x) => 0 >= x[0]) ?? r[r.length - 1])[1]}`; };
// Ключи без кавычек — как в старых страницах: проверка счёта (scripts/staroe-pravilo.py) ищет реестр «awards:{…}».
export const scoreJs = (d) => `window.MUSEUM_SCORE = ${json({ ...d.score, awards: ballyDnya(d), ranks: zvaniyaDnya(d.score.ranks) }).replace(/"(\w+)":/g, '$1:')};`;
// Викторина дня: вопросы — из карточки, вёрстка ответов — общая (была в одном inline-скрипте с игрой).
// Событие rc-igra (Р286 п.3, Р289 п.1): первый ответ — «nachal», последний — исход (верно не меньше половины —
// «vyigral»). Его ловят rc-privychka.js (кнопка «Поделиться итогом» под викториной) и выключенный счёт rc-igra-schet.js.
// Варианты ответа перемешиваются при сборке (r833): порядок — от текста вопроса, одинаковый при каждой сборке,
// верный ответ не стоит всегда на одном месте; a переводится на новое место верного.
const zerno = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.codePointAt(0), 16777619) >>> 0; return h; };
const peremeshat = (v) => {
  let h = zerno(v.q); const idx = v.o.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { h = Math.imul(h, 1103515245) + 12345 >>> 0; const j = h % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { ...v, o: idx.map((i) => v.o[i]), a: idx.indexOf(v.a) };
};
export const quizJs = (d) => `(function(){
  var $ = function(id){return document.getElementById(id);};
  var Q = ${json(d.quiz.voprosy.map(peremeshat))};
  var box = $('quizBox');
  var otv = 0, ver = 0;
  var igra = function(e){ document.dispatchEvent(new CustomEvent('rc-igra', {detail: {e: e, igra: 'viktorina', el: $('quiz') || box}})); };
  Q.forEach(function(it, qi){
    var wrap = document.createElement('div');
    var h = document.createElement('p'); h.className='quiz-q'; h.textContent=(qi+1)+'. '+it.q; wrap.appendChild(h);
    var exp = document.createElement('div'); exp.className='exp'; exp.setAttribute('aria-live','polite');
    var btns = it.o.map(function(txt, oi){
      var b=document.createElement('button'); b.type='button'; b.className='opt'; b.textContent=txt;
      b.onclick=function(){
        if (wrap.dataset.done) return; wrap.dataset.done='1';
        btns.forEach(function(x,xi){ x.disabled=true; if (xi===it.a) x.classList.add('correct'); });
        if (oi===it.a){ award('q'+qi,${d.quiz.ball}); exp.textContent='Верно. '+it.e; }
        else { b.classList.add('wrong'); exp.textContent='Не совсем. '+it.e; }
        exp.classList.add('show');
        if (!otv++) igra('nachal');
        if (oi===it.a) ver++;
        if (otv===Q.length) igra(ver*2>=Q.length ? 'vyigral' : 'proigral');
      };
      wrap.appendChild(b); return b;
    });
    wrap.appendChild(exp); box.appendChild(wrap);
  });
})();`;
export const knopkiJs = `(function(){
  var $ = function(id){return document.getElementById(id);};
  $('readBtn').onclick = function(){ $('story').scrollIntoView({behavior:'smooth'}); };
  if ($('listenBtn')) $('listenBtn').onclick = function(){ $('audioguide').scrollIntoView({behavior:'smooth'}); };
})();`;
// Кадр у своего факта (Р17): виден всегда, под строкой факта; паспорт — в подписи и data-атрибутах, как в #kadry.
// Длинное описание схемы, карты, чертежа (п. 26, WAI complex images): раскрывающийся блок под картинкой,
// картинка ссылается на него aria-describedby. Поля нет — ни атрибута, ни блока: разметка как раньше.
const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const opisanieId = (src) => `opisanie-${String(src).replace(/^.*\//, '').replace(/\.[a-z0-9]+$/i, '').replace(/[^a-zA-Z0-9-]+/g, '-')}`;
export const opisanieHtml = (im) => (im.opisanie_dlinnoe
  ? `<details class="opisanie-dlinnoe"><summary>Подробное описание картинки</summary><p id="${opisanieId(im.src)}">${escHtml(im.opisanie_dlinnoe)}</p></details>`
  : '');
const opisanieAttr = (im) => (im.opisanie_dlinnoe ? ` aria-describedby="${opisanieId(im.src)}"` : '');
// Подпись кадра с выходными данными (Р830, брак «Хранит X. Хранится: X.»): если держатель уже назван в credit
// («Хранится: …»), хвостовая фраза «Хранит …» из подписи не повторяется.
const reHranit = /(^|(?<=[.!?»)]\s+))Хранит\s[^]*$/;
// Склейка без типографского брака (Р833, строки 28, 41, 56 журнала Р832): «П. Н.. Хранит», «Эльцуфен М..» — одна точка,
// без пробела перед точкой и запятой и без двойных пробелов; credit после законченной фразы — с заглавной буквы.
const chisto = (s) => s.replace(/(?<!\.)\.\.(?=\s|<|$)/g, '.').replace(/[ \u00a0]+(?=[.,])/g, '').replace(/ {2,}/g, ' ');
// Адрес «goskatalog.ru» латиницей в credit (строка 66): каталог уже назван «Госкаталог № …» — хвост «Источник: goskatalog.ru»
// не нужен; где номера нет — каталог называется по-русски.
const reGkAdres = /[.;,]?\s*«?Источник: goskatalog\.ru»?\.?$/;
const bezAdresa = (c) => c.replace(/,\s*goskatalog\.ru(?![/#\w])/g, '')
  .replace(reGkAdres, /Госкаталог №/.test(c) ? '' : '. Источник: Госкаталог Музейного фонда РФ');
export const podpisHtml = (f) => {
  if (!f.credit) return chisto(f.podpis);
  f = { ...f, credit: bezAdresa(f.credit) };
  const podpis = chisto(/Хранится:/.test(f.credit) ? f.podpis.replace(reHranit, '').trim() : f.podpis);
  const credit = chisto(/[.!?»]$/.test(podpis) ? f.credit.replace(/^\p{Ll}/u, (b) => b.toUpperCase()) : f.credit);
  return `${podpis} <span class="credit">${credit}</span>`;
};
export const kadrHtml = (f) => `<figure class="${f.klass ? `fig ${f.klass}` : 'fig'}"><img src="${f.src}"${f.width ? ` width="${f.width}" height="${f.height}"` : ''} loading="lazy" decoding="async" alt="${f.alt.replace(/"/g, '&quot;')}" data-source="${f.data_source}" data-license="${f.license.replace(/"/g, '&quot;')}"${opisanieAttr(f)}><figcaption>${podpisHtml(f)}</figcaption>${opisanieHtml(f)}</figure>`;
export const udarHtml = (u) => `<li${u.find ? ' class="find"' : ''}><details><summary><span>${u.summary}<span class="more-lbl"><span class="o">${u.podrobnee ?? 'Узнать подробнее'}</span><span class="c">Свернуть</span></span></span></summary>
        <div class="det">
${u.det.map((p, i) => `          <p>${i === 0 && u.tag ? `<span class="tag">${u.tag}</span>` : ''}${p}</p>`).join('\n')}
          <p class="src-note">${u.src}</p>${u.otryvok ? `
          <blockquote class="fakt-otryvok">${u.otryvok}</blockquote>` : ''}
        </div></details>${u.pometka ? `<p class="fakt-ist">${POMETKI.includes(u.pometka) ? `<span class="fakt-pometka">${u.pometka}</span> ` : ''}<a href="${u.href}" rel="noopener" target="_blank">${u.stranica}</a></p>` : ''}${u.kadr ? kadrHtml(u.kadr) : ''}</li>`;
export const udaryHtml = (list) => `<ol class="udary">\n${list.map((u) => `      ${udarHtml(u)}`).join('\n')}\n    </ol>`;
// Заголовок блока фактов (Р383, недостаток 18-го): крупно — «10 фактов о …» (слово-число кикера заменяется цифрой, счёт —
// по списку ударов), красивое название h2 — строкой под ним. Кикер без слова-числа («Факты дня») — как раньше.
const CHISLA = ['один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'одиннадцать', 'двенадцать',
  'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать', 'двадцать'];
const reChislo = new RegExp(`^((?:Ещё|Еще)\\s+)?(${CHISLA.join('|')})(?=\\s+факт)`, 'i');
export const faktyZag = (b) => {
  const m = reChislo.exec(b.kicker ?? '');
  if (!m) return `<div class="kicker">${b.kicker}</div>\n    <h2>${b.h2}</h2>`;
  const zag = `<h2 class="fakty-zag">${b.kicker.replace(reChislo, (_, esh) => `${esh ?? ''}${b.udary.length}`)}</h2>`;
  // h2 «Факты дня» — не название, а повтор заголовка: подзаголовком не ставим
  return /^факты дня$/i.test(b.h2.trim()) ? zag : `${zag}\n    <p class="fakty-pod">${b.h2}</p>`;
};
export const faktyHtml = (b) => `<section class="block" id="${b.id}"${b.nav ? ` data-nav="${b.nav}"` : ''}>
  <div class="wrap">
    ${faktyZag(b)}
    ${udaryHtml(b.udary)}${b.dop ? `\n${b.dop}` : ''}
  </div>
</section>`;
// «Куда дальше»: карточки дня + «Весь музей» (podpisMuzeya — строка под ссылкой) + «Город-музей».
export const kudaHtml = (kuda, muzeyName, podpisMuzeya) => `<div class="kd-grid">\n${kuda.map((k) => `      <div class="kd-card${k.main ? ' main' : ''}"><span class="kd-lbl">${k.lbl}</span><a href="${k.href}">${k.title} <span class="kd-arr">→</span></a>\n        <p>${k.hook}</p></div>`).join('\n')}
      <div class="kd-card"><span class="kd-lbl">Весь музей</span><a href="index.html">${muzeyName} <span class="kd-arr">→</span></a>
        <p>${podpisMuzeya}</p></div>
      <div class="kd-card main"><span class="kd-lbl">Город-музей</span><a href="../../index.html">Русская цивилизация <span class="kd-arr">→</span></a>
        <p>Все музеи проекта на одной карте.</p></div>
    </div>`;
