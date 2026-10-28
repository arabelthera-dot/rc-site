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

/* «Лёд Ладоги» — 19 января, Канторович (r416-19, Р302/Р304). Ты на берегу: выпускаешь десять танков на лёд.
   Под каждым танком лёд прогибается чашей (балка на упругом основании: w = A·e^(−s/L)·(cos s/L + sin s/L)).
   Пара танков ближе 27 м — лёд трещит (трещина копится и не заживает), ближе 19 м — проламывается сразу.
   Рассвет через 60 с после первого танка. «Сяду сам» — танкисты трогаются по команде; «Пошлю танкиста» — медлят. */
(function () {
  'use strict';
  var root = document.querySelector('[data-ladoga-igra]');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var cv = $('canvas'), cx = cv.getContext('2d');
  var elTask = $('.ll-task'), elSub = $('.ll-sub'), elN = $('.ll-n'), elGap = $('.ll-gap'), elT = $('.ll-t'), elTbar = $('.ll-tbar i');
  var bSam = $('.ll-sam'), bTank = $('.ll-tankist'), bPusk = $('.ll-pusk'), boxVybor = $('.ll-vybor'), boxHod = $('.ll-hod');
  var fin = $('.ll-finale'), finH = $('.ll-fin-h'), finTxt = $('.ll-fin-txt'), zv = $('.ll-zvezdy'), bAgain = $('.ll-again');
  var ruka = igraRuka(root);

  var R = 300, V = 12, T = 60, N = 10, DC = 27, DLOM = 19, L = 5.7, OKNO = 80;
  var S;                                  // состояние партии
  var W = 0, H = 0, dpr = 1, raf = 0, last = 0, nachal = false;

  function nov() {
    S = { faza: 'vybor', sam: null, t: 0, tanki: [], zhdem: 0, tryos: 0, itog: null, lom: null, dmgMax: 0, konec: 0 };
  }
  function txt(a, b) { elTask.innerHTML = '<b>Что сделать сейчас:</b> ' + a; elSub.textContent = b || ''; }
  function sobytie(e) { try { document.dispatchEvent(new CustomEvent('rc-igra', { detail: { e: e, igra: 'ladoga-led' } })); } catch (x) {} }
  function m(x) { return Math.round(x) + ' м'; }

  function vybor(sam) {
    S.sam = sam; S.faza = 'hod';
    boxVybor.hidden = true; boxHod.hidden = false;
    if (!nachal) { nachal = true; sobytie('nachal'); }
    txt('Жми «Пустить танк» — первый съезжает на лёд', sam ? 'Ты в первом танке. Танкисты пойдут за тобой точно по команде.' : 'Первым едет танкист. Остальные боятся: после команды трогаются не сразу.');
    ruka.na(bPusk);
    tablo();
  }
  bSam.addEventListener('click', function () { vybor(true); });
  bTank.addEventListener('click', function () { vybor(false); });

  function vypustit() {
    var t = { x: 0, sost: 'led', dmg: 0, gap: S.tanki.length ? S.tanki[S.tanki.length - 1].x : null, nyrok: 0 };
    S.tanki.push(t);
  }
  bPusk.addEventListener('click', function () {
    if (S.faza !== 'hod' || S.zhdem > 0 || S.tanki.length >= N) return;
    ruka.ubrat();
    if (S.sam || S.tanki.length === 0) { vypustit(); }
    else { S.zhdem = 0.5 + Math.random() * 0.8; bPusk.disabled = true; }   // танкист медлит 0,5–1,3 с
    if (navigator.vibrate) navigator.vibrate(20);
    tablo();
  });
  bAgain.addEventListener('click', function () {
    nov(); fin.hidden = true; boxVybor.hidden = false; boxHod.hidden = true; bPusk.disabled = false;
    txt('Кто поедет в первом танке?'); ruka.na(bSam); tablo();
  });

  function tablo() {
    var done = S.tanki.filter(function (t) { return t.sost === 'bereg'; }).length;
    elN.textContent = done + ' из ' + N;
    var gap = null;
    if (S.tanki.length && S.tanki.length < N && S.faza === 'hod') gap = S.tanki[S.tanki.length - 1].x;
    elGap.textContent = gap === null ? '—' : m(Math.min(gap, 99));
    root.setAttribute('data-gap', gap === null ? '' : String(Math.round(gap * 10) / 10));
    root.setAttribute('data-faza', S.faza);
    root.setAttribute('data-vypushcheno', String(S.tanki.length));
    var ost = Math.max(0, T - S.t);
    elT.textContent = Math.ceil(ost) + ' с';
    elTbar.style.width = (ost / T * 100) + '%';
    var opas = gap !== null && gap < DC;
    elGap.className = 'll-gap' + (gap === null ? '' : opas ? (gap < DLOM ? ' ll-krasn' : ' ll-zhelt') : ' ll-zel');
    if (S.faza === 'hod' && S.zhdem <= 0) bPusk.disabled = S.tanki.length >= N;
  }

  function shag(dt) {
    if (S.faza === 'hod' || S.faza === 'idut') {
      if (S.tanki.length) S.t += dt;
      if (S.zhdem > 0) { S.zhdem -= dt; if (S.zhdem <= 0) { S.zhdem = 0; vypustit(); bPusk.disabled = false; } }
      S.tanki.forEach(function (t) { if (t.sost === 'led') { t.x += V * dt; if (t.x >= R) { t.x = R; t.sost = 'bereg'; } } });
      var na = S.tanki.filter(function (t) { return t.sost === 'led'; });
      var warn = null;
      for (var i = 1; i < S.tanki.length; i++) {
        var a = S.tanki[i - 1], b = S.tanki[i];
        if (b.sost !== 'led' || a.sost !== 'led') continue;
        var d = a.x - b.x;
        if (d < DLOM) { b.dmg = 1; }
        else if (d < DC) { var k = (DC - d) / 8; b.dmg += k * k * 0.35 * dt; }
        if (b.dmg > S.dmgMax) S.dmgMax = Math.min(1, b.dmg);
        if (b.dmg >= 1) { b.sost = 'tonet'; S.lom = i; break; }
        if (b.dmg > 0.15 && !warn) warn = 'Лёд трещит между ' + i + '-м и ' + (i + 1) + '-м танком!';
      }
      if (S.faza === 'hod' && S.tanki.length >= N) { S.faza = 'idut'; boxHod.hidden = true; }
      if (S.lom !== null) { konec(false, 'lom'); }
      else if (S.t >= T && S.tanki.filter(function (t) { return t.sost === 'bereg'; }).length < N) { konec(false, 'rassvet'); }
      else if (S.tanki.length >= N && na.length === 0 && S.tanki.every(function (t) { return t.sost === 'bereg'; })) { konec(true); }
      else if (S.faza === 'hod') {
        var g = S.tanki.length ? S.tanki[S.tanki.length - 1].x : 0;
        if (S.zhdem > 0) txt('Танкист медлит…', 'Команда дана, но он ещё не тронулся.');
        else if (S.tanki.length) txt('Пусти ' + (S.tanki.length + 1) + '-й танк, когда промежуток станет безопасным', warn || (g < DC ? 'Смотри на разрез: чаши прогиба ещё сливаются.' : 'Чаши разошлись. Но рассвет близко — не тяни.'));
      } else if (S.faza === 'idut') txt('Колонна идёт к тому берегу', warn || 'Все танки на льду. Ждём.');
      tablo();
    }
    if (S.faza === 'tonet') { S.tanki.forEach(function (t) { if (t.sost === 'tonet') t.nyrok = Math.min(1, t.nyrok + dt * 0.8); }); S.tryos = Math.max(0, S.tryos - dt); if (S.t - S.konec > 1.6 || S.tanki.every(function (t) { return t.sost !== 'tonet' || t.nyrok >= 1; })) pokazFinal(); }
  }

  function konec(ok, why) {
    S.itog = { ok: ok, why: why }; S.konec = S.t;
    ruka.ubrat(); boxHod.hidden = true;
    if (!ok && why === 'lom') { S.faza = 'tonet'; S.tryos = 0.6; txt('Лёд проломился!', 'Танки шли слишком тесно.'); if (navigator.vibrate) navigator.vibrate([60, 40, 120]); }
    else pokazFinal();
  }
  function pokazFinal() {
    var it = S.itog; S.faza = 'final';
    var bezTr = S.dmgMax < 0.15;
    if (it.ok) {
      finH.textContent = S.sam ? 'Все десять танков на том берегу — и ты вёл первый' : 'Все десять танков на том берегу';
      finTxt.textContent = bezTr ? 'Ни одной трещины: промежутки держали чаши прогиба порознь — так, как рассчитал Канторович.' : 'Дошли, но лёд за колонной в трещинах: кое-где танки шли теснее безопасного.';
      if (window.award) { window.award('ladoga', 30); if (bezTr) window.award('led', 15); if (S.sam) window.award('sam', 15); }
      sobytie('vyigral');
    } else {
      finH.textContent = it.why === 'lom' ? 'Танк ушёл под лёд' : 'Рассвело — колонна не успела';
      finTxt.textContent = it.why === 'lom' ? 'Два танка шли так близко, что прогибы льда под ними слились в одну яму. Попробуй держать промежуток больше.' : 'Промежутки были слишком большими: колонна растянулась, и днём её увидят с воздуха. Пускай танки чаще — но не ближе безопасного.';
      sobytie('proigral');
    }
    var z = [[it.ok, 'Все десять танков перешли до рассвета'], [it.ok && bezTr, 'Лёд без трещин'], [S.sam === true, 'Ты сам сел в первый танк']];
    zv.innerHTML = z.map(function (p) { return '<li class="' + (p[0] ? 'ok' : '') + '">' + (p[0] ? '★ ' : '☆ ') + p[1] + '</li>'; }).join('');
    root.setAttribute('data-itog', it.ok ? 'pobeda' : it.why);
    fin.hidden = false; txt(it.ok ? 'Колонна перешла Ладогу' : 'Попробуй ещё раз', '');
    tablo();
  }

  /* ── рисунок ─────────────────────────────────────────────── */
  function razmer() {
    var w = cv.parentNode.clientWidth || 340;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = w; H = Math.round(Math.min(440, Math.max(300, w * (w < 600 ? 0.95 : 0.52))));
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function mix(a, b, k) { return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * k); }).join(',') + ')'; }
  function progib(s) { s = Math.abs(s) / L; return s > 3 * Math.PI / 4 ? 0 : Math.exp(-s) * (Math.cos(s) + Math.sin(s)); }
  function tank(x, y, sc, ugol, cvet) {
    cx.save(); cx.translate(x, y); cx.rotate(ugol || 0); cx.scale(sc, sc);
    cx.fillStyle = cvet || '#3d4a3a'; cx.strokeStyle = '#0d120c'; cx.lineWidth = 1 / sc;
    cx.beginPath(); cx.roundRect ? cx.roundRect(-14, -7, 28, 7, 3) : cx.rect(-14, -7, 28, 7); cx.fill(); cx.stroke();
    cx.fillRect(-9, -12, 15, 5); cx.strokeRect(-9, -12, 15, 5);
    cx.fillRect(5, -11, 13, 2);
    cx.fillStyle = '#1c231b'; for (var i = -11; i <= 11; i += 5.5) { cx.beginPath(); cx.arc(i, -1.5, 2, 0, 7); cx.fill(); }
    cx.restore();
  }
  function risuj() {
    var k = Math.min(1, S.t / T), tr = S.tryos > 0 ? (Math.random() - 0.5) * 6 * S.tryos : 0;
    cx.save(); cx.translate(tr, 0);
    var hT = Math.round(H * 0.4);
    // небо и лёд сверху: ночь светлеет к рассвету
    var g = cx.createLinearGradient(0, 0, 0, hT);
    g.addColorStop(0, mix([8, 12, 28], [70, 86, 130], k)); g.addColorStop(1, mix([22, 30, 52], [214, 150, 110], k));
    cx.fillStyle = g; cx.fillRect(-5, 0, W + 10, hT);
    if (k < 0.7) { cx.fillStyle = 'rgba(255,255,255,' + (0.7 - k) + ')'; for (var i = 0; i < 26; i++) { cx.fillRect((i * 97) % W, (i * 53) % Math.round(hT * 0.45), 1.5, 1.5); } }
    var x0 = W * 0.08, x1 = W * 0.92, ly = hT * 0.72, sx = function (x) { return x0 + (x1 - x0) * x / R; };
    cx.fillStyle = '#2b2a25'; cx.fillRect(-5, ly - 6, x0 + 5, hT - ly + 6); cx.fillRect(x1, ly - 6, W - x1 + 10, hT - ly + 6);
    cx.fillStyle = mix([150, 170, 190], [205, 215, 225], k); cx.fillRect(x0, ly - 3, x1 - x0, hT - ly + 3);
    cx.fillStyle = '#e8edf2'; cx.font = '600 11px system-ui,sans-serif';
    cx.fillText('наш берег', 4, ly - 10); var lb = 'тот берег'; cx.fillText(lb, W - cx.measureText(lb).width - 4, ly - 10);
    // трещины между тесными парами
    for (var j = 1; j < S.tanki.length; j++) {
      var a = S.tanki[j - 1], b = S.tanki[j];
      if (b.dmg <= 0.02) continue;
      var p = Math.min(1, b.dmg), xa = sx(Math.max(0, b.x - 4)), xb = sx(b.x);
      cx.strokeStyle = 'rgba(' + Math.round(150 + 105 * p) + ',' + Math.round(220 - 170 * p) + ',' + Math.round(240 - 200 * p) + ',' + (0.5 + p * 0.5) + ')';
      cx.lineWidth = 1 + p * 2; cx.beginPath();
      var seg = 10, from = sx(0), to = xb;
      for (var q = 0; q <= seg; q++) { var xx = from + (to - from) * q / seg; cx.lineTo(xx, ly + 6 + ((q * 7 + j * 3) % 5 - 2) * (1 + p * 2)); }
      cx.stroke(); void xa; void a;
    }
    S.tanki.forEach(function (t) {
      if (t.sost === 'tonet') { cx.globalAlpha = 1 - t.nyrok; tank(sx(t.x), ly + 4 + t.nyrok * 10, 0.55, 0.5 * t.nyrok); cx.globalAlpha = 1;
        cx.strokeStyle = 'rgba(200,230,255,' + (1 - t.nyrok) + ')'; cx.beginPath(); cx.arc(sx(t.x), ly + 6, 4 + t.nyrok * 16, 0, 7); cx.stroke(); }
      else tank(sx(t.x), ly + 4, 0.55);
    });
    // разрез у нашего берега: 0..OKNO м
    var top = hT + 6, bx0 = W * 0.16, bx1 = W - 8, bs = function (x) { return bx0 + (bx1 - bx0) * x / OKNO; };
    var iy = top + (H - top) * 0.42, tol = Math.max(10, (H - top) * 0.09), A = (H - top) * 0.14;
    cx.fillStyle = '#0b1622'; cx.fillRect(-5, top, W + 10, H - top);
    cx.fillStyle = '#c9d6e2'; cx.font = '600 11px system-ui,sans-serif'; cx.fillText('Лёд в разрезе у берега — прогиб показан крупно', 8, top + 14);
    var wg = cx.createLinearGradient(0, iy, 0, H); wg.addColorStop(0, '#12324a'); wg.addColorStop(1, '#06121c');
    cx.fillStyle = wg; cx.fillRect(bx0, iy, bx1 - bx0 + 10, H - iy);
    cx.fillStyle = '#3a352c'; cx.beginPath(); cx.moveTo(-5, iy - 2); cx.lineTo(bx0, iy - 2); cx.lineTo(bx0 + 10, H); cx.lineTo(-5, H); cx.fill();
    var vid = S.tanki.filter(function (t) { return (t.sost === 'led' || t.sost === 'tonet') && t.x < OKNO + 20; });
    function wsum(x) { var s = 0, n = 0; vid.forEach(function (t) { var v = progib(x - t.x) * (t.sost === 'tonet' ? 1 + t.nyrok * 2 : 1); if (v > 0.06) n++; s += v; }); return [s, n]; }
    var shagX = 2, verh = [], kr = [];
    for (var x = 0; x <= OKNO; x += shagX / ((bx1 - bx0) / OKNO)) { var r = wsum(x); verh.push([bs(x), iy + r[0] * A]); kr.push(r[1] > 1); }
    cx.beginPath(); verh.forEach(function (p, i) { i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]); });
    for (var u = verh.length - 1; u >= 0; u--) cx.lineTo(verh[u][0], verh[u][1] + tol);
    cx.closePath(); var ig = cx.createLinearGradient(0, iy, 0, iy + tol + A); ig.addColorStop(0, '#eef5fb'); ig.addColorStop(1, '#9fb8cc'); cx.fillStyle = ig; cx.fill();
    for (var c = 0; c < verh.length - 1; c++) if (kr[c]) { cx.fillStyle = 'rgba(230,60,40,0.55)'; cx.fillRect(verh[c][0], verh[c][1], verh[c + 1][0] - verh[c][0] + 0.5, tol); }
    cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.fillStyle = '#9fb3c4'; cx.font = '10px system-ui,sans-serif';
    for (var mm = 0; mm <= OKNO; mm += 10) { var px = bs(mm); cx.beginPath(); cx.moveTo(px, H - 16); cx.lineTo(px, H - 10); cx.stroke(); cx.fillText(mm + ' м', px - 8, H - 2); }
    var sc = Math.max(0.9, (bx1 - bx0) / OKNO / 2.2);
    vid.forEach(function (t) { var y = iy + wsum(t.x)[0] * A; tank(bs(t.x), y + (t.sost === 'tonet' ? t.nyrok * (H - iy) * 0.7 : 0), sc, t.sost === 'tonet' ? 0.6 * t.nyrok : 0); });
    if (S.faza === 'hod' && S.tanki.length < N) {
      tank(bx0 - 16 * sc, iy - 2, sc, 0, S.zhdem > 0 ? '#6b5a2a' : '#3d4a3a');
      var g2 = S.tanki.length ? S.tanki[S.tanki.length - 1].x : null;
      if (g2 !== null && g2 < OKNO) { var yy = iy - 30 * sc; cx.strokeStyle = g2 < DC ? '#ff8a6a' : '#7fe0a0'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(bs(0), yy); cx.lineTo(bs(g2), yy); cx.stroke();
        cx.fillStyle = cx.strokeStyle; cx.font = '700 12px system-ui,sans-serif'; cx.fillText(m(g2), bs(g2 / 2) - 12, yy - 4); }
    }
    cx.restore();
  }
  function kadr(ts) {
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    shag(dt); risuj();
    raf = requestAnimationFrame(kadr);
  }
  nov(); razmer(); tablo(); ruka.na(bSam);
  window.addEventListener('resize', razmer);
  raf = requestAnimationFrame(kadr);
})();
