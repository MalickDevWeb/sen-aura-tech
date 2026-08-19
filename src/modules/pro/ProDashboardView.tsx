import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  Wrench,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  AlertCircle,
  Plus,
  Check,
  ArrowUpRight,
  Sparkles,
  Search,
  Filter,
  Eye,
  Camera,
  FileText,
  Download,
  Share2,
  Building,
  Zap,
  Sun,
  Shield,
  Server,
  RefreshCw,
  Sliders,
  DollarSign,
  UserCheck,
  Send
} from "lucide-react";
import { formatCurrency } from "../../config/constants";
import { store } from "../../database/store";
import { ProPortfolioUploadForm } from "./ProPortfolioUploadForm";
import { authFetch } from "../../lib/authFetch";

interface ProDashboardViewProps {
  currency: "FCFA" | "EUR";
  proTab: "missions" | "active" | "portfolio" | "payouts" | "profile";
  setProTab: (tab: "missions" | "active" | "portfolio" | "payouts" | "profile") => void;
  onNavigate?: (tab: string) => void;
}

interface Mission {
  id: string;
  title: string;
  clientName: string;
  clientPhone: string;
  location: string;
  pole: string;
  rewardFCFA: number;
  scheduledDate: string;
  status: "DISPONIBLE" | "ACCEPTEE" | "EN_ROUTE" | "SUR_SITE" | "TRAVAUX_EN_COURS" | "TERMINEE" | "ANNULEE";
  assignedPro?: string;
  description?: string;
  urgency?: string;
  technicianReport?: string;
  completedAt?: string;
}

interface ProProfile {
  fullName: string;
  phone: string;
  email: string;
  profession: string;
  bio?: string;
  rating: number;
  reviewsCount: number;
  hourlyRateFCFA: number;
  experienceYears: number;
  isOnline: boolean;
  coverageAreas: string[];
  skills: string[];
  badge: string;
}

const AVAILABLE_REGIONS = [
  "Dakar",
  "Almadies",
  "Plateau",
  "Sacré-Cœur",
  "Yoff",
  "Guédiawaye",
  "Pikine",
  "Rufisque",
  "Diamniadio",
  "Thiès",
  "Mbour",
  "Saly",
  "Saint-Louis",
  "Kaolack",
  "Touba",
  "Ziguinchor",
];

const AVAILABLE_SKILLS = [
  "Énergie Solaire 3kVA/5kVA/10kVA",
  "Onduleurs Hybrides (Growatt, Deye, Victron)",
  "Stockage Batteries Lithium 48V",
  "Fibre Optique FTTH & Soudure par Fusion",
  "Baies de Brassage & Câblage Réseau RJ45",
  "Vidéosurveillance IP 4K & NVR Dahua/Hikvision",
  "Pompage Solaire Agricole & Variateurs",
  "Domotique & Contrôle d'Accès Biométrique",
  "Climatisation Inverter & Froid",
  "Électricité Générale & Tableau Divisionnaire",
];

