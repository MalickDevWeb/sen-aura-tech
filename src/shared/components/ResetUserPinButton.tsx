import React, { useState } from 'react';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { getWhatsAppLink, generateResetPinWhatsAppMsg } from '../utils/whatsappHelper';
import { SecurityPinService } from '../../services/securityPinService';

export function ResetUserPinButton({ user, onUpdateUserPin }: { user: any, onUpdateUserPin?: (id: string, newPin: string) => void }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResetAndSendWhatsApp = async () => {
    setIsProcessing(true);
    const userId = user?.id || user?.phone || 'user-id';
    const userName = user?.fullName || user?.name || 'Utilisateur SEN AURA TECH';
    const userPhone = user?.phone || user?.whatsapp || '705334611';
    const userRole = user?.role || 'CLIENT';

    try {
      // 1. Réinitialisation administrative réelle avec hachage et synchronisation
      const result = await SecurityPinService.adminResetPin({
        phone: userPhone,
        fullName: userName,
        role: userRole,
      });

      const newPin = result.newPin;

      // 2. Mise à jour dans le state parent si callback fourni
      if (onUpdateUserPin) {
        onUpdateUserPin(userId, newPin);
      }

      // 3. Génération du message et ouverture de WhatsApp
      const msg = generateResetPinWhatsAppMsg(userName, userPhone, newPin, userRole);
      window.open(getWhatsAppLink(userPhone, msg), '_blank');
    } catch (e) {
      console.error("Erreur lors de la réinitialisation du PIN:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleResetAndSendWhatsApp}
      disabled={isProcessing}
      className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
      title="Générer un nouveau code PIN et envoyer par WhatsApp"
    >
      {isProcessing ? (
        <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
      ) : (
        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
      )}
      <span>Réinitialiser PIN & WhatsApp</span>
    </button>
  );
}

// Backward compatibility export
export const ResetParentPinButton = ResetUserPinButton;
