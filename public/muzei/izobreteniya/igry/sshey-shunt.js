/* Игра 01-07 «Сшей шунт» — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-07.html (Р286);
   разметка — src/data/igry/izobreteniya/sshey-shunt.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  function msg(t, cls){ var m=$('shuntMsg'); m.className='lab-msg'+(cls?' '+cls:''); m.textContent=t; }
  function seychas(t){ $('shuntSeychas').textContent=t; }

  /* ── ЭКГ ── восемь «минут» пережатия = восемь секунд; ритм ровный: сердце выдержало (протокол 1964). */
  var ekg = $('cvEkg'), ec = ekg.getContext('2d'), clampT = -1, clampOk = false, raf = 0;
  function ekgDraw(t){
    var w=ekg.width, h=ekg.height; ec.fillStyle='#0b1a12'; ec.fillRect(0,0,w,h);
    ec.strokeStyle='rgba(80,160,110,.25)'; ec.lineWidth=1;
    for (var x=0;x<w;x+=20){ec.beginPath();ec.moveTo(x,0);ec.lineTo(x,h);ec.stroke();}
    for (var y=0;y<h;y+=20){ec.beginPath();ec.moveTo(0,y);ec.lineTo(w,y);ec.stroke();}
    ec.strokeStyle='#5fe08a'; ec.lineWidth=2; ec.beginPath();
    for (var i=0;i<=w;i++){
      var ph=((i+t*120)%75)/75, v=0;
      if (ph>.30&&ph<.34) v=-8; else if (ph>.36&&ph<.39) v=70*(1-Math.abs(ph-.375)/.015); else if (ph>.39&&ph<.42) v=-14; else if (ph>.55&&ph<.68) v=12*Math.sin((ph-.55)/.13*Math.PI);
      var yy=h/2-v; if(i===0) ec.moveTo(i,yy); else ec.lineTo(i,yy);
    }
    ec.stroke();
  }

  /* ── СЕРДЦЕ ── холст 300×300; точки шва вокруг места соединения ниже сужения качаются с пульсом. */
  var cv = $('cvHeart'), c = cv.getContext('2d'), N = 8, done = [], flow = false, t0 = performance.now();
  var J = {x:112, y:200};
  function beat(t){ return 1+0.035*Math.max(0,Math.sin(t*7.5)); }
  function pts(t){
    var k=beat(t), r=[], i;
    for (i=0;i<N;i++){ var a=i/N*Math.PI*2; r.push({x:150+(J.x+Math.cos(a)*15-150)*k, y:170+(J.y+Math.sin(a)*15-170)*k}); }
    return r;
  }
  function heart(t){
    var w=cv.width, h=cv.height, k=beat(t);
    c.fillStyle='#f3ecd9'; c.fillRect(0,0,w,h);
    c.save(); c.translate(150,170); c.scale(k,k); c.translate(-150,-170);
    c.fillStyle='#b5473a'; c.beginPath(); c.ellipse(150,180,95,100,-0.35,0,Math.PI*2); c.fill();
    c.strokeStyle='#e9c7a8'; c.lineWidth=7; c.lineCap='round';
    c.beginPath(); c.moveTo(165,85); c.quadraticCurveTo(110,120,105,175); c.quadraticCurveTo(100,230,130,265); c.stroke();
    c.strokeStyle='#5a2a24'; c.lineWidth=9; c.beginPath(); c.moveTo(116,140); c.lineTo(110,158); c.stroke();
    c.restore();
    c.strokeStyle='#d9543f'; c.lineWidth=6; c.beginPath(); c.moveTo(20,20); c.quadraticCurveTo(70,90,J.x-2,J.y-14); c.stroke();
    c.fillStyle='#333'; c.font='12px sans-serif'; c.fillText('грудная артерия',8,14); c.fillText('сужение',150,148);
    pts(t).forEach(function(p,i){
      c.beginPath(); c.arc(p.x,p.y,done[i]?3:6,0,Math.PI*2);
      c.fillStyle=done[i]?'#1d1d1d':'rgba(201,168,76,.95)'; c.fill();
      if(!done[i]&&clampOk){c.strokeStyle='#7a5a10';c.lineWidth=1.5;c.stroke();}
    });
    if (flow){
      c.fillStyle='#ff2d2d';
      for (var d=0; d<6; d++){
        var u=((t*0.6)+d/6)%1, x=(1-u)*(1-u)*20+2*(1-u)*u*70+u*u*(J.x-2), y=(1-u)*(1-u)*20+2*(1-u)*u*90+u*u*(J.y-14);
        c.beginPath(); c.arc(x,y,4,0,Math.PI*2); c.fill();
      }
    }
  }
  function loop(now){
    var t=(now-t0)/1000;
    if (clampT>=0 && !clampOk){
      var m=Math.min(8,Math.floor((now-clampT)/1000)+1); $('ekgTxt').textContent='пережатие, минута '+m+' из 8';
      if (now-clampT>=8000){ clampOk=true; award('ekg',10); $('ekgTxt').textContent='8 минут, ритм ровный';
        $('shovTxt').textContent='стежков 0 из '+N; msg('Сердце выдержало. Вскрывай артерию и шей: нажимай на золотые точки — они движутся вместе с сердцем.','ok');
        seychas('нажимай на золотые точки на сердце справа, все 8.'); }
    }
    ekgDraw(t); heart(t); raf=requestAnimationFrame(loop);
  }
  $('clampGo').onclick = function(){
    if (clampT>=0) return; clampT=performance.now(); this.disabled=true;
    msg('Артерия пережата. Смотри на кардиограмму: если ритм собьётся, вскрывать нельзя.');
    seychas('подожди 8 секунд и смотри на кардиограмму слева.');
  };
  cv.addEventListener('click', function(e){
    if (!clampOk || flow) { if(!clampOk) msg('Сначала пережми артерию и проверь ЭКГ — так сделал Колесов.','bad'); return; }
    var r=cv.getBoundingClientRect(), x=(e.clientX-r.left)*cv.width/r.width, y=(e.clientY-r.top)*cv.height/r.height;
    var P=pts((performance.now()-t0)/1000), hit=-1;
    P.forEach(function(p,i){ if(!done[i] && Math.hypot(p.x-x,p.y-y)<13) hit=i; });
    if (hit<0){ msg('Мимо: сердце бьётся, лови точку в такт.'); return; }
    done[hit]=true; var n=done.filter(Boolean).length; $('shovTxt').textContent='стежков '+n+' из '+N;
    if (n===N){ flow=true; award('shov',25); $('shovTxt').textContent='шов готов, кровь идёт в обход';
      seychas('операция закончена. Ниже — вопросы о ней; «Начать заново» — пройти ещё раз.');
      msg('Шов наложен. Кровь пошла по грудной артерии в обход сужения. Так 25 февраля 1964 года Колесов избавил больного от болей — первым в мире сшив такой шунт на бьющемся сердце.','ok'); }
    else msg('Стежок наложен. Осталось '+(N-n)+'.');
  });
  $('shuntReset').onclick = function(){
    clampT=-1; clampOk=false; flow=false; done=[]; $('clampGo').disabled=false;
    $('ekgTxt').textContent='артерия не пережата'; $('shovTxt').textContent='ждёт проверки ЭКГ';
    seychas('нажми «Пережать артерию и смотреть ЭКГ».');
    msg('Операция начата заново. Уже полученные баллы сохраняются и повторно не начисляются.');
  };
  raf=requestAnimationFrame(loop);
})();
