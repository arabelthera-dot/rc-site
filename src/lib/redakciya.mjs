// Подпись, лицензия и журнал исправлений (Р34, Р35, Е5; Сергей 20.10.2026). Одно место на весь сайт:
// шаблоны (Base.astro, страница дня) и полные страницы дней (src/integrations/full-pages.mjs) берут отсюда.
// Вид — public/assets/rc-podval.css.
import { execFileSync } from 'node:child_process';
import { stroka } from './yazyki.mjs';

// Кто подписывает тексты сайта — Редакция (Р34): JSON-LD author/publisher, <meta name="author">.
export const REDAKCIYA = 'Редакция «Русской цивилизации»';
// Тексты и уроки — CC BY 4.0 (Р35); изображения — по лицензиям из подписей (страница /avtory-izobrazheniy/).
export const LICENZIYA = 'https://creativecommons.org/licenses/by/4.0/deed.ru';

export const redakciyaLd = (home) => ({ '@type': 'Organization', name: REDAKCIYA, url: home });

// Строка подвала всех страниц: лицензия + ссылки «О проекте», «Как сделан музей» (у шаблонов они в .foot-links).
export function licenziyaHtml(base, { links = false, code = 'ru' } = {}) {
  const s = (k) => stroka(code, k); // строки — из словаря языка (Г20, src/data/stroki.json)
  return `<div class="rc-lic">${s('licTeksty')} <a href="${LICENZIYA}" rel="license noopener" target="_blank">CC BY 4.0</a>`
    + `${s('licMozhno')} (<a href="${base}avtory-izobrazheniy/">${s('licAvtory')}</a>).`
    + (links ? `<br><a href="${base}o-proekte/">${s('podvalOProekte')}</a> · <a href="${base}kak-sdelan-muzey/">${s('podvalKakSdelan')}</a>` : '')
    + `</div>`;
}

// ── Журнал исправлений дня — из истории git файла карточки (схема карточки заморожена, полей не добавляем).
// Один git log на сборку. Мелкий клон (shallow) дал бы всем дням дату последнего коммита — тогда журнала нет,
// а в CI сборка падает: в proverka.yml и deploy.yml нужен checkout с fetch-depth: 0.
let cache;
function istoriya() {
  if (cache) return cache;
  cache = new Map();
  let out = '';
  try {
    if (execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf8' }).trim() === 'true') {
      const msg = 'журнал исправлений: мелкий клон git — нужна вся история (actions/checkout с fetch-depth: 0)';
      if (process.env.CI) throw new Error(msg);
      console.warn(`redakciya: ${msg}; журнал не выводится`);
      return cache;
    }
    out = execFileSync('git', ['log', '--no-merges', '--format=%x1e%cI%x1f%s', '--name-only', '--', 'src/content/days'],
      { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  } catch (e) {
    if (process.env.CI) throw e;
    console.warn(`redakciya: истории git нет (${e.message.split('\n')[0]}); журнал не выводится`);
    return cache;
  }
  for (const rec of out.split('\x1e').slice(1)) {
    const [head, ...files] = rec.split('\n');
    const [date, subject] = head.split('\x1f');
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      if (!cache.has(f)) cache.set(f, []);
      cache.get(f).push({ date, subject });
    }
  }
  return cache;
}

// Сообщение коммита — посетителю по-человечески: без имён, номеров заявок и служебных слов.
const SLOVA = [
  [/перенос|каркас|в новом сайте/i, 'обновлён при переезде на новый сайт'],
  [/замен\S* (?:\d+ )?(?:дн|экспонат)/i, 'заменён экспонат дня'],
  [/больш\S* страниц|полн\S* страниц|(?<![а-яё])проход|анкет/i, 'расширена страница дня'],
  [/картин|изображ|кадр|фото|обложк|image|webp/i, 'заменено изображение'],
  [/импорт|import/i, 'обновлён при переезде на новый сайт'],
  [/подпис|credit|caption|лицензи/i, 'уточнена подпись к изображению'],
  [/источник|source/i, 'уточнён источник'],
  [/назван/i, 'уточнено название'],
  [/дат[аыу]\b|сдвиг/i, 'уточнена дата'],
  [/аудио|звук|голос/i, 'обновлён голос'],
  [/видео|ролик/i, 'обновлён ролик'],
  [/хук|hook|подводк/i, 'переписана подводка'],
  [/опечат|текст|gist|суть|язык|канцеляр|ошибк/i, 'уточнён текст'],
  [/таблиц/i, 'сверено с таблицей года'],
  [/механик|интерактив/i, 'обновлено задание для посетителя'],
];
export const poChelovecheski = (subject) => SLOVA.find(([re]) => re.test(subject))?.[1] ?? 'правка';

const DATA = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Moscow' });
const den = (iso) => DATA.format(new Date(iso)).replace(/\s*г\.$/, '');
const dIso = (iso) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Moscow' }).format(new Date(iso));

/** Журнал дня: { provereno, proverenoIso, modified, published (первая запись карточки — дата выхода дня), zapisi: [{ data, iso, chto }] } (новые сверху) или undefined. */
export function zhurnal(museum, key) {
  const raw = istoriya().get(`src/content/days/${museum}/${key}.json`);
  if (!raw?.length) return undefined;
  const zapisi = [];
  for (const { date, subject } of raw) {
    const z = { data: den(date), iso: dIso(date), chto: poChelovecheski(subject) };
    // в один день одно и то же — одной строкой
    if (!zapisi.some((x) => x.iso === z.iso && x.chto === z.chto)) zapisi.push(z);
  }
  return { provereno: zapisi[0].data, proverenoIso: zapisi[0].iso, modified: raw[0].date, published: raw.at(-1).date, zapisi };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Блок «Проверено: дата» + раскрывающийся «Журнал исправлений» — одна разметка для шаблона и полных страниц. */
export function zhurnalHtml(z) {
  if (!z) return '';
  return `<section class="rc-zhurnal" aria-label="Проверка и исправления">`
    + `<p class="rc-zh-prov">Проверено: <time datetime="${z.proverenoIso}">${esc(z.provereno)}</time></p>`
    + `<details class="rc-zh-log"><summary>Журнал исправлений</summary><ul>`
    + z.zapisi.map((x) => `<li><time datetime="${x.iso}">${esc(x.data)}</time> — ${esc(x.chto)}</li>`).join('')
    + `</ul></details></section>`;
}
