import React from "react";
import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { BRAND_CONFIG } from "../../config/constants";
import { useSystemConfig } from "../../config/system-config";

// Official Authentic SVG Vector Logos
export const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 0C5.396 0 .029 5.367.029 11.987c0 2.115.553 4.178 1.603 5.996L0 24l6.202-1.583c1.748.953 3.714 1.455 5.829 1.455 6.627 0 12-5.367 12-11.985C24.031 5.367 18.658 0 12.031 0zm.015 21.84c-1.803 0-3.57-.484-5.111-1.398l-.367-.218-3.796.969.988-3.69-.239-.381a9.957 9.957 0 0 1-1.528-5.135c0-5.514 4.486-10 10.038-10 5.544 0 10.023 4.486 10.023 10 0 5.514-4.479 10-10.008 10zm5.498-7.514c-.301-.151-1.782-.879-2.057-.98-.276-.1-.476-.151-.676.151-.2.301-.776.98-.952 1.18-.175.201-.351.226-.652.075-.301-.151-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.176.201-.301.301-.502.1-.201.05-.377-.025-.527-.075-.151-.676-1.631-.926-2.233-.244-.587-.492-.507-.676-.517l-.576-.01c-.201 0-.527.075-.803.377-.276.301-1.053 1.029-1.053 2.509s1.078 2.91 1.229 3.111c.151.201 2.122 3.24 5.141 4.544.718.311 1.279.497 1.716.636.722.23 1.379.198 1.898.12.579-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.352z" />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.27 1.76-.23 1.02.04 2.14.72 2.94.7.83 1.79 1.25 2.87 1.13 1.17-.07 2.23-.84 2.64-1.92.17-.47.22-.97.22-1.47V.02z" />
  </svg>
);

export const YouTubeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const LinkedInIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64c-.88 0-1.6.72-1.6 1.6 0 .88.72 1.6 1.6 1.6.88 0 1.6-.72 1.6-1.6 0-.88-.72-1.6-1.6-1.6z" />
  </svg>
);

export const XTwitterIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const SOCIAL_CHANNELS = [
  {
    id: "whatsapp",
    name: "Groupe WhatsApp",
    handle: "SEN AURA TECH",
    url: "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4",
    icon: WhatsAppIcon,
    subBadge: "Communauté & Emplois",
    iconBg: "bg-[#25D366] text-slate-950 font-bold",
    glowColor: "group-hover:shadow-[0_0_15px_rgba(37,211,102,0.4)]",
    hoverBorder: "hover:border-[#25D366]/60",
    hoverText: "group-hover:text-[#25D366]",
    dotColor: "bg-[#25D366]",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "senauratech",
    url: BRAND_CONFIG.socials.linkedin,
    icon: LinkedInIcon,
    subBadge: "Emplois & B2B",
    iconBg: "bg-[#0A66C2] text-white",
    glowColor: "group-hover:shadow-[0_0_15px_rgba(10,102,194,0.4)]",
    hoverBorder: "hover:border-[#0A66C2]/60",
    hoverText: "group-hover:text-[#38bdf8]",
    dotColor: "bg-[#0A66C2]",
  },
  {
    id: "x",
    name: "X (Twitter)",
    handle: "@senauratech",
    url: BRAND_CONFIG.socials.twitter,
    icon: XTwitterIcon,
    subBadge: "Fils d'Actus",
    iconBg: "bg-slate-900 text-white border border-slate-700",
    glowColor: "group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]",
    hoverBorder: "hover:border-slate-500",
    hoverText: "group-hover:text-slate-100",
    dotColor: "bg-slate-300",
  },
  {
    id: "instagram",
    name: "Instagram",
    handle: "@senauratech",
    url: BRAND_CONFIG.socials.instagram,
    icon: InstagramIcon,
    subBadge: "Stories & Tutos",
    iconBg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white",
    glowColor: "group-hover:shadow-[0_0_15px_rgba(220,39,67,0.4)]",
    hoverBorder: "hover:border-pink-500/60",
    hoverText: "group-hover:text-pink-400",
    dotColor: "bg-pink-500",
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "SEN-AURA-TECH TV",
    url: BRAND_CONFIG.socials.youtube,
    icon: YouTubeIcon,
    subBadge: "Formations 4K",
    iconBg: "bg-[#FF0000] text-white",
    glowColor: "group-hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]",
    hoverBorder: "hover:border-red-500/60",
    hoverText: "group-hover:text-red-400",
    dotColor: "bg-red-500",
  },
  {
    id: "facebook",
    name: "Facebook",
    handle: "@senauratech",
    url: BRAND_CONFIG.socials.facebook,
    icon: FacebookIcon,
    subBadge: "Communauté",
    iconBg: "bg-[#1877F2] text-white",
    glowColor: "group-hover:shadow-[0_0_15px_rgba(24,119,242,0.4)]",
    hoverBorder: "hover:border-[#1877F2]/60",
    hoverText: "group-hover:text-[#60a5fa]",
    dotColor: "bg-[#1877F2]",
  },
  {
    id: "tiktok",
    name: "TikTok",
    handle: "@senauratech5",
    url: BRAND_CONFIG.socials.tiktok,
    icon: TikTokIcon,
    subBadge: "Shorts & Tutos",
    iconBg: "bg-black text-white border border-slate-700",
    glowColor: "group-hover:shadow-[0_0_15px_rgba(37,244,238,0.3)]",
    hoverBorder: "hover:border-cyan-500/60",
    hoverText: "group-hover:text-cyan-400",
    dotColor: "bg-cyan-400",
  },
];

