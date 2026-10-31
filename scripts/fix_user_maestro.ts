import { Pool } from "pg";
import { createHash } from "crypto";

function sha256(str: string) {
  return createHash("sha256").update(str).digest("hex");
}

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_XZhHCQ4L9zbj@ep-dry-field-barihkn7-pooler.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

  console.log("Connecting directly via pg Pool to Neon...");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  const client = await pool.connect();
  console.log("Connected successfully to Neon PostgreSQL!");

  const res = await client.query('SELECT id, name, username, phone, pin, role, "passwordHash" FROM "User"');
  console.log("Existing users in User table:", res.rows);

  const maestroPwHash = sha256("123456789");
  console.log("Maestro sha256 hash:", maestroPwHash);

  // Check if maestro exists
  const maestroFound = res.rows.find(
    (u: any) =>
      (u.username && u.username.toLowerCase() === "maestro") ||
      u.phone === "01019845220"
  );

  if (maestroFound) {
    console.log("Found existing user to upgrade to maestro:", maestroFound.id);
    await client.query(
      'UPDATE "User" SET name = $1, username = $2, "passwordHash" = $3, pin = $4, role = $5, department = $6 WHERE id = $7',
      [
        "المالك المايسترو (حمزة)",
        "maestro",
        maestroPwHash,
        "157230",
        "owner",
        "الإدارة العليا",
        maestroFound.id,
      ]
    );
    console.log("Updated maestro record!");
  } else {
    console.log("Inserting new maestro user...");
    await client.query(
      'INSERT INTO "User" (id, name, username, "passwordHash", phone, pin, role, department) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        "user_maestro_owner",
        "المالك المايسترو (حمزة)",
        "maestro",
        maestroPwHash,
        "01019845220",
        "157230",
        "owner",
        "الإدارة العليا",
      ]
    );
    console.log("Inserted maestro record!");
  }

  // Also make sure if there is any user with username 'maestro' it has exact pin 157230 and hash
  await client.query(
    'UPDATE "User" SET "passwordHash" = $1, pin = $2, role = $3 WHERE username = $4',
    [maestroPwHash, "157230", "owner", "maestro"]
  );

  const finalCheck = await client.query('SELECT id, name, username, phone, pin, role, "passwordHash" FROM "User" WHERE username = $1', ["maestro"]);
  console.log("Verified maestro in database:", finalCheck.rows[0]);

  client.release();
  await pool.end();
}

main().catch(console.error);
