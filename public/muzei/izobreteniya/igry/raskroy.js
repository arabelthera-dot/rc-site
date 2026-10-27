/* Игра 01-19 (раскрой листа + лента лет) — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-19.html (Р302);
   разметка — src/data/igry/izobreteniya/raskroy.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  function msg(t, cls){ var m=$('listMsg'); m.className='lab-msg'+(cls?' '+cls:''); m.textContent=t; }

  /* ── РАСКРОЙ ── лист 12×8 клеток (холст 600×400, клетка 50). Заказ: 2 щита 6×4, 2 малых щита 3×4, 2 полосы 6×2 = 96 клеток = весь лист.
     Детали перетаскиваются пальцем или мышью (pointer events), «по Канторовичу» — плавная укладка, затем лента лет 1939 → 1947 (Данциг). */
  var cv=$('cvList'), c=cv.getContext('2d'), C=50, GW=12, GH=8;
  var TYPES=[{id:'A',name:'Щит 6×4',w:6,h:4,col:'#c9a84c'},{id:'B',name:'Малый щит 3×4',w:3,h:4,col:'#5aa6d6'},{id:'S',name:'Полоса 6×2',w:6,h:2,col:'#7fc48a'}];
  var PLAN=[['A',0,0,6,4],['A',0,4,6,4],['B',6,0,3,4],['B',9,0,3,4],['S',6,4,6,2],['S',6,6,6,2]];
  var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var placed=[], sel=0, rot=false, auto=false, drag=null, hover=null, done=false, lentaRun=0;
  function T_(id){ return TYPES.filter(function(t){return t.id===id;})[0]; }
  function left(t){ return 2-placed.filter(function(p){return p.t===t;}).length-(drag&&drag.t===t?1:0); }
  function used(){ return placed.reduce(function(s,p){return s+p.w*p.h;},0); }
  function free(x,y,w,h){
    if (x<0||y<0||x+w>GW||y+h>GH) return false;
    return !placed.some(function(p){ return x<p.x+p.w && p.x<x+w && y<p.y+p.h && p.y<y+h; });
  }
  function canAny(){
    return TYPES.some(function(T){ if(!left(T.id)) return false;
      for (var y=0;y<GH;y++) for (var x=0;x<GW;x++) if (free(x,y,T.w,T.h)||free(x,y,T.h,T.w)) return true; return false; });
  }
  function ease(t){ return 1-Math.pow(1-t,3); }
  function easeBack(t){ var s=1.4; t=t-1; return t*t*((s+1)*t+s)+1; }

  /* древесина листа — заранее, один раз */
  var grain=[]; for (var g=0; g<46; g++) grain.push({y:Math.random()*400, a:Math.random()*.08+.03, k:Math.random()*6+2, ph:Math.random()*6});

  var row=$('pieceRow'), pbtn=[];
  TYPES.forEach(function(T,i){ var b=document.createElement('button'); b.type='button'; b.className='kz-piece kz-piece-'+T.id;
    b.innerHTML='<span class="kz-sw kz-sw-'+T.id+'" aria-hidden="true"></span><span class="kz-pn"></span>';
    b.addEventListener('pointerdown', function(e){ if(auto||!left(T.id)) return; sel=i; e.preventDefault();
      startDrag({t:T.id, w:rot?T.h:T.w, h:rot?T.w:T.h, from:null, ox:null, oy:null}, e); });
    b.onclick=function(){ sel=i; paintTray(); msg('Выбрано: '+T.name+'. Перетащи на лист или коснись листа, куда положить.'); };
    row.appendChild(b); pbtn.push(b); });
  function paintTray(){
    TYPES.forEach(function(T,i){ var n=left(T.id); pbtn[i].querySelector('.kz-pn').textContent=T.name+' · осталось '+n;
      pbtn[i].classList.toggle('sel', i===sel); pbtn[i].classList.toggle('empty', n<=0); pbtn[i].disabled=auto; });
  }

  /* ── рисование ── */
  function rr(x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
  function drawPiece(T,x,y,w,h,alpha,outline){
    var px=x*C+3, py=y*C+3, pw=w*C-6, ph=h*C-6;
    c.save(); c.globalAlpha=alpha;
    c.shadowColor='rgba(0,0,0,.35)'; c.shadowBlur=alpha<1?0:10; c.shadowOffsetY=alpha<1?0:4;
    c.fillStyle=T.col; rr(px,py,pw,ph,6); c.fill();
    c.shadowColor='transparent';
    var gr=c.createLinearGradient(0,py,0,py+ph); gr.addColorStop(0,'rgba(255,255,255,.28)'); gr.addColorStop(1,'rgba(0,0,0,.12)');
    c.fillStyle=gr; rr(px,py,pw,ph,6); c.fill();
    if (outline){ c.globalAlpha=1; c.lineWidth=4; c.strokeStyle=outline; rr(px,py,pw,ph,6); c.stroke(); }
    c.restore();
  }
  function paint(now){
    now=now||performance.now(); var moving=false;
    c.fillStyle='#d9b98a'; c.fillRect(0,0,cv.width,cv.height);
    grain.forEach(function(l){ c.strokeStyle='rgba(120,70,20,'+l.a+')'; c.lineWidth=1.4; c.beginPath();
      for (var x=0;x<=600;x+=20){ var yy=l.y+Math.sin(x/90*l.k/4+l.ph)*l.k; if(!x) c.moveTo(x,yy); else c.lineTo(x,yy);} c.stroke(); });
    c.strokeStyle='rgba(120,80,40,.28)'; c.lineWidth=1;
    for (var x=0;x<=GW;x++){c.beginPath();c.moveTo(x*C,0);c.lineTo(x*C,GH*C);c.stroke();}
    for (var y=0;y<=GH;y++){c.beginPath();c.moveTo(0,y*C);c.lineTo(GW*C,y*C);c.stroke();}
    /* обрезки — когда больше ничего не помещается */
    if (!auto && !drag && used()<96 && placed.length && !canAny()){
      c.save(); c.fillStyle='rgba(190,50,40,.22)'; c.strokeStyle='rgba(150,30,25,.55)'; c.lineWidth=2;
      for (var yy=0;yy<GH;yy++) for (var xx=0;xx<GW;xx++) if (free(xx,yy,1,1)){
        c.fillRect(xx*C,yy*C,C,C); c.beginPath(); c.moveTo(xx*C+8,yy*C+C-8); c.lineTo(xx*C+C-8,yy*C+8); c.stroke(); }
      c.restore();
    }
    placed.forEach(function(p){ var x=p.x,y=p.y,w=p.w,h=p.h;
      if (p.an){ var k=Math.min(1,Math.max(0,(now-p.an.t0)/p.an.d)); var e=p.an.back?easeBack(k):ease(k);
        x=p.an.x+(p.x-p.an.x)*e; y=p.an.y+(p.y-p.an.y)*e; w=p.an.w+(p.w-p.an.w)*e; h=p.an.h+(p.h-p.an.h)*e;
        if (k>=1) p.an=null; else moving=true; }
      drawPiece(T_(p.t),x,y,w,h,1); });
    var gh=drag||hover;
    if (gh && gh.gx!=null){ var ok=free(gh.gx,gh.gy,gh.w,gh.h);
      drawPiece(T_(gh.t),gh.gx,gh.gy,gh.w,gh.h,drag?.72:.4, ok?'#2fbf71':'#e0483e'); }
    paintTray(); meter();
    if (moving) requestAnimationFrame(paint);
  }

  /* ── счётчик листа ── */
  var shown=0, target=0, tw=null;
  function meter(){
    /* считаем только улёгшиеся детали: пока план «по Канторовичу» летит, счётчик растёт вместе с ним */
    var pct=Math.round(placed.reduce(function(s,p){return s+(p.an?0:p.w*p.h);},0)/96*100); if (pct===target) return; target=pct;
    $('otxBar').style.width=pct+'%';
    $('otxBar').classList.toggle('beat', pct>75);
    $('otxTxt').textContent=pct===100?'Отходы: ноль. У мастера «на глаз» — 25%.':(pct>75?'Ты уже обходишь мастера: у него в деле 75%.':'Отходы: '+(100-pct)+'% листа. У мастера «на глаз» — 25%.');
    if (RM){ shown=pct; $('otxNum').textContent=pct+'%'; return; }
    var from=shown, t0=performance.now(); cancelAnimationFrame(tw);
    (function st(n){ var k=Math.min(1,(n-t0)/500); shown=Math.round(from+(pct-from)*ease(k)); $('otxNum').textContent=shown+'%'; if(k<1) tw=requestAnimationFrame(st); })(t0);
  }

  /* ── перетаскивание ── */
  function cell(e, d){
    var r=cv.getBoundingClientRect();
    var inside=e.clientX>=r.left-C/2&&e.clientX<=r.right+C/2&&e.clientY>=r.top-C/2&&e.clientY<=r.bottom+C/2;
    if (!inside) return null;
    var fx=(e.clientX-r.left)*cv.width/r.width/C, fy=(e.clientY-r.top)*cv.height/r.height/C;
    var ox=d.ox==null?d.w/2:d.ox+.5, oy=d.oy==null?d.h/2:d.oy+.5;
    return {x:Math.max(0,Math.min(GW-d.w,Math.round(fx-ox))), y:Math.max(0,Math.min(GH-d.h,Math.round(fy-oy)))};
  }
  /* деталь «в руке» — плывёт за пальцем, пока он не над листом (над листом её показывает сам лист) */
  var ghost=document.createElement('div'); ghost.className='kz-ghost'; ghost.setAttribute('aria-hidden','true'); document.body.appendChild(ghost);
  function moveGhost(e){
    if (!drag || drag.gx!=null){ ghost.classList.remove('on'); return; }
    var r=cv.getBoundingClientRect(), k=r.width/GW, w=drag.w*k, h=drag.h*k;
    var ox=drag.ox==null?w/2:(drag.ox+.5)*k, oy=drag.oy==null?h/2:(drag.oy+.5)*k;
    ghost.style.width=w+'px'; ghost.style.height=h+'px';
    ghost.style.transform='translate('+(e.clientX-ox)+'px,'+(e.clientY-oy)+'px)';
    ghost.className='kz-ghost on kz-ghost-'+drag.t;
  }
  function startDrag(d, e){
    drag=d; drag.sx=e.clientX; drag.sy=e.clientY; drag.moved=false; hover=null;
    var p=cell(e,d); drag.gx=p?p.x:null; drag.gy=p?p.y:null;
    document.body.classList.add('kz-dragging'); moveGhost(e); paint();
  }
  window.addEventListener('pointermove', function(e){
    if (!drag){ return; }
    if (Math.abs(e.clientX-drag.sx)+Math.abs(e.clientY-drag.sy)>6) drag.moved=true;
    var p=cell(e,drag); drag.gx=p?p.x:null; drag.gy=p?p.y:null; moveGhost(e); paint();
  });
  function endDrag(e, cancel){
    if (!drag) return; var d=drag; drag=null; document.body.classList.remove('kz-dragging'); ghost.classList.remove('on');
    if (d.from && !d.moved){ /* касание уложенной детали — назад в заказ */
      msg('Деталь вернулась в заказ.'); paint(); return; }
    if (!cancel && d.gx!=null && free(d.gx,d.gy,d.w,d.h)){
      var r=cv.getBoundingClientRect(), fx=(e.clientX-r.left)*cv.width/r.width/C-d.w/2, fy=(e.clientY-r.top)*cv.height/r.height/C-d.h/2;
      placed.push({t:d.t,x:d.gx,y:d.gy,w:d.w,h:d.h,an:RM?null:{x:fx,y:fy,w:d.w,h:d.h,t0:performance.now(),d:220,back:true}});
      msg(d.from?'Деталь переложена.':'Деталь уложена.'); paint(); check(); return;
    }
    if (d.from){ placed.push({t:d.t,x:d.from.x,y:d.from.y,w:d.w,h:d.h}); msg('Сюда не легла — деталь вернулась на место. Попробуй повернуть.','bad'); }
    else if (d.gx!=null) msg('Сюда не помещается: деталь вылезает за край или налезает на другую. Нажми «Повернуть деталь».','bad');
    paint();
  }
  window.addEventListener('pointerup', function(e){ endDrag(e,false); });
  window.addEventListener('pointercancel', function(e){ endDrag(e,true); });
  cv.addEventListener('pointerdown', function(e){
    if (auto){ msg('Это план Канторовича. Нажми «Начать заново», чтобы раскроить самому.'); return; }
    e.preventDefault();
    var r=cv.getBoundingClientRect(), fx=(e.clientX-r.left)*cv.width/r.width/C, fy=(e.clientY-r.top)*cv.height/r.height/C;
    var gx=Math.floor(fx), gy=Math.floor(fy), hit=-1;
    placed.forEach(function(p,i){ if(gx>=p.x&&gx<p.x+p.w&&gy>=p.y&&gy<p.y+p.h) hit=i; });
    if (hit>=0){ var p=placed.splice(hit,1)[0];
      startDrag({t:p.t,w:p.w,h:p.h,from:{x:p.x,y:p.y},ox:gx-p.x,oy:gy-p.y}, e); return; }
    var T=TYPES[sel]; if(!left(T.id)){ var k=TYPES.filter(function(t){return left(t.id)>0;})[0];
      if (!k){ return; } sel=TYPES.indexOf(k); T=k; }
    startDrag({t:T.id,w:rot?T.h:T.w,h:rot?T.w:T.h,from:null,ox:null,oy:null}, e);
  });
  cv.addEventListener('pointermove', function(e){
    if (drag||auto||e.pointerType!=='mouse'){ return; }
    var T=TYPES[sel]; if(!left(T.id)){ hover=null; paint(); return; }
    var d={t:T.id,w:rot?T.h:T.w,h:rot?T.w:T.h,ox:null,oy:null}, p=cell(e,d);
    hover=p?{t:d.t,w:d.w,h:d.h,gx:p.x,gy:p.y}:null; paint();
  });
  cv.addEventListener('pointerleave', function(){ if(hover){ hover=null; paint(); } });

  function check(){
    if (used()===96){ if(!auto&&!done){ done=true; award('raskroy',25);
      msg('Весь заказ уложен — отходов ноль, у соседа четверть листа ушла в обрезки. Ты нашёл лучший план перебором; Канторович в 1939-м нашёл способ находить его без перебора — для любого числа деталей и станков.','ok');
      setTimeout(function(){ lenta(true); }, RM?0:700); }
      return; }
    if (!canAny()){ var n=TYPES.reduce(function(s,T){return s+left(T.id);},0);
      msg('Больше ничего не помещается: в заказе осталось деталей — '+n+', в обрезки уходит '+Math.round((96-used())/96*100)+'% листа. Переложи детали или нажми «Посчитать по Канторовичу».','bad'); }
  }
  $('rotGo').onclick=function(){ rot=!rot; this.classList.toggle('on',rot);
    msg(rot?'Детали из заказа лягут повёрнутыми.':'Детали из заказа лягут как в заказе.'); if(hover){ var t=hover.w; hover.w=hover.h; hover.h=t; } paint(); };
  document.addEventListener('keydown', function(e){ if((e.key==='r'||e.key==='к')&&!e.target.closest('input,textarea')&&document.activeElement&&document.activeElement.closest('#press')) $('rotGo').click(); });

  $('kantGo').onclick=function(){
    if (auto) return; auto=true; var now=performance.now(), pool=placed.slice(); placed=[];
    PLAN.forEach(function(q,i){
      var j=-1; pool.forEach(function(p,k){ if(j<0&&p.t===q[0]) j=k; });
      var src=j>=0?pool.splice(j,1)[0]:{x:q[1],y:GH+1,w:q[3],h:q[4]};
      placed.push({t:q[0],x:q[1],y:q[2],w:q[3],h:q[4],an:RM?null:{x:src.x,y:src.y,w:src.w,h:src.h,t0:now+i*150,d:760,back:true}});
    });
    award('plan',10); paint();
    msg('План по Канторовичу: большие щиты — друг над другом слева, малые — рядом справа, полосы — под ними. Отходов ноль. Метод разрешающих множителей приходит к такому плану без перебора — так же быстро для фабрики из восьми станков и пяти работ, как в задаче 1938 года.','ok');
    setTimeout(function(){ lenta(false); }, RM?0:150*PLAN.length+900);
  };
  $('listReset').onclick=function(){ placed=[]; auto=false; rot=false; done=false; drag=null; $('rotGo').classList.remove('on');
    lentaRun++; var L=$('lenta'); L.classList.remove('show'); L.hidden=true; paint(); msg('Лист чистый. Уже полученные баллы сохраняются и повторно не начисляются.'); };

  /* ── лента лет 1939 → 1947 ── */
  var Y0=1939, Y1=1947, ticks=$('lentaTicks');
  for (var yr=Y0; yr<=Y1; yr++){ var s=document.createElement('span'); s.className='kz-tick'+((yr-Y0)%4===0?' big':''); s.dataset.y=yr; s.innerHTML='<i></i><em>'+yr+'</em>'; ticks.appendChild(s); }
  function let_(n){ var a=n%10,b=n%100; return (a===1&&b!==11)?'год':(a>=2&&a<=4&&(b<12||b>14))?'года':'лет'; }
  function lenta(mine){
    var L=$('lenta'), run=++lentaRun; L.hidden=false;
    L.querySelector('.kz-lenta-kicker').textContent=(mine?'Твой лист готов':'План Канторовича готов')+' в 1939-м. А когда к этому придут в Америке?';
    ['lentaUs','lentaFora','lentaDanzig','lentaAgain'].forEach(function(id){ $(id).classList.remove('on','show'); });
    $('lentaFill').style.width='0%'; $('lentaGod').textContent=Y0; $('foraNum').textContent='0'; $('foraWord').textContent='лет';
    [].forEach.call(ticks.children,function(t){ t.classList.remove('on'); });
    requestAnimationFrame(function(){ L.classList.add('show'); });
    if (L.getBoundingClientRect().top>window.innerHeight*.55) L.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});
    var DUR=RM?0:4200, t0=performance.now()+(RM?0:600);
    function fin(){
      $('lentaGod').textContent=Y1; $('lentaFill').style.width='100%';
      [].forEach.call(ticks.children,function(t){ t.classList.add('on'); });
      $('lentaUs').classList.add('on'); $('lentaFora').classList.add('show');
      var f0=performance.now();
      (function cnt(n){ if(run!==lentaRun) return; var k=RM?1:Math.min(1,(n-f0)/700), v=Math.round(8*ease(k));
        $('foraNum').textContent=v; $('foraWord').textContent=let_(v); if(k<1) requestAnimationFrame(cnt); })(f0);
      setTimeout(function(){ if(run!==lentaRun) return; $('lentaDanzig').classList.add('show'); $('lentaAgain').classList.add('show'); }, RM?0:800);
    }
    if (RM){ fin(); return; }
    (function step(n){
      if (run!==lentaRun) return;
      var k=Math.max(0,Math.min(1,(n-t0)/DUR)), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2, y=Y0+(Y1-Y0)*e;
      $('lentaFill').style.width=(e*100)+'%'; $('lentaGod').textContent=Math.floor(y+1e-6);
      [].forEach.call(ticks.children,function(t){ t.classList.toggle('on', +t.dataset.y<=y+1e-6); });
      if (k<1) requestAnimationFrame(step); else fin();
    })(performance.now());
  }
  $('lentaAgain').onclick=function(){ lenta(done&&!auto); };
  paint();
})();
