import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Sparkles, ShieldCheck, ArrowRight, Download, PackageCheck, Star, Truck } from "lucide-react";
import { formatCurrency } from "../../config/constants";

interface CelebrationOverlayProps {
  orderId: string;
  totalFCFA: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: string;
  deliveryCity?: string;
  currency: "FCFA" | "EUR";
  items?: Array<{
    description?: string;
    title?: string;
    quantity?: number;
    unitPriceFCFA?: number;
    priceFCFA?: number;
    totalFCFA?: number;
  }>;
  onClose: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  orderId,
  totalFCFA,
  customerName = "Client Honoré",
  customerPhone,
  paymentMethod = "Wave / Orange Money",
  deliveryCity = "Dakar",
  currency,
  items,
  onClose,
}) => {
  useEffect(() => {
    // 1. Trigger realistic festive confetti burst
    const count = 200;
    const defaults = {
      origin: { y: 0.6 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Launch confetti bursts in Senegal & Brand Colors: Gold, Green, Red, Silver
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ["#FFCC00", "#F59E0B", "#008751", "#E8112D", "#F8FAFC"],
    });
    fire(0.2, {
      spread: 60,
      colors: ["#F59E0B", "#38BDF8", "#008751"],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ["#FFCC00", "#E8112D", "#008751", "#FFFFFF"],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ["#F59E0B", "#F8FAFC"],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ["#008751", "#FFCC00", "#E8112D"],
    });

    // 2. Play Web Audio Celebration Chime Tone (gentle, pleasing melodic chime)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        const playNote = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + start);
          gain.gain.setValueAtTime(0.15, now + start);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + duration);
        };

        // Melodic Arpeggio (C5 - E5 - G5 - C6)
        playNote(523.25, 0.0, 0.4); // C5
        playNote(659.25, 0.12, 0.4); // E5
        playNote(783.99, 0.24, 0.4); // G5
        playNote(1046.50, 0.38, 0.8); // C6
      }
    } catch (e) {
      // Audio autoplay might be muted by browser policy, ignore safely
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Background Radial Glow */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/20 via-emerald-500/15 to-yellow-500/20 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.25)] text-center space-y-6 overflow-hidden">
        
        {/* Animated Celebration Icon */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-emerald-500 to-yellow-500 rounded-full blur-lg opacity-70 animate-pulse" />
          <div className="relative w-18 h-18 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-xl">
            <CheckCircle2 className="w-10 h-10 animate-bounce text-emerald-400" />
          </div>
          <div className="absolute -top-1 -right-1 p-1 bg-amber-500 text-slate-950 rounded-full">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
        </div>

        {/* Title */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-black text-emerald-300 uppercase tracking-widest mb-2">
            <Star className="w-3 h-3 fill-emerald-300" /> Commande Confirmée & Payée !
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Félicitations, {customerName} !</h2>
          <p className="text-xs text-slate-300 mt-1">
            Votre commande d'équipements <strong className="text-amber-400">SEN AURA TECH</strong> a bien été enregistrée.
          </p>
        </div>

        {/* Ticket Receipt Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2.5 font-sans">
          <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">N° de Référence :</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{orderId}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Montant total :</span>
            <span className="font-mono font-black text-emerald-400 text-base">
              {formatCurrency(totalFCFA, currency)}
            </span>
          </div>

          {customerPhone && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Téléphone de suivi :</span>
              <span className="font-mono text-slate-200">{customerPhone}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Mode de paiement :</span>
            <span className="font-bold text-amber-300">{paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Zone de livraison :</span>
            <span className="font-bold text-slate-200">{deliveryCity}</span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
            <Truck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Livraison sous 24h à 48h par notre service logistique.</span>
          </div>
        </div>

        {/* Guarantees Ribbon */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-300 pt-1">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Garantie 1 An</span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1"><PackageCheck className="w-3.5 h-3.5 text-emerald-400" /> Facture Proforma NINEA</span>
        </div>

        {/* Action button */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => {
              // Open invoice modal directly adapted to boutique context
              if ((window as any).__openOfficialInvoice) {
                const formattedItems = (items && items.length > 0)
                  ? items.map((it) => ({
                      description: it.title || it.description || "Article Boutique SEN AURA TECH",
                      quantity: it.quantity || 1,
                      unitPriceFCFA: it.unitPriceFCFA || it.priceFCFA || it.totalFCFA || 0,
                      totalFCFA: it.totalFCFA || ((it.unitPriceFCFA || it.priceFCFA || 0) * (it.quantity || 1)),
                    }))
                  : [
                      {
                        description: "Commande Matériel & Équipements High-Tech",
                        quantity: 1,
                        unitPriceFCFA: totalFCFA,
                        totalFCFA: totalFCFA,
                      },
                    ];

                (window as any).__openOfficialInvoice({
                  invoiceNumber: `FAC-2026-${orderId.replace(/[^0-9]/g, "").slice(-6) || "920101"}`,
                  transactionRef: orderId,
                  documentType: "BOUTIQUE",
                  clientInfo: {
                    name: customerName,
                    phone: customerPhone || "+221 77 555 00 00",
                    address: deliveryCity,
                  },
                  items: formattedItems,
                  subtotalFCFA: Math.round(totalFCFA / 1.18),
                  vatFCFA: Math.round(totalFCFA - totalFCFA / 1.18),
                  totalFCFA: totalFCFA,
                  paymentMethod: paymentMethod,
                });
              }
            }}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>🧾 Voir & Imprimer la Facture Officielle</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <span>Retourner à la boutique</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
