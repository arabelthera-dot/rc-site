// Отпечаток русского текста у перевода (п. 44, docs/perevod-standart.md): видно, какой перевод устарел.
// Файл строк (src/data/stroki.json, src/data/igry/stroki/*.json): { "_", "ru": { ключ: текст }, "<код>": { ключ: перевод } }.
// Рядом с переводом — раздел _otpechatki: { "<код>": { ключ: отпечаток русской строки, с которой переводили } }.
// Раздел отдельный: stroka() и igraNaYazyke() читают fayl[code][ключ] как раньше, переводы не меняют вид.
// Только для машины перевода (Node); в сборку и в браузер не идёт, проверкой сборки не служит (Р627).
import { createHash } from 'node:crypto';

/** Отпечаток строки: первые 16 знаков sha256 от текста в NFC (64 бита). */
export const otpechatok = (tekst) => createHash('sha256').update(tekst.normalize('NFC'), 'utf8').digest('hex').slice(0, 16);

/** Записать перевод вместе с отпечатком русской строки, с которой переводили. */
export function zapisatPerevod(fayl, code, kluch, perevod) {
  if (!(kluch in fayl.ru)) throw new Error(`нет русской строки «${kluch}»`);
  (fayl[code] ??= {})[kluch] = perevod;
  ((fayl._otpechatki ??= {})[code] ??= {})[kluch] = otpechatok(fayl.ru[kluch]);
  return fayl;
}

/** Переводы, которые надо сделать заново: русская строка сменилась, отпечатка нет или русской строки больше нет. */
export function ustarevshie(fayl) {
  const out = [];
  for (const [code, stroki] of Object.entries(fayl)) {
    if (code === 'ru' || code.startsWith('_')) continue;
    for (const kluch of Object.keys(stroki).filter((k) => !k.startsWith('_'))) {
      const byl = fayl._otpechatki?.[code]?.[kluch];
      const prichina = !(kluch in fayl.ru) ? 'net-ru' : !byl ? 'net-otpechatka' : byl !== otpechatok(fayl.ru[kluch]) ? 'ru-izmenilsya' : null;
      if (prichina) out.push({ code, kluch, prichina });
    }
  }
  return out;
}

/** Готовность перевода дня (п. 147): { "<код>": "ГГГГ-ММ-ДД" } — языки, где переведена каждая русская строка
 *  и ни одна не устарела; дата — сегодня, если язык писался в этот проход, иначе прежняя. */
export function gotovnost(fayl, kody, segodnya, pisalis = new Set()) {
  const staroe = new Set(ustarevshie(fayl).map((u) => u.code));
  const out = {};
  for (const code of kody) {
    if (staroe.has(code) || !Object.keys(fayl.ru).every((k) => k in (fayl[code] ?? {}))) continue;
    out[code] = pisalis.has(code) || !fayl._gotovo?.[code] ? segodnya : fayl._gotovo[code];
  }
  return out;
}
