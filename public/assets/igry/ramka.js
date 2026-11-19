/* Рамка игры дня (Р635): общий «Ещё раз» и итог; механику рисует движок public/assets/igry/<mehanika>.js.
   Движок: RCIgry.dvizhok('<mehanika>', function(ctx){ ...; return {zanovo: function(){...}}; });
   ctx: mesto — узел движка, dannye — объект из карточки дня, itog(t, cls) — строка итога, ochki(id, n) — баллы через award() под ключом «<mehanika>:<id>». */
(function(){
  if (window.RCIgry) return;
  var dvizhki = {};
  function postavit(ramka, fn){
    if (ramka.__igra) return;
    var el = ramka.querySelector('[data-igra-dannye]');
    var itogEl = ramka.querySelector('[data-igra-itog]');
    var ctx = {
      ramka: ramka,
      mesto: ramka.querySelector('[data-igra-dvizhok]'),
      dannye: el ? JSON.parse(el.textContent) : {},
      itog: function(t, cls){ itogEl.className = 'igra-ramka-itog' + (cls ? ' ' + cls : ''); itogEl.textContent = t || ''; },
      ochki: function(id, n){ if (typeof award === 'function') award(ramka.getAttribute('data-igra-ramka') + ':' + id, n); }
    };
    var igra = fn(ctx) || {};
    ramka.__igra = igra;
    var eshche = ramka.querySelector('[data-igra-eshche]');
    if (eshche) eshche.addEventListener('click', function(){ ctx.itog(''); if (igra.zanovo) igra.zanovo(); });
  }
  window.RCIgry = {
    dvizhok: function(imya, fn){
      dvizhki[imya] = fn;
      var r = document.querySelectorAll('[data-igra-ramka="' + imya + '"]');
      for (var i = 0; i < r.length; i++) postavit(r[i], fn);
    }
  };
})();
