// rc3d · Загрузка ресурсов с диска: модели glTF/GLB, PBR-текстуры, HDRI. Всё с кешем: одна модель для десяти копий
// грузится один раз. Пути в сценарии — от папки ресурсов rc3d/assets/ ("models/chelovek-1912.glb", "tex/grass004").
// Лицензии каждого файла — assets/LICENSES.md.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

let ROOT = new URL('./assets/', import.meta.url).href;
export const setAssetRoot = (u) => { if (u) ROOT = u; };
export const url = (p) => (/^(https?:|\/|\.\/|\.\.\/)/.test(p) ? p : ROOT + p);

const gltfL = new GLTFLoader(); gltfL.setMeshoptDecoder(MeshoptDecoder);
const texL = new THREE.TextureLoader();
const cache = new Map();
const once = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };

// glTF/GLB: {scene, animations}. Сцену не трогать — каждое тело получает свой клон (SkeletonUtils.clone).
export const gltf = (src) => once('g:' + src, () => gltfL.loadAsync(url(src)));
export const hdr = (src) => once('h:' + src, () => new HDRLoader().setDataType(THREE.FloatType).loadAsync(url(src)));

// Текстура с повтором. Цветовые карты — sRGB, остальные (нормали, шероховатость, arm) — линейные.
export function tex(path, { srgb = false, repeat, aniso = 8 } = {}) {
  const t = once('t:' + path + srgb, () => {
    const x = texL.load(url(path), undefined, undefined, () => console.warn('rc3d: нет текстуры', path));
    x.wrapS = x.wrapT = THREE.RepeatWrapping; x.anisotropy = aniso; if (srgb) x.colorSpace = THREE.SRGBColorSpace;
    return x;
  });
  if (!repeat) return t;
  // Клон делит с исходником картинку (Source): догрузится — обновятся оба; свой только повтор.
  const c = t.clone(); c.repeat.set(...(Array.isArray(repeat) ? repeat : [repeat, repeat]));
  return c;
}

// Набор PBR-карт по общему соглашению имён (как у Poly Haven): <id>_diffuse_1k.jpg, <id>_nor_gl_1k.jpg,
// <id>_rough_1k.jpg, <id>_arm_1k.jpg (AO/шероховатость/металл в каналах R/G/B), <id>_opacity_1k.jpg.
// res — "1k" или по картам: {"diffuse":"2k"}; maps — какие карты есть (по умолчанию diffuse, nor_gl, rough).
export function pbrMaps(id, o = {}) {
  const maps = o.maps || (o.arm ? ['diffuse', 'nor_gl', 'arm'] : ['diffuse', 'nor_gl', 'rough']);
  const res = (k) => (typeof o.res === 'object' ? o.res[k] || '1k' : o.res || '1k');
  const f = (k) => `${id}_${k}_${res(k)}.jpg`, rep = o.repeat;
  const out = {};
  if (maps.includes('diffuse')) out.map = tex(f('diffuse'), { srgb: true, repeat: rep });
  if (maps.includes('nor_gl')) out.normalMap = tex(f('nor_gl'), { repeat: rep });
  if (maps.includes('rough')) out.roughnessMap = tex(f('rough'), { repeat: rep });
  if (maps.includes('arm')) { const a = tex(f('arm'), { repeat: rep }); out.aoMap = a; out.roughnessMap = a; out.metalnessMap = a; }
  if (maps.includes('opacity')) out.alphaMap = tex(f('opacity'), { repeat: rep });
  return out;
}
