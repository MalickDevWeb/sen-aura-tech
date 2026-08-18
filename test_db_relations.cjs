const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: __dirname + "/.env" });

async function checkForeignKeys() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Database URL is missing from .env");
    return;
  }
  const sql = neon(dbUrl);
  try {
    const result = await sql`
      SELECT
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public';
    `;
    
    if (result.length === 0) {
      console.log("No explicit FOREIGN KEY constraints found in the schema.");
    } else {
      console.log("Foreign Key Relationships found:");
      result.forEach((row, idx) => {
        console.log(`${idx + 1}. [${row.table_name}](${row.column_name}) -> [${row.foreign_table_name}](${row.foreign_column_name})`);
      });
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkForeignKeys();
