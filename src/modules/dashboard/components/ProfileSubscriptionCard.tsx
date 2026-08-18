import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Check,
  RefreshCw,
  Phone,
  Download,
  AlertCircle,
} from "lucide-react";
import { store } from "../../../database/store";
import { ProfileType } from "../../../shared/contracts/types";
import { PROFILES_METADATA } from "../../../config/profilesConfig";
import { formatCurrency } from "../../../shared/utils/formatters";

interface ProfileSubscriptionCardProps {
  profileType?: ProfileType;
  currency?: string;
  onOpenUpgradeModal?: () => void;
}

export const ProfileSubscriptionCard: React.FC<ProfileSubscriptionCardProps> = ({
  profileType,
  currency = "XOF",
  onOpenUpgradeModal,
}) => {
  const currentRole = profileType || (store.currentUser.role as ProfileType) || "CLIENT";
  const meta = PROFILES_METADATA[currentRole] || PROFILES_METADATA.CLIENT;
  const userProfiles = store.currentUser.profiles || {};
  const subscription = userProfiles[currentRole]?.subscription;

  const isClient = currentRole === "CLIENT";
  const isTrial = subscription?.status === "TRIAL";
  const isExpired = subscription?.status === "EXPIRED";
  const isFree = isClient || subscription?.planId === "free";

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
            {meta.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white">
                Abonnement Profil {meta.title}
              </h3>
              {isClient ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  ✓ Gratuit à Vie
                </span>
              ) : isTrial ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Essai Gratuit 30 Jours</span>
                </span>
              ) : isExpired ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                  Expiré
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Actif & Validé</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Formule actuelle : <strong className="text-white">{subscription?.planName || (isClient ? "Accès Client Standard" : "Formule Standard")}</strong>
            </p>
          </div>
        </div>

        {/* Pricing / Plan Details */}
        <div className="text-left sm:text-right">
          <div className="text-lg font-black text-amber-400 font-mono">
            {isFree ? "0 FCFA" : formatCurrency(subscription?.priceFCFA || 25000, currency)}
            <span className="text-xs text-slate-400 font-sans font-normal">
              {isFree ? "" : "/mois"}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            {isClient
              ? "Aucun prélèvement requis"
              : isTrial
              ? "Offre de lancement sans frais"
              : "Renouvellement mensuel"}
          </p>
        </div>
      </div>

      {/* Features included */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Services & Avantages inclus dans ce profil :</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
          {(meta.coreFeatures || []).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate text-[11px]">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      {!isClient && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Paiements sécurisés par Wave, Orange Money ou Carte Bancaire.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenUpgradeModal}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Changer de Formule / Prolongation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
