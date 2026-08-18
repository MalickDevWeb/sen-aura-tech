import { ProfileType, ProfileSubscriptionDTO, UserProfileDataDTO, UserDTO } from "../shared/contracts/types";

export interface SubscriptionPlanDefinition {
  id: string;
  name: string;
  badge?: string;
  priceMonthlyFCFA: number;
  priceYearlyFCFA: number;
  popular?: boolean;
  trialDays: number;
  description: string;
  features: string[];
}

export interface ProfileMetadata {
  id: ProfileType;
  title: string;
  subtitle: string;
  emoji: string;
  badgeColor: string;
  requiresSubscription: boolean;
  description: string;
  targetAudience: string;
  coreFeatures: string[];
  subscriptionPlans: SubscriptionPlanDefinition[];
}

export interface UpcomingProfileDefinition {
  id: string;
  title: string;
  emoji: string;
  category: string;
  description: string;
}

export const UPCOMING_PROFILES_CATALOG: UpcomingProfileDefinition[] = [
  {
    id: "ARTISAN",
    title: "Artisan & Métiers d'Art",
    emoji: "🔨",
    category: "Artisanat & Réparation",
    description: "Pour les menuisiers, cordonniers, couturiers et réparateurs d'équipements.",
  },
  {
    id: "ASSOCIATION",
    title: "Association & ONG",
    emoji: "🌱",
    category: "Social & Développement",
    description: "Pour les collectes, adhésions et gestion de projets communautaires.",
  },
  {
    id: "RECRUTEUR",
    title: "Cabinet de Recrutement & RH",
    emoji: "🎯",
    category: "Emploi & Talents",
    description: "Pour la publication d'offres d'emploi, sourcing et validation des compétences.",
  },
  {
    id: "IMMOBILIER",
    title: "Agence Immobilière & Gestion",
    emoji: "🏢",
    category: "Immobilier & Foncier",
    description: "Pour la gestion des baux, mandats, visites et quittances de loyer.",
  },
  {
    id: "EVENEMENTIEL",
    title: "Organisateur d'Événements",
    emoji: "🎪",
    category: "Événements & Billetterie",
    description: "Pour la billetterie, gestion des prestataires et salons professionnels.",
  },
];

