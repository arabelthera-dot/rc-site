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

/* Игра «Гидроудар: не порви водопровод» (17 января, Жуковский), r416c, Р302/Р304. Игрок — смотритель московского
   водопровода: шесть вызовов «перекройте трубу», у каждой трубы своя длина. Палец крутит колесо задвижки
   (2 оборота — закрыта; скорость поворота = скорость закрытия). Давление у задвижки — прирост закрытия
   за время пробега волны туда и обратно (2L/a): p(x,t) = c(t−x·T/2) − c(t−T+x·T/2), отражение с обратным
   знаком от открытого конца. p ≥ 1 у задвижки — труба лопается фонтаном, район гаснет. Время на вызов
   ограничено — медленно тоже нельзя. После двух лопнувших труб — подсказка «как Жуковский»: путь волны
   туда-обратно виден под трубой. Факт — «Родина», 16.03.2014 (утверждён Р297). */
(function(){
  const root=document.querySelector('[data-gidroudar-igra]');if(!root)return;
  const cv=root.querySelector('canvas'),ctx=cv.getContext('2d');
  const $=s=>root.querySelector(s);
  const elC=$('.gu-c'),elP=$('.gu-p'),elPb=$('.gu-pbar i'),elT=$('.gu-t'),elTask=$('.gu-task'),elSub=$('.gu-sub'),elR=$('.gu-rayony');
  const bStart=$('.gu-start'),fin=$('.gu-finale'),finH=$('.gu-fin-h'),finT=$('.gu-fin-txt'),again=$('.gu-again');
  // T — время пробега волны туда и обратно, с; dl — доля ширины схемы под трубу
  const VYZOVY=[{n:'Арбат',T:0.7,dl:0.42},{n:'Пресня',T:1.0,dl:0.55},{n:'Хамовники',T:1.3,dl:0.66},{n:'Сокольники',T:1.7,dl:0.78},{n:'Замоскворечье',T:2.1,dl:0.88},{n:'Лефортово',T:2.5,dl:0.97}];
  const OBOROTY=2,LIMIT=k=>VYZOVY[k].T*4+5;
  const ruka=igraRuka(root);
  let W,H,dpr,st,raf=0,tPrev=0;
  function razmer(){const w=cv.clientWidth||320;dpr=Math.min(2,window.devicePixelRatio||1);W=w;H=Math.round(Math.min(340,Math.max(230,w*0.62)));cv.style.height=H+'px';cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);risuy();}
  function noviy(){st={k:-1,faza:'start',c:0,ist:[],t:0,lim:0,ug:null,lopnulo:0,opozdal:0,itog:[],bryzgi:[],zhuk:false,konec:false,pmax:0};
    elR.innerHTML=VYZOVY.map(v=>'<li>'+v.n+'</li>').join('');fin.hidden=true;bStart.hidden=false;elT.textContent='—';elC.textContent='открыта';pokazP(0);
    zadacha('Нажми «Начать смену»','');ruka.na(bStart);}
  function zadacha(a,b){elTask.innerHTML='<b>Что сделать сейчас:</b> '+a;elSub.textContent=b;}
  function sled(){st.k++;if(st.k>=VYZOVY.length)return konec();const v=VYZOVY[st.k];
    st.c=0;st.ist=[[st.t,0]];st.t0=st.t;st.lim=LIMIT(st.k);st.faza='igra';st.pmax=0;st.bryzgi=[];
    elR.children[st.k].className='gu-zov';
    zadacha('Крути колесо задвижки — '+v.n+' просит перекрыть трубу','Труба '+(['короткая','недлинная','средняя','длинная','очень длинная','самая длинная'][st.k])+': волна бежит туда и обратно '+v.T.toFixed(1).replace('.',',')+' с.');}
  // закрытие в момент t (история)
  function cAt(t){const a=st.ist;if(t<=a[0][0])return 0;for(let i=a.length-1;i>=0;i--)if(a[i][0]<=t)return a[i][1];return 0;}
  function davl(x){const T=VYZOVY[st.k].T;return Math.max(0,cAt(st.t-x*T/2)-cAt(st.t-T+x*T/2))/0.5;}
  function pokazP(p){elPb.style.width=Math.min(100,p*100)+'%';elPb.className=p>=0.75?'gu-krasn':p>=0.45?'gu-zhelt':'';elP.textContent=p>=1?'РАЗРЫВ':p>=0.75?'опасно!':p>=0.45?'растёт':'норма';}
  function itogVyzova(lop,pozdno){const li=elR.children[st.k];st.faza='pauza';st.ug=null;
    if(lop){st.lopnulo++;li.className='gu-bez';if(navigator.vibrate)try{navigator.vibrate([60,40,120]);}catch(_){}
      for(let i=0;i<46;i++)st.bryzgi.push({x:0,y:0,vx:(Math.random()-0.5)*90,vy:-90-Math.random()*170,zh:1});
      if(st.lopnulo===2)st.zhuk=true;
      zadacha('Труба лопнула — '+VYZOVY[st.k].n+' без воды',st.zhuk?'Как Жуковский: смотри под трубу — волна бежит до района и обратно. Пока она не вернулась, закрывай понемногу.':'Задвижку закрыли слишком резко: волна давления порвала трубу.');}
    else if(pozdno){st.opozdal++;li.className='gu-bez';zadacha('Не успел — '+VYZOVY[st.k].n+' без воды','Слишком медленно: у вызова своё время. Длинную трубу закрывай плавно, но не останавливайся.');}
    else{li.className='gu-ok';zadacha(VYZOVY[st.k].n+': труба перекрыта целой','Наибольшее давление — '+Math.round(st.pmax*100)+' % от разрыва.');}
    setTimeout(()=>{if(!st.konec)sled();},lop?2200:1500);}
  function konec(){st.konec=true;st.faza='konec';ruka.ubrat();const bez=st.lopnulo+st.opozdal;
    finH.textContent='Районов без воды: '+bez+' из 6 · у Жуковского — 0';
    finT.textContent=bez===0?'Ни одной лопнувшей трубы — ты закрывал задвижки, как учил Жуковский: медленнее, чем волна сбегает до конца трубы и обратно.':'Лопнуло труб: '+st.lopnulo+', не успел: '+st.opozdal+'. Правило Жуковского: чем длиннее труба, тем дольше закрывать задвижку.';
    fin.hidden=false;zadacha('Смена окончена','');
    if(typeof window.award==='function'){window.award('gidro',30);if(bez===0)window.award('zhuk',20);}}
  // колесо задвижки
  function centr(){return {x:W*0.12+18,y:H*0.5};}
  function ugol(e){const r=cv.getBoundingClientRect(),c=centr();return Math.atan2(e.clientY-r.top-c.y,e.clientX-r.left-c.x);}
  cv.addEventListener('pointerdown',e=>{if(st.faza!=='igra')return;st.ug=ugol(e);try{cv.setPointerCapture(e.pointerId);}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(st.ug===null||st.faza!=='igra')return;const a=ugol(e);let d=a-st.ug;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;st.ug=a;if(d>0)krutit(d/(2*Math.PI*OBOROTY));});
  const otp=()=>{st.ug=null;};cv.addEventListener('pointerup',otp);cv.addEventListener('pointercancel',otp);
  cv.tabIndex=0;cv.addEventListener('keydown',e=>{if(st.faza!=='igra')return;if(e.key==='ArrowRight'||e.key==='ArrowDown'){krutit(0.03);e.preventDefault();}});
  function krutit(dc){if(st.c>=1)return;st.c=Math.min(1,st.c+dc);st.ist.push([st.t,st.c]);}
  bStart.addEventListener('click',()=>{bStart.hidden=true;ruka.ubrat();sled();});
  again.addEventListener('click',()=>{noviy();});
  function shag(ts){raf=requestAnimationFrame(shag);const dt=Math.min(0.05,tPrev?(ts-tPrev)/1000:0);tPrev=ts;st.t+=dt;
    if(st.faza==='igra'){const v=VYZOVY[st.k],p=davl(0);st.pmax=Math.max(st.pmax,p);pokazP(p);
      const ost=st.lim-(st.t-st.t0);elT.textContent=Math.max(0,ost).toFixed(1).replace('.',',')+' с';elC.textContent=Math.round(st.c*100)+' %';
      if(st.ist.length>400)st.ist.splice(1,st.ist.length-400);
      if(p>=1)itogVyzova(true,false);else if(st.c>=1&&st.t-st.ist[st.ist.length-1][0]>v.T)itogVyzova(false,false);else if(ost<=0)itogVyzova(false,true);}
    for(const b of st.bryzgi){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=260*dt;b.zh-=dt*0.5;}
    risuy();}
  function risuy(){if(!st||!W)return;ctx.clearRect(0,0,W,H);
    // небо и земля
    ctx.fillStyle='#0d1a2a';ctx.fillRect(0,0,W,H);ctx.fillStyle='#2a2117';ctx.fillRect(0,H*0.5+22,W,H);
    const k=Math.max(0,st.k),v=VYZOVY[Math.min(k,VYZOVY.length-1)],c=centr(),x0=c.x+26,x1=Math.min(W-34,x0+(W-x0-40)*v.dl),y=c.y;
    // насосная
    ctx.fillStyle='#4a5a6c';ctx.fillRect(4,y-46,c.x-22,64);ctx.fillStyle='#e9cf7e';ctx.font='600 10px system-ui,sans-serif';ctx.fillText('Насосная',6,y-52);
    // дома района
    const tem=st.k>=0&&elR.children[st.k]&&elR.children[st.k].className==='gu-bez';
    for(let i=0;i<3;i++){const hx=x1+4+i*10,hh=26+i%2*12;ctx.fillStyle='#3b4756';ctx.fillRect(hx,y-hh,12,hh+10);ctx.fillStyle=tem?'#202830':'#f5d36a';ctx.fillRect(hx+3,y-hh+5,4,4);ctx.fillRect(hx+3,y-hh+14,4,4);}
    ctx.fillStyle='#fff';ctx.font='600 12px system-ui,sans-serif';ctx.textAlign='right';ctx.fillText(st.k>=0?v.n:'',W-6,y-50);ctx.textAlign='left';
    // труба с волной: толщина и цвет по давлению
    const N=60,lop=st.faza==='pauza'&&st.lopnulo&&elR.children[st.k]&&elR.children[st.k].className==='gu-bez'&&st.bryzgi.length;
    for(let i=0;i<N;i++){const x=i/N,p=st.faza==='igra'?davl(x):0,xa=x0+(x1-x0)*x,w=(x1-x0)/N+1,t=9+p*9;
      ctx.fillStyle=p>=0.75?'#e0473a':p>=0.45?'#e4a33a':'#7f95ab';ctx.fillRect(xa,y-t/2,w,t);}
    // вода в трубе (поток)
    if(st.faza==='igra'){ctx.fillStyle='rgba(120,200,255,'+(0.6*(1-st.c))+')';const sh=(st.t*60*(1-st.c))%18;for(let xa=x0+sh;xa<x1;xa+=18)ctx.fillRect(xa,y-1.5,7,3);}
    // путь волны «как Жуковский»
    if(st.zhuk&&st.faza==='igra'){const T=v.T,f=((st.t-st.t0)%T)/T,xx=f<0.5?f*2:2-f*2;ctx.strokeStyle='#e9cf7e';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x0,y+24);ctx.lineTo(x1,y+24);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#e9cf7e';ctx.beginPath();ctx.arc(x0+(x1-x0)*xx,y+24,5,0,7);ctx.fill();ctx.font='11px system-ui,sans-serif';ctx.fillText('волна туда и обратно: '+T.toFixed(1).replace('.',',')+' с — крути медленнее',x0,y+42);}
    // фонтан
    if(lop){ctx.fillStyle='rgba(140,210,255,.85)';for(const b of st.bryzgi)if(b.zh>0){ctx.globalAlpha=Math.max(0,b.zh);ctx.beginPath();ctx.arc(x0+8+b.x,y+b.y,2.6,0,7);ctx.fill();}ctx.globalAlpha=1;
      ctx.fillStyle='#e0473a';ctx.font='800 16px system-ui,sans-serif';ctx.fillText('ГИДРОУДАР!',x0+10,y-30);}
    // колесо задвижки
    const a=st.c*OBOROTY*2*Math.PI;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(a);ctx.strokeStyle='#d4502f';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,22,0,7);ctx.stroke();
    for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(22,0);ctx.stroke();}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(19,0,4,0,7);ctx.fill();ctx.restore();
    if(st.faza==='igra'&&st.c===0){ctx.fillStyle='#fff';ctx.font='600 11px system-ui,sans-serif';ctx.fillText('↻ крути по кругу',c.x-30,c.y+44);}}
  noviy();window.addEventListener('resize',razmer);razmer();raf=requestAnimationFrame(shag);
})();
