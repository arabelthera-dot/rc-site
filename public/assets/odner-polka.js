/* odner-polka.js — механика дня 18 января (Р169, Р176): «Мир считал на петербургском колесе».

   1. Полка машин разных стран. Посетитель ведёт пальцем «просвет» (или тапает по машине —
      просвет плывёт туда сам): под ним корпус становится прозрачным, внутри — одно и то же
      колесо Однера. Найденная машина остаётся просвеченной, колесо крутится.
   2. Все семь просвечены — встают две стопки: французских машин Тома ≈5000 (один кирпичик)
      и курских «Феликсов» 3 000 000 (600 кирпичиков), счётчик бежит.
   3. Любую просвеченную машину можно «взять в руки» — она становится подписью арифмометра ниже,
      а ручку арифмометра крутят пальцем по кругу (#crank): оборот вперёд — прибавить, назад — вычесть.
      Звонок при уходе в минус и щелчок оборота — WebAudio, только после жеста посетителя.

   Текст на рисунках не лежит: имена машин и подписи — строками под рисунком.
   Список марок — строго по А. И. Басову (НИУ ВШЭ, IQ.HSE, 2024): Original-Odhner и Facit (Швеция),
   Brunsviga и Triumphator (Германия), Marchant (США); плюс петербургский «Однер» и курский «Феликс».
   Вид — public/assets/igra-polka-odnera.css (.polka*, .stopki*, .crank*); у копии staraya — izobreteniya-den-01-18.css. */
