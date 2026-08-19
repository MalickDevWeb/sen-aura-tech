import React, { useState } from "react";
import { Users, Star, ShieldCheck, MapPin, Search, Calendar, Phone, CheckCircle2, FileText, Filter } from "lucide-react";

import { BRAND_CONFIG, formatCurrency } from "../../config/constants";
import { store } from "../../database/store";
import { ProfessionalDTO } from "../../shared/contracts/types";
import { useSWRInstant } from "../../lib/swr-cache";
import { OptimizedImage } from "../../shared/components/OptimizedImage";
import { useDialog } from "../../shared/components/CustomDialog";
import { authFetch } from "../../lib/authFetch";

export const MarketplaceView: React.FC<{ currency: "FCFA" | "EUR" }> = ({ currency }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
  const [selectedRegion, setSelectedRegion] = useState<string>("Toutes");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bookingProId, setBookingProId] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState<string>("2026-08-15");
  const [bookingTime, setBookingTime] = useState<string>("10:00");
  const [bookingAddress, setBookingAddress] = useState<string>("Almadies, Dakar");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const { openDialog, dialog } = useDialog();

  // SWR Instant Cache for Pros & Providers
  const { data: pros } = useSWRInstant<ProfessionalDTO[]>(
    "marketplace_pros_list",
    async () => {
      try {
        const res = await authFetch("/api/db/providers");
        const json = await res.json();
        if (json?.providers) {
          return json.providers;
        }
      } catch {}
      return [];
    },
    [],
    { dedupingInterval: 10000 }
  );

  const categories = [
    "Toutes",
    "Plomberie",
    "Électricité",
    "Développement Software",
    "Réseau & Fibre",
    "Vidéosurveillance",
    "Droit / Juridique",
  ];

  const filteredPros = (pros || []).filter((p) => {
    if (!p) return false;
    const matchCat = selectedCategory === "Toutes" || p.category === selectedCategory;
    const matchReg = selectedRegion === "Toutes" || p.region === selectedRegion;
    const q = (searchQuery || "").toLowerCase();
    if (!q) return matchCat && matchReg;
    const nameMatch = (p.fullName || "").toLowerCase().includes(q);
    const skillsMatch = Array.isArray(p.skills) && p.skills.some((s) => (s || "").toLowerCase().includes(q));
    const catMatch = (p.category || "").toLowerCase().includes(q);
    return matchCat && matchReg && (nameMatch || skillsMatch || catMatch);
  });

  const activePro = pros.find((p) => p.id === bookingProId);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePro) return;

    try {
      const res = await authFetch("/api/marketplace/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: store.currentUser.id,
          clientName: store.currentUser.fullName,
          clientPhone: store.currentUser.phone,
          proId: activePro.id,
          proName: activePro.fullName,
          proCategory: activePro.category,
          date: bookingDate,
          time: bookingTime,
          region: activePro.region,
          address: bookingAddress,
          estimatedFCFA: activePro.hourlyRateFCFA * 2,
        }),
      });

      const data = await res.json();
      if (data.success) {
        store.addBooking({
          id: data.bookingId,
          clientId: store.currentUser.id,
          clientName: store.currentUser.fullName,
          clientPhone: store.currentUser.phone,
          proId: activePro.id,
          proName: activePro.fullName,
          proCategory: activePro.category,
          date: bookingDate,
          time: bookingTime,
          region: activePro.region,
          address: bookingAddress,
          description: "Intervention sur site à domicile.",
          estimatedFCFA: activePro.hourlyRateFCFA * 2,
          status: "CONFIRMEE",
          createdAt: new Date().toISOString(),
        });
        setBookingSuccess(data.bookingId);
        setBookingProId(null);
      }
    } catch (err) {
      openDialog({
        type: "alert",
        title: "Erreur de réservation",
        message: "Une erreur est survenue lors de la réservation. Veuillez vérifier votre connexion et réessayer.",
        danger: true,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {dialog}
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
          Pôle 5 • Marketplace des Professionnels
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          L'Uber des Pros & Artisans Certifiés au Sénégal
        </h1>
        <p className="text-sm text-slate-300">
          Trouvez en quelques clics un plombier, électricien, développeur, installateur ou juriste qualifié et vérifié par SEN AURA TECH.
        </p>
      </div>

      {bookingSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Réservation effectuée avec succès ! Référence : <strong className="font-mono text-white">{bookingSuccess}</strong></span>
          </div>
          <button onClick={() => setBookingSuccess(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search */}
          <div className="relative flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou compétence..."
              className="w-full py-2 text-xs bg-transparent text-white focus:outline-hidden"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Region */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden"
          >
            <option value="Toutes">Toutes les régions du Sénégal</option>
            {BRAND_CONFIG.regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Pros Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
        {filteredPros.map((pro, idx) => {
          const isLastOdd = filteredPros.length % 2 !== 0 && idx === filteredPros.length - 1;
          return (
            <div
              key={pro.id}
              className={`cv-auto p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all flex justify-between group shadow-sm ${
                isLastOdd
                  ? "col-span-2 w-full flex-col md:col-span-1"
                  : "flex-col space-y-3 sm:space-y-4"
              }`}
            >
              {isLastOdd ? (
                <>
                  {/* Mobile Horizontal Layout (spans 2 columns, height reduced by ~40%) */}
                  <div className="flex sm:hidden items-center justify-between w-full gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <OptimizedImage
                          src={pro.avatar}
                          alt={pro.fullName}
                          aspectRatio="1/1"
                          priority={idx < 3}
                          containerClassName="w-12 h-12 rounded-full shrink-0 border-2 border-amber-500/40"
                          className="rounded-full"
                        />
                        {pro.verified && (
                          <div className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-slate-900">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                          {pro.fullName}
                        </h3>
                        <p className="text-[10px] text-amber-400 font-semibold truncate">
                          {pro.category}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-0.5 truncate">
                            <MapPin className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                            {pro.region}
                          </span>
                          <span className="text-amber-400 font-bold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-400 shrink-0" />
                            {pro.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setBookingProId(pro.id)}
                      className="shrink-0 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] uppercase transition-all cursor-pointer active:scale-95 shadow-md shadow-amber-500/20"
                    >
                      Réserver
                    </button>
                  </div>

                  {/* Desktop view */}
                  <div className="hidden sm:flex flex-col justify-between h-full w-full space-y-3 sm:space-y-4">
                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="flex flex-row gap-4 items-start text-left">
                        <OptimizedImage
                          src={pro.avatar}
                          alt={pro.fullName}
                          aspectRatio="1/1"
                          priority={idx < 3}
                          containerClassName="w-16 h-16 rounded-full shrink-0 border-2 border-amber-500/40"
                          className="rounded-full"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-start gap-1">
                            <h3 className="text-base font-bold text-white truncate group-hover:text-amber-300 transition-colors">{pro.fullName}</h3>
                            {pro.verified && <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </div>
                          <span className="text-xs font-bold text-amber-400 block mt-0.5 truncate">{pro.category}</span>
                          <div className="flex items-center justify-start gap-1.5 text-[11px] text-slate-400 mt-1">
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-500" /> {pro.region}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">{pro.completedJobs} missions</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{pro.bio}</p>

                      <div className="flex flex-wrap gap-1 pt-1 justify-start">
                        {pro.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="flex flex-row justify-between items-center text-xs">
                        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                          <span>{pro.rating}</span>
                          <span className="text-slate-500 text-[10px]">({pro.reviewsCount})</span>
                        </div>
                        <span className="font-bold text-slate-200 font-mono text-xs">
                          {formatCurrency(pro.hourlyRateFCFA, currency)} /h
                        </span>
                      </div>

                      <button
                        onClick={() => setBookingProId(pro.id)}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-amber-500/20"
                      >
                        <Calendar className="w-3.5 h-3.5" /> <span>Réserver</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center sm:items-start text-center sm:text-left">
                      <OptimizedImage
                        src={pro.avatar}
                        alt={pro.fullName}
                        aspectRatio="1/1"
                        priority={idx < 3}
                        containerClassName="w-12 h-12 sm:w-16 sm:h-16 rounded-full shrink-0 border-2 border-amber-500/40"
                        className="rounded-full"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-center sm:justify-start gap-1">
                          <h3 className="text-xs sm:text-base font-bold text-white truncate group-hover:text-amber-300 transition-colors">{pro.fullName}</h3>
                          {pro.verified && <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-amber-400 block mt-0.5 truncate">{pro.category}</span>
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] sm:text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-500" /> {pro.region}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-emerald-400 font-semibold hidden sm:inline">{pro.completedJobs} missions</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-3 hidden sm:block">{pro.bio}</p>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-1 pt-1 justify-center sm:justify-start">
                      {pro.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t border-slate-800 space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-center text-xs gap-1">
                      <div className="flex items-center gap-1 text-amber-400 font-bold text-[10px] sm:text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                        <span>{pro.rating}</span>
                        <span className="text-slate-500 text-[10px]">({pro.reviewsCount})</span>
                      </div>
                      <span className="font-bold text-slate-200 font-mono text-[10px] sm:text-xs">
                        {formatCurrency(pro.hourlyRateFCFA, currency)} /h
                      </span>
                    </div>

                    <button
                      onClick={() => setBookingProId(pro.id)}
                      className="w-full py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] sm:text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-amber-500/20"
                    >
                      <Calendar className="w-3.5 h-3.5" /> <span>Réserver</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {activePro && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 text-slate-100 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Réserver {activePro.fullName}
            </h3>
            <p className="text-xs text-slate-400">
              Disponibilité confirmée à {activePro.region}. Tarif indicatif : {formatCurrency(activePro.hourlyRateFCFA * 2, currency)} (2h).
            </p>

            <form onSubmit={handleConfirmBooking} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Date souhaitée</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Heure d'intervention</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Adresse d'intervention</label>
                <input
                  type="text"
                  required
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white mt-1"
                  placeholder="Ex: Villa 14, Sacré Cœur 3, Dakar"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingProId(null)}
                    className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                  >
                    Réserver Directement
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    store.addToCart({
                      id: `pro-${activePro.id}-${Date.now()}`,
                      name: `Intervention Pro : ${activePro.fullName}`,
                      category: "Logiciels & Licences",
                      brand: "SEN AURA Marketplace",
                      priceFCFA: activePro.hourlyRateFCFA * 2,
                      stock: 1,
                      image: activePro.avatar,
                      description: `Intervention ${activePro.category} le ${bookingDate} à ${bookingTime} (${bookingAddress})`,
                      specs: { Prestataire: activePro.fullName, Domaine: activePro.category, Région: activePro.region }
                    }, 1);
                    setBookingSuccess(`Intervention de ${activePro.fullName} ajoutée au panier !`);
                    setBookingProId(null);
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                >
                  + Ajouter l'intervention au Panier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
