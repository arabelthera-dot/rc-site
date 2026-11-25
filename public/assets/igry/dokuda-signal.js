/* Механика dokuda-signal (02-24 «Бонч-Бруевич»): ползунком наращиваешь мощность передатчика и смотришь на карте,
   докуда доходит сигнал из Москвы. Без водяного охлаждения анода потолок — 6 кВт; с охлаждением — до 12 кВт, и круги
   достают до дальних городов Европы. Города, предел, все тексты и баллы — из dannye (схема в src/lib/igry-mehaniki.ts);
   на холсте только карта, мачта, круги и точки городов, без надписей (Р18). Достал ли круг город — движок считает сам,
   по расстоянию точки от мачты (дальний город достижим только на полной мощности). Мышь и палец — ползунок и кнопка,
   клавиатура — стрелки по ползунку, Tab и Enter по кнопке. */
RCIgry.dvizhok('dokuda-signal', function(ctx){
  var d = ctx.dannye, m = ctx.mesto;
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
  m.innerHTML = '<div>' +
    '<canvas width="640" height="360" role="img" aria-label="' + esc(d.holst_alt) + '" style="display:block;width:100%;height:auto;border-radius:10px;background:#16202c"></canvas>' +
    '<div style="font-size:12.5px;color:#8fa5b9;margin-top:6px">' + esc(d.podpis_holsta_ru) + '</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 2px" data-legend></div>' +
    '<div style="display:flex;align-items:center;gap:12px;margin-top:12px">' +
      '<input type="range" min="0" max="100" value="0" class="gm-slider" style="flex:1 1 auto;min-width:140px;box-sizing:border-box;margin:0">' +
      '<button type="button" class="btn ghost" data-cool style="white-space:nowrap"></button>' +
    '</div>' +
    '<div style="font-size:14px;color:var(--muted);margin-top:8px" data-power></div>' +
    '</div>';
  var cv = m.querySelector('canvas'), g = cv.getContext('2d');
  var sl = m.querySelector('input'), coolBtn = m.querySelector('[data-cool]');
  var legendEl = m.querySelector('[data-legend]'), powerEl = m.querySelector('[data-power]');
  sl.setAttribute('aria-label', d.polzunok_ru);

  var W = 640, H = 360, t0 = Date.now();
  var MX = .84, MY = .52;                       // мачта — доли холста
  var mast = { x: MX * W, y: MY * H };

  // точки городов и их расстояния от мачты; Rmax — по самой дальней, радиус растёт линейно с мощностью
  var Rmax = 0, cities = [];
  d.goroda.forEach(function(c){
    var x = c.x * W, y = c.y * H, dist = Math.hypot(x - mast.x, y - mast.y);
    cities.push({ kod: c.kod, nazvanie: c.nazvanie_ru, x: x, y: y, dist: dist, reached: false });
    if (dist > Rmax) Rmax = dist;
  });

  var cooling = false, power = 0, solved = false, flash = 0, prev = {};
  var chipDots = [];
  d.goroda.forEach(function(c){
    var chip = document.createElement('span');
    chip.style.cssText = 'display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--muted);padding:4px 10px;border:1px solid rgba(255,255,255,.08);border-radius:999px';
    chip.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#5a6b80;display:inline-block"></span><span>' + esc(c.nazvanie_ru) + '</span>';
    legendEl.appendChild(chip);
    chipDots.push(chip);
  });

  function radius(){ return (power / d.moshnost_max) * Rmax; }
  function updCoolBtn(){ coolBtn.textContent = cooling ? d.ohlazhdenie_on_ru : d.ohlazhdenie_ru; }
  function powerLabel(){ powerEl.textContent = d.moshnost_ru.replace('{n}', Math.round(power)); }
  function updateLegend(){
    cities.forEach(function(c, i){
      var chip = chipDots[i];
      chip.style.color = c.reached ? 'var(--gold-l)' : 'var(--muted)';
      chip.style.borderColor = c.reached ? 'rgba(228,201,122,.5)' : 'rgba(255,255,255,.08)';
      chip.firstChild.style.background = c.reached ? '#e4c97a' : '#5a6b80';
    });
  }
  function checkReach(){
    var r = radius();
    cities.forEach(function(c){
      var now = c.dist <= r + .5;
      if (now && !prev[c.kod] && !solved) ctx.itog(d.dostig_ru.replace('{gorod}', c.nazvanie), 'ok');
      c.reached = now; prev[c.kod] = now;
    });
    updateLegend();
    if (!solved && cities.every(function(c){ return c.reached; })){
      solved = true;
      ctx.ochki('pobeda', d.pobeda.ochki);
      ctx.itog(d.pobeda.soobshchenie_ru, 'ok');
    }
  }
  function setPower(v){
    power = v; powerLabel(); checkReach();
  }

  sl.addEventListener('input', function(){
    if (solved) return;
    var v = +sl.value / 100 * d.moshnost_max;
    if (!cooling && v > d.predel_bez_ohlazhdeniya){
      v = d.predel_bez_ohlazhdeniya;
      sl.value = v / d.moshnost_max * 100;
      flash = 1; ctx.itog(d.peregrel_ru, 'bad');
    }
    setPower(v);
  });
  coolBtn.addEventListener('click', function(){
    if (solved) return;
    cooling = !cooling;
    if (!cooling && power > d.predel_bez_ohlazhdeniya){
      sl.value = d.predel_bez_ohlazhdeniya / d.moshnost_max * 100;
      setPower(d.predel_bez_ohlazhdeniya);
    }
    updCoolBtn();
  });

  function kadr(){
    g.clearRect(0, 0, W, H);
    var now = (Date.now() - t0) / 1000;
    g.fillStyle = '#16202c'; g.fillRect(0, 0, W, H);
    // сетка координат — лёгкий намёк на карту
    g.strokeStyle = 'rgba(255,255,255,.045)'; g.lineWidth = 1;
    for (var x = 0; x < W; x += 40){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (var y = 0; y < H; y += 40){ g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    // абстрактный силуэт суши (без надписей)
    g.beginPath();
    g.moveTo(W * .06, H * .94); g.lineTo(W * .10, H * .72); g.lineTo(W * .20, H * .60); g.lineTo(W * .34, H * .56);
    g.lineTo(W * .52, H * .60); g.lineTo(W * .66, H * .70); g.lineTo(W * .74, H * .88); g.lineTo(W * .58, H * .96);
    g.lineTo(W * .28, H * .97); g.closePath();
    g.fillStyle = 'rgba(255,255,255,.06)'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,.10)'; g.stroke();
    // круг сигнала — радиус от мощности
    var r = radius();
    if (r > .5){
      var grad = g.createRadialGradient(mast.x, mast.y, 0, mast.x, mast.y, r);
      grad.addColorStop(0, 'rgba(228,201,122,.30)'); grad.addColorStop(1, 'rgba(228,201,122,.05)');
      g.fillStyle = grad; g.beginPath(); g.arc(mast.x, mast.y, r, 0, 7); g.fill();
      g.strokeStyle = 'rgba(228,201,122,.55)'; g.lineWidth = 1.5;
      g.beginPath(); g.arc(mast.x, mast.y, r, 0, 7); g.stroke();
    }
    // мачта передатчика и расходящиеся волны сверху
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(mast.x, mast.y + 14); g.lineTo(mast.x, mast.y - 26); g.stroke();
    for (var k = 0; k < 2; k++){
      var rr = 12 + ((now * 26 + k * 15) % 28);
      g.strokeStyle = 'rgba(228,201,122,' + Math.max(0, .55 - rr / 60).toFixed(2) + ')';
      g.beginPath(); g.arc(mast.x, mast.y - 26, rr, -2.9, -0.35); g.stroke();
      g.beginPath(); g.arc(mast.x, mast.y - 26, rr, 0.35, 2.9); g.stroke();
    }
    // водяное охлаждение — голубое кольцо вокруг основания мачты
    if (cooling){
      g.beginPath(); g.arc(mast.x, mast.y, 11 + Math.sin(now * 4) * 1.5, 0, 7);
      g.strokeStyle = 'rgba(96,178,224,.8)'; g.lineWidth = 2; g.stroke();
    }
    g.beginPath(); g.arc(mast.x, mast.y, 4, 0, 7); g.fillStyle = '#e4c97a'; g.fill();
    // точки городов: достиг — золотая с пульсом, иначе серая
    cities.forEach(function(c){
      if (c.reached){
        var pu = 1 + Math.sin(now * 4 + c.dist) * .25;
        g.beginPath(); g.arc(c.x, c.y, 6.5 * pu, 0, 7);
        g.strokeStyle = 'rgba(228,201,122,.55)'; g.lineWidth = 1.5; g.stroke();
      }
      g.save();
      if (c.reached){ g.shadowColor = '#e4c97a'; g.shadowBlur = 10; }
      g.beginPath(); g.arc(c.x, c.y, c.reached ? 5 : 4, 0, 7);
      g.fillStyle = c.reached ? '#e4c97a' : 'rgba(255,255,255,.35)';
      g.fill(); g.restore();
    });
    // перегрев — красная вспышка
    if (flash > 0){
      g.fillStyle = 'rgba(192,69,63,' + (flash * .28).toFixed(2) + ')';
      g.fillRect(0, 0, W, H); flash -= .04;
    }
    requestAnimationFrame(kadr);
  }

  function zanovo(){
    cooling = false; power = 0; solved = false; flash = 0; prev = {};
    cities.forEach(function(c){ c.reached = false; });
    sl.value = 0; updCoolBtn(); powerLabel(); updateLegend();
    ctx.itog(d.start_ru);
  }

  updCoolBtn(); powerLabel(); updateLegend(); ctx.itog(d.start_ru); kadr();
  return { zanovo: zanovo };
});
