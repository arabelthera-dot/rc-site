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

/* «Зелёная стена» — 28 января, Хавкин (r420-28). Карта города: домики-огоньки, из порта (внизу слева) ползёт чума.
   Заражение — по соседям (вверх/вниз/влево/вправо): у здорового домика копится «давление» от каждого больного соседа,
   переполнилось — домик заболел. Привитый (зелёный) домик не болеет и не передаёт — сплошная полоса, где домики
   касаются хотя бы уголком, останавливает волну. Во флаконе 5 доз; пополнить — держать колбу 2 с.
   Проигрыш: потеряно больше 30 % города (рынок весит 5 домов) или флакон пуст дольше 1,5 с, когда волна берёт новый дом,
   а игрок не у колбы. Победа — волне некуда идти. */
(function () {
  'use strict';
  var root = document.querySelector('[data-zs-igra]');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var cv = $('canvas'), cx = cv.getContext('2d');
  var elTask = $('.zs-task'), elSub = $('.zs-sub'), elSpas = $('.zs-spas'), elPot = $('.zs-poter'), elPbar = $('.zs-pbar i');
  var elDoz = $('.zs-doz'), elFbar = $('.zs-fbar i'), bKolba = $('.zs-kolba'), elKbar = $('.zs-kbar i'), boxHod = $('.zs-hod');
  var fin = $('.zs-finale'), finH = $('.zs-fin-h'), finTxt = $('.zs-fin-txt'), zv = $('.zs-zvezdy'), bAgain = $('.zs-again');
  var ruka = igraRuka(root);

  var DOZ = 5, KOLBA = 2, SKOR = 0.7, ZADERZHKA = 1.5, PUSTO = 1.5, PRED = 0.3, RYNOK_VES = 5;
  var C, R, ox, oy, k, W = 0, H = 0, dpr = 1, last = 0, nachal = false, nagrada = false;
  var S;
  // клетка: t — 'dom' | 'port' | 'rynok' | 'lab'; s — 0 здоров, 1 привит, 2 болен; p — давление, porog — порог
  function nov() {
    C = W >= 600 ? 16 : 9; R = W >= 600 ? 9 : 11;
    var setka = [];
    for (var y = 0; y < R; y++) for (var x = 0; x < C; x++) setka.push({ x: x, y: y, t: 'dom', s: 0, p: 0, porog: 0.8 + Math.random() * 0.45, ot: 0 });
    S = { setka: setka, faza: 'zhdem', t: 0, doz: DOZ, derzhu: 0, derzhuOt: null, pusto: 0, itog: null, kurs: null, mig: 0, vsego: 0, stena: 0 };
    kl(0, R - 1).t = 'port'; kl(0, R - 1).s = 2;
    kl(4, R - 4).t = 'rynok'; kl(C - 1, 0).t = 'lab';
    setka.forEach(function (c) { if (c.t !== 'lab') S.vsego += ves(c); });
    S.rynok = kl(4, R - 4); S.lab = kl(C - 1, 0); S.port = kl(0, R - 1);
    razmer(); tablo();
    txt('Проведи шприцем по домикам у порта', 'Из порта ползёт чума. Привитый домик зеленеет — через него болезнь не пройдёт.');
    root.dataset.faza = 'zhdem'; delete root.dataset.itog;
    ruka.ubrat();
  }
  function kl(x, y) { return x < 0 || y < 0 || x >= C || y >= R ? null : S.setka[y * C + x]; }
  function ves(c) { return c.t === 'rynok' ? RYNOK_VES : 1; }
  function sosedi(c) { return [kl(c.x - 1, c.y), kl(c.x + 1, c.y), kl(c.x, c.y - 1), kl(c.x, c.y + 1)].filter(Boolean); }
  function txt(a, b) { elTask.innerHTML = '<b>Что сделать сейчас:</b> ' + a; elSub.textContent = b || ''; }
  function sobytie(e) { try { document.dispatchEvent(new CustomEvent('rc-igra', { detail: { e: e, igra: 'zelenaya-stena' } })); } catch (x) {} }
  function poteri() { var p = 0; S.setka.forEach(function (c) { if (c.s === 2 && c.t !== 'lab') p += ves(c); }); return p / S.vsego; }
  function doz(n) { return n + (n === 1 ? ' доза' : n >= 2 && n <= 4 ? ' дозы' : ' доз'); }
  function tablo() {
    var pt = poteri();
    elSpas.textContent = Math.round((1 - pt) * 100) + ' %';
    elPot.textContent = Math.round(pt * 100) + ' %'; elPot.classList.toggle('zs-krasn', pt > 0.2);
    elPbar.style.width = Math.min(100, pt / PRED * 100) + '%';
    elDoz.textContent = doz(S.doz); elDoz.classList.toggle('zs-krasn', S.doz <= 1);
    elFbar.style.width = (S.doz / DOZ * 100) + '%';
    elKbar.style.width = (S.derzhu / KOLBA * 100) + '%';
    root.dataset.doz = S.doz; root.dataset.poteri = Math.round(pt * 100);
  }
  function start() {
    if (S.faza !== 'zhdem') return;
    S.faza = 'idet'; S.t = 0; root.dataset.faza = 'idet';
    if (!nachal) { nachal = true; sobytie('nachal'); }
    txt('Строй стену поперёк волны', 'Корабль с чумой причалил. Веди по домикам сплошной полосой от края до края.');
  }

  /* ── шприц и колба ───────────────────────────────────────── */
  function privit(c) {
    if (!c || c.t === 'lab' || c.s !== 0) return;
    if (S.doz <= 0) { S.mig = 0.6; return; }
    c.s = 1; c.ot = S.t; S.doz--; tablo();
    if (S.doz === 0) { txt('Флакон пуст — держи колбу 2 секунды', 'Пока ты в лаборатории, волна идёт дальше. Не тяни.'); ruka.na(bKolba); }
    else if (S.doz === 1) txt('Последняя доза — скоро в лабораторию', 'Колба под картой или лаборатория на карте вверху справа.');
  }
  function kletkaV(px, py, tochno) {
    var x = Math.floor((px - ox) / k), y = Math.floor((py - oy) / k);
    // tochno — только круг в середине клетки: косой штрих через угол не тратит дозы на соседей
    if (tochno && Math.hypot(px - ox - (x + 0.5) * k, py - oy - (y + 0.5) * k) > k * 0.45) return null;
    return kl(x, y);
  }
  function derzhat(da) {
    if (S.faza === 'konec') return;
    if (da) { start(); if (S.derzhuOt === null) S.derzhuOt = 0; }
    else { S.derzhuOt = null; S.derzhu = 0; tablo(); }
  }
  var vedu = false, pred = null;
  function tochka(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function provesti(a, b) {
    var d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(d / (k / 4)));
    for (var i = 1; i <= n; i++) privit(kletkaV(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n, true));
  }
  cv.addEventListener('pointerdown', function (e) {
    if (S.faza === 'konec') return;
    e.preventDefault();
    var p = tochka(e), c = kletkaV(p.x, p.y);
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    start();
    if (c && c.t === 'lab') { derzhat(true); vedu = 'lab'; return; }
    vedu = true; pred = p; S.kurs = p; privit(kletkaV(p.x, p.y, true));
  });
  cv.addEventListener('pointermove', function (e) {
    if (!vedu) return;
    var p = tochka(e);
    if (vedu === 'lab') { var c = kletkaV(p.x, p.y); if (!c || c.t !== 'lab') { derzhat(false); vedu = false; } return; }
    provesti(pred, p); pred = p; S.kurs = p;
  });
  function otpustil() { if (vedu === 'lab') derzhat(false); vedu = false; pred = null; S.kurs = null; }
  cv.addEventListener('pointerup', otpustil); cv.addEventListener('pointercancel', otpustil);
  bKolba.addEventListener('pointerdown', function (e) { e.preventDefault(); try { bKolba.setPointerCapture(e.pointerId); } catch (x) {} derzhat(true); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { bKolba.addEventListener(t, function () { derzhat(false); }); });
  bKolba.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); derzhat(true); } });
  bKolba.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') derzhat(false); });
  bAgain.addEventListener('click', function () { fin.hidden = true; boxHod.hidden = false; root.classList.remove('zs-pobeda', 'zs-proigr'); nov(); });

  /* ── ход волны ───────────────────────────────────────────── */
  function shag(dt) {
    if (S.mig > 0) S.mig -= dt;
    if (S.faza !== 'idet') { if (S.faza === 'konec') S.t += dt; return; }
    S.t += dt;
    if (S.derzhuOt !== null) {
      S.derzhu = Math.min(KOLBA, S.derzhu + dt);
      if (S.derzhu >= KOLBA) { S.doz = DOZ; S.derzhu = 0; S.derzhuOt = null; S.pusto = 0; ruka.ubrat(); txt('Флакон полон — достраивай стену', 'Пять доз. Закрой щели: чума ищет любой непривитый домик рядом.'); }
      tablo();
    }
    S.pusto = S.doz === 0 && S.derzhuOt === null ? S.pusto + dt : 0;
    if (S.t < ZADERZHKA) return;
    var novye = [], front = 0;
    S.setka.forEach(function (c) {
      if (c.s !== 0 || c.t === 'lab') return;
      var b = 0; sosedi(c).forEach(function (n) { if (n.s === 2) b++; });
      if (!b) return;
      front++;
      c.p += b * SKOR * dt;
      if (c.p >= c.porog) novye.push(c);
    });
    novye.forEach(function (c) { c.s = 2; c.ot = S.t; });
    if (novye.length) tablo();
    var pt = poteri();
    if (pt > PRED) return konec(false, 'Чума забрала больше 30 % города', 'Стена не успела встать поперёк волны.');
    if (novye.length && S.pusto > PUSTO) return konec(false, 'Пустой флакон, а волна подошла', 'Чума взяла новый дом, а прививать было нечем. За вакциной надо бежать раньше, чем кончится последняя доза.');
    if (!front && !novye.length) {
      S.setka.forEach(function (c) { if (c.s === 1 && sosedi(c).some(function (n) { return n.s === 2; })) S.stena++; });
      konec(true);
    }
  }
  function konec(pobeda, h, t) {
    S.faza = 'konec'; S.t = 0; S.itog = pobeda; S.derzhuOt = null; vedu = false; ruka.ubrat();
    var pt = poteri(), spas = Math.round((1 - pt) * 100), rynok = S.rynok.s !== 2;
    root.dataset.itog = pobeda ? 'pobeda' : 'proigrysh'; root.dataset.faza = 'konec';
    root.classList.add(pobeda ? 'zs-pobeda' : 'zs-proigr');
    boxHod.hidden = true; tablo();
    if (pobeda) {
      txt('Волна упёрлась в зелёную стену', 'Город за стеной цел.');
      finH.textContent = 'Волна остановлена. Спасено ' + spas + ' % города';
      finTxt.textContent = 'Чума упёрлась в зелёную полосу из ' + S.stena + ' привитых домов и дальше не пошла.' + (rynok ? ' Рынок цел.' : ' Рынок не уберегли.');
      var z = [[true, 'Волна остановлена'], [pt <= 0.2, 'Потеряно не больше 20 % города'], [rynok, 'Рынок цел']];
      zv.innerHTML = z.map(function (a) { return '<li class="' + (a[0] ? 'on' : '') + '">' + (a[0] ? '★ ' : '☆ ') + a[1] + '</li>'; }).join('');
      root.dataset.zvezdy = z.filter(function (a) { return a[0]; }).length;
      if (!nagrada && typeof window.award === 'function') { nagrada = true; window.award('igra', 40); }
      sobytie('pobeda');
    } else {
      txt(h, 'Жми «Ещё раз» — и строй стену раньше.');
      finH.textContent = h + '. Спасено ' + spas + ' %';
      finTxt.textContent = t;
      zv.innerHTML = '<li>☆ Волна остановлена</li><li>☆ Потеряно не больше 20 % города</li><li>☆ Рынок цел</li>';
      root.dataset.zvezdy = 0;
      sobytie('proigrysh');
    }
    fin.hidden = false;
    setTimeout(function () { ruka.na(bAgain); }, 900);
  }

  /* ── рисунок ─────────────────────────────────────────────── */
  function razmer() {
    var w = cv.parentNode.clientWidth || 340, staroe = W;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = w;
    if (S && (staroe >= 600) !== (W >= 600) && S.faza === 'zhdem') { nov(); return; }
    var c = C || 9, r = R || 11;
    k = Math.floor(Math.min(W / c, (W >= 600 ? 460 : 470) / r));
    H = k * r + 8; ox = Math.floor((W - k * c) / 2); oy = 4;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cv.dataset.setka = [c, r, ox, oy, k].join(',');
  }
  function dom(c, x, y) {
    var pul = 0.5 + 0.5 * Math.sin(S.t * 6 + c.x + c.y), s = k * 0.34;
    var cvet = c.s === 1 ? '#3fdc7a' : c.s === 2 ? '#e2412f' : '#ffcf5a';
    if (c.s === 0 && c.p > 0) cvet = 'rgb(255,' + Math.round(207 - 120 * Math.min(1, c.p / c.porog)) + ',' + Math.round(90 - 60 * Math.min(1, c.p / c.porog)) + ')';
    // свечение
    var stena = c.s === 1 && sosedi(c).some(function (n) { return n.s === 2; });
    cx.fillStyle = c.s === 2 ? 'rgba(226,65,47,' + (0.25 + 0.2 * pul) + ')' : stena ? 'rgba(63,220,122,' + (0.35 + 0.25 * pul) + ')' : c.s === 1 ? 'rgba(63,220,122,.18)' : 'rgba(255,207,90,.10)';
    cx.beginPath(); cx.arc(x, y, k * 0.48, 0, 7); cx.fill();
    // домик: стены и крыша
    cx.fillStyle = c.s === 2 ? '#3a1512' : '#1d2a3a';
    cx.fillRect(x - s, y - s * 0.2, s * 2, s * 1.2);
    cx.beginPath(); cx.moveTo(x - s * 1.2, y - s * 0.15); cx.lineTo(x, y - s * 1.1); cx.lineTo(x + s * 1.2, y - s * 0.15); cx.closePath(); cx.fill();
    cx.fillStyle = cvet; cx.fillRect(x - s * 0.35, y + s * 0.1, s * 0.7, s * 0.6);
    if (stena) { cx.strokeStyle = '#8dffb5'; cx.lineWidth = 2; cx.strokeRect(x - k / 2 + 2, y - k / 2 + 2, k - 4, k - 4); }
  }
  function risuj() {
    cx.clearRect(0, 0, W, H);
    cx.fillStyle = '#0a1420'; cx.fillRect(0, 0, W, H);
    // улицы
    cx.strokeStyle = 'rgba(255,255,255,.05)'; cx.lineWidth = 1;
    for (var i = 0; i <= C; i++) { cx.beginPath(); cx.moveTo(ox + i * k, oy); cx.lineTo(ox + i * k, oy + R * k); cx.stroke(); }
    for (i = 0; i <= R; i++) { cx.beginPath(); cx.moveTo(ox, oy + i * k); cx.lineTo(ox + C * k, oy + i * k); cx.stroke(); }
    S.setka.forEach(function (c) {
      var x = ox + c.x * k + k / 2, y = oy + c.y * k + k / 2;
      if (c.t === 'port') {
        cx.fillStyle = '#123a5c'; cx.fillRect(x - k / 2, y - k / 2, k, k);
        cx.fillStyle = '#e2412f'; cx.beginPath(); cx.moveTo(x - k * 0.35, y); cx.lineTo(x + k * 0.35, y); cx.lineTo(x + k * 0.22, y + k * 0.18); cx.lineTo(x - k * 0.22, y + k * 0.18); cx.closePath(); cx.fill();
        cx.fillRect(x - 1, y - k * 0.3, 2, k * 0.3);
        podpis('Порт', x, y - k * 0.32);
      } else if (c.t === 'lab') {
        var dl = S.derzhuOt !== null;
        cx.fillStyle = dl ? '#1f5a3a' : '#16324a'; cx.fillRect(x - k / 2 + 2, y - k / 2 + 2, k - 4, k - 4);
        cx.fillStyle = '#9ff0c0'; cx.beginPath(); cx.moveTo(x - 3, y - k * 0.3); cx.lineTo(x + 3, y - k * 0.3); cx.lineTo(x + k * 0.22, y + k * 0.25); cx.lineTo(x - k * 0.22, y + k * 0.25); cx.closePath(); cx.fill();
        if (dl) { cx.strokeStyle = '#ffd666'; cx.lineWidth = 3; cx.beginPath(); cx.arc(x, y, k * 0.44, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * S.derzhu / KOLBA); cx.stroke(); }
        podpis('Лаб.', x, y + k * 0.46);
      } else if (c.t === 'rynok') {
        dom(c, x, y);
        cx.fillStyle = c.s === 2 ? '#7a1f18' : '#c98a2e';
        for (var j = 0; j < 4; j++) { cx.fillStyle = j % 2 ? '#f3e2b0' : (c.s === 2 ? '#7a1f18' : '#c98a2e'); cx.fillRect(x - k * 0.45 + j * k * 0.225, y - k * 0.48, k * 0.225, k * 0.16); }
        podpis('Рынок', x, y + k * 0.48);
      } else dom(c, x, y);
    });
    if (S.kurs && S.faza === 'idet') shpric(S.kurs.x, S.kurs.y);
    if (S.mig > 0) { cx.fillStyle = 'rgba(226,65,47,' + (S.mig * 0.4) + ')'; cx.fillRect(0, 0, W, H); }
    if (S.faza === 'konec' && S.itog) {
      cx.fillStyle = 'rgba(10,20,32,.72)'; cx.fillRect(0, H / 2 - 22, W, 44);
      cx.fillStyle = '#8dffb5'; cx.font = '800 ' + (W < 400 ? 17 : 20) + 'px system-ui,sans-serif'; cx.textAlign = 'center';
      cx.fillText('Стена выдержала — город за ней цел', W / 2, H / 2 + 6); cx.textAlign = 'start';
    }
  }
  function podpis(t, x, y) {
    cx.font = '700 ' + Math.max(10, Math.round(k * 0.26)) + 'px system-ui,sans-serif'; cx.textAlign = 'center';
    cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillText(t, x + 1, y + 1); cx.fillStyle = '#fff'; cx.fillText(t, x, y); cx.textAlign = 'start';
  }
  function shpric(x, y) {
    cx.save(); cx.translate(x, y); cx.rotate(-Math.PI / 4);
    cx.fillStyle = S.doz ? '#3fdc7a' : '#e2412f'; cx.fillRect(4, -4, 22 * (S.doz / DOZ), 8);
    cx.strokeStyle = '#fff'; cx.lineWidth = 1.5; cx.strokeRect(4, -4, 22, 8);
    cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(-8, 0); cx.moveTo(26, 0); cx.lineTo(34, 0); cx.moveTo(34, -5); cx.lineTo(34, 5); cx.stroke();
    cx.restore();
  }
  function kadr(ts) {
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    shag(dt); risuj();
    requestAnimationFrame(kadr);
  }
  W = cv.parentNode.clientWidth || 340;
  nov();
  window.addEventListener('resize', razmer);
  requestAnimationFrame(kadr);
})();
