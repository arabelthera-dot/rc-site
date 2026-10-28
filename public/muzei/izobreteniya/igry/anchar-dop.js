/* 24 янв. «Уйди от „Анчара“»: награда за игру (со старой страницы, r409). Движок anchar.js не трогаем —
   смотрим, когда откроется его финал, и даём баллы. */
(function(){
  var fin=document.querySelector('[data-anchar-igra] .an-finale');
  if(fin && window.MutationObserver) new MutationObserver(function(){ if(!fin.hidden && typeof award==='function') award('igra',50); }).observe(fin,{attributes:true,attributeFilter:['hidden']});
})();
