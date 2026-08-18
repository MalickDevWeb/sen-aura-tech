import React, { useState } from "react";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { generateGenericPDF, exportInvoicePDF } from "../../lib/pdfGenerator";
import {
  Code,
  Smartphone,
  Bot,
  ShieldCheck,
  Cpu,
  ArrowRight,
  CheckCircle2,
  FileText,
  Layers,
  Database,
  Cloud,
  Terminal,
  Activity,
  Download,
  HelpCircle,
  Clock,
  Sparkles,
  Zap,
  Lock,
  GitBranch,
  Check,
  Server,
  Network,
  Wrench,
  Globe,
  Compass,
  Headphones,
  GraduationCap,
  Calendar,
  MessageSquare,
  PenTool,
  Upload,
  Play,
  ShieldAlert,
  Wifi,
  HardDrive,
  RefreshCw,
  Star,
  CheckSquare,
  ChevronRight,
  Filter,
  DollarSign,
  UserCheck
} from "lucide-react";
import { formatCurrency } from "../../config/constants";
import { store } from "../../database/store";
import { UneSemaineUneSolutionSection } from "../../shared/components/UneSemaineUneSolutionSection";

interface SolutionsNumeriquesViewProps {
  onOpenQuoteModal: (pole: any, title: string) => void;
  currency: "FCFA" | "EUR";
}

