/**
 * Forwards public HTTPS to local API — uses PORT from backend/.env (same as the API).
 */
const path = require('path');
const { spawn } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const port = Number(process.env.PORT) || 5000;
console.log(`[tunnel] Forwarding to http://127.0.0.1:${port} (set PORT in backend/.env if the API uses another port)\n`);

const child = spawn('npx', ['--yes', 'localtunnel', '--port', String(port)], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => process.exit(code ?? 0));
