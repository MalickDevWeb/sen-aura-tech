import React from "react";

export const SenegalBadge: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-medium text-slate-300 ${className}`}>
      <div className="flex items-center gap-0.5 w-5 h-3.5 rounded overflow-hidden shadow-xs border border-slate-700">
        <div className="w-1/3 h-full bg-[#15803D]"></div>
        <div className="w-1/3 h-full bg-[#EAB308] flex items-center justify-center relative">
          <span className="text-[7px] text-[#15803D] absolute font-bold">★</span>
        </div>
        <div className="w-1/3 h-full bg-[#DC2626]"></div>
      </div>
      <span>Sénégal & Afrique</span>
    </div>
  );
};
