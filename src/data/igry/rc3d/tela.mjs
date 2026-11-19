// rc3d · Тела сцены из простых форм. Размеры — в метрах, углы — в градусах.
// Типы: group, cylinder, cone, box, sphere, torus, lathe (профиль [[r,y]…]), tube (по точкам), truss (ферма),
// cloth (купол "dome" или полотнище "sheet", с раскрытием open 0…1), liquid (светящийся поток по трубе, fill 0…1),
// dot (светящаяся точка), light (точечный свет), globe и route (земной шар Natural Earth и дуга пути — отдельный чанк).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { material } from './materialy.mjs';
import { texGlow, texBubbles } from './tekstury.mjs';
import { buildModel } from './modeli.mjs';
import { wingGeo, wiresGeo, propellerGeo, wheelGeos, forest } from './detali.mjs';

const D = Math.PI / 180;
const v3 = (a, d = [0, 0, 0]) => new THREE.Vector3().fromArray(a || d);
const ease = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

// Ферма: пояса (2, 3 или 4) и раскосы зигзагом, вдоль оси Y от 0 до h. Можно задать from/to — повернётся сама.
function trussGeo(o) {
  const h = o.h ?? 10, w = o.w ?? 1, bar = o.bar ?? Math.max(0.04, w * 0.12), step = o.step ?? w * 1.2, n = o.chords ?? 2, parts = [];
  const pts = n === 2 ? [[-w / 2, 0], [w / 2, 0]] : n === 3 ? [0, 1, 2].map((k) => [Math.cos(k * 2.094) * w / 1.73, Math.sin(k * 2.094) * w / 1.73]) : [[-w / 2, -w / 2], [w / 2, -w / 2], [w / 2, w / 2], [-w / 2, w / 2]];
  for (const [x, z] of pts) { const b = new THREE.BoxGeometry(bar, h, bar); b.translate(x, h / 2, z); parts.push(b); }
  const faces = n === 2 ? [[0, 1]] : pts.map((_, i) => [i, (i + 1) % pts.length]);
  const steps = Math.max(1, Math.round(h / step)), dy = h / steps;
  for (const [i, j] of faces) {
    const A = pts[i], B = pts[j];
    for (let s = 0; s <= steps; s++) {
      const y = s * dy, a = new THREE.Vector3(A[0], y, A[1]), b = new THREE.Vector3(B[0], y, B[1]);
      parts.push(barBetween(a, b, bar * 0.7));
      if (s < steps) { const up = s % 2 ? [a, new THREE.Vector3(B[0], y + dy, B[1])] : [b, new THREE.Vector3(A[0], y + dy, A[1])]; parts.push(barBetween(up[0], up[1], bar * 0.6)); }
    }
  }
  return mergeGeometries(parts);
}
function barBetween(a, b, t) {
  const L = a.distanceTo(b), g = new THREE.BoxGeometry(t, L, t);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()));
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); return g;
}

