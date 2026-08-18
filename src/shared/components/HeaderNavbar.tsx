import React, { useState, useEffect } from "react";
import { Code, Video, Briefcase, GraduationCap, Users, ShoppingBag, LayoutDashboard, Sparkles, ShoppingCart, FileText, Smartphone } from "lucide-react";
import { store } from "../../database/store";
import { BrandLogo } from "./BrandLogo";
import { eventBus, EVENTS } from "../events/event-bus";
import { HeaderTopBanner } from "./header/HeaderTopBanner";
import { HeaderDesktopNav, RoleNavItem } from "./header/HeaderDesktopNav";
import { NavDropdownItem } from "./header/HeaderNavDropdown";
import { HeaderProfileMenu } from "./header/HeaderProfileMenu";

interface HeaderNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: "FCFA" | "EUR";
  setCurrency: (c: "FCFA" | "EUR") => void;
  onOpenCart: () => void;
  onOpenQuoteModal: () => void;
  onOpenAiDrawer: () => void;
  onOpenAuthModal: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenCart,
  onOpenQuoteModal,
  onOpenAiDrawer,
  onOpenAuthModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [solutionsMenuOpen, setSolutionsMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub1 = eventBus.subscribe(EVENTS.PRODUCT_ADDED_TO_CART, () => setTick((t) => t + 1));
    const unsub2 = eventBus.subscribe(EVENTS.ORDER_COMPLETED, () => setTick((t) => t + 1));
    const unsub3 = eventBus.subscribe(EVENTS.ROLE_CHANGED, () => setTick((t) => t + 1));
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const cartCount = store.cart.reduce((sum, item) => sum + item.quantity, 0);

  const solutionsItems: NavDropdownItem[] = [
    { id: "solutions_numeriques", label: "Solutions Numériques", desc: "Apps Web, Mobile, PWA & IA", icon: Code },
    { id: "une_semaine_une_solution", label: "1 Semaine = 1 Solution", desc: "Fabrique continue d'Apps & IA", icon: Sparkles },
    { id: "infrastructures_techniques", label: "Infrastructures Tech", desc: "Solaire, Caméras & Réseau", icon: Video },
    { id: "conseil", label: "Conseil & SI", desc: "Audit, ERP & Transformation", icon: Briefcase },
  ];

  const servicesItems: NavDropdownItem[] = [
    { id: "academy", label: "Academy", desc: "Formations Tech & Certifications", icon: GraduationCap },
    { id: "marketplace", label: "Marketplace Pros", desc: "Missions & Annuaire Prestataires", icon: Users },
    { id: "boutique", label: "Boutique Tech", desc: "Matériel, Capteurs & Licences", icon: ShoppingBag },
  ];

  const isBackofficeRole = ["ADMIN", "PROFESSIONAL", "FORMATEUR", "VENDEUR", "AMBASSADOR"].includes(store.currentUser.role);
  if (isBackofficeRole) store.isLoggedIn = true;
  const isPublicOrClient = !isBackofficeRole && (!store.isLoggedIn || store.currentUser.role === "CLIENT");


  const getRoleNavItems = (): RoleNavItem[] => {
    switch (store.currentUser.role) {
      case "AMBASSADOR": return [{ id: "dashboard", label: "Espace Ambassadeur", icon: LayoutDashboard }, { id: "ambassadeur", label: "Page Ambassadeur", icon: Users }, { id: "ecosystem", label: "Écosystème Partenaires", icon: Users }, { id: "home", label: "Voir Site Public", icon: Sparkles }];
      case "PROFESSIONAL": return [{ id: "dashboard", label: "Espace Prestataire Pro", icon: LayoutDashboard }, { id: "marketplace", label: "Missions & Marketplace", icon: Users }, { id: "ecosystem", label: "Écosystème Partenaires", icon: Users }, { id: "home", label: "Voir Site Public", icon: Sparkles }];
      case "FORMATEUR": return [{ id: "dashboard", label: "Espace Formateur Academy", icon: LayoutDashboard }, { id: "academy", label: "Formations & Cours", icon: GraduationCap }, { id: "ecosystem", label: "Écosystème Partenaires", icon: Users }, { id: "home", label: "Voir Site Public", icon: Sparkles }];
      case "VENDEUR": return [{ id: "dashboard", label: "Espace Vendeur Boutique", icon: LayoutDashboard }, { id: "boutique", label: "Boutique & Stocks", icon: ShoppingBag }, { id: "ecosystem", label: "Écosystème Partenaires", icon: Users }, { id: "home", label: "Voir Site Public", icon: Sparkles }];
      case "ADMIN": return [{ id: "dashboard", label: "Supervision SuperAdmin", icon: LayoutDashboard }, { id: "ecosystem", label: "Écosystème & Partenaires", icon: Users }, { id: "marketplace", label: "Marketplace & Prestataires", icon: Users }, { id: "academy", label: "Academy & Formateurs", icon: GraduationCap }, { id: "boutique", label: "Boutique & Produits", icon: ShoppingBag }, { id: "home", label: "Voir Site Public", icon: Sparkles }];
      default: return [];
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      <div className="senegal-flag-stripe" />

      {/* DYNAMIC TOP BANNER (SUPERADMIN CONFIGURABLE) */}
      <HeaderTopBanner currency={currency} setCurrency={setCurrency} onNavigate={setActiveTab} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        <button onClick={() => setActiveTab("home")} className="flex items-center gap-1.5 group text-left shrink-0">
          <BrandLogo variant="horizontal" size="md" showTagline={false} />
        </button>

        <HeaderDesktopNav
          isPublicOrClient={isPublicOrClient}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          solutionsItems={solutionsItems}
          servicesItems={servicesItems}
          roleNavItems={getRoleNavItems()}
          solutionsMenuOpen={solutionsMenuOpen}
          setSolutionsMenuOpen={setSolutionsMenuOpen}
          servicesMenuOpen={servicesMenuOpen}
          setServicesMenuOpen={setServicesMenuOpen}
        />

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {isPublicOrClient && (
            <>
              {cartCount > 0 && (
                <button onClick={onOpenCart} className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer animate-in zoom-in-95 duration-150" title="Mon Panier">
                  <ShoppingCart className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold hidden sm:inline">Panier</span>
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">{cartCount}</span>
                </button>
              )}

              <button onClick={onOpenQuoteModal} className="hidden sm:flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Devis</span>
              </button>
            </>
          )}

          {store.isLoggedIn ? (
            <HeaderProfileMenu profileMenuOpen={profileMenuOpen} setProfileMenuOpen={setProfileMenuOpen} setActiveTab={setActiveTab} />
          ) : (
            <button onClick={onOpenAuthModal} className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md transition-all shrink-0 whitespace-nowrap cursor-pointer">
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Connexion</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
