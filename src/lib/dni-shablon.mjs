// Пилот «страница дня = общий layout + карточка данных» (Р297): карточки src/content/dni-shablon/<музей>/ММ-ДД.yaml —
// только данные дня, вёрстка — src/layouts/DenIzobreteniya.astro, адрес /muzei/<музей>/den-shablon/ММ-ДД/
// (noindex, вне карты сайта). Схема — здесь, а не в src/content.config.ts: файл схемы ядра под замком
// (.github/workflows/skhema-yadra.yml), пилот его не задевает. Карточка не проходит схему — сборка красная.
// Строки с inline-разметкой (<b>, <i>, <a>) допустимы и выводятся как есть. Игра — по имени: разметка
// src/data/igry/<музей>/<имя>.html, скрипт public/muzei/<музей>/igry/<имя>.js; нет файла — сборка красная.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { z } from 'astro/zod';

export const DIR = 'src/content/dni-shablon';

const str = z.string().min(1);
const udar = z.object({ summary: str, find: z.boolean().optional(), tag: str.optional(), det: z.array(str).min(1), src: str });
const kartinka = z.object({ src: str, alt: str, data_source: str, license: str, podpis: str, credit: str });

export const skhema = z.object({
  muzei: str,
  key: z.string().regex(/^\d\d-\d\d$/, 'ключ дня — ММ-ДД'),
  head: z.object({ title: str, description: str, canonical: str,
    og: z.object({ type: str, site_name: str, title: str, description: str, url: str }),
    ld: z.record(z.string(), z.unknown()) }),
  oblozhka: kartinka.extend({ width: z.number().int().positive(), height: z.number().int().positive(), hint: str,
    fit_full: z.boolean().default(false), celikom: z.boolean().default(false) }),
  kroshka: str,
  lead: z.object({ data: str, privyazka: str, kto: str, h1: str, hook: str }),
  stamp: z.array(z.object({ v: str, k: str })),
  daynav: z.array(z.object({ id: str, label: str })),
  video: z.object({ h2: str, klyuch: str, format: str, pole: str, suffix: str, badge: str, intro: str, poster: str, mp4: str, note: str }),
  story: z.object({ kicker: str, h2: str, intro: str, udary: z.array(udar).min(1) }),
  fakty: z.object({ kicker: str, h2: str, udary: z.array(udar).min(1) }),
  igra: z.object({ imya: z.string().regex(/^[a-z0-9-]+$/), css: z.array(z.string().regex(/^[\w-]+$/)).default([]) }),
  pervenstvo: z.object({ kicker: str, h2: str, granica: str, net: str, kolonki: z.array(str), stroki: z.array(z.array(str)) }),
  quiz: z.object({ kicker: str, h2: str, intro: str, noscript: str,
    voprosy: z.array(z.object({ q: str, o: z.array(str).min(2), a: z.number().int().min(0), e: str })).min(1) }),
  result: z.object({ h2: str, intro: str, zvanie: str, note: str }),
  figures: z.array(kartinka).default([]),
  sources: z.array(z.object({ href: z.string().url(), title: str, pometka: str.optional(), note: str })).min(1),
  kuda: z.array(z.object({ lbl: str, href: str, title: str, hook: str, main: z.boolean() })),
  score: z.object({ awards: z.record(z.string(), z.union([z.number(), z.array(z.number())])), ranks: z.array(z.tuple([z.number(), str])) }),
  chrome: z.object({ share: z.object({ title: str, text: str }), prev: z.object({ href: str, title: str }).optional(),
    next: z.object({ href: str, title: str }).optional(), all: z.object({ href: str, label: str }), random: z.array(str) }),
  return: z.object({ q: str, a: str, src: str }),
  audioguide: z.object({ audioSrc: str, durationLabel: str, lead: str, stops: z.array(z.object({ t: z.number(), mark: str, title: str })),
    transcript: z.array(str), note: str }),
  proof: z.record(z.string(), z.unknown()),
}).superRefine((d, ctx) => {
  if (!fs.existsSync(`src/data/igry/${d.muzei}/${d.igra.imya}.html`) || !fs.existsSync(`public/muzei/${d.muzei}/igry/${d.igra.imya}.js`))
    ctx.addIssue({ code: 'custom', path: ['igra', 'imya'], message: `игры ${d.muzei}/${d.igra.imya} нет (html в src/data/igry, js в public/muzei/<музей>/igry)` });
  d.igra.css.forEach((c, i) => { if (!fs.existsSync(`public/assets/${c}.css`)) ctx.addIssue({ code: 'custom', path: ['igra', 'css', i], message: `нет public/assets/${c}.css` }); });
  d.quiz.voprosy.forEach((v, i) => { if (v.a >= v.o.length) ctx.addIssue({ code: 'custom', path: ['quiz', 'voprosy', i, 'a'], message: 'номер ответа вне списка' }); });
});

