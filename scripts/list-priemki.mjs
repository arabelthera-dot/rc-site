// Лист приёмки (r610, поправка 3 r605, Р444): верх страницы на телефоне 390×844 по всем дням, изменённым в заявке, —
// одной картинкой list.png (5 в ряд, подпись — музей и дата). Браузер и сервер — как в scripts/glazami.mjs.
// Запуск (после npm run build):
//   node scripts/list-priemki.mjs [--dist dist] [--out /tmp/list-priemki] [--dni izobreteniya/01-01,izobreteniya/01-02]
//     без --dni — дни из git diff origin/main...HEAD: карточки src/content/dni-shablon/<музей>/ММ-ДД.yaml
//     и полные страницы src/data/full-pages/<музей>/ММ-ДД.html. Дней нет — листа нет, код 0.
//   node scripts/list-priemki.mjs shablon — код 1, если заявка правит шаблон дня или общие стили (тогда сверка образцов).
//   node scripts/list-priemki.mjs obnovit <номер прогона> — образцовые снимки из артефакта obrazcy-novye этого прогона
//     в tests/obrazcy/snimki (явная команда обновления образца; коммит — в той же заявке).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { serveDist } from './dist-server.mjs';

export const W = 390, H = 844;
// Шаблон дня и общие стили: правка любого — сверка образцовых дней (tests/obrazcy).
export const SHABLON = [/^src\/layouts\//, /^src\/components\//, /^src\/styles\//, /^src\/integrations\//, /^src\/lib\/dni-shablon\.mjs$/,
  /^src\/pages\/muzei\/\[slug\]\/den/, /^public\/assets\/[^/]+\.css$/, /^public\/assets\/fonts\//, /^astro\.config\.mjs$/, /^tests\/obrazcy\//];

const izmeneno = () => execFileSync('git', ['diff', '--name-only', 'origin/main...HEAD'], { encoding: 'utf8' }).split('\n').filter(Boolean);
export const izmenennyeDni = (faily = izmeneno()) => [...new Set(faily.map((f) =>
  f.match(/^src\/content\/dni-shablon\/([^/]+)\/(\d\d-\d\d)\.yaml$/) || f.match(/^src\/data\/full-pages\/([^/]+)\/(\d\d-\d\d)\.html$/))
  .filter(Boolean).map((m) => `${m[1]}/${m[2]}`))].sort();

// Открыть день как посетитель телефона: чужие адреса (метрика, шрифты извне) отрезаны, часы стоят — снимок не плывёт.
export async function otkrytDen(browser, site, den, dpr = 1) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dpr, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const svoy = new URL(site).host;
  await page.route('**/*', (r) => (new URL(r.request().url()).host === svoy ? r.continue() : r.abort()));
  await page.clock.setFixedTime(new Date('2026-01-13T09:00:00+03:00'));
  const [muzei, key] = den.split('/');
  const otvet = await page.goto(`${site.replace(/\/?$/, '/')}muzei/${muzei}/den/${key}/`, { waitUntil: 'load', timeout: 45000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  return { page, ctx, status: otvet?.status() ?? 0 };
}

async function list(opt) {
  const dni = opt.dni ? opt.dni.split(',').filter(Boolean) : izmenennyeDni();
  const OUT = opt.out || '/tmp/list-priemki';
  fs.mkdirSync(OUT, { recursive: true });
  if (!dni.length) { console.log('Лист приёмки: в заявке нет изменённых дней — листа нет.'); return 0; }
  const pw = await import(process.env.PW || 'playwright'); const chromium = pw.chromium || pw.default.chromium;
  const server = await serveDist(opt.dist || 'dist');
  const browser = await chromium.launch();
  const snimki = [];
  for (const den of dni) {
    const { page, ctx, status } = await otkrytDen(browser, server.url, den);
    const png = await page.screenshot();
    fs.writeFileSync(path.join(OUT, den.replace('/', '-') + '.png'), png);
    snimki.push({ den, status, b64: png.toString('base64') });
    await ctx.close();
    process.stdout.write(status === 200 ? '.' : 'x');
  }
  const MES = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const podpis = (d) => { const [m, k] = d.split('/'); return `${m} · ${+k.slice(3)} ${MES[+k.slice(0, 2) - 1]}`; };
  const kolonok = Math.min(5, snimki.length);
  const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#222;font:600 18px/1.3 sans-serif;color:#fff}
.g{display:grid;grid-template-columns:repeat(${kolonok},${W}px);gap:16px}figure{margin:0}img{display:block;width:${W}px;height:${H}px;outline:1px solid #555}
figcaption{padding:6px 0}.x{color:#ff6b6b}</style><div class="g">${snimki.map((s) => `<figure><figcaption${s.status === 200 ? '' : ' class="x"'}>${podpis(s.den)}${s.status === 200 ? '' : ` — ответ ${s.status}`}</figcaption><img src="data:image/png;base64,${s.b64}"></figure>`).join('')}</div>`;
  const ctx = await browser.newContext({ viewport: { width: kolonok * (W + 16) + 16, height: 600 } });
  const page = await ctx.newPage();
  await page.setContent(html);
  await page.screenshot({ path: path.join(OUT, 'list.png'), fullPage: true });
  await browser.close();
  server.close();
  const plohie = snimki.filter((s) => s.status !== 200);
  const itog = `Лист приёмки: ${snimki.length - plohie.length} из ${snimki.length} дней сняты${plohie.length ? '; не открылись: ' + plohie.map((s) => s.den).join(', ') : ''}.`;
  fs.writeFileSync(path.join(OUT, 'itog.txt'), itog + '\n' + dni.join('\n') + '\n');
  console.log('\n' + itog + `\n${OUT}/list.png`);
  return plohie.length ? 1 : 0;
}

if (process.argv[1]?.endsWith('list-priemki.mjs')) {
  const argv = process.argv.slice(2), opt = {}, pos = [];
  for (let i = 0; i < argv.length; i++) argv[i].startsWith('--') ? (opt[argv[i].slice(2)] = argv[++i]) : pos.push(argv[i]);
  if (pos[0] === 'shablon') {
    const f = izmeneno().filter((x) => SHABLON.some((r) => r.test(x)));
    console.log(f.length ? `Шаблон или общие стили правятся (${f.length}): ${f.join(', ')}` : 'Шаблон и общие стили не тронуты.');
    process.exit(f.length ? 1 : 0);
  } else if (pos[0] === 'obnovit') {
    if (!pos[1]) { console.error('нужен номер прогона: node scripts/list-priemki.mjs obnovit <run-id>'); process.exit(2); }
    execFileSync('gh', ['run', 'download', pos[1], '-n', 'obrazcy-novye', '-D', 'tests/obrazcy/snimki'], { stdio: 'inherit' });
    console.log('Образцы обновлены в tests/obrazcy/snimki — проверьте глазами и закоммитьте в этой же заявке.');
  } else process.exit(await list(opt));
}
