// Субтитры и текст ролика дня (r725 п.131, п.138): файлы рядом с mp4 16:9 из реестра — day-<imya>.vtt (WebVTT, Language: ru)
// и day-<imya>.txt (сценарий озвучки дословно, сцена на строку). Их приносит scripts/rolik-na-sait.mjs из выпуска rc-rolik,
// текст уже стоящих роликов — scripts/rolik-tekst.mjs. Нет файла — нет дорожки и блока, страница как раньше.
// Путь дорожки — от корня сайта, как src роликов «Не сдаются»; ?v= — версия ролика: новый ролик, новые субтитры.
import fs from 'node:fs';
import path from 'node:path';

const PUB = path.join(process.cwd(), 'public');

export function rolikRyadom(video) {
  if (!video?.klyuch) return {};
  const f = path.join(PUB, 'video/registry', `${video.klyuch}.json`);
  if (!fs.existsSync(f)) return {};
  const h = JSON.parse(fs.readFileSync(f, 'utf8')).horizontal;
  if (!h?.local?.endsWith('.mp4')) return {};
  const ryadom = (x) => path.join(PUB, h.local.replace(/\.mp4$/, x));
  const vtt = ryadom('.vtt'), txt = ryadom('.txt');
  return {
    subtitry: fs.existsSync(vtt) && fs.readFileSync(vtt, 'utf8').startsWith('WEBVTT') ? `/${h.local.replace(/\.mp4$/, '.vtt')}?v=${h.v ?? 1}` : null,
    tekst: fs.existsSync(txt) ? fs.readFileSync(txt, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean) : null,
  };
}
