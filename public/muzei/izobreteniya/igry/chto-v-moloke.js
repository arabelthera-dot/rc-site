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

/* Игра «Что ещё есть в молоке» (20 января, Н. И. Лунин, Дерпт, 1880), r416-20.
   Две клетки, игрок сам собирает корм; 3 опыта по 30 дней (90 дней до защиты), 5 мышей.
   Доказательства: A — полная смесь с солями гибнет; B — мышь на выпаренном молоке живёт;
   C — после возражения Бунге «это кислота» полная смесь с солями и содой тоже гибнет. */
(function () {
  var root = document.querySelector('[data-vm-igra]');
  if (!root) return;
  var MISKI = [
    ['belok', 'Белок'], ['zhir', 'Жир'], ['sahar', 'Сахар'], ['soli', 'Все соли молока'],
    ['svezh', 'Свежее молоко'], ['vypar', 'Молоко, выпаренное на пару'], ['soda', 'Сода (совет руководителя)']
  ];
  var DNEY = 30, OPYTOV = 3, MYSHEY = 5;
  var ruka = igraRuka(root);
  var $ = function (s, el) { return (el || root).querySelector(s); };
  var kletki = Array.prototype.slice.call(root.querySelectorAll('.vm-kletka'));
  var pusk = $('.vm-pusk'), task = $('.vm-task'), sub = $('.vm-sub'), bunge = $('.vm-bunge');
  var st;

  var MYSH = '<svg viewBox="0 0 120 96" role="img" aria-label="Мышь в клетке и беговое колесо">' +
    '<g class="vm-koleso"><circle cx="84" cy="46" r="30" fill="none" stroke="#8a7550" stroke-width="3"/>' +
    '<path d="M84 16v60M54 46h60M63 25l42 42M105 25L63 67" stroke="#6b5a3c" stroke-width="2"/></g>' +
    '<rect x="81" y="76" width="6" height="16" fill="#6b5a3c"/>' +
    '<g class="vm-telo"><path d="M14 74c-10 2-12-8-4-10" fill="none" stroke="#c9a7a0" stroke-width="2.5"/>' +
    '<ellipse cx="38" cy="70" rx="24" ry="14" fill="#b8b0a6"/><circle cx="58" cy="62" r="10" fill="#c7c0b6"/>' +
    '<circle cx="54" cy="52" r="6" fill="#e3b8b0"/><circle cx="62" cy="61" r="2" fill="#1a1206"/>' +
    '<circle cx="68" cy="65" r="2" fill="#d77"/></g></svg>';

  function sudba(n) {
    if (n.vypar) return { den: 0, prichina: 'Бодрая, растолстела — живёт' };
    if (n.svezh) return { den: 4, prichina: 'Молоко скисло в тёплой комнате' };
    if (!(n.belok && n.zhir && n.sahar)) return { den: 7, prichina: 'Голод: в смеси нет основы' };
    if (!n.soli) return { den: n.soda ? 16 : 13, prichina: 'Без солей' };
    return { den: n.soda ? 29 : 24, prichina: n.soda ? 'Сода не спасла' : 'Даже со всеми солями' };
  }
  function polnaya(n) { return n.belok && n.zhir && n.sahar && n.soli && !n.svezh && !n.vypar; }

  function seychas(t, p) { task.innerHTML = '<b>Что сделать сейчас:</b> ' + t; if (p != null) sub.textContent = p; }
  function tablo() {
    $('.vm-dni').textContent = (OPYTOV - st.opyt) * DNEY + ' дн.';
    var m = $('.vm-myshi'); m.textContent = st.myshi; m.classList.toggle('vm-malo', st.myshi < 3);
    $('.vm-dok').textContent = (st.A + st.B + st.C) + ' из 3';
  }
  function narisovat() {
    kletki.forEach(function (k, i) {
      var korm = $('.vm-korm', k); korm.innerHTML = '';
      MISKI.forEach(function (m) {
        if (m[0] === 'soda' && !st.bunge) return;
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = m[1]; b.dataset.m = m[0];
        if (m[0] === 'soda') b.className = 'vm-soda';
        b.setAttribute('aria-pressed', st.korm[i][m[0]] ? 'true' : 'false');
        b.addEventListener('click', function () {
          if (st.idet || st.konec) return;
          st.korm[i][m[0]] = !st.korm[i][m[0]];
          b.setAttribute('aria-pressed', st.korm[i][m[0]] ? 'true' : 'false');
          podskazka();
        });
        korm.appendChild(b);
      });
      $('.vm-mysh-mesto', k).innerHTML = MYSH;
      k.classList.add('vm-bodr'); k.classList.remove('vm-slab', 'vm-mertv');
      $('.vm-den', k).textContent = 'День 0';
      var z = $('.vm-zdorovie i', k); z.style.width = '100%'; z.style.background = '#6fe0a0';
    });
  }
  function pusto(i) { return !MISKI.some(function (m) { return st.korm[i][m[0]]; }); }
  function podskazka() {
    if (st.konec || st.idet) return;
    if (pusto(0)) { seychas('Собери корм для левой клетки'); ruka.na($('.vm-korm button', kletki[0])); return; }
    if (pusto(1)) { seychas('Собери корм для правой клетки'); ruka.na($('.vm-korm button', kletki[1])); return; }
    seychas('Нажми «Кормить 30 дней»'); ruka.na(pusk);
  }

  function opyt() {
    if (st.idet || st.konec) return;
    if (pusto(0) || pusto(1)) { podskazka(); sub.textContent = 'Пустая миска — мышь просто умрёт с голоду. Положи корм в обе клетки.'; return; }
    st.idet = true; pusk.disabled = true; ruka.ubrat();
    seychas('Смотри на клетки', 'Дни бегут…');
    var s = st.korm.map(sudba), den = 0;
    kletki.forEach(function (k) { $('.vm-itog', k).className = 'vm-itog'; $('.vm-itog', k).textContent = '…'; });
    var shag = function () {
      den++;
      kletki.forEach(function (k, i) {
        $('.vm-den', k).textContent = 'День ' + den;
        var d = s[i].den, z = $('.vm-zdorovie i', k);
        var dolya = d ? Math.max(0, 1 - den / d) : 1;
        z.style.width = Math.round(dolya * 100) + '%';
        z.style.background = dolya > 0.5 ? '#6fe0a0' : dolya > 0.2 ? '#e9cf7e' : '#ff7a66';
        if (d && den >= d) { k.classList.remove('vm-bodr', 'vm-slab'); k.classList.add('vm-mertv'); }
        else if (d && dolya < 0.5) { k.classList.remove('vm-bodr'); k.classList.add('vm-slab'); }
      });
      if (den < DNEY) { st.t = setTimeout(shag, st.bystro ? 5 : 90); return; }
      itogOpyta(s);
    };
    shag();
  }

  function itogOpyta(s) {
    st.opyt++; st.idet = false; pusk.disabled = false;
    var bylBunge = st.bunge, novoe = [];
    s.forEach(function (r, i) {
      var n = st.korm[i], it = $('.vm-itog', kletki[i]);
      if (r.den) { st.myshi--; st.poteri++; it.className = 'vm-itog vm-gib'; it.textContent = 'Погибла на ' + r.den + '-й день. ' + r.prichina + '.'; }
      else { it.className = 'vm-itog vm-zhiv'; it.textContent = r.prichina + '.'; }
      if (!r.den && n.vypar && !st.B) { st.B = 1; novoe.push('мышь на молоке живёт'); }
      if (r.den && polnaya(n) && !n.soda && !st.A) { st.A = 1; novoe.push('полная смесь с солями не спасает'); }
      if (r.den && polnaya(n) && n.soda && bylBunge && !st.C) { st.C = 1; novoe.push('сода руководителя не помогла'); }
    });
    if (st.A && !st.bunge) {
      st.bunge = true;
      bunge.hidden = false;
      bunge.innerHTML = '<b>Руководитель:</b> «Мышей травит кислота из смеси. Добавь соду — и они выживут. Пока не проверишь, вывод не принимаю».';
    }
    if (st.C) bunge.innerHTML = '<b>Руководитель:</b> «Сода не помогла… Но в неизвестные вещества я всё равно не верю». Прав окажется ученик.';
    tablo();
    if (st.A && st.B && st.C) return final(true);
    if (st.opyt >= OPYTOV) return final(false, 'Дни кончились — пора на защиту, а доказательства не собраны.');
    if (st.myshi < 2) return final(false, 'Мышей не осталось — опыт не на ком повторить.');
    var ostalos = OPYTOV - st.opyt;
    sub.textContent = (novoe.length ? 'Доказано: ' + novoe.join(', ') + '. ' : 'Нового доказательства нет. ') +
      'Осталось опытов: ' + ostalos + ', мышей: ' + st.myshi + '.';
    st.korm = [{}, {}];
    var stary = sub.textContent;
    narisovat(); podskazka(); sub.textContent = stary;
  }

  function final(pobeda, pochemu) {
    st.konec = true; ruka.ubrat(); pusk.disabled = true;
    $('.vm-hod').hidden = true;
    var f = $('.vm-finale'); f.hidden = false;
    $('.vm-fin-h', f).textContent = pobeda ? 'Ты открыл витамины' : 'Защита провалена';
    $('.vm-fin-txt', f).textContent = pobeda
      ? 'Белок, жир, сахар и все соли — а жизни нет. Молоко — и мышь бодра. Значит, в настоящей еде есть ещё что-то, без чего жить нельзя. Это вывод Лунина 1880 года — за 32 года до того, как появилось слово «витамин».'
      : pochemu + ' Лунин в 1880 году собрал все три доказательства. Попробуй ещё раз.';
    var z = [[pobeda, 'Доказал: в еде есть что-то ещё'], [pobeda && st.opyt <= 2, 'Уложился в два опыта'], [pobeda && st.poteri <= 2, 'Не потерял ни одной лишней мыши']];
    $('.vm-zvezdy', f).innerHTML = z.map(function (x) { return '<li class="' + (x[0] ? 'vm-da' : '') + '">' + (x[0] ? '★ ' : '☆ ') + x[1] + '</li>'; }).join('');
    seychas(pobeda ? 'Прочитай, как было на самом деле' : 'Нажми «Ещё раз»', '');
    if (pobeda && typeof window.award === 'function') window.award('lab', 30);
    var again = $('.vm-again', f); ruka.na(again);
  }

  function start() {
    clearTimeout(st && st.t);
    st = { opyt: 0, myshi: MYSHEY, poteri: 0, A: 0, B: 0, C: 0, bunge: false, korm: [{}, {}], idet: false, konec: false, bystro: /[?&]igra-bystro/.test(location.search) };
    bunge.hidden = true; $('.vm-hod').hidden = false; pusk.disabled = false; $('.vm-finale').hidden = true;
    kletki.forEach(function (k, i) { var it = $('.vm-itog', k); it.className = 'vm-itog'; it.textContent = i ? 'Правая клетка' : 'Левая клетка'; });
    narisovat(); tablo(); podskazka();
    sub.textContent = 'До защиты диссертации 90 дней. В клетках — 5 мышей.';
  }
  root.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    b.classList.add('igra-zhmyak'); setTimeout(function () { b.classList.remove('igra-zhmyak'); }, 120);
    if (navigator.vibrate) try { navigator.vibrate(20); } catch (x) {}
  });
  pusk.addEventListener('click', opyt);
  $('.vm-again').addEventListener('click', start);
  start();
})();
