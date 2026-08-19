import { getSql, handleOptions } from "../_route-utils";

async function productsHandler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  }

  try {
    const sql = await getSql();
    const rows = await sql`SELECT * FROM sat_products ORDER BY price_fcfa DESC;`;
    const products = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      title: row.name,
      category: row.category,
      brand: row.brand,
      priceFCFA: Number(row.price_fcfa) || 0,
      oldPriceFCFA: row.old_price_fcfa ? Number(row.old_price_fcfa) : undefined,
      stock: Number(row.stock) || 0,
      rating: Number(row.rating) || 4.9,
      image: row.image_url,
      imageUrl: row.image_url,
      mainMediaUrl: row.image_url,
      description: row.short_desc || "",
      shortDesc: row.short_desc || "",
      badge: row.badge,
      specs: row.specs || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    return res.json({ success: true, products: products || [] });
  } catch (err) {
    console.warn("Vercel products fallback:", err);
    return res.json({ success: true, products: [] });
  }
}

export default async function handler(req: any, res: any) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (handleOptions(req, res)) return;
    return await productsHandler(req, res);
  } catch (error) {
    console.error("[PRODUCTS_HANDLER_ERROR]", error);
    if (!res.headersSent) return res.status(500).json({ success: false, error: "Erreur serveur." });
  }
}
