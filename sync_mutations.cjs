const fs = require('fs');

const path = 'src/modules/dashboard/DashboardView.tsx';
let c = fs.readFileSync(path, 'utf8');

const replacements = [
  // Formateur: Delete Course
  [
    'setFormateurCourses(formateurCourses.filter(item => item.id !== c.id));',
    'fetch(`/api/trainer/courses/${c.id}`, { method: "DELETE" }).catch(()=>{});\n                                  setFormateurCourses(formateurCourses.filter(item => item.id !== c.id));'
  ],
  // Formateur: Update Course Status
  [
    'setFormateurCourses(formateurCourses.map(item => item.id === c.id ? { ...item, status: item.status === "Publié" ? "Brouillon" : "Publié" } : item));',
    'fetch(`/api/trainer/courses/${c.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status: c.status === "Publié" ? "Brouillon" : "Publié" }) }).catch(()=>{});\n                              setFormateurCourses(formateurCourses.map(item => item.id === c.id ? { ...item, status: item.status === "Publié" ? "Brouillon" : "Publié" } : item));'
  ],
  // Vendor: Update Stock (-1)
  [
    'setVendeurProducts(vendeurProducts.map(item => item.id === p.id ? { ...item, stock: Math.max(0, item.stock - 1) } : item));',
    'fetch(`/api/vendor/products/${p.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ stock: Math.max(0, p.stock - 1) }) }).catch(()=>{});\n                              setVendeurProducts(vendeurProducts.map(item => item.id === p.id ? { ...item, stock: Math.max(0, item.stock - 1) } : item));'
  ],
  // Vendor: Update Stock (+1)
  [
    'setVendeurProducts(vendeurProducts.map(item => item.id === p.id ? { ...item, stock: item.stock + 1 } : item));',
    'fetch(`/api/vendor/products/${p.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ stock: p.stock + 1 }) }).catch(()=>{});\n                              setVendeurProducts(vendeurProducts.map(item => item.id === p.id ? { ...item, stock: item.stock + 1 } : item));'
  ],
  // Vendor: Delete Product
  [
    'setVendeurProducts(vendeurProducts.filter(item => item.id !== p.id));',
    'fetch(`/api/vendor/products/${p.id}`, { method: "DELETE" }).catch(()=>{});\n                                  setVendeurProducts(vendeurProducts.filter(item => item.id !== p.id));'
  ],
  // Admin: Delete Product
  [
    'setAdminProducts(adminProducts.filter(item => item.id !== p.id));',
    'fetch(`/api/admin/products/${p.id}`, { method: "DELETE" }).catch(()=>{});\n                                  setAdminProducts(adminProducts.filter(item => item.id !== p.id));'
  ],
  // Admin: Update Stock
  [
    'setAdminProducts(adminProducts.map(item => item.id === p.id ? { ...item, stock: parseInt(newStock, 10) } : item));',
    'fetch(`/api/admin/products/${p.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ stock: parseInt(newStock, 10) }) }).catch(()=>{});\n                                setAdminProducts(adminProducts.map(item => item.id === p.id ? { ...item, stock: parseInt(newStock, 10) } : item));'
  ],
  // Admin: Delete Course
  [
    'setFormateurCourses(formateurCourses.filter(item => item.id !== c.id));',
    'fetch(`/api/admin/courses/${c.id}`, { method: "DELETE" }).catch(()=>{});\n                                  setFormateurCourses(formateurCourses.filter(item => item.id !== c.id));'
  ],
  // Admin: Update Course Status
  [
    'setFormateurCourses(formateurCourses.map(item => item.id === c.id ? { ...item, status: item.status === "Publié" ? "Brouillon" : "Publié" } : item));',
    'fetch(`/api/admin/courses/${c.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status: c.status === "Publié" ? "Brouillon" : "Publié" }) }).catch(()=>{});\n                              setFormateurCourses(formateurCourses.map(item => item.id === c.id ? { ...item, status: item.status === "Publié" ? "Brouillon" : "Publié" } : item));'
  ],
  // Admin: Update User Role
  [
    'setAdminUsers(adminUsers.map(item => item.id === u.id ? { ...item, role: newRole } : item));',
    'fetch(`/api/admin/users/${u.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ role: newRole }) }).catch(()=>{});\n                              setAdminUsers(adminUsers.map(item => item.id === u.id ? { ...item, role: newRole } : item));'
  ],
  // Admin: Delete User
  [
    'setAdminUsers(adminUsers.filter(item => item.id !== u.id));',
    'fetch(`/api/admin/users/${u.id}`, { method: "DELETE" }).catch(()=>{});\n                                  setAdminUsers(adminUsers.filter(item => item.id !== u.id));'
  ],
  // Admin: Add User
  [
    'setAdminUsers([newUser, ...adminUsers]);',
    'fetch(`/api/admin/users`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(newUser) }).catch(()=>{});\n                      setAdminUsers([newUser, ...adminUsers]);'
  ],
  // Admin: Delete Quote
  [
    'setAdminQuotes(adminQuotes.filter(item => item.id !== q.id));',
    'fetch(`/api/admin/quotes/${q.id}`, { method: "DELETE" }).catch(()=>{});\n                                setAdminQuotes(adminQuotes.filter(item => item.id !== q.id));'
  ],
];

for (const [search, replace] of replacements) {
  // Use split/join to replace all occurrences globally without regex escaping issues
  c = c.split(search).join(replace);
}

fs.writeFileSync(path, c);
