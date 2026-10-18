// Яндекс Метрика, счётчик 113664375 (заказ Михаила, 18.10.2026) — стандартный код с официальной страницы Яндекса.
// Один источник: Metrika.astro (в <head> Base.astro) и integrations/full-pages.mjs (полные страницы дней идут мимо Base).
// public/assets/analytics.js с пустым COUNTER_ID не трогаем: вписать туда номер — второй init того же счётчика.
export const METRIKA_ID = 113664375;
export const metrikaHtml = `<!-- Yandex.Metrika counter -->
<script type="text/javascript">
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
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
