// rc3d · Земной шар и дуга пути (отдельный чанк: грузится, только если сценарий их использует).
// Земля — Natural Earth 1:110 млн (общественное достояние, пакет world-atlas). Из Р-7, второй акт «полёт до Камчатки».
// globe: {"type":"globe","r":100}. route: {"type":"route","parent":"zemlya","from":[45.9,63.3],"to":[57.3,160.9],"height":16,"color":"#f0d27a"}.
// Тело на шаре: {"latlon":[lat,lon,h]} у любого тела, чей родитель — globe.
import * as THREE from 'three';
import { feature } from 'topojson-client';
import land110 from 'world-atlas/land-110m.json';
import { canvasTex } from './tekstury.mjs';
import { tex } from './zagruzka.mjs';

const D2R = Math.PI / 180;
export const ll = (R, lat, lon, h = 0) => { const la = lat * D2R, ph = (lon + 180) * D2R, r = R + h; return new THREE.Vector3(-r * Math.cos(la) * Math.cos(ph), r * Math.sin(la), r * Math.cos(la) * Math.sin(ph)); };

let TEX = null;
function earthTex() {
  if (TEX) return TEX;
  TEX = canvasTex(2048, (g, s) => {
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
      for (const poly of polys) for (const sh of [-W, 0, W]) {   // контур через линию перемены дат — непрерывно, трижды со сдвигом
        g.beginPath();
        for (const ring of poly) { let prev = null, acc = 0; ring.forEach(([lo, la], i) => { if (prev !== null && Math.abs(lo - prev) > 180) acc += prev > lo ? 360 : -360; prev = lo; const x = (lo + acc + 180) / 360 * W + sh, y = (90 - la) / 180 * H; i ? g.lineTo(x, y) : g.moveTo(x, y); }); }
        g.fill('evenodd'); g.stroke();
      }
    }
  });
  TEX.repeat.set(1, 0.5); TEX.offset.set(0, 0.5); TEX.anisotropy = 8;   // холст квадратный, карта — верхняя половина
  return TEX;
}

export function build(o, ctx) {
  if (o.type === 'globe') {
    const R = o.r ?? 100, g = new THREE.Group(), shar = new THREE.Group(); g.add(shar);
    // "map":"tex/zemlya.webp" — настоящая карта (равнопромежуточная, как Blue Marble) вместо контуров Natural Earth;
    // "clouds":"tex/oblaka.webp" — облака отдельной сферой (яркость = прозрачность); "pod":[lat,lon] — эта точка вверху (+Y).
    const m = new THREE.MeshStandardMaterial({ map: o.map ? tex(o.map, { srgb: true }) : earthTex(), roughness: o.map ? 0.85 : 1, metalness: 0 });
    shar.add(new THREE.Mesh(new THREE.SphereGeometry(R, 128, 64), m));
    if (o.clouds) { const c = tex(o.clouds); shar.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.004, 96, 48), new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: c, transparent: true, depthWrite: false, roughness: 1 }))); }
    if (o.pod) shar.quaternion.setFromUnitVectors(ll(1, ...o.pod).normalize(), new THREE.Vector3(0, 1, 0));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.035, 64, 32), new THREE.ShaderMaterial({
      side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vec4 p=modelViewMatrix*vec4(position,1.); vP=p.xyz; gl_Position=projectionMatrix*p; }',
      fragmentShader: 'varying vec3 vN; varying vec3 vP; void main(){ float f=pow(1.-abs(dot(vN,normalize(-vP))),3.); gl_FragColor=vec4(.35,.62,1.,1.)*f*1.4; }',
    })));
    g.userData.globeR = R;
    return { o: g, mats: [m], extra: { globe: { R } } };
  }
  // Путь по большому кругу, высота — парабола (преувеличена). fill — доля уже пройденного пути.
  const par = ctx.objs[o.parent]; const R = par?.globe?.R ?? 100;
  const A = ll(R, ...o.from).normalize(), B = ll(R, ...o.to).normalize(), ang = A.angleTo(B), N = 240, pts = [], hgt = o.height ?? R * 0.16;
  for (let i = 0; i <= N; i++) { const t = i / N; const d = A.clone().multiplyScalar(Math.sin((1 - t) * ang)).add(B.clone().multiplyScalar(Math.sin(t * ang))).divideScalar(Math.sin(ang)); pts.push(d.normalize().multiplyScalar(R + 0.15 + hgt * 4 * t * (1 - t))); }
  const curve = new THREE.CatmullRomCurve3(pts), g = new THREE.Group();
  if (o.ghost !== false) {
    const ghost = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0x8fa5b9, dashSize: R * 0.012, gapSize: R * 0.014, transparent: true, opacity: 0.55 }));
    ghost.computeLineDistances(); g.add(ghost);
  }
  const geo = new THREE.TubeGeometry(curve, N, o.r ?? R * 0.0032, 8, false); geo.userData = { len: curve.getLength(), seg: N, radial: 8 };
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(o.color || '#f0d27a') });
  const tube = new THREE.Mesh(geo, m); g.add(tube);
  const flow = { geo, fill: o.fill ?? 0, update() { geo.setDrawRange(0, Math.round(Math.max(0, Math.min(1, this.fill)) * N) * 8 * 6); } };
  flow.update();
  return { o: g, mats: [m], extra: { flow, curve } };
}
