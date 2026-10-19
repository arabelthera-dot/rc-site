// Яндекс Метрика, счётчик 113664375 (заказ Михаила, 18.10.2026) — стандартный код с официальной страницы Яндекса.
// Один источник: Metrika.astro (в <head> Base.astro) и integrations/full-pages.mjs (полные страницы дней идут мимо Base).
// public/assets/analytics.js с пустым COUNTER_ID не трогаем: вписать туда номер — второй init того же счётчика.
export const METRIKA_ID = 113664375;
export const metrikaHtml = `<!-- Yandex.Metrika counter -->
<script type="text/javascript">
    // Отложенная загрузка (19.10, Lighthouse BP 79 из-за cookies mc.yandex): очередь ym и init ставятся сразу,
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
        webvisor:true
    });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/${METRIKA_ID}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->`;
