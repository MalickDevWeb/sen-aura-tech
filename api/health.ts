export default function handler(_req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    success: true,
    service: "sen-aura-tech-api",
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    timestamp: new Date().toISOString(),
  });
}
