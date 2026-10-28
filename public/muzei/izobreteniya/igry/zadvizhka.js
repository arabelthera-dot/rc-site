/* Игра 01-21 «Открой задвижку» — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-21.html (Р302, r406);
   разметка — src/data/igry/izobreteniya/zadvizhka.html, вид — assets/igra-zadvizhka.css. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  /* ── ОТКРОЙ ЗАДВИЖКУ ── слева EBR-I: ключ → 4 лампочки, провод упирается в стену.
     Справа Обнинск: штурвал (два оборота) → пар, турбина, ток за стену станции — опоры, улица, завод, за край экрана.
     Счёт лампочек 200 Вт: 5 на киловатт — EBR-I 200 кВт = 1000, Обнинск 5000 кВт = 25 000. Текста на рисунке нет. */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W=640, H=300, TURN=720, RU_LAMPS=25000;
  function prep(id){ var cv=$(id), c=cv.getContext('2d'); cv.width=W*2; cv.height=H*2; c.scale(2,2); return c; }
  var cu=prep('cvUS'), cr=prep('cvRU');
  var keyOn=false, keyT=0, acc=0, openS=0, front=0, rot=0, t0=0, done=false, flash=0, toastShown=false;
  var puffs=[], seed=21;
  function rnd(){ seed=(seed*16807)%2147483647; return seed/2147483647; }
  function glow(c,x,y,r,col,a){ var g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,'rgba('+col+','+a+')'); g.addColorStop(1,'rgba('+col+',0)'); c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }
  function bulb(c,x,y,on,fl){
    if (on) glow(c,x,y,46,'255,214,120',0.55*fl);
    c.fillStyle=on?'rgba(255,236,170,'+(0.35+0.65*fl)+')':'#2a3442'; c.beginPath(); c.arc(x,y,11,0,Math.PI*2); c.fill();
    c.fillStyle='#7f8a98'; c.fillRect(x-5,y+9,10,8);
  }
  /* слева — запертая комната */
  var US_B=[[262,96],[322,96],[382,96],[442,96]];
  function drawUS(now){
    var c=cu, k=keyOn?Math.min(1,keyT):0, fl=k<1?(0.4+0.6*Math.abs(Math.sin(k*18))):1;
    c.fillStyle='#04070d'; c.fillRect(0,0,W,H);
    c.fillStyle='#0a111c'; c.fillRect(24,24,W-48,H-48);
    if (k>0) glow(c,352,110,260,'255,200,110',0.16*k);
    c.strokeStyle='#26334a'; c.lineWidth=16; c.strokeRect(16,16,W-32,H-32);
    c.fillStyle='#1d2a3c'; for (var i=0;i<13;i++){ c.fillRect(40+i*46,H-34,30,3); }
    // реактор
    c.fillStyle='#1b2738'; c.fillRect(52,150,96,104); c.fillStyle='#26364d'; c.fillRect(64,162,72,80);
    if (k>0) glow(c,100,202,44,'120,200,255',0.7*k);
    // провод: реактор → щит → стена
    var path=[[148,180],[200,180],[200,120],[480,120],[480,180],[600,180]];
    c.lineWidth=4; c.strokeStyle=k>0?'#ffcf66':'#3a4656'; c.beginPath(); c.moveTo(path[0][0],path[0][1]);
    for (i=1;i<path.length;i++) c.lineTo(path[i][0],path[i][1]); c.stroke();
    // щит
    c.fillStyle='#152031'; c.fillRect(232,66,240,62); c.strokeStyle='#2c3b52'; c.lineWidth=2; c.strokeRect(232,66,240,62);
    US_B.forEach(function(b){ bulb(c,b[0],b[1],k>0,fl); });
    // тупик у стены: заглушка, ток бьётся и возвращается
    c.fillStyle='#8a3b34'; c.fillRect(596,166,14,28);
    if (k>=1){ var p=(now/900)%1, x=480+p*116; glow(c,x,180,14,'255,220,140',0.9*(1-p)); glow(c,600,180,26,'255,90,70',0.35+0.25*Math.sin(now/180)); }
  }
  /* справа — станция и сеть */
  var POLES=[236,306,376,446,516,586,656], HOUSES=[], FACT={x:452,y:166,w:104,h:84};
  (function(){ var hx=252; [[34,52],[30,70],[38,44],[30,60]].forEach(function(d){ var wins=[];
    for (var r=0;r<Math.floor(d[1]/16);r++) for (var cc=0;cc<Math.floor(d[0]/12);cc++) wins.push([hx+5+cc*12, 250-d[1]+6+r*16]);
    HOUSES.push({x:hx,w:d[0],h:d[1],wins:wins}); hx+=d[0]+16; }); })();
  function wireY(x){ var i=0; while (i<POLES.length-1 && POLES[i+1]<x) i++; var a=i===0&&x<POLES[0]?196:POLES[i], b=i===0&&x<POLES[0]?POLES[0]:POLES[i+1], t=(x-a)/(b-a); return 112+Math.sin(Math.PI*Math.max(0,Math.min(1,t)))*12; }
  function drawRU(now,dt){
    var c=cr, o=openS;
    var sky=c.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#050a16'); sky.addColorStop(1,'#0d1a2c'); c.fillStyle=sky; c.fillRect(0,0,W,H);
    if (o>0.02) glow(c,Math.min(front,W),250,240,'255,200,110',0.12*o);
    c.fillStyle='#16110b'; c.fillRect(0,250,W,H-250);
    // здание станции
    c.fillStyle='#152235'; c.fillRect(10,92,186,158); c.fillStyle='#1d2d44'; c.fillRect(10,84,186,10);
    c.fillStyle='#0b1422'; c.fillRect(22,104,162,140);
    // реактор и паропровод
    c.fillStyle='#22324a'; c.fillRect(30,170,46,70); glow(c,53,205,30,'120,200,255',0.35+0.5*o);
    c.lineWidth=8; c.strokeStyle=o>0?'#c9d6e6':'#33445c'; c.beginPath(); c.moveTo(76,186); c.lineTo(104,186); c.lineTo(104,176); c.stroke();
    // пар в трубе
    if (o>0){ for (var s=0;s<3;s++){ var px=76+((now/ (520-400*o) +s/3)%1)*28; c.fillStyle='rgba(255,255,255,'+(0.5*o)+')'; c.beginPath(); c.arc(px,186,3,0,Math.PI*2); c.fill(); } }
    // турбина
    rot+=dt*0.02*o*o*1.6+dt*0.004*o; var tx=140, ty=196;
    c.fillStyle='#1b2a40'; c.beginPath(); c.arc(tx,ty,32,0,Math.PI*2); c.fill();
    c.save(); c.translate(tx,ty); c.rotate(rot); c.strokeStyle=o>0?'#ffd36b':'#55657c'; c.lineWidth=5;
    for (var b=0;b<6;b++){ c.rotate(Math.PI/3); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(14,-6,26,0); c.stroke(); } c.restore();
    c.fillStyle='#0b1422'; c.beginPath(); c.arc(tx,ty,6,0,Math.PI*2); c.fill();
    // клубы пара над крышей
    if (o>0.01 && Math.random()<o*dt/40) puffs.push({x:52+Math.random()*10,y:82,r:5,a:0.55});
    puffs.forEach(function(p){ p.y-=dt*0.03; p.x+=dt*0.008; p.r+=dt*0.012; p.a-=dt*0.0005; });
    puffs=puffs.filter(function(p){ return p.a>0; });
    puffs.forEach(function(p){ c.fillStyle='rgba(230,238,248,'+p.a+')'; c.beginPath(); c.arc(p.x,p.y,p.r,0,Math.PI*2); c.fill(); });
    // провод за стену
    var lit=front>196;
    c.lineWidth=3; c.strokeStyle='#3a4656'; c.beginPath(); c.moveTo(196,112);
    for (var x=196;x<=W;x+=4) c.lineTo(x,wireY(x)); c.stroke();
    if (lit){ c.strokeStyle='#ffcf66'; c.lineWidth=3; c.save(); c.shadowColor='#ffb300'; c.shadowBlur=10; c.beginPath(); c.moveTo(196,112);
      for (x=196;x<=Math.min(front,W);x+=4) c.lineTo(x,wireY(x)); c.stroke(); c.restore();
      for (var k=0;k<6;k++){ var q=((now/1400)+k/6)%1, qx=196+q*(Math.min(front,W+40)-196); if (qx<=W) glow(c,qx,wireY(qx),10,'255,236,170',0.95); }
    }
    // опоры с фонарями
    POLES.forEach(function(px){ if (px>W) return; var on=front>px;
      c.fillStyle='#2b384b'; c.fillRect(px-2,112,4,138); c.fillRect(px-12,110,24,4);
      if (on){ glow(c,px,236,40,'255,214,120',0.45); }
      c.fillStyle=on?'#ffe9a8':'#2a3442'; c.beginPath(); c.arc(px+10,128,4,0,Math.PI*2); c.fill();
      if (on) glow(c,px+10,128,16,'255,214,120',0.8); });
    // улица
    HOUSES.forEach(function(hs){ c.fillStyle='#101b2b'; c.fillRect(hs.x,250-hs.h,hs.w,hs.h);
      var on=front>hs.x+hs.w/2; hs.wins.forEach(function(w,i){ c.fillStyle=on&&((i*7)%5!==0||front>hs.x+60)?'#ffd36b':'#1d2838'; c.fillRect(w[0],w[1],6,8); }); });
    // завод
    c.fillStyle='#111d2e'; c.fillRect(FACT.x,FACT.y,FACT.w,FACT.h); c.fillRect(FACT.x+78,FACT.y-46,14,48);
    var fon=front>FACT.x+FACT.w/2;
    for (var i=0;i<4;i++){ c.fillStyle=fon?'#ffe08a':'#1d2838'; c.fillRect(FACT.x+8+i*24,FACT.y+18,16,26); }
    if (fon){ glow(c,FACT.x+52,FACT.y+30,70,'255,214,120',0.3); for (i=0;i<3;i++){ var sy=FACT.y-50-((now/30+i*20)%60); c.fillStyle='rgba(200,210,225,'+(0.3*(1-((now/30+i*20)%60)/60))+')'; c.beginPath(); c.arc(FACT.x+85,sy,6+((now/30+i*20)%60)/8,0,Math.PI*2); c.fill(); } }
    // за край экрана — в сеть
    if (front>W){ var g=c.createLinearGradient(W-90,0,W,0); g.addColorStop(0,'rgba(255,214,120,0)'); g.addColorStop(1,'rgba(255,214,120,'+(0.22+0.1*Math.sin(now/300))+')'); c.fillStyle=g; c.fillRect(W-90,0,90,H); }
    if (flash>0){ c.fillStyle='rgba(255,245,210,'+(flash*0.7)+')'; c.fillRect(0,0,W,H); }
  }
  function fmt(n){ return Math.round(n).toLocaleString('ru-RU'); }
  function msg(t){ $('zvMsg').textContent=t; }
  var stage=0;
  function story(){
    var o=acc/TURN, s;
    if (done) s=4; else if (o>=0.5) s=3; else if (o>=0.15) s=2; else if (o>0) s=1; else s=0;
    if (s===stage && s!==0) return; stage=s;
    if (s===0) msg(keyOn?'Четыре лампочки горят — и провод упирается в стену. Дальше лаборатории этот ток не пошёл. Теперь справа: крути штурвал задвижки по часовой стрелке.':'Начни слева: поверни ключ американского реактора.');
    if (s===1) msg('Пар пошёл на турбину — она трогается. Крути дальше.');
    if (s===2) msg('Турбина набирает обороты, ток вышел за стену станции. Загораются опоры — крути дальше.');
    if (s===3) msg('Улица в огнях. Ещё немного — до завода и дальше, в общую сеть.');
    if (s===4) msg('Ток ушёл за край экрана — в общую сеть. А слева так и горят четыре лампочки в запертой комнате.');
  }
  function setAcc(v){
    acc=Math.max(0,Math.min(TURN,v));
    $('zvWheelRot').style.transform='rotate('+acc+'deg)';
    var pct=Math.round(acc/TURN*100), wh=$('zvWheel');
    wh.setAttribute('aria-valuenow',pct); wh.setAttribute('aria-valuetext',pct?'задвижка открыта на '+pct+'%':'задвижка закрыта');
    if (acc>=TURN && !done){ done=true; if(!reduce) flash=1; award('zadvizhka',30);
      var f=$('zvFinal'); f.hidden=false; requestAnimationFrame(function(){ f.classList.add('on'); }); }
    story(); kick();
  }
  function turnKey(){
    if (keyOn) return; keyOn=true; keyT=reduce?1:0;
    $('zvKey').classList.add('on'); $('zvKey').setAttribute('aria-pressed','true'); award('kluch',5);
    stage=-1; story(); kick();
  }
  $('zvKey').onclick=turnKey;
  // штурвал: крути пальцем по кругу; короткий тап — четверть оборота
  var wh=$('zvWheel'), drag=null, tween=null;
  function ang(e){ var r=wh.getBoundingClientRect(); return Math.atan2(e.clientY-(r.top+r.height/2), e.clientX-(r.left+r.width/2))*180/Math.PI; }
  wh.addEventListener('pointerdown', function(e){ e.preventDefault(); wh.setPointerCapture(e.pointerId); drag={a:ang(e),sum:0}; tween=null; });
  wh.addEventListener('pointermove', function(e){ if(!drag) return; var a=ang(e), d=a-drag.a; if(d>180)d-=360; if(d<-180)d+=360; drag.a=a; drag.sum+=Math.abs(d); setAcc(acc+d); });
  function up(){ if(!drag) return; var tap=drag.sum<8; drag=null; if(tap) nudge(90); }
  wh.addEventListener('pointerup', up); wh.addEventListener('pointercancel', function(){ drag=null; });
  function nudge(d){ if (reduce){ setAcc(acc+d); return; } tween={from:acc,to:Math.min(TURN,acc+d),t:0}; kick(); }
  wh.addEventListener('keydown', function(e){
    if (['ArrowRight','ArrowUp','Enter',' '].indexOf(e.key)>=0){ e.preventDefault(); nudge(45); }
    else if (e.key==='ArrowLeft'||e.key==='ArrowDown'){ e.preventDefault(); setAcc(acc-45); } });
  $('zvReset').onclick=function(){ keyOn=false; keyT=0; done=false; flash=0; tween=null; stage=-1;
    $('zvKey').classList.remove('on'); $('zvKey').setAttribute('aria-pressed','false');
    var f=$('zvFinal'); f.classList.remove('on'); f.hidden=true; setAcc(0);
    msg('Всё сначала. Уже полученные баллы сохраняются и повторно не начисляются.'); };
  // цикл: крутится, пока лаборатория на экране
  var running=false, visible=true, last=0;
  function loop(now){
    var dt=last?Math.min(50,now-last):16; last=now;
    if (tween){ tween.t=Math.min(1,tween.t+dt/420); var e=1-Math.pow(1-tween.t,3); setAcc(tween.from+(tween.to-tween.from)*e); if (tween&&tween.t>=1) tween=null; }
    if (keyOn && keyT<1) keyT=Math.min(1,keyT+dt/900);
    var o=acc/TURN; openS+= reduce?(o-openS):(o-openS)*Math.min(1,dt/260);
    var fT=o>=1?W+400:196+o*(W+40-196); front+= reduce?(fT-front):(fT-front)*Math.min(1,dt/500);
    if (flash>0) flash=Math.max(0,flash-dt/700);
    $('usLamps').textContent=keyOn?'4':'0';
    $('ruLamps').textContent=fmt(RU_LAMPS*Math.min(1,openS/0.999));
    $('zvOpen').style.width=(o*100)+'%';
    drawUS(now); drawRU(now,dt);
    if (visible){ requestAnimationFrame(loop); } else { running=false; last=0; }
  }
  function kick(){ if (!running){ running=true; requestAnimationFrame(loop); } }
  if ('IntersectionObserver' in window){ new IntersectionObserver(function(en){ visible=en[0].isIntersecting; if (visible) kick(); }).observe($('zvLab')); }
  kick();
})();
