import React, { useState, useEffect, Suspense, lazy } from "react";
import { PublicLayout } from "./layouts/public/PublicLayout";
import { PrivateLayout } from "./layouts/private/PrivateLayout";
import { CartDrawer } from "./shared/components/CartDrawer";
import { QuoteModal } from "./shared/components/QuoteModal";
import { AIAssistantDrawer } from "./modules/ai/AIAssistantDrawer";
import { AuthModal } from "./shared/components/AuthModal";
import { OfficialInvoiceModal, InvoiceData } from "./modules/invoices/OfficialInvoiceModal";

// Eager load HomeView for lightning-fast initial load
import { HomeView } from "./modules/home/HomeView";

// Lazy load secondary views to keep initial bundle tiny and scrolling buttery smooth
const SolutionsNumeriquesView = lazy(() =>
  import("./modules/solutions-numeriques/SolutionsNumeriquesView").then((m) => ({
    default: m.SolutionsNumeriquesView,
  }))
);
const InfrastructuresTechniquesView = lazy(() =>
  import("./modules/infrastructures-techniques/InfrastructuresTechniquesView").then((m) => ({
    default: m.InfrastructuresTechniquesView,
  }))
);
const ConseilView = lazy(() =>
  import("./modules/conseil/ConseilView").then((m) => ({ default: m.ConseilView }))
);
const AcademyView = lazy(() =>
  import("./modules/academy/AcademyView").then((m) => ({ default: m.AcademyView }))
);
const MarketplaceView = lazy(() =>
  import("./modules/marketplace/MarketplaceView").then((m) => ({ default: m.MarketplaceView }))
);
const BoutiqueView = lazy(() =>
  import("./modules/boutique/BoutiqueView").then((m) => ({ default: m.BoutiqueView }))
);
const DashboardView = lazy(() =>
  import("./modules/dashboard/DashboardView").then((m) => ({ default: m.DashboardView }))
);
const PartnersEcosystemView = lazy(() =>
  import("./modules/partners/PartnersEcosystemView").then((m) => ({
    default: m.PartnersEcosystemView,
  }))
);
const AmbassadorPublicView = lazy(() =>
  import("./modules/ambassador/AmbassadorPublicView").then((m) => ({
    default: m.AmbassadorPublicView,
  }))
);
const UneSemaineUneSolutionSection = lazy(() =>
  import("./shared/components/UneSemaineUneSolutionSection").then((m) => ({
    default: m.UneSemaineUneSolutionSection,
  }))
);

import { eventBus, EVENTS } from "./shared/events/event-bus";
import { store } from "./database/store";
import { PoleType, QuoteRequestDTO } from "./shared/contracts/types";
import { SmoothScrollProvider } from "./lib/smooth-scroll";
import { MaintenancePage } from "./shared/components/MaintenancePage";
import { MaintenanceControlPanel } from "./shared/components/MaintenanceControlPanel";
import { useSystemConfig } from "./config/system-config";
import { NotFoundPage } from "./shared/components/NotFoundPage";

// Ultra-fast smooth loading fallback with zero layout shift
const PageLoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
    <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    <p className="text-xs text-slate-500 font-medium tracking-wider animate-pulse">
      Initialisation fluide...
    </p>
  </div>
);

