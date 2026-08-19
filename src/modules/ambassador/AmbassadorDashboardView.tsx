import { authFetch } from "../../lib/authFetch";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  UserCheck,
  ShoppingBag,
  Target,
  Briefcase,
  DollarSign,
  Share2,
  Trophy,
  Copy,
  Check,
  Plus,
  QrCode,
  Download,
  Send,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  MessageSquare,
  FileText,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpRight,
  ChevronRight,
  Award,
  Monitor,
  Store,
  Video,
  Sun,
  GraduationCap,
  Users
} from "lucide-react";
import { formatCurrency } from "../../config/constants";
import { store } from "../../database/store";
import { AmbassadorProspectDTO, AmbassadorCommissionDTO } from "../../shared/contracts/types";
import { OfficialAmbassadorCard } from "../../shared/components/OfficialAmbassadorCard";
import {
  generateOfficialPresentationPDF,
  generateSolarSecurityBrochurePDF,
  generateDigitalERPAffichePDF,
  generateGenericPDF
} from "../../lib/pdfGenerator";

interface AmbassadorDashboardViewProps {
  currency: "FCFA" | "EUR";
  activeTab?: "overview" | "profile" | "catalog" | "prospects" | "projects" | "commissions" | "kit" | "leaderboard";
  setActiveTab?: (tab: "overview" | "profile" | "catalog" | "prospects" | "projects" | "commissions" | "kit" | "leaderboard") => void;
  onNavigateToPublic?: () => void;
}

