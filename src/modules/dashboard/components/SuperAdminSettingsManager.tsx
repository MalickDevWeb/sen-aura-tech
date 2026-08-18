import React, { useState, useEffect } from "react";
import {
  Settings,
  Building,
  Phone,
  Share2,
  Percent,
  CreditCard,
  Coins,
  Truck,
  Tag,
  GraduationCap,
  ShieldAlert,
  Bell,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Globe,
  Mail,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Sliders,
  DollarSign,
  LayoutGrid,
  QrCode,
  Image as ImageIcon,
  Trash2,
  Camera,
  Flame,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  SystemConfig,
  DEFAULT_SYSTEM_CONFIG,
  loadSystemConfig,
  saveSystemConfig,
  resetSystemConfigToDefaults
} from "../../../config/system-config";
import { ShowcaseSettingsSection } from "./ShowcaseSettingsSection";
import { WeeklySolutionsSettingsSection } from "./WeeklySolutionsSettingsSection";
import { LeadershipSettingsSection } from "./LeadershipSettingsSection";
import { AdminPinResetConsole } from "../../../shared/components/AdminPinResetConsole";

interface SuperAdminSettingsManagerProps {
  onConfigSaved?: (config: SystemConfig) => void;
}

export const SuperAdminSettingsManager: React.FC<SuperAdminSettingsManagerProps> = ({ onConfigSaved }) => {
  const [config, setConfig] = useState<SystemConfig>(() => loadSystemConfig());
  const [activeSection, setActiveSection] = useState<string>("branding");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Sync state if external changes happen
  useEffect(() => {
    const loaded = loadSystemConfig();
    setConfig(loaded);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const saved = saveSystemConfig(config, "Super Admin (senauratech@gmail.com)");
      setIsSaving(false);
      setSaveSuccess(true);
      onConfigSaved?.(saved);
      setTimeout(() => setSaveSuccess(false), 3500);
    }, 400);
  };

  const handleReset = () => {
    const defaults = resetSystemConfigToDefaults();
    setConfig(defaults);
    setResetConfirmOpen(false);
    setSaveSuccess(true);
    onConfigSaved?.(defaults);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `senaura_config_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.branding || !parsed.commissions || !parsed.paymentGateways) {
          throw new Error("Format de configuration SEN-AURA invalide.");
        }
        const merged: SystemConfig = {
          ...DEFAULT_SYSTEM_CONFIG,
          ...parsed,
        };
        const saved = saveSystemConfig(merged, "Super Admin (Import JSON)");
        setConfig(saved);
        setSaveSuccess(true);
        onConfigSaved?.(saved);
        setTimeout(() => setSaveSuccess(false), 3500);
      } catch (err: any) {
        setImportError(err.message || "Erreur lors de la lecture du fichier JSON.");
      }
    };
    reader.readAsText(file);
  };

  // Section items
  const SECTIONS = [
    { id: "branding", label: "Branding & Identité", icon: Building, color: "text-amber-400" },
    { id: "leadership", label: "Équipe & Dirigeants", icon: Users, color: "text-amber-400" },
    { id: "weekly_solutions", label: "Programme 1 Semaine 1 Solution", icon: Flame, color: "text-amber-400" },
    { id: "showcase", label: "Vitrines & Accueil", icon: LayoutGrid, color: "text-amber-400" },
    { id: "contacts", label: "Contacts & Siège", icon: Phone, color: "text-sky-400" },
    { id: "socials", label: "Réseaux Sociaux", icon: Share2, color: "text-pink-400" },
    { id: "commissions", label: "Commissions & Marges", icon: Percent, color: "text-emerald-400" },
    { id: "payments", label: "Passerelles Paiement", icon: CreditCard, color: "text-cyan-400" },
    { id: "finance", label: "Finance, Devises & Taxes", icon: Coins, color: "text-yellow-400" },
    { id: "logistics", label: "Logistique & Régions", icon: Truck, color: "text-orange-400" },
    { id: "promos", label: "Codes Promo & Remises", icon: Tag, color: "text-rose-400" },
    { id: "academy", label: "Académie & Certificats", icon: GraduationCap, color: "text-purple-400" },
    { id: "security", label: "Sécurité & Maintenance", icon: ShieldAlert, color: "text-red-400" },
    { id: "notifications", label: "Alertes & Notifications", icon: Bell, color: "text-indigo-400" },
    { id: "backup", label: "Sauvegarde & Import/Export", icon: Sliders, color: "text-slate-300" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER WITH CONTROLS */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Centre de Configuration SuperAdmin</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold font-mono border border-amber-500/30">
                  v{config.version}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personnalisez et contrôlez l'intégralité des paramètres, tarifs, taux et intégrations du SI.
              </p>
            </div>
          </div>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-2 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Restaurer Défaut</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-2 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Exporter JSON</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
            ) : (
              <Save className="w-4 h-4 text-slate-950" />
            )}
            <span>{isSaving ? "Enregistrement..." : saveSuccess ? "Modifications Enregistrées !" : "Enregistrer Tout"}</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER ON SAVE */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-300 text-xs font-medium"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>Configuration appliquée avec succès !</strong> Tous les modules, passerelles de paiement, commissions et textes de marque sont synchronisés en temps réel.
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold shrink-0">
              {new Date().toLocaleTimeString()}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESET CONFIRMATION MODAL */}
      <AnimatePresence>
        {resetConfirmOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">Restauration des Paramètres d'Usine</h3>
                <p className="text-xs text-slate-400">
                  Cette action réinitialisera l'intégralité des tarifs, commissions, textes et passerelles aux valeurs recommandées par défaut.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setResetConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Confirmer la Réinitialisation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN TWO-COLUMN CONFIGURATION WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SUB-NAVIGATION LIST */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-2">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3 py-1 block">
              Domaines Configurables
            </span>
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : sec.color}`} />
                    <span className="truncate">{sec.label}</span>
                  </div>
                  <ArrowRight className={`w-3 h-3 shrink-0 ${isActive ? "text-slate-950" : "opacity-0"}`} />
                </button>
              );
            })}
          </div>

          {/* QUICK SYSTEM METRICS SUMMARY */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Dernière mise à jour:</span>
              <span className="font-mono text-white text-[11px]">
                {new Date(config.lastUpdated).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Mode Maintenance:</span>
              <span className={`font-bold ${config.security.maintenanceMode ? "text-rose-400" : "text-emerald-400"}`}>
                {config.security.maintenanceMode ? "ACTIF ⚠️" : "NORMAL ✅"}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Passerelles Actives:</span>
              <span className="font-mono text-amber-400 font-bold">
                {[
                  config.paymentGateways.wave.enabled,
                  config.paymentGateways.orangeMoney.enabled,
                  config.paymentGateways.freeMoney.enabled,
                  config.paymentGateways.bankTransfer.enabled,
                  config.paymentGateways.cashOnDelivery.enabled,
                ].filter(Boolean).length}{" "}
                / 5
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            
            {/* 1. BRANDING & IDENTITÉ */}
            {activeSection === "branding" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-400" />
                    Identité de Marque & Slogan Officiel
                  </h3>
                  <p className="text-xs text-slate-400">Définissez le nom, le slogan, la tagline et la bannière d'annonce.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Nom Officiel de l'Entreprise</label>
                    <input
                      type="text"
                      value={config.branding.name}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          branding: { ...config.branding, name: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Acronyme Court</label>
                    <input
                      type="text"
                      value={config.branding.acronym}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          branding: { ...config.branding, acronym: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Devise / Tagline Principale</label>
                    <input
                      type="text"
                      value={config.branding.tagline}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          branding: { ...config.branding, tagline: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Slogan Développé</label>
                    <input
                      type="text"
                      value={config.branding.slogan}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          branding: { ...config.branding, slogan: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Vision & Mission Institutionnelle</label>
                    <textarea
                      rows={3}
                      value={config.branding.vision}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          branding: { ...config.branding, vision: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* BANDEAU D'ALERTE HEADER */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                        Bannière d'Annonce Supérieure (Top Banner)
                      </h4>
                      <p className="text-[11px] text-slate-400">Affiche un bandeau d'alerte interactif tout en haut du site.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.branding.topBanner.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            branding: {
                              ...config.branding,
                              topBanner: { ...config.branding.topBanner, enabled: e.target.checked },
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold">Message du Bandeau</label>
                      <input
                        type="text"
                        value={config.branding.topBanner.text}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            branding: {
                              ...config.branding,
                              topBanner: { ...config.branding.topBanner, text: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold">Badge (Ex: NOUVEAU, OFFRE)</label>
                      <input
                        type="text"
                        value={config.branding.topBanner.badge}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            branding: {
                              ...config.branding,
                              topBanner: { ...config.branding.topBanner, badge: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 1.05. ÉQUIPE & DIRIGEANTS (LEADERSHIP) */}
            {activeSection === "leadership" && (
              <LeadershipSettingsSection config={config} onChange={setConfig} />
            )}

            {/* 1.1. PROGRAMME 1 SEMAINE 1 SOLUTION */}
            {activeSection === "weekly_solutions" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    Gestion Globale du Programme « 1 Semaine = 1 Application = 1 Solution »
                  </h3>
                  <p className="text-xs text-slate-400">
                    Créez, modifiez, activez/désactivez, publiez et importez des photos pour chaque solution applicative développée lors des sprints hebdomadaires.
                  </p>
                </div>
                <WeeklySolutionsSettingsSection config={config} onChange={setConfig} />
              </div>
            )}

            {/* 1.5. VITRINES & ACCUEIL (SHOWCASE) */}
            {activeSection === "showcase" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-amber-400" />
                    Personnalisation des Vitrines d'Accueil & Sections Récents
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modifiez les titres, sous-titres, boutons et la liste complète des professionnels certifiés, produits vedettes et formations phares affichés sur l'accueil.
                  </p>
                </div>
                <ShowcaseSettingsSection config={config} onChange={setConfig} />
              </div>
            )}

            {/* 2. CONTACTS & SIÈGE */}
            {activeSection === "contacts" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-sky-400" />
                    Coordonnées Officielles & Siège Social
                  </h3>
                  <p className="text-xs text-slate-400">Modifiez les numéros téléphoniques, emails et adresses physiques.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Téléphone Standard</label>
                    <input
                      type="text"
                      value={config.contacts.phone}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contacts: { ...config.contacts, phone: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">WhatsApp Business / Support Direct</label>
                    <input
                      type="text"
                      value={config.contacts.whatsapp}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contacts: { ...config.contacts, whatsapp: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Email Officiel Principal</label>
                    <input
                      type="email"
                      value={config.contacts.email}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contacts: { ...config.contacts, email: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Email Support Technique</label>
                    <input
                      type="email"
                      value={config.contacts.supportEmail}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contacts: { ...config.contacts, supportEmail: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Adresse Physique du Siège</label>
                    <input
                      type="text"
                      value={config.contacts.address}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contacts: { ...config.contacts, address: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Horaires d'Ouverture & Support</label>
                    <input
                      type="text"
                      value={config.contacts.openingHours}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contacts: { ...config.contacts, openingHours: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. RÉSEAUX SOCIAUX & CANAUX */}
            {activeSection === "socials" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-pink-400" />
                    Réseaux Sociaux & Canaux de Diffusion
                  </h3>
                  <p className="text-xs text-slate-400">Ces liens alimentent le Header, le Footer, la Communauté et l'Academy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      LinkedIn Officiel (senauratech)
                    </label>
                    <input
                      type="url"
                      value={config.socials.linkedin}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socials: { ...config.socials, linkedin: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      X / Twitter (@senauratech)
                    </label>
                    <input
                      type="url"
                      value={config.socials.twitter}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socials: { ...config.socials, twitter: e.target.value, x: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-slate-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-500" />
                      Instagram (@senauratech)
                    </label>
                    <input
                      type="url"
                      value={config.socials.instagram}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socials: { ...config.socials, instagram: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-pink-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      YouTube TV Officiel
                    </label>
                    <input
                      type="url"
                      value={config.socials.youtube}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socials: { ...config.socials, youtube: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      Facebook Page
                    </label>
                    <input
                      type="url"
                      value={config.socials.facebook}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socials: { ...config.socials, facebook: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                      Lien d'Intégration du Groupe WhatsApp Officiel (Communauté)
                    </label>
                    <input
                      type="url"
                      value={config.socials.whatsappGroup}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socials: {
                            ...config.socials,
                            whatsappGroup: e.target.value,
                            whatsappChannel: e.target.value,
                          },
                          homeShowcase: {
                            ...config.homeShowcase,
                            community: {
                              ...config.homeShowcase.community,
                              whatsappGroupLink: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs text-emerald-300 focus:border-emerald-400 outline-none font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Ce lien permet aux visiteurs et membres de rejoindre directement le groupe WhatsApp et alimente automatiquement le QR code scannable.
                    </p>
                  </div>

                  {/* GESTION DE LA PHOTO DU CODE QR WHATSAPP */}
                  <div className="md:col-span-2 p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-emerald-400" />
                          Photo / Image du Code QR WhatsApp Officiel
                        </h4>
                        <p className="text-xs text-slate-400">
                          Importez directement la photo de votre QR Code officiel ou renseignez une URL d'image.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {config.socials.whatsappQrCodeImage ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                            Photo Personnalisée Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[11px] font-medium">
                            Génération Dynamique par Lien
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      {/* Form controls */}
                      <div className="md:col-span-2 space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">
                            1. Importer une photo depuis votre appareil (PNG, JPG, WebP)
                          </label>
                          <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300 hover:text-emerald-200 text-xs font-bold cursor-pointer transition-all">
                            <Upload className="w-4 h-4" />
                            <span>Choisir une photo de code QR</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const base64 = event.target?.result as string;
                                    setConfig({
                                      ...config,
                                      socials: {
                                        ...config.socials,
                                        whatsappQrCodeImage: base64,
                                      },
                                      homeShowcase: {
                                        ...config.homeShowcase,
                                        community: {
                                          ...config.homeShowcase.community,
                                          whatsappQrCodeImage: base64,
                                        },
                                      },
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">
                            2. Ou saisir une URL directe d'image de QR code
                          </label>
                          <input
                            type="url"
                            value={config.socials.whatsappQrCodeImage || ""}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                socials: {
                                  ...config.socials,
                                  whatsappQrCodeImage: e.target.value,
                                },
                                homeShowcase: {
                                  ...config.homeShowcase,
                                  community: {
                                    ...config.homeShowcase.community,
                                    whatsappQrCodeImage: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="https://.../qr-code-whatsapp.png"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                          />
                        </div>

                        {config.socials.whatsappQrCodeImage && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfig({
                                ...config,
                                socials: {
                                  ...config.socials,
                                  whatsappQrCodeImage: "",
                                },
                                homeShowcase: {
                                  ...config.homeShowcase,
                                  community: {
                                    ...config.homeShowcase.community,
                                    whatsappQrCodeImage: "",
                                  },
                                },
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Supprimer la photo et revenir au QR Code dynamique</span>
                          </button>
                        )}
                      </div>

                      {/* Preview Box */}
                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                          Aperçu en Direct
                        </p>
                        <div className="w-32 h-32 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg overflow-hidden border border-slate-700">
                          {config.socials.whatsappQrCodeImage ? (
                            <img
                              src={config.socials.whatsappQrCodeImage}
                              alt="Aperçu Photo QR Code"
                              className="w-full h-full object-contain rounded-md"
                            />
                          ) : (
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                config.socials.whatsappGroup || "https://chat.whatsapp.com/LK5n8rhjbtfD4RVMeeZmon?s=cl&p=a&ilr=4"
                              )}&color=0-0-0&bgcolor=255-255-255&margin=0`}
                              alt="Aperçu QR Code Dynamique"
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                          {config.socials.whatsappQrCodeImage ? "Photo personnalisée chargée" : "Généré via lien"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. COMMISSIONS, MARGES & GAINS */}
            {activeSection === "commissions" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Percent className="w-4 h-4 text-emerald-400" />
                    Taux de Commissions & Marges de Revenus
                  </h3>
                  <p className="text-xs text-slate-400">Configurez la part prélevée sur les prestations, boutiques et programmes partenaires.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Commission Prestations Pros (%)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={config.commissions.proServicesPercent}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            commissions: { ...config.commissions, proServicesPercent: Number(e.target.value) },
                          })
                        }
                        className="w-28 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono font-bold"
                      />
                      <span className="text-xs text-slate-400">Prélevé sur chaque intervention validée</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Commission Vendeurs Marketplace (%)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={config.commissions.marketplaceVendorPercent}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            commissions: { ...config.commissions, marketplaceVendorPercent: Number(e.target.value) },
                          })
                        }
                        className="w-28 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono font-bold"
                      />
                      <span className="text-xs text-slate-400">Prélevé sur les ventes boutique</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Part Formateurs Academy (%)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={config.commissions.academyTrainerPercent}
                        onChange={(e) => {
                          const trainer = Number(e.target.value);
                          setConfig({
                            ...config,
                            commissions: {
                              ...config.commissions,
                              academyTrainerPercent: trainer,
                              academyPlatformPercent: Math.max(0, 100 - trainer),
                            },
                          });
                        }}
                        className="w-28 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-indigo-400 font-mono font-bold"
                      />
                      <span className="text-xs text-slate-400">
                        Reste Plateforme : {config.commissions.academyPlatformPercent}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Marge Projets Grands Comptes (%)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={config.commissions.enterpriseQuoteMarginPercent}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            commissions: { ...config.commissions, enterpriseQuoteMarginPercent: Number(e.target.value) },
                          })
                        }
                        className="w-28 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 font-mono font-bold"
                      />
                      <span className="text-xs text-slate-400">Sur devis personnalisés</span>
                    </div>
                  </div>

                  {/* AMBASSADOR COMMISSIONS */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/20 md:col-span-2 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      Programme Ambassadeurs & Apporteurs d'Affaires
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Niveau 1 Direct (%)</label>
                        <input
                          type="number"
                          value={config.commissions.ambassadorLevel1Percent}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              commissions: { ...config.commissions, ambassadorLevel1Percent: Number(e.target.value) },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Niveau 2 Filleuls (%)</label>
                        <input
                          type="number"
                          value={config.commissions.ambassadorLevel2Percent}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              commissions: { ...config.commissions, ambassadorLevel2Percent: Number(e.target.value) },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Bonus Bienvenue (FCFA)</label>
                        <input
                          type="number"
                          value={config.commissions.ambassadorWelcomeBonusFCFA}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              commissions: { ...config.commissions, ambassadorWelcomeBonusFCFA: Number(e.target.value) },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* WITHDRAWAL LIMITS */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 md:col-span-2 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                      Conditions de Retrait des Fonds
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Seuil Minimum Retrait (FCFA)</label>
                        <input
                          type="number"
                          value={config.commissions.minWithdrawalAmountFCFA}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              commissions: { ...config.commissions, minWithdrawalAmountFCFA: Number(e.target.value) },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Plafond Quotidien (FCFA)</label>
                        <input
                          type="number"
                          value={config.commissions.maxDailyWithdrawalFCFA}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              commissions: { ...config.commissions, maxDailyWithdrawalFCFA: Number(e.target.value) },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Délai Traitement (Heures)</label>
                        <input
                          type="number"
                          value={config.commissions.withdrawalProcessingDelayHours}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              commissions: { ...config.commissions, withdrawalProcessingDelayHours: Number(e.target.value) },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. PASSERELLES DE PAIEMENT */}
            {activeSection === "payments" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    Passerelles de Paiement & Données Marchandes
                  </h3>
                  <p className="text-xs text-slate-400">Configuration des canaux de paiement mobile et coordonnées Wave / Orange Money.</p>
                </div>

                {/* WHATSAPP EXCLUSIVE NOTICE BANNER */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <span className="text-xl">💬</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-emerald-300">Paiement Mobile Centralisé sur WhatsApp Actif</h4>
                    <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                      Conformément à la politique commerciale SEN AURA TECH, l'ensemble des règlements mobiles (boutique, formations, devis et factures) sont désormais automatiquement redirigés vers le canal officiel WhatsApp (+221 70 533 46 11) pour validation directe par Wave & Orange Money. Les passerelles API tierces non connectées restent désactivées.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* WAVE */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🌊</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">Wave Sénégal (Paiement QR & Mobile)</h4>
                          <p className="text-[11px] text-slate-400">Passerelle instantanée avec 1% de frais</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.paymentGateways.wave.enabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              paymentGateways: {
                                ...config.paymentGateways,
                                wave: { ...config.paymentGateways.wave, enabled: e.target.checked },
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-bold">Numéro Compte / Ligne Wave</label>
                        <input
                          type="text"
                          value={config.paymentGateways.wave.accountNumber}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              paymentGateways: {
                                ...config.paymentGateways,
                                wave: { ...config.paymentGateways.wave, accountNumber: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-bold">Nom Marchand Wave</label>
                        <input
                          type="text"
                          value={config.paymentGateways.wave.merchantName}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              paymentGateways: {
                                ...config.paymentGateways,
                                wave: { ...config.paymentGateways.wave, merchantName: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ORANGE MONEY */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-orange-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🟠</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">Orange Money Sénégal (Code OTP)</h4>
                          <p className="text-[11px] text-slate-400">Passerelle de paiement via USSD #144#391#</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.paymentGateways.orangeMoney.enabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              paymentGateways: {
                                ...config.paymentGateways,
                                orangeMoney: { ...config.paymentGateways.orangeMoney, enabled: e.target.checked },
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-bold">Numéro Marchand OM</label>
                        <input
                          type="text"
                          value={config.paymentGateways.orangeMoney.accountNumber}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              paymentGateways: {
                                ...config.paymentGateways,
                                orangeMoney: { ...config.paymentGateways.orangeMoney, accountNumber: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-bold">Nom Compte OM</label>
                        <input
                          type="text"
                          value={config.paymentGateways.orangeMoney.merchantName}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              paymentGateways: {
                                ...config.paymentGateways,
                                orangeMoney: { ...config.paymentGateways.orangeMoney, merchantName: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BANK TRANSFER & CARD */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">💳</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">Virement Bancaire & Carte Bancaire</h4>
                          <p className="text-[11px] text-slate-400">Coordonnées bancaires pour règlements par virement et cartes</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.paymentGateways.bankTransfer.enabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              paymentGateways: {
                                ...config.paymentGateways,
                                bankTransfer: { ...config.paymentGateways.bankTransfer, enabled: e.target.checked },
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] text-slate-400 font-bold">IBAN / RIB Bancaire</label>
                        <input
                          type="text"
                          value={config.paymentGateways.bankTransfer.accountNumber}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              paymentGateways: {
                                ...config.paymentGateways,
                                bankTransfer: { ...config.paymentGateways.bankTransfer, accountNumber: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. FINANCE, DEVISES & FISCALITÉ */}
            {activeSection === "finance" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    Finance, Taux de Change & Fiscalité
                  </h3>
                  <p className="text-xs text-slate-400">Gérez les devises, la TVA légale et les informations d'enregistrement fiscal.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Taux de Change 1 EUR en FCFA</label>
                    <input
                      type="number"
                      step="0.001"
                      value={config.finance.eurExchangeRate}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          finance: { ...config.finance, eurExchangeRate: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Taux de Change 1 USD en FCFA</label>
                    <input
                      type="number"
                      step="0.001"
                      value={config.finance.usdExchangeRate}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          finance: { ...config.finance, usdExchangeRate: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Taux de TVA Sénégalaise (%)</label>
                    <input
                      type="number"
                      value={config.finance.vatTaxPercent}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          finance: { ...config.finance, vatTaxPercent: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Montant Minimum de Commande (FCFA)</label>
                    <input
                      type="number"
                      value={config.finance.minOrderAmountFCFA}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          finance: { ...config.finance, minOrderAmountFCFA: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Numéro NINEA Officiel</label>
                    <input
                      type="text"
                      value={config.finance.companyNinea}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          finance: { ...config.finance, companyNinea: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Numéro RCCM</label>
                    <input
                      type="text"
                      value={config.finance.companyRccm}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          finance: { ...config.finance, companyRccm: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 7. LOGISTIQUE, FRAIS & RÉGIONS */}
            {activeSection === "logistics" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-400" />
                    Logistique, Frais de Livraison & Délais
                  </h3>
                  <p className="text-xs text-slate-400">Configurez les barèmes de transport et les zones régionales actives.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Livraison Dakar Centre (FCFA)</label>
                    <input
                      type="number"
                      value={config.logistics.dakarDeliveryFeeFCFA}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          logistics: { ...config.logistics, dakarDeliveryFeeFCFA: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Livraison Banlieue & Rufisque (FCFA)</label>
                    <input
                      type="number"
                      value={config.logistics.suburbsDeliveryFeeFCFA}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          logistics: { ...config.logistics, suburbsDeliveryFeeFCFA: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Livraison Régions (FCFA)</label>
                    <input
                      type="number"
                      value={config.logistics.regionsDeliveryFeeFCFA}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          logistics: { ...config.logistics, regionsDeliveryFeeFCFA: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-3">
                    <label className="text-xs font-bold text-slate-300">Seuil de Commande pour Livraison Gratuite (FCFA)</label>
                    <input
                      type="number"
                      value={config.logistics.freeShippingThresholdFCFA}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          logistics: { ...config.logistics, freeShippingThresholdFCFA: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                    Les 14 Régions du Sénégal Couvertes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_SYSTEM_CONFIG.logistics.activeRegions.map((region) => {
                      const isChecked = config.logistics.activeRegions.includes(region);
                      return (
                        <button
                          key={region}
                          onClick={() => {
                            const newRegions = isChecked
                              ? config.logistics.activeRegions.filter((r) => r !== region)
                              : [...config.logistics.activeRegions, region];
                            setConfig({
                              ...config,
                              logistics: { ...config.logistics, activeRegions: newRegions },
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isChecked
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                              : "bg-slate-900 border-slate-800 text-slate-500"
                          }`}
                        >
                          {isChecked ? "✓" : "×"} {region}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 8. CODES PROMO & REMISES */}
            {activeSection === "promos" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-rose-400" />
                    Codes Promo, Remises & Avantages Clients
                  </h3>
                  <p className="text-xs text-slate-400">Configurez les codes de réduction actifs et les remises automatiques.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">Code Promotionnel Actif</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.promotions.promoEnabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              promotions: { ...config.promotions, promoEnabled: e.target.checked },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Code Promo (Texte)</label>
                        <input
                          type="text"
                          value={config.promotions.activePromoCode}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              promotions: { ...config.promotions, activePromoCode: e.target.value.toUpperCase() },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Pourcentage de Réduction (%)</label>
                        <input
                          type="number"
                          value={config.promotions.promoDiscountPercent}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              promotions: { ...config.promotions, promoDiscountPercent: Number(e.target.value) },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-rose-400 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white">Remises Spéciales Automatiques</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Remise Premier Achat Client (%)</label>
                        <input
                          type="number"
                          value={config.promotions.firstOrderDiscountPercent}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              promotions: { ...config.promotions, firstOrderDiscountPercent: Number(e.target.value) },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Remise Étudiants sur l'Academy (%)</label>
                        <input
                          type="number"
                          value={config.promotions.studentAcademyDiscountPercent}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              promotions: { ...config.promotions, studentAcademyDiscountPercent: Number(e.target.value) },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 9. ACADÉMIE & CERTIFICATS */}
            {activeSection === "academy" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    Académie & Délivrance des Certifications
                  </h3>
                  <p className="text-xs text-slate-400">Personnalisez le signataire officiel des diplômes et les règles de validation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Nom du Signataire Officiel des Diplômes</label>
                    <input
                      type="text"
                      value={config.academy.certificateSignerName}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          academy: { ...config.academy, certificateSignerName: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Titre / Rôle du Signataire</label>
                    <input
                      type="text"
                      value={config.academy.certificateSignerRole}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          academy: { ...config.academy, certificateSignerRole: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Seuil de Réussite Examen (%)</label>
                    <input
                      type="number"
                      value={config.academy.passingScorePercent}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          academy: { ...config.academy, passingScorePercent: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-purple-400 font-mono font-bold"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Délivrance Automatique</h4>
                      <p className="text-[11px] text-slate-400">Génère le certificat dès 100% de complétion</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.academy.autoIssueCertificatesOn100Percent}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          academy: { ...config.academy, autoIssueCertificatesOn100Percent: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded text-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 10. SÉCURITÉ & MAINTENANCE */}
            {activeSection === "security" && (
              <div className="space-y-6">
                {/* CONSOLE DE RÉINITIALISATION EXPRESS DES CODES PIN OUBLIÉS (WHATSAPP) */}
                <AdminPinResetConsole />

                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    Sécurité, Inscriptions & Mode Maintenance
                  </h3>
                  <p className="text-xs text-slate-400">Verrouillez ou ouvrez l'accès aux inscriptions et aux services.</p>
                </div>

                {/* MAINTENANCE MODE SWITCH */}
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider font-mono">
                        Mode Maintenance Général du SI
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Active une page d'attente soignée pour tous les visiteurs non-administrateurs.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.security.maintenanceMode}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            security: { ...config.security, maintenanceMode: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600" />
                    </label>
                  </div>

                  {config.security.maintenanceMode && (
                    <div className="space-y-2 pt-2">
                      <label className="text-[11px] text-slate-300 font-bold">Message affiché aux utilisateurs</label>
                      <input
                        type="text"
                        value={config.security.maintenanceMessage}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            security: { ...config.security, maintenanceMessage: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                {/* REGISTRATION ACCESS TOGGLES */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Autorisations d'Inscriptions Publiques
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white cursor-pointer">
                      <span>Inscriptions Clients</span>
                      <input
                        type="checkbox"
                        checked={config.security.allowClientRegistrations}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            security: { ...config.security, allowClientRegistrations: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white cursor-pointer">
                      <span>Inscriptions Prestataires Pros</span>
                      <input
                        type="checkbox"
                        checked={config.security.allowProRegistrations}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            security: { ...config.security, allowProRegistrations: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white cursor-pointer">
                      <span>Inscriptions Formateurs</span>
                      <input
                        type="checkbox"
                        checked={config.security.allowFormateurRegistrations}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            security: { ...config.security, allowFormateurRegistrations: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white cursor-pointer">
                      <span>Inscriptions Ambassadeurs</span>
                      <input
                        type="checkbox"
                        checked={config.security.allowAmbassadorRegistrations}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            security: { ...config.security, allowAmbassadorRegistrations: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-amber-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 11. ALERTES & NOTIFICATIONS */}
            {activeSection === "notifications" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    Alertes Administrateur & Notifications Clients
                  </h3>
                  <p className="text-xs text-slate-400">Configurez les déclencheurs d'alertes par email et SMS.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Email Récepteur des Alertes Admin</label>
                    <input
                      type="email"
                      value={config.notifications.adminNotificationEmail}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          notifications: { ...config.notifications, adminNotificationEmail: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white cursor-pointer">
                      <span>Alerte Nouveau Devis / Projet</span>
                      <input
                        type="checkbox"
                        checked={config.notifications.notifyAdminOnQuote}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notifications: { ...config.notifications, notifyAdminOnQuote: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white cursor-pointer">
                      <span>Alerte Nouvelle Commande Boutique</span>
                      <input
                        type="checkbox"
                        checked={config.notifications.notifyAdminOnOrder}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notifications: { ...config.notifications, notifyAdminOnOrder: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white cursor-pointer">
                      <span>Alerte Nouvelle Candidature Ambassadeur</span>
                      <input
                        type="checkbox"
                        checked={config.notifications.notifyAdminOnAmbassador}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notifications: { ...config.notifications, notifyAdminOnAmbassador: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white cursor-pointer">
                      <span>Alerte Dépôt de CV / Profil RH</span>
                      <input
                        type="checkbox"
                        checked={config.notifications.notifyAdminOnCv}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notifications: { ...config.notifications, notifyAdminOnCv: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-indigo-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 12. SAUVEGARDE & IMPORT/EXPORT */}
            {activeSection === "backup" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-slate-300" />
                    Sauvegarde, Restauration & Import/Export JSON
                  </h3>
                  <p className="text-xs text-slate-400">Exportez votre configuration en JSON ou restaurez un fichier de backup.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* EXPORT */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Exporter en Fichier JSON</h4>
                        <p className="text-[11px] text-slate-400">Téléchargez une copie complète de la configuration actuelle.</p>
                      </div>
                    </div>
                    <button
                      onClick={handleExportJson}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 text-xs font-bold border border-sky-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger le Fichier .JSON</span>
                    </button>
                  </div>

                  {/* IMPORT */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Importer un Fichier JSON</h4>
                        <p className="text-[11px] text-slate-400">Chargez une sauvegarde antérieure.</p>
                      </div>
                    </div>
                    <label className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Parcourir & Charger .JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJson}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {importError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}
              </div>
            )}

            {/* BOTTOM PERSISTENCE FOOTER */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Toutes les modifications prennent effet immédiatement sur l'ensemble de la plateforme.</span>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Save className="w-4 h-4 text-slate-950" />
                )}
                <span>{isSaving ? "Enregistrement en cours..." : "Sauvegarder la Configuration"}</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
