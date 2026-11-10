/* Механика smeta-truboprovoda (образец — 01-05 «Посчитай трубу, как Шухов», public/muzei/izobreteniya/igry/truba-shukhova.js):
   ползунки по уровням; выход = koef × произведение множителей уровней (округление до okruglenie), смета = сумма стоимостей уровней.
   Цель — выход не меньше cel и смета не больше smeta; баллы — по числу попыток. Тексты, уровни, числа и знаки сцены — из dannye
   (схема в src/lib/igry-mehaniki.ts). Сцена — разметка, на ней нет надписей. */
RCIgry.dvizhok('smeta-truboprovoda', function(ctx){
  var d = ctx.dannye, m = ctx.mesto, P = d.polzunki, S = d.scena || {};
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
  var fmt = function(x){ return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  var sub = function(t, o){ return String(t).replace(/\{(\w+)\}/g, function(a, k){ return k in o ? o[k] : a; }); };
  if (!document.getElementById('smeta-css')){
    var css = document.createElement('style'); css.id = 'smeta-css';
    css.textContent = '.smeta-lead{color:#7a9ab8;font-size:14px;line-height:1.65;margin:0 0 14px}' +
      '.smeta-plashki,.smeta-pribory{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}' +
      '.smeta-plashki>div,.smeta-pribory>div{flex:1 1 150px;min-width:0;border-radius:10px;padding:9px 13px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09)}' +
      '.smeta-plashki>div{background:rgba(201,168,76,.07);border-color:rgba(201,168,76,.2)}' +
      '.smeta-plashki b,.smeta-pribory b{display:block;font-family:"Playfair Display",serif;font-size:19px;line-height:1.25;color:#e4c97a;overflow-wrap:anywhere}' +
      '.smeta-plashki span,.smeta-pribory span{font-size:10.5px;letter-spacing:.9px;text-transform:uppercase;color:#7a9ab8}' +
      '.smeta-pribory small{font-size:12px;color:#7a9ab8;font-family:Inter,sans-serif}' +
      '.smeta-pribory .ok{color:#7ed4a0}.smeta-pribory .no{color:#f08080}' +
      '.smeta-ruchki{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:16px}' +
      '.smeta-ruchki label{display:block;font-size:13px;color:#e8eef5;font-weight:600}.smeta-ruchki .lv{float:right;color:#e4c97a;margin-left:8px}' +
      '.smeta-ruchki input{width:100%;box-sizing:border-box;margin:9px 0 0;accent-color:#c9a84c;min-height:28px}' +
      '.smeta-ruchki .sub{font-size:11.5px;color:#7a9ab8;margin-top:4px;font-weight:400;line-height:1.4}' +
      '.smeta-scena{position:relative;height:104px;border-radius:12px;background:linear-gradient(180deg,#050b16,#0a1424);border:1px solid rgba(255,255,255,.07);overflow:hidden;margin-bottom:14px}' +
      '.smeta-truba{position:absolute;left:11%;right:11%;top:50%;transform:translateY(-50%);border-radius:20px;background:linear-gradient(180deg,#7896be,#37557d 45%,#122037);border:1px solid rgba(140,170,210,.3);transition:height .35s}' +
      '.smeta-potok{position:absolute;inset:1px;border-radius:20px;overflow:hidden}' +
      '.smeta-potok i{position:absolute;top:50%;width:15px;height:60%;transform:translateY(-50%);border-radius:50%;background:radial-gradient(circle,#ffcf6a 10%,rgba(245,180,55,.12) 70%);animation:smetapotok linear infinite}' +
      '@keyframes smetapotok{from{left:-10%}to{left:104%}}' +
      '.smeta-konec{position:absolute;top:0;bottom:0;width:11%;display:flex;align-items:center;justify-content:center;font-size:21px;opacity:.85}' +
      '.smeta-stanciya{position:absolute;top:14px;font-size:16px;transform:translateX(-50%);filter:drop-shadow(0 0 7px rgba(201,168,76,.55))}' +
      '.smeta-obhod{position:absolute;bottom:7px;left:38%;font-size:14px;opacity:.6;transition:opacity .5s}' +
      '.smeta-popytki{font-size:12.5px;color:#7a9ab8;margin-bottom:8px}.smeta-prim{font-size:11.5px;color:#5f7a94;margin-top:12px;line-height:1.5}' +
      '@media(prefers-reduced-motion:reduce){.smeta-potok i{animation:none}}';
    document.head.appendChild(css);
  }
  var html = (d.vvod_ru ? '<p class="smeta-lead">' + d.vvod_ru + '</p>' : '') + '<div class="smeta-plashki">';
  (d.plashki || []).forEach(function(p){ html += '<div><span>' + esc(p.podpis) + '</span><b>' + esc(p.znachenie) + '</b></div>'; });
  html += '</div><div class="smeta-ruchki">';
  P.forEach(function(p, i){
    html += '<label>' + esc(p.nazvanie) + ' <span class="lv" data-lv="' + i + '"></span>' +
      '<input type="range" min="0" max="' + (p.urovni.length - 1) + '" step="1" data-p="' + i + '">' +
      (p.podskazka ? '<div class="sub">' + esc(p.podskazka) + '</div>' : '') + '</label>';
  });
  html += '</div><div class="smeta-scena" aria-hidden="true">' +
    (S.nachalo ? '<div class="smeta-konec" style="left:0">' + esc(S.nachalo) + '</div>' : '') +
    (S.konec ? '<div class="smeta-konec" style="right:0">' + esc(S.konec) + '</div>' : '') +
    '<div class="smeta-truba"><div class="smeta-potok"></div></div><div data-stancii></div>' +
    (S.obhod ? '<div class="smeta-obhod">' + esc(S.obhod) + '</div>' : '') + '</div>' +
    '<div class="smeta-pribory"><div><span>' + esc(d.vyhod.nazvanie) + '</span><b data-q></b></div>' +
    '<div><span>' + esc(d.stoimost.nazvanie) + '</span><b data-c></b></div>' +
    (d.cena ? '<div><span>' + esc(d.cena.nazvanie) + '</span><b data-pr></b></div>' : '') + '</div>' +
    '<div class="smeta-popytki" data-try></div>' +
    '<button class="btn gold" type="button" data-pusk style="width:100%">' + esc(d.pusk_ru) + '</button>' +
    (d.primechanie_ru ? '<div class="smeta-prim">' + d.primechanie_ru + '</div>' : '');
  m.innerHTML = html;
  var q$ = function(s){ return m.querySelector(s); };
  var inp = m.querySelectorAll('input[data-p]'), truba = q$('.smeta-truba'), potok = q$('.smeta-potok');
  var tries, won, best;
  var ed = function(t){ return ' <small>' + esc(t) + '</small>'; };
  function urovni(){ var u = []; for (var i = 0; i < inp.length; i++) u.push(+inp[i].value); return u; }
  function calc(u){
    var q = d.koef, c = 0, stoit = false;
    P.forEach(function(p, i){ var l = p.urovni[u[i]]; q *= l.mnozhitel; c += l.stoimost; if (l.mnozhitel === 0) stoit = true; });
    var r = d.vyhod.okruglenie;
    return { q: stoit ? 0 : Math.round(q / r) * r, c: Math.round(c) };
  }
  function draw(){
    var u = urovni(), r = calc(u);
    P.forEach(function(p, i){ q$('[data-lv="' + i + '"]').textContent = p.urovni[u[i]].podpis; });
    var t = S.tolshchina != null ? u[S.tolshchina] : 1;
    truba.style.height = (7 + t * 5) + 'px';
    var st = '', n = S.stancii != null ? u[S.stancii] : 0;
    for (var i = 0; i < n; i++) st += '<div class="smeta-stanciya" style="left:' + (15 + i * 26) + '%">' + esc(S.stanciya || '') + '</div>';
    q$('[data-stancii]').innerHTML = st;
    var f = '';
    if (r.q > 0){
      var k = r.q / d.cel, dur = Math.max(.55, 3.2 - k * 16 / 9), cnt = Math.min(9, 2 + Math.round(k * 40 / 11));
      for (var j = 0; j < cnt; j++) f += '<i style="animation-duration:' + dur.toFixed(2) + 's;animation-delay:' + (-dur * j / cnt).toFixed(2) + 's"></i>';
    }
    potok.innerHTML = f;
    var ob = q$('.smeta-obhod'); if (ob) ob.style.opacity = r.q >= d.cel ? 0 : .6;
    var qe = q$('[data-q]'); qe.innerHTML = r.q ? fmt(r.q) + ed(d.vyhod.edinica) : esc(d.vyhod.nol_ru); qe.className = r.q >= d.cel ? 'ok' : 'no';
    var ce = q$('[data-c]'); ce.innerHTML = fmt(r.c) + ed(d.stoimost.edinica); ce.className = r.c <= d.smeta ? 'ok' : 'no';
    if (d.cena){ var pe = q$('[data-pr]'); pe.innerHTML = r.q ? (r.c * d.cena.mnozhitel / r.q).toFixed(d.cena.znakov).replace('.', ',') + ed(d.cena.edinica) : '—'; }
    return r;
  }
  function popytki(){ q$('[data-try]').textContent = sub(d.popytki_ru, { n: tries }) + (best ? sub(d.luchshaya_ru, { c: best }) : ''); }
  for (var i = 0; i < inp.length; i++) inp[i].addEventListener('input', draw);
  q$('[data-pusk]').onclick = function(){
    var r = draw(), o = { q: fmt(r.q), c: fmt(r.c), nehvat: Math.round((d.cel - r.q) / d.ishody.nehvat_delitel) };
    tries++;
    if (r.q >= d.cel && (!best || r.c < best)) best = r.c;
    popytki();
    if (r.q === 0) return ctx.itog(sub(d.ishody.nol_ru, o), 'bad');
    if (r.q < d.cel) return ctx.itog(sub(d.ishody.malo_ru, o), 'bad');
    if (r.c > d.smeta) return ctx.itog(sub(d.ishody.dorogo_ru, o), 'bad');
    ctx.itog(sub(d.ishody.pobeda_ru, o), 'ok');
    if (!won){ won = true; var pts = d.ochki_potom; for (var k = 0; k < d.ochki.length; k++) if (tries <= d.ochki[k].do_popytki){ pts = d.ochki[k].ochki; break; } ctx.ochki('pobeda', pts); }
  };
  function start(){ for (var i = 0; i < inp.length; i++) inp[i].value = P[i].start; tries = 0; best = null; won = false; popytki(); draw(); }
  start(); ctx.itog(d.start_ru);
  return { zanovo: function(){ start(); ctx.itog(d.start_ru); } };
});
