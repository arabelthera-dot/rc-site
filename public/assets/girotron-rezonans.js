/* Игра «Поймай резонанс» (31 января, гиротрон). Только нажатия (click): «Поле +» / «Поле −» шагами.
   Сцена видна сразу, без экрана правил и кнопки старта. Шаги:
   1) «молоток» 1964 г. (воспоминания М. И. Петелина, сборник ИПФ РАН 2026) → 6 Вт;
   2) волна короче, следующие приборы мощнее (мощность «превысила киловатт»), трубка греется;
   3) «Охладить» — предел был в охлаждении;
   4) поворот: гиротрон для ИТЭР — 1 000 000 Вт, луч греет плазму реактора.
   Счёт: award('g1',20), award('g2',20), award('g3',20), award('g4',40) — сумма 100 (window.MUSEUM_SCORE на странице). */
(function () {
  var root = document.querySelector('[data-girotron-igra]');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var cv = $('.gr-cv'), c = cv.getContext('2d');
  var W = 640, H = 360;
  var task = $('.gr-task'), sub = $('.gr-sub'), cap = $('.gr-cap'), capT = $('.gr-cap-t');
  var bMinus = $('.gr-minus'), bPlus = $('.gr-plus'), bAct = $('.gr-act'), bActT = $('.gr-act-t');
  var hand = $('.gr-hand'), steps = root.querySelectorAll('.gr-steps li');
  var fieldEl = $('.gr-field'), meterI = $('.gr-meter i'), wattEl = $('.gr-watt'), wlEl = $('.gr-wl'), ivEl = $('.gr-iv'), hint = $('.gr-match');
  var finale = $('.gr-finale'), again = $('.gr-again');

  var LV = [
    { target: 4, start: 1, watt: 6, wl: 'длинная', iv: '«молоток», 1964' },
    { target: 8, start: 4, watt: 1000, wl: 'короче', iv: 'следующий МЦР' }
  ];
  var MAXF = 10;
  var stage, lv, field, watt, wattTo, heat, cool, iter, matched, t = 0, last = 0;
  var N = 24, el = [];
  for (var i = 0; i < N; i++) el.push({ a: i / N * Math.PI * 2, r: 0.6 + Math.random() * 0.4 });

  function award(k, n) { if (typeof window.award === 'function') window.award(k, n); }
  function fmtW(x) { return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Вт'; }
  function setStep(n) { for (var k = 0; k < steps.length; k++) steps[k].classList.toggle('on', k <= n); }
  function say(tk, sb) { task.textContent = tk; sub.textContent = sb || ''; }
  function explain(s) { capT.textContent = s; cap.hidden = !s; }
  function activate(btn) {
    [bMinus, bPlus, bAct].forEach(function (b) { b.classList.toggle('gr-on', b === btn); });
    if (btn) { btn.appendChild(hand); hand.hidden = false; } else hand.hidden = true;
  }

  function freqE() { return field; }              // частота вращения электронов растёт с полем
  function freqR() { return LV[lv].target; }      // частота резонатора задана его размером

  function reset() {
    stage = 0; lv = 0; field = LV[0].start; watt = 0; wattTo = 0; heat = 0; cool = false; iter = 0; matched = false;
    bAct.hidden = true; bMinus.hidden = false; bPlus.hidden = false; finale.hidden = true; root.classList.remove('gr-wow');
    setStep(0); explain('');
    say('Что сделать сейчас: нажимай «Поле +», пока электроны не закрутятся в такт с резонатором.',
        'Синяя стрелка — электроны, золотая — резонатор. Первый прибор — «молоток».');
    upd(); activate(bPlus);
  }

  function upd() {
    fieldEl.textContent = field + ' из ' + MAXF;
    meterI.style.width = (field / MAXF * 100) + '%';
    wlEl.textContent = iter ? 'миллиметры' : LV[lv].wl;
    ivEl.textContent = iter ? 'гиротрон для ИТЭР' : LV[lv].iv;
    bMinus.disabled = field <= 1 || stage === 1 || stage >= 3;
    bPlus.disabled = field >= MAXF || stage === 1 || stage >= 3;
    var d = field - freqR();
    hint.textContent = iter ? 'резонанс' : d === 0 ? 'в такт — резонанс!' : d < 0 ? 'электроны медленнее резонатора' : 'электроны быстрее резонатора';
  }

  function change(dir) {
    if (stage !== 0 && stage !== 2) return;
    field = Math.max(1, Math.min(MAXF, field + dir));
    var d = field - freqR();
    upd();
    if (d === 0) return hit();
    explain(dir > 0 ? 'Поле стало сильнее — электроны закрутились быстрее. ' + (d < 0 ? 'Ещё медленнее резонатора.' : 'Перескочили: теперь быстрее резонатора.')
                    : 'Поле стало слабее — электроны закрутились медленнее. ' + (d > 0 ? 'Всё ещё быстрее резонатора.' : 'Теперь медленнее резонатора.'));
    activate(d < 0 ? bPlus : bMinus);
    say('Что сделать сейчас: нажми «' + (d < 0 ? 'Поле +' : 'Поле −') + '».', d < 0 ? 'Электронам нужно крутиться быстрее.' : 'Электронам нужно крутиться медленнее.');
  }

  function hit() {
    matched = true; wattTo = LV[lv].watt; upd();
    if (lv === 0) {
      stage = 1; award('g1', 20);
      explain('Циклотронный резонанс: электроны крутятся в магнитном поле с той же частотой, что у резонатора. Они сбились в сгусток и отдали энергию волне. Так работал первый МЦР — «молоток», о котором рассказали в 1964 году: всего 6 Вт.');
      say('Что сделать сейчас: нажми «Волна короче».', 'Резонатор меньше — частота выше.');
      showAct('Волна короче');
    } else {
      stage = 3; award('g2', 20);
      explain('Резонатор меньше — частота выше, поэтому понадобилось поле сильнее. Прибор стал мощнее — больше киловатта. Но смотри: трубка краснеет от жара.');
      say('Что сделать сейчас: нажми «Охладить».', 'Электроны, не отдавшие энергию волне, бьют в стенки и греют их.');
      showAct('Охладить');
    }
  }
  function showAct(txt) { bActT.textContent = txt; bAct.hidden = false; upd(); activate(bAct); }

  function act() {
    if (stage === 1) {
      lv = 1; stage = 2; matched = false; wattTo = 0; setStep(1);
      explain('Резонатор стал меньше, его частота выросла. Прежнего поля уже не хватает — резонанс пропал, луч погас.');
      say('Что сделать сейчас: нажимай «Поле +», пока стрелки снова не пойдут в такт.', 'Волна стала короче.');
      bAct.hidden = true; upd(); activate(bPlus);
    } else if (stage === 3) {
      stage = 4; cool = true; setStep(2); award('g3', 20);
      explain('Вода уносит тепло, трубка остывает. Именно охлаждение и ограничивало мощность первых гиротронов: сильнее луч — сильнее греются стенки. Научились отводить тепло — смогли поднять мощность.');
      say('Что сделать сейчас: нажми «Гиротрон для ИТЭР».', 'Посмотри, во что вырос «молоток» на 6 ватт.');
      showAct('Гиротрон для ИТЭР');
    } else if (stage === 4) {
      stage = 5; iter = 1; setStep(3); wattTo = 1000000; root.classList.add('gr-wow');
      bMinus.hidden = true; bPlus.hidden = true; bAct.hidden = true; activate(null); upd();
      explain('Тот же принцип — электроны в такт с резонатором, — но счётчик бежит до 1 000 000 Вт. Это один мегаватт: столько даёт гиротрон для термоядерного реактора ИТЭР. Его луч будет греть плазму внутри «бублика» реактора.');
      say('Смотри: счётчик растёт сам.', 'В 1964 году — 6 Вт. Сегодня — мегаватт.');
      setTimeout(function () { finale.hidden = false; award('g4', 40); }, 2600);
    }
  }

  bPlus.addEventListener('click', function () { change(1); });
  bMinus.addEventListener('click', function () { change(-1); });
  bAct.addEventListener('click', act);
  if (again) again.addEventListener('click', reset);

  function resize() {
    var r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    var w = Math.max(280, r.width || W);
    cv.width = Math.round(w * dpr); cv.height = Math.round(w * H / W * dpr);
    c.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
  }
  window.addEventListener('resize', resize);

  function arrow(cx, cy, R, a, col) {
    c.strokeStyle = col; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 7, 0, 7); c.fill();
  }

  var aE = 0, aR = 0;
  function draw(ts) {
    var dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts; t += dt;
    var fr = iter ? 6 : freqR(), fe = iter ? 6 : freqE();
    aR += dt * fr * 0.9; aE += dt * fe * 0.9;
    if (matched || iter) aE = aR;
    // мощность и нагрев
    watt += (wattTo - watt) * Math.min(1, dt * (iter ? 1.6 : 3));
    if (wattTo === 0) watt *= 0.9; else if (Math.abs(wattTo - watt) < wattTo * 0.003) watt = wattTo;
    wattEl.textContent = fmtW(watt);
    heat += ((stage === 3 ? 1 : 0) - heat) * dt * 1.5;
    if (cool) heat *= 0.9;

    c.clearRect(0, 0, W, H);
    c.fillStyle = '#10141c'; c.fillRect(0, 0, W, H);
    // магнитные катушки: ярче при сильном поле
    var fk = iter ? 1 : field / MAXF;
    for (var k = 0; k < 5; k++) {
      var x = 70 + k * 60;
      c.fillStyle = 'rgba(80,140,255,' + (0.2 + 0.7 * fk) + ')';
      c.fillRect(x, 70, 34, 14); c.fillRect(x, 276, 34, 14);
    }
    // трубка
    var hr = Math.round(60 + 190 * heat);
    c.fillStyle = 'rgb(' + hr + ',' + Math.round(70 - 30 * heat) + ',' + Math.round(80 - 40 * heat) + ')';
    c.fillRect(50, 100, 330, 160);
    c.strokeStyle = '#c9a84c'; c.lineWidth = 3; c.strokeRect(50, 100, 330, 160);
    // вода
    if (cool) {
      c.strokeStyle = 'rgba(90,200,255,.9)'; c.lineWidth = 6; c.setLineDash([16, 12]); c.lineDashOffset = -t * 60;
      c.beginPath(); c.moveTo(40, 94); c.lineTo(390, 94); c.moveTo(390, 266); c.lineTo(40, 266); c.stroke(); c.setLineDash([]);
    }
    // электроны: при резонансе сбиваются в сгусток
    var bunch = (matched || iter) ? 1 : 0;
    for (var j = 0; j < N; j++) {
      var e = el[j];
      var a = aE + (1 - bunch) * e.a + bunch * (e.a - Math.PI) * 0.12;
      var cx = 120 + (j % 4) * 55, R = 34 * e.r;
      c.fillStyle = '#7fd0ff';
      c.beginPath(); c.arc(cx + Math.cos(a) * R, 180 + Math.sin(a) * R, 4, 0, 7); c.fill();
    }
    // циферблаты: электроны (синий) и резонатор (золотой)
    c.strokeStyle = '#334'; c.lineWidth = 2;
    c.beginPath(); c.arc(470, 110, 48, 0, 7); c.stroke();
    c.beginPath(); c.arc(470, 250, 48, 0, 7); c.stroke();
    arrow(470, 110, 40, aE, '#7fd0ff');
    arrow(470, 250, 40, aR, '#e4c97a');
    // луч
    if (watt > 0.5) {
      var bw = iter ? 40 : 6 + 14 * Math.min(1, watt / 1000);
      var g = c.createLinearGradient(380, 0, W, 0);
      g.addColorStop(0, 'rgba(255,220,120,.95)'); g.addColorStop(1, 'rgba(255,120,60,.2)');
      c.fillStyle = g; c.fillRect(380, 180 - bw / 2, W - 380, bw);
    }
    // финал: «бублик» реактора с раскалённой плазмой
    if (iter) {
      var p = 0.5 + 0.5 * Math.sin(t * 4);
      c.strokeStyle = 'rgba(255,' + Math.round(120 + 80 * p) + ',200,.95)'; c.lineWidth = 26;
      c.beginPath(); c.ellipse(582, 180, 40, 110, 0, 0, 7); c.stroke();
      c.strokeStyle = '#c9a84c'; c.lineWidth = 3;
      c.beginPath(); c.ellipse(582, 180, 54, 126, 0, 0, 7); c.stroke();
    }
    requestAnimationFrame(draw);
  }

  resize(); reset(); requestAnimationFrame(draw);
})();
