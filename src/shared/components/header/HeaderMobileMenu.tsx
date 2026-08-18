import React from "react";
import { UserCheck, LogOut, Smartphone, FileText, Bot, Sparkles, Users, LayoutDashboard } from "lucide-react";
import { store } from "../../../database/store";
import { NavDropdownItem } from "./HeaderNavDropdown";
import { RoleNavItem } from "./HeaderDesktopNav";

interface HeaderMobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isPublicOrClient: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  solutionsItems: NavDropdownItem[];
  servicesItems: NavDropdownItem[];
  roleNavItems: RoleNavItem[];
  onOpenAuthModal: () => void;
  onOpenQuoteModal: () => void;
  onOpenAiDrawer: () => void;
}

export const HeaderMobileMenu: React.FC<HeaderMobileMenuProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  isPublicOrClient,
  activeTab,
  setActiveTab,
  solutionsItems,
  servicesItems,
  roleNavItems,
  onOpenAuthModal,
  onOpenQuoteModal,
  onOpenAiDrawer,
}) => {
  if (!mobileMenuOpen) return null;

  return (
    <div className="xl:hidden bg-slate-900/98 backdrop-blur-xl border-t border-slate-800 p-4 sm:p-6 space-y-4 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto shadow-2xl">
      <div className="space-y-3 pb-3 border-b border-slate-800">
        {store.isLoggedIn ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/90 border border-emerald-500/40 text-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">{store.currentUser.fullName}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                {store.currentUser.role}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
                className="py-2.5 px-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:bg-amber-400"
              >
                <UserCheck className="w-4 h-4" /> Mon Espace
              </button>
              <button
                onClick={() => { store.logout(); setActiveTab("home"); setMobileMenuOpen(false); }}
                className="py-2.5 px-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-rose-500/30"
              >
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { onOpenAuthModal(); setMobileMenuOpen(false); }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Smartphone className="w-4 h-4" />
            <span>Se Connecter par Téléphone / SMS</span>
          </button>
        )}

        <div className={`grid gap-2 ${isPublicOrClient ? "grid-cols-2" : "grid-cols-1"}`}>
          {isPublicOrClient && (
            <button
              onClick={() => { onOpenQuoteModal(); setMobileMenuOpen(false); }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 cursor-pointer"
            >
              <FileText className="w-4 h-4" /> Demander un Devis
            </button>
          )}
          <button
            onClick={() => { onOpenAiDrawer(); setMobileMenuOpen(false); }}
            className="py-2.5 px-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-4 h-4" /> SEN AURA AI
          </button>
        </div>
      </div>

      {isPublicOrClient ? (
        <div className="space-y-4">
          {/* Quick tabs row / grid */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${activeTab === "home" ? "bg-amber-500 text-slate-950 shadow-md" : "bg-slate-800/80 text-slate-200 hover:bg-slate-700"}`}
            >
              <Sparkles className={`w-4 h-4 ${activeTab === "home" ? "text-slate-950" : "text-amber-400"}`} /> Accueil
            </button>
            <button
              onClick={() => { setActiveTab("ecosystem"); setMobileMenuOpen(false); }}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${activeTab === "ecosystem" ? "bg-amber-500 text-slate-950 shadow-md" : "bg-slate-800/80 text-slate-200 hover:bg-slate-700"}`}
            >
              <Users className={`w-4 h-4 ${activeTab === "ecosystem" ? "text-slate-950" : "text-amber-400"}`} /> Écosystème
            </button>
            <button
              onClick={() => { setActiveTab("ambassadeur"); setMobileMenuOpen(false); }}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${activeTab === "ambassadeur" ? "bg-amber-500 text-slate-950 shadow-md" : "bg-slate-800/80 text-amber-300 hover:bg-slate-700"}`}
            >
              <Users className={`w-4 h-4 ${activeTab === "ambassadeur" ? "text-slate-950" : "text-amber-400"}`} /> Ambassadeurs
            </button>
          </div>

          {/* Solutions section */}
          <div className="space-y-2">
            <div className="text-[11px] uppercase font-mono font-bold text-amber-400 px-1 flex items-center gap-1.5">
              <span>Nos Solutions Tech & Pôles</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {solutionsItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${activeTab === item.id ? "bg-amber-500 text-slate-950 font-bold shadow" : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${activeTab === item.id ? "text-slate-950" : "text-amber-400"}`} />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{item.label}</p>
                    <p className={`text-[10px] truncate ${activeTab === item.id ? "text-slate-900" : "text-slate-400"}`}>{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Services & Store section */}
          <div className="space-y-2">
            <div className="text-[11px] uppercase font-mono font-bold text-indigo-400 px-1 flex items-center gap-1.5">
              <span>Services, Academy & Store</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {servicesItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${activeTab === item.id ? "bg-amber-500 text-slate-950 font-bold shadow" : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${activeTab === item.id ? "text-slate-950" : "text-indigo-400"}`} />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{item.label}</p>
                    <p className={`text-[10px] truncate ${activeTab === item.id ? "text-slate-900" : "text-slate-400"}`}>{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {roleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 cursor-pointer ${activeTab === item.id ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-300 hover:bg-slate-800"}`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${activeTab === item.id ? "text-slate-950" : "text-amber-400"}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
