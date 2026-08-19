async function testNeonHandler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  }

  try {
    // Test 1: Import neonDbService
    console.log("[TEST] Importing neonDbService...");
    const { neonDbService } = await import("../../src/db/neon-service");
    console.log("[TEST] neonDbService imported:", typeof neonDbService);

    // Test 2: Get all users
    console.log("[TEST] Getting all users...");
    const allUsers = await neonDbService.getAllUsers();
    console.log("[TEST] Users count:", allUsers?.length);
    console.log("[TEST] First user:", allUsers?.[0]);

    return res.json({
      success: true,
      userCount: allUsers?.length || 0,
      firstUser: allUsers?.[0] || null,
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
