/* igra-ruka — вид как у образца 29 янв. (ko-hand, rc-site e4f86d74), копия из soyuz-prichal.js (16 янв.): рука «тап-тап» над активной кнопкой. */
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

/* Игра «Обгони академиков» (25 января, машины С. Н. Корсакова, 1832), r410b — вариант А подготовки r335.
   Игрок втыкает штыри в планку признаков и протягивает её по перфорированной таблице: где под всеми штырями
   есть отверстия, карточка выпадает в ответ. Соперник — академик из комиссии 1832 года — перебирает карточки
   по одной (AK секунд на карточку). Раунд 2 — штырь «нет» (разность множеств), раунд 3 — штыри с весом
   (весовые коэффициенты Корсакова). Разметка — src/data/igry/izobreteniya/obgoni-akademikov.html.
   Все тексты — через textContent; глобальная award() — assets/museum-score.js. */
(function () {
  var root = document.querySelector('[data-oa-igra]');
  if (!root) return;
  var q = function (s) { return root.querySelector(s); };
  var ruka = igraRuka(root);

  var PRIZ = ['летает', 'в воде', 'охотится', 'птица', 'ночью', 'мех'];
  var BUK = 'LVHPNM';
  var KOLODA = [['Воробей', 'LP'], ['Сова', 'LPHN'], ['Летучая мышь', 'LNM'], ['Орёл', 'LPH'], ['Пингвин', 'VPH'], ['Утка', 'LVP'],
    ['Щука', 'VH'], ['Карась', 'V'], ['Бобр', 'VM'], ['Выдра', 'VHMN'], ['Волк', 'HMN'], ['Заяц', 'M'], ['Белка', 'M'], ['Пчела', 'L'],
    ['Стрекоза', 'LH'], ['Кит', 'V'], ['Тюлень', 'VHM'], ['Курица', 'P'], ['Лиса', 'HMN'], ['Комар', 'LN'], ['Чайка', 'LVPH'],
    ['Мышь', 'MN'], ['Лось', 'M'], ['Цапля', 'LVPH']];
  var N = KOLODA.length, AK = 1.25, SHTRAF = 5, PROTYAG = 1000;
  var AK_VSEGO = N * AK;
  // pravilo: штыри верного ответа (1 — «да», 2 — «нет»; в режиме ves — вес 1…3). Ответ раунда считается по ним, а не вписан руками.
  var RAUNDY = [
    { rezhim: 'da', zapros: 'Найди всех, кто летает и охотится.', pravilo: [1, 0, 1, 0, 0, 0] },
    { rezhim: 'net', zapros: 'Найди всех, кто летает и выходит ночью, но не птица.', pravilo: [1, 0, 0, 2, 1, 0] },
    { rezhim: 'ves', zapros: 'Кто подходит больше всех? Главное — живёт в воде (вес 3), важно — выходит ночью (вес 2), неплохо бы летать (вес 1).', pravilo: [1, 3, 0, 0, 2, 0] }
  ];

  var est = function (k, f) { return KOLODA[k][1].indexOf(BUK[f]) >= 0; };
  function otbor(shtyri, rezhim) {
    if (rezhim === 'ves') {
      var ball = KOLODA.map(function (_, k) { return shtyri.reduce(function (s, w, f) { return s + (est(k, f) ? w : 0); }, 0); });
      var mx = Math.max.apply(null, ball);
      return { kart: mx > 0 ? ball.map(function (b, k) { return b === mx ? k : -1; }).filter(function (k) { return k >= 0; }) : [], ball: ball };
    }
    return { kart: KOLODA.map(function (_, k) { return k; }).filter(function (k) {
      return shtyri.every(function (p, f) { return p === 0 || (p === 1 ? est(k, f) : !est(k, f)); });
    }) };
  }
  var ODINAK = function (a, b) { return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); };
  var imena = function (ks) { return ks.map(function (k) { return KOLODA[k][0]; }).join(', '); };
  var sek = function (t) { return (Math.round(t * 10) / 10).toFixed(1).replace('.', ',') + ' с'; };
  var sekCel = function (t) { return (t % 1 ? sek(t) : t + ' с'); };

  // ── Таблица: строки из колоды (textContent, без вставки HTML) ──
  var stroki = q('.oa-stroki'), polosa = q('.oa-polosa'), ryad = [];
  KOLODA.forEach(function (c, k) {
    var r = document.createElement('div'); r.className = 'oa-row';
    var im = document.createElement('span'); im.className = 'oa-name'; im.textContent = c[0]; r.appendChild(im);
    for (var f = 0; f < 6; f++) { var d = document.createElement('span'); d.className = 'oa-dyr' + (est(k, f) ? ' oa-est' : ''); r.appendChild(d); }
    var b = document.createElement('span'); b.className = 'oa-ball'; r.appendChild(b);
    r.setAttribute('aria-label', c[0] + ': ' + (PRIZ.filter(function (_, f) { return est(k, f); }).join(', ') || 'нет признаков'));
    stroki.appendChild(r); ryad.push(r);
  });

  var piny = [].slice.call(root.querySelectorAll('.oa-pin'));
  var tyani = q('.oa-tyani'), sbros = q('.oa-sbros'), dalshe = q('.oa-dalshe'), again = q('.oa-again');
  var fin = q('.oa-finale');
  var S = { r: 0, shtyri: [0, 0, 0, 0, 0, 0], sost: 'zhdu', t0: 0, shtraf: 0, t: 0, ty: [], tik: 0 };

  function zadacha(t) { q('.oa-task-t').textContent = t; }
  function poyasn(t, kl) { var p = q('.oa-sub'); p.textContent = t; p.className = 'oa-sub igra-poyasnenie' + (kl ? ' ' + kl : ''); }
  function otvet(t) { q('.oa-otvet-t').textContent = t; }

  function risPiny() {
    var rezhim = RAUNDY[S.r].rezhim;
    piny.forEach(function (p, f) {
      var v = S.shtyri[f];
      p.classList.toggle('oa-da', v > 0 && !(rezhim === 'net' && v === 2));
      p.classList.toggle('oa-net', rezhim === 'net' && v === 2);
      if (rezhim === 'ves' && v > 0) p.setAttribute('data-ves', String(v)); else p.removeAttribute('data-ves');
      var opis = v === 0 ? 'штыря нет' : rezhim === 'ves' ? 'штырь с весом ' + v : v === 2 ? 'штырь «нет»' : 'штырь «да»';
      p.setAttribute('aria-label', PRIZ[f].charAt(0).toUpperCase() + PRIZ[f].slice(1) + ': ' + opis);
      p.setAttribute('aria-pressed', v > 0 ? 'true' : 'false');
    });
  }
  function chistTabl() { ryad.forEach(function (r) { r.classList.remove('oa-vypala', 'oa-musor', 'oa-akad'); r.lastChild.textContent = ''; }); }
  function risTablo() {
    var i = Math.min(N, Math.floor(S.t / AK));
    q('.oa-ty').textContent = sek(S.t);
    q('.oa-ak').textContent = i >= N ? 'досмотрел все ' + N : 'карточка ' + (S.sost === 'zhdu' ? 0 : i + 1) + ' из ' + N;
    q('.oa-akbar i').style.width = (S.sost === 'zhdu' ? 0 : Math.min(100, (S.t / AK_VSEGO) * 100)) + '%';
    ryad.forEach(function (r, k) { r.classList.toggle('oa-akad', S.sost !== 'zhdu' && S.sost !== 'gotovo' && k === i && i < N); });
  }

  function nachatRaund(r) {
    S.r = r; S.shtyri = [0, 0, 0, 0, 0, 0]; S.sost = 'zhdu'; S.t = 0; S.shtraf = 0;
    clearInterval(S.tik);
    root.classList.remove('oa-proigr', 'oa-pobeda');
    root.classList.toggle('oa-ves', RAUNDY[r].rezhim === 'ves');
    fin.hidden = true; dalshe.hidden = true; tyani.hidden = false; sbros.hidden = false;
    tyani.disabled = false; sbros.disabled = false; piny.forEach(function (p) { p.disabled = false; });
    q('.oa-rn').textContent = 'Раунд ' + (r + 1) + ' из 3' + (RAUNDY[r].rezhim === 'net' ? ' · штырь «нет»' : RAUNDY[r].rezhim === 'ves' ? ' · штыри с весом' : '');
    q('.oa-zapros-t').textContent = RAUNDY[r].zapros;
    zadacha('Воткни штыри в планку — по запросу выше');
    poyasn(r === 0 ? 'Академик начнёт перебирать карточки, как только ты воткнёшь первый штырь.'
      : r === 1 ? 'Новое: нажми на гнездо второй раз — встанет красный штырь «нет». Третье нажатие вынимает штырь.'
      : 'Новое: каждое нажатие на гнездо прибавляет штырю вес — 1, 2, 3, потом штырь вынимается. Выпадет карточка с самой большой суммой.');
    otvet('пока пусто'); chistTabl(); risPiny(); risTablo(); ruka.ubrat();
  }

  function pusk() {
    if (S.sost !== 'zhdu') return;
    S.sost = 'idet'; S.t0 = performance.now();
    S.tik = setInterval(tik, 100);
  }
  function tik() {
    if (S.sost !== 'idet' && S.sost !== 'tyanu') return;
    S.t = (performance.now() - S.t0) / 1000 + S.shtraf;
    risTablo();
    if (S.t >= AK_VSEGO && S.sost === 'idet') proigrysh();
  }

  piny.forEach(function (p, f) {
    p.addEventListener('click', function () {
      if (S.sost !== 'zhdu' && S.sost !== 'idet') return;
      var mx = RAUNDY[S.r].rezhim === 'da' ? 1 : RAUNDY[S.r].rezhim === 'net' ? 2 : 3;
      S.shtyri[f] = (S.shtyri[f] + 1) % (mx + 1);
      pusk(); risPiny();
      var n = S.shtyri.filter(Boolean).length;
      zadacha(n ? 'Протяни планку — или поправь штыри' : 'Воткни штыри в планку — по запросу выше');
    });
  });
  sbros.addEventListener('click', function () {
    if (S.sost !== 'zhdu' && S.sost !== 'idet') return;
    S.shtyri = [0, 0, 0, 0, 0, 0]; risPiny(); chistTabl(); otvet('пока пусто');
    zadacha('Воткни штыри в планку — по запросу выше');
  });

  // Протянуть: нажатие или смахивание кнопки вниз (палец или мышь).
  var svaip = null, bylSvaip = false;
  tyani.addEventListener('pointerdown', function (e) { svaip = e.clientY; bylSvaip = false; });
  tyani.addEventListener('pointermove', function (e) { if (svaip !== null && e.clientY - svaip > 30 && !bylSvaip) { bylSvaip = true; protyanut(); } });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { tyani.addEventListener(t, function () { svaip = null; }); });
  tyani.addEventListener('click', function () { if (bylSvaip) { bylSvaip = false; return; } protyanut(); });

  function protyanut() {
    if (S.sost !== 'zhdu' && S.sost !== 'idet') return;
    if (!S.shtyri.some(Boolean)) { poyasn('Без штырей планка проваливается везде — сначала воткни штыри по запросу.', 'oa-ploho'); return; }
    var R = RAUNDY[S.r];
    var res = otbor(S.shtyri, R.rezhim), cel = otbor(R.pravilo, R.rezhim).kart;
    S.sost = 'tyanu'; tyani.disabled = true; sbros.disabled = true; piny.forEach(function (p) { p.disabled = true; });
    chistTabl(); otvet('…');
    var verno = ODINAK(res.kart, cel);
    polosa.classList.remove('oa-edet'); polosa.style.transform = 'translateY(0)';
    void polosa.offsetWidth;
    polosa.classList.add('oa-edet'); polosa.style.transform = 'translateY(' + (stroki.offsetHeight - 8) + 'px)';
    ryad.forEach(function (r, k) {
      setTimeout(function () {
        if (R.rezhim === 'ves') r.lastChild.textContent = res.ball[k] ? String(res.ball[k]) : '';
        if (res.kart.indexOf(k) >= 0) r.classList.add(verno || cel.indexOf(k) >= 0 ? 'oa-vypala' : 'oa-musor');
      }, (k + 1) * PROTYAG / N);
    });
    setTimeout(function () { itog(res.kart, cel, verno); }, PROTYAG + 60);
  }

  function itog(kart, cel, verno) {
    polosa.classList.remove('oa-edet'); polosa.style.transform = 'translateY(0)';
    S.t = (performance.now() - S.t0) / 1000 + S.shtraf;
    otvet(kart.length ? imena(kart) : 'пусто — ни одна карточка не выпала');
    if (verno && S.t < AK_VSEGO) {
      S.sost = 'gotovo'; clearInterval(S.tik); risTablo();
      S.ty[S.r] = S.t;
      if (typeof award === 'function') { if (S.r === 0) award('r1', 15); else if (S.r === 1) award('r2', 15); else award('r3', 20); }
      var akNa = Math.min(N, Math.floor(S.t / AK) + 1);
      if (S.r < 2) {
        poyasn('Есть! Машина нашла ответ за ' + sek(S.t) + ', а академик только на ' + akNa + '-й карточке из ' + N + '.', 'oa-horosho');
        zadacha('Жми «Следующий раунд»');
        tyani.hidden = true; sbros.hidden = true; dalshe.hidden = false; ruka.na(dalshe);
      } else pobeda();
      return;
    }
    S.sost = 'idet'; S.shtraf += SHTRAF;
    tyani.disabled = false; sbros.disabled = false; piny.forEach(function (p) { p.disabled = false; });
    var lishnie = kart.filter(function (k) { return cel.indexOf(k) < 0; });
    var t = !kart.length ? 'Пустой ответ: ни одна карточка не выпала — лишний или неверный штырь.'
      : RAUNDY[S.r].rezhim === 'ves' ? 'Мусор: выпало «' + imena(kart) + '» — проверь веса штырей.'
      : lishnie.length ? 'Мусор: выпало ' + kart.length + ', из них лишние — ' + imena(lishnie) + '. Не хватает штыря или стоит не тот.'
      : 'Неполный ответ: выпали не все, кто подходит. Лишний штырь?';
    poyasn(t + ' Минус ' + SHTRAF + ' секунд.', 'oa-ploho');
    zadacha('Поправь штыри и протяни снова');
    S.t = (performance.now() - S.t0) / 1000 + S.shtraf; risTablo();
    if (S.t >= AK_VSEGO) proigrysh();
  }

  function proigrysh() {
    S.sost = 'proigr'; clearInterval(S.tik);
    root.classList.add('oa-proigr');
    piny.forEach(function (p) { p.disabled = true; }); tyani.disabled = true; sbros.disabled = true;
    q('.oa-fin-h').textContent = 'Академик первым: «научил обходиться без разума»';
    q('.oa-fin-txt').textContent = 'Академик досмотрел все ' + N + ' карточки за ' + sekCel(AK_VSEGO) + ' и вынес приговор, как комиссия 1832 года: «Г-н Корсаков потратил слишком много разума на то, чтобы научить других обходиться без разума». С верными штырями машина быстрее — попробуй ещё раз.';
    q('.oa-fin-sravn').textContent = 'Ты — не успел, академик — ' + sekCel(AK_VSEGO);
    q('.oa-fin-raundy').textContent = '';
    again.textContent = 'Ещё раз — раунд ' + (S.r + 1);
    poyasn('Раунд проигран.', 'oa-ploho'); zadacha('Нажми «Ещё раз»');
    fin.hidden = false; ruka.na(again);
    fin.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function pobeda() {
    S.sost = 'pobeda'; root.classList.add('oa-pobeda');
    var ty = S.ty.reduce(function (a, b) { return a + b; }, 0), ak = AK_VSEGO * 3;
    q('.oa-fin-h').textContent = 'Машина обогнала академиков!';
    q('.oa-fin-txt').textContent = 'Так в 1832-м работал поисковик на перфокартах.';
    q('.oa-fin-sravn').textContent = 'Ты — ' + sek(ty) + ', академик — ' + sekCel(ak);
    var ul = q('.oa-fin-raundy'); ul.textContent = '';
    S.ty.forEach(function (t, i) { var li = document.createElement('li'); li.textContent = 'Раунд ' + (i + 1) + ': ты — ' + sek(t) + ', академик — ' + sekCel(AK_VSEGO); ul.appendChild(li); });
    again.textContent = 'Ещё раз';
    tyani.hidden = true; sbros.hidden = true; dalshe.hidden = true;
    poyasn('Три раунда — быстрее академика.', 'oa-horosho'); zadacha('Победа! Сыграть снова — «Ещё раз»');
    fin.hidden = false; ruka.ubrat();
    fin.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  dalshe.addEventListener('click', function () { ruka.ubrat(); nachatRaund(S.r + 1); });
  again.addEventListener('click', function () { ruka.ubrat(); if (S.sost === 'pobeda') { S.ty = []; nachatRaund(0); } else nachatRaund(S.r); });

  nachatRaund(0);
})();
