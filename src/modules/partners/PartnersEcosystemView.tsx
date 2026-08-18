import React, { useState } from "react";
import { savePartnerApplicationToFirestore } from "../../lib/firestore-service";
import { useSystemConfig } from "../../config/system-config";
import {
  Users,
  Award,
  Sparkles,
  Calculator,
  TrendingUp,
  Share2,
  Gift,
  ShieldCheck,
  Zap,
  MessageSquare,
  BookOpen,
  Cpu,
  Heart,
  ChevronRight,
  CheckCircle2,
  Star,
  Trophy,
  ArrowRight,
  UserPlus,
  Send,
  Building,
  Target,
  ExternalLink,
  Phone,
  Flame,
  Globe,
  Layers
} from "lucide-react";
import { formatCurrency, BRAND_CONFIG } from "../../config/constants";
import { PoleType } from "../../shared/contracts/types";

interface PartnersEcosystemViewProps {
  currency: "FCFA" | "EUR";
  onOpenQuoteModal: (pole?: PoleType, title?: string) => void;
}

export const PartnersEcosystemView: React.FC<PartnersEcosystemViewProps> = ({
  currency,
  onOpenQuoteModal
}) => {
  const config = useSystemConfig();
  // Commission calculator state
  const [projectAmountFCFA, setProjectAmountFCFA] = useState<number>(500000);
  
  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [partnerForm, setPartnerForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "Dakar",
    partnerType: "Apporteur d'affaires",
    experience: "Intéressé à recommander des clients et projets SI",
  });
  const [registeredSuccess, setRegisteredSuccess] = useState<boolean>(false);

  // Impact project submission state
  const [showImpactModal, setShowImpactModal] = useState<boolean>(false);
  const [impactForm, setImpactForm] = useState({
    assocName: "",
    contactName: "",
    phone: "",
    region: "Dakar",
    description: "",
  });
  const [impactSuccess, setImpactSuccess] = useState<boolean>(false);

  // Calculate commission based on official matrix
  const calculateCommission = (amount: number) => {
    let rate = 0.10;
    if (amount > 1000000) rate = 0.20;
    else if (amount > 500000) rate = 0.15;
    else if (amount > 100000) rate = 0.12;
    return {
      rate: rate * 100,
      amount: Math.round(amount * rate)
    };
  };

  const currentCommission = calculateCommission(projectAmountFCFA);

  // Seed Partners Leaderboard
  const partnerLeaderboard = [
    { rank: 1, name: "Ibrahima Fall", role: "Top Apporteur", region: "Dakar", points: 1850, tier: "ELITE", badge: "🥇 Gold Star", earnings: "1,250,000 FCFA" },
    { rank: 2, name: "Fatou Kiné Seck", role: "Top Créateur", region: "Thiès", points: 1220, tier: "GOLD", badge: "🥈 Silver Star", earnings: "820,000 FCFA" },
    { rank: 3, name: "Moustapha Ndiaye", role: "Top Ambassadeur", region: "Saint-Louis", points: 940, tier: "GOLD", badge: "🥉 Bronze Star", earnings: "540,000 FCFA" },
    { rank: 4, name: "Aminata Sow", role: "Commercial Partenaire", region: "Ziguinchor", points: 610, tier: "SILVER", badge: "⭐ Challenger", earnings: "310,000 FCFA" },
    { rank: 5, name: "Babacar Diop", role: "Expert Partenaire (UI/UX)", region: "Dakar", points: 480, tier: "SILVER", badge: "⭐ Challenger", earnings: "240,000 FCFA" },
  ];

  // Dynamic Leadership & Cofounders from SuperAdmin System Config
  const leadershipConfig = config.leadership || {
    enabled: true,
    eyebrow: "GOUVERNANCE & ÉQUIPE FONDATRICE",
    title: "Les 5 Cofondateurs SEN AURA TECH",
    subtitle: "Une équipe solide garantissant la vision stratégique, la solidité financière et l'excellence technique.",
    items: []
  };
  const cofounders = (leadershipConfig.items && leadershipConfig.items.length > 0)
    ? leadershipConfig.items.filter(item => item.active !== false)
    : [];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-[#0B0F19] to-[#0B0F19]">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Stratégie Globale & Écosystème Partenaires</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              SEN AURA TECH <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-sky-400">
                Technologie • Communauté • Impact
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Nous ne sommes pas une simple agence de développement. Nous sommes un <strong>écosystème technologique africain</strong> réunissant 5 cofondateurs, un réseau de partenaires rémunérés au résultat, un laboratoire d'innovation IA & IoT et une académie de formation.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Rejoindre SEN AURA PARTNERS</span>
              </button>

              <a
                href="#commission-calculator"
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm transition-all flex items-center gap-2"
              >
                <Calculator className="w-5 h-5 text-amber-400" />
                <span>Calculer vos Commissions</span>
              </a>
            </div>
          </div>

          {/* KEY PILLARS STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">5</span>
              <p className="text-xs font-bold text-white">Cofondateurs Stratégiques</p>
              <p className="text-[10px] text-slate-400">Gouvernance & Excellence Tech</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">15%</span>
              <p className="text-xs font-bold text-white">Commission Moyenne</p>
              <p className="text-[10px] text-slate-400">Versée aux apporteurs d'affaires</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">1,500+</span>
              <p className="text-xs font-bold text-white">Membres Communauté</p>
              <p className="text-[10px] text-slate-400">WhatsApp & Campus Tour</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">1 / Trimestre</span>
              <p className="text-xs font-bold text-white">Projet à Impact Social</p>
              <p className="text-[10px] text-slate-400">Accompagnement gracieux</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: PROGRAMME SEN AURA PARTNERS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Réseau Rémunéré au Résultat</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              SEN AURA PARTNERS — Devenez Partenaire Économique
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Vous n'avez pas besoin d'être actionnaire pour gagner avec nous. Apportez de la valeur, générez des projets ou créez du contenu et recevez vos commissions directement par Wave ou Orange Money.
            </p>
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>S'inscrire comme Partenaire</span>
          </button>
        </div>

        {/* 5 TYPES DE PARTENAIRES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              type: "Ambassadeur",
              color: "amber",
              icon: Globe,
              desc: "Représente SEN AURA TECH dans sa région, son université ou son réseau d'affaires.",
              reward: "Badges + Bonus Réseau"
            },
            {
              type: "Créateur de Contenu",
              color: "sky",
              icon: Share2,
              desc: "Produit des vidéos TikTok/YouTube, tutoriels et visuels de démonstration.",
              reward: "Rémunération par vue / post"
            },
            {
              type: "Apporteur d'Affaires",
              color: "emerald",
              icon: TrendingUp,
              desc: "Identifie des PME, écoles ou commerces ayant besoin de digitalisation.",
              reward: "10% à 20% de commission"
            },
            {
              type: "Commercial Partenaire",
              color: "purple",
              icon: Target,
              desc: "Prospecte activement, participe aux rendez-vous et conclut les contrats.",
              reward: "Commissions + Prime d'Objectif"
            },
            {
              type: "Expert Partenaire",
              color: "indigo",
              icon: Cpu,
              desc: "Apporte des compétences pointues (UI/UX, Cybersécurité, IA, IoT) sur mission.",
              reward: "Honoraires au Projet"
            },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{item.type}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800/60">
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {item.reward}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* COMMISSION CALCULATOR & MATRIX */}
        <div id="commission-calculator" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* CALCULATOR PANEL */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Simulateur de Commission Apporteur</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Combien allez-vous gagner ?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ajustez le montant du projet signé grâce à votre recommandation pour calculer instantanément votre gain net.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300">Montant du Projet SI / Devis :</label>
                <span className="text-sm font-black font-mono text-amber-400">
                  {formatCurrency(projectAmountFCFA, currency)}
                </span>
              </div>

              <input
                type="range"
                min={50000}
                max={5000000}
                step={50000}
                value={projectAmountFCFA}
                onChange={(e) => setProjectAmountFCFA(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>50,000 FCFA</span>
                <span>1,000,000 FCFA</span>
                <span>5,000,000 FCFA</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 font-bold block">Votre Taux de Commission :</span>
                <span className="text-lg font-black text-amber-400 font-mono">{currentCommission.rate}%</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-bold block">Votre Gain d'Apporteur :</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {formatCurrency(currentCommission.amount, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const client = prompt("Nom ou entreprise de votre prospect :");
                if (client) {
                  onOpenQuoteModal("SOLUTIONS_NUMERIQUES", `Projet Apporté par Partenaire : ${client}`);
                }
              }}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Soumettre un Projet Client & Réserver ma Commission</span>
            </button>
          </div>

          {/* OFFICIAL MATRIX TABLE */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Grille Officielle des Commissions SEN AURA TECH</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Transparence totale : Les commissions sont versées dès l'encaissement du premier acompte du client.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 font-mono">
                  <tr>
                    <th className="p-3 rounded-l-xl">Tranche du Projet</th>
                    <th className="p-3">Commission %</th>
                    <th className="p-3 rounded-r-xl">Exemple de Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-3 font-semibold text-white">≤ 100 000 FCFA</td>
                    <td className="p-3 font-mono font-bold text-amber-400">10 %</td>
                    <td className="p-3 font-mono text-emerald-400">10 000 FCFA</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">100 001 – 500 000 FCFA</td>
                    <td className="p-3 font-mono font-bold text-amber-400">12 %</td>
                    <td className="p-3 font-mono text-emerald-400">60 000 FCFA</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">500 001 – 1 000 000 FCFA</td>
                    <td className="p-3 font-mono font-bold text-amber-400">15 %</td>
                    <td className="p-3 font-mono text-emerald-400">150 000 FCFA</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">&gt; 1 000 000 FCFA</td>
                    <td className="p-3 font-mono font-bold text-amber-400">20 %</td>
                    <td className="p-3 font-mono text-emerald-400">400 000 FCFA +</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>Validation Contractuelle & Paiements Instantanés</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Chaque projet fait l'objet d'un numéro de suivi unique. Vous recevez un contrat d'apporteur simplifié et vos fonds directement sur votre compte mobile money.
              </p>
            </div>
          </div>
        </div>

        {/* GAMIFICATION & TIERS */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Système de Points & Classement Gamifié</span>
            </div>
            <h3 className="text-2xl font-black text-white">Accumulez des Points et Débloquez des Statuts Exclusifs</h3>
            <p className="text-xs text-slate-400">
              Gagnez des points à chaque recommandation, vidéo publiée, projet signé ou participation aux hackathons.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { level: "Bronze", points: "100 pts", color: "amber", perk: "Commission de base + Badge Membre" },
              { level: "Silver", points: "300 pts", color: "slate", perk: "+2% Bonus Commission + Formations Gratuites" },
              { level: "Gold", points: "700 pts", color: "yellow", perk: "+5% Bonus Commission + Événements VIP" },
              { level: "Elite", points: "1,500 pts", color: "purple", perk: "Accès Prioritaire Projets Grands Comptes + Prime" },
            ].map((tier, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Niveau {idx + 1}</span>
                <h4 className="text-xl font-black text-amber-400">{tier.level}</h4>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-xs font-mono font-bold">
                  {tier.points}
                </div>
                <p className="text-xs text-slate-300 pt-2 border-t border-slate-800/80">{tier.perk}</p>
              </div>
            ))}
          </div>

          {/* LEADERBOARD TABLE */}
          <div className="pt-4 space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>🏆 SEN AURA PARTNERS RANKING — Classement du Mois</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 font-mono">
                  <tr>
                    <th className="p-3">Rang</th>
                    <th className="p-3">Partenaire</th>
                    <th className="p-3">Rôle</th>
                    <th className="p-3">Région</th>
                    <th className="p-3">Points</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Gains Cumulés</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {partnerLeaderboard.map((p) => (
                    <tr key={p.rank} className="hover:bg-slate-850">
                      <td className="p-3 font-black text-amber-400 font-mono">#{p.rank}</td>
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span>{p.name}</span>
                        <span className="text-[10px] text-amber-300 font-normal">{p.badge}</span>
                      </td>
                      <td className="p-3 text-slate-300">{p.role}</td>
                      <td className="p-3 text-slate-400">{p.region}</td>
                      <td className="p-3 font-mono font-bold text-sky-400">{p.points} pts</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                          {p.tier}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{p.earnings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SEN AURA LAB & INNOVATION */}
      <section className="py-16 bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 text-xs font-bold">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>SEN AURA LAB — Laboratoire d'Innovation</span>
            </div>
            <h2 className="text-3xl font-black text-white">Nous N'Utilisons Pas la Technologie : Nous l'Expérimentons</h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Découvrez nos projets R&D en cours développés à Dakar : IA Générative locale, solutions offline, objets connectés IoT et architectures multi-tenant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Assistant IA Wolof & Français",
                tag: "IA Générative",
                desc: "LLM optimisé pour la synthèse vocale et le traitement des dialectes locaux pour l'inclusivité numérique.",
                status: "En Bêta Test"
              },
              {
                title: "Plateforme Offline-First",
                tag: "Solutions Web & SMS",
                desc: "Application d'entreprise fonctionnant sans connexion Internet stable avec synchronisation SMS.",
                status: "Déployé PME"
              },
              {
                title: "IoT Solaire & Capteurs Smart",
                tag: "Énergie & Domotique",
                desc: "Module de suivi télémétrique du rendement solaire et des pompes à eau agricoles.",
                status: "Prototype Validé"
              },
              {
                title: "Multi-Tenant SaaS Engine",
                tag: "Cloud Architecture",
                desc: "Moteur de création instantanée de boutiques et plateformes pour le commerce sénégalais.",
                status: "En Production"
              },
            ].map((lab, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-300 text-[10px] font-mono font-bold border border-sky-500/20">
                    {lab.tag}
                  </span>
                  <h3 className="text-base font-bold text-white">{lab.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{lab.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-amber-400">{lab.status}</span>
                  <button
                    onClick={() => alert(`Projet R&D "${lab.title}" : Contactez le SEN AURA LAB pour un partenariat de test.`)}
                    className="text-slate-300 hover:text-white flex items-center gap-1 font-bold text-[11px]"
                  >
                    <span>Explorer</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: SEN AURA COMMUNITY & WHATSAPP HUB */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>SEN AURA COMMUNITY & WhatsApp Hub</span>
            </div>

            <h2 className="text-3xl font-black text-white">
              Une Communauté Active de Développeurs & Entrepreneurs
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Rejoignez nos canaux WhatsApp thématiques pour échanger sur le code, trouver des missions en freelance, participer aux hackathons et suivre le <strong>SEN AURA CAMPUS TOUR</strong> à Dakar, Thiès, Touba et Saint-Louis.
            </p>

            <div className="space-y-3">
              {[
                {
                  name: "SEN AURA Community Général (Groupe Officiel)",
                  desc: "Échanges tech, entraide, offres & actualités",
                  members: "1,250+ membres",
                  link: config.socials.whatsappGroup || config.homeShowcase.community.whatsappGroupLink || "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4"
                },
                { name: "SEN AURA Partners", desc: "Canal exclusif apporteurs d'affaires & opportunités", members: "320+ membres", link: "https://wa.me/221705334611?text=Je%20souhaite%20rejoindre%20SEN%20AURA%20Partners" },
                { name: "SEN AURA Academy & Étudiants", desc: "Cours, devoirs, certifications & mentoring", members: "540+ membres", link: "https://wa.me/221705334611?text=Je%20souhaite%20rejoindre%20SEN%20AURA%20Academy" },
              ].map((grp, idx) => (
                <a
                  key={idx}
                  href={grp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{grp.name}</h4>
                      <p className="text-xs text-slate-400">{grp.desc}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {grp.members}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* PROGRAM 1 PROJET A IMPACT SOCIAL */}
          <div className="lg:col-span-6 p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-bold">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>SEN AURA IMPACT — Engagement Social</span>
            </div>

            <h3 className="text-2xl font-black text-white">1 Projet à Impact Social par Trimestre</h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Chaque trimestre, SEN AURA TECH sélectionne une association locale, un groupement d'agriculteurs ou une structure éducative pour concevoir leur solution numérique <strong>à titre gracieux ou à coût fortement réduit</strong>.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Projet Sélectionné T3 2026 :</span>
              <h4 className="text-sm font-bold text-white">Association des Artisans & Femmes Commerçantes de Mbour</h4>
              <p className="text-xs text-slate-400">
                Numérisation des stocks et création d'une micro-vitrine e-commerce pour exporter leurs créations.
              </p>
            </div>

            <button
              onClick={() => setShowImpactModal(true)}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
            >
              <Heart className="w-4 h-4" />
              <span>Proposer une Association / Projet à Impact</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: COFONDATEURS & GOUVERNANCE */}
      {leadershipConfig.enabled !== false && cofounders.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 border-t border-slate-800">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{leadershipConfig.eyebrow || "Gouvernance & Équipe Fondatrice"}</span>
            </div>
            <h2 className="text-3xl font-black text-white">{leadershipConfig.title || "Les Cofondateurs SEN AURA TECH"}</h2>
            <p className="text-xs text-slate-400">
              {leadershipConfig.subtitle || "Une équipe solide de leaders sénégalais garantissant la vision stratégique, la solidité financière et l'excellence technique."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cofounders.map((cf, idx) => (
              <div 
                key={cf.id || idx} 
                className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-center space-y-3.5 transition-all shadow-lg hover:shadow-amber-500/10 flex flex-col items-center justify-between"
              >
                <div className="relative">
                  <img 
                    src={cf.avatar} 
                    alt={cf.name} 
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 sm:w-22 sm:h-22 rounded-2xl mx-auto object-cover object-top border-2 border-amber-500/40 group-hover:border-amber-400 shadow-md transition-transform group-hover:scale-105" 
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-950" title="Actif">
                    ✓
                  </span>
                </div>
                <div className="space-y-1 w-full">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{cf.name}</h3>
                  <p className="text-[11px] font-bold text-amber-400">{cf.role}</p>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed line-clamp-3">{cf.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODAL 1: REGISTER SEN AURA PARTNER */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => { setShowRegisterModal(false); setRegisteredSuccess(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            {!registeredSuccess ? (
              <>
                <div>
                  <h3 className="text-xl font-black text-white">Rejoindre SEN AURA PARTNERS</h3>
                  <p className="text-xs text-slate-400 mt-1">Inscrivez-vous pour obtenir votre identifiant d'apporteur d'affaires et commencer à percevoir vos commissions.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    savePartnerApplicationToFirestore({
                      fullName: partnerForm.fullName,
                      email: `${partnerForm.fullName.toLowerCase().replace(/\s+/g, ".")}@partner.sn`,
                      phone: partnerForm.phone,
                      profileType: partnerForm.partnerType,
                      city: partnerForm.city
                    });
                    setRegisteredSuccess(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Nom complet :</label>
                    <input
                      type="text"
                      required
                      placeholder="Mamadou Sow"
                      value={partnerForm.fullName}
                      onChange={(e) => setPartnerForm({ ...partnerForm, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Téléphone (Wave/OM) :</label>
                      <input
                        type="tel"
                        required
                        placeholder="+221 77 000 11 22"
                        value={partnerForm.phone}
                        onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Ville / Région :</label>
                      <select
                        value={partnerForm.city}
                        onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="Dakar">Dakar</option>
                        <option value="Thiès">Thiès</option>
                        <option value="Saint-Louis">Saint-Louis</option>
                        <option value="Ziguinchor">Ziguinchor</option>
                        <option value="Touba">Touba / Mbacké</option>
                        <option value="Kaolack">Kaolack</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Rôle Partenaire Souhaité :</label>
                    <select
                      value={partnerForm.partnerType}
                      onChange={(e) => setPartnerForm({ ...partnerForm, partnerType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs focus:outline-none"
                    >
                      <option value="Apporteur d'affaires">Apporteur d'affaires (10-20% commission)</option>
                      <option value="Ambassadeur">Ambassadeur de Marque (Événements & Réseau)</option>
                      <option value="Créateur de contenu">Créateur de contenu (Vidéos & Tutos)</option>
                      <option value="Commercial partenaire">Commercial Partenaire (Prospection & Rdv)</option>
                      <option value="Expert partenaire">Expert Partenaire (Missions SI & Consulting)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
                  >
                    Valider mon Inscription Partenaire
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h3 className="text-xl font-black text-white">Félicitations {partnerForm.fullName} !</h3>
                <p className="text-xs text-slate-300">
                  Votre profil <strong>{partnerForm.partnerType}</strong> a été créé avec succès. Vous faites désormais partie du réseau officiel SEN AURA PARTNERS.
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400">
                  Code Partenaire ID : SAT-PRT-{Math.floor(100000 + Math.random() * 900000)}
                </div>
                <button
                  onClick={() => { setShowRegisterModal(false); setRegisteredSuccess(false); }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: SUBMIT IMPACT PROJECT */}
      {showImpactModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => { setShowImpactModal(false); setImpactSuccess(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            {!impactSuccess ? (
              <>
                <div>
                  <h3 className="text-xl font-black text-white">Soumettre un Projet à Impact Social</h3>
                  <p className="text-xs text-slate-400 mt-1">Suggérez une association ou structure à accompagner gratuitement ce trimestre.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setImpactSuccess(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Nom de l'Association / Structure :</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Groupement des Femmes de Saint-Louis"
                      value={impactForm.assocName}
                      onChange={(e) => setImpactForm({ ...impactForm, assocName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Besoin Numérique principal :</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Décrivez brièvement leur projet ou problème à résoudre..."
                      value={impactForm.description}
                      onChange={(e) => setImpactForm({ ...impactForm, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs shadow-lg shadow-rose-500/20"
                  >
                    Soumettre le Projet Social
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                  ❤️
                </div>
                <h3 className="text-xl font-black text-white">Proposition Reçue !</h3>
                <p className="text-xs text-slate-300">
                  L'équipe SEN AURA TECH et les 5 cofondateurs analyseront le projet de l'association <strong>{impactForm.assocName}</strong> pour la sélection du prochain trimestre.
                </p>
                <button
                  onClick={() => { setShowImpactModal(false); setImpactSuccess(false); }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
