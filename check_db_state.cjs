const http = require('http');

const BASE = 'http://localhost:3000';

const req = (path) => new Promise((resolve) => {
  const url = new URL(BASE + path);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: 'GET',
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
  r.end();
});

async function checkState() {
  console.log("📊 ÉTAT ACTUEL DE LA BASE DE DONNÉES (NeonDB + Cache)\n");

  const endpoints = [
    { label: "👤 Utilisateurs", path: "/api/admin/users", arrayKey: "users" },
    { label: "🛍️ Produits (Global)", path: "/api/db/products", arrayKey: "products" },
    { label: "🏪 Produits Vendeur", path: "/api/vendor/products", arrayKey: "products" },
    { label: "🎓 Formations (Global)", path: "/api/db/courses", arrayKey: "courses" },
    { label: "📚 Formations Formateur", path: "/api/trainer/courses", arrayKey: "courses" },
    { label: "📋 Devis Client", path: "/api/db/quotes", arrayKey: "quotes" },
    { label: "🛒 Commandes", path: "/api/db/orders", arrayKey: "orders" },
    { label: "📅 Réservations", path: "/api/db/bookings", arrayKey: "bookings" },
    { label: "👷 Prestataires", path: "/api/db/providers", arrayKey: "providers" },
  ];

  for (const ep of endpoints) {
    const res = await req(ep.path);
    if (res.status === 200 && res.body && res.body.success) {
      const items = res.body[ep.arrayKey] || [];
      console.log(`- ${ep.label}: ${items.length} entrée(s)`);
      if (items.length > 0) {
        // Show up to 2 items as example
        const sample = items.slice(0, 2);
        sample.forEach(i => {
           let desc = i.name || i.title || i.clientName || i.userName || i.customer_name || i.fullName || i.id;
           console.log(`    ↳ ${desc}`);
        });
        if (items.length > 2) console.log(`    ↳ ... et ${items.length - 2} de plus`);
      }
    } else {
      console.log(`- ${ep.label}: Erreur de récupération (${res.status})`);
    }
  }
}

checkState().catch(console.error);
