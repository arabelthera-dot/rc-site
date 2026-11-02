// rc3d · Просмотр 3D-модели предмета дня (Р432): один .glb (meshopt), свет студии, поворот пальцем или мышью.
// Собирается вместе с движком (tools/rc3d/build.mjs) в public/assets/igra-dnya/model3d.js; грузит его общий блок игры
// дня public/assets/igra-dnya.js. Колесо мыши и вертикальный жест не перехватываются — страница листается как обычно.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { chasti } from './chasti.mjs';

// pokazat(stage, glb, {progress}) → Promise: модель в кадре и первый кадр нарисован.
export function pokazat(stage, glb, o = {}) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfd4ff, 1.2); rim.position.set(-4, 2, -5); scene.add(rim);
  const cam = new THREE.PerspectiveCamera(32, 1, 0.01, 1000);
  const c = new OrbitControls(cam, r.domElement);
  c.enableZoom = false; c.enablePan = false; c.enableDamping = true; c.autoRotate = true; c.autoRotateSpeed = 1.2;
  c.minPolarAngle = 0.15; c.maxPolarAngle = Math.PI - 0.15;
  c.addEventListener('start', () => { c.autoRotate = false; });
  r.domElement.style.touchAction = 'pan-y';
  const razmer = () => { const w = stage.clientWidth || 640, h = stage.clientHeight || 400; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  return loader.loadAsync(glb, (e) => { if (o.progress && e.total) o.progress(e.loaded / e.total); }).then((g) => {
    const m = g.scene; scene.add(m);
    const box = new THREE.Box3().setFromObject(m), size = box.getSize(new THREE.Vector3()), mid = box.getCenter(new THREE.Vector3());
    m.position.sub(mid);
    const R = size.length() / 2;
    cam.position.set(R * 1.6, R * 0.7, R * 2.2); cam.near = R / 100; cam.far = R * 100; c.target.set(0, 0, 0);
    stage.appendChild(r.domElement); razmer(); c.update();
    chasti({ stage, r, cam, c, m });   // части с фактами рядом, если у дня есть igra.model3d.chasti
    new ResizeObserver(razmer).observe(stage);
    let vidno = true;
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { vidno = es[0].isIntersecting; }).observe(stage);
    r.setAnimationLoop(() => { if (!vidno) return; c.update(); r.render(scene, cam); });
    r.render(scene, cam);
    return { stop: () => r.setAnimationLoop(null) };
  });
}
