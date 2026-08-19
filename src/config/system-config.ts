import { useState, useEffect } from "react";
import mamadouSowImg from "../assets/images/mamadou_sow_ceo_1786928207654.jpg";
import sambaNdiayeImg from "../assets/images/samba_ndiaye_cto_1786928222961.jpg";
import aissatouDialloImg from "../assets/images/aissatou_diallo_pm_1786928240564.jpg";
import ousmaneKaneImg from "../assets/images/ousmane_kane_coo_1786928254289.jpg";
import khadijaBaImg from "../assets/images/khadija_ba_academy_1786928268490.jpg";

export const SEN_LEADERSHIP_DEFAULT_PHOTOS = {
  mamadouSow: mamadouSowImg,
  sambaNdiaye: sambaNdiayeImg,
  aissatouDiallo: aissatouDialloImg,
  ousmaneKane: ousmaneKaneImg,
  khadijaBa: khadijaBaImg,
};

export const PRESET_SEN_AVATARS = [
  { label: "Mamadou Sow (CEO)", url: mamadouSowImg },
  { label: "Samba Ndiaye (CTO)", url: sambaNdiayeImg },
  { label: "Aïssatou Diallo (Product)", url: aissatouDialloImg },
  { label: "Ousmane Kane (Ops)", url: ousmaneKaneImg },
  { label: "Khadija Ba (Academy)", url: khadijaBaImg },
];

// ============================================================================
// SYSTEM CONFIGURATION & SUPER ADMIN MANAGEMENT ENGINE - SEN AURA TECH
// ============================================================================

export interface TopBannerConfig {
  enabled: boolean;
  text: string;
  badge: string;
  linkText: string;
  linkTab: string;
  badgeColor: string;
}

export interface ContactConfig {
  phone: string;
  whatsapp: string;
  email: string;
  supportEmail: string;
  recruitmentEmail: string;
  address: string;
  city: string;
  country: string;
  openingHours: string;
  googleMapsEmbedUrl?: string;
}

export interface SocialsConfig {
  linkedin: string;
  twitter: string;
  x: string;
  instagram: string;
  youtube: string;
  facebook: string;
  tiktok: string;
  whatsappGroup: string;
  whatsappChannel: string;
  telegramChannel: string;
  whatsappQrCodeImage?: string;
}

export interface CommissionConfig {
  proServicesPercent: number;        // Commission on Pro interventions (e.g. 10%)
  marketplaceVendorPercent: number;  // Commission on vendor sales (e.g. 8%)
  academyTrainerPercent: number;     // Share going to Academy trainer (e.g. 70%)
  academyPlatformPercent: number;    // Share going to Platform (e.g. 30%)
  ambassadorLevel1Percent: number;   // Direct referral signed project commission (e.g. 10%)
  ambassadorLevel2Percent: number;   // Sub-ambassador referral commission (e.g. 3%)
  ambassadorPartnerBonusPercent: number; // Partner project margin (e.g. 2%)
  enterpriseQuoteMarginPercent: number;  // Margin on digital enterprise projects (e.g. 12%)
  ambassadorWelcomeBonusFCFA: number;    // Welcome credit on validated registration (e.g. 5000 FCFA)
  minWithdrawalAmountFCFA: number;       // Minimum cashout request (e.g. 10000 FCFA)
  maxDailyWithdrawalFCFA: number;        // Max daily cashout (e.g. 1500000 FCFA)
  withdrawalProcessingDelayHours: number; // Delay in hours (e.g. 24)
}

export interface PaymentGatewayItem {
  id: string;
  name: string;
  enabled: boolean;
  accountNumber: string;
  merchantName: string;
  feePercent: number;
  badge: string;
  instructions: string;
}

export interface FinanceConfig {
  defaultCurrency: "FCFA" | "EUR";
  eurExchangeRate: number;     // 1 EUR = X FCFA (e.g. 655.957)
  usdExchangeRate: number;     // 1 USD = X FCFA (e.g. 600.0)
  vatTaxPercent: number;       // Senegal VAT (e.g. 18%)
  applyVat: boolean;
  minOrderAmountFCFA: number;  // Minimum cart total (e.g. 5000 FCFA)
  companyNinea: string;        // Official tax registration number
  companyRccm: string;         // Commercial registry number
}

