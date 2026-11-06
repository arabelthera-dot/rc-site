// Перебор машины раз в квартал (Р531, аудит 04.11 «Что сделать сразу, чтобы список не рос»): тот же перебор,
// что сделан руками 04.11, — машиной. Ищет два вида брака и пишет отчёт; ничего не удаляет и не правит.
//   1) Файлы без вызова (аудит, раздел 5): скрипт из scripts/, tests/, deploy/, tools/, src/lib, src/integrations,
//      имя которого не встречается ни в одном другом файле кода — ни в .github/workflows, ни в package.json,
//      ни в других скриптах. Документы (.md) и комментарии вызовом не считаются: описанный, но не запускаемый — тоже без вызова.
//   2) Повторы (аудит, п.33–36): одно и то же сделано своими руками в нескольких файлах — московская дата,
//      свой сервер, разбор HTML регулярками. Повтор = образец встречается больше чем в одном файле.
// Итог — Markdown (--out файл, иначе в консоль). Код выхода 0 всегда: это отчёт, не замок; issue открывает perebor.yml.
// Запуск: node scripts/perebor.mjs [--out /tmp/perebor.md]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out');
const SAM = 'scripts/perebor.mjs';

// Что считается кодом и где его искать. public/, данные дней и archive/ — не машина.
const KOD = /\.(?:mjs|cjs|js|ts|astro|py|sh|ya?ml)$/;
const MIMO = /^(?:public|archive|node_modules|src\/data|src\/content|media-vne-sajta|docs)\//;
const KANDIDATY = /^(?:scripts|tests|deploy|tools|src\/lib|src\/integrations)\//;
const ISPOLNYAEMOE = /\.(?:mjs|cjs|js|ts|py|sh)$/;
// kanon — файл, где образцу и место: он в счёт не идёт. Сервер считается только node:http (createServer Vite — другое).
const POVTORY = [
  { obrazec: 'Europe/Moscow', chto: 'московская дата своей функцией', kak: 'одна функция даты в src/lib' },
  { obrazec: 'createServer', chto: 'свой HTTP-сервер', kak: 'scripts/lib/dist.mjs (serveDist)', kanon: 'scripts/lib/dist.mjs',
    est: (t) => t.includes('createServer') && /['"]node:http['"]|require\(['"]http['"]\)/.test(t) },
  { obrazec: 'match(/<', chto: 'разбор HTML регулярным выражением', kak: 'один разборщик (parse5/cheerio) в src/lib' },
];

const vse = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const tekst = new Map();
const chitat = (f) => {
  if (!tekst.has(f)) { try { tekst.set(f, fs.readFileSync(f, 'utf8')); } catch { tekst.set(f, ''); } }
  return tekst.get(f);
};
// Вызов ищется в коде без комментариев: упомянутый в шапке чужого файла, но не запускаемый — тоже без вызова.
const bezKommentariev = new Map();
const kodBez = (f) => {
  if (!bezKommentariev.has(f)) {
    const t = chitat(f);
    bezKommentariev.set(f, /\.(?:py|sh|ya?ml)$/.test(f)
      ? t.replace(/(^|\s)#.*$/gm, '$1')
      : t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1'));
  }
  return bezKommentariev.get(f);
};
const kod = vse.filter((f) => !MIMO.test(f) && (KOD.test(f) || /(?:^|\/)package\.json$|^\.pre-commit-config\.yaml$/.test(f)));

// 1. Без вызова. Кто вызывает файл f:
//    - в чужом коде есть имя файла (node scripts/x.mjs, import './x.mjs', spec_from_file_location(…/x.py))
//      или импорт без расширения (from '../lib/x');
//    - Python: строка import/from с именем модуля (у __init__.py — с именем папки пакета);
//    - папку целиком (не верхнюю scripts/, tests/…) отдают из другого места — путь папки без продолжения «/имя»:
//      npx playwright test -c tests/obrazcy, working-directory: tests/smoke, (ROOT / 'scripts/fondy').glob('*.py').
//    Кого вызывают только файлы без вызова — тоже без вызова: отсев повторяется, пока список не перестанет расти.
const ekr = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const zovet = (g, f) => {
  const t = kodBez(g), imya = path.basename(f), papka = path.dirname(f);
  if (t.includes(imya)) return true;
  if (/\.(?:[cm]?js|ts)$/.test(f) && new RegExp(`/${ekr(imya.replace(/\.\w+$/, ''))}['"]`).test(t)) return true;
  if (f.endsWith('.py') && g.endsWith('.py')) {
    const modul = imya === '__init__.py' ? path.basename(papka) : imya.replace(/\.py$/, '');
    if (new RegExp(`^\\s*(?:from|import)\\s[^\\n]*\\b${modul}\\b`, 'm').test(t)) return true;
  }
  return papka.includes('/') && !g.startsWith(`${papka}/`) && new RegExp(`${ekr(papka)}(?![\\w.-]|/\\w)`).test(t);
};
const kandidaty = kod.filter((f) => KANDIDATY.test(f) && ISPOLNYAEMOE.test(f) && f !== SAM);
const vyzovy = new Map(kandidaty.map((f) => [f, kod.filter((g) => g !== f && zovet(g, f))]));
const bez = new Set();
for (let rost = true; rost;) {
  rost = false;
  for (const [f, kto] of vyzovy) if (!bez.has(f) && kto.every((g) => bez.has(g))) { bez.add(f); rost = true; }
}
const bezVyzova = [...bez].sort().map((f) => ({ f, tolko: vyzovy.get(f) }));

// 2. Повторы: в каких файлах кода встречается образец.
const povtory = POVTORY.map((p) => ({ ...p,
  faily: kod.filter((f) => f !== SAM && f !== p.kanon && (p.est ? p.est(chitat(f)) : chitat(f).includes(p.obrazec))) }));

const data = new Date().toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });
const krasnyh = bezVyzova.length + povtory.filter((p) => p.faily.length > (p.kanon ? 0 : 1)).length;
const s = [];
s.push(`# Перебор машины ${data}`, '');
s.push(`Красных пунктов: **${krasnyh}**. Файлов кода просмотрено: ${kod.length}. Отчёт ничего не удаляет: удаление — только с «да» Сергея.`, '');
s.push(`## 🔴 Файлы без вызова: ${bezVyzova.length}`, '');
s.push('Имя файла не встречается ни в .github/workflows, ни в package.json, ни в другом скрипте. Решение по каждому: включить в проверку, описать как ручной шаг или удалить (с «да»).', '');
for (const { f, tolko } of bezVyzova) s.push(`- 🔴 \`${f}\`${tolko.length ? ` — зовут только файлы без вызова: ${tolko.map((g) => `\`${g}\``).join(', ')}` : ''}`);
if (!bezVyzova.length) s.push('Таких нет.');
s.push('');
s.push('## Повторы', '');
for (const p of povtory) {
  const krasnyy = p.faily.length > (p.kanon ? 0 : 1);
  s.push(`### ${krasnyy ? '🔴' : '🟢'} \`${p.obrazec}\` — ${p.chto}: файлов ${p.faily.length}`, '');
  if (krasnyy) s.push(`Как надо: ${p.kak}.`, '');
  for (const f of p.faily) s.push(`- \`${f}\``);
  s.push('');
}
s.push('Образец перебора — аудит 04.11.2026 (knowledge/audit-mirovoy-opyt-0411.md, раздел 5 и п.33–36).');

const md = s.join('\n') + '\n';
if (OUT) { fs.writeFileSync(OUT, md); console.log(`perebor: красных ${krasnyh} (без вызова ${bezVyzova.length}) → ${OUT}`); }
else process.stdout.write(md);
