// rc3d · Детальные тела процедурной геометрией (общие для любых дней):
//  wing     — плоскость крыла: профиль с изгибом, полотно провисает между нервюрами, кромки, торцы;
//  wires    — тонкие тросы/растяжки между парами точек (одна сетка на все);
//  propeller— деревянный винт: лопасти с круткой и сужением, ступица; ось — X;
//  wheel    — колесо со спицами, ободом, шиной и ступицей; ось — Z;
//  forest   — лес из сотен деревьев (ель, сосна, берёза) — копии одним вызовом отрисовки, ветер в кронах;
//  instancedCopies — копии составного тела одной InstancedMesh на материал ("copies":{…,"instanced":true}).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { canvasTex, rnd } from './tekstury.mjs';
import { tex } from './zagruzka.mjs';

const D = Math.PI / 180;

// ── Крыло ── span — размах (по Z, от 0 до span или по центру при center:true), chord — хорда (по X, передняя кромка
// со стороны +X), t — толщина профиля, camber — изгиб, ribs — число нервюр, sag — провис полотна между ними.
export function wingGeo(o) {
  const span = o.span ?? 5, chord = o.chord ?? 1.6, t = o.t ?? chord * 0.06, cam = o.camber ?? chord * 0.045, ribs = o.ribs ?? Math.round(span / 0.35);
  const sag = o.sag ?? 0.35, NX = 18, NZ = Math.max(ribs * 6, 12), z0 = o.center ? -span / 2 : 0;
  // Профиль по хорде u: 0 — задняя кромка, 1 — передняя. Верх и низ.
  const thick = (u) => t * 2.2 * Math.sqrt(Math.max(0, u)) * (1 - u) * 1.4 + 0.002;
  const camb = (u) => cam * Math.sin(Math.PI * Math.pow(u, 0.75));
  const pos = [], uv = [], idx = [];
  const ribF = (z) => { const f = (z / span) * ribs; const fr = f - Math.floor(f); return Math.sin(Math.PI * fr); };   // 0 у нервюры, 1 посередине
  for (const side of [1, -1]) {
    const base = pos.length / 3;
    for (let j = 0; j <= NZ; j++) {
      const z = (j / NZ) * span, s = ribF(z);
      for (let i = 0; i <= NX; i++) {
        const u = 1 - Math.cos((i / NX) * Math.PI / 2);   // сгущение к передней кромке
        const h = thick(u) * (side > 0 ? 0.62 : 0.38) * (1 - sag * s * (u < 0.92 ? 1 : 0) * Math.sin(Math.PI * u));
        pos.push((u - 0.5) * chord, camb(u) + side * h, z + z0); uv.push(u, z / span);
      }
    }
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
      const a = base + j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1;
      if (side > 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  // Торцы крыла — по профилю.
  const caps = [];
  for (const zc of [0, span]) {
    const shape = new THREE.Shape(); const P = [];
    for (let i = 0; i <= NX; i++) { const u = 1 - Math.cos((i / NX) * Math.PI / 2); P.push([(u - 0.5) * chord, camb(u) + thick(u) * 0.62]); }
    for (let i = NX; i >= 0; i--) { const u = 1 - Math.cos((i / NX) * Math.PI / 2); P.push([(u - 0.5) * chord, camb(u) - thick(u) * 0.38]); }
    shape.moveTo(...P[0]); for (const p of P.slice(1)) shape.lineTo(...p);
    const cg = new THREE.ShapeGeometry(shape); if (zc === 0) cg.scale(1, 1, -1).translate(0, 0, 0); cg.translate(0, 0, zc + z0); caps.push(cg);
  }
  const out = mergeGeometries([g.toNonIndexed(), ...caps.map((c) => { c.deleteAttribute('normal'); return c.toNonIndexed(); })].map((x) => { if (!x.attributes.uv) x.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(x.attributes.position.count * 2), 2)); return x; }));
  out.computeVertexNormals();
  return out;
}

// ── Тросы: "pairs":[[[x,y,z],[x,y,z]],…], r — радиус (м). ──
export function wiresGeo(o) {
  const r = o.r ?? 0.004, parts = [];
  for (const [a, b] of o.pairs || []) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B); if (L < 1e-4) continue;
    const g = new THREE.CylinderGeometry(r, r, L, o.radial ?? 5, 1, true);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()));
    g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2); parts.push(g);
  }
  return parts.length ? mergeGeometries(parts) : new THREE.BufferGeometry();
}

