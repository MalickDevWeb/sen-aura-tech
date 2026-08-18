import React from "react";
import { useSystemConfig } from "../../../config/system-config";
import { SenegalBadge } from "../SenegalBadge";
import { SocialPillsBar } from "../SocialCommunityPills";
import { Phone, Sparkles } from "lucide-react";

interface HeaderTopBannerProps {
  currency: "FCFA" | "EUR";
  setCurrency: (c: "FCFA" | "EUR") => void;
  onNavigate?: (tab: string) => void;
}

export const HeaderTopBanner: React.FC<HeaderTopBannerProps> = ({
  currency,
  setCurrency,
  onNavigate,
}) => {
  const config = useSystemConfig();

  return (
    <div className="w-full bg-[#080C16]/95 border-b border-slate-800/80 text-slate-400 text-[11px] px-3 sm:px-6 py-1.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
        
        {/* LEFT SECTION: Senegal Badge + Phone + Announcement */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="shrink-0">
            <SenegalBadge className="py-0.5 px-2 text-[10px]" />
          </div>

          <span className="hidden sm:flex items-center gap-1 text-slate-400 whitespace-nowrap shrink-0">
            <Phone className="w-3 h-3 text-amber-400" />
            <span>Support :</span>
            <a
              href={`tel:${config.contacts.phone.replace(/\s+/g, '')}`}
              className="text-amber-400 font-mono font-bold hover:underline"
            >
              {config.contacts.phone}
            </a>
          </span>

          <span className="hidden md:inline text-slate-700 shrink-0">•</span>

          {config.branding.topBanner.enabled ? (
            <button
              onClick={() => onNavigate?.(config.branding.topBanner.linkTab || "ambassadeur")}
              className="flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition-colors font-medium cursor-pointer group truncate text-left min-w-0"
            >
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold font-mono border border-amber-500/30 shrink-0">
                {config.branding.topBanner.badge || "INFO"}
              </span>
              <span className="group-hover:underline truncate max-w-[150px] sm:max-w-[240px] md:max-w-[360px] lg:max-w-[500px] xl:max-w-none">
                {config.branding.topBanner.text}
              </span>
            </button>
          ) : (
            <span className="hidden md:inline text-emerald-400 font-medium truncate">
              Paiements sécurisés Wave, Orange Money, Free Money & Carte
            </span>
          )}
        </div>

        {/* RIGHT SECTION: Social Icons + Currency Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Social Icons only on extra large screens */}
          <div className="hidden xl:flex items-center">
            <SocialPillsBar variant="iconsOnly" />
          </div>

          <div className="hidden xl:block h-3.5 w-px bg-slate-800 shrink-0" />

          {/* CURRENCY TOGGLE */}
          <div className="flex items-center gap-0.5 bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 shrink-0 shadow-xs">
            <button
              onClick={() => setCurrency("FCFA")}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                currency === "FCFA"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              FCFA
            </button>
            <button
              onClick={() => setCurrency("EUR")}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                currency === "EUR"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              EUR (€)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

