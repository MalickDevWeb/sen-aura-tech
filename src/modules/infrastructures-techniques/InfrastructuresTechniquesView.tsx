import React, { useState } from "react";
import { generateGenericPDF } from "../../lib/pdfGenerator";
import {
  Video,
  Wifi,
  Sun,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Wrench,
  PhoneCall,
  Home,
  Zap,
  KeyRound,
  Bell,
  Tv,
  ShoppingBag,
  Calendar,
  Download,
  Upload,
  Clock,
  UserCheck,
  Search,
  Plus,
  Check,
  Truck,
  FileSpreadsheet,
  Star,
  Phone,
  MessageSquare,
  Send,
  Radio,
  Filter,
  Server,
  Cpu,
  Layers,
  Activity,
  ChevronRight,
  DollarSign,
  AlertTriangle,
  Award,
  Maximize2,
  RefreshCw,
  Sliders,
  Share2,
  HardDrive
} from "lucide-react";
import { formatCurrency } from "../../config/constants";
import { store } from "../../database/store";

interface InfrastructuresTechniquesViewProps {
  onOpenQuoteModal: (pole: any, title: string) => void;
  currency: "FCFA" | "EUR";
}

// Sample Equipment Catalog for Rental & Sales
const EQUIPMENT_CATALOG = [
  { id: "EQ1", name: "Caméra Dôme IP Dahua 4K Intérieure", cat: "Vidéosurveillance", priceFCFA: 45000, rentDailyFCFA: 5000, stock: 12 },
  { id: "EQ2", name: "Caméra PTZ Extérieure Thermique Hikvision", cat: "Vidéosurveillance", priceFCFA: 320000, rentDailyFCFA: 25000, stock: 5 },
  { id: "EQ3", name: "NVR 16 Canaux 4K avec HDD 4TB Surveillance", cat: "Vidéosurveillance", priceFCFA: 180000, rentDailyFCFA: 15000, stock: 8 },
  { id: "EQ4", name: "Lecteur Biométrique & Reconnaissance Faciale ZKTeco", cat: "Contrôle d'Accès", priceFCFA: 125000, rentDailyFCFA: 10000, stock: 10 },
  { id: "EQ5", name: "Centrale d'Alarme Sans Fil Ajax avec Détecteurs", cat: "Alarmes", priceFCFA: 210000, rentDailyFCFA: 18000, stock: 6 },
  { id: "EQ6", name: "Switch PoE Gigabit Cisco 24 Ports Mangé", cat: "Réseaux", priceFCFA: 280000, rentDailyFCFA: 20000, stock: 7 },
  { id: "EQ7", name: "Onduleur Hybride Solaire Felicity 5kVA 48V", cat: "Énergie & Solaire", priceFCFA: 650000, rentDailyFCFA: 35000, stock: 4 },
  { id: "EQ8", name: "Batterie Lithium LiFePO4 Felicity 10kWh", cat: "Énergie & Solaire", priceFCFA: 1450000, rentDailyFCFA: 60000, stock: 3 },
  { id: "EQ9", name: "Kit Visioconférence Logitech Group Full HD", cat: "Telecom & Audio", priceFCFA: 490000, rentDailyFCFA: 30000, stock: 5 },
  { id: "EQ10", name: "Groupe Électrogène Inverter Silencieux 7.5 kVA", cat: "Énergie & Solaire", priceFCFA: 850000, rentDailyFCFA: 45000, stock: 2 },
];

