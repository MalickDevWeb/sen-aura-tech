import crypto from "node:crypto";

export function setCors(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function requireJwt(req: any, res: any, requiredRole?: string) {
  const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    res.status(401).json({ success: false, error: "Token d'accès manquant." });
    return null;
  }

  try {
    const [header, body, signature] = token.split(".");
    const secret = process.env.JWT_SECRET || "dev-secret-change-in-production";
    const expected = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!header || !body || !signature || signature !== expected || (payload.exp && Date.now() / 1000 > payload.exp)) {
      throw new Error("invalid token");
    }
    if (requiredRole && payload.role !== requiredRole) {
      res.status(403).json({ success: false, error: "Accès administrateur requis." });
      return null;
    }
    return payload;
  } catch {
    res.status(401).json({ success: false, error: "Token invalide ou expiré." });
    return null;
  }
}

export function handleOptions(req: any, res: any) {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is required");
  return import("@neondatabase/serverless").then(({ neon }) => neon(url));
}