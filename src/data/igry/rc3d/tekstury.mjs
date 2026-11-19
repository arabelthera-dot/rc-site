// rc3d · Текстуры кодом (холст 2D → CanvasTexture). Ни одной картинки с диска: всё рисуется при загрузке.
// Вынесено из Р-7 (пятно огня, клуб дыма, шум степи и бетона, иней) и дополнено: трава, снег, вода, кирпич, ткань.
import * as THREE from 'three';

export function canvasTex(size, draw, repeat, srgb = true) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 4; }
  return t;
}
// Детерминированный случайный ряд: текстура одна и та же при каждой загрузке.
export const rnd = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const cache = {};
const once = (k, f) => cache[k] || (cache[k] = f());

// Мягкое пятно — огонь, искры, ореолы, точки на карте.
export const texGlow = () => once('glow', () => canvasTex(64, (g, s) => {
  const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, s, s);
}));
// Клуб дыма/пара: два десятка полупрозрачных пятен.
export const texSmoke = () => once('smoke', () => canvasTex(128, (g, s) => {
  const R = rnd(7);
  for (let i = 0; i < 26; i++) {
    const x = s / 2 + (R() - 0.5) * s * 0.42, y = s / 2 + (R() - 0.5) * s * 0.42, rr = s * (0.12 + R() * 0.2);
    const r = g.createRadialGradient(x, y, 0, x, y, rr), a = 0.16 + R() * 0.12;
    r.addColorStop(0, `rgba(255,255,255,${a})`); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, s, s);
  }
}));
// Зернистый шум поверх основного цвета: степь, бетон, снег, песок.
export const texNoise = (base, spread = 0.25, n = 3000, repeat = 1, seed = 3) => once(`n${base}${spread}${n}${repeat}`, () => canvasTex(256, (g, s) => {
  g.fillStyle = base; g.fillRect(0, 0, s, s);
  const R = rnd(seed);
  for (let i = 0; i < n; i++) {
    const v = (R() - 0.5) * spread; g.fillStyle = v > 0 ? `rgba(255,250,235,${v})` : `rgba(40,30,15,${-v})`;
    const w = 1 + R() * 5; g.fillRect(R() * s, R() * s, w, w * (0.4 + R()));
  }
}, repeat));
// Трава: пятна зелени разной спелости и короткие штрихи стеблей.
export const texGrass = (repeat) => once('grass' + repeat, () => canvasTex(256, (g, s) => {
  g.fillStyle = '#5d7a35'; g.fillRect(0, 0, s, s);
  const R = rnd(13);
  for (let i = 0; i < 70; i++) { const x = R() * s, y = R() * s, r = 10 + R() * 40; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, R() > 0.5 ? 'rgba(120,150,60,.45)' : 'rgba(60,85,30,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, s, s); }
  for (let i = 0; i < 4500; i++) { const x = R() * s, y = R() * s; g.strokeStyle = `rgba(${90 + R() * 90 | 0},${120 + R() * 80 | 0},${30 + R() * 40 | 0},.7)`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 3, y - 2 - R() * 5); g.stroke(); }
}, repeat));
// Иней на холодном металле: белая шуба с подтёками (Р-7, кислородные баки).
export const texFrost = () => once('frost', () => canvasTex(256, (g, s) => {
  g.fillStyle = '#f4f7fa'; g.fillRect(0, 0, s, s);
  const R = rnd(11);
  for (let i = 0; i < 3200; i++) { const v = R(); g.fillStyle = v > 0.5 ? `rgba(255,255,255,${(v - 0.5) * 1.4})` : `rgba(120,145,170,${v * 0.5})`; const w = 1 + R() * 3; g.fillRect(R() * s, R() * s, w, w); }
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(140,165,190,${0.2 + R() * 0.3})`; g.fillRect(R() * s, R() * s, 1 + R() * 3, 10 + R() * 60); }
}, 3));
// Кирпичная кладка: ряды со сдвигом в полкирпича, швы, разнотон.
export const texBrick = (base = '#8f3f2a') => once('brick' + base, () => canvasTex(256, (g, s) => {
  g.fillStyle = '#b9ab95'; g.fillRect(0, 0, s, s);
  const R = rnd(17), rows = 16, bw = s / 4, bh = s / rows;
  const c = new THREE.Color(base);
  for (let r = 0; r < rows; r++) for (let k = -1; k < 5; k++) {
    const x = k * bw + (r % 2 ? bw / 2 : 0), d = (R() - 0.5) * 0.18;
    g.fillStyle = `rgb(${255 * Math.min(1, c.r * (1 + d)) | 0},${255 * Math.min(1, c.g * (1 + d)) | 0},${255 * Math.min(1, c.b * (1 + d)) | 0})`;
    g.fillRect(x + 1.5, r * bh + 1.5, bw - 3, bh - 3);
  }
}, 1));
// Ткань: полотняное переплетение (купол парашюта, флаг, брезент). Цвет задаёт материал — текстура серая.
export const texFabric = () => once('fabric', () => canvasTex(128, (g, s) => {
  g.fillStyle = '#e8e8e8'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < s; i += 2) { g.fillStyle = 'rgba(0,0,0,.07)'; g.fillRect(i, 0, 1, s); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(0, i, s, 1); }
}, 6));
// Рябь воды: светлые и тёмные блики — сдвигается во времени.
export const texWater = (repeat) => once('water' + repeat, () => canvasTex(256, (g, s) => {
  g.fillStyle = '#2f5d78'; g.fillRect(0, 0, s, s);
  const R = rnd(21);
  for (let i = 0; i < 900; i++) { const x = R() * s, y = R() * s, w = 6 + R() * 26; g.fillStyle = R() > 0.5 ? `rgba(190,225,240,${0.08 + R() * 0.15})` : `rgba(10,30,50,${0.1 + R() * 0.15})`; g.fillRect(x, y, w, 1 + R() * 2); }
}, repeat));
// Светящийся поток: полосы вдоль трубы, при сдвиге смещения «течёт».
export const texFlow = () => once('flow', () => {
  const t = canvasTex(128, (g, s) => {
    const gr = g.createLinearGradient(0, 0, s, 0);
    for (let k = 0; k <= 8; k++) gr.addColorStop(k / 8, k % 2 ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,.35)');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
});
// Пузыри и «пробки» пара в потоке: светлые овалы с разрывами.
export const texBubbles = () => once('bubbles', () => {
  const t = canvasTex(128, (g, s) => {
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 0, s, s);
    const R = rnd(31);
    for (let i = 0; i < 9; i++) { const x = R() * s, y = R() * s, r = 6 + R() * 18; g.fillStyle = 'rgba(255,255,255,1)'; g.beginPath(); g.ellipse(x, y, r * 1.6, r, 0, 0, 6.283); g.fill(); }
    g.clearRect(s * 0.45, 0, s * 0.12, s);   // «пробка» пара — разрыв в потоке
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
});
// Карта нормалей шёлка: частое полотняное переплетение (нити — синусоиды) и шов у края плитки (u = 0) — при повторе
// по окружности купола «gores» раз даёт швы между клиньями.
export const texSilk = () => once('silk', () => {
  const s = 256, c = document.createElement('canvas'); c.width = c.height = s; const g = c.getContext('2d'), im = g.createImageData(s, s), R = rnd(29);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const wx = Math.sin(x * Math.PI / 2) * 0.18, wy = Math.sin(y * Math.PI / 2 + (x % 4 < 2 ? 0 : 1.5)) * 0.18;
    const d = Math.min(x, s - 1 - x), seam = d < 5 ? (x < s / 2 ? 1 : -1) * (5 - d) / 5 * 0.7 : 0;
    const nx = wx + seam + (R() - 0.5) * 0.04, ny = wy + (R() - 0.5) * 0.04, i = (y * s + x) * 4;
    im.data[i] = 128 + nx * 127; im.data[i + 1] = 128 + ny * 127; im.data[i + 2] = 255; im.data[i + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
});