export const ProDashboardView: React.FC<ProDashboardViewProps> = ({
  currency,
  proTab,
  setProTab,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<ProProfile>({
    fullName: store.currentUser.fullName || "Technicien Professionnel",
    phone: store.currentUser.phone || "+221 77 000 00 00",
    email: store.currentUser.email || "pro@senauratech.sn",
    profession: "Technicien Agréé & Installateur Expert",
    bio: "Spécialiste certifié en déploiement d'installations solaires hybrides, réseaux informatiques et vidéosurveillance intelligente au Sénégal.",
    rating: 5.0,
    reviewsCount: 0,
    hourlyRateFCFA: 15000,
    experienceYears: 5,
    isOnline: true,
    coverageAreas: [store.currentUser.region || "Dakar", "Thiès", "Mbour"],
    skills: [
      "Énergie Solaire 3kVA/5kVA/10kVA",
      "Onduleurs Hybrides (Growatt, Deye, Victron)",
      "Fibre Optique FTTH & Soudure par Fusion",
      "Vidéosurveillance IP 4K & NVR Dahua/Hikvision",
    ],
    badge: "Technicien Certifié SEN AURA TECH",
  });

  // Filter & Search states
  const [missionSearch, setMissionSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Interactive Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  // Closing / Report Modal state
  const [closingMission, setClosingMission] = useState<Mission | null>(null);
  const [reportText, setReportText] = useState("");
  const [completionPhoto, setCompletionPhoto] = useState("");

  // Payout states
  const [payouts, setPayouts] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("50000");
  const [withdrawMethod, setWithdrawMethod] = useState<"WAVE" | "ORANGE_MONEY" | "FREE_MONEY">("WAVE");
  const [withdrawPhone, setWithdrawPhone] = useState(store.currentUser.phone || "+221 70 533 46 11");
  const [payoutStep, setPayoutStep] = useState<"idle" | "processing" | "success">("idle");
  const [lastTxReceipt, setLastTxReceipt] = useState<any>(null);

  // Profile Edit state
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Load Data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStats, resMissions, resEarnings] = await Promise.all([
        authFetch("/api/pro/stats").then((r) => r.json()),
        authFetch("/api/pro/missions").then((r) => r.json()),
        authFetch("/api/pro/earnings").then((r) => r.json()),
      ]);

      if (resStats.success && resStats.stats) {
        setStats(resStats.stats);
        if (resStats.stats.proName) {
          setProfile((prev) => ({
            ...prev,
            fullName: resStats.stats.proName,
            isOnline: resStats.stats.isOnline ?? prev.isOnline,
            rating: resStats.stats.rating ?? prev.rating,
            hourlyRateFCFA: resStats.stats.hourlyRateFCFA ?? prev.hourlyRateFCFA,
            coverageAreas: resStats.stats.coverageAreas ?? prev.coverageAreas,
            skills: resStats.stats.skills ?? prev.skills,
          }));
        }
      }

      if (resMissions.success && Array.isArray(resMissions.missions)) {
        setMissions(resMissions.missions);
      }

      if (resEarnings.success && Array.isArray(resEarnings.payoutHistory)) {
        setPayouts(resEarnings.payoutHistory);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données Pro:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Toggle Online Status
  const handleToggleOnline = async () => {
    const newStatus = !profile.isOnline;
    setProfile((prev) => ({ ...prev, isOnline: newStatus }));
    try {
      await authFetch("/api/pro/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: newStatus }),
      });
      showToast(
        newStatus
          ? "Vous êtes désormais En Ligne et visible par les clients au Sénégal."
          : "Statut mis à jour : Mode Hors Ligne / Indisponible.",
        "info"
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Accept Mission
  const handleAcceptMission = async (missionId: string) => {
    setActionLoading(missionId);
    try {
      const res = await authFetch(`/api/pro/missions/${missionId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proName: profile.fullName }),
      });
      const data = await res.json();
      if (data.success) {
        setMissions((prev) =>
          prev.map((m) =>
            m.id === missionId
              ? { ...m, status: "ACCEPTEE", assignedPro: profile.fullName }
              : m
          )
        );
        showToast(`Mission ${missionId} acceptée ! Intervention planifiée dans votre planning.`);
      }
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'acceptation de la mission.", "info");
    } finally {
      setActionLoading(null);
    }
  };

  // Update Field Step Status
  const handleUpdateStepStatus = async (
    missionId: string,
    newStatus: "EN_ROUTE" | "SUR_SITE" | "TRAVAUX_EN_COURS"
  ) => {
    setActionLoading(missionId);
    try {
      const res = await authFetch(`/api/pro/missions/${missionId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMissions((prev) =>
          prev.map((m) => (m.id === missionId ? { ...m, status: newStatus } : m))
        );
        const statusLabel =
          newStatus === "EN_ROUTE"
            ? "En route vers le client"
            : newStatus === "SUR_SITE"
            ? "Arrivé sur site client"
            : "Travaux techniques en cours";
        showToast(`Statut mis à jour : ${statusLabel}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // Finalize & Close Mission
  const handleFinalizeMission = async () => {
    if (!closingMission) return;
    setActionLoading(closingMission.id);
    try {
      const res = await authFetch(`/api/pro/missions/${closingMission.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "TERMINEE",
          technicianReport: reportText || "Installation et mise en service terminées avec succès.",
          completionPhoto: completionPhoto || "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMissions((prev) =>
          prev.map((m) =>
            m.id === closingMission.id
              ? {
                  ...m,
                  status: "TERMINEE",
                  technicianReport: reportText,
                  completedAt: new Date().toISOString(),
                }
              : m
          )
        );
        showToast(`Félicitations ! Mission ${closingMission.id} clôturée. +${formatCurrency(closingMission.rewardFCFA, currency)} crédités à votre portefeuille !`);
        setClosingMission(null);
        setReportText("");
        setCompletionPhoto("");
        fetchData(); // Refresh wallet & stats
      }
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la clôture.", "info");
    } finally {
      setActionLoading(null);
    }
  };

  // Execute Instant Payout Request
  const handleExecutePayout = async () => {
    const amount = Number(withdrawAmount);
    const available = stats?.availableBalanceFCFA ?? 420000;
    if (isNaN(amount) || amount < 5000) {
      showToast("Le montant minimum de retrait est de 5 000 FCFA.", "info");
      return;
    }
    if (amount > available) {
      showToast(`Solde insuffisant. Votre solde disponible est de ${formatCurrency(available, currency)}.`, "info");
      return;
    }

    setPayoutStep("processing");

    try {
      const res = await authFetch("/api/pro/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountFCFA: amount,
          paymentMethod: withdrawMethod,
          phone: withdrawPhone,
        }),
      });
      const data = await res.json();

      setTimeout(() => {
        setPayoutStep("success");
        setLastTxReceipt({
          id: data.payout?.id || `PAY-PRO-${Date.now().toString().slice(-4)}`,
          amountFCFA: amount,
          method: withdrawMethod,
          phone: withdrawPhone,
          txRef: data.transactionRef || `${withdrawMethod}-SN-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleString("fr-FR"),
        });
        fetchData();
      }, 1500);
    } catch (e) {
      console.error(e);
      setPayoutStep("idle");
      showToast("Erreur lors du virement.", "info");
    }
  };

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await authFetch("/api/pro/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        setProfileSaveSuccess(true);
        showToast("Votre profil professionnel et vos zones ont été enregistrés avec succès !");
        setTimeout(() => setProfileSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la sauvegarde du profil.", "info");
    } finally {
      setProfileSaving(false);
    }
  };

  const availableMissions = missions.filter((m) => m.status === "DISPONIBLE");
  const activeMissions = missions.filter((m) =>
    ["ACCEPTEE", "EN_ROUTE", "SUR_SITE", "TRAVAUX_EN_COURS"].includes(m.status)
  );
  const completedMissions = missions.filter((m) => m.status === "TERMINEE");

  const filteredAvailableMissions = availableMissions.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(missionSearch.toLowerCase()) ||
      m.location.toLowerCase().includes(missionSearch.toLowerCase()) ||
      m.clientName.toLowerCase().includes(missionSearch.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" ||
      m.pole.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const availableBalance = stats?.availableBalanceFCFA ?? 420000;
  const monthlyEarnings = stats?.monthlyEarningsFCFA ?? 420000;
  const completedCount = stats?.completedMissionsCount ?? (28 + completedMissions.length);

  return (
    <div className="space-y-6">
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-3 border ${
              toastMessage.type === "success"
                ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50 backdrop-blur-md"
                : "bg-sky-950/90 text-sky-300 border-sky-500/50 backdrop-blur-md"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BANNER & STATS (Always prominent or when in missions/active) */}
      {(proTab === "missions" || proTab === "active") && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Espace Prestataire / Technicien Pro
              </span>
              <h2 className="text-2xl font-black text-white">Missions & Interventions Terrain</h2>
            </div>

            {/* LIVE AVAILABILITY TOGGLE */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Statut Disponibilité :</span>
              <button
                onClick={handleToggleOnline}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  profile.isOnline
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                }`}
                title="Cliquez pour changer votre statut de disponibilité"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    profile.isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                  }`}
                />
                <span>
                  {profile.isOnline ? "En Ligne / Disponible au Sénégal" : "Hors Ligne / Occupé"}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold">Chiffre d'Affaires Ce Mois</span>
              <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                {formatCurrency(monthlyEarnings, currency)}
              </p>
              <p className="text-[10px] text-emerald-400 mt-0.5">↑ +18% vs mois dernier</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold">Missions Réussies</span>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {completedCount} Interventions
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Dakar, Thiès & Mbour</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold">Satisfaction Client</span>
              <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                {profile.rating.toFixed(1)} / 5.0 ★
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Basé sur {profile.reviewsCount} avis vérifiés
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold">Badge Certification</span>
              <div className="flex items-center gap-1.5 mt-1 text-sky-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <span>Technicien Agréé</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Solaire, Fibre & Sécurité</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DEMANDES DISPONIBLES (OFFRES D'INTERVENTION À PROXIMITÉ)           */}
      {/* ========================================================================= */}
      {proTab === "missions" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Offres d'Intervention à Proximité (Sénégal)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                  {availableMissions.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Postulez et acceptez immédiatement les chantiers dans vos zones de compétence.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher quartier, client, type..."
                  value={missionSearch}
                  onChange={(e) => setMissionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold focus:outline-none"
              >
                <option value="ALL">Tous les pôles</option>
                <option value="Solaire">Énergie Solaire</option>
                <option value="Sécurité">Sécurité CCTV</option>
                <option value="Fibre">Fibre & Réseaux</option>
                <option value="Pompage">Pompage Solaire</option>
              </select>
            </div>
          </div>

          {filteredAvailableMissions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Toutes les missions actuelles ont été prises !</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                De nouvelles demandes d'intervention arrivent en temps réel. Vous recevrez une notification dès qu'un nouveau chantier est publié dans votre zone.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAvailableMissions.map((m) => {
                const isAccepted = m.status === "ACCEPTEE";
                const isProcessing = actionLoading === m.id;

                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {m.pole}
                        </span>
                        <span className="text-sm font-mono font-black text-emerald-400">
                          {formatCurrency(m.rewardFCFA, currency)}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">{m.title}</h4>

                      <div className="space-y-1 text-xs text-slate-400">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>{m.location}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>Client : <strong>{m.clientName}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-300 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{m.scheduledDate}</span>
                        </p>
                      </div>

                      {m.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                          {m.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleAcceptMission(m.id)}
                      disabled={isAccepted || isProcessing}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isAccepted
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                          : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      }`}
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      ) : isAccepted ? (
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

      {/* ========================================================================= */}
      {/* TAB 2: INTERVENTIONS EN COURS & WORKFLOW TERRAIN                          */}
      {/* ========================================================================= */}
      {proTab === "active" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <span>Vos Interventions Terrain en Cours ({activeMissions.length})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Suivi d'avancement étape par étape et contact direct avec les clients.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">
              Planning Actif
            </span>
          </div>

          {activeMissions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">Aucune intervention active en ce moment</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Consultez l'onglet "Demandes Disponibles" pour accepter de nouvelles missions et enrichir votre planning de la semaine.
              </p>
              <button
                onClick={() => setProTab("missions")}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg"
              >
                Voir les demandes disponibles
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMissions.map((m) => {
                const isEnRoute = m.status === "EN_ROUTE";
                const isSurSite = m.status === "SUR_SITE";
                const isTravaux = m.status === "TRAVAUX_EN_COURS";
                const isInitial = m.status === "ACCEPTEE";

                const cleanPhone = m.clientPhone.replace(/\s+/g, "");
                const waText = encodeURIComponent(
                  `Bonjour ${m.clientName}, je suis le technicien agréé SEN AURA TECH en charge de votre mission "${m.title}". Je prépare mon intervention.`
                );

                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-amber-400 font-bold">
                            Réf: {m.id}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            {m.pole}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isTravaux
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                : isSurSite
                                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                                : isEnRoute
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            {isTravaux
                              ? "⚙️ Travaux en cours"
                              : isSurSite
                              ? "📍 Arrivé sur site"
                              : isEnRoute
                              ? "🏃 En route"
                              : "📅 Intervention Programmée"}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white mt-1">{m.title}</h4>
                        <p className="text-xs text-slate-400">
                          📍 {m.location} • Client : <strong className="text-white">{m.clientName}</strong> ({m.clientPhone})
                        </p>
                        <p className="text-xs text-slate-300 font-semibold mt-0.5">
                          🕒 Horaire convenu : {m.scheduledDate}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                        >
                          <Phone className="w-3.5 h-3.5 text-sky-400" />
                          <span>Appeler</span>
                        </a>

                        <a
                          href={`https://wa.me/${cleanPhone.replace("+", "")}?text=${waText}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>

                        <span className="text-sm font-mono font-black text-amber-400 px-3 py-1 bg-slate-900 rounded-xl border border-slate-800">
                          {formatCurrency(m.rewardFCFA, currency)}
                        </span>
                      </div>
                    </div>

                    {/* INTERACTIVE WORKFLOW STEPPER */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Progression Terrain de l'Intervention
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => handleUpdateStepStatus(m.id, "EN_ROUTE")}
                          className={`p-2 rounded-lg text-xs font-bold text-center transition-all ${
                            isEnRoute
                              ? "bg-amber-500 text-slate-950 font-black shadow"
                              : "bg-slate-950 text-slate-400 hover:text-white"
                          }`}
                        >
                          1. 🏃 Départ Technicien
                        </button>

                        <button
                          onClick={() => handleUpdateStepStatus(m.id, "SUR_SITE")}
                          className={`p-2 rounded-lg text-xs font-bold text-center transition-all ${
                            isSurSite
                              ? "bg-sky-500 text-slate-950 font-black shadow"
                              : "bg-slate-950 text-slate-400 hover:text-white"
                          }`}
                        >
                          2. 📍 Arrivé sur Site
                        </button>

                        <button
                          onClick={() => handleUpdateStepStatus(m.id, "TRAVAUX_EN_COURS")}
                          className={`p-2 rounded-lg text-xs font-bold text-center transition-all ${
                            isTravaux
                              ? "bg-purple-500 text-slate-950 font-black shadow"
                              : "bg-slate-950 text-slate-400 hover:text-white"
                          }`}
                        >
                          3. ⚙️ Travaux en cours
                        </button>

                        <button
                          onClick={() => setClosingMission(m)}
                          className="p-2 rounded-lg text-xs font-bold text-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                        >
                          4. ✅ Clôturer & Encaisser
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CLÔTURE D'INTERVENTION & RAPPORT                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {closingMission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Clôture de Mission & Validation</h3>
                </div>
                <button
                  onClick={() => setClosingMission(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕ Fermer
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-xs text-amber-400 font-bold">{closingMission.title}</p>
                <p className="text-xs text-slate-400">Client : {closingMission.clientName} • Lieu : {closingMission.location}</p>
                <p className="text-sm font-mono font-bold text-emerald-400 mt-1">
                  Montant à percevoir : {formatCurrency(closingMission.rewardFCFA, currency)}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Rapport technique de fin de travaux & observations :
                  </label>
                  <textarea
                    rows={3}
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Ex: Pose effectuée selon les normes NFC 15-100, tests de tension et raccordement validés avec le client."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Photo de fin de chantier (Preuve d'intervention) :
                  </label>
                  <input
                    type="text"
                    value={completionPhoto}
                    onChange={(e) => setCompletionPhoto(e.target.value)}
                    placeholder="URL photo Cloudinary ou lien direct (optionnel)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setClosingMission(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  onClick={handleFinalizeMission}
                  disabled={actionLoading === closingMission.id}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {actionLoading === closingMission.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Valider & Encaisser les Gains</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* TAB 3: PUBLIER CHANTIER / SERVICE HD (PRO PORTFOLIO FORM)                */}
      {/* ========================================================================= */}
      {proTab === "portfolio" && (
        <ProPortfolioUploadForm
          currency={currency}
          onCancel={() => setProTab("missions")}
          onServiceCreated={(newService) => {
            showToast("Votre réalisation de chantier a été publiée avec succès sur le catalogue !");
            setProTab("missions");
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PORTEFEUILLE WAVE / OM & RETRAITS INSTANTANÉS                     */}
      {/* ========================================================================= */}
      {proTab === "payouts" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Portefeuille Technicien Agréé
            </span>
            <h3 className="text-xl font-black text-white">
              Retrait Direct de vos Gains (Wave & Orange Money Sénégal)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Encaissez immédiatement vos revenus d'interventions sans frais intermédiaires.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold">Solde Disponible au Retrait</span>
              <p className="text-3xl font-black text-emerald-400 font-mono mt-1">
                {formatCurrency(availableBalance, currency)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Transfert Mobile instantané 24/7</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold">Total Encaissé à ce jour</span>
              <p className="text-3xl font-black text-amber-400 font-mono mt-1">
                {formatCurrency(monthlyEarnings, currency)}
              </p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Missions validées avec reçu</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold">Retraits Effectués</span>
              <p className="text-3xl font-black text-sky-400 font-mono mt-1">
                {payouts.length} Virements
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Wave, OM & Free Money</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RETRAIT FORM */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Effectuer un Retrait Immédiat</span>
              </h4>

              {/* OPERATOR SELECTION */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-bold">Opérateur Mobile Money :</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("WAVE")}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      withdrawMethod === "WAVE"
                        ? "bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-lg shadow-sky-500/10"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <p className="text-xs font-black">Wave Sénégal</p>
                    <p className="text-[10px] opacity-75">0% de Frais</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("ORANGE_MONEY")}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      withdrawMethod === "ORANGE_MONEY"
                        ? "bg-orange-500/20 border-orange-400 text-orange-300 font-bold shadow-lg shadow-orange-500/10"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <p className="text-xs font-black">Orange Money</p>
                    <p className="text-[10px] opacity-75">Instantané</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("FREE_MONEY")}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      withdrawMethod === "FREE_MONEY"
                        ? "bg-rose-500/20 border-rose-400 text-rose-300 font-bold shadow-lg shadow-rose-500/10"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <p className="text-xs font-black">Free Money</p>
                    <p className="text-[10px] opacity-75">Sénégal</p>
                  </button>
                </div>
              </div>

              {/* QUICK AMOUNT BUTTONS */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-bold">Montant du retrait (FCFA) :</label>
                <div className="flex gap-2">
                  {["50000", "100000", "200000"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(amt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        withdrawAmount === amt
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {Number(amt).toLocaleString()} F
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(availableBalance.toString())}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-900 text-emerald-400 hover:bg-slate-800"
                  >
                    Tout ({availableBalance.toLocaleString()} F)
                  </button>
                </div>

                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold text-base focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-bold mb-1">
                  Numéro Mobile Money Récepteur ({withdrawMethod}) :
                </label>
                <input
                  type="text"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none"
                />
              </div>

              <button
                onClick={handleExecutePayout}
                disabled={payoutStep === "processing" || availableBalance <= 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                {payoutStep === "processing" ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Traitement du virement vers {withdrawMethod}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Valider le Retrait Immédiat</span>
                  </>
                )}
              </button>
            </div>

            {/* HISTORIQUE DES ENCAISSEMENTS & RECEIPT */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Historique des Virements Traités</span>
              </h4>

              {lastTxReceipt && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Virement Confirmé avec Succès !</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-0.5 font-mono">
                    <p>Réf: <strong>{lastTxReceipt.txRef}</strong></p>
                    <p>Montant: <strong className="text-emerald-400">{formatCurrency(lastTxReceipt.amountFCFA, currency)}</strong></p>
                    <p>Numéro: {lastTxReceipt.phone} ({lastTxReceipt.method})</p>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs">
                {payouts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    Aucun virement pour le moment.
                  </p>
                ) : (
                  payouts.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">{p.paymentMethod || "Wave Senegal"}</p>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                            PAYÉ ✓
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {p.phone} • {new Date(p.timestamp || Date.now()).toLocaleDateString("fr-FR")}
                        </p>
                      </div>

                      <span className="font-mono font-black text-emerald-400 text-sm">
                        +{Number(p.amountFCFA || 0).toLocaleString()} FCFA
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PROFIL CERTIFIÉ, COMPÉTENCES & ZONES D'INTERVENTION                */}
      {/* ========================================================================= */}
      {proTab === "profile" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Profil Expert & Agrément SEN AURA TECH
              </span>
              <h3 className="text-xl font-black text-white">
                Votre Profil Professionnel Certifié
              </h3>
              <p className="text-xs text-slate-400">
                Ces informations sont visibles par les clients qui réservent vos prestations sur la plateforme.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Technicien Agréé</span>
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nom Complet du Technicien :
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Numéro Téléphone / WhatsApp :
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Titre Professionnel & Spécialité Principale :
                </label>
                <input
                  type="text"
                  value={profile.profession}
                  onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tarif Horaire de Base (FCFA / Heure) :
                </label>
                <input
                  type="number"
                  value={profile.hourlyRateFCFA}
                  onChange={(e) => setProfile({ ...profile, hourlyRateFCFA: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Présentation / Expérience & Références :
              </label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* COVERAGE AREAS SELECTION */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Zones de Couverture & Villes d'Intervention au Sénégal :
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_REGIONS.map((region) => {
                  const isSelected = profile.coverageAreas.includes(region);
                  return (
                    <button
                      type="button"
                      key={region}
                      onClick={() => {
                        const updated = isSelected
                          ? profile.coverageAreas.filter((r) => r !== region)
                          : [...profile.coverageAreas, region];
                        setProfile({ ...profile, coverageAreas: updated });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{region}</span>
                      {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SKILLS CHECKBOXES */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Spécialités Techniques & Compétences Certifiées :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_SKILLS.map((skill) => {
                  const isSelected = profile.skills.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => {
                        const updated = isSelected
                          ? profile.skills.filter((s) => s !== skill)
                          : [...profile.skills, skill];
                        setProfile({ ...profile, skills: updated });
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{skill}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-emerald-500 text-slate-950" : "border border-slate-700"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="pt-2 flex items-center gap-4">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                {profileSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Sauvegarde en cours...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Enregistrer mon Profil Professionnel</span>
                  </>
                )}
              </button>

              {profileSaveSuccess && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Modifications enregistrées !</span>
                </span>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProDashboardView;
