/* Игра «Уложи команды в шаг» (27 января, «Эльбрус»): рецепт супа = программа, лента шагов = время машины.
   Один повар — одна команда за шаг (8 шагов). Два повара («Эльбрус») — по две за шаг, если команда не ждёт чужого результата. */
(function () {
  var root = document.querySelector('[data-elbrus-igra]');
  if (!root) return;

  var IC = {
    drop: '<path d="M12 3c3 5 6 8 6 11a6 6 0 0 1-12 0c0-3 3-6 6-11z" fill="#3a8ee6"/>',
    fire: '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="#e8642c"/><path d="M12 13c1 2 3 3 3 5a3 3 0 0 1-6 0c0-2 2-3 3-5z" fill="#ffc531"/>',
    salt: '<path d="M8 9l1-5h6l1 5z" fill="#8a8a8a"/><rect x="7" y="9" width="10" height="13" rx="2" fill="#fff" stroke="#6b6b6b"/><circle cx="10" cy="6" r=".9" fill="#fff"/><circle cx="14" cy="6" r=".9" fill="#fff"/>',
    potato: '<ellipse cx="12" cy="13" rx="9" ry="7" fill="#b9823f"/><circle cx="9" cy="11" r="1" fill="#7a5222"/><circle cx="14" cy="15" r="1" fill="#7a5222"/><path d="M3 6c2 1 3 1 5 0" stroke="#3a8ee6" stroke-width="2" fill="none"/><path d="M16 5c2 1 3 1 5 0" stroke="#3a8ee6" stroke-width="2" fill="none"/>',
    peel: '<ellipse cx="11" cy="13" rx="8" ry="7" fill="#f3d983"/><path d="M17 8c3-3 5 0 3 2s-1 5 2 5" stroke="#b9823f" stroke-width="2.5" fill="none"/>',
    knife: '<path d="M4 18L18 4l2 2-10 11z" fill="#c9ced6" stroke="#7d8590"/><rect x="2" y="16" width="6" height="4" rx="1" transform="rotate(-45 5 18)" fill="#6b4222"/>',
    pot: '<path d="M4 10h16v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#4b5563"/><rect x="3" y="8" width="18" height="3" rx="1.5" fill="#6b7280"/><ellipse cx="10" cy="6" rx="2.5" ry="2" fill="#f3d983"/><ellipse cx="14.5" cy="5" rx="2" ry="1.6" fill="#f3d983"/>',
    leaf: '<path d="M5 19C5 9 12 4 20 4c0 8-5 15-15 15z" fill="#4caf50"/><path d="M5 19L15 9" stroke="#2e7d32" stroke-width="1.5"/>',
    cook: '<path d="M7 14a4 4 0 0 1 .5-8 4.5 4.5 0 0 1 9 0 4 4 0 0 1 .5 8v5H7z" fill="#fff"/><rect x="7" y="16" width="10" height="3" fill="#cfd8e3"/>'
  };
  function svg(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + IC[k] + '</svg>'; }

  var T = [
    { id: 'w1', t: 'Налей воду', ic: 'drop', deps: [] },
    { id: 'w2', t: 'Вскипяти воду', ic: 'fire', deps: ['w1'], why: 'кипятить нечего — воды в кастрюле ещё нет' },
    { id: 'w3', t: 'Посоли воду', ic: 'salt', deps: ['w2'], why: 'солить рано — вода ещё не кипит' },
    { id: 'p1', t: 'Помой картошку', ic: 'potato', deps: [] },
    { id: 'p2', t: 'Почисти картошку', ic: 'peel', deps: ['p1'], why: 'сначала картошку надо помыть' },
    { id: 'p3', t: 'Нарежь картошку', ic: 'knife', deps: ['p2'], why: 'сначала картошку надо почистить' },
    { id: 'g', t: 'Нарежь зелень', ic: 'leaf', deps: [] },
    { id: 's', t: 'Брось картошку в воду', ic: 'pot', deps: ['w3', 'p3'], why: 'нужна солёная кипящая вода и нарезанная картошка' }
  ];
  var byId = {}; T.forEach(function (x, i) { x.n = i + 1; byId[x.id] = x; });

  var $ = function (s) { return root.querySelector(s); };
  var pool = $('.el-pool'), rowsEl = $('.el-rows'), cooksEl = $('.el-cooks');
  var task = $('.el-task'), sub = $('.el-sub'), oops = $('.el-oops'), nEl = $('.el-n');
  var race = $('.el-race'), win = $('.el-win'), btnNext = $('.el-next'), btnReset = $('.el-reset');
  var steps = root.querySelectorAll('.el-steps li');

  var mode = 1;          // 1 — один повар, 2 — «Эльбрус», два повара
  var place = {};        // id -> номер шага (0..7)
  var selected = null, demo = null, busy = false, touched = false;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setStep(k) { steps.forEach(function (li, i) { li.classList.toggle('on', i === k - 1); }); }
  function tileHTML(x) { return svg(x.ic) + '<span>' + x.t + '</span><span class="n">' + x.n + '</span>'; }

  function render() {
    pool.innerHTML = '';
    T.forEach(function (x) {
      if (place[x.id] != null) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'el-tile'; b.dataset.id = x.id; b.setAttribute('role', 'listitem');
      b.setAttribute('aria-label', x.n + '. ' + x.t + ' — перетащи на шаг');
      b.innerHTML = tileHTML(x);
      if (selected === x.id) b.classList.add('sel');
      pool.appendChild(b);
    });
    var left = pool.children.length; pool.hidden = !left; $('.el-label').hidden = !left;
    cooksEl.innerHTML = '<span></span><span>' + svg('cook') + 'Повар 1</span>' +
      (mode === 1 ? '<span class="off">второго нет</span>' : '<span>' + svg('cook') + 'Повар 2</span>');
    rowsEl.innerHTML = '';
    for (var r = 0; r < 8; r++) {
      var row = document.createElement('div');
      row.className = 'el-row'; row.dataset.row = r;
      row.innerHTML = '<b>шаг<br>' + (r + 1) + '</b>';
      var inRow = T.filter(function (x) { return place[x.id] === r; });
      if (inRow.length) row.classList.add('used');
      for (var c = 0; c < 2; c++) {
        var s = document.createElement('div');
        s.className = 'el-slot' + (mode === 1 && c === 1 ? ' off' : '');
        s.dataset.row = r;
        var x = inRow[c];
        if (x) {
          var b2 = document.createElement('button');
          b2.type = 'button'; b2.className = 'el-tile done'; b2.dataset.id = x.id;
          b2.setAttribute('aria-label', x.t + ', шаг ' + (r + 1) + (mode === 2 ? ' — нажми, чтобы убрать' : ''));
          b2.innerHTML = tileHTML(x);
          s.appendChild(b2);
        }
        row.appendChild(s);
      }
      rowsEl.appendChild(row);
    }
    var used = T.filter(function (x) { return place[x.id] != null; });
    nEl.textContent = used.length ? Math.max.apply(null, used.map(function (x) { return place[x.id]; })) + 1 : 0;
  }

  function say(msg) { oops.textContent = msg; }
  function shake(id) {
    var el = root.querySelector('.el-tile[data-id="' + id + '"]');
    if (el) { el.classList.remove('no'); void el.offsetWidth; el.classList.add('no'); }
  }

  // Можно ли поставить команду в шаг r: всё, чего она ждёт, — строго выше; всё, что ждёт её, — строго ниже.
  function check(id, r) {
    var x = byId[id];
    for (var i = 0; i < x.deps.length; i++) {
      var d = byId[x.deps[i]], pr = place[d.id];
      if (pr == null) return 'Рано! «' + x.t + '»: ' + x.why + '. Сначала уложи «' + d.t + '».';
      if (pr >= r) return '«' + x.t + '» ждёт «' + d.t + '» — положи её на шаг ниже. В одном шаге повара работают одновременно.';
    }
    var kids = T.filter(function (k) { return k.deps.indexOf(id) >= 0 && place[k.id] != null && k.id !== id; });
    for (var j = 0; j < kids.length; j++) {
      if (place[kids[j].id] <= r) return '«' + kids[j].t + '» ждёт «' + x.t + '» — эту плитку нужно выше.';
    }
    var cap = mode === 1 ? 1 : 2;
    var n = T.filter(function (k) { return place[k.id] === r && k.id !== id; }).length;
    if (n >= cap) return mode === 1 ? 'В шаге только один повар — одна команда.' : 'В шаге только два повара — клади в другой шаг.';
    return '';
  }

  function nextFree() { for (var r = 0; r < 8; r++) if (!T.some(function (k) { return place[k.id] === r; })) return r; return -1; }

  function tryPlace(id, r) {
    if (busy) return;
    if (mode === 1) r = nextFree();
    if (r < 0) return;
    var was = place[id]; delete place[id];
    var err = check(id, r);
    if (err) { if (was != null) place[id] = was; say(err); render(); shake(id); return; }
    place[id] = r; selected = null; say('');
    render(); after();
  }

  function unplace(id) {
    if (busy || mode === 1) return;
    var kid = T.filter(function (k) { return k.deps.indexOf(id) >= 0 && place[k.id] != null; })[0];
    if (kid) { say('Сначала убери «' + kid.t + '» — она ждёт эту команду.'); shake(id); return; }
    delete place[id]; say(''); render(); after();
  }

  function count() { return T.filter(function (x) { return place[x.id] != null; }).length; }

  function after() {
    stopDemo();
    var c = count();
    if (mode === 1) {
      if (c === 1) sub.textContent = 'Хорошо! Ещё одну';
      if (c === 3) autoFill();
      return;
    }
    btnReset.hidden = c === 0;
    if (c > 0 && c < 8) sub.textContent = 'Две плитки в одном шаге — если вторая не ждёт первую';
    if (c === 8) finish();
  }

  // Режим 1: один повар — после трёх плиток машина докладывает остальное сама, по одной.
  function autoFill() {
    busy = true;
    sub.textContent = 'Один повар делает по одной команде. Машина доложит остальное…';
    var rest = T.filter(function (x) { return place[x.id] == null; });
    var i = 0;
    (function step() {
      if (i >= rest.length) {
        busy = false;
        task.textContent = 'Один повар: 8 команд — 8 шагов';
        sub.textContent = 'Долго! Позови второго повара';
        btnNext.textContent = 'Позвать второго повара →';
        btnNext.hidden = false;
        return;
      }
      place[rest[i].id] = nextFree(); i++; render();
      setTimeout(step, reduce ? 60 : 380);
    })();
  }

  function startElbrus() {
    mode = 2; place = {}; selected = null; setStep(2);
    task.textContent = 'Два повара: уложи суп в меньше шагов';
    sub.textContent = 'Пока один повар наливает воду, второй моет картошку. Ставь две плитки рядом — в один шаг';
    btnNext.hidden = true; race.hidden = true; say('');
    render(); startDemo(true);
  }

  function finish() {
    var n = +nEl.textContent;
    busy = true; btnReset.hidden = true;
    task.textContent = 'Готово! Смотри, кто сварит быстрее';
    sub.textContent = '';
    race.hidden = false; win.textContent = '';
    var slow = $('.el-bar-slow'), fast = $('.el-bar-fast');
    slow.innerHTML = fast.innerHTML = new Array(9).join('<i></i>');
    var t = 0;
    (function tick() {
      if (t < 8) slow.children[t].classList.add('on');
      if (t < n) fast.children[t].classList.add('on');
      t++;
      if (t < 8) return setTimeout(tick, reduce ? 40 : 320);
      busy = false;
      if (n <= 4) {
        task.textContent = 'Вдвое быстрее!';
        win.innerHTML = 'Два повара: <b>' + n + ' шага</b> вместо 8. Ты ускорил программу вдвое.';
      } else {
        task.textContent = 'Быстрее! А можно ещё';
        win.innerHTML = n + ' шагов вместо 8. Рекорд — 4 шага. Подсказка: пусть повара сначала делают воду и картошку, а зелень — в последнем шаге.';
        btnReset.textContent = 'Уложить в 4 шага'; btnReset.hidden = false;
      }
      btnNext.textContent = 'Кто так считал первым? →';
      btnNext.hidden = false;
      setTimeout(function () { race.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }, 50);
    })();
  }

  function finale() {
    setStep(3);
    $('.el-head').hidden = true; $('.el-play').hidden = true;
    var f = $('.el-finale'); f.hidden = false;
    root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  btnNext.addEventListener('click', function () { if (mode === 1) startElbrus(); else finale(); });
  btnReset.addEventListener('click', function () {
    place = {}; selected = null; say(''); race.hidden = true; btnNext.hidden = true; btnReset.hidden = true;
    btnReset.textContent = 'Разложить заново';
    task.textContent = 'Два повара: уложи суп в меньше шагов';
    sub.textContent = 'Пока один повар наливает воду, второй моет картошку. Ставь две плитки рядом — в один шаг';
    render();
  });
  $('.el-again').addEventListener('click', function () {
    mode = 1; place = {}; selected = null; touched = false; setStep(1);
    $('.el-finale').hidden = true; $('.el-head').hidden = false; $('.el-play').hidden = false;
    race.hidden = true; btnNext.hidden = true; btnReset.hidden = true; say('');
    task.textContent = 'Свари суп машиной: уложи рецепт в шаги';
    sub.textContent = 'Тяни плитку вниз, на ленту шагов';
    render(); startDemo(); root.scrollIntoView({ block: 'start' });
  });

  // Подсказка-действие: призрак первой плитки сам едет на ленту, пока посетитель не тронет плитку.
  function startDemo(second) {
    stopDemo();
    if (reduce) return;
    requestAnimationFrame(function () {
      var from = pool.querySelector('.el-tile'), to = rowsEl.querySelector(second ? '.el-row .el-slot:nth-of-type(2)' : '.el-slot');
      if (!from || !to) return;
      var rr = root.getBoundingClientRect(), a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      demo = from.cloneNode(true);
      demo.className = 'el-tile el-demo'; demo.removeAttribute('aria-label'); demo.setAttribute('aria-hidden', 'true');
      demo.style.left = (a.left - rr.left) + 'px'; demo.style.top = (a.top - rr.top) + 'px'; demo.style.width = a.width + 'px';
      if (second) {
        var x2 = pool.querySelector('.el-tile[data-id="p1"]') || from; a = x2.getBoundingClientRect();
        demo.innerHTML = x2.innerHTML; demo.style.left = (a.left - rr.left) + 'px'; demo.style.top = (a.top - rr.top) + 'px';
      }
      demo.style.width = Math.min(a.width, b.width) + 'px';
      demo.style.setProperty('--dx', (b.left - a.left) + 'px'); demo.style.setProperty('--dy', (b.top - a.top) + 'px');
      root.appendChild(demo);
    });
  }
  function stopDemo() { if (demo) { if (demo._pair) demo._pair.remove(); demo.remove(); demo = null; } }

  // Перетаскивание пальцем и мышью (pointer events) + запасной путь «нажми плитку, потом шаг».
  var drag = null;
  root.addEventListener('pointerdown', function (e) {
    var t = e.target.closest('.el-tile');
    if (!t || busy || t.classList.contains('el-demo') || !root.contains(t) || $('.el-play').hidden) return;
    if (t.classList.contains('done') && mode === 1) return;
    stopDemo();
    drag = { id: t.dataset.id, el: t, x: e.clientX, y: e.clientY, moved: false, ghost: null, pid: e.pointerId };
    try { t.setPointerCapture(e.pointerId); } catch (_) {}
  });
  root.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.pid) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
    e.preventDefault();
    if (!drag.moved) {
      drag.moved = true;
      var r = drag.el.getBoundingClientRect();
      drag.ox = drag.x - r.left; drag.oy = drag.y - r.top;
      drag.ghost = drag.el.cloneNode(true); drag.ghost.classList.add('ghost'); drag.ghost.classList.remove('sel', 'done');
      drag.ghost.style.width = r.width + 'px';
      document.body.appendChild(drag.ghost); drag.el.classList.add('lift');
    }
    drag.ghost.style.left = (e.clientX - drag.ox) + 'px';
    drag.ghost.style.top = (e.clientY - drag.oy) + 'px';
    if (e.clientY > innerHeight - 110) scrollBy(0, 14); else if (e.clientY < 70) scrollBy(0, -14);
    hot(target(e.clientX, e.clientY));
  });
  function target(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el) return null;
    var row = el.closest('.el-row');
    if (row) return { row: +row.dataset.row, el: row.querySelector('.el-slot:not(.off)') };
    if (el.closest('.el-strip') || (mode === 1 && el.closest('.el-count'))) return { row: -1, el: null, strip: true };
    if (el.closest('.el-pool')) return { pool: true };
    return null;
  }
  function hot(tg) {
    root.querySelectorAll('.el-slot.hot').forEach(function (s) { s.classList.remove('hot'); });
    if (!tg) return;
    if (mode === 1 && (tg.row != null || tg.strip)) { var f = nextFree(); if (f >= 0) rowsEl.children[f].querySelector('.el-slot').classList.add('hot'); }
    else if (tg.el) {
      var free = Array.prototype.filter.call(rowsEl.children[tg.row].querySelectorAll('.el-slot'), function (s) { return !s.firstChild; })[0];
      (free || tg.el).classList.add('hot');
    }
  }
  function endDrag(e, cancel) {
    if (!drag || e.pointerId !== drag.pid) return;
    var d = drag; drag = null; hot(null);
    if (d.ghost) d.ghost.remove();
    d.el.classList.remove('lift');
    if (cancel) return;
    var placed = place[d.id] != null;
    if (d.moved) {
      var tg = target(e.clientX, e.clientY);
      if (!tg) { if (placed && mode === 2) unplace(d.id); return; }
      if (tg.pool) { if (placed) unplace(d.id); return; }
      if (mode === 1 && (tg.row != null || tg.strip)) return tryPlace(d.id, 0);
      if (tg.row >= 0) return tryPlace(d.id, tg.row);
      return;
    }
    // Нажатие без перетаскивания
    if (placed) return unplace(d.id);
    selected = selected === d.id ? null : d.id;
    if (selected) sub.textContent = 'Теперь нажми на шаг на ленте';
    render();
  }
  root.addEventListener('pointerup', function (e) { endDrag(e, false); });
  root.addEventListener('pointercancel', function (e) { endDrag(e, true); });
  rowsEl.addEventListener('click', function (e) {
    if (!selected || e.target.closest('.el-tile')) return;
    var row = e.target.closest('.el-row');
    if (row) tryPlace(selected, +row.dataset.row);
  });
  // Клавиатура: Enter на плитке выбирает её, Enter на шаге — кладёт.
  rowsEl.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && selected && e.target.classList.contains('el-row')) { e.preventDefault(); tryPlace(selected, +e.target.dataset.row); }
  });
  pool.addEventListener('keydown', function (e) {
    var t = e.target.closest('.el-tile');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selected = t.dataset.id; sub.textContent = 'Теперь выбери шаг на ленте и нажми Enter'; render(); var r0 = rowsEl.querySelector('.el-row'); if (r0) { rowsEl.querySelectorAll('.el-row').forEach(function (r) { r.tabIndex = 0; }); r0.focus(); } }
  });

  render(); startDemo();
})();
