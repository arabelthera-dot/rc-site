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

/* «Спасись с горящего аэростата» (30 января, Котельников, РК-1), r420. Игрок — наблюдатель в корзине на 250 м, 1917 год.
   Пристегнуть лямки РК-1, прыгнуть, пока горящая оболочка не рухнула, дёрнуть кольцо (рано — ветер унесёт к противнику,
   поздно — удар о землю) и дорулить к своим окопам. Счёт — метры до земли при раскрытии. Время ускорено. */
(function(){
  var root=document.querySelector('[data-sa-igra]');if(!root)return;
  var $=function(s){return root.querySelector(s);};
  var cv=$('canvas'),ctx=cv.getContext('2d'),elH=$('.sa-h-m'),elV=$('.sa-v'),elR=$('.sa-rek'),elTask=$('.sa-task'),elSub=$('.sa-sub');
  var bLyam=$('.sa-lyamki'),bPr=$('.sa-pryg'),bKol=$('.sa-kolco'),bL=$('.sa-vlevo'),bP=$('.sa-vpravo'),fin=$('.sa-finale'),again=$('.sa-again'),vyshe=$('.sa-vyshe');
  var ruka=igraRuka(root),V0=28,V1=9,OGON=7;
  var W,H,dpr,st,raf=0,tPrev=0,ac=null,rek=0,uroven=0,iskry=[];
  function aw(k,n){try{if(typeof award==='function')award(k,n);}catch(e){}}
  function otklik(){try{if(navigator.vibrate)navigator.vibrate(20);}catch(e){}}
  function ton(f,d,g){if(ac===null){try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){ac=false;}}if(!ac)return;
    var o=ac.createOscillator(),v=ac.createGain();o.frequency.value=f;v.gain.value=g||0.08;o.connect(v);v.connect(ac.destination);o.start();v.gain.exponentialRampToValueAtTime(0.0001,ac.currentTime+d);o.stop(ac.currentTime+d);}
  function zadacha(t,s){elTask.innerHTML='<b>Что сделать сейчас:</b> '+t;elSub.textContent=s||'';}
  function pokaz(b,v){b.hidden=!v;}
  function razmer(){dpr=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth||320;H=cv.clientHeight||180;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
  function nachat(){var h0=uroven?500:250;st={faza:'korzina',h0:h0,h:h0,x:0,t:0,lyamki:0,why0:0,why1:0,why2:0,hR:0,veter:uroven?5:3,rul:0,itog:''};
    fin.hidden=true;[bL,bP,bKol].forEach(function(b){pokaz(b,false);});pokaz(bLyam,true);pokaz(bPr,true);elR.textContent=rek?rek+' м':'—';
    zadacha('Пристегни лямки ранца','Оболочка над тобой загорелась. До обрушения — секунды.');ruka.na(bLyam);tablo();}
  function tablo(){elH.textContent=Math.max(0,Math.round(st.h))+' м';elV.textContent=st.faza==='kupol'?'купол':st.faza==='padenie'?'падение':'корзина';}
  bLyam.addEventListener('click',function(){if(st.faza!=='korzina'||st.lyamki)return;st.lyamki=1;st.why0=1;aw('why0',10);otklik();ton(520,0.12);
    pokaz(bLyam,false);zadacha('Прыгай за борт!','Лямки застёгнуты. Ранец РК-1 у тебя на спине.');ruka.na(bPr);});
  bPr.addEventListener('click',function(){if(st.faza!=='korzina')return;otklik();
    if(!st.lyamki){proigrysh('Ты прыгнул без лямок — ранец остался в корзине.');return;}
    st.why1=1;aw('why1',10);st.faza='padenie';pokaz(bPr,false);pokaz(bKol,true);ruka.ubrat();
    zadacha('Дёрни кольцо — но не сразу','Рано — ветер унесёт к противнику. Поздно — удар о землю.');});
  bKol.addEventListener('click',function(){if(st.faza!=='padenie')return;otklik();ton(180,0.35,0.12);st.faza='kupol';st.hR=Math.round(st.h);
    if(st.hR<25){proigrysh('Купол раскрылся слишком низко — не успел погасить скорость.');return;}if(st.hR<=st.h0*0.5)st.why2=1;pokaz(bKol,false);pokaz(bL,true);pokaz(bP,true);
    zadacha('Рули к своим окопам — влево','Держи кнопку: тянешь стропы, купол уходит в ту сторону.');});
  function derzh(b,n){var on=function(e){e.preventDefault();st.rul=n;},off=function(){if(st.rul===n)st.rul=0;};
    b.addEventListener('pointerdown',on);['pointerup','pointerleave','pointercancel'].forEach(function(t){b.addEventListener(t,off);});}
  derzh(bL,-1);derzh(bP,1);
  function proigrysh(t){st.faza='final';st.itog=t;[bLyam,bPr,bKol,bL,bP].forEach(function(b){pokaz(b,false);});ruka.ubrat();ton(110,0.6,0.12);
    $('.sa-fin-h').textContent='Не вышло';$('.sa-fin-txt').textContent=t+' Попробуй ещё раз.';pokaz(vyshe,false);zvezdy();fin.hidden=false;}
  function pobeda(){st.faza='final';[bL,bP].forEach(function(b){pokaz(b,false);});ruka.ubrat();aw('lab',30);ton(660,0.5,0.1);
    if(st.hR&&(!rek||st.hR<rek))rek=st.hR;elR.textContent=rek+' м';
    $('.sa-fin-h').textContent='Ты приземлился у своих!';
    $('.sa-fin-txt').textContent='Купол раскрылся на '+st.hR+' м. Так 25 января 1917 года парашют Котельникова начал спасать русских воздухоплавателей.';
    pokaz(vyshe,!uroven);zvezdy();fin.hidden=false;}
  function zvezdy(){$('.sa-zvezdy').innerHTML=[[st.why0,'лямки застёгнуты'],[st.why1,'прыгнул до обрушения'],[st.why2,'тянул до последнего — раскрыл ниже половины высоты']]
    .map(function(z){return '<li>'+(z[0]?'★':'☆')+' '+z[1]+'</li>';}).join('');}
  again.addEventListener('click',nachat);vyshe.addEventListener('click',function(){uroven=1;nachat();});
  function shag(dt){if(st.faza==='final')return;st.t+=dt;
    if(st.faza==='korzina'){if(st.t>OGON)proigrysh('Горящая оболочка рухнула на корзину.');return;}
    if(st.faza==='padenie'){st.h-=V0*dt;st.x+=st.veter*0.3*dt;if(st.h<=0){st.h=0;proigrysh('Кольцо не дёрнуто вовремя — удар о землю.');}return;}
    if(st.faza==='kupol'){st.h-=V1*dt;st.x+=(st.veter*(1+st.h/100)-st.rul*(7+uroven*4))*dt;
      if(st.h<=0){st.h=0;if(st.x< -12)pobeda();else if(st.x>12)proigrysh('Ветер унёс купол за линию фронта.');else proigrysh('Ты сел на нейтральную полосу, под огонь.');}}}
  function risui(){var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a3f63');g.addColorStop(1,'#a9b9c9');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    var cy=H*0.42,k=H*0.5/80,zy=cy+st.h*k,cx=W/2,mx=W/90,px=cx+st.x*mx;
    if(zy<H+20){ctx.fillStyle='#4d5a32';ctx.fillRect(0,zy,W,H-zy+40);ctx.fillStyle='#2f7d3a';ctx.fillRect(0,zy,cx-12*mx,6);ctx.fillStyle='#8a2a22';ctx.fillRect(cx+12*mx,zy,W,6);
      ctx.fillStyle='#fff';ctx.font='12px system-ui,sans-serif';ctx.fillText('свои окопы',6,Math.min(H-6,zy+20));ctx.fillText('противник',W-70,Math.min(H-6,zy+20));}
    if(st.faza==='korzina'||st.t<2){var by=st.faza==='korzina'?cy-60:cy-60-(st.h0-st.h)*k*3,p=Math.min(1,st.t/OGON);
      ctx.fillStyle='#c9b48a';ctx.beginPath();ctx.ellipse(cx,by,46,26,0,0,7);ctx.fill();ctx.fillStyle='#6b4a2a';ctx.fillRect(cx-10,by+40,20,14);
      ctx.strokeStyle='#6b4a2a';ctx.beginPath();ctx.moveTo(cx-30,by+16);ctx.lineTo(cx-10,by+40);ctx.moveTo(cx+30,by+16);ctx.lineTo(cx+10,by+40);ctx.stroke();
      if(st.faza==='korzina')for(var i=0;i<3+p*10;i++)iskry.push({x:cx-40+Math.random()*80*p+(1-p)*30,y:by-10,vy:-20-Math.random()*30,z:1});
      var pl=W*(1.1-p);ctx.fillStyle='#222';ctx.fillRect(pl,by-50,28,4);ctx.fillRect(pl+10,by-56,6,16);}
    iskry=iskry.filter(function(s){s.y+=s.vy*0.016;s.z-=0.03;if(s.z<=0)return false;ctx.fillStyle='rgba(255,'+(120+(s.z*100|0))+',40,'+s.z+')';ctx.fillRect(s.x,s.y,4,4);return true;});
    if(st.faza!=='korzina'){var y=cy;if(st.faza==='kupol'||(st.faza==='final'&&st.hR)){ctx.fillStyle='#f2efe6';ctx.beginPath();ctx.arc(px,y-44,30,Math.PI,0);ctx.fill();
        ctx.strokeStyle='#ddd';ctx.beginPath();ctx.moveTo(px-30,y-44);ctx.lineTo(px,y);ctx.moveTo(px+30,y-44);ctx.lineTo(px,y);ctx.stroke();}
      if(st.h>0||st.faza!=='final'){ctx.fillStyle='#1b2430';ctx.fillRect(px-4,Math.min(y,zy-14),8,14);ctx.beginPath();ctx.arc(px,Math.min(y,zy-14)-4,4,0,7);ctx.fill();}}
    var bh=H-20,f=Math.max(0,st.h)/st.h0;ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(W-14,10,6,bh);ctx.fillStyle='#ffd27a';ctx.fillRect(W-14,10+bh*(1-f),6,bh*f);}
  function kadr(now){raf=requestAnimationFrame(kadr);var dt=Math.min(0.05,(now-(tPrev||now))/1000);tPrev=now;shag(dt);tablo();risui();}
  window.addEventListener('resize',razmer);razmer();nachat();raf=requestAnimationFrame(kadr);
})();
