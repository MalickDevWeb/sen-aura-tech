import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Rocket,
  Code2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Flame,
  Layers,
  Bot,
  Zap,
  Users,
  Award,
  Globe,
  Share2,
  Check,
  Smartphone,
  Play,
  Lightbulb,
  Send,
  Clock,
  ShieldCheck,
  Star,
  Search
} from "lucide-react";
import { WhatsAppIcon } from "./SocialCommunityPills";
import { WhatsAppGroupModal } from "./WhatsAppGroupModal";
import { useSystemConfig, ShowcaseProgramItem } from "../../config/system-config";

interface UneSemaineUneSolutionSectionProps {
  onNavigate?: (tab: string) => void;
  onOpenQuoteModal?: (pole?: any, title?: string) => void;
}

export type WeeklySolution = ShowcaseProgramItem;

export const DEFAULT_WEEKLY_SOLUTIONS: ShowcaseProgramItem[] = [
  {
    id: "prog-1",
    weekNumber: 1,
    title: "SEN-PHARMA : Urgences & Pharmacies de Garde",
    codename: "Pharmacies & Médicaments Dakar",
    category: "Santé & Citoyen",
    problemStatement: "Difficulté pour les citoyens sénégalais de trouver rapidement une pharmacie de garde ouverte la nuit et de vérifier la disponibilité d'un médicament rare.",
    solutionDelivered: "Application web/PWA géolocalisée avec recherche instantanée par quartier, calcul d'itinéraire direct et consultation en temps réel des gardes nocturnes.",
    technologies: ["Next.js", "Leaflet Maps", "PostgreSQL", "PWA Offline"],
    durationDays: 7,
    status: "LIVRÉ & OPÉRATIONNEL",
    impactMetric: "+14 500 recherches / mois",
    demoUrl: "https://senauratech.sn/solutions/sen-pharma",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
    githubOpenSource: true,
    active: true,
    isPublished: true,
    featured: true,
  },
  {
    id: "prog-2",
    weekNumber: 2,
    title: "SEN-QUICK PAY : Micro-Boutique WhatsApp & Wave",
    codename: "Social Commerce Express",
    category: "E-Commerce & FinTech",
    problemStatement: "Les marchands et créateurs locaux perdent des ventes sur WhatsApp car les clients hésitent à commander sans catalogue clair ni paiement automatisé.",
    solutionDelivered: "Générateur de mini-boutique 1-clic avec panier intelligent, paiement automatique par QR Code Wave et envoi instantané du reçu PDF via WhatsApp.",
    technologies: ["React", "API Wave Sénégal", "PDF Auto-Gen", "WhatsApp Webhook"],
    durationDays: 7,
    status: "LIVRÉ & OPÉRATIONNEL",
    impactMetric: "3,2x de conversions pour 80+ vendeurs",
    demoUrl: "https://senauratech.sn/solutions/sen-quickpay",
    image: "https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&auto=format&fit=crop&q=80",
    githubOpenSource: true,
    active: true,
    isPublished: true,
    featured: false,
  },
  {
    id: "prog-3",
    weekNumber: 3,
    title: "SEN-ARTISAN PRO : Dépannage & Artisans Certifiés",
    codename: "Uber des Artisans de Dakar",
    category: "Artisanat & Services",
    problemStatement: "Manque de confiance et délais interminables pour trouver un plombier, électricien ou frigoriste qualifié en cas de panne urgente à domicile.",
    solutionDelivered: "Système de dispatching d'artisans avec vérification d'identité, tarification transparente pré-estimée et système d'avis vérifiés.",
    technologies: ["Flutter", "Firebase Auth", "Geolocation Engine", "Orange Money"],
    durationDays: 7,
    status: "LIVRÉ & OPÉRATIONNEL",
    impactMetric: "Moins de 35 min de délai d'intervention",
    demoUrl: "https://senauratech.sn/solutions/sen-artisan",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
    githubOpenSource: false,
    active: true,
    isPublished: true,
    featured: false,
  },
  {
    id: "prog-4",
    weekNumber: 4,
    title: "SEN-AURA AI CO-PILOT : Assistant Juridique & Fiscal OHADA",
    codename: "IA Expert Droit Sénégalais",
    category: "IA & Automatisation",
    problemStatement: "Complexité pour les PME et startups locales de rédiger des contrats conformes au droit OHADA et d'anticiper leurs obligations fiscales et sociales.",
    solutionDelivered: "Agent conversationnel spécialisé entraîné sur le Code du travail sénégalais et le droit OHADA, capable de rédiger et auditer des contrats en 30 secondes.",
    technologies: ["Gemini 2.5 Flash", "RAG Embeddings", "FastAPI", "Tailwind CSS"],
    durationDays: 7,
    status: "LIVRÉ & OPÉRATIONNEL",
    impactMetric: "94% de gain de temps sur la conformité",
    demoUrl: "https://senauratech.sn/solutions/sen-copilot-ia",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    githubOpenSource: true,
    active: true,
    isPublished: true,
    featured: true,
  },
  {
    id: "prog-5",
    weekNumber: 5,
    title: "SEN-AGRI CLIMAT : Météo Prédictive & Prix des Marchés",
    codename: "AgriTech & Coopératives",
    category: "AgriTech & Logistique",
    problemStatement: "Les producteurs agricoles vendent à perte faute d'informations fiables sur les cours des marchés régionaux (Niayes, Touba, Tambacounda) et la météo.",
    solutionDelivered: "Tableau de bord vocal (Français & Wolof) diffusant les cours du jour des denrées (oignons, arachides, mangues) et alertes d'irrigation.",
    technologies: ["Voice AI", "Satellite Weather API", "SMS Gateway", "Node.js"],
    durationDays: 7,
    status: "EN COURS DE SPRINT",
    impactMetric: "Phase de test avec 12 coopératives",
    demoUrl: "https://senauratech.sn/solutions/sen-agri",
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80",
    githubOpenSource: false,
    active: true,
    isPublished: true,
    featured: false,
  },
  {
    id: "prog-6",
    weekNumber: 6,
    title: "SEN-CAMPUS CODE : Plateforme d'Entraînement Algorithmique",
    codename: "Learn to Code Sénégal",
    category: "Éducation & EdTech",
    problemStatement: "Les étudiants en informatique ont besoin d'exercices pratiques interactifs contextualisés pour réussir les tests techniques des grandes entreprises.",
    solutionDelivered: "Bac à sable de code interactif dans le navigateur avec correction automatique par l'IA et simulateur d'entretiens techniques FAANG / UEMOA.",
    technologies: ["WebAssembly", "TypeScript", "Monaco Editor", "Docker Sandbox"],
    durationDays: 7,
    status: "PROCHAIN SPRINT",
    impactMetric: "Lancement Semaine Prochaine",
    demoUrl: "https://senauratech.sn/solutions/sen-campus",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    githubOpenSource: true,
    active: true,
    isPublished: true,
    featured: false,
  }
];

