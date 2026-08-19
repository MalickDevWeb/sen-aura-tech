import "dotenv/config";
import path from "path";
import { createServer as createViteServer } from "vite";
import express from "express";
import app from "./api/index.ts";

async function startServer() {
  const PORT = Number(process.env.PORT || 3000);

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SEN AURA TECH Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
