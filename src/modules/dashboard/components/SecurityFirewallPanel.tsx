import React, { useState, useEffect, useCallback } from "react";
import { authFetch } from "../../../lib/authFetch";

interface BlockedIp {
  ipAddress: string;
  reason: string;
  attempts: number;
  status: "BLOCKED" | "WARNING";
  unlocksAt: string | null;
  createdAt: string;
}

interface SecuritySettings {
  maxAttempts: number;
  lockDurationMinutes: number;
}

export const SecurityFirewallPanel: React.FC = () => {
  const [blockedIps, setBlockedIps] = useState<BlockedIp[]>([]);
  const [settings, setSettings] = useState<SecuritySettings>({ maxAttempts: 3, lockDurationMinutes: 15 });
  const [editSettings, setEditSettings] = useState<SecuritySettings>({ maxAttempts: 3, lockDurationMinutes: 15 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unblocking, setUnblocking] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [ipsRes, settingsRes] = await Promise.all([
        authFetch("/api/admin/security/blocked-ips"),
        authFetch("/api/admin/security/settings"),
      ]);
      const ipsData = await ipsRes.json();
      const settingsData = await settingsRes.json();
      if (ipsData.success) setBlockedIps(ipsData.blockedIps || []);
      if (settingsData.success) {
        setSettings(settingsData.settings);
        setEditSettings(settingsData.settings);
      }
    } catch (e) {
      console.warn("Failed to fetch security data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleUnblock = async (ip: string) => {
    setUnblocking(ip);
    try {
      const res = await authFetch("/api/admin/security/unblock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });
      const data = await res.json();
      if (data.success) {
        setBlockedIps((prev) => prev.filter((b) => b.ipAddress !== ip));
        showFeedback("success", `IP ${ip} débloquée avec succès.`);
      } else {
        showFeedback("error", data.error || "Erreur lors du déblocage.");
      }
    } catch {
      showFeedback("error", "Erreur réseau.");
    } finally {
      setUnblocking(null);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await authFetch("/api/admin/security/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(editSettings);
        showFeedback("success", "Paramètres de sécurité sauvegardés.");
      } else {
        showFeedback("error", data.error || "Erreur lors de la sauvegarde.");
      }
    } catch {
      showFeedback("error", "Erreur réseau.");
    } finally {
      setSaving(false);
    }
  };

  const getRemainingTime = (unlocksAt: string | null) => {
    if (!unlocksAt) return null;
    const ms = new Date(unlocksAt).getTime() - Date.now();
    if (ms <= 0) return "Expiré";
    const mins = Math.ceil(ms / 60000);
    return `${mins} min restante${mins > 1 ? "s" : ""}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#fff" }}>
            🛡️ Pare-Feu & Sécurité
          </h2>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
            Surveillance en temps réel · Protection anti-intrusion · Gestion des IPs bloquées
          </p>
        </div>
        <button
          onClick={fetchData}
          style={{
            padding: "8px 16px",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "10px",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "12px",
            background: feedback.type === "success" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${feedback.type === "success" ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
            color: feedback.type === "success" ? "#4ade80" : "#f87171",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {feedback.type === "success" ? "✅" : "❌"} {feedback.msg}
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {[
          {
            icon: "🚫",
            label: "IPs Bloquées",
            value: blockedIps.filter((b) => b.status === "BLOCKED").length,
            color: "#ef4444",
          },
          {
            icon: "⚠️",
            label: "Avertissements",
            value: blockedIps.filter((b) => b.status === "WARNING").length,
            color: "#f59e0b",
          },
          {
            icon: "🔒",
            label: "Max Tentatives",
            value: settings.maxAttempts,
            color: "#a78bfa",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "18px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>{stat.icon}</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Security Settings */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 600, color: "#fff" }}>
          ⚙️ Paramètres de Sécurité
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "8px" }}>
              Nombre max de tentatives avant blocage
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={editSettings.maxAttempts}
              onChange={(e) => setEditSettings({ ...editSettings, maxAttempts: Number(e.target.value) })}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 600,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
              Valeur actuelle en DB : {settings.maxAttempts}
            </p>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "8px" }}>
              Durée du blocage (en minutes)
            </label>
            <input
              type="number"
              min={1}
              max={1440}
              value={editSettings.lockDurationMinutes}
              onChange={(e) => setEditSettings({ ...editSettings, lockDurationMinutes: Number(e.target.value) })}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 600,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
              Valeur actuelle en DB : {settings.lockDurationMinutes} min
            </p>
          </div>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          style={{
            padding: "10px 24px",
            background: saving ? "rgba(251,191,36,0.3)" : "linear-gradient(135deg, #f59e0b, #d97706)",
            border: "none",
            borderRadius: "10px",
            color: saving ? "rgba(255,255,255,0.5)" : "#000",
            fontWeight: 700,
            fontSize: "14px",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "💾 Sauvegarde..." : "💾 Sauvegarder dans la Base de Données"}
        </button>
      </div>

      {/* Blocked IPs Table */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#fff" }}>
            🔴 Adresses IP Surveillées ({blockedIps.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.4)" }}>
            Chargement...
          </div>
        ) : blockedIps.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px",
              color: "rgba(255,255,255,0.4)",
              fontSize: "14px",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
            Aucune adresse IP suspecte. Le système est sécurisé.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  {["Adresse IP", "Raison", "Tentatives", "Statut", "Déblocage auto", "Action"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.4)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blockedIps.map((ip, idx) => (
                  <tr
                    key={ip.ipAddress}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <td style={{ padding: "14px 16px", fontSize: "14px", color: "#fff", fontFamily: "monospace", fontWeight: 600 }}>
                      {ip.ipAddress}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "rgba(255,255,255,0.55)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ip.reason}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: ip.attempts >= settings.maxAttempts ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)",
                          color: ip.attempts >= settings.maxAttempts ? "#f87171" : "#fbbf24",
                        }}
                      >
                        {ip.attempts} ×
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: ip.status === "BLOCKED" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)",
                          color: ip.status === "BLOCKED" ? "#f87171" : "#fbbf24",
                          border: `1px solid ${ip.status === "BLOCKED" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
                        }}
                      >
                        {ip.status === "BLOCKED" ? "🚫 BLOQUÉ" : "⚠️ ALERTE"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
                      {getRemainingTime(ip.unlocksAt) || "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        onClick={() => handleUnblock(ip.ipAddress)}
                        disabled={unblocking === ip.ipAddress}
                        style={{
                          padding: "6px 14px",
                          background: unblocking === ip.ipAddress ? "rgba(255,255,255,0.05)" : "rgba(34,197,94,0.15)",
                          border: "1px solid rgba(34,197,94,0.3)",
                          borderRadius: "8px",
                          color: unblocking === ip.ipAddress ? "rgba(255,255,255,0.3)" : "#4ade80",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: unblocking === ip.ipAddress ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {unblocking === ip.ipAddress ? "..." : "🔓 Débloquer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityFirewallPanel;
