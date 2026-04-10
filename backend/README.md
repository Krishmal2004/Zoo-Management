# Zoo Management API

See the [root README](../README.md) for full setup. Quick start:

```bash
npm install
copy .env.example .env   # Windows — or: cp .env.example .env
```

Edit **`.env`**: set **`MONGODB_URI`** (MongoDB Atlas or local) and a strong **`JWT_SECRET`**. The URI should include a database name, e.g. `...mongodb.net/zoo_management?retryWrites=true&w=majority`.

Sign-up (**`POST /api/auth/register`**) and sign-in (**`POST /api/auth/login`**) read and write the **`users`** collection via Mongoose (`User` model). After registering, check **Atlas → Browse Collections** for your cluster.

```bash
npm run dev
```

**API tunnel (phone testing):** `npm run tunnel` reads **`PORT` from `backend/.env`** so LocalTunnel matches the same port as the API. If the server moved to another port, set `PORT` in `.env` to that value before running the tunnel.
