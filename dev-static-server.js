// Minimal static server using only Node built-ins. Serves files from project root.
const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};
const root = process.cwd();
const port = parseInt(process.env.PORT || process.argv[2] || '9000', 10);

const server = http.createServer((req, res) => {
  try {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(root, reqPath);
    if (!filePath.startsWith(root)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    fs.stat(filePath, (err, stats) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      if (stats.isDirectory()) { res.writeHead(301, { Location: reqPath + '/' }); res.end(); return; }
      const ext = path.extname(filePath).toLowerCase();
      const type = mime[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      stream.on('error', () => { res.writeHead(500); res.end('Server error'); });
    });
  } catch (e) {
    res.writeHead(500); res.end('Server error');
  }
});
server.on('error', (e) => {
  console.error('Server error', e);
});
server.listen(port, () => console.log(`Dev static server listening on http://localhost:${port}`));
