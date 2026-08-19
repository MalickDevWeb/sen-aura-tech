import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { OfficialCertificateModal } from "../../components/OfficialCertificateModal";
import { generateGenericPDF, exportQuotePDF } from "../../lib/pdfGenerator";
import { ResetUserPinButton } from "../../shared/components/ResetUserPinButton";
import { UserSecurityTab } from "../../shared/components/UserSecurityTab";
import { AdminPinResetConsole } from "../../shared/components/AdminPinResetConsole";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  ShoppingBag,
  GraduationCap,
  UserCheck,
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Briefcase,
  Store,
  ShieldAlert,
  Search,
  ExternalLink,
  Phone,
  Check,
  Tag,
  User,
  Wrench,
  BookOpen,
  PackageCheck,
  Trash2,
  Edit,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Award,
  DollarSign,
  Eye,
  Download,
  Send,
  Layers,
  Upload,
  Video,
  Globe,
  Headphones,
  Settings,
  MessageSquare,
  File,
  Link,
  Play,
  Image as ImageIcon,
  Users,
  Menu,
  X
} from "lucide-react";
import { store } from "../../database/store";
import { ActionConfirmModal, ConfirmConfig } from "../../shared/components/ActionConfirmModal";
import { CustomDialog } from "../../shared/components/CustomDialog";
import { formatCurrency } from "../../config/constants";
import { UserRole, QuoteRequestDTO } from "../../shared/contracts/types";

import { eventBus, EVENTS } from "../../shared/events/event-bus";
import { ClientSidebar } from "./sidebars/ClientSidebar";
import { ProSidebar } from "./sidebars/ProSidebar";
import { FormateurSidebar } from "./sidebars/FormateurSidebar";
import { VendeurSidebar } from "./sidebars/VendeurSidebar";
import { AdminSidebar } from "./sidebars/AdminSidebar";
import { AmbassadorSidebar } from "./sidebars/AmbassadorSidebar";
import { AmbassadorDashboardView } from "../ambassador/AmbassadorDashboardView";
import { AmbassadorAdminView } from "../ambassador/AmbassadorAdminView";
import { VendorProductUploadForm } from "../vendor/VendorProductUploadForm";
import { VendorProductMediaModal } from "../vendor/VendorProductMediaModal";
import { FormateurCourseUploadForm } from "../formateur/FormateurCourseUploadForm";
import { ProPortfolioUploadForm } from "../pro/ProPortfolioUploadForm";
import { SuperAdminSettingsManager } from "./components/SuperAdminSettingsManager";
import { SecurityFirewallPanel } from "./components/SecurityFirewallPanel";
import { ProProfileEditor } from "./components/ProProfileEditor";
import { FormateurProfileEditor } from "./components/FormateurProfileEditor";
import { VendeurProfileEditor } from "./components/VendeurProfileEditor";
import { AdminQuoteProposalModal } from "./components/AdminQuoteProposalModal";
import { SecurityPinService } from "../../services/securityPinService";
import { ProfileType } from "../../shared/contracts/types";
import { PROFILES_METADATA } from "../../config/profilesConfig";
import { ProfileSwitcher } from "./components/ProfileSwitcher";
import { ActivateProfileModal } from "./components/ActivateProfileModal";
import { ProfileSubscriptionCard } from "./components/ProfileSubscriptionCard";
import { authFetch } from "../../lib/authFetch";

