async function coursesHandler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  }

  try {
    const { neonDbService } = await import("../../src/db/neon-service");
    const courses = await neonDbService.getAllCourses();
    return res.json({ success: true, courses: courses || [] });
  } catch (err) {
    console.warn("Vercel courses fallback:", err);
    return res.json({ success: true, courses: [] });
  }
}

export default async function handler(req: any, res: any) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();
    return await coursesHandler(req, res);
  } catch (error) {
    console.error("[COURSES_HANDLER_ERROR]", error);
    if (!res.headersSent) return res.status(500).json({ success: false, error: "Erreur serveur." });
  }
}
