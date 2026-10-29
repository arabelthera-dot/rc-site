/* Второй скрипт дня 01-05 — 1:1 с живой страницы day-05jan-shukhov.html: статья («Читать дальше»), развилка, чат, живая сцена,
   изобретения темы, reveal (большой скрипт без счёта, викторины и календаря — их ведёт шаблон) и чертёж гиперболоида (#tower). */
// ── СТАТЬЯ ────────────────────────────────────────────────────────────────────
document.getElementById('moreBtn').onclick=function(){
  document.getElementById('article').classList.remove('collapsed');
  this.style.display='none';
  award('read',5);
};

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
 {k:['нефтепровод','труба','балахан','чёрный город','как работает','пуск','80 тыс','80 000'],a:'Десять километров стальной трубы в три дюйма, паровой насос — и нефть сама течёт с промысла на завод. До 80 тысяч пудов в сутки. Главное — не труба, а расчёт: диаметр, давление, вязкость. Надо считать, а не пробовать.'},
 {k:['нобел','деньги','заказ','оплат','убедил'],a:'Заказ оплатило «Товарищество братьев Нобель» — им бочки с арбами стоили дороже самой нефти. Я показал им числа: себестоимость перекачки в разы ниже. Числа убеждают лучше слов.'},
 {k:['возчик','арба','бочк','подвод','угроз','охран','казак'],a:'Возчики грозили разломать трубу — доставкой нефти кормились более десяти тысяч человек. Трубу охраняли казаки. Но экономика победила быстрее ружей: против числа не поспоришь.'},
 {k:['крекинг','бензин','бартон','американ','патент','синклер','обидно'],a:'Крекинг я запатентовал в 1891 году — разложение нефти нагревом под давлением. России бензин был тогда не нужен: автомобилей не существовало. Через двадцать два года то же запатентовали в Америке. В 1923-м их делегация сверила патенты и признала: русский был первым. Обиды не держу — жаль лишь, что дело ушло за океан.'},
 {k:['башн','шаболовк','гиперболоид','радио','эйфелев'],a:'Башня на Шаболовке — сетка из прямых стержней: гиперболоид. Лёгкая, прочная, красивая — и собрана без лесов, телескопом. Задумывал я её выше Эйфелевой, в 350 метров, да металла в стране не хватило.'},
 {k:['чебышёв','чебышев','кафедра','математик','учёб','образован','училище'],a:'Пафнутий Львович Чебышёв звал меня на кафедру, к чистой математике. Я отказался: хотел строить. Математика для меня — инструмент, а не келья.'},
 {k:['детств','родил','грайворон','семь','курск'],a:'Родился я в Грайвороне, в Курской губернии, в 1853 году. Дворяне мы небогатые — всё, что имею, взято трудом и расчётом.'},
 {k:['гонорар','скромн','богат','характер'],a:'От многих гонораров я отказывался. Инженер обязан стране — а не наоборот. Мне хватает работы и чертёжной доски.'},
 {k:['изобрет','котл','форсунк','барж','тысяч','3000','перекрыти','гум'],a:'Изобретений у меня около двухсот: водотрубные котлы, форсунка для мазута, нефтеналивные баржи, сетчатые перекрытия — ГУМ и Пушкинский музей накрыты моими конструкциями.'},
 {k:['баку','промыс','1877','приехал'],a:'Баку семидесятых — нефтяная столица мира, задыхавшаяся от собственной нефти. Добывать умели, возить — нет. Я приехал туда в 1877-м от конторы Бари — и увидел не хаос, а задачу по гидравлике.'},
 {k:['формул','расчёт','наук','гидравлик','считал','проектир'],a:'Я вывел формулы: какой диаметр под заданный поток, какое давление, где ставить станции перекачки, как вязкость зависит от температуры. Опубликовал открыто. По ним и сегодня проектируют трубопроводы.'},
 {k:['смерть','умер','свеч','1939'],a:'Февраль 1939 года... нелепо вышло: опрокинул свечу, ожоги. Мне было восемьдесят пять, и я работал до последнего дня.'},
 {k:['батум','керосинопровод','835'],a:'Керосинопровод Баку — Батум: восемьсот тридцать пять километров, крупнейший в мире на тот момент. 1907 год. Труба дотянулась до Чёрного моря.'},
 {k:['леонардо','первый инженер','слав','звани'],a:'«Русским Леонардо» меня назвали журналисты. Я инженер. Этого звания достаточно.'},
 {k:['привет','здравств','добрый','кто вы','кто ты'],a:'Здравствуйте. Владимир Григорьевич Шухов, инженер. Спрашивайте — только условимся: спорить будем числами.'}
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
  return 'Задачу надо ставить точно — тогда и решение найдётся. Спросите о трубе, о крекинге или о башне — расскажу с числами в руках.';
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

