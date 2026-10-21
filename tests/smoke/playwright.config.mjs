// Smoke-тест живого сайта (Playwright, 19.10.2026) — замена самодельного tools/skvoznoy-probnik.py.
import { defineConfig } from '@playwright/test';
// RF_PROXY (секрет, socks5h://хост:порт) — российский выход: маршрут Azure(США)→Москва рвётся (ERR_TIMED_OUT).
// Нет переменной — прямой путь, как раньше. Chromium знает только socks5:// (имя всё равно разрешает прокси).
function proxy() {
  const v = process.env.RF_PROXY;
  if (!v) return undefined;
  const u = new URL(v);
  if (u.protocol.startsWith('socks') && (u.username || u.password))
    throw new Error('RF_PROXY: Chromium не умеет логин/пароль для SOCKS — нужен прокси без авторизации');
  return { server: `${u.protocol.replace(/^socks5h:$/, 'socks5:')}//${u.host}` };
}
export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'otchet' }]],
  use: {
    baseURL: process.env.SMOKE_URL || 'https://russian-civilization.ru',
    ignoreHTTPSErrors: false, // чужой сертификат на домене = красный: посетитель увидит предупреждение
    screenshot: 'only-on-failure',
    proxy: proxy(),
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
