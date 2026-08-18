import React from "react";
import { Compass, Home, Search, AlertOctagon, Sparkles } from "lucide-react";

export const NotFoundPage: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background abstract elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/10 blur-3xl rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-rose-500/10 blur-3xl rounded-full pointer-events-none mix-blend-screen" />

      {/* 404 GLITCH TEXT */}
      <div className="relative z-10 flex flex-col items-center select-none">
        <h1 className="text-[120px] sm:text-[180px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-600 relative">
          404
          {/* Animated Overlay Text */}
          <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite] opacity-60 mix-blend-overlay blur-[2px]">
            404
          </span>
          <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 to-amber-600 animate-[bounce_3s_infinite] opacity-20">
            404
          </span>
        </h1>
        
        {/* Floating Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-full bg-slate-900 border border-slate-800 shadow-2xl shadow-amber-500/20 animate-[bounce_4s_infinite]">
          <Compass className="w-12 h-12 text-amber-400 animate-[spin_6s_linear_infinite]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-6 max-w-lg mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center justify-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-500" />
            Destination Inconnue
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Il semble que vous vous soyez aventuré hors de la carte SEN AURA TECH. 
            La page ou le service que vous cherchez n'existe plus ou a été déplacé dans une autre dimension.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Options de recalibrage
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onNavigateHome}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Retour à l'Accueil</span>
            </button>
            <button
              onClick={onNavigateHome}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Explorer la Plateforme</span>
            </button>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800/80">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Code d'erreur système : 404_NOT_FOUND</span>
        </div>
      </div>
    </div>
  );
};
