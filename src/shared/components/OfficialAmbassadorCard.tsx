import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Printer,
  Share2,
  Copy,
  Check,
  Camera,
  Upload,
  ShieldCheck,
  Award,
  Sparkles,
  QrCode,
  RotateCw,
  Phone,
  MapPin,
  ExternalLink,
  Wifi,
  Eye,
  BadgeCheck
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { downloadElementAsPDF, downloadElementAsPNG, getElementAsPngFile } from "../../lib/pdfGenerator";

export interface AmbassadorCardData {
  ambassadorCode: string;
  fullName: string;
  phone: string;
  email: string;
  region: string;
  photoUrl?: string;
  roleTitle?: string;
  issueDate?: string;
  validUntil?: string;
}

interface OfficialAmbassadorCardProps {
  data: AmbassadorCardData;
  referralLink: string;
  onUpdatePhoto?: (newPhotoUrl: string) => void;
}

const PRESET_AVATARS = [
  {
    name: "Consultant 1",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
  },
  {
    name: "Consultante 2",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
  },
  {
    name: "Manager 3",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  },
  {
    name: "Ingénieur 4",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80"
  },
  {
    name: "Directrice 5",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80"
  },
  {
    name: "Expert B2B 6",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80"
  }
];

export const OfficialAmbassadorCard: React.FC<OfficialAmbassadorCardProps> = ({
  data,
  referralLink,
  onUpdatePhoto
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cardSide, setCardSide] = useState<"front" | "back">("front");
  const [photoUrl, setPhotoUrl] = useState<string>(
    data.photoUrl || PRESET_AVATARS[0].url
  );
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const [shareNoticeModal, setShareNoticeModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        triggerToast("Veuillez sélectionner une image de moins de 5 Mo");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoUrl(result);
        if (onUpdatePhoto) onUpdatePhoto(result);
        setShowPhotoModal(false);
        triggerToast("Photo de profil mise à jour avec succès !");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url: string) => {
    setPhotoUrl(url);
    if (onUpdatePhoto) onUpdatePhoto(url);
    setShowPhotoModal(false);
    triggerToast("Avatar professionnel sélectionné !");
  };

  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    setIsDownloadingPng(true);
    triggerToast("Génération de l'image HD en cours...");
    try {
      const fileName = `Badge_Ambassadeur_SENAURA_${data.ambassadorCode || "VIP"}_${cardSide}.png`;
      await downloadElementAsPNG(cardRef.current, fileName, {
        backgroundColor: "#060913",
        pixelRatio: 3.0
      });
      triggerToast("Badge PNG haute définition téléchargé !");
    } catch (err) {
      console.error("Erreur téléchargement PNG:", err);
      triggerToast("Erreur lors de la capture de l'image.");
    } finally {
      setIsDownloadingPng(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    triggerToast("Génération du Badge PDF officiel...");
    try {
      const fileName = `Accreditation_Ambassadeur_SENAURA_${data.ambassadorCode || "VIP"}.pdf`;
      await downloadElementAsPDF(cardRef.current, fileName, {
        orientation: "landscape",
        format: "a4"
      });
      triggerToast("Document d'accréditation PDF généré !");
    } catch (err) {
      console.error("Erreur téléchargement PDF:", err);
      triggerToast("Erreur lors de la génération du PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!cardRef.current) return;
    setIsSharingWhatsApp(true);
    const fileName = `Badge_Ambassadeur_SENAURA_${data.ambassadorCode}.png`;

    try {
      // 1. Download image automatically
      await downloadElementAsPNG(cardRef.current, fileName, {
        backgroundColor: "#060913",
        pixelRatio: 3.0
      });

      const shareMsg = `🌟 *CARTE OFFICIELLE D'AMBASSADEUR SEN AURA TECH*\n\n👤 *Nom:* ${data.fullName}\n🆔 *Matricule Agréé:* ${data.ambassadorCode}\n📍 *Région:* ${data.region || "Sénégal"}\n\n🔗 *Découvrez notre catalogue technologique & solutions solaires :*\n${referralLink}\n\n📞 Contact direct: ${data.phone}`;

      // 2. Try Web Share with file if supported
      const pngFile = await getElementAsPngFile(cardRef.current, fileName, {
        backgroundColor: "#060913",
        pixelRatio: 3.0
      });

      if (pngFile && navigator.canShare && navigator.canShare({ files: [pngFile] })) {
        try {
          await navigator.share({
            title: `Badge Ambassadeur SEN AURA TECH - ${data.fullName}`,
            text: shareMsg,
            files: [pngFile]
          });
          setIsSharingWhatsApp(false);
          return;
        } catch (shareErr) {
          console.log("Web Share fallback:", shareErr);
        }
      }

      // 3. Fallback: Open WhatsApp & notice modal
      setShareNoticeModal(true);
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`;
      window.open(waUrl, "_blank");
    } catch (err) {
      console.error("Erreur partage WhatsApp:", err);
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    triggerToast("Lien de parrainage copié dans le presse-papiers !");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Dynamic Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-24 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 border border-amber-500/50 text-white text-xs font-bold shadow-2xl flex items-center gap-3 backdrop-blur-xl"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP CONTROL TOOLBAR - CLEAN & ACCURATE */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-800/90 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black text-white whitespace-nowrap">
                  Badge Officiel d'Accréditation
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold whitespace-nowrap">
                  ● VALIDE 2026-2027
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 flex-wrap mt-0.5">
                <span>Certifié SEN AURA TECH SÉNÉGAL</span>
                <span>•</span>
                <span className="text-slate-300 font-mono">
                  Matricule : <strong className="text-amber-400 font-black">{data.ambassadorCode}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ACCRÉDITÉ VIP</span>
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          {/* Flip Side Button */}
          <button
            onClick={() => setCardSide(cardSide === "front" ? "back" : "front")}
            className="py-2.5 px-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 shadow-sm"
          >
            <RotateCw className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-500 ${cardSide === "back" ? "rotate-180" : ""}`} />
            <span className="whitespace-nowrap">{cardSide === "front" ? "Voir Verso (NFC)" : "Voir Recto"}</span>
          </button>

          {/* Change Photo Button */}
          <button
            onClick={() => setShowPhotoModal(true)}
            className="py-2.5 px-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 shadow-sm"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span className="whitespace-nowrap">Changer la Photo</span>
          </button>

          {/* Download PNG Button */}
          <button
            onClick={handleDownloadPNG}
            disabled={isDownloadingPng}
            className="py-2.5 px-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            title="Télécharger l'image PNG haute résolution pour impression"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="whitespace-nowrap">{isDownloadingPng ? "Génération PNG..." : "Télécharger PNG (HD)"}</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            title="Générer et télécharger le badge au format officiel PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-950" />
            <span className="whitespace-nowrap">{isDownloading ? "Génération..." : "Télécharger Badge PDF"}</span>
          </button>
        </div>
      </div>

      {/* LUXURY SIGNATURE CARD DISPLAY CONTAINER */}
      <div className="flex justify-center items-center py-2 px-1">
        <motion.div
          key={cardSide}
          initial={{ opacity: 0, scale: 0.96, rotateY: cardSide === "front" ? -6 : 6 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          ref={cardRef}
          className="relative w-full max-w-2xl aspect-[1.62/1] rounded-3xl p-5 sm:p-7 overflow-hidden shadow-2xl border-2 border-amber-500/40 bg-gradient-to-br from-[#0b0d17] via-[#121526] to-[#070912] text-white flex flex-col justify-between transition-all duration-300"
          style={{
            boxShadow: "0 25px 60px -15px rgba(245, 158, 11, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.15)"
          }}
        >
          {/* Subtle Metallic Background Laser Grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(245, 158, 11, 0.5) 1px, transparent 0)",
              backgroundSize: "22px 22px"
            }}
          />

          {/* Holographic Shimmer Beam */}
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-br from-amber-400/20 via-sky-400/15 to-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-gradient-to-tr from-amber-500/20 via-yellow-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          {cardSide === "front" ? (
            /* ================= CARD RECTO (FRONT) ================= */
            <div className="relative z-10 h-full flex flex-col justify-between space-y-2.5 sm:space-y-3">
              {/* Top Card Header */}
              <div className="flex justify-between items-center border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-amber-500/30 border border-yellow-200/50">
                    SAT
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-sm sm:text-base tracking-wider text-white leading-none">
                        SEN AURA TECH
                      </h3>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono font-bold border border-amber-400/30">
                        OFFICIEL
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-400/90 tracking-widest uppercase mt-0.5">
                      Carte Professionnelle d'Ambassadeur
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-amber-500/30 text-[10px] font-bold text-amber-300 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nº {data.ambassadorCode}</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400" title="Puce Sécurisée">
                    <Wifi className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Main Card Body */}
              <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center my-auto">
                {/* Photo & Holographic Frame */}
                <div className="col-span-4 sm:col-span-3 flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-20 h-20 sm:w-26 sm:h-26 rounded-2xl overflow-hidden border-2 border-amber-400 p-0.5 bg-slate-950 shadow-2xl">
                      <img
                        src={photoUrl}
                        alt={data.fullName}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div
                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 text-slate-950 flex items-center justify-center shadow-lg"
                      title="Membre Officiel Certifié"
                    >
                      <BadgeCheck className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    </div>
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-mono font-bold text-emerald-400 mt-2 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 whitespace-nowrap">
                    ● CERTIFIÉ ACTIF
                  </span>
                </div>

                {/* Identity & Coordinates */}
                <div className="col-span-5 sm:col-span-6 space-y-1 sm:space-y-1.5 text-left">
                  <div>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Titulaire Accrédité
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-white leading-tight tracking-wide truncate">
                      {data.fullName}
                    </h4>
                  </div>

                  <div>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-amber-400 block font-bold">
                      Statut Partenaire
                    </span>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-200 truncate">
                      {data.roleTitle || "Apporteur d'Affaires & Partenaire Tech"}
                    </p>
                  </div>

                  <div className="space-y-0.5 text-[9px] sm:text-[10px] text-slate-300 font-mono pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{data.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate">{data.region || "Dakar"}, Sénégal</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Scannable Live QR Code */}
                <div className="col-span-3 flex flex-col items-center justify-center text-center">
                  <div
                    ref={qrRef}
                    onClick={() => setShowQrModal(true)}
                    className="p-1.5 bg-white rounded-2xl shadow-xl border-2 border-amber-400/80 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform group relative"
                    title="Cliquez pour agrandir le QR Code"
                  >
                    <QRCodeCanvas
                      value={referralLink}
                      size={68}
                      level="H"
                      marginSize={1}
                    />
                    <div className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] font-bold text-amber-300">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-amber-400 mt-1 tracking-tight flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    <span>SCANNEZ-MOI</span>
                  </span>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="border-t border-slate-800/90 pt-2 flex justify-between items-center text-[8px] sm:text-[9px] text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  {/* Microchip Design Simulation */}
                  <div
                    className="w-7 h-5 rounded-md bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 border border-yellow-200/60 flex items-center justify-center shadow-inner"
                    title="Smart Security Chip"
                  >
                    <div className="w-4 h-2.5 border border-slate-950/40 rounded-sm" />
                  </div>
                  <span className="text-slate-300 font-semibold whitespace-nowrap">PORTAIL NATIONAL AFFILIÉ</span>
                </div>
                <div className="text-amber-400 font-bold whitespace-nowrap">
                  VALIDITÉ : {data.validUntil || "2026 - 2027"}
                </div>
              </div>
            </div>
          ) : (
            /* ================= CARD VERSO (BACK / NFC) ================= */
            <div className="relative z-10 h-full flex flex-col justify-between space-y-2.5 text-left">
              {/* Back Header */}
              <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
                <div className="text-[10px] sm:text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>ENGAGEMENT CONTRACTUEL & ACCRÉDITATION</span>
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  SAT-AUTH-{data.ambassadorCode}
                </div>
              </div>

              {/* Magnetic Strip & NFC Zone */}
              <div className="w-full h-7 sm:h-8 bg-slate-950 border-y border-amber-500/30 rounded-lg flex items-center justify-between px-3">
                <span className="font-mono text-[8px] text-amber-400/80 tracking-widest overflow-hidden truncate">
                  ||||| |||||||| |||||||| |||||||| |||||||| |||||||| ||||
                </span>
                <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Wifi className="w-3 h-3 rotate-90" />
                  <span>NFC DIGITAL TOUCH</span>
                </span>
              </div>

              {/* Legal Charter & Referral Verification Box */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-8 text-[9px] sm:text-[10px] text-slate-300 leading-relaxed space-y-1.5">
                  <p>
                    Cette carte accrédite officiellement le titulaire pour la promotion des solutions
                    <strong> Solaires Hybrides, Cybersécurité, Vidéosurveillance IA, Réseaux & Formations</strong> du groupe SEN AURA TECH.
                  </p>
                  <p className="text-slate-400 text-[8px] sm:text-[9px]">
                    Toute commande validée via ce matricule ou QR code déclenche l'attribution immédiate des commissions contractuelles.
                  </p>
                </div>

                <div className="col-span-4 flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg text-center">
                  <QRCodeCanvas value={referralLink} size={58} level="M" />
                  <span className="text-[8px] text-amber-400 mt-1 font-mono font-bold">
                    Lien Direct Affilié
                  </span>
                </div>
              </div>

              {/* Back Footer */}
              <div className="border-t border-slate-800/90 pt-2 flex justify-between items-center text-[8px] sm:text-[9px] text-slate-400">
                <div>SEN AURA TECH SÉNÉGAL • Dakar Plateau</div>
                <div className="text-emerald-400 font-mono font-bold">
                  Support Réseau : +221 70 533 46 11
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* QUICK SHARING & PROMOTION BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button
          onClick={handleCopyLink}
          className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
          <span>{copiedLink ? "Lien Copié avec Succès !" : "Copier mon Lien d'Ambassadeur"}</span>
        </button>

        <button
          onClick={handleShareWhatsApp}
          disabled={isSharingWhatsApp}
          className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          <Share2 className="w-4 h-4" />
          <span>{isSharingWhatsApp ? "Préparation du partage..." : "Partager sur WhatsApp"}</span>
        </button>

        <button
          onClick={() => setShowQrModal(true)}
          className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm sm:col-span-2 lg:col-span-1"
        >
          <QrCode className="w-4 h-4 text-amber-400" />
          <span>Tester / Agrandir le QR Code</span>
        </button>
      </div>

      {/* QR CODE ENLARGED / TEST MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-left">
                <QrCode className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-black text-white">QR Code en Direct</span>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl border-4 border-amber-400">
              <QRCodeCanvas value={referralLink} size={180} level="H" marginSize={2} />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-white">
                Faites scanner ce code par vos prospects
              </p>
              <p className="text-[11px] text-slate-400 font-mono break-all px-2">
                {referralLink}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copier Lien</span>
              </button>
              <button
                onClick={() => window.open(referralLink, "_blank")}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Tester le Lien</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* WHATSAPP SHARE INSTRUCTION MODAL */}
      {shareNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 text-left shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">
                  Badge Téléchargé & WhatsApp Ouvert !
                </h4>
                <p className="text-[11px] text-emerald-400 font-mono font-bold">
                  PNG téléchargé sur votre appareil
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Le fichier image de votre badge officiel <strong>(Badge_Ambassadeur_SENAURA_{data.ambassadorCode}.png)</strong> vient d'être automatiquement enregistré dans vos Téléchargements.
            </p>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-emerald-400">
                <span>📲 Prochaine étape simple dans WhatsApp :</span>
              </p>
              <p className="text-slate-300 leading-normal">
                Dans la fenêtre WhatsApp qui s'est ouverte, il vous suffit de cliquer sur l'icône <strong>Trombone / Photo (📎)</strong> pour joindre et envoyer le fichier PNG téléchargé !
              </p>
            </div>

            <button
              onClick={() => setShareNoticeModal(false)}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider"
            >
              Compris, j'envoie le badge !
            </button>
          </div>
        </div>
      )}

      {/* PHOTO SELECTION MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <span>Changer la Photo d'Ambassadeur</span>
              </h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Custom Upload Button */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Importer une photo depuis votre appareil (Téléphone ou PC)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-dashed border-amber-500/40 text-amber-300 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Sélectionner une Image (JPG, PNG, WebP)</span>
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Ou choisir un Avatar Professionnel Studio
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {PRESET_AVATARS.map((avatar, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(avatar.url)}
                    className={`rounded-2xl overflow-hidden border-2 transition-all relative group h-24 ${
                      photoUrl === avatar.url
                        ? "border-amber-400 scale-105 shadow-lg shadow-amber-500/25"
                        : "border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                    {photoUrl === avatar.url && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-end justify-center pb-1">
                        <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded font-bold text-amber-300">Actif</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowPhotoModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
