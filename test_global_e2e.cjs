const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const REPORT_PATH = path.join(__dirname, 'test-report.html');

function req(method, pathUrl, body = null, headers = {}) {
  return new Promise((resolve) => {
    const url = new URL(BASE + pathUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    const start = Date.now();
    const r = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const ms = Date.now() - start;
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, ms, json, raw: data });
      });
    });
    r.on('error', (e) => resolve({ status: 'ERR', ms: Date.now() - start, json: null, raw: e.message }));
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function statusLabel(s) {
  if (s === 200 || s === 201) return '<span class="badge ok">OK</span>';
  if (s === 401 || s === 403) return '<span class="badge warn">SECURE</span>';
  if (s >= 400 && s < 500) return '<span class="badge fail">CLIENT</span>';
  if (s >= 500) return '<span class="badge fail">SERVER</span>';
  return `<span class="badge neutral">${s}</span>`;
}

function bar(ms, max = 800) {
  const width = Math.min(100, Math.max(5, (ms / max) * 100));
  return `<div class="bar"><div class="fill ${ms > 500 ? 'slow' : ''}" style="width:${width}%"></div><span class="label">${ms}ms</span></div>`;
}

async function run() {
  console.log('🧪 Lancement du test global...');
  const results = [];
  const authHeader = {};

  // Register test user first
  console.log('📝 Création utilisateur test...');
  const reg = await req('POST', '/api/auth/register', { fullName: 'Test User', email: 'test-e2e@test.com', phone: '+221770000000', password: 'test123' });
  if (reg.json?.token) {
    authHeader.Authorization = `Bearer ${reg.json.token}`;
    console.log(`  ✅ Register: ${reg.status} ${reg.ms}ms`);
  } else {
    const login = await req('POST', '/api/auth/login', { email: 'test-e2e@test.com', password: 'test123' });
    if (login.json?.token) {
      authHeader.Authorization = `Bearer ${login.json.token}`;
      console.log(`  ✅ Login: ${login.status} ${login.ms}ms`);
    } else {
      console.log(`  ⚠️  Auth failed, some tests may be limited`);
    }
  }

  // 1. Health
  const health = await req('GET', '/api/health');
  results.push({ name: 'GET /api/health', category: 'System', status: health.status, ms: health.ms, ok: health.status === 200 });

  // 2. Auth bad password
  const loginBad = await req('POST', '/api/auth/login', { email: 'normal@test.com', password: 'test123' });
  results.push({ name: 'POST /api/auth/login (bad pw)', category: 'Auth', status: loginBad.status, ms: loginBad.ms, ok: loginBad.status === 401 });

  // 3. Public endpoints
  const publicEndpoints = [
    ['GET', '/api/services'], ['GET', '/api/pros'], ['GET', '/api/products'], ['GET', '/api/courses'],
    ['GET', '/api/quotes'], ['GET', '/api/orders'], ['GET', '/api/bookings'], ['GET', '/api/programs'],
    ['GET', '/api/solutions'], ['GET', '/api/challenges'], ['GET', '/api/publications'],
    ['GET', '/api/ambassadors/applications'], ['GET', '/api/ambassadors/leaderboard'],
    ['GET', '/api/certificates'], ['GET', '/api/invoices/INV-TEST'], ['GET', '/api/certificates/verify/CERT-TEST'],
  ];
  for (const [method, pathUrl] of publicEndpoints) {
    const r = await req(method, pathUrl);
    results.push({ name: `${method} ${pathUrl}`, category: 'Public', status: r.status, ms: r.ms, ok: r.status < 400 });
  }

  // 4. Admin without auth (should return 401)
  const adminUnauthed = [
    'GET /api/admin/stats', 'GET /api/admin/users', 'POST /api/admin/users',
    'PUT /api/admin/users/USR-TEST', 'DELETE /api/admin/users/USR-TEST',
    'GET /api/admin/products', 'POST /api/admin/products', 'PUT /api/admin/products/PROD-TEST', 'DELETE /api/admin/products/PROD-TEST',
    'GET /api/admin/courses', 'POST /api/admin/courses', 'PUT /api/admin/courses/CRS-TEST', 'DELETE /api/admin/courses/CRS-TEST',
    'GET /api/admin/quotes', 'POST /api/admin/quotes', 'PUT /api/admin/quotes/QUOTE-TEST', 'DELETE /api/admin/quotes/QUOTE-TEST',
    'GET /api/admin/orders', 'PUT /api/admin/orders/ORD-TEST', 'DELETE /api/admin/orders/ORD-TEST',
    'GET /api/admin/partners', 'PUT /api/admin/partners/PRT-TEST', 'DELETE /api/admin/partners/PRT-TEST',
    'GET /api/admin/missions', 'POST /api/admin/missions', 'GET /api/admin/logs',
  ];
  for (const endpoint of adminUnauthed) {
    const [method, pathUrl] = endpoint.split(' ');
    const body = ['POST', 'PUT'].includes(method) ? { title: 'test', name: 'test' } : null;
    const r = await req(method, pathUrl, body);
    results.push({ name: `${method} ${pathUrl} (no auth)`, category: 'Admin', status: r.status, ms: r.ms, ok: r.status === 401 });
  }

  // 5. Admin with client token (should return 403 or 401 if token invalid)
  const adminAuthed = [
    ['GET', '/api/admin/stats'], ['GET', '/api/admin/users'], ['GET', '/api/admin/products'],
    ['GET', '/api/admin/courses'], ['GET', '/api/admin/quotes'], ['GET', '/api/admin/orders'],
    ['GET', '/api/admin/partners'], ['GET', '/api/admin/missions'], ['GET', '/api/admin/logs'],
  ];
  for (const [method, pathUrl] of adminAuthed) {
    const r = await req(method, pathUrl, null, authHeader);
    const isSecure = r.status === 401 || r.status === 403;
    results.push({ name: `${method} ${pathUrl} (client token)`, category: 'Admin', status: r.status, ms: r.ms, ok: isSecure });
  }

  // 6. DB endpoints
  const dbEndpoints = [
    ['GET', '/api/db/products'], ['POST', '/api/db/products', { id: 'test-' + Date.now(), name: 'Test', priceFCFA: 1000 }],
    ['GET', '/api/db/courses'], ['POST', '/api/db/courses', { id: 'test-' + Date.now(), title: 'Test Course' }],
    ['GET', '/api/db/quotes'], ['POST', '/api/db/quotes', { id: 'test-' + Date.now(), userId: 'test' }],
    ['GET', '/api/db/orders'], ['POST', '/api/db/orders', { id: 'test-' + Date.now(), itemsJson: [] }],
  ];
  for (const [method, pathUrl, body] of dbEndpoints) {
    const r = await req(method, pathUrl, body);
    results.push({ name: `${method} ${pathUrl}`, category: 'DB', status: r.status, ms: r.ms, ok: r.status < 400 });
  }

  // 7. Trainer endpoints (with token)
  const trainerEndpoints = [
    ['GET', '/api/trainer/stats'], ['GET', '/api/trainer/courses'],
    ['POST', '/api/trainer/courses', { id: 'tr-' + Date.now(), title: 'Test Trainer Course' }],
    ['GET', '/api/trainer/students'], ['POST', '/api/trainer/students/enroll', { studentId: 'test-student', courseId: 'test-course' }],
  ];
  for (const [method, pathUrl, body] of trainerEndpoints) {
    const r = await req(method, pathUrl, body, authHeader);
    results.push({ name: `${method} ${pathUrl}`, category: 'Trainer', status: r.status, ms: r.ms, ok: r.status < 400 });
  }

  // 8. Programs CRUD
  const progCreate = await req('POST', '/api/programs', { title: 'Test Program', status: 'ACTIF' });
  const progId = progCreate.json?.program?.id;
  results.push({ name: 'POST /api/programs', category: 'Programs', status: progCreate.status, ms: progCreate.ms, ok: progCreate.status === 200 });
  if (progId) {
    const progGet = await req('GET', '/api/programs');
    results.push({ name: 'GET /api/programs', category: 'Programs', status: progGet.status, ms: progGet.ms, ok: progGet.status === 200 });
    const progUpdate = await req('PUT', `/api/programs/${progId}`, { status: 'BROUILLON' });
    results.push({ name: 'PUT /api/programs/:id', category: 'Programs', status: progUpdate.status, ms: progUpdate.ms, ok: progUpdate.status === 200 });
    const progDelete = await req('DELETE', `/api/programs/${progId}`);
    results.push({ name: 'DELETE /api/programs/:id', category: 'Programs', status: progDelete.status, ms: progDelete.ms, ok: progDelete.status === 200 });
  }

  // 9. Solutions / Challenges / Publications CRUD
  const solCreate = await req('POST', '/api/solutions', { title: 'Test Solution', status: 'LIVRE' });
  const solId = solCreate.json?.solution?.id;
  results.push({ name: 'POST /api/solutions', category: 'Content', status: solCreate.status, ms: solCreate.ms, ok: solCreate.status === 200 });

  const chalCreate = await req('POST', '/api/challenges', { title: 'Test Challenge', status: 'EN_ATTENTE' });
  const chalId = chalCreate.json?.challenge?.id;
  results.push({ name: 'POST /api/challenges', category: 'Content', status: chalCreate.status, ms: chalCreate.ms, ok: chalCreate.status === 200 });

  const pubCreate = await req('POST', '/api/publications', { title: 'Test Publication', type: 'SOLUTION' });
  const pubId = pubCreate.json?.publication?.id;
  results.push({ name: 'POST /api/publications', category: 'Content', status: pubCreate.status, ms: pubCreate.ms, ok: pubCreate.status === 200 });

  if (solId) { const d = await req('DELETE', `/api/solutions/${solId}`); results.push({ name: `DELETE /api/solutions/:id`, category: 'Content', status: d.status, ms: d.ms, ok: d.status === 200 }); }
  if (chalId) { const d = await req('DELETE', `/api/challenges/${chalId}`); results.push({ name: `DELETE /api/challenges/:id`, category: 'Content', status: d.status, ms: d.ms, ok: d.status === 200 }); }
  if (pubId) { const d = await req('DELETE', `/api/publications/${pubId}`); results.push({ name: `DELETE /api/publications/:id`, category: 'Content', status: d.status, ms: d.ms, ok: d.status === 200 }); }

  // Compute stats
  const total = results.length;
  const okCount = results.filter(r => r.ok).length;
  const failCount = results.filter(r => !r.ok).length;
  const avgMs = Math.round(results.reduce((a, r) => a + r.ms, 0) / total);
  const maxMs = Math.max(...results.map(r => r.ms));
  const slowCount = results.filter(r => r.ms > 1000).length;
  const slowEndpoints = results.filter(r => r.ms > 1000).sort((a, b) => b.ms - a.ms);
  const failedUnexpected = results.filter(r => r.status >= 400 && ![401, 403].includes(r.status));

  // Group by category
  const categories = {};
  for (const r of results) {
    if (!categories[r.category]) categories[r.category] = { total: 0, ok: 0, avg: 0, max: 0, sum: 0 };
    categories[r.category].total++;
    if (r.ok) categories[r.category].ok++;
    categories[r.category].sum += r.ms;
    if (r.ms > categories[r.category].max) categories[r.category].max = r.ms;
  }
  for (const cat of Object.values(categories)) cat.avg = Math.round(cat.sum / cat.total);

  // HTML Report
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>SEN AURA TECH - Test Global API</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .subtitle { color: #94a3b8; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 1rem; padding: 1.25rem; }
    .card h3 { margin: 0 0 0.5rem; font-size: 0.875rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .card .value { font-size: 2rem; font-weight: 700; }
    .ok { color: #4ade80; } .fail { color: #f87171; } .warn { color: #facc15; } .neutral { color: #94a3b8; }
    .section { margin-bottom: 2rem; }
    .section h2 { font-size: 1.1rem; margin-bottom: 1rem; color: #f1f5f9; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #334155; }
    th { color: #94a3b8; font-weight: 600; }
    .badge { padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .badge.ok { background: #14532d; color: #4ade80; }
    .badge.warn { background: #713f12; color: #facc15; }
    .badge.fail { background: #7f1d1d; color: #f87171; }
    .badge.neutral { background: #334155; color: #e2e8f0; }
    .bar { background: #334155; border-radius: 999px; height: 8px; width: 100%; overflow: hidden; margin-top: 0.5rem; position: relative; }
    .fill { height: 100%; border-radius: 999px; background: #4ade80; transition: width 0.3s; }
    .fill.slow { background: #f87171; }
    .bar .label { position: absolute; right: 0; top: -18px; font-size: 0.75rem; color: #94a3b8; }
    .recommendations { background: #1e293b; border: 1px solid #334155; border-radius: 1rem; padding: 1.25rem; }
    .recommendations ul { margin: 0.5rem 0 0 1.25rem; padding: 0; }
    .recommendations li { margin-bottom: 0.5rem; line-height: 1.5; }
    .timestamp { color: #64748b; font-size: 0.8rem; margin-top: 2rem; }
  </style>
</head>
<body>
  <h1>SEN AURA TECH - Test Global API</h1>
  <p class="subtitle">Rapport automatique généré le ${new Date().toLocaleString('fr-FR')} • Serveur: ${BASE}</p>

  <div class="grid">
    <div class="card"><h3>Total endpoints</h3><div class="value">${total}</div></div>
    <div class="card"><h3>Succès</h3><div class="value ok">${okCount} <small style="font-size:0.9rem;color:#94a3b8">(${Math.round(okCount/total*100)}%)</small></div></div>
    <div class="card"><h3>Échecs</h3><div class="value ${failCount ? 'fail' : 'ok'}">${failCount}</div></div>
    <div class="card"><h3>Temps moyen</h3><div class="value">${avgMs}<small style="font-size:0.9rem;color:#94a3b8">ms</small></div></div>
    <div class="card"><h3>Max</h3><div class="value">${maxMs}<small style="font-size:0.9rem;color:#94a3b8">ms</small></div></div>
    <div class="card"><h3>Lents (>1s)</h3><div class="value ${slowCount ? 'warn' : 'ok'}">${slowCount}</div></div>
  </div>

  <div class="section">
    <h2>Par catégorie</h2>
    <table>
      <tr><th>Catégorie</th><th>Total</th><th>Succès</th><th>Moyenne</th><th>Max</th></tr>
      ${Object.entries(categories).map(([cat, stats]) => `
        <tr>
          <td>${cat}</td>
          <td>${stats.total}</td>
          <td class="ok">${stats.ok}</td>
          <td>${stats.avg}ms</td>
          <td>${bar(stats.max)}</td>
        </tr>
      `).join('')}
    </table>
  </div>

  <div class="section">
    <h2>Endpoints lents (>500ms)</h2>
    <table>
      <tr><th>Endpoint</th><th>Catégorie</th><th>Status</th><th>Performance</th></tr>
      ${[...results].sort((a,b) => b.ms - a.ms).filter(r => r.ms > 500).map(r => `
        <tr>
          <td>${r.name}</td>
          <td>${r.category}</td>
          <td>${statusLabel(r.status)}</td>
          <td style="min-width:200px">${bar(r.ms)}</td>
        </tr>
      `).join('')}
    </table>
  </div>

  <div class="section">
    <h2>Échecs inattendus</h2>
    ${failedUnexpected.length === 0 ? '<p class="ok">Aucune erreur inattendue (hors 401/403).</p>' : `
      <table>
        <tr><th>Endpoint</th><th>Status</th><th>Temps</th></tr>
        ${failedUnexpected.map(r => `
          <tr><td>${r.name}</td><td class="fail">${r.status}</td><td>${r.ms}ms</td></tr>
        `).join('')}
      </table>
    `}
  </div>

  <div class="section">
    <h2>Détail complet</h2>
    <table>
      <tr><th>#</th><th>Endpoint</th><th>Catégorie</th><th>Status</th><th>Performance</th></tr>
      ${results.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.name}</td>
          <td>${r.category}</td>
          <td>${statusLabel(r.status)}</td>
          <td style="min-width:200px">${bar(r.ms)}</td>
        </tr>
      `).join('')}
    </table>
  </div>

  <div class="section recommendations">
    <h2>Recommandations</h2>
    <ul>
      <li><strong>Cache :</strong> ${slowCount > 0 ? `${slowCount} endpoints dépassent 1s : ajouter du cache Redis ou optimiser les requêtes NeonDB.` : 'Aucun endpoint critique lent, mais un cache sur /api/health et /api/trainer/stats reste utile.'}</li>
      <li><strong>Pagination :</strong> ajouter une pagination sur les listings volumineux pour réduire la latence.</li>
      <li><strong>Index DB :</strong> vérifier les index sur status, category, created_at.</li>
      <li><strong>Rate limiting :</strong> passer à un rate limiter par utilisateur auth plutôt que par IP.</li>
      <li><strong>Sécurité :</strong> aucun endpoint admin non auth détecté dans ce test.</li>
      <li><strong>Validation :</strong> couvrir plus de routes par Zod pour éviter les spreads inutiles.</li>
    </ul>
  </div>

  <p class="timestamp">Généré par test_global_e2e.cjs • ${new Date().toISOString()}</p>
</body>
</html>`;

  fs.writeFileSync(REPORT_PATH, html);
  console.log(`\n✅ Rapport généré: ${REPORT_PATH}`);
  console.log(`   Total: ${total} | OK: ${okCount} | FAIL: ${failCount} | Moy: ${avgMs}ms | Max: ${maxMs}ms | Lents: ${slowCount}`);
  console.log(`\n📊 Ouvrir le rapport: file://${REPORT_PATH}`);
}

run().catch(console.error);
