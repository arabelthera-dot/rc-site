/* Игра 01-03 «Тигель Аносова» — скрипт как есть со страницы дня 01-03 (day-03jan-anosov.html) (Р286);
   разметка — src/data/igry/izobreteniya/tigel-anosova.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  /* ── ТИГЕЛЬ ── детерминированная модель: одинаковые условия дают одинаковый рисунок
     на любой ширине (холст фиксированного размера 640×220, CSS только масштабирует). */
  var st = {add:'none', cool:'fast', forge:'hot'};
  var found = {};
  var W = 640, H = 220;
  function rng(seed){ return function(){ seed = (seed*1664525 + 1013904223) >>> 0; return seed/4294967296; }; }
  var R = rng(1831), P = [];
  for (var i=0;i<24;i++) P.push([R()*W, R()*H, 0.6+R()*1.4, R()*6.28]);
  function field(x,y){               // извилистое поле для узора
    var v = 0;
    for (var i=0;i<P.length;i++){ var dx=x-P[i][0], dy=y-P[i][1]; v += Math.sin(Math.sqrt(dx*dx+dy*dy)*0.045*P[i][2] + P[i][3]); }
    return v + Math.sin(x*0.02 + Math.sin(y*0.03)*2.2)*2;
  }
  function paint(cv, kind, zoom){
    var c = cv.getContext('2d'), w = cv.width, h = cv.height, img = c.createImageData(w,h), d = img.data;
    var n = rng(7);
    for (var y=0;y<h;y++) for (var x=0;x<w;x++){
      var k=(y*w+x)*4, g=n()*14, r,gg,b;
      var fx = zoom ? 250 + x/4 : x, fy = zoom ? 80 + y/4 : y;
      if (kind === 'iron'){ r=gg=b=170+g; }
      else if (kind === 'plain'){ r=gg=b=112+g; b+=6; }
      else {
        var f = field(fx,fy), wave = 0.5 + 0.5*Math.sin(f*2.4 + Math.sin(fy*0.05)*0.8);
        var t = wave*wave*(3-2*wave);                  // плавный переход, без резких полос
        var amp = kind === 'faded' ? 0.15 : 1;
        var base = 78 + g*0.7;
        r = base + t*95*amp; gg = base + t*92*amp + 3; b = base + t*84*amp + 10;
      }
      d[k]=r; d[k+1]=gg; d[k+2]=b; d[k+3]=255;
    }
    c.putImageData(img,0,0);
  }
  function blank(){ var c=$('labCv').getContext('2d'); c.fillStyle='#1c2530'; c.fillRect(0,0,W,H);
    c.fillStyle='#8fa5b9'; c.font='16px Inter, sans-serif'; c.textAlign='center'; c.fillText('Тигель пуст', W/2, H/2); }
  function setFound(){ var n=Object.keys(found).length; $('labFound').textContent='Найдено причин неудачи: '+n+' из 3.'; }
  function msg(t, cls){ var m=$('labMsg'); m.className='lab-msg'+(cls?' '+cls:''); m.textContent=t; }
  var segs = document.querySelectorAll('#lab .seg');
  for (var s=0;s<segs.length;s++) segs[s].addEventListener('click', function(){
    var k=this.getAttribute('data-k'), v=this.getAttribute('data-v');
    st[k]=v;
    var same=document.querySelectorAll('#lab .seg[data-k="'+k+'"]');
    for (var j=0;j<same.length;j++) same[j].setAttribute('aria-pressed', same[j]===this ? 'true':'false');
  });
  $('labGo').onclick = function(){
    var cv=$('labCv');
    if (st.add==='none'){
      paint(cv,'iron'); found.c=1; award('why0',5);
      msg('Узора нет: без графита углероду в тигле взяться неоткуда — вышло мягкое железо, а не булат. Аносов клал «чистый самородный графит» (условие 5).','bad');
    } else if (st.cool==='fast'){
      paint(cv,'plain'); found.f=1; award('why1',5);
      msg('Сталь получилась, а узора нет: тигель остыл слишком быстро, и строение металла не успело сложиться в рисунок. Условие 9 — «медленное охлаждение тигля».','bad');
    } else if (st.forge==='hot'){
      paint(cv,'faded'); found.h=1; award('why2',5);
      msg('Узор в слитке был — и пропал в горне. Аносов требовал не доводить металл до «степени жара, при которой узор теряется» (условие 10).','bad');
    } else {
      paint(cv,'bulat'); award('lab',30);
      msg('Булат! Графит, медленное остывание и ковка наименьшим жаром — ровно так, как записал Аносов. Светлый извилистый узор — строение самой стали.','ok');
      $('micro').classList.add('show');
    }
    setFound();
  };
  $('labReset').onclick = function(){
    st = {add:'none', cool:'fast', forge:'hot'};
    for (var j=0;j<segs.length;j++){ var v=segs[j].getAttribute('data-v'); segs[j].setAttribute('aria-pressed', (v==='none'||v==='fast'||v==='hot')?'true':'false'); }
    blank(); msg('Тигель очищен. Выбери три условия заново. Уже полученные баллы сохраняются и повторно не начисляются.');
    $('micro').classList.remove('show'); $('microView').hidden = true;
  };
  $('microBtn').onclick = function(){ $('microView').hidden=false; paint($('microCv'),'bulat',true); award('micro',5); };
  blank();
})();
