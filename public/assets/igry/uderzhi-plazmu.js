/* Механика uderzhi-plazmu (первый день — 02-25 «Изобретений», первый в мире токамак Т-1): держишь раскалённую плазму
   в магнитной бутылке, не давая ей коснуться стенок. Плазма сама стремится к стенкам, её толкают завихрения; магнитный
   держатель (мышь, палец или стрелки) тянет её обратно к центру. Продержись cel_sekund секунд — победа. Всё из dannye
   (схема в src/lib/igry-mehaniki.ts): размеры, силы, все тексты. На холсте — только рисунок (бутылка, плазма, держатель,
   дуга времени) без надписей и эмодзи (Р18); слова — вёрсткой под холстом. */
RCIgry.dvizhok('uderzhi-plazmu', function(ctx){
  var d = ctx.dannye, m = ctx.mesto;
  var KRUG = Math.PI * 2;

  m.innerHTML = '<div style="position:relative;aspect-ratio:4/3;background:#05070c;border:1px solid rgba(255,255,255,.08);' +
    'border-radius:12px;overflow:hidden;touch-action:none;margin-bottom:6px">' +
    '<canvas role="img" tabindex="0" style="display:block;width:100%;height:100%;cursor:crosshair;touch-action:none;outline:none"></canvas></div>' +
    '<div style="font-size:14px;color:var(--muted);text-align:center;min-height:1.4em" data-schet></div>';
  var cv = m.querySelector('canvas'), g = cv.getContext('2d'), schetEl = m.querySelector('[data-schet]');
  cv.setAttribute('aria-label', d.derzhatel_ru);

  var W, H, cx, cy, R, pr, dr;        // геометрия: центр, радиус бутылки, плазмы, зона захвата
  var px, py, vx, vy, kx, ky;         // плазма (положение и скорость), держатель
  var derzhit = false;                 // держатель сейчас над плазмой
  var start, koncheno = false, vyigral = false;

  function resize(){
    W = cv.width = cv.offsetWidth || 320; H = cv.height = cv.offsetHeight || 240;
    cx = W / 2; cy = H / 2;
    R = Math.min(W, H) / 2 * d.butylka; pr = R * d.plazma; dr = R * d.derzhatel;
  }
  resize(); window.addEventListener('resize', resize);

  function vKeeper(x, y){
    var r = cv.getBoundingClientRect();
    kx = (x - r.left) * (W / r.width); ky = (y - r.top) * (H / r.height);
    kx = Math.max(0, Math.min(W, kx)); ky = Math.max(0, Math.min(H, ky));
  }
  cv.addEventListener('pointermove', function(e){ vKeeper(e.clientX, e.clientY); });
  cv.addEventListener('pointerdown', function(e){ vKeeper(e.clientX, e.clientY); cv.focus(); });

  // Клавиатура: Tab до холста, стрелками двигаешь держатель.
  cv.addEventListener('keydown', function(e){
    var shag = R / 22, dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') dx = -shag; else if (e.key === 'ArrowRight') dx = shag;
    else if (e.key === 'ArrowUp') dy = -shag; else if (e.key === 'ArrowDown') dy = shag; else return;
    e.preventDefault();
    kx += dx; ky += dy;
    kx = Math.max(0, Math.min(W, kx)); ky = Math.max(0, Math.min(H, ky));
  });

  function zanovo(){
    ctx.itog('');
    px = cx; py = cy; vx = 0; vy = 0; kx = cx; ky = cy;
    derzhit = true; koncheno = false; vyigral = false;
    start = performance.now();
    schetEl.textContent = d.schet_ru.replace('{s}', d.cel_sekund);
  }

  function risovat(){
    g.clearRect(0, 0, W, H);
    // фон — тёмный зал
    var gr = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * .7);
    gr.addColorStop(0, '#0a1420'); gr.addColorStop(1, '#03050a');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // магнитные силовые линии внутри бутылки — пунктирные кольца
    g.strokeStyle = 'rgba(96,178,224,.14)'; g.lineWidth = 1; g.setLineDash([3, 7]);
    for (var i = 1; i <= 2; i++){ g.beginPath(); g.arc(cx, cy, R * i / 3, 0, KRUG); g.stroke(); }
    g.setLineDash([]);
    // дуга времени — сколько секунд уже продержался
    var proshlo = start ? Math.min(1, (performance.now() - start) / 1000 / d.cel_sekund) : 0;
    if (proshlo > 0){
      g.beginPath(); g.arc(cx, cy, R + 7, -Math.PI / 2, -Math.PI / 2 + KRUG * proshlo);
      g.strokeStyle = vyigral ? '#7ed4a0' : '#e4c97a'; g.lineWidth = 4; g.stroke();
    }
    // стенка бутылки — светящееся кольцо
    g.save(); g.shadowColor = '#2d8cbf'; g.shadowBlur = 14;
    g.beginPath(); g.arc(cx, cy, R, 0, KRUG);
    g.strokeStyle = 'rgba(126,190,220,.9)'; g.lineWidth = 3; g.stroke(); g.restore();
    // держатель — кольцо с перекрестием
    g.save();
    if (derzhit){ g.shadowColor = '#7ed4a0'; g.shadowBlur = 16; g.strokeStyle = '#7ed4a0'; }
    else { g.strokeStyle = 'rgba(255,255,255,.55)'; }
    g.lineWidth = 2.5;
    g.beginPath(); g.arc(kx, ky, dr * .45, 0, KRUG); g.stroke();
    g.beginPath(); g.moveTo(kx - dr * .22, ky); g.lineTo(kx + dr * .22, ky);
    g.moveTo(kx, ky - dr * .22); g.lineTo(kx, ky + dr * .22); g.stroke();
    g.restore();
    // плазма — раскалённое ядро
    g.save(); g.shadowColor = '#f2c94c'; g.shadowBlur = 22;
    var pg = g.createRadialGradient(px - pr * .3, py - pr * .3, pr * .1, px, py, pr);
    pg.addColorStop(0, '#fff4cf'); pg.addColorStop(.45, '#f2c94c'); pg.addColorStop(1, '#c9821e');
    g.beginPath(); g.arc(px, py, pr, 0, KRUG); g.fillStyle = pg; g.fill(); g.restore();
  }

  function kadr(){
    if (!koncheno){
      var proshlo = (performance.now() - start) / 1000;
      var ost = Math.max(0, Math.ceil(d.cel_sekund - proshlo));
      schetEl.textContent = d.schet_ru.replace('{s}', ost);
      // плазма сама стремится к стенкам + случайные завихрения
      vx += (px - cx) * d.rastalkivanie; vy += (py - cy) * d.rastalkivanie;
      vx += (Math.random() - .5) * 2 * d.turbulentnost * R; vy += (Math.random() - .5) * 2 * d.turbulentnost * R;
      // держатель тянет плазму к центру, пока она под ним
      var dk = Math.hypot(kx - px, ky - py);
      derzhit = dk < dr;
      if (derzhit){
        var dl = Math.hypot(cx - px, cy - py) || 1;
        vx += (cx - px) / dl * d.sila * R; vy += (cy - py) / dl * d.sila * R;
      }
      vx *= .985; vy *= .985;
      px += vx; py += vy;
      // коснулась стенки — неудача
      if (Math.hypot(px - cx, py - cy) + pr >= R){
        px = cx + (px - cx) / (Math.hypot(px - cx, py - cy) || 1) * (R - pr); py = cy + (py - cy) / (Math.hypot(px - cx, py - cy) || 1) * (R - pr);
        koncheno = true; vyigral = false; ctx.itog(d.kosnulos_ru, 'bad');
      } else if (proshlo >= d.cel_sekund){
        koncheno = true; vyigral = true;
        ctx.itog(d.pobeda.soobshchenie_ru, 'ok'); ctx.ochki('pobeda', d.pobeda.ochki);
        schetEl.textContent = d.schet_ru.replace('{s}', 0);
      }
    }
    risovat();
    requestAnimationFrame(kadr);
  }

  zanovo(); kadr();
  return { zanovo: zanovo };
});
