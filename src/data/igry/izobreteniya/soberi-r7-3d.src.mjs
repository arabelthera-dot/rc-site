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
import { feature } from 'topojson-client';
import land110 from 'world-atlas/land-110m.json';   // Natural Earth 1:110 млн, общественное достояние

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

// Иней на кислородных баках: белая шуба с вертикальными подтёками.
const texFrost = canvasTex(256, (g, s) => {
  g.fillStyle = '#f4f7fa'; g.fillRect(0, 0, s, s);
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 3200; i++) { const v = rnd(); g.fillStyle = v > 0.5 ? `rgba(255,255,255,${(v - 0.5) * 1.4})` : `rgba(120,145,170,${v * 0.5})`; const w = 1 + rnd() * 3; g.fillRect(rnd() * s, rnd() * s, w, w); }
  for (let i = 0; i < 90; i++) { const x = rnd() * s, y = rnd() * s, h = 10 + rnd() * 60; g.fillStyle = `rgba(140,165,190,${0.2 + rnd() * 0.3})`; g.fillRect(x, y, 1 + rnd() * 3, h); }
}, 3);

// ── Материалы ──
const M = {
  body: new THREE.MeshStandardMaterial({ color: 0xdfe3df, roughness: 0.5, metalness: 0.25 }),
  bodyDark: new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.6, metalness: 0.4 }),
  nozzle: new THREE.MeshStandardMaterial({ color: 0x4a3c33, roughness: 0.35, metalness: 0.85, side: THREE.DoubleSide }),
  steel: new THREE.MeshStandardMaterial({ color: 0x8d3b2c, roughness: 0.55, metalness: 0.5 }),
  concrete: new THREE.MeshStandardMaterial({ map: noiseTex('#9a978f', 0.22, 2600, 6), roughness: 0.95 }),
  pit: new THREE.MeshStandardMaterial({ color: 0x2b2a28, roughness: 1 }),
  steppe: new THREE.MeshStandardMaterial({ map: noiseTex('#b39d6e', 0.3, 5000, 260), roughness: 1 }),
  frost: new THREE.MeshStandardMaterial({ map: texFrost, color: 0xffffff, emissive: 0x9fb4c8, emissiveIntensity: 0.28, roughness: 0.97, metalness: 0, transparent: true }),
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
    startLife: new IntervalValue(0.26, 0.5), startSpeed: new IntervalValue(26 * scale + 8, 36 * scale + 10),
    startSize: new IntervalValue(1.0 * scale, 1.7 * scale), startColor: new ColorRange(new Vector4(1, 0.95, 0.85, 1), new Vector4(1, 0.78, 0.5, 1)),
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
// Кислородный пар из дренажных клапанов: белые клубы стекают вниз — жидкий кислород холоднее воздуха.
function vaporPS(radius) {
  const ps = new ParticleSystem({
    duration: 1, looping: true, worldSpace: true,
    startLife: new IntervalValue(2.4, 4), startSpeed: new IntervalValue(1, 2.6), startSize: new IntervalValue(1.8, 3.4), startRotation: new IntervalValue(0, 6.28),
    startColor: new ColorRange(new Vector4(1, 1, 1, 0.7), new Vector4(0.92, 0.96, 1, 0.7)),
    shape: new ConeEmitter({ radius, angle: 1.1, thickness: 1, arc: Math.PI * 2 }),
    emissionOverTime: new ConstantValue(0), material: M.smoke, renderMode: RenderMode.BillBoard,
    behaviors: [new ColorOverLife(grad([[1, 1, 1, 0], [1, 1, 1, 1]], [[0, 0], [1, 0.15], [0.6, 0.55], [0, 1]])),
      new SizeOverLife(curve(0.5, 1.4, 2.3, 3)), new ApplyForce(new QV3(0, -1, 0), new ConstantValue(1.6))],
  });
  ps.emitter.rotation.x = Math.PI / 2; ps.vaporRate = (SLAB ? 9 : 16) * K;
  return ps;
}
// Осыпание инея на отрыве: ледяная крошка сыплется с баков.
function icePS() {
  return new ParticleSystem({
    duration: 1.6, looping: false, worldSpace: true, emissionOverTime: new ConstantValue((SLAB ? 70 : 150) * K),
    startLife: new IntervalValue(1.5, 3), startSpeed: new IntervalValue(1, 5), startSize: new IntervalValue(0.12, 0.4), startRotation: new IntervalValue(0, 6.28),
    startColor: new ColorRange(new Vector4(1, 1, 1, 1), new Vector4(0.85, 0.92, 1, 1)),
    shape: new ConeEmitter({ radius: 3, angle: 1.4, thickness: 1, arc: Math.PI * 2 }), material: M.flame, renderMode: RenderMode.BillBoard,
    behaviors: [new ApplyForce(new QV3(0, -1, 0), new ConstantValue(14)), new ColorOverLife(grad([[1, 1, 1, 0], [0.8, 0.9, 1, 1]], [[1, 0], [0.8, 0.7], [0, 1]]))],
  });
}
// Шуба инея поверх участка бака: профиль тела [[r, y]…] между y0 и y1, чуть шире корпуса.
function frostSleeve(prof, y0, y1, seg = 40) {
  const rAt = (y) => { for (let i = 1; i < prof.length; i++) { const [r0, a] = prof[i - 1], [r1, b] = prof[i]; if (y >= a && y <= b) return b === a ? r1 : r0 + (r1 - r0) * (y - a) / (b - a); } return 0; };
  const pts = []; for (let k = 0; k <= 12; k++) { const y = y0 + (y1 - y0) * k / 12; pts.push([rAt(y) + 0.03, y]); }
  const m = mesh(lathe(pts, seg), M.frost, false); m.receiveShadow = true; return m;
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
  burst({ dur: big ? 4.5 : 3, gain: big ? 1.6 : 1.1, f0: 1800, f1: 60 }); burst({ dur: 0.5, gain: 0.9, f0: 4000, f1: 400 });
  flash.position.copy(pos); flash.intensity = big ? 9000 : 5000; shake = REDUCE ? 0 : 0.9;
}


