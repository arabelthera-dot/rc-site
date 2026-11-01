// rc3d · Сцена по сценарию и исполнитель таймлайнов. Один экземпляр — одна картинка (заставка или игра).
// Таймлайн — список событий [{t, do, …}] — единственный способ что-то менять на сцене: полёт ракеты, раскрытие
// купола, налив в трубах завода выражаются данными. Весь текст уходит в строки под сценой (ui.say / ui.count).
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { build, copyPlaces, POSES, setPose } from './tela.mjs';
import { setGlow } from './materialy.mjs';
import { Chasticy, SLAB } from './chasticy.mjs';
import { Mir } from './mir.mjs';
import { instancedCopies } from './detali.mjs';
import { Post } from './post.mjs';

const D = Math.PI / 180;
const REDUCE = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = {
  linear: (t) => t, in: (t) => t * t * t, out: (t) => 1 - Math.pow(1 - t, 3),
  inout: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  in2: (t) => t * t, out2: (t) => 1 - (1 - t) * (1 - t),
};
const V = (a) => new THREE.Vector3().fromArray(a);
const arr = (x) => (Array.isArray(x) ? x : [x]);
let globusP = null;
const globus = () => globusP || (globusP = import('./globus.mjs'));

export class Scena {
  constructor(stage, scen, opts = {}) {
    this.stage = stage; this.scen = scen; this.opts = opts; this.ui = opts.ui || { say() {}, count() {} };
    this.zvuk = opts.zvuk; this.base = opts.base || '';
    this.objs = {}; this.groups = {}; this.worlds = {}; this.tw = []; this.spins = []; this.oscs = []; this.falls = []; this.runs = [];
    this.timeK = 1; this.shake = 0; this.follow = null; this.camTw = null; this.dragging = false; this.visible = true;
  }
  // ── Сборка ──
  async init() {
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!window.__recAudio });
    r.setPixelRatio(Math.min(devicePixelRatio, SLAB ? 1.5 : 2));
    r.toneMapping = THREE.ACESFilmicToneMapping; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.domElement.tabIndex = 0; r.domElement.setAttribute('aria-hidden', 'true');
    this.stage.appendChild(r.domElement);
    const w = this.stage.clientWidth || 800, h = this.stage.clientHeight || 500;
    const cs = this.scen.camera || {};
    this.camera = new THREE.PerspectiveCamera(cs.fov ?? (w < h ? 50 : 40), w / h, cs.near ?? 0.1, cs.far ?? 30000);
    this.controls = new OrbitControls(this.camera, r.domElement);
    Object.assign(this.controls, { enableDamping: true, enablePan: false, minDistance: cs.min ?? 2, maxDistance: cs.max ?? 400 });
    this.controls.addEventListener('start', () => { this.dragging = true; this.camTw = null; });
    this.controls.addEventListener('end', () => { this.dragging = false; });
    const ctx = { objs: this.objs, globus };
    const t0 = performance.now();
    // Главный мир — env/objects/fx верхнего уровня; дополнительные — "sceny":[{id, env, objects, fx, camera}].
    const list = [{ id: 'main', env: this.scen.env, objects: this.scen.objects, fx: this.scen.fx, camera: this.scen.camera }, ...(this.scen.sceny || [])];
    for (const W of list) {
      const scene = new THREE.Scene(), mir = new Mir(r, scene, W.env || {}), fx = new Chasticy(scene);
      const flash = new THREE.PointLight(0xffb060, 0, 600, 1.4); scene.add(flash);
      const world = this.worlds[W.id] = { id: W.id, scene, mir, fx, flash, camera: W.camera || cs, env: W.env || {} };
      await mir.ready;
      if ((W.env || {}).post) world.post = new Post(r, this.camera, W.env.post);
      for (const spec of W.objects || []) await this.addObj(spec, world, ctx);
      // Родители — вторым проходом: порядок тел в сценарии не важен.
      for (const e of Object.values(this.objs)) if (e.world === world && !e.o.parent) {
        const p = e.spec.parent && this.one(e.spec.parent);
        (p ? p.o : scene).add(e.o);
        // "bone":"spine_03" — тело едет за костью модели-родителя (ранец на спине, шлем на голове); pos/rot — в осях
        // модели в её исходной позе, как будто кости нет.
        // "snap":true — pos считается от самой кости (точки крепления модели: ranec_mount, plecho_L…), а не от начала модели.
        if (e.spec.bone && p && p.model) { const b = p.model.bone(e.spec.bone); if (b) { p.o.updateMatrixWorld(true); if (e.spec.snap) e.o.position.add(p.o.worldToLocal(b.getWorldPosition(new THREE.Vector3()))); b.attach(e.o); } else console.warn('rc3d: нет кости', e.spec.bone); }
        if (e.spec.latlon && p && p.globe) { const G = await globus(); e.o.position.copy(G.ll(p.globe.R, ...e.spec.latlon)); e.o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), e.o.position.clone().normalize()); }
      }
      for (const f of W.fx || []) this.addFx(f, world);
    }
    for (const e of Object.values(this.objs)) this.saveInit(e);
    this.world = this.worlds.main;
    this.home();
    const resize = () => { const W2 = this.stage.clientWidth, H2 = this.stage.clientHeight; if (!W2 || !H2) return; r.setSize(W2, H2, false); this.camera.aspect = W2 / H2; this.camera.updateProjectionMatrix(); for (const w of Object.values(this.worlds)) if (w.post) w.post.setSize(W2, H2); };
    resize(); new ResizeObserver(resize).observe(this.stage);
    new IntersectionObserver((es) => { const v = es[0].isIntersecting; if (v && !this.visible) { this.visible = true; this.last = performance.now(); this.loop(); } this.visible = v; }).observe(this.stage);
    this.last = performance.now(); this.loop();
  }
  async addObj(spec, world, ctx) {
    const reg = (id, b, sp) => {
      const e = { id, ...b, spec: sp, world };
      if (b.glow0 != null) for (const m of b.mats) setGlow(m, b.glow0);
      if (sp.hidden) e.o.visible = false;
      this.objs[id] = e;
      for (const g of arr(sp.group || [])) (this.groups[g] = this.groups[g] || []).push(e);
      return e;
    };
    if (spec.copies && spec.copies.instanced) {
      // Копии одним вызовом отрисовки: тело и его части запекаются в геометрию, материал на вид — один.
      const places = copyPlaces(spec.copies), b = await build({ ...spec, copies: undefined, pos: undefined, rot: undefined }, ctx), meshes = [];
      for (const p of spec.parts || []) { const pb = await build({ ...p }, ctx); b.o.add(pb.o); }
      b.o.position.fromArray(spec.pos || [0, 0, 0]); if (spec.rot) b.o.rotation.set(spec.rot[0] * D, spec.rot[1] * D, spec.rot[2] * D);
      const wrap = new THREE.Group(); wrap.add(b.o); wrap.updateMatrixWorld(true);
      wrap.traverse((m) => { if (m.isMesh && !m.isInstancedMesh) meshes.push({ geo: m.geometry.clone().applyMatrix4(m.matrixWorld), mat: m.material }); });
      const g = instancedCopies(meshes, places);
      reg(spec.id, { o: g, mats: [...new Set(meshes.map((x) => x.mat))] }, spec);
      return;
    }
    if (spec.copies) {
      const places = copyPlaces(spec.copies);
      for (let k = 0; k < places.length; k++) {
        const sp = { ...spec, copies: undefined }, b = await build(sp, ctx);
        // Копия стоит в своей точке и смотрит наружу; собственные pos/rot тела — внутри неё.
        const holder = new THREE.Group(); holder.position.fromArray(places[k].pos); holder.rotation.y = places[k].yaw; holder.add(b.o);
        const e = reg(spec.id + '#' + k, { ...b, o: holder, inner: b.o }, { ...sp, group: [...arr(spec.group || []), spec.id] });
        e.k = k; await this.addParts(spec, e, world, ctx, '#' + k);
      }
      return;
    }
    const e = reg(spec.id || 'obj' + Object.keys(this.objs).length, await build(spec, ctx), spec);
    await this.addParts(spec, e, world, ctx, '');
  }
  // Составное тело: "parts":[…] — дети в осях родителя (дерево = ствол + крона, бочка = цилиндр + обручи).
  // У частей копий имена с тем же суффиксом (#k), а имя части без суффикса обозначает её во всех копиях.
  async addParts(spec, parent, world, ctx, suf) {
    for (const [i, p] of (spec.parts || []).entries()) {
      const id = (p.id || `${parent.id.replace(/#\d+$/, '')}.${i}`) + suf;
      const b = await build({ ...p, copies: undefined }, ctx);
      const e = { id, ...b, spec: p, world };
      if (b.glow0 != null) for (const m of b.mats) setGlow(m, b.glow0);
      if (p.hidden) e.o.visible = false;
      (parent.inner || parent.o).add(e.o);
      this.objs[id] = e;
      for (const g of [...arr(p.group || []), ...(suf && p.id ? [p.id] : [])]) (this.groups[g] = this.groups[g] || []).push(e);
      await this.addParts(p, e, world, ctx, suf);
    }
  }
  addFx(f, world) {
    const targets = f.parent ? this.list(f.parent) : [null];
    targets.forEach((t, k) => {
      const s = world.fx.source({ ...f, id: targets.length > 1 ? f.id + '#' + k : f.id }, t ? t.inner || t.o : null);
      s.world = world; s.on0 = f.on ? (f.on === true ? 1 : f.on) : 0;
      (this.fxAll = this.fxAll || []).push(s);
      (this.fxGroups = this.fxGroups || {});
      for (const g of [f.id, ...arr(f.group || [])]) (this.fxGroups[g] = this.fxGroups[g] || []).push(s);
    });
  }
  saveInit(e) {
    e.init = { parent: e.o.parent, pos: e.o.position.clone(), quat: e.o.quaternion.clone(), scale: e.o.scale.clone(), vis: e.o.visible,
      open: e.cloth?.open, fill: e.flow?.fill, glow: e.mats.map((m) => m.userData.glow ?? 0), op: e.mats.map((m) => m.opacity), power: e.light?.intensity };
  }
  // Имя в событии: тело, копия (id#k), группа или копии одного тела.
  list(id) { if (id == null) return []; if (Array.isArray(id)) return id.flatMap((x) => this.list(x)); return this.objs[id] ? [this.objs[id]] : (this.groups[id] || []); }
  one(id) { return this.list(id)[0]; }

  // ── Возврат в начало: всё на исходных местах, источники частиц в исходном состоянии, таймлайны сняты ──
  reset() {
    this.runs = []; this.tw = []; this.spins = []; this.oscs = []; this.timeK = 1; this.shake = 0; this.follow = null; this.camTw = null;
    for (const f of this.falls) if (f.chunk) f.e.o.removeFromParent(); this.falls = [];
    for (const e of Object.values(this.objs)) {
      const I = e.init; if (!I) continue;
      if (e.o.parent !== I.parent) I.parent.add(e.o);
      e.o.position.copy(I.pos); e.o.quaternion.copy(I.quat); e.o.scale.copy(I.scale); e.o.visible = I.vis;
      if (e.cloth) e.cloth.open = I.open; if (e.flow) e.flow.fill = I.fill;
      e.mats.forEach((m, i) => { setGlow(m, I.glow[i]); m.opacity = I.op[i]; });
      if (e.light) e.light.intensity = I.power;
      if (e.pivots) { e.pose = null; setPose(e.pivots, POSES[e.spec.pose || 'stand']); }
      if (e.model) e.model.reset();
    }
    for (const s of this.fxAll || []) s.world.fx.level(s, s.on0);
    for (const W of Object.values(this.worlds)) { W.mir.set(W.env.sky || 'day'); W.flash.intensity = 0; }
    if (this.world !== this.worlds.main) this.switchWorld('main', true);
    if (this.zvuk) this.zvuk.silence();
    this.home();
  }
  home() {
    const cs = this.world.camera || {}, narrow = this.camera.aspect < 1;
    this.camera.position.fromArray((narrow && cs.posNarrow) || cs.pos || [30, 12, 38]);
    this.controls.target.fromArray(cs.look || [0, 5, 0]);
    this.controls.autoRotate = !!cs.orbit; this.controls.autoRotateSpeed = (cs.orbit || 0) / 6;   // градусов в секунду
    if (cs.fov) { this.camera.fov = cs.fov; this.camera.updateProjectionMatrix(); }
    this.controls.update();
  }
  switchWorld(id, instant) {
    const W = this.worlds[id]; if (!W || W === this.world) return;
    const cv = this.renderer.domElement;
    const go = () => { this.world = W; this.follow = null; this.camTw = null; this.home(); cv.style.opacity = '1'; };
    if (instant) { go(); return; }
    cv.style.transition = 'opacity .35s'; cv.style.opacity = '0'; setTimeout(go, 380);
  }

  // ── Таймлайн ──
  // run(list, {onEnd}) — запускает список событий с нуля. Можно держать несколько одновременно (setup + сценарий).
  run(list, { onEnd, instant } = {}) {
    // "repeat":n, "every":s — событие повторяется n раз через s секунд (удары насоса, капель, вспышки).
    const ev = (list || []).flatMap((e) => (e.repeat > 1 ? Array.from({ length: e.repeat }, (_, k) => ({ ...e, t: (e.t || 0) + k * (e.every || 1), repeat: 0 })) : [e])).sort((a, b) => (a.t || 0) - (b.t || 0));
    if (instant) { for (const e of ev) this.fire(e, true); return null; }
    const end = ev.reduce((m, e) => Math.max(m, (e.t || 0) + (e.dur || 0) + (e.do === 'voice' ? 1.5 : 0)), 0);
    const R = { ev, i: 0, T: 0, end, onEnd, done: false };
    this.runs.push(R); return R;
  }
  stopRuns() { this.runs = []; }
  stepRuns(dt) {
    for (const R of this.runs) {
      R.T += dt;
      while (R.i < R.ev.length && (R.ev[R.i].t || 0) <= R.T) this.fire(R.ev[R.i++], false);
      if (!R.done && R.i >= R.ev.length && R.T >= R.end) { R.done = true; if (R.onEnd) R.onEnd(); }
    }
    this.runs = this.runs.filter((R) => !R.done);
  }
  tween(dur, fn, ease = 'inout') {
    if (!dur || dur <= 0) { fn(1); return; }
    const f = EASE[ease] || EASE.inout; this.tw.push({ t: 0, dur, fn: (k) => fn(f(k)) });
  }
  fx(id) { if (Array.isArray(id)) return id.flatMap((x) => this.fx(x)); return (this.fxGroups && this.fxGroups[id]) || []; }
  // Одно событие. instant — применить итог сразу (для «подготовки» выбранного варианта).
  fire(e, instant) {
    const dur = instant ? 0 : e.dur || 0, ease = e.ease || 'inout', A = this;
    const each = (fn) => { for (const o of this.list(e.id)) fn(o); };
    switch (e.do) {
      case 'move': each((o) => {
        const p0 = o.o.position.clone();
        // osc: [dx,dy,dz], period — непрерывное качание туда-обратно (поршень, маятник); osc:null — остановить.
        if ('osc' in e) { A.oscs = A.oscs.filter((x) => x.o !== o); if (e.osc && !instant) A.oscs.push({ o, a: V(e.osc), p0: o.o.position.clone(), per: e.period || 1, t: 0 }); return; }
        if (e.path) { const c = new THREE.CatmullRomCurve3([p0, ...e.path.map(V)]); A.tween(dur, (k) => { o.o.position.copy(c.getPoint(k)); if (e.orient) A.orient(o, c.getTangent(Math.min(0.999, k))); }, ease); return; }
        if (e.along) { const tr = A.one(e.along); const c = tr && (tr.curve || tr.flow?.geo?.parameters?.path || tr.o.geometry?.parameters?.path); if (!c) return; const a = e.from ?? 0, b = e.to ?? 1;
          A.tween(dur, (k) => { const u = a + (b - a) * k; tr.o.updateMatrixWorld(); const pw = tr.o.localToWorld(c.getPoint(u)); o.o.parent.worldToLocal(pw); o.o.position.copy(pw);
            if (e.orient) { const q = tr.o.localToWorld(c.getPoint(Math.min(1, u + 0.002))); o.o.parent.worldToLocal(q); A.orient(o, q.sub(o.o.position)); } }, ease); return; }
        const p1 = e.to ? V(e.to) : p0.clone().add(V(e.by || [0, 0, 0]));
        // face:true — повернуться лицом (ось +Z тела) по ходу движения, по горизонтали.
        if (e.face && (p1.x !== p0.x || p1.z !== p0.z)) { const q0 = o.o.quaternion.clone(), q1 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(p1.x - p0.x, p1.z - p0.z)); A.tween(Math.min(0.5, dur || 0), (k) => o.o.quaternion.slerpQuaternions(q0, q1, k)); }
        A.tween(dur, (k) => o.o.position.lerpVectors(p0, p1, k), ease);
      }); break;
      case 'rotate': each((o) => {
        if (e.spin) { A.spins = A.spins.filter((s) => s.o !== o); if (e.spin.some((x) => x)) A.spins.push({ o, w: V(e.spin).multiplyScalar(D) }); return; }
        const q0 = o.o.quaternion.clone(), r = e.to || e.by;
        const qr = new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * D, r[1] * D, r[2] * D, o.spec.order || 'XYZ'));
        const q1 = e.by ? q0.clone().multiply(qr) : qr;   // by — поворот в собственных осях тела
        A.tween(dur, (k) => o.o.quaternion.slerpQuaternions(q0, q1, k), ease);
      }); break;
      case 'pose': each((o) => { if (o.model) { o.model.pose(e.pose, instant ? 0 : (e.dur ?? 0.3)); return; } if (!o.pivots) return; const P = POSES[e.pose] || POSES.stand, from = o.pose || POSES[o.spec.pose || 'stand']; o.pose = P; A.tween(dur, (k) => setPose(o.pivots, P, k, from), ease); }); break;
      case 'scale': each((o) => { const s0 = o.o.scale.clone(), s1 = Array.isArray(e.to) ? V(e.to) : new THREE.Vector3().setScalar(e.to ?? 1); A.tween(dur, (k) => o.o.scale.lerpVectors(s0, s1, k), ease); }); break;
      case 'show': case 'hide': each((o) => {
        const on = e.do === 'show';
        if (!dur || !o.mats.length) { o.o.visible = on; return; }
        const op = o.mats.map((m) => (m.userData.op0 ??= m.opacity)); o.o.visible = true;
        o.mats.forEach((m) => { m.transparent = true; });
        A.tween(dur, (k) => { o.mats.forEach((m, i) => { m.opacity = op[i] * (on ? k : 1 - k); }); if (k >= 1 && !on) o.o.visible = false; }, 'linear');
      }); break;
      case 'open': case 'close': each((o) => { if (!o.cloth) return; const a = o.cloth.open, b = e.do === 'close' ? 0 : e.to ?? 1; A.tween(dur, (k) => { o.cloth.open = a + (b - a) * k; }, e.ease || 'out'); }); break;
      case 'fill': each((o) => { if (!o.flow) return; const a = o.flow.fill, b = e.to ?? 1; if (e.speed != null) o.flow.speed = e.speed; A.tween(dur, (k) => { o.flow.fill = a + (b - a) * k; }, e.ease || 'linear'); }); break;
      case 'glow': each((o) => {
        if (o.light) { const a = o.light.intensity, b = (e.to ?? 1) * (o.spec.max ?? 2000); A.tween(dur, (k) => { o.light.intensity = a + (b - a) * k; }, ease); return; }
        o.mats.forEach((m) => { const a = m.userData.glow ?? 0, b = e.to ?? 1; A.tween(dur, (k) => setGlow(m, a + (b - a) * k, e.color), ease); });
      }); break;
      case 'emit': {
        if (instant && (e.kind === 'explosion' || e.kind === 'puff')) break;
        if (e.kind === 'explosion' || e.kind === 'puff') {
          const p = this.where(e); const W = this.world;
          if (e.kind === 'explosion') { W.fx.boom(p, e.size ?? 1, e); if (!e.quiet) { this.zvuk?.play('boom', e.size ?? 1); W.flash.position.copy(p); W.flash.intensity = 6000 * (e.size ?? 1); this.shake = REDUCE ? 0 : 0.8 * Math.min(1.5, e.size ?? 1); } }
          else W.fx.puff(p, e.size ?? 1, e.color ? new THREE.Color(e.color).toArray() : undefined, e.n);
          break;
        }
        for (const s of this.fx(e.id)) { const a = s.level, b = e.level ?? 1; A.tween(dur, (k) => s.world.fx.level(s, a + (b - a) * k), 'linear'); }
        break;
      }
      case 'stop': for (const s of this.fx(e.id)) { const a = s.level; A.tween(dur, (k) => s.world.fx.level(s, a * (1 - k)), 'linear'); } break;
      // attach: перецепить тело к другому родителю (to:null — к миру), сохранив положение в мире: лётчик садится в
      // самолёт и выпадает из него, ступень остаётся на ракете до разделения.
      case 'attach': each((o) => { const p = e.to ? this.one(e.to) : null; (p ? (p.inner || p.o) : this.world.scene).attach(o.o); }); break;
      case 'fall': if (!instant) each((o) => this.fall(o, e)); break;
      case 'debris': if (!instant) this.debris(e); break;
      case 'camera': if (!instant) this.cam(e); break;
      case 'sky': instant ? this.world.mir.set(e.to) : this.world.mir.to(e.to, e.dur ?? 3); break;
      case 'scene': this.switchWorld(e.id, instant); break;
      case 'slow': { const a = this.timeK, b = e.k ?? 1; if (instant) this.timeK = 1; else this.tween(e.dur || 0.01, (k) => { A.timeK = a + (b - a) * k; }, 'linear'); break; }
      case 'say': if (!instant) this.ui.say(e.text, e.cls); break;
      case 'count': if (!instant) {
        if (e.from != null && e.dur) { const a = e.from, b = e.to ?? a; this.tween(e.dur, (k) => A.ui.count(e.text.replace('{v}', fmt(a + (b - a) * k, e.step, e.sep)), e.small), 'linear'); }
        else this.ui.count(e.text, e.small);
      } break;
      case 'voice': if (!instant && this.zvuk) this.zvuk.voice(this.base + 'zvuk/' + e.file + '.mp3', { radio: e.radio }); if (!instant && e.text && e.show) this.ui.say(e.text); break;
      case 'sound': if (!instant && this.zvuk) { if (e.level != null) this.zvuk.level(e.kind, e.level); else this.zvuk.play(e.kind, e.k ?? 1); } break;
      case 'shake': if (!instant && !REDUCE) this.shake = e.k ?? 0.5; break;
      case 'flash': if (!instant) { const W = this.world; W.flash.position.copy(this.where(e)); W.flash.color.set(e.color || '#ffb060'); W.flash.intensity = e.power ?? 5000; } break;
      // Клип модели: {"do":"anim","id":"lyudi","clip":"Walk","fade":0.3,"speed":1,"once":false}.
      case 'anim': each((o) => { if (o.model) o.model.play(e.clip, { fade: instant ? 0 : e.fade ?? 0.3, speed: e.speed, once: e.once }); }); break;
      case 'wait': case 'end': break;
      default: console.warn('rc3d: неизвестное событие', e.do);
    }
  }
  // Точка события: "at" — мировые координаты; "on" — тело (+ "offset" в его осях).
  where(e) {
    if (e.on) { const o = this.one(e.on); if (o) { o.o.updateMatrixWorld(true); return o.o.localToWorld(V(e.offset || [0, 0, 0])); } }
    return V(e.at || [0, 0, 0]);
  }
  orient(o, dir) { if (dir.lengthSq() < 1e-9) return; o.o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()); }
  // Свободное падение: тело отрывается от родителя (сохраняя положение в мире) и падает под тяжестью до земли.
  fall(o, e) {
    const sc = this.world.scene; o.o.updateMatrixWorld(true);
    const wp = new THREE.Vector3().setFromMatrixPosition(o.o.matrixWorld);
    const v = V(e.v || [0, 0, 0]); if (e.inherit !== false && o.lastW && o.vel) v.add(o.vel);
    sc.attach(o.o);
    this.falls.push({ e: o, v, w: V(e.spin || [0, 0, 0]).multiplyScalar(D), g: e.g ?? 9.81, ground: e.ground ?? 0, r: e.r ?? 0.5, bounce: e.bounce ?? 0.25, drag: e.drag ?? 0, rest: false, p: wp });
  }
  // Обломки: куски-скорлупки материала тела (или заданного), разлетаются и падают (из Р-7, без движка физики).
  debris(e) {
    const p = this.where(e), n = Math.round((e.n ?? 12) * (SLAB ? 0.6 : 1)), s = e.size ?? 1;
    const src = e.mat ? null : this.one(e.from);
    for (let i = 0; i < n; i++) {
      const big = Math.random() < 0.35, r = s * (big ? 0.8 + Math.random() * 0.5 : 0.3 + Math.random() * 0.4), h = s * (big ? 1.5 + Math.random() * 2.5 : 0.5 + Math.random());
      const m0 = src?.mats[0] ? src.mats[0].clone() : new THREE.MeshStandardMaterial({ color: e.color || 0x77706a, roughness: 0.7, metalness: 0.4 });
      m0.side = THREE.DoubleSide; if (m0.color) m0.color.multiplyScalar(0.55);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * (0.7 + Math.random() * 0.3), h, 9, 1, true, 0, Math.PI * (0.7 + Math.random())), m0); m.castShadow = true;
      const g = new THREE.Group(); g.add(m); g.position.copy(p).add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(2 * s));
      this.world.scene.add(g);
      const d = g.position.clone().sub(p).normalize().multiplyScalar((e.speed ?? 15) * (0.6 + Math.random())).add(V(e.v || [0, 0, 0]));
      this.falls.push({ e: { o: g }, chunk: true, v: d, w: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(9), g: 9.81, ground: e.ground ?? 0, r: 0.3, bounce: 0.2, drag: 0, rest: false, p: g.position.clone() });
    }
  }
  // Камера: {pos, look, dur} — пролёт к точке; {follow:"id", offset:[…], lookOffset:[…]} — сопровождение тела;
  // {orbit: град/с} — медленный облёт; {home:true} — исходный вид. Посетитель тянет сцену — пролёт уступает ему.
  cam(e) {
    if (e.home) { this.follow = null; this.camTw = null; this.home(); return; }
    if (e.orbit != null) { this.controls.autoRotate = !!e.orbit; this.controls.autoRotateSpeed = e.orbit / 6; }
    if (e.fov) { const a = this.camera.fov, b = e.fov; this.tween(e.dur || 0, (k) => { this.camera.fov = a + (b - a) * k; this.camera.updateProjectionMatrix(); }); }
    if (e.follow !== undefined) {
      if (!e.follow) { this.follow = null; } else {
        const o = this.one(e.follow); if (o) this.follow = { o, look: V(e.lookOffset || [0, 0, 0]) };
      }
    }
    if (this.dragging && !e.force) return;
    const narrow = this.camera.aspect < 1, k = narrow ? (e.narrowK ?? 1.35) : 1;
    // Пролёт по трубе/дуге: {"along":"zmeevik","from":0,"to":1,"dur":3,"ahead":0.03} — камера летит внутри потока.
    if (e.along) {
      const tr = this.one(e.along), c = tr && (tr.curve || tr.flow?.geo?.parameters?.path || tr.o.geometry?.parameters?.path); if (!c) return;
      const a = e.from ?? 0, b = e.to ?? 1, ah = e.ahead ?? 0.03, lift = V(e.lift || [0, 0, 0]), self = this;
      this.follow = null; this.camTw = null;
      this.tween(e.dur || 1, (u) => { const s = a + (b - a) * u; tr.o.updateMatrixWorld(); self.camera.position.copy(tr.o.localToWorld(c.getPoint(Math.min(1, s)))).add(lift); self.controls.target.copy(tr.o.localToWorld(c.getPoint(Math.min(1, s + ah)))).add(lift); }, e.ease || 'inout');
      return;
    }
    if (e.offset) { this.camTw = { off: V(e.offset).multiplyScalar(k), t: 0, dur: e.dur || 0.01, from: this.camera.position.clone().sub(this.controls.target), ease: EASE[e.ease || 'inout'] }; }
    else if (e.pos || e.look) {
      const p1 = e.pos ? V(e.pos) : this.camera.position.clone(), l1 = e.look ? V(e.look) : this.controls.target.clone();
      if (narrow && e.pos) p1.sub(l1).multiplyScalar(k).add(l1);
      this.follow = e.follow ? this.follow : null;
      this.camTw = { p0: this.camera.position.clone(), l0: this.controls.target.clone(), p1, l1, t: 0, dur: e.dur || 0.01, ease: EASE[e.ease || 'inout'] };
    }
  }
  // ── Кадр ──
  loop() {
    if (!this.visible || this.dead) return;
    requestAnimationFrame(() => this.loop());
    const now = performance.now(), raw = Math.min((now - this.last) / 1000, 1 / 20); this.last = now;
    const dt = raw * this.timeK;
    if (this.onTick) this.onTick(dt);
    this.stepRuns(dt);
    for (const t of this.tw) { t.t += dt; t.fn(Math.min(1, t.t / t.dur)); }
    this.tw = this.tw.filter((t) => t.t < t.dur);
    for (const q of this.oscs) { q.t += dt; q.o.o.position.copy(q.p0).addScaledVector(q.a, Math.sin(q.t / q.per * 6.2832)); }
    for (const s of this.spins) s.o.o.rotateX(s.w.x * dt), s.o.o.rotateY(s.w.y * dt), s.o.o.rotateZ(s.w.z * dt);
    for (const f of this.falls) {
      if (f.rest) continue;
      f.v.y -= f.g * dt; if (f.drag) f.v.multiplyScalar(1 - f.drag * dt);
      f.p.addScaledVector(f.v, dt);
      if (f.p.y < f.ground + f.r) { f.p.y = f.ground + f.r; f.v.y = -f.v.y * f.bounce; f.v.x *= 0.6; f.v.z *= 0.6; f.w.multiplyScalar(0.5); if (Math.abs(f.v.y) < 1) { f.rest = true; } }
      f.e.o.position.copy(f.p); f.e.o.rotateX(f.w.x * dt); f.e.o.rotateY(f.w.y * dt); f.e.o.rotateZ(f.w.z * dt);
    }
    this.time = (this.time || 0) + dt;
    for (const e of Object.values(this.objs)) {
      if (e.cloth && e.o.visible) e.cloth.update(dt); if (e.flow && e.o.visible) e.flow.update(dt);
      if (e.model && e.world === this.world) e.model.update(dt); if (e.tick) e.tick(this.time);
    }
    // Камера: пролёт / сопровождение.
    const c = this.camera, tg = this.controls.target;
    if (this.follow) {
      this.follow.o.o.updateMatrixWorld(true);
      const goal = this.follow.o.o.localToWorld(new THREE.Vector3()).add(this.follow.look), d = goal.sub(tg).multiplyScalar(0.25);
      tg.add(d); c.position.add(d);
    }
    if (this.camTw) {
      const T = this.camTw; T.t += raw; const k = T.ease(Math.min(1, T.t / T.dur));
      if (T.off) c.position.copy(tg).add(T.from.clone().lerp(T.off, k));
      else { tg.lerpVectors(T.l0, T.l1, k); c.position.lerpVectors(T.p0, T.p1, k); }
      if (T.t >= T.dur) this.camTw = null;
    }
    const W = this.world, minY = W.env.camMinY ?? (W.env.ground === 'none' ? -1e9 : 0.6);
    if (c.position.y < minY) c.position.y = minY;
    W.flash.intensity *= 0.86;
    if (this.shake > 0.01) { c.position.add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(this.shake)); this.shake *= 0.9; }
    this.controls.maxPolarAngle = W.env.ground === 'none' || W.env.free ? Math.PI : Math.PI * 0.495;
    this.controls.update();
    W.mir.tick(dt, tg, Math.max(0, tg.y));
    W.fx.tick(dt);
    if (this.zvuk) this.zvuk.tick();
    if (W.post) W.post.render(W.scene, c, raw); else this.renderer.render(W.scene, c);
    // Скорость тел в мире (для «fall» с унаследованной скоростью).
    for (const e of Object.values(this.objs)) { const m = e.o.matrixWorld.elements; const p = new THREE.Vector3(m[12], m[13], m[14]); if (e.lastW && raw > 0) e.vel = p.clone().sub(e.lastW).divideScalar(Math.max(dt, 1e-4)); e.lastW = p; }
    this.fpsN = (this.fpsN || 0) + 1; this.fpsT = (this.fpsT || 0) + raw; if (this.fpsT >= 1) { this.fps = Math.round(this.fpsN / this.fpsT); this.fpsN = 0; this.fpsT = 0; }
  }
}
// sep:true — разряды через узкий пробел (80 000 пудов, 1 300 тонн).
const fmt = (x, step, sep) => { const s = step || 1; const v = Math.round(x / s) * s; const t = String(+v.toFixed(3)).replace('.', ','); return sep ? t.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') : t; };
