import React, { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  MessageCircle,
  RefreshCw,
  Copy,
  Check,
  User,
  Phone,
  Send,
  Sparkles,
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { SecurityPinService, UserAccountSecurity } from "../../services/securityPinService";
import { getWhatsAppLink, generateResetPinWhatsAppMsg } from "../utils/whatsappHelper";
import { UserRole } from "../contracts/types";
import {
  sanitizeSenegalPhoneInput,
  formatSenegalPhone,
  validateSenegalPhone,
  detectSenegalCarrier,
} from "../utils/phoneValidator";

interface ResetLog {
  id: string;
  phone: string;
  fullName: string;
  newPin: string;
  role: UserRole;
  timestamp: string;
}

export const AdminPinResetConsole: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [customPin, setCustomPin] = useState("");
  
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [updatedAccount, setUpdatedAccount] = useState<UserAccountSecurity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resetLogs, setResetLogs] = useState<ResetLog[]>(() => {
    try {
      const stored = localStorage.getItem("sat_admin_pin_reset_logs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveLog = (log: ResetLog) => {
    const next = [log, ...resetLogs.slice(0, 19)];
    setResetLogs(next);
    try {
      localStorage.setItem("sat_admin_pin_reset_logs", JSON.stringify(next));
    } catch {}
  };

  const handleGenerateAndReset = async (forcedPin?: string) => {
    setError("");
    setSuccessMsg("");
    const valResult = validateSenegalPhone(phone);

    if (!valResult.isValid) {
      setError(valResult.error || "Veuillez saisir un numéro de téléphone sénégalais valide (ex: 77 123 45 67).");
      return;
    }

    const cleanPhone = valResult.digits;

    setIsLoading(true);

    try {
      const result = await SecurityPinService.adminResetPin({
        phone: cleanPhone,
        newPin: forcedPin || (customPin.length === 4 ? customPin : undefined),
        fullName: fullName.trim() || undefined,
        role,
      });

      if (result.success) {
        setGeneratedPin(result.newPin);
        setUpdatedAccount(result.account);
        setSuccessMsg(
          `Nouveau code PIN (${result.newPin}) activé avec succès pour ${result.account.fullName} ! Prêt à être envoyé par WhatsApp.`
        );

        saveLog({
          id: `log-${Date.now()}`,
          phone: result.account.phone,
          fullName: result.account.fullName,
          newPin: result.newPin,
          role: result.account.role,
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        });
      } else {
        setError(result.error || "Erreur lors de la réinitialisation administrative.");
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors du traitement du Code PIN.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPin = () => {
    if (!generatedPin) return;
    navigator.clipboard.writeText(generatedPin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!generatedPin || !updatedAccount) return;
    const msg = generateResetPinWhatsAppMsg(
      updatedAccount.fullName,
      updatedAccount.phone,
      generatedPin,
      updatedAccount.role
    );
    window.open(getWhatsAppLink(updatedAccount.cleanPhone, msg), "_blank");
  };

  const handleRegenerate = () => {
    const newRandom = Math.floor(1000 + Math.random() * 9000).toString();
    handleGenerateAndReset(newRandom);
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>Console de Réinitialisation des Codes PIN Oubliés</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                100% WhatsApp Direct
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Traitez les demandes de mot de passe / PIN oublié reçues par WhatsApp en 1 clic.
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire de Réinitialisation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Numéro de téléphone */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Numéro de Téléphone du Client <span className="text-amber-400">*</span>
            </label>
            {detectSenegalCarrier(sanitizeSenegalPhoneInput(phone)) && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${detectSenegalCarrier(sanitizeSenegalPhoneInput(phone))?.bg}`}>
                {detectSenegalCarrier(sanitizeSenegalPhoneInput(phone))?.name}
              </span>
            )}
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-slate-400 border-r border-slate-700 pr-2 pointer-events-none">
              <span>🇸🇳</span>
              <span>+221</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={12}
              placeholder="77 123 45 67"
              value={phone}
              onChange={(e) => {
                const rawDigits = sanitizeSenegalPhoneInput(e.target.value);
                setPhone(formatSenegalPhone(rawDigits));
              }}
              className="w-full pl-20 pr-14 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
            />
            <div className="absolute right-3 text-[10px] font-mono text-slate-500 pointer-events-none">
              {sanitizeSenegalPhoneInput(phone).length}/9
            </div>
          </div>
        </div>

        {/* Nom de l'utilisateur */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">
            Nom / Prénom (Optionnel)
          </label>
          <input
            type="text"
            placeholder="Ex: Modou Fall"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Rôle */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">
            Rôle / Espace
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
          >
            <option value="CLIENT">Client / Particulier</option>
            <option value="PROFESSIONAL">Prestataire Pro</option>
            <option value="FORMATEUR">Formateur Academy</option>
            <option value="VENDEUR">Boutique & Vendeur</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>
      </div>

      {/* Messages d'état */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => handleGenerateAndReset()}
          disabled={isLoading || !phone.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Générer un Nouveau Code PIN Sécurisé</span>
        </button>

        {generatedPin && (
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Régénérer un Autre Code</span>
          </button>
        )}
      </div>

      {/* RÉSULTAT DU CODE GÉNÉRÉ & BOUTON D'ENVOI WHATSAPP */}
      {generatedPin && updatedAccount && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/50 space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Code PIN Display */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
                Code PIN Secret Actif & Enregistré :
              </span>
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-widest bg-slate-950 px-4 py-1.5 rounded-xl border border-amber-500/40">
                  {generatedPin}
                </span>
                <button
                  onClick={handleCopyPin}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                  title="Copier le code PIN"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Compte : <strong className="text-white">{updatedAccount.fullName}</strong> ({updatedAccount.phone})
              </p>
            </div>

            {/* DIRECT WHATSAPP BUTTON */}
            <button
              onClick={handleSendWhatsApp}
              className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-105 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-slate-950" />
              <span>Envoyer le Nouveau Code PIN par WhatsApp à l'Utilisateur</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* HISTORIQUE DES RÉINITIALISATIONS */}
      {resetLogs.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Dernières Réinitialisations Effectuées ({resetLogs.length})</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {resetLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <p className="text-slate-200 font-bold truncate">{log.fullName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{log.phone} • {log.timestamp}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] border border-amber-500/30">
                    {log.newPin}
                  </span>
                  <button
                    onClick={() => {
                      const msg = generateResetPinWhatsAppMsg(log.fullName, log.phone, log.newPin, log.role);
                      window.open(getWhatsAppLink(log.phone, msg), "_blank");
                    }}
                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition"
                    title="Renvoyer sur WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
