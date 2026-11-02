/* Сгенерировано tools/zhanry/sobrat-vse.mjs из src/content/dni-shablon/izobreteniya/01-13.yaml — не править, править tools/zhanry/masshtab/dvizhok.js. */
/* Жанр «Угадай и проверь масштабом» (G7, r554) — движок, один на все дни. Данные дня — JSON в разметке (.zm-dannye),
   их кладёт генератор tools/zhanry/sobrat-vse.mjs из yaml дня. Файл копируется в public/muzei/<музей>/igry/masshtab-ММ-ДД.js —
   править здесь, не в копиях. Ползунок-догадка → снимок предмета идёт по шкале к настоящей цифре мимо меток → факт дня. */
(function(){
  var root = document.querySelector('[data-zhanr-masshtab]');
  if (!root) return;
  var D = JSON.parse(root.querySelector('.zm-dannye').textContent);
  var NS = 'http://www.w3.org/2000/svg', svg = root.querySelector('.zm-svg'), foto = root.querySelector('.zm-foto');
  var q = function(s){ return root.querySelector(s); };
  var range = q('.zm-range'), dgEl = q('.zm-dogadka'), tekst = q('.zm-tekst'), knopka = q('.zm-knopka'), fin = q('.zm-final'), schet = q('.zm-schet');
  var Y0 = 56, Y1 = 404, L = Math.abs(D.shkala[1] - D.shkala[0]);
  var yOf = function(v){ return Y0 + Math.abs(v - D.shkala[0]) / L * (Y1 - Y0); };
  var fmt = function(v){ return (Math.round(v * 10) / 10).toLocaleString('ru-RU').replace(/ /g, ' ').replace(/^-/, '−'); };
  function el(tag, at, pered){
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    pered ? svg.insertBefore(e, pered) : svg.appendChild(e); return e;
  }
  // Фон: глубина темнеет книзу, мороз синеет. Полосы — эталон в масштабе (каждая полоса — одна башня).
  var defs = el('defs', {}, foto), gr = el('linearGradient', { id: 'zmFon', x1: 0, y1: 0, x2: 0, y2: 1 }, null);
  defs.appendChild(gr);
  (D.variant === 'glubina' ? [['0', '#2f7fa8'], ['.25', '#0f3d5e'], ['1', '#01060c']] : [['0', '#3a4f6a'], ['.4', '#1d3a66'], ['1', '#c9e6ff']])
    .forEach(function(s){ var st = document.createElementNS(NS, 'stop'); st.setAttribute('offset', s[0]); st.setAttribute('stop-color', s[1]); gr.appendChild(st); });
  el('rect', { x: 0, y: 0, width: 300, height: 420, fill: 'url(#zmFon)' }, foto);
  var et = D.metki.filter(function(m){ return m.etalon; })[0];
  if (D.variant === 'glubina' && et) for (var i = 0; i * et.v < Math.abs(D.shkala[1] - D.shkala[0]); i += 2)
    el('rect', { x: 0, y: yOf(i * et.v), width: 300, height: yOf(et.v) - Y0, 'class': 'zm-polosa' }, foto);
  var legenda = q('.zm-legenda'), metki = D.metki.map(function(m){
    var y = yOf(m.v), li = document.createElement('li');
    li.className = m.etalon ? '' : 'den'; li.textContent = m.tekst + ' — ' + m.k; legenda.appendChild(li);
    return { m: m, li: li, line: el('line', { x1: 8, x2: 292, y1: y, y2: y, 'class': 'zm-m ' + (m.etalon ? 'zm-m-et' : 'zm-m-den') }, foto) };
  });
  var cel = el('line', { x1: 8, x2: 292, y1: yOf(D.cel), y2: yOf(D.cel), 'class': 'zm-cel' }, foto);
  var sled = el('line', { x1: 214, x2: 214, y1: Y0, y2: Y0, 'class': 'zm-sled' }, foto);
  var dg = el('line', { x1: 8, x2: 150, 'class': 'zm-dg' }), dgTr = el('path', { 'class': 'zm-dg-tr' });
  var ramka = el('rect', { x: 150, width: 128, height: 96, rx: 4, 'class': 'zm-ramka' });
  // Состояние.
  var dogadka = +range.value, etap = 'zhdet', nachalo = 0, zvuk = null;
  function ton(f, dlit){
    try { zvuk = zvuk || new (window.AudioContext || window.webkitAudioContext)();
      var o = zvuk.createOscillator(), g = zvuk.createGain(); o.frequency.value = f; g.gain.value = 0.05; o.connect(g); g.connect(zvuk.destination);
      o.start(); g.gain.exponentialRampToValueAtTime(0.0001, zvuk.currentTime + dlit); o.stop(zvuk.currentTime + dlit); } catch (e) {}
  }
  function postavit(v){   // предмет на отметке v: центр снимка — на линии, но снимок целиком в сцене (у дна — выше линии)
    var y = yOf(v), fy = Math.max(4, Math.min(420 - 100, y - 48)); foto.setAttribute('y', fy); ramka.setAttribute('y', fy); sled.setAttribute('y2', y);
    schet.innerHTML = (etap === 'idet' ? (D.variant === 'glubina' ? 'Глубина: ' : 'Температура: ') : 'Твоя догадка: ') + '<b>' + fmt(v) + '</b> ' + D.edinica;
    metki.forEach(function(x){ var proshli = Math.abs(v - D.shkala[0]) >= Math.abs(x.m.v - D.shkala[0]);
      if (proshli && !x.li.classList.contains('proshli') && etap === 'idet') ton(660, 0.15);
      x.li.classList.toggle('proshli', proshli && etap !== 'zhdet'); x.line.classList.toggle('zm-m-proshli', proshli && etap !== 'zhdet'); });
  }
  function risovatDogadku(){
    var y = yOf(dogadka); dg.setAttribute('y1', y); dg.setAttribute('y2', y); dgTr.setAttribute('d', 'M150 ' + y + 'l-12 -7v14z');
    if (etap === 'zhdet') { dgEl.textContent = fmt(dogadka); postavit(D.shkala[0]); schet.innerHTML = 'Твоя догадка: <b>' + fmt(dogadka) + '</b> ' + D.edinica; }
  }
  range.addEventListener('input', function(){ if (etap !== 'zhdet') return; if (!nachalo) nachalo = Date.now(); dogadka = +range.value; risovatDogadku(); });
  // Палец прямо по шкале — тоже двигает догадку.
  svg.addEventListener('pointerdown', function(e){ if (etap !== 'zhdet') return;
    var r = svg.getBoundingClientRect(), y = (e.clientY - r.top) * 420 / r.height, v = D.shkala[0] + Math.sign(D.shkala[1] - D.shkala[0]) * Math.max(0, Math.min(1, (y - Y0) / (Y1 - Y0))) * L;
    range.value = v; dogadka = +range.value; if (!nachalo) nachalo = Date.now(); risovatDogadku(); });
  // Проверка: n остановок (по удару истории на каждой), последняя — настоящая цифра.
  function proverit(){
    if (etap !== 'zhdet') return;
    if (!nachalo) nachalo = Date.now();
    etap = 'idet'; root.dataset.sostoyanie = 'idet'; range.disabled = true; knopka.hidden = true;
    q('.zm-seychas').innerHTML = '<b>Смотри: ' + D.smotri + '. Под шкалой — история дня.</b>';
    var n = D.udary.length, k = 0, ot = D.shkala[0];
    (function sleduyushchiy(){
      var do_ = D.shkala[0] + (D.cel - D.shkala[0]) * (k + 1) / n, t0 = performance.now(), dlit = 3000;
      (function shag(t){
        var u = Math.min(1, (t - t0) / dlit), e2 = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        postavit(ot + (do_ - ot) * e2);
        if (u < 1) return requestAnimationFrame(shag);
        // Пауза — на чтение шага (≈12 знаков в секунду, не меньше 8 с): вся игра — 60–120 с.
        var chit = Math.max(8000, D.udary[k].length / 12 * 1000);
        tekst.textContent = D.udary[k]; ot = do_; k++;
        setTimeout(k < n ? sleduyushchiy : itog, chit);
      })(t0);
    })();
  }
  function itog(){
    etap = 'rezultat'; root.dataset.sostoyanie = 'rezultat'; ton(990, 0.5);
    var raz = Math.abs(dogadka - D.cel), dolya = raz / L;
    var ocenka = dolya < 0.05 ? 'Почти точно!' : dolya < 0.2 ? 'Близко.' : 'Далеко — настоящая цифра удивляет.';
    q('.zm-seychas').innerHTML = '<b>' + D.kulminaciya + '.</b>';
    tekst.textContent = ocenka + ' Твоя догадка — ' + fmt(dogadka) + ' ' + D.edinica + ', настоящая цифра — ' + D.celTekst + ': ошибка ' + fmt(raz) + ' ' + D.edinica + '.';
    setTimeout(function(){ fin.hidden = false; root.dataset.sostoyanie = 'fakt'; root.dataset.sekund = Math.round((Date.now() - nachalo) / 1000); }, 3000);
  }
  knopka.addEventListener('click', proverit);
  q('.zm-snova').addEventListener('click', function(){
    etap = 'zhdet'; root.dataset.sostoyanie = 'zhdet'; nachalo = 0; fin.hidden = true; knopka.hidden = false; range.disabled = false;
    q('.zm-seychas').innerHTML = '<b>' + D.seychas + '</b>'; tekst.textContent = 'Поставь новую догадку и нажми «Проверить».';
    metki.forEach(function(x){ x.li.classList.remove('proshli'); x.line.classList.remove('zm-m-proshli'); }); risovatDogadku();
  });
  risovatDogadku();
})();
