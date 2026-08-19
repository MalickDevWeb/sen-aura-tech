import React, { useRef, useState } from "react";
import { Download, Printer, Share2, Check, X, Award, ShieldCheck, Sparkles, ExternalLink, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { downloadElementAsPDF } from "../lib/pdfGenerator";
import { useDialog } from "../shared/components/CustomDialog";

export interface CertificateData {
  id: string;
  studentName: string;
  courseTitle: string;
  issueDate?: string;
  scoreOrMention?: string;
  badgeTitle?: string;
  instructorName?: string;
  hoursCount?: number | string;
}

interface OfficialCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateData | null;
}

export const OfficialCertificateModal: React.FC<OfficialCertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  const { openDialog, dialog } = useDialog();

  if (!isOpen || !certificate) return null;

  const id = certificate.id || "CERT-SAT-2026-001";
  const student = certificate.studentName || "Apprenant SEN AURA";
  const course = certificate.courseTitle || "Formation Spécialisée SEN AURA TECH";
  const date = certificate.issueDate || "12 Août 2026";
  const score = certificate.scoreOrMention || "100% Validation Pratique (Mention Excellent)";
  const badge = certificate.badgeTitle || "Certified Tech Specialist";
  const instructor = certificate.instructorName || "Dr. Amadou Ba";
  const hours = certificate.hoursCount || 40;

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    setIsGenerating(true);

    try {
      const fileName = `Certificat_SENAURA_${student.replace(/[^a-zA-Z0-9]/g, "_")}_${id}.pdf`;
      const success = await downloadElementAsPDF(certRef.current, fileName, {
        orientation: "landscape",
        format: "a4",
        fallbackData: {
          title: `Certificat Officiel — ${course}`,
          studentName: student,
          id: id,
          details: [
            `Specialisation : ${badge}`,
            `Evaluation : ${score}`,
            `Délivré le : ${date}`,
            `Formateur : ${instructor}`,
            `Volume horaire : ${hours} Heures`,
          ],
        },
      });

      if (!success) {
        openDialog({
          type: "alert",
          title: "Téléchargement impossible",
          message: "Impossible de télécharger le PDF. Veuillez réessayer ou utiliser l'option Imprimer.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const verifyUrl = `https://www.senauratech.com/verify/${id}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {dialog}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 max-w-5xl w-full space-y-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Certificat Officiel de Réussite</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Vérifié & Authentique
                </span>
              </div>
              <p className="text-xs text-slate-400">Réf. Cryptographique : <span className="font-mono text-amber-400 font-bold">{id}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Copier le lien de vérification"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? "Lien copié !" : "Copier le Lien"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Imprimer"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Génération du PDF HD...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Télécharger PDF Officiel</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CERTIFICATE PREVIEW CONTAINER (Design A4 Landscape aspect ratio 297/210) */}
        <div className="overflow-x-auto p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <div
            ref={certRef}
            className="w-[1000px] h-[707px] mx-auto bg-white text-slate-900 p-10 relative flex flex-col justify-between select-none shadow-2xl font-serif text-center"
            style={{
              backgroundImage: "radial-gradient(circle at 50% 50%, rgba(245, 240, 225, 0.6) 0%, rgba(255, 255, 255, 1) 100%)",
            }}
          >
            {/* Outer Luxurious Ornamental Guilloche Border */}
            <div className="absolute inset-4 border-[6px] border-amber-600/80 rounded-sm pointer-events-none" />
            <div className="absolute inset-6 border-2 border-slate-800/20 rounded-sm pointer-events-none" />
            
            {/* Corner Ornaments */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-amber-600 pointer-events-none" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-amber-600 pointer-events-none" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-amber-600 pointer-events-none" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-amber-600 pointer-events-none" />

            {/* Background Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <div className="w-96 h-96 rounded-full border-[20px] border-amber-800 flex items-center justify-center font-sans font-black text-9xl text-amber-900">
                SA
              </div>
            </div>

            {/* CERTIFICATE TOP HEADER */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-2">
              <div className="flex items-center gap-3 text-left">
                <div className="w-14 h-14 rounded-xl bg-slate-900 p-2 shadow-md border border-amber-500/40 flex flex-col items-center justify-center shrink-0 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-amber-700/30" />
                  <ShieldCheck className="w-7 h-7 text-amber-400 stroke-[2.2] relative z-10" />
                  <span className="text-[7px] font-sans font-black tracking-widest text-amber-300 uppercase relative z-10 mt-0.5">SEN AURA</span>
                </div>
                <div>
                  <h4 className="font-sans font-black text-sm tracking-wider text-slate-900 uppercase">SEN AURA TECH SÉNÉGAL</h4>
                  <p className="font-sans text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Ecosystème Numérique & Académie Certifiante</p>
                  <p className="font-sans text-[9px] text-amber-700 font-bold uppercase">Dakar • Thiès • Saint-Louis • Ziguinchor</p>
                </div>
              </div>

              <div className="text-right font-sans space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded border border-amber-200 text-amber-800 text-[10px] font-bold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>DIPLÔME HOMOLOGUÉ SÉNÉGAL</span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 font-bold">N° d'enregistrement : <span className="text-slate-900 font-black tracking-wide">{id}</span></p>
              </div>
            </div>

            {/* MAIN TITLE SECTION */}
            <div className="relative z-10 my-auto px-12 space-y-3">
              <div className="inline-block relative">
                <h1 className="font-serif font-extrabold text-3xl tracking-wider text-slate-900 uppercase border-b-2 border-amber-600/80 pb-1">
                  Certificat Officiel de Réussite
                </h1>
                <p className="font-sans text-xs font-bold tracking-[0.25em] text-amber-700 uppercase mt-1">
                  SEN AURA ACADEMY & CENTER FOR CONTINUING EDUCATION
                </p>
              </div>

              <p className="font-serif italic text-slate-600 text-sm mt-2">
                Le Conseil Scientifique et la Direction Générale de SEN AURA TECH attestent solennellement que
              </p>

              {/* STUDENT NAME */}
              <div className="py-2">
                <h2 className="font-serif font-black text-3xl text-amber-800 tracking-wide underline decoration-amber-500/40 underline-offset-8">
                  {student}
                </h2>
              </div>

              <p className="font-serif italic text-slate-600 text-sm">
                a suivi avec succès le programme de formation certifiant intensif de <span className="font-bold text-slate-900 font-sans">{hours} Heures</span> et a satisfait à l'ensemble des exigences théoriques, pratiques et d'évaluation sur le thème :
              </p>

              {/* COURSE TITLE */}
              <div className="py-1 px-6 bg-slate-50 rounded-xl border border-slate-200 inline-block max-w-3xl">
                <h3 className="font-sans font-black text-xl text-slate-900 tracking-tight">
                  {course}
                </h3>
                <p className="font-sans text-xs font-bold text-emerald-700 mt-0.5">
                  Spécialisation : {badge}
                </p>
              </div>

              {/* SCORE & MENTION */}
              <div className="pt-2 flex items-center justify-center gap-6 font-sans text-xs">
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
                  Évaluation Finale : <span className="font-bold text-amber-800">{score}</span>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
                  Délivré le : <span className="font-bold text-slate-900">{date}</span>
                </div>
              </div>
            </div>

            {/* CERTIFICATE FOOTER WITH QR MEDALLION, SIGNATURES & METALLIC SEAL */}
            <div className="relative z-10 flex items-end justify-between px-6 pb-2 font-sans">
              
              {/* Column 1: Luxury QR Code Medallion */}
              <div className="flex items-center gap-2.5 text-left w-44 bg-amber-50/60 p-1.5 rounded-xl border border-amber-200/80 shadow-sm">
                <div className="p-1 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 rounded-lg shadow-sm shrink-0">
                  <div className="bg-white p-0.5 rounded">
                    <QRCodeCanvas
                      value={`https://www.senauratech.com/verify/${id}`}
                      size={48}
                      level="M"
                      fgColor="#0f172a"
                      bgColor="#ffffff"
                    />
                  </div>
                </div>
                <div className="space-y-0.5 font-sans">
                  <span className="text-[8px] font-mono font-black text-amber-900 uppercase tracking-tight block">
                    VÉRIFICATION QR
                  </span>
                  <p className="text-[7.5px] text-slate-600 font-medium leading-tight">
                    Scannez pour valider l'authenticité
                  </p>
                  <span className="text-[7px] font-mono text-slate-800 font-bold block truncate">
                    ID: {id}
                  </span>
                </div>
              </div>

              {/* Column 2: Academic Signature */}
              <div className="text-center w-44 space-y-1">
                <div className="h-11 flex items-center justify-center border-b border-slate-400">
                  <span className="font-serif italic text-base text-slate-800 font-bold opacity-85">Dr. Amadou Ba</span>
                </div>
                <p className="text-[9.5px] font-bold text-slate-800 uppercase tracking-wider">{instructor}</p>
                <p className="text-[8.5px] text-slate-500 font-medium">Directeur Académique & R&D SEN AURA</p>
              </div>

              {/* Column 3: Central Golden Foil Seal */}
              <div className="relative flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 p-0.5 shadow-lg flex items-center justify-center relative">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-amber-900/40 bg-gradient-to-br from-amber-500 to-yellow-700 flex flex-col items-center justify-center text-slate-950 p-1.5 text-center shadow-inner">
                    <Award className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                    <span className="text-[6.5px] font-black uppercase tracking-widest text-slate-950 leading-tight">
                      SEAL OF EXCELLENCE
                    </span>
                    <span className="text-[5.5px] font-extrabold text-slate-900">SÉNÉGAL 2026</span>
                  </div>
                </div>
                <p className="text-[7.5px] font-mono font-bold text-amber-800 mt-1 uppercase tracking-wider">
                  Sceau Officiel d'État
                </p>
              </div>

              {/* Column 4: Director General Signature */}
              <div className="text-center w-44 space-y-1">
                <div className="h-11 flex items-center justify-center border-b border-slate-400 relative">
                  <span className="font-serif italic text-lg text-amber-900 font-extrabold opacity-90">Mamadou Sow</span>
                </div>
                <p className="text-[9.5px] font-bold text-slate-800 uppercase tracking-wider">Mamadou Sow</p>
                <p className="text-[8.5px] text-slate-500 font-medium">Directeur Général SEN AURA TECH</p>
              </div>

            </div>

            {/* Bottom Cryptographic Security Bar */}
            <div className="relative z-10 pt-1 border-t border-slate-200 flex justify-between items-center text-[8px] font-mono text-slate-400 font-semibold px-4">
              <span>SECURITY HASH: 0x8F9A...412B • VERIFICATION EN LIGNE SUR WWW.SENAURATECH.SN/VERIFY</span>
              <span>© SEN AURA TECH - DAKAR, SÉNÉGAL</span>
            </div>

          </div>
        </div>

        {/* Modal Bottom Information Notice */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Ce document est sécurisé et reconnu par les entreprises partenaires de l'écosystème **SEN AURA TECH**.
            </span>
          </div>
          <a
            href={`https://www.senauratech.com/verify/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 shrink-0"
          >
            Vérifier en ligne <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
