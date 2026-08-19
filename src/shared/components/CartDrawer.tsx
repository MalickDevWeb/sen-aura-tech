import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ShoppingBag, Trash2, CheckCircle2, ShieldCheck, ArrowRight, Smartphone, Plus, Minus, MessageCircle } from "lucide-react";
import { store } from "../../database/store";
import { BRAND_CONFIG, formatCurrency } from "../../config/constants";
import { eventBus, EVENTS } from "../events/event-bus";
import { CelebrationOverlay } from "./CelebrationOverlay";
import { generateOrderWhatsAppPaymentMsg, redirectToWhatsAppPayment } from "../utils/whatsappHelper";
import {
  sanitizeSenegalPhoneInput,
  formatSenegalPhone,
  validateSenegalPhone,
  detectSenegalCarrier,
} from "../utils/phoneValidator";
import { useDialog } from "./CustomDialog";
import { authFetch } from "../../lib/authFetch";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currency: "FCFA" | "EUR";
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, currency }) => {
  const [selectedPayment, setSelectedPayment] = useState<string>("whatsapp_wave");
  const [phoneNumber, setPhoneNumber] = useState<string>(
    store.currentUser.phone && store.currentUser.phone !== "+221"
      ? store.currentUser.phone.replace("+221", "").trim()
      : ""
  );
  const [address, setAddress] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<{ id: string; total: number } | null>(null);
  const [, setTick] = useState<number>(0);
  const { openDialog, dialog } = useDialog();

  useEffect(() => {
    const unsub1 = eventBus.subscribe(EVENTS.PRODUCT_ADDED_TO_CART, () => setTick((t) => t + 1));
    const unsub2 = eventBus.subscribe(EVENTS.ORDER_COMPLETED, () => setTick((t) => t + 1));
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      (window as any).__lenis?.stop();
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        (window as any).__lenis?.start();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalFCFA = store.cart.reduce((sum, item) => sum + item.product.priceFCFA * item.quantity, 0);

  const handleCheckout = async () => {
    if (store.cart.length === 0) return;
    setIsProcessing(true);

    const generatedOrderId = `CMD-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullPhone = phoneNumber.startsWith("+221") ? phoneNumber : `+221 ${phoneNumber || "77 000 00 00"}`;
    const deliveryLocation = address.trim() || "Dakar, Sénégal";

    try {
      // 1. Enregistrer dans la base Neon / Backend
      await authFetch("/api/checkout/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalFCFA,
          method: "WHATSAPP_MOBILE_PAYMENT",
          items: store.cart,
          customerInfo: { fullName: store.currentUser.fullName, phone: fullPhone, address: deliveryLocation },
        }),
      }).catch((e) => console.warn("Backend order sync notice:", e));

      // 2. Enregistrer dans le store local
      store.placeOrder({
        id: generatedOrderId,
        userId: store.currentUser.id,
        userName: store.currentUser.fullName,
        items: [...store.cart],
        totalFCFA,
        paymentMethod: "WAVE" as any,
        paymentStatus: "EN_ATTENTE",
        shippingAddress: deliveryLocation,
        region: store.currentUser.region,
        createdAt: new Date().toISOString(),
      });

      // 3. Générer le message WhatsApp complet et déclencher la redirection immédiate
      const waMessage = generateOrderWhatsAppPaymentMsg({
        orderId: generatedOrderId,
        customerName: store.currentUser.fullName,
        customerPhone: fullPhone,
        address: deliveryLocation,
        totalFCFA,
        items: store.cart.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          priceFCFA: i.product.priceFCFA,
        })),
      });

      setIsProcessing(false);
      setOrderSuccess({ id: generatedOrderId, total: totalFCFA });

      // Ouvrir WhatsApp
      redirectToWhatsAppPayment(waMessage);
    } catch (err) {
      setIsProcessing(false);
      openDialog({
        type: "alert",
        title: "Erreur de paiement",
        message: "Une erreur est survenue lors de la préparation du paiement. Veuillez réessayer.",
        danger: true,
      });
    }
  };

  return createPortal(
    <>
      {dialog}
      {orderSuccess && (
        <CelebrationOverlay
          orderId={orderSuccess.id}
          totalFCFA={orderSuccess.total}
          customerName={store.currentUser.fullName}
          customerPhone={phoneNumber}
          paymentMethod="Paiement Mobile WhatsApp (Wave / Orange Money)"
          deliveryCity={address}
          currency={currency}
          onClose={() => {
            setOrderSuccess(null);
            onClose();
          }}
        />
      )}

      <div
        id="cart-drawer-backdrop"
        role="dialog"
        aria-modal="true"
        data-lenis-prevent="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-[100000] overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end"
      >
        <div 
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        >
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Panier d'Achat</h2>
                <p className="text-xs text-slate-400">{store.cart.length} article(s) sélectionné(s)</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {store.cart.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5]" />
              <p className="text-sm">Votre panier est actuellement vide.</p>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-3">
                {store.cart.map((item) => (
                  <div key={item.product.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex gap-3 items-center">
                    <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg border border-slate-700" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200 truncate">{item.product.name}</h4>
                      <p className="text-xs text-amber-400 font-bold mt-0.5">
                        {formatCurrency(item.product.priceFCFA, currency)}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                item.quantity -= 1;
                                eventBus.publish(EVENTS.PRODUCT_ADDED_TO_CART, { product: item.product, quantity: -1 });
                              } else {
                                store.removeFromCart(item.product.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold text-amber-300 px-2">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => {
                              store.addToCart(item.product, 1);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          = {formatCurrency(item.product.priceFCFA * item.quantity, currency)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => store.removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Adresse de livraison (Sénégal)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-amber-500"
                  placeholder="Quartier, Ville, Numéro"
                />
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <MessageCircle className="w-3.5 h-3.5" /> Paiement Sécurisé via WhatsApp
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Wave / Orange Money
                  </span>
                </label>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 text-xs">Paiement Mobile Direct</p>
                    <p className="text-[11px] text-emerald-300/80">Votre commande est transmise avec récapitulatif direct pour règlement par Wave ou Orange Money.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" /> Votre numéro WhatsApp / Téléphone
                    </label>
                    {detectSenegalCarrier(sanitizeSenegalPhoneInput(phoneNumber)) && (
                      <span className="text-[10px] font-bold text-amber-400">
                        {detectSenegalCarrier(sanitizeSenegalPhoneInput(phoneNumber))?.name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-xs rounded-lg text-slate-300 font-mono flex items-center gap-1">
                      <span>🇸🇳</span> +221
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={phoneNumber}
                      onChange={(e) => {
                        const raw = sanitizeSenegalPhoneInput(e.target.value);
                        setPhoneNumber(formatSenegalPhone(raw));
                      }}
                      maxLength={12}
                      placeholder="77 123 45 67"
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 text-xs rounded-lg text-white font-mono focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {store.cart.length > 0 && !orderSuccess && (
          <div className="p-5 border-t border-slate-800 bg-slate-950 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Total à régler</span>
              <span className="text-xl font-extrabold text-amber-400">{formatCurrency(totalFCFA, currency)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98"
            >
              {isProcessing ? (
                <span>Ouverture de WhatsApp...</span>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 text-slate-950" />
                  <span>Payer sur WhatsApp ({formatCurrency(totalFCFA, currency)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
    </>,
    document.body
  );
};
