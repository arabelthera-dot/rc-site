// Рамка игры дня (Р635, 08.11.2026): общее у всех игр — kicker, заголовок, строка «что делает посетитель», место движка,
// «Ещё раз», итог, «Как играть» и источник. Механика своя у каждой игры: движок public/assets/igry/<mehanika>.js
// регистрируется в public/assets/igry/ramka.js и получает dannye из <script type="application/json"> рамки.
// dannye.bez_skripta_ru, если есть у механики, — текст для <noscript>. Строки — как в карточках дня: inline-разметка (<b>, <i>, <a>) выводится как есть. Поле и список механик — src/lib/igry-mehaniki.ts.
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// JSON внутри <script>: «</script>» в тексте не должен закрыть тег.
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

export const RAMKA_CSS = 'igry/ramka';
export const skriptyRamki = (igra) => ['igry/ramka.js', `igry/${igra.mehanika}.js`];

export function ramkaHtml(igra) {
  const k = igra.kak_igrat;
  const kak = k ? `
    <div class="igra-pravila" data-igra-pravila>
      <h2 class="igra-pravila-h">Как играть</h2>
      <p class="igra-pravila-zachem">${k.zachem}</p>
      <ol class="igra-pravila-shagi">${k.shagi.map((s) => `<li>${s}</li>`).join('')}</ol>${k.nyuans ? `
      <p class="igra-pravila-nyuans">${k.nyuans}</p>` : ''}${k.final ? `
      <p class="igra-pravila-final">${k.final}</p>` : ''}
    </div>` : '';
  return `<section class="block igra-ramka" id="games" data-igra-ramka="${attr(igra.mehanika)}">
  <div class="wrap">
    <div class="kicker">${igra.kicker}</div>
    <h2>${igra.zagolovok}</h2>
    <p class="igra-ramka-pravilo">${igra.pravilo_ru}</p>
    <div class="igra-ramka-dvizhok" data-igra-dvizhok></div>${igra.dannye.bez_skripta_ru ? `
    <noscript><div class="noscript-box">${igra.dannye.bez_skripta_ru}</div></noscript>` : ''}
    <div class="igra-ramka-niz">
      <button class="btn ghost" type="button" data-igra-eshche>Ещё раз</button>
      <div class="igra-ramka-itog" data-igra-itog aria-live="polite"></div>
    </div>${kak}${igra.istochnik_ru ? `
    <p class="src-note">${igra.istochnik_ru}</p>` : ''}
    <script type="application/json" data-igra-dannye>${json(igra.dannye)}</script>
  </div>
</section>`;
}