// ── Винт: d — диаметр, blades — число лопастей, chord — ширина у корня, pitch — угол у корня (град). Ось X. ──
export function propellerGeo(o) {
  const R = (o.d ?? 2.4) / 2, nb = o.blades ?? 2, c0 = o.chord ?? 0.16, pitch = (o.pitch ?? 32) * D, parts = [];
  const NR = 22, NC = 10;
  for (let k = 0; k < nb; k++) {
    const pos = [], idx = [];
    for (let j = 0; j <= NR; j++) {
      const s = j / NR, r = 0.09 + s * (R - 0.09);
      const ch = c0 * (0.55 + 1.1 * Math.sin(Math.PI * Math.min(1, s * 0.85 + 0.12))) * (s > 0.92 ? Math.sqrt(Math.max(0.05, (1 - s) / 0.08)) : 1);
      const th = 0.045 * (1 - 0.75 * s) + 0.008, tw = pitch * (1 - 0.6 * s);
      for (let i = 0; i <= NC; i++) {
        const a = (i / NC) * Math.PI * 2, cx = Math.cos(a) * ch / 2, cy = Math.sin(a) * th / 2 * (Math.cos(a) > 0 ? 1 : 0.7);
        // профиль в плоскости (Z — по хорде, X — толщина), поворот на угол установки
        const z = cx * Math.cos(tw) - cy * Math.sin(tw), x = cx * Math.sin(tw) + cy * Math.cos(tw);
        pos.push(x, r, z);
      }
    }
    for (let j = 0; j < NR; j++) for (let i = 0; i < NC; i++) { const a = j * (NC + 1) + i, b = a + 1, c = a + NC + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const uv = []; for (let j = 0; j <= NR; j++) for (let i = 0; i <= NC; i++) uv.push(i / NC, j / NR); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.rotateX((k / nb) * Math.PI * 2); parts.push(g.toNonIndexed());
  }
  const hub = new THREE.CylinderGeometry(0.1, 0.1, 0.14, 16); hub.rotateZ(Math.PI / 2); parts.push(hub.toNonIndexed());
  const out = mergeGeometries(parts.map((p) => { p.deleteAttribute('normal'); return p; })); out.computeVertexNormals(); return out;
}

// ── Колесо: r — радиус по шине, w — ширина, spokes — число спиц. Ось Z. Две сетки: металл (обод, спицы, ступица) и резина. ──
export function wheelGeos(o) {
  const r = o.r ?? 0.35, w = o.w ?? 0.07, n = o.spokes ?? 18, tyre = o.tyre ?? r * 0.13;
  const rim = new THREE.TorusGeometry(r - tyre * 0.95, tyre * 0.35, 8, 48);
  const hub = new THREE.CylinderGeometry(r * 0.09, r * 0.09, w * 1.8, 14); hub.rotateX(Math.PI / 2);
  const sp = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2, side = k % 2 ? 1 : -1, A = new THREE.Vector3(0, 0, side * w * 0.8), B = new THREE.Vector3(Math.cos(a) * (r - tyre), Math.sin(a) * (r - tyre), 0);
    const L = A.distanceTo(B), g = new THREE.CylinderGeometry(0.0035, 0.0035, L, 4, 1, true);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize())); g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2); sp.push(g);
  }
  const metal = mergeGeometries([rim, hub, ...sp].map((g) => g.toNonIndexed()));
  const tyreG = new THREE.TorusGeometry(r - tyre * 0.5, tyre * 0.62, 12, 56);
  return { metal, tyre: tyreG };
}

