// Визуализация «документ» (Р436): кнопка подсвечивает место на развороте записной книжки Тани Савичевой и объясняет его.
(function () {
  var skan = document.querySelector('#vz-knizhka .vz-skan'), citata = document.getElementById('vz-citata');
  if (!skan || !citata) return;
  skan.style.position = 'relative';
  var metka = document.createElement('div');
  metka.style.cssText = 'position:absolute;border:3px solid var(--gold,#c9a227);border-radius:6px;background:rgba(201,162,39,.18);pointer-events:none;display:none;transition:top .3s,height .3s,left .3s,width .3s';
  skan.appendChild(metka);
  document.querySelectorAll('#vz-knopki .chip').forEach(function (b) {
    b.addEventListener('click', function () {
      metka.style.left = b.dataset.x + '%'; metka.style.width = b.dataset.w + '%';
      metka.style.top = b.dataset.y + '%'; metka.style.height = b.dataset.h + '%'; metka.style.display = 'block';
      citata.textContent = b.dataset.citata;
      document.querySelectorAll('#vz-knopki .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    });
  });
})();
