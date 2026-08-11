// Startdatei fuer Plesk (Node.js-Anwendung ueber Phusion Passenger).
// In Plesk unter "Node.js" als "Application Startup File" server.js eintragen.
// Vor dem ersten Start (und nach jedem Deploy) muss "npm run build" gelaufen sein.

const { createServer } = require('http');
const next = require('next');

const dev = process.env.NODE_ENV === 'development';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const port = process.env.PORT || 3000;

  createServer((req, res) => {
    handle(req, res);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Server bereit auf Port ${port} (${dev ? 'development' : 'production'})`);
  });
});
