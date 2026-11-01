// rc3d · Окружение: небо (день / вечер / ночь / космос), солнце с тенями, рассеянный свет, туман, земля.
// Земли: steppe (степь), field (поле с травой), concrete (заводская площадка), snow (снег), water (вода), none.
// Сценарий: "env": {"sky":"day", "ground":"field", "size":600, "fog":[200,2600], "shadow":40, "sun":[55,75,35]}.
// Настоящее небо и свет — HDRI: "hdri":"sky/kloofendal_48d_1k.hdr" (освещение окружением, PMREM), "background":
// "sky/…_bg.jpg" (резкий фон; без него — сама HDRI) или false, "hdriYaw":град, "hdriSun":[x,y,z] (иначе — по самой яркой
// точке HDRI), "exposure", "envIntensity", "sunI". Земля по текстурам: "groundTex":"tex/grass004", "groundTile":4 (м на
// плитку) или "groundRepeat":n, "groundTex2":"tex/ground037" — пятнами по шуму, "groundRes":{"diffuse":"2k"}.
// Трава: "grass":{"n":14000,"areas":[[x,z,r],…],"h":0.32}. Постобработка: "post":{"bloom":0.25,"ao":true,"vignette":0.25}.
import * as THREE from 'three';
import { texNoise, texGrass, texWater, texSmoke } from './tekstury.mjs';
import { SLAB } from './chasticy.mjs';
import { hdr, tex, pbrMaps } from './zagruzka.mjs';

// Пресеты неба. Небо меняется событием {"do":"sky","to":"space","dur":4} — все числа плавно перетекают.
export const SKY = {
  day: { hor: [0.86, 0.88, 0.86], zen: [0.24, 0.45, 0.78], low: [0.55, 0.5, 0.4], sun: [0.55, 0.42, 0.72], sunCol: [1, 0.94, 0.85], sunI: 2.8, hemi: 1.25, hemiSky: [0.81, 0.88, 1], hemiGnd: [0.54, 0.46, 0.31], stars: 0, disc: 1.4, exp: 1.05 },
  evening: { hor: [0.98, 0.6, 0.36], zen: [0.16, 0.2, 0.42], low: [0.35, 0.25, 0.2], sun: [0.85, 0.07, 0.35], sunCol: [1, 0.68, 0.42], sunI: 1.9, hemi: 0.7, hemiSky: [0.9, 0.7, 0.6], hemiGnd: [0.35, 0.25, 0.2], stars: 0.15, disc: 1.8, exp: 1.1 },
  night: { hor: [0.07, 0.09, 0.15], zen: [0.008, 0.012, 0.035], low: [0.04, 0.04, 0.05], sun: [-0.4, 0.5, -0.6], sunCol: [0.6, 0.7, 1], sunI: 0.35, hemi: 0.3, hemiSky: [0.4, 0.5, 0.8], hemiGnd: [0.1, 0.1, 0.12], stars: 1, disc: 0.5, exp: 1.25 },
  space: { hor: [0.03, 0.05, 0.1], zen: [0, 0, 0.005], low: [0.01, 0.01, 0.02], sun: [0.55, 0.42, 0.72], sunCol: [1, 0.97, 0.92], sunI: 3.2, hemi: 0.15, hemiSky: [0.5, 0.6, 1], hemiGnd: [0.05, 0.05, 0.08], stars: 1, disc: 2, exp: 1.0 },
};
const lerpArr = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
export function mixSky(a, b, t) { const o = {}; for (const k of Object.keys(a)) o[k] = Array.isArray(a[k]) ? lerpArr(a[k], b[k], t) : a[k] + (b[k] - a[k]) * t; return o; }

