/* Игра 01-14 — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-14.html (scripts/dni-shablon/iz-html.mjs, Р286);
   разметка — src/data/igry/izobreteniya/perehvat.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  /* ── ПЕРЕХВАТ ── погоня по одной оси, холст 400×440, CSS только масштабирует.
     Правила модели — из фактов страницы: полный ход «Лиры» за минуту (здесь 1,2 с), разворот 180° за 42 с (здесь 1,2 с),
     разгон с погружением сбивает со следа, скорость сравнима с торпедой, 22 часа в кормовом секторе.
     Обычная АПЛ отличается только разгоном: перед полным ходом — переход установки на повышенные параметры (здесь 2,5 с). */
  var cv=$('pgCv'), cx=cv.getContext('2d'), W=400, H=440, K=3.2;
  var TAIL0=35, TAIL1=130, FAR=215, TURN=1.2, ETURN=1.6, HOUR=2.6, GOAL=22;
  var TV0=8, TACC=14, TVMAX=50, TLIFE=4.6, TWARN=1, LINK0=0.8, LINK1=0.6;
  var ESPD=[14,22,30,18,34,12,26,20,32,16];
  var mode='lira', g=null, raf=0, last=0, hold=false, seen={};
  var best={}; try{best=JSON.parse(localStorage.getItem('rc-01-14-perehvat')||'{}');}catch(e){}
  function say(t,cls){ var m=$('pgMsg'); m.className='pg-msg'+(cls?' '+cls:''); m.textContent=t; }
  function hint(t){ $('pgHint').textContent=t; }
  function fresh(){ return {t:0,E:0,eD:1,vE:14,eT:14,eTurn:-1,eWarn:-1,nextSpd:4,nextTurn:9,listen:-1,nextListen:6,
    L:-80,lD:1,vL:14,lTurn:-1,c:0,h:0,far:0,tLow:-9,dive:-9,lowArmed:true,heat:0,
    tor:null,torWarn:-1,turnCheck:-1,link:null,pFar:0,pts:0,man:0,end:null,ping:-1,nextPing:5}; }
  function phase(){ return g.h<5?0:g.h<11?1:g.h<16?2:3; }
  function award1(k,p){ if(mode==='lira'&&!seen[k]){ seen[k]=1; if(window.award) award(k,p); } }
  function axial(v,d,tt,T){ return tt<0 ? v*d : v*d*Math.cos(Math.PI*tt/T); }
  function step(dt){
    var s=g, ph=phase(); s.t+=dt;
    /* противник: смена хода, разворот с предупреждением, «слушает» */
    if (s.t>=s.nextSpd){ s.eT=ESPD[Math.floor(s.t/4)%ESPD.length]; s.nextSpd=s.t+(ph>2?3:4); }
    s.vE+=Math.max(-6*dt,Math.min(6*dt,s.eT-s.vE));
    if (ph>=1 && s.eWarn<0 && s.eTurn<0 && s.listen<0 && s.t>=s.nextTurn && !s.tor){ s.eWarn=0; say('Противник разворачивается!'); }
    if (s.eWarn>=0){ s.eWarn+=dt; if (s.eWarn>=1.2){ s.eWarn=-1; s.eTurn=0; } }
    var eAx=axial(s.vE,s.eD,s.eTurn,ETURN);
    if (s.eTurn>=0){ s.eTurn+=dt; if (s.eTurn>=ETURN){ s.eTurn=-1; s.eD=-s.eD; s.turnCheck=s.t; s.nextTurn=s.t+(ph>2?5.5:8); } }
    if (ph>=2 && s.listen<0 && s.eWarn<0 && s.eTurn<0 && s.t>=s.nextListen){ s.listen=0; say('Противник слушает «Лиру»! Сбей его со следа.'); }
    if (s.listen>=0){ s.listen+=dt; if (s.listen>=4){ s.listen=-1; s.nextListen=s.t+(ph>2?6:9); } }
    if (ph>=1 && s.t>=s.nextPing){ s.ping=0; s.nextPing=s.t+11; if (s.eWarn<0&&s.listen<0&&!s.tor) say('Гидролокатор противника: обводы «Лиры» почти не отражают сигнал — контакт почти не растёт.'); }
    if (s.ping>=0){ s.ping+=dt; if (s.ping>1.6) s.ping=-1; }
    /* «Лира»: удержание = полный ход; обычной АПЛ сначала нужен переход установки */
    var want=8;
    if (hold){ if (mode==='lira') want=41; else { s.heat=Math.min(2.5,s.heat+dt); want = s.heat>=2.5 ? 41 : Math.max(want,s.vL); } } else s.heat=Math.max(0,s.heat-dt);
    var acc = mode==='lira' ? 34 : 11;
    s.vL += want>s.vL ? Math.min(acc*dt,want-s.vL) : Math.max(-12*dt,want-s.vL);
    if (s.vL<15){ s.tLow=s.t; s.lowArmed=true; }
    if (s.lowArmed && s.vL>=28 && s.t-s.tLow<=1.8){ s.lowArmed=false; s.dive=s.t; s.c=0; s.man++; s.pts+=5; if (s.listen>=0){ s.listen=-1; s.nextListen=s.t+(phase()>2?6:9); }
      say('Рывок с погружением — противник потерял «Лиру» в шумах. Так её и сбрасывали со следа.','ok'); award1('why1',5); }
    var lAx=axial(s.vL,s.lD,s.lTurn,TURN), pL=s.L;
    if (s.lTurn>=0){ s.lTurn+=dt; if (s.lTurn>=TURN){ s.lTurn=-1; s.lD=-s.lD; } }
    s.E+=eAx*K*dt; s.L+=lAx*K*dt;
    /* разворот вместе с ним: «Лира» обходит противника по своей полосе и к концу его поворота снова за кормой */
    if (s.link){ s.L = s.E + s.link*Math.cos(Math.PI*(s.eWarn>=0 ? 0 : s.eTurn>=0 ? s.eTurn/ETURN : 1)); if (s.eWarn<0&&s.eTurn<0) s.link=null; }
    var d=s.L-s.E, rel=d*s.eD, inTail=rel<=-TAIL0&&rel>=-TAIL1&&s.lD===s.eD&&s.lTurn<0&&s.eTurn<0;
    /* торпеда */
    /* торпеда самонаводящаяся: разгоняется и идёт на «Лиру»; попадание — когда догнала или «Лира» проскочила сквозь неё */
    if (s.torWarn>=0){ s.torWarn+=dt; if (s.torWarn>=TWARN){ s.torWarn=-1; s.tor={T:s.E,dir:d>=0?1:-1,v:TV0,life:0}; } }
    if (s.tor){ var tp=s.tor, r0=pL-tp.T; tp.life+=dt; tp.v=Math.min(TVMAX,tp.v+TACC*dt); tp.dir=r0>=0?1:-1; tp.T+=tp.v*tp.dir*K*dt;
      var r1=s.L-tp.T; if (r0*r1<=0 || Math.abs(r1)<6) return finish('hit');
      if (tp.life>=TLIFE){ s.tor=null; s.c=35; s.man++; s.pts+=5; s.eT=10; s.nextSpd=s.t+6; award1('why2',5);
        say(mode==='lira' ? 'Торпеда выдохлась — «Лира» ушла. Её 41 узел был сравним со скоростью противолодочных торпед. Теперь догоняй!'
          : 'Торпеда выдохлась — повезло: пуск был издалека. Теперь догоняй!','ok'); } }
    else if (s.torWarn<0){
      var dc = s.link ? -10 : Math.abs(d)<28 ? 50 : rel>0 ? 30 : inTail ? (s.listen>=0?30:-10) : -5;
      if (s.ping>=0 && s.ping<dt*1.5) dc+=3/dt;
      if (s.t-s.dive<1.2) dc=Math.min(dc,0);
      s.c=Math.max(0,Math.min(100,s.c+dc*dt));
      if (s.c>=100){ s.torWarn=0; say('Пуск торпеды! Разворачивайся и держи полный ход.','bad'); }
    }
    if (inTail && !s.tor && s.torWarn<0) s.h+=dt/HOUR;
    if (s.turnCheck>=0){ if (inTail){ s.turnCheck=-1; s.man++; s.pts+=5; say('Разворот удался — ты снова у него в хвосте.','ok'); award1('why0',5); }
      else if (s.t-s.turnCheck>6) s.turnCheck=-1; }
    /* отрыв: дистанция больше предела и всё растёт; пока догоняешь — счётчик стоит */
    if (Math.abs(d)<=FAR) s.far=0; else if (!s.tor && s.torWarn<0 && Math.abs(d)>s.pFar) s.far+=dt;
    s.pFar=Math.abs(d);
    if (s.far>=2.5) return finish('lost');
    if (s.h>=GOAL) return finish('win');
    var tD = s.tor ? s.tor.dir : (d>=0?1:-1);
    hint(s.torWarn>=0||s.tor ? (s.lD===tD||s.lTurn>=0 ? 'Уходи от торпеды: держи «Полный ход», не отпускай!' : 'Торпеда! Жми «Разворот» — уходи от неё на полном ходу.')
      : s.eWarn>=0 ? 'Сейчас противник развернётся — заложи свой разворот вовремя.'
      : s.listen>=0 ? 'Отпусти ход, дай скорости упасть, и резко зажми снова — рывок с погружением.'
      : rel>0 ? 'Ты перед носом противника — он тебя слышит! Разворачивайся или отстань.'
      : inTail ? 'Ты в хвосте. Держи скорость противника: зажимай и отпускай ход.'
      : 'Догоняй: зажми «Полный ход», войди в зелёный сектор за кормой.');
  }
  function finish(kind){
    var s=g; s.end=kind; hold=false; setBtns(false); var hh=Math.floor(s.h);
    s.pts+=hh*10; var b=best[mode]||{h:0,p:0}; if (hh>b.h||s.pts>b.p) best[mode]={h:Math.max(hh,b.h),p:Math.max(s.pts,b.p)};
    try{localStorage.setItem('rc-01-14-perehvat',JSON.stringify(best));}catch(e){}
    var who = mode==='lira' ? '«Лира»' : 'Обычная АПЛ';
    var t = kind==='win' ? 'Приказ с берега: прекратить слежение. 22 часа в кормовом секторе! В начале 80-х «Лира» так держалась за атомоходом НАТО — его командир отчаянно пытался оторваться.'
      : kind==='hit' ? 'Торпеда догнала. Скорость «Лиры» — 41 узел — была сравнима со скоростью противолодочных торпед: уйти можно только сразу развернувшись и на полном ходу.'
      : 'Противник оторвался. «Лира» выходила на полный ход за минуту — не жалей разгона и не прозевай его разворот.';
    if (mode==='water') t = (kind==='win'?'Обычная АПЛ продержалась все 22 часа — редкая удача. ':'')+(kind!=='win'?t.split('.')[0]+'. ':'')+'Обычной АПЛ перед полным ходом нужен переход установки на повышенные параметры: рывок не получается, от торпеды почти не уйти.';
    if (kind==='win' && mode==='lira') award('lab',35);
    say(t, kind==='win'?'ok':'bad');
    $('pgRes').textContent=who+': '+hh+' ч из 22, очков '+s.pts+'. Лучшее — «Лира»: '+((best.lira||{}).h||0)+' ч, обычная АПЛ: '+((best.water||{}).h||0)+' ч.';
    hint(mode==='lira' ? 'Сыграй ещё — или выбери «Обычная АПЛ» и сравни.' : 'Сравни с «Лирой»: выбери её и сыграй ещё.');
    $('pgGo').textContent='Ещё раз'; draw();
  }
  function setBtns(run){ $('pgHod').disabled=!run; $('pgRazv').disabled=!run; $('pgGo').hidden=run;
    var ms=document.querySelectorAll('#pg .seg'); for (var i=0;i<ms.length;i++) ms[i].disabled=run; }
  function boat(x,y,ang,col,name,dark){
    cx.save(); cx.translate(x,y); cx.rotate(ang); cx.globalAlpha=dark?0.45:1;
    cx.fillStyle=col; cx.beginPath(); cx.ellipse(0,0,7,24,0,0,6.3); cx.fill(); cx.fillRect(-4,-8,8,10);
    cx.restore(); cx.fillStyle='#c6d8e8'; cx.font='12px Inter, sans-serif'; cx.textAlign='left'; cx.fillText(name,x+14,y+4);
  }
  function draw(){
    var s=g||fresh(), cy=H/2, ex=W/2+28, lx=W/2-28, y=function(p){return cy-(p-s.E);};
    var gr=cx.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#0d2a44'); gr.addColorStop(1,'#081a2c'); cx.fillStyle=gr; cx.fillRect(0,0,W,H);
    cx.strokeStyle='rgba(143,165,185,.13)'; cx.beginPath(); var off=((s.E%40)+40)%40;
    for (var yy=off;yy<H;yy+=40){ cx.moveTo(0,yy); cx.lineTo(W,yy); } cx.stroke();
    if (s.eTurn<0){ var a=cy+s.eD*TAIL0, b=cy+s.eD*TAIL1; cx.fillStyle='rgba(90,190,120,.20)'; cx.fillRect(W/2-70,Math.min(a,b),140,Math.abs(b-a));
      cx.fillStyle='#8fd3a5'; cx.font='12px Inter, sans-serif'; cx.textAlign='center'; cx.fillText('кормовой сектор',W/2,s.eD>0?b+16:b-8);
      cx.fillStyle='rgba(220,90,80,.12)'; cx.fillRect(W/2-70,s.eD>0?0:cy+8,140,cy-8); }
    if (s.ping>=0){ cx.strokeStyle='rgba(200,220,240,'+(0.6-s.ping*0.35)+')'; cx.beginPath(); cx.arc(ex,cy,20+s.ping*180,0,6.3); cx.stroke(); }
    var ea=(s.eD>0?0:Math.PI)+(s.eTurn>=0?Math.PI*s.eTurn/ETURN:0), la=(s.lD>0?0:Math.PI)+(s.lTurn>=0?Math.PI*s.lTurn/TURN:0);
    boat(ex,cy,ea,'#c0453f',s.listen>=0?'противник 🎧':'противник');
    var ly=y(s.L); boat(lx,Math.max(14,Math.min(H-14,ly)),la,mode==='lira'?'#d9e3ec':'#9aa7b4',mode==='lira'?'«Лира»':'обычная АПЛ',s.t-s.dive<1.2);
    if (s.eWarn>=0){ cx.fillStyle='#ffb35c'; cx.font='bold 22px Inter, sans-serif'; cx.textAlign='center'; cx.fillText('↻',ex+40,cy+8); }
    if (s.tor){ var ty=y(s.tor.T); cx.fillStyle='#ff7a6b'; cx.fillRect(lx-2,ty-8,4,16); cx.strokeStyle='rgba(255,122,107,.4)'; cx.beginPath(); cx.moveTo(lx,ty); cx.lineTo(lx,ty-s.tor.dir*40); cx.stroke(); }
    if (mode==='water' && hold && s.heat<2.5){ cx.fillStyle='#ffb35c'; cx.fillRect(lx-24,Math.min(H-30,ly+30),48*s.heat/2.5,5);
      cx.font='11px Inter, sans-serif'; cx.textAlign='center'; cx.fillText('переход установки…',lx,Math.min(H-34,ly+26)); }
    /* приборы */
    cx.fillStyle='rgba(8,20,34,.85)'; cx.fillRect(0,0,W,30); cx.fillStyle='#2a6b45'; cx.fillRect(8,20,(W-16)*Math.min(1,s.h/GOAL),5);
    cx.fillStyle='#e4c97a'; cx.font='bold 14px Inter, sans-serif'; cx.textAlign='left'; cx.fillText('В хвосте: '+Math.floor(s.h)+' ч из 22',8,15);
    cx.textAlign='right'; cx.fillStyle=s.c>70?'#ff7a6b':'#c6d8e8'; cx.fillText('Контакт '+Math.round(s.c)+'%',W-8,15);
    cx.fillStyle='rgba(8,20,34,.85)'; cx.fillRect(0,H-26,W,26); cx.fillStyle='#c6d8e8'; cx.font='13px Inter, sans-serif'; cx.textAlign='left';
    cx.fillText((mode==='lira'?'«Лира» ':'АПЛ ')+Math.round(s.vL)+' уз · противник '+Math.round(s.vE)+' уз',8,H-9);
    if (s.far>0){ cx.textAlign='right'; cx.fillStyle='#ff7a6b'; cx.fillText('контакт теряется',W-8,H-9); }
    if (s.torWarn>=0){ cx.fillStyle='#ff7a6b'; cx.font='bold 20px Inter, sans-serif'; cx.textAlign='center'; cx.fillText('ПУСК ТОРПЕДЫ!',W/2,60); }
  }
  function loop(ts){ if (!g||g.end) return; var dt=last?Math.min(0.05,(ts-last)/1000):0; last=ts; step(dt); if (!g.end){ draw(); raf=requestAnimationFrame(loop); } }
  function start(){ g=fresh(); hold=false; last=0; setBtns(true); $('pgRes').textContent='';
    say(mode==='lira'?'Пуск. Сплав горячий — в базе его держали выше 145 °C, иначе он каменеет в трубах.':'Обычная АПЛ: каждый разгон начинается с перехода установки на повышенные параметры.');
    cancelAnimationFrame(raf); raf=requestAnimationFrame(loop);
    setTimeout(fit,120); }
  function fit(){ var cb=document.querySelector('#pg .pg-ctrl').getBoundingClientRect(), ck=document.querySelector('.rc-cookie'), lim=innerHeight;
    if (ck&&ck.offsetHeight) lim=Math.min(lim,ck.getBoundingClientRect().top);
    if (cb.bottom>lim) scrollBy(0,Math.min(cb.bottom-lim+12,$('pgCv').getBoundingClientRect().top)); }
  function turn(){ if (!g||g.end||g.lTurn>=0) return; g.lTurn=0;
    var d=g.L-g.E, rel=d*g.eD, inWin=(g.eWarn>=LINK0)||(g.eTurn>=0&&g.eTurn<=LINK1);
    if (inWin && g.lD===g.eD && rel<0 && rel>=-TAIL1-20 && !g.tor && g.torWarn<0){ g.link=d; say('Разворот вместе с ним — «Лира» обходит противника и остаётся за кормой.','ok'); } }
  $('pgGo').onclick=start;
  var hb=$('pgHod');
  hb.addEventListener('pointerdown',function(e){ e.preventDefault(); if (hb.setPointerCapture) try{hb.setPointerCapture(e.pointerId);}catch(x){} hold=true; });
  ['pointerup','pointercancel','lostpointercapture'].forEach(function(ev){ hb.addEventListener(ev,function(){ hold=false; }); });
  hb.addEventListener('contextmenu',function(e){ e.preventDefault(); });
  hb.addEventListener('keydown',function(e){ if (e.key==='Enter'){ e.preventDefault(); hold=true; } });
  hb.addEventListener('keyup',function(e){ if (e.key==='Enter') hold=false; });
  $('pgRazv').addEventListener('click',turn);
  document.addEventListener('keydown',function(e){ if (!g||g.end) return;
    if (e.code==='Space'||e.key==='ArrowUp'){ e.preventDefault(); hold=true; }
    else if (e.key==='ArrowDown'||e.key==='r'||e.key==='R'||e.key==='к'||e.key==='К'){ e.preventDefault(); turn(); } });
  document.addEventListener('keyup',function(e){ if (e.code==='Space'||e.key==='ArrowUp') hold=false; });
  var ms=document.querySelectorAll('#pg .seg');
  for (var mi=0;mi<ms.length;mi++) ms[mi].addEventListener('click',function(){ mode=this.getAttribute('data-v');
    for (var j=0;j<ms.length;j++) ms[j].setAttribute('aria-pressed',ms[j]===this?'true':'false');
    $('pgGo').textContent='Пуск'; g=null; draw(); });
  window.__perehvat={get:function(){return g;},hold:function(v){hold=v;},turn:turn,start:start};
  setBtns(false); draw();
})();
