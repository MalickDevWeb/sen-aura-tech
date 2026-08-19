import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  ShieldOff,
  Calendar,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Save,
  Zap,
  Globe,
  ExternalLink,
} from "lucide-react";
import { loadSystemConfig, saveSystemConfig } from "../../config/system-config";
import { store } from "../../database/store";

interface MaintenanceControlPanelProps {
  onExitToSite: () => void;
}

export const MaintenanceControlPanel: React.FC<MaintenanceControlPanelProps> = ({ onExitToSite }) => {
  const [config, setConfig] = useState(() => loadSystemConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isMaintenanceActive = config.security.maintenanceMode;

  // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
  const formatForInput = (isoString: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch {
      return "";
    }
  };

  const formatForDisplay = (isoString: string) => {
    if (!isoString) return "Non définie";
    try {
      return new Date(isoString).toLocaleString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const handleToggleMaintenance = () => {
    const updated = {
      ...config,
      security: {
        ...config.security,
        maintenanceMode: !config.security.maintenanceMode,
      },
    };
    setConfig(updated);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = {
      ...config,
      security: {
        ...config.security,
        estimatedReopenDate: new Date(e.target.value).toISOString(),
      },
    };
    setConfig(updated);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updated = {
      ...config,
      security: {
        ...config.security,
        maintenanceMessage: e.target.value,
      },
    };
    setConfig(updated);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveSystemConfig(config, "SuperAdmin via /maintenance_sat");
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 500);
  };

  const handleLogout = () => {
    store.logout();
    onExitToSite();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500/8 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/8 blur-3xl rounded-full pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-lg space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-base font-black text-white">Contrôle Maintenance</h1>
                <p className="text-[11px] text-slate-400 font-mono">SEN AURA TECH — Panneau Administrateur</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>

          {/* Admin info */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs font-bold text-emerald-300">
              Connecté : {store.currentUser?.fullName || "SuperAdmin"} — {store.currentUser?.phone}
            </p>
          </div>
        </div>

        {/* MAINTENANCE TOGGLE */}
        <div className={`p-5 rounded-3xl border shadow-xl transition-all duration-500 ${
          isMaintenanceActive
            ? "bg-rose-500/5 border-rose-500/30"
            : "bg-emerald-500/5 border-emerald-500/20"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                isMaintenanceActive
                  ? "bg-rose-500/20 border-rose-500/30 text-rose-400"
                  : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              }`}>
                {isMaintenanceActive
                  ? <ShieldOff className="w-5 h-5" />
                  : <ShieldCheck className="w-5 h-5" />
                }
              </div>
              <div>
                <h2 className="text-sm font-black text-white">Mode Maintenance</h2>
                <p className={`text-xs font-bold ${isMaintenanceActive ? "text-rose-400" : "text-emerald-400"}`}>
                  {isMaintenanceActive ? "⚠️ ACTIVÉ — Site inaccessible au public" : "✅ DÉSACTIVÉ — Site en ligne"}
                </p>
              </div>
            </div>

            {/* Big Toggle Switch */}
            <button
              onClick={handleToggleMaintenance}
              className={`relative w-16 h-8 rounded-full border-2 transition-all duration-300 cursor-pointer focus:outline-none ${
                isMaintenanceActive
                  ? "bg-rose-500 border-rose-400"
                  : "bg-emerald-500 border-emerald-400"
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
                  isMaintenanceActive ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Status Banner */}
          <div className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            isMaintenanceActive
              ? "bg-rose-500/15 border border-rose-500/30 text-rose-200"
              : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-200"
          }`}>
            {isMaintenanceActive ? (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Le site est actuellement en maintenance. Les visiteurs voient la page de maintenance.</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Le site est accessible normalement. Tous les services sont opérationnels.</span>
              </>
            )}
          </div>
        </div>

        {/* DATE & MESSAGE CONFIG */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Date de Retour & Message</h3>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Date & heure de réouverture estimée
            </label>
            <input
              type="datetime-local"
              value={formatForInput(config.security.estimatedReopenDate)}
              onChange={handleDateChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:border-amber-400 outline-none transition-colors cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Actuellement : <span className="text-amber-400 font-medium">{formatForDisplay(config.security.estimatedReopenDate)}</span>
            </p>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Message affiché aux visiteurs
            </label>
            <textarea
              rows={3}
              value={config.security.maintenanceMessage}
              onChange={handleMessageChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 outline-none transition-colors leading-relaxed resize-none"
              placeholder="Message de maintenance..."
            />
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 ${
            saveSuccess
              ? "bg-emerald-500 text-white shadow-emerald-500/25"
              : "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25"
          }`}
        >
          {isSaving ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /><span>Enregistrement...</span></>
          ) : saveSuccess ? (
            <><CheckCircle2 className="w-4 h-4" /><span>Configuration sauvegardée !</span></>
          ) : (
            <><Save className="w-4 h-4" /><span>Enregistrer les Modifications</span></>
          )}
        </button>

        {/* Go to full dashboard */}
        <button
          onClick={() => onExitToSite()}
          className="w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Accéder au tableau de bord complet</span>
        </button>

      </div>
    </div>
  );
};
