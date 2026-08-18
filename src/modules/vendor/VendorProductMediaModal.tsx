import React, { useState } from "react";
import {
  X,
  Play,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  Package,
  ShieldCheck,
  Truck,
  ShoppingCart,
  PhoneCall,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ProductDTO } from "../../shared/contracts/types";
import { formatCurrency } from "../../config/constants";
import { store } from "../../database/store";

interface VendorProductMediaModalProps {
  product: ProductDTO | null;
  onClose: () => void;
  currency?: "FCFA" | "EUR";
  onAddToCart?: (product: ProductDTO) => void;
}

export const VendorProductMediaModal: React.FC<VendorProductMediaModalProps> = ({
  product,
  onClose,
  currency = "FCFA",
  onAddToCart,
}) => {
  if (!product) return null;

  // Build full list of media items: [mainMedia, ...(galleryImages || [])]
  const mainMedia = {
    url: product.mainMediaUrl || product.image || "https://res.cloudinary.com/senauratech/image/upload/v1720000000/sen_aura_tech/onduleur_solaire_hybride_5.5kw.png",
    type: product.mediaType === "video" || (product.mainMediaUrl && (product.mainMediaUrl.includes(".mp4") || product.mainMediaUrl.includes("video/"))) ? "video" : "image",
    label: product.mediaType === "video" ? "Vidéo de Présentation" : "Photo Principale",
  };

  const galleryItems = (product.galleryImages || []).map((url, idx) => ({
    url,
    type: "image" as const,
    label: `Vue Optionnelle ${idx + 1}`,
  }));

  const allMedia = [mainMedia, ...galleryItems];
  const [activeMediaIdx, setActiveMediaIdx] = useState<number>(0);
  const activeMedia = allMedia[activeMediaIdx] || mainMedia;

  const handleNext = () => {
    setActiveMediaIdx((prev) => (prev + 1) % allMedia.length);
  };

  const handlePrev = () => {
    setActiveMediaIdx((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative text-slate-200">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
              {product.category}
            </span>
            <span className="text-xs text-slate-400 font-bold">• {product.brand || "SEN AURA PARTENAIRE"}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Media Stage (Main Photo/Video + 3 Gallery Thumbnails) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Primary Media Viewer */}
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 h-72 sm:h-96 flex items-center justify-center overflow-hidden group shadow-inner">
              {activeMedia.type === "video" ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  src={activeMedia.url}
                  alt={product.name}
                  className="w-full h-full object-contain p-2"
                />
              )}

              {/* Tag Badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-[11px] font-bold text-amber-400 flex items-center gap-1.5 shadow-md">
                {activeMedia.type === "video" ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                <span>{activeMedia.label}</span>
              </div>

              {/* Navigation Arrows if more than 1 media */}
              {allMedia.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-white transition-all opacity-80 hover:opacity-100 shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-white transition-all opacity-80 hover:opacity-100 shadow-md"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail switcher (Main + 3 Optional Photos) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
                <span>Galerie Cloudinary ({allMedia.length} Média{allMedia.length > 1 ? "s" : ""})</span>
                <span className="text-amber-400 font-mono">1 Principal + {product.galleryImages?.length || 0} Optionnelle(s)</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {allMedia.map((med, idx) => {
                  const isSelected = idx === activeMediaIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIdx(idx)}
                      className={`h-20 rounded-xl overflow-hidden border-2 transition-all relative group bg-slate-950 ${
                        isSelected
                          ? "border-amber-500 ring-2 ring-amber-500/20 scale-[1.02]"
                          : "border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {med.type === "video" ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-amber-400">
                          <Play className="w-5 h-5 fill-amber-400/20" />
                          <span className="text-[9px] font-bold font-mono mt-0.5">VIDÉO</span>
                        </div>
                      ) : (
                        <img
                          src={med.url}
                          alt={`Miniature ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-slate-950/80 text-[8px] font-mono text-slate-300 font-bold">
                        #{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Product Specs, Pricing, & Action */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {product.name}
                </h3>
                <p className="text-2xl font-black text-amber-400 font-mono mt-2">
                  {formatCurrency(product.priceFCFA || product.price, currency === "EUR" ? "EUR" : "FCFA")}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    En Stock ({product.stock} disponibles)
                  </span>
                  <span className="text-xs text-slate-500">• Réf: {product.id}</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                {product.description}
              </div>

              {/* Specs */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fiche Technique</h4>
                  <div className="space-y-1.5">
                    {Object.entries(product.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                        <span className="text-slate-400 font-medium">{k}</span>
                        <span className="text-white font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Garantie 1 An</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Livraison 24h</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  if (onAddToCart) {
                    onAddToCart(product);
                  } else {
                    store.addToCart(product, 1);
                  }
                  onClose();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Ajouter au Panier ({formatCurrency(product.priceFCFA || product.price, currency === "EUR" ? "EUR" : "FCFA")})</span>
              </button>

              <a
                href={`https://wa.me/221705334611?text=${encodeURIComponent(`Bonjour SEN AURA TECH, je souhaite commander l'article "${product.name}" au prix de ${product.priceFCFA || product.price} FCFA.`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Commander direct par WhatsApp / Wave</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
