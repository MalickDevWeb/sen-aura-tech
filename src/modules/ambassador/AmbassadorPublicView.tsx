import React, { useState } from "react";
import {
  Briefcase,
  DollarSign,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Share2,
  Zap,
  Target,
  Trophy,
  BookOpen,
  PhoneCall,
  Lock,
  ChevronRight,
  Gift,
  QrCode
} from "lucide-react";
import { formatCurrency } from "../../config/constants";
import { AmbassadorApplicationModal } from "./AmbassadorApplicationModal";
import { store } from "../../database/store";

interface AmbassadorPublicViewProps {
  currency: "FCFA" | "EUR";
  onNavigateToDashboard?: () => void;
  onOpenQuoteModal?: () => void;
}

export const AmbassadorPublicView: React.FC<AmbassadorPublicViewProps> = ({
  currency,
  onNavigateToDashboard,
  onOpenQuoteModal
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [projectAmountFCFA, setProjectAmountFCFA] = useState<number>(1000000);

  // Commission Calculation Matrix
  const calculateCommission = (amount: number) => {
    let rate = 0.10; // 10%
    if (amount >= 3000000) rate = 0.20; // 20%
    else if (amount >= 1500000) rate = 0.15; // 15%
    else if (amount >= 500000) rate = 0.12; // 12%

    const commissionAmount = Math.round(amount * rate);
    return {
      ratePercent: Math.round(rate * 100),
      amountFCFA: commissionAmount,
    };
  };

  const currentCalc = calculateCommission(projectAmountFCFA);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-[#0B0F19] border-b border-slate-800/80">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>RÉSEAU D'APPORTEURS D'AFFAIRES & AMBASSADEURS OFFICIEL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Devenez Ambassadeur <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              SEN AURA TECH
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Recommandez nos solutions technologiques (Applications Web & Mobile, ERP, Caméras, Solaire, Formations), apportez des projets et développez votre réseau en gagnant des commissions attractives.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm hover:brightness-110 transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 group"
            >
              <span>👉 Devenir Ambassadeur</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                store.switchRole("AMBASSADOR");
                onNavigateToDashboard?.();
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Accéder à l'Espace Ambassadeur (Demo)</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Commission</p>
              <p className="text-base font-black text-amber-400">Jusqu'à 20%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Paiement</p>
              <p className="text-base font-black text-emerald-400">Wave & OM 24h</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Attribution</p>
              <p className="text-base font-black text-sky-400">1er arrivé garanti</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Catalogue</p>
              <p className="text-base font-black text-indigo-400">+50 Solutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 3 PILLARS OF THE AMBASSADOR PROGRAM */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Le Parcours Ambassadeur SEN AURA</h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Une opportunité professionnelle structurée et transparente pour maximiser vos revenus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 hover:border-amber-500/50 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
              💼
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Apportez des projets</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vous connaissez une entreprise, une école, un hôtel ou un commerce ayant besoin d'une solution digitale ou technique ? Déclarez le prospect directement dans votre espace.
              </p>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protection par matricule prospect unique</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Horodatage et priorité d'attribution</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 hover:border-emerald-500/50 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
              💰
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Gagnez des commissions</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dès que le projet apporté est signé et payé par le client, votre commission est calculée et créditée instantanément sur votre solde ambassadeur.
              </p>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>10% à 20% de commission par contrat</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Retrait express Wave & Orange Money</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 hover:border-indigo-500/50 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
              🚀
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Développez votre réseau</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Accédez à notre catalogue de solutions, aux supports de vente (Kit Ambassadeur, présentations, affiches) et à des événements réseau exclusifs.
              </p>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lien d'affiliation & QR Code personnel</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Badges de performance & classement Top</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. SIMULATEUR DE COMMISSIONS INTERACTIF */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 space-y-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
                SIMULATEUR DE GAINS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Calculez vos commissions d'ambassadeur</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Déplacez le curseur selon le montant du projet estimé pour voir instantanément votre rémunération.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Range Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-300">Valeur totale du projet apporté :</span>
                  <span className="font-mono text-amber-400 text-sm font-black">
                    {formatCurrency(projectAmountFCFA, "FCFA")}
                  </span>
                </div>
                <input
                  type="range"
                  min={200000}
                  max={10000000}
                  step={100000}
                  value={projectAmountFCFA}
                  onChange={(e) => setProjectAmountFCFA(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>200 000 FCFA</span>
                  <span>5 000 000 FCFA</span>
                  <span>10 000 000 FCFA</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Site Web (500k)", amount: 500000 },
                  { label: "ERP / App (1.5M)", amount: 1500000 },
                  { label: "Caméras & Solaire (3M)", amount: 3000000 },
                  { label: "Projet SI (5M)", amount: 5000000 },
                ].map((preset) => (
                  <button
                    key={preset.amount}
                    onClick={() => setProjectAmountFCFA(preset.amount)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      projectAmountFCFA === preset.amount
                        ? "bg-amber-500 text-slate-950 font-black"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Earnings Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border-2 border-amber-500/40 space-y-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Votre Commission Estimée</span>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                  Taux : {currentCalc.ratePercent}%
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                {formatCurrency(currentCalc.amountFCFA, "FCFA")}
              </div>

              <p className="text-[11px] text-slate-400 leading-normal border-t border-slate-800/80 pt-3">
                💡 <strong>Exemple :</strong> Pour un projet d'application mobile ou d'installation solaire de {formatCurrency(projectAmountFCFA, "FCFA")}, vous percevez <strong>{formatCurrency(currentCalc.amountFCFA, "FCFA")}</strong> directement à la validation du paiement client.
              </p>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
              >
                Commencer à générer mes commissions
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RÈGLE STRICTE DE PROTECTION D'ATTRIBUTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2 text-center md:text-left flex-1">
            <h3 className="text-lg font-black text-white">Protection Garantie de l'Ambassadeur (First-Come Rule)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Lorsqu'un ambassadeur déclare un prospect sur la plateforme, le système attribue immédiatement un numéro de matricule (ex: <span className="font-mono text-amber-400 font-bold">SAT-P-00852</span>) avec horodatage. Tout prospect doit être enregistré sur la plateforme avant toute prise en charge commerciale afin d’être attribué définitivement à l'ambassadeur concerné.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs shrink-0 border border-amber-500/30 transition-all"
          >
            S'inscrire comme ambassadeur
          </button>
        </div>
      </section>

      {/* MODAL APPLICATION */}
      <AmbassadorApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(app) => {
          store.switchRole("AMBASSADOR");
          onNavigateToDashboard?.();
        }}
      />
    </div>
  );
};
