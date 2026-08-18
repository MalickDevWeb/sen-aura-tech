import { getActiveSystemConfig, subscribeSystemConfig } from "./system-config";

// Read active dynamic config
const initSys = getActiveSystemConfig();

export const BRAND_CONFIG = {
  get name() {
    return getActiveSystemConfig().branding.name;
  },
  get tagline() {
    return getActiveSystemConfig().branding.tagline;
  },
  get slogan() {
    return getActiveSystemConfig().branding.slogan;
  },
  get vision() {
    return getActiveSystemConfig().branding.vision;
  },
  get contact() {
    const c = getActiveSystemConfig().contacts;
    return {
      phone: c.phone,
      whatsapp: c.whatsapp,
      email: c.email,
      address: c.address,
    };
  },
  get socials() {
    const s = getActiveSystemConfig().socials;
    return {
      facebook: s.facebook,
      tiktok: s.tiktok,
      youtube: s.youtube,
      linkedin: s.linkedin,
      twitter: s.twitter,
      x: s.x,
      instagram: s.instagram,
      whatsappGroup: s.whatsappGroup || "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4",
      whatsappChannel: s.whatsappChannel || "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4",
    };
  },
  community: {
    title: "Communauté Officielle SEN-AURA-TECH",
    welcome: "Bienvenue sur la communauté officielle SEN-AURA-TECH !",
    get whatsappGroupLink() {
      const cfg = getActiveSystemConfig();
      return (
        cfg.socials.whatsappGroup ||
        cfg.homeShowcase.community.whatsappGroupLink ||
        "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4"
      );
    },
    intro: "SEN-AURA-TECH est une communauté dédiée au numérique, à l'informatique, à l'innovation et aux opportunités professionnelles au Sénégal.",
    objective: "Notre objectif est de créer une communauté dynamique permettant à ses membres de découvrir des opportunités d'emploi, appels à candidatures, stages, missions, formations et projets numériques.",
    jobMatching: "Lorsqu'une offre d'emploi ou un appel à candidature correspondant aux compétences recherchées est publié, les membres de la communauté SEN-AURA-TECH peuvent être informés en priorité et avoir la possibilité de transmettre leur CV et leur candidature selon les modalités indiquées dans l'annonce.",
    cvSharing: "Les membres peuvent également partager leur CV et leur profil professionnel afin de faciliter leur mise en relation avec les opportunités correspondant à leurs compétences.",
    offerings: [
      { id: "web", label: "Création de sites web", icon: "🌐" },
      { id: "software", label: "Développement de logiciels et applications", icon: "💻" },
      { id: "solutions", label: "Solutions informatiques", icon: "⚙️" },
      { id: "digitalization", label: "Digitalisation des entreprises", icon: "🚀" },
      { id: "training", label: "Formations et ressources numériques", icon: "📚" },
      { id: "advisory", label: "Conseils professionnels et technologiques", icon: "💡" },
      { id: "jobs", label: "Opportunités de stages et d'emploi", icon: "💼" },
      { id: "projects", label: "Appels à projets et candidatures", icon: "🎯" },
    ],
    closing: "Rejoindre SEN-AURA-TECH, c'est intégrer une communauté qui connecte les compétences aux opportunités.",
  },
  get regions() {
    return getActiveSystemConfig().logistics.activeRegions;
  },
  currencies: {
    FCFA: { code: "XOF", symbol: "FCFA", rateToXof: 1 },
    get EUR() {
      return {
        code: "EUR",
        symbol: "€",
        rateToXof: getActiveSystemConfig().finance.eurExchangeRate || 655.957,
      };
    },
  },
  get paymentMethods() {
    return [
      { id: "whatsapp_wave", name: "Wave via WhatsApp", icon: "🌊", badge: "Paiement 100% Instantané", color: "bg-cyan-500" },
      { id: "whatsapp_om", name: "Orange Money via WhatsApp", icon: "🟠", badge: "Direct & Sécurisé", color: "bg-orange-500" },
    ];
  },
};

export function formatCurrency(amountFcfa: number, currency: "FCFA" | "EUR" = "FCFA"): string {
  if (amountFcfa == null || isNaN(amountFcfa)) amountFcfa = 0;
  if (currency === "EUR") {
    const rate = getActiveSystemConfig().finance.eurExchangeRate || 655.957;
    const eur = amountFcfa / rate;
    return `${eur.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  }
  return `${amountFcfa.toLocaleString("fr-FR")} FCFA`;
}

