/* 3D-блок игры 01-12 (опыт Р392) — только загрузчик: сцена (three.js, three.quarks, Rapier) весит ~1 МБ
   и грузится, лишь когда блок доскроллили или нажали «Запустить 3D». Без WebGL — текстовая версия.
   Сцена — igry/soberi-r7-3d/scena.js (сборка из src/data/igry/izobreteniya/soberi-r7-3d.src.mjs). */
(function(){
  var root = document.getElementById('r3'); if (!root) return;
  var $ = function(id){ return document.getElementById(id); };
  var base = document.currentScript.src.replace(/[^\/]*$/, '') + 'soberi-r7-3d/';
  var started = false;
  function webgl(){
    try { var c = document.createElement('canvas'); return !!(window.WebGL2RenderingContext && c.getContext('webgl2')); } catch (e) { return false; }
  }
  function tekst(why){
    root.setAttribute('data-sostoyanie', 'tekst');
    $('r3Run').parentNode.hidden = true; $('r3Text').hidden = false;
    $('r3Hint').textContent = why;
    $('r3Msg').textContent = 'Прочитай текстовую версию ниже или сыграй в игру выше — ход тот же.';
  }
  function start(){
    if (started) return; started = true;
    if (io) io.disconnect();
    if (!webgl()) { tekst('Браузер не показывает 3D (нет WebGL 2), поэтому опыт — текстом.'); return; }
    root.setAttribute('data-sostoyanie', 'gruzit');
    $('r3Run').disabled = true; $('r3Hint').textContent = 'Загружаю 3D…';
    import(base + 'scena.js').then(function(m){ return m.zapusk(root, base); })
      .then(function(){ $('r3Run').parentNode.hidden = true; })
      .catch(function(e){ console.warn('r7-3d', e); started = false; tekst('3D не загрузилось, поэтому опыт — текстом.'); });
  }
  $('r3Run').addEventListener('click', start);
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function(es){ if (es[0].isIntersecting) start(); }, { rootMargin: '0px 0px -25% 0px' });
    io.observe($('r3Stage'));
  }
})();
