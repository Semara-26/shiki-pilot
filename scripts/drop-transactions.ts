import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query("DROP TABLE IF EXISTS transactions CASCADE;");
    await client.query("DROP TABLE IF EXISTS transaction_items CASCADE;");
    console.log("Tables dropped.");
  } catch (error) {
    console.error("Error dropping tables:", error);
  } finally {
    client.release();
    pool.end();
  }
}

main();
