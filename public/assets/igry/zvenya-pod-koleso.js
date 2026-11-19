/* Механика zvenya-pod-koleso (образец — 01-09 «Проведи воз по грязи», public/assets/blinov-gusenica.js):
   шаг 1 — воз на колёсах вязнет; шаг 2 — посетитель кладёт под колёса dannye.zvenev звеньев, цепь замыкается;
   шаг 3 — тот же воз идёт; финал — сравнение и лента лет. Сцена на холсте без надписей (Р18), все слова — из dannye
   (схема в src/lib/igry-mehaniki.ts). Только нажатия, одна активная кнопка на шаге. */
RCIgry.dvizhok('zvenya-pod-koleso', function(ctx){
  var d = ctx.dannye, m = ctx.mesto, N = d.zvenev, f = d.final;
  function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  var bs = 'min-height:48px;padding:10px 22px;border-radius:12px;border:1px solid rgba(201,168,76,.5);background:rgba(201,168,76,.15);color:inherit;font:inherit;font-weight:700;cursor:pointer';
  m.innerHTML =
    '<ol class="zv-shagi" style="display:flex;gap:6px;list-style:none;padding:0;margin:0 0 8px"><li>1</li><li>2</li><li>3</li></ol>' +
    '<p class="zv-zad" aria-live="polite" style="font-weight:700;font-size:18px;margin:0 0 4px"></p>' +
    '<p class="zv-poy" style="font-size:14px;color:var(--muted);margin:0 0 10px"></p>' +
    '<canvas class="zv-cv" role="img" aria-label="' + esc(d.scena.alt).replace(/"/g,'&quot;') + '" style="display:block;width:100%;aspect-ratio:16/9;max-height:420px;border-radius:12px;background:#3d2c18"></canvas>' +
    (d.scena.mesto_ru ? '<p style="font-size:12px;color:var(--muted);margin:6px 0 0">' + d.scena.mesto_ru + '</p>' : '') +
    '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:10px 0;font-size:14px"><b class="zv-st"></b>' +
    '<span style="flex:1 1 80px;min-width:80px;height:8px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden"><i class="zv-metr" style="display:block;height:100%;width:0;background:var(--gold-l,#c9a84c);transition:width .3s"></i></span>' +
    '<span class="zv-zn"></span></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="zv-ehat" style="' + bs + '"></button>' +
    '<button type="button" class="zv-zveno" style="' + bs + '"></button></div>' +
    '<p class="zv-chto" aria-live="polite" style="margin:10px 0 0;font-size:15px" hidden></p>' +
    '<div class="zv-final" hidden style="margin-top:14px"><p style="font-size:18px;font-weight:700;margin:0 0 10px">' + f.glavnoe_ru + '</p>' +
    (f.sravnenie.length ? '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:12px">' +
      f.sravnenie.map(function(s){ return '<div style="padding:10px;border-radius:10px;background:rgba(255,255,255,.06)"><b style="display:block;font-size:26px;color:var(--gold-l,#c9a84c)">' + s.chislo + '</b>' + s.tekst + '</div>'; }).join('') + '</div>' : '') +
    (f.lenta.length ? '<ol style="list-style:none;padding:0;margin:0;display:grid;gap:6px">' +
      f.lenta.map(function(l){ return '<li style="display:flex;gap:10px"><b style="min-width:72px;color:var(--gold-l,#c9a84c)">' + l.god + '</b><span>' + l.tekst + '</span></li>'; }).join('') + '</ol>' : '') + '</div>';
  var $ = function(s){ return m.querySelector(s); };
  var cv = $('.zv-cv'), g = cv.getContext('2d'), bEhat = $('.zv-ehat'), bZv = $('.zv-zveno');
  var shagi = m.querySelectorAll('.zv-shagi li'), zad = $('.zv-zad'), poy = $('.zv-poy'), chto = $('.zv-chto'), fin = $('.zv-final');
  bEhat.textContent = d.knopka_ehat_ru;
  var W = 800, H = 450, GY = 310, R = 34, AX1 = -95, AX2 = 65, SINK = 30, TRACK = -8, st, raf = 0, last = 0, dano = false;
  function svezh(){ st = { shag: 1, faza: '', t: 0, wx: 0, sink: 0, cel: 0, lozheno: 0, zamk: 0 }; }
  function mod(a, n){ return ((a % n) + n) % n; }
  function razmer(){
    var w = cv.clientWidth || 800, h = cv.clientHeight || 450, dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = w < 520 ? 600 : 800; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    H = Math.round(W * h / w); GY = H - 140; g.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); risuy();
  }
  function rect(x, y, w, h, c){ g.fillStyle = c; g.fillRect(x, y, w, h); }
  function koleso(x, y, rot){
    g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.arc(0, 0, R, 0, 7); g.lineWidth = 7; g.strokeStyle = '#3a2814'; g.stroke();
    g.lineWidth = 3; g.strokeStyle = '#6b4a22';
    for (var i = 0; i < 8; i++){ g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(i * .785) * R, Math.sin(i * .785) * R); g.stroke(); }
    g.restore();
  }
  function zveno(x, y, a){ g.save(); g.translate(x, y); g.rotate(a); rect(-15, -5, 30, 10, '#4a3418'); rect(-13, -4, 26, 4, '#8a6232'); g.restore(); }
  function petlya(s, x1, x2, cy){
    var fl = x2 - x1, ar = Math.PI * R, L = 2 * fl + 2 * ar; s = mod(s, L);
    if (s < fl) return [x1 + s, cy + R, 0]; s -= fl;
    if (s < ar){ var t = s / R; return [x2 + Math.sin(t) * R, cy + Math.cos(t) * R, -t]; } s -= ar;
    if (s < fl) return [x2 - s, cy - R, Math.PI]; s -= fl; var u = s / R;
    return [x1 - Math.sin(u) * R, cy - Math.cos(u) * R, Math.PI - u];
  }
  function risuy(){
    var cam = st.wx, gr = g.createLinearGradient(0, 0, 0, GY); gr.addColorStop(0, '#7fa6c4'); gr.addColorStop(1, '#d9dfd6');
    g.fillStyle = gr; g.fillRect(0, 0, W, GY);
    g.strokeStyle = '#5e4a32'; g.lineWidth = 4;
    for (var p = 0; p < 9; p++){ var px = mod(p * 110 - cam, W + 110) - 55; g.beginPath(); g.moveTo(px, GY - 6); g.lineTo(px, GY - 46); g.stroke(); }
    rect(0, GY - 8, W, H - GY + 8, '#5a4228');
    var cx = W / 2 - 40, cy = GY - R + st.sink, x1 = cx + AX1, x2 = cx + AX2;
    // звенья: уложенные лежат под колёсами, замкнутая цепь бежит вокруг колёс
    if (st.zamk > 0){
      var L = 2 * (x2 - x1) + 2 * Math.PI * R, k = Math.round(L / 30);
      for (var i = 0; i < k * st.zamk; i++){ var q = petlya(i * L / k - st.wx, x1, x2, cy); zveno(q[0], q[1], q[2]); }
    } else for (var j = 0; j < st.lozheno; j++) zveno(x2 + R - (j + .5) * ((x2 - x1 + 2 * R) / N), GY + 6 - st.sink * .3, 0);
    rect(x1 - 30, cy - 70, x2 - x1 + 60, 46, '#7a5530'); rect(x1 - 24, cy - 92, x2 - x1 + 48, 22, '#a0522d');
    koleso(x1, cy, st.wx / R); koleso(x2, cy, st.wx / R);
    g.fillStyle = 'rgba(78,57,33,.96)'; g.beginPath(); g.moveTo(0, GY + 2);
    for (var x = 0; x <= W; x += 20) g.lineTo(x, GY + 2 + 3 * Math.sin((x + cam) / 23));
    g.lineTo(W, H); g.lineTo(0, H); g.fill();
  }
  function tik(ts){
    var dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts; raf = 0; var dalshe = true;
    st.t += dt;
    if (st.faza === 'vyaz'){ var p = Math.min(1, st.t / 1.6); st.sink = SINK * p; if (p >= 1){ st.faza = ''; uvyaz(); } }
    else if (st.faza === 'zveno'){ st.sink += (st.cel - st.sink) * Math.min(1, dt * 10); if (Math.abs(st.sink - st.cel) < .4){ st.sink = st.cel; st.faza = ''; } }
    else if (st.faza === 'zamk'){ st.zamk = Math.min(1, st.t / .9); st.sink += (TRACK - st.sink) * Math.min(1, dt * 8); if (st.zamk >= 1){ st.faza = ''; shag3(); } }
    else if (st.faza === 'edet'){ st.wx += 150 * Math.min(1, st.t / .6) * dt; if (st.t >= 3.4){ st.faza = ''; konec(); } }
    else dalshe = false;
    risuy(); if (dalshe) pusk();
  }
  function pusk(){ if (!raf){ if (!st.faza) last = 0; raf = requestAnimationFrame(tik); } }
  function shag(n){ for (var i = 0; i < shagi.length; i++){ shagi[i].style.cssText = 'width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:700;background:' + (i + 1 < n ? 'rgba(76,175,80,.35)' : i + 1 === n ? 'var(--gold-l,#c9a84c)' : 'rgba(255,255,255,.1)') + ';color:' + (i + 1 === n ? '#111' : 'inherit'); } }
  function stat(t, z, dolya){ $('.zv-st').textContent = t; $('.zv-zn').textContent = z; $('.zv-metr').style.width = Math.round(dolya * 100) + '%'; }
  function skazhi(t){ chto.hidden = false; chto.innerHTML = t; }
  function aktiv(b){ [bEhat, bZv].forEach(function(x){ x.disabled = x !== b; x.style.opacity = x === b ? 1 : .5; }); }
  function schet(){ return st.lozheno + ' ' + d.iz_ru + ' ' + N; }
  function shag1(){
    svezh(); shag(1); zad.innerHTML = d.uvyaz.zadanie_ru; poy.innerHTML = d.uvyaz.poyasnenie_ru;
    stat(d.uvyaz.status_ru, d.uvyaz.do_ru, 0); chto.hidden = true; fin.hidden = true;
    bZv.hidden = true; bEhat.hidden = false; aktiv(bEhat); ctx.itog(''); risuy();
  }
  function uvyaz(){ stat(d.uvyaz.status_ru, d.uvyaz.posle_ru, 1); skazhi(d.uvyaz.soobshchenie_ru); setTimeout(shag2, 900); }
  function shag2(){
    st.shag = 2; shag(2); zad.innerHTML = d.zvenya.zadanie_ru; poy.innerHTML = d.zvenya.poyasnenie_ru;
    stat(d.zvenya.status_ru, schet(), 0); bEhat.hidden = true; bZv.hidden = false; bZv.textContent = d.knopka_zveno_ru + ' · ' + schet(); aktiv(bZv);
  }
  function shag3(){
    st.shag = 3; shag(3); zad.innerHTML = d.edet.zadanie_ru; poy.innerHTML = d.edet.poyasnenie_ru;
    stat(d.edet.status_ru, d.edet.do_ru, 1); bZv.hidden = true; bEhat.hidden = false; aktiv(bEhat);
  }
  function konec(){
    aktiv(null); shag(4); zad.innerHTML = f.zadanie_ru; poy.innerHTML = f.poyasnenie_ru;
    stat(d.edet.status_ru, d.edet.posle_ru, 1); skazhi(d.edet.soobshchenie_ru); fin.hidden = false;
    ctx.itog(f.glavnoe_ru.replace(/<[^>]+>/g, ''));
    if (!dano){ dano = true; ctx.ochki('pobeda', f.ochki); }
  }
  bEhat.onclick = function(){
    if (bEhat.disabled) return; aktiv(null); st.t = 0;
    if (st.shag === 1){ st.faza = 'vyaz'; stat(d.uvyaz.status_ru, d.uvyaz.hod_ru, .5); poy.innerHTML = d.uvyaz.smotri_ru; }
    else if (st.shag === 3){ st.faza = 'edet'; stat(d.edet.status_ru, d.edet.hod_ru, 1); poy.innerHTML = d.edet.smotri_ru; }
    pusk();
  };
  bZv.onclick = function(){
    if (bZv.disabled || st.lozheno >= N) return;
    st.lozheno++; st.cel = SINK * (1 - st.lozheno / N); st.faza = 'zveno'; st.t = 0;
    bZv.textContent = d.knopka_zveno_ru + ' · ' + schet(); stat(d.zvenya.status_ru, schet(), st.lozheno / N);
    if (st.lozheno < N) skazhi(d.zvenya.zveno_ru);
    else { aktiv(null); skazhi(d.zvenya.zamknulos_ru); st.faza = 'zamk'; st.t = 0; }
    pusk();
  };
  window.addEventListener('resize', razmer);
  svezh(); razmer(); shag1();
  return { zanovo: function(){ shag1(); } };
});