export const WEEKLY_SOLUTIONS_DATA = DEFAULT_WEEKLY_SOLUTIONS;

export const UneSemaineUneSolutionSection: React.FC<UneSemaineUneSolutionSectionProps> = ({
  onNavigate,
  onOpenQuoteModal
}) => {
  const config = useSystemConfig();
  
  const weeklyConfig = config.homeShowcase?.weeklySolutions || {
    enabled: true,
    eyebrow: "INITIATIVE FLAGSHIP NATIONALE • SEN AURA TECH",
    title: "Programme « 1 SEMAINE = 1 APPLICATION = 1 SOLUTION »",
    subtitle: "Chaque semaine, l'équipe d'ingénieurs et les talents certifiés de SEN AURA TECH & ACADEMY conçoivent, développent et déploient une solution 100% opérationnelle.",
    items: DEFAULT_WEEKLY_SOLUTIONS,
  };

  // Filter only active & published items for display
  const rawItems = weeklyConfig.items && weeklyConfig.items.length > 0
    ? weeklyConfig.items
    : DEFAULT_WEEKLY_SOLUTIONS;

  const publicSolutions = rawItems.filter(
    (item) => item.active !== false && item.isPublished !== false
  );

  const displaySolutions = publicSolutions.length > 0 ? publicSolutions : rawItems;

  const [selectedSolution, setSelectedSolution] = useState<ShowcaseProgramItem | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [proposalText, setProposalText] = useState("");
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  // Sync selected solution when items load or change
  useEffect(() => {
    if (displaySolutions.length > 0) {
      // Keep selected or pick first or featured
      setSelectedSolution((prev) => {
        if (prev && displaySolutions.some((s) => s.id === prev.id || s.weekNumber === prev.weekNumber)) {
          return displaySolutions.find((s) => s.id === prev.id || s.weekNumber === prev.weekNumber) || displaySolutions[0];
        }
        const featured = displaySolutions.find((s) => s.featured);
        return featured || displaySolutions[0];
      });
    }
  }, [displaySolutions]);

  // Extract unique categories dynamically
  const uniqueCategories = [
    "ALL",
    ...Array.from(new Set(displaySolutions.map((s) => s.category).filter(Boolean)))
  ];

  const filteredSolutions = displaySolutions.filter((sol) => {
    const matchesCat = activeCategoryFilter === "ALL" || sol.category === activeCategoryFilter;
    const matchesSearch = !searchQuery.trim() ||
      sol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sol.problemStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sol.technologies?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleProposeProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalText.trim()) return;
    setProposalSubmitted(true);
    setTimeout(() => {
      setProposalText("");
      setProposalSubmitted(false);
    }, 4000);
  };

  if (weeklyConfig.enabled === false) {
    return null;
  }

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden rounded-3xl bg-[#0B0F19] border border-amber-500/30 text-white shadow-2xl space-y-12">
      
      {/* Background Neon Aura Accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/[0.03] via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* HEADER & MANIFESTO */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/10">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{weeklyConfig.eyebrow || "INITIATIVE FLAGSHIP NATIONALE • SEN AURA TECH"}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {weeklyConfig.title?.includes("«") ? (
              <>
                {weeklyConfig.title.split("«")[0]} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 drop-shadow-sm">
                  « {weeklyConfig.title.split("«")[1]}
                </span>
              </>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                {weeklyConfig.title || "Programme « 1 SEMAINE = 1 APPLICATION = 1 SOLUTION »"}
              </span>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
            {weeklyConfig.subtitle || (
              <>
                Chaque semaine, l'équipe d'ingénieurs et les talents certifiés de <strong>SEN AURA TECH & ACADEMY</strong> s'attaquent à une vraie problématique sénégalaise et africaine. En <strong>7 jours chrono</strong>, nous concevons, développons et livrons une <strong>application 100% opérationnelle</strong>, sécurisée et utile.
              </>
            )}
          </p>

          {/* 3 CORE PILLARS BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/30 transition-all flex items-start gap-3.5 shadow-md">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sprint 7 Jours Non-Stop</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">De l'idée brute au prototype prêt à l'emploi et déployé en ligne.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/30 transition-all flex items-start gap-3.5 shadow-md">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Impact Direct Local</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Résolution des enjeux réels : santé, commerce, artisanat, agriculture.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/30 transition-all flex items-start gap-3.5 shadow-md">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 border border-indigo-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Formation par l'Action</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Les étudiants de l'Academy participent aux vraies livraisons en production.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTER CHIPS */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Category Filter Chips - horizontal scrollable filter strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full flex-nowrap flex-1">
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    activeCategoryFilter === cat
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]"
                      : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-amber-500/40 hover:text-slate-200"
                  }`}
                >
                  {cat === "ALL" ? `Toutes les Solutions (${displaySolutions.length})` : cat}
                </button>
              ))}
            </div>

            {/* Live Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une solution..."
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* INTERACTIVE SHOWCASE (GRID + HIGHLIGHT DETAIL) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SOLUTIONS LIST (LEFT SIDE - 5 COLUMNS) */}
          <div className="lg:col-span-5 space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredSolutions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
                Aucune solution ne correspond à ce filtre de recherche.
              </div>
            ) : (
              filteredSolutions.map((sol) => {
                const isSelected = selectedSolution?.id === sol.id || selectedSolution?.weekNumber === sol.weekNumber;
                return (
                  <div
                    key={sol.id || sol.weekNumber}
                    onClick={() => setSelectedSolution(sol)}
                    className={`p-4 sm:p-4.5 rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-300 border relative overflow-hidden group ${
                      isSelected
                        ? "bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-amber-500 shadow-2xl shadow-amber-500/15 scale-[1.01] ring-1 ring-amber-500/30"
                        : "bg-slate-900/75 hover:bg-slate-900 border-slate-800/90 hover:border-amber-500/40 shadow-md hover:shadow-xl hover:shadow-slate-950/50 hover:translate-y-[-2px]"
                    }`}
                  >
                    {/* Active Accent Glow on Selection */}
                    {isSelected ? (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-yellow-500 shadow-sm" />
                    ) : (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-amber-500/40 transition-colors" />
                    )}

                    <div className="flex items-start gap-3.5">
                      {/* Premium Thumbnail with Tag */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 shadow-md group-hover:border-amber-500/40 transition-all duration-300">
                        {sol.image ? (
                          <img
                            src={sol.image}
                            alt={sol.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                            <Flame className="w-6 h-6 text-amber-500/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-lg bg-slate-950/90 backdrop-blur-xs border border-amber-500/40 text-amber-300 text-[9px] font-black font-mono shadow-sm">
                          #{sol.weekNumber}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-extrabold text-amber-400/90 uppercase tracking-wider truncate">
                            {sol.category}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            sol.status === "LIVRÉ & OPÉRATIONNEL"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : sol.status === "EN COURS DE SPRINT"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse"
                              : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                          }`}>
                            {sol.status}
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-black text-white leading-snug group-hover:text-amber-300 transition-colors line-clamp-1">
                          {sol.title}
                        </h3>

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-normal">
                          {sol.problemStatement}
                        </p>

                        <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-slate-800/80 text-[10px]">
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="truncate max-w-[140px] sm:max-w-none">{sol.impactMetric}</span>
                          </div>
                          <span className={`flex items-center gap-1 font-bold text-[11px] transition-all ${
                            isSelected ? "text-amber-400" : "text-slate-400 group-hover:text-white"
                          }`}>
                            Détails <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ACTIVE SOLUTION DETAILED SPOTLIGHT (RIGHT SIDE - 7 COLUMNS) */}
          {selectedSolution && (
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-amber-500/40 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-md">
              
              {/* Decorative Corner Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* IMAGE BANNER WITH OVERLAYS */}
              <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
                <img
                  src={selectedSolution.image || "https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&auto=format&fit=crop&q=80"}
                  alt={selectedSolution.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Gradient shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                
                {/* Top Status Tags */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black uppercase px-3 py-1 rounded-full bg-slate-950/90 border border-amber-500/40 text-amber-300 font-mono shadow-md backdrop-blur-sm">
                    Sprint #{selectedSolution.weekNumber} (7 Jours)
                  </span>

                  <div className="flex items-center gap-2">
                    {selectedSolution.featured && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-slate-950" /> Solution Vedette
                      </span>
                    )}

                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md ${
                      selectedSolution.status === "LIVRÉ & OPÉRATIONNEL"
                        ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
                        : selectedSolution.status === "EN COURS DE SPRINT"
                        ? "bg-amber-950/90 text-amber-300 border border-amber-500/40 animate-pulse"
                        : "bg-indigo-950/90 text-indigo-300 border border-indigo-500/40"
                    }`}>
                      {selectedSolution.status}
                    </span>
                  </div>
                </div>

                {/* Bottom Title & Impact */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                      {selectedSolution.category} • {selectedSolution.codename || "SEN AURA Flagship"}
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                      {selectedSolution.title}
                    </h3>
                  </div>

                  <span className="text-xs font-bold text-emerald-300 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 shrink-0 self-start sm:self-auto shadow-md">
                    {selectedSolution.impactMetric}
                  </span>
                </div>
              </div>

              {/* PROBLEM & SOLUTION DUO CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/25 space-y-2 shadow-inner">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase text-[10px] tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Problématique Résolue
                  </div>
                  <p className="text-slate-300 leading-relaxed font-normal">
                    {selectedSolution.problemStatement}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/25 space-y-2 shadow-inner">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[10px] tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Solution Livrée en Production
                  </div>
                  <p className="text-slate-300 leading-relaxed font-normal">
                    {selectedSolution.solutionDelivered}
                  </p>
                </div>
              </div>

              {/* TECH STACK CHIPS */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    Stack & Technologies Déployées :
                  </span>
                  {selectedSolution.durationDays && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      Durée du sprint : <strong>{selectedSolution.durationDays} Jours</strong>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedSolution.technologies?.map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono font-medium shadow-xs">
                      {t}
                    </span>
                  ))}
                  {selectedSolution.githubOpenSource && (
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-xs text-indigo-300 font-bold flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5" /> Open Source & Partagé
                    </span>
                  )}
                </div>
              </div>

              {/* ACTIONS ROW */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      if (onOpenQuoteModal) {
                        onOpenQuoteModal("SOLUTIONS_NUMERIQUES", `Adaptation sur-mesure de : ${selectedSolution.title}`);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    <Rocket className="w-4 h-4" /> Déployer cette solution pour mon entreprise
                  </button>

                  {selectedSolution.demoUrl && (
                    <a
                      href={selectedSolution.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-sky-400 hover:text-sky-300 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Tester la Démo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("solutions_numeriques")}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
                    >
                      Pôle Solutions
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsWhatsAppOpen(true)}
                  className="p-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-slate-950 transition-colors cursor-pointer"
                  title="Partager dans la communauté WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                </button>
              </div>

            </div>
          )}

        </div>

        {/* PROPOSE A CHALLENGE / SPRINT CALL-TO-ACTION */}
        <div className="p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-amber-500/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 sm:gap-6 shadow-xl overflow-hidden max-w-full">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Lightbulb className="w-4 h-4 shrink-0" />
              <span>Vous avez une idée ou un blocage métier au Sénégal ?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Proposez le prochain défi de la semaine
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Soumettez votre besoin métier ou votre idée d'application. Si votre proposition est sélectionnée, nos équipes la développent gratuitement dans le cadre du programme et vous bénéficiez de l'accès prioritaire !
            </p>
          </div>

          <div className="w-full md:w-80 md:min-w-[280px] shrink-0 max-w-full">
            {proposalSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Merci ! Votre proposition a été enregistrée pour le vote du prochain sprint.</span>
              </div>
            ) : (
              <form onSubmit={handleProposeProblem} className="space-y-2 w-full">
                <div className="relative flex items-center w-full">
                  <input
                    type="text"
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    placeholder="Ex: Une app pour gérer les tontines / livraisons..."
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-400 placeholder-slate-500 font-medium pr-12"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold hover:brightness-110 transition-all cursor-pointer"
                    title="Envoyer la proposition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-400 px-1">
                  <span>Sélection chaque lundi</span>
                  <button
                    type="button"
                    onClick={() => setIsWhatsAppOpen(true)}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    Rejoindre le groupe WhatsApp
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

      <WhatsAppGroupModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />
    </section>
  );
};
