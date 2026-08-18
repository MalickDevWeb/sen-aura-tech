import React from "react";
import { LayoutDashboard, FileText, ShoppingBag, Calendar, GraduationCap, CreditCard, MessageSquare, LogOut, Users, Plus, RefreshCw } from "lucide-react";
import { store } from "../../../database/store";
import { ProfileType } from "../../../shared/contracts/types";
import { ProfileSwitcher } from "../components/ProfileSwitcher";

interface ClientSidebarProps {
  clientTab: string;
  setClientTab: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onItemClick?: () => void;
  onOpenActivationModal?: (initialProfile?: ProfileType) => void;
}

export const ClientSidebar: React.FC<ClientSidebarProps> = ({
  clientTab,
  setClientTab,
  onNavigate,
  onItemClick,
  onOpenActivationModal,
}) => {
  const handleTabClick = (tab: string) => {
    setClientTab(tab);
    onItemClick?.();
  };

  const currentUserId = store.currentUser?.id;
  const currentUserPhoneDigits = (store.currentUser?.phone || "").replace(/\D/g, "");
  const currentUserNameClean = (store.currentUser?.fullName || "").toLowerCase().trim();

  const myQuotesCount = currentUserId && currentUserId !== "admin"
    ? store.quotes.filter((q) => {
        const qPhoneDigits = (q.userPhone || (q as any).clientPhone || "").replace(/\D/g, "");
        const qUser = (q.userName || (q as any).clientName || "").toLowerCase().trim();
        return (
          (q.userId && q.userId === currentUserId) ||
          (currentUserPhoneDigits.length >= 7 && qPhoneDigits.includes(currentUserPhoneDigits.slice(-7))) ||
          (currentUserNameClean && qUser && currentUserNameClean === qUser)
        );
      }).length
    : store.quotes.length;

  const myOrdersCount = currentUserId && currentUserId !== "admin"
    ? store.orders.filter((o) => {
        const oPhoneDigits = ((o as any).userPhone || (o as any).customerPhone || (o as any).phone || "").replace(/\D/g, "");
        const oUser = (o.userName || (o as any).customerName || "").toLowerCase().trim();
        return (
          (o.userId && o.userId === currentUserId) ||
          (currentUserPhoneDigits.length >= 7 && oPhoneDigits.includes(currentUserPhoneDigits.slice(-7))) ||
          (currentUserNameClean && oUser && currentUserNameClean === oUser)
        );
      }).length
    : store.orders.length;

  const myBookingsCount = currentUserId && currentUserId !== "admin"
    ? store.bookings.filter((b) => {
        const bPhoneDigits = (b.clientPhone || "").replace(/\D/g, "");
        const bUser = (b.clientName || "").toLowerCase().trim();
        return (
          (b.clientId && b.clientId === currentUserId) ||
          (currentUserPhoneDigits.length >= 7 && bPhoneDigits.includes(currentUserPhoneDigits.slice(-7))) ||
          (currentUserNameClean && bUser && currentUserNameClean === bUser)
        );
      }).length
    : store.bookings.length;

  return (
    <div className="w-full md:w-56 lg:w-60 shrink-0 bg-slate-900 border border-slate-800/90 rounded-2xl p-2.5 sticky top-16 z-10 shadow-lg flex flex-col justify-between h-full min-h-[calc(100vh-5.5rem)] space-y-2.5">
      <div className="space-y-2.5 flex-1 flex flex-col">
        {/* Profile Switcher Quick Header */}
        <div className="px-1 pb-1">
          <ProfileSwitcher onOpenActivationModal={onOpenActivationModal} compact={false} />
        </div>

        <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">ESPACE CLIENT</p>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">100% GRATUIT</span>
        </div>

        <nav className="space-y-1 flex-1">
        <button
          onClick={() => handleTabClick("overview")}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            clientTab === "overview"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${clientTab === "overview" ? "text-slate-950" : "text-amber-400"}`} />
            <span className="truncate">Vue d'Ensemble</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("quotes")}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            clientTab === "quotes"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <FileText className={`w-4 h-4 shrink-0 ${clientTab === "quotes" ? "text-slate-950" : "text-amber-400"}`} />
            <span className="truncate">Mes Devis</span>
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
            clientTab === "quotes" ? "bg-slate-950/20 text-slate-950 font-black" : "bg-slate-800 text-amber-300"
          }`}>
            {myQuotesCount}
          </span>
        </button>

        <button
          onClick={() => handleTabClick("orders")}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            clientTab === "orders"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <ShoppingBag className={`w-4 h-4 shrink-0 ${clientTab === "orders" ? "text-slate-950" : "text-sky-400"}`} />
            <span className="truncate">Mes Commandes</span>
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
            clientTab === "orders" ? "bg-slate-950/20 text-slate-950 font-black" : "bg-slate-800 text-sky-300"
          }`}>
            {myOrdersCount}
          </span>
        </button>

        <button
          onClick={() => handleTabClick("bookings")}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            clientTab === "bookings"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Calendar className={`w-4 h-4 shrink-0 ${clientTab === "bookings" ? "text-slate-950" : "text-emerald-400"}`} />
            <span className="truncate">Techniciens Réservés</span>
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
            clientTab === "bookings" ? "bg-slate-950/20 text-slate-950 font-black" : "bg-slate-800 text-emerald-300"
          }`}>
            {myBookingsCount}
          </span>
        </button>

        <button
          onClick={() => handleTabClick("courses")}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            clientTab === "courses"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <GraduationCap className={`w-4 h-4 shrink-0 ${clientTab === "courses" ? "text-slate-950" : "text-indigo-400"}`} />
            <span className="truncate">Mes Formations</span>
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
            clientTab === "courses" ? "bg-slate-950/20 text-slate-950 font-black" : "bg-slate-800 text-indigo-300"
          }`}>
            {store.enrolledCourseIds.length}
          </span>
        </button>

        <button
          onClick={() => handleTabClick("invoices")}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            clientTab === "invoices"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <CreditCard className={`w-4 h-4 shrink-0 ${clientTab === "invoices" ? "text-slate-950" : "text-emerald-400"}`} />
            <span className="truncate">Mes Factures</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick("messages")}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            clientTab === "messages"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <MessageSquare className={`w-4 h-4 shrink-0 ${clientTab === "messages" ? "text-slate-950" : "text-sky-400"}`} />
            <span className="truncate">Messages & Support</span>
          </span>
        </button>

        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <button
            onClick={() => {
              onOpenActivationModal?.();
              onItemClick?.();
            }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 hover:from-amber-500 hover:to-amber-400 hover:text-slate-950 border border-amber-500/40 text-amber-300 transition-all shadow-md shadow-amber-500/5 group cursor-pointer"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Plus className="w-4 h-4 shrink-0 text-amber-400 group-hover:text-slate-950 transition-colors" />
              <span className="truncate">Activer un Profil Pro</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/30 group-hover:bg-slate-950 text-[9px] font-mono font-black text-amber-300 group-hover:text-amber-400">
              PRO
            </span>
          </button>

          <button
            onClick={() => {
              store.switchRole("AMBASSADOR");
              onItemClick?.();
            }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 transition-all shadow-md shadow-amber-500/5 group"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Users className="w-4 h-4 shrink-0 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="truncate">Espace Ambassadeur & Badge</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[9px] font-mono font-black text-amber-300">
              VIP
            </span>
          </button>
        </div>
      </nav>
      </div>

      <div className="pt-2 border-t border-slate-800/80">
        <button
          onClick={() => {
            store.logout();
            onNavigate?.("home");
            onItemClick?.();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-rose-500/20"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};
