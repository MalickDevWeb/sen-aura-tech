import React, { useState } from "react";
import { OfficialCertificateModal, CertificateData } from "../../components/OfficialCertificateModal";
import { generateGenericPDF } from "../../lib/pdfGenerator";
import {
  GraduationCap,
  Award,
  PlayCircle,
  BookOpen,
  CheckCircle2,
  UserCheck,
  Star,
  Search,
  Filter,
  Laptop,
  Cpu,
  ShieldCheck,
  Sun,
  Video,
  Wifi,
  Briefcase,
  FileText,
  Send,
  Calendar,
  Users,
  Rocket,
  Sparkles,
  Check,
  HelpCircle,
  Download,
  Zap,
  Clock,
  MessageSquare,
  Plus,
  RefreshCw,
  BarChart2,
  BadgeCheck,
  FileSpreadsheet,
  Lock,
  ChevronRight,
  Share2,
  Upload,
  Globe,
  Terminal,
  Layers,
  Code,
  CheckSquare,
  AlertCircle
} from "lucide-react";
import { store } from "../../database/store";
import { formatCurrency } from "../../config/constants";
import { SocialPillsBar } from "../../shared/components/SocialCommunityPills";
import { UneSemaineUneSolutionSection } from "../../shared/components/UneSemaineUneSolutionSection";
import { generateCoursePaymentWhatsAppMsg, redirectToWhatsAppPayment, getWhatsAppLink } from "../../shared/utils/whatsappHelper";
import { useSWRInstant } from "../../lib/swr-cache";
import { CourseDTO } from "../../shared/contracts/types";
import { MessageCircle } from "lucide-react";

interface AcademyViewProps {
  currency: "FCFA" | "EUR";
}

// Removed static empty ENRICHED_CATALOG in favor of SWR

// Dynamic Certificates Database for Verification Tool
const VERIFIABLE_CERTIFICATES: Record<string, { student: string; course: string; date: string; score: string; badge: string }> = {};

