const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();

    const serveFile = (actualPath) => {
        const ext = String(path.extname(actualPath)).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        fs.readFile(actualPath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT' && !actualPath.endsWith('.html')) {
                    // Try adding .html
                    serveFile(actualPath + '.html');
                } else {
                    res.writeHead(error.code === 'ENOENT' ? 404 : 500);
                    res.end(error.code === 'ENOENT' ? 'File not found' : 'Server error: ' + error.code);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    };

    serveFile(filePath);
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
