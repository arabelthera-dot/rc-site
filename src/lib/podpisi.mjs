// Д2: подписи у кадров — общий разбор для страницы /avtory-izobrazheniy/ и проверки scripts/proverka-podpisey.mjs.
// Источники: карточки дней (src/content/days/<музей>/ММ-ДД.json: images, more[].images, more[].detail_images)
// и полные страницы (src/data/full-pages/<музей>/<ключ>.html). Правила — как в замере
// knowledge/razbory-2026-10/d2-zamer.py (19.10): «без подписи» — у кадра нет ни источника, ни лицензии рядом;
// «без лицензии» — источник есть, лицензии в тексте нет. Только чтение, без зависимостей.
import fs from 'node:fs';
import path from 'node:path';

// Р136 (22.10): кадр фонда любого года по стандарту музеев (credit line) — «Хранится: музей» и основание ст. 1274 ГК РФ
// в одной подписи; одна ссылка на статью без держателя лицензией не считается.
export const LIC = /\bCC[ -]?(BY|0)|Free Art License|обществен\S* достоян|не объект\S* авторск\S* прав|public domain|PD-|свободн\S* лиценз|©|все права|Хранится:[^]*ст\. 1274 ГК/i;
export const SRC = /фото\s*:|автор|музе|архив|библиотек|собрани|коллекци|ГИМ|ГТГ|РГБ|НЭБ|ГМИИ|Эрмитаж|источник|из книги|журнал|газет|генерац|Genosai|реконструкц|https?:\/\/|рисун\S+ [А-ЯЁ]|гравюр|издани/i;

/** Опись Р84, Б16: название лицензии из текста подписи для колонки «Лицензия» сводной страницы; '' — не найдена. */
export function licName(text = '') {
  const t = String(text);
  const cc = t.match(/\bCC[ -]?(BY(?:[ -](?:SA|ND|NC))*(?:[ -](?:SA|ND))?|0)(?:[ -]?(\d\.\d))?/i);
  if (cc) return `CC ${cc[1].toUpperCase().replace(/ /g, '-')}${cc[2] ? ` ${cc[2]}` : ''}`;
  if (/Free Art License/i.test(t)) return 'Free Art License';
  if (/обществен\S* достоян|public domain|PD-/i.test(t)) return 'общественное достояние';
  if (/свободн\S* лиценз/i.test(t)) return 'свободная лицензия';
  if (/Хранится:[^]*ст\. 1274 ГК/i.test(t)) return 'цитирование с указанием источника (ст. 1274 ГК РФ)';
  if (/с разрешени\S+/i.test(t)) return 'с разрешения правообладателя';
  if (/©|все права/i.test(t)) return '© правообладатель';
  return '';
}

/** «1 кадр», «2 кадра», «5 кадров». */
export function kadrov(n) {
  const a = n % 10, b = n % 100;
  return `${n} ${a === 1 && b !== 11 ? 'кадр' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'кадра' : 'кадров'}`;
}

const DAYS = 'src/content/days';
const FULL = 'src/data/full-pages';
const ls = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []);

/** Кадры карточек дней: { museum, key, title, src, caption, credit, lic } */
export function cardFrames(root = '.') {
  const out = [];
  for (const museum of ls(path.join(root, DAYS))) {
    for (const f of ls(path.join(root, DAYS, museum)).filter((x) => x.endsWith('.json'))) {
      const d = JSON.parse(fs.readFileSync(path.join(root, DAYS, museum, f), 'utf8'));
      const ims = [...(d.images || [])];
      for (const e of d.more || []) ims.push(...(e.images || []), ...(e.detail_images || []));
      for (const im of ims) {
        const credit = String(im.credit || '').trim();
        out.push({ museum, key: d.key || f.slice(0, -5), title: d.title || '', src: im.src || '', caption: im.caption || '',
          credit, lic: LIC.test(credit), generated: !!im.generated });
      }
    }
  }
  return out;
}

const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))?.slice(2).find((x) => x !== undefined);

