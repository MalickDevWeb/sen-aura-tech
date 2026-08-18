import React, { useState, useEffect } from "react";
import {
  Home,
  Users,
  ShoppingBag,
  GraduationCap,
  Sparkles,
  LayoutGrid,
  Code,
  Video,
  Briefcase,
  FileText,
  Bot,
  UserCheck,
  Smartphone,
  X,
  ChevronRight,
  ShieldCheck,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { store } from "../../../database/store";
import { eventBus, EVENTS } from "../../events/event-bus";

interface MobileBottomNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCart: () => void;
  onOpenQuoteModal: () => void;
  onOpenAiDrawer: () => void;
  onOpenAuthModal: () => void;
}

export const MobileBottomNavbar: React.FC<MobileBottomNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCart,
  onOpenQuoteModal,
  onOpenAiDrawer,
  onOpenAuthModal,
}) => {
  const [isServicesDrawerOpen, setIsServicesDrawerOpen] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub1 = eventBus.subscribe(EVENTS.PRODUCT_ADDED_TO_CART, () => setTick((t) => t + 1));
    const unsub2 = eventBus.subscribe(EVENTS.ORDER_COMPLETED, () => setTick((t) => t + 1));
    const unsub3 = eventBus.subscribe(EVENTS.ROLE_CHANGED, () => setTick((t) => t + 1));
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const cartCount = store.cart.reduce((sum, item) => sum + item.quantity, 0);

  const mainNavItems = [
    { id: "home", label: "Accueil", icon: Home },
    { id: "marketplace", label: "Pros", icon: Users },
    { id: "boutique", label: "Boutique", icon: ShoppingBag, badge: cartCount > 0 ? cartCount : undefined },
    { id: "academy", label: "Academy", icon: GraduationCap },
  ];

  const servicesCatalog = [
    {
      category: "Solutions Techniques & Pôles",
      items: [
        { id: "solutions_numeriques", label: "Solutions Numériques", desc: "Apps Web, Mobile, PWA & IA", icon: Code, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        { id: "une_semaine_une_solution", label: "1 Semaine = 1 Solution", desc: "Fabrique continue de solutions & IA", icon: Sparkles, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        { id: "infrastructures_techniques", label: "Infrastructures & Réseaux", desc: "Solaire, Caméras & Câblage", icon: Video, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        { id: "conseil", label: "Conseil & SI", desc: "Audit, ERP & Transformation IT", icon: Briefcase, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
        { id: "ecosystem", label: "Écosystème Partenaires", desc: "Entreprises & institutions alliées", icon: Users, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
        { id: "ambassadeur", label: "Programme Ambassadeurs", desc: "Rejoignez le réseau SEN AURA", icon: Sparkles, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
      ]
    }
  ];

  const isCurrentServiceActive = [
    "solutions_numeriques",
    "une_semaine_une_solution",
    "infrastructures_techniques",
    "conseil",
    "ecosystem",
    "ambassadeur",
    "dashboard",
  ].includes(activeTab);

  return (
    <>
      {/* Native Bottom Bar (Visible on mobile/tablet up to lg/xl) */}
      <nav
        id="mobile-bottom-navbar"
        className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-2 py-1.5 pb-safe"
        aria-label="Navigation principale mobile"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center gap-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !isServicesDrawerOpen;
            const isBoutique = item.id === "boutique";

            if (isBoutique) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsServicesDrawerOpen(false);
                    setActiveTab(item.id);
                  }}
                  className="relative -top-3 flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 border ${
                      isActive
                        ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-amber-500/40 scale-105"
                        : "bg-slate-900 text-amber-400 border-amber-500/40 hover:border-amber-400 shadow-black/60"
                    }`}
                  >
                    <Icon className={`w-6 h-6 stroke-[2.2] ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                    {item.badge !== undefined && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white font-black text-[9px] min-w-[17px] h-[17px] flex items-center justify-center animate-bounce shadow-md">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 tracking-tight font-black ${isActive ? "text-amber-400" : "text-slate-300"}`}>
                    Boutique
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  setIsServicesDrawerOpen(false);
                  setActiveTab(item.id);
                }}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 cursor-pointer ${
                  isActive
                    ? "text-amber-400 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {/* Active Indicator Top Light Bar */}
                {isActive && (
                  <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                )}

                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
                    }`}
                  />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] min-w-[15px] h-[15px] flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* 5th Hub Item: Services / Menu Action Sheet */}
          <button
            onClick={() => setIsServicesDrawerOpen(!isServicesDrawerOpen)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 cursor-pointer ${
              isServicesDrawerOpen || isCurrentServiceActive
                ? "text-amber-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {(isServicesDrawerOpen || isCurrentServiceActive) && (
              <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            )}

            <div className="relative">
              <LayoutGrid
                className={`w-5 h-5 transition-transform ${
                  isServicesDrawerOpen || isCurrentServiceActive
                    ? "scale-110 stroke-[2.5]"
                    : "stroke-[1.8]"
                }`}
              />
            </div>

            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              Menu +
            </span>
          </button>
        </div>
      </nav>

      {/* Services Bottom Sheet / Modal Drawer */}
      {isServicesDrawerOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setIsServicesDrawerOpen(false)}
          />

          <div className="relative w-full max-h-[85vh] bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl p-5 pb-8 space-y-4 overflow-y-auto z-10 animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Hub des Services & Espaces</h3>
                  <p className="text-[10px] text-slate-400">Tous les pôles technologiques SEN AURA TECH</p>
                </div>
              </div>

              <button
                onClick={() => setIsServicesDrawerOpen(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Shortcuts (Devis & Assistant IA) */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  setIsServicesDrawerOpen(false);
                  onOpenQuoteModal();
                }}
                className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-2.5 transition-all shadow-sm"
              >
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white">Demander un Devis</p>
                  <p className="text-[10px] text-amber-400/80">Estimation gratuite</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsServicesDrawerOpen(false);
                  onOpenAiDrawer();
                }}
                className="p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center gap-2.5 transition-all shadow-sm"
              >
                <div className="p-2 rounded-xl bg-indigo-600 text-white font-black">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white">Assistant IA</p>
                  <p className="text-[10px] text-indigo-300/80">Orientation 24/7</p>
                </div>
              </button>
            </div>

            {/* Catalog Grid */}
            {servicesCatalog.map((sec, i) => (
              <div key={i} className="space-y-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {sec.category}
                </span>

                <div className="grid grid-cols-1 gap-2">
                  {sec.items.map((svc) => {
                    const Icon = svc.icon;
                    const isSelected = activeTab === svc.id;

                    return (
                      <button
                        key={svc.id}
                        onClick={() => {
                          setActiveTab(svc.id);
                          setIsServicesDrawerOpen(false);
                        }}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/50 shadow-md"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${svc.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {svc.label}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {svc.desc}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* User Account / Login Bar */}
            <div className="pt-2 border-t border-slate-800">
              {store.isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{store.currentUser.fullName}</p>
                        <p className="text-[10px] text-emerald-400 font-mono">{store.currentUser.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab("dashboard");
                        setIsServicesDrawerOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                    >
                      Mon Espace
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      store.logout();
                      setActiveTab("home");
                      setIsServicesDrawerOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-500/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Se Déconnecter</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsServicesDrawerOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Connexion / Inscription</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
