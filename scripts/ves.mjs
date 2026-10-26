// Замок веса сайта (план переезда, шаг 5 — внутри единственной проверки).
// Лимит GitHub Pages — 1 ГБ на сайт; 18.10.2026 сборка уже весила 1142 МБ, после пережатия — 960 МБ.
// Корень роста — ролики: ~20 МБ в день с каждым новым mp4. Замок ловит рост в заявке, а не на выкладке.
// С 26.10.2026 (Р263, r284) ролики в Pages не уходят — их отдаёт только свой сервер (deploy.yml, артефакт
// video-sajta), поэтому с --bez-video порог считается по артефакту Pages: сборка без *.mp4; вес роликов — строкой.
//   node scripts/ves.mjs --dist dist [--porog 950] [--rolik 12] [--bez-video]
// Выход 1 — сборка тяжелее порога (МБ, 10^6 байт). Тяжёлые ролики (> --rolik МБ) — только список:
// их пережимают (CRF 26, см. заявку #85), а не удаляют.
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const dist = arg('dist', 'dist');
const porog = Number(arg('porog', 950));
const rolik = Number(arg('rolik', 12));
const bezVideo = process.argv.includes('--bez-video');
const MB = 1e6;

let vsego = 0;
const poTipu = {};
const tyazhelye = [];
const obhod = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { obhod(p); continue; }
    if (!e.isFile()) continue;
    const s = statSync(p).size;
    vsego += s;
    const ext = (e.name.match(/\.([a-z0-9]+)$/i)?.[1] || '—').toLowerCase();
    poTipu[ext] = (poTipu[ext] || 0) + s;
    if (ext === 'mp4' && s > rolik * MB) tyazhelye.push([relative(dist, p), s]);
  }
};
obhod(dist);
const video = poTipu.mp4 || 0;
const ves = bezVideo ? vsego - video : vsego;

const mb = (b) => (b / MB).toFixed(1);
const verh = Object.entries(poTipu).sort((a, b) => b[1] - a[1]).slice(0, 6)
  .map(([k, v]) => `${k} ${mb(v)}`).join(', ');
const chto = bezVideo ? 'Вес артефакта Pages (без роликов)' : 'Вес сборки';
console.log(`${chto}: ${mb(ves)} МБ из ${porog} (лимит хостинга 1000). Больше всего: ${verh}.`);
if (bezVideo) console.log(`Ролики (только свой сервер): ${mb(video)} МБ; полная сборка для сервера — ${mb(vsego)} МБ.`);
if (tyazhelye.length) {
  console.log(`Ролики тяжелее ${rolik} МБ (${tyazhelye.length}) — пережать:`);
  for (const [p, s] of tyazhelye.sort((a, b) => b[1] - a[1])) console.log(`  ${mb(s)} МБ  ${p}`);
}
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFileSync } = await import('node:fs');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    `### Вес сайта\n${chto}: ${mb(ves)} МБ из ${porog}${bezVideo ? `; ролики ${mb(video)} МБ, полная сборка ${mb(vsego)} МБ` : ''}; тяжёлых роликов: ${tyazhelye.length}\n`);
}
if (ves > porog * MB) {
  console.log(`КРАСНОЕ: ${bezVideo ? 'артефакт Pages' : 'сборка'} тяжелее ${porog} МБ — выкладка упрётся в лимит 1 ГБ.`);
  process.exit(1);
}
