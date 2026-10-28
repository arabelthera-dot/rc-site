/* igra-ruka — вид как у образца 29 янв. (ko-hand, rc-site e4f86d74). Подсказка «куда жать» (Р206, 23.10.2026): на шаге одна активная кнопка
   пульсирует, над ней рука «тап-тап», остальные кнопки игры приглушены.
   Вставить В НАЧАЛО скрипта игры как есть. Использование:
     var ruka = igraRuka(root);   // root — секция игры
     ruka.na(knopka);             // показать руку над кнопкой, кнопка пульсирует
     ruka.ubrat();                // убрать (пока идёт анимация / финал)
   Отклик на касание (≤100 мс): класс .igra-zhmyak на pointerdown + navigator.vibrate(20). */
function igraRuka(root) {
  var el = document.createElement('span');
  el.className = 'igra-ruka'; el.setAttribute('aria-hidden', 'true'); el.hidden = true;
  el.innerHTML = '<i class="igra-ruka-krug"></i><svg viewBox="0 0 40 48" width="40" height="48"><path d="M15 4c2.2 0 4 1.8 4 4v13l1.2-.5c1.9-.7 4 .2 4.8 2l.3.7.8-.3c1.9-.6 4 .3 4.7 2.2l.2.5c1.9-.4 3.8.7 4.4 2.5.2.6.3 1.2.3 1.8V36c0 5.5-4.5 10-10 10h-4.6c-3 0-5.8-1.4-7.7-3.7L5.2 33.5c-1.3-1.6-1.1-4 .5-5.3 1.5-1.2 3.7-1.1 5.1.3l.2.2V8c0-2.2 1.8-4 4-4z" fill="#fff" stroke="#1a1206" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  if (getComputedStyle(root).position === 'static') root.style.position = 'relative';
  root.appendChild(el);
  var cel = null;
  function mesto() {
    if (!cel || el.hidden) return;
    var r = cel.getBoundingClientRect(), b = root.getBoundingClientRect();
    el.style.left = Math.round(r.left - b.left + r.width * 0.86) + 'px';
    el.style.top = Math.round(r.top - b.top + r.height * 0.5) + 'px';
  }
  function ubrat() {
    if (cel) cel.classList.remove('igra-aktiv');
    cel = null; el.hidden = true; root.classList.remove('igra-ved');
  }
  function na(knopka) {
    ubrat();
    if (!knopka) return;
    cel = knopka; cel.classList.add('igra-aktiv'); root.classList.add('igra-ved');
    el.hidden = false; mesto();
    requestAnimationFrame(mesto);
  }
  window.addEventListener('resize', mesto);
  if (window.ResizeObserver) new ResizeObserver(mesto).observe(root);
  root.addEventListener('pointerdown', function (e) {
    var k = e.target.closest('button, [role="button"]');
    if (!k || !root.contains(k)) return;
    k.classList.add('igra-zhmyak');
    setTimeout(function () { k.classList.remove('igra-zhmyak'); }, 160);
    if (navigator.vibrate) { try { navigator.vibrate(20); } catch (_) {} }
  });
  root.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  return { na: na, ubrat: ubrat, mesto: mesto };
}

/* «Километр над Петербургом» — 29 января, Костович (r420-29). Вид сбоку: «Россия» летит вправо над крышами и шпилями,
   сверху грозовые тучи. Палец (мышь, стрелки) задаёт высоту — корабль плывёт за ним с запаздыванием. Порыв ветра
   предупреждает стрелка за 1 с, потом 1,6 с толкает корабль вверх или вниз; на полном ходу — вдвое сильнее.
   Малый ход: 20 м/с, бензин 2,6 %/с (на километр не хватит). Полный ход: 40 м/с, 3,6 %/с (экономнее на метр).
   Удар — касание крыш, шпиля или тучи; три удара — проигрыш, бензин 0 раньше 1000 м — проигрыш. */
