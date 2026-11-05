/* Игры 01-09: «Проведи воз по грязи» — внешний /assets/blinov-gusenica.js (skripty), «Быстрый ответ» — скрипт как есть со страницы
   src/data/full-pages/izobreteniya/01-09.html; разметка — src/data/igry/izobreteniya/blinov-gusenica.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  let t=15,ti=null,done=false;
  const correct=1;
  function go(){if(ti||done)return;ti=setInterval(()=>{
    if(done)return;
    t--;document.getElementById('gm_quiz2_t').textContent=t;
    if(t<=0){clearInterval(ti);gm_quiz2_ans(-1);}
  },1000);}
  const box=document.getElementById('gm_quiz2');
  if('IntersectionObserver' in window&&box){const io=new IntersectionObserver(e=>{if(e[0].isIntersecting){io.disconnect();go();}},{threshold:.6});io.observe(box);}else go();
  window['gm_quiz2_ans']=function(i){
    if(done)return;done=true;clearInterval(ti);
    const btns=document.querySelectorAll('#gm_quiz2_opts .gm-btn');
    btns.forEach((b,j)=>{b.disabled=true;
      if(j===correct)b.classList.add('ok');
      else if(j===i)b.classList.add('no');
      else b.classList.add('neutral');
    });
    document.getElementById('gm_quiz2_exp').classList.add('show');
    if(i===correct){const pts=Math.max(5,Math.round(t/15*15));if(typeof award==='function')award('gm_quiz2',pts);}
  };
})();
