import React, { useState } from "react";
import {
  Users,
  ShoppingBag,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Star,
  ShieldCheck,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  Sliders,
  Eye,
  EyeOff,
  Flame
} from "lucide-react";
import {
  SystemConfig,
  ShowcaseProItem,
  ShowcaseProductItem,
  ShowcaseCourseItem
} from "../../../config/system-config";
import { WeeklySolutionsSettingsSection } from "./WeeklySolutionsSettingsSection";

interface ShowcaseSettingsSectionProps {
  config: SystemConfig;
  onChange: (updated: SystemConfig) => void;
}

export const ShowcaseSettingsSection: React.FC<ShowcaseSettingsSectionProps> = ({
  config,
  onChange,
}) => {
  const [subTab, setSubTab] = useState<"pros" | "boutique" | "academy" | "programs" | "hero">("programs");

  // Pro Modal / Form State
  const [editingProIndex, setEditingProIndex] = useState<number | null>(null);
  const [proForm, setProForm] = useState<ShowcaseProItem>({
    id: `pro-${Date.now()}`,
    fullName: "",
    category: "Développement Software",
    region: "Dakar",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    rating: 5.0,
    reviewsCount: 20,
    verified: true,
    bio: "",
    phone: "+221 77 000 00 00",
    hourlyRateFCFA: 15000,
  });
  const [proModalOpen, setProModalOpen] = useState(false);

  // Product Modal / Form State
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [productForm, setProductForm] = useState<ShowcaseProductItem>({
    id: `prod-${Date.now()}`,
    name: "",
    brand: "SEN AURA Tech",
    category: "Ordinateurs",
    priceFCFA: 250000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
    description: "",
  });
  const [productModalOpen, setProductModalOpen] = useState(false);

  // Course Modal / Form State
  const [editingCourseIndex, setEditingCourseIndex] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState<ShowcaseCourseItem>({
    id: `course-${Date.now()}`,
    title: "",
    category: "Développement Web",
    priceFCFA: 120000,
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    durationHours: 30,
    rating: 5.0,
  });
  const [courseModalOpen, setCourseModalOpen] = useState(false);

  // Helper update
  const updateShowcase = (updater: (prev: typeof config.homeShowcase) => typeof config.homeShowcase) => {
    onChange({
      ...config,
      homeShowcase: updater(config.homeShowcase),
    });
  };

  // --- PRO HANDLERS ---
  const handleOpenAddPro = () => {
    setEditingProIndex(null);
    setProForm({
      id: `pro-${Date.now()}`,
      fullName: "",
      category: "Développement Software",
      region: "Dakar",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      rating: 5.0,
      reviewsCount: 15,
      verified: true,
      bio: "Expert qualifié et certifié par SEN AURA TECH.",
      phone: "+221 77 123 45 67",
      hourlyRateFCFA: 20000,
    });
    setProModalOpen(true);
  };

  const handleOpenEditPro = (index: number) => {
    setEditingProIndex(index);
    setProForm({ ...config.homeShowcase.marketplacePros.items[index] });
    setProModalOpen(true);
  };

  const handleSavePro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proForm.fullName.trim()) return;

    updateShowcase((prev) => {
      const items = [...prev.marketplacePros.items];
      if (editingProIndex !== null) {
        items[editingProIndex] = proForm;
      } else {
        items.push(proForm);
      }
      return {
        ...prev,
        marketplacePros: {
          ...prev.marketplacePros,
          items,
        },
      };
    });
    setProModalOpen(false);
  };

  const handleDeletePro = (index: number) => {
    if (confirm("Supprimer ce professionnel de la vitrine d'accueil ?")) {
      updateShowcase((prev) => {
        const items = prev.marketplacePros.items.filter((_, i) => i !== index);
        return {
          ...prev,
          marketplacePros: {
            ...prev.marketplacePros,
            items,
          },
        };
      });
    }
  };

  // --- PRODUCT HANDLERS ---
  const handleOpenAddProduct = () => {
    setEditingProductIndex(null);
    setProductForm({
      id: `prod-${Date.now()}`,
      name: "",
      brand: "SEN AURA",
      category: "Équipements Tech",
      priceFCFA: 150000,
      stock: 10,
      image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80",
      description: "Équipement certifié avec garantie 1 an constructeur.",
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (index: number) => {
    setEditingProductIndex(index);
    setProductForm({ ...config.homeShowcase.boutique.items[index] });
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    updateShowcase((prev) => {
      const items = [...prev.boutique.items];
      if (editingProductIndex !== null) {
        items[editingProductIndex] = productForm;
      } else {
        items.push(productForm);
      }
      return {
        ...prev,
        boutique: {
          ...prev.boutique,
          items,
        },
      };
    });
    setProductModalOpen(false);
  };

  const handleDeleteProduct = (index: number) => {
    if (confirm("Supprimer ce produit de la vitrine d'accueil ?")) {
      updateShowcase((prev) => {
        const items = prev.boutique.items.filter((_, i) => i !== index);
        return {
          ...prev,
          boutique: {
            ...prev.boutique,
            items,
          },
        };
      });
    }
  };

  // --- COURSE HANDLERS ---
  const handleOpenAddCourse = () => {
    setEditingCourseIndex(null);
    setCourseForm({
      id: `course-${Date.now()}`,
      title: "",
      category: "Tech & IA",
      priceFCFA: 100000,
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
      durationHours: 25,
      rating: 5.0,
    });
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (index: number) => {
    setEditingCourseIndex(index);
    setCourseForm({ ...config.homeShowcase.academy.items[index] });
    setCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;

    updateShowcase((prev) => {
      const items = [...prev.academy.items];
      if (editingCourseIndex !== null) {
        items[editingCourseIndex] = courseForm;
      } else {
        items.push(courseForm);
      }
      return {
        ...prev,
        academy: {
          ...prev.academy,
          items,
        },
      };
    });
    setCourseModalOpen(false);
  };

  const handleDeleteCourse = (index: number) => {
    if (confirm("Supprimer cette formation de la vitrine d'accueil ?")) {
      updateShowcase((prev) => {
        const items = prev.academy.items.filter((_, i) => i !== index);
        return {
          ...prev,
          academy: {
            ...prev.academy,
            items,
          },
        };
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* SUB TABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setSubTab("programs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "programs"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30" />
          <span>Programme 1 Semaine 1 Solution ({config.homeShowcase.weeklySolutions?.items?.length || 0})</span>
        </button>

        <button
          onClick={() => setSubTab("pros")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "pros"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Marketplace Pros ({config.homeShowcase.marketplacePros.items.length})</span>
        </button>

        <button
          onClick={() => setSubTab("boutique")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "boutique"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Sélection Boutique ({config.homeShowcase.boutique.items.length})</span>
        </button>

        <button
          onClick={() => setSubTab("academy")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "academy"
              ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Academy Formations ({config.homeShowcase.academy.items.length})</span>
        </button>

        <button
          onClick={() => setSubTab("hero")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "hero"
              ? "bg-slate-700 text-amber-300 shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>Chiffres Clés & Hero</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 0. PROGRAMMES 1 SEMAINE = 1 APPLICATION = 1 SOLUTION */}
      {/* ========================================================================= */}
      {subTab === "programs" && (
        <WeeklySolutionsSettingsSection config={config} onChange={onChange} />
      )}

      {/* ========================================================================= */}
      {/* 1. MARKETPLACE PROS TAB */}
      {/* ========================================================================= */}
      {subTab === "pros" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* HEADERS CONFIG CARD */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  En-tête de la Section Marketplace Pros
                </h3>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.homeShowcase.marketplacePros.enabled}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      marketplacePros: {
                        ...prev.marketplacePros,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span>Afficher la section sur l'Accueil</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Sur-titre (Eyebrow)</label>
                <input
                  type="text"
                  value={config.homeShowcase.marketplacePros.eyebrow}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      marketplacePros: {
                        ...prev.marketplacePros,
                        eyebrow: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 font-bold focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Grand Titre Principal</label>
                <input
                  type="text"
                  value={config.homeShowcase.marketplacePros.title}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      marketplacePros: {
                        ...prev.marketplacePros,
                        title: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Libellé Bouton Tout Voir</label>
                <input
                  type="text"
                  value={config.homeShowcase.marketplacePros.viewAllText}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      marketplacePros: {
                        ...prev.marketplacePros,
                        viewAllText: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* PROS LIST & MANAGEMENT */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Professionnels Mis en Avant sur l'Accueil</h3>
                <p className="text-xs text-slate-400">
                  Ces professionnels apparaissent directement sur la vitrine d'accueil avec leur note et spécialité.
                </p>
              </div>
              <button
                onClick={handleOpenAddPro}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Pro</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.homeShowcase.marketplacePros.items.map((pro, index) => (
                <div
                  key={pro.id || index}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={pro.avatar}
                        alt={pro.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-amber-500/40 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-bold text-white">{pro.fullName}</h4>
                          {pro.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-amber-400 font-semibold">{pro.category}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-600" /> {pro.region}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditPro(index)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
                        title="Modifier ce pro"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePro(index)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Supprimer de la vitrine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                    "{pro.bio}"
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-900">
                    <div className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{pro.rating}</span>
                      <span className="text-slate-500 text-[10px]">({pro.reviewsCount} avis)</span>
                    </div>
                    {pro.hourlyRateFCFA && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        ~{pro.hourlyRateFCFA.toLocaleString("fr-FR")} F/h
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BOUTIQUE PRODUCTS TAB */}
      {/* ========================================================================= */}
      {subTab === "boutique" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* HEADERS CONFIG CARD */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  En-tête de la Sélection Boutique
                </h3>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.homeShowcase.boutique.enabled}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      boutique: {
                        ...prev.boutique,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Afficher la section sur l'Accueil</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Sur-titre (Eyebrow)</label>
                <input
                  type="text"
                  value={config.homeShowcase.boutique.eyebrow}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      boutique: {
                        ...prev.boutique,
                        eyebrow: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-bold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Grand Titre Principal</label>
                <input
                  type="text"
                  value={config.homeShowcase.boutique.title}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      boutique: {
                        ...prev.boutique,
                        title: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Libellé Bouton Catalogue</label>
                <input
                  type="text"
                  value={config.homeShowcase.boutique.viewAllText}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      boutique: {
                        ...prev.boutique,
                        viewAllText: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* PRODUCTS LIST & MANAGEMENT */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Produits Vedettes en Vitrine d'Accueil</h3>
                <p className="text-xs text-slate-400">
                  Configurez les produits phares mis en avant auprès des visiteurs.
                </p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Produit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.homeShowcase.boutique.items.map((prod, index) => (
                <div
                  key={prod.id || index}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3 relative group"
                >
                  <div className="relative h-32 rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/90 text-[10px] font-bold text-emerald-400 border border-slate-700">
                      Stock: {prod.stock}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{prod.brand}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditProduct(index)}
                          className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(index)}
                          className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-2 mt-0.5">{prod.name}</h4>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      {prod.priceFCFA.toLocaleString("fr-FR")} FCFA
                    </span>
                    <span className="text-[10px] text-slate-400">{prod.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACADEMY FORMATIONS TAB */}
      {/* ========================================================================= */}
      {subTab === "academy" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* HEADERS CONFIG CARD */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  En-tête de la Section Academy
                </h3>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.homeShowcase.academy.enabled}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      academy: {
                        ...prev.academy,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Afficher la section sur l'Accueil</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Sur-titre (Eyebrow)</label>
                <input
                  type="text"
                  value={config.homeShowcase.academy.eyebrow}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      academy: {
                        ...prev.academy,
                        eyebrow: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-400 font-bold focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Grand Titre Principal</label>
                <input
                  type="text"
                  value={config.homeShowcase.academy.title}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      academy: {
                        ...prev.academy,
                        title: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-400">Sous-titre explicatif</label>
                <input
                  type="text"
                  value={config.homeShowcase.academy.subtitle}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      academy: {
                        ...prev.academy,
                        subtitle: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* COURSES LIST & MANAGEMENT */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Formations Phares en Vitrine</h3>
                <p className="text-xs text-slate-400">
                  Sélectionnez les cursus affichés sur la page d'accueil de la plateforme.
                </p>
              </div>
              <button
                onClick={handleOpenAddCourse}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une Formation</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.homeShowcase.academy.items.map((course, index) => (
                <div
                  key={course.id || index}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3 relative group"
                >
                  <div className="relative h-28 rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-indigo-950/90 text-[10px] font-bold text-indigo-300 border border-indigo-700/50">
                      {course.category}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">{course.durationHours || 30}h de formation</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditCourse(index)}
                          className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-400"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(index)}
                          className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-2 mt-0.5">{course.title}</h4>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {course.priceFCFA.toLocaleString("fr-FR")} FCFA
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Certifié SAT</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. HERO & STATS TAB */}
      {/* ========================================================================= */}
      {subTab === "hero" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Compteurs & Chiffres Clés de la Bannière Hero
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-[11px] font-semibold text-slate-400">Compteur 1 (Projets)</label>
                <input
                  type="text"
                  value={config.homeShowcase.hero.stats.projectsValue}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        stats: { ...prev.hero.stats, projectsValue: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-black text-sm"
                />
                <input
                  type="text"
                  value={config.homeShowcase.hero.stats.projectsLabel}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        stats: { ...prev.hero.stats, projectsLabel: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-[11px] font-semibold text-slate-400">Compteur 2 (Pros Vérifiés)</label>
                <input
                  type="text"
                  value={config.homeShowcase.hero.stats.prosValue}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        stats: { ...prev.hero.stats, prosValue: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-black text-sm"
                />
                <input
                  type="text"
                  value={config.homeShowcase.hero.stats.prosLabel}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        stats: { ...prev.hero.stats, prosLabel: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-[11px] font-semibold text-slate-400">Compteur 3 (Apprenants)</label>
                <input
                  type="text"
                  value={config.homeShowcase.hero.stats.studentsValue}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        stats: { ...prev.hero.stats, studentsValue: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-indigo-400 font-black text-sm"
                />
                <input
                  type="text"
                  value={config.homeShowcase.hero.stats.studentsLabel}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        stats: { ...prev.hero.stats, studentsLabel: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-[11px] font-semibold text-slate-400">Compteur 4 (Satisfaction)</label>
                <input
                  type="text"
                  value={config.homeShowcase.hero.stats.satisfactionValue}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        stats: { ...prev.hero.stats, satisfactionValue: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-black text-sm"
                />
                <input
                  type="text"
                  value={config.homeShowcase.hero.stats.satisfactionLabel}
                  onChange={(e) =>
                    updateShowcase((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        stats: { ...prev.hero.stats, satisfactionLabel: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRO EDIT MODAL */}
      {/* ========================================================================= */}
      {proModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>{editingProIndex !== null ? "Modifier le Professionnel" : "Ajouter un Pro à la Vitrine"}</span>
              </h3>
              <button
                onClick={() => setProModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePro} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Nom & Prénom</label>
                  <input
                    type="text"
                    required
                    value={proForm.fullName}
                    onChange={(e) => setProForm({ ...proForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                    placeholder="Ex: Moussa Diop"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Catégorie / Spécialité</label>
                  <input
                    type="text"
                    required
                    value={proForm.category}
                    onChange={(e) => setProForm({ ...proForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-semibold"
                    placeholder="Ex: Réseau & Fibre"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Région / Ville</label>
                  <input
                    type="text"
                    value={proForm.region}
                    onChange={(e) => setProForm({ ...proForm, region: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    placeholder="Dakar, Thiès, etc."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Téléphone / WhatsApp</label>
                  <input
                    type="text"
                    value={proForm.phone || ""}
                    onChange={(e) => setProForm({ ...proForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    placeholder="+221 77 000 00 00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Note Étoiles (/5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={proForm.rating}
                    onChange={(e) => setProForm({ ...proForm, rating: parseFloat(e.target.value) || 5 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Nombre d'avis</label>
                  <input
                    type="number"
                    value={proForm.reviewsCount}
                    onChange={(e) => setProForm({ ...proForm, reviewsCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Tarif Estimé (FCFA/h)</label>
                  <input
                    type="number"
                    value={proForm.hourlyRateFCFA || 15000}
                    onChange={(e) => setProForm({ ...proForm, hourlyRateFCFA: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">URL Photo / Avatar (Unsplash ou direct)</label>
                <input
                  type="text"
                  value={proForm.avatar}
                  onChange={(e) => setProForm({ ...proForm, avatar: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Biographie / Description de compétences</label>
                <textarea
                  rows={2}
                  value={proForm.bio}
                  onChange={(e) => setProForm({ ...proForm, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  placeholder="Spécialiste certifié avec 8 ans d'expérience..."
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={proForm.verified}
                  onChange={(e) => setProForm({ ...proForm, verified: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Badge Professionnel Vérifié & Certifié SEN AURA TECH
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setProModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md"
                >
                  Enregistrer dans la vitrine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRODUCT EDIT MODAL */}
      {/* ========================================================================= */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>{editingProductIndex !== null ? "Modifier le Produit" : "Ajouter un Produit Vedette"}</span>
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Nom du Produit</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  placeholder="Ex: Kit 4 Caméras IP Dahua 5MP"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Marque</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    placeholder="Dahua, Dell, Cisco..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Catégorie</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    placeholder="Ordinateurs, Caméras..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Prix (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={productForm.priceFCFA}
                    onChange={(e) => setProductForm({ ...productForm, priceFCFA: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Stock Disponible</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">URL de l'Image</label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md"
                >
                  Enregistrer Produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COURSE EDIT MODAL */}
      {/* ========================================================================= */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>{editingCourseIndex !== null ? "Modifier la Formation" : "Ajouter une Formation Phare"}</span>
              </h3>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Titre de la Formation</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  placeholder="Ex: Masterclass IA Générative avec Gemini"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Catégorie</label>
                  <input
                    type="text"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-indigo-400 font-semibold"
                    placeholder="Développement, IA..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Prix (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={courseForm.priceFCFA}
                    onChange={(e) => setCourseForm({ ...courseForm, priceFCFA: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">URL Miniature / Image</label>
                <input
                  type="text"
                  value={courseForm.thumbnail}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md"
                >
                  Enregistrer Formation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
