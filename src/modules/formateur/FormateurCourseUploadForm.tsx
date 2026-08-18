import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles,
  GraduationCap,
  BookOpen,
  Clock,
  Coins,
  Check,
  RefreshCw,
  Award,
  Layers,
  FileText,
  Play,
  Zap,
  Shield,
  Laptop,
  Server,
  Cpu,
  Flame,
  UserCheck
} from "lucide-react";
import { uploadToCloudinary, CloudinaryUploadResult } from "../../lib/cloudinary";
import { formatCurrency } from "../../config/constants";
import CloudinaryDropzone from "../../components/common/CloudinaryDropzone";
import PublishingProcessModal from "../../components/common/PublishingProcessModal";

interface FormateurCourseUploadFormProps {
  onCourseCreated: (course: any) => void;
  onCancel?: () => void;
  currency?: "FCFA" | "EUR";
}

interface CourseCategoryOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGlow: string;
  description: string;
}

const COURSE_CATEGORIES: CourseCategoryOption[] = [
  {
    id: "solaire",
    name: "Énergie Solaire & Pompage",
    icon: Zap,
    color: "text-amber-400",
    bgGlow: "from-amber-500/20 to-orange-500/10 border-amber-500/40",
    description: "Dimensionnement photovoltaïque, onduleurs hybrides & pompage solaire",
  },
  {
    id: "ia",
    name: "IA & Data Science",
    icon: Sparkles,
    color: "text-indigo-400",
    bgGlow: "from-indigo-500/20 to-purple-500/10 border-indigo-500/40",
    description: "Masterclass Gemini API, Python Data, Automatisation IA",
  },
  {
    id: "securite",
    name: "Sécurité SI & Vidéosurveillance",
    icon: Shield,
    color: "text-rose-400",
    bgGlow: "from-rose-500/20 to-pink-500/10 border-rose-500/40",
    description: "Installation caméras IP Dahua, NVR, Hacking éthique & Défense",
  },
  {
    id: "reseaux",
    name: "Réseaux, Fibre & Télécoms",
    icon: Server,
    color: "text-sky-400",
    bgGlow: "from-sky-500/20 to-blue-500/10 border-sky-500/40",
    description: "Routage Cisco CCNA, soudure fibre optique, Mikrotik & Wifi 6",
  },
  {
    id: "dev",
    name: "Développement Web & Mobile",
    icon: Laptop,
    color: "text-emerald-400",
    bgGlow: "from-emerald-500/20 to-teal-500/10 border-emerald-500/40",
    description: "React 19, Next.js, Node.js, Flutter & Intégration Wave API",
  },
  {
    id: "domotique",
    name: "Domotique & IoT Connecté",
    icon: Cpu,
    color: "text-purple-400",
    bgGlow: "from-purple-500/20 to-fuchsia-500/10 border-purple-500/40",
    description: "Smart Home, Home Assistant, microcontrôleurs ESP32 & capteurs",
  },
  {
    id: "froid",
    name: "Climatisation & Froid Solaire",
    icon: Flame,
    color: "text-yellow-400",
    bgGlow: "from-yellow-500/20 to-amber-500/10 border-yellow-500/40",
    description: "Installation splits Inverter, réfrigération autonome & pompes à chaleur",
  },
  {
    id: "management",
    name: "Projets IT & Entrepreneuriat",
    icon: Award,
    color: "text-cyan-400",
    bgGlow: "from-cyan-500/20 to-blue-500/10 border-cyan-500/40",
    description: "Méthodes Agiles Scrum, rédaction de devis SI et gestion de chantiers",
  },
];

