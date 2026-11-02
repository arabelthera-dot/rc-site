// Образцовые снимки дней (r610, Р444): npx playwright test -c tests/obrazcy (после npm run build).
// Сервер — собранный dist от корня (scripts/dist-server.mjs, как в glazami). Снимки — tests/obrazcy/snimki/<музей>-<ММ-ДД>.png,
// сняты в облаке (ubuntu-latest): шрифты и сглаживание у другой машины другие. Обновить — только командой из лога проверки:
// node scripts/list-priemki.mjs obnovit <номер прогона> — и коммит в той же заявке.
import { defineConfig } from '@playwright/test';
const PORT = 4610;
export default defineConfig({
  testDir: '.',
  timeout: 60_000,
  retries: 0,
  reporter: [['list']],
  outputDir: '/tmp/obrazcy-rezultat',
  snapshotPathTemplate: '{testDir}/snimki/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, threshold: 0.2, animations: 'disabled', caret: 'hide' } },
  use: { baseURL: `http://127.0.0.1:${PORT}/` },
  webServer: { command: `node scripts/dist-server.mjs dist ${PORT}`, cwd: '../..', url: `http://127.0.0.1:${PORT}/`, reuseExistingServer: false },
  projects: [{ name: 'telefon', use: { browserName: 'chromium' } }],
});
