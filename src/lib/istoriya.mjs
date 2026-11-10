// «История дня» и «Вспомни» для телефона (п.503 плана, Р745, 10.11.2026).
// История — страница дня экранами во всю высоту, листать пальцем: CSS scroll-snap, без библиотек
// (образец — https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap). Адрес /muzei/<музей>/istoriya/<ММ-ДД>/
// рядом со страницей дня; всё — из той же карточки дня (src/content/dni-shablon): обложка, хук, факты по одному, игра в конце.
// «Вспомни» — после ответа на все вопросы викторины дня вопросы ложатся в localStorage устройства; через 1, 3, 7, 30 дней
// на странице дня встаёт блок «Вспомни: вопрос из прошлого дня» (интервальное повторение, без сервера).
// ВЫКЛЮЧЕНЫ: проба у себя — PUBLIC_ISTORIYA=1 / PUBLIC_VSPOMNI=1 npm run build. Включение — VKL_* = true заявкой после снимков.
const VKL_ISTORIYA = false;
const VKL_VSPOMNI = false;
export const istoriyaOn = () => VKL_ISTORIYA || process.env.PUBLIC_ISTORIYA === '1';
export const vspomniOn = () => VKL_VSPOMNI || process.env.PUBLIC_VSPOMNI === '1';

export const DO_ZNAKOV = 280;
const bezTegov = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
// До 280 знаков на экран: длиннее — обрезка по слову, остальное — на странице дня.
export const korotko = (s, n = DO_ZNAKOV) => {
  const t = bezTegov(s);
  if (t.length <= n) return t;
  const c = t.slice(0, n - 1);
  return `${c.slice(0, c.lastIndexOf(' ') > 0 ? c.lastIndexOf(' ') : c.length).replace(/[\s,;:—–-]+$/, '')}…`;
};

// Экраны истории из карточки дня: [{ vid: 'oblozhka'|'hook'|'fakt'|'igra', ... }].
export function ekrany(d, base) {
  const url = (src) => (/^https?:/.test(src) ? src : `${base}${String(src).replace(/^\//, '')}`);
  const out = [];
  const o = d.oblozhka;
  out.push({ vid: 'oblozhka', zag: bezTegov(d.head.sobytie ?? d.head.title), god: d.head.god,
    img: o?.src && { src: url(o.src), alt: o.alt ?? '', w: o.width, h: o.height } });
  if (d.lead?.hook) out.push({ vid: 'hook', tekst: korotko(d.lead.hook) });
  const udary = [d.fakty ?? []].flat().flatMap((b) => b.udary ?? []);
  udary.forEach((u, i) => out.push({ vid: 'fakt', n: i + 1, vsego: udary.length, tekst: korotko(u.summary) }));
  out.push({ vid: 'igra', est: !!d.quiz?.voprosy?.length });
  return out;
}

// Данные для «Вспомни» на странице дня: вопросы викторины без лишнего.
export const vspomniDannye = (d) => JSON.stringify({ m: d.muzei, k: d.key, q: (d.quiz?.voprosy ?? []).map((v) => ({ q: v.q, o: v.o, a: v.a, e: v.e })) })
  .replace(/</g, '\\u003c');

export const vspomniHtml = '<section class="block rc-vspomni" id="vspomni" hidden aria-live="polite"><div class="wrap"></div></section>';
export const vspomniCss = `.rc-vspomni .wrap{border:2px solid currentColor;border-radius:12px;padding:16px;margin:16px auto;max-width:720px}
.rc-vspomni .kicker{font-size:.85em;opacity:.75}.rc-vspomni h2{margin:.2em 0 .5em}.rc-vspomni .opt{display:block;width:100%;text-align:left;margin:6px 0;padding:10px;min-height:44px}
.rc-vspomni .correct{outline:3px solid #2e7d32}.rc-vspomni .wrong{outline:3px solid #c62828}`;

// Скрипт «Вспомни»: ключ rc-vspomni — { "<музей>/<ММ-ДД>": { t: время ответа, s: шаг 0..3, q: [...] } }.
// Шаги 1, 3, 7, 30 дней; блок показывает один вопрос самой ранней созревшей записи, ответ сдвигает шаг; после 30 — запись снимается.
export const vspomniJs = `(function(){
  var KEY='rc-vspomni', SHAGI=[1,3,7,30], DEN=864e5;
  var el=document.getElementById('rc-vspomni-dannye'); if(!el) return;
  var tut=JSON.parse(el.textContent), id=tut.m+'/'+tut.k;
  var get=function(){ try{ return JSON.parse(localStorage.getItem(KEY))||{}; }catch(e){ return {}; } };
  var put=function(v){ try{ localStorage.setItem(KEY, JSON.stringify(v)); }catch(e){} };
  document.addEventListener('rc-igra', function(ev){
    var e=ev.detail&&ev.detail.e; if(e!=='vyigral'&&e!=='proigral') return;
    if(!tut.q.length) return; var v=get(); if(!v[id]) { v[id]={t:Date.now(), s:0, q:tut.q}; put(v); }
  });
  var v=get(), now=Date.now(), best=null;
  Object.keys(v).forEach(function(k){ var r=v[k]; if(k===id||!r||!r.q||!r.q.length) return;
    if(now-r.t>=SHAGI[r.s]*DEN && (!best||r.t<v[best].t)) best=k; });
  if(!best) return;
  var r=v[best], it=r.q[r.s % r.q.length], box=document.getElementById('vspomni'); if(!box) return;
  var w=box.querySelector('.wrap'), mk=function(t,c,x){ var n=document.createElement(t); if(c) n.className=c; if(x) n.textContent=x; return n; };
  w.appendChild(mk('div','kicker','Через '+SHAGI[r.s]+' '+(SHAGI[r.s]===1?'день':SHAGI[r.s]<5?'дня':'дней')));
  w.appendChild(mk('h2','','Вспомни: вопрос из прошлого дня'));
  w.appendChild(mk('p','quiz-q',it.q));
  var exp=mk('p','exp'), done=false, btns=it.o.map(function(txt,oi){ var b=mk('button','opt',txt); b.type='button';
    b.onclick=function(){ if(done) return; done=true; btns.forEach(function(x,xi){ x.disabled=true; if(xi===it.a) x.classList.add('correct'); });
      if(oi!==it.a) b.classList.add('wrong'); exp.textContent=(oi===it.a?'Верно. ':'Не совсем. ')+it.e;
      var v2=get(); if(v2[best]){ v2[best].s++; if(v2[best].s>=SHAGI.length) delete v2[best]; put(v2); } };
    w.appendChild(b); return b; });
  w.appendChild(exp);
  var a=mk('a','','Открыть тот день →'); a.href='../'+best.split('/')[1]+'/'; if(best.split('/')[0]!==tut.m) a.href='../../../'+best.split('/')[0]+'/den/'+best.split('/')[1]+'/';
  w.appendChild(a); box.hidden=false;
})();`;
