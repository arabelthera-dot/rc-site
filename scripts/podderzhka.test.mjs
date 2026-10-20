// Юнит-тест вырезания блоков поддержки (src/lib/podderzhka.mjs) на всех полных страницах src/data/full-pages.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { vyrezatPodderzhku, podderzhkaVkl } from '../src/lib/podderzhka.mjs';

assert.equal(podderzhkaVkl({}), false);
assert.equal(podderzhkaVkl({ PUBLIC_PODDERZHKA: '1' }), true);

const mini = '<p>до</p><div class="support x"><div class="sup-l">Поддержать проект</div><div><a href="#">Поддержать выпуск →</a></div></div><p>после</p>'
  + '<div id="heart" title="Поддержать проект">❤<span>Поддержать проект</span></div><script>(function(){var h=document.getElementById(\'heart\');})();</script>'
  + '<div class="dp-sup" data-support-slot></div><script>window.MUSEUM_SUPPORT={museum:"x"};</script><script src="../assets/museum-support.js"></script>';
const r = vyrezatPodderzhku(mini);
assert.equal(r.html, '<p>до</p><p>после</p>');

const root = 'src/data/full-pages';
let stranic = 0, blokov = 0, vsego = 0;
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) { walk(f); continue; }
    if (!e.name.endsWith('.html')) continue;
    vsego++;
    const html = fs.readFileSync(f, 'utf8');
    const out = vyrezatPodderzhku(html);
    assert.ok(!/Поддержать проект|museum-support\.js|data-support-slot|id="heart"/.test(out.html), `${f}: осталась поддержка`);
    // вырезано только своё: остальные блоки страницы на месте
    for (const t of ['<h1', '</main>', '</body>', '<footer']) assert.equal(out.html.split(t).length, html.split(t).length, `${f}: потерян ${t}`);
    if (out.html !== html) { stranic++; blokov += out.blokov; }
  }
};
walk(root);
console.log(`podderzhka.test: ок — ${vsego} полных страниц, затронуто ${stranic}, вырезано ${blokov} блоков/кнопок`);
