import React, { useState } from "react";
import { generateGenericPDF } from "../../lib/pdfGenerator";
import {
  Briefcase,
  FileSearch,
  TrendingUp,
  Calendar,
  CheckCircle2,
  FileText,
  Layers,
  Cpu,
  Database,
  Cloud,
  ShieldCheck,
  Network,
  Wrench,
  Globe,
  Compass,
  Headphones,
  GraduationCap,
  Rocket,
  Edit3,
  BarChart3,
  PieChart,
  Users,
  Award,
  CheckSquare,
  Download,
  Upload,
  PenTool,
  HelpCircle,
  Send,
  Clock,
  Sparkles,
  Zap,
  UserCheck,
  Building2,
  Landmark,
  Target,
  Filter,
  Check,
  ChevronRight,
  MessageSquare,
  DollarSign,
  FileSpreadsheet,
  BookOpen
} from "lucide-react";
import { formatCurrency } from "../../config/constants";

interface ConseilViewProps {
  onOpenQuoteModal: (pole: any, title: string) => void;
  currency: "FCFA" | "EUR";
}

export const ConseilView: React.FC<ConseilViewProps> = ({
  onOpenQuoteModal,
  currency,
}) => {
  // Navigation Tabs for 10 Domaines & Interactive Views
  const [activeTab, setActiveTab] = useState<
    | "D1_TRANSFO"
    | "D2_PMO"
    | "D3_CONSEIL_ENTREPRISE"
    | "D4_ADMIN_PUBLIQUE"
    | "D5_ME"
    | "D6_AUDIT_QUALITE"
    | "D7_ETUDES"
    | "D8_FORMATION"
    | "D9_STARTUP"
    | "D10_REDACTION"
    | "CLIENT_DASHBOARD"
    | "DIAGNOSTIC_TOOL"
  >("D1_TRANSFO");

  // Diagnostic Digital Tool State
  const [diagSector, setDiagSector] = useState("Secteur Privé / PME");
  const [diagMaturity, setDiagMaturity] = useState("Faible (Processus Papier)");
  const [diagNeed, setDiagNeed] = useState("Dématérialisation & GED");
  const [diagSubmitted, setDiagSubmitted] = useState(false);

  // Consultation Meeting Booking State
  const [bookDate, setBookDate] = useState("");
  const [bookDomain, setBookDomain] = useState("Transformation Digitale & SDSI");
  const [bookSuccess, setBookSuccess] = useState(false);

  // M&E Indicator Generator State
  const [meProjectName, setMeProjectName] = useState("");
  const [meTargetGroup, setMeTargetGroup] = useState("");
  const [meSuccess, setMeSuccess] = useState(false);

  // Startup Pitch / BMC State
  const [startupIdea, setStartupIdea] = useState("");
  const [startupStage, setStartupStage] = useState("Idéation / POC");
  const [startupSuccess, setStartupSuccess] = useState(false);

  // Document Order State
  const [docType, setDocType] = useState("Réponse à un Appel d'Offres (DAO)");
  const [docNotes, setDocNotes] = useState("");
  const [docSuccess, setDocSuccess] = useState(false);

  // Client Dashboard Active Sub-tab
  const [dashSubTab, setDashSubTab] = useState<"MISSIONS" | "LIVRABLES" | "REUNIONS" | "INDICATEURS" | "CONTRATS">("MISSIONS");
  const [contractSigned, setContractSigned] = useState(false);

  const handleDiagnosticSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDiagSubmitted(true);
    setTimeout(() => setDiagSubmitted(false), 5000);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookDate) return;
    setBookSuccess(true);
    setTimeout(() => setBookSuccess(false), 4000);
  };

  const handleMeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meProjectName.trim()) return;
    setMeSuccess(true);
    setTimeout(() => setMeSuccess(false), 4000);
  };

  const handleStartupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupIdea.trim()) return;
    setStartupSuccess(true);
    setTimeout(() => setStartupSuccess(false), 4000);
  };

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDocSuccess(true);
    setTimeout(() => setDocSuccess(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-4xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/30">
          Pôle 3 • Conseil, Ingénierie & Accompagnement
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Expertise Stratégique, PMO, M&E & Administration Publique
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl mx-auto">
          Accompagnement sur-mesure pour Ministères, Collectivités, Bailleurs Internationaux (Banque Mondiale, UNDP, GIZ), PME et Startups. De la gouvernance au Suivi-Évaluation (M&E).
        </p>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
          <button
            onClick={() => setActiveTab("CLIENT_DASHBOARD")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "CLIENT_DASHBOARD"
                ? "bg-blue-500 text-slate-950 shadow-lg shadow-blue-500/20"
                : "bg-slate-900 border border-blue-500/30 text-blue-300 hover:bg-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4" /> 📊 Tableau de Bord Client & Missions
          </button>

          <button
            onClick={() => setActiveTab("DIAGNOSTIC_TOOL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "DIAGNOSTIC_TOOL"
                ? "bg-blue-500 text-slate-950 shadow-lg shadow-blue-500/20"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" /> ⚡ Diagnostic Digital Instantané
          </button>
        </div>
      </div>

      {/* 10 DOMAINES NAVIGATION BAR */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-400" /> Domaines d'Expertise Stratégique :
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {[
            { id: "D1_TRANSFO", label: "1. Transformation Digitale", icon: TrendingUp },
            { id: "D2_PMO", label: "2. Gestion de Projet (PMO)", icon: Layers },
            { id: "D3_CONSEIL_ENTREPRISE", label: "3. Conseil en Entreprise", icon: Briefcase },
            { id: "D4_ADMIN_PUBLIQUE", label: "4. Admin & Gouvernance", icon: Landmark },
            { id: "D5_ME", label: "5. Suivi & Évaluation (M&E)", icon: BarChart3 },
            { id: "D6_AUDIT_QUALITE", label: "6. Audit & Qualité ISO", icon: ShieldCheck },
            { id: "D7_ETUDES", label: "7. Études & Recherche", icon: FileSearch },
            { id: "D8_FORMATION", label: "8. Renforcement Capa.", icon: GraduationCap },
            { id: "D9_STARTUP", label: "9. Accompagnement Startups", icon: Rocket },
            { id: "D10_REDACTION", label: "10. Rédaction Pro & DAO", icon: PenTool },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-2.5 rounded-xl text-[11px] font-bold text-left transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-md shadow-blue-500/10"
                    : "bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-white hover:border-slate-700"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DOMAINE 1: TRANSFORMATION DIGITALE */}
      {activeTab === "D1_TRANSFO" && (
        <div className="space-y-8">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Domaine 1 — Transformation Digitale & SDSI</h2>
                <p className="text-xs text-slate-400">Diagnostic, Schéma Directeur des Systèmes d'Information (SDSI), Dématérialisation & Conduite du changement.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Audit & Diagnostic Digital", desc: "Évaluation de la maturité numérique globale de vos processus et infrastructures.", tag: "Diagnostic 360°" },
                { title: "Schéma Directeur (SDSI)", desc: "Feuille de route stratégique IT sur 3 à 5 ans alignée avec la vision globale de l'organisation.", tag: "Gouvernance IT" },
                { title: "GED & Dématérialisation", desc: "Zéro papier : numérisation, archivage à valeur probante et circuits de validation électroniques.", tag: "Processus Zéro Papier" },
                { title: "Automatisation des Procédures", desc: "Digitalisation des demandes d'autorisations, permis et flux internes.", tag: "Workflows Métier" },
                { title: "Conduite du Changement", desc: "Ateliers d'adhésion des équipes, formations et accompagnement au déploiement.", tag: "Accompagnement Humain" },
                { title: "Gouvernance & Sécurité SI", desc: "Charte informatique, politiques d'accès et plans de continuité d'activité (PCA).", tag: "Normes & Sécurité" },
              ].map((serv, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      {serv.tag}
                    </span>
                    <h3 className="text-sm font-bold text-white">{serv.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{serv.desc}</p>
                  </div>
                  <button
                    onClick={() => onOpenQuoteModal("CONSEIL", serv.title)}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 mt-2"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Réserver cette Mission
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 2: GESTION DE PROJET (PMO) */}
      {activeTab === "D2_PMO" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 2 — Gestion de Projet & AMOA (PMO)</h2>
              <p className="text-xs text-slate-400">Assistance à Maîtrise d'Ouvrage (AMOA), études de faisabilité, gestion budgétaire, risques et reporting.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" /> Services PMO & AMOA Inclus
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Étude de faisabilité technique, financière et organisationnelle</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Rédaction des termes de référence (TDR) & Cahier des charges</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Planification PERT/Gantt & Gestion des risques stratégiques</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Suivi budgétaire rigoureux & Contrôle des prestations fournisseurs</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Demander l'Affectation d'un Chef de Projet AMOA</h3>
              <p className="text-xs text-slate-400">Un expert senior qualifié (PMP/PRINCE2) pour piloter l'exécution de vos chantiers.</p>
              <button
                onClick={() => onOpenQuoteModal("CONSEIL", "Délégation Chef de Projet PMO / AMOA")}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Solliciter une Mission AMOA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 3: CONSEIL EN ENTREPRISE */}
      {activeTab === "D3_CONSEIL_ENTREPRISE" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 3 — Conseil en Entreprise & Organisation RH</h2>
              <p className="text-xs text-slate-400">Structuration de PME, diagnostics organisationnels, optimisation des processus RH et gouvernance.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Création & Structuration</h3>
              <p className="text-xs text-slate-400">Accompagnement juridique, organigrammes et politiques internes pour entreprises en croissance.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Optimisation RH & Processus</h3>
              <p className="text-xs text-slate-400">Fiches de postes, évaluation des compétences et cartographie des processus métiers.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Développement Stratégique</h3>
              <p className="text-xs text-slate-400">Plans de développement quinquennaux, recherche de partenariats et levées de fonds.</p>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 4: ADMINISTRATION PUBLIQUE */}
      {activeTab === "D4_ADMIN_PUBLIQUE" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 4 — Administration Publique, Collectivités & Gouvernance</h2>
              <p className="text-xs text-slate-400">Modernisation administrative, décentralisation, gouvernance locale et manuels de procédures de services publics.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-amber-400">Gouvernance Locale & Collectivités</h3>
              <p className="text-xs text-slate-300">Plan de développement communal (PDC), optimisation des recettes locales et numérisation de l'état civil.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-blue-400">Modernisation des Services Publics</h3>
              <p className="text-xs text-slate-300">Élaboration de manuels de procédures administratives, réorganisation institutionnelle et guichets uniques.</p>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 5: SUIVI, ÉVALUATION & PERFORMANCE (M&E) */}
      {activeTab === "D5_ME" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-blue-500/30 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 5 — Suivi, Évaluation & Performance (M&E)</h2>
              <p className="text-xs text-slate-400">Cadre logique, Théorie du changement, évaluations mi-parcours & finales pour bailleurs de fonds (UNDP, BM, GIZ).</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Générateur de Plan Suivi-Évaluation (M&E)</h3>
            {meSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                ✓ Plan M&E généré avec succès ! Le cadre logique et les KPI ont été transmis.
              </div>
            )}
            <form onSubmit={handleMeSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={meProjectName}
                onChange={(e) => setMeProjectName(e.target.value)}
                placeholder="Nom du Projet / Programme (ex: USAID-PASA-2026)"
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
              <input
                type="text"
                required
                value={meTargetGroup}
                onChange={(e) => setMeTargetGroup(e.target.value)}
                placeholder="Population Cible / Zone d'Impact"
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Concevoir le Cadre Logique M&E
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DOMAINE 6: AUDIT & QUALITÉ */}
      {activeTab === "D6_AUDIT_QUALITE" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 6 — Audit Organisationnel, Informatique & ISO</h2>
              <p className="text-xs text-slate-400">Audits de conformité, gestion des risques, contrôle interne et préparation à la certification ISO 9001 / 27001.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              "Audit Organisationnel",
              "Audit Informatique (IT Audit)",
              "Audit Qualité ISO 9001",
              "Audit Sécurité ISO 27001",
              "Cartographie des Risques",
              "Contrôle Interne & Procédures",
              "Plan de Redressement Qualité",
              "Certification & Normes",
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOMAINE 7: ÉTUDES & RECHERCHE */}
      {activeTab === "D7_ETUDES" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <FileSearch className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 7 — Études de Marché & Enquêtes Socio-Économiques</h2>
              <p className="text-xs text-slate-400">Études de marché, enquêtes de terrain numériques (KoboToolbox/ODK), analyses statistiques SPSS/Stata.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Enquêtes de Terrain Digitales</h3>
              <p className="text-xs text-slate-400">Collecte mobile géolocalisée d'enquêtes auprès des ménages ou entreprises.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <PieChart className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Analyse Statistique Econométrique</h3>
              <p className="text-xs text-slate-400">Traitements de données quantitatives et qualitatives pour rapports d'impact.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Cartographie des Acteurs</h3>
              <p className="text-xs text-slate-400">Analyse de la concurrence, chaîne de valeur sectorielle et opportunités d'investissement.</p>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 8: FORMATION & RENFORCEMENT */}
      {activeTab === "D8_FORMATION" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 8 — Formation Executive & Renforcement des Capacités</h2>
              <p className="text-xs text-slate-400">Ateliers, séminaires de haut niveau, coaching d'équipe et renforcement institutionnel.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Leadership & Management Stratégique",
              "Gestion de Projet PMP & Agilité Scrum",
              "Conduite de la Transformation Digitale",
              "Suivi-Évaluation de Projets Bailleurs",
              "Bonne Gouvernance & Contrôle Interne",
              "Gestion d'Équipe & Communication",
              "Rédaction Administrative de Point",
              "Analyse de Données PowerBI & Excel",
            ].map((course, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase">Executive Education</span>
                <h4 className="text-xs font-bold text-white">{course}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOMAINE 9: ACCOMPAGNEMENT STARTUPS */}
      {activeTab === "D9_STARTUP" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-blue-500/30 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 9 — Accompagnement Startups, Incubation & CTO as a Service</h2>
              <p className="text-xs text-slate-400">Validation d'idée, Business Model Canvas (BMC), Business Plan, MVP rapide, Pitch Deck et CTO délégué.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Soumettre un Projet Startup pour Incubation / CTO as a Service</h3>
            {startupSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                ✓ Candidature reçue ! Notre équipe Startup vous recontactera sous 24h pour le Pitch.
              </div>
            )}
            <form onSubmit={handleStartupSubmit} className="space-y-3">
              <textarea
                required
                rows={3}
                value={startupIdea}
                onChange={(e) => setStartupIdea(e.target.value)}
                placeholder="Décrivez votre idée innovante ou votre produit..."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
              <div className="flex items-center gap-3">
                <select
                  value={startupStage}
                  onChange={(e) => setStartupStage(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Idéation / POC">Stade : Idéation / POC</option>
                  <option value="MVP existant">Stade : MVP existant</option>
                  <option value="Recherche Levée de fonds">Stade : Levée de fonds</option>
                </select>
                <button
                  type="submit"
                  className="py-2 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Postuler à l'Incubation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOMAINE 10: RÉDACTION & ASSISTANCE PROFESSIONNELLE */}
      {activeTab === "D10_REDACTION" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 10 — Rédaction Professionnelle & Réponses aux Appels d'Offres (DAO)</h2>
              <p className="text-xs text-slate-400">Montage d'offres techniques pour marchés publics, notes conceptuelles, rapports d'activité et traductions.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Commander la Rédaction d'un Document Technique / DAO</h3>
            {docSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                ✓ Commande prise en compte ! Un consultant réducteur vous contactera immédiatement.
              </div>
            )}
            <form onSubmit={handleDocSubmit} className="space-y-3">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="Réponse à un Appel d'Offres (DAO)">Réponse à un Appel d'Offres (DAO / Offre Technique)</option>
                <option value="Note Conceptuelle pour Bailleurs">Note Conceptuelle pour Bailleurs (Concept Note)</option>
                <option value="Rapport Annuel & Plan Stratégique">Rapport Annuel & Plan Stratégique</option>
                <option value="Manuel de Procédure Administratif">Manuel de Procédure Administratif</option>
              </select>
              <textarea
                rows={3}
                value={docNotes}
                onChange={(e) => setDocNotes(e.target.value)}
                placeholder="Consignes particulières ou contexte du marché..."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Valider la Demande de Rédaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC DIGITAL TOOL VIEW */}
      {activeTab === "DIAGNOSTIC_TOOL" && (
        <div className="p-8 rounded-3xl bg-radial from-slate-900 via-slate-950 to-slate-900 border border-blue-500/30 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Outil d'Évaluation Instantané</span>
            <h2 className="text-2xl font-black text-white">Diagnostic Digital de votre Organisation</h2>
            <p className="text-xs text-slate-400">Renseignez les caractéristiques de votre structure pour recevoir une feuille de route personnalisée.</p>
          </div>

          {diagSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 space-y-3">
              <h3 className="text-lg font-bold text-emerald-300">✓ Diagnostic Généré avec Succès !</h3>
              <p className="text-xs text-slate-300">
                Score estimé de maturité digitale : <strong className="text-amber-400">42 / 100</strong> (Maturité Intermédiaire).
              </p>
              <p className="text-xs text-slate-400">
                Priorités recommandées : 1. Numérisation des archives (GED) • 2. Mise en place d'un Schéma Directeur SDSI sur 3 ans • 3. Formation de l'équipe de direction.
              </p>
              <button
                onClick={() => onOpenQuoteModal("CONSEIL", "Restitution du Diagnostic Digital & Feuille de Route")}
                className="py-2.5 px-5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Planifier la Restitution du Diagnostic
              </button>
            </div>
          ) : (
            <form onSubmit={handleDiagnosticSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Type d'Organisation</label>
                <select
                  value={diagSector}
                  onChange={(e) => setDiagSector(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Secteur Privé / PME">Secteur Privé / PME</option>
                  <option value="Administration Publique / Ministère">Administration Publique / Ministère</option>
                  <option value="ONG / Organisation Internationale">ONG / Organisation Internationale</option>
                  <option value="Collectivité Territoriale">Collectivité Territoriale</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Maturité Numérique Actuelle</label>
                <select
                  value={diagMaturity}
                  onChange={(e) => setDiagMaturity(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Faible (Processus Papier)">Faible (Processus papier prédominants)</option>
                  <option value="Moyenne (Outils isolés)">Moyenne (Utilisation d'outils bureautiques isolés)</option>
                  <option value="Avancée (Système ERP/CRM)">Avancée (ERP en place mais à moderniser)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Objectif Prioritaire</label>
                <select
                  value={diagNeed}
                  onChange={(e) => setDiagNeed(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Dématérialisation & GED">Dématérialisation & GED</option>
                  <option value="Schéma Directeur SDSI">Schéma Directeur SDSI</option>
                  <option value="Audit de Sécurité & Conformité">Audit de Sécurité & Conformité</option>
                  <option value="Système de Suivi-Évaluation M&E">Système de Suivi-Évaluation M&E</option>
                </select>
              </div>

              <div className="md:col-span-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Lancer le Calcul du Diagnostic
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TABLEAU DE BORD CLIENT COMPLET */}
      {activeTab === "CLIENT_DASHBOARD" && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-blue-500/30 space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Espace Sécurisé Client & Institution</span>
              <h2 className="text-2xl font-black text-white">Tableau de Bord des Missions Conseil & AMOA</h2>
              <p className="text-xs text-slate-400">Suivi des livrables, réunions de cadrage, indicateurs M&E et contrats signés.</p>
            </div>

            <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/40">
              Organisation : Ministère de la Transition Numérique (MCTR-2026)
            </span>
          </div>

          {/* Sub Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {[
              { id: "MISSIONS", label: "Missions & Projets" },
              { id: "LIVRABLES", label: "Livrables & Rapports" },
              { id: "REUNIONS", label: "Planifier une Réunion" },
              { id: "INDICATEURS", label: "KPI & Suivi-Évaluation" },
              { id: "CONTRATS", label: "Contrats & Signature Elec." },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setDashSubTab(sub.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dashSubTab === sub.id
                    ? "bg-blue-500 text-slate-950"
                    : "bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* SUB TAB 1: MISSIONS */}
          {dashSubTab === "MISSIONS" && (
            <div className="space-y-3">
              {[
                { name: "Schéma Directeur SDSI 2026-2029", status: "En cours (60%)", lead: "Dr. Fall (Consultant Senior)" },
                { name: "Audit de Sécurité des Infrastructures Publiques", status: "Terminé", lead: "M. Ndiaye (Expert SecOps)" },
                { name: "Manuel de Procédure de la Direction Administrative", status: "En Relecture", lead: "Mme Sow (Ingénieure PMO)" },
              ].map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">{m.name}</h4>
                    <p className="text-[11px] text-slate-400">Chef de Mission : {m.lead}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* SUB TAB 2: LIVRABLES */}
          {dashSubTab === "LIVRABLES" && (
            <div className="space-y-3">
              {[
                { title: "Rapport_Diagnostic_Maturite_2026.pdf", size: "4.2 Mo", date: "01 Août 2026" },
                { title: "Feuille_de_Route_SDSI_V1.1.pdf", size: "8.1 Mo", date: "04 Août 2026" },
                { title: "Manuel_Procedures_Gouvernance.docx", size: "2.4 Mo", date: "06 Août 2026" },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                      <p className="text-[10px] text-slate-500">{doc.size} • Mis à disposition le {doc.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      generateGenericPDF(
                        doc.title,
                        `Rapport d'Audit & Conseil : ${doc.title.replace(/_/g, " ").replace(".pdf", "").replace(".docx", "")}`,
                        "SEN AURA CONSEIL & AUDIT",
                        [
                          {
                            title: "Synthèse Exécutive",
                            content: "Ce document présente les résultats de l'audit stratégique, l'analyse des écarts de conformité et la feuille de route de transformation numérique.",
                          },
                          {
                            title: "Recommandations Prioritaires",
                            content: "1. Renforcement de la cybersécurité et du plan de continuité d'activité.\n2. Normalisation des processus ISO 27001 / ISO 9001.\n3. Modernisation de l'infrastructure SI et gouvernance de données.",
                          },
                          {
                            title: "Prochaines Étapes",
                            content: "Mise en œuvre du comité de pilotage hebdomadaire et suivi des indicateurs de performance.",
                          },
                        ]
                      );
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-blue-300 text-xs font-bold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Télécharger
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SUB TAB 3: REUNIONS */}
          {dashSubTab === "REUNIONS" && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Planifier une Réunion Stratégique avec les Consultants</h3>
              {bookSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  ✓ Réunion programmée dans l'agenda de votre Chef de Projet !
                </div>
              )}
              <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="date"
                  required
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
                <select
                  value={bookDomain}
                  onChange={(e) => setBookDomain(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Transformation Digitale & SDSI">Objet : Transformation Digitale & SDSI</option>
                  <option value="Validation de Livrables PMO">Objet : Validation de Livrables PMO</option>
                  <option value="Revue des indicateurs M&E">Objet : Revue des indicateurs M&E</option>
                </select>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Confirmer la Réunion
                </button>
              </form>
            </div>
          )}

          {/* SUB TAB 4: INDICATEURS */}
          {dashSubTab === "INDICATEURS" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Procédures Dématérialisées</span>
                <div className="text-2xl font-black text-blue-400 font-mono">18 / 24</div>
                <p className="text-[10px] text-emerald-400">Target 2026 atteinte à 75%</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Personnel Formé</span>
                <div className="text-2xl font-black text-emerald-400 font-mono">142 Agents</div>
                <p className="text-[10px] text-slate-400">Sessions du Pôle 3</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Taux de Conformité ISO</span>
                <div className="text-2xl font-black text-amber-400 font-mono">92 %</div>
                <p className="text-[10px] text-slate-400">Audit de Juin 2026</p>
              </div>
            </div>
          )}

          {/* SUB TAB 5: CONTRATS */}
          {dashSubTab === "CONTRATS" && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Contrat de Prestation de Conseil AMOA #CTR-2026-MCTR</h4>
                  <p className="text-xs text-slate-400">Accompagnement annuel de maîtrise d'ouvrage stratégique</p>
                </div>
                {contractSigned ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    ✓ Contrat Signé Électroniquement
                  </span>
                ) : (
                  <button
                    onClick={() => setContractSigned(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                  >
                    Procéder à la Signature Électronique
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
