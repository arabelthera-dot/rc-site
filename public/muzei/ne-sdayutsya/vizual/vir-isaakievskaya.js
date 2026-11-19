/* Визуализация дня 01-14 «Коллекция ВИР»: рисунок Н. М. Быльева-Протопопова «Ленинград в блокаде», март 1942 года под лупой — общий движок museum-deep-zoom.js (OpenSeadragon). */
(function () {
  'use strict';
  if (window.MuseumDeepZoom) { window.MuseumDeepZoom.initAll(document.getElementById('vizual')); return; }
  var s = document.createElement('script');
  s.src = '/assets/museum-deep-zoom.js';
  document.head.appendChild(s);
})();