// Точки пути: явный список "points" или генератор — "helix" (пружина, спираль) и "snake" (змеевик петлями).
export function pathPoints(o) {
  if (o.points) return o.points;
  if (o.helix) { const { r = 0.5, h = 1, turns = 5, n = 24 } = o.helix, out = []; for (let i = 0; i <= turns * n; i++) { const a = i / n * 6.2832; out.push([Math.cos(a) * r, i / (turns * n) * h, Math.sin(a) * r]); } return out; }
  if (o.snake) {   // петли в плоскости XY: ряды длиной w, шаг между рядами step, n рядов; z — смещение
    const { n = 8, w = 3, step = 0.3, z = 0, r = step / 2 } = o.snake, out = [];
    for (let i = 0; i < n; i++) { const y = i * step, a = i % 2 ? w / 2 : -w / 2, b = -a; out.push([a, y, z], [b, y, z]); if (i < n - 1) out.push([b + Math.sign(b) * r, y + step / 2, z]); }
    return out;
  }
  return [[0, 0, 0], [0, 1, 0]];
}
function curveOf(o) {
  const pts = pathPoints(o).map((p) => v3(p));
  if (o.curve === 'straight') { const c = new THREE.CurvePath(); for (let i = 1; i < pts.length; i++) c.add(new THREE.LineCurve3(pts[i - 1], pts[i])); return c; }
  return new THREE.CatmullRomCurve3(pts, !!o.closed, 'catmullrom', o.tension ?? 0.5);
}
function tubeGeo(o) {
  const c = curveOf(o), L = c.getLength(), seg = o.seg ?? Math.max(16, Math.round(L * 3));
  const g = new THREE.TubeGeometry(c, Math.min(seg, 600), o.r ?? 0.2, o.radial ?? 10, !!o.closed);
  g.userData = { len: L, seg: Math.min(seg, 600), radial: o.radial ?? 10, r: o.r ?? 0.2 };
  if (o.cut || o.window) cutTube(g, c, o);
  return g;
}
// Разрез трубы, чтобы видеть поток внутри: "cut":120 — продольный вырез сверху шириной 120° (или [от,до] — доли длины),
// "window":{"every":12,"len":1.2,"deg":120} — смотровые окна сверху через каждые every метров.
function cutTube(g, c, o) {
  const d = g.userData, idx = g.index.array, pos = g.attributes.position.array, keep = [], up = new THREE.Vector3(0, 1, 0);
  const cut = o.cut ? (Array.isArray(o.cut) ? { deg: o.cutDeg ?? 120, from: o.cut[0], to: o.cut[1] } : { deg: o.cut, from: 0, to: 1 }) : null;
  const W = o.window ? { every: o.window.every ?? 10, len: o.window.len ?? 1, deg: o.window.deg ?? 120 } : null;
  const ctr = Array.from({ length: d.seg + 1 }, (_, j) => c.getPointAt(j / d.seg)), v = new THREE.Vector3();
  for (let t = 0; t < idx.length; t += 3) {
    const tri = [idx[t], idx[t + 1], idx[t + 2]], j = Math.floor(tri[0] / (d.radial + 1)), u = j / d.seg, s = u * d.len;
    v.set(0, 0, 0); for (const k of tri) v.add(new THREE.Vector3(pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2])); v.divideScalar(3).sub(ctr[Math.min(j, d.seg)]).normalize();
    const ang = Math.acos(Math.max(-1, Math.min(1, v.dot(up)))) * 2 / D;
    let open = false;
    if (cut && u >= cut.from && u <= cut.to && ang < cut.deg) open = true;
    if (W && (s % W.every) < W.len && s > W.len && ang < W.deg) open = true;
    if (!open) keep.push(...tri);
  }
  g.setIndex(keep); d.cut = true;
}

