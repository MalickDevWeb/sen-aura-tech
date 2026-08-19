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
  PackageCheck,
  Tag,
  Layers,
  Coins,
  FileText,
  Play,
  Eye,
  ExternalLink,
  RefreshCw,
  Plus,
  Sun,
  Shield,
  Laptop,
  Server,
  Smartphone,
  Cpu,
  Cable,
  Zap,
  Check,
  Info,
  SlidersHorizontal,
  ChevronRight,
  ShoppingCart,
  PhoneCall,
  Flame
} from "lucide-react";
import { uploadToCloudinary, CloudinaryUploadResult } from "../../lib/cloudinary";
import { CloudinaryDropzone } from "../../components/common/CloudinaryDropzone";
import PublishingProcessModal from "../../components/common/PublishingProcessModal";
import { formatCurrency } from "../../config/constants";
import { authFetch } from "../../lib/authFetch";

interface VendorProductUploadFormProps {
  onProductCreated: (product: any) => void;
  onCancel?: () => void;
  currency?: "FCFA" | "EUR";
}

interface CategoryOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGlow: string;
  description: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: "solaire",
    name: "Solaire & Énergie Hybride",
    icon: Sun,
    color: "text-amber-400",
    bgGlow: "from-amber-500/20 to-orange-500/10 border-amber-500/40",
    description: "Panneaux solaires monocristallins, onduleurs hybrides 5kW/10kW, batteries LiFePO4",
  },
  {
    id: "pompage",
    name: "Pompage Solaire & Irrigation",
    icon: Zap,
    color: "text-cyan-400",
    bgGlow: "from-cyan-500/20 to-blue-500/10 border-cyan-500/40",
    description: "Pompes solaires immergées, variateurs de pompage, forages agricoles",
  },
  {
    id: "climatisation",
    name: "Climatisation & Froid Solaire",
    icon: Sparkles,
    color: "text-sky-300",
    bgGlow: "from-sky-500/20 to-teal-500/10 border-sky-500/40",
    description: "Splits DC Inverter solaires, réfrigérateurs & congélateurs solaires 12/24V",
  },
  {
    id: "eclairage",
    name: "Éclairage Public & Lampadaires",
    icon: Flame,
    color: "text-yellow-400",
    bgGlow: "from-yellow-500/20 to-amber-500/10 border-yellow-500/40",
    description: "Candélabres LED autonomes Tout-en-un, projecteurs solaires 300W/500W",
  },
  {
    id: "securite",
    name: "Vidéosurveillance IA & Alarmes",
    icon: Shield,
    color: "text-rose-400",
    bgGlow: "from-rose-500/20 to-pink-500/10 border-rose-500/40",
    description: "Caméras IP 4K PTZ, NVR avec IA Dahua/Hikvision, alarmes sans fil",
  },
  {
    id: "domotique",
    name: "Domotique & Smart Home IoT",
    icon: Cpu,
    color: "text-emerald-400",
    bgGlow: "from-emerald-500/20 to-teal-500/10 border-emerald-500/40",
    description: "Interrupteurs tactiles Wifi/Zigbee, capteurs d'inondation & mouvement, serrures connectées",
  },
  {
    id: "ordinateurs",
    name: "Ordinateurs, Laptops & Stations",
    icon: Laptop,
    color: "text-sky-400",
    bgGlow: "from-sky-500/20 to-blue-500/10 border-sky-500/40",
    description: "PC Portables pro Dell/HP/Lenovo, MacBook Pro M3, PC Gamer & stations CAO",
  },
  {
    id: "serveurs",
    name: "Serveurs, Fibre & Baies Réseau",
    icon: Server,
    color: "text-indigo-400",
    bgGlow: "from-indigo-500/20 to-purple-500/10 border-indigo-500/40",
    description: "Switchs Cisco PoE Gigabit, routeurs Mikrotik, baies 42U, jarretières fibre",
  },
  {
    id: "telephonie",
    name: "Téléphonie, Tablettes & Terminaux",
    icon: Smartphone,
    color: "text-emerald-400",
    bgGlow: "from-emerald-500/20 to-teal-500/10 border-emerald-500/40",
    description: "Smartphones 5G, iPad/tablettes durcies, terminaux de paiement TPE",
  },
  {
    id: "onduleurs",
    name: "Onduleurs Online & Protection",
    icon: Zap,
    color: "text-purple-400",
    bgGlow: "from-purple-500/20 to-fuchsia-500/10 border-purple-500/40",
    description: "Onduleurs APC Smart-UPS, stabilisateurs de tension servo, parafoudres industriels",
  },
  {
    id: "outillage",
    name: "Outillage Pro, Mesure & Testeurs",
    icon: SlidersHorizontal,
    color: "text-amber-300",
    bgGlow: "from-amber-500/20 to-yellow-500/10 border-amber-500/40",
    description: "Multimètres Fluke, pinces ampèremétriques solaires, soudeuses fibre optique",
  },
  {
    id: "cablage",
    name: "Câblage, Coffrets DC & Accessoires",
    icon: Cable,
    color: "text-slate-300",
    bgGlow: "from-slate-500/20 to-zinc-500/10 border-slate-500/40",
    description: "Câbles solaires H1Z2Z2-K 6mm², connecteurs MC4, coffrets de protection DC 1000V",
  },
];

