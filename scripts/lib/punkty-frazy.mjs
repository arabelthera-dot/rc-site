// Пункт источников из фразы со ссылками внутри («Изображения: <a>A</a> (держатель — X) и <a>B</a> (держатель — Y).
// Кадры дня: <a>C</a> …») → пункт на каждую ссылку: title — текст ссылки, note — заголовок фразы («Изображения»)
// и своё пояснение ссылки («держатель — X»). Ссылка без пояснения («<a>A</a> (<a>дубль</a>): пояснение») берёт
// пояснение следующей. Прежде note у всех пунктов была вся фраза без текстов ссылок (Р832, строки 5 и 10 журнала):
// «Изображения: (держатель — X) и (держатель — Y)».
const SSYLKA = /<a\b[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
const ZAGOLOVOK = /(?:^|[.;]\s*)([^.;:()]+?):\s*$/;
const TIRE = /(?:^|[.;]\s*)([^.;:()—–]+?)\s+[—–]\s*$/;

export function punktyFrazy(h, snyat) {
  const ssylki = [...h.matchAll(SSYLKA)];
  const kuski = h.replace(SSYLKA, '\u0000').split('\u0000').map((x) => snyat(x));
  let zagolovok = '';
  const punkty = ssylki.map(([, href, x], i) => {
    let t = kuski[i + 1].replace(ZAGOLOVOK, '').replace(TIRE, '').trim().replace(/^\)\s*:?\s*/, '');
    // «Изображения: <a>…», «кадры дня — <a>A</a> (X), <a>B</a> (Y)» — заголовок для ссылок до следующего
    const pered = kuski[i].match(ZAGOLOVOK) ?? (t.startsWith('(') ? kuski[i].match(TIRE) : null);
    if (pered) zagolovok = pered[1].replace(/^[\s.;,)]+/, '').trim();
    // пояснение после ссылки: «<a>A</a> (держатель — X)»; в конце фразы — «<a>A</a> и <a>B</a>; держатель — X.»;
    // иначе — перед ссылкой: «схема — <a>A</a>»
    let obshchee = true;
    if (t.startsWith('(')) t = t.includes(')') ? t.slice(1, t.indexOf(')')) : '';
    else if (i === ssylki.length - 1 && /^;\s*\S/.test(t)) t = t.replace(/^;\s*/, '').replace(/\.$/, '');
    else if (/^(?:[.;]|$)/.test(t)) { t = (pered ? '' : kuski[i].split(/[;:]\s*/).pop()).replace(/\s*[—–]\s*$/, ''); obshchee = false; }
    else t = t.split(/;\s*/)[0];
    const svoe = t.replace(/^(?:и|,|;)$/, '').replace(/(?:\s+и|[\s,;—–(])+$/, '').replace(/^[\s,;:—–.]+/, '').trim();
    return { href, title: snyat(x), zagolovok, svoe, obshchee };
  });
  // «<a>A</a> и <a>B</a> (держатель — X)», «<a>A</a> (<a>дубль</a>): пояснение» — пояснение общее для ссылок перед ним
  for (let i = punkty.length - 2; i >= 0; i--) if (!punkty[i].svoe && punkty[i + 1].obshchee) punkty[i].svoe = punkty[i + 1].svoe;
  return punkty.map(({ href, title, zagolovok: z, svoe }) => ({ href, title, note: [z, svoe].filter(Boolean).join(': ') }));
}
