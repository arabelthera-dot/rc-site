// rc3d · Частицы three.quarks: огонь, факел сопла, дым, пар, холодный пар, искры, пыль, взрыв.
// Источник частиц — «fx» в сценарии: {id, kind, parent, pos, dir, rate, size, speed, life, color, spread, radius, rise}.
// Уровень источника (0…1+) меняют события emit/stop; взрыв — разовый выброс (emit с kind:"explosion").
import * as THREE from 'three';
import {
  BatchedRenderer, ParticleSystem, ConeEmitter, SphereEmitter, PointEmitter, IntervalValue, ConstantValue, ColorRange,
  Gradient, ColorOverLife, SizeOverLife, ApplyForce, PiecewiseBezier, Bezier, RenderMode, Vector4, Vector3 as QV3,
} from 'three.quarks';
import { texGlow, texSmoke } from './tekstury.mjs';

export const SLAB = typeof matchMedia !== 'undefined' && (matchMedia('(pointer: coarse)').matches || innerWidth < 760);
const K = SLAB ? 0.5 : 1;
const grad = (cols, alphas) => new Gradient(cols.map(([r, g, b, t]) => [new QV3(r, g, b), t]), alphas);
const curve = (a, b, c, d) => new PiecewiseBezier([[new Bezier(a, b, c, d), 0]]);
const iv = (a, d) => (Array.isArray(a) ? new IntervalValue(a[0], a[1]) : new IntervalValue(a * (1 - d), a * (1 + d)));
const col = (c) => { const x = new THREE.Color(c); return [x.r, x.g, x.b]; };

