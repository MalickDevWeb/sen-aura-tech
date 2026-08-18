import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Video,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Eye,
  X,
  Sparkles,
  Zap,
  HardDrive,
  CloudLightning,
  ShieldCheck,
  Cpu
} from "lucide-react";
import confetti from "canvas-confetti";
import { uploadToCloudinary, CloudinaryUploadResult } from "../../lib/cloudinary";

export interface CloudinaryDropzoneProps {
  id?: string;
  value?: string;
  onChange: (url: string, meta?: CloudinaryUploadResult | null) => void;
  folder?: string;
  acceptedTypes?: "all" | "image" | "video" | "document" | "image_or_video";
  maxSizeMB?: number;
  label?: string;
  subLabel?: string;
  compact?: boolean;
  className?: string;
  showPreview?: boolean;
  placeholderPreset?: string;
}

export const CloudinaryDropzone: React.FC<CloudinaryDropzoneProps> = ({
  id,
  value,
  onChange,
  folder = "sen_aura_uploads",
  acceptedTypes = "image_or_video",
  maxSizeMB = 50,
  label,
  subLabel,
  compact = false,
  className = "",
  showPreview = true,
  placeholderPreset,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState("");
  const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);
  const [currentFileMeta, setCurrentFileMeta] = useState<{
    name: string;
    sizeFormatted: string;
    type: string;
    isVideo: boolean;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [lastUploadedMeta, setLastUploadedMeta] = useState<CloudinaryUploadResult | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isVideo =
    value?.endsWith(".mp4") ||
    value?.endsWith(".webm") ||
    value?.endsWith(".mov") ||
    value?.includes("video/") ||
    lastUploadedMeta?.resource_type === "video";

  const isPdf =
    value?.endsWith(".pdf") ||
    lastUploadedMeta?.format === "pdf";

  // Format bytes to human readable
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getAcceptString = (): string => {
    switch (acceptedTypes) {
      case "image":
        return "image/jpeg,image/png,image/webp,image/gif,image/*";
      case "video":
        return "video/mp4,video/webm,video/quicktime,video/*";
      case "document":
        return ".pdf,.doc,.docx,.ppt,.pptx";
      case "image_or_video":
      default:
        return "image/jpeg,image/png,image/webp,image/*,video/mp4,video/webm,video/quicktime,video/*";
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;

    setErrorMsg(null);
    setShowSuccessBadge(false);

    // Validation: Size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setErrorMsg(`Le fichier dépasse la limite maximale de ${maxSizeMB} Mo (Taille actuelle : ${fileSizeMB.toFixed(1)} Mo).`);
      return;
    }

    // Validation: Type
    const isVideoFile = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".webm") || file.name.endsWith(".mov");
    const isImageFile = file.type.startsWith("image/");
    const isDocFile = file.name.endsWith(".pdf") || file.name.endsWith(".doc") || file.name.endsWith(".docx");

    if (acceptedTypes === "image" && !isImageFile) {
      setErrorMsg("Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).");
      return;
    }
    if (acceptedTypes === "video" && !isVideoFile) {
      setErrorMsg("Veuillez sélectionner un fichier vidéo valide (MP4, WebM, MOV).");
      return;
    }
    if (acceptedTypes === "document" && !isDocFile) {
      setErrorMsg("Veuillez sélectionner un document valide (PDF, PPT, DOC).");
      return;
    }

    // Create immediate local preview URL for instant visual feedback
    try {
      const localUrl = URL.createObjectURL(file);
      setTempPreviewUrl(localUrl);
    } catch (e) {
      setTempPreviewUrl(null);
    }

    setCurrentFileMeta({
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      type: isVideoFile ? "Vidéo HD" : isDocFile ? "Document PDF" : "Photo HD",
      isVideo: isVideoFile,
    });

    setUploading(true);
    setProgress(8);
    setStageText("Préparation & compression haute fidélité...");

    try {
      const resourceType = isVideoFile ? "video" : isDocFile ? "auto" : "image";
      const result = await uploadToCloudinary(
        file,
        folder,
        resourceType,
        (percent, stage) => {
          setProgress(percent);
          setStageText(stage);
        }
      );

      if (result && result.secure_url) {
        setProgress(100);
        setStageText("Téléversement et sécurisation Cloudinary terminés !");
        setLastUploadedMeta(result);
        onChange(result.secure_url, result);
        setShowSuccessBadge(true);

        // Small cheerful micro-confetti burst on upload completion!
        try {
          confetti({
            particleCount: 25,
            spread: 45,
            origin: { y: 0.7 },
            colors: ["#EAB308", "#10B981", "#F59E0B"],
          });
        } catch (err) {
          // ignore
        }

        setTimeout(() => setShowSuccessBadge(false), 5000);
      } else {
        throw new Error("L'URL sécurisée Cloudinary n'a pas pu être générée.");
      }
    } catch (err: any) {
      console.error("Dropzone upload error:", err);
      setErrorMsg(err?.message || "Une erreur est survenue lors de l'envoi sur Cloudinary.");
    } finally {
      setUploading(false);
      setTempPreviewUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleCopyUrl = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleClear = () => {
    onChange("", null);
    setLastUploadedMeta(null);
    setCurrentFileMeta(null);
    setTempPreviewUrl(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Compact Mode (for Gallery thumbnail slots)
  if (compact) {
    return (
      <div id={id} className={`relative group ${className}`}>
        <input
          type="file"
          ref={fileInputRef}
          accept={getAcceptString()}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />

        {value ? (
          <div className="relative h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-950 group shadow-md hover:border-emerald-400 transition-all">
            {isVideo ? (
              <video src={value} className="w-full h-full object-cover" />
            ) : isPdf ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-rose-400 bg-rose-950/20">
                <FileText className="w-6 h-6" />
                <span className="text-[9px] font-bold mt-1 text-slate-300">PDF</span>
              </div>
            ) : (
              <img
                src={value}
                alt="Aperçu slot"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Success badge & overlay */}
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Remplacer"
                className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                title="Supprimer"
                className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-emerald-500/90 text-slate-950 font-bold text-[8px]">
              ✓ OK
            </span>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all overflow-hidden ${
              isDragOver
                ? "border-amber-400 bg-amber-500/20 scale-105 ring-2 ring-amber-400/50"
                : uploading
                ? "border-amber-500/80 bg-slate-900 shadow-lg"
                : "border-slate-800 hover:border-amber-500/50 bg-slate-900/60 hover:bg-slate-900"
            }`}
          >
            {uploading ? (
              <div className="w-full space-y-1.5 px-2 relative z-10">
                {/* Laser scan line inside compact slot */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 via-transparent to-transparent animate-laser-scan pointer-events-none" />
                
                <div className="relative w-8 h-8 mx-auto flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-amber-300">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full transition-all duration-300 shadow-sm shadow-amber-400/50"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[8px] font-mono text-amber-300 font-bold block truncate">
                  {stageText || "Upload..."}
                </span>
              </div>
            ) : (
              <>
                <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors mb-1">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-white">
                  {label || "+ Photo"}
                </span>
                <span className="text-[8px] text-slate-500">Glisser ou Clic</span>
              </>
            )}
          </div>
        )}

        {errorMsg && (
          <p className="text-[10px] text-rose-400 font-bold mt-1 truncate">{errorMsg}</p>
        )}
      </div>
    );
  }

  // Full / Hero Dropzone Mode with Cinematic Animation
  return (
    <div id={id} className={`space-y-3 ${className}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept={getAcceptString()}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
          }
        }}
      />

      {/* Main Container */}
      {!value ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all overflow-hidden ${
            isDragOver
              ? "border-amber-400 bg-amber-500/15 scale-[1.01] shadow-2xl shadow-amber-500/20 ring-4 ring-amber-400/30"
              : uploading
              ? "border-amber-500/70 bg-slate-900/95 shadow-2xl ring-2 ring-amber-500/30"
              : "border-slate-800 hover:border-amber-500/50 bg-slate-900/50 hover:bg-slate-900/80"
          }`}
        >
          {/* Glowing Ambient Background Orbs */}
          {uploading && (
            <>
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
            </>
          )}

          {isDragOver && (
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-transparent to-amber-500/10 pointer-events-none animate-pulse" />
          )}

          {uploading ? (
            /* ========================================================
               ACTIVE UPLOAD STATE: JOLIE ANIMATION CINÉMATIQUE COMPLÈTE
               ======================================================== */
            <div className="space-y-5 py-2 max-w-lg mx-auto relative z-10">
              {/* Top Laser Status Line */}
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <div className="p-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-spin">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate max-w-[220px] sm:max-w-xs">{stageText || "Téléversement en cours..."}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30">
                  <Zap className="w-3 h-3 text-amber-400 animate-bounce" />
                  <span className="font-mono font-black text-amber-400 text-sm">{progress}%</span>
                </div>
              </div>

              {/* Central Visual Hub: Local Media Scanner or Radar Circle */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-4 flex flex-col sm:flex-row items-center gap-4">
                {/* Laser Scanning Screen */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-slate-900 border border-slate-700/80 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {tempPreviewUrl && !currentFileMeta?.isVideo ? (
                    <img
                      src={tempPreviewUrl}
                      alt="Aperçu Téléversement"
                      className="w-full h-full object-cover blur-[0.5px] scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-amber-400">
                      {currentFileMeta?.isVideo ? (
                        <Video className="w-8 h-8 animate-pulse" />
                      ) : (
                        <ImageIcon className="w-8 h-8 animate-pulse" />
                      )}
                      <span className="text-[9px] font-mono mt-1 text-slate-400 font-bold">FLUX HD</span>
                    </div>
                  )}

                  {/* Laser Beam moving vertically */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-laser-scan pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-emerald-500/10 pointer-events-none" />

                  {/* Center Radar / Spinner Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px]">
                    <div className="relative flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
                      <span className="absolute text-[10px] font-black font-mono text-amber-300">
                        {progress}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Process Details and Streaming Indicators */}
                <div className="flex-1 space-y-2 text-left min-w-0 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                      <CloudLightning className="w-3 h-3" />
                      <span>Pipeline Cloudinary Actif</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {currentFileMeta?.sizeFormatted}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white truncate">
                    {currentFileMeta?.name || "Fichier sélectionné"}
                  </p>

                  {/* Animated Multi-color Progress Bar with Glow */}
                  <div className="space-y-1">
                    <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-300 relative shadow-lg shadow-amber-500/40"
                        style={{ width: `${progress}%` }}
                      >
                        {/* Shimmer light bar */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-slide" />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Micro Stages Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-medium text-slate-400">
                    <div className={`flex items-center gap-1 ${progress >= 30 ? "text-emerald-400 font-bold" : ""}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>Compression HD</span>
                    </div>
                    <div className={`flex items-center gap-1 ${progress >= 60 ? "text-emerald-400 font-bold" : ""}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>Chiffrement CDN</span>
                    </div>
                    <div className={`flex items-center gap-1 ${progress >= 90 ? "text-emerald-400 font-bold" : ""}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>Génération URL</span>
                    </div>
                    <div className={`flex items-center gap-1 ${progress === 100 ? "text-emerald-400 font-bold" : ""}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>Prêt à l'emploi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* IDLE DROPZONE STATE */
            <div className="space-y-4 relative z-10 py-2">
              <div
                className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto transition-all ${
                  isDragOver
                    ? "scale-110 bg-amber-500 text-slate-950 shadow-2xl shadow-amber-500/50 ring-4 ring-amber-400/40"
                    : "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:scale-105 hover:bg-amber-500/20 shadow-lg shadow-amber-500/10"
                }`}
              >
                {acceptedTypes === "video" ? (
                  <Video className="w-8 h-8" />
                ) : acceptedTypes === "document" ? (
                  <FileText className="w-8 h-8" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm sm:text-base font-black text-white flex items-center justify-center gap-2">
                  <span>{label || "Glissez & déposez votre fichier média ici"}</span>
                  {isDragOver && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold animate-bounce shadow-md">
                      Relâchez pour téléverser !
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {subLabel ||
                    `ou cliquez pour parcourir vos fichiers (${
                      acceptedTypes === "video"
                        ? "MP4, WebM max 50Mo"
                        : acceptedTypes === "image"
                        ? "JPG, PNG, WEBP haute résolution"
                        : "Photos HD & Vidéos démo acceptées"
                    })`}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/40 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-md hover:scale-[1.02]">
                <Upload className="w-4 h-4" />
                <span>Sélectionner depuis votre appareil</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================
           SUCCESS UPLOADED STATE WITH PREVIEW & CONTROLS
           ======================================================== */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-4 shadow-xl relative overflow-hidden"
        >
          {/* Top Success Banner */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                  <span>Média Téléversé & Sécurisé sur Cloudinary</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </span>
                <p className="text-[10px] text-slate-400">
                  CDN haute performance avec compression adaptative
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono font-bold text-amber-400">
                {isVideo ? "🎥 VIDÉO HD" : isPdf ? "📄 DOCUMENT PDF" : "📸 PHOTO HD"}
              </span>
            </div>
          </div>

          {/* Media Preview Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            {/* Viewer Thumbnail / Video Player */}
            <div className="w-full sm:w-52 h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center relative group shrink-0 shadow-md">
              {isVideo ? (
                <video
                  src={value}
                  controls
                  className="w-full h-full object-contain bg-black"
                  playsInline
                />
              ) : isPdf ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-rose-400 bg-rose-950/20">
                  <FileText className="w-8 h-8" />
                  <span className="text-xs font-bold mt-2 text-slate-200">Document PDF Attaché</span>
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 text-[10px] text-rose-400 underline font-mono"
                  >
                    Ouvrir le PDF
                  </a>
                </div>
              ) : (
                <img
                  src={value}
                  alt="Aperçu Média"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}

              {!isVideo && !isPdf && (
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-[1px]"
                >
                  <Eye className="w-4 h-4" />
                  <span>Agrandir l'image</span>
                </button>
              )}
            </div>

            {/* Meta & URL actions */}
            <div className="flex-1 space-y-2.5 min-w-0 w-full">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Lien CDN Cloudinary :</span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="text-amber-400 hover:text-amber-300 font-mono text-[10px] flex items-center gap-1 font-bold"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl ? "Copié !" : "Copier le lien"}</span>
                  </button>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 truncate select-all">
                  {value}
                </div>
              </div>

              {/* Action Buttons: Replace & Remove */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Remplacer le média</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-xs font-bold text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ERROR INDICATOR WITH RETRY */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-200">Erreur de téléversement</p>
              <p className="text-[11px] text-rose-300/90 mt-0.5">{errorMsg}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px] font-bold"
            >
              Réessayer
            </button>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="p-1 text-rose-400 hover:text-rose-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      {isPreviewOpen && value && !isVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="h-[70vh] flex items-center justify-center">
              <img
                src={value}
                alt="Aperçu HD"
                className="max-w-full max-h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryDropzone;
