import React from "react";
import { ChevronDown, LucideIcon } from "lucide-react";

export interface NavDropdownItem {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
}

interface HeaderNavDropdownProps {
  label: string;
  icon: LucideIcon;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  items: NavDropdownItem[];
  matchingTabs: string[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  iconColor: string;
}

export const HeaderNavDropdown: React.FC<HeaderNavDropdownProps> = ({
  label,
  icon: Icon,
  activeTab,
  setActiveTab,
  items,
  matchingTabs,
  isOpen,
  setIsOpen,
  iconColor,
}) => {
  let leaveTimeout: any = null;

  const isMatched = matchingTabs.includes(activeTab);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearTimeout(leaveTimeout);
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        leaveTimeout = setTimeout(() => setIsOpen(false), 200);
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
          isMatched
            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
            : "text-slate-300 hover:text-white hover:bg-slate-800/70"
        }`}
      >
        <Icon className={`w-3.5 h-3.5 shrink-0 ${isMatched ? "text-slate-950" : iconColor}`} />
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 space-y-1">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                  isActive
                    ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold"
                    : "hover:bg-slate-800/80 text-slate-300 hover:text-white"
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isActive ? "bg-amber-500/30 text-amber-300" : "bg-slate-800 " + iconColor}`}>
                  <ItemIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-none mb-1">{item.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