// Купол парашюта / полотнище: вершины пересчитываются каждый кадр по open (0 — уложен, 1 — раскрыт) и времени.
class Cloth {
  constructor(o, mat) {
    this.o = o; this.open = o.open ?? 1; this.t = 0;
    if ((o.shape || 'dome') === 'dome') {
      const R = o.r ?? 3, H = o.h ?? R * 0.75, gores = o.gores ?? 16, M = 14, A = gores * 4;
      const prof = []; const phiMax = (o.phi ?? 80) * D;
      const f0 = o.vent ? Math.asin(Math.min(0.9, o.vent / R)) : 0;   // полюсное отверстие купола
      for (let i = 0; i <= M; i++) { const f = f0 + i / M * (phiMax - f0); prof.push(new THREE.Vector2(Math.max(0.001, R * Math.sin(f)), H * Math.cos(f) - H * Math.cos(phiMax))); }
      this.geo = new THREE.LatheGeometry(prof, A);
      this.base = this.geo.attributes.position.array.slice();
      this.M = M; this.A = A; this.R = R; this.H = H; this.gores = gores;
      this.mesh = new THREE.Mesh(this.geo, mat); this.mesh.castShadow = true;
      if (mat.normalMap && mat.userData.kind === 'silk') { mat.normalMap = mat.normalMap.clone(); mat.normalMap.repeat.set(gores, 1); }   // швы — между клиньями
      this.g = new THREE.Group(); this.g.add(this.mesh);
      // Стропы: от кромки купола к точке сбора внизу.
      const nl = o.lines?.n ?? gores, L = o.lines?.length ?? R * 1.6;
      if (o.lines !== false) {
        this.lineGeo = new THREE.BufferGeometry(); this.lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(nl * 6), 3));
        this.lines = new THREE.LineSegments(this.lineGeo, new THREE.LineBasicMaterial({ color: o.lines?.color || 0x6b6255 })); this.g.add(this.lines);
        this.nl = nl; this.L = L; this.to = o.lines?.to;   // to: [[x,y,z],…] — точки сбора строп (пучки); стропы делятся по секторам
      }
    } else {
      const w = o.w ?? 2, h = o.h ?? 1.4;
      this.geo = new THREE.PlaneGeometry(w, h, 24, 8); this.geo.translate(w / 2, 0, 0);   // кромка у древка — x = 0
      this.base = this.geo.attributes.position.array.slice(); this.w = w;
      this.mesh = new THREE.Mesh(this.geo, mat); this.mesh.castShadow = true;
      this.g = new THREE.Group(); this.g.add(this.mesh);
    }
    this.update(0);
  }
  update(dt) {
    this.t += dt;
    const p = this.geo.attributes.position, a = p.array, b = this.base, u = ease(this.open), t = this.t, o = this.o;
    if (this.R) {
      // Уложенный купол — длинная узкая «колбаса» над стропами; раскрываясь, он укорачивается и надувается.
      const rs = 0.05 + 0.95 * Math.pow(u, 0.8), ys = 1 + (1 - u) * (o.stretch ?? 1.8);
      const wob = (o.wobble ?? 1) * u;
      for (let i = 0; i < a.length; i += 3) {
        const x = b[i], y = b[i + 1], z = b[i + 2], th = Math.atan2(z, x);
        const sc = 1 - 0.08 * u * (1 - Math.abs(Math.cos(this.gores * th / 2)));   // фестоны между стропами
        const br = 1 + 0.035 * wob * Math.sin(t * 2.6 + th * 3) + 0.02 * wob * Math.sin(t * 5.1);
        a[i] = x * rs * sc * br; a[i + 2] = z * rs * sc * br; a[i + 1] = y * ys * (1 + 0.03 * wob * Math.sin(t * 2.6 + 1));
      }
      if (this.lines) {
        const l = this.lineGeo.attributes.position.array, rim = this.R * Math.sin((o.phi ?? 80) * D) * rs;
        for (let k = 0; k < this.nl; k++) {   // lines.rot — поворот секторов (пучки слева/справа, а не спереди/сзади)
          const th = k / this.nl * 6.283 + (o.lines?.rot ?? 0) * D, end = this.to ? this.to[Math.floor(k / this.nl * this.to.length)] : [0, -this.L * (0.6 + 0.4 * u), 0];
          l.set([Math.cos(th) * rim, 0, Math.sin(th) * rim, ...end], k * 6);
        }
        this.lineGeo.attributes.position.needsUpdate = true; this.lineGeo.computeBoundingSphere();
      }
    } else {
      const amp = (o.wave ?? 0.12) * u, sp = o.speed ?? 3;
      for (let i = 0; i < a.length; i += 3) { const x = b[i], k = x / this.w; a[i] = x * (0.04 + 0.96 * u); a[i + 2] = amp * Math.sin(x * 2.2 - t * sp) * k * this.w + (1 - u) * 0.03 * Math.sin(b[i + 1] * 9); }
    }
    p.needsUpdate = true; this.geo.computeVertexNormals(); this.geo.computeBoundingSphere();
  }
}

// Поток по трубе: трубка с бегущими полосами; fill — доля длины, уже заполненная от начала.
class Flow {
  constructor(o, mat) {
    this.geo = tubeGeo({ ...o, r: o.r ?? 0.22 });
    this.mesh = new THREE.Mesh(this.geo, mat); this.mesh.renderOrder = 2;
    this.mat = mat; this.speed = o.speed ?? 1.5; this.fill = o.fill ?? 0;
    mat.map.repeat.set(this.geo.userData.len / (o.stripe ?? 2), 1);
    // Цвет по длине: color → color2 (чёрная нефть на входе светлеет к выходу).
    if (o.color2) {
      const c1 = new THREE.Color(o.color || '#ff8a2a'), c2 = new THREE.Color(o.color2), n = this.geo.attributes.position.count, uv = this.geo.attributes.uv, cols = new Float32Array(n * 3), c = new THREE.Color();
      for (let i = 0; i < n; i++) { c.lerpColors(c1, c2, uv.getX(i)); cols.set([c.r, c.g, c.b], i * 3); }
      this.geo.setAttribute('color', new THREE.BufferAttribute(cols, 3)); mat.vertexColors = true; mat.color.set(0xffffff);
    }
    if (o.style === 'bubbles') { mat.map = texBubbles().clone(); mat.map.needsUpdate = true; mat.map.repeat.set(this.geo.userData.len / (o.stripe ?? 1.2), 1); }
    this.update(0);
  }
  update(dt) {
    const d = this.geo.userData; this.mat.map.offset.x -= dt * this.speed / 2;
    this.geo.setDrawRange(0, Math.round(Math.max(0, Math.min(1, this.fill)) * d.seg) * d.radial * 6);
  }
}

