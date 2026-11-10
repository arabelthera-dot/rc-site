// Черновик вопросов дня из утверждённых фактов (пункт 75, r713c-voprosy, 10.11.2026). Ручной инструмент:
// не в CI и не в сборке. Читает src/data/utverzhdeno/<музей>/ММ-ДД.json (15 фактов: 10 + 5) и пишет
// файл-предложение data/predlozheniya/voprosy/<музей>/ММ-ДД.json в формате quiz.voprosy карточки
// (q, o — 4 варианта, a — номер верного, e — объяснение) плюс служебные iz (номер факта) и shablon.
// Утверждённое и src/content/dni-shablon не трогает: редактор переносит вопросы в карточку сам.
// Шаблоны те же, что в утверждённых викторинах: «когда» (дата), «кто» (человек), «сколько» (число,
// варианты ×10 — как «Около 6000 / 600 / 60 / 6» в ne-sdayutsya 01-06); факт со словом «первый/впервые»
// идёт первым («что первым»). Неверные варианты «когда» и «кто» — из соседних утверждённых дней музея.
// Запуск: node scripts/voprosy-iz-faktov.mjs <музей> ММ-ДД[,ММ-ДД…] [--sverka] [--suho]
//   --sverka — сравнить черновик с quiz.voprosy карточки дня (тот же ответ / тот же факт, см. sverka);
//   --suho   — только напечатать, файл не писать.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [muzei, dniArg, ...flagi] = process.argv.slice(2);
if (!muzei || !dniArg) { console.error('Запуск: node scripts/voprosy-iz-faktov.mjs <музей> ММ-ДД[,ММ-ДД…] [--sverka] [--suho]'); process.exit(1); }
const SVERKA = flagi.includes('--sverka');
const SUHO = flagi.includes('--suho');
const UTV = path.join(ROOT, 'src/data/utverzhdeno', muzei);
const VSE = fs.readdirSync(UTV).filter((f) => /^\d\d-\d\d\.json$/.test(f)).map((f) => f.slice(0, 5)).sort();
const VOPROSOV = 5;

const MES = 'января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря';
const RE_DATA = new RegExp(`\\b(\\d{1,2})\\s+(${MES})\\s+(1[0-9]{3}|20[0-2]\\d)(?:\\s+(?:года|г\\.))?`, 'g');
const RE_GOD = /(?<![А-ЯЁа-яё])[вВ]\s+(1[0-9]{3}|20[0-2]\d)(?:\s+году|-м)(?![а-яё])/g;
// Человек: фамилия в именительном (окончания -ов/-ев/-ин/-ский/-ко/…), не в начале предложения; ответ — одна фамилия,
// без звания и имени («Студент Розинга Зворыкин» → «Зворыкин»), чтобы варианты были одного вида.
const FAM = '[А-ЯЁ][а-яё]{2,}(?:ов|ев|ёв|ин|ын|ский|цкий|ко|ук|юк|ич)';
const RE_KTO = new RegExp(`(?<=[А-ЯЁа-яё.,»]\\s)(${FAM})(?![а-яё])`, 'g');
// Не люди: имена, названия и прилагательные-топонимы с теми же окончаниями.
const NE_KTO = /^(?:Константин|Валентин|Вениамин|Мартин|Берлин|Кремл|Москов|Ленинград|Петров|Петербург|Русск|Советск|Российск|Немецк|Американск|Английск|Французск|Шуховск|Балтийск|Царск|Кронштадт|Брестск|Осовецк|Финск|Японск|Польск|Германск|Земляно|Ладожск|Сталин$)/;
const RE_CHISLO = /(?<![\d.,–-])(\d{2,}(?:\s\d{3})*)\s+(человек[а-я]*|бойц[а-я]*|солдат[а-я]*|танк[а-я]*|метр[а-я]*|километр[а-я]*|килограмм[а-я]*|тонн[а-я]*|самол[её]т[а-я]*|дн[а-я]+|дней|сут[а-я]+|рот[а-я]*|батальон[а-я]*|орудий|пушек|квартир[а-я]*|строк[а-я]*|см|км)(?![а-яё])/g;
const RE_PERV = /впервые|перв(?:ый|ая|ое|ым|ой|ую|ого|ыми)(?![а-яё])/i;

const chitat = (d) => JSON.parse(fs.readFileSync(path.join(UTV, `${d}.json`), 'utf8'));
const predlozheniya = (t) => t.replace(/\s+/g, ' ').split(/(?<=[.!?…»])\s+(?=[А-ЯЁ«\d])/).filter((s) => s.length > 25 && s.length < 260);
// Заголовок факта — отдельным предложением с меткой zag: вопрос по главному утверждению факта идёт раньше подробностей.
const kuski = (f) => [...predlozheniya(f.zagolovok ?? '').map((pr) => [pr, true]), ...predlozheniya(f.podrobnee ?? '').map((pr) => [pr, false])];

