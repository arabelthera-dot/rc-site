/* igra-ruka — вид как у образца 29 янв. (ko-hand, rc-site e4f86d74). Подсказка «куда жать» (Р206, 23.10.2026): на шаге одна активная кнопка
   пульсирует, над ней рука «тап-тап», остальные кнопки игры приглушены.
   Вставить В НАЧАЛО скрипта игры как есть. Использование:
     var ruka = igraRuka(root);   // root — секция игры
     ruka.na(knopka);             // показать руку над кнопкой, кнопка пульсирует
     ruka.ubrat();                // убрать (пока идёт анимация / финал)
   Отклик на касание (≤100 мс): класс .igra-zhmyak на pointerdown + navigator.vibrate(20). */
function igraRuka(root) {
  var el = document.createElement('span');
  el.className = 'igra-ruka'; el.setAttribute('aria-hidden', 'true'); el.hidden = true;
  el.innerHTML = '<i class="igra-ruka-krug"></i><svg viewBox="0 0 40 48" width="40" height="48"><path d="M15 4c2.2 0 4 1.8 4 4v13l1.2-.5c1.9-.7 4 .2 4.8 2l.3.7.8-.3c1.9-.6 4 .3 4.7 2.2l.2.5c1.9-.4 3.8.7 4.4 2.5.2.6.3 1.2.3 1.8V36c0 5.5-4.5 10-10 10h-4.6c-3 0-5.8-1.4-7.7-3.7L5.2 33.5c-1.3-1.6-1.1-4 .5-5.3 1.5-1.2 3.7-1.1 5.1.3l.2.2V8c0-2.2 1.8-4 4-4z" fill="#fff" stroke="#1a1206" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  if (getComputedStyle(root).position === 'static') root.style.position = 'relative';
  root.appendChild(el);
  var cel = null;
  function mesto() {
    if (!cel || el.hidden) return;
    var r = cel.getBoundingClientRect(), b = root.getBoundingClientRect();
    el.style.left = Math.round(r.left - b.left + r.width * 0.86) + 'px';
    el.style.top = Math.round(r.top - b.top + r.height * 0.5) + 'px';
  }
  function ubrat() {
    if (cel) cel.classList.remove('igra-aktiv');
    cel = null; el.hidden = true; root.classList.remove('igra-ved');
  }
  function na(knopka) {
    ubrat();
    if (!knopka) return;
    cel = knopka; cel.classList.add('igra-aktiv'); root.classList.add('igra-ved');
    el.hidden = false; mesto();
    requestAnimationFrame(mesto);
  }
  window.addEventListener('resize', mesto);
  if (window.ResizeObserver) new ResizeObserver(mesto).observe(root);
  root.addEventListener('pointerdown', function (e) {
    var k = e.target.closest('button, [role="button"]');
    if (!k || !root.contains(k)) return;
    k.classList.add('igra-zhmyak');
    setTimeout(function () { k.classList.remove('igra-zhmyak'); }, 160);
    if (navigator.vibrate) { try { navigator.vibrate(20); } catch (_) {} }
  });
  root.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  return { na: na, ubrat: ubrat, mesto: mesto };
}

/* «Разгони гиротрон» (31 января, Гапонов-Грехов, Горький), r420. Шаг 1 — подобрать магнитное поле под резонанс
   (электроны крутятся с частотой волны резонатора — тогда отдают ей энергию). Шаг 2 — угадать срок от 6 Вт до 1 МВт.
   Шаг 3 — год за годом: точки 6 Вт (1964), 400 кВт (1972, «Орясина»), 1 МВт (конец 1973) — М. И. Петелин. */
