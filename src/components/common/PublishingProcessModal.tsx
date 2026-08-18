import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  CloudLightning,
  QrCode,
  Store,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  Share2,
  Eye,
  ExternalLink
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatCurrency } from "../../config/constants";

export interface PublishingProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  productData: {
    title: string;
    category?: string;
    priceFCFA?: number | string;
    mainMediaUrl?: string;
    mediaType?: "image" | "video";
    sku?: string;
    type?: "product" | "course" | "service";
  };
  onViewProduct?: () => void;
}

const PUBLISH_STEPS = [
  {
    id: "media",
    label: "Sécurisation & Synchronisation Cloudinary CDN",
    desc: "Vérification des flux HD et optimisation automatique",
    icon: CloudLightning,
    color: "from-amber-500 to-yellow-400",
  },
  {
    id: "indexing",
    label: "Indexation au Catalogue SEN AURA TECH",
    desc: "Mise à jour des stocks et des filtres de recherche",
    icon: Layers,
    color: "from-amber-400 to-emerald-400",
  },
  {
    id: "sku",
    label: "Génération SKU & QR Code de Traçabilité",
    desc: "Création du certificat d'authenticité et de garantie",
    icon: QrCode,
    color: "from-emerald-400 to-cyan-400",
  },
  {
    id: "live",
    label: "Mise en Ligne & Déploiement Marketplace",
    desc: "Visibilité immédiate pour les acheteurs et clients",
    icon: Store,
    color: "from-emerald-500 to-emerald-300",
  },
];

export const PublishingProcessModal: React.FC<PublishingProcessModalProps> = ({
  isOpen,
  onClose,
  productData,
  onViewProduct,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIdx(0);
      setIsCompleted(false);
      return;
    }

    // Step progression animation sequence
    const t1 = setTimeout(() => setCurrentStepIdx(1), 700);
    const t2 = setTimeout(() => setCurrentStepIdx(2), 1400);
    const t3 = setTimeout(() => setCurrentStepIdx(3), 2100);
    const t4 = setTimeout(() => {
      setIsCompleted(true);
      // Trigger Golden and Vibrant Confetti Explosion!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#EAB308", "#F59E0B", "#10B981", "#38BDF8", "#F8FAFC"],
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#EAB308", "#10B981"],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#38BDF8", "#EAB308"],
          });
        }, 300);
      } catch (e) {
        console.warn("Confetti animation:", e);
      }
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const itemTypeLabel =
    productData.type === "course"
      ? "Formation Académie"
      : productData.type === "service"
      ? "Service Pro"
      : "Produit Vendeur";

  return (
    <AnimatePresence>
      <div
        id="publishing-process-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto"
      >
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6"
        >
          {/* Top Decorative Senegal Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />

          {/* Modal Header */}
          <div className="text-center space-y-2 pt-2">
            {!isCompleted ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>PUBLICATION EN COURS SUR SEN AURA TECH</span>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>PUBLICATION RÉUSSIE AVEC SUCCÈS !</span>
              </motion.div>
            )}

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isCompleted ? "Félicitations ! Votre produit est En Ligne" : "Déploiement de votre fiche"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto line-clamp-1">
              « {productData.title || "Nouveau Produit"} »
            </p>
          </div>

          {/* Product Mini Preview Showcase */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center relative">
              {productData.mainMediaUrl ? (
                productData.mediaType === "video" ? (
                  <video src={productData.mainMediaUrl} className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={productData.mainMediaUrl}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )
              ) : (
                <Package className="w-8 h-8 text-amber-400" />
              )}
              {isCompleted && (
                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {productData.category || itemTypeLabel}
              </span>
              <h4 className="text-sm font-bold text-white truncate mt-1">
                {productData.title || "Article Sans Titre"}
              </h4>
              <p className="text-xs font-mono font-bold text-emerald-400">
                {productData.priceFCFA ? formatCurrency(Number(productData.priceFCFA)) : "Sur Devis"}
              </p>
            </div>

            {isCompleted && (
              <div className="shrink-0 text-right hidden sm:block">
                <span className="text-[10px] font-mono text-slate-400 block">STATUT :</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                  DISPONIBLE
                </span>
              </div>
            )}
          </div>

          {/* Séquence des Étapes de Publication Animées */}
          <div className="space-y-3">
            {PUBLISH_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx && !isCompleted;
              const isPending = currentStepIdx < idx;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-3.5 ${
                    isPast || (isCompleted && idx <= 3)
                      ? "bg-slate-950/80 border-emerald-500/30 text-emerald-300"
                      : isCurrent
                      ? "bg-amber-500/10 border-amber-500/50 text-white shadow-lg shadow-amber-500/10 scale-[1.01]"
                      : "bg-slate-950/30 border-slate-800/60 text-slate-500 opacity-60"
                  }`}
                >
                  {/* Step Icon Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isPast || (isCompleted && idx <= 3)
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : isCurrent
                        ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-bold shadow-md shadow-amber-500/30 animate-pulse"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {isPast || (isCompleted && idx <= 3) ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Icon className="w-5 h-5 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  {/* Step Texts */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-bold truncate">
                        {step.label}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] font-mono text-amber-400 font-bold animate-pulse">
                          Traitement...
                        </span>
                      )}
                      {(isPast || (isCompleted && idx <= 3)) && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          ✓ Prêt
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons when Done */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2 flex flex-col sm:flex-row items-center gap-3"
            >
              {onViewProduct && (
                <button
                  type="button"
                  onClick={onViewProduct}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir dans la Boutique</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-colors"
              >
                Ajouter un autre article
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PublishingProcessModal;
