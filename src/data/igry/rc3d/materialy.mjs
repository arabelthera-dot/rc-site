// rc3d · Материалы по короткому имени из сценария: "metal", "paint:#c0392b", "fabric:#f5f0e6", "hot", "glass"…
// Форма записи: строка "вид" или "вид:#цвет", либо объект {kind, color, rough, metal, emissive, opacity}.
// Каждое тело получает свой экземпляр материала — «glow»/«hide» одного тела не задевают соседей.
import * as THREE from 'three';
import { texNoise, texBrick, texFabric, texFrost, texFlow, texGlow, texSilk } from './tekstury.mjs';
import { pbrMaps } from './zagruzka.mjs';

// Цвет каления: 0 — холодный, 0,35 — тёмно-вишнёвый, 0,6 — оранжевый, 1 — бело-жёлтый.
export function heatColor(k, out = new THREE.Color()) {
  const st = [[0, 0x000000], [0.3, 0x5a0a00], [0.55, 0xc8380a], [0.8, 0xff8a1e], [1, 0xfff0b0]];
  k = Math.max(0, Math.min(1, k));
  for (let i = 1; i < st.length; i++) if (k <= st[i][0]) {
    const u = (k - st[i - 1][0]) / (st[i][0] - st[i - 1][0]);
    return out.set(st[i - 1][1]).lerp(new THREE.Color(st[i][1]), u);
  }
  return out.set(st[st.length - 1][1]);
}

const KIND = {
  metal: (c) => new THREE.MeshStandardMaterial({ color: c ?? 0xb9bec4, roughness: 0.32, metalness: 0.9 }),
  steel: (c) => new THREE.MeshStandardMaterial({ color: c ?? 0x8d3b2c, roughness: 0.55, metalness: 0.5 }),   // крашеная сталь ферм
  dark: (c) => new THREE.MeshStandardMaterial({ color: c ?? 0x3a3f46, roughness: 0.6, metalness: 0.4 }),
  nozzle: (c) => new THREE.MeshStandardMaterial({ color: c ?? 0x4a3c33, roughness: 0.35, metalness: 0.85, side: THREE.DoubleSide }),
  paint: (c) => new THREE.MeshStandardMaterial({ color: c ?? 0xdfe3df, roughness: 0.5, metalness: 0.2 }),
  fabric: (c) => new THREE.MeshStandardMaterial({ color: c ?? 0xf2efe6, map: texFabric(), roughness: 0.92, metalness: 0, side: THREE.DoubleSide }),
  brick: (c) => new THREE.MeshStandardMaterial({ map: texBrick(c ? '#' + new THREE.Color(c).getHexString() : undefined), roughness: 0.9 }),
  concrete: (c) => new THREE.MeshStandardMaterial({ color: c ?? 0xffffff, map: texNoise('#9a978f', 0.22, 2600, 1), roughness: 0.95 }),
  wood: (c) => new THREE.MeshStandardMaterial({ color: c ?? 0x8a6a45, map: texNoise('#a07c52', 0.3, 1800, 1, 9), roughness: 0.8 }),
  rubber: (c) => new THREE.MeshStandardMaterial({ color: c ?? 0x222222, roughness: 0.95 }),
  glass: (c) => new THREE.MeshStandardMaterial({ color: c ?? 0xcfe6f2, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide }),
  frost: () => new THREE.MeshStandardMaterial({ map: texFrost(), color: 0xffffff, emissive: 0x9fb4c8, emissiveIntensity: 0.28, roughness: 0.97, transparent: true }),
  // Раскалённый металл: свечение задаётся событием glow (0…1), по умолчанию — тёплый 0,7.
  hot: (c) => { const m = new THREE.MeshStandardMaterial({ color: c ?? 0x3b2a22, roughness: 0.55, metalness: 0.6 }); m.userData.hot = true; return m; },
  // Светится сам, без света сцены (сигнальные лампы, жидкость в смотровом окне).
  glow: (c) => new THREE.MeshBasicMaterial({ color: c ?? 0xffc060, toneMapped: false }),
  // Поток в трубе: полосы бегут вдоль трубы, светится; прозрачный, чтобы был виден «налив».
  flow: (c) => { const t = texFlow().clone(); t.needsUpdate = true; const m = new THREE.MeshBasicMaterial({ color: c ?? 0xff9030, map: t, transparent: true, opacity: 0.95, toneMapped: false, depthWrite: false }); m.userData.flow = true; return m; },
  // Шёлк: блеск ткани (sheen), мелкое переплетение и швы клиньев в карте нормалей; повтор швов задаёт тело.
  silk: (c) => new THREE.MeshPhysicalMaterial({ color: c ?? 0xf4eedf, roughness: 0.5, metalness: 0, sheen: 1, sheenRoughness: 0.3, sheenColor: new THREE.Color(0xffffff), normalMap: texSilk(), normalScale: new THREE.Vector2(0.6, 0.6), side: THREE.DoubleSide }),
  halo: (c) => new THREE.SpriteMaterial({ map: texGlow(), color: c ?? 0xff9a3c, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }),
};

