/**
 * Dynamic Document Context Engine for SEN AURA TECH
 * Adapts Receipts, Invoices, Devis, and PDFs according to the functional context:
 * - BOUTIQUE (Matériel, Équipements, E-Commerce)
 * - ACADEMY (Formations, Bootcamps, Certifications)
 * - MARKETPLACE (Intervention Technicien, Artisan, Prestation Pro)
 * - INFRASTRUCTURES_TECHNIQUES (Solaire, Vidéosurveillance, Réseau)
 * - CONSEIL (Audit, Conseil, Ingénierie)
 * - SOLUTIONS_NUMERIQUES (Développement Web/Mobile, Logiciel, ERP)
 */

export type DocumentContextType =
  | "BOUTIQUE"
  | "ACADEMY"
  | "MARKETPLACE"
  | "INFRASTRUCTURES_TECHNIQUES"
  | "CONSEIL"
  | "SOLUTIONS_NUMERIQUES";

export interface DocumentContextConfig {
  type: DocumentContextType;
  headerTitle: string;
  headerSubtitle: string;
  badgeLabel: string;
  sellerRoleLabel: string;
  clientRoleLabel: string;
  sellerDivision: string;
  defaultObjet: string;
  section1Title: string;
  col1Header: string;
  col2Header?: string;
  col3Header?: string;
  colTotalHeader: string;
  totalSection1Label: string;
  section2Title: string;
  section2Items: { label: string; value: string }[];
  recapRow1Label: string;
  recapRow2Label: string;
  recapRow2Value: string;
  recapTotalLabel: string;
  footerLegalText: string;
}

export function detectDocumentContext(invoice?: {
  documentType?: DocumentContextType | string;
  invoiceNumber?: string;
  transactionRef?: string;
  notes?: string;
  items?: Array<{ description?: string; name?: string; quantity?: number; unitPriceFCFA?: number }>;
}): DocumentContextConfig {
  let type: DocumentContextType = "SOLUTIONS_NUMERIQUES";

  if (invoice?.documentType && isValidContextType(invoice.documentType)) {
    type = invoice.documentType as DocumentContextType;
  } else {
    const textCorpus = [
      invoice?.invoiceNumber || "",
      invoice?.transactionRef || "",
      invoice?.notes || "",
      ...(invoice?.items || []).map((it) => `${it.description || ""} ${it.name || ""}`),
    ]
      .join(" ")
      .toLowerCase();

    // 1. Boutique / E-Commerce / Matériel
    if (
      textCorpus.includes("cmd-") ||
      textCorpus.includes("boutique") ||
      textCorpus.includes("produit") ||
      textCorpus.includes("macbook") ||
      textCorpus.includes("apple") ||
      textCorpus.includes("iphone") ||
      textCorpus.includes("samsung") ||
      textCorpus.includes("dell") ||
      textCorpus.includes("hp") ||
      textCorpus.includes("lenovo") ||
      textCorpus.includes("ordinateur") ||
      textCorpus.includes("laptop") ||
      textCorpus.includes("pc ") ||
      textCorpus.includes("clavier") ||
      textCorpus.includes("souris") ||
      textCorpus.includes("routeur") ||
      textCorpus.includes("switch") ||
      textCorpus.includes("disque") ||
      textCorpus.includes("ssd") ||
      textCorpus.includes("ram") ||
      textCorpus.includes("onduleur") ||
      textCorpus.includes("batterie") ||
      textCorpus.includes("panneau") ||
      textCorpus.includes("camera") ||
      textCorpus.includes("caméra") ||
      textCorpus.includes("accessoire") ||
      textCorpus.includes("achat matériel") ||
      textCorpus.includes("vendeur")
    ) {
      type = "BOUTIQUE";
    }
    // 2. Academy / Formations
    else if (
      textCorpus.includes("crs-") ||
      textCorpus.includes("enr-") ||
      textCorpus.includes("formation") ||
      textCorpus.includes("academy") ||
      textCorpus.includes("bootcamp") ||
      textCorpus.includes("cours") ||
      textCorpus.includes("apprenant") ||
      textCorpus.includes("certificat") ||
      textCorpus.includes("masterclass") ||
      textCorpus.includes("cursus") ||
      textCorpus.includes("formateur") ||
      textCorpus.includes("étudiant")
    ) {
      type = "ACADEMY";
    }
    // 3. Marketplace / Pros / Interventions
    else if (
      textCorpus.includes("sat-res-") ||
      textCorpus.includes("pro-") ||
      textCorpus.includes("intervention") ||
      textCorpus.includes("plomberie") ||
      textCorpus.includes("plombier") ||
      textCorpus.includes("électricien") ||
      textCorpus.includes("electricien") ||
      textCorpus.includes("serrurier") ||
      textCorpus.includes("artisan") ||
      textCorpus.includes("technicien") ||
      textCorpus.includes("dépannage") ||
      textCorpus.includes("réparation") ||
      textCorpus.includes("marketplace")
    ) {
      type = "MARKETPLACE";
    }
    // 4. Infrastructures Techniques
    else if (
      textCorpus.includes("fibre optique") ||
      textCorpus.includes("cctv") ||
      textCorpus.includes("vidéosurveillance") ||
      textCorpus.includes("domotique") ||
      textCorpus.includes("câblage") ||
      textCorpus.includes("pose solaire") ||
      textCorpus.includes("centrale solaire") ||
      textCorpus.includes("infrastructure technique")
    ) {
      type = "INFRASTRUCTURES_TECHNIQUES";
    }
    // 5. Conseil & Audit
    else if (
      textCorpus.includes("audit") ||
      textCorpus.includes("conseil") ||
      textCorpus.includes("transformation digitale") ||
      textCorpus.includes("cahier des charges") ||
      textCorpus.includes("stratégie")
    ) {
      type = "CONSEIL";
    } else {
      type = "SOLUTIONS_NUMERIQUES";
    }
  }

  return getContextDefinition(type);
}

