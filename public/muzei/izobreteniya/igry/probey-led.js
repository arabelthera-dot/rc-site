/* Игры 01-08 («Пробей арктический лёд — как „Ермак“» и «Быстрый ответ») — скрипты как есть со страницы
   src/data/full-pages/izobreteniya/01-08.html; разметка — src/data/igry/izobreteniya/probey-led.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
const grid=document.getElementById('ermakGrid');if(!grid)return;
let broken=0,hits=0;const blocks=[];
const types=[{hp:1,col:'rgba(190,225,245,.6)',label:'тонкий'},{hp:2,col:'rgba(140,185,220,.7)',label:'обычный'},{hp:3,col:'rgba(90,140,190,.8)',label:'толстый'}];
for(let i=0;i<10;i++){const type=types[Math.floor(Math.random()*types.length)];const div=document.createElement('div');
  div.style.cssText='aspect-ratio:1;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;font-weight:700;color:rgba(255,255,255,.7);transition:.15s;border:1px solid rgba(255,255,255,.15);user-select:none';
  div.style.background=type.col;div.textContent=type.label;div.dataset.hp=type.hp;div.dataset.maxHp=type.hp;
  div.onclick=function(){if(this.dataset.hp<=0)return;
    hits++;document.getElementById('ermakHits').textContent=hits;
    this.dataset.hp--;const hp=+this.dataset.hp;const maxHp=+this.dataset.maxHp;
    if(hp===0){broken++;document.getElementById('ermakBroken').textContent=broken;
      this.style.background='rgba(201,168,76,.15)';this.style.borderColor='rgba(201,168,76,.3)';this.textContent='💧';this.style.cursor='default';
      this.style.transform='scale(.95)';
      if(broken>=10){document.getElementById('ermakResult').textContent='🏆 Путь открыт! «Ермак» пробил арктический лёд — как в 1899!';if(typeof award==='function')award('gm_ermak',15);}}
    else{const frac=hp/maxHp;this.style.background=`rgba(${Math.round(90+frac*100)},${Math.round(140+frac*45)},${Math.round(190+frac*30)},.${Math.round(6+frac*2)})`;
      this.style.transform='scale(1.05)';setTimeout(()=>this.style.transform='',120);}};
  grid.appendChild(div);blocks.push(div);}
})();
(function(){
  let t=15,ti=null,done=false;
  const correct=3;
  function go(){if(ti||done)return;ti=setInterval(()=>{
    if(done)return;
    t--;document.getElementById('gm_quiz2_t').textContent=t;
    if(t<=0){clearInterval(ti);gm_quiz2_ans(-1);}
  },1000);}
  const box=document.getElementById('gm_quiz2');
  if('IntersectionObserver' in window&&box){const io=new IntersectionObserver(e=>{if(e[0].isIntersecting){io.disconnect();go();}},{threshold:.6});io.observe(box);}else go();
  window['gm_quiz2_ans']=function(i){
    if(done)return;done=true;clearInterval(ti);
    const btns=document.querySelectorAll('#gm_quiz2_opts .gm-btn');
    btns.forEach((b,j)=>{b.disabled=true;
      if(j===correct)b.classList.add('ok');
      else if(j===i)b.classList.add('no');
      else b.classList.add('neutral');
    });
    document.getElementById('gm_quiz2_exp').classList.add('show');
    if(i===correct){const pts=Math.max(5,Math.round(t/15*15));if(typeof award==='function')award('gm_quiz2',pts);}
  };
})();
