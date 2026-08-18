import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Truck,
  Sparkles,
  Zap,
  SlidersHorizontal,
  Eye,
  X,
  CreditCard,
  Phone,
  ArrowRight,
  Laptop,
  Video,
  Sun,
  Server,
  Key,
  Check,
  PhoneCall,
  Info
} from "lucide-react";

import { formatCurrency } from "../../config/constants";
import { store } from "../../database/store";
import { ProductDTO } from "../../shared/contracts/types";
import { eventBus, EVENTS } from "../../shared/events/event-bus";
import { CelebrationOverlay } from "../../shared/components/CelebrationOverlay";
import { VendorProductMediaModal } from "../vendor/VendorProductMediaModal";
import { generateExpressProductWhatsAppMsg, redirectToWhatsAppPayment } from "../../shared/utils/whatsappHelper";
import { MessageCircle } from "lucide-react";
import { useSWRInstant } from "../../lib/swr-cache";
import { OptimizedImage } from "../../shared/components/OptimizedImage";

interface BoutiqueViewProps {
  onOpenCart: () => void;
  currency: "FCFA" | "EUR";
}

export const BoutiqueView: React.FC<BoutiqueViewProps> = ({ onOpenCart, currency }) => {
  const [selectedCat, setSelectedCat] = useState<string>("Toutes");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "stock">("featured");
  const [addedToast, setAddedToast] = useState<{ name: string; id: string } | null>(null);

  // SWR Instant Cache for Products (< 1ms RAM access, zero layout shift, silent background sync)
  const { data: products, mutate } = useSWRInstant<ProductDTO[]>(
    "boutique_catalog_products",
    async () => {
      try {
        const res = await fetch("/api/db/products");
        const json = await res.json();
        if (json?.products) {
          return json.products;
        }
      } catch {}
      return [];
    },
    [],
    { dedupingInterval: 3000 }
  );

  // Listen to product addition events from vendor form or admin
  useEffect(() => {
    const handleProductAdded = (e: any) => {
      if (e?.detail) {
        mutate((curr) => [e.detail, ...curr.filter((p) => p.id !== e.detail.id)], true);
      } else {
        fetch("/api/db/products")
          .then((r) => r.json())
          .then((j) => {
            if (j?.products) mutate(j.products, false);
          })
          .catch(() => {});
      }
    };

    window.addEventListener("sat_product_published", handleProductAdded);
    window.addEventListener("sat_products_updated", handleProductAdded);
    return () => {
      window.removeEventListener("sat_product_published", handleProductAdded);
      window.removeEventListener("sat_products_updated", handleProductAdded);
    };
  }, [mutate]);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<ProductDTO | null>(null);

  // Express Direct Order Modal
  const [expressOrderProduct, setExpressOrderProduct] = useState<ProductDTO | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("Dakar");
  const [paymentMethod, setPaymentMethod] = useState<"WAVE" | "ORANGE_MONEY" | "CASH_DELIVERY">("WAVE");
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const categories = [
    { name: "Toutes", icon: Sparkles, count: products.length },
    { name: "Ordinateurs", icon: Laptop, count: products.filter((p) => p.category === "Ordinateurs").length },
    { name: "Vidéosurveillance & Alarme", icon: Video, count: products.filter((p) => p.category === "Vidéosurveillance & Alarme").length },
    { name: "Solaire & Énergie", icon: Sun, count: products.filter((p) => p.category === "Solaire & Énergie").length },
    { name: "Serveurs & Réseaux", icon: Server, count: products.filter((p) => p.category === "Serveurs & Réseaux").length },
    { name: "Logiciels & Licences", icon: Key, count: products.filter((p) => p.category === "Logiciels & Licences").length },
  ];

  // Filtering & Sorting
  const filteredProducts = (products || []).filter((p) => {
    if (!p) return false;
    const matchCat = selectedCat === "Toutes" || p.category === selectedCat;
    const q = (searchQuery || "").toLowerCase();
    if (!q) return matchCat;
    const matchQuery =
      (p.name || "").toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q);
    return matchCat && matchQuery;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.priceFCFA - b.priceFCFA;
    if (sortBy === "price-desc") return b.priceFCFA - a.priceFCFA;
    if (sortBy === "stock") return b.stock - a.stock;
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const handleAddToCart = (product: ProductDTO, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    store.addToCart(product, 1);
    setAddedToast({ name: product.name, id: product.id });
    setTimeout(() => setAddedToast(null), 3500);
  };

  const handleExpressOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expressOrderProduct || !customerPhone || !customerName) return;

    setIsSubmittingOrder(true);
    const refCode = `CMD-SAT-${Math.floor(100000 + Math.random() * 900000)}`;

    const waMsg = generateExpressProductWhatsAppMsg({
      productName: expressOrderProduct.name,
      productPrice: expressOrderProduct.priceFCFA,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryCity,
      orderRef: refCode,
    });

    setTimeout(() => {
      setIsSubmittingOrder(false);
      setOrderSuccessMsg(refCode);
      redirectToWhatsAppPayment(waMsg);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* --- SIMPLIFIED CLEAN HEADER --- */}
      <div className="pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
            <ShoppingBag className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Boutique Tech Officielle
            </h1>
            <p className="text-xs text-slate-400">
              Matériels Informatiques, Kits Solaires, Starlink & Vidéosurveillance
            </p>
          </div>
        </div>
      </div>

      {/* --- TOAST NOTIFICATION --- */}
      {addedToast && (
        <div className="sticky top-20 z-30 p-4 rounded-2xl bg-slate-900 border border-amber-500/60 shadow-2xl text-amber-300 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500 text-slate-950 font-black">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Produit ajouté au panier !</p>
              <p className="text-slate-400 text-xs font-normal">"{addedToast.name}"</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCart}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 shadow-md"
            >
              <span>Commander maintenant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* --- CATEGORIES & SEARCH FILTER BAR --- */}
      <div className="space-y-4">
        
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCat === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCat(cat.name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? "bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 scale-105"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-slate-950" : "text-amber-400"}`} />
                <span>{cat.name}</span>
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-md text-[10px] ${
                    isSelected ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input & Sort Dropdown */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Box */}
          <div className="md:col-span-8 relative flex items-center bg-slate-950 border border-slate-800 focus-within:border-amber-500/60 rounded-xl px-3.5 py-2 transition-all">
            <Search className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par produit, marque (Dell, Apple, Dahua, Cisco...)"
              className="w-full text-xs bg-transparent text-white placeholder-slate-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 text-slate-500 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-4 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-amber-500/60"
            >
              <option value="featured">Tri : Recommandations SEN AURA</option>
              <option value="price-asc">Prix : Croissant</option>
              <option value="price-desc">Prix : Décroissant</option>
              <option value="stock">Stock disponible</option>
            </select>
          </div>

        </div>
      </div>

      {/* --- PRODUCTS GRID --- */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Aucun matériel ne correspond à votre recherche</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Essayez de modifier vos termes de recherche ou sélectionnez une autre catégorie d'équipement.
          </p>
          <button
            onClick={() => {
              setSelectedCat("Toutes");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-amber-400 text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
          {filteredProducts.map((prod, index) => {
            const isLastOdd =
              filteredProducts.length % 2 !== 0 &&
              index === filteredProducts.length - 1;
            return (
              <div
                key={prod.id}
                onClick={() => setQuickViewProduct(prod)}
                className={`cv-auto group cursor-pointer rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 flex justify-between overflow-hidden shadow-sm ${
                  isLastOdd
                    ? "col-span-2 w-full flex-col sm:col-span-1"
                    : "flex-col"
                }`}
              >
                {isLastOdd ? (
                  <>
                    {/* Mobile Horizontal Layout for odd card (spans 2 columns, height reduced by ~40%) */}
                    <div className="flex sm:hidden items-center gap-3 p-3 w-full">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                        <OptimizedImage
                          src={prod.mainMediaUrl || prod.image}
                          alt={prod.name}
                          aspectRatio="1/1"
                          priority={index < 3}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-[8px] font-bold text-emerald-400 border border-slate-700">
                          Qté: {prod.stock}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 flex flex-col justify-between h-20 py-0.5">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-500 uppercase">{prod.brand}</span>
                            <span className="text-[8px] font-bold text-amber-400">{prod.category}</span>
                          </div>
                          <h3 className="text-xs font-bold text-white line-clamp-1 leading-snug mt-0.5">
                            {prod.name}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800/80">
                          <p className="text-xs font-black text-amber-400 font-mono">
                            {formatCurrency(prod.priceFCFA, currency)}
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpressOrderProduct(prod);
                                setOrderSuccessMsg(null);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 text-amber-300 text-xs border border-slate-700"
                              title="Commande Express"
                            >
                              <Zap className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleAddToCart(prod, e)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] uppercase shadow-md active:scale-95"
                            >
                              Ajouter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop normal view */}
                    <div className="hidden sm:flex flex-col justify-between h-full w-full">
                      {/* Product Top Image & Badges */}
                      <div className="space-y-3 p-4">
                        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
                          <OptimizedImage
                            src={prod.mainMediaUrl || prod.image}
                            alt={prod.name}
                            aspectRatio="16/9"
                            priority={index < 3}
                            className="group-hover:scale-108 transition-transform duration-500"
                          />
                          
                          {/* Category Pill */}
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] font-bold text-amber-400 backdrop-blur-md truncate max-w-[70%]">
                            {prod.category}
                          </span>

                          {/* Stock Tag */}
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
                            Stock: {prod.stock}
                          </span>

                          {/* Media Format Badge (Video or Gallery) */}
                          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1">
                            {(prod.mediaType === "video" || prod.videoUrl) && (
                              <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow-md flex items-center gap-0.5">
                                <Video className="w-2.5 h-2.5" /> HD
                              </span>
                            )}
                            {prod.galleryImages && prod.galleryImages.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-emerald-400 text-[9px] font-bold shadow-md">
                                +{prod.galleryImages.length}
                              </span>
                            )}
                            {prod.featured && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-md inline-block">
                                Top Vente
                              </span>
                            )}
                          </div>

                          {/* Hover Quick View Trigger Overlay */}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-3.5 py-2 rounded-xl bg-slate-900/95 border border-amber-400/80 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-xl">
                              <Eye className="w-4 h-4" /> Aperçu rapide
                            </span>
                          </div>
                        </div>

                        {/* Brand & Title */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{prod.brand}</span>
                            <span className="text-[10px] font-semibold text-emerald-400">✓ 1 An</span>
                          </div>
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 mt-0.5 leading-snug">
                            {prod.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{prod.description}</p>
                        </div>

                        {/* Tech Specs Chips */}
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                          {Object.entries(prod.specs).slice(0, 3).map(([key, val]) => (
                            <div key={key} className="flex justify-between text-[10px]">
                              <span className="text-slate-500 font-medium">{key} :</span>
                              <span className="text-slate-300 font-semibold truncate max-w-[170px]">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Price & Action Footer */}
                      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Prix TTC</span>
                          <p className="text-base font-black text-amber-400 font-mono">
                            {formatCurrency(prod.priceFCFA, currency)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpressOrderProduct(prod);
                              setOrderSuccessMsg(null);
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition-colors shrink-0"
                            title="Commande Express Wave/OM"
                          >
                            <Zap className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => handleAddToCart(prod, e)}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 text-center"
                          >
                            <span>Ajouter</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Product Top Image & Badges */}
                    <div className="space-y-2.5 sm:space-y-3 p-3 sm:p-4">
                      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
                        <OptimizedImage
                          src={prod.mainMediaUrl || prod.image}
                          alt={prod.name}
                          aspectRatio="16/9"
                          priority={index < 3}
                          className="group-hover:scale-108 transition-transform duration-500"
                        />
                        
                        {/* Category Pill */}
                        <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-900/90 border border-slate-700 text-[9px] sm:text-[10px] font-bold text-amber-400 backdrop-blur-md truncate max-w-[70%]">
                          {prod.category}
                        </span>

                        {/* Stock Tag */}
                        <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] sm:text-[10px] font-bold text-emerald-300 backdrop-blur-md">
                          Stock: {prod.stock}
                        </span>

                        {/* Media Format Badge (Video or Gallery) */}
                        <div className="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5 flex items-center gap-1">
                          {(prod.mediaType === "video" || prod.videoUrl) && (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-md flex items-center gap-0.5">
                              <Video className="w-2.5 h-2.5" /> HD
                            </span>
                          )}
                          {prod.galleryImages && prod.galleryImages.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-emerald-400 text-[8px] sm:text-[9px] font-bold shadow-md">
                              +{prod.galleryImages.length}
                            </span>
                          )}
                          {prod.featured && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-md hidden sm:inline-block">
                              Top Vente
                            </span>
                          )}
                        </div>

                        {/* Hover Quick View Trigger Overlay */}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                          <span className="px-3.5 py-2 rounded-xl bg-slate-900/95 border border-amber-400/80 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-xl">
                            <Eye className="w-4 h-4" /> Aperçu rapide
                          </span>
                        </div>
                      </div>

                      {/* Brand & Title */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider">{prod.brand}</span>
                          <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-400">✓ 1 An</span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 mt-0.5 leading-snug">
                          {prod.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed hidden sm:block">{prod.description}</p>
                      </div>

                      {/* Tech Specs Chips */}
                      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 hidden sm:block">
                        {Object.entries(prod.specs).slice(0, 3).map(([key, val]) => (
                          <div key={key} className="flex justify-between text-[10px]">
                            <span className="text-slate-500 font-medium">{key} :</span>
                            <span className="text-slate-300 font-semibold truncate max-w-[170px]">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Price & Action Footer */}
                    <div className="p-2.5 sm:p-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
                      <div>
                        <span className="text-[9px] sm:text-[10px] text-slate-500 block">Prix TTC</span>
                        <p className="text-xs sm:text-base font-black text-amber-400 font-mono">
                          {formatCurrency(prod.priceFCFA, currency)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpressOrderProduct(prod);
                            setOrderSuccessMsg(null);
                          }}
                          className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition-colors shrink-0"
                          title="Commande Express Wave/OM"
                        >
                          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          className="flex-1 sm:flex-none px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 text-center"
                        >
                          <span>Ajouter</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- TRUST & SERVICE PILLARS --- */}
      <div className="pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Livraison Rapide 24/48h</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Dakar, Thiès, St-Louis et toutes régions du Sénégal.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Matériel 100% Original</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Produits sous garantie constructeur certifiée.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Paiement Mobile Sénégal</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Wave, Orange Money, Free Money & virement.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Support & Devis Pro</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Facture proforma NINEA pour entreprises.</p>
          </div>
        </div>

      </div>

      {/* --- MODAL 1: PRODUCT QUICK VIEW & CLOUDINARY MEDIA EXPLORER --- */}
      {quickViewProduct && (
        <VendorProductMediaModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          currency={currency}
          onAddToCart={(p) => {
            handleAddToCart(p);
            setQuickViewProduct(null);
          }}
        />
      )}

      {/* --- MODAL 2: EXPRESS DIRECT ORDER (WAVE / ORANGE MONEY) --- */}
      {orderSuccessMsg && expressOrderProduct && (
        <CelebrationOverlay
          orderId={orderSuccessMsg}
          totalFCFA={expressOrderProduct.priceFCFA}
          customerName={customerName || "Client Honoré"}
          customerPhone={customerPhone}
          paymentMethod={paymentMethod}
          deliveryCity={deliveryCity}
          currency={currency}
          onClose={() => {
            setExpressOrderProduct(null);
            setOrderSuccessMsg(null);
          }}
        />
      )}

      {expressOrderProduct && !orderSuccessMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
            
            <button
              onClick={() => {
                setExpressOrderProduct(null);
                setOrderSuccessMsg(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleExpressOrderSubmit} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Commande Express 1-Clic Sénégal</h3>
                    <p className="text-[11px] text-slate-400">Sans création de compte requise</p>
                  </div>
                </div>

                {/* Selected Product Summary */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <img src={expressOrderProduct.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{expressOrderProduct.name}</h4>
                    <p className="text-xs font-mono font-bold text-amber-400">
                      {formatCurrency(expressOrderProduct.priceFCFA, currency)}
                    </p>
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Nom complet :</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mamadou Ndiaye"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Téléphone Sénégal (Wave / Orange Money) :</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 77 123 45 67"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Ville de livraison :</label>
                    <select
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-amber-500"
                    >
                      <option value="Dakar">Dakar (Livraison 24h - 2000 FCFA)</option>
                      <option value="Thiès">Thiès (Livraison 24h - 3000 FCFA)</option>
                      <option value="Saint-Louis">Saint-Louis (Livraison 48h - 4000 FCFA)</option>
                      <option value="Autre région">Autre Région du Sénégal (5000 FCFA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Paiement Mobile Exclusif :</label>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                      <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="flex-1">
                        <p className="font-bold text-white text-[11px]">Redirection Directe WhatsApp</p>
                        <p className="text-[10px] text-emerald-300/80">Règlement mobile sécurisé par Wave ou Orange Money sur WhatsApp.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-98"
                >
                  {isSubmittingOrder ? (
                    <span>Redirection vers WhatsApp...</span>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 text-slate-950" />
                      <span>Commander & Payer sur WhatsApp</span>
                    </>
                  )}
                </button>
              </form>
          </div>
        </div>
      )}

    </div>
  );
};
