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

/* Игра «Уйти на километр» (13 января, К-278). Р276: настоящая игра вместо «нажал — картинка сменилась».
   Игрок сам дозирует ход: малый или полный, и сам ставит лодку на остановку-осмотр. Ступени — как у Севмаша:
   до 800 м через 50 м, ниже через 25. На ходу в отсеках появляются неполадки и растут (глубже 700 м и на полном
   ходу — чаще и быстрее); на остановке экипаж их устраняет, но идёт время. Течь дошла до 100 % — авария;
   кончился запас времени — не успели; дошёл до 1027 м — рекорд, на всплытии бонус: торпеда на 800 м.
   Р206: только простые нажатия, рука на нужной кнопке, отклик на касание. Запас времени и неполадки — условия игры. */
(function(){
  const root=document.querySelector('[data-k278-igra]');if(!root)return;
  const cv=root.querySelector('canvas'),ctx=cv.getContext('2d');
  const $=s=>root.querySelector(s);
  const elDepth=$('.kk-depth'),elAtm=$('.kk-atm'),elTime=$('.kk-time'),elTask=$('.kk-task'),elSub=$('.kk-sub');
  const bMalo=$('.kk-malo'),bPolno=$('.kk-polno'),bStop=$('.kk-stop'),bTorp=$('.kk-torp');
  const hod=$('.kk-hod'),fin=$('.kk-finale'),again=$('.kk-again');
  const ruka=igraRuka(root);let rukaNa=null;
  function ruku(b){if(b===rukaNa)return;rukaNa=b;if(b)ruka.na(b);else ruka.ubrat();}
  function otklik(){try{if(navigator.vibrate)navigator.vibrate(20);}catch(e){/* нет вибро */}}

  const REKORD=1027;
  const STUPENI=[];for(let m=50;m<=800;m+=50)STUPENI.push(m);for(let m=825;m<=1000;m+=25)STUPENI.push(m);STUPENI.push(REKORD);
  const V={malo:8,polno:20};          // скорость погружения в игре, м/с
  const ZAPAS=120;                    // запас времени, с (на табло — 5 ч игрового времени)
  const OTSEKOV=7;
  const VIDNO=260;                    // метров воды в кадре по высоте

  let W=0,H=0,dpr=1;
  let ph,depth,rezhim,cel,vremya,haz,porog,levels,pochineno,osmT,flash,shake,torpeda,torpT,vsegoNepol,maxLvl,vestT,proydeno,puzyri;

  function rnd(){return Math.random();}
  function reset(){
    ph='start';depth=0;rezhim=null;cel=null;vremya=ZAPAS;haz=0;porog=0.7+rnd()*0.5;
    levels=new Array(OTSEKOV).fill(0);pochineno=0;osmT=0;flash=0;shake=0;torpeda=null;torpT=0;vsegoNepol=0;maxLvl=0;vestT=0;
    proydeno={};puzyri=[];for(let i=0;i<34;i++)puzyri.push({x:rnd(),d:rnd()*VIDNO-VIDNO/2,r:1+rnd()*2.5});
    fin.hidden=true;hod.hidden=false;bTorp.hidden=true;[bMalo,bPolno,bStop].forEach(b=>{b.hidden=false;b.setAttribute('aria-pressed','false');});
    root.classList.remove('kk-avaria','kk-pobeda');
    say('Нажми «Малый ход»','4 августа 1985 года, Норвежское море. Веди К-278 вниз, к рекорду — 1027 метров.');
    ruku(bMalo);hud();
  }
  function say(t,s){
    const h='<b>Что сделать сейчас:</b> '+t.replace(/[<&]/g,'');
    if(elTask.innerHTML!==h)elTask.innerHTML=h;
    if(s!==undefined&&elSub.textContent!==s)elSub.textContent=s;
  }
  function vest(s,sek){elSub.textContent=s;vestT=sek||4;}   // новость на несколько секунд

  function sledStupen(d){for(const m of STUPENI)if(m>d+0.01)return m;return REKORD;}
  function hudo(){let n=-1,mx=0;levels.forEach((l,i)=>{if(l>mx){mx=l;n=i;}});return {n:n,mx:mx};}
  function nepol(){return levels.filter(l=>l>0).length;}
  function chasy(sek){const m=Math.max(0,Math.round(sek/ZAPAS*300));return Math.floor(m/60)+' ч '+String(m%60).padStart(2,'0')+' мин';}
  function hud(){
    const d=Math.round(depth);
    elDepth.textContent=d+' м';elAtm.textContent='≈ '+Math.round(depth/10)+' атм';elTime.textContent=chasy(vremya);
    elTime.classList.toggle('kk-malo-vremeni',vremya<ZAPAS*0.2);
  }

  // --- неполадки в отсеках ---
  const NEPOL=[[0,'капает с фланца'],[300,'потёк фланец'],[700,'трещит деревянная панель'],[1000,'срезало титановый болт']];
  function nazvanie(d){let t=NEPOL[0][1];NEPOL.forEach(p=>{if(d>=p[0])t=p[1];});return t;}
  function novayaNepol(){
    const svob=[];levels.forEach((l,i)=>{if(l<=0)svob.push(i);});
    vsegoNepol++;
    if(!svob.length){const h=hudo();levels[h.n]=Math.min(99,levels[h.n]+20);return;}
    const i=svob[Math.floor(rnd()*svob.length)];levels[i]=12;
    vest((i+1)+'-й отсек: '+nazvanie(depth)+'! Пока лодка идёт, течь растёт.',5);
  }

  // --- шаг мира ---
  function step(dt){
    if(ph==='hod'||ph==='tormoz'||ph==='osmotr'){
      vremya-=dt;
      if(vremya<=0){vremya=0;proigral('vremya');return;}
    }
    if(vestT>0)vestT-=dt;
    if(flash>0)flash-=dt;
    if(ph==='hod'||ph==='tormoz'){
      const v=V[rezhim],dm=v*dt,prev=depth;
      depth=Math.min(depth+dm,ph==='tormoz'?cel:REKORD);
      const glub=depth>=700;
      haz+=(depth-prev)*(depth<300?0.004:glub?0.013:0.007)*(rezhim==='polno'?2.2:1);
      if(haz>=porog){haz-=porog;porog=0.7+rnd()*0.5;novayaNepol();}
      const rost=(rezhim==='polno'?13:6.5)*(glub?1.35:1);
      for(let i=0;i<OTSEKOV;i++)if(levels[i]>0)levels[i]+=rost*dt;
      sobytiya(prev,depth);
      if(hudo().mx>=100){proigral('avaria');return;}
      if(depth>=REKORD){pobeda();return;}
      if(ph==='tormoz'&&depth>=cel){ph='osmotr';osmT=0;rezhim=null;knopkiHoda();
        if(!nepol())vest('Ступень '+cel+' м. Остановка — осмотр отсеков.',3);}
    }else if(ph==='osmotr'){
      osmT+=dt;
      const h=hudo();
      if(h.mx>0){levels[h.n]=Math.max(0,h.mx-60*dt);
        if(levels[h.n]===0){pochineno++;if(pochineno===1&&window.award)window.award('why0',5);
          vest('Устранили неполадку в '+(h.n+1)+'-м отсеке.',2.5);}}
    }else if(ph==='vverh'){
      const v=depth>800?25:100;depth=Math.max(0,depth-v*dt);
      if(torpeda===null&&depth<770){torpeda=false;bTorp.hidden=true;ruku(null);vest('Торпеду на 800 метрах не пустили.',3);}
      if(torpT>0)torpT-=dt;
      if(depth<=0){final();return;}
    }
    const mx=hudo().mx;if(mx>maxLvl)maxLvl=mx;
    shake=mx>=70&&(ph==='hod'||ph==='tormoz')?1:0;
    podskazka();hud();
  }

  // события погружения — факты со страницы
  function sobytiya(a,b){
    const cross=m=>a<m&&b>=m&&!proydeno[m]&&(proydeno[m]=1);
    if(cross(600))vest('600 метров: предел американского «Сивулфа» (1997). Обычной атомной лодке глубже нельзя, у К-278 — титан.',5);
    if(cross(700))vest('700 метров: начинает сказываться обжатие корпуса, реактор — на полную мощность. Неполадки теперь чаще.',5);
    if(cross(800)){vest('800 метров. Дальше — ступени по 25 метров, как у К-278.',4);if(window.award)window.award('why1',5);}
    if(cross(1000))vest('1000 метров! Адмирал Чернов: «Остановись, мгновенье!» Осталось 27 метров.',5);
  }

  // что подсказать и куда поставить руку
  function podskazka(){
    const h=hudo(),n=nepol();
    if(ph==='hod'){
      if(h.mx>0){say('Жми «Стоп · осмотр» — течь в '+(h.n+1)+'-м отсеке');ruku(bStop);}
      else{say('Погружайся. Следи за отсеками');ruku(null);}
      if(vestT<=0)elSub.textContent='Следующая ступень — '+sledStupen(depth)+' м. «Стоп» ставит лодку на ближайшую ступень.';
    }else if(ph==='tormoz'){
      say('Лодка встаёт на ступень '+cel+' м…');ruku(null);
    }else if(ph==='osmotr'){
      if(n){say('Жди: экипаж устраняет неполадки ('+n+')');ruku(null);}
      else{say('Отсеки в порядке — жми «Малый» или «Полный» ход');ruku(depth>=700?bMalo:bPolno);
        if(vestT<=0)elSub.textContent='Глубже 700 метров полный ход опасен: течи появляются чаще и растут быстрее.';}
    }else if(ph==='vverh'){
      if(torpeda===null&&depth<=900){say('Жми «Торпеда» — пусти её на 800 м!');ruku(bTorp);}
      else if(torpeda===null)say('Всплытие. Готовь торпеду: стреляли на 800 метрах');
      else say('Всплываем…');
    }
  }

  function knopkiHoda(){bMalo.setAttribute('aria-pressed',rezhim==='malo');bPolno.setAttribute('aria-pressed',rezhim==='polno');}
  function dat(r){
    if(ph!=='start'&&ph!=='hod'&&ph!=='osmotr'&&ph!=='tormoz')return;
    otklik();
    if(ph==='osmotr'&&nepol())vest('Пошли дальше, не устранив течь — она снова растёт!',3);
    rezhim=r;ph=ph==='tormoz'?'tormoz':'hod';knopkiHoda();
    if(r==='polno'&&depth>=700)vest('Полный ход на такой глубине — большой риск.',3);
  }
  function stop(){
    if(ph==='osmotr'){vest('Лодка и так стоит на ступени '+Math.round(depth)+' м.',2);return;}
    if(ph!=='hod')return;
    otklik();cel=sledStupen(depth);ph='tormoz';
  }
  function strelyat(){
    if(ph!=='vverh'||torpeda!==null)return;
    otklik();
    if(depth<=830&&depth>=770){torpeda=true;torpT=1.6;if(window.award)window.award('why2',5);
      vest('Торпеда вышла! «Дрогнули задние крышки, но давление удержали» — как у Матвеева.',4);}
    else{vest('Рано: до 800 метров ещё '+Math.round(depth-800)+' м.',1.5);return;}
    bTorp.hidden=true;ruku(null);
  }

  function pobeda(){
    depth=REKORD;ph='vverh';rezhim=null;knopkiHoda();levels.fill(0);
    if(window.award)window.award('lab',35);
    root.classList.add('kk-pobeda');
    [bMalo,bPolno,bStop].forEach(b=>b.hidden=true);bTorp.hidden=false;
    zapasPobedy=vremya;
    vest('1027 метров — рекорд! «Потёк фланец, треснула панель, как пули отлетали титановые болты». Но лодка слушалась рулей.',6);
  }
  let zapasPobedy=0;
  function proigral(prich){
    ph=prich;flash=1.2;ruku(null);hod.hidden=true;root.classList.add('kk-avaria');
    const h=hudo(),d=Math.round(depth);
    $('.kk-fin-h').textContent=prich==='avaria'?'Авария на глубине '+d+' м':'Не успели: запас времени кончился на '+d+' м';
    $('.kk-fin-txt').innerHTML=prich==='avaria'
      ?'Течь в '+(h.n+1)+'-м отсеке не остановили — лодка аварийно всплывает. Испытание сорвано.<br><b>Совет:</b> пожелтел отсек — сразу «Стоп». Глубже 700 м иди малым ходом.'
      :'До рекорда не хватило '+(REKORD-d)+' м. Слишком медленно: испытание не уложилось в срок.<br><b>Совет:</b> до 700 м иди полным ходом — там течи редкие.';
    $('.kk-fin-bars').hidden=true;$('.kk-rang').textContent='';
    say('Нажми «Сыграть ещё»','Попробуй ещё раз: неполадки каждый раз в других отсеках.');
    pokazFinal();
  }
  function final(){
    ph='final';ruku(null);hod.hidden=true;
    const proc=zapasPobedy/ZAPAS;
    const rang=proc>=0.25?'Командир глубины':proc>=0.12?'Старпом':'Штурман';
    let best=0;try{best=+localStorage.getItem('k278-best')||0;}catch(e){/* без памяти */}
    const nov=zapasPobedy>best;if(nov){try{localStorage.setItem('k278-best',String(zapasPobedy));}catch(e){/* без памяти */}}
    $('.kk-fin-h').textContent='Рекорд: 1027 метров!';
    $('.kk-fin-txt').innerHTML='Запас времени — <b>'+chasy(zapasPobedy)+'</b>, неполадок устранено: <b>'+pochineno+'</b>. '
      +(torpeda?'Торпеду с 800 метров пустил, как экипаж в 1985 году.':'Торпеду на 800 метрах не пустил — экипаж в 1985 году стрелял.');
    $('.kk-rang').textContent='Звание: '+rang+(nov?' · новый личный рекорд!':' · лучший запас — '+chasy(best));
    $('.kk-fin-bars').hidden=false;
    say('Нажми «Сыграть ещё» — и сбереги больше времени','Ни одна подводная лодка с тех пор не погружалась глубже 1027 метров.');
    pokazFinal();
  }
  function pokazFinal(){
    fin.hidden=false;ruku(again);
    setTimeout(()=>fin.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'nearest'}),500);
  }

  // --- холст ---
  function resize(){dpr=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
  function mix(a,b,t){return a.map((x,i)=>Math.round(x+(b[i]-x)*t));}
  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const t=Math.min(1,depth/REKORD),ppm=H/VIDNO,cy=H*0.5;
    const c1=mix([29,90,134],[3,10,20],t),c2=mix([12,48,80],[1,4,10],t);
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgb('+c1+')');g.addColorStop(1,'rgb('+c2+')');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const sy=m=>cy+(m-depth)*ppm;
    if(sy(0)>0){ctx.fillStyle='#8fb8d8';ctx.fillRect(0,0,W,Math.max(0,sy(0)));}
    // пузырьки: летят вверх относительно лодки, когда она идёт вниз
    ctx.fillStyle='rgba(190,225,245,.35)';
    puzyri.forEach(p=>{let y=cy+p.d*ppm;if(y<-5){p.d+=VIDNO;y=cy+p.d*ppm;}if(y>H+5){p.d-=VIDNO;y=cy+p.d*ppm;}
      ctx.beginPath();ctx.arc(p.x*W,y,p.r,0,7);ctx.fill();});
    // ступени
    ctx.font='600 12px Inter,system-ui,sans-serif';ctx.textBaseline='bottom';
    const OSOB={600:['600 м — предел «Сивулфа» (США)','#ff8a7a'],700:['700 м — начинается обжатие корпуса','#ffcf7a'],800:['800 м — дальше ступени по 25 м','#ffcf7a'],1000:['1000 м — километр','#e4c97a'],1027:['1027 м — РЕКОРД','#ffd666']};
    STUPENI.forEach(m=>{const y=sy(m);if(y<-20||y>H+20)return;const o=OSOB[m];
      ctx.strokeStyle=o?o[1]:'rgba(200,220,240,.28)';ctx.lineWidth=m===REKORD?2.5:1;ctx.setLineDash(o?[]:[5,6]);
      ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(W,y);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=o?o[1]:'rgba(200,220,240,.7)';ctx.textAlign='left';ctx.fillText(o?o[0]:m+' м',34,y-2);});
    // общая шкала слева: 0…1100 м, где лодка сейчас
    const sx=10,s0=14,s1=H-14,sm=d=>s0+(s1-s0)*d/1100;
    ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(sx,s0,8,s1-s0);
    ctx.fillStyle='#ff8a7a';ctx.fillRect(sx-2,sm(600),12,2);ctx.fillStyle='#ffd666';ctx.fillRect(sx-2,sm(REKORD),12,2);
    ctx.fillStyle='#6fe0a0';ctx.fillRect(sx,s0,8,sm(depth)-s0);
    // лодка: 7 отсеков, вода в отсеке поднимается снизу вверх
    const L=Math.min(W*0.74,560),sq=1-0.08*t,Bh=Math.max(34,L*0.15)*sq;
    let bx=W*0.54-L/2,by=cy-Bh/2;
    if(shake){bx+=(rnd()-0.5)*4;by+=(rnd()-0.5)*3;}
    const r=Bh/2;
    function korpus(){ctx.beginPath();ctx.moveTo(bx+r,by);ctx.lineTo(bx+L-r*1.6,by);ctx.quadraticCurveTo(bx+L,by,bx+L,by+r);
      ctx.quadraticCurveTo(bx+L,by+Bh,bx+L-r*1.6,by+Bh);ctx.lineTo(bx+r,by+Bh);ctx.arc(bx+r,by+r,r,Math.PI/2,Math.PI*1.5);ctx.closePath();}
    ctx.fillStyle='#5d6b78';ctx.fillRect(bx+L*0.3,by-Bh*0.42,L*0.14,Bh*0.46);           // рубка
    ctx.beginPath();ctx.moveTo(bx-6,by+r);ctx.lineTo(bx-18,by-4);ctx.lineTo(bx-18,by+Bh+4);ctx.closePath();ctx.fill(); // кормовое оперение
    ctx.save();korpus();ctx.fillStyle=flash>0||ph==='avaria'?'#8a2a24':'#aab6c2';ctx.fill();ctx.clip();
    const cw=L/OTSEKOV;
    for(let i=0;i<OTSEKOV;i++){
      const x=bx+L-(i+1)*cw,l=Math.min(100,levels[i]);          // 1-й отсек — нос (справа)
      if(l>0){const hgt=Bh*l/100,blink=l>=60&&(performance.now()/250|0)%2;
        ctx.fillStyle=l>=60?(blink?'rgba(255,70,60,.95)':'rgba(255,120,100,.85)'):'rgba(255,200,90,.85)';ctx.fillRect(x,by+Bh-hgt,cw,hgt);}
      ctx.strokeStyle='rgba(20,30,40,.55)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,by);ctx.lineTo(x,by+Bh);ctx.stroke();
      ctx.fillStyle=l>=60?'#fff':'#1a2430';ctx.font='700 '+Math.round(Math.min(16,Bh*0.42))+'px Inter,system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(String(i+1),x+cw/2,by+Bh/2);
    }
    ctx.restore();
    korpus();ctx.strokeStyle='#e8eef5';ctx.lineWidth=1.5;ctx.stroke();
    for(let i=0;i<OTSEKOV;i++){const l=levels[i];if(l<=0)continue;const x=bx+L-(i+0.5)*cw;
      ctx.fillStyle=l>=60?'#ff8a7a':'#ffcf7a';ctx.font='800 '+(l>=60?18:15)+'px Inter,system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
      ctx.fillText(l>=60?'ТЕЧЬ!':'трещит',x,by-Bh*0.5);}
    if(torpT>0){ctx.fillStyle='#ffd666';ctx.fillRect(bx+L+8+(1.6-torpT)*W*0.4,cy-2,30,4);}
    // прибор давления
    const R=Math.min(32,W*0.08),px=W-R-10,py=R+12;
    ctx.fillStyle='rgba(6,12,23,.75)';ctx.beginPath();ctx.arc(px,py,R+4,0,7);ctx.fill();
    ctx.strokeStyle='#c9a84c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,R,Math.PI*0.75,Math.PI*2.25);ctx.stroke();
    const a=Math.PI*0.75+Math.PI*1.5*Math.min(1,depth/1100);
    ctx.strokeStyle=depth>=700?'#ff8a7a':'#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(a)*R*0.85,py+Math.sin(a)*R*0.85);ctx.stroke();
    ctx.fillStyle='#e4c97a';ctx.font='700 10px Inter,system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('атм',px,py+R*0.35);
    if(flash>0){ctx.fillStyle='rgba(255,40,30,'+(0.35*flash)+')';ctx.fillRect(0,0,W,H);}
  }

  let last=0;
  function loop(ts){
    const dt=last?Math.min((ts-last)/1000,0.05):0;last=ts;
    if(ph!=='final'&&ph!=='avaria'&&ph!=='vremya'&&ph!=='start')step(dt);
    else if(flash>0)flash-=dt;
    draw();requestAnimationFrame(loop);
  }

  bMalo.addEventListener('click',()=>dat('malo'));
  bPolno.addEventListener('click',()=>dat('polno'));
  bStop.addEventListener('click',stop);
  bTorp.addEventListener('click',strelyat);
  again.addEventListener('click',()=>{otklik();reset();root.scrollIntoView({behavior:'smooth',block:'start'});});
  window.addEventListener('resize',resize);
  resize();reset();requestAnimationFrame(loop);
  // для браузерной проверки
  window.__k278={get ph(){return ph;},get depth(){return depth;},get levels(){return levels.slice();},get vremya(){return vremya;},get torpeda(){return torpeda;}};
})();
