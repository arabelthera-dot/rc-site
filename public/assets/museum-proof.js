/* Блок «Документ» — доказательство первенства на экране.
   Стандарт: docs/standards/page-production-standard.md, раздел от 09.10.2026.
   Данные: <script type="application/json" data-proof>{…priority_proof…}</script>
   Место:  <section data-proof-block></section> сразу под утверждением первенства.
   status=not_found — блок не рисуется, день остаётся; список для Сергея ведёт tools/proof-check.py.
   Р323 (28.10): один год (разрыв меньше года) — полные даты и разрыв в днях/месяцах;
   сайт с сертификатом не из мирового списка (RU_CA пишет scripts/proverka-tls.mjs) — реквизиты текстом, ссылка с подписью. */
(function(){
  'use strict';
  var CSS='.rc-proof{margin:28px 0;padding:22px 22px 18px;border:1px solid var(--gold-l,#b8943f);border-radius:6px;'+
    'background:var(--surface,rgba(184,148,63,.06));color:var(--fg,inherit);font-size:16px;line-height:1.5}'+
    '.rc-proof__k{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-l,#b8943f);margin:0 0 8px}'+
    '.rc-proof__t{font-family:"Playfair Display",Georgia,serif;font-size:20px;margin:0 0 6px}'+
    '.rc-proof__m{color:var(--muted,#777);font-size:14px;margin:0 0 14px}'+
    '.rc-proof figure{margin:0 0 14px}.rc-proof img{display:block;max-width:100%;height:auto;border:1px solid rgba(0,0,0,.15)}'+
    '.rc-proof figcaption{font-size:13px;color:var(--muted,#777);margin-top:6px}'+
    '.rc-proof__vs{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;border-top:1px solid rgba(128,128,128,.3);padding-top:14px}'+
    '.rc-proof__side b{display:block;font-size:22px}.rc-proof__side span{font-size:13px;color:var(--muted,#777)}'+
    '.rc-proof__gap{text-align:center;font-weight:700;color:var(--gold-l,#b8943f);white-space:nowrap}'+
    '.rc-proof__side--them{text-align:right}.rc-proof a{color:inherit}'+
    '@media(max-width:480px){.rc-proof__vs{grid-template-columns:1fr}.rc-proof__side--them{text-align:left}.rc-proof__gap{text-align:left}}';
  var RU_CA=['admship.ru','ckb-rubin.ru','rgantd.ru'];
  function ruCa(u){try{var h=new URL(u).hostname.replace(/^www\./,'');return RU_CA.indexOf(h)>=0;}catch(e){return false;}}
  function full(d){return /^\d{4}-\d{2}-\d{2}$/.test(String(d||''));}
  function day(d){var p=String(d).split('-');return Date.UTC(+p[0],+p[1]-1,+p[2]);}
  function pl(n,a,b,c){var x=n%10,y=n%100;if(x===1&&y!==11)return a;if(x>=2&&x<=4&&(y<10||y>=20))return b;return c;}
  /* Разрыв по полным датам: до 90 дней — в днях, дальше — в месяцах (и днях). */
  function gapDays(o,r){
    var n=Math.round((day(r)-day(o))/864e5);if(!(n>0))return '';
    if(n<=90)return 'раньше на '+n+' '+pl(n,'день','дня','дней');
    var a=String(o).split('-'),b=String(r).split('-'),m=(b[0]-a[0])*12+(b[1]-a[1]),dd=b[2]-a[2];
    if(dd<0){m--;dd+=new Date(Date.UTC(+b[0],+b[1]-1,0)).getUTCDate();}
    return 'раньше на '+m+' '+pl(m,'месяц','месяца','месяцев')+(dd?' '+dd+' '+pl(dd,'день','дня','дней'):'');
  }
  /* «РГАНТД, Ф. 24, Оп. 1-1, Д. 90, Л. 13, 15» → архив · фонд · опись · дело · лист */
  function rekv(o){
    var n=String(o.number||''),m=n.match(/^(.*?),\s*Ф\.\s*([^,]+),\s*Оп\.\s*([^,]+),\s*Д\.\s*([^,]+)(?:,\s*Лл?\.\s*(.+))?$/);
    if(m)return ['Архив: '+m[1],'фонд '+m[2],'опись '+m[3],'дело '+m[4]].concat(m[5]?['лист '+m[5]]:[]).join(' · ');
    return [n,o.holder?'Хранится: '+o.holder:''].filter(Boolean).join(' · ');
  }
  function arhiv(box,o){
    box.appendChild(el('p','rc-proof__m','Реквизиты документа: '+rekv(o)));
    var s=el('p','rc-proof__m');var l=el('a',null,'сайт архива — откроется в Яндекс Браузере');
    l.href=o.source_url;l.target='_blank';l.rel='noopener';
    l.title='У сайта архива сертификат российского удостоверяющего центра: Chrome и Safari покажут предупреждение';
    s.appendChild(l);box.appendChild(s);
  }
  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
  function year(d){return d?parseInt(String(d).slice(0,4),10):NaN;}
  function fmt(d){
    if(!d)return '';var p=String(d).split('-');
    var M=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    if(p.length===3)return parseInt(p[2],10)+' '+M[parseInt(p[1],10)-1]+' '+p[0]+' г.';
    return p[0]+' г.';
  }
  function plural(n){var a=n%10,b=n%100;if(a===1&&b!==11)return 'год';if(a>=2&&a<=4&&(b<10||b>=20))return 'года';return 'лет';}
  function render(host,data){
    if(!data||data.status!=='found'||!data.ours)return;
    var o=data.ours,r=data.rival;
    var box=el('div','rc-proof');box.setAttribute('role','note');box.setAttribute('aria-label','Документ первенства');
    box.appendChild(el('p','rc-proof__k','Документ'));
    box.appendChild(el('p','rc-proof__t',o.title));
    box.appendChild(el('p','rc-proof__m',[o.kind,o.number?'№ '+o.number:'',fmt(o.date),o.holder].filter(Boolean).join(' · ')));
    var ru=ruCa(o.source_url);
    if(o.scan){
      var f=el('figure'),img=el('img');img.src=o.scan;img.alt=o.kind+': '+o.title;img.loading='lazy';
      if(ru)f.appendChild(img);else{var a=el('a');a.href=o.source_url;a.target='_blank';a.rel='noopener';a.appendChild(img);f.appendChild(a);}
      f.appendChild(el('figcaption',null,o.scan_credit||'Источник: '+o.source_url));box.appendChild(f);
      if(ru)arhiv(box,o);
    }else if(ru){arhiv(box,o);
    }else{
      var s=el('p','rc-proof__m');var l=el('a',null,'Открыть документ в архиве');l.href=o.source_url;l.target='_blank';l.rel='noopener';s.appendChild(l);box.appendChild(s);
    }
    if(r&&r.name){
      var gap=data.gap_years!=null?data.gap_years:(year(r.date)-year(o.date));
      var dd=full(o.date)&&full(r.date)?day(r.date)-day(o.date):NaN,near=dd>0&&dd<365*864e5;
      var D=function(d){return near?fmt(d).replace(/ г\.$/,''):String(year(d));};
      var vs=el('div','rc-proof__vs');
      var us=el('div','rc-proof__side');us.appendChild(el('b',null,D(o.date)));us.appendChild(el('span',null,'Россия · '+o.kind));
      var g=el('div','rc-proof__gap',near?gapDays(o.date,r.date):isFinite(gap)&&gap>0?'раньше на '+gap+' '+plural(gap):'');
      var th=el('div','rc-proof__side rc-proof__side--them');th.appendChild(el('b',null,D(r.date)));
      th.appendChild(el('span',null,r.name+(r.doc_title?' · '+r.doc_title:'')));
      vs.appendChild(us);vs.appendChild(g);vs.appendChild(th);box.appendChild(vs);
    }
    host.appendChild(box);
  }
  document.addEventListener('DOMContentLoaded',function(){
    var src=document.querySelector('script[data-proof]'),host=document.querySelector('[data-proof-block]');
    if(!src||!host)return;
    var data;try{data=JSON.parse(src.textContent);}catch(e){return;}
    if(!document.getElementById('rc-proof-css')){var st=el('style');st.id='rc-proof-css';st.textContent=CSS;document.head.appendChild(st);}
    render(host,data);
  });
}());