// ── Звук (Web Audio, без файлов): рёв двигателей по тяге, хлопок зажигания, удар ферм, грохот взрыва, сигнал прибытия ──
// Включается первым нажатием «Пуск» (браузер разрешает звук только после действия человека). Кнопка «Звук» выключает.
let AC = null, master, roarG, roarF, subG, noiseBuf, sndOn = true, roarLvl = 0;
// Голос отсчёта — как по громкой связи стартовой площадки (файлы zvuk/*.mp3, 4–7 КБ, грузятся по первому «Пуску»).
const VOICE = { 0: 'start', 3: 'drenazh', 5: 'zazhiganie', 8: 'glavnaya', 9: 'podyom' }, voiceBuf = {};
function voice(i) {
  const b = voiceBuf[VOICE[i]]; if (!AC || !b) return;
  const s = AC.createBufferSource(); s.buffer = b; const g = AC.createGain(); g.gain.value = 1.3; s.connect(g).connect(master); s.start();
}
function audioInit() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
  AC = new C(); master = AC.createGain(); master.gain.value = sndOn ? 0.8 : 0; master.connect(AC.destination);
  if (window.__recAudio) { const d = AC.createMediaStreamDestination(); master.connect(d); window.__audioStream = d.stream; }
  const len = AC.sampleRate * 3, buf = AC.createBuffer(1, len, AC.sampleRate), ch = buf.getChannelData(0); let last = 0;
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; ch[i] = last * 3.5 + w * 0.08; }   // «коричневый» шум с шорохом
  noiseBuf = buf;
  for (const n of Object.values(VOICE)) fetch(new URL('./zvuk/' + n + '.mp3', import.meta.url)).then((r) => r.arrayBuffer()).then((a) => AC.decodeAudioData(a)).then((b) => { voiceBuf[n] = b; }).catch(() => {});
  const src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
  roarF = AC.createBiquadFilter(); roarF.type = 'lowpass'; roarF.frequency.value = 300; roarF.Q.value = 0.7;
  roarG = AC.createGain(); roarG.gain.value = 0; src.connect(roarF).connect(roarG).connect(master); src.start();
  const sub = AC.createOscillator(); sub.type = 'sawtooth'; sub.frequency.value = 38;
  const subF = AC.createBiquadFilter(); subF.type = 'lowpass'; subF.frequency.value = 90;
  subG = AC.createGain(); subG.gain.value = 0; sub.connect(subF).connect(subG).connect(master); sub.start();
}
function burst({ dur = 1.5, gain = 1, f0 = 1200, f1 = 120, q = 0.8, delay = 0 }) {
  if (!AC) return; const t = AC.currentTime + delay;
  const s = AC.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = 0.8 + Math.random() * 0.4;
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(master); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.1);
}
function clank() {   // фермы отходят: металлический удар
  if (!AC) return; const t = AC.currentTime;
  for (const [fr, g0] of [[180, 0.5], [413, 0.3], [767, 0.18]]) {
    const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.value = fr;
    const g = AC.createGain(); g.gain.setValueAtTime(g0, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(g).connect(master); o.start(t); o.stop(t + 1.2);
  }
  burst({ dur: 0.35, gain: 0.6, f0: 2500, f1: 300 });
}
function chime() {   // головная часть дошла
  if (!AC) return; const t = AC.currentTime;
  [[659, 0], [880, 0.18], [1319, 0.36]].forEach(([fr, d]) => {
    const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = fr;
    const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.35, t + d + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 1.6);
    o.connect(g).connect(master); o.start(t + d); o.stop(t + d + 1.7);
  });
}
function soundTick() {
  if (!AC) return;
  const r = rocket; let L = 0;
  if (r && phase === 'count') L = [0, 0.3, 0.55, 1][r.lit || 0];
  else if (r && phase === 'fly') L = Math.max(0.22, 1 - r.g.position.y / 520);
  else if (phase === 'sep') L = Math.max(0, 0.3 - T * 0.03);
  else if (phase === 'tower2' && r && r.spark >= 1 && r.spark < 4) L = 0.25;
  else if (phase === 'map' && mapKind === 'ok' && mapSaid < 2) L = 0.05;
  roarLvl += (L - roarLvl) * 0.08;
  const now = AC.currentTime;
  roarG.gain.setTargetAtTime(roarLvl * 1.1, now, 0.05);
  roarF.frequency.setTargetAtTime(220 + roarLvl * 900 + Math.random() * 60 * roarLvl, now, 0.05);
  subG.gain.setTargetAtTime(roarLvl * 0.35, now, 0.05);
}
function setSnd(on) {
  sndOn = on; if (master) master.gain.setTargetAtTime(on ? 0.8 : 0, AC.currentTime, 0.05);
  const b = ui.root.querySelector('#r3Snd');
  if (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.textContent = on ? 'Звук: включён' : 'Звук: выключен'; }
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
  const profA = [[0, 0], [1.02, 0], [1.07, 0.5], [1.07, 13.8], [1.2, 16.2], [1.47, 18.6], [1.47, 22.6], [1.36, 23.6], [1.22, 24.2],
    [1.05, 25.4], [0.78, 26.9], [0.48, 28.3], [0.24, 29.3], [0.07, 29.85], [0, 29.9]];
  const A = mesh(lathe(profA), M.body);
  g.add(A);
  const frost = [frostSleeve(profA, 17.7, 22.0)], vapor = [];   // кислородный бак центрального блока — под головной частью
  g.add(frost[0]);
  const vA = vaporPS(1.2); vA.emitter.position.y = 21.5; addPS(vA, g); vapor.push(vA);
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
  const profB = [[0, 0], [1.3, 0], [1.34, 0.5], [1.34, 3.2], [1.2, 6.5], [0.98, 10.2], [0.76, 13.4], [0.55, 15.8], [0.36, 17.3], [0.19, 18.3], [0.05, 18.9], [0, 19]];
  const sideGeo = lathe(profB);
  for (let k = 0; k < 4; k++) {
    const phi = k * Math.PI / 2;
    const yaw = new THREE.Group(); yaw.position.set(Math.cos(phi) * R0, 0, Math.sin(phi) * R0); yaw.rotation.y = -phi; g.add(yaw);
    const b = new THREE.Group(); b.rotation.z = TILT; yaw.add(b);
    b.add(mesh(sideGeo, M.body));
    const fb = frostSleeve(profB, 9.5, 16.6, 32); b.add(fb); frost.push(fb);   // кислородный бак бокового блока — в верхнем конусе
    const vb = vaporPS(0.5); vb.emitter.position.y = 16.2; addPS(vb, b); vapor.push(vb);
    const t = mesh(new THREE.CylinderGeometry(1.35, 1.31, 1.0, 36), M.bodyDark); t.position.y = 0.5; b.add(t);
    const fin = mesh(new THREE.BoxGeometry(1.3, 1.1, 0.07), M.bodyDark); fin.position.set(1.85, 0.9, 0); b.add(fin);   // воздушный руль
    const list = [];
    for (const [x, z] of [[0.4, 0.4], [-0.4, 0.4], [0.4, -0.4], [-0.4, -0.4]]) list.push([x, z, 0.35, 1.45, false]);
    list.push([1.02, 0.62, 0.15, 0.7, true], [1.02, -0.62, 0.15, 0.7, true]);
    const bn = []; sopla(b, list, bn); noz.push(...bn);
    sides.push({ yaw, b, phi, noz: bn, tilt: TILT });
  }
  return { g, noz, sides, central: noz.slice(0, 8), kind: 'pack', frost, vapor };
}
// Ракета-башня (для сравнения): первая ступень снизу, вторая сверху — её надо зажечь в полёте.
function makeTower() {
  const g = new THREE.Group(), noz = [];
  const s1 = new THREE.Group(); g.add(s1);
  const prof1 = [[0, 0], [1.5, 0], [1.55, 0.5], [1.55, 15.6], [1.35, 16.6], [0, 16.6]];
  s1.add(mesh(lathe(prof1), M.body));
  const frost = [frostSleeve(prof1, 9, 15.4)], vapor = [vaporPS(1.4)]; s1.add(frost[0]); vapor[0].emitter.position.y = 15; addPS(vapor[0], s1);
  const t = mesh(new THREE.CylinderGeometry(1.57, 1.57, 1.2, 40), M.bodyDark); t.position.y = 0.6; s1.add(t);
  const list = [];
  for (const [x, z] of [[0.5, 0.5], [-0.5, 0.5], [0.5, -0.5], [-0.5, -0.5]]) list.push([x, z, 0.4, 1.6, false]);
  for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; list.push([Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0.17, 0.75, true]); }
  sopla(s1, list, noz);
  const s2 = new THREE.Group(); s2.position.y = 16.6; g.add(s2);
  const prof2 = [[0, 0], [1.3, 0], [1.3, 0.3], [1.3, 8.4], [1.1, 9.4], [0.75, 11.2], [0.38, 12.6], [0.08, 13.3], [0, 13.4]];
  s2.add(mesh(lathe(prof2), M.body));
  frost.push(frostSleeve(prof2, 4.2, 8.2)); s2.add(frost[1]);
  const ring = mesh(new THREE.CylinderGeometry(1.33, 1.33, 0.6, 40), M.bodyDark); ring.position.y = 0.3; s2.add(ring);
  const n2 = []; sopla(s2, [[0, 0, 0.45, 1.2, false]], n2);   // сопло второй ступени — внутри переходника
  return { g, noz, s1, s2, n2, kind: 'tower', frost, vapor };
}

