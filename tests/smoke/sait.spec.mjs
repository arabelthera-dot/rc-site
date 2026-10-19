import { test, expect } from '@playwright/test';

// Три точки: главная, поиск, одна страница музея. Ошибка консоли или битый ресурс своего домена — красный.
const STRANICY = [
  { put: '/', est: 'a[href^="/muzei/"]' },
  { put: '/poisk/', est: 'main' },
  { put: '/muzei/arhitektura/', est: 'h1' },
];

for (const { put, est } of STRANICY) {
  test(`открывается ${put}`, async ({ page, baseURL }) => {
    const oshibki = [];
    page.on('pageerror', (e) => oshibki.push(`js: ${e.message}`));
    page.on('response', (r) => {
      if (r.status() >= 400 && r.url().startsWith(baseURL)) oshibki.push(`${r.status()} ${r.url()}`);
    });
    const otvet = await page.goto(put, { waitUntil: 'load' });
    expect(otvet?.status(), `код ответа ${put}`).toBe(200);
    await expect(page.locator(est).first()).toBeVisible();
    expect(oshibki, 'ошибки страницы').toEqual([]);
  });
}
