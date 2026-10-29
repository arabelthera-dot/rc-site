/* Игра 01-06 — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-06.html (scripts/dni-shablon/iz-html.mjs, Р286);
   разметка — src/data/igry/izobreteniya/stanok-orlova.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  /* ── СТАНОК ── розетка из трёх цветовых секторов; каждый сектор — своя краска.
     Сдвиги листа детерминированы (одинаковы на любой ширине экрана): модель показывает
     причину, а не случайность. Холст 300×300, CSS только масштабирует. */
  var INK = ['#c0392b','#2c6fb3','#d9a21b'];
  var OLD_SHIFTS = [[[0,0],[3.2,-2.1],[-2.6,2.8]], [[0,0],[-2.8,1.6],[2.2,3.1]]]; // два прогона-попытки
  var tries = 0;
  function rosette(cv, shifts, scale){
    var c = cv.getContext('2d'), w = cv.width, h = cv.height, cx = w/2, cy = h/2, R = w*0.42;
    c.fillStyle = '#f3ecd9'; c.fillRect(0,0,w,h);
    c.lineWidth = Math.max(1, w/220);
    for (var k=0;k<3;k++){
      c.save(); c.translate(shifts[k][0]*(scale||1), shifts[k][1]*(scale||1));
      c.beginPath(); c.moveTo(cx,cy); c.arc(cx,cy,R+4, k*2*Math.PI/3 - Math.PI/2, (k+1)*2*Math.PI/3 - Math.PI/2); c.closePath(); c.clip();
      c.strokeStyle = INK[k];
      for (var n=0;n<22;n++){            // гильош: лепестковые кривые
        c.beginPath();
        for (var a=0;a<=Math.PI*2+0.02;a+=0.02){
          var r = R*(0.35 + 0.6*(n/22)) + R*0.09*Math.sin(9*a + n*0.45);
          var x = cx + r*Math.cos(a), y = cy + r*Math.sin(a);
          if (a===0) c.moveTo(x,y); else c.lineTo(x,y);
        }
        c.stroke();
      }
      c.restore();
    }
  }
  function blank(cv){ var c=cv.getContext('2d'); c.fillStyle='#e7e0cd'; c.fillRect(0,0,cv.width,cv.height);
    c.fillStyle='#7a7466'; c.font='15px Inter, sans-serif'; c.textAlign='center'; c.fillText('Чистый лист', cv.width/2, cv.height/2); }
  function msg(t, cls){ var m=$('pressMsg'); m.className='lab-msg'+(cls?' '+cls:''); m.textContent=t; }
  function mm(s){ return (Math.sqrt(s[0]*s[0]+s[1]*s[1])/10).toFixed(2).replace('.',','); }

  $('oldGo').onclick = function(){
    var sh = OLD_SHIFTS[tries % 2]; tries++;
    rosette($('cvOld'), sh);
    $('shiftTxt').textContent = 'синяя краска ушла на '+mm(sh[1])+' мм, жёлтая — на '+mm(sh[2])+' мм';
    award('old',10);
    msg('Видишь белые щели и наплывы на стыках секторов? Лист между прогонами ложится чуть иначе, и каждая краска встаёт со своим сдвигом. Повтори — сдвиг будет другим, но не исчезнет. Теперь попробуй по Орлову.','bad');
  };
  $('orlovGo').onclick = function(){
    rosette($('cvOrlov'), [[2.4,1.2],[2.4,1.2],[2.4,1.2]]);
    $('orlTxt').textContent = 'все краски сдвинулись вместе — стыки целые';
    award('orlov',30);
    msg('Все три краски легли с одной формы за одно касание. Даже если лист лёг криво, краски сдвинулись вместе, и линия меняет цвет без разрыва. Это и есть орловская печать.','ok');
    $('kassaBox').hidden = false;
    rosette($('cvK1'), [[0,0],[3,-2],[-2.5,2.5]], 0.67);
    rosette($('cvK2'), [[1,1],[1,1],[1,1]], 0.67);
  };
  function kassa(ok, btn){
    if ($('kassaBox').dataset.done) return; $('kassaBox').dataset.done='1';
    $('kassaWrong').disabled = $('kassaRight').disabled = true;
    $('kassaRight').classList.add('correct');
    var m = $('kassaMsg');
    if (ok){ award('kassa',10); m.className='lab-msg ok'; m.textContent='Верно: у билета Б краски встык, без щелей. Так печатает орловский способ.'; }
    else { btn.classList.add('wrong'); m.className='lab-msg bad'; m.textContent='Это подделка: у билета А на стыке цветов щель — краски печатали по очереди. Настоящий — билет Б.'; }
  }
  $('kassaWrong').onclick = function(){ kassa(false, this); };
  $('kassaRight').onclick = function(){ kassa(true, this); };
  $('pressReset').onclick = function(){
    tries = 0; blank($('cvOld')); blank($('cvOrlov'));
    $('shiftTxt').textContent = 'ещё не печатали'; $('orlTxt').textContent = 'ещё не печатали';
    msg('Станок очищен. Уже полученные баллы сохраняются и повторно не начисляются.');
  };
  blank($('cvOld')); blank($('cvOrlov'));
})();
