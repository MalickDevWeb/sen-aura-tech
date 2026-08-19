import crypto from "node:crypto";

function setCors(res: any) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function isAuthorized(req: any, res: any) {
	const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "").trim();
	if (!token) return res.status(401).json({ success: false, error: "Token d'accès manquant." });
	try {
		const [header, body, signature] = token.split(".");
		const secret = process.env.JWT_SECRET || "dev-secret-change-in-production";
		const expected = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
		const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
		if (!header || !body || signature !== expected || (payload.exp && Date.now() / 1000 > payload.exp)) throw new Error("invalid token");
		return true;
	} catch {
		return res.status(401).json({ success: false, error: "Token invalide ou expiré." });
	}
}

function mapProduct(row: any) {
	return {
		id: row.id,
		name: row.name,
		title: row.name,
		category: row.category,
		brand: row.brand,
		price: Number(row.price_fcfa) || 0,
		priceFCFA: Number(row.price_fcfa) || 0,
		stock: Number(row.stock) || 0,
		rating: Number(row.rating) || 4.9,
		image: row.image_url,
		imageUrl: row.image_url,
		mainMediaUrl: row.image_url,
		description: row.short_desc || "",
		specs: row.specs || {},
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export default async function handler(req: any, res: any) {
	setCors(res);
	if (req.method === "OPTIONS") return res.status(204).end();
	if (!isAuthorized(req, res)) return;

	try {
		const databaseUrl = process.env.DATABASE_URL;
		if (!databaseUrl) return res.status(503).json({ success: false, error: "DATABASE_URL manquante." });
		const { neon } = await import("@neondatabase/serverless");
		const sql = neon(databaseUrl);
		const productId = String(req.query?.id || "");

		if (req.method === "DELETE" && productId) {
			await sql`DELETE FROM sat_products WHERE id = ${productId};`;
			return res.json({ success: true, message: "Produit supprimé." });
		}

		if (req.method === "GET") {
			const rows = await sql`SELECT * FROM sat_products ORDER BY created_at DESC LIMIT 200;`;
			return res.json({ success: true, count: rows.length, products: rows.map(mapProduct) });
		}

		if (req.method === "POST") {
			const body = req.body || {};
			const id = body.id || `VND-PROD-${crypto.randomUUID().slice(0, 8)}`;
			const name = body.name || body.title || "Nouveau produit";
			const price = Number(body.priceFCFA || body.price || 0);
			const rows = await sql`
				INSERT INTO sat_products (id, name, category, brand, price_fcfa, stock, image_url, short_desc, specs)
				VALUES (${id}, ${name}, ${body.category || "Matériels Tech"}, ${body.brand || "SEN AURA"}, ${price}, ${Number(body.stock || 0)}, ${body.imageUrl || body.image || ""}, ${body.description || ""}, ${JSON.stringify(body.specs || {})})
				ON CONFLICT (id) DO UPDATE SET
					name = EXCLUDED.name, category = EXCLUDED.category, brand = EXCLUDED.brand,
					price_fcfa = EXCLUDED.price_fcfa, stock = EXCLUDED.stock, image_url = EXCLUDED.image_url,
					short_desc = EXCLUDED.short_desc, specs = EXCLUDED.specs, updated_at = NOW()
				RETURNING *;
			`;
			return res.json({ success: true, product: mapProduct(rows[0]) });
		}

		return res.status(405).json({ success: false, error: "Méthode non autorisée." });
	} catch (error: any) {
		console.error("[VENDOR_PRODUCTS]", error);
		return res.status(500).json({ success: false, error: error?.message || "Erreur lors de l'accès aux produits." });
	}
}