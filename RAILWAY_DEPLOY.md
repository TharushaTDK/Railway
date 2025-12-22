# Railway Deployment Guide (Step‑by‑Step)

This app has:
- Backend: Node.js + TypeScript + Express + Postgres (`server/`)
- Frontend: React + TypeScript + Vite (`client/`)

Deploy either as two services (recommended) or as a single service.

**Prepare Repository**
- Ensure root has `package.json`, `server/`, `client/`, and `vite.config.ts`.
- Ensure `Procfile` exists (content: `web: npm start`) to force Node.js execution.
- Push to GitHub/GitLab. Do not commit `.env`.

**Add Postgres**
- In Railway project → Add New → PostgreSQL.
- Open Postgres → Connect tab → copy `DATABASE_URL`.

**Deploy Backend (separate service)**
- Add New → Service → Deploy from Repo → select repo.
- Variables:
  - `DATABASE_URL` = from Postgres
  - `PG_SCHEMA` = `public`
  - `CORS_ORIGIN` = your frontend URL (to be set after frontend deploy)
  - `SERVE_STATIC` = `false`
- Build & Start:
  - Build: `npm run build`
  - Start: `npm start`
- Deploy → check logs → copy backend URL.
- Verify: open `<backend-url>/api/health`.

**Deploy Frontend (separate service)**
- Add New → Static Site → select same repo.
- Root Directory: `client/`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Deploy → copy frontend URL.
- Set backend `CORS_ORIGIN` = frontend URL → redeploy backend.

**Single‑Service Option**
- Backend Variables:
  - `DATABASE_URL` = from Postgres
  - `PG_SCHEMA` = `public`
  - `SERVE_STATIC` = `true`
- Build & Start:
  - Build: `npm run build`
  - Start: `npm start`
- The backend serves the built frontend at `/`.

**Post‑Deploy Checks**
- Health: `<backend-url>/api/health` returns `{ ok: true }`.
- Use the frontend; todos/contacts should persist.
- Optional DB check:
  - `SELECT * FROM public.todos ORDER BY id DESC;`
  - `SELECT * FROM public.contacts ORDER BY id DESC;`

**Troubleshooting**
- 503 on DB routes → set valid `DATABASE_URL`.
- CORS errors → ensure `CORS_ORIGIN` matches frontend origin exactly.
- Build failures → ensure scripts exist and paths match (`client/dist`, `server/public`).
- Ports → do not set `PORT`; Railway provides it.
