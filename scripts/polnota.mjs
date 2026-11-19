// Полнота переадресаций (план переезда, шаг 4: «ни одна разосланная ссылка не умирает»; 19.10.2026).
// Опись scripts/legacy-paths.txt — публичные html старого сайта (main rc-museum-preview) без
// служебных папок. Каждый путь описи обязан существовать в сборке: страницей нового сайта или
// переадресацией (src/integrations/legacy-redirects.mjs). Нет — список и код 1.
//   node scripts/polnota.mjs --dist dist          проверка сборки
//   node scripts/polnota.mjs --opis [--legacy D]  пересобрать опись из main старого сайта
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OPIS = 'scripts/legacy-paths.txt';
// Служебные папки старого сайта: пульты, доски, лаборатория, черновики, заявки, тесты — наружу не рассылались.
export const SLUZHEBNYE = ['control/', 'doska/', 'lab/', 'drafts/', 'zayavki/', 'tests/', 'tablo/', 'pult/', 'opis-tools/'];

if (process.argv.includes('--opis')) {
  const legacy = arg('--legacy', process.env.LEGACY || path.join(os.homedir(), 'rc-museum-preview'));
  const ref = arg('--ref', 'main');
  const files = execFileSync('git', ['-C', legacy, 'ls-tree', '-r', '--name-only', ref], { encoding: 'utf8', maxBuffer: 1 << 26 })
    .split('\n').filter((f) => f.endsWith('.html') && !SLUZHEBNYE.some((p) => f.startsWith(p))).sort();
  const sha = execFileSync('git', ['-C', legacy, 'rev-parse', '--short', ref], { encoding: 'utf8' }).trim();
  fs.writeFileSync(OPIS, `# Публичные html старого сайта rc-museum-preview (${ref} ${sha}), без служебных папок:\n`
    + `# ${SLUZHEBNYE.join(' ')}\n# Пересборка: node scripts/polnota.mjs --opis. Проверка: node scripts/polnota.mjs --dist dist\n`
    + files.join('\n') + '\n');
  console.log(`опись: ${files.length} адресов → ${OPIS}`);
  process.exit(0);
}

const dist = arg('--dist', 'dist');
const paths = fs.readFileSync(OPIS, 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
const miss = paths.filter((p) => !fs.existsSync(path.join(dist, p)));
if (miss.length) {
  console.log(`полнота переадресаций: ${miss.length} из ${paths.length} старых адресов нет в сборке:`);
  for (const p of miss) console.log(`  /${p}`);
  process.exit(1);
}
console.log(`полнота переадресаций: все ${paths.length} старых адресов на месте (страница или переадресация)`);
