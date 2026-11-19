/* Механика ugol-v-koridor-luny (образец — 01-02 «Запусти „Луну-1“ к Луне», public/muzei/izobreteniya/igry/luna1-trayektoriya.js):
   ползунком задаёшь угол запуска, тело летит от старта под притяжением к точке тяги; прошло в коридоре у цели — победа,
   ближе udar — столкновение, дальше koridor — промах. Физика в логическом поле pole.shirina×pole.vysota и не зависит от ширины экрана.
   Подписи старта и цели — вёрсткой поверх холста, на холсте текста нет (Р18). Числа и тексты — из dannye (схема в src/lib/igry-mehaniki.ts). */
RCIgry.dvizhok('ugol-v-koridor-luny', function(ctx){
  var d = ctx.dannye, m = ctx.mesto, P = d.pole, U = d.ugol;
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
  var VW = P.shirina, VH = P.vysota;
  var A = { x: VW*d.start.x, y: VH*d.start.y, r: d.start.r }, B = { x: VW*d.cel.x, y: VH*d.cel.y, r: d.cel.r };
  var T = { x: VW*d.tyaga.x, y: VH*d.tyaga.y };
  m.innerHTML = '<div class="ugk-pole" style="position:relative;max-width:' + VW + 'px">' +
    '<canvas width="' + VW + '" height="' + VH + '" role="img" aria-label="' + esc(d.holst_alt) + '" style="width:100%;display:block;border-radius:14px;border:1px solid rgba(255,255,255,.1);touch-action:none"></canvas>' +
    '<span class="ugk-podpis" data-k="start" style="position:absolute;transform:translateX(-50%);font:600 12px Inter,sans-serif;color:rgba(255,255,255,.6);pointer-events:none;white-space:nowrap">' + esc(d.start.podpis) + '</span>' +
    '<span class="ugk-podpis" data-k="cel" style="position:absolute;transform:translateX(-50%);font:600 12px Inter,sans-serif;color:rgba(255,255,255,.6);pointer-events:none;white-space:nowrap">' + esc(d.cel.podpis) + '</span></div>' +
    '<div style="display:flex;align-items:center;gap:16px;margin:14px 0;flex-wrap:wrap">' +
    '<label style="color:var(--muted);font-size:14px">' + esc(U.podpis_ru) + ': <b data-ugol style="color:var(--gold-l)"></b></label>' +
    '<input type="range" min="' + U.min + '" max="' + U.max + '" value="' + U.start + '" aria-label="' + esc(U.podpis_ru) + '" style="flex:1;min-width:140px;accent-color:#c9a84c">' +
    '<button class="btn gold" type="button" data-pusk style="padding:12px 28px">' + esc(d.pusk_ru) + '</button></div>';
  var cv = m.querySelector('canvas'), c = cv.getContext('2d'), polzunok = m.querySelector('input'), lbl = m.querySelector('[data-ugol]'), pusk = m.querySelector('[data-pusk]');
  var podpisi = m.querySelectorAll('.ugk-podpis');
  var S = 1, OX = 0, animId = null, letit = false, risuy = null;  // risuy — последний кадр, чтобы перерисовать при смене ширины
  var tx = function(x){ return OX + x*S; }, ty = function(y){ return y*S; };
  // звёзды заданы раз и навсегда в логическом поле — иначе мерцают
  var ZV = [];
  for (var i=0;i<80;i++) ZV.push({ x:(i*137.5)%VW, y:(i*91.3)%VH, r:((i*37)%7)/10+.25, a:.25+((i*53)%50)/100 });
  function razmetka(){
    var w = Math.round(cv.getBoundingClientRect().width) || VW;
    S = Math.max(.5, Math.min(1.25, w/VW)); cv.width = w; cv.height = Math.round(VH*S); OX = (w - VW*S)/2;
    [A, B].forEach(function(t, j){ podpisi[j].style.left = tx(t.x) + 'px'; podpisi[j].style.top = (ty(t.y + t.r) + 2) + 'px'; });
  }
  function shar(t, c0, c1, obvod){
    c.beginPath(); c.arc(tx(t.x), ty(t.y), t.r*S, 0, Math.PI*2);
    var g = c.createRadialGradient(tx(t.x)-t.r*.28*S, ty(t.y)-t.r*.28*S, 2, tx(t.x), ty(t.y), t.r*S);
    g.addColorStop(0, c0); g.addColorStop(1, c1); c.fillStyle = g; c.fill();
    c.strokeStyle = obvod; c.lineWidth = 1.5; c.stroke();
  }
  function fon(){
    c.fillStyle = '#040c1a'; c.fillRect(0, 0, cv.width, cv.height);
    ZV.forEach(function(s){ c.beginPath(); c.arc(tx(s.x), ty(s.y), s.r*S, 0, Math.PI*2); c.fillStyle = 'rgba(255,255,255,' + s.a + ')'; c.fill(); });
    shar(A, d.start.cvet[0], d.start.cvet[1], 'rgba(100,180,255,.3)');
    shar(B, d.cel.cvet[0], d.cel.cvet[1], 'rgba(200,200,200,.2)');
    c.beginPath(); c.arc(tx(B.x), ty(B.y), d.koridor*S, 0, Math.PI*2);
    c.strokeStyle = 'rgba(201,168,76,.25)'; c.lineWidth = 1.5; c.setLineDash([4,4]); c.stroke(); c.setLineDash([]);
  }
  var rad = function(u){ return (90 - u)*Math.PI/180; };
  function prevyu(){
    fon(); var a = rad(+polzunok.value), L = d.prevyu_dlina;
    c.beginPath(); c.moveTo(tx(A.x), ty(A.y)); c.lineTo(tx(A.x + Math.cos(a)*L), ty(A.y - Math.sin(a)*L));
    c.strokeStyle = 'rgba(201,168,76,.4)'; c.lineWidth = 1.5; c.setLineDash([5,4]); c.stroke(); c.setLineDash([]);
  }
  function polyot(u){
    var a = rad(u), x = A.x, y = A.y, vx = Math.cos(a)*d.skorost, vy = -Math.sin(a)*d.skorost, put = [];
    for (var i=0;i<600;i++){
      var dx = T.x - x, dy = T.y - y, r = Math.sqrt(dx*dx + dy*dy);
      vx += dx/r*d.tyaga.sila; vy += dy/r*d.tyaga.sila; x += vx; y += vy; put.push({ x:x, y:y });
      if (x < -50 || x > VW+50 || y < -50 || y > VH+50) break;
    }
    return put;
  }
  function zapusk(u){
    var put = polyot(u), idx = 0, blizhe = Infinity;
    put.forEach(function(p){ var r = Math.sqrt(Math.pow(p.x-B.x,2) + Math.pow(p.y-B.y,2)); if (r < blizhe) blizhe = r; });
    var km = String(Math.round(blizhe*d.km_na_edinicu));
    function ris(){
      fon(); c.beginPath(); c.moveTo(tx(put[0].x), ty(put[0].y));
      for (var i=1;i<=Math.min(idx, put.length-1);i++) c.lineTo(tx(put[i].x), ty(put[i].y));
      c.strokeStyle = 'rgba(201,168,76,.7)'; c.lineWidth = 2; c.stroke();
      if (idx < put.length){ var p = put[idx]; c.fillStyle = '#e4c97a'; c.beginPath(); c.arc(tx(p.x), ty(p.y), 5*S, 0, Math.PI*2); c.fill(); }
    }
    function kadr(){
      ris(); idx += 5;
      if (idx < put.length){ animId = requestAnimationFrame(kadr); return; }
      animId = null; risuy = ris;
      if (blizhe <= d.koridor && blizhe > d.udar){ ctx.itog(d.teksty.popal_ru.replace('{km}', km), 'ok'); ctx.ochki('popal', d.ochki); }
      else if (blizhe <= d.udar) ctx.itog(d.teksty.udar_ru.replace('{km}', km), 'bad');
      else ctx.itog(d.teksty.mimo_ru.replace('{km}', km), 'bad');
    }
    kadr();
  }
  polzunok.addEventListener('input', function(){ lbl.textContent = polzunok.value + '°'; if (!letit) prevyu(); });
  pusk.onclick = function(){ if (letit) return; letit = true; pusk.style.display = 'none'; ctx.itog(''); zapusk(+polzunok.value); };
  function start(){
    if (animId) cancelAnimationFrame(animId); animId = null; letit = false;
    risuy = null; pusk.style.display = ''; lbl.textContent = polzunok.value + '°'; prevyu();
  }
  addEventListener('resize', function(){ razmetka(); if (!letit) prevyu(); else if (risuy) risuy(); });
  razmetka(); start(); ctx.itog(d.start_ru);
  return { zanovo: function(){ start(); ctx.itog(d.zanovo_ru); } };
});
