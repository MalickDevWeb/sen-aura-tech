export type UserRole = "CLIENT" | "PROFESSIONAL" | "FORMATEUR" | "VENDEUR" | "ADMIN" | "AMBASSADOR";

export interface AmbassadorApplicationDTO {
  id: string; // e.g. "SAT-AMB-0025" or "AMB-1092"
  ambassadorCode?: string; // e.g. "SAT-AMB-0025"
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  profession: string;
  experience?: string;
  skills?: string[];
  cvUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  avatarUrl?: string;
  contactDomains?: string[]; // e.g. ["Entreprises", "Commerces", "Écoles", "ONG"]
  socialNetworks?: {
    tiktok?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    whatsapp?: string;
    [key: string]: string | undefined;
  };
  motivation?: string;
  commissionRatePercent?: number;
  tier?: "BRONZE" | "SILVER" | "GOLD" | "ELITE" | string;
  status: "EN_ATTENTE" | "VALIDE" | "REFUSE" | "COMPLEMENT_DEMANDE" | string;
  feedbackNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AmbassadorProspectDTO {
  id: string; // e.g. "SAT-P-00852"
  ambassadorId: string;
  ambassadorName?: string;
  ambassadorCode?: string;
  companyName: string;
  contactName: string;
  phone: string;
  email?: string;
  sector?: string;
  city?: string;
  clientNeed?: string;
  estimatedBudgetFCFA: number;
  source?: string;
  notes?: string;
  status: "NOUVEAU" | "CONTACTE" | "PROPOSITION_ENVOYEE" | "NEGOCIATION" | "PROJET_SIGNE" | "PAYE" | "PERDU" | string;
  createdAt: string;
  updatedAt?: string;
}

export interface AmbassadorCommissionDTO {
  id: string;
  ambassadorId: string;
  ambassadorName?: string;
  prospectId?: string;
  projectName?: string;
  clientName?: string;
  projectAmountFCFA: number;
  commissionRatePercent: number; // e.g. 10
  commissionAmountFCFA: number; // e.g. 100000
  status: "EN_ATTENTE_PAIEMENT_CLIENT" | "COMMISSION_VALIDEE" | "PAIEMENT_DEMANDE" | "PAYE" | "ANNULEE" | string;
  payoutMethod?: "WAVE" | "ORANGE_MONEY" | "VIREMENT" | string;
  paymentMethod?: string;
  payoutPhone?: string;
  transactionRef?: string;
  createdAt: string;
  paidAt?: string;
}

export interface AmbassadorPayoutDTO {
  id: string;
  ambassadorId: string;
  ambassadorName: string;
  amountFCFA: number;
  payoutMethod: "WAVE" | "ORANGE_MONEY" | "FREE_MONEY" | "VIREMENT_BANCAIRE" | string;
  payoutPhone: string;
  status: "EN_ATTENTE" | "PAYE" | "REJETE" | string;
  transactionRef?: string;
  notes?: string;
  requestedAt: string;
  processedAt?: string;
}

export type ProAccountStatus = "EN_ATTENTE" | "ESSAI_GRATUIT" | "ACTIF_ABONNE" | "SUSPENDU" | "PENDING" | "ACTIVE";

export type ProfileType = "CLIENT" | "VENDEUR" | "PROFESSIONAL" | "FORMATEUR" | "ADMIN" | "AMBASSADOR";

export interface ProfileSubscriptionDTO {
  profileType: ProfileType;
  planId: string;
  planName: string;
  billingCycle: "MONTHLY" | "YEARLY" | "LIFETIME" | "FREE";
  priceFCFA: number;
  status: "ACTIVE" | "TRIAL" | "EXPIRED" | "PENDING_PAYMENT";
  trialEndsAt?: string;
  expiresAt?: string;
  features: string[];
  autoRenew?: boolean;
  paymentMethod?: "WAVE" | "ORANGE_MONEY" | "FREE_MONEY" | "CARD" | "FREE";
  activatedAt: string;
}

export interface UserProfileDataDTO {
  type: ProfileType;
  active: boolean;
  title: string;
  displayName?: string;
  companyOrBoutiqueName?: string;
  academyName?: string;
  professionOrCategory?: string;
  bioOrDescription?: string;
  region?: string;
  address?: string;
  subscription: ProfileSubscriptionDTO;
  createdAt: string;
}

export interface UserDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  activeProfile?: ProfileType;
  profiles?: Record<string, UserProfileDataDTO>;
  avatar?: string;
  region: string;
  verified: boolean;
  proStatus?: ProAccountStatus;
  proApproved?: boolean;
  trialExpiresAt?: string;
  proFreeTrialActive?: boolean;
  createdAt: string;
  passwordHash?: string;
}

export type PoleType = 
  | "SOLUTIONS_NUMERIQUES"
  | "INFRASTRUCTURES_TECHNIQUES"
  | "CONSEIL"
  | "ACADEMY"
  | "MARKETPLACE"
  | "BOUTIQUE";

export interface ServiceDTO {
  id: string;
  pole: PoleType;
  title: string;
  description: string;
  iconName: string;
  tags: string[];
  startingPriceFCFA?: number;
  popular?: boolean;
}

