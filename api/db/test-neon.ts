async function testNeonHandler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  }

  try {
    // Test 1: Import sql
    console.log("[TEST] Importing sql from neon...");
    const { sql } = await import("../../src/db/neon");
    console.log("[TEST] sql imported:", typeof sql);

    // Test 2: Simple query
    console.log("[TEST] Running SELECT 1...");
    const result = await sql`SELECT 1 as test`;
    console.log("[TEST] SELECT 1 result:", result);

    // Test 3: Count users
    console.log("[TEST] Counting sat_users...");
    const countResult = await sql`SELECT COUNT(*) as cnt FROM sat_users`;
    console.log("[TEST] Count result:", countResult);

    return res.json({
      success: true,
      test1: "sql imported",
      test2: result,
      test3: countResult,
    });
  } catch (err: any) {
    console.error("[TEST_NEON_ERROR]", err?.message || err, err?.stack);
    return res.status(500).json({
      success: false,
      error: err?.message || "Unknown error",
      stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
    });
  }
}

export default async function handler(req: any, res: any) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();
    return await testNeonHandler(req, res);
  } catch (error) {
    console.error("[TEST_HANDLER_ERROR]", error);
    if (!res.headersSent) return res.status(500).json({ success: false, error: "Handler error" });
  }
}