const MAT = {};
const mat = (k) => MAT[k] || (MAT[k] = {
  add: new THREE.MeshBasicMaterial({ map: texGlow(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }),
  smoke: new THREE.MeshBasicMaterial({ map: texSmoke(), transparent: true, depthWrite: false }),
  fire: new THREE.MeshBasicMaterial({ map: texSmoke(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }),
}[k]);

// Готовые виды. Значения по умолчанию подобраны в Р-7; сценарий переопределяет size/speed/life/rate/color.
const KINDS = {
  flame: (o) => ({ life: [0.26, 0.5], speed: [26 * o.size + 8, 36 * o.size + 10], size: [1.0 * o.size, 1.7 * o.size], spread: 0.07, radius: 0.32 * o.size, rate: 70 * Math.max(0.55, o.size),
    m: 'add', c0: [1, 0.95, 0.85], c1: [1, 0.78, 0.5], grad: grad([[1, 1, 0.92, 0], [1, 0.66, 0.2, 0.35], [0.85, 0.28, 0.06, 1]], [[1, 0], [0.85, 0.4], [0, 1]]), sz: curve(0.55, 1.2, 1.9, 2.6) }),
  fire: (o) => ({ life: [0.6, 1.2], speed: [1.5 * o.size, 3.5 * o.size], size: [0.8 * o.size, 1.6 * o.size], spread: 0.35, radius: 0.5 * o.size, rate: 40, rise: 3 * o.size,
    m: 'fire', c0: [1, 0.9, 0.6], c1: [1, 0.6, 0.25], grad: grad([[1, 0.95, 0.7, 0], [1, 0.5, 0.12, 0.4], [0.4, 0.1, 0.03, 1]], [[1, 0], [0.8, 0.5], [0, 1]]), sz: curve(0.7, 1.1, 0.9, 0.4) }),
  smoke: (o) => ({ life: [3, 5], speed: [2 * o.size, 4 * o.size], size: [0.7 * o.size, 1.3 * o.size], spread: 0.5, radius: 0.3 * o.size, rate: 20, rise: 0.5 * o.size, alpha: 0.75,
    m: 'smoke', c0: o.color ? col(o.color) : [0.86, 0.85, 0.83], grad: grad([[1, 0.82, 0.62, 0], [1, 1, 1, 0.25], [0.95, 0.95, 0.95, 1]], [[0, 0], [1, 0.08], [0.7, 0.5], [0, 1]]), sz: curve(0.6, 1.6, 2.6, 3.4) }),
  steam: (o) => ({ life: [1.6, 3], speed: [1.5 * o.size, 3 * o.size], size: [0.6 * o.size, 1.2 * o.size], spread: 0.35, radius: 0.15 * o.size, rate: 26, rise: 1.2 * o.size, alpha: 0.6,
    m: 'smoke', c0: o.color ? col(o.color) : [1, 1, 1], grad: grad([[1, 1, 1, 0], [1, 1, 1, 1]], [[0, 0], [1, 0.12], [0.5, 0.5], [0, 1]]), sz: curve(0.4, 1.3, 2.2, 3) }),
  vapor: (o) => ({ life: [2.4, 4], speed: [0.5 * o.size, 1.3 * o.size], size: [0.9 * o.size, 1.7 * o.size], spread: 1.1, radius: 0.5 * o.size, rate: 16, rise: -1.6, alpha: 0.7,
    m: 'smoke', c0: [1, 1, 1], grad: grad([[1, 1, 1, 0], [1, 1, 1, 1]], [[0, 0], [1, 0.15], [0.6, 0.55], [0, 1]]), sz: curve(0.5, 1.4, 2.3, 3) }),
  sparks: (o) => ({ life: [0.5, 1.4], speed: [6 * o.size, 14 * o.size], size: [0.08 * o.size, 0.2 * o.size], spread: 0.6, radius: 0.05, rate: 60, rise: -9.8,
    m: 'add', c0: [1, 0.9, 0.6], c1: [1, 0.6, 0.2], grad: grad([[1, 1, 1, 0], [1, 0.4, 0.1, 1]], [[1, 0], [0, 1]]) }),
  dust: (o) => ({ life: [2, 4], speed: [1 * o.size, 3 * o.size], size: [0.8 * o.size, 1.6 * o.size], spread: 1.3, radius: 1 * o.size, rate: 14, rise: 0.2, alpha: 0.5,
    m: 'smoke', c0: o.color ? col(o.color) : [0.72, 0.62, 0.45], grad: grad([[1, 1, 1, 0], [1, 1, 1, 1]], [[0, 0], [1, 0.1], [0.5, 0.6], [0, 1]]), sz: curve(0.6, 1.4, 2, 2.6) }),
};

export class Chasticy {
  constructor(scene) { this.scene = scene; this.batch = new BatchedRenderer(); scene.add(this.batch); this.live = new Set(); this.src = {}; }
  add(ps, parent) { this.batch.addSystem(ps); (parent || this.scene).add(ps.emitter); this.live.add(ps); return ps; }
  kill(ps) { if (!this.live.has(ps)) return; this.live.delete(ps); this.batch.deleteSystem(ps); ps.emitter.removeFromParent(); ps.dispose(); }
  // Постоянный источник из сценария. Сначала выключен (уровень 0), если не задано on:true.
  source(spec, parent) {
    const o = { size: 1, ...spec }, base = (KINDS[o.kind] || KINDS.smoke)(o);
    const life = o.life ?? base.life, speed = o.speed ?? base.speed, size = o.size0 ?? base.size;
    const c0 = o.color && base.m !== 'smoke' ? col(o.color) : base.c0, c1 = base.c1 || c0.map((v) => v * 0.92), a = o.alpha ?? base.alpha ?? 1;
    const behaviors = [new ColorOverLife(base.grad)];
    if (base.sz) behaviors.push(new SizeOverLife(base.sz));
    const rise = o.rise ?? base.rise;
    if (rise) behaviors.push(new ApplyForce(new QV3(0, Math.sign(rise), 0), new ConstantValue(Math.abs(rise))));
    const ps = new ParticleSystem({
      duration: 1, looping: true, worldSpace: o.world !== false,
      startLife: iv(life, 0.3), startSpeed: iv(speed, 0.3), startSize: iv(size, 0.3), startRotation: new IntervalValue(0, 6.28),
      startColor: new ColorRange(new Vector4(c0[0], c0[1], c0[2], a), new Vector4(c1[0], c1[1], c1[2], a)),
      shape: new ConeEmitter({ radius: o.radius ?? base.radius, angle: o.spread ?? base.spread, thickness: 1, arc: Math.PI * 2 }),
      emissionOverTime: new ConstantValue(0), material: mat(base.m), renderMode: RenderMode.BillBoard, behaviors,
    });
    ps.emitter.position.fromArray(o.pos || [0, 0, 0]);
    // Направление выброса: конус эмиттера смотрит по +Z, поворачиваем его на «dir» (по умолчанию вверх).
    const dir = new THREE.Vector3().fromArray(o.dir || [0, 1, 0]).normalize();
    ps.emitter.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    ps.rate0 = (o.rate ?? base.rate) * (base.m === 'add' && o.kind === 'flame' ? (SLAB ? 0.5 : 1) : K);
    this.add(ps, parent);
    const s = { ps, kind: o.kind, level: 0, spec: o };
    // Факел сопла: яркое ядро-конус и ореол у среза — как в Р-7.
    if (o.kind === 'flame') {
      const m = new THREE.MeshBasicMaterial({ map: texGlow(), color: 0xffd9a0, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      const len = o.core ?? 4 * o.size;
      s.core = new THREE.Mesh(new THREE.ConeGeometry(0.3 * o.size, len, 12, 1, true), m);
      s.core.geometry.translate(0, len / 2, 0);   // основание у среза сопла, вершина — по направлению струи
      s.core.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      s.core.position.copy(ps.emitter.position); s.core.visible = false;
      s.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texGlow(), color: 0xff9a3c, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
      s.halo.position.copy(ps.emitter.position); s.halo.visible = false; s.halo.size = 4 * o.size;
      (parent || this.scene).add(s.core, s.halo);
    }
    if (spec.id) this.src[spec.id] = s;
    if (o.on) this.level(s, o.on === true ? 1 : o.on);
    return s;
  }
  level(s, l) {
    s.level = l; s.ps.emissionOverTime.value = l > 0 ? s.ps.rate0 * l : 0;
    if (s.core) { s.core.visible = l > 0.3; s.halo.visible = l > 0; }
  }
  // Разовый взрыв: огненный шар, чёрный дым, искры (из Р-7). size — множитель, 1 ≈ 10 м.
  boom(pos, size = 1, opts = {}) {
    const s = size, out = [];
    const once = (n) => [{ time: 0, count: new ConstantValue(Math.round(n * (SLAB ? 0.6 : 1))), cycle: 1, interval: 0.01, probability: 1 }];
    const common = { duration: 0.5, looping: false, worldSpace: true, emissionOverTime: new ConstantValue(0) };
    if (opts.fire !== false) out.push(new ParticleSystem({ ...common, emissionBursts: once(110),
      startLife: new IntervalValue(0.7, 1.7), startSpeed: new IntervalValue(6 * s, 26 * s), startSize: new IntervalValue(5 * s, 11 * s),
      startRotation: new IntervalValue(0, 6.28), startColor: new ColorRange(new Vector4(1, 0.95, 0.8, 1), new Vector4(1, 0.7, 0.35, 1)),
      shape: new SphereEmitter({ radius: 2.5 * s, thickness: 1 }), material: mat('fire'), renderMode: RenderMode.BillBoard,
      behaviors: [new ColorOverLife(grad([[1, 1, 0.85, 0], [1, 0.55, 0.12, 0.3], [0.45, 0.1, 0.03, 1]], [[1, 0], [0.9, 0.5], [0, 1]])), new SizeOverLife(curve(0.5, 1.5, 2.2, 2.6))] }));
    out.push(new ParticleSystem({ ...common, emissionBursts: once(70),
      startLife: new IntervalValue(3, 5.5), startSpeed: new IntervalValue(3 * s, 12 * s), startSize: new IntervalValue(8 * s, 15 * s),
      startRotation: new IntervalValue(0, 6.28), startColor: new ColorRange(new Vector4(0.2, 0.18, 0.17, 0.9), new Vector4(0.33, 0.3, 0.28, 0.9)),
      shape: new SphereEmitter({ radius: 3 * s, thickness: 1 }), material: mat('smoke'), renderMode: RenderMode.BillBoard,
      behaviors: [new ColorOverLife(grad([[1, 0.5, 0.25, 0], [1, 1, 1, 0.2], [1, 1, 1, 1]], [[0, 0], [1, 0.1], [0.6, 0.6], [0, 1]])), new SizeOverLife(curve(0.4, 1.4, 2.4, 3.2)), new ApplyForce(new QV3(0, 1, 0), new ConstantValue(3))] }));
    out.push(new ParticleSystem({ ...common, emissionBursts: once(90),
      startLife: new IntervalValue(0.8, 2.2), startSpeed: new IntervalValue(25 * s, 70 * s), startSize: new IntervalValue(0.35 * Math.sqrt(s), 0.8 * Math.sqrt(s)),
      startColor: new ColorRange(new Vector4(1, 0.9, 0.6, 1), new Vector4(1, 0.6, 0.2, 1)),
      shape: new PointEmitter(), material: mat('add'), renderMode: RenderMode.BillBoard,
      behaviors: [new ApplyForce(new QV3(0, -1, 0), new ConstantValue(22 * s)), new ColorOverLife(grad([[1, 1, 1, 0], [1, 0.4, 0.1, 1]], [[1, 0], [0, 1]]))] }));
    for (const ps of out) { ps.emitter.position.copy(pos); this.add(ps); setTimeout(() => this.kill(ps), 7000); }
  }
  // Короткий клуб (хлопок пироболта, выброс пара): разовая порция дыма заданного цвета.
  puff(pos, size = 1, color = [0.9, 0.9, 0.9], n = 18) {
    const ps = new ParticleSystem({ duration: 0.5, looping: false, worldSpace: true, emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(n), cycle: 1, interval: 0.01, probability: 1 }],
      startLife: new IntervalValue(1.2, 2.2), startSpeed: new IntervalValue(2 * size, 5 * size), startSize: new IntervalValue(1.5 * size, 2.6 * size), startRotation: new IntervalValue(0, 6.28),
      startColor: new ColorRange(new Vector4(color[0], color[1], color[2], 0.8), new Vector4(color[0], color[1], color[2], 0.8)),
      shape: new SphereEmitter({ radius: 0.4 * size, thickness: 1 }), material: mat('smoke'), renderMode: RenderMode.BillBoard,
      behaviors: [new ColorOverLife(grad([[1, 1, 1, 0], [1, 1, 1, 1]], [[0, 0], [1, 0.1], [0, 1]])), new SizeOverLife(curve(0.5, 1.4, 2.2, 2.8))] });
    ps.emitter.position.copy(pos); this.add(ps); setTimeout(() => this.kill(ps), 4000);
  }
  // Мерцание факелов: каждый кадр ядро и ореол чуть «дышат».
  tick(dt) {
    for (const s of Object.values(this.src)) if (s.core && s.level > 0) {
      const f = 0.85 + Math.random() * 0.3; s.core.scale.set(f, (0.8 + Math.random() * 0.4) * s.level, f);
      s.halo.scale.setScalar(s.halo.size * f * (0.6 + 0.4 * Math.min(s.level, 1.2)));
    }
    this.batch.update(dt);
  }
  hideAll(on) { for (const ps of this.live) if (ps.emitter) ps.emitter.visible = !on; }
}
