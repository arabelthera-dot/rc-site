#!/usr/bin/env node
// Типограф, ё и ударения для озвучки (пункт 79 очереди 1, r719-proby, 10.11.2026). Ручной инструмент, не в CI.
// Правила — по образцу typograf (github.com/typograf/typograf, правила common/nbsp, ru/quote, ru/dash)
// и Типографа Лебедева (artlebedev.ru/typograf): «ёлочки» и „лапки“ внутри, тире с неразрывным пробелом,
// неразрывный пробел после коротких слов и между числом и словом, многоточие, тире в диапазоне лет.
//
//   node scripts/tipograf.mjs --otchet <день.json>...   отчёт-предложение «кавычки и тире», файлы не меняются
//   node scripts/tipograf.mjs --pravit <черновик.json>  правит черновик нового дня (не src/content/days/)
//   node scripts/tipograf.mjs --ozvuchka <день.json>    текст для озвучки: ё и знаки ударения (U+0301), в stdout
//
// Утверждённые дни (src/content/days/) этим инструментом не правятся: --pravit на них отказывает.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const NBSP = '\u00a0';
const PROPUSK_KLYUCHEJ = /^(museum|key|id|slug|url|src|href|path|file|fail|image|kadr|data|date|lang|tip|type)$/i;

// ё — только слова, где «е» вместо «ё» не бывает (омонимы вроде «все/всё», «небо/нёбо» не трогаем)
const YO = ['ещё', 'её', 'чёрный', 'чёрная', 'чёрное', 'чёрного', 'чёрной', 'чёрным', 'трёх', 'четырёх', 'трёхсот',
  'учёный', 'учёные', 'учёных', 'учёного', 'пришёл', 'нашёл', 'ушёл', 'вошёл', 'прошёл', 'зашёл', 'отошёл',
  'лётчик', 'лётчика', 'лётчики', 'лётчиков', 'расчёт', 'расчёта', 'расчёты', 'расчётов', 'расчётный', 'расчётная',
  'расчётное', 'отчёт', 'отчёта', 'счёт', 'счёта', 'полёт', 'полёта', 'полёты', 'самолёт', 'самолёта', 'самолёты',
  'вертолёт', 'вертолёта', 'ледокол', 'лёд', 'льдом', 'тёмный', 'тёмная', 'тёплый', 'тёплая', 'зелёный', 'зелёная',
  'жёлтый', 'жёлтая', 'тяжёлый', 'тяжёлая', 'тяжёлые', 'лёгкий', 'лёгкая', 'лёгкие', 'актёр', 'актёры', 'шофёр',
  'объём', 'объёма', 'подъём', 'подъёма', 'приём', 'приёма', 'берёза', 'берёзы', 'ёлка', 'ёлки', 'ёж',
  'утёс', 'остриё', 'бельё', 'ружьё', 'копьё', 'жильё', 'всё-таки', 'определённый', 'определённо', 'причём',
  'путём', 'втроём', 'вдвоём', 'втором', 'зовёт', 'идёт', 'ведёт', 'несёт', 'живёт', 'даёт', 'встаёт', 'поёт',
  'семёновский', 'фёдор', 'фёдора', 'пётр', 'артём', 'алёна', 'королёв', 'королёва', 'хрущёв', 'горбачёв',
  'кремлёвский', 'кремлёвская', 'орёл', 'орла', 'тверской', 'черёмуха', 'шёлк', 'шёлка', 'чёлн', 'звёзды',
  'звёзд', 'гнёзда', 'вёсла', 'жёны', 'сёстры', 'посёлок', 'посёлка', 'надёжный', 'надёжная', 'смётка', 'щётка']
  .filter((s) => s.includes('ё'));
const YO_SLOVAR = new Map(YO.map((s) => [s.replace(/ё/g, 'е'), s]));

// ударения для озвучки: где синтезатор речи ошибается (омографы и имена); слово без ё → слово со знаком
const UDARENIYA = {
  'замок': null, 'атлас': null, // омографы без контекста не размечаем
  'шухов': 'Шу́хов', 'шухова': 'Шу́хова', 'туполев': 'Ту́полев', 'туполева': 'Ту́полева', 'сикорский': 'Сико́рский',
  'менделеев': 'Менделе́ев', 'ломоносов': 'Ломоно́сов', 'попов': 'Попо́в', 'попова': 'Попо́ва', 'яблочков': 'Я́блочков',
  'лодыгин': 'Лоды́гин', 'кулибин': 'Кули́бин', 'ползунов': 'Ползуно́в', 'черепанов': 'Черепа́нов',
  'балаханы': 'Балаханы́', 'звонит': 'звони́т', 'включит': 'включи́т', 'договор': 'догово́р', 'каталог': 'катало́г',
  'квартал': 'кварта́л', 'красивее': 'краси́вее', 'обеспечение': 'обеспе́чение', 'средства': 'сре́дства',
  'диспансер': 'диспансе́р', 'граненый': 'гранёный', 'новорожденный': 'новорождённый', 'щавель': 'щаве́ль',
  'торты': 'то́рты', 'начался': 'начался́', 'понял': 'по́нял', 'принял': 'при́нял', 'создал': 'со́здал',
};

const KOROTKIE = 'а|без|в|во|да|для|до|за|и|из|к|ко|на|над|не|ни|но|о|об|обо|от|по|под|при|про|с|со|у|через';

