import React, { useState, useRef } from "react";
import {
  Flame,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Star,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  ExternalLink,
  Code2,
  Clock,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown,
  Copy,
  CheckCircle2,
  Zap,
  Globe,
  Sliders,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import {
  SystemConfig,
  ShowcaseProgramItem
} from "../../../config/system-config";
import { ActionConfirmModal, ConfirmConfig } from "../../../shared/components/ActionConfirmModal";

interface WeeklySolutionsSettingsSectionProps {
  config: SystemConfig;
  onChange: (updated: SystemConfig) => void;
}

const CATEGORY_OPTIONS = [
  "Santé & Citoyen",
  "E-Commerce & FinTech",
  "Artisanat & Services",
  "IA & Automatisation",
  "AgriTech & Logistique",
  "Éducation & EdTech",
  "Sécurité & IoT",
  "Immobilier & Cadastre",
  "Transport & Mobilité"
];

const STATUS_OPTIONS: Array<"LIVRÉ & OPÉRATIONNEL" | "EN COURS DE SPRINT" | "PROCHAIN SPRINT"> = [
  "LIVRÉ & OPÉRATIONNEL",
  "EN COURS DE SPRINT",
  "PROCHAIN SPRINT"
];

const PRESET_COVERS = [
  { label: "Santé / Pharma", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80" },
  { label: "Fintech / E-Com", url: "https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&auto=format&fit=crop&q=80" },
  { label: "Artisans / Services", url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80" },
  { label: "IA & Algorithmes", url: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80" },
  { label: "AgriTech & Météo", url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80" },
  { label: "Code & Campus", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80" },
];

export const WeeklySolutionsSettingsSection: React.FC<WeeklySolutionsSettingsSectionProps> = ({
  config,
  onChange,
}) => {
  const weeklyConfig = config.homeShowcase.weeklySolutions || {
    enabled: true,
    eyebrow: "INITIATIVE FLAGSHIP NATIONALE • SEN AURA TECH",
    title: "Programme « 1 SEMAINE = 1 APPLICATION = 1 SOLUTION »",
    subtitle: "Chaque semaine, l'équipe d'ingénieurs et les talents certifiés de SEN AURA TECH & ACADEMY conçoivent, développent et déploient une solution 100% opérationnelle.",
    items: [],
  };

  const programs = weeklyConfig.items || [];

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [techInput, setTechInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  const [form, setForm] = useState<ShowcaseProgramItem>({
    id: `prog-${Date.now()}`,
    weekNumber: (programs.length || 0) + 1,
    title: "",
    codename: "",
    category: "Santé & Citoyen",
    problemStatement: "",
    solutionDelivered: "",
    technologies: ["React", "TypeScript", "Tailwind CSS"],
    durationDays: 7,
    status: "LIVRÉ & OPÉRATIONNEL",
    impactMetric: "+10 000 utilisateurs",
    demoUrl: "",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
    githubOpenSource: true,
    active: true,
    isPublished: true,
    featured: false,
  });

  const updateWeeklySolutions = (
    updater: (prev: typeof config.homeShowcase.weeklySolutions) => typeof config.homeShowcase.weeklySolutions
  ) => {
    onChange({
      ...config,
      homeShowcase: {
        ...config.homeShowcase,
        weeklySolutions: updater(config.homeShowcase.weeklySolutions || weeklyConfig),
      },
    });
  };

  // Open Create Modal
  const handleOpenAdd = () => {
    setEditingIndex(null);
    const nextWeek = programs.length > 0
      ? Math.max(...programs.map((p) => p.weekNumber || 0)) + 1
      : 1;
    setForm({
      id: `prog-${Date.now()}`,
      weekNumber: nextWeek,
      title: "",
      codename: "",
      category: "Santé & Citoyen",
      problemStatement: "",
      solutionDelivered: "",
      technologies: ["React", "TypeScript", "Node.js", "Tailwind CSS"],
      durationDays: 7,
      status: "LIVRÉ & OPÉRATIONNEL",
      impactMetric: "+5 000 usagers actifs",
      demoUrl: "",
      image: "https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&auto=format&fit=crop&q=80",
      githubOpenSource: true,
      active: true,
      isPublished: true,
      featured: false,
    });
    setTechInput("");
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    const item = programs[index];
    setForm({
      ...item,
      active: item.active !== false,
      isPublished: item.isPublished !== false,
      technologies: Array.isArray(item.technologies) ? item.technologies : [],
    });
    setTechInput("");
    setModalOpen(true);
  };

  // Save Modal Form
  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    updateWeeklySolutions((prev) => {
      const items = [...(prev.items || [])];
      if (editingIndex !== null) {
        items[editingIndex] = form;
      } else {
        items.push(form);
      }
      return {
        ...prev,
        items,
      };
    });

    setModalOpen(false);
  };

  // Delete Program
  const handleDeleteProgram = (index: number) => {
    setConfirmConfig({
      title: "Suppression de Programme",
      message: "Êtes-vous sûr de vouloir supprimer ce programme/solution ?",
      type: "danger",
      confirmText: "Supprimer",
      onConfirm: () => {
        updateWeeklySolutions((prev) => {
          const items = [...(prev.items || [])];
          items.splice(index, 1);
          return {
            ...prev,
            items,
          };
        });
      },
    });
  };

  // Duplicate Program
  const handleDuplicateProgram = (index: number) => {
    const orig = programs[index];
    const nextWeek = Math.max(...programs.map((p) => p.weekNumber || 0)) + 1;
    const duplicated: ShowcaseProgramItem = {
      ...orig,
      id: `prog-${Date.now()}`,
      weekNumber: nextWeek,
      title: `${orig.title} (Copie)`,
      isPublished: false,
      active: true,
    };
    updateWeeklySolutions((prev) => ({
      ...prev,
      items: [...(prev.items || []), duplicated],
    }));
  };

  // Quick Toggle Active
  const handleToggleActive = (index: number) => {
    updateWeeklySolutions((prev) => {
      const items = [...(prev.items || [])];
      const curr = items[index];
      items[index] = { ...curr, active: curr.active === false ? true : false };
      return { ...prev, items };
    });
  };

  // Quick Toggle Published
  const handleTogglePublished = (index: number) => {
    updateWeeklySolutions((prev) => {
      const items = [...(prev.items || [])];
      const curr = items[index];
      items[index] = { ...curr, isPublished: curr.isPublished === false ? true : false };
      return { ...prev, items };
    });
  };

  // Quick Toggle Featured
  const handleToggleFeatured = (index: number) => {
    updateWeeklySolutions((prev) => {
      const items = [...(prev.items || [])];
      const curr = items[index];
      items[index] = { ...curr, featured: !curr.featured };
      return { ...prev, items };
    });
  };

  // Move Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    updateWeeklySolutions((prev) => {
      const items = [...(prev.items || [])];
      const temp = items[index];
      items[index] = items[index - 1];
      items[index - 1] = temp;
      return { ...prev, items };
    });
  };

  // Move Down
  const handleMoveDown = (index: number) => {
    if (index >= programs.length - 1) return;
    updateWeeklySolutions((prev) => {
      const items = [...(prev.items || [])];
      const temp = items[index];
      items[index] = items[index + 1];
      items[index + 1] = temp;
      return { ...prev, items };
    });
  };

  // Add Tech Tag
  const handleAddTech = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const tag = techInput.trim();
    if (!tag) return;
    if (!form.technologies.includes(tag)) {
      setForm({
        ...form,
        technologies: [...form.technologies, tag],
      });
    }
    setTechInput("");
  };

  // Remove Tech Tag
  const handleRemoveTech = (tag: string) => {
    setForm({
      ...form,
      technologies: form.technologies.filter((t) => t !== tag),
    });
  };

  // Image File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 6MB
    if (file.size > 6 * 1024 * 1024) {
      alert("L'image est trop volumineuse. Veuillez choisir un fichier de moins de 6 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setForm((prev) => ({
          ...prev,
          image: event.target?.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* SECTION HEADER & MASTER SWITCH */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                Programme « 1 Semaine = 1 Application = 1 Solution »
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                  {programs.length} Programmes enregistrés
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gérez, activez, modifiez, uploadez des photos et publiez les solutions logicielles développées chaque semaine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right">
              <span className="text-xs font-bold text-white block">
                {weeklyConfig.enabled ? "Section Activée" : "Section Masquée"}
              </span>
              <span className="text-[10px] text-slate-400">Affichage public</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={weeklyConfig.enabled !== false}
                onChange={(e) =>
                  updateWeeklySolutions((prev) => ({
                    ...prev,
                    enabled: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>
        </div>

        {/* Global Texts Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Badge Supérieur (Eyebrow)</label>
            <input
              type="text"
              value={weeklyConfig.eyebrow}
              onChange={(e) =>
                updateWeeklySolutions((prev) => ({ ...prev, eyebrow: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 focus:border-amber-400 outline-none font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Titre Principal de la Section</label>
            <input
              type="text"
              value={weeklyConfig.title}
              onChange={(e) =>
                updateWeeklySolutions((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none font-bold"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-300">Sous-titre / Manifeste</label>
            <textarea
              rows={2}
              value={weeklyConfig.subtitle}
              onChange={(e) =>
                updateWeeklySolutions((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-amber-400 outline-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* PROGRAMS LIST & CONTROLS */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Catalogue des Solutions du Programme
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Glissez, activez ou modifiez chaque application. Les éléments désactivés ou non publiés sont automatiquement masqués au public.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Programme / Solution</span>
          </button>
        </div>

        {/* Empty state */}
        {programs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl p-6">
            <Flame className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h5 className="text-sm font-bold text-white">Aucun programme configuré</h5>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Créez votre première solution pour l'initiative « 1 Semaine = 1 Application = 1 Solution ».
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Créer un programme
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((prog, index) => {
              const isActive = prog.active !== false;
              const isPublished = prog.isPublished !== false;
              const isFeatured = !!prog.featured;

              return (
                <div
                  key={prog.id || index}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isActive && isPublished
                      ? "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      : "bg-slate-950/30 border-slate-800/40 opacity-75"
                  }`}
                >
                  {/* Left: Thumbnail & Main Info */}
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    
                    {/* Thumbnail with Badge */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                      {prog.image ? (
                        <img
                          src={prog.image}
                          alt={prog.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-amber-400 text-[9px] font-black font-mono">
                        #{prog.weekNumber}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300">
                          {prog.category}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prog.status === "LIVRÉ & OPÉRATIONNEL"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : prog.status === "EN COURS DE SPRINT"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          }`}
                        >
                          {prog.status}
                        </span>

                        {isFeatured && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Vedette
                          </span>
                        )}

                        {!isPublished && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
                            Brouillon
                          </span>
                        )}

                        {!isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 text-[10px] font-bold">
                            Désactivé
                          </span>
                        )}
                      </div>

                      <h5 className="text-sm font-bold text-white truncate">
                        {prog.title}
                      </h5>

                      <p className="text-xs text-slate-400 line-clamp-1">
                        {prog.problemStatement || prog.codename || "Aucune description détaillée."}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="text-amber-400 font-bold font-mono">
                          {prog.impactMetric || "Sprint 7J"}
                        </span>
                        <span>•</span>
                        <span>{prog.technologies?.slice(0, 3).join(", ") || "Stack moderne"}</span>
                        {prog.demoUrl && (
                          <>
                            <span>•</span>
                            <a
                              href={prog.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-400 hover:underline flex items-center gap-1"
                            >
                              Lien démo <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right: Quick Action Controls */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    
                    {/* Move Up/Down */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Monter"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === programs.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Descendre"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Star / Featured */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(index)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isFeatured
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400"
                      }`}
                      title={isFeatured ? "Retirer de la vedette" : "Mettre en vedette"}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFeatured ? "fill-amber-400" : ""}`} />
                    </button>

                    {/* Publish / Draft Toggle */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(index)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        isPublished
                          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
                          : "bg-rose-500/20 border-rose-500/30 text-rose-300 hover:bg-rose-500/30"
                      }`}
                      title={isPublished ? "Basculer en Brouillon" : "Publier en ligne"}
                    >
                      {isPublished ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Publié</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-rose-400" />
                          <span>Brouillon</span>
                        </>
                      )}
                    </button>

                    {/* Active / Inactive Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(index)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        isActive
                          ? "bg-slate-800 border-slate-700 text-slate-200"
                          : "bg-slate-900 border-slate-800 text-slate-500"
                      }`}
                      title={isActive ? "Désactiver le programme" : "Activer le programme"}
                    >
                      {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{isActive ? "Actif" : "Inactif"}</span>
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateProgram(index)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Dupliquer ce programme"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(index)}
                      className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                      title="Modifier les détails & la photo"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteProgram(index)}
                      className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* PROGRAM CREATE / EDIT MODAL */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-slate-900 border border-amber-500/40 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingIndex !== null ? "Modifier le Programme / Solution" : "Nouveau Programme de la Semaine"}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium font-mono">
                    Semaine #{form.weekNumber} • SEN AURA TECH
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProgram} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* PHOTO / IMAGE UPLOAD SECTION */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    Photo / Couverture Illustrative du Programme
                  </label>
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: "" })}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      Effacer la photo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Live Preview */}
                  <div className="relative h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Aperçu Programme"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-500">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px]">Aucune image</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] text-slate-300 font-mono">
                      Aperçu live
                    </span>
                  </div>

                  {/* Upload Actions & URL input */}
                  <div className="sm:col-span-2 space-y-2">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Importer une photo depuis l'ordinateur/téléphone</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold">Ou collez une URL d'image directe :</label>
                      <input
                        type="url"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none font-mono"
                      />
                    </div>

                    {/* Stock Presets */}
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-500 block mb-1">Suggestions de couvertures de haute qualité :</span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COVERS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setForm({ ...form, image: preset.url })}
                            className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-300 transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 1: Week Number + Category + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Numéro de Semaine (#)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.weekNumber}
                    onChange={(e) => setForm({ ...form, weekNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 font-bold font-mono outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Catégorie Métier</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium outline-none focus:border-amber-400"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Statut du Sprint</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-bold outline-none focus:border-amber-400"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st} className="bg-slate-900">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ROW 2: Title + Codename */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Nom Officiel de l'Application / Solution</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: SEN-PHARMA : Urgences & Gardes"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Nom de Code / Surnom Métier</label>
                  <input
                    type="text"
                    value={form.codename}
                    onChange={(e) => setForm({ ...form, codename: e.target.value })}
                    placeholder="Ex: Uber des Artisans de Dakar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* ROW 3: Problem Statement */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-red-400 flex items-center gap-1">
                  <span>Problématique Résolue (Le Défi Sénégalais)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.problemStatement}
                  onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
                  placeholder="Ex: Difficulté pour les citoyens de trouver rapidement une pharmacie ouverte..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-red-400 leading-relaxed"
                  required
                />
              </div>

              {/* ROW 4: Solution Delivered */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span>Solution Livrée en Production (Le Logiciel)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.solutionDelivered}
                  onChange={(e) => setForm({ ...form, solutionDelivered: e.target.value })}
                  placeholder="Ex: Application web/PWA géolocalisée avec recherche instantanée par quartier..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-emerald-400 leading-relaxed"
                  required
                />
              </div>

              {/* ROW 5: Tech Stack Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-amber-400" />
                  Technologies & Frameworks Déployés
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleAddTech}
                    placeholder="Ex: Next.js, FastAPI, Wave API, Leaflet..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.technologies.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono flex items-center gap-1.5"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(t)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* ROW 6: Metrics & Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Chiffre Clé d'Impact / Statistique</label>
                  <input
                    type="text"
                    value={form.impactMetric}
                    onChange={(e) => setForm({ ...form, impactMetric: e.target.value })}
                    placeholder="Ex: +14 500 recherches / mois"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 font-bold outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Lien Démo / Déploiement en ligne</label>
                  <input
                    type="url"
                    value={form.demoUrl || ""}
                    onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                    placeholder="https://senauratech.sn/solutions/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-sky-400 outline-none focus:border-sky-400 font-mono"
                  />
                </div>
              </div>

              {/* ROW 7: Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                {/* Active Switch */}
                <label className="flex items-center justify-between cursor-pointer gap-2">
                  <span className="text-xs font-bold text-slate-300">Programme Actif</span>
                  <input
                    type="checkbox"
                    checked={form.active !== false}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                </label>

                {/* Published Switch */}
                <label className="flex items-center justify-between cursor-pointer gap-2">
                  <span className="text-xs font-bold text-slate-300">Publié en Ligne</span>
                  <input
                    type="checkbox"
                    checked={form.isPublished !== false}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                </label>

                {/* Featured Switch */}
                <label className="flex items-center justify-between cursor-pointer gap-2">
                  <span className="text-xs font-bold text-slate-300">Mettre en Vedette</span>
                  <input
                    type="checkbox"
                    checked={!!form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500"
                  />
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  {editingIndex !== null ? "Enregistrer les modifications" : "Créer le programme"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Action Confirm Modal */}
      <ActionConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
    </div>
  );
};
