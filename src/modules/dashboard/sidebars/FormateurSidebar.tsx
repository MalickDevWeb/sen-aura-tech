import React from "react";
import { GraduationCap, Users, PlusCircle, TrendingUp, LogOut, UserCheck, Plus } from "lucide-react";
import { store } from "../../../database/store";
import { ProfileType } from "../../../shared/contracts/types";
import { ProfileSwitcher } from "../components/ProfileSwitcher";

interface FormateurSidebarProps {
  formateurTab: string;
  setFormateurTab: (tab: string) => void;
  issuedCertificatesCount?: number;
  onNavigate?: (tab: string) => void;
  onItemClick?: () => void;
  onOpenActivationModal?: (initialProfile?: ProfileType) => void;
}

export const FormateurSidebar: React.FC<FormateurSidebarProps> = ({
  formateurTab,
  setFormateurTab,
  issuedCertificatesCount = 0,
  onNavigate,
  onItemClick,
  onOpenActivationModal,
}) => {
  const handleTabClick = (tab: string) => {
    setFormateurTab(tab);
    onItemClick?.();
  };

  const userProfiles = store.currentUser.profiles || {};
  const sub = userProfiles.FORMATEUR?.subscription;

  return (
    <div className="w-full md:w-56 lg:w-60 shrink-0 bg-slate-900 border border-slate-800/90 rounded-2xl p-2.5 sticky top-16 z-10 shadow-lg flex flex-col justify-between h-full min-h-[calc(100vh-5.5rem)] space-y-2.5">
      <div className="space-y-2.5 flex-1 flex flex-col">
        {/* Profile Switcher Quick Header */}
        <div className="px-1 pb-1">
          <ProfileSwitcher onOpenActivationModal={onOpenActivationModal} compact={false} />
        </div>

        <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">ESPACE FORMATEUR ACADEMY</p>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
            {sub?.status === "TRIAL" ? "ESSAI 30J" : sub?.planName || "ABONNÉ"}
          </span>
        </div>

        <nav className="space-y-1 flex-1">
        <button
          onClick={() => handleTabClick("courses")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            formateurTab === "courses"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <GraduationCap className={`w-4 h-4 shrink-0 ${formateurTab === "courses" ? "text-slate-950" : "text-amber-400"}`} />
            <span className="truncate">Mes Formations Gérées</span>
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
            formateurTab === "courses" ? "bg-slate-950/20 text-slate-950 font-black" : "bg-slate-800 text-amber-300"
          }`}>
            4
          </span>
        </button>

        <button
          onClick={() => handleTabClick("students")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            formateurTab === "students"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Users className={`w-4 h-4 shrink-0 ${formateurTab === "students" ? "text-slate-950" : "text-indigo-400"}`} />
            <span className="truncate">Inscrits & Certifications</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("assignments")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            formateurTab === "assignments"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <PlusCircle className={`w-4 h-4 shrink-0 ${formateurTab === "assignments" ? "text-slate-950" : "text-sky-400"}`} />
            <span className="truncate">Publier un Nouveau Module</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("earnings")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            formateurTab === "earnings" || formateurTab === "royalties"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <TrendingUp className={`w-4 h-4 shrink-0 ${formateurTab === "earnings" || formateurTab === "royalties" ? "text-slate-950" : "text-emerald-400"}`} />
            <span className="truncate">Portefeuille & Honoraires</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("profile")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            formateurTab === "profile"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <UserCheck className={`w-4 h-4 shrink-0 ${formateurTab === "profile" ? "text-slate-950" : "text-indigo-400"}`} />
            <span className="truncate">Profil & Fiche Formateur</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
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
