/* Игра 15 января «Найди волчок Ковалевской» (модель волчка) — скрипт как есть со страницы
   src/data/full-pages/izobreteniya/01-15.html (пилот den-shablon, Р297); разметка — src/data/igry/izobreteniya/volchok.html.
   Нужна глобальная award() (assets/museum-score.js). Викторина дня — не здесь: вопросы в карточке, вёрстка в шаблоне. */
(function(){
  var $ = function(id){return document.getElementById(id);};

  /* ── ВОЛЧОК ── уравнения Эйлера — Пуассона в осях тела, метод Рунге — Кутты, шаг 0,01.
     Состояние: угловая скорость w и три неподвижных в пространстве орта (al, be — горизонтали,
     ga — вертикаль), записанные в осях тела. Вес mg·l = 1. Расчёт детерминированный:
     одинаковый выбор — одинаковый кадр. Начальные условия подобраны так, чтобы за 60 единиц
     времени хаотичные случаи расходились до порядка единицы, а решаемые — меньше 0,001. */
  var MASS = {raz:[1,1.5,0.7], yula:[1,1,1.6], kov:[1,1,0.5]};
  var CM = {axis:[0,0,1], eq:[1,0,0], zero:[0,0,0]};
  var W0 = [1,0.5,0], TH = 0.5, DW = 1e-6, H = 0.01, T = 60;
  var DEF = {mass:'raz', cm:'axis'};
  var st = {mass:DEF.mass, cm:DEF.cm};
  var found = {};
  function cross(a,b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function deriv(s, I, r){
    var w=[s[0],s[1],s[2]], ga=[s[9],s[10],s[11]];
    var t1=cross([I[0]*w[0],I[1]*w[1],I[2]*w[2]], w), tq=cross(r, ga);
    return [(t1[0]-tq[0])/I[0],(t1[1]-tq[1])/I[1],(t1[2]-tq[2])/I[2]]
      .concat(cross([s[3],s[4],s[5]],w), cross([s[6],s[7],s[8]],w), cross(ga,w));
  }
  function rk4(s, I, r){
    function add(a,k,f){ var o=new Array(12); for (var i=0;i<12;i++) o[i]=a[i]+f*k[i]; return o; }
    var k1=deriv(s,I,r), k2=deriv(add(s,k1,H/2),I,r), k3=deriv(add(s,k2,H/2),I,r), k4=deriv(add(s,k3,H),I,r);
    var o=new Array(12); for (var i=0;i<12;i++) o[i]=s[i]+H/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]); return o;
  }
  function start(w){ var c=Math.cos(TH), sn=Math.sin(TH); return [w[0],w[1],w[2], c,0,-sn, 0,1,0, sn,0,c]; }
  function look(s, u){ // куда смотрит выбранная ось тела в пространстве
    return [s[3]*u[0]+s[4]*u[1]+s[5]*u[2], s[6]*u[0]+s[7]*u[1]+s[8]*u[2], s[9]*u[0]+s[10]*u[1]+s[11]*u[2]];
  }
  function simulate(m, c){
    var I=MASS[m], r=CM[c], u=(c==='zero')?[0,0,1]:r;
    var s1=start(W0), s2=start([W0[0],W0[1]+DW,W0[2]]), tr1=[], tr2=[], dist=[], n=Math.round(T/H);
    for (var i=0;i<n;i++){
      s1=rk4(s1,I,r); s2=rk4(s2,I,r);
      if (i%5===0){ var a=look(s1,u), b=look(s2,u); tr1.push(a); tr2.push(b);
        dist.push(Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])); }
    }
    return {tr1:tr1, tr2:tr2, dist:dist};
  }
  function verdict(m, c){
    if (c==='zero') return 'euler';
    if (c==='axis' && m!=='raz') return 'lagrange';
    if (c==='eq' && m==='kov') return 'kov';
    return 'chaos';
  }
  var cv=$('labCv'), cx=cv.getContext('2d'), W=640, Hc=300;
  function frame(){
    cx.fillStyle='#0b1622'; cx.fillRect(0,0,W,Hc);
    cx.strokeStyle='rgba(143,165,185,.35)'; cx.lineWidth=1;
    cx.beginPath(); cx.arc(150,150,120,0,6.2832); cx.stroke();
    cx.beginPath(); cx.moveTo(30,150); cx.lineTo(270,150); cx.moveTo(150,30); cx.lineTo(150,270); cx.stroke();
    cx.fillStyle='#8fa5b9'; cx.font='12px Inter, sans-serif'; cx.textAlign='left';
    cx.fillText('след волчка, вид сверху', 20, 20);
    cx.strokeRect(320,40,300,220);
    cx.fillText('насколько разошлись два волчка', 320, 20);
    cx.fillText('1', 304, 48); cx.fillText('0,001', 284, 154); cx.fillText('0,000001', 268, 262);
    cx.fillText('время →', 560, 280);
    cx.setLineDash([3,4]); cx.beginPath(); cx.moveTo(320,150); cx.lineTo(620,150); cx.stroke(); cx.setLineDash([]);
  }
  function yOf(d){ // логарифмическая шкала: 1e-6 → низ, 1 → верх
    var l=Math.log(Math.max(d,1e-6))/Math.LN10; return 260-(l+6)/6*220;
  }
  function drawUpTo(res, k){
    frame();
    function trace(tr, col){ cx.strokeStyle=col; cx.lineWidth=1.3; cx.beginPath();
      for (var i=0;i<=k && i<tr.length;i++){ var x=150+tr[i][0]*120, y=150-tr[i][1]*120; if(i===0) cx.moveTo(x,y); else cx.lineTo(x,y); }
      cx.stroke(); }
    trace(res.tr1,'rgba(228,201,122,.85)'); trace(res.tr2,'rgba(110,180,230,.75)');
    cx.strokeStyle='#e4c97a'; cx.lineWidth=2; cx.beginPath();
    var N=res.dist.length;
    for (var i=0;i<=k && i<N;i++){ var x=320+i/(N-1)*300, y=yOf(res.dist[i]); if(i===0) cx.moveTo(x,y); else cx.lineTo(x,y); }
    cx.stroke();
    cx.fillStyle='rgba(228,201,122,.9)'; cx.fillText('■ первый волчок', 20, 292);
    cx.fillStyle='rgba(110,180,230,.9)'; cx.fillText('■ второй волчок', 140, 292);
  }
  function setFound(){
    function yn(k){ return found[k] ? 'да' : 'нет'; }
    $('labFound').textContent='Найдено: случай Эйлера — '+yn('euler')+', случай Лагранжа — '+yn('lagrange')+', хаос — '+yn('chaos')+', случай Ковалевской — '+yn('kov')+'.';
  }
  function msg(t, cls){ var m=$('labMsg'); m.className='lab-msg'+(cls?' '+cls:''); m.textContent=t; }
  var TEXT = {
    euler:['Порядок. Центр тяжести в точке опоры — вес не крутит тело, и следы волчков совпадают при любой массе. Это первый решаемый случай, его нашёл Эйлер.','ok'],
    lagrange:['Порядок. Масса симметрична, а центр тяжести на оси симметрии — как у обычной юлы. Следы совпадают: это второй решаемый случай, случай Лагранжа.','ok'],
    chaos:['Хаос. Разница в одну миллионную разрослась, и через несколько оборотов волчки ведут себя по-разному. Такое движение не просчитать до конца формулой — именно на этом застряли математики после Эйлера и Лагранжа.','bad'],
    kov:['Порядок там, где его никто не ждал: центр тяжести сбоку от оси, а следы волчков совпадают. Это случай Ковалевской, найденный в 1888 году, — третий за сто с лишним лет. За него Парижская академия подняла премию Бордена до 5000 франков.','ok']
  };
  // счёт «начал — доиграл» (Р286 п.3, assets/rc-igra-schet.js): без модуля событие никуда не уходит
  function igraSchet(e){ document.dispatchEvent(new CustomEvent('rc-igra', {detail:{e:e, igra:'volchok'}})); }
  var AW = {euler:['why0',5], lagrange:['why1',5], chaos:['why2',5], kov:['lab',35]};
  var anim=null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function stop(){ if (anim){ cancelAnimationFrame(anim); anim=null; } }
  var segs=document.querySelectorAll('#lab .seg');
  for (var s=0;s<segs.length;s++) segs[s].addEventListener('click', function(){
    var k=this.getAttribute('data-k'), v=this.getAttribute('data-v'); st[k]=v;
    var same=document.querySelectorAll('#lab .seg[data-k="'+k+'"]');
    for (var j=0;j<same.length;j++) same[j].setAttribute('aria-pressed', same[j]===this ? 'true':'false');
  });
  $('labGo').onclick = function(){
    stop();
    var v=verdict(st.mass, st.cm), res=simulate(st.mass, st.cm), N=res.dist.length;
    msg('Волчки запущены…');
    igraSchet('nachal');
    function finish(){
      drawUpTo(res, N-1);
      msg(TEXT[v][0], TEXT[v][1]);
      if (!found[v]){ found[v]=1; award(AW[v][0], AW[v][1]); }
      setFound();
      igraSchet(v === 'kov' ? 'vyigral' : 'proigral');
    }
    if (reduce){ finish(); return; }
    var k=0;
    (function step(){ k+=8; if (k>=N-1){ anim=null; finish(); return; } drawUpTo(res,k); anim=requestAnimationFrame(step); })();
  };
  $('labReset').onclick = function(){
    stop(); st={mass:DEF.mass, cm:DEF.cm};
    for (var j=0;j<segs.length;j++){ var k=segs[j].getAttribute('data-k'); segs[j].setAttribute('aria-pressed', segs[j].getAttribute('data-v')===DEF[k] ? 'true':'false'); }
    frame(); msg('Волчки остановлены. Выбери условия заново. Уже полученные баллы сохраняются и повторно не начисляются.');
  };
  frame();
})();
