// rc3d · Проигрыватель дня: по сценарию JSON строит ЗАСТАВКУ (сверху) и ИГРУ (ниже) с блоком «Как играть».
// Заставка: запускается сама, когда видна; без звука до клика; идёт по кругу (zastavka.loop).
// Игра: выбор вариантов → кнопка → исход (outcome) по таблице «when»; или ручное управление (igra.pilot, pilot.mjs) — исход по порогам. Счётчик причин неудачи, баллы window.award.
// Текст — только под сценой (#…Count, #…Msg, «Что сделать сейчас»); на самой картинке надписей нет.
import { Scena } from './scena.mjs';
import { Zvuk } from './zvuk.mjs';

const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (v == null || v === false) continue; if (k === 'text') n.textContent = v; else n.setAttribute(k, v === true ? '' : v); }
  for (const c of kids.flat()) if (c != null) n.append(c);
  return n;
};
// «**Осмотри.** Остальной текст» → <b>Осмотри.</b> Остальной текст (без innerHTML).
const rich = (tag, s, attrs) => { const n = el(tag, attrs); const m = /^\*\*(.+?)\*\*\s*(.*)$/s.exec(s || ''); if (m) n.append(el('b', { text: m[1] }), ' ' + m[2]); else n.textContent = s || ''; return n; };
const award = (k, n) => { if (typeof window.award === 'function') window.award(k, n); };
// Сцена режима: общие тела + свои тела/частицы/камера заставки или игры (zastavka.objects, igra.camera…).
const forMode = (sc, M) => ({ ...sc, objects: [...(sc.objects || []), ...(M.objects || [])], fx: [...(sc.fx || []), ...(M.fx || [])], camera: M.camera || sc.camera, env: M.env || sc.env });
function webgl() { try { const c = document.createElement('canvas'); return !!(window.WebGL2RenderingContext && c.getContext('webgl2')); } catch (e) { return false; } }
// Все голоса сценария — чтобы загрузить заранее.
function voices(sc) {
  const out = new Set(), walk = (tl) => (tl || []).forEach((e) => e.do === 'voice' && out.add(e.file));
  walk(sc.zastavka?.timeline); for (const o of sc.igra?.outcomes || []) walk(o.timeline);
  for (const c of sc.igra?.choices || []) for (const op of c.options) walk(op.setup);
  return [...out];
}
const lines = (prefix) => ({
  count: el('div', { class: 'rc3-count', id: prefix + 'Count', 'aria-live': 'polite' }),
  msg: el('div', { class: 'lab-msg', id: prefix + 'Msg', 'aria-live': 'polite' }),
});
const uiOf = (L) => ({
  say(t, cls) { L.msg.className = 'lab-msg' + (cls ? ' ' + cls : ''); L.msg.textContent = t || ''; },
  count(big, small) { L.count.replaceChildren(); if (!big) return; L.count.textContent = big; if (small) L.count.prepend(el('small', { text: small })); },
});

