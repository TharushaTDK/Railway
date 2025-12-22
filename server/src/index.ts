import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { initDB, getPool, table } from "./db";

const app = express();
const isDev = process.env.NODE_ENV !== "production";
const PORT = (() => {
  const p = process.env.PORT;
  if (p) return Number(p);
  if (isDev) return 8080;
  throw new Error("PORT not set");
})();

app.use(express.json());

// Request logger to debug routes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// CORS setup
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  app.use(cors({ origin: corsOrigin }));
} else if (isDev) {
  app.use(cors({ origin: "http://localhost:5173" }));
}

// --- API Routes ---
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});

app.get("/api/contacts", async (_req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
  try {
    const result = await pool.query(`SELECT id, name, email, created_at FROM ${table("contacts")} ORDER BY id DESC`);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

app.post("/api/contacts", async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: "name and email are required" });
  try {
    const result = await pool.query(
      `INSERT INTO ${table("contacts")} (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at`,
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to create contact" });
  }
});

app.get("/api/todos", async (_req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
  try {
    const result = await pool.query(`SELECT id, title, completed, created_at FROM ${table("todos")} ORDER BY id DESC`);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/api/todos", async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "title is required" });
  try {
    const result = await pool.query(
      `INSERT INTO ${table("todos")} (title) VALUES ($1) RETURNING id, title, completed, created_at`,
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

app.patch("/api/todos/:id", async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
  const id = Number(req.params.id);
  const { completed } = req.body;
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    const result = await pool.query(
      `UPDATE ${table("todos")} SET completed = $1 WHERE id = $2 RETURNING id, title, completed, created_at`,
      [Boolean(completed), id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to update todo" });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    const result = await pool.query(`DELETE FROM ${table("todos")} WHERE id = $1`, [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// --- Serve frontend if exists ---
const publicDir = path.join(__dirname, "../public");
if (fs.existsSync(publicDir)) {
  console.log("Serving static frontend from:", publicDir);
  app.use(express.static(publicDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
} else {
  // Fallback root route if no frontend
  app.get("/", (_req, res) => {
    res.send("API is running. Use /api/contacts or /api/todos");
  });
}

// --- Start server ---
async function startServer() {
  await initDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
