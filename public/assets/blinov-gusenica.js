/*! blinov-gusenica.js — игра «Проведи воз по грязи» (9 января, Ф. А. Блинов; Р258, Р206).
 * Шаг 1: обычная телега с грузом испытания (2000 кирпичей, 30 человек) на паре лошадей вязнет в грязи.
 * Шаг 2: посетитель сам кладёт 8 звеньев под колёса — цепь замыкается в «бесконечные рельсы».
 * Шаг 3: тот же воз на той же паре лошадей идёт по грязи. Финал — сравнение и лента лет, награда в общий счёт.
 * Только нажатия (click), одна активная кнопка на шаге, рука «тап-тап» над ней. Расчёт не зависит от ширины:
 * сцена рисуется в логических единицах шириной 800, время шагов — в секундах.
 * Разметка — в странице (data-blinov-igra), вид — blinov-gusenica.css. Награда: data-award / data-points.
 */
(function () {
  var root = document.querySelector('[data-blinov-igra]');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var cv = $('.bl-cv'), ctx = cv && cv.getContext('2d');
  if (!ctx) return;

  var LINKS = 8;            // звеньев кладёт посетитель
  var W = 800, H = 450, GY = 310;
  var R = 34;               // радиус колеса
  var AX1 = -95, AX2 = 65;  // оси колёс относительно воза
  var SINK_MAX = 30, SINK_TRACK = -8;

  var st, raf = 0, last = 0, visible = true;
  function fresh() {
    st = {
      step: 1, phase: 'idle', t: 0,
      wx: 0, sink: 0, sinkFrom: 0, placed: 0, drop: -1, dropT: 0,
      loop: 0, trackS: 0, legs: 0, strain: 0, splash: [], done: false
    };
  }
  fresh();

  // ── Размер холста: логическая ширина 800 (на телефоне 600), высота по соотношению сторон сцены ──
  function resize() {
    var w = cv.clientWidth || 800, h = cv.clientHeight || 450;
    W = w < 520 ? 600 : 800;                        // на телефоне сцена крупнее
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    H = Math.round(W * h / w); GY = H - 140;
    ctx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0);
    draw();
  }

  // ── Рисование ──
  function ellipse(x, y, rx, ry, rot, fill) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  }
  function rrect(x, y, w, h, r, fill) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  }
  function mod(a, n) { return ((a % n) + n) % n; }

  function background(cam) {
    var g = ctx.createLinearGradient(0, 0, 0, GY);
    g.addColorStop(0, '#7fa6c4'); g.addColorStop(1, '#d9dfd6');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, GY);
    // дальний берег и крыши Вольска
    ctx.fillStyle = '#8b9a86';
    ctx.beginPath(); ctx.moveTo(0, GY - 40);
    for (var x = 0; x <= W; x += 40) ctx.lineTo(x, GY - 44 - 10 * Math.sin((x + cam * 0.15) / 90));
    ctx.lineTo(W, GY); ctx.lineTo(0, GY); ctx.fill();
    for (var i = 0; i < 6; i++) {
      var hx = mod(i * 170 - cam * 0.3, W + 170) - 85, hy = GY - 34;
      rrect(hx, hy - 22, 46, 22, 2, '#a88a62');
      ctx.fillStyle = '#6d5a44'; ctx.beginPath(); ctx.moveTo(hx - 6, hy - 22); ctx.lineTo(hx + 23, hy - 40); ctx.lineTo(hx + 52, hy - 22); ctx.fill();
    }
    // плетень у дороги
    ctx.strokeStyle = '#5e4a32'; ctx.lineWidth = 4;
    for (var p = 0; p < 9; p++) {
      var px = mod(p * 110 - cam, W + 110) - 55;
      ctx.beginPath(); ctx.moveTo(px, GY - 6); ctx.lineTo(px, GY - 46); ctx.stroke();
    }
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, GY - 36); ctx.lineTo(W, GY - 36); ctx.moveTo(0, GY - 22); ctx.lineTo(W, GY - 22); ctx.stroke();
  }

  function mudBack() {
    var g = ctx.createLinearGradient(0, GY - 8, 0, H);
    g.addColorStop(0, '#6e5332'); g.addColorStop(1, '#3d2c18');
    ctx.fillStyle = g; ctx.fillRect(0, GY - 8, W, H - GY + 8);
  }
  function mudFront(cam) {
    // передний край грязи закрывает низ колёс и копыт: воз «в грязи»
    ctx.fillStyle = 'rgba(78,57,33,.96)';
    ctx.beginPath(); ctx.moveTo(0, GY + 2);
    for (var x = 0; x <= W; x += 20) ctx.lineTo(x, GY + 2 + 3 * Math.sin((x + cam) / 23));
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    for (var i = 0; i < 10; i++) {
      var lx = mod(i * 97 - cam, W + 120) - 60;
      ellipse(lx, GY + 30 + (i % 3) * 30, 40 + (i % 4) * 8, 6, 0, 'rgba(160,170,180,.28)');   // лужи
      ellipse(lx + 30, GY + 18 + (i % 2) * 50, 14, 3, 0, 'rgba(30,20,10,.35)');               // колеи
    }
  }

  function wheel(x, y, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.lineWidth = 7; ctx.strokeStyle = '#3a2814'; ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = '#6b4a22';
    for (var i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(i * Math.PI / 4) * R, Math.sin(i * Math.PI / 4) * R); ctx.stroke(); }
    ellipse(0, 0, 7, 7, 0, '#2a1c0d');
    ctx.restore();
  }

  function link(x, y, ang, a) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha = a == null ? 1 : a;
    rrect(-15, -5, 30, 10, 2, '#4a3418');
    rrect(-13, -4, 26, 4, 1, '#8a6232');
    ctx.fillStyle = '#c9a84c'; ctx.fillRect(-15, -1, 3, 3); ctx.fillRect(12, -1, 3, 3);
    ctx.restore();
  }

  // Точка на замкнутой ленте вокруг двух колёс: s — путь вдоль ленты от заднего низа вперёд по низу.
  function loopPoint(s, x1, x2, cy, r) {
    var flat = x2 - x1, arc = Math.PI * r, L = 2 * flat + 2 * arc;
    s = mod(s, L);
    if (s < flat) return { x: x1 + s, y: cy + r, a: 0, L: L };
    s -= flat;
    if (s < arc) { var t = s / r; return { x: x2 + Math.sin(t) * r, y: cy + Math.cos(t) * r, a: -t, L: L }; }
    s -= arc;
    if (s < flat) return { x: x2 - s, y: cy - r, a: Math.PI, L: L };
    s -= flat; var u = s / r;
    return { x: x1 - Math.sin(u) * r, y: cy - Math.cos(u) * r, a: Math.PI - u, L: L };
  }

  function horse(x, phase, strain, dark) {
    var body = dark ? '#4a2f1c' : '#6e4426', mane = dark ? '#21150b' : '#2e1d10';
    var lean = strain * 6, by = GY - 60;
    ctx.lineCap = 'round';
    // ноги
    var legs = [[-30, 0], [-22, Math.PI], [26, Math.PI], [34, 0]];
    for (var i = 0; i < 4; i++) {
      var sw = Math.sin(phase + legs[i][1]) * 0.38;
      var lx = x + legs[i][0] + lean * 0.4;
      ctx.strokeStyle = i % 2 ? mane : body; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(lx, by + 10); ctx.lineTo(lx + Math.sin(sw) * 34, GY + 4); ctx.stroke();
    }
    ellipse(x + lean * 0.3, by, 46, 20, 0, body);                 // туловище
    ctx.fillStyle = body;                                          // шея
    ctx.beginPath(); ctx.moveTo(x + 26 + lean, by - 12); ctx.lineTo(x + 48 + lean * 1.6, by - 46 + strain * 12);
    ctx.lineTo(x + 62 + lean * 1.6, by - 40 + strain * 12); ctx.lineTo(x + 44 + lean, by + 6); ctx.fill();
    ellipse(x + 64 + lean * 1.6, by - 40 + strain * 12, 17, 8, 0.5 + strain * 0.3, body);   // голова
    ctx.strokeStyle = mane; ctx.lineWidth = 5;                     // грива и хвост
    ctx.beginPath(); ctx.moveTo(x + 28 + lean, by - 16); ctx.lineTo(x + 50 + lean * 1.6, by - 50 + strain * 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 44, by - 6); ctx.quadraticCurveTo(x - 60, by + 4, x - 56 + Math.sin(phase) * 3, by + 30); ctx.stroke();
    // хомут
    ctx.strokeStyle = '#1c120a'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(x + 32 + lean, by - 4, 13, -1.9, 1.3); ctx.stroke();
  }

  function cargo(x, y) {
    // платформа
    rrect(x - 150, y, 270, 16, 3, '#7a5428');
    ctx.fillStyle = '#4e3418'; ctx.fillRect(x - 150, y + 12, 270, 5);
    // 2000 кирпичей — штабель в задней части
    for (var r = 0; r < 4; r++) for (var c = 0; c < 7; c++) {
      var bx = x - 144 + c * 17 + (r % 2) * 6, byy = y - 9 - r * 9;
      rrect(bx, byy, 15, 8, 1, r % 2 ? '#a8432c' : '#b9543a');
    }
    // три десятка человек — люди на передней половине
    var coats = ['#3f4d6b', '#5b3a2c', '#2f4a3a', '#6b5a3a', '#4b3f5f', '#7a3b33'];
    for (var row = 0; row < 2; row++) for (var k = 0; k < 6; k++) {
      var px = x - 12 + k * 21 + row * 10, py = y - (row ? 30 : 26), s = row ? 0.85 : 1;
      rrect(px - 6 * s, py, 12 * s, 24 * s, 4, row ? '#2c3442' : coats[(k + row) % coats.length]);
      ellipse(px, py - 6 * s, 6 * s, 6 * s, 0, row ? '#b08c70' : '#e0b896');
      ellipse(px, py - 10 * s, 7 * s, 3 * s, 0, row ? '#1d1d1d' : '#3a2a1a');
    }
  }

  function scene() {
    var cam = st.wx;
    var cx = W < 800 ? 200 : 300;                   // воз на экране
    var cy = GY - R + st.sink;                      // центр колеса
    background(cam);
    mudBack();
    // брызги
    for (var i = 0; i < st.splash.length; i++) {
      var p = st.splash[i]; ellipse(p.x - cam, p.y, 4, 3, 0, 'rgba(70,48,24,' + Math.max(0, p.life).toFixed(2) + ')');
    }
    // гусеничная лента: уложенные звенья (шаг 2) или вся замкнутая цепь (шаг 3)
    var x1 = cx + AX1, x2 = cx + AX2, lr = R + 4;
    if (st.loop > 0) {
      var L = loopPoint(0, x1, x2, cy, lr).L, n = Math.round(L / 32), step = L / n;
      var shown = Math.round(n * st.loop);
      for (var k = 0; k < shown; k++) {
        var q = loopPoint(k * step - st.trackS, x1, x2, cy, lr);
        link(q.x, q.y, q.a);
      }
    } else {
      var span = (x2 + lr) - (x1 - lr), seg = span / LINKS;
      for (var j = 0; j < LINKS; j++) {
        var sx = x2 + lr - seg * (j + 0.5), sy = GY - 4;
        if (j < st.placed) link(sx, sy, 0);
        else if (j === st.drop) {
          var e = Math.min(1, st.dropT / 0.32), yy = sy - (1 - e * e) * 150;
          link(sx, yy, (1 - e) * 0.8);
        } else if (st.step === 2 && j === st.placed && st.drop < 0) {
          // мигающее место под следующее звено
          ctx.save(); ctx.globalAlpha = 0.45 + 0.4 * Math.sin(st.t * 7);
          ctx.setLineDash([5, 4]); ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2.5;
          ctx.strokeRect(sx - 15, sy - 6, 30, 12); ctx.restore();
        }
      }
    }
    // оглобли
    ctx.strokeStyle = '#4e3418'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + 118, cy - 10); ctx.lineTo(cx + 205, GY - 66); ctx.stroke();
    // пара лошадей: дальняя темнее
    horse(cx + 236, st.legs + 1.3, st.strain, true);
    // колёса
    var rot = st.wx / R;
    wheel(x1, cy, rot); wheel(x2, cy, rot);
    cargo(cx, cy - 22);
    horse(cx + 226, st.legs, st.strain, false);
    ctx.strokeStyle = '#2a1c0d'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx + 118, cy - 14); ctx.lineTo(cx + 250, GY - 70); ctx.stroke();   // постромки
    if (st.loop < 1) mudFront(cam);
    else { ctx.save(); ctx.globalAlpha = 0.55; mudFront(cam); ctx.restore(); }
  }

  function draw() { ctx.clearRect(0, 0, W, H); scene(); }

  // ── Время ──
  function tick(now) {
    raf = 0;
    var dt = Math.min(0.05, last ? (now - last) / 1000 : 0); last = now;
    st.t += dt;
    if (st.phase === 'stuck') {
      st.pt += dt;
      var p = Math.min(1, st.pt / 2.6);
      st.wx = 70 * (1 - Math.pow(1 - p, 3));
      st.sink = SINK_MAX * Math.min(1, p * 1.25);
      st.legs += dt * (p < 0.75 ? 7 : 2);
      st.strain = Math.min(1, p * 1.4);
      if (Math.random() < 0.5 && p < 0.9) addSplash(st.wx + 300 + AX1, st.wx + 300 + AX2);
      if (p >= 1) endStuck();
    } else if (st.phase === 'drop') {
      st.dropT += dt;
      st.sink += (st.sinkTarget - st.sink) * Math.min(1, dt * 10);
      if (st.dropT >= 0.32 && st.drop >= 0) {
        st.placed++; st.drop = -1;
        addSplash(st.wx + 300 + AX2 + R - (st.placed - 0.5) * ((AX2 - AX1 + 2 * (R + 4)) / LINKS));
        afterLink();
      }
      if (st.drop < 0 && Math.abs(st.sink - st.sinkTarget) < 0.4) { st.sink = st.sinkTarget; if (st.phase === 'drop') st.phase = 'idle'; }
    } else if (st.phase === 'close') {
      st.pt += dt; st.loop = Math.min(1, st.pt / 0.9);
      st.sink += (SINK_TRACK - st.sink) * Math.min(1, dt * 8);
      if (st.loop >= 1) { st.sink = SINK_TRACK; st.phase = 'idle'; step3(); }
    } else if (st.phase === 'drive') {
      st.pt += dt;
      var v = 150 * Math.min(1, st.pt / 0.6);
      st.wx += v * dt; st.trackS = st.wx;   // нижние звенья лежат на земле, лента бежит вокруг колёс
      st.legs += dt * 7; st.strain = Math.max(0, st.strain - dt * 3);
      if (st.pt >= 3.4) { st.phase = 'idle'; finale(); }
    }
    for (var i = st.splash.length - 1; i >= 0; i--) {
      var s = st.splash[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 500 * dt; s.life -= dt * 1.4;
      if (s.life <= 0 || s.y > H) st.splash.splice(i, 1);
    }
    draw();
    if (visible) raf = requestAnimationFrame(tick);
  }
  function run() { if (!raf && visible) { last = 0; raf = requestAnimationFrame(tick); } }
  function addSplash(a, b) {
    var xs = b == null ? [a] : [a, b];
    for (var i = 0; i < xs.length; i++) for (var k = 0; k < 4; k++)
      st.splash.push({ x: xs[i] + (Math.random() - 0.5) * 30, y: GY, vx: (Math.random() - 0.5) * 140, vy: -120 - Math.random() * 120, life: 1 });
  }

  // ── Интерфейс шага ──
  var bGo = $('.bl-go'), bLink = $('.bl-link'), hand = $('.bl-hand'), cap = $('.bl-cap'), capT = $('.bl-cap-t');
  var task = $('.bl-task'), sub = $('.bl-sub'), status = $('.bl-status'), stName = $('.bl-st-name'), stVal = $('.bl-st-val'), meter = $('.bl-meter i');
  var steps = root.querySelectorAll('.bl-steps li'), cnt = $('.bl-cnt'), finBox = $('.bl-finale'), years = $('.bl-years'), again = $('.bl-again');

  function setStep(n) {
    for (var i = 0; i < steps.length; i++) { steps[i].className = i + 1 < n ? 'done' : (i + 1 === n ? 'on' : ''); }
  }
  function active(btn) {
    [bGo, bLink].forEach(function (b) { b.classList.remove('hint'); b.disabled = b !== btn; });
    if (!btn) { hand.hidden = true; return; }
    btn.hidden = false; btn.classList.add('hint'); placeHand(btn);
  }
  function placeHand(btn) {
    var pr = $('.bl-play').getBoundingClientRect(), r = btn.getBoundingClientRect();
    hand.style.left = (r.left - pr.left + r.width * 0.72) + 'px';
    hand.style.top = (r.top - pr.top + r.height * 0.45) + 'px';
    hand.hidden = false;
  }
  function say(text, bad) { cap.hidden = false; cap.classList.toggle('bad', !!bad); capT.textContent = text; }
  function stat(name, val, frac, bad) {
    stName.textContent = name; stVal.textContent = val; meter.style.width = Math.round(frac * 100) + '%';
    status.classList.toggle('bad', !!bad);
  }
  function feel(btn) {
    btn.classList.add('press'); setTimeout(function () { btn.classList.remove('press'); }, 120);
    if (navigator.vibrate) { try { navigator.vibrate(20); } catch (e) {} }
  }

  function step1() {
    fresh(); setStep(1);
    task.textContent = 'Нажми «Поехали»';
    sub.textContent = 'Обычная телега: 2000 кирпичей, 30 человек, пара лошадей';
    stat('Телега на колёсах', 'стоит на дороге', 0, false);
    cap.hidden = true; finBox.hidden = true; years.classList.remove('go');
    bLink.hidden = true; bGo.hidden = false;
    active(bGo); draw(); run();
  }
  function endStuck() {
    st.phase = 'idle'; st.strain = 1;
    stat('Телега на колёсах', 'увязла по ступицу', 1, true);
    say('колесо давит на грязь одной маленькой точкой и тонет. Лошади встали. Такой воз на колёсах потянули бы не меньше десяти лошадей.', true);
    setTimeout(step2, 900);
  }
  function step2() {
    st.step = 2; setStep(2);
    task.textContent = 'Нажми «Звено» — 8 раз';
    sub.textContent = 'Каждое нажатие кладёт звено рельса в грязь под колёса';
    stat('Звенья под колёсами', '0 из ' + LINKS, 0, false);
    bGo.hidden = true; bLink.hidden = false; cnt.textContent = '0 из ' + LINKS;
    active(bLink); run();
  }
  function afterLink() {
    cnt.textContent = st.placed + ' из ' + LINKS;
    stat('Звенья под колёсами', st.placed + ' из ' + LINKS, st.placed / LINKS, false);
    if (st.placed < LINKS) {
      say('звено легло. Вес воза давит уже не в точку, а на полосу — колёса выходят из грязи.');
      bLink.disabled = false; bLink.classList.add('hint'); placeHand(bLink);
    } else {
      active(null);
      say('цепь замкнулась вокруг колёс. Это и есть «бесконечные рельсы» Блинова: воз сам стелет их перед собой и подбирает сзади.');
      st.phase = 'close'; st.pt = 0; st.trackS = st.wx; run();
    }
  }
  function step3() {
    st.step = 3; setStep(3);
    task.textContent = 'Нажми «Поехали»';
    sub.textContent = 'Тот же груз, та же пара лошадей';
    stat('Вагон Блинова', 'на бесконечных рельсах', 1, false);
    bLink.hidden = true; bGo.hidden = false; active(bGo);
  }
  function finale() {
    active(null); setStep(4);
    task.textContent = 'Воз прошёл!';
    sub.textContent = 'Пролистай ниже — что выросло из этих рельсов';
    stat('Вагон Блинова', 'идёт по грязи', 1, false);
    say('гусеница раскладывает вес по длинной полосе, и колёса больше не тонут. Пара лошадей везёт то, что на колёсах тянули бы десять.');
    finBox.hidden = false;
    requestAnimationFrame(function () { years.classList.add('go'); });
    if (!st.done) {
      st.done = true;
      var k = root.getAttribute('data-award'), n = Number(root.getAttribute('data-points')) || 0;
      if (k && typeof window.award === 'function') window.award(k, n);
    }
  }

  bGo.addEventListener('click', function () {
    if (bGo.disabled) return; feel(bGo); active(null);
    if (st.step === 1) {
      st.phase = 'stuck'; st.pt = 0;
      stat('Телега на колёсах', 'вязнет…', 0.5, true);
      sub.textContent = 'Смотри на колёса';
    } else if (st.step === 3) {
      st.phase = 'drive'; st.pt = 0; st.strain = 0;
      stat('Вагон Блинова', 'едет…', 1, false);
      sub.textContent = 'Смотри на цепь под колёсами';
    }
    run();
  });
  bLink.addEventListener('click', function () {
    if (bLink.disabled || st.drop >= 0 || st.placed >= LINKS) return;
    feel(bLink);
    bLink.disabled = true; bLink.classList.remove('hint'); hand.hidden = true;
    st.drop = st.placed; st.dropT = 0; st.phase = 'drop';
    st.sinkTarget = SINK_MAX * (1 - (st.placed + 1) / LINKS);
    run();
  });
  again.addEventListener('click', function () { step1(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) run(); }).observe(cv);
  }
  window.addEventListener('resize', function () {
    resize();
    var b = !bGo.hidden && !bGo.disabled ? bGo : (!bLink.hidden && !bLink.disabled ? bLink : null);
    if (b && !hand.hidden) placeHand(b);
  });
  resize();
  step1();
})();