export async function zapusk(root, sc, base) {
  const Z = sc.zastavka, G = sc.igra, gl = webgl();
  root.replaceChildren();
  const api = (window.__rc3d = { sc, ready: false });

  // ── Заставка ──
  if (Z) {
    const L = lines('z'), stage = el('div', { class: 'rc3-stage', id: 'zStage', role: 'img', 'aria-label': Z.alt || sc.title });
    const snd = el('button', { class: 'btn ghost', type: 'button', id: 'zSnd', 'aria-pressed': 'false', text: 'Включить звук' });
    const again = el('button', { class: 'btn ghost', type: 'button', id: 'zAgain', text: 'Смотреть сначала' });
    const box = el('div', { class: 'lab rc3', id: 'rc3Z', 'data-sostoyanie': 'gruzit' }, stage, el('div', { class: 'rc3-under' }, L.count, L.msg, el('div', { class: 'lab-btns' }, snd, again)));
    root.append(el('section', { class: 'block rc3-blok', id: 'zastavka' }, el('div', { class: 'wrap' },
      el('div', { class: 'kicker', text: Z.kicker || 'Заставка дня · 3D' }), el('h2', { text: Z.title || sc.title }), Z.lead ? el('p', { class: 'r3-lead', text: Z.lead }) : null, box)));
    if (!gl) { box.setAttribute('data-sostoyanie', 'tekst'); uiOf(L).say(Z.tekst || 'Браузер не показывает 3D.'); }
    else {
      const zv = new Zvuk({ muted: true }), ui = uiOf(L);
      const S = new Scena(stage, forMode(sc, Z), { ui, zvuk: zv, base });
      await S.init(); zv.init(); for (const f of voices(sc)) zv.load(base + 'zvuk/' + f + '.mp3');
      box.setAttribute('data-sostoyanie', 'gotovo');
      let cycle = 0, timer = 0, started = false;
      const play = () => { clearTimeout(timer); S.reset(); ui.count(''); ui.say(Z.start || ''); cycle++; api.z.cycle = cycle; api.z.done = false;
        S.run(Z.timeline, { onEnd: () => { api.z.done = true; if (Z.loop !== false) timer = setTimeout(play, (Z.pause ?? 2.5) * 1000); } }); };
      const soundOn = () => { zv.resume(); zv.setOn(!zv.on || snd.getAttribute('aria-pressed') !== 'true'); snd.setAttribute('aria-pressed', zv.on ? 'true' : 'false'); snd.textContent = zv.on ? 'Выключить звук' : 'Включить звук'; };
      snd.addEventListener('click', soundOn);
      stage.addEventListener('click', () => { if (!zv.on) soundOn(); });
      again.addEventListener('click', () => { zv.resume(); play(); });
      api.z = { S, play, cycle: 0, done: false, st: () => ({ cycle, done: api.z.done }) };
      // Автозапуск, как только заставка видна.
      new IntersectionObserver((es) => { if (es[0].isIntersecting && !started) { started = true; play(); } }).observe(stage);
    }
  }

  // ── Игра ──
  if (G) {
    const L = lines('g'), stage = el('div', { class: 'rc3-stage', id: 'gStage', role: 'img', 'aria-label': G.alt || sc.title });
    const hintP = el('p', { class: 'igra-seychas', id: 'gHint' });
    const hint = (t) => { hintP.replaceChildren(); const m = /^(Что сделать сейчас:)\s*(.*)$/s.exec(t || ''); if (m) hintP.append(el('b', { text: m[1] }), ' ' + m[2]); else hintP.textContent = t || ''; };
    const sel = {}, segs = [];
    const rows = (G.choices || []).map((c, i) => {
      sel[c.id] = c.default || c.options[0].id;
      const lid = 'gq' + i;
      return el('div', { class: 'lab-row', role: 'group', 'aria-labelledby': lid }, el('span', { class: 'lbl', id: lid, text: `${i + 1}. ${c.label}` }),
        c.options.map((op) => { const b = el('button', { class: 'seg', type: 'button', 'data-k': c.id, 'data-v': op.id, 'aria-pressed': sel[c.id] === op.id ? 'true' : 'false', text: op.label }); segs.push(b); return b; }));
    });
    const PL = G.pilot ? await import('./pilot.mjs') : null, pk = PL ? PL.knopki(G.pilot, el) : null;
    const go = el('button', { class: 'btn gold', type: 'button', id: 'gGo', text: G.button || 'Пуск' });
    const reset = el('button', { class: 'btn ghost', type: 'button', id: 'gReset', text: G.resetLabel || 'Начать заново' });
    const snd = el('button', { class: 'btn ghost', type: 'button', id: 'gSnd', 'aria-pressed': 'true', text: 'Звук: включён' });
    const fails = [...new Set((G.outcomes || []).filter((o) => o.result === 'fail' && o.reason).map((o) => o.reason))];
    const found = el('div', { class: 'lab-found', id: 'gFound' });
    const box = el('div', { class: 'lab rc3', id: 'rc3G', 'data-sostoyanie': 'gruzit' }, stage,
      el('div', { class: 'rc3-under' }, L.count, el('div', { class: 'rc3-ctrl', id: 'gCtrl' }, rows, pk ? pk.ctrl : null, el('div', { class: 'lab-btns' }, go, reset, snd)), L.msg, found));
    const R = G.rules || {};
    const pravila = el('div', { class: 'igra-pravila', 'data-igra-pravila': true },
      el('h2', { class: 'igra-pravila-h', text: 'Как играть' }), el('p', { class: 'igra-pravila-zachem', text: R.zachem || '' }),
      el('ol', { class: 'igra-pravila-shagi' }, (R.shagi || []).map((s) => rich('li', s))),
      (R.oshibki || []).map((s) => el('p', { class: 'igra-pravila-nyuans', text: s })), R.povtor ? el('p', { class: 'igra-pravila-nyuans', text: R.povtor }) : null,
      R.final ? el('p', { class: 'igra-pravila-final', text: R.final }) : null);
    root.append(el('section', { class: 'block rc3-blok', id: 'igra' }, el('div', { class: 'wrap' },
      el('div', { class: 'kicker', text: G.kicker || 'Игра в 3D' }), el('h2', { text: G.title || sc.title }), G.lead ? el('p', { class: 'r3-lead', text: G.lead }) : null,
      hintP, box, pravila, sc.istochniki ? el('p', { class: 'src-note', text: sc.istochniki }) : null)));
    const ui = uiOf(L);
    const setFound = (f) => { found.textContent = fails.length ? `Найдено причин неудачи: ${Object.keys(f).length} из ${fails.length}.` : ''; };
    if (!gl) { box.setAttribute('data-sostoyanie', 'tekst'); ui.say(G.tekst || 'Браузер не показывает 3D.'); return; }
    const zv = new Zvuk(), S = new Scena(stage, forMode(sc, G), { ui, zvuk: zv, base });
    await S.init(); zv.init();
    box.setAttribute('data-sostoyanie', 'gotovo');
    let phase = 'vybor', last = null, okDone = false; const got = {}, tried = {};
    const key = () => (G.choices || []).map((c) => sel[c.id]).join('|');
    const match = () => (G.outcomes || []).find((o) => Object.entries(o.when || {}).every(([k, v]) => v === '*' || (Array.isArray(v) ? v.includes(sel[k]) : sel[k] === v)));
    const optOf = (cid, oid) => G.choices.find((c) => c.id === cid).options.find((o) => o.id === oid);
    const lock = (on) => { for (const b of [...segs, go]) b.disabled = on; };
    const pkb = pk ? [pk.brake, pk.thrust, ...Object.values(pk.dirs)] : [];
    const lockP = (on) => { for (const b of pkb) b.disabled = on; };
    // Подготовка сцены под выбор: исходное состояние + setup выбранных вариантов (последний изменённый — с анимацией).
    let prepare = (changed) => {
      S.reset(); ui.count('');
      for (const c of G.choices || []) { const op = optOf(c.id, sel[c.id]); if (op.setup && c.id !== changed) S.run(op.setup, { instant: true }); }
      if (changed) { const op = optOf(changed, sel[changed]); if (op.setup) S.run(op.setup); }
      preview();
    };
    // Предрасчёт до пуска: у исхода "preview" (и "previewSmall") — живые приборы под сценой (расход, смета, высота…).
    const preview = () => { const o = match(); if (o && o.preview) ui.count(o.preview, o.previewSmall); };
    const toFind = () => (G.outcomes || []).filter((o) => o.result === 'fail' && o.reason && !got[o.reason]).map((o) => o.try || Object.entries(o.when || {}).filter(([, v]) => v !== '*').map(([k, v]) => optOf(k, Array.isArray(v) ? v[0] : v).label.toLowerCase()).join(' + '));
    const finish = (o) => {
      phase = 'itog'; lock(false); tried[key()] = o.result;
      if (o.title) ui.count(o.title, o.small);
      if (o.result === 'ok') {
        ui.say(o.text || 'Получилось!', 'ok');
        if (!okDone) { okDone = true; award(G.awardKey || 'lab', G.points ?? 30); }
        const left = [...new Set(toFind())];
        hint(o.hint || (left.length ? 'Что сделать сейчас: получилось! Чтобы найти все причины неудачи, нажми «' + reset.textContent + '» и попробуй: ' + left.join('; ') + '.'
          : 'Что сделать сейчас: пройдено всё — верный путь найден, все причины неудачи тоже. Можно запускать снова и смотреть с других сторон.'));
      } else {
        ui.say(o.text || 'Не получилось.', 'bad');
        if (o.reason && !got[o.reason]) { got[o.reason] = 1; award('why_' + o.reason, o.points ?? 10); setFound(got); }
        hint(o.hint || 'Что сделать сейчас: нажми «' + reset.textContent + '» и поменяй выбор.');
      }
      api.g.result = o.result; api.g.last = o.id;
    };
    let start = () => {
      if (phase === 'pusk') return;
      zv.resume();
      if (phase === 'itog') prepare(null);
      const o = match(); if (!o) { ui.say('Для этого сочетания нет исхода в сценарии.', 'bad'); return; }
      phase = 'pusk'; lock(true); last = o; api.g.result = null;
      const was = tried[key()];
      ui.say(was === 'fail' ? (G.again || 'Так ты уже пробовал, и не вышло. Смотри внимательно, в какой момент всё сорвётся.') : (o.startSay || G.startSay || 'Смотри на сцену.'));
      hint(G.watchHint || 'Что сделать сейчас: ничего не нажимай — смотри на сцену и читай под ней, что происходит.');
      S.run(o.timeline, { onEnd: () => finish(o) });
    };
    // Ручное управление: «Старт» начинает полёт, кнопки и палец ведут корабль, исход — в момент касания.
    let PI = null;
    if (PL) {
      PI = PL.pilot(S, G, pk, { ui, hint, stage, box, zv, lock: lockP, finish: (o) => { finish(o); lockP(true); } });
      lockP(true);
      prepare = () => PI.prepare();
      start = () => { zv.resume(); if (phase === 'pusk') return; if (phase === 'itog') { PI.prepare(); } phase = 'pusk'; api.g.result = null; go.disabled = true; lockP(false); PI.go();
        hint(G.watchHint || 'Что сделать сейчас: держи цель в круге и тормози.'); };
    }
    segs.forEach((b) => b.addEventListener('click', () => {
      if (phase === 'pusk') return;
      const k = b.dataset.k, v = b.dataset.v;
      segs.filter((x) => x.dataset.k === k).forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      const changed = sel[k] !== v || phase === 'itog'; sel[k] = v; phase = 'vybor';
      if (changed) prepare(k); else preview();
      const op = optOf(k, v); if (op.say) ui.say(op.say);
    }));
    go.addEventListener('click', start);
    reset.addEventListener('click', () => { phase = 'vybor'; lock(false); lockP(true); prepare(null); ui.say(G.resetSay || 'Всё снова на месте. Уже полученные баллы сохраняются и повторно не начисляются.'); hint(G.hint || 'Что сделать сейчас: выбери варианты и нажми «' + go.textContent + '».'); });
    snd.addEventListener('click', () => { zv.resume(); zv.setOn(!zv.on); snd.setAttribute('aria-pressed', zv.on ? 'true' : 'false'); snd.textContent = zv.on ? 'Звук: включён' : 'Звук: выключен'; });
    prepare(null); setFound(got);
    hint(G.hint || 'Что сделать сейчас: выбери варианты и нажми «' + go.textContent + '». Сцену можно крутить пальцем или мышью.');
    ui.say(G.startText || '');
    api.g = { S, sel, pick: (k, v) => segs.find((x) => x.dataset.k === k && x.dataset.v === v).click(), go: start, reset: () => reset.click(),
      st: () => ({ ...(PI ? { ...PI.pst(), polyot: PI.pst().phase } : {}), phase, result: api.g.result, last: api.g.last, found: Object.keys(got).length, fails: fails.length }),
      pilot: PI,
      combos: () => (G.choices || []).reduce((acc, c) => acc.flatMap((a) => c.options.map((o) => ({ ...a, [c.id]: o.id }))), [{}]) };
  }
  api.ready = true;
}

// Страница-проигрыватель: ?s=<имя> → scen/<имя>.json рядом со сборкой. На странице дня — <div id="rc3d" data-s="<имя>">
// (ставит загрузчик igry/rc3d-den.js по «Играть», поле igra.rc3d карточки дня).
export async function avtozapusk() {
  const root = document.getElementById('rc3d'); if (!root) return;
  const name = (new URLSearchParams(location.search).get('s') || root.dataset.s || '').replace(/[^a-z0-9\-_]/gi, '');
  if (!name) { root.textContent = 'Не указан сценарий: добавь ?s=имя.'; return; }
  const dir = new URL('./scen/', import.meta.url).href;
  try {
    const r = await fetch(dir + name + '.json', { cache: 'no-cache' }); if (!r.ok) throw new Error('нет сценария ' + name);
    const sc = await r.json(); if (!root.dataset.s) document.title = sc.title + ' · 3D';   // на странице дня (data-s) заголовок — дня
    await zapusk(root, sc, dir + name + '/');
  } catch (e) { console.error('rc3d', e); root.textContent = 'Сценарий не загрузился: ' + e.message; }
}
avtozapusk();
