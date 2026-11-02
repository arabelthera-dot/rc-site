// r569: «Загадка дня» — слой 3 пробы r566, вынесенный из r7-vau на данные (zagadki-01.json).
// День: ?d=01-12, иначе сегодняшний день января, иначе 01-01.
const $ = (s) => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

const DANNYE = await (await fetch('zagadki-01.json')).json();
const seg = new Date();
const kl = new URLSearchParams(location.search).get('d')
  || (seg.getMonth() === 0 ? `01-${String(seg.getDate()).padStart(2, '0')}` : '01-01');
const den = DANNYE.dni[kl] || DANNYE.dni['01-01'];
const KEY = DANNYE.dni[kl] ? kl : '01-01';

$('#kicker').textContent = `Загадка дня · ${den.data}`;
$('#zagolovok').textContent = den.predmet;
document.title = `Загадка дня · ${den.data} · ${den.predmet}`;
$('#k-dnyu').href = den.url;

// Разметка как в r566: .vopros > h3 + button[data-v] + .poyasn
const kont = $('#voprosy');
den.voprosy.forEach((v, i) => {
  const d = el('div', 'vopros'); d.dataset.i = i;
  d.append(el('h3', null, `${i + 1}. ${v.q}`));
  v.o.forEach((t, j) => { const b = el('button', null, t); b.dataset.v = j === v.a ? '1' : '0'; d.append(b); });
  const p = el('p', 'poyasn', v.e); p.append(el('small', null, `Источник: ${v.ist}`)); d.append(p);
  kont.append(d);
});

const ritual = (() => {
  const KLYUCH = `rc-zagadka-izobreteniya-${KEY}`;
  let st; try { st = JSON.parse(localStorage.getItem(KLYUCH) || '{}'); } catch { st = {}; }
  st.otv = st.otv || [];
  const voprosy = [...document.querySelectorAll('.vopros')];
  const sohr = () => { try { localStorage.setItem(KLYUCH, JSON.stringify(st)); } catch {} };
  const stroka = () => DANNYE.stroka
    .replace('{data}', den.data).replace('{predmet}', den.predmet)
    .replace('{kvadraty}', st.otv.map((o) => (o ? '🟩' : '⬛')).join(''))
    .replace('{verno}', st.otv.filter(Boolean).length).replace('{vsego}', voprosy.length);
  function pokaz() {
    voprosy.forEach((v, i) => {
      const o = st.otv[i]; v.classList.toggle('tek', i === st.otv.length);
      v.classList.toggle('sdelan', o !== undefined);
      if (o !== undefined) v.querySelectorAll('button').forEach((b) => { b.disabled = true; if (b.dataset.v === '1') b.classList.add('verno'); });
      if (o !== undefined && st.vybor?.[i] != null) { const b = v.querySelectorAll('button')[st.vybor[i]]; if (b && b.dataset.v !== '1') b.classList.add('mimo'); }
    });
    const plitki = $('#plitki'); plitki.innerHTML = '';
    voprosy.map((_, i) => (st.otv[i] === undefined ? '' : st.otv[i] ? '🟩' : '⬛')).forEach((s, i) => {
      const p = el('span', 'plitka' + (s ? ' otkr' : ''), s); p.style.animationDelay = `${i * 0.12}s`; plitki.append(p);
    });
    const vse = st.otv.length === voprosy.length;
    $('#ritual-itog').hidden = !vse;
    if (vse) $('#ritual-stroka').textContent = stroka();
  }
  voprosy.forEach((v, i) => v.querySelectorAll('button').forEach((b, j) => b.addEventListener('click', () => {
    if (st.otv[i] !== undefined || i !== st.otv.length) return;
    st.otv[i] = b.dataset.v === '1'; st.vybor = st.vybor || []; st.vybor[i] = j; sohr(); pokaz();
    if (navigator.vibrate) navigator.vibrate(st.otv[i] ? 20 : [30, 40, 30]);
  })));
  $('#podelitsya').addEventListener('click', async () => {
    const txt = stroka() + '\n' + den.url;
    let ok = false;
    try { await navigator.clipboard.writeText(txt); ok = true; } catch {
      const t = document.createElement('textarea'); t.value = txt; document.body.append(t); t.select(); ok = document.execCommand('copy'); t.remove();
    }
    $('#skopirovano').textContent = ok ? 'Скопировано — вставьте в чат.' : txt;
    window.__zagadka.podelilis = txt;
  });
  // До полуночи — следующая загадка.
  const tik = () => { const d = new Date(), z = new Date(d); z.setHours(24, 0, 0, 0); const s = Math.floor((z - d) / 1000);
    $('#do-zavtra').textContent = `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  tik(); setInterval(tik, 1000);
  pokaz();
  return { stroka, sbros() { localStorage.removeItem(KLYUCH); location.reload(); } };
})();
window.__zagadka = { key: KEY, ...ritual };