// стартовые вопросы + приветствие (без прокрутки при загрузке)
(function(){
  const qs=['Как вы убедили Нобелей дать деньги на трубу?','Обидно, что крекинг прославил Америку?','Как устроена ваша башня на Шаболовке?'];
  const box=document.getElementById('starters');
  qs.forEach(q=>{const c=document.createElement('span');c.className='chip';c.textContent=q;
    c.onclick=()=>{document.getElementById('chatInput').value=q;sendChat();};box.appendChild(c);});
  const w=document.createElement('div');w.className='msg inv';
  w.textContent='Здравствуйте. Владимир Григорьевич Шухов, инженер. Спрашивайте — только условимся: спорить будем числами.';
  document.getElementById('chatBox').appendChild(w);
})();

document.querySelectorAll('.starter-btn').forEach(b=>{
  b.onclick=function(){
    document.getElementById('chatInput').value=this.dataset.q;
    sendChat();
  };
});

// ── HERO SCENE: «Баку, 1878 — пуск нефтепровода» ─────────────────────────────
(function(){
  const cv=document.getElementById('heroCvs');if(!cv)return;
  const ctx=cv.getContext('2d');
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  /* HS — «рабочая высота» сцены. Текста поверх сцены больше нет (правило 03.08: сцена
     отдельно, хук под ней), поэтому сцена занимает почти всю высоту блока — запас снизу
     оставлен только под подсказку «нажми на сцену». */
  let W,H,HS,t=0;
  function resize(){const p=cv.parentElement;W=(p?p.offsetWidth:innerWidth);H=(p?p.offsetHeight:Math.round(innerHeight*.52));HS=H*.95;
    cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);}
  resize();addEventListener('resize',resize);

  let on=false, wheelA=0, carts=1, surge=-1, smoke=[], drops=[], hinted=false;
  for(let i=0;i<14;i++)drops.push({q:Math.random(),lane:Math.random()>.5?0:1});

  function scene(){
    ctx.clearRect(0,0,W,H);
    const gy=HS*.82, ty1=HS*.40, ty2=HS*.46, tx0=W*.12, tx1=W*.88;
    // звёзды + зарево над промыслом
    for(let i=0;i<40;i++){const x=(i*137.5)%W,y=(i*61.7)%(HS*.3);
      ctx.beginPath();ctx.arc(x,y,.8,0,7);ctx.fillStyle=`rgba(255,255,255,${.05+.05*Math.sin(t+i)})`;ctx.fill();}
    let g=ctx.createRadialGradient(W*.14,gy,10,W*.14,gy,W*.5);
    g.addColorStop(0,'rgba(201,140,60,.10)');g.addColorStop(1,'rgba(201,140,60,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // земля
    ctx.fillStyle='rgba(4,8,16,.75)';ctx.fillRect(0,gy,W,H-gy);
    ctx.strokeStyle='rgba(201,168,76,.25)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();

    // буровая вышка слева
    const vx=W*.13,vy=gy;
    ctx.strokeStyle='rgba(201,168,76,.7)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(vx-22,vy);ctx.lineTo(vx,vy-HS*.30);ctx.lineTo(vx+22,vy);ctx.stroke();
    for(const q of[.35,.6,.82]){const w=22*(1-q);
      ctx.beginPath();ctx.moveTo(vx-w,vy-HS*.30*q);ctx.lineTo(vx+w,vy-HS*.30*q);ctx.stroke();}

    // насосная станция с маховиком
    const nx=W*.24,ny=gy;
    ctx.fillStyle='#151009';ctx.strokeStyle='rgba(201,168,76,.5)';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.roundRect(nx-24,ny-34,48,34,3);ctx.fill();ctx.stroke();
    if(on)wheelA+=.09+(surge>=0?.12:0);
    ctx.save();ctx.translate(nx,ny-40);ctx.rotate(wheelA);
    ctx.strokeStyle=on?'#e4c97a':'rgba(228,201,122,.45)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(0,0,13,0,7);ctx.stroke();
    for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-13);ctx.stroke();}
    ctx.restore();

    // труба (две нитки)
    [[ty1,7],[ty2,7]].forEach(([y,r])=>{
      const pg=ctx.createLinearGradient(tx0,y-r,tx0,y+r);
      pg.addColorStop(0,'rgba(120,150,190,.85)');pg.addColorStop(.45,'rgba(55,85,125,.9)');pg.addColorStop(1,'rgba(18,32,55,.9)');
      ctx.beginPath();ctx.roundRect(tx0,y-r,tx1-tx0,r*2,r);ctx.fillStyle=pg;ctx.fill();
      ctx.strokeStyle='rgba(140,170,210,.3)';ctx.lineWidth=1;ctx.stroke();});
    for(let x=tx0+40;x<tx1-20;x+=Math.round((tx1-tx0)/6)){
      ctx.fillStyle='rgba(80,110,160,.7)';ctx.fillRect(x-4,ty1-10,8,ty2-ty1+20);}
    // стояки к насосу и заводу
    ctx.strokeStyle='rgba(80,110,160,.8)';ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(nx,ny-34);ctx.lineTo(nx,ty2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(W*.86,gy-HS*.16);ctx.lineTo(W*.86,ty2);ctx.stroke();

    // нефть в трубе: после пуска — яркий сплошной поток со свечением
    if(on){ctx.save();ctx.shadowColor='rgba(240,180,60,.9)';ctx.shadowBlur=10;}
    drops.forEach(d=>{if(on)d.q+=(.010+(surge>=0?.008:0));if(d.q>1)d.q-=1;
      const y=(d.lane?ty2:ty1), x=tx0+8+(tx1-tx0-16)*d.q;
      ctx.beginPath();ctx.ellipse(x,y,on?6:4,on?3.4:2.6,0,0,7);
      ctx.fillStyle=on?'rgba(245,180,55,.95)':'rgba(120,90,30,.35)';ctx.fill();});
    if(on)ctx.restore();
    // импульс давления после тапа — крупный светящийся фронт
    if(surge>=0){surge+=(tx1-tx0)/34;
      ctx.save();ctx.shadowColor='#ffcf6a';ctx.shadowBlur=22;
      ctx.beginPath();ctx.arc(tx0+surge,(ty1+ty2)/2,13,0,7);
      ctx.fillStyle='rgba(255,206,106,.95)';ctx.fill();ctx.restore();
      if(tx0+surge>tx1){surge=-1;
        for(let i=0;i<14;i++)smoke.push({x:W*.86,y:gy-HS*.16,r:3,a:.55,vx:(Math.random()-.3)*.5,vy:-.7-Math.random()*.6});}}

    // завод справа (Чёрный город)
    [[W*.84,gy,22,HS*.16],[W*.90,gy,16,HS*.12],[W*.95,gy,13,HS*.14]].forEach(([x,y,w,h])=>{
      ctx.fillStyle='rgba(35,58,92,.85)';ctx.fillRect(x-w/2,y-h,w,h);
      ctx.strokeStyle='rgba(140,170,210,.25)';ctx.strokeRect(x-w/2,y-h,w,h);});
    // дым завода (после пуска)
    if(on&&Math.random()<.25)smoke.push({x:W*.90,y:gy-HS*.12,r:2.5,a:.35,vx:(Math.random()-.3)*.4,vy:-.5-Math.random()*.4});
    smoke=smoke.filter(p=>p.a>0);
    smoke.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=.12;p.a-=.004;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fillStyle=`rgba(180,190,205,${p.a})`;ctx.fill();});

    // караван подвод (уходит после пуска)
    if(carts>0){if(on)carts=Math.max(0,carts-.004);
      ctx.save();ctx.globalAlpha=carts;
      for(let i=0;i<4;i++){const cx=W*.35+i*W*.14+Math.sin(t*.7+i)*2, cy=gy+HS*.07;
        ctx.fillStyle='#1a1208';ctx.strokeStyle='rgba(160,130,70,.7)';ctx.lineWidth=1.2;
        ctx.beginPath();ctx.roundRect(cx-13,cy-9,26,8,2);ctx.fill();ctx.stroke();
        ctx.beginPath();ctx.ellipse(cx,cy-12,7,4.5,0,0,7);ctx.fillStyle='#241809';ctx.fill();ctx.stroke();
        for(const dx of[-8,8]){ctx.beginPath();ctx.arc(cx+dx,cy+1,4.5,0,7);
          ctx.strokeStyle='rgba(160,130,70,.8)';ctx.lineWidth=1.4;ctx.stroke();
          ctx.beginPath();ctx.moveTo(cx+dx-3,cy+1);ctx.lineTo(cx+dx+3,cy+1);ctx.stroke();}}
      ctx.restore();
      /* Подпись «тысячи подвод в день…» рисовалась прямо на сцене — это текст поверх
         живой картинки, запрещено (правило Сергея 03.08). Смысл ушёл в этикетку под сценой. */}
  }

  function fire(){keyHint();on=true;surge=0;
    // мгновенный видимый впрыск: волна капель + толчок дыма над заводом
    const gy=HS*.82;
    for(let i=0;i<3;i++)smoke.push({x:W*.86,y:gy-HS*.16,r:3,a:.55,vx:(Math.random()-.3)*.5,vy:-.7-Math.random()*.5});
    if(reduce){scene();}}  // без анимации всё равно перерисуем кадр
  function keyHint(){if(hinted)return;hinted=true;
    const h=document.getElementById('heroHint');
    if(h){h.classList.remove('cta-pulse');h.classList.add('cta-done');
      h.textContent='нефть пошла — тысячи подвод больше не нужны';
      setTimeout(()=>{h.style.opacity='0';},2200);}}

  cv.style.cursor='pointer';cv.style.pointerEvents='auto';
  cv.addEventListener('click',fire);
  /* нажать можно и саму кнопку под сценой — целиться в картинку не обязательно */
  const hbtn=document.getElementById('heroHint');
  if(hbtn) hbtn.addEventListener('click',fire);
  cv.addEventListener('touchstart',e=>{e.preventDefault();fire();},{passive:false});

  if(reduce){t=1;scene();return;}   // ждём тап; fire() перерисует кадр
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

