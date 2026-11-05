/* Второй скрипт дня 01-08 — как есть со страницы src/data/full-pages/izobreteniya/01-08.html: «Читать дальше» статьи,
   мини-игры раздела викторины (правда или миф, верю — не верю, шарада), развилка, чат с Макаровым, перечень темы.
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
 {k:['нос','вползает','лёд','корпус','яйцо','два метра','режет'],a:'«Ермак» не режет лёд как нож — он вползает на него скошенным носом и продавливает собственным весом. Корпус в сечении похож на яйцо: льды не раздавливают судно, а выталкивают вверх. До «Ермака» так не умел никто в мире. Два метра арктического льда — не предел.'},
 {k:['менделеев','помог','деньги','витте','министр','финансов'],a:'Менделеев сам грезил Арктикой. Когда министерства отказывали, он помог убедить министра финансов Витте. Деньги на строительство «Ермака» — во многом его заслуга. Учёный помог моряку, а вместе они помогли стране.'},
 {k:['англия','ньюкасл','армстронг','строили'],a:'Своих мощностей под такой корпус в России тогда не было. Заказали в Ньюкасле, на верфи Армстронга. Строили по русскому проекту, под надзором русских инженеров. Это важно — корабль наш, даже если гвозди британские.'},
 {k:['папанинцы','1938','снял','льдина'],a:'В 1938 году «Ермак» участвовал в экспедиции за папанинцами — зимовщиков дрейфующей станции забрали «Таймыр» и «Мурман». Сам корабль к тому времени уже сорок лет был в строю. Редкая судьба для любого судна.'},
 {k:['апраксин','радио','попов','спасение','броненосец','камни'],a:'В 1900 году «Ермак» снял с камней броненосец «Генерал-адмирал Апраксин». В той операции впервые всерьёз поработало радио Попова: депешу о спасении передали по беспроволочному телеграфу. Два изобретения встретились в деле.'},
 {k:['гибель','порт-артур','мина','1904','верещагин'],a:'Я погиб в 1904 году: броненосец «Петропавловск» подорвался на мине под Порт-Артуром и затонул за две минуты. Вместе со мной погиб художник Верещагин — он писал море с мостика. «Ермаку» ещё предстояло полвека службы, а я его триумфа не увидел.'},
 {k:['полюс','напролом','лекция','чиновники','смеялись'],a:'На лекции в Морской академии я показал залу кусок льда и молоток — рассказывают. «Вопрос лишь в том, чей молоток тяжелее». Чиновники смеялись над идеей идти к полюсу напролом — до тех пор, пока за неё не встал Менделеев.'},
 {k:['63','60 лет','служил','1963','атомный'],a:'«Ермак» служил больше шестидесяти лет — до 1963 года. Пережил три войны, снял папанинцев, водил арктические конвои. Списали его, только когда уже ходил атомный ледокол «Ленин». Редкая судьба для корабля.'},
 {k:['помни войну','завет','кронштадт','памятник'],a:'«Помни войну» — мой завет флоту. Эти слова выбиты на моём памятнике в Кронштадте. Будь готов даже в самый мирный день. Броненосец «Петропавловск» доказал: война не предупреждает.'},
 {k:['пластырь','пробоина','бронебойный','снаряд','колпачок','торпеда','первая','турецкая'],a:'Ледокол — лишь одно из дел. Придумал ещё пластырь для заделки пробоин — флот пользуется принципом до сих пор. «Макаровский колпачок» — мягкий наконечник бронебойного снаряда. И первую в истории успешную торпедную атаку провёл я — в 1877 году, с парохода «Великий князь Константин».'},
 {k:['привет','здравств','добрый','кто вы','кто ты'],a:'Степан Осипович Макаров, вице-адмирал. В море я у себя дома, а на берегу — в гостях. Спрашивайте.'}
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
  return 'Уточните вопрос — постараюсь ответить точно.';
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
  const qs=['Почему вы хотели идти к полюсу напролом?','Как Менделеев вам помог?','Что чувствуете, глядя на атомные ледоколы?'];
  const box=document.getElementById('starters');
  qs.forEach(q=>{const c=document.createElement('span');c.className='chip';c.textContent=q;
    c.onclick=()=>{document.getElementById('chatInput').value=q;sendChat();};box.appendChild(c);});
  const w=document.createElement('div');w.className='msg inv';
  w.textContent='Степан Осипович Макаров, вице-адмирал. В море я у себя дома, а на берегу — в гостях. Спрашивайте.';
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
