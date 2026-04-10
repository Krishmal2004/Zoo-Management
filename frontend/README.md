# Zoo Management (Expo)

Mobile client for the Zoo and Visitor Management System.

**Expo SDK 54** — matches the current **Expo Go** app from the App Store / Play Store. If you previously saw an SDK mismatch error, run `npm install` in this folder after pulling changes, then `npm run start` (use `npm run start -- -c` once to clear the Metro cache).

**Metro port:** `npm run start`, `start:lan`, and `start:tunnel` use **port 8085** on purpose so they don’t fight with other tools on **8081** (Cursor, other Expo apps) and don’t hang waiting for “Use another port?” in a non-interactive terminal.

### “MongoDB connected” in the backend terminal but the app says database / 503

Expo Go on your **phone** only talks to **your API over HTTP** (LocalTunnel/LAN). It never connects to MongoDB directly. If `EXPO_PUBLIC_API_URL` is wrong, the tunnel targets the wrong port, or the tunnel died, you’ll get **503** even though MongoDB is fine on the PC.

1. In the **backend** terminal, note the real port: `Server listening on http://0.0.0.0:XXXX`.
2. Run **`npm run tunnel`** (or ngrok) to **that same port** `XXXX` — not an old port.
3. Set **`frontend/.env`**: `EXPO_PUBLIC_API_URL=https://your-tunnel-host/api` and restart Metro: `npm run start:tunnel -- -c`.
4. On the **phone’s browser**, open `https://your-tunnel-host/api/health` — you want JSON with `"dbConnected": true`. If that fails, sign-up cannot work until the URL/tunnel matches.

### If `npm install` fails

- **ENOENT / “Could not read package.json”** — `package.json` was removed. Restore it from Git or copy it from this repo; do **not** delete `package.json`, only `node_modules` and `package-lock.json` if you need a clean install.
- **ERESOLVE / peer dependency errors** — this repo includes [`.npmrc`](./.npmrc) with `legacy-peer-deps=true` so npm can install cleanly with React 19. If you removed `.npmrc`, run: `npm install --legacy-peer-deps`.

## Setup

```bash
npm install
copy .env.example .env
```

Set `EXPO_PUBLIC_API_URL` (must end with `/api`). See the [root README](../README.md) for emulator vs device URLs.

```bash
npm run start
```

### Expo Go: “The request timed out” / `exp://192.168.x.x:8081`

Your phone cannot reach **Metro** on your PC (port **8081**). Try this order:

1. **Tunnel (works most often)** — does not require the phone to see your LAN IP:
   ```bash
   npm run start:tunnel
   ```
   Or: `npx expo start --tunnel`  
   Scan the **new** QR code. First run may ask to install `@expo/ngrok` / sign in; allow it.

   **“ngrok tunnel took too long to connect”** — Expo’s default wait is only 10s. This repo **patches `@expo/cli`** to wait **120s** (and reapplies the patch on `npm install` via `patch-package`). If it still fails: turn off VPN, try another network, run `npx expo login`, or set a longer wait in PowerShell before starting:  
   `$env:EXPO_TUNNEL_TIMEOUT_MS="180000"; npm run start:tunnel`  
   This project defaults Metro to **8085** to avoid **8081** conflicts. If 8085 is busy, run `npx expo start --tunnel --port 8090` (pick any free port).

2. **LAN** (`exp://192.168…`) — if tunnel keeps failing but phone and PC share Wi‑Fi:
   ```bash
   npm run start:lan
   ```
   - Same Wi‑Fi (avoid “guest” networks that block device-to-device).
   - **Windows Firewall:** allow **Node.js** on **Private** networks, or allow **TCP 8081** inbound.
   - Turn off **VPN** on PC or phone while testing.

3. **Backend (login/API)** is separate: tunnel mode **does not** expose port **5000**. The phone can load JS from Expo’s tunnel but **cannot** reach `http://localhost:5000` or your LAN IP unless the network allows it.

### Using Expo tunnel **and** registration / login

You need a **second** tunnel for the API (or fix LAN so plain `npx expo start` works).

**Option A — tunnel the API (typical if you must use `expo start --tunnel`)**

1. Start Mongo + API: from `backend/`, `npm run dev` (or `npm start`).
2. In a **second** terminal, from `backend/`, run:
   ```bash
   npm run tunnel
   ```
   Copy the printed URL (looks like `https://something.loca.lt`).
3. In `frontend/.env` set (use **your** URL, keep `/api` at the end):
   ```env
   EXPO_PUBLIC_API_URL=https://something.loca.lt/api
   ```
4. Restart Metro with a clean cache so env is picked up:
   ```bash
   npx expo start --tunnel -c
   ```

If LocalTunnel shows a browser warning the first time, open that URL once on the PC, then retry the app.

**Option B — LAN for API only**

If the phone can reach your PC on the LAN for port **5000** (firewall / same Wi‑Fi), set `EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:5000/api` while still using `npm run start:tunnel` for Metro.

## Phase 1

Authentication, home/dashboard, profile, and placeholder screens for six feature modules. Feature APIs and uploads arrive in Phase 2.
