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


/* Игра «Сними Кронштадт целиком» (26 января, камера Срезневского, 1886), r420-26.
   Вид с воздушного шара вниз: ветер несёт шар от Петербурга к морю (на запад, влево), остров Котлин плывёт
   под шаром слева направо. Рамка кадра на воде растёт с высотой: ширина = 0,2 px на метр, остров — 200 px,
   поэтому целиком он влезает только с 1000 м; выше 1200 м — мелко и в дымке, выше 1300 м — облака.
   4 стеклянные пластинки. Победа — остров целиком в рамке на 1000–1200 м, затем проявка снимка (сепия). */
(function () {
  var root = document.querySelector('[data-kk-igra]');
  if (!root) return;
  var cv = root.querySelector('.kk-canvas');
  if (!cv || !cv.getContext) return;
  var W = 360, H = 260, CX = 180, CY = 128, K = 0.2, IW = 200, IH = 48;
  var START_IX = -130, KONEC_IX = 240, SHAG = 100, PLASTINOK = 4;
  var ctx = cv.getContext('2d');
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr;
  var tiho = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ruka = igraRuka(root);
  var $ = function (s, el) { return (el || root).querySelector(s); };
  var vverh = $('.kk-vverh'), vniz = $('.kk-vniz'), snyat = $('.kk-snyat'), task = $('.kk-task'), sub = $('.kk-sub');
  var NACHALO = sub.textContent;
  var OSTROV = [[-100, 2], [-82, -6], [-50, -10], [-10, -13], [30, -16], [62, -24], [90, -20], [100, -6], [97, 12], [80, 22], [50, 18], [10, 13], [-40, 10], [-80, 8]];
  var FORTY = [[-55, -50], [-15, -54], [25, -50], [65, -46], [-30, 50], [15, 52], [58, 48], [118, 34]];
  var st, raf = 0, last = 0;

  function sl(a, b) { return a + Math.random() * (b - a); }
  function seychas(t) { task.innerHTML = '<b>Что сделать сейчас:</b> ' + t; }
  function pishi(t, cls, sek) {
    sub.textContent = t; sub.className = 'kk-sub igra-poyasnenie' + (cls ? ' ' + cls : '');
    st.soobshDo = sek ? st.t + sek : 0;
  }
  function ramka() {
    var fw = K * st.alt;
    return { x: CX + st.jx, y: CY + st.jy, w: fw, h: fw * 0.6 };
  }
  function vRamke(r) {
    return st.ix - IW / 2 >= r.x - r.w / 2 && st.ix + IW / 2 <= r.x + r.w / 2 &&
      CY - IH / 2 >= r.y - r.h / 2 && CY + IH / 2 <= r.y + r.h / 2;
  }
  function vZone(a) { return a >= 1000 && a <= 1200; }

  var tabloBylo = {};
  function tablo() {
    var a = Math.round(st.alt / 10) * 10, km = Math.max(0, (KONEC_IX - st.ix) / (KONEC_IX - START_IX) * 12);
    var z = { vys: a + ' м', plast: String(st.plast), more: (km >= 10 ? Math.round(km) : km.toFixed(1).replace('.', ',')) + ' км' };
    ['vys', 'plast', 'more'].forEach(function (k) {
      if (tabloBylo[k] === z[k]) return;
      tabloBylo[k] = z[k]; $('.kk-' + k).textContent = z[k];
    });
    $('.kk-vys').classList.toggle('kk-v-zone', vZone(st.alt));
    $('.kk-plast').classList.toggle('kk-malo', st.plast <= 1);
    $('.kk-more').classList.toggle('kk-malo', km < 3);
  }

  // Подсказка: какая кнопка нужна сейчас. Меняется только при смене шага, чтобы рука не мигала каждый кадр.
  function podskazka() {
    var r = ramka(), k, txt, cls = '', kn;
    if (!st.poshel) { k = 'start'; kn = vverh; txt = NACHALO; }
    else if (st.alt < 1000) { k = 'up'; kn = vverh; txt = 'Низко: рамка меньше острова. Жми «Балласт ↑» — до зелёной полосы на шкале.'; }
    else if (st.alt > 1200) { k = 'down'; kn = vniz; txt = st.alt > 1300 ? 'Облака закрыли залив! Жми «Газ ↓».' : 'Высоко: остров мелкий, облака близко. Жми «Газ ↓».'; cls = 'kk-ploho'; }
    else if (vRamke(r)) { k = 'now'; kn = snyat; txt = 'Остров целиком в рамке — снимай!'; cls = 'kk-horosho'; }
    else if (st.ix < r.x) { k = 'wait'; kn = snyat; txt = 'Высота хорошая. Котлин вплывает в рамку — жми «Снять!», когда рамка позеленеет.'; }
    else { k = 'late'; kn = snyat; txt = 'Остров уходит из рамки — опоздаешь!'; cls = 'kk-ploho'; }
    if (k === st.shagK) return;
    st.shagK = k;
    if (kn !== st.knopka) { st.knopka = kn; ruka.na(kn); }
    if (!st.soobshDo || st.t >= st.soobshDo) pishi(txt, cls);
    else st.otlozh = [txt, cls];
  }

  /* ---------- рисование ---------- */
  function voda() {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2d5868'); g.addColorStop(1, '#1b3a48');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.lineWidth = 1.2;
    var off = st.ix * 1.0;
    for (var i = 0; i < 18; i++) {
      var x = ((i * 53 + off) % (W + 40) + W + 40) % (W + 40) - 20, y = 14 + (i * 37) % 236;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 6, y - 3, x + 12, y); ctx.quadraticCurveTo(x + 18, y + 3, x + 24, y); ctx.stroke();
    }
  }
  function ostrov() {
    var x0 = st.ix, y0 = CY, i;
    ctx.fillStyle = '#8a7a5a';
    FORTY.forEach(function (f) { ctx.beginPath(); ctx.arc(x0 + f[0], y0 + f[1], 3.2, 0, 7); ctx.fill(); });
    ctx.beginPath();
    OSTROV.forEach(function (p, j) { j ? ctx.lineTo(x0 + p[0], y0 + p[1]) : ctx.moveTo(x0 + p[0], y0 + p[1]); });
    ctx.closePath();
    ctx.fillStyle = '#5f7048'; ctx.fill();
    ctx.strokeStyle = '#d6c592'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = 'rgba(40,58,34,.75)';
    for (i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(x0 - 85 + (i * 7) % 60 + (i % 3) * 4, y0 - 4 + (i * 5) % 12, 2.4, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#c4ad82';
    for (i = 0; i < 4; i++) for (var j = 0; j < 4; j++) ctx.fillRect(x0 + 52 + i * 10, y0 - 16 + j * 8, 7, 5);
    ctx.strokeStyle = '#d6c592'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0 + 60, y0 + 20); ctx.lineTo(x0 + 60, y0 + 34); ctx.lineTo(x0 + 92, y0 + 34); ctx.lineTo(x0 + 92, y0 + 20); ctx.stroke();
  }
  function oblaka() {
    var a = Math.max(0, Math.min(0.94, (st.alt - 1150) / 190));
    if (!a) return;
    st.tuchi.forEach(function (c) {
      var x = ((c.x + st.t * c.v) % (W + 140) + W + 140) % (W + 140) - 70;
      ctx.fillStyle = 'rgba(232,236,240,' + a + ')';
      for (var i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + (i - 1.5) * c.r * 0.8, c.y + (i % 2) * c.r * 0.35, c.r, 0, 7); ctx.fill(); }
    });
    if (st.alt > 1300) { ctx.fillStyle = 'rgba(225,230,235,' + Math.min(0.85, (st.alt - 1300) / 150 + 0.35) + ')'; ctx.fillRect(0, 0, W, H); }
  }
  function scena() { voda(); ostrov(); oblaka(); }
  function shkala() {
    var y = function (a) { return 244 - a / 1500 * 228; };
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(6, 12, 16, 236);
    ctx.fillStyle = 'rgba(111,224,160,.85)'; ctx.fillRect(8, y(1200), 12, y(1000) - y(1200));
    ctx.fillStyle = 'rgba(230,234,238,.55)'; ctx.fillRect(8, y(1500), 12, y(1300) - y(1500));
    var ya = y(Math.min(1500, st.alt));
    ctx.fillStyle = '#ffd666';
    ctx.beginPath(); ctx.moveTo(23, ya); ctx.lineTo(32, ya - 6); ctx.lineTo(32, ya + 6); ctx.closePath(); ctx.fill();
    ctx.fillRect(6, ya - 1, 16, 2);
    ctx.font = '600 10px system-ui,sans-serif'; ctx.fillStyle = '#e8eef2'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('1000', 34, y(1000)); ctx.fillText('облака', 34, y(1400));
  }
  function ramkaRis(r) {
    var ok = vZone(st.alt) && vRamke(r), cvet = st.alt > 1300 ? '#ff7a66' : ok ? '#6fe0a0' : '#ffd666';
    var x = r.x - r.w / 2, y = r.y - r.h / 2;
    ctx.fillStyle = 'rgba(5,10,14,.32)';
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(x, y, r.w, r.h); ctx.fill('evenodd');
    ctx.strokeStyle = cvet; ctx.lineWidth = ok ? 2.5 : 1.5; ctx.strokeRect(x, y, r.w, r.h);
    var u = Math.min(16, r.w / 4); ctx.lineWidth = 4;
    [[x, y, 1, 1], [x + r.w, y, -1, 1], [x, y + r.h, 1, -1], [x + r.w, y + r.h, -1, -1]].forEach(function (c) {
      ctx.beginPath(); ctx.moveTo(c[0] + c[2] * u, c[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0], c[1] + c[3] * u); ctx.stroke();
    });
    ctx.font = '700 11px system-ui,sans-serif'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(232,238,242,.8)';
    ctx.textAlign = 'left'; ctx.fillText('← к морю', 40, 12);
    ctx.textAlign = 'right'; ctx.fillText('Петербург →', W - 6, 12);
  }
  function risuy() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (st.snimok) return plastinka();
    scena(); ramkaRis(ramka()); shkala();
    if (st.vspyshka > 0) { ctx.fillStyle = 'rgba(255,255,255,' + st.vspyshka + ')'; ctx.fillRect(0, 0, W, H); }
  }
  function plastinka() {
    var p = st.razv, pw = 290, ph = 174, x = (W - pw) / 2, y = 26;
    ctx.fillStyle = '#0c0b09'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1d1a14'; ctx.fillRect(x, y, pw, ph);
    ctx.globalAlpha = p * p * (3 - 2 * p);
    ctx.drawImage(st.snimok, x + 8, y + 8, pw - 16, ph - 16);
    ctx.globalAlpha = 1;
    var g = ctx.createRadialGradient(W / 2, y + ph / 2, 40, W / 2, y + ph / 2, 170);
    g.addColorStop(0, 'rgba(20,14,6,0)'); g.addColorStop(1, 'rgba(20,14,6,' + (0.75 - 0.35 * p) + ')');
    ctx.fillStyle = g; ctx.fillRect(x + 8, y + 8, pw - 16, ph - 16);
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, pw, ph);
    ctx.fillStyle = 'rgba(255,255,255,.07)';
    ctx.beginPath(); ctx.moveTo(x + 20, y); ctx.lineTo(x + 70, y); ctx.lineTo(x + 20, y + ph); ctx.lineTo(x - 30 + 20, y + ph); ctx.closePath(); ctx.fill();
    ctx.font = '700 14px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e9cf7e';
    ctx.fillText(p < 1 ? 'Пластинка проявляется…' : 'Кронштадт с высоты ' + st.snyatoNa + ' м · 1886', W / 2, y + ph + 26);
  }
  function sepiya(r) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    st.jx = r.x - CX; st.jy = r.y - CY; scena();
    var c = document.createElement('canvas'), sw = Math.max(1, Math.round(r.w * dpr)), sh = Math.max(1, Math.round(r.h * dpr));
    c.width = sw; c.height = sh;
    var cc = c.getContext('2d');
    cc.drawImage(cv, Math.round((r.x - r.w / 2) * dpr), Math.round((r.y - r.h / 2) * dpr), sw, sh, 0, 0, sw, sh);
    var d = cc.getImageData(0, 0, sw, sh), a = d.data;
    for (var i = 0; i < a.length; i += 4) {
      var s = a[i] * 0.3 + a[i + 1] * 0.59 + a[i + 2] * 0.11;
      s = Math.min(255, s * 1.25 + 10);
      a[i] = Math.min(255, s * 1.07 + 18); a[i + 1] = Math.min(255, s * 0.86 + 10); a[i + 2] = Math.min(255, s * 0.62);
    }
    cc.putImageData(d, 0, 0);
    return c;
  }

  /* ---------- ход игры ---------- */
  function poehali() {
    if (st.poshel) return;
    st.poshel = true; last = 0;
    raf = requestAnimationFrame(kadr);
  }
  function kadr(ts) {
    if (!st || st.konec === true) return;
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts;
    if (st.snimok) {
      st.razv = Math.min(1, st.razv + dt / 2.5);
      risuy();
      if (st.razv >= 1) { final(true); return; }
      raf = requestAnimationFrame(kadr); return;
    }
    st.t += dt;
    st.doPoryva -= dt;
    if (st.doPoryva <= 0) {
      st.poryv = 1.4; st.doPoryva = sl(5, 8);
      st.cel += (Math.random() < 0.5 ? -1 : 1) * sl(30, 60);
      pishi('Порыв ветра! Шар сносит и бросает.', 'kk-ploho', 1.4);
    }
    if (st.poryv > 0) st.poryv -= dt;
    st.ix += (9 + (st.poryv > 0 ? 6 : 0) + Math.sin(st.t * 0.9) * 1.2) * dt;
    st.cel = Math.max(150, Math.min(1600, st.cel - 4 * dt));
    var v = 500 * dt; st.alt += Math.max(-v, Math.min(v, st.cel - st.alt));
    var amp = (st.poryv > 0 ? 5 : 1.5) * (tiho ? 0.5 : 1);
    st.jx = amp * (Math.sin(st.t * 13.1) + 0.6 * Math.sin(st.t * 7.3)) / 1.6;
    st.jy = amp * (Math.sin(st.t * 11.7 + 1) + 0.6 * Math.sin(st.t * 5.9)) / 1.6;
    if (st.vspyshka > 0) st.vspyshka = Math.max(0, st.vspyshka - dt * 5);
    if (st.soobshDo && st.t >= st.soobshDo) {
      st.soobshDo = 0;
      if (st.otlozh) { pishi(st.otlozh[0], st.otlozh[1]); st.otlozh = null; } else st.shagK = '';
    }
    tablo(); podskazka(); risuy();
    if (st.ix > KONEC_IX) { final(false, 'Котлин остался позади — ветер уносит шар в открытое море.'); return; }
    raf = requestAnimationFrame(kadr);
  }
  function vys(d) {
    if (st.konec) return;
    st.cel = Math.max(150, Math.min(1600, st.cel + d));
    poehali();
    if (st.soobshDo) { st.soobshDo = 0; st.otlozh = null; }
    st.shagK = '';
  }
  function snimok() {
    if (st.konec) return;
    poehali();
    var r = ramka(), a = Math.round(st.alt), ok = vRamke(r), prichina = '';
    st.plast--; st.ispolz++;
    if (!tiho) st.vspyshka = 0.85;
    if (a > 1300) prichina = 'Облака закрыли остров — на пластинке белая муть.';
    else if (!ok) prichina = K * st.alt < IW ? 'Слишком низко: остров не влез в кадр. Поднимись выше.'
      : st.ix < r.x ? 'Рано: западный мыс острова ещё за рамкой.' : 'Поздно: восточный край с Кронштадтом уже вышел из рамки.';
    else if (a > 1200) prichina = 'Остров вышел мелким и в дымке — фортов не разобрать. Спустись ниже 1200 м.';
    if (prichina) {
      tablo();
      if (st.plast <= 0) { final(false, 'Пластинки кончились: ' + prichina.charAt(0).toLowerCase() + prichina.slice(1)); return; }
      pishi('Пластинка испорчена. ' + prichina, 'kk-ploho', 2.2); st.shagK = '';
      return;
    }
    st.zvezdy = [st.ispolz === 1, Math.abs(a - 1100) <= 50, st.ix <= r.x];
    st.snyatoNa = Math.round(a / 10) * 10;
    st.snimok = sepiya(r); st.razv = tiho ? 1 : 0;
    ruka.ubrat(); st.knopka = null; vverh.disabled = vniz.disabled = snyat.disabled = true;
    tablo();
    seychas('Смотри: снимок проявляется');
    pishi('Есть кадр! Остров целиком, высота ' + st.snyatoNa + ' м.', 'kk-horosho');
    if (tiho) { cancelAnimationFrame(raf); risuy(); setTimeout(function () { final(true); }, 400); return; }
    cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(kadr);
  }

  function final(pobeda, pochemu) {
    if (st.konec === true) return;
    cancelAnimationFrame(raf);
    st.konec = true; ruka.ubrat(); st.knopka = null;
    if (!pobeda) risuy();
    vverh.disabled = vniz.disabled = snyat.disabled = true;
    $('.kk-knopki').hidden = true;
    var f = $('.kk-finale'); f.hidden = false;
    $('.kk-fin-h', f).textContent = pobeda ? 'Кронштадт на пластинке' : 'Кадра нет';
    $('.kk-fin-txt', f).textContent = pobeda
      ? 'Весь остров Котлин на одной стеклянной пластинке: город, гавани, форты в воде. Так в 1886 году с воздушного шара сняли Кронштадт камерой Срезневского.'
      : pochemu + ' В 1886 году Кронштадт сняли с высоты 1100 метров. Попробуй ещё раз.';
    var z = st.zvezdy || [false, false, false];
    var spisok = [[pobeda && z[0], 'Снял с первой пластинки'], [pobeda && z[1], 'Высота 1100 ± 50 м — как в 1886 году'], [pobeda && z[2], 'Успел до середины острова']];
    $('.kk-zvezdy', f).innerHTML = spisok.map(function (x) { return '<li class="' + (x[0] ? 'kk-da' : '') + '">' + (x[0] ? '★ ' : '☆ ') + x[1] + '</li>'; }).join('');
    seychas(pobeda ? 'Прочитай, как было на самом деле' : 'Нажми «Ещё раз»');
    pishi(pobeda ? 'Снимок готов.' : pochemu, pobeda ? 'kk-horosho' : 'kk-ploho');
    if (pobeda && typeof window.award === 'function') window.award('kadr', 40);
    ruka.na($('.kk-again', f));
  }

  function start() {
    cancelAnimationFrame(raf); last = 0;
    var tuchi = [];
    for (var i = 0; i < 7; i++) tuchi.push({ x: sl(0, W + 140), y: sl(20, 240), r: sl(16, 30), v: sl(5, 12) });
    st = { alt: 300, cel: 300, ix: START_IX, plast: PLASTINOK, ispolz: 0, t: 0, jx: 0, jy: 0, poryv: 0, doPoryva: sl(4, 6),
      vspyshka: 0, poshel: false, konec: false, shagK: '', knopka: null, soobshDo: 0, otlozh: null, snimok: null, razv: 0, zvezdy: null, tuchi: tuchi };
    tabloBylo = {};
    $('.kk-knopki').hidden = false; $('.kk-finale').hidden = true;
    vverh.disabled = vniz.disabled = snyat.disabled = false;
    seychas('Поймай весь остров в кадр');
    pishi(NACHALO, '');
    tablo(); podskazka(); risuy();
  }
  vverh.addEventListener('click', function () { vys(SHAG); });
  vniz.addEventListener('click', function () { vys(-SHAG); });
  snyat.addEventListener('click', snimok);
  $('.kk-again').addEventListener('click', start);
  start();
})();
