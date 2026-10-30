// 3D-блок игры 01-12 «Р-7 на стартовом столе Тюра-Тама» (опыт Р392). Исходник сцены; на сайт идёт сборка
// public/muzei/izobreteniya/igry/soberi-r7-3d/ (scena.js + чанк Rapier + rapier.wasm), см. сборку в конце файла.
// Ракета, стол и фермы — процедурно (цилиндры, конусы, вращение профиля), моделей .glb нет.
// Пламя, дым, взрыв — three.quarks; падение отработавших блоков и обломков — Rapier (WASM, грузится по «Пуску»).
// Весь текст — под сценой (#r3Count, #r3Msg); на сцене подписей нет.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  BatchedRenderer, ParticleSystem, ConeEmitter, SphereEmitter, PointEmitter, IntervalValue, ConstantValue, ColorRange,
  Gradient, ColorOverLife, SizeOverLife, ApplyForce, PiecewiseBezier, Bezier, RenderMode, Vector4, Vector3 as QV3,
} from 'three.quarks';

const SLAB = matchMedia('(pointer: coarse)').matches || innerWidth < 760;   // телефон: меньше частиц и теней
const K = SLAB ? 0.5 : 1;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ease = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

// ── Текстуры кодом: мягкое пятно для огня, клуб для дыма, степь, бетон ──
function canvasTex(size, draw, repeat) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 4; }
  return t;
}
const texGlow = canvasTex(64, (g, s) => {
  const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, s, s);
});
const texSmoke = canvasTex(128, (g, s) => {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const x = s / 2 + (rnd() - 0.5) * s * 0.42, y = s / 2 + (rnd() - 0.5) * s * 0.42, rr = s * (0.12 + rnd() * 0.2);
    const r = g.createRadialGradient(x, y, 0, x, y, rr);
    const a = 0.16 + rnd() * 0.12;
    r.addColorStop(0, `rgba(255,255,255,${a})`); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, s, s);
  }
});
const noiseTex = (base, spread, n, repeat) => canvasTex(256, (g, s) => {
  g.fillStyle = base; g.fillRect(0, 0, s, s);
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const v = (rnd() - 0.5) * spread; g.fillStyle = v > 0 ? `rgba(255,250,235,${v})` : `rgba(40,30,15,${-v})`;
    const w = 1 + rnd() * 5; g.fillRect(rnd() * s, rnd() * s, w, w * (0.4 + rnd()));
  }
}, repeat);

