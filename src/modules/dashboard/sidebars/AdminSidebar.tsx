import React from "react";
import { ShieldCheck, Users, FileText, ShoppingBag, GraduationCap, Server, Wrench, Headphones, Settings, LogOut, ShieldAlert } from "lucide-react";
import { store } from "../../../database/store";
import { ProfileSwitcher } from "../components/ProfileSwitcher";
import { ProfileType } from "../../../shared/contracts/types";

interface AdminSidebarProps {
  adminTab: string;
  setAdminTab: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onItemClick?: () => void;
  onOpenActivationModal?: (initialProfile?: ProfileType) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminTab,
  setAdminTab,
  onNavigate,
  onItemClick,
  onOpenActivationModal,
}) => {
  const handleTabClick = (tab: string) => {
    setAdminTab(tab);
    onItemClick?.();
  };

  return (
    <div className="w-full md:w-56 lg:w-60 shrink-0 bg-slate-900 border border-slate-800/90 rounded-2xl p-2.5 sticky top-16 z-10 shadow-lg flex flex-col justify-between h-full min-h-[calc(100vh-5.5rem)] space-y-2.5">
      <div className="space-y-2.5 flex-1 flex flex-col">
        {/* Profile Switcher Quick Header */}
        <div className="px-1 pb-1">
          <ProfileSwitcher onOpenActivationModal={onOpenActivationModal} compact={false} />
        </div>

        <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-rose-400 uppercase font-mono tracking-wide">SUPERVISION SI</p>
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
        </div>

        <nav className="space-y-1 flex-1">
        <button
          onClick={() => handleTabClick("overview")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            adminTab === "overview"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className={`w-4 h-4 shrink-0 ${adminTab === "overview" ? "text-slate-950" : "text-rose-400"}`} />
            <span className="truncate">Vue d'Ensemble SI</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("quotes")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            adminTab === "quotes"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <FileText className={`w-4 h-4 shrink-0 ${adminTab === "quotes" ? "text-slate-950" : "text-amber-400"}`} />
            <span className="truncate">Devis & Projets</span>
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
            adminTab === "quotes" ? "bg-slate-950/20 text-slate-950 font-black" : "bg-slate-800 text-amber-300"
          }`}>
            {store.quotes.length}
          </span>
        </button>

        <button
          onClick={() => handleTabClick("users")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            adminTab === "users"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Users className={`w-4 h-4 shrink-0 ${adminTab === "users" ? "text-slate-950" : "text-indigo-400"}`} />
            <span className="truncate">Comptes & Rôles</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("ambassadors")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            adminTab === "ambassadors"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Users className={`w-4 h-4 shrink-0 ${adminTab === "ambassadors" ? "text-slate-950" : "text-amber-400"}`} />
            <span className="truncate">Ambassadeurs Network</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("store")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            adminTab === "store" || adminTab === "shop"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <ShoppingBag className={`w-4 h-4 shrink-0 ${adminTab === "store" || adminTab === "shop" ? "text-slate-950" : "text-sky-400"}`} />
            <span className="truncate">Boutique & Ventes</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("academy")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            adminTab === "academy"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <GraduationCap className={`w-4 h-4 shrink-0 ${adminTab === "academy" ? "text-slate-950" : "text-purple-400"}`} />
            <span className="truncate">Academy & Cours</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("logs")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            adminTab === "logs"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Server className={`w-4 h-4 shrink-0 ${adminTab === "logs" ? "text-slate-950" : "text-emerald-400"}`} />
            <span className="truncate">Logs & Métriques</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("missions")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            adminTab === "missions"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Wrench className={`w-4 h-4 shrink-0 ${adminTab === "missions" ? "text-slate-950" : "text-amber-400"}`} />
            <span className="truncate">Interventions & Missions</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("support")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            adminTab === "support"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Headphones className={`w-4 h-4 shrink-0 ${adminTab === "support" ? "text-slate-950" : "text-sky-400"}`} />
            <span className="truncate">Hotline & Support</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("settings")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            adminTab === "settings"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Settings className={`w-4 h-4 shrink-0 ${adminTab === "settings" ? "text-slate-950" : "text-slate-400"}`} />
            <span className="truncate">Configuration SI</span>
          </span>
        </button>
        <button
          onClick={() => handleTabClick("security")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            adminTab === "security"
              ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <ShieldAlert className={`w-4 h-4 shrink-0 ${adminTab === "security" ? "text-white" : "text-red-400"}`} />
            <span className="truncate">Sécurité & Pare-Feu</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
        </button>
      </nav>
      </div>

      <div className="pt-2 border-t border-slate-800/80">
        <button
          onClick={() => {
            store.logout();
            onNavigate?.("home");
            onItemClick?.();
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};
