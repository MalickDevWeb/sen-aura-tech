import React from "react";
import { Briefcase, Wrench, TrendingUp, ShieldCheck, LogOut, Plus } from "lucide-react";
import { store } from "../../../database/store";
import { ProfileType } from "../../../shared/contracts/types";
import { ProfileSwitcher } from "../components/ProfileSwitcher";

interface ProSidebarProps {
  proTab: string;
  setProTab: (tab: string) => void;
  acceptedMissionsCount: number;
  onNavigate?: (tab: string) => void;
  onItemClick?: () => void;
  onOpenActivationModal?: (initialProfile?: ProfileType) => void;
}

export const ProSidebar: React.FC<ProSidebarProps> = ({
  proTab,
  setProTab,
  acceptedMissionsCount,
  onNavigate,
  onItemClick,
  onOpenActivationModal,
}) => {
  const handleTabClick = (tab: string) => {
    setProTab(tab);
    onItemClick?.();
  };

  const userProfiles = store.currentUser.profiles || {};
  const sub = userProfiles.PROFESSIONAL?.subscription;

  return (
    <div className="w-full md:w-56 lg:w-60 shrink-0 bg-slate-900 border border-slate-800/90 rounded-2xl p-2.5 sticky top-16 z-10 shadow-lg flex flex-col justify-between h-full min-h-[calc(100vh-5.5rem)] space-y-2.5">
      <div className="space-y-2.5 flex-1 flex flex-col">
        {/* Profile Switcher Quick Header */}
        <div className="px-1 pb-1">
          <ProfileSwitcher onOpenActivationModal={onOpenActivationModal} compact={false} />
        </div>

        <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">ESPACE PRESTATAIRE PRO</p>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
            {sub?.status === "TRIAL" ? "ESSAI 30J" : sub?.planName || "ABONNÉ"}
          </span>
        </div>

        <nav className="space-y-1 flex-1">
        <button
          onClick={() => handleTabClick("missions")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            proTab === "missions"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Briefcase className={`w-4 h-4 shrink-0 ${proTab === "missions" ? "text-slate-950" : "text-amber-400"}`} />
            <span className="truncate">Demandes Disponibles</span>
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
            proTab === "missions" ? "bg-slate-950/20 text-slate-950 font-black" : "bg-slate-800 text-amber-300"
          }`}>
            3
          </span>
        </button>

        <button
          onClick={() => handleTabClick("active")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            proTab === "active"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Wrench className={`w-4 h-4 shrink-0 ${proTab === "active" ? "text-slate-950" : "text-emerald-400"}`} />
            <span className="truncate">Interventions en Cours</span>
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
            proTab === "active" ? "bg-slate-950/20 text-slate-950 font-black" : "bg-slate-800 text-emerald-300"
          }`}>
            {acceptedMissionsCount}
          </span>
        </button>

        <button
          onClick={() => handleTabClick("portfolio")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            proTab === "portfolio"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Wrench className={`w-4 h-4 shrink-0 ${proTab === "portfolio" ? "text-slate-950" : "text-amber-400"}`} />
            <span className="truncate">Publier Chantier / Service</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-bold">
            HD
          </span>
        </button>

        <button
          onClick={() => handleTabClick("payouts")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            proTab === "payouts"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <TrendingUp className={`w-4 h-4 shrink-0 ${proTab === "payouts" ? "text-slate-950" : "text-sky-400"}`} />
            <span className="truncate">Portefeuille Wave / OM</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("profile")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            proTab === "profile"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className={`w-4 h-4 shrink-0 ${proTab === "profile" ? "text-slate-950" : "text-indigo-400"}`} />
            <span className="truncate">Profil Certifié & Zones</span>
          </span>
        </button>
      </nav>
      </div>

      <div className="pt-3 border-t border-slate-800/80">
        <button
          onClick={() => {
            store.logout();
            onNavigate?.("home");
            onItemClick?.();
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-rose-500/20"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};