export const AmbassadorDashboardView: React.FC<AmbassadorDashboardViewProps> = ({
  currency,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  onNavigateToPublic,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<
    "overview" | "profile" | "catalog" | "prospects" | "projects" | "commissions" | "kit" | "leaderboard"
  >("overview");

  const activeTab = propActiveTab || internalActiveTab;
  const setActiveTab = propSetActiveTab || setInternalActiveTab;

  const ambassadorCode = "SAT-AMB-0025";
  const ambassadorName = store.currentUser.fullName || "Edu (Mamadou Sow)";
  const referralLink = `https://papa-malick-teuw-dev-ia.vercel.app/?ref=${ambassadorCode}`;

  const [copiedLink, setCopiedLink] = useState(false);

  // Prospects State
  const [prospects, setProspects] = useState<AmbassadorProspectDTO[]>([]);
  const [isLoadingProspects, setIsLoadingProspects] = useState(false);
  const [showAddProspectModal, setShowAddProspectModal] = useState(false);
  const [prospectFormConflict, setProspectFormConflict] = useState<string | null>(null);

  const [prospectFormData, setProspectFormData] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    sector: "Entreprises",
    city: "Dakar",
    clientNeed: "",
    estimatedBudgetFCFA: 1000000,
    source: "Prospection directe",
    notes: ""
  });

  // Commissions State
  const [commissions, setCommissions] = useState<AmbassadorCommissionDTO[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<"WAVE" | "ORANGE_MONEY" | "VIREMENT">("WAVE");
  const [withdrawPhone, setWithdrawPhone] = useState(store.currentUser.phone || "+221 70 533 46 11");
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleDownloadSupport = (item: { title: string; type: string; size: string; desc: string }) => {
    try {
      if (item.title.includes("Présentation")) {
        const success = generateOfficialPresentationPDF("presentation-officielle-sen-aura-tech.pdf");
        if (success) {
          showToast(`Téléchargement de "${item.title}" réussi !`, "success");
          return;
        }
      } else if (item.title.includes("Caméras") || item.title.includes("Brochure")) {
        const success = generateSolarSecurityBrochurePDF("brochure-cameras-solaire-sen-aura-tech.pdf");
        if (success) {
          showToast(`Téléchargement de "${item.title}" réussi !`, "success");
          return;
        }
      } else if (item.title.includes("Affiches") || item.title.includes("Digitales") || item.title.includes("ERP")) {
        const success = generateDigitalERPAffichePDF("affiche-solutions-digitales-erp-senauratech.pdf");
        if (success) {
          showToast(`Téléchargement de "${item.title}" réussi !`, "success");
          return;
        }
      } else if (item.title.includes("Logos") || item.type.includes("SVG") || item.type.includes("PNG")) {
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 160" width="600" height="160">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#0b0f19" rx="16"/>
  <rect x="24" y="30" width="100" height="100" rx="16" fill="url(#goldGrad)"/>
  <text x="74" y="92" fill="#0b0f19" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" text-anchor="middle">SAT</text>
  <text x="145" y="75" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="900" letter-spacing="1">SEN AURA TECH</text>
  <text x="145" y="108" fill="#fbbf24" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="2">INGÉNIERIE • ÉNERGIE SOLAIRE • SÉCURITÉ IA</text>
</svg>`;
        const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sen-aura-tech-pack-logos-hd.svg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Téléchargement de "${item.title}" réussi !`, "success");
        return;
      } else if (item.title.includes("WhatsApp") || item.type.includes("Pitch") || item.type.includes("Texte")) {
        const textContent = `=====================================================
🎯 MODÈLES DE PROSPECTION COMMERCIALE WHATSAPP & LINKEDIN
RÉSEAU OFFICIEL D'AMBASSADEURS — SEN AURA TECH SÉNÉGAL
=====================================================

📌 1. PITCH SOLAIRE HYBRIDE & AUTONOMIE 24H/24 (VILLAS & ENTREPRISES) :
---------------------------------------------------------------------
"Bonjour [Nom du contact], j'espère que vous allez bien.
Je vous contacte en tant qu'Ambassadeur Agréé SEN AURA TECH.
Face aux coupures d'électricité et aux factures SENELEC élevées, nous installons des centrales solaires hybrides nouvelle génération (5.5kVA à 50kVA) avec batteries Lithium garanties 10 ans. 
Le système prend le relais en 10 millisecondes sans aucune coupure de vos appareils.
Aimeriez-vous que notre ingénieur réalise une étude de dimensionnement gratuite pour votre bâtiment ?"

📌 2. PITCH VIDÉOSURVEILLANCE 4K IA (COMMERCES & CHANTIERS) :
-----------------------------------------------------------
"Bonjour M./Mme [Nom],
Savez-vous que vous pouvez surveiller vos locaux et chantiers en direct 24h/24 en 4K couleur depuis votre smartphone sans payer aucun abonnement mensuel ?
SEN AURA TECH installe des caméras intelligentes Dahua avec détection humaine et sirène anti-intrusion.
Puis-je vous envoyer notre brochure technique et nos tarifs préférentiels ?"

📌 3. PITCH LOGICIEL ERP & GESTION COMMERCIALE :
----------------------------------------------
"Bonjour cher partenaire,
Pour digitaliser vos ventes, stocks et caisse avec intégration Wave / Orange Money, découvrez l'ERP SEN AURA.
Simple, accessible sur mobile et PC, il sécurise vos encaissements et élimine les erreurs d'inventaire.
Souhaitez-vous une démonstration en ligne de 10 minutes ?"

=====================================================
Besoin d'assistance ? Contact coordination : contact@senauratech.sn
Portail Officiel : https://www.senauratech.com
=====================================================`;
        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "modeles-prospection-whatsapp-senauratech.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Téléchargement de "${item.title}" réussi !`, "success");
        return;
      }

      // Default Generic PDF generator
      generateGenericPDF(
        `${item.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf`,
        item.title,
        item.type,
        [
          { title: "Description du Support Marketing", content: item.desc },
          { title: "Recommandations d'usage pour l'Ambassadeur", content: "Utilisez ce document officiel pour vos rendez-vous B2B, vos partages sur réseaux sociaux professionnels ou vos communications par messagerie directe avec vos prospects qualifiés." },
          { title: "Règles de Marque SEN AURA TECH", content: "Conservez l'intégrité visuelle des logos et des tarifs officiels. Toute modification des caractéristiques techniques doit être validée par la direction technique de Dakar." }
        ]
      );
      showToast(`Téléchargement de "${item.title}" réussi !`, "success");
    } catch (e) {
      console.error(e);
      showToast(`Erreur lors du téléchargement de "${item.title}".`, "error");
    }
  };

  // Load Ambassador Data from API
  const fetchAmbassadorData = async () => {
    setIsLoadingProspects(true);
    try {
      // Prospects
      const pRes = await authFetch(`/api/ambassadors/prospects/${ambassadorCode}`);
      const pData = await pRes.json();
      if (pData.success) {
        setProspects(pData.prospects);
      }

      // Commissions
      const cRes = await authFetch(`/api/ambassadors/commissions/${ambassadorCode}`);
      const cData = await cRes.json();
      if (cData.success) {
        setCommissions(cData.commissions);
      }

      // Leaderboard
      const lRes = await authFetch(`/api/ambassadors/leaderboard`);
      const lData = await lRes.json();
      if (lData.success) {
        setLeaderboard(lData.leaderboard);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProspects(false);
    }
  };

  useEffect(() => {
    fetchAmbassadorData();
  }, []);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    setProspectFormConflict(null);

    try {
      const res = await authFetch("/api/ambassadors/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ambassadorId: ambassadorCode,
          ambassadorName,
          ambassadorCode,
          ...prospectFormData
        })
      });

      const data = await res.json();
      if (res.status === 409) {
        setProspectFormConflict(data.message);
      } else if (data.success) {
        setShowAddProspectModal(false);
        setProspectFormData({
          companyName: "",
          contactName: "",
          phone: "",
          email: "",
          sector: "Entreprises",
          city: "Dakar",
          clientNeed: "",
          estimatedBudgetFCFA: 1000000,
          source: "Prospection directe",
          notes: ""
        });
        fetchAmbassadorData();
        showToast(`Prospect "${prospectFormData.companyName || prospectFormData.contactName}" enregistré avec succès !`, "success");
      } else {
        showToast(data.message || "Erreur lors de l'enregistrement du prospect.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur de connexion serveur.", "error");
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch("/api/ambassadors/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ambassadorId: ambassadorCode,
          payoutMethod: withdrawMethod,
          payoutPhone: withdrawPhone,
          amountFCFA: totalCommissionsFCFA
        })
      });
      const data = await res.json();
      if (data.success) {
        setWithdrawSuccessMsg(data.message);
        setTimeout(() => {
          setShowWithdrawModal(false);
          setWithdrawSuccessMsg(null);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // KPI Calculations
  const totalCommissionsFCFA = commissions.filter(c => c.status === "PAYE" || c.status === "COMMISSION_VALIDEE").reduce((sum, c) => sum + c.commissionAmountFCFA, 0);
  const totalProjectsApportes = prospects.length;
  const totalProjectsSignes = prospects.filter(p => p.status === "PROJET_SIGNE" || p.status === "PAYE").length;
  const totalProspectsCount = prospects.length;

  // Solutions Catalog Data
  const solutionsCatalog = [
    {
      id: "SOL-001",
      title: "Application Web / Mobile Sur-Mesure",
      desc: "Conception, développement et déploiement d'applications React, Node, PWA & Mobile.",
      problem: "Entreprises nécessitant une numérisation spécifique, automatisation et paiement Wave/OM.",
      target: "PME, Cliniques, Écoles, Immobilier, Transport",
      startingPriceFCFA: 1500000,
      commissionRate: "10% à 20%",
      estCommissionFCFA: 150000,
      icon: Monitor
    },
    {
      id: "SOL-002",
      title: "ERP & Gestion Commerciale SEN AURA",
      desc: "Logiciel complet de gestion de stocks, facturation, caisse et suivi clients.",
      problem: "Commerces et entreprises gérant leurs ventes sur papier ou fichiers Excel dispersés.",
      target: "Boutiques, Grossistes, Supermarchés, Quincailleries",
      startingPriceFCFA: 500000,
      commissionRate: "12%",
      estCommissionFCFA: 60000,
      icon: Store
    },
    {
      id: "SOL-003",
      title: "Installation Caméras Dahua 4K & Sécurité IP",
      desc: "Vidéosurveillance autonome 4K nocturne avec détection IA et contrôle smartphone à distance.",
      problem: "Insécurité, vol de stocks ou contrôle distant de villas et chantiers.",
      target: "Résidences, Chantiers, Magasins, Entrepôts",
      startingPriceFCFA: 295000,
      commissionRate: "15%",
      estCommissionFCFA: 44250,
      icon: Video
    },
    {
      id: "SOL-004",
      title: "Installation Solaire Hybride 5.5KVA Pure Sine",
      desc: "Kit solaire autonome avec régulateur MPPT, batteries Lithium LiFePO4 et switch SENELEC.",
      problem: "Coupures d'électricité récurrentes et factures énergétiques élevées.",
      target: "Villas, Bureaux, Fermes, Boulangeries, Hôtels",
      startingPriceFCFA: 1200000,
      commissionRate: "15%",
      estCommissionFCFA: 180000,
      icon: Sun
    },
    {
      id: "SOL-005",
      title: "SEN AURA Academy - Formations Certifiantes",
      desc: "Certifications IA, Solaire, Fullstack Next.js & Cybersécurité à Dakar et Thiès.",
      problem: "Montée en compétences des équipes et reconversion professionnelle certifiée.",
      target: "Étudiants, Ingénieurs, Entreprises pour leurs salariés",
      startingPriceFCFA: 150000,
      commissionRate: "15%",
      estCommissionFCFA: 22500,
      icon: GraduationCap
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NOUVEAU":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Nouveau</span>;
      case "CONTACTE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-[10px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Contacté</span>;
      case "PROPOSITION_ENVOYEE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[10px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Proposition envoyée</span>;
      case "NEGOCIATION":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Négociation</span>;
      case "PROJET_SIGNE":
      case "PAYE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Projet signé / Payé</span>;
      case "PERDU":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[10px] font-bold"><XCircle className="w-3 h-3 text-rose-400" /> Perdu</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 pb-16 relative">
      {/* IN-APP TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
              toastMessage.type === "success"
                ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50"
                : toastMessage.type === "error"
                ? "bg-rose-950/90 text-rose-300 border-rose-500/50"
                : "bg-sky-950/90 text-sky-300 border-sky-500/50"
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${toastMessage.type === "success" ? "text-emerald-400" : "text-amber-400"}`} />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 1. TOP HEADER BAR */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800/90 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>Bonjour {ambassadorName}</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold tracking-wider">
              Ambassadeur #{ambassadorCode}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Programme SEN AURA Partners • Niveau : <strong className="text-emerald-400">Élite Certifié</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => setShowAddProspectModal(true)}
            className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Ajouter un prospect</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("profile");
            }}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Mon QR Code</span>
          </button>
        </div>
      </div>

      {/* 2. MENU / DASHBOARD NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {[
          { id: "overview", label: "Tableau de bord", icon: LayoutDashboard },
          { id: "profile", label: "Mon profil & Lien", icon: UserCheck },
          { id: "catalog", label: "Catalogue", icon: ShoppingBag },
          { id: "prospects", label: "Mes prospects", icon: Target },
          { id: "projects", label: "Mes projets", icon: Briefcase },
          { id: "commissions", label: "Mes commissions", icon: DollarSign },
          { id: "kit", label: "Kit ambassadeur", icon: Share2 },
          { id: "leaderboard", label: "Classement", icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENTS */}

      {/* TAB 1: OVERVIEW / TABLEAU DE BORD (SYNTHÈSE COMPLETE) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 4 SYNTHETIC KPI CARDS (Uniquement dans la vue d'ensemble) */}
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
            {/* KPI 1: COMMISSIONS */}
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
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800/90 space-y-2 hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Commissions</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {formatCurrency(totalCommissionsFCFA, "FCFA")}
              </div>
              <p className="text-[10px] text-slate-400">Paiements validés & disponibles</p>
            </motion.div>

            {/* KPI 2: PROJETS APPORTÉS */}
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
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800/90 space-y-2 hover:border-sky-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Projets Apportés</span>
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {totalProjectsApportes}
              </div>
              <p className="text-[10px] text-slate-400">Entreprises & dossiers transmis</p>
            </motion.div>

            {/* KPI 3: PROJETS SIGNÉS */}
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
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800/90 space-y-2 hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Projets Signés</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {totalProjectsSignes}
              </div>
              <p className="text-[10px] text-slate-400">Contrats conclus avec succès</p>
            </motion.div>

            {/* KPI 4: PROSPECTS */}
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
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800/90 space-y-2 hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Prospects Enregistrés</span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-300 font-mono">
                {totalProspectsCount}
              </div>
              <p className="text-[10px] text-slate-400">Protégés par votre matricule</p>
            </motion.div>
          </motion.div>
          {/* Quick Referral Sharing Box */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Votre Lien Personnel d'Ambassadeur</span>
              </h3>
              <p className="text-xs text-slate-400">
                Partagez ce lien. Tout prospect ou commande arrivant par ce lien est automatiquement rattaché à votre compte.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 w-full md:w-80"
              />
              <button
                onClick={handleCopyReferral}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Copié !" : "Copier"}</span>
              </button>
            </div>
          </div>

          {/* Prospects Recent Activity Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">Prospects Récents & Avancement</h3>
                <p className="text-xs text-slate-400">Suivi en temps réel de vos déclarations d'entreprises.</p>
              </div>
              <button
                onClick={() => setActiveTab("prospects")}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Voir tous les prospects</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Matricule</th>
                    <th className="py-3 px-4 font-bold">Entreprise</th>
                    <th className="py-3 px-4 font-bold">Besoin</th>
                    <th className="py-3 px-4 font-bold">Budget Estimé</th>
                    <th className="py-3 px-4 font-bold text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {prospects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{p.id}</td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div>{p.companyName}</div>
                        <div className="text-[10px] font-normal text-slate-400">{p.contactName} • {p.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{p.clientNeed}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{formatCurrency(p.estimatedBudgetFCFA, "FCFA")}</td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE & AFFILIATE LINK WITH OFFICIAL CUSTOM CARD & QR CODE */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Personal Specs Form/View */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-left">
              <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <span>Informations de l'Ambassadeur</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400">Matricule Officiel :</span>
                  <span className="font-mono font-bold text-amber-400">{ambassadorCode}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400">Nom Complet :</span>
                  <span className="font-bold text-white">{ambassadorName}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400">Téléphone / WhatsApp :</span>
                  <span className="font-mono text-white">{store.currentUser.phone || "+221 70 533 46 11"}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400">Email :</span>
                  <span className="text-white">{store.currentUser.email || "mamadou.sow@senauratech.sn"}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400">Région Principale :</span>
                  <span className="text-white">{store.currentUser.region || "Dakar"}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-1">
                  <p className="font-bold">💡 Bon à savoir :</p>
                  <p className="text-slate-300 leading-relaxed">
                    Vous pouvez personnaliser votre photo de badge, basculer le recto/verso de votre carte professionnelle et télécharger votre badge officiel au format PDF pour l'imprimer sur vos cartes de visite.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Ultra-Pro Custom Card & QR Code */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-black text-white flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-400" />
                  <span>Votre Carte d'Ambassadeur & QR Code</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold">
                  ● QR CODE EN DIRECT
                </span>
              </h3>

              <OfficialAmbassadorCard
                data={{
                  ambassadorCode,
                  fullName: ambassadorName,
                  phone: store.currentUser.phone || "+221 70 533 46 11",
                  email: store.currentUser.email || "mamadou.sow@senauratech.sn",
                  region: store.currentUser.region || "Dakar",
                  roleTitle: "Apporteur d'Affaires & Partenaire Tech",
                  validUntil: "2026 - 2027"
                }}
                referralLink={referralLink}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOLUTIONS CATALOGUE */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">Catalogue des Solutions SEN AURA TECH</h3>
            <p className="text-xs text-slate-400">Présentez ces solutions à votre réseau et partagez directement la fiche avec votre lien affilié.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutionsCatalog.map((sol) => {
              const IconComp = sol.icon;
              return (
                <div key={sol.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-amber-500/50 transition-all">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                        Comm. : {sol.commissionRate}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white leading-tight">{sol.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{sol.desc}</p>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                      <p className="flex items-start gap-1.5"><Target className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" /> <span><strong className="text-slate-300">Cible :</strong> {sol.target}</span></p>
                      <p className="flex items-start gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" /> <span><strong className="text-slate-300">Problème résolu :</strong> {sol.problem}</span></p>
                    </div>
                  </div>

                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Prix à partir de :</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(sol.startingPriceFCFA, "FCFA")}</span>
                  </div>

                  {/* Share buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Bonjour, je vous recommande la solution "${sol.title}" par SEN AURA TECH : ${referralLink}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 font-bold text-[11px] text-center flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={handleCopyReferral}
                      className="py-2 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-bold text-[11px] flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Lien affilié</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* TAB 4: PROSPECTS MANAGEMENT & ADD FORM */}
      {activeTab === "prospects" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-white">Gestion de vos prospects</h3>
              <p className="text-xs text-slate-400">Protection d'attribution par horodatage (First-come rule).</p>
            </div>

            <button
              onClick={() => setShowAddProspectModal(true)}
              className="px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Déclarer un nouveau prospect</span>
            </button>
          </div>

          {/* Prospects Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Matricule</th>
                    <th className="py-3.5 px-4 font-bold">Entreprise & Contact</th>
                    <th className="py-3.5 px-4 font-bold">Secteur</th>
                    <th className="py-3.5 px-4 font-bold">Besoin du Client</th>
                    <th className="py-3.5 px-4 font-bold">Budget Estimé</th>
                    <th className="py-3.5 px-4 font-bold text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {prospects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{p.id}</td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div>{p.companyName}</div>
                        <div className="text-[10px] font-normal text-slate-400">{p.contactName} • {p.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{p.sector}</td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{p.clientNeed}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{formatCurrency(p.estimatedBudgetFCFA, "FCFA")}</td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PROJECTS */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">Projets Concrétisés issus de vos Prospects</h3>
            <p className="text-xs text-slate-400">Suivi des montants de contrats et du calcul automatique des commissions.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Code Projet</th>
                    <th className="py-3.5 px-4 font-bold">Client / Entreprise</th>
                    <th className="py-3.5 px-4 font-bold">Montant du Projet</th>
                    <th className="py-3.5 px-4 font-bold">Taux</th>
                    <th className="py-3.5 px-4 font-bold">Votre Commission</th>
                    <th className="py-3.5 px-4 font-bold text-center">Statut Règlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {commissions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{c.id}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{c.clientName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{formatCurrency(c.projectAmountFCFA, "FCFA")}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{c.commissionRatePercent}%</td>
                      <td className="py-3.5 px-4 font-mono font-black text-amber-400">{formatCurrency(c.commissionAmountFCFA, "FCFA")}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COMMISSIONS & PAYOUTS */}
      {activeTab === "commissions" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Solde Cumulé Validé</span>
              <div className="text-3xl font-black text-amber-400 font-mono mt-1">
                {formatCurrency(totalCommissionsFCFA, "FCFA")}
              </div>
              <p className="text-xs text-slate-400 mt-1">Prêt pour paiement sous 24h via Wave ou Orange Money.</p>
            </div>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>Demander un retrait</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white">Historique des versements & commissions</h4>
            <div className="space-y-2">
              {commissions.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{c.projectName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Réf: {c.id} • Taux: {c.commissionRatePercent}%</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black text-amber-400 text-sm">{formatCurrency(c.commissionAmountFCFA, "FCFA")}</p>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Payé via {c.payoutMethod || "WAVE"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: KIT AMBASSADEUR */}
      {activeTab === "kit" && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">Kit Ambassadeur & Supports Marketing HD</h3>
            <p className="text-xs text-slate-400">Téléchargez nos supports officiels pour vos présentations et publications.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Présentation Officielle SEN AURA TECH (PDF)", type: "Présentation PDF", size: "4.2 MB", desc: "Diaporama complet de présentation de l'entreprise et de nos pôle de compétences." },
              { title: "Affiches Solutions Digitales & ERP", type: "Affiche HD", size: "8.1 MB", desc: "Visuels grand format pour impression ou réseaux sociaux." },
              { title: "Brochure Caméras 4K & Énergie Solaire", type: "Brochure Commerciale", size: "2.5 MB", desc: "Fiche technique détaillée pour villas et chantiers." },
              { title: "Modèles de Messages Commercial WhatsApp", type: "Texte & Pitch", size: "12 KB", desc: "Phrases d'accroche pour la prospection sur WhatsApp & LinkedIn." },
              { title: "Pack Logos Vectoriels SEN AURA", type: "Logos PNG/SVG", size: "1.8 MB", desc: "Logos haute définition en fond transparent." }
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                    {item.type} • {item.size}
                  </span>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>

                <button
                  onClick={() => handleDownloadSupport(item)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le support</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Classement des Top Ambassadeurs du Réseau</span>
            </h3>
            <p className="text-xs text-slate-400">Transparence et reconnaissance des meilleurs apporteurs de projets.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold text-center">Rang</th>
                    <th className="py-3.5 px-4 font-bold">Ambassadeur</th>
                    <th className="py-3.5 px-4 font-bold">Ville</th>
                    <th className="py-3.5 px-4 font-bold text-center">Projets Signés</th>
                    <th className="py-3.5 px-4 font-bold">Commissions Générées</th>
                    <th className="py-3.5 px-4 font-bold text-center">Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {leaderboard.map((amb) => (
                    <tr key={amb.rank} className={`hover:bg-slate-800/40 transition-colors ${amb.code === ambassadorCode ? "bg-amber-500/10 font-bold" : ""}`}>
                      <td className="py-3.5 px-4 text-center font-mono font-black text-amber-400">#{amb.rank}</td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div>{amb.name}</div>
                        <div className="text-[10px] font-normal text-slate-400 font-mono">{amb.code}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{amb.city}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">{amb.projectsCount}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{formatCurrency(amb.commissionsEarnedFCFA, "FCFA")}</td>
                      <td className="py-3.5 px-4 text-center font-bold">{amb.badge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROSPECT */}
      {showAddProspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>+ Déclarer un nouveau prospect</span>
              </h3>
              <button onClick={() => setShowAddProspectModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {prospectFormConflict && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Règle de protection d'attribution</span>
                </p>
                <p>{prospectFormConflict}</p>
              </div>
            )}

            <form onSubmit={handleAddProspect} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nom de l'Entreprise *</label>
                  <input
                    type="text"
                    required
                    value={prospectFormData.companyName}
                    onChange={(e) => setProspectFormData({ ...prospectFormData, companyName: e.target.value })}
                    placeholder="Ex: Groupe Teranga Immobilier"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nom du Contact *</label>
                  <input
                    type="text"
                    required
                    value={prospectFormData.contactName}
                    onChange={(e) => setProspectFormData({ ...prospectFormData, contactName: e.target.value })}
                    placeholder="Ex: M. Cheikh Tall"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Téléphone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={prospectFormData.phone}
                    onChange={(e) => setProspectFormData({ ...prospectFormData, phone: e.target.value })}
                    placeholder="+221 77 000 00 00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email (Optionnel)</label>
                  <input
                    type="email"
                    value={prospectFormData.email}
                    onChange={(e) => setProspectFormData({ ...prospectFormData, email: e.target.value })}
                    placeholder="contact@entreprise.sn"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Secteur *</label>
                  <select
                    value={prospectFormData.sector}
                    onChange={(e) => setProspectFormData({ ...prospectFormData, sector: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Entreprises">Entreprises / PME</option>
                    <option value="Commerces">Commerces & Boutiques</option>
                    <option value="Écoles">Écoles & Universités</option>
                    <option value="Associations">Associations & ONG</option>
                    <option value="Immobilier">Immobilier & BTP</option>
                    <option value="Froid & Climatisation">Froid & Climatisation</option>
                    <option value="Santé">Santé & Cliniques</option>
                    <option value="Autre">Autre secteur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Ville *</label>
                  <input
                    type="text"
                    required
                    value={prospectFormData.city}
                    onChange={(e) => setProspectFormData({ ...prospectFormData, city: e.target.value })}
                    placeholder="Dakar, Thiès, Mbour..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Besoin du Client *</label>
                <textarea
                  rows={2}
                  required
                  value={prospectFormData.clientNeed}
                  onChange={(e) => setProspectFormData({ ...prospectFormData, clientNeed: e.target.value })}
                  placeholder="Ex: Application Web sur-mesure de gestion de stocks + Installation 4 caméras Dahua."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Budget Estimatif (FCFA) *</label>
                <input
                  type="number"
                  required
                  value={prospectFormData.estimatedBudgetFCFA}
                  onChange={(e) => setProspectFormData({ ...prospectFormData, estimatedBudgetFCFA: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProspectModal(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                >
                  Envoyer & Sécuriser ce prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WITHDRAWAL REQUEST */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Demande de Retrait de Commissions</span>
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {withdrawSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold">{withdrawSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawalRequest} className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 justify-between items-center flex">
                  <span className="text-slate-400">Montant du solde disponible :</span>
                  <span className="font-mono font-black text-amber-400 text-base">{formatCurrency(totalCommissionsFCFA, "FCFA")}</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Moyen de Règlement *</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="WAVE">Wave Senegal (Mobile Money)</option>
                    <option value="ORANGE_MONEY">Orange Money Senegal</option>
                    <option value="VIREMENT">Virement Bancaire Direct</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Numéro de Réception Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Confirmer le retrait de {formatCurrency(totalCommissionsFCFA, "FCFA")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