// ── Сцена ──
let rocketLight; let renderer, scene, camera, controls, clock, world, R, sky, flash, padLight, shake = 0;
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
function count(big, small) { ui.count.replaceChildren(); if (!big) return; ui.count.textContent = big; if (small) { const s = document.createElement('small'); s.textContent = small; ui.count.prepend(s); } }
function lock(on) { for (const b of ui.root.querySelectorAll('#r3Ctrl .seg, #r3Go')) b.disabled = on; }
// «Что сделать сейчас» — строка над кнопками: после каждой попытки говорит, что поменять в следующий раз.
const tried = {};
const comboKey = () => (st.scheme === 'pack' ? 'pack-' + st.drop : 'tower');
function hint(t) { ui.hint.textContent = t; }
function nextHint(result) {
  tried[comboKey()] = result;
  const left = [!found.s && 'башню', !found.d && 'пакет с «Везти до конца»'].filter(Boolean);
  if (result === 'tower') hint('Что сделать сейчас: нажми «Начать заново», выбери «Пакетом вокруг центрального» — тогда все двигатели загорятся ещё на земле.');
  else if (result === 'keep') hint('Что сделать сейчас: нажми «Начать заново», оставь пакет, а пустые блоки — «Сбросить». Лишний вес уйдёт, и ракета полетит дальше.');
  else hint(left.length ? 'Ракета дошла. Чтобы найти обе причины неудачи, нажми «Начать заново» и попробуй ' + left.join(', потом ') + ': увидишь, почему так не долетает.'
    : 'Пройдено всё: верная сборка найдена, обе причины неудачи тоже. Можно запускать снова и смотреть с других сторон.');
}
function award(k, n) { if (typeof window.award === 'function') window.award(k, n); }

