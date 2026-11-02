/* Игра дня (Р432): 3D-модель предмета наверху страницы, сразу под обложкой и хуком. 2D — не вторая игра и не выбор:
   она сама встаёт на место 3D на слабом устройстве — нет WebGL, память ≤ 2 ГБ (navigator.deviceMemory), экономия трафика
   (saveData) или сеть 2g/3g (effectiveType), либо 3D не загрузилась за 8 с. 2D-игра лежит в <template id="igra2d">,
   её скрипты (data-skripty) грузятся только при переключении. Нет 2D — блок убирается целиком.
   Блок с моделью (.glb, data-glb) ведёт этот файл; 3D-сцену движка rc3d — igry/rc3d-den.js через window.IGRA_DNYA.
   Режим — в <html data-igra-rezhim="3d|2d" data-igra-prichina="…"> (для проверки машиной). Разметку рисует шаблон дня. */
(function(){
  var blok = document.querySelector('[data-igra-dnya]'); if (!blok) return;
  var html = document.documentElement, tpl = document.getElementById('igra2d');
  var src = document.currentScript.src, base = src.replace(/[^\/]*$/, ''), ver = src.split('?')[1];
  var conn = navigator.connection || {}, zhdu = 0, gotov = false, v2 = false, stop = null;
  function webgl(){
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
  }
  function prichina(){
    if (!webgl()) return 'net-webgl';
    if (navigator.deviceMemory && navigator.deviceMemory <= 2) return 'pamyat';
    if (conn.saveData) return 'ekonomiya';
    if (/^(slow-2g|2g|3g)$/.test(conn.effectiveType || '')) return 'set';
    return '';
  }
  function skripty(list){
    if (!list.length) return;
    var s = document.createElement('script'); s.src = list[0];
    s.onload = s.onerror = function(){ skripty(list.slice(1)); };
    document.body.appendChild(s);
  }
  function v2d(why){
    if (v2 || gotov) return; v2 = true; clearTimeout(zhdu);
    if (stop) try { stop(); } catch (e) {}
    html.setAttribute('data-igra-rezhim', tpl ? '2d' : 'net'); html.setAttribute('data-igra-prichina', why);
    if (!tpl) { blok.parentNode.removeChild(blok); return; }
    // 2D встаёт на место 3D и наследует её якорь и метку сцены: ссылки #games и проверка машиной ([data-igra-scena]) ведут к ней.
    var f = tpl.content.cloneNode(true), el = f.firstElementChild;
    blok.parentNode.replaceChild(f, blok);
    if (el) { if (!document.getElementById('games')) el.id = 'games'; el.setAttribute('data-igra-scena', ''); el.setAttribute('data-igra-2d', why); }
    skripty(JSON.parse(tpl.getAttribute('data-skripty') || '[]'));
  }
  function zhdat(){ clearTimeout(zhdu); zhdu = setTimeout(function(){ v2d('8s'); }, 8000); }
  function gotovo(){ if (v2) return; gotov = true; clearTimeout(zhdu); html.setAttribute('data-igra-rezhim', '3d'); }
  window.IGRA_DNYA = { v2d: v2d, zhdat: zhdat, gotovo: gotovo };
  var p = prichina(); if (p) { v2d(p); return; }
  html.setAttribute('data-igra-rezhim', '3d');
  var glb = blok.getAttribute('data-glb'); if (!glb) return;
  var $ = function(id){ return document.getElementById(id); };
  function proc(x){ x = Math.round(Math.max(0, Math.min(1, x)) * 100); $('igdFill').style.width = x + '%'; $('igdT').textContent = 'Загрузка 3D: ' + x + ' %'; }
  zhdat();
  import(base + 'igra-dnya/model3d.js' + (ver ? '?' + ver : ''))
    .then(function(m){ proc(0.1); return m.pokazat($('igdStage'), glb, { progress: function(x){ proc(0.1 + x * 0.9); } }); })
    .then(function(r){ stop = r.stop; if (v2) { r.stop(); return; } gotovo(); $('igdLoad').hidden = true; $('igdStage').setAttribute('data-gotovo', ''); })
    .catch(function(e){ console.warn('igra-dnya', e); v2d('oshibka'); });
})();
