// Яндекс Метрика, счётчик 113664375 (заказ Михаила, 18.10.2026) — стандартный код с официальной страницы Яндекса.
// Один источник: Metrika.astro (в <head> Base.astro) и integrations/full-pages.mjs (полные страницы дней идут мимо Base).
// public/assets/analytics.js с пустым COUNTER_ID не трогаем: вписать туда номер — второй init того же счётчика.
// Вариант без #205 (политика и плашка cookie откатаны): код счётчика — как до 19.10, механика «файлом» — из #224.
import { createHash } from 'node:crypto';
export const METRIKA_ID = 113664375;
// Вебвизор (запись действий посетителя) выключен везде — сайт смотрят дети (Р41, Е3, Сергей 20.10.2026).
// В кабинете Метрики тот же переключатель — «Вебвизор, карта скроллинга, аналитика форм» — должен быть выключен (Михаил).
// Код скрипта — отдельной строкой: по умолчанию он идёт файлом assets/rc-metrika-<md5>.js (вес сборки, 20.10:
// инлайн ×~4400 страниц ≈ 7 МБ), файл пишет integrations/metrika-fajlom.mjs. Код тот же, буква в букву.
// Откат без правки кода: RC_METRIKA_INLAYN=1 — скрипт снова инлайном, как до 20.10.
// Цели (Е9, «да» Сергея 20.10.2026) — JavaScript-события; в кабинете Метрики их заводит Михаил (М26) с этими
// идентификаторами, буква в букву. Пока цели в кабинете нет, reachGoal просто не засчитывается — страница не ломается.
// Только у страниц со счётчиком: код живёт в этом же файле, а где счётчика нет (/doska/), нет и целей.
// Без своих идентификаторов и персональных данных: ни cookie, ни localStorage сайт не пишет; «вернулся» читает
// стандартную метку Метрики _ym_d (дата первого визита, её ставит сам tag.js); в sessionStorage — только флаг
// «уже отправлено в этой вкладке». Признаки источников и интерактивов — те же, что в анкете дня (src/lib/anketa.mjs).
export const CELI = {
  dochital: 'rc_dochital',       // на странице дня долистал до источников (нет блока — до «Куда дальше», нет и его — до подвала)
  nazhal: 'rc_nazhal',           // первое действие (нажатие, клавиша, выбор) внутри интерактива дня
  vernulsya: 'rc_vernulsya',     // новый визит через 30 мин – 7 дней после первого визита (метка _ym_d)
  podpisalsya: 'rc_podpisalsya', // клик по подписке: Telegram-канал или RSS
};
const celiJs = `
    // Цели (Е9): ${Object.values(CELI).join(', ')}. Один раз за страницу; без своих идентификаторов (src/lib/metrika.mjs).
    (function(w,d){
    var C=${JSON.stringify(CELI)},sent={};
    function goal(n,p){if(sent[n])return;sent[n]=1;try{w.ym&&w.ym(${METRIKA_ID},"reachGoal",n,p||{})}catch(e){}}
    var den=/\\/muzei\\/([^\\/]+)\\/den\\/(\\d\\d-\\d\\d)\\/?$/.exec(location.pathname),
        p=den?{muzey:den[1],den:den[2]}:{};
    // вернулся: _ym_d — секунды первого визита; моложе 30 мин — это ещё первый визит, старше 7 дней — не считаем.
    // Визит начат здесь, если пришли не со своих страниц; в этой вкладке — один раз.
    try{var m=/(?:^|; )_ym_d=(\\d+)/.exec(d.cookie),age=m&&(Date.now()/1000-m[1]),
      ref=d.referrer&&new URL(d.referrer).host===location.host;
      if(age>1800&&age<604800&&!ref&&!sessionStorage.getItem(C.vernulsya)){sessionStorage.setItem(C.vernulsya,"1");goal(C.vernulsya)}}catch(e){}
    // подписался: блок «Подписаться» (.rc-sub), любая ссылка на Telegram-канал, RSS
    d.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;
      var h=a.getAttribute("href");
      if(a.closest(".rc-sub")||/^https?:\\/\\/t\\.me\\//.test(h))goal(C.podpisalsya,{kuda:"telegram"});
      else if(/rss\\.xml$/.test(h))goal(C.podpisalsya,{kuda:"rss"})},true);
    if(!den)return;
    // нажал: первое действие внутри интерактива дня (типы «interaktiv» анкеты + игры .game/.game-hall)
    var INT='[id^="game"],[id^="quiz"],[id^="fork"],#chat-sec,[id^="razbor"],[id^="trudno-poverit"],[id^="chto-zametit"],[id^="theme-inventions"],[id^="zoom"],[id^="scale"],[id^="myth"],.game,.game-hall';
    function act(e){var t=e.target;if(t&&t.closest&&t.closest(INT)){goal(C.nazhal,p);
      ["pointerdown","keydown","change"].forEach(function(n){d.removeEventListener(n,act,true)})}}
    ["pointerdown","keydown","change"].forEach(function(n){d.addEventListener(n,act,true)});
    // дочитал: верх блока источников показался на экране после прокрутки (типы «istochniki» анкеты + карточка дня)
    var SRC='#istochnik,#istochniki,#sources,#sources-rights,#itog,.sources,.source-list';
    function tgt(){return d.querySelector(SRC)||d.getElementById("kuda-dalshe")||d.querySelector("footer")}
    var tick=0;
    function sc(){if(tick)return;tick=1;requestAnimationFrame(function(){tick=0;var el=tgt();
      if(el&&w.scrollY>0&&el.getBoundingClientRect().top<w.innerHeight){goal(C.dochital,p);w.removeEventListener("scroll",sc)}})}
    w.addEventListener("scroll",sc,{passive:true});
    })(window,document);
`;
export const metrikaJs = `    // Отложенная загрузка (19.10, Lighthouse BP 79 из-за cookies mc.yandex): очередь ym и init ставятся сразу,
    // tag.js грузится по первому действию (scroll/pointerdown/keydown/touchstart) или через 3,5 с после load
    // в простое браузера. Визит не теряется: init уже в очереди с отметкой времени m[i].l, tag.js её разберёт.
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    var done=0,ev=["scroll","pointerdown","keydown","touchstart"];
    function go(){if(done)return;done=1;
      for(var n=0;n<ev.length;n++)m.removeEventListener(ev[n],go,{passive:true});
      for (var j = 0; j < e.scripts.length; j++) {if (e.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}
    for(var n=0;n<ev.length;n++)m.addEventListener(ev[n],go,{passive:true,once:true});
    function idle(){setTimeout(function(){m.requestIdleCallback?m.requestIdleCallback(go,{timeout:2000}):go()},3500)}
    if(e.readyState==="complete")idle();else m.addEventListener("load",idle,{once:true});
    })
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(${METRIKA_ID}, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:false
    });
${celiJs}`;
const metrikaTail = `<noscript><div><img src="https://mc.yandex.ru/watch/${METRIKA_ID}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->`;
export const metrikaFile = `rc-metrika-${createHash('md5').update(metrikaJs).digest('hex').slice(0, 10)}.js`;
export const metrikaInlayn = process.env.RC_METRIKA_INLAYN === '1';
// defer: файл выполняется после разбора страницы; tag.js и так грузится по первому действию / через 3,5 с после load.
export const metrikaHtml = metrikaInlayn
  ? `<!-- Yandex.Metrika counter -->\n<script type="text/javascript">\n${metrikaJs}</script>\n${metrikaTail}`
  : `<!-- Yandex.Metrika counter -->\n<script defer src="/assets/${metrikaFile}"></script>\n${metrikaTail}`;
