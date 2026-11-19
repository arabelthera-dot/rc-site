/* Рамка игры дня (Р635): общий «Ещё раз» и итог; механику рисует движок public/assets/igry/<mehanika>.js.
   Движок: RCIgry.dvizhok('<mehanika>', function(ctx){ ...; return {zanovo: function(){...}}; });
   ctx: mesto — узел движка, dannye — объект из карточки дня, itog(t, cls) — строка итога, ochki(id, n) — баллы через award() под ключом «<mehanika>:<id>».
   Событие страницы rc-igra (Р286 п.3, Р289 п.1 — как викторина в src/lib/den-razmetka.mjs): первое касание движка — «nachal»,
   ochki('pobeda'|'popal') — «vyigral»; явный исход — ctx.ishod('vyigral'|'proigral'). Ловят rc-privychka.js («Поделиться итогом»)
   и rc-igra-schet.js (счёт, пока выключен); без них событие никуда не уходит. Партия «Ещё раз» — снова «nachal». */
(function(){
  if (window.RCIgry) return;
  var dvizhki = {};
  function postavit(ramka, fn){
    if (ramka.__igra) return;
    var el = ramka.querySelector('[data-igra-dannye]');
    var itogEl = ramka.querySelector('[data-igra-itog]');
    var imya = ramka.getAttribute('data-igra-ramka'), nachal = false, konec = false;
    function sobytie(e){ document.dispatchEvent(new CustomEvent('rc-igra', {detail: {e: e, igra: imya, el: ramka}})); }
    // повторный исход шлём, только если он меняется на победу: счёт берёт первый, «Поделиться» — последний
    function ishod(e){ if (!nachal || konec === e || konec === 'vyigral') return; konec = e; sobytie(e); }
    var ctx = {
      ramka: ramka,
      mesto: ramka.querySelector('[data-igra-dvizhok]'),
      dannye: el ? JSON.parse(el.textContent) : {},
      itog: function(t, cls){ itogEl.className = 'igra-ramka-itog' + (cls ? ' ' + cls : ''); itogEl.textContent = t || ''; },
      ochki: function(id, n){ if (typeof award === 'function') award(imya + ':' + id, n); if (id === 'pobeda' || id === 'popal') ishod('vyigral'); },
      ishod: ishod
    };
    if (ctx.mesto) ['pointerdown', 'keydown'].forEach(function(t){
      ctx.mesto.addEventListener(t, function(){ if (!nachal){ nachal = true; sobytie('nachal'); } }, true);
    });
    var igra = fn(ctx) || {};
    ramka.__igra = igra;
    var eshche = ramka.querySelector('[data-igra-eshche]');
    if (eshche) eshche.addEventListener('click', function(){ ctx.itog(''); nachal = konec = false; if (igra.zanovo) igra.zanovo(); });
  }
  window.RCIgry = {
    dvizhok: function(imya, fn){
      dvizhki[imya] = fn;
      var r = document.querySelectorAll('[data-igra-ramka="' + imya + '"]');
      for (var i = 0; i < r.length; i++) postavit(r[i], fn);
    }
  };
})();
