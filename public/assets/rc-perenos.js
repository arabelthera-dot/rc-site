/* Перенос прогресса посетителя (п.496 плана, Р745; флаг — src/lib/perenos.mjs). Страница /moy-progress/.
 * Что переносится: коллекция открытых дней (rc-return:<музей>, museum-return.js), серия дней (rc-privychka),
 * сохранённые ответы и рекорды игр дней (museum-…-vN, rc-ММ-ДД-…). Настройки (rc-cookie, rc-sv-…) — не прогресс, не трогаем.
 * Без сервера: файл JSON скачивается и читается в браузере; QR — ссылка на эту же страницу с данными после «#»
 * (часть после # на сервер не уходит). QR рисует qrcode-generator (MIT, assets/vendor/), своим файлом, не с CDN.
 * При загрузке прогресс СЛИВАЕТСЯ с тем, что уже есть: открытые дни и дни серии складываются, ничего не теряется. */
(function (w, d) {
  'use strict';
  var root = d.getElementById('rc-perenos');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var status = $('[data-status]');
  function skazat(t) { status.textContent = t; }

  function nashKlyuch(k) {
    return k.indexOf('rc-return:') === 0 || k === 'rc-privychka' || /^museum-[a-z0-9-]+-v\d+$/.test(k) || /^rc-\d\d-\d\d-/.test(k);
  }
  function sobrat(tolkoGlavnoe) {
    var out = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!nashKlyuch(k)) continue;
        if (tolkoGlavnoe && !(k.indexOf('rc-return:') === 0 || k === 'rc-privychka')) continue;
        out[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    return out;
  }
  function chitat(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function slit(k, nov) {
    var star = chitat(k), n;
    try { n = JSON.parse(nov); } catch (e) { return false; }
    if (k === 'rc-privychka' && star && n && Array.isArray(star.dni) && Array.isArray(n.dni)) {
      var vse = star.dni.concat(n.dni).filter(function (x, i, a) { return a.indexOf(x) === i; }).sort().slice(-60);
      n = { dni: vse };
    } else if (k.indexOf('rc-return:') === 0 && star && n) {
      var dni = star.days || {}, nd = n.days || {};
      Object.keys(nd).forEach(function (x) { if (!dni[x] || nd[x] < dni[x]) dni[x] = nd[x]; });
      var r = star.riddles || {}, nr = n.riddles || {};
      Object.keys(nr).forEach(function (x) { if (!r[x]) r[x] = nr[x]; });
      star.days = dni; star.riddles = r; n = star;
    }
    try { localStorage.setItem(k, JSON.stringify(n)); return true; } catch (e) { return false; }
  }
  function prinyat(obj) {
    if (!obj || obj.sajt !== 'russian-civilization.ru' || typeof obj.dannye !== 'object') { skazat('Это не файл прогресса нашего музея.'); return; }
    var n = 0;
    Object.keys(obj.dannye).forEach(function (k) { if (nashKlyuch(k) && slit(k, obj.dannye[k])) n++; });
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
    skazat(n ? 'Готово: прогресс загружен. Открытых дней в коллекции — ' + skolkoDney() + '.' : 'В файле нет прогресса.');
    pokazat();
  }
  function skolkoDney() {
    var n = 0, v = sobrat(true);
    Object.keys(v).forEach(function (k) { if (k.indexOf('rc-return:') === 0) { var s = chitat(k); if (s && s.days) n += Object.keys(s.days).length; } });
    return n;
  }
  function seriyaDney() { var s = chitat('rc-privychka'); return s && Array.isArray(s.dni) ? s.dni.length : 0; }
  function pokazat() {
    var n = skolkoDney(), s = seriyaDney();
    $('[data-skolko]').textContent = n || s
      ? 'Сейчас в этом браузере: открытых дней в коллекции — ' + n + ', дней, когда вы заходили, — ' + s + '.'
      : 'В этом браузере пока нет прогресса: откройте любой день в музее — он попадёт в коллекцию.';
  }
  function paket(tolkoGlavnoe) {
    return { sajt: 'russian-civilization.ru', v: 1, sohraneno: new Date().toISOString().slice(0, 10), dannye: sobrat(tolkoGlavnoe) };
  }
  function b64(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function izB64(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); return decodeURIComponent(escape(atob(s))); }

  $('[data-fajl]').addEventListener('click', function () {
    var p = paket(false), blob = new Blob([JSON.stringify(p, null, 1)], { type: 'application/json' });
    var a = d.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'moy-progress-' + p.sohraneno + '.json';
    d.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    skazat('Файл сохранён в «Загрузки». Чтобы вернуть прогресс, нажмите «Загрузить из файла» и выберите его.');
  });
  $('[data-vybor]').addEventListener('change', function (ev) {
    var f = ev.target.files && ev.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () { try { prinyat(JSON.parse(r.result)); } catch (e) { skazat('Файл не читается — возьмите файл, который сохранили здесь.'); } ev.target.value = ''; };
    r.readAsText(f);
  });
  $('[data-qr]').addEventListener('click', function () {
    var box = $('[data-qr-mesto]'), url = location.origin + location.pathname + '#p=' + b64(JSON.stringify(paket(true)));
    box.textContent = '';
    if (!w.qrcode) { skazat('QR-код не загрузился — сохраните прогресс файлом.'); return; }
    try {
      var q = w.qrcode(0, 'L'); q.addData(url, 'Byte'); q.make();
      box.innerHTML = q.createSvgTag({ cellSize: 4, margin: 4, scalable: true });
      var svg = box.querySelector('svg'); if (svg) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'QR-код с вашим прогрессом'); }
      box.hidden = false;
      skazat('Наведите камеру телефона на код и откройте ссылку — прогресс перейдёт на телефон.');
    } catch (e) { skazat('Прогресса слишком много для QR-кода — сохраните его файлом.'); }
  });

  // Пришли по ссылке из QR-кода: данные после «#p=».
  var m = /#p=([A-Za-z0-9_-]+)/.exec(location.hash);
  if (m) {
    try { prinyat(JSON.parse(izB64(m[1]))); } catch (e) { skazat('Ссылка из QR-кода повреждена — попробуйте ещё раз.'); }
    history.replaceState(null, '', location.pathname);
  }
  pokazat();
})(window, document);
