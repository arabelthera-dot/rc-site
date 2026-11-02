// Жанр G7 «Угадай и проверь масштабом» (r554): ползунок-догадка → проверка: предмет дня уходит к настоящей цифре
// мимо привычных эталонов → насколько ошибся → факт дня. Вариации: а глубина, б мороз (в скорость, г сколько штук — позже).
import fs from 'node:fs';
import YAML from 'yaml';
import { obshchieDannye, vybratUdary, shablonom, jsonVHtml, chislo, krasivo, god } from '../obshchee/dannye.mjs';

const P = new URL('./', import.meta.url);
const ETALONY = YAML.parse(fs.readFileSync(new URL('etalony.yaml', P), 'utf8'));
export const id = 'masshtab', css = 'zhanr-masshtab', nazvanie = 'Угадай и проверь масштабом';
export const faily = { shablon: new URL('shablon.html', P), dvizhok: new URL('dvizhok.js', P), css: new URL('zhanr-masshtab.css', P) };

// Вариация — по единице главной цифры дня: метры → глубина, кельвины/градусы → мороз.
const VARIACII = [
  // smotri — что происходит на шкале при проверке (предмет дня — не всегда вещь: у 22 янв. это «Теория сверхтекучести»).
  { id: 'glubina', ed: /^м$/, deystvie: 'угадай, на какую глубину ушёл', smotri: (p) => `${p} уходит вниз`, v: (x) => x },
  { id: 'moroz', ed: /^(К|°C)$/, deystvie: 'угадай, какой нужен мороз', smotri: () => 'мороз крепнет, снимок опускается по термометру', v: (x, ed) => (ed === 'К' ? x - 273.15 : x) },
];
const edinicaPlashki = (s) => (String(s.v).match(/(°C|К|м)\s*$/) || [])[1];

export function dannye(d, den, raspisanie) {
  const x = obshchieDannye(d);
  // Вариация из расписания (G7а глубина, G7б мороз) — ищем плашку в её единице; без расписания — первая подходящая.
  const nado = raspisanie?.variaciya ? VARIACII.filter((v) => v.id === raspisanie.variaciya) : VARIACII;
  const st = x.stamp.find((s) => !god(s.v) && nado.some((v) => v.ed.test(edinicaPlashki(s) || '')));
  if (!st) throw new Error(`${x.key}: нет плашки с цифрой ${nado.length === 1 ? (nado[0].id === 'glubina' ? 'в метрах' : 'в градусах') : 'в метрах или градусах'} — жанру G7 нечего угадывать`);
  const ed = edinicaPlashki(st), V = VARIACII.find((v) => v.ed.test(ed)), E = ETALONY[V.id];
  const cel = V.v(chislo(st.v), ed);
  // Свои метки дня — другие плашки в той же единице («600 м у обычной АПЛ»), плюс эталоны жанра.
  const metki = [...x.stamp.filter((s) => s !== st && edinicaPlashki(s) === ed).map((s) => ({ v: V.v(chislo(s.v), ed), k: s.k })),
    ...E.etalony.map((t) => ({ v: t.v, k: t.k, etalon: true }))];
  const kon = E.shkala[1] ?? Math.ceil(Math.max(cel, ...metki.map((m) => m.v)) * 1.15 / 100) * 100;
  const shkala = [E.shkala[0], kon];
  const pokazat = (v) => `${krasivo(v, Math.abs(v) < 10 ? 2 : 1)} ${E.edinica}`;
  const vRaz = V.id === 'glubina' ? E.etalony[0] : null;   // «это N башен»
  const udary = vybratUdary(x, { min: 3, max: 6, chtenie: 700 });
  return { ...x, zhanr: id, variant: V.id, deystvie: V.deystvie, smotri: V.smotri(x.predmet), cifra: st, cel, celTekst: pokazat(cel), edinica: E.edinica,
    shkala, metki: metki.sort((a, b) => Math.abs(a.v) - Math.abs(b.v)).map((m) => ({ ...m, tekst: pokazat(m.v) })),
    vRaz: vRaz && { v: vRaz.v, k: vRaz.k, raz: krasivo(cel / vRaz.v, 1) }, udary, n: udary.length,
    istochnikiEtalonov: E.etalony.map((t) => `${t.k} — ${t.istochnik}`).join('; ') };
}