function setFlames(list, level) {
  for (const n of list) {
    n.ps.emissionOverTime.value = level > 0 ? n.ps.nozzleRate * level : 0;
    n.core.visible = level > 0.3; n.level = level;
    n.halo.visible = level > 0; n.halo.scale.setScalar(n.halo.size * (0.6 + 0.4 * Math.min(level, 1.2)));
  }
}
function setVapor(level) { for (const ps of (rocket && rocket.vapor) || []) ps.emissionOverTime.value = ps.vaporRate * level; }
function disposeRocket() {
  if (!rocket) return;
  for (const n of [...rocket.noz, ...(rocket.n2 || [])]) killPS(n.ps);
  for (const ps of rocket.vapor || []) killPS(ps);
  rocket.g.removeFromParent();
}
// Сборка на глазах: блоки опускаются краном сверху и встают по местам.
let tweens = [];
function tween(dur, delay, fn, done) { tweens.push({ t: -delay, dur, fn, done }); }
function assemble(kind) {
  disposeRocket();
  rocket = kind === 'pack' ? makePack() : makeTower();
  scene.add(rocket.g); rocket.g.position.set(0, 0.3, 0);
  M.frost.opacity = 1; setVapor(1);
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
  audioInit();
  for (const tw of tweens) tw.fn(1);   // сборка ещё идёт — доводим её мгновенно, «Пуск» не теряется
  tweens = [];
  phase = 'count'; T = 0; lock(true); needRapier().catch((e) => console.warn('rapier', e));
  const was = tried[comboKey()];
  say(was === 'tower' || was === 'keep' ? 'Так ты уже пробовал, и ракета не долетела. Пускаем ещё раз — смотри, в какой момент сорвётся.' : 'Обратный отсчёт. Смотри на сцену.');
  hint('Сейчас ничего нажимать не нужно: смотри на сцену и читай под ней, что происходит.');
  // На телефоне сцена и «Пуск» не помещаются в один экран; ушедшая с экрана сцена стоит на паузе — показываем её.
  ui.root.querySelector('#r3Stage').scrollIntoView({ block: 'nearest', behavior: REDUCE ? 'auto' : 'smooth' });
}
function resetAll(msg) {
  mapReset();
  for (const b of bodies) { if (world) world.removeRigidBody(b.body); b.obj.removeFromParent(); }
  bodies = []; follow = null; vel.set(0, 0, 0); dropped = false;
  for (const ps of padSmoke) killPS(ps); padSmoke = []; if (trail) { killPS(trail); trail = null; }
  if (rocket && rocket.s2Holder) rocket.s2Holder.removeFromParent();
  phase = 'build'; T = 0; ui.lastCmd = -1; count(''); padLight.intensity = 0; speedUp = 1; boomAt = null; slowMo = 1;
  assemble(st.scheme === 'pack' ? 'pack' : 'tower');
  sky.material.uniforms.uAlt.value = 0;
  camGoal = null; rocketLight.removeFromParent(); rocketLight.intensity = 0; controls.target.set(0, 13, 0); camera.position.copy(camHome);
  lock(false); say(msg || 'Ракета на столе. Выбери, как её собрать, и нажми «Пуск».');
  if (ui.hint.textContent.startsWith('Сейчас')) hint('Что сделать сейчас: выбери, как собрать ракету и что делать с пустыми блоками, и нажми «Пуск».');
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
  if (phase === 'map') { mapStep(dt); return; }
  if (phase === 'count') {
    const i = Math.min(CMD.length - 1, Math.floor(T / 0.9));   // шаг 0,9 с: голос каждой команды успевает прозвучать
    if (ui.lastCmd !== i) { ui.lastCmd = i; voice(i); count(CMD[i][0], CMD[i][1] ? `T − ${CMD[i][1]} с` : 'старт'); }
    if (i === 3 && !r.drain) { r.drain = 1; setVapor(0); say('Ключ на дренаж: клапаны закрыты, кислород больше не парит — баки под давлением.'); }
    if (i === 5 && !r.lit) { say('Зажигание. Все двигатели загораются ещё на земле, на предварительной ступени тяги.'); r.lit = 1; setFlames(r.kind === 'pack' ? r.noz : r.noz, 0.25); startPadSmoke(0.4); burst({ dur: 1.2, gain: 0.8, f0: 900, f1: 150 }); }
    if (i === 6 && r.lit === 1) { r.lit = 2; setFlames(r.noz, 0.5); }
    if (i === 8 && r.lit === 2) { r.lit = 3; setFlames(r.noz, 1); startPadSmoke(1); shake = REDUCE ? 0 : 0.45; say('Главная ступень — полная тяга. Ракета ещё держится на фермах.'); }
    padLight.intensity = (r.lit || 0) * 2200 * (0.85 + Math.random() * 0.3);
    if (i === 9) { phase = 'fly'; T = 0; liftoff(r); trail = addPS(smokePS({ size: 3.5, life: [3.5, 5], speed: [4, 8], rate: 28, angle: 0.25, radius: 1.5, alpha: 0.55, rise: 0.6 }), r.g); trail.emitter.rotation.x = Math.PI / 2; trail.emitter.position.y = -3; }
    return;
  }
  // Подъём: ускорение растёт по мере выгорания топлива; с 5-й секунды ракета плавно наклоняется к востоку.
  if (phase === 'fly') {
    setTrusses(Math.min(1, T / 1.3) * 1 + 0.0);
    const a = 2.6 + 0.9 * T;
    vel.y += a * dt; const tilt = Math.max(0, Math.min(0.14, (T - 5) * 0.02));
    vel.x = vel.y * Math.sin(tilt);
    r.g.position.addScaledVector(vel, dt); r.g.rotation.z = -tilt;
    if (slowMo < 1 && T > 0.8) slowMo = Math.min(1, slowMo + 0.012);
    rocketLight.intensity = 2600 * (0.85 + Math.random() * 0.3);
    if (!r.saidTilt && T > 5) { r.saidTilt = 1; say('Ракета ложится на курс: на восток, к Камчатке.'); }
    if (!r.saidAlt && r.kind === 'pack' && T > TSEP - 2.5) { r.saidAlt = 1; say(st.drop === 'drop' ? 'Боковые блоки догорают. Сейчас будет разделение — смотри снизу.' : 'Боковые блоки догорают. Пустые баки остаются на ракете.'); }
    padLight.intensity = Math.max(0, 1 - r.g.position.y / 60) * 3000 * (0.85 + Math.random() * 0.3);
    if (T > 2) for (const ps of padSmoke) ps.emissionOverTime.value *= 0.97;
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
      follow = () => p; phase = 'end'; T = 0; mapTimer = setTimeout(() => startMap('tower'), 3200);
      found.s = 1; award('why0', 10); setFound(); nextHint('tower');
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
      r.told = 1; count('Пакет разделился', 'боковые блоки сброшены');
      say('Разделение прошло. Центральный блок с головной частью летит дальше — к Камчатке. Сейчас камера поднимется в космос.');
    }
    if (T > 7.5) { phase = 'end'; follow = null; startMap('ok'); }
    return;
  }
  if (phase === 'tumble') {            // пакет с пустыми баками валится и падает (ускоренно ×3)
    const b = bodies[0]; if (b && b.body.translation().y < 16 && !boomAt) {
      const p = V(b.body.translation().x, 2, b.body.translation().z); boomAt = p;
      boom(p, true); for (const n of r.noz) killPS(n.ps); if (trail) { killPS(trail); trail = null; }
      world.removeRigidBody(b.body); b.obj.removeFromParent(); bodies.shift(); debris(V(p.x, 6, p.z), V(0, 8, 0), SLAB ? 10 : 18);
      follow = () => p; phase = 'end'; speedUp = 1; mapTimer = setTimeout(() => startMap('keep'), 3600);
      found.d = 1; award('why1', 10); setFound(); nextHint('keep');
      count('Падение', 'ракета не долетела');
      say('Топливо в боковых блоках кончилось, а ракета тащит их пустые баки дальше. Мёртвый вес съедает скорость: ракета зависла, свалилась набок и упала. До Камчатки не хватило. У Р-7 две ступени: боковые блоки отработали и отделились.', 'bad');
    }
  }
}