function skyMesh() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uHor: { value: new THREE.Color() }, uZen: { value: new THREE.Color() }, uLow: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3() }, uSunC: { value: new THREE.Color() }, uStars: { value: 0 }, uDisc: { value: 1 } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }',
    fragmentShader: `varying vec3 vD; uniform vec3 uHor, uZen, uLow, uSun, uSunC; uniform float uStars, uDisc;
      float h3(vec3 p){ p = fract(p * 0.3183 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main(){ float h = max(vD.y, 0.0);
        vec3 c = mix(uHor, uZen, pow(h, 0.55));
        float sd = max(dot(vD, normalize(uSun)), 0.0);
        c += uSunC * (pow(sd, 220.0) * uDisc + pow(sd, 8.0) * 0.18);
        if (uStars > 0.0) { vec3 q = floor(vD * 420.0); float s = step(0.9975, h3(q)); c += vec3(s) * uStars * smoothstep(0.0, 0.15, vD.y + 0.05); }
        if (vD.y < 0.0) c = mix(uHor, uLow, min(-vD.y * 6.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(9000, 32, 16), mat); m.frustumCulled = false; m.renderOrder = -1;
  return m;
}

const D = Math.PI / 180;
// Резкий фон неба из JPG, в который при сборке уже «запечён» ACES (как его покажет three.js). Шейдер переводит цвет
// обратно в линейный (обращение ACES), и общий тон-маппинг (на экран или в постобработке) возвращает его 1:1 —
// фон и сцена проходят через один и тот же ACES, а файл весит 200 КБ вместо 20 МБ.
function skyDome(t, yaw) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: true,
    uniforms: { tSky: { value: t }, uExp: { value: 1 }, uYaw: { value: yaw } },
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }',
    fragmentShader: `varying vec3 vD; uniform sampler2D tSky; uniform float uExp, uYaw;
      vec3 invRRT(vec3 v){ // решение (x(x+a)-b)/(x(cx+d)+e) = v
        const float a = 0.0245786, b = 0.000090537, c = 0.983729, d = 0.4329510, e = 0.238081;
        vec3 A = 1.0 - v * c, B = a - v * d, C = -(b + v * e);
        return (-B + sqrt(max(B * B - 4.0 * A * C, 0.0))) / (2.0 * max(A, 1e-3)); }
      void main(){
        vec3 d = normalize(vD); float cy = cos(uYaw), sy = sin(uYaw); d = vec3(cy * d.x + sy * d.z, d.y, -sy * d.x + cy * d.z);
        vec2 uv = vec2(atan(d.z, d.x) * 0.15915494 + 0.5, asin(clamp(d.y, -1.0, 1.0)) * 0.31830989 + 0.5);
        vec3 s = texture2D(tSky, uv).rgb;   // линейный (sRGB → линейный сделал загрузчик)
        s = min(s, vec3(0.985));
        const mat3 M2 = mat3(1.60475, -0.10208, -0.00327, -0.53108, 1.10813, -0.07276, -0.07367, -0.00605, 1.07602);
        const mat3 M1 = mat3(0.59719, 0.07600, 0.02840, 0.35458, 0.90834, 0.13383, 0.04823, 0.01566, 0.83777);
        vec3 x = inverse(M1) * invRRT(inverse(M2) * s);
        gl_FragColor = vec4(max(x, 0.0) * 0.6 / max(uExp, 1e-3), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(9000, 48, 24), mat); m.frustumCulled = false; m.renderOrder = -1;
  return m;
}

