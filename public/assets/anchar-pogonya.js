/* Игра «Уйди от „Анчара“» (24 января). Движок — аркада M-13 со страницы 30 января (Котельников):
   цикл кадров с ограниченным dt, состояния «ждём → игра → итог», руль кнопками/пальцем/стрелками,
   защита координат от NaN. Добавлено: рукоять машинного телеграфа, погоня лодки по фазам, счёт расстояния. */
(function(){
  const root=document.querySelector('[data-anchar-igra]');if(!root)return;
  const cv=root.querySelector('canvas'),ctx=cv.getContext('2d');
  const $=s=>root.querySelector(s);
  const elTask=$('.an-task'),elSub=$('.an-sub'),elGap=$('.an-gap-num'),elTrend=$('.an-gap-trend');
  const elCv=$('.an-spd-cv'),elSv=$('.an-spd-sv'),elSu=$('.an-spd-su'),elMax=$('.an-max');
  const tg=$('.an-telegraf'),tgTrack=$('.an-tg-track'),tgKnob=$('.an-tg-knob'),tgFill=$('.an-tg-fill'),tgHand=$('.an-tg-hand');
  const bL=$('.an-left'),bR=$('.an-right'),fin=$('.an-finale'),finH=$('.an-fin-h'),again=$('.an-again'),elBest=$('.an-best'),elIntro=$('.an-intro');

  const K=6;                         // ускорение времени: игровая секунда = 6 настоящих
  const MS=kmh=>kmh/3.6*K;           // км/ч → игровые м/с
  const V_MIN=28,V_MAX=56,V_SUB=83;  // средний ход, «Саратога» на 30 узлах, «Анчар» на 44,7 узла
  const SIDE=130;                    // лодка держится сбоку, м
  const PASS_END=380;                // насколько лодка уходит вперёд к финалу, м

  let W=0,H=0,S=1,dpr=1,shook=0;
  let passA=0,shakes=0,turnT=0,best=0,bestEver=0,tries=0,c,sub,thr,steerBtn,steerDrag,st,T,phT,trail,subTrail,gapPrev,trendSm,maxSeen,raf,last;

  function reset(){
    c={x:0,y:0,h:0,v:MS(V_MIN)};
    sub={x:0,y:250,h:0,v:MS(V_MIN)};
    thr=0;steerBtn=0;steerDrag=0;st='wait';T=0;phT=0;trail=[];subTrail=[];gapPrev=null;trendSm=0;maxSeen=false;
    best=0;shakes=0;turnT=0;fin.hidden=true;setThr(0);tgHand.hidden=false;elIntro.hidden=false;
    say('Уйди от «Анчара»','Ты — капитан американского авианосца. Потяни золотой шар вверх до упора');
    elSv.textContent='тайна';elSu.hidden=true;elTrend.textContent='';elTrend.className='an-gap-trend';
    bL.classList.remove('zov');bR.classList.remove('zov');
  }
  function say(t,s){if(elTask.textContent!==t)elTask.textContent=t;if(elSub.textContent!==s)elSub.textContent=s;}

  // --- холст под размер и плотность экрана ---
  function resize(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=cv.clientWidth;H=cv.clientHeight;
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
    S=Math.min(W,H)/1100;            // пикселей на метр: в кадре ~1,1 км океана
  }

  // --- геометрия ---
  const fwd=h=>({x:Math.sin(h),y:-Math.cos(h)});
  const left=h=>({x:-Math.cos(h),y:-Math.sin(h)});
  const wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
  function turnTo(o,tx,ty,rate,dt){const d=wrap(Math.atan2(tx-o.x,-(ty-o.y))-o.h);o.h+=Math.max(-rate*dt,Math.min(rate*dt,d));}
  function along(){const f=fwd(c.h);return (sub.x-c.x)*f.x+(sub.y-c.y)*f.y;}
  function sideTarget(ahead){const f=fwd(c.h),l=left(c.h);return {x:c.x+l.x*SIDE+f.x*ahead,y:c.y+l.y*SIDE+f.y*ahead};}

  // --- шаг мира ---
  function step(dt){
    const steer=Math.max(-1,Math.min(1,steerBtn+steerDrag));
    const kmh=V_MIN+(V_MAX-V_MIN)*thr;
    c.v+=(MS(kmh)-c.v)*Math.min(1,dt/2.2);
    c.h=wrap(c.h+steer*0.42*dt);
    const f=fwd(c.h);c.x+=f.x*c.v*dt;c.y+=f.y*c.v*dt;
    if(!isFinite(c.x)||!isFinite(c.y)){c.x=0;c.y=0;}
    if(st==='wait'){ // до первого касания лодка идёт следом на том же расстоянии
      const b={x:c.x-f.x*250,y:c.y-f.y*250};sub.x+=(b.x-sub.x)*Math.min(1,dt*2);sub.y+=(b.y-sub.y)*Math.min(1,dt*2);sub.h=c.h;sub.v=c.v;
    }else{
      T+=dt;phT+=dt;
      if(st==='hope'){                       // лодка будто отстаёт — посетитель видит «дальше»
        sub.v+=(MS(30)-sub.v)*Math.min(1,dt);turnTo(sub,c.x,c.y,1.2,dt);
        if(phT>6){st='chase';phT=0;}  // у всех одинаково: отрыв зависит от того, как быстро дал полный ход
      }else if(st==='chase'){                // проснулась: 83 км/ч, срезает углы
        const t=sideTarget(0),d=Math.hypot(t.x-sub.x,t.y-sub.y);
        const want=d>160?MS(V_SUB):c.v+(MS(V_SUB)-c.v)*d/160;
        sub.v+=(want-sub.v)*Math.min(1,dt*1.5);turnTo(sub,t.x,t.y,1.6,dt);
        if(d<45){st='hold';phT=0;}
      }else if(st==='hold'){                 // держится рядом, повторяет каждый поворот
        const t=sideTarget(0);sub.x+=(t.x-sub.x)*Math.min(1,dt*3);sub.y+=(t.y-sub.y)*Math.min(1,dt*3);
        sub.h+=wrap(c.h-sub.h)*Math.min(1,dt*4);sub.v=c.v;
        turnT=Math.abs(steer)>0.8?turnT+dt:0;
        if(turnT>0.7&&shakes<2){shakes++;turnT=0;st='chase';phT=0;sub.v=MS(35);sub.h=wrap(sub.h+(steer>0?-0.5:0.5));shook=1.6;} // резкий поворот — лодка теряет тебя, ненадолго
        else if(phT>5){st='pass';phT=0;passA=0;}
      }else if(st==='pass'){                 // выходит вперёд на 83 км/ч
        sub.v+=(MS(V_SUB)-sub.v)*Math.min(1,dt*2);passA+=(sub.v-c.v)*dt;   // уходит вперёд ровно на разницу скоростей
        const t=sideTarget(passA);sub.x+=(t.x-sub.x)*Math.min(1,dt*4);sub.y+=(t.y-sub.y)*Math.min(1,dt*4);sub.h+=wrap(c.h-sub.h)*Math.min(1,dt*3);
        if(along()>=PASS_END||phT>12)finish();
      }
      if(st==='hope'||st==='chase'){const g=fwd(sub.h);sub.x+=g.x*sub.v*dt;sub.y+=g.y*sub.v*dt;}
      if(!isFinite(sub.x)||!isFinite(sub.y)){sub.x=c.x;sub.y=c.y+250;}
    }
    {const f2=fwd(c.h),Lm=Math.max(320,92/S);trail.push({x:c.x-f2.x*Lm*0.45,y:c.y-f2.y*Lm*0.45,a:0});}subTrail.push({x:sub.x,y:sub.y,a:0,v:sub.v});
    trail.forEach(p=>p.a+=dt);subTrail.forEach(p=>p.a+=dt);
    while(trail.length&&trail[0].a>3.2)trail.shift();while(subTrail.length&&subTrail[0].a>1.6)subTrail.shift();
    if(shook>0)shook-=dt;
    hud(dt);
  }

  // --- счёт и подсказки (вне картинки) ---
  function hud(dt){
    const g=along(),kc=Math.round(c.v/K*3.6),ks=Math.round(sub.v/K*3.6);
    if((st==='hope'||st==='chase')&&-g>best)best=-g;
    elCv.textContent=kc;
    const atMax=thr>0.98&&kc>=55;elMax.hidden=!atMax;if(atMax)maxSeen=true;
    if(st==='pass'||st==='end'){elSv.textContent=ks;elSu.hidden=false;}
    const r=Math.round(Math.abs(g)/10)*10;
    let txt;
    if(st==='hold'||(Math.abs(g)<60&&st!=='wait'&&st!=='hope'))txt='рядом с тобой';
    else txt=(g<0?'позади · ':'впереди · ')+r+' м';
    if(elGap.textContent!==txt)elGap.textContent=txt;
    if(gapPrev!==null&&dt>0){const rate=(Math.abs(g)-Math.abs(gapPrev))/dt*(g<0?1:-1);trendSm+=(rate-trendSm)*Math.min(1,dt*3);}
    gapPrev=g;
    let tr='',cl='';
    if(st==='wait'){}
    else if(st==='hold'){tr='не отстаёт';cl='near';}
    else if(g>=60){tr='обгоняет ▲';cl='near';}
    else if(trendSm>4){tr='дальше ▲ отрываешься';cl='far';}
    else if(trendSm<-4){tr='ближе ▼ догоняет';cl='near';}
    if(elTrend.textContent!==tr){elTrend.textContent=tr;elTrend.className='an-gap-trend '+cl;}
    // задание и подсказка
    if(st==='wait')return;
    if(st==='hope'){thr<0.98?say('Уходи!','Ещё! Шар до упора — чем быстрее, тем больше отрыв'):say('Отрываешься!','Полный ход — 56 км/ч. Держи курс');}
    else if(shook>0)say('Стряхнул! ('+shakes+' из 2)','«Анчар» потерял тебя… ненадолго');
    else if(st==='chase')say('«Анчар» прибавил ход!','Догоняет. Когда подойдёт — держи руль, резкий поворот его стряхнёт');
    else if(st==='hold')say('«Анчар» рядом с тобой',shakes<2?'Держи руль влево или вправо — стряхни его!':'Больше не стряхнуть — повторяет каждый поворот');
    else if(st==='pass')say('«Анчар» обгоняет тебя под водой!',thr<0.98?'Шар до упора — может, успеешь?':'56 км/ч — быстрее авианосец не может');
    const z=st==='chase'||st==='hold';bL.classList.toggle('zov',z&&!steerBtn);bR.classList.toggle('zov',z&&!steerBtn);
  }

  function start(){if(st!=='wait')return;st='hope';phT=0;tgHand.hidden=true;elIntro.hidden=true;}
  function finish(){
    st='end';const g=Math.round(along()/10)*10;

    const b=Math.round(best/10)*10;tries++;const rec=b>bestEver&&tries>1;bestEver=Math.max(bestEver,b);
    elBest.textContent='Твой лучший отрыв за игру — '+b+' м'+(shakes?', стряхнул «Анчар» '+shakes+' раз'+(shakes>1?'а':''):'')+(rec?' — новый рекорд!':tries>1?' (рекорд: '+bestEver+' м)':'')+'.';
    say('Уйти не удалось — как и «Саратоге» в 1971-м','Смотри ниже, что это было');
    elTrend.textContent='';
    fin.hidden=false;
    setTimeout(()=>fin.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'}),600);
  }

  // --- рисование: вид сверху, камера на авианосце ---
  function hash(i,j){const n=Math.sin(i*127.1+j*311.7)*43758.5453;return n-Math.floor(n);}
  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const cx=W/2,cy=H*0.55;
    const sx=x=>cx+(x-c.x)*S,sy=y=>cy+(y-c.y)*S;
    // океан
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0e4a72');g.addColorStop(1,'#0a3354');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // барашки, привязанные к миру, — по ним видна скорость
    const cell=110,x0=Math.floor((c.x-cx/S)/cell)-1,x1=Math.floor((c.x+cx/S)/cell)+1,y0=Math.floor((c.y-cy/S)/cell)-1,y1=Math.floor((c.y+(H-cy)/S)/cell)+1;
    ctx.strokeStyle='rgba(190,225,245,.22)';ctx.lineWidth=1.4;ctx.lineCap='round';
    for(let i=x0;i<=x1;i++)for(let j=y0;j<=y1;j++){const r=hash(i,j);if(r<0.35)continue;
      const wx=(i+hash(j,i))*cell,wy=(j+r)*cell,px=sx(wx),py=sy(wy),l=6+r*10;
      ctx.beginPath();ctx.moveTo(px-l,py);ctx.quadraticCurveTo(px,py-3,px+l,py);ctx.stroke();}
    // бурун лодки: светлая рябь над тенью, когда она идёт быстро
    subTrail.forEach(p=>{const a=1-p.a/1.6,sp=p.v/MS(V_SUB);if(sp<0.5)return;
      ctx.fillStyle='rgba(200,235,255,'+(0.10*a*sp)+')';ctx.beginPath();ctx.arc(sx(p.x),sy(p.y),(3+p.a*9)*Math.max(.6,S*2.4),0,7);ctx.fill();});
    // тень лодки под водой
    drawSub(sx(sub.x),sy(sub.y),sub.h);

    // кильватерный след авианосца
    if(trail.length>1){ctx.lineCap='round';
      for(let k=1;k<trail.length;k++){const p=trail[k],q=trail[k-1],a=1-p.a/3.2;
        ctx.strokeStyle='rgba(235,248,255,'+(0.35*a)+')';ctx.lineWidth=Math.max(2,(14+p.a*30)*S);
        ctx.beginPath();ctx.moveTo(sx(q.x),sy(q.y));ctx.lineTo(sx(p.x),sy(p.y));ctx.stroke();}}
    drawCarrier(cx,cy,c.h);
    {const qx=sx(sub.x),qy=sy(sub.y);let dx=qx-cx,dy=qy-cy;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
      ctx.save();ctx.font='800 15px Inter,system-ui,sans-serif';ctx.textBaseline='middle';ctx.shadowColor='rgba(0,0,0,.85)';ctx.shadowBlur=5;
      const ax=-dx,ay=-dy,cw=Math.max(320*S,92)*0.5;               // «ТЫ» — с другой стороны от лодки
      ctx.textAlign=ax>=0?'left':'right';ctx.fillStyle='#fff';ctx.fillText('ТЫ',cx+ax*36+(ax>=0?6:-6),cy+ay*Math.min(cw,60));
      ctx.textAlign=dx>=0?'left':'right';ctx.fillStyle='#ffb38a';ctx.fillText('«Анчар»',qx+dx*18+(dx>=0?10:-10),qy+dy*26);
      ctx.restore();}
    // лодка за краем кадра — стрелка у края
    const px=sx(sub.x),py=sy(sub.y);
    if(px<-10||px>W+10||py<-10||py>H+10){const a=Math.atan2(py-cy,px-cx),ex=Math.max(18,Math.min(W-18,px)),ey=Math.max(18,Math.min(H-18,py));
      ctx.save();ctx.translate(ex,ey);ctx.rotate(a);ctx.fillStyle='rgba(255,160,120,.9)';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-8,-9);ctx.lineTo(-8,9);ctx.closePath();ctx.fill();ctx.restore();}
  }
  function drawCarrier(x,y,h){
    const L=Math.max(320*S,92),B=L*0.16;
    ctx.save();ctx.translate(x,y);ctx.rotate(h);
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(4,6,B*0.62,L*0.52,0,0,7);ctx.fill();
    // корпус и палуба
    ctx.fillStyle='#8f99a3';ctx.beginPath();
    ctx.moveTo(0,-L/2);ctx.lineTo(B*0.42,-L*0.36);ctx.lineTo(B*0.5,L*0.46);ctx.lineTo(B*0.3,L/2);ctx.lineTo(-B*0.38,L/2);ctx.lineTo(-B*0.5,L*0.2);
    ctx.lineTo(-B*0.86,-L*0.05);ctx.lineTo(-B*0.62,-L*0.2);ctx.lineTo(-B*0.42,-L*0.36);ctx.closePath();ctx.fill();
    ctx.fillStyle='#6f7a85';ctx.save();ctx.translate(-B*0.12,L*0.12);ctx.rotate(-0.16);ctx.fillRect(-B*0.22,-L*0.36,B*0.44,L*0.62);ctx.restore(); // угловая палуба
    ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=Math.max(1,L/160);ctx.setLineDash([L/30,L/40]);
    ctx.beginPath();ctx.moveTo(0,-L*0.46);ctx.lineTo(0,L*0.44);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#3d4752';ctx.fillRect(B*0.22,-L*0.02,B*0.22,L*0.14);                         // надстройка-«остров»
    ctx.fillStyle='#c9d3dc';[-0.3,-0.12,0.28].forEach(k=>{ctx.fillRect(-B*0.15,L*k,B*0.3,L*0.03);}); // самолёты на палубе — светлые чёрточки
    ctx.restore();
  }
  function drawSub(x,y,h){
    const L=Math.max(107*S*2,56),B=L*0.13,t=performance.now()/1000;
    ctx.save();ctx.translate(x,y);ctx.rotate(h);
    ctx.globalAlpha=0.78+0.08*Math.sin(t*2.2);
    ctx.shadowColor='rgba(0,8,20,.9)';ctx.shadowBlur=10;
    ctx.fillStyle='#04121f';
    ctx.beginPath();ctx.ellipse(0,0,B/2,L/2,0,0,7);ctx.fill();
    ctx.beginPath();ctx.ellipse(0,-L*0.12,B*0.32,L*0.11,0,0,7);ctx.fill();                     // рубка
    ctx.beginPath();ctx.moveTo(-B*0.9,L*0.44);ctx.lineTo(B*0.9,L*0.44);ctx.lineTo(0,L*0.36);ctx.closePath();ctx.fill(); // кормовые рули
    ctx.restore();
  }

  function loop(ts){
    if(!last)last=ts;const dt=Math.min((ts-last)/1000,0.05);last=ts;
    if(st!=='end')step(dt);
    draw();
    raf=requestAnimationFrame(loop);
  }

  // --- рукоять машинного телеграфа ---
  function setThr(v){
    thr=Math.max(0,Math.min(1,v));
    const travel=tgTrack.clientHeight-tgKnob.offsetHeight-4;
    tgKnob.style.bottom=(2+thr*travel)+'px';tgFill.style.height=(thr*100)+'%';
    tg.setAttribute('aria-valuenow',Math.round(thr*100));
    tg.setAttribute('aria-valuetext',thr>0.98?'До упора':thr>0.5?'Полный ход':'Средний ход');
  }
  function thrFromY(e){const r=tgTrack.getBoundingClientRect(),k=tgKnob.offsetHeight/2;
    const v=1-(e.clientY-r.top-k)/(r.height-2*k);if(isFinite(v)){setThr(v);if(thr>0.02)start();}}
  let tgDrag=false;
  tg.addEventListener('pointerdown',e=>{e.preventDefault();tgDrag=true;tg.setPointerCapture&&tg.setPointerCapture(e.pointerId);thrFromY(e);});
  tg.addEventListener('pointermove',e=>{if(tgDrag)thrFromY(e);});
  ['pointerup','pointercancel'].forEach(ev=>tg.addEventListener(ev,()=>{tgDrag=false;}));
  tg.addEventListener('keydown',e=>{
    if(e.key==='ArrowUp'||e.key==='ArrowRight'||e.key==='PageUp'){e.preventDefault();setThr(thr+0.25);start();}
    if(e.key==='ArrowDown'||e.key==='ArrowLeft'||e.key==='PageDown'){e.preventDefault();setThr(thr-0.25);}
    if(e.key==='End'){setThr(1);start();}});

  // --- руль: кнопки, палец по картинке, стрелки ---
  function steerBind(b,d){
    b.addEventListener('pointerdown',e=>{e.preventDefault();steerBtn=d;b.classList.add('on');start();});
    ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,e=>{if(e&&e.cancelable)e.preventDefault();steerBtn=0;b.classList.remove('on');}));
    b.addEventListener('contextmenu',e=>e.preventDefault());}
  steerBind(bL,-1);steerBind(bR,1);
  let dragX=null;
  cv.addEventListener('pointerdown',e=>{e.preventDefault();dragX=e.clientX;cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);start();});
  cv.addEventListener('pointermove',e=>{if(dragX===null)return;const dx=e.clientX-dragX;steerDrag=Math.max(-1,Math.min(1,dx/60));});
  ['pointerup','pointercancel'].forEach(ev=>cv.addEventListener(ev,()=>{dragX=null;steerDrag=0;}));
  document.addEventListener('keydown',e=>{if(e.target===tg)return;
    if(e.key==='ArrowLeft'){steerBtn=-1;start();}if(e.key==='ArrowRight'){steerBtn=1;start();}
    if(e.key==='ArrowUp'){e.preventDefault();setThr(thr+0.25);start();}if(e.key==='ArrowDown'){e.preventDefault();setThr(thr-0.25);}});
  document.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')steerBtn=0;});

  again.addEventListener('click',()=>{reset();root.scrollIntoView({behavior:'smooth',block:'start'});});
  window.addEventListener('resize',()=>{resize();setThr(thr);});
  resize();reset();raf=requestAnimationFrame(loop);
  window.__anchar={get st(){return st;},get gap(){return along();},setThr,start}; // для браузерной проверки
})();
