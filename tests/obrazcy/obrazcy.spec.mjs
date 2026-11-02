// Образцовые дни: верх страницы 390×844 против замороженного снимка (r610). Список — obrazcy.json.
import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { otkrytDen } from '../../scripts/list-priemki.mjs';

const { dni } = JSON.parse(fs.readFileSync(new URL('./obrazcy.json', import.meta.url), 'utf8'));
for (const den of dni) {
  test(den, async ({ browser, baseURL }) => {
    const { page, ctx } = await otkrytDen(browser, baseURL, den, 2);
    await expect(page).toHaveScreenshot(den.replace('/', '-') + '.png');
    await ctx.close();
  });
}
