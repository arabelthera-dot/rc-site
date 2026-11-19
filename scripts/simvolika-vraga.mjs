// Замок символики врага (ст. 20.3 КоАП РФ, Сергей «да» 20.10.2026).
// Кадр из data/simvolika-vraga.json живёт только внутри страницы дня (контекст осуждения):
// не og:image/twitter:image ни у одной страницы, не <img> на главной, витрине и календаре.
// Запуск: node scripts/simvolika-vraga.mjs --dist dist   (код 1 — нарушение)
import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[process.argv.indexOf('--dist') + 1] || 'dist';
const spisok = JSON.parse(fs.readFileSync('data/simvolika-vraga.json', 'utf8')).kadry.map(k => k.fail.toLowerCase());
const est = src => { const f = src.split(/[?#]/)[0].split('/').pop().toLowerCase(); return spisok.includes(f); };
// Страница дня: /muzei/<музей>/<ключ ММ-ДД>/ — там кадр допустим в теле.
const denStranica = rel => /(^|\/)\d{2}-\d{2}(\/index)?\.html$/.test(rel);

const narusheniya = [];
const obhod = dir => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) obhod(p);
    else if (e.name.endsWith('.html')) {
      const rel = path.relative(dist, p);
      const html = fs.readFileSync(p, 'utf8');
      for (const m of html.matchAll(/<meta\b[^>]*(?:og:image|twitter:image)[^>]*content="([^"]+)"/gi))
        if (est(m[1])) narusheniya.push(`${rel}: og/twitter:image = ${m[1]}`);
      if (!denStranica(rel))
        for (const m of html.matchAll(/<img\b[^>]*?\ssrc="([^"]+)"/gi))
          if (est(m[1])) narusheniya.push(`${rel}: превью <img> = ${m[1]}`);
    }
  }
};
if (!fs.existsSync(dist)) { console.error(`simvolika-vraga: нет ${dist}`); process.exit(2); }
obhod(dist);
if (narusheniya.length) {
  console.error(`simvolika-vraga: ${narusheniya.length} нарушений (ст. 20.3 КоАП — кадр из data/simvolika-vraga.json вне страницы дня):`);
  narusheniya.slice(0, 50).forEach(s => console.error('  ' + s));
  process.exit(1);
}
console.log(`simvolika-vraga: 0 нарушений, кадров в списке ${spisok.length}`);
