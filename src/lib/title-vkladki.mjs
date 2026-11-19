// Заголовок вкладки ≤60 знаков (Р560, 05.11): Google показывает в выдаче около 60 знаков, остальное режет многоточием
// (developers.google.com/search/docs/appearance/title-link). Укорачивается только служебный хвост
// « — <полное имя музея> — Русская цивилизация»: сначала уходит имя музея, потом имя сайта. Название дня не трогается —
// если оно само длиннее 60, заголовок остаётся голым названием дня. og:title не меняется.
const SAYT = 'Русская цивилизация';
export const TITLE_MAX = 60;

export function titleVkladki(den, muzey) {
  const varianty = [muzey && `${den} — ${muzey} — ${SAYT}`, `${den} — ${SAYT}`, den].filter(Boolean);
  return varianty.find((t) => t.length <= TITLE_MAX) ?? den;
}

// Переписать <title> готовой страницы: «день — музей — Русская цивилизация» → короче, если не влезает в 60.
export function ukorotitTitle(html, muzey) {
  return html.replace(/<title>([^<]*)<\/title>/i, (vse, t) => {
    if (t.length <= TITLE_MAX) return vse;
    let den = t;
    const hvost = ` — ${SAYT}`;
    if (den.endsWith(hvost)) den = den.slice(0, -hvost.length);
    if (muzey && den.endsWith(` — ${muzey}`)) den = den.slice(0, -(muzey.length + 3));
    if (den === t) return vse; // чужой формат — не трогаем
    return `<title>${titleVkladki(den, muzey)}</title>`;
  });
}
