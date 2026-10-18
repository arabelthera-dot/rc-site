// Отчёт о скорости и доступности (18.10.2026): Lighthouse CI + axe-core. ТОЛЬКО ОТЧЁТ —
// заявку роняют лишь сборка и битые ссылки (решение Сергея 17.10), поэтому код выхода всегда 0.
// Lighthouse гоняет `lhci autorun` по lighthouserc.json (итоги в /tmp/lhci/manifest.json);
// этот скрипт сводит их в таблицу и прогоняет axe по тем же страницам.
// Запуск: node scripts/otchet-skorost.mjs [--dist dist] [--lhci /tmp/lhci]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const argv = process.argv.slice(2), opt = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
const DIST = path.resolve(opt.dist || 'dist'), LHCI = opt.lhci || '/tmp/lhci', BASE = '/rc-site/';
const rc = JSON.parse(fs.readFileSync('lighthouserc.json', 'utf8'));
const PUTI = rc.ci.collect.url.map((u) => new URL(u).pathname);
const out = [];
const p = (s = '') => out.push(s);

p('## Скорость и доступность (только отчёт, заявку не роняет)');
p();
// 1. Lighthouse
try {
  const man = JSON.parse(fs.readFileSync(path.join(LHCI, 'manifest.json'), 'utf8'));
  const pc = (v) => (v == null ? '—' : Math.round(v * 100));
  p('### Lighthouse (мобильный профиль)');
  p();
  p('| Страница | Скорость | Доступность | Практики | SEO |');
  p('|---|---:|---:|---:|---:|');
  for (const r of man) {
    const s = r.summary || {};
    p(`| ${new URL(r.url).pathname} | ${pc(s.performance)} | ${pc(s.accessibility)} | ${pc(s['best-practices'])} | ${pc(s.seo)} |`);
  }
} catch (e) {
  p(`Lighthouse: итогов нет (${e.message.split('\n')[0]}).`);
}
p();

// 2. axe-core через Playwright по той же локальной сборке
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (!u.startsWith(BASE)) { res.writeHead(404); return res.end(); }
  let f = path.join(DIST, u.slice(BASE.length));
  if (!f.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch {}
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
});
try {
  const pw = await import(process.env.PW || 'playwright'); const chromium = pw.chromium || pw.default.chromium;
  const axeMod = await import(process.env.AXE || '@axe-core/playwright'); const AxeBuilder = axeMod.default?.default || axeMod.default || axeMod.AxeBuilder;
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const site = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  p('### axe-core (WCAG 2.1 AA): нарушения по серьёзности');
  p();
  p('| Страница | critical | serious | moderate | minor | правила |');
  p('|---|---:|---:|---:|---:|---|');
  for (const put of PUTI) {
    try {
      await page.goto(site + put, { waitUntil: 'load', timeout: 30000 });
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const n = { critical: 0, serious: 0, moderate: 0, minor: 0 };
      for (const v of r.violations) n[v.impact] = (n[v.impact] || 0) + v.nodes.length;
      const pravila = r.violations.map((v) => `${v.id}×${v.nodes.length}`).join(', ') || '—';
      p(`| ${put} | ${n.critical} | ${n.serious} | ${n.moderate} | ${n.minor} | ${pravila} |`);
    } catch (e) {
      p(`| ${put} | — | — | — | — | ошибка: ${e.message.split('\n')[0]} |`);
    }
  }
  await browser.close();
} catch (e) {
  p(`axe: не запустился (${e.message.split('\n')[0]}).`);
} finally {
  server.close();
}

const text = out.join('\n') + '\n';
console.log(text);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
