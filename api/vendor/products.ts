import crypto from "node:crypto";
import { handleOptions, requireJwt, getSql } from "../_route-utils";

function mapProduct(row: any) {
  return { id: row.id, name: row.name, title: row.name, category: row.category, brand: row.brand,
    price: Number(row.price_fcfa) || 0, priceFCFA: Number(row.price_fcfa) || 0, stock: row.stock || 0,
    rating: Number(row.rating) || 0, image: row.image_url, imageUrl: row.image_url, description: row.short_desc,
    specs: row.specs || {}, createdAt: row.created_at, updatedAt: row.updated_at };
}

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  if (!requireJwt(req, res)) return;

  try {
    const sql = await getSql();
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM sat_products ORDER BY created_at DESC LIMIT 200;`;
      return res.json({ success: true, count: rows.length, products: rows.map(mapProduct) });
    }
    if (req.method === "POST") {
      const body = req.body || {};
      const id = body.id || `VND-PROD-${crypto.randomUUID().slice(0, 8)}`;
      const name = body.name || body.title || "Nouveau produit";
      const price = Number(body.priceFCFA || body.price || 0);
      const rows = await sql`INSERT INTO sat_products (id, name, category, brand, price_fcfa, stock, image_url, short_desc, specs) VALUES (${id}, ${name}, ${body.category || "Matériels Tech"}, ${body.brand || "SEN AURA"}, ${price}, ${Number(body.stock || 0)}, ${body.imageUrl || body.image || ""}, ${body.description || ""}, ${JSON.stringify(body.specs || {})}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category, brand = EXCLUDED.brand, price_fcfa = EXCLUDED.price_fcfa, stock = EXCLUDED.stock, image_url = EXCLUDED.image_url, short_desc = EXCLUDED.short_desc, specs = EXCLUDED.specs, updated_at = NOW() RETURNING *;`;
      return res.json({ success: true, product: mapProduct(rows[0]) });
    }
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  } catch (error: any) {
    console.error("[VENDOR_PRODUCTS]", error);
    return res.status(500).json({ success: false, error: "Erreur lors de l'accès aux produits." });
  }
}