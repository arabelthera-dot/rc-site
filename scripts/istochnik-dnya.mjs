// Подсказчик «нет источника или прав» (п.77 очереди 1, Р716/Р717): по дню (ММ-ДД, музей) показывает факты
// и картинки карточки src/content/dni-shablon/<музей>/ММ-ДД.yaml, у которых нет источника или нет права.
//   факт (fakty[].udary[]) — нужна ссылка https?:// в href или в src; ссылка на Википедию/Викисклад — тоже находка (Р90);
//   картинка (любой объект с src-кадром: oblozhka, udary[].kadr, figures[] …) — нужны источник (data_source,
//   source, source_url, holder) и право (license, osnovanie, basis), как в scripts/prava.mjs;
//   список sources дня пуст — находка.
// Только сообщает: отчёт по-русски «что и где», код выхода всегда 0, в сборку и CI не подключается, ничего не правит.
// Запуск: node scripts/istochnik-dnya.mjs <ММ-ДД|01> [музей]   («01» — весь январь; музей не указан — оба).
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const MUZEI = ['izobreteniya', 'ne-sdayutsya'];
const SOURCE_KEYS = ['data_source', 'source', 'source_url', 'holder'];
const LICENSE_KEYS = ['license', 'osnovanie', 'basis'];
const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const URL_RE = /https?:\/\/[^\s<>"«»]+/g;
const VIKI_RE = /wikipedia\.org|wikimedia\.org|wikisource\.org|wiki\.ru\b/i;

const est = (o, keys) => keys.some((k) => typeof o[k] === 'string' ? o[k].trim() : o[k] != null && o[k] !== '');
const korotko = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 70);

export function nahodkiDnya(root, muzei, key) {
  const fail = path.join(root, 'src/content/dni-shablon', muzei, `${key}.yaml`);
  if (!fs.existsSync(fail)) return { fail, net: true, nahodki: [], fakty: 0, kadry: 0 };
  const k = YAML.parse(fs.readFileSync(fail, 'utf8'));
  const nahodki = [];
  let fakty = 0, kadry = 0;

  (k.fakty ?? []).forEach((f, i) => (f.udary ?? []).forEach((u, j) => {
    fakty++;
    const gde = `fakty[${i}].udary[${j}] «${korotko(u.summary)}»`;
    const urls = [...`${u.href ?? ''} ${u.src ?? ''}`.matchAll(URL_RE)].map((m) => m[0]);
    if (!urls.length) nahodki.push(`факт без ссылки на источник — ${gde}`);
    else if (urls.every((x) => VIKI_RE.test(x))) nahodki.push(`факт только с Википедии (Р90) — ${gde}`);
  }));

  const obhod = (o, p) => {
    if (Array.isArray(o)) return o.forEach((x, i) => obhod(x, `${p}[${i}]`));
    if (!o || typeof o !== 'object') return;
    if (typeof o.src === 'string' && IMG_RE.test(o.src)) {
      kadry++;
      const gde = `${p.slice(1)} ${o.src}`;
      if (!est(o, SOURCE_KEYS)) nahodki.push(`картинка без источника — ${gde}`);
      else if (SOURCE_KEYS.some((x) => VIKI_RE.test(String(o[x] ?? '')))) nahodki.push(`картинка с Викисклада (Р90) — ${gde}`);
      if (!est(o, LICENSE_KEYS)) nahodki.push(`картинка без права (license) — ${gde}`);
    }
    for (const [x, v] of Object.entries(o)) if (x !== 'head') obhod(v, `${p}.${x}`);
  };
  obhod(k, '');

  if (!Array.isArray(k.sources) || !k.sources.length) nahodki.push('у дня пуст список sources');
  return { fail, nahodki, fakty, kadry };
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const [den, muzeiArg] = process.argv.slice(2);
  if (!den || !/^\d\d(-\d\d)?$/.test(den)) {
    console.log('Запуск: node scripts/istochnik-dnya.mjs <ММ-ДД|ММ> [музей]');
    process.exit(0);
  }
  const muzei = muzeiArg ? [muzeiArg] : MUZEI;
  const dni = den.length === 5 ? [den] : Array.from({ length: 31 }, (_, i) => `${den}-${String(i + 1).padStart(2, '0')}`);
  const itog = { dni: 0, chisto: 0, nahodki: 0, fakty: 0, kadry: 0 };
  for (const m of muzei) for (const d of dni) {
    const r = nahodkiDnya(process.cwd(), m, d);
    if (r.net) { if (dni.length === 1) console.log(`${m} ${d}: карточки нет (${r.fail})`); continue; }
    itog.dni++; itog.fakty += r.fakty; itog.kadry += r.kadry; itog.nahodki += r.nahodki.length;
    if (!r.nahodki.length) { itog.chisto++; continue; }
    console.log(`${m} ${d} — ${r.nahodki.length} (фактов ${r.fakty}, картинок ${r.kadry}):`);
    for (const n of r.nahodki) console.log(`  • ${n}`);
  }
  console.log(`Итог: дней ${itog.dni}, без находок ${itog.chisto}; фактов ${itog.fakty}, картинок ${itog.kadry}; находок ${itog.nahodki}. Подсказка, не запрет (Р717).`);
  process.exit(0);
}
