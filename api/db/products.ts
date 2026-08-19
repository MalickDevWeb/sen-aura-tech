import { withErrorBoundary, VercelRequest, VercelResponse } from "../middleware/handler";

async function productsHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  }

  try {
    const { neonDbService } = await import("../../src/db/neon-service");
    const products = await neonDbService.getAllProducts();
    return res.json({ success: true, products: products || [] });
  } catch (err) {
    console.warn("Vercel products fallback:", err);
    return res.json({ success: true, products: [] });
  }
}

export default withErrorBoundary(productsHandler);
