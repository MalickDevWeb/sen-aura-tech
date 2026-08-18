import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Award,
  DollarSign,
  Building2,
  FileText,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Send,
  Eye,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Briefcase,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  ArrowUpRight,
  SlidersHorizontal,
  Sparkles,
  Smartphone,
  Download,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatCurrency } from "../../config/constants";
import {
  AmbassadorApplicationDTO,
  AmbassadorProspectDTO,
  AmbassadorCommissionDTO,
  AmbassadorPayoutDTO
} from "../../shared/contracts/types";

export const AmbassadorAdminView: React.FC = () => {
  const [adminSubTab, setAdminSubTab] = useState<"applications" | "prospects" | "payouts">("applications");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Applications State
  const [applications, setApplications] = useState<AmbassadorApplicationDTO[]>([]);
  const [selectedApp, setSelectedApp] = useState<AmbassadorApplicationDTO | null>(null);
  const [appFilterStatus, setAppFilterStatus] = useState<string>("ALL");
  const [appSearchQuery, setAppSearchQuery] = useState<string>("");

  // Validation / Rejection Modal State
  const [validatingApp, setValidatingApp] = useState<AmbassadorApplicationDTO | null>(null);
  const [validationTier, setValidationTier] = useState<string>("GOLD");
  const [validationRate, setValidationRate] = useState<number>(15);
  const [validationCode, setValidationCode] = useState<string>("");
  const [validationNotes, setValidationNotes] = useState<string>("");

  const [rejectingApp, setRejectingApp] = useState<AmbassadorApplicationDTO | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  // Prospects State
  const [prospects, setProspects] = useState<AmbassadorProspectDTO[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<AmbassadorProspectDTO | null>(null);
  const [prospectSearchQuery, setProspectSearchQuery] = useState<string>("");
  const [prospectStatusFilter, setProspectStatusFilter] = useState<string>("ALL");

  // Sign Deal Modal State
  const [signingProspect, setSigningProspect] = useState<AmbassadorProspectDTO | null>(null);
  const [signedAmountInput, setSignedAmountInput] = useState<number>(10000000);
  const [signedRateInput, setSignedRateInput] = useState<number>(15);

  // New Prospect Modal State
  const [isNewProspectModalOpen, setIsNewProspectModalOpen] = useState<boolean>(false);
  const [newProspectForm, setNewProspectForm] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    sector: "Hôtellerie & Tourisme",
    city: "Dakar",
    clientNeed: "",
    estimatedBudgetFCFA: 5000000,
    ambassadorId: "SAT-AMB-0025",
    ambassadorName: "Mamadou Sow (Edu)",
    ambassadorCode: "SAT-AMB-0025",
    notes: ""
  });

  // Anti-Collision Checker State
  const [antiCollisionQuery, setAntiCollisionQuery] = useState<string>("");
  const [antiCollisionResult, setAntiCollisionResult] = useState<{ checked: boolean; found?: AmbassadorProspectDTO } | null>(null);

  // Commissions & Payouts State
  const [commissions, setCommissions] = useState<AmbassadorCommissionDTO[]>([]);
  const [payouts, setPayouts] = useState<AmbassadorPayoutDTO[]>([]);
  const [commFilterStatus, setCommFilterStatus] = useState<string>("ALL");

  // Payout Execution Modal State
  const [processingPayout, setProcessingPayout] = useState<AmbassadorPayoutDTO | null>(null);
  const [payoutTxRef, setPayoutTxRef] = useState<string>("");
  const [payoutStep, setPayoutStep] = useState<"CONFIRM" | "PROCESSING" | "SUCCESS">("CONFIRM");
  const [payoutProgress, setPayoutProgress] = useState<number>(0);

  // Stats State
  const [stats, setStats] = useState<{
    totalAmbassadors: number;
    pendingApplications: number;
    totalProspects: number;
    signedDeals: number;
    totalPipelineFCFA: number;
    totalCommissionsPaidFCFA: number;
    pendingPayoutsCount: number;
    pendingPayoutsAmountFCFA: number;
  }>({
    totalAmbassadors: 0,
    pendingApplications: 0,
    totalProspects: 0,
    signedDeals: 0,
    totalPipelineFCFA: 0,
    totalCommissionsPaidFCFA: 0,
    pendingPayoutsCount: 0,
    pendingPayoutsAmountFCFA: 0
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Applications
      const appRes = await fetch("/api/ambassadors/applications");
      const appData = await appRes.json();
      if (appData.success) {
        setApplications(appData.applications);
      }

      // 2. Prospects
      const prosRes = await fetch("/api/ambassadors/prospects");
      const prosData = await prosRes.json();
      if (prosData.success) {
        setProspects(prosData.prospects);
      }

      // 3. Commissions
      const commRes = await fetch("/api/ambassadors/commissions");
      const commData = await commRes.json();
      if (commData.success) {
        setCommissions(commData.commissions);
      }

      // 4. Payouts
      const payRes = await fetch("/api/ambassadors/payouts");
      const payData = await payRes.json();
      if (payData.success) {
        setPayouts(payData.payouts);
      }

      // 5. Global Stats
      const statRes = await fetch("/api/ambassadors/stats");
      const statData = await statRes.json();
      if (statData.success) {
        setStats(statData.stats);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des données ambassadeurs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handle Approve Candidate
  const handleOpenValidateModal = (app: AmbassadorApplicationDTO) => {
    setValidatingApp(app);
    setValidationTier(app.tier || "GOLD");
    setValidationRate(app.commissionRatePercent || (app.tier === "ELITE" ? 20 : app.tier === "GOLD" ? 15 : 12));
    setValidationCode(app.ambassadorCode || `SAT-AMB-00${Math.floor(10 + Math.random() * 90)}`);
    setValidationNotes("Candidature validée avec succès. Accès au portail et kit commercial activés.");
  };

  const handleConfirmValidation = async () => {
    if (!validatingApp) return;
    try {
      const res = await fetch(`/api/ambassadors/applications/${validatingApp.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "VALIDE",
          tier: validationTier,
          commissionRatePercent: validationRate,
          ambassadorCode: validationCode,
          feedbackNotes: validationNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Candidature de ${validatingApp.fullName} validée sous le matricule ${validationCode} (${validationTier} - ${validationRate}%) !`);
        setValidatingApp(null);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la validation de la candidature.");
    }
  };

  // Handle Reject Candidate
  const handleConfirmRejection = async () => {
    if (!rejectingApp) return;
    try {
      const res = await fetch(`/api/ambassadors/applications/${rejectingApp.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REFUSE",
          feedbackNotes: rejectionReason
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Candidature de ${rejectingApp.fullName} refusée.`);
        setRejectingApp(null);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur lors du refus de la candidature.");
    }
  };

  // Handle Update Prospect Stage
  const handleUpdateProspectStage = async (prospectId: string, newStatus: string) => {
    const p = prospects.find(item => item.id === prospectId);
    if (newStatus === "PROJET_SIGNE" || newStatus === "PAYE") {
      if (p) {
        setSigningProspect(p);
        setSignedAmountInput(p.estimatedBudgetFCFA || 10000000);
        setSignedRateInput(15);
        return;
      }
    }

    try {
      const res = await fetch(`/api/ambassadors/prospects/${prospectId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Statut du prospect mis à jour : ${newStatus}`);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Confirm Signed Project with Commission
  const handleConfirmSignedDeal = async () => {
    if (!signingProspect) return;
    try {
      const res = await fetch(`/api/ambassadors/prospects/${signingProspect.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PROJET_SIGNE",
          signedAmountFCFA: signedAmountInput,
          commissionRatePercent: signedRateInput
        })
      });
      const data = await res.json();
      if (data.success) {
        const commAmt = Math.round(signedAmountInput * (signedRateInput / 100));
        showToast(`Projet signé avec succès ! Commission de ${formatCurrency(commAmt, "FCFA")} générée pour ${signingProspect.ambassadorName}.`);
        setSigningProspect(null);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la validation de signature.");
    }
  };

  // Handle Anti-Collision Check
  const handleRunAntiCollisionCheck = () => {
    if (!antiCollisionQuery.trim()) return;
    const cleanQ = antiCollisionQuery.toLowerCase().replace(/\s+/g, "");
    const found = prospects.find(p =>
      p.companyName.toLowerCase().replace(/\s+/g, "").includes(cleanQ) ||
      p.phone.replace(/\s+/g, "").includes(cleanQ) ||
      p.contactName.toLowerCase().replace(/\s+/g, "").includes(cleanQ)
    );
    setAntiCollisionResult({ checked: true, found });
  };

  // Handle Create Prospect
  const handleCreateProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/ambassadors/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProspectForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Prospect ${data.prospect.companyName} enregistré sous ${data.prospect.id} !`);
        setIsNewProspectModalOpen(false);
        setNewProspectForm({
          companyName: "",
          contactName: "",
          phone: "",
          email: "",
          sector: "Hôtellerie & Tourisme",
          city: "Dakar",
          clientNeed: "",
          estimatedBudgetFCFA: 5000000,
          ambassadorId: "SAT-AMB-0025",
          ambassadorName: "Mamadou Sow (Edu)",
          ambassadorCode: "SAT-AMB-0025",
          notes: ""
        });
        fetchAllData();
      } else if (data.conflict) {
        showToast(data.message);
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'enregistrement du prospect.");
    }
  };

  // Handle Execute Payout Wave/OM with Interactive Progress Animation
  const handleStartPayout = (payout: AmbassadorPayoutDTO) => {
    setProcessingPayout(payout);
    setPayoutTxRef(`${payout.payoutMethod}-TX-${Math.floor(100000 + Math.random() * 900000)}`);
    setPayoutStep("CONFIRM");
    setPayoutProgress(0);
  };

  const handleExecutePayoutAnimation = () => {
    setPayoutStep("PROCESSING");
    setPayoutProgress(10);

    const interval = setInterval(() => {
      setPayoutProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          finishPayout();
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 15;
      });
    }, 300);
  };

  const finishPayout = async () => {
    if (!processingPayout) return;
    try {
      const res = await fetch(`/api/ambassadors/payouts/${processingPayout.id}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionRef: payoutTxRef,
          notes: `Versement direct instantané validé par la Direction Financière.`
        })
      });
      const data = await res.json();
      if (data.success) {
        setPayoutStep("SUCCESS");
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur lors du traitement du virement.");
    }
  };

  // Filtered Applications
  const filteredApplications = applications.filter(a => {
    const matchStatus = appFilterStatus === "ALL" || a.status === appFilterStatus;
    const matchSearch =
      !appSearchQuery ||
      a.fullName.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      a.phone.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      a.city.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      a.profession.toLowerCase().includes(appSearchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Filtered Prospects
  const filteredProspects = prospects.filter(p => {
    const matchStatus = prospectStatusFilter === "ALL" || p.status === prospectStatusFilter;
    const matchSearch =
      !prospectSearchQuery ||
      p.companyName.toLowerCase().includes(prospectSearchQuery.toLowerCase()) ||
      p.contactName.toLowerCase().includes(prospectSearchQuery.toLowerCase()) ||
      p.phone.includes(prospectSearchQuery) ||
      (p.ambassadorName && p.ambassadorName.toLowerCase().includes(prospectSearchQuery.toLowerCase())) ||
      (p.sector && p.sector.toLowerCase().includes(prospectSearchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  // Filtered Commissions
  const filteredCommissions = commissions.filter(c => {
    if (commFilterStatus === "ALL") return true;
    return c.status === commFilterStatus;
  });

  return (
    <div id="ambassador-admin-dashboard" className="space-y-6">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-3 border border-amber-400"
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              ADMINISTRATION SEN AURA TECH
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Réseau Actif
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">Supervision du Réseau d'Ambassadeurs</h2>
          <p className="text-xs text-slate-400">
            Validez les candidatures, gérez l'attribution des prospects et la validation des commissions.
          </p>
        </div>

        {/* REFRESH & QUICK ACTIONS */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchAllData}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs flex items-center gap-2"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION WITH LIVE BADGES */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-3xl bg-slate-900/80 border border-slate-800">
        {[
          {
            id: "applications",
            label: "👥 Candidatures",
            count: applications.filter(a => a.status === "EN_ATTENTE").length,
            badgeColor: "bg-amber-500 text-slate-950"
          },
          {
            id: "prospects",
            label: "🎯 Prospects réseau",
            count: prospects.length,
            badgeColor: "bg-blue-500 text-white"
          },
          {
            id: "payouts",
            label: "💰 Commissions & Retraits",
            count: payouts.filter(p => p.status === "EN_ATTENTE").length,
            badgeColor: "bg-emerald-500 text-slate-950"
          }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminSubTab(tab.id as any)}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 relative ${
              adminSubTab === tab.id
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                adminSubTab === tab.id ? "bg-slate-950 text-amber-300" : tab.badgeColor
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 4 GLOBAL NETWORK KPI METRICS */}
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
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
          className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ambassadeurs Validés</span>
            <span className="text-xl font-black text-white font-mono">
              {applications.filter(a => a.status === "VALIDE").length}
            </span>
            <span className="text-[10px] text-amber-400 block font-medium">
              +{applications.filter(a => a.status === "EN_ATTENTE").length} en attente
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Users className="w-5 h-5" />
          </div>
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
          className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pipeline Apporté</span>
            <span className="text-xl font-black text-blue-400 font-mono">
              {formatCurrency(prospects.reduce((s, p) => s + (p.estimatedBudgetFCFA || 0), 0), "FCFA")}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              {prospects.length} opportunités
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
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
          className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Commissions Distribuées</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {formatCurrency(commissions.filter(c => c.status === "PAYE").reduce((s, c) => s + (c.commissionAmountFCFA || 0), 0), "FCFA")}
            </span>
            <span className="text-[10px] text-emerald-400/80 block font-medium">
              {commissions.filter(c => c.status === "COMMISSION_VALIDEE").length} prêtes à verser
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
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
          className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Demandes de Retrait</span>
            <span className="text-xl font-black text-amber-400 font-mono">
              {payouts.filter(p => p.status === "EN_ATTENTE").length}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              {formatCurrency(payouts.filter(p => p.status === "EN_ATTENTE").reduce((s, p) => s + (p.amountFCFA || 0), 0), "FCFA")} à payer
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Smartphone className="w-5 h-5" />
          </div>
        </motion.div>
      </motion.div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: CANDIDATURES AMBASSADEURS */}
      {/* ========================================================================= */}
      {adminSubTab === "applications" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* FILTER & SEARCH BAR */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <h3 className="text-sm font-bold text-white shrink-0">Liste des Candidatures Ambassadeurs</h3>
              
              {/* STATUS FILTER */}
              <div className="relative">
                <select
                  value={appFilterStatus}
                  onChange={(e) => setAppFilterStatus(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">Tous les statuts ({applications.length})</option>
                  <option value="EN_ATTENTE">🟡 En attente ({applications.filter(a => a.status === "EN_ATTENTE").length})</option>
                  <option value="VALIDE">🟢 Validée ({applications.filter(a => a.status === "VALIDE").length})</option>
                  <option value="REFUSE">🔴 Refusée ({applications.filter(a => a.status === "REFUSE").length})</option>
                </select>
              </div>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, ville, métier..."
                value={appSearchQuery}
                onChange={(e) => setAppSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* CANDIDATES LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredApplications.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                    selectedApp?.id === app.id
                      ? "bg-slate-850 border-amber-500 shadow-xl shadow-amber-500/10"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* CARD HEADER */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{app.fullName}</h4>
                        {app.ambassadorCode && (
                          <span className="font-mono text-[11px] font-bold text-amber-400">
                            {app.ambassadorCode}
                          </span>
                        )}
                      </div>

                      {/* STATUS BADGE */}
                      <div>
                        {app.status === "VALIDE" && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                            🟢 Validée
                          </span>
                        )}
                        {app.status === "EN_ATTENTE" && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold flex items-center gap-1">
                            🟡 En attente
                          </span>
                        )}
                        {app.status === "REFUSE" && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-bold flex items-center gap-1">
                            🔴 Refusée
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">
                      {app.profession} • {app.city} ({app.country})
                    </p>

                    <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1 text-slate-300">
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{app.phone}</span>
                      </p>
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{app.email}</span>
                      </p>
                    </div>

                    {app.motivation && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                        "{app.motivation}"
                      </p>
                    )}

                    {/* TIER & RATE IF VALIDATED */}
                    {app.status === "VALIDE" && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                          Tier {app.tier || "GOLD"}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                          {app.commissionRatePercent || 15}% Commission
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CARD ACTIONS */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Détails</span>
                    </button>

                    {app.status === "EN_ATTENTE" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenValidateModal(app)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => {
                            setRejectingApp(app);
                            setRejectionReason("Profil non retenu pour la phase actuelle.");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs border border-rose-500/30 transition-all"
                        >
                          Refuser
                        </button>
                      </div>
                    )}

                    {app.status === "VALIDE" && (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/${app.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Bonjour ${app.fullName}, félicitations ! Votre compte Ambassadeur SEN AURA TECH (${app.ambassadorCode}) est actif.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredApplications.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-bold text-slate-300">Aucune candidature trouvée</p>
              <p className="text-xs">Modifiez les filtres de recherche pour afficher les candidats.</p>
            </div>
          )}

          {/* APPLICATION DETAILS EXPANDED DRAWER */}
          <AnimatePresence>
            {selectedApp && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                      Dossier Candidat Ambassadeur #{selectedApp.id}
                    </span>
                    <h3 className="text-xl font-black text-white">{selectedApp.fullName}</h3>
                    <p className="text-xs text-slate-400">{selectedApp.profession} • {selectedApp.city}, {selectedApp.country}</p>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    <div>
                      <span className="font-bold text-slate-400 block mb-1">Coordonnées de Contact</span>
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <p className="text-slate-200"><strong>Téléphone :</strong> {selectedApp.phone}</p>
                        <p className="text-slate-200"><strong>Email :</strong> {selectedApp.email}</p>
                        <p className="text-slate-200"><strong>Localisation :</strong> {selectedApp.city}, {selectedApp.country}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 block mb-1">Expérience & Réseaux de Décideurs</span>
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <p className="text-slate-300">{selectedApp.experience || "Expérience commerciale & B2B déclarée."}</p>
                        {selectedApp.skills && selectedApp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {selectedApp.skills.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 text-[10px] font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    <div>
                      <span className="font-bold text-slate-400 block mb-1">Motivation & Vision du Partenariat</span>
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                        <p className="text-slate-300 italic">
                          "{selectedApp.motivation || "Développer les opportunités d'infrastructures et de digitalisation SEN AURA TECH."}"
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 block mb-1">Secteurs & Réseaux Couverts</span>
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap gap-1.5">
                        {selectedApp.contactDomains && selectedApp.contactDomains.length > 0 ? (
                          selectedApp.contactDomains.map((d, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
                              {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">Tous secteurs B2B, Hôtellerie, Santé, Solaire</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION BAR IN DRAWER */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedApp.phone}`}
                      className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>Appeler le Candidat</span>
                    </a>
                    <a
                      href={`https://wa.me/${selectedApp.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Échanger sur WhatsApp</span>
                    </a>
                  </div>

                  {selectedApp.status === "EN_ATTENTE" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenValidateModal(selectedApp)}
                        className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
                      >
                        ✓ Valider et Créer Matricule Ambassadeur
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PROSPECTS RÉSEAU */}
      {/* ========================================================================= */}
      {adminSubTab === "prospects" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* ANTI-COLLISION FIRST-COME RULE BANNER */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/40 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Règle de Protection d'Attribution "Premier Déclarant"</h4>
                  <p className="text-xs text-slate-300">
                    Chaque prospect enregistré est verrouillé au profit du 1er ambassadeur pendant toute la durée de la négociation.
                  </p>
                </div>
              </div>

              {/* ANTI-COLLISION SEARCH INPUT */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Vérifier entreprise ou tél..."
                  value={antiCollisionQuery}
                  onChange={(e) => setAntiCollisionQuery(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 w-48 sm:w-60"
                />
                <button
                  onClick={handleRunAntiCollisionCheck}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Vérifier
                </button>
              </div>
            </div>

            {antiCollisionResult && antiCollisionResult.checked && (
              <div className={`p-3 rounded-2xl text-xs flex items-center justify-between ${
                antiCollisionResult.found
                  ? "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                  : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              }`}>
                {antiCollisionResult.found ? (
                  <span>
                    ⚠️ <strong>Prospect déjà enregistré :</strong> {antiCollisionResult.found.companyName} ({antiCollisionResult.found.phone}) est attribué à <strong>{antiCollisionResult.found.ambassadorName} ({antiCollisionResult.found.ambassadorCode})</strong> depuis le {new Date(antiCollisionResult.found.createdAt).toLocaleDateString("fr-FR")}.
                  </span>
                ) : (
                  <span>
                    ✓ <strong>Aucune antériorité trouvée :</strong> Ce prospect est libre et peut être déclaré par n'importe quel ambassadeur.
                  </span>
                )}
                <button onClick={() => setAntiCollisionResult(null)} className="text-slate-400 hover:text-white ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* PROSPECT LIST CONTROLS */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <h3 className="text-sm font-bold text-white shrink-0">Pipeline des Opportunités d'Affaires</h3>
              <select
                value={prospectStatusFilter}
                onChange={(e) => setProspectStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Tous les statuts ({prospects.length})</option>
                <option value="NOUVEAU">🟡 Nouveau</option>
                <option value="CONTACTE">🔵 Contacté</option>
                <option value="NEGOCIATION">🟠 Négociation</option>
                <option value="PROJET_SIGNE">🟢 Projet signé</option>
                <option value="PAYE">💰 Payé</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrer client, ambassadeur..."
                  value={prospectSearchQuery}
                  onChange={(e) => setProspectSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => setIsNewProspectModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Prospect</span>
              </button>
            </div>
          </div>

          {/* PROSPECTS TABLE */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Code Prospect</th>
                    <th className="py-3.5 px-4">Ambassadeur</th>
                    <th className="py-3.5 px-4">Entreprise & Contact</th>
                    <th className="py-3.5 px-4">Besoin Exprimé</th>
                    <th className="py-3.5 px-4">Budget Estimé</th>
                    <th className="py-3.5 px-4 text-center">Étape du Deal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProspects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{p.id}</td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div>{p.ambassadorName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{p.ambassadorCode}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        <div>{p.companyName}</div>
                        <div className="text-[10px] font-normal text-slate-400">{p.contactName} • {p.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{p.clientNeed}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{formatCurrency(p.estimatedBudgetFCFA, "FCFA")}</td>
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={p.status}
                          onChange={(e) => handleUpdateProspectStage(p.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="NOUVEAU">🟡 Nouveau</option>
                          <option value="CONTACTE">🔵 Contacté</option>
                          <option value="PROPOSITION_ENVOYEE">🟣 Proposition envoyée</option>
                          <option value="NEGOCIATION">🟠 Négociation</option>
                          <option value="PROJET_SIGNE">🟢 Projet signé (Comm. générée)</option>
                          <option value="PAYE">💰 Payé</option>
                          <option value="PERDU">❌ Perdu</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: COMMISSIONS & RETRAITS */}
      {/* ========================================================================= */}
      {adminSubTab === "payouts" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* PAYOUT REQUESTS WAITING */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Demandes de Retraits et Versements Immédiats</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Déclenchez les virements instantanés vers les comptes Wave et Orange Money des ambassadeurs.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                Mode Automatisé Wave / OM
              </span>
            </div>

            <div className="space-y-3">
              {payouts.filter(p => p.status === "EN_ATTENTE").map((pay) => (
                <div
                  key={pay.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{pay.ambassadorName}</p>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                        #{pay.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Demande de retrait {pay.payoutMethod} : <strong>{pay.payoutPhone}</strong>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Demandé le {new Date(pay.requestedAt).toLocaleString("fr-FR")}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Montant Net</span>
                      <p className="font-mono font-black text-amber-400 text-lg">
                        {formatCurrency(pay.amountFCFA, "FCFA")}
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartPayout(pay)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Effectuer le versement {pay.payoutMethod}</span>
                    </button>
                  </div>
                </div>
              ))}

              {payouts.filter(p => p.status === "EN_ATTENTE").length === 0 && (
                <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800/80 text-slate-400 text-xs">
                  ✓ Toutes les demandes de retrait ont été traitées et payées.
                </div>
              )}
            </div>
          </div>

          {/* COMMISSION LEDGER */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Grand Livre des Commissions Validées & Payées</h3>
                <p className="text-xs text-slate-400">Traçabilité complète des commissions générées sur contrats signés.</p>
              </div>

              <select
                value={commFilterStatus}
                onChange={(e) => setCommFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Toutes les commissions ({commissions.length})</option>
                <option value="COMMISSION_VALIDEE">🟢 Validées (À libérer)</option>
                <option value="PAYE">💰 Payées</option>
                <option value="EN_ATTENTE_PAIEMENT_CLIENT">🟡 En attente acompte</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">ID Commission</th>
                    <th className="py-3 px-4">Ambassadeur</th>
                    <th className="py-3 px-4">Projet & Client</th>
                    <th className="py-3 px-4">Montant Projet</th>
                    <th className="py-3 px-4">Taux</th>
                    <th className="py-3 px-4">Commission</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCommissions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{c.id}</td>
                      <td className="py-3 px-4 font-bold text-white">{c.ambassadorName || c.ambassadorId}</td>
                      <td className="py-3 px-4 text-slate-200">
                        <div>{c.clientName}</div>
                        <div className="text-[10px] text-slate-400">{c.projectName}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{formatCurrency(c.projectAmountFCFA, "FCFA")}</td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-400">{c.commissionRatePercent}%</td>
                      <td className="py-3 px-4 font-mono font-black text-emerald-400">{formatCurrency(c.commissionAmountFCFA, "FCFA")}</td>
                      <td className="py-3 px-4 text-center">
                        {c.status === "PAYE" && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            💰 Payé ({c.paymentMethod})
                          </span>
                        )}
                        {c.status === "COMMISSION_VALIDEE" && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                            🟢 Validée
                          </span>
                        )}
                        {c.status === "EN_ATTENTE_PAIEMENT_CLIENT" && (
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                            🟡 En attente acompte
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VALIDATE CANDIDATE AMBASSADOR */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {validatingApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-base">Validation Candidat Ambassadeur</h3>
                </div>
                <button onClick={() => setValidatingApp(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <p className="text-white font-bold">{validatingApp.fullName}</p>
                  <p className="text-slate-400">{validatingApp.profession} • {validatingApp.city}</p>
                  <p className="text-slate-400">{validatingApp.phone} • {validatingApp.email}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Matricule Ambassadeur Officiel</label>
                  <input
                    type="text"
                    value={validationCode}
                    onChange={(e) => setValidationCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Palier / Statut Tier</label>
                    <select
                      value={validationTier}
                      onChange={(e) => {
                        setValidationTier(e.target.value);
                        if (e.target.value === "BRONZE") setValidationRate(10);
                        if (e.target.value === "SILVER") setValidationRate(12);
                        if (e.target.value === "GOLD") setValidationRate(15);
                        if (e.target.value === "ELITE") setValidationRate(20);
                      }}
                      className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="BRONZE">🥉 BRONZE (10%)</option>
                      <option value="SILVER">🥈 SILVER (12%)</option>
                      <option value="GOLD">🥇 GOLD (15%)</option>
                      <option value="ELITE">💎 ELITE (20%)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Taux de Commission (%)</label>
                    <input
                      type="number"
                      value={validationRate}
                      onChange={(e) => setValidationRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Message / Instructions d'accueil</label>
                  <textarea
                    rows={2}
                    value={validationNotes}
                    onChange={(e) => setValidationNotes(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setValidatingApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmValidation}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
                >
                  Confirmer et Activer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: REJECT CANDIDATE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {rejectingApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-base">Refuser la candidature</h3>
                <button onClick={() => setRejectingApp(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-300">
                  Êtes-vous sûr de vouloir refuser la candidature de <strong>{rejectingApp.fullName}</strong> ?
                </p>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Motif du refus</label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setRejectingApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmRejection}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs"
                >
                  Confirmer le refus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: SIGN DEAL & CALCULATE COMMISSION */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {signingProspect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">Signature de Contrat & Commission</h3>
                </div>
                <button onClick={() => setSigningProspect(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-white font-bold text-sm">{signingProspect.companyName}</p>
                  <p className="text-slate-400">Ambassadeur attribué : <strong>{signingProspect.ambassadorName}</strong> ({signingProspect.ambassadorCode})</p>
                  <p className="text-slate-400">Projet : {signingProspect.clientNeed}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Montant Signé (FCFA)</label>
                    <input
                      type="number"
                      step={500000}
                      value={signedAmountInput}
                      onChange={(e) => setSignedAmountInput(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Taux Commission (%)</label>
                    <input
                      type="number"
                      value={signedRateInput}
                      onChange={(e) => setSignedRateInput(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-purple-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* COMMISSION PREVIEW CALCULATION */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Commission Générée</span>
                    <span className="text-xs text-slate-300">À créditer pour {signingProspect.ambassadorName}</span>
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-lg">
                    {formatCurrency(Math.round(signedAmountInput * (signedRateInput / 100)), "FCFA")}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setSigningProspect(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmSignedDeal}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
                >
                  Valider Contrat & Commission
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: INSTANT MOBILE MONEY PAYOUT EXECUTOR WITH ANIMATION */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {processingPayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl"
            >
              {payoutStep === "CONFIRM" && (
                <>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-bold text-white text-base">
                        Virement {processingPayout.payoutMethod} Direct
                      </h3>
                    </div>
                    <button onClick={() => setProcessingPayout(null)} className="text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Montant du Virement</span>
                      <p className="text-2xl font-black font-mono text-emerald-400">
                        {formatCurrency(processingPayout.amountFCFA, "FCFA")}
                      </p>
                      <p className="text-white font-bold">{processingPayout.ambassadorName}</p>
                      <p className="text-slate-400 font-mono">{processingPayout.payoutPhone}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <p>• Débit automatique du compte de trésorerie SEN AURA TECH</p>
                      <p>• Notification SMS et reçu officiel émis à l'ambassadeur</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setProcessingPayout(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleExecutePayoutAnimation}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Envoyer {formatCurrency(processingPayout.amountFCFA, "FCFA")}</span>
                    </button>
                  </div>
                </>
              )}

              {payoutStep === "PROCESSING" && (
                <div className="p-8 text-center space-y-6">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin" />
                    <Smartphone className="w-8 h-8 text-emerald-400" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-black text-white text-base">Connexion API {processingPayout.payoutMethod}...</h4>
                    <p className="text-xs text-slate-400">
                      Transfert de fonds sécurisé vers le {processingPayout.payoutPhone}
                    </p>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <motion.div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${payoutProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {payoutStep === "SUCCESS" && (
                <div className="p-4 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-white">Versement Effectué avec Succès !</h4>
                    <p className="text-xs text-slate-300">
                      Le montant de <strong>{formatCurrency(processingPayout.amountFCFA, "FCFA")}</strong> a été viré sur le compte {processingPayout.payoutMethod} ({processingPayout.payoutPhone}) de {processingPayout.ambassadorName}.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-left space-y-1 text-slate-300">
                    <p><strong>Référence TX :</strong> {payoutTxRef}</p>
                    <p><strong>Opérateur :</strong> {processingPayout.payoutMethod} Business API SN</p>
                    <p><strong>Horodatage :</strong> {new Date().toLocaleTimeString("fr-FR")}</p>
                  </div>

                  <button
                    onClick={() => {
                      setProcessingPayout(null);
                      setPayoutStep("CONFIRM");
                    }}
                    className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
                  >
                    Fermer et Actualiser
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 5: NEW PROSPECT CREATION BY ADMIN */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isNewProspectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-base">Déclarer un Prospect (Attribution Ambassadeur)</h3>
                </div>
                <button onClick={() => setIsNewProspectModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProspect} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Nom Entreprise *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Hôtel Terrou-Bi"
                      value={newProspectForm.companyName}
                      onChange={(e) => setNewProspectForm({ ...newProspectForm, companyName: e.target.value })}
                      className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Nom Contact *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: M. Ousmane Diop"
                      value={newProspectForm.contactName}
                      onChange={(e) => setNewProspectForm({ ...newProspectForm, contactName: e.target.value })}
                      className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Téléphone Contact *</label>
                    <input
                      type="text"
                      required
                      placeholder="+221 77 000 00 00"
                      value={newProspectForm.phone}
                      onChange={(e) => setNewProspectForm({ ...newProspectForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Secteur d'activité</label>
                    <select
                      value={newProspectForm.sector}
                      onChange={(e) => setNewProspectForm({ ...newProspectForm, sector: e.target.value })}
                      className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Hôtellerie & Tourisme">Hôtellerie & Tourisme</option>
                      <option value="Santé & Médical">Santé & Médical</option>
                      <option value="Industrie & BTP">Industrie & BTP</option>
                      <option value="Agrobusiness">Agrobusiness</option>
                      <option value="Services Juridiques & B2B">Services Juridiques & B2B</option>
                      <option value="Éducation & Universités">Éducation & Universités</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Besoin ou Solution visée</label>
                  <input
                    type="text"
                    placeholder="Ex: Centrale solaire 30kVA + Vidéosurveillance IP"
                    value={newProspectForm.clientNeed}
                    onChange={(e) => setNewProspectForm({ ...newProspectForm, clientNeed: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Budget Estimé (FCFA)</label>
                    <input
                      type="number"
                      step={500000}
                      value={newProspectForm.estimatedBudgetFCFA}
                      onChange={(e) => setNewProspectForm({ ...newProspectForm, estimatedBudgetFCFA: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Ambassadeur Attribué</label>
                    <select
                      value={newProspectForm.ambassadorId}
                      onChange={(e) => {
                        const amb = applications.find(a => a.ambassadorCode === e.target.value || a.id === e.target.value);
                        setNewProspectForm({
                          ...newProspectForm,
                          ambassadorId: e.target.value,
                          ambassadorName: amb ? amb.fullName : "Mamadou Sow (Edu)",
                          ambassadorCode: amb?.ambassadorCode || "SAT-AMB-0025"
                        });
                      }}
                      className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    >
                      {applications.filter(a => a.status === "VALIDE").map(a => (
                        <option key={a.id} value={a.ambassadorCode || a.id}>
                          {a.fullName} ({a.ambassadorCode || a.id})
                        </option>
                      ))}
                      {applications.filter(a => a.status === "VALIDE").length === 0 && (
                        <option value="SAT-AMB-0025">Mamadou Sow (Edu) (SAT-AMB-0025)</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewProspectModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
                  >
                    Enregistrer Prospect
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
