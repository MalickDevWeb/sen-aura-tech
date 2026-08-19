import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Check, Info, X, ShieldAlert, Sparkles } from "lucide-react";

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
    confirmText = isAlert ? "OK, compris" : "Confirmer",
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
  const isSuccess = type === "success";
  const isWarning = type === "warning";

  const accentColor = isDanger
    ? { from: "#ef4444", to: "#dc2626", glow: "rgba(239,68,68,0.35)", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" }
    : isSuccess
    ? { from: "#22c55e", to: "#16a34a", glow: "rgba(34,197,94,0.35)", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" }
    : isWarning
    ? { from: "#f59e0b", to: "#d97706", glow: "rgba(245,158,11,0.35)", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" }
    : { from: "#3b82f6", to: "#2563eb", glow: "rgba(59,130,246,0.35)", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)" };

  const Icon = isDanger ? ShieldAlert : isSuccess ? Check : isWarning ? AlertTriangle : Info;

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(2,6,23,0.82)",
        backdropFilter: "blur(10px)",
        animation: "satFadeIn 0.18s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "linear-gradient(160deg, #0d1525 0%, #111827 100%)",
          borderRadius: "22px",
          border: `1px solid ${accentColor.border}`,
          boxShadow: `0 30px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05), 0 0 40px ${accentColor.glow}`,
          overflow: "hidden",
          animation: "satSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Top accent bar */}
        <div style={{
          height: "3px",
          background: `linear-gradient(90deg, ${accentColor.from}, ${accentColor.to}, transparent)`,
        }} />

        {/* Header */}
        <div style={{
          padding: "20px 24px 0",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "14px",
            background: accentColor.bg,
            border: `1px solid ${accentColor.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <Icon size={20} color={accentColor.from} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
              {title}
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
              SEN AURA TECH · Back‑Office
            </p>
          </div>
          <button
            onClick={handleCancel}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.4)",
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Message */}
        <div style={{ padding: "16px 24px 24px" }}>
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "20px",
          }}>
            <p style={{
              margin: 0,
              fontSize: "13px",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.65,
            }}>
              {message}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            {!isAlert && (
              <button
                onClick={handleCancel}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${accentColor.from}, ${accentColor.to})`,
                border: "none",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: `0 4px 16px ${accentColor.glow}`,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
              onMouseOver={e => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseOut={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              {isSuccess && <Sparkles size={14} />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes satFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes satSlideUp { from { opacity: 0; transform: translateY(24px) scale(0.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>,
    document.body
  );
};
