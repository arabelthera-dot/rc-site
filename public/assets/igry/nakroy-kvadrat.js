/* Механика nakroy-kvadrat (02-23 «Катюша»): тянешь квадрат разрывов залпа по площади и накрываешь им цель; накрыл все цели — победа.
   Сцена — вид сверху: поле, цель (пунктирный квадрат) и квадрат разрывов (сетка точек), подписи целей — вёрсткой поверх холста,
   на холсте текста нет (Р18). Мышь, палец и клавиатура (стрелки — двигать квадрат, Enter — «Залп!»). Числа и тексты — из dannye. */
RCIgry.dvizhok('nakroy-kvadrat', function(ctx){
  var d = ctx.dannye, m = ctx.mesto, P = d.pole, Z = d.zalp;
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
  var VW = P.shirina, VH = P.vysota, Z2 = Z.storona/2;
  var CELI = d.celi.map(function(c){ return { x: VW*c.x, y: VH*c.y, storona: c.storona, podpis: c.podpis, verno_ru: c.verno_ru }; });
  var podpisiHtml = CELI.map(function(c, i){
    return '<span class="nkk-podpis" data-k="' + i + '" style="position:absolute;transform:translateX(-50%);font:600 12px Inter,sans-serif;color:rgba(255,255,255,.7);pointer-events:none;white-space:nowrap">' + esc(c.podpis) + '</span>';
  }).join('');
  m.innerHTML = '<div class="nkk-pole" style="position:relative;max-width:' + VW + 'px">' +
    '<canvas width="' + VW + '" height="' + VH + '" role="img" aria-label="' + esc(d.holst_alt) + '" tabindex="0" style="width:100%;display:block;border-radius:14px;border:1px solid rgba(255,255,255,.1);touch-action:none;outline:none"></canvas>' +
    podpisiHtml + '</div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin:12px 0;flex-wrap:wrap">' +
    '<span data-schet style="color:var(--muted);font-size:14px"></span>' +
    '<button class="btn gold" type="button" data-pusk style="padding:12px 28px">' + esc(d.pusk_ru) + '</button></div>' +
    (d.podpis_holsta_ru ? '<div style="font-size:13px;color:var(--muted);margin:-4px 0 0">' + esc(d.podpis_holsta_ru) + '</div>' : '');
  var cv = m.querySelector('canvas'), c = cv.getContext('2d'), schetEl = m.querySelector('[data-schet]'), pusk = m.querySelector('[data-pusk]');
  var podpisi = m.querySelectorAll('.nkk-podpis');
  var S = 1, OX = 0;
  var sx = VW/2, sy = VH/2, tek = 0, zapusk = false, tash = false, vzryvy = [], shag = 16;
  var tx = function(x){ return OX + x*S; }, ty = function(y){ return y*S; };
  function razmetka(){
    var w = Math.round(cv.getBoundingClientRect().width) || VW;
    S = Math.max(.5, Math.min(1.25, w/VW)); cv.width = w; cv.height = Math.round(VH*S); OX = (w - VW*S)/2;
    CELI.forEach(function(cel, i){ podpisi[i].style.left = tx(cel.x) + 'px'; podpisi[i].style.top = (ty(cel.y - cel.storona/2) - 16) + 'px'; });
  }
  function nakryt(cel){ return Math.abs(sx - cel.x) <= Z2 - cel.storona/2 && Math.abs(sy - cel.y) <= Z2 - cel.storona/2; }
  function schet(){
    schetEl.textContent = d.schet_ru.replace('{n}', String(Math.min(tek+1, CELI.length))).replace('{vsego}', String(CELI.length));
    CELI.forEach(function(cel, i){ podpisi[i].style.opacity = (i < tek ? '0.4' : (i === tek ? '1' : '0')); });
  }
  function cel_ris(cel, ok, proshel){
    var C2 = cel.storona/2, x0 = cel.x - C2, y0 = cel.y - C2;
    c.fillStyle = ok ? 'rgba(126,212,160,.16)' : (proshel ? 'rgba(126,212,160,.07)' : 'rgba(201,168,76,.08)');
    c.fillRect(tx(x0), ty(y0), cel.storona*S, cel.storona*S);
    c.strokeStyle = ok ? 'rgba(126,212,160,.95)' : (proshel ? 'rgba(126,212,160,.4)' : 'rgba(201,168,76,.6)');
    c.lineWidth = ok ? 2.5 : 2; c.setLineDash([7,5]); c.strokeRect(tx(x0), ty(y0), cel.storona*S, cel.storona*S); c.setLineDash([]);
  }
  function fon(){
    c.fillStyle = '#08121f'; c.fillRect(0, 0, cv.width, cv.height);
    c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 1;
    for (var x = 0; x <= VW; x += 40){ c.beginPath(); c.moveTo(tx(x), 0); c.lineTo(tx(x), cv.height); c.stroke(); }
    for (var y = 0; y <= VH; y += 40){ c.beginPath(); c.moveTo(0, ty(y)); c.lineTo(cv.width, ty(y)); c.stroke(); }
    CELI.forEach(function(cel, i){ if (i <= tek) cel_ris(cel, i === tek && nakryt(cel), i < tek); });
  }
  function zalp_ris(){
    var x0 = sx - Z2, y0 = sy - Z2, step = Z.storona/Z.ryadov;
    c.strokeStyle = 'rgba(230,162,60,.55)'; c.lineWidth = 1.5; c.strokeRect(tx(x0), ty(y0), Z.storona*S, Z.storona*S);
    for (var i = 0; i < Z.ryadov; i++) for (var j = 0; j < Z.ryadov; j++){
      c.beginPath(); c.arc(tx(x0 + step/2 + i*step), ty(y0 + step/2 + j*step), 3*S, 0, Math.PI*2); c.fillStyle = 'rgba(230,162,60,.85)'; c.fill();
    }
    vzryvy.forEach(function(b){
      c.beginPath(); c.arc(tx(b.x), ty(b.y), b.r*S, 0, Math.PI*2); c.fillStyle = 'rgba(244,196,96,' + b.a.toFixed(2) + ')'; c.fill();
    });
  }
  function vzryv(){
    var x0 = sx - Z2, y0 = sy - Z2, step = Z.storona/Z.ryadov;
    for (var i = 0; i < Z.ryadov; i++) for (var j = 0; j < Z.ryadov; j++)
      vzryvy.push({ x: x0 + step/2 + i*step, y: y0 + step/2 + j*step, r: 4, a: 1 });
  }
  function otsenka(){
    var cel = CELI[tex];
    if (nakryt(cel)){
      tek++;
      if (tek >= CELI.length){ ctx.itog(d.pobeda.soobshchenie_ru, 'ok'); ctx.ochki('pobeda', d.pobeda.ochki); }
      else { ctx.itog(cel.verno_ru, 'ok'); pusk.disabled = false; }
    } else { ctx.itog(d.ne_nakryto_ru, 'bad'); pusk.disabled = false; }
    schet();
  }
  function kadr(){
    if (zapusk){
      vzryvy.forEach(function(b){ b.r += 1.3; b.a -= .045; });
      vzryvy = vzryvy.filter(function(b){ return b.a > 0; });
      if (!vzryvy.length){ zapusk = false; otsenka(); }
    }
    fon(); zalp_ris(); requestAnimationFrame(kadr);
  }
  function postavit(px, py){
    var r = cv.getBoundingClientRect();
    var lx = (px - r.left)/r.width*VW, ly = (py - r.top)/r.height*VH;
    sx = Math.max(Z2, Math.min(VW - Z2, lx)); sy = Math.max(Z2, Math.min(VH - Z2, ly));
  }
  cv.addEventListener('pointerdown', function(e){ if (zapusk || pusk.disabled) return; tash = true; cv.setPointerCapture(e.pointerId); cv.focus(); postavit(e.clientX, e.clientY); });
  cv.addEventListener('pointermove', function(e){ if (tash) postavit(e.clientX, e.clientY); });
  cv.addEventListener('pointerup', function(){ tash = false; });
  cv.addEventListener('pointercancel', function(){ tash = false; });
  cv.addEventListener('keydown', function(e){
    if (pusk.disabled) return;
    var k = e.key, s = e.shiftKey ? shag*4 : shag;
    if (k === 'ArrowLeft'){ sx = Math.max(Z2, sx - s); e.preventDefault(); }
    else if (k === 'ArrowRight'){ sx = Math.min(VW - Z2, sx + s); e.preventDefault(); }
    else if (k === 'ArrowUp'){ sy = Math.max(Z2, sy - s); e.preventDefault(); }
    else if (k === 'ArrowDown'){ sy = Math.min(VH - Z2, sy + s); e.preventDefault(); }
    else if (k === ' ' || k === 'Enter'){ e.preventDefault(); pusk.click(); }
  });
  pusk.addEventListener('click', function(){ if (zapusk || pusk.disabled) return; zapusk = true; pusk.disabled = true; ctx.itog(''); vzryv(); });
  function start(){
    tek = 0; sx = VW/2; sy = VH/2; zapusk = false; vzryvy = []; pusk.disabled = false; schet();
  }
  addEventListener('resize', razmetka);
  razmetka(); start(); ctx.itog(d.start_ru); requestAnimationFrame(kadr);
  return { zanovo: function(){ start(); ctx.itog(d.zanovo_ru); } };
});
