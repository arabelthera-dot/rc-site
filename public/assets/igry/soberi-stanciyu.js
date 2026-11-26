/* Механика soberi-stanciyu (первый день — 02-20 «Изобретений», станция «Мир»): пристыковываешь модули станции
   один за другим в правильном порядке; верный причаливает к каркасу, неверный подсказывает.
   Модули, их порядок, подписи, сообщения и баллы — из dannye (схема в src/lib/igry-mehaniki.ts). Каркас станции —
   рисунок холста без надписей и эмодзи (Р18): хребет, солнечные батареи и слоты стыковки.
   Мышь и палец — нажатие на кнопку модуля, клавиатура — Tab и Enter по тем же кнопкам. */
RCIgry.dvizhok('soberi-stanciyu', function(ctx){
  var d = ctx.dannye, m = ctx.mesto, M = d.moduli;
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
  var BTN = 'cursor:pointer;font:inherit;font-size:14.5px;font-weight:600;padding:12px 14px;min-height:48px;' +
    'display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box';
  m.innerHTML = '<div>' +
    '<canvas width="640" height="220" role="img" aria-label="' + esc(d.scena.alt) + '" style="display:block;width:100%;height:auto;border-radius:10px;background:#101722"></canvas>' +
    (d.scena.podpis_ru ? '<div style="font-size:12.5px;color:#8fa5b9;margin-top:6px">' + esc(d.scena.podpis_ru) + '</div>' : '') +
    '<div style="font-size:13px;color:var(--muted);margin:12px 0 6px" data-ostalos></div>' +
    '<div role="group" data-moduli style="display:flex;flex-wrap:wrap;gap:10px"></div>' +
    '</div>';
  var cv = m.querySelector('canvas'), g = cv.getContext('2d');
  var ostalosEl = m.querySelector('[data-ostalos]'), moduliEl = m.querySelector('[data-moduli]');

  var W = 640, H = 220, t0 = Date.now();
  var poradok = [], docked = 0, pulse = 0;
  var PALITRA = ['#c9a84c','#5f9ea0','#b06a5a','#7a8f5f','#6f8fb0','#9a6f9a','#c98a5a','#7fb3a2','#b0809a','#8aa07a'];

  function rr(c, x, y, w, h, r){ c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); c.fill(); c.stroke(); }
  function pal(i){ return PALITRA[i % PALITRA.length]; }

  function risuy(){
    g.clearRect(0, 0, W, H);
    // звёзды-фон (декор, без надписей)
    var seed = 7;
    for (var s = 0; s < 42; s++){
      seed = (seed * 16807) % 2147483647;
      var sx = (seed / 2147483647) * W;
      seed = (seed * 16807) % 2147483647;
      var sy = (seed / 2147483647) * H * 0.9;
      var sr = 0.6 + ((seed % 10) / 10) * 1.1;
      g.fillStyle = 'rgba(255,255,255,' + (0.18 + (seed % 10) / 22) + ')';
      g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill();
    }
    var n = M.length;
    var x0 = 48, x1 = W - 48, spineY = H * 0.62;
    // солнечные батареи — две широкие полосы над каркасом (декор)
    g.fillStyle = 'rgba(95,158,160,.20)';
    g.strokeStyle = 'rgba(255,255,255,.12)';
    g.lineWidth = 1;
    for (var p = 0; p < 3; p++){
      var px = x0 + 26 + p * 60, pw = 30;
      rr(g, px, spineY - 66, pw, 42, 3);
    }
    for (var q = 0; q < 3; q++){
      var qx = x1 - 60 - q * 60, qw = 30;
      rr(g, qx, spineY - 66, qw, 42, 3);
    }
    // хребет станции
    g.fillStyle = 'rgba(255,255,255,.10)';
    rr(g, x0, spineY - 6, x1 - x0, 12, 6);
    // слоты стыковки
    for (var i = 0; i < n; i++){
      var x = x0 + (i + 0.5) * (x1 - x0) / n;
      if (i < docked){
        g.fillStyle = pal(i);
        g.beginPath(); g.arc(x, spineY, 16, 0, 7); g.fill();
        g.fillStyle = 'rgba(255,255,255,.28)';
        g.beginPath(); g.arc(x, spineY, 7, 0, 7); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.5)';
        g.lineWidth = 1.5;
        rr(g, x - 9, spineY - 30, 18, 24, 4);
      } else {
        g.strokeStyle = 'rgba(255,255,255,.30)';
        g.lineWidth = 1.6;
        g.beginPath(); g.arc(x, spineY, 16, 0, 7); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,.12)';
        g.beginPath(); g.arc(x, spineY, 9, 0, 7); g.stroke();
      }
      if (i === docked - 1 && pulse > 0){
        g.strokeStyle = 'rgba(255,255,255,' + (0.8 * pulse) + ')';
        g.lineWidth = 2.5;
        g.beginPath(); g.arc(x, spineY, 20 + (1 - pulse) * 10, 0, 7); g.stroke();
      }
    }
  }

  function ostalos(){
    var o = M.length - docked;
    ostalosEl.textContent = o > 0 ? d.ostalos_ru.replace('{n}', o) : '';
  }

  function knopki(){
    moduliEl.innerHTML = '';
    for (var i = 0; i < poradok.length; i++){
      (function(idx){
        var mod = M[idx];
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'btn ghost';
        b.textContent = mod.nazvanie;
        var st = BTN + ';flex:1 1 140px;color:' + pal(idx);
        if (idx < docked){ st += ';opacity:.35;text-decoration:line-through;cursor:default'; b.disabled = true; }
        else st += ';border-color:' + pal(idx);
        b.style.cssText = st;
        b.addEventListener('click', function(){ stykovat(idx); });
        moduliEl.appendChild(b);
      })(poradok[i]);
    }
  }

  function stykovat(idx){
    if (idx !== docked){ ctx.itog(d.mimo_ru, 'bad'); return; }
    var mod = M[idx];
    docked++; pulse = 1;
    if (docked >= M.length){
      ctx.ochki('pobeda', d.pobeda.ochki);
      ctx.itog(d.pobeda.soobshchenie_ru, 'ok');
    } else {
      ctx.itog(d.pristykovan_ru.replace('{modul}', mod.nazvanie).replace('{podpis}', mod.podpis), 'ok');
    }
    knopki(); ostalos();
  }

  function peremeshay(){
    poradok = [];
    for (var i = 0; i < M.length; i++) poradok.push(i);
    for (var i = M.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var t = poradok[i]; poradok[i] = poradok[j]; poradok[j] = t;
    }
  }

  function zanovo(){ docked = 0; pulse = 0; peremeshay(); knopki(); ostalos(); ctx.itog(d.vyberi_ru); }

  function kadr(){
    if (pulse > 0){ pulse -= 0.04; if (pulse < 0) pulse = 0; }
    risuy();
    requestAnimationFrame(kadr);
  }

  peremeshay(); knopki(); ostalos(); ctx.itog(d.vyberi_ru); kadr();
  return { zanovo: zanovo };
});
