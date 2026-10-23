/* Лупа на кадр (Р178) — одна общая деталь на все страницы музеев. Просмотрщик — PhotoSwipe v5 (npm, MIT),
   лежит на своём адресе assets/vendor/photoswipe/ и грузится только при первом открытии.
   Кадры размечает сборка (src/lib/lupa.mjs): img[data-lupa] — адрес полного файла, data-lupa-w/-h — его размер,
   data-lupa-srcset — копии разной ширины. Здесь: значок лупы в углу кадра, курсор, открытие по нажатию/Enter.
   Приближение: пальцами, двойным касанием, колесом/щелчком, клавиатурой. Подпись — под кадром на своём тёмном поле,
   место под неё вычитается из кадра; при приближении прячется (не ложится на изображение). Вид — rc-lupa.css. */
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

  function kadry() { return Array.prototype.slice.call(document.querySelectorAll('img[data-lupa]')); }
  function go(img, e) {
    if (e) e.preventDefault();
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
