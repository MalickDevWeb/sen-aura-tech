import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Check,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Phone,
  ArrowRight,
  ArrowLeft,
  Lock,
  Zap,
  Clock,
  Award,
  CreditCard,
  MapPin,
  Building,
  User,
  HelpCircle,
  Layers,
} from "lucide-react";
import confetti from "canvas-confetti";
import { store } from "../../../database/store";
import { ProfileType } from "../../../shared/contracts/types";
import { PROFILES_METADATA, SubscriptionPlanDefinition, UPCOMING_PROFILES_CATALOG } from "../../../config/profilesConfig";
import { formatCurrency } from "../../../shared/utils/formatters";

interface ActivateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile?: ProfileType;
  currency?: string;
  onSuccess?: (activatedProfile: ProfileType) => void;
}

export const ActivateProfileModal: React.FC<ActivateProfileModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
  currency = "XOF",
  onSuccess,
}) => {
  // Steps: 1 = Choose Profile, 2 = Profile Info, 3 = Choose Plan & Pay, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = useState<ProfileType>(
    initialProfile && initialProfile !== "CLIENT" && initialProfile !== "ADMIN"
      ? initialProfile
      : "VENDEUR"
  );

  // Profile specific inputs
  const [displayName, setDisplayName] = useState(store.currentUser.fullName || "");
  const [companyOrBoutiqueName, setCompanyOrBoutiqueName] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [professionOrCategory, setProfessionOrCategory] = useState("Développement & Solutions IT");
  const [bioOrDescription, setBioOrDescription] = useState("");
  const [region, setRegion] = useState(store.currentUser.region || "Dakar");
  const [activityPhone, setActivityPhone] = useState(
    store.currentUser.phone && store.currentUser.phone !== "+221"
      ? store.currentUser.phone
      : "+221 77 000 00 00"
  );

  // Subscription plan selection
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [isFreeTrialMode, setIsFreeTrialMode] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"WAVE" | "ORANGE_MONEY" | "FREE_MONEY" | "CARD">("WAVE");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (initialProfile && initialProfile !== "CLIENT" && initialProfile !== "ADMIN") {
      setSelectedType(initialProfile);
      setStep(2);
    }
  }, [initialProfile]);

  useEffect(() => {
    // Set default plan based on selected type
    const meta = PROFILES_METADATA[selectedType];
    if (meta && meta.subscriptionPlans.length > 0) {
      const popularOrFirst = meta.subscriptionPlans.find((p) => p.popular) || meta.subscriptionPlans[0];
      setSelectedPlanId(popularOrFirst.id);
    }
  }, [selectedType]);

  if (!isOpen) return null;

  const currentMeta = PROFILES_METADATA[selectedType] || PROFILES_METADATA.VENDEUR;
  const currentPlan = currentMeta.subscriptionPlans.find((p) => p.id === selectedPlanId) || currentMeta.subscriptionPlans[0];
  const priceToPay = isFreeTrialMode
    ? 0
    : billingCycle === "YEARLY"
    ? currentPlan.priceYearlyFCFA
    : currentPlan.priceMonthlyFCFA;

  const handleActivate = () => {
    setIsProcessing(true);

    setTimeout(() => {
      store.activateProfile(
        selectedType,
        {
          displayName,
          companyOrBoutiqueName: selectedType === "VENDEUR" ? companyOrBoutiqueName || `Boutique ${displayName}` : undefined,
          academyName: selectedType === "FORMATEUR" ? academyName || `Academy ${displayName}` : undefined,
          professionOrCategory: selectedType === "PROFESSIONAL" ? professionOrCategory : undefined,
          bioOrDescription,
          region,
        },
        {
          planId: currentPlan.id,
          planName: currentPlan.name,
          billingCycle: isFreeTrialMode ? "MONTHLY" : billingCycle,
          priceFCFA: currentPlan.priceMonthlyFCFA,
          paymentMethod: isFreeTrialMode ? "FREE" : paymentMethod,
          isTrial: isFreeTrialMode,
        }
      );

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      setIsProcessing(false);
      setStep(4);
    }, 800);
  };

  const selectableProfiles: ProfileType[] = ["VENDEUR", "PROFESSIONAL", "FORMATEUR"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => {
          if (step !== 4 && !isProcessing) onClose();
        }}
      />

      <div className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>COMPTE UNIQUE MULTI-PROFILS</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Étape {step}/3
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {step === 1 && "Choisissez l'Espace Professionnel à Activer"}
              {step === 2 && `Configuration de votre ${currentMeta.title}`}
              {step === 3 && `Formule d'Abonnement pour votre ${currentMeta.title}`}
              {step === 4 && "🎉 Profil Activé avec Succès !"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CHOOSE PROFILE */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <p className="text-xs text-slate-300">
              Votre compte reste unique avec votre e-mail et mot de passe actuels. Vous pourrez passer d'un profil à un autre en 1 clic sans vous déconnecter.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {selectableProfiles.map((pType) => {
                const meta = PROFILES_METADATA[pType];
                const isSelected = selectedType === pType;
                const isAlreadyActive = store.isProfileActive(pType);

                return (
                  <div
                    key={pType}
                    onClick={() => {
                      setSelectedType(pType);
                    }}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10 scale-[1.02]"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{meta.emoji}</span>
                        {isAlreadyActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            Déjà Actif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                            Abonnement
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white">{meta.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                        {meta.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-400 font-bold">
                      <span>Dès {formatCurrency(meta.subscriptionPlans[0]?.priceMonthlyFCFA || 15000, currency)}/m</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 text-slate-300">
              <p className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Indépendance Totale des Abonnements :</span>
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Chaque profil possède son propre abonnement distinct. Votre espace Client reste 100% gratuit à vie. Vous pouvez cumuler plusieurs activités professionnelles (ex: Vendeur + Formateur) sous un même compte unique.
              </p>
            </div>

            {/* UPCOMING EXTENSIBLE PROFILES ARCHITECTURE */}
            <div className="pt-1">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Architecture Évolutive — Nouveaux profils bientôt disponibles :</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/80 font-bold">Roadmap</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {UPCOMING_PROFILES_CATALOG.map((up) => (
                    <div
                      key={up.id}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-0.5"
                      title={up.description}
                    >
                      <span className="text-base">{up.emoji}</span>
                      <p className="text-[10px] font-bold text-slate-300 truncate">{up.title}</p>
                      <p className="text-[8px] text-slate-500 truncate">{up.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>Continuer vers les détails</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROFILE DETAILS */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-2xl">{currentMeta.emoji}</span>
              <div>
                <h4 className="text-xs font-bold text-white">Profil : {currentMeta.title}</h4>
                <p className="text-[11px] text-slate-400">{currentMeta.subtitle}</p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedType === "VENDEUR" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nom Commercial de votre Boutique :</span>
                  </label>
                  <input
                    type="text"
                    value={companyOrBoutiqueName}
                    onChange={(e) => setCompanyOrBoutiqueName(e.target.value)}
                    placeholder="Ex: Dakar Tech Express, Solaire Plus Sénégal..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none"
                  />
                </div>
              )}

              {selectedType === "FORMATEUR" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Nom de votre Academy ou Établissement :</span>
                  </label>
                  <input
                    type="text"
                    value={academyName}
                    onChange={(e) => setAcademyName(e.target.value)}
                    placeholder="Ex: SEN AURA Academy, Institut Numérique Dakar..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none"
                  />
                </div>
              )}

              {selectedType === "PROFESSIONAL" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Métier / Spécialité Professionnelle :</span>
                  </label>
                  <select
                    value={professionOrCategory}
                    onChange={(e) => setProfessionOrCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none"
                  >
                    <option value="Informaticien / Développeur / Expert IA">Informaticien / Développeur Web, Mobile & IA</option>
                    <option value="Architecte & Ingénieur BTP">Architecte & Ingénieur BTP</option>
                    <option value="Comptable & Expert-Comptable / Audit">Comptable & Expert-Comptable / Audit</option>
                    <option value="Consultant Stratégie & SI">Consultant Stratégie, Management & SI</option>
                    <option value="Électricien Bâtiment & Industriel">Électricien Bâtiment & Industriel</option>
                    <option value="Plombier & Installateur Sanitaire">Plombier & Installateur Sanitaire</option>
                    <option value="Designer UI/UX & Graphiste">Designer UI/UX & Graphiste Multimédia</option>
                    <option value="Juriste & Conseil Affaires">Juriste & Conseil d'Affaires</option>
                    <option value="Médecin & Santé (selon réglementation)">Médecin & Professionnel de Santé (selon réglementation)</option>
                    <option value="Coach Professionnel & Formateur">Coach Professionnel & Développement Personnel</option>
                    <option value="Énergie Solaire & Onduleurs">Technicien Solaire & Énergies Renouvelables</option>
                    <option value="Réseaux, Fibre & Vidéosurveillance">Infrastructures Réseaux, Fibre & Caméras</option>
                    <option value="Climatisation & Froid">Climatisation & Froid Industriel</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Région / Siège :</span>
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none"
                  >
                    {["Dakar", "Thiès", "Saint-Louis", "Diourbel", "Kaolack", "Ziguinchor", "Tambacounda", "Fatick", "Kolda", "Matam", "Louga", "Sédhiou", "Kaffrine", "Kédougou"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Téléphone Pro / WhatsApp :</span>
                  </label>
                  <input
                    type="text"
                    value={activityPhone}
                    onChange={(e) => setActivityPhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Description / Présentation de votre activité :
                </label>
                <textarea
                  rows={3}
                  value={bioOrDescription}
                  onChange={(e) => setBioOrDescription(e.target.value)}
                  placeholder="Décrivez brièvement vos prestations, votre expérience ou les équipements que vous distribuez..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>

              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>Choisir la Formule d'Abonnement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE SUBSCRIPTION PLAN & PAYMENT */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Free Trial Banner / Toggle */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-amber-500/15 to-emerald-500/20 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Offre de Lancement : 30 Jours d'Essai Gratuit Offerts</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                  0 FCFA AUJOURD'HUI
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trialCheckbox"
                  checked={isFreeTrialMode}
                  onChange={(e) => setIsFreeTrialMode(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="trialCheckbox" className="text-xs text-slate-200 cursor-pointer font-medium">
                  Activer immédiatement avec les <strong>30 jours d'essai 100% gratuit</strong> sans engagement
                </label>
              </div>
            </div>

            {/* Billing cycle toggle if not in pure trial */}
            {!isFreeTrialMode && (
              <div className="flex items-center justify-center gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setBillingCycle("MONTHLY")}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    billingCycle === "MONTHLY" ? "bg-amber-500 text-slate-950" : "text-slate-400"
                  }`}
                >
                  Mensuel
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("YEARLY")}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    billingCycle === "YEARLY" ? "bg-amber-500 text-slate-950" : "text-slate-400"
                  }`}
                >
                  <span>Annuel</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 text-[9px]">
                    -17%
                  </span>
                </button>
              </div>
            )}

            {/* Plans List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentMeta.subscriptionPlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const price = billingCycle === "YEARLY" ? plan.priceYearlyFCFA : plan.priceMonthlyFCFA;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 scale-[1.02]"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{plan.name}</span>
                        {plan.popular && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black">
                            Populaire
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-amber-400 font-mono">
                          {formatCurrency(price, currency)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          /{billingCycle === "YEARLY" ? "an" : "mois"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{plan.description}</p>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-800 text-[10px] text-slate-300">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Selector if not free */}
            {!isFreeTrialMode && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-300">
                  Moyen de Paiement pour l'Abonnement :
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "WAVE", name: "Wave Sénégal", icon: "🌊" },
                    { id: "ORANGE_MONEY", name: "Orange Money", icon: "🍊" },
                    { id: "FREE_MONEY", name: "Free Money", icon: "🆓" },
                    { id: "CARD", name: "Carte Bancaire", icon: "💳" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        paymentMethod === m.id
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md"
                          : "bg-slate-950 text-slate-300 border-slate-800"
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span className="text-[11px]">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>

              <button
                onClick={handleActivate}
                disabled={isProcessing}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
              >
                {isProcessing ? (
                  <span>Activation en cours...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>
                      {isFreeTrialMode
                        ? "Activer l'Essai Gratuit 30 Jours"
                        : `Régler ${formatCurrency(priceToPay, currency)} & Activer`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/20">
              {currentMeta.emoji}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">
                Félicitations ! Votre profil {currentMeta.title} est Actif !
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Votre espace d'activité a été immédiatement rattaché à votre compte unique. Vous pouvez maintenant gérer vos services, vos commandes et vos clients.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 max-w-sm mx-auto space-y-1">
              <p className="font-bold text-amber-400">Abonnement : {currentPlan.name}</p>
              <p className="text-[11px] text-slate-400">
                {isFreeTrialMode ? "Période d'essai gratuit de 30 jours active." : "Abonnement régularisé avec succès."}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onSuccess?.(selectedType);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 cursor-pointer"
              >
                Accéder à mon Nouvel Espace {currentMeta.title}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