function isValidContextType(type: string): type is DocumentContextType {
  return [
    "BOUTIQUE",
    "ACADEMY",
    "MARKETPLACE",
    "INFRASTRUCTURES_TECHNIQUES",
    "CONSEIL",
    "SOLUTIONS_NUMERIQUES",
  ].includes(type);
}

function getContextDefinition(type: DocumentContextType): DocumentContextConfig {
  switch (type) {
    case "BOUTIQUE":
      return {
        type: "BOUTIQUE",
        headerTitle: "REÇU DE COMMANDE",
        headerSubtitle: "Matériel technologique & équipements • Vente directe",
        badgeLabel: "COMMANDE BOUTIQUE PAYÉE",
        sellerRoleLabel: "VENDEUR / BOUTIQUE",
        clientRoleLabel: "ACHETEUR / DESTINATAIRE",
        sellerDivision: "Pôle Boutique E-Commerce & Matériels Informatiques",
        defaultObjet: "Achat d'équipements technologiques et matériels garantis.",
        section1Title: "1. Articles & Équipements commandés",
        col1Header: "Désignation de l'article / Matériel",
        col2Header: "Qté",
        col3Header: "Prix Unitaire",
        colTotalHeader: "Total",
        totalSection1Label: "Total articles & matériels",
        section2Title: "2. Services logistiques & Garanties incluses",
        section2Items: [
          { label: "Garantie constructeur & conformité matérielle (12 mois)", value: "Incluse" },
          { label: "Préparation colis & Contrôle qualité avant expédition", value: "Inclus" },
          { label: "Emballage antichoc sécurisé & Suivi d'acheminement", value: "Inclus" },
          { label: "Assistance technique d'installation & Service après-vente (SAV)", value: "Inclus" },
        ],
        recapRow1Label: "Articles & Équipements",
        recapRow2Label: "Livraison sécurisée & Expédition",
        recapRow2Value: "Inclus (Offert)",
        recapTotalLabel: "TOTAL RÉGLÉ (PAYÉ)",
        footerLegalText: "Document numérique valant reçu officiel d'achat et bon de garantie matériel.",
      };

    case "ACADEMY":
      return {
        type: "ACADEMY",
        headerTitle: "REÇU D'INSCRIPTION",
        headerSubtitle: "SEN AURA ACADEMY • Formations Professionnelles & Certifications",
        badgeLabel: "INSCRIPTION FORMATION VALIDÉE",
        sellerRoleLabel: "ORGANISME DE FORMATION",
        clientRoleLabel: "APPRENANT(E) / ÉTUDIANT(E)",
        sellerDivision: "SEN AURA ACADEMY - Pôle Compétences Numériques",
        defaultObjet: "Inscription aux cursus de formation professionnelle certifiante et accès aux plateformes d'apprentissage.",
        section1Title: "1. Programme & Sessions de formation",
        col1Header: "Module / Programme de Formation",
        col2Header: "Format",
        col3Header: "Droits d'inscription",
        colTotalHeader: "Montant",
        totalSection1Label: "Total formation & Pédagogie",
        section2Title: "2. Prestations pédagogiques & Avantages inclus",
        section2Items: [
          { label: "Accès illimité aux cours, TP et ressources pédagogiques numériques", value: "Inclus" },
          { label: "Encadrement & Mentoring par des formateurs seniors certifiés", value: "Inclus" },
          { label: "Évaluation continue & Examen final de certification", value: "Inclus" },
          { label: "Délivrance du Certificat Officiel d'Aptitude SEN AURA ACADEMY", value: "Inclus" },
          { label: "Accès au réseau des Alumni & Opportunités professionnelles", value: "Inclus" },
        ],
        recapRow1Label: "Droits d'inscription & Pédagogie",
        recapRow2Label: "Supports numériques & Mentorat",
        recapRow2Value: "Inclus",
        recapTotalLabel: "TOTAL RÉGLÉ (PAYÉ)",
        footerLegalText: "Reçu officiel d'inscription ouvrant droit aux sessions de formation et à l'examen de certification.",
      };

    case "MARKETPLACE":
      return {
        type: "MARKETPLACE",
        headerTitle: "REÇU D'INTERVENTION",
        headerSubtitle: "Marketplace des Professionnels & Techniciens Agréés",
        badgeLabel: "INTERVENTION TECHNIQUE CONFIRMÉE",
        sellerRoleLabel: "PRESTATAIRE AGRÉÉ / RÉSEAU SEN AURA",
        clientRoleLabel: "CLIENT BÉNÉFICIAIRE",
        sellerDivision: "Réseau des Experts & Artisans Qualifiés SEN AURA TECH",
        defaultObjet: "Prestation technique sur site, installation, dépannage ou main d'œuvre spécialisée.",
        section1Title: "1. Prestations & Main-d’œuvre d'intervention",
        col1Header: "Désignation de l'intervention / Travaux",
        col2Header: "Type",
        col3Header: "Tarif",
        colTotalHeader: "Montant",
        totalSection1Label: "Total prestation & Main d'œuvre",
        section2Title: "2. Garanties d'intervention & Suivi de service",
        section2Items: [
          { label: "Déplacement & Diagnostic technique sur site", value: "Inclus" },
          { label: "Main d'œuvre qualifiée par un technicien agréé et vérifié", value: "Incluse" },
          { label: "Contrôle de conformité & Essais de bon fonctionnement", value: "Inclus" },
          { label: "Garantie de service après intervention & Support client", value: "Inclus" },
        ],
        recapRow1Label: "Intervention & Main d'œuvre",
        recapRow2Label: "Déplacement & Diagnostic technique",
        recapRow2Value: "Inclus",
        recapTotalLabel: "TOTAL RÉGLÉ (PAYÉ)",
        footerLegalText: "Reçu officiel attestant de la prestation de service réalisée et du règlement perçu.",
      };

    case "INFRASTRUCTURES_TECHNIQUES":
      return {
        type: "INFRASTRUCTURES_TECHNIQUES",
        headerTitle: "FACTURE D'INSTALLATION",
        headerSubtitle: "Infrastructures Électriques, Solaires & Réseaux Télécoms",
        badgeLabel: "TRAVAUX & INSTALLATION TECHNIQUE",
        sellerRoleLabel: "INSTALLATEUR AGRÉÉ",
        clientRoleLabel: "CLIENT / SITE D'INSTALLATION",
        sellerDivision: "Pôle Infrastructures Techniques & Énergies Renouvelables",
        defaultObjet: "Fourniture, pose, raccordement et mise en service d'équipements d'infrastructures techniques.",
        section1Title: "1. Équipements & Travaux d'installation",
        col1Header: "Équipement / Poste d'installation",
        col2Header: "Qté",
        col3Header: "Prix Unitaire",
        colTotalHeader: "Montant",
        totalSection1Label: "Total équipements & Travaux",
        section2Title: "2. Services techniques & Garanties incluses",
        section2Items: [
          { label: "Étude technique préalable, calepinage & Dimensionnement", value: "Inclus" },
          { label: "Pose certifiée, câblage aux normes & Raccordement sécurisé", value: "Inclus" },
          { label: "Tests de charge, mise en service & Mesures de performance", value: "Inclus" },
          { label: "Garantie pièces & main d'œuvre (12 à 24 mois)", value: "Incluse" },
          { label: "Formation à l'exploitation & Maintenance préventive", value: "Inclus" },
        ],
        recapRow1Label: "Fournitures matérielles & Pose",
        recapRow2Label: "Dimensionnement & Mise en service",
        recapRow2Value: "Inclus",
        recapTotalLabel: "TOTAL À PAYER / RÉGLÉ",
        footerLegalText: "Document valant facture officielle et certificat de garantie d'installation.",
      };

    case "CONSEIL":
      return {
        type: "CONSEIL",
        headerTitle: "FACTURE D'HONORAIRES",
        headerSubtitle: "Pôle Conseil, Audit & Ingénierie Stratégique",
        badgeLabel: "MISSION DE CONSEIL & AUDIT",
        sellerRoleLabel: "CABINET CONSEIL",
        clientRoleLabel: "ENTREPRISE / CLIENT",
        sellerDivision: "Pôle Conseil en Transformation Numérique & Stratégie",
        defaultObjet: "Prestations d'audit technique, conseil stratégique et accompagnement à la transformation digitale.",
        section1Title: "1. Missions d'expertise & Livrables",
        col1Header: "Mission / Livrable de Conseil",
        col2Header: "Phase",
        col3Header: "Honoraires",
        colTotalHeader: "Montant",
        totalSection1Label: "Total honoraires de mission",
        section2Title: "2. Engagements & Méthodologie",
        section2Items: [
          { label: "Restitution des livrables & Rapport d'audit stratégique", value: "Inclus" },
          { label: "Ateliers de cadrage & Interviews des parties prenantes", value: "Inclus" },
          { label: "Feuille de route opérationnelle & Recommandations", value: "Inclus" },
          { label: "Support & Accompagnement post-restitution (3 mois)", value: "Inclus" },
        ],
        recapRow1Label: "Honoraires de mission & Livrables",
        recapRow2Label: "Ateliers & Cadrage stratégique",
        recapRow2Value: "Inclus",
        recapTotalLabel: "TOTAL À PAYER / RÉGLÉ",
        footerLegalText: "Facture officielle d'honoraires de conseil et prestations intellectuelles.",
      };

    case "SOLUTIONS_NUMERIQUES":
    default:
      return {
        type: "SOLUTIONS_NUMERIQUES",
        headerTitle: "FACTURE",
        headerSubtitle: "Solutions numériques & ingénierie logicielle",
        badgeLabel: "INGÉNIERIE LOGICIELLE & DÉVELOPPEMENT",
        sellerRoleLabel: "PRESTATAIRE",
        clientRoleLabel: "CLIENT",
        sellerDivision: "Pôle Solutions Numériques & Ingénierie Logicielle",
        defaultObjet: "Conception, développement, équipement, déploiement et mise en production des solutions logicielles commandées.",
        section1Title: "1. Main-d’œuvre de développement",
        col1Header: "Prestation / Module développé",
        col2Header: "Type",
        col3Header: "Tarif",
        colTotalHeader: "Montant",
        totalSection1Label: "Total main-d’œuvre",
        section2Title: "2. Infrastructure & Services inclus",
        section2Items: [
          { label: "Nom de domaine & SSL / HTTPS — 1 an", value: "Inclus" },
          { label: "Hébergement & environnement sécurisé production — 1 an", value: "Inclus" },
          { label: "Base PostgreSQL & Sauvegardes de données automatiques", value: "Inclus" },
          { label: "Garantie & Support technique SEN AURA TECH — 12 mois", value: "Inclus" },
        ],
        recapRow1Label: "Développement / main-d’œuvre",
        recapRow2Label: "Infrastructure / mise en production",
        recapRow2Value: "Inclus",
        recapTotalLabel: "TOTAL À PAYER",
        footerLegalText: "Document numérique valant facture officielle et preuve de paiement légale.",
      };
  }
}
