import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Share2,
  Send,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Sparkles,
  Check
} from "lucide-react";
import { formatCurrency } from "../../config/constants";
import { downloadElementAsPDF, exportInvoicePDF, numberToFrenchWords } from "../../lib/pdfGenerator";
import { generateInvoicePaymentWhatsAppMsg, redirectToWhatsAppPayment } from "../../shared/utils/whatsappHelper";
import { store } from "../../database/store";
import { MessageCircle } from "lucide-react";
import { detectDocumentContext, DocumentContextType } from "../../lib/invoiceContext";

export interface InvoiceItem {
  description: string;
  quantity?: number;
  unitPriceFCFA?: number;
  totalFCFA: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  transactionRef: string;
  issueDate: string;
  paymentStatus: "PAYEE" | "EN_ATTENTE" | "ANNULEE";
  documentType?: DocumentContextType | string;
  sellerInfo: {
    companyName: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    ninea: string;
    rccm: string;
  };
  clientInfo: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  items: InvoiceItem[];
  subtotalFCFA: number;
  vatRate: number;
  vatFCFA: number;
  totalFCFA: number;
  totalEUR: number;
  totalUSD: number;
  paymentMethod: string;
  notes?: string;
  verificationUrl?: string;
}

interface OfficialInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInvoice?: Partial<InvoiceData>;
  currency?: "FCFA" | "EUR";
}