// Все карточки: [{ muzei, key, ... }]. Имя файла и папки должны совпадать с key и muzei карточки.
export function kartochki() {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).sort().flatMap((muzei) => fs.readdirSync(path.join(DIR, muzei)).filter((f) => f.endsWith('.yaml')).sort().map((f) => {
    const file = path.join(DIR, muzei, f);
    const r = skhema.safeParse(YAML.parse(fs.readFileSync(file, 'utf8')));
    if (!r.success) throw new Error(`${file}: карточка не прошла схему:\n${r.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`);
    if (r.data.muzei !== muzei || r.data.key !== f.slice(0, -5)) throw new Error(`${file}: muzei/key карточки не совпадают с путём`);
    return r.data;
  }));
}

// ── Приёмка выборкой (Р288: вариант 1 + разметка риска из варианта 2) ─────────────────────────────────────────────
// НЕ замок: сборка это не вызывает и на сайт ничего не выводит. Отчёт для Сергея — `npm run priemka [-- 2026-W44]`.
// Метки риска по каждому факту и части дня; «похоже на отказ» — общие ключевые слова/тип с прошлыми возвратами
// Сергея (src/data/otkazy-sergeya.json). Возвраты недельной выборки пишутся в src/data/priemka-vozvraty.json:
// [{ nedelya: '2026-W44', muzei, den: 'ММ-ДД', data: 'ГГГГ-ММ-ДД', chto }].
export const METKI = ['первенство', 'число', 'легенда', 'трудная тема', 'похоже на отказ'];
// Какие метки ведут день в выборку недели (Р288: «всё помеченное»).
export const METKI_V_VYBORKU = METKI;
export const SHAG = 10, SHAG_TIHO = 20, VOZVRATOV_DO_VSEY_NEDELI = 2, NEDEL_TIHO = 3;

