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
/* Игра «Сбей ракету» (27 января, «Эльбрус-2» в щите Москвы), r420-27. Радар 100×100 условных единиц, 1 км = 5 ед. */
(function () {
  var root = document.querySelector('[data-sr-igra]');
  if (!root) return;
  var ruka = igraRuka(root);
  var q = function (s) { return root.querySelector(s); };
  var cv = q('.sr-radar'), cx = cv.getContext('2d');
  var task = q('.sr-task'), sub = q('.sr-sub'), pusk = q('.sr-pusk');
  var avaria = q('.sr-avaria'), stoyka = q('.sr-stoyka'), restart = q('.sr-restart');
  var KM = 5, MOSKVA = { x: 50, y: 92 }, V_PRO = 42, VREMYA = [14, 11, 9];
  var tiho = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var s, raf = 0, prev = 0;

  function napisat(t, p) { task.innerHTML = '<b>Что сделать сейчас:</b> ' + t; if (p != null) sub.textContent = p; }
  function vibro() { if (navigator.vibrate) navigator.vibrate(20); }
  root.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    b.classList.add('igra-zhmyak'); setTimeout(function () { b.classList.remove('igra-zhmyak'); }, 90); vibro();
  });

  function novayaIgra() {
    s = { n: 0, sbito: 0, promah: 0, smeny: [], rezhim: 'zhdem' };
    q('.sr-finale').hidden = true; pusk.hidden = false;
    pusk.textContent = 'Начать дежурство'; ruka.na(pusk);
    napisat('Нажми «Начать дежурство»', 'Три цели летят к Москве. Каждая быстрее прежней.');
    tablo(); risovat();
  }
  function tablo() {
    q('.sr-cel').textContent = Math.min(s.n + 1, 3) + ' из 3';
    q('.sr-sbito').textContent = s.sbito;
    q('.sr-vremya').textContent = s.cel && s.rezhim !== 'zhdem' ? Math.max(0, (MOSKVA.y - 2 - s.cel.y) / s.cel.v).toFixed(1) + ' с' : '—';
  }
  function novayaCel() {
    var x0 = 18 + Math.random() * 64, T = VREMYA[s.n];
    var dx = MOSKVA.x - x0, dy = MOSKVA.y - 2, d = Math.hypot(dx, dy);
    s.cel = { x: x0, y: 0, ux: dx / d, uy: dy / d, v: d / T };
    s.tochka = null; s.pro = null; s.vzryv = null; s.t = 0;
    s.avariyaV = s.n === 0 ? -1 : T * (0.22 + Math.random() * 0.12);
    s.rezhim = 'navodka'; pusk.textContent = 'Пуск'; pusk.disabled = true;
    ruka.na(cv);
    napisat('Нажми на радар на пути цели, впереди неё', 'Пунктир — путь, который посчитал «Эльбрус». Точку ставь на нём.');
    prev = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(shag);
  }
  // Где будет цель, когда противоракета, пущенная сейчас, долетит до точки.
  function prizrak() {
    if (!s.tochka) return null;
    var tt = Math.hypot(s.tochka.x - MOSKVA.x, s.tochka.y - MOSKVA.y) / V_PRO;
    return { x: s.cel.x + s.cel.ux * s.cel.v * tt, y: s.cel.y + s.cel.uy * s.cel.v * tt };
  }
  function shag(ts) {
    var dt = prev ? Math.min(0.05, (ts - prev) / 1000) : 0; prev = ts;
    var c = s.cel;
    if (s.rezhim === 'navodka' || s.rezhim === 'polet' || s.rezhim === 'promah' || s.rezhim === 'avariya') {
      s.t += dt; c.x += c.ux * c.v * dt; c.y += c.uy * c.v * dt;
      if (s.rezhim === 'avariya') s.tAv += dt;
      if (s.avariyaV > 0 && s.t >= s.avariyaV && s.rezhim === 'navodka') sgorel();
      if (s.pro) {
        var p = s.pro, d = Math.hypot(s.tochka.x - p.x, s.tochka.y - p.y), hod = V_PRO * dt;
        if (d <= hod) { p.x = s.tochka.x; p.y = s.tochka.y; podryv(); }
        else { p.x += (s.tochka.x - p.x) / d * hod; p.y += (s.tochka.y - p.y) / d * hod; }
      }
      if (s.rezhim !== 'itog' && c.y >= MOSKVA.y - 2) proshla();
    }
    if (s.vzryv) s.vzryv.t += dt;
    tablo(); risovat();
    if (s.rezhim !== 'zhdem' && s.rezhim !== 'mezhdu' && !(s.rezhim === 'itog' && s.vzryv && s.vzryv.t > 1.6)) raf = requestAnimationFrame(shag);
  }
  cv.addEventListener('pointerdown', function (e) {
    if (s.rezhim !== 'navodka') return;
    var r = cv.getBoundingClientRect();
    s.tochka = { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 };
    pusk.disabled = false; ruka.na(pusk); vibro();
    napisat('Жми «Пуск», когда кольцо дойдёт до точки', 'Кольцо — где будет цель, когда долетит противоракета. Не дошло — рано, проскочило — поздно.');
  });
  pusk.addEventListener('click', function () {
    if (s.rezhim === 'zhdem') { novayaCel(); return; }
    if (s.rezhim === 'mezhdu') { s.n++; if (s.n >= 3) finale(); else novayaCel(); return; }
    if (s.rezhim !== 'navodka' || !s.tochka) return;
    s.pro = { x: MOSKVA.x, y: MOSKVA.y }; s.rezhim = 'polet'; pusk.disabled = true; ruka.ubrat();
    napisat('Противоракета в полёте…', 'Теперь решает точность: цель и противоракета должны встретиться.');
  });
  function sgorel() {
    s.rezhim = 'avariya'; s.tAv = 0; avaria.hidden = false; restart.disabled = true; pusk.disabled = true;
    stoyka.innerHTML = '';
    var plohoy = Math.floor(Math.random() * 6);
    for (var i = 0; i < 6; i++) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'sr-blok' + (i === plohoy ? ' sr-goryat' : '');
      b.textContent = 'Блок ' + (i + 1); b.setAttribute('aria-label', i === plohoy ? 'Блок ' + (i + 1) + ', горит' : 'Блок ' + (i + 1) + ', исправен');
      b.addEventListener('click', vybor.bind(null, b, i === plohoy)); stoyka.appendChild(b);
      if (i === plohoy) ruka.na(b);
    }
    napisat('Выдерни красный блок!', 'Цель летит, а экран погас. Считай секунды.');
  }
  function vybor(b, plohoy) {
    if (s.rezhim !== 'avariya') return;
    if (!plohoy) { b.classList.add('sr-mimo'); setTimeout(function () { b.classList.remove('sr-mimo'); }, 300); return; }
    b.classList.remove('sr-goryat'); b.classList.add('sr-zapas'); b.textContent = 'Запасной';
    restart.disabled = false; ruka.na(restart); napisat('Жми «Перезапуск»', null);
  }
  restart.addEventListener('click', function () {
    if (s.rezhim !== 'avariya') return;
    s.smeny.push(s.tAv); avaria.hidden = true; s.rezhim = 'navodka';
    if (s.tochka) { pusk.disabled = false; ruka.na(pusk); } else ruka.na(cv);
    napisat(s.tochka ? 'Жми «Пуск», когда кольцо дойдёт до точки' : 'Нажми на радар на пути цели, впереди неё', 'Машина снова считает. Блок сменён за ' + s.tAv.toFixed(1) + ' с.');
  });
  function podryv() {
    var c = s.cel, d = Math.hypot(c.x - s.tochka.x, c.y - s.tochka.y) / KM;
    s.vzryv = { x: s.tochka.x, y: s.tochka.y, t: 0, popal: d <= 1 };
    s.pro = null;
    if (d <= 1) { s.sbito++; s.rezhim = 'itog'; konecCeli('Цель сбита!', 'Промах всего ' + (d * 1000).toFixed(0) + ' м. Москва цела.'); }
    else { s.promah++; s.rezhim = 'promah'; s.tochka = null;
      napisat('Мимо: ' + d.toFixed(1) + ' км. Противоракет больше нет', 'Цель летит дальше…'); pusk.disabled = true; ruka.ubrat(); }
  }
  function proshla() {
    s.rezhim = 'itog'; avaria.hidden = true; s.vzryv = null;
    konecCeli('Цель прошла', 'Не успели. Следующая будет быстрее — пробуй.');
  }
  function konecCeli(h, t) {
    s.rezhim = 'itog';
    setTimeout(function () {
      s.rezhim = 'mezhdu'; pusk.disabled = false; pusk.textContent = s.n >= 2 ? 'Итог дежурства' : 'Следующая цель'; ruka.na(pusk);
      tablo();
    }, tiho ? 200 : 1700);
    napisat(h, t);
  }
  function finale() {
    s.rezhim = 'zhdem'; ruka.ubrat(); pusk.hidden = true; cancelAnimationFrame(raf);
    var bystro = s.smeny.length === 2 && s.smeny.every(function (x) { return x < 3; });
    var z = [['Сбиты хотя бы две цели', s.sbito >= 2], ['Сбиты все три', s.sbito === 3], ['Блок сменён быстрее трёх секунд оба раза', bystro]];
    q('.sr-fin-h').textContent = s.sbito === 3 ? 'Москва под щитом' : s.sbito ? 'Сбито ' + s.sbito + ' из 3' : 'Щит не сработал';
    q('.sr-fin-txt').textContent = 'Ты наводил и пускал, а считать путь цели успевала машина, которая делала по нескольку команд за один шаг.';
    q('.sr-zvezdy').innerHTML = z.map(function (x) { return '<li class="' + (x[1] ? 'sr-da' : '') + '">' + (x[1] ? '★ ' : '☆ ') + x[0] + '</li>'; }).join('');
    q('.sr-finale').hidden = false;
    if (s.sbito >= 2 && typeof window.award === 'function') window.award('lab', 30);
  }
  q('.sr-again').addEventListener('click', novayaIgra);

  function risovat() {
    var W = cv.width, k = W / 100, i;
    cx.fillStyle = '#04140c'; cx.fillRect(0, 0, W, W);
    cx.strokeStyle = 'rgba(80,220,140,.22)'; cx.lineWidth = 1;
    for (i = 1; i <= 4; i++) { cx.beginPath(); cx.arc(MOSKVA.x * k, MOSKVA.y * k, i * 22 * k, Math.PI, 2 * Math.PI); cx.stroke(); }
    cx.fillStyle = '#ffd666'; cx.font = 'bold ' + Math.round(4 * k) + 'px Inter,sans-serif'; cx.textAlign = 'center';
    cx.fillText('★ Москва', MOSKVA.x * k, (MOSKVA.y + 6) * k);
    if (!s || !s.cel || s.rezhim === 'zhdem') return;
    var c = s.cel, temno = s.rezhim === 'avariya';
    if (!temno) {
      cx.setLineDash([3 * k, 3 * k]); cx.strokeStyle = 'rgba(255,120,100,.5)';
      cx.beginPath(); cx.moveTo(c.x * k, c.y * k); cx.lineTo(MOSKVA.x * k, (MOSKVA.y - 2) * k); cx.stroke(); cx.setLineDash([]);
      cx.fillStyle = '#ff5a4a'; cx.beginPath(); cx.arc(c.x * k, c.y * k, 2.2 * k, 0, 7); cx.fill();
    }
    if (s.tochka) {
      cx.strokeStyle = '#6fe0a0'; cx.lineWidth = 2;
      cx.beginPath(); cx.arc(s.tochka.x * k, s.tochka.y * k, KM * k, 0, 7); cx.stroke();
      cx.beginPath(); cx.moveTo((s.tochka.x - 2) * k, s.tochka.y * k); cx.lineTo((s.tochka.x + 2) * k, s.tochka.y * k);
      cx.moveTo(s.tochka.x * k, (s.tochka.y - 2) * k); cx.lineTo(s.tochka.x * k, (s.tochka.y + 2) * k); cx.stroke();
      var g = s.rezhim === 'navodka' && prizrak();
      if (g) { cx.strokeStyle = 'rgba(255,214,102,.85)'; cx.beginPath(); cx.arc(g.x * k, g.y * k, 2.8 * k, 0, 7); cx.stroke(); }
    }
    if (s.pro) { cx.fillStyle = '#9ff'; cx.beginPath(); cx.arc(s.pro.x * k, s.pro.y * k, 1.6 * k, 0, 7); cx.fill(); }
    if (s.vzryv && s.vzryv.t < 1.6) {
      var v = s.vzryv, r = (3 + v.t * 14) * k, a = 1 - v.t / 1.6;
      cx.strokeStyle = v.popal ? 'rgba(255,214,102,' + a + ')' : 'rgba(160,200,255,' + a + ')'; cx.lineWidth = 3;
      cx.beginPath(); cx.arc(v.x * k, v.y * k, r, 0, 7); cx.stroke();
      if (v.popal) for (i = 0; i < 10; i++) { var u = i * 0.628 + 0.3; cx.fillStyle = 'rgba(255,150,80,' + a + ')';
        cx.fillRect(v.x * k + Math.cos(u) * r * 0.8, v.y * k + Math.sin(u) * r * 0.8, 1.4 * k, 1.4 * k); }
    }
    if (temno) { cx.fillStyle = 'rgba(0,0,0,.82)'; cx.fillRect(0, 0, W, W); }
  }
  novayaIgra();
})();
