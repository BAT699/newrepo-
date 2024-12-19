const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5413;

const logFile = './info.txt';

function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    fs.appendFile(logFile, logEntry, (err) => {
        if (err) console.error("Failed to write to log file:", err);
    });

    console.log(message);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = `.${parsedUrl.pathname}`;

    if (pathname === './') pathname = './bprc.html';

    const extname = path.extname(pathname);
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.txt': 'text/plain'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(pathname, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                fs.readFile('./404.html', (err404, data404) => {
                    if (err404) {
                        res.writeHead(500);
                        res.end('Internal Server Error');
                    } else {
                        logMessage(`404 - Not Found: ${pathname}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(data404);
                    }
                });
            } else {
                logMessage(`Error serving ${pathname}: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            }
        } else {
            logMessage(`Served: ${pathname}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    logMessage(`Server running at http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    logMessage('Server shutting down...');
    server.close(() => process.exit());
});