export const InfrastructuresTechniquesView: React.FC<InfrastructuresTechniquesViewProps> = ({
  onOpenQuoteModal,
  currency,
}) => {
  // Navigation Tabs (12 Domaines + Interactive Simulators + Client Dashboard + Equipment Shop)
  const [activeTab, setActiveTab] = useState<
    | "D1_VIDEO"
    | "D2_ACCES"
    | "D3_ALARMES"
    | "D4_RESEAUX"
    | "D5_TELECOM"
    | "D6_SOLAIRE"
    | "D7_DOMOTIQUE"
    | "D8_ELECTRICITE"
    | "D9_MAINTENANCE"
    | "D10_LOCATION"
    | "D11_BOUTIQUE"
    | "D12_SUPPORT"
    | "SIMULATEUR"
    | "CLIENT_DASHBOARD"
  >("D1_VIDEO");

  // Camera Cost Simulator State
  const [simCamCount, setSimCamCount] = useState<number>(4);
  const [simCamType, setSimCamType] = useState<"IP_FULL_HD" | "IP_4K_PTZ" | "ANALOG">("IP_FULL_HD");
  const [simStorageDays, setSimStorageDays] = useState<number>(30);
  const [simRemoteApp, setSimRemoteApp] = useState<boolean>(true);

  // Solar Calculator State
  const [solarAppliancePower, setSolarAppliancePower] = useState<number>(2500); // Watts
  const [solarAutonomyHours, setSolarAutonomyHours] = useState<number>(12); // Hours

  // Maintenance Ticket State
  const [ticketIssue, setTicketIssue] = useState("");
  const [ticketUrgency, setTicketUrgency] = useState("URGENT");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Shop / Rental Cart & Filters
  const [shopFilter, setShopFilter] = useState("TOUS");
  const [shopSearch, setShopSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Client Dashboard Active Sub-Tab
  const [dashSubTab, setDashSubTab] = useState<"INSTALLATIONS" | "INTERVENTIONS" | "CONTRATS" | "RAPPORTS">("INSTALLATIONS");

  // Real-Time Technician Tracking Simulation State
  const [trackingActive, setTrackingActive] = useState(false);

  // Calculate Camera Simulation Total
  const calculateCameraQuote = () => {
    let basePerCam = 35000;
    if (simCamType === "IP_4K_PTZ") basePerCam = 110000;
    if (simCamType === "ANALOG") basePerCam = 22000;

    const cablingFee = simCamCount * 12000;
    const nvrPrice = simCamCount <= 8 ? 85000 : 160000;
    const hddPrice = simStorageDays > 15 ? 90000 : 50000;
    const appConfig = simRemoteApp ? 25000 : 0;

    return simCamCount * basePerCam + cablingFee + nvrPrice + hddPrice + appConfig;
  };

  // Calculate Solar Sizing
  const calculateSolarRequirements = () => {
    const totalWh = solarAppliancePower * solarAutonomyHours;
    const panelsNeeded = Math.ceil(totalWh / (550 * 5)); // 550W panels, 5 peak sun hours
    const inverterKva = Math.ceil((solarAppliancePower * 1.3) / 1000);
    const batteriesNeeded = Math.ceil(totalWh / (48 * 100 * 0.8)); // 48V 100Ah lithium battery
    const estPriceFCFA = panelsNeeded * 110000 + inverterKva * 250000 + batteriesNeeded * 650000 + 300000; // install fee

    return { totalWh, panelsNeeded, inverterKva, batteriesNeeded, estPriceFCFA };
  };

  const solarRes = calculateSolarRequirements();

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketIssue.trim()) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketIssue("");
    }, 4000);
  };

  const filteredEquipment = EQUIPMENT_CATALOG.filter((item) => {
    const matchesCat = shopFilter === "TOUS" || item.cat === shopFilter;
    const matchesSearch = item.name.toLowerCase().includes(shopSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-4xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
          Pôle 2 • Infrastructures & Services Techniques
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Vidéosurveillance IP, Réseaux, Contrôle d'Accès & Énergie Solaire
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl mx-auto">
          Étude, fourniture, câblage, installation et télémaintenance d'équipements de sécurité électronique, réseaux fibre optique et systèmes solaires autonomes au Sénégal.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
          <button
            onClick={() => setActiveTab("CLIENT_DASHBOARD")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "CLIENT_DASHBOARD"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "bg-slate-900 border border-emerald-500/30 text-emerald-300 hover:bg-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4" /> 📊 Tableau de Bord & Mes Installations
          </button>

          <button
            onClick={() => setActiveTab("SIMULATEUR")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "SIMULATEUR"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" /> 🧮 Simulateurs de Coût (Caméras & Solaire)
          </button>

          <button
            onClick={() => setActiveTab("D11_BOUTIQUE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "D11_BOUTIQUE"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-blue-400" /> 🛒 Boutique Matériel & Location ({cartCount})
          </button>
        </div>
      </div>

      {/* 12 DOMAINES NAVIGATION BAR */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-emerald-400" /> Domaines d'Expertise Technique :
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
          {[
            { id: "D1_VIDEO", label: "1. Vidéosurveillance", icon: Video },
            { id: "D2_ACCES", label: "2. Contrôle d'Accès", icon: KeyRound },
            { id: "D3_ALARMES", label: "3. Alarmes & Sécurité", icon: Bell },
            { id: "D4_RESEAUX", label: "4. Réseaux & Fibre", icon: Wifi },
            { id: "D5_TELECOM", label: "5. Telecom & IPBX", icon: PhoneCall },
            { id: "D6_SOLAIRE", label: "6. Énergie & Solaire", icon: Sun },
            { id: "D7_DOMOTIQUE", label: "7. Domotique", icon: Home },
            { id: "D8_ELECTRICITE", label: "8. Électricité Tech.", icon: Zap },
            { id: "D9_MAINTENANCE", label: "9. Maintenance S.A.V", icon: Wrench },
            { id: "D10_LOCATION", label: "10. Location Matériel", icon: Clock },
            { id: "D11_BOUTIQUE", label: "11. Vente Équipements", icon: ShoppingBag },
            { id: "D12_SUPPORT", label: "12. Support & Hotline", icon: Phone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md shadow-emerald-500/10"
                    : "bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-white hover:border-slate-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DOMAINE 1: VIDÉOSURVEILLANCE */}
      {activeTab === "D1_VIDEO" && (
        <div className="space-y-8">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Domaine 1 — Vidéosurveillance Analogique, IP & Thermique</h2>
                <p className="text-xs text-slate-400">Installation de caméras HD/4K, dômes motorisés PTZ, enregistreurs NVR/DVR et visualisation à distance sur smartphone.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Système Caméras IP 4K Ultra HD", desc: "Qualité d'image exceptionnelle avec vision nocturne infrarouge et détection d'intrusion par IA.", tag: "Sécurité Haute Résolution" },
                { title: "Caméras PTZ Motorisées & Thermiques", desc: "Rotation 360°, zoom optique 30x et détection thermique pour grands sites industriels ou résidences.", tag: "Périmètre Sensible" },
                { title: "Configuration Enregistreurs NVR / DVR", desc: "Installation de serveurs de stockage sécurisés avec disque dur dédié surveillance 24/7.", tag: "Archivage Sécurisé" },
                { title: "Visualisation Mobile & Télémaintenance", desc: "Accès en direct et notifications push en cas d'intrusion via application iOS / Android.", tag: "Accès Distance" },
                { title: "Contrat de Maintenance Vidéo Annualisé", desc: "Visites préventives, nettoyage des optiques, mise à jour des firmwares et remplacement express.", tag: "Garantie Continuité" },
                { title: "Étude de Couverture & Plan de Masse", desc: "Audit sur plan architecturale pour éliminer 100% des angles morts dans votre bâtiment.", tag: "Audit Gratuit" },
              ].map((serv, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      {serv.tag}
                    </span>
                    <h3 className="text-sm font-bold text-white">{serv.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{serv.desc}</p>
                  </div>
                  <button
                    onClick={() => onOpenQuoteModal("INFRASTRUCTURES_TECHNIQUES", serv.title)}
                    className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1 mt-2"
                  >
                    <FileText className="w-3.5 h-3.5" /> Solliciter une Étude / Devis
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 2: CONTRÔLE D'ACCÈS */}
      {activeTab === "D2_ACCES" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 2 — Contrôle d'Accès Biométrique, RFID & Portiques</h2>
              <p className="text-xs text-slate-400">Sécurisation des accès physiques pour entreprises, hôtels, banques et immeubles résidentiels.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Biométrie & Reconnaissance Faciale</h3>
              <p className="text-xs text-slate-400">Lecteurs d'empreintes digitales, scanner facial 3D et mesure de température corporelle sans contact.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Badges RFID & Cartes Sans Contact</h3>
              <p className="text-xs text-slate-400">Programmation de badges personnalisés aux couleurs de l'entreprise et gestion centralisée des autorisations.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Maximize2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Portiques, Tourniquets & Obstacles</h3>
              <p className="text-xs text-slate-400">Installation de portiques électroniques de sécurité pour filtrage des flux de visiteurs à forte affluence.</p>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 3: ALARMES & SÉCURITÉ */}
      {activeTab === "D3_ALARMES" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 3 — Alarmes Anti-Intrusion & Détection d'Incendie</h2>
              <p className="text-xs text-slate-400">Protection intégrale contre les vols, incendies et fuites de gaz avec alertes SMS et sirènes haute puissance.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              "Détecteurs de Mouvement IR",
              "Capteurs d'Ouverture Portes/Fenêtres",
              "Détecteurs de Fumée Certifiés CE",
              "Capteurs de Gaz & Inondation",
              "Sirènes Extérieures Flash 110dB",
              "Transmetteurs GSM/SMS Secours",
              "Centrale d'Alarme Sans Fil Ajax",
              "Télésurveillance 24/7 Connectée",
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOMAINE 4: RÉSEAUX D'ENTREPRISE */}
      {activeTab === "D4_RESEAUX" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 4 — Réseaux Informatiques, Fibre Optique & Wi-Fi Pro</h2>
              <p className="text-xs text-slate-400">Câblage structuré Cat6a/Cat7, soudure de fibre optique, baies de brassage, Switches managés et Wi-Fi MESH.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" /> Infrastructure LAN / WAN & Fibre
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Pose et recette de câblage réseau certifié Cat 6a / Cat 7</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Raccordement et réflectométrie de fibre optique inter-bâtiments</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Montage et rangement de baies de brassage serveur 19 pouces</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Configuration de Firewalls Fortinet / PfSense & VPN sécurisés</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Commander un Audit de Réseau Informatique</h3>
              <p className="text-xs text-slate-400">Analyse de bande passante, recherche de goulots d'étranglement et plan d'optimisation de vos liaisons internet.</p>
              <button
                onClick={() => onOpenQuoteModal("INFRASTRUCTURES_TECHNIQUES", "Audit & Recette Réseau Informatique")}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Planifier un Audit Réseau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 5: TÉLÉCOMMUNICATIONS */}
      {activeTab === "D5_TELECOM" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 5 — Téléphonie IP (IPBX), VoIP & Visioconférence</h2>
              <p className="text-xs text-slate-400">Standards téléphoniques virtuels 3CX/Asterisk, téléphones IP, postes interphones vidéo et salles de visioconférence.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Phone className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Standard Téléphonique IPBX</h3>
              <p className="text-xs text-slate-400">Gestion des appels entrants, pré-décroché personnalisé et redirection automatique vers mobiles.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Tv className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Salles de Visioconférence HD</h3>
              <p className="text-xs text-slate-400">Équipement complet (barres de son, caméras 4K grand angle) compatible Teams, Zoom et Google Meet.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Radio className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Interphonie & Contrôle d'Accès</h3>
              <p className="text-xs text-slate-400">Interphones IP connectés au smartphone pour ouverture à distance du portail d'entreprise.</p>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 6: ÉNERGIE & SOLAIRE */}
      {activeTab === "D6_SOLAIRE" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 6 — Énergie Solaire Photovoltaïque & Autonomie</h2>
              <p className="text-xs text-slate-400">Dimensionnement, fourniture et installation de centrales solaires hybrides ou autonomes avec batteries Lithium LiFePO4.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Panneaux Solaires Monocristallins</h3>
              <p className="text-xs text-slate-400">Capteurs haut rendement 550W+ avec structures anti-corrosion marine pour le littoral sénégalais.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Onduleurs Hybrides Pure Sinus</h3>
              <p className="text-xs text-slate-400">Bascule instantanée sans coupure (UPS) entre le réseau Senelec, le solaire et le groupe électrogène.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <HardDrive className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Batteries Lithium LiFePO4 48V</h3>
              <p className="text-xs text-slate-400">Technologie durable (plus de 6 000 cycles), recharge rapide et zéro entretien.</p>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 7: DOMOTIQUE */}
      {activeTab === "D7_DOMOTIQUE" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 7 — Domotique & Bâtiment Connecté (Smart Building)</h2>
              <p className="text-xs text-slate-400">Automatisation des éclairages, volets roulants, portails électriques et gestion intelligente de la climatisation.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              "Motorisation de Portails & Garage",
              "Gestion Éclairage Intelligent Zigbee/Wi-Fi",
              "Thermostats Connectés & Économies Clim",
              "Scénarios Automatiques Départ / Arrivée",
              "Arrosage Automatisé Intelligent",
              "Contrôle Vocal Alexa / Google Home",
            ].map((feat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Smart Tech</span>
                <h4 className="text-xs font-bold text-white">{feat}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOMAINE 8: ÉLECTRICITÉ TECHNIQUE */}
      {activeTab === "D8_ELECTRICITE" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 8 — Électricité Technique, Tableaux & Normalisation</h2>
              <p className="text-xs text-slate-400">Mise aux normes NFC 15-100, réfection de armoires électriques, parafoudres et équilibrage des phases.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Services d'Électricité Haute Performance</h3>
            <p className="text-xs text-slate-400">Évitez les risques de court-circuit et de surtension détruisant vos appareils informatiques.</p>
            <button
              onClick={() => onOpenQuoteModal("INFRASTRUCTURES_TECHNIQUES", "Remise aux Normes Électriques & Armoires")}
              className="py-2 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Demander un Diagnostic Électrique
            </button>
          </div>
        </div>
      )}

      {/* DOMAINE 9: MAINTENANCE TECHNIQUE */}
      {activeTab === "D9_MAINTENANCE" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 9 — Maintenance Technique Préventive, Corrective & S.A.V</h2>
              <p className="text-xs text-slate-400">Signalez une panne et suivez le déplacement du technicien en temps réel jusqu'à votre site.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ticket Creation */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Déclarer un Incident / Demander une Intervention</h3>
              {ticketSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  ✓ Ticket enregistré ! Technicien affecté. Suivi disponible ci-contre.
                </div>
              )}
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <textarea
                  required
                  rows={3}
                  value={ticketIssue}
                  onChange={(e) => setTicketIssue(e.target.value)}
                  placeholder="Décrivez la panne (ex: Caméra 3 hors ligne, Onduleur en bip continu...)"
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
                <div className="flex items-center gap-3">
                  <select
                    value={ticketUrgency}
                    onChange={(e) => setTicketUrgency(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="URGENT">Urgence : Critique (Sous 2h)</option>
                    <option value="NORMAL">Urgence : Normale (Sous 24h)</option>
                  </select>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    Lancer l'Alerte Technicien
                  </button>
                </div>
              </form>
            </div>

            {/* Live Tracking Simulator Widget */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Géo-Localisation Temps Réel</span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mt-1">
                  <Truck className="w-4 h-4 text-emerald-400" /> Suivi du Technicien Mobile
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {trackingActive ? "Le véhicule de dépannage est en route vers votre localisation à Dakar Fann." : "Simulez l'arrivée d'un technicien sur votre site."}
                </p>
              </div>

              {trackingActive ? (
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Technicien : <strong className="text-white">M. Alpha Diallo</strong></span>
                    <span className="text-emerald-400 font-bold font-mono">Arrivée estimée : 14 Min</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-2/3 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-400">Véhicule Toyota Hilux • Matériel de rechange à bord</p>
                </div>
              ) : null}

              <button
                onClick={() => setTrackingActive(!trackingActive)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs ${
                  trackingActive ? "bg-slate-800 text-slate-300" : "bg-emerald-500 text-slate-950"
                }`}
              >
                {trackingActive ? "Masquer le Suivi" : "Activer la Simulation de Suivi Technicien"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOMAINE 10 & 11: LOCATION & VENTE BOUTIQUE MATÉRIEL */}
      {(activeTab === "D10_LOCATION" || activeTab === "D11_BOUTIQUE") && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Achat & Location Express</span>
              <h2 className="text-2xl font-black text-white">Catalogue Équipements Vidéo, Réseau & Solaire</h2>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={shopSearch}
                  onChange={(e) => setShopSearch(e.target.value)}
                  placeholder="Rechercher un matériel..."
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <select
                value={shopFilter}
                onChange={(e) => setShopFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="TOUS">Toutes Catégories</option>
                <option value="Vidéosurveillance">Vidéosurveillance</option>
                <option value="Contrôle d'Accès">Contrôle d'Accès</option>
                <option value="Alarmes">Alarmes</option>
                <option value="Réseaux">Réseaux</option>
                <option value="Énergie & Solaire">Énergie & Solaire</option>
              </select>
            </div>
          </div>

          {orderSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
              ✓ Commande validée ! Votre bon de livraison a été généré et transmis au service logistique.
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                      {item.cat}
                    </span>
                    <span className="text-[10px] text-slate-400">Stock: {item.stock} unités</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Prix Achat :</span>
                    <strong className="text-emerald-400 font-mono">{formatCurrency(item.priceFCFA, currency)}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Location / jour :</span>
                    <strong className="text-amber-400 font-mono">{formatCurrency(item.rentDailyFCFA, currency)} / j</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => {
                        store.addToCart({
                          id: item.id,
                          name: item.name,
                          category: "Vidéosurveillance & Alarme",
                          brand: "SEN AURA Pro",
                          priceFCFA: item.priceFCFA,
                          stock: item.stock,
                          image: "https://res.cloudinary.com/senauratech/image/upload/v1720000000/sen_aura_tech/kit_cameras_dahua_4k.png",
                          description: `Achat d'équipement : ${item.name}`,
                          specs: { Catégorie: item.cat, État: "Neuf Garanti" }
                        }, 1);
                        setOrderSuccess(true);
                        setTimeout(() => setOrderSuccess(false), 3000);
                      }}
                      className="py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px]"
                    >
                      Acheter Neuf
                    </button>
                    <button
                      onClick={() => {
                        store.addToCart({
                          id: `${item.id}-location`,
                          name: `${item.name} (Location 1j)`,
                          category: "Vidéosurveillance & Alarme",
                          brand: "SEN AURA Location",
                          priceFCFA: item.rentDailyFCFA,
                          stock: item.stock,
                          image: "https://res.cloudinary.com/senauratech/image/upload/v1720000000/sen_aura_tech/kit_cameras_dahua_4k.png",
                          description: `Location pour 1 jour de : ${item.name}`,
                          specs: { Catégorie: item.cat, Type: "Location Journalière" }
                        }, 1);
                        setOrderSuccess(true);
                        setTimeout(() => setOrderSuccess(false), 3000);
                      }}
                      className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px]"
                    >
                      Louer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOMAINE 12: SUPPORT & HOTLINE */}
      {activeTab === "D12_SUPPORT" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Domaine 12 — Support Technique, Hotline & Chat WhatsApp</h2>
              <p className="text-xs text-slate-400">Assistance téléphonique 24/7, télémaintenance à distance et prise en main de vos serveurs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-center">
              <PhoneCall className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Hotline d'Urgence 24h/7d</h3>
              <p className="text-xs text-slate-400">+221 33 800 00 00</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-center">
              <MessageSquare className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Assistance Directe WhatsApp</h3>
              <p className="text-xs text-slate-400">Envoi de vidéos de pannes & vocal</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-center">
              <Activity className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Prise en Main Télémaintenance</h3>
              <p className="text-xs text-slate-400">AnyDesk / TeamViewer sécurisé</p>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATEURS DE COÛT (VIDÉO & SOLAIRE) */}
      {activeTab === "SIMULATEUR" && (
        <div className="space-y-8">
          {/* CAMERA SIMULATOR */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Simulateur Interactif N°1</span>
              <h2 className="text-2xl font-black text-white">Calculateur de Coût d'Installation Vidéosurveillance</h2>
              <p className="text-xs text-slate-400">Configurez votre projet de caméras pour obtenir une estimation tarifaire instantanée.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex justify-between">
                    <span>Nombre de Caméras :</span>
                    <strong className="text-emerald-400">{simCamCount} Caméras</strong>
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={32}
                    value={simCamCount}
                    onChange={(e) => setSimCamCount(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Type d'Équipement</label>
                  <select
                    value={simCamType}
                    onChange={(e) => setSimCamType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="IP_FULL_HD">Caméras IP Full HD Vision Nocturne</option>
                    <option value="IP_4K_PTZ">Caméras IP 4K avec Zoom Motorisé PTZ</option>
                    <option value="ANALOG">Caméras HD-CVI Analogiques (Économiques)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Durée d'Archivage Disque Dur (Jours)</label>
                  <select
                    value={simStorageDays}
                    onChange={(e) => setSimStorageDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value={15}>15 Jours d'Enregistrement continu</option>
                    <option value={30}>30 Jours d'Enregistrement continu (Recommandé)</option>
                    <option value={60}>60 Jours d'Enregistrement (Haute Capacité)</option>
                  </select>
                </div>
              </div>

              {/* Simulation Result */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Estimation Matériel & Pose</span>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    {formatCurrency(calculateCameraQuote(), currency)}
                  </div>
                  <p className="text-xs text-slate-400">
                    Inclus : Caméras, NVR, Disque Dur dédié, Câblage Cat6, petites fournitures et paramétrage de l'application mobile.
                  </p>
                </div>

                <button
                  onClick={() => onOpenQuoteModal("INFRASTRUCTURES_TECHNIQUES", `Devis Vidéosurveillance ${simCamCount} Caméras`)}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase"
                >
                  Transformer en Devis Officiel
                </button>
              </div>
            </div>
          </div>

          {/* SOLAR SIZING CALCULATOR */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Simulateur Interactif N°2</span>
              <h2 className="text-2xl font-black text-white">Dimensionnement d'Installation Solaire Photovoltaïque</h2>
              <p className="text-xs text-slate-400">Évaluez vos besoins en panneaux et batteries Lithium selon votre consommation électrique.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex justify-between">
                    <span>Puissance des Appareils à Alimenter (Watts) :</span>
                    <strong className="text-amber-400">{solarAppliancePower} W</strong>
                  </label>
                  <input
                    type="range"
                    min={500}
                    max={10000}
                    step={250}
                    value={solarAppliancePower}
                    onChange={(e) => setSolarAppliancePower(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">Ex: 2500W = Frigo + Clim + TV + Éclairage LED + Ordinateurs</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex justify-between">
                    <span>Autonomie Souhaitée sur Batteries (Heures sans soleil) :</span>
                    <strong className="text-amber-400">{solarAutonomyHours} h</strong>
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={24}
                    value={solarAutonomyHours}
                    onChange={(e) => setSolarAutonomyHours(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-amber-400 uppercase">Résultat du Dimensionnement Solaire</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Panneaux 550W :</span>
                    <div className="text-lg font-bold text-white font-mono">{solarRes.panelsNeeded} Panneaux</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Onduleur Hybride :</span>
                    <div className="text-lg font-bold text-white font-mono">{solarRes.inverterKva} kVA Pure Sinus</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Batteries Lithium :</span>
                    <div className="text-lg font-bold text-white font-mono">{solarRes.batteriesNeeded} Batterie(s) 10kWh</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Estimation Globale :</span>
                    <div className="text-lg font-bold text-amber-400 font-mono">{formatCurrency(solarRes.estPriceFCFA, currency)}</div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenQuoteModal("INFRASTRUCTURES_TECHNIQUES", `Centrale Solaire Sizing ${solarRes.inverterKva}kVA`)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase"
                >
                  Obtenir une Offre Solaire Détaillée
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLEAU DE BORD DU CLIENT (TECHNICAL CLIENT DASHBOARD) */}
      {activeTab === "CLIENT_DASHBOARD" && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Espace E-Client & Maintenance</span>
              <h2 className="text-2xl font-black text-white">Gestion de vos Équipements & Interventions</h2>
              <p className="text-xs text-slate-400">Consultez vos installations actives, rapports techniques, contrats de garantie et tickets de dépannage.</p>
            </div>

            <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
              Site : Siège Social Almadies - Dakar
            </span>
          </div>

          {/* Sub Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {[
              { id: "INSTALLATIONS", label: "Mes Installations" },
              { id: "INTERVENTIONS", label: "Historique d'Interventions" },
              { id: "CONTRATS", label: "Contrats & Garanties" },
              { id: "RAPPORTS", label: "Rapports Techniques & Devis" },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setDashSubTab(sub.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dashSubTab === sub.id
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* SUB TAB 1: INSTALLATIONS */}
          {dashSubTab === "INSTALLATIONS" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { type: "Vidéosurveillance IP", detail: "8 Caméras Dôme 4K + NVR 16 Ch", status: "Actif - 100% Fonctionnel", date: "Janvier 2026" },
                { type: "Centrale Solaire Hybride", detail: "Onduleur 10kVA + 16 Panneaux 550W + Lithium 20kWh", status: "Actif - Production 32 kWh/j", date: "Mars 2026" },
                { type: "Contrôle d'Accès Biométrique", detail: "2 Lecteurs Faciaux ZKTeco aux portes principales", status: "Actif", date: "Mai 2026" },
              ].map((inst, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{inst.type}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {inst.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{inst.detail}</p>
                  <p className="text-[10px] text-slate-500">Mise en service : {inst.date}</p>
                </div>
              ))}
            </div>
          )}

          {/* SUB TAB 2: INTERVENTIONS */}
          {dashSubTab === "INTERVENTIONS" && (
            <div className="space-y-3">
              {[
                { title: "Nettoyage annuel des optiques & mise à jour NVR", tech: "M. Ndiaye", date: "12 Juin 2026", status: "Terminé" },
                { title: "Vérification de la tension des batteries Lithium", tech: "M. Diallo", date: "24 Juillet 2026", status: "Terminé" },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400">Technicien : {item.tech} • Date : {item.date}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* SUB TAB 3: CONTRATS */}
          {dashSubTab === "CONTRATS" && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white">Contrat de Maintenance Annuelle #MNT-2026-DKR</h4>
              <p className="text-xs text-slate-400">Couverture 24/7 avec assistance prioritaire sous 2h sur le Grand Dakar.</p>
              <div className="text-xs text-emerald-400 font-bold">Garantie active jusqu'au 31 Décembre 2026</div>
            </div>
          )}

          {/* SUB TAB 4: RAPPORTS */}
          {dashSubTab === "RAPPORTS" && (
            <div className="space-y-3">
              {[
                { name: "Rapport_Technique_Recette_Video_2026.pdf", size: "3.4 Mo" },
                { name: "Certificat_Conformite_Electrique_NFC.pdf", size: "1.8 Mo" },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold text-white">{doc.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      generateGenericPDF(
                        doc.name,
                        `Rapport Technique & Conformité : ${doc.name.replace(/_/g, " ").replace(".pdf", "")}`,
                        "INFRASTRUCTURES TECHNIQUES & RESEAUX",
                        [
                          {
                            title: "Objet de l'Intervention",
                            content: "Recette technique, test de débit fibre/câblage Cat6a/7 et vérification des normes électriques NF C 15-100.",
                          },
                          {
                            title: "Résultats des Tests",
                            content: "1. Atténuation optique : Conforme (-18 dBm).\n2. Test de terre électrique : Conforme (< 10 Ohms).\n3. Caméras IP & NVR : Enregistrement continu 4K opérationnel.",
                          },
                          {
                            title: "Validation & Garantie",
                            content: "Installation certifiée conforme et couverte par la garantie constructeur 24 mois SEN AURA TECH.",
                          },
                        ]
                      );
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Télécharger
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
