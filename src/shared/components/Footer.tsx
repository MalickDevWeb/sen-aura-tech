import React from "react";
import { useSystemConfig } from "../../config/system-config";
import { SenegalBadge } from "./SenegalBadge";
import { BrandLogo } from "./BrandLogo";
import { Phone, Mail, MapPin, Shield, ArrowUp, Sparkles, ChevronRight } from "lucide-react";
import { SocialPillsBar } from "./SocialCommunityPills";
import { store } from "../../database/store";

export const Footer: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const config = useSystemConfig();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hide footer completely for ADMIN role
  if (store.currentUser.role === "ADMIN") {
    return null;
  }

  // If logged in as non-client (Prestataire, Admin, Vendeur, Formateur), show clean minimal back-office footer
  if (store.isLoggedIn && store.currentUser.role !== "CLIENT") {
    const roleLabels: Record<string, string> = {
      PROFESSIONAL: "Espace Prestataire Pro",
      ADMIN: "Back-Office SuperAdmin",
      VENDEUR: "Espace Vendeur Boutique",
      FORMATEUR: "Espace Formateur Academy",
      AMBASSADOR: "Espace Ambassadeur Network",
    };

    return (
      <footer className="bg-[#080C16] border-t border-slate-800 text-slate-400 py-6 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo variant="horizontal" size="sm" showTagline={false} />
            <span className="text-slate-700">|</span>
            <span className="text-amber-400 font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px]">
              {roleLabels[store.currentUser.role] || store.currentUser.role}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>© {new Date().getFullYear()} {config.branding.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Shield className="w-3.5 h-3.5" /> Session Sécurisée
            </span>
          </div>
        </div>
        <div className="senegal-flag-stripe mt-4" />
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-b from-[#0B0F19] via-[#080C16] to-[#04060B] border-t border-slate-800/90 text-slate-300 relative overflow-hidden">
      {/* Senegal Flag Stripe at top */}
      <div className="senegal-flag-stripe" />

      {/* Decorative Subtle Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 sm:pb-12 relative z-10">

        {/* TOP CTA RIBBON */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
          
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Souveraineté Numérique & Excellence Technologique</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Prêt à accélérer vos projets avec <span className="text-gold-gradient">SEN AURA TECH</span> ?
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Solutions logicielles sur-mesure, infrastructures cloud certifiées, marketplace de prestataires et académie de formations tech au Sénégal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate("solutions_numeriques")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <span>Demander un Devis</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate("ambassadeur")}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-semibold text-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Programme Ambassadeur</span>
            </button>
          </div>
        </div>

        {/* MAIN FOOTER GRID: BRAND + PÔLES + ECOSYSTÈME + CONTACT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-10">
          
          {/* COLUMN 1: BRAND IDENTITY & TRUST (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <button onClick={() => onNavigate("home")} className="block group cursor-pointer">
              <BrandLogo variant="horizontal" size="md" showTagline={true} />
            </button>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {config.branding.slogan || "SEN-AURA-TECH — Le digital au service des entreprises, des compétences et des opportunités."}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <SenegalBadge />
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Plateforme Active 24/7</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 space-y-1">
              <p className="flex items-center gap-1.5">
                <span className="text-amber-400">✓</span> Solutions Logicielles, Mobile & IA certifiées
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Déploiements & Interventions Dakar & Régions
              </p>
            </div>
          </div>

          {/* COLUMN 2: PÔLES D'EXCELLENCE (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
              <span>Pôles d'Excellence</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {[
                { label: "Solutions Numériques", tab: "solutions_numeriques", num: "01" },
                { label: "Infrastructures Tech", tab: "infrastructures_techniques", num: "02" },
                { label: "Conseil & Audit SI", tab: "conseil", num: "03" },
                { label: "Academy & Formations", tab: "academy", num: "04" },
                { label: "Marketplace des Pros", tab: "marketplace", num: "05" },
                { label: "Boutique Matériel Tech", tab: "boutique", num: "06" },
              ].map((item) => (
                <li key={item.tab}>
                  <button
                    onClick={() => onNavigate(item.tab)}
                    className="flex items-center gap-2 hover:text-amber-300 hover:translate-x-1 transition-all text-left group cursor-pointer"
                  >
                    <span className="text-[10px] font-mono font-bold text-amber-500/70 group-hover:text-amber-400">{item.num}.</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: ECOSYSTÈME & ESPACES (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400">
              Écosystème Unifié
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {[
                { label: "1 Semaine = 1 Solution", tab: "une_semaine_une_solution" },
                { label: "Tableau de Bord Unique", tab: "dashboard" },
                { label: "Espace Prestataires Pros", tab: "marketplace" },
                { label: "Certifications & Diplômes", tab: "academy" },
                { label: "Espace Ambassadeur", tab: "ambassadeur" },
                { label: "Garanties & SAV Matériel", tab: "boutique" },
                { label: "Suivi des Devis & Commandes", tab: "dashboard" },
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => onNavigate(item.tab)}
                    className="flex items-center gap-1.5 hover:text-amber-300 hover:translate-x-1 transition-all text-left cursor-pointer group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: SIÈGE & CONTACT DIRECT (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center justify-between">
              <span>Siège & Contact Direct</span>
            </h4>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="leading-snug">
                  <p className="font-semibold text-white">Siège Social Thiès</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{config.contacts.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <a
                  href={`tel:${config.contacts.phone.replace(/\s+/g, '')}`}
                  className="font-mono font-bold text-slate-200 hover:text-amber-300 transition-colors"
                >
                  {config.contacts.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a
                  href={`mailto:${config.contacts.email}`}
                  className="text-slate-300 hover:text-amber-300 transition-colors truncate text-[11px]"
                >
                  {config.contacts.email}
                </a>
              </div>

              <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Disponibilité :</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Lun - Sam 8h - 19h
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* DEDICATED FULL-WIDTH SOCIAL NETWORKS & COMMUNITY STRIP */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🌐</span>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Nos Canaux & Réseaux Officiels
              </h4>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-amber-400 font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>7 Canaux Officiels Vérifiés</span>
            </div>
          </div>

          <SocialPillsBar variant="footerRow" />
        </div>

        {/* BOTTOM COPYRIGHT & LEGAL REGISTRATIONS */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p className="text-slate-400 font-medium">
              © {new Date().getFullYear()} {config.branding.name}. Tous droits réservés.
            </p>
            {config.finance.companyNinea && (
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                NINEA : <strong className="text-slate-400">{config.finance.companyNinea}</strong> | RCCM : <strong className="text-slate-400">{config.finance.companyRccm}</strong>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="text-[11px] text-slate-500">Architecture Hexagonale & Souveraineté Digitale</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition-all text-xs font-semibold cursor-pointer"
            >
              <span>Haut de page</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