interface DashboardViewProps {
  currency: "FCFA" | "EUR";
  onNavigate?: (tab: string) => void;
  onOpenQuoteModal?: () => void;
  onOpenAuthModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currency,
  onNavigate,
  onOpenQuoteModal,
  onOpenAuthModal,
}) => {
  const [role, setRole] = useState<UserRole>(store.currentUser.role);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(store.isLoggedIn);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activationInitialProfile, setActivationInitialProfile] = useState<ProfileType | undefined>(undefined);

  const handleOpenActivationModal = (initialProfile?: ProfileType) => {
    setActivationInitialProfile(initialProfile);
    setIsActivationModalOpen(true);
  };

  useEffect(() => {
    // Sync on mount in case already logged in
    setIsLoggedIn(store.isLoggedIn);
    setRole(store.currentUser.role);

    const unsubRole = eventBus.subscribe(EVENTS.ROLE_CHANGED, (newRole) => {
      setIsLoggedIn(store.isLoggedIn);
      setRole(newRole as UserRole);
    });
    const unsubProfile = eventBus.subscribe("PROFILE_SWITCHED", (newProfile) => {
      setIsLoggedIn(store.isLoggedIn);
      setRole(newProfile as UserRole);
    });
    const unsubToggle = eventBus.subscribe("TOGGLE_DASHBOARD_SIDEBAR", () => {
      setMobileDrawerOpen((prev) => !prev);
    });
    return () => {
      unsubRole();
      unsubProfile();
      unsubToggle();
    };
  }, []);

  const [clientTab, setClientTab] = useState<string>("overview");
  
  // Sub-tabs for each specific role
  const [proTab, setProTab] = useState<string>("missions");
  const [formateurTab, setFormateurTab] = useState<string>("courses");
  const [vendeurTab, setVendeurTab] = useState<string>("stock");
  const [adminTab, setAdminTab] = useState<string>("quotes");
  const [ambassadorTab, setAmbassadorTab] = useState<string>("overview");

  // User-specific scoped data for Client Dashboard to isolate data per account
  const isClient = role === "CLIENT";
  const currentUserId = store.currentUser?.id;
  const currentUserPhoneDigits = (store.currentUser?.phone || "").replace(/\D/g, "");
  const currentUserNameClean = (store.currentUser?.fullName || "").toLowerCase().trim();

  const myQuotes = isClient && currentUserId && currentUserId !== "admin"
    ? store.quotes.filter((q) => {
        const qPhoneDigits = (q.userPhone || (q as any).clientPhone || "").replace(/\D/g, "");
        const qUser = (q.userName || (q as any).clientName || "").toLowerCase().trim();
        return (
          (q.userId && q.userId === currentUserId) ||
          (currentUserPhoneDigits.length >= 7 && qPhoneDigits.includes(currentUserPhoneDigits.slice(-7))) ||
          (currentUserNameClean && qUser && currentUserNameClean === qUser)
        );
      })
    : store.quotes;

  const myOrders = isClient && currentUserId && currentUserId !== "admin"
    ? store.orders.filter((o) => {
        const oPhoneDigits = ((o as any).userPhone || (o as any).customerPhone || (o as any).phone || "").replace(/\D/g, "");
        const oUser = (o.userName || (o as any).customerName || "").toLowerCase().trim();
        return (
          (o.userId && o.userId === currentUserId) ||
          (currentUserPhoneDigits.length >= 7 && oPhoneDigits.includes(currentUserPhoneDigits.slice(-7))) ||
          (currentUserNameClean && oUser && currentUserNameClean === oUser)
        );
      })
    : store.orders;

  const myBookings = isClient && currentUserId && currentUserId !== "admin"
    ? store.bookings.filter((b) => {
        const bPhoneDigits = (b.clientPhone || "").replace(/\D/g, "");
        const bUser = (b.clientName || "").toLowerCase().trim();
        return (
          (b.clientId && b.clientId === currentUserId) ||
          (currentUserPhoneDigits.length >= 7 && bPhoneDigits.includes(currentUserPhoneDigits.slice(-7))) ||
          (currentUserNameClean && bUser && currentUserNameClean === bUser)
        );
      })
    : store.bookings;

  const myInvoices = myOrders.map((o) => ({
    id: `FAC-2026-${o.id.replace(/[^0-9]/g, "").slice(-6) || "881200"}`,
    transactionRef: o.id,
    title: `Commande Boutique - ${o.items?.map((it) => it.product?.name).filter(Boolean).join(", ") || "Matériels informatiques & solaires"}`,
    amountFCFA: o.totalFCFA,
    paymentMethod: o.paymentMethod ? o.paymentMethod.toUpperCase() : "WAVE",
    date: o.createdAt,
    status: o.paymentStatus || "Payé",
    order: o,
  }));

  // Local state for interactive actions
  const [acceptedMissions, setAcceptedMissions] = useState<string[]>([]);
  const [issuedCertificates, setIssuedCertificates] = useState<string[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("50000");
  const [withdrawPhone, setWithdrawPhone] = useState<string>(
    store.currentUser.phone && store.currentUser.phone !== "+221"
      ? store.currentUser.phone.replace("+221", "").trim()
      : ""
  );
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);

  // New product form state for Vendeur
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("10");
  const [newProdCategory, setNewProdCategory] = useState("Solaire & Énergie");
  const [prodSuccessMsg, setProdSuccessMsg] = useState("");

  // Formateur State for full CRUD
  const [formateurCourses, setFormateurCourses] = useState<any[]>([]);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState("");

  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseCategory, setNewCourseCategory] = useState("IA & Data");
  const [newCoursePrice, setNewCoursePrice] = useState("50000");
  const [newCourseDuration, setNewCourseDuration] = useState("15 Heures");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newCourseCover, setNewCourseCover] = useState<string>("");
  const [newCoursePdfName, setNewCoursePdfName] = useState<string>("");
  const [newCoursePdfData, setNewCoursePdfData] = useState<string>("");
  const [newCourseYoutubeUrl, setNewCourseYoutubeUrl] = useState<string>("");
  const [newCourseAppUrl, setNewCourseAppUrl] = useState<string>("");
  const [courseSuccessMsg, setCourseSuccessMsg] = useState("");

  const [selectedCoursePreview, setSelectedCoursePreview] = useState<any | null>(null);

  const [formateurStudents, setFormateurStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [formateurBalance, setFormateurBalance] = useState(0);
  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [selectedCertStudent, setSelectedCertStudent] = useState<any | null>(null);

  // Vendeur CRUD State & Media Modal
  const [selectedVendorProductForMedia, setSelectedVendorProductForMedia] = useState<any | null>(null);
  const [vendeurProducts, setVendeurProducts] = useState<any[]>([]);
  const [vendeurOrders, setVendeurOrders] = useState<any[]>([]);

  // Admin CRUD State & Pro Account Activations
  const [proRoleActivations, setProRoleActivations] = useState<Record<string, { active: boolean; paymentInfo: string }>>({
    FORMATEUR: { active: true, paymentInfo: "Compte activé & validé par SuperAdmin (Accès Complet)" },
    VENDEUR: { active: true, paymentInfo: "Compte activé & validé par SuperAdmin (Accès Complet)" },
    PROFESSIONAL: { active: true, paymentInfo: "Compte activé & validé par SuperAdmin (Accès Complet)" },
    AMBASSADOR: { active: true, paymentInfo: "Réseau Ambassadeur Gratuit (Membre Actif)" },
  });

  const isRoleActive = (r: string) => {
    if (r === "CLIENT" || r === "ADMIN" || r === "AMBASSADOR") return true;
    if (store.currentUser.role === r) {
      const u = store.currentUser;
      // Expired trial → not active
      if (u.proStatus === "ESSAI_GRATUIT" && u.trialExpiresAt) {
        const expired = new Date(u.trialExpiresAt) < new Date();
        if (expired) return false;
        return true;
      }
      // Active subscriber
      if (u.proStatus === "ACTIF_ABONNE" || u.proApproved) return true;
      // Still waiting (never activated)
      if (u.proStatus === "EN_ATTENTE" && !u.proApproved) return false;
    }
    return proRoleActivations[r]?.active ?? true;
  };

  // Determine pro banner state: "pending" | "expired" | "active"
  const getProBannerState = (): "pending" | "expired" | "active" => {
    const u = store.currentUser;
    if (!u || role === "CLIENT" || role === "ADMIN" || role === "AMBASSADOR") return "active";
    // Active subscriber → always active
    if (u.proStatus === "ACTIF_ABONNE" || u.proApproved) return "active";
    // Trial active and not expired
    if (u.proStatus === "ESSAI_GRATUIT" && u.trialExpiresAt) {
      const expired = new Date(u.trialExpiresAt) < new Date();
      if (!expired) return "active";
      return "expired"; // trial expired
    }
    // Never activated
    if (u.proStatus === "EN_ATTENTE" || !u.proStatus) return "pending";
    return "active";
  };
  const proBannerState = getProBannerState();

  const [adminUsers, setAdminUsers] = useState<any[]>(() => {
    if (store.currentUser.id && store.currentUser.fullName) {
      return [{
        id: store.currentUser.id,
        name: store.currentUser.fullName,
        email: store.currentUser.email || `${store.currentUser.phone || "user"}@senauratech.sn`,
        role: store.currentUser.role,
        region: store.currentUser.region || "Dakar",
        status: "Actif",
        paymentStatus: "Compte Connecté"
      }];
    }
    return [];
  });
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("TOUS");
  const [adminQuotes, setAdminQuotes] = useState<QuoteRequestDTO[]>(store.quotes);
  const [adminQuoteFilter, setAdminQuoteFilter] = useState<string>("ALL");
  const [selectedQuoteForProposal, setSelectedQuoteForProposal] = useState<QuoteRequestDTO | null>(null);
  const [adminPros, setAdminPros] = useState<any[]>([]);
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // ---- Premium Prompt Dialog (replaces native browser prompt()) ----
  const [promptConfig, setPromptConfig] = useState<{
    title: string;
    message: string;
    placeholder?: string;
    defaultValue?: string;
    resolve: (v: string | undefined) => void;
  } | null>(null);

  const askPrompt = (title: string, message: string, placeholder?: string, defaultValue?: string): Promise<string | undefined> => {
    return new Promise((resolve) => {
      setPromptConfig({ title, message, placeholder, defaultValue: defaultValue || "", resolve });
    });
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("senaura_auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const api = (path: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("senaura_auth_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
    return fetch(path, { ...options, headers });
  };
  const [adminOrders, setAdminOrders] = useState(store.orders);
  const [proBookings, setProBookings] = useState<any[]>(store.bookings);
  const [proSearch, setProSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (role === "ADMIN") {
      authFetch("/api/db/users")
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.users) && data.users.length > 0) {
            setAdminUsers(data.users.map((u: any) => ({
              id: u.id,
              name: u.fullName || u.name,
              email: u.email,
              role: u.role || "CLIENT",
              region: u.city || u.region || "Dakar",
              status: u.status || "Actif",
              paymentStatus: u.paymentStatus || "Actif"
            })));
          }
        })
        .catch(() => {});

      // Load admin pros from DB
      authFetch("/api/db/providers")
        .then(r => r.json())
        .then(data => { if (data.success && Array.isArray(data.providers)) setAdminPros(data.providers); })
        .catch(() => {});

      // Load admin products from DB
      authFetch("/api/db/products")
        .then(r => r.json())
        .then(data => { if (data.success && Array.isArray(data.products)) setAdminProducts(data.products); })
        .catch(() => {});

      // Load admin orders from DB
      authFetch("/api/db/orders")
        .then(r => r.json())
        .then(data => { if (data.success && Array.isArray(data.orders)) setAdminOrders(data.orders); })
        .catch(() => {});
    }

    const loadVendorProducts = () => {
      authFetch("/api/vendor/products")
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.products) && data.products.length > 0) {
            setVendeurProducts(data.products);
          } else {
            authFetch("/api/db/products")
              .then(r => r.json())
              .then(dbData => {
                if (dbData.success && Array.isArray(dbData.products) && dbData.products.length > 0) {
                  setVendeurProducts(dbData.products);
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    };

    if (role === "VENDEUR" || role === "ADMIN") {
      // Load vendeur orders from DB
      authFetch("/api/db/orders")
        .then(r => r.json())
        .then(data => { if (data.success && Array.isArray(data.orders)) setVendeurOrders(data.orders); })
        .catch(() => {});
      loadVendorProducts();
    }

    const loadFormateurCourses = () => {
      authFetch("/api/db/courses")
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.courses)) {
            setFormateurCourses(data.courses.filter((c: any) => c.instructorName === store.currentUser.fullName || c.instructorId === store.currentUser.id));
          } else if (store.courses?.length > 0) {
            setFormateurCourses(store.courses.filter(c => (c as any).instructorName === store.currentUser.fullName || (c as any).instructorId === store.currentUser.id));
          }
        })
        .catch(() => {
          if (store.courses?.length > 0) {
            setFormateurCourses(store.courses.filter(c => (c as any).instructorName === store.currentUser.fullName || (c as any).instructorId === store.currentUser.id));
          }
        });
    };

    if (role === "FORMATEUR" || role === "ADMIN") {
      // Load formateur students from DB
      authFetch("/api/db/users")
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.users)) {
            setFormateurStudents(data.users.filter((u: any) => u.role === "CLIENT" && u.enrolledCourses?.length > 0));
          }
        })
        .catch(() => {});
      loadFormateurCourses();
    }

    if (role === "PROFESSIONAL") {
      authFetch("/api/pro/bookings")
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.bookings)) {
            setProBookings(data.bookings);
          }
        })
        .catch(() => {});
    }

    const handleProductSync = (e: any) => {
      if (e?.detail) {
        setVendeurProducts(prev => [e.detail, ...prev.filter(p => p.id !== e.detail.id)]);
      } else {
        loadVendorProducts();
      }
    };

    window.addEventListener("sat_product_published", handleProductSync);
    window.addEventListener("sat_products_updated", handleProductSync);
    return () => {
      window.removeEventListener("sat_product_published", handleProductSync);
      window.removeEventListener("sat_products_updated", handleProductSync);
    };
  }, []);

  const roleDescriptions: Record<UserRole, { title: string; subtitle: string; icon: any }> = {
    CLIENT: {
      title: "Espace Client & Particulier",
      subtitle: "Suivez vos devis, vos achats en boutique, vos techniciens réservés et vos cours.",
      icon: User,
    },
    PROFESSIONAL: {
      title: "Espace Prestataire / Technicien",
      subtitle: "Gérez vos missions d'intervention sur le terrain, vos plannings et vos revenus.",
      icon: Wrench,
    },
    FORMATEUR: {
      title: "Espace Formateur Academy",
      subtitle: "Gérez vos contenus de cours, vos étudiants inscrits et la délivrance des certificats.",
      icon: GraduationCap,
    },
    VENDEUR: {
      title: "Espace Vendeur Équipements",
      subtitle: "Supervisez vos stocks de matériels informatiques, solaires et vos commandes reçues.",
      icon: Store,
    },
    ADMIN: {
      title: "Supervision Administrateur",
      subtitle: "Backoffice global de gestion de la plateforme, des statistiques et des utilisateurs.",
      icon: ShieldAlert,
    },
    AMBASSADOR: {
      title: "Espace Ambassadeur & Apporteur d'Affaires",
      subtitle: "Gérez vos prospects, vos projets apportés, votre catalogue et vos commissions.",
      icon: Users,
    },
  };

  const isFirstTab =
    (role === "CLIENT" && clientTab === "overview") ||
    (role === "PROFESSIONAL" && proTab === "missions") ||
    (role === "FORMATEUR" && formateurTab === "courses") ||
    (role === "VENDEUR" && vendeurTab === "stock") ||
    (role === "ADMIN" && adminTab === "overview");

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">Vous êtes Déconnecté</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Vous avez été déconnecté avec succès. Veuillez vous connecter par SMS/OTP pour accéder à votre espace personnel SEN AURA.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={onOpenAuthModal}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Se Reconnecter par SMS</span>
          </button>
          <button
            onClick={() => onNavigate?.("home")}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
          >
            Retourner au Site Public
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 py-3 space-y-3.5">
      
      {/* MOBILE POPUP DRAWER OVERLAY (FOR REAL MOBILE APP POPUP EXPERIENCE) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          {/* Backdrop click listener */}
          <div
            className="fixed inset-0"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="relative z-10 w-full max-h-[85vh] overflow-y-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
                {roleDescriptions[role]?.title || role}
              </span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {role === "CLIENT" && (
              <ClientSidebar
                clientTab={clientTab}
                setClientTab={setClientTab}
                onNavigate={onNavigate}
                onItemClick={() => setMobileDrawerOpen(false)}
              />
            )}
            {role === "PROFESSIONAL" && (
              <ProSidebar
                proTab={proTab}
                setProTab={setProTab}
                acceptedMissionsCount={acceptedMissions.length}
                onNavigate={onNavigate}
                onItemClick={() => setMobileDrawerOpen(false)}
              />
            )}
            {role === "FORMATEUR" && (
              <FormateurSidebar
                formateurTab={formateurTab}
                setFormateurTab={setFormateurTab}
                issuedCertificatesCount={issuedCertificates.length}
                onNavigate={onNavigate}
                onItemClick={() => setMobileDrawerOpen(false)}
              />
            )}
            {role === "VENDEUR" && (
              <VendeurSidebar
                vendeurTab={vendeurTab}
                setVendeurTab={setVendeurTab}
                vendeurProductsCount={vendeurProducts.length}
                vendeurOrdersCount={vendeurOrders.length}
                onNavigate={onNavigate}
                onItemClick={() => setMobileDrawerOpen(false)}
              />
            )}
            {role === "ADMIN" && (
              <AdminSidebar
                adminTab={adminTab}
                setAdminTab={setAdminTab}
                onNavigate={onNavigate}
                onItemClick={() => setMobileDrawerOpen(false)}
              />
            )}
            {role === "AMBASSADOR" && (
              <AmbassadorSidebar
                ambassadorTab={ambassadorTab}
                setAmbassadorTab={setAmbassadorTab}
                onNavigate={onNavigate}
                onItemClick={() => setMobileDrawerOpen(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* MOBILE QUICK BAR (MD:HIDDEN) */}
      <div className="md:hidden flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
          {roleDescriptions[role]?.title || role}
        </span>
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 shrink-0 active:scale-95 transition-all"
        >
          <Menu className="w-4 h-4" />
          <span>Menu Navigation</span>
        </button>
      </div>



      {/* --- PRO ACCOUNT BANNER: PENDING (never activated) --- */}
      {proBannerState === "pending" && role !== "CLIENT" && role !== "ADMIN" && role !== "AMBASSADOR" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500/40 space-y-6 text-slate-200 shadow-2xl relative overflow-hidden max-w-4xl mx-auto my-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">Compte {roleDescriptions[role]?.title || role} en Attente de Validation</h2>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/40">
                  Statut : En Attente ⏳
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Votre inscription a bien été enregistrée. Pour garantir un haut niveau d'expertise, les profils professionnels sont examinés par l'équipe SEN AURA TECH avant ouverture définitive.
              </p>
            </div>
          </div>

          {/* WhatsApp & Email Notification Notice */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Notification de Validation par WhatsApp &amp; Email</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dès que la direction aura examiné et validé votre dossier, vous recevrez automatiquement un message de confirmation officiel par <strong>WhatsApp</strong> et par <strong>Email</strong> avec vos accès complets.
            </p>
          </div>

          {/* Offre Essai Gratuit */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-emerald-500/15 border border-amber-500/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Offre Spéciale Premiers Inscrits : Essai Gratuit de 30 Jours Sans Frais</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pour vous permettre de démarrer immédiatement sans attendre, de configurer votre profil en temps réel et de recevoir des missions des visiteurs, activez dès maintenant votre <strong>Offre de Gratuité de Lancement</strong>. À la fin de cette période, vous pourrez souscrire à l'abonnement mensuel (25,000 FCFA/mois) pour continuer à bénéficier de tous nos services.
            </p>
            <div className="pt-1">
              <button
                onClick={() => {
                  store.activateProFreeTrial();
                  setConfirmConfig({ isAlert: true, message: "🎉 Félicitations ! Votre Offre de Gratuité de 30 Jours a été activée avec succès ! Vous pouvez maintenant modifier votre profil pro en direct et recevoir des interventions.", onConfirm: () => {} })
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Activer mon Offre de Gratuité 30 Jours Immédiate</span>
              </button>
            </div>
          </div>

          {/* Payment & Support Info */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-400">
            <p className="font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Règlement de l'Abonnement Pro (Optionnel pour validation immédiate SuperAdmin) :
            </p>
            <p className="text-[11px] leading-relaxed">
              Vous pouvez également régler votre abonnement mensuel de <strong>25,000 FCFA</strong> par <strong>Wave</strong> ou <strong>Orange Money</strong> au <strong className="text-amber-400 font-mono font-bold">+221 70 533 46 11</strong> et contacter le SuperAdmin sur WhatsApp pour une validation manuelle prioritaire.
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <button
              onClick={() => { store.switchRole("CLIENT"); }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>Accéder à l'Espace Client (Accès Libre)</span>
            </button>
            <a
              href="https://wa.me/221705334611?text=Bonjour%20SuperAdmin%20SEN%20AURA%20TECH%2C%20je%20souhaite%20valider%20mon%20compte%20professionnel."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-800 border border-emerald-500/40 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Contacter le Support SuperAdmin (WhatsApp)</span>
            </a>
          </div>
        </div>
      )}

      {/* --- PRO ACCOUNT BANNER: EXPIRED (trial ended OR subscription ended) --- */}
      {proBannerState === "expired" && role !== "CLIENT" && role !== "ADMIN" && role !== "AMBASSADOR" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-rose-500/40 space-y-5 text-slate-200 shadow-2xl relative overflow-hidden max-w-4xl mx-auto my-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-rose-500/20">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">Période d'Accès Terminée</h2>
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold border border-rose-500/40">
                  Statut : Expiré ❌
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Votre {store.currentUser.proStatus === "ESSAI_GRATUIT" ? "essai gratuit de 30 jours" : "abonnement mensuel"} a expiré. Renouvelez pour continuer à recevoir des missions et être visible des clients SEN AURA TECH.
              </p>
            </div>
          </div>

          {/* Renewal options */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-emerald-500/10 border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Renouveler votre Abonnement Pro — 25,000 FCFA / mois</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="font-bold text-white">✅ Ce que vous débloquez :</p>
                <p>• Visibilité en temps réel sur la plateforme</p>
                <p>• Réception de nouvelles demandes clients</p>
                <p>• Gestion complète de votre profil Pro</p>
                <p>• Tableau de bord missions & revenus</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="font-bold text-amber-400">💳 Comment renouveler :</p>
                <p>Réglez <strong>25,000 FCFA</strong> par :</p>
                <p>• <strong>Wave</strong> ou <strong>Orange Money</strong></p>
                <p>• au <strong className="text-amber-400 font-mono">+221 70 533 46 11</strong></p>
                <p>• puis contactez le SuperAdmin sur WhatsApp pour activation immédiate</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href={`https://wa.me/221705334611?text=Bonjour%20SuperAdmin%2C%20je%20souhaite%20renouveler%20mon%20abonnement%20Pro%20SEN%20AURA%20TECH%20(${encodeURIComponent(store.currentUser.fullName || '')}%20-%20${encodeURIComponent(store.currentUser.phone || '')}).`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Phone className="w-4 h-4" />
              <span>Renouveler via WhatsApp (Activation Immédiate)</span>
            </a>
            <button
              onClick={() => { store.switchRole("CLIENT"); }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>Accéder à l'Espace Client</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE 1: CLIENT DASHBOARD                                                 */}
      {/* ========================================================================= */}
      {role === "CLIENT" && (
        <div className="flex flex-col md:flex-row gap-3.5 lg:gap-4 items-start">
          
          {/* CLIENT SIDEBAR */}
          <div className="hidden md:block shrink-0 sticky top-20 self-start">
            <ClientSidebar clientTab={clientTab} setClientTab={setClientTab} onNavigate={onNavigate} />
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 min-w-0 w-full space-y-4">

          {/* TAB CONTENT: OVERVIEW */}
          {clientTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Quick Metrics Cards in a Gorgeous 2x2 Grid */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                  },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5"
              >
                {/* 1. DEVIS */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                  onClick={() => setClientTab("quotes")}
                  className="cursor-pointer relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-amber-950/20 border border-slate-800 hover:border-amber-500/60 shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mes Devis Demandés</span>
                      </div>
                      <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight group-hover:text-amber-400 transition-colors">
                        {myQuotes.length}
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-110 group-hover:bg-amber-500/20 transition-all shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Pôles Solutions, Solaire, Fibre & Conseil</span>
                    <span className="text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Consulter →
                    </span>
                  </div>
                </motion.div>

                {/* 2. COMMANDES */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                  onClick={() => setClientTab("orders")}
                  className="cursor-pointer relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-sky-950/20 border border-slate-800 hover:border-sky-500/60 shadow-lg hover:shadow-sky-500/10 transition-all duration-300 group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/20 transition-all" />
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Commandes Équipements</span>
                      </div>
                      <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight group-hover:text-sky-400 transition-colors">
                        {myOrders.length}
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner group-hover:scale-110 group-hover:bg-sky-500/20 transition-all shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Achats matériels Wave & Orange Money</span>
                    <span className="text-sky-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Suivre →
                    </span>
                  </div>
                </motion.div>

                {/* 3. RÉSERVATIONS */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                  onClick={() => setClientTab("bookings")}
                  className="cursor-pointer relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-emerald-950/20 border border-slate-800 hover:border-emerald-500/60 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Réservations Techniciens</span>
                      </div>
                      <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight group-hover:text-emerald-400 transition-colors">
                        {myBookings.length}
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Interventions à domicile / entreprise</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Planning →
                    </span>
                  </div>
                </motion.div>

                {/* 4. FORMATIONS */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                  onClick={() => setClientTab("courses")}
                  className="cursor-pointer relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-indigo-950/20 border border-slate-800 hover:border-indigo-500/60 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cours & Formations</span>
                      </div>
                      <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight group-hover:text-indigo-400 transition-colors">
                        {store.enrolledCourseIds.length}
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Certificats SEN AURA ACADEMY</span>
                    <span className="text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Accéder →
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Banner Espace & Badge Ambassadeur */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-amber-900/30 to-slate-900 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold uppercase">
                      Réseau d'Affaires VIP
                    </span>
                    <span className="text-amber-400 text-xs font-bold">★ Ambassadeur Network</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Votre Espace Ambassadeur & Badge Officiel</h3>
                  <p className="text-xs text-slate-300">
                    Générez votre carte d'accréditation, partagez votre lien de parrainage et percevez vos commissions d'apporteur d'affaires en FCFA.
                  </p>
                </div>
                <button
                  onClick={() => store.switchRole("AMBASSADOR")}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-slate-950" />
                  <span>Ouvrir l'Espace Ambassadeur</span>
                </button>
              </div>

              {/* Recent Quotes Summary */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Dernières Demandes de Devis Effectuées</span>
                  </h3>
                  {onOpenQuoteModal && (
                    <button
                      onClick={onOpenQuoteModal}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Nouveau Devis
                    </button>
                  )}
                </div>

                {myQuotes.length === 0 ? (
                  <div className="text-center py-8 space-y-2 text-slate-400">
                    <p className="text-xs">Aucun devis enregistré pour le moment.</p>
                    {onOpenQuoteModal && (
                      <button
                        onClick={onOpenQuoteModal}
                        className="text-xs text-amber-400 font-bold hover:underline"
                      >
                        Demander votre premier devis gratuit →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myQuotes.slice(0, 3).map((q) => (
                      <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-amber-400 font-bold">{q.id}</span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              {q.pole.replace(/_/g, " ")}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1">{q.serviceTitle}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{q.description}</p>
                        </div>

                        <div className="text-right sm:shrink-0 space-y-1">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {q.status}
                          </span>
                          <p className="text-xs font-mono font-bold text-amber-400">
                            Budget : {formatCurrency(q.budgetFCFA || 0, currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 100% Zero-Cost WhatsApp PIN / Security Code Change Section */}
              <div className="pt-2">
                <UserSecurityTab
                  user={{
                    fullName: store.currentUser.fullName || "Utilisateur SEN AURA TECH",
                    phone: store.currentUser.phone || "705334611",
                    whatsapp: store.currentUser.phone || "705334611"
                  }}
                  onUpdatePin={(newPin) => {
                    setConfirmConfig({ isAlert: true, message: `Votre code secret à 4 chiffres (${newPin}) a été mis à jour avec succès via validation WhatsApp OTP !`, onConfirm: () => {} })
                  }}
                />
              </div>

            </div>
          )}

          {/* TAB CONTENT: QUOTES */}
          {clientTab === "quotes" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span>Mes Demandes de Devis ({myQuotes.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Suivi en temps réel de vos demandes d'études techniques et propositions commerciales chiffrées.
                  </p>
                </div>
                {onOpenQuoteModal && (
                  <button
                    onClick={onOpenQuoteModal}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Demander un Devis Gratuit
                  </button>
                )}
              </div>

              {myQuotes.length === 0 ? (
                <div className="p-10 text-center space-y-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">Aucune demande de devis enregistrée pour le moment.</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Soumettez votre projet sans engagement : nos ingénieurs étudieront vos besoins et établiront une proposition technique sur-mesure.
                  </p>
                  {onOpenQuoteModal && (
                    <button
                      onClick={onOpenQuoteModal}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-lg"
                    >
                      Demander une étude technique gratuite
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {myQuotes.map((q) => {
                    const isPending = q.status === "EN_ATTENTE" || (q.status as string) === "EN_ETUDE";
                    const isPublished = q.status === "PROPOSITION_ENVOYEE" || q.status === "VALIDE" || (q.status as string) === "Validé";
                    const isRefused = q.status === "REFUSE";

                    return (
                      <div
                        key={q.id}
                        className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                          isPublished
                            ? "bg-slate-950 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                            : isRefused
                            ? "bg-slate-950 border-rose-500/30"
                            : "bg-slate-950 border-slate-800"
                        }`}
                      >
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-amber-400 font-bold">{q.id}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                              Pôle : {q.pole}
                            </span>
                            {q.region && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                                Région : {q.region}
                              </span>
                            )}
                          </div>

                          {/* Status Badge */}
                          {isPending && (
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 animate-spin" />
                              <span>⏳ En cours d'étude par nos ingénieurs</span>
                            </span>
                          )}
                          {isPublished && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>✓ Proposition Commerciale Prête</span>
                            </span>
                          )}
                          {isRefused && (
                            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Refusé</span>
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-white">{q.serviceTitle}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed mt-1">{q.description}</p>
                        </div>

                        {/* Selected Options / Specifications if any */}
                        {q.options && q.options.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[11px] text-slate-400 font-semibold">Options demandées :</span>
                            {q.options.map((opt, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                                ✓ {opt}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Workflow Status Specific Box */}
                        {isPending && (
                          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5 text-xs text-amber-200">
                            <div className="flex items-center gap-2 font-bold text-amber-300">
                              <Clock className="w-4 h-4 text-amber-400" />
                              <span>Étude technique et chiffrage en cours</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              Votre demande a bien été enregistrée dans notre système. Un ingénieur SEN AURA TECH prépare actuellement votre proposition technique détaillée et le bordereau chiffré.
                            </p>
                            <p className="text-[11px] text-amber-400/90 font-medium">
                              ℹ️ Le devis officiel au format PDF téléchargeable sera automatiquement disponible sur cette page dès que l'administrateur aura validé et publié la proposition commerciale.
                            </p>
                          </div>
                        )}

                        {isPublished && (
                          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Montant Chiffré Officiel</span>
                                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                                  {formatCurrency(q.proposalAmountFCFA || q.budgetFCFA || 0, currency)}
                                </div>
                              </div>

                              {q.validUntil && (
                                <div className="text-xs text-slate-400">
                                  <span className="font-semibold text-slate-300">Offre valable jusqu'au :</span>{" "}
                                  <span className="text-amber-400 font-mono font-bold">
                                    {new Date(q.validUntil).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Line Items Breakdown if available */}
                            {q.items && q.items.length > 0 && (
                              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                  Bordereau des prestations incluses
                                </span>
                                <div className="space-y-1">
                                  {q.items.map((it, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs text-slate-300">
                                      <span>• {it.description} (x{it.quantity})</span>
                                      <span className="font-mono text-emerald-400 font-bold">
                                        {formatCurrency(it.totalFCFA, currency)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Admin Notes / SLA */}
                            {q.adminNotes && (
                              <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                                <span className="font-bold text-slate-200">Conditions & Délais : </span>
                                <span className="whitespace-pre-line text-slate-300">{q.adminNotes}</span>
                              </div>
                            )}

                            {/* Action Buttons for Published Quote */}
                            <div className="pt-2 flex flex-wrap items-center gap-2.5">
                              <button
                                onClick={() => {
                                  exportQuotePDF({
                                    id: q.id,
                                    reference: q.id,
                                    pole: q.pole,
                                    serviceTitle: q.serviceTitle,
                                    description: q.description,
                                    region: q.region || "Dakar",
                                    budgetFCFA: q.proposalAmountFCFA || q.budgetFCFA || 500000,
                                    userName: q.userName || store.currentUser.fullName,
                                    userPhone: q.userPhone || store.currentUser.phone,
                                    userEmail: q.userEmail || store.currentUser.email,
                                    status: q.status,
                                    createdAt: q.publishedAt || q.createdAt,
                                    items: q.items?.map((it) => ({
                                      description: it.description,
                                      totalFCFA: it.totalFCFA,
                                    })),
                                  });
                                }}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                              >
                                <Download className="w-4 h-4 text-slate-950" />
                                <span>📄 Télécharger le Devis Officiel (PDF)</span>
                              </button>

                              {q.status !== "VALIDE" && (
                                <button
                                  onClick={() => {
                                    store.recordClientQuoteDecision(q.id, "ACCEPTE");
                                    setAdminQuotes((prev) =>
                                      prev.map((item) => (item.id === q.id ? { ...item, status: "VALIDE" } : item))
                                    );
                                    setConfirmConfig({ isAlert: true, message: `✓ Vous avez accepté la proposition commerciale pour le devis ${q.id}. Notre chef de projet va prendre contact avec vous.`, onConfirm: () => {} })
                                  }}
                                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Check className="w-4 h-4 text-slate-950" />
                                  <span>Valider & Accepter la Proposition</span>
                                </button>
                              )}

                              <a
                                href={`https://wa.me/221705334611?text=${encodeURIComponent(`Bonjour SEN AURA TECH, je vous contacte à propos de mon devis validé ${q.id} (${q.serviceTitle}).`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Contacter l'Ingénieur (WhatsApp)</span>
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Bottom Footer Info */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap justify-between items-center text-[11px] text-slate-400 gap-2">
                          <span>
                            Demande émise le :{" "}
                            {new Date(q.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="font-mono text-slate-300">
                            Budget indicatif initial : {formatCurrency(q.budgetFCFA || 0, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: ORDERS */}
          {clientTab === "orders" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Mes Commandes Boutique ({myOrders.length})</h3>
                  <p className="text-xs text-slate-400">Historique de vos achats d'équipements informatiques et solaires.</p>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate("boutique")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs"
                  >
                    Visiter la Boutique →
                  </button>
                )}
              </div>

              {myOrders.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <p className="text-xs text-slate-400">Aucune commande enregistrée pour le moment.</p>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("boutique")}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      Découvrir les matériels garantis
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((o) => (
                    <div key={o.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <div>
                          <span className="font-mono text-xs text-amber-400 font-bold">Ref: {o.id}</span>
                          <p className="text-[10px] text-slate-400">Date : {new Date(o.createdAt).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Payé via {o.paymentMethod.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-300">
                            <span>{it.quantity}x {it.product.name}</span>
                            <span className="font-mono">{formatCurrency(it.product.priceFCFA * it.quantity, currency)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                        <span className="text-slate-400">Adresse de livraison : {o.shippingAddress}</span>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <span className="font-mono font-black text-amber-400 text-sm">
                            Total : {formatCurrency(o.totalFCFA, currency)}
                          </span>
                          <button
                            onClick={() => {
                              if ((window as any).__openOfficialInvoice) {
                                (window as any).__openOfficialInvoice({
                                  invoiceNumber: `FAC-2026-${o.id.replace(/[^0-9]/g, "").slice(-6) || "881200"}`,
                                  transactionRef: o.id,
                                  issueDate: o.createdAt,
                                  clientInfo: {
                                    name: o.userName,
                                    phone: store.currentUser.phone || "+221 77 000 00 00",
                                    address: o.shippingAddress
                                  },
                                  items: o.items.map((it) => ({
                                    description: it.product.name,
                                    quantity: it.quantity,
                                    unitPriceFCFA: it.product.priceFCFA,
                                    totalFCFA: it.product.priceFCFA * it.quantity
                                  })),
                                  subtotalFCFA: Math.round(o.totalFCFA / 1.18),
                                  vatFCFA: Math.round(o.totalFCFA - (o.totalFCFA / 1.18)),
                                  totalFCFA: o.totalFCFA,
                                  paymentMethod: o.paymentMethod.toUpperCase()
                                });
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center gap-1.5 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Facture PDF</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: BOOKINGS */}
          {clientTab === "bookings" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Réservations de Techniciens ({myBookings.length})</h3>
                  <p className="text-xs text-slate-400">Demandes d'intervention à domicile ou sur site d'entreprise.</p>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate("marketplace")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs"
                  >
                    Réserver un Pro →
                  </button>
                )}
              </div>

              {myBookings.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <p className="text-xs text-slate-400">Aucune réservation de technicien enregistrée pour le moment.</p>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("marketplace")}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      Trouver un technicien agréé
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {myBookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-emerald-400 font-bold">{b.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          {b.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{b.proName} ({b.proCategory})</h4>
                      <p className="text-xs text-slate-400">
                        Date d'intervention : <strong className="text-white">{b.date} à {b.time}</strong> • Lieu : {b.address}
                      </p>
                      <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
                        <span className="text-slate-400">Paiement estimé :</span>
                        <span className="font-mono font-bold text-amber-400">
                          {formatCurrency(b.estimatedFCFA, currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: COURSES */}
          {clientTab === "courses" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Mes Cours SEN AURA ACADEMY ({store.enrolledCourseIds.length})</h3>
                  <p className="text-xs text-slate-400">Formations certifiantes en développement, IA et réseaux.</p>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate("academy")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs"
                  >
                    Explorer les cours →
                  </button>
                )}
              </div>

              {store.enrolledCourseIds.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <p className="text-xs text-slate-400">Vous n'êtes inscrit à aucun cours pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {store.courses
                    .filter((c) => store.enrolledCourseIds.includes(c.id))
                    .map((course) => (
                    <div key={course.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex gap-3 items-center">
                        <img src={course.thumbnail || course.mainMediaUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        <div>
                          <span className="text-[10px] text-indigo-400 font-bold uppercase">{course.category}</span>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{course.title}</h4>
                          <p className="text-[10px] text-slate-400">Formateur: {course.instructorName}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Progression du cours</span>
                          <span className="text-amber-400 font-bold">{course.progress ?? 0}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${course.progress ?? 0}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: INVOICES */}
          {clientTab === "invoices" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Mes Factures & Règlements ({myInvoices.length})</h3>
                  <p className="text-xs text-slate-400">Consultez et téléchargez vos pièces justificatives de paiement officielles.</p>
                </div>
              </div>

              {myInvoices.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <p className="text-xs text-slate-400">Aucune facture enregistrée pour le moment.</p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    Vos factures officielles et justificatifs de règlement apparaîtront automatiquement dès la validation de vos achats sur la boutique ou le règlement d'acomptes de devis.
                  </p>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("boutique")}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      Parcourir les équipements de la boutique
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {myInvoices.map((inv) => (
                    <div key={inv.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-amber-400 font-bold">{inv.id}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {inv.status} ({inv.paymentMethod})
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1">{inv.title}</h4>
                        <p className="text-[10px] text-slate-400">
                          Émise le {new Date(inv.date).toLocaleDateString("fr-FR")} • Client : {store.currentUser.fullName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {formatCurrency(inv.amountFCFA, currency)}
                        </span>
                        <button
                          onClick={() => {
                            if ((window as any).__openOfficialInvoice && inv.order) {
                              const o = inv.order;
                              (window as any).__openOfficialInvoice({
                                invoiceNumber: inv.id,
                                transactionRef: o.id,
                                issueDate: o.createdAt,
                                clientInfo: {
                                  name: o.userName,
                                  phone: store.currentUser.phone || "+221 77 000 00 00",
                                  address: o.shippingAddress
                                },
                                items: o.items.map((it: any) => ({
                                  description: it.product.name,
                                  quantity: it.quantity,
                                  unitPriceFCFA: it.product.priceFCFA,
                                  totalFCFA: it.product.priceFCFA * it.quantity
                                })),
                                subtotalFCFA: Math.round(o.totalFCFA / 1.18),
                                vatFCFA: Math.round(o.totalFCFA - (o.totalFCFA / 1.18)),
                                totalFCFA: o.totalFCFA,
                                paymentMethod: o.paymentMethod ? o.paymentMethod.toUpperCase() : "WAVE"
                              });
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 font-bold"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" /> PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: MESSAGES */}
          {clientTab === "messages" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Messages & Hotline Support SEN AURA</h3>
                  <p className="text-xs text-slate-400">Échangez directement avec notre équipe technique et vos prestataires.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                    SA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Support Technique SEN AURA</h4>
                    <p className="text-[10px] text-emerald-400 font-mono">● En ligne sur WhatsApp & Chat (+221 70 533 46 11)</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-900/50 rounded-xl border border-slate-800/50 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800 max-w-sm space-y-1">
                    <p className="text-[10px] font-bold text-amber-400">Support SEN AURA</p>
                    <p className="text-slate-200 text-[11px]">Bonjour {store.currentUser.fullName}, votre demande d'intervention sur Dakar a été prise en compte. Un technicien vous contactera sous peu.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Écrivez votre message ici..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" /> Envoyer
                  </button>
                </div>
              </div>
            </div>
          )}

          </div> {/* Closing CLIENT main content flex-1 */}
        </div> /* Closing CLIENT flex layout */
      )}

      {/* ========================================================================= */}
      {/* ROLE 2: PRESTATAIRE PRO DASHBOARD                                         */}
      {/* ========================================================================= */}
      {role === "PROFESSIONAL" && isRoleActive("PROFESSIONAL") && (
        <div className="flex flex-col md:flex-row gap-3.5 lg:gap-4 items-start">
          
          {/* PRESTATAIRE SIDEBAR */}
          <div className="hidden md:block shrink-0 sticky top-20 self-start">
            <ProSidebar proTab={proTab} setProTab={setProTab} acceptedMissionsCount={acceptedMissions.length} onNavigate={onNavigate} />
          </div>

          {/* MAIN PRESTATAIRE CONTENT AREA */}
          <div className="flex-1 min-w-0 w-full space-y-4">

          {/* FREE TRIAL LAUNCH OFFER ACTIVE BANNER */}
          {(store.currentUser.proStatus === "ESSAI_GRATUIT" || store.currentUser.proFreeTrialActive) && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-emerald-500/20 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center text-amber-300 font-bold shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white">🎁 Offre de Gratuité de Lancement Active (Essai 30 Jours Sans Frais)</h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                      Actif
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Votre compte pro est débloqué sans frais pour publier vos compétences, être visible des visiteurs en temps réel et recevoir vos premières interventions. Vous pourrez vous abonner pour pérenniser vos services.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setConfirmConfig({ isAlert: true, message: "Pour pérenniser vos services après l'essai gratuit, vous pouvez régler votre abonnement mensuel (25,000 FCFA) par Wave ou Orange Money au +221 70 533 46 11.", onConfirm: () => {} })
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap shrink-0 shadow-md cursor-pointer"
              >
                S'abonner (25,000 FCFA/mois)
              </button>
            </div>
          )}

          {/* Header Banner & Stats (ONLY ON FIRST TAB 'missions') */}
          {proTab === "missions" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Espace Prestataire / Technicien Pro</span>
                  <h2 className="text-2xl font-black text-white">Missions & Interventions Terrain</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Statut Disponibilité :</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>En Ligne / Disponible au Sénégal</span>
                  </span>
                </div>
              </div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                  },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2"
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800"
                >
                  <span className="text-xs text-slate-400 font-bold">Chiffre d'Affaires Ce Mois</span>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {formatCurrency(acceptedMissions.length > 0 ? acceptedMissions.length * 50000 : 0, currency)}
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">Calculé sur missions validées</p>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800"
                >
                  <span className="text-xs text-slate-400 font-bold">Missions Acceptées</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{acceptedMissions.length} Interventions</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Planning actif</p>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800"
                >
                  <span className="text-xs text-slate-400 font-bold">Satisfaction Client</span>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {acceptedMissions.length > 0 ? "5.0 / 5.0 ★" : "— / 5.0 ★"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {acceptedMissions.length > 0 ? "Évaluations clients vérifiées" : "En attente d'évaluations"}
                  </p>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800"
                >
                  <span className="text-xs text-slate-400 font-bold">Badge Certification</span>
                  {store.currentUser.proApproved ? (
                    <div className="flex items-center gap-1.5 mt-1 text-sky-400 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5 text-sky-400" />
                      <span>Technicien Agréé</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-1 text-slate-500 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5 text-slate-500" />
                      <span>En attente d'agrément</span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {store.currentUser.proApproved ? "Solaire, Fibre & Sécurité" : "Validation SuperAdmin requise"}
                  </p>
                </motion.div>
              </motion.div>
            </div>
          )}

          {/* TAB 1: MISSIONS DISPONIBLES */}
          {proTab === "missions" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Offres d'Intervention à Proximité (Sénégal)</h3>
              {proBookings.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <Wrench className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">Aucune demande d'intervention pour le moment</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Dès qu'un client réserve un technicien ou valide un devis d'installation, l'ordre d'intervention apparaîtra ici.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {proBookings.map((m) => {
                    const isAccepted = acceptedMissions.includes(m.id);
                    return (
                      <div key={m.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              {m.proCategory || "Intervention Technique"}
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {formatCurrency(m.estimatedFCFA || 50000, currency)}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{m.description || "Installation Technique"}</h4>
                          <p className="text-xs text-slate-400">📍 {m.address || m.region || "Dakar"} • Client : {m.clientName}</p>
                          <p className="text-xs text-slate-300 font-semibold">🕒 {m.date} à {m.time || "10:00"}</p>
                        </div>

                        <button
                          onClick={() => {
                            if (!isAccepted) {
                              setAcceptedMissions([...acceptedMissions, m.id]);
                            }
                          }}
                          disabled={isAccepted}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            isAccepted
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                              : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                          }`}
                        >
                          {isAccepted ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Mission Acceptée (Dans votre planning)</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>Accepter cette Mission</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERVENTIONS EN COURS */}
          {proTab === "active" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Vos Interventions Validées ({acceptedMissions.length})</h3>
              <p className="text-xs text-slate-400">Rendez-vous programmés avec les clients.</p>
              {acceptedMissions.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                  Aucune intervention acceptée pour l'instant. Rendez-vous dans l'onglet "Missions Disponibles" pour accepter un ordre de mission.
                </div>
              ) : (
                <div className="space-y-3">
                  {acceptedMissions.map((id) => {
                    const booking = store.bookings.find(b => b.id === id);
                    return (
                      <div key={id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-amber-400 font-bold">Réf: {id}</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                              Intervention Programmée
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1">{booking?.description || booking?.proCategory || "Pose & Installation Technique sur Site"}</h4>
                          <p className="text-xs text-slate-400">
                            Client : <strong>{booking?.clientName || "Client"}</strong> {booking?.clientPhone ? `(${booking.clientPhone})` : ""} • Lieu : {booking?.address || booking?.region || "Sénégal"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {booking?.clientPhone && (
                            <a
                              href={`tel:${booking.clientPhone}`}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 text-amber-300 hover:bg-slate-700 text-xs font-bold flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5" /> Appeler
                            </a>
                          )}
                          <button
                            onClick={() => setAcceptedMissions(acceptedMissions.filter((m) => m !== id))}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Marquer Terminée
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAYOUTS */}
          {proTab === "payouts" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Retrait Direct de vos Gain (Sénégal)</h3>
                <p className="text-xs text-slate-400">Encaissez immédiatement vos prestations sur Wave, Orange Money ou Free Money.</p>
              </div>

              {withdrawSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Virement de {formatCurrency(Number(withdrawAmount), currency)} envoyé avec succès sur le numéro {withdrawPhone} !</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase">Demande de Virement</h4>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Montant à retirer (FCFA)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Numéro Mobile (Wave / Orange Money)</label>
                    <input
                      type="text"
                      value={withdrawPhone}
                      onChange={(e) => setWithdrawPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setWithdrawSuccess(true);
                      setTimeout(() => setWithdrawSuccess(false), 5000);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/20"
                  >
                    Valider le Retrait Immédiat
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase">Historique des Derniers Encaissements</h4>
                  <div className="space-y-2 text-xs">
                    {payoutsList.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800/50">
                        Aucun encaissement récent.
                      </div>
                    ) : (
                      payoutsList.map((p) => (
                        <div key={p.id} className="p-3 rounded-xl bg-slate-900 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-white">{p.provider}</p>
                            <p className="text-[10px] text-slate-400">{p.date}</p>
                          </div>
                          <span className="font-mono font-bold text-emerald-400">+{formatCurrency(p.amount, currency)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE & REAL-TIME VISITOR VISIBILITY */}
          {proTab === "profile" && (
            <ProProfileEditor currency={currency} />
          )}

          {/* TAB 5: PUBLIER RÉALISATION / CHANTIER HD (CLOUDINARY DRAG & DROP) */}
          {proTab === "portfolio" && (
            <ProPortfolioUploadForm
              currency={currency}
              onCancel={() => setProTab("missions")}
              onServiceCreated={(newService) => {
                setProTab("missions");
              }}
            />
          )}

          </div> {/* Closing PROFESSIONAL main content flex-1 */}
        </div> /* Closing PROFESSIONAL flex layout */
      )}

      {/* ========================================================================= */}
      {/* ROLE 3: FORMATEUR DASHBOARD                                               */}
      {/* ========================================================================= */}
      {role === "FORMATEUR" && isRoleActive("FORMATEUR") && (
        <div className="flex flex-col md:flex-row gap-3.5 lg:gap-4 items-start">
          
          {/* FORMATEUR SIDEBAR */}
          <div className="hidden md:block shrink-0 sticky top-20 self-start">
            <FormateurSidebar formateurTab={formateurTab} setFormateurTab={setFormateurTab} issuedCertificatesCount={issuedCertificates.length} onNavigate={onNavigate} />
          </div>

          {/* MAIN FORMATEUR CONTENT AREA */}
          <div className="flex-1 min-w-0 w-full space-y-4">
          
          {/* Bannière Offre de Gratuité de Lancement (Essai 30 Jours) pour Formateur */}
          {store.isProFreeTrialActive() && !store.currentUser.proApproved && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-indigo-500/15 border border-indigo-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Offre de Gratuité de Lancement • Formateur Academy (30 Jours Sans Frais)
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      Actif jusqu'au {new Date(store.currentUser.trialExpiresAt || Date.now() + 30 * 86400000).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Votre compte formateur est débloqué pour publier vos cours, gérer vos apprenants et être référencé sur l'Academy en direct.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setConfirmConfig({ isAlert: true, message: "Pour pérenniser vos modules après l'essai gratuit, vous pouvez régler votre abonnement formateur (25,000 FCFA/mois) par Wave ou Orange Money au +221 70 533 46 11.", onConfirm: () => {} })
                }}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs whitespace-nowrap shrink-0 shadow-md cursor-pointer"
              >
                S'abonner (25,000 FCFA/mois)
              </button>
            </div>
          )}

          {/* Formateur Header KPI Stats (ONLY ON FIRST TAB 'courses') */}
          {formateurTab === "courses" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider font-mono">Espace Formateur • SEN AURA ACADEMY</span>
                  <h2 className="text-2xl font-black text-white">Gestion des Formations & Apprenants</h2>
                </div>
                <button
                  onClick={() => setFormateurTab("assignments")}
                  className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Module</span>
                </button>
              </div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                  },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2"
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800"
                >
                  <span className="text-xs text-slate-400 font-bold">Apprenants Inscrits</span>
                  <p className="text-2xl font-black text-indigo-400 font-mono mt-1">{formateurStudents.length}</p>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800"
                >
                  <span className="text-xs text-slate-400 font-bold">Certificats Délivrés</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{issuedCertificates.length}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Certifications Valides</p>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800"
                >
                  <span className="text-xs text-slate-400 font-bold">Cours Enseignés</span>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">{formateurCourses.length} Modules</p>
                  <p className="text-[10px] text-amber-300 mt-0.5">{formateurCourses.filter(c => c.status === "Publié").length} Actifs en ligne</p>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800"
                >
                  <span className="text-xs text-slate-400 font-bold">Note Formateur</span>
                  <p className="text-2xl font-black text-yellow-400 font-mono mt-1">
                    {formateurCourses.length > 0
                      ? (formateurCourses.reduce((acc, c) => acc + (c.rating || 5), 0) / formateurCourses.length).toFixed(2)
                      : "5.0"} / 5 ★
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Basé sur {formateurCourses.length > 0 ? formateurCourses.reduce((acc, c) => acc + (c.enrolled || 0), 0) : 0} avis</p>
                </motion.div>
              </motion.div>
            </div>
          )}

          {/* TAB 1: MES COURS & STATS (FULL CRUD & RESOURCE PREVIEWS) */}
          {formateurTab === "courses" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                    <span>Catalogue de vos Modules de Formation</span>
                  </h3>
                  <p className="text-xs text-slate-400">Gérez les cours, leurs vidéos YouTube, documents PDF et liens d'applications.</p>
                </div>
                <button
                  onClick={() => setFormateurTab("assignments")}
                  className="px-3.5 py-2 rounded-xl bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-400 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Créer un Module
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {formateurCourses.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-indigo-500/40 transition-all">
                    
                    {/* Course Cover Image Banner */}
                    {c.coverImage && (
                      <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                        <img src={c.coverImage} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                          {c.category}
                        </span>
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono ${
                          c.status === "Publié" ? "bg-emerald-500/80 text-white" : "bg-slate-800/80 text-slate-300"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-2">
                      <div>
                        {!c.coverImage && (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                            {c.category}
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-white mt-1">{c.title}</h4>
                      </div>
                      <p className="text-sm font-black text-amber-400 font-mono shrink-0">
                        {formatCurrency(c.price, currency)}
                      </p>
                    </div>

                    {/* Attached Resources Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {c.pdfDoc && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono font-medium flex items-center gap-1">
                          <FileText className="w-3 h-3 text-rose-400" /> PDF : {c.pdfDoc.name}
                        </span>
                      )}
                      {c.youtubeUrl && (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] font-mono font-medium flex items-center gap-1">
                          <Video className="w-3 h-3 text-red-400" /> Vidéo YouTube
                        </span>
                      )}
                      {c.appUrl && (
                        <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[10px] font-mono font-medium flex items-center gap-1">
                          <Globe className="w-3 h-3 text-sky-400" /> App / Site Démo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                      <div>
                        <p className="text-slate-400 text-[11px]">Inscrits : <strong className="text-white font-mono">{c.enrolled}</strong></p>
                        <p className="text-slate-400 text-[11px]">Note : <strong className="text-yellow-400">{c.rating} ★</strong></p>
                      </div>

                      <button
                        onClick={() => setSelectedCoursePreview(c)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Voir Ressources & Démo</span>
                      </button>
                    </div>

                    {/* CRUD Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 gap-2">
                      <button
                        onClick={() => {
                          setEditingCourseId(c.id);
                          setEditPriceVal(String(c.price));
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5 text-sky-400" />
                        <span>Prix</span>
                      </button>

                       <button
                         onClick={() => {
                           authFetch(`/api/db/courses/${c.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status: c.status === "Publié" ? "Brouillon" : "Publié" }) }).catch(()=>{});
                           setFormateurCourses(formateurCourses.map(item => item.id === c.id ? { ...item, status: item.status === "Publié" ? "Brouillon" : "Publié" } : item));
                         }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium flex items-center gap-1"
                      >
                        {c.status === "Publié" ? <XCircle className="w-3.5 h-3.5 text-amber-400" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{c.status === "Publié" ? "Masquer" : "Publier"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setConfirmConfig({
                                 message: `Supprimer la formation "${c.title}" ?`,
                                 onConfirm: () => {
                                   authFetch(`/api/db/courses/${c.id}`, { method: "DELETE" }).catch(()=>{});
                                   setFormateurCourses(formateurCourses.filter(item => item.id !== c.id));
                                 }
                              })
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: APPRENANTS & CERTIFICATIONS */}
          {formateurTab === "students" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    <span>Gestion des Apprenants & Attestations de Réussite</span>
                  </h3>
                  <p className="text-xs text-slate-400">Validez les parcours de formation et délivrez les certificats SEN AURA ACADEMY.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Rechercher un apprenant..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {formateurStudents
                  .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.course.toLowerCase().includes(studentSearch.toLowerCase()))
                  .map((s) => {
                    const hasCert = issuedCertificates.includes(s.id);
                    return (
                      <div key={s.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-700 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{s.name}</h4>
                            <span className="text-xs text-slate-400 font-mono">({s.phone})</span>
                          </div>
                          <p className="text-xs text-indigo-300 font-medium">{s.course}</p>
                          
                          <div className="flex items-center gap-3 text-[11px] pt-1">
                            <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${s.progress === 100 ? "bg-emerald-400" : "bg-amber-400"}`}
                                style={{ width: `${s.progress}%` }}
                              />
                            </div>
                            <span className="text-slate-300 font-bold font-mono">{s.progress}% accompli</span>
                            <span className="text-slate-500">• Inscription: {s.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {hasCert && (
                            <button
                              onClick={() => setSelectedCertStudent(s)}
                              className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <Award className="w-4 h-4 text-indigo-400" />
                              <span>Voir le Certificat 🎓</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (hasCert) {
                                setIssuedCertificates(issuedCertificates.filter(id => id !== s.id));
                              } else {
                                setIssuedCertificates([...issuedCertificates, s.id]);
                              }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              hasCert
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
                                : "bg-indigo-500 hover:bg-indigo-400 text-white"
                            }`}
                          >
                            <GraduationCap className="w-4 h-4" />
                            <span>{hasCert ? "Certificat Délivré ✓" : "Délivrer le Certificat"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: CRÉER UN MODULE DE FORMATION (DRAG & DROP VIDÉO/PHOTOS HD) */}
          {formateurTab === "assignments" && (
            <FormateurCourseUploadForm
              currency={currency}
              onCancel={() => setFormateurTab("courses")}
              onCourseCreated={async (newCourse) => {
                const createdCourse = {
                  id: newCourse.id || `fc-${Date.now()}`,
                  title: newCourse.title,
                  category: newCourse.category,
                  enrolled: 0,
                  price: newCourse.priceFCFA || 75000,
                  status: "Publié",
                  rating: 5.0,
                  coverImage: newCourse.mainMediaUrl || "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1000&auto=format&fit=crop&q=80",
                  description: newCourse.description || "Aucune description fournie.",
                  duration: newCourse.duration || "25 Heures",
                };
                try {
                  await authFetch("/api/db/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createdCourse) });
                } catch (e) {}
                setFormateurCourses([createdCourse, ...formateurCourses]);
                setFormateurTab("courses");
              }}
            />
          )}

          {/* TAB 4: HONORAIRES & BOURSES (WITHDRAWALS) */}
          {formateurTab === "earnings" && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-sky-400" />
                      <span>Portefeuille Formateur & Virement Honoraires</span>
                    </h3>
                    <p className="text-xs text-slate-400">Encaissez directement vos gains sur Wave, Orange Money ou Free Money.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Solde Disponible :</span>
                    <p className="text-2xl font-black text-amber-400 font-mono">
                      {formatCurrency(formateurBalance, currency)}
                    </p>
                  </div>
                </div>

                {/* Withdrawal Form */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 pt-4">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Demande de Retrait Direct (Sénégal)</h4>
                  
                  {withdrawSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>Retrait de {withdrawAmount} FCFA effectué avec succès vers {withdrawPhone} !</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Montant à retirer (FCFA)</label>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-mono text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Numéro Mobile (Wave / OM)</label>
                      <input
                        type="text"
                        value={withdrawPhone}
                        onChange={(e) => setWithdrawPhone(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          const amt = Number(withdrawAmount);
                          if (amt > 0 && amt <= formateurBalance) {
                            setFormateurBalance(formateurBalance - amt);
                            setPayoutsList([
                              {
                                id: `pay-${Date.now()}`,
                                date: "Aujourd'hui",
                                amount: amt,
                                provider: "Wave Senegal",
                                phone: withdrawPhone,
                                status: "Payé ⚡",
                              },
                              ...payoutsList,
                            ]);
                            setWithdrawSuccess(true);
                            setTimeout(() => setWithdrawSuccess(false), 4000);
                          }
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
                      >
                        Valider le Retrait Immédiat
                      </button>
                    </div>
                  </div>
                </div>

                {/* History Table */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-300 mb-3">Historique des Derniers Retraits</h4>
                  <div className="space-y-2">
                    {payoutsList.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800/50 text-xs">
                        Aucun retrait effectué pour le moment.
                      </div>
                    ) : (
                      payoutsList.map((p) => (
                        <div key={p.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-white">{p.provider} • {p.phone}</p>
                            <span className="text-[10px] text-slate-500">{p.date}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold font-mono text-emerald-400">+{formatCurrency(p.amount, currency)}</p>
                            <span className="text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">{p.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROFIL & FICHE FORMATEUR VISIBLE ACADEMY */}
          {formateurTab === "profile" && (
            <FormateurProfileEditor currency={currency} />
          )}

          </div> {/* Closing FORMATEUR main content flex-1 */}
        </div> /* Closing FORMATEUR flex layout */
      )}

      {/* ========================================================================= */}
      {/* ROLE 4: VENDEUR DASHBOARD                                                  */}
      {/* ========================================================================= */}
      {role === "VENDEUR" && isRoleActive("VENDEUR") && (
        <div className="flex flex-col md:flex-row gap-3.5 lg:gap-4 items-start">
          
          {/* VENDEUR SIDEBAR */}
          <div className="hidden md:block shrink-0 sticky top-20 self-start">
            <VendeurSidebar vendeurTab={vendeurTab} setVendeurTab={setVendeurTab} vendeurProductsCount={vendeurProducts.length} vendeurOrdersCount={vendeurOrders.length} onNavigate={onNavigate} />
          </div>

          {/* MAIN VENDEUR CONTENT AREA */}
          <div className="flex-1 min-w-0 w-full space-y-4">

          {/* Bannière Offre de Gratuité de Lancement (Essai 30 Jours) pour Vendeur */}
          {store.isProFreeTrialActive() && !store.currentUser.proApproved && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/15 via-emerald-500/15 to-sky-500/15 border border-sky-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Offre de Gratuité de Lancement • Boutique Marketplace (30 Jours Sans Frais)
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      Actif jusqu'au {new Date(store.currentUser.trialExpiresAt || Date.now() + 30 * 86400000).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Votre boutique est débloquée sans frais pour publier vos produits, gérer vos stocks et recevoir des commandes en direct sur SEN AURA SHOP.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setConfirmConfig({ isAlert: true, message: "Pour pérenniser votre boutique après l'essai gratuit, vous pouvez régler votre abonnement vendeur (25,000 FCFA/mois) par Wave ou Orange Money au +221 70 533 46 11.", onConfirm: () => {} })
                }}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs whitespace-nowrap shrink-0 shadow-md cursor-pointer"
              >
                S'abonner (25,000 FCFA/mois)
              </button>
            </div>
          )}

            {/* TOP MOBILE & DESKTOP NAVIGATION TABS BAR FOR VENDEUR */}
            <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 overflow-x-auto shadow-md">
              <button
                onClick={() => setVendeurTab("stock")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  vendeurTab === "stock"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <PackageCheck className="w-4 h-4" />
                <span>Mes Produits & Stocks</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  vendeurTab === "stock" ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-400"
                }`}>
                  {vendeurProducts.length}
                </span>
              </button>

              <button
                onClick={() => setVendeurTab("add_product")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  vendeurTab === "add_product"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black ring-2 ring-amber-400/50"
                    : "bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>✨ Publier un Produit (Photo / Vidéo HD)</span>
              </button>

              <button
                onClick={() => setVendeurTab("orders")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  vendeurTab === "orders"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Commandes Reçues</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  vendeurTab === "orders" ? "bg-slate-950 text-sky-400" : "bg-slate-800 text-slate-400"
                }`}>
                  {vendeurOrders.length}
                </span>
              </button>

              <button
                onClick={() => setVendeurTab("analytics")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  vendeurTab === "analytics"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Ventes & Analytics</span>
              </button>

              <button
                onClick={() => setVendeurTab("profile")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  vendeurTab === "profile"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Fiche Boutique & Infos</span>
              </button>
            </div>
          
          {/* Vendeur Header KPI Stats (ONLY ON FIRST TAB 'stock') */}
          {vendeurTab === "stock" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-xs text-sky-400 font-bold uppercase tracking-wider font-mono">Espace Vendeur Équipements</span>
                  <h2 className="text-2xl font-black text-white">Gestion du Catalogue & Commandes</h2>
                </div>
                <button
                  onClick={() => setVendeurTab("add_product")}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un Article (Photo / Vidéo)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Chiffre d'Affaires Ventes</span>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {formatCurrency(vendeurOrders.reduce((acc, o) => acc + (o.totalFCFA || 0), 0), currency)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Articles en Stock</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{vendeurProducts.reduce((acc, p) => acc + p.stock, 0)} Unités</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Commandes à Expédier</span>
                  <p className="text-2xl font-black text-rose-400 font-mono mt-1">{vendeurOrders.filter(o => o.status === "En attente").length} Colis</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STOCK & VENTES (FULL CRUD AVEC PHOTOS & VIDÉO CLOUDINARY) */}
          {vendeurTab === "stock" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-amber-400" />
                    <span>Catalogue Produits & Médias Cloudinary</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gérez vos stocks, visualisez les photos principales, vidéos HD et galeries complémentaires.
                  </p>
                </div>
                <button
                  onClick={() => setVendeurTab("add_product")}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Publier un Article (Photo/Vidéo)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {vendeurProducts.map((p) => {
                  const mainMed = p.mainMediaUrl || p.imageUrl || p.image;
                  const isVideo = p.mediaType === "video" || (mainMed && (mainMed.includes(".mp4") || mainMed.includes("video/")));
                  const galleryCount = p.galleryImages?.length || 0;

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="flex gap-3.5 items-start">
                        {/* Media Thumbnail with Video / Photo badge */}
                        <div
                          onClick={() => setSelectedVendorProductForMedia(p)}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative group cursor-pointer shrink-0 flex items-center justify-center"
                          title="Cliquer pour afficher la galerie photo et vidéo"
                        >
                          {isVideo ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-amber-400">
                              <Play className="w-6 h-6 fill-amber-400/20" />
                              <span className="text-[8px] font-mono font-bold mt-1">VIDÉO</span>
                            </div>
                          ) : (
                            <img
                              src={mainMed}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-5 h-5 text-amber-400" />
                          </div>
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[8px] font-mono font-bold text-amber-400 border border-amber-500/30">
                            {isVideo ? "🎥 VIDÉO" : "📸 PHOTO"}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                              {p.category}
                            </span>
                            {galleryCount > 0 && (
                              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                +{galleryCount} Photo{galleryCount > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>

                          <h4
                            onClick={() => setSelectedVendorProductForMedia(p)}
                            className="text-xs sm:text-sm font-bold text-white mt-1 hover:text-amber-400 cursor-pointer transition-colors line-clamp-2"
                          >
                            {p.name}
                          </h4>

                          <p className="text-sm font-black text-amber-400 font-mono mt-1">
                            {formatCurrency(p.priceFCFA || p.price, currency)}
                          </p>

                          <button
                            type="button"
                            onClick={() => setSelectedVendorProductForMedia(p)}
                            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 mt-1 inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Voir Photos / Vidéo</span>
                          </button>
                        </div>
                      </div>

                      {/* Bottom Controls */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-900 gap-2">
                        {/* Stock Counter */}
                        <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
                          <span className="text-slate-400 text-[10px]">Stock:</span>
                          <button
                            onClick={() => {
                              authFetch(`/api/vendor/products/${p.id}`, { method: "PUT", headers: {"Content-Type":"application/json","Authorization":`Bearer ${localStorage.getItem("senaura_auth_token")||""}`}, body: JSON.stringify({ stock: Math.max(0, p.stock - 1) }) }).catch(()=>{});
                              setVendeurProducts(vendeurProducts.map(item => item.id === p.id ? { ...item, stock: Math.max(0, item.stock - 1) } : item));
                            }}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-white px-1.5">{p.stock}</span>
                          <button
                            onClick={() => {
                              authFetch(`/api/vendor/products/${p.id}`, { method: "PUT", headers: {"Content-Type":"application/json","Authorization":`Bearer ${localStorage.getItem("senaura_auth_token")||""}`}, body: JSON.stringify({ stock: p.stock + 1 }) }).catch(()=>{});
                              setVendeurProducts(vendeurProducts.map(item => item.id === p.id ? { ...item, stock: item.stock + 1 } : item));
                            }}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedVendorProductForMedia(p)}
                            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-bold flex items-center gap-1"
                          >
                            <ImageIcon className="w-3 h-3 text-amber-400" />
                            <span>Galerie</span>
                          </button>

                          <button
                            onClick={() => {
                              setConfirmConfig({
                                message: `Supprimer définitivement "${p.name}" du catalogue ?`,
                                onConfirm: () => {
                                   authFetch(`/api/vendor/products/${p.id}`, { method: "DELETE", headers: {"Authorization":`Bearer ${localStorage.getItem("senaura_auth_token")||""}`} }).catch(()=>{});
                                  setVendeurProducts(vendeurProducts.filter(item => item.id !== p.id));
                                }
                              })
                            }}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: PUBLIER UN PRODUIT (AVEC PHOTO PRINCIPALE / VIDÉO + 3 PHOTOS OPTIONNELLES CLOUDINARY) */}
          {vendeurTab === "add_product" && (
            <VendorProductUploadForm
              currency={currency}
              onProductCreated={async (newProduct) => {
                try {
                  await authFetch("/api/db/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newProduct) });
                } catch (e) {}
                setVendeurProducts([newProduct, ...vendeurProducts]);
                setVendeurTab("stock");
              }}
              onCancel={() => setVendeurTab("stock")}
            />
          )}

          {/* TAB: COMMANDES CLIENTS */}
          {vendeurTab === "orders" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-400" />
                <span>Commandes Clients reçues</span>
              </h3>

              <div className="space-y-3">
                {vendeurOrders.map((o) => (
                  <div key={o.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-400 font-bold">{o.id}</span>
                        <span className="text-xs font-bold text-white">{o.client}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{o.item}</p>
                      <p className="text-xs font-mono text-emerald-400 font-bold mt-0.5">{formatCurrency(o.totalFCFA || o.total, currency)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={o.status}
                        onChange={(e) => {
                          setVendeurOrders(vendeurOrders.map(item => item.id === o.id ? { ...item, status: e.target.value } : item));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-amber-300 focus:outline-none"
                      >
                        <option value="En attente">En attente ⏳</option>
                        <option value="Expédiée">Expédiée 🚚</option>
                        <option value="Livrée">Livrée ✓</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {vendeurTab === "analytics" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Performances des Ventes & Chiffre d'Affaires</span>
              </h3>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                {vendeurOrders.length === 0 ? (
                  <p className="text-center text-slate-500 py-2">Aucune vente enregistrée pour le moment.</p>
                ) : (
                  <>
                    <p>Volume de ventes réalisées : <strong className="text-amber-400 font-mono">{formatCurrency(vendeurOrders.reduce((sum, o) => sum + (o.totalFCFA || 0), 0), currency)}</strong></p>
                    <p>Commission plateforme SEN AURA : <strong className="text-slate-400 font-mono">3.5%</strong></p>
                    <p>Gains nets versables : <strong className="text-emerald-400 font-mono">{formatCurrency(vendeurOrders.reduce((sum, o) => sum + (o.totalFCFA || 0), 0) * 0.965, currency)}</strong></p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB: FICHE BOUTIQUE & PROFIL VENDEUR */}
          {vendeurTab === "profile" && (
            <VendeurProfileEditor currency={currency} />
          )}

          </div> {/* Closing VENDEUR main content flex-1 */}
        </div> /* Closing VENDEUR flex layout */
      )}

      {/* ========================================================================= */}
      {/* ROLE 5: SUPER BACKOFFICE ADMIN DASHBOARD                                  */}
      {/* ========================================================================= */}
      {role === "ADMIN" && (
        <div className="flex flex-col md:flex-row gap-3.5 lg:gap-4 items-start">
          
          {/* ADMIN SIDEBAR */}
          <div className="hidden md:block shrink-0 sticky top-20 self-start">
            <AdminSidebar adminTab={adminTab} setAdminTab={setAdminTab} onNavigate={onNavigate} />
          </div>

          {/* MAIN ADMIN CONTENT AREA */}
          <div className="flex-1 min-w-0 w-full space-y-4">
          
          {/* TAB 0: OVERVIEW / VUE D'ENSEMBLE SI */}
          {adminTab === "overview" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/40 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">BackOffice Administrateur</span>
                  <h2 className="text-2xl font-black text-white">Supervision Globale SEN AURA TECH</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 w-fit">
                  Mode SuperAdmin ⚡
                </span>
              </div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                  },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1"
                >
                  <span className="text-xs text-slate-400 font-bold">Total Utilisateurs</span>
                  <p className="text-2xl font-black text-white font-mono">{adminUsers.length}</p>
                  <p className="text-[10px] text-emerald-400">Comptes enregistrés</p>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1"
                >
                  <span className="text-xs text-slate-400 font-bold">Techniciens Agréés</span>
                  <p className="text-2xl font-black text-amber-400 font-mono">{adminPros.length} Pros</p>
                  <p className="text-[10px] text-slate-400">Réseau sénégalais</p>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1"
                >
                  <span className="text-xs text-slate-400 font-bold">Volume Devis Validés</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono">
                    {formatCurrency(
                      adminQuotes.filter(q => q.status === "VALIDE").reduce((sum, q) => sum + (parseInt(String(q.budgetFCFA || "").replace(/\D/g, "")) || 0), 0),
                      currency
                    )}
                  </p>
                  <p className="text-[10px] text-emerald-400">Projets clients validés</p>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1"
                >
                  <span className="text-xs text-slate-400 font-bold">Taux de Traitement</span>
                  <p className="text-2xl font-black text-indigo-400 font-mono">
                    {adminQuotes.length > 0 ? `${Math.round((adminQuotes.filter(q => q.status !== "EN_ATTENTE").length / adminQuotes.length) * 100)}%` : "100%"}
                  </p>
                  <p className="text-[10px] text-slate-400">Devis & commandes</p>
                </motion.div>
              </motion.div>

              {/* Quick Validation Alert for Formateurs & Pro Accounts */}
              {adminUsers.some(u => u.status !== "Actif") && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">
                        Demandes de Validation d'Abonnement Formateurs & Comptes Pro ({adminUsers.filter(u => u.status !== "Actif").length})
                      </h3>
                    </div>
                    <button
                      onClick={() => setAdminTab("users")}
                      className="text-xs font-bold text-amber-400 hover:underline"
                    >
                      Gérer Tous les Utilisateurs →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {adminUsers.filter(u => u.status !== "Actif").map(pendingUser => (
                      <div key={pendingUser.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{pendingUser.name}</span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                              {pendingUser.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{pendingUser.email} • {pendingUser.paymentStatus}</p>
                        </div>

                        <button
                          onClick={async () => {
                            await SecurityPinService.validateProAccount({
                              phone: pendingUser.phone || pendingUser.email || "",
                              fullName: pendingUser.name,
                              email: pendingUser.email,
                              role: pendingUser.role,
                            });

                            setAdminUsers(adminUsers.map(item => item.id === pendingUser.id ? {
                              ...item,
                              status: "Actif",
                              paymentStatus: "Abonnement Validé ✓ (Notification WhatsApp/Email envoyée)"
                            } : item));

                            setProRoleActivations(prev => ({
                              ...prev,
                              [pendingUser.role]: {
                                active: true,
                                paymentInfo: "Abonnement Validé par SuperAdmin ✓"
                              }
                            }));

                            if (store.currentUser.id === pendingUser.id || store.currentUser.role === pendingUser.role) {
                              store.validateProAccount();
                            }

                            setConfirmConfig({ isAlert: true, message: `✓ Compte Pro de ${pendingUser.name} validé et activé ! Un message de confirmation officiel a été expédié par WhatsApp & Email.`, onConfirm: () => {} })
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 shadow-md cursor-pointer"
                        >
                          Valider & Notifier (WhatsApp/Email)
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: DEVIS & PROJETS SI (FULL CRUD & PROPOSAL WORKFLOW) */}
          {adminTab === "quotes" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    <span>Supervision des Devis & Projets SI ({adminQuotes.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Étudiez les demandes clients, fixez les montants chiffrés officiels et publiez les propositions pour débloquer le téléchargement du devis PDF.
                  </p>
                </div>

                <button
                  onClick={async () => {
                    const title = await askPrompt("Nouveau Projet", "Titre du projet / Devis SI :", "Ex: Audit infrastructure IT");
                    if (!title) return;
                    const client = await askPrompt("Nouveau Projet", "Nom du client / Entreprise :", "Sénégal Tech SARL", "Sénégal Tech SARL");
                    if (!client) return;
                    const phone = await askPrompt("Nouveau Projet", "Téléphone du client :", "+221 77 000 11 22", "+221 77 000 11 22");
                    const budget = await askPrompt("Nouveau Projet", "Budget estimé (FCFA) :", "1500000", "1500000");

                    const newQuote: QuoteRequestDTO = {
                      id: `SAT-DEV-${Math.floor(100000 + Math.random() * 900000)}`,
                      userId: `usr-${Date.now()}`,
                      userName: client,
                      userPhone: phone || "+221 77 000 00 00",
                      pole: "SOLUTIONS_NUMERIQUES",
                      serviceTitle: title,
                      description: "Projet créé directement par le SuperAdmin.",
                      region: "Dakar",
                      budgetFCFA: parseInt(budget || "1000000", 10),
                      status: "EN_ATTENTE",
                      createdAt: new Date().toISOString(),
                    };

                    store.addQuote(newQuote);
                    setAdminQuotes([newQuote, ...adminQuotes]);
                    setConfirmConfig({ isAlert: true, message: `Devis ${newQuote.id} créé avec succès !`, onConfirm: () => {} })
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer Nouveau Devis</span>
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap border-b border-slate-800 pb-3">
                {[
                  { id: "ALL", label: "Tous", count: adminQuotes.length },
                  { id: "EN_ATTENTE", label: "⏳ En attente d'étude", count: adminQuotes.filter(q => q.status === "EN_ATTENTE" || (q.status as string) === "EN_ETUDE").length },
                  { id: "PROPOSITION_ENVOYEE", label: "✓ Propositions publiées", count: adminQuotes.filter(q => q.status === "PROPOSITION_ENVOYEE").length },
                  { id: "VALIDE", label: "🎉 Validés par Client", count: adminQuotes.filter(q => q.status === "VALIDE" || (q.status as string) === "Validé").length },
                  { id: "REFUSE", label: "Refusés", count: adminQuotes.filter(q => q.status === "REFUSE").length },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminQuoteFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      adminQuoteFilter === tab.id
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      adminQuoteFilter === tab.id ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-300"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Quotes Cards List */}
              <div className="space-y-3.5 pt-1">
                {(() => {
                  const filteredQuotes = adminQuotes.filter(q => {
                    if (adminQuoteFilter === "ALL") return true;
                    if (adminQuoteFilter === "EN_ATTENTE") return q.status === "EN_ATTENTE" || (q.status as string) === "EN_ETUDE";
                    if (adminQuoteFilter === "PROPOSITION_ENVOYEE") return q.status === "PROPOSITION_ENVOYEE";
                    if (adminQuoteFilter === "VALIDE") return q.status === "VALIDE" || (q.status as string) === "Validé";
                    if (adminQuoteFilter === "REFUSE") return q.status === "REFUSE";
                    return true;
                  });

                  if (filteredQuotes.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                          <FileText className="w-8 h-8 text-amber-500/50" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-base">Aucun devis trouvé</p>
                          <p className="text-slate-400 text-sm mt-1">
                            {adminQuoteFilter === "ALL"
                              ? "Les demandes de devis soumises par les clients apparaîtront ici."
                              : "Aucun devis ne correspond à ce filtre pour le moment."}
                          </p>
                        </div>
                        <button
                          onClick={() => setAdminQuoteFilter("ALL")}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
                        >
                          Voir tous les devis
                        </button>
                      </div>
                    );
                  }

                   const seen = new Set<string>();
                   const uniqueQuotes = filteredQuotes.filter((q) => {
                     if (seen.has(q.id)) return false;
                     seen.add(q.id);
                     return true;
                   });

                   return uniqueQuotes.map((q, index) => {
                     const isPending = q.status === "EN_ATTENTE" || (q.status as string) === "EN_ETUDE";
                     const isPublished = q.status === "PROPOSITION_ENVOYEE" || q.status === "VALIDE" || (q.status as string) === "Validé";

                     return (
                       <div
                         key={`${q.id}-${index}`}
                         className={`p-5 rounded-2xl border transition-all space-y-3 ${
                          isPublished
                            ? "bg-slate-950 border-emerald-500/30"
                            : isPending
                            ? "bg-slate-950 border-amber-500/30"
                            : "bg-slate-950 border-slate-800"
                        }`}
                      >
                        {/* Header Details */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs text-amber-400 font-bold">{q.id}</span>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                                Pôle: {q.pole}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-bold">
                                Budget initial: {formatCurrency(q.budgetFCFA || 0, currency)}
                              </span>
                              {q.proposalAmountFCFA && (
                                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold border border-emerald-500/40">
                                  Chiffrage validé : {formatCurrency(q.proposalAmountFCFA, currency)}
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-bold text-white mt-1">{q.serviceTitle}</h4>
                            <p className="text-xs text-slate-300">
                              Client : <strong className="text-white">{q.userName}</strong> ({q.userPhone} {q.userEmail ? `• ${q.userEmail}` : ""}) • Région: <strong>{q.region}</strong>
                            </p>
                          </div>

                          {/* Status Tag */}
                          <div>
                            {isPending && (
                              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                                ⏳ En attente de chiffrage
                              </span>
                            )}
                            {q.status === "PROPOSITION_ENVOYEE" && (
                              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                                ✓ Proposition publiée au client
                              </span>
                            )}
                            {(q.status === "VALIDE" || (q.status as string) === "Validé") && (
                              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/40">
                                🎉 Proposition acceptée par le client
                              </span>
                            )}
                            {q.status === "REFUSE" && (
                              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                                Refusé
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description & Options */}
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1.5">
                          <p className="text-slate-300 leading-relaxed">{q.description}</p>
                          {q.options && q.options.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-400">
                              <span className="font-semibold text-slate-300">Options demandées :</span>
                              {q.options.map((opt, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px]">
                                  ✓ {opt}
                                </span>
                              ))}
                            </div>
                          )}
                          {q.assignedExpertName && (
                            <p className="text-[11px] text-amber-400 font-semibold pt-0.5">
                              👤 Expert assigné : {q.assignedExpertName} ({q.assignedExpertPhone || "+221 70 533 46 11"})
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => setSelectedQuoteForProposal(q)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                              <span>{isPending ? "Établir & Publier la Proposition" : "Modifier la Proposition"}</span>
                            </button>

                            <button
                              onClick={() => {
                                exportQuotePDF({
                                  id: q.id,
                                  reference: q.id,
                                  pole: q.pole,
                                  serviceTitle: q.serviceTitle,
                                  description: q.description,
                                  region: q.region || "Dakar",
                                  budgetFCFA: q.proposalAmountFCFA || q.budgetFCFA || 500000,
                                  userName: q.userName,
                                  userPhone: q.userPhone,
                                  userEmail: q.userEmail,
                                  status: q.status,
                                  createdAt: q.publishedAt || q.createdAt,
                                  items: q.items?.map(it => ({
                                    description: it.description,
                                    totalFCFA: it.totalFCFA,
                                  })),
                                });
                              }}
                              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-400" />
                              <span>PDF Devis (Admin)</span>
                            </button>

                            <a
                              href={`https://wa.me/${(q.userPhone || "221705334611").replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour ${q.userName}, SEN AURA TECH vous contacte à propos de votre devis ${q.id} (${q.serviceTitle}).`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>WhatsApp Client</span>
                            </a>
                          </div>

                          <button
                            onClick={() => {
                              setConfirmConfig({
                                 message: `Supprimer définitivement la demande de devis ${q.id} ?`,
                                  onConfirm: () => {
                                    store.deleteQuote(q.id);
                                    setAdminQuotes(adminQuotes.filter(item => item.id !== q.id));
                                  }
                              })
                            }}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                            title="Supprimer le devis"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Admin Quote Proposal Builder & Publishing Modal */}
              <AdminQuoteProposalModal
                isOpen={!!selectedQuoteForProposal}
                quote={selectedQuoteForProposal}
                onClose={() => setSelectedQuoteForProposal(null)}
                adminPros={adminPros}
                currency={currency}
                onPublish={(updated) => {
                  setAdminQuotes(prev => prev.map(item => item.id === updated.id ? updated : item));
                }}
              />
            </div>
          )}

          {/* TAB 2: UTILISATEURS & ACTIVATIONS (FULL CRUD & APPROVAL WORKFLOW) */}
          {adminTab === "users" && (
            <div className="space-y-6">
              {/* CONSOLE EXPRESS RÉINITIALISATION CODE PIN OUBLIÉ WHATSAPP */}
              <AdminPinResetConsole />

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-emerald-400" />
                      <span>Gestion des Utilisateurs & Activations des Comptes Pro ({adminUsers.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Activez les comptes Formateurs, Vendeurs et Prestataires après confirmation de leur règlement d'abonnement.
                    </p>
                  </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filtrer par nom ou email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      const name = await askPrompt("Nouvel Utilisateur", "Nom complet de l'utilisateur / Formateur :");
                      if (!name) return;
                      const phone = await askPrompt("Nouvel Utilisateur", "Numéro de téléphone (ex: 77 123 45 67) :");
                      if (!phone) return;
                      const email = await askPrompt("Nouvel Utilisateur", "Email de l'utilisateur (ex: contact@domaine.sn) :");
                      if (!email) return;
                      const roleRaw = await askPrompt("Nouvel Utilisateur", "Rôle (CLIENT, FORMATEUR, VENDEUR, PROFESSIONAL, ADMIN) :", "FORMATEUR", "FORMATEUR");
                      const roleInput = (roleRaw || "FORMATEUR").toUpperCase() as UserRole;
                      
                      const cleanPhoneDigits = phone.replace(/\D/g, "");
                      const normPhone = cleanPhoneDigits.startsWith("221") && cleanPhoneDigits.length === 12 ? cleanPhoneDigits.slice(3) : cleanPhoneDigits;
                      const normEmail = email.trim().toLowerCase();

                      // Vérification doublon locale
                      const existsLocally = adminUsers.some((u: any) => {
                        const uClean = (u.phone || u.phoneNumber || "").replace(/\D/g, "");
                        const uNorm = uClean.startsWith("221") && uClean.length === 12 ? uClean.slice(3) : uClean;
                        const phoneMatch = normPhone && uNorm && uNorm === normPhone;
                        const emailMatch = normEmail && u.email && u.email.trim().toLowerCase() === normEmail;
                        return phoneMatch || emailMatch;
                      });

                      if (existsLocally) {
                        setConfirmConfig({ isAlert: true, message: "Erreur : Un utilisateur avec ce numéro de téléphone ou cet email existe déjà.", onConfirm: () => {} })
                        return;
                      }

                      // Vérification API Backend & Base de données
                      try {
                        const checkRes = await authFetch("/api/auth/check-uniqueness", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ phone, email: normEmail })
                        });
                        const checkData = await checkRes.json();
                        if (!checkData.available) {
                          setConfirmConfig({ isAlert: true, message: `Erreur d'unicité : ${checkData.error || "Cet utilisateur existe déjà."}`, onConfirm: () => {} })
                          return;
                        }
                      } catch {}

                      const newUser = {
                        id: `usr-${Date.now()}`,
                        name,
                        email: normEmail,
                        phone: `+221 ${normPhone || phone}`,
                        role: roleInput,
                        region: "Dakar",
                        status: roleInput === "CLIENT" ? "Actif" : "En attente de validation",
                        paymentStatus: roleInput === "CLIENT" ? "Accès Gratuit" : "En attente (25,000 FCFA/mois)"
                      };

                      authFetch(`/api/db/users/sync`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(newUser) }).catch(()=>{});
                      setAdminUsers([newUser, ...adminUsers]);

                      // Persist to backend
                      try {
                        await authFetch("/api/db/users/sync", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: newUser.id,
                            fullName: name,
                            email: normEmail,
                            phone: newUser.phone,
                            role: roleInput,
                            region: "Dakar",
                            pin: "1234"
                          })
                        });
                      } catch {}

                      setConfirmConfig({ isAlert: true, message: `Compte ${name} créé avec succès (Rôle: ${roleInput}) !`, onConfirm: () => {} })
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouveau Compte</span>
                  </button>
                </div>
              </div>

              {/* ROLE FILTER PILLS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs font-bold">
                {[
                  { key: "TOUS", label: "Tous" },
                  { key: "FORMATEUR", label: "🎓 Formateurs" },
                  { key: "VENDEUR", label: "🛍️ Vendeurs" },
                  { key: "PROFESSIONAL", label: "🔧 Prestataires Pro" },
                  { key: "CLIENT", label: "👥 Clients" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setUserRoleFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                      userRoleFilter === f.key
                        ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {f.label} ({f.key === "TOUS" ? adminUsers.length : adminUsers.filter(u => u.role === f.key).length})
                  </button>
                ))}
              </div>

              {/* USER ACCOUNTS TABLE / CARDS */}
              <div className="space-y-3 pt-2">
                {adminUsers
                  .filter(u => userRoleFilter === "TOUS" || u.role === userRoleFilter)
                  .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((u) => {
                    const isActive = u.status === "Actif" || u.status === "ACTIVE" || u.status === "ACTIF";
                    const isClient = u.role === "CLIENT";

                    return (
                      <div key={u.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        
                        {/* User info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{u.name}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                              isActive
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                              {isActive ? "ACTIVE • Validé ✓" : "PENDING • En attente ⏳"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {u.email} • Région : <strong>{u.region}</strong> • Statut : <span className={isActive ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>{isActive ? "ACTIVE (Accès complet)" : "PENDING (En révision)"}</span>
                          </p>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                          
                          {/* Role Selector */}
                          <select
                            value={u.role}
                             onChange={(e) => {
                               const newRole = e.target.value as UserRole;
                               const token = localStorage.getItem("senaura_auth_token");
                               const headers: Record<string, string> = { "Content-Type": "application/json" };
                               if (token) headers.Authorization = `Bearer ${token}`;
                               authFetch(`/api/admin/users/${u.id}`, { method: "PUT", headers, body: JSON.stringify({ role: newRole }) }).catch(()=>{});
                               setAdminUsers(adminUsers.map(item => item.id === u.id ? { ...item, role: newRole } : item));
                             }}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400 focus:outline-none"
                          >
                            <option value="CLIENT">CLIENT</option>
                            <option value="PROFESSIONAL">PROFESSIONAL</option>
                            <option value="FORMATEUR">FORMATEUR</option>
                            <option value="VENDEUR">VENDEUR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>

                          {/* Account Activation / Status Toggle Button */}
                          {!isClient && (
                            <button
                              onClick={async () => {
                                const newActive = !isActive;
                                const newStatusStr = newActive ? "ACTIVE" : "PENDING";
                                
                                setAdminUsers(adminUsers.map(item => {
                                  if (item.id === u.id) {
                                    return {
                                      ...item,
                                      status: newActive ? "ACTIVE" : "PENDING",
                                      paymentStatus: newActive ? "Abonnement Validé ✓ (Wave)" : "En attente de validation"
                                    };
                                  }
                                  return item;
                                }));

                                // Update global store state
                                store.setProAccountStatus(newStatusStr, u.id);

                                // Trigger status change + Welcome/Activation notifications (WhatsApp + Email + Console logs)
                                await SecurityPinService.setProAccountStatus({
                                  phone: u.phone || u.email || u.name,
                                  status: newStatusStr,
                                  email: u.email?.includes("@") ? u.email : undefined,
                                  role: u.role,
                                  fullName: u.name,
                                });

                                // Also update global proRoleActivations state
                                setProRoleActivations(prev => ({
                                  ...prev,
                                  [u.role]: {
                                    active: newActive,
                                    paymentInfo: newActive ? "Abonnement Validé par SuperAdmin ✓" : "En attente de validation"
                                  }
                                }));

                                setConfirmConfig({
                                  isAlert: true,
                                  message: newActive
                                    ? `✓ Statut activé : ACTIVE ! Notification de bienvenue et d'activation WhatsApp & Email envoyée à ${u.name}.`
                                    : `⏳ Statut modifié : PENDING (Mis en attente).`,
                                  onConfirm: () => {}
                                });
                              }}
                              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                                isActive
                                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-amber-300"
                                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                              }`}
                            >
                              {isActive ? (
                                <>
                                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Mettre en PENDING</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Activer le Compte (Set ACTIVE ✓)</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* 100% Zero-Cost WhatsApp PIN Reset Button */}
                          <ResetUserPinButton
                            user={{
                              id: u.id,
                              fullName: u.name,
                              phone: u.email,
                              whatsapp: "705334611",
                              role: u.role || "Client"
                            }}
                            onUpdateUserPin={(usrId, newPin) => {
                              setAdminUsers(adminUsers.map(item => item.id === usrId ? { ...item, paymentStatus: `Code réinitialisé (${newPin})` } : item));
                              setConfirmConfig({ isAlert: true, message: `Nouveau code secret (${newPin}) généré pour ${u.name} et prêt à envoyer sur WhatsApp !`, onConfirm: () => {} })
                            }}
                          />

                          <button
                            onClick={() => {
                              setConfirmConfig({
                                 message: `Supprimer l'utilisateur "${u.name}" ?`,
                                 onConfirm: () => {
                                   const token = localStorage.getItem("senaura_auth_token");
                                   const headers: Record<string, string> = {};
                                   if (token) headers.Authorization = `Bearer ${token}`;
                                   authFetch(`/api/admin/users/${u.id}`, { method: "DELETE", headers }).catch(()=>{});
                                   setAdminUsers(adminUsers.filter(item => item.id !== u.id));
                                 }
                              })
                            }}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
              </div>
            </div>
            </div>
          )}

          {/* TAB 3: PRESTATAIRES AGRÉÉS (FULL CRUD) */}
          {adminTab === "pros" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-sky-400" />
                    <span>Répertoire des Prestataires & Techniciens Agréés ({adminPros.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">Gérez le réseau d'experts certifiés, attribuez le badge de certification et contrôlez la visibilité.</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filtrer par nom ou spécialité..."
                      value={proSearch}
                      onChange={(e) => setProSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      const name = await askPrompt("Nouveau Technicien", "Nom complet du technicien :");
                      if (!name) return;
                      const cat = await askPrompt("Nouveau Technicien", "Spécialité (Solaire, Fibre, Caméras, Électricité) :", "Énergie Solaire", "Énergie Solaire");
                      const rate = await askPrompt("Nouveau Technicien", "Tarif horaire (FCFA) :", "15000", "15000");

                      const newPro = {
                        id: `pro-${Date.now()}`,
                        fullName: name,
                        category: cat || "Technicien Général",
                        region: "Dakar",
                        phone: "+221 77 " + Math.floor(1000000 + Math.random() * 9000000),
                        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                        rating: 5.0,
                        reviewsCount: 1,
                        hourlyRateFCFA: parseInt(rate || "15000", 10),
                        verified: true,
                        skills: [cat || "Solaire"],
                        bio: "Technicien expert agréé par le réseau SEN AURA TECH.",
                        completedJobs: 12,
                        available: true,
                      };

                      setAdminPros([newPro, ...adminPros]);
                      setConfirmConfig({ isAlert: true, message: `Technicien ${name} ajouté avec succès !`, onConfirm: () => {} })
                    }}
                    className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouveau Prestataire</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {adminPros
                  .filter(p => p.fullName.toLowerCase().includes(proSearch.toLowerCase()) || p.category.toLowerCase().includes(proSearch.toLowerCase()))
                  .map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img src={p.avatar} alt={p.fullName} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{p.fullName}</h4>
                            {p.verified && (
                              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/40">
                                Certifié ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{p.category} • {p.region}</p>
                          <p className="text-xs text-amber-400 font-mono font-bold mt-1">
                            {formatCurrency(p.hourlyRateFCFA, currency)} / heure • ⭐ {p.rating}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => {
                            setAdminPros(adminPros.map(item => item.id === p.id ? { ...item, verified: !item.verified } : item));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            p.verified ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-sky-500 text-slate-950"
                          }`}
                        >
                          {p.verified ? "Retirer Badge" : "Certifier"}
                        </button>

                        <button
                          onClick={() => {
                            setConfirmConfig({
                                message: `Supprimer ${p.fullName} ?`,
                                onConfirm: () => {
                                  setAdminPros(adminPros.filter(item => item.id !== p.id));
                                }
                              })
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: CONTRÔLE BOUTIQUE & COMMANDES (FULL CRUD) */}
          {(adminTab === "shop" || adminTab === "store") && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              {/* SECTION 1: CATALOGUE PRODUITS */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-indigo-400" />
                      <span>Catalogue Produits en Stock ({adminProducts.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">Ajustez les prix, le stock et ajoutez de nouveaux équipements.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-56">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Rechercher produit..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        const name = await askPrompt("Nouveau Produit", "Nom du matériel / équipement :");
                        if (!name) return;
                        const cat = await askPrompt("Nouveau Produit", "Catégorie (Solaire, Caméras, Réseau, Ordinateurs) :", "Solaire & Énergie", "Solaire & Énergie");
                        const price = await askPrompt("Nouveau Produit", "Prix unitaire (FCFA) :", "250000", "250000");
                        const stockVal = await askPrompt("Nouveau Produit", "Quantité en stock :", "15", "15");

                        const newProd = {
                          id: `prod-${Date.now()}`,
                          name,
                          category: cat || "Boutique Général",
                          brand: "SEN AURA",
                          priceFCFA: parseInt(price || "100000", 10),
                          stock: parseInt(stockVal || "10", 10),
                          image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80",
                          description: "Matériel certifié garantie 2 ans.",
                          specs: { "Garantie": "24 Mois", "Norme": "CE" }
                        };

                        try {
                          await authFetch("/api/db/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newProd) });
                        } catch (e) {}

                        setAdminProducts([newProd, ...adminProducts]);
                        setConfirmConfig({ isAlert: true, message: `Produit "${name}" ajouté avec succès !`, onConfirm: () => {} })
                      }}
                      className="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter Produit</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {adminProducts
                    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase()))
                    .map((p) => (
                      <div key={p.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                          <p className="text-[10px] text-slate-400">{p.category}</p>
                          <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                            {formatCurrency(p.priceFCFA, currency)}
                          </p>
                          <p className="text-[10px] font-mono text-amber-300">Stock: {p.stock} unités</p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <button
                            onClick={async () => {
                              const newStock = await askPrompt("Mise à jour du Stock", `Nouveau stock pour ${p.name} :`, p.stock.toString(), p.stock.toString());
                               if (newStock) {
                                 authFetch(`/api/db/products/${p.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ stock: parseInt(newStock, 10) }) }).catch(()=>{});
                                 setAdminProducts(adminProducts.map(item => item.id === p.id ? { ...item, stock: parseInt(newStock, 10) } : item));
                               }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                          >
                            Stock
                          </button>
                          <button
                            onClick={() => {
                              setConfirmConfig({
                                 message: `Supprimer le produit ${p.name} ?`,
                                 onConfirm: async () => {
                                   try {
                                     const token = localStorage.getItem("senaura_auth_token");
                                     const headers: Record<string, string> = {};
                                     if (token) headers.Authorization = `Bearer ${token}`;
                                     await authFetch(`/api/db/products/${p.id}`, { method: "DELETE", headers });
                                   } catch {}
                                   setAdminProducts(adminProducts.filter(item => item.id !== p.id));
                                 }
                              })
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* SECTION 2: COMMANDES CLIENTS */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Suivi & Validation des Commandes Clients ({adminOrders.length})</span>
                </h4>

                <div className="space-y-2">
                  {adminOrders.map((ord) => (
                    <div key={ord.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-amber-400 font-bold">{ord.id}</span>
                          <span className="text-slate-400">• Client: {ord.userName}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            Paiement: {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">Adresse de livraison: {ord.shippingAddress}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-black text-white font-mono">{formatCurrency(ord.totalFCFA, currency)}</span>
                        <button
                          onClick={() => {
                            setAdminOrders(adminOrders.map(o => o.id === ord.id ? { ...o, paymentStatus: "SUCCES" as any } : o));
                            setConfirmConfig({ isAlert: true, message: `Commande ${ord.id} marquée comme expédiée & livrée !`, onConfirm: () => {} })
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                        >
                          Valider Livraison
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GESTION DES AMBASSADEURS, COMMISSIONS & PROSPECTS (SUPERVISION COMPLÈTE) */}
          {(adminTab === "ambassadors" || adminTab === "partners") && (
            <AmbassadorAdminView />
          )}

          {/* TAB 6: SUPERVISION ACADEMY & COURS */}
          {adminTab === "academy" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">Supervision SEN AURA ACADEMY</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Validez les programmes de formation des formateurs, publiez les modules et délivrez les attestations officielles.</p>
                </div>

                <button
                  onClick={async () => {
                    const title = await askPrompt("Nouvelle Formation", "Titre de la formation SuperAdmin :");
                    if (!title) return;
                    const cat = await askPrompt("Nouvelle Formation", "Catégorie (IA, Solaire, Réseau, Sécurité, Domotique) :", "IA & Data", "IA & Data");
                    const price = await askPrompt("Nouvelle Formation", "Prix public (FCFA) :", "50000", "50000");
                    const duration = await askPrompt("Nouvelle Formation", "Durée totale :", "20 Heures", "20 Heures");

                    const newC = {
                      id: `fc-admin-${Date.now()}`,
                      title,
                      category: cat || "Général",
                      enrolled: 1,
                      price: parseInt(price || "50000", 10),
                      status: "Publié",
                      rating: 5.0,
                      coverImage: "https://res.cloudinary.com/senauratech/image/upload/v1720000000/sen_aura_tech/course_gemini_ai_masterclass.png",
                      description: "Formation certifiante publiée directement par l'Administration SEN AURA.",
                      duration: duration || "15 Heures"
                    };

                    try {
                      await authFetch("/api/db/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newC) });
                    } catch (e) {}

                    setFormateurCourses([newC, ...formateurCourses]);
                    setConfirmConfig({ isAlert: true, message: `Formation "${title}" créée et publiée sur l'Academy !`, onConfirm: () => {} })
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Cours SuperAdmin</span>
                </button>
              </div>

              {/* STATS ACADEMY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Modules Actifs</span>
                  <p className="text-2xl font-black text-indigo-400 font-mono mt-1">{formateurCourses.length}</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">Disponibles en ligne</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Apprenants Cumulés</span>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">{formateurStudents.length} Étudiants</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Inscrits au Sénégal</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Certificats Validés</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{formateurStudents.filter(s => s.progress === 100).length} Délivrés</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">Signature Numérique OK</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Chiffre d'Affaires Academy</span>
                  <p className="text-2xl font-black text-yellow-400 font-mono mt-1">
                    {formatCurrency(formateurCourses.reduce((sum, c) => sum + (c.price || 0) * (c.enrolled || 0), 0), currency)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Partage Formateurs 70/30</p>
                </div>
              </div>

              {/* CATALOGUE DES MODULES & MODÉRATION */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Gestion des Modules de Formation ({formateurCourses.length})</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formateurCourses.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                      <div className="flex gap-3 items-start">
                        {c.coverImage && (
                          <img src={c.coverImage} alt={c.title} className="w-20 h-16 object-cover rounded-xl border border-slate-800 shrink-0" />
                        )}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                              {c.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              c.status === "Publié" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate">{c.title}</h4>
                          <p className="text-[10px] text-slate-400">{c.duration} • {c.enrolled} inscrits</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">{formatCurrency(c.price, currency)}</span>

                        <div className="flex items-center gap-2">
                           <button
                             onClick={() => {
                               authFetch(`/api/db/courses/${c.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status: c.status === "Publié" ? "Brouillon" : "Publié" }) }).catch(()=>{});
                               setFormateurCourses(formateurCourses.map(item => item.id === c.id ? { ...item, status: item.status === "Publié" ? "Brouillon" : "Publié" } : item));
                             }}
                             className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                           >
                             {c.status === "Publié" ? "Masquer" : "Publier"}
                           </button>
                           <button
                             onClick={() => {
                               setConfirmConfig({
                                 message: `Supprimer la formation ${c.title} ?`,
                                 onConfirm: () => {
                                   authFetch(`/api/db/courses/${c.id}`, { method: "DELETE" }).catch(()=>{});
                                   setFormateurCourses(formateurCourses.filter(item => item.id !== c.id));
                                 }
                              })
                            }}
                            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SUIVI DES ÉTUDIANTS & GÉNÉRATION DE CERTIFICATS */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Délivrance Directe d'Attestations & Certificats</span>
                </h4>

                <div className="space-y-2">
                  {formateurStudents.map((std) => (
                    <div key={std.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{std.name}</span>
                          <span className="text-[10px] text-slate-400">({std.phone})</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                            Progression: {std.progress}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">Formation: <strong>{std.course}</strong></p>
                      </div>

                      <button
                        onClick={() => setSelectedCertStudent(std)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md"
                      >
                        <Award className="w-4 h-4" />
                        <span>Aperçu Certificat</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LOGS SYSTÈME & SÉCURITÉ */}
          {adminTab === "logs" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">Métriques SI & Journal d'Audit de Sécurité</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Supervisez l'état des serveurs, des micro-services et l'historique des connexions et transactions.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/40">
                    Système Opérationnel 🟢
                  </span>
                </div>
              </div>

              {/* SERVERS HEALTH */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Serveur Node.js API</span>
                  <p className="text-lg font-black text-emerald-400 font-mono mt-1">En Ligne 🟢</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Latence: 18 ms</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Firestore Database</span>
                  <p className="text-lg font-black text-emerald-400 font-mono mt-1">Connecté 🟢</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Règles Sécurisées ✓</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Passerelles Mobile Money</span>
                  <p className="text-lg font-black text-emerald-400 font-mono mt-1">Wave & OM 🟢</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sénégal 100% Fonctionnel</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Taux de Disponibilité</span>
                  <p className="text-lg font-black text-indigo-400 font-mono mt-1">99.98%</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Dernier redémarrage: 14j</p>
                </div>
              </div>

              {/* AUDIT LOGS TABLE */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Derniers Événements Sécurité & Activités</span>
                </h4>

                <div className="space-y-2 font-mono text-xs">
                  {[
                    ...(store.currentUser.phone ? [{
                      time: "Aujourd'hui",
                      event: `Session Active: ${store.currentUser.fullName || store.currentUser.phone} (${store.currentUser.role})`,
                      ip: "Connexion Vérifiée",
                      status: "Authentifié 🟢"
                    }] : []),
                    ...adminQuotes.slice(0, 3).map(q => ({
                      time: q.createdAt ? new Date(q.createdAt).toLocaleDateString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : "Récemment",
                      event: `Devis #${q.id.slice(0, 8)} (${q.userName || 'Client'} - ${q.pole})`,
                      ip: "Dakar - Sénégal",
                      status: q.status || "Enregistré 🟢"
                    })),
                    ...adminOrders.slice(0, 2).map(o => ({
                      time: o.createdAt ? new Date(o.createdAt).toLocaleDateString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : "Récemment",
                      event: `Commande #${o.id.slice(0, 8)} (${formatCurrency(o.totalFCFA || 0, currency)})`,
                      ip: "Sénégal (Mobile Money)",
                      status: "Payé 🟢"
                    }))
                  ].map((log, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">{log.time}</span>
                          <span className="text-slate-300">{log.event}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Source: {log.ip}</p>
                      </div>

                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] shrink-0">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SUPERVISION INTERVENTIONS & MISSIONS */}
          {adminTab === "missions" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-bold text-white">Supervision Interventions & Missions Terrain</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Affectation directe des techniciens agréés SEN AURA et contrôle de la qualité de service.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/40">
                    {adminPros.length} Techniciens Agréés 🛠️
                  </span>
                </div>
              </div>

              {/* MISSIONS SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Interventions en Cours</span>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">{store.bookings.filter(b => b.status !== "TERMINEE").length} Missions</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">Sénégal (Dakar, Thiès, Mbour)</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Missions Terminées</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{store.bookings.filter(b => b.status === "TERMINEE").length} Validées</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">Rapports signés avec photo</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Satisfaction Clients</span>
                  <p className="text-2xl font-black text-sky-400 font-mono mt-1">5.0 / 5.0 ⭐</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Avis contrôlés</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">Volume Prestations</span>
                  <p className="text-2xl font-black text-purple-400 font-mono mt-1">
                    {formatCurrency(store.bookings.reduce((sum, b) => sum + (b.estimatedFCFA || 0), 0), currency)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Distribués via Wave/OM</p>
                </div>
              </div>

              {/* TABLE DES MISSIONS EN COURS */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  <span>Dernières Demandes & Affectations Directes</span>
                </h4>

                {store.bookings.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-400">Aucune demande de réservation technique en cours.</p>
                    <p className="text-[11px] text-slate-500">Les réservations effectuées par les clients apparaîtront ici pour supervision.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {store.bookings.map((m) => (
                      <div key={m.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-amber-400">{m.id}</span>
                            <span className="text-xs font-bold text-white">{m.clientName}</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">{m.proCategory}</span>
                          </div>
                          <p className="text-xs text-slate-400">Lieu: {m.address || m.region || "Sénégal"} • Date: <strong className="text-slate-200">{m.date} à {m.time}</strong></p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono font-bold text-emerald-400">{formatCurrency(m.estimatedFCFA || 0, currency)}</span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                            {m.status || "En attente"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: HOTLINE & SUPPORT CLIENT */}
          {adminTab === "support" && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-sky-400" />
                    <h3 className="text-lg font-bold text-white">Centre d'Assistance & Tickets Support</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Gérez les demandes clients, le support WhatsApp/Téléphone et la résolution des litiges.</p>
                </div>

                <button
                  onClick={async () => {
                    const msg = await askPrompt("Alerte Générale", "Message d'alerte générale aux utilisateurs :");
                    if (msg) setConfirmConfig({ isAlert: true, type: "info", message: "Alerte d'information diffusée avec succès !", onConfirm: () => {} })
                  }}
                  className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-lg shadow-sky-500/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Envoyer Message Général</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-bold">Tickets Ouverts</span>
                  <p className="text-2xl font-black text-amber-400 font-mono">0 En Attente</p>
                  <p className="text-[10px] text-slate-500">Temps de réponse moyen: -- min</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-bold">Hotline WhatsApp</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono">+221 77 000 00 00</p>
                  <p className="text-[10px] text-emerald-400">Canal WhatsApp Business Actif</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-bold">Tickets Résolus</span>
                  <p className="text-2xl font-black text-indigo-400 font-mono">0 Clôturés</p>
                  <p className="text-[10px] text-slate-500">Ce mois-ci</p>
                </div>
              </div>

              {/* TICKETS LIST */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Derniers Tickets de Support</span>
                </h4>

                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-2xl border border-slate-800/50 bg-slate-950/50">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto">
                    <Headphones className="w-8 h-8 text-sky-500/50" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">Aucun ticket de support</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Votre centre d'assistance est à jour. Les demandes clients apparaîtront ici.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: CONFIGURATION SI & TARIFS */}
          {adminTab === "settings" && (
            <SuperAdminSettingsManager />
          )}

          {/* TAB 11: SÉCURITÉ & PARE-FEU */}
          {adminTab === "security" && (
            <SecurityFirewallPanel />
          )}

          </div> {/* Closing ADMIN main content flex-1 */}
        </div> /* Closing ADMIN flex layout */
      )}

      {/* ========================================================================= */}
      {/* ROLE: AMBASSADOR DASHBOARD                                               */}
      {/* ========================================================================= */}
      {role === "AMBASSADOR" && (
        <div className="flex flex-col md:flex-row gap-3.5 lg:gap-4 items-start">
          <div className="hidden md:block shrink-0 sticky top-20 self-start">
            <AmbassadorSidebar
              ambassadorTab={ambassadorTab}
              setAmbassadorTab={setAmbassadorTab}
              onNavigate={onNavigate}
            />
          </div>
          <div className="flex-1 min-w-0 w-full space-y-4">
            <AmbassadorDashboardView
              currency={currency}
              activeTab={ambassadorTab as any}
              setActiveTab={setAmbassadorTab}
              onNavigateToPublic={() => onNavigate?.("ambassadeur")}
            />
          </div>
        </div>
      )}

      <ActionConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
      <CustomDialog
        isOpen={!!promptConfig}
        type="prompt"
        title={promptConfig?.title || ""}
        message={promptConfig?.message || ""}
        placeholder={promptConfig?.placeholder}
        defaultValue={promptConfig?.defaultValue}
        confirmLabel="Valider"
        cancelLabel="Annuler"
        onConfirm={(val) => { promptConfig?.resolve(val); setPromptConfig(null); }}
        onCancel={() => { promptConfig?.resolve(undefined); setPromptConfig(null); }}
      />

      {/* MODAL CERTIFICAT APPRENANT PREVIEW */}
      <OfficialCertificateModal
        isOpen={!!selectedCertStudent}
        onClose={() => setSelectedCertStudent(null)}
        certificate={
          selectedCertStudent
            ? {
                id: "CERT-SN-2026-088",
                studentName: selectedCertStudent.name,
                courseTitle: selectedCertStudent.course,
                issueDate: selectedCertStudent.date || "12 Août 2026",
                scoreOrMention: "100% Maîtrisé — Mention Très Bien avec Félicitations",
                badgeTitle: "Certified Tech Professional - SEN AURA ACADEMY",
                instructorName: "Dr. Amadou Ba",
                hoursCount: 45,
              }
            : null
        }
      />

      {/* MODAL COURSE RESOURCES PREVIEW */}
      {selectedCoursePreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedCoursePreview(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>

            {/* Course Header Banner */}
            <div className="space-y-3 pt-2">
              {selectedCoursePreview.coverImage && (
                <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-slate-800">
                  <img src={selectedCoursePreview.coverImage} alt={selectedCoursePreview.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/80 backdrop-blur-md text-white text-xs font-bold">
                      {selectedCoursePreview.category}
                    </span>
                    <span className="text-lg font-black text-amber-400 font-mono bg-slate-950/80 px-3 py-1 rounded-xl">
                      {formatCurrency(selectedCoursePreview.price, currency)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white">{selectedCoursePreview.title}</h3>
                <span className="text-xs text-indigo-300 font-mono font-bold bg-indigo-500/20 px-2.5 py-1 rounded-lg">
                  ⏱ {selectedCoursePreview.duration || "15 Heures"}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedCoursePreview.description}
              </p>
            </div>

            {/* ATTACHED RESOURCES LIST */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Ressources Pédagogiques Associées
              </h4>

              {/* 1. PDF DOCUMENT */}
              {selectedCoursePreview.pdfDoc ? (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{selectedCoursePreview.pdfDoc.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Document de cours • {selectedCoursePreview.pdfDoc.size || "PDF"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      generateGenericPDF(
                        selectedCoursePreview.pdfDoc.name || "Document_Cours_SENAURA.pdf",
                        `Support de Cours : ${selectedCoursePreview.title}`,
                        "SEN AURA ACADEMY",
                        [
                          {
                            title: "Description du Cours",
                            content: selectedCoursePreview.description || "Support de cours pédagogique officiel délivré par SEN AURA ACADEMY.",
                          },
                          {
                            title: "Informations Générales",
                            content: `Catégorie : ${selectedCoursePreview.category} | Niveau : ${selectedCoursePreview.level} | Durée : ${selectedCoursePreview.durationHours} Heures`,
                          },
                          {
                            title: "Consignes d'apprentissage",
                            content: "Lisez attentivement les diapo et effectuez les exercices pratiques joints avant le contrôle de connaissances.",
                          },
                        ]
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Aucun PDF joint à ce cours.</p>
              )}

              {/* 2. YOUTUBE VIDEO */}
              {selectedCoursePreview.youtubeUrl ? (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-bold text-white">Vidéo de Démonstration YouTube</span>
                    </div>
                    <a
                      href={selectedCoursePreview.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-[11px] font-bold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ouvrir sur YouTube</span>
                    </a>
                  </div>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                    <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
                      <Play className="w-4 h-4 text-red-400" />
                      Lecture Vidéo YouTube Active ({selectedCoursePreview.youtubeUrl})
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Aucune vidéo YouTube associée.</p>
              )}

              {/* 3. APPLICATION / WEBSITE URL */}
              {selectedCoursePreview.appUrl ? (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-white">Application Web / Démo Live</span>
                    </div>
                    <a
                      href={selectedCoursePreview.appUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Accéder au Site/App 🚀</span>
                    </a>
                  </div>
                  <p className="text-[11px] text-sky-300 font-mono truncate">{selectedCoursePreview.appUrl}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Aucun lien d'application ou de site web spécifié.</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCoursePreview(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. VENDOR PRODUCT MEDIA VIEWER MODAL (CLOUDINARY PHOTO / VIDEO + 3 GALLERY PHOTOS) */}
      {selectedVendorProductForMedia && (
        <VendorProductMediaModal
          product={selectedVendorProductForMedia}
          onClose={() => setSelectedVendorProductForMedia(null)}
          currency={currency}
        />
      )}

    </div>
  );
};
