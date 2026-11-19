/* Визуализация дня 02-22 «Скифские черепки»: обложка первой книги стихов Е. Кузьминой-Караваевой, 1912 — общий движок museum-deep-zoom.js (OpenSeadragon). */
(function () {
  'use strict';
  if (window.MuseumDeepZoom) { window.MuseumDeepZoom.initAll(document.getElementById('vizual')); return; }
  var s = document.createElement('script');
  s.src = '/assets/museum-deep-zoom.js';
  document.head.appendChild(s);
})();
