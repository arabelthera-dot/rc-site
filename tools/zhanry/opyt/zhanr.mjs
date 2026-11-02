// Жанр G14 «Опыт» (r554): ты в лаборатории — держишь «Раскрутить»/«Нагреть», параметр растёт, на каждой ступени —
// шаг истории дня; дошёл до порога — вау (волчок рисует узор и не падает; в бублике загорается «солнце») → факт дня.
// Вариации: а раскрути, б нагрей (в смешай, г охлади — позже).
import { obshchieDannye, vybratUdary, shablonom, jsonVHtml, chislo, god, kadrPo } from '../obshchee/dannye.mjs';

const P = new URL('./', import.meta.url);
export const id = 'opyt', css = 'zhanr-opyt', nazvanie = 'Опыт';
export const faily = { shablon: new URL('shablon.html', P), dvizhok: new URL('dvizhok.js', P), css: new URL('zhanr-opyt.css', P) };

const VARIACII = [
  { id: 'raskruti', slova: /волч|вращ|раскру|гироскоп|твёрдого тела/i, knopka: 'Раскрутить', deystvie: 'раскрути и не дай упасть',
    parametr: 'Обороты', kadr: /волч|гироскоп/i,
    // Если день про волчок (а предмет дня — человек, как у Ковалевской), в игре крутится волчок.
    ob: (x) => (/волч/i.test(x.zagolovok + ' ' + x.udaryVse.join(' ')) ? 'Волчок' : x.predmet),
    kulm: (ob) => `${ob} раскрутился до конца — рисует в воздухе узор и не падает` },
  { id: 'nagrey', slova: /гиротрон|плазм|нагре|луч|термояд|печ|сверхтекуч/i, knopka: 'Добавить мощности', deystvie: 'разгони мощность до порога',
    parametr: 'Мощность', kadr: /гиротрон|установк|плазм|токамак/i, ob: (x) => x.predmet,
    kulm: (ob) => `${ob} на полной мощности: в бублике установки загорается «маленькое солнце»` },
];
// Ступени параметра — плашки дня в одной физической единице (6 Вт → 1 МВт), по росту.
const ED = { Вт: 1, кВт: 1e3, МВт: 1e6, ГВт: 1e9 };
const edPlashki = (s) => (String(s.v).match(/(ГВт|МВт|кВт|Вт)\s*$/) || [])[1];

export function dannye(d, den, raspisanie) {
  const x = obshchieDannye(d);
  // Вариация — из расписания (r554: G14а/б), иначе по словам дня.
  const V = (raspisanie?.variaciya && VARIACII.find((v) => v.id === raspisanie.variaciya)) || VARIACII.find((v) => v.slova.test(x.zagolovok)) || VARIACII[1];
  const stupeni = x.stamp.filter((s) => !god(s.v) && edPlashki(s)).map((s) => ({ v: s.v, k: s.k, w: chislo(s.v) * ED[edPlashki(s)] })).sort((a, b) => a.w - b.w);
  const udary = vybratUdary(x, { min: 4, max: 6, chtenie: 700 });
  const ob = V.ob(x);
  return { ...x, ob, img: kadrPo(x, V.kadr), zhanr: id, variant: V.id, knopka: V.knopka, deystvie: V.deystvie, parametr: V.parametr, kulminaciya: V.kulm(ob),
    stupeni: stupeni.length >= 2 ? stupeni : null, udary, n: udary.length, cifra: stupeni.at(-1) || x.stamp.find((s) => !god(s.v)) || x.stamp[0] };
}

