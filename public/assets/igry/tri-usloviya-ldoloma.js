/* Механика tri-usloviya-ldoloma (образец — 01-10 «Нос „Пайлота“», public/muzei/izobreteniya/igry/nos-paylota.js):
   три условия по два варианта; первое неверное по порядку — своя причина неудачи и свой кадр, все верные — проход.
   Холст 640×220 рисуется по состоянию, без случайностей. Тексты, варианты и баллы — из dannye (схема в src/lib/igry-mehaniki.ts). */
RCIgry.dvizhok('tri-usloviya-ldoloma', function(ctx){
  var d = ctx.dannye, m = ctx.mesto, U = d.usloviya;
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
  var html = '<div class="lab">';
  U.forEach(function(u, i){
    html += '<div class="lab-row" role="group"><span class="lbl">' + (i+1) + '. ' + esc(u.nazvanie) + '</span>';
    u.varianty.forEach(function(v){ html += '<button class="seg" type="button" data-k="' + u.kod + '" data-v="' + v.kod + '">' + esc(v.tekst) + '</button>'; });
    html += '</div>';
  });
  html += '<div class="lab-btns"><button class="btn gold" type="button" data-pusk>' + esc(d.pusk_ru) + '</button></div>' +
    '<div class="lab-stage"><canvas width="640" height="220" role="img" aria-label="' + esc(d.holst_alt) + '"></canvas>' +
    '<div class="lab-cap">' + esc(d.podpis_holsta_ru) + '</div></div>' +
    '<div class="lab-found"></div></div>';
  m.innerHTML = html;
  var cv = m.querySelector('canvas'), segs = m.querySelectorAll('.seg'), foundEl = m.querySelector('.lab-found');
  var st, found = {};
  var W = 640, H = 220, WL = 128;          // WL — уровень воды
  // кадры неудачи идут по порядку условий: нос упёрся, удар без толку, лёд слишком толст
  var KADRY = ['stuck', 'ram', 'heavy'];
  function scene(c){
    c.clearRect(0,0,W,H);
    var sky=c.createLinearGradient(0,0,0,WL); sky.addColorStop(0,'#12263e'); sky.addColorStop(1,'#2c4a68');
    c.fillStyle=sky; c.fillRect(0,0,W,WL);
    c.fillStyle='#0b2236'; c.fillRect(0,WL,W,H-WL);
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
  function ship(c, x, lift, tilt, srezan){
    c.save(); c.translate(x, WL-lift); c.rotate(-tilt);
    c.fillStyle='#2b3440'; c.strokeStyle='#8fa5b9'; c.lineWidth=1.2;
    c.beginPath(); c.moveTo(-170,-26); c.lineTo(0,-26);
    if (srezan){ c.lineTo(0,-6); c.lineTo(20,18); }        // скос под водой
    else { c.lineTo(8,18); }
    c.lineTo(-160,18); c.lineTo(-176,0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#d8dde3'; c.fillRect(-120,-44,58,18);            // рубка
    c.fillStyle='#1b1f24'; c.fillRect(-92,-86,12,42);             // труба
    c.fillStyle='rgba(180,190,200,.35)'; c.beginPath(); c.arc(-80,-96,14,0,6.3); c.arc(-60,-104,11,0,6.3); c.fill();
    c.restore();
  }
  function label(c, t){ c.fillStyle='#e4c97a'; c.font='bold 22px Inter, sans-serif'; c.textAlign='left'; c.fillText(t, 14, 30); }
  function verno(i){ return st[U[i].kod] === U[i].verno; }
  function draw(kind, t){
    var c = cv.getContext('2d');
    var thick = verno(2) ? 12 : 30, srezan = verno(0);
    scene(c);
    if (kind==='idle'){ ice(c, 330, thick, false); ship(c, 250, 0, 0, srezan); label(c, d.kadr_start_ru); return; }
    if (kind==='stuck'){ ice(c, 330, thick, false); ship(c, 322, 0, 0, srezan); label(c, t); return; }
    if (kind==='ram'){ ice(c, 330, thick, false); ship(c, 320, 0, -0.03, srezan);
      c.strokeStyle='#ff8a7a'; c.lineWidth=2; c.beginPath(); c.moveTo(332,WL-20); c.lineTo(346,WL-34); c.moveTo(334,WL-4); c.lineTo(352,WL-6); c.stroke();
      label(c, t); return; }
    if (kind==='heavy'){ ice(c, 300, thick, false); ship(c, 318, 10, 0.07, srezan); label(c, t); return; }
    ice(c, 300, thick, true); ship(c, 360, 8, 0.05, srezan); label(c, t);
  }
  function setFound(){ foundEl.textContent = d.naydeno_ru.replace('{n}', Object.keys(found).length); }
  function knopki(){ for (var j=0;j<segs.length;j++) segs[j].setAttribute('aria-pressed', st[segs[j].getAttribute('data-k')] === segs[j].getAttribute('data-v') ? 'true' : 'false'); }
  for (var s=0;s<segs.length;s++) segs[s].addEventListener('click', function(){
    st[this.getAttribute('data-k')] = this.getAttribute('data-v'); knopki(); draw('idle');
  });
  m.querySelector('[data-pusk]').onclick = function(){
    for (var i=0;i<3;i++) if (!verno(i)){
      var n = U[i].neudacha;
      draw(KADRY[i], n.kadr_ru); found[i]=1; ctx.ochki('prichina' + i, n.ochki); ctx.itog(n.soobshchenie_ru, 'bad'); setFound(); return;
    }
    draw('ok', d.pobeda.kadr_ru); ctx.ochki('pobeda', d.pobeda.ochki); ctx.itog(d.pobeda.soobshchenie_ru, 'ok'); setFound();
  };
  function start(){ st = {}; U.forEach(function(u){ st[u.kod] = u.start; }); knopki(); draw('idle'); }
  start(); setFound(); ctx.itog(d.start_ru);
  return { zanovo: function(){ start(); ctx.itog(d.zanovo_ru); } };
});
