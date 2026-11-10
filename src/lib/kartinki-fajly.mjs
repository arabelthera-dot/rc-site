// Размер, тип и сумма картинки дня — из файла при сборке (п. 90 очереди, r713c-kartinki). Не замок и не проверка:
// только расчёт. Карточки src/content/dni-shablon читаются один раз на процесс: у каждой локальной картинки (обложка,
// кадры figures, kadr у фактов и истории) — fajl { tip, sha256, bayt, width, height } по файлу в public/ (sharp
// читает заголовок, sha256 — весь файл; поворот EXIF 5–8 меняет ширину с высотой, как imageMetadata у Astro).
// Ручные width/height остаются, как были: расхождение с файлом — предупреждение в журнал, сборка не падает.
// Без флага поле дописывается только там, где его нет, а схема требует (oblozhka): готовые страницы не меняются.
// RC_RAZMERY_IZ_FAJLA=1 — размеры из файла везде: вместо ручных и там, где их не было (кадр получит width/height).
// Файла нет или он не картинка — fajl не ставится, день как раньше.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const TIP = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif', heif: 'image/avif' };
const KARTINKA = /^\s*-?\s*src:\s*['"]?(\/?[^\s'"#?]+\.(?:jpe?g|png|webp|gif|svg|avif))/gim;
export const IZ_FAJLA = process.env.RC_RAZMERY_IZ_FAJLA === '1';

async function opisat(file) {
  try {
    const b = fs.readFileSync(file);
    const m = await sharp(b).metadata();
    const povorot = (m.orientation ?? 0) >= 5;
    return { tip: TIP[m.format] ?? `image/${m.format}`, sha256: crypto.createHash('sha256').update(b).digest('hex'), bayt: b.length,
      width: povorot ? m.height : m.width, height: povorot ? m.width : m.height };
  } catch { return null; }
}

// Все картинки карточек папки DIR: Map<файл public → fajl | null>. failPublic — путь файла по адресу со страницы.
export async function izmerit(DIR, failPublic) {
  const fajly = new Set();
  if (fs.existsSync(DIR)) for (const muzei of fs.readdirSync(DIR)) {
    const d = path.join(DIR, muzei);
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d).filter((n) => n.endsWith('.yaml'))) {
      for (const m of fs.readFileSync(path.join(d, f), 'utf8').matchAll(KARTINKA)) if (!/^https?:/i.test(m[1])) fajly.add(failPublic(muzei, m[1]));
    }
  }
  const mery = new Map();
  await Promise.all([...fajly].map(async (f) => mery.set(f, fs.existsSync(f) ? await opisat(f) : null)));
  return mery;
}

// Картинки сырой карточки: [объект, обязательны ли размеры по схеме].
function kartinkiKartochki(k) {
  const kadry = [...(k.figures ?? []), ...(k.story?.udary ?? []).map((u) => u?.kadr), ...[k.fakty ?? []].flat().flatMap((b) => b?.udary ?? []).map((u) => u?.kadr)];
  return [...(k.oblozhka ? [[k.oblozhka, true]] : []), ...kadry.filter((x) => x && typeof x === 'object').map((x) => [x, false])];
}

// Дописывает fajl и размеры в сырую карточку (до схемы); возвращает строки предупреждений о расхождении с ручными.
export function razmeryIzFajla(k, muzei, mery, failPublic, imya) {
  const preduprezhdeniya = [];
  for (const [o, nuzhny] of kartinkiKartochki(k)) {
    if (typeof o.src !== 'string' || /^https?:/i.test(o.src)) continue;
    const f = mery.get(failPublic(muzei, o.src));
    if (!f) continue;
    o.fajl = f;
    const ruchnye = o.width != null || o.height != null;
    if (ruchnye && (o.width !== f.width || o.height !== f.height)) {
      preduprezhdeniya.push(`${imya}: ${o.src} — в карточке ${o.width}×${o.height}, в файле ${f.width}×${f.height}${IZ_FAJLA ? ' (взято из файла)' : ''}`);
      if (IZ_FAJLA) Object.assign(o, { width: f.width, height: f.height });
    } else if (!ruchnye && (nuzhny || IZ_FAJLA)) Object.assign(o, { width: f.width, height: f.height });
  }
  return preduprezhdeniya;
}
