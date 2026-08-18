import React from "react";
import { ShoppingBag, Package, PlusCircle, TrendingUp, LogOut, Store, Plus } from "lucide-react";
import { store } from "../../../database/store";
import { ProfileType } from "../../../shared/contracts/types";
import { ProfileSwitcher } from "../components/ProfileSwitcher";

interface VendeurSidebarProps {
  vendeurTab: string;
  setVendeurTab: (tab: string) => void;
  vendeurProductsCount?: number;
  vendeurOrdersCount?: number;
  onNavigate?: (tab: string) => void;
  onItemClick?: () => void;
  onOpenActivationModal?: (initialProfile?: ProfileType) => void;
}

export const VendeurSidebar: React.FC<VendeurSidebarProps> = ({
  vendeurTab,
  setVendeurTab,
  vendeurProductsCount = 0,
  vendeurOrdersCount = 0,
  onNavigate,
  onItemClick,
  onOpenActivationModal,
}) => {
  const handleTabClick = (tab: string) => {
    setVendeurTab(tab);
    onItemClick?.();
  };

  const userProfiles = store.currentUser.profiles || {};
  const sub = userProfiles.VENDEUR?.subscription;

  return (
    <div className="w-full md:w-56 lg:w-60 shrink-0 bg-slate-900 border border-slate-800/90 rounded-2xl p-2.5 sticky top-16 z-10 shadow-lg flex flex-col justify-between h-full min-h-[calc(100vh-5.5rem)] space-y-2.5">
      <div className="space-y-2.5 flex-1 flex flex-col">
        {/* Profile Switcher Quick Header */}
        <div className="px-1 pb-1">
          <ProfileSwitcher onOpenActivationModal={onOpenActivationModal} compact={false} />
        </div>

        <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-mono">ESPACE BOUTIQUE VENDEUR</p>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
            {sub?.status === "TRIAL" ? "ESSAI 30J" : sub?.planName || "ABONNÉ"}
          </span>
        </div>

        <nav className="space-y-1 flex-1">
        <button
          onClick={() => handleTabClick("stock")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            vendeurTab === "stock" || vendeurTab === "catalog"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Package className={`w-4 h-4 shrink-0 ${vendeurTab === "stock" || vendeurTab === "catalog" ? "text-slate-950" : "text-amber-400"}`} />
            <span className="truncate">Mes Produits & Stocks</span>
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
            vendeurTab === "stock" || vendeurTab === "catalog" ? "bg-slate-950/20 text-slate-950 font-black" : "bg-slate-800 text-amber-300"
          }`}>
            {vendeurProductsCount}
          </span>
        </button>

        <button
          onClick={() => handleTabClick("add_product")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            vendeurTab === "add_product"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <PlusCircle className={`w-4 h-4 shrink-0 ${vendeurTab === "add_product" ? "text-slate-950" : "text-amber-400"}`} />
            <span className="truncate">Publier un Produit</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("orders")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            vendeurTab === "orders"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <ShoppingBag className={`w-4 h-4 shrink-0 ${vendeurTab === "orders" ? "text-slate-950" : "text-sky-400"}`} />
            <span className="truncate">Commandes Reçues</span>
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
            vendeurTab === "orders" ? "bg-slate-950/20 text-slate-950 font-black" : "bg-slate-800 text-sky-300"
          }`}>
            {vendeurOrdersCount}
          </span>
        </button>

        <button
          onClick={() => handleTabClick("analytics")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            vendeurTab === "analytics" || vendeurTab === "payouts"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <TrendingUp className={`w-4 h-4 shrink-0 ${vendeurTab === "analytics" || vendeurTab === "payouts" ? "text-slate-950" : "text-emerald-400"}`} />
            <span className="truncate">Ventes & Analytics</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("profile")}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            vendeurTab === "profile"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Store className={`w-4 h-4 shrink-0 ${vendeurTab === "profile" ? "text-slate-950" : "text-sky-400"}`} />
            <span className="truncate">Fiche Boutique & Infos</span>
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
