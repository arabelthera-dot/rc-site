// Машина «утверждённая карточка → страница дня» — общая для всех музеев (Р514, Р516). Модуль музея даёт карточку,
// материал и ролик; ядро здесь: разбор привязки кадра, СТОП-правило, расстановка кадров, запись разделов в yaml.
// Кадр идёт к факту ТОЛЬКО по строке материала «к факту: N / обложка / галерея» («Факт к кадру: N (и M)» — то же).
// По смыслу и сходству слов машина ничего не угадывает: нет привязки, прочерк, номера нет в карточке, у факта нет цитаты
// или пометки, у дня нет ролика — останов с днём и номером, yaml не пишется.
// Модули: scripts/ns-iz-utverzhdennyh.mjs (Русские не сдаются), scripts/kartochka/izobreteniya.mjs (сверка, Р516).

// Строка привязки → { vid: 'fakt', nomera: [главный, ...также] } | { vid: 'obl' } | { vid: 'gal' } | { oshibka }.
// «обложка», «нет (обложка дня)» — обложка; «галерея», «нет (галерея)» — галерея; «6 (и 5)», «7, 14» — факты.
export function privyazka(raw) {
  const s = String(raw ?? '').replace(/\*\*/g, '').trim();
  if (!s) return { oshibka: 'нет строки «к факту: N / обложка / галерея»' };
  if (/^[—–-]/.test(s)) return { oshibka: 'в «к факту» прочерк «—» (даже с пометкой в скобках) — напишите номер факта, «обложка» или «галерея»' };
  const nomera = [...s.matchAll(/\d+/g)].map((m) => +m[0]);
  const obl = /обложк/i.test(s), gal = /галере/i.test(s);
  if (nomera.length && !obl && !gal && /^\d+(\s*(\(и\s*\d+\)|[,;]\s*\d+|и\s*\d+))*$/.test(s)) return { vid: 'fakt', nomera };
  if (!nomera.length && obl !== gal && /^(нет\s*)?\(?[^()\d]*\)?$/i.test(s)) return { vid: obl ? 'obl' : 'gal' };
  return { oshibka: `строка «к факту: ${s}» не разобрана — нужно «N», «N (и M)», «обложка» или «галерея»` };
}

// Один кадр — один объект: номер Госкаталога, иначе путь файла.
export const gkNomer = (k) => String(k?.data_source ?? '').match(/collections\?id=(\d+)/)?.[1] || String(k?.src ?? '').match(/(?:gk|goskatalog)-(\d{5,})/)?.[1] || '';
export const kadrId = (k) => gkNomer(k) || k.src;

// СТОП-правило. kartochka — номера фактов [n]; fakty — Map n → { otryvok, pometka, pometkaTekst } из материала;
// kadry — [{ n, privyazka, obekt }] (obekt — кадр карточки или null); video — объект ролика или строка-ошибка.
// Возвращает { oshibki: ['кадр 3: …', 'факт 7: …'], kadry: [{ ...kadr, p: privyazka(...) }] }.
export function proverit({ nomera, fakty, kadry, video, pometki, utverzhden }) {
  const oshibki = [], razobrannye = [];
  if (!utverzhden) oshibki.push('карточка: нет строки «Утверждено Сергеем ДД.ММ.ГГГГ» (и флага --utverzhden)');
  for (const k of kadry) {
    const p = privyazka(k.privyazka);
    if (p.oshibka) { oshibki.push(`кадр ${k.n}: ${p.oshibka}`); continue; }
    if (p.vid === 'fakt') { const chuzhie = p.nomera.filter((n) => !nomera.includes(n));
      if (chuzhie.length) { oshibki.push(`кадр ${k.n}: факта ${chuzhie.join(', ')} нет в утверждённой карточке (там ${nomera.join(', ')})`); continue; } }
    if (!k.obekt) { oshibki.push(`кадр ${k.n}: у кадра нет файла в public, подписи, alt или адреса источника`); continue; }
    razobrannye.push({ ...k, p });
  }
  if (razobrannye.filter((k) => k.p.vid === 'obl').length > 1) oshibki.push(`кадры ${razobrannye.filter((k) => k.p.vid === 'obl').map((k) => k.n).join(', ')}: обложка у дня одна`);
  for (const n of nomera) {
    const f = fakty.get(n);
    if (!f) { oshibki.push(`факт ${n}: в материале нет записи «Факт ${n}»`); continue; }
    if (!f.otryvok) oshibki.push(`факт ${n}: в материале нет «цитата:» — отрывка нет`);
    if (!f.href) oshibki.push(`факт ${n}: в материале нет адреса цитаты`);
    if (!f.pometka) oshibki.push(`факт ${n}: пометка ${f.pometkaTekst ? `«${f.pometkaTekst.slice(0, 60)}»` : 'не записана'} — нужна одна из: ${pometki.join(' / ')}`);
  }
  if (typeof video === 'string') oshibki.push(`ролик: ${video}`);
  return { oshibki, kadry: razobrannye };
}

