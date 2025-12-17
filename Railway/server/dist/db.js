"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDB = exports.getPool = exports.table = exports.schema = void 0;
const pg_1 = require("pg");
let pool = null;
exports.schema = process.env.PG_SCHEMA || "public";
const table = (name) => `"${exports.schema}"."${name}"`;
exports.table = table;
const getPool = () => pool;
exports.getPool = getPool;
const initDB = async () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.warn("DATABASE_URL is not set. API will respond with 503 for DB-backed routes.");
        return;
    }
    pool = new pg_1.Pool({
        connectionString,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
    try {
        pool.on("connect", (client) => {
            client.query(`SET search_path TO "${exports.schema}"`);
        });
        await pool.query(`CREATE SCHEMA IF NOT EXISTS "${exports.schema}";`);
        await pool.query(`
      CREATE TABLE IF NOT EXISTS ${(0, exports.table)("todos")} (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );
    `);
    }
    catch (err) {
        console.error("Failed to initialize database:", err);
    }
};
exports.initDB = initDB;