export function useDynamicSocialChannels() {
  const config = useSystemConfig();
  return [
    {
      id: "whatsapp",
      name: "Groupe WhatsApp",
      handle: "SEN AURA TECH",
      url: config.socials.whatsappGroup || config.homeShowcase.community.whatsappGroupLink || "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4",
      icon: WhatsAppIcon,
      subBadge: "Communauté & Emplois",
      iconBg: "bg-[#25D366] text-slate-950 font-bold",
      glowColor: "group-hover:shadow-[0_0_15px_rgba(37,211,102,0.4)]",
      hoverBorder: "hover:border-[#25D366]/60",
      hoverText: "group-hover:text-[#25D366]",
      dotColor: "bg-[#25D366]",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      handle: "senauratech",
      url: config.socials.linkedin || BRAND_CONFIG.socials.linkedin,
      icon: LinkedInIcon,
      subBadge: "Emplois & B2B",
      iconBg: "bg-[#0A66C2] text-white",
      glowColor: "group-hover:shadow-[0_0_15px_rgba(10,102,194,0.4)]",
      hoverBorder: "hover:border-[#0A66C2]/60",
      hoverText: "group-hover:text-[#38bdf8]",
      dotColor: "bg-[#0A66C2]",
    },
    {
      id: "x",
      name: "X (Twitter)",
      handle: "@senauratech",
      url: config.socials.x || config.socials.twitter || BRAND_CONFIG.socials.twitter,
      icon: XTwitterIcon,
      subBadge: "Fils d'Actus",
      iconBg: "bg-slate-900 text-white border border-slate-700",
      glowColor: "group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]",
      hoverBorder: "hover:border-slate-500",
      hoverText: "group-hover:text-slate-100",
      dotColor: "bg-slate-300",
    },
    {
      id: "instagram",
      name: "Instagram",
      handle: "@senauratech",
      url: config.socials.instagram || BRAND_CONFIG.socials.instagram,
      icon: InstagramIcon,
      subBadge: "Stories & Tutos",
      iconBg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white",
      glowColor: "group-hover:shadow-[0_0_15px_rgba(220,39,67,0.4)]",
      hoverBorder: "hover:border-pink-500/60",
      hoverText: "group-hover:text-pink-400",
      dotColor: "bg-pink-500",
    },
    {
      id: "youtube",
      name: "YouTube",
      handle: "SEN-AURA-TECH TV",
      url: config.socials.youtube || BRAND_CONFIG.socials.youtube,
      icon: YouTubeIcon,
      subBadge: "Formations 4K",
      iconBg: "bg-[#FF0000] text-white",
      glowColor: "group-hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]",
      hoverBorder: "hover:border-red-500/60",
      hoverText: "group-hover:text-red-400",
      dotColor: "bg-red-500",
    },
    {
      id: "facebook",
      name: "Facebook",
      handle: "@senauratech",
      url: config.socials.facebook || BRAND_CONFIG.socials.facebook,
      icon: FacebookIcon,
      subBadge: "Communauté",
      iconBg: "bg-[#1877F2] text-white",
      glowColor: "group-hover:shadow-[0_0_15px_rgba(24,119,242,0.4)]",
      hoverBorder: "hover:border-[#1877F2]/60",
      hoverText: "group-hover:text-[#60a5fa]",
      dotColor: "bg-[#1877F2]",
    },
    {
      id: "tiktok",
      name: "TikTok",
      handle: "@senauratech5",
      url: config.socials.tiktok || BRAND_CONFIG.socials.tiktok,
      icon: TikTokIcon,
      subBadge: "Shorts & Tutos",
      iconBg: "bg-black text-white border border-slate-700",
      glowColor: "group-hover:shadow-[0_0_15px_rgba(37,244,238,0.3)]",
      hoverBorder: "hover:border-cyan-500/60",
      hoverText: "group-hover:text-cyan-400",
      dotColor: "bg-cyan-400",
    },
  ];
}

