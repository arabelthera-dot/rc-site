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

/* Игра «Корень за ручку» (18 января, арифмометр Однера), r416. Игрок — счётчик за «Феликсом».
   Утверждённый факт (Р298, п. 10): корень на арифмометре находят, вычитая подряд нечётные числа 1, 3, 5, …
   пока в окне итога не станет 0; число оборотов ручки на счётчике и есть корень (Однер, наставление 1890 г.;
   «Наука и жизнь», 2020, № 6). Игрок сам ставит рычагами каждое следующее нечётное и крутит ручку — пальцем
   по кругу или кнопкой. Перекрутил (вычел больше, чем осталось) — звонок, в итоге «девятки», надо отвернуть
   ручку назад. Круг 2 — гонка со счетоводом, который считает тот же корень на бумаге. */
(function(){
  const root=document.querySelector('[data-koren-igra]');if(!root)return;
  const $=s=>root.querySelector(s);
  const elItog=$('.kr-itog'),elOb=$('.kr-ob'),elUst=$('.kr-ust'),elTask=$('.kr-task'),elSub=$('.kr-sub'),elKrug=$('.kr-krug');
  const ruchka=$('.kr-ruchka'),rukoyat=$('.kr-rukoyat'),bMinus=$('.kr-minus'),bPlus=$('.kr-plus'),bStop=$('.kr-stop');
  const schet=$('.kr-schet'),schetBar=$('.kr-schet i'),schetTxt=$('.kr-schet-txt');
  const fin=$('.kr-finale'),finH=$('.kr-fin-h'),finT=$('.kr-fin-txt'),finZ=$('.kr-zvezdy'),again=$('.kr-again'),dalee=$('.kr-dalee');
  const KRUGI=[{n:25,ob:'√25'},{n:196,ob:'√196',gonka:22}];
  const ruka=igraRuka(root);
  let st,ugol=0,tGonki=0,timer=0,zv={},ac=null,dano=false;
  function zvuk(f,d,t){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.type=t||'square';o.frequency.value=f;g.gain.setValueAtTime(.08,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+d);}catch(e){/* без звука */}}
  function chisla(el,v,n){const s=String(v).padStart(n,'0');el.innerHTML=s.split('').map(c=>'<b>'+c+'</b>').join('');}
  function risuy(){
    chisla(elItog,st.itog<0?1000000+st.itog:st.itog,6);chisla(elOb,st.ob,2);
    elUst.querySelectorAll('.kr-rychag').forEach((r,i)=>{const d=i===0?Math.floor(st.ust/10):st.ust%10;r.querySelector('.kr-cifra').textContent=d;r.style.setProperty('--d',d);});
    root.classList.toggle('kr-zvon',st.itog<0);
  }
  function podskazka(){
    if(st.konec)return;
    if(st.itog<0){elTask.innerHTML='<b>Дзынь! Перекрутил.</b> Вычел больше, чем оставалось.';elSub.textContent='Крутни ручку назад (+) — вернёшь последний оборот.';ruka.na(bPlus);return;}
    if(st.itog===0){elTask.innerHTML='<b>В итоге нули!</b> Жми «Стоп» и смотри на счётчик оборотов.';elSub.textContent='';ruka.na(bStop);return;}
    const nado=2*st.ob+1;
    if(st.ust!==nado){elTask.innerHTML='<b>Поставь рычагами следующее нечётное число.</b>';elSub.textContent=st.ob===0?'Начни с 1.':'Было '+(nado-2)+' — какое нечётное следующее?';ruka.na(st.krug===0&&st.ob<2?root.querySelector('.kr-rychag:nth-child(2) .kr-up'):null);return;}
    elTask.innerHTML='<b>Крути ручку от себя</b> — вычти '+st.ust+' из итога.';elSub.textContent='Пальцем по кругу или кнопкой «Оборот −».';ruka.na(st.krug===0&&st.ob<2?bMinus:null);
  }
  function oborot(zn){
    if(st.konec)return;
    if(zn<0){
      if(st.itog<0)return;
      st.itog-=st.ust;st.ob++;st.hist.push(st.ust);
      if(st.ust!==2*st.ob-1)st.oshibka=true;
      if(st.itog<0){st.zvon=true;zvuk(1760,.6,'triangle');zvuk(2640,.5,'sine');}else{zvuk(220,.05);setTimeout(()=>zvuk(260,.04),70);}
    }else{
      if(!st.hist.length)return;
      st.itog+=st.hist.pop();st.ob--;zvuk(180,.05);
    }
    rukoyat.style.transform='rotate('+(ugol+=zn<0?360:-360)+'deg)';
    risuy();podskazka();
  }
  function stop(){
    if(st.konec)return;
    const k=KRUGI[st.krug],koren=Math.round(Math.sqrt(k.n)),ok=st.itog===0&&st.ob===koren&&!st.oshibka;
    st.konec=true;clearInterval(timer);ruka.ubrat();
    fin.hidden=false;dalee.hidden=true;
    if(!ok){
      finH.textContent=st.itog<0?'Итог ушёл в «девятки» — ответ неверен':'Счётчик врёт: '+st.ob+' — не корень из '+k.n;
      finT.textContent=st.itog>0?'В итоге ещё '+st.itog+': ты остановился раньше времени.':'Где-то стояло не то нечётное число. Вычитать надо строго 1, 3, 5, 7… подряд.';
      zvuk(110,.4,'sawtooth');again.textContent='Ещё раз';return;
    }
    zvuk(523,.15,'sine');setTimeout(()=>zvuk(784,.25,'sine'),150);
    if(st.krug===0){zv.a=true;finH.textContent='5 оборотов — √25 = 5!';finT.textContent='1 + 3 + 5 + 7 + 9 = 25. Сколько раз повернул ручку — столько и корень. Теперь против живого счетовода.';dalee.hidden=false;again.textContent='Ещё раз √25';}
    else{
      if(!st.zvon)zv.b=true;if(st.pobeda)zv.c=true;
      finH.textContent=st.pobeda?'14 оборотов — √196 = 14. Счетовод ещё пишет!':'√196 = 14 — но счетовод успел первым';
      finT.textContent=(st.zvon?'Был звонок перекрута. ':'Без единого звонка. ')+'Однер продал первые 500 таких машин в 1890 году — конторы покупали их ради этой скорости.';
      again.textContent='Ещё раз';
      if(!dano&&typeof window.award==='function'){window.award('lab',40);dano=true;}
    }
    const z=[[zv.a,'√25 найден оборотами'],[zv.b,'√196 без звонка перекрута'],[zv.c,'обогнал счетовода']];
    finZ.innerHTML=z.map(([y,t])=>'<li class="'+(y?'da':'')+'">'+(y?'★':'☆')+' '+t+'</li>').join('');
    if(zv.a&&zv.b&&zv.c&&typeof window.award==='function')window.award('why0',10);
  }
  function nachat(krug){
    clearInterval(timer);fin.hidden=true;
    st={krug,itog:KRUGI[krug].n,ob:0,ust:0,hist:[],konec:false,zvon:false,oshibka:false,pobeda:false};
    elKrug.textContent='Круг '+(krug+1)+' из 2 · '+KRUGI[krug].ob;
    const g=KRUGI[krug].gonka;schet.hidden=!g;
    if(g){tGonki=0;schetBar.style.width='0';schetTxt.textContent='Счетовод начал столбиком на бумаге';
      timer=setInterval(()=>{if(st.konec)return;tGonki+=.25;const p=Math.min(1,tGonki/g);schetBar.style.width=(p*100)+'%';
        schetTxt.textContent=p<1?'Счетовод пишет столбиком… '+Math.round(p*100)+' %':'Счетовод ответил: 14. Ты опоздал.';
        if(p>=1){clearInterval(timer);st.opozdal=true;}},250);}
    risuy();podskazka();
  }
  bStop.addEventListener('click',()=>{if(KRUGI[st.krug].gonka&&!st.opozdal&&st.itog===0)st.pobeda=true;stop();});
  bMinus.addEventListener('click',()=>oborot(-1));bPlus.addEventListener('click',()=>oborot(1));
  elUst.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||st.konec)return;
    const i=[...elUst.querySelectorAll('.kr-rychag')].indexOf(b.closest('.kr-rychag')),m=i===0?10:1,zn=b.classList.contains('kr-up')?1:-1;
    let d=(i===0?Math.floor(st.ust/10):st.ust%10)+zn;d=(d+10)%10;st.ust=i===0?d*10+st.ust%10:Math.floor(st.ust/10)*10+d;zvuk(900,.02);risuy();podskazka();});
  again.addEventListener('click',()=>nachat(st.krug));dalee.addEventListener('click',()=>{nachat(1);root.scrollIntoView({block:'start',behavior:'smooth'});});
  /* Ручка пальцем: полный круг по часовой — оборот «−», против — «+». */
  let tyanu=null;
  function ug(e){const r=ruchka.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI;}
  ruchka.addEventListener('pointerdown',e=>{tyanu={a:ug(e),s:0};ruchka.setPointerCapture(e.pointerId);});
  ruchka.addEventListener('pointermove',e=>{if(!tyanu)return;let a=ug(e),d=a-tyanu.a;if(d>180)d-=360;if(d<-180)d+=360;tyanu.a=a;tyanu.s+=d;
    rukoyat.style.transform='rotate('+(ugol+tyanu.s)+'deg)';
    if(tyanu.s>=330){ugol+=tyanu.s-360;tyanu.s=0;oborot(-1);}else if(tyanu.s<=-330){ugol+=tyanu.s+360;tyanu.s=0;oborot(1);}});
  const otpusk=()=>{if(tyanu){rukoyat.style.transform='rotate('+ugol+'deg)';tyanu=null;}};
  ruchka.addEventListener('pointerup',otpusk);ruchka.addEventListener('pointercancel',otpusk);
  nachat(0);
})();
