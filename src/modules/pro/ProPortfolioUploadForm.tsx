import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles,
  Wrench,
  ShieldCheck,
  MapPin,
  Clock,
  Coins,
  Check,
  RefreshCw,
  Sun,
  Shield,
  Server,
  Flame,
  Zap,
  Cpu,
  Layers,
  PhoneCall,
  Edit3
} from "lucide-react";
import { uploadToCloudinary, CloudinaryUploadResult } from "../../lib/cloudinary";
import { formatCurrency } from "../../config/constants";
import CloudinaryDropzone from "../../components/common/CloudinaryDropzone";
import PublishingProcessModal from "../../components/common/PublishingProcessModal";
import { authFetch } from "../../lib/authFetch";

interface ProPortfolioUploadFormProps {
  onServiceCreated: (service: any) => void;
  onServiceUpdated?: (service: any) => void;
  onCancel?: () => void;
  currency?: "FCFA" | "EUR";
  editItem?: any;
}

interface SpecialtyOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGlow: string;
  description: string;
}

const SPECIALTIES: SpecialtyOption[] = [
  {
    id: "solaire",
    name: "Installation Solaire & Onduleurs",
    icon: Sun,
    color: "text-amber-400",
    bgGlow: "from-amber-500/20 to-orange-500/10 border-amber-500/40",
    description: "Pose panneaux, raccordement onduleurs hybrides & parcs batteries",
  },
  {
    id: "pompage",
    name: "Pompage Solaire & Forages",
    icon: Zap,
    color: "text-cyan-400",
    bgGlow: "from-cyan-500/20 to-blue-500/10 border-cyan-500/40",
    description: "Installation pompes immergées solaires & variateurs d'irrigation",
  },
  {
    id: "securite",
    name: "Vidéosurveillance & Alarmes",
    icon: Shield,
    color: "text-rose-400",
    bgGlow: "from-rose-500/20 to-pink-500/10 border-rose-500/40",
    description: "Installation caméras IP 4K, NVR IA, contrôle d'accès biométrique",
  },
  {
    id: "fibre",
    name: "Câblage Réseaux & Fibre Optique",
    icon: Server,
    color: "text-sky-400",
    bgGlow: "from-sky-500/20 to-blue-500/10 border-sky-500/40",
    description: "Soudure fibre optique, brassage de baies, bornes Wifi 6 longue portée",
  },
  {
    id: "froid",
    name: "Climatisation & Froid Industriel",
    icon: Flame,
    color: "text-yellow-400",
    bgGlow: "from-yellow-500/20 to-amber-500/10 border-yellow-500/40",
    description: "Pose de splits DC Inverter solaires & chambres froides autonomes",
  },
  {
    id: "domotique",
    name: "Domotique & Électricité Bâtiment",
    icon: Cpu,
    color: "text-emerald-400",
    bgGlow: "from-emerald-500/20 to-teal-500/10 border-emerald-500/40",
    description: "Tableaux électriques, protection parafoudre & automatisation Smart Home",
  },
];

const REAL_PROJECT_PRESETS = [
  {
    title: "Installation Kit Solaire 10kWp Hybride + Batterie Lithium",
    specialty: "Installation Solaire & Onduleurs",
    location: "Almadies / Ngor, Dakar",
    rate: "150000",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1000&auto=format&fit=crop&q=80",
    duration: "2 Jours d'intervention"
  },
  {
    title: "Déploiement 16 Caméras IP 4K Dahua + Baie NVR Sécurisée",
    specialty: "Vidéosurveillance & Alarmes",
    location: "Sacré-Cœur 3 / VDN, Dakar",
    rate: "120000",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1000&auto=format&fit=crop&q=80",
    duration: "1 Jour d'intervention"
  },
  {
    title: "Câblage Structuré Baie 42U & Soudure Fibre 24 Brins",
    specialty: "Câblage Réseaux & Fibre Optique",
    location: "Plateau, Dakar",
    rate: "180000",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&auto=format&fit=crop&q=80",
    duration: "3 Jours d'intervention"
  },
  {
    title: "Installation Système de Pompage Solaire Forage Agricole 5.5kW",
    specialty: "Pompage Solaire & Forages",
    location: "Niayes / Thiès",
    rate: "200000",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&auto=format&fit=crop&q=80",
    duration: "2 Jours d'intervention"
  }
];

