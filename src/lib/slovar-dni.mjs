// Дни записи словаря (Р37, Р819): одно место у каждого текста — день. Запись словаря хранит имя и годы, а что человек
// сделал, страница /slovar/<tip>/<slug>/ берёт из файла его дня: карточка src/content/dni-shablon/<музей>/ММ-ДД.yaml
// с adres: den (head.sobytie, lead.hook — то, что стоит на живой странице дня), иначе — запись src/content/days/<музей>/ММ-ДД.json
// (title, hook). Связь — поле slovar дня; у дня с живой карточкой связи читаются из карточки, а не из копии в days.
// Как в мире: ссылка вместо копии — reference() в коллекциях Astro, https://docs.astro.build/en/guides/content-collections/#defining-collection-references

// days — элементы коллекции days ({ data }), kartochki — карточки дней (src/lib/dni-shablon.mjs: kartochki()).
// Ответ — [{ museum, key, title, year, hook }] всех дней со связью id, без повторов «музей/день».
export function dniZapisi(id, days, kartochki) {
  const zhivye = kartochki.filter((k) => k.adres === 'den');
  const est = new Set(zhivye.map((k) => `${k.muzei}/${k.key}`));
  const izKartochek = zhivye.filter((k) => k.slovar?.includes(id))
    .map((k) => ({ museum: k.muzei, key: k.key, title: k.head.sobytie, year: k.god, hook: k.lead.hook }));
  const izDays = days.map((d) => d.data).filter((d) => !est.has(`${d.museum}/${d.key}`) && d.slovar?.includes(id))
    .map((d) => ({ museum: d.museum, key: d.key, title: d.title, year: d.year, hook: d.hook }));
  return [...izKartochek, ...izDays];
}