// Человек из простых тел (рост h, по умолчанию 1,75 м): ноги, туловище, руки на шарнирах, голова, головной убор.
// Цвета: coat (одежда), pants, skin, hat; hat: "cap" (фуражка), "helmet" (кожаный шлем), "none"; pose — см. POSES.
export const POSES = {
  stand: { la: [0, 0, 8], ra: [0, 0, -8], ll: [0, 0, 0], rl: [0, 0, 0] },
  'arms-up': { la: [0, 0, 160], ra: [0, 0, -160], ll: [0, 0, 0], rl: [0, 0, 0] },
  'arms-forward': { la: [-80, 0, 5], ra: [-80, 0, -5], ll: [0, 0, 0], rl: [0, 0, 0] },
  spread: { la: [0, 0, 100], ra: [0, 0, -100], ll: [0, 0, 18], rl: [0, 0, -18] },
  sit: { la: [-30, 0, 8], ra: [-30, 0, -8], ll: [-90, 0, 0], rl: [-90, 0, 0] },
  kneel: { la: [-20, 0, 10], ra: [-20, 0, -10], ll: [90, 0, 0], rl: [90, 0, 0] },
  wave: { la: [0, 0, 8], ra: [0, 0, -150], ll: [0, 0, 0], rl: [0, 0, 0] },
};
function person(o) {
  const k = (o.h ?? 1.75) / 1.75, g = new THREE.Group(), mats = [];
  const M = (spec) => { const m = material(spec); mats.push(m); return m; };
  const coat = M(o.coat || 'fabric:#5b6148'), pants = M(o.pants || 'fabric:#3b3a36'), skin = M(o.skin || 'paint:#d9a988'), hatM = M(o.hatColor ? 'paint:' + o.hatColor : 'paint:#2c2f2a');
  const add = (parent, geo, m, x, y, z) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = true; parent.add(me); return me; };
  const piv = {};
  for (const [n, x] of [['ll', -0.1], ['rl', 0.1]]) { const p = new THREE.Group(); p.position.set(x * k, 0.9 * k, 0); g.add(p); add(p, new THREE.CylinderGeometry(0.075 * k, 0.06 * k, 0.88 * k, 10), pants, 0, -0.44 * k, 0); add(p, new THREE.BoxGeometry(0.11 * k, 0.07 * k, 0.24 * k), M('rubber'), 0, -0.88 * k, 0.05 * k); piv[n] = p; }
  add(g, new THREE.CylinderGeometry(0.19 * k, 0.17 * k, 0.62 * k, 14), coat, 0, 1.2 * k, 0);
  for (const [n, x] of [['la', -0.24], ['ra', 0.24]]) { const p = new THREE.Group(); p.position.set(x * k, 1.48 * k, 0); g.add(p); add(p, new THREE.CylinderGeometry(0.055 * k, 0.045 * k, 0.6 * k, 8), coat, 0, -0.3 * k, 0); add(p, new THREE.SphereGeometry(0.05 * k, 8, 6), skin, 0, -0.62 * k, 0); piv[n] = p; }
  add(g, new THREE.CylinderGeometry(0.05 * k, 0.06 * k, 0.08 * k, 8), skin, 0, 1.54 * k, 0);
  add(g, new THREE.SphereGeometry(0.115 * k, 16, 12), skin, 0, 1.66 * k, 0);
  if (o.hat === 'cap') { add(g, new THREE.CylinderGeometry(0.13 * k, 0.12 * k, 0.07 * k, 16), hatM, 0, 1.77 * k, 0); add(g, new THREE.BoxGeometry(0.16 * k, 0.015 * k, 0.09 * k), hatM, 0, 1.74 * k, 0.11 * k); }
  else if (o.hat === 'helmet') add(g, new THREE.SphereGeometry(0.125 * k, 16, 8, 0, 6.2832, 0, Math.PI / 1.8), hatM, 0, 1.67 * k, 0);
  else if (o.hat === 'top') add(g, new THREE.CylinderGeometry(0.1 * k, 0.1 * k, 0.2 * k, 16), hatM, 0, 1.86 * k, 0);
  if (o.beard) add(g, new THREE.SphereGeometry(0.08 * k, 10, 8), M('paint:' + o.beard), 0, 1.58 * k, 0.07 * k).scale.set(1, 1.2, 0.7);
  setPose(piv, POSES[o.pose || 'stand']);
  return { g, mats, piv };
}
export function setPose(piv, P, k = 1, from) {
  for (const n of ['la', 'ra', 'll', 'rl']) { const a = P[n], b = from ? from[n] : a; piv[n].rotation.set((b[0] + (a[0] - b[0]) * k) * D, (b[1] + (a[1] - b[1]) * k) * D, (b[2] + (a[2] - b[2]) * k) * D); }
}

