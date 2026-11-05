/* Игра 01-17 — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-17.html (scripts/dni-shablon/iz-html.mjs, Р286);
   разметка — src/data/igry/izobreteniya/podemnaya-sila.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  var $ = function(id){return document.getElementById(id);};
  function msg(t, cls){ var m=$('wingMsg'); m.className='lab-msg'+(cls?' '+cls:''); m.textContent=t; }

  /* ── КРЫЛО: НАУГАД ИЛИ ПО ФОРМУЛЕ ── модель: подъёмная сила ~ угол до предела 15°, за пределом — срыв.
     Нужный угол = вес пилота / 7,5; запас ±6% силы. Наугад силу не видно, «глазами Жуковского» — стрелки и вихрь. */
  var cv=$('cvWing'), c=cv.getContext('2d'), W=cv.width, H=cv.height, KRIT=15, K=7.5, BAND=0.06, GROUND=H-34;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ugol=4, mode='blind', kg=70, crashes=0, zhWins=0, state='ready', fl=null, wrecks=[], bits=[], wreckFade=1;
  var KG=[70,88,61,79,93,66,84,57,75,90];
  var kgI=0;
  function nextKg(){ kgI=(kgI+1)%KG.length; kg=KG[kgI]; $('pilotKg').textContent=kg; }
  function ratio(a){ return a>KRIT ? 0.12 : (a/ (kg/K)); }
  function hillY(x){ return x<150 ? 210+ (x/150)*(x/150)*(GROUND-210) : GROUND; }
  var P=[]; for (var i=0;i<46;i++) P.push({x:Math.random()*W, y:20+Math.random()*(GROUND-60), s:.6+Math.random()*.7});
  function glider(x,y,rot,a,alpha){
    c.save(); c.globalAlpha=alpha==null?1:alpha; c.translate(x,y); c.rotate(rot); c.scale(1.35,1.35);
    c.save(); c.scale(-1,1); c.rotate(a*Math.PI/180);
    c.beginPath(); c.moveTo(-46,2); c.bezierCurveTo(-46,-10,-20,-15,6,-12); c.bezierCurveTo(28,-9,46,-2,54,1);
    c.bezierCurveTo(30,4,-16,8,-36,7); c.bezierCurveTo(-44,6,-46,4,-46,2); c.closePath();
    c.fillStyle='#e8eef5'; c.fill(); c.restore();
    c.strokeStyle='#c9a84c'; c.lineWidth=2.4; c.beginPath(); c.moveTo(-4,4); c.lineTo(-10,26); c.moveTo(6,4); c.lineTo(-2,26); c.stroke();
    c.fillStyle='#c9a84c'; c.beginPath(); c.arc(-6,30,5,0,7); c.fill(); c.fillRect(-9,34,6,14);
    c.restore();
  }
  function arrow(x,y,len,col,w){
    var d=len<0?-1:1; c.strokeStyle=col; c.fillStyle=col; c.lineWidth=w;
    c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-len+d*10); c.stroke();
    c.beginPath(); c.moveTo(x-9,y-len+d*12); c.lineTo(x+9,y-len+d*12); c.lineTo(x,y-len); c.closePath(); c.fill();
  }
  function vortex(x,y,t,al,drift){
    if (al<=0) return; c.strokeStyle='rgba(125,200,255,'+al.toFixed(2)+')'; c.lineWidth=2;
    for (var k=0;k<3;k++){ c.beginPath(); c.ellipse(x+drift,y,92+k*14,34+k*7,0,t*2+k,t*2+k+4.4); c.stroke(); }
  }
  function draw(t){
    c.fillStyle='#0b1a2a'; c.fillRect(0,0,W,H);
    P.forEach(function(p){ p.x+=(RM?0.6:1.8)*p.s; if (p.x>W){p.x=0;p.y=20+Math.random()*(GROUND-60);} c.fillStyle='rgba(140,200,255,.35)'; c.fillRect(p.x,p.y,6,1.4); });
    c.fillStyle='#3a2f22'; c.beginPath(); c.moveTo(0,H); for (var x=0;x<=W;x+=10) c.lineTo(x,hillY(x)); c.lineTo(W,H); c.closePath(); c.fill();
    c.fillStyle='#4f6b3a'; c.fillRect(0,GROUND,W,3);
    wrecks.forEach(function(w){ c.save(); c.globalAlpha=wreckFade; c.translate(w.x,w.y); c.rotate(w.r); c.fillStyle='#8c97a3'; c.fillRect(-w.l/2,-2,w.l,4); c.restore(); });
    bits.forEach(function(b){ c.save(); c.translate(b.x,b.y); c.rotate(b.r); c.fillStyle='#d6dde5'; c.fillRect(-b.l/2,-2,b.l,4); c.restore(); });
    var zh = mode==='zh';
    if (state==='ready'){
      var gx=96, gy=hillY(96)-70, r=ratio(ugol);
      glider(gx,gy,0,ugol);
      if (zh){
        var stall=ugol>KRIT, good=Math.abs(r-1)<=BAND && !stall;
        vortex(gx+4,gy-2,t, stall?0.25:0.25+Math.min(r,1.3)*0.45, stall? 40+Math.sin(t*3)*20 : 0);
        c.setLineDash([6,6]); c.strokeStyle='rgba(255,120,110,.8)'; c.lineWidth=2; c.beginPath(); c.moveTo(gx+46,gy-12-90); c.lineTo(gx+114,gy-12-90); c.stroke(); c.setLineDash([]);
        arrow(gx+80,gy-12, Math.max(10,Math.min(170,90*r)), good?'#5fe08a':(stall?'#ff8a6e':'#e8c66a'), 6);
        arrow(gx+80,gy+60, -90, 'rgba(255,120,110,.85)', 4);
      }
    } else if (fl){
      if (zh && !fl.crash) vortex(fl.x+4,fl.y-2,t, fl.stall?Math.max(0,.6-(t-fl.st)*0.4):0.6, fl.stall?(t-fl.st)*-160:0);
      if (!fl.gone) glider(fl.x,fl.y,fl.rot,ugol);
    }
  }
  function launch(){
    if (state!=='ready') return;
    var r=ratio(ugol), kind = ugol>KRIT ? 'srv' : (r<1-BAND ? 'malo' : (r>1+BAND ? 'mnogo' : 'ok'));
    state='fly'; fl={x:96,y:hillY(96)-70,vx:150,vy:0,rot:0,t:0,kind:kind,stall:kind==='srv',st:0,crash:false};
    if (fl.stall) fl.st=(performance.now()-t0)/1000;
    $('wingGo').disabled=true; $('ugol').disabled=true; award('podem',10);
    msg(mode==='zh'?'Старт по расчёту…':'Старт наугад…');
  }
  function step(dt,t){
    bits.forEach(function(b){ if (b.rest) return; b.vy+=420*dt; b.x+=b.vx*dt; b.y+=b.vy*dt; b.r+=b.vr*dt;
      if (b.y>=GROUND-2){ b.y=GROUND-2; b.rest=true; wrecks.push({x:b.x,y:b.y,r:b.r,l:b.l}); } });
    bits=bits.filter(function(b){return !b.rest;});
    if (state!=='fly' || !fl) return;
    fl.t+=dt; var k=fl.kind, g=300;
    if (k==='ok'){ fl.vy += (-g*0.04 - fl.vy*1.5)*dt; fl.rot += (-0.05-fl.rot)*dt*3; }
    else if (k==='malo'){ fl.vy += g*0.55*dt; fl.rot += (0.7-fl.rot)*dt*1.4; }
    else if (k==='mnogo'){ if (!fl.stall){ fl.vy += (-g*0.9)*dt; fl.rot += (-0.9-fl.rot)*dt*2.2; if (fl.t>0.75){ fl.stall=true; fl.st=t; } }
      else { fl.vy += g*1.1*dt; fl.vx*=1-dt*0.9; fl.rot += 3.2*dt; } }
    else { if (fl.t<0.35) fl.vy += -g*0.2*dt; else { fl.vy += g*1.2*dt; fl.vx*=1-dt*0.8; fl.rot += 2.6*dt; } }
    fl.x+=fl.vx*dt; fl.y+=fl.vy*dt;
    if (k==='ok' && fl.x>W+60){ fl.gone=true; finish(true); return; }
    if (fl.y+52>=hillY(fl.x) && fl.t>0.2){ fl.crash=true; fl.gone=true;
      for (var i=0;i<7;i++) bits.push({x:fl.x+(i-3)*6,y:hillY(fl.x)-14,vx:fl.vx*0.3+(Math.random()-.5)*160,vy:-80-Math.random()*140,r:Math.random()*3,vr:(Math.random()-.5)*12,l:10+Math.random()*16});
      finish(false); }
  }
  function finish(ok){
    state='done';
    var a=String(ugol).replace('.',','), wasKg=kg, kind=fl.kind;
    if (!ok){ crashes++; $('crashN').textContent=crashes; var ic=document.createElement('i'); $('crashIcons').appendChild(ic);
      $('crashBox').classList.add('bump'); setTimeout(function(){ $('crashBox').classList.remove('bump'); },500); }
    var text, cls='bad';
    if (ok && mode==='zh'){
      zhWins++; cls='ok'; award('vihr',25); $('formula').classList.add('show');
      if (crashes>0 && zhWins===1){
        text='С первого раза! Наугад ты разбил '+crashes+' '+plural(crashes,'планёр','планёра','планёров')+' — а по формуле хватило одного расчёта. Этим Жуковский и перевернул авиацию в 1906 году.';
        $('crashBox').classList.add('pogas'); wreckFade=1; fade();
      } else text='Долетел: стрелка силы ровно на черте веса — пилот '+wasKg+' кг в воздухе. Следующий пилот другой — посчитай и его.';
    } else if (ok){ cls='ok'; text='Повезло — долетел с углом '+a+'°. Но следующий пилот весит иначе. Угадаешь снова?'; }
    else if (kind==='malo') text='Мало силы: при '+a+'° крыло не удержало пилота '+wasKg+' кг — планёр клюнул носом.';
    else if (kind==='mnogo') text='Перетянул: при '+a+'° нос задрался, поток над крылом сорвался — сваливание.';
    else text='Угол '+a+'° за пределом: поток сорвался сразу, вихрь ушёл с крыла — и сила пропала.';
    if (!ok && mode==='blind' && crashes>=2){ text+=' Так и учились до 1906 года — обломками. Включи «Глазами Жуковского».'; $('modeZh').classList.add('zovu'); }
    msg(text,cls);
    setTimeout(function(){ fl=null; state='ready'; nextKg(); $('wingGo').disabled=false; $('ugol').disabled=false; }, ok?900:1300);
  }
  function fade(){ var s=performance.now(); (function f(n){ wreckFade=Math.max(0,1-(n-s)/1600); if (wreckFade>0) requestAnimationFrame(f); else wrecks=[]; })(s); }
  function plural(n,a,b,c5){ var m=n%10,h=n%100; return (m===1&&h!==11)?a:(m>=2&&m<=4&&(h<12||h>14))?b:c5; }
  function setMode(m){ mode=m; $('modeBlind').classList.toggle('on',m==='blind'); $('modeZh').classList.toggle('on',m==='zh');
    $('modeBlind').setAttribute('aria-pressed',m==='blind'); $('modeZh').setAttribute('aria-pressed',m==='zh');
    $('zhLegend').hidden = m!=='zh'; $('modeZh').classList.remove('zovu');
    msg(m==='zh' ? 'Теперь видно то, что увидел Жуковский: вихрь вокруг крыла и стрелку силы. Поставь угол так, чтобы зелёная стрелка дошла до красной черты — и жми «В воздух».'
                 : 'Снова наугад: силы не видно, только угол. Пилот '+kg+' кг ждёт.'); }
  var last=performance.now(), t0=last;
  function loop(now){ var dt=Math.min(.05,(now-last)/1000); last=now; var t=(now-t0)/1000; step(dt,t); draw(t); requestAnimationFrame(loop); }
  $('ugol').addEventListener('input', function(){ ugol=+this.value; $('ugolTxt').textContent=String(ugol).replace('.',',')+'°'; });
  $('wingGo').onclick=launch;
  $('modeBlind').onclick=function(){ if (state==='ready') setMode('blind'); };
  $('modeZh').onclick=function(){ if (state==='ready') setMode('zh'); };
  requestAnimationFrame(loop);
})();
