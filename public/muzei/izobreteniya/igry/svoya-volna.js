/* Игры 4 января («Настройся на свою волну», «Передай сигнал вовремя», «Быстрый ответ») — три inline-скрипта как есть со страницы
   src/data/full-pages/izobreteniya/01-04.html, по порядку; разметка — src/data/igry/izobreteniya/svoya-volna.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
const cv=document.getElementById('tnCvs');if(!cv)return;
const ctx=cv.getContext('2d');const sl=document.getElementById('tnSlider');
let W,H,t=0,target=rnd(),fired=0,flash=0,burst=[];
function rnd(){return 20+Math.random()*60;}
function resize(){W=cv.width=cv.offsetWidth||300;H=cv.height=cv.offsetHeight||110;}resize();window.addEventListener('resize',resize);
function freq(v){return .02+v/100*.13;}
function match(){return Math.abs(+sl.value-target)<4;}
function wave(f,ph,color,lw,glow){ctx.save();if(glow){ctx.shadowColor=glow;ctx.shadowBlur=10;}
  ctx.beginPath();for(let x=0;x<W;x++){const y=H/2+Math.sin(x*f+ph)*H*.3;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}
  ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.stroke();ctx.restore();}
function draw(){ctx.clearRect(0,0,W,H);t+=.06;
  // сетка осциллографа
  ctx.strokeStyle='rgba(255,255,255,.04)';ctx.lineWidth=1;
  for(let x=0;x<W;x+=24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=22){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,.08)';
  ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
  const ok=match();
  wave(freq(target),t,ok?'rgba(126,212,160,.95)':'rgba(201,168,76,.5)',ok?2.5:1.5,ok?'#7ed4a0':null);
  if(!ok)wave(freq(+sl.value),t,'rgba(96,178,224,.95)',2,'#2d8cbf');
  // лампа-индикатор приёмника
  ctx.save();if(ok){ctx.shadowColor='#7ed4a0';ctx.shadowBlur=12;}
  ctx.beginPath();ctx.arc(W-16,14,6,0,7);
  ctx.fillStyle=ok?'#7ed4a0':'rgba(192,69,63,.55)';ctx.fill();ctx.restore();
  const btn=document.getElementById('tnBtn');if(btn)btn.disabled=!ok||fired>=3;
  if(flash>0){ctx.save();ctx.shadowColor='#e4c97a';ctx.shadowBlur=14;
    ctx.beginPath();ctx.arc(W-34,H/2,(1-flash)*60,0,Math.PI*2);
    ctx.strokeStyle='rgba(228,201,122,'+flash.toFixed(2)+')';ctx.lineWidth=3;ctx.stroke();ctx.restore();flash-=.03;}
  burst=burst.filter(p=>p.life>0);
  burst.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.life-=.04;
    ctx.beginPath();ctx.arc(p.x,p.y,1.6,0,7);ctx.fillStyle='rgba(228,201,122,'+p.life.toFixed(2)+')';ctx.fill();});
  requestAnimationFrame(draw);}draw();
window.tnFire=function(){if(!match()||fired>=3)return;fired++;flash=1;
  for(let i=0;i<14;i++)burst.push({x:W-34,y:H/2,vx:(Math.random()-.5)*5,vy:(Math.random()-.8)*4,life:1});
  document.getElementById('tnScore').textContent=fired;
  const r=document.getElementById('tnResult');
  if(fired>=3){r.textContent='🏆 Протектор освоен: приёмник слушал только тебя!';if(typeof award==='function')award('gm_tune',15);}
  else{r.textContent='💥 Команда принята! Приёмник перестроился — найди новую волну';target=rnd();}
};
})();
(function(){
const cv=document.getElementById('pgCvs');if(!cv)return;
const ctx=cv.getContext('2d');let W,H,t=0,wave=0,score=0,tries=0,sent=false,sentT=0;
function resize(){W=cv.width=cv.offsetWidth||300;H=cv.height=cv.offsetHeight||90;}resize();
function draw(){ctx.clearRect(0,0,W,H);t+=.04;
  ctx.strokeStyle='rgba(255,255,255,.04)';ctx.lineWidth=1;
  for(let gx=0;gx<W;gx+=24){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
  for(let gy=0;gy<H;gy+=22){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}
  // Антенна-передатчик
  ctx.strokeStyle='rgba(201,168,76,.8)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(30,H*.9);ctx.lineTo(30,H*.15);ctx.stroke();
  ctx.beginPath();ctx.moveTo(16,H*.45);ctx.lineTo(30,H*.15);ctx.lineTo(44,H*.45);ctx.stroke();
  // Антенна-приёмник
  ctx.beginPath();ctx.moveTo(W-30,H*.9);ctx.lineTo(W-30,H*.15);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W-44,H*.45);ctx.lineTo(W-30,H*.15);ctx.lineTo(W-16,H*.45);ctx.stroke();
  // Зона попадания (приёмник)
  ctx.fillStyle='rgba(63,155,82,.15)';ctx.fillRect(W-55,0,50,H);
  ctx.strokeStyle='rgba(63,155,82,.4)';ctx.lineWidth=1;ctx.setLineDash([3,4]);
  ctx.beginPath();ctx.moveTo(W-55,0);ctx.lineTo(W-55,H);ctx.stroke();ctx.setLineDash([]);
  // Волна
  if(sent){wave+=(W-60)/38;
    const inZone=wave>W-60;
    ctx.save();ctx.shadowColor=inZone?'#7ed4a0':'#e4c97a';ctx.shadowBlur=12;
    ctx.beginPath();ctx.arc(30+wave,H*.45,8,0,Math.PI*2);
    ctx.fillStyle=inZone?'rgba(63,155,82,.9)':'rgba(201,168,76,.85)';ctx.fill();ctx.restore();
    if(wave>W+20){
      if(!inZone){document.getElementById('pgResult').textContent='❌ Промах — волна не дошла до приёмника';document.getElementById('pgResult').style.color='#f08080';}
      sent=false;wave=0;
}}
  requestAnimationFrame(draw);}draw();
window.pgSend=function(){if(sent)return;
  sent=true;wave=0;tries++;
  const inZone=()=>wave>W-60&&wave<W-10;
  const check=()=>{if(inZone()){score++;document.getElementById('pgScore').textContent=score;
    document.getElementById('pgResult').textContent=score>=3?'🏆 Отлично! Все сигналы приняты!':'✅ Принято! Ещё '+(3-score)+' раз';
    document.getElementById('pgResult').style.color='#7ed4a0';
    if(score>=3&&typeof award==='function')award('gm_pilchikov',15);
    sent=false;wave=0;}
    else if(wave>0&&wave<W-60)setTimeout(check,40);};
  setTimeout(check,120);};
})();
(function(){
  let t=15,ti=null,done=false;
  const correct=1;
  ti=setInterval(()=>{
    if(done)return;
    t--;document.getElementById('gm_quiz2_t').textContent=t;
    if(t<=0){clearInterval(ti);gm_quiz2_ans(-1);}
  },1000);
  window['gm_quiz2_ans']=function(i){
    if(done)return;done=true;clearInterval(ti);
    const btns=document.querySelectorAll('#gm_quiz2_opts .gm-btn');
    btns.forEach((b,j)=>{b.disabled=true;
      if(j===correct)b.classList.add('ok');
      else if(j===i)b.classList.add('no');
      else b.classList.add('neutral');
    });
    document.getElementById('gm_quiz2_exp').classList.add('show');
    if(i===correct){const pts=Math.max(3,Math.round(t/15*10));if(typeof award==='function')award('gm_quiz2',pts);}
  };
})();