export const PROFILES_METADATA: Record<ProfileType, ProfileMetadata> = {
  CLIENT: {
    id: "CLIENT",
    title: "Client",
    subtitle: "Acheteur, Donneur d'Ordre & Apprenant",
    emoji: "👤",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    requiresSubscription: false,
    description: "Profil universel créé automatiquement et 100% gratuit à vie.",
    targetAudience: "Particuliers, entreprises et donneurs d'ordre.",
    coreFeatures: [
      "Acheter des produits sur la boutique tech & marketplace",
      "Demander des devis techniques chiffrés gratuitement",
      "Suivre ses commandes et livraisons en temps réel",
      "Télécharger ses devis validés et factures en PDF officiel",
      "Gérer ses favoris et articles sauvegardés",
      "Gérer son panier d'achats multi-vendeurs",
      "Gérer ses adresses de livraison et de facturation",
      "Communiquer en direct avec les vendeurs et prestataires pro",
    ],
    subscriptionPlans: [
      {
        id: "free",
        name: "Gratuit à Vie",
        priceMonthlyFCFA: 0,
        priceYearlyFCFA: 0,
        trialDays: 0,
        description: "Accès illimité sans aucun frais d'abonnement.",
        features: [
          "Accès libre à tout le catalogue boutique",
          "Demandes de devis illimitées",
          "Téléchargement des devis validés en PDF",
          "Suivi des commandes en direct",
          "Support client standard",
        ],
      },
    ],
  },
  VENDEUR: {
    id: "VENDEUR",
    title: "Vendeur / Boutiquier",
    subtitle: "Commerçants, Grossistes & Boutiques",
    emoji: "🛍️",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    requiresSubscription: true,
    description: "Destiné aux commerçants et distributeurs souhaitant vendre leurs produits sur la plateforme.",
    targetAudience: "Commerçants, boutiques physiques, distributeurs et grossistes.",
    coreFeatures: [
      "Création et personnalisation d'une boutique officielle",
      "Gestion complète du catalogue produits (photos HD Cloudinary)",
      "Gestion des stocks et alertes de réapprovisionnement",
      "Gestion et suivi des commandes clients",
      "Création de promotions et bannières promotionnelles",
      "Gestion des codes coupons et remises spéciales",
      "Portefeuille de revenus et retraits Wave / OM",
      "Statistiques détaillées des ventes et conversion",
      "Gestion des livraisons et bordereaux d'expédition",
      "Génération automatique des factures clients en PDF",
    ],
    subscriptionPlans: [
      {
        id: "vendeur_starter",
        name: "Vendeur Starter",
        priceMonthlyFCFA: 15000,
        priceYearlyFCFA: 150000,
        trialDays: 30,
        description: "Idéal pour lancer sa première boutique en ligne.",
        features: [
          "Jusqu'à 25 produits dans le catalogue",
          "Photos HD Cloudinary",
          "Gestion des commandes & factures PDF",
          "Paiements Wave & Orange Money directs",
          "30 jours d'essai gratuit inclus",
        ],
      },
      {
        id: "vendeur_pro",
        name: "Vendeur Pro",
        badge: "Recommandé",
        popular: true,
        priceMonthlyFCFA: 30000,
        priceYearlyFCFA: 300000,
        trialDays: 30,
        description: "Pour les commerçants établis voulant maximiser leurs ventes.",
        features: [
          "Catalogue produits illimité",
          "Boutique mise en avant sur la marketplace",
          "Gestion des codes promos et soldes",
          "Statistiques avancées des ventes & conversion",
          "Génération automatique des factures et bordereaux",
          "Support prioritaire WhatsApp 7j/7",
        ],
      },
      {
        id: "vendeur_vip",
        name: "Grossiste & Distributeur VIP",
        priceMonthlyFCFA: 55000,
        priceYearlyFCFA: 550000,
        trialDays: 30,
        description: "Pour les grands distributeurs et grossistes régionaux.",
        features: [
          "Tout l'accès Pro illimité",
          "Ventes B2B avec devis sur-mesure",
          "Badge Vendeur Officiel Certifié SEN AURA",
          "0% commission sur les 50 premières ventes",
          "Accompagnement commercial dédié",
        ],
      },
    ],
  },
  PROFESSIONAL: {
    id: "PROFESSIONAL",
    title: "Prestataire Professionnel",
    subtitle: "Informaticien, Ingénieur, Consultant, Artisan...",
    emoji: "👨‍💼",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    requiresSubscription: true,
    description: "Destiné aux professionnels et experts proposant des services qualifiés.",
    targetAudience: "Informaticiens, architectes, comptables, consultants, électriciens, plombiers, designers, juristes, médecins, coachs, etc.",
    coreFeatures: [
      "Création et personnalisation d'un profil professionnel certifié",
      "Présentation détaillée des services et tarifs",
      "Publication de réalisations / portfolio en photos HD",
      "Gestion et réponse aux demandes de devis clients",
      "Gestion des rendez-vous et calendrier d'interventions",
      "Paiement garanti des prestations via le séquestre plateforme",
      "Gestion des avis et notations clients vérifiés",
      "Tableau de bord et statistiques d'activité",
    ],
    subscriptionPlans: [
      {
        id: "pro_starter",
        name: "Pro Starter",
        priceMonthlyFCFA: 15000,
        priceYearlyFCFA: 150000,
        trialDays: 30,
        description: "Pour les indépendants débutant sur la plateforme.",
        features: [
          "Profil prestataire référencé sur l'annuaire",
          "Réception de missions dans sa région",
          "Jusqu'à 10 réalisations dans son portfolio",
          "Gestion des devis et calendrier de base",
          "30 jours d'essai gratuit immédiat",
        ],
      },
      {
        id: "pro_business",
        name: "Pro Business",
        badge: "Le Plus Populaire",
        popular: true,
        priceMonthlyFCFA: 25000,
        priceYearlyFCFA: 250000,
        trialDays: 30,
        description: "Pour les professionnels actifs voulant un flux continu de clients.",
        features: [
          "Positionnement prioritaire sur l'annuaire",
          "Badge Expert Certifié & Vérifié SEN AURA",
          "Portfolio illimité de réalisations",
          "Alertes WhatsApp immédiates pour chaque nouveau devis",
          "Retraits instantanés Wave & Orange Money",
          "Couverture sur l'ensemble du territoire",
        ],
      },
      {
        id: "pro_elite",
        name: "Cabinet & Entreprise Elite",
        priceMonthlyFCFA: 45000,
        priceYearlyFCFA: 450000,
        trialDays: 30,
        description: "Pour les cabinets, bureaux d'études et entreprises de services.",
        features: [
          "Multi-techniciens sous un même compte",
          "Attribution directe des grands comptes & appels d'offres",
          "Référencement VIP en tête d'affiche",
          "Gestionnaire de compte dédié",
        ],
      },
    ],
  },
  FORMATEUR: {
    id: "FORMATEUR",
    title: "Formateur / Academy",
    subtitle: "Enseignants, Écoles & Centres de Formation",
    emoji: "🎓",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    requiresSubscription: true,
    description: "Destiné aux enseignants, centres de formation, écoles ou experts souhaitant vendre des formations.",
    targetAudience: "Enseignants, formateurs indépendants, écoles, centres certifiés, experts académiques.",
    coreFeatures: [
      "Création d'un espace Academy personnalisé",
      "Publication de formations multimédias (vidéos HD, PDF, supports)",
      "Gestion structurée des cours, modules et leçons",
      "Création de Quiz interactifs et examens finaux",
      "Délivrance de certificats officiels avec QR Code sécurisé",
      "Gestion et suivi de progression des étudiants",
      "Paiement automatique des inscriptions via Wave / OM",
      "Statistiques d'engagement, complétion et revenus",
    ],
    subscriptionPlans: [
      {
        id: "academy_starter",
        name: "Formateur Starter",
        priceMonthlyFCFA: 20000,
        priceYearlyFCFA: 200000,
        trialDays: 30,
        description: "Pour publier ses premières formations en ligne.",
        features: [
          "Jusqu'à 5 formations complètes",
          "Supports PDF et hébergement vidéos",
          "Génération de certificats numériques",
          "Jusqu'à 100 étudiants inscrits",
          "30 jours d'essai gratuit immédiat",
        ],
      },
      {
        id: "academy_pro",
        name: "Academy Pro",
        badge: "Recommandé",
        popular: true,
        priceMonthlyFCFA: 35000,
        priceYearlyFCFA: 350000,
        trialDays: 30,
        description: "Pour les formateurs professionnels et centres de formation.",
        features: [
          "Formations et étudiants illimités",
          "Certificats officiels premium avec QR code de vérification",
          "Quiz interactifs, devoirs et corrections",
          "Mise en avant sur le catalogue public Academy",
          "Retrait direct des gains d'inscriptions Wave / OM",
          "Support pédagogique & technique prioritaire",
        ],
      },
      {
        id: "academy_master",
        name: "Grand Centre / Université",
        priceMonthlyFCFA: 65000,
        priceYearlyFCFA: 650000,
        trialDays: 30,
        description: "Pour les instituts, écoles supérieures et grands centres.",
        features: [
          "Multi-formateurs & tuteurs",
          "Espace blanc personnalisé avec branding d'établissement",
          "Délivrance de diplômes et certifications d'État",
          "Exports statistiques académiques avancés",
        ],
      },
    ],
  },
  AMBASSADOR: {
    id: "AMBASSADOR",
    title: "Ambassadeur d'Affaires",
    subtitle: "Réseau d'Apporteurs d'Affaires",
    emoji: "🤝",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    requiresSubscription: false,
    description: "Programme d'apport d'affaires avec commissions garanties sur les projets signés.",
    targetAudience: "Commerciaux, apporteurs d'affaires, consultants terrain.",
    coreFeatures: [
      "Code Ambassadeur unique et lien de parrainage",
      "Suivi des prospects et contrats signés",
      "Calcul des commissions (5% à 15%)",
      "Portefeuille de commissions avec versements Wave / OM",
    ],
    subscriptionPlans: [
      {
        id: "ambassador_free",
        name: "Programme Ambassadeur Gratuit",
        priceMonthlyFCFA: 0,
        priceYearlyFCFA: 0,
        trialDays: 0,
        description: "Accès sur candidature validée.",
        features: [
          "Commissions sur chaque contrat signé",
          "Badge officiel Ambassadeur SEN AURA",
          "Kit commercial de prospection",
        ],
      },
    ],
  },
  ADMIN: {
    id: "ADMIN",
    title: "Administration Centrale",
    subtitle: "Supervision Globale & Gouvernance",
    emoji: "⚡",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    requiresSubscription: false,
    description: "Accès réservé à la direction générale et aux administrateurs système.",
    targetAudience: "Équipe dirigeante SEN AURA TECH.",
    coreFeatures: [
      "Validation des devis et publication des propositions chiffrées",
      "Supervision des utilisateurs, vendeurs, prestataires et formateurs",
      "Gestion des transactions, commandes et commissions",
      "Paramétrage de la plateforme et logs de sécurité",
    ],
    subscriptionPlans: [
      {
        id: "admin_internal",
        name: "Accès Direction",
        priceMonthlyFCFA: 0,
        priceYearlyFCFA: 0,
        trialDays: 0,
        description: "Compte administrateur système interne.",
        features: ["Accès SuperAdmin intégral"],
      },
    ],
  },
};

