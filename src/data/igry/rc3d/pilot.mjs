// rc3d · Режим «ручное управление» (igra.pilot): посетитель сам ведёт тело ship к телу target — держит цель в круге
// пальцем, мышью, стрелками или кнопками, «Тормоз»/«Тяга» меняют скорость сближения. Исход — по порогам в момент касания,
// а не по выбору вариантов: один режим для всех дней с ручным управлением (стыковка, посадка, причаливание).
// Сценарий: "igra": {"pilot": {"ship":"soyuz5", "target":"soyuz4", "os":[1,0,0], "start":20, "v0":0.7, "dv":0.1,
//   "vMax":0.3, "krug":0.3, "snos":0.05, "ruli":0.25, "gash":0.6, "toplivo":100, "rashodDv":4, "rashodRul":3,
//   "uskor":3, "kamera":{"pos":[-9,1.4,0], "look":[30,1.4,0]}, "timeline":[…]}, "outcomes":[{"pilot":"ok"|"hard"|"miss"|
//   "fuel"|"uhod", "result":"ok"|"fail", "reason", "title", "text", "timeline":[…]}]}.
// ship в сценарии стоит там, где касается target (точка стыковки); старт — на "start" м назад по оси "os".
// "snos" — снос вбок (м/с²), "ruli" — разгон вбок от ввода (м/с²), "gash" — гашение бокового дрейфа, "uskor" — время ускорено.
// Касание: смещение > krug — "miss", скорость > vMax — "hard", иначе "ok"; топливо 0 — "fuel"; ушёл на 1,5×start — "uhod".
import * as THREE from 'three';

const fmt = (x, n = 1) => x.toFixed(n).replace('.', ',').replace('-', '−');

// Кнопки управления под сценой (без 3D: строятся до загрузки сцены).
export function knopki(P, el) {
  const b = (id, text, lab) => el('button', { class: 'btn ghost rc3-pilot-b', type: 'button', id, 'aria-label': lab || text, text });
  const brake = b('gBrake', P.tormoz || 'Тормоз −' + fmt(P.dv ?? 0.1) + ' м/с'), thrust = b('gThrust', P.tyaga || 'Тяга +' + fmt(P.dv ?? 0.1) + ' м/с');
  const dirs = { up: b('gUp', '↑', 'Сдвинуть вверх'), left: b('gLeft', '←', 'Сдвинуть влево'), right: b('gRight', '→', 'Сдвинуть вправо'), down: b('gDown', '↓', 'Сдвинуть вниз') };
  const ctrl = el('div', { class: 'rc3-pilot', id: 'gPilot' },
    el('div', { class: 'rc3-pilot-dv' }, brake, thrust),
    el('div', { class: 'rc3-pilot-krest', role: 'group', 'aria-label': 'Сдвиг корабля вбок' }, dirs.up, dirs.left, dirs.right, dirs.down));
  return { ctrl, brake, thrust, dirs };
}