/** Кадры одной полной страницы: { src, alt, cap, data, sign, lic, state } — state: ok | partial | near | rights | none */
export function pageFrames(html) {
  const raw = html.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, '');
  const pageRights = /rights-table|rights-sources|class="[^"]*sources/.test(html);
  const imgs = [];
  let fig = null; let inCap = false; let last = 0;
  for (const m of raw.matchAll(/<(\/?)([a-z0-9]+)\b([^>]*)>/gi)) {
    if (fig && inCap) fig.cap += raw.slice(last, m.index);
    last = m.index + m[0].length;
    const close = !!m[1]; const t = m[2].toLowerCase(); const a = m[3];
    if (!close && t === 'figure') fig = { imgs: [], cap: '', credit: false };
    if (t === 'figcaption' && fig) inCap = !close;
    if (!close && fig && /credit|source|attrib|licen/.test(attr(a, 'class') || '')) fig.credit = true;
    if (!close && t === 'img') {
      const data = [...a.matchAll(/\b(data-[\w-]+)\s*=\s*"([^"]*)"/gi)].filter((x) => /licen|source|author|credit/.test(x[1])).map((x) => `${x[1]}=${x[2]}`).join(' ');
      const alt = attr(a, 'alt');
      const im = { src: attr(a, 'src') || '', alt, data, title: attr(a, 'title') || '', at: m.index, end: last,
        deco: alt === '' || attr(a, 'aria-hidden') === 'true' || attr(a, 'role') === 'presentation' };
      imgs.push(im); if (fig) fig.imgs.push(im);
    }
    if (close && t === 'figure' && fig) { for (const im of fig.imgs) { im.cap = strip(fig.cap); im.creditEl = fig.credit; } fig = null; inCap = false; }
  }
  const frames = imgs.filter((im) => !im.deco).map((im, i, all) => {
    const txt = [im.cap || '', im.data, im.title].join(' ');
    let lic = LIC.test(txt); const src = SRC.test(txt);
    if (/licen/.test(im.data)) lic = true;
    const nextAt = imgs[imgs.indexOf(im) + 1]?.at ?? raw.length;
    const near = strip(raw.slice(im.end, Math.min(nextAt, im.end + 700)));
    const state = (lic && src) || (lic && im.data) ? 'ok'
      : lic || src || im.creditEl ? 'partial'
      : im.cap === undefined && LIC.test(near) && SRC.test(near) ? 'near'
      : pageRights ? 'rights' : 'none';
    return { src: im.src, alt: im.alt || '', cap: im.cap || '', data: im.data, sign: (im.cap || im.title || im.data || '').trim(), lic: state === 'ok' || (state === 'near'), state };
  });
  // Тот же кадр дважды (обложка + блок ниже): подпись у одного экземпляра покрывает оба (Д2, 20.10:
  // в замере d2-zamer.py окно «рядом» бралось по адресу картинки — 28 вместо 25, из них 3 — обложки сказок).
  const signed = new Map(frames.filter((f) => f.state === 'ok' || f.state === 'near').map((f) => [f.src, f.state]));
  for (const f of frames) if (f.state === 'none' && signed.has(f.src)) { f.state = signed.get(f.src); f.lic = true; }
  return frames;
}

/** Кадры всех полных страниц: { museum, key, ...pageFrames } */
export function fullFrames(root = '.') {
  const out = [];
  for (const museum of ls(path.join(root, FULL))) {
    for (const f of ls(path.join(root, FULL, museum)).filter((x) => x.endsWith('.html'))) {
      const html = fs.readFileSync(path.join(root, FULL, museum, f), 'utf8');
      for (const fr of pageFrames(html)) out.push({ museum, key: f.slice(0, -5), ...fr });
    }
  }
  return out;
}

// Р132 (22.10): кадр карточки дня, которого нет на полной странице этого дня, — посетитель его не видит (сайт показывает
// full-pages 1:1). Показан = то же имя файла, тот же файл под другим именем или та же вещь (¾ значимых слов подписи —
// в alt/подписи кадра страницы). Правило то же, что у scripts/kadr.py (_dub); починка — kadr.py vernut / sinhron.
const SLUZH = new Set(['госкаталог', 'музейного', 'фонда', 'фонд', 'собрания', 'государственная', 'государственный', 'галерея', 'галереи',
  'третьяковская', 'третьяковской', 'музей', 'музея', 'иллюстрация', 'репродукция', 'художника', 'работа', 'неизвестного']);
const slova = (s) => new Set((`${[...String(s).matchAll(/\b(?:alt|data-title)="([^"]*)"/g)].map((m) => m[1]).join(' ')} ${String(s).replace(/<[^>]+>/g, ' ')}`)
  .toLowerCase().replace(/ё/g, 'е').match(/[а-яa-z0-9]{4,}/g)?.filter((w) => !SLUZH.has(w)).map((w) => w.slice(0, 5)) ?? []);
const WIKI = /commons\.wikimedia\.org|upload\.wikimedia\.org|wikimedia\s+commons|викисклад/i;

export function kadryNeNaStranice(root = '.') {
  const out = [];
  const fajl = (s) => { const f = path.join(root, 'public', s.replace(/^\/+/, '')); return fs.existsSync(f) ? f : null; };
  for (const museum of ls(path.join(root, FULL))) {
    for (const f of ls(path.join(root, FULL, museum)).filter((x) => x.endsWith('.html'))) {
      const key = f.slice(0, -5), day = path.join(root, DAYS, museum, `${key}.json`);
      if (!fs.existsSync(day)) continue;
      const html = fs.readFileSync(path.join(root, FULL, museum, f), 'utf8');
      const srcs = [...new Set([...html.matchAll(/src="([^"]+\.(?:jpe?g|png|webp))"/gi)].map((m) => m[1]))];
      const bloki = html.match(/<figure\b[\s\S]*?<\/figure>|<img\b[^>]*>/gi) ?? [];
      for (const im of JSON.parse(fs.readFileSync(day, 'utf8')).images || []) {
        const src = String(im.src || ''), imya = src.split('/').pop();
        if (!imya || html.includes(imya) || WIKI.test(`${src} ${im.credit || ''}`)) continue;
        const moj = fajl(src);
        if (moj) {
          const byte = fs.readFileSync(moj);
          const tot = srcs.some((s) => { const g = fajl(s.includes('muzei/') ? `muzei/${s.split('muzei/').pop()}` : `muzei/${museum}/${s}`);
            return g && fs.statSync(g).size === byte.length && fs.readFileSync(g).equals(byte); });
          if (tot) continue;
        }
        const sk = slova(im.caption || '');
        if (sk.size && bloki.some((b) => { const sb = slova(b); return [...sk].filter((w) => sb.has(w)).length >= 0.75 * sk.size; })) continue;
        out.push({ museum, key, src: imya });
      }
    }
  }
  return out;
}