// PBR по текстурам с диска: {"kind":"pbr","tex":"tex/rust_coarse_01","repeat":[4,1],"color":"#…","res":"1k","arm":true,
// "normal":1,"texStep":2}. texStep — метров на плитку: повтор по длине трубы/размеру тела ставит само тело.
function pbr(o) {
  const maps = pbrMaps(o.tex, { repeat: o.repeat || [1, 1], res: o.res, arm: o.arm, maps: o.maps });
  const m = new THREE.MeshStandardMaterial({ color: o.color != null ? new THREE.Color(o.color) : 0xffffff, roughness: 1, metalness: maps.metalnessMap ? 1 : 0, ...maps });
  if (o.normal != null) m.normalScale.setScalar(o.normal);
  if (maps.alphaMap) { m.alphaTest = 0.5; m.side = THREE.DoubleSide; }
  if (o.texStep) m.userData.texStep = o.texStep;
  return m;
}
export function material(spec) {
  if (!spec) spec = 'paint';
  let kind, color, o = {};
  if (typeof spec === 'string') { [kind, color] = spec.split(':'); }
  else { o = spec; kind = spec.kind || 'paint'; color = spec.color; }
  // Любой вид с "tex" — PBR по текстурам (цвет — подкраска).
  if (kind === 'pbr' || (o.tex && kind !== 'silk')) { const m = pbr(o); if (o.rough != null) m.roughness = o.rough; if (o.metal != null) m.metalness = o.metal; if (o.side === 'double') m.side = THREE.DoubleSide; m.userData.kind = 'pbr'; return m; }
  const make = KIND[kind] || KIND.paint;
  const m = make(color != null ? new THREE.Color(color) : undefined);
  if (o.rough != null) m.roughness = o.rough;
  if (o.metal != null) m.metalness = o.metal;
  if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.emissiveIntensity ?? 1; }
  if (o.opacity != null) { m.transparent = true; m.opacity = o.opacity; }
  if (o.side === 'double') m.side = THREE.DoubleSide;
  if (m.userData.hot) setGlow(m, o.glow ?? 0.7);
  m.userData.kind = kind;
  return m;
}

// Свечение тела: для «hot» — цвет каления, для прочих — эмиссия своим цветом (или заданным).
export function setGlow(m, k, color) {
  if (!m || m.isMeshBasicMaterial) { if (m && m.userData.flow) m.opacity = 0.25 + 0.75 * k; return; }
  m.userData.glow = k;
  if (m.userData.hot && !color) { heatColor(k, m.emissive); m.emissiveIntensity = 0.4 + 2.6 * k; }
  else { m.emissive = new THREE.Color(color || m.color); m.emissiveIntensity = 2 * k; }
}