/**
 * Creates default initial user profile data structure
 */
export function buildDefaultUserProfiles(user: Partial<UserDTO>): Record<string, UserProfileDataDTO> {
  const now = new Date().toISOString();

  const clientProfile: UserProfileDataDTO = {
    type: "CLIENT",
    active: true,
    title: "Espace Client",
    displayName: user.fullName || "Client",
    subscription: {
      profileType: "CLIENT",
      planId: "free",
      planName: "Client Gratuit",
      billingCycle: "FREE",
      priceFCFA: 0,
      status: "ACTIVE",
      features: PROFILES_METADATA.CLIENT.coreFeatures,
      activatedAt: now,
    },
    createdAt: now,
  };

  const initialProfiles: Record<string, UserProfileDataDTO> = {
    CLIENT: clientProfile,
  };

  // If user already had a specific role during registration (e.g. VENDEUR, PROFESSIONAL, FORMATEUR)
  if (user.role && user.role !== "CLIENT" && user.role !== "ADMIN") {
    const meta = PROFILES_METADATA[user.role as ProfileType];
    if (meta) {
      const defaultPlan = meta.subscriptionPlans[0];
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + (defaultPlan.trialDays || 30));

      initialProfiles[user.role] = {
        type: user.role as ProfileType,
        active: true,
        title: meta.title,
        displayName: user.fullName,
        professionOrCategory: user.role === "PROFESSIONAL" ? "Informatique & Solutions" : undefined,
        companyOrBoutiqueName: user.role === "VENDEUR" ? `Boutique ${user.fullName}` : undefined,
        academyName: user.role === "FORMATEUR" ? `Academy ${user.fullName}` : undefined,
        region: user.region || "Dakar",
        subscription: {
          profileType: user.role as ProfileType,
          planId: defaultPlan.id,
          planName: defaultPlan.name,
          billingCycle: "MONTHLY",
          priceFCFA: defaultPlan.priceMonthlyFCFA,
          status: user.proStatus === "ACTIF_ABONNE" ? "ACTIVE" : "TRIAL",
          trialEndsAt: trialEnds.toISOString(),
          features: defaultPlan.features,
          activatedAt: now,
        },
        createdAt: now,
      };
    }
  }

  if (user.role === "ADMIN") {
    initialProfiles["ADMIN"] = {
      type: "ADMIN",
      active: true,
      title: "SuperAdmin SEN AURA",
      subscription: {
        profileType: "ADMIN",
        planId: "admin_internal",
        planName: "SuperAdmin Interne",
        billingCycle: "FREE",
        priceFCFA: 0,
        status: "ACTIVE",
        features: ["Gestion intégrale plateforme"],
        activatedAt: now,
      },
      createdAt: now,
    };
  }

  return initialProfiles;
}
