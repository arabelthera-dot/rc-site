// Проходчик игр (Р204–Р205, 23.10.2026): каждая игра проходится пальцем до финала на эмуляции телефона.
// Три движка: chromium = Android/Chrome (Pixel 7), webkit = iPhone Safari и браузер Telegram на iPhone
// (iPhone 13), firefox. Где проходить: IGRY_URL — живой сайт или превью (проверка после выкладки),
// без него — своя раздача собранного dist (+ папки IGRY_DOP через «:» — для пробы черновиков с веток).
// IGRY_DVIZHKI=chromium,webkit — только эти движки. IGRY_SNIMKI=0 — без сверки снимков с эталоном.
// Запуск: npm run igry · эталоны снимков: npm run igry:etalony.
import { defineConfig, devices } from '@playwright/test';

const URL = process.env.IGRY_URL;
const PORT = 4873;
const DVIZHKI = (process.env.IGRY_DVIZHKI || 'chromium,webkit,firefox').split(',');
const pixel = devices['Pixel 7'];

const PROEKTY = [
  { name: 'android-chromium', dvizhok: 'chromium', use: { ...pixel } },
  { name: 'iphone-webkit', dvizhok: 'webkit', use: { ...devices['iPhone 13'] } },
  // У firefox нет режима isMobile — экран, касания и подпись браузера телефона без него.
  { name: 'firefox', dvizhok: 'firefox', use: { browserName: 'firefox', viewport: pixel.viewport, hasTouch: true,
    deviceScaleFactor: 1, userAgent: 'Mozilla/5.0 (Android 14; Mobile; rv:141.0) Gecko/141.0 Firefox/141.0' } },
];

export default defineConfig({
  testDir: '.',
  testMatch: 'prohod.spec.mjs',
  timeout: 120_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled', caret: 'hide' } },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  snapshotPathTemplate: '{testDir}/etalony/{projectName}/{arg}{ext}',
  reporter: [['./stroka.mjs'], ['html', { open: 'never', outputFolder: process.env.IGRY_OTCHET || 'otchet' }]],
  outputDir: process.env.IGRY_REZULTATY || 'rezultaty',
  use: {
    baseURL: (URL || `http://127.0.0.1:${PORT}/`).replace(/\/?$/, '/'),
    serviceWorkers: 'block', // новый контекст без кэша и без работника — как первый заход с телефона
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: PROEKTY.filter((p) => DVIZHKI.includes(p.dvizhok)).map(({ dvizhok, ...p }) => p),
  webServer: URL ? undefined : {
    command: `node server.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/__zhiv`,
    reuseExistingServer: !process.env.CI,
  },
});