export default function App() {
  const config = useSystemConfig();
  const [activeTab, setActiveTab] = useState<string>("home");
  const [currency, setCurrency] = useState<"FCFA" | "EUR">("FCFA");

  // Scroll to top immediately on tab switch for pristine fluidity
  useEffect(() => {
    if (typeof (window as any).__scrollToTop === "function") {
      (window as any).__scrollToTop();
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [activeTab]);

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [invoiceModalData, setInvoiceModalData] = useState<Partial<InvoiceData> | undefined>(undefined);
  // Track if the user arrived via /maintenance_sat
  const [isMaintenanceRoute, setIsMaintenanceRoute] = useState<boolean>(false);
  const [showMaintenancePanel, setShowMaintenancePanel] = useState<boolean>(false);

  // Expose global open method for Official Invoice Modal
  useEffect(() => {
    (window as any).__openOfficialInvoice = (invoiceData?: Partial<InvoiceData>) => {
      setInvoiceModalData(invoiceData);
      setIsInvoiceModalOpen(true);
    };
  }, []);

  // Quote modal prefill
  const [quotePole, setQuotePole] = useState<PoleType>("SOLUTIONS_NUMERIQUES");
  const [quoteTitle, setQuoteTitle] = useState<string>("Demande de Service Sur-Mesure");

  // Listen to event-bus for global notifications or reactive updates & parse URL params
  useEffect(() => {
    // Check URL parameters for direct deep-linking
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    
    // Admin Backdoor (Strict: /maintenance_sat)
    if (window.location.pathname === "/maintenance_sat" || window.location.search.includes("maintenance_sat")) {
      setIsMaintenanceRoute(true);
      setIsAuthModalOpen(true);
      // Clean up the URL
      window.history.replaceState({}, "", "/");
    }

    if (tabParam) {
      const normalizedTab = tabParam.toLowerCase().replace(/-/g, "_");
      if (
        [
          "home",
          "solutions_numeriques",
          "infrastructures_techniques",
          "conseil",
          "academy",
          "marketplace",
          "boutique",
          "dashboard",
          "ecosystem",
          "ambassadeur",
          "une_semaine_une_solution",
        ].includes(normalizedTab)
      ) {
        setActiveTab(normalizedTab);
      } else {
        setActiveTab("404");
      }
    }

    const unsub1 = eventBus.subscribe("QUOTE_CREATED", () => {});
    const unsub2 = eventBus.subscribe(EVENTS.ROLE_CHANGED, () => {
      if (store.isLoggedIn) {
        // User just logged in → go to dashboard
        setActiveTab("dashboard");
      } else {
        // User logged out → go to home
        setActiveTab("home");
      }
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleOpenQuoteModal = (pole?: PoleType, title?: string) => {
    if (pole) setQuotePole(pole);
    if (title) setQuoteTitle(title);
    setIsQuoteModalOpen(true);
  };

  const handleOpenQuoteWithPrompt = (promptText: string) => {
    setQuoteTitle(`Recommandation IA : ${promptText}`);
    setIsQuoteModalOpen(true);
  };

  const handleAuthSuccess = () => {
    // If user came from /maintenance_sat, show control panel only
    if (isMaintenanceRoute) {
      setShowMaintenancePanel(true);
      return;
    }

    // Check if there is a pending quote draft waiting for authentication
    const draft = store.getQuoteDraft();
    if (draft && draft.serviceTitle) {
      const generatedId = `SAT-DEV-${Math.floor(100000 + Math.random() * 900000)}`;
      const completedQuote: QuoteRequestDTO = {
        id: generatedId,
        userId: store.currentUser.id,
        userName: store.currentUser.fullName || "Client SEN AURA",
        userPhone: store.currentUser.phone || "+221 77 000 00 00",
        userEmail: store.currentUser.email || undefined,
        userRegion: store.currentUser.region || draft.region || "Dakar",
        pole: draft.pole || "SOLUTIONS_NUMERIQUES",
        serviceTitle: draft.serviceTitle,
        description: draft.description || "",
        region: draft.region || "Dakar",
        budgetFCFA: draft.budgetFCFA || 500000,
        options: draft.options || [],
        timeframe: draft.timeframe || "Standard (1 à 2 semaines)",
        status: "EN_ATTENTE",
        createdAt: new Date().toISOString(),
      };

      store.addQuote(completedQuote);
      store.clearQuoteDraft();
    }

    setActiveTab("dashboard");
  };

  const isBackoffice = activeTab === "dashboard";

  // --- MAINTENANCE CONTROL PANEL (after admin login from /maintenance_sat) ---
  if (showMaintenancePanel && store.isLoggedIn && store.currentUser.role === "ADMIN") {
    return (
      <MaintenanceControlPanel
        onExitToSite={() => {
          setShowMaintenancePanel(false);
          setIsMaintenanceRoute(false);
          setActiveTab("dashboard");
        }}
      />
    );
  }

  // --- MAINTENANCE MODE INTERCEPTOR ---
  if (config.security.maintenanceMode && (!store.isLoggedIn || store.currentUser.role !== "ADMIN")) {
    return (
      <>
        <MaintenancePage
          message={config.security.maintenanceMessage}
          estimatedDate={config.security.estimatedReopenDate}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          forceLoginOnly={true}
        />
      </>
    );
  }

  return (
    <SmoothScrollProvider>
      {isBackoffice ? (
        <PrivateLayout
          onNavigateToPublic={() => setActiveTab("home")}
          currency={currency}
          setCurrency={setCurrency}
          onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        >
          <Suspense fallback={<PageLoadingFallback />}>
            <DashboardView
              currency={currency}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenQuoteModal={() => handleOpenQuoteModal()}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          </Suspense>

          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            currency={currency}
          />

          <QuoteModal
            isOpen={isQuoteModalOpen}
            onClose={() => setIsQuoteModalOpen(false)}
            defaultPole={quotePole}
            defaultServiceTitle={quoteTitle}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />

          <AIAssistantDrawer
            isOpen={isAiDrawerOpen}
            onClose={() => setIsAiDrawerOpen(false)}
            onOpenQuoteWithPrompt={handleOpenQuoteWithPrompt}
          />

          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={handleAuthSuccess}
          />

          <OfficialInvoiceModal
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            initialInvoice={invoiceModalData}
            currency={currency}
          />
        </PrivateLayout>
      ) : (
        <PublicLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currency={currency}
          setCurrency={setCurrency}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenQuoteModal={() => handleOpenQuoteModal()}
          onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        >
          <Suspense fallback={<PageLoadingFallback />}>
            {activeTab === "home" && (
              <HomeView
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenQuoteModal={handleOpenQuoteModal}
                onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
                currency={currency}
              />
            )}

            {activeTab === "solutions_numeriques" && (
              <SolutionsNumeriquesView
                onOpenQuoteModal={handleOpenQuoteModal}
                currency={currency}
              />
            )}

            {activeTab === "infrastructures_techniques" && (
              <InfrastructuresTechniquesView
                onOpenQuoteModal={handleOpenQuoteModal}
                currency={currency}
              />
            )}

            {activeTab === "conseil" && (
              <ConseilView
                onOpenQuoteModal={handleOpenQuoteModal}
                currency={currency}
              />
            )}

            {activeTab === "academy" && <AcademyView currency={currency} />}

            {activeTab === "marketplace" && <MarketplaceView currency={currency} />}

            {activeTab === "boutique" && (
              <BoutiqueView
                onOpenCart={() => setIsCartOpen(true)}
                currency={currency}
              />
            )}

            {activeTab === "ecosystem" && (
              <PartnersEcosystemView
                currency={currency}
                onOpenQuoteModal={handleOpenQuoteModal}
              />
            )}

            {activeTab === "ambassadeur" && (
              <AmbassadorPublicView
                currency={currency}
                onNavigateToDashboard={() => setActiveTab("dashboard")}
                onOpenQuoteModal={handleOpenQuoteModal}
              />
            )}

            {activeTab === "une_semaine_une_solution" && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <UneSemaineUneSolutionSection
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenQuoteModal={handleOpenQuoteModal}
                />
              </div>
            )}

            {activeTab === "404" && (
              <NotFoundPage onNavigateHome={() => setActiveTab("home")} />
            )}
          </Suspense>

          {/* Drawers & Modals inside PublicLayout */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            currency={currency}
          />

          <QuoteModal
            isOpen={isQuoteModalOpen}
            onClose={() => setIsQuoteModalOpen(false)}
            defaultPole={quotePole}
            defaultServiceTitle={quoteTitle}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />

          <AIAssistantDrawer
            isOpen={isAiDrawerOpen}
            onClose={() => setIsAiDrawerOpen(false)}
            onOpenQuoteWithPrompt={handleOpenQuoteWithPrompt}
          />

          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={handleAuthSuccess}
          />

          <OfficialInvoiceModal
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            initialInvoice={invoiceModalData}
            currency={currency}
          />
        </PublicLayout>
      )}
    </SmoothScrollProvider>
  );
}


