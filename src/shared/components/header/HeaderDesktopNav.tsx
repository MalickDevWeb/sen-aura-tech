import React from "react";
import { Sparkles, Users, Code, GraduationCap, LucideIcon } from "lucide-react";
import { HeaderNavDropdown, NavDropdownItem } from "./HeaderNavDropdown";

export interface RoleNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface HeaderDesktopNavProps {
  isPublicOrClient: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  solutionsItems: NavDropdownItem[];
  servicesItems: NavDropdownItem[];
  roleNavItems: RoleNavItem[];
  solutionsMenuOpen: boolean;
  setSolutionsMenuOpen: (open: boolean) => void;
  servicesMenuOpen: boolean;
  setServicesMenuOpen: (open: boolean) => void;
}

export const HeaderDesktopNav: React.FC<HeaderDesktopNavProps> = ({
  isPublicOrClient,
  activeTab,
  setActiveTab,
  solutionsItems,
  servicesItems,
  roleNavItems,
  solutionsMenuOpen,
  setSolutionsMenuOpen,
  servicesMenuOpen,
  setServicesMenuOpen,
}) => {
  return (
    <nav className="hidden xl:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80">
      {isPublicOrClient ? (
        <>
          <button
            onClick={() => setActiveTab("home")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "home"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800/70"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === "home" ? "text-slate-950" : "text-amber-400"}`} />
            <span>Accueil</span>
          </button>

          <button
            onClick={() => setActiveTab("ecosystem")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "ecosystem"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800/70"
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${activeTab === "ecosystem" ? "text-slate-950" : "text-amber-400"}`} />
            <span>Écosystème</span>
          </button>

          <button
            onClick={() => setActiveTab("ambassadeur")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "ambassadeur"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-amber-400 hover:text-amber-300 hover:bg-slate-800/70"
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${activeTab === "ambassadeur" ? "text-slate-950" : "text-amber-400"}`} />
            <span>Ambassadeurs</span>
          </button>

          <button
            onClick={() => setActiveTab("boutique")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 border ${
              activeTab === "boutique"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30 scale-105"
                : "bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === "boutique" ? "text-slate-950" : "text-amber-400"}`} />
            <span>Boutique Tech</span>
          </button>

          <HeaderNavDropdown
            label="Nos Solutions"
            icon={Code}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            items={solutionsItems}
            matchingTabs={["solutions_numeriques", "infrastructures_techniques", "conseil"]}
            isOpen={solutionsMenuOpen}
            setIsOpen={setSolutionsMenuOpen}
            iconColor="text-amber-400"
          />

          <HeaderNavDropdown
            label="Services & Store"
            icon={GraduationCap}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            items={servicesItems}
            matchingTabs={["academy", "marketplace", "boutique"]}
            isOpen={servicesMenuOpen}
            setIsOpen={setServicesMenuOpen}
            iconColor="text-indigo-400"
          />
        </>
      ) : (
        roleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/70"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })
      )}
    </nav>
  );
};
