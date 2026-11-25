// Сценарий прохода: 02-17 «Изобретений», Пироцкий «Кто раньше» (kto-ranshe).
// Как играет ребёнок: выбирает город (кнопка в [data-goroda]), ползунком ставит год и жмёт «Проверить».
// Верных ответов два, и оба — Петербург: 1880 (первый трамвай) и 1874 (заявка на привилегию); год строгий (dopusk 0).
// Ползунок — обычный <input type="range">: год ставим прямо в value и шлём input (движок слушает именно его),
// а город нажимаем пальцем, как посетитель. Два раунда, потом итог с «🏆».
export const final = '[data-igra-itog]';

async function stavkaGod(page, god) {
  await page.locator('[data-polzunok]').evaluate((el, g) => {
    el.value = String(g);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, god);
}

export default async function (i, page) {
  // Раунд 1: первый трамвай — Петербург, 1880.
  await i.tap('[data-goroda] button:nth-child(1)', 'тап «Петербург» (первый трамвай)');
  await stavkaGod(page, 1880);
  await i.tap('[data-proverit]', 'тап «Проверить» (год 1880)');
  await i.zhdi(() => /бумаге/.test(document.querySelector('[data-vopros]')?.textContent || ''), 10_000, 'второй вопрос («…на бумаге?»)');
  // Раунд 2: заявка на привилегию — Петербург, 1874.
  await i.tap('[data-goroda] button:nth-child(1)', 'тап «Петербург» (заявка)');
  await stavkaGod(page, 1874);
  await i.tap('[data-proverit]', 'тап «Проверить» (год 1874)');
  await i.zhdi(() => /🏆/.test(document.querySelector('[data-igra-itog]')?.textContent || ''), 15_000, 'финальный экран «🏆»');
}
