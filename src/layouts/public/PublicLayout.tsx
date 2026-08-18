import React from "react";
import { HeaderNavbar } from "../../shared/components/HeaderNavbar";
import { Footer } from "../../shared/components/Footer";
import { FloatingWidget } from "../../shared/components/FloatingWidget";
import { MobileBottomNavbar } from "../../shared/components/header/MobileBottomNavbar";

interface PublicLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: "FCFA" | "EUR";
  setCurrency: (c: "FCFA" | "EUR") => void;
  onOpenCart: () => void;
  onOpenQuoteModal: () => void;
  onOpenAiDrawer: () => void;
  onOpenAuthModal: () => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenCart,
  onOpenQuoteModal,
  onOpenAiDrawer,
  onOpenAuthModal,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden w-full max-w-full">
      {/* Public Rich Header Navbar */}
      <HeaderNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        onOpenCart={onOpenCart}
        onOpenQuoteModal={onOpenQuoteModal}
        onOpenAiDrawer={onOpenAiDrawer}
        onOpenAuthModal={onOpenAuthModal}
      />

      {/* Main Content Area (with bottom padding on mobile for the fixed Bottom Nav) */}
      <main className="flex-1 pb-20 sm:pb-20 w-full max-w-full overflow-x-hidden">{children}</main>

      {/* Public Footer (Exclusively on Home page or desktop to keep mobile and secondary views light and clean) */}
      {activeTab === "home" && (
        <Footer onNavigate={(tab) => setActiveTab(tab)} />
      )}

      {/* Floating Widgets */}
      <FloatingWidget
        onOpenAiDrawer={onOpenAiDrawer}
        onOpenCart={onOpenCart}
        onNavigateToBoutique={() => setActiveTab("boutique")}
      />

      {/* Mobile Native Bottom Navigation Bar */}
      <MobileBottomNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCart={onOpenCart}
        onOpenQuoteModal={onOpenQuoteModal}
        onOpenAiDrawer={onOpenAiDrawer}
        onOpenAuthModal={onOpenAuthModal}
      />
    </div>
  );
};

