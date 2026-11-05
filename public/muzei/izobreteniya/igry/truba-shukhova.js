/* Игры 5 янв. «Посчитай трубу, как Шухов» (gm_shukhov) и «Быстрый ответ» (gm_quiz2) — скрипты 1:1 с живой страницы day-05jan-shukhov.html (#games);
   разметка — src/data/igry/izobreteniya/truba-shukhova.html, стили — assets/igra-truba-shukhova.css. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var D=[2,3,4,6], NU=[60,35,22], HEAT=[0,10,20], HCOST=[0,14,30];
  var tries=0, won=false, best=null;
  var $=function(id){return document.getElementById(id);};
  function calc(di,n,h){
    var q=n?Math.round(27300*Math.pow(D[di],2.6)*Math.sqrt(n)/Math.sqrt(NU[h])/100)*100:0;
    var c=Math.round(12*Math.pow(D[di],1.4)+18*n+HCOST[h]);
    return {q:q,c:c};
  }
  function fmt(x){return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g,' ');}
  function draw(){
    var di=+$('pD').value, n=+$('pN').value, h=+$('pH').value, r=calc(di,n,h);
    $('pDv').textContent=D[di]+'″';
    $('pNv').textContent=n?n:'нет';
    $('pHv').textContent=HEAT[h]?'+'+HEAT[h]+' °C':'без подогрева';
    $('pTube').style.height=(7+di*5)+'px';
    var pumps='';
    for(var i=0;i<n;i++)pumps+='<div class="pipe-pump" style="left:'+(15+i*26)+'%">⚙️</div>';
    $('pPumps').innerHTML=pumps;
    var flow='';
    if(r.q>0){
      var dur=Math.max(.55,3.2-r.q/45000);            // быстрее поток — выше расход
      var cnt=Math.min(9,2+Math.round(r.q/22000));
      for(var j=0;j<cnt;j++)flow+='<i style="animation-duration:'+dur.toFixed(2)+'s;animation-delay:'+(-dur*j/cnt).toFixed(2)+'s"></i>';
    }
    $('pFlow').innerHTML=flow;
    $('pCarts').style.opacity=r.q>=80000?0:.6;
    $('pQ').innerHTML=r.q?fmt(r.q)+' <small style="font-size:12px;color:#7a9ab8">пуд/сут</small>':'нефть стоит';
    $('pQ').className=r.q>=80000?'g-ok':'g-no';
    $('pC').innerHTML=fmt(r.c)+' <small style="font-size:12px;color:#7a9ab8">тыс. руб.</small>';
    $('pC').className=r.c<=90?'g-ok':'g-no';
    var price=r.q?(r.c*1000*100/(r.q*30)):0;         // условно: смета делится на месяц перекачки, копейки за пуд
    $('pP').innerHTML=r.q?price.toFixed(2).replace('.',',')+' <small style="font-size:12px;color:#7a9ab8">коп./пуд</small>':'—';
    $('pP').className='g-n';
    return r;
  }
  ['pD','pN','pH'].forEach(function(id){var e=$(id);if(e)e.addEventListener('input',draw);});
  var go=$('pGo');
  if(go)go.onclick=function(){
    var di=+$('pD').value, n=+$('pN').value, h=+$('pH').value, r=draw(), out=$('pRes');
    tries++;
    if(r.q>=80000&&(!best||r.c<best))best=r.c;
    $('pTry').textContent='Попыток: '+tries+(best?' · лучшая смета при выполненной норме: '+best+' тыс.':'');
    if(r.q===0){
      out.innerHTML='⛔ <b>Насосов нет — нефть стоит в трубе.</b> Самотёком на десять километров она не пойдёт: Балаханы и Чёрный город почти на одной высоте.';
      out.style.color='#f08080';return;
    }
    if(r.q<80000){
      var need=Math.round((80000-r.q)/1000);
      out.innerHTML='❌ <b>'+fmt(r.q)+' пудов в сутки — мало,</b> не хватает '+need+' тысяч. Возчики остаются при работе. Сопротивление трубы душит поток: попробуй шире диаметр, ещё насос или подогрей нефть.';
      out.style.color='#f08080';return;
    }
    if(!best||r.c<best)best=r.c;
    if(r.c>90){
      out.innerHTML='⚠️ <b>Норму взял — '+fmt(r.q)+' пудов в сутки, но смета '+r.c+' тыс. руб.</b> Нобели такое не подпишут: труба окупится позже, чем кончится терпение. Тот же поток можно получить дешевле.';
      out.style.color='#e4c97a';return;
    }
    out.innerHTML='✅ <b>Это решение Шухова.</b> Труба три дюйма, одна паровая станция, подогретая нефть — '+fmt(r.q)+' пудов в сутки при смете '+r.c+' тыс. руб. Три тысячи бочек в день стали не нужны, доставка подешевела в разы. В 1878 году так и запустили: Балаханы → Чёрный город, первый в мире нефтепровод, рассчитанный по формулам, а не на глаз.';
    out.style.color='#7ed4a0';
    if(!won){won=true;var pts=tries<=1?20:(tries<=3?15:10);if(typeof award==='function')award('gm_shukhov',pts);}
  };
  draw();
})();
(function(){
  let t=15,ti=null,done=false;
  const correct=1;
  ti=setInterval(()=>{
    if(done)return;
    t--;document.getElementById('gm_quiz2_t').textContent=t;
    if(t<=0){clearInterval(ti);gm_quiz2_ans(-1);}
  },1000);
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
