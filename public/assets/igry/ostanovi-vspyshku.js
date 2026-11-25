/* Механика ostanovi-vspyshku (02-21 «Гамалея»): развилкой выбираешь, кого привить первым, чтобы остановить вспышку бешенства.
   Два силуэта с точкой укуса и пунктиром до мозга; укус ближе к голове — болезнь дойдёт раньше, того и прививаешь первым.
   Сцена, ситуации, подписи, сообщения и баллы — из dannye (схема в src/lib/igry-mehaniki.ts), на холсте только силуэты без надписей (Р18).
   Мышь и палец — нажатие на кнопку, клавиатура — Tab и Enter по тем же кнопкам. */
RCIgry.dvizhok('ostanovi-vspyshku', function(ctx){
  var d = ctx.dannye, m = ctx.mesto, R = d.razvilki;
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
  var BTN = 'cursor:pointer;font:inherit;font-size:14.5px;font-weight:600;padding:12px 14px;min-height:48px;' +
    'display:flex;width:100%;align-items:center;justify-content:center;text-align:center;box-sizing:border-box';
  m.innerHTML = '<div>' +
    '<canvas width="640" height="260" role="img" aria-label="' + esc(d.holst_alt) + '" style="display:block;width:100%;height:auto;border-radius:10px;background:#1c2530"></canvas>' +
    '<div style="font-size:12.5px;color:#8fa5b9;margin-top:6px">' + esc(d.podpis_holsta_ru) + '</div>' +
    '<p style="font-size:15px;line-height:1.5;margin:14px 0 4px" data-situaciya></p>' +
    '<p style="font-size:14px;color:var(--muted);margin:0 0 10px" data-vopros></p>' +
    '<div role="group" data-variants style="display:grid;grid-template-columns:1fr 1fr;gap:10px"></div>' +
    '<div style="font-size:13px;color:var(--muted);margin-top:10px" data-progress></div>' +
    '</div>';
  var cv = m.querySelector('canvas'), g = cv.getContext('2d');
  var situaciyaEl = m.querySelector('[data-situaciya]'), voprosEl = m.querySelector('[data-vopros]');
  var variantsEl = m.querySelector('[data-variants]'), progressEl = m.querySelector('[data-progress]');

  var W = 640, H = 260, t0 = Date.now();
  var CX = [190, 450];      // центры силуэтов: слева и справа, кнопки в тех же столбцах
  var step = 0, sides = [], gone = {}, solved = false, raz = null;

  function bitePx(cx, b){ return { x: cx - 26 + b.x * 52, y: 24 + b.y * 210 }; }
  function brain(cx){ return { x: cx, y: 44 }; }
  function rr(c, x, y, w, h, r){ c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); c.fill(); c.stroke(); }
  // силуэт человека (без надписей, Р18); glow — зелёная подсветка «защищён прививкой»
  function person(c, cx, glow){
    c.save();
    if (glow) { c.shadowColor = glow; c.shadowBlur = 18; }
    c.fillStyle = glow ? '#2f8f5b' : '#2a3a4c';
    c.strokeStyle = glow ? '#7ed4a0' : 'rgba(255,255,255,.14)';
    c.lineWidth = 1.2;
    c.beginPath(); c.arc(cx, 50, 27, 0, 7); c.fill(); c.stroke();      // голова
    rr(c, cx - 24, 78, 48, 102, 20);                                    // корпус
    rr(c, cx - 21, 180, 17, 54, 8);                                     // нога левая
    rr(c, cx + 4, 180, 17, 54, 8);                                      // нога правая
    c.restore();
  }
  function kadr(){
    g.clearRect(0, 0, W, H);
    var now = (Date.now() - t0) / 1000;
    for (var i = 0; i < 2; i++){
      var v = raz ? raz.varianty[sides[i]] : null;
      if (!v) continue;
      var cx = CX[i], br = brain(cx), bp = bitePx(cx, v.bite);
      person(g, cx, solved ? '#7ed4a0' : null);
      // пунктир — путь вируса от укуса к мозгу
      g.strokeStyle = 'rgba(228,201,122,.5)'; g.lineWidth = 1.5; g.setLineDash([4, 5]);
      g.beginPath(); g.moveTo(bp.x, bp.y); g.lineTo(br.x, br.y); g.stroke(); g.setLineDash([]);
      // мозг
      g.beginPath(); g.arc(br.x, br.y, 3.5, 0, 7); g.fillStyle = solved ? '#7ed4a0' : '#e4c97a'; g.fill();
      // точка укуса пульсирует
      var pu = 1 + Math.sin(now * 5) * .25;
      g.beginPath(); g.arc(bp.x, bp.y, 5 * pu, 0, 7); g.fillStyle = '#c0453f'; g.fill();
      if (!solved){
        // вирус ползёт к мозгу: у короткого пути (укус ближе к голове) доходит заметно чаще
        var len = Math.max(Math.hypot(br.x - bp.x, br.y - bp.y), 45), fr = (now * 60 / len) % 1;
        var dx = bp.x + (br.x - bp.x) * fr, dy = bp.y + (br.y - bp.y) * fr;
        g.beginPath(); g.arc(dx, dy, 3, 0, 7); g.fillStyle = fr > .82 ? '#ff8a7a' : '#e87a52'; g.fill();
        if (fr > .85){ g.beginPath(); g.arc(br.x, br.y, 7, 0, 7); g.strokeStyle = 'rgba(192,69,63,' + (0.35 + 0.5 * Math.sin(now * 14)) + ')'; g.lineWidth = 2; g.stroke(); }
      }
    }
    requestAnimationFrame(kadr);
  }
  function risovat(){
    if (solved){ situaciyaEl.textContent = ''; voprosEl.textContent = ''; progressEl.textContent = ''; variantsEl.innerHTML = ''; return; }
    var fork = R[step]; raz = fork;
    situaciyaEl.textContent = fork.situaciya_ru;
    voprosEl.textContent = fork.vopros_ru;
    progressEl.textContent = d.progress_ru.replace('{n}', step + 1).replace('{vsego}', R.length);
    variantsEl.innerHTML = '';
    for (var i = 0; i < 2; i++){
      (function(v){
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'btn ghost'; b.textContent = v.tekst;
        b.style.cssText = BTN + (gone[v.kod] ? ';opacity:.4;text-decoration:line-through;cursor:default' : '');
        if (gone[v.kod]) b.disabled = true;
        b.addEventListener('click', function(){ otvet(v); });
        variantsEl.appendChild(b);
      })(fork.varianty[sides[i]]);
    }
  }
  function otvet(v){
    if (solved || gone[v.kod]) return;
    if (v.verno){
      gone = {};
      if (step >= R.length - 1){ solved = true; ctx.ochki('pobeda', d.pobeda.ochki); ctx.itog(d.pobeda.soobshchenie_ru, 'ok'); }
      else { ctx.itog(raz.verno_ru, 'ok'); step++; }
      peremeshay(); risovat();
    } else {
      gone[v.kod] = true; ctx.itog(raz.net_ru, 'bad'); risovat();
    }
  }
  function peremeshay(){ var s = [0, 1]; if (Math.random() < .5) s = [1, 0]; sides = s; }
  function zanovo(){ step = 0; gone = {}; solved = false; peremeshay(); risovat(); ctx.itog(d.zanovo_ru); }

  peremeshay(); risovat(); ctx.itog(d.start_ru); kadr();
  return { zanovo: zanovo };
});
