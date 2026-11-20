// Рассказ («Среда подвига») и викторина дня — только из утверждённого (Р627 п.1, Р831, r833): машина переносила
// из утверждённого одни факты (fakty-iz-utverzhdeno.mjs), а рассказ, вопросы, ответы без JS и вопрос возврата пришли
// со старой страницы и несли снятое при сверке (журнал ~/workspace/logs/brak-obshchiy-r832.tsv, строки 67–102).
// Правило одно на все дни музея, при сборке, yaml не переписывается:
//  · предложение рассказа остаётся, только если каждое его значимое слово (основа) и каждое число есть в тексте
//    утверждённых фактов дня; не прошло — предложения на странице нет; абзац без предложений уходит;
//  · вопрос остаётся, если так же проходят его вопрос и верный ответ (неверные варианты — нарочно неверные, их не
//    сверяем); пояснение к ответу — дословно предложение утверждённого факта, где больше всего слов вопроса и ответа;
//  · осталось меньше пяти вопросов — добор вопросами-пропусками из утверждённых фактов (voprosy-iz-faktov.mjs);
//  · рассказ: осталось меньше двух предложений — абзацы из подробностей первых утверждённых фактов дня дословно;
//  · ответы без JS и вопрос возврата («Вернись завтра») строятся из оставшихся вопросов;
//  · описание страницы для поисковиков не прошло — берётся заголовок первого утверждённого факта (хук дня).
// Слова утверждённого не меняются: машина только выбрасывает лишнее и берёт готовые предложения утверждённого.
// Образец — извлекающее (extractive) реферирование: в выдаче только предложения источника, ничего от себя
// (Nenkova, McKeown, «Automatic Summarization», 2011, https://www.cs.columbia.edu/~kathy/papers/Nenkova-McKeown-FTIR.pdf);
// подключено, как факты, — преобразование карточки при загрузке коллекции (Astro content collections).
// Выключатель RC_RASSKAZ_IZ_UTVERZHDENO=0 — прежний путь. Откат — убрать вызов в den-obshchee.mjs (proveritKartochku).
import fs from 'node:fs';
import path from 'node:path';
import { naObrazce } from './fakty-iz-utverzhdeno.mjs';
import { chernovik } from './voprosy-iz-faktov.mjs';

export const MUZEI = ['ne-sdayutsya'];
const vklyucheno = () => process.env.RC_RASSKAZ_IZ_UTVERZHDENO !== '0';

const bezTegov = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ');
// Служебные слова и слова вопроса — не факт, их в утверждённом может не быть.
const SLUZHEBNYE = new Set(('что как когда сколько какой какая какое какие каким какого какую какой каком какими каких почему зачем где куда откуда '
  + 'кто кого кому чем чём ком который которая которое которые которого которой котором которым которую которых '
  + 'этот эта это эти этого этой этом этим этих эту этому тот та то те того той том тем тех ту тому такой такая такое такие таким такого такую '
  + 'тогда потом после перед более менее очень также тоже только чтобы если было были была будет было есть быть был '
  + 'свой своя своё свое свои своего своей своих своим своими своему свою себя себе собой него нему ними нему неё нее ней ним них они она оно '
  + 'весь вся всё все всех всего всем всеми всей всю один одна одно одни одного одной одному одним '
  + 'сейчас здесь даже уже ещё еще ведь именно самый самая самое самые самым самого самой через между около лишь почти снова '
  + 'чего ничего никто нигде никогда потому поэтому однако хотя пока затем сначала также разве вместо вместе среди '
  + 'него ему его её ее их ими нем нём либо или ни не но да нет вот так там тут где-то кем каждый каждая каждое каждого '
  + 'верно неверно правда ответ ответа вопрос').split(' '));
const slova = (s) => (bezTegov(s).toLowerCase().replace(/ё/g, 'е').match(/[a-zа-я]+|\d+/g) ?? []);
const osnova = (w) => (/^\d+$/.test(w) ? w : w.length > 5 ? w.slice(0, 5) : w);
const znachimye = (s) => slova(s).filter((w) => /^\d+$/.test(w) || (w.length >= 3 && !SLUZHEBNYE.has(w))).map(osnova);
// Нет основы в утверждённом — список недостающих (пусто — предложение из утверждённого).
const lishnee = (s, korpus) => [...new Set(znachimye(s).filter((o) => !korpus.has(o)))];

