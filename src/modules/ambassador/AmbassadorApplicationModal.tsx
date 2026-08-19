import React, { useState } from "react";
import {
  X,
  Check,
  User,
  Mail,
  Phone,
  Lock,
  Globe,
  MapPin,
  Briefcase,
  Award,
  FileText,
  Linkedin,
  Github,
  CheckSquare,
  Send,
  Sparkles,
  ShieldCheck,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Building2,
  Share2,
  AlertTriangle
} from "lucide-react";
import { AmbassadorApplicationDTO } from "../../shared/contracts/types";
import { authFetch } from "../../lib/authFetch";

interface AmbassadorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (app: AmbassadorApplicationDTO) => void;
}

export const AmbassadorApplicationModal: React.FC<AmbassadorApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedApp, setSubmittedApp] = useState<AmbassadorApplicationDTO | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Account
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    country: "Sénégal",
    city: "Dakar",
    termsAccepted: false,

    // Step 2: Experience & Links
    profession: "",
    experience: "",
    skills: [] as string[],
    cvUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    githubUrl: "",
    avatarUrl: "",

    // Step 3: Contact Network (Checkboxes)
    contactDomains: [] as string[],

    // Step 4: Social Channels & Motivation
    tiktok: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    youtube: "",
    whatsapp: "",
    motivation: ""
  });

  const [skillInput, setSkillInput] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const availableDomains = [
    { id: "Entreprises", label: "Entreprises / PME & ETI" },
    { id: "Commerces", label: "Commerces & Boutiques" },
    { id: "Écoles", label: "Écoles & Universités" },
    { id: "Associations", label: "Associations & Groupements" },
    { id: "ONG", label: "ONG & Organismes Internationaux" },
    { id: "Institutions", label: "Institutions & Collectivités" },
    { id: "Immobilier", label: "Immobilier & Promotion" },
    { id: "Froid & climatisation", label: "Froid & Climatisation" },
    { id: "Électricité", label: "Électricité & Énergie Solaire" },
    { id: "Industrie", label: "Industrie & Chantiers" },
    { id: "Tourisme", label: "Tourisme & Hôtellerie" },
    { id: "Autre", label: "Autre domaine de réseau" },
  ];

  const handleDomainToggle = (domainId: string) => {
    setFormData((prev) => {
      const exists = prev.contactDomains.includes(domainId);
      if (exists) {
        return { ...prev, contactDomains: prev.contactDomains.filter((d) => d !== domainId) };
      } else {
        return { ...prev, contactDomains: [...prev.contactDomains, domainId] };
      }
    });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const handleSubmitCandidature = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim() || "Candidat Ambassadeur",
        email: formData.email,
        phone: formData.phone.startsWith("+221") ? formData.phone : `+221 ${formData.phone}`,
        country: formData.country,
        city: formData.city,
        profession: formData.profession || "Consultant Indépendant / Apporteur",
        experience: formData.experience || "Apporteur d'affaires B2B",
        skills: formData.skills,
        cvUrl: formData.cvUrl,
        linkedinUrl: formData.linkedinUrl,
        portfolioUrl: formData.portfolioUrl,
        githubUrl: formData.githubUrl,
        contactDomains: formData.contactDomains,
        socialNetworks: {
          tiktok: formData.tiktok,
          instagram: formData.instagram,
          facebook: formData.facebook,
          linkedin: formData.linkedinUrl || formData.linkedin,
          youtube: formData.youtube,
          whatsapp: formData.whatsapp || formData.phone
        },
        motivation: formData.motivation || "Rejoindre le réseau d'ambassadeurs SEN AURA TECH et promouvoir des projets technologiques."
      };

      const res = await authFetch("/api/ambassadors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSubmitError(null);
        setSubmittedApp(data.application);
        onSuccess?.(data.application);
      } else {
        setSubmitError(data.message || "Erreur lors de la soumission de votre candidature.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Erreur de connexion serveur. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header bar */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">Candidature Ambassadeur</h2>
              <p className="text-[11px] text-slate-400">Programme SEN AURA Partners</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* SUCCESS SCREEN */}
          {submittedApp ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono uppercase tracking-wider">
                  Candidature N° {submittedApp.id}
                </span>
                <h3 className="text-xl font-black text-white">Candidature en cours d'analyse ⏳</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Merci <strong>{submittedApp.fullName}</strong> ! Notre équipe étudie votre profil d'ambassadeur.
                  Vous serez informé de la décision par email et WhatsApp.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2 text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Statut :</span>
                  <span className="font-bold text-amber-400">🟡 En attente de validation</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Téléphone :</span>
                  <span className="font-mono text-white">{submittedApp.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Réseau & Domaines :</span>
                  <span className="font-medium text-emerald-400">{submittedApp.contactDomains.slice(0, 3).join(", ")}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                >
                  Fermer & Accéder au site
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEPS PROGRESS BAR */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { num: 1, title: "1. Compte" },
                  { num: 2, title: "2. Expérience" },
                  { num: 3, title: "3. Réseau" },
                  { num: 4, title: "4. Motivation" },
                ].map((s) => (
                  <div key={s.num} className="space-y-1">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        step >= s.num ? "bg-amber-500" : "bg-slate-800"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-bold block truncate ${
                        step === s.num ? "text-amber-400" : "text-slate-500"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Error banner */}
              {submitError && (
                <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitCandidature} className="space-y-5">
                
                {/* STEP 1: COMPTE & IDENTITÉ */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-400" />
                        <span>Création de votre compte Ambassadeur</span>
                      </h3>
                      <p className="text-xs text-slate-400">Renseignez vos coordonnées personnelles sécurisées.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Prénom *</label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="Ex: Jean"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Nom *</label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Ex: Diop"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jean.diop@exemple.sn"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Téléphone / WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+221 77 000 00 00"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Pays *</label>
                        <select
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="Sénégal">Sénégal 🇸🇳</option>
                          <option value="Côte d'Ivoire">Côte d'Ivoire 🇨🇮</option>
                          <option value="Mali">Mali 🇲🇱</option>
                          <option value="Guinée">Guinée 🇬🇳</option>
                          <option value="France">France 🇫🇷</option>
                          <option value="Autre">Autre pays</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Ville *</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Dakar, Thiès, St-Louis..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={formData.termsAccepted}
                          onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                          className="mt-0.5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                        />
                        <span>
                          J'accepte les conditions générales du programme d'Ambassadeurs SEN AURA TECH et la politique de commission.
                        </span>
                      </label>
                    </div>

                    <div className="pt-3">
                      <button
                        type="button"
                        disabled={!formData.firstName || !formData.email || !formData.phone || !formData.termsAccepted}
                        onClick={() => setStep(2)}
                        className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                      >
                        <span>Continuer (2/4) : Votre Profil</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: EXPÉRIENCE & DIPLÔMES */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-amber-400" />
                        <span>Votre expérience & profil professionnel</span>
                      </h3>
                      <p className="text-xs text-slate-400">Présentez votre parcours et vos compétences clés.</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Profession / Titre Actuel *</label>
                      <input
                        type="text"
                        required
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        placeholder="Ex: Commercial B2B, Consultant, Chef d'entreprise, Ingénieur..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Résumé de votre expérience *</label>
                      <textarea
                        rows={2}
                        required
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        placeholder="Ex: 5 ans de vente de solutions informatiques et équipements B2B à Dakar."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Compétences & Atouts</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="Ajouter une compétence (ex: Négociation, IT, Réseau local)"
                          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
                        >
                          Ajouter
                        </button>
                      </div>

                      {formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {formData.skills.map((sk) => (
                            <span key={sk} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                              {sk}
                              <button type="button" onClick={() => handleRemoveSkill(sk)} className="hover:text-amber-100">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Lien LinkedIn (Optionnel)</label>
                        <input
                          type="url"
                          value={formData.linkedinUrl}
                          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/monprofil"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Portfolio / Site Web (Optionnel)</label>
                        <input
                          type="url"
                          value={formData.portfolioUrl}
                          onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                          placeholder="https://mon-portfolio.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour</span>
                      </button>

                      <button
                        type="button"
                        disabled={!formData.profession || !formData.experience}
                        onClick={() => setStep(3)}
                        className="flex-1 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                      >
                        <span>Continuer (3/4) : Votre Réseau</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: DOMAINES DE CONTACTS */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-400" />
                        <span>Domaines dans lesquels vous avez des contacts</span>
                      </h3>
                      <p className="text-xs text-slate-400">Cochez les secteurs d'activités avec lesquels vous collaborez régulièrement.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                      {availableDomains.map((dom) => {
                        const isChecked = formData.contactDomains.includes(dom.id);
                        return (
                          <div
                            key={dom.id}
                            onClick={() => handleDomainToggle(dom.id)}
                            className={`p-3 rounded-2xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                              isChecked
                                ? "bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-sm"
                                : "bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            <span>{dom.label}</span>
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                              isChecked ? "bg-amber-500 border-amber-400 text-slate-950" : "border-slate-700 bg-slate-900"
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                      💡 <strong>Règle de protection :</strong> Plus vos secteurs de réseau sont ciblés, plus vite vos prospects seront vérifiés et sécurisés sous votre numéro d'ambassadeur unique.
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour</span>
                      </button>

                      <button
                        type="button"
                        disabled={formData.contactDomains.length === 0}
                        onClick={() => setStep(4)}
                        className="flex-1 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                      >
                        <span>Continuer (4/4) : Motivation</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: CANAUX & MOTIVATION */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-amber-400" />
                        <span>Canaux de communication & Motivation</span>
                      </h3>
                      <p className="text-xs text-slate-400">Dernière étape avant la soumission de votre dossier.</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Réseaux sociaux actifs</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          placeholder="WhatsApp (+221...)"
                          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <input
                          type="text"
                          value={formData.linkedin}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                          placeholder="LinkedIn"
                          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          value={formData.facebook}
                          onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                          placeholder="Facebook"
                          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          value={formData.instagram}
                          onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                          placeholder="Instagram / TikTok"
                          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Quelle est votre principale motivation pour rejoindre SEN AURA TECH ? *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formData.motivation}
                        onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                        placeholder="Expliquez brièvement comment vous comptez recommander nos solutions et développer votre réseau d'ambassadeur..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || !formData.motivation}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-yellow-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 animate-spin" />
                            <span>Envoi en cours...</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            <span>Soumettre ma candidature ambassadeur</span>
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
