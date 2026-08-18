import React, { useState } from "react";
import {
  Code,
  Video,
  Briefcase,
  GraduationCap,
  Users,
  ShoppingBag,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  FileText,
  Bot,
  Zap,
  MapPin,
  TrendingUp,
  Award
} from "lucide-react";
import { BRAND_CONFIG, formatCurrency } from "../../config/constants";
import { BrandLogo } from "../../shared/components/BrandLogo";

import { store } from "../../database/store";
import { CommunitySection } from "../../shared/components/CommunitySection";
import { UneSemaineUneSolutionSection } from "../../shared/components/UneSemaineUneSolutionSection";
import { useSystemConfig } from "../../config/system-config";

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onOpenQuoteModal: (pole?: any, title?: string) => void;
  onOpenAiDrawer: () => void;
  currency: "FCFA" | "EUR";
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenQuoteModal,
  onOpenAiDrawer,
  currency,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const config = useSystemConfig();
  const showcase = config.homeShowcase;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.toLowerCase();
    if (q.includes("plombier") || q.includes("électricien") || q.includes("pro") || q.includes("développeur")) {
      onNavigate("marketplace");
    } else if (q.includes("caméra") || q.includes("solaire") || q.includes("fibre")) {
      onNavigate("infrastructures_techniques");
    } else if (q.includes("app") || q.includes("web") || q.includes("mobile") || q.includes("logiciel")) {
      onNavigate("solutions_numeriques");
    } else if (q.includes("cours") || q.includes("formation") || q.includes("apprendre")) {
      onNavigate("academy");
    } else if (q.includes("ordinateur") || q.includes("pc") || q.includes("acheter")) {
      onNavigate("boutique");
    } else {
      onNavigate("solutions_numeriques");
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative pt-4 sm:pt-6 md:pt-8 pb-8 sm:pb-12 overflow-hidden bg-radial from-slate-900 via-[#0B0F19] to-slate-950 border-b border-slate-800">
        
        {/* Optimized Subtle Glow Effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[240px] bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-emerald-500/10 blur-[80px] rounded-full pointer-events-none transform-gpu" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 text-center space-y-3.5 sm:space-y-4">
          
          {/* Official Brand Logo Emblem */}
          <div className="flex justify-center my-1">
            <BrandLogo variant="badge" size="md" className="hover:scale-105 transition-transform duration-300 drop-shadow-[0_10px_25px_rgba(245,158,11,0.25)]" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-[11px] sm:text-xs font-semibold text-amber-300 shadow-md shadow-amber-500/5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>{showcase.hero.badgeText}</span>
          </div>

          {/* Main Title */}
          <div className="space-y-1.5 max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              {showcase.hero.mainTitleLine1} <br />
              <span className="text-silver-gradient">{showcase.hero.mainTitleAura} </span>
              <span className="text-gold-gradient">{showcase.hero.mainTitleTech}</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              {showcase.hero.subtitle}
            </p>
          </div>

          {/* Smart Search Engine */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative pt-1">
            <div className="relative flex items-center bg-slate-900/90 border border-amber-500/40 rounded-2xl shadow-xl p-1.5 sm:p-2 group hover:border-amber-400 transition-all">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 ml-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: 'je cherche un plombier à Dakar', 'créer une app mobile', 'cours React'..."
                className="w-full px-2.5 py-1.5 sm:py-2 text-xs sm:text-sm bg-transparent text-white focus:outline-hidden placeholder-slate-500 font-medium"
              />
              <button
                type="submit"
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 shrink-0 transition-all cursor-pointer"
              >
                Rechercher
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <span className="text-slate-500 font-mono">Moteur :</span>
              <button type="button" onClick={() => setSearchQuery("Plombier Dakar")} className="text-amber-400 hover:underline cursor-pointer">Plombier</button>
              <button type="button" onClick={() => setSearchQuery("Développement Web")} className="text-amber-400 hover:underline cursor-pointer">App Web</button>
              <button type="button" onClick={() => setSearchQuery("Caméras Sécurité")} className="text-amber-400 hover:underline cursor-pointer">Caméras</button>
              <button type="button" onClick={() => setSearchQuery("Solaire")} className="text-amber-400 hover:underline cursor-pointer">Solaire</button>
            </p>
          </form>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenQuoteModal("SOLUTIONS_NUMERIQUES")}
              className="px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" /> {showcase.hero.quoteButtonText || "Demander un Devis Gratuit"}
            </button>
            <button
              onClick={onOpenAiDrawer}
              className="px-5 py-2.5 sm:py-3 rounded-xl bg-slate-800/90 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 font-bold text-xs flex items-center gap-2 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
            >
              <Bot className="w-4 h-4 text-indigo-400" /> {showcase.hero.aiButtonText || "Consulter SEN AURA AI"}
            </button>
          </div>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto pt-5 sm:pt-6 border-t border-slate-800/80">
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{showcase.hero.stats.projectsValue}</span>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{showcase.hero.stats.projectsLabel}</p>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{showcase.hero.stats.prosValue}</span>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{showcase.hero.stats.prosLabel}</p>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">{showcase.hero.stats.studentsValue}</span>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{showcase.hero.stats.studentsLabel}</p>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{showcase.hero.stats.satisfactionValue}</span>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{showcase.hero.stats.satisfactionLabel}</p>
            </div>
          </div>

        </div>
      </section>

      {/* 6 PÔLES D'EXCELLENCE GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Nos 6 Pôles d'Excellence Unifiés</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Sélectionnez un domaine d'intervention pour découvrir nos services, prestataires et équipements.
          </p>
        </div>

        {/* 2 per row on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
          
          {/* Pôle 1 */}
          <div
            onClick={() => onNavigate("solutions_numeriques")}
            className="glass-card-gold p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl cursor-pointer group hover:-translate-y-1 active:scale-[0.98] transition-all space-y-2.5 sm:space-y-4 flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-2 sm:space-y-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Code className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-400">Pôle 1</span>
                <h3 className="text-xs sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">Solutions Numériques</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  Développement web, applications mobiles, ERP, CRM, agents IA et architectures Cloud résilientes.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-amber-400 pt-2 border-t border-slate-800/80">
              <span className="truncate">Voir les solutions</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
            </div>
          </div>

          {/* Pôle 2 */}
          <div
            onClick={() => onNavigate("infrastructures_techniques")}
            className="glass-card p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl cursor-pointer group hover:border-amber-500/50 hover:-translate-y-1 active:scale-[0.98] transition-all space-y-2.5 sm:space-y-4 flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-2 sm:space-y-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Video className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-400">Pôle 2</span>
                <h3 className="text-xs sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">Infrastructures Tech</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  Vidéosurveillance IP, fibre optique d'entreprise, réseaux, contrôle d'accès et installations solaires.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-emerald-400 pt-2 border-t border-slate-800/80">
              <span className="truncate">Découvrir équipements</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
            </div>
          </div>

          {/* Pôle 3 */}
          <div
            onClick={() => onNavigate("conseil")}
            className="glass-card p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl cursor-pointer group hover:border-amber-500/50 hover:-translate-y-1 active:scale-[0.98] transition-all space-y-2.5 sm:space-y-4 flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-2 sm:space-y-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/40 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Briefcase className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-400">Pôle 3</span>
                <h3 className="text-xs sm:text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">Conseil & Ingénierie</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  Audit de sécurité SI, transformation digitale, cahiers des charges et gestion de projet d'envergure.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-blue-400 pt-2 border-t border-slate-800/80">
              <span className="truncate">Consultation</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
            </div>
          </div>

          {/* Pôle 4 */}
          <div
            onClick={() => onNavigate("academy")}
            className="glass-card p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl cursor-pointer group hover:border-amber-500/50 hover:-translate-y-1 active:scale-[0.98] transition-all space-y-2.5 sm:space-y-4 flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-2 sm:space-y-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/40 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-indigo-400">Pôle 4</span>
                <h3 className="text-xs sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">Academy & Formation</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  Formations certifiantes en développement, IA, cloud, vidéosurveillance et gestion pour étudiants & pros.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-indigo-400 pt-2 border-t border-slate-800/80">
              <span className="truncate">Explorer les cours</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
            </div>
          </div>

          {/* Pôle 5 */}
          <div
            onClick={() => onNavigate("marketplace")}
            className="glass-card-gold p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl cursor-pointer group hover:-translate-y-1 active:scale-[0.98] transition-all space-y-2.5 sm:space-y-4 flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-2 sm:space-y-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Users className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-400">Pôle 5</span>
                <h3 className="text-xs sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">Marketplace des Pros</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  L'Uber des professionnels : plombiers, électriciens, développeurs, juristes et artisans vérifiés.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-amber-400 pt-2 border-t border-slate-800/80">
              <span className="truncate">Trouver un pro</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
            </div>
          </div>

          {/* Pôle 6 */}
          <div
            onClick={() => onNavigate("boutique")}
            className="glass-card p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl cursor-pointer group hover:border-amber-500/50 hover:-translate-y-1 active:scale-[0.98] transition-all space-y-2.5 sm:space-y-4 flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-2 sm:space-y-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-400">Pôle 6</span>
                <h3 className="text-xs sm:text-lg font-bold text-white group-hover:text-rose-300 transition-colors leading-snug">Boutique & E-Commerce</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  Ordinateurs portables, serveurs, kits caméras, panneaux solaires, logiciels avec paiement Wave/OM.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-rose-400 pt-2 border-t border-slate-800/80">
              <span className="truncate">Visiter boutique</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
            </div>
          </div>

        </div>
      </section>

      {/* PROGRAMME VEDETTE : UNE SEMAINE = UNE APPLICATION = UNE SOLUTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UneSemaineUneSolutionSection onNavigate={onNavigate} onOpenQuoteModal={onOpenQuoteModal} />
      </div>

      {/* MARKETPLACE PROS SPOTLIGHT (Pôle 5) */}
      {showcase.marketplacePros.enabled && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-400">
                {showcase.marketplacePros.eyebrow}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {showcase.marketplacePros.title}
              </h2>
            </div>
            <button
              onClick={() => onNavigate("marketplace")}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span className="hidden sm:inline">{showcase.marketplacePros.viewAllText}</span>
              <span className="sm:hidden">Tous ({showcase.marketplacePros.items.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2 per row on mobile, 3 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
            {showcase.marketplacePros.items.map((pro, idx) => {
              const isLastOdd =
                showcase.marketplacePros.items.length % 2 !== 0 &&
                idx === showcase.marketplacePros.items.length - 1;
              return (
                <div
                  key={pro.id}
                  className={`p-3 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-amber-500/50 transition-all duration-200 flex justify-between group shadow-sm ${
                    isLastOdd
                      ? "col-span-2 w-full flex-col md:col-span-1"
                      : "flex-col"
                  }`}
                >
                  {isLastOdd ? (
                    <>
                      {/* Mobile Horizontal Layout for odd card (spans 2 columns, height reduced by ~40%) */}
                      <div className="flex sm:hidden items-center justify-between w-full gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={pro.avatar}
                              alt={pro.fullName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40 shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                            {pro.verified && (
                              <div className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-slate-900">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                              {pro.fullName}
                            </h3>
                            <p className="text-[10px] text-amber-400 font-semibold truncate">
                              {pro.category}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-0.5 truncate">
                                <MapPin className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                                {pro.region}
                              </span>
                              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-400 shrink-0" />
                                {pro.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate("marketplace")}
                          className="shrink-0 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] uppercase transition-all cursor-pointer active:scale-95 shadow-md shadow-amber-500/20"
                        >
                          Réserver
                        </button>
                      </div>

                      {/* Desktop standard vertical layout */}
                      <div className="hidden sm:flex flex-col justify-between h-full w-full space-y-2.5">
                        <div className="space-y-2.5">
                          <div className="flex flex-row gap-3.5 items-start text-left">
                            <div className="relative shrink-0">
                              <img
                                src={pro.avatar}
                                alt={pro.fullName}
                                className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/40 shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                              {pro.verified && (
                                <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                                {pro.fullName}
                              </h3>
                              <p className="text-xs text-amber-400 font-semibold truncate mt-0.5">
                                {pro.category}
                              </p>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="truncate">{pro.region}</span>
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {pro.bio}
                          </p>
                        </div>

                        <div className="flex flex-row items-center justify-between gap-2 pt-3 border-t border-slate-800/80 mt-2">
                          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                            <span>{pro.rating}</span>
                            <span className="text-slate-500 text-[10px]">({pro.reviewsCount})</span>
                          </div>
                          <button
                            onClick={() => onNavigate("marketplace")}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500 hover:text-slate-950 transition-all text-center cursor-pointer active:scale-95"
                          >
                            Réserver
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2.5">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3.5 items-center sm:items-start text-center sm:text-left">
                          <div className="relative shrink-0">
                            <img
                              src={pro.avatar}
                              alt={pro.fullName}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-amber-500/40 shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                            {pro.verified && (
                              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                              {pro.fullName}
                            </h3>
                            <p className="text-[10px] sm:text-xs text-amber-400 font-semibold truncate mt-0.5">
                              {pro.category}
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{pro.region}</span>
                            </p>
                          </div>
                        </div>

                        <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 leading-relaxed hidden sm:block">
                          {pro.bio}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2.5 sm:pt-3 border-t border-slate-800/80 mt-2">
                        <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 font-bold text-[10px] sm:text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                          <span>{pro.rating}</span>
                          <span className="text-slate-500 text-[10px]">({pro.reviewsCount})</span>
                        </div>
                        <button
                          onClick={() => onNavigate("marketplace")}
                          className="w-full sm:w-auto px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[10px] sm:text-xs hover:bg-amber-500 hover:text-slate-950 transition-all text-center cursor-pointer active:scale-95"
                        >
                          Réserver
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* BOUTIQUE FEATURED PRODUCTS (Pôle 6) */}
      {showcase.boutique.enabled && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                {showcase.boutique.eyebrow}
              </span>
              <h2 className="text-2xl font-black text-white">
                {showcase.boutique.title}
              </h2>
            </div>
            <button
              onClick={() => onNavigate("boutique")}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              {showcase.boutique.viewAllText} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {showcase.boutique.items.map((prod, idx) => {
              const isLastOdd =
                showcase.boutique.items.length % 2 !== 0 &&
                idx === showcase.boutique.items.length - 1;
              return (
                <div
                  key={prod.id}
                  className={`p-3 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex justify-between group shadow-sm ${
                    isLastOdd
                      ? "col-span-2 w-full flex-col lg:col-span-1"
                      : "flex-col space-y-3 sm:space-y-4"
                  }`}
                >
                  {isLastOdd ? (
                    <>
                      {/* Mobile Horizontal Layout for odd card (spans 2 columns, height reduced by ~40%) */}
                      <div className="flex sm:hidden items-center gap-3 w-full">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80";
                            }}
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-[8px] font-bold text-emerald-400 border border-slate-700">
                            Qté: {prod.stock}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1 flex flex-col justify-between h-20 py-0.5">
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">{prod.brand}</span>
                            <h3 className="text-xs font-bold text-white line-clamp-1 leading-snug">{prod.name}</h3>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                            <p className="text-xs font-black text-emerald-400 font-mono">
                              {formatCurrency(prod.priceFCFA, currency)}
                            </p>
                            <button
                              onClick={() => {
                                store.addToCart({
                                  id: prod.id,
                                  name: prod.name,
                                  brand: prod.brand,
                                  category: prod.category,
                                  priceFCFA: prod.priceFCFA,
                                  stock: prod.stock,
                                  image: prod.image,
                                  description: prod.description || "",
                                  specs: {},
                                }, 1);
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] uppercase transition-colors cursor-pointer active:scale-95 shrink-0"
                            >
                              Ajouter
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop normal vertical view */}
                      <div className="hidden sm:flex flex-col justify-between h-full w-full space-y-3 sm:space-y-4">
                        <div className="space-y-2 sm:space-y-3">
                          <div className="relative h-28 sm:h-44 rounded-xl overflow-hidden bg-slate-950">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80";
                              }}
                            />
                            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[9px] sm:text-[10px] font-bold text-emerald-400">
                              Stock : {prod.stock}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">{prod.brand}</span>
                            <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">{prod.name}</h3>
                          </div>
                        </div>

                        <div className="pt-2 sm:pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
                          <div>
                            <span className="text-[10px] sm:text-xs text-slate-400">Prix :</span>
                            <p className="text-xs sm:text-base font-black text-emerald-400 font-mono">
                              {formatCurrency(prod.priceFCFA, currency)}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              store.addToCart({
                                id: prod.id,
                                name: prod.name,
                                brand: prod.brand,
                                category: prod.category,
                                priceFCFA: prod.priceFCFA,
                                stock: prod.stock,
                                image: prod.image,
                                description: prod.description || "",
                                specs: {},
                              }, 1);
                            }}
                            className="w-full sm:w-auto px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] sm:text-xs transition-colors cursor-pointer text-center active:scale-95"
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="relative h-28 sm:h-44 rounded-xl overflow-hidden bg-slate-950">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80";
                            }}
                          />
                          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[9px] sm:text-[10px] font-bold text-emerald-400">
                            Stock : {prod.stock}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">{prod.brand}</span>
                          <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">{prod.name}</h3>
                        </div>
                      </div>

                      <div className="pt-2 sm:pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
                        <div>
                          <span className="text-[10px] sm:text-xs text-slate-400">Prix :</span>
                          <p className="text-xs sm:text-base font-black text-emerald-400 font-mono">
                            {formatCurrency(prod.priceFCFA, currency)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            store.addToCart({
                              id: prod.id,
                              name: prod.name,
                              brand: prod.brand,
                              category: prod.category,
                              priceFCFA: prod.priceFCFA,
                              stock: prod.stock,
                              image: prod.image,
                              description: prod.description || "",
                              specs: {},
                            }, 1);
                          }}
                          className="w-full sm:w-auto px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] sm:text-xs transition-colors cursor-pointer text-center active:scale-95"
                        >
                          Ajouter
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ACADEMY FORMATIONS (Pôle 4) */}
      {showcase.academy.enabled && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-radial from-slate-900 to-slate-950 border border-indigo-500/30 space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 sm:gap-4">
              <div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-indigo-400">
                  {showcase.academy.eyebrow}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {showcase.academy.title}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                  {showcase.academy.subtitle}
                </p>
              </div>
              <button
                onClick={() => onNavigate("academy")}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] sm:text-xs transition-colors self-start cursor-pointer active:scale-95 shadow-md shadow-indigo-600/20"
              >
                {showcase.academy.viewAllText}
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
              {showcase.academy.items.map((course, idx) => {
                const isLastOdd =
                  showcase.academy.items.length % 2 !== 0 &&
                  idx === showcase.academy.items.length - 1;
                return (
                  <div
                    key={course.id}
                    className={`p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 flex justify-between group transition-all shadow-sm ${
                      isLastOdd
                        ? "col-span-2 w-full flex-col lg:col-span-1"
                        : "flex-col space-y-2.5 sm:space-y-3"
                    }`}
                  >
                    {isLastOdd ? (
                      <>
                        {/* Mobile Horizontal Layout for odd card (spans 2 columns, height reduced by ~40%) */}
                        <div className="flex sm:hidden items-center gap-3 w-full">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-between h-20 py-0.5">
                            <div>
                              <span className="inline-block text-[8px] font-bold text-indigo-300 px-1.5 py-0.5 rounded bg-indigo-500/20 truncate max-w-full">
                                {course.category}
                              </span>
                              <h3 className="text-xs font-bold text-white line-clamp-1 leading-snug mt-0.5">
                                {course.title}
                              </h3>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                              <span className="text-amber-400 font-bold font-mono text-[10px]">
                                {formatCurrency(course.priceFCFA, currency)}
                              </span>
                              <button
                                onClick={() => onNavigate("academy")}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] cursor-pointer"
                              >
                                S'inscrire
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Desktop normal view */}
                        <div className="hidden sm:flex flex-col justify-between h-full w-full space-y-2.5 sm:space-y-3">
                          <div className="space-y-2">
                            <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-slate-950">
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="inline-block text-[9px] sm:text-[10px] font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/20 truncate max-w-full">
                              {course.category}
                            </span>
                            <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                              {course.title}
                            </h3>
                          </div>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-xs pt-2 sm:pt-2.5 border-t border-slate-800/80 gap-1.5">
                            <span className="text-amber-400 font-bold font-mono text-[10px] sm:text-xs">
                              {formatCurrency(course.priceFCFA, currency)}
                            </span>
                            <button
                              onClick={() => onNavigate("academy")}
                              className="text-[10px] sm:text-[11px] font-bold text-indigo-400 hover:text-indigo-300 text-center cursor-pointer"
                            >
                              S'inscrire →
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-slate-950">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="inline-block text-[9px] sm:text-[10px] font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/20 truncate max-w-full">
                            {course.category}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                            {course.title}
                          </h3>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-xs pt-2 sm:pt-2.5 border-t border-slate-800/80 gap-1.5">
                          <span className="text-amber-400 font-bold font-mono text-[10px] sm:text-xs">
                            {formatCurrency(course.priceFCFA, currency)}
                          </span>
                          <button
                            onClick={() => onNavigate("academy")}
                            className="text-[10px] sm:text-[11px] font-bold text-indigo-400 hover:text-indigo-300 text-center cursor-pointer"
                          >
                            S'inscrire →
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* COMMUNITY SHOWCASE & WHATSAPP HUB */}
      {showcase.community?.enabled !== false && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
          <CommunitySection onNavigate={onNavigate} />
        </div>
      )}

    </div>
  );
};
