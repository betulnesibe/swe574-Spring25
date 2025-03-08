const http = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => {
    handle(req, res);
  }).listen(3000, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${process.env.VM_IP || 'localhost'}:3000`);
  });
}); 