// Е8 (Р47): проверка поста в каналы перед отправкой — те же функции, что у сборки (src/lib/proverka-posta.mjs).
// Зовёт scripts/kanaly/post.py: JSON поста на вход (stdin), строки брака и предупреждений — в вывод.
//   node scripts/kanaly/proverka.mjs [--bez-seti] < post.json      код 0 — пост чистый, 1 — брак, 2 — сбой проверки
// --bez-seti — ссылки не открываются (сухой прогон без сети); перед отправкой не используется.
import fs from 'node:fs';
import { proverkaPosta } from '../../src/lib/proverka-posta.mjs';

const site = (() => {
  const cfg = fs.readFileSync('astro.config.mjs', 'utf8');
  const s = /^\s*site:\s*'([^']+)'/m.exec(cfg)[1].replace(/\/$/, '');
  const b = (/^\s*base:\s*'([^']*)'/m.exec(cfg)?.[1] || '').replace(/^\/|\/$/g, '');
  return b ? `${s}/${b}/` : `${s}/`;
})();

try {
  const post = JSON.parse(fs.readFileSync(0, 'utf8'));
  const bezSeti = process.argv.includes('--bez-seti');
  const r = await proverkaPosta(post, { site, ...(bezSeti && { proverkaAdresa: async () => 200 }) });
  for (const s of r.preduprezhdeniya) console.log(`предупреждение: ${s}`);
  for (const s of r.brak) console.log(`брак: ${s}`);
  console.log(r.brak.length ? `проверка поста: брак ${r.brak.length}` : `проверка поста: чисто${bezSeti ? ' (ссылки не открывались — --bez-seti)' : ', ссылки открываются (200)'}`);
  process.exit(r.brak.length ? 1 : 0);
} catch (e) {
  console.log(`брак: проверка поста не выполнена — ${e.message}`);
  process.exit(2);
}