const bezTegov = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ').trim();
const MESYAC = '(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)';
const R = {
  pervenstvo: /(?<![а-яё])(?:перв(?:ый|ая|ое|ые|ого|ой|ую|ым|ыми|ых)\s+в\s+мире|впервые|раньше\s+всех|раньше\s+(?:всего\s+)?мира|в\s+мире\s+до\s+(?:неё|него|них)|никто\s+(?:в\s+мире\s+)?до|единственн[а-яё]*\s+в\s+мире|мирово[а-яё]*\s+рекорд|рекорд[а-яё]*\s+мира)/i,
  // сравнения и «за N лет до» — даже когда числа словами
  sravnenie: /(?<![а-яё])(?:в\s+(?:\d[\d\s,]*|полтора|два|три|четыре|пять|шесть|десять|сто|тысячу)\s+раза?|за\s+[а-яё\d\s]{1,15}\s+(?:лет|года?|веков?)\s+до|раньше\s+на\s|с\s+\d[\d\s,]*\s+до\s+\d[\d\s]*\d)/i,
  legenda: /(?<![а-яё])(?:по\s+преданию|предани[ея]|легенд[а-яё]*|говорят|якобы|будто\s+бы|по\s+слухам|рассказывают|по\s+одной\s+из\s+версий)/i,
  trudnaya: /(?<![а-яё])(?:войн[а-яё]*|фронт[а-яё]*|погиб[а-яё]*|гибел[а-яё]*|убит[а-яё]*|смерт[а-яё]*|умер[а-яё]*|трагед[а-яё]*|трагич[а-яё]*|катастроф[а-яё]*|дети|детей|детям|детьми|ребён[а-яё]*|ребен[а-яё]*|младен[а-яё]*|сирот[а-яё]*|репресс[а-яё]*|арест[а-яё]*|расстрел[а-яё]*|лагер[а-яё]*|ссылк[а-яё]*|сослан[а-яё]*|враг[а-яё]*\s+народа|гулаг[а-яё]*|нквд|донос[а-яё]*|тюрьм[а-яё]*|блокад[а-яё]*|голод[а-яё]*|казн[а-яё]*|радиац[а-яё]*|заражён[а-яё]*)/i,
};
// «Число»: цифры, кроме голой даты (16 января, 16 января 1969 года) и голого года (в 1868 году) — их сверяет замок источника.
function estChislo(t) {
  if (R.sravnenie.test(t)) return true;
  const ost = t.replace(new RegExp(`\\d{1,2}\\s+${MESYAC}(\\s+\\d{3,4}(\\s+(года|г\\.))?)?`, 'gi'), ' ')
    .replace(/[a-zа-яё]-?\d+|№\s*\d+/gi, ' ').replace(/(?<![\d,.])(1\d{3}|20\d{2})(-?(х|е|м|го|й))?(?![\d,.])/g, ' ');
  return /\d/.test(ost);
}
const STOP = new Set('этого этот этой этом эта эти того тогда когда после через также только более менее самый самая самое своей свой своих своим который которая которое которые которых всего всех было были была быть есть нему него неё сразу почти уже ещё лишь даже между потом здесь чтобы ради стал стала стали года году годы лет день дней первый первая первой мире'.split(' '));
const osnovy = (t) => new Set((bezTegov(t).toLowerCase().replace(/ё/g, 'е').match(/[а-я]{4,}/g) ?? []).filter((w) => !STOP.has(w)).map((w) => w.slice(0, 5)));
// Тип факта — грубо, по тем видам, что Сергей возвращал: сравнение, награда/звание, имя/память, гибель, «провалил — а…».
const TIPY = { sravnenie: /(—\s*а\s|против|чем\s+у|в\s+\S+\s+раз|больше,?\s+чем|меньше,?\s+чем)/i, nagrada: /(геро[яйе]|звани|преми|орден|представили\s+к)/i,
  imya: /(носит\s+\S+\s+имя|назван[а-яё]*\s+в\s+честь|имя\s+(есть\s+)?на|звали|прозвал)/i, gibel: /(погиб|гибел|умер|смерт)/i, proval: /(провалил|не\s+взяли|не\s+пускали|отказал)/i };
const tipy = (t) => new Set(Object.keys(TIPY).filter((k) => TIPY[k].test(t)));

let otkazyKesh;
export function otkazy() {
  otkazyKesh ??= JSON.parse(fs.readFileSync('src/data/otkazy-sergeya.json', 'utf8')).filter((o) => o.fakt)
    .map((o) => ({ ...o, osn: osnovy(o.fakt), tip: tipy(o.fakt) }));
  return otkazyKesh;
}
// Похож на отказ: ≥3 общих основы слов, или общий тип факта и хоть одна общая основа факта. Возвращает самый похожий отказ.
export function pohozhNaOtkaz(tekst) {
  const osn = osnovy(tekst), tip = tipy(tekst);
  let luchshiy = null;
  for (const o of otkazy()) {
    const obshchie = [...osn].filter((w) => o.osn.has(w));
    const obshchiyTip = [...tip].some((t) => o.tip.has(t));
    const ball = obshchie.length + (obshchiyTip ? 1 : 0);
    if ((obshchie.length >= 3 || (obshchie.length >= 1 && obshchiyTip)) && (!luchshiy || ball > luchshiy.ball)) luchshiy = { otkaz: o, obshchie, obshchiyTip, ball };
  }
  return luchshiy;
}

