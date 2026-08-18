const fs = require('fs');
let content = fs.readFileSync('src/modules/dashboard/DashboardView.tsx', 'utf8');

if (!content.includes('ActionConfirmModal')) {
  content = content.replace(
    'import { store } from "../../database/store";',
    'import { store } from "../../database/store";\nimport { ActionConfirmModal, ConfirmConfig } from "../../shared/components/ActionConfirmModal";'
  );
}

if (!content.includes('const [confirmConfig')) {
  content = content.replace(
    'const [adminProducts, setAdminProducts] = useState<any[]>([]);',
    'const [adminProducts, setAdminProducts] = useState<any[]>([]);\n  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);'
  );
}

if (!content.includes('<ActionConfirmModal')) {
  content = content.replace(
    '{/* MODAL CERTIFICAT APPRENANT PREVIEW */}',
    '<ActionConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />\n\n      {/* MODAL CERTIFICAT APPRENANT PREVIEW */}'
  );
}

// Ensure no native alert is left: alert(MSG) -> setConfirmConfig({ isAlert: true, message: MSG, onConfirm: () => {} })
content = content.replace(/alert\((['"`][\s\S]*?['"`])\);?/g, 'setConfirmConfig({ isAlert: true, message: $1, onConfirm: () => {} })');

// Ensure no native confirm is left: if (confirm(MSG)) { BODY } -> setConfirmConfig({ message: MSG, onConfirm: () => { BODY } })
content = content.replace(/if\s*\(\s*confirm\((['"`][\s\S]*?['"`])\)\s*\)\s*\{\s*([\s\S]*?)\s*\}/g, (match, msg, body) => {
  return `setConfirmConfig({\n                                message: ${msg},\n                                onConfirm: () => {\n                                  ${body}\n                                }\n                              })`;
});

fs.writeFileSync('src/modules/dashboard/DashboardView.tsx', content);
