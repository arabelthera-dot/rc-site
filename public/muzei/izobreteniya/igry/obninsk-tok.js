/* Игра «Дай атомный ток в сеть» (21 января, Обнинская АЭС), r418-21. Стержни — мощность с запозданием, «нежданчики», задвижка, окна посёлка. */
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
(function () {
  const root = document.querySelector('[data-obninsk-igra]'); if (!root) return;
  const $ = s => root.querySelector(s);
  const cv = $('canvas'), cx = cv.getContext('2d'), ruka = igraRuka(root);
  const bUp = $('.ot-vverh'), bDn = $('.ot-vniz'), bZ = $('.ot-zadv'), hod2 = $('.ot-hod2');
  const ZEL = [70, 90], KRASN = 110, OKON = 60, SMENA = 20;
  const rang = []; Array.from({ length: OKON }, (_, i) => ({ i, d: (i * 7919) % 97 })).sort((a, b) => a.d - b.d).forEach((o, k) => { rang[o.i] = k; });
  let S;
  function novaya() {
    S = { rod: 0, P: 0, par: 0, faza: 'razgon', avarii: 0, stop: 0, lit: 0, t: 0, smena: 0, kick: 5, sig: 0, turb: 0, konec: false };
    $('.ot-finale').hidden = true; hod2.hidden = true; $('.ot-hod').hidden = false;
    $('.ot-signal').textContent = ''; root.classList.remove('ot-trevoga', 'ot-pobeda');
    zadacha('Жми «Поднять стержни»', 'Реактор холодный. Подними стержни — пойдёт цепная реакция.'); ruka.na(bUp);
  }
  function zadacha(a, b) { $('.ot-task').innerHTML = '<b>Что сделать сейчас:</b> ' + a; $('.ot-sub').textContent = b || ''; }
  function shag(d) {
    if (S.konec || S.stop > 0) return;
    S.rod = Math.max(0, Math.min(1, S.rod + d));
    if (S.faza === 'razgon' && S.P < ZEL[0] - 15) ruka.na(bUp); else ruka.ubrat();
  }
  function derzhat(btn, d) {
    let tm = null;
    const go = () => { shag(d); tm = setTimeout(go, 170); };
    btn.addEventListener('pointerdown', e => { e.preventDefault(); clearTimeout(tm); go(); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => btn.addEventListener(t, () => clearTimeout(tm)));
    btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shag(d); } });
  }
  derzhat(bUp, 0.05); derzhat(bDn, -0.05);
  bZ.addEventListener('click', () => {
    if (S.faza !== 'par') return;
    S.faza = 'tok'; hod2.hidden = true; ruka.ubrat();
    zadacha('Держи мощность в зелёном', 'Задвижка открыта: пар пошёл на турбину. Ровная мощность — больше окон горит.');
  });
  $('.ot-again').addEventListener('click', novaya);
  function avaria() {
    S.avarii++; S.stop = 2.2; S.rod = 0; S.P = Math.min(S.P, 60); S.par = Math.max(0, S.par - 40);
    root.classList.add('ot-trevoga');
    $('.ot-signal').textContent = 'Аварийная защита! Стержни упали в активную зону.';
    if (S.avarii >= 3) return finish(false);
    zadacha('Подожди и подними стержни снова', 'Перескочил красную черту. Ещё ' + (3 - S.avarii) + ' ' + (S.avarii === 2 ? 'попытка' : 'попытки') + '.');
  }
  function finish(ok) {
    S.konec = true; ruka.ubrat(); $('.ot-hod').hidden = true; hod2.hidden = true;
    const z = [[ok && S.lit > 0, 'Ток в сети'], [S.avarii === 0, 'Ни одной аварийной остановки'], [S.lit >= OKON, 'Горят все ' + OKON + ' окон']];
    const n = z.filter(x => x[0]).length;
    $('.ot-fin-h').textContent = ok ? (n === 3 ? 'Ток пошёл людям — как 26 июня 1954-го!' : 'Ток в сети!') : 'Пуск сорван';
    $('.ot-fin-txt').textContent = ok ? 'Горит окон: ' + S.lit + ' из ' + OKON + '. Звёзд: ' + n + ' из 3.' : 'Три аварийные остановки подряд. В 1954-м станцию тоже хотели закрыть после поломок — её починили. Попробуй ещё раз.';
    $('.ot-zvezdy').innerHTML = z.map(x => '<li class="' + (x[0] ? 'da' : 'net') + '">' + (x[0] ? '★ ' : '☆ ') + x[1] + '</li>').join('');
    if (typeof award === 'function') { if (z[0][0]) award('tok', 45); if (z[0][0] && z[1][0]) award('bez', 20); if (z[2][0]) award('okna', 20); }
    $('.ot-finale').hidden = false; if (ok) root.classList.add('ot-pobeda');
    $('.ot-again').focus({ preventScroll: true });
  }
  function tik(dt) {
    if (S.konec) return;
    S.t += dt;
    if (S.stop > 0) { S.stop -= dt; if (S.stop <= 0) { root.classList.remove('ot-trevoga'); $('.ot-signal').textContent = ''; ruka.na(bUp); } }
    const T = S.rod * 140;
    S.P += (T - S.P) * Math.min(1, 0.9 * dt);
    if (S.faza !== 'razgon' || S.P > 40) {
      S.kick -= dt;
      if (S.kick <= 0 && S.stop <= 0) {
        const vverh = Math.random() < 0.55;
        S.P += vverh ? 16 : -16; S.rod = Math.max(0, Math.min(1, S.rod + (vverh ? 0.08 : -0.08)));
        S.sig = 1.4; S.kick = 3.5 + Math.random() * 3;
        $('.ot-signal').textContent = vverh ? '«Нежданчик»! Течь — мощность скачет вверх. Опусти стержни!' : '«Нежданчик»! Мощность проседает. Подними стержни!';
      }
    }
    if (S.sig > 0) { S.sig -= dt; if (S.sig <= 0 && S.stop <= 0) $('.ot-signal').textContent = ''; }
    if (S.P >= KRASN && S.stop <= 0) avaria();
    const zel = S.P >= ZEL[0] && S.P <= ZEL[1];
    if (S.faza === 'razgon') {
      S.par = Math.max(0, Math.min(100, S.par + (zel ? 14 : S.P > 40 ? 4 : -3) * dt));
      if (zel && S.par < 100) zadacha('Держи стрелку в зелёной полосе', 'Набирается пар: ' + Math.round(S.par) + ' %.');
      else if (S.P < ZEL[0] && S.stop <= 0 && S.P > 20) zadacha('Ещё чуть подними стержни', 'Пар набирается только в зелёной полосе.');
      else if (S.P > ZEL[1] && S.stop <= 0) zadacha('Опусти стержни!', 'Мощность выше зелёной полосы — до красной черты недалеко.');
      if (S.par >= 100) { S.faza = 'par'; hod2.hidden = false; ruka.na(bZ); zadacha('Открой задвижку', 'Пар набран. Пусти его на турбину.'); }
    } else if (S.faza === 'par') {
      S.par = Math.max(0, Math.min(100, S.par + (zel ? 2 : -6) * dt));
    } else {
      S.smena += dt; S.turb += dt * (S.P / 40);
      if (zel) S.lit = Math.min(OKON, S.lit + 4 * dt);
      else if (S.P < 50) S.lit = Math.max(0, S.lit - 2 * dt);
      S.lit = Math.round(S.lit * 100) / 100;
      $('.ot-sub').textContent = 'До конца смены ' + Math.max(0, Math.ceil(SMENA - S.smena)) + ' с.';
      if (S.lit >= OKON || S.smena >= SMENA) { S.lit = Math.floor(S.lit); return finish(true); }
    }
  }
  function tablo() {
    $('.ot-p').textContent = Math.round(S.P) + ' %';
    const pi = $('.ot-pbar i'); pi.style.width = Math.min(100, S.P / 1.3) + '%';
    pi.className = S.P >= 100 ? 'kr' : (S.P >= ZEL[0] && S.P <= ZEL[1] ? 'zl' : '');
    $('.ot-par').textContent = Math.round(S.par) + ' %'; $('.ot-parbar i').style.width = S.par + '%';
    $('.ot-okna').textContent = Math.floor(S.lit) + ' из ' + OKON;
  }
  function risuy(now) {
    const w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sky = cx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#060b18'); sky.addColorStop(1, '#14223a');
    cx.fillStyle = sky; cx.fillRect(0, 0, w, h);
    const rx = w * 0.06, rw = w * 0.26, ry = h * 0.18, rh = h * 0.72, g = Math.min(1, S.P / 100);
    cx.fillStyle = '#2a3442'; cx.fillRect(rx - 8, ry - 8, rw + 16, rh + 16);
    const gl = cx.createRadialGradient(rx + rw / 2, ry + rh * 0.62, 4, rx + rw / 2, ry + rh * 0.62, rw * 1.1);
    gl.addColorStop(0, 'rgba(120,200,255,' + (0.15 + 0.85 * g) + ')'); gl.addColorStop(1, 'rgba(20,60,140,' + (0.1 + 0.4 * g) + ')');
    cx.fillStyle = gl; cx.fillRect(rx, ry, rw, rh);
    if (S.P > 100) { cx.fillStyle = 'rgba(255,60,40,' + (0.25 + 0.2 * Math.sin(now / 80)) + ')'; cx.fillRect(rx, ry, rw, rh); }
    cx.fillStyle = '#9aa6b4';
    for (let i = 0; i < 4; i++) { const sx = rx + rw * (0.14 + i * 0.24), len = rh * (0.95 - 0.85 * S.rod); cx.fillRect(sx, ry - 12, rw * 0.08, len + 12); }
    cx.fillStyle = '#cfe3ff'; cx.font = '600 11px system-ui'; cx.fillText('Реактор АМ', rx, ry - 14);
    const tx = w * 0.42, ty = h * 0.6, tr = Math.min(w, h) * 0.08;
    cx.strokeStyle = '#6b7a8c'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(rx + rw + 8, ty); cx.lineTo(tx - tr, ty); cx.stroke();
    if (S.faza === 'tok') for (let i = 0; i < 6; i++) { const f = ((now / 400 + i / 6) % 1); cx.fillStyle = 'rgba(230,240,255,' + (0.6 - f * 0.5) + ')'; cx.beginPath(); cx.arc(rx + rw + 8 + (tx - tr - rx - rw - 8) * f, ty - 4 - f * 6, 3 + f * 4, 0, 7); cx.fill(); }
    cx.save(); cx.translate(tx, ty); cx.rotate(S.turb * 3); cx.strokeStyle = '#d8b25a'; cx.lineWidth = 3;
    for (let i = 0; i < 6; i++) { cx.rotate(Math.PI / 3); cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(tr, 0); cx.stroke(); }
    cx.restore(); cx.fillStyle = '#cfe3ff'; cx.fillText('Турбина', tx - tr, ty + tr + 14);
    const gx = w * 0.55, gw = w * 0.42, base = h * 0.92, lit = Math.floor(S.lit);
    if (S.faza === 'tok') { cx.strokeStyle = 'rgba(255,214,102,.8)'; cx.lineWidth = 2; cx.setLineDash([6, 6]); cx.lineDashOffset = -now / 30; cx.beginPath(); cx.moveTo(tx + tr, ty); cx.lineTo(gx, h * 0.4); cx.stroke(); cx.setLineDash([]); }
    for (let d = 0; d < 6; d++) {
      const dx = gx + d * gw / 6, dh = h * (0.3 + ((d * 37) % 5) * 0.06), dw = gw / 6 - 6;
      cx.fillStyle = '#1d2738'; cx.fillRect(dx, base - dh, dw, dh);
      for (let k = 0; k < 10; k++) {
        const n = d * 10 + k, on = rang[n] < lit;
        const ox = dx + 4 + (k % 2) * (dw / 2 - 2), oy = base - dh + 8 + Math.floor(k / 2) * (dh - 12) / 5;
        cx.fillStyle = on ? '#ffd666' : '#2c3a50'; cx.fillRect(ox, oy, dw / 2 - 8, (dh - 12) / 5 - 6);
        if (on) { cx.fillStyle = 'rgba(255,214,102,.18)'; cx.fillRect(ox - 3, oy - 3, dw / 2 - 2, (dh - 12) / 5); }
      }
    }
    if (S.konec && S.lit > 0) { const a = 0.25 + 0.15 * Math.sin(now / 300); cx.fillStyle = 'rgba(255,214,102,' + a * S.lit / OKON + ')'; cx.fillRect(gx - 10, 0, gw + 20, base); }
  }
  let last = performance.now();
  function cikl(now) { const dt = Math.min(0.1, (now - last) / 1000); last = now; tik(dt); tablo(); risuy(now); requestAnimationFrame(cikl); }
  novaya(); requestAnimationFrame(cikl);
})();
