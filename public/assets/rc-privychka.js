/* «Русская цивилизация» — ежедневная привычка возвращаться (Р289 п.1). Без имён, без сервера, без cookie.
 *
 * Подключает сборка только при включённом флаге (src/lib/privychka.mjs): страницы дней и узел /segodnya/<ММ-ДД>/.
 * 1. «Поделиться итогом» — игры шлют событие страницы rc-igra (как для счёта игр, rc-igra-schet.js):
 *      document.dispatchEvent(new CustomEvent('rc-igra', {detail: {e: 'vyigral' | 'proigral', igra: '…', el?: узел игры}}))
 *    После исхода под игрой встаёт одна кнопка: текст-итог без ответа игры + ссылка на этот день.
 *    Web Share (телефон), где его нет — копирование в буфер.
 * 2. «Ты с нами N дней подряд» — даты заходов (только даты, до 60) в localStorage этого браузера.
 *    Серия мягкая: один пропущенный день её не обрывает (пропуск не засчитывается, но и не обнуляет).
 *    Показывается с двух дней, в строке .rc-pv-seriya блока «Завтра в музеях».
 * localStorage закрыт (приватное окно) — серии нет, страница не ломается.
 */
(function (w, d) {
  'use strict';
  var KEY = 'rc-privychka', MES = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа',
    'сентября', 'октября', 'ноября', 'декабря'];
  var den = /\/den(?:-shablon)?\/(\d\d)-(\d\d)\/?$/.exec(location.pathname);

  // ── серия ──
  function ymd(t) { var x = new Date(t); return x.getFullYear() + '-' + ('0' + (x.getMonth() + 1)).slice(-2) + '-' + ('0' + x.getDate()).slice(-2); }
  function dniMezhdu(a, b) { return Math.round((new Date(a + 'T12:00') - new Date(b + 'T12:00')) / 864e5); }
  function plural(n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; }
  function seriya() {
    var s, today = ymd(Date.now());
    try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return 0; }
    var dni = (Array.isArray(s.dni) ? s.dni : []).filter(function (x) { return /^\d{4}-\d\d-\d\d$/.test(x) && x <= today; });
    if (dni.indexOf(today) < 0) dni.push(today);
    dni.sort(); dni = dni.slice(-60);
    try { localStorage.setItem(KEY, JSON.stringify({ dni: dni })); } catch (e) { return 0; }
    var n = 1;
    for (var i = dni.length - 1; i > 0; i--) { if (dniMezhdu(dni[i], dni[i - 1]) <= 2) n++; else break; }
    return n;
  }
  function pokazatSeriyu() {
    var n = seriya(), p = d.querySelector('.rc-pv-seriya');
    if (!p || n < 2) return;
    p.textContent = 'Ты с нами ' + n + ' ' + plural(n, 'день', 'дня', 'дней') + ' подряд. Один пропущенный день серию не обрывает.';
    p.hidden = false;
    var s = p.closest('.rc-privychka'); if (s) s.hidden = false;
  }

  // ── поделиться итогом игры ──
  var lastClick;
  d.addEventListener('click', function (ev) { lastClick = ev.target; }, true);
  var sdelano = {};
  function uzelIgry(x) {
    var el = x.el && x.el.nodeType === 1 ? x.el : lastClick && lastClick.closest && lastClick.closest('section, #game, #games, #quiz');
    return el || d.querySelector('#game, #games, #quiz, section.block[class*="igra"]');
  }
  function tekst(pobeda) {
    var h1 = d.querySelector('h1'), zag = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : '';
    var kogda = den ? +den[2] + ' ' + MES[+den[1] - 1] : '';
    return (kogda ? kogda + ' в «Русской цивилизации»' : '«Русская цивилизация»') + (zag ? ': ' + zag : '') + '. '
      + (pobeda ? 'Игра дня пройдена — а ты сможешь?' : 'Игра дня в этот раз не далась — попробуй ты.');
  }
  function kopirovat(s) {
    if (navigator.clipboard && w.isSecureContext) return navigator.clipboard.writeText(s);
    return new Promise(function (ok, no) {
      var t = d.createElement('textarea'); t.value = s; t.setAttribute('readonly', ''); t.className = 'rc-pv-skryto';
      d.body.appendChild(t); t.select();
      try { d.execCommand('copy') ? ok() : no(); } catch (e) { no(e); } finally { t.remove(); }
    });
  }
  d.addEventListener('rc-igra', function (ev) {
    var x = ev.detail || {};
    if (x.e !== 'vyigral' && x.e !== 'proigral') return;
    var igra = String(x.igra || 'igra'), uzel = uzelIgry(x);
    if (!uzel || !uzel.parentNode) return;
    var url = location.origin + location.pathname, txt = tekst(x.e === 'vyigral');
    var box = sdelano[igra];
    if (!box) {
      box = d.createElement('div'); box.className = 'rc-pv-itog';
      box.innerHTML = '<button type="button" class="rc-pv-knopka">Поделиться итогом</button><span class="rc-pv-status" role="status" aria-live="polite"></span>';
      uzel.parentNode.insertBefore(box, uzel.nextSibling);
      sdelano[igra] = box;
      box.firstChild.addEventListener('click', function () {
        var st = box.lastChild, t = box.getAttribute('data-txt');
        st.textContent = '';
        if (navigator.share) {
          navigator.share({ title: d.title, text: t, url: url }).catch(function (e) { if (e && e.name !== 'AbortError') kop(); });
        } else kop();
        function kop() {
          kopirovat(t + ' ' + url).then(function () { st.textContent = 'Скопировано — вставь в сообщение.'; },
            function () { st.textContent = t + ' ' + url; });
        }
      });
    }
    box.setAttribute('data-txt', txt);  // повторная партия — итог последней
  });

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', pokazatSeriyu); else pokazatSeriyu();
})(window, document);
