// Длинные атрибуты style="…" — в классы (Р560, 05.11): проверка глазами («без своих стилей») считает браком
// атрибут style длиннее 60 знаков. Вид не меняется: правило уходит в <style> в <head> с селектором
// :is(#rcs-…, [data-rcs="N"]) — вес id, как у встроенного стиля почти всегда; JS, который ставит el.style, по-прежнему главнее.
// Внутри <script>, <style>, <template> и <svg> ничего не трогается.
export const STYLE_MAX = 60;

export function stiliVKlassy(html) {
  const pravila = new Map(); // текст стиля → номер
  const chasti = html.split(/(<(script|style|template|svg)\b[\s\S]*?<\/\2>)/i);
  const out = [];
  for (let i = 0; i < chasti.length; i++) {
    if (i % 3 === 2) continue; // имя тега из группы split
    const kusok = chasti[i];
    if (i % 3 === 1) { out.push(kusok); continue; }
    out.push(kusok.replace(/(<[a-z][\w-]*\b[^>]*?)\sstyle="([^"]*)"/gi, (vse, nachalo, st) => {
      if (st.length <= STYLE_MAX || st.includes('&') || /data-rcs=/.test(nachalo)) return vse;
      const klyuch = st.trim().replace(/;\s*$/, '');
      if (!pravila.has(klyuch)) pravila.set(klyuch, pravila.size + 1);
      return `${nachalo} data-rcs="${pravila.get(klyuch)}"`;
    }));
  }
  if (!pravila.size) return html;
  const css = [...pravila].map(([st, n]) => `:is(#rcs-${n},[data-rcs="${n}"]){${st}}`).join('\n');
  return out.join('').replace(/<\/head>/i, `<style data-rc-svoi-stili>\n${css}\n</style>\n</head>`);
}

// Цели касания ≥44×44 (Р560; WCAG 2.5.5, Apple HIG): ссылки общих блоков дня — календарь, «куда дальше», карточки
// соседних дней, источники, подвал. Ссылки внутри абзаца текста не трогаются (их проверка и не считает).
export const CELI_CSS = '#calbox .calgrid{gap:4px}#calbox a.cday{min-height:46px}'
  + '#calbox .calcard a,.kd-card a,.ncard a,ul.sources li>a,.wayrow a,footer .dp-err a,footer .rc-lic a,footer>.wrap>a'
  + '{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;box-sizing:border-box}';
