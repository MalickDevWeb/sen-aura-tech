const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: __dirname + "/.env" });

async function checkSchema() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return;
  const sql = neon(dbUrl);
  try {
    const result = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('sat_orders', 'sat_products')
      ORDER BY table_name, ordinal_position;
    `;
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}
checkSchema();
