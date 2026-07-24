import { config } from "dotenv";
import postgres from "postgres";
import fs from "fs";
import path from "path";

config({ path: ".env.local" });

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error("No DATABASE_URL found");
    return;
  }
  const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });
  try {
    const query = fs.readFileSync(path.join(__dirname, "drizzle/0005_add_whatsapp_jid.sql"), "utf-8");
    await sql.unsafe(query);
    console.log("Migration applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

runMigration();
