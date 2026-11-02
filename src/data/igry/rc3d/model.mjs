// rc3d · Просмотр 3D-модели предмета дня (Р432): один .glb (meshopt), свет студии, поворот пальцем или мышью.
// Собирается вместе с движком (tools/rc3d/build.mjs) в public/assets/igra-dnya/model3d.js; грузит его общий блок игры
// дня public/assets/igra-dnya.js. Колесо мыши и вертикальный жест не перехватываются — страница листается как обычно.
// Свет и пол — как в образце r567 (студия: ключевой сверху-спереди, два контровых сзади, слабая заливка снизу,
// мягкое пятно тени на полу текстурой — без карт теней). Лёгкость (r584): pixelRatio ≤ 1,5 (на телефоне ≤ 1,25),
// сглаживание только при pixelRatio < 1,5; если кадр дольше 45 мс, разрешение снижается ступенями до 0,6.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Пятно тени под предметом: радиальный градиент на квадрате пола.
function pyatno() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,.75)'); g.addColorStop(0.35, 'rgba(0,0,0,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// pokazat(stage, glb, {progress}) → Promise: модель в кадре и первый кадр нарисован.
export function pokazat(stage, glb, o = {}) {
  const tel = window.matchMedia && matchMedia('(pointer:coarse)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, tel ? 1.25 : 1.5);
  const r = new THREE.WebGLRenderer({ antialias: DPR < 1.5, alpha: true, powerPreference: 'high-performance' });
  let dpr = DPR; r.setPixelRatio(dpr);
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environmentIntensity = 0.45;
  const svet = [[0xfff1e2, 1.7, 10, 22, 16], [0xdbe8ff, 3.6, -16, 12, -18], [0xfff4ea, 2.6, 18, 6, -14]];
  for (const [col, sila, x, y, z] of svet) { const l = new THREE.DirectionalLight(col, sila); l.position.set(x, y, z); scene.add(l); }
  scene.add(new THREE.HemisphereLight(0x8fa2c4, 0x1a1c22, 0.25));
  const cam = new THREE.PerspectiveCamera(30, 1, 0.01, 1000);
  const c = new OrbitControls(cam, r.domElement);
  c.enableZoom = false; c.enablePan = false; c.enableDamping = true; c.autoRotate = true; c.autoRotateSpeed = 1.2;
  c.minPolarAngle = 0.15; c.maxPolarAngle = Math.PI / 2 + 0.35;
  c.addEventListener('start', () => { c.autoRotate = false; });
  r.domElement.style.touchAction = 'pan-y';
  let size = new THREE.Vector3(1, 1, 1);
  // Камера — чтобы предмет целиком входил в кадр и по высоте, и по ширине, с запасом 12 %.
  const kadr = () => {
    const t = Math.tan(cam.fov * Math.PI / 360), w = Math.max(size.x, size.z);
    const d = Math.max(size.y / 2 / t, w / 2 / (t * cam.aspect)) * 1.12 + w / 2;
    const ug = 0.16;   // чуть сверху: видны и нос, и сопла
    cam.position.set(d * Math.cos(ug) * 0.6, d * Math.sin(ug), d * Math.cos(ug) * 0.8);
    cam.near = d / 100; cam.far = d * 20; cam.updateProjectionMatrix(); c.update();
  };
  const razmer = () => { const w = stage.clientWidth || 640, h = stage.clientHeight || 400; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); kadr(); };
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  return loader.loadAsync(glb, (e) => { if (o.progress && e.total) o.progress(e.loaded / e.total); }).then((g) => {
    const m = g.scene; scene.add(m);
    m.traverse((x) => { if (x.isMesh) { x.castShadow = x.receiveShadow = false; x.frustumCulled = true; } });
    const box = new THREE.Box3().setFromObject(m), mid = box.getCenter(new THREE.Vector3());
    size = box.getSize(new THREE.Vector3());
    m.position.sub(mid);
    const pol = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: pyatno(), transparent: true, depthWrite: false }));
    const s = Math.max(size.x, size.z) * 2.6; pol.scale.set(s, s, 1);
    pol.rotation.x = -Math.PI / 2; pol.position.y = -size.y / 2 + size.y * 0.002; scene.add(pol);
    c.target.set(0, 0, 0);
    stage.appendChild(r.domElement); razmer();
    new ResizeObserver(razmer).observe(stage);
    let vidno = true, t0 = 0, dolgo = 0;
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { vidno = es[0].isIntersecting; }).observe(stage);
    r.setAnimationLoop((t) => {
      if (!vidno) { t0 = 0; return; }
      // Медленный кадр (> 45 мс) 20 раз подряд — разрешение ниже на 20 %, не ниже 0,6.
      if (t0) { dolgo = t - t0 > 45 ? dolgo + 1 : 0; if (dolgo > 20 && dpr > 0.6) { dpr = Math.max(0.6, dpr * 0.8); r.setPixelRatio(dpr); razmer(); dolgo = 0; } }
      t0 = t;
      c.update(); r.render(scene, cam);
    });
    r.render(scene, cam);
    return { stop: () => r.setAnimationLoop(null), info: () => ({ dpr, tri: r.info.render.triangles, calls: r.info.render.calls }) };
  });
}