(function(){
  var root=document.querySelector('[data-gt-igra]');if(!root)return;
  var $=function(s){return root.querySelector(s);},$$=function(s){return [].slice.call(root.querySelectorAll(s));};
  var cv=$('canvas'),ctx=cv.getContext('2d'),elB=$('.gt-b'),elGod=$('.gt-god'),elP=$('.gt-p'),elTask=$('.gt-task'),elSub=$('.gt-sub');
  var bM=$('.gt-minus'),bP=$('.gt-plus'),bO=$$('.gt-o'),bGod=$('.gt-god-dalshe'),fin=$('.gt-finale'),again=$('.gt-again');
  var ruka=igraRuka(root),CEL=5,W,H,dpr,st,raf=0,t0=0;
  var SRAVN=[[1e6,'как 500 электрочайников разом'],[4e5,'как 200 электрочайников'],[5e4,'как 25 чайников'],[2e3,'как электрочайник'],[100,'как лампочка в люстре'],[0,'как ночник']];
  function aw(k,n){try{if(typeof award==='function')award(k,n);}catch(e){}}
  function moshch(g){return g>=1973?1e6:6*Math.pow(10,(g-1964)*Math.log10(4e5/6)/8);}
  function fmt(w){if(w>=1e6)return (w/1e6).toFixed(1).replace('.',',')+' МВт';if(w>=1e3)return Math.round(w/1e3)+' кВт';return Math.round(w)+' Вт';}
  function sravn(w){for(var i=0;i<SRAVN.length;i++)if(w>=SRAVN[i][0])return SRAVN[i][1];}
  function zadacha(t,s){elTask.innerHTML='<b>Что сделать сейчас:</b> '+t;elSub.textContent=s||'';}
  function razmer(){var r=cv.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,2);W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  function blizost(){return Math.max(0,1-Math.abs(st.b-CEL)/3);}
  function risuj(t){
    ctx.clearRect(0,0,W,H);var y0=H*0.5,x0=W*0.06,x1=W*0.62,r=H*0.18;
    ctx.strokeStyle='#3d6a96';ctx.lineWidth=2;ctx.strokeRect(x0,y0-r*1.9,x1-x0,r*3.8);
    for(var k=0;k<4;k++){ctx.fillStyle='rgba(90,140,200,'+(0.15+0.07*st.b)+')';ctx.fillRect(x0+(x1-x0)*(k*0.25+0.04),y0-r*2.3,(x1-x0)*0.17,r*0.35);ctx.fillRect(x0+(x1-x0)*(k*0.25+0.04),y0+r*1.95,(x1-x0)*0.17,r*0.35);}
    var w=1+st.b*0.9,bl=st.faza==='pole'?blizost():1;
    for(var i=0;i<14;i++){var x=x0+((t*0.00004*W+i*(x1-x0)/14)%(x1-x0)),f=t*0.004*w+i*1.3;
      ctx.fillStyle=bl>0.6?'#ffd27a':'#8cc8ff';ctx.beginPath();ctx.arc(x+Math.cos(f)*r*0.25,y0+Math.sin(f)*r,3,0,7);ctx.fill();}
    var a=st.faza==='pole'?bl:Math.min(1,0.25+Math.log10(Math.max(st.w,6))/6.5);
    if(a>0.05){ctx.strokeStyle='rgba(255,140,60,'+(0.3+0.7*a)+')';ctx.lineWidth=2+4*a;ctx.beginPath();
      for(var X=x1;X<W*0.97;X+=3){var Y=y0+Math.sin((X-x1)*0.08-t*0.012)*r*1.6*a;X===x1?ctx.moveTo(X,Y):ctx.lineTo(X,Y);}ctx.stroke();}
    ctx.fillStyle='#9fb1c4';ctx.font='12px system-ui,sans-serif';ctx.fillText('электроны в магнитном поле',x0+4,y0-r*2.5);ctx.fillText('волна',x1+8,y0-r*2.2);
  }
  function kadr(t){risuj(t);raf=requestAnimationFrame(kadr);}
  function tablo(){elB.textContent=st.b+' из 10';elGod.textContent=st.god;elP.textContent=st.faza==='pole'?fmt(Math.round(6*blizost()*blizost())):fmt(st.w);}
  function pole(d){if(st.faza!=='pole')return;st.b=Math.max(0,Math.min(10,st.b+d));st.nazh++;
    if(st.b>CEL&&d>0)st.proskok=true;tablo();
    if(st.b===CEL){st.faza='vopros';aw('why0',st.nazh<=6?10:5);bM.hidden=bP.hidden=true;bO.forEach(function(b){b.hidden=false;});
      st.w=6;tablo();zadacha('Угадай срок','Резонанс! Волна пошла — 6 ватт, как у первого гиротрона «молотка» в 1964 году. Сколько лет понадобится до мегаватта?');ruka.na(bO[1]);}
    else zadacha('Поймай резонанс',blizost()>0?'Волна уже дрожит — ты рядом.':(st.b>CEL?'Поле слишком сильное: электроны крутятся быстрее волны.':'Поле слабое: электроны крутятся медленнее волны.'));
    if(st.b!==CEL)ruka.na(st.b<CEL?bP:bM);}
  function otvet(v){if(st.faza!=='vopros')return;st.ugadal=v===9;if(st.ugadal)aw('why1',10);bO.forEach(function(b){b.hidden=true;});st.faza='gody';bGod.hidden=false;
    zadacha('Жми «Следующий год»',(st.ugadal?'Верно: 9 лет. ':'На деле — 9 лет. ')+'Мощность росла почти на полпорядка в год. Проверь сам.');ruka.na(bGod);}
  function god(){if(st.faza!=='gody')return;st.god++;st.w=moshch(st.god);tablo();
    var s='Это '+sravn(st.w)+'.';if(st.god===1972)s='1972-й: секретная «Орясина» — 400 кВт. '+s;
    if(st.god>=1973){aw('why2',10);aw('lab',30);konec();return;}zadacha('Жми «Следующий год»',s);}
  function konec(){st.faza='konec';ruka.ubrat();bGod.hidden=true;zadacha('Готово','Мегаватт — '+sravn(1e6)+'.');
    var z=[[!st.proskok&&st.nazh<=6,'Резонанс пойман без лишних нажатий'],[st.ugadal,'Срок угадан: 9 лет'],[true,'Мегаватт получен']],n=0;
    $('.gt-zvezdy').innerHTML=z.map(function(x){if(x[0])n++;return '<li>'+(x[0]?'★':'☆')+' '+x[1]+'</li>';}).join('');
    $('.gt-fin-h').textContent='6 Вт → 1 000 000 Вт: в 170 тысяч раз за 9 лет';
    $('.gt-fin-txt').textContent='Звёзд: '+n+' из 3. Таким лучом сегодня нагревают плазму в термоядерных установках — больше половины из них в мире греют нижегородскими гиротронами.';
    fin.hidden=false;}
  function start(){st={faza:'pole',b:1,god:1964,w:0,nazh:0,proskok:false,ugadal:false};fin.hidden=true;bM.hidden=bP.hidden=false;bGod.hidden=true;bO.forEach(function(b){b.hidden=true;});
    tablo();zadacha('Поймай резонанс','Электроны крутятся, но волны нет: поле слабое. Добавь поля.');ruka.na(bP);}
  bM.addEventListener('click',function(){pole(-1);});bP.addEventListener('click',function(){pole(1);});
  bO.forEach(function(b){b.addEventListener('click',function(){otvet(+b.dataset.v);});});
  bGod.addEventListener('click',god);again.addEventListener('click',start);
  razmer();start();
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)risuj(0);else raf=requestAnimationFrame(kadr);
  window.addEventListener('resize',function(){razmer();risuj(performance.now());});
})();
