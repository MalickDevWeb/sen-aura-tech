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

    const { sql } = await import("../../src/db/neon");
    const normalizedPhone = String(phone).replace(/\D/g, "").slice(-9);
    if (normalizedPhone.length !== 9) {
      return res.status(400).json({ success: false, error: "Numéro de téléphone invalide." });
    }

    const rows = await sql`
      SELECT * FROM sat_users
      WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 9) = ${normalizedPhone}
      LIMIT 1;
    `;
    const user = rows[0] || null;
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