export interface QuoteItemDTO {
  description: string;
  quantity: number;
  unitPriceFCFA: number;
  totalFCFA: number;
}

export interface QuoteRequestDTO {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  userRegion?: string;
  pole: PoleType;
  serviceTitle: string;
  description: string;
  region: string;
  budgetFCFA?: number;
  options?: string[];
  timeframe?: string;
  items?: QuoteItemDTO[];
  proposalAmountFCFA?: number;
  adminNotes?: string;
  assignedExpertName?: string;
  assignedExpertPhone?: string;
  validUntil?: string;
  publishedAt?: string;
  clientDecision?: "ACCEPTED" | "REJECTED" | "PENDING";
  clientNotes?: string;
  status: "EN_ATTENTE" | "EN_ETUDE" | "PROPOSITION_ENVOYEE" | "VALIDE" | "REFUSE";
  createdAt: string;
}

export interface ProfessionalDTO {
  id: string;
  fullName: string;
  category: "Plomberie" | "Électricité" | "Développement Software" | "Réseau & Fibre" | "Vidéosurveillance" | "Mécanique Auto" | "Comptabilité" | "Droit / Juridique" | "Architecture" | "Climatisation";
  region: string;
  phone: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  hourlyRateFCFA: number;
  verified: boolean;
  skills: string[];
  bio: string;
  completedJobs: number;
  available: boolean;
}

export interface BookingDTO {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  proId: string;
  proName: string;
  proCategory: string;
  date: string;
  time: string;
  region: string;
  address: string;
  description: string;
  estimatedFCFA: number;
  status: "CONFIRMEE" | "EN_COURS" | "TERMINEE" | "ANNULEE";
  createdAt: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  category: "Ordinateurs" | "Serveurs & Réseaux" | "Vidéosurveillance & Alarme" | "Solaire & Énergie" | "Téléphonie & Tablettes" | "Logiciels & Licences" | string;
  brand: string;
  priceFCFA: number;
  stock: number;
  image: string;
  mediaType?: "image" | "video";
  mainMediaUrl?: string;
  galleryImages?: string[]; // Up to 3 optional photo URLs stored on Cloudinary
  videoUrl?: string;
  description: string;
  specs: Record<string, string>;
  featured?: boolean;
  vendorId?: string;
  vendorName?: string;
  createdAt?: string;
}

export interface CourseDTO {
  id: string;
  title: string;
  category: "Informatique & Dev" | "Intelligence Artificielle" | "Cloud & DevOps" | "Infrastructures & Sécurité" | "Gestion & Entrepreneuriat";
  instructorName: string;
  instructorAvatar: string;
  level: "Débutant" | "Intermédiaire" | "Avancé" | "Tous niveaux";
  durationHours: number;
  priceFCFA: number;
  rating: number;
  studentsEnrolled: number;
  thumbnail: string;
  lessonsCount: number;
  certificateProvided: boolean;
}

export interface CartItemDTO {
  product: ProductDTO;
  quantity: number;
}

export interface OrderDTO {
  id: string;
  userId: string;
  userName: string;
  items: CartItemDTO[];
  totalFCFA: number;
  paymentMethod: "wave" | "orange_money" | "free_money" | "card";
  paymentStatus: "SUCCES" | "EN_ATTENTE" | "ECHEC";
  shippingAddress: string;
  region: string;
  createdAt: string;
}

export interface TicketDTO {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  pole: PoleType;
  priority: "Basse" | "Moyenne" | "Haute" | "Urgente";
  status: "OUVERT" | "EN_COURS" | "RESOLU";
  messages: { sender: string; text: string; timestamp: string }[];
  createdAt: string;
}

export interface ProgramDTO {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  category?: string;
  status: "ACTIF" | "INACTIF" | "TERMINE" | "BROUILLON";
  isFlagship?: boolean;
  isDraft?: boolean;
  sprintDurationDays?: number;
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface SolutionDTO {
  id: string;
  programId?: string;
  title: string;
  slug?: string;
  description?: string;
  category?: string;
  status: "LIVRE" | "EN_COURS" | "BROUILLON" | "EN_TEST";
  sprintNumber?: number;
  impactMetric?: string;
  metrics?: Record<string, any>;
  stackTech?: string[];
  imageUrl?: string;
  demoUrl?: string;
  isPublished?: boolean;
  isDraft?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ChallengeDTO {
  id: string;
  title: string;
  description?: string;
  submittedByName?: string;
  submittedByEmail?: string;
  submittedByPhone?: string;
  sector?: string;
  city?: string;
  estimatedBudgetFCFA?: number;
  status: "EN_ATTENTE" | "SELECTIONNE" | "REFUSE" | "EN_COURS";
  isPublished?: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface PublicationDTO {
  id: string;
  title: string;
  body?: string;
  type: "SOLUTION" | "PROGRAMME" | "CHALLENGE" | "PUB";
  programId?: string;
  solutionId?: string;
  challengeId?: string;
  mediaUrl?: string;
  mediaType?: string;
  callToAction?: string;
  targetUrl?: string;
  isActive?: boolean;
  isDraft?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}
