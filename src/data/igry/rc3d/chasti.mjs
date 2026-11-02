// rc3d · Части модели предмета дня (r594): узлы .glb с extras {nazvanie, fakt[, razbor:[x,y,z]]} нажимаются на модели
// или кнопкой под ней — часть подсвечивается, факт выходит HTML-подписью под сценой (на холсте текста нет).
// razbor — сдвиг узла при «Разобрать» (в единицах модели). Нет частей в .glb — ничего не делает.
import * as THREE from 'three';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };

export function chasti(stage, model, cam, canvas, c) {
  const list = [];
  model.traverse((x) => { if (x.userData && x.userData.nazvanie && x.userData.fakt) list.push(x); });
  if (!list.length) return null;
  const blok = el('div', 'igd-chasti'), knopki = el('div', 'igd-chasti-k'), podpis = el('div', 'igd-podpis');
  podpis.setAttribute('aria-live', 'polite');
  const nach = el('p', 'igd-podpis-t', 'Нажми на часть модели или на её имя — здесь появится факт.');
  podpis.append(nach);
  blok.append(knopki, podpis);
  stage.after(blok);
  // Подсветка: свои копии материалов у мешей части, тёплое свечение.
  const mats = new Map();
  for (const p of list) p.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); mats.set(m, m.material.emissive ? m.material.emissive.clone() : null); } });
  let akt = null;
  const svet = (p, on) => p.traverse((m) => { if (m.isMesh && m.material.emissive) { if (on) m.material.emissive.setRGB(0.35, 0.22, 0.05); else m.material.emissive.copy(mats.get(m)); } });
  const btn = new Map();
  function vybrat(p) {
    if (akt) { svet(akt, false); btn.get(akt).setAttribute('aria-pressed', 'false'); }
    akt = p; svet(p, true); btn.get(p).setAttribute('aria-pressed', 'true');
    podpis.replaceChildren(el('b', 'igd-podpis-h', p.userData.nazvanie), el('p', 'igd-podpis-t', p.userData.fakt));
    c.autoRotate = false;
  }
  for (const p of list) {
    const b = el('button', 'igd-chast', p.userData.nazvanie); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => vybrat(p)); btn.set(p, b); knopki.append(b);
  }
  // Разборка: узлы с razbor плавно уходят на свой сдвиг и возвращаются.
  const ezd = list.concat([]).filter((p) => Array.isArray(p.userData.razbor));
  model.traverse((x) => { if (Array.isArray(x.userData.razbor) && !ezd.includes(x)) ezd.push(x); });
  let cel = 0, t = 0;
  for (const p of ezd) p.userData.domoi = p.position.clone();
  if (ezd.length) {
    const r = el('button', 'igd-chast igd-razbor', 'Разобрать'); r.type = 'button';
    r.addEventListener('click', () => { cel = cel ? 0 : 1; r.textContent = cel ? 'Собрать' : 'Разобрать'; c.autoRotate = false; });
    knopki.prepend(r);
  }
  // Нажатие по модели: короткий щелчок без поворота (сдвиг < 6 px).
  const ray = new THREE.Raycaster(), v = new THREE.Vector2();
  let x0 = 0, y0 = 0;
  canvas.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; });
  const naiti = (e) => {
    const b = canvas.getBoundingClientRect();
    v.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(v, cam);
    for (const h of ray.intersectObject(model, true)) { let o = h.object; while (o && !list.includes(o)) o = o.parent; if (o) return o; }
    return null;
  };
  canvas.addEventListener('pointerup', (e) => { if (Math.hypot(e.clientX - x0, e.clientY - y0) > 6) return; const p = naiti(e); if (p) vybrat(p); });
  canvas.addEventListener('pointermove', (e) => { if (e.buttons) return; canvas.style.cursor = naiti(e) ? 'pointer' : ''; });
  // Шаг анимации разборки — из цикла отрисовки.
  return function shag(dt) {
    if (!ezd.length || Math.abs(t - cel) < 1e-4) return;
    t += Math.sign(cel - t) * Math.min(Math.abs(cel - t), dt * 0.9);
    const k = t * t * (3 - 2 * t);
    for (const p of ezd) { const d = p.userData.razbor; p.position.set(p.userData.domoi.x + d[0] * k, p.userData.domoi.y + d[1] * k, p.userData.domoi.z + d[2] * k); }
  };
}
