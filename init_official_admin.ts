import { sql } from "./src/db/neon.ts";
import { neonDbService } from "./src/db/neon-service.ts";

async function initOfficialAdmin() {
  console.log("🧹 DÉMARRAGE DU NETTOYAGE ET INITIALISATION DE L'ADMIN OFFICIEL...");

  try {
    await neonDbService.ensureDb();

    console.log("🗑️ Suppression de tous les Utilisateurs pour laisser place au SuperAdmin...");
    await sql`DELETE FROM sat_users;`;

    console.log("👑 Création du SEUL SuperAdmin officiel...");
    await sql`
      INSERT INTO sat_users (
        id,
        full_name,
        email,
        phone,
        role,
        region,
        pin,
        verified,
        updated_at
      ) VALUES (
        'admin-001',
        'Administrateur SEN AURA',
        'admin@senauratech.sn',
        '+221 77 171 90 13',
        'ADMIN',
        'Dakar',
        '1732',
        true,
        NOW()
      );
    `;

    console.log("✅ SuperAdmin (77 171 90 13) avec code PIN (1732) initialisé avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation:", err);
  } finally {
    process.exit(0);
  }
}

initOfficialAdmin();
