// Статический сервер собранного сайта от корня (как на домене). Сам сервер — scripts/lib/dist.mjs (общий для всех проверок,
// Р531); этот файл — запуск отдельно и прежний адрес импорта для листа приёмки (r610).
import { serveDist } from './lib/dist.mjs';
export { serveDist };

// Запуск отдельно (webServer образцовых снимков): node scripts/dist-server.mjs dist 4610
if (process.argv[1]?.endsWith('dist-server.mjs')) {
  const s = await serveDist(process.argv[2] || 'dist', +(process.argv[3] || 0));
  console.log(`dist-server: ${s.url}`);
}
