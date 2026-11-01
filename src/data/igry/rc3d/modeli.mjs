// rc3d · Тело-модель glTF/GLB: люди, животные, предметы с диска.
// Сценарий: {"id":"kotelnikov","type":"model","src":"models/chelovek-1912.glb","height":1.78,"anim":"Idle",
//   "tint":{"Peasant":"#56604a","Hair":"#3a2a1e"},"hide":["Hair_Buzzed"],"pose":"stand"}
// Клип ищется по точному имени, затем по окончанию ("Idle" найдёт "Idle_Loop" и "HumanArmature|Man_Idle").
// Позы людей (stand, sit, kneel, wave, arms-up, arms-forward, spread) — это клип + доворот плечей/бёдер в осях тела,
// так что одна таблица поз годится и для старых «человечков» из цилиндров, и для любого скелета-гуманоида.
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { gltf } from './zagruzka.mjs';

const norm = (s) => String(s || '').toLowerCase().replace(/mixamorig:?/g, '').replace(/[^a-z0-9]/g, '');
// Кости гуманоида по разным соглашениям имён (UE/Quaternius UAL, Quaternius старый, Mixamo).
const BONES = {
  ual: ['upperarml', 'leftarm', 'larm'], lal: ['lowerarml', 'leftforearm', 'forearml'],
  uar: ['upperarmr', 'rightarm', 'rarm'], lar: ['lowerarmr', 'rightforearm', 'forearmr'],
  thl: ['thighl', 'upperlegl', 'leftupleg'], cal: ['calfl', 'lowerlegl', 'leftleg'],
  thr: ['thighr', 'upperlegr', 'rightupleg'], car: ['calfr', 'lowerlegr', 'rightleg'],
};
// Клипы поз: первый найденный. Доворот: направление кости в осях тела (x — в сторону своей руки/ноги, y — вверх, z — вперёд).
const UP = [0.22, 1, 0.08], OUT = [1, 0.25, 0.05], FWD = [0.12, -0.05, 1];
export const HUMAN = {
  stand: { clip: ['Idle_Loop', 'Idle', 'Standing'] },
  sit: { clip: ['Sitting_Idle_Loop', 'Sitting', 'Sit'], dir: { thl: [0.12, -0.05, 1], thr: [0.12, -0.05, 1] }, ifNoClip: true },
  kneel: { clip: ['Crouch_Idle_Loop', 'Fixing_Kneeling', 'Kneel', 'Crouch'] },
  wave: { clip: ['Idle_Loop', 'Idle'], dir: { uar: [0.35, 1, 0.1], lar: [0.15, 1, 0.25] } },
  'arms-up': { clip: ['Idle_Loop', 'Idle'], dir: { ual: UP, lal: UP, uar: UP, lar: UP } },
  'arms-forward': { clip: ['Idle_Loop', 'Idle'], dir: { ual: FWD, lal: FWD, uar: FWD, lar: FWD } },
  spread: { clip: ['Jump_Loop', 'Swim_Idle_Loop', 'Idle'], dir: { ual: OUT, lal: OUT, uar: OUT, lar: OUT, thl: [0.38, -1, 0.05], thr: [0.38, -1, 0.05], cal: [0.38, -1, 0], car: [0.38, -1, 0] } },
  walk: { clip: ['Walk_Loop', 'Walk'] }, run: { clip: ['Jog_Fwd_Loop', 'Run', 'Jog', 'Walk'] },
};
const ORDER = ['ual', 'uar', 'thl', 'thr', 'lal', 'lar', 'cal', 'car'];   // родители раньше детей

