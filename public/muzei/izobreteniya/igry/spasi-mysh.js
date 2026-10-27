/* Игра 01-20 «Спаси мышь — и не сможешь» — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-20.html (Р302, r305);
   разметка — src/data/igry/izobreteniya/spasi-mysh.html. Нужна глобальная award() (assets/museum-score.js).
   Шкала модели — 70 дней (DNEY), подписи «из 70» и «70 дней — здорова» — от неё; в опыте Лунина было два с половиной месяца. */
(function(){
  var $ = function(id){return document.getElementById(id);};
  function msg(t, cls){ var m=$('opytMsg'); m.className='lab-msg'+(cls?' '+cls:''); m.textContent=t; }

  /* ── ОПЫТ ЛУНИНА «Спаси мышь — и не сможешь» (r169, Р176) ──
     Сроки гибели — «Витамины и антивитамины», гл. «О чём рассказали опыты на мышах» (bibliotekar.ru/2-7-93-vitaminy/6.htm):
     смесь 11–21 день, с содой (совет Бунге) 16–30, со всеми солями молока 20–31 (диссертация, с. 14); на молоке, выпаренном почти досуха, 2 из 3 здоровы 2,5 месяца (с. 15).
     День гибели — случайный внутри срока источника, но каждая следующая попытка не раньше предыдущей. */
  var SROK = {smes:[11,21], soda:[16,30], soli:[20,31]};
  var NAZV = {smes:'Смесь', soda:'Смесь + сода', soli:'Смесь + все соли'};
  var DNEY = 70, NS = 'http://www.w3.org/2000/svg';
  var KOLOR = {belok:'#f4efe2', zhir:'#f1cf63', sahar:'#ffffff', voda:'#8cc4ea', soda:'#d9e4ea', soli:'#c9b8a6'};
  var st = {L:{belok:0,zhir:0,sahar:0,voda:0}, R:false, dop:null, etap:'smes', run:null, last:0, done:{}};
  var t0 = performance.now(), lastT = t0, polozh = {x:70, dir:1, kolesoA:0, shag:0};
  var myshL = $('myshL'), myshR = $('myshR');

  function smesGotova(){ var L=st.L; return L.belok&&L.zhir&&L.sahar&&L.voda; }
  function skolkoL(){ var n=0; for (var k in st.L) if (st.L[k]) n++; return n; }
  function gotovo(){ return smesGotova() && st.R && (st.etap==='smes' || st.dop===st.etap); }
  function podpisi(){
    var r = st.run, d = r ? Math.floor(r.day) : 0;
    if (r && r.dead) $('txtL').textContent = 'Не выжила: '+r.death+'-й день.';
    else if (r) $('txtL').textContent = 'День '+d+': '+(zdorovie(r.day)>.75 ? 'ест и бегает.' : zdorovie(r.day)>.35 ? 'слабеет.' : 'почти не встаёт.');
    else { var n=skolkoL(); $('txtL').textContent = n ? (n<4 ? 'В миске '+n+' из 4.' : 'Корм готов'+(st.dop==='soda'?' + сода.':st.dop==='soli'?' + все соли.':'.')) : 'Миска пуста.'; }
    $('txtR').textContent = r ? 'День '+d+': здорова, бегает в колесе.' : (st.R ? 'Молоко налито.' : 'Миска пуста.');
  }
  /* здоровье левой: ровно до ~половины срока, потом плавно гаснет к дню гибели */
  function zdorovie(d){ var r=st.run; if (!r) return 1; var a=r.death*.5; return d<=a ? 1 : Math.max(0, 1-(d-a)/(r.death-a)); }

  function napolnit(k){ /* уровень корма в миске растёт с каждой баночкой */
    if (k==='R'){ var m=$('kormR'); m.setAttribute('rx', st.R?29:0); m.setAttribute('ry', st.R?6:0); return; }
    var n=skolkoL(), e=$('kormL'), krup=$('krupL');
    e.setAttribute('rx', n?12+n*5.5:0); e.setAttribute('ry', n?3+n*.9:0);
    var cols=[]; ['belok','zhir','sahar','voda'].forEach(function(x){ if (st.L[x]) cols.push(KOLOR[x]); }); if (st.dop) cols.push(KOLOR[st.dop]);
    e.setAttribute('fill', cols.length ? cols[0] : 'none');
    while (krup.firstChild) krup.removeChild(krup.firstChild);
    cols.slice(1).forEach(function(c,i){ for (var j=0;j<4;j++){ var s=document.createElementNS(NS,'circle');
      s.setAttribute('cx', 172-22+((i*13+j*11)%44)); s.setAttribute('cy', 185+((i*3+j*2)%5)); s.setAttribute('r', 2.2); s.setAttribute('fill', c); krup.appendChild(s); } });
  }
  function vsplesk(id){ var g=$(id); g.classList.remove('plesk'); void g.getBBox(); g.classList.add('plesk'); }

  function polozhit(b){
    var k=b.dataset.k, x=b.dataset.b;
    if (st.run && !st.run.done) return;
    if (x==='moloko'){ if (st.R) return; st.R=true; napolnit('R'); vsplesk('miskaR'); }
    else if (x==='soda' || x==='soli'){ if (st.dop===x) return; novyeMyshi(); st.dop=x; napolnit('L'); vsplesk('miskaL'); }
    else { if (st.L[x]) return; st.L[x]=1; napolnit('L'); vsplesk('miskaL'); }
    b.classList.add('vzyato'); b.disabled=true;
    podpisi(); podskazka();
  }
  function podskazka(){
    $('pusk').disabled = !gotovo();
    if (st.run) return;
    if (!st.R && !skolkoL()) msg('Налей правой мыши молока, а левой собери корм: белок, жир, молочный сахар, вода.');
    else if (!smesGotova()) msg('В левой миске '+skolkoL()+' из 4. '+(st.R?'':'И не забудь молоко справа. ')+'Перетаскивай дальше.');
    else if (!st.R) msg('Корм готов — теперь налей молока правой мыши.');
    else if (st.etap==='soda' && st.dop!=='soda') msg('Руководитель Лунина, доцент Бунге, уверен: мышей губит кислота из корма. Подсыпь соды — перетащи баночку в левую миску.');
    else if (st.etap==='soli' && st.dop!=='soli') msg('Может, дело в солях? Добавь все соли молока, до грамма — как сделал Лунин.');
    else msg('Всё, что знала наука 1880 года, — в миске. Жми «Пустить дни».', 'ok');
  }

  /* ── перетаскивание: палец и мышь (Pointer Events), касание без сдвига = положить ── */
  var drag=null;
  function miskaPod(x,y,k){ var r=$(k==='R'?'kletkaR':'kletkaL').getBoundingClientRect(); return x>=r.left-10&&x<=r.right+10&&y>=r.top-10&&y<=r.bottom+30; }
  document.querySelectorAll('.banka').forEach(function(b){
    b.addEventListener('pointerdown', function(e){
      if (b.disabled || (st.run && !st.run.done)) return;
      var r=b.getBoundingClientRect(), g=b.cloneNode(true);
      g.classList.add('prizrak'); g.removeAttribute('hidden'); g.style.width=r.width+'px'; g.style.left=r.left+'px'; g.style.top=r.top+'px';
      drag={b:b,g:null,proto:g,x0:e.clientX,y0:e.clientY,dx:e.clientX-r.left,dy:e.clientY-r.top,id:e.pointerId,moved:false};
      try{ b.setPointerCapture(e.pointerId); }catch(_){}
    });
    b.addEventListener('pointermove', function(e){
      if (!drag || drag.b!==b) return;
      if (!drag.moved && Math.hypot(e.clientX-drag.x0, e.clientY-drag.y0) < 8) return;
      if (!drag.moved){ drag.moved=true; drag.g=drag.proto; document.body.appendChild(drag.g); b.classList.add('nesut');
        $(b.dataset.k==='R'?'kletkaR':'kletkaL').classList.add('zhdyot'); }
      e.preventDefault();
      drag.g.style.transform='translate('+(e.clientX-drag.dx-parseFloat(drag.g.style.left))+'px,'+(e.clientY-drag.dy-parseFloat(drag.g.style.top))+'px) rotate(-8deg) scale(1.08)';
      $(b.dataset.k==='R'?'kletkaR':'kletkaL').classList.toggle('nad', miskaPod(e.clientX,e.clientY,b.dataset.k));
    });
    function konec(e, otmena){
      if (!drag || drag.b!==b) return;
      var d=drag; drag=null; b.classList.remove('nesut');
      var kl=$(b.dataset.k==='R'?'kletkaR':'kletkaL'); kl.classList.remove('zhdyot','nad');
      if (!d.moved){ if (!otmena) polozhit(b); return; }
      var hit=!otmena && miskaPod(e.clientX,e.clientY,b.dataset.k);
      if (!hit){ var w=$(b.dataset.k==='R'?'kletkaL':'kletkaR').getBoundingClientRect();
        if (!otmena && e.clientX>=w.left&&e.clientX<=w.right&&e.clientY>=w.top&&e.clientY<=w.bottom)
          msg(b.dataset.k==='R' ? 'Молоко — правой мыши, в правую миску.' : 'Это для левой мыши — в левую миску.', 'bad'); }
      if (hit) polozhit(b);
      d.g.classList.add('nazad'); d.g.style.transform = hit ? d.g.style.transform+' scale(.2)' : 'translate(0,0)'; d.g.style.opacity='0';
      setTimeout(function(){ d.g.remove(); }, 320);
    }
    b.addEventListener('pointerup', function(e){ konec(e,false); });
    b.addEventListener('pointercancel', function(e){ konec(e,true); });
    b.addEventListener('keydown', function(e){ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); polozhit(b); } });
  });

  /* ── время ── */
  function pusk(){
    if (!gotovo() || (st.run && !st.run.done)) return;
    var s=SROK[st.etap], hi=s[1]-(st.etap==='smes'?3:st.etap==='soda'?3:0), lo=Math.min(hi, Math.max(s[0], st.last+2));
    st.run={v:st.etap, day:0, death:lo+Math.floor(Math.random()*(hi-lo+1)), dead:false, done:false, tDead:0};
    $('pusk').disabled=true; $('opyt').classList.add('idyot');
    msg(st.etap==='smes' ? 'Дни пошли. Смотри на обе клетки.' : st.etap==='soda' ? 'Сода в корме. Дни пошли…' : 'Все соли молока в корме. Дни пошли…');
  }
  function tik(now){
    var dt=Math.min(.05,(now-lastT)/1000), t=(now-t0)/1000; lastT=now;
    var r=st.run, h=1;
    if (r && !r.done){
      var v = r.dead ? 14 : 4.2;                                     /* суток в секунду: до гибели медленно, потом быстрее */
      r.day=Math.min(DNEY, r.day+v*dt);
      if (!r.dead && r.day>=r.death){ r.dead=true; r.day=r.death; r.tDead=t; gibel(); }
      if (r.day>=DNEY){ r.done=true; konecOpyta(); }
      $('den').textContent='день '+Math.floor(r.day); $('denBar').style.width=(r.day/DNEY*100)+'%';
      var noch=(1-Math.cos(r.day*Math.PI*2))/2*.28; $('nochL').setAttribute('opacity',noch); $('nochR').setAttribute('opacity',noch);
      podpisi();
    }
    if (r) h=zdorovie(r.day);
    /* левая мышь: бегает, к сроку замедляется, ложится, гаснет */
    var sp = r && r.dead ? 0 : (.25+.75*h)*(r && !r.done ? 1 : .55);
    polozh.x += polozh.dir*sp*38*dt; if (polozh.x>112){ polozh.x=112; polozh.dir=-1; } if (polozh.x<56){ polozh.x=56; polozh.dir=1; }
    polozh.shag += sp*dt*14;
    var lezh = r && r.dead ? Math.min(1,(t-r.tDead)/1.6) : 0;
    var hud = 1-.16*(1-h), bob = Math.sin(polozh.shag)*1.6*sp;
    myshL.setAttribute('transform','translate('+polozh.x.toFixed(1)+' '+(186+lezh*4)+') scale('+(polozh.dir<0?-hud:hud).toFixed(3)+' '+(hud*(1-.28*lezh)).toFixed(3)+') rotate('+(-6*lezh)+') translate(0 '+bob.toFixed(2)+')');
    myshL.setAttribute('opacity', (1-.5*lezh).toFixed(2));
    myshL.style.filter = 'saturate('+(h*.8+.2-.2*lezh).toFixed(2)+')';
    $('glazL').setAttribute('opacity', lezh>.5 ? 0 : 1); $('glazZL').setAttribute('opacity', lezh>.5 ? 1 : 0);
    var l1=Math.sin(polozh.shag)*2*sp; $('lapaL1').setAttribute('d','M-12 -2 l'+l1.toFixed(1)+' 4'); $('lapaL2').setAttribute('d','M14 -2 l'+(-l1).toFixed(1)+' 4');
    /* правая: на молоке бодра; пока идут дни — в колесе, колесо крутится */
    var vKolese = r && !r.done;
    if (vKolese){ polozh.kolesoA = (polozh.kolesoA + dt*260)%360; var b2=Math.sin(t*18)*1.5;
      myshR.setAttribute('transform','translate(66 '+(166+b2).toFixed(1)+') scale(.82)');
      var l2=Math.sin(t*18)*3; $('lapaR1').setAttribute('d','M-12 -2 l'+l2.toFixed(1)+' 4'); $('lapaR2').setAttribute('d','M14 -2 l'+(-l2).toFixed(1)+' 4'); }
    else { var nib=st.R ? Math.max(0,Math.sin(t*2.4))*2 : 0; myshR.setAttribute('transform','translate(118 '+(186+nib).toFixed(1)+')'); }
    $('spicyR').setAttribute('transform','rotate('+polozh.kolesoA.toFixed(1)+' 74 112)');
    requestAnimationFrame(tik);
  }
  function gibel(){
    msg('Левая мышь не выжила — '+st.run.death+'-й день. А правая на молоке бегает в колесе. Дни идут дальше…','bad');
  }
  function stroka(v, den){
    var row=document.createElement('div'); row.className='srok';
    row.innerHTML='<span class="srok-n"></span><span class="srok-p"><i class="gibel"></i></span><span class="srok-d"></span>';
    row.firstChild.textContent=NAZV[v]; row.lastChild.textContent='не выжила — '+den+'-й день';
    $('sroki').appendChild(row); var i=row.querySelector('i'); requestAnimationFrame(function(){ requestAnimationFrame(function(){ i.style.width=(den/DNEY*100)+'%'; }); });
  }
  function konecOpyta(){
    var r=st.run; st.last=r.death; st.done[r.v]=r.death; $('opyt').classList.remove('idyot');
    $('sroki').hidden=false; stroka(r.v, r.death);
    if (r.v==='smes'){ award('opyt',20); st.etap='soda'; pokazat('soda');
      msg('Так и было у Лунина: на «идеальной» смеси мыши жили 11–21 день, на сгущённом молоке — два с половиной месяца. Доцент Бунге уверен: виновата кислота. Перетащи соду в левую миску.'); }
    else if (r.v==='soda'){ st.etap='soli'; pokazat('soli');
      msg('Сода не спасла — гибель лишь сдвинулась (в опытах Лунина — между 16-м и 30-м днём). Тема Лунина — соли. Добавь все соли молока, до грамма.'); }
    else { award('soli',15); st.etap='konec'; final(); }
  }
  function pokazat(x){
    var b=document.querySelector('.banka[data-b="'+x+'"]'); b.hidden=false; b.disabled=false; b.classList.remove('vzyato'); b.classList.add('poyavis');
    $('pusk').disabled=true; $('pusk').textContent='Пустить дни ещё раз';
  }
  function novyeMyshi(){ /* новая пара мышей, тот же корм, новая добавка */
    st.run=null; polozh.x=70; polozh.dir=1;
    $('den').textContent='день 0'; $('denBar').style.width='0'; $('nochL').setAttribute('opacity',0); $('nochR').setAttribute('opacity',0);
    if (st.dop){ var old=document.querySelector('.banka[data-b="'+st.dop+'"]'); if (old) old.hidden=true; }
    st.dop=null;
  }
  function final(){
    msg('Даже все соли молока, до грамма, не спасли. Белок есть, жир, сахар, вода, соли — а мышь гибнет. Значит, в молоке есть что-то ещё.','ok');
    $('vopros').classList.add('gorit'); $('vopros').setAttribute('opacity',1);
    $('kletkaR').classList.add('final'); $('vyvod').hidden=false;
    $('pusk').disabled=true; $('pusk').textContent='Опыт Лунина пройден';
    setTimeout(function(){ $('vyvod').classList.add('vidno'); },50);
  }
  function sbros(){
    if (st.run && !st.run.done) return;
    st={L:{belok:0,zhir:0,sahar:0,voda:0}, R:false, dop:null, etap:'smes', run:null, last:0, done:{}};
    polozh.x=70; polozh.dir=1;
    document.querySelectorAll('.banka').forEach(function(b){ b.disabled=false; b.classList.remove('vzyato','poyavis'); if (b.classList.contains('dop')) b.hidden=true; });
    $('kormL').setAttribute('rx',0); $('kormL').setAttribute('ry',0); napolnit('L'); napolnit('R');
    $('sroki').querySelectorAll('.srok:not(#srokM)').forEach(function(x){ x.remove(); }); $('sroki').hidden=true;
    $('vyvod').hidden=true; $('vyvod').classList.remove('vidno'); $('vopros').classList.remove('gorit'); $('vopros').setAttribute('opacity',0); $('kletkaR').classList.remove('final');
    $('den').textContent='день 0'; $('denBar').style.width='0'; $('pusk').textContent='Пустить дни';
    podpisi(); podskazka();
  }
  $('pusk').onclick=pusk; $('snova').onclick=sbros;
  podpisi(); requestAnimationFrame(tik);
})();
