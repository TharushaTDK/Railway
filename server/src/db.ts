import { Pool } from "pg";

let pool: Pool | null = null;
export const schema = process.env.PG_SCHEMA || "public";
export const table = (name: string) => `"${schema}"."${name}"`;

export const getPool = () => pool;

export const initDB = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL is not set. API will respond with 503 for DB-backed routes.");
    return;
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

  try {
    pool.on("connect", (client) => {
      client.query(`SET search_path TO "${schema}"`);
    });
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS ${table("todos")} (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );
    `
    );
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS ${table("contacts")} (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );
    `
    );
    console.log("✅ Database connected and initialized");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
};
