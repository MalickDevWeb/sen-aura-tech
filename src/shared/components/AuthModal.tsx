import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ShieldCheck,
  UserCheck,
  User,
  LogOut,
  MapPin,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Mail,
  Sparkles,
  ShieldAlert,
  Phone,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { store } from "../../database/store";
import { UserRole } from "../contracts/types";
import { BRAND_CONFIG } from "../../config/constants";
import { AuthService } from "../../database/firebase";
import { getWhatsAppLink, generateForgotPinRequestWhatsAppMsg } from "../utils/whatsappHelper";
import { SecurityPinService } from "../../services/securityPinService";
import {
  sanitizeSenegalPhoneInput,
  formatSenegalPhone,
  detectSenegalCarrier,
} from "../utils/phoneValidator";
import {
  authLoginSchema,
  authRegisterSchema,
  validateWithZod,
} from "../../lib/validationSchemas";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("CLIENT");
  const [region, setRegion] = useState("Dakar");
  const [activateFreeTrial, setActivateFreeTrial] = useState(true);
  
  // Pro confirmation screen state
  const [proRegisteredModal, setProRegisteredModal] = useState<{
    isOpen: boolean;
    phone: string;
    fullName: string;
    role: UserRole;
    isTrial: boolean;
  } | null>(null);

  // Code PIN Secret
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const cleanDigits = sanitizeSenegalPhoneInput(phone);
  const carrierInfo = detectSenegalCarrier(cleanDigits);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (isRegisterMode) {
      const validation = validateWithZod(authRegisterSchema, {
        fullName: fullName.trim(),
        phone,
        email: email.trim(),
        pin,
        confirmPin,
        role: selectedRole,
        region,
      });

      if (!validation.success) {
        setFieldErrors(validation.errors);
        setError(validation.firstError);
        return;
      }

      setIsSubmitting(true);
      const cleanPhone = sanitizeSenegalPhoneInput(phone);
      const cleanEmail = email.trim();

      try {
        // 1. Vérification préalable d'unicité (Code + LocalStorage + Firestore + Neon DB)
        const uniqueness = await SecurityPinService.checkUniqueness({
          phone: cleanPhone,
          email: cleanEmail || undefined,
        });

        if (!uniqueness.available) {
          if (uniqueness.isPhoneTaken) {
            setFieldErrors((prev) => ({
              ...prev,
              phone: "Ce numéro est déjà enregistré.",
            }));
            setError("Ce numéro de téléphone est déjà associé à un compte. Veuillez basculer sur 'Se Connecter' pour entrer votre Code PIN.");
          } else if (uniqueness.isEmailTaken) {
            setFieldErrors((prev) => ({
              ...prev,
              email: "Cette adresse email est déjà enregistrée.",
            }));
            setError("Cette adresse email est déjà enregistrée. Veuillez utiliser une autre adresse email.");
          } else {
            setError(uniqueness.error || "Un compte avec ces identifiants existe déjà.");
          }
          setIsSubmitting(false);
          return;
        }

        const cleanName = fullName.trim() || `Utilisateur ${cleanPhone}`;
        const isPro = selectedRole === "PROFESSIONAL" || selectedRole === "FORMATEUR" || selectedRole === "VENDEUR";
        const willActivateTrial = isPro && activateFreeTrial;

        const regRes = await SecurityPinService.registerAccount({
          phone: cleanPhone,
          email: cleanEmail || undefined,
          fullName: cleanName,
          pin,
          role: selectedRole,
          region,
          activateFreeTrial: willActivateTrial,
        });

        if (!regRes.success) {
          setError(regRes.error || "Erreur lors de l'enregistrement du compte.");
          setIsSubmitting(false);
          return;
        }

        // Firebase sync
        const formattedEmail = cleanEmail || `${cleanPhone}@senauratech.sn`;
        const defaultPassword = `PIN-${pin}-${cleanPhone}`;
        AuthService.signUp(formattedEmail, defaultPassword, cleanName, phone, selectedRole, region).catch(() => null);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#25D366", "#008751", "#FFCC00", "#38BDF8"],
        });

        store.loginWithPhone(
          phone,
          cleanName,
          selectedRole,
          region,
          pin,
          regRes.account?.proStatus,
          regRes.account?.trialExpiresAt,
          regRes.account?.proApproved
        );

        setIsSubmitting(false);

        // Si compte professionnel (prestataire, formateur ou vendeur), afficher la boîte de confirmation spécifique
        if (isPro) {
          setProRegisteredModal({
            isOpen: true,
            phone: cleanPhone,
            fullName: cleanName,
            role: selectedRole,
            isTrial: willActivateTrial,
          });
          return;
        }

        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        setError(err?.message || "Erreur lors de l'enregistrement du compte.");
        setIsSubmitting(false);
      }
    } else {
      const validation = validateWithZod(authLoginSchema, {
        phone,
        pin,
      });

      if (!validation.success) {
        setFieldErrors(validation.errors);
        setError(validation.firstError);
        return;
      }

      setIsSubmitting(true);
      const cleanPhone = sanitizeSenegalPhoneInput(phone);

      try {
        const authRes = await SecurityPinService.authenticate(cleanPhone, pin);

        if (!authRes.success) {
          if (authRes.error && authRes.error.includes("n'a pas encore de compte")) {
            setIsRegisterMode(true);
            setError("Numéro non enregistré. Veuillez définir votre Code PIN personnel pour créer votre compte.");
          } else {
            setError(authRes.error || "Code PIN incorrect.");
          }
          setIsSubmitting(false);
          return;
        }

        const account = authRes.account!;
        const cleanName = account.fullName || `Utilisateur ${cleanPhone}`;
        const finalRole = account.role || "CLIENT";

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#25D366", "#008751", "#FFCC00", "#38BDF8"],
        });

        store.loginWithPhone(
          phone,
          cleanName,
          finalRole,
          account.region || "Dakar",
          pin,
          account.proStatus,
          account.trialExpiresAt,
          account.proApproved
        );

        setIsSubmitting(false);
        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        setError(err?.message || "Erreur lors de l'authentification.");
        setIsSubmitting(false);
      }
    }
  };

  const handleForgotPin = () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError("Veuillez renseigner votre numéro de téléphone d'abord.");
      return;
    }
    setError("");
    const msg = generateForgotPinRequestWhatsAppMsg(trimmedPhone, fullName);
    window.open(getWhatsAppLink("705334611", msg), "_blank");
  };

  return createPortal(
    <div
      id="auth-modal-backdrop"
      role="dialog"
      aria-modal="true"
      data-lenis-prevent="true"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-hidden"
    >
      <div 
        id="auth-modal-card"
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        className={`relative w-full ${
          isRegisterMode ? "max-w-[740px]" : "max-w-[420px]"
        } my-auto flex flex-col bg-slate-900 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-2.5 shrink-0 overflow-hidden transition-all duration-300`}
      >
        
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button - Seul moyen de fermer la modale */}
        <button
          id="btn-close-auth-modal"
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
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-base font-black text-white">
            {isRegisterMode ? "Créer un Compte Sécurisé" : "Portail Sécurisé SEN AURA"}
          </h2>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            {isRegisterMode
              ? "Complétez vos coordonnées et définissez votre Code PIN à 4 chiffres."
              : "Authentification rapide par Téléphone & Code PIN secret."}
          </p>
        </div>

        {/* Active user status if already logged in */}
        {store.isLoggedIn && (
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-slate-200 font-bold truncate text-xs">{store.currentUser.fullName}</p>
                <p className="text-[10px] text-emerald-400 font-mono">{store.currentUser.role} • {store.currentUser.phone}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                store.logout();
                onClose();
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-[10px] shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Déconnexion</span>
            </button>
          </div>
        )}

        {/* Mode Toggle Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setError("");
              setFieldErrors({});
            }}
            className={`flex-1 py-1.5 sm:py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              !isRegisterMode
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Se Connecter</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setError("");
              setFieldErrors({});
            }}
            className={`flex-1 py-1.5 sm:py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isRegisterMode
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Nouveau Compte</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-in fade-in shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="text-[11px] leading-snug flex-1">{error}</span>
          </div>
        )}

        {/* Main Form without inner scrollbars */}
        <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
          
          {isRegisterMode ? (
            /* DUAL SECTION LAYOUT POUR LA CRÉATION DE COMPTE (NON-SCROLLABLE) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* SECTION 1: COORDONNÉES & IDENTITÉ */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-800/80">
                  <span className="w-4 h-4 rounded-md bg-amber-500/20 text-amber-400 font-black text-[10px] flex items-center justify-center">1</span>
                  <h3 className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">Identité & Contact</h3>
                </div>

                {/* Nom complet */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Nom & Prénom <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) {
                        setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                      }
                      if (error) setError("");
                    }}
                    placeholder="Ex: Cheikh Diop"
                    className={`w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border ${
                      fieldErrors.fullName ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-800 focus:border-amber-500"
                    } text-white text-xs focus:outline-none transition-colors`}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-[10px] text-rose-400 mt-0.5 font-medium">{fieldErrors.fullName}</p>
                  )}
                </div>

                {/* Téléphone Sénégal */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[10px] font-semibold text-slate-300">
                      Téléphone <span className="text-amber-400">*</span>
                    </label>
                    {carrierInfo && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${carrierInfo.bg}`}>
                        {carrierInfo.name}
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-2.5 flex items-center gap-1 text-[11px] font-bold text-slate-300 border-r border-slate-700 pr-1.5 pointer-events-none">
                      <span>🇸🇳</span>
                      <span>+221</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => {
                        const rawDigits = sanitizeSenegalPhoneInput(e.target.value);
                        setPhone(formatSenegalPhone(rawDigits));
                        if (fieldErrors.phone) {
                          setFieldErrors((prev) => ({ ...prev, phone: "" }));
                        }
                        if (error) setError("");
                      }}
                      placeholder="77 123 45 67"
                      maxLength={12}
                      className={`w-full pl-18 pr-12 py-1.5 rounded-xl bg-slate-900 border ${
                        fieldErrors.phone ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-800 focus:border-amber-500"
                      } text-white font-mono text-xs focus:outline-none transition-colors`}
                    />
                    <div className="absolute right-2 text-[9px] font-mono text-slate-500 pointer-events-none">
                      {cleanDigits.length}/9
                    </div>
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-[10px] text-rose-400 mt-0.5 font-medium">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[10px] font-semibold text-slate-300">
                      Adresse Email
                    </label>
                    <span className="text-[9px] text-slate-400 font-normal">Optionnel</span>
                  </div>
                  <div className="relative flex items-center">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: "" }));
                        }
                        if (error) setError("");
                      }}
                      placeholder="contact@exemple.sn"
                      className={`w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-900 border ${
                        fieldErrors.email ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-800 focus:border-amber-500"
                      } text-white text-xs focus:outline-none transition-colors`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[10px] text-rose-400 mt-0.5 font-medium">{fieldErrors.email}</p>
                  )}
                </div>

              </div>

              {/* SECTION 2: SÉCURITÉ & ESPACE */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-800/80">
                  <span className="w-4 h-4 rounded-md bg-amber-500/20 text-amber-400 font-black text-[10px] flex items-center justify-center">2</span>
                  <h3 className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">Sécurité & Espace</h3>
                </div>

                {/* Code PIN (4 chiffres) et Confirmation */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                      Code PIN <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3 h-3 text-slate-500 absolute left-2 top-2.5" />
                      <input
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                          if (fieldErrors.pin) {
                            setFieldErrors((prev) => ({ ...prev, pin: "" }));
                          }
                          if (error) setError("");
                        }}
                        placeholder="••••"
                        className={`w-full pl-6 pr-6 py-1.5 rounded-xl bg-slate-900 border ${
                          fieldErrors.pin ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-800 focus:border-amber-500"
                        } text-white font-mono text-xs tracking-widest focus:outline-none transition-colors`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-1.5 top-2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                    {fieldErrors.pin && (
                      <p className="text-[9px] text-rose-400 mt-0.5 font-medium">{fieldErrors.pin}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                      Confirmer PIN <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3 h-3 text-slate-500 absolute left-2 top-2.5" />
                      <input
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        maxLength={4}
                        value={confirmPin}
                        onChange={(e) => {
                          setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                          if (fieldErrors.confirmPin) {
                            setFieldErrors((prev) => ({ ...prev, confirmPin: "" }));
                          }
                          if (error) setError("");
                        }}
                        placeholder="••••"
                        className={`w-full pl-6 pr-2 py-1.5 rounded-xl bg-slate-900 border ${
                          fieldErrors.confirmPin ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-800 focus:border-amber-500"
                        } text-white font-mono text-xs tracking-widest focus:outline-none transition-colors`}
                      />
                    </div>
                    {fieldErrors.confirmPin && (
                      <p className="text-[9px] text-rose-400 mt-0.5 font-medium">{fieldErrors.confirmPin}</p>
                    )}
                  </div>
                </div>

                {/* Région & Type d'espace */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                      Région
                    </label>
                    <div className="relative">
                      <MapPin className="w-3 h-3 text-slate-500 absolute left-2 top-2.5 pointer-events-none" />
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full pl-6 pr-1 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
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
                    <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                      Type d'espace
                    </label>
                    <div className="relative">
                      <User className="w-3 h-3 text-slate-500 absolute left-2 top-2.5 pointer-events-none" />
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                        className="w-full pl-6 pr-1 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="CLIENT">Particulier / Client</option>
                        <option value="PROFESSIONAL">Prestataire Pro</option>
                        <option value="FORMATEUR">Formateur Academy</option>
                        <option value="VENDEUR">Boutique & Vendeur</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Info spécifique Pro */}
                {(selectedRole === "PROFESSIONAL" || selectedRole === "FORMATEUR" || selectedRole === "VENDEUR") && (
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1 animate-in fade-in duration-200">
                    <div className="flex items-start gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <p className="font-bold text-white text-[10px] leading-tight">
                        {selectedRole === "FORMATEUR"
                          ? "Formateur Academy"
                          : selectedRole === "VENDEUR"
                          ? "Boutique & Vendeur"
                          : "Prestataire Pro"}
                      </p>
                    </div>
                    <p className="text-[9px] text-slate-300 leading-normal pl-4">
                      {selectedRole === "FORMATEUR"
                        ? "Examen du profil par la direction avec notifications WhatsApp et Email."
                        : selectedRole === "VENDEUR"
                        ? "Vérification de boutique avec notifications WhatsApp et Email."
                        : "Examen de conformité avec notifications WhatsApp et Email dès validation."}
                    </p>
                  </div>
                )}

              </div>

            </div>
          ) : (
            /* SINGLE COLUMN LAYOUT POUR LA CONNEXION */
            <div className="space-y-2.5 max-w-sm mx-auto py-1">
              
              {/* Numéro de téléphone */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Numéro de Téléphone (Sénégal) <span className="text-amber-400">*</span>
                  </label>
                  {carrierInfo && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${carrierInfo.bg}`}>
                      {carrierInfo.name}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-slate-300 border-r border-slate-700 pr-2 pointer-events-none">
                    <span>🇸🇳</span>
                    <span>+221</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => {
                      const rawDigits = sanitizeSenegalPhoneInput(e.target.value);
                      setPhone(formatSenegalPhone(rawDigits));
                      if (fieldErrors.phone) {
                        setFieldErrors((prev) => ({ ...prev, phone: "" }));
                      }
                      if (error) setError("");
                    }}
                    placeholder="77 123 45 67"
                    maxLength={12}
                    className={`w-full pl-20 pr-14 py-2 rounded-xl bg-slate-950 border ${
                      fieldErrors.phone ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-800 focus:border-amber-500"
                    } text-white font-mono text-xs focus:outline-none transition-colors`}
                    autoFocus
                  />
                  <div className="absolute right-3 text-[10px] font-mono text-slate-500 pointer-events-none">
                    {cleanDigits.length}/9
                  </div>
                </div>
                {fieldErrors.phone && (
                  <p className="text-[10px] text-rose-400 mt-1 font-medium">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Code PIN */}
              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Code PIN Secret (4 chiffres) <span className="text-amber-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPin}
                    className="text-[10px] text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    PIN oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                      if (fieldErrors.pin) {
                        setFieldErrors((prev) => ({ ...prev, pin: "" }));
                      }
                      if (error) setError("");
                    }}
                    placeholder="••••"
                    className={`w-full pl-9 pr-10 py-2 rounded-xl bg-slate-950 border ${
                      fieldErrors.pin ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-800 focus:border-amber-500"
                    } text-white font-mono text-xs tracking-widest focus:outline-none transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.pin && (
                  <p className="text-[10px] text-rose-400 mt-1 font-medium">{fieldErrors.pin}</p>
                )}
              </div>

            </div>
          )}

          {/* Action principale (visible immédiatement sans scroll) */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <button
              id="btn-auth-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span>Vérification sécurisée en cours...</span>
              ) : isRegisterMode ? (
                <>
                  <UserPlus className="w-4 h-4 text-slate-950 shrink-0 stroke-[2.5]" />
                  <span className="font-black">Créer mon Compte & Accéder</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950 shrink-0 stroke-[2.5]" />
                  <span className="font-black">Valider le PIN & Se Connecter</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Chiffrement SHA-256 • Accès protégé par Code PIN</span>
            </div>


          </div>

        </form>

        {/* DIALOG DE CONFIRMATION / STATUT EN ATTENTE POUR PRESTATAIRE, FORMATEUR, VENDEUR */}
        {proRegisteredModal?.isOpen && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between z-30 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                {proRegisteredModal.isTrial ? (
                  <Sparkles className="w-6 h-6 text-amber-400" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-amber-400" />
                )}
              </div>

              <h3 className="text-base font-black text-white">
                {proRegisteredModal.isTrial
                  ? "🎉 Félicitations ! Votre Offre de Gratuité 30 Jours est Activée !"
                  : `⏳ Inscription ${
                      proRegisteredModal.role === "FORMATEUR"
                        ? "Formateur"
                        : proRegisteredModal.role === "VENDEUR"
                        ? "Boutique"
                        : "Prestataire"
                    } Enregistrée - Compte en Attente de Validation`}
              </h3>

              {proRegisteredModal.isTrial ? (
                <div className="space-y-2 text-xs text-slate-300">
                  <p>
                    Bienvenue <strong className="text-white">{proRegisteredModal.fullName}</strong> ! Vous bénéficiez de l'accès{" "}
                    <strong>
                      {proRegisteredModal.role === "FORMATEUR"
                        ? "Formateur Découverte"
                        : proRegisteredModal.role === "VENDEUR"
                        ? "Boutique Découverte"
                        : "Pro Découverte"}
                    </strong>{" "}
                    gratuit pour{" "}
                    {proRegisteredModal.role === "FORMATEUR"
                      ? "publier vos formations, gérer vos apprenants et être visible sur l'Academy."
                      : proRegisteredModal.role === "VENDEUR"
                      ? "mettre en ligne vos équipements, recevoir des commandes directes et tester la Marketplace Shop."
                      : "publier vos réalisations, recevoir des demandes d'intervention directes des clients et tester le réseau SEN AURA TECH."}
                  </p>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Avantages de lancement activés :
                    </p>
                    <p>✓ Profil & Fiche débloqués pour modification en direct</p>
                    <p>✓ Visibilité immédiate auprès des visiteurs et clients en temps réel</p>
                    <p>✓ Réception des notifications de commandes & missions directes</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-slate-300">
                  <p>
                    Merci <strong className="text-white">{proRegisteredModal.fullName}</strong>. Votre dossier d'inscription en tant que{" "}
                    <strong>
                      {proRegisteredModal.role === "FORMATEUR"
                        ? "formateur académique"
                        : proRegisteredModal.role === "VENDEUR"
                        ? "vendeur / boutique agréée"
                        : "prestataire professionnel"}
                    </strong>{" "}
                    a bien été transmis à la direction SEN AURA TECH.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                    <p className="text-amber-300 font-bold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Notification de validation automatique
                    </p>
                    <p className="text-slate-400">
                      Dès que votre profil aura été validé par la direction, vous recevrez automatiquement un message officiel par{" "}
                      <strong>WhatsApp (+221 {proRegisteredModal.phone})</strong> et par <strong>Email</strong> avec vos accès complets.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 space-y-2">
              {proRegisteredModal.isTrial ? (
                <button
                  type="button"
                  onClick={() => {
                    setProRegisteredModal(null);
                    if (onSuccess) onSuccess();
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {proRegisteredModal.role === "FORMATEUR"
                      ? "Accéder à mon Espace Formateur"
                      : proRegisteredModal.role === "VENDEUR"
                      ? "Accéder à mon Espace Vendeur"
                      : "Accéder à mon Espace Prestataire"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      store.activateProFreeTrial();
                      setProRegisteredModal((prev) => (prev ? { ...prev, isTrial: true } : null));
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Activer mon Offre de Gratuité 30 Jours Immédiate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProRegisteredModal(null);
                      if (onSuccess) onSuccess();
                      onClose();
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Compris, j'attends la validation
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};

