// Стандарт дня (Р660): каждый день карточки страницы src/content/dni-shablon с ключом 02-01 и дальше, любой музей,
// не собирается без любого из 29 пунктов. Что значит каждый пункт, поле и пример — docs/standart-dnya.md (единственный
// источник для помощников); поля и типы — src/lib/forma-dnya.mjs (форма Р635). Январь (ключ до 02-01) не проверяется.
// Возвращает список строк «ММ-ДД музей: нет пункта N — …»; загрузчик (zagruzitKartochki) собирает их по всем карточкам.
import { NET, wiki } from './forma-dnya.mjs';
import { MEHANIKI, igraDannymi } from './igry-mehaniki.ts';

export const STANDART_S = '02-01';
// Пункты очереди Р660; 19 и 27 — только «Русские не сдаются», 76 — только изобретения (там игра дня).
export const PUNKTY = [1, 2, 3, 4, 5, 6, 8, 9, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 27, 28, 29, 30, 40, 76, 88, 89, 164, 170];
// Переход на новый стиль: 1 (14) февраля 1918 г.; раньше — нужна дата по старому стилю (п. 5).
const NOVYJ_STIL = '1918-02-14';
const HTML = /<\/?[a-z][^>]*>|\*\*|&[a-z]+;/i;
const KOMBINIRUEMYE = /[̀-ͯ]/;
// Не текст страницы: код скриптов и разметка поисковиков (п. 40 их не проверяет; п. 170 — проверяет).
const NE_TEKST = (put) => put[0] === 'skripty' || (put[0] === 'head' && put[1] === 'ld');

const est = (v) => v !== undefined && v !== null && v !== '';
const obojti = (v, put, fn) => {
  if (typeof v === 'string') fn(v, put);
  else if (Array.isArray(v)) v.forEach((x, i) => obojti(x, [...put, i], fn));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) obojti(x, [...put, k], fn);
};
const imya = (put) => put.join('.');
const kratko = (spisok, n = 4) => spisok.length > n ? `${spisok.slice(0, n).join(', ')} и ещё ${spisok.length - n}` : spisok.join(', ');
// Одно предложение: после конца предложения не идёт новое с заглавной; цитата в «» — внутри предложения.
const predlozhenij = (s) => s.replace(/«[^»]*»/g, '«»').split(/[.!?…]+\s+(?=[А-ЯЁA-Z])/).length;
const godDaty = (d) => Number(d.split('-')[0]);
const polnayaData = (d) => d.replace(/^(\d{1,4})-/, (_, g) => `${g.padStart(4, '0')}-`);

// Картинки дня: обложка, кадры, кадры у ударов истории и фактов.
const kartinki = (d) => [
  ...(d.oblozhka ? [['oblozhka', d.oblozhka]] : []),
  ...(d.figures ?? []).map((k, i) => [`figures.${i}`, k]),
  ...(d.story?.udary ?? []).flatMap((u, i) => (u.kadr ? [[`story.udary.${i}.kadr`, u.kadr]] : [])),
  ...[d.fakty ?? []].flat().flatMap((b) => b.udary.flatMap((u, i) => (u.kadr ? [[`${b.id}.udary.${i}.kadr`, u.kadr]] : []))),
];
const udaryFaktov = (d) => [d.fakty ?? []].flat().flatMap((b) => b.udary.map((u, i) => [`${b.id}.udary.${i}`, u]));