export const SolutionsNumeriquesView: React.FC<SolutionsNumeriquesViewProps> = ({
  onOpenQuoteModal,
  currency,
}) => {
  // Main view modes or Domaine selections
  const [activeTab, setActiveTab] = useState<
    | "D1_DEV"
    | "D2_IA"
    | "D3_DEVOPS"
    | "D4_CYBER"
    | "D5_RESEAUX"
    | "D6_MAINTENANCE"
    | "D7_HEBERGEMENT"
    | "D8_BUREAU"
    | "D9_SUPPORT"
    | "D10_FORMATION"
    | "SIMULATOR"
    | "ARCHITECTURE"
    | "CLIENT_DASHBOARD"
    | "PROGRAMME_1SEM_1APP"
  >("D1_DEV");

  // Simulator State
  const [selectedTech, setSelectedTech] = useState<string[]>([
    "Frontend React / Next.js",
    "Paiement Wave & Orange Money",
    "Base de données PostgreSQL",
    "Garantie Maintenance 6 mois",
  ]);
  const [appType, setAppType] = useState<"WEB" | "MOBILE" | "ERP" | "AI" | "DEVOPS" | "CYBER">("WEB");
  const [slaLevel, setSlaLevel] = useState<"STANDARD" | "ENTERPRISE_247">("STANDARD");

  // Support Ticket Form State
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Bug / Dysfonctionnement");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Meeting Booking State
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTopic, setMeetingTopic] = useState("Analyse Cahier des Charges");
  const [meetingSuccess, setMeetingSuccess] = useState(false);

  // Specification Builder / Upload State
  const [specTitle, setSpecTitle] = useState("");
  const [specFile, setSpecFile] = useState<File | null>(null);
  const [specSuccess, setSpecSuccess] = useState(false);

  // Electronic Signature State
  const [contractSigned, setContractSigned] = useState(false);

  // Maintenance Renewal State
  const [renewalSuccess, setRenewalSuccess] = useState(false);

  // Course Registration State
  const [selectedCourse, setSelectedCourse] = useState("React & Next.js Masterclass");
  const [courseSuccess, setCourseSuccess] = useState(false);

  const techOptions = [
    "Frontend React / Next.js",
    "App Mobile Flutter / React Native",
    "Backend Node.js Microservices",
    "Base de données PostgreSQL / Redis",
    "Paiement Wave & Orange Money",
    "Agent IA Gemini 3.6 & OCR",
    "Docker, Kubernetes & AWS",
    "Audit Sécurité OWASP & PenTest",
    "Authentification SSO / OAuth2",
    "Support & SLA H24 7j/7",
  ];

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const calculateCost = () => {
    let base = 400000;
    if (appType === "MOBILE") base = 650000;
    if (appType === "ERP") base = 950000;
    if (appType === "AI") base = 800000;
    if (appType === "DEVOPS") base = 500000;
    if (appType === "CYBER") base = 600000;

    const techBonus = selectedTech.length * 120000;
    const slaBonus = slaLevel === "ENTERPRISE_247" ? 250000 : 0;
    return base + techBonus + slaBonus;
  };

  const estimatedCost = calculateCost();

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;
    setTicketSuccess(true);
    setTicketSubject("");
    setTimeout(() => setTicketSuccess(false), 4000);
  };

  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingDate) return;
    setMeetingSuccess(true);
    setTimeout(() => setMeetingSuccess(false), 4000);
  };

  const handleSpecSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specTitle.trim()) return;
    setSpecSuccess(true);
    setSpecTitle("");
    setSpecFile(null);
    setTimeout(() => setSpecSuccess(false), 4000);
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCourseSuccess(true);
    setTimeout(() => setCourseSuccess(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-4xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
          Pôle 1 • Solutions Numériques & Ingénierie Logicielle
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Conception, IA, Cloud & Transformation SI
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto">
          Accompagnement complet des entreprises, administrations et startups dans le développement sur-mesure, l'intégration d'IA, le DevOps, la cybersécurité et la maintenance applicative.
        </p>

        {/* Top Feature Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
          <button
            onClick={() => setActiveTab("PROGRAMME_1SEM_1APP")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "PROGRAMME_1SEM_1APP"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-slate-800 animate-pulse"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> 🚀 Programme : 1 Semaine, 1 App, 1 Solution
          </button>
          <button
            onClick={() => setActiveTab("CLIENT_DASHBOARD")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "CLIENT_DASHBOARD"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4" /> 📊 Dashboard Client & Projets
          </button>
          <button
            onClick={() => setActiveTab("SIMULATOR")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "SIMULATOR"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4" /> ⚡ Simulateur de Devis & SLA
          </button>
          <button
            onClick={() => setActiveTab("ARCHITECTURE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "ARCHITECTURE"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" /> 🏛️ Architecture Hexagonale
          </button>
        </div>
      </div>

      {/* 10 DOMAINES NAVIGATION TABS */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-amber-400" /> Domaines d'Expertise du Pôle 1 :
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {[
            { id: "D1_DEV", label: "1. Développement Logiciel", icon: Code },
            { id: "D2_IA", label: "2. Intelligence Artificielle", icon: Bot },
            { id: "D3_DEVOPS", label: "3. DevOps & Cloud", icon: Cloud },
            { id: "D4_CYBER", label: "4. Cybersécurité", icon: ShieldCheck },
            { id: "D5_RESEAUX", label: "5. Réseaux & Telecom", icon: Network },
            { id: "D6_MAINTENANCE", label: "6. Maintenance SI", icon: Wrench },
            { id: "D7_HEBERGEMENT", label: "7. Hébergement & Noms", icon: Globe },
            { id: "D8_BUREAU", label: "8. Bureau d'Études", icon: Compass },
            { id: "D9_SUPPORT", label: "9. Support Technique", icon: Headphones },
            { id: "D10_FORMATION", label: "10. Formations Numériques", icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-2.5 rounded-xl text-[11px] font-bold text-left transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10"
                    : "bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-white hover:border-slate-700"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TABS CONTENT */}

      {/* DOMAINE 1: DÉVELOPPEMENT LOGICIEL */}
      {activeTab === "D1_DEV" && (
        <div className="space-y-8">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Domaine 1 — Développement Logiciel sur-mesure</h2>
                <p className="text-xs text-slate-400">Applications Web, Mobile, ERP/CRM métier et Architectures Microservices Backend.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              {/* Module Web */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Module Web</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300">SaaS & Portails</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Applications Web & ERP</h3>
                  <p className="text-xs text-slate-400">Sites vitrines, institutionnels, e-commerce, marketplaces, ERP, CRM, LMS, portails métier, intranets et dashboards.</p>
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-semibold text-slate-300">Services :</p>
                    <div className="flex flex-wrap gap-1">
                      {["Next.js", "React", "Marketplace", "ERP/CRM", "LMS", "GED"].map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onOpenQuoteModal("SOLUTIONS_NUMERIQUES", "Développement Web & ERP")}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1 mt-3"
                >
                  <FileText className="w-3.5 h-3.5" /> Devis Web & ERP
                </button>
              </div>

              {/* Module Mobile */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Module Mobile</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300">iOS & Android</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Applications Mobiles Natifs & Cross-Platform</h3>
                  <p className="text-xs text-slate-400">Applications iOS, Android, Flutter, React Native, PWA avec paiement Wave & Orange Money intégré.</p>
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-semibold text-slate-300">Services :</p>
                    <div className="flex flex-wrap gap-1">
                      {["Flutter", "React Native", "iOS", "Android", "PWA", "Wave API"].map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onOpenQuoteModal("SOLUTIONS_NUMERIQUES", "Développement Mobile Flutter/iOS/Android")}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1 mt-3"
                >
                  <FileText className="w-3.5 h-3.5" /> Devis Mobile
                </button>
              </div>

              {/* Module Backend */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Module Backend</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300">API & Microservices</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Microservices & Integration REST/GraphQL</h3>
                  <p className="text-xs text-slate-400">Architectures API REST, GraphQL, WebSockets temps réel, OAuth2, SSO, passerelles de paiement et intégrations d'anciennes bases.</p>
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-semibold text-slate-300">Services :</p>
                    <div className="flex flex-wrap gap-1">
                      {["Node.js", "GraphQL", "OAuth2", "WebSockets", "Stripe", "PostgreSQL"].map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onOpenQuoteModal("SOLUTIONS_NUMERIQUES", "Développement Backend & API")}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1 mt-3"
                >
                  <FileText className="w-3.5 h-3.5" /> Devis API Backend
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 2: INTELLIGENCE ARTIFICIELLE */}
      {activeTab === "D2_IA" && (
        <div className="space-y-8">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Domaine 2 — Intelligence Artificielle & Automatisation</h2>
                <p className="text-xs text-slate-400">IA Générative Google Gemini, OCR de documents, Chatbots WhatsApp, agents autonomes et workflows n8n.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              
              {/* Module IA Générative */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Module 1 — IA Générative</span>
                <h3 className="text-sm font-bold text-white">Agents RAG & Assistants Multimodaux</h3>
                <p className="text-xs text-slate-400">Chatbots intelligents sur vos propres documents PDF, reconnaissance automatique de pièces d'identité et factures (OCR), traduction et génération automatique de rapports.</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {["Agent Gemini", "RAG PDF", "OCR Factures", "NLP", "Vision AI", "Voice AI"].map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800">
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => onOpenQuoteModal("SOLUTIONS_NUMERIQUES", "Agent IA Générative & RAG")}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors mt-3"
                >
                  Configurer un Agent IA
                </button>
              </div>

              {/* Module Automatisation */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Module 2 — Automatisation de Processus</span>
                <h3 className="text-sm font-bold text-white">Workflows RH, Comptabilité & WhatsApp Bot</h3>
                <p className="text-xs text-slate-400">Automatisation de l'émission des factures, relances clients WhatsApp/SMS automatiques, synchronisation CRM-ERP via n8n et robots comptables.</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {["n8n", "WhatsApp API", "SMS Gateway", "Auto Facturation", "Relances"].map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800">
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => onOpenQuoteModal("SOLUTIONS_NUMERIQUES", "Automatisation n8n & WhatsApp")}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors mt-3"
                >
                  Demander un Audit d'Automatisation
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 3: DEVOPS & CLOUD */}
      {activeTab === "D3_DEVOPS" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 3 — DevOps & Infrastructure Cloud</h2>
              <p className="text-xs text-slate-400">Conteneurisation, Pipelines CI/CD automatisés, Sauvegardes redondantes et Monitoring H24.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Server className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Hébergement Cloud & Kubernetes</h3>
              <p className="text-xs text-slate-400">Gestion de clusters VPS, serveurs dédiés, AWS, Docker containers, mise à l'échelle automatique.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <GitBranch className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Pipelines CI/CD Automatisés</h3>
              <p className="text-xs text-slate-400">GitHub Actions, GitLab CI, Jenkins pour déploiement continu sans interruption de service.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Monitoring & Sauvegardes H24</h3>
              <p className="text-xs text-slate-400">Centralisation des logs, alertes SMS en cas de panne et sauvegardes automatiques horodatées.</p>
            </div>
          </div>

          <button
            onClick={() => onOpenQuoteModal("SOLUTIONS_NUMERIQUES", "DevOps & Infrastructure Cloud")}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            Obtenir une Proposition DevOps
          </button>
        </div>
      )}

      {/* DOMAINE 4: CYBERSÉCURITÉ */}
      {activeTab === "D4_CYBER" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 4 — Cybersécurité & Conformité RGPD / CDP</h2>
              <p className="text-xs text-slate-400">Audits d'intrusion OWASP, Firewalls d'entreprise, chiffrement SSL et protection des données sensibles.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              "Audit de Sécurité OWASP",
              "Tests d'Intrusion (Pentest)",
              "Configuration Firewall & VPN",
              "Authentification MFA & SSO",
              "Conformité CDP Sénégal",
              "Antivirus & EDR Industriel",
              "Chiffrement Données BDD",
              "Gestion Droits & Rôles",
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onOpenQuoteModal("SOLUTIONS_NUMERIQUES", "Audit Cybersécurité & Pentest")}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            Demander un Audit de Sécurité
          </button>
        </div>
      )}

      {/* DOMAINE 5: RÉSEAUX */}
      {activeTab === "D5_RESEAUX" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 5 — Réseaux Informatiques & Télécoms</h2>
              <p className="text-xs text-slate-400">Câblage structuré, Baies de brassage, Bornes Wi-Fi Pro, Fibre Optique et VPN inter-sites.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Wifi className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Installation LAN & Wi-Fi Pro</h3>
              <p className="text-xs text-slate-400">Déploiement de bornes Wi-Fi 6 haute densité pour entreprises et hôtels avec isolation invité.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <HardDrive className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Baies de Brassage & Switchs</h3>
              <p className="text-xs text-slate-400">Câblage structuré Cat6a/Cat7, étiquetage rigoureux, brassage et routeurs Cisco/Mikrotik.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Fibre & VPN Inter-sites</h3>
              <p className="text-xs text-slate-400">Interconnexion sécurisée de vos filiales à Dakar et en région via VPN IPSec étanche.</p>
            </div>
          </div>

          <button
            onClick={() => onOpenQuoteModal("SOLUTIONS_NUMERIQUES", "Installation Réseau & Wi-Fi Pro")}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            Demander une Étude Réseau
          </button>
        </div>
      )}

      {/* DOMAINE 6: MAINTENANCE */}
      {activeTab === "D6_MAINTENANCE" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 6 — Maintenance Applicative & Systèmes</h2>
              <p className="text-xs text-slate-400">Tierce Maintenance Applicative (TMA) : Corrective, Préventive et Évolutive.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-amber-400">Maintenance Corrective</h3>
              <p className="text-xs text-slate-300">Intervention d'urgence en cas d'erreur ou bug critique avec SLA d'astreinte 2h.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400">Maintenance Préventive</h3>
              <p className="text-xs text-slate-300">Mises à jour de sécurité des frameworks, sauvegardes hebdomadaires et nettoyage de la BDD.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-blue-400">Maintenance Évolutive</h3>
              <p className="text-xs text-slate-300">Ajout continu de nouvelles fonctionnalités métier selon les retours de vos utilisateurs.</p>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 7: HÉBERGEMENT */}
      {activeTab === "D7_HEBERGEMENT" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 7 — Noms de Domaine & Emails Professionnels</h2>
              <p className="text-xs text-slate-400">Achat de nom de domaine (.sn, .com), adresses email pro sécurisées et certificats SSL.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Nom de domaine .SN / .COM", desc: "Enregistrement et renouvellement automatique" },
              { title: "Emails Pro Google Workspace", desc: "nom@votreentreprise.sn avec antivirus" },
              { title: "Certificat SSL HTTPS wildcard", desc: "Chiffrement bancaire 256 bits gratuit" },
              { title: "Réseau CDN mondial Cloudflare", desc: "Chargement ultra-rapide des pages web" },
            ].map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white">{s.title}</h4>
                <p className="text-[11px] text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOMAINE 8: BUREAU D'ÉTUDES */}
      {activeTab === "D8_BUREAU" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 8 — Bureau d'Études & Maquettage UX/UI</h2>
              <p className="text-xs text-slate-400">Rédaction de cahiers des charges fonctionnels, prototypes interactifs Figma et études de faisabilité.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">1. Soumettre votre Cahier des Charges</h3>
              {specSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  ✓ Document reçu ! Un ingénieur étudiera votre demande sous 24h.
                </div>
              )}
              <form onSubmit={handleSpecSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  value={specTitle}
                  onChange={(e) => setSpecTitle(e.target.value)}
                  placeholder="Nom de votre projet (ex: ERP BTP Dakar)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
                <div className="relative p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 text-center space-y-2 hover:border-amber-500/50 transition-colors">
                  <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                  <p className="text-[11px] text-slate-300">Sélectionnez ou glissez votre cahier des charges (PDF, Word)</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.zip"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSpecFile(file);
                        await uploadToCloudinary(file, "cahiers_des_charges");
                      }
                    }}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer"
                  />
                  {specFile && (
                    <p className="text-[10px] text-emerald-400 font-bold">✓ Fichier : {specFile.name} téléversé</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Envoyer pour Analyse Gratuite
                </button>
              </form>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">2. Prestations d'Ingénierie</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Rédaction complète du cahier des charges fonctionnel</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Maquettage UI/UX Figma haute fidélité cliquable</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Modélisation d'architecture applicative & schémas BDD</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Études de faisabilité technique & chiffrage ROI</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 9: SUPPORT */}
      {activeTab === "D9_SUPPORT" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 9 — Support Technique & Télémaintenance</h2>
              <p className="text-xs text-slate-400">Assistance multicanale : Hotline téléphonique, tickets dédiés, WhatsApp et prises en main à distance.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Assistance WhatsApp</h4>
              <p className="text-xs text-slate-400">Support réactif 7j/7 pour la gestion d'incidents légers.</p>
              <span className="inline-block text-xs text-amber-400 font-bold font-mono">+221 77 000 00 00</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <HelpCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Centre de Tickets</h4>
              <p className="text-xs text-slate-400">Suivi rigoureux avec numéro de ticket et temps de résolution garanti.</p>
              <button
                onClick={() => setActiveTab("CLIENT_DASHBOARD")}
                className="text-xs text-amber-400 font-bold underline"
              >
                Ouvrir un ticket
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <Terminal className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Télémaintenance AnyDesk</h4>
              <p className="text-xs text-slate-400">Intervention directe à distance par nos ingénieurs système.</p>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 10: FORMATION NUMÉRIQUE */}
      {activeTab === "D10_FORMATION" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Domaine 10 — Formations Numériques Certifiantes</h2>
                <p className="text-xs text-slate-400">Renforcement des compétences de vos équipes en développement, DevOps et IA.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "React 18 & Next.js 14 Masterclass",
              "Développement Mobile Flutter Pro",
              "DevOps, Docker & Kubernetes",
              "Intelligence Artificielle & Gemini AI",
              "Backend Microservices Node.js",
              "Administration Linux & SecOps",
              "PostgreSQL & Optimisation BDD",
              "Laravel 11 & Architectures REST",
            ].map((course, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-400">MODULE PRATIQUE</span>
                  <h4 className="text-xs font-bold text-white">{course}</h4>
                </div>
                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setActiveTab("CLIENT_DASHBOARD");
                  }}
                  className="w-full py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-300 hover:text-amber-300 text-[11px] font-bold transition-colors mt-2"
                >
                  S'inscrire
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: SIMULATEUR DE DEVIS */}
      {activeTab === "SIMULATOR" && (
        <div className="p-8 rounded-3xl bg-radial from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Calculateur de Devis Personnalisé</span>
            <h2 className="text-2xl font-black text-white">Configurez votre projet logiciel en temps réel</h2>
            <p className="text-xs text-slate-400">Sélectionnez le type d'application, les fonctionnalités et le niveau de support requis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Options */}
            <div className="space-y-5">
              
              {/* Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">1. Type d'Application</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "WEB", label: "Web SaaS / Portail" },
                    { id: "MOBILE", label: "App Mobile Wave/OM" },
                    { id: "ERP", label: "ERP / CRM Sur-mesure" },
                    { id: "AI", label: "Agent IA & Chatbot" },
                    { id: "DEVOPS", label: "Cloud & DevOps AWS" },
                    { id: "CYBER", label: "Audit Sécurité OWASP" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setAppType(item.id as any)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                        appType === item.id
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tech stack & modules */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">2. Briques Techniques & Modules</label>
                <div className="flex flex-wrap gap-2">
                  {techOptions.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        selectedTech.includes(tech)
                          ? "bg-amber-500 text-slate-950 font-bold border-amber-400"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      {selectedTech.includes(tech) ? "✓ " : "+ "}
                      {tech}
                    </button>
                  ))}
                </div>
              </div>

              {/* SLA Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">3. Niveau de Support & SLA</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSlaLevel("STANDARD")}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                      slaLevel === "STANDARD"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-slate-800/60 border-slate-700 text-slate-400"
                    }`}
                  >
                    <span>Standard SLA</span>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5">Support 5j/7 • Réponse 24h</p>
                  </button>
                  <button
                    onClick={() => setSlaLevel("ENTERPRISE_247")}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                      slaLevel === "ENTERPRISE_247"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-slate-800/60 border-slate-700 text-slate-400"
                    }`}
                  >
                    <span>Entreprise H24 7j/7</span>
                    <p className="text-[10px] text-amber-400/80 font-normal mt-0.5">Astreinte 2h • Incident Critique</p>
                  </button>
                </div>
              </div>

            </div>

            {/* Price Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Estimation Financière HT</span>
                <div className="text-4xl font-black text-amber-400 font-mono">
                  {formatCurrency(estimatedCost, currency)}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Délai estimé :</span>
                    <span className="font-bold text-white">4 à 6 semaines</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Garantie après livraison :</span>
                    <span className="font-bold text-emerald-400">6 Mois Inclus</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Acompte à la commande :</span>
                    <span className="font-bold text-amber-400">30% (soit {formatCurrency(estimatedCost * 0.3, currency)})</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-300">Récapitulatif des options ({selectedTech.length}) :</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTech.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => onOpenQuoteModal("SOLUTIONS_NUMERIQUES", `Devis ${appType} (${selectedTech.length} modules) - ${formatCurrency(estimatedCost, currency)}`)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
                >
                  Générer Devis Officiel
                </button>
                <button
                  onClick={() => {
                    store.addToCart({
                      id: `sol-${Date.now()}`,
                      name: `Projet Sur-Mesure (${appType})`,
                      category: "Logiciels & Licences",
                      brand: "SEN AURA Software",
                      priceFCFA: estimatedCost,
                      stock: 1,
                      image: "https://res.cloudinary.com/senauratech/image/upload/v1720000000/sen_aura_tech/course_nextjs_fullstack.png",
                      description: `Architecture sur-mesure ${appType} avec ${selectedTech.length} modules et support ${slaLevel}`,
                      specs: { Type: appType, Support: slaLevel, Modules: `${selectedTech.length} sélectionné(s)` }
                    }, 1);
                  }}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  + Ajouter au Panier
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW: ARCHITECTURE HEXAGONALE */}
      {activeTab === "ARCHITECTURE" && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Standards d'Ingénierie SEN AURA</span>
            <h2 className="text-2xl font-black text-white">Architecture Hexagonale & Domain-Driven Design (DDD)</h2>
            <p className="text-xs text-slate-400">
              Chaque logiciel conçu dans ce pôle respecte l'isolation stricte entre le Domaine Métier, les Adaptateurs d'Entrée (API/UI) et les Adaptateurs de Sortie (Bases de données, Paiement Wave/OM).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">1. Adaptateurs d'Entrée (Primary Ports)</h3>
              <p className="text-xs text-slate-400">
                Interfaces utilisateur Web (React/Next.js), Apps Mobiles (Flutter), Points de terminaison API REST / GraphQL et Webhooks d'événements.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-amber-400">2. Cœur Métier Stricte (Domain Core)</h3>
              <p className="text-xs text-slate-300">
                Entités métier purement TypeScript, règles de facturation FCFA, calculs de commissions, logique métier sans aucune dépendance framework.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">3. Adaptateurs de Sortie (Secondary Ports)</h3>
              <p className="text-xs text-slate-400">
                Repositories PostgreSQL, Passerelles de Paiement Wave/Orange Money, Stockage S3/Cloud storage, Modèles Gemini AI.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: TABLEAU DE BORD CLIENT COMPLET */}
      {activeTab === "CLIENT_DASHBOARD" && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Espace Personnel Client</span>
              <h2 className="text-2xl font-black text-white">Tableau de bord Pôle Solutions Numériques</h2>
              <p className="text-xs text-slate-400">Gérez vos projets, contrats, livrables, réunions et tickets en temps réel.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                Espace Vérifié • Client Entreprise
              </span>
            </div>
          </div>

          {/* Grid of Client Workspace Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Sprints & Projects */}
            <div className="space-y-6">
              
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" /> Suivi de Projet & Sprints Agiles
                  </h3>
                  <span className="text-xs text-amber-400 font-bold">75% Accomplis</span>
                </div>

                <div className="space-y-3">
                  {[
                    { title: "Sprint 1 — Cahier des charges, Figma UX & BDD PostgreSQL", status: "TERMINE", date: "02 Août" },
                    { title: "Sprint 2 — API Microservices & Module Paiement Wave", status: "TERMINE", date: "05 Août" },
                    { title: "Sprint 3 — Intégration Agent IA Gemini & OCR Factures", status: "EN_COURS", date: "En Cours" },
                    { title: "Sprint 4 — Tests d'Intrusion OWASP & Déploiement Prod", status: "A_VENIR", date: "12 Août" },
                  ].map((sprint, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{sprint.title}</p>
                        <p className="text-[10px] text-slate-500">{sprint.date}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sprint.status === "TERMINE" ? "bg-emerald-500/20 text-emerald-300" :
                        sprint.status === "EN_COURS" ? "bg-amber-500/20 text-amber-300 animate-pulse" :
                        "bg-slate-800 text-slate-500"
                      }`}>
                        {sprint.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contrats & Signature Electronique */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-amber-400" /> Contrats & Signature Électronique
                </h3>
                
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-200">Contrat_Developpement_SEN_AURA_2026.pdf</p>
                      <p className="text-[10px] text-slate-400">Montant : 1 250 000 FCFA HT</p>
                    </div>
                    {contractSigned ? (
                      <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Signé Électroniquement
                      </span>
                    ) : (
                      <button
                        onClick={() => setContractSigned(true)}
                        className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px]"
                      >
                        Signer le Contrat
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Maintenance Contract Renewal */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" /> Contrat de Maintenance (TMA)
                </h3>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <p className="text-slate-300">Garantie active jusqu'au : <span className="font-bold text-emerald-400">07 Février 2027</span></p>
                  {renewalSuccess ? (
                    <p className="text-emerald-400 font-bold text-[11px]">✓ Demande de renouvellement enregistrée !</p>
                  ) : (
                    <button
                      onClick={() => {
                        setRenewalSuccess(true);
                        setTimeout(() => setRenewalSuccess(false), 4000);
                      }}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[11px] font-bold"
                    >
                      Prolonger le Contrat de Maintenance
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Actions (Meeting, Ticket, Downloads) */}
            <div className="space-y-6">
              
              {/* Planifier Réunion avec Chef de Projet */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" /> Planifier un Point de Suivi avec le Chef de Projet
                </h3>

                {meetingSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    ✓ Réunion planifiée avec succès ! Un lien Google Meet a été envoyé à votre adresse email.
                  </div>
                )}

                <form onSubmit={handleMeetingSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">Sujet de la Réunion</label>
                    <select
                      value={meetingTopic}
                      onChange={(e) => setMeetingTopic(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="Validation Maquettes Figma">Validation Maquettes Figma</option>
                      <option value="Recette & Tests Fonctionnels">Recette & Tests Fonctionnels</option>
                      <option value="Préparation Déploiement Production">Préparation Déploiement Production</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">Date & Heure Souhaitées</label>
                    <input
                      type="datetime-local"
                      required
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    Confirmer la Réunion
                  </button>
                </form>
              </div>

              {/* Support & Incidents Form */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" /> Centre de Support Client & Tickets
                </h3>

                {ticketSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Ticket transmis avec succès à l'équipe technique SEN AURA TECH.
                  </div>
                )}

                <form onSubmit={handleTicketSubmit} className="space-y-3">
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Bug / Dysfonctionnement">Bug / Dysfonctionnement</option>
                    <option value="Demande d'Évolution">Demande d'Évolution</option>
                    <option value="Problème de Serveur / Cloud">Problème de Serveur / Cloud</option>
                  </select>

                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Décrivez brièvement le sujet du ticket..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />

                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    Envoyer le Ticket
                  </button>
                </form>
              </div>

              {/* Deliverables & Invoices */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400" /> Livrables & Factures à Télécharger
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span>Cahier_Des_Charges_Valide.pdf</span>
                    <button
                      onClick={() => {
                        generateGenericPDF(
                          "Cahier_Des_Charges_SEN_AURA.pdf",
                          "Cahier des Charges Technique & Fonctionnel",
                          "SEN AURA SOLUTIONS NUMÉRIQUES",
                          [
                            {
                              title: "Périmètre du Projet",
                              content: "Développement sur-mesure d'une solution logicielle web & mobile cloud native.",
                            },
                            {
                              title: "Spécifications Techniques",
                              content: "Architecture Full-Stack microservices, base de données Firestore/Cloud SQL, sécurisation OAuth2 et déploiement Cloud Run.",
                            },
                            {
                              title: "Calendrier des Livrables",
                              content: "Phase 1 : Mockups & Maquettes • Phase 2 : API & Backend • Phase 3 : Recette & Déploiement.",
                            },
                          ]
                        );
                      }}
                      className="text-amber-400 font-bold flex items-center gap-1 hover:underline text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span>Facture_Acompte_30_Percent.pdf</span>
                    <button
                      onClick={() => {
                        exportInvoicePDF(
                          {
                            invoiceNumber: "SAT-2026-003",
                            transactionRef: "W-9982341",
                            issueDate: new Date().toISOString(),
                            sellerInfo: {
                              companyName: "SEN AURA TECH",
                              tagline: "Solutions numériques & ingénierie logicielle",
                              address: "Avenue Léopold Sédar Senghor, Thiès",
                              phone: "+221 70 533 46 11",
                              website: "papa-malick-teuw-dev-ia.vercel.app"
                            },
                            clientInfo: {
                              name: "El Hadji Touré",
                              phone: "+221 77 651 78 96",
                              address: "Takhikâo, Thiès, Sénégal"
                            },
                            items: [
                              {
                                description: "Conception, développement, déploiement et mise en production d'une plateforme numérique dédiée aux cours particuliers",
                                quantity: 1,
                                unitPriceFCFA: 1500000,
                                totalFCFA: 1500000
                              }
                            ],
                            subtotalFCFA: 1500000,
                            totalFCFA: 1500000,
                            notes: "Conception, développement, déploiement et mise en production d’une plateforme numérique dédiée aux cours particuliers, à l’enseignement et à la formation d’El Hadji Touré à Thiès."
                          },
                          "Facture_Acompte_30_Percent.pdf"
                        );
                      }}
                      className="text-amber-400 font-bold flex items-center gap-1 hover:underline text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* PROGRAMME VEDETTE : 1 SEMAINE = 1 APPLICATION = 1 SOLUTION */}
      {activeTab === "PROGRAMME_1SEM_1APP" && (
        <UneSemaineUneSolutionSection onOpenQuoteModal={onOpenQuoteModal} />
      )}

    </div>
  );
};