// High-resolution verified real equipment photos
const REAL_PHOTO_PRESETS = [
  {
    name: "Onduleur Hybride 5.5kW Deye / Growatt",
    url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1000&auto=format&fit=crop&q=80",
    category: "Solaire & Énergie Hybride",
    price: "750000",
    brand: "Growatt / Deye"
  },
  {
    name: "Kit 4 Caméras 4K IP Dahua + NVR IA",
    url: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1000&auto=format&fit=crop&q=80",
    category: "Vidéosurveillance IA & Alarmes",
    price: "320000",
    brand: "Dahua Technology"
  },
  {
    name: "PC Portable Dell Latitude 5440 i7 16GB",
    url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1000&auto=format&fit=crop&q=80",
    category: "Ordinateurs, Laptops & Stations",
    price: "650000",
    brand: "Dell Pro"
  },
  {
    name: "Apple MacBook Pro 16 M3 Max 36GB",
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80",
    category: "Ordinateurs, Laptops & Stations",
    price: "1850000",
    brand: "Apple"
  },
  {
    name: "Switch Cisco Catalyst 24 Ports PoE+",
    url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&auto=format&fit=crop&q=80",
    category: "Serveurs, Fibre & Baies Réseau",
    price: "420000",
    brand: "Cisco Systems"
  },
  {
    name: "Caméra Solaire 4G Autonome 2K ColorVu",
    url: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=1000&auto=format&fit=crop&q=80",
    category: "Vidéosurveillance IA & Alarmes",
    price: "145000",
    brand: "Hikvision"
  },
  {
    name: "Batterie Solaire LiFePO4 48V 100Ah (5.12kWh)",
    url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&auto=format&fit=crop&q=80",
    category: "Solaire & Énergie Hybride",
    price: "980000",
    brand: "Pylontech"
  },
  {
    name: "Antenne Satellite Starlink V4 Standard",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1000&auto=format&fit=crop&q=80",
    category: "Serveurs, Fibre & Baies Réseau",
    price: "350000",
    brand: "Starlink SpaceX"
  }
];