export function html(x, shablon) {
  const kulm = x.variant === 'glubina'
    ? `${x.predmet} на ${x.celTekst}${x.vRaz ? ` — ${x.vRaz.raz} ${x.vRaz.k.replace(/^высота /, 'высоты ')}` : ''}`
    : `${x.celTekst}: ${x.cifra.k}`;
  const pole = {
    predmet: x.predmet, h2: `${x.predmet}: ${x.deystvie}`, img_src: x.img.src, img_alt: x.img.alt, img_podpis: x.img.podpis,
    alt_sceny: `Шкала ${x.variant === 'glubina' ? 'глубины' : 'температуры'} от ${krasivo(x.shkala[0])} до ${krasivo(x.shkala[1])} ${x.edinica}, на ней снимок: ${x.img.alt}`,
    // Концы ползунка — целые: иначе шаг считается от −273,15 и догадка «20 °C» показывается как 19,9.
    min: Math.ceil(Math.min(...x.shkala)), max: Math.floor(Math.max(...x.shkala)), start: x.shkala[0], edinica: x.edinica,
    shag: x.variant === 'glubina' ? 10 : 1, cifra_v: x.cifra.v, cifra_k: x.cifra.k, fakt: x.fakt, n: x.n,
    seychas: 'Двигай ползунок: поставь свою догадку и нажми «Проверить».',
    zachem: `${x.h1}. Сначала угадай цифру сам, потом посмотри её в масштабе — рядом с тем, что знаешь.`,
    metki_spisok: x.metki.map((m) => m.tekst + ' — ' + m.k).join('; '),
    istochnik: `плашки, история, первенство и снимок карточки дня; эталоны: ${x.istochnikiEtalonov}`,
  };
  return shablonom(shablon, { ...pole, json: jsonVHtml({ variant: x.variant, cel: x.cel, celTekst: x.celTekst, shkala: x.shkala, edinica: x.edinica,
    metki: x.metki, udary: x.udary, kulminaciya: kulm, smotri: x.smotri, predmet: x.predmet, seychas: pole.seychas }) });
}

// 3D-сцена rc3d, если есть модель предмета: догадка — выбор из четырёх, исход — предмет уходит к настоящей цифре.
export function scena3d(x, model) {
  const L = Math.abs(x.shkala[1] - x.shkala[0]), Y = (v) => -Math.abs(v - x.shkala[0]) / L * 12;
  const vars = [...new Set([0.35, 0.6, 1, 1.4].map((k) => Math.round(x.cel * k / (x.variant === 'glubina' ? 50 : 10)) * (x.variant === 'glubina' ? 50 : 10)))];
  vars[2] = x.cel;
  const opts = vars.map((v, i) => ({ id: 'v' + i, label: krasivo(v) + ' ' + x.edinica }));
  const spusk = (v) => [{ t: 0, do: 'count', text: '{v} ' + x.edinica, from: x.shkala[0], to: v, dur: 6 },
    { t: 0, do: 'move', id: 'predmet', to: [0, Y(v), 0], dur: 6, ease: 'inout' }, { t: 0, do: 'camera', look: [0, Y(v), 0], pos: [4, Y(v) + 1.2, 6], dur: 6 }];
  return {
    id: 'zhanr-' + x.key, title: `${x.predmet}: ${x.deystvie}`, glavnye: ['predmet'], istochniki: 'Игра собрана программой из карточки дня.',
    env: { sky: x.variant === 'glubina' ? 'night' : 'space', ground: 'none', fogDensity: x.variant === 'glubina' ? 0.03 : 0.004 },
    camera: { pos: [4, 1.2, 6], look: [0, 0, 0], min: 2, max: 40 },
    objects: [{ id: 'predmet', type: 'model', src: model.src }, ...x.metki.map((m, i) => ({ id: 'metka' + i, type: 'dot', pos: [-1.6, Y(m.v), 0], size: 0.35, color: m.etalon ? '#7fb4ff' : '#e4c97a' }))],
    igra: {
      title: `Игра в 3D: ${x.predmet}`, kicker: 'Угадай и проверь масштабом · 3D', button: 'Проверить', resetLabel: 'Ещё раз',
      lead: `Выбери свою догадку и нажми «Проверить»: ${x.smotri} — до настоящей цифры.`,
      choices: [{ id: 'dogadka', label: 'Твоя догадка', options: opts }],
      outcomes: vars.map((v, i) => ({ id: 'o' + i, when: { dogadka: 'v' + i }, result: v === x.cel ? 'ok' : 'fail', reason: v === x.cel ? undefined : 'v' + i,
        timeline: [...spusk(x.cel), { t: 6.5, do: 'say', text: `Настоящая цифра — ${x.celTekst}. Твоя догадка — ${krasivo(v)} ${x.edinica}. ${x.fakt}` }],
        text: `${x.celTekst}. ${x.fakt}` })),
      rules: { zachem: x.h1, shagi: ['**Выбери догадку** под сценой.', '**Нажми «Проверить»** — предмет уйдёт к настоящей цифре.'], final: 'Финал: факт дня.' },
    },
  };
}
