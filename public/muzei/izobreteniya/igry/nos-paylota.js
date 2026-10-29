/* Игра 01-10 — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-10.html (r483b);
   разметка — src/data/igry/izobreteniya/nos-paylota.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  /* ── НОС «ПАЙЛОТА» ── холст фиксированного размера 640×220, CSS только масштабирует.
     Картинка рисуется по состоянию, без случайностей: одинаковый выбор — одинаковый кадр. */
  var st = {bow:'straight', way:'ram', when:'winter'};
  var found = {};
  var W = 640, H = 220, WL = 128;          // WL — уровень воды
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function scene(c, iceThick){
    c.clearRect(0,0,W,H);
    var sky=c.createLinearGradient(0,0,0,WL); sky.addColorStop(0,'#12263e'); sky.addColorStop(1,'#2c4a68');
    c.fillStyle=sky; c.fillRect(0,0,W,WL);
    c.fillStyle='#0b2236'; c.fillRect(0,WL,W,H-WL);
    return iceThick;
  }
  function ice(c, x0, thick, broken){
    c.fillStyle='#dfeef7'; c.strokeStyle='#9fc2d8'; c.lineWidth=1;
    if (!broken){ c.fillRect(x0, WL-thick*0.3, W-x0, thick); c.strokeRect(x0, WL-thick*0.3, W-x0, thick); return; }
    // проломленная кромка: плиты наклонены и расходятся
    for (var i=0;i<5;i++){
      var x=x0+i*34, a=(i%2?1:-1)*0.18;
      c.save(); c.translate(x+15, WL+4); c.rotate(a); c.fillRect(-15,-thick*0.5,30,thick); c.strokeRect(-15,-thick*0.5,30,thick); c.restore();
    }
    c.fillRect(x0+170, WL-thick*0.3, W-x0-170, thick); c.strokeRect(x0+170, WL-thick*0.3, W-x0-170, thick);
  }
  function ship(c, x, lift, tilt, bow){
    c.save(); c.translate(x, WL-lift); c.rotate(-tilt);
    c.fillStyle='#2b3440'; c.strokeStyle='#8fa5b9'; c.lineWidth=1.2;
    c.beginPath(); c.moveTo(-170,-26); c.lineTo(0,-26);
    if (bow==='cut'){ c.lineTo(0,-6); c.lineTo(20,18); }        // скос под водой
    else { c.lineTo(8,18); }
    c.lineTo(-160,18); c.lineTo(-176,0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#d8dde3'; c.fillRect(-120,-44,58,18);            // рубка
    c.fillStyle='#1b1f24'; c.fillRect(-92,-86,12,42);             // труба
    c.fillStyle='rgba(180,190,200,.35)'; c.beginPath(); c.arc(-80,-96,14,0,6.3); c.arc(-60,-104,11,0,6.3); c.fill();
    c.restore();
  }
  function label(c, t){ c.fillStyle='#e4c97a'; c.font='bold 22px Inter, sans-serif'; c.textAlign='left'; c.fillText(t, 14, 30); }
  function draw(kind){
    var c=$('labCv').getContext('2d');
    var thick = st.when==='winter' ? 30 : 12;
    scene(c);
    if (kind==='idle'){ ice(c, 330, thick, false); ship(c, 250, 0, 0, st.bow); label(c,'У кромки льда'); return; }
    if (kind==='stuck'){ ice(c, 330, thick, false); ship(c, 322, 0, 0, st.bow); label(c,'Нос упёрся в кромку'); return; }
    if (kind==='ram'){ ice(c, 330, thick, false); ship(c, 320, 0, -0.03, st.bow);
      c.strokeStyle='#ff8a7a'; c.lineWidth=2; c.beginPath(); c.moveTo(332,WL-20); c.lineTo(346,WL-34); c.moveTo(334,WL-4); c.lineTo(352,WL-6); c.stroke();
      label(c,'Удар: корпус гудит, лёд цел'); return; }
    if (kind==='heavy'){ ice(c, 300, thick, false); ship(c, 318, 10, 0.07, st.bow); label(c,'Разгар зимы: в Кронштадт едут на санях'); return; }
    ice(c, 300, thick, true); ship(c, 360, 8, 0.05, st.bow); label(c,'Лёд проломлен весом — проход открыт');
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
    if (st.bow==='straight'){
      draw('stuck'); found.b=1; award('why0',5);
      msg('Отвесный нос упирается в кромку, и лёд держит судно, как стена. Бритнев срезал форштевень ниже ватерлинии под 20° — нос подныривает под лёд.','bad');
    } else if (st.way==='ram'){
      draw('ram'); found.w=1; award('why1',5);
      msg('Удар с разгона тратит силу машины и бьёт корпус, а лёд цел. Скошенный нос работает иначе: судно наползает на кромку и ломает её своим весом.','bad');
    } else if (st.when==='winter'){
      draw('heavy'); found.t=1; award('why2',5);
      msg('Нос на льду, но сейчас разгар зимы: в это время с Кронштадтом сообщались санным путём по льду. Сила «Пайлота» — в начале и конце сезона: он продлил навигацию на несколько недель, а весной 1865 года открыл её раньше обычного.','bad');
    } else {
      draw('ok'); award('lab',35);
      msg('Прошли! Скошенный нос, ход без удара и тонкая весенняя кромка — так «Пайлот» и работал с 1864 года. Лёд ломается не ударом, а весом.','ok');
    }
    setFound();
  };
  $('labReset').onclick = function(){
    st = {bow:'straight', way:'ram', when:'winter'};
    for (var j=0;j<segs.length;j++){ var v=segs[j].getAttribute('data-v'); segs[j].setAttribute('aria-pressed', (v==='straight'||v==='ram'||v==='winter')?'true':'false'); }
    draw('idle'); msg('Буксир снова у кромки. Выбери три условия заново. Уже полученные баллы сохраняются и повторно не начисляются.');
  };
  void reduce;
  draw('idle');
})();