export const AcademyView: React.FC<AcademyViewProps> = ({ currency }) => {
  // Navigation Tabs for 10 Domaines + Dashboards
  const [activeTab, setActiveTab] = useState<
    | "CATALOGUE"
    | "D1_INFO"
    | "D2_METIERS"
    | "D3_TECH"
    | "D4_ELEARNING"
    | "D5_CERTIFS"
    | "D6_BOOTCAMPS"
    | "D7_ENTREPRISES"
    | "D8_CARRIERE"
    | "D9_COMMUNAUTE"
    | "D10_INNOVATION"
    | "STUDENT_DASH"
    | "INSTRUCTOR_DASH"
    | "PROGRAMME_1SEM_1APP"
  >("CATALOGUE");

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TOUT");
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);

  // Certificate Verification Tool State
  const [certSearchId, setCertSearchId] = useState("");
  const [verifiedCertResult, setVerifiedCertResult] = useState<any | null>(null);
  const [certSearched, setCertSearched] = useState(false);
  const [activeCertModal, setActiveCertModal] = useState<CertificateData | null>(null);

  // Interactive Quiz State
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Bootcamp Application Modal State
  const [bootcampCandidate, setBootcampCandidate] = useState({ name: "", email: "", phone: "", track: "Web Fullstack Next.js", experience: "Débutant" });
  const [bootcampApplied, setBootcampApplied] = useState(false);

  // Corporate Plan Request State
  const [corpData, setCorpData] = useState({ companyName: "", contactName: "", employeesCount: 10, needs: "" });
  const [corpSubmitted, setCorpSubmitted] = useState(false);

  // CV Builder State
  const [cvName, setCvName] = useState("Amadou Diallo");
  const [cvRole, setCvRole] = useState("Développeur Fullstack Junior");
  const [cvSkills, setCvSkills] = useState("React, TypeScript, Node.js, PostgreSQL, Git");

  const { data: ENRICHED_CATALOG } = useSWRInstant<CourseDTO[]>(
    "/api/db/courses",
    async () => {
      try {
        const res = await fetch("/api/db/courses");
        const json = await res.json();
        return json.courses || [];
      } catch (e) {
        return store.courses || [];
      }
    },
    store.courses || []
  );

  const activeCourse = ENRICHED_CATALOG.find((c: any) => c.id === activeCourseId);

  const handleEnroll = (courseId: string, courseTitle: string, coursePrice?: number, courseLevel?: string) => {
    store.enrollCourse(courseId);
    setEnrollSuccess(courseTitle);
    
    // Générer et déclencher le paiement mobile via WhatsApp (Wave / Orange Money)
    const waMsg = generateCoursePaymentWhatsAppMsg({
      courseTitle,
      priceFCFA: coursePrice || 120000,
      studentName: store.currentUser.fullName || "Apprenant(e)",
      studentPhone: store.currentUser.phone || "+221 77 000 00 00",
      level: courseLevel || "Tous niveaux",
    });
    
    redirectToWhatsAppPayment(waMsg);
    setTimeout(() => setEnrollSuccess(null), 5000);
  };

  const handleVerifyCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertSearched(true);
    const searchKey = certSearchId.trim().toUpperCase();
    
    // 1. Query API backend & Neon PostgreSQL
    try {
      const res = await fetch(`/api/certificates/verify/${encodeURIComponent(searchKey)}`);
      const data = await res.json();
      if (data && data.valid && data.certificate) {
        setVerifiedCertResult({
          student: data.certificate.studentName,
          course: data.certificate.courseTitle,
          date: data.certificate.issueDate || data.certificate.issuedAt || "Août 2026",
          score: data.certificate.scoreOrMention || "100% Validation Pratique (Mention Excellent)",
          badge: data.certificate.badgeTitle || "Certified Tech Specialist",
          instructor: data.certificate.instructorName || "Dr. Amadou Ba",
          hours: data.certificate.hoursCount || 40,
        });
        return;
      }
    } catch {}

    // 2. Fallback to local dictionary
    const localResult = VERIFIABLE_CERTIFICATES[searchKey];
    setVerifiedCertResult(localResult || null);
  };

  const filteredCourses = (ENRICHED_CATALOG || []).filter((c) => {
    if (!c) return false;
    const matchesCat = selectedCategory === "TOUT" || c.category === selectedCategory;
    const q = (searchQuery || "").toLowerCase();
    if (!q) return matchesCat;
    const matchesQuery = (c.title || "").toLowerCase().includes(q) || (c.instructorName || "").toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-4xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/30">
          Pôle 4 • SEN AURA ACADEMY & CERTIFICATIONS
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Formations Numériques, Métiers & Certifications Officielles
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl mx-auto">
          Montez en compétences grâce à nos programmes accrédités : développement logiciel, IA générative, cybersécurité, réseaux, énergie solaire, bootcamps intensifs et accompagnement carrière au Sénégal.
        </p>

        {/* Action Header Shortcuts */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
          <button
            onClick={() => setActiveTab("PROGRAMME_1SEM_1APP")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "PROGRAMME_1SEM_1APP"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-slate-800 animate-pulse"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> 🔥 1 Semaine = 1 App = 1 Solution
          </button>

          <button
            onClick={() => setActiveTab("STUDENT_DASH")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "STUDENT_DASH"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900 border border-indigo-500/30 text-indigo-300 hover:bg-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4" /> 🎓 Espace Apprenant ({store.enrolledCourseIds.length} Cours)
          </button>

          <button
            onClick={() => setActiveTab("D5_CERTIFS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "D5_CERTIFS"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <BadgeCheck className="w-4 h-4 text-emerald-400" /> 🔍 Vérificateur de Certificat
          </button>

          <button
            onClick={() => setActiveTab("D6_BOOTCAMPS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "D6_BOOTCAMPS"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <Rocket className="w-4 h-4 text-amber-400" /> 🚀 Bootcamps Intensifs
          </button>
        </div>
      </div>

      {enrollSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Félicitations ! Vous êtes inscrit à la formation "{enrollSuccess}". Accédez directement à vos cours depuis votre Espace Apprenant.</span>
        </div>
      )}

      {/* 10 DOMAINES NAVIGATION TABS */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-indigo-400" /> Domaines de Formation & Services Pédagogiques :
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
          {[
            { id: "CATALOGUE", label: "Tous les Cours", icon: BookOpen },
            { id: "D1_INFO", label: "1. Informatique & Dev", icon: Code },
            { id: "D2_METIERS", label: "2. Formations Métiers", icon: Briefcase },
            { id: "D3_TECH", label: "3. Technique & Solaire", icon: Sun },
            { id: "D4_ELEARNING", label: "4. LMS & Classe Live", icon: PlayCircle },
            { id: "D5_CERTIFS", label: "5. Certifications", icon: Award },
            { id: "D6_BOOTCAMPS", label: "6. Bootcamps IA & Dev", icon: Rocket },
            { id: "D7_ENTREPRISES", label: "7. Intra-Entreprise", icon: Users },
            { id: "D8_CARRIERE", label: "8. Carrière & CV", icon: UserCheck },
            { id: "D9_COMMUNAUTE", label: "9. Communauté & Events", icon: Globe },
            { id: "D10_INNOVATION", label: "10. Lab IA & Innovation", icon: Cpu },
            { id: "INSTRUCTOR_DASH", label: "Espace Formateur", icon: Laptop },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-md shadow-indigo-500/10"
                    : "bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-white hover:border-slate-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CATALOGUE PRINCIPAL & DOMAINE 1 / DOMAINE 2 / DOMAINE 3 */}
      {(activeTab === "CATALOGUE" || activeTab === "D1_INFO" || activeTab === "D2_METIERS" || activeTab === "D3_TECH") && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un cours, techno, formateur..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {[
                { id: "TOUT", label: "Toutes Catégories" },
                { id: "Informatique & Dev", label: "Web & Mobile" },
                { id: "Intelligence Artificielle", label: "IA & Gemini" },
                { id: "DevOps & Cloud", label: "DevOps" },
                { id: "Cybersécurité", label: "Cybersécurité" },
                { id: "Formations Métiers", label: "Métiers & Gestion" },
                { id: "Technique & Pratique", label: "Technique & Solaire" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {filteredCourses.map((course, idx) => {
              const isEnrolled = store.enrolledCourseIds.includes(course.id);
              const isLastOdd =
                filteredCourses.length % 2 !== 0 &&
                idx === filteredCourses.length - 1;
              return (
                <div
                  key={course.id}
                  className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex justify-between group shadow-sm ${
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
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-indigo-950/90 text-[8px] font-bold text-indigo-300 border border-indigo-700">
                            {course.durationHours}h
                          </span>
                        </div>

                        <div className="min-w-0 flex-1 flex flex-col justify-between h-20 py-0.5">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] font-bold text-indigo-300 uppercase tracking-wider">{course.category}</span>
                              <span className="flex items-center text-amber-400 font-bold text-[9px]">
                                <Star className="w-2.5 h-2.5 fill-amber-400" /> {course.rating}
                              </span>
                            </div>
                            <h3 className="text-xs font-bold text-white line-clamp-1 leading-snug mt-0.5">
                              {course.title}
                            </h3>
                          </div>

                          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800/80">
                            <p className="text-xs font-black text-amber-400 font-mono">
                              {formatCurrency(course.priceFCFA, currency)}
                            </p>
                            {isEnrolled ? (
                              <button
                                onClick={() => {
                                  setActiveCourseId(course.id);
                                  setActiveTab("D4_ELEARNING");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]"
                              >
                                Accéder
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    store.addToCart({
                                      id: course.id,
                                      name: `Formation : ${course.title}`,
                                      category: "Logiciels & Licences",
                                      brand: "SEN AURA Academy",
                                      priceFCFA: course.priceFCFA,
                                      stock: 99,
                                      image: course.thumbnail,
                                      description: `Formation ${course.category} par ${course.instructorName} (${course.durationHours}h)`,
                                      specs: { Niveau: course.level, Certificat: course.certificateProvided ? "Inclus" : "Non" }
                                    }, 1);
                                    setEnrollSuccess(`"${course.title}" a été ajouté à votre panier !`);
                                    setTimeout(() => setEnrollSuccess(null), 3000);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px]"
                                >
                                  + Panier
                                </button>
                                <button
                                  onClick={() => handleEnroll(course.id, course.title, course.priceFCFA, course.level)}
                                  className="p-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px]"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Desktop normal view */}
                      <div className="hidden sm:flex flex-col justify-between h-full w-full space-y-3 sm:space-y-4">
                        <div className="space-y-2.5 sm:space-y-3">
                          <div className="relative h-28 sm:h-44 rounded-xl overflow-hidden bg-slate-950">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-indigo-600/90 backdrop-blur text-white text-[9px] sm:text-[10px] font-bold tracking-wide truncate max-w-[70%]">
                              {course.category}
                            </span>
                            {course.certificateProvided && (
                              <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-emerald-500/90 text-slate-950 text-[8px] sm:text-[10px] font-bold flex items-center gap-0.5">
                                <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Certifiant
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[9px] sm:text-[10px]">{course.level}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{course.durationHours}h</span>
                            <span className="flex items-center text-amber-400 font-bold ml-auto sm:ml-0">
                              <Star className="w-3 h-3 fill-amber-400" /> {course.rating}
                            </span>
                          </div>

                          <h3 className="text-xs sm:text-sm font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">{course.title}</h3>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                            <img src={course.instructorAvatar} alt={course.instructorName} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-700 shrink-0" referrerPolicy="no-referrer" />
                            <div className="text-xs min-w-0">
                              <p className="text-slate-300 font-bold leading-tight truncate text-[11px] sm:text-xs">{course.instructorName}</p>
                              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">{course.studentsEnrolled} inscrits</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 sm:pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Tarif</span>
                            <p className="text-xs sm:text-base font-black text-amber-400 font-mono">
                              {formatCurrency(course.priceFCFA, currency)}
                            </p>
                          </div>

                          {isEnrolled ? (
                            <button
                              onClick={() => {
                                setActiveCourseId(course.id);
                                setActiveTab("D4_ELEARNING");
                              }}
                              className="w-full sm:w-auto px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 hover:bg-emerald-500/30 transition-colors cursor-pointer text-center"
                            >
                              <PlayCircle className="w-3.5 h-3.5" /> Accéder
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <button
                                onClick={() => {
                                  store.addToCart({
                                    id: course.id,
                                    name: `Formation : ${course.title}`,
                                    category: "Logiciels & Licences",
                                    brand: "SEN AURA Academy",
                                    priceFCFA: course.priceFCFA,
                                    stock: 99,
                                    image: course.thumbnail,
                                    description: `Formation ${course.category} par ${course.instructorName} (${course.durationHours}h)`,
                                    specs: { Niveau: course.level, Certificat: course.certificateProvided ? "Inclus" : "Non" }
                                  }, 1);
                                  setEnrollSuccess(`"${course.title}" a été ajouté à votre panier !`);
                                  setTimeout(() => setEnrollSuccess(null), 3000);
                                }}
                                className="flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer text-center active:scale-95"
                              >
                                + Panier
                              </button>
                              <button
                                onClick={() => handleEnroll(course.id, course.title, course.priceFCFA, course.level)}
                                className="flex-1 sm:flex-none px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-[10px] sm:text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1 cursor-pointer text-center active:scale-95"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2.5 sm:space-y-3">
                        <div className="relative h-28 sm:h-44 rounded-xl overflow-hidden bg-slate-950">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-indigo-600/90 backdrop-blur text-white text-[9px] sm:text-[10px] font-bold tracking-wide truncate max-w-[70%]">
                            {course.category}
                          </span>
                          {course.certificateProvided && (
                            <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-emerald-500/90 text-slate-950 text-[8px] sm:text-[10px] font-bold flex items-center gap-0.5">
                              <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Certifiant
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[9px] sm:text-[10px]">{course.level}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{course.durationHours}h</span>
                          <span className="flex items-center text-amber-400 font-bold ml-auto sm:ml-0">
                            <Star className="w-3 h-3 fill-amber-400" /> {course.rating}
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">{course.title}</h3>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                          <img src={course.instructorAvatar} alt={course.instructorName} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-700 shrink-0" referrerPolicy="no-referrer" />
                          <div className="text-xs min-w-0">
                            <p className="text-slate-300 font-bold leading-tight truncate text-[11px] sm:text-xs">{course.instructorName}</p>
                            <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">{course.studentsEnrolled} inscrits</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 sm:pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Tarif</span>
                          <p className="text-xs sm:text-base font-black text-amber-400 font-mono">
                            {formatCurrency(course.priceFCFA, currency)}
                          </p>
                        </div>

                        {isEnrolled ? (
                          <button
                            onClick={() => {
                              setActiveCourseId(course.id);
                              setActiveTab("D4_ELEARNING");
                            }}
                            className="w-full sm:w-auto px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 hover:bg-emerald-500/30 transition-colors cursor-pointer text-center"
                          >
                            <PlayCircle className="w-3.5 h-3.5" /> Accéder
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                              onClick={() => {
                                store.addToCart({
                                  id: course.id,
                                  name: `Formation : ${course.title}`,
                                  category: "Logiciels & Licences",
                                  brand: "SEN AURA Academy",
                                  priceFCFA: course.priceFCFA,
                                  stock: 99,
                                  image: course.thumbnail,
                                  description: `Formation ${course.category} par ${course.instructorName} (${course.durationHours}h)`,
                                  specs: { Niveau: course.level, Certificat: course.certificateProvided ? "Inclus" : "Non" }
                                }, 1);
                                setEnrollSuccess(`"${course.title}" a été ajouté à votre panier !`);
                                setTimeout(() => setEnrollSuccess(null), 3000);
                              }}
                              className="flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer text-center active:scale-95"
                            >
                              + Panier
                            </button>
                            <button
                              onClick={() => handleEnroll(course.id, course.title, course.priceFCFA, course.level)}
                              className="flex-1 sm:flex-none px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-[10px] sm:text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1 cursor-pointer text-center active:scale-95"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DOMAINE 4: E-LEARNING & LECTEUR VIDEO LMS INTERACTIF */}
      {activeTab === "D4_ELEARNING" && (
        <div className="space-y-8">
          <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/40 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Espace LMS & Lecteur Vidéo HD</span>
                  <h2 className="text-lg font-bold text-white">
                    {activeCourse ? activeCourse.title : "Sélectionnez un cours pour démarrer votre apprentissage"}
                  </h2>
                </div>
              </div>

              {activeCourse && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  Progression : 45% Complété
                </span>
              )}
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-slate-800 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="relative z-10 space-y-3 max-w-xl">
                <div className="w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/40 group-hover:scale-110 transition-transform cursor-pointer">
                  <PlayCircle className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Module 1 : Architecture Hexagonale & Inversion de Dépendance avec TypeScript
                </h3>
                <p className="text-xs text-slate-300">
                  Vidéo HD • Durée : 24min • Exercices pratiques téléchargeables & Code source fourni.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      generateGenericPDF(
                        "Support_Cours_Architecture_Hexagonale.pdf",
                        "Support de Cours — Architecture Hexagonale & Inversion de Dépendance",
                        "SEN AURA ACADEMY",
                        [
                          {
                            title: "Module 1 : Principes Fondamentaux",
                            content: "L'architecture hexagonale (Ports et Adaptateurs) permet d'isoler la logique métier des détails d'infrastructure (bases de données, frameworks web, services tiers).",
                          },
                          {
                            title: "Mise en Pratique avec TypeScript",
                            content: "Définissez des interfaces claires pour vos repositories et injectez-les dans la couche Use-Case.",
                          },
                        ]
                      );
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Support PDF (3.2 MB)
                  </button>
                  <button className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" /> Dépôt GitHub Exercice
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Module Quiz Section */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" /> Evaluation de Validation du Module 1 (Quiz)
                </span>
                <span className="text-xs text-slate-400">1 Question • Résultat instantané</span>
              </div>

              <p className="text-sm font-bold text-white">
                Quel est l'objectif principal de l'Architecture Hexagonale (Ports & Adapters) dans une application NestJS / Next.js ?
              </p>

              <div className="space-y-2">
                {[
                  "Isoler le domaine métier des détails d'infrastructure (base de données, API externes, frameworks UI).",
                  "Accélérer uniquement le temps de rendu côté client dans le navigateur.",
                  "Remplacer entièrement les bases de données SQL par du stockage local navigateur.",
                  "Réduire la taille des bundles JavaScript envoyés au client.",
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswer(idx)}
                    className={`w-full p-3 rounded-xl text-xs text-left transition-all flex items-center justify-between ${
                      quizAnswer === idx
                        ? "bg-indigo-600/30 border border-indigo-500 text-white font-bold"
                        : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span>{opt}</span>
                    {quizAnswer === idx && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </button>
                ))}
              </div>

              {quizSubmitted && quizAnswer === 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Excellente réponse ! Vos points de certification ont été mis à jour.</span>
                </div>
              )}

              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={quizAnswer === null}
                className="py-2.5 px-6 rounded-xl bg-indigo-600 disabled:opacity-50 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
              >
                Valider la Réponse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 5: CERTIFICATIONS & OUTIL DE VÉRIFICATION */}
      {activeTab === "D5_CERTIFS" && (
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Attestations & Certifications Reconnaissances</span>
              <h2 className="text-2xl font-black text-white">Vérification d'Authenticité des Certificats SEN AURA ACADEMY</h2>
              <p className="text-xs text-slate-400 max-w-2xl">
                Chaque certificat délivré par SEN AURA est muni d'un identifiant cryptographique unique. Recruteurs et organismes peuvent vérifier son authenticité instantanément ci-dessous.
              </p>
            </div>

            {/* Verification Input Form */}
            <form onSubmit={handleVerifyCertificate} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <input
                type="text"
                required
                value={certSearchId}
                onChange={(e) => setCertSearchId(e.target.value)}
                placeholder="Entrez le N° de Certificat (ex: CERT-SA-2026-101)"
                className="flex-1 p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 uppercase tracking-widest font-mono"
              />
              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> Vérifier
              </button>
            </form>

            {/* Result Display */}
            {certSearched && (
              <div className="pt-4 border-t border-slate-800">
                {verifiedCertResult ? (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4 max-w-2xl animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4 text-emerald-400" /> CERTIFICAT AUTHENTIQUE ET VALIDE
                      </span>
                      <span className="text-xs font-mono text-slate-400">{certSearchId.toUpperCase()}</span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">{verifiedCertResult.student}</h3>
                      <p className="text-sm font-semibold text-indigo-400">{verifiedCertResult.course}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-900">
                      <div>
                        <span className="text-slate-500">Date d'Obtention :</span>
                        <p className="font-bold text-slate-200">{verifiedCertResult.date}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Résultat Examen :</span>
                        <p className="font-bold text-amber-400">{verifiedCertResult.score}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          setActiveCertModal({
                            id: certSearchId.toUpperCase(),
                            studentName: verifiedCertResult.student,
                            courseTitle: verifiedCertResult.course,
                            issueDate: verifiedCertResult.date,
                            scoreOrMention: verifiedCertResult.score,
                            badgeTitle: verifiedCertResult.badge,
                            instructorName: "Dr. Amadou Ba",
                            hoursCount: 45,
                          })
                        }
                        className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
                      >
                        <Download className="w-4 h-4" /> Voir & Télécharger le Certificat HD (PDF)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Numéro de certificat introuvable. Veuillez vérifier l'exactitude de la référence.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOMAINE 6: BOOTCAMPS INTENSIFS */}
      {activeTab === "D6_BOOTCAMPS" && (
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Formations Accélérées & Immersive</span>
              <h2 className="text-2xl font-black text-white">Bootcamps Intensifs (12 à 16 Semaines)</h2>
              <p className="text-xs text-slate-400 max-w-2xl">
                Rejoignez nos programmes immersifs avec projets réels d'entreprises, mentorat quotidien et accès direct aux recruteurs du marché sénégalais lors du Demo Day.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
              {[
                { title: "Bootcamp Web Fullstack Next.js", duration: "12 Semaines", tag: "Code & Cloud", desc: "De zéro à développeur opérationnel prêt pour l'embauche." },
                { title: "Bootcamp IA Générative & Agents", duration: "14 Semaines", tag: "IA & RAG", desc: "Maîtrisez Gemini API, LangChain, n8n et le fine-tuning." },
                { title: "Bootcamp DevOps & Infrastructure Cloud", duration: "16 Semaines", tag: "DevOps Pro", desc: "Docker, Kubernetes, CI/CD et gestion d'infrastructures hautement disponibles." },
              ].map((bootcamp, idx) => {
                const isLastOdd = idx === 2;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 sm:space-y-4 flex flex-col justify-between shadow-sm ${
                      isLastOdd
                        ? "col-span-2 max-w-[calc(50%-0.3125rem)] mx-auto w-full md:col-span-1 md:max-w-none md:mx-0"
                        : ""
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {bootcamp.tag}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold">{bootcamp.duration}</span>
                      </div>
                      <h3 className="text-xs sm:text-base font-bold text-white leading-snug">{bootcamp.title}</h3>
                      <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">{bootcamp.desc}</p>
                    </div>

                    <button
                      onClick={() => {
                        setBootcampCandidate({ ...bootcampCandidate, track: bootcamp.title });
                        setBootcampApplied(false);
                      }}
                      className="w-full py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] sm:text-xs uppercase cursor-pointer active:scale-95 transition-all text-center"
                    >
                      Postuler
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bootcamp Application Form */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 max-w-2xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-amber-400" /> Formulaire de Candidature • Track : {bootcampCandidate.track}
              </h3>

              {bootcampApplied && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  ✓ Candidature enregistrée ! Notre équipe pédagogique vous recontactera sous 24h pour le test d'admission.
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setBootcampApplied(true);
                  const msg = `🚀 *CANDIDATURE BOOTCAMP SEN AURA ACADEMY*\n\nTrack sélectionné : *${bootcampCandidate.track}*\n👤 Candidat : *${bootcampCandidate.name}*\n📧 Email : ${bootcampCandidate.email}\n📞 Téléphone/WhatsApp : *${bootcampCandidate.phone}*\n🎯 Niveau actuel : ${bootcampCandidate.experience}\n\nJe souhaite valider ma candidature et les modalités de paiement mobile (Wave / Orange Money).`;
                  redirectToWhatsAppPayment(msg);
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Nom Prénom"
                    value={bootcampCandidate.name}
                    onChange={(e) => setBootcampCandidate({ ...bootcampCandidate, name: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Adresse Email"
                    value={bootcampCandidate.email}
                    onChange={(e) => setBootcampCandidate({ ...bootcampCandidate, email: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="tel"
                    required
                    placeholder="Téléphone / WhatsApp"
                    value={bootcampCandidate.phone}
                    onChange={(e) => setBootcampCandidate({ ...bootcampCandidate, phone: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <select
                    value={bootcampCandidate.experience}
                    onChange={(e) => setBootcampCandidate({ ...bootcampCandidate, experience: e.target.value })}
                    className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="Débutant">Niveau : Débutant passionné</option>
                    <option value="Intermédiaire">Niveau : Intermédiaire avec bases</option>
                    <option value="Reconversion">Niveau : Reconversion professionnelle</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Envoyer mon Dossier de Candidature
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 7: FORMATIONS SUR-MESURE ENTREPRISES */}
      {activeTab === "D7_ENTREPRISES" && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Pôle Entreprises & Organisations</span>
            <h2 className="text-2xl font-black text-white">Formations Intra-Entreprise & Renforcement de Capacités</h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Nous concevons des plans de formation adaptés aux besoins spécifiques de vos équipes techniques et administratifs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Avantages des Formations Entreprises SEN AURA</h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Audit préalable des compétences de vos collaborateurs</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Programmes 100% personnalisés sur vos propres outils/projets</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Modalités flexibles : dans vos locaux, nos centres ou hybride</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Rapport d'évaluation et attestations nominatives d'acquis</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Demander un Devis de Plan de Formation</h3>
              {corpSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  ✓ Demande transmise à notre responsable Pédagogique Entreprises !
                </div>
              )}
              <form onSubmit={(e) => { e.preventDefault(); setCorpSubmitted(true); }} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Nom de l'Entreprise / Organisation"
                  value={corpData.companyName}
                  onChange={(e) => setCorpData({ ...corpData, companyName: e.target.value })}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Nom du Responsable Formation / RH"
                  value={corpData.contactName}
                  onChange={(e) => setCorpData({ ...corpData, contactName: e.target.value })}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Objectifs pédagogiques et effectif à former..."
                  value={corpData.needs}
                  onChange={(e) => setCorpData({ ...corpData, needs: e.target.value })}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase"
                >
                  Obtenir une Proposition Pédagogique
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 8: CARRIÈRE & GÉNÉRATEUR DE CV */}
      {activeTab === "D8_CARRIERE" && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Coaching & Employabilité</span>
            <h2 className="text-2xl font-black text-white">Générateur & Optimiseur de CV IT</h2>
            <p className="text-xs text-slate-400">Préparez votre profil professionnel pour les recruteurs du réseau SEN AURA.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <h3 className="text-sm font-bold text-white">Éditer mon Profil Technologique</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={cvName}
                  onChange={(e) => setCvName(e.target.value)}
                  placeholder="Nom complet"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
                <input
                  type="text"
                  value={cvRole}
                  onChange={(e) => setCvRole(e.target.value)}
                  placeholder="Titre professionnel"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
                <textarea
                  rows={3}
                  value={cvSkills}
                  onChange={(e) => setCvSkills(e.target.value)}
                  placeholder="Compétences clés séparées par des virgules"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            {/* CV Preview Card */}
            <div className="p-6 rounded-2xl bg-white text-slate-900 space-y-4 shadow-xl">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-lg font-black text-slate-900">{cvName}</h3>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{cvRole}</p>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Compétences Certifiées SEN AURA :</span>
                <div className="flex flex-wrap gap-1.5">
                  {cvSkills.split(",").map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                <span>Certifications vérifiées via SEN AURA ACADEMY</span>
                <button
                  onClick={() => {
                    generateGenericPDF(
                      "CV_Certifie_SENAURA_Mamadou_Ndiaye.pdf",
                      "Curriculum Vitae Certifié — Mamadou Lamine Ndiaye",
                      "PORTAIL APPRENANT SEN AURA",
                      [
                        {
                          title: "Profil Professionnel",
                          content: "Ingénieur Full-Stack & Spécialiste Cloud Native certifié par SEN AURA ACADEMY.",
                        },
                        {
                          title: "Certifications Validées (100% Vérifiables)",
                          content: "• Full-Stack Cloud Native Architect (Ref: CERT-SA-2026-101)\n• DevOps, Docker & Kubernetes (Ref: CERT-SA-2026-102)\n• Intelligence Artificielle & GenAI Specialist (Ref: CERT-SA-2026-103)",
                        },
                        {
                          title: "Compétences Techniques",
                          content: "TypeScript, React, Node.js, Python, PostgreSQL, Docker, Kubernetes, GCP Cloud Run, AI Agents.",
                        },
                      ]
                    );
                  }}
                  className="px-3 py-1 rounded bg-slate-900 border border-slate-700 hover:border-amber-500 text-amber-400 font-bold text-xs"
                >
                  Exporter CV PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 9 & 10: COMMUNAUTÉ & INNOVATION LAB */}
      {(activeTab === "D9_COMMUNAUTE" || activeTab === "D10_INNOVATION") && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Lab AI & Innovation Open-Source</span>
            <h2 className="text-2xl font-black text-white">Communauté, Hackathons & Pépinière de Projets</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Globe className="w-6 h-6 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Hackathon SEN AURA AI 2026</h3>
              <p className="text-xs text-slate-400">48h de challenge pour créer un agent IA utile au secteur de la santé au Sénégal.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Cpu className="w-6 h-6 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Open Source & Publications</h3>
              <p className="text-xs text-slate-400">Accès aux dépôts GitHub communautaires et projets de recherche IA étudiants.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Users className="w-6 h-6 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Clubs de Code & Webinaires</h3>
              <p className="text-xs text-slate-400">Rencontres hebdomadaires en présentiel à Dakar et diffusions en direct.</p>
            </div>
          </div>

          {/* Official Community Platforms */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white">Rejoindre la Communauté Officielle SEN-AURA-TECH</h4>
                <p className="text-xs text-slate-400">Suivez nos tutoriels, opportunités d'emploi, stages et partages quotidiens.</p>
              </div>
              <a
                href="mailto:senauratech@gmail.com"
                className="text-xs font-bold text-amber-400 hover:underline"
              >
                senauratech@gmail.com
              </a>
            </div>

            <div className="pt-2">
              <SocialPillsBar variant="pills" />
            </div>
          </div>
        </div>
      )}

      {/* TABLEAU DE BORD DU FORMATEUR (INSTRUCTOR DASHBOARD) */}
      {activeTab === "INSTRUCTOR_DASH" && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Espace Formateur Senior</span>
              <h2 className="text-xl font-black text-white">Gestion de mes Cours & Suivi des Apprenants</h2>
            </div>
            <button className="py-2 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Créer une Nouvelle Formation
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Total Apprenants :</span>
              <p className="text-2xl font-black text-white font-mono mt-1">425 Élèves</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Revenus Générés :</span>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatCurrency(4850000, currency)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Note Moyenne :</span>
              <p className="text-2xl font-black text-amber-400 font-mono mt-1">4.9 / 5.0</p>
            </div>
          </div>
        </div>
      )}

      {/* TABLEAU DE BORD APPRENANT (STUDENT DASHBOARD) */}
      {activeTab === "STUDENT_DASH" && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Espace Personnel</span>
              <h2 className="text-xl font-black text-white">Mes Formations Enregistrées & Progression</h2>
            </div>
          </div>

          {store.enrolledCourseIds.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Vous n'êtes inscrit à aucune formation pour le moment.</p>
              <button
                onClick={() => setActiveTab("CATALOGUE")}
                className="py-2 px-5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Parcourir le Catalogue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ENRICHED_CATALOG.filter((c) => store.enrolledCourseIds.includes(c.id)).map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white">{c.title}</h3>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-2/5" />
                  </div>
                  <div className="flex flex-wrap justify-between items-center pt-2 text-xs gap-2">
                    <span className="text-slate-400">Formateur : {c.instructorName}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setActiveCertModal({
                            id: `CERT-SA-2026-${c.id.substring(0, 4).toUpperCase()}`,
                            studentName: "Mamadou Lamine Ndiaye",
                            courseTitle: c.title,
                            issueDate: "12 Août 2026",
                            scoreOrMention: "98% (Mention Excellent)",
                            badgeTitle: `${c.category} Specialist`,
                            instructorName: c.instructorName,
                            hoursCount: c.durationHours,
                          })
                        }
                        className="py-1.5 px-3 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" /> Certificat PDF
                      </button>
                      <button
                        onClick={() => {
                          setActiveCourseId(c.id);
                          setActiveTab("D4_ELEARNING");
                        }}
                        className="py-1.5 px-4 rounded-xl bg-indigo-600 text-white font-bold"
                      >
                        Continuer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROGRAMME VEDETTE : 1 SEMAINE = 1 APPLICATION = 1 SOLUTION */}
      {activeTab === "PROGRAMME_1SEM_1APP" && (
        <UneSemaineUneSolutionSection />
      )}

      {/* OFFICIAL CERTIFICATE MODAL PREVIEW & PDF DOWNLOAD */}
      <OfficialCertificateModal
        isOpen={!!activeCertModal}
        onClose={() => setActiveCertModal(null)}
        certificate={activeCertModal}
      />

    </div>
  );
};