// Метки одного текста: [{ metka, pochemu }] — «почему» простыми словами, для Сергея.
export function metkiTeksta(tekst, pometka) {
  const t = bezTegov(tekst), m = [];
  const kusok = (re) => (t.match(re)?.[0] ?? '').trim();
  if (R.pervenstvo.test(t)) m.push({ metka: 'первенство', pochemu: `сказано «${kusok(R.pervenstvo)}» — проверь, что так и было` });
  if (estChislo(t)) m.push({ metka: 'число', pochemu: R.sravnenie.test(t) ? `сравнение «${kusok(R.sravnenie)}» — проверь цифры` : 'есть цифры — проверь, что они верные' });
  if (pometka === 'легенда' || R.legenda.test(t)) m.push({ metka: 'легенда', pochemu: pometka === 'легенда' ? 'сам факт помечен как легенда' : `сказано «${kusok(R.legenda)}» — это не доказано` });
  if (R.trudnaya.test(t)) m.push({ metka: 'трудная тема', pochemu: `«${kusok(R.trudnaya)}» — посмотри, как сказано` });
  const p = pohozhNaOtkaz(t);
  if (p) m.push({ metka: 'похоже на отказ', otkaz: p.otkaz, pochemu: `${p.otkaz.prichina === 'не взят' ? 'похоже на факт, который ты не взял' : `похоже на факт, который ты вернул со словами «${p.otkaz.citata.slice(0, 60)}»`} ${datаRu(p.otkaz.data)}: «${p.otkaz.fakt}»` });
  return m;
}
const MES = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
function datаRu(iso) { const [, mm, dd] = String(iso).split('-').map(Number); return mm ? `${dd} ${MES[mm - 1]}` : String(iso); }
const denRu = (key) => datаRu(`0000-${key}`);

// Разметка риска карточки дня: по каждому факту и каждой части дня. [{ chast, nomer, tekst, metki }], только помеченное.
export function razmetkaRiska(d) {
  const chasti = [];
  const dob = (chast, nomer, tekst, pometka) => { const metki = metkiTeksta(tekst, pometka); if (metki.length) chasti.push({ chast, nomer, tekst: bezTegov(tekst), metki }); };
  (d.fakty?.udary ?? []).forEach((u, i) => dob('факт', i + 1, u.summary, u.pometka));
  d.story.udary.forEach((u, i) => dob('рассказ', i + 1, u.summary, u.pometka));
  dob('заголовок', 0, `${d.lead.h1}. ${d.lead.hook}`);
  dob('граница первенства', 0, d.pervenstvo.granica);
  d.razdely.forEach((r, i) => dob('доп. раздел', i + 1, r.html));
  d.audioguide.transcript.forEach((t, i) => dob('аудиогид', i + 1, t));
  d.quiz.voprosy.forEach((v, i) => dob('викторина', i + 1, `${v.q} ${v.e}`));
  return chasti;
}

