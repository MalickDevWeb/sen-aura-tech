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

const ok = (status) => (status >= 200 && status < 300) ? '✅' : '❌';

async function run() {
  const TS = Date.now();
  const PROD_ID = `test-prod-${TS}`;
  const COURSE_ID = `test-course-${TS}`;
  const QUOTE_ID = `test-quote-${TS}`;
  const USER_ID = `test-user-${TS}`;

  let res;
  const results = [];
  const test = (label, status) => {
    const icon = ok(status);
    results.push(`${icon} [${status}] ${label}`);
  };

  console.log('\n🔵 === TESTS LECTURE (GET) ===\n');
  res = await req('GET', '/api/db/products');
  test('GET /api/db/products', res.status);

  res = await req('GET', '/api/db/courses');
  test('GET /api/db/courses', res.status);

  res = await req('GET', '/api/db/quotes');
  test('GET /api/db/quotes', res.status);

  res = await req('GET', '/api/db/orders');
  test('GET /api/db/orders', res.status);

  res = await req('GET', '/api/db/bookings');
  test('GET /api/db/bookings', res.status);

  res = await req('GET', '/api/db/users');
  test('GET /api/db/users', res.status);

  res = await req('GET', '/api/db/providers');
  test('GET /api/db/providers', res.status);

  res = await req('GET', '/api/db/config');
  test('GET /api/db/config', res.status);

  console.log('\n🟡 === TESTS CRÉATION (POST) ===\n');
  res = await req('POST', '/api/db/products', { id: PROD_ID, name: 'Test Prod', priceFCFA: 1000, stock: 5 });
  test('POST /api/db/products', res.status);

  res = await req('POST', '/api/db/courses', { id: COURSE_ID, title: 'Test Cours', price: 5000, status: 'Publié' });
  test('POST /api/db/courses', res.status);

  res = await req('POST', '/api/db/quotes', { id: QUOTE_ID, clientName: 'Test Client', description: 'Test devis', budgetFCFA: 200000 });
  test('POST /api/db/quotes', res.status);

  res = await req('POST', '/api/db/orders', { userId: USER_ID, items: [{ id: PROD_ID, qty: 1 }], totalFCFA: 1000 });
  test('POST /api/db/orders', res.status);

  res = await req('POST', '/api/db/providers', { id: `provider-${TS}`, fullName: 'Test Pro', specialty: 'Réseau', phone: '+22170000001' });
  test('POST /api/db/providers', res.status);

  console.log('\n🟠 === TESTS MODIFICATION (PUT) ===\n');
  res = await req('PUT', `/api/admin/products/${PROD_ID}`, { stock: 20 });
  test(`PUT /api/admin/products/:id`, res.status);

  res = await req('PUT', `/api/admin/courses/${COURSE_ID}`, { status: 'Brouillon' });
  test(`PUT /api/admin/courses/:id`, res.status);

  res = await req('PUT', `/api/admin/quotes/${QUOTE_ID}`, { status: 'VALIDE' });
  test(`PUT /api/admin/quotes/:id`, res.status);

  res = await req('PUT', `/api/vendor/products/${PROD_ID}`, { stock: 3 });
  test(`PUT /api/vendor/products/:id`, res.status);

  res = await req('PUT', `/api/trainer/courses/${COURSE_ID}`, { status: 'Publié' });
  test(`PUT /api/trainer/courses/:id`, res.status);

  console.log('\n🔴 === TESTS SUPPRESSION (DELETE) ===\n');
  res = await req('DELETE', `/api/admin/products/${PROD_ID}`);
  test(`DELETE /api/admin/products/:id`, res.status);

  res = await req('DELETE', `/api/admin/courses/${COURSE_ID}`);
  test(`DELETE /api/admin/courses/:id`, res.status);

  res = await req('DELETE', `/api/admin/quotes/${QUOTE_ID}`);
  test(`DELETE /api/admin/quotes/:id`, res.status);

  res = await req('DELETE', `/api/vendor/products/${PROD_ID}`);
  test(`DELETE /api/vendor/products/:id (already gone)`, res.status);

  res = await req('DELETE', `/api/trainer/courses/${COURSE_ID}`);
  test(`DELETE /api/trainer/courses/:id (already gone)`, res.status);

  console.log('\n⚪ === TESTS AUTHENTIFICATION & AUTH CHECK ===\n');
  res = await req('POST', '/api/auth/check-uniqueness', { phone: '+22100000000', email: 'nobody@test.sn' });
  test(`POST /api/auth/check-uniqueness`, res.status);

  console.log('\n⚪ === TESTS PROFILS MÉTIERS ===\n');
  res = await req('POST', '/api/db/users/sync', { id: USER_ID, phone: `+221${Math.floor(100000000 + Math.random() * 900000000)}`, role: 'CLIENT', fullName: 'Test User' });
  test(`POST /api/db/users/sync`, res.status);

  res = await req('POST', '/api/pro/profile', { id: `pro-${TS}`, fullName: 'Test Pro Profile', specialty: 'Web', phone: '+22100000002' });
  test(`POST /api/pro/profile`, res.status);

  res = await req('POST', '/api/formateur/profile', { id: `formateur-${TS}`, fullName: 'Test Formateur', expertise: 'IA', phone: '+22100000003' });
  test(`POST /api/formateur/profile`, res.status);

  res = await req('POST', '/api/vendeur/profile', { id: `vendeur-${TS}`, fullName: 'Test Vendeur', shopName: 'Boutique Test', phone: '+22100000004' });
  test(`POST /api/vendeur/profile`, res.status);

  console.log('\n⚪ === TESTS VENDEUR (ROUTES DÉDIÉES) ===\n');
  res = await req('GET', '/api/vendor/products');
  test(`GET /api/vendor/products`, res.status);

  res = await req('POST', `/api/vendor/products`, { id: `vendor-prod-${TS}`, name: 'Vendeur Prod', priceFCFA: 500, stock: 3, vendorId: `vendeur-${TS}` });
  test(`POST /api/vendor/products`, res.status);

  res = await req('GET', '/api/trainer/courses');
  test(`GET /api/trainer/courses`, res.status);

  res = await req('POST', '/api/trainer/courses', { id: `trainer-c-${TS}`, title: 'Cours Formateur', price: 3000, instructorId: `formateur-${TS}` });
  test(`POST /api/trainer/courses`, res.status);

  // Display results
  console.log('\n========================================');
  console.log('📋 RAPPORT FINAL DES TESTS ENDPOINTS');
  console.log('========================================\n');
  results.forEach(r => console.log(r));

  const passed = results.filter(r => r.startsWith('✅')).length;
  const failed = results.filter(r => r.startsWith('❌')).length;
  console.log(`\n🎯 Résultat : ${passed}/${results.length} endpoints OK | ${failed} en erreur`);
  if (failed === 0) console.log('🎉 Tous les endpoints fonctionnent correctement !');
  else console.log('⚠️  Certains endpoints nécessitent une correction.');
}

run().catch(console.error);
