// Раздача для проходчика: dist (собранный сайт) и папки IGRY_DOP («:»), первая, где файл есть, — отвечает.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const KOREN = path.resolve(import.meta.dirname, '../..');
const PAPKI = [path.join(KOREN, 'dist'), ...(process.env.IGRY_DOP || '').split(':').filter(Boolean).map((p) => path.resolve(p))];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.ico': 'image/x-icon' };

function nayti(u) {
  for (const p of PAPKI) {
    let f = path.join(p, u);
    if (!f.startsWith(p)) continue;
    try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch {}
    if (fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  }
}

http.createServer((req, res) => {
  if (req.url === '/__zhiv') { res.writeHead(200); return res.end('ok'); } // для ожидания webServer: без dist корень — 404
  const f = nayti(decodeURIComponent(req.url.split('?')[0]));
  if (!f) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(res);
}).listen(+process.argv[2] || 4873, '127.0.0.1');
