// Общие детали проверок собранного сайта (Р531, аудит 04.11 п.14): один статический сервер dist и один обход файлов.
// Раньше свой http.createServer держали пять скриптов, а свой обход папки — каждая проверка dist; копии расходились
// (у одних сервер отдавал .woff, у других нет; у одних обход заходил в .well-known, у других — как повезёт).
// Сервер: const s = await serveDist('dist'); … s.url … s.close().  Особые адреса: serveDist(dir, { svoi: { '/__proba/': html } }).
// Обход: distFiles('dist', '**/*.html') — отсортированные полные пути; папки с точкой (.well-known) входят, как у find.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

export const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.txt': 'text/plain' };

// Сайт от корня, как на домене. port — число или { port, svoi }; svoi — адрес → готовый HTML (подложенные страницы проб).
export async function serveDist(dir, opt = {}) {
  const { port = 0, svoi = {} } = typeof opt === 'number' ? { port: opt } : opt;
  const ROOT = path.resolve(dir);
  const server = http.createServer((req, res) => {
    let u;
    try { u = decodeURIComponent(req.url.split('?')[0]); } catch { res.writeHead(400); return res.end(); }
    if (u in svoi) { res.writeHead(200, { 'content-type': MIME['.html'] }); return res.end(svoi[u]); }
    let f = path.join(ROOT, u);
    if (f !== ROOT && !f.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
    let st;
    try { st = fs.statSync(f); if (st.isDirectory()) { f = path.join(f, 'index.html'); st = fs.statSync(f); } } catch { st = null; }
    if (!st?.isFile()) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'content-length': st.size });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${server.address().port}/`, port: server.address().port, close: () => server.close() };
}

// Файлы сборки по шаблону (fs.globSync): '**/*.html', '**/*.{js,mjs}'. Второй шаблон с '**/.*/**/' — потому что
// '**' в Node не заходит в папки с точкой, а прежние обходы заходили. krome — шаблоны или функция, как exclude у globSync.
export function distFiles(dir, shablon = '**/*.html', { krome } = {}) {
  const shablony = shablon.startsWith('**/') ? [shablon, '**/.*/' + shablon] : [shablon];
  const naydeno = fs.globSync(shablony, { cwd: dir, exclude: krome });
  return [...new Set(naydeno)].map((f) => path.join(dir, f)).filter((f) => fs.statSync(f).isFile()).sort();
}
