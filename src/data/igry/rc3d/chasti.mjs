// rc3d · Части модели предмета дня (r595): нажать часть на модели или кнопкой под ней — часть подсвечивается,
// её факт показывается рядом HTML-текстом (не поверх 3D). «Разобрать» — части разъезжаются на смещения из .glb
// (extras.razborka = [x, y, z] узла, в долях размера модели не пересчитывается — в метрах самой модели).
// Разметка — блок [data-igd-chasti] рядом со сценой (рисует шаблон дня из igra.model3d.chasti); нет блока — ничего не делает.
import * as THREE from 'three';

const ZOLOTO = new THREE.Color(0xd9a441);

export function chasti({ stage, r, cam, c, m }) {
  const blok = stage.parentNode && stage.parentNode.querySelector('[data-igd-chasti]');
  if (!blok) return;
  const knopki = [...blok.querySelectorAll('[data-uzel]')].filter((b) => b.tagName === 'BUTTON');
  const fakty = [...blok.querySelectorAll('.igd-fakt[data-uzel]')];
  const UZLY = {}, BAZA = {};
  for (const b of knopki) {
    const u = m.getObjectByName(b.getAttribute('data-uzel'));
    if (!u) { b.hidden = true; continue; }
    UZLY[u.name] = u; BAZA[u.name] = u.position.clone();
    // Свой материал у каждой части — чтобы подсветка не перекрашивала соседей с тем же материалом.
    u.traverse((x) => { if (x.isMesh) { x.material = x.material.clone(); x.userData.em = x.material.emissive ? x.material.emissive.clone() : null; } });
  }
  let akt = null, t0 = 0;
  const svet = (imya, k) => UZLY[imya] && UZLY[imya].traverse((x) => {
    if (x.isMesh && x.userData.em) x.material.emissive.copy(x.userData.em).lerp(ZOLOTO, k);
  });
  function vybrat(imya) {
    if (akt) svet(akt, 0);
    akt = imya; c.autoRotate = false; t0 = performance.now();
    for (const b of knopki) b.setAttribute('aria-pressed', String(b.getAttribute('data-uzel') === imya));
    for (const f of fakty) f.hidden = f.getAttribute('data-uzel') !== imya;
    puls();
  }
  // Подсветка — три мягких вспышки и ровное слабое свечение, пока часть выбрана.
  function puls() {
    if (!akt) return;
    const t = (performance.now() - t0) / 1000;
    svet(akt, t < 1.8 ? 0.22 + 0.2 * Math.sin(t * Math.PI * 3.3) ** 2 : 0.22);
    if (t < 1.8) requestAnimationFrame(puls);
  }
  for (const b of knopki) b.addEventListener('click', () => vybrat(b.getAttribute('data-uzel')));

  // Нажатие на саму модель: короткое касание без сдвига (сдвиг — это поворот).
  const ray = new THREE.Raycaster(), p = new THREE.Vector2(), el = r.domElement;
  const naiti = (e) => {
    const b = el.getBoundingClientRect();
    p.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(p, cam);
    for (const h of ray.intersectObject(m, true)) {
      for (let o = h.object; o; o = o.parent) if (UZLY[o.name] === o) return o.name;
    }
    return null;
  };
  let x0 = 0, y0 = 0;
  el.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; });
  el.addEventListener('pointerup', (e) => {
    if (Math.hypot(e.clientX - x0, e.clientY - y0) > 6) return;
    const n = naiti(e); if (n) vybrat(n);
  });
  let zhdu = 0;
  el.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || e.buttons || zhdu) return;
    zhdu = requestAnimationFrame(() => { zhdu = 0; el.style.cursor = naiti(e) ? 'pointer' : ''; });
  });

  // Разборка: части с extras.razborka плавно разъезжаются и съезжаются обратно.
  const razb = blok.querySelector('[data-igd-razbor]');
  const est = Object.values(UZLY).some((u) => Array.isArray(u.userData.razborka));
  if (!razb) return;
  if (!est) { razb.hidden = true; return; }
  let cel = 0, e = 0, idet = false;
  const sm = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  function shag() {
    e += (cel - e) * 0.08; if (Math.abs(cel - e) < 1e-3) e = cel;
    for (const [imya, u] of Object.entries(UZLY)) {
      const d = u.userData.razborka; if (!Array.isArray(d)) continue;
      const k = sm(e);
      u.position.set(BAZA[imya].x + d[0] * k, BAZA[imya].y + d[1] * k, BAZA[imya].z + d[2] * k);
    }
    if (e !== cel) requestAnimationFrame(shag); else idet = false;
  }
  razb.addEventListener('click', () => {
    cel = cel ? 0 : 1; c.autoRotate = false;
    razb.textContent = cel ? razb.getAttribute('data-sobrat') : razb.getAttribute('data-razobrat');
    razb.setAttribute('aria-pressed', String(!!cel));
    if (!idet) { idet = true; requestAnimationFrame(shag); }
  });
}
