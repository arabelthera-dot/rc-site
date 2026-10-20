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
`;
const metrikaTail = `<noscript><div><img src="https://mc.yandex.ru/watch/${METRIKA_ID}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->`;
export const metrikaFile = `rc-metrika-${createHash('md5').update(metrikaJs).digest('hex').slice(0, 10)}.js`;
export const metrikaInlayn = process.env.RC_METRIKA_INLAYN === '1';
// defer: файл выполняется после разбора страницы; tag.js и так грузится по первому действию / через 3,5 с после load.
export const metrikaHtml = metrikaInlayn
  ? `<!-- Yandex.Metrika counter -->\n<script type="text/javascript">\n${metrikaJs}</script>\n${metrikaTail}`
  : `<!-- Yandex.Metrika counter -->\n<script defer src="/assets/${metrikaFile}"></script>\n${metrikaTail}`;
