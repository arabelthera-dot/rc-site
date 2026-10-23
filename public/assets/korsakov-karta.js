/* Игра «Пробей карту и найди лекарство» (25 января, Семён Корсаков).
   Шаг 1 — перфокарта ткёт узор в станке Жаккара; шаг 2 — посетитель пробивает признаки;
   шаг 3 — тянет карту по таблице лекарств (наложение по образцу M-29). */
(function () {
  'use strict';
  var root = document.querySelector('[data-korsakov-igra]');
  if (!root) return;

  var SYM = [
    { w: 'Жар', i: '🌡️' }, { w: 'Кашель', i: '😮‍💨' }, { w: 'Слабость', i: '😴' },
    { w: 'Насморк', i: '🤧' }, { w: 'Сыпь', i: '🔴' }
  ];
  var NEED = [0, 1, 2];
  var ROWS = [[0, 3], [1], [3, 4], [0, 1, 2], [0, 1, 4]];
  var MATCH = 3;
  /* Узор карты станка: 8 столбцов × 6 рядов, 1 — дырка (нитка поднята) */
  var LOOM = [
    '10011001', '01100110', '00111100', '00111100', '01100110', '10011001'
  ];

  var $ = function (s, el) { return (el || root).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || root).querySelectorAll(s)); };
  var task = $('.ko-task'), sub = $('.ko-sub');
  var punched = [];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function say(t, s) { task.textContent = t; sub.textContent = s || ''; }
  function step(n) {
    root.setAttribute('data-step', n);
    $$('.ko-steps li').forEach(function (li, k) { li.classList.toggle('on', k < n); });
  }
  function show(sel) {
    ['.ko-s1', '.ko-s2', '.ko-s3', '.ko-finale'].forEach(function (s) { $(s).hidden = s !== sel; });
  }

  /* ---------- Шаг 1: станок ---------- */
  var loomCard = $('.ko-card-loom');
  var holes = $('.ko-holes', loomCard);
  LOOM.forEach(function (row) {
    row.split('').forEach(function (c) {
      var d = document.createElement('i');
      if (c === '1') d.className = 'h';
      holes.appendChild(d);
    });
  });
  var cloth = $('.ko-cloth'), ctx = cloth.getContext('2d');
  function clearCloth() {
    ctx.fillStyle = '#2a1a14'; ctx.fillRect(0, 0, cloth.width, cloth.height);
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    for (var x = 0; x < cloth.width; x += 6) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cloth.height); ctx.stroke(); }
  }
  function weave(done) {
    var cols = 24, rows = 12, cw = cloth.width / cols, ch = cloth.height / rows, r = 0;
    function row() {
      for (var c = 0; c < cols; c++) {
        var on = LOOM[r % 6][c % 8] === '1';
        ctx.fillStyle = on ? '#e4b84c' : '#8c2b2b';
        ctx.fillRect(c * cw + 0.5, r * ch + 0.5, cw - 1, ch - 1);
      }
      r++;
      if (r < rows) setTimeout(row, reduce ? 0 : 110); else done();
    }
    row();
  }
  clearCloth();
  loomCard.addEventListener('click', function () {
    if (loomCard.classList.contains('in')) return;
    loomCard.classList.add('in');
    say('Станок ткёт…', 'Смотри на ткань');
    setTimeout(function () {
      loomCard.hidden = true;
      weave(function () {
        say('Узор готов!', 'Дырки в карте выбрали, какие нитки поднять');
        $('.ko-cap').hidden = false;
        $('.ko-next').hidden = false;
        $('.ko-next').focus({ preventScroll: true });
      });
    }, reduce ? 0 : 650);
  });
  $('.ko-next').addEventListener('click', startPunch);

  /* ---------- Шаг 2: пробить ---------- */
  function buildCols(box) {
    box.innerHTML = '';
    SYM.forEach(function (s) {
      var d = document.createElement('span');
      d.innerHTML = '<b>' + s.i + '</b>' + s.w;
      box.appendChild(d);
    });
  }
  $$('.ko-cols').forEach(buildCols);
  var kCard = $('.ko-s2 .ko-card-k');
  SYM.forEach(function (s, k) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ko-cell';
    b.setAttribute('aria-label', 'Пробить: ' + s.w);
    b.addEventListener('click', function () { punch(k, b); });
    kCard.appendChild(b);
  });
  var oops = $('.ko-oops');
  function startPunch() {
    step(2); show('.ko-s2');
    say('Пробей на карте признаки больного', 'Нажми под словами жар, кашель, слабость');
    oops.textContent = 'Та же карта — но теперь в ней будут сведения о больном';
  }
  function punch(k, b) {
    if (punched.indexOf(k) > -1) return;
    if (NEED.indexOf(k) < 0) {
      oops.textContent = 'У больного нет такого: ' + SYM[k].w.toLowerCase();
      kCard.classList.remove('shake'); void kCard.offsetWidth; kCard.classList.add('shake');
      return;
    }
    punched.push(k);
    b.classList.add('h'); b.setAttribute('aria-label', 'Пробито: ' + SYM[k].w);
    var left = NEED.length - punched.length;
    oops.textContent = left ? 'Пробито! Ещё ' + (left === 1 ? 'одна дырка' : left + ' дырки') : 'Карта больного готова!';
    if (!left) setTimeout(startSlide, reduce ? 0 : 700);
  }

  /* ---------- Шаг 3: протащить ---------- */
  var rowsBox = $('.ko-rows'), slider = $('.ko-slider'), verdict = $('.ko-verdict');
  var pos = 0, dragging = false, found = false, moved = false;
  var park = document.createElement('div');
  park.className = 'ko-park';
  rowsBox.appendChild(park);
  ROWS.forEach(function (pins, r) {
    var row = document.createElement('div');
    row.className = 'ko-row';
    var html = '<span class="ko-med">💊 №&nbsp;' + (r + 1) + '</span>';
    for (var k = 0; k < SYM.length; k++) html += '<span class="ko-pin' + (pins.indexOf(k) > -1 ? ' p' : '') + '"></span>';
    row.innerHTML = html;
    row.addEventListener('click', function () { if (!found) { moved = true; place(r, true); } });
    rowsBox.appendChild(row);
  });
  SYM.forEach(function () { var c = document.createElement('span'); c.className = 'ko-cell'; slider.insertBefore(c, slider.lastElementChild); });

  function rowH() { return park.getBoundingClientRect().height; }
  function setY(y) { slider.style.transform = 'translateY(' + y + 'px)'; }
  function judge(r) {
    var pins = r < 0 ? [] : ROWS[r], cells = $$('.ko-cell', slider), hit = 0, empty = 0;
    cells.forEach(function (c, k) {
      var h = punched.indexOf(k) > -1, p = pins.indexOf(k) > -1;
      c.className = 'ko-cell' + (h ? ' h' : '') + (h && p ? ' in' : '') + (!h && p ? ' hit' : '') + (h && !p && r >= 0 ? ' empty' : '');
      if (!h && p) hit++;
      if (h && !p && r >= 0) empty++;
    });
    $$('.ko-row').forEach(function (el, k) { el.classList.toggle('cur', k === r); el.classList.toggle('ok', k === r && !hit && !empty); });
    slider.setAttribute('aria-valuenow', r + 1);
    var miss = function (want) { return SYM.filter(function (s, k) { return (punched.indexOf(k) > -1) !== want && pins.indexOf(k) > -1 === want; }).map(function (s) { return s.w.toLowerCase(); }).join(', '); };
    return { hit: hit, empty: empty, hitW: miss(true), emptyW: miss(false) };
  }
  function place(r, snap) {
    pos = Math.max(-1, Math.min(ROWS.length - 1, r));
    slider.classList.toggle('snap', !!snap);
    setY((pos + 1) * rowH());
    var j = judge(pos);
    if (!moved || pos < 0) return;
    slider.classList.add('moved');
    if (!j.hit && !j.empty) win();
    else verdict.innerHTML = '<b>№ ' + (pos + 1) + ' не подходит:</b> ' + (j.hit
      ? '<span class="ko-x">✕</span> шип «' + j.hitW + '» упёрся в карту — у больного этого нет'
      : '<span class="ko-o"></span> ' + (j.empty > 1 ? 'дырки «' + j.emptyW + '» пустые — это лекарство их не лечит' : 'дырка «' + j.emptyW + '» пустая — это лекарство её не лечит')) + '. Тяни ниже';
  }
  function win() {
    if (found) return;
    found = true;
    verdict.textContent = 'Все шипы прошли в дырки — лекарство № ' + (MATCH + 1) + ' найдено!';
    say('Нашлось!', 'Строка загорелась');
    setTimeout(finale, reduce ? 300 : 1500);
  }
  function startSlide() {
    step(3); show('.ko-s3');
    say('Тяни карту вниз по таблице лекарств', 'Где шипы войдут во все дырки — там лекарство');
    verdict.textContent = 'Золотые шипы в строке — что лечит лекарство. Нужно, чтобы шипы встали точно во все дырки';
    place(-1, true);
  }
  function yFrom(e) { return e.clientY - rowsBox.getBoundingClientRect().top - rowH() / 2; }
  slider.addEventListener('pointerdown', function (e) {
    if (found) return;
    dragging = true; moved = true; slider.setPointerCapture(e.pointerId);
    slider.classList.remove('snap'); slider.classList.add('drag');
  });
  slider.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var max = ROWS.length * rowH();
    var y = Math.max(0, Math.min(max, yFrom(e)));
    setY(y);
    var r = Math.round(y / rowH()) - 1;
    if (r !== pos) { pos = r; var j = judge(r); if (!j.hit && !j.empty) { dragging = false; slider.classList.remove('drag'); place(r, true); } }
  });
  function up() { if (!dragging) return; dragging = false; slider.classList.remove('drag'); place(pos, true); }
  slider.addEventListener('pointerup', up);
  slider.addEventListener('pointercancel', up);
  slider.addEventListener('keydown', function (e) {
    if (found) return;
    if (e.key === 'ArrowDown') { moved = true; place(pos + 1, true); e.preventDefault(); }
    if (e.key === 'ArrowUp') { moved = true; place(pos - 1, true); e.preventDefault(); }
  });
  window.addEventListener('resize', function () { if (!$('.ko-s3').hidden) setY((pos + 1) * rowH()); });

  /* ---------- Финал ---------- */
  var finCard = $('.ko-card-fin');
  function finale() {
    show('.ko-finale');
    say('Карта нашла ответ', '');
    finCard.innerHTML = '';
    SYM.forEach(function (s, k) { var c = document.createElement('span'); c.className = 'ko-cell' + (punched.indexOf(k) > -1 ? ' h' : ''); finCard.appendChild(c); });
    var st = $('.ko-stamp'); st.classList.remove('hit'); void st.offsetWidth; st.classList.add('hit');
    $('.ko-fin-card').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  $('.ko-again').addEventListener('click', function () {
    punched = []; found = false; moved = false; pos = 0;
    $$('.ko-s2 .ko-cell').forEach(function (b, k) { b.className = 'ko-cell'; b.setAttribute('aria-label', 'Пробить: ' + SYM[k].w); });
    slider.classList.remove('moved');
    loomCard.classList.remove('in'); loomCard.hidden = false; clearCloth();
    $('.ko-cap').hidden = true; $('.ko-next').hidden = true;
    step(1); show('.ko-s1');
    say('Вставь перфокарту в станок', 'Нажми на карточку с дырками');
    verdict.textContent = '';
    root.scrollIntoView({ block: 'start' });
  });
}());