export interface LogisticsConfig {
  dakarDeliveryFeeFCFA: number;
  suburbsDeliveryFeeFCFA: number;
  regionsDeliveryFeeFCFA: number;
  freeShippingThresholdFCFA: number;
  estimatedDakarDeliveryHours: number;
  estimatedRegionsDeliveryHours: number;
  activeRegions: string[];
}

export interface PromoConfig {
  activePromoCode: string;
  promoDiscountPercent: number;
  promoEnabled: boolean;
  firstOrderDiscountPercent: number;
  studentAcademyDiscountPercent: number;
  promoBannerMessage: string;
}

export interface AcademyConfig {
  certificateSignerName: string;
  certificateSignerRole: string;
  certificateOrgName: string;
  autoIssueCertificatesOn100Percent: boolean;
  allowFreePreview: boolean;
  passingScorePercent: number;
}

export interface SecurityConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  estimatedReopenDate: string;
  allowClientRegistrations: boolean;
  allowProRegistrations: boolean;
  allowFormateurRegistrations: boolean;
  allowAmbassadorRegistrations: boolean;
  requireAdminApprovalForPros: boolean;
  requireOtpForLargeOrders: boolean;
  otpThresholdFCFA: number;
}

export interface NotificationsConfig {
  notifyAdminOnQuote: boolean;
  notifyAdminOnOrder: boolean;
  notifyAdminOnAmbassador: boolean;
  notifyAdminOnCv: boolean;
  adminNotificationEmail: string;
  sendCustomerSmsConfirmation: boolean;
  sendCustomerEmailInvoice: boolean;
  highValueAlertThresholdFCFA: number;
}

export interface ShowcaseProItem {
  id: string;
  fullName: string;
  category: string;
  region: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  bio: string;
  phone?: string;
  hourlyRateFCFA?: number;
}

export interface ShowcaseProductItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  priceFCFA: number;
  stock: number;
  image: string;
  description?: string;
}

export interface ShowcaseCourseItem {
  id: string;
  title: string;
  category: string;
  priceFCFA: number;
  thumbnail: string;
  durationHours?: number;
  rating?: number;
}

export interface ShowcaseProgramItem {
  id: string;
  weekNumber: number;
  title: string;
  codename: string;
  category: string;
  problemStatement: string;
  solutionDelivered: string;
  technologies: string[];
  durationDays: number;
  status: "LIVRÉ & OPÉRATIONNEL" | "EN COURS DE SPRINT" | "PROCHAIN SPRINT";
  impactMetric: string;
  demoUrl?: string;
  image: string;
  githubOpenSource?: boolean;
  active: boolean;
  isPublished: boolean;
  featured?: boolean;
}

export interface HomeShowcaseConfig {
  hero: {
    badgeText: string;
    mainTitleLine1: string;
    mainTitleAura: string;
    mainTitleTech: string;
    subtitle: string;
    quoteButtonText: string;
    aiButtonText: string;
    stats: {
      projectsValue: string;
      projectsLabel: string;
      prosValue: string;
      prosLabel: string;
      studentsValue: string;
      studentsLabel: string;
      satisfactionValue: string;
      satisfactionLabel: string;
    };
  };
  marketplacePros: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    viewAllText: string;
    items: ShowcaseProItem[];
  };
  boutique: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    viewAllText: string;
    items: ShowcaseProductItem[];
  };
  academy: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    subtitle: string;
    viewAllText: string;
    items: ShowcaseCourseItem[];
  };
  weeklySolutions: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    subtitle: string;
    items: ShowcaseProgramItem[];
  };
  community: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    description: string;
    whatsappGroupLink: string;
    whatsappPhone: string;
    whatsappQrCodeImage?: string;
  };
}

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string;
  focus: string;
  avatar: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  active: boolean;
  order: number;
}

export interface LeadershipConfig {
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  items: TeamMemberItem[];
}

