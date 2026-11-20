/* Визуализация дня 01-29 «Иван Сусанин»: лубок Сытина 1889 года «Жизнь за царя Ивана Сусанина» под лупой — общий движок museum-deep-zoom.js (OpenSeadragon). */
(function () {
  'use strict';
  if (window.MuseumDeepZoom) { window.MuseumDeepZoom.initAll(document.getElementById('vizual')); return; }
  var s = document.createElement('script');
  s.src = '/assets/museum-deep-zoom.js';
  document.head.appendChild(s);
})();
