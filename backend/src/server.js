require('dotenv').config();
const validateEnv = require('./config/validateEnv');
const app = require('./app');
const connectDB = require('./config/db');
const { seedAdminUser } = require('./scripts/seedAdmin');
const { seedTicketCatalog } = require('./scripts/seedTicketCatalog');

validateEnv();

const PORT = process.env.PORT || 5000;

const HOST = process.env.HOST || '0.0.0.0';

function listenFromPort(startPort) {
  return new Promise((resolve, reject) => {
    const server = app.listen(startPort, HOST, () => resolve({ server, port: startPort }));
    server.once('error', reject);
  });
}

async function runSeeds() {
  await seedAdminUser();
  await seedTicketCatalog();
}

/** @returns {Promise<boolean>} true if mongoose is connected */
async function connectDatabaseWithOptionalRetry() {
  const maxAttempts = Math.max(
    1,
    Number(process.env.DB_CONNECT_RETRIES || (process.env.NODE_ENV === 'production' ? 3 : 1))
  );
  let attempt = 0;
  let lastErr;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      await connectDB();
      return true;
    } catch (err) {
      lastErr = err;
      console.error(`[db] Connection attempt ${attempt}/${maxAttempts} failed.`);
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
  console.error(
    '[db] MongoDB is not connected. The API is still listening — routes that need the database return 503.\n' +
      'Fix MONGODB_URI / Atlas network access, then restart the server.\n' +
      (lastErr?.message ? `Last error: ${lastErr.message}\n` : '')
  );
  return false;
}

(async () => {
  const preferred = Number(PORT) || 5000;
  const maxTries = process.env.NODE_ENV === 'production' ? 1 : 20;
  let lastErr;
  let boundPort = preferred;

  for (let i = 0; i < maxTries; i += 1) {
    const p = preferred + i;
    try {
      await listenFromPort(p);
      boundPort = p;
      break;
    } catch (err) {
      lastErr = err;
      if (err.code !== 'EADDRINUSE') {
        console.error(err);
        process.exit(1);
      }
    }
    if (i === maxTries - 1) {
      console.error(
        `[server] Could not bind starting at ${preferred} (${maxTries} tries). ${lastErr?.message || ''}\n` +
          'Close other API terminals or set PORT to a free port in backend/.env.'
      );
      process.exit(1);
    }
  }

  console.log(`[server] Listening on http://${HOST}:${boundPort} (all interfaces)`);
  if (boundPort !== preferred) {
    console.log(
      `[server] Port ${preferred} was in use; using ${boundPort}. Set PORT=${boundPort} in backend/.env and point the app at this port.`
    );
  }
  if (process.platform === 'win32') {
    console.log(
      '[server] If your phone times out: Windows Defender Firewall may block inbound port ' +
        boundPort +
        '. Allow Node.js for private networks, or add an inbound rule for TCP ' +
        boundPort +
        '.'
    );
  }

  connectDatabaseWithOptionalRetry()
    .then(async (connected) => {
      if (!connected || process.env.SKIP_SEED === '1') return;
      try {
        await runSeeds();
      } catch (e) {
        console.error('[server] Seed step failed (non-fatal for API):', e?.message || e);
      }
    })
    .catch(() => {});
})();
