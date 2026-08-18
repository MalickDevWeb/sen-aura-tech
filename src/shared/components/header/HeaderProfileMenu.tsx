import React from "react";
import { UserCheck, ShieldCheck, GraduationCap, Briefcase, ShoppingBag, User, LogOut, ChevronDown, Users, Globe, RefreshCw, Check } from "lucide-react";
import { store } from "../../../database/store";
import { UserRole, ProfileType } from "../../contracts/types";
import { PROFILES_METADATA } from "../../../config/profilesConfig";

interface HeaderProfileMenuProps {
  profileMenuOpen: boolean;
  setProfileMenuOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const HeaderProfileMenu: React.FC<HeaderProfileMenuProps> = ({
  profileMenuOpen,
  setProfileMenuOpen,
  setActiveTab,
}) => {
  const currentRole = (store.currentUser.role as ProfileType) || "CLIENT";
  const userProfiles = store.currentUser.profiles || {};

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case "ADMIN": return "SuperAdmin SI";
      case "AMBASSADOR": return "Ambassadeur VIP";
      case "PROFESSIONAL": return "Prestataire Pro";
      case "FORMATEUR": return "Formateur Academy";
      case "VENDEUR": return "Vendeur Boutique";
      default: return "Client (Gratuit)";
    }
  };

  const getProfileIcon = (type: ProfileType) => {
    switch (type) {
      case "CLIENT": return <User className="w-3.5 h-3.5 text-amber-400" />;
      case "VENDEUR": return <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />;
      case "PROFESSIONAL": return <Briefcase className="w-3.5 h-3.5 text-emerald-400" />;
      case "FORMATEUR": return <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />;
      case "AMBASSADOR": return <Users className="w-3.5 h-3.5 text-amber-400" />;
      case "ADMIN": return <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />;
      default: return <User className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const activeProfilesList: ProfileType[] = ["CLIENT"];
  if (userProfiles["VENDEUR"]?.active || store.currentUser.role === "VENDEUR") activeProfilesList.push("VENDEUR");
  if (userProfiles["PROFESSIONAL"]?.active || store.currentUser.role === "PROFESSIONAL") activeProfilesList.push("PROFESSIONAL");
  if (userProfiles["FORMATEUR"]?.active || store.currentUser.role === "FORMATEUR") activeProfilesList.push("FORMATEUR");
  if (userProfiles["AMBASSADOR"]?.active || store.currentUser.role === "AMBASSADOR") activeProfilesList.push("AMBASSADOR");
  if (store.currentUser.role === "ADMIN" || store.currentUser.id === "admin") activeProfilesList.push("ADMIN");

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
        className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 border text-xs font-bold transition-all shrink-0 cursor-pointer ${
          store.currentUser.role === "ADMIN" ? "border-rose-500/60 bg-rose-950/30 text-rose-200" : "border-emerald-500/40"
        }`}
        title="Mon Compte Unique Multi-Profils"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
          store.currentUser.role === "ADMIN" ? "bg-rose-500/20 border border-rose-500/40 text-rose-300" : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
        }`}>
          {store.currentUser.role === "ADMIN" ? (
            <ShieldCheck className="w-4 h-4 text-rose-400" />
          ) : (
            store.currentUser.fullName ? store.currentUser.fullName.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase() : "U"
          )}
        </div>
        <span className="hidden sm:inline font-bold truncate max-w-[130px]">
          {store.currentUser.fullName || "Mon Compte"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {profileMenuOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
          
          {/* Top User Card */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-white truncate">{store.currentUser.fullName || "Utilisateur"}</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                store.currentUser.role === "ADMIN"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {getRoleLabel(store.currentUser.role)}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono truncate">
              {store.currentUser.email || (store.currentUser.phone ? `${store.currentUser.phone}` : "compte@senauratech.sn")}
            </p>
          </div>

          {/* Quick Profile Switcher Section */}
          <div className="space-y-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>Changer de Profil :</span>
              <span className="text-[9px] text-slate-400 font-normal">Sans déconnexion</span>
            </p>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
              {(["CLIENT", "VENDEUR", "PROFESSIONAL", "FORMATEUR"] as ProfileType[]).map((pType) => {
                const meta = PROFILES_METADATA[pType];
                const isActive = currentRole === pType;
                const isConfigured = userProfiles[pType]?.active || pType === "CLIENT";

                return (
                  <button
                    key={pType}
                    onClick={() => {
                      if (isConfigured) {
                        store.switchProfile(pType);
                      } else {
                        setActiveTab("dashboard");
                      }
                      setProfileMenuOpen(false);
                    }}
                    className={`w-full p-1.5 rounded-lg flex items-center justify-between text-left transition-all text-xs ${
                      isActive
                        ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {getProfileIcon(pType)}
                      <span className="truncate">{meta?.title || pType}</span>
                    </div>
                    {isActive ? (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                        <Check className="w-3 h-3" />
                        <span>Actif</span>
                      </span>
                    ) : isConfigured ? (
                      <span className="text-[10px] text-slate-400">Basculer</span>
                    ) : (
                      <span className="text-[10px] text-amber-400/70">+ Activer</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setProfileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 text-slate-200 hover:text-white hover:bg-slate-800"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight">Mon Tableau de Bord</p>
                <p className="text-[10px] text-slate-400">Gérer mes activités & abonnements</p>
              </div>
            </button>

            {store.currentUser.role === "ADMIN" && (
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setProfileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-tight text-rose-200">SuperAdmin BackOffice</p>
                  <p className="text-[10px] text-rose-400">Supervision SI & Paramètres</p>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab("home");
                setProfileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 text-slate-200 hover:text-white hover:bg-slate-800"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                <Globe className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight">Voir le Site Public</p>
                <p className="text-[10px] text-slate-400">Accueil & Solutions</p>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1">
            <button
              onClick={() => {
                store.logout();
                setActiveTab("home");
                setProfileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl hover:bg-rose-500/10 text-rose-400 font-bold text-xs flex items-center gap-2 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Se Déconnecter</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

