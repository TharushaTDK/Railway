"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const app = (0, express_1.default)();
const isDev = process.env.NODE_ENV !== "production";
const PORT = (() => {
    const p = process.env.PORT;
    if (p)
        return Number(p);
    if (isDev)
        return 8080;
    throw new Error("PORT not set");
})();
app.use(express_1.default.json());
// Request logger to debug routes
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
    app.use((0, cors_1.default)({ origin: corsOrigin }));
}
else if (isDev) {
    app.use((0, cors_1.default)({ origin: "http://localhost:5173" }));
}
app.get("/api/health", (_req, res) => {
    res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});
app.get("/api/contacts", async (_req, res) => {
    const pool = (0, db_1.getPool)();
    if (!pool) {
        res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
        return;
    }
    try {
        const result = await pool.query(`SELECT id, name, email, created_at FROM ${(0, db_1.table)("contacts")} ORDER BY id DESC`);
        res.json(result.rows);
    }
    catch {
        res.status(500).json({ error: "Failed to fetch contacts" });
    }
});
app.post("/api/contacts", async (req, res) => {
    const pool = (0, db_1.getPool)();
    if (!pool) {
        res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
        return;
    }
    const { name, email } = req.body;
    if (!name || typeof name !== "string" || !email || typeof email !== "string") {
        res.status(400).json({ error: "name and email are required" });
        return;
    }
    try {
        const result = await pool.query(`INSERT INTO ${(0, db_1.table)("contacts")} (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at`, [name, email]);
        res.status(201).json(result.rows[0]);
    }
    catch {
        res.status(500).json({ error: "Failed to create contact" });
    }
});
app.get("/api/todos", async (_req, res) => {
    const pool = (0, db_1.getPool)();
    if (!pool) {
        res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
        return;
    }
    try {
        const result = await pool.query(`SELECT id, title, completed, created_at FROM ${(0, db_1.table)("todos")} ORDER BY id DESC`);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch todos" });
    }
});
app.post("/api/todos", async (req, res) => {
    const pool = (0, db_1.getPool)();
    if (!pool) {
        res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
        return;
    }
    const { title } = req.body;
    if (!title || typeof title !== "string") {
        res.status(400).json({ error: "title is required" });
        return;
    }
    try {
        const result = await pool.query(`INSERT INTO ${(0, db_1.table)("todos")} (title) VALUES ($1) RETURNING id, title, completed, created_at`, [title]);
        res.status(201).json(result.rows[0]);
    }
    catch {
        res.status(500).json({ error: "Failed to create todo" });
    }
});
app.patch("/api/todos/:id", async (req, res) => {
    const pool = (0, db_1.getPool)();
    if (!pool) {
        res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
        return;
    }
    const id = Number(req.params.id);
    const { completed } = req.body;
    if (!Number.isFinite(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
    }
    try {
        const result = await pool.query(`UPDATE ${(0, db_1.table)("todos")} SET completed = $1 WHERE id = $2 RETURNING id, title, completed, created_at`, [Boolean(completed), id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        res.json(result.rows[0]);
    }
    catch {
        res.status(500).json({ error: "Failed to update todo" });
    }
});
app.delete("/api/todos/:id", async (req, res) => {
    const pool = (0, db_1.getPool)();
    if (!pool) {
        res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
        return;
    }
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
    }
    try {
        const result = await pool.query(`DELETE FROM ${(0, db_1.table)("todos")} WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        res.status(204).send();
    }
    catch {
        res.status(500).json({ error: "Failed to delete todo" });
    }
});
const serveStatic = process.env.SERVE_STATIC === "true";
if (serveStatic) {
    const publicDir = path_1.default.join(__dirname, "../public");
    app.use(express_1.default.static(publicDir));
    app.get("*", (_req, res) => {
        res.sendFile(path_1.default.join(publicDir, "index.html"));
    });
}
(0, db_1.initDB)().finally(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
