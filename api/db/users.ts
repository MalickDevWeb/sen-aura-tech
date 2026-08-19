import { handleOptions, requireJwt, getSql } from "../_route-utils";

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  if (!requireJwt(req, res, "ADMIN")) return;

  try {
    const sql = await getSql();
    const rows = await sql`SELECT id, full_name, email, phone, role, region, verified, status, created_at, updated_at FROM sat_users ORDER BY created_at DESC;`;
    return res.json({ success: true, users: rows.map((row: any) => ({
      id: row.id, fullName: row.full_name, email: row.email, phone: row.phone,
      role: row.role, region: row.region || "Dakar", verified: row.verified || false,
      status: row.status || "ACTIF", createdAt: row.created_at, updatedAt: row.updated_at,
    })) });
  } catch (error: any) {
    console.error("[DB_USERS_GET]", error);
    return res.status(500).json({ success: false, error: "Erreur lors de la récupération des utilisateurs." });
  }
}