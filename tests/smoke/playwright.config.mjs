// Smoke-тест живого сайта (Playwright, 19.10.2026) — замена самодельного tools/skvoznoy-probnik.py.
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'otchet' }]],
  use: {
    baseURL: process.env.SMOKE_URL || 'https://russian-civilization.ru',
    ignoreHTTPSErrors: false, // чужой сертификат на домене = красный: посетитель увидит предупреждение
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
