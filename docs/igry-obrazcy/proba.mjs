// Проба Р635: игра данными (docs/igry-obrazcy/<mehanika>.json) против ручного январского оригинала.
// Проверяет JSON схемой поля igra (src/lib/igry-mehaniki.ts) и собирает по две страницы на игру: оригинал (html + js как на сайте)
// и рамка + движок механики. Случайность одна и та же (Math.random с семенем), чтобы кадры совпадали.
// Запуск: node --experimental-strip-types docs/igry-obrazcy/proba.mjs <папка> — страницы ложатся туда, сайт не трогается.
import fs from 'node:fs';
import path from 'node:path';
import { igraDannymi, MEHANIKI } from '../../src/lib/igry-mehaniki.ts';
import { ramkaHtml, skriptyRamki, RAMKA_CSS } from '../../src/lib/igra-ramka.mjs';

const KOREN = path.resolve(import.meta.dirname, '../..');
const ASSETS = 'file://' + path.join(KOREN, 'public/assets/');
const out = process.argv[2];
if (!out) { console.error('укажи папку для страниц'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });

// Оригиналы — январские игры «Изобретений», которые не переделываются: только читаем.
const PROBA = {
  'razbey-ldiny-po-prochnosti': { igra: 'probey-led', css: 'igra-probey-led' },
  'tri-usloviya-ldoloma': { igra: 'nos-paylota', css: 'igra-nos-paylota' },
};
const SEMYA = `<script>(function(){var s=20261108;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();function award(id,n){(window.__ochki=window.__ochki||[]).push([id,n]);}</script>`;
const stranica = (css, telo) => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${['fonts', 'izobreteniya-den', 'igra-pravila', ...css].map((c) => `<link rel="stylesheet" href="${ASSETS}${c}.css">`).join('\n')}
${SEMYA}</head><body>
${telo}
</body></html>`;

let oshibki = 0;
for (const [mehanika, p] of Object.entries(PROBA)) {
  const r = igraDannymi.safeParse(JSON.parse(fs.readFileSync(path.join(import.meta.dirname, `${mehanika}.json`), 'utf8')));
  if (!r.success) { oshibki++; console.error(mehanika, r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')); continue; }
  for (const s of skriptyRamki(r.data)) if (!fs.existsSync(path.join(KOREN, 'public/assets', s))) { oshibki++; console.error(`нет движка public/assets/${s}`); }
  if (!MEHANIKI[mehanika].dvizhok) { oshibki++; console.error(`${mehanika}: в списке нет dvizhok: true`); }
  const original = fs.readFileSync(path.join(KOREN, `src/data/igry/izobreteniya/${p.igra}.html`), 'utf8');
  fs.writeFileSync(path.join(out, `${p.igra}-original.html`), stranica([p.css],
    `${original}\n<script src="file://${path.join(KOREN, `public/muzei/izobreteniya/igry/${p.igra}.js`)}"></script>`));
  fs.writeFileSync(path.join(out, `${p.igra}-ramka.html`), stranica([p.css, RAMKA_CSS],
    `${ramkaHtml(r.data)}\n${skriptyRamki(r.data).map((s) => `<script src="${ASSETS}${s}"></script>`).join('\n')}`));
  console.log(`${mehanika}: схема ок → ${p.igra}-original.html, ${p.igra}-ramka.html`);
}
process.exit(oshibki ? 1 : 0);
