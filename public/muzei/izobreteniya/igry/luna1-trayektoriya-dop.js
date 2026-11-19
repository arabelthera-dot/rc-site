/* Второй скрипт дня 01-02 (статья «Читать дальше», развилка, чат, сцена, перечень темы, reveal) — как есть со страницы
   src/data/full-pages/izobreteniya/01-02.html (Р286), без частей, которые рисует шаблон: MUSEUM_SCORE, викторина, календарь.
   Нужна глобальная award() (assets/museum-score.js); sendChat — глобальная (onclick в разметке #chat-sec). */
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
 {k:['промах','мимо','не попал','шесть тысяч','6000','провал'],a:'Прошли мимо примерно в шести тысячах километров. Попасть в Луну тогда было почти невозможно: поправить траекторию в полёте станция не могла. Но до Луны впервые дотянулся не взгляд, а рукотворный аппарат — и это уже другая эпоха.'},
 {k:['скорость','вторая космическая','11,2','разгон','притяжен'],a:'Впервые в истории машина набрала вторую космическую — 11,2 километра в секунду — и навсегда вырвалась из земного притяжения. Это рекорд сам по себе, даже без попадания.'},
 {k:['солнечный ветер','частиц','поток','солнце'],a:'По дороге приборы поймали непрерывный поток заряженных частиц от Солнца. Физики о нём спорили — мы его измерили. Спору конец: солнечный ветер существует.'},
 {k:['магнит','магнитометр','поле'],a:'Ждали у Луны магнитное поле, как у Земли. Магнитометр не нашёл ничего. Отрицательный результат — тоже результат, и он был первым.'},
 {k:['мечт','имя','назван','спутник солнца','планет'],a:'Пролетев мимо, станция вышла на орбиту вокруг Солнца и стала первым искусственным спутником светила. В газетах её назвали «Мечтой». Она и сейчас летает где-то между орбитами Земли и Марса.'},
 {k:['вымпел','герб','шар','361','масса','приборы','аппарат'],a:'Металлический шар в триста шестьдесят один килограмм, набитый приборами, и вымпел с гербом. Всё, что можно было поднять на той ракете.'},
 {k:['америк','сша','pioneer','пионер','гонк'],a:'Их Pioneer 4 стартовал в марте того же года — и тоже прошёл мимо Луны. На два месяца позже нашего пуска.'},
 {k:['луна-2','луна 2','попадан','сентябр','жёстк'],a:'В сентябре пятьдесят девятого «Луна-2» упала на Луну — первая в мире жёсткая посадка на другое небесное тело. Дорога, начатая «Мечтой», была пройдена до конца.'},
 {k:['секрет','тайна','имя','кто вы','кто ты','конструктор'],a:'Сергей Павлович Королёв, главный конструктор. Имя моё при жизни — государственная тайна, в газетах я «главный конструктор» без фамилии.'},
 {k:['привет','здравств','добрый'],a:'Здравствуйте. Королёв. Спрашивайте о «Мечте» — о первом рывке за пределы земного притяжения.'}
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
  return 'Не всё мне ведомо — я про своё дело. Спросите лучше о первом рывке к Луне, о «Мечте», что обогнала планету, или о том, как мы прокладывали дорогу в космос.';
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
  const qs=['Почему «Луна-1» не попала в Луну?','Что такое солнечный ветер и при чём тут вы?','Почему станцию назвали «Мечтой»?'];
  const box=document.getElementById('starters');
  qs.forEach(q=>{const c=document.createElement('span');c.className='chip';c.textContent=q;
    c.onclick=()=>{document.getElementById('chatInput').value=q;sendChat();};box.appendChild(c);});
  const w=document.createElement('div');w.className='msg inv';
  w.textContent='Здравствуйте. Королёв. Спрашивайте о «Мечте» — о первом рывке за пределы земного притяжения.';
  document.getElementById('chatBox').appendChild(w);
})();

document.querySelectorAll('.starter-btn').forEach(b=>{
  b.onclick=function(){
    document.getElementById('chatInput').value=this.dataset.q;
    sendChat();
  };
});

