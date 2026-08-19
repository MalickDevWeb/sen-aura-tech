/**
 * Wraps Vercel serverless handlers with:
 * - Error boundary to catch any uncaught exceptions
 * - CORS headers
 * - JSON response formatting
 * - Proper error logging
 */

export type VercelRequest = any;
export type VercelResponse = any;
export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

export function withErrorBoundary(handler: Handler) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      // Set CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

      // Handle OPTIONS requests
      if (req.method === "OPTIONS") {
        return res.status(200).end();
      }

      // Execute handler
      await handler(req, res);
    } catch (error) {
      console.error("[HANDLER_ERROR]", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: req.url,
        method: req.method,
      });

      // Ensure we don't send multiple responses
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Une erreur serveur est survenue. Veuillez réessayer.",
        });
      }
    }
  };
}

/**
 * Helper to read JSON body safely
 */
export async function readJson(req: VercelRequest) {
  if (req.body) return req.body;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}
