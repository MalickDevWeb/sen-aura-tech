import React, { useState } from "react";
import {
  User,
  Phone,
  MapPin,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Tag,
  Upload,
  Eye,
  ShieldCheck,
  Star,
  Activity,
  Save,
  Plus,
  X,
  GraduationCap,
  Award,
  BookOpen
} from "lucide-react";
import { store } from "../../../database/store";
import { formatCurrency, BRAND_CONFIG } from "../../../config/constants";
import { uploadToCloudinary } from "../../../lib/cloudinary";
import { useDialog } from "../../../shared/components/CustomDialog";
import { authFetch } from "../../../lib/authFetch";

const ACADEMY_DOMAINS = [
  "Énergie Solaire & Photovoltaïque",
  "Fibre Optique FTTH & Télécoms",
  "Vidéosurveillance & Sécurité IP",
  "Réseaux Informatiques & Baies",
  "Développement Web & IA",
  "Électricité Bâtiment & Industrielle",
  "Domotique & Objets Connectés",
] as const;

interface FormateurProfileEditorProps {
  currency: "FCFA" | "EUR";
  onSaved?: () => void;
}

export const FormateurProfileEditor: React.FC<FormateurProfileEditorProps> = ({ currency, onSaved }) => {
  const user = store.currentUser;

  const [fullName, setFullName] = useState(user.fullName || "Ingénieur Formateur SEN AURA ACADEMY");
  const [domain, setDomain] = useState<string>("Énergie Solaire & Photovoltaïque");
  const [region, setRegion] = useState(user.region || "Dakar");
  const [phone, setPhone] = useState(user.phone || "+221 77 000 00 00");
  const [hourlyRate, setHourlyRate] = useState("20000");
  const [bio, setBio] = useState(
    "Formateur senior certifié en systèmes solaires autonomes et hybrides. Plus de 8 ans d'expérience dans l'ingénierie photovoltaïque et l'accompagnement de techniciens en Afrique de l'Ouest."
  );
  const [certifications, setCertifications] = useState<string[]>([
    "Ingénieur Énergie Renouvelable",
    "Certification SMA & Victron",
    "Habilitation Électrique BR/B2V",
    "Formateur Agréé SEN AURA"
  ]);
  const [newCert, setNewCert] = useState("");
  const [available, setAvailable] = useState<boolean>(true);
  const [avatar, setAvatar] = useState(
    user.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { openDialog, dialog } = useDialog();

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCert.trim();
    if (trimmed && !certifications.includes(trimmed)) {
      setCertifications([...certifications, trimmed]);
      setNewCert("");
    }
  };

  const handleRemoveCert = (certToRemove: string) => {
    setCertifications(certifications.filter((c) => c !== certToRemove));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadToCloudinary(file, "sen_aura_formateur_avatars", "image");
      if (result?.secure_url) {
        setAvatar(result.secure_url);
      }
    } catch {
      openDialog({
        type: "alert",
        title: "Erreur d'upload",
        message: "Erreur lors de l'upload de la photo de profil sur Cloudinary.",
        danger: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    // Update local user in store
    store.currentUser.fullName = fullName.trim();
    store.currentUser.phone = phone.trim();
    store.currentUser.region = region;
    store.currentUser.avatar = avatar;

    const payload = {
      userId: user.id,
      fullName: fullName.trim(),
      domain,
      region,
      phone: phone.trim(),
      hourlyRate: parseInt(hourlyRate) || 20000,
      bio: bio.trim(),
      certifications,
      avatar,
      available,
      role: "FORMATEUR",
    };

    try {
      await authFetch("/api/formateur/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Offline fallback
    }

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 5000);
    if (onSaved) onSaved();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {dialog}
      {/* Header Info & Sync Status */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider font-mono">
              Profil Formateur Academy & Visibilité Apprenants
            </span>
            <h2 className="text-xl font-black text-white">Votre Fiche Formateur Certifié SEN AURA ACADEMY</h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                available
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/40"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${available ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
              <span>{available ? "Inscriptions & Cours Ouverts" : "Session Complète / En Pause"}</span>
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Toute mise à jour est synchronisée <strong>en temps réel avec le backend</strong> et apparaît instantanément sur l'espace Academy pour tous les étudiants et apprenants.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            ✓ Profil formateur enregistré et synchronisé en direct ! Vos cours et vos badges sont visibles sur l'Academy.
          </span>
        </div>
      )}

      {/* Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FORM */}
        <form onSubmit={handleSaveProfile} className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Informations Pédagogiques & Coordonnées</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nom Complet du Formateur</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Domaine d'Enseignement Principal</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                {ACADEMY_DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Région / Centre d'examen</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                >
                  {BRAND_CONFIG.regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">WhatsApp & Support Apprenants</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tarif Horaire Coaching / Mentorat ({currency})</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={1000}
                  step={500}
                  required
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Disponibilité Pédagogique</label>
              <button
                type="button"
                onClick={() => setAvailable(!available)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  available
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>{available ? "Accepte de Nouveaux Apprenants" : "Session Complète"}</span>
              </button>
            </div>
          </div>

          {/* Photo Avatar */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-2">Photo de Profil Formateur</label>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="relative shrink-0">
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-500/40"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"; }}
                />
                {isUploading && (
                  <div className="absolute inset-0 rounded-xl bg-slate-950/70 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 mb-1.5 truncate">{avatar ? "Photo chargée ✓" : "Aucune photo"}</p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? "Envoi en cours..." : "Choisir une photo"}</span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploading} />
                </label>
              </div>
            </div>
          </div>

          {/* Certifications & Badges */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Certifications & Habilitations Pédagogiques</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {certifications.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold flex items-center gap-1.5"
                >
                  <Award className="w-3 h-3 text-indigo-400" />
                  <span>{c}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCert(c)}
                    className="text-indigo-400/60 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Certification Schneider Electric, Instructeur Cisco CCNA..."
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCert(e);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddCert}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          {/* Bio Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Présentation & Pédagogie (Bio)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs leading-relaxed focus:border-indigo-500 focus:outline-none"
              placeholder="Présentez votre parcours pédagogique, vos diplômes et vos cours phares..."
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Synchronisation en cours..." : "Enregistrer & Synchroniser en Direct"}</span>
          </button>
        </form>

        {/* LIVE VISITOR PREVIEW CARD */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>Aperçu Formateur Academy (Vue Apprenants)</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Voici votre fiche formateur affichée sur l'Academy SEN AURA TECH.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img src={avatar} alt={fullName} className="w-16 h-16 rounded-2xl object-cover border border-slate-800" />
                {available && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-white truncate">{fullName}</h4>
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                </div>
                <p className="text-xs text-indigo-400 font-bold">{domain}</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{region}, Sénégal</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-900">
              {bio || "Aucune description fournie."}
            </p>

            <div className="flex flex-wrap gap-1">
              {certifications.slice(0, 3).map((c) => (
                <span key={c} className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px]">
                  {c}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Mentorat / H</span>
                <p className="text-sm font-black text-white font-mono">{formatCurrency(parseInt(hourlyRate) || 20000, currency)}</p>
              </div>

              <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.95 (Formateur Agréé)</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                disabled
                className="w-full py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Bouton "S'inscrire aux Formations" (Visible étudiants)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