(function () {
  'use strict';
  var root = document.querySelector('[data-km-igra]');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var cv = $('canvas'), cx = cv.getContext('2d'), elTask = $('.km-task'), elSub = $('.km-sub');
  var bHod = $('.km-hodbtn'), boxHod = $('.km-hod'), fin = $('.km-finale'), finH = $('.km-fin-h'), finTxt = $('.km-fin-txt'), zv = $('.km-zvezdy'), bAgain = $('.km-again');
  var ruka = igraRuka(root);
  var W = 340, H = 300, dpr = 1, S = null, nagrada = false, raf = 0, last = 0;
  var CEL = 1000, SHPILI = [180, 430, 690, 900], PORYVY = [1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1];

  function nov() {
    S = { faza: 'zhdem', put: 0, benz: 100, udary: 0, y: 0.5, cel: 0.5, vy: 0, polnyy: false, neuyazv: 0, t: 0,
      poryv: null, sled: 2.2, np: 0, gnut: 0, vint: 0 };
    bHod.setAttribute('aria-pressed', 'false'); root.dataset.faza = 'zhdem'; delete root.dataset.itog;
    txt('Коснись неба — и «Россия» отдаст швартовы', 'Веди пальцем вверх-вниз: корабль пойдёт за ним. Порыв ветра покажет красная стрелка.');
    tablo(); ruka.na(cv);
  }
  function txt(a, b) { elTask.innerHTML = '<b>Что сделать сейчас:</b> ' + a; elSub.textContent = b || ''; }
  function sobytie(e) { try { document.dispatchEvent(new CustomEvent('rc-igra', { detail: { e: e, igra: 'kilometr-nad-peterburgom' } })); } catch (x) {} }
  function tablo() {
    $('.km-put').textContent = Math.floor(S.put) + ' м';
    $('.km-pbar i').style.width = Math.min(100, S.put / CEL * 100) + '%';
    $('.km-benz').textContent = Math.max(0, Math.ceil(S.benz)) + ' %';
    $('.km-bbar i').style.width = Math.max(0, S.benz) + '%';
    var tr = $('.km-trosy'); tr.textContent = ['●', '●', '●'].map(function (c, i) { return i < 3 - S.udary ? '●' : '○'; }).join(' ');
    tr.classList.toggle('km-krasn', S.udary >= 2);
  }
  function start() {
    if (S.faza !== 'zhdem') return;
    S.faza = 'idet'; root.dataset.faza = 'idet'; ruka.ubrat(); sobytie('start');
    txt('Держи «Россию» между крышами и тучами', 'Полный ход — экономнее, но порыв на нём бьёт вдвое сильнее.');
    last = 0; raf = requestAnimationFrame(kadr);
  }
  /* высота: 0 — верх (тучи), 1 — низ (крыши). Коридор: 0.14…0.80, шпиль поднимает низ до 0.56 */
  function niz(put) {
    var n = 0.80;
    SHPILI.forEach(function (s) { var d = Math.abs(put - s); if (d < 26) n = Math.min(n, 0.56 + d / 26 * 0.24); });
    return n;
  }
  function shag(dt) {
    S.t += dt; S.vint += dt * (S.polnyy ? 30 : 15);
    var v = S.polnyy ? 40 : 20;
    S.put += v * dt; S.benz -= (S.polnyy ? 3.6 : 2.6) * dt;
    if (S.neuyazv > 0) S.neuyazv -= dt;
    /* порывы */
    S.sled -= dt;
    if (!S.poryv && S.sled <= 0) { S.poryv = { dir: PORYVY[S.np++ % PORYVY.length], t: -1 }; txt(S.poryv.dir > 0 ? 'Порыв сверху — уведи корабль выше!' : 'Порыв снизу — уведи корабль ниже!', 'Стрелка показывает, куда ударит ветер.'); }
    var sila = 0;
    if (S.poryv) {
      S.poryv.t += dt;
      if (S.poryv.t > 0) sila = S.poryv.dir * 0.42 * (S.polnyy ? 2 : 1);
      if (S.poryv.t > 1.6) { S.poryv = null; S.sled = 1.6 + (S.np % 3) * 0.6; txt('Держи «Россию» между крышами и тучами', S.polnyy ? 'Идёшь полным ходом.' : 'Малым ходом бензина на километр не хватит.'); }
    }
    S.gnut += ((sila ? S.poryv.dir : 0) - S.gnut) * Math.min(1, dt * 4);
    var a = (S.cel - S.y) * 9 - S.vy * 4.2 + sila;
    S.vy += a * dt; S.y += S.vy * dt;
    var verh = 0.14, nz = niz(S.put);
    if ((S.y < verh || S.y > nz) && S.neuyazv <= 0) {
      S.udary++; S.neuyazv = 1.1; S.vy = 0; S.y = Math.max(verh + 0.08, Math.min(nz - 0.08, S.y)); S.cel = S.y;
      if (navigator.vibrate) { try { navigator.vibrate(60); } catch (x) {} }
      sobytie('udar');
      if (S.udary < 3) txt(S.y < 0.4 ? 'Удар о тучу! Лопнул трос' : 'Удар о крыши! Лопнул трос', 'Осталось тросов: ' + (3 - S.udary) + '. Три удара — корабль сорвёт.');
    }
    S.y = Math.max(0.05, Math.min(0.95, S.y));
    tablo();
    if (S.udary >= 3) return konec(false, 'Корабль сорвало', 'Три удара — тросы-спицы лопнули. Уводи «Россию» от стрелки заранее, ещё до порыва.');
    if (S.put >= CEL) return konec(true);
    if (S.benz <= 0) return konec(false, 'Бензин кончился', 'Малым ходом на километр не хватит. Давай полный ход, когда ветра нет, и сбрасывай перед порывом.');
  }
  function konec(pobeda, h, t) {
    S.faza = 'konec'; root.dataset.faza = 'konec'; root.dataset.itog = pobeda ? 'pobeda' : 'proigrysh';
    root.classList.add(pobeda ? 'km-pobeda' : 'km-proigr'); boxHod.hidden = true; tablo();
    if (pobeda) {
      txt('«Россия» прошла километр над Петербургом', 'В жизни ей не дали взлететь — буря снесла сарай.');
      finH.textContent = 'Километр пройден!';
      finTxt.textContent = 'Корабль Костовича долетел: ударов — ' + S.udary + ', бензина осталось ' + Math.max(0, Math.ceil(S.benz)) + ' %. В 1889 году буря разрушила сборочный сарай, и «Россия» так и не поднялась в небо.';
      var z = [[true, 'Километр пройден'], [S.udary <= 1, 'Не больше одного удара'], [S.benz >= 10, 'В баке осталось 10 % бензина']];
      zv.innerHTML = z.map(function (a) { return '<li class="' + (a[0] ? 'on' : '') + '">' + (a[0] ? '★ ' : '☆ ') + a[1] + '</li>'; }).join('');
      root.dataset.zvezdy = z.filter(function (a) { return a[0]; }).length;
      if (!nagrada && typeof window.award === 'function') { nagrada = true; window.award('igra', 40); }
      sobytie('pobeda');
    } else {
      txt(h, 'Жми «Ещё раз».');
      finH.textContent = h + ' на ' + Math.floor(S.put) + ' м';
      finTxt.textContent = t;
      zv.innerHTML = '<li>☆ Километр пройден</li><li>☆ Не больше одного удара</li><li>☆ В баке осталось 10 % бензина</li>';
      root.dataset.zvezdy = 0;
      sobytie('proigrysh');
    }
    fin.hidden = false;
    setTimeout(function () { ruka.na(bAgain); }, 900);
  }
  function kadr(ts) {
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    if (S.faza === 'idet') shag(dt);
    risuj();
    if (S.faza === 'idet') raf = requestAnimationFrame(kadr);
  }

  /* ── управление ─────────────────────────────────────────── */
  var vedu = false;
  function navesti(e) { var r = cv.getBoundingClientRect(); S.cel = Math.max(0.08, Math.min(0.92, (e.clientY - r.top) / r.height)); }
  cv.addEventListener('pointerdown', function (e) {
    if (S.faza === 'konec') return;
    e.preventDefault(); vedu = true; try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    navesti(e); start();
  });
  cv.addEventListener('pointermove', function (e) { if (vedu && S.faza === 'idet') navesti(e); });
  ['pointerup', 'pointercancel'].forEach(function (t) { cv.addEventListener(t, function () { vedu = false; }); });
  cv.tabIndex = 0;
  cv.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault(); start(); S.cel = Math.max(0.08, Math.min(0.92, S.cel + (e.key === 'ArrowUp' ? -0.08 : 0.08)));
  });
  bHod.addEventListener('click', function () {
    if (S.faza === 'konec') return;
    S.polnyy = !S.polnyy; bHod.setAttribute('aria-pressed', String(S.polnyy)); start();
  });
  bAgain.addEventListener('click', function () { fin.hidden = true; boxHod.hidden = false; root.classList.remove('km-pobeda', 'km-proigr'); cancelAnimationFrame(raf); nov(); risuj(); });

  /* ── рисунок ─────────────────────────────────────────────── */
  function razmer() {
    W = cv.parentNode.clientWidth || 340; H = cv.clientHeight || 300; dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); risuj();
  }
  function gorod(put) {
    /* крыши — повторяющийся ряд, сдвиг по пройденному пути; 1 м = 1.6 px */
    var k = 1.6, sd = put * k, y0 = H * 0.86;
    cx.fillStyle = '#1b2c40'; cx.fillRect(0, H * 0.93, W, H * 0.07);
    cx.fillStyle = '#2b4a6b'; cx.fillRect(0, H * 0.955, W, H * 0.02); /* Нева */
    for (var i = -1; i < W / 34 + 2; i++) {
      var n = Math.floor(sd / 34) + i, x = n * 34 - sd, h = 18 + ((n * 37) % 23);
      cx.fillStyle = n % 3 ? '#233a55' : '#2a4563';
      cx.fillRect(x, y0 - h + H * 0.07, 32, h);
      cx.fillStyle = 'rgba(255,214,102,' + (n % 2 ? .55 : .3) + ')';
      cx.fillRect(x + 6, y0 - h + H * 0.07 + 6, 4, 5); cx.fillRect(x + 20, y0 - h + H * 0.07 + 10, 4, 5);
    }
    SHPILI.forEach(function (s, i) {
      var x = W * 0.5 + (s - put) * k; if (x < -40 || x > W + 40) return;
      var verh = H * 0.56;
      cx.fillStyle = '#d4a93a';
      cx.beginPath(); cx.moveTo(x, verh); cx.lineTo(x - 7, H * 0.76); cx.lineTo(x + 7, H * 0.76); cx.closePath(); cx.fill();
      cx.fillStyle = '#2f4d6e'; cx.fillRect(x - 16, H * 0.76, 32, H * 0.17);
      cx.fillStyle = '#ffd666'; cx.beginPath(); cx.arc(x, verh - 4, 3, 0, 7); cx.fill();
    });
  }
  function tuchi(put) {
    var sd = put * 0.9;
    cx.fillStyle = '#3a3f55';
    for (var i = -1; i < W / 60 + 2; i++) {
      var n = Math.floor(sd / 60) + i, x = n * 60 - sd, r = 26 + (n * 13) % 14;
      cx.beginPath(); cx.arc(x, H * 0.04, r, 0, 7); cx.fill();
    }
    cx.fillStyle = 'rgba(58,63,85,.9)'; cx.fillRect(0, 0, W, H * 0.06);
  }
  function korabl() {
    var x = W * 0.5, y = S.y * H, L = Math.min(W * 0.62, 360), D = L * 0.19, g = S.gnut * D * 0.35;
    var mig = S.neuyazv > 0 && Math.floor(S.neuyazv * 10) % 2;
    cx.save(); cx.translate(x, y); cx.rotate(S.vy * 0.25);
    cx.globalAlpha = mig ? 0.45 : 1;
    /* корпус, гнётся под порывом */
    var grad = cx.createLinearGradient(0, -D / 2, 0, D / 2); grad.addColorStop(0, '#d7dde4'); grad.addColorStop(1, '#7d8794');
    cx.fillStyle = grad; cx.strokeStyle = '#3b4350'; cx.lineWidth = 1.5;
    cx.beginPath(); cx.moveTo(-L / 2, 0);
    cx.bezierCurveTo(-L / 2 + L * 0.08, -D * 0.62 + g, L / 2 - L * 0.18, -D * 0.62 + g, L / 2, 0);
    cx.bezierCurveTo(L / 2 - L * 0.18, D * 0.62 + g, -L / 2 + L * 0.08, D * 0.62 + g, -L / 2, 0);
    cx.fill(); cx.stroke();
    /* фанерные рёбра каркаса */
    cx.strokeStyle = 'rgba(80,60,30,.45)'; cx.lineWidth = 1;
    for (var i = -4; i <= 4; i++) { var rx = i * L * 0.095, rh = D * 0.5 * Math.sqrt(Math.max(0, 1 - Math.pow(rx / (L * 0.5), 2))); cx.beginPath(); cx.moveTo(rx, -rh + g * 0.9); cx.lineTo(rx, rh + g * 0.9); cx.stroke(); }
    /* шахта с окошками и людьми */
    cx.fillStyle = '#5a4220'; cx.fillRect(-L * 0.045, -D * 0.1 + g, L * 0.09, D * 0.62);
    for (var j = 0; j < 3; j++) {
      cx.fillStyle = '#ffd666'; cx.fillRect(-L * 0.034, D * 0.02 + j * D * 0.14 + g, L * 0.068, D * 0.09);
      cx.fillStyle = '#1a1206'; cx.beginPath(); cx.arc(-L * 0.012 + j * 3, D * 0.065 + j * D * 0.14 + g, 1.8, 0, 7); cx.fill();
    }
    /* руль и винт */
    cx.fillStyle = '#8a929c'; cx.beginPath(); cx.moveTo(-L * 0.46, 0); cx.lineTo(-L * 0.56, -D * 0.5); cx.lineTo(-L * 0.5, 0); cx.lineTo(-L * 0.56, D * 0.5); cx.closePath(); cx.fill();
    cx.strokeStyle = '#ffd666'; cx.lineWidth = 3; var vy = Math.sin(S.vint) * D * 0.35;
    cx.beginPath(); cx.moveTo(-L * 0.58, -vy); cx.lineTo(-L * 0.58, vy); cx.stroke();
    cx.fillStyle = '#c0392b'; cx.font = 'bold ' + Math.round(D * 0.26) + 'px Georgia,serif'; cx.textAlign = 'center';
    cx.fillText('РОССIЯ', L * 0.2, -D * 0.12 + g);
    cx.restore();
  }
  function strelka() {
    if (!S.poryv) return;
    var d = S.poryv.dir, aktiv = S.poryv.t > 0, x = W * 0.5, y = d > 0 ? H * 0.12 : H * 0.88;
    cx.save(); cx.globalAlpha = aktiv ? 0.85 : 0.5 + 0.5 * Math.abs(Math.sin(S.t * 10));
    cx.fillStyle = '#ff5a4a'; cx.translate(x, y); if (d < 0) cx.rotate(Math.PI);
    cx.beginPath(); cx.moveTo(-14, -16); cx.lineTo(14, -16); cx.lineTo(14, 4); cx.lineTo(26, 4); cx.lineTo(0, 26); cx.lineTo(-26, 4); cx.lineTo(-14, 4); cx.closePath(); cx.fill();
    cx.restore();
    if (aktiv) { cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 2; for (var i = 0; i < 6; i++) { var lx = (i * 67 + S.t * 400) % W, ly = (d > 0 ? 0 : H) + d * ((S.t * 300 + i * 41) % H); cx.beginPath(); cx.moveTo(lx, ly); cx.lineTo(lx, ly - d * 22); cx.stroke(); } }
  }
  function risuj() {
    if (!S) return;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var nb = cx.createLinearGradient(0, 0, 0, H); nb.addColorStop(0, '#1a2a44'); nb.addColorStop(1, '#4a6a8f');
    cx.fillStyle = nb; cx.fillRect(0, 0, W, H);
    tuchi(S.put); gorod(S.put); korabl(); strelka();
    /* финишный флажок */
    var fx = W * 0.5 + (CEL - S.put) * 1.6 + W * 0.3;
    if (fx < W + 20) { cx.fillStyle = '#8dffb5'; cx.fillRect(fx, H * 0.3, 3, H * 0.5); cx.fillText && (cx.font = 'bold 14px sans-serif', cx.fillText('1000 м', fx + 6, H * 0.34)); }
    cx.fillStyle = 'rgba(255,255,255,.7)'; cx.font = '12px sans-serif'; cx.textAlign = 'left';
    cx.fillText(S.polnyy ? 'Полный ход · 40 м/с' : 'Малый ход · 20 м/с', 8, H - 8);
  }
  window.addEventListener('resize', razmer);
  nov(); razmer();
})();
