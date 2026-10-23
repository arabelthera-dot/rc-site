/* Игра «Держи форму на ветру» (29 января, Костович).
   Ветер по корпусу — canvas 2D (новый движок); сборка каркаса — тап по порядку, шаблон M-14 «Собери предмет».
   Модель условная: прогиб и ветер не расчёт. */
(function () {
  var root = document.querySelector('[data-kostovich-igra]');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var cv = $('.ko-cv'), ctx = cv.getContext('2d');
  var task = $('.ko-task'), sub = $('.ko-sub'), cap = $('.ko-cap'), next = $('.ko-next');
  var steps = root.querySelectorAll('.ko-steps li');
  var stName = $('.ko-st-name'), stVal = $('.ko-st-val'), status = $('.ko-status'), meter = $('.ko-meter'), meterI = $('.ko-meter i');
  var partsBox = $('.ko-parts'), parts = root.querySelectorAll('.ko-part');
  var bWind = $('.ko-wind'), bStretch = $('.ko-stretch');
  var years = $('.ko-years'), finale = $('.ko-finale');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PART_NAMES = ['Фанерные кольца', 'Шахта с каютой вдоль', 'Спицы к кольцам', 'Шёлк сверху'];
  var S; // состояние
  function reset() {
    S = { phase: 'soft', wind: 0, hold: false, crush: 0, built: 0, prog: [0, 0, 0, 0],
          windT: 0, len: 36, stretching: false, autoWind: 0, t: 0, shake: 0 };
    setStep(0);
    task.textContent = 'Пусти мягкий дирижабль против ветра';
    sub.textContent = 'Держи палец на кнопке «Ветер»';
    stName.textContent = 'Мягкий баллон';
    cap.hidden = true; next.hidden = true; partsBox.hidden = true; finale.hidden = true;
    bWind.hidden = false; bStretch.hidden = true; bWind.classList.add('hint'); bStretch.classList.remove('hint');
    years.classList.remove('go');
    parts.forEach(function (p) { p.classList.remove('done', 'next', 'no'); });
    upStatus();
  }
  function setStep(i) { steps.forEach(function (li, k) { li.classList.toggle('on', k === i); }); }
  function say(t) { cap.textContent = t; cap.hidden = false; }

  // ---- Холст ----
  var W = 0, H = 0, dpr = 1;
  function size() {
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }
  window.addEventListener('resize', size);

  var streaks = [];
  for (var i = 0; i < 46; i++) streaks.push({ x: Math.random(), y: Math.random(), l: 0.04 + Math.random() * 0.07, v: 0.7 + Math.random() * 0.6 });
  var clouds = [{ x: .15, y: .14, s: 1 }, { x: .62, y: .09, s: .7 }, { x: .88, y: .22, s: .85 }];

  function rad(t) { // профиль сигары, t=0 нос (слева), t=1 корма
    var u = 2 * t - 1;
    return Math.pow(Math.max(0, 1 - u * u), 0.5) * (1 - 0.18 * Math.max(0, u));
  }

  function hullGeom() {
    var L = W * 0.5 * (S.len / 36), R = Math.min(H * 0.17, W * 0.085);
    var soft = S.phase === 'soft' || S.phase === 'softDone';
    var c = soft ? S.crush : 0;
    var cx = W * 0.5 + (soft ? c * W * 0.06 : 0) + (W * 0.5 - L) * 0.0;
    var cy = H * 0.5;
    var ang = soft ? -(c * 0.2 + S.wind * c * 0.05 * Math.sin(S.t * 9)) : 0;
    var shiv = !soft ? S.wind * 1.1 * Math.sin(S.t * 34) : 0;
    return { L: L, R: R, c: c, cx: cx, cy: cy + shiv, ang: ang, soft: soft };
  }

  function outline(g) {
    var N = 90, top = [], bot = [];
    for (var k = 0; k <= N; k++) {
      var t = k / N, r = rad(t) * g.R, x = -g.L / 2 + t * g.L, bend = 0;
      if (g.c > 0) {
        var rr = r / g.R;
        x += g.c * 0.17 * g.L * Math.exp(-t / 0.1) * (1 - 0.8 * rr);           // нос продавило
        var wr = 1 + g.c * 0.09 * Math.sin(t * 41 + S.t * 6 * S.wind) * Math.sin(Math.PI * t);
        var wr2 = 1 + g.c * 0.07 * Math.sin(t * 29 + 1.7 - S.t * 5 * S.wind) * Math.sin(Math.PI * t);
        bend = g.c * 0.22 * g.R * Math.sin(Math.PI * Math.min(1, t * 1.3));  // мешок проседает
        top.push([x, bend - r * wr]); bot.push([x, bend + r * wr2]);
      } else { top.push([x, -r]); bot.push([x, r]); }
    }
    return top.concat(bot.reverse());
  }

  function cloud(x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, 18 * s, 0, 7); ctx.arc(x + 20 * s, y - 8 * s, 22 * s, 0, 7); ctx.arc(x + 42 * s, y, 16 * s, 0, 7);
    ctx.fill();
  }

  function draw() {
    if (!W) size();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // облака и земля
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    clouds.forEach(function (c) { cloud(c.x * W, c.y * H, c.s * Math.max(.7, W / 600)); });
    ctx.fillStyle = '#2d4a3a'; ctx.fillRect(0, H * 0.9, W, H * 0.1);
    ctx.fillStyle = '#365a45'; ctx.fillRect(0, H * 0.9, W, 3);

    var g = hullGeom();
    var pts = outline(g);
    // ветер — полосы слева направо, обтекают корпус
    if (S.wind > 0.02) {
      ctx.lineCap = 'round';
      streaks.forEach(function (s) {
        var x = s.x * W, y = s.y * H * 0.86 + H * 0.02, dy = y - g.cy, band = g.R * 1.25;
        var hx0 = g.cx - g.L / 2 - g.R * 0.6, hx1 = g.cx + g.L / 2;
        if (Math.abs(dy) < band && x > hx0 && x < hx1) y = g.cy + (dy < 0 ? -1 : 1) * (band + (band - Math.abs(dy)) * 0.25);
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 * S.wind).toFixed(2) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s.l * W * (0.4 + S.wind), y); ctx.stroke();
      });
    }

    ctx.save();
    ctx.translate(g.cx, g.cy); ctx.rotate(g.ang);
    function path() { ctx.beginPath(); pts.forEach(function (p, k) { k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); }

    if (g.soft) {
      var gr = ctx.createLinearGradient(0, -g.R, 0, g.R);
      gr.addColorStop(0, '#f4ecd8'); gr.addColorStop(.55, '#d8cba8'); gr.addColorStop(1, '#a8987a');
      path(); ctx.fillStyle = gr; ctx.fill();
      ctx.strokeStyle = '#7d6e52'; ctx.lineWidth = 2; ctx.stroke();
      // складки
      if (g.c > 0.05) {
        ctx.save(); path(); ctx.clip();
        ctx.strokeStyle = 'rgba(90,75,50,' + (0.5 * g.c).toFixed(2) + ')'; ctx.lineWidth = 1.6;
        for (var f = 0; f < 9; f++) {
          var fx = -g.L / 2 + g.L * (0.08 + f * 0.1) + g.c * 0.05 * g.L;
          ctx.beginPath(); ctx.moveTo(fx, -g.R);
          ctx.quadraticCurveTo(fx + 14 * Math.sin(f * 2 + S.t * 3 * S.wind), 0, fx - 6, g.R); ctx.stroke();
        }
        ctx.restore();
      }
      gondola(g, 0);
    } else {
      // контур будущего корпуса
      path(); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill();
      ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
      frame(g);
      if (S.prog[3] > 0) {
        var gs = ctx.createLinearGradient(0, -g.R, 0, g.R);
        gs.addColorStop(0, 'rgba(247,240,222,.78)'); gs.addColorStop(.55, 'rgba(226,214,184,.62)'); gs.addColorStop(1, 'rgba(176,160,126,.75)');
        ctx.globalAlpha = S.prog[3];
        path(); ctx.fillStyle = gs; ctx.fill(); ctx.strokeStyle = '#7d6e52'; ctx.lineWidth = 2; ctx.stroke();
        ctx.globalAlpha = 1;
      }
      gondola(g, 1);
    }
    ctx.restore();

    // поперечный срез — «колесо» (справа вверху), без подписей
    if (!g.soft && S.prog[0] > 0) wheel(W - Math.min(W, H) * 0.14, Math.min(W, H) * 0.15, Math.min(W, H) * 0.1);
  }

  function ringXs(g) {
    var n = Math.max(5, Math.round(g.L / (g.R * 0.95))), xs = [];
    for (var k = 1; k < n; k++) xs.push(k / n);
    return xs;
  }

  function frame(g) {
    var xs = ringXs(g), wood = '#d9a35a';
    // кольца
    var nr = Math.ceil(xs.length * S.prog[0]);
    ctx.lineWidth = 3; ctx.strokeStyle = wood;
    for (var k = 0; k < nr; k++) {
      var t = xs[k], r = rad(t) * g.R, x = -g.L / 2 + t * g.L;
      ctx.beginPath(); ctx.ellipse(x, 0, r * 0.2, r, 0, 0, 7); ctx.stroke();
    }
    // шахта-каюта по оси
    if (S.prog[1] > 0) {
      var half = g.L * 0.44 * S.prog[1];
      ctx.fillStyle = '#b07a3c'; ctx.fillRect(-half, -3, half * 2, 6);
      var cw = g.L * 0.16 * S.prog[1], ch = g.R * 0.34;
      ctx.fillStyle = wood; ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
      ctx.fillStyle = '#7a4e27';
      for (var w = -2; w <= 2; w++) ctx.fillRect(w * cw * 0.17 - 3, -ch * 0.18, 6, ch * 0.36);
    }
    // спицы от шахты к кольцам
    if (S.prog[2] > 0) {
      ctx.strokeStyle = 'rgba(240,226,190,.9)'; ctx.lineWidth = 1.4;
      xs.forEach(function (t) {
        var r = rad(t) * g.R, x = -g.L / 2 + t * g.L;
        for (var a = 0; a < 8; a++) {
          var an = a * Math.PI / 4, ex = x + r * 0.2 * Math.cos(an) * S.prog[2], ey = r * Math.sin(an) * S.prog[2];
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(ex, ey); ctx.stroke();
        }
      });
    }
  }

  function gondola(g, rigid) {
    // гондола под корпусом для узнаваемости дирижабля
    var gw = g.L * 0.14, gh = g.R * 0.24, gy = g.R * (rigid ? 1.18 : 1.18 + g.c * 0.25);
    ctx.strokeStyle = 'rgba(40,30,20,.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-gw * 0.5, gy); ctx.lineTo(-gw * 0.9, g.R * 0.8); ctx.moveTo(gw * 0.5, gy); ctx.lineTo(gw * 0.9, g.R * 0.8); ctx.stroke();
    ctx.fillStyle = '#5a3d22'; ctx.fillRect(-gw / 2, gy, gw, gh);
    // винт на корме гондолы
    ctx.fillStyle = '#2a2018';
    var py = gy + gh / 2, px = gw / 2 + 4, sp = Math.abs(Math.sin(S.t * 20)) * gh * 0.9 + 2;
    ctx.fillRect(px, py - sp, 3, sp * 2);
  }

  function wheel(x, y, r) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(6,12,23,.45)'; ctx.beginPath(); ctx.arc(0, 0, r * 1.25, 0, 7); ctx.fill();
    ctx.globalAlpha = S.prog[3] > 0 ? 1 : 1;
    if (S.prog[3] > 0) { ctx.fillStyle = 'rgba(240,232,210,' + (0.35 * S.prog[3]).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(0, 0, r * 1.08, 0, 7); ctx.fill(); }
    ctx.strokeStyle = '#d9a35a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7 * Math.min(1, S.prog[0])); ctx.stroke();
    if (S.prog[2] > 0) {
      ctx.strokeStyle = 'rgba(240,226,190,.95)'; ctx.lineWidth = 1.6;
      for (var a = 0; a < 12; a++) { var an = a * Math.PI / 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * r * S.prog[2], Math.sin(an) * r * S.prog[2]); ctx.stroke(); }
    }
    if (S.prog[1] > 0) { ctx.fillStyle = '#b07a3c'; ctx.beginPath(); ctx.arc(0, 0, r * 0.18 * S.prog[1], 0, 7); ctx.fill(); }
    ctx.restore();
  }

  // ---- Статус под сценой ----
  function upStatus() {
    var form = 1, val;
    if (S.phase === 'soft' || S.phase === 'softDone') {
      form = 1 - 0.75 * S.crush;
      val = S.crush < 0.12 ? 'форма цела' : S.crush < 0.6 ? 'нос продавило' : 'смят, клюёт носом';
    } else if (S.phase === 'build') {
      val = 'собрано ' + S.built + ' из 4';
    } else if (S.phase === 'stretch' || S.phase === 'final') {
      val = 'длина ' + Math.round(S.len) + ' м';
    } else val = S.wind > 0.3 ? 'держит форму' : 'форма цела';
    meterI.style.width = Math.round(form * 100) + '%';
    var bad = form < 0.85;
    meter.classList.toggle('bad', bad); status.classList.toggle('bad', bad);
    stVal.textContent = val;
  }

  // ---- Цикл ----
  var last = 0;
  function loop(ts) {
    var dt = Math.min(0.05, (ts - (last || ts)) / 1000); last = ts;
    S.t += dt;
    var target = (S.hold || S.autoWind > 0) ? 1 : 0;
    if (S.autoWind > 0) S.autoWind -= dt;
    S.wind += (target - S.wind) * Math.min(1, dt * (target ? 3 : 2.2));
    var spd = 0.25 + S.wind * 1.4;
    streaks.forEach(function (s) { s.x += dt * spd * s.v * (S.wind > 0.02 ? 1 : 0); if (s.x > 1.05) { s.x = -0.1; s.y = Math.random(); } });
    clouds.forEach(function (c) { c.x += dt * (0.004 + S.wind * 0.05); if (c.x > 1.1) c.x = -0.15; });
    for (var k = 0; k < 4; k++) if (k < S.built && S.prog[k] < 1) S.prog[k] = Math.min(1, S.prog[k] + dt * (reduce ? 10 : 1.6));

    if (S.phase === 'soft') {
      if (S.wind > 0.3) S.crush = Math.min(1, S.crush + dt * 0.55 * S.wind);
      if (S.crush >= 1) softDone();
    } else if (S.phase === 'rigid') {
      if (S.wind > 0.75) S.windT += dt;
      if (S.windT > 1.6) rigidDone();
    } else if (S.phase === 'stretch' && S.stretching) {
      S.len = Math.min(64, S.len + dt * 13);
      if (S.len >= 64) final();
    }
    upStatus();
    draw();
    requestAnimationFrame(loop);
  }

  // ---- Шаги ----
  function softDone() {
    S.phase = 'softDone';
    bWind.classList.remove('hint');
    task.textContent = 'Мягкий баллон смяло, как пакет';
    sub.textContent = 'Нос продавило, дирижабль клюёт носом';
    say('А Костович придумал вставить внутрь скелет из своей фанеры.');
    next.hidden = false;
  }
  next.addEventListener('click', function () {
    next.hidden = true; cap.hidden = true;
    S.phase = 'build'; S.crush = 0; S.hold = false;
    setStep(1);
    bWind.hidden = true; partsBox.hidden = false;
    task.textContent = 'Собери каркас Костовича';
    sub.textContent = 'Нажимай детали по порядку — первая мигает';
    stName.textContent = 'Каркас';
    markNext();
  });
  function markNext() { parts.forEach(function (p, k) { p.classList.toggle('next', k === S.built); }); }
  parts.forEach(function (p, k) {
    p.addEventListener('click', function () {
      if (S.phase !== 'build' || p.classList.contains('done')) return;
      if (k !== S.built) {
        p.classList.remove('no'); void p.offsetWidth; p.classList.add('no');
        sub.textContent = 'Сначала — «' + PART_NAMES[S.built] + '»';
        return;
      }
      S.built++; p.classList.add('done'); p.classList.remove('next');
      sub.textContent = ['Фанерные кольца держат обхват', 'Шахта — длинная балка вдоль корпуса, в середине каюта', 'Спицы — как у велосипедного колеса', 'Сверху шёлк'][k];
      markNext();
      if (S.built === 4) setTimeout(rigidStart, 900);
    });
  });
  function rigidStart() {
    S.phase = 'rigid'; S.windT = 0;
    setStep(2);
    partsBox.hidden = true; bWind.hidden = false; bWind.classList.add('hint');
    task.textContent = 'Тот же ветер — на каркас';
    sub.textContent = 'Держи палец на кнопке «Ветер»';
    stName.textContent = 'Каркас Костовича';
  }
  function rigidDone() {
    S.phase = 'rigidDone';
    bWind.classList.remove('hint');
    task.textContent = 'Держит форму!';
    sub.textContent = 'Ветер ничего не может сделать с фанерным скелетом';
    say('С каркасом корпус можно тянуть в длину. Вытяни до 64 метров — как «Россия».');
    setTimeout(function () {
      if (S.phase !== 'rigidDone') return;
      S.phase = 'stretch';
      bStretch.hidden = false; bStretch.classList.add('hint');
      task.textContent = 'Вытяни корпус до 64 метров';
      sub.textContent = 'Держи палец на кнопке «Тянуть»';
    }, 1400);
  }
  function final() {
    S.phase = 'final'; S.stretching = false; S.autoWind = 3.2;
    bStretch.classList.remove('go', 'hint'); bStretch.hidden = true;
    task.textContent = '64 метра — и форма держится';
    sub.textContent = 'Так Костович задумал дирижабль «Россия» в 1879 году';
    say('Первый немецкий цеппелин с жёстким каркасом поднимется только в 1900 году.');
    years.classList.add('go');
    setTimeout(function () { finale.hidden = false; }, reduce ? 0 : 1600);
  }
  $('.ko-again').addEventListener('click', function () { reset(); root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });

  // ---- Кнопки «держи» ----
  function holdable(btn, on, off) {
    btn.addEventListener('pointerdown', function (e) { e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch (_) {} btn.classList.add('go'); on(); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { btn.addEventListener(ev, function () { btn.classList.remove('go'); off(); }); });
    btn.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); btn.classList.add('go'); on(); } });
    btn.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { btn.classList.remove('go'); off(); } });
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  holdable(bWind, function () { S.hold = true; bWind.classList.remove('hint'); }, function () { S.hold = false; });
  holdable(bStretch, function () { if (S.phase === 'stretch') { S.stretching = true; bStretch.classList.remove('hint'); } }, function () { S.stretching = false; });

  reset(); size(); requestAnimationFrame(loop);
})();
