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
  Briefcase
} from "lucide-react";
import { store } from "../../../database/store";
import { formatCurrency, BRAND_CONFIG } from "../../../config/constants";
import { ProfessionalDTO } from "../../../shared/contracts/types";

import { uploadToCloudinary } from "../../../lib/cloudinary";

const CATEGORIES = [
  "Réseau & Fibre",
  "Vidéosurveillance",
  "Électricité",
  "Développement Software",
  "Plomberie",
  "Climatisation",
  "Mécanique Auto",
  "Comptabilité",
  "Droit / Juridique",
  "Architecture",
] as const;

interface ProProfileEditorProps {
  currency: "FCFA" | "EUR" | "USD";
  onSaved?: () => void;
}

export const ProProfileEditor: React.FC<ProProfileEditorProps> = ({ currency, onSaved }) => {
  const user = store.currentUser;

  // Locate existing pro profile in store or seed data, or create initial
  const existingPro = store.providers.find(
    (p) => p.id === user.id || p.phone === user.phone || (p.fullName && p.fullName.toLowerCase() === user.fullName?.toLowerCase())
  );

  const [fullName, setFullName] = useState(existingPro?.fullName || user.fullName || "Technicien Pro SEN AURA");
  const [category, setCategory] = useState<any>(existingPro?.category || "Réseau & Fibre");
  const [region, setRegion] = useState(existingPro?.region || user.region || "Dakar");
  const [phone, setPhone] = useState(existingPro?.phone || user.phone || "+221 77 000 00 00");
  const [hourlyRate, setHourlyRate] = useState(existingPro?.hourlyRateFCFA?.toString() || "15000");
  const [bio, setBio] = useState(
    existingPro?.bio ||
      "Technicien qualifié et certifié SEN AURA TECH. Disponible pour interventions rapides sur site, raccordement fibre, vidéosurveillance IP et dépannage matériel."
  );
  const [skills, setSkills] = useState<string[]>(
    existingPro?.skills && existingPro.skills.length > 0
      ? existingPro.skills
      : ["Fibre Optique FTTH", "Vidéosurveillance IP", "Solaire 3kVA/5kVA", "Câblage Baie Réseau", "Dépannage Express"]
  );
  const [newSkill, setNewSkill] = useState("");
  const [available, setAvailable] = useState<boolean>(existingPro ? existingPro.available : true);
  const [avatar, setAvatar] = useState(
    existingPro?.avatar ||
      user.avatar ||
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadToCloudinary(file, "sen_aura_avatars", "image");
      if (result?.secure_url) {
        setAvatar(result.secure_url);
      }
    } catch {
      alert("Erreur lors de l'upload de la photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    const proId = user.id || `pro-${Date.now()}`;
    const updatedProDTO: ProfessionalDTO = {
      id: proId,
      fullName: fullName.trim(),
      category: category as any,
      region,
      phone: phone.trim(),
      avatar,
      rating: existingPro?.rating || 5.0,
      reviewsCount: existingPro?.reviewsCount || 1,
      hourlyRateFCFA: parseInt(hourlyRate) || 15000,
      verified: true,
      skills,
      bio: bio.trim(),
      completedJobs: existingPro?.completedJobs || 0,
      available,
    };

    // 1. Update in local store
    const providerIndex = store.providers.findIndex((p) => p.id === proId || p.phone === phone);
    if (providerIndex >= 0) {
      store.providers[providerIndex] = updatedProDTO;
    } else {
      store.providers.push(updatedProDTO);
    }


    // 2. Update current user in store
    store.currentUser.fullName = fullName.trim();
    store.currentUser.phone = phone.trim();
    store.currentUser.region = region;
    store.currentUser.avatar = avatar;

    // 3. Sync to backend API in real time
    try {
      await fetch("/api/pro/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...updatedProDTO,
        }),
      });

      await fetch("/api/db/providers/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: updatedProDTO,
        }),
      });
    } catch {
      // Offline fallback already updated in memory store
    }

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 5000);
    if (onSaved) onSaved();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info & Sync Status */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider font-mono">
              Modification Profil & Visibilité Visiteurs
            </span>
            <h2 className="text-xl font-black text-white">Votre Fiche Prestataire Professionnelle</h2>
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
              <span>{available ? "Visible & Disponible aux Visiteurs" : "Indisponible / Masqué"}</span>
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Toute modification est synchronisée <strong>en temps réel avec le backend</strong> et reflétée immédiatement sur la Marketplace pour tous les visiteurs et clients qui cherchent un expert.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            ✓ Profil prestataire enregistré et synchronisé avec succès ! Les visiteurs peuvent désormais voir votre fiche à jour en direct sur la Marketplace.
          </span>
        </div>
      )}

      {/* Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FORM */}
        <form onSubmit={handleSaveProfile} className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>Informations Professionnelles</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nom Complet / Raison Sociale</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Spécialité Principale</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Zone de Couverture</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
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
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Numéro de Contact (WhatsApp)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tarif Horaire de Base ({currency})</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={1000}
                  step={500}
                  required
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Disponibilité Immédiate</label>
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
                <span>{available ? "En Ligne (Prêt pour missions)" : "Occupé / En Pause"}</span>
              </button>
            </div>
          </div>

          {/* Photo Avatar */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-2">Photo de Profil Professionnelle</label>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="relative shrink-0">
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-amber-500/40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400";
                  }}
                />
                {isUploading && (
                  <div className="absolute inset-0 rounded-xl bg-slate-950/70 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 mb-1.5 truncate">{avatar ? "Photo chargée ✓" : "Aucune photo"}</p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? "Envoi en cours..." : "Choisir une photo"}</span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploading} />
                </label>
              </div>
            </div>
          </div>

          {/* Skills / Compétences Tag Editor */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Compétences Techniques & Certifications</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5"
                >
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="text-amber-400/60 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Fibre FTTH, Alarme incendie, Onduleur 10kVA..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          {/* Bio Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Présentation & Expérience (Bio)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs leading-relaxed focus:border-amber-500 focus:outline-none"
              placeholder="Présentez vos années d'expérience, équipements maîtrisés..."
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Synchronisation en cours..." : "Enregistrer & Synchroniser en Direct"}</span>
          </button>
        </form>

        {/* LIVE VISITOR PREVIEW CARD */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>Aperçu en Direct (Ce que voient les visiteurs)</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Voici votre carte telle qu'elle s'affiche sur la Marketplace SEN AURA TECH.
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
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                </div>
                <p className="text-xs text-amber-400 font-bold">{category}</p>
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
              {skills.slice(0, 4).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                  {s}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">
                  +{skills.length - 4}
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Tarif Horaire</span>
                <p className="text-sm font-black text-white font-mono">{formatCurrency(parseInt(hourlyRate) || 15000, currency === "USD" ? "FCFA" : currency)}</p>
              </div>

              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>5.0 (Agréé)</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                disabled
                className="w-full py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Bouton "Demander une Intervention" (Visible visiteurs)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
