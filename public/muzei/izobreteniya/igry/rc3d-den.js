/* 3D-игра дня на движке rc3d (Р412, Р413) — только загрузчик; ставится на страницу дня, лишь если у дня есть igra.rc3d.
   До «Играть» в блоке — заставка: кадр (и ролик, если есть) rc3d/scen/<сцена>/zastavka/zastavka-{4x5|16x10}.{webp,webm,mp4};
   постер берётся, когда блок близко, ролик играет, только пока виден (не при prefers-reduced-motion и saveData).
   Движок (rc3d.js + чанки, three.js) — ТОЛЬКО по «Играть», с полосой загрузки по реальным байтам; потом сцена scen/<сцена>.json.
   Слабое устройство (Р432) общий блок игры дня assets/igra-dnya.js переключает на 2D ещё до заставки; здесь — только
   нет WebGL 2 по «Играть» или сцена не загрузилась за 8 с: тогда 2D сама встаёт на место 3D (window.IGRA_DNYA.v2d). */
(function(){
  var root = document.getElementById('rc3d'); if (!root) return;
  var $ = function(id){ return document.getElementById(id); };
  var base = document.currentScript.src.replace(/[^\/]*$/, '') + 'rc3d/';
  var VER = (document.currentScript.src.split('?')[1] || '').replace(/[^\w=&.-]/g, '');
  // Файлы движка и их размер в байтах — ставит сборка tools/rc3d/build.mjs (строку не править руками).
  var FAILY = [["rc3d.js",383628],["chunk-5RVP3HT4.js",59517],["chunk-PLEYQ2K3.js",596060]];
  var scen = root.getAttribute('data-s'), stage = $('rc3dStage'), video = $('rc3dVideo'), started = false, popytka = 0;
  var conn = navigator.connection || {};
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var igrat = !reduce && !conn.saveData;

  // ── Заставка ──
  var vidOn = false, vidSeen = false, rolik = root.getAttribute('data-zastavka');
  var f = base + 'scen/' + scen + '/zastavka/zastavka-' + (window.matchMedia && matchMedia('(max-width:700px)').matches ? '4x5' : '16x10');
  function vidPoster(){ if (video && rolik && !started && !video.poster) video.poster = f + '.webp'; }
  function vidLoad(){
    if (vidOn || started || !video) return; vidPoster();
    if (!igrat || rolik !== 'rolik') return; vidOn = true;
    video.preload = 'metadata';
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function(t){
      var s = document.createElement('source'); s.src = f + '.' + t[0]; s.type = t[1]; video.appendChild(s);
    });
    video.load();
  }
  function vidPlay(){ if (vidOn && !started && vidSeen) { var p = video.play(); if (p && p.catch) p.catch(function(){}); } }
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
  var vsego = FAILY.reduce(function(a, x){ return a + x[1]; }, 0), got = 0;
  function proc(p){
    p = Math.max(0, Math.min(100, Math.round(p)));
    $('rc3dLoadFill').style.width = p + '%'; $('rc3dLoadBar').setAttribute('aria-valuenow', p);
    $('rc3dLoadT').textContent = 'Загрузка 3D: ' + p + ' %';
  }
  // Читаем файлы движка потоком ради процентов, потом import() — браузер возьмёт из кеша.
  function skachat(q){
    if (!window.fetch || !window.ReadableStream) return Promise.resolve();
    got = 0;
    return Promise.all(FAILY.map(function(x){
      return fetch(base + x[0] + (x[0] === 'rc3d.js' && q ? '?' + q : '')).then(function(r){
        if (!r.ok || !r.body || !r.body.getReader) return;
        var rd = r.body.getReader();
        return (function chit(){ return rd.read().then(function(y){
          if (y.done) return; got += y.value.length; proc(got / vsego * 95); return chit();
        }); })();
      });
    })).catch(function(){});
  }
  var ID = window.IGRA_DNYA || { v2d: function(){}, zhdat: function(){}, gotovo: function(){} };
  function v2d(why){ vidStop(); ID.v2d(why); }
  function start(){
    if (started) return; started = true;
    vidStop();
    root.setAttribute('data-sostoyanie', 'gruzit');
    $('rc3dRun').parentNode.hidden = true; $('rc3dLoad').hidden = false; proc(0);
    $('rc3dHint').textContent = 'Загружаю 3D-сцену…';
    var q = [VER, popytka ? 'p=' + popytka : ''].filter(Boolean).join('&');
    var url = base + 'rc3d.js' + (q ? '?' + q : '');
    // Движок сам находит #rc3d, читает data-s и заменяет заставку своей сценой и игрой (avtozapusk в igrok.mjs).
    ID.zhdat();
    skachat(q).then(function(){ return import(url); })
      .then(function(){ proc(100); ID.gotovo(); })
      .catch(function(e){
        console.warn('rc3d', e); ID.v2d('oshibka');
      });
  }
  $('rc3dRun').addEventListener('click', function(){
    if (!webgl()) { v2d('net-webgl2'); return; }
    start();
  });
})();
