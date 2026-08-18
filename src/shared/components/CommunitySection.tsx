import React, { useState } from "react";
import {
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  FileText,
  Mail,
  Share2,
  CheckCircle2,
  Globe,
  Bell,
  Code,
  Laptop,
  Layers,
  Zap,
  GraduationCap,
  Lightbulb,
  Target,
  QrCode,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { BRAND_CONFIG } from "../../config/constants";
import { CvSubmissionModal } from "./CvSubmissionModal";
import { WhatsAppGroupModal } from "./WhatsAppGroupModal";
import { SocialPillsBar, WhatsAppIcon } from "./SocialCommunityPills";
import { useSystemConfig } from "../../config/system-config";

interface CommunitySectionProps {
  onNavigate?: (tab: string) => void;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ onNavigate }) => {
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const config = useSystemConfig();

  const whatsappGroupLink =
    config.socials.whatsappGroup ||
    config.homeShowcase.community.whatsappGroupLink ||
    "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4";

  const offerings = [
    { title: "Création de sites web", desc: "Sites vitrines, portails institutionnels et e-commerce sur-mesure", icon: "🌐" },
    { title: "Développement logiciels & apps", desc: "Applications Web, Mobiles iOS/Android et plateformes SaaS", icon: "💻" },
    { title: "Solutions informatiques", desc: "Maintenance de parcs, réseaux d'entreprise, serveurs et sécurité", icon: "⚙️" },
    { title: "Digitalisation des entreprises", desc: "Automatisation, ERP, CRM et dématérialisation des processus", icon: "🚀" },
    { title: "Formations & ressources", desc: "Certifications pratiques en code, IA, cybersécurité et solaire", icon: "📚" },
    { title: "Conseils technologiques", desc: "Audit de systèmes d'information et stratégie de transformation", icon: "💡" },
    { title: "Opportunités de stages & d'emploi", desc: "Mise en relation directe avec les recruteurs et entreprises", icon: "💼" },
    { title: "Appels à projets & candidatures", desc: "Incubation, financements et consortiums techniques", icon: "🎯" },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-amber-500/30 p-6 sm:p-10 text-white space-y-10 shadow-2xl">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge & Title */}
      <div className="relative z-10 space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-400">
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span>🚀 Bienvenue sur la communauté officielle SEN-AURA-TECH</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Le digital au service des entreprises, des compétences et des opportunités
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          SEN-AURA-TECH est une communauté dédiée au <strong>numérique</strong>, à l'<strong>informatique</strong>, à l'<strong>innovation</strong> et aux <strong>opportunités professionnelles</strong> au Sénégal.
        </p>
      </div>

      {/* HERO BANNER WHATSAPP COMMUNITY GROUP (Pôle d'action immédiat) */}
      <div className="relative z-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border-2 border-emerald-500/40 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <WhatsAppIcon className="w-8 h-8 fill-slate-950" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Groupe WhatsApp Officiel
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Rejoignez le Groupe WhatsApp SEN AURA TECH
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Accédez aux offres d'emploi exclusives, stages, missions de freelances tech, opportunités de partenariats et entraide entre développeurs et professionnels du Sénégal.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            <a
              href={whatsappGroupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <WhatsAppIcon className="w-4 h-4 fill-slate-950" />
              <span>Intégrer le Groupe WhatsApp</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Afficher le QR Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Highlight Box: Emplois & Candidatures Prioritaires */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Opportunités & Matching */}
        <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-amber-500/40 transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>💼 Accès Prioritaire aux Offres & Stages</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Lorsqu'une offre d'emploi ou un appel à candidature correspondant aux compétences recherchées est publié, les membres de la communauté <strong>SEN-AURA-TECH</strong> sont informés en priorité et peuvent transmettre leur CV instantanément.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsCvModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md shadow-amber-500/20"
            >
              <FileText className="w-4 h-4" />
              <span>Déposer mon CV & Profil Professionnel</span>
            </button>
          </div>
        </div>

        {/* Card 2: Partage de Profil & Réseau */}
        <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🤝 Connecter les Compétences aux Projets</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Rejoindre SEN-AURA-TECH, c'est intégrer une communauté dynamique qui valorise votre expertise, propose des formations régulières et vous connecte aux grandes entreprises et startups technologiques du Sénégal.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <a
              href="mailto:senauratech@gmail.com"
              className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-amber-300 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>senauratech@gmail.com</span>
            </a>
            <a
              href="https://wa.me/221705334611"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl bg-emerald-950/40 border border-emerald-700/60 hover:border-emerald-400 text-emerald-300 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <span>💬 Hotline WhatsApp : +221 70 533 46 11</span>
            </a>
          </div>
        </div>

      </div>

      {/* Pillars of Activity / What We Share */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-400">Services & Partages Communautaires</span>
            <h3 className="text-lg sm:text-xl font-black text-white">Ce Que Nous Partageons au Quotidien</h3>
          </div>
        </div>

        {/* 2-columns grid on mobile, 4-columns on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {offerings.map((item, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900/80 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg sm:text-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  {item.icon}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h4>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed pt-1.5 line-clamp-3 sm:line-clamp-none">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Official Channels Grid with Animated Masterpiece Cards (Hidden on mobile as requested) */}
      <div className="hidden sm:block relative z-10 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-950/80 border border-amber-500/20 space-y-5 sm:space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400">
            <span>✨ Hub Réseaux Sociaux & Canaux Officiels</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-white">
            📲 Suivez-nous sur toutes nos plateformes officielles
          </h3>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            Abonnez-vous pour ne manquer aucune opportunité d'emploi, appel à projets, cours ou tutoriel en direct.
          </p>
        </div>

        <SocialPillsBar variant="cards" />
      </div>

      {/* CV Submission Modal */}
      <CvSubmissionModal
        isOpen={isCvModalOpen}
        onClose={() => setIsCvModalOpen(false)}
      />

      {/* WhatsApp Group QR Modal */}
      <WhatsAppGroupModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />

    </section>
  );
};

