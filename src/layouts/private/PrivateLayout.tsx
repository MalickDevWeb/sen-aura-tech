import React, { useState } from "react";
import { PrivateHeader } from "./PrivateHeader";

interface PrivateLayoutProps {
  onNavigateToPublic: () => void;
  currency: "FCFA" | "EUR";
  setCurrency: (c: "FCFA" | "EUR") => void;
  onOpenAiDrawer: () => void;
  children: React.ReactNode;
}

export const PrivateLayout: React.FC<PrivateLayoutProps> = ({
  onNavigateToPublic,
  currency,
  setCurrency,
  onOpenAiDrawer,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Clean Back-office Header */}
      <PrivateHeader
        onNavigateToPublic={onNavigateToPublic}
        currency={currency}
        setCurrency={setCurrency}
        onOpenAiDrawer={onOpenAiDrawer}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main ERP / Back-office View Container */}
      <div className="flex-1 flex flex-col pb-16 sm:pb-20">
        {children}
      </div>
    </div>
  );
};
