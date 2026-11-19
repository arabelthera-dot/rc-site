/* Игра 01-18 (арифмометр под полкой) — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-18.html (Р302);
   разметка — src/data/igry/izobreteniya/polka-odnera.html; полка — ../../assets/odner-polka.js (карточка, skripty). Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  function msg(t, cls){ var m=$('arMsg'); m.className='lab-msg'+(cls?' '+cls:''); m.textContent=t; }

  /* ── АРИФМОМЕТР ── три колеса Однера (сотни, десятки, единицы); каретка 0 = единицы, 1 = десятки.
     Оборот вперёд прибавляет набранное × 10^каретка, назад — вычитает; уход в минус — звонок, как у «Феликса». */
  var lev=[0,0,0], acc=0, car=0, turns=0, ring=0, TARGET=147, GOAL=3381;
  var cw=$('cvWheel'), wc=cw.getContext('2d'), cc=$('cvCount'), ctx=cc.getContext('2d');
  function setNum(){ return lev[0]*100+lev[1]*10+lev[2]; }
  function drawWheels(){
    var w=cw.width, h=cw.height; wc.fillStyle='#f3ecd9'; wc.fillRect(0,0,w,h);
    var names=['сотни','десятки','единицы'];
    for (var k=0;k<3;k++){
      var cx=55+k*95, cy=140, r=34;
      wc.fillStyle='#1d1d1d'; wc.beginPath(); wc.arc(cx,cy,r,0,Math.PI*2); wc.fill();
      for (var i=0;i<9;i++){
        var a=-Math.PI/2+i*(Math.PI*2/12), out=i<lev[k], len=out?16:4;
        var x1=cx+Math.cos(a)*(r-2), y1=cy+Math.sin(a)*(r-2), x2=cx+Math.cos(a)*(r+len), y2=cy+Math.sin(a)*(r+len);
        wc.strokeStyle=out?'#c9a84c':'#555'; wc.lineWidth=out?7:5; wc.lineCap='butt';
        wc.beginPath(); wc.moveTo(x1,y1); wc.lineTo(x2,y2); wc.stroke();
      }
      wc.fillStyle='#f3ecd9'; wc.font='bold 26px sans-serif'; wc.textAlign='center'; wc.fillText(String(lev[k]),cx,cy+9);
      wc.fillStyle='#333'; wc.font='12px sans-serif'; wc.fillText(names[k],cx,cy+70);
    }
    wc.fillStyle='#333'; wc.font='13px sans-serif'; wc.textAlign='center';
    wc.fillText('золотые зубцы выдвинуты рычажком',w/2,30);
    $('setTxt').textContent=String(setNum()).padStart(3,'0');
  }
  function drawCounter(){
    var w=cc.width, h=cc.height; ctx.fillStyle=ring>0?'#5a1d14':'#16120c'; ctx.fillRect(0,0,w,h);
    var s=String(Math.max(acc,0)).padStart(6,'0');
    ctx.textAlign='center';
    for (var i=0;i<6;i++){
      var x=40+i*44; ctx.fillStyle='#f3ecd9'; ctx.fillRect(x-17,80,34,46);
      ctx.fillStyle='#1d1d1d'; ctx.font='bold 28px sans-serif'; ctx.fillText(s[i],x,113);
    }
    ctx.fillStyle='#c9a84c'; ctx.font='13px sans-serif';
    ctx.fillText('каретка: '+(car? 'десятки' : 'единицы'),w/2,170);
    ctx.fillText('оборотов ручки: '+turns,w/2,195);
    if (ring>0){ ctx.fillStyle='#ffd27a'; ctx.font='bold 24px sans-serif'; ctx.fillText('ДЗЫНЬ!',w/2,50); ring--; }
    $('cntTxt').textContent=acc+', оборотов '+turns;
  }
  function redraw(){ drawWheels(); drawCounter(); }
  document.querySelectorAll('[data-lev]').forEach(function(b){
    b.onclick=function(){
      var k=+b.dataset.lev; lev[k]=(lev[k]+1)%10; redraw();
      if (setNum()===TARGET){ award('nabor',5); msg('Набрано 147. Видишь: из колёс выдвинуто 1, 4 и 7 зубцов. Теперь крути ручку вперёд — три раза.','ok'); }
      else msg('Набрано '+setNum()+'. Нужно 147: сотни — 1, десятки — 4, единицы — 7.');
    };
  });
  $('levClear').onclick=function(){ lev=[0,0,0]; redraw(); msg('Рычажки в нуле, зубцы спрятаны.'); };
  $('turnPlus').onclick=function(){
    if (!setNum()){ msg('Сначала набери число рычажками.','bad'); return; }
    acc+=setNum()*(car?10:1); turns++; redraw(); if (window.odnerTik) window.odnerTik();
    if (acc===GOAL && setNum()===TARGET){ award('umnozh',15);
      msg('3381 рубль — и всего '+turns+' оборотов ручки вместо 23 сложений. Так считали почти сто лет — с 1890-го до 1978-го.','ok'); }
    else if (setNum()===TARGET && !car && acc===TARGET*3) msg('Три оборота — в счётчике 441. Теперь сдвинь каретку на разряд.');
    else msg('Оборот! В счётчике '+acc+'.');
  };
  $('turnMinus').onclick=function(){
    if (!setNum()){ msg('Сначала набери число рычажками.','bad'); return; }
    var v=acc-setNum()*(car?10:1); turns++;
    if (v<0){ ring=40; if (window.odnerZvon) window.odnerZvon(); msg('Дзынь! Ушёл в минус — у настоящего «Феликса» в этот миг звенит звонок. Крути ручку вперёд, чтобы вернуться.','bad');
      acc=v; tick(); return; }
    acc=v; redraw(); msg('Вычтено. В счётчике '+acc+'.');
  };
  function tick(){ drawCounter(); $('cntTxt').textContent=acc+', оборотов '+turns; if (ring>0) requestAnimationFrame(tick); }
  $('shiftCar').onclick=function(){ car=car?0:1; redraw();
    msg(car?'Каретка сдвинута: теперь каждый оборот прибавляет число, умноженное на 10. Крути ещё два раза.':'Каретка вернулась на единицы.'); };
  $('arReset').onclick=function(){ lev=[0,0,0]; acc=0; car=0; turns=0; ring=0; redraw();
    msg('Начато заново. Уже полученные баллы сохраняются и повторно не начисляются.'); };
  redraw();
})();