// ── Второй акт: полёт до Камчатки над глобусом (то, что раньше было плоской схемой первой игры) ──
// Земля — Natural Earth 1:110 млн. Высота дуги преувеличена, время сжато; координаты точек — приблизительные.
const RE = 100, D2R = Math.PI / 180;
const TYURATAM = [45.92, 63.34], KURA = [57.3, 160.9];
const MAPF = { ok: 1, tower: 0.16, keep: 0.34 }, MAPDROP = 0.2, MAPCUT = 0.42;
let MAP = null, mapKind = null, mapT = 0, mapTimer = 0, mapSaid = 0;
const ll = (lat, lon, h = 0) => { const la = lat * D2R, ph = (lon + 180) * D2R, r = RE + h; return V(-r * Math.cos(la) * Math.cos(ph), r * Math.sin(la), r * Math.cos(la) * Math.sin(ph)); };
function earthTex() {
  return canvasTex(2048, (g, s) => {
    const W = s, H = s / 2;
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0b1a2e'); gr.addColorStop(0.5, '#123355'); gr.addColorStop(1, '#0b1a2e');
    g.fillStyle = gr; g.fillRect(0, 0, W, s);
    g.strokeStyle = 'rgba(143,165,185,.16)'; g.lineWidth = 1;
    for (let lo = -180; lo <= 180; lo += 15) { const x = (lo + 180) / 360 * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let la = -75; la <= 75; la += 15) { const y = (90 - la) / 180 * H; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const land = feature(land110, land110.objects.land);
    g.fillStyle = '#4c5e3f'; g.strokeStyle = '#b8a77a'; g.lineWidth = 1.4;
    for (const f of land.features) {
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const poly of polys) {
        // Контур, пересекающий линию перемены дат, разворачиваем непрерывно и рисуем трижды со сдвигом на ширину карты.
        for (const sh of [-W, 0, W]) {
          g.beginPath();
          for (const ring of poly) { let prev = null, acc = 0; ring.forEach(([lo, la], i) => { if (prev !== null && Math.abs(lo - prev) > 180) acc += prev > lo ? 360 : -360; prev = lo; const x = (lo + acc + 180) / 360 * W + sh, y = (90 - la) / 180 * H; i ? g.lineTo(x, y) : g.moveTo(x, y); }); }
          g.fill('evenodd'); g.stroke();
        }
      }
    }
  });
}
function buildMap() {
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x02050b);
  const cam = new THREE.PerspectiveCamera(40, camera.aspect, 0.5, 5000);
  const tex = earthTex(); tex.repeat.set(1, 0.5); tex.offset.set(0, 0.5); tex.anisotropy = 8;   // холст квадратный, карта — верхняя половина
  const globe = new THREE.Mesh(new THREE.SphereGeometry(RE, 128, 64), new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 }));
  sc.add(globe);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(RE * 1.035, 64, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vec4 p=modelViewMatrix*vec4(position,1.); vP=p.xyz; gl_Position=projectionMatrix*p; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vP; void main(){ float f=pow(1.-abs(dot(vN,normalize(-vP))),3.); gl_FragColor=vec4(.35,.62,1.,1.)*f*1.4; }',
  }));
  sc.add(atm);
  const starPos = []; let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 1500; i++) { const v = V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(2000 + rnd() * 800); starPos.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  sc.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false })));
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.6); sun.position.copy(ll(20, 95, 300)); sc.add(sun);
  sc.add(new THREE.HemisphereLight(0x8fb4ff, 0x0b1a2e, 0.55));
  // Путь по большому кругу, высота — баллистическая парабола (преувеличена).
  const A = ll(...TYURATAM).normalize(), B = ll(...KURA).normalize(), ang = A.angleTo(B), N = 240, pts = [];
  for (let i = 0; i <= N; i++) { const t = i / N; const d = A.clone().multiplyScalar(Math.sin((1 - t) * ang)).add(B.clone().multiplyScalar(Math.sin(t * ang))).divideScalar(Math.sin(ang)); pts.push(d.normalize().multiplyScalar(RE + 0.15 + 16 * 4 * t * (1 - t))); }
  const at = (t) => { const f = Math.min(N, Math.max(0, t * N)), i = Math.floor(f), j = Math.min(N, i + 1); return pts[i].clone().lerp(pts[j], f - i); };
  const ghost = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0x8fa5b9, dashSize: 1.2, gapSize: 1.4, transparent: true, opacity: 0.55 }));
  ghost.computeLineDistances(); sc.add(ghost);
  const trailG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, 0.32, 8, false); trailG.setDrawRange(0, 0);   // путь — трубка: линия в WebGL всегда в 1 пиксель
  sc.add(new THREE.Mesh(trailG, new THREE.MeshBasicMaterial({ color: 0xf0d27a })));
  const fallG = new THREE.BufferGeometry().setFromPoints(new Array(41).fill(0).map(() => V(0, 0, 0))); fallG.setDrawRange(0, 0);
  sc.add(new THREE.Line(fallG, new THREE.LineBasicMaterial({ color: 0xff8a7a })));
  const dot = (color, size, p) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: texGlow, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); m.scale.setScalar(size); m.position.copy(p); sc.add(m); return m; };
  const start = dot(0xe4c97a, 3.2, ll(...TYURATAM, 0.4)), goal = dot(0xffffff, 3.2, ll(...KURA, 0.4));
  const drop = dot(0xff8a7a, 2.6, at(MAPDROP)); drop.visible = false;
  const hit = dot(0xff5a3c, 9, V()); hit.visible = false;
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  ring.position.copy(ll(...KURA, 0.3)); ring.lookAt(ring.position.clone().multiplyScalar(2)); ring.visible = false; sc.add(ring);
  // Ракета на карте: корпус-игла и факел; после выключения центрального блока летит одна головная часть.
  const rk = new THREE.Group(); sc.add(rk);
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.6, 12), new THREE.MeshStandardMaterial({ color: 0xeef2f4, roughness: 0.5, emissive: 0x334455 })); rk.add(body);
  const torch = dot(0xffb050, 3.4, V(0, -1.9, 0)); rk.remove(torch); rk.add(torch);
  const mid = A.clone().add(B).normalize();
  MAP = { sc, cam, at, pts, N, trailG, fallG, start, goal, drop, hit, ring, rk, body, torch, mid, A };
}
function startMap(kind) {
  if (!MAP) buildMap();
  const m = MAP, cv = renderer.domElement;
  mapKind = kind; mapT = 0; mapSaid = 0;
  m.trailG.setDrawRange(0, 0); m.fallG.setDrawRange(0, 0); m.drop.visible = false; m.hit.visible = false; m.ring.visible = false;
  m.rk.visible = true; m.body.scale.set(1, 1, 1); m.torch.visible = true; m.torch.material.color.set(0xffb050); m.torch.position.set(0, -1.9, 0); m.torch.scale.setScalar(3.4);
  m.cam.aspect = camera.aspect; m.cam.updateProjectionMatrix();
  cv.style.transition = 'opacity .4s'; cv.style.opacity = '0';
  mapTimer = setTimeout(() => { phase = 'map'; T = 0; cv.style.opacity = '1'; for (const ps of [...live]) if (ps.emitter && ps.emitter.parent) ps.emitter.visible = false;
    count('Полёт до Камчатки', 'путь по карте · высота преувеличена, время сжато');
    say(kind === 'ok' ? 'Полёт до Камчатки. Золотая точка — старт в Тюра-Таме, белая — полигон Кура на Камчатке. Золотая линия — путь ракеты.'
      : 'Теперь на карте: золотая точка — старт в Тюра-Таме, белая — полигон Кура на Камчатке, куда ракета должна была долететь.'); }, 420);
}
function mapStep(dt) {
  const m = MAP, F = MAPF[mapKind], dur = mapKind === 'ok' ? 11 : 6;
  mapT = Math.min(1, mapT + dt / dur);
  const p = Math.min(F, mapT / (mapKind === 'ok' ? 1 : 0.75) * F);   // у аварий — последняя четверть времени на падение
  m.trailG.setDrawRange(0, Math.round(p * m.N) * 8 * 6);
  let pos = m.at(p), ahead = m.at(Math.min(1, p + 0.004));
  if (mapKind !== 'ok' && mapT > 0.75) {   // ветка падения: от точки аварии вниз к земле
    const u = (mapT - 0.75) / 0.25, top = m.at(F), gnd = top.clone().normalize().multiplyScalar(RE + 0.2).add(m.at(F + 0.03).sub(top).multiplyScalar(0.6)).normalize().multiplyScalar(RE + 0.2);
    const arr = m.fallG.attributes.position; const n = Math.round(u * 40);
    for (let i = 0; i <= 40; i++) { const k = Math.min(i, n) / 40; const q = top.clone().lerp(gnd, k * k); arr.setXYZ(i, q.x, q.y, q.z); }
    arr.needsUpdate = true; m.fallG.setDrawRange(0, n + 1);
    ahead = pos.clone(); pos = top.clone().lerp(gnd, u * u); m.torch.visible = false;
    if (u >= 1 && !m.hit.visible) { m.hit.visible = true; m.hit.position.copy(gnd); m.rk.visible = false; }
  }
  if (m.rk.visible) { m.rk.position.copy(pos); const dir = ahead.clone().sub(pos); if (dir.lengthSq() > 1e-6) m.rk.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize()); }
  m.torch.material.opacity = 0.75 + Math.random() * 0.25;
  if (m.hit.visible) m.hit.material.opacity = Math.max(0.35, m.hit.material.opacity * 0.97);
  if (mapKind === 'ok') {
    if (p >= MAPDROP && mapSaid < 1) { mapSaid = 1; m.drop.visible = true; say('Красная точка — здесь отделились пустые боковые блоки. Дальше летит центральный блок с головной частью.'); }
    if (p >= MAPCUT && mapSaid < 2) { mapSaid = 2; m.torch.visible = false; m.body.scale.set(0.8, 0.35, 0.8); say('Центральный блок отработал. Головная часть отделилась и летит дальше сама, по инерции, через всю Сибирь.'); }
    if (p >= 0.84 && mapSaid < 2.5) { mapSaid = 2.5; m.torch.visible = true; m.torch.material.color.set(0xff7a30); m.torch.position.set(0, 0.6, 0); say('Головная часть входит в атмосферу и раскаляется — до Камчатки считанные секунды.'); }
    if (mapSaid === 2.5) m.torch.scale.setScalar(7 + 4 * Math.sin(performance.now() / 60) ** 2 + (p - 0.84) * 70);
    if (p >= 1 && mapSaid < 3) {
      mapSaid = 3; m.rk.visible = false; m.ring.visible = true; m.hit.visible = true; m.hit.material.color.set(0xffffff); m.hit.position.copy(m.goal.position);
      award('lab', 30); count('Дошла!', 'полигон Кура, Камчатка'); nextHint('ok'); chime();
      say('Дошла! Пакет, все двигатели зажжены на земле, пустые боковые блоки сброшены — так 21 августа 1957 года головная часть дошла до полигона Кура на Камчатке. Честная оговорка: в плотных слоях атмосферы она разрушилась, её доводили дальше.', 'ok');
    }
    if (m.ring.visible) { const k = 1 + ((performance.now() / 900) % 1) * 3; m.ring.scale.setScalar(k); m.ring.material.opacity = 1 - (k - 1) / 3; }
    count(p < 1 ? `Пройдено ${Math.round(p * 100)} % пути` : 'Дошла!', p < 1 ? 'до полигона Кура · время сжато' : 'полигон Кура, Камчатка');
  } else if (mapT >= 1 && mapSaid < 1) {
    mapSaid = 1; count('Не долетела', 'до Камчатки далеко');
    say(mapKind === 'tower'
      ? 'Красная точка — здесь упала ракета-башня: вторая ступень не зажглась в полёте. Пройдена малая часть пути, до Камчатки далеко. В пакете Королёва все двигатели запускаются ещё на земле.'
      : 'Красная точка — здесь упала ракета с пустыми боковыми блоками. Мёртвый вес съел скорость, до Камчатки не хватило. У Р-7 две ступени: боковые блоки отработали — и отделились.', 'bad');
  }
  // Камера: от старта, сбоку от ракеты — к общему виду всей дуги над Азией.
  const e = ease(Math.min(1, mapT * 1.15)), P = mapKind === 'ok' ? p : F;
  const look = m.at(Math.min(1, P)).lerp(m.mid.clone().multiplyScalar(RE), mapKind === 'ok' ? e : e * 0.5);
  const north = V(0, 1, 0).sub(m.mid.clone().multiplyScalar(m.mid.y)).normalize(), k = camera.aspect < 1 ? 1.45 : 1;
  const near = m.A.clone().multiplyScalar(RE + 42 * k).addScaledVector(north, -48 * k), far = m.mid.clone().multiplyScalar(RE + 95 * k).addScaledVector(north, -120 * k);
  m.cam.position.copy(near.lerp(far, mapKind === 'ok' ? e : e * 0.6)); m.cam.lookAt(look);
}
function mapReset() { clearTimeout(mapTimer); mapKind = null; renderer.domElement.style.opacity = '1'; for (const ps of live) if (ps.emitter) ps.emitter.visible = true; }

