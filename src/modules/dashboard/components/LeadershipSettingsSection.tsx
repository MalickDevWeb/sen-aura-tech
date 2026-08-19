import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Phone,
  Mail,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { uploadToCloudinary } from "../../../lib/cloudinary";
import { useDialog } from "../../../shared/components/CustomDialog";
import {
  SystemConfig,
  TeamMemberItem,
  PRESET_SEN_AVATARS,
  SEN_LEADERSHIP_DEFAULT_PHOTOS
} from "../../../config/system-config";

interface LeadershipSettingsSectionProps {
  config: SystemConfig;
  onChange: (updated: SystemConfig) => void;
}

export const LeadershipSettingsSection: React.FC<LeadershipSettingsSectionProps> = ({
  config,
  onChange,
}) => {
  const leadership = config.leadership || {
    enabled: true,
    eyebrow: "GOUVERNANCE & ÉQUIPE FONDATRICE",
    title: "Les 5 Cofondateurs SEN AURA TECH",
    subtitle: "Une équipe solide de leaders sénégalais garantissant la vision stratégique, la solidité financière et l'excellence technologique.",
    items: [],
  };

  const [editingMember, setEditingMember] = useState<TeamMemberItem | null>(null);
  const [isNewMember, setIsNewMember] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStage, setUploadStage] = useState<string>("");
  const { openDialog, dialog } = useDialog();

  const handleUpdateLeadership = (partial: Partial<typeof leadership>) => {
    onChange({
      ...config,
      leadership: {
        ...leadership,
        ...partial,
      },
    });
  };

  const handleOpenAddModal = () => {
    const newMember: TeamMemberItem = {
      id: `team-${Date.now()}`,
      name: "",
      role: "",
      focus: "",
      avatar: PRESET_SEN_AVATARS[0]?.url || SEN_LEADERSHIP_DEFAULT_PHOTOS.mamadouSow,
      email: "",
      phone: "+221 ",
      active: true,
      order: (leadership.items?.length || 0) + 1,
    };
    setEditingMember(newMember);
    setIsNewMember(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (member: TeamMemberItem) => {
    setEditingMember({ ...member });
    setIsNewMember(false);
    setShowModal(true);
  };

  const handleDeleteMember = async (id: string) => {
    const res = await openDialog({
      type: "confirm",
      title: "Supprimer le membre",
      message: "Êtes-vous sûr de vouloir supprimer ce membre de l'équipe ?",
      danger: true,
      confirmLabel: "Supprimer",
    });
    
    if (res !== undefined) {
      const updated = leadership.items.filter((m) => m.id !== id);
      handleUpdateLeadership({ items: updated });
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = leadership.items.map((m) =>
      m.id === id ? { ...m, active: !m.active } : m
    );
    handleUpdateLeadership({ items: updated });
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editingMember.name.trim() || !editingMember.role.trim()) {
      openDialog({
        type: "alert",
        title: "Champs obligatoires",
        message: "Veuillez renseigner au moins le nom et le rôle du membre.",
      });
      return;
    }

    let updatedItems = [...leadership.items];
    if (isNewMember) {
      updatedItems.push(editingMember);
    } else {
      updatedItems = updatedItems.map((m) =>
        m.id === editingMember.id ? editingMember : m
      );
    }

    // Sort by order
    updatedItems.sort((a, b) => (a.order || 0) - (b.order || 0));

    handleUpdateLeadership({ items: updatedItems });
    setShowModal(false);
    setEditingMember(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingMember) return;

    // Check size limit (max 10MB for Cloudinary)
    if (file.size > 10 * 1024 * 1024) {
      openDialog({
        type: "alert",
        title: "Fichier trop volumineux",
        message: "La photo est trop lourde (max 10 Mo). Veuillez choisir une photo plus légère.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStage("Préparation...");

    try {
      const result = await uploadToCloudinary(file, "sen_aura_tech_leadership", "image", (percent, stage) => {
        setUploadProgress(percent);
        setUploadStage(stage);
      });

      if (result.success) {
        setEditingMember({ ...editingMember, avatar: result.secure_url });
      } else {
        throw new Error("Upload échoué sans exception");
      }
    } catch (err: any) {
      console.error(err);
      openDialog({
        type: "alert",
        title: "Erreur d'upload",
        message: "Impossible d'importer l'image sur Cloudinary. Veuillez réessayer.",
        danger: true,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset l'input file pour permettre de re-sélectionner le même fichier au besoin
      e.target.value = "";
    }
  };

  const handleMoveOrder = (index: number, direction: "up" | "down") => {
    const items = [...leadership.items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    // Re-assign sequential orders
    items.forEach((item, idx) => {
      item.order = idx + 1;
    });

    handleUpdateLeadership({ items });
  };

  return (
    <div className="space-y-6">
      {dialog}
      {/* SECTION HEADER */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gestion de l'Équipe & Dirigeants (Cofondateurs)</h3>
              <p className="text-xs text-slate-400">
                Gérez les photos authentiques sénégalaises, titres, missions et membres affichés sur le site.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={leadership.enabled}
                onChange={(e) => handleUpdateLeadership({ enabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-amber-500"
              />
              <span>Afficher sur le site public</span>
            </label>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Ajouter un Dirigeant</span>
            </button>
          </div>
        </div>

        {/* SECTION TEXTS CUSTOMIZATION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Surtitre (Eyebrow)</label>
            <input
              type="text"
              value={leadership.eyebrow}
              onChange={(e) => handleUpdateLeadership({ eyebrow: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
              placeholder="GOUVERNANCE & ÉQUIPE FONDATRICE"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Titre Principal</label>
            <input
              type="text"
              value={leadership.title}
              onChange={(e) => handleUpdateLeadership({ title: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
              placeholder="Les 5 Cofondateurs SEN AURA TECH"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Sous-titre descriptif</label>
            <input
              type="text"
              value={leadership.subtitle}
              onChange={(e) => handleUpdateLeadership({ subtitle: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
              placeholder="Une équipe solide de leaders sénégalais..."
            />
          </div>
        </div>
      </div>

      {/* TEAM MEMBERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leadership.items.map((member, idx) => (
          <div
            key={member.id || idx}
            className={`p-5 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between space-y-4 ${
              member.active ? "border-slate-800 hover:border-slate-700" : "border-red-900/30 opacity-60 bg-slate-950/50"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="relative shrink-0">
                <img
                  src={member.avatar}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-amber-500/40 shadow-md"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold ${
                    member.active ? "bg-emerald-500 text-slate-950" : "bg-red-500 text-white"
                  }`}
                  title={member.active ? "Actif" : "Masqué"}
                >
                  {member.active ? "✓" : "✕"}
                </span>
              </div>

              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-white truncate">{member.name}</h4>
                  <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                </div>
                <p className="text-xs font-semibold text-amber-400 truncate">{member.role}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {member.focus}
                </p>
              </div>
            </div>

            {/* CONTACT DETAILS & ACTIONS */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                {member.phone && (
                  <span className="flex items-center gap-1 font-mono text-slate-300">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span className="truncate max-w-[100px]">{member.phone}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Order controls */}
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveOrder(idx, "up")}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  title="Monter"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={idx === leadership.items.length - 1}
                  onClick={() => handleMoveOrder(idx, "down")}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  title="Descendre"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>

                {/* Toggle visible */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(member.id)}
                  className={`p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors ${
                    member.active ? "text-emerald-400" : "text-amber-400"
                  }`}
                  title={member.active ? "Masquer ce membre" : "Afficher ce membre"}
                >
                  {member.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(member)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {showModal && editingMember && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
            className="fixed inset-0 z-[100000] flex items-start justify-center pt-2 sm:pt-4 md:pt-6 p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden select-none overscroll-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 text-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 space-y-4 shrink-0 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {isNewMember ? "Ajouter un Dirigeant / Membre" : "Modifier le Dirigeant"}
                    </h3>
                    <p className="text-[10px] text-slate-400">SEN AURA TECH • Gouvernance & Équipe</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-3">
                {/* PHOTO SELECTION & PREVIEW */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={editingMember.avatar}
                      alt="Aperçu"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-amber-500/40 shadow-md shrink-0"
                    />
                    <div className="space-y-1 flex-1">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Photo du Dirigeant</span>
                      </label>
                      <p className="text-[10px] text-slate-400">
                        Importez une vraie photo de votre appareil ou choisissez un portrait sénégalais.
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <label className={`cursor-pointer px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all ${isUploading ? "bg-slate-800 text-slate-400 pointer-events-none" : "bg-amber-500 hover:bg-amber-400 text-slate-950"}`}>
                          {isUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{uploadProgress}% • {uploadStage}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Importer photo locale (max 10 Mo)</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* PRESET SENEGALESE AVATARS */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Portraits Sénégalais Disponibles (1-Clic) :
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PRESET_SEN_AVATARS.map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setEditingMember({ ...editingMember, avatar: preset.url })}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                            editingMember.avatar === preset.url
                              ? "border-amber-400 ring-2 ring-amber-400/30 scale-105"
                              : "border-slate-800 opacity-70 hover:opacity-100"
                          }`}
                          title={preset.label}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover object-top"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Or Manual URL Input */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-semibold text-slate-400">Ou saisir une URL directe d'image :</label>
                    <input
                      type="url"
                      value={editingMember.avatar}
                      onChange={(e) => setEditingMember({ ...editingMember, avatar: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* FORM FIELDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Nom complet *</label>
                    <input
                      type="text"
                      required
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                      placeholder="Ex: Mamadou Sow"
                      className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Rôle / Titre officiel *</label>
                    <input
                      type="text"
                      required
                      value={editingMember.role}
                      onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                      placeholder="Ex: Directeur Général & Stratégie"
                      className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Missions & Périmètre d'action (Focus)</label>
                  <textarea
                    rows={2}
                    value={editingMember.focus}
                    onChange={(e) => setEditingMember({ ...editingMember, focus: e.target.value })}
                    placeholder="Ex: Vision, Partenariats Internationaux & Croissance..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Téléphone (Optionnel)</label>
                    <input
                      type="text"
                      value={editingMember.phone || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                      placeholder="+221 77 000 00 00"
                      className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Email professionnel (Optionnel)</label>
                    <input
                      type="email"
                      value={editingMember.email || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                      placeholder="nom.prenom@senauratech.sn"
                      className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* MODAL ACTIONS */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all shadow-md"
                  >
                    {isNewMember ? "Ajouter le Dirigeant" : "Enregistrer les modifications"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
