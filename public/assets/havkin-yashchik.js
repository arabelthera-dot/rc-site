/* Игра «Неси ящик с вакциной» (28 января, Хавкин).
   Шаг 1 — две двери: дома закрыто, в Индии открыто.
   Шаг 2 — флаконы пальцем в деревни, по карте идёт волна холеры, огоньки гаснут.
   Шаг 3 — держишь ящик, счётчик доз растёт до 35 млн к 1940 году. */
(function () {
  var root = document.querySelector('[data-havkin-igra]');
  if (!root) return;
  var $ = function (s, el) { return (el || root).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var task = $('.hv-task'), sub = $('.hv-sub'), steps = $$('.hv-steps li');
  function say(t, s) { task.textContent = t; sub.textContent = s || ''; }
  function step(n) { steps.forEach(function (li, i) { li.classList.toggle('on', i === n - 1); }); }

  /* Указатель-рука */
  var hand = document.createElement('span');
  hand.className = 'hv-hand'; hand.setAttribute('aria-hidden', 'true'); hand.textContent = '👆';
  root.appendChild(hand);
  var hintAnim = null;
  function at(el) {
    var r = el.getBoundingClientRect(), b = root.getBoundingClientRect();
    return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
  }
  function pointHand(el, dx, dy) {
    stopHint();
    var p = at(el);
    hand.hidden = false;
    hand.style.left = (p.x + (dx || 0)) + 'px';
    hand.style.top = (p.y + (dy || 0)) + 'px';
  }
  function stopHint() { if (hintAnim) { hintAnim.cancel(); hintAnim = null; } }

  /* ---------- Шаг 1 ---------- */
  var ru = $('.hv-s1 .hv-door-ru'), ind = $('.hv-s1 .hv-door-in'), crate1 = $('.hv-crate-s1'), cap = $('.hv-cap');
  var phase = 'home';
  function moveCrate(door) {
    var a = at(crate1), d = at(door);
    crate1.style.transform = 'translate(' + (d.x - a.x) * 0.8 + 'px,' + (d.y - a.y + 40) * 0.8 + 'px) scale(.7)';
  }
  function goHome() {
    phase = 'busy'; hand.hidden = true;
    moveCrate(ru);
    setTimeout(function () {
      ru.classList.add('shut');
      ru.querySelector('small').textContent = '«не нужна»';
      cap.hidden = false;
      cap.textContent = '1892. Хавкин из Одессы предложил дома свою прививку от холеры. Ответ: «не нужна». Дверь закрыта.';
    }, reduce ? 0 : 700);
    setTimeout(function () {
      crate1.style.transform = '';
      ind.classList.add('glow');
      say('Дома не взяли. Неси в Индию', 'Нажми на ящик ещё раз');
      phase = 'india';
      setTimeout(function () { pointHand(crate1, 50, 10); }, 650);
    }, reduce ? 300 : 1900);
  }
  function goIndia() {
    phase = 'busy'; hand.hidden = true;
    moveCrate(ind);
    setTimeout(function () { ind.classList.add('open'); }, reduce ? 0 : 600);
    setTimeout(startMap, reduce ? 300 : 1800);
  }
  function s1tap() { if (phase === 'home') goHome(); else if (phase === 'india') goIndia(); }
  crate1.addEventListener('click', s1tap);
  ru.addEventListener('click', function () { if (phase === 'home') goHome(); });
  ind.addEventListener('click', function () { if (phase === 'india') goIndia(); });

  /* ---------- Карта ---------- */
  // Схема Индии (долгота, широта) → координаты 310×310: x=(lon-67)·10, y=(38-lat)·10
  var LL = [[74.5,37],[78,35.5],[79,32.5],[81,30],[84,28],[88,27.5],[92,27],[96,28.2],[97,27.3],[95,25.5],[93,23],[91.5,22],
    [89,21.6],[87,21.5],[86,20],[84,18.5],[82,17],[80.2,15.5],[80,13],[79.8,10.5],[78,8.5],[77,8],[76,9.5],[75,12.5],[74,14.5],
    [73,17],[72.8,19],[72.6,21],[70,21],[69,22.5],[68.5,23.5],[70.5,25],[70,27],[71.5,28],[73.5,30],[74.5,32],[74,34.5]];
  var POLY = LL.map(function (p) { return [(p[0] - 67) * 10, (38 - p[1]) * 10]; });
  var pts = POLY.map(function (p) { return p.join(','); }).join(' ');
  $('.hv-land').setAttribute('points', pts); $('.hv-clip').setAttribute('points', pts);
  var VILS = [[74.5,29],[80,28],[85,25.5],[88,22.8],[73.5,23.5],[79,24],[76,19],[81,19.5]].map(function (p) {
    return { x: (p[0] - 67) * 10, y: (38 - p[1]) * 10 };
  });
  var vilBox = $('.hv-vils'), map = $('.hv-map');
  VILS.forEach(function (v, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'hv-vil';
    b.style.left = (v.x / 3.1) + '%'; b.style.top = (v.y / 3.1) + '%';
    b.setAttribute('aria-label', 'Деревня ' + (i + 1) + ': привить');
    var l = document.createElement('span'); l.className = 'hv-lights';
    for (var k = 0; k < 10; k++) l.appendChild(document.createElement('i'));
    b.appendChild(l); vilBox.appendChild(b);
    v.el = b;
  });

  /* ---------- Шаг 2 ---------- */
  var crate2 = $('.hv-crate-s2'), vials = $$('.hv-vial', crate2), vaccinated = 0, s2phase = 'off';
  var hint = document.createElement('span');
  hint.className = 'hv-hand'; hint.style.animation = 'none'; hint.setAttribute('aria-hidden', 'true');
  hint.innerHTML = '<span class="hv-vial" style="display:inline-block;margin:0 -6px 0 0;vertical-align:bottom;transform:scale(.7)"></span>👆';

  function startMap() {
    $('.hv-s1').hidden = true; $('.hv-s2').hidden = false; step(2);
    say('Привей деревни: тащи флакон на деревню', 'Флаконов 4, деревень 8 — выбирай');
    s2phase = 'drag';
    root.appendChild(hint); hand.hidden = true;
    setTimeout(runHint, 300);
  }
  function runHint() {
    if (s2phase !== 'drag' || vaccinated > 0) return;
    var a = at(vials[0]), t = at(VILS[5].el);
    hint.hidden = false; hint.style.left = '0px'; hint.style.top = '0px';
    if (reduce || !hint.animate) { hint.style.transform = 'translate(' + t.x + 'px,' + t.y + 'px)'; return; }
    hintAnim = hint.animate([
      { transform: 'translate(' + (a.x - 12) + 'px,' + (a.y - 10) + 'px)', opacity: 0 },
      { transform: 'translate(' + (a.x - 12) + 'px,' + (a.y - 10) + 'px)', opacity: 1, offset: .15 },
      { transform: 'translate(' + (t.x - 12) + 'px,' + (t.y - 10) + 'px)', opacity: 1, offset: .75 },
      { transform: 'translate(' + (t.x - 12) + 'px,' + (t.y - 10) + 'px)', opacity: 0 }
    ], { duration: 2200, iterations: Infinity, easing: 'ease-in-out' });
  }
  function hideHint() { stopHint(); hint.hidden = true; }

  function nextVial() { for (var i = 0; i < vials.length; i++) if (!vials[i].classList.contains('used')) return vials[i]; return null; }
  function vaccinate(v, vial) {
    if (s2phase !== 'drag' || v.el.classList.contains('vac')) return;
    vial = vial || nextVial(); if (!vial) return;
    vial.classList.add('used'); v.el.classList.add('vac'); v.vac = true;
    v.el.setAttribute('aria-label', 'Деревня привита');
    vaccinated++; hideHint();
    var left = 4 - vaccinated;
    if (left > 0) say('Привей деревни: тащи флакон на деревню', 'Осталось флаконов: ' + left);
    else { s2phase = 'wave'; say('Смотри: идёт холера', 'Огонёк гаснет — холера унесла жителя'); setTimeout(wave, 900); }
  }
  VILS.forEach(function (v) { v.el.addEventListener('click', function () { vaccinate(v); }); });

  // Перетаскивание флакона пальцем или мышью
  var drag = null;
  function vilUnder(x, y) {
    for (var i = 0; i < VILS.length; i++) {
      var r = VILS[i].el.getBoundingClientRect(), pad = 10;
      if (x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad) return VILS[i];
    }
    return null;
  }
  vials.forEach(function (vial) {
    vial.addEventListener('pointerdown', function (e) {
      if (s2phase !== 'drag' || vial.classList.contains('used')) return;
      e.preventDefault(); hideHint();
      var g = vial.cloneNode(); g.classList.add('hv-ghost'); document.body.appendChild(g);
      drag = { vial: vial, g: g, over: null };
      vial.style.opacity = '.25';
      try { vial.setPointerCapture(e.pointerId); } catch (_) {}
      moveDrag(e);
    });
    vial.addEventListener('pointermove', function (e) { if (drag && drag.vial === vial) moveDrag(e); });
    function end(e) {
      if (!drag || drag.vial !== vial) return;
      var v = vilUnder(e.clientX, e.clientY);
      drag.g.remove(); vial.style.opacity = '';
      if (drag.over) drag.over.el.classList.remove('hot');
      drag = null;
      if (v && !v.vac) vaccinate(v, vial);
      else if (!vaccinated) setTimeout(runHint, 400);
    }
    vial.addEventListener('pointerup', end);
    vial.addEventListener('pointercancel', end);
  });
  function moveDrag(e) {
    drag.g.style.left = e.clientX + 'px'; drag.g.style.top = e.clientY + 'px';
    var v = vilUnder(e.clientX, e.clientY);
    if (drag.over && drag.over !== v) drag.over.el.classList.remove('hot');
    if (v && !v.vac) v.el.classList.add('hot');
    drag.over = v;
  }

  // Волна холеры: слева направо, на привитых гаснет в 10 раз меньше огоньков (10 из 40 против 1 из 40)
  function wave() {
    var un = VILS.filter(function (v) { return !v.vac; }), va = VILS.filter(function (v) { return v.vac; });
    var byX = function (a, b) { return a.x - b.x; };
    un.sort(byX).forEach(function (v, i) { v.loss = [3, 2, 3, 2][i] || 0; });
    va.sort(byX).forEach(function (v, i) { v.loss = i === 1 ? 1 : 0; });
    VILS.forEach(function (v) { v.hit = false; });
    var rect = $('.hv-wave'); rect.classList.add('go');
    var t0 = null, dur = reduce ? 600 : 4200;
    function frame(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), x = -90 + k * 400;
      rect.setAttribute('x', x);
      VILS.forEach(function (v) {
        if (!v.hit && x + 45 >= v.x) {
          v.hit = true;
          var lights = $$('i', v.el), idx = [7, 2, 5, 0, 9];
          for (var j = 0; j < v.loss; j++) lights[idx[j]].classList.add('out');
        }
      });
      if (k < 1) requestAnimationFrame(frame); else { rect.classList.remove('go'); setTimeout(result, 500); }
    }
    requestAnimationFrame(frame);
  }
  function row(el, out) {
    for (var i = 0; i < 40; i++) { var d = document.createElement('i'); if (i >= 40 - out) d.className = 'out'; el.appendChild(d); }
  }
  function result() {
    row($('.lt-u'), 10); row($('.lt-v'), 1);
    say('Привитые деревни почти все горят', 'Без прививки погас каждый 4-й огонёк, с прививкой — 1 из 40');
    $('.hv-result').hidden = false; $('.hv-crate-s2').parentNode.hidden = true;
    $('.hv-result').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }

  /* ---------- Шаг 3: чума, держи ящик ---------- */
  var p = 0, holding = false, last = 0, done = false;
  var DOTS = (function () {
    var s = 7, out = [];
    function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    function inside(x, y) {
      var c = false;
      for (var i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
        var a = POLY[i], b = POLY[j];
        if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
      }
      return c;
    }
    while (out.length < 320) { var x = rnd() * 310, y = rnd() * 310; if (inside(x, y)) out.push([x, y]); }
    return out;
  })();
  var dotsG = $('.hv-dots'), shown = 0, NS = 'http://www.w3.org/2000/svg';
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function doses(pp) {
    var year = 1897 + pp * 43;
    var d = year <= 1909 ? (year - 1897) / 12 * 8e6 : 8e6 + (year - 1909) / 31 * 27e6;
    return Math.round(d / 1000) * 1000;
  }
  function draw() {
    var year = Math.floor(1897 + p * 43);
    $('.hv-year').textContent = year;
    $('.hv-doses').textContent = p >= 1 ? '35 000 000' : fmt(doses(p));
    $('.hv-bar span').style.width = (p * 100) + '%';
    var want = Math.round(p * DOTS.length);
    while (shown < want) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', DOTS[shown][0].toFixed(1)); c.setAttribute('cy', DOTS[shown][1].toFixed(1)); c.setAttribute('r', 2.6);
      dotsG.appendChild(c); shown++;
    }
    VILS.forEach(function (v, i) { if (p > (i + 1) / 9) v.el.classList.add('vac'); });
    if (p < .12) sub.textContent = '1897: сначала Хавкин привил себя — дозой в 10 раз больше';
    else if (year < 1909) sub.textContent = 'В тех, кто прививал, летели камни. Держи дальше!';
    else if (p < 1) sub.textContent = year < 1925 ? '1909: уже 8 миллионов. Держи!' : 'Бомбейская лаборатория — теперь Институт Хавкина';
    else sub.textContent = '1940: 35 миллионов прививок';
  }
  function tick(t) {
    if (done) return;
    if (holding) { p = Math.min(1, p + (t - last) / 7000); draw(); }
    last = t;
    if (p >= 1) { done = true; setTimeout(finale, 1300); return; }
    requestAnimationFrame(tick);
  }
  function startPlague() {
    step(3); s2phase = 'plague';
    $('.hv-result').hidden = true; $('.hv-crate-s2').parentNode.hidden = false;
    $('.hv-legend').hidden = true; $('.hv-schema').textContent = 'схема · зелёная точка — привитые от чумы';
    VILS.forEach(function (v) { v.el.classList.remove('vac'); v.el.tabIndex = -1; $$('i', v.el).forEach(function (i) { i.classList.remove('out'); }); });
    vials.forEach(function (v) { v.classList.remove('used'); v.style.cursor = 'pointer'; });
    crate2.style.cursor = 'pointer'; crate2.setAttribute('aria-label', 'Ящик с вакциной от чумы: нажми и держи');
    $('.hv-counter').hidden = false; $('.hv-bar').hidden = false;
    say('Пришла чума. Прививай всю Индию', 'Нажми и держи ящик');
    root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () { pointHand(crate2, 70, 6); }, 600);
    requestAnimationFrame(function (t) { last = t; requestAnimationFrame(tick); });
  }
  function hold(on) {
    if (s2phase !== 'plague' || done) return;
    holding = on; crate2.classList.toggle('hold', on);
    if (on) hand.hidden = true;
  }
  crate2.addEventListener('pointerdown', function (e) { if (s2phase === 'plague') { e.preventDefault(); hold(true); } });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { crate2.addEventListener(ev, function () { hold(false); }); });
  crate2.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); hold(true); } });
  crate2.addEventListener('keyup', function () { hold(false); });
  crate2.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  $('.hv-next').addEventListener('click', startPlague);

  function finale() {
    hand.hidden = true; hint.hidden = true;
    $('.hv-s2').hidden = true; $('.hv-head').hidden = true; $('.hv-steps').hidden = true;
    $('.hv-finale').hidden = false;
    root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  $('.hv-again').addEventListener('click', function () { location.reload(); });

  // Первая подсказка
  setTimeout(function () { pointHand(crate1, 60, 4); }, 300);
})();
