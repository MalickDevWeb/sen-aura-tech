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

    // Temporary: database not fully operational, return 503
    return res.status(503).json({
      success: false,
      error: "Le service de vérification des PIN est actuellement indisponible. Veuillez réessayer ultérieurement.",
    });
  } catch (err: any) {
    console.error("[VERIFY_PIN_ERROR]", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Erreur serveur.",
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
