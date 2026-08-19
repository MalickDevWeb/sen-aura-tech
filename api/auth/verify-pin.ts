import crypto from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

function signJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp: now + 7 * 24 * 60 * 60 })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

async function readJson(req: any) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "object") return req.body;
    if (typeof req.body === "string") return req.body ? JSON.parse(req.body) : {};
  }

  if (!req || typeof req[Symbol.asyncIterator] !== "function") return {};

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

async function verifyPinHandler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  }

  try {
    const { phone, pin } = await readJson(req);
    if (!phone || !pin) {
      return res.status(400).json({ success: false, error: "Téléphone et PIN requis." });
    }

    const { neonDbService } = await import("../../src/db/neon-service");
    const normalizedPhone = neonDbService.normalizePhone(phone);
    const rows = await neonDbService.getUserByPhone(normalizedPhone);
    
    if (!rows) {
      return res.status(404).json({
        success: false,
        error: "Ce numéro n'a pas encore de compte configuré. Créez votre compte en définissant votre code PIN.",
      });
    }

    if (rows.pin !== pin) {
      return res.status(401).json({ success: false, error: "Code PIN incorrect." });
    }

    const userData = rows.data && typeof rows.data === "object" ? rows.data : {};
    const account = {
      id: rows.id,
      fullName: rows.full_name || rows.fullName,
      email: rows.email,
      phone: rows.phone,
      cleanPhone: (rows.phone || "").replace(/\D/g, "").slice(-9),
      role: rows.role || "CLIENT",
      region: rows.region || "Dakar",
      createdAt: rows.created_at || new Date().toISOString(),
      proStatus: userData.proStatus || rows.proStatus || undefined,
      proApproved: userData.proApproved || rows.proApproved || false,
      trialExpiresAt: userData.trialExpiresAt || rows.trialExpiresAt || undefined,
      proFreeTrialActive: userData.proFreeTrialActive || rows.proFreeTrialActive || false,
    };

    return res.json({
      success: true,
      account,
      token: signJwt({ sub: account.id, phone: account.phone, role: account.role, email: account.email }),
    });
  } catch (err: any) {
    console.error("[VERIFY_PIN_DATABASE_ERROR]", err?.message || err);
    const isMissingDatabaseUrl = err?.message?.includes("DATABASE_URL");
    return res.status(503).json({
      success: false,
      error: isMissingDatabaseUrl
        ? "Connexion impossible : la base de données n'est pas configurée sur le serveur."
        : "Base de données temporairement indisponible. Réessayez dans quelques instants.",
    });
  }
}

export default async function handler(req: any, res: any) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(200).end();
    return await verifyPinHandler(req, res);
  } catch (error) {
    console.error("[VERIFY_PIN_HANDLER_ERROR]", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: "Une erreur serveur est survenue. Veuillez réessayer.",
      });
    }
  }
}
