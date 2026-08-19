const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: __dirname + "/.env" });

async function checkUsers() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return;
  const sql = neon(dbUrl);
  try {
    const result = await sql`
      SELECT id, phone, pin, role 
      FROM sat_users
    `;
    console.log("Users in DB:", result);
  } catch (err) {
    console.error(err);
  }
}
checkUsers();
