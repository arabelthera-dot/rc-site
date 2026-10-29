/* Вторые скрипты дня 01-04 как есть со страницы src/data/full-pages/izobreteniya/01-04.html: мини-игры викторины (правда/миф, верю/не верю, шарада),
   развилка, чат, живая сцена «Одесский опыт, 1898», перечень темы. Нужна глобальная award() (assets/museum-score.js). */
    function tmAns(b,isMyth){document.querySelectorAll('#gm_tm .gm-btn').forEach(x=>x.disabled=true);b.classList.add(isMyth?'ok':'no');document.getElementById('tmExp').classList.add('show');if(isMyth&&typeof award==='function')award('tm',5);}
    function vbAns(b,isTrue){document.querySelectorAll('#gm_vb .gm-btn').forEach(x=>x.disabled=true);b.classList.add(isTrue?'ok':'no');document.getElementById('vbExp').classList.add('show');if(isTrue&&typeof award==='function')award('vb',5);}
    function charShow(){document.getElementById('charExp').classList.add('show');document.getElementById('charBtn').disabled=true;if(typeof award==='function')award('char',5);}

// ── РАЗВИЛКА ──────────────────────────────────────────────────────────────────
document.querySelectorAll('.fork-opt').forEach((el,i)=>{
  el.onclick=function(){
    document.querySelectorAll('.fork-opt').forEach(b=>b.classList.remove('chosen'));
    this.classList.add('chosen');
    document.getElementById('forkReal').style.display='block';
    award('fork',10);
  };
});

// ── ЧАТ ───────────────────────────────────────────────────────────────────────
const kb=[
 {k:['взрыв','заряд','без провод','демонстра','опыт','показ','одесс','как управ'],a:'В приёмнике — реле: пришла волна, цепь замкнулась. А уж что сделает цепь — зажжёт лампу, повернёт семафор или подорвёт заряд, — решаю я. В Одессе, в 1898-м, дамы, рассказывают, вскрикивали при взрыве — я извинялся и повторял номер на бис.'},
 {k:['патент','тесла','приоритет','слав'],a:'Патента я не оформил — у нас это было не в обычае, наука казалась важнее бумаг. Тесла — талантливый инженер, мы шли параллельно; он понимал силу патента, я верил в силу опыта. История рассудила по-своему.'},
 {k:['протектор','помех','фильтр','код','защит'],a:'Протектор — мой фильтр от чужих сигналов: машина должна слушаться только своего хозяина. Без него любой шутник с передатчиком командовал бы вашим миноносцем. Сегодня, я слышал, это зовут кодированием канала.'},
 {k:['флот','воен','миноносец','взрыватель','черномор','корабл'],a:'В 1902–1903 годах я работал для Черноморского флота: радиовзрыватели, защита корабельной связи от помех. Отчёты ушли в ведомство — и легли под сукно. Продолжения я не дождался.'},
 {k:['курск','магнит','аномали','компас','геолог','желез'],a:'Мне было 24, когда компас под Курском начал сходить с ума. Я измерил аномалию и указал: под землёй — железо. Через полвека там нашли крупнейший железорудный бассейн мира.'},
 {k:['рентген','лучи','x-'],a:'Лучами Рентгена я занялся в 1896 году, едва вышло его сообщение. Невидимое, проходящее сквозь тело, — как тут устоять физику?'},
 {k:['смерть','умер','застрел','убий','1908','больниц','лечебниц'],a:'Об этом мне сказать нечего. Май 1908 года — последнее, что я помню, это планы новых опытов.'},
 {k:['детств','полтав','родил','отец','семь'],a:'Родился я в Полтаве в 1857 году, в семье учёного-этнографа. Отец приучил смотреть на мир внимательно — остальное сделала физика.'},
 {k:['харьков','университет','преподава','студент','профессор','лаборатор'],a:'Харьковский университет — мой дом: сначала студентом, после — профессором. Коллеги звали меня «человеком-лабораторией»: приборы я строил своими руками.'},
 {k:['скрипк','музык','стих','искусств'],a:'Играю на скрипке и пишу стихи — физика и музыка ближе, чем кажется: и там и там всё держится на колебаниях и гармонии.'},
 {k:['женат','жена','невест','любов'],a:'Я не женат — говорю обычно, что женат на физике. Она ревнива и не терпит соперниц.'},
 {k:['прибор','изобрет','рефрактометр','сейсмограф','ареометр'],a:'Приборов за жизнь я построил около двадцати пяти: рефрактометр, сейсмограф собственной конструкции, дифференциальный ареометр… Показывать опыт мне всегда было интереснее, чем читать о нём лекцию.'},
 {k:['попов','маркони'],a:'Попов показал приёмник в 1895-м, Маркони взял патент в 1896-м. Все увидели в радио телеграф без проводов. Я увидел иное: волной можно командовать машиной.'},
 {k:['будущ','дрон','пульт','wi-fi','вайфай','сегодня','беспилот'],a:'Верю, что волнам принадлежит будущее. Если сегодня машины слушаются человека по воздуху — значит, тот одесский вечер был не зря.'},
 {k:['привет','здравств','добрый','кто вы','кто ты'],a:'Здравствуйте! Николай Дмитриевич Пильчиков, профессор физики. Спрашивайте — а лучше позвольте показать опыт.'}
];

