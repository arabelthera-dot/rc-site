/* Лупа на кадр (Р178) — одна общая деталь на все страницы музеев. Просмотрщик — PhotoSwipe v5 (npm, MIT),
   лежит на своём адресе assets/vendor/photoswipe/ и грузится только при первом открытии.
   Кадры размечает сборка (src/lib/lupa.mjs): img[data-lupa] — адрес полного файла, data-lupa-w/-h — его размер,
   data-lupa-srcset — копии разной ширины. Здесь: значок лупы в углу кадра, курсор, открытие по нажатию/Enter.
   Приближение: пальцами, двойным касанием, колесом/щелчком, клавиатурой. Подпись — под кадром на своём тёмном поле,
   место под неё вычитается из кадра; при приближении прячется (не ложится на изображение). Вид — rc-lupa.css.
   Глубокий зум (Р449): кадр с data-lupa-dzi (плитки Deep Zoom, режет сборка) открывается в OpenSeadragon (BSD-3,
   assets/vendor/openseadragon.min.js — тот же, что у museum-deep-zoom.js; грузится при первом открытии): кнопки сверху, кадр посередине, подпись снизу —
   три своих полосы, ничего не ложится на изображение. Щипок, двойное касание, колесо, клавиши +/−/0, Esc. */
(function () {
  if (window.__rcLupa) return; window.__rcLupa = 1;
  var me = document.currentScript && document.currentScript.src || '';
  var dir = me.replace(/[^/]*$/, '') + 'vendor/photoswipe/';
  var mod, css;

  function load() {
    if (!css) css = new Promise(function (ok) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = dir + 'photoswipe.css';
      l.onload = l.onerror = function () { ok(); }; document.head.appendChild(l);
    });
    if (!mod) mod = import(dir + 'photoswipe.esm.min.js');
    return Promise.all([mod, css]).then(function (r) { return r[0].default; });
  }

  function caption(img) {
    var fig = img.closest('figure'), fc = fig && fig.querySelector('figcaption');
    return (fc ? fc.textContent : img.alt || '').replace(/\s+/g, ' ').trim();
  }

  var probe;
  function capHeight(text, vw, vh) { // высота подписи для этой ширины экрана — столько места снизу отдаётся ей
    if (!text) return 0;
    if (!probe) { probe = document.createElement('div'); probe.className = 'rc-lupa-podpis rc-lupa-zamer'; probe.setAttribute('aria-hidden', 'true'); document.body.appendChild(probe); }
    probe.style.width = vw + 'px'; probe.textContent = text;
    return Math.min(probe.offsetHeight, Math.round(vh * 0.35));
  }

  function open(imgs, index) {
    load().then(function (PhotoSwipe) {
      var items = imgs.map(function (img) {
        return { src: img.dataset.lupa, srcset: img.dataset.lupaSrcset, width: +img.dataset.lupaW, height: +img.dataset.lupaH,
          msrc: img.currentSrc || img.src, alt: img.alt, element: img, caption: caption(img) };
      });
      var pswp = new PhotoSwipe({
        dataSource: items, index: index, bgOpacity: 1, showHideAnimationType: 'zoom',
        closeTitle: 'Закрыть (Esc)', zoomTitle: 'Приблизить или отдалить (Z)', arrowPrevTitle: 'Предыдущий кадр',
        arrowNextTitle: 'Следующий кадр', indexIndicatorSep: ' из ', errorMsg: 'Кадр не загрузился',
        paddingFn: function (vp, item) { var top = vp.x < 600 ? 52 : 60; return { top: top, bottom: capHeight(item.caption, vp.x, vp.y) || 16, left: 0, right: 0 }; }
      });
      pswp.on('uiRegister', function () {
        pswp.ui.registerElement({ name: 'rc-podpis', order: 9, isButton: false, appendTo: 'root', html: '',
          onInit: function (el) {
            el.className += ' rc-lupa-podpis';
            pswp.on('change', function () { el.textContent = pswp.currSlide.data.caption || ''; el.hidden = !el.textContent; });
          } });
      });
      pswp.on('afterInit', function () {
        pswp.element.setAttribute('aria-label', 'Кадр крупно');
        pswp.scrollWrap.setAttribute('aria-roledescription', 'кадры');
        pswp.element.querySelectorAll('[aria-roledescription="slide"]').forEach(function (e) { e.setAttribute('aria-roledescription', 'кадр'); });
      });
      pswp.init();
    });
  }

  var osd;
  function loadOsd() {
    if (!osd) osd = new Promise(function (ok, no) {
      if (window.OpenSeadragon) return ok(window.OpenSeadragon);
      var sc = document.createElement('script'); sc.src = me.replace(/[^/]*$/, '') + 'vendor/openseadragon.min.js';
      sc.onload = function () { ok(window.OpenSeadragon); }; sc.onerror = function () { osd = null; no(); }; document.head.appendChild(sc);
    });
    return osd;
  }

  function knopka(cls, label, text) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'rc-dz-k ' + cls;
    b.setAttribute('aria-label', label); b.title = label; b.textContent = text; return b;
  }

  function openDz(img) {
    var back = document.activeElement;
    var box = document.createElement('div'); box.className = 'rc-dz';
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Кадр крупно, глубокое приближение');
    var bar = document.createElement('div'); bar.className = 'rc-dz-bar';
    var plus = knopka('rc-dz-plus', 'Приблизить (+)', '+'), minus = knopka('rc-dz-minus', 'Отдалить (−)', '−'),
      home = knopka('rc-dz-home', 'Весь кадр (0)', '⤢'), close = knopka('rc-dz-close', 'Закрыть (Esc)', '×');
    bar.append(plus, minus, home, close);
    var pole = document.createElement('div'); pole.className = 'rc-dz-pole';
    var cap = caption(img), podpis = document.createElement('div'); podpis.className = 'rc-dz-podpis';
    podpis.textContent = cap; podpis.hidden = !cap;
    box.append(bar, pole, podpis);
    document.body.appendChild(box);
    document.documentElement.classList.add('rc-dz-otkryt');
    close.focus();
    var viewer;
    function shut() {
      document.removeEventListener('keydown', key, true);
      if (viewer) viewer.destroy();
      box.remove(); document.documentElement.classList.remove('rc-dz-otkryt');
      if (back && back.focus) back.focus();
    }
    function key(e) {
      if (e.key === 'Escape') { e.preventDefault(); shut(); }
      else if (e.key === 'Tab') { // фокус не уходит из окна
        var f = bar.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', key, true);
    close.addEventListener('click', shut);
    loadOsd().then(function (OSD) {
      if (!box.isConnected) return;
      viewer = OSD({
        element: pole, tileSources: img.dataset.lupaDzi, showNavigationControl: false, prefixUrl: '',
        visibilityRatio: 1, constrainDuringPan: true, maxZoomPixelRatio: 2, animationTime: 0.6, springStiffness: 9,
        immediateRender: true, preserveImageSizeOnResize: true, keyboardNavEnabled: false, // клавиши — свои, ниже
        gestureSettingsMouse: { clickToZoom: true, dblClickToZoom: false, scrollToZoom: true },
        gestureSettingsTouch: { pinchToZoom: true, dblClickToZoom: true, flickEnabled: true, clickToZoom: false }
      });
      plus.addEventListener('click', function () { viewer.viewport.zoomBy(2); viewer.viewport.applyConstraints(); });
      minus.addEventListener('click', function () { viewer.viewport.zoomBy(0.5); viewer.viewport.applyConstraints(); });
      home.addEventListener('click', function () { viewer.viewport.goHome(); });
      box.addEventListener('keydown', function (e) {
        if (e.key === '+' || e.key === '=') plus.click(); else if (e.key === '-' || e.key === '_') minus.click(); else if (e.key === '0') home.click(); else return;
        e.preventDefault();
      });
      viewer.addHandler('open-failed', function () { shut(); open([img], 0); }); // плиток нет — обычная лупа
    }, function () { shut(); open([img], 0); });
  }

  function kadry() { return Array.prototype.slice.call(document.querySelectorAll('img[data-lupa]')); }
  function go(img, e) {
    if (e) e.preventDefault();
    if (img.dataset.lupaDzi) return openDz(img);
    var all = kadry(); open(all, Math.max(0, all.indexOf(img)));
  }

  function znachok(img) { // значок лупы в правом нижнем углу кадра
    var a = img.closest('a');
    var ramka = img.parentElement;
    var z = document.createElement(a ? 'span' : 'button');
    z.className = 'rc-lupa-znak';
    if (a) { // ссылка на файл и так фокусируется: значок только виден, читалке — пояснение в ссылке
      z.setAttribute('aria-hidden', 'true');
      var sr = document.createElement('span'); sr.className = 'rc-lupa-sr'; sr.textContent = ' (открыть кадр крупно, можно приблизить)';
      a.appendChild(sr);
    } else {
      z.type = 'button'; z.setAttribute('aria-label', 'Рассмотреть кадр крупно: открыть с приближением');
      z.addEventListener('click', function (e) { go(img, e); });
    }
    if (getComputedStyle(ramka).position === 'static') ramka.classList.add('rc-lupa-ramka');
    img.insertAdjacentElement('afterend', z);
    function place() {
      var vis = img.offsetWidth > 60 && img.offsetHeight > 60;
      z.hidden = !vis; if (!vis) return;
      var x = img.offsetLeft + img.offsetWidth - z.offsetWidth - 8, y = img.offsetTop + img.offsetHeight - z.offsetHeight - 8;
      if (z.offsetParent !== img.offsetParent) { // разные опорные блоки — считаем от рамки
        var r = img.getBoundingClientRect(), p = (z.offsetParent || ramka).getBoundingClientRect();
        x = r.right - p.left - z.offsetWidth - 8; y = r.bottom - p.top - z.offsetHeight - 8;
      }
      z.style.left = x + 'px'; z.style.top = y + 'px';
    }
    place();
    if (window.ResizeObserver) new ResizeObserver(place).observe(img);
    img.addEventListener('load', place);
  }

  function start() {
    kadry().forEach(function (img) {
      img.classList.add('rc-lupa-kadr');
      znachok(img);
    });
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var img = e.target.closest && e.target.closest('img[data-lupa]');
    if (!img) { // нажатие по ссылке на файл (или значку в ней), в которой кадр
      var a = e.target.closest && e.target.closest('a');
      img = a && a.querySelector('img[data-lupa]');
      if (img && img.closest('a') !== a) img = null;
    }
    if (img) go(img, e);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