(function () {
  'use strict';
  var root = document.getElementById('polka');
  if (!root) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── ЗВУК ── */
  var ac = null;
  function audio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(f, dur, vol, type) {
    var a = audio(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
    o.type = type || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  window.odnerZvon = function () { tone(2093, 1.4, 0.22); tone(3136, 0.9, 0.08); tone(1568, 1.1, 0.06, 'triangle'); };
  window.odnerTik = function () { tone(900, 0.05, 0.12, 'square'); setTimeout(function () { tone(620, 0.05, 0.10, 'square'); }, 70); };

  /* ── МАШИНЫ ── корпус: path + детали; у всех внутри одно колесо */
  var M = [
    {id: 'spb', name: '«Однер», Петербург', land: 'Россия · с 1890',
      body: '<rect x="14" y="112" width="172" height="16" rx="3" fill="#7a4a24"/><rect x="14" y="112" width="172" height="4" fill="#9c6233"/>' +
        '<path d="M30 112 V56 Q30 46 40 46 H150 Q160 46 160 56 V112 Z" fill="#141414"/>' +
        '<rect x="44" y="60" width="96" height="10" rx="2" fill="#2b2b2b"/>' + slots(48, 62, 9, 10, '#c9a84c') +
        '<rect x="36" y="86" width="118" height="16" rx="3" fill="#222"/>' + dots(46, 94, 8, 13, '#e4c97a') +
        crank(160, 76, '#c9a84c'), outline: 'M30 112 V56 Q30 46 40 46 H150 Q160 46 160 56 V112 Z'},
    {id: 'bru', name: 'Brunsviga', land: 'Германия · лицензия Однера',
      body: '<rect x="18" y="114" width="164" height="12" rx="4" fill="#1b1b1b"/>' +
        '<path d="M28 114 V78 Q28 40 100 38 Q172 40 172 78 V114 Z" fill="#202020"/>' +
        '<path d="M44 74 Q100 50 156 74" stroke="#3a3a3a" stroke-width="12" fill="none"/>' + slots(56, 66, 8, 12, '#d9d0bc') +
        '<rect x="40" y="92" width="120" height="14" rx="3" fill="#2e2e2e"/>' + dots(50, 99, 8, 14, '#f0eadc') +
        crank(172, 84, '#bdbdbd'), outline: 'M28 114 V78 Q28 40 100 38 Q172 40 172 78 V114 Z'},
    {id: 'ori', name: 'Original-Odhner', land: 'Швеция',
      body: '<rect x="16" y="114" width="168" height="12" rx="3" fill="#111"/>' +
        '<path d="M26 114 V64 L46 44 H154 L174 64 V114 Z" fill="#0f0f12"/>' +
        '<rect x="48" y="52" width="104" height="9" rx="2" fill="#2a2a30"/>' + slots(52, 54, 9, 11, '#e9e2d0') +
        '<rect x="34" y="90" width="132" height="14" rx="2" fill="#1f1f25"/>' + dots(44, 97, 9, 14, '#c9a84c') +
        crank(174, 80, '#8f8f8f'), outline: 'M26 114 V64 L46 44 H154 L174 64 V114 Z'},
    {id: 'fac', name: 'Facit', land: 'Швеция',
      body: '<rect x="20" y="114" width="160" height="12" rx="6" fill="#5c6b62"/>' +
        '<path d="M26 114 V70 Q26 50 46 50 H154 Q174 50 174 70 V114 Z" fill="#7d8f84"/>' +
        '<rect x="44" y="60" width="112" height="22" rx="5" fill="#6a7a70"/>' + slots(50, 63, 9, 12, '#f1efe6') +
        '<rect x="38" y="92" width="124" height="13" rx="6" fill="#56645b"/>' + dots(48, 98, 8, 15, '#f7f3e8') +
        crank(174, 86, '#e0e0e0'), outline: 'M26 114 V70 Q26 50 46 50 H154 Q174 50 174 70 V114 Z'},
    {id: 'tri', name: 'Triumphator', land: 'Германия',
      body: '<rect x="16" y="114" width="168" height="12" rx="3" fill="#202428"/>' +
        '<path d="M24 114 V60 L176 48 V114 Z" fill="#30363c"/>' +
        '<path d="M24 66 L176 54" stroke="#b9c2c9" stroke-width="3"/>' + slots(44, 64, 9, 12, '#e6e9ec') +
        '<rect x="36" y="92" width="128" height="14" rx="2" fill="#262b30"/>' + dots(46, 99, 8, 15, '#ffd27a') +
        crank(176, 80, '#b9c2c9'), outline: 'M24 114 V60 L176 48 V114 Z'},
    {id: 'mar', name: 'Marchant', land: 'США',
      body: '<rect x="18" y="116" width="164" height="10" rx="3" fill="#6b5d4a"/>' +
        '<path d="M30 116 V44 Q30 34 40 34 H160 Q170 34 170 44 V116 Z" fill="#cdbf9f"/>' +
        '<rect x="42" y="42" width="116" height="12" rx="2" fill="#3b352c"/>' + dots(50, 48, 8, 14, '#f4e7c4') +
        keys(44, 62, 8, 4, 14, 12, '#efe6cf', '#8c7b5d'), outline: 'M30 116 V44 Q30 34 40 34 H160 Q170 34 170 44 V116 Z'},
    {id: 'fel', name: '«Феликс», Курск', land: 'СССР · 3 миллиона',
      body: '<rect x="16" y="114" width="168" height="12" rx="3" fill="#3e4a3b"/>' +
        '<path d="M26 114 V58 Q26 50 34 50 H158 Q166 50 166 58 V114 Z" fill="#5f7259"/>' +
        '<rect x="38" y="58" width="116" height="24" rx="3" fill="#526449"/>' + slots(44, 61, 9, 12, '#141414') +
        '<rect x="34" y="90" width="124" height="14" rx="2" fill="#2d3729"/>' + dots(44, 97, 8, 15, '#f2f2e8') +
        crank(166, 80, '#151515'), outline: 'M26 114 V58 Q26 50 34 50 H158 Q166 50 166 58 V114 Z'}
  ];
  function slots(x, y, n, step, c) { var s = ''; for (var i = 0; i < n; i++) s += '<rect x="' + (x + i * step) + '" y="' + y + '" width="3" height="' + 12 + '" rx="1.5" fill="' + c + '" opacity=".85"/>'; return s; }
  function dots(x, y, n, step, c) { var s = ''; for (var i = 0; i < n; i++) s += '<circle cx="' + (x + i * step) + '" cy="' + y + '" r="3.2" fill="' + c + '"/>'; return s; }
  function keys(x, y, cols, rows, sx, sy, c, b) { var s = ''; for (var r = 0; r < rows; r++) for (var i = 0; i < cols; i++) s += '<rect x="' + (x + i * sx) + '" y="' + (y + r * sy) + '" width="10" height="9" rx="2" fill="' + c + '" stroke="' + b + '"/>'; return s; }
  function crank(x, y, c) { return '<path d="M' + x + ' ' + y + ' h10 v-26 h8" stroke="' + c + '" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="' + (x + 20) + '" cy="' + (y - 26) + '" r="5" fill="' + c + '"/>'; }

  /* колесо Однера: диск и 9 зубцов, выдвинуто n */
  function wheel(cx, cy, r, n, cls) {
    var s = '<g class="pw ' + cls + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#2a2210" stroke="#e4c97a" stroke-width="2"/>';
    for (var i = 0; i < 12; i++) {
      if (i > 8) continue;
      var a = -Math.PI / 2 + i * Math.PI / 6, out = i < n, L = out ? r * 0.5 : r * 0.12;
      var x1 = cx + Math.cos(a) * (r - 2), y1 = cy + Math.sin(a) * (r - 2), x2 = cx + Math.cos(a) * (r + L), y2 = cy + Math.sin(a) * (r + L);
      s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + (out ? '#ffd27a' : '#8a6d2a') + '" stroke-width="' + (out ? 4.5 : 3) + '" stroke-linecap="round"/>';
    }
    return s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.28) + '" fill="#e4c97a"/></g>';
  }
  function inside(m) {
    return '<rect width="200" height="140" fill="#081a2e"/>' + grid() +
      '<path d="' + m.outline + '" fill="rgba(125,200,255,.06)" stroke="#7dc8ff" stroke-width="1.6" stroke-dasharray="5 4"/>' +
      '<line x1="44" y1="82" x2="156" y2="82" stroke="#7dc8ff" stroke-width="2" opacity=".7"/>' +
      wheel(56, 82, 14, 3, 'w1') + wheel(100, 82, 14, 7, 'w2') + wheel(144, 82, 14, 5, 'w3');
  }
  function grid() { var s = ''; for (var x = 0; x <= 200; x += 20) s += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="140" stroke="#13304f" stroke-width="1"/>'; for (var y = 0; y <= 140; y += 20) s += '<line x1="0" y1="' + y + '" x2="200" y2="' + y + '" stroke="#13304f" stroke-width="1"/>'; return s; }

  var shelf = root.querySelector('.polka-shelf'), lens = root.querySelector('.polka-lens');
  var cnt = document.getElementById('polkaCnt'), msg = document.getElementById('polkaMsg');
  var cells = [];
  M.forEach(function (m, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'mash'; b.dataset.i = i;
    b.setAttribute('aria-label', m.name + ', ' + m.land + ': просветить корпус');
    b.innerHTML = '<span class="mash-art"><svg class="mash-case" viewBox="0 0 200 140" aria-hidden="true">' + m.body + '</svg>' +
      '<svg class="mash-in" viewBox="0 0 200 140" aria-hidden="true">' + inside(m) + '</svg></span>' +
      '<span class="mash-name">' + m.name + '</span><span class="mash-land">' + m.land + '</span>' +
      '<span class="mash-tag">внутри — колесо Однера</span>';
    shelf.appendChild(b);
    cells.push({el: b, art: b.querySelector('.mash-art'), inn: b.querySelector('.mash-in'), m: m, found: false, dwell: 0});
  });

  var R = 58, pos = {x: 0, y: 0}, tgt = {x: 0, y: 0}, drag = false, found = 0, done = false, last = 0;
  function rel(e) { var r = shelf.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; }
  function center(c) { var r = c.art.getBoundingClientRect(), s = shelf.getBoundingClientRect(); return {x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2}; }
  function place() {
    R = Math.max(46, Math.min(70, shelf.clientWidth * 0.16));
    lens.style.width = lens.style.height = (R * 2) + 'px';
    lens.style.transform = 'translate(' + (pos.x - R) + 'px,' + (pos.y - R) + 'px)';
    var s = shelf.getBoundingClientRect();
    cells.forEach(function (c) {
      if (c.found) return;
      var r = c.art.getBoundingClientRect(), lx = pos.x - (r.left - s.left), ly = pos.y - (r.top - s.top);
      c.inn.style.clipPath = 'circle(' + R + 'px at ' + lx.toFixed(1) + 'px ' + ly.toFixed(1) + 'px)';
    });
  }
  function hit(dt) {
    var s = shelf.getBoundingClientRect();
    cells.forEach(function (c) {
      if (c.found) return;
      var r = c.art.getBoundingClientRect(), x = pos.x + s.left, y = pos.y + s.top;
      var inr = x > r.left + r.width * 0.2 && x < r.right - r.width * 0.2 && y > r.top + r.height * 0.15 && y < r.bottom - r.height * 0.15;
      c.dwell = inr ? c.dwell + dt : 0;
      if (c.dwell > 260) reveal(c);
    });
  }
  function reveal(c) {
    c.found = true; found++;
    var r = c.art.getBoundingClientRect();
    c.inn.style.clipPath = 'circle(' + Math.hypot(r.width, r.height) + 'px at 50% 50%)';
    c.el.classList.add('found');
    window.odnerTik && ac && window.odnerTik();
    cnt.textContent = found;
    root.querySelector('.polka-bar i').style.width = (found / M.length * 100) + '%';
    var foreign = c.m.id !== 'spb' && c.m.id !== 'fel';
    if (found === M.length) finale();
    else if (foreign) say(c.m.name + ', ' + c.m.land.split(' · ')[0] + ' — а внутри то же петербургское колесо. Веди дальше.', 'ok');
    else say(c.m.name + ' — колесо Однера на месте. Веди просвет к соседям.', 'ok');
  }
  function say(t, cls) { msg.className = 'lab-msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }

  function loop(t) {
    var dt = last ? Math.min(64, t - last) : 16; last = t;
    var k = drag ? 0.45 : (reduce ? 1 : 0.14);
    pos.x += (tgt.x - pos.x) * k; pos.y += (tgt.y - pos.y) * k;
    place(); if (!done) hit(dt);
    requestAnimationFrame(loop);
  }
  lens.addEventListener('pointerdown', function (e) { audio(); drag = true; lens.setPointerCapture(e.pointerId); lens.classList.add('drag'); tgt = rel(e); e.preventDefault(); });
  lens.addEventListener('pointermove', function (e) { if (drag) { tgt = rel(e); var w = shelf.clientWidth, h = shelf.clientHeight; tgt.x = Math.max(0, Math.min(w, tgt.x)); tgt.y = Math.max(0, Math.min(h, tgt.y)); } });
  ['pointerup', 'pointercancel'].forEach(function (n) { lens.addEventListener(n, function () { drag = false; lens.classList.remove('drag'); }); });
  cells.forEach(function (c) {
    c.el.addEventListener('click', function () {
      audio();
      if (!c.found) { tgt = center(c); return; }
      take(c.m);
    });
  });
  function take(m) {
    var h = document.getElementById('inHand'); if (!h) return;
    h.textContent = m.name + ' (' + m.land.split(' · ')[0] + ')';
    cells.forEach(function (c) { c.el.classList.toggle('taken', c.m === m); });
    var p = document.getElementById('press'); if (p) p.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'});
  }

  /* ── СТОПКИ ── 1 кирпичик = 5000 машин */
  function finale() {
    done = true;
    say('Семь машин, четыре страны — и в каждой одно колесо из Петербурга. А теперь посчитаем, сколько их было.', 'ok');
    if (window.award) window.award('polka', 15);
    var st = document.getElementById('stopki'); st.hidden = false;
    var wall = st.querySelector('.stopki-wall'), num = document.getElementById('stopkiNum'), N = 600, html = '';
    for (var i = 0; i < N; i++) html += '<i></i>';
    wall.innerHTML = html;
    var bricks = wall.children, t0 = 0, D = reduce ? 1 : 2600;
    setTimeout(function () {
      st.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'center'});
      st.classList.add('go');
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 2), n = Math.round(e * N);
        for (var j = 0; j < n; j++) bricks[j].className = 'on';
        num.textContent = (Math.round(e * 3000000)).toLocaleString('ru-RU');
        if (p < 1) requestAnimationFrame(step);
        else { st.classList.add('end'); window.odnerZvon && window.odnerZvon(); }
      });
    }, 700);
  }

  /* ── РУЧКА ── крутить пальцем по кругу; полный оборот = один оборот арифмометра */
  var cr = document.getElementById('crank');
  if (cr) {
    var arm = cr.querySelector('.crank-arm'), ang = 0, accA = 0, prev = null, cd = false, mv = 0;
    function a(e) { var r = cr.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); }
    function show() { arm.style.transform = 'rotate(' + (ang * 180 / Math.PI) + 'deg)'; }
    function turn(dir) { var b = document.getElementById(dir > 0 ? 'turnPlus' : 'turnMinus'); if (b) b.click(); }
    cr.addEventListener('pointerdown', function (e) { audio(); cd = true; mv = 0; prev = a(e); cr.setPointerCapture(e.pointerId); cr.classList.add('drag'); e.preventDefault(); });
    cr.addEventListener('pointermove', function (e) {
      if (!cd) return;
      var n = a(e), d = n - prev; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
      prev = n; ang += d; accA += d; mv += Math.abs(d); show();
      if (accA >= 2 * Math.PI) { accA -= 2 * Math.PI; turn(1); }
      if (accA <= -2 * Math.PI) { accA += 2 * Math.PI; turn(-1); }
    });
    ['pointerup', 'pointercancel'].forEach(function (n) { cr.addEventListener(n, function () { var tap = cd && mv < 0.25 && n === 'pointerup'; cd = false; cr.classList.remove('drag'); if (tap) { accA = 0; spin(1); } }); });
    cr.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); spin(1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); spin(-1); }
    });
    window.odnerSpin = spin;
    function spin(dir) {
      var s = ang, t0 = 0;
      requestAnimationFrame(function st(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 420); ang = s + dir * 2 * Math.PI * (1 - Math.pow(1 - p, 3)); show(); if (p < 1) requestAnimationFrame(st); else turn(dir); });
    }
  }

  /* старт: просвет над петербургской машиной */
  requestAnimationFrame(function () {
    var c = center(cells[0]); pos = {x: c.x, y: c.y}; tgt = {x: c.x, y: c.y};
    requestAnimationFrame(loop);
  });
  window.addEventListener('resize', function () { if (!drag) { var c = center(cells[0]); if (!cells[0].found) tgt = c; } });
})();
