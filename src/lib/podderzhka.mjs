// Переключатель блока «Поддержать проект». Р31 (20.10.2026) убирал блоки до приёма денег; Р88 (21.10.2026)
// вернул их на все страницы и музеи — блок стоит на утверждённых местах постоянно. Один флаг на весь сайт:
// Р88 (21.10.2026): по умолчанию блоки включены; PUBLIC_PODDERZHKA=0 — вырезаются.
// Шаблоны Astro не выводят движок museum-support.js; полные страницы (src/data/full-pages, ручная вёрстка)
// чистит src/integrations/podderzhka.mjs функцией vyrezatPodderzhku на этапе сборки — исходники не правятся.
export const podderzhkaVkl = (env = process.env) => env.PUBLIC_PODDERZHKA !== '0';

// Элемент целиком по открывающему тегу: от `start` до парного закрывающего (вложенные одноимённые — в счёт).
function konecElementa(html, start, tag) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return re.lastIndex;
  }
  return -1;
}

function vyrezatElementy(html, open) {
  let n = 0, m;
  const re = new RegExp(open.source, 'gi');
  while ((m = re.exec(html))) {
    const end = konecElementa(html, m.index, m[1]);
    if (end < 0) break;
    html = html.slice(0, m.index) + html.slice(end);
    re.lastIndex = m.index;
    n++;
  }
  return [html, n];
}

const CLASS_SUPPORT = /<(div|section|aside)\b[^>]*\bclass="(?:[^"]*\s)?support(?:\s[^"]*)?"[^>]*>/;
const ID_PEAK = /<(div|section|aside)\b[^>]*\bid="support-peak"[^>]*>/;
const ID_HEART = /<(div|button|a)\b[^>]*\bid="heart"[^>]*>/;

// Возвращает { html, blokov } — сколько блоков/кнопок вырезано.
export function vyrezatPodderzhku(html) {
  let blokov = 0, n;
  for (const re of [CLASS_SUPPORT, ID_PEAK, ID_HEART]) { [html, n] = vyrezatElementy(html, re); blokov += n; }
  html = html
    // слоты движка: пустые — долой, с содержимым — без пометки
    .replace(/<(div|section)\b[^>]*\bdata-support-slot\b[^>]*>\s*<\/\1>\s*/gi, () => { blokov++; return ''; })
    .replace(/\s+data-support-slot\b(?:="[^"]*")?/gi, '')
    // движок и его настройка
    .replace(/<script\b[^>]*\bsrc="[^"]*museum-support\.js[^"]*"[^>]*>\s*<\/script>\s*/gi, '')
    .replace(/<script\b[^>]*>\s*window\.MUSEUM_SUPPORT\s*=[\s\S]*?<\/script>\s*/gi, '')
    // скрипт сердечка ручной вёрстки (без #heart падал бы на h.addEventListener)
    .replace(/<script\b[^>]*>(?:(?!<\/script>)[\s\S])*?getElementById\(['"]heart['"]\)[\s\S]*?<\/script>\s*/gi, '')
    // ссылки и кнопки «Поддержать…»
    .replace(/<(a|button)\b[^>]*>((?:(?!<\/\1>)[\s\S])*)<\/\1>/gi, (m, t, inner) => (/Поддержать/.test(inner) ? (blokov++, '') : m));
  return { html, blokov };
}
