import { neonDbService } from "../../src/db/neon-service";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  }

  try {
    const providers = await neonDbService.getAllProviders();
    return res.json({ success: true, providers: providers || [] });
  } catch (err) {
    console.warn("Vercel providers fallback:", err);
    return res.json({ success: true, providers: [] });
  }
}