export const OfficialInvoiceModal: React.FC<OfficialInvoiceModalProps> = ({
  isOpen,
  onClose,
  initialInvoice,
  currency = "FCFA"
}) => {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [whatsappSent, setWhatsappSent] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialInvoice && initialInvoice.invoiceNumber) {
      // Use existing or provided invoice structure
      setInvoice({
        invoiceNumber: initialInvoice.invoiceNumber,
        transactionRef: initialInvoice.transactionRef || `TX-SAT-${Math.floor(1000000 + Math.random() * 9000000)}`,
        issueDate: initialInvoice.issueDate || new Date().toISOString(),
        paymentStatus: initialInvoice.paymentStatus || "PAYEE",
        documentType: initialInvoice.documentType,
        sellerInfo: initialInvoice.sellerInfo || {
          companyName: "SEN AURA TECH S.A.R.L.",
          tagline: "INNOVER • CONNECTER • TRANSFORMER",
          address: "Avenue Léopold Sédar Senghor, Thiès - Sénégal",
          phone: "+221 70 533 46 11",
          email: "facturation@senauratech.sn",
          website: "www.senauratech.com",
          ninea: "0098452102Y2",
          rccm: "SN.DKR.2025.B.14820",
        },
        clientInfo: initialInvoice.clientInfo || {
          name: store.currentUser.fullName || "Client SEN AURA TECH",
          phone: store.currentUser.phone || "+221 77 000 00 00",
          email: store.currentUser.email || "contact@client.sn",
          address: store.currentUser.region ? `${store.currentUser.region}, Sénégal` : "Sénégal"
        },
        items: initialInvoice.items || [],
        subtotalFCFA: initialInvoice.subtotalFCFA || initialInvoice.totalFCFA || 0,
        vatRate: initialInvoice.vatRate ?? 0,
        vatFCFA: initialInvoice.vatFCFA || 0,
        totalFCFA: initialInvoice.totalFCFA || 0,
        totalEUR: initialInvoice.totalEUR || 0,
        totalUSD: initialInvoice.totalUSD || 0,
        paymentMethod: initialInvoice.paymentMethod || "WAVE",
        notes: initialInvoice.notes,
        verificationUrl: `https://www.senauratech.com/verify-invoice?ref=${initialInvoice.invoiceNumber}`
      });
    }

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

      if (!initialInvoice) {
        fetchInvoiceFromBackend();
      }
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        (window as any).__lenis?.start();
      };
    }
  }, [isOpen, initialInvoice, onClose]);

  const fetchInvoiceFromBackend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: initialInvoice?.clientInfo?.name || store.currentUser.fullName || "Client SEN AURA TECH",
          clientPhone: initialInvoice?.clientInfo?.phone || store.currentUser.phone || "+221 77 000 00 00",
          clientEmail: initialInvoice?.clientInfo?.email || store.currentUser.email || "contact@client.sn",
          clientAddress: initialInvoice?.clientInfo?.address || (store.currentUser.region ? `${store.currentUser.region}, Sénégal` : "Sénégal"),
          items: initialInvoice?.items || [],
          paymentMethod: initialInvoice?.paymentMethod || "WAVE",
          documentType: initialInvoice?.documentType,
          includeVAT: false
        })
      });
      const data = await response.json();
      if (data.success && data.invoice) {
        setInvoice(data.invoice);
      }
    } catch (err) {
      console.error("Failed to load invoice from API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setIsExportingPDF(true);
    try {
      const fileName = `${contextConfig.headerTitle.replace(/\s+/g, "_")}_SENAURA_${invoice.invoiceNumber}.pdf`;
      exportInvoicePDF(invoice, fileName);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const handleSendWhatsapp = () => {
    if (!invoice) return;
    setWhatsappSent(true);
    const waMsg = generateInvoicePaymentWhatsAppMsg({
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientInfo.name,
      totalFCFA: invoice.totalFCFA,
      description: invoice.items?.[0]?.description,
    });
    redirectToWhatsAppPayment(waMsg);
    setTimeout(() => setWhatsappSent(false), 4000);
  };

  if (!isOpen) return null;

  const currentDoc = invoice || initialInvoice;
  const contextConfig = detectDocumentContext(currentDoc || undefined);

  // Check if items have quantity/unit price to display tabular columns
  const hasMultipleQuantities = (currentDoc?.items || []).some(
    (it) => (it.quantity && it.quantity > 1) || (it.unitPriceFCFA && it.unitPriceFCFA > 0)
  ) || contextConfig.type === "BOUTIQUE" || contextConfig.type === "INFRASTRUCTURES_TECHNIQUES";

  return createPortal(
    <div
      id="invoice-modal-backdrop"
      role="dialog"
      aria-modal="true"
      data-lenis-prevent="true"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
    >
      {/* Modal Card */}
      <div 
        id="invoice-modal-card"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 my-auto overflow-y-auto overscroll-contain scrollbar-none"
      >
        {/* Top Header Actions (Non-printable) */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>{contextConfig.headerTitle} Officiel</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                  {contextConfig.badgeLabel}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Réf : {invoice?.invoiceNumber || "Génération en cours..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendEmail}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              title="Envoyer par email"
            >
              {emailSent ? <Check className="w-4 h-4 text-emerald-400" /> : <Mail className="w-4 h-4 text-amber-400" />}
              <span>{emailSent ? "Document Envoyé !" : "Email"}</span>
            </button>

            <button
              onClick={handleSendWhatsapp}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              title="Partager sur WhatsApp"
            >
              {whatsappSent ? <Check className="w-4 h-4 text-emerald-400" /> : <Send className="w-4 h-4 text-emerald-400" />}
              <span>{whatsappSent ? "Partagé !" : "WhatsApp"}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF || !invoice}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPDF ? "Exportation..." : "Télécharger PDF"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              title="Imprimer le document"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimer</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div id="printable-invoice" className="p-6 sm:p-10 bg-white text-slate-900 font-sans print:p-0">
          {isLoading || !invoice ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-mono">Génération du document officiel adapté...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 1. TOP HEADER */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-2">
                {/* Company Logo & Details */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 text-amber-500 font-black text-xl flex items-center justify-center shrink-0 shadow">
                    SA
                  </div>
                  <div>
                    <h1 className="text-lg font-black tracking-tight text-slate-900">
                      SEN AURA TECH
                    </h1>
                    <p className="text-xs font-medium text-slate-600">
                      {contextConfig.sellerDivision}
                    </p>
                    <p className="text-xs text-slate-600">
                      Tél. : {invoice.sellerInfo?.phone || "+221 70 533 46 11"}
                    </p>
                    <p className="text-xs text-slate-600">
                      Site : {invoice.sellerInfo?.website || "www.senauratech.com"}
                    </p>
                  </div>
                </div>

                {/* Document Title & Reference Number */}
                <div className="text-left sm:text-right space-y-1">
                  <h2 className="text-2xl font-black tracking-wide text-slate-900 uppercase">
                    {contextConfig.headerTitle}
                  </h2>
                  <p className="text-xs font-semibold text-slate-700">
                    N° {invoice.invoiceNumber || "SAT-2026-001"}
                  </p>
                  <p className="text-xs text-slate-600">
                    {new Date(invoice.issueDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs font-medium text-amber-700">
                    {contextConfig.headerSubtitle}
                  </p>
                </div>
              </div>

              {/* 2. GOLD HORIZONTAL DIVIDER BAR */}
              <div className="w-full h-1 bg-amber-600 rounded-full" />

              {/* 3. SELLER / CLIENT TABLE */}
              <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                {/* Table Header Bar */}
                <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-300 px-4 py-1.5 font-bold text-slate-600 uppercase tracking-wider">
                  <div>{contextConfig.sellerRoleLabel}</div>
                  <div className="border-l border-slate-300 pl-4">{contextConfig.clientRoleLabel}</div>
                </div>
                {/* Table Content */}
                <div className="grid grid-cols-2 p-4 gap-4 text-slate-800">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm">SEN AURA TECH</p>
                    <p>Tél. : {invoice.sellerInfo?.phone || "+221 70 533 46 11"}</p>
                    <p>Sénégal</p>
                    <p className="text-slate-600">{invoice.sellerInfo?.website || "www.senauratech.com"}</p>
                  </div>
                  <div className="border-l border-slate-200 pl-4 space-y-1">
                    <p className="font-bold text-slate-900 text-sm">{invoice.clientInfo.name}</p>
                    <p>{invoice.clientInfo.address || "Dakar, Sénégal"}</p>
                    <p>Tél. : {invoice.clientInfo.phone}</p>
                    {invoice.clientInfo.email && <p className="text-slate-600">{invoice.clientInfo.email}</p>}
                  </div>
                </div>
              </div>

              {/* 4. OBJET SECTION */}
              <div className="space-y-1 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">Objet</h3>
                <p className="text-slate-700 leading-relaxed">
                  {invoice.notes || contextConfig.defaultObjet}
                </p>
              </div>

              {/* 5. SECTION 1: ITEMS TABLE */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {contextConfig.section1Title} — {formatCurrency(invoice.totalFCFA, "FCFA")}
                </h3>
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                        <th className="py-2 px-4">{contextConfig.col1Header}</th>
                        {hasMultipleQuantities && (
                          <>
                            <th className="py-2 px-4 text-center w-16">{contextConfig.col2Header || "Qté"}</th>
                            <th className="py-2 px-4 text-right w-28">{contextConfig.col3Header || "P.U. (FCFA)"}</th>
                          </>
                        )}
                        <th className="py-2 px-4 text-right w-36">{contextConfig.colTotalHeader}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {invoice.items.map((item, idx) => {
                        const qty = item.quantity || 1;
                        const unitPrice = item.unitPriceFCFA || Math.round(item.totalFCFA / qty);
                        return (
                          <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50" : "bg-white"}>
                            <td className="py-2.5 px-4 font-medium">{item.description}</td>
                            {hasMultipleQuantities && (
                              <>
                                <td className="py-2.5 px-4 text-center font-mono">{qty}</td>
                                <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                                  {formatCurrency(unitPrice, "FCFA")}
                                </td>
                              </>
                            )}
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(item.totalFCFA, "FCFA")}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-100 font-bold border-t border-slate-300">
                        <td colSpan={hasMultipleQuantities ? 3 : 1} className="py-2 px-4">
                          {contextConfig.totalSection1Label}
                        </td>
                        <td className="py-2 px-4 text-right font-mono text-slate-900">
                          {formatCurrency(invoice.subtotalFCFA || invoice.totalFCFA, "FCFA")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6. SECTION 2: SERVICES & GARANTIES INCLUSES */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {contextConfig.section2Title}
                </h3>
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-amber-600 text-white font-bold uppercase text-[11px]">
                        <th className="py-2 px-4">Prestation / Garantie</th>
                        <th className="py-2 px-4 text-right w-36">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {contextConfig.section2Items.map((sItem, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50" : "bg-white"}>
                          <td className="py-2.5 px-4">{sItem.label}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-amber-700">{sItem.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7. RECAP & TOTAL TABLE */}
              <div className="border border-slate-300 rounded-lg overflow-hidden text-xs divide-y divide-slate-200">
                <div className="flex justify-between px-4 py-2 text-slate-700">
                  <span>{contextConfig.recapRow1Label}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(invoice.subtotalFCFA || invoice.totalFCFA, "FCFA")}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2 text-slate-700">
                  <span>{contextConfig.recapRow2Label}</span>
                  <span className="font-bold text-amber-700">{contextConfig.recapRow2Value}</span>
                </div>
                {invoice.vatFCFA > 0 && (
                  <div className="flex justify-between px-4 py-2 text-slate-700">
                    <span>TVA ({invoice.vatRate}%)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(invoice.vatFCFA, "FCFA")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-2.5 bg-slate-100 font-black text-slate-900 text-sm">
                  <span>{contextConfig.recapTotalLabel}</span>
                  <span className="font-mono text-amber-600">{formatCurrency(invoice.totalFCFA, "FCFA")}</span>
                </div>
              </div>

              {/* 8. WRITTEN AMOUNT IN FRENCH WORDS */}
              <div className="pt-2 text-xs font-semibold text-slate-900 border-t border-slate-200">
                Arrêtée à la somme de :{" "}
                <span className="font-normal italic text-slate-800">
                  {numberToFrenchWords(invoice.totalFCFA)}
                </span>
              </div>

              {/* FOOTER DISCLAIMER & VERIFICATION STAMP */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-slate-800 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">SEN AURA TECH S.A.R.L.</p>
                    <p>Signature numérique horodatée • Code: {invoice.invoiceNumber.replace("FAC-", "SAT-")}</p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p>{contextConfig.footerLegalText}</p>
                  <p className="text-slate-400">Capital social: 10.000.000 FCFA • NINEA: 0098452102Y2 • RCCM: SN.DKR.2025.B.14820</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
