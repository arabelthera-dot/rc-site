/* Механика kto-ranshe (02-17 «Изобретений», Пироцкий): две линии времени — Петербург и Берлин.
   Выбираешь, кто сделал первым (кнопка-город), и ставишь на год (ползунок); верно и то и другое — раунд засчитан.
   Кто раньше и год раньше движок считает сам по sobytiya (событие с меньшим годом), в данных лишнего нет.
   Сцена — две линии с точками, без надписей и эмодзи (Р18); все слова — вёрсткой из dannye (схема в src/lib/igry-mehaniki.ts).
   Мышь и палец — нажатие на кнопку и ползунок; клавиатура — Tab и Enter/пробел по кнопкам, стрелки — по ползунку. */
RCIgry.dvizhok('kto-ranshe', function(ctx){
  var d = ctx.dannye, m = ctx.mesto, P = d.pary, L = d.linii;
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
  var BTN = 'cursor:pointer;font:inherit;font-size:14.5px;font-weight:600;padding:12px 14px;min-height:56px;width:100%;' +
    'display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;gap:3px';
  m.innerHTML = '<div>' +
    '<canvas width="640" height="240" role="img" aria-label="' + esc(d.holst_alt) + '" style="display:block;width:100%;height:auto;border-radius:10px;background:#1c2530"></canvas>' +
    '<p style="font-size:15px;line-height:1.5;margin:14px 0 10px" data-vopros></p>' +
    '<div role="group" data-goroda style="display:grid;grid-template-columns:1fr 1fr;gap:10px"></div>' +
    '<div style="margin-top:14px">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:14px;margin-bottom:6px">' +
        '<span data-stavka-podpis></span><span style="font-weight:700;color:var(--gold-l,#e2c46a)" data-god></span>' +
      '</div>' +
      '<input type="range" data-polzunok style="width:100%;accent-color:var(--gold-l,#e2c46a)">' +
    '</div>' +
    '<button class="btn gold" type="button" data-proverit style="margin-top:14px;width:100%;justify-content:center">' + esc(d.proverit_ru) + '</button>' +
    '<div style="font-size:13px;color:var(--muted);margin-top:10px" data-progress></div>' +
    '</div>';
  var cv = m.querySelector('canvas'), g = cv.getContext('2d');
  var voprosEl = m.querySelector('[data-vopros]'), gorodaEl = m.querySelector('[data-goroda]');
  var podpisEl = m.querySelector('[data-stavka-podpis]'), godEl = m.querySelector('[data-god]');
  var polzunokEl = m.querySelector('[data-polzunok]'), proveritEl = m.querySelector('[data-proverit]');
  var progressEl = m.querySelector('[data-progress]');

  var W = 640, H = 240, Y = [86, 172], X0 = 46, X1 = 594, t0 = Date.now();
  var step = 0, vybrana = null, vernoKto = false, solved = false, locked = false, raz = null, god = 0;
  var anim = 0, a = 0; // anim: 0 — точки в нейтрали (центр), 1 — раскрыты по годам; a — текущее положение анимации

  function rannyy(p){ return p.sobytiya[0].god <= p.sobytiya[1].god ? p.sobytiya[0] : p.sobytiya[1]; }
  function sobytieNa(l){ return raz.sobytiya[0].linia === l.kod ? raz.sobytiya[0] : raz.sobytiya[1]; }
  function godX(gd){
    var mn = Math.min(raz.sobytiya[0].god, raz.sobytiya[1].god);
    var mx = Math.max(raz.sobytiya[0].god, raz.sobytiya[1].god);
    return X0 + (gd - mn) / (mx - mn || 1) * (X1 - X0);
  }

  function kadr(){
    g.clearRect(0, 0, W, H);
    var now = (Date.now() - t0) / 1000;
    a += (anim - a) * 0.09;
    for (var i = 0; i < 2; i++){
      var cvet = L[i].cvet;
      g.strokeStyle = cvet; g.globalAlpha = .85; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(X0, Y[i]); g.lineTo(X1, Y[i]); g.stroke(); g.globalAlpha = 1;
      g.beginPath(); g.arc(X0, Y[i], 4, 0, 7); g.fillStyle = cvet; g.fill();
      g.beginPath(); g.arc(X1, Y[i], 4, 0, 7); g.fillStyle = cvet; g.globalAlpha = .5; g.fill(); g.globalAlpha = 1;
      var sx = 320 + (godX(sobytieNa(L[i]).god) - 320) * a;
      var pu = 1 + Math.sin(now * 4 + i * 1.7) * .22;
      g.beginPath(); g.arc(sx, Y[i], 13 * pu, 0, 7);
      g.strokeStyle = cvet; g.globalAlpha = .4; g.lineWidth = 1.5; g.stroke(); g.globalAlpha = 1;
      g.beginPath(); g.arc(sx, Y[i], 7.5 * pu, 0, 7); g.fillStyle = cvet; g.fill();
    }
    requestAnimationFrame(kadr);
  }

  function risGoroda(){
    var kn = gorodaEl.children;
    for (var i = 0; i < L.length; i++){
      var b = kn[i], l = L[i];
      var vyb = vybrana === l.kod;
      var podt = vernoKto && l.kod === rannyy(raz).linia;
      b.className = 'btn' + (vyb || podt ? ' gold' : ' ghost');
      b.style.cssText = BTN +
        (podt ? ';border-color:#3f9b52;box-shadow:inset 0 0 0 1px #3f9b52' : '') +
        (vernoKto && !podt ? ';opacity:.4;cursor:default' : '');
      b.disabled = vernoKto;
      b.setAttribute('aria-pressed', (vyb || podt) ? 'true' : 'false');
    }
  }
  function risovat(){
    raz = P[step]; anim = 0; a = 0; vybrana = null; vernoKto = false;
    if (solved){
      voprosEl.textContent = ''; gorodaEl.innerHTML = ''; podpisEl.textContent = ''; godEl.textContent = '';
      polzunokEl.style.display = 'none'; proveritEl.style.display = 'none'; progressEl.textContent = '';
      return;
    }
    voprosEl.textContent = raz.vopros_ru;
    progressEl.textContent = d.progress_ru.replace('{n}', step + 1).replace('{vsego}', P.length);
    podpisEl.textContent = raz.stavka.podpis_ru;
    polzunokEl.setAttribute('aria-label', raz.stavka.podpis_ru);
    polzunokEl.style.display = ''; proveritEl.style.display = '';
    polzunokEl.min = raz.stavka.god_ot; polzunokEl.max = raz.stavka.god_do; polzunokEl.step = 1;
    god = raz.stavka.start; polzunokEl.value = god;
    godEl.textContent = raz.stavka.god_ru.replace('{g}', god);
    gorodaEl.innerHTML = '';
    for (var i = 0; i < L.length; i++){
      (function(l, sob){
        var b = document.createElement('button');
        b.type = 'button';
        b.innerHTML = '<span style="font-size:15px">' + esc(l.nazvanie) + '</span>' +
          '<span style="font-size:12.5px;color:var(--muted);font-weight:400">' + esc(sob.nazvanie) + '</span>';
        b.addEventListener('click', function(){ vybrat(l.kod); });
        gorodaEl.appendChild(b);
      })(L[i], sobytieNa(L[i]));
    }
    risGoroda();
  }
  function vybrat(kod){ if (solved || locked || vernoKto) return; vybrana = vybrana === kod ? null : kod; ctx.itog(''); risGoroda(); }
  function proverit(){
    if (solved || locked) return;
    var verno = rannyy(raz);
    if (!vernoKto){
      if (!vybrana){ ctx.itog(d.vyberi_ru); return; }
      if (vybrana !== verno.linia){ ctx.itog(raz.kto_net_ru, 'bad'); vybrana = null; risGoroda(); return; }
      vernoKto = true; risGoroda();
    }
    if (Math.abs(god - verno.god) > raz.stavka.dopusk){ ctx.itog(raz.god_net_ru, 'bad'); return; }
    ctx.itog(raz.verno_ru, 'ok');
    anim = 1; locked = true;
    if (step >= P.length - 1){
      solved = true;
      setTimeout(function(){ ctx.ochki('pobeda', d.pobeda.ochki); ctx.itog(d.pobeda.soobshchenie_ru, 'ok'); risovat(); }, 1500);
    } else {
      setTimeout(function(){ locked = false; step++; risovat(); }, 1500);
    }
  }
  function zanovo(){ step = 0; solved = false; locked = false; vybrana = null; vernoKto = false; risovat(); ctx.itog(d.zanovo_ru); }

  polzunokEl.addEventListener('input', function(){ god = parseInt(polzunokEl.value, 10); godEl.textContent = raz.stavka.god_ru.replace('{g}', god); });
  proveritEl.addEventListener('click', proverit);
  risovat(); ctx.itog(d.start_ru); kadr();
  return { zanovo: zanovo };
});
