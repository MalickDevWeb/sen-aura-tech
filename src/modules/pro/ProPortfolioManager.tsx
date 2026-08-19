import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trash2,
  Edit3,
  Plus,
  Eye,
  PhoneCall,
  Image as ImageIcon,
  Video,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Wrench,
  MapPin,
  Coins,
  Clock,
  ShieldCheck
} from "lucide-react";
import { authFetch } from "../../lib/authFetch";
import { formatCurrency } from "../../config/constants";

interface ProPortfolioManagerProps {
  proId?: string;
  proName?: string;
  onEdit?: (item: any) => void;
  onCreate?: () => void;
  onDeleted?: () => void;
  currency?: "FCFA" | "EUR";
}

export const ProPortfolioManager: React.FC<ProPortfolioManagerProps> = ({
  proId,
  proName,
  onEdit,
  onCreate,
  onDeleted,
  currency = "FCFA",
}) => {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPortfolio = async () => {
    setLoading(true);
    setError("");
    try {
      const params = proId ? `?proId=${encodeURIComponent(proId)}` : "";
      const res = await authFetch(`/api/pro/portfolio${params}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.portfolio)) {
        setPortfolio(data.portfolio);
      } else {
        setPortfolio([]);
      }
    } catch (e) {
      setError("Impossible de charger vos réalisations.");
      setPortfolio([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, [proId]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await authFetch(`/api/pro/portfolio/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPortfolio((prev) => prev.filter((p) => p.id !== id));
        setDeleteConfirm(null);
        onDeleted?.();
      } else {
        setError(data.error || "Impossible de supprimer cette réalisation.");
      }
    } catch (e) {
      setError("Erreur réseau lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (item: any) => {
    try {
      const res = await authFetch(`/api/pro/portfolio/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setPortfolio((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, isActive: !p.isActive } : p))
        );
      }
    } catch (e) {
      console.error("Toggle active error:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-amber-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-bold">Chargement de votre portfolio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-xs font-black text-amber-300 mb-2">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>ESPACE PRESTATAIRE • MES RÉALISATIONS</span>
          </div>
          <h3 className="text-lg font-black text-white">
            Mes Chantiers & Prestations Publiés
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {portfolio.length} réalisation{portfolio.length !== 1 ? "s" : ""} sur votre profil
          </p>
        </div>
        {onCreate && (
          <button
            onClick={onCreate}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Réalisation
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {portfolio.length === 0 ? (
        <div className="p-10 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
            <Wrench className="w-8 h-8 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-300">Aucune réalisation publiée</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Publiez votre premier chantier pour apparaître dans le catalogue et attirer des clients.
            </p>
          </div>
          {onCreate && (
            <button
              onClick={onCreate}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Publier ma première réalisation
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {portfolio.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  item.isActive === false
                    ? "bg-slate-950 border-slate-800 opacity-75"
                    : "bg-slate-900 border-amber-500/30 shadow-lg shadow-amber-500/5"
                }`}
              >
                {/* Media */}
                <div className="relative w-full h-48 bg-slate-900 border-b border-slate-800">
                  {item.mainMediaType === "video" && item.mainMediaUrl ? (
                    <video src={item.mainMediaUrl} controls className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={item.mainMediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-sm border border-amber-500/40 text-[10px] font-bold text-amber-300">
                      {item.specialty}
                    </span>
                    {item.isActive === false && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-600 text-[10px] font-bold text-slate-400">
                        MASQUÉ
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-mono font-black text-xs shadow-md">
                    {formatCurrency(item.estimatedCostFCFA || 0, currency === "EUR" ? "EUR" : "FCFA")}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-black text-white leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-sky-400" />
                      {item.viewsCount || 0}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => onEdit?.(item)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center transition-colors ${
                        item.isActive !== false
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                      }`}
                      title={item.isActive !== false ? "Masquer" : "Afficher"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Supprimer cette réalisation ?</h4>
                  <p className="text-xs text-slate-400">Cette action est irréversible.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black flex items-center justify-center gap-2 transition-colors"
                >
                  {deleting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProPortfolioManager;
