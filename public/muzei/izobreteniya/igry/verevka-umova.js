/* Игра 01-23 — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-23.html (scripts/dni-shablon/iz-html.mjs, Р286);
   разметка — src/data/igry/izobreteniya/verevka-umova.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  /* ── ВЕРЁВКА С КОЛОКОЛЬЧИКОМ ── баллы за игру. Игра ставит шагам .uv-steps li класс ok (шаг пройден)
     и снимает hidden с .uv-finale; страница только смотрит на это, в игру не вмешивается. */
  var igra = document.querySelector('[data-umov-igra]');
  if (igra && window.MutationObserver){
    var li = igra.querySelectorAll('.uv-steps li'), fin = igra.querySelector('.uv-finale');
    var check = function(){
      if (li[0] && li[0].classList.contains('ok')) award('zvon',10);
      if (li[1] && li[1].classList.contains('ok')) award('glaza',10);
      if (fin && !fin.hidden) award('finale',15);
    };
    new MutationObserver(check).observe(igra, {subtree:true, attributes:true, attributeFilter:['class','hidden']});
  }
})();
