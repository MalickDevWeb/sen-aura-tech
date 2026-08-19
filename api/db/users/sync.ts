import { handleOptions, getSql } from "../../_route-utils";

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Méthode non autorisée." });

  try {
    const input = req.body || {};
    const user = input.user || input;
    const pin = String(input.pin || user.pin || "1234");
    if (!user.id || !user.phone) return res.status(400).json({ success: false, error: "Données utilisateur manquantes." });

    const sql = await getSql();
    const rows = await sql`
      INSERT INTO sat_users (id, full_name, email, phone, role, region, pin, verified, password_hash, updated_at)
      VALUES (${user.id}, ${user.fullName || user.full_name || "Utilisateur"}, ${user.email || ""}, ${user.phone}, ${user.role || "CLIENT"}, ${user.region || "Dakar"}, ${pin}, ${user.verified || false}, ${user.passwordHash || null}, NOW())
      ON CONFLICT (phone) DO UPDATE SET
        full_name = EXCLUDED.full_name, email = EXCLUDED.email, role = EXCLUDED.role,
        region = EXCLUDED.region, pin = EXCLUDED.pin, verified = EXCLUDED.verified,
        password_hash = EXCLUDED.password_hash, updated_at = NOW()
      RETURNING id, full_name, email, phone, role, region, verified, status, created_at, updated_at;
    `;
    return res.json({ success: true, user: rows[0] });
  } catch (error: any) {
    console.error("[DB_USERS_SYNC]", error);
    return res.status(500).json({ success: false, error: "Erreur lors de la synchronisation du compte." });
  }
}