/* Игры 01-01 «Дотяни сигнал до квартиры» и «Собери кабельный тракт» — скрипт как есть со страницы
   day-01jan-cabletv.html (r483a); разметка — src/data/igry/izobreteniya/signal-po-kabelyu.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  // === Игра 1: раскрой парашют и приведи в мишень ===
  const cv=document.getElementById('game'),ctx=cv.getContext('2d');
  const GR=286;      // линия земли
  const AUTO_HI=228; // ниже этого купол раскрывается сам — парашютист НИКОГДА не зависает
  let px,py,gst,wind,zone,guide,steer,drag,raf,scored,openY,autoOpened;
  function windText(){return 'Ветер '+(wind<0?'◀ влево':'вправо ▶')+' · '+(Math.abs(wind)>0.95?'сильный':'слабый');}
  function ng(){px=400;py=26;gst='ready';steer=0;drag=false;guide=null;scored=false;openY=null;autoOpened=false;
    wind=(Math.random()<.5?-1:1)*(0.7+Math.random()*0.8);zone=120+Math.random()*560;
    document.getElementById('windLbl').textContent=windText();document.getElementById('gm').textContent='';
    cancelAnimationFrame(raf);draw();
    ctx.save();ctx.textAlign='center';
    ctx.fillStyle='rgba(10,22,40,.35)';ctx.fillRect(0,0,cv.width,GR);
    ctx.fillStyle='#fff';ctx.font='bold 22px Georgia';ctx.fillText('Нажми «▶ Включить трансляцию»',cv.width/2,150);
    ctx.font='14px Segoe UI';ctx.fillText('Усиль сигнал и наведи его в нужную квартиру против помех',cv.width/2,176);
    ctx.restore();
    gBtns('ready');}
  // фон: ночное небо + силуэт дома с окнами
  function drawBg(){
    // небо
    const sky=ctx.createLinearGradient(0,0,0,GR);sky.addColorStop(0,'#0a1428');sky.addColorStop(1,'#1a2e50');
    ctx.fillStyle=sky;ctx.fillRect(0,0,cv.width,GR);
    // звёзды
    [[80,30],[200,55],[350,20],[500,45],[650,18],[770,60],[900,35],[1050,48],[1150,22],[1220,55]].forEach(s=>{
      ctx.fillStyle='rgba(255,255,255,0.7)';ctx.beginPath();ctx.arc(s[0],s[1],1.2,0,7);ctx.fill();});
    // антенна вверху — источник сигнала
    ctx.strokeStyle='rgba(100,180,255,0.9)';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(cv.width/2,10);ctx.lineTo(cv.width/2,36);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cv.width/2-18,18);ctx.lineTo(cv.width/2,10);ctx.lineTo(cv.width/2+18,18);ctx.stroke();
    ctx.fillStyle='rgba(100,180,255,0.9)';ctx.font='11px Segoe UI';ctx.textAlign='center';
    ctx.fillText('АНТЕННА',cv.width/2,50);ctx.textAlign='start';
    // силуэт дома внизу
    ctx.fillStyle='#111b2e';
    ctx.fillRect(0,GR,cv.width,cv.height-GR);
    // окна дома — несколько рядов
    for(let row=0;row<3;row++){
      for(let col=0;col<12;col++){
        const wx=60+col*96, wy=GR+10+row*32;
        const isTarget=Math.abs(wx+8-zone)<20&&row===1;
        if(isTarget){
          // мигающее окно-мишень
          ctx.fillStyle=`rgba(201,168,76,${0.6+0.4*Math.sin(Date.now()/200)})`;
          ctx.fillRect(wx,wy,26,20); ctx.strokeStyle='#c9a24a';ctx.lineWidth=2;ctx.strokeRect(wx,wy,26,20);
        } else {
          ctx.fillStyle='rgba(255,200,80,0.22)';ctx.fillRect(wx,wy,26,20);
        }
      }
    }
    // метка мишени
    ctx.fillStyle='#c9a24a';ctx.font='bold 11px Segoe UI';ctx.textAlign='center';
    ctx.fillText('📺 квартира',zone,GR+110);ctx.textAlign='start';
    // указатель помех (вместо ветра)
    ctx.fillStyle='rgba(100,180,255,0.9)';ctx.font='bold 13px Segoe UI';
    ctx.fillText((wind<0?'◀':'▶')+' помехи',14,24);
  }
  function drawSignal(x,y,amplified){
    if(amplified){
      // усиленный сигнал: яркий «конус» расходящихся волн
      for(let r=10;r<=52;r+=14){
        const a=Math.max(0,0.55-r/100);
        ctx.strokeStyle=`rgba(100,200,255,${a})`;ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(x,y,r,Math.PI*0.85,Math.PI*2.15);ctx.stroke();
        ctx.beginPath();ctx.arc(x,y+8,r,Math.PI*0.85,Math.PI*2.15);ctx.stroke();
      }
      // кабель-луч вниз
      ctx.strokeStyle='rgba(201,168,76,0.7)';ctx.lineWidth=2;ctx.setLineDash([6,4]);
      ctx.beginPath();ctx.moveTo(x,y+10);ctx.lineTo(x,GR);ctx.stroke();ctx.setLineDash([]);
    }
    // сам сигнал — яркий синий круг с волнами
    ctx.fillStyle='#1e90ff';ctx.beginPath();ctx.arc(x,y,14,0,7);ctx.fill();
    ctx.strokeStyle='rgba(100,200,255,0.6)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(x,y,22,0,7);ctx.stroke();
    ctx.beginPath();ctx.arc(x,y,32,0,7);ctx.stroke();
    // иконка-молния внутри
    ctx.fillStyle='#fff';ctx.font='bold 16px serif';ctx.textAlign='center';
    ctx.fillText('⚡',x,y+6);ctx.textAlign='start';
  }
  function draw(){ctx.clearRect(0,0,cv.width,cv.height);drawBg();
    if(gst==='fall'){ctx.save();ctx.textAlign='center';ctx.fillStyle='rgba(200,230,255,0.9)';ctx.font='bold 16px Georgia';
      ctx.fillText('📡 Тапни по полю, чтобы усилить сигнал',cv.width/2,GR-14);ctx.textAlign='start';ctx.restore();}
    drawSignal(px,py,openY!==null);}
  let last=0;
  function step(ts){if(!last)last=ts;const dt=Math.min((ts-last)/1000,0.05);last=ts;
    if(gst==='fall'){py+=46*dt;px+=wind*22*dt;
      if(openY===null&&py>=AUTO_HI){autoOpened=true;openChute(true);}}
    else if(gst==='canopy'){py+=28*dt;px+=(wind*50+steer*170)*dt;if(guide!==null)px+=(guide-px)*Math.min(8*dt,0.5);}
    if(!isFinite(px))px=cv.width/2; if(!isFinite(py))py=26; if(guide!==null&&!isFinite(guide))guide=null; // сигнал не может исчезнуть
    px=Math.max(16,Math.min(cv.width-16,px));
    if(py>=GR){py=GR;gst='land';if(!scored){scored=true;land();}}
    draw();if(gst!=='land')raf=requestAnimationFrame(step);}
  function openChute(auto){if(gst!=='fall')return;openY=py;gst='canopy';guide=px;gBtns('canopy');
    if(auto)msg('⚠️ Сигнал поймался сам у самого дна — времени на наведение почти нет!',0);
    else msg('📡 Сигнал усилен! Веди к нужной квартире против помех.',1);}
  function land(){
    const dx=Math.abs(px-zone);
    if(dx<=44){msg('🎯 Точное попадание! Сигнал дошёл до квартиры без потерь.',1);award('game1',20);}
    else if(dx<=95){msg('✅ Сигнал достиг — почти в цель. Хороший результат.',1);award('game1',20);}
    else{msg('📡 Помехи снесли сигнал мимо квартиры. Жми «Заново» и веди точнее.',0);}
    gBtns('end');}
  function msg(t,w){const e=document.getElementById('gm');e.textContent=t;e.style.color=w?'#1f5b2c':'#8e1420';}
  function gBtns(m){document.getElementById('startG').style.display=m==='ready'?'':'none';
    document.getElementById('drop').style.display=m==='fall'?'':'none';
    document.getElementById('steerL').style.display=m==='canopy'?'':'none';
    document.getElementById('steerR').style.display=m==='canopy'?'':'none';
    document.getElementById('rs').style.display=m==='ready'?'none':'';}
  document.getElementById('startG').onclick=()=>{if(gst!=='ready')return;gst='fall';gBtns('fall');cancelAnimationFrame(raf);last=0;raf=requestAnimationFrame(step);};
  document.getElementById('drop').onclick=openChute;
  document.getElementById('rs').onclick=ng;
  function steerBind(id,d){const b=document.getElementById(id);
    b.addEventListener('pointerdown',e=>{e.preventDefault();steer=d;});
    ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,e=>{if(e&&e.cancelable)e.preventDefault();steer=0;}));}
  steerBind('steerL',-1);steerBind('steerR',1);
  function evX(e){ // координата и для мыши, и для пальца (touch)
    if(e.touches&&e.touches.length)return e.touches[0].clientX;
    if(e.changedTouches&&e.changedTouches.length)return e.changedTouches[0].clientX;
    return e.clientX;}
  function toX(e){const r=cv.getBoundingClientRect();const x=(evX(e)-r.left)/r.width*cv.width;
    if(!isFinite(x))return null; // защита: никогда не отдаём NaN
    return Math.max(16,Math.min(cv.width-16,x));}
  function cvTap(e){e.preventDefault();
    if(gst==='fall')openChute();
    else if(gst==='canopy'){const x=toX(e);if(x!==null){drag=true;guide=x;}}}
  if(window.PointerEvent){cv.addEventListener('pointerdown',cvTap);}
  else{cv.addEventListener('mousedown',cvTap);cv.addEventListener('touchstart',cvTap,{passive:false});}
  cv.addEventListener('touchmove',e=>{if(gst==='canopy'){e.preventDefault();const x=toX(e);if(x!==null){drag=true;guide=x;}}},{passive:false});
  window.addEventListener('pointermove',e=>{if(drag){const x=toX(e);if(x!==null)guide=x;}});
  window.addEventListener('pointerup',()=>{drag=false;});
  window.addEventListener('touchend',()=>{drag=false;});
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')steer=-1;if(e.key==='ArrowRight')steer=1;});
  document.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')steer=0;});
  ng();

  // === Игра 2: собери РК-1 ===
  const asmData=[
    {n:'Приёмная антенна',d:'На крыше дома — ловит сигнал телецентра'},
    {n:'Усилитель узла',d:'Аппаратная в доме — делает сигнал чистым и сильным'},
    {n:'Магистральный кабель',d:'Несёт сигнал по стоякам дома'},
    {n:'Квартирная разводка',d:'Ответвление кабеля в каждую из 30 квартир'},
    {n:'Телевизор АТП-1',d:'Круглый экран 18 см — конец пути сигнала'}
  ];
  const asmSlots=document.getElementById('asmSlots'),asmParts=document.getElementById('asmParts'),asmMsg=document.getElementById('asmMsg'),asmReset=document.getElementById('asmReset');
  let asmStep=0;
  function asmInit(){asmStep=0;asmSlots.innerHTML='';asmParts.innerHTML='';asmMsg.textContent='';asmReset.style.display='none';
    asmData.forEach((_,i)=>{const s=document.createElement('div');s.className='asm-slot';s.id='slot'+i;s.textContent=(i+1);asmSlots.appendChild(s);});
    asmData.map((p,i)=>({p,i})).sort(()=>Math.random()-0.5).forEach(o=>{const b=document.createElement('button');b.className='asm-part';
      b.innerHTML='<b>'+o.p.n+'</b><span>'+o.p.d+'</span>';
      b.onclick=()=>{
        if(o.i===asmStep){const s=document.getElementById('slot'+asmStep);s.className='asm-slot filled';s.innerHTML='<b>'+o.p.n+'</b>';
          b.disabled=true;b.classList.add('used');asmStep++;
          if(asmStep===asmData.length){asmMsg.textContent='✅ Тракт собран! Сигнал идёт от антенны до АТП-1 — именно так построили первую кабельную сеть мира в 1938 году.';asmMsg.style.color='#1f5b2c';award('assemble',20);asmReset.style.display='';}
          else{asmMsg.textContent='Верно! Что идёт '+(asmStep+1)+'-м?';asmMsg.style.color='#1f5b2c';}
        }else{asmMsg.textContent='Не сейчас. Сначала то, что идёт '+(asmStep+1)+'-м по порядку укладки.';asmMsg.style.color='#8e1420';
          b.classList.add('shake');setTimeout(()=>b.classList.remove('shake'),400);}
      };asmParts.appendChild(b);});}
  asmReset.onclick=asmInit;asmInit();

})();