export function standartDnya(d, syroe = d) {
  if (d.key < STANDART_S) return [];
  const net = [];
  const p = (n, chto) => net.push(`${d.key} ${d.muzei}: нет пункта ${n} — ${chto}`);
  const ns = d.muzei === 'ne-sdayutsya', izob = d.muzei === 'izobreteniya';
  const kart = kartinki(d), fakty = udaryFaktov(d);
  // Картинки без поля: по одной строке на пункт, с перечнем картинок.
  const uKartinok = (n, chto, plokho) => {
    const bez = kart.filter(([, k]) => plokho(k)).map(([put]) => put);
    if (bez.length) p(n, `${chto}: ${kratko(bez)}`);
  };
  const uFaktov = (n, chto, plokho) => {
    const bez = fakty.filter(([, u]) => plokho(u)).map(([put]) => put);
    if (bez.length) p(n, `${chto}: ${kratko(bez)}`);
  };

  // 1. Номер дня.
  if (!est(d.nomer_dnya)) p(1, 'nomer_dnya (постоянный номер дня, латиница-цифры-дефис)');
  // 2. Хук: одно предложение, до 200 знаков, без вопроса.
  const hook = d.lead?.hook ?? '';
  if (!hook) p(2, 'lead.hook');
  else {
    if (predlozhenij(hook) > 1) p(2, 'lead.hook — одно предложение, сейчас больше');
    if (hook.length > 200) p(2, `lead.hook — не длиннее 200 знаков, сейчас ${hook.length}`);
    if (hook.includes('?')) p(2, 'lead.hook — без вопроса «?»');
  }
  // 3. Дата и что случилось; у изобретений дата события — день страницы (или data_uslovnaya — почему другой).
  if (!est(d.data_sobytiya)) p(3, 'data_sobytiya (ГГГГ-ММ-ДД)');
  if (!est(d.chto_sluchilos)) p(3, 'chto_sluchilos (что случилось в этот день, одной фразой)');
  if (izob && est(d.data_sobytiya) && d.data_sobytiya.slice(-5) !== d.key && !(d.key === '02-28' && d.data_sobytiya.slice(-5) === '02-29') && !est(d.data_uslovnaya))
    p(3, `data_sobytiya ${d.data_sobytiya} не в день страницы ${d.key} — нужна data_uslovnaya (почему день другой)`);
  // 4. Год числом, равный году даты, и точность года.
  if (!Number.isInteger(d.god)) p(4, 'god (год события числом)');
  else if (est(d.data_sobytiya) && godDaty(d.data_sobytiya) !== d.god) p(4, `god ${d.god} не совпадает с годом data_sobytiya ${d.data_sobytiya}`);
  if (!est(d.god_tochnost)) p(4, 'god_tochnost (tochno | okolo | desyatiletie | vek)');
  // 5. Старый стиль: до 14.02.1918 — обязателен, после — не ставится.
  if (est(d.data_sobytiya)) {
    const do1918 = polnayaData(d.data_sobytiya) < NOVYJ_STIL;
    if (do1918 && !est(d.data_staryj_stil)) p(5, `data_staryj_stil — событие до ${NOVYJ_STIL}, нужна дата по старому стилю`);
    if (!do1918 && est(d.data_staryj_stil)) p(5, `data_staryj_stil стоит у события после ${NOVYJ_STIL} — убрать`);
  }
  // 6. Год показа; «в этом году» в тексте нет (через год страница соврёт).
  if (!Number.isInteger(d.god_pokaza)) p(6, 'god_pokaza (год, в котором день стоит на сайте)');
  const vEtomGodu = [];
  obojti(syroe, [], (s, put) => { if (/в этом году/i.test(s)) vEtomGodu.push(imya(put)); });
  if (vEtomGodu.length) p(6, `«в этом году» в тексте: ${kratko(vEtomGodu)}`);
  // 8. Вес дня.
  if (!est(d.ves)) p(8, 'ves (glavnoe | vtoroe | obychnoe)');
  // 9. Тяжёлая тема: поле всегда, «нет» — тоже ответ.
  if (d.tyazhelaya_tema === undefined || (Array.isArray(d.tyazhelaya_tema) && !d.tyazhelaya_tema.length))
    p(9, `tyazhelaya_tema ('${NET}' или список тем)`);
  // 13. id у каждого факта, без повторов.
  uFaktov(13, 'id у факта', (u) => !est(u.id));
  const ids = fakty.map(([, u]) => u.id).filter(est);
  const povtory = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (povtory.length) p(13, `id фактов повторяются: ${kratko(povtory)}`);
  // 14. Источник у каждого факта — из istochniki дня.
  const istIds = new Set((d.istochniki ?? []).map((s) => s.id));
  uFaktov(14, 'istochnik у факта', (u) => !est(u.istochnik));
  uFaktov(14, 'istochnik факта не найден в istochniki', (u) => est(u.istochnik) && !istIds.has(u.istochnik));
  // 15. Источники дня: есть, база из списка (схема), без вики.
  if (!d.istochniki?.length) p(15, 'istochniki (список источников дня)');
  const vikiIst = (d.istochniki ?? []).filter((s) => wiki.test(s.ssylka ?? '') || wiki.test(s.nazvanie)).map((s) => s.id);
  if (vikiIst.length) p(15, `источник из Википедии запрещён (Р90): ${kratko(vikiIst)}`);
  // 16. Цитаты: поле есть, пусто — тоже ответ.
  if (!Array.isArray(d.citaty)) p(16, 'citaty (список цитат, можно [])');
  // 17. Величина дня.
  for (const k of ['velichina_chislo', 'velichina_edinica', 'velichina_chto']) if (!est(d[k])) p(17, k);
  // 18. Годен ли факт для вопроса; если да — ответ, и он единственный.
  uFaktov(18, 'dlya_voprosa у факта', (u) => typeof u.dlya_voprosa !== 'boolean');
  uFaktov(18, 'otvet и otvet_edinstvennyj: true у факта для вопроса', (u) => u.dlya_voprosa === true && (!est(u.otvet) || u.otvet_edinstvennyj !== true));
  // 19. «Русские не сдаются»: часть, операция, фронт.
  if (ns) for (const k of ['voinskaya_chast', 'operaciya', 'front']) if (!est(d[k])) p(19, k);
  // 20–29 — по каждой картинке дня.
  if (!kart.length) p(20, 'у дня нет ни одной картинки (oblozhka, figures)');
  uKartinok(20, 'prava (паспорт прав) у картинки', (k) => !k.prava);
  uKartinok(20, 'в prava нет god_sozdaniya, god_smerti_avtora, god_reabilitacii или anonim', (k) => k.prava &&
    (!est(k.prava.god_sozdaniya) || !est(k.prava.god_smerti_avtora) || !est(k.prava.god_reabilitacii) || typeof k.prava.anonim !== 'boolean'));
  uKartinok(20, 'prava.pervaya_publikaciya у анонимной картинки', (k) => k.prava?.anonim === true && !est(k.prava.pervaya_publikaciya));
  uKartinok(20, 'prava из Википедии/Викисклада запрещены (Р90)', (k) => k.prava && (wiki.test(k.prava.otkuda) || wiki.test(k.prava.ssylka ?? '')));
  uKartinok(21, `nomer_predmeta, nomer_snimka и hranitel (значение или '${NET}')`, (k) => !est(k.nomer_predmeta) || !est(k.nomer_snimka) || !est(k.hranitel));
  uKartinok(23, 'podpis_chto, podpis_gde и podpis_kogda', (k) => !est(k.podpis_chto) || !est(k.podpis_gde) || !est(k.podpis_kogda));
  // 24. Этикетка обложки — 1–3 строки (длину держит схема).
  if (!d.etiketka_oblozhki?.length) p(24, 'etiketka_oblozhki (1–3 строки под обложкой)');
  if (ns) uKartinok(27, 'simvolika_proverena: true (символика проверена человеком)', (k) => k.simvolika_proverena !== true);
  uKartinok(28, 'podlinnik (gde, otkuda) — где хранится подлинник', (k) => !k.podlinnik);
  uKartinok(29, 'svyashchennoe (true/false)', (k) => typeof k.svyashchennoe !== 'boolean');
  const svyat = kart.filter(([, k]) => k.svyashchennoe === true).map(([put]) => put);
  const igraEst = d.igra && (d.igra.mehanika || d.igra.imya || d.igra.model3d || d.igra.rc3d);
  if (svyat.length && igraEst) p(29, `на дне со святыней (${kratko(svyat)}) игры быть не может — убрать igra`);
  // 30. Словарь сущностей дня (id проверяет схема по src/data/slovar.json).
  if (!d.slovar?.length) p(30, 'slovar (люди, места, народы, темы дня: «tip:id»)');
  // 40. Чистый текст: без HTML, ** и &-сущностей в текстовых полях.
  const html = [];
  obojti(syroe, [], (s, put) => { if (!NE_TEKST(put) && HTML.test(s)) html.push(imya(put)); });
  if (html.length) p(40, `HTML или разметка в тексте (${html.length}): ${kratko(html)}`);
  // 76, 88, 89, 164. Игра изобретений — данными по механике.
  if (izob) {
    const g = d.igra ?? {};
    if (g.imya || g.vtoraya) p(164, `своя разметка игры (igra.${g.imya ? 'imya' : 'vtoraya'}) — с ${STANDART_S} игра только данными (igra.mehanika)`);
    if (!est(g.mehanika) || !g.dannye) p(76, 'igra.mehanika и igra.dannye (игра данными по механике)');
    if (est(g.mehanika)) {
      const m = MEHANIKI[g.mehanika];
      if (!m) p(89, `механики «${g.mehanika}» нет в src/lib/igry-mehaniki.ts`);
      else if (!m.dvizhok || !m.dannye) p(88, `у механики «${g.mehanika}» нет движка данными (dvizhok, схема dannye)`);
      else if (g.dannye) {
        const ramka = Object.fromEntries(['mehanika', 'kicker', 'zagolovok', 'pravilo_ru', 'kak_igrat', 'istochnik_ru', 'dannye']
          .filter((k) => g[k] !== undefined).map((k) => [k, g[k]]));
        const r = igraDannymi.safeParse(ramka);
        if (!r.success) p(76, `igra не прошла схему механики: ${kratko(r.error.issues.map((i) => `${['igra', ...i.path].join('.')}: ${i.message}`), 3)}`);
      }
    }
  }
  // 170. Буквы в NFC, без комбинируемых знаков (ударения и «й» из двух знаков ломают поиск и озвучку).
  const nfc = [];
  obojti(syroe, [], (s, put) => { if (s !== s.normalize('NFC') || KOMBINIRUEMYE.test(s)) nfc.push(imya(put)); });
  if (nfc.length) p(170, `текст не в NFC или с комбинируемыми знаками: ${kratko(nfc)}`);
  return net;
}

// 1. Номер дня не повторяется у карточек с 02-01 (по всем музеям).
export function nomeraDnej(vse) {
  const byl = new Map(), net = [];
  for (const d of vse) {
    if (d.key < STANDART_S || !est(d.nomer_dnya)) continue;
    if (byl.has(d.nomer_dnya)) net.push(`${d.key} ${d.muzei}: нет пункта 1 — nomer_dnya «${d.nomer_dnya}» уже у ${byl.get(d.nomer_dnya)}`);
    else byl.set(d.nomer_dnya, `${d.key} ${d.muzei}`);
  }
  return net;
}
