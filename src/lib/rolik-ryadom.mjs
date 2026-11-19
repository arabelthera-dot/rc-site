// Ролик дня из реестра (r725 п.131, п.138; Р820): адрес mp4 16:9 и обложки, субтитры и текст — всё от записи выпуска
// public/video/registry/<klyuch>.json. Рядом с mp4 — day-<imya>.vtt (WebVTT, Language: ru) и day-<imya>.txt (сценарий
// озвучки дословно, сцена на строку). Их приносит scripts/rolik-na-sait.mjs из выпуска rc-rolik, текст уже стоящих
// роликов — scripts/rolik-tekst.mjs. Нет файла субтитров или текста — нет дорожки и блока.
// Адреса — от корня сайта, ?v= — версия выпуска (adres из reestr-rolikov.mjs): новый ролик — новые видео, обложка и субтитры.
// У дня есть video, а выпуска в реестре нет — сборка падает: битый плеер не выкладывается (как DenMedia.astro).
import fs from 'node:fs';
import path from 'node:path';
import { adres } from '../../scripts/reestr-rolikov.mjs';

const PUB = path.join(process.cwd(), 'public');
// Длина ролика на странице (Р830/Р831): заголовок «История в N секунд» и бейдж — от horizontal.sec записи выпуска,
// как title в scripts/rolik-na-sait.mjs и бейдж в museum-video.js (Math.round). Число в yaml дня отставало при замене ролика.
const sekund = (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'секунду' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'секунды' : 'секунд'}`;

export function rolikRyadom(video) {
  if (!video) return {};
  const f = path.join(PUB, 'video/registry', `${video.klyuch}.json`);
  if (!fs.existsSync(f)) throw new Error(`ролика «${video.klyuch}» нет в public/video/registry/ (файл ${video.klyuch}.json)`);
  const { horizontal: h, poster } = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (!h?.local?.endsWith('.mp4')) throw new Error(`${video.klyuch}: у выпуска нет horizontal.local *.mp4`);
  const ryadom = (x) => ({ local: h.local.replace(/\.mp4$/, x), v: h.v });
  const vtt = ryadom('.vtt'), txt = path.join(PUB, ryadom('.txt').local);
  const vttFail = path.join(PUB, vtt.local);
  const n = Number.isFinite(h.sec) ? Math.round(h.sec) : null;
  return {
    h2: n && /^История (в|за) /.test(video.h2 || '') ? `История в ${sekund(n)}` : video.h2,
    badge: n && video.suffix ? `${n} ${video.suffix}` : video.badge,
    mp4: adres(h),
    poster: poster?.local ? adres(poster) : null,
    subtitry: fs.existsSync(vttFail) && fs.readFileSync(vttFail, 'utf8').startsWith('WEBVTT') ? adres(vtt) : null,
    tekst: fs.existsSync(txt) ? fs.readFileSync(txt, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean) : null,
  };
}
