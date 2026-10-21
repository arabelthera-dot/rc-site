// Проверка №2 (Р84, 21.10.2026): каждая страница дня в dist (muzei/<музей>/den/<день>/index.html, с копиями staraya)
// содержит общий подвал дня (src/lib/podval-dnya.mjs, метка data-rc-podval-dnya) с кнопкой «Сообщите об ошибке»
// (ссылка mailto: внутри подвала). Нет — список страниц и код 1 (красная).
import fs from 'node:fs';
import path from 'node:path';
const dist = process.argv[2] ?? 'dist';
const muzei = path.join(dist, 'muzei');
const bad = [];
let n = 0;
const obhod = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) obhod(p);
    else if (e.name === 'index.html' && /[\\/]den[\\/][^\\/]+[\\/](?:staraya[\\/])?index\.html$/.test(p)) {
      n++;
      const html = fs.readFileSync(p, 'utf8');
      const i = html.indexOf('data-rc-podval-dnya');
      const kusok = i < 0 ? '' : html.slice(i, html.indexOf('</div>', i));
      if (!/<a\b[^>]*href="mailto:[^"]+"[^>]*>[^<]+<\/a>/.test(kusok)) bad.push(path.relative(dist, p));
    }
  }
};
if (fs.existsSync(muzei)) obhod(muzei);
if (!n) { console.error('podval-dnya: в dist нет страниц дней — проверять нечего, это ошибка сборки'); process.exit(1); }
if (bad.length) {
  console.error(`podval-dnya: ${bad.length} из ${n} страниц дня без общего подвала с кнопкой «Сообщите об ошибке»:\n${bad.slice(0, 50).join('\n')}`);
  process.exit(1);
}
console.log(`podval-dnya: ${n} страниц дня — общий подвал с кнопкой «Сообщите об ошибке» есть везде`);