function addMsg(text,who){
  const d=document.createElement('div');
  d.className='msg '+who;
  d.textContent=text;
  document.getElementById('chatBox').appendChild(d);
  d.scrollIntoView({behavior:'smooth'});
}

function findAnswer(q){
  q=q.toLowerCase();
  for(const item of kb){
    if(item.k.some(k=>q.includes(k.toLowerCase())))return item.a;
  }
  return 'Хороший вопрос требует точной постановки — я ведь физик. Спросите об опытах, о протекторе или о Курской аномалии — расскажу с удовольствием.';
}

function sendChat(){
  const inp=document.getElementById('chatInput');
  const q=inp.value.trim();
  if(!q)return;
  addMsg(q,'you');
  inp.value='';
  setTimeout(()=>{addMsg(findAnswer(q),'inv');award('chat',5);},600);
}
document.getElementById('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendChat();});

// стартовые вопросы + приветствие
(function(){
  const qs=['Как вы взрывали заряд без проводов?','Почему вы не запатентовали своё изобретение?','Что за приборы вы делали для флота?'];
  const box=document.getElementById('starters');
  qs.forEach(q=>{const c=document.createElement('span');c.className='chip';c.textContent=q;
    c.onclick=()=>{document.getElementById('chatInput').value=q;sendChat();};box.appendChild(c);});
  const w=document.createElement('div');w.className='msg inv';
  w.textContent='Здравствуйте! Профессор Пильчиков. Спрашивайте — а лучше позвольте показать опыт.';
  document.getElementById('chatBox').appendChild(w);
})();

document.querySelectorAll('.starter-btn').forEach(b=>{
  b.onclick=function(){
    document.getElementById('chatInput').value=this.dataset.q;
    sendChat();
  };
});

// ── HERO SCENE: «Одесский опыт, 1898» ────────────────────────────────────────
(function(){
  const cv=document.getElementById('heroCvs');if(!cv)return;
  const ctx=cv.getContext('2d');
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  let W,H,t=0,last=0;
  function resize(){const p=cv.parentElement;W=(p?p.offsetWidth:innerWidth);H=(p?p.offsetHeight:Math.round(innerHeight*.52));
    cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);}
  resize();addEventListener('resize',resize);

  // состояние сцены
  let target=0;                 // 0 лампа · 1 семафор · 2 заряд
  let pulseR=-1;                // радиус летящего импульса (-1 = не летит)
  let sparkT=0;                 // кадры большой искры разрядника
  let lampGlow=0;               // 0..1 лампа горит
  let semA=-0.06;               // угол крыла семафора
  let semUp=false;
  let boomT=-9, boomFlash=0;    // взрыв заряда
  let keyT=0;                   // анимация ключа
  let sparks=[];                // искры взрыва
  let hinted=false;

  const TX=()=>W*.20, RX=()=>W*.80, GY=()=>H*.82, SY=()=>H*.82-95;

  function zig(x1,y1,x2,y2,seg,jit,branch){ // ломаная-молния
    ctx.beginPath();ctx.moveTo(x1,y1);
    let px=x1,py=y1;
    for(let i=1;i<=seg;i++){const q=i/seg;
      const nx=x1+(x2-x1)*q+(i<seg?(Math.random()-.5)*2*jit:0);
      const ny=y1+(y2-y1)*q+(i<seg?(Math.random()-.5)*2*jit:0);
      ctx.lineTo(nx,ny);
      if(branch&&Math.random()<.3){ctx.moveTo(nx,ny);
        ctx.lineTo(nx+(Math.random()-.5)*16,ny+Math.random()*12);ctx.moveTo(nx,ny);}
      px=nx;py=ny;}
    ctx.stroke();
  }

  function scene(){
    ctx.clearRect(0,0,W,H);
    const tx=TX(),rx=RX(),gy=GY(),sy=SY();
    // фон: звёзды + пыль в луче
    for(let i=0;i<46;i++){const x=(i*137.5)%W,y=(i*61.7)%(H*.55);
      ctx.beginPath();ctx.arc(x,y,.8,0,7);ctx.fillStyle=`rgba(255,255,255,${.05+.05*Math.sin(t+i)})`;ctx.fill();}
    // тёплый свет рампы на сцену
    let g=ctx.createRadialGradient(W*.5,gy,20,W*.5,gy,W*.62);
    g.addColorStop(0,'rgba(201,168,76,.10)');g.addColorStop(1,'rgba(201,168,76,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(let i=0;i<12;i++){const x=W*.25+((i*83.7+t*6)%(W*.5)),y=H*.25+(i*37.3)%(H*.45);
      ctx.beginPath();ctx.arc(x,y,1,0,7);ctx.fillStyle=`rgba(228,201,122,${.06+.04*Math.sin(t*2+i)})`;ctx.fill();}
    // пол сцены
    ctx.fillStyle='rgba(4,8,16,.75)';ctx.fillRect(0,gy,W,H-gy);
    ctx.strokeStyle='rgba(201,168,76,.25)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();

    // ── ПЕРЕДАТЧИК ──
    // стол
    ctx.fillStyle='#140f08';ctx.strokeStyle='rgba(201,168,76,.45)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(tx-48,gy-38,96,38,4);ctx.fill();ctx.stroke();
    // катушка (медная обмотка)
    ctx.fillStyle='#1c1207';ctx.beginPath();ctx.roundRect(tx-17,gy-72,34,34,3);ctx.fill();
    for(let i=0;i<7;i++){ctx.strokeStyle=i%2?'rgba(184,115,51,.8)':'rgba(228,160,90,.55)';
      ctx.beginPath();ctx.moveTo(tx-15,gy-68+i*4.6);ctx.lineTo(tx+15,gy-68+i*4.6);ctx.stroke();}
    ctx.strokeStyle='rgba(201,168,76,.5)';ctx.strokeRect(tx-17,gy-72,34,34);
    // стойки + шары разрядника
    ctx.strokeStyle='rgba(228,201,122,.9)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(tx-9,gy-72);ctx.lineTo(tx-9,sy+4);ctx.stroke();
    ctx.beginPath();ctx.moveTo(tx+9,gy-72);ctx.lineTo(tx+9,sy+4);ctx.stroke();
    for(const dx of[-9,9]){const gg=ctx.createRadialGradient(tx+dx-1.5,sy-1.5,1,tx+dx,sy,6);
      gg.addColorStop(0,'#f4e3ae');gg.addColorStop(1,'#8a6a25');
      ctx.beginPath();ctx.arc(tx+dx,sy,5.5,0,7);ctx.fillStyle=gg;ctx.fill();}
    // телеграфный ключ на столе
    const ka=keyT>0?.35:0; keyT=Math.max(0,keyT-1);
    ctx.save();ctx.translate(tx+30,gy-42);ctx.rotate(-.15+ka);
    ctx.strokeStyle='rgba(228,201,122,.9)';ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(10,0);ctx.stroke();
    ctx.beginPath();ctx.arc(10,0,4,0,7);ctx.fillStyle='#c9a84c';ctx.fill();ctx.restore();

    // искра разрядника: фоновая раз в ~2.5с + большая при отправке
    const flick=(Math.floor(t*10)%25===0);
    if(sparkT>0||flick){
      ctx.save();ctx.strokeStyle='rgba(215,235,255,.95)';ctx.lineWidth=sparkT>0?1.8:1;
      ctx.shadowColor='#9fd0ff';ctx.shadowBlur=sparkT>0?14:7;
      zig(tx-9,sy,tx+9,sy,6,sparkT>0?5:3,sparkT>0);
      ctx.restore();sparkT=Math.max(0,sparkT-1);}

    // фоновые волны от разрядника (сектор к цели)
    for(let i=0;i<3;i++){const q=((t*.35+i/3)%1);const r=q*(rx-tx)*.8;
      const a=(1-q)*.16;
      ctx.beginPath();ctx.arc(tx,sy,Math.max(r,1),-.9,.9);
      ctx.strokeStyle=`rgba(201,168,76,${a})`;ctx.lineWidth=1;ctx.stroke();}

    // ── ЛЕТЯЩИЙ ИМПУЛЬС ──
    if(pulseR>=0){pulseR+=(rx-tx)/34;
      for(let k=0;k<3;k++){const r=pulseR-k*14;if(r<=0)continue;
        ctx.save();ctx.shadowColor='#e4c97a';ctx.shadowBlur=k?0:12;
        ctx.beginPath();ctx.arc(tx,sy,r,-.65,.65);
        ctx.strokeStyle=`rgba(228,201,122,${[.9,.4,.18][k]})`;ctx.lineWidth=k?1.2:2.4;ctx.stroke();ctx.restore();}
      if(pulseR>=rx-tx){pulseR=-1;hit();}}

    // ── ЦЕЛИ ──
    const oy=sy;
    // подставка-столб
    ctx.strokeStyle='rgba(228,201,122,.75)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(rx,gy);ctx.lineTo(rx,oy+18);ctx.stroke();
    // пульс-подсветка активной цели
    ctx.beginPath();ctx.arc(rx,oy,26+3*Math.sin(t*2.4),0,7);
    ctx.strokeStyle='rgba(201,168,76,.14)';ctx.lineWidth=1.2;ctx.stroke();

    if(target===0){ // лампа
      lampGlow=Math.max(0,lampGlow-.004);
      const on=lampGlow>0, fl=on?(.8+.2*Math.sin(t*9)):0;
      if(on){const gl=ctx.createRadialGradient(rx,oy,2,rx,oy,44);
        gl.addColorStop(0,`rgba(255,224,140,${.5*lampGlow*fl})`);gl.addColorStop(1,'rgba(255,224,140,0)');
        ctx.fillStyle=gl;ctx.beginPath();ctx.arc(rx,oy,44,0,7);ctx.fill();}
      ctx.save();if(on){ctx.shadowColor='#ffe08c';ctx.shadowBlur=18*lampGlow;}
      ctx.beginPath();ctx.arc(rx,oy,12,0,7);
      ctx.fillStyle=on?`rgba(255,228,150,${.35+.45*lampGlow*fl})`:'rgba(255,255,255,.06)';
      ctx.fill();ctx.strokeStyle='rgba(228,231,240,.75)';ctx.lineWidth=1.4;ctx.stroke();ctx.restore();
      ctx.strokeStyle=on?'#ffdf9e':'rgba(228,201,122,.6)';ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(rx-5,oy+3);ctx.lineTo(rx-2,oy-4);ctx.lineTo(rx+2,oy+2);ctx.lineTo(rx+5,oy-4);ctx.stroke();
      ctx.beginPath();ctx.moveTo(rx-4,oy+11);ctx.lineTo(rx+4,oy+11);ctx.lineTo(rx+3,oy+17);ctx.lineTo(rx-3,oy+17);ctx.closePath();
      ctx.fillStyle='rgba(150,160,175,.5)';ctx.fill();
    }else if(target===1){ // семафор
      const want=semUp?-1.15:-0.06; semA+=(want-semA)*.08;
      ctx.save();ctx.translate(rx,oy+6);ctx.rotate(semA);
      ctx.fillStyle='rgba(228,201,122,.9)';ctx.beginPath();ctx.roundRect(0,-3.5,36,7,3);ctx.fill();
      ctx.fillStyle='#c0453f';ctx.beginPath();ctx.roundRect(28,-3.5,8,7,3);ctx.fill();ctx.restore();
      ctx.beginPath();ctx.arc(rx,oy+6,4,0,7);ctx.fillStyle='#8a6a25';ctx.fill();
    }else{ // заряд
      const since=t-boomT;
      if(since>1.6){ctx.fillStyle='#161006';ctx.strokeStyle='rgba(201,168,76,.6)';ctx.lineWidth=1.4;
        ctx.beginPath();ctx.roundRect(rx-14,oy-2,28,20,3);ctx.fill();ctx.stroke();
        ctx.strokeStyle='rgba(192,69,63,.8)';ctx.beginPath();ctx.moveTo(rx,oy-2);ctx.lineTo(rx,oy-10);ctx.stroke();
        ctx.beginPath();ctx.arc(rx,oy-11,1.6,0,7);ctx.fillStyle='#ffb26b';ctx.fill();}
      if(since<1.4){const r=since*H*.3,a=Math.max(0,.85-since*.65);
        ctx.beginPath();ctx.arc(rx,oy,r,0,7);ctx.strokeStyle=`rgba(228,201,122,${a})`;ctx.lineWidth=3;ctx.stroke();
        ctx.beginPath();ctx.arc(rx,oy,r*.62,0,7);ctx.strokeStyle=`rgba(159,208,255,${a*.6})`;ctx.lineWidth=1.6;ctx.stroke();}
      if(boomFlash>0){ctx.beginPath();ctx.arc(rx,oy,24,0,7);
        ctx.fillStyle=`rgba(255,240,200,${boomFlash})`;ctx.fill();boomFlash-=.08;}}

    // искры
    sparks=sparks.filter(p=>p.life>0);
    sparks.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.14;p.life-=.03;
      ctx.beginPath();ctx.arc(p.x,p.y,1.8,0,7);ctx.fillStyle=`rgba(${p.c},${p.life})`;ctx.fill();});
  }

  function hit(){sparkT=0;
    if(target===0){lampGlow=1;}
    else if(target===1){semUp=!semUp;}
    else{boomT=t;boomFlash=.9;
      for(let i=0;i<26;i++)sparks.push({x:RX(),y:SY(),vx:(Math.random()-.5)*6,
        vy:-Math.random()*5-1,life:1,c:Math.random()>.4?'228,201,122':'159,208,255'});}
    setTimeout(()=>{target=(target+1)%3;},900);
  }

  function fire(){if(pulseR>=0)return;keyT=6;sparkT=8;pulseR=6;
    if(!hinted){hinted=true;const h=document.getElementById('heroHint');
      if(h)setTimeout(()=>{h.style.opacity='0';},1400);}}

  cv.style.cursor='pointer';cv.style.pointerEvents='auto';
  cv.addEventListener('click',fire);

  if(reduce){t=1;scene();return;} // статичный кадр без анимации
  (function loop(){t+=.022;scene();requestAnimationFrame(loop);})();
})();

// ── ТЕМАТИЧЕСКИЕ ИЗОБРЕТЕНИЯ ─────────────────────────────────────────────────
const themeBtn=document.getElementById('themeInvBtn');
if(themeBtn)themeBtn.onclick=function(){
  const b=document.getElementById('themeInvBody');
  const open=b.style.display==='none';
  b.style.display=open?'block':'none';
  this.textContent=open?'▲ Скрыть':this.dataset.label||'Показать перечень →';
  if(open)award('theme',5);
};

