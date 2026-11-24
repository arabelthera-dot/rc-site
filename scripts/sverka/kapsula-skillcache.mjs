// Капсула SkillCache (Р833, Сергей 20.11.2026) — кэш технического контекста помощника сверки.
// Помощник сверки каждый проход перечитывает один и тот же контекст: скилл музея (SKILL.md+recepty.md),
// чеклист известного брака сборки (knowledge/brak-stranic.md) и пакет правил/наряд (paket.md+zadanie.md),
// где чеклист брака продублирован почти целиком. Капсула собирает источники ОДИН раз, дедуплицирует и
// сжимает их в один файл-кэш; дальше помощник читает капсулу, а не источники заново. Модель не тратит
// ни хода: сборка детерминированная (node). Замер — сырой контекст против капсулы (байты, ~токены).
//
// Запуск: node scripts/sverka/kapsula-skillcache.mjs <музей> [ММ-ДД …] [--kontekst <файл> …]
//   музей — slug из src/data/museums.json; дни — только подпись пробы, на сборку не влияют.
//   Сами (без флагов) берутся: ~/.claude/skills/museum-<музей>/{SKILL.md,recepty.md},
//   ~/workspace/knowledge/brak-stranic.md. Флагом --kontekst добавляют наряд/пакет (paket.md, zadanie.md).
//   Выход: капсула пишется в ~/workspace/knowledge/kapsuly/<музей>.md; сводка и замер — на stderr.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DOM = os.homedir();
// Слаг музея (src/data/museums.json) ≠ папка скилла (museum-*): привязка известных пар, остальное — museum-<slug>.
const SLUG_SKILL = {
  izobreteniya: 'museum-inventions', 'ne-sdayutsya': 'museum-nesdayutsya', iskusstvo: 'museum-art',
  arhitektura: 'museum-architecture', pervoprohodcy: 'museum-pervoprohodcy', literatura: 'museum-literatura',
  karikatura: 'museum-karikatura', sport: 'museum-sport', skazki: 'museum-skazki',
  'skazki-narodov': 'museum-skazki-narodov', 'narodnyy-kostyum': 'museum-narodnyy-kostyum',
  'kostyum-narodov': 'museum-kostyum-narodov',
};
const skillDir = (m) => `${DOM}/.claude/skills/${SLUG_SKILL[m] ?? `museum-${m}`}`;
const BRAK = `${DOM}/workspace/knowledge/brak-stranic.md`;
const OUTDIR = `${DOM}/workspace/knowledge/kapsuly`;

// Разбор аргументов: дни ММ-ДД и флаг --kontekst с последующими путями.
const argv = process.argv.slice(2);
const kontekst = [];
const dni = [];
let muzey = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--kontekst') { while (argv[i + 1] && !argv[i + 1].startsWith('-')) kontekst.push(argv[++i]); }
  else if (a.startsWith('-')) { console.error(`капсула-кэш: неизвестный флаг ${a}`); process.exit(2); }
  else if (!muzey) muzey = a;
  else dni.push(a);
}
if (!muzey) {
  console.error('капсула-кэш: музей не указан. Запуск: node scripts/sverka/kapsula-skillcache.mjs <музей> [ММ-ДД …] [--kontekst <файл> …]');
  process.exit(2);
}

// Источники контекста (порядок = порядок в капсуле). Пропущенные файлы помечаются, не роняют сборку.
const istochniki = [];
for (const f of [path.join(skillDir(muzey), 'SKILL.md'), path.join(skillDir(muzey), 'recepty.md'), BRAK, ...kontekst]) {
  istochniki.push({ put: f, tekst: fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null });
}
const est = istochniki.filter((s) => s.tekst !== null);

// Сборка капсулы: строки чистятся, пустые уходят, дубли (точное совпадение) — только первый раз.
const seen = new Set();
const vidano = [];
const dubli = [];
for (const s of est) {
  for (const syr of s.tekst.split(/\r?\n/)) {
    const l = syr.trim();
    if (!l) continue;
    if (seen.has(l)) { dubli.push(l); continue; }
    seen.add(l);
    vidano.push(l);
  }
}

const sh = `# Капсула контекста сверщика — ${muzey}\n` +
  `<!-- сгенерировано scripts/sverka/kapsula-skillcache.mjs (Р833); не править руками, правь источники -->\n` +
  `Источники:\n${est.map((s) => `- ${s.put}`).join('\n')}\n\n`;
fs.mkdirSync(OUTDIR, { recursive: true });
const vihod = path.join(OUTDIR, `${muzey}.md`);
fs.writeFileSync(vihod, sh + vidano.join('\n') + '\n');

// Замер: байты/символы/токены сырого контекста против капсулы. Токены — оценка (русский ≈ 3,5 симв/токен).
const SYMV_TOK = 3.5;
const tok = (s) => Math.round([...s].length / SYMV_TOK);
const syroj = est.map((s) => s.tekst).join('\n');
const kapsula = fs.readFileSync(vihod, 'utf8');
const bytes = (s) => Buffer.byteLength(s, 'utf8');

console.error(`капсула-кэш: ${muzey}${dni.length ? ' — проба ' + dni.join(', ') : ''}`);
console.error('источник                           байт   символов   ~токенов');
for (const s of est) console.error(`${path.basename(s.put).padEnd(34)} ${String(bytes(s.tekst)).padStart(6)}  ${String([...s.tekst].length).padStart(9)}  ${String(tok(s.tekst)).padStart(8)}`);
console.error(`${'ИТОГО сырой контекст'.padEnd(34)} ${String(bytes(syroj)).padStart(6)}  ${String([...syroj].length).padStart(9)}  ${String(tok(syroj)).padStart(8)}`);
console.error(`${'капсула (кэш)'.padEnd(34)} ${String(bytes(kapsula)).padStart(6)}  ${String([...kapsula].length).padStart(9)}  ${String(tok(kapsula)).padStart(8)}`);
console.error(`экономия: ${bytes(syroj) - bytes(kapsula)} байт (${Math.round(100 * (1 - bytes(kapsula) / bytes(syroj)))}%), ~${tok(syroj) - tok(kapsula)} токенов на проход; дублей-строк снято ${dubli.length}.`);
console.error(`капсула записана: ${vihod}`);
