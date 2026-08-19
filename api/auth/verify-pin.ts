import crypto from "crypto";
import { withErrorBoundary, readJson, VercelRequest, VercelResponse } from "../middleware/handler";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

function signJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp: now + 7 * 24 * 60 * 60 })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

async function verifyPinHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  }

  try {
    const { neonDbService } = await import("../../src/db/neon-service");
    const { phone, pin } = await readJson(req);
    if (!phone || !pin) {
      return res.status(400).json({ success: false, error: "Téléphone et PIN requis." });
    }

    const user = await neonDbService.getUserByPhone(phone);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Ce numéro n'a pas encore de compte configuré. Créez votre compte en définissant votre code PIN.",
      });
    }

    if (user.pin !== pin) {
      return res.status(401).json({ success: false, error: "Code PIN incorrect." });
    }

    const userData = user.data && typeof user.data === "object" ? user.data : {};
    const account = {
      id: user.id,
      fullName: user.full_name || user.fullName,
      email: user.email,
      phone: user.phone,
      cleanPhone: (user.phone || "").replace(/\D/g, "").slice(-9),
      role: user.role || "CLIENT",
      region: user.region || "Dakar",
      createdAt: user.created_at || new Date().toISOString(),
      proStatus: userData.proStatus || user.proStatus || undefined,
      proApproved: userData.proApproved || user.proApproved || false,
      trialExpiresAt: userData.trialExpiresAt || user.trialExpiresAt || undefined,
      proFreeTrialActive: userData.proFreeTrialActive || user.proFreeTrialActive || false,
    };

    return res.json({
      success: true,
      account,
      token: signJwt({ sub: account.id, phone: account.phone, role: account.role, email: account.email }),
    });
  } catch (err: any) {
    const isMissingDatabaseUrl = err?.message?.includes("DATABASE_URL");
    return res.status(isMissingDatabaseUrl ? 503 : 500).json({
      success: false,
      error: isMissingDatabaseUrl
        ? "Connexion impossible : la base de données n'est pas configurée sur le serveur."
        : "Erreur serveur lors de la vérification du PIN.",
    });
  }
}

export default withErrorBoundary(verifyPinHandler);
