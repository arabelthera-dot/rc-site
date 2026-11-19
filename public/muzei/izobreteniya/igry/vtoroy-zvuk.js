/* igra-ruka — вид как у образца 29 янв. (ko-hand, rc-site e4f86d74). Подсказка «куда жать» (Р206, 23.10.2026): на шаге одна активная кнопка
   пульсирует, над ней рука «тап-тап», остальные кнопки игры приглушены.
   Вставить В НАЧАЛО скрипта игры как есть. Использование:
     var ruka = igraRuka(root);   // root — секция игры
     ruka.na(knopka);             // показать руку над кнопкой, кнопка пульсирует
     ruka.ubrat();                // убрать (пока идёт анимация / финал)
   Отклик на касание (≤100 мс): класс .igra-zhmyak на pointerdown + navigator.vibrate(20). */
function igraRuka(root) {
  var el = document.createElement('span');
  el.className = 'igra-ruka'; el.setAttribute('aria-hidden', 'true'); el.hidden = true;
  el.innerHTML = '<i class="igra-ruka-krug"></i><svg viewBox="0 0 40 48" width="40" height="48"><path d="M15 4c2.2 0 4 1.8 4 4v13l1.2-.5c1.9-.7 4 .2 4.8 2l.3.7.8-.3c1.9-.6 4 .3 4.7 2.2l.2.5c1.9-.4 3.8.7 4.4 2.5.2.6.3 1.2.3 1.8V36c0 5.5-4.5 10-10 10h-4.6c-3 0-5.8-1.4-7.7-3.7L5.2 33.5c-1.3-1.6-1.1-4 .5-5.3 1.5-1.2 3.7-1.1 5.1.3l.2.2V8c0-2.2 1.8-4 4-4z" fill="#fff" stroke="#1a1206" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  if (getComputedStyle(root).position === 'static') root.style.position = 'relative';
  root.appendChild(el);
  var cel = null;
  function mesto() {
    if (!cel || el.hidden) return;
    var r = cel.getBoundingClientRect(), b = root.getBoundingClientRect();
    el.style.left = Math.round(r.left - b.left + r.width * 0.86) + 'px';
    el.style.top = Math.round(r.top - b.top + r.height * 0.5) + 'px';
  }
  function ubrat() {
    if (cel) cel.classList.remove('igra-aktiv');
    cel = null; el.hidden = true; root.classList.remove('igra-ved');
  }
  function na(knopka) {
    ubrat();
    if (!knopka) return;
    cel = knopka; cel.classList.add('igra-aktiv'); root.classList.add('igra-ved');
    el.hidden = false; mesto();
    requestAnimationFrame(mesto);
  }
  window.addEventListener('resize', mesto);
  if (window.ResizeObserver) new ResizeObserver(mesto).observe(root);
  root.addEventListener('pointerdown', function (e) {
    var k = e.target.closest('button, [role="button"]');
    if (!k || !root.contains(k)) return;
    k.classList.add('igra-zhmyak');
    setTimeout(function () { k.classList.remove('igra-zhmyak'); }, 160);
    if (navigator.vibrate) { try { navigator.vibrate(20); } catch (_) {} }
  });
  root.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  return { na: na, ubrat: ubrat, mesto: mesto };
}

/* Игра «Причаль вручную» (16 января 1969, «Союз-4» и «Союз-5»), r320, Р293. Игрок — Шаталов в «Амуре».
   Палец тянет уплывающий «Байкал» в круг перекрестья (снос идёт всё время, каждое движение — топливо),
   «Тяга»/«Тормоз» — ±0,1 м/с к скорости сближения (тоже топливо). На 30 м — развилка: внизу Африка,
   телесвязи нет; стыковаться сразу или висеть и ждать эфира, пока тает топливо (интервью Б. В. Волынова,
   Роскосмос, 2019). Касание: быстрее 0,3 м/с — удар; вне круга — перекос; топливо 0 — разошлись.
   Время в игре ускорено (TS), снос и расход подобраны так, чтобы наугад не выиграть. */
/* «Услышь второй звук» (22 января, r418): охладить гелий ниже 2,17 К, угадать скорость, поймать волну тепла.
   Трубка 2 м, время замедлено в 40 раз: обычный звук 250 м/с идёт 0,32 с, второй звук 20 м/с (Пешков, 19,6) — 4 с. */