// ── Материалы ──
const M = {
  body: new THREE.MeshStandardMaterial({ color: 0xdfe3df, roughness: 0.5, metalness: 0.25 }),
  bodyDark: new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.6, metalness: 0.4 }),
  nozzle: new THREE.MeshStandardMaterial({ color: 0x4a3c33, roughness: 0.35, metalness: 0.85, side: THREE.DoubleSide }),
  steel: new THREE.MeshStandardMaterial({ color: 0x8d3b2c, roughness: 0.55, metalness: 0.5 }),
  concrete: new THREE.MeshStandardMaterial({ map: noiseTex('#9a978f', 0.22, 2600, 6), roughness: 0.95 }),
  pit: new THREE.MeshStandardMaterial({ color: 0x2b2a28, roughness: 1 }),
  steppe: new THREE.MeshStandardMaterial({ map: noiseTex('#b39d6e', 0.3, 5000, 260), roughness: 1 }),
  halo: new THREE.SpriteMaterial({ map: texGlow, color: 0xff9a3c, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.9 }),
  core: new THREE.MeshBasicMaterial({ map: texGlow, color: 0xffd9a0, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
  flame: new THREE.MeshBasicMaterial({ map: texGlow, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }),
  smoke: new THREE.MeshBasicMaterial({ map: texSmoke, transparent: true, depthWrite: false }),
  fire: new THREE.MeshBasicMaterial({ map: texSmoke, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }),
};

// Тело вращения по профилю [[r, y], …] (метры).
const lathe = (pts, seg = 40) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const mesh = (geo, mat, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = shadow; return m; };

// Сопло-колокол: горло сверху (y=0), срез снизу (y=-len).
function nozzleGeo(rExit, len) {
  return lathe([[rExit * 0.55, 0.12], [rExit * 0.42, 0], [rExit * 0.5, -len * 0.25], [rExit * 0.8, -len * 0.65], [rExit, -len]], 18);
}

// ── Частицы ──
let batch;
const live = new Set();
function addPS(ps, parent) { batch.addSystem(ps); (parent || scene).add(ps.emitter); live.add(ps); return ps; }
function killPS(ps) { if (!live.has(ps)) return; live.delete(ps); batch.deleteSystem(ps); ps.emitter.removeFromParent(); ps.dispose(); }
const grad = (cols, alphas) => new Gradient(cols.map(([r, g, b, t]) => [new QV3(r, g, b), t]), alphas);
const curve = (a, b, c, d) => new PiecewiseBezier([[new Bezier(a, b, c, d), 0]]);

// Пламя одного сопла. Эмиттер смотрит вниз; частицы в мировых координатах — шлейф тянется за ракетой.
function flamePS(scale) {
  const ps = new ParticleSystem({
    duration: 1, looping: true, worldSpace: true,
    startLife: new IntervalValue(0.18, 0.34), startSpeed: new IntervalValue(26 * scale + 8, 36 * scale + 10),
    startSize: new IntervalValue(0.75 * scale, 1.25 * scale), startColor: new ColorRange(new Vector4(1, 0.95, 0.85, 1), new Vector4(1, 0.78, 0.5, 1)),
    shape: new ConeEmitter({ radius: 0.32 * scale, angle: 0.07, thickness: 1, arc: Math.PI * 2 }),
    emissionOverTime: new ConstantValue(0), material: M.flame, renderMode: RenderMode.BillBoard,
    behaviors: [
      new ColorOverLife(grad([[1, 1, 0.92, 0], [1, 0.66, 0.2, 0.35], [0.85, 0.28, 0.06, 1]], [[1, 0], [0.85, 0.4], [0, 1]])),
      new SizeOverLife(curve(0.55, 1.2, 1.9, 2.6)),
    ],
  });
  ps.emitter.rotation.x = Math.PI / 2;     // +Z эмиттера → вниз
  ps.nozzleRate = (SLAB ? 34 : 70) * Math.max(0.55, scale);
  return ps;
}
function smokePS({ size = 6, life = [3, 5], speed = [8, 16], rate = 20, angle = 0.5, radius = 2, color = [0.86, 0.85, 0.83], alpha = 0.75, rise = 2.5 }) {
  return new ParticleSystem({
    duration: 1, looping: true, worldSpace: true,
    startLife: new IntervalValue(life[0], life[1]), startSpeed: new IntervalValue(speed[0], speed[1]),
    startSize: new IntervalValue(size * 0.7, size * 1.3), startRotation: new IntervalValue(0, Math.PI * 2),
    startColor: new ColorRange(new Vector4(color[0], color[1], color[2], alpha), new Vector4(color[0] * 0.92, color[1] * 0.92, color[2] * 0.92, alpha)),
    shape: new ConeEmitter({ radius, angle, thickness: 1, arc: Math.PI * 2 }),
    emissionOverTime: new ConstantValue(rate * K), material: M.smoke, renderMode: RenderMode.BillBoard,
    behaviors: [
      new ColorOverLife(grad([[1, 0.82, 0.62, 0], [1, 1, 1, 0.25], [0.95, 0.95, 0.95, 1]], [[0, 0], [1, 0.08], [0.7, 0.5], [0, 1]])),
      new SizeOverLife(curve(0.6, 1.6, 2.6, 3.4)), new ApplyForce(new QV3(0, 1, 0), new ConstantValue(rise)),
    ],
  });
}
// Взрыв: огненный шар, клубы чёрного дыма, искры.
function boom(pos, big) {
  const s = big ? 1.6 : 1;
  const once = (n) => [{ time: 0, count: new ConstantValue(Math.round(n * (SLAB ? 0.6 : 1))), cycle: 1, interval: 0.01, probability: 1 }];
  const common = { duration: 0.5, looping: false, autoDestroy: true, worldSpace: true, emissionOverTime: new ConstantValue(0) };
  const parts = [
    new ParticleSystem({ ...common, emissionBursts: once(110),
      startLife: new IntervalValue(0.7, 1.7), startSpeed: new IntervalValue(6 * s, 26 * s), startSize: new IntervalValue(5 * s, 11 * s),
      startRotation: new IntervalValue(0, 6.28), startColor: new ColorRange(new Vector4(1, 0.95, 0.8, 1), new Vector4(1, 0.7, 0.35, 1)),
      shape: new SphereEmitter({ radius: 2.5 * s, thickness: 1 }), material: M.fire, renderMode: RenderMode.BillBoard,
      behaviors: [new ColorOverLife(grad([[1, 1, 0.85, 0], [1, 0.55, 0.12, 0.3], [0.45, 0.1, 0.03, 1]], [[1, 0], [0.9, 0.5], [0, 1]])),
        new SizeOverLife(curve(0.5, 1.5, 2.2, 2.6))] }),
    new ParticleSystem({ ...common, emissionBursts: once(70),
      startLife: new IntervalValue(3, 5.5), startSpeed: new IntervalValue(3 * s, 12 * s), startSize: new IntervalValue(8 * s, 15 * s),
      startRotation: new IntervalValue(0, 6.28), startColor: new ColorRange(new Vector4(0.2, 0.18, 0.17, 0.9), new Vector4(0.33, 0.3, 0.28, 0.9)),
      shape: new SphereEmitter({ radius: 3 * s, thickness: 1 }), material: M.smoke, renderMode: RenderMode.BillBoard,
      behaviors: [new ColorOverLife(grad([[1, 0.5, 0.25, 0], [1, 1, 1, 0.2], [1, 1, 1, 1]], [[0, 0], [1, 0.1], [0.6, 0.6], [0, 1]])),
        new SizeOverLife(curve(0.4, 1.4, 2.4, 3.2)), new ApplyForce(new QV3(0, 1, 0), new ConstantValue(3))] }),
    new ParticleSystem({ ...common, emissionBursts: once(90),
      startLife: new IntervalValue(0.8, 2.2), startSpeed: new IntervalValue(25 * s, 70 * s), startSize: new IntervalValue(0.35, 0.8),
      startColor: new ColorRange(new Vector4(1, 0.9, 0.6, 1), new Vector4(1, 0.6, 0.2, 1)),
      shape: new PointEmitter(), material: M.flame, renderMode: RenderMode.BillBoard,
      behaviors: [new ApplyForce(new QV3(0, -1, 0), new ConstantValue(22)), new ColorOverLife(grad([[1, 1, 1, 0], [1, 0.4, 0.1, 1]], [[1, 0], [0, 1]]))] }),
  ];
  for (const ps of parts) { ps.emitter.position.copy(pos); addPS(ps); setTimeout(() => killPS(ps), 7000); }
  flash.position.copy(pos); flash.intensity = big ? 9000 : 5000; shake = REDUCE ? 0 : 0.9;
}

// ── Модели ракет ──
// Р-7 (пакет): центральный блок с «талией» и боковые конические блоки ~19 м; общая длина 31,4 м со срезом сопел.
function sopla(parent, list, out) {
  for (const [x, z, rExit, len, steer] of list) {
    const n = mesh(nozzleGeo(rExit, len), M.nozzle, false); n.position.set(x, 0, z); parent.add(n);
    const core = new THREE.Mesh(new THREE.ConeGeometry(rExit * 0.9, 5 * len, 12, 1, true), M.core);
    core.position.set(x, -len - 2.5 * len, z); core.rotation.x = Math.PI; core.visible = false; parent.add(core);
    const halo = new THREE.Sprite(M.halo); halo.position.set(x, -len - 0.5, z); halo.visible = false; halo.size = rExit * 13; parent.add(halo);   // ореол у среза сопла
    const ps = flamePS(rExit / 0.42); ps.emitter.position.set(x, -len, z); addPS(ps, parent);
    out.push({ ps, core, halo, steer, rExit });
  }
}
function makePack() {
  const g = new THREE.Group(), noz = [], sides = [];
  // Центральный блок «А»: хвост 0 м, «талия» под боковыми блоками, пояс на 17 м, головная часть до 29,9 м.
  const A = mesh(lathe([[0, 0], [1.02, 0], [1.07, 0.5], [1.07, 13.8], [1.2, 16.2], [1.47, 18.6], [1.47, 22.6], [1.36, 23.6], [1.22, 24.2],
    [1.05, 25.4], [0.78, 26.9], [0.48, 28.3], [0.24, 29.3], [0.07, 29.85], [0, 29.9]]), M.body);
  g.add(A);
  const tail = mesh(new THREE.CylinderGeometry(1.08, 1.04, 1.2, 40), M.bodyDark); tail.position.y = 0.6; g.add(tail);
  const belt = mesh(new THREE.TorusGeometry(1.33, 0.12, 8, 40), M.bodyDark); belt.rotation.x = Math.PI / 2; belt.position.y = 17.4; g.add(belt);
  const band = mesh(new THREE.CylinderGeometry(1.48, 1.48, 0.5, 40), M.bodyDark); band.position.y = 22.3; g.add(band);
  // РД-108: 4 основные камеры и 4 рулевые (по диагоналям, между боковыми блоками).
  const cn = [];
  for (const [x, z] of [[0.38, 0.38], [-0.38, 0.38], [0.38, -0.38], [-0.38, -0.38]]) cn.push([x, z, 0.36, 1.5, false]);
  for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; cn.push([Math.cos(a) * 0.86, Math.sin(a) * 0.86, 0.16, 0.75, true]); }
  sopla(g, cn, noz);
  // Боковые блоки «Б»–«Д»: конус 19 м, низ прижат к центральному, нос упирается под пояс; РД-107 — 4 основные и 2 рулевые.
  const R0 = 2.42, TILT = Math.asin((R0 - 1.5) / 18.9);
  const sideGeo = lathe([[0, 0], [1.3, 0], [1.34, 0.5], [1.34, 3.2], [1.2, 6.5], [0.98, 10.2], [0.76, 13.4], [0.55, 15.8], [0.36, 17.3], [0.19, 18.3], [0.05, 18.9], [0, 19]]);
  for (let k = 0; k < 4; k++) {
    const phi = k * Math.PI / 2;
    const yaw = new THREE.Group(); yaw.position.set(Math.cos(phi) * R0, 0, Math.sin(phi) * R0); yaw.rotation.y = -phi; g.add(yaw);
    const b = new THREE.Group(); b.rotation.z = TILT; yaw.add(b);
    b.add(mesh(sideGeo, M.body));
    const t = mesh(new THREE.CylinderGeometry(1.35, 1.31, 1.0, 36), M.bodyDark); t.position.y = 0.5; b.add(t);
    const fin = mesh(new THREE.BoxGeometry(1.3, 1.1, 0.07), M.bodyDark); fin.position.set(1.85, 0.9, 0); b.add(fin);   // воздушный руль
    const list = [];
    for (const [x, z] of [[0.4, 0.4], [-0.4, 0.4], [0.4, -0.4], [-0.4, -0.4]]) list.push([x, z, 0.35, 1.45, false]);
    list.push([1.02, 0.62, 0.15, 0.7, true], [1.02, -0.62, 0.15, 0.7, true]);
    const bn = []; sopla(b, list, bn); noz.push(...bn);
    sides.push({ yaw, b, phi, noz: bn, tilt: TILT });
  }
  return { g, noz, sides, central: noz.slice(0, 8), kind: 'pack' };
}
// Ракета-башня (для сравнения): первая ступень снизу, вторая сверху — её надо зажечь в полёте.
function makeTower() {
  const g = new THREE.Group(), noz = [];
  const s1 = new THREE.Group(); g.add(s1);
  s1.add(mesh(lathe([[0, 0], [1.5, 0], [1.55, 0.5], [1.55, 15.6], [1.35, 16.6], [0, 16.6]]), M.body));
  const t = mesh(new THREE.CylinderGeometry(1.57, 1.57, 1.2, 40), M.bodyDark); t.position.y = 0.6; s1.add(t);
  const list = [];
  for (const [x, z] of [[0.5, 0.5], [-0.5, 0.5], [0.5, -0.5], [-0.5, -0.5]]) list.push([x, z, 0.4, 1.6, false]);
  for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; list.push([Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0.17, 0.75, true]); }
  sopla(s1, list, noz);
  const s2 = new THREE.Group(); s2.position.y = 16.6; g.add(s2);
  s2.add(mesh(lathe([[0, 0], [1.3, 0], [1.3, 0.3], [1.3, 8.4], [1.1, 9.4], [0.75, 11.2], [0.38, 12.6], [0.08, 13.3], [0, 13.4]]), M.body));
  const ring = mesh(new THREE.CylinderGeometry(1.33, 1.33, 0.6, 40), M.bodyDark); ring.position.y = 0.3; s2.add(ring);
  const n2 = []; sopla(s2, [[0, 0, 0.45, 1.2, false]], n2);   // сопло второй ступени — внутри переходника
  return { g, noz, s1, s2, n2, kind: 'tower' };
}

