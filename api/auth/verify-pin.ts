import crypto from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const DATABASE_URL = process.env.DATABASE_URL || "";

function signJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp: now + 7 * 24 * 60 * 60 })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

function normalizePhone(phone: string = ""): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00221") && digits.length > 9) return digits.slice(5).slice(-9);
  if (digits.startsWith("221") && digits.length > 9) return digits.slice(3).slice(-9);
  return digits.slice(-9);
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

    if (!DATABASE_URL) {
      return res.status(503).json({
        success: false,
        error: "Connexion impossible : la base de données n'est pas configurée sur le serveur.",
      });
    }

    // Import neon dynamically
    console.log("[VERIFY_PIN] Importing neon...");
    const { neon } = await import("@neondatabase/serverless");
    console.log("[VERIFY_PIN] Creating sql function...");
    const sql = neon(DATABASE_URL);
    const normalizedPhone = normalizePhone(phone);
    console.log("[VERIFY_PIN] Normalized phone:", normalizedPhone);
    
    // Fetch all users and filter by phone pattern
    console.log("[VERIFY_PIN] Fetching users...");
    const allUsers = await sql`SELECT id, full_name, email, phone, pin, role, region, data, created_at FROM sat_users LIMIT 100;`;
    console.log("[VERIFY_PIN] Got", allUsers?.length, "users");
    
    const user = allUsers.find((u: any) => {
      const userDigits = (u.phone || "").replace(/\D/g, "").slice(-9);
      return userDigits === normalizedPhone;
    }) || null;
    
    if (!user) {
      console.log("[VERIFY_PIN] User not found for phone:", phone);
      return res.status(404).json({
        success: false,
        error: "Ce numéro n'a pas encore de compte configuré. Créez votre compte en définissant votre code PIN.",
      });
    }

    if (String(user.pin) !== String(pin)) {
      console.log("[VERIFY_PIN] PIN mismatch");
      return res.status(401).json({ success: false, error: "Code PIN incorrect." });
    }

    const userData = user.data && typeof user.data === "object" ? user.data : {};
    const account = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      cleanPhone: normalizedPhone,
      role: user.role || "CLIENT",
      region: user.region || "Dakar",
      createdAt: user.created_at,
      proStatus: userData.proStatus,
      proApproved: userData.proApproved || false,
      trialExpiresAt: userData.trialExpiresAt,
      proFreeTrialActive: userData.proFreeTrialActive || false,
    };

    console.log("[VERIFY_PIN] Login successful for:", account.fullName);
    return res.json({
      success: true,
      account,
      token: signJwt({ sub: account.id, phone: account.phone, role: account.role, email: account.email }),
    });
  } catch (err: any) {
    console.error("[VERIFY_PIN_ERROR]", err?.message || err, err?.stack);
    // Always return debug info for now
    return res.status(500).json({
      success: false,
      error: err?.message || "Erreur serveur lors de la vérification du PIN.",
      fullError: String(err),
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