export interface SystemConfig {
  version: string;
  lastUpdated: string;
  updatedBy: string;
  branding: {
    name: string;
    acronym: string;
    tagline: string;
    slogan: string;
    vision: string;
    logoUrl?: string;
    topBanner: TopBannerConfig;
  };
  contacts: ContactConfig;
  socials: SocialsConfig;
  leadership: LeadershipConfig;
  commissions: CommissionConfig;
  finance: FinanceConfig;
  paymentGateways: {
    wave: PaymentGatewayItem;
    orangeMoney: PaymentGatewayItem;
    freeMoney: PaymentGatewayItem;
    bankTransfer: PaymentGatewayItem;
    cashOnDelivery: PaymentGatewayItem;
  };
  logistics: LogisticsConfig;
  promotions: PromoConfig;
  academy: AcademyConfig;
  security: SecurityConfig;
  notifications: NotificationsConfig;
  homeShowcase: HomeShowcaseConfig;
}

// ----------------------------------------------------------------------------
// DEFAULT FACTORY CONFIGURATION
// ----------------------------------------------------------------------------
export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  version: "3.1.0",
  lastUpdated: new Date().toISOString(),
  updatedBy: "Super Admin (senauratech@gmail.com)",
  branding: {
    name: "SEN AURA TECH",
    acronym: "SAT",
    tagline: "INNOVER • CONNECTER • TRANSFORMER",
    slogan: "SEN-AURA-TECH — Le digital au service des entreprises, des compétences et des opportunités",
    vision: "La première plateforme africaine réunissant solutions numériques, infrastructures techniques, prestations de professionnels, formation et opportunités professionnelles.",
    topBanner: {
      enabled: true,
      text: "Rejoignez le Programme Officiel Ambassadeurs & Partenaires SEN-AURA-TECH 2026",
      badge: "NOUVEAU",
      linkText: "En savoir plus",
      linkTab: "ambassadeur",
      badgeColor: "bg-amber-500 text-slate-950",
    },
  },
  contacts: {
    phone: "+221 33 800 00 00",
    whatsapp: "+221 70 533 46 11",
    email: "senauratech@gmail.com",
    supportEmail: "support@senauratech.sn",
    recruitmentEmail: "carrieres@senauratech.sn",
    address: "Avenue Léopold Sédar Senghor, Thiès, Sénégal",
    city: "Thiès",
    country: "Sénégal",
    openingHours: "Lundi - Samedi : 08h00 - 19h00 (Service Client 24/7 en ligne)",
    googleMapsEmbedUrl: "https://maps.google.com/?q=Thies+Senegal",
  },
  socials: {
    linkedin: "https://www.linkedin.com/in/senauratech",
    twitter: "https://x.com/senauratech",
    x: "https://x.com/senauratech",
    instagram: "https://www.instagram.com/senauratech",
    youtube: "https://www.youtube.com/channel/UCHgfiEEEzZ5-0BPgK1QvUOg",
    facebook: "https://www.facebook.com/senauratech/",
    tiktok: "https://www.tiktok.com/@senauratech5",
    whatsappGroup: "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4",
    whatsappChannel: "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4",
    telegramChannel: "https://t.me/senauratech",
    whatsappQrCodeImage: "",
  },
  leadership: {
    enabled: true,
    eyebrow: "GOUVERNANCE & ÉQUIPE FONDATRICE",
    title: "Les 5 Cofondateurs SEN AURA TECH",
    subtitle: "Une équipe solide de leaders sénégalais garantissant la vision stratégique, la solidité financière et l'excellence technologique.",
    items: [
      {
        id: "cf-1",
        name: "Mamadou Sow",
        role: "Directeur Général & Stratégie",
        focus: "Vision, Partenariats Internationaux & Croissance",
        avatar: mamadouSowImg,
        email: "mamadou.sow@senauratech.sn",
        phone: "+221 77 123 45 67",
        active: true,
        order: 1,
      },
      {
        id: "cf-2",
        name: "Samba Ndiaye",
        role: "Directeur de la Technologie (CTO)",
        focus: "Architecture Cloud, IA Générative & R&D Lab",
        avatar: sambaNdiayeImg,
        email: "samba.ndiaye@senauratech.sn",
        phone: "+221 78 234 56 78",
        active: true,
        order: 2,
      },
      {
        id: "cf-3",
        name: "Aïssatou Diallo",
        role: "Directrice de la Gestion Produit",
        focus: "Supervision des Projets SI, Qualité & Client Success",
        avatar: aissatouDialloImg,
        email: "aissatou.diallo@senauratech.sn",
        phone: "+221 76 345 67 89",
        active: true,
        order: 3,
      },
      {
        id: "cf-4",
        name: "Ousmane Kane",
        role: "Directeur des Opérations & Réseau",
        focus: "Gestion des Partenaires & Campus Tour",
        avatar: ousmaneKaneImg,
        email: "ousmane.kane@senauratech.sn",
        phone: "+221 70 456 78 90",
        active: true,
        order: 4,
      },
      {
        id: "cf-5",
        name: "Khadija Ba",
        role: "Directrice SEN AURA Academy",
        focus: "Formations, Certifications & SEN AURA Community",
        avatar: khadijaBaImg,
        email: "khadija.ba@senauratech.sn",
        phone: "+221 77 567 89 01",
        active: true,
        order: 5,
      },
    ],
  },
  commissions: {
    proServicesPercent: 10,
    marketplaceVendorPercent: 8,
    academyTrainerPercent: 70,
    academyPlatformPercent: 30,
    ambassadorLevel1Percent: 10,
    ambassadorLevel2Percent: 3,
    ambassadorPartnerBonusPercent: 2,
    enterpriseQuoteMarginPercent: 12,
    ambassadorWelcomeBonusFCFA: 5000,
    minWithdrawalAmountFCFA: 10000,
    maxDailyWithdrawalFCFA: 1500000,
    withdrawalProcessingDelayHours: 24,
  },
  finance: {
    defaultCurrency: "FCFA",
    eurExchangeRate: 655.957,
    usdExchangeRate: 600.0,
    vatTaxPercent: 18,
    applyVat: true,
    minOrderAmountFCFA: 5000,
    companyNinea: "009847321-2A3",
    companyRccm: "SN-DKR-2025-B-14092",
  },
  paymentGateways: {
    wave: {
      id: "wave",
      name: "Wave Sénégal",
      enabled: true,
      accountNumber: "+221 70 533 46 11",
      merchantName: "SEN AURA TECH SARL",
      feePercent: 1,
      badge: "Instantané 1%",
      instructions: "Scannez le QR Code ou validez directement sur votre application Wave.",
    },
    orangeMoney: {
      id: "orange_money",
      name: "Orange Money Sénégal",
      enabled: true,
      accountNumber: "+221 77 555 00 00",
      merchantName: "SEN AURA TECH OM",
      feePercent: 1,
      badge: "Code OTP Sécurisé",
      instructions: "Composez le #144#391# pour obtenir votre code de paiement temporaire.",
    },
    freeMoney: {
      id: "free_money",
      name: "Free Money",
      enabled: true,
      accountNumber: "+221 76 800 00 00",
      merchantName: "SEN AURA TECH FREE",
      feePercent: 1,
      badge: "Validation SMS",
      instructions: "Validez la demande de paiement reçue sur votre ligne Free.",
    },
    bankTransfer: {
      id: "bank_transfer",
      name: "Virement Bancaire & Carte",
      enabled: true,
      accountNumber: "SN012 01001 03618920019 45 (CBAO Dakar)",
      merchantName: "SEN AURA TECH SARL",
      feePercent: 0,
      badge: "Sécurisé SSL / RIB",
      instructions: "Effectuez votre virement avec la référence de commande en libellé.",
    },
    cashOnDelivery: {
      id: "cash_on_delivery",
      name: "Paiement à la Livraison",
      enabled: true,
      accountNumber: "Espèces au livreur",
      merchantName: "Livreur Agréé SAT",
      feePercent: 0,
      badge: "Dakar Uniquement",
      instructions: "Réglez directement en espèces au coursier lors de la réception.",
    },
  },
  logistics: {
    dakarDeliveryFeeFCFA: 2000,
    suburbsDeliveryFeeFCFA: 3500,
    regionsDeliveryFeeFCFA: 5000,
    freeShippingThresholdFCFA: 150000,
    estimatedDakarDeliveryHours: 24,
    estimatedRegionsDeliveryHours: 48,
    activeRegions: [
      "Dakar",
      "Thiès",
      "Saint-Louis",
      "Ziguinchor",
      "Kaolack",
      "Touba / Mbacké",
      "Fatick",
      "Kolda",
      "Tambacounda",
      "Louga",
      "Diourbel",
      "Matam",
      "Kédougou",
      "Sédhiou",
    ],
  },
  promotions: {
    activePromoCode: "AURA2026",
    promoDiscountPercent: 10,
    promoEnabled: true,
    firstOrderDiscountPercent: 5,
    studentAcademyDiscountPercent: 15,
    promoBannerMessage: "Offre Spéciale : -10% avec le code promo AURA2026 sur tout le catalogue !",
  },
  academy: {
    certificateSignerName: "Dr. Amadou Ba",
    certificateSignerRole: "Directeur Pédagogique & Technologies — SEN AURA TECH",
    certificateOrgName: "SEN AURA TECH ACADEMY",
    autoIssueCertificatesOn100Percent: true,
    allowFreePreview: true,
    passingScorePercent: 80,
  },
  security: {
    maintenanceMode: false,
    maintenanceMessage: "Plateforme en maintenance programmée pour amélioration de vos services. Retour imminent !",
    estimatedReopenDate: "2026-08-16T12:00:00",
    allowClientRegistrations: true,
    allowProRegistrations: true,
    allowFormateurRegistrations: true,
    allowAmbassadorRegistrations: true,
    requireAdminApprovalForPros: true,
    requireOtpForLargeOrders: true,
    otpThresholdFCFA: 200000,
  },
  notifications: {
    notifyAdminOnQuote: true,
    notifyAdminOnOrder: true,
    notifyAdminOnAmbassador: true,
    notifyAdminOnCv: true,
    adminNotificationEmail: "senauratech@gmail.com",
    sendCustomerSmsConfirmation: true,
    sendCustomerEmailInvoice: true,
    highValueAlertThresholdFCFA: 500000,
  },
  homeShowcase: {
    hero: {
      badgeText: "Plateforme Unifiée Technologique & Services au Sénégal",
      mainTitleLine1: "Innovez, Connectez & Transformez votre avenir avec",
      mainTitleAura: "SEN AURA",
      mainTitleTech: "TECH",
      subtitle: "L'écosystème numérique numéro 1 réunissant solutions logiciels, équipements techniques, professionnels certifiés, académie certifiante et marketplace.",
      quoteButtonText: "Demander un Devis Gratuit",
      aiButtonText: "Consulter SEN AURA AI",
      stats: {
        projectsValue: "+350",
        projectsLabel: "Projets Web & SI Livrés",
        prosValue: "+1,200",
        prosLabel: "Professionnels Vérifiés",
        studentsValue: "+2,400",
        studentsLabel: "Apprenants Formés",
        satisfactionValue: "99.4%",
        satisfactionLabel: "Satisfaction Client",
      },
    },
    marketplacePros: {
      enabled: true,
      eyebrow: "MARKETPLACE PROS SÉNÉGAL",
      title: "Professionnels Certifiés Récents",
      viewAllText: "Voir tous les pros",
      items: [],
    },
    boutique: {
      enabled: true,
      eyebrow: "ÉQUIPEMENTS TECHNOLOGIQUES",
      title: "Sélection Boutique SEN AURA",
      viewAllText: "Accéder au catalogue",
      items: [],
    },
    academy: {
      enabled: true,
      eyebrow: "SEN AURA ACADEMY",
      title: "Formations & Certifications Professionnelles",
      subtitle: "Montez en compétences sur les technologies d'avenir avec nos experts sénégalais et internationaux.",
      viewAllText: "Voir toutes les formations",
      items: [],
    },
    weeklySolutions: {
      enabled: true,
      eyebrow: "INITIATIVE FLAGSHIP NATIONALE • SEN AURA TECH",
      title: "Programme « 1 SEMAINE = 1 APPLICATION = 1 SOLUTION »",
      subtitle: "Chaque semaine, l'équipe d'ingénieurs et les talents certifiés de SEN AURA TECH & ACADEMY conçoivent, développent et déploient une solution 100% opérationnelle.",
      items: [],
    },
    community: {
      enabled: true,
      eyebrow: "REJOIGNEZ LA NOUVELLE VAGUE TECH AFRICAINE",
      title: "Construisons l'Avenir Technologique du Sénégal",
      description: "SEN AURA TECH fédère développeurs, ingénieurs, techniciens certifiés et porteurs de projets dans un écosystème dynamique.",
      whatsappGroupLink: "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4",
      whatsappPhone: "+221 70 533 46 11",
      whatsappQrCodeImage: "",
    },
  },
};

