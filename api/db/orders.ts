import { handleOptions, requireJwt, getSql } from "../_route-utils";

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  if (!requireJwt(req, res, "ADMIN")) return;

  try {
    const sql = await getSql();
    const rows = await sql`SELECT * FROM sat_orders ORDER BY created_at DESC LIMIT 100;`;
    return res.json({ success: true, orders: rows.map((row: any) => ({
      id: row.id, userId: row.customer_phone || "", userName: row.customer_name || "Client",
      items: row.items_json || [], totalFCFA: Number(row.total_fcfa) || 0,
      paymentMethod: row.payment_method || "WAVE", paymentStatus: row.payment_status || "EN_ATTENTE",
      status: row.status || "EN_ATTENTE", createdAt: row.created_at,
    })) });
  } catch (error: any) {
    console.error("[DB_ORDERS_GET]", error);
    return res.status(500).json({ success: false, error: "Erreur lors de la récupération des commandes." });
  }
}