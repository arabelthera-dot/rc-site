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
  // Съёмка с deviceScaleFactor 2 на облачной машине бывает дольше 5 с (обрыв «taking page screenshot … Timeout 5000ms» в прогонах
  // 41799546907 и 41820972090 при снимке, совпавшем с образцом точка в точку) — запас 20 с, порог разницы прежний.
  expect: { timeout: 20_000, toHaveScreenshot: { maxDiffPixelRatio: 0.002, threshold: 0.2, animations: 'disabled', caret: 'hide' } },
  use: { baseURL: `http://127.0.0.1:${PORT}/` },
  webServer: { command: `node scripts/dist-server.mjs dist ${PORT}`, cwd: '../..', url: `http://127.0.0.1:${PORT}/`, reuseExistingServer: false },
  projects: [{ name: 'telefon', use: { browserName: 'chromium' } }],
});