// ----------------------------------------------------------------------------
// LOCAL STORAGE & REACTIVE SYNC ENGINE
// ----------------------------------------------------------------------------
const STORAGE_KEY = "senauratech_superadmin_system_config_v2";

type ConfigListener = (config: SystemConfig) => void;
const listeners = new Set<ConfigListener>();

export function loadSystemConfig(): SystemConfig {
  if (typeof window === "undefined") {
    return DEFAULT_SYSTEM_CONFIG;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_SYSTEM_CONFIG;
    const parsed = JSON.parse(saved);

    // === VERSION GUARD: force-clear all mock showcase items on upgrade to v3.1.0 ===
    const savedVersion = parsed?.version || "0.0.0";
    const isPreV31 = savedVersion < "3.1.0";
    if (isPreV31) {
      // Wipe cached mock items — they are now managed exclusively via Admin Dashboard
      if (parsed.homeShowcase?.marketplacePros) parsed.homeShowcase.marketplacePros.items = [];
      if (parsed.homeShowcase?.boutique) parsed.homeShowcase.boutique.items = [];
      if (parsed.homeShowcase?.academy) parsed.homeShowcase.academy.items = [];
      // Also purge the hardcoded weekly solution programs
      if (parsed.homeShowcase?.weeklySolutions) parsed.homeShowcase.weeklySolutions.items = [];
      parsed.version = "3.1.0";
      // Persist the cleaned config back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    // Auto-migrate legacy default WhatsApp link if previously cached
    const legacyWhatsApp = "https://chat.whatsapp.com/FX3lEsEqU0CLD4xesnsDg9";
    const currentWhatsApp = "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4";
    if (parsed.socials?.whatsappGroup && parsed.socials.whatsappGroup.includes(legacyWhatsApp)) {
      parsed.socials.whatsappGroup = currentWhatsApp;
    }
    if (parsed.socials?.whatsappChannel && parsed.socials.whatsappChannel.includes(legacyWhatsApp)) {
      parsed.socials.whatsappChannel = currentWhatsApp;
    }
    if (parsed.homeShowcase?.community?.whatsappGroupLink && parsed.homeShowcase.community.whatsappGroupLink.includes(legacyWhatsApp)) {
      parsed.homeShowcase.community.whatsappGroupLink = currentWhatsApp;
    }

    // Migrate leadership items if they had old generic unsplash images
    let loadedLeadership = parsed.leadership || DEFAULT_SYSTEM_CONFIG.leadership;
    if (loadedLeadership && Array.isArray(loadedLeadership.items)) {
      loadedLeadership.items = loadedLeadership.items.map((item: any) => {
        if (item.name === "Mamadou Sow" && (!item.avatar || item.avatar.includes("unsplash"))) {
          return { ...item, avatar: mamadouSowImg };
        }
        if (item.name === "Samba Ndiaye" && (!item.avatar || item.avatar.includes("unsplash"))) {
          return { ...item, avatar: sambaNdiayeImg };
        }
        if (item.name === "Aïssatou Diallo" && (!item.avatar || item.avatar.includes("unsplash"))) {
          return { ...item, avatar: aissatouDialloImg };
        }
        if (item.name === "Ousmane Kane" && (!item.avatar || item.avatar.includes("unsplash"))) {
          return { ...item, avatar: ousmaneKaneImg };
        }
        if (item.name === "Khadija Ba" && (!item.avatar || item.avatar.includes("unsplash"))) {
          return { ...item, avatar: khadijaBaImg };
        }
        return item;
      });
    }

    // Deep merge with default to ensure any new keys exist
    return {
      ...DEFAULT_SYSTEM_CONFIG,
      ...parsed,
      branding: { ...DEFAULT_SYSTEM_CONFIG.branding, ...parsed.branding },
      contacts: { ...DEFAULT_SYSTEM_CONFIG.contacts, ...parsed.contacts },
      socials: { ...DEFAULT_SYSTEM_CONFIG.socials, ...parsed.socials },
      leadership: {
        ...DEFAULT_SYSTEM_CONFIG.leadership,
        ...(loadedLeadership || {}),
        items: loadedLeadership?.items && loadedLeadership.items.length > 0 ? loadedLeadership.items : DEFAULT_SYSTEM_CONFIG.leadership.items,
      },
      commissions: { ...DEFAULT_SYSTEM_CONFIG.commissions, ...parsed.commissions },
      finance: { ...DEFAULT_SYSTEM_CONFIG.finance, ...parsed.finance },
      paymentGateways: { ...DEFAULT_SYSTEM_CONFIG.paymentGateways, ...parsed.paymentGateways },
      logistics: { ...DEFAULT_SYSTEM_CONFIG.logistics, ...parsed.logistics },
      promotions: { ...DEFAULT_SYSTEM_CONFIG.promotions, ...parsed.promotions },
      academy: { ...DEFAULT_SYSTEM_CONFIG.academy, ...parsed.academy },
      security: { ...DEFAULT_SYSTEM_CONFIG.security, ...parsed.security },
      notifications: { ...DEFAULT_SYSTEM_CONFIG.notifications, ...parsed.notifications },
      homeShowcase: {
        ...DEFAULT_SYSTEM_CONFIG.homeShowcase,
        ...(parsed.homeShowcase || {}),
        hero: { ...DEFAULT_SYSTEM_CONFIG.homeShowcase.hero, ...(parsed.homeShowcase?.hero || {}) },
        marketplacePros: {
          ...DEFAULT_SYSTEM_CONFIG.homeShowcase.marketplacePros,
          ...(parsed.homeShowcase?.marketplacePros || {}),
          // Always use DEFAULT (empty []) — admins manage items via Dashboard
          items: [],
        },
        boutique: {
          ...DEFAULT_SYSTEM_CONFIG.homeShowcase.boutique,
          ...(parsed.homeShowcase?.boutique || {}),
          items: [],
        },
        academy: {
          ...DEFAULT_SYSTEM_CONFIG.homeShowcase.academy,
          ...(parsed.homeShowcase?.academy || {}),
          items: [],
        },
        weeklySolutions: {
          ...DEFAULT_SYSTEM_CONFIG.homeShowcase.weeklySolutions,
          ...(parsed.homeShowcase?.weeklySolutions || {}),
          items: parsed.homeShowcase?.weeklySolutions?.items || DEFAULT_SYSTEM_CONFIG.homeShowcase.weeklySolutions.items,
        },
        community: { ...DEFAULT_SYSTEM_CONFIG.homeShowcase.community, ...(parsed.homeShowcase?.community || {}) },
      },
    };
  } catch (err) {
    console.error("Failed to load system config from storage, using defaults:", err);
    return DEFAULT_SYSTEM_CONFIG;
  }
}

export function saveSystemConfig(newConfig: SystemConfig, updatedBy = "Super Admin"): SystemConfig {
  const finalConfig: SystemConfig = {
    ...newConfig,
    lastUpdated: new Date().toISOString(),
    updatedBy,
  };
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalConfig));
    }
  } catch (err) {
    console.error("Failed to write system config to localStorage:", err);
  }
  // Notify listeners
  listeners.forEach((listener) => {
    try {
      listener(finalConfig);
    } catch (e) {
      console.error("Config listener error:", e);
    }
  });
  return finalConfig;
}

export function resetSystemConfigToDefaults(): SystemConfig {
  return saveSystemConfig(DEFAULT_SYSTEM_CONFIG, "Super Admin (Restauration Usine)");
}

export function subscribeSystemConfig(listener: ConfigListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Current memory singleton
let currentConfig = loadSystemConfig();
subscribeSystemConfig((cfg) => {
  currentConfig = cfg;
});

export function getActiveSystemConfig(): SystemConfig {
  return currentConfig;
}

// React Hook for dynamic configuration subscription
export function useSystemConfig(): SystemConfig {
  const [config, setConfig] = useState<SystemConfig>(() => getActiveSystemConfig());

  useEffect(() => {
    // Initial sync
    setConfig(getActiveSystemConfig());
    const unsubscribe = subscribeSystemConfig((newCfg) => {
      setConfig(newCfg);
    });
    return unsubscribe;
  }, []);

  return config;
}

