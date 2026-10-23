/* igra-pravila.js — блок «Как играть» у каждой игры (Р199, 23.10.2026; 04-build §5-бис).
   Разметка — контракт Р199 (см. igra-pravila.css). Что делает:
   1. До «Начать» сцена игры неактивна: всё, что в секции игры идёт после блока, получает inert
      и data-igra-zamok, у секции — data-igra-ozhidaet.
   2. «Начать» снимает замок, сворачивает блок и шлёт на секции событие 'igra:start'.
   3. «Правила» внутри игры открывает блок поверх сцены с кнопкой «Продолжить» (Esc и тап мимо — закрыть).
   Секция игры — ближайший предок с data-igra-sekciya, иначе ближайший <section>. */
(function () {
  'use strict';
  var bloki = Array.prototype.slice.call(document.querySelectorAll('[data-igra-pravila]'));
  document.documentElement.classList.add('igra-pravila-js');
  if (!bloki.length) return;

  function sekciya(b) { return b.closest('[data-igra-sekciya]') || b.closest('section') || b.parentElement; }

  // Сцена — всё, что в секции после блока: следующие соседи блока и его предков до секции.
  function scena(b, s) {
    var out = [], el = b;
    while (el && el !== s) {
      for (var n = el.nextElementSibling; n; n = n.nextElementSibling) {
        if (!/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(n.tagName)) out.push(n);
      }
      el = el.parentElement;
    }
    return out;
  }

  // Фон и цвет текста для показа поверх сцены — первые непрозрачные у предков блока.
  function cvet(el, svoystvo) {
    for (; el && el.nodeType === 1; el = el.parentElement) {
      var c = getComputedStyle(el)[svoystvo];
      if (c && !/rgba\(.*,\s*0\)$|transparent/.test(c)) return c;
    }
    return '';
  }

  var otkryt = null; // { b, mesto, opener, fon }

  function zakryt() {
    if (!otkryt) return;
    var o = otkryt; otkryt = null;
    o.fon.remove();
    o.b.classList.remove('igra-pravila--poverh');
    o.b.removeAttribute('role'); o.b.removeAttribute('aria-modal');
    o.mesto.parentNode.insertBefore(o.b, o.mesto); o.mesto.remove();
    var start = o.b.querySelector('[data-igra-start]');
    if (start && start.dataset.igraTekst) start.textContent = start.dataset.igraTekst;
    if (o.b.dataset.igraNachata === '1') o.b.hidden = true;
    if (o.opener) o.opener.focus();
  }

  function pokazat(b, opener) {
    if (otkryt) zakryt();
    var fon = document.createElement('div');
    fon.className = 'igra-pravila-zatemnenie';
    fon.addEventListener('click', zakryt);
    var mesto = document.createComment('igra-pravila');
    b.parentNode.insertBefore(mesto, b);
    b.style.setProperty('--igra-pravila-fon', cvet(b, 'backgroundColor') || cvet(document.body, 'backgroundColor') || '#fff');
    b.style.setProperty('--igra-pravila-tekst', getComputedStyle(b).color);
    b.hidden = false;
    b.classList.add('igra-pravila--poverh');
    b.setAttribute('role', 'dialog'); b.setAttribute('aria-modal', 'true');
    document.body.appendChild(fon); document.body.appendChild(b);
    var start = b.querySelector('[data-igra-start]');
    if (start) {
      if (!start.dataset.igraTekst) start.dataset.igraTekst = start.textContent;
      if (b.dataset.igraNachata === '1') start.textContent = 'Продолжить';
      start.focus();
    }
    otkryt = { b: b, mesto: mesto, opener: opener, fon: fon };
  }

  function nachat(b, s, zamok) {
    b.dataset.igraNachata = '1';
    s.removeAttribute('data-igra-ozhidaet');
    zamok.forEach(function (el) { el.removeAttribute('inert'); el.removeAttribute('data-igra-zamok'); });
    b.hidden = true;
    s.dispatchEvent(new CustomEvent('igra:start', { bubbles: true }));
    var fokus = zamok.length && zamok[0].querySelector('button:not([disabled]):not([data-igra-pravila-open]), [tabindex="0"], input, select');
    if (fokus) fokus.focus({ preventScroll: true });
  }

  bloki.forEach(function (b) {
    var s = sekciya(b);
    if (!s) return;
    var zamok = scena(b, s);
    // Кнопки «Правила» в игре нет — ставим её первой строкой сцены, чтобы правила всегда можно было открыть.
    if (!s.querySelector('[data-igra-pravila-open]')) {
      var knopka = document.createElement('button');
      knopka.type = 'button'; knopka.className = 'igra-pravila-open'; knopka.setAttribute('data-igra-pravila-open', '');
      knopka.textContent = 'Правила';
      b.parentNode.insertBefore(knopka, b.nextSibling);
      zamok.unshift(knopka);
    }
    s.setAttribute('data-igra-ozhidaet', '');
    zamok.forEach(function (el) {
      if (el.hasAttribute('inert')) return; // свой inert страницы не трогаем
      el.setAttribute('inert', ''); el.setAttribute('data-igra-zamok', '');
    });
    zamok = zamok.filter(function (el) { return el.hasAttribute('data-igra-zamok'); });

    var start = b.querySelector('[data-igra-start]');
    if (start) start.addEventListener('click', function () {
      if (otkryt && otkryt.b === b) { zakryt(); return; }
      nachat(b, s, zamok);
    });
    s.addEventListener('click', function (e) {
      var o = e.target.closest && e.target.closest('[data-igra-pravila-open]');
      if (!o || !s.contains(o)) return;
      // Блок этой игры — последний блок секции до кнопки «Правила».
      var svoy = bloki.filter(function (x) {
        return sekciya(x) === s && (x === b || x.compareDocumentPosition(o) & Node.DOCUMENT_POSITION_FOLLOWING);
      }).pop();
      if (svoy === b) pokazat(b, o);
    });
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && otkryt) zakryt(); });
})();
