import React from "react";
import { Settings, ShieldAlert, Zap, Clock, Smartphone, Globe } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";

export const MaintenancePage: React.FC<{ message?: string; estimatedDate?: string }> = ({ message, estimatedDate }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none mix-blend-screen" />

      {/* Main Content Card */}
      <div className="max-w-2xl w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Animated Icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-full h-full bg-slate-950 border-2 border-amber-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Settings className="w-10 h-10 text-amber-400 animate-[spin_4s_linear_infinite]" />
          </div>
        </div>

        {/* Branding */}
        <div className="inline-flex flex-col items-center gap-1 mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            SEN AURA <span className="text-amber-400">TECH</span>
          </h1>
          <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full mt-2"></div>
        </div>

        {/* Message */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          Mise à niveau de la plateforme
        </h2>
        
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8">
          {message || "Notre plateforme est actuellement en maintenance programmée pour l'amélioration de nos infrastructures techniques et l'intégration de nouvelles fonctionnalités. Nous serons de retour très prochainement !"}
        </p>

        {/* Estimated Date / Contact Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          {estimatedDate && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Retour estimé</p>
                <p className="text-sm font-bold text-white">
                  {new Date(estimatedDate).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}
          
          <div className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-left ${!estimatedDate ? 'col-span-1 sm:col-span-2' : ''}`}>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Contact Urgence</p>
              <p className="text-sm font-bold text-white">+221 70 533 46 11</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <span>Serveurs Sécurisés</span>
          </div>
          <span className="hidden sm:inline text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Infrastructure Cloud</span>
          </div>
          <span className="hidden sm:inline text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-slate-400" />
            <span>Haute Performance</span>
          </div>
        </div>

      </div>
    </div>
  );
};