const REAL_COURSE_PRESETS = [
  {
    title: "Masterclass Dimensionnement Solaire & Onduleurs Hybrides",
    category: "Énergie Solaire & Pompage",
    price: "75000",
    duration: "25 Heures (Pratique + Terrain)",
    banner: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1000&auto=format&fit=crop&q=80",
    instructor: "Ing. Amadou Diallo (Expert Solaire Certifié)"
  },
  {
    title: "Formation Complète Vidéosurveillance IP & Alarmes IA Dahua",
    category: "Sécurité SI & Vidéosurveillance",
    price: "60000",
    duration: "18 Heures (Ateliers Pratiques)",
    banner: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1000&auto=format&fit=crop&q=80",
    instructor: "Ousmane Kane (Technicien Supérieur)"
  },
  {
    title: "Déploiement Baies Réseaux, Fibre Optique & Switchs Cisco",
    category: "Réseaux, Fibre & Télécoms",
    price: "90000",
    duration: "30 Heures (Certification Pratique)",
    banner: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&auto=format&fit=crop&q=80",
    instructor: "Moussa Diop (Ingénieur Réseaux)"
  },
  {
    title: "Développement Web Fullstack Next.js & IA Gemini",
    category: "Développement Web & Mobile",
    price: "85000",
    duration: "40 Heures (Projets Pratiques)",
    banner: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80",
    instructor: "Awa Ndiaye (Lead Dev Fullstack)"
  },
];