export const ProPortfolioUploadForm: React.FC<ProPortfolioUploadFormProps> = ({
  onServiceCreated,
  onServiceUpdated,
  onCancel,
  currency = "FCFA",
  editItem,
}) => {
  const isEdit = !!editItem;

  useEffect(() => {
    if (isEdit && editItem) {
      setTitle(editItem.title || "");
      setSpecialty(editItem.specialty || "Installation Solaire & Onduleurs");
      setLocation(editItem.location || "Dakar & Régions");
      setEstimatedCostFCFA(String(editItem.estimatedCostFCFA || 120000));
      setExecutionTime(editItem.executionTime || "1 à 2 Jours");
      setDescription(editItem.description || "");
      setGuaranteePeriod(editItem.guaranteePeriod || "12 Mois Garantie Main d'œuvre");
      setMainMediaUrl(editItem.mainMediaUrl || "");
      setMainMediaType(editItem.mainMediaType || "image");
      setGalleryImages(editItem.galleryImages || []);
    }
  }, [isEdit, editItem]);

  // Media state
  const [mainMediaType, setMainMediaType] = useState<"image" | "video">("image");
  const [mainMediaUrl, setMainMediaUrl] = useState<string>("");
  const [mainMediaUploading, setMainMediaUploading] = useState<boolean>(false);
  const [mainMediaMeta, setMainMediaMeta] = useState<CloudinaryUploadResult | null>(null);
  const [isMainDragOver, setIsMainDragOver] = useState<boolean>(false);

  // 3 Project Gallery Slots
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryUploadingIdx, setGalleryUploadingIdx] = useState<number | null>(null);

  // Form fields
  const [title, setTitle] = useState<string>("");
  const [specialty, setSpecialty] = useState<string>("Installation Solaire & Onduleurs");
  const [location, setLocation] = useState<string>("Dakar & Régions");
  const [estimatedCostFCFA, setEstimatedCostFCFA] = useState<string>("120000");
  const [executionTime, setExecutionTime] = useState<string>("1 à 2 Jours");
  const [description, setDescription] = useState<string>("");
  const [guaranteePeriod, setGuaranteePeriod] = useState<string>("12 Mois Garantie Main d'œuvre");

  // Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [lastPublishedData, setLastPublishedData] = useState<any>(null);

  // Refs
  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const handleMainFileUpload = async (file: File) => {
    if (!file) return;
    setMainMediaUploading(true);
    setErrorMsg("");

    const isVid = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".webm") || file.name.endsWith(".mov");
    const targetType = isVid ? "video" : "image";
    setMainMediaType(targetType);

    try {
      const result = await uploadToCloudinary(file, "sen_aura_pro_portfolio", targetType);
      if (result && result.secure_url) {
        setMainMediaUrl(result.secure_url);
        setMainMediaMeta(result);
      }
    } catch (err) {
      console.error("Erreur d'upload Cloudinary:", err);
      setErrorMsg("Échec du téléversement du média de prestation sur Cloudinary.");
    } finally {
      setMainMediaUploading(false);
    }
  };

  const handleGalleryUpload = async (slotIdx: number, file: File) => {
    if (!file) return;
    setGalleryUploadingIdx(slotIdx);
    setErrorMsg("");

    try {
      const result = await uploadToCloudinary(file, "sen_aura_pro_gallery", "image");
      if (result && result.secure_url) {
        const nextGallery = [...galleryImages];
        nextGallery[slotIdx] = result.secure_url;
        setGalleryImages(nextGallery);
      }
    } catch (err) {
      console.error(`Erreur d'upload photo chantier ${slotIdx + 1}:`, err);
      setErrorMsg(`Échec de l'upload pour la photo de chantier ${slotIdx + 1}.`);
    } finally {
      setGalleryUploadingIdx(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Veuillez indiquer l'intitulé de la prestation ou réalisation.");
      return;
    }
    if (!mainMediaUrl) {
      setErrorMsg("Veuillez ajouter une photo de chantier ou vidéo avant/après.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const token = localStorage.getItem("senaura_auth_token");
    const proId = token ? JSON.parse(atob(token.split(".")[1]).replace(/\\"/g, '"'))?.id : undefined;

    const servicePayload: any = {
      proId: proId || editItem?.proId,
      proName: editItem?.proName || "Prestataire",
      title: title.trim(),
      specialty,
      location,
      estimatedCostFCFA: parseInt(estimatedCostFCFA || "80000", 10),
      executionTime,
      description: description.trim() || "Intervention réalisée selon les normes de conformité technique SEN AURA TECH.",
      guaranteePeriod,
      mainMediaUrl,
      mainMediaType,
      galleryImages: galleryImages.filter(Boolean),
      verifiedBadge: true,
      rating: 5.0,
    };

    try {
      let endpoint = "/api/pro/portfolio";
      let method = "POST";
      let finalPayload = servicePayload;

      if (isEdit && editItem?.id) {
        endpoint = `/api/pro/portfolio/${editItem.id}`;
        method = "PUT";
        finalPayload = {
          title: servicePayload.title,
          specialty: servicePayload.specialty,
          location: servicePayload.location,
          estimatedCostFCFA: servicePayload.estimatedCostFCFA,
          executionTime: servicePayload.executionTime,
          description: servicePayload.description,
          guaranteePeriod: servicePayload.guaranteePeriod,
          mainMediaUrl: servicePayload.mainMediaUrl,
          mainMediaType: servicePayload.mainMediaType,
          galleryImages: servicePayload.galleryImages,
          isActive: true,
        };
      }

      const res = await authFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || "Erreur lors de l'enregistrement.");
        setIsSubmitting(false);
        return;
      }

      const saved = data.portfolio || data.service || servicePayload;
      setLastPublishedData({
        title: title.trim(),
        category: specialty,
        priceFCFA: parseInt(estimatedCostFCFA || "80000", 10),
        mainMediaUrl,
        mediaType: mainMediaType,
        sku: saved.id,
        type: "service",
      });
      setShowPublishModal(true);

      if (isEdit) {
        onServiceUpdated?.(saved);
        setSuccessMsg("Réalisation modifiée avec succès !");
      } else {
        onServiceCreated(saved);
        setSuccessMsg(`Prestation / Réalisation "${title}" publiée avec succès sur votre profil !`);
      }

      setTimeout(() => {
        setTitle("");
        setMainMediaUrl("");
        setGalleryImages([]);
        setDescription("");
        setSuccessMsg("");
        setShowPublishModal(false);
        if (!isEdit && onCancel) onCancel();
      }, 1500);
    } catch (err) {
      console.error("Erreur de sauvegarde:", err);
      setErrorMsg("Erreur réseau lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl text-slate-200"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-xs font-black text-amber-300 mb-2">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEdit ? "ESPACE PRESTATAIRE • MODIFIER RÉALISATION" : "ESPACE PRESTATAIRE • PORTFOLIO CHANTIERS HD"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isEdit ? "Modifier ma Réalisation / Prestation" : "Publier une Réalisation / Prestation Technique (Photo / Vidéo HD)"}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {isEdit
              ? "Modifiez les informations de votre réalisation. Les changements seront appliqués immédiatement."
              : "Mettez en valeur vos travaux sur le terrain avec <strong className=\"text-amber-400\">1 média avant/après HD</strong> + jusqu'à <strong className=\"text-amber-400\">3 photos de chantier</strong> pour attirer de nouveaux clients au Sénégal."}
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
          >
            Retour aux Missions
          </button>
        )}
      </div>

      {/* Messages */}
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
          
          {/* LEFT 7 COLS */}
          <div className="xl:col-span-7 space-y-6">

            {/* STEP 1: SPECIALTY SELECTION */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Spécialité Technique du Projet
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  {specialty}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {SPECIALTIES.map((spec) => {
                  const Icon = spec.icon;
                  const isSelected = specialty === spec.name;

                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => setSpecialty(spec.name)}
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? `bg-gradient-to-br ${spec.bgGlow} shadow-lg ring-1 ring-amber-400/50`
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${isSelected ? spec.color : "text-slate-500"}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-slate-300"}`}>
                        {spec.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: MAIN MEDIA */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Média Principal : Photo Chantier ou Vidéo Démo <span className="text-amber-400">*</span>
                  </h3>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMainMediaType("image")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mainMediaType === "image"
                        ? "bg-amber-500 text-slate-950 shadow-md font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photo HD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMainMediaType("video")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mainMediaType === "video"
                        ? "bg-amber-500 text-slate-950 shadow-md font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Vidéo Avant/Après</span>
                  </button>
                </div>
              </div>

              {/* Cloudinary Real-time Dropzone with Progress & Success/Error Indicators */}
              <CloudinaryDropzone
                id="pro-main-media-dropzone"
                value={mainMediaUrl}
                onChange={(url, meta) => {
                  setMainMediaUrl(url);
                  setMainMediaMeta(meta || null);
                }}
                folder="sen_aura_pro_portfolio"
                acceptedTypes={mainMediaType === "video" ? "video" : "image"}
                maxSizeMB={mainMediaType === "video" ? 60 : 20}
                label={mainMediaType === "video" ? "Glissez & déposez votre vidéo de chantier / réalisation" : "Glissez & déposez votre photo de réalisation HD"}
                subLabel={mainMediaType === "video" ? "Format MP4, WebM ou MOV (Jusqu'à 60 Mo) avec compression Cloudinary HD" : "Format JPG, PNG, WEBP haute résolution (Jusqu'à 20 Mo)"}
              />

              {/* Project Presets */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ou choisir un chantier type certifié (Prêt à l'emploi) :</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REAL_PROJECT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMainMediaType("image");
                        setMainMediaUrl(preset.image);
                        setTitle(preset.title);
                        setSpecialty(preset.specialty);
                        setLocation(preset.location);
                        setEstimatedCostFCFA(preset.rate);
                        setExecutionTime(preset.duration);
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all group ${
                        mainMediaUrl === preset.image
                          ? "bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50"
                          : "bg-slate-900/80 border-slate-800 hover:border-amber-500/40"
                      }`}
                    >
                      <img src={preset.image} alt={preset.title} className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-white truncate">{preset.title}</p>
                        <p className="text-[9px] text-amber-400 font-mono">{preset.rate} FCFA • {preset.location}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 3: 3 GALLERY PHOTOS (DRAG & DROP WITH COMPACT CLOUDINARY DROPZONE) */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center">3</span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Photos Additionnelles de Chantier (3 Max)
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  {galleryImages.filter(Boolean).length} / 3 Photos
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                {[0, 1, 2].map((slotIdx) => (
                  <CloudinaryDropzone
                    key={slotIdx}
                    id={`pro-gallery-slot-${slotIdx}`}
                    compact={true}
                    value={galleryImages[slotIdx] || ""}
                    onChange={(url) => {
                      const next = [...galleryImages];
                      if (url) {
                        next[slotIdx] = url;
                      } else {
                        next.splice(slotIdx, 1);
                      }
                      setGalleryImages(next.filter(Boolean));
                    }}
                    folder="sen_aura_pro_gallery"
                    acceptedTypes="image"
                    label={`+ Vue ${slotIdx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 4: DETAILS */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center">4</span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Détails & Tarification de la Prestation
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Titre de la Prestation ou Réalisation *</label>
                  <input
                    type="text"
                    placeholder="ex: Installation & Câblage Kit Solaire 5kVA Hybride"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Tarif Indicatif / Main d'œuvre (FCFA) *</label>
                  <input
                    type="number"
                    placeholder="120000"
                    value={estimatedCostFCFA}
                    onChange={(e) => setEstimatedCostFCFA(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-mono font-bold text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Zone d'Intervention *</label>
                  <input
                    type="text"
                    placeholder="ex: Dakar, Diamniadio, Thiès & Mbour"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Description des Travaux Effectués</label>
                  <textarea
                    rows={3}
                    placeholder="Expliquez les étapes du chantier, les matériels raccordés et la satisfaction du client..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-sm font-black shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{isEdit ? "Enregistrement..." : "Publication en cours..."}</span>
                </>
              ) : (
                <>
                  {isEdit ? <Edit3 className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                  <span>{isEdit ? "Enregistrer les Modifications" : "Publier la Prestation / Chantier sur mon Profil Pro ⚡"}</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT 5 COLS: LIVE CARD PREVIEW */}
          <div className="xl:col-span-5 sticky top-24 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Aperçu Fiche Prestation en Direct
              </h3>
            </div>

            <div className="p-5 rounded-3xl bg-slate-950 border border-amber-500/40 shadow-2xl space-y-4">
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
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-sm border border-amber-500/40 text-[10px] font-bold text-amber-300">
                  {specialty}
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-mono font-black text-xs shadow-md">
                  {formatCurrency(parseInt(estimatedCostFCFA || "80000", 10), currency === "EUR" ? "EUR" : "FCFA")}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-black text-white leading-snug">
                  {title || "Titre de la Prestation / Chantier..."}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {description || "Intervention technique réalisée selon les standards de qualité certifiés SEN AURA TECH."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{location || "Dakar"}</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Artisan Certifié ✓</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </form>

      {/* MODAL ANIMATION DE PUBLICATION DU CHANTIER / PRESTATION */}
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

export default ProPortfolioUploadForm;
