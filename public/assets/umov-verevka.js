/* Игра «Верёвка с колокольчиком» — 23 января, Николай Умов, поток энергии (1874).
   Движок: струна (волновое уравнение, число Куранта 1 — импульс бежит без искажений),
   левый конец — ручка посетителя, правый — колокольчик (поглощающий конец, энергия уходит в него),
   «палец» — закреплённая точка (полное отражение). Слой «глазами Умова» рисует плотность энергии
   w = ½(v² + c²·y'²) светящимся сгустком и стрелку по знаку потока S = −v·y'.
   Мировая практика: PhET «Wave on a String» (ручка + кнопка импульса, закреплённый конец, замедление),
   Exploratorium (просто дёрни — эффект без таблички). Р183, черновик для показа Сергею (Р177). */
(function () {
  'use strict';
  var root = document.querySelector('[data-umov-igra]');
  if (!root) return;
  var cv = root.querySelector('canvas');
  var ctx = cv.getContext('2d');
  var $ = function (s) { return root.querySelector(s); };
  var elTask = $('.uv-task'), elSub = $('.uv-sub'), elMeter = $('.uv-meter'), elMeterFill = $('.uv-meter-fill');
  var btnPull = $('.uv-pull'), btnEye = $('.uv-eye'), btnPin = $('.uv-pin'), btnAgain = $('.uv-again');
  var steps = root.querySelectorAll('.uv-steps li');
  var finale = $('.uv-finale');

  var N = 150;                 // узлов на верёвке
  var y = new Float32Array(N + 1), yOld = new Float32Array(N + 1), yNew = new Float32Array(N + 1);
  var W = 390, H = 280, dpr = 1, x0 = 40, x1 = 330, ry = 160, dx = 2;
  var DAMP = 0.998;            // трение: верёвка понемногу успокаивается и выпрямляется
  var STEPS_PER_SEC = 95;      // ≈1,6 с до колокольчика; «глазами Умова» — вдвое медленнее
  var acc = 0, last = 0;

  var hand = 0;                // смещение ручки, px
  var drag = null;             // {startY, y0, t0, moved}
  var spring = 0;              // скорость возврата ручки после отпускания
  var script = null;           // готовый рывок кнопкой: {t, T, A}
  var pin = -1;                // узел под пальцем, −1 — нет
  var umov = false;
  var step = 1, done = false;
  var bell = { a: 0, w: 0, ring: 0, glow: 0 };
  var ev = null;               // текущий рывок: {absorbed, launchE, t, umov, pin, ringed, peak}
  var E_REF = 1, THRESH = 1;
  var hintT = 0;
  var audio = null, lastRatio = 0;

  function layout() {
    var r = cv.getBoundingClientRect();
    W = Math.max(300, r.width); H = Math.max(220, r.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    x0 = Math.max(44, W * 0.09); x1 = W - Math.max(70, W * 0.13);
    ry = H * 0.56; dx = (x1 - x0) / N;
  }
  function amp() { return H * 0.17; }        // рывок кнопкой
  function maxHand() { return H * 0.36; }

  /* ---------- физика ---------- */
  function driveLeft(dt) {
    if (script) {
      script.t += dt;
      var p = script.t / script.T;
      hand = p >= 1 ? 0 : -script.A * Math.sin(Math.PI * p);
      if (p >= 1) script = null;
    } else if (!drag) {
      // пружинка возвращает ручку в покой — это вторая половина рывка
      spring += (-hand * 900 - spring * 42) * dt;
      hand += spring * dt;
      if (Math.abs(hand) < 0.05 && Math.abs(spring) < 0.5) { hand = 0; spring = 0; }
    }
  }
  function simStep(sim) {
    var s = sim || state;
    var a = s.y, o = s.yOld, n = s.yNew, i;
    n[0] = s.hand;
    for (i = 1; i < N; i++) n[i] = (a[i + 1] + a[i - 1] - o[i]) * DAMP;   // схема устойчива ровно при Куранте 1
    n[N] = a[N - 1];                        // поглощающий конец (Мур, Куранта 1): энергия уходит в колокольчик
    if (s.pin > 0) n[s.pin] = 0;            // палец держит верёвку — отражение
    var out = n[N] - a[N];
    s.absorbed += out * out;
    s.yOld = a; s.y = n; s.yNew = o;
    return out;
  }
  var state = { y: y, yOld: yOld, yNew: yNew, hand: 0, pin: -1, absorbed: 0 };

  function calibrate() {
    // энергия эталонного рывка кнопкой, доехавшая до колокольчика
    var s = { y: new Float32Array(N + 1), yOld: new Float32Array(N + 1), yNew: new Float32Array(N + 1), hand: 0, pin: -1, absorbed: 0 };
    var T = 0.22, A = amp(), t = 0, dtS = 1 / STEPS_PER_SEC;
    for (var k = 0; k < N * 3; k++) {
      t += dtS;
      s.hand = t < T ? -A * Math.sin(Math.PI * t / T) : 0;
      simStep(s);
    }
    E_REF = s.absorbed || 1;
    THRESH = E_REF * 0.55;
  }

  function energyAt(i) {
    var v = state.y[i] - state.yOld[i];
    var g = (state.y[Math.min(N, i + 1)] - state.y[i]);
    return 0.5 * (v * v + g * g);
  }
  function fluxAt(i) {
    var v = state.y[i] - state.yOld[i];
    var g = (state.y[Math.min(N, i + 1)] - state.y[Math.max(0, i - 1)]) / 2;
    return -v * g;
  }

  /* ---------- события игры ---------- */
  function launchCheck(dt) {
    var moving = Math.abs(state.hand) > 2;
    if (moving && !ev) {
      ev = { absorbed: 0, t: 0, umov: umov, pin: pin > 0, ringed: false, rest: 0, sinceRing: 0 };
      if (window.rcUmovLog) window.rcUmovLog('рывок');
    }
    if (!ev) return;
    ev.t += dt;
    if (umov) ev.umov = true;
    if (pin > 0) ev.pin = true;
    var travel = N / STEPS_PER_SEC;
    // итог рывка: звон — сразу, иначе — когда посылка точно успела бы доехать после того, как ручку отпустили
    if (drag || script || Math.abs(state.hand) > 0.5) ev.rest = 0; else ev.rest += dt * (umov ? 0.5 : 1);
    if (ev.ringed) ev.sinceRing += dt;
    if (ev.sinceRing > 0.6 || ev.rest > travel * 1.25 || ev.t > 30) finish();
  }
  function finish() {
    var e = ev; ev = null;
    var ratio = e.absorbed / THRESH; lastRatio = ratio;
    showMeter(ratio);
    if (step === 1) {
      if (e.ringed) { pass(2); }
      else if (ratio > 0.05) say('Почти! Не хватило силы', 'Потяни ручку пальцем вниз подальше и отпусти — или нажми «Дёрнуть»');
      else if (e.pin) say('Палец мешает — убери его и дёрни', '');
    } else if (step === 2) {
      if (e.umov && ratio > 0.05) pass(3);
      else if (!e.umov) say('Сначала нажми на глаз', 'Он покажет, что едет по верёвке');
    } else if (step === 3) {
      if (e.pin && !e.ringed) pass(4);
      else if (!e.pin) say('Прижми верёвку пальцем — коснись её посередине', 'Или нажми кнопку с пальцем внизу');
      else say('Посылка проскочила — прижми ближе к колокольчику', '');
    }
  }
  function onAbsorb(out) {
    if (!ev) return;
    ev.absorbed += out * out;
    bell.w += out * 0.004;
    if (!ev.ringed && ev.absorbed >= THRESH) {
      ev.ringed = true; bell.ring = 1.6; bell.w += 2.2 * (out >= 0 ? 1 : -1);
      ding(Math.min(1, ev.absorbed / E_REF));
    }
  }

  /* ---------- шаги ---------- */
  var TEXT = {
    1: ['Позвони в колокольчик', 'Дёрни верёвку за ручку слева'],
    2: ['Звенит! А что едет по верёвке?', 'Нажми на глаз и дёрни ещё раз'],
    3: ['А теперь не дай ему зазвонить', 'Прижми верёвку пальцем посередине и дёрни'],
    4: ['Получилось!', '']
  };
  function pass(n) {
    step = n;
    steps.forEach(function (li, k) { li.classList.toggle('on', k + 1 === n); li.classList.toggle('ok', k + 1 < n); });
    btnEye.hidden = n < 2; btnPin.hidden = n < 3;
    if (n > 1 && n < 4) elMeter.hidden = true;
    btnEye.classList.toggle('zov', n === 2 && !umov);
    btnPin.classList.toggle('zov', n === 3 && pin < 0);
    if (n === 2) say(TEXT[2][0], TEXT[2][1]);
    if (n === 3) say(TEXT[3][0], TEXT[3][1]);
    if (n === 4) { done = true; finale.hidden = false; setTimeout(function () { finale.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 1200); say('Получилось! Колокольчик молчит', 'Посылка упёрлась в палец и поехала назад'); }
  }
  function say(a, b) { elTask.textContent = a; elSub.textContent = b || ''; }
  function showMeter(r) {
    elMeter.hidden = false;
    elMeterFill.style.width = Math.max(4, Math.min(100, r * 66.7)) + '%';
    elMeter.classList.toggle('ok', r >= 1);
  }

  /* ---------- звук ---------- */
  function ding(power) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var t = audio.currentTime, g = audio.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18 + 0.2 * power, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      g.connect(audio.destination);
      [1318, 2637, 3520].forEach(function (f, k) {
        var o = audio.createOscillator(), og = audio.createGain();
        o.frequency.value = f; og.gain.value = [1, 0.35, 0.18][k];
        o.connect(og); og.connect(g); o.start(t); o.stop(t + 1.9);
      });
    } catch (e) { /* без звука */ }
  }

  /* ---------- ввод ---------- */
  function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function nearRope(p) {
    if (p.x < x0 + (x1 - x0) * 0.12 || p.x > x1 - 10) return -1;
    var i = Math.round((p.x - x0) / dx);
    return Math.abs(p.y - (ry + state.y[i])) < 46 ? i : -1;
  }
  cv.addEventListener('pointerdown', function (e) {
    var p = pos(e);
    hintT = -1;
    if (p.x < x0 + Math.max(70, (x1 - x0) * 0.22)) {
      cv.setPointerCapture(e.pointerId);
      drag = { startY: p.y, h0: state.hand, t0: performance.now(), moved: 0 };
      script = null; spring = 0;
      e.preventDefault();
      return;
    }
    if (step >= 3) {
      var i = nearRope(p);
      if (i > 0) { setPin(pin === i ? -1 : i); e.preventDefault(); }
    }
  });
  cv.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var p = pos(e), m = maxHand();
    drag.moved = Math.max(drag.moved, Math.abs(p.y - drag.startY));
    hand = Math.max(-m, Math.min(m, drag.h0 + (p.y - drag.startY) * 1.15));
  });
  function up() {
    if (!drag) return;
    var quick = drag.moved < 8 && performance.now() - drag.t0 < 400;
    drag = null;
    if (quick) pull();
  }
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);

  function pull(strong) {
    hintT = -1;
    script = { t: 0, T: 0.22, A: amp() * (strong ? 1.5 : 1) };
  }
  function setPin(i) {
    pin = i; state.pin = i;
    btnPin.setAttribute('aria-pressed', pin > 0 ? 'true' : 'false');
    btnPin.classList.toggle('zov', step === 3 && pin < 0);
    if (step === 3 && pin > 0) say('Палец держит верёвку. Теперь дёрни!', '');
  }
  btnPull.addEventListener('click', function () { pull(false); });
  btnEye.addEventListener('click', function () {
    umov = !umov;
    btnEye.setAttribute('aria-pressed', umov ? 'true' : 'false');
    btnEye.classList.remove('zov');
    root.classList.toggle('umov', umov);
    if (step === 2 && umov) say('Глазами Умова. Дёрни!', 'Смотри, что поедет к колокольчику');
  });
  btnPin.addEventListener('click', function () { setPin(pin > 0 ? -1 : Math.round(N * 0.55)); });
  btnAgain.addEventListener('click', function () {
    finale.hidden = true; done = false; setPin(-1); umov = false; root.classList.remove('umov');
    btnEye.setAttribute('aria-pressed', 'false'); elMeter.hidden = true; hintT = 0; pass(1); say(TEXT[1][0], TEXT[1][1]);
  });
  root.addEventListener('keydown', function (e) {
    if (e.target === cv && (e.key === ' ' || e.key === 'Enter')) { pull(e.shiftKey); e.preventDefault(); }
  });

  /* ---------- рисование ---------- */
  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // пол и стойка
    ctx.fillStyle = umov ? 'rgba(4,8,16,.55)' : 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(201,168,76,.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H - 18); ctx.lineTo(W, H - 18); ctx.stroke();
    drawPost();

    // верёвка
    var pts = [];
    for (var i = 0; i <= N; i++) pts.push([x0 + i * dx, ry + state.y[i]]);
    if (umov) drawEnergy(pts);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = umov ? 'rgba(214,190,150,.35)' : '#d8bf8f';
    ctx.lineWidth = umov ? 3 : 4.5;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i <= N; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    if (!umov) { // волокна верёвки
      ctx.strokeStyle = 'rgba(120,90,50,.55)'; ctx.lineWidth = 1.2;
      for (i = 2; i < N; i += 4) { ctx.beginPath(); ctx.moveTo(pts[i][0] - 2, pts[i][1] - 2); ctx.lineTo(pts[i][0] + 2, pts[i][1] + 2); ctx.stroke(); }
    }
    drawHandle(pts[0], now);
    if (pin > 0) drawFinger(pts[pin], false);
    drawBell();
    if (hintT >= 0) drawHint(now);
    if (step === 3 && pin < 0 && hintT < 0) drawPinHint(now);
  }
  function drawPost() {
    var bx = x1 + Math.max(26, W * 0.045);
    ctx.fillStyle = '#3b2c1c';
    ctx.fillRect(bx + 18, ry - H * 0.42, 8, H * 0.42 + (H - 18 - ry));
    ctx.fillRect(bx - 6, ry - H * 0.42, 32, 7);
  }
  function drawBell() {
    var bx = x1 + Math.max(26, W * 0.045), topY = ry - H * 0.42 + 7;
    var len = H * 0.2;
    ctx.save();
    ctx.translate(bx, topY);
    ctx.rotate(bell.a);
    // подвес
    ctx.strokeStyle = '#9a7b3c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, len); ctx.stroke();
    // язычок
    ctx.fillStyle = '#6b5426';
    ctx.beginPath(); ctx.arc(Math.sin(-bell.a * 2) * 6, len + 30, 4.5, 0, 7); ctx.fill();
    // колокол
    var s = Math.min(1.25, Math.max(0.85, H / 280));
    ctx.translate(0, len);
    if (bell.glow > 0.01) { ctx.shadowColor = 'rgba(255,214,120,' + bell.glow + ')'; ctx.shadowBlur = 30 * bell.glow; }
    var gr = ctx.createLinearGradient(-22 * s, 0, 22 * s, 0);
    gr.addColorStop(0, '#8d6b25'); gr.addColorStop(0.45, '#f0d27d'); gr.addColorStop(1, '#9c7a2e');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(-6 * s, 0); ctx.quadraticCurveTo(-14 * s, 2 * s, -16 * s, 18 * s);
    ctx.quadraticCurveTo(-18 * s, 30 * s, -25 * s, 34 * s); ctx.lineTo(25 * s, 34 * s);
    ctx.quadraticCurveTo(18 * s, 30 * s, 16 * s, 18 * s); ctx.quadraticCurveTo(14 * s, 2 * s, 6 * s, 0); ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
    // звон — дуги вокруг колокольчика
    if (bell.ring > 0.02) {
      var cx = bx, cy = topY + len + 18;
      ctx.strokeStyle = 'rgba(255,220,140,' + Math.min(1, bell.ring) + ')'; ctx.lineWidth = 2.5;
      for (var k = 1; k <= 3; k++) {
        var r = 26 + k * 11 + (1.6 - bell.ring) * 16;
        ctx.beginPath(); ctx.arc(cx, cy, r, -0.6, 0.6); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI - 0.6, Math.PI + 0.6); ctx.stroke();
      }
    }
    // перемычка от верёвки к колоколу
    ctx.strokeStyle = umov ? 'rgba(214,190,150,.35)' : '#d8bf8f'; ctx.lineWidth = umov ? 3 : 4.5;
    ctx.beginPath(); ctx.moveTo(x1, ry + state.y[N]);
    ctx.lineTo(bx + Math.sin(bell.a) * len * 0.9, topY + Math.cos(bell.a) * len * 0.9); ctx.stroke();
  }
  function drawHandle(p, now) {
    ctx.fillStyle = '#6b4a24';
    ctx.strokeStyle = '#e4c97a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(p[0] - 16, p[1], 13, 20, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(6,12,23,.9)';
    ctx.beginPath(); ctx.ellipse(p[0] - 16, p[1], 5, 10, 0, 0, 7); ctx.fill();
  }
  function drawFinger(p, ghost) {
    var x = p[0], yy = p[1];
    ctx.save();
    ctx.globalAlpha = ghost ? 0.75 : 1;
    ctx.fillStyle = ghost ? '#f6e2c6' : '#f0c9a0';
    ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 9, yy - 60); ctx.lineTo(x - 9, yy - 8);
    ctx.quadraticCurveTo(x - 9, yy + 2, x, yy + 2); ctx.quadraticCurveTo(x + 9, yy + 2, x + 9, yy - 8);
    ctx.lineTo(x + 9, yy - 60); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath(); ctx.ellipse(x, yy - 9, 5, 6, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  function drawHint(now) {
    // призрачная рука тянет ручку вниз-вверх: подсказка действием, без слов
    var t = (now / 1000) % 1.8, k = t < 0.9 ? Math.sin(Math.PI * t / 0.9) : 0;
    var hx = x0 - 16, hy = ry + k * H * 0.16;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = 'rgba(228,201,122,.9)'; ctx.lineWidth = 2.5;
    // стрелки ↕
    ctx.beginPath();
    ctx.moveTo(hx + 26, ry - 26); ctx.lineTo(hx + 26, ry + 34);
    ctx.moveTo(hx + 20, ry - 18); ctx.lineTo(hx + 26, ry - 26); ctx.lineTo(hx + 32, ry - 18);
    ctx.moveTo(hx + 20, ry + 26); ctx.lineTo(hx + 26, ry + 34); ctx.lineTo(hx + 32, ry + 26);
    ctx.stroke();
    // пульсирующее кольцо вокруг ручки
    ctx.strokeStyle = 'rgba(228,201,122,' + (0.6 - 0.6 * ((now / 1000) % 1)) + ')';
    ctx.beginPath(); ctx.arc(hx, ry, 24 + 14 * ((now / 1000) % 1), 0, 7); ctx.stroke();
    ctx.restore();
    drawFinger([hx, hy + 2], true);
  }
  function drawPinHint(now) {
    var i = Math.round(N * 0.55), p = [x0 + i * dx, ry];
    var k = Math.abs(Math.sin(now / 450));
    ctx.save(); ctx.globalAlpha = 0.45 + 0.4 * k;
    drawFinger([p[0], p[1] - 14 * k], true);
    ctx.strokeStyle = 'rgba(228,201,122,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p[0], p[1], 10 + 10 * k, 0, 7); ctx.stroke();
    ctx.restore();
  }
  function drawEnergy(pts) {
    // светящийся сгусток: толщина ~ корень плотности энергии
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (var i = 0; i < N; i++) {
      var e = energyAt(i);
      if (e < 0.004) continue;
      var w = Math.min(H * 0.13, 3 + Math.sqrt(e) * 1.5);
      var a = Math.min(0.85, 0.18 + Math.sqrt(e) * 0.07);
      ctx.strokeStyle = 'rgba(255,140,30,' + (a * 0.22) + ')'; ctx.lineWidth = w * 1.8;
      ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,190,80,' + a * 0.6 + ')'; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke();
    }
    ctx.restore();
    // стрелки над сгустками: куда едет энергия
    var blobs = [], cur = null;
    for (i = 0; i <= N; i++) {
      var ee = energyAt(i);
      if (ee > 0.03) {
        if (!cur) cur = { s: 0, xs: 0, f: 0, m: 0, top: 1e9 };
        cur.s += ee; cur.xs += ee * i; cur.f += fluxAt(i); cur.m = Math.max(cur.m, ee);
        cur.top = Math.min(cur.top, pts[i][1]);
      } else if (cur) { blobs.push(cur); cur = null; }
    }
    if (cur) blobs.push(cur);
    blobs.forEach(function (b) {
      if (b.s < 0.6 || Math.abs(b.f) < 0.05) return;
      var ci = b.xs / b.s, dir = b.f > 0 ? 1 : -1;
      var cx = x0 + ci * dx, cy = Math.min(ry, b.top) - 18 - Math.min(H * 0.08, 3 + Math.sqrt(b.m) * 0.9);
      var L = 30;
      ctx.strokeStyle = '#fff3d0'; ctx.fillStyle = '#fff3d0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - dir * L / 2, cy); ctx.lineTo(cx + dir * L / 2, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + dir * (L / 2 + 9), cy); ctx.lineTo(cx + dir * L / 2 - dir * 2, cy - 7); ctx.lineTo(cx + dir * L / 2 - dir * 2, cy + 7); ctx.closePath(); ctx.fill();
      // хвост скорости
      ctx.globalAlpha = 0.5;
      for (var q = 1; q <= 3; q++) { ctx.beginPath(); ctx.arc(cx - dir * (L / 2 + q * 8), cy, 2.2 - q * 0.4, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
    });
  }

  /* ---------- цикл ---------- */
  function frame(now) {
    var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    var slow = umov ? 0.5 : 1;
    acc += dt * STEPS_PER_SEC * slow;
    var sdt = 1 / STEPS_PER_SEC;
    while (acc >= 1) {
      acc -= 1;
      if (!drag) driveLeft(sdt); else spring = 0;
      state.hand = hand;
      onAbsorb(simStep());
      launchCheck(sdt / slow);
    }
    // колокольчик — затухающий маятник
    bell.w += (-bell.a * 30 - bell.w * 2.4) * dt; bell.a += bell.w * dt;
    bell.a = Math.max(-0.6, Math.min(0.6, bell.a));
    bell.ring = Math.max(0, bell.ring - dt * 0.9);
    bell.glow = Math.min(1, bell.ring);
    draw(now);
    requestAnimationFrame(frame);
  }

  layout(); calibrate();
  window.addEventListener('resize', function () { layout(); calibrate(); });
  pass(1); say(TEXT[1][0], TEXT[1][1]);
  requestAnimationFrame(frame);
  // для проверки сценария в браузере (снимки, тест)
  window.rcUmov = { dbg: function () { return { E_REF: E_REF, THRESH: THRESH, H: H, W: W, hand: hand, ev: ev, last: lastRatio }; }, pull: pull, eye: function () { btnEye.click(); }, pin: function (on) { setPin(on ? Math.round(N * 0.55) : -1); }, step: function () { return step; } };
})();