// ── HERO: ЛУНА-1 — ТРАЕКТОРИЯ К СОЛНЦУ ──────────────────────────────────────
(function(){
  const cv=document.getElementById('heroCvs');if(!cv)return;
  const ctx=cv.getContext('2d');
  let W,H,t=0;
  const stars=[];
  function init(){
    const p=cv.parentElement;
    W=cv.width=p?p.offsetWidth||window.innerWidth:window.innerWidth;
    H=cv.height=p?p.offsetHeight||Math.round(window.innerHeight*.52):Math.round(window.innerHeight*.52);
    stars.length=0;
    for(let i=0;i<180;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.2,a:.2+Math.random()*.7});
  }
  init();window.addEventListener('resize',init);

  // Позиции планет (относительные)
  const getPositions=()=>({
    earth:{x:W*.12,y:H*.72,r:Math.min(W,H)*.06},
    moon:{x:W*.52,y:H*.32,r:Math.min(W,H)*.042},
    sun:{x:W*.92,y:H*.18,r:Math.min(W,H)*.05}
  });

  // Траектория зонда — дуга от Земли мимо Луны к Солнцу
  function probePath(frac){
    const p=getPositions();
    const t2=frac;
    // Кривая Безье: Земля → контрольная точка → Солнце (мимо Луны)
    const cx1=W*.3,cy1=H*.1,cx2=W*.7,cy2=H*.28;
    const px=Math.pow(1-t2,3)*p.earth.x+3*Math.pow(1-t2,2)*t2*cx1+3*(1-t2)*t2*t2*cx2+t2*t2*t2*p.sun.x;
    const py=Math.pow(1-t2,3)*p.earth.y+3*Math.pow(1-t2,2)*t2*cy1+3*(1-t2)*t2*t2*cy2+t2*t2*t2*p.sun.y;
    return{x:px,y:py};
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    // Фон — глубокий космос
    const bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.7);
    bg.addColorStop(0,'#071020');bg.addColorStop(1,'#020810');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    // Звёзды
    stars.forEach(s=>{
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${s.a+.15*Math.sin(t*.5+s.x)})`;ctx.fill();
    });
    const pos=getPositions();
    // Земля
    const eg=ctx.createRadialGradient(pos.earth.x-pos.earth.r*.3,pos.earth.y-pos.earth.r*.3,pos.earth.r*.1,pos.earth.x,pos.earth.y,pos.earth.r);
    eg.addColorStop(0,'#3a8ac4');eg.addColorStop(.6,'#1a4a8a');eg.addColorStop(1,'#0d2a50');
    ctx.beginPath();ctx.arc(pos.earth.x,pos.earth.y,pos.earth.r,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();
    // Атмосфера Земли
    const eAtm=ctx.createRadialGradient(pos.earth.x,pos.earth.y,pos.earth.r,pos.earth.x,pos.earth.y,pos.earth.r*1.3);
    eAtm.addColorStop(0,'rgba(100,180,255,.25)');eAtm.addColorStop(1,'rgba(100,180,255,0)');
    ctx.beginPath();ctx.arc(pos.earth.x,pos.earth.y,pos.earth.r*1.3,0,Math.PI*2);ctx.fillStyle=eAtm;ctx.fill();
    // Луна
    const mg=ctx.createRadialGradient(pos.moon.x-pos.moon.r*.25,pos.moon.y-pos.moon.r*.25,pos.moon.r*.05,pos.moon.x,pos.moon.y,pos.moon.r);
    mg.addColorStop(0,'#b0b0b8');mg.addColorStop(.5,'#7a7a85');mg.addColorStop(1,'#3a3a45');
    ctx.beginPath();ctx.arc(pos.moon.x,pos.moon.y,pos.moon.r,0,Math.PI*2);ctx.fillStyle=mg;ctx.fill();
    // Кратеры Луны
    [[-.3,-.25,.3],[.2,.15,.18],[-.1,.3,.22]].forEach(([dx,dy,r])=>{
      ctx.beginPath();ctx.arc(pos.moon.x+pos.moon.r*dx,pos.moon.y+pos.moon.r*dy,pos.moon.r*r,0,Math.PI*2);
      ctx.fillStyle='rgba(40,40,50,.4)';ctx.fill();});
    // Солнце
    for(let gr=3;gr>=1;gr--){
      const glow=ctx.createRadialGradient(pos.sun.x,pos.sun.y,0,pos.sun.x,pos.sun.y,pos.sun.r*gr*1.5);
      glow.addColorStop(0,`rgba(255,210,60,${.25/gr})`);glow.addColorStop(1,'rgba(255,160,20,0)');
      ctx.beginPath();ctx.arc(pos.sun.x,pos.sun.y,pos.sun.r*gr*1.5,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill();
    }
    const sg=ctx.createRadialGradient(pos.sun.x-pos.sun.r*.2,pos.sun.y-pos.sun.r*.2,0,pos.sun.x,pos.sun.y,pos.sun.r);
    sg.addColorStop(0,'#fff7cc');sg.addColorStop(.5,'#ffc820');sg.addColorStop(1,'#ff8c00');
    ctx.beginPath();ctx.arc(pos.sun.x,pos.sun.y,pos.sun.r,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();
    // Траектория (пунктир)
    ctx.save();ctx.setLineDash([4,8]);ctx.strokeStyle='rgba(201,168,76,.3)';ctx.lineWidth=1.5;
    ctx.beginPath();
    for(let i=0;i<=100;i++){const pp=probePath(i/100);i===0?ctx.moveTo(pp.x,pp.y):ctx.lineTo(pp.x,pp.y);}
    ctx.stroke();ctx.restore();
    // Зонд — фаза: перелёт (frac 0→1) затем орбита вокруг Солнца
    const CYCLE=600; // кадров на полный цикл
    const phase=t%CYCLE;
    const TRANSIT=300; // кадров на перелёт
    let probe;
    if(phase<TRANSIT){
      const frac=phase/TRANSIT;
      probe=probePath(frac);
      // След зонда
      ctx.beginPath();
      for(let i=0;i<=60;i++){const ff=Math.max(0,frac-i/TRANSIT*0.7);const pp=probePath(ff);i===0?ctx.moveTo(pp.x,pp.y):ctx.lineTo(pp.x,pp.y);}
      const trailEnd=probePath(Math.max(0,(phase-40)/TRANSIT));
      const trailGrad=ctx.createLinearGradient(probe.x,probe.y,trailEnd.x,trailEnd.y);
      trailGrad.addColorStop(0,'rgba(201,168,76,.7)');trailGrad.addColorStop(1,'rgba(201,168,76,0)');
      ctx.strokeStyle=trailGrad;ctx.lineWidth=2;ctx.stroke();
    } else {
      // Орбита вокруг Солнца
      const orbitAngle=(phase-TRANSIT)/(CYCLE-TRANSIT)*Math.PI*2;
      const orbitR=pos.sun.r*2.8;
      probe={x:pos.sun.x+Math.cos(orbitAngle)*orbitR,y:pos.sun.y+Math.sin(orbitAngle)*orbitR*0.55};
      // Орбитальный след
      ctx.beginPath();
      for(let i=0;i<=30;i++){const a=orbitAngle-i*.08;ctx.lineTo(pos.sun.x+Math.cos(a)*orbitR,pos.sun.y+Math.sin(a)*orbitR*0.55);}
      ctx.strokeStyle='rgba(201,168,76,.35)';ctx.lineWidth=1.5;ctx.stroke();
    }
    if(probe){
      // Зонд (сфера с антеннами)
      ctx.beginPath();ctx.arc(probe.x,probe.y,5,0,Math.PI*2);ctx.fillStyle='#e4c97a';ctx.fill();
      ctx.beginPath();ctx.arc(probe.x,probe.y,8,0,Math.PI*2);
      ctx.strokeStyle='rgba(228,201,122,.3)';ctx.lineWidth=2;ctx.stroke();
      // Антенны (4 штуки)
      [0,90,180,270].forEach(ang=>{const rad=ang*Math.PI/180;
        ctx.beginPath();ctx.moveTo(probe.x,probe.y);
        ctx.lineTo(probe.x+Math.cos(rad)*12,probe.y+Math.sin(rad)*12);
        ctx.strokeStyle='rgba(228,201,122,.6)';ctx.lineWidth=1;ctx.stroke();});
    }
    t++;requestAnimationFrame(draw);
  }
  draw();
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
