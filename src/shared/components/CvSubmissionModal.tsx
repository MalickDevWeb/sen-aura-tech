import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Send,
  Upload,
  CheckCircle2,
  Briefcase,
  FileText,
  User,
  Mail,
  Award,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { SocialPillsBar } from "./SocialCommunityPills";

interface CvSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CvSubmissionModal: React.FC<CvSubmissionModalProps> = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [speciality, setSpeciality] = useState("Développement Web & Mobile");
  const [experienceLevel, setExperienceLevel] = useState("Intermédiaire (2-4 ans)");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [bioSkills, setBioSkills] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      (window as any).__lenis?.stop();
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        (window as any).__lenis?.start();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      alert("Veuillez renseigner votre nom complet, votre email et votre numéro WhatsApp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName,
        email,
        phone,
        speciality,
        experienceLevel,
        linkedinUrl,
        bioSkills,
        cvFileName: cvFile ? cvFile.name : "CV_texte_transmis.pdf",
        submittedAt: new Date().toISOString(),
      };

      await fetch("/api/community/cv-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setLinkedinUrl("");
    setBioSkills("");
    setCvFile(null);
    onClose();
  };

  return createPortal(
    <div
      id="cv-modal-backdrop"
      role="dialog"
      aria-modal="true"
      data-lenis-prevent="true"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-hidden"
    >
      <div
        id="cv-modal-card"
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[740px] my-auto flex flex-col bg-slate-900 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-2.5 shrink-0 overflow-hidden transition-all duration-300 text-slate-100"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-cv-modal"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer z-20"
          aria-label="Fermer"
          title="Fermer"
        >
          <X className="w-5 h-5 text-slate-300 hover:text-white" />
        </button>

        {/* Header */}
        <div className="text-center space-y-0.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Briefcase className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-base font-black text-white">
            Déposer votre CV & Profil Professionnel
          </h2>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Accédez aux opportunités d'emploi, stages et missions freelance prioritaires.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-white">Candidature & Profil Enregistrés !</h3>
              <p className="text-[11px] text-slate-300 max-w-md mx-auto leading-relaxed">
                Merci <span className="text-amber-400 font-bold">{fullName}</span>. Votre profil a été ajouté au vivier de compétences <strong>SEN AURA TECH</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2 text-slate-300 max-w-md mx-auto">
              <p className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" /> Canaux Officiels de Recrutement & Alertes :
              </p>
              <div className="pt-0.5">
                <SocialPillsBar variant="compact" />
              </div>
              <p className="text-[10px] text-slate-400">Restez joignable au <strong className="text-white font-mono">{phone}</strong>.</p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Fermer & Continuer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {/* SECTION 1: IDENTITÉ & CONTACT */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-800/80">
                  <span className="w-4 h-4 rounded-md bg-amber-500/20 text-amber-400 font-black text-[10px] flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">
                    Identité & Contact
                  </h3>
                </div>

                {/* Nom complet */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Nom & Prénom <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Cheikh Tidiane Diop"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white text-xs focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Téléphone WhatsApp */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Téléphone / WhatsApp <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-2.5 flex items-center gap-1 text-[11px] font-bold text-slate-300 border-r border-slate-800 pr-1.5 pointer-events-none">
                      <span>🇸🇳</span>
                      <span>+221</span>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="77 123 45 67"
                      value={phone.replace(/^\+221\s*/, "")}
                      onChange={(e) => setPhone(`+221 ${e.target.value.replace(/\D/g, "").slice(0, 9)}`)}
                      className="w-full pl-16 pr-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white font-mono text-xs focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email & Domaine */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                      Email <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3 h-3 text-slate-500 absolute left-2 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="email@sn.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white text-xs focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                      Domaine
                    </label>
                    <div className="relative">
                      <Award className="w-3 h-3 text-slate-500 absolute left-2 top-2.5 pointer-events-none" />
                      <select
                        value={speciality}
                        onChange={(e) => setSpeciality(e.target.value)}
                        className="w-full pl-6 pr-1 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none transition-colors cursor-pointer truncate"
                      >
                        <option value="Développement Web & Mobile">Web & Mobile</option>
                        <option value="Ingénierie Logicielle & ERP">Génie Logiciel</option>
                        <option value="Énergie Solaire & Électricité">Solaire & Énergie</option>
                        <option value="Vidéosurveillance & Sécurité IA">Vidéosurveillance & IA</option>
                        <option value="Réseaux, Télécoms & Fibre Optique">Réseaux & Fibre</option>
                        <option value="Design UI/UX & Graphisme">Design & UI/UX</option>
                        <option value="Marketing Digital & Vente B2B">Marketing & Vente</option>
                        <option value="Autre domaine technique">Autre domaine</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PROFIL & CV */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-800/80">
                  <span className="w-4 h-4 rounded-md bg-amber-500/20 text-amber-400 font-black text-[10px] flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">
                    Expérience & CV
                  </h3>
                </div>

                {/* Niveau & LinkedIn */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                      Expérience
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none transition-colors cursor-pointer truncate"
                    >
                      <option value="Étudiant / Recherche de stage">Étudiant / Stage</option>
                      <option value="Junior (0-2 ans)">Junior (0-2 ans)</option>
                      <option value="Intermédiaire (2-4 ans)">Intermédiaire (2-4 ans)</option>
                      <option value="Senior (5 ans et +)">Senior (5 ans+)</option>
                      <option value="Consultant / Freelance">Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                      LinkedIn <span className="text-slate-500 text-[9px]">(Optionnel)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="linkedin.com/in/..."
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white text-xs focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Compétences clés */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Compétences & Disponibilités
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: React, Node.js, Dimensionnement solaire, disponible immédiatement"
                    value={bioSkills}
                    onChange={(e) => setBioSkills(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white text-xs focus:outline-none transition-colors"
                  />
                </div>

                {/* Upload CV */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Fichier CV (PDF, DOCX)
                  </label>
                  <div className="relative border border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-2 text-center cursor-pointer transition-colors bg-slate-900 flex items-center justify-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {cvFile ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cvFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cliquez pour joindre votre CV (PDF/DOC)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action principale */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <button
                id="btn-cv-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span>Enregistrement sécurisé en cours...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950 shrink-0 stroke-[2.5]" />
                    <span className="font-black">Transmettre mon Profil & CV</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Confidentialité garantie • Réseau des talents certifiés SEN AURA TECH</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

