import { neonDbService } from "../../src/db/neon-service";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  }

  try {
    const products = await neonDbService.getAllProducts();
    return res.json({ success: true, products: products || [] });
  } catch (err) {
    console.warn("Vercel products fallback:", err);
    return res.json({ success: true, products: [] });
  }
}
