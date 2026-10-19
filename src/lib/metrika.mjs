// Яндекс Метрика, счётчик 113664375 (заказ Михаила, 18.10.2026) — стандартный код с официальной страницы Яндекса.
// Один источник: Metrika.astro (в <head> Base.astro) и integrations/full-pages.mjs (полные страницы дней идут мимо Base).
// public/assets/analytics.js с пустым COUNTER_ID не трогаем: вписать туда номер — второй init того же счётчика.
//
// Согласие на cookie (152-ФЗ, ст. 9 и 18.1; пункт Д1, разбор knowledge/razbory-2026-10/kak-budto-gotovo/cookie-i-152fz.md):
// tag.js НЕ грузится, пока посетитель не нажал «Принять» на плашке. Выбор — localStorage['rc-cookie'] = 'da' | 'net'.
// «Отказаться» — счётчик не грузится вовсе; выбора нет — показывается плашка. Вебвизор выключен (webvisor:false).
// Пиксель <noscript> убран: без JS согласия не спросить, значит и не считаем.
// Отозвать согласие: ссылка с data-rc-cookie-reset (на странице политики) — стирает выбор и снова показывает плашку.
export const METRIKA_ID = 113664375;
export const POLITIKA_URL = '/politika-konfidencialnosti/';
export const metrikaHtml = `<!-- Yandex.Metrika counter: только после согласия на cookie -->
<style>
.rc-cookie{position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;box-sizing:border-box;max-width:720px;margin:0 auto;
  padding:14px 16px;border:1px solid var(--line,rgba(255,255,255,.14));border-radius:12px;background:var(--panel,#12151c);
  color:var(--txt,#e8e2d4);font:15px/1.45 'Inter',system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.45)}
.rc-cookie p{margin:0 0 10px}
.rc-cookie a{color:var(--gold,#c8a24a)}
.rc-cookie .rc-cookie-b{display:flex;gap:10px;flex-wrap:wrap}
.rc-cookie button{min-height:44px;padding:0 20px;border-radius:22px;font:inherit;font-weight:600;cursor:pointer}
.rc-cookie .da{background:var(--gold,#c8a24a);color:#111;border:0}
.rc-cookie .net{background:transparent;color:var(--txt,#e8e2d4);border:1px solid var(--line,rgba(255,255,255,.3))}
.rc-cookie button:focus-visible{outline:2px solid #d9b95c;outline-offset:2px}
</style>
<script type="text/javascript">
(function(w,d){
  var KEY="rc-cookie",ID=${METRIKA_ID},R="https://mc.yandex.ru/metrika/tag.js";
  function get(){try{return w.localStorage.getItem(KEY)}catch(e){return null}}
  function set(v){try{w.localStorage.setItem(KEY,v)}catch(e){}}
  // Код Метрики — стандартный, вызывается только при согласии. Повторный визит с согласием — отложенная загрузка
  // (19.10, Lighthouse BP: tag.js по первому действию или через 3,5 с после load); сразу после «Принять» — без задержки.
  function metrika(now){
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    var done=0,ev=["scroll","pointerdown","keydown","touchstart"];
    function go(){if(done)return;done=1;
      for(var n=0;n<ev.length;n++)m.removeEventListener(ev[n],go,{passive:true});
      for (var j = 0; j < e.scripts.length; j++) {if (e.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}
    if(now){go();return}
    for(var n=0;n<ev.length;n++)m.addEventListener(ev[n],go,{passive:true,once:true});
    function idle(){setTimeout(function(){m.requestIdleCallback?m.requestIdleCallback(go,{timeout:2000}):go()},3500)}
    if(e.readyState==="complete")idle();else m.addEventListener("load",idle,{once:true});
    })(w, d, "script", R, "ym");
    w.ym(ID, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:false
    });
  }
  function plashka(){
    if(d.querySelector(".rc-cookie"))return;
    var b=d.createElement("div");b.className="rc-cookie";b.setAttribute("role","region");b.setAttribute("aria-label","Согласие на cookie");
    b.innerHTML='<p>Мы используем cookie и Яндекс Метрику, чтобы понимать, какие залы музея интересны посетителям. '
      +'Нажимая «Принять», вы даёте согласие на обработку этих данных. Подробнее — в <a href="${POLITIKA_URL}">Политике конфиденциальности</a>.</p>'
      +'<div class="rc-cookie-b"><button type="button" class="da">Принять</button><button type="button" class="net">Отказаться</button></div>';
    b.querySelector(".da").onclick=function(){set("da");b.remove();metrika(true)};
    b.querySelector(".net").onclick=function(){set("net");b.remove()};
    d.body.appendChild(b);
  }
  function ready(f){d.readyState==="loading"?d.addEventListener("DOMContentLoaded",f,{once:true}):f()}
  // Отзыв согласия (страница политики): стереть выбор, выключить счётчик до перезагрузки, снова спросить.
  ready(function(){
    var r=d.querySelectorAll("[data-rc-cookie-reset]");
    for(var i=0;i<r.length;i++)r[i].addEventListener("click",function(ev){ev.preventDefault();
      try{w.localStorage.removeItem(KEY)}catch(e){}
      // cookie Метрики (_ym_*) — стереть на этом домене и на родительском
      d.cookie.split(";").forEach(function(c){var n=c.split("=")[0].trim();if(n.indexOf("_ym")===0){
        var h=location.hostname;d.cookie=n+"=;path=/;max-age=0";d.cookie=n+"=;path=/;max-age=0;domain=."+h.replace(/^www\\./,"")}});
      w["disableYaCounter"+ID]=true;plashka()});
  });
  var v=get();
  if(v==="da")metrika(false);else if(v!=="net")ready(plashka);
})(window,document);
</script>
<!-- /Yandex.Metrika counter -->`;
