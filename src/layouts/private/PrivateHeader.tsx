import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  Bell,
  Bot,
  Globe,
  LogOut,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  Wrench,
  GraduationCap,
  ShoppingBag,
  User,
  Sparkles,
  DollarSign,
  Package,
  Award,
  FileText,
  Calendar,
  Receipt,
  X,
  Loader2
} from "lucide-react";
import { store } from "../../database/store";
import { eventBus, EVENTS } from "../../shared/events/event-bus";
import { UserRole } from "../../shared/contracts/types";
import { BrandLogo } from "../../shared/components/BrandLogo";
import { authFetch } from "../../lib/authFetch";

interface PrivateHeaderProps {
  onNavigateToPublic: () => void;
  currency: "FCFA" | "EUR";
  setCurrency: (c: "FCFA" | "EUR") => void;
  onOpenAiDrawer: () => void;
  onToggleSidebar?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const PrivateHeader: React.FC<PrivateHeaderProps> = ({
  onNavigateToPublic,
  currency,
  setCurrency,
  onOpenAiDrawer,
  onToggleSidebar,
  searchQuery = "",
  setSearchQuery,
}) => {
  const [user, setUser] = useState(store.currentUser);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [, setTick] = useState(0);

  // Fast Global Search State
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = eventBus.subscribe(EVENTS.ROLE_CHANGED, () => {
      setUser({ ...store.currentUser });
      setTick((t) => t + 1);
    });
    return () => unsub();
  }, []);

  // Debounced search on query change
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await authFetch(`/api/search/fast?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data && data.results) {
          setSearchResults(data.results);
          setSearchDropdownOpen(true);
        }
      } catch (err) {
        console.error("Fast search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getResultIcon = (type: string) => {
    switch (type) {
      case "ORDER": return <Package className="w-3.5 h-3.5 text-amber-400" />;
      case "CERTIFICATE": return <Award className="w-3.5 h-3.5 text-emerald-400" />;
      case "QUOTE": return <FileText className="w-3.5 h-3.5 text-sky-400" />;
      case "BOOKING": return <Calendar className="w-3.5 h-3.5 text-indigo-400" />;
      case "INVOICE": return <Receipt className="w-3.5 h-3.5 text-purple-400" />;
      case "USER": return <User className="w-3.5 h-3.5 text-blue-400" />;
      case "PRODUCT": return <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />;
      default: return <Search className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getResultBadge = (type: string) => {
    switch (type) {
      case "ORDER": return { label: "Commande", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
      case "CERTIFICATE": return { label: "Certificat", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
      case "QUOTE": return { label: "Devis", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" };
      case "BOOKING": return { label: "Réservation", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" };
      case "INVOICE": return { label: "Facture", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" };
      case "USER": return { label: "Utilisateur", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
      case "PRODUCT": return { label: "Boutique", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" };
      default: return { label: "Élément", color: "bg-slate-800 text-slate-300 border-slate-700" };
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "ADMIN": return "SuperAdmin SI";
      case "PROFESSIONAL": return "Prestataire Pro";
      case "FORMATEUR": return "Formateur Academy";
      case "VENDEUR": return "Vendeur Partner";
      default: return "Client / Particulier";
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN": return "bg-red-500/20 text-red-300 border-red-500/40";
      case "PROFESSIONAL": return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "FORMATEUR": return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
      case "VENDEUR": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      default: return "bg-sky-500/20 text-sky-300 border-sky-500/40";
    }
  };

  const getRoleAvatarStyle = (role: UserRole) => {
    switch (role) {
      case "ADMIN": return "bg-red-500/20 text-red-300 border border-red-500/40";
      case "PROFESSIONAL": return "bg-amber-500/20 text-amber-300 border border-amber-500/40";
      case "FORMATEUR": return "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40";
      case "VENDEUR": return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
      default: return "bg-sky-500/20 text-sky-300 border border-sky-500/40";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0F172A] border-b border-slate-800/90 shadow-xl px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        
        {/* LEFT: Mobile Sidebar Toggle + Brand Logo + Search */}
        <div className="flex items-center gap-3 lg:gap-4 flex-1">
          <div className="flex items-center gap-2 shrink-0">
            <BrandLogo variant="horizontal" size="sm" showTagline={false} />
            <span className={`hidden md:inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getRoleBadgeColor(user.role)}`}>
              {getRoleLabel(user.role).toUpperCase()}
            </span>
          </div>

          {/* Search bar inside Backoffice Header */}
          <div ref={searchContainerRef} className="hidden sm:flex items-center relative max-w-lg w-full ml-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => {
                if (searchResults.length > 0) setSearchDropdownOpen(true);
              }}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder="Recherche indexée : n° commande, certificat, email, tél, devis..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
            />
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-amber-400 absolute right-3 animate-spin" />
            ) : searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery && setSearchQuery("");
                  setSearchResults([]);
                  setSearchDropdownOpen(false);
                }}
                className="absolute right-2.5 p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}

            {/* Instant Fast Search Dropdown */}
            {searchDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[380px] overflow-y-auto">
                <div className="px-3 py-1.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                    Recherche Indexée Haute Performance
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {searchResults.length} résultat{searchResults.length > 1 ? "s" : ""}
                  </span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Aucun résultat trouvé pour "{searchQuery}".
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {searchResults.map((item, idx) => {
                      const badge = getResultBadge(item.type);
                      return (
                        <div
                          key={`${item.type}-${item.id}-${idx}`}
                          onClick={() => {
                            setSearchDropdownOpen(false);
                            // Set search query to pinpoint the item in local tab or views
                            setSearchQuery && setSearchQuery(item.id);
                          }}
                          className="px-3 py-2 hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/50 shrink-0">
                              {getResultIcon(item.type)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">
                                {item.title}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border uppercase shrink-0 ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Actions, Currency, AI Assistant, Notifications, Profile Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setCurrency("FCFA")}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                currency === "FCFA" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              FCFA
            </button>
            <button
              onClick={() => setCurrency("EUR")}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                currency === "EUR" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              EUR (€)
            </button>
          </div>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAiDrawer}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0"
            title="Assistant SEN AURA AI"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">SEN AURA AI</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">Notifications SI</span>
                  <span className="text-[10px] text-amber-400 font-mono">3 Nouvelles</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/60 space-y-0.5">
                    <p className="font-bold text-white text-[11px]">Nouveau Devis Sollicité</p>
                    <p className="text-[10px] text-slate-400">Installation Solaire 10kVA - Plateau Dakar</p>
                    <p className="text-[9px] text-slate-500">Il y a 5 minutes</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/60 space-y-0.5">
                    <p className="font-bold text-white text-[11px]">Mission Rapportée</p>
                    <p className="text-[10px] text-slate-400">Technicien Moussa Ndiaye - Intervention Clôturée</p>
                    <p className="text-[9px] text-slate-500">Il y a 30 minutes</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

          {/* USER PROFILE & SPACE SWITCHER DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all text-left"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${getRoleAvatarStyle(user.role)}`}>
                {(user?.fullName || "Utilisateur").charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block space-y-0.5">
                <p className="text-xs font-bold text-white truncate max-w-[200px] leading-tight">{user?.fullName || "Utilisateur"}</p>
                <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 space-y-3">
                {/* User info header */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white truncate">{user?.fullName || "Utilisateur"}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>

                {/* Navigation Items (Sécurisés : Uniquement son propre espace) */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-[11px] leading-none">Mon Espace ({getRoleLabel(user.role)})</p>
                        <p className="text-[9px] text-slate-400 leading-tight mt-0.5">Accès certifié & sécurisé</p>
                      </div>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </button>
                </div>

                <div className="border-t border-slate-800/80 pt-2 space-y-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigateToPublic();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-slate-800 transition-all"
                  >
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>🌐 Voir le Site Public</span>
                  </button>

                  <button
                    onClick={() => {
                      store.logout();
                      setProfileOpen(false);
                      onNavigateToPublic();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>🚪 Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