interface SocialPillsBarProps {
  variant?: "pills" | "cards" | "compact" | "grid" | "iconsOnly" | "footerRow";
  className?: string;
}

export const SocialPillsBar: React.FC<SocialPillsBarProps> = ({ variant = "pills", className = "" }) => {
  const channels = useDynamicSocialChannels();

  if (variant === "iconsOnly") {
    return (
      <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
        {channels.map((ch) => {
          const Icon = ch.icon;
          return (
            <motion.a
              key={ch.id}
              href={ch.url}
              target="_blank"
              rel="noreferrer"
              title={`SEN-AURA-TECH sur ${ch.name} (${ch.handle})`}
              whileHover={{ scale: 1.12, y: -1 }}
              whileTap={{ scale: 0.92 }}
              className={`w-7 h-7 rounded-lg ${ch.iconBg} flex items-center justify-center text-xs shadow-xs transition-all duration-200 hover:shadow-md hover:brightness-110 shrink-0`}
            >
              <Icon className="w-4 h-4" />
            </motion.a>
          );
        })}
      </div>
    );
  }

  if (variant === "footerRow") {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 ${className}`}>
        {channels.map((ch) => {
          const Icon = ch.icon;
          return (
            <motion.a
              key={ch.id}
              href={ch.url}
              target="_blank"
              rel="noreferrer"
              title={`Suivre SEN AURA TECH sur ${ch.name}`}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`group flex flex-col justify-between p-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 hover:bg-slate-850/90 ${ch.hoverBorder} ${ch.glowColor} transition-all duration-200 shadow-sm`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <div className={`w-8 h-8 rounded-xl ${ch.iconBg} flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`w-2 h-2 rounded-full ${ch.dotColor} opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-all`} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-bold text-slate-100 truncate ${ch.hoverText} transition-colors`}>
                    {ch.name}
                  </span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500 group-hover:text-slate-300 shrink-0 opacity-60 group-hover:opacity-100" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium truncate block mt-0.5">
                  {ch.subBadge}
                </span>
              </div>
            </motion.a>
          );
        })}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {channels.map((ch) => {
          const Icon = ch.icon;
          return (
            <motion.a
              key={ch.id}
              href={ch.url}
              target="_blank"
              rel="noreferrer"
              title={`Accéder à notre chaîne officielle ${ch.name}`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/90 ${ch.hoverBorder} ${ch.glowColor} transition-all duration-200`}
            >
              <div className={`w-5 h-5 rounded-lg ${ch.iconBg} flex items-center justify-center text-xs shrink-0 shadow-sm`}>
                <Icon className="w-3 h-3" />
              </div>
              <span className={`text-xs font-semibold text-slate-300 ${ch.hoverText} transition-colors`}>
                {ch.name}
              </span>
            </motion.a>
          );
        })}
      </div>
    );
  }

  if (variant === "pills" || variant === "grid") {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-2.5 ${className}`}>
        {channels.map((ch) => {
          const Icon = ch.icon;
          return (
            <motion.a
              key={ch.id}
              href={ch.url}
              target="_blank"
              rel="noreferrer"
              title={`Suivez SEN-AURA-TECH sur ${ch.name} (${ch.handle})`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex items-center gap-2.5 p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-850/90 ${
                ch.hoverBorder
              } ${ch.glowColor} transition-all duration-200`}
            >
              <div className={`w-7 h-7 rounded-lg ${ch.iconBg} flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="flex flex-col min-w-0 pr-1 text-left">
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-bold text-slate-200 truncate ${ch.hoverText} transition-colors`}>
                    {ch.name}
                  </span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  {ch.subBadge}
                </span>
              </div>
            </motion.a>
          );
        })}
      </div>
    );
  }

  // variant === "cards"
  return (
    <div className={className}>
      {/* MOBILE OPTIMIZED VIEW (< sm): Clean, native-style list tiles */}
      <div className="sm:hidden space-y-2.5">
        {channels.map((ch, idx) => {
          const Icon = ch.icon;
          return (
            <motion.a
              key={ch.id}
              href={ch.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-between p-3 rounded-2xl border border-slate-800/90 bg-slate-900/90 active:bg-slate-850 transition-all ${ch.hoverBorder}`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className={`w-10 h-10 rounded-xl ${ch.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">{ch.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${ch.dotColor} shrink-0`} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                    <span className="font-mono text-amber-400 font-medium truncate">{ch.handle}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 truncate">{ch.subBadge}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold shrink-0">
                <span>Rejoindre</span>
                <span className="text-amber-400">→</span>
              </div>
            </motion.a>
          );
        })}
      </div>

      {/* TABLET & DESKTOP VIEW (>= sm): Grid of rich cards */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((ch, idx) => {
          const Icon = ch.icon;
          const isLastOdd = idx === channels.length - 1 && channels.length % 2 !== 0;

          if (isLastOdd) {
            return (
              <motion.a
                key={ch.id}
                href={ch.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                className={`group sm:col-span-2 lg:col-span-3 p-5 rounded-2xl border border-slate-800 bg-slate-900/90 ${ch.hoverBorder} hover:bg-slate-850 transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md ${ch.glowColor}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-xl ${ch.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200 shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-base font-bold text-slate-100 ${ch.hoverText} transition-colors`}>
                        {ch.name}
                      </h4>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-400">
                        <span className={`w-1.5 h-1.5 rounded-full ${ch.dotColor}`} />
                        <span>Officiel</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <p className="text-xs font-mono font-medium text-amber-400">
                        {ch.handle}
                      </p>
                      <span className="text-slate-600 hidden sm:inline">•</span>
                      <p className="text-xs text-slate-400">
                        {ch.subBadge} — Formats courts, astuces tech, démonstrations et coulisses en vidéo
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end sm:justify-center shrink-0">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-black text-xs font-bold transition-all shadow-sm">
                    <span>Rejoindre sur {ch.name}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.a>
            );
          }

          return (
            <motion.a
              key={ch.id}
              href={ch.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`group p-5 rounded-2xl border border-slate-800 bg-slate-900/90 ${ch.hoverBorder} hover:bg-slate-850 transition-all duration-200 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-xl ${ch.iconBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${ch.dotColor}`} />
                  <span>Officiel</span>
                </span>
              </div>

              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold text-slate-100 ${ch.hoverText} transition-colors`}>
                    {ch.name}
                  </h4>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>
                <p className="text-xs font-mono font-medium text-amber-400">
                  {ch.handle}
                </p>
                <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                  {ch.subBadge}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                <span>Rejoindre</span>
                <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};