// Все кандидаты одного вида из текста: {otvet, klyuch, pr (предложение), n (факт)}.
function kandidaty(fakty, vid) {
  const out = [];
  for (const f of fakty) for (const [pr, zag] of kuski(f)) {
    const n = f.n; const dop = { pr, n, zag };
    if (vid === 'kogda') {
      for (const m of pr.matchAll(RE_DATA)) out.push({ otvet: `${m[1]} ${m[2]} ${m[3]} года`, klyuch: `${m[1]} ${m[2]} ${m[3]}`, god: +m[3], kusok: m[0], ...dop });
      for (const m of pr.matchAll(RE_GOD)) out.push({ otvet: `В ${m[1]} году`, klyuch: m[1], god: +m[1], kusok: m[0].replace(/^[вВ]\s+/, ''), ...dop, tolkoGod: true });
    } else if (vid === 'kto') {
      // Фамилия в перечне («Ляпидевский, …, Молоков») — не вопрос: пропуск угадывается только наизусть.
      for (const m of pr.matchAll(RE_KTO)) if (!NE_KTO.test(m[1]) && !(/,\s$/.test(pr.slice(0, m.index)) && pr[m.index + m[1].length] === ',')) out.push({ otvet: m[1], klyuch: m[1].slice(0, -2).toLowerCase(), kusok: m[1], ...dop });
    } else if (vid === 'skolko') {
      for (const m of pr.matchAll(RE_CHISLO)) { const ch = +m[1].replace(/\s/g, ''); if (ch >= 10 && !(ch >= 1000 && ch <= 2030 && /^\d{4}$/.test(m[1])) && !/\d\s?(?:на|×|x)\s$/.test(pr.slice(0, m.index))) out.push({ otvet: `${m[1]} ${m[2]}`, klyuch: String(ch), ch, ed: m[2], kusok: m[0].trim(), ...dop }); }
    }
  }
  return out;
}

const peremeshat = (arr, sid) => { const a = [...arr]; let s = sid; for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sid = (t) => [...t].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 233280, 7);
const s1 = (pr, kusok) => pr.replace(kusok, '…').replace(/\s+/g, ' ').trim();

function sosedi(den, kolvo = 6) {
  const i = VSE.indexOf(den);
  return VSE.filter((d) => d !== den).sort((a, b) => Math.abs(VSE.indexOf(a) - i) - Math.abs(VSE.indexOf(b) - i)).slice(0, kolvo);
}

function nevernye(k, vid, den, svoi) {
  const zanyato = new Set([k.klyuch, ...svoi.map((x) => x.klyuch)]);
  if (vid === 'skolko') return [k.ch * 10, Math.round(k.ch / 10), k.ch * 100 >= 10 ? Math.round(k.ch / 2) : k.ch * 2].filter((x) => x > 0 && x !== k.ch).map((x) => `${x} ${k.ed}`).slice(0, 3);
  const vybor = [];
  for (const d of sosedi(den)) {
    for (const c of kandidaty(chitat(d).fakty, vid)) {
      if (zanyato.has(c.klyuch)) continue;
      if (vid === 'kogda' && (Boolean(c.tolkoGod) !== Boolean(k.tolkoGod) || Math.abs(c.god - k.god) < 2)) continue;
      zanyato.add(c.klyuch); vybor.push(c.otvet);
      if (vybor.length === 3) return vybor;
    }
  }
  return vybor;
}

function chernovik(den) {
  const { fakty, zagolovok } = chitat(den);
  const vidy = { kogda: kandidaty(fakty, 'kogda'), kto: kandidaty(fakty, 'kto'), skolko: kandidaty(fakty, 'skolko') };
  // «что первым» — вперёд; затем заголовки фактов, затем по порядку фактов; один вопрос на факт, вида — не больше двух.
  const ochered = [];
  for (const vid of ['kto', 'kogda', 'skolko']) for (const k of vidy[vid]) ochered.push({ vid, k, perv: RE_PERV.test(k.pr) });
  ochered.sort((a, b) => (b.perv - a.perv) || (b.k.zag - a.k.zag) || (a.k.n - b.k.n));
  const voprosy = []; const fakt = new Set(); const otvety = new Set(); const schet = { kto: 0, kogda: 0, skolko: 0 };
  for (const { vid, k, perv } of ochered) {
    if (voprosy.length === VOPROSOV) break;
    if (fakt.has(k.n) || otvety.has(k.klyuch) || schet[vid] >= 2) continue;
    const nev = nevernye(k, vid, den, vidy[vid].filter((x) => x.n === k.n));
    if (nev.length < 3) continue;
    const o = peremeshat([k.otvet, ...nev], sid(den + k.otvet));
    const slovo = { kto: perv ? 'Кто здесь первый' : 'Кто это', kogda: 'Когда это было', skolko: 'Сколько' }[vid];
    voprosy.push({ q: `${slovo}? «${s1(k.pr, k.kusok)}»`, o, a: o.indexOf(k.otvet), e: k.pr, iz: k.n, shablon: perv ? `${vid}-pervym` : vid, klyuch: k.klyuch });
    fakt.add(k.n); otvety.add(k.klyuch); schet[vid]++;
  }
  return { muzei, den, zagolovok, chernovik: true, iz: `src/data/utverzhdeno/${muzei}/${den}.json`, sosedi: sosedi(den), voprosy };
}

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
  const ch = chernovik(den);
  if (SVERKA) ch.sverka = sverka(den, ch);
  const kuda = path.join(ROOT, 'data/predlozheniya/voprosy', muzei, `${den}.json`);
  if (!SUHO) { fs.mkdirSync(path.dirname(kuda), { recursive: true }); fs.writeFileSync(kuda, JSON.stringify(ch, null, 1) + '\n'); }
  console.log(`${muzei} ${den}: вопросов ${ch.voprosy.length} (${ch.voprosy.map((v) => v.shablon).join(', ')})` +
    (ch.sverka ? `; из ${ch.sverka.vsego} утверждённых: тот же ответ ${ch.sverka.otvet}, тот же факт ${ch.sverka.fakt}` : '') + (SUHO ? '' : ` → ${path.relative(ROOT, kuda)}`));
}
