import React from "react";
import { Users, LayoutDashboard, UserCheck, ShoppingBag, Target, Briefcase, DollarSign, Share2, Trophy, LogOut, ExternalLink } from "lucide-react";
import { store } from "../../../database/store";
import { ProfileType } from "../../../shared/contracts/types";
import { ProfileSwitcher } from "../components/ProfileSwitcher";

interface AmbassadorSidebarProps {
  ambassadorTab?: string;
  setAmbassadorTab?: (tab: any) => void;
  onNavigate?: (tab: string) => void;
  onItemClick?: () => void;
  onOpenActivationModal?: (initialProfile?: ProfileType) => void;
}

export const AmbassadorSidebar: React.FC<AmbassadorSidebarProps> = ({
  ambassadorTab = "overview",
  setAmbassadorTab,
  onNavigate,
  onItemClick,
  onOpenActivationModal,
}) => {
  const handleTabClick = (tab: string) => {
    if (setAmbassadorTab) {
      setAmbassadorTab(tab);
    }
    onItemClick?.();
  };

  const navItems = [
    { id: "overview", label: "Vue d'Ensemble", icon: LayoutDashboard, color: "text-amber-400" },
    { id: "profile", label: "Profil & QR Code", icon: UserCheck, color: "text-indigo-400" },
    { id: "catalog", label: "Catalogue Solutions", icon: ShoppingBag, color: "text-sky-400" },
    { id: "prospects", label: "Mes Prospects", icon: Target, color: "text-emerald-400" },
    { id: "projects", label: "Mes Projets Signés", icon: Briefcase, color: "text-purple-400" },
    { id: "commissions", label: "Mes Commissions", icon: DollarSign, color: "text-amber-400" },
    { id: "kit", label: "Kit Marketing HD", icon: Share2, color: "text-rose-400" },
    { id: "leaderboard", label: "Classement Réseau", icon: Trophy, color: "text-yellow-400" },
  ];

  return (
    <div className="w-full md:w-56 lg:w-60 shrink-0 bg-slate-900 border border-slate-800/90 rounded-2xl p-2.5 sticky top-16 z-10 shadow-lg flex flex-col justify-between h-full min-h-[calc(100vh-5.5rem)] space-y-2.5">
      <div className="space-y-2.5 flex-1 flex flex-col">
        {/* Profile Switcher Quick Header */}
        <div className="px-1 pb-1">
          <ProfileSwitcher onOpenActivationModal={onOpenActivationModal} compact={false} />
        </div>

        <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">ESPACE AMBASSADEUR</p>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
          <p className="font-bold text-white truncate">{store.currentUser.fullName || "Espace Ambassadeur"}</p>
          <p className="font-mono text-amber-400 font-bold text-[10px]">#{store.currentUser.id || "SAT-AMB"}</p>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold inline-flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            <span>Membre Actif</span>
          </span>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = ambassadorTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : item.color}`} />
                  <span className="truncate">{item.label}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-2 border-t border-slate-800 space-y-1">
        <button
          onClick={() => {
            onNavigate?.("ambassadeur");
            onItemClick?.();
          }}
          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-400 hover:bg-slate-800 transition-all"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Page Présentation</span>
          </span>
        </button>

        <button
          onClick={() => {
            store.switchRole("CLIENT");
            onNavigate?.("home");
            onItemClick?.();
          }}
          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Quitter Espace</span>
          </span>
        </button>
      </div>
    </div>
  );
};