export function html(x, shablon) {
  const pole = {
    predmet: x.predmet, h2: `${x.ob}: ${x.deystvie}`, knopka: x.knopka, n: x.n, parametr: x.parametr,
    img_src: x.img.src, img_alt: x.img.alt, img_podpis: x.img.podpis, cifra_v: x.cifra.v, cifra_k: x.cifra.k, fakt: x.fakt,
    alt_sceny: `${x.variant === 'raskruti' ? 'Волчок над снимком дня: чем быстрее, тем ярче узор' : 'Кольцо установки над снимком дня: чем больше мощность, тем ярче свечение'}. Снимок: ${x.img.alt}`,
    seychas: `Держи кнопку «${x.knopka}» (или жми часто) — шкала растёт, отпустишь — падает.`,
    zachem: `${x.h1}. Повтори опыт сам: доведи ${x.parametr.toLowerCase()} до порога и посмотри, что получится.`,
    kulminaciya: x.kulminaciya, istochnik: 'плашки, история, первенство и снимок карточки дня',
  };
  return shablonom(shablon, { ...pole, json: jsonVHtml({ variant: x.variant, udary: x.udary, stupeni: x.stupeni, parametr: x.parametr,
    kulminaciya: x.kulminaciya + '.', seychas: pole.seychas }) });
}

// 3D-сцена rc3d, если есть модель предмета: выбор силы опыта, мало — предмет падает/гаснет, до порога — вау.
export function scena3d(x, model) {
  const raskr = x.variant === 'raskruti';
  const opts = [{ id: 'malo', label: 'Чуть-чуть' }, { id: 'sredne', label: 'Наполовину' }, { id: 'porog', label: 'До порога' }];
  const neudacha = (k) => raskr ? [{ t: 0, do: 'rotate', id: 'predmet', spin: [0, 360 * k, 0] }, { t: 2, do: 'rotate', id: 'predmet', spin: [0, 0, 0] }, { t: 2, do: 'rotate', id: 'predmet', to: [0, 0, 70], dur: 1.2, ease: 'in' }]
    : [{ t: 0, do: 'glow', id: 'predmet', to: 0.3 * k, dur: 2 }, { t: 0, do: 'emit', id: 'iskry', level: 0.3 * k, dur: 1 }, { t: 3, do: 'stop', id: 'iskry', dur: 1 }];
  return {
    id: 'zhanr-' + x.key, title: `${x.ob}: ${x.deystvie}`, glavnye: ['predmet'], istochniki: 'Игра собрана программой из карточки дня.',
    env: { sky: 'night', ground: 'none' }, camera: { pos: [3, 1.6, 4], look: [0, 0.5, 0], min: 1.5, max: 20 },
    objects: [{ id: 'predmet', type: 'model', src: model.src }], fx: [{ id: 'iskry', kind: 'sparks', pos: [0, 0.6, 0], size: 0.4 }],
    igra: {
      title: `Опыт в 3D: ${x.predmet}`, kicker: 'Опыт · 3D', button: x.knopka, resetLabel: 'Ещё раз',
      lead: `Выбери, насколько ${raskr ? 'раскрутить' : 'нагреть'}, и нажми «${x.knopka}».`,
      choices: [{ id: 'sila', label: x.parametr, options: opts }],
      outcomes: [
        { id: 'malo', when: { sila: 'malo' }, result: 'fail', reason: 'malo', timeline: neudacha(1), text: raskr ? 'Мало оборотов — волчок завалился.' : 'Мало мощности — ничего не загорелось.' },
        { id: 'sredne', when: { sila: 'sredne' }, result: 'fail', reason: 'sredne', timeline: neudacha(2), text: 'Не хватило до порога.' },
        { id: 'porog', when: { sila: 'porog' }, result: 'ok', text: `${x.kulminaciya}. ${x.fakt}`,
          timeline: raskr ? [{ t: 0, do: 'rotate', id: 'predmet', spin: [0, 1440, 0] }, { t: 0, do: 'emit', id: 'iskry', level: 1, dur: 1 }, { t: 6, do: 'say', text: x.fakt }]
            : [{ t: 0, do: 'glow', id: 'predmet', to: 1, dur: 3 }, { t: 0, do: 'emit', id: 'iskry', level: 1, dur: 2 }, { t: 3, do: 'flash', power: 4000, color: '#ff9a4a' }, { t: 6, do: 'say', text: x.fakt }] },
      ],
      rules: { zachem: x.h1, shagi: ['**Выбери силу опыта** под сценой.', `**Нажми «${x.knopka}»** и смотри.`], final: 'Финал: факт дня.' },
    },
  };
}