// Кадры по привязкам. poryadok — номера фактов на странице; kadry — из proverit(); staraya — { oblozhka, figures, kadryFaktov }.
// Обложка — кадр «обложка» (служебные поля старой обложки hint/celikom сохраняются), без него — старая.
// Факту — первый кадр с ним главным номером, потом с ним в «также»; лишние привязанные — в галерею.
// Галерея: лишние привязанные, «галерея», затем прежние кадры страницы, без повторов и без обложки.
// klass (portret) — вёрстка, из размеров не выводится: переходит с прежнего кадра того же объекта.
export function rasstavit(poryadok, kadryVhod, staraya) {
  const ispolzovan = new Set(), kadrFakta = new Map();
  const klassy = new Map([staraya.oblozhka, ...(staraya.figures ?? []), ...(staraya.kadryFaktov ?? [])]
    .filter((k) => k?.src && k.klass).map((k) => [kadrId(k), k.klass]));
  const kadry = kadryVhod.map((k) => (k.obekt && klassy.has(kadrId(k.obekt)) && !k.obekt.klass ? { ...k, obekt: { ...k.obekt, klass: klassy.get(kadrId(k.obekt)) } } : k));
  const novObl = kadry.find((k) => k.p.vid === 'obl')?.obekt;
  const { hint, celikom } = staraya.oblozhka ?? {};
  const oblozhka = novObl ? { ...novObl, ...(hint !== undefined && { hint }), ...(celikom !== undefined && { celikom }) } : staraya.oblozhka;
  if (oblozhka?.src) ispolzovan.add(kadrId(oblozhka));
  const kFaktam = kadry.filter((k) => k.p.vid === 'fakt');
  for (const krug of [(k, n) => k.p.nomera[0] === n, (k, n) => k.p.nomera.slice(1).includes(n)])
    for (const n of poryadok) {
      if (kadrFakta.has(n)) continue;
      const k = kFaktam.find((x) => krug(x, n) && !ispolzovan.has(kadrId(x.obekt)));
      if (k) { kadrFakta.set(n, k.obekt); ispolzovan.add(kadrId(k.obekt)); }
    }
  const figures = [];
  const vGaleryu = (k) => { if (k?.src && !ispolzovan.has(kadrId(k))) { figures.push(k); ispolzovan.add(kadrId(k)); } };
  kFaktam.forEach((k) => vGaleryu(k.obekt));
  kadry.filter((k) => k.p.vid === 'gal').forEach((k) => vGaleryu(k.obekt));
  [...(staraya.figures ?? []), ...(staraya.kadryFaktov ?? []), ...(novObl && staraya.oblozhka ? [staraya.oblozhka] : [])]
    .forEach((k) => vGaleryu(k && { ...k, hint: undefined, celikom: undefined }));
  return { oblozhka, kadrFakta, figures: figures.map((k) => Object.fromEntries(Object.entries(k).filter(([, v]) => v !== undefined))) };
}

// Раздел верхнего уровня yaml (ключ и всё с отступом под ним) — для побайтной замены только своих разделов.
export const razdel = (t, k) => t.match(new RegExp(`^${k}:[^\\n]*\\n(?:(?![\\w#])[^\\n]*\\n|\\n)*`, 'm'));
