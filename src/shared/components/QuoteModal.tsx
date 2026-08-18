import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Send,
  CheckCircle2,
  FileText,
  Clock,
  MapPin,
  Layers,
  Sparkles,
  ShieldCheck,
  Tag,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { store } from "../../database/store";
import { BRAND_CONFIG } from "../../config/constants";
import { PoleType, QuoteRequestDTO } from "../contracts/types";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPole?: PoleType;
  defaultServiceTitle?: string;
  onOpenAuthModal?: () => void;
}

const POLE_OPTIONS_MAP: Record<PoleType, string[]> = {
  SOLUTIONS_NUMERIQUES: [
    "Application Web & Mobile",
    "Design UI/UX & Prototypes",
    "Paiements Wave / OM intégrés",
    "Intelligence Artificielle & Agents",
    "Hébergement Cloud Sécurisé",
    "Maintenance & Support 12 Mois",
  ],
  INFRASTRUCTURES_TECHNIQUES: [
    "Vidéosurveillance CCTV IP",
    "Kit Solaire Photovoltaïque",
    "Câblage Réseau & Baie de Brassage",
    "Contrôle d'Accès Biométrique",
    "Domotique & Objets Connectés",
    "Audit & Mise en Conformité",
  ],
  CONSEIL: [
    "Audit de Sécurité & Pentesting",
    "Schéma Directeur & Roadmap IT",
    "Assistance à Maîtrise d'Ouvrage (AMO)",
    "Transformation Digitale",
    "Accompagnement & Formation Équipes",
  ],
  ACADEMY: [
    "Formation Entreprise sur-mesure",
    "Certification Développeur Full-Stack",
    "Bootcamp IA & Automatisation",
    "Ateliers Pratiques sur Site",
    "Suivi Pédagogique Individuel",
  ],
  MARKETPLACE: [
    "Intervention Express (< 4h)",
    "Contrat d'Entretien Annuel",
    "Technicien Dédié sur Chantier",
    "Garantie Pièces & Main d'Œuvre",
  ],
  BOUTIQUE: [
    "Commande Groupée / Matériel Pro",
    "Livraison Express Partout au Sénégal",
    "Installation & Mise en Service",
    "Garantie Constructeur 12/24 Mois",
  ],
};

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  defaultPole = "SOLUTIONS_NUMERIQUES",
  defaultServiceTitle = "Développement Solution Sur-Mesure",
  onOpenAuthModal,
}) => {
  const [pole, setPole] = useState<PoleType>(defaultPole);
  const [serviceTitle, setServiceTitle] = useState<string>(defaultServiceTitle);
  const [projectType, setProjectType] = useState<string>("Création / Nouveau Projet");
  const [timeframe, setTimeframe] = useState<string>("Standard (1 à 2 semaines)");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [budgetFCFA, setBudgetFCFA] = useState<number>(500000);
  const [description, setDescription] = useState<string>("");
  const [region, setRegion] = useState<string>("Dakar");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quoteCreated, setQuoteCreated] = useState<string | null>(null);

  // Restore or initialize data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Check if draft exists
      const draft = store.getQuoteDraft();
      if (draft && draft.serviceTitle) {
        setPole(draft.pole || defaultPole);
        setServiceTitle(draft.serviceTitle || defaultServiceTitle);
        setDescription(draft.description || "");
        setBudgetFCFA(draft.budgetFCFA || 500000);
        setRegion(draft.region || "Dakar");
        setTimeframe(draft.timeframe || "Standard (1 à 2 semaines)");
        setSelectedOptions(draft.options || []);
      } else {
        setPole(defaultPole);
        setServiceTitle(defaultServiceTitle);
      }

      setQuoteCreated(null);

      // Stop Lenis smooth scroll while popup is open so background never scrolls
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
  }, [isOpen, defaultPole, defaultServiceTitle, onClose]);

  if (!isOpen) return null;

  const toggleOption = (opt: string) => {
    if (selectedOptions.includes(opt)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== opt));
    } else {
      setSelectedOptions([...selectedOptions, opt]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Check user authentication
    const isLoggedIn = store.isLoggedIn && store.currentUser && store.currentUser.id !== "guest";

    if (!isLoggedIn) {
      // User is NOT logged in: Save full draft and prompt login/register
      store.saveQuoteDraft({
        pole,
        serviceTitle,
        description,
        budgetFCFA,
        region,
        options: selectedOptions,
        timeframe,
      });

      onClose();
      if (onOpenAuthModal) {
        onOpenAuthModal();
      }
      return;
    }

    // 2. User IS logged in: submit quote directly with user coordinates bound in background
    setIsSubmitting(true);

    const newQuoteId = `SAT-DEV-${Math.floor(100000 + Math.random() * 900000)}`;
    const quotePayload: QuoteRequestDTO = {
      id: newQuoteId,
      userId: store.currentUser.id,
      userName: store.currentUser.fullName || "Client SEN AURA",
      userPhone: store.currentUser.phone || "+221 77 000 00 00",
      userEmail: store.currentUser.email || undefined,
      userRegion: store.currentUser.region || region,
      pole,
      serviceTitle,
      description,
      region,
      budgetFCFA,
      options: selectedOptions,
      timeframe,
      status: "EN_ATTENTE",
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/quotes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quotePayload),
      });

      const data = await res.json();
      const confirmedId = data.quoteId || newQuoteId;

      store.addQuote({
        ...quotePayload,
        id: confirmedId,
      });

      store.clearQuoteDraft();
      setIsSubmitting(false);
      setQuoteCreated(confirmedId);
    } catch {
      store.addQuote(quotePayload);
      store.clearQuoteDraft();
      setIsSubmitting(false);
      setQuoteCreated(newQuoteId);
    }
  };

  const isUserAuthenticated = store.isLoggedIn && store.currentUser && store.currentUser.id !== "guest";
  const availableOptions = POLE_OPTIONS_MAP[pole] || POLE_OPTIONS_MAP.SOLUTIONS_NUMERIQUES;

  return createPortal(
    <div
      id="quote-modal-backdrop"
      role="dialog"
      aria-modal="true"
      data-lenis-prevent="true"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-hidden"
    >
      <div
        id="quote-modal-card"
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[760px] my-auto flex flex-col bg-slate-900 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-2.5 shrink-0 overflow-hidden transition-all duration-300 text-slate-100 max-h-[92vh] overflow-y-auto"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-quote-modal"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer z-20"
          aria-label="Fermer la boîte de dialogue"
          title="Fermer"
        >
          <X className="w-5 h-5 text-slate-300 hover:text-white" />
        </button>

        {/* Header */}
        <div className="text-center space-y-0.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-base font-black text-white">
            Demande de Devis & Étude Technique
          </h2>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
            Spécifiez les caractéristiques de votre projet. Étude gratuite sans aucun engagement.
          </p>
        </div>

        {quoteCreated ? (
          /* STEP 4 & 5: CONFIRMATION VIEW (NO PDF DOWNLOAD BEFORE ADMIN APPROVAL) */
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800 text-center space-y-3.5 animate-in fade-in duration-200">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Clock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-white">
                Demande de Devis Enregistrée avec Succès !
              </h4>
              <p className="text-xs text-slate-300">
                Référence dossier :{" "}
                <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                  {quoteCreated}
                </span>
              </p>
            </div>

            {/* Workflow Notice Banner */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Statut : En cours d'analyse par l'équipe d'ingénieurs</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Nos ingénieurs et experts examinent vos spécifications techniques pour établir une proposition tarifaire détaillée et optimisée.
              </p>
              <div className="pt-1.5 border-t border-amber-500/20 flex flex-col sm:flex-row justify-between text-[10px] text-slate-400 gap-1">
                <span>⏱️ Délai de réponse : <strong>Moins de 24h</strong></span>
                <span>📄 PDF officiel : <strong>Disponible dès validation admin</strong></span>
              </div>
            </div>

            {/* Project Recap */}
            <div className="text-left bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 max-w-lg mx-auto">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Intitulé :</span>
                <span className="font-semibold text-slate-200 text-right truncate max-w-[260px]">
                  {serviceTitle}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Pôle :</span>
                <span className="font-semibold text-amber-400 text-right">
                  {pole.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Délai souhaité :</span>
                <span className="font-semibold text-slate-200">
                  {timeframe}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Budget estimé indicatif :</span>
                <span className="font-mono font-bold text-emerald-400">
                  {Math.round(budgetFCFA).toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>

            {/* Action Buttons Post-Submission */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
              <button
                type="button"
                onClick={() => {
                  setQuoteCreated(null);
                  onClose();
                  // Direct to dashboard if available
                  if (typeof (window as any).__navigateToTab === "function") {
                    (window as any).__navigateToTab("dashboard");
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Consulter mes Devis dans l'Espace Client</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuoteCreated(null);
                  onClose();
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          /* QUOTE SPECIFICATIONS FORM (NO PII / PERSONAL INFO FIELDS) */
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Logged-In User Banner */}
            {isUserAuthenticated ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    Connecté en tant que <strong className="text-white">{store.currentUser.fullName}</strong> ({store.currentUser.phone})
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Compte Associé ✓
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Vos coordonnées seront liées automatiquement après validation de votre compte en 1 clic.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {/* SECTION 1: CADRAGE & SERVICE */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-800/80">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <h3 className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">
                    1. Cadrage Technique
                  </h3>
                </div>

                {/* Pôle d'Expertise */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Pôle d'Expertise <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={pole}
                    onChange={(e) => {
                      const newPole = e.target.value as PoleType;
                      setPole(newPole);
                      setSelectedOptions([]);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="SOLUTIONS_NUMERIQUES">Pôle 1 : Solutions Numériques & Logiciels</option>
                    <option value="INFRASTRUCTURES_TECHNIQUES">Pôle 2 : Infrastructures, Solaire & Réseaux</option>
                    <option value="CONSEIL">Pôle 3 : Conseil, Audit & Cybersécurité</option>
                    <option value="ACADEMY">Pôle 4 : Academy & Formations Certifiantes</option>
                    <option value="MARKETPLACE">Pôle 5 : Marketplace & Interventions Experts</option>
                    <option value="BOUTIQUE">Pôle 6 : Matériel & Équipements Pro</option>
                  </select>
                </div>

                {/* Intitulé du projet */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Intitulé de la Prestation / Projet <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    placeholder="Ex: ERP de gestion de stock, Installation solaire 10KVA..."
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white text-xs focus:outline-none transition-colors"
                  />
                </div>

                {/* Type de Projet & Délai souhaité */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                      Nature du Projet
                    </label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px] focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Création / Nouveau Projet">Création / Neuf</option>
                      <option value="Refonte & Évolution">Refonte / Évolution</option>
                      <option value="Maintenance & Audit">Maintenance / Audit</option>
                      <option value="Déploiement Clé en Main">Clé en Main</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                      Échéance / Délai
                    </label>
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px] focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Urgent (< 1 semaine)">⚡ Urgent (&lt; 1 sem)</option>
                      <option value="Standard (1 à 2 semaines)">1 à 2 semaines</option>
                      <option value="Moyen terme (1 mois)">1 mois</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                {/* Localité / Région */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Zone géographique du projet
                  </label>
                  <div className="relative">
                    <MapPin className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full pl-7 pr-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
                    >
                      {BRAND_CONFIG.regions.map((r) => (
                        <option key={r} value={r}>
                          {r} (Sénégal)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: SPÉCIFICATIONS & OPTIONS */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-800/80">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <h3 className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">
                    2. Options & Spécifications
                  </h3>
                </div>

                {/* Interactive Options Tags */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Options / Composants souhaités</span>
                    <span className="text-slate-500 text-[9px]">Sélection multiple</span>
                  </label>
                  <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto pr-1">
                    {availableOptions.map((opt) => {
                      const isSelected = selectedOptions.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleOption(opt)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1 ${
                            isSelected
                              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                          }`}
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget indicatif (FCFA) */}
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="text-[10px] font-semibold text-slate-300">
                      Budget indicatif (FCFA)
                    </label>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {budgetFCFA.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <input
                    type="number"
                    step={25000}
                    min={50000}
                    value={budgetFCFA}
                    onChange={(e) => setBudgetFCFA(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Cahier des charges & Besoins */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Cahier des charges & Description <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez vos exigences, fonctionnalités attendues et contraintes..."
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white text-xs focus:outline-none transition-colors resize-none leading-normal"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <button
                id="btn-quote-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span>Transmission sécurisée...</span>
                ) : isUserAuthenticated ? (
                  <>
                    <Send className="w-4 h-4 text-slate-950 shrink-0 stroke-[2.5]" />
                    <span className="font-black">Soumettre ma Demande de Devis</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-slate-950 shrink-0 stroke-[2.5]" />
                    <span className="font-black">Continuer & Associer à mon Compte</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Étude technique sans engagement • Devis PDF officiel publié après validation de l'administrateur</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
