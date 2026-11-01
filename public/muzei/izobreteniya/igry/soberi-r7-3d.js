/* Игра 01-12 в 3D (Р392, Р412, Р521) — только загрузчик. До «Играть» в сцене — ролик-заставка (zastavka/, 4x5 на телефоне,
   16x10 шире): постер и файл берутся, лишь когда блок близко, ролик играет, только пока он на экране (не при
   prefers-reduced-motion и saveData). Сцена (three.js, three.quarks; Rapier она догрузит сама) — ТОЛЬКО по «Играть»,
   с полосой загрузки по реальным байтам. Слабый телефон (deviceMemory ≤ 2 или saveData) — сначала предложение
   плоской игры ниже (#games-2d) и «всё равно открыть 3D»; без WebGL 2 — текстовая версия и ссылка на 2D.
   Сцена — igry/soberi-r7-3d/scena.js (сборка из src/data/igry/izobreteniya/soberi-r7-3d.src.mjs). */
(function(){
  var root = document.getElementById('r3'); if (!root) return;
  var $ = function(id){ return document.getElementById(id); };
  var base = document.currentScript.src.replace(/[^\/]*$/, '') + 'soberi-r7-3d/';
  var RAZMER = 834150;   // байт в scena.js без сжатия — ставит сборка (Content-Length при gzip — сжатый)
  var stage = $('r3Stage'), video = $('r3Video'), started = false;
  var conn = navigator.connection || {};
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var igrat = !reduce && !conn.saveData;   // ролик крутим; иначе — только постер

  // ── Заставка ──
  var vidOn = false, vidSeen = false;
  var f = base + 'zastavka/r7-3d-zastavka-' + (window.matchMedia && matchMedia('(max-width:700px)').matches ? '4x5' : '16x10');
  function vidPoster(){ if (video && !started && !video.poster) video.poster = f + '.webp'; }   // блок близко — только постер
  function vidLoad(){                                                                          // блок на экране — сам ролик
    if (vidOn || started || !video) return; vidPoster();
    if (!igrat) return; vidOn = true;
    video.preload = 'metadata';
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function(t){
      var s = document.createElement('source'); s.src = f + '.' + t[0]; s.type = t[1]; video.appendChild(s);
    });
    video.load();
  }
  function vidPlay(){ if (vidOn && igrat && !started && vidSeen) { var p = video.play(); if (p && p.catch) p.catch(function(){}); } }
  function vidStop(){
    if (!video) return;
    video.pause(); video.hidden = true;
    while (video.firstChild) video.removeChild(video.firstChild);
    video.removeAttribute('src'); video.preload = 'none'; try { video.load(); } catch (e) {}
  }
  if (video && 'IntersectionObserver' in window) {
    new IntersectionObserver(function(es, o){ if (es[0].isIntersecting) { vidPoster(); o.disconnect(); } }, { rootMargin: '400px 0px' }).observe(stage);
    new IntersectionObserver(function(es){
      vidSeen = es[0].isIntersecting;
      if (vidSeen) { vidLoad(); vidPlay(); } else if (vidOn) video.pause();
    }, { threshold: 0.3 }).observe(stage);
  } else if (video) { vidLoad(); }

  // ── Запуск 3D ──
  function webgl(){
    try { var c = document.createElement('canvas'); return !!(window.WebGL2RenderingContext && c.getContext('webgl2')); } catch (e) { return false; }
  }
  function tekst(why){
    root.setAttribute('data-sostoyanie', 'tekst');
    $('r3Run').parentNode.hidden = true; $('r3Load').hidden = true; $('r3Slab').hidden = true; $('r3Text').hidden = false;
    $('r3Hint').textContent = why;
    $('r3Msg').textContent = 'Прочитай текстовую версию ниже — ход тот же.';
  }
  function proc(n){
    n = Math.max(0, Math.min(100, Math.round(n)));
    $('r3LoadBar').setAttribute('aria-valuenow', n); $('r3LoadFill').style.width = n + '%';
    $('r3LoadT').textContent = 'Загрузка 3D: ' + n + ' %';
  }
  // Читаем scena.js потоком ради процентов, потом import() того же адреса — браузер возьмёт из кеша.
  function skachat(url){
    if (!window.fetch || !window.ReadableStream) return Promise.resolve();
    return fetch(url).then(function(r){
      if (!r.ok || !r.body || !r.body.getReader) return;
      var rd = r.body.getReader(), got = 0;
      return (function chit(){ return rd.read().then(function(x){
        if (x.done) return; got += x.value.length; proc(got / RAZMER * 95); return chit();
      }); })();
    }).catch(function(){});
  }
  function start(){
    if (started) return; started = true;
    vidStop();
    root.setAttribute('data-sostoyanie', 'gruzit');
    $('r3Run').parentNode.hidden = true; $('r3Slab').hidden = true; $('r3Load').hidden = false; proc(0);
    $('r3Hint').textContent = 'Загружаю 3D-сцену…';
    var url = base + 'scena.js';
    skachat(url).then(function(){ return import(url); })
      .then(function(m){ proc(100); return m.zapusk(root, base); })
      .then(function(){ $('r3Load').hidden = true; })
      .catch(function(e){ console.warn('r7-3d', e); tekst('3D не загрузилось, поэтому игра — текстом.'); });
  }
  $('r3Run').addEventListener('click', function(){
    if (!webgl()) { vidStop(); tekst('Браузер не показывает 3D (нет WebGL 2), поэтому игра — текстом.'); return; }
    var slab = (navigator.deviceMemory && navigator.deviceMemory <= 2) || conn.saveData;
    if (slab) {
      root.setAttribute('data-sostoyanie', 'slab');
      $('r3Run').parentNode.hidden = true; $('r3Slab').hidden = false;
      $('r3Msg').textContent = 'Выбери: игра без 3D ниже или 3D-сцена.';
      return;
    }
    start();
  });
  $('r3Vse').addEventListener('click', start);
})();
