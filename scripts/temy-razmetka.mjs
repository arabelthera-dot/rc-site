// Машинная разметка тем готовых дней (Р289 п.2): node scripts/temy-razmetka.mjs → src/data/temy-dni.json.
// Уже размеченные дни не трогает (правка глазом в temy-dni.json сохраняется); --zanovo — переразметить все.
// Печатает новые и изменённые дни с очками — список для проверки глазом.
import fs from 'node:fs';
import { gotovyeDni } from '../src/lib/etot-den.mjs';
import { razmetit } from '../src/lib/temy.mjs';

const F = 'src/data/temy-dni.json';
const zanovo = process.argv.includes('--zanovo');
const bylo = !zanovo && fs.existsSync(F) ? JSON.parse(fs.readFileSync(F, 'utf8')).dni : {};
const dni = {};
for (const [key, arr] of [...gotovyeDni()].sort(([a], [b]) => a.localeCompare(b))) for (const d of arr) {
  const k = `${d.museum}/${key}`;
  if (bylo[k]) { dni[k] = bylo[k]; continue; }
  const och = razmetit(d.museum, key);
  dni[k] = och.map(([id]) => id);
  console.log(`${k}\t${d.title}\t${och.map(([id, o]) => `${id}:${o}`).join(' ') || '—'}`);
}
fs.writeFileSync(F, `${JSON.stringify({ _opisanie: 'Темы готовых дней (Р289 п.2): «музей/ММ-ДД» → id тем из src/data/temy.json. Машиной — scripts/temy-razmetka.mjs; правка глазом — здесь. Пустой список — у дня нет общей темы.', dni }, null, 1)}\n`);
