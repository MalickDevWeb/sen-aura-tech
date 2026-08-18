import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  Send,
  Download,
  Plus,
  Trash2,
  ShieldCheck,
  User,
  Calendar,
  DollarSign,
  Layers,
  Sparkles,
} from "lucide-react";
import { QuoteRequestDTO, QuoteItemDTO } from "../../../shared/contracts/types";
import { formatCurrency } from "../../../config/constants";
import { exportQuotePDF } from "../../../lib/pdfGenerator";
import { store } from "../../../database/store";

interface AdminQuoteProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteRequestDTO | null;
  adminPros: any[];
  currency: "FCFA" | "EUR";
  onPublish: (updatedQuote: QuoteRequestDTO) => void;
}

export const AdminQuoteProposalModal: React.FC<AdminQuoteProposalModalProps> = ({
  isOpen,
  onClose,
  quote,
  adminPros,
  currency,
  onPublish,
}) => {
  const [proposalAmount, setProposalAmount] = useState<number>(500000);
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");
  const [assignedExpert, setAssignedExpert] = useState<string>("");
  const [items, setItems] = useState<QuoteItemDTO[]>([]);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && quote) {
      const initialAmount = quote.proposalAmountFCFA || quote.budgetFCFA || 500000;
      setProposalAmount(initialAmount);
      setAdminNotes(
        quote.adminNotes ||
          "Délai estimé de réalisation : 10 à 15 jours ouvrés.\nModalités de règlement : 50% d'acompte au démarrage, 50% à la livraison finale et recette.\nGarantie et maintenance technique : 6 mois inclus."
      );

      // Default valid until: 30 days from now
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setValidUntil(quote.validUntil || d.toISOString().split("T")[0]);

      setAssignedExpert(quote.assignedExpertName || (adminPros[0]?.fullName ?? "Équipe Ingénierie SEN AURA TECH"));

      if (quote.items && quote.items.length > 0) {
        setItems(quote.items);
      } else {
        // Auto-generate realistic quote items based on pole and budget
        setItems([
          {
            description: `Prestation Principale : ${quote.serviceTitle}`,
            quantity: 1,
            unitPriceFCFA: Math.round(initialAmount * 0.75),
            totalFCFA: Math.round(initialAmount * 0.75),
          },
          {
            description: "Déploiement Infrastructure, Sécurité & Recette Technique",
            quantity: 1,
            unitPriceFCFA: Math.round(initialAmount * 0.25),
            totalFCFA: Math.round(initialAmount * 0.25),
          },
        ]);
      }

      (window as any).__lenis?.stop();
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        (window as any).__lenis?.start();
      };
    }
  }, [isOpen, quote, adminPros, onClose]);

  if (!isOpen || !quote) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: "Nouvelle ligne de prestation / fourniture",
        quantity: 1,
        unitPriceFCFA: 50000,
        totalFCFA: 50000,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof QuoteItemDTO, value: any) => {
    const nextItems = [...items];
    const item = { ...nextItems[index], [field]: value };
    if (field === "quantity" || field === "unitPriceFCFA") {
      item.totalFCFA = Number(item.quantity) * Number(item.unitPriceFCFA);
    }
    nextItems[index] = item;
    setItems(nextItems);

    // Auto-update total sum if all items are filled
    const sum = nextItems.reduce((acc, curr) => acc + (Number(curr.totalFCFA) || 0), 0);
    if (sum > 0) {
      setProposalAmount(sum);
    }
  };

  const handleRemoveItem = (index: number) => {
    const nextItems = items.filter((_, i) => i !== index);
    setItems(nextItems);
    const sum = nextItems.reduce((acc, curr) => acc + (Number(curr.totalFCFA) || 0), 0);
    if (sum > 0) setProposalAmount(sum);
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    const expertObj = adminPros.find((p) => p.fullName === assignedExpert);
    const expertPhone = expertObj?.phone || "+221 70 533 46 11";

    const updatedQuote: QuoteRequestDTO = {
      ...quote,
      proposalAmountFCFA: proposalAmount,
      items,
      adminNotes,
      validUntil,
      assignedExpertName: assignedExpert,
      assignedExpertPhone: expertPhone,
      status: "PROPOSITION_ENVOYEE",
      publishedAt: new Date().toISOString(),
    };

    try {
      store.publishQuoteProposal(quote.id, {
        proposalAmountFCFA: proposalAmount,
        items,
        adminNotes,
        validUntil,
        assignedExpertName: assignedExpert,
        assignedExpertPhone: expertPhone,
      });

      onPublish(updatedQuote);
      setIsPublishing(false);
      onClose();
      alert(`✓ Devis ${quote.id} validé et proposition commerciale publiée ! Le client peut désormais télécharger son devis PDF officiel.`);
    } catch {
      setIsPublishing(false);
      onPublish(updatedQuote);
      onClose();
    }
  };

  const handleDownloadAdminPDF = () => {
    exportQuotePDF({
      id: quote.id,
      reference: quote.id,
      pole: quote.pole,
      serviceTitle: quote.serviceTitle,
      description: quote.description,
      region: quote.region || "Dakar",
      budgetFCFA: proposalAmount,
      userName: quote.userName,
      userPhone: quote.userPhone,
      userEmail: quote.userEmail,
      status: "PROPOSITION_ENVOYEE",
      createdAt: quote.createdAt,
      items: items.map((it) => ({
        description: it.description,
        totalFCFA: it.totalFCFA,
      })),
    });
  };

  return createPortal(
    <div
      id="admin-quote-proposal-modal-backdrop"
      role="dialog"
      aria-modal="true"
      data-lenis-prevent="true"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-hidden"
    >
      <div
        id="admin-quote-proposal-modal-card"
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[840px] my-auto flex flex-col bg-slate-900 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3.5 shrink-0 overflow-hidden transition-all duration-300 text-slate-100 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5 text-slate-300" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">
              Établir & Publier la Proposition Commerciale (Devis {quote.id})
            </h2>
            <p className="text-xs text-slate-400">
              Définissez le montant chiffré officiel, le bordereau de prestations et les conditions de réalisation.
            </p>
          </div>
        </div>

        {/* Client Specs Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Demandeur</span>
            <p className="font-bold text-white mt-0.5">{quote.userName} ({quote.userPhone})</p>
            <p className="text-slate-400">{quote.userEmail || "Non renseigné"} • {quote.region}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Projet / Pôle</span>
            <p className="font-bold text-amber-400 mt-0.5">{quote.serviceTitle}</p>
            <p className="text-slate-300">Pôle : {quote.pole} • Budget client : {formatCurrency(quote.budgetFCFA || 0, currency)}</p>
          </div>
        </div>

        {/* Form Controls */}
        <div className="space-y-3">
          
          {/* Amount & Validity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Montant Total Officiel (FCFA) <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                step={25000}
                value={proposalAmount}
                onChange={(e) => setProposalAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Date de Validité du Devis
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Expert / Chef de Projet Assigné
              </label>
              <select
                value={assignedExpert}
                onChange={(e) => setAssignedExpert(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none cursor-pointer truncate"
              >
                <option value="Équipe Ingénierie SEN AURA TECH">Équipe Ingénierie SEN AURA TECH</option>
                {adminPros.map((p) => (
                  <option key={p.id} value={p.fullName}>
                    {p.fullName} ({p.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">
                Bordereau des Prestations & Fournitures
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
              </button>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                  <input
                    type="text"
                    value={it.description}
                    onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                    placeholder="Description de la prestation..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-slate-400">Qté:</span>
                      <input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => handleUpdateItem(idx, "quantity", Number(e.target.value))}
                        className="w-14 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-center text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-slate-400">PU FCFA:</span>
                      <input
                        type="number"
                        step={10000}
                        value={it.unitPriceFCFA}
                        onChange={(e) => handleUpdateItem(idx, "unitPriceFCFA", Number(e.target.value))}
                        className="w-24 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                      />
                    </div>
                    <span className="font-mono font-bold text-amber-400 w-24 text-right shrink-0">
                      {formatCurrency(it.totalFCFA, currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                      title="Supprimer la ligne"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Notes & SLA */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Clauses Techniques, Délais & Modalités de Règlement
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadAdminPDF}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Prévisualiser / Télécharger le PDF (Admin)</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={isPublishing}
              onClick={handlePublish}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>{isPublishing ? "Publication..." : "Publier & Transmettre au Client"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