function sovpadenieRegistra(obrazec, slovo) {
  if (obrazec === obrazec.toUpperCase() && obrazec.length > 1) return slovo.toUpperCase();
  if (obrazec[0] === obrazec[0].toUpperCase()) return slovo[0].toUpperCase() + slovo.slice(1);
  return slovo;
}

function kavychki(t) {
  // "…" и „…“/“…” → «…», вложенные → „…“
  let glubina = 0;
  return t.replace(/["“”„«»]/g, (z, i) => {
    const pred = i === 0 ? ' ' : t[i - 1];
    const otkryvaet = z === '«' || z === '„' || (z !== '»' && /[\s(\[—–-]/.test(pred));
    if (otkryvaet) { glubina += 1; return glubina > 1 ? '„' : '«'; }
    glubina = Math.max(0, glubina - 1);
    return glubina > 0 ? '“' : '»';
  });
}

export function tipograf(t) {
  const pravki = [];
  let r = t;
  const shag = (vid, f) => { const n = f(r); if (n !== r) pravki.push(vid); r = n; };
  shag('кавычки', (s) => (/["“”„]/.test(s) ? kavychki(s) : s));
  shag('тире', (s) => s.replace(/(\S)[ \u00a0]+(?:-|--|–|—)[ \u00a0]+/g, `$1${NBSP}— `).replace(/^(?:-|--|–) /, '— '));
  shag('диапазон', (s) => s.replace(/(?<![\d.])(\d{3,4})-(\d{2,4})(?![\d-])/g, '$1–$2'));
  shag('многоточие', (s) => s.replace(/\.\.\./g, '…'));
  shag('пробелы', (s) => s.replace(/ {2,}/g, ' '));
  shag('неразрывный пробел', (s) => s
    .replace(new RegExp(`(^|[\\s(«„])(${KOROTKIE}) (?=\\S)`, 'gi'), `$1$2${NBSP}`)
    .replace(/(\d) (?=[а-яёА-ЯЁ%])/g, `$1${NBSP}`)
    .replace(/(\d) (г\.|гг\.|в\.|вв\.)/g, `$1${NBSP}$2`));
  shag('ё', (s) => s.replace(/[а-яёА-ЯЁ-]+/g, (w) => {
    const yo = YO_SLOVAR.get(w.toLowerCase());
    return yo ? sovpadenieRegistra(w, yo) : w;
  }));
  return { tekst: r, pravki };
}

export function ozvuchka(t) {
  const { tekst } = tipograf(t);
  return tekst.replace(/\u00a0/g, ' ').replace(/[а-яёА-ЯЁ]+/g, (w) => {
    const u = UDARENIYA[w.toLowerCase()];
    return u ? sovpadenieRegistra(w, u) : w;
  });
}

function obhod(uzel, put, f) {
  if (typeof uzel === 'string') return f(uzel, put);
  if (Array.isArray(uzel)) return uzel.map((x, i) => obhod(x, `${put}[${i}]`, f));
  if (uzel && typeof uzel === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(uzel)) out[k] = PROPUSK_KLYUCHEJ.test(k) ? v : obhod(v, put ? `${put}.${k}` : k, f);
    return out;
  }
  return uzel;
}
const tekstovoe = (s) => /[а-яё]/i.test(s) && !/^(https?:|\/|\.\/)/.test(s);

function main(argv) {
  const [rezhim, ...faily] = argv;
  if (!['--otchet', '--pravit', '--ozvuchka'].includes(rezhim) || !faily.length) {
    console.error('node scripts/tipograf.mjs --otchet|--pravit|--ozvuchka <файл.json>...');
    return 2;
  }
  let vsego = 0;
  const schet = {};
  for (const fail of faily) {
    const dannye = JSON.parse(readFileSync(fail, 'utf8'));
    if (rezhim === '--pravit' && /src\/content\/days\//.test(resolve(fail))) {
      console.error(`${fail}: утверждённый день — только --otchet, файл не меняю`);
      return 1;
    }
    if (rezhim === '--ozvuchka') {
      obhod(dannye, '', (s, put) => { if (tekstovoe(s) && /^(title|hook|text|tekst|opisanie|fakty|facts)/i.test(put)) console.log(ozvuchka(s)); return s; });
      continue;
    }
    const stroki = [];
    const novye = obhod(dannye, '', (s, put) => {
      if (!tekstovoe(s)) return s;
      const { tekst, pravki } = tipograf(s);
      if (pravki.length) {
        stroki.push(`- \`${put}\` (${pravki.join(', ')})\n  было:  ${s}\n  стало: ${tekst.replace(/\u00a0/g, '⍽')}`);
        for (const p of pravki) schet[p] = (schet[p] || 0) + 1;
      }
      return tekst;
    });
    vsego += stroki.length;
    if (rezhim === '--pravit') writeFileSync(fail, `${JSON.stringify(novye, null, 2)}\n`);
    console.log(`## ${fail} — полей с предложениями: ${stroki.length}\n${stroki.join('\n')}\n`);
  }
  if (rezhim !== '--ozvuchka') {
    console.log(`Итого полей: ${vsego}; по видам: ${Object.entries(schet).map(([k, v]) => `${k} ${v}`).join(', ') || 'нет'}`);
    if (rezhim === '--otchet') console.log('(⍽ — неразрывный пробел; файлы не изменены — это предложение)');
  }
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exitCode = main(process.argv.slice(2));
