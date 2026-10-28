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

/* Игра «Причаль вручную» (16 января 1969, «Союз-4» и «Союз-5»), r320, Р293. Игрок — Шаталов в «Амуре».
   Палец тянет уплывающий «Байкал» в круг перекрестья (снос идёт всё время, каждое движение — топливо),
   «Тяга»/«Тормоз» — ±0,1 м/с к скорости сближения (тоже топливо). На 30 м — развилка: внизу Африка,
   телесвязи нет; стыковаться сразу или висеть и ждать эфира, пока тает топливо (интервью Б. В. Волынова,
   Роскосмос, 2019). Касание: быстрее 0,3 м/с — удар; вне круга — перекос; топливо 0 — разошлись.
   Время в игре ускорено (TS), снос и расход подобраны так, чтобы наугад не выиграть. */
(function(){
  const root=document.querySelector('[data-prichal-igra]');if(!root)return;
  const cv=root.querySelector('canvas'),ctx=cv.getContext('2d');
  const $=s=>root.querySelector(s);
  const elD=$('.sp-d'),elV=$('.sp-v'),elF=$('.sp-f'),elFb=$('.sp-fbar i'),elTv=$('.sp-tv'),elTask=$('.sp-task'),elSub=$('.sp-sub');
  const bTyaga=$('.sp-tyaga'),bTormoz=$('.sp-tormoz'),hod=$('.sp-hod'),vybor=$('.sp-vybor'),bSeychas=$('.sp-seychas'),bZhdat=$('.sp-zhdat');
  const fin=$('.sp-finale'),finH=$('.sp-fin-h'),finT=$('.sp-fin-txt'),finZ=$('.sp-zvezdy'),again=$('.sp-again'),finP=$('.sp-propusk'),elVb=$('.sp-vbar i');
  const START=+(root.dataset.start||100),TS=10,DOPUSK=0.3,UDAR=0.3,MYAGKO=0.2,TV_SEK=8;
  const ruka=igraRuka(root);
  let S,W,H,dpr,st,raf=0,tPrev=0,zvezdy=[];
  function otklik(){try{if(navigator.vibrate)navigator.vibrate(20);}catch(e){/* нет вибро */}}
  let ac=null;
  function zvuk(){if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){ac=false;}}}
  function pisk(hz){if(!ac)return;try{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=hz;g.gain.setValueAtTime(0.06,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.09);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+0.1);}catch(e){/* звука нет */}}
  root.addEventListener('pointerdown',zvuk);
  for(let i=0;i<70;i++)zvezdy.push([Math.random(),Math.random()*0.72,Math.random()*1.3+0.3]);
  function razmer(){dpr=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);S=W*0.3;}
  function novSnos(){const a=Math.random()*Math.PI*2,m=0.09+Math.random()*0.07;st.sx=Math.cos(a)*m;st.sy=Math.sin(a)*m;st.tSnos=2+Math.random()*1.5;}
  function nachat(){
    st={d:START,v:START>60?0.9:0.6,ox:0.32,oy:-0.2,f:START>60?100:72,faza:'idu',razvilka:false,tormozi:false,zhdal:false,tv:false,tvT:0,palec:false,pervyy:true,konec:false,anim:0,zem:0,pik:0,tvAnim:0,otT:0};
    novSnos();fin.hidden=true;hod.hidden=false;vybor.hidden=true;root.classList.remove('sp-proigr','sp-pobeda','sp-tormozi');finP.hidden=true;
    zadacha('Веди пальцем по иллюминатору',START>60?'Сто метров — дальше вручную, как в 1969-м. «Байкал» уплывает: тяни его в зелёный круг. Скорость — кнопками.':'«Байкал» уплывает — тяни его обратно в зелёный круг. Скорость сближения — кнопками.');
    ruka.na(cv);tPrev=0;cancelAnimationFrame(raf);raf=requestAnimationFrame(shag);
  }
  function zadacha(a,b,sila){if(st&&st.tormozi&&!sila){st.zadPrezh=['<b>Что сделать сейчас:</b> '+a,b||''];return;}elTask.innerHTML='<b>Что сделать сейчас:</b> '+a;elSub.textContent=b||'';}
  function chislo(x,n){return x.toFixed(n).replace('.',',').replace('-','−');}
  function tablo(){
    elD.textContent=chislo(Math.max(st.d,0),st.d<10?1:0)+' м';
    elV.textContent=chislo(st.v,1)+' м/с';elV.classList.toggle('sp-krasn',st.v>UDAR||st.v<0);
    if(elVb){elVb.style.width=Math.min(100,Math.max(0,st.v)*100)+'%';elVb.className=st.v>UDAR||st.v<0?'sp-vk':(st.v>MYAGKO?'sp-vzh':'sp-vz');}
    elF.textContent=Math.max(0,Math.round(st.f))+' %';elFb.style.width=Math.max(0,st.f)+'%';elF.classList.toggle('sp-krasn',st.f<20);
    elTv.textContent=st.tv?'● Прямой эфир':(st.zhdal?'Телесвязь через '+Math.ceil(TV_SEK-st.tvT)+' с':'Телесвязи нет — внизу Африка');elTv.classList.toggle('sp-efir',st.tv);
  }
  function rashod(x){st.f-=x;if(st.f<=0&&!st.konec){st.f=0;proigrysh('Топливо кончилось','Двигатели молчат, корабли медленно расходятся. Шаталову в 1969-м тоже почти нечем было маневрировать: каждое движение нужно было беречь.');}}
  function knopka(dv){
    if(st.konec||st.faza==='vybor')return;otklik();
    st.v=Math.round((st.v+dv)*10)/10;rashod(3);
    if(st.pervyy){st.pervyy=false;ruka.ubrat();}
  }
  bTyaga.addEventListener('click',()=>knopka(0.1));
  bTormoz.addEventListener('click',()=>knopka(-0.1));
  let px=null,py=null;
  cv.addEventListener('pointerdown',e=>{if(st.konec)return;px=e.clientX;py=e.clientY;st.palec=true;try{cv.setPointerCapture(e.pointerId);}catch(_){}if(st.pervyy){st.pervyy=false;ruka.ubrat();}});
  cv.addEventListener('pointermove',e=>{if(px===null||st.konec||st.faza==='vybor')return;const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;st.ox+=dx/S;st.oy+=dy/S;rashod(Math.hypot(dx,dy)/S*5);});
  const otpustil=()=>{px=null;st.palec=false;};
  cv.addEventListener('pointerup',otpustil);cv.addEventListener('pointercancel',otpustil);
  bSeychas.addEventListener('click',()=>{otklik();st.faza='idu';vybor.hidden=true;hod.hidden=false;zadacha('Подведи «Байкал» до касания','Не быстрее 0,3 м/с и точно в круге. Страна этого не увидит — антенны над Африкой молчат.');});
  bZhdat.addEventListener('click',()=>{otklik();st.faza='idu';st.zhdal=true;vybor.hidden=true;hod.hidden=false;zadacha('Зависни: тормози до 0 и держи в круге','До телесвязи '+TV_SEK+' секунд. Висеть — значит жечь топливо на удержание. Хватит ли?');});
  again.addEventListener('click',()=>{otklik();nachat();root.scrollIntoView({block:'start',behavior:'smooth'});});
  function proigrysh(h,t){st.konec=true;root.classList.add('sp-proigr');konec(h,t,false);}
  function konec(h,t,pob){
    tormozi(false);hod.hidden=true;vybor.hidden=true;ruka.ubrat();finH.textContent=h;finT.textContent=t;
    const z=[[pob,'Состыковался'],[pob&&st.vKas<=MYAGKO+1e-9,'Очень мягко — 0,2 м/с или тише'],[pob&&st.tvKas,'Стыковку увидела вся страна']];
    const net=[];if(pob&&!(st.vKas<=MYAGKO+1e-9))net.push('«Очень мягко»: перед касанием сбрось скорость до 0,2 м/с или тише.');
    if(pob&&!st.tvKas)net.push('«Увидела вся страна»: на 30 метрах выбери «Ждать телесвязь» и береги топливо до эфира.');
    finP.textContent=net.length?(net.length>1?'Не хватило двух звёзд. ':'Не хватило звезды. ')+net.join(' '):'';finP.hidden=!net.length;
    finZ.innerHTML=z.map(x=>'<li class="'+(x[0]?'on':'')+'">'+(x[0]?'★':'☆')+' '+x[1]+'</li>').join('');
    zadacha(pob?'Стыковка!':'Не получилось — попробуй ещё раз',pob?'':'Подсказка: тормози заранее и держи «Байкал» в круге, не жди, пока уплывёт.');
    setTimeout(()=>{fin.hidden=false;},pob?2400:700);
  }
  function kasanie(){
    const r=Math.hypot(st.ox,st.oy);st.vKas=st.v;st.tvKas=st.tv;
    if(st.v>UDAR){st.konec=true;st.anim=-1;st.otT=0.001;st.otVid='udar';root.classList.add('sp-proigr');otklik();konec('Удар! '+chislo(st.v,1)+' м/с, а нужно не быстрее 0,3','Корабли столкнулись и отскочили друг от друга. Безопасно касаться можно не быстрее 0,3 м/с: нажми «Тормоз» заранее, ещё до 10 метров.',false);return;}
    if(r>DOPUSK){st.konec=true;st.anim=-1;st.otT=0.001;st.otVid='perekos';root.classList.add('sp-proigr');konec('Перекос — штырь мимо конуса','«Байкал» был не в круге, и штырь «Амура» ударил в край приёмного конуса. Последние метры держи корабль пальцем точно в перекрестье.',false);return;}
    st.konec=true;st.anim=0.001;root.classList.add('sp-pobeda');
    zadacha('Захват.','');setTimeout(()=>zadacha('Захват. Касание…',''),800);setTimeout(()=>zadacha('Захват. Касание… Стыковка!',''),1600);
    konec('Захват. Касание… Стыковка!',st.tv?'Как 16 января 1969 года: Шаталов и Волынов дождались телесвязи над Африкой, и первую в мире стыковку двух пилотируемых кораблей увидела вся страна.':'Стыковка есть, но страна её не увидела: над Африкой антенн нет. В 1969-м командиры решили иначе — зависли в 30 метрах и ждали телесвязи, хотя топлива у Шаталова почти не осталось.',true);
  }
  function tormozi(on){ // правка дизайнера 1: на 15 м и ближе при скорости >0,3 — мигающее «Тормози!» и подсветка кнопки
    if(on===st.tormozi)return;st.tormozi=on;root.classList.toggle('sp-tormozi',on);bTormoz.classList.toggle('sp-podsvet',on);
    if(on){st.zadPrezh=[elTask.innerHTML,elSub.textContent];zadacha('Тормози!','Скорость '+chislo(st.v,1)+' м/с — так будет удар. Жми «Тормоз», пока не станет 0,3 или меньше.',true);}
    else if(st.zadPrezh&&!st.konec){elTask.innerHTML=st.zadPrezh[0];elSub.textContent=st.zadPrezh[1];}}
  function shag(t){
    raf=requestAnimationFrame(shag);
    const dt=tPrev?Math.min((t-tPrev)/1000,0.05):0;tPrev=t;
    if(!st.konec&&st.faza!=='vybor'&&dt>0){
      const sdt=dt*TS;st.d-=st.v*sdt;
      st.tSnos-=dt;if(st.tSnos<=0)novSnos();
      const k=st.d<8?1.4:1;st.ox+=st.sx*dt*k;st.oy+=st.sy*dt*k;
      st.ox=Math.max(-1.6,Math.min(1.6,st.ox));st.oy=Math.max(-1.3,Math.min(1.3,st.oy));
      rashod(dt*(st.zhdal&&!st.tv?1.6:0.7));
      if(st.zhdal&&!st.tv){st.tvT+=dt;if(st.tvT>=TV_SEK){st.tv=true;st.tvAnim=0.001;otklik();zadacha('Телесвязь есть — страна смотрит!','Теперь подводи: «Тяга», но касание не быстрее 0,3 м/с и точно в круге.');}
        else if(st.v>0.05&&st.d<28)elSub.textContent='Ты ползёшь к «Байкалу» — жми «Тормоз»! Эфира ещё нет.';
        else elSub.textContent='Висишь. Держи «Байкал» в круге — эфир вот-вот.';}
      st.zem+=dt*(st.zhdal&&!st.tv?0.11:0.05);
      if(st.d<10&&st.d>0){st.pik-=dt;if(st.pik<=0){pisk(st.d<3?1320:880);st.pik=0.25+st.d*0.08;}}
      if(!st.razvilka&&st.d<=30){st.razvilka=true;st.d=30;st.faza='vybor';hod.hidden=true;vybor.hidden=false;ruka.ubrat();
        zadacha('30 метров. Внизу Африка','Наши антенны вас не видят. Стыкуетесь сейчас — страна не увидит. Ждать телесвязь — топливо тает.');}
      if(st.d>START+15)proigrysh('Корабли разошлись','Ты дал задний ход и ушёл от «Байкала» слишком далеко. Догнать уже не хватит топлива.');
      tormozi(!st.konec&&st.faza==='idu'&&st.d<=15&&st.d>0&&st.v>UDAR);
      if(st.d<=0&&!st.konec){st.d=0;tormozi(false);kasanie();}
      if(!st.konec&&st.faza==='idu'&&!st.pervyy&&!st.zhdal&&!st.tv&&st.razvilka===false&&Math.hypot(st.ox,st.oy)>DOPUSK)elSub.textContent='«Байкал» вне круга — веди пальцем к перекрестью.';
    }
    if(st.anim>0)st.anim+=dt;if(st.otT>0)st.otT+=dt;if(st.tvAnim>0)st.tvAnim+=dt;
    tablo();risuy();
  }
  const PI2=Math.PI*2;
  function fon(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#02040a');g.addColorStop(1,'#0a1430');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff';zvezdy.forEach(z=>{ctx.globalAlpha=0.5;ctx.fillRect(z[0]*W,z[1]*H,z[2],z[2]);});ctx.globalAlpha=1;}
  function zemlya(){ // Земля не перекрашивается: суша плывёт по st.zem — Африка уезжает влево, справа въезжает Родина
    const cx=W/2,R=W*1.6,ey=H+R-H*0.2,sd=-st.zem*W*0.7;ctx.save();ctx.beginPath();ctx.arc(cx,ey,R,0,PI2);
    const g=ctx.createLinearGradient(0,H*0.8,0,H);g.addColorStop(0,'#2a72bd');g.addColorStop(1,'#123f75');ctx.fillStyle=g;ctx.fill();ctx.clip();
    const el=(x,y,a,b,u,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,a,b,u,0,PI2);ctx.fill();};
    const ax=cx-W*0.12+sd; // Африка
    el(ax,H*0.9,W*0.2,H*0.07,0.15,'#c2a060');el(ax+W*0.07,H*0.97,W*0.1,H*0.08,0.5,'#b8924f');el(ax-W*0.05,H*0.89,W*0.08,H*0.025,0.1,'#d4b77a');
    const gx=cx+W*1.25+sd; // зелёная суша
    el(gx,H*0.91,W*0.24,H*0.06,-0.1,'#3f7d4a');el(gx+W*0.13,H*0.96,W*0.16,H*0.07,0.3,'#3f7d4a');el(gx-W*0.16,H*0.95,W*0.1,H*0.05,0.6,'#4b8a52');el(gx+W*0.02,H*0.93,W*0.09,H*0.025,0,'#2f6a3c');
    for(let i=0;i<4;i++){const x=((i*0.47-st.zem*0.9)%1.8+1.8)%1.8*W-W*0.3;el(x,H*(0.86+i%2*0.05),W*0.16,H*0.018,-0.1,'rgba(255,255,255,.38)');}
    ctx.restore();ctx.strokeStyle='rgba(120,190,255,.6)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,ey,R+2,Math.PI*1.2,Math.PI*1.8);ctx.stroke();}
  function baikal(tx,ty,k,ug){ // «Байкал» анфас: орбитальный отсек, приёмный конус, панели батарей
    const r=k*0.9;ctx.save();ctx.translate(tx,ty);ctx.rotate(ug||0);
    ctx.fillStyle='#2a4f8f';ctx.strokeStyle='#9bb7e0';ctx.lineWidth=Math.max(1,k*0.02);
    for(const s of[-1,1]){const x0=s>0?r*1.15:-r*1.15-r*2.4;ctx.fillRect(x0,-r*0.42,r*2.4,r*0.84);ctx.strokeRect(x0,-r*0.42,r*2.4,r*0.84);
      ctx.beginPath();for(let i=1;i<6;i++){const x=s>0?r*1.15+r*0.4*i:-r*1.15-r*0.4*i;ctx.moveTo(x,-r*0.42);ctx.lineTo(x,r*0.42);}ctx.moveTo(s*r*1.15,0);ctx.lineTo(s*(r*1.15+r*2.4),0);ctx.stroke();
      ctx.fillStyle='#6e7a62';ctx.fillRect(s>0?r*0.85:-r*1.15,-r*0.06,r*0.3,r*0.12);ctx.fillStyle='#2a4f8f';}
    const g=ctx.createRadialGradient(-r*0.35,-r*0.35,r*0.1,0,0,r);g.addColorStop(0,'#b4c29e');g.addColorStop(1,'#66735a');
    ctx.beginPath();ctx.arc(0,0,r,0,PI2);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#c8d2b4';ctx.stroke();
    // приёмный конус: кольца сужаются к гнезду, рёбра сходятся в центр
    const kg=ctx.createRadialGradient(0,0,r*0.05,0,0,r*0.48);kg.addColorStop(0,'#050605');kg.addColorStop(0.35,'#1d201d');kg.addColorStop(1,'#4a504a');
    ctx.beginPath();ctx.arc(0,0,r*0.48,0,PI2);ctx.fillStyle=kg;ctx.fill();ctx.strokeStyle='#d8dccf';ctx.lineWidth=Math.max(1,k*0.025);ctx.stroke();
    ctx.strokeStyle='rgba(200,210,190,.35)';ctx.lineWidth=Math.max(0.6,k*0.008);ctx.beginPath();
    for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.moveTo(Math.cos(a)*r*0.47,Math.sin(a)*r*0.47);ctx.lineTo(Math.cos(a)*r*0.08,Math.sin(a)*r*0.08);}
    ctx.moveTo(r*0.3,0);ctx.arc(0,0,r*0.3,0,PI2);ctx.moveTo(r*0.17,0);ctx.arc(0,0,r*0.17,0,PI2);ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,r*0.07,0,PI2);ctx.fillStyle='#000';ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1.5,k*0.025);ctx.beginPath();ctx.moveTo(r*0.6,-r*0.8);ctx.lineTo(r*0.6,-r*0.6);ctx.moveTo(r*0.5,-r*0.7);ctx.lineTo(r*0.7,-r*0.7);ctx.stroke();
    ctx.restore();}
  function shtyr(x,y,w){ // штырь «Амура»: выдвигается снизу кадра, кончик идёт в гнездо конуса
    const bx=W/2,by=H+8,g=ctx.createLinearGradient(bx-w,0,bx+w,0);g.addColorStop(0,'#5d636b');g.addColorStop(0.45,'#e9edf2');g.addColorStop(1,'#6b7179');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(bx-w,by);ctx.lineTo(x-w*0.3,y);ctx.lineTo(x+w*0.3,y);ctx.lineTo(bx+w,by);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.stroke();
    ctx.beginPath();ctx.arc(x,y,w*0.5,0,PI2);ctx.fillStyle='#f2f4f7';ctx.fill();ctx.strokeStyle='#6b7179';ctx.stroke();
    ctx.fillStyle='#3a3f46';ctx.fillRect(bx-w*1.5,by-w*0.6,w*3,w*0.6);}
  function soyuz(u){ // «Союз» сбоку, нос вправо в точке 0: орбитальный отсек-шар, спускаемый-«фара», приборный цилиндр, панели
    ctx.save();ctx.scale(u,u);ctx.lineWidth=0.04;
    for(const s of[-1,1]){ctx.fillStyle='#2a4f8f';ctx.strokeStyle='#9bb7e0';const y0=s>0?1.5:-4.2;ctx.fillRect(-5.5,y0,1.2,2.7);ctx.strokeRect(-5.5,y0,1.2,2.7);
      ctx.beginPath();for(let i=1;i<6;i++){ctx.moveTo(-5.5,y0+i*0.45);ctx.lineTo(-4.3,y0+i*0.45);}ctx.moveTo(-4.9,y0);ctx.lineTo(-4.9,y0+2.7);ctx.stroke();
      ctx.strokeStyle='#aab';ctx.beginPath();ctx.moveTo(-4.9,s*1.2);ctx.lineTo(-4.9,s*1.5);ctx.stroke();}
    let g=ctx.createLinearGradient(0,-1.3,0,1.3);g.addColorStop(0,'#e2e5da');g.addColorStop(1,'#7c8276');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-3.7,-1);ctx.lineTo(-6,-1.3);ctx.lineTo(-6,1.3);ctx.lineTo(-3.7,1);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.moveTo(-4.3,-1.08);ctx.lineTo(-4.3,1.08);ctx.moveTo(-5.6,-1.25);ctx.lineTo(-5.6,1.25);ctx.stroke();
    ctx.fillStyle='#2b2e33';ctx.beginPath();ctx.moveTo(-6,-0.4);ctx.lineTo(-6.4,-0.55);ctx.lineTo(-6.4,0.55);ctx.lineTo(-6,0.4);ctx.fill();
    g=ctx.createLinearGradient(0,-1.1,0,1.1);g.addColorStop(0,'#a9b593');g.addColorStop(1,'#545d48');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-2.05,0);ctx.bezierCurveTo(-2.05,-0.65,-2.6,-1.1,-3.7,-1.1);ctx.lineTo(-3.7,1.1);ctx.bezierCurveTo(-2.6,1.1,-2.05,0.65,-2.05,0);ctx.fill();
    ctx.fillStyle='#3b2f22';ctx.fillRect(-3.78,-1.1,0.12,2.2);
    ctx.fillStyle='#1a2a3a';ctx.beginPath();ctx.arc(-2.7,-0.35,0.14,0,PI2);ctx.fill();
    g=ctx.createRadialGradient(-1.45,-0.35,0.1,-1.15,0,1);g.addColorStop(0,'#c4d0ae');g.addColorStop(1,'#5e6a50');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(-1.15,0,1,0,PI2);ctx.fill();
    ctx.fillStyle='#1a2a3a';ctx.beginPath();ctx.arc(-0.9,0.45,0.12,0,PI2);ctx.fill();
    ctx.strokeStyle='#cfd3c8';ctx.lineWidth=0.05;ctx.beginPath();ctx.moveTo(-1.3,-0.98);ctx.lineTo(-0.7,-1.8);ctx.moveTo(-1.7,0.85);ctx.lineTo(-2.2,1.6);ctx.stroke();
    ctx.fillStyle='#4a4f56';ctx.fillRect(-0.25,-0.38,0.27,0.76);
    ctx.restore();}
  function vidSboku(a){ // «отъезд камеры»: масштаб 2,5 → 1, два корабля носами над Землёй
    const t=Math.min(1,(a-1.6)/2.2),e=1-Math.pow(1-t,3),m=2.5-1.5*e,u=W*0.82/12.8*m,cx=W/2,cy=H*0.42;
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-0.07);soyuz(u);ctx.scale(-1,1);soyuz(u);ctx.restore();
    const sv=Math.max(0,1-(a-1.6)*2.5);
    if(sv>0){const g=ctx.createRadialGradient(cx,cy,0,cx,cy,u*3);g.addColorStop(0,'rgba(255,240,190,'+sv+')');g.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
    const na=Math.max(0,Math.min(1,(1.5-m)*2));
    if(na>0){ctx.globalAlpha=na;ctx.font='600 12px system-ui,sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.shadowColor='#000';ctx.shadowBlur=4;
      ctx.fillText('«Союз-4» «Амур»',cx-u*3.4,H-10);ctx.fillText('«Союз-5» «Байкал»',cx+u*3.4,H-10);ctx.shadowBlur=0;ctx.textAlign='left';ctx.globalAlpha=1;}}
  function shkala(){ // шкала дальности справа с бегущей меткой
    const x=W-14,y0=H*0.1,y1=H*0.72,top=START>30?Math.min(START,100):30,yb=START>30?y0+(y1-y0)*0.25:y0,
      yd=d=>{d=Math.min(Math.max(d,0),top);return d>30?y0+(top-d)/(top-30)*(yb-y0):yb+(1-d/30)*(y1-yb);};
    ctx.lineWidth=2;ctx.strokeStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,yd(10));ctx.stroke();
    ctx.strokeStyle='rgba(255,214,102,.8)';ctx.beginPath();ctx.moveTo(x,yd(10));ctx.lineTo(x,y1);ctx.stroke();
    ctx.font='600 10px system-ui,sans-serif';ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.8)';ctx.lineWidth=1.5;ctx.strokeStyle='rgba(255,255,255,.6)';
    (START>30?[top,70,30,20,10,5,0].filter((m,i,a)=>a.indexOf(m)===i&&m<=top):[30,20,10,5,0]).forEach(m=>{const y=yd(m);ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.stroke();ctx.fillText(m,x-8,y+3.5);});
    ctx.fillText('м',x+4,y0-8);
    const y=yd(st.d);ctx.fillStyle=st.d<10?'#ffd666':'#6fe0a0';ctx.beginPath();ctx.moveTo(x+3,y);ctx.lineTo(x+12,y-6);ctx.lineTo(x+12,y+6);ctx.closePath();ctx.fill();
    if(st.d>top){ctx.textAlign='center';ctx.fillText('↑',x+7,y0-16);}ctx.textAlign='left';}
  function vizir(cx,cy,now){ // перекрестье и круг допуска; последние 10 м — пульс
    const vKr=Math.hypot(st.ox,st.oy)<=DOPUSK,c=vKr?'111,224,160':'255,106,90';
    if(st.d<10&&!st.konec){const p=0.5+0.5*Math.sin(now*PI2*(1.2+(10-st.d)*0.25));ctx.strokeStyle='rgba('+c+','+(0.15+p*0.55)+')';ctx.lineWidth=2+p*5;ctx.beginPath();ctx.arc(cx,cy,DOPUSK*S+3+p*7,0,PI2);ctx.stroke();}
    ctx.strokeStyle='rgb('+c+')';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(cx,cy,DOPUSK*S,0,PI2);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=1.5;ctx.beginPath();
    ctx.moveTo(cx-W*0.42,cy);ctx.lineTo(cx-DOPUSK*S-6,cy);ctx.moveTo(cx+DOPUSK*S+6,cy);ctx.lineTo(cx+W*0.38,cy);
    ctx.moveTo(cx,cy-H*0.42);ctx.lineTo(cx,cy-DOPUSK*S-6);ctx.moveTo(cx,cy+DOPUSK*S+6);ctx.lineTo(cx,cy+H*0.4);ctx.stroke();return vKr;}
  function tvEkran(){ // эфир событием: «экран телевизора 1969 года» на 1,6 с
    const t=st.tvAnim,a=Math.min(1,t/0.2,(1.6-t)/0.3);if(a<=0)return;
    const ex=12,ey=12,ew=W-60,eh=H-34,rr=Math.min(34,eh*0.14);ctx.save();ctx.globalAlpha=a;
    ctx.save();ctx.beginPath();ctx.roundRect(ex,ey,ew,eh,rr);ctx.clip();
    ctx.globalCompositeOperation='saturation';ctx.fillStyle='#808080';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='rgba(160,185,190,.25)';ctx.fillRect(ex,ey,ew,eh);
    ctx.fillStyle='rgba(0,0,0,.25)';for(let y=ey;y<ey+eh;y+=3)ctx.fillRect(ex,y,ew,1);
    for(let i=0;i<3;i++){const yy=ey+((t*0.8+i*0.37)%1)*eh;ctx.fillStyle='rgba(255,255,255,'+(0.08+i*0.03)+')';ctx.fillRect(ex,yy,ew,8+i*7);}
    for(let i=0;i<40;i++){ctx.fillStyle='rgba(255,255,255,'+Math.random()*0.35+')';ctx.fillRect(ex+Math.random()*ew,ey+Math.random()*eh,2,1);}
    const vg=ctx.createRadialGradient(ex+ew/2,ey+eh/2,Math.min(ew,eh)*0.3,ex+ew/2,ey+eh/2,Math.max(ew,eh)*0.65);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.65)');ctx.fillStyle=vg;ctx.fillRect(ex,ey,ew,eh);
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(ex,ey+eh-52,ew,52);ctx.fillStyle='#fff';ctx.textAlign='center';
    ctx.font='700 16px system-ui,sans-serif';ctx.fillText('Прямой эфир.',ex+ew/2,ey+eh-30);ctx.font='500 14px system-ui,sans-serif';ctx.fillText('Стыковку видит вся страна',ex+ew/2,ey+eh-11);
    ctx.restore();
    const dg=ctx.createLinearGradient(0,0,W,H);dg.addColorStop(0,'#5a3b22');dg.addColorStop(0.5,'#7a5230');dg.addColorStop(1,'#3e2816');
    ctx.fillStyle=dg;ctx.beginPath();ctx.rect(0,0,W,H);ctx.roundRect(ex,ey,ew,eh,rr);ctx.fill('evenodd');
    ctx.strokeStyle='#1d140c';ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(ex,ey,ew,eh,rr);ctx.stroke();
    const kx=W-24;for(const ky of[H*0.22,H*0.42]){ctx.beginPath();ctx.arc(kx,ky,11,0,PI2);ctx.fillStyle='#d9d0bd';ctx.fill();ctx.strokeStyle='#2a1c10';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(kx,ky);ctx.lineTo(kx+Math.cos(t*3+ky)*9,ky+Math.sin(t*3+ky)*9);ctx.stroke();}
    ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=2;ctx.beginPath();for(let y=H*0.56;y<H*0.86;y+=6){ctx.moveTo(kx-10,y);ctx.lineTo(kx+10,y);}ctx.stroke();
    ctx.fillStyle='#e8d9b0';ctx.font='700 9px system-ui,sans-serif';ctx.fillText('РЕКОРД',ex+ew/2,H-8);ctx.textAlign='left';
    ctx.restore();}
  function risuy(){
    const cx=W/2,cy=H*0.46,now=performance.now()/1000;ctx.clearRect(0,0,W,H);fon();zemlya();
    if(st.anim>1.6){vidSboku(st.anim);return;}
    const dd=Math.max(st.d,0);let k=W*0.5*8/(dd+8),tx=cx+st.ox*S,ty=cy+st.oy*S,ug=0;
    const ot=st.otT;
    if(ot>0){const sg=st.ox<0?-1:1;
      if(st.otVid==='perekos'){tx+=sg*ot*W*0.55;ty-=ot*H*0.06;ug=sg*ot*1.6;k/=1+ot*0.7;}
      else{k/=1+ot*2.2;ug=ot*3.2;ty-=ot*H*0.05;}
      if(ot<0.35){tx+=Math.sin(now*60)*8*(1-ot/0.35);}}
    if(st.anim>0)k*=1+st.anim*0.08;
    baikal(tx,ty,k,ug);
    // последние 3 м — штырь «Амура» входит в конус
    if(dd<3||st.konec){const p=st.konec?1:1-dd/3,ex=ot>0?cx:tx,ey=ot>0?cy:ty,w=Math.max(6,k*0.1);shtyr(cx+(ex-cx)*p,H+8+(ey-H-8)*p,w);}
    if(st.anim>0){const a=st.anim;ctx.fillStyle='rgba(255,214,102,'+Math.max(0,0.55-a*0.6)+')';ctx.fillRect(0,0,W,H);
      for(let i=0;i<3;i++){const q=a*1.2-i*0.25;if(q<=0||q>1)continue;ctx.strokeStyle='rgba(255,240,190,'+(1-q)+')';ctx.lineWidth=6*(1-q)+1;ctx.beginPath();ctx.arc(tx,ty,q*W*0.7,0,PI2);ctx.stroke();}
      ctx.fillStyle='rgba(255,255,255,'+Math.max(0,1-a)+')';ctx.beginPath();ctx.arc(tx,ty,k*0.12,0,PI2);ctx.fill();}
    const vKr=vizir(cx,cy,now);shkala();
    if(!vKr&&!st.konec){ctx.strokeStyle='rgba(255,214,102,.9)';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(cx,cy);ctx.stroke();ctx.setLineDash([]);}
    if(ot>0)ctx.fillStyle='rgba(255,60,40,'+Math.max(0,0.45-ot*0.6)+')',ctx.fillRect(0,0,W,H);
    if(st.tv&&!(st.tvAnim>0&&st.tvAnim<1.6)){ctx.fillStyle='#ff4a4a';ctx.beginPath();ctx.arc(18,18,6,0,PI2);ctx.fill();ctx.fillStyle='#fff';ctx.font='700 13px system-ui,sans-serif';ctx.fillText('ЭФИР',30,23);}
    if(st.tormozi){const p=0.5+0.5*Math.sin(now*PI2*3);ctx.save();ctx.textAlign='center';ctx.font='800 '+Math.round(W*0.09)+'px system-ui,sans-serif';
      ctx.fillStyle='rgba(255,90,70,'+(0.35+p*0.65)+')';ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=4;ctx.strokeText('ТОРМОЗИ!',cx,H*0.2);ctx.fillText('ТОРМОЗИ!',cx,H*0.2);ctx.restore();}
    if(st.tvAnim>0&&st.tvAnim<1.6)tvEkran();
  }
  root.spSost=()=>st;
  window.addEventListener('resize',razmer);razmer();nachat();
})();
