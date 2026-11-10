// Текст уже стоящих роликов дня (r725 п.138): public/muzei/<музей>/video/day-<imya>.txt — сценарий озвучки дословно,
// сцена на строку (show, иначе say, без знаков ударения), как voice.txt из rc-rolik scripts/tts.py для новых роликов.
// Пять вопросов до изменения (Сергей, 28.09.2026):
// Что задевает — только файлы day-<imya>.txt рядом с mp4 из реестра; страницу дня показывает src/lib/rolik-ryadom.mjs.
// Что нужно — сценарии rc-rolik main days/<id>.json (gh api) и история mp4 в git сайта.
// Что будет без нужного — нет .txt, нет блока «Текст ролика»; страница как раньше.
// Проверка до слияния — сценарий правили после того, как ролик пришёл на сайт, — день пропускается: текст не разойдётся с роликом.
// Откат — удалить .txt. Запуск: node scripts/rolik-tekst.mjs [izobreteniya|nesdayutsya] [jan] — пишет файлы, печатает итог.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROLIK = 'arabelthera-dot/rc-rolik';
const PUB = path.join(process.cwd(), 'public');
const [reestr = 'izobreteniya', mesyac = 'jan'] = process.argv.slice(2);
const gh = (...a) => execFileSync('gh', a, { encoding: 'utf8' });
const UDAR = /́/g;

const papka = path.join(PUB, 'video/registry', reestr);
const imena = execFileSync('git', ['ls-tree', '--name-only', 'HEAD', `public/video/registry/${reestr}/`], { encoding: 'utf8' })
  .split('\n').filter((f) => f.endsWith('.json')).map((f) => path.basename(f, '.json')).filter((f) => f.slice(2, 5) === mesyac);
for (const imya of imena) {
  const h = JSON.parse(fs.readFileSync(path.join(papka, `${imya}.json`), 'utf8')).horizontal;
  if (!h?.local?.endsWith('.mp4')) { console.log(`${imya}: нет mp4 в реестре — пропуск`); continue; }
  const id = `${reestr === 'nesdayutsya' ? 'ns' : ''}${imya.slice(0, 5)}`;
  let den, pravka;
  try {
    den = JSON.parse(Buffer.from(JSON.parse(gh('api', `repos/${ROLIK}/contents/days/${id}.json`)).content, 'base64').toString('utf8'));
    pravka = JSON.parse(gh('api', `repos/${ROLIK}/commits?path=days/${id}.json&per_page=1`))[0].commit.committer.date;
  } catch { console.log(`${imya}: нет сценария days/${id}.json — пропуск`); continue; }
  const prishel = execFileSync('git', ['log', '-1', '--format=%cI', 'HEAD', '--', `public/${h.local}`], { encoding: 'utf8' }).trim();
  if (!prishel) { console.log(`${imya}: ролика нет в истории сайта — пропуск`); continue; }
  if (new Date(pravka) > new Date(prishel)) { console.log(`${imya}: сценарий правлен ${pravka} после ролика ${prishel} — пропуск`); continue; }
  const stroki = (den.segments || []).map((s) => (s.show || s.say || '').replace(UDAR, '').replace(/[ \s]+/g, ' ').trim()).filter(Boolean);
  if (!stroki.length) { console.log(`${imya}: пустой сценарий — пропуск`); continue; }
  const kuda = path.join(PUB, h.local.replace(/\.mp4$/, '.txt'));
  fs.mkdirSync(path.dirname(kuda), { recursive: true });
  fs.writeFileSync(kuda, stroki.join('\n') + '\n');
  console.log(`${imya}: ${stroki.length} строк → public/${path.relative(PUB, kuda)}`);
}
