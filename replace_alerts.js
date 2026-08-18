const fs = require('fs');
let content = fs.readFileSync('src/modules/dashboard/DashboardView.tsx', 'utf8');

// Add import if not present
if (!content.includes('ActionConfirmModal')) {
  content = content.replace(
    'import { store } from "../../database/store";',
    'import { store } from "../../database/store";\nimport { ActionConfirmModal, ConfirmConfig } from "../../shared/components/ActionConfirmModal";'
  );
}

// Add state if not present
if (!content.includes('const [confirmConfig')) {
  content = content.replace(
    'const [adminProducts, setAdminProducts] = useState<any[]>([]);',
    'const [adminProducts, setAdminProducts] = useState<any[]>([]);\n  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);'
  );
}

// Render modal at the end
if (!content.includes('<ActionConfirmModal')) {
  content = content.replace(
    '{/* MODAL CERTIFICAT APPRENANT PREVIEW */}',
    '<ActionConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />\n\n      {/* MODAL CERTIFICAT APPRENANT PREVIEW */}'
  );
}

// Replace alert("...")
content = content.replace(/alert\((['"`].*?['"`])\);?/g, 'setConfirmConfig({ isAlert: true, message: $1, onConfirm: () => {} })');

// Replace if (confirm("...")) { ... }
// We have to be careful with multi-line blocks. We will use a regex to match the if (confirm(...)) block
// and replace it. Since some blocks might be single lines or multi-lines, it's better to do manual replacements for `confirm` or a more robust regex.
// Let's do simple regex for single line: if (confirm(`...`)) { set... }
content = content.replace(/if\s*\(\s*confirm\((['"`].*?['"`])\)\s*\)\s*\{\s*([\s\S]*?)\s*\}/g, (match, msg, body) => {
  return `setConfirmConfig({\n                                message: ${msg},\n                                onConfirm: () => {\n                                  ${body}\n                                }\n                              })`;
});

fs.writeFileSync('src/modules/dashboard/DashboardView.tsx', content);
