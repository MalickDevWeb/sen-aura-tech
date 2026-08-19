import { neonDbService } from "../../src/db/neon-service";

async function readBody(req: any) {
  if (req.body) return req.body;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  }

  try {
    const { phone, pin } = await readBody(req);
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
    return res.json({
      success: true,
      account: {
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
      },
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
