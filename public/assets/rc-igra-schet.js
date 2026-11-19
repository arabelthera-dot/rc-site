/* «Русская цивилизация» — подсчёт «начал игру — доиграл» (Р286 п.3). Без имён, без cookie, без localStorage.
 *
 * Включается одной настройкой: переменная репозитория PUBLIC_IGRY_SCHET='1' (src/lib/igry-schet.mjs) — тогда сборка
 * подключает этот файл к страницам дней. Пусто — файла на страницах нет, ни одного запроса.
 *
 * Игры ничего не знают о модуле — шлют событие страницы (без модуля оно просто никуда не уходит):
 *   document.dispatchEvent(new CustomEvent('rc-igra', {detail: {e: 'nachal' | 'vyigral' | 'proigral', igra: 'k278'}}))
 * Ключ дня — из адреса /muzei/<музей>/den[-shablon]/<ММ-ДД>/. На сервер уходит только
 *   GET /s/igra?m=<музей>&d=<ММ-ДД>&g=<игра>&e=<событие>
 * nginx отвечает 204 и пишет в свой журнал время и эту строку — без адреса посетителя (deploy/schet-igr/README.md).
 * За один заход на страницу: «начал» — один раз на игру, исход — один раз на игру (первый; повторные партии не считаются).
 */
(function (w, d) {
  'use strict';
  var HOST = 'russian-civilization.ru';               // зеркало, превью и локальная сборка не шлют
  var den = /\/muzei\/([a-z0-9-]+)\/den(?:-shablon)?\/(\d\d-\d\d)\/?$/.exec(location.pathname);
  if (!den || location.hostname !== HOST) return;
  var E = { nachal: 1, vyigral: 1, proigral: 1 }, sent = {};
  d.addEventListener('rc-igra', function (ev) {
    var x = ev.detail || {}, igra = String(x.igra || 'igra').replace(/[^a-z0-9-]/g, '').slice(0, 30) || 'igra';
    if (!E[x.e]) return;
    var key = igra + (x.e === 'nachal' ? ':n' : ':i');
    if (sent[key]) return;
    if (x.e !== 'nachal' && !sent[igra + ':n']) return;  // исход без начала (сбой разметки) не считаем
    sent[key] = 1;
    try {
      fetch('/s/igra?m=' + den[1] + '&d=' + den[2] + '&g=' + igra + '&e=' + x.e,
        { method: 'GET', keepalive: true, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' })
        .catch(function () {});
    } catch (e) { /* счёт никогда не ломает страницу */ }
  });
})(window, document);
