/* Второй скрипт дня 01-09 — как есть со страницы src/data/full-pages/izobreteniya/01-09.html: «Читать дальше» статьи,
   мини-игры раздела викторины (правда или миф, верю — не верю, шарада), развилка, чат с Блиновым, перечень темы.
   Нужна глобальная award() (assets/museum-score.js). */
// ── СТАТЬЯ ────────────────────────────────────────────────────────────────────
document.getElementById('moreBtn').onclick=function(){
  document.getElementById('article').classList.remove('collapsed');
  this.style.display='none';
  award('read',5);
};

// ── МИНИ-ИГРЫ ВИКТОРИНЫ ───────────────────────────────────────────────────────
function tmAns(b,ok){document.querySelectorAll('#gm_tm .gm-btn').forEach(x=>x.disabled=true);b.classList.add(ok?'ok':'no');document.getElementById('tmExp').classList.add('show');if(ok&&typeof award==='function')award('tm',5);}
function vbAns(b,ok){document.querySelectorAll('#gm_vb .gm-btn').forEach(x=>x.disabled=true);b.classList.add(ok?'ok':'no');document.getElementById('vbExp').classList.add('show');if(ok&&typeof award==='function')award('vb',5);}
function charShow(){document.getElementById('charExp').classList.add('show');document.getElementById('charBtn').disabled=true;if(typeof award==='function')award('char',10);}

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
 {k:['гусениц','бесконечн','рельс','цепь','как придум','идея','колесо','грязь','проваливается'],a:'Колесо давит в одну точку — вот и проваливается. Я подумал: а что если расстелить под него бесконечную цепь из звеньев? Она ложится на грунт широкой полосой, вес распределяется — и машина едёт там, где колесо зарылось бы по ступицу. Просто, если знаешь, в чём задача.'},
 {k:['патент','1879','номер','документ','юридич'],a:'Патент №2245. Называлось «вагон с бесконечными рельсами». 1879 год. Комиссия рассмотрела, выдала. Всё честно.'},
 {k:['трактор','паровой','1888','самодвижущ','ехал','испытан'],a:'В 1888 году я поставил паровую машину на гусеничное шасси. Испытывал под Балаковым. Шёл по пашне, по грязи — туда, куда колёсный трактор и соваться не мог. Потом в Нижний Новгород привёз, на выставку.'},
 {k:['выставка','нижн','новгород','1896','диплом','грамот','медал','публик'],a:'Нижегородская выставка, 1896 год. Машина прошла своим ходом, повернула, остановилась. Люди смотрели — кто с удивлением, кто с недоверием. Серебряную медаль дали — да только за пожарный насос. А за трактор — похвальную грамоту. Денег на завод — нет.'},
 {k:['холт','американ','caterpillar','кэтерпиллар','скопир','обидно','слав'],a:'О господине Холте я не слышал — умер в 1902-м, до его испытаний не дожил. Но если он придумал то же, что я, через двадцать пять лет — что ж, значит, идея была правильная. Обидно ли? Я не успел об этом задуматься.'},
 {k:['завод','производство','почему не','деньги','капитал','министер'],a:'Денег на завод у меня не было. Богатых людей за спиной — тоже. В министерства ходил, но там своих дел хватает. Так и остался при мастерских в Балакове.'},
 {k:['крепостной','грамот','учился','образован','самоучка','детство','отец'],a:'Родился крепостным. Грамоте выучился сам — уже когда вырос. Книг не читал много, зато руки думают сами. Отец был простым человеком, мать тоже. Всё что имею — своим умом.'},
 {k:['балаково','мастерск','волга','матрос','кочегар','пароход','геркулес'],a:'Начинал грузчиком да бурлаком. Потом почти четверть века на пароходе «Геркулес» — кочегаром, помощником машиниста, машинистом. Потом свои мастерские открыл в Балакове — оно тогда к Самарской губернии относилось. Там и прожил до конца.'},
 {k:['танк','военн','первая мировая','война'],a:'О танках я ничего не знаю — умер в 1902-м. Но если мой принцип пригодился для войны... что ж, изобретение само по себе не воюет. Это люди решают, что делать с инструментом.'},
 {k:['привет','здравств','добрый','кто вы','кто ты'],a:'Фёдор Блинов, механик из Балакова. Объяснять на словах не мастер — зато руками покажу. Спрашивайте.'}
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
  return 'Спрашивайте — только говорите попроще, я объяснять на словах не мастер, зато руками покажу.';
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
(function(){
  const qs=['Как вам пришла идея бесконечных рельсов?','Обидно, что американцы прославились вместо вас?','Почему в России не запустили производство?'];
  const box=document.getElementById('starters');
  qs.forEach(q=>{const c=document.createElement('span');c.className='chip';c.textContent=q;
    c.onclick=()=>{document.getElementById('chatInput').value=q;sendChat();};box.appendChild(c);});
  const w=document.createElement('div');w.className='msg inv';
  w.textContent='Фёдор Блинов, механик из Балакова. Объяснять на словах не мастер — зато руками покажу. Спрашивайте.';
  document.getElementById('chatBox').appendChild(w);
})();

document.querySelectorAll('.starter-btn').forEach(b=>{
  b.onclick=function(){
    document.getElementById('chatInput').value=this.dataset.q;
    sendChat();
  };
});

// ── ТЕМАТИЧЕСКИЕ ИЗОБРЕТЕНИЯ ─────────────────────────────────────────────────
const themeBtn=document.getElementById('themeInvBtn');
if(themeBtn)themeBtn.onclick=function(){
  const b=document.getElementById('themeInvBody');
  const open=b.style.display==='none';
  b.style.display=open?'block':'none';
  this.textContent=open?'▲ Скрыть':this.dataset.label||'Показать перечень →';
  if(open)award('theme',5);
};
