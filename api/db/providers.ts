import { withErrorBoundary, VercelRequest, VercelResponse } from "../middleware/handler";

async function providersHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  }

  try {
    const { neonDbService } = await import("../../src/db/neon-service");
    const providers = await neonDbService.getAllProviders();
    return res.json({ success: true, providers: providers || [] });
  } catch (err) {
    console.warn("Vercel providers fallback:", err);
    return res.json({ success: true, providers: [] });
  }
}

export default withErrorBoundary(providersHandler);
