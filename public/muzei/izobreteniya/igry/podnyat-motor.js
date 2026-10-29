/* Игра 01-11 — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-11.html (r483b);
   разметка — src/data/igry/izobreteniya/podnyat-motor.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  /* ── ПОДНЯТЬ МОТОР ── холст фиксированного размера 640×220, CSS только масштабирует.
     Кадр рисуется по состоянию, без случайностей: одинаковый выбор — одинаковый кадр. */
  var st = {fuel:'steam', build:'heavy'};
  var found = {};
  var W = 640, H = 220, GROUND = 196;
  function sky(c){
    var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#12263e'); g.addColorStop(1,'#2c4a68');
    c.fillStyle=g; c.fillRect(0,0,W,H);
    c.fillStyle='#22301f'; c.fillRect(0,GROUND,W,H-GROUND);
    c.fillStyle='#3a4a2e'; c.fillRect(0,GROUND,W,3);
  }
  // дирижабль: y — верх оболочки; extra — что висит под гондолой
  function airship(c, y, extra){
    var cx=320;
    c.fillStyle='#b9c4cf'; c.strokeStyle='#e4c97a'; c.lineWidth=1.4;
    c.beginPath(); c.ellipse(cx, y+34, 190, 34, 0, 0, 6.3); c.fill(); c.stroke();
    c.strokeStyle='#8fa5b9'; c.beginPath();
    for (var i=-150;i<=150;i+=50){ c.moveTo(cx+i, y+6); c.lineTo(cx+i, y+62); }
    c.stroke();
    c.strokeStyle='#d8dde3'; c.beginPath(); c.moveTo(cx-40,y+66); c.lineTo(cx-30,y+86); c.moveTo(cx+40,y+66); c.lineTo(cx+30,y+86); c.stroke();
    c.fillStyle='#2b3440'; c.fillRect(cx-36, y+86, 72, 20);                  // гондола
    c.fillStyle='#c9a84c'; for (var k=0;k<4;k++) c.fillRect(cx-30+k*16, y+92, 12, 8); // цилиндры
    c.fillStyle='#d8dde3'; c.beginPath(); c.moveTo(cx+190,y+34); c.lineTo(cx+206,y+18); c.lineTo(cx+206,y+50); c.closePath(); c.fill(); // винт
    if (extra==='steam'){ c.fillStyle='#55606c'; c.fillRect(cx-70,y+106,60,26); c.fillStyle='#1b1f24'; c.fillRect(cx+4,y+106,64,26);
      c.fillStyle='#e4c97a'; c.font='12px Inter, sans-serif'; c.textAlign='center'; c.fillText('котёл',cx-40,y+123); c.fillStyle='#c6d8e8'; c.fillText('уголь',cx+36,y+123); }
    if (extra==='gas'){ c.fillStyle='#7c8a96'; for (var b=0;b<5;b++) c.fillRect(cx-70+b*28, y+106, 20, 32);
      c.fillStyle='#e4c97a'; c.font='12px Inter, sans-serif'; c.textAlign='center'; c.fillText('баллоны газа',cx,y+124); }
    if (extra==='heavy'){ c.fillStyle='#55606c'; c.fillRect(cx-80,y+106,160,28);
      c.fillStyle='#e4c97a'; c.font='12px Inter, sans-serif'; c.textAlign='center'; c.fillText('мотор 2400 кг',cx,y+125); }
  }
  function label(c, t){ c.fillStyle='#e4c97a'; c.font='bold 20px Inter, sans-serif'; c.textAlign='left'; c.fillText(t, 14, 28); }
  function draw(kind){
    var c=$('labCv').getContext('2d');
    sky(c);
    if (kind==='idle'){ airship(c, 90, ''); label(c,'Дирижабль у земли'); return; }
    if (kind==='ok'){ airship(c, 30, ''); label(c,'Взлёт: 80 сил весят 240 кг'); return; }
    airship(c, kind==='heavy' ? 62 : 58, kind); label(c,'Не поднимается: лишний груз');
  }
  function setFound(){ var n=Object.keys(found).length; $('labFound').textContent='Найдено причин неудачи: '+n+' из 3.'; }
  function msg(t, cls){ var m=$('labMsg'); m.className='lab-msg'+(cls?' '+cls:''); m.textContent=t; }
  var segs = document.querySelectorAll('#lab .seg');
  for (var s=0;s<segs.length;s++) segs[s].addEventListener('click', function(){
    var k=this.getAttribute('data-k'), v=this.getAttribute('data-v');
    st[k]=v;
    var same=document.querySelectorAll('#lab .seg[data-k="'+k+'"]');
    for (var j=0;j<same.length;j++) same[j].setAttribute('aria-pressed', same[j]===this ? 'true':'false');
    draw('idle');
  });
  $('labGo').onclick = function(){
    if (st.fuel==='steam'){
      draw('steam'); found.s=1; award('why0',5);
      msg('Паровой машине нужны котёл и запас угля. Костович отказался от пара: под уголь и котёл ушло бы слишком много места и веса, корабль пришлось бы делать больше.','bad');
    } else if (st.fuel==='gas'){
      draw('gas'); found.g=1; award('why1',5);
      msg('Газовый двигатель Отто на заводе берёт газ из трубы. В небе трубы нет — газ пришлось бы везти в баллонах. Костович решил жечь пары жидкого топлива.','bad');
    } else if (st.build==='heavy'){
      draw('heavy'); found.h=1; award('why2',5);
      msg('Бензин верный, но мотор тяжёлый: по 30 кг на силу, как у моторов первого цеппелина, 80 сил весят 2400 кг. Мотор Костовича — 240 кг, в десять раз легче.','bad');
    } else {
      draw('ok'); award('lab',35);
      msg('Взлетели! Бензин вместо угля и газа, и всего 3 кг на силу: 80 лошадиных сил при 240 килограммах. Такой мотор Костович собрал к 1884 году.','ok');
    }
    setFound();
  };
  $('labReset').onclick = function(){
    st = {fuel:'steam', build:'heavy'};
    for (var j=0;j<segs.length;j++){ var v=segs[j].getAttribute('data-v'); segs[j].setAttribute('aria-pressed', (v==='steam'||v==='heavy')?'true':'false'); }
    draw('idle'); msg('Дирижабль снова у земли. Выбери условия заново. Уже полученные баллы сохраняются и повторно не начисляются.');
  };
  draw('idle');
})();