// Строит одно тело. Возвращает {o: Object3D, mats: [материалы], cloth?, flow?, light?}.
export async function build(spec, ctx) {
  const o = spec, t = o.type || 'group';
  const mk = () => material(o.mat);
  let obj, mats = [], extra = {};
  const meshOf = (geo) => { const m = new THREE.Mesh(geo, mk()); mats.push(m.material); return m; };
  switch (t) {
    case 'group': obj = new THREE.Group(); break;
    case 'cylinder': obj = meshOf(new THREE.CylinderGeometry(o.rTop ?? o.r ?? 1, o.rBottom ?? o.r ?? 1, o.h ?? 1, o.seg ?? 32, 1, !!o.open)); break;
    case 'cone': obj = meshOf(new THREE.ConeGeometry(o.r ?? 1, o.h ?? 2, o.seg ?? 32, 1, !!o.open)); break;
    case 'box': { const [w, h, d] = o.size || [o.w ?? 1, o.h ?? 1, o.d ?? 1]; obj = meshOf(new THREE.BoxGeometry(w, h, d)); break; }
    case 'sphere': obj = meshOf(new THREE.SphereGeometry(o.r ?? 1, o.seg ?? 32, Math.round((o.seg ?? 32) / 2), 0, 6.2832, 0, o.half ? Math.PI / 2 : Math.PI)); break;
    case 'torus': obj = meshOf(new THREE.TorusGeometry(o.r ?? 1, o.tube ?? 0.1, 10, o.seg ?? 40)); obj.geometry.rotateX(Math.PI / 2); break;   // лежит в плоскости XZ (кольцо, пояс)
    case 'lathe': obj = meshOf(new THREE.LatheGeometry(o.profile.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y)), o.seg ?? 40)); if (o.double) obj.material.side = THREE.DoubleSide; break;
    case 'tube': obj = meshOf(tubeGeo(o)); break;
    case 'truss': {
      let h = o.h; const from = o.from && v3(o.from), to = o.to && v3(o.to);
      if (from && to) h = from.distanceTo(to);
      obj = meshOf(trussGeo({ ...o, h }));
      if (from && to) { const g = new THREE.Group(); obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize()); obj.position.copy(from); g.add(obj); obj = g; }
      break;
    }
    case 'cloth': { const c = new Cloth(o, mk()); mats.push(c.mesh.material); obj = c.g; extra.cloth = c; break; }
    case 'liquid': case 'liquid-flow': { const m = material(o.mat || 'flow:' + (o.color || '#ff8a2a')); if (!m.userData.flow) m.userData.flow = true; const f = new Flow(o, m); obj = f.mesh; mats.push(m); extra.flow = f; break; }
    case 'model': { const r = await buildModel(o); obj = r.o; mats = r.mats; extra.model = r.model; break; }
    case 'wing': obj = meshOf(wingGeo(o)); obj.material.side = THREE.DoubleSide; break;
    case 'wires': obj = meshOf(wiresGeo(o)); break;
    case 'propeller': obj = meshOf(propellerGeo(o)); break;
    case 'wheel': { const G = wheelGeos(o); obj = new THREE.Group(); const a = new THREE.Mesh(G.metal, material(o.mat || 'metal')), b = new THREE.Mesh(G.tyre, material(o.tyreMat || 'rubber')); obj.add(a, b); mats.push(a.material, b.material); break; }
    case 'forest': { const f = forest(o); obj = f.o; mats = f.mats; extra.tick = f.o.userData.tick; break; }
    case 'person': { const p = person(o); obj = p.g; mats = p.mats; extra.pivots = p.piv; break; }
    case 'dot': { const m = new THREE.SpriteMaterial({ map: texGlow(), color: new THREE.Color(o.color || '#ffd27a'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }); obj = new THREE.Sprite(m); obj.scale.setScalar(o.size ?? 1); mats.push(m); break; }
    case 'light': { obj = new THREE.PointLight(new THREE.Color(o.color || '#ffb060'), o.power ?? 0, o.dist ?? 60, o.decay ?? 1.5); extra.light = obj; obj.userData.p0 = o.power ?? 0; break; }
    case 'globe': case 'route': { const G = await ctx.globus(); const r = G.build(o, ctx); obj = r.o; mats = r.mats || []; Object.assign(extra, r.extra || {}); break; }
    default: console.warn('rc3d: неизвестный тип тела', t); obj = new THREE.Group();
  }
  // texStep: повтор текстуры по размеру тела (метров на плитку) — трубы по длине, коробки по ширине.
  for (const m of mats) if (m.userData?.texStep && obj.geometry) {
    const st = m.userData.texStep, gd = obj.geometry.userData; let ru = 1, rv = 1;
    if (gd.len) { ru = gd.len / st; rv = Math.max(1, (2 * Math.PI * (gd.r || 0.2)) / st); }
    else { obj.geometry.computeBoundingBox(); const sz = obj.geometry.boundingBox.getSize(new THREE.Vector3()); ru = Math.max(sz.x, sz.z) / st; rv = sz.y / st; }
    for (const k of ['map', 'normalMap', 'roughnessMap', 'aoMap', 'metalnessMap']) if (m[k]) m[k].repeat.set(ru, rv);
  }
  // "anchor":"base" — начало координат у основания (удобно растить уровень жидкости, столбы, стопки).
  if (o.anchor === 'base' && obj.geometry && ['cylinder', 'cone', 'box', 'sphere'].includes(t)) { obj.geometry.computeBoundingBox(); obj.geometry.translate(0, -obj.geometry.boundingBox.min.y, 0); }
  if (t !== 'model' && t !== 'forest') obj.traverse((m) => { if (m.isMesh) { m.castShadow = o.shadow !== false && !mats[0]?.transparent; m.receiveShadow = o.shadow !== false; } });
  if (o.pos) obj.position.fromArray(o.pos);
  if (o.rot) obj.rotation.set(o.rot[0] * D, o.rot[1] * D, o.rot[2] * D, o.order || 'XYZ');
  if (o.scale != null) Array.isArray(o.scale) ? obj.scale.fromArray(o.scale) : obj.scale.setScalar(o.scale);
  if (o.glow != null && mats[0]) extra.glow0 = o.glow;
  return { o: obj, mats, ...extra };
}

// Размножение тела: {"copies":{"n":4,"radius":2.4,"start":0,"step":90,"face":true}} или {"copies":{"at":[[x,y,z],…]}}.
// Копии получают имена id#0, id#1…; имя id обозначает их все сразу (как группа).
export function copyPlaces(c) {
  if (c.at) return c.at.map((p) => ({ pos: p, yaw: 0 }));
  const out = [], n = c.n ?? 4, step = c.step ?? 360 / n;
  for (let k = 0; k < n; k++) { const a = ((c.start ?? 0) + k * step) * D; out.push({ pos: [Math.cos(a) * (c.radius ?? 1), c.y ?? 0, Math.sin(a) * (c.radius ?? 1)], yaw: c.face === false ? 0 : -a }); }
  return out;
}
