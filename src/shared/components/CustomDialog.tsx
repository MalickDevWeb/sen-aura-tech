import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, AlertTriangle, Info, MessageSquare } from "lucide-react";

// ============================================================
// Universal Custom Dialog — replaces all native prompt/alert
// ============================================================

export type DialogType = "prompt" | "confirm" | "alert" | "info";

interface CustomDialogProps {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value?: string) => void;
  onCancel?: () => void;
  danger?: boolean;
}

export const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  type,
  title,
  message,
  placeholder = "",
  defaultValue = "",
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
  danger = false,
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel?.();
      if (e.key === "Enter" && type !== "prompt") onConfirm();
      if (e.key === "Enter" && type === "prompt") onConfirm(inputValue);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, inputValue, type, onConfirm, onCancel]);

  if (!isOpen) return null;

  const iconMap = {
    prompt: <MessageSquare className="w-5 h-5 text-amber-400" />,
    confirm: danger
      ? <AlertTriangle className="w-5 h-5 text-rose-400" />
      : <Check className="w-5 h-5 text-amber-400" />,
    alert: <Check className="w-5 h-5 text-emerald-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />,
  };

  const accentColor = danger
    ? { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)", text: "#f87171" }
    : type === "alert"
    ? { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", text: "#4ade80" }
    : { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", text: "#fbbf24" };

  const confirmBg = danger
    ? "linear-gradient(135deg, #ef4444, #dc2626)"
    : "linear-gradient(135deg, #f59e0b, #d97706)";

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(2,6,23,0.85)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.15s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "linear-gradient(145deg, #0f172a, #1e293b)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
          animation: "slideUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Close Button */}
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            <X size={14} />
          </button>
        )}

        {/* Icon + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: accentColor.bg,
              border: `1px solid ${accentColor.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {iconMap[type]}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#fff" }}>{title}</h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
              SEN AURA TECH — Back‑Office
            </p>
          </div>
        </div>

        {/* Message */}
        <p style={{
          fontSize: "13px",
          color: "rgba(255,255,255,0.7)",
          lineHeight: 1.6,
          marginBottom: type === "prompt" ? "16px" : "24px",
          padding: "12px 14px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          {message}
        </p>

        {/* Input for prompt type */}
        {type === "prompt" && (
          <textarea
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            rows={3}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${accentColor.border}`,
              borderRadius: "12px",
              color: "#fff",
              fontSize: "13px",
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              marginBottom: "20px",
              boxSizing: "border-box",
            }}
          />
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          {type !== "alert" && onCancel && (
            <button
              onClick={onCancel}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={() => type === "prompt" ? onConfirm(inputValue) : onConfirm()}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              background: confirmBg,
              border: "none",
              color: danger ? "#fff" : "#0f172a",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: danger ? "0 4px 12px rgba(239,68,68,0.3)" : "0 4px 12px rgba(245,158,11,0.3)",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>,
    document.body
  );
};

// ============================================================
// Hook for easy imperative usage
// ============================================================

interface DialogState extends Omit<CustomDialogProps, "isOpen" | "onConfirm" | "onCancel"> {
  resolve?: (value?: string) => void;
}

export function useDialog() {
  const [state, setState] = useState<DialogState & { isOpen: boolean }>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  const openDialog = (opts: DialogState): Promise<string | undefined> => {
    return new Promise((resolve) => {
      setState({ ...opts, isOpen: true, resolve });
    });
  };

  const handleConfirm = (value?: string) => {
    state.resolve?.(value ?? "");
    setState((s) => ({ ...s, isOpen: false }));
  };

  const handleCancel = () => {
    state.resolve?.(undefined);
    setState((s) => ({ ...s, isOpen: false }));
  };

  const dialog = (
    <CustomDialog
      {...state}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { openDialog, dialog };
}
