/* Механика dokuda-signal (02-24 «Коминтерн»): ползунком наращиваешь мощность передатчика и на схеме дальности смотришь,
   докуда доходит сигнал. Города стоят на своих кольцах дальности (dalnost — в киловаттах, ugol — угол от станции);
   поймай край круга сигнала на кольцо города-цели (|мощность − dalnost| < dopusk) и «передай». Совпало — город загорается,
   станция переходит к следующему городу. Числа (мощность 0…12, города, кольца) и все тексты — из dannye (схема в
   src/lib/igry-mehaniki.ts); на холсте — только схема дальности и точки, надписи — вёрсткой (Р18).
   Мышь, палец и клавиатура — стрелками по ползунку, Tab и Enter по кнопке. */
RCIgry.dvizhok('dokuda-signal', function(ctx){
  var d = ctx.dannye, m = ctx.mesto;
  var gorodPoKodu = {};
  d.goroda.forEach(function(g){ gorodPoKodu[g.kod] = g; });

  var html = '<div style="margin-bottom:10px;font-size:15px;line-height:1.4" data-zadanie></div>' +
    '<div style="position:relative;max-width:340px;margin:0 auto 12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden">' +
    '<canvas aria-hidden="true" style="display:block;width:100%;aspect-ratio:1/1"></canvas>';
  d.goroda.forEach(function(g){
    html += '<span data-gorod="' + g.kod + '" style="position:absolute;transform:translate(-50%,-100%);padding:1px 7px;font-size:12px;line-height:1.35;border-radius:6px;background:rgba(10,10,15,.72);color:var(--gold-l);white-space:nowrap;pointer-events:none"></span>';
  });
  html += '</div>' +
    '<div style="text-align:center;font-size:14px;color:var(--muted);margin-bottom:6px" data-moshchnost></div>' +
    '<input type="range" class="gm-slider" style="display:block;width:100%;box-sizing:border-box;margin:0">' +
    '<div style="text-align:center;margin:10px 0"><button class="btn gold" type="button"></button></div>' +
    '<div style="text-align:center;font-size:14px;color:var(--muted)" data-schet></div>';
  m.innerHTML = html;

  var cv = m.querySelector('canvas'), g = cv.getContext('2d');
  var sl = m.querySelector('input'), btn = m.querySelector('button');
  var schetEl = m.querySelector('[data-schet]'), moschnEl = m.querySelector('[data-moshchnost]'), zadanieEl = m.querySelector('[data-zadanie]');
  var labels = {};
  d.goroda.forEach(function(gg){ labels[gg.kod] = m.querySelector('[data-gorod="' + gg.kod + '"]'); });

  sl.setAttribute('aria-label', d.polzunok_ru);
  sl.min = d.moshchnost_min; sl.max = d.moshchnost_max; sl.step = 0.1;
  btn.textContent = d.knopka_ru;

  var W, H, t = 0, scale = 10, celIdx = 0, prinyato = 0, flash = 0, flashX = 0, flashY = 0;
  var cel = d.celi[celIdx], sdelano = {};
  function gorodCel(){ return gorodPoKodu[cel.kod]; }
  function rad(v){ return v * Math.PI / 180; }
  function poz(gg){ return { x: W / 2 + gg.dalnost * scale * Math.cos(rad(gg.ugol)), y: H / 2 - gg.dalnost * scale * Math.sin(rad(gg.ugol)) }; }
  function moschnost(){ return +sl.value; }
  function sovpalo(){ var c = gorodCel(); return Math.abs(moschnost() - c.dalnost) < d.dopusk; }
  function fmt(v){ return (+v).toFixed(1).replace(/\.0$/, ''); }
  function moschnStr(){ return d.moshchnost_ru.replace('{n}', fmt(moschnost())); }
  function schet(){ schetEl.textContent = d.schet_ru.replace('{n}', prinyato).replace('{vsego}', d.celi.length); }
  function pokazZadanie(){ zadanieEl.textContent = cel.zadanie_ru; }

  function resize(){
    W = cv.width = cv.offsetWidth || 320; H = cv.height = cv.offsetHeight || 320;
    scale = Math.min(W, H) * 0.40 / d.moshchnost_max;
    d.goroda.forEach(function(gg){
      var p = poz(gg), el = labels[gg.kod];
      el.textContent = gg.nazvanie;
      el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
    });
  }
  resize(); window.addEventListener('resize', resize);

  function kadr(){
    g.clearRect(0, 0, W, H); t += 0.05;
    var cx = W / 2, cy = H / 2;
    // кольца дальности городов — опорная сетка схемы
    d.goroda.forEach(function(gg){
      g.beginPath(); g.arc(cx, cy, gg.dalnost * scale, 0, Math.PI * 2);
      g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 1; g.stroke();
    });
    // круг сигнала — наращивается с мощностью
    var r = moschnost() * scale;
    if (r > 1) {
      g.save(); g.shadowColor = '#2d8cbf'; g.shadowBlur = 14;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fillStyle = 'rgba(45,140,191,.18)'; g.fill();
      g.strokeStyle = 'rgba(96,178,224,.95)'; g.lineWidth = 2; g.stroke();
      g.restore();
    }
    // станция-передатчик в центре
    g.save(); g.shadowColor = '#e4c97a'; g.shadowBlur = 8;
    g.beginPath(); g.arc(cx, cy, 5, 0, Math.PI * 2); g.fillStyle = '#e4c97a'; g.fill(); g.restore();
    g.beginPath(); g.arc(cx, cy, 2, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.9)'; g.fill();
    // кольцо города-цели
    var c = gorodCel(), ok = sovpalo();
    g.save(); g.setLineDash([6, 5]);
    g.shadowColor = ok ? '#7ed4a0' : '#e4c97a'; g.shadowBlur = ok ? 9 : 4;
    g.beginPath(); g.arc(cx, cy, c.dalnost * scale, 0, Math.PI * 2);
    g.strokeStyle = ok ? 'rgba(126,212,160,.95)' : 'rgba(228,201,122,.7)'; g.lineWidth = 2; g.stroke();
    g.restore(); g.setLineDash([]);
    // города-точки
    d.goroda.forEach(function(gg){
      var p = poz(gg), done = sdelano[gg.kod], isCel = gg.kod === cel.kod;
      g.save();
      if (done) { g.shadowColor = '#7ed4a0'; g.shadowBlur = 10; }
      else if (isCel) { g.shadowColor = '#e4c97a'; g.shadowBlur = 8; }
      g.beginPath(); g.arc(p.x, p.y, 4, 0, Math.PI * 2);
      g.fillStyle = done ? '#7ed4a0' : '#e4c97a'; g.fill(); g.restore();
    });
    // вспышка удачного «дошло»
    if (flash > 0) {
      g.save(); g.shadowColor = '#7ed4a0'; g.shadowBlur = 12;
      g.beginPath(); g.arc(flashX, flashY, (1 - flash) * 40, 0, Math.PI * 2);
      g.strokeStyle = 'rgba(126,212,160,' + flash.toFixed(2) + ')'; g.lineWidth = 3; g.stroke();
      g.restore(); flash -= 0.04;
    }
    requestAnimationFrame(kadr);
  }

  btn.addEventListener('click', function(){
    var c = gorodCel(), mn = moschnost();
    if (Math.abs(mn - c.dalnost) < d.dopusk) {
      var p = poz(c); flash = 1; flashX = p.x; flashY = p.y;
      sdelano[c.kod] = true; prinyato++; schet();
      if (prinyato >= d.celi.length) { ctx.itog(d.pobeda.soobshchenie_ru, 'ok'); ctx.ochki('pobeda', d.pobeda.ochki); btn.disabled = true; }
      else { ctx.itog(d.prinyato_ru.replace('{gorod}', c.nazvanie), 'ok'); celIdx++; cel = d.celi[celIdx]; pokazZadanie(); }
    } else if (mn < c.dalnost - d.dopusk) { ctx.itog(d.nedoshlo_ru.replace('{gorod}', c.nazvanie), 'bad'); }
    else { ctx.itog(d.perelet_ru.replace('{gorod}', c.nazvanie), 'bad'); }
  });

  sl.addEventListener('input', function(){ moschnEl.textContent = moschnStr(); });

  function zanovo(){
    prinyato = 0; celIdx = 0; cel = d.celi[0]; sdelano = {}; flash = 0;
    sl.value = d.moshchnost_start; btn.disabled = false;
    moschnEl.textContent = moschnStr(); schet(); pokazZadanie();
  }
  zanovo(); kadr();
  return { zanovo: zanovo };
});
