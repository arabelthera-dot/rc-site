/* Игра 01-16 — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-16.html (scripts/dni-shablon/iz-html.mjs, Р286);
   разметка — src/data/igry/izobreteniya/stykovka.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  /* ── СТЫКОВКА ── условная кинематика: осевое расстояние убывает с выбранной скоростью,
     боковое смещение постоянно (выбор оси). Исход определяется в момент касания (axial<=0). */
  var SPEED = {fast:0.052, correct:0.022, slow:0.009};  // условные единицы расстояния / кадр
  var OFFSET = {good:0, small:0.09, large:0.30};          // доля от радиуса конуса (R=0.2)
  var CAPTURE_R = 0.2;
  var DEF = {speed:'correct', align:'good'};
  var st = {speed:DEF.speed, align:DEF.align};
  var found = {};
  function verdict(speed, align){
    if (align === 'large') return 'miss';
    if (speed === 'fast') return 'hit';
    if (speed === 'slow') return 'nolatch';
    return 'dock';
  }
  var cv=$('labCv'), cx=cv.getContext('2d'), W=640, H=260;
  function frame(axial, lateral, phase){
    cx.fillStyle='#0b1622'; cx.fillRect(0,0,W,H);
    var cyBase=H/2, leftX=70, rightX=W-70;
    /* приёмный конус «Союза-5» справа */
    cx.strokeStyle='rgba(143,165,185,.55)'; cx.lineWidth=2;
    cx.beginPath(); cx.moveTo(rightX,cyBase-70); cx.lineTo(rightX-46,cyBase); cx.lineTo(rightX,cyBase+70); cx.stroke();
    cx.strokeStyle='rgba(228,201,122,.35)'; cx.setLineDash([4,5]);
    cx.beginPath(); cx.arc(rightX-46, cyBase, 70*CAPTURE_R/0.2*0.33, 0, 6.2832); cx.stroke(); cx.setLineDash([]);
    cx.fillStyle='#8fa5b9'; cx.font='12px Inter, sans-serif'; cx.textAlign='center';
    cx.fillText('«Союз-5» · приёмный конус', rightX-46, cyBase+96);
    /* корпус Союза-5 */
    cx.fillStyle='rgba(143,165,185,.5)'; cx.fillRect(rightX-20, cyBase-26, 40, 52);
    /* Союз-4 приближается */
    var travel = (W*0.62);
    var x = leftX + (1-axial) * travel;
    var y = cyBase + lateral*140;
    cx.fillStyle = phase==='bad' ? 'rgba(200,80,70,.9)' : 'rgba(228,201,122,.9)';
    cx.fillRect(x-18, y-24, 36, 48);
    cx.strokeStyle='rgba(125,200,255,.85)'; cx.lineWidth=3;
    cx.beginPath(); cx.moveTo(x+18,y); cx.lineTo(x+18+26,y); cx.stroke();
    cx.fillStyle='#8fa5b9'; cx.textAlign='center';
    cx.fillText('«Союз-4»', x, y-34);
  }
  function msg(t, cls){ var m=$('labMsg'); m.className='lab-msg'+(cls?' '+cls:''); m.textContent=t; }
  var TEXT = {
    dock:['Мягкая стыковка: штырь вошёл в приёмный конус на правильной скорости, замки защёлкнулись с первой попытки.','ok'],
    hit:['Жёсткий удар. Скорость была слишком высокой: даже при хорошей оси штырь бьёт по конусу, а не плавно входит в него — риск повредить стыковочный узел.','bad'],
    nolatch:['Замки не защёлкнулись. Слишком медленное сближение не даёт механизму энергии, нужной для фиксации, — корабли соприкоснулись, но не состыковались.','bad'],
    miss:['Мимо конуса. Большой перекос оси увёл штырь за пределы приёмного раструба при любой скорости — нужен повторный заход.','bad']
  };
  var AW = {dock:['lab',30], hit:['why0',10], nolatch:['why1',10], miss:['why2',10]};
  var anim=null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function stop(){ if (anim){ cancelAnimationFrame(anim); anim=null; } }
  var segs=document.querySelectorAll('#lab .seg');
  for (var s=0;s<segs.length;s++) segs[s].addEventListener('click', function(){
    var k=this.getAttribute('data-k'), v=this.getAttribute('data-v'); st[k]=v;
    var same=document.querySelectorAll('#lab .seg[data-k="'+k+'"]');
    for (var j=0;j<same.length;j++) same[j].setAttribute('aria-pressed', same[j]===this ? 'true':'false');
  });
  function setFound(){
    function yn(k){ return found[k] ? 'да' : 'нет'; }
    $('labFound').textContent='Найдено: мягкая стыковка — '+yn('dock')+', жёсткий удар — '+yn('hit')+', мимо конуса — '+yn('miss')+', замки не защёлкнулись — '+yn('nolatch')+'.';
  }
  $('labGo').onclick = function(){
    stop();
    var v=verdict(st.speed, st.align), lateral=OFFSET[st.align], speed=SPEED[st.speed];
    msg('«Союз-4» сближается…');
    var axial=1, bad=(v==='hit');
    if (reduce){
      frame(0, lateral, bad?'bad':'ok');
      msg(TEXT[v][0], TEXT[v][1]);
      if (!found[v]){ found[v]=1; award(AW[v][0], AW[v][1]); }
      setFound();
      return;
    }
    (function step(){
      axial -= speed;
      if (axial <= 0){
        frame(0, lateral, bad?'bad':'ok');
        msg(TEXT[v][0], TEXT[v][1]);
        if (!found[v]){ found[v]=1; award(AW[v][0], AW[v][1]); }
        setFound();
        anim=null; return;
      }
      frame(axial, lateral, 'go');
      anim=requestAnimationFrame(step);
    })();
  };
  $('labReset').onclick = function(){
    stop(); st={speed:DEF.speed, align:DEF.align};
    for (var j=0;j<segs.length;j++){ var k=segs[j].getAttribute('data-k'); segs[j].setAttribute('aria-pressed', segs[j].getAttribute('data-v')===DEF[k] ? 'true':'false'); }
    frame(1,0,'go'); msg('«Союз-4» отведён на исходную. Выбери условия заново. Уже полученные баллы сохраняются и повторно не начисляются.');
  };
  frame(1,0,'go');
})();