// Отрыв: камера держит ракету чуть выше центра кадра и отъезжает, чтобы в кадре были пламя, фермы и шлейф.
function liftoff(r) {
  clank();
  say('Подъём! Фермы раскрылись, и ракета уходит со стола на столбе огня.');
  slowMo = REDUCE ? 1 : 0.45; shake = REDUCE ? 0 : 0.7;
  const ice = icePS(); ice.emitter.position.set(0, 18, 0); ice.emitter.rotation.x = Math.PI / 2; addPS(ice, r.g); setTimeout(() => killPS(ice), 5000);
  tween(2.2, 0.2, (t) => { M.frost.opacity = 1 - 0.75 * t; });   // иней осыпается от тряски и пламени
  r.g.add(rocketLight); rocketLight.position.set(0, -14, 0); rocketLight.intensity = 2600;
  follow = () => r.g.position.clone().add(V(0, 4 - Math.min(10, r.g.position.y * 0.08), 0));
  if (!dragging) { const dir = camera.position.clone().sub(controls.target).setY(0).normalize(); camGoal = dir.multiplyScalar(camera.aspect < 1 ? 105 : 80).setY(-14); }
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
  burst({ dur: 0.6, gain: 0.7, f0: 3000, f1: 300 }); burst({ dur: 0.6, gain: 0.5, f0: 2500, f1: 250, delay: 0.12 });   // пироболты
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
    say('Разделение! Четыре пустых блока отходят «крестом Королёва», центральный летит дальше.');
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
    const ring = addPS(smokePS({ size: 10, life: [4, 7], speed: [9, 17], rate: 22, angle: 1.35, radius: 4, alpha: 0.6, rise: 1.8 }));
    ring.emitter.position.set(0, 1, 0); ring.emitter.rotation.x = -Math.PI / 2;
    const duct = addPS(smokePS({ size: 11, life: [4.5, 8], speed: [24, 38], rate: 26, angle: 0.3, radius: 3, alpha: 0.62, rise: 3 }));
    duct.emitter.position.set(-16, 0.5, 0); duct.emitter.rotation.order = 'YXZ'; duct.emitter.rotation.y = -Math.PI / 2; duct.emitter.rotation.x = -0.25;
    padSmoke = [ring, duct];
  }
  for (const ps of padSmoke) ps.emissionOverTime.value = (ps === padSmoke[0] ? 22 : 26) * Math.max(K, 0.7) * level;
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
  if (camera.position.y < 3) camera.position.y = 3;   // камера не уходит под бетон стола
  for (const n of rocket ? rocket.noz.concat(rocket.n2 || []) : []) if (n.core.visible) { const f = 0.85 + Math.random() * 0.3; n.core.scale.set(f, (0.8 + Math.random() * 0.4) * (n.level || 1), f); n.halo.scale.setScalar(n.halo.size * f * (0.6 + 0.4 * Math.min(n.level, 1.2))); }
  flash.intensity *= 0.86; if (shake > 0.01) { camera.position.add(V(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(shake)); shake *= 0.9; }
  const alt = rocket ? rocket.g.position.y : 0;
  if (phase === 'fly') sky.material.uniforms.uAlt.value = Math.min(0.55, alt / 600);
  scene.fog.far = 2600 + Math.max(alt, controls.target.y) * 5;
  controls.maxPolarAngle = phase === 'build' || phase === 'count' ? Math.PI * 0.485 : Math.PI * 0.94;   // на столе — не под землю
  controls.update();
  batch.update(dt); soundTick();
  if (phase === 'map') renderer.render(MAP.sc, MAP.cam); else renderer.render(scene, camera);
  fps.n++; fps.t += dt; if (fps.t >= 1) { window.__r7fps = Math.round(fps.n / fps.t); fps.n = 0; fps.t = 0; }
}

