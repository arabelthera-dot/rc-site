/* Механика poezd-po-ferme (02-28 «Журавский»): ведёшь поезд по ферме моста и видишь, какие раскосы тянутся, а какие
   сжимаются. Ферма — решётка из раскосов между двумя поясами; подъехал поездом к очередному раскосу — движок показывает,
   что с ним происходит (тянется — концы расходятся, давит — выгибается вбок), посетитель жмёт «Тянет»/«Давит». Верно —
   раскос защёлкивается зелёным (тянет) или золотым (давит) и открывается пояснение; все пройдены — победа. Раскосы,
   их характер (тянет/давит), все тексты и баллы — из dannye (схема в src/lib/igry-mehaniki.ts); на холсте только ферма,
   поезд и опоры, без надписей (Р18). Мышь и палец — ползунок и кнопки, клавиатура — стрелки по ползунку, Tab и Enter. */
RCIgry.dvizhok('poezd-po-ferme', function(ctx){
  var d = ctx.dannye, m = ctx.mesto;
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
  m.innerHTML = '<div>' +
    '<canvas width="640" height="360" role="img" aria-label="' + esc(d.holst_alt) + '" style="display:block;width:100%;height:auto;border-radius:10px;background:#16202c"></canvas>' +
    '<div style="font-size:12.5px;color:#8fa5b9;margin-top:6px">' + esc(d.podpis_holsta_ru) + '</div>' +
    '<div style="font-size:14px;color:var(--muted);margin:12px 0 8px" data-instr></div>' +
    '<input type="range" min="0" max="100" value="0" class="gm-slider" style="display:block;width:100%;box-sizing:border-box;margin:0">' +
    '<div style="display:flex;gap:10px;margin-top:12px">' +
      '<button type="button" class="btn gold" data-tyanet disabled style="flex:1"></button>' +
      '<button type="button" class="btn ghost" data-davit disabled style="flex:1"></button>' +
    '</div>' +
    '<div style="font-size:13px;color:var(--muted);margin-top:10px" data-schet></div>' +
    '</div>';
  var cv = m.querySelector('canvas'), g = cv.getContext('2d');
  var sl = m.querySelector('input'), btnT = m.querySelector('[data-tyanet]'), btnD = m.querySelector('[data-davit]');
  var instrEl = m.querySelector('[data-instr]'), schetEl = m.querySelector('[data-schet]');
  sl.setAttribute('aria-label', d.polzunok_ru);
  btnT.textContent = d.knopka_tyanet_ru; btnD.textContent = d.knopka_davit_ru;

  var W = 640, H = 360, t0 = Date.now();
  var N = d.raskosy.length;
  var pad = 46, bw = W - 2 * pad, topY = H * .30, bottomY = H * .72, panelW = bw / N;
  var members = d.raskosy.map(function(r, i){
    var p1, p2;
    if (i % 2 === 0){ p1 = { x: pad + i * panelW, y: bottomY }; p2 = { x: pad + (i + .5) * panelW, y: topY }; }
    else { p1 = { x: pad + (i + .5) * panelW, y: topY }; p2 = { x: pad + (i + 1) * panelW, y: bottomY }; }
    return { kod: r.kod, tyanet: r.tyanet, poyasnenie: r.poyasnenie_ru, p1: p1, p2: p2, target: pad + (i + .5) * panelW, done: false };
  });

  var active = 0, done = 0, near = false, won = false, flash = 0;
  function trainX(){ return pad + (+sl.value / 100) * bw; }
  function nearActive(){ var mb = members[active]; return mb && Math.abs(trainX() - mb.target) < panelW * .45; }
  function schet(){ schetEl.textContent = d.status_ru.replace('{n}', done).replace('{vsego}', N); }
  function instr(){
    if (won){ instrEl.textContent = ''; return; }
    instrEl.textContent = near ? d.vopros_ru : d.privedi_ru.replace('{n}', active + 1).replace('{vsego}', N);
  }
  function upd(){
    near = !won && nearActive();
    btnT.disabled = btnD.disabled = !near;
    instr(); schet();
  }

  sl.addEventListener('input', function(){
    if (won) return;
    upd();
  });

  function otvet(tyanet){
    if (!near || won) return;
    var mb = members[active];
    if (mb.tyanet === tyanet){
      mb.done = true; done++;
      if (done >= N){
        won = true; flash = 1; sl.disabled = true;
        ctx.ochki('pobeda', d.pobeda.ochki);
        ctx.itog(d.pobeda.soobshchenie_ru, 'ok');
      } else {
        ctx.itog(d.verno_ru + ' ' + mb.poyasnenie, 'ok');
        while (active < N && members[active].done) active++;
      }
    } else {
      ctx.itog(d.mimo_ru, 'bad');
    }
    upd();
  }
  btnT.addEventListener('click', function(){ otvet(true); });
  btnD.addEventListener('click', function(){ otvet(false); });

  function memberColor(mb, activeNear){
    if (mb.done) return mb.tyanet ? 'rgba(126,212,160,.9)' : 'rgba(228,201,122,.9)';
    if (activeNear) return 'rgba(255,255,255,.85)';   // нейтрально, пока не ответил
    return 'rgba(255,255,255,.28)';
  }
  function drawMember(mb, now, activeNear){
    var p1 = mb.p1, p2 = mb.p2;
    var dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.hypot(dx, dy) || 1;
    var ux = dx / len, uy = dy / len, px = -uy, py = ux;   // перпендикуляр к раскосу
    var col = memberColor(mb, activeNear);
    g.strokeStyle = col; g.lineWidth = (mb.done || activeNear) ? 3 : 2;
    if (activeNear && !mb.tyanet){
      // давит — раскос выгибается вбок (выпучивается)
      var amp = 4 + Math.sin(now * 6) * 3;
      var mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      g.beginPath(); g.moveTo(p1.x, p1.y);
      g.quadraticCurveTo(mx + px * amp, my + py * amp, p2.x, p2.y); g.stroke();
    } else {
      var a = p1, b = p2;
      if (activeNear && mb.tyanet){
        // тянет — концы расходятся вдоль бруса
        var amp2 = 2 + Math.sin(now * 6) * 2;
        a = { x: p1.x - ux * amp2, y: p1.y - uy * amp2 };
        b = { x: p2.x + ux * amp2, y: p2.y + uy * amp2 };
      }
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
    // узел в середине раскоса
    var nx = (p1.x + p2.x) / 2, ny = (p1.y + p2.y) / 2;
    g.beginPath(); g.arc(nx, ny, (mb.done || activeNear) ? 3 : 2, 0, 7);
    g.fillStyle = col; g.fill();
  }

  function kadr(){
    g.clearRect(0, 0, W, H);
    var now = (Date.now() - t0) / 1000;
    g.fillStyle = '#16202c'; g.fillRect(0, 0, W, H);
    // опоры по краям моста
    g.fillStyle = 'rgba(255,255,255,.16)';
    [[pad, bottomY], [pad + bw, bottomY]].forEach(function(s){
      g.beginPath();
      g.moveTo(s[0] - 14, s[1]); g.lineTo(s[0] + 14, s[1]); g.lineTo(s[0] + 10, H); g.lineTo(s[0] - 10, H);
      g.closePath(); g.fill();
    });
    // пояса фермы
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(pad, topY); g.lineTo(pad + bw, topY); g.stroke();
    g.beginPath(); g.moveTo(pad, bottomY); g.lineTo(pad + bw, bottomY); g.stroke();
    // концевые стойки
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(pad, topY); g.lineTo(pad, bottomY); g.stroke();
    g.beginPath(); g.moveTo(pad + bw, topY); g.lineTo(pad + bw, bottomY); g.stroke();
    // раскосы
    members.forEach(function(mb, i){ drawMember(mb, now, !won && i === active && near); });
    // поезд на нижнем поясе
    var tx = trainX(), trainY = bottomY - 6;
    g.fillStyle = 'rgba(226,231,238,.95)';
    g.beginPath(); g.rect(tx - 26, trainY - 22, 52, 20); g.fill();
    g.beginPath(); g.rect(tx + 6, trainY - 34, 18, 14); g.fill();   // кабина
    g.fillStyle = 'rgba(96,178,224,.9)';
    [-16, 0, 16].forEach(function(ox){
      g.beginPath(); g.arc(tx + ox, trainY + 2, 5, 0, 7); g.fill();
    });
    if (flash > 0){ g.fillStyle = 'rgba(228,201,122,' + (flash * .18).toFixed(2) + ')'; g.fillRect(0, 0, W, H); flash -= .03; }
    requestAnimationFrame(kadr);
  }

  function zanovo(){
    won = false; done = 0; active = 0; near = false; flash = 0;
    members.forEach(function(x){ x.done = false; });
    sl.disabled = false; sl.value = 0; ctx.itog(d.start_ru); upd();
  }

  upd(); ctx.itog(d.start_ru); kadr();
  return { zanovo: zanovo };
});
