/* Курсы (п.506, Р746, src/lib/kursy.mjs): отметка пройденных дней и тест «N из M».
 * Пройденный день — открыт в этом браузере: ключ rc-return:<музей>.days[ММ-ДД] (museum-return.js, п.496 «Мой прогресс»).
 * Итог теста — rc-kurs:<id> = {otvet: N, iz: M}. localStorage закрыт — отметок нет, тест работает. */
(function (d) {
  var root = d.getElementById('rc-kurs'); if (!root) return;
  var chitat = function (k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
  var dni = root.querySelectorAll('.rc-kurs-dni [data-den]'), n = 0;
  for (var i = 0; i < dni.length; i++) {
    var li = dni[i], s = chitat('rc-return:' + li.getAttribute('data-muzey'));
    if (s.days && s.days[li.getAttribute('data-den')]) { n++; li.querySelector('.rc-kurs-metka').hidden = false; }
  }
  var p = root.querySelector('[data-proideno]');
  if (n) { p.textContent = 'Пройдено ' + n + ' из ' + dni.length + (n === dni.length ? ' — пора к тесту.' : '.'); p.hidden = false; }
  var KEY = 'rc-kurs:' + root.getAttribute('data-kurs'), vse = root.querySelectorAll('.rc-kurs-v'), otvecheno = 0, verno = 0;
  var itog = root.querySelector('[data-itog]'), byl = chitat(KEY);
  if (byl.iz) itog.textContent = 'Прошлый итог: ' + byl.otvet + ' из ' + byl.iz + '.';
  Array.prototype.forEach.call(vse, function (v) {
    var a = +v.getAttribute('data-a');
    v.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-o]'); if (!b || v.hasAttribute('data-gotovo')) return;
      v.setAttribute('data-gotovo', ''); otvecheno++;
      var ok = +b.getAttribute('data-o') === a; if (ok) verno++;
      b.setAttribute(ok ? 'data-verno' : 'data-neverno', '');
      if (!ok) v.querySelector('button[data-o="' + a + '"]').setAttribute('data-verno', '');
      v.querySelector('.rc-kurs-e').hidden = false;
      if (otvecheno === vse.length) {
        itog.textContent = 'Итог: ' + verno + ' из ' + vse.length + '.';
        try { localStorage.setItem(KEY, JSON.stringify({ otvet: verno, iz: vse.length })); } catch (x) { /* приватное окно */ }
      }
    });
  });
})(document);
