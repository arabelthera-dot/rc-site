/* Механика soberi-sloi (февраль — 02-06 «Зелинский, угольный противогаз», 02-18 «Докучаев, почвоведение»):
   расставляешь слои сверху вниз — выбираешь слой и ставишь его на место, верный загорается своим цветом,
   все на месте — победа. Слои, цвета, подписи и сообщения — из dannye (схема в src/lib/igry-mehaniki.ts).
   Сцена — столбик полос-слоёв без надписей (Р18), слова — только вёрсткой из dannye.
   Мышь и палец — нажатие на слой, потом на место; клавиатура — Tab и Enter/пробел по тем же кнопкам. */
RCIgry.dvizhok('soberi-sloi', function(ctx){
  var d = ctx.dannye, m = ctx.mesto;

  // Стрелка «сверху вниз» (без букв и эмодзи, Р18) и столбик мест: слот 0 — самый верх, дальше вниз.
  var html = '<svg aria-hidden="true" viewBox="0 0 24 20" style="display:block;margin:0 auto 4px;width:22px;height:18px">' +
      '<path d="M5 7 L12 15 L19 7" stroke="var(--gold-l,#e2c46a)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' +
    '<div role="group" aria-label="Места сверху вниз" data-stolb style="display:grid;gap:8px;margin-bottom:12px"></div>' +
    '<div role="group" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px" data-sloi></div>' +
    '<div style="font-size:13px;color:var(--muted)" data-ostalos></div>';
  m.innerHTML = html;
  var stolbEl = m.querySelector('[data-stolb]'), sloiEl = m.querySelector('[data-sloi]'), ostalosEl = m.querySelector('[data-ostalos]');

  var por = d.sloi.map(function(_, i){ return i; }); // порядок показа слоёв; индекс — правильный слот
  var vybrana = null, postavleno = {};

  for (var j = 0; j < d.sloi.length; j++) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('data-mesto', j);
    b.style.cssText = 'width:100%;min-height:56px;border-radius:12px;border:2px dashed var(--gold-l,#e2c46a);' +
      'background:rgba(10,20,35,.82);color:#fff;font:inherit;font-size:15px;font-weight:600;cursor:pointer;transition:.15s';
    stolbEl.appendChild(b);
  }
  var mestaEl = stolbEl.children;

  function mestoVid(i){
    var b = mestaEl[i], sl = d.sloi[i], est = postavleno[i];
    if (est) {
      b.textContent = sl.nazvanie_ru;
      b.setAttribute('aria-label', sl.nazvanie_ru + ' — на месте');
      b.style.borderStyle = 'solid'; b.style.borderColor = '#3f9b52';
      b.style.background = sl.cvet; b.style.color = '#fff'; b.style.textShadow = '0 1px 2px rgba(0,0,0,.55)';
      b.style.cursor = 'default';
    } else {
      b.textContent = String(i + 1);
      b.setAttribute('aria-label', 'Место ' + (i + 1));
      b.style.borderStyle = 'dashed'; b.style.borderColor = 'var(--gold-l,#e2c46a)';
      b.style.background = 'rgba(10,20,35,.82)'; b.style.color = 'rgba(255,255,255,.35)'; b.style.textShadow = 'none';
      b.style.cursor = 'pointer';
    }
  }
  function sloiVid(b, i){
    var na = postavleno[i], vyb = vybrana === i;
    b.disabled = na; b.setAttribute('aria-pressed', vyb ? 'true' : 'false');
    b.className = 'btn' + (vyb ? ' gold' : ' ghost');
    b.style.cssText = 'padding:10px 16px;min-height:44px' + (na ? ';opacity:.35;text-decoration:line-through;cursor:default' : '');
  }
  function risovat(){
    for (var i = 0; i < mestaEl.length; i++) mestoVid(i);
    var kn = sloiEl.children;
    for (var k = 0; k < kn.length; k++) sloiVid(kn[k], por[k]);
    var n = d.sloi.length - Object.keys(postavleno).length;
    ostalosEl.textContent = n ? d.ostalos_ru.replace('{n}', n) : '';
  }
  function postavit(i){
    if (postavleno[i]) return;
    if (vybrana === null) { ctx.itog(d.vyberi_ru); return; }
    if (vybrana !== i) { ctx.itog(d.mimo_ru, 'bad'); return; }
    postavleno[i] = true; vybrana = null;
    risovat();
    if (Object.keys(postavleno).length === d.sloi.length) { ctx.itog(d.pobeda.soobshchenie_ru, 'ok'); ctx.ochki('pobeda', d.pobeda.ochki); }
    else ctx.itog(d.sloi[i].poyasnenie_ru, 'ok');
    mestaEl[i].focus();
  }
  for (var i = 0; i < mestaEl.length; i++) (function(i){ mestaEl[i].addEventListener('click', function(){ postavit(i); }); })(i);

  function zanovo(){
    vybrana = null; postavleno = {};
    sloiEl.innerHTML = '';
    // слои каждый раз в новом порядке, чтобы место не угадывалось по очереди
    for (var k = por.length - 1; k > 0; k--) { var r = Math.floor(Math.random() * (k + 1)), t = por[k]; por[k] = por[r]; por[r] = t; }
    por.forEach(function(i){
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = d.sloi[i].nazvanie_ru;
      b.addEventListener('click', function(){ vybrana = vybrana === i ? null : i; ctx.itog(''); risovat(); });
      sloiEl.appendChild(b);
    });
    risovat();
  }
  zanovo();
  return { zanovo: zanovo };
});