// ── REVEAL ────────────────────────────────────────────────────────────────────
document.querySelectorAll('section.block').forEach(s=>s.classList.add('reveal'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on');}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
// Сброс состояния при повторном входе: браузер Telegram держит страницу в памяти,
// без этого квиз и игры остаются «пройденными» при следующем визите
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
(function(){
  const svg=document.getElementById('tower'); if(!svg) return;
  const NS='http://www.w3.org/2000/svg';
  const cx=280, yT=54, yB=372, rT=86, rB=132, ry=.26, N=22, TW=1.72;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mk=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e;};
  const pos=(a,r,y)=>[cx+r*Math.cos(a), y+r*ry*Math.sin(a)];

  // обода и ось
  svg.appendChild(mk('ellipse',{cx,cy:yB,rx:rB,ry:rB*ry,class:'rim'}));
  svg.appendChild(mk('ellipse',{cx,cy:yT,rx:rT,ry:rT*ry,class:'rim'}));
  svg.appendChild(mk('line',{x1:cx,y1:yT-26,x2:cx,y2:yB+26,class:'axis'}));

  // размерные линии — чертёжные обозначения, без выдуманных цифр
  const dx=cx-rB-34;
  svg.appendChild(mk('line',{x1:dx,y1:yT,x2:dx,y2:yB,stroke:'rgba(125,200,255,.4)','stroke-width':1}));
  [[yT,1],[yB,-1]].forEach(([y,s])=>{
    svg.appendChild(mk('line',{x1:dx-4,y1:y+6*s,x2:dx,y2:y,stroke:'rgba(125,200,255,.4)','stroke-width':1}));
    svg.appendChild(mk('line',{x1:dx+4,y1:y+6*s,x2:dx,y2:y,stroke:'rgba(125,200,255,.4)','stroke-width':1}));
    svg.appendChild(mk('line',{x1:dx-9,y1:y,x2:dx+9,y2:y,stroke:'rgba(125,200,255,.25)','stroke-width':1}));
  });
  const hLbl=mk('text',{x:dx-9,y:(yT+yB)/2,fill:'#8fb6d6','font-family':'JetBrains Mono, monospace','font-size':11,'text-anchor':'middle',transform:`rotate(-90 ${dx-9} ${(yT+yB)/2})`});
  hLbl.textContent='H'; svg.appendChild(hLbl);

  // стержни: два встречных направления. У каждого — прозрачный «толстый» двойник для наведения
  const bars=[], hits=[];
  for(let d=0;d<2;d++){
    for(let i=0;i<N;i++){
      const a=2*Math.PI*i/N, tw=d?TW:-TW;
      const ln=mk('line',{'stroke-linecap':'round'});
      ln._a=a; ln._tw=tw; svg.appendChild(ln); bars.push(ln);
    }
  }
  bars.forEach(ln=>{
    const h=mk('line',{stroke:'transparent','stroke-width':11,'pointer-events':'stroke'});
    h._a=ln._a; h._tw=ln._tw; h._bar=ln; svg.appendChild(h); hits.push(h);
  });
  function draw(phase){
    const put=ln=>{
      const [x1,y1]=pos(ln._a,rB,yB), [x2,y2]=pos(ln._a+ln._tw*phase,rT,yT);
      ln.setAttribute('x1',x1);ln.setAttribute('y1',y1);ln.setAttribute('x2',x2);ln.setAttribute('y2',y2);
    };
    bars.forEach(put); hits.forEach(put);
  }
  draw(1);

  // сборка: каждый стержень «прочерчивается»
  if(!reduce){
    bars.forEach((ln,i)=>{
      const L=ln.getTotalLength();
      ln.style.strokeDasharray=L; ln.style.strokeDashoffset=L;
      ln.style.transition='stroke-dashoffset .62s cubic-bezier(.2,.7,.2,1) '+(i%N*34+ (i<N?0:120))+'ms';
    });
    requestAnimationFrame(()=>requestAnimationFrame(()=>bars.forEach(l=>l.style.strokeDashoffset=0)));
    // лёгкое «дыхание» закрутки — только пока схема в кадре
    let vis=true, t0=performance.now();
    new IntersectionObserver(e=>{vis=e[0].isIntersecting;}).observe(svg);
    /* закрутка гуляет заметно: ±16% за ~9 с — гиперболоид «дышит», видно, что
       форма меняется, а стержни остаются прямыми (правка Сергея 02.08:
       прежние ±5% за 26 с выглядели как застывшая картинка) */
    const tick=now=>{ if(vis) draw(1+Math.sin((now-t0)/1450)*.16); requestAnimationFrame(tick); };
    setTimeout(()=>{
      bars.forEach(l=>{l.style.strokeDasharray='';l.style.transition='';});
      t0=performance.now(); requestAnimationFrame(tick);
    },1750);
  }

  // подсветка одного стержня — доказательство «он прямой»
  const hint=document.getElementById('towerHint');
  const touch=window.matchMedia('(hover: none)').matches;
  /* до первого показа кнопка зовёт нажать, после — подсказывает, что стержень можно выбрать любой */
  let base=hint?hint.textContent:'';
  let lit=null;
  const light=ln=>{ if(lit===ln) return; if(lit) lit.classList.remove('lit'); lit=ln;
    if(ln){ ln.classList.add('lit'); if(hint) hint.innerHTML='<b>стержень прямой</b> — от нижнего кольца до верхнего';}
    else if(hint) hint.textContent=base; };
  /* первое взаимодействие — хоть кнопкой, хоть наведением — снимает пульс и меняет базовый текст */
  let used=false;
  const done=()=>{ if(used) return; used=true;
    base=touch?'коснись любого стержня':'наведи на любой стержень';
    if(hint){hint.classList.remove('cta-pulse');hint.classList.add('cta-quiet');} };
  svg.addEventListener('pointerover',e=>{ if(e.target._bar){done();light(e.target._bar);} });
  svg.addEventListener('pointerleave',()=>light(null));
  if(hint){
    let k=0;
    hint.addEventListener('click',()=>{ done();
      if(!bars.length) return;
      /* каждый следующий клик подсвечивает другой стержень — видно, что прямой любой, а не один */
      light(bars[k%bars.length]); k++; });
  }
})();
