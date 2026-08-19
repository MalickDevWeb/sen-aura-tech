import { sql } from "./src/db/neon.ts";
import { neonDbService } from "./src/db/neon-service.ts";

async function hardClean() {
  console.log("🧹 DÉMARRAGE DU NETTOYAGE COMPLET (NeonDB direct)...");

  try {
    await neonDbService.ensureDb();

    // 1. Sauvegarder l'admin
    const admins = await sql`SELECT * FROM sat_users WHERE full_name = 'Administrateur SEN AURA' LIMIT 1;`;
    const admin = admins.length > 0 ? admins[0] : null;

    // 2. Vider toutes les tables principales
    console.log("🗑️ Suppression de tous les Utilisateurs...");
    await sql`DELETE FROM sat_users;`;

    console.log("🗑️ Suppression de tous les Cours...");
    await sql`DELETE FROM sat_courses;`;

    console.log("🗑️ Suppression de tous les Produits...");
    await sql`DELETE FROM sat_products;`;

    console.log("🗑️ Suppression de tous les Prestataires (Providers)...");
    await sql`DELETE FROM sat_providers;`;

    console.log("🗑️ Suppression de tous les Devis...");
    await sql`DELETE FROM sat_quotes;`;

    console.log("🗑️ Suppression de toutes les Commandes...");
    await sql`DELETE FROM sat_orders;`;

    console.log("🗑️ Suppression de toutes les Réservations...");
    await sql`DELETE FROM sat_bookings;`;

    // 3. Restaurer l'admin si on l'a trouvé
    if (admin) {
      console.log(`🛡️ Restauration de l'admin : ${admin.full_name}`);
      await sql`
        INSERT INTO sat_users (id, full_name, email, phone, role, region, pin, verified, updated_at)
        VALUES (${admin.id}, ${admin.full_name}, ${admin.email}, ${admin.phone}, ${admin.role}, ${admin.region}, ${admin.pin}, ${admin.verified}, NOW());
      `;
    } else {
      console.log("⚠️ Attention: L'admin 'Administrateur SEN AURA' n'a pas été trouvé avant la suppression.");
    }

    console.log("✅ Base de données complètement nettoyée !");
  } catch (err) {
    console.error("Erreur lors du nettoyage:", err);
  }
  process.exit(0);
}

hardClean();
