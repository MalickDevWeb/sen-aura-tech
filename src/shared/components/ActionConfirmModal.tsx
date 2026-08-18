import React, { useEffect, useRef } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

export interface ConfirmConfig {
  title?: string;
  message: string;
  type?: "danger" | "info" | "success" | "warning";
  isAlert?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface Props {
  config: ConfirmConfig | null;
  onClose: () => void;
}

export const ActionConfirmModal: React.FC<Props> = ({ config, onClose }) => {
  if (!config) return null;

  const {
    title = config.isAlert ? "Information" : "Confirmation",
    message,
    type = "danger",
    isAlert = false,
    confirmText = isAlert ? "OK" : "Confirmer",
    cancelText = "Annuler",
    onConfirm,
    onCancel,
  } = config;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={`p-4 ${isDanger ? "bg-rose-500/10" : "bg-blue-500/10"} flex items-center gap-3 border-b border-slate-800/50`}>
          <div className={`p-2 rounded-xl ${isDanger ? "bg-rose-500/20 text-rose-400" : "bg-blue-500/20 text-blue-400"}`}>
            {isDanger ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
          </div>
          <h3 className="font-black text-white text-lg tracking-tight">{title}</h3>
          <button onClick={handleCancel} className="ml-auto p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="p-4 bg-slate-950 flex justify-end gap-3 border-t border-slate-800">
          {!isAlert && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 rounded-xl font-bold text-white shadow-lg transition-all text-sm ${
              isDanger
                ? "bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-rose-500/20"
                : "bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 shadow-blue-500/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
