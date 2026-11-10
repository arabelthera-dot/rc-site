// Оценка качества машинного перевода (п. 165, Р603, Р627): только подсказка — сообщает подозрительные строки
// файлов src/data/perevod/<музей>-<ММ-ДД>.json и ничего не останавливает (код выхода всегда 0).
// Признаки взяты из пробы п.142 (docs/research/perevod-proba-01-01/): обратный перевод Argos сам искажает имена,
// поэтому сходство с русским не считаем, а проверяем то, что проверяется без переводчика:
//   kirillica — русские буквы в переводе; pusto — пустой перевод; musor — &quot; &amp; <unk>;
//   chisla — число из русской строки потерялось; dlina — длина вне разумных пределов; povtor — слово 4 раза подряд;
//   punkt — латинские «,.» в китайском; imya — имя из словаря не передано (словарь: ru-регулярка, колонки языков).
// Как в мире: QE-проверки Weblate (https://docs.weblate.org/en/latest/user/checks.html) и Okapi CheckMate.
// Запуск: node scripts/ocenka-perevoda.mjs [--slovar путь.tsv] src/data/perevod/izobreteniya-01-01.json …
import fs from 'node:fs';

const args = process.argv.slice(2);
const i = args.indexOf('--slovar');
const slovarPut = i >= 0 ? args.splice(i, 2)[1] : 'tools/perevod-proba/glossary.tsv';
const fayly = args.filter((f) => f.endsWith('.json') && fs.existsSync(f));

export function prochestSlovar(put) {
  if (!put || !fs.existsSync(put)) return [];
  const stroki = fs.readFileSync(put, 'utf8').split('\n').filter((s) => s && !s.startsWith('#'));
  const [shapka, ...ostalnoe] = stroki.map((s) => s.split('\t'));
  return ostalnoe.map((r) => ({ ru: new RegExp(r[0]), ...Object.fromEntries(shapka.slice(1).map((k, j) => [k, r[j + 1]])) }));
}

const KIR = /[а-яё]/i;
const CJK = /^(zh|ja|ko)/;
const chisla = (s) => s.match(/\d+/g) ?? [];

/** Замечания к одной строке перевода: [{ priznak, poyasnenie }]. */
export function zamechaniya(ru, tr, code, slovar = []) {
  const out = [];
  const dobav = (priznak, poyasnenie) => out.push({ priznak, poyasnenie });
  if (!tr?.trim()) return [{ priznak: 'pusto', poyasnenie: 'перевода нет' }];
  if (KIR.test(tr)) dobav('kirillica', tr.match(/[а-яё]+/i)[0]);
  const m = tr.match(/&(quot|amp|lt|gt|#\d+);|<unk>/);
  if (m) dobav('musor', m[0]);
  const est = new Set(chisla(tr));
  const poteryany = chisla(ru).filter((c) => !est.has(c));
  if (poteryany.length) dobav('chisla', poteryany.join(' '));
  const d = tr.length / Math.max(ru.length, 1);
  const [ot, do_] = CJK.test(code) ? [0.12, 1.2] : [0.45, 2.2];
  if (ru.length >= 20 && (d < ot || d > do_)) dobav('dlina', `${d.toFixed(2)} от русского`);
  const p = tr.match(/(\S{2,})(?:\s+\1){3,}/);
  if (p) dobav('povtor', p[1]);
  if (CJK.test(code) && /[一-鿿][,.](?!\d)/.test(tr)) dobav('punkt', 'латинская запятая или точка после иероглифа');
  const kol = code.split('-')[0];
  for (const z of slovar) if (z[kol] && z.ru.test(ru) && !tr.includes(z[kol])) dobav('imya', z[kol]);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const slovar = prochestSlovar(slovarPut);
  let vsego = 0;
  for (const f of fayly) {
    const fayl = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const [code, stroki] of Object.entries(fayl)) {
      if (code === 'ru' || code.startsWith('_')) continue;
      const svod = [];
      for (const [k, tr] of Object.entries(stroki)) {
        if (!(k in fayl.ru)) continue;
        for (const z of zamechaniya(fayl.ru[k], tr, code, slovar)) svod.push(`  ${k}: ${z.priznak} — ${z.poyasnenie}`);
      }
      vsego += svod.length;
      console.log(`${f} ${code}: ${Object.keys(stroki).length} строк, замечаний ${svod.length}`);
      for (const s of svod.slice(0, 15)) console.log(s);
      if (svod.length > 15) console.log(`  … ещё ${svod.length - 15}`);
    }
  }
  console.log(`оценка качества: замечаний ${vsego}${slovar.length ? '' : ' (словаря имён нет — имена не проверены)'}; это подсказка, ничего не остановлено`);
}