(function(){
  var root=document.querySelector('[data-vz-igra]');if(!root)return;
  var $=function(s){return root.querySelector(s);},$$=function(s){return [].slice.call(root.querySelectorAll(s));};
  var cv=$('canvas'),ctx=cv.getContext('2d'),elT=$('.vz-t'),elZ1=$('.vz-z1'),elZ2=$('.vz-z2'),elTask=$('.vz-task'),elSub=$('.vz-sub');
  var bHolod=$('.vz-holod'),bP=$$('.vz-p'),bImp=$('.vz-impuls'),bLovi=$('.vz-lovi'),fin=$('.vz-finale'),again=$('.vz-again');
  var ruka=igraRuka(root),LAMBDA=2.17,TS=40,DL=2,V1=250,V2=20,OKNO=0.45;
  var W,H,dpr,st,raf=0,tPrev=0,ac=null,puz=[];
  function aw(k,n){try{if(typeof award==='function')award(k,n);}catch(e){}}
  function otklik(){try{if(navigator.vibrate)navigator.vibrate(20);}catch(e){}}
  function ton(f,d,g){if(ac===null){try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){ac=false;}}if(!ac)return;
    try{var o=ac.createOscillator(),v=ac.createGain();o.frequency.value=f;v.gain.value=g||0.08;o.connect(v);v.connect(ac.destination);
      v.gain.exponentialRampToValueAtTime(0.0001,ac.currentTime+d);o.start();o.stop(ac.currentTime+d);}catch(e){}}
  function zadacha(t,s){elTask.innerHTML='<b>Что сделать сейчас:</b> '+t;elSub.textContent=s||'';}
  function pokaz(b,vis){b.hidden=!vis;}
  function razmer(){dpr=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth||320;H=cv.clientHeight||180;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
  function nachat(){st={faza:'holod',T:4.2,why0:0,why1:0,why2:0,imp:-1,popytki:0};fin.hidden=true;
    pokaz(bHolod,true);bP.forEach(function(b){pokaz(b,false);});pokaz(bImp,false);pokaz(bLovi,false);
    elZ1.textContent='—';elZ2.textContent='—';tablo();zadacha('Жми «Охладить»','Гелий при 4,2 К кипит, как вода в чайнике.');ruka.na(bHolod);}
  function tablo(){elT.textContent=st.T.toFixed(2).replace('.',',')+' К';elT.classList.toggle('vz-sverh',st.T<LAMBDA);}
  bHolod.addEventListener('click',function(){if(st.faza!=='holod')return;otklik();st.T=Math.max(1.6,+(st.T-0.3).toFixed(2));tablo();ton(180+st.T*40,0.12,0.05);
    if(st.T<LAMBDA){st.faza='ugadai';st.why0=1;aw('why0',10);pokaz(bHolod,false);bP.forEach(function(b){pokaz(b,true);});
      zadacha('Угадай, как побежит тепло','Кипение вдруг прекратилось: ниже 2,17 К гелий стал сверхтекучим.');ruka.na(bP[1]);}
    else zadacha('Жми «Охладить» дальше','До перехода осталось '+(st.T-LAMBDA).toFixed(2).replace('.',',')+' К.');});
  bP.forEach(function(b){b.addEventListener('click',function(){if(st.faza!=='ugadai')return;otklik();var v=+b.dataset.v;
    if(v===25){st.why1=1;aw('why1',10);}
    st.faza='impuls';bP.forEach(function(x){pokaz(x,false);});pokaz(bImp,true);
    zadacha('Дай тепловой импульс',v===25?'Как Ландау: он вычислил 25 м/с ещё в 1941 году.':'Ландау вычислил иначе — 25 м/с. Проверим опытом.');ruka.na(bImp);});});
  bImp.addEventListener('click',function(){if(st.faza!=='impuls')return;otklik();ton(660,0.08,0.06);st.imp=performance.now();st.zvuk=0;st.popytki++;
    st.faza='volna';pokaz(bImp,false);pokaz(bLovi,true);ruka.ubrat();zadacha('Жми «Поймал!», когда волна коснётся датчика','Сначала пролетит обычный звук — его не лови.');});
  bLovi.addEventListener('click',function(){if(st.faza!=='volna')return;otklik();var t=(performance.now()-st.imp)/1000;
    var nado=DL/V2*TS;var d=t-nado;
    if(Math.abs(d)<=OKNO){st.why2=1;aw('why2',10);ton(220,0.5,0.1);elZ2.textContent='20 м/с';konec();}
    else{st.faza='impuls';pokaz(bLovi,false);pokaz(bImp,true);ruka.na(bImp);
      zadacha('Дай импульс ещё раз',d<0?'Рано: волна тепла ещё в пути — она в десять раз медленнее звука.':'Поздно: волна уже прошла датчик.');}});
  function konec(){st.faza='final';pokaz(bLovi,false);ruka.ubrat();aw('lab',30);
    var n=st.why0+st.why1+st.why2;$('.vz-fin-h').textContent=n===3?'Ты услышал второй звук!':'Волна поймана';
    $('.vz-fin-txt').textContent='Тепло прошло два метра за 0,1 секунды — в десять раз медленнее обычного звука. Ландау предсказал это на бумаге, опыт подтвердил.';
    $('.vz-zvezdy').innerHTML=['гелий стал сверхтекучим','скорость угадана, как у Ландау','волна поймана вовремя'].map(function(s,i){return '<li>'+([st.why0,st.why1,st.why2][i]?'★ ':'☆ ')+s+'</li>';}).join('');
    fin.hidden=false;zadacha('Готово','Прочитай, как было на самом деле.');}
  again.addEventListener('click',function(){otklik();nachat();});
  function kadr(now){raf=requestAnimationFrame(kadr);var dt=Math.min(0.05,(now-(tPrev||now))/1000);tPrev=now;
    var x0=W*0.1,x1=W*0.9,y=H*0.55,h=H*0.32;ctx.fillStyle='#020812';ctx.fillRect(0,0,W,H);
    var sv=st.T<LAMBDA;ctx.fillStyle=sv?'#0d3b5c':'#1a3550';ctx.fillRect(x0,y-h/2,x1-x0,h);
    ctx.strokeStyle='#7f97b2';ctx.lineWidth=2;ctx.strokeRect(x0,y-h/2,x1-x0,h);
    if(!sv){if(puz.length<40&&Math.random()<0.6)puz.push([x0+Math.random()*(x1-x0),y+h/2,2+Math.random()*3]);}
    ctx.fillStyle='rgba(200,225,255,.6)';puz=puz.filter(function(p){p[1]-=dt*60*(0.5+p[2]/4);ctx.beginPath();ctx.arc(p[0],p[1],p[2],0,7);ctx.fill();return p[1]>y-h/2;});
    if(sv){ctx.fillStyle='rgba(127,216,255,.12)';ctx.fillRect(x0,y-h/2,x1-x0,h*0.1);}
    ctx.fillStyle='#c0392b';ctx.fillRect(x0-14,y-h/2,12,h);ctx.fillStyle='#e8eef5';ctx.fillRect(x1+2,y-h/2,12,h);
    ctx.font='600 12px system-ui,sans-serif';ctx.textAlign='center';ctx.fillStyle='#e8eef5';
    ctx.fillText('нагреватель',x0+20,y-h/2-8);ctx.fillText('датчик',x1-10,y-h/2-8);
    ctx.fillText(sv?'сверхтекучий гелий':'гелий кипит',W/2,y+h/2+18);
    if(st.faza==='volna'||st.faza==='final'){var t=(performance.now()-st.imp)/1000,L=x1-x0;
      var p1=t/(DL/V1*TS),p2=t/(DL/V2*TS);
      if(p1<1){ctx.fillStyle='rgba(120,200,255,.9)';ctx.fillRect(x0+L*p1-3,y-h/2,6,h);}
      else if(!st.zvuk){st.zvuk=1;ton(880,0.06,0.05);elZ1.textContent='250 м/с';}
      if(st.faza==='volna'){var px=x0+L*Math.min(p2,1.3);var g=ctx.createLinearGradient(px-50,0,px+8,0);g.addColorStop(0,'rgba(255,120,40,0)');g.addColorStop(1,'rgba(255,150,60,.95)');
        ctx.fillStyle=g;ctx.fillRect(Math.max(x0,px-50),y-h/2,Math.min(58,Math.max(0,x1-(px-50))),h);
        if(p2>1.45){st.faza='impuls';pokaz(bLovi,false);pokaz(bImp,true);ruka.na(bImp);zadacha('Дай импульс ещё раз','Волна прошла датчик — лови раньше.');}}}
  }
  window.addEventListener('resize',razmer);razmer();nachat();raf=requestAnimationFrame(kadr);
})();
