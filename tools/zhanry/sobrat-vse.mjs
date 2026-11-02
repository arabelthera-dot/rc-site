#!/usr/bin/env node
// Генератор игр по жанрам — одна команда на весь музей (Р424/Р425, r554, r564):
//   node tools/zhanry/sobrat-vse.mjs [музей]        — по умолчанию izobreteniya
// Берёт расписание tools/zhanry/raspisanie.yaml (день → жанр и вариация), для каждого дня, у жанра которого есть модуль,
// читает карточку src/content/dni-shablon/<музей>/ММ-ДД.yaml и сам собирает игру по шаблону жанра. Ручной правки под день нет.
// Пишет: src/data/igry/<музей>/<жанр>-ММ-ДД.html, public/muzei/<музей>/igry/<жанр>-ММ-ДД.js (копия движка), public/assets/zhanr-<жанр>.css;
// в карточке дня — igra.vtoraya и css. Если у дня есть 3D-модель предмета (obshchee/dannye.mjs → modelDnya) —
// ещё сцена public/muzei/<музей>/igry/rc3d/scen/zhanr-ММ-ДД.json и igra.rc3d; модели нет — rc3d снимается.
import fs from 'node:fs';
import YAML from 'yaml';
import { modelDnya, podklyuchit, krasivo } from './obshchee/dannye.mjs';
import * as masshtab from './masshtab/zhanr.mjs';
import * as opyt from './opyt/zhanr.mjs';

// Жанры с модулем: код карты r554 → модуль и вариации по буквам. Новый жанр — папка + строка здесь (см. obshchee/README.md).
const ZHANRY = {
  G7: { modul: masshtab, variacii: { а: 'glubina', б: 'moroz' } },
  G14: { modul: opyt, variacii: { а: 'raskruti', б: 'nagrey' } },
};

const muzei = process.argv[2] || 'izobreteniya';
const RASP = YAML.parse(fs.readFileSync(new URL('raspisanie.yaml', import.meta.url), 'utf8'))[muzei];
if (!RASP) { console.error(`В tools/zhanry/raspisanie.yaml нет музея «${muzei}»`); process.exit(2); }

const kopii = new Set();
let gotovo = 0, vsego = 0, oshibok = 0;
for (const [den, kod] of Object.entries(RASP)) {
  const [, g, bukva] = String(kod).match(/^(G\d+)([абвг])?$/) || [];
  const Z = ZHANRY[g];
  if (!Z) { console.log(`${den}: ${kod} — модуля жанра пока нет, пропускаю`); continue; }
  vsego++;
  const variaciya = Z.variacii[bukva];
  if (!variaciya) { console.log(`${den}: ${kod} — вариации «${bukva}» у жанра пока нет, пропускаю`); oshibok++; continue; }
  const M = Z.modul, put = `src/content/dni-shablon/${muzei}/${den}.yaml`, imya = `${M.id}-${den}`;
  try {
    const x = M.dannye(YAML.parse(fs.readFileSync(put, 'utf8')), den, { variaciya });
    if (x.variant !== variaciya) throw new Error(`расписание просит ${variaciya}, а данные дня дают ${x.variant}`);
    fs.writeFileSync(`src/data/igry/${muzei}/${imya}.html`, M.html(x, fs.readFileSync(M.faily.shablon, 'utf8')));
    fs.writeFileSync(`public/muzei/${muzei}/igry/${imya}.js`,
      `/* Сгенерировано tools/zhanry/sobrat-vse.mjs из ${put} — не править, править tools/zhanry/${M.id}/dvizhok.js. */\n` + fs.readFileSync(M.faily.dvizhok, 'utf8'));
    if (!kopii.has(M.css)) { fs.copyFileSync(M.faily.css, `public/assets/${M.css}.css`); kopii.add(M.css); }
    // 3D: есть модель предмета — сцена жанра, нет — снять свою сцену (если была).
    const model = modelDnya(muzei, den), scen = `zhanr-${den}`, putScen = `public/muzei/${muzei}/igry/rc3d/scen/${scen}.json`;
    let rc3d = null;
    if (model) {
      const S = M.scena3d(x, model);
      fs.writeFileSync(putScen, JSON.stringify(S, null, 1) + '\n');
      rc3d = { scen, h2: S.igra.title, lead: S.igra.lead, alt: `Трёхмерная сцена: ${x.predmet}. Поворачивается пальцем или мышью`,
        razmer: `около ${krasivo(Math.max(1, Math.round((model.bayt + 1.05e6) / 1e6)))} МБ` };
    } else if (fs.existsSync(putScen)) fs.unlinkSync(putScen);
    podklyuchit(put, { imya, css: M.css, rc3d });
    gotovo++;
    console.log(`${den}: ${kod} ${M.nazvanie} · «${x.predmet}» · вариация ${x.variant} · шагов истории ${x.n} · цифра «${x.cifra.v} ${x.cifra.k}» · `
      + `снимок ${x.img.src} · сцена ${model ? `2D + 3D (${model.src})` : '2D (3D-модели нет)'}`);
  } catch (err) { oshibok++; console.log(`${den}: ${kod} — НЕ собрано: ${err.message}`); }
}
console.log(`Генератор собрал ${gotovo} из ${vsego} игр без ручной правки${oshibok ? ` (не собрано ${oshibok})` : ''}`);
process.exitCode = oshibok ? 1 : 0;
