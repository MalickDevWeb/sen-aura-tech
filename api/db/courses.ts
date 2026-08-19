import { neonDbService } from "../../src/db/neon-service";
import { withErrorBoundary, VercelRequest, VercelResponse } from "../middleware/handler";

async function coursesHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Méthode non autorisée." });
  }

  try {
    const courses = await neonDbService.getAllCourses();
    return res.json({ success: true, courses: courses || [] });
  } catch (err) {
    console.warn("Vercel courses fallback:", err);
    return res.json({ success: true, courses: [] });
  }
}

export default withErrorBoundary(coursesHandler);
