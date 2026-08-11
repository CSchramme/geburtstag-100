// Diagnose-Skript fuer Hosting-Umgebungen ohne freien Shell-Zugriff (z.B.
// Plesk ohne SSH): prueft direkt auf dem Server, ob die Node-App selbst
// sauber antwortet - unabhaengig von Plesks Vorschau-Proxy/Domain-Routing.
//
// Aufruf: npm run healthcheck
// Optional: PORT=xxxx npm run healthcheck (falls der Port nicht ueber die
// Umgebungsvariable PORT bekannt ist, siehe Plesk Node.js-Panel)

const http = require('http');

const port = process.env.PORT || 3000;

function check(path) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port, path, timeout: 8000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
        if (body.length > 300) res.destroy();
      });
      res.on('end', () => {
        resolve({ path, status: res.statusCode, body: body.slice(0, 300) });
      });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ path, status: 'TIMEOUT', body: '' });
    });
    req.on('error', (err) => {
      resolve({ path, status: 'ERROR', body: err.message });
    });
  });
}

(async () => {
  console.log(`\nHealthcheck gegen http://127.0.0.1:${port} ...\n`);

  const paths = ['/', '/api/state', '/api/admin/whoami'];
  for (const path of paths) {
    const result = await check(path);
    console.log(`${path}`);
    console.log(`  Status: ${result.status}`);
    if (result.body) {
      console.log(`  Antwort: ${result.body.replace(/\s+/g, ' ').trim()}`);
    }
    console.log('');
  }

  console.log(
    'Erwartet: "/" -> 200, "/api/state" -> 200 mit JSON, ' +
    '"/api/admin/whoami" -> 401 (ohne Login normal).\n' +
    'Wenn hier alles passt, laeuft die App korrekt - das Problem liegt dann ' +
    'an Plesks Domain-/Proxy-Routing zur App, nicht an der App selbst.\n'
  );
})();
