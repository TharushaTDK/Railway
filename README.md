# Run Guide (.env + Frontend + Backend)

## Create .env
- Create a file named `.env` in the project root.
- Do not commit `.env`. Use it only for local development.
- Paste and edit these values as needed:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/railway_sample
PG_SCHEMA=public
CORS_ORIGIN=http://localhost:5173
SERVE_STATIC=true
# Optional: set PORT for production; dev falls back to 8080
```
- A template exists at `.env.example` if you need a reference.

## Install
```
npm install
```

## Run Frontend + Backend (Dev)
```
npm run dev
```
- Frontend: `http://localhost:5173/`
- Backend: `http://localhost:8080/`
- Health: `GET /api/health`

## Run Backend (Prod-like)
```
npm run build
$env:PORT = "8080"
npm start
```
- With `SERVE_STATIC=true`, the backend serves the built frontend at `/`.
