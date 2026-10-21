/* Картина во весь экран с увеличением (опись Р84, Б20, взгляд 19) — одна общая деталь на все музеи.
   Нажатие на картинку-ссылку (a > img, адрес — файл картинки) или на картинку в figure открывает её во весь экран.
   Приближение: пальцами (два касания), колесом мыши, двойным нажатием; перетаскивание — одним пальцем/мышью.
   Закрыть: крестик, Esc, нажатие по фону (без увеличения). Вид — public/assets/rc-uvelichenie.css (грузится при первом открытии).
   Без JavaScript ссылка открывает файл картинки как раньше. */
(function () {
  if (window.__rcUv) return; window.__rcUv = 1;
  var IMG_RE = /\.(jpe?g|png|webp|avif|gif)(\?|#|$)/i;
  var cssUrl = (document.currentScript && document.currentScript.src || '').replace(/\.js(\?.*)?$/, '.css');
  var box, im, cap, xb, back, s = 1, tx = 0, ty = 0, pts = {}, start = null, lastTap = 0, moved = false;

  function build() {
    if (box) return;
    if (cssUrl) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = cssUrl; document.head.appendChild(l); }
    box = document.createElement('div'); box.className = 'rc-uv'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Картина во весь экран');
    im = document.createElement('img'); im.className = 'rc-uv-img'; im.alt = ''; im.draggable = false;
    xb = document.createElement('button'); xb.type = 'button'; xb.className = 'rc-uv-x'; xb.setAttribute('aria-label', 'Закрыть'); xb.textContent = '×';
    cap = document.createElement('p'); cap.className = 'rc-uv-cap';
    box.appendChild(im); box.appendChild(xb); box.appendChild(cap); document.body.appendChild(box);
    xb.addEventListener('click', close);
    box.addEventListener('pointerdown', down); box.addEventListener('pointermove', move);
    box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
    box.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(e.clientX, e.clientY, s * (e.deltaY < 0 ? 1.2 : 1 / 1.2)); }, { passive: false });
    box.addEventListener('dblclick', function (e) { if (e.target === im) toggle(e.clientX, e.clientY); });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') { e.preventDefault(); xb.focus(); }
      else if (e.key === '+' || e.key === '=') zoomAt(innerWidth / 2, innerHeight / 2, s * 1.3);
      else if (e.key === '-') zoomAt(innerWidth / 2, innerHeight / 2, s / 1.3);
    });
  }
  function base() { return { x: im.offsetLeft, y: im.offsetTop, w: im.offsetWidth, h: im.offsetHeight }; }
  function apply() {
    if (s <= 1.01) { s = 1; tx = 0; ty = 0; }
    else { // не уводить картинку за край целиком
      var b = base(), w = b.w * s, h = b.h * s;
      var minX = Math.min(0, innerWidth - b.x - w), maxX = Math.max(0, -b.x);
      var minY = Math.min(0, innerHeight - b.y - h), maxY = Math.max(0, -b.y);
      if (w <= innerWidth) tx = (innerWidth - w) / 2 - b.x; else tx = Math.max(minX, Math.min(maxX, tx));
      if (h <= innerHeight) ty = (innerHeight - h) / 2 - b.y; else ty = Math.max(minY, Math.min(maxY, ty));
    }
    im.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
    box.classList.toggle('rc-uv-zoom', s > 1);
  }
  function zoomAt(cx, cy, ns) {
    ns = Math.max(1, Math.min(8, ns)); var b = base();
    var px = (cx - b.x - tx) / s, py = (cy - b.y - ty) / s; // точка картинки под пальцем остаётся на месте
    s = ns; tx = cx - b.x - px * s; ty = cy - b.y - py * s; apply();
  }
  function toggle(cx, cy) { if (s > 1) { s = 1; apply(); } else zoomAt(cx, cy, 2.5); }
  function list() { return Object.keys(pts).map(function (k) { return pts[k]; }); }
  function down(e) {
    if (e.target === xb) return;
    box.setPointerCapture && box.setPointerCapture(e.pointerId);
    pts[e.pointerId] = { x: e.clientX, y: e.clientY }; moved = false;
    var p = list();
    if (p.length === 2) start = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), s: s, cx: (p[0].x + p[1].x) / 2, cy: (p[0].y + p[1].y) / 2, tx: tx, ty: ty };
    else if (p.length === 1) start = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
  }
  function move(e) {
    if (!pts[e.pointerId] || !start) return;
    pts[e.pointerId] = { x: e.clientX, y: e.clientY }; var p = list();
    if (p.length === 2 && start.d) {
      var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), cx = (p[0].x + p[1].x) / 2, cy = (p[0].y + p[1].y) / 2;
      tx = start.tx; ty = start.ty; s = start.s; zoomAt(start.cx, start.cy, start.s * d / start.d);
      tx += cx - start.cx; ty += cy - start.cy; apply(); moved = true;
    } else if (p.length === 1 && start.x !== undefined) {
      var dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
      if (s > 1) { tx = start.tx + dx; ty = start.ty + dy; apply(); }
    }
  }
  function up(e) {
    var was = !!pts[e.pointerId]; delete pts[e.pointerId];
    var p = list();
    if (p.length === 1) start = { x: p[0].x, y: p[0].y, tx: tx, ty: ty }; else if (!p.length) start = null;
    if (!was || p.length || moved || e.type === 'pointercancel') return;
    if (e.pointerType === 'touch') { // двойное касание — приблизить/отдалить
      var now = Date.now();
      if (now - lastTap < 320) { lastTap = 0; toggle(e.clientX, e.clientY); return; }
      lastTap = now;
    }
    if (e.target === box || e.target === cap) { if (s === 1) close(); }
  }
  function open(src, alt, caption) {
    build(); back = document.activeElement;
    s = 1; tx = 0; ty = 0; pts = {}; start = null; im.style.transform = '';
    im.src = src; im.alt = alt || ''; cap.textContent = caption || '';
    box.hidden = false; document.documentElement.classList.add('rc-uv-open'); xb.focus();
  }
  function close() {
    if (!box || box.hidden) return;
    box.hidden = true; im.removeAttribute('src'); document.documentElement.classList.remove('rc-uv-open');
    if (back && back.focus) back.focus();
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var img = e.target.closest && e.target.closest('img'); if (!img || (box && box.contains(img))) return;
    var a = img.closest('a'), src;
    if (a) { var h = a.getAttribute('href') || ''; if (!IMG_RE.test(h)) return; src = a.href; }
    else if (img.closest('figure')) src = img.currentSrc || img.src; else return;
    if (img.closest('[data-rc-bez-uv], button, [role="button"], label')) return;
    var fig = img.closest('figure'), fc = fig && fig.querySelector('figcaption');
    e.preventDefault();
    open(src, img.alt, fc ? fc.textContent.replace(/\s+/g, ' ').trim() : img.alt);
  });
})();
