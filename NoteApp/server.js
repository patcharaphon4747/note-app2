const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  let extname = String(path.extname(filePath)).toLowerCase();
  let contentType = 'text/html';

  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
  };

  contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(__dirname + filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });

}).listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