export class Model {
  constructor(spec, g) {
    this.spec = spec; this.clips = g.animations || [];
    this.root = SkeletonUtils.clone(g.scene);
    this.mats = [];
    const tint = Object.entries(spec.tint || {}).map(([k, c]) => [norm(k), new THREE.Color(c)]);
    const hide = (spec.hide || []).map(norm);
    this.root.traverse((m) => {
      if (hide.some((h) => norm(m.name).includes(h))) m.visible = false;
      if (!m.isMesh) return;
      m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
      for (const mt of [].concat(m.material)) {
        const t = tint.find(([k]) => norm(mt.name).includes(k) || norm(m.name).includes(k));
        if (t) mt.color.copy(t[1]);
        if (spec.rough != null) mt.roughness = spec.rough;
        mt.side = THREE.FrontSide; mt.envMapIntensity = spec.env ?? 1;
        this.mats.push(mt);
      }
      m.castShadow = spec.shadow !== false; m.receiveShadow = spec.shadow !== false;
      if (m.isSkinnedMesh) m.frustumCulled = false;   // рамка скина не следит за позой — не отсекать
    });
    // Рост: "height" — подогнать модель к росту в метрах (по рамке в исходной позе).
    if (spec.height) { const b = new THREE.Box3().setFromObject(this.root), h = b.max.y - b.min.y; if (h > 0) this.root.scale.multiplyScalar(spec.height / h); }
    if (spec.yaw) this.root.rotation.y = spec.yaw * Math.PI / 180;   // разворот модели внутри тела (если смотрит не по +Z)
    this.o = new THREE.Group(); this.o.add(this.root);
    // Кости гуманоида.
    const all = {}; this.root.traverse((n) => { if (n.isBone || n.type === 'Bone') all[norm(n.name)] = n; });
    this.bonesAll = all; this.bones = {};
    for (const [k, names] of Object.entries(BONES)) for (const n of names) if (all[n]) { this.bones[k] = { bone: all[n], child: all[n].children.find((c) => c.isBone) || null }; break; }
    this.human = !!(this.bones.ual && this.bones.uar);
    this.mixer = this.clips.length ? new THREE.AnimationMixer(this.root) : null;
    this.cur = null; this.ov = {}; this.speed = 1;
    this.reset();
  }
  clip(name) {
    if (!name) return null; const n = norm(name);
    return this.clips.find((c) => c.name === name) || this.clips.find((c) => norm(c.name).endsWith(n)) || this.clips.find((c) => norm(c.name).includes(n)) || null;
  }
  // Клип по имени (или первый найденный из списка). once — проиграть один раз и замереть на последнем кадре.
  play(names, { fade = 0.3, speed, once } = {}) {
    if (!this.mixer) return false;
    const c = [].concat(names).map((n) => this.clip(n)).find(Boolean); if (!c) return false;
    const a = this.mixer.clipAction(c);
    if (speed != null) a.timeScale = speed;
    a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = !!once;
    if (a === this.cur) return true;
    a.reset(); a.setEffectiveWeight(1); a.play();
    if (this.cur && fade > 0) this.cur.crossFadeTo(a, fade, false); else if (this.cur) this.cur.stop();
    if (this.cur && fade > 0) { const old = this.cur; setTimeout(() => { if (old !== this.cur) old.stop(); }, fade * 1000 + 50); }
    this.cur = a; return true;
  }
  // Поза: клип позы + доворот костей; dur — время перехода. В своих позах сценария ("poses") once:true — клип один раз
  // с остановкой на последнем кадре (приземление), speed — скорость клипа.
  pose(name, dur = 0.3) {
    const P = (this.spec.poses && this.spec.poses[name]) || HUMAN[name] || HUMAN.stand;
    const hasClip = P.clip ? this.play(P.clip, { fade: Math.max(0.05, dur), once: P.once, speed: P.speed }) : false;
    const dir = P.ifNoClip && hasClip ? {} : P.dir || {};
    if (!this.human) return;
    for (const k of ORDER) {
      const b = this.bones[k]; if (!b || !b.child) continue;
      const c = this.ov[k] || { dir: null, w: 0 }, eff = this.eff(c);
      const to = dir[k] ? { dir: this.sideDir(k, dir[k]), w: 1 } : { dir: eff.dir, w: 0 };
      this.ov[k] = { from: eff, to, t: 0, dur: Math.max(0.001, dur) };
    }
  }
  // x в осях тела — «в сторону своей руки»: знак берётся по положению кости в исходной позе.
  sideDir(k, d) { const s = this.side[k] ?? 1; return new THREE.Vector3(d[0] * s, d[1], d[2]).normalize(); }
  eff(c) {
    if (!c || !c.to) return { dir: c?.dir || null, w: c?.w || 0 };
    const k = Math.min(1, c.t / c.dur), u = k * k * (3 - 2 * k), a = c.from, b = c.to;
    const da = a.dir || b.dir, db = b.dir || a.dir; const dir = da && db ? da.clone().lerp(db, u).normalize() : null;
    return { dir, w: a.w + (b.w - a.w) * u };
  }
  reset() {
    if (this.mixer) { this.mixer.stopAllAction(); this.cur = null; }
    this.ov = {};
    if (this.spec.anim) this.play(this.spec.anim, { fade: 0, speed: this.spec.animSpeed });
    if (this.human && !this.side) {
      this.side = {}; this.root.updateMatrixWorld(true); const inv = this.root.matrixWorld.clone().invert(), p = new THREE.Vector3();
      for (const [k, b] of Object.entries(this.bones)) { p.setFromMatrixPosition(b.bone.matrixWorld).applyMatrix4(inv); this.side[k] = p.x >= 0 ? 1 : -1; }
    }
    if (this.human && !this.spec.anim) this.pose(this.spec.pose || 'stand', 0);
    this.update(0);
  }
  update(dt) {
    if (this.mixer) this.mixer.update(dt);
    if (!this.human) return;
    let any = false; for (const k in this.ov) { const c = this.ov[k]; if (c.to) c.t += dt; if (this.eff(c).w > 0.001) any = true; }
    if (!any) return;
    this.root.updateMatrixWorld(true);
    const rq = new THREE.Quaternion(), pq = new THREE.Quaternion(), q = new THREE.Quaternion(), I = new THREE.Quaternion();
    const a = new THREE.Vector3(), b = new THREE.Vector3();
    this.root.getWorldQuaternion(rq);
    for (const k of ORDER) {
      const c = this.ov[k]; if (!c) continue; const e = this.eff(c); if (!e.dir || e.w < 0.001) continue;
      const B = this.bones[k]; a.setFromMatrixPosition(B.bone.matrixWorld); b.setFromMatrixPosition(B.child.matrixWorld);
      const cur = b.sub(a).normalize(), tgt = e.dir.clone().applyQuaternion(rq);
      q.setFromUnitVectors(cur, tgt); q.slerpQuaternions(I, q, e.w);
      B.bone.parent.getWorldQuaternion(pq);
      B.bone.quaternion.premultiply(pq.clone().invert().multiply(q).multiply(pq));
      B.bone.updateMatrixWorld(true);
    }
  }
  bone(name) { const n = norm(name); return this.bonesAll[n] || Object.entries(this.bonesAll).find(([k]) => k.endsWith(n))?.[1] || null; }
}

export async function buildModel(o) {
  const g = await gltf(o.src);
  const M = new Model(o, g);
  return { o: M.o, mats: M.mats, model: M };
}
