import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, MessageCircle, ShieldCheck, KeyRound, AlertCircle, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { getWhatsAppLink, generateForgotPinRequestWhatsAppMsg } from '../utils/whatsappHelper';
import { SecurityPinService } from '../../services/securityPinService';
import {
  sanitizeSenegalPhoneInput,
  formatSenegalPhone,
  detectSenegalCarrier,
} from '../utils/phoneValidator';
import {
  authLoginSchema,
  authRegisterSchema,
  validateWithZod,
} from '../../lib/validationSchemas';

interface UserPinLoginFormProps {
  users?: any[];
  onSuccess: (phone: string) => void;
  onError: (msg: string) => void;
}

export function UserPinLoginForm({ onSuccess, onError }: UserPinLoginFormProps) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const cleanDigits = sanitizeSenegalPhoneInput(phone);
  const carrierInfo = detectSenegalCarrier(cleanDigits);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError('');
    setFieldErrors({});

    if (isRegisterMode) {
      const validation = validateWithZod(authRegisterSchema, {
        fullName: fullName.trim(),
        phone,
        pin,
        confirmPin,
        role: 'CLIENT',
        region: 'Dakar',
      });

      if (!validation.success) {
        setFieldErrors(validation.errors);
        onError(validation.firstError);
        return;
      }

      setIsLoading(true);
      const cleanPhone = sanitizeSenegalPhoneInput(phone);

      try {
        const regResult = await SecurityPinService.registerAccount({
          phone: cleanPhone,
          fullName: fullName.trim() || `Client ${cleanPhone}`,
          pin,
          role: 'CLIENT',
          region: 'Dakar',
        });

        if (regResult.success) {
          onSuccess(cleanPhone);
        } else {
          onError(regResult.error || 'Erreur lors de la configuration du code PIN.');
        }
      } catch (err: any) {
        onError(err?.message || 'Erreur technique lors de la création du compte.');
      } finally {
        setIsLoading(false);
      }
    } else {
      const validation = validateWithZod(authLoginSchema, {
        phone,
        pin,
      });

      if (!validation.success) {
        setFieldErrors(validation.errors);
        onError(validation.firstError);
        return;
      }

      setIsLoading(true);
      const cleanPhone = sanitizeSenegalPhoneInput(phone);

      try {
        const authResult = await SecurityPinService.authenticate(cleanPhone, pin);

        if (authResult.success) {
          onSuccess(cleanPhone);
        } else {
          if (authResult.error && authResult.error.includes("n'a pas encore de compte")) {
            setIsRegisterMode(true);
            onError("Première visite ? Définissez votre Code PIN secret personnel ci-dessous pour sécuriser votre compte.");
          } else {
            onError(authResult.error || 'Code PIN secret incorrect.');
          }
        }
      } catch (err: any) {
        onError(err?.message || 'Erreur technique lors de la vérification du code PIN.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Action en cas d'oubli de code secret : Redirection directe sur WhatsApp Support officiel
  const handleForgotPin = () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      onError("Veuillez d'abord saisir votre numéro de téléphone.");
      return;
    }
    onError('');
    const msg = generateForgotPinRequestWhatsAppMsg(trimmedPhone, fullName);
    window.open(getWhatsAppLink('705334611', msg), '_blank');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3.5 text-left">
      
      {/* Mode Switcher Header */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <span className="text-slate-300 font-medium flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {isRegisterMode ? "Créer mon Code PIN" : "Connexion sécurisée par PIN"}
        </span>
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(!isRegisterMode);
            onError('');
            setFieldErrors({});
          }}
          className="text-amber-400 hover:text-amber-300 font-bold underline text-[11px] cursor-pointer"
        >
          {isRegisterMode ? "J'ai déjà un PIN" : "Nouveau ? Créer un PIN"}
        </button>
      </div>

      {isRegisterMode && (
        <div className="space-y-1 animate-in fade-in">
          <label className="block text-slate-300 font-semibold text-xs">Nom & Prénom <span className="text-amber-400">*</span></label>
          <input
            type="text"
            placeholder="Ex: Cheikh Diop"
            value={fullName}
            onChange={e => {
              setFullName(e.target.value);
              if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: '' }));
            }}
            className={`w-full px-3 py-2.5 rounded-xl bg-slate-950 border ${
              fieldErrors.fullName ? 'border-rose-500' : 'border-slate-800'
            } text-white outline-none focus:border-amber-500 text-xs`}
          />
          {fieldErrors.fullName && (
            <p className="text-[10px] text-rose-400 font-medium">{fieldErrors.fullName}</p>
          )}
        </div>
      )}

      {/* Numéro de téléphone */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-slate-300 font-semibold text-xs">Numéro de Téléphone (Sénégal) <span className="text-amber-400">*</span></label>
          {carrierInfo && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${carrierInfo.bg}`}>
              {carrierInfo.name}
            </span>
          )}
        </div>
        <div className="relative flex items-center">
          <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-slate-400 border-r border-slate-800 pr-2 pointer-events-none">
            <span>🇸🇳</span>
            <span>+221</span>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="77 123 45 67"
            maxLength={12}
            value={phone}
            onChange={(e) => {
              const rawDigits = sanitizeSenegalPhoneInput(e.target.value);
              setPhone(formatSenegalPhone(rawDigits));
              if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
            }}
            className={`w-full pl-20 pr-14 py-2.5 rounded-xl bg-slate-950 border ${
              fieldErrors.phone ? 'border-rose-500' : 'border-slate-800'
            } text-white outline-none focus:border-amber-500 text-xs font-mono`}
            autoFocus
          />
          <div className="absolute right-3 text-[10px] font-mono text-slate-500 pointer-events-none">
            {cleanDigits.length}/9
          </div>
        </div>
        {fieldErrors.phone && (
          <p className="text-[10px] text-rose-400 font-medium">{fieldErrors.phone}</p>
        )}
      </div>

      {/* Code PIN Secret */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <label className="block text-slate-300 font-semibold">
            {isRegisterMode ? "Définir votre Code PIN (4 chiffres) *" : "Code PIN Secret (4 chiffres) *"}
          </label>
          {!isRegisterMode && (
            <button
              type="button"
              onClick={handleForgotPin}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 transition cursor-pointer"
            >
              <MessageCircle className="w-3 h-3 text-emerald-400" /> PIN oublié ?
            </button>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={e => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
              if (fieldErrors.pin) setFieldErrors(prev => ({ ...prev, pin: '' }));
            }}
            className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border ${
              fieldErrors.pin ? 'border-rose-500' : 'border-slate-800'
            } text-white font-mono text-xs focus:border-amber-500 tracking-widest text-center sm:text-left`}
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
          >
            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.pin && (
          <p className="text-[10px] text-rose-400 font-medium">{fieldErrors.pin}</p>
        )}
      </div>

      {/* Confirmation PIN en mode Inscription */}
      {isRegisterMode && (
        <div className="space-y-1 animate-in fade-in">
          <label className="block text-slate-300 font-semibold text-xs">Confirmer le Code PIN (4 chiffres) <span className="text-amber-400">*</span></label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={confirmPin}
              onChange={e => {
                setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                if (fieldErrors.confirmPin) setFieldErrors(prev => ({ ...prev, confirmPin: '' }));
              }}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border ${
                fieldErrors.confirmPin ? 'border-rose-500' : 'border-slate-800'
              } text-white font-mono text-xs focus:border-amber-500 tracking-widest text-center sm:text-left`}
            />
          </div>
          {fieldErrors.confirmPin && (
            <p className="text-[10px] text-rose-400 font-medium">{fieldErrors.confirmPin}</p>
          )}
        </div>
      )}

      {/* Bouton de Soumission */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          <span>Vérification sécurisée...</span>
        ) : isRegisterMode ? (
          <>
            <UserPlus className="w-4 h-4" />
            <span>Enregistrer mon PIN & Accéder</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            <span>Valider le PIN & Se connecter</span>
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-500 text-center">
        🔒 Protection contre les attaques par force brute • Hachage cryptographique SHA-256
      </p>
    </form>
  );
}

// Backward compatibility export
export const ParentLoginForm = UserPinLoginForm;
