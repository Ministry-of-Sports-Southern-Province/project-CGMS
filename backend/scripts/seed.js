import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const schemaPath = path.join(root, "database", "schema.sql");
const seedPath = path.join(root, "database", "seed.sql");

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  const schema = fs.readFileSync(schemaPath, "utf8");
  const seed = fs.readFileSync(seedPath, "utf8");

  await connection.query(schema);
  await connection.query(seed);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@mail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "1234";
  const [rows] = await connection.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [adminEmail]);
  if (!rows.length) {
    const password_hash = await bcrypt.hash(adminPassword, 10);
    await connection.execute(
      "INSERT INTO users (name, email, password_hash, role, language_preference, theme_mode, theme_color, created_at) VALUES (?,?,?,?,?,?,?,NOW())",
      ["System Admin", adminEmail, password_hash, "admin", "si", "light", "theme-12"]
    );
  }

  await connection.end();
  console.log("Seed complete");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