// ── Сцена ──
let renderer, scene, camera, controls, clock, world, R, sky, flash, padLight, shake = 0;
let rocket, st = { scheme: 'tower', drop: 'keep' }, phase = 'build', T = 0, follow = null, bodies = [], trusses = [];
let padSmoke = [], trail = null, vel = V(0, 0, 0), dropped = false, found = {}, ui;

function makeTruss() {
  // Ферма подвески: два пояса, распорки, «лапа» сверху. Шарнир внизу; длина 16,2 м.
  const L = 16.2, parts = [];
  for (const x of [-0.45, 0.45]) { const b = new THREE.BoxGeometry(0.22, L, 0.22); b.translate(x, L / 2, 0); parts.push(b); }
  for (let y = 0.8; y < L - 0.5; y += 1.35) {
    const h = new THREE.BoxGeometry(0.9, 0.12, 0.12); h.translate(0, y, 0); parts.push(h);
    const d = new THREE.BoxGeometry(0.1, 1.55, 0.1); d.rotateZ(((y / 1.35) | 0) % 2 ? 0.58 : -0.58); d.translate(0, y + 0.67, 0); parts.push(d);
  }
  const paw = new THREE.BoxGeometry(1.3, 0.7, 0.9); paw.translate(-0.4, L, 0); parts.push(paw);
  const cw = new THREE.BoxGeometry(1.4, 1.6, 1.2); cw.translate(0.7, 0.8, 0); parts.push(cw);   // противовес у шарнира
  return mesh(mergeGeometries(parts), M.steel);
}
function buildPad() {
  const ground = mesh(new THREE.PlaneGeometry(9000, 9000), M.steppe, false); ground.receiveShadow = true;
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; scene.add(ground);
  // Бетонный стол с проёмом над котлованом (11×11 м) и газоотводным лотком на запад.
  const H = 5.5;
  const slab = (w, d, x, z) => { const m = mesh(new THREE.BoxGeometry(w, 1, d), M.concrete); m.position.set(x, -0.5, z); m.castShadow = false; scene.add(m); };
  slab(90, 40 - H, 0, (40 + H) / 2); slab(90, 40 - H, 0, -(40 + H) / 2);
  slab(45 - H, 2 * H, (45 + H) / 2, 0); slab(45 - H - 14, 2 * H, -(45 + H + 14) / 2, 0);
  const pitMat = M.pit.clone(); pitMat.side = THREE.BackSide;   // котлован виден изнутри сквозь проём
  const pit = mesh(new THREE.BoxGeometry(2 * H + 14, 16, 2 * H), pitMat, false); pit.position.set(-7, -8.6, 0); scene.add(pit);
  // Опорное кольцо и четыре фермы между боковыми блоками.
  const ring = mesh(new THREE.TorusGeometry(6.6, 0.35, 8, 48), M.steel); ring.rotation.x = Math.PI / 2; ring.position.y = 0.25; scene.add(ring);
  for (let k = 0; k < 4; k++) {
    const phi = Math.PI / 4 + k * Math.PI / 2;
    const yaw = new THREE.Group(); yaw.position.set(Math.cos(phi) * 6.5, 0.3, Math.sin(phi) * 6.5); yaw.rotation.y = -phi; scene.add(yaw);
    const piv = new THREE.Group(); yaw.add(piv); piv.add(makeTruss());
    trusses.push(piv);
  }
  setTrusses(0);
  // Обваловка, бункер и мачты молниеотводов — для масштаба.
  const bunker = mesh(new THREE.SphereGeometry(9, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.steppe); bunker.scale.y = 0.35; bunker.position.set(110, 0, -70); scene.add(bunker);
  for (const [x, z] of [[-48, -36], [48, -36], [-48, 36], [48, 36]]) {
    const m = mesh(new THREE.CylinderGeometry(0.25, 0.7, 62, 6), M.steel); m.position.set(x, 31, z); scene.add(m);
  }
}
const TRUSS_CLOSED = Math.atan2(6.5 - 1.95, 15.4), TRUSS_OPEN = -0.62;
function setTrusses(t) { for (const p of trusses) p.rotation.z = TRUSS_CLOSED + (TRUSS_OPEN - TRUSS_CLOSED) * ease(t); }

function makeSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uAlt: { value: 0 }, uSun: { value: V(0.55, 0.42, 0.72).normalize() } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }',
    fragmentShader: `varying vec3 vD; uniform float uAlt; uniform vec3 uSun;
      void main(){ float h = max(vD.y, 0.0);
        vec3 hor = mix(vec3(0.86,0.88,0.86), vec3(0.42,0.5,0.66), uAlt);
        vec3 zen = mix(vec3(0.24,0.45,0.78), vec3(0.01,0.02,0.07), uAlt);
        vec3 c = mix(hor, zen, pow(h, 0.55));
        c += vec3(1.0,0.86,0.6) * pow(max(dot(vD, uSun), 0.0), 220.0) * 1.4 + vec3(1.0,0.8,0.55) * pow(max(dot(vD, uSun), 0.0), 8.0) * 0.18;
        if (vD.y < 0.0) c = mix(hor, vec3(0.55,0.5,0.4), min(-vD.y * 6.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  sky = new THREE.Mesh(new THREE.SphereGeometry(8000, 32, 16), mat); sky.frustumCulled = false; scene.add(sky);
}

// ── Ход игры ──
function say(t, cls) { const m = ui.msg; m.className = 'lab-msg' + (cls ? ' ' + cls : ''); m.textContent = t; }
function count(big, small) { ui.count.innerHTML = ''; if (!big) return; ui.count.textContent = big; if (small) { const s = document.createElement('small'); s.textContent = small; ui.count.prepend(s); } }
function lock(on) { for (const b of ui.root.querySelectorAll('#r3Ctrl .seg, #r3Go')) b.disabled = on; }
function award(k, n) { if (typeof window.award === 'function') window.award(k, n); }

function setFlames(list, level) {
  for (const n of list) {
    n.ps.emissionOverTime.value = level > 0 ? n.ps.nozzleRate * level : 0;
    n.core.visible = level > 0.3; n.level = level;
    n.halo.visible = level > 0; n.halo.scale.setScalar(n.halo.size * (0.6 + 0.4 * Math.min(level, 1.2)));
  }
}
function disposeRocket() {
  if (!rocket) return;
  for (const n of [...rocket.noz, ...(rocket.n2 || [])]) killPS(n.ps);
  rocket.g.removeFromParent();
}
// Сборка на глазах: блоки опускаются краном сверху и встают по местам.
let tweens = [];
function tween(dur, delay, fn, done) { tweens.push({ t: -delay, dur, fn, done }); }
function assemble(kind) {
  disposeRocket();
  rocket = kind === 'pack' ? makePack() : makeTower();
  scene.add(rocket.g); rocket.g.position.set(0, 0.3, 0);
  const parts = kind === 'pack' ? [] : [{ o: rocket.s1, d: 0 }, { o: rocket.s2, d: 0.45 }];
  if (kind === 'pack') { // пакет опускается целиком, боковые блоки подъезжают к центральному отдельно
    rocket.g.position.y = 40; tween(0.8, 0, (t) => { rocket.g.position.y = 0.3 + 39.7 * (1 - ease(t)); });
    rocket.sides.forEach((s, i) => {
      const p0 = s.yaw.position.clone(), out = V(Math.cos(s.phi) * 12, 9, Math.sin(s.phi) * 12);
      s.yaw.position.add(out);
      tween(0.7, 0.75 + i * 0.18, (t) => { s.yaw.position.copy(p0).addScaledVector(out, 1 - ease(t)); });
    });
  } else {
    for (const p of parts) { const y0 = p.o.position.y; p.o.position.y = y0 + 45; tween(0.8, p.d, (t) => { p.o.position.y = y0 + 45 * (1 - ease(t)); }); }
  }
  setTrusses(0.7); tween(0.6, kind === 'pack' ? 1.5 : 1.1, (t) => setTrusses(0.7 * (1 - t)));
}

const CMD = [['Ключ на старт', 10], ['Протяжка', 9], ['Продувка', 8], ['Ключ на дренаж', 7], ['Пуск', 6], ['Зажигание', 5],
  ['Предварительная', 4], ['Промежуточная', 3], ['Главная', 2], ['Подъём!', 0]];
let rapierP = null;
function needRapier() {
  if (!rapierP) rapierP = import('@dimforge/rapier3d-compat').then(async (m) => {
    R = m.default || m; await R.init();
    world = new R.World({ x: 0, y: -9.81, z: 0 });
    world.createCollider(R.ColliderDesc.cuboid(4000, 1, 4000).setTranslation(0, -1, 0).setFriction(0.8).setRestitution(0.15));
    return R;
  });
  return rapierP;
}
function pusk() {
  if (phase !== 'build') return;
  for (const tw of tweens) tw.fn(1);   // сборка ещё идёт — доводим её мгновенно, «Пуск» не теряется
  tweens = [];
  phase = 'count'; T = 0; lock(true); needRapier().catch((e) => console.warn('rapier', e));
  say('Обратный отсчёт. Смотри на сцену.');
}
function resetAll(msg) {
  for (const b of bodies) { if (world) world.removeRigidBody(b.body); b.obj.removeFromParent(); }
  bodies = []; follow = null; vel.set(0, 0, 0); dropped = false;
  for (const ps of padSmoke) killPS(ps); padSmoke = []; if (trail) { killPS(trail); trail = null; }
  if (rocket && rocket.s2Holder) rocket.s2Holder.removeFromParent();
  phase = 'build'; T = 0; ui.lastCmd = -1; count(''); padLight.intensity = 0; speedUp = 1; boomAt = null; slowMo = 1;
  assemble(st.scheme === 'pack' ? 'pack' : 'tower');
  sky.material.uniforms.uAlt.value = 0;
  camGoal = null; controls.target.set(0, 13, 0); camera.position.copy(camHome);
  lock(false); say(msg || 'Ракета на столе. Выбери, как её собрать, и нажми «Пуск».');
}

// Тело Rapier из части ракеты: её мировое положение, скорость полёта, вращение «наружу».
function toPhysics(obj, comLocal, shape, v, w, mass) {
  scene.updateMatrixWorld(true);
  const com = obj.localToWorld(comLocal.clone()), q = obj.getWorldQuaternion(new THREE.Quaternion());
  const holder = new THREE.Group(); holder.position.copy(com); holder.quaternion.copy(q); scene.add(holder);
  holder.add(obj); obj.position.copy(comLocal).negate(); obj.quaternion.identity();
  const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(com.x, com.y, com.z).setRotation(q)
    .setLinvel(v.x, v.y, v.z).setAngvel(w).setLinearDamping(0.02).setAngularDamping(0.05).setCanSleep(true));
  world.createCollider(shape.setMass(mass).setFriction(0.7).setRestitution(0.2), body);
  bodies.push({ body, obj: holder });
  return holder;
}
function debris(pos, v, n) {
  for (let i = 0; i < n; i++) {
    const big = Math.random() < 0.4, r = big ? 0.9 + Math.random() * 0.5 : 0.35 + Math.random() * 0.4, h = big ? 2 + Math.random() * 3 : 0.6 + Math.random();
    const m = mesh(new THREE.CylinderGeometry(r, r * (0.7 + Math.random() * 0.3), h, 9, 1, true, 0, Math.PI * (0.7 + Math.random())), i % 3 ? M.body : M.bodyDark);
    m.material = m.material.clone(); m.material.side = THREE.DoubleSide; m.material.color.multiplyScalar(0.55);   // обгоревшие куски
    const g = new THREE.Group(); g.add(m); g.position.copy(pos).add(V(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(4));
    scene.add(g);
    const d = g.position.clone().sub(pos).normalize().multiplyScalar(12 + Math.random() * 26).add(v);
    toPhysics(m, V(0, 0, 0), R.ColliderDesc.cylinder(h / 2, r), d, { x: (Math.random() - 0.5) * 9, y: (Math.random() - 0.5) * 9, z: (Math.random() - 0.5) * 9 }, big ? 400 : 60);
    g.removeFromParent();
  }
}

const TSEP = 11, T1 = 8.5;
let speedUp = 1, camGoal = null, boomAt = null, slowMo = 1;   // slowMo < 1 — замедление на разделении
function flight(dt) {
  T += dt;
  const r = rocket;
  if (phase === 'count') {
    const i = Math.min(CMD.length - 1, Math.floor(T / 0.62));
    if (ui.lastCmd !== i) { ui.lastCmd = i; count(CMD[i][0], CMD[i][1] ? `T − ${CMD[i][1]} с` : 'старт'); }
    if (i === 5 && !r.lit) { r.lit = 1; setFlames(r.kind === 'pack' ? r.noz : r.noz, 0.25); startPadSmoke(0.4); }
    if (i === 6 && r.lit === 1) { r.lit = 2; setFlames(r.noz, 0.5); }
    if (i === 8 && r.lit === 2) { r.lit = 3; setFlames(r.noz, 1); startPadSmoke(1); }
    padLight.intensity = (r.lit || 0) * 2200 * (0.85 + Math.random() * 0.3);
    if (i === 9) { phase = 'fly'; T = 0; trail = addPS(smokePS({ size: 3.5, life: [3.5, 5], speed: [4, 8], rate: 28, angle: 0.25, radius: 1.5, alpha: 0.55, rise: 0.6 }), r.g); trail.emitter.rotation.x = Math.PI / 2; trail.emitter.position.y = -3; }
    return;
  }
  // Подъём: ускорение растёт по мере выгорания топлива; с 5-й секунды ракета плавно наклоняется к востоку.
  if (phase === 'fly') {
    setTrusses(Math.min(1, T / 1.3) * 1 + 0.0);
    const a = 2.6 + 0.9 * T;
    vel.y += a * dt; const tilt = Math.max(0, Math.min(0.14, (T - 5) * 0.02));
    vel.x = vel.y * Math.sin(tilt);
    r.g.position.addScaledVector(vel, dt); r.g.rotation.z = -tilt;
    padLight.intensity = Math.max(0, 1 - r.g.position.y / 60) * 3000 * (0.85 + Math.random() * 0.3);
    if (T > 4) for (const ps of padSmoke) ps.emissionOverTime.value *= 0.985;
    const realT = Math.round(T * (r.kind === 'pack' ? 118 / TSEP : 100 / T1)), km = Math.round(r.g.position.y * (r.kind === 'pack' ? 50 / 330 : 45 / 210));
    count(`T + ${realT} с · высота ≈ ${km} км`, 'полёт · время и высота сжаты');
    if (r.kind === 'tower' && T >= T1) towerFail();
    if (r.kind === 'pack' && T >= TSEP) (st.drop === 'drop' ? separate() : keepFail());
    return;
  }
  if (phase === 'tower2') {           // вторая ступень пытается зажечься в полёте
    r.s2Holder.position.addScaledVector(vel, dt); vel.y -= 9.81 * dt;
    if (T > 0.8 && !r.spark) { r.spark = 1; setFlames(r.n2, 0.7); }
    if (T > 1.15 && r.spark === 1) { r.spark = 2; setFlames(r.n2, 0); }
    if (T > 1.5 && r.spark === 2) { r.spark = 3; setFlames(r.n2, 1.2); }
    if (T > 1.75 && r.spark === 3) {
      r.spark = 4; const p = r.s2Holder.localToWorld(V(0, 5, 0));
      boom(p, false); killPS(r.n2[0].ps); r.s2Holder.removeFromParent(); debris(p, vel, SLAB ? 8 : 14);
      follow = () => p; phase = 'end'; T = 0;
      found.s = 1; award('why0', 10); setFound();
      count('Авария', 'вторая ступень');
      say('Первая ступень отработала, и вторую надо зажечь высоко в небе. Здесь это и сорвалось: зажигание в полёте не прошло, ступень разрушилась. В пакете Королёва все двигатели запускаются ещё на земле, «а не в полёте», и отказ виден на старте.', 'bad');
    }
    return;
  }
  if (phase === 'sep') {               // центральный блок уходит вверх, боковые кувыркаются в Rapier
    // Первые 4 с тяжесть тянет одинаково и блок, и сброшенные боковые: они расходятся наружу «крестом», потом блок уходит.
    vel.y += (T < 4 ? 1.5 + 1.5 * T - 9.81 : 12 + T) * dt; r.g.position.addScaledVector(vel, dt);
    sky.material.uniforms.uAlt.value = Math.min(1, 0.55 + T * 0.04);
    if (T > 3.2 && !r.told) {
      r.told = 1; award('lab', 30); count('Пакет разделился', 'боковые блоки сброшены');
      say('Дошла! Пакет, все двигатели зажжены на земле, пустые боковые блоки сброшены «крестом Королёва». Так 21 августа 1957 года головная часть дошла до полигона Кура на Камчатке. Честная оговорка: в плотных слоях атмосферы она разрушилась, её доводили дальше. Сам полёт до Камчатки — на схеме в первой игре.', 'ok');
    }
    if (T > 9) { phase = 'end'; follow = null; for (const n of r.central) n.ps.emissionOverTime.value *= 0.5; }
    return;
  }
  if (phase === 'tumble') {            // пакет с пустыми баками валится и падает (ускоренно ×3)
    const b = bodies[0]; if (b && b.body.translation().y < 16 && !boomAt) {
      const p = V(b.body.translation().x, 2, b.body.translation().z); boomAt = p;
      boom(p, true); for (const n of r.noz) killPS(n.ps); if (trail) { killPS(trail); trail = null; }
      world.removeRigidBody(b.body); b.obj.removeFromParent(); bodies.shift(); debris(V(p.x, 6, p.z), V(0, 8, 0), SLAB ? 10 : 18);
      follow = () => p; phase = 'end'; speedUp = 1;
      found.d = 1; award('why1', 10); setFound();
      count('Падение', 'ракета не долетела');
      say('Топливо в боковых блоках кончилось, а ракета тащит их пустые баки дальше. Мёртвый вес съедает скорость: ракета зависла, свалилась набок и упала. До Камчатки не хватило. У Р-7 две ступени: боковые блоки отработали и отделились.', 'bad');
    }
  }
}
function setFound() { ui.found.textContent = 'Найдено причин неудачи: ' + Object.keys(found).length + ' из 2.'; }
// Rapier грузится по «Пуску»; ответ, пришедший после «Начать заново», — уже не к этой ракете.
function ready(fn) { const r = rocket; const go = (no) => { if (rocket === r) fn(no); }; if (world) go(); else needRapier().then(() => go()).catch(() => go(true)); }

function towerFail() {
  const r = rocket; phase = 'wait';
  setFlames(r.noz, 0); if (trail) trail.emissionOverTime.value = 0;
  ready((no) => {
    if (no) { phase = 'end'; return; }
    // Первая ступень отделилась и падает; вторая летит по инерции.
    const v = vel.clone();
    r.s2Holder = new THREE.Group(); scene.updateMatrixWorld(true);
    r.s2.getWorldPosition(r.s2Holder.position); r.s2.getWorldQuaternion(r.s2Holder.quaternion); scene.add(r.s2Holder);
    r.s2Holder.add(r.s2); r.s2.position.set(0, 0, 0); r.s2.quaternion.identity();
    follow = () => r.s2Holder.position.clone().add(V(0, 5, 0));
    toPhysics(r.s1, V(0, 8, 0), R.ColliderDesc.cylinder(8.3, 1.55), V(v.x, v.y - 3, v.z), { x: 0.35, y: 0, z: 0.25 }, 9000);
    phase = 'tower2'; T = 0; count('Первая ступень отработала', 'зажигание второй — в полёте');
  });
}
function separate() {
  const r = rocket; phase = 'wait';
  for (const s of r.sides) setFlames(s.noz, 0);
  ready((no) => {
    if (no) { phase = 'sep'; T = 0; return; }
    for (const s of r.sides) {
      // Нос блока отходит наружу, блок кувыркается назад и в сторону — с земли это «крест Королёва».
      const out = V(Math.cos(s.phi), 0, Math.sin(s.phi)).applyAxisAngle(V(0, 0, 1), r.g.rotation.z);
      const w = V(Math.sin(s.phi), 0, -Math.cos(s.phi)).multiplyScalar(0.85);
      const h = toPhysics(s.b, V(0, 7, 0), R.ColliderDesc.cone(9.5, 1.3), vel.clone().addScaledVector(out, 5).add(V(0, -1.5, 0)), w.multiplyScalar(1.7), 6000);
      const puff = addPS(smokePS({ size: 2.2, life: [1.2, 2.2], speed: [5, 9], rate: 0, angle: 0.4, radius: 0.3, alpha: 0.8, rise: 0 }));
      puff.emissionBursts.push({ time: 0, count: new ConstantValue(18), cycle: 1, interval: 0.01, probability: 1 });
      puff.looping = false; puff.emitter.position.copy(h.localToWorld(V(0, 10, 0))); setTimeout(() => killPS(puff), 4000);
    }
    phase = 'sep'; T = 0; dropped = true; follow = () => rocket.g.position.clone().add(V(0, 2, 0));
    if (!dragging) camGoal = V(22, -64, 26).multiplyScalar(camera.aspect < 1 ? 1.5 : 1);   // снизу вдоль оси: так с земли и видели «крест»
    slowMo = REDUCE ? 1 : 0.4;
    count('T + 118 с · разделение', 'боковые блоки уходят');
  });
}
function keepFail() {
  const r = rocket; phase = 'wait';
  for (const s of r.sides) setFlames(s.noz, 0);
  ready((no) => {
    if (no) { phase = 'end'; return; }
    count('Боковые блоки пустые', 'но их везут дальше');
    // Пакет целиком становится телом Rapier: скорость тает, ракету кладёт набок.
    const g = r.g; const v = vel.clone().multiplyScalar(0.55);
    toPhysics(g, V(0, 12, 0), R.ColliderDesc.cylinder(15, 3.2), v, { x: 0.05, y: 0, z: -0.42 }, 120000);
    follow = () => bodies[0] ? bodies[0].obj.position.clone() : g.position;
    phase = 'tumble'; speedUp = 3; boomAt = null;
  });
}
function startPadSmoke(level) {
  if (!padSmoke.length) {
    // Клубы из котлована по кругу и струя из газоотводного лотка на запад.
    const ring = addPS(smokePS({ size: 10, life: [4, 7], speed: [9, 17], rate: 30, angle: 1.35, radius: 4, alpha: 0.85, rise: 1.8 }));
    ring.emitter.position.set(0, 1, 0); ring.emitter.rotation.x = -Math.PI / 2;
    const duct = addPS(smokePS({ size: 11, life: [4.5, 8], speed: [24, 38], rate: 34, angle: 0.3, radius: 3, alpha: 0.85, rise: 3 }));
    duct.emitter.position.set(-16, 0.5, 0); duct.emitter.rotation.order = 'YXZ'; duct.emitter.rotation.y = -Math.PI / 2; duct.emitter.rotation.x = -0.25;
    padSmoke = [ring, duct];
  }
  for (const ps of padSmoke) ps.emissionOverTime.value = (ps === padSmoke[0] ? 30 : 34) * Math.max(K, 0.7) * level;
}

// ── Цикл ──
let camHome, dragging = false, visible = true, fps = { n: 0, t: 0 }, prevTarget = V(0, 13, 0);
function loop() {
  if (!visible) return;
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 1 / 20) * slowMo;
  if (slowMo < 1 && phase === 'sep' && T > 1.6) slowMo = Math.min(1, slowMo + 0.006);
  for (const tw of tweens) { tw.t += dt; if (tw.t >= 0) tw.fn(Math.min(1, tw.t / tw.dur)); }
  tweens = tweens.filter((tw) => tw.t < tw.dur);
  if (phase !== 'build') flight(dt);
  if (world && bodies.length) {
    for (let i = 0; i < speedUp; i++) { world.timestep = dt; world.step(); }
    for (const b of bodies) { const p = b.body.translation(), q = b.body.rotation(); b.obj.position.set(p.x, p.y, p.z); b.obj.quaternion.set(q.x, q.y, q.z, q.w); }
  }
  // Камера: следим за ракетой, сохраняя угол, который выбрал посетитель.
  const goal = follow ? follow() : (phase === 'build' ? V(0, 13, 0) : null);
  if (goal) {
    const d = goal.clone().sub(prevTarget).multiplyScalar(phase === 'build' ? 0.08 : 0.25);
    controls.target.add(d); camera.position.add(d); prevTarget.copy(controls.target);
  }
  if (camGoal && !dragging) {
    const off = camera.position.clone().sub(controls.target); off.lerp(camGoal, phase === 'sep' ? 0.07 : 0.035); camera.position.copy(controls.target).add(off);
    if (off.distanceTo(camGoal) < 0.5) camGoal = null;
  }
  for (const n of rocket ? rocket.noz.concat(rocket.n2 || []) : []) if (n.core.visible) { const f = 0.85 + Math.random() * 0.3; n.core.scale.set(f, (0.8 + Math.random() * 0.4) * (n.level || 1), f); n.halo.scale.setScalar(n.halo.size * f * (0.6 + 0.4 * Math.min(n.level, 1.2))); }
  flash.intensity *= 0.86; if (shake > 0.01) { camera.position.add(V(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(shake)); shake *= 0.9; }
  const alt = rocket ? rocket.g.position.y : 0;
  if (phase === 'fly') sky.material.uniforms.uAlt.value = Math.min(0.55, alt / 600);
  scene.fog.far = 2600 + Math.max(alt, controls.target.y) * 5;
  controls.maxPolarAngle = phase === 'build' || phase === 'count' ? Math.PI * 0.485 : Math.PI * 0.94;   // на столе — не под землю
  controls.update();
  batch.update(dt);
  renderer.render(scene, camera);
  fps.n++; fps.t += dt; if (fps.t >= 1) { window.__r7fps = Math.round(fps.n / fps.t); fps.n = 0; fps.t = 0; }
}

export async function zapusk(root) {
  const stage = root.querySelector('#r3Stage');
  ui = { root, msg: root.querySelector('#r3Msg'), count: root.querySelector('#r3Count'), found: root.querySelector('#r3Found') };
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, SLAB ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.tabIndex = 0; renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.appendChild(renderer.domElement);
  scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xd9ddd8, 260, 2600);
  const w = stage.clientWidth, h = stage.clientHeight;
  camera = new THREE.PerspectiveCamera(w < h ? 50 : 40, w / h, 0.5, 20000);
  camHome = w < h ? V(30, 14, 46) : V(34, 11, 38);
  camera.position.copy(camHome);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 13, 0); controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 12; controls.maxDistance = 160; controls.maxPolarAngle = Math.PI * 0.94;
  controls.addEventListener('start', () => { dragging = true; camGoal = null; });
  controls.addEventListener('end', () => { dragging = false; });
  clock = new THREE.Clock();
  scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x8a7550, 1.25));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.8); sun.position.set(55, 75, 35); sun.castShadow = true;
  sun.shadow.mapSize.set(SLAB ? 1024 : 2048, SLAB ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 45, bottom: -25, near: 10, far: 220 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.04;
  scene.add(sun);
  padLight = new THREE.PointLight(0xff9a40, 0, 140, 1.6); padLight.position.set(0, -1, 0); scene.add(padLight);
  flash = new THREE.PointLight(0xffb060, 0, 400, 1.4); scene.add(flash);
  batch = new BatchedRenderer(); scene.add(batch);
  makeSky(); buildPad();
  assemble('tower');
  const resize = () => { const W = stage.clientWidth, H = stage.clientHeight; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); };
  resize(); new ResizeObserver(resize).observe(stage);
  new IntersectionObserver((es) => { const v = es[0].isIntersecting; if (v && !visible) { visible = true; clock.getDelta(); loop(); } visible = v; }).observe(stage);
  // Кнопки под сценой.
  const segs = root.querySelectorAll('#r3Ctrl .seg');
  segs.forEach((b) => b.addEventListener('click', () => {
    if (phase !== 'build') return;
    const k = b.dataset.k, v = b.dataset.v; const was = st[k];
    root.querySelectorAll(`#r3Ctrl .seg[data-k="${k}"]`).forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    st[k] = v === 'tandem' ? 'tower' : v;
    if (k === 'scheme' && was !== st[k]) { assemble(st.scheme); say(st.scheme === 'pack' ? 'Пакет: четыре боковых блока встали вокруг центрального. Все 32 сопла зажгутся ещё на земле.' : 'Башня: вторая ступень стоит на первой. Её двигатель придётся зажигать в полёте.'); }
    if (k === 'drop') say(v === 'drop' ? 'Пустые боковые блоки будут сброшены на высоте.' : 'Пустые боковые блоки полетят с ракетой до конца.');
  }));
  root.querySelector('#r3Go').addEventListener('click', pusk);
  root.querySelector('#r3Reset').addEventListener('click', () => {
    st = { scheme: 'tower', drop: 'keep' };
    segs.forEach((x) => x.setAttribute('aria-pressed', x.dataset.v === 'tandem' || x.dataset.v === 'keep' ? 'true' : 'false'));
    resetAll('Ракета снова на столе. Уже полученные баллы сохраняются и повторно не начисляются.');
  });
  root.querySelector('#r3Ctrl').hidden = false;
  root.setAttribute('data-sostoyanie', 'gotovo');
  root.querySelector('#r3Hint').textContent = 'Крути сцену пальцем или мышью, двумя пальцами или колёсиком — ближе.';
  say('Ракета на столе, пока башней. Выбери, как её собрать, и нажми «Пуск».');
  loop();
  window.__r7 = { st: () => ({ phase, T }), pick: (k, v) => root.querySelector(`#r3Ctrl .seg[data-k="${k}"][data-v="${v}"]`).click() };
}

/* Сборка (из корня rc-site, esbuild — во временной папке, в сайт не ставится):
   node /tmp/r495/build/build.mjs — бандл ESM с разделением: scena.js (three + three.quarks + сцена),
   чанк Rapier (@dimforge/rapier3d-compat) грузится по «Пуску»; WASM вынесен из base64 в rapier.wasm. */