// Предложения абзаца; теги, разорванные границей предложения, снимаются у этого предложения.
const RAZBIVKA = /(?<=[.!?…»"])(?<![\s(][А-ЯЁ]\.)\s+(?=[А-ЯЁA-Z«"<\d—–-])/;
const celyeTegi = (s) => { const otkr = (s.match(/<(b|i|strong|em|a)\b/g) ?? []).length, zakr = (s.match(/<\/(b|i|strong|em|a)>/g) ?? []).length; return otkr === zakr ? s : bezTegov(s).replace(/\s+/g, ' ').trim(); };
const predlozheniyaUtv = (t) => bezTegov(t).replace(/\s+/g, ' ').trim().split(/(?<=[.!?…])(?<![\s(][А-ЯЁ]\.)\s+(?=[А-ЯЁ«\d])/).filter((s) => s.length > 15);

export function rasskazIzUtverzhdeno(syroe, muzei, key, koren = '.') {
  const f = path.join(koren, 'src/data/utverzhdeno', muzei, `${key}.json`);
  if (!vklyucheno() || !MUZEI.includes(muzei) || !naObrazce(key, syroe) || !fs.existsSync(f)) return { syroe, vybrosheno: [] };
  const utv = JSON.parse(fs.readFileSync(f, 'utf8'));
  const teksty = utv.fakty.map((x) => `${x.zagolovok} ${x.podrobnee}`);
  const korpus = new Set(teksty.flatMap(znachimye));
  const vybrosheno = [], d = { ...syroe };
  const gde = (chto, t) => vybrosheno.push(`${muzei}/${key} ${chto}: «${bezTegov(t).replace(/\s+/g, ' ').trim().slice(0, 90)}» — нет в утверждённом: ${lishnee(t, korpus).join(', ')}`);

  if (d.story?.abzacy) {
    const abzacy = d.story.abzacy.map((a) => {
      const kusochki = String(a).split(RAZBIVKA);
      const ostalis = kusochki.filter((p) => { const ok = !lishnee(p, korpus).length; if (!ok) gde('рассказ', p); return ok; });
      return ostalis.length === kusochki.length ? a : ostalis.map(celyeTegi).join(' ');
    }).filter((a) => bezTegov(a).trim());
    const pervye = (utv.poryadok?.length ? utv.poryadok : utv.fakty.map((x) => x.n)).map((n) => utv.fakty.find((x) => x.n === n)).filter(Boolean);
    const zapas = pervye.slice(0, 2).map((x) => String(x.podrobnee).trim()).filter(Boolean);
    d.story = { ...d.story, abzacy: abzacy.join(' ').split(RAZBIVKA).filter((p) => bezTegov(p).trim()).length >= 2 ? abzacy : zapas };
  }

  if (d.quiz?.voprosy) {
    const vse = utv.fakty.flatMap((x) => [...predlozheniyaUtv(x.zagolovok), ...predlozheniyaUtv(x.podrobnee)]);
    const ostalis = d.quiz.voprosy.filter((v) => {
      const t = `${v.q} ${v.o?.[v.a] ?? ''}`, ok = !lishnee(t, korpus).length;
      if (!ok) gde('вопрос', t);
      return ok;
    }).map((v) => {
      const nuzhno = new Set(znachimye(`${v.q} ${v.o[v.a]}`)), otvet = new Set(znachimye(v.o[v.a]));
      // Лучшее предложение: сначала слова верного ответа, потом слова вопроса.
      const ochki = (s) => { const z = new Set(znachimye(s)); let o = 0; for (const x of otvet) if (z.has(x)) o += 10; for (const x of nuzhno) if (z.has(x)) o += 1; return o; };
      const luchshee = vse.reduce((a, s) => (ochki(s) > ochki(a) ? s : a), vse[0] ?? '');
      return { ...v, e: luchshee };
    });
    // Добор — без повтора: ни того же ответа, ни того же предложения-объяснения.
    const est = new Set(ostalis.flatMap((v) => [znachimye(v.o[v.a]).join(' '), v.e]));
    const dobor = chernovik(muzei, key, koren).voprosy.filter((v) => !est.has(znachimye(v.o[v.a]).join(' ')) && !est.has(v.e))
      .map(({ q, o, a, e }) => ({ q, o, a, e })).slice(0, Math.max(0, 5 - ostalis.length));
    const voprosy = [...ostalis, ...dobor];
    const noscript = voprosy.length ? `Для викторины нужен JavaScript. Ответы: ${voprosy.map((v, i) => `${i + 1} — ${bezTegov(v.o[v.a]).trim()}`).join('; ')}.` : 'Для викторины нужен JavaScript.';
    d.quiz = { ...d.quiz, voprosy, noscript, ...(/\d+\s+вопрос/.test(d.quiz.kicker ?? '') && { kicker: d.quiz.kicker.replace(/\d+\s+вопрос[а-я]*/, `${voprosy.length} ${voprosy.length === 1 ? 'вопрос' : voprosy.length < 5 ? 'вопроса' : 'вопросов'}`) }) };
    if (d.return && lishnee(`${d.return.q} ${d.return.a}`, korpus).length) {
      gde('вопрос возврата', `${d.return.q} ${d.return.a}`);
      d.return = voprosy[0] ? { ...d.return, q: voprosy[0].q, a: bezTegov(voprosy[0].o[voprosy[0].a]).trim() } : d.return;
    }
  }

  if (d.head?.description && lishnee(d.head.description, korpus).length) {
    gde('описание', d.head.description);
    const pervyj = utv.fakty.find((x) => x.n === (utv.poryadok?.[0] ?? utv.fakty[0]?.n));
    if (pervyj) d.head = { ...d.head, description: bezTegov(pervyj.zagolovok).trim() };
  }
  return { syroe: d, vybrosheno };
}
