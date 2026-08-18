import { ProfessionalDTO, ProductDTO, CourseDTO, ServiceDTO } from "../shared/contracts/types";

// Reliable Unsplash image catalog for high performance and zero 404s
const UNSPLASH_IMAGES: Record<string, string> = {
  // Products
  dell_latitude_5440: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
  kit_cameras_dahua_4k: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80",
  "onduleur_solaire_hybride_5.5kw": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
  switch_cisco_24p_poe: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
  macbook_pro_m3: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
  starlink_v4_kit: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80",
  camera_solaire_4g_hikvision: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=800&auto=format&fit=crop&q=80",
  licence_windows11_office: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80",
  onduleur_apc_smartups_1500va: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&auto=format&fit=crop&q=80",

  // Pros / Avatars
  pro_moussa_diop: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  pro_awa_ndiaye: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
  pro_ibrahima_sarr: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
  pro_babacar_faye: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
  pro_fatou_sow: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
  pro_ousmane_kane: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
  pro_amadou_ba: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",

  // Courses
  course_nextjs_fullstack: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
  course_gemini_ai_masterclass: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
  course_cctv_security: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80",
};

export const cloudinaryImg = (publicId: string, _width = 800, _quality = "q_auto,f_auto") => {
  return UNSPLASH_IMAGES[publicId] || `https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80`;
};

export const SEED_SERVICES: ServiceDTO[] = [
  // Pôle 1 - Solutions Numériques
  {
    id: "sn-web",
    pole: "SOLUTIONS_NUMERIQUES",
    title: "Développement Web & Applications Cloud",
    description: "SaaS, ERP, Portails gouvernementaux, Webapps React/Next.js sur-mesure à forte charge.",
    iconName: "Code",
    tags: ["Next.js", "TypeScript", "Microservices", "Cloud"],
    startingPriceFCFA: 500000,
    popular: true,
  },
  {
    id: "sn-mobile",
    pole: "SOLUTIONS_NUMERIQUES",
    title: "Applications Mobiles Flutter / React Native",
    description: "Applications mobiles iOS & Android fluides avec paiement mobile Wave/Orange Money intégré.",
    iconName: "Smartphone",
    tags: ["Flutter", "iOS", "Android", "Paiement Mobile"],
    startingPriceFCFA: 650000,
    popular: true,
  },
  {
    id: "sn-ai",
    pole: "SOLUTIONS_NUMERIQUES",
    title: "Agents IA, Chatbots & Automation ERP",
    description: "Intégration d'IA générative Gemini, OCR de documents, automatisations de workflows d'entreprise.",
    iconName: "Bot",
    tags: ["Gemini AI", "NLP", "OCR", "Workflow Automation"],
    startingPriceFCFA: 400000,
    popular: true,
  },
  {
    id: "sn-devops",
    pole: "SOLUTIONS_NUMERIQUES",
    title: "DevOps, Cloud Kubernetes & Cybersécurité",
    description: "Audit de sécurité, conteneurisation Docker, CI/CD automatisé et déploiement AWS/Render.",
    iconName: "ShieldCheck",
    tags: ["Docker", "Kubernetes", "AWS", "SecOps"],
    startingPriceFCFA: 350000,
  },

  // Pôle 2 - Infrastructures Techniques
  {
    id: "it-camera",
    pole: "INFRASTRUCTURES_TECHNIQUES",
    title: "Vidéosurveillance IP & Alarmes Anti-Intrusion",
    description: "Installation sur-mesure de caméras haute définition, vision nocturne et visionnage à distance sur mobile.",
    iconName: "Video",
    tags: ["Caméras IP", "Dahua", "Hikvision", "Accès Mobile"],
    startingPriceFCFA: 250000,
    popular: true,
  },
  {
    id: "it-fibre",
    pole: "INFRASTRUCTURES_TECHNIQUES",
    title: "Réseaux d'Entreprise, Fibre & Wifi Pro",
    description: "Câblage structuré, baies de brassage, bornes wifi haute densité et routeurs professionnels.",
    iconName: "Wifi",
    tags: ["Fibre Optique", "Cisco", "Mikrotik", "Wifi 6"],
    startingPriceFCFA: 180000,
  },
  {
    id: "it-solaire",
    pole: "INFRASTRUCTURES_TECHNIQUES",
    title: "Énergie Solaire & Onduleurs Industriels",
    description: "Dimensionnement et pose de kits solaires autonomes pour entreprises, data centers et villas.",
    iconName: "Sun",
    tags: ["Solaire", "Onduleurs", "Batteries Lithium", "Autonomie"],
    startingPriceFCFA: 850000,
    popular: true,
  },

  // Pôle 3 - Conseil
  {
    id: "c-audit",
    pole: "CONSEIL",
    title: "Audit SI & Transformation Digitale",
    description: "Diagnostic de votre système d'information, alignement stratégique et cartographie applicative.",
    iconName: "FileSearch",
    tags: ["Audit", "Gouvernance", "Stratégie SI"],
    startingPriceFCFA: 500000,
  },
  {
    id: "c-amo",
    pole: "CONSEIL",
    title: "AMO & Gestion de Projets Agiles",
    description: "Assistance à maîtrise d'ouvrage, rédaction de cahiers des charges et pilotage de déploiements.",
    iconName: "Briefcase",
    tags: ["Scrum", "Cahier des charges", "PMO"],
    startingPriceFCFA: 300000,
  },
];

export const SEED_PROS: ProfessionalDTO[] = [];

export const SEED_PRODUCTS: ProductDTO[] = [];

export const SEED_COURSES: CourseDTO[] = [];


