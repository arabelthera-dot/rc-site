/* Механика tri-negativa (первый день — 02-19 «Изобретений», цветная фотография Прокудина-Горского): камера снимает
   один вид трижды — через красное, зелёное и синее стекло; три чёрно-белых кадра, каждый хранит свой цвет. При показе
   их совмещают, и цвета складываются в цветной кадр. Здесь три цветных канала-негатива сдвинуты — тянешь их на место
   (мышь/палец) или выбираешь кнопкой и двигаешь стрелками; канал защёлкивается, все три — цветная фотография.
   Всё из dannye (схема в src/lib/igry-mehaniki.ts): цвета и имена каналов, допуск, сдвиг, шаг, все тексты. На холсте —
   только рисунок (небо, солнце, храм с куполом, луг) без надписей и эмодзи (Р18); слова — вёрсткой под холстом. */
RCIgry.dvizhok('tri-negativa', function(ctx){
  var d = ctx.dannye, m = ctx.mesto;
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
  var KRUG = Math.PI * 2;

  // Каркас: холст, кнопки каналов (для клавиатуры), подсказка и счётчик.
  m.innerHTML = '<div style="position:relative;aspect-ratio:4/3;background:#05070c;border:1px solid rgba(255,255,255,.08);' +
    'border-radius:12px;overflow:hidden;touch-action:none;margin-bottom:6px">' +
    '<canvas role="img" style="display:block;width:100%;height:100%;cursor:grab;touch-action:none"></canvas></div>' +
    '<div style="font-size:12px;color:var(--muted);text-align:center;margin-bottom:10px" data-podpis></div>' +
    '<div role="group" aria-label="каналы" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px" data-kanaly></div>' +
    '<div style="font-size:13px;color:var(--muted);margin-bottom:2px" data-vyberi></div>' +
    '<div style="font-size:14px;min-height:1.4em" data-status></div>';
  var cv = m.querySelector('canvas'), g = cv.getContext('2d');
  var kanalyEl = m.querySelector('[data-kanaly]'), vyberiEl = m.querySelector('[data-vyberi]'), statusEl = m.querySelector('[data-status]');
  cv.setAttribute('aria-label', d.scena.alt);
  m.querySelector('[data-podpis]').textContent = d.scena.podpis_ru;
  vyberiEl.textContent = d.vyberi_ru;

  // Каналы: dx/dy — текущий сдвиг, locked — лёг на место (стоит ровно по центру).
  var kanaly = d.kanaly.map(function(k){ return { kod: k.kod, cvet: k.cvet, imya: k.imya_ru, dx: 0, dy: 0, locked: false }; });
  var aktiv = 0, drag = null;

  function rndSdvig(){
    // сдвиг заведомо больше допуска, чтобы канал не защёлкнулся сразу
    var ang = Math.random() * KRUG, r = d.dopusk * 1.6 + Math.random() * (d.sdvig - d.dopusk * 1.6);
    return { dx: Math.cos(ang) * r, dy: Math.sin(ang) * r };
  }

  var W, H, P, px, py; // P — сторона «пластины» (кадра), px/py — её левый верхний угол
  function resize(){
    W = cv.width = cv.offsetWidth || 300; H = cv.height = cv.offsetHeight || 225;
    P = Math.min(W, H) * 0.74; px = (W - P) / 2; py = (H - P) / 2;
  }
  resize(); window.addEventListener('resize', resize);

  // Рисует один кадр (сцену) в прямоугольнике o; ch — номер канала (0/1/2) или null для полного цвета.
  function scen(o, ch){
    function col(r, gr, b){
      if (ch == null) return 'rgb(' + r + ',' + gr + ',' + b + ')';
      var c = ch === 0 ? r : ch === 1 ? gr : b;
      return 'rgb(' + (ch === 0 ? c : 0) + ',' + (ch === 1 ? c : 0) + ',' + (ch === 2 ? c : 0) + ')';
    }
    var X = o.x, Y = o.y, W2 = o.w, H2 = o.h;
    g.fillStyle = col(120, 170, 215); g.fillRect(X, Y, W2, H2 * 0.62);          // небо
    g.fillStyle = col(250, 225, 140); g.beginPath(); g.arc(X + W2 * 0.82, Y + H2 * 0.15, W2 * 0.085, 0, KRUG); g.fill(); // солнце
    g.fillStyle = col(95, 150, 85); g.fillRect(X, Y + H2 * 0.58, W2, H2 * 0.42); // луг
    g.fillStyle = col(105, 155, 205); g.fillRect(X, Y + H2 * 0.63, W2, H2 * 0.10); // река
    g.fillStyle = col(235, 228, 210); g.fillRect(X + W2 * 0.34, Y + H2 * 0.32, W2 * 0.20, H2 * 0.30); // корпус храма
    g.fillStyle = col(60, 120, 70); g.beginPath(); g.moveTo(X + W2 * 0.32, Y + H2 * 0.32); g.lineTo(X + W2 * 0.44, Y + H2 * 0.18); g.lineTo(X + W2 * 0.56, Y + H2 * 0.32); g.closePath(); g.fill(); // крыша
    g.fillStyle = col(225, 175, 70); g.beginPath(); g.arc(X + W2 * 0.44, Y + H2 * 0.17, W2 * 0.055, 0, KRUG); g.fill(); // купол
    g.fillStyle = col(235, 228, 210); g.fillRect(X + W2 * 0.421, Y + H2 * 0.16, W2 * 0.038, H2 * 0.05); // барабан
    g.fillStyle = col(225, 175, 70); g.fillRect(X + W2 * 0.439, Y + H2 * 0.05, W2 * 0.003, H2 * 0.11); // шпиль
  }

  function risovat(){
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#05070c'; g.fillRect(0, 0, W, H);
    // три канала складываются по свету (аддитивно) — красный + зелёный + синий дают цветную картину
    g.globalCompositeOperation = 'lighter';
    kanaly.forEach(function(k, i){
      g.save(); g.translate(k.dx, k.dy); scen({ x: px, y: py, w: P, h: P }, i); g.restore();
    });
    g.globalCompositeOperation = 'source-over';
    // рамка-ориентир, куда должны лечь каналы
    g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1.5; g.setLineDash([6, 6]);
    g.strokeRect(px - 3, py - 3, P + 6, P + 6); g.setLineDash([]);
    // метки каналов — за них тянем
    kanaly.forEach(function(k, i){
      if (k.locked) return;
      var hx = W / 2 + k.dx, hy = H / 2 + k.dy;
      g.beginPath(); g.arc(hx, hy, 9, 0, KRUG); g.fillStyle = 'rgb(' + k.cvet.join(',') + ')'; g.fill();
      g.lineWidth = 2.5; g.strokeStyle = i === aktiv ? '#fff' : 'rgba(255,255,255,.5)'; g.stroke();
    });
  }
  function kadr(){ risovat(); }

  function ostalos(){ return kanaly.filter(function(k){ return !k.locked; }).length; }
  function status(){ statusEl.textContent = d.status_ru.replace('{n}', ostalos()); }

  function knopki(){
    kanalyEl.innerHTML = '';
    kanaly.forEach(function(k, i){
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('data-kanal', i);
      b.innerHTML = '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:rgb(' + k.cvet.join(',') + ');margin-right:6px"></span>' + esc(k.imya);
      b.style.cssText = 'padding:8px 14px;min-height:44px;border-radius:999px;font:inherit;font-size:13px;font-weight:600;color:#fff;' +
        'border:2px solid rgba(255,255,255,.18);background:rgba(10,20,35,.7);cursor:pointer';
      b.addEventListener('click', function(){ aktiv = i; b.focus(); risovat(); });
      kanalyEl.appendChild(b);
    });
  }
  function podsvetit(){ kanalyEl.querySelectorAll('[data-kanal]').forEach(function(b, i){ b.style.borderColor = i === aktiv ? '#fff' : 'rgba(255,255,255,.18)'; }); }

  function snap(i){
    if (kanaly[i].locked) return;
    if (Math.hypot(kanaly[i].dx, kanaly[i].dy) < d.dopusk) {
      kanaly[i].locked = true; kanaly[i].dx = 0; kanaly[i].dy = 0;
      if (ostalos() === 0) { ctx.itog(d.pobeda.soobshchenie_ru, 'ok'); ctx.ochki('pobeda', d.pobeda.ochki); statusEl.textContent = ''; }
      else { ctx.itog(d.sovpalo_ru.replace('{k}', kanaly[i].imya), 'ok'); }
    }
    status(); risovat();
  }

  // Мышь и палец: тянешь метку канала (или ближайшую к месту касания) на место.
  cv.addEventListener('pointerdown', function(e){
    var r = cv.getBoundingClientRect();
    var mx = e.clientX - r.left, my = e.clientY - r.top, best = -1, bd = 1e9;
    kanaly.forEach(function(k, i){
      if (k.locked) return;
      var hx = W / 2 + k.dx, hy = H / 2 + k.dy, dd = (hx - mx) * (hx - mx) + (hy - my) * (hy - my);
      if (dd < bd) { bd = dd; best = i; }
    });
    if (best < 0) return;
    drag = { i: best, mx: mx, my: my, odx: kanaly[best].dx, ody: kanaly[best].dy };
    aktiv = best; podsvetit(); risovat();
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', function(e){
    if (!drag) return;
    var r = cv.getBoundingClientRect();
    kanaly[drag.i].dx = drag.odx + (e.clientX - r.left - drag.mx);
    kanaly[drag.i].dy = drag.ody + (e.clientY - r.top - drag.my);
    snap(drag.i);
  });
  function koniecDrag(){ drag = null; }
  cv.addEventListener('pointerup', koniecDrag);
  cv.addEventListener('pointercancel', koniecDrag);

  // Клавиатура: Tab до кнопки канала, стрелками двигаешь выбранный канал.
  m.addEventListener('keydown', function(e){
    var ddx = 0, ddy = 0;
    if (e.key === 'ArrowLeft') ddx = -d.shag; else if (e.key === 'ArrowRight') ddx = d.shag;
    else if (e.key === 'ArrowUp') ddy = -d.shag; else if (e.key === 'ArrowDown') ddy = d.shag; else return;
    var i = aktiv;
    if (e.target && e.target.getAttribute && e.target.getAttribute('data-kanal') != null) i = +e.target.getAttribute('data-kanal');
    if (i == null || kanaly[i].locked) return;
    e.preventDefault(); aktiv = i; podsvetit();
    kanaly[i].dx += ddx; kanaly[i].dy += ddy; snap(i);
  });

  function zanovo(){
    ctx.itog('');
    kanaly.forEach(function(k){ var o = rndSdvig(); k.dx = o.dx; k.dy = o.dy; k.locked = false; });
    aktiv = 0; drag = null; podsvetit(); status(); risovat();
  }
  knopki(); podsvetit(); zanovo();
  return { zanovo: zanovo };
});
