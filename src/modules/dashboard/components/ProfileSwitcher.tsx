import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  User,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Users,
  Plus,
  Check,
  CreditCard,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { store } from "../../../database/store";
import { ProfileType } from "../../../shared/contracts/types";
import { PROFILES_METADATA } from "../../../config/profilesConfig";
import { eventBus, EVENTS } from "../../../shared/events/event-bus";

interface ProfileSwitcherProps {
  onOpenActivationModal?: (initialProfile?: ProfileType) => void;
  compact?: boolean;
  align?: "left" | "right";
  className?: string;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({
  onOpenActivationModal,
  compact = false,
  align = "left",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<ProfileType>(
    (store.currentUser.role as ProfileType) || "CLIENT"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubRole = eventBus.subscribe(EVENTS.ROLE_CHANGED, (newRole) => {
      setCurrentRole(newRole as ProfileType);
    });
    const unsubProfile = eventBus.subscribe("PROFILE_SWITCHED", (newProfile) => {
      setCurrentRole(newProfile as ProfileType);
    });
    return () => {
      unsubRole();
      unsubProfile();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentMeta = PROFILES_METADATA[currentRole] || PROFILES_METADATA.CLIENT;
  const userProfiles = store.currentUser.profiles || {};
  const currentSub = userProfiles[currentRole]?.subscription;

  const getProfileIcon = (type: ProfileType, className = "w-4 h-4") => {
    switch (type) {
      case "CLIENT":
        return <User className={className} />;
      case "VENDEUR":
        return <ShoppingBag className={className} />;
      case "PROFESSIONAL":
        return <Briefcase className={className} />;
      case "FORMATEUR":
        return <GraduationCap className={className} />;
      case "AMBASSADOR":
        return <Users className={className} />;
      case "ADMIN":
        return <ShieldCheck className={className} />;
      default:
        return <User className={className} />;
    }
  };

  const availableRoles: ProfileType[] = ["CLIENT", "VENDEUR", "PROFESSIONAL", "FORMATEUR"];
  if (store.currentUser.role === "ADMIN" || store.currentUser.id === "admin") {
    availableRoles.push("ADMIN");
  }
  if (store.currentUser.role === "AMBASSADOR" || userProfiles["AMBASSADOR"]) {
    availableRoles.push("AMBASSADOR");
  }

  const handleSwitch = (type: ProfileType) => {
    store.switchProfile(type);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-2xl bg-slate-900/95 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-slate-100 transition-all shadow-md group cursor-pointer ${
          isOpen ? "ring-2 ring-amber-500/30 border-amber-500/50" : ""
        }`}
        title="Changer de profil ou d'espace d'activité"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
            {getProfileIcon(currentRole, "w-4 h-4 text-amber-400")}
          </div>

          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                {currentMeta.title}
              </span>
              <span className="text-[10px] shrink-0">{currentMeta.emoji}</span>
            </div>

            {!compact && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-mono truncate">
                  {currentRole === "CLIENT"
                    ? "Gratuit"
                    : currentSub?.status === "TRIAL"
                    ? "Essai Gratuit"
                    : currentSub?.planName || "Abonné"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </div>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform ml-1 shrink-0 ${
            isOpen ? "rotate-180 text-amber-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0 left-auto" : "left-0 right-auto"
          } mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-slate-900/98 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-4 z-[60] space-y-3 animate-in fade-in slide-in-from-top-2 duration-150`}
        >
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                COMPTE UNIQUE SEN AURA
              </p>
              <h4 className="text-xs font-bold text-slate-200 truncate max-w-[200px]">
                {store.currentUser.fullName}
              </h4>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {store.currentUser.email}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              1 Compte Multi-Profils
            </span>
          </div>

          {/* Active Profiles List */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 px-1 flex items-center justify-between">
              <span>Changer d'espace instantanément :</span>
              <span className="text-[10px] text-slate-500">Sans reconnexion</span>
            </p>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {availableRoles.map((roleKey) => {
                const meta = PROFILES_METADATA[roleKey];
                const isActiveRole = currentRole === roleKey;
                const isProfileCreated = !!userProfiles[roleKey]?.active || roleKey === "CLIENT";
                const profileSub = userProfiles[roleKey]?.subscription;

                return (
                  <div
                    key={roleKey}
                    onClick={() => {
                      if (isProfileCreated) {
                        handleSwitch(roleKey);
                      } else {
                        setIsOpen(false);
                        onOpenActivationModal?.(roleKey);
                      }
                    }}
                    className={`w-full p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isActiveRole
                        ? "bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/5"
                        : isProfileCreated
                        ? "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700"
                        : "bg-slate-950/30 border-dashed border-slate-800 hover:border-amber-500/40 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isActiveRole
                            ? "bg-amber-500 text-slate-950 font-bold"
                            : isProfileCreated
                            ? "bg-slate-800 text-slate-200"
                            : "bg-slate-800/50 text-slate-500"
                        }`}
                      >
                        {getProfileIcon(roleKey, `w-4 h-4 ${isActiveRole ? "text-slate-950" : "text-amber-400"}`)}
                      </div>

                      <div className="flex flex-col text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold truncate ${
                              isActiveRole ? "text-white" : isProfileCreated ? "text-slate-200" : "text-slate-400"
                            }`}
                          >
                            {meta?.title || roleKey}
                          </span>
                          <span className="text-xs">{meta?.emoji}</span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                          {roleKey === "CLIENT" ? (
                            <span className="text-emerald-400 font-semibold">100% Gratuit</span>
                          ) : isProfileCreated ? (
                            <span className="text-slate-300">
                              {profileSub?.planName || "Abonnement Actif"}
                            </span>
                          ) : (
                            <span className="text-amber-400/80 font-medium">Non activé • Abonnement requis</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isActiveRole ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Actif</span>
                        </span>
                      ) : isProfileCreated ? (
                        <span className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-0.5">
                          <span>Basculer</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            onOpenActivationModal?.(roleKey);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[10px] font-bold border border-amber-500/30 transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Activer</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activate New Profile Action CTA */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenActivationModal?.();
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Activer un Nouveau Profil Pro</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
