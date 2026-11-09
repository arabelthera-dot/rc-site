/* Механика kazhdomu-svoyo-mesto (первые дни — 02-01 и 02-02 «Изобретений»): выбираешь подпись и ставишь её на своё место
   схемы или к своей цели; верная загорается своим именем, неверная — сообщение, все на месте — победа.
   Картинка (без надписей, Р18), места, подписи и сообщения — из dannye (схема в src/lib/igry-mehaniki.ts).
   Мышь и палец — нажатие на подпись, потом на место; клавиатура — Tab и Enter/пробел по тем же кнопкам. */
RCIgry.dvizhok('kazhdomu-svoyo-mesto', function(ctx){
  var d = ctx.dannye, m = ctx.mesto, K = d.kartinka;
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); };
  var MESTO = 'cursor:pointer;font:inherit;font-size:13px;font-weight:600;padding:8px 12px;border-radius:999px;' +
    'border:2px dashed var(--gold-l, #e2c46a);background:rgba(10,20,35,.82);color:#fff;min-width:44px;max-width:46%;min-height:44px;transition:.15s';
  var html = '';
  if (K) {
    html += '<figure style="margin:0 0 14px"><div style="position:relative;max-width:720px">' +
      '<img src="' + esc(K.src) + '" alt="' + esc(K.alt) + '" style="display:block;width:100%;height:auto;border-radius:10px">';
    d.mesta.forEach(function(p, i){
      // сдвиг по своей ширине на x% — подпись у края не вылезает за картинку
      html += '<button type="button" data-mesto="' + i + '" style="position:absolute;left:' + p.x + '%;top:' + p.y + '%;transform:translate(-' + p.x + '%,-50%);' + MESTO + '"></button>';
    });
    html += '</div>' + (K.podpis_ru ? '<figcaption style="font-size:13px;color:var(--muted);margin-top:6px">' + esc(K.podpis_ru) + '</figcaption>' : '') + '</figure>';
  } else {
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:14px">';
    d.mesta.forEach(function(p, i){ html += '<button type="button" data-mesto="' + i + '" style="' + MESTO + ';border-radius:12px;padding:14px;max-width:none"></button>'; });
    html += '</div>';
  }
  html += '<div role="group" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px" data-podpisi></div>' +
    '<div style="font-size:13px;color:var(--muted)" data-ostalos></div>';
  m.innerHTML = html;
  var mestaEl = m.querySelectorAll('[data-mesto]'), podpisiEl = m.querySelector('[data-podpisi]'), ostalosEl = m.querySelector('[data-ostalos]');
  var vybrana, postavleno;

  function mestoVid(i){
    var b = mestaEl[i], p = d.mesta[i], est = postavleno[p.kod];
    b.textContent = est ? est.tekst : (p.nazvanie || String(i + 1));
    b.setAttribute('aria-label', est ? est.tekst + ' — на месте' : (p.nazvanie || String(i + 1)));
    b.style.borderStyle = est ? 'solid' : 'dashed';
    b.style.borderColor = est ? '#3f9b52' : 'var(--gold-l, #e2c46a)';
    b.style.background = est ? 'rgba(40,120,60,.9)' : 'rgba(10,20,35,.82)';
    b.style.cursor = est ? 'default' : 'pointer';
  }
  function podpisVid(b, p){
    var na = postavleno[p.mesto] === p, vyb = vybrana === p;
    b.disabled = na; b.setAttribute('aria-pressed', vyb ? 'true' : 'false');
    b.className = 'btn' + (vyb ? ' gold' : ' ghost');
    b.style.cssText = 'padding:10px 16px;min-height:44px' + (na ? ';opacity:.35;text-decoration:line-through;cursor:default' : '');
  }
  function risovat(){
    for (var i = 0; i < mestaEl.length; i++) mestoVid(i);
    var kn = podpisiEl.children;
    for (var j = 0; j < kn.length; j++) podpisVid(kn[j], d.podpisi[j]);
    var n = d.mesta.length - Object.keys(postavleno).length;
    ostalosEl.textContent = n ? d.ostalos_ru.replace('{n}', n) : '';
  }
  function postavit(i){
    var p = d.mesta[i];
    if (postavleno[p.kod]) return;
    if (!vybrana) { ctx.itog(d.vyberi_ru); return; }
    if (vybrana.mesto !== p.kod) { ctx.itog(vybrana.mimo_ru || d.mimo_ru, 'bad'); return; }
    postavleno[p.kod] = vybrana; vybrana = null;
    risovat();
    if (Object.keys(postavleno).length === d.mesta.length) { ctx.itog(d.pobeda.soobshchenie_ru, 'ok'); ctx.ochki('pobeda', d.pobeda.ochki); }
    else ctx.itog(p.verno_ru, 'ok');
    mestaEl[i].focus();
  }
  for (var i = 0; i < mestaEl.length; i++) (function(i){ mestaEl[i].addEventListener('click', function(){ postavit(i); }); })(i);
  function zanovo(){
    vybrana = null; postavleno = {};
    podpisiEl.innerHTML = '';
    // подписи каждый раз в новом порядке, чтобы место не угадывалось по очереди
    var por = d.podpisi.map(function(_, i){ return i; });
    for (var k = por.length - 1; k > 0; k--) { var r = Math.floor(Math.random() * (k + 1)), t = por[k]; por[k] = por[r]; por[r] = t; }
    d.podpisi = por.map(function(i){ return d.podpisi[i]; });
    d.podpisi.forEach(function(p){
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = p.tekst;
      b.addEventListener('click', function(){ vybrana = vybrana === p ? null : p; ctx.itog(''); risovat(); });
      podpisiEl.appendChild(b);
    });
    risovat();
  }
  zanovo();
  return { zanovo: zanovo };
});
