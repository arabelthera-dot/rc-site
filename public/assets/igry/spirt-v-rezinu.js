/* Механика spirt-v-rezinu (первый день — 02-26 «Каучук из спирта», Лебедев):
   посетитель по шагам проходит цепочку синтеза спирт → дивинил → каучук → резина; на каждом шаге жмёт
   кнопку превращения, вещество на холсте течёт из колбы в колбу и меняет цвет. Сцена — рисунок холста без
   надписей (Р18): все слова — из dannye (схема в src/lib/igry-mehaniki.ts). Одна активная кнопка на шаге. */
RCIgry.dvizhok('spirt-v-rezinu', function(ctx){
  var d = ctx.dannye, m = ctx.mesto, S = d.shagi, N = S.length, f = d.final;
  function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  var bs = 'min-height:48px;padding:10px 22px;border-radius:12px;border:1px solid rgba(201,168,76,.5);background:rgba(201,168,76,.15);color:inherit;font:inherit;font-weight:700;cursor:pointer';
  m.innerHTML =
    '<ol class="sp-shagi" style="display:flex;gap:6px;list-style:none;padding:0;margin:0 0 8px">' +
      S.map(function(_, i){ return '<li>' + (i + 1) + '</li>'; }).join('') + '</ol>' +
    '<p class="sp-zad" aria-live="polite" style="font-weight:700;font-size:18px;margin:0 0 4px"></p>' +
    '<p class="sp-poy" style="font-size:14px;color:var(--muted);margin:0 0 10px"></p>' +
    '<canvas class="sp-cv" role="img" aria-label="' + esc(d.scena.alt).replace(/"/g,'&quot;') + '" style="display:block;width:100%;aspect-ratio:16/9;max-height:420px;border-radius:12px;background:#1c2a36"></canvas>' +
    (d.scena.mesto_ru ? '<p style="font-size:12px;color:var(--muted);margin:6px 0 0">' + d.scena.mesto_ru + '</p>' : '') +
    '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:10px 0;font-size:14px"><b class="sp-st"></b>' +
    '<span style="flex:1 1 80px;min-width:80px;height:8px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden"><i class="sp-metr" style="display:block;height:100%;width:0;background:var(--gold-l,#c9a84c);transition:width .3s"></i></span>' +
    '<span class="sp-zn"></span></div>' +
    '<button type="button" class="sp-dalee" style="' + bs + '"></button>' +
    '<p class="sp-chto" aria-live="polite" style="margin:10px 0 0;font-size:15px" hidden></p>' +
    '<div class="sp-final" hidden style="margin-top:14px"><p style="font-size:18px;font-weight:700;margin:0 0 10px">' + f.glavnoe_ru + '</p>' +
    (f.sravnenie.length ? '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:12px">' +
      f.sravnenie.map(function(s){ return '<div style="padding:10px;border-radius:10px;background:rgba(255,255,255,.06)"><b style="display:block;font-size:26px;color:var(--gold-l,#c9a84c)">' + s.chislo + '</b>' + s.tekst + '</div>'; }).join('') + '</div>' : '') +
    (f.lenta.length ? '<ol style="list-style:none;padding:0;margin:0;display:grid;gap:6px">' +
      f.lenta.map(function(l){ return '<li style="display:flex;gap:10px"><b style="min-width:72px;color:var(--gold-l,#c9a84c)">' + l.god + '</b><span>' + l.tekst + '</span></li>'; }).join('') + '</ol>' : '') + '</div>';
  var $ = function(s){ return m.querySelector(s); };
  var cv = $('.sp-cv'), g = cv.getContext('2d'), btn = $('.sp-dalee');
  var shagi = m.querySelectorAll('.sp-shagi li'), zad = $('.sp-zad'), poy = $('.sp-poy'), chto = $('.sp-chto'), fin = $('.sp-final');
  var C = []; C[0] = S[0].cvet_ot; for (var i = 0; i < N; i++) C[i + 1] = S[i].cvet_vo;
  var W = 800, H = 450, yTube = 180, yBulb = 324, R = 68, xs = [], st, raf = 0, last = 0, dano = false;
  function svezh(){ st = { shag: 0, faza: '', t: 0 }; }
  function hex(c){ c = String(c).replace('#',''); if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2]; return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)]; }
  function mix(a, b, t){ var A = hex(a), B = hex(b); return 'rgb(' + Math.round(A[0]+(B[0]-A[0])*t) + ',' + Math.round(A[1]+(B[1]-A[1])*t) + ',' + Math.round(A[2]+(B[2]-A[2])*t) + ')'; }
  function razmer(){
    var w = cv.clientWidth || 800, h = cv.clientHeight || 450, dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = w < 520 ? 600 : 800; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    H = Math.round(W * h / w); yTube = Math.round(H * 0.40); yBulb = Math.round(H * 0.72); R = Math.round(H * 0.15);
    xs = []; var pad = 70; for (var i = 0; i <= N; i++) xs[i] = pad + i * (W - 2 * pad) / N;
    g.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); risuy();
  }
  function flask(x, c, level){
    var y = yBulb;
    g.fillStyle = 'rgba(200,226,240,.30)'; g.fillRect(x - 4, yTube, 8, y - R * 0.72 - yTube + 3);
    g.beginPath(); g.arc(x, y, R, 0, 7); g.strokeStyle = 'rgba(210,230,245,.55)'; g.lineWidth = 3; g.stroke();
    if (level > 0.001){
      g.save(); g.beginPath(); g.arc(x, y, R, 0, 7); g.clip();
      var lh = R * 1.55 * Math.max(0, Math.min(1, level));
      g.fillStyle = c; g.fillRect(x - R, y + R - lh, 2 * R, lh);
      g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(x - R, y + R - lh, 2 * R, Math.min(8, lh));
      g.restore();
    }
  }
  function risuy(){
    var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1c2a36'); gr.addColorStop(1, '#33241a');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(210,230,245,.28)'; g.lineWidth = 10; g.lineCap = 'round';
    g.beginPath(); g.moveTo(xs[0], yTube); g.lineTo(xs[N], yTube); g.stroke();
    g.strokeStyle = 'rgba(235,248,255,.16)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(xs[0], yTube - 2); g.lineTo(xs[N], yTube - 2); g.stroke();
    for (var i = 0; i <= N; i++){
      var level = i <= st.shag ? 1 : 0;
      if (st.faza === 'tekut' && i === st.shag + 1) level = st.t;
      flask(xs[i], C[i], level);
    }
    if (st.faza === 'tekut'){
      var bx = xs[st.shag] + (xs[st.shag + 1] - xs[st.shag]) * st.t;
      g.beginPath(); g.arc(bx, yTube, 12, 0, 7); g.fillStyle = 'rgba(255,255,255,.25)'; g.fill();
      g.beginPath(); g.arc(bx, yTube, 7, 0, 7); g.fillStyle = mix(C[st.shag], C[st.shag + 1], st.t); g.fill();
    }
  }
  function tik(ts){
    var dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts; raf = 0; var dalshe = false;
    if (st.faza === 'tekut'){
      st.t += dt / 1.4; dalshe = true;
      if (st.t >= 1){ st.t = 1; st.faza = ''; posle(); }
    }
    risuy(); if (dalshe) pusk();
  }
  function pusk(){ if (!raf){ if (!st.faza) last = 0; raf = requestAnimationFrame(tik); } }
  function shagiIcons(k){ for (var i = 0; i < shagi.length; i++){ shagi[i].style.cssText = 'width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:700;background:' + (i + 1 < k ? 'rgba(76,175,80,.35)' : i + 1 === k ? 'var(--gold-l,#c9a84c)' : 'rgba(255,255,255,.1)') + ';color:' + (i + 1 === k ? '#111' : 'inherit'); } }
  function stat(t, z, dolya){ $('.sp-st').textContent = t; $('.sp-zn').textContent = z; $('.sp-metr').style.width = Math.round(dolya * 100) + '%'; }
  function skazhi(t){ chto.hidden = false; chto.innerHTML = t; }
  function ust(n){
    st.shag = n; shagiIcons(n + 1);
    var s = S[n]; zad.innerHTML = s.zadanie_ru; poy.innerHTML = s.poyasnenie_ru;
    stat(d.status_ru, s.do_ru, n / N); chto.hidden = true; fin.hidden = true;
    btn.textContent = s.knopka_ru; btn.disabled = false; btn.style.opacity = 1; ctx.itog(''); risuy();
  }
  function posle(){
    var s = S[st.shag]; stat(d.status_ru, s.posle_ru, (st.shag + 1) / N); skazhi(s.soobshchenie_ru);
    if (st.shag + 1 < N) setTimeout(function(){ ust(st.shag + 1); }, 900);
    else konec();
  }
  function konec(){
    btn.disabled = true; btn.style.opacity = .5; shagiIcons(N + 1);
    zad.innerHTML = f.zadanie_ru; poy.innerHTML = f.poyasnenie_ru;
    stat(d.status_ru, S[N - 1].posle_ru, 1); skazhi(S[N - 1].soobshchenie_ru); fin.hidden = false;
    ctx.itog(f.glavnoe_ru.replace(/<[^>]+>/g, ''));
    if (!dano){ dano = true; ctx.ochki('pobeda', f.ochki); }
  }
  btn.onclick = function(){
    if (btn.disabled) return;
    btn.disabled = true; btn.style.opacity = .5;
    var s = S[st.shag]; st.t = 0; st.faza = 'tekut';
    stat(d.status_ru, s.hod_ru, (st.shag + .5) / N); pusk();
  };
  window.addEventListener('resize', razmer);
  svezh(); razmer(); ust(0);
  return { zanovo: function(){ svezh(); ust(0); } };
});
