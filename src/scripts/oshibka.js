// Ссылка «Нашли ошибку» в подвале: письмо со страницей и выделенным текстом. Вынесено из инлайна Base.astro
// ради CSP без 'unsafe-inline' (п.501, Р745).
(function () {
  var a = document.querySelector('a.oshibka[data-pochta]');
  if (!a) return;
  var v = '';
  function z() { v = String(window.getSelection ? window.getSelection() : '').trim().slice(0, 1500); }
  a.addEventListener('pointerdown', z, true);
  a.addEventListener('click', function () {
    if (!v) z();
    var u = a.dataset.stranica, b = 'Страница: ' + u + '\n\n' + (v ? 'Выделенный текст:\n«' + v + '»\n\n' : '') + 'Что не так:\n\n';
    a.href = 'mailto:' + a.dataset.pochta + '?subject=' + encodeURIComponent('Ошибка на странице ' + u) + '&body=' + encodeURIComponent(b);
    v = '';
  });
})();
