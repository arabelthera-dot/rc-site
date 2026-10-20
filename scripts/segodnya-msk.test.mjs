// Самотест сторожа segodnya-msk (20.10.2026): сторож обязан пропускать верный блок и ловить неверный.
// Верный — боевые home/Today.astro и portal/Segodnya.astro (ждём код 0). Неверный — копия блока, где
// «сегодня» берётся по местному поясу браузера (убран timeZone: 'Europe/Moscow'), — ждём брак.
// Причина теста: заглушка DOM сторожа устарела после Г20 и давала ложный брак 12 из 12, никто не заметил.
// Запуск: node scripts/segodnya-msk.test.mjs   Код 1 — сторож врёт.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const STOROZH = path.join(HERE, 'segodnya-msk.mjs');
const TODAY = path.join(ROOT, 'src/components/home/Today.astro');
const PORTAL = path.join(ROOT, 'src/components/portal/Segodnya.astro');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'segodnya-test-'));
const mestnaya = (src, name) => {
  const s = fs.readFileSync(src, 'utf8');
  const bad = s.replace(/timeZone:\s*'Europe\/Moscow',\s*/g, '');
  if (bad === s) throw new Error(`в ${src} нет timeZone: 'Europe/Moscow' — самотест устарел`);
  const p = path.join(tmp, name); fs.writeFileSync(p, bad); return p;
};
const run = (env) => spawnSync(process.execPath, [STOROZH], { env: { ...process.env, SEGODNYA_BEZ_ZAPRETA: '1', ...env }, encoding: 'utf8' });
const brak = (r) => +(r.stdout.match(/брак (\d+)/)?.[1] || 0);

const cases = [
  ['верная дата (боевые блоки)', {}, 0],
  ['Today по местному поясу', { SEGODNYA_TODAY: mestnaya(TODAY, 'Today.astro') }, 1],
  ['Segodnya по местному поясу', { SEGODNYA_PORTAL: mestnaya(PORTAL, 'Segodnya.astro') }, 1],
];
let fail = 0;
for (const [name, env, wantCode] of cases) {
  const r = run(env);
  const ok = r.status === wantCode && (wantCode === 0 ? brak(r) === 0 : brak(r) > 0);
  if (!ok) fail++;
  console.log(`${ok ? 'ок  ' : 'ВРЁТ'} ${name}: код ${r.status}, брак ${brak(r)} (ждём ${wantCode ? 'брак' : '0'})`);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(fail ? `segodnya-msk.test: сторож врёт в ${fail} случаях` : 'segodnya-msk.test: сторож честный');
process.exit(fail ? 1 : 0);
