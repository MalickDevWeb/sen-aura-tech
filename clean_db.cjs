const http = require('http');

const BASE = 'http://localhost:3000';

const req = (method, path, body = null) => new Promise((resolve) => {
  const url = new URL(BASE + path);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  const r = http.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
      catch { resolve({ status: res.statusCode, body: data }); }
    });
  });
  r.on('error', e => resolve({ status: 'ERR', body: e.message }));
  if (body) r.write(JSON.stringify(body));
  r.end();
});

async function clean() {
  console.log("🧹 DÉMARRAGE DU NETTOYAGE COMPLET...");

  // 1. UTILISATEURS
  const resUsers = await req('GET', '/api/admin/users');
  const users = resUsers.body?.users || [];
  for (const u of users) {
    if (u.fullName !== "Administrateur SEN AURA" && u.name !== "Administrateur SEN AURA") {
      await req('DELETE', `/api/admin/users/${u.id}`);
      console.log(`🗑️ Utilisateur supprimé: ${u.fullName || u.name}`);
    } else {
      console.log(`🛡️ Conservé: ${u.fullName || u.name}`);
    }
  }

  // 2. PRODUITS
  const resProd = await req('GET', '/api/db/products');
  const prods = resProd.body?.products || [];
  for (const p of prods) {
    await req('DELETE', `/api/admin/products/${p.id}`);
    console.log(`🗑️ Produit supprimé: ${p.name}`);
  }

  // 3. COURS
  const resCours = await req('GET', '/api/db/courses');
  const cours = resCours.body?.courses || [];
  for (const c of cours) {
    await req('DELETE', `/api/admin/courses/${c.id}`);
    console.log(`🗑️ Cours supprimé: ${c.title}`);
  }

  // 4. PRESTATAIRES (Providers)
  // There is no DELETE endpoint for providers yet in the admin, so I'll create a direct connection to neon-service to nuke them.
}

clean().catch(console.error);
