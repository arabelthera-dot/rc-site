/* Игра 01-12 — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-12.html (r483b);
   разметка — src/data/igry/izobreteniya/soberi-r7.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  /* ── СБОРКА Р-7 ── холст 640×220, CSS только масштабирует. Слева ракета, справа траектория. */
  var st = {scheme:'tandem', drop:'keep'};
  var found = {};
  var W = 640, H = 220;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var anim = null;
  function bg(c){ c.clearRect(0,0,W,H); var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0b1a2e'); g.addColorStop(1,'#16304d'); c.fillStyle=g; c.fillRect(0,0,W,H); }
  function rocket(c, x, y, scheme){
    c.save(); c.translate(x,y); c.strokeStyle='#8fa5b9'; c.lineWidth=1;
    if (scheme==='tandem'){
      c.fillStyle='#e8edf2'; c.fillRect(-9,-150,18,70); c.strokeRect(-9,-150,18,70);   // вторая ступень
      c.fillStyle='#cfd6dd'; c.fillRect(-11,-80,22,80); c.strokeRect(-11,-80,22,80);   // первая
      c.beginPath(); c.moveTo(-9,-150); c.lineTo(0,-172); c.lineTo(9,-150); c.fillStyle='#e8edf2'; c.fill(); c.stroke();
      c.fillStyle='#e4c97a'; c.font='15px Inter, sans-serif'; c.textAlign='left'; c.fillText('2-я ступень', 16, -115); c.fillText('1-я ступень', 16, -40);
    } else {
      c.fillStyle='#e8edf2'; c.fillRect(-8,-160,16,160); c.strokeRect(-8,-160,16,160);   // центральный блок
      c.beginPath(); c.moveTo(-8,-160); c.lineTo(0,-182); c.lineTo(8,-160); c.fill(); c.stroke();
      c.fillStyle='#cfd6dd';
      [-1,1].forEach(function(s){ c.beginPath(); c.moveTo(s*8,-95); c.lineTo(s*20,-10); c.lineTo(s*20,0); c.lineTo(s*8,0); c.closePath(); c.fill(); c.stroke(); });
      c.fillStyle='#e4c97a'; c.font='15px Inter, sans-serif'; c.textAlign='left'; c.fillText('центральный блок', 24, -130); c.fillText('боковые блоки ×4', 24, -30);
    }
    c.restore();
  }
  function map(c){
    c.fillStyle='#b8ccde'; c.font='17px Inter, sans-serif'; c.textAlign='center';
    c.beginPath(); c.arc(250,190,4,0,6.3); c.fill(); c.fillText('Тюра-Там', 250, 210);
    c.beginPath(); c.arc(610,170,4,0,6.3); c.fill(); c.fillText('Кура', 596, 196);
    c.strokeStyle='rgba(143,165,185,.35)'; c.setLineDash([4,5]); c.beginPath(); c.moveTo(250,190); c.quadraticCurveTo(430,-20,610,170); c.stroke(); c.setLineDash([]);
  }
  function pt(t){ var x0=250,y0=190,cx=430,cy=-20,x1=610,y1=170, u=1-t; return [u*u*x0+2*u*t*cx+t*t*x1, u*u*y0+2*u*t*cy+t*t*y1]; }
  function flight(until, dropAt, done){
    var c=$('labCv').getContext('2d'); if (anim) cancelAnimationFrame(anim);
    function frame(t){
      bg(c); rocket(c, 90, 205, st.scheme); map(c);
      c.strokeStyle='#e4c97a'; c.lineWidth=2; c.beginPath();
      for (var k=0;k<=t;k+=0.01){ var p=pt(k); if(k===0)c.moveTo(p[0],p[1]); else c.lineTo(p[0],p[1]); } c.stroke();
      if (dropAt!==null && t>=dropAt){ var d=pt(dropAt); c.fillStyle='#ff8a7a'; c.font='15px Inter, sans-serif'; c.textAlign='center'; c.fillText('боковые блоки сброшены', d[0], d[1]+18); c.beginPath(); c.arc(d[0],d[1],3,0,6.3); c.fill(); }
      var p=pt(Math.min(t,until)); c.fillStyle='#fff'; c.beginPath(); c.arc(p[0],p[1],4,0,6.3); c.fill();
    }
    if (reduce){ frame(until); done(); return; }
    var t=0; (function step(){ frame(t); if (t<until){ t=Math.min(until,t+0.02); anim=requestAnimationFrame(step); } else done(); })();
  }
  function idle(){ var c=$('labCv').getContext('2d'); if (anim) cancelAnimationFrame(anim); bg(c); rocket(c, 90, 205, st.scheme); map(c); }
  function setFound(){ var n=Object.keys(found).length; $('labFound').textContent='Найдено причин неудачи: '+n+' из 2.'; }
  function msg(t, cls){ var m=$('labMsg'); m.className='lab-msg'+(cls?' '+cls:''); m.textContent=t; }
  var segs = document.querySelectorAll('#lab .seg');
  for (var s=0;s<segs.length;s++) segs[s].addEventListener('click', function(){
    var k=this.getAttribute('data-k'), v=this.getAttribute('data-v');
    st[k]=v;
    var same=document.querySelectorAll('#lab .seg[data-k="'+k+'"]');
    for (var j=0;j<same.length;j++) same[j].setAttribute('aria-pressed', same[j]===this ? 'true':'false');
    idle();
  });
  $('labGo').onclick = function(){
    msg('Полёт…');
    if (st.scheme==='tandem'){
      flight(0.3, null, function(){ found.s=1; award('why0',10);
        msg('Первая ступень отработала — и вторую надо зажечь высоко в небе. Здесь это и сорвалось. В пакете Королёва все двигатели запускаются ещё на земле, «а не в полёте», и отказ виден на старте.','bad'); setFound(); });
    } else if (st.drop==='keep'){
      flight(0.62, null, function(){ found.d=1; award('why1',10);
        msg('Топливо в боковых блоках кончилось, а ракета тащит их пустые баки дальше. Мёртвый вес съедает дальность — до Камчатки не хватило. У Р-7 две ступени: боковые блоки отработали — и отделились.','bad'); setFound(); });
    } else {
      flight(1, 0.28, function(){ award('lab',30);
        msg('Дошла! Пакет, все двигатели зажжены на земле, пустые боковые блоки сброшены — так 21 августа 1957 года головная часть дошла до полигона Кура. Честная оговорка: в плотных слоях атмосферы она разрушилась, её доводили дальше.','ok'); setFound(); });
    }
  };
  $('labReset').onclick = function(){
    st = {scheme:'tandem', drop:'keep'};
    for (var j=0;j<segs.length;j++){ var v=segs[j].getAttribute('data-v'); segs[j].setAttribute('aria-pressed', (v==='tandem'||v==='keep')?'true':'false'); }
    idle(); msg('Ракета снова на старте. Уже полученные баллы сохраняются и повторно не начисляются.');
  };
  idle();
})();
