/* Механика do-i-posle (02-27 «Изобретений», пересадка роговицы Филатова): шторкой «до/после» смотришь мир глазами пациента —
   слева мир в бельме (мутном), справа — ясный. Тянешь шторку вправо и снимаешь бельмо со всех сцен, и пациент прозревает.
   Сцена — простые фигуры из dannye.sceny[i].figury (прямоугольник, круг, треугольник) на холсте без надписей и эмодзи (Р18);
   все слова — вёрсткой из dannye. Мышь и палец — тянешь шторку прямо по холсту, клавиатура — стрелками по ползунку. */
RCIgry.dvizhok('do-i-posle', function(ctx){
  var d = ctx.dannye, m = ctx.mesto;
  m.innerHTML =
    '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin:0 2px 6px">' +
      '<span data-do></span><span data-posle></span></div>' +
    '<div data-scena style="position:relative;height:260px;background:#0c1420;border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden;touch-action:none;margin-bottom:8px">' +
      '<canvas aria-hidden="true" style="display:block;width:100%;height:100%"></canvas></div>' +
    '<input type="range" min="0" max="100" step="1" class="gm-slider" style="display:block;width:100%;box-sizing:border-box;margin:0 0 8px">' +
    '<div data-nazvanie style="text-align:center;font-weight:600;margin-bottom:4px"></div>' +
    '<div data-tip style="text-align:center;font-size:14px;color:var(--muted)"></div>' +
    '<div data-progress style="text-align:center;font-size:12px;color:var(--muted)"></div>';
  var wrap = m.querySelector('[data-scena]');
  var cv = m.querySelector('canvas'), g = cv.getContext('2d'), sl = m.querySelector('input');
  var doEl = m.querySelector('[data-do]'), posleEl = m.querySelector('[data-posle]');
  var nazvEl = m.querySelector('[data-nazvanie]'), tipEl = m.querySelector('[data-tip]'), progEl = m.querySelector('[data-progress]');
  doEl.textContent = d.do_ru; posleEl.textContent = d.posle_ru;
  sl.setAttribute('aria-label', d.shtorka_ru);
  var W = 0, H = 0, i = 0, sdana = false, taymer = 0;
  function sceny(){ return d.sceny; }
  function sht(){ return +sl.value / 100; }
  function resize(){ W = cv.width = cv.offsetWidth || 300; H = cv.height = cv.offsetHeight || 260; }
  resize(); window.addEventListener('resize', resize);
  function risovatFiguru(f){
    g.beginPath();
    if (f.tip === 'pryamougolnik') g.rect(f.x * W, f.y * H, f.w * W, f.h * H);
    else if (f.tip === 'treugolnik') { g.moveTo((f.x + f.w / 2) * W, f.y * H); g.lineTo((f.x + f.w) * W, (f.y + f.h) * H); g.lineTo(f.x * W, (f.y + f.h) * H); g.closePath(); }
    else { g.moveTo((f.x + f.rx) * W, f.y * H); g.ellipse(f.x * W, f.y * H, f.rx * H, f.ry * H, 0, 0, Math.PI * 2); }
    g.fillStyle = f.cvet; g.fill();
  }
  function kadr(){
    g.clearRect(0, 0, W, H);
    var s = sceny()[i];
    var x = sht() * W;
    s.figury.forEach(risovatFiguru);                 // ясно — весь холст
    if (x > 1) {                                      // бельмо — слева от шторки
      g.save(); g.beginPath(); g.rect(0, 0, x, H); g.clip();
      s.figury.forEach(risovatFiguru);
      g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(0, 0, x, H);
      var gr = g.createRadialGradient(x * 0.4, H * 0.42, 6, x * 0.4, H * 0.42, Math.max(x, H));
      gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0.05)');
      g.fillStyle = gr; g.fillRect(0, 0, x, H);
      g.restore();
    }
    g.save();
    g.strokeStyle = 'rgba(255,255,255,0.65)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
    var cy = H / 2;
    g.beginPath(); g.arc(x, cy, 15, 0, Math.PI * 2);
    g.fillStyle = sdana ? '#7ed4a0' : '#e4c97a'; g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
    g.strokeStyle = 'rgba(20,20,20,0.8)'; g.lineWidth = 2.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - 8, cy); g.lineTo(x - 3, cy - 5); g.moveTo(x - 8, cy); g.lineTo(x - 3, cy + 5); g.stroke();
    g.beginPath(); g.moveTo(x + 8, cy); g.lineTo(x + 3, cy - 5); g.moveTo(x + 8, cy); g.lineTo(x + 3, cy + 5); g.stroke();
    g.restore();
    requestAnimationFrame(kadr);
  }
  function proverka(){ if (!sdana && sht() >= d.porog) prozrel(); }
  function prozrel(){
    sdana = true;
    if (i >= sceny().length - 1) {
      ctx.itog(d.pobeda.soobshchenie_ru, 'ok');
      ctx.ochki('pobeda', d.pobeda.ochki);
    } else {
      ctx.itog(d.prosvelo_ru, 'ok');
      taymer = setTimeout(function(){
        i++; sl.value = Math.round(d.shtorka_start * 100); sdana = false;
        ctx.itog(''); nazv(); tip(d.tyani_ru); prog();
      }, 1200);
    }
  }
  function nazv(){ nazvEl.textContent = sceny()[i].nazvanie_ru; }
  function tip(t){ tipEl.textContent = t; }
  function prog(){ progEl.textContent = d.progress_ru.replace('{n}', i + 1).replace('{vsego}', sceny().length); }
  sl.addEventListener('input', proverka);
  var tashchit = false;
  wrap.addEventListener('pointerdown', function(e){ tashchit = true; wrap.setPointerCapture(e.pointerId); posy(e); });
  wrap.addEventListener('pointermove', function(e){ if (tashchit) posy(e); });
  wrap.addEventListener('pointerup', function(){ tashchit = false; });
  wrap.addEventListener('pointercancel', function(){ tashchit = false; });
  function posy(e){
    var r = wrap.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width;
    x = Math.max(0, Math.min(1, x));
    sl.value = Math.round(x * 100);
    proverka();
  }
  function zanovo(){
    clearTimeout(taymer);
    i = 0; sl.value = Math.round(d.shtorka_start * 100); sdana = false;
    ctx.itog(''); nazv(); tip(d.tyani_ru); prog();
  }
  zanovo(); kadr();
  return { zanovo: zanovo };
});
