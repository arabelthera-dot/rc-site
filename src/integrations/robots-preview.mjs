// п.500 (Р745, 10.11.2026): <meta name="robots" content="max-image-preview:large"> на каждой открытой странице сборки —
// иначе Google Discover и картинки поиска за рубежом показывают кадр мелкой миниатюрой (developers.google.com/search/docs/appearance/google-discover).
// Ставится после всех правок HTML: страницы с noindex, переадресации и файлы подтверждения прав не трогаются;
// у страницы со своим robots без max-image-preview — дописывается в тот же тег. Вид страницы не меняет. Откат — убрать из astro.config.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TEG = '<meta name="robots" content="max-image-preview:large">';

function* stranicy(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* stranicy(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

export function sRobots(html) {
  if (/http-equiv=["']?refresh/i.test(html)) return html;
  const est = /<meta\b[^>]*\bname=["']?robots["']?[^>]*>/i.exec(html);
  if (est) {
    if (/noindex|max-image-preview/i.test(est[0])) return html;
    return html.replace(est[0], est[0].replace(/content=(["'])([^"']*)\1/i, (_, q, c) => `content=${q}${c ? c + ', ' : ''}max-image-preview:large${q}`));
  }
  return /<head\b[^>]*>/i.test(html) ? html.replace(/<head\b[^>]*>/i, (h) => h + TEG) : html;
}

export default function robotsPreview() {
  return {
    name: 'rc-robots-preview',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        let n = 0;
        for (const f of stranicy(root)) {
          if (/^(?:yandex_[0-9a-f]+|google[0-9a-f]+)\.html$/.test(path.basename(f))) continue;
          const html = fs.readFileSync(f, 'utf8');
          const novyy = sRobots(html);
          if (novyy !== html) { fs.writeFileSync(f, novyy); n++; }
        }
        logger.info(`max-image-preview:large дописан на ${n} страниц`);
      },
    },
  };
}