// ── Лес ──────────────────────────────────────────────────────────────────────────────────────
// Ветки ели и сосны, лист берёзы — рисуются на холсте (без чужих картинок).
const texBranch = (kind) => canvasTex(256, (g, s) => {
  const R = rnd(kind === 'birch' ? 41 : kind === 'pine' ? 43 : 47);
  g.clearRect(0, 0, s, s);
  if (kind === 'birch') {   // кленово-берёзовая шапка листвы: сотни мелких листков
    for (let i = 0; i < 1400; i++) {
      const a = R() * 6.283, d = Math.pow(R(), 0.6) * s * 0.47, x = s / 2 + Math.cos(a) * d, y = s / 2 + Math.sin(a) * d * 0.9;
      const l = 40 + R() * 50; g.fillStyle = `hsl(${78 + R() * 22},${42 + R() * 18}%,${l * 0.62}%)`;
      g.beginPath(); g.ellipse(x, y, 3 + R() * 3, 2 + R() * 2, R() * 6.28, 0, 6.283); g.fill();
    }
  } else {   // хвойная лапа: стебель и иглы ёлочкой
    const cs = kind === 'pine' ? [95, 35, 26] : [140, 34, 20];
    for (let b = 0; b < 3; b++) {
      const x0 = s * (0.2 + 0.3 * b), y0 = s * 0.98, x1 = s * (0.35 + 0.15 * b + (R() - 0.5) * 0.2), y1 = s * 0.04;
      g.strokeStyle = 'rgba(70,52,36,1)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      for (let i = 0; i < 160; i++) {
        const t = R(), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, L = (kind === 'pine' ? 34 : 22) * (1 - t * 0.6) * (0.6 + R() * 0.6), a = (R() > 0.5 ? 1 : -1) * (0.5 + R() * 0.7) - Math.PI / 2;
        g.strokeStyle = `hsl(${cs[0] + R() * 20},${cs[1] + R() * 10}%,${cs[2] + R() * 14}%)`; g.lineWidth = kind === 'pine' ? 1.6 : 2.2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
      }
    }
  }
});
const card = (w, h, y0 = 0) => { const g = new THREE.PlaneGeometry(w, h); g.translate(0, h / 2 + y0, 0); return g; };
// Дерево высотой 1: ствол (кора — пбр) и крона из лап-карточек. Возвращает {bark, leaf} геометрии.
function treeGeo(kind, seed) {
  const R = rnd(seed), bark = [], leaf = [];
  const trunkH = kind === 'pine' ? 0.72 : kind === 'birch' ? 0.62 : 0.3, r0 = kind === 'spruce' ? 0.018 : 0.014;
  const t = new THREE.CylinderGeometry(r0 * 0.4, r0, kind === 'spruce' ? 0.95 : trunkH + 0.12, 7, 3); t.translate(0, (kind === 'spruce' ? 0.95 : trunkH + 0.12) / 2, 0); bark.push(t);
  const put = (g, x, y, z, rx, ry, rz) => { g.rotateZ(rz); g.rotateX(rx); g.rotateY(ry); g.translate(x, y, z); leaf.push(g); };
  if (kind === 'spruce') {   // ярусы лап конусом, книзу шире
    for (let k = 0; k < 13; k++) {
      const y = 0.12 + k * 0.066, rr = 0.24 * (1 - (y - 0.1) / 0.95) + 0.02, n = Math.max(4, Math.round(rr * 40));
      for (let i = 0; i < n; i++) { const a = (i / n) * 6.283 + R(); const g = card(rr * 0.9, rr * 1.25); put(g, Math.cos(a) * 0.01, y + rr * 0.18, Math.sin(a) * 0.01, -1.05 - R() * 0.25, -a + Math.PI / 2, 0); }
    }
    const top = card(0.06, 0.14); put(top, 0, 0.92, 0, 0, R() * 3, 0);
  } else if (kind === 'pine') {   // высокий голый ствол, крона-облака наверху
    for (let c = 0; c < 6; c++) {
      const a = R() * 6.283, d = 0.03 + R() * 0.09, y = 0.7 + R() * 0.24, s = 0.12 + R() * 0.08;
      for (let i = 0; i < 9; i++) { const b = R() * 6.283, g = card(s, s * 0.8, -s * 0.4); put(g, Math.cos(a) * d, y, Math.sin(a) * d, (R() - 0.5) * 2.2, b, (R() - 0.5) * 0.8); }
      const br = new THREE.CylinderGeometry(0.003, 0.006, d + 0.02, 4); br.rotateZ(Math.PI / 2); br.rotateY(-a); br.translate(Math.cos(a) * d / 2, y - 0.02, Math.sin(a) * d / 2); bark.push(br);
    }
  } else {   // берёза: светлый ствол, плакучая округлая крона
    for (let c = 0; c < 9; c++) {
      const a = R() * 6.283, d = R() * 0.12, y = 0.5 + R() * 0.42, s = 0.16 + R() * 0.1;
      for (let i = 0; i < 6; i++) { const g = card(s, s, -s / 2); put(g, Math.cos(a) * d, y, Math.sin(a) * d, (R() - 0.5) * 2.6, R() * 6.283, (R() - 0.5) * 1.2); }
    }
  }
  const fix = (arr) => mergeGeometries(arr.map((g) => { const x = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(x.attributes)) if (!['position', 'normal', 'uv'].includes(k)) x.deleteAttribute(k); return x; }));
  return { bark: fix(bark), leaf: fix(leaf) };
}
// Ветер в кронах: вершины качаются тем сильнее, чем выше над землёй.
function windy(m, k = 1) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = { value: 0 }; m.userData.sh = sh;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace('#include <begin_vertex>', `#include <begin_vertex>
      #ifdef USE_INSTANCING
      vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      #else
      vec3 ip = vec3(0.0);
      #endif
      float ph = dot(ip, vec3(0.13, 0.0, 0.17));
      transformed.x += sin(uTime * 1.3 + ph) * ${(0.025 * k).toFixed(4)} * position.y * position.y;
      transformed.z += cos(uTime * 1.1 + ph * 1.3) * ${(0.018 * k).toFixed(4)} * position.y * position.y;`);
  };
  return m;
}
// {"type":"forest","ring":[r0,r1],"n":420,"kinds":{"spruce":0.5,"pine":0.3,"birch":0.2},"h":[14,26],"gap":[[x,z,r],…]}
// или "area":[x0,z0,x1,z1]. Тени деревья не отбрасывают (лес далеко), туман делает их дымчатыми.
export function forest(o) {
  const grp = new THREE.Group(), R = rnd(o.seed ?? 5), n = o.n ?? 300, H = o.h ?? [14, 24], kinds = o.kinds || { spruce: 0.5, pine: 0.3, birch: 0.2 };
  const names = Object.keys(kinds), tot = names.reduce((s, k) => s + kinds[k], 0);
  const barkTex = { spruce: o.bark || 'tex/bark012', pine: o.bark || 'tex/bark012', birch: o.barkBirch || 'tex/bark007' };
  const places = Object.fromEntries(names.map((k) => [k, []]));
  for (let i = 0; i < n * 3 && Object.values(places).reduce((s, a) => s + a.length, 0) < n; i++) {
    let x, z;
    if (o.area) { x = o.area[0] + R() * (o.area[2] - o.area[0]); z = o.area[1] + R() * (o.area[3] - o.area[1]); }
    else { const [r0, r1] = o.ring || [150, 260], a = R() * 6.283, d = r0 + Math.pow(R(), 0.8) * (r1 - r0); x = Math.cos(a) * d; z = Math.sin(a) * d; }
    if ((o.gap || []).some(([gx, gz, gr]) => (x - gx) ** 2 + (z - gz) ** 2 < gr * gr)) continue;
    let u = R() * tot, k = names[0]; for (const nm of names) { if ((u -= kinds[nm]) <= 0) { k = nm; break; } }
    places[k].push([x, z, H[0] + R() * (H[1] - H[0]), R() * 6.283, 0.85 + R() * 0.3]);
  }
  const mats = [];
  for (const k of names) {
    if (!places[k].length) continue;
    const geos = [0, 1, 2].map((v) => treeGeo(k, 11 + v * 7 + k.length));
    const lm = windy(new THREE.MeshStandardMaterial({ map: texBranch(k), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.85, color: o.leafColor?.[k] || 0xffffff }), o.wind ?? 1);
    const bt = barkTex[k], bm = new THREE.MeshStandardMaterial({ map: tex(bt + '_diffuse_1k.jpg', { srgb: true, repeat: [1, 6] }), normalMap: tex(bt + '_nor_gl_1k.jpg', { repeat: [1, 6] }), roughness: 0.95, color: k === 'birch' ? 0xf2f0ea : 0xb8a898 });
    mats.push(lm, bm);
    geos.forEach((G, v) => {
      const pl = places[k].filter((_, i) => i % 3 === v); if (!pl.length) return;
      for (const [geo, mat] of [[G.bark, bm], [G.leaf, lm]]) {
        const im = new THREE.InstancedMesh(geo, mat, pl.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
        pl.forEach(([x, z, h, a, w], i) => { m4.compose(new THREE.Vector3(x, 0, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a), new THREE.Vector3(h * w, h, h * w)); im.setMatrixAt(i, m4); if (mat === lm) im.setColorAt(i, c.setHSL(0, 0, 0.78 + R() * 0.3)); });
        im.frustumCulled = false; im.castShadow = !!o.shadow; im.receiveShadow = false; grp.add(im);
      }
    });
  }
  grp.userData.tick = (t) => { for (const m of mats) if (m.userData.sh) m.userData.sh.uniforms.uTime.value = t; };
  return { o: grp, mats };
}

// ── Копии одним вызовом отрисовки: геометрия частей запекается в одну на материал, по экземпляру на копию. ──
export function instancedCopies(meshes, places) {
  // meshes: [{geo (уже в осях тела), mat}]; places: [{pos, yaw}]
  const grp = new THREE.Group(), byMat = new Map();
  for (const { geo, mat } of meshes) { const k = mat.uuid; if (!byMat.has(k)) byMat.set(k, { mat, geos: [] }); byMat.get(k).geos.push(geo); }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
  for (const { mat, geos } of byMat.values()) {
    const g = mergeGeometries(geos.map((x) => { const y = x.index ? x.toNonIndexed() : x.clone(); for (const k of Object.keys(y.attributes)) if (!['position', 'normal', 'uv'].includes(k)) y.deleteAttribute(k); if (!y.attributes.uv) y.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(y.attributes.position.count * 2), 2)); return y; }));
    const im = new THREE.InstancedMesh(g, mat, places.length);
    places.forEach((p, i) => { m4.compose(new THREE.Vector3(...p.pos), q.setFromAxisAngle(Y, p.yaw || 0), one); im.setMatrixAt(i, m4); });
    im.castShadow = true; im.receiveShadow = true; im.computeBoundingSphere(); grp.add(im);
  }
  return grp;
}
