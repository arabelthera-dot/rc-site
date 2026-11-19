/* Механика nastroy-volnu-priyomnika (первый день — 01-04 «Изобретений»): ползунком подгоняешь свою волну к волне
   приёмника; совпали — волна зеленеет, лампа горит, кнопка передаёт команду, приёмник перестраивается на новую волну.
   Число команд, допуск, начало ползунка, все тексты — из dannye (схема в src/lib/igry-mehaniki.ts). На холсте — только волны и лампа, без надписей (Р18).
   Мышь, палец и клавиатура — стрелками по ползунку, Tab и Enter по кнопке. */
RCIgry.dvizhok('nastroy-volnu-priyomnika', function(ctx){
  var d = ctx.dannye, m = ctx.mesto;
  m.innerHTML = '<div style="position:relative;height:110px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden;margin-bottom:12px">' +
    '<canvas aria-hidden="true" style="display:block;width:100%;height:100%"></canvas></div>' +
    '<input type="range" min="1" max="100" class="gm-slider" style="display:block;width:100%;box-sizing:border-box;margin:0">' +
    '<div style="text-align:center;margin:10px 0"><button class="btn gold" type="button" disabled></button></div>' +
    '<div style="text-align:center;font-size:14px;color:var(--muted)" data-schet></div>';
  var cv = m.querySelector('canvas'), g = cv.getContext('2d'), sl = m.querySelector('input'), btn = m.querySelector('button'), schetEl = m.querySelector('[data-schet]');
  sl.setAttribute('aria-label', d.polzunok_ru);
  btn.textContent = d.knopka_ru;
  var W, H, t = 0, cel, prinyato, flash = 0, burst = [];
  function rnd(){ return d.cel_ot + Math.random() * (d.cel_do - d.cel_ot); }
  function resize(){ W = cv.width = cv.offsetWidth || 300; H = cv.height = cv.offsetHeight || 110; }
  resize(); window.addEventListener('resize', resize);
  function freq(v){ return .02 + v / 100 * .13; }
  function sovpalo(){ return Math.abs(+sl.value - cel) < d.dopusk; }
  function volna(f, ph, color, lw, glow){
    g.save(); if (glow) { g.shadowColor = glow; g.shadowBlur = 10; }
    g.beginPath(); for (var x = 0; x < W; x++) { var y = H / 2 + Math.sin(x * f + ph) * H * .3; x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.strokeStyle = color; g.lineWidth = lw; g.stroke(); g.restore();
  }
  function schet(){ schetEl.textContent = d.schet_ru.replace('{n}', prinyato).replace('{vsego}', d.komand); }
  function kadr(){
    g.clearRect(0, 0, W, H); t += .06;
    // сетка осциллографа
    g.strokeStyle = 'rgba(255,255,255,.04)'; g.lineWidth = 1;
    for (var x = 0; x < W; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (var y = 0; y < H; y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
    var ok = sovpalo();
    volna(freq(cel), t, ok ? 'rgba(126,212,160,.95)' : 'rgba(201,168,76,.5)', ok ? 2.5 : 1.5, ok ? '#7ed4a0' : null);
    if (!ok) volna(freq(+sl.value), t, 'rgba(96,178,224,.95)', 2, '#2d8cbf');
    // лампа приёмника
    g.save(); if (ok) { g.shadowColor = '#7ed4a0'; g.shadowBlur = 12; }
    g.beginPath(); g.arc(W - 16, 14, 6, 0, 7); g.fillStyle = ok ? '#7ed4a0' : 'rgba(192,69,63,.55)'; g.fill(); g.restore();
    btn.disabled = !ok || prinyato >= d.komand;
    if (flash > 0) {
      g.save(); g.shadowColor = '#e4c97a'; g.shadowBlur = 14; g.beginPath(); g.arc(W - 34, H / 2, (1 - flash) * 60, 0, Math.PI * 2);
      g.strokeStyle = 'rgba(228,201,122,' + flash.toFixed(2) + ')'; g.lineWidth = 3; g.stroke(); g.restore(); flash -= .03;
    }
    burst = burst.filter(function(p){ return p.life > 0; });
    burst.forEach(function(p){ p.x += p.vx; p.y += p.vy; p.vy += .1; p.life -= .04;
      g.beginPath(); g.arc(p.x, p.y, 1.6, 0, 7); g.fillStyle = 'rgba(228,201,122,' + p.life.toFixed(2) + ')'; g.fill(); });
    requestAnimationFrame(kadr);
  }
  btn.addEventListener('click', function(){
    if (!sovpalo() || prinyato >= d.komand) return;
    prinyato++; flash = 1;
    for (var i = 0; i < 14; i++) burst.push({ x: W - 34, y: H / 2, vx: (Math.random() - .5) * 5, vy: (Math.random() - .8) * 4, life: 1 });
    schet();
    if (prinyato >= d.komand) { ctx.itog(d.pobeda.soobshchenie_ru, 'ok'); ctx.ochki('pobeda', d.pobeda.ochki); }
    else { ctx.itog(d.prinyato_ru, 'ok'); cel = rnd(); }
  });
  function zanovo(){ prinyato = 0; cel = rnd(); sl.value = d.polzunok_start; schet(); }
  zanovo(); kadr();
  return { zanovo: zanovo };
});
