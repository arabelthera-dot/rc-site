/* Жанр «Опыт» (G14, r554) — движок, один на все дни. Данные дня — JSON в разметке (.zo-dannye),
   их кладёт генератор tools/zhanry/sobrat-vse.mjs из yaml дня. Файл копируется в public/muzei/<музей>/igry/opyt-ММ-ДД.js —
   править здесь, не в копиях. Держишь кнопку → уровень растёт, отпустил → падает; на каждой ступени — шаг истории
   (пока читаешь, уровень стоит); 100 % — вау (raskruti: узор волчка; nagrey: «солнце» в кольце) → факт дня. */
(function(){
  var root = document.querySelector('[data-zhanr-opyt]');
  if (!root) return;
  var D = JSON.parse(root.querySelector('.zo-dannye').textContent);
  var q = function(s){ return root.querySelector(s); };
  var cv = q('.zo-canvas'), cx = cv.getContext('2d'), W = cv.width, H = cv.height;
  var knopka = q('.zo-knopka'), znach = q('.zo-znach'), polosa = q('.zo-polosa'), tekst = q('.zo-tekst'), seychas = q('.zo-seychas'), fin = q('.zo-final');
  var n = D.udary.length, RAST = 12, PAD = 6, TAP = 6;   // % в секунду; тап — +6 %
  // Ступени шкалы: удар k — на k/n·100 %, конец — кульминация.
  var stupeni = q('.zo-stupeni');
  for (var i = 1; i < n; i++) { var m = document.createElement('i'); m.style.left = (i / n * 100) + '%'; stupeni.appendChild(m); }
  // Подпись параметра: мощность — от первой плашки до последней по логарифму (6 Вт … 1 МВт), иначе проценты.
  function vatt(w){
    var ed = w >= 1e9 ? [1e9, 'ГВт'] : w >= 1e6 ? [1e6, 'МВт'] : w >= 1e3 ? [1e3, 'кВт'] : [1, 'Вт'], x = w / ed[0];
    return (x < 10 ? Math.round(x * 10) / 10 : Math.round(x)).toLocaleString('ru-RU') + ' ' + ed[1];
  }
  function podpis(u){
    if (!D.stupeni) return Math.round(u) + ' %';
    var a = D.stupeni[0].w, b = D.stupeni[D.stupeni.length - 1].w;
    return vatt(a * Math.pow(b / a, u / 100));
  }
  // Состояние.
  var uroven = 0, pol = 0, derzhu = false, nazhal = 0, k = 0, pauza = 0, etap = 'zhdet', nachalo = 0, vau = 0, t0 = 0;
  var zvuk = null, gul = null;
  function audio(){ try { zvuk = zvuk || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} return zvuk; }
  function ton(f, dlit, gr){
    var a = audio(); if (!a) return;
    try { var o = a.createOscillator(), g = a.createGain(); o.frequency.value = f; g.gain.value = gr || 0.05; o.connect(g); g.connect(a.destination);
      o.start(); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dlit); o.stop(a.currentTime + dlit); } catch (e) {}
  }
  function gudet(){   // ровный гул: высота — по уровню
    var a = audio(); if (!a || gul) return;
    try { var o = a.createOscillator(), g = a.createGain(); o.type = 'sawtooth'; o.frequency.value = 60; g.gain.value = 0; o.connect(g); g.connect(a.destination); o.start(); gul = { o: o, g: g }; } catch (e) {}
  }
  function nachat(){
    if (etap !== 'zhdet') return;
    etap = 'idet'; root.dataset.sostoyanie = 'idet'; nachalo = Date.now(); gudet();
    stupen();   // удар 0 — сразу
  }
  // Шаг истории: показать удар k, уровень стоит, пока читаешь (≈12 знаков в секунду, не меньше 9 с): вся игра — 60–120 с.
  function stupen(){
    tekst.textContent = D.udary[k]; ton(520 + k * 90, 0.25, 0.06);
    pauza = performance.now() + Math.max(9000, D.udary[k].length / 12 * 1000);
    pol = k / n * 100; k++;
    seychas.innerHTML = '<b>Ступень ' + k + ' из ' + n + '. Читай шаг истории под шкалой — потом продолжай опыт.</b>';
  }
  function kulminaciya(){
    etap = 'rezultat'; root.dataset.sostoyanie = 'rezultat'; vau = performance.now(); uroven = 100; derzhu = false; knopka.classList.remove('zo-derzhu');
    knopka.hidden = true; seychas.innerHTML = '<b>' + D.kulminaciya + '</b>';
    ton(523, 1.2, 0.05); ton(659, 1.2, 0.04); ton(784, 1.4, 0.04);
    setTimeout(function(){ fin.hidden = false; root.dataset.sostoyanie = 'fakt'; root.dataset.sekund = Math.round((Date.now() - nachalo) / 1000); }, 3000);
  }
  // Кнопка: держать — мышью, пальцем, пробелом/Enter. Короткий тап — +6 %.
  function vniz(e){ if (e) e.preventDefault(); if (etap === 'rezultat' || etap === 'fakt') return; nachat(); if (e && e.pointerId != null && knopka.setPointerCapture) try { knopka.setPointerCapture(e.pointerId); } catch (x) {} derzhu = true; nazhal = performance.now(); knopka.classList.add('zo-derzhu'); }
  function vverh(){
    if (!derzhu) return; derzhu = false; knopka.classList.remove('zo-derzhu');
    if (performance.now() - nazhal < 250 && performance.now() > pauza) uroven = Math.min(k < n ? k / n * 100 : 100, uroven + TAP);
  }
  knopka.addEventListener('pointerdown', vniz);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function(t){ knopka.addEventListener(t, vverh); });
  knopka.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  knopka.addEventListener('keydown', function(e){ if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) vniz(e); });
  knopka.addEventListener('keyup', function(e){ if (e.key === ' ' || e.key === 'Enter') vverh(); });
  q('.zo-snova').addEventListener('click', function(){
    etap = 'zhdet'; root.dataset.sostoyanie = 'zhdet'; uroven = pol = 0; k = 0; pauza = 0; vau = 0; fin.hidden = true; knopka.hidden = false; sled = [];
    seychas.innerHTML = '<b>' + D.seychas + '</b>'; tekst.textContent = 'Опыт сначала: держи кнопку.';
  });
  // Сцена: на затемнённом снимке — только свет, без текста.
  var sled = [], iskry = [], ugol = 0;
  function raskruti(t, u, dt){
    // Узор волчка: роза-эпициклоида. Мало оборотов — узор плывёт и дрожит, на 100 % — ровный и яркий.
    var drozh = (1 - u) * 18, R = 120, r = 46, sk = 0.6 + u * 5.4;
    ugol += dt * sk;
    for (var s = 0; s < 4; s++) {
      var a = ugol + s * dt * sk / 4, pr = t / 1000 * (1 - u) * 0.8;
      sled.push({ x: W / 2 + R * Math.cos(a + pr) + r * Math.cos(a * 7.2) + (Math.random() - .5) * drozh,
        y: H / 2 + R * 0.62 * Math.sin(a + pr) + r * 0.62 * Math.sin(a * 7.2) + (Math.random() - .5) * drozh, z: 1 });
    }
    var dl = 60 + u * 900; while (sled.length > dl) sled.shift();
    // Призрак узора — каким он станет на полных оборотах (цель опыта видна сразу, сцена не пустая).
    cx.globalCompositeOperation = 'source-over'; cx.strokeStyle = 'rgba(228,201,122,' + (0.22 * (1 - u) + 0.04) + ')'; cx.lineWidth = 1.2; cx.setLineDash([3, 5]); cx.beginPath();
    for (var f = 0; f <= 628; f++) { var b = f / 100 * 5; cx.lineTo(W / 2 + R * Math.cos(b) + r * Math.cos(b * 7.2), H / 2 + R * 0.62 * Math.sin(b) + r * 0.62 * Math.sin(b * 7.2)); }
    cx.stroke(); cx.setLineDash([]);
    cx.globalCompositeOperation = 'lighter'; cx.lineCap = 'round';
    for (var j = 1; j < sled.length; j++) {
      var p = sled[j - 1], c = sled[j], v = j / sled.length;
      cx.strokeStyle = 'hsla(' + (42 + u * 160 * v) + ',100%,' + (55 + u * 30) + '%,' + (v * (0.25 + u * 0.7)) + ')';
      cx.lineWidth = 1 + v * (1.5 + u * 2.5); cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(c.x, c.y); cx.stroke();
    }
    var g = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 40 + u * 80);
    g.addColorStop(0, 'rgba(255,240,200,' + (0.15 + u * 0.5) + ')'); g.addColorStop(1, 'rgba(255,200,120,0)');
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  }
  function nagrey(t, u, dt){
    // Кольцо-бублик плазмы: цвет от тёмно-красного к бело-голубому, частицы бегут по кольцу.
    var h = u < .6 ? u / .6 * 40 : 40 + (u - .6) / .4 * 160, l = 30 + u * 55, sv = 0.25 + u * 0.75;
    cx.globalCompositeOperation = 'lighter';
    for (var s = 3; s >= 0; s--) {
      cx.strokeStyle = 'hsla(' + h + ',100%,' + l + '%,' + (sv * (s ? 0.18 : 0.9)) + ')';
      cx.lineWidth = 10 + s * 14 + u * 10; cx.beginPath(); cx.ellipse(W / 2, H / 2, 200, 82, 0, 0, Math.PI * 2); cx.stroke();
    }
    var nado = Math.round(20 + u * 160);
    while (iskry.length < nado) iskry.push({ a: Math.random() * 6.28, dr: (Math.random() - .5) * 26, v: 0.6 + Math.random() * 0.8 });
    if (iskry.length > nado) iskry.length = nado;
    iskry.forEach(function(p){ p.a += dt * p.v * (0.5 + u * 5);
      var x = W / 2 + (200 + p.dr) * Math.cos(p.a), y = H / 2 + (82 + p.dr * .4) * Math.sin(p.a);
      cx.fillStyle = 'hsla(' + (h + 20) + ',100%,' + (60 + u * 35) + '%,' + (0.4 + u * 0.6) + ')'; cx.fillRect(x - 1.5, y - 1.5, 3, 3); });
    if (vau) {   // «маленькое солнце» в бублике
      var w = Math.min(1, (t - vau) / 1500), g = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 60 + w * 170);
      g.addColorStop(0, 'rgba(255,255,255,' + w + ')'); g.addColorStop(.35, 'rgba(190,225,255,' + (w * .7) + ')'); g.addColorStop(1, 'rgba(120,170,255,0)');
      cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    }
  }
  function kadr(t){
    var dt = t0 ? Math.min(0.05, (t - t0) / 1000) : 0; t0 = t;
    if (etap === 'idet') {
      var potolok = k < n ? k / n * 100 : 100;   // выше следующей ступени не пускаем, пока не прочитан шаг
      if (t < pauza) uroven = Math.max(uroven, Math.min(pol, potolok));
      else if (derzhu) uroven = Math.min(potolok, uroven + RAST * dt);
      else uroven = Math.max(pol, uroven - PAD * dt);
      if (t >= pauza && pauza) { pauza = 0; seychas.innerHTML = '<b>' + (k < n ? 'Держи кнопку «' + knopka.textContent + '» — дальше, к ступени ' + (k + 1) + '.' : 'Последний рывок: держи кнопку до конца шкалы.') + '</b>'; }
      if (!pauza && uroven >= potolok - 0.01) { if (k < n) stupen(); else kulminaciya(); }
    }
    znach.textContent = podpis(uroven); polosa.style.width = uroven + '%';
    if (gul) try { gul.o.frequency.value = 50 + uroven * 4; gul.g.gain.value = etap === 'idet' ? 0.012 + uroven / 100 * 0.02 : Math.max(0, gul.g.gain.value - 0.001); } catch (e) {}
    cx.globalCompositeOperation = 'source-over'; cx.clearRect(0, 0, W, H);
    (D.variant === 'raskruti' ? raskruti : nagrey)(t, uroven / 100, dt);
    requestAnimationFrame(kadr);
  }
  znach.textContent = podpis(0);
  requestAnimationFrame(kadr);
})();
