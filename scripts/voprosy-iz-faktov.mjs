// Черновик вопросов дня из утверждённых фактов (пункт 75, r713c-voprosy, 10.11.2026). Ручной инструмент:
// не в CI и не в сборке. Читает src/data/utverzhdeno/<музей>/ММ-ДД.json (15 фактов: 10 + 5) и пишет
// файл-предложение data/predlozheniya/voprosy/<музей>/ММ-ДД.json в формате quiz.voprosy карточки
// (q, o — 4 варианта, a — номер верного, e — объяснение) плюс служебные iz (номер факта) и shablon.
// Утверждённое и src/content/dni-shablon не трогает: редактор переносит вопросы в карточку сам.
// Шаблоны вопросов — в src/lib/voprosy-iz-faktov.mjs (тот же код зовёт сборка, r833).
// Запуск: node scripts/voprosy-iz-faktov.mjs <музей> ММ-ДД[,ММ-ДД…] [--sverka] [--suho]
//   --sverka — сравнить черновик с quiz.voprosy карточки дня (тот же ответ / тот же факт, см. sverka);
//   --suho   — только напечатать, файл не писать.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { chernovik as chernovikDnya } from '../src/lib/voprosy-iz-faktov.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [muzei, dniArg, ...flagi] = process.argv.slice(2);
if (!muzei || !dniArg) { console.error('Запуск: node scripts/voprosy-iz-faktov.mjs <музей> ММ-ДД[,ММ-ДД…] [--sverka] [--suho]'); process.exit(1); }
const SVERKA = flagi.includes('--sverka');
const SUHO = flagi.includes('--suho');

// Сверка с quiz.voprosy карточки. «Тот же ответ» — ключ верного ответа черновика (год, число, основа фамилии)
// есть в верном утверждённом ответе. «Тот же факт» — у объяснения черновика и утверждённого вопроса
// (вопрос + верный ответ + объяснение) не меньше трёх общих основ слов (первые 5 букв слов от 6 букв).
function sverka(den, ch) {
  const kart = path.join(ROOT, 'src/content/dni-shablon', muzei, `${den}.yaml`);
  const utv = yaml.load(fs.readFileSync(kart, 'utf8'))?.quiz?.voprosy ?? [];
  const norm = (t) => String(t).toLowerCase().replace(/ё/g, 'е').replace(/(\d)\s(?=\d{3})/g, '$1');
  const osnovy = (t) => new Set((norm(t).match(/[а-я]{6,}/g) ?? []).map((w) => w.slice(0, 5)));
  const sovp = utv.map((u) => {
    const otv = norm(u.o[u.a]); const ou = osnovy(`${u.q} ${u.o[u.a]} ${u.e ?? ''}`);
    const tot = ch.voprosy.find((v) => otv.includes(norm(v.klyuch)));
    const fakt = ch.voprosy.find((v) => [...osnovy(v.e)].filter((x) => ou.has(x)).length >= 3);
    return { utv: u.q, otvet: u.o[u.a], totZheOtvet: tot?.q ?? null, totZheFakt: fakt?.q ?? null };
  });
  return { vsego: utv.length, otvet: sovp.filter((x) => x.totZheOtvet).length, fakt: sovp.filter((x) => x.totZheOtvet || x.totZheFakt).length, sovp };
}

for (const den of dniArg.split(',')) {
  const ch = chernovikDnya(muzei, den, ROOT);
  if (SVERKA) ch.sverka = sverka(den, ch);
  const kuda = path.join(ROOT, 'data/predlozheniya/voprosy', muzei, `${den}.json`);
  if (!SUHO) { fs.mkdirSync(path.dirname(kuda), { recursive: true }); fs.writeFileSync(kuda, JSON.stringify(ch, null, 1) + '\n'); }
  console.log(`${muzei} ${den}: вопросов ${ch.voprosy.length} (${ch.voprosy.map((v) => v.shablon).join(', ')})` +
    (ch.sverka ? `; из ${ch.sverka.vsego} утверждённых: тот же ответ ${ch.sverka.otvet}, тот же факт ${ch.sverka.fakt}` : '') + (SUHO ? '' : ` → ${path.relative(ROOT, kuda)}`));
}
