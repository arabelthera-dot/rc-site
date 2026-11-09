// Общие куски разметки страницы дня (r602): вынесены из src/layouts/DenIzobreteniya.astro без изменения вывода
// (собранный HTML 31 дня изобретений — байт-в-байт как до выноса), их же берёт src/layouts/DenNeSdayutsya.astro.
// JS-строка в одинарных кавычках — как в старых страницах: конвейер (src/lib/sosedi-polnye.mjs) ищет
// prev/next в window.MUSEUM_CHROME именно в таком виде и переписывает на ближайшие полные страницы.
import { POMETKI } from './den-obshchee.mjs';

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
// Ключи без кавычек — как в старых страницах: проверка счёта (scripts/staroe-pravilo.py) ищет реестр «awards:{…}».
export const scoreJs = (d) => `window.MUSEUM_SCORE = ${json(d.score).replace(/"(\w+)":/g, '$1:')};`;
// Викторина дня: вопросы — из карточки, вёрстка ответов — общая (была в одном inline-скрипте с игрой).
// Событие rc-igra (Р286 п.3, Р289 п.1): первый ответ — «nachal», последний — исход (верно не меньше половины —
// «vyigral»). Его ловят rc-privychka.js (кнопка «Поделиться итогом» под викториной) и выключенный счёт rc-igra-schet.js.
export const quizJs = (d) => `(function(){
  var $ = function(id){return document.getElementById(id);};
  var Q = ${json(d.quiz.voprosy)};
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
export const kadrHtml = (f) => `<figure class="${f.klass ? `fig ${f.klass}` : 'fig'}"><img src="${f.src}"${f.width ? ` width="${f.width}" height="${f.height}"` : ''} loading="lazy" decoding="async" alt="${f.alt.replace(/"/g, '&quot;')}" data-source="${f.data_source}" data-license="${f.license.replace(/"/g, '&quot;')}"${opisanieAttr(f)}><figcaption>${f.credit ? `${f.podpis} <span class="credit">${f.credit}</span>` : f.podpis}</figcaption>${opisanieHtml(f)}</figure>`;
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
