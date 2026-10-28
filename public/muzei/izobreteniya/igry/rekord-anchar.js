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

/* «Рекордный ход» — 24 января, К-162 «Анчар» (r418-24). Разрез моря сбоку: лёд сверху, дно снизу, лодка посередине.
   «Полный ход» — 4 ступени скорости; на 33, 40 и 44,7 узла вода срывает антенну, лючки и дверь рубки (В. Зайцев, «Наука и жизнь», 2006, № 12).
   Глубина — кнопками «Вверх»/«Вниз» (держать) или пальцем по картинке. Три касания — испытание прекращено. */
(function () {
  var root = document.querySelector('[data-rekord-igra]');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var cv = $('canvas'), cx = cv.getContext('2d'), ruka = igraRuka(root);
  var bV = $('.ra-vverh'), bN = $('.ra-vniz'), bP = $('.ra-hod-polny'), hod = $('.ra-hod'), fin = $('.ra-finale');
  var task = $('.ra-task'), sub = $('.ra-sub'), vest = $('.ra-vest');
  var STUPENI = [25, 33, 40, 44.7], SRYV = { 1: 'антенну', 2: 'три лючка на палубе', 3: 'дверь в ограждении рубки' };
  var W = 0, H = 0, dpr = 1, s, raf = 0, last = 0, nachato = false;

  function fmt(x) { return String(Math.round(x * 10) / 10).replace('.', ','); }
  function seychas(t, p) { task.innerHTML = '<b>Что сделать сейчас:</b> ' + t; if (p != null) sub.textContent = p; }
  function vestT(t, udar) { vest.textContent = t; vest.classList.toggle('ra-udar', !!udar); }
  // Лёд и дно — сумма синусов по пути x (в метрах участка); коридор у льда 12–40 м, у дна 160–190 м.
  function led(x) { return 26 + 10 * Math.sin(x / 210) + 6 * Math.sin(x / 67 + 1.3); }
  function dno(x) { return 176 - 9 * Math.sin(x / 180 + 0.7) - 6 * Math.sin(x / 53); }

  function sbros() {
    s = { st: -1, v: 0, g: 100, vg: 0, put: 0, dlina: 3200, udary: 0, neuyazv: 0, sorvano: 0, tryas: 0, letit: [], tsel: null, konec: false, t: 0 };
    root.classList.remove('ra-proigr', 'ra-pobeda'); fin.hidden = true; hod.hidden = false; bP.disabled = false;
    seychas('Нажми «Полный ход»', 'Ты ведёшь «Анчар» на испытаниях. Сверху лёд, снизу дно — держи лодку посередине и разгоняй до рекорда.');
    vestT('Лодка на 100 метрах. До льда и до дна — по сотне метров.');
    ruka.na(bP); tablo(); risuj();
  }
  function tablo() {
    $('.ra-v').textContent = fmt(s.v) + ' узл' + (s.v === 0 ? 'ов' : 'а');
    var g = $('.ra-g'); g.textContent = Math.round(s.g) + ' м';
    var x = s.put, blizko = s.g - led(x) < 18 || dno(x) - s.g < 18; g.classList.toggle('ra-krasn', blizko);
    var p = Math.min(100, s.put / s.dlina * 100); $('.ra-d').textContent = Math.floor(p) + ' %'; $('.ra-pbar i').style.width = p + '%';
    root.dataset.glubina = Math.round(s.g); root.dataset.led = Math.round(led(x)); root.dataset.dno = Math.round(dno(x));
  }
  function polny() {
    if (s.konec || s.st >= STUPENI.length - 1) return;
    s.st++; s.v = STUPENI[s.st]; s.tryas = 0.5;
    if (!nachato) { nachato = true; window.dispatchEvent(new CustomEvent('rc-igra', { detail: { igra: 'rekord-anchar', sobytie: 'nachal' } })); }
    if (s.st === 0) { last = performance.now(); raf = requestAnimationFrame(shag); }
    if (SRYV[s.st]) { s.sorvano = s.st; s.letit.push({ x: 0, y: 0, vx: -1, vy: -0.6, chto: s.st, t: 0 }); vestT('Напором воды вырвало ' + SRYV[s.st] + '! Титановый корпус держит.', true); }
    else vestT('Ход 25 узлов. Держи лодку между льдом и дном.');
    if (s.st === STUPENI.length - 1) { bP.disabled = true; ruka.ubrat(); seychas('Держи 44,7 узла до конца участка', '44,7 узла — это 83 км/ч под водой. Рули теперь слушаются резко.'); }
    else { ruka.na(bP); seychas('Держи глубину — и снова «Полный ход»', 'Сейчас ' + fmt(s.v) + ' узла. Следующая ступень — ' + fmt(STUPENI[s.st + 1]) + '.'); }
    tablo();
  }
  var ruli = 0; // −1 вверх, +1 вниз
  function derzhi(b, k) {
    var on = function (e) { e.preventDefault(); ruli = k; s.tsel = null; b.classList.add('ra-zhmu', 'igra-zhmyak'); if (navigator.vibrate) navigator.vibrate(20); };
    var off = function () { if (ruli === k) ruli = 0; b.classList.remove('ra-zhmu', 'igra-zhmyak'); };
    b.addEventListener('pointerdown', on); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (t) { b.addEventListener(t, off); });
    b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') on(e); }); b.addEventListener('keyup', off);
  }
  derzhi(bV, -1); derzhi(bN, 1);
  bP.addEventListener('click', polny);
  document.addEventListener('keydown', function (e) { if (!root.contains(document.activeElement) && document.activeElement !== document.body) return;
    if (e.key === 'ArrowUp') { ruli = -1; e.preventDefault(); } if (e.key === 'ArrowDown') { ruli = 1; e.preventDefault(); } });
  document.addEventListener('keyup', function (e) { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') ruli = 0; });
  function palec(e) { if (s.konec) return; var r = cv.getBoundingClientRect(); s.tsel = Math.max(0, Math.min(200, (e.clientY - r.top) / r.height * 200)); }
  cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture(e.pointerId); palec(e); if (s.st < 0) polny(); });
  cv.addEventListener('pointermove', function (e) { if (e.buttons) palec(e); });
  cv.addEventListener('pointerup', function () { s.tsel = null; });
  $('.ra-again').addEventListener('click', function () { cancelAnimationFrame(raf); sbros(); bP.focus(); });

  function shag(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now; s.t += dt;
    var k = s.v / 25;                                   // чем быстрее ход, тем резче рули и сильнее снос
    var snos = Math.sin(s.t * 0.9) * 9 + Math.sin(s.t * 2.3 + 1) * 5 * k;
    var upr = s.tsel != null ? Math.max(-1, Math.min(1, (s.tsel - s.g) / 12)) : ruli;
    s.vg += (upr * 70 * k + snos - s.vg * 1.6) * dt;
    s.g += s.vg * dt;
    s.put += s.v * 4.2 * dt;
    s.tryas = Math.max(0, s.tryas - dt);
    if (s.neuyazv > 0) s.neuyazv -= dt;
    var x = s.put, l = led(x) + 6, d = dno(x) - 6;
    if ((s.g < l || s.g > d) && s.neuyazv <= 0) {
      s.udary++; s.neuyazv = 1.2; s.tryas = 0.6; s.vg = s.g < l ? 25 : -25;
      vestT((s.g < l ? 'Удар о лёд' : 'Удар о дно') + '! Касаний: ' + s.udary + ' из 3.', true);
      if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
    }
    s.g = Math.max(l - 4, Math.min(d + 4, s.g));
    s.letit.forEach(function (o) { o.t += dt; });
    tablo(); risuj();
    if (s.udary >= 3) return konec(false);
    if (s.put >= s.dlina) return konec(true);
    raf = requestAnimationFrame(shag);
  }
  function konec(doshel) {
    s.konec = true; ruka.ubrat(); hod.hidden = true; fin.hidden = false;
    var rekord = doshel && s.st === STUPENI.length - 1, chisto = doshel && s.udary === 0;
    root.classList.add(doshel ? 'ra-pobeda' : 'ra-proigr');
    $('.ra-fin-h').textContent = !doshel ? 'Испытание прекращено' : rekord ? 'Рекорд: 44,7 узла под водой!' : 'Участок пройден, но без рекорда';
    $('.ra-fin-txt').textContent = !doshel ? 'Три касания льда и дна — лодку подняли. Настоящий экипаж прошёл рекордный ход между льдом и дном без единого касания.'
      : rekord ? 'Ты прошёл участок на 83 км/ч, как экипаж «Анчара» 18 декабря 1970 года. Вода сорвала антенну, лючки и дверь рубки — титановый корпус выдержал.'
      : 'Ты прошёл участок на ' + fmt(s.v) + ' узла. Экипаж «Анчара» разогнал лодку до 44,7 узла — нажми «Полный ход» все четыре раза.';
    $('.ra-zvezdy').innerHTML = [[doshel, 'Участок пройден'], [rekord, 'Рекорд 44,7 узла'], [chisto, 'Ни одного касания']]
      .map(function (z) { return '<li class="' + (z[0] ? 'on' : '') + '">' + (z[0] ? '★ ' : '☆ ') + z[1] + '</li>'; }).join('');
    seychas(doshel ? 'Прокрути вниз и прочитай, как было на самом деле' : 'Нажми «Ещё раз»', '');
    if (doshel && typeof window.award === 'function') window.award('igra', rekord ? 50 : 30);
    window.dispatchEvent(new CustomEvent('rc-igra', { detail: { igra: 'rekord-anchar', sobytie: doshel ? 'vyigral' : 'proigral' } }));
    $('.ra-again').focus({ preventScroll: true });
  }

  function razmer() { dpr = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); if (s) risuj(); }
  function risuj() {
    var my = H / 200, mx = W / 520, x0 = s.put - 130;     // лодка на 130 м от левого края
    var tr = s.tryas > 0 ? (Math.random() - 0.5) * 6 * s.tryas : 0;
    var gr = cx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1d4f73'); gr.addColorStop(1, '#06121d');
    cx.fillStyle = gr; cx.fillRect(0, 0, W, H);
    // полосы потока — чем быстрее, тем длиннее
    cx.strokeStyle = 'rgba(191,224,255,.18)'; cx.lineWidth = 1;
    for (var i = 0; i < 26; i++) { var px = ((i * 97 - s.put * 2.2 * mx) % W + W) % W, py = (i * 53 % 160 + 30) * my;
      cx.beginPath(); cx.moveTo(px, py); cx.lineTo(px + 6 + s.v * 1.4, py); cx.stroke(); }
    cx.fillStyle = '#e8f3fa'; cx.beginPath(); cx.moveTo(0, 0);
    for (var a = 0; a <= W; a += 6) cx.lineTo(a, led(x0 + a / mx) * my); cx.lineTo(W, 0); cx.fill();
    cx.fillStyle = '#3b3326'; cx.beginPath(); cx.moveTo(0, H);
    for (a = 0; a <= W; a += 6) cx.lineTo(a, dno(x0 + a / mx) * my); cx.lineTo(W, H); cx.fill();
    // финишная черта
    var fx = (s.dlina - x0) * mx; if (fx < W) { cx.strokeStyle = '#ffd666'; cx.setLineDash([6, 6]); cx.beginPath(); cx.moveTo(fx, 0); cx.lineTo(fx, H); cx.stroke(); cx.setLineDash([]); }
    // лодка
    var bx = 130 * mx, by = s.g * my + tr, L = Math.max(90, W * 0.24), R = L * 0.11;
    cx.save(); cx.translate(bx, by); cx.rotate(Math.max(-0.25, Math.min(0.25, s.vg / 140)));
    if (s.neuyazv > 0 && Math.floor(s.neuyazv * 8) % 2) cx.globalAlpha = 0.5;
    var tg = cx.createLinearGradient(0, -R, 0, R); tg.addColorStop(0, '#f1f5f8'); tg.addColorStop(0.5, '#a9b6c1'); tg.addColorStop(1, '#5f6b75');
    cx.fillStyle = tg; cx.beginPath(); cx.ellipse(0, 0, L / 2, R, 0, 0, Math.PI * 2); cx.fill();
    if (s.sorvano < 3) { cx.fillStyle = '#c5d0d8'; cx.fillRect(-L * 0.04, -R * 2, L * 0.16, R * 1.2); }   // дверь рубки на месте
    else { cx.fillStyle = '#8d99a3'; cx.fillRect(-L * 0.04, -R * 2, L * 0.16, R * 1.2); cx.fillStyle = '#1b2833'; cx.fillRect(L * 0.03, -R * 1.7, L * 0.05, R * 0.7); }
    if (s.sorvano < 1) { cx.strokeStyle = '#dfe7ee'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(L * 0.06, -R * 2); cx.lineTo(L * 0.02, -R * 3.3); cx.stroke(); }
    if (s.sorvano < 2) { cx.fillStyle = '#7e8a94'; [-0.3, 0.25, 0.33].forEach(function (q) { cx.fillRect(L * q, -R * 0.95, L * 0.04, R * 0.25); }); }
    cx.fillStyle = 'rgba(255,255,255,.75)'; for (i = 0; i < 4 + s.st * 3; i++) { cx.beginPath(); cx.arc(-L / 2 - 6 - i * 7, Math.sin(i + s.t * 9) * R * 0.5, 2 + (i % 3), 0, 7); cx.fill(); }
    cx.restore();
    // сорванные детали улетают назад
    s.letit.forEach(function (o) { if (o.t > 2.5) return; var ox = bx - o.t * (60 + s.v * 6) * mx * 0.4, oy = by - R * 2 + o.t * 40 * my * 0.3;
      cx.save(); cx.translate(ox, oy); cx.rotate(o.t * 6); cx.fillStyle = '#ffd666'; cx.fillRect(-8, -3, 16, 6); cx.restore(); });
    cx.fillStyle = 'rgba(255,255,255,.75)'; cx.font = '12px system-ui,sans-serif';
    cx.fillText('лёд', 8, Math.max(14, led(x0) * my - 6)); cx.fillText('дно', 8, dno(x0) * my + 16);
  }
  window.addEventListener('resize', razmer);
  sbros(); razmer();
})();
