const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: __dirname + "/.env" });

async function checkTables() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Database URL is missing from .env");
    return;
  }
  const sql = neon(dbUrl);
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Tables in database:");
    result.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    console.log(`\nTotal tables: ${result.length}`);
  } catch (err) {
    console.error("Error:", err);
  }
}

checkTables();