export const FormateurCourseUploadForm: React.FC<FormateurCourseUploadFormProps> = ({
  onCourseCreated,
  onCancel,
  currency = "FCFA",
}) => {
  // Main media state (Video or Image banner)
  const [mainMediaType, setMainMediaType] = useState<"image" | "video">("image");
  const [mainMediaUrl, setMainMediaUrl] = useState<string>("");
  const [mainMediaUploading, setMainMediaUploading] = useState<boolean>(false);
  const [mainMediaMeta, setMainMediaMeta] = useState<CloudinaryUploadResult | null>(null);
  const [isMainDragOver, setIsMainDragOver] = useState<boolean>(false);

  // 3 Optional Attachment Photos
  const [attachmentImages, setAttachmentImages] = useState<string[]>([]);
  const [attachmentUploadingIdx, setAttachmentUploadingIdx] = useState<number | null>(null);
  const [dragOverAttachmentIdx, setDragOverAttachmentIdx] = useState<number | null>(null);

  // Course form fields
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("Énergie Solaire & Pompage");
  const [priceFCFA, setPriceFCFA] = useState<string>("75000");
  const [duration, setDuration] = useState<string>("25 Heures (Pratique + Théorie)");
  const [level, setLevel] = useState<string>("Tous Niveaux (Débutant à Pro)");
  const [description, setDescription] = useState<string>("");
  const [prerequisites, setPrerequisites] = useState<string>("Aucun prérequis strict. Ordinateur portable recommandé.");
  const [certificationName, setCertificationName] = useState<string>("Certificat d'Aptitude Professionnelle SEN AURA ACADEMY");

  // Status & loading
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [lastPublishedData, setLastPublishedData] = useState<any>(null);

  // Refs
  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  // Drag & Drop handlers
  const handleMainDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMainDragOver(true);
  };

  const handleMainDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMainDragOver(false);
  };

  const handleMainDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMainDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMainFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleMainFileUpload = async (file: File) => {
    if (!file) return;
    setMainMediaUploading(true);
    setErrorMsg("");

    const isVid = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".webm") || file.name.endsWith(".mov");
    const targetType = isVid ? "video" : "image";
    setMainMediaType(targetType);

    try {
      const result = await uploadToCloudinary(file, "sen_aura_academy_courses", targetType);
      if (result && result.secure_url) {
        setMainMediaUrl(result.secure_url);
        setMainMediaMeta(result);
      } else {
        throw new Error("L'URL Cloudinary n'a pas pu être générée.");
      }
    } catch (err: any) {
      console.error("Erreur d'upload Cloudinary:", err);
      setErrorMsg("Échec du téléversement du média de cours sur Cloudinary.");
    } finally {
      setMainMediaUploading(false);
    }
  };

  const handleAttachmentUpload = async (slotIdx: number, file: File) => {
    if (!file) return;
    setAttachmentUploadingIdx(slotIdx);
    setErrorMsg("");

    try {
      const result = await uploadToCloudinary(file, "sen_aura_academy_attachments", "image");
      if (result && result.secure_url) {
        const nextAttachments = [...attachmentImages];
        nextAttachments[slotIdx] = result.secure_url;
        setAttachmentImages(nextAttachments);
      }
    } catch (err: any) {
      console.error(`Erreur d'upload support ${slotIdx + 1}:`, err);
      setErrorMsg(`Échec de l'upload pour le support ${slotIdx + 1}.`);
    } finally {
      setAttachmentUploadingIdx(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Veuillez renseigner le titre de la formation.");
      return;
    }
    if (!mainMediaUrl) {
      setErrorMsg("Veuillez ajouter une vidéo démo ou une bannière HD (Glisser-Déposer ou sélection rapide).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const coursePayload = {
      id: `CRS-${Date.now()}`,
      title: title.trim(),
      category,
      priceFCFA: parseInt(priceFCFA || "50000", 10),
      duration,
      level,
      description: description.trim() || `Programme certifiant dispensé par les instructeurs SEN AURA ACADEMY.`,
      prerequisites,
      certificationName,
      mainMediaUrl,
      mainMediaType,
      attachmentImages: attachmentImages.filter(Boolean),
      status: "Publié",
      instructor: "Formateur Certifié SEN AURA",
      studentsCount: 0,
      rating: 5.0,
      createdAt: new Date().toISOString(),
    };

    try {
      setLastPublishedData({
        title: title.trim(),
        category,
        priceFCFA: parseInt(priceFCFA || "50000", 10),
        mainMediaUrl,
        mediaType: mainMediaType,
        sku: coursePayload.id,
        type: "course",
      });
      setShowPublishModal(true);

      onCourseCreated(coursePayload);
      setSuccessMsg(`Formation "${title}" enregistrée et mise en ligne avec succès sur SEN AURA ACADEMY !`);

      setTimeout(() => {
        setTitle("");
        setMainMediaUrl("");
        setAttachmentImages([]);
        setDescription("");
        setSuccessMsg("");
      }, 1200);
    } catch (err) {
      console.error("Erreur de publication du cours:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl text-slate-200"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border border-indigo-500/40 text-xs font-black text-indigo-300 mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>SEN AURA ACADEMY • MODULE FORMATEUR</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Publier un Nouveau Module de Formation (Vidéo & Supports HD)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Téléversez <strong className="text-indigo-400">1 vidéo démo ou bannière HD</strong> + jusqu'à <strong className="text-indigo-400">3 supports de cours / extraits</strong> avec hébergement Cloudinary ultra-rapide.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
          >
            Retour aux Formations
          </button>
        )}
      </div>

      {/* Error & Success */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLS: FORM CONTROLS */}
          <div className="xl:col-span-7 space-y-6">

            {/* STEP 1: CATEGORY SELECTION */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-black text-xs flex items-center justify-center">1</span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Pôle Pédagogique & Spécialité
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-indigo-400 font-bold">
                  {category}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {COURSE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.name;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? `bg-gradient-to-br ${cat.bgGlow} shadow-lg ring-1 ring-indigo-400/50`
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${isSelected ? cat.color : "text-slate-500"}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <p className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-slate-300"}`}>
                        {cat.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: MAIN MEDIA (DEMO VIDEO OR BANNER) */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-black text-xs flex items-center justify-center">2</span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Média Principal : Vidéo Démo ou Bannière HD <span className="text-indigo-400">*</span>
                  </h3>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMainMediaType("image")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mainMediaType === "image"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Bannière HD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMainMediaType("video")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mainMediaType === "video"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Vidéo Démo</span>
                  </button>
                </div>
              </div>

              {/* Cloudinary Real-time Dropzone with Progress & Success/Error Indicators */}
              <CloudinaryDropzone
                id="formateur-main-media-dropzone"
                value={mainMediaUrl}
                onChange={(url, meta) => {
                  setMainMediaUrl(url);
                  setMainMediaMeta(meta || null);
                }}
                folder="sen_aura_academy_courses"
                acceptedTypes={mainMediaType === "video" ? "video" : "image"}
                maxSizeMB={mainMediaType === "video" ? 60 : 20}
                label={mainMediaType === "video" ? "Glissez & déposez votre vidéo démo de formation" : "Glissez & déposez votre bannière de cours HD"}
                subLabel={mainMediaType === "video" ? "Format MP4, WebM ou MOV (Jusqu'à 60 Mo) avec compression Cloudinary HD" : "Format JPG, PNG, WEBP haute résolution (Jusqu'à 20 Mo)"}
              />

              {/* Course Presets */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ou choisir un module modèle certifié (Prêt à l'emploi) :</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REAL_COURSE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMainMediaType("image");
                        setMainMediaUrl(preset.banner);
                        setTitle(preset.title);
                        setCategory(preset.category);
                        setPriceFCFA(preset.price);
                        setDuration(preset.duration);
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all group ${
                        mainMediaUrl === preset.banner
                          ? "bg-indigo-500/20 border-indigo-400 ring-1 ring-indigo-400/50"
                          : "bg-slate-900/80 border-slate-800 hover:border-indigo-500/40"
                      }`}
                    >
                      <img src={preset.banner} alt={preset.title} className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-white truncate">{preset.title}</p>
                        <p className="text-[9px] text-indigo-400 font-mono">{preset.price} FCFA • {preset.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 3: 3 ATTACHMENT SLOTS (DRAG & DROP WITH COMPACT CLOUDINARY DROPZONE) */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center">3</span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Extraits de Cours, Syllabus & Certificat (3 Max)
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                  {attachmentImages.filter(Boolean).length} / 3 Supports
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                {[0, 1, 2].map((slotIdx) => (
                  <CloudinaryDropzone
                    key={slotIdx}
                    id={`formateur-attachment-slot-${slotIdx}`}
                    compact={true}
                    value={attachmentImages[slotIdx] || ""}
                    onChange={(url) => {
                      const next = [...attachmentImages];
                      if (url) {
                        next[slotIdx] = url;
                      } else {
                        next.splice(slotIdx, 1);
                      }
                      setAttachmentImages(next.filter(Boolean));
                    }}
                    folder="sen_aura_academy_attachments"
                    acceptedTypes="image"
                    label={`+ Support ${slotIdx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 4: COURSE DETAILS */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center">4</span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Détails & Tarification du Cours
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Titre Complet de la Formation *</label>
                  <input
                    type="text"
                    placeholder="ex: Dimensionnement & Pose d'Installations Solaires Autonomes"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Frais d'Inscription (FCFA) *</label>
                  <input
                    type="number"
                    placeholder="75000"
                    value={priceFCFA}
                    onChange={(e) => setPriceFCFA(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-mono font-bold text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Durée & Format *</label>
                  <input
                    type="text"
                    placeholder="ex: 25 Heures (Pratique + Ateliers)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Programme Pédagogique & Objectifs</label>
                  <textarea
                    rows={3}
                    placeholder="Décrivez les compétences acquises par l'apprenant à l'issue de la formation..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 hover:from-indigo-400 hover:to-purple-400 text-white text-sm font-black shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publication en cours...</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5" />
                  <span>Publier la Formation sur SEN AURA ACADEMY 🎓</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT 5 COLS: LIVE ACADEMY CARD PREVIEW */}
          <div className="xl:col-span-5 sticky top-24 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Aperçu Fiche Cours en Temps Réel
              </h3>
            </div>

            <div className="p-5 rounded-3xl bg-slate-950 border border-indigo-500/40 shadow-2xl space-y-4">
              <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative group">
                {mainMediaType === "video" && mainMediaUrl ? (
                  <video src={mainMediaUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={mainMediaUrl || "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80"}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-sm border border-indigo-500/40 text-[10px] font-bold text-indigo-300">
                  {category}
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-mono font-black text-xs shadow-md">
                  {formatCurrency(parseInt(priceFCFA || "50000", 10), currency === "EUR" ? "EUR" : "FCFA")}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-black text-white leading-snug">
                  {title || "Titre de la Formation..."}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {description || "Programme de formation pratique certifié par SEN AURA TECH avec formateurs agréés."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{duration || "20 Heures"}</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Certificat Inclus ✓</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </form>

      {/* MODAL ANIMATION DE PUBLICATION DU MODULE DE FORMATION */}
      {lastPublishedData && (
        <PublishingProcessModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          productData={lastPublishedData}
          onViewProduct={() => {
            setShowPublishModal(false);
            if (onCancel) onCancel();
          }}
        />
      )}
    </motion.div>
  );
};