// Неделя (ISO) — по дню, когда карточка впервые попала в историю; нет в истории — сегодня.
function isoNedelya(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const den = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() + 4 - den);
  const n = Math.ceil(((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(n).padStart(2, '0')}`;
}
async function nedelyaKartochki(d) {
  const { execFileSync } = await import('node:child_process');
  let s = '';
  try { s = execFileSync('git', ['log', '--diff-filter=A', '--format=%cs', '--', `${DIR}/${d.muzei}/${d.key}.yaml`], { encoding: 'utf8' }).trim().split('\n').pop(); } catch { /* нет git — сегодня */ }
  return isoNedelya(s ? new Date(`${s}T00:00:00Z`) : new Date());
}
// Воспроизводимый жребий: сид = номер недели.
function zhrebiy(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Выборка недели по музеям: { nedelya, muzei: [{ muzei, vsego, shag, celikom, dni: [{ key, pochemu: [...], chasti }] }] }.
export async function vyborkaNedeli(nedelya) {
  const vozvraty = JSON.parse(fs.readFileSync('src/data/priemka-vozvraty.json', 'utf8'));
  const vse = [];
  for (const d of kartochki()) vse.push({ d, nedelya: await nedelyaKartochki(d) });
  nedelya ??= isoNedelya(new Date());
  const muzei = [...new Set(vse.filter((x) => x.nedelya === nedelya).map((x) => x.d.muzei))];
  return { nedelya, muzei: muzei.map((m) => {
    const dni = vse.filter((x) => x.d.muzei === m && x.nedelya === nedelya).map((x) => x.d);
    const vozvr = vozvraty.filter((v) => v.muzei === m && v.nedelya === nedelya).length;
    // 3 прошлые недели музея с карточками — все без возвратов → шаг 20.
    const proshlye = [...new Set(vse.filter((x) => x.d.muzei === m && x.nedelya < nedelya).map((x) => x.nedelya))].sort().slice(-NEDEL_TIHO);
    const tiho = proshlye.length === NEDEL_TIHO && proshlye.every((n) => !vozvraty.some((v) => v.muzei === m && v.nedelya === n));
    const shag = tiho ? SHAG_TIHO : SHAG, celikom = vozvr > VOZVRATOV_DO_VSEY_NEDELI;
    const rnd = zhrebiy(Number(nedelya.slice(-2)));
    const naugad = new Set(dni.map((d) => d.key).sort().map((k) => [rnd(), k]).sort((a, b) => a[0] - b[0]).slice(0, Math.max(1, Math.round(dni.length / shag))).map((x) => x[1]));
    const otobrany = dni.map((d) => {
      const chasti = razmetkaRiska(d), pochemu = [];
      if (celikom) pochemu.push(`возвратов за неделю: ${vozvr}, это больше двух — смотрим всю неделю`);
      if (naugad.has(d.key)) pochemu.push(`выпал по жребию (каждый ${shag}-й день)`);
      const vazhnye = [...new Set(chasti.flatMap((c) => c.metki.map((x) => x.metka)).filter((x) => METKI_V_VYBORKU.includes(x)))];
      if (vazhnye.length) pochemu.push(`машина пометила: ${vazhnye.join(', ')}`);
      return { key: d.key, pochemu, chasti };
    }).filter((x) => x.pochemu.length);
    return { muzei: m, vsego: dni.length, shag, celikom, vozvratov: vozvr, dni: otobrany };
  }) };
}

const MUZEI_RU = { izobreteniya: 'Изобретения' };
const CHAST_RU = { 'факт': 'факт', 'рассказ': 'рассказ, абзац', 'заголовок': 'заголовок дня', 'граница первенства': 'граница первенства', 'доп. раздел': 'дополнительный раздел', 'аудиогид': 'аудиогид, абзац', 'викторина': 'викторина, вопрос' };
// Текст для Сергея: обычный русский, без путей и терминов.
export async function otchetPriemki(nedelya) {
  const v = await vyborkaNedeli(nedelya);
  const s = [`Сергей, выборка на эту неделю.`];
  if (!v.muzei.length) return `${s[0]}\nНовых дней за неделю нет — смотреть нечего.`;
  for (const m of v.muzei) {
    const nazv = MUZEI_RU[m.muzei] ?? m.muzei;
    s.push('', `Музей «${nazv}»: за неделю ${m.vsego} дн., посмотреть ${m.dni.length}.${m.shag === SHAG_TIHO ? ' Три недели без возвратов — жребий теперь каждый 20-й день.' : ''}`);
    for (const d of m.dni) {
      s.push('', `${denRu(d.key)} — ${d.pochemu.join('; ')}.`);
      // Факты и рассказ — строкой на каждый; прочие части с одними «первенство/число» — одной сводкой (те же утверждения).
      const svodka = [];
      for (const c of d.chasti) {
        const prostoe = !['факт', 'рассказ'].includes(c.chast) && c.metki.every((x) => ['первенство', 'число'].includes(x.metka));
        const gde = c.nomer ? `${CHAST_RU[c.chast]} ${c.nomer}` : CHAST_RU[c.chast];
        if (prostoe) { svodka.push(gde); continue; }
        const t = c.tekst.length > 100 ? `${c.tekst.slice(0, 97)}…` : c.tekst;
        s.push(`  • ${gde} «${t}» — ${c.metki.map((x) => `${x.metka}: ${x.pochemu}`).join('; ')}.`);
      }
      if (svodka.length) s.push(`  • Ещё первенство или цифры повторяются здесь: ${svodka.join(', ')} — сверь с фактами выше.`);
    }
  }
  s.push('', 'Если что-то вернёшь — скажи день и что не так, я запишу. Больше двух возвратов за неделю — смотрим эту неделю целиком.');
  return s.join('\n');
}