export async function zapusk(root) {
  const stage = root.querySelector('#r3Stage');
  ui = { root, msg: root.querySelector('#r3Msg'), count: root.querySelector('#r3Count'), found: root.querySelector('#r3Found'), hint: root.querySelector('#r3Hint') };
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
  rocketLight = new THREE.PointLight(0xffa24a, 0, 260, 1.4); padLight = new THREE.PointLight(0xff9a40, 0, 140, 1.6); padLight.position.set(0, -1, 0); scene.add(padLight);
  flash = new THREE.PointLight(0xffb060, 0, 400, 1.4); scene.add(flash);
  batch = new BatchedRenderer(); scene.add(batch);
  makeSky(); buildPad();
  assemble('tower');
  const resize = () => { const W = stage.clientWidth, H = stage.clientHeight; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); if (MAP) { MAP.cam.aspect = W / H; MAP.cam.updateProjectionMatrix(); } };
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
  const sb = root.querySelector('#r3Snd'); if (sb) sb.addEventListener('click', () => { audioInit(); setSnd(!sndOn); });
  root.querySelector('#r3Reset').addEventListener('click', () => {
    st = { scheme: 'tower', drop: 'keep' };
    segs.forEach((x) => x.setAttribute('aria-pressed', x.dataset.v === 'tandem' || x.dataset.v === 'keep' ? 'true' : 'false'));
    resetAll('Ракета снова на столе. Уже полученные баллы сохраняются и повторно не начисляются.');
  });
  root.querySelector('#r3Ctrl').hidden = false;
  root.setAttribute('data-sostoyanie', 'gotovo');
  hint('Что сделать сейчас: выбери в пункте 1, как собрать ракету, в пункте 2 — что делать с пустыми блоками, и нажми «Пуск». Сцену можно крутить пальцем или мышью.');
  say('Ракета на столе, пока башней. Выбери, как её собрать, и нажми «Пуск».');
  loop();
  audioInit();   // контекст создаётся «спящим», голоса успевают загрузиться; оживает по «Пуску»
  window.__r7 = { st: () => ({ phase, T }), pick: (k, v) => root.querySelector(`#r3Ctrl .seg[data-k="${k}"][data-v="${v}"]`).click() };
}

/* Сборка (из корня rc-site, esbuild — во временной папке, в сайт не ставится):
   node /tmp/r495/build/build.mjs — бандл ESM с разделением: scena.js (three + three.quarks + сцена),
   чанк Rapier (@dimforge/rapier3d-compat) грузится по «Пуску»; WASM вынесен из base64 в rapier.wasm. */
