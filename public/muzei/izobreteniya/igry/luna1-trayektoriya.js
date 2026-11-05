/* Игра 01-02 «Запусти „Луну-1“ к Луне» — скрипт как есть со страницы src/data/full-pages/izobreteniya/01-02.html (Р286);
   разметка — src/data/igry/izobreteniya/luna1-trayektoriya.html. Нужна глобальная award() (assets/museum-score.js). */
(function(){
  const cv=document.getElementById('luna1game');
  if(!cv)return;
  const ctx=cv.getContext('2d');
  // Физика считается в логическом поле 680×340 и НЕ зависит от ширины экрана:
  // один и тот же угол даёт один и тот же исход на телефоне и на десктопе.
  // Пиксели входят только в отрисовку — через масштаб S и сдвиг OX.
  const VW=680,VH=340;
  const EARTH={x:VW*.13,y:VH*.82,r:28};
  const MOON={x:VW*.82,y:VH*.2,r:18};
  const CORRIDOR=38; // радиус «коридора» попадания, логические единицы
  const MOON_HIT=20; // радиус прямого столкновения
  let S=1,OX=0;
  const tx=x=>OX+x*S, ty=y=>y*S;
  function layout(){
    const w=Math.round(cv.getBoundingClientRect().width)||VW;
    S=Math.max(.5,Math.min(1.25,w/VW));
    cv.width=w;cv.height=Math.round(VH*S);
    OX=(w-VW*S)/2;
  }
  const slider=document.getElementById('l1angle');
  const lbl=document.getElementById('l1angleLbl');
  const launchBtn=document.getElementById('l1launch');
  const rstBtn=document.getElementById('l1reset');
  const msg=document.getElementById('l1msg');
  let animId=null,launched=false,scored=false;
  // Звёзды заданы раз и навсегда в логическом поле — иначе мерцают каждый кадр
  const STARS=[];
  for(let i=0;i<80;i++)STARS.push({x:(i*137.5)%VW,y:(i*91.3)%VH,r:((i*37)%7)/10+.25,a:.25+((i*53)%50)/100});

  function drawStatic(){
    ctx.fillStyle='#040c1a';ctx.fillRect(0,0,cv.width,cv.height);
    STARS.forEach(s=>{ctx.beginPath();ctx.arc(tx(s.x),ty(s.y),s.r*S,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${s.a})`;ctx.fill();});
    // Земля
    ctx.beginPath();ctx.arc(tx(EARTH.x),ty(EARTH.y),EARTH.r*S,0,Math.PI*2);
    const eg=ctx.createRadialGradient(tx(EARTH.x)-8*S,ty(EARTH.y)-8*S,2,tx(EARTH.x),ty(EARTH.y),EARTH.r*S);
    eg.addColorStop(0,'#3a8ac4');eg.addColorStop(1,'#1a4a8a');
    ctx.fillStyle=eg;ctx.fill();
    ctx.strokeStyle='rgba(100,180,255,.3)';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.font=`bold ${Math.max(10,Math.round(12*S))}px Inter,sans-serif`;ctx.textAlign='center';
    ctx.fillText('Земля',tx(EARTH.x),ty(EARTH.y+EARTH.r+14));
    // Луна
    ctx.beginPath();ctx.arc(tx(MOON.x),ty(MOON.y),MOON.r*S,0,Math.PI*2);
    const mg=ctx.createRadialGradient(tx(MOON.x)-4*S,ty(MOON.y)-4*S,2,tx(MOON.x),ty(MOON.y),MOON.r*S);
    mg.addColorStop(0,'#aaaaaa');mg.addColorStop(1,'#555566');
    ctx.fillStyle=mg;ctx.fill();
    ctx.strokeStyle='rgba(200,200,200,.2)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillText('Луна',tx(MOON.x),ty(MOON.y+MOON.r+14));
    // Коридор
    ctx.beginPath();ctx.arc(tx(MOON.x),ty(MOON.y),CORRIDOR*S,0,Math.PI*2);
    ctx.strokeStyle='rgba(201,168,76,.25)';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);
    ctx.textAlign='left';
  }

  function getAngleRad(){return (90-parseInt(slider.value))*Math.PI/180;}

  function drawPreview(){
    drawStatic();
    const ang=getAngleRad(),len=180; // len в логических единицах
    ctx.beginPath();ctx.moveTo(tx(EARTH.x),ty(EARTH.y));
    ctx.lineTo(tx(EARTH.x+Math.cos(ang)*len),ty(EARTH.y-Math.sin(ang)*len));
    ctx.strokeStyle='rgba(201,168,76,.4)';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([]);
  }

  function simulate(angleDeg){
    // Параболическая траектория в логическом поле — ширина экрана сюда не входит
    const ang=(90-angleDeg)*Math.PI/180;
    const spd=3.8;
    let x=EARTH.x,y=EARTH.y;
    let vx=Math.cos(ang)*spd,vy=-Math.sin(ang)*spd;
    const result=[];
    for(let i=0;i<600;i++){
      const dx=VW*.5-x,dy=VH*.4-y,d=Math.sqrt(dx*dx+dy*dy);
      vx+=dx/d*.03;vy+=dy/d*.03;
      x+=vx;y+=vy;
      result.push({x,y});
      if(x<-50||x>VW+50||y<-50||y>VH+50)break;
    }
    return result;
  }

  function animateLaunch(angleDeg){
    const traj=simulate(angleDeg);
    let idx=0;
    let closest=Infinity;
    traj.forEach(p=>{const d=Math.sqrt((p.x-MOON.x)**2+(p.y-MOON.y)**2);if(d<closest)closest=d;});
    function frame(){
      drawStatic();
      ctx.beginPath();ctx.moveTo(tx(traj[0].x),ty(traj[0].y));
      for(let i=1;i<=Math.min(idx,traj.length-1);i++)ctx.lineTo(tx(traj[i].x),ty(traj[i].y));
      ctx.strokeStyle='rgba(201,168,76,.7)';ctx.lineWidth=2;ctx.stroke();
      if(idx<traj.length){const p=traj[idx];
        ctx.fillStyle='#e4c97a';ctx.beginPath();ctx.arc(tx(p.x),ty(p.y),5*S,0,Math.PI*2);ctx.fill();}
      idx+=5;
      if(idx<traj.length){animId=requestAnimationFrame(frame);}
      else{
        if(closest<=CORRIDOR&&closest>MOON_HIT){
          msg.textContent=`✅ Попал в коридор! Расстояние до Луны: ${Math.round(closest*30)} км. Именно так «Луна-1» пролетела в ~6000 км — и стала первым объектом в окрестностях Луны.`;
          msg.style.color='#7ed4a0';
          // Главная механика страницы участвует в счёте — один раз за посещение
          if(!scored&&typeof window.award==='function'){window.award('game',12);scored=true;}}
        else if(closest<=MOON_HIT){
          msg.textContent='💥 Попал прямо в Луну — столкновение. В реальности это было бы «Луна-2». Попробуй угол чуть больше.';
          msg.style.color='#f08080';}
        else{
          msg.textContent=`❌ Промахнулся — ракета прошла слишком далеко (${Math.round(closest*30)} км). Скорректируй угол и попробуй снова.`;
          msg.style.color='#f08080';}
        rstBtn.style.display='inline-block';}
    }
    frame();
  }

  slider.addEventListener('input',()=>{lbl.textContent=slider.value+'°';if(!launched)drawPreview();});
  launchBtn.addEventListener('click',()=>{
    if(launched)return;launched=true;launchBtn.style.display='none';
    animateLaunch(parseInt(slider.value));});
  rstBtn.addEventListener('click',()=>{
    if(animId)cancelAnimationFrame(animId);
    launched=false;msg.textContent='';
    launchBtn.style.display='inline-block';rstBtn.style.display='none';drawPreview();});
  addEventListener('resize',()=>{if(!launched){layout();drawPreview();}});
  layout();
  drawPreview();
})();
