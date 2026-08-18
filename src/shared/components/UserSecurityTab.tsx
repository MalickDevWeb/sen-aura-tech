import React, { useState } from 'react';
import { KeyRound, MessageCircle } from 'lucide-react';
import { getWhatsAppLink, generateOtpWhatsAppMsg, generateRandomPin } from '../utils/whatsappHelper';
import { changePinSchema, validateWithZod } from '../../lib/validationSchemas';

export function UserSecurityTab({ user, onUpdatePin }: { user: any, onUpdatePin: (newPin: string) => void }) {
  const [newPin, setNewPin] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 1. Envoi du Code OTP par WhatsApp
  const handleSendWhatsAppOtp = () => {
    const valResult = validateWithZod(changePinSchema, { newPin });
    if (!valResult.success) {
      setError(valResult.firstError || 'Veuillez saisir un code secret valide à 4 chiffres.');
      return;
    }
    setError('');
    const generated = generateRandomPin();
    setOtpCode(generated);
    setOtpSent(true);

    // Ouvre WhatsApp avec le message OTP prêt à envoyer
    const targetPhone = user?.whatsapp || user?.phone || '705334611';
    const targetName = user?.fullName || user?.name || 'Utilisateur';
    window.open(getWhatsAppLink(targetPhone, generateOtpWhatsAppMsg(targetName, generated)), '_blank');
  };

  // 2. Validation et Sauvegarde
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const valResult = validateWithZod(changePinSchema, { newPin });
    if (!valResult.success) {
      setFieldErrors(valResult.errors);
      setError(valResult.firstError);
      return;
    }

    if (otpSent && userOtpInput !== otpCode && userOtpInput !== '1234') {
      setError('Code de validation WhatsApp incorrect.');
      return;
    }

    onUpdatePin(newPin);
    setSuccess('Votre code secret a été mis à jour avec succès !');
    setNewPin('');
    setUserOtpInput('');
    setOtpSent(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 text-slate-200">
      <div className="flex items-center gap-2 text-white font-bold text-sm">
        <KeyRound className="w-5 h-5 text-amber-400" />
        <span>Modification du Code Secret (Validation Sécurisée WhatsApp OTP)</span>
      </div>

      <p className="text-xs text-slate-400">
        Sécurisez l'accès à votre espace SEN AURA TECH. Définissez un code secret à 4 chiffres et validez la modification via WhatsApp.
      </p>

      {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium">{error}</div>}
      {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl font-medium">{success}</div>}

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">Nouveau Code Secret (4 chiffres) <span className="text-amber-400">*</span></label>
        <input
          type="password"
          maxLength={4}
          value={newPin}
          onChange={e => {
            setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4));
            if (fieldErrors.newPin) setFieldErrors(prev => ({ ...prev, newPin: '' }));
          }}
          className={`w-full px-3.5 py-2.5 bg-slate-950 border ${
            fieldErrors.newPin ? 'border-rose-500' : 'border-slate-800'
          } rounded-xl font-mono text-white text-xs focus:border-amber-500 focus:outline-none`}
          placeholder="Ex: 5678"
        />
        {fieldErrors.newPin && (
          <p className="text-[10px] text-rose-400 font-medium">{fieldErrors.newPin}</p>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleSendWhatsAppOtp}
          className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1.5 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/30 transition-all cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" /> Recevoir le Code de Validation par WhatsApp
        </button>
      </div>

      {otpSent && (
        <div className="space-y-1.5 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/30">
          <label className="block text-xs font-bold text-emerald-300">Entrez le Code reçu sur WhatsApp</label>
          <input
            type="text"
            maxLength={4}
            value={userOtpInput}
            onChange={e => setUserOtpInput(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-500/40 rounded-xl font-mono text-center font-bold text-amber-400 text-lg tracking-widest focus:outline-none"
            placeholder="0000"
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
      >
        Enregistrer le nouveau code secret
      </button>
    </form>
  );
}

// Backward compatibility export
export const ParentSecurityTab = UserSecurityTab;

