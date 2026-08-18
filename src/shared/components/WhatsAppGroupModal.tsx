import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  Sparkles,
  Briefcase,
  GraduationCap,
  Users2
} from "lucide-react";
import { WhatsAppIcon } from "./SocialCommunityPills";
import { useSystemConfig } from "../../config/system-config";

interface WhatsAppGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppGroupModal: React.FC<WhatsAppGroupModalProps> = ({ isOpen, onClose }) => {
  const config = useSystemConfig();
  const [copied, setCopied] = useState(false);

  const groupLink =
    config.socials.whatsappGroup ||
    config.homeShowcase.community.whatsappGroupLink ||
    "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4";

  const customQrImage =
    config.socials.whatsappQrCodeImage ||
    config.homeShowcase.community.whatsappQrCodeImage ||
    "";

  useEffect(() => {
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

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        (window as any).__lenis?.start();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(groupLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Communauté Officielle WhatsApp — SEN AURA TECH",
          text: "Rejoignez la communauté officielle SEN AURA TECH sur WhatsApp pour accéder aux opportunités tech, formations et missions au Sénégal :",
          url: groupLink,
        })
        .catch(() => null);
    } else {
      handleCopyLink();
    }
  };

  return createPortal(
    <AnimatePresence>
      <div
        id="whatsapp-modal-backdrop"
        role="dialog"
        aria-modal="true"
        data-lenis-prevent="true"
        className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden select-none"
      >
        {/* Modal Container */}
        <motion.div
          id="whatsapp-modal-container"
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg sm:max-w-2xl rounded-2xl sm:rounded-3xl bg-slate-900 border border-emerald-500/30 text-white shadow-2xl overflow-hidden shrink-0 flex flex-col my-auto"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-20 -right-20 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Bar */}
          <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#25D366] to-[#128C7E] flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/25">
                <WhatsAppIcon className="w-4.5 h-4.5 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Communauté WhatsApp
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold text-emerald-400">
                    Officiel
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                  SEN AURA TECH Écosystème
                </p>
              </div>
            </div>

            <button
              id="btn-close-whatsapp-modal"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body - 2 Columns on Tablet/Desktop, Compact on Mobile */}
          <div className="relative z-10 p-3.5 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-5 items-center">
            
            {/* Left Column: QR Code Card */}
            <div className="sm:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[210px] sm:max-w-full bg-white rounded-2xl p-3 shadow-xl flex flex-col items-center text-slate-900 border border-slate-200">
                {/* Brand Badge */}
                <div className="w-9 h-9 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center shadow -mt-1.5 mb-1.5 p-0.5 overflow-hidden">
                  <div className="flex items-center justify-center text-[8px] font-black tracking-tighter text-amber-400">
                    <span className="text-slate-100 font-black">SEN</span>
                    <span className="text-amber-400 font-black ml-0.5">AURA</span>
                  </div>
                </div>

                <h4 className="text-[11px] font-black tracking-tight text-slate-950 uppercase font-sans">
                  SEN AURA TECH
                </h4>
                <p className="text-[9px] text-slate-500 font-medium italic mb-2">
                  Groupe WhatsApp Officiel
                </p>

                {/* QR Code Container */}
                <div className="relative p-1.5 rounded-xl bg-white border border-slate-900/80 shadow-sm flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40">
                  {customQrImage ? (
                    <img
                      src={customQrImage}
                      alt="Code QR Groupe WhatsApp SEN AURA TECH"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                          groupLink
                        )}&color=0-0-0&bgcolor=255-255-255&margin=0`}
                        alt="Code QR Groupe WhatsApp SEN AURA TECH"
                        className="w-full h-full object-contain rounded-md"
                      />
                      {/* WhatsApp center badge */}
                      <div className="absolute w-7 h-7 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center shadow-md">
                        <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                          <WhatsAppIcon className="w-3 h-3 fill-white" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-[9px] text-slate-600 font-medium mt-1.5 text-center leading-tight">
                  Scannez avec la caméra WhatsApp
                </p>
              </div>
            </div>

            {/* Right Column: Information, Perks & Quick Actions */}
            <div className="sm:col-span-7 flex flex-col justify-between space-y-2.5 sm:space-y-3">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] sm:text-[11px] font-semibold self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Groupe officiel vérifié & modéré</span>
              </div>

              {/* Exclusive Perks */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Avantages membres exclusifs</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-[10px] sm:text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                      <Briefcase className="w-3 h-3" />
                    </div>
                    <span className="leading-tight">Appels d'offres & missions tech prioritaires</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
                      <GraduationCap className="w-3 h-3" />
                    </div>
                    <span className="leading-tight">Bourses Academy & réductions matériel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
                      <Users2 className="w-3 h-3" />
                    </div>
                    <span className="leading-tight">Réseau d'experts, veille et partenariats</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <a
                  id="btn-join-whatsapp-group"
                  href={groupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:brightness-110 active:scale-[0.99] text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
                  <span>Rejoindre le Groupe WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-copy-whatsapp-link"
                    type="button"
                    onClick={handleCopyLink}
                    className="py-2 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Lien copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copier le lien</span>
                      </>
                    )}
                  </button>

                  <button
                    id="btn-share-whatsapp-group"
                    type="button"
                    onClick={handleShare}
                    className="py-2 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Partager</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};


