// Файлы шрифтов для <link rel="preload"> — из public/assets/fonts.css, руками не перечисляются (CLS, #2004).
// Берётся только кириллица + латиница обычного начертания: этим набран первый экран дня; vietnamese,
// latin-ext и курсив браузер докачает сам. Нужный вес не задан — все веса (у переменных шрифтов файл один).
import fs from 'node:fs';

const FACE = /\/\* (cyrillic|latin) \*\/\s*@font-face \{([^}]*)\}/g;
let faces;
function allFaces() {
  if (faces) return faces;
  faces = [...fs.readFileSync('public/assets/fonts.css', 'utf8').matchAll(FACE)].map((m) => ({
    family: /font-family: '([^']+)'/.exec(m[2])?.[1],
    style: /font-style: (\w+)/.exec(m[2])?.[1],
    weight: /font-weight: (\d+)/.exec(m[2])?.[1],
    file: /url\(fonts\/([^)]+)\)/.exec(m[2])?.[1],
  })).filter((f) => f.family && f.file && f.style === 'normal');
  return faces;
}

export function fontFiles(families, weights) {
  const want = new Set(families);
  return [...new Set(allFaces().filter((f) => want.has(f.family) && (!weights || weights.includes(f.weight))).map((f) => f.file))];
}

// Семейства, которыми набрана старая страница дня: первое имя в font-family: и в переменных --font-*:
// своего <style>; в fonts.css нет — не наше (Georgia, системные), пропускается.
export function pageFamilies(html) {
  const known = new Set(allFaces().map((f) => f.family));
  const used = [...html.matchAll(/(?:font-family|--font-[\w-]+)\s*:\s*['"]?([A-Za-z][A-Za-z ]*?)['"]?\s*[,;}]/g)].map((m) => m[1].trim());
  return [...new Set(used)].filter((f) => known.has(f));
}

export const preloadTag = (base, file) => `<link rel="preload" href="${base}assets/fonts/${file}" as="font" type="font/woff2" crossorigin>`;

// Шрифты полной страницы дня (замер 18.10: assets/fonts.css — 48 КБ, 113 @font-face, блокирует отрисовку,
// потеря 600–750 мс FCP у дней): вместо ссылки на весь файл — инлайн в <head> только семейств, названных в самой
// странице (имя где угодно в разметке/стилях или в адресе Google Fonts через «+»). Все начертания и подмножества
// семейства сохраняются (unicode-range: лишнее браузер не качает), font-display — как в fonts.css.
const BLOCK = /(?:\/\* [\w-]+ \*\/\s*)?@font-face \{[^}]*\}/g;
let blocks;
export function usedFamilies(html) {
  const text = html.replace(/\+/g, ' ');
  const known = [...new Set(allFaces().map((f) => f.family))];
  return known.filter((f) => text.includes(f));
}
export function faceCss(families, base) {
  blocks ??= fs.readFileSync('public/assets/fonts.css', 'utf8').match(BLOCK) ?? [];
  const want = new Set(families);
  return blocks.filter((b) => want.has(/font-family: '([^']+)'/.exec(b)?.[1]))
    .map((b) => b.replace(/url\(fonts\//g, `url(${base}assets/fonts/`).replace(/\s+/g, ' ')).join('\n');
}