// Подключение к сцене. h — из проигрывателя: ui, hint, finish(o), lock(on), zv, stage.
export function pilot(S, G, K, h) {
  const P = G.pilot, A = new THREE.Vector3().fromArray(P.os || [1, 0, 0]).normalize();
  const U = new THREE.Vector3(0, 1, 0).addScaledVector(A, -A.y).normalize(), W = new THREE.Vector3().crossVectors(A, U);
  const ship = S.one(P.ship), target = S.one(P.target);
  const dv = P.dv ?? 0.1, vMax = P.vMax ?? 0.3, krug = P.krug ?? 0.3, start = P.start ?? 20, k = P.uskor ?? 1;
  const cam = P.kamera || { pos: [-9, 1.4, 0], look: [30, 1.4, 0] };
  const ring = document.createElement('div'); ring.className = 'rc3-pricel'; ring.setAttribute('aria-hidden', 'true'); ring.hidden = true; h.stage.append(ring);
  let s = null, phase = 'zhdyot', popytka = 0, nextHud = 0;
  const hold = { x: 0, y: 0 }, key = { x: 0, y: 0 }, drag = { on: false, x0: 0, y0: 0, x: 0, y: 0 };

  const place = () => {
    const I = ship.init.pos; ship.o.position.copy(I).addScaledVector(A, -s.d).addScaledVector(U, s.off.y).addScaledVector(W, s.off.x);
  };
  const hud = () => {
    const r = s.off.length(), v = s.v;
    h.ui.count(fmt(Math.max(0, s.d)) + ' м · ' + fmt(v, 2) + ' м/с', (r <= krug ? 'в круге' : 'мимо круга ' + fmt(r, 2) + ' м') + ' · топливо ' + Math.max(0, Math.round(s.fuel)) + ' %');
  };
  const prepare = () => {
    S.reset(); popytka++;
    // Снос у каждой попытки свой, но повторяемый: фаза зависит от номера попытки.
    s = { d: start, v: P.v0 ?? 0.7, off: new THREE.Vector2(...(P.off0 || [0.12, -0.08])), w: new THREE.Vector2(), fuel: P.toplivo ?? 100, t: 0, f1: popytka * 1.7, f2: popytka * 2.9 + 1 };
    phase = 'zhdyot'; place(); hud(); setCam(true); ring.hidden = false; S.controls.enabled = false;
  };
  const setCam = () => {
    const p = ship.o.position; S.follow = null; S.camTw = null;
    S.camera.position.copy(p).add(new THREE.Vector3().fromArray(cam.pos)); S.controls.target.copy(p).add(new THREE.Vector3().fromArray(cam.look));
  };
  const end = (kind) => {
    phase = 'itog'; ring.hidden = true; S.controls.enabled = true; hold.x = hold.y = 0;
    const o = (G.outcomes || []).find((x) => x.pilot === kind) || { result: kind === 'ok' ? 'ok' : 'fail', text: kind };
    h.lock(true); h.ui.say(o.say || o.startSay || '');
    S.run(o.timeline, { onEnd: () => h.finish(o) });
  };
  const tick = (dt0) => {
    if (phase !== 'polyot' || !s) return;
    const dt = dt0 * k; s.t += dt;
    const ax = (P.snos ?? 0.05) * Math.sin(s.t * 0.21 + s.f1), ay = (P.snos ?? 0.05) * Math.cos(s.t * 0.17 + s.f2);
    const ux = Math.max(-1, Math.min(1, hold.x + key.x + drag.x)), uy = Math.max(-1, Math.min(1, hold.y + key.y + drag.y)), ru = P.ruli ?? 0.25;
    if (s.fuel > 0) { s.w.x += ux * ru * dt; s.w.y += uy * ru * dt; s.fuel -= (Math.abs(ux) + Math.abs(uy)) * (P.rashodRul ?? 3) * dt0; }
    s.w.x += ax * dt; s.w.y += ay * dt; s.w.multiplyScalar(Math.max(0, 1 - (P.gash ?? 0.6) * dt));
    s.off.addScaledVector(s.w, dt); s.d -= s.v * dt;
    if (s.d <= 0) { s.d = 0; place(); hud(); const r = s.off.length(); end(r > krug ? 'miss' : s.v > vMax ? 'hard' : 'ok'); return; }
    place(); setCam();
    if (s.fuel <= 0) { s.fuel = 0; hud(); end('fuel'); return; }
    if (s.d > start * 1.5) { hud(); end('uhod'); return; }
    if (s.t >= nextHud) { nextHud = s.t + 0.15 * k; hud(); }
  };
  // Прицел: круг допуска вокруг точки, где была бы цель без смещения; радиус — krug метров на расстоянии до цели.
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
  const prev = S.onTick;
  S.onTick = (dt) => {
    if (prev) prev(dt); tick(dt);
    if (ring.hidden || !s) return;
    target.o.updateMatrixWorld(true);
    const c = target.init.pos.clone().addScaledVector(U, s.off.y).addScaledVector(W, s.off.x);   // центр круга — ось корабля
    v1.copy(c).project(S.camera); v2.copy(c).addScaledVector(U, krug).project(S.camera);
    const w = h.stage.clientWidth, hh = h.stage.clientHeight, x = (v1.x + 1) / 2 * w, y = (1 - v1.y) / 2 * hh, R = Math.max(6, Math.abs(v2.y - v1.y) / 2 * hh);
    ring.style.cssText = `left:${x - R}px;top:${y - R}px;width:${2 * R}px;height:${2 * R}px`;
    ring.classList.toggle('mimo', s.off.length() > krug);
  };
  const go = () => { if (phase === 'polyot') return; if (phase === 'itog') prepare(); h.lock(false); phase = 'polyot'; nextHud = 0; S.run(P.timeline); h.ui.say(G.startSay || ''); };
  const dV = (x) => { if (phase !== 'polyot' || s.fuel <= 0) return; s.v = Math.round((s.v + x) * 100) / 100; s.fuel -= P.rashodDv ?? 4; hud(); };
  K.brake.addEventListener('click', () => dV(-dv)); K.thrust.addEventListener('click', () => dV(dv));
  // Стрелки на экране: держать — корабль сдвигается (палец сверху = цель уходит вниз, как в окне корабля).
  const D = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };
  for (const [n, b] of Object.entries(K.dirs)) {
    const on = (e) => { e.preventDefault(); hold.x = D[n][0]; hold.y = D[n][1]; }, off = () => { hold.x = hold.y = 0; };
    b.addEventListener('pointerdown', on); for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, off);
  }
  // Палец/мышь по сцене: тянешь — корабль сдвигается туда же (сила — от длины рывка, 60 px = полный ход).
  const cv = S.renderer.domElement; cv.style.touchAction = 'none';
  cv.addEventListener('pointerdown', (e) => { if (phase !== 'polyot') return; drag.on = true; drag.x0 = e.clientX; drag.y0 = e.clientY; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', (e) => { if (!drag.on) return; drag.x = Math.max(-1, Math.min(1, (e.clientX - drag.x0) / 60)); drag.y = Math.max(-1, Math.min(1, (drag.y0 - e.clientY) / 60)); });
  for (const ev of ['pointerup', 'pointercancel']) cv.addEventListener(ev, () => { drag.on = false; drag.x = drag.y = 0; });
  const KEYS = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  h.box.addEventListener('keydown', (e) => {
    if (phase !== 'polyot') return;
    if (KEYS[e.key]) { e.preventDefault(); key.x = KEYS[e.key][0]; key.y = KEYS[e.key][1]; }
    else if (e.key === 's' || e.key === 'ы' || e.key === '-') dV(-dv); else if (e.key === 'w' || e.key === 'ц' || e.key === '+' || e.key === '=') dV(dv);
  });
  h.box.addEventListener('keyup', (e) => { if (KEYS[e.key]) key.x = key.y = 0; });
  prepare();
  return {
    go, prepare,
    // Для бота проверки: держать ввод вбок, тормоз/тяга, состояние.
    hold: (x, y) => { hold.x = x; hold.y = y; }, brake: () => dV(-dv), thrust: () => dV(dv),
    pst: () => ({ phase, d: s.d, v: s.v, x: s.off.x, y: s.off.y, wx: s.w.x, wy: s.w.y, fuel: s.fuel }),
  };
}