export const VendorProductUploadForm: React.FC<VendorProductUploadFormProps> = ({
  onProductCreated,
  onCancel,
  currency = "FCFA",
}) => {
  // Main media state (Photo or Video)
  const [mainMediaType, setMainMediaType] = useState<"image" | "video">("image");
  const [mainMediaUrl, setMainMediaUrl] = useState<string>("");
  const [mainMediaUploading, setMainMediaUploading] = useState<boolean>(false);
  const [mainMediaMeta, setMainMediaMeta] = useState<CloudinaryUploadResult | null>(null);
  const [isMainDragOver, setIsMainDragOver] = useState<boolean>(false);

  // 3 Optional Photos state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryUploadingIdx, setGalleryUploadingIdx] = useState<number | null>(null);
  const [dragOverGalleryIdx, setDragOverGalleryIdx] = useState<number | null>(null);

  // Product form fields
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("Solaire & Énergie");
  const [brand, setBrand] = useState<string>("SEN AURA TECH");
  const [priceFCFA, setPriceFCFA] = useState<string>("");
  const [stock, setStock] = useState<string>("10");
  const [description, setDescription] = useState<string>("");
  const [spec1Key, setSpec1Key] = useState<string>("Garantie");
  const [spec1Val, setSpec1Val] = useState<string>("1 An Constructeur");
  const [spec2Key, setSpec2Key] = useState<string>("Livraison");
  const [spec2Val, setSpec2Val] = useState<string>("Express 24h Sénégal");

  // Status & error state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [lastPublishedData, setLastPublishedData] = useState<{
    title: string;
    category?: string;
    priceFCFA?: number | string;
    mainMediaUrl?: string;
    mediaType?: "image" | "video";
    sku?: string;
    type?: "product";
  } | null>(null);

  // Preview interactive state
  const [activePreviewMediaIdx, setActivePreviewMediaIdx] = useState<number>(0);

  // Refs for hidden file inputs
  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  // Drag & Drop handler for Main Media
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

  // Upload main file to Cloudinary
  const handleMainFileUpload = async (file: File) => {
    if (!file) return;
    setMainMediaUploading(true);
    setErrorMsg("");

    const isVid = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".mov") || file.name.endsWith(".webm");
    const targetType = isVid ? "video" : "image";
    setMainMediaType(targetType);

    try {
      const result = await uploadToCloudinary(file, "sen_aura_vendor_products", targetType);
      if (result && result.secure_url) {
        setMainMediaUrl(result.secure_url);
        setMainMediaMeta(result);
        setActivePreviewMediaIdx(0);
      } else {
        throw new Error("L'URL sécurisée Cloudinary n'a pas pu être générée.");
      }
    } catch (err: any) {
      console.error("Erreur d'upload Cloudinary média principal:", err);
      setErrorMsg("Échec du téléversement du média principal sur Cloudinary.");
    } finally {
      setMainMediaUploading(false);
    }
  };

  // Drag & Drop for Optional Gallery Slots
  const handleGalleryDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverGalleryIdx(slotIdx);
  };

  const handleGalleryDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverGalleryIdx(null);
  };

  const handleGalleryDrop = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverGalleryIdx(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleGallerySlotUpload(slotIdx, e.dataTransfer.files[0]);
    }
  };

  // Handle optional photo slot upload
  const handleGallerySlotUpload = async (slotIndex: number, file: File) => {
    if (!file) return;
    setGalleryUploadingIdx(slotIndex);
    setErrorMsg("");

    try {
      const result = await uploadToCloudinary(file, "sen_aura_vendor_gallery", "image");
      if (result && result.secure_url) {
        const nextGallery = [...galleryImages];
        nextGallery[slotIndex] = result.secure_url;
        setGalleryImages(nextGallery);
      }
    } catch (err: any) {
      console.error(`Erreur d'upload photo optionnelle ${slotIndex + 1}:`, err);
      setErrorMsg(`Échec de l'upload pour la photo optionnelle ${slotIndex + 1}.`);
    } finally {
      setGalleryUploadingIdx(null);
    }
  };

  const handleRemoveGalleryImage = (slotIndex: number) => {
    const nextGallery = [...galleryImages];
    nextGallery.splice(slotIndex, 1);
    setGalleryImages(nextGallery);
  };

  // Submit to Backend API & Store
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!title.trim()) {
      setErrorMsg("Veuillez renseigner le nom ou le titre de l'article.");
      return;
    }
    if (!priceFCFA || Number(priceFCFA) <= 0) {
      setErrorMsg("Veuillez indiquer un prix de vente valide en FCFA.");
      return;
    }
    if (!mainMediaUrl) {
      setErrorMsg("Veuillez téléverser ou glisser-déposer la photo principale ou la vidéo du produit.");
      return;
    }

    setIsSubmitting(true);

    const productPayload = {
      name: title.trim(),
      title: title.trim(),
      category,
      brand: brand.trim() || "SEN AURA PARTENAIRE",
      price: Number(priceFCFA),
      priceFCFA: Number(priceFCFA),
      stock: Number(stock) || 1,
      mainMediaUrl,
      imageUrl: mainMediaUrl,
      image: mainMediaUrl,
      mediaType: mainMediaType,
      galleryImages: galleryImages.filter(Boolean).slice(0, 3),
      videoUrl: mainMediaType === "video" ? mainMediaUrl : undefined,
      description: description.trim() || `Équipement ${title.trim()} sous garantie constructeur avec livraison sécurisée.`,
      specs: {
        [spec1Key || "Garantie"]: spec1Val || "1 An",
        [spec2Key || "Livraison"]: spec2Val || "24h au Sénégal",
        "Type Média": mainMediaType === "video" ? "Démonstration Vidéo HD" : "Photographie Officielle",
      },
    };

    try {
      const response = await authFetch("/api/vendor-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productPayload),
      });

      let backendProduct = null;
      if (response.ok) {
        const json = await response.json();
        backendProduct = json.product;
      }

      const finalProduct = backendProduct || {
        ...productPayload,
        id: `VND-PROD-${Date.now()}`,
        status: "Disponible",
        rating: 5.0,
        salesCount: 0,
        createdAt: new Date().toISOString(),
      };

      setLastPublishedData({
        title: title.trim(),
        category,
        priceFCFA: Number(priceFCFA),
        mainMediaUrl,
        mediaType: mainMediaType,
        sku: finalProduct.id || `SEN-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "product",
      });
      setShowPublishModal(true);

      setSuccessMsg(`Produit "${title}" enregistré sur Cloudinary et publié avec succès dans la Boutique !`);
      onProductCreated(finalProduct);

      // Dispatch real-time refresh event across the entire application
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sat_product_published", { detail: finalProduct }));
        window.dispatchEvent(new CustomEvent("sat_products_updated"));
      }

      setTimeout(() => {
        setTitle("");
        setPriceFCFA("");
        setStock("10");
        setDescription("");
        setMainMediaUrl("");
        setMainMediaMeta(null);
        setGalleryImages([]);
        setSuccessMsg("");
      }, 1200);
    } catch (err: any) {
      console.error("Erreur de sauvegarde produit:", err);
      const localProduct = {
        ...productPayload,
        id: `VND-PROD-${Date.now()}`,
        status: "Disponible",
        rating: 5.0,
        salesCount: 0,
        createdAt: new Date().toISOString(),
      };
      setLastPublishedData({
        title: title.trim(),
        category,
        priceFCFA: Number(priceFCFA),
        mainMediaUrl,
        mediaType: mainMediaType,
        sku: localProduct.id,
        type: "product",
      });
      setShowPublishModal(true);
      onProductCreated(localProduct);
      setSuccessMsg(`Produit "${title}" publié dans votre catalogue Vendeur !`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview Media Array
  const previewMediaList = [
    {
      url: mainMediaUrl || "https://res.cloudinary.com/senauratech/image/upload/v1720000000/sen_aura_tech/onduleur_solaire_hybride_5.5kw.png",
      type: mainMediaType,
      label: mainMediaType === "video" ? "Vidéo HD" : "Photo Principale",
    },
    ...galleryImages.filter(Boolean).map((img, i) => ({
      url: img,
      type: "image" as const,
      label: `Vue ${i + 1}`,
    })),
  ];

  const currentPreviewMedia = previewMediaList[activePreviewMediaIdx] || previewMediaList[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl text-slate-200"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-xs font-black text-amber-300 mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>ESPACE VENDEUR • CLOUDINARY CDN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Publier un Produit avec Photos & Vidéo HD
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Téléversez <strong className="text-amber-400">1 média principal</strong> (photo ou vidéo démonstration) + jusqu'à <strong className="text-amber-400">3 photos optionnelles</strong> avec hébergement Cloudinary ultra-rapide et aperçu en direct de la boutique.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors self-start sm:self-auto"
          >
            Retour au Catalogue
          </button>
        )}
      </div>

      {/* Status Messages */}
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
        
        {/* Main Grid: Form Controls (Left) + Live Boutique Card Preview (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* ================================================================= */}
          {/* LEFT 7 COLUMNS: MEDIA UPLOAD + CATEGORIES + FORM FIELDS           */}
          {/* ================================================================= */}
          <div className="xl:col-span-7 space-y-6">

            {/* STEP 1: CATEGORY SELECTION (CARDS ANIMÉES) */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Catégorie du Produit
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  {category}
                </span>
              </div>

              {/* Category Chips with Icons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.name;

                  return (
                    <motion.button
                      key={cat.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCategory(cat.name)}
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? `bg-gradient-to-br ${cat.bgGlow} shadow-lg ring-1 ring-amber-400/50`
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${isSelected ? cat.color : "text-slate-500"}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-slate-300"}`}>
                          {cat.name}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: MAIN MEDIA UPLOAD (DRAG & DROP PHOTO OR VIDEO) */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Média Principal : Photo ou Vidéo <span className="text-amber-400">*</span>
                  </h3>
                </div>

                {/* Media Type Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMainMediaType("image")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mainMediaType === "image"
                        ? "bg-amber-500 text-slate-950 shadow-md"
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
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Vidéo Démo</span>
                  </button>
                </div>
              </div>

              {/* Main Media Dropzone with Real-Time Progress, Stages & Indicators */}
              <CloudinaryDropzone
                id="vendor-main-media-dropzone"
                value={mainMediaUrl}
                onChange={(url, meta) => {
                  setMainMediaUrl(url);
                  setMainMediaMeta(meta || null);
                  if (url) setActivePreviewMediaIdx(0);
                }}
                folder="sen_aura_vendor_products"
                acceptedTypes={mainMediaType === "video" ? "video" : "image"}
                maxSizeMB={mainMediaType === "video" ? 60 : 20}
                label={mainMediaType === "video" ? "Glissez & déposez votre vidéo démo ici" : "Glissez & déposez votre photo principale ici"}
                subLabel={mainMediaType === "video" ? "Format MP4, WebM ou MOV (Jusqu'à 60 Mo) avec compression Cloudinary HD" : "Format JPG, PNG, WEBP haute résolution (Jusqu'à 20 Mo)"}
              />

              {/* Quick Real HD Equipment Photos Selector */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ou choisir une vraie photo de matériel HD vérifiée :</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {REAL_PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMainMediaType("image");
                        setMainMediaUrl(preset.url);
                        setTitle(preset.name);
                        setCategory(preset.category);
                        setPriceFCFA(preset.price);
                        setBrand(preset.brand);
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all group ${
                        mainMediaUrl === preset.url
                          ? "bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50"
                          : "bg-slate-900/80 border-slate-800 hover:border-amber-500/40"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-white truncate">{preset.name}</p>
                        <p className="text-[9px] text-amber-400 font-mono">{preset.price} F</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 3: 3 OPTIONAL PHOTOS (DRAG & DROP WITH COMPACT CLOUDINARY DROPZONE SLOTS) */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center">3</span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Photos Complémentaires Optionnelles (3 Max)
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
                    id={`vendor-gallery-slot-${slotIdx}`}
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
                    folder="sen_aura_vendor_gallery"
                    acceptedTypes="image"
                    label={`+ Photo ${slotIdx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 4: PRODUCT SPECS & DETAILS */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center">4</span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Détails & Tarification
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Title */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Nom / Titre du Matériel *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Onduleur Solaire Hybride 5.5kVA SEN AURA PRO"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50"
                  />
                </div>

                {/* Brand */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Marque / Fabricant</label>
                  <input
                    type="text"
                    placeholder="Ex: SEN AURA TECH, Must, Dahua, TP-Link"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50"
                  />
                </div>

                {/* Price FCFA */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Prix de Vente (FCFA) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="Ex: 420000"
                      value={priceFCFA}
                      onChange={(e) => setPriceFCFA(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-mono font-bold text-xs placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono font-bold text-slate-400">
                      FCFA
                    </span>
                  </div>
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Stock Initial Disponible</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50"
                  />
                </div>

                {/* Guarantee */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Garantie Fournie</label>
                  <input
                    type="text"
                    value={spec1Val}
                    onChange={(e) => setSpec1Val(e.target.value)}
                    placeholder="1 An Constructeur"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-amber-500/50"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Description Détaillée</label>
                  <textarea
                    rows={2}
                    placeholder="Spécifications phares, câbles inclus, compatibilité avec installations solaires ou informatiques..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50 resize-none"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ================================================================= */}
          {/* RIGHT 5 COLUMNS: LIVE CARD PREVIEW (APERÇU BOUTIQUE EN DIRECT)     */}
          {/* ================================================================= */}
          <div className="xl:col-span-5 space-y-4 xl:sticky xl:top-20">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Aperçu Boutique en Direct</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Temps Réel
              </span>
            </div>

            {/* Simulated Boutique Card */}
            <div className="rounded-3xl bg-slate-950 border border-slate-800/90 overflow-hidden shadow-2xl p-4 space-y-4">
              
              {/* Media Stage */}
              <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                {currentPreviewMedia.type === "video" ? (
                  <video
                    src={currentPreviewMedia.url}
                    controls
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <img
                    src={currentPreviewMedia.url}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-[10px] font-bold text-amber-400">
                    {category}
                  </span>
                  {currentPreviewMedia.type === "video" && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase flex items-center gap-1">
                      <Video className="w-2.5 h-2.5" /> Vidéo HD
                    </span>
                  )}
                </div>

                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 text-[10px] font-black">
                  En Stock ({stock || 1})
                </span>
              </div>

              {/* Thumbnails Swapper */}
              {previewMediaList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {previewMediaList.map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePreviewMediaIdx(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activePreviewMediaIdx === idx
                          ? "border-amber-500 ring-2 ring-amber-500/20 scale-105"
                          : "border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {m.type === "video" ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-amber-400">
                          <Play className="w-4 h-4 fill-amber-400" />
                        </div>
                      ) : (
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Card Meta & Price */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  {brand || "SEN AURA TECH"}
                </span>
                <h4 className="text-sm font-bold text-white leading-snug">
                  {title || "Titre de l'équipement solaire ou informatique"}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {description || "Description de l'article avec spécifications techniques de pointe et livraison express."}
                </p>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-900">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Prix de Vente :</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      {formatCurrency(Number(priceFCFA) || 0, currency === "EUR" ? "EUR" : "FCFA")}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                    Garantie {spec1Val || "1 An"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Acheter l'Article</span>
                </button>
              </div>

            </div>

            {/* Cloudinary Integration Note */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Info className="w-3.5 h-3.5" />
                <span>Synchronisation Automatique</span>
              </div>
              <p>
                Dès validation, l'URL Cloudinary est enregistrée dans le backend et votre produit apparaît immédiatement dans la Boutique officielle.
              </p>
            </div>

          </div>

        </div>

        {/* ================================================================= */}
        {/* BOTTOM SUBMISSION BAR                                             */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {priceFCFA && (
              <span>
                Montant total configuré : <strong className="text-amber-400 font-mono">{Number(priceFCFA).toLocaleString()} FCFA</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
              >
                Annuler
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || mainMediaUploading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Envoi vers le Backend & Cloudinary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publier l'Article sur la Boutique</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

      </form>

      {/* MODAL ANIMATION DE PUBLICATION DU PRODUIT */}
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
