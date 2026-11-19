// Память переводов и словарь терминов (п.141 очереди 2, Р603). Память — уже переведённые строки всех дней
// (src/data/perevod/*.json): одна и та же русская строка второй раз в переводчик не идёт, берётся готовый перевод,
// если его отпечаток совпадает с русским текстом (п.44). Словарь — src/data/perevod-slovar.tsv: имя в русской строке
// есть, а в переводе его нет — подсказка в журнал, перевод не останавливается (Р627).
// Как в мире: translation memory и glossary — https://docs.weblate.org/en/latest/user/translating.html#translation-memory
// и https://docs.weblate.org/en/latest/user/glossary.html .
import fs from 'node:fs';
import path from 'node:path';
import { otpechatok } from './otpechatok.mjs';

/** { code: Map(русский текст → перевод) } из свежих переводов (отпечаток совпадает). */
export function pamyat(papka = 'src/data/perevod') {
  const out = {};
  if (!fs.existsSync(papka)) return out;
  for (const f of fs.readdirSync(papka).filter((x) => x.endsWith('.json'))) {
    const fayl = JSON.parse(fs.readFileSync(path.join(papka, f), 'utf8'));
    for (const [code, stroki] of Object.entries(fayl)) {
      if (code.startsWith('_') || code === 'ru' || !stroki || typeof stroki !== 'object') continue;
      for (const [k, perevod] of Object.entries(stroki)) {
        const ru = fayl.ru?.[k];
        if (ru && fayl._otpechatki?.[code]?.[k] === otpechatok(ru)) (out[code] ??= new Map()).set(ru, perevod);
      }
    }
  }
  return out;
}

/** Строки словаря: [{ ru: RegExp, code: перевод }]. */
export function slovar(fayl = 'src/data/perevod-slovar.tsv') {
  if (!fs.existsSync(fayl)) return [];
  const stroki = fs.readFileSync(fayl, 'utf8').split('\n').filter((s) => s && !s.startsWith('#'));
  const kody = stroki.shift().split('\t');
  return stroki.map((s) => {
    const kl = s.split('\t');
    return Object.fromEntries(kody.map((c, i) => [c, c === 'ru' ? new RegExp(kl[i], 'u') : kl[i] ?? '']));
  });
}

/** Подсказки: имя из словаря есть в русской строке, а его перевода нет в переводе. */
export function podskazki(slova, ru, perevod, code) {
  return slova.filter((s) => s[code] && s.ru.test(ru) && !perevod.includes(s[code])).map((s) => s[code]);
}
