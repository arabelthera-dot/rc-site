// Статический сервер собранного сайта от корня (как на домене) — тот же, что в scripts/glazami.mjs.
// Для листа приёмки и образцовых снимков (r610): const s = await serveDist('dist'); … s.url … s.close().
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.txt': 'text/plain' };

export async function serveDist(dir, port = 0) {
  const ROOT = path.resolve(dir);
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    let f = path.join(ROOT, u);
    if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch {}
    fs.readFile(f, (err, buf) => {
      if (err) { res.writeHead(404); return res.end('404'); }
      res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'content-length': buf.length });
      res.end(buf);
    });
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() };
}

// Запуск отдельно (webServer образцовых снимков): node scripts/dist-server.mjs dist 4610
if (process.argv[1]?.endsWith('dist-server.mjs')) {
  const s = await serveDist(process.argv[2] || 'dist', +(process.argv[3] || 0));
  console.log(`dist-server: ${s.url}`);
}
