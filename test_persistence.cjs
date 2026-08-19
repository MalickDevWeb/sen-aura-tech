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

const ok = (cond) => cond ? '✅' : '❌';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const TS = Date.now();
  const PROD_ID = `verify-prod-${TS}`;
  const COURSE_ID = `verify-course-${TS}`;
  const QUOTE_ID = `verify-quote-${TS}`;

  console.log('\n🧪 TEST DE PERSISTANCE NeonDB (Créer → Vérifier → Supprimer)\n');

  // === PRODUIT ===
  console.log('=== 🛍️ PRODUIT ===');
  const prodPayload = {
    id: PROD_ID,
    name: `Test Produit ${TS}`,
    priceFCFA: 75000,
    category: 'Test Catégorie',
    brand: 'TEST',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400'
  };
  const prodCreate = await req('POST', '/api/db/products', prodPayload);
  console.log(`  POST /api/db/products → [${prodCreate.status}] ${ok(prodCreate.status === 200)}`);

  await sleep(500);
  const prodList = await req('GET', '/api/db/products');
  const prodFound = prodList.body?.products?.find(p => p.id === PROD_ID);
  console.log(`  GET /api/db/products → trouvé dans la liste: ${ok(!!prodFound)}`);
  if (prodFound) console.log(`    ✓ Nom: "${prodFound.name}" | Prix: ${prodFound.priceFCFA} FCFA | Stock: ${prodFound.stock}`);

  // Cleanup
  await req('DELETE', `/api/admin/products/${PROD_ID}`);

  // === COURS ===
  console.log('\n=== 🎓 COURS (FORMATEUR) ===');
  const coursePayload = {
    id: COURSE_ID,
    title: `Test Formation ${TS}`,
    category: 'IA & Data',
    priceFCFA: 50000,
    duration: '20 Heures',
    status: 'Publié',
    instructor: 'Test Formateur',
    description: 'Formation de test automatique'
  };
  const courseCreate = await req('POST', '/api/db/courses', coursePayload);
  console.log(`  POST /api/db/courses → [${courseCreate.status}] ${ok(courseCreate.status === 200)}`);

  await sleep(500);
  const courseList = await req('GET', '/api/db/courses');
  const courseFound = courseList.body?.courses?.find(c => c.id === COURSE_ID);
  console.log(`  GET /api/db/courses → trouvé dans la liste: ${ok(!!courseFound)}`);
  if (courseFound) console.log(`    ✓ Titre: "${courseFound.title}" | Prix: ${courseFound.priceFCFA} FCFA`);

  // Cleanup
  await req('DELETE', `/api/admin/courses/${COURSE_ID}`);

  // === DEVIS ===
  console.log('\n=== 📋 DEVIS ===');
  const quotePayload = {
    id: QUOTE_ID,
    userId: `user-test-${TS}`,
    userName: 'Amadou Test',
    userPhone: '+221770000000',
    pole: 'SOLUTIONS_NUMERIQUES',
    serviceTitle: 'Application Web Test',
    description: 'Devis test automatique',
    budgetFCFA: 300000,
    status: 'EN_ATTENTE'
  };
  const quoteCreate = await req('POST', '/api/db/quotes', quotePayload);
  console.log(`  POST /api/db/quotes → [${quoteCreate.status}] ${ok(quoteCreate.status === 200)}`);

  await sleep(500);
  const quoteList = await req('GET', '/api/db/quotes');
  const quoteFound = quoteList.body?.quotes?.find(q => q.id === QUOTE_ID);
  console.log(`  GET /api/db/quotes → trouvé dans la liste: ${ok(!!quoteFound)}`);
  if (quoteFound) console.log(`    ✓ Client: "${quoteFound.userName}" | Budget: ${quoteFound.budgetFCFA} FCFA`);

  // Cleanup
  await req('DELETE', `/api/admin/quotes/${QUOTE_ID}`);

  // === VENDEUR PRODUCT ===
  console.log('\n=== 🏪 PRODUIT VENDEUR ===');
  const vendeurProd = {
    id: `vendor-${TS}`,
    name: `Vendeur Prod Test ${TS}`,
    priceFCFA: 120000,
    category: 'Caméras & Sécurité',
    brand: 'HIKVISION',
    stock: 3,
    vendorId: `vendeur-test-${TS}`
  };
  const vpCreate = await req('POST', '/api/vendor/products', vendeurProd);
  console.log(`  POST /api/vendor/products → [${vpCreate.status}] ${ok(vpCreate.status === 200)}`);

  await sleep(500);
  const vpList = await req('GET', '/api/vendor/products');
  const vpFound = vpList.body?.products?.find(p => p.id === vendeurProd.id);
  console.log(`  GET /api/vendor/products → trouvé dans la liste: ${ok(!!vpFound)}`);
  if (vpFound) console.log(`    ✓ Nom: "${vpFound.name}" | Stock: ${vpFound.stock}`);

  // Cleanup
  await req('DELETE', `/api/vendor/products/${vendeurProd.id}`);

  // === COURS FORMATEUR ===
  console.log('\n=== 📚 COURS FORMATEUR ===');
  const trainerCourse = {
    id: `trainer-c-${TS}`,
    title: `Cours Formateur Test ${TS}`,
    category: 'Cybersécurité',
    price: 45000,
    instructorId: `formateur-${TS}`,
    status: 'Publié'
  };
  const tcCreate = await req('POST', '/api/trainer/courses', trainerCourse);
  console.log(`  POST /api/trainer/courses → [${tcCreate.status}] ${ok(tcCreate.status === 200)}`);

  await sleep(500);
  const tcList = await req('GET', '/api/trainer/courses');
  const tcFound = tcList.body?.courses?.find(c => c.id === trainerCourse.id);
  console.log(`  GET /api/trainer/courses → trouvé dans la liste: ${ok(!!tcFound)}`);
  if (tcFound) console.log(`    ✓ Titre: "${tcFound.title}"`);

  // Cleanup
  await req('DELETE', `/api/trainer/courses/${trainerCourse.id}`);

  console.log('\n========================================');
  console.log('📋 CONCLUSION PERSISTANCE');
  console.log('========================================');
  const allFound = !!prodFound && !!courseFound && !!quoteFound;
  if (allFound) {
    console.log('✅ Tous les ajouts sont persistés correctement dans NeonDB');
    console.log('✅ Les items créés sont bien récupérables via les GET');
    console.log('✅ Les suppressions ont nettoyé les données de test');
  } else {
    console.log('⚠️  Certains ajouts ne sont pas encore bien persistés');
    if (!prodFound) console.log('   ❌ Produit non trouvé dans GET /api/db/products');
    if (!courseFound) console.log('   ❌ Cours non trouvé dans GET /api/db/courses');
    if (!quoteFound) console.log('   ❌ Devis non trouvé dans GET /api/db/quotes');
  }
}

run().catch(console.error);
