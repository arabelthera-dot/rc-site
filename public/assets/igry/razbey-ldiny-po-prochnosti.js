/* Механика razbey-ldiny-po-prochnosti (образец — 01-08 «Пробей арктический лёд — как „Ермак“»,
   public/muzei/izobreteniya/igry/probey-led.js): поле льдин разной прочности, по каждой бьёшь, пока не станет водой.
   Числа и подписи — из dannye (схема в src/lib/igry-mehaniki.ts). */
RCIgry.dvizhok('razbey-ldiny-po-prochnosti', function(ctx){
  var d = ctx.dannye, m = ctx.mesto;
  m.innerHTML = '<div class="ld-pole" style="display:grid;grid-template-columns:repeat(' + d.kolonok + ',1fr);gap:6px;margin-bottom:14px"></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
    '<div style="font-size:13px;color:var(--muted)"></div><div style="font-size:13px;color:var(--muted)"></div></div>';
  var pole = m.querySelector('.ld-pole'), schet = m.children[1].children;
  var broken, hits;
  function cifry(){
    schet[0].innerHTML = d.slomano_ru + ': <b style="color:var(--gold-l)">' + broken + '</b> / ' + d.chislo;
    schet[1].innerHTML = d.udary_ru + ': <b>' + hits + '</b>';
  }
  // цвет надколотой льдины — по формуле образца: чем меньше осталось, тем темнее
  function cvet(frac){ return 'rgba(' + Math.round(90+frac*100) + ',' + Math.round(140+frac*45) + ',' + Math.round(190+frac*30) + ',.' + Math.round(6+frac*2) + ')'; }
  function ldina(vid){
    var div = document.createElement('div');
    div.style.cssText = 'aspect-ratio:1;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;font-weight:700;color:rgba(255,255,255,.7);transition:.15s;border:1px solid rgba(255,255,255,.15);user-select:none';
    div.style.background = vid.cvet; div.textContent = vid.podpis;
    var hp = vid.udarov;
    div.onclick = function(){
      if (hp <= 0) return;
      hits++; hp--;
      if (hp === 0){
        broken++;
        div.style.background = 'rgba(201,168,76,.15)'; div.style.borderColor = 'rgba(201,168,76,.3)';
        div.textContent = '💧'; div.style.cursor = 'default'; div.style.transform = 'scale(.95)';
        if (broken >= d.chislo){ ctx.itog(d.pobeda_ru); ctx.ochki('pobeda', d.ochki); }
      } else {
        div.style.background = cvet(hp / vid.udarov);
        div.style.transform = 'scale(1.05)'; setTimeout(function(){ div.style.transform = ''; }, 120);
      }
      cifry();
    };
    return div;
  }
  function zanovo(){
    broken = 0; hits = 0; pole.innerHTML = '';
    for (var i = 0; i < d.chislo; i++) pole.appendChild(ldina(d.vidy[Math.floor(Math.random() * d.vidy.length)]));
    cifry();
  }
  zanovo();
  return { zanovo: zanovo };
});
