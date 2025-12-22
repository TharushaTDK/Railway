const { Client } = require("pg");

async function main() {
  const host = process.env.PGHOST ;
  const port = Number(process.env.PGPORT);
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const dbname = process.env.PGDBNAME;

  const client = new Client({
    host,
    port,
    user,
    password,
    database: "postgres",
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    const check = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbname]);
    if (check.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbname}"`);
      console.log("Database created:", dbname);
    } else {
      console.log("Database exists:", dbname);
    }
  } catch (err) {
    console.error("DB create error:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
