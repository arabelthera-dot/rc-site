/* Механика tri-usloviya-bulata (образец — 01-03 «Тигель Аносова», public/muzei/izobreteniya/igry/tigel-anosova.js):
   три условия по два варианта; первое неверное по порядку — своя причина неудачи и свой вид поверхности, все верные — узор.
   Холст 640×220 рисуется по состоянию, без случайностей; на холсте ни слова — подписи кадра под ним.
   Тексты, варианты, тон и сила узора, баллы — из dannye (схема в src/lib/igry-mehaniki.ts). */
RCIgry.dvizhok('tri-usloviya-bulata', function(ctx){
  var d = ctx.dannye, m = ctx.mesto, U = d.usloviya, B = d.blizhe;
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
  var html = '<div class="lab">';
  U.forEach(function(u, i){
    html += '<div class="lab-row" role="group"><span class="lbl">' + (i+1) + '. ' + esc(u.nazvanie) + '</span>';
    u.varianty.forEach(function(v){ html += '<button class="seg" type="button" data-k="' + u.kod + '" data-v="' + v.kod + '">' + esc(v.tekst) + '</button>'; });
    html += '</div>';
  });
  html += '<div class="lab-btns"><button class="btn gold" type="button" data-pusk>' + esc(d.pusk_ru) + '</button></div>' +
    '<div class="lab-stage"><canvas width="640" height="220" role="img" aria-label="' + esc(d.holst_alt) + '"></canvas>' +
    '<div class="lab-cap" data-kadr></div><div class="lab-cap">' + esc(d.podpis_holsta_ru) + '</div></div>' +
    '<div class="lab-found"></div>';
  if (B) html += '<div class="micro" data-blizhe hidden><button class="btn ghost" type="button" data-blizhe-btn>' + esc(B.knopka_ru) + '</button>' +
    '<div data-blizhe-vid hidden><canvas width="280" height="280" role="img" aria-label="' + esc(B.holst_alt) + '"></canvas>' +
    '<p class="lab-cap">' + esc(B.podpis_ru) + '</p></div></div>';
  m.innerHTML = html + '</div>';
  var cv = m.querySelector('canvas'), segs = m.querySelectorAll('.seg'), foundEl = m.querySelector('.lab-found'), kadrEl = m.querySelector('[data-kadr]');
  var bl = m.querySelector('[data-blizhe]'), blVid = m.querySelector('[data-blizhe-vid]');
  var st, found = {};
  var W = 640, H = 220;
  function rng(seed){ return function(){ seed = (seed*1664525 + 1013904223) >>> 0; return seed/4294967296; }; }
  var R = rng(1831), P = [];
  for (var i=0;i<24;i++) P.push([R()*W, R()*H, 0.6+R()*1.4, R()*6.28]);
  function field(x,y){               // извилистое поле для узора
    var v = 0;
    for (var i=0;i<P.length;i++){ var dx=x-P[i][0], dy=y-P[i][1]; v += Math.sin(Math.sqrt(dx*dx+dy*dy)*0.045*P[i][2] + P[i][3]); }
    return v + Math.sin(x*0.02 + Math.sin(y*0.03)*2.2)*2;
  }
  // vid: ton — серый тон гладкой поверхности (0–255), uzor — сила светлого узора (0 — гладко, 1 — полный узор)
  function paint(c2, vid, zoom){
    var c = c2.getContext('2d'), w = c2.width, h = c2.height, img = c.createImageData(w,h), px = img.data, n = rng(7);
    for (var y=0;y<h;y++) for (var x=0;x<w;x++){
      var k=(y*w+x)*4, g=n()*14, r, gg, b;
      if (!vid.uzor){ r=gg=b=vid.ton+g; b+=6; }
      else {
        var fx = zoom ? 250 + x/4 : x, fy = zoom ? 80 + y/4 : y;
        var f = field(fx,fy), wave = 0.5 + 0.5*Math.sin(f*2.4 + Math.sin(fy*0.05)*0.8);
        var t = wave*wave*(3-2*wave), base = 78 + g*0.7;
        r = base + t*95*vid.uzor; gg = base + t*92*vid.uzor + 3; b = base + t*84*vid.uzor + 10;
      }
      px[k]=r; px[k+1]=gg; px[k+2]=b; px[k+3]=255;
    }
    c.putImageData(img,0,0);
  }
  function blank(){ var c = cv.getContext('2d'); c.fillStyle='#1c2530'; c.fillRect(0,0,W,H); kadrEl.textContent = d.kadr_start_ru; }
  function verno(i){ return st[U[i].kod] === U[i].verno; }
  function setFound(){ foundEl.textContent = d.naydeno_ru.replace('{n}', Object.keys(found).length); }
  function knopki(){ for (var j=0;j<segs.length;j++) segs[j].setAttribute('aria-pressed', st[segs[j].getAttribute('data-k')] === segs[j].getAttribute('data-v') ? 'true' : 'false'); }
  for (var s=0;s<segs.length;s++) segs[s].addEventListener('click', function(){
    st[this.getAttribute('data-k')] = this.getAttribute('data-v'); knopki();
  });
  m.querySelector('[data-pusk]').onclick = function(){
    for (var i=0;i<3;i++) if (!verno(i)){
      var n = U[i].neudacha;
      paint(cv, n.vid); kadrEl.textContent = n.kadr_ru; found[i]=1; ctx.ochki('prichina' + i, n.ochki); ctx.itog(n.soobshchenie_ru, 'bad'); setFound(); return;
    }
    paint(cv, d.pobeda.vid); kadrEl.textContent = d.pobeda.kadr_ru; ctx.ochki('pobeda', d.pobeda.ochki); ctx.itog(d.pobeda.soobshchenie_ru, 'ok'); setFound();
    if (bl){ bl.hidden = false; bl.classList.add('show'); }
  };
  if (bl) m.querySelector('[data-blizhe-btn]').onclick = function(){ blVid.hidden = false; paint(blVid.querySelector('canvas'), d.pobeda.vid, true); ctx.ochki('blizhe', B.ochki); };
  function start(){ st = {}; U.forEach(function(u){ st[u.kod] = u.start; }); knopki(); blank(); if (bl){ bl.hidden = true; bl.classList.remove('show'); blVid.hidden = true; } }
  start(); setFound(); ctx.itog(d.start_ru);
  return { zanovo: function(){ start(); ctx.itog(d.zanovo_ru); } };
});
