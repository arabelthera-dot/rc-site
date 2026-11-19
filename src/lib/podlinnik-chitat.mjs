// п.498 (Р745): блоки страницы дня «Где увидеть подлинник» и «Что почитать дальше» из полей карточки
// gde_uvidet и chitat_dalshe (src/lib/forma-dnya.mjs). Выключено, пока нет PUBLIC_PODLINNIK_CHITAT=1: страница как раньше.
export const podlinnikChitatVkl = (env = process.env) => env.PUBLIC_PODLINNIK_CHITAT === '1';
const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const a = (href, t) => `<a href="${e(href)}" rel="noopener" target="_blank">${t}</a>`;

export function podlinnikChitatHtml(d, vkl = podlinnikChitatVkl()) {
  if (!vkl) return '';
  const bloki = [];
  if (d.gde_uvidet?.length) bloki.push(`<section class="block" id="gde-uvidet">
  <div class="wrap">
    <div class="kicker">Где увидеть подлинник</div>
    <ul class="sources">
${d.gde_uvidet.map((g) => `      <li>${e(g.chto)} — ${g.ssylka ? a(g.ssylka, e(g.muzej)) : e(g.muzej)}, ${e(g.gorod)}${g.goskatalog ? ` · ${a(g.goskatalog, 'запись в Госкаталоге')}` : ''}</li>`).join('\n')}
    </ul>
  </div>
</section>`);
  if (d.chitat_dalshe?.length) bloki.push(`<section class="block" id="chitat-dalshe">
  <div class="wrap">
    <div class="kicker">Что почитать дальше</div>
    <ul class="sources">
${d.chitat_dalshe.map((c) => `      <li>${a(c.ssylka, e(c.nazvanie))} — ${e(c.gde)}</li>`).join('\n')}
    </ul>
  </div>
</section>`);
  return bloki.map((b) => `\n${b}`).join('');
}