export class Mir {
  constructor(renderer, scene, env = {}) {
    this.r = renderer; this.scene = scene; this.env = env;
    this.sky = skyMesh(); scene.add(this.sky);
    this.hemi = new THREE.HemisphereLight(0xcfe0ff, 0x8a7550, 1.25); scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff0d8, 2.8); this.sun.castShadow = env.shadow !== 0;
    const S = env.shadow || 40; this.sunDist = env.sunDist || 120;
    this.sun.shadow.mapSize.set(SLAB ? 1024 : 2048, SLAB ? 1024 : 2048);
    Object.assign(this.sun.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 1, far: this.sunDist * 2.5 });
    this.sun.shadow.bias = -0.0005; this.sun.shadow.normalBias = 0.04;
    scene.add(this.sun, this.sun.target);
    const fog = env.fog === false ? null : (env.fog || [260, 2600]);
    if (fog) scene.fog = new THREE.Fog(0xd9ddd8, fog[0], fog[1]);
    this.fog0 = fog;
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.cur = { ...(SKY[env.sky] || SKY.day) };
    if (env.sun) this.cur.sun = env.sun;
    this.apply(this.cur, true);
    if (env.groundTex) this.pbrGround(env); else this.ground(env.ground || 'steppe', env.size || 4000, env.groundColor);
    if (env.grass) this.grassField(env.grass);
    if (env.clouds && !env.hdri) this.clouds(env.clouds);
    this.trans = null;
    this.ready = env.hdri ? this.hdri(env).catch((e) => console.warn('rc3d: HDRI', e)) : Promise.resolve();
  }
  // ── HDRI: окружение (PMREM), фон, солнце по HDRI, цвет дымки у горизонта ──
  async hdri(env) {
    const t = await hdr(env.hdri), yaw = (env.hdriYaw || 0) * D;
    t.mapping = THREE.EquirectangularReflectionMapping;
    this.hd = true; this.sky.visible = false; this.hemi.intensity = env.hemi ?? 0;
    const pm = this.pmrem.fromEquirectangular(t).texture;
    if (this.scene.environment) this.scene.environment.dispose();
    this.scene.environment = pm; this.scene.environmentIntensity = env.envIntensity ?? 1; this.scene.environmentRotation.y = yaw;
    // Солнце: самая яркая точка HDRI (или задано) → направление в мире, с учётом поворота неба.
    const { width: W, height: H, data } = t.image; let dir;
    if (env.hdriSun) dir = new THREE.Vector3(...env.hdriSun).normalize();
    else {
      let best = 0, bi = 0; for (let i = 0; i < W * H; i++) { const v = data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]; if (v > best) { best = v; bi = i; } }
      const u = (bi % W) / W, el = (0.5 - Math.floor(bi / W) / H) * Math.PI, ph = (u - 0.5) * 2 * Math.PI;   // обратное к equirectUv three.js
      dir = new THREE.Vector3(Math.cos(ph) * Math.cos(el), Math.sin(el), Math.sin(ph) * Math.cos(el));
    }
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw); this.hdSun = dir;
    // Дымка: средний цвет HDRI чуть выше горизонта.
    const c = [0, 0, 0]; let n = 0; const row = Math.floor(H * 0.48);
    for (let x = 0; x < W; x++) { const i = (row * W + x) * 4; c[0] += data[i]; c[1] += data[i + 1]; c[2] += data[i + 2]; n++; }
    this.hdFog = new THREE.Color(...(env.fogColor || c.map((v) => (v / n) * (env.fogK ?? 0.92))));
    if (env.background !== false) {
      if (env.background) this.scene.add(this.dome = skyDome(tex(env.background, { srgb: true }), yaw));
      else { this.scene.background = t; this.scene.backgroundRotation.y = yaw; this.scene.backgroundIntensity = env.bgIntensity ?? 1; }
    }
    this.apply(this.cur, false);
  }
  apply(p, envmap) {
    if (this.hd) {   // HDRI: пресет неба меняет только яркость и цвет солнца (относительно дня)
      const k = p.sunI / SKY.day.sunI, e = this.env;
      this.sunDir = this.hdSun.clone(); this.sun.color.setRGB(...p.sunCol); this.sun.intensity = (e.sunI ?? 3) * k;
      this.scene.environmentIntensity = (e.envIntensity ?? 1) * Math.max(0.15, p.hemi / SKY.day.hemi);
      this.r.toneMappingExposure = (e.exposure ?? 1) * p.exp / SKY.day.exp;
      if (this.scene.fog) this.scene.fog.color.copy(this.hdFog).multiplyScalar(Math.max(0.1, p.hemi / SKY.day.hemi));
      if (this.dome) this.dome.material.uniforms.uExp.value = this.r.toneMappingExposure;
      return;
    }
    const u = this.sky.material.uniforms;
    u.uHor.value.setRGB(...p.hor); u.uZen.value.setRGB(...p.zen); u.uLow.value.setRGB(...p.low); u.uSun.value.fromArray(p.sun).normalize();
    u.uSunC.value.setRGB(...p.sunCol); u.uStars.value = p.stars; u.uDisc.value = p.disc;
    this.sun.color.setRGB(...p.sunCol); this.sun.intensity = p.sunI;
    this.sunDir = new THREE.Vector3().fromArray(p.sun).normalize();
    this.hemi.intensity = p.hemi; this.hemi.color.setRGB(...p.hemiSky); this.hemi.groundColor.setRGB(...p.hemiGnd);
    if (this.scene.fog) this.scene.fog.color.setRGB(...p.hor);
    this.r.toneMappingExposure = p.exp;
    if (envmap) this.envmap();
  }
  // Отражения для металла и стекла: снимок неба в кубическую карту (PMREM). Пересчитывается после смены неба.
  envmap() {
    if (this.hd) return;
    const sc = new THREE.Scene(), m = skyMesh(); m.material.uniforms = this.sky.material.uniforms; sc.add(m);
    if (this.scene.environment) this.scene.environment.dispose();
    this.scene.environment = this.pmrem.fromScene(sc, 0.02).texture;
    m.geometry.dispose();
  }
  to(name, dur = 3) { const b = SKY[name]; if (!b) return; this.trans = { a: { ...this.cur }, b, t: 0, dur: Math.max(0.01, dur) }; }
  set(name) { const b = SKY[name]; if (!b) return; this.trans = null; this.cur = { ...b }; this.apply(this.cur, true); }
  // Солнце и тени ходят за точкой внимания камеры — тени остаются чёткими там, где смотрим.
  tick(dt, focus, alt = 0) {
    if (this.trans) {
      const T = this.trans; T.t += dt; const k = Math.min(1, T.t / T.dur);
      this.cur = mixSky(T.a, T.b, k); this.apply(this.cur, false);
      if (k >= 1) { this.trans = null; this.envmap(); }
    }
    if (focus) { this.sun.target.position.copy(focus); this.sun.position.copy(focus).addScaledVector(this.sunDir, this.sunDist); }
    if (this.scene.fog && this.fog0) this.scene.fog.far = this.fog0[1] + Math.max(0, alt) * 5;
    if (this.grassMat?.userData.sh) this.grassMat.userData.sh.uniforms.uTime.value += dt;
    if (this.grassMesh && focus) { /* трава стоит на месте: поле не «плывёт» за камерой */ }
    if (this.water) this.water.offset.x += dt * 0.01, this.water.offset.y += dt * 0.004;
  }
  ground(type, size, color) {
    if (type === 'none') return;
    const rep = (m) => size / m;   // повтор текстуры: одна плитка на m метров
    let mat;
    if (type === 'field') mat = new THREE.MeshStandardMaterial({ map: texGrass(rep(8)), roughness: 1 });
    else if (type === 'concrete') mat = new THREE.MeshStandardMaterial({ map: texNoise(color || '#8f8c85', 0.22, 2600, rep(12)), roughness: 0.95 });
    else if (type === 'snow') mat = new THREE.MeshStandardMaterial({ map: texNoise(color || '#e9eef3', 0.08, 1500, rep(10), 5), roughness: 0.85, emissive: 0x9fb0c4, emissiveIntensity: 0.08 });
    else if (type === 'water') { const t = texWater(rep(20)); this.water = t; mat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.12, metalness: 0.35, color: color || 0xffffff }); }
    else mat = new THREE.MeshStandardMaterial({ map: texNoise(color || '#b39d6e', 0.3, 5000, rep(35)), roughness: 1 });
    const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat); g.rotation.x = -Math.PI / 2; g.position.y = -0.02; g.receiveShadow = true;
    this.scene.add(g); this.groundMesh = g;
    if (type === 'field') this.grass(this.env.grassRadius || 45);
  }
  // ── PBR-земля: текстура с повтором, без видимой плитки (та же текстура крупнее и повёрнутой, пятна второй
  // текстуры по шуму, крупные светлые/тёмные пятна — как с высоты выглядит настоящее поле). ──
  pbrGround(env) {
    const size = env.size || 4000, tile = env.groundTile || (env.groundRepeat ? size / env.groundRepeat : 4), rep = size / tile;
    const m = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, ...pbrMaps(env.groundTex, { repeat: rep, res: env.groundRes, arm: env.groundArm }) });
    if (m.aoMap) { m.aoMap = null; }   // у плоскости нет второго UV — AO из arm не нужен
    if (m.metalnessMap) { m.metalnessMap = null; m.metalness = 0; }
    m.normalScale.setScalar(env.groundNormal ?? 1);
    const t2 = env.groundTex2 ? tex(env.groundTex2 + '_diffuse_' + (env.groundRes2 || '1k') + '.jpg', { srgb: true, repeat: rep * (env.groundTile2K ?? 1) }) : null;
    if (env.groundColor) m.color.set(env.groundColor);
    m.onBeforeCompile = (sh) => {
      sh.uniforms.map2 = { value: t2 || m.map }; sh.uniforms.uMix2 = { value: t2 ? env.groundMix ?? 0.45 : 0 }; sh.uniforms.uMacro = { value: env.groundMacro ?? 0.35 };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vWxz;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWxz = (modelMatrix * vec4(transformed, 1.0)).xz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        varying vec2 vWxz; uniform sampler2D map2; uniform float uMix2, uMacro;
        float hn(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hn(i), hn(i+vec2(1,0)), f.x), mix(hn(i+vec2(0,1)), hn(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ return 0.5*vn(p) + 0.3*vn(p*2.03+7.1) + 0.2*vn(p*4.1+3.3); }`).replace('#include <map_fragment>', `
        #ifdef USE_MAP
          vec4 tA = texture2D(map, vMapUv);
          vec2 r2 = mat2(0.8, -0.6, 0.6, 0.8) * vMapUv * 0.31 + vec2(0.41, 0.17);
          vec4 tB = texture2D(map, r2);
          float nA = fbm(vWxz * 0.035);
          vec4 col = mix(tA, tB, smoothstep(0.3, 0.7, nA) * 0.6);
          float n2 = fbm(vWxz * 0.021 + 13.0);
          vec4 c2 = texture2D(map2, vMapUv * 0.73);
          col = mix(col, c2, uMix2 * smoothstep(0.52, 0.72, n2));
          float macro = fbm(vWxz * 0.006 + 2.0);
          col.rgb *= 1.0 + uMacro * (macro - 0.5) * 1.6;
          col.rgb = mix(col.rgb, col.rgb * vec3(1.08, 1.04, 0.86), uMacro * smoothstep(0.55, 0.8, fbm(vWxz * 0.01 + 5.0)));
          diffuseColor *= col;
        #endif`);
    };
    const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size, 1, 1), m); g.rotation.x = -Math.PI / 2; g.position.y = -0.02; g.receiveShadow = true;
    this.scene.add(g); this.groundMesh = g;
  }
  // ── Трава: пучки изогнутых травинок (по 6 в пучке), тысячи копий одним вызовом, ветер волной, цвет от корня к кончику.
  // Плотнее у центров "areas" ([x, z, r]) и реже к краю. ──
  grassField(o) {
    const n = Math.round((o.n ?? 12000) * (SLAB ? 0.4 : 1)), H = o.h ?? 0.32, areas = o.areas || [[0, 0, 40]];
    const pos = [], R0 = (() => { let s = 77; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    for (let b = 0; b < 6; b++) {   // одна травинка — 4 сегмента, сужается, изгибается
      const a = R0() * 6.283, lean = 0.15 + R0() * 0.35, h = H * (0.6 + R0() * 0.6), w = 0.012 + R0() * 0.008, ox = (R0() - 0.5) * 0.12, oz = (R0() - 0.5) * 0.12;
      const ca = Math.cos(a), sa = Math.sin(a);
      for (let i = 0; i < 4; i++) {
        const y0 = i / 4, y1 = (i + 1) / 4, w0 = w * (1 - y0), w1 = w * (1 - y1), b0 = lean * y0 * y0 * h, b1 = lean * y1 * y1 * h;
        const P = (t, y, wd, bend) => [ox + ca * bend - sa * wd * t, y * h, oz + sa * bend + ca * wd * t];
        pos.push(...P(-1, y0, w0, b0), ...P(1, y0, w0, b0), ...P(-1, y1, w1, b1), ...P(1, y0, w0, b0), ...P(1, y1, w1, b1), ...P(-1, y1, w1, b1));
      }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const nr = new Float32Array(pos.length); for (let i = 1; i < nr.length; i += 3) nr[i] = 1; geo.setAttribute('normal', new THREE.BufferAttribute(nr, 3));   // нормаль вверх — трава светится как поле
    const m = new THREE.MeshStandardMaterial({ color: o.color || 0xffffff, roughness: 0.9, side: THREE.DoubleSide });
    const cBase = new THREE.Color(o.base || '#2f3d17'), cTip = new THREE.Color(o.tip || '#a3a856');
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = { value: 0 }; sh.uniforms.cBase = { value: cBase }; sh.uniforms.cTip = { value: cTip }; sh.uniforms.uH = { value: H }; m.userData.sh = sh;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime, uH; varying float vH;').replace('#include <begin_vertex>', `#include <begin_vertex>
        vH = position.y / uH;
        vec3 ip = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
        float wv = sin(uTime * 1.7 + ip.x * 0.35 + ip.z * 0.2) * 0.6 + sin(uTime * 3.1 + ip.x * 1.3) * 0.25;
        transformed.x += wv * 0.09 * vH * vH; transformed.z += wv * 0.05 * vH * vH;`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 cBase, cTip; varying float vH;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= mix(cBase, cTip, smoothstep(0.0, 1.0, vH));');
    };
    const im = new THREE.InstancedMesh(geo, m, n), o3 = new THREE.Object3D(), c = new THREE.Color();
    const tot = areas.reduce((s, a) => s + a[2] * a[2], 0);
    for (let i = 0; i < n; i++) {
      let u = R0() * tot, A = areas[0]; for (const a of areas) { if ((u -= a[2] * a[2]) <= 0) { A = a; break; } }
      const ang = R0() * 6.283, d = Math.pow(R0(), 0.75) * A[2];
      o3.position.set(A[0] + Math.cos(ang) * d, -0.01, A[1] + Math.sin(ang) * d); o3.rotation.set(0, R0() * 6.283, 0);
      o3.scale.setScalar(0.7 + R0() * 0.7); o3.updateMatrix(); im.setMatrixAt(i, o3.matrix);
      im.setColorAt(i, c.setHSL(0.17 + R0() * 0.08, 0.35 + R0() * 0.25, 0.42 + R0() * 0.3));
    }
    im.frustumCulled = false; im.receiveShadow = true; im.castShadow = false;
    this.scene.add(im); this.grassMesh = im; this.grassMat = m;
  }
  // Облака: плоские клубы-спрайты высоко над землёй ("clouds": число облаков).
  clouds(n) {
    let s = 4; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const m = new THREE.SpriteMaterial({ map: texSmoke(), color: 0xffffff, transparent: true, depthWrite: false, fog: false, opacity: 0.9 });
    for (let i = 0; i < n; i++) {
      const a = r() * 6.283, d = 900 + r() * 1800, y = 260 + r() * 300, g = new THREE.Group();
      for (let k = 0; k < 5; k++) { const sp = new THREE.Sprite(m); sp.scale.set(260 + r() * 220, 120 + r() * 80, 1); sp.position.set((k - 2) * 90 + r() * 60, r() * 40, r() * 40); g.add(sp); }
      g.position.set(Math.cos(a) * d, y, Math.sin(a) * d); this.scene.add(g);
    }
  }
  // Трава поля: пучки из двух скрещённых треугольников, тысячи копий одним вызовом отрисовки.
  grass(R) {
    const n = SLAB ? 1500 : 4000, geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-0.08, 0, 0, 0.08, 0, 0, 0, 0.5, 0, 0, 0, -0.08, 0, 0, 0.08, 0, 0.5, 0], 3)); geo.computeVertexNormals();
    const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0x6f8f3a, side: THREE.DoubleSide, roughness: 1 }), n);
    const o = new THREE.Object3D(), c = new THREE.Color(); let s = 9; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      const a = r() * 6.283, d = Math.sqrt(r()) * R; o.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      o.rotation.set((r() - 0.5) * 0.4, r() * 6.283, (r() - 0.5) * 0.4); o.scale.setScalar(0.6 + r() * 1.1); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.setHSL(0.2 + r() * 0.06, 0.45, 0.28 + r() * 0.15));
    }
    this.scene.add(m);
  }
}
