import React, { useState, useEffect } from "react";
import { ShoppingBag, Bot, Sparkles, ArrowRight, ShoppingCart } from "lucide-react";
import { store } from "../../database/store";
import { eventBus, EVENTS } from "../events/event-bus";
import { WhatsAppIcon } from "./SocialCommunityPills";
import { WhatsAppGroupModal } from "./WhatsAppGroupModal";

interface FloatingWidgetProps {
  onOpenAiDrawer: () => void;
  onOpenCart: () => void;
  onNavigateToBoutique: () => void;
}

export const FloatingWidget: React.FC<FloatingWidgetProps> = ({
  onOpenAiDrawer,
  onOpenCart,
  onNavigateToBoutique,
}) => {
  const [, setTick] = useState(0);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  useEffect(() => {
    const unsub1 = eventBus.subscribe(EVENTS.PRODUCT_ADDED_TO_CART, () => setTick((t) => t + 1));
    const unsub2 = eventBus.subscribe(EVENTS.ORDER_COMPLETED, () => setTick((t) => t + 1));
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const cartCount = store.cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div 
        id="sen-aura-floating-actions"
        className="fixed bottom-20 sm:bottom-6 md:bottom-6 right-3 sm:right-5 md:right-6 z-30 flex items-center justify-end gap-2 sm:gap-2.5 md:gap-3 pointer-events-none select-none"
      >
        
        {/* BOUTIQUE & COMMANDES DIRECTES (Only displayed when there is at least 1 product in cart) */}
        {(!store.isLoggedIn || store.currentUser.role === "CLIENT") && cartCount > 0 && (
          <div className="pointer-events-auto shrink-0 animate-in zoom-in-95 duration-200">
            <button
              onClick={onOpenCart}
              className="group relative flex items-center justify-center p-2.5 sm:px-3.5 sm:py-2.5 rounded-full bg-slate-950/90 border border-amber-500/80 text-slate-100 shadow-[0_8px_32px_rgba(245,158,11,0.25)] backdrop-blur-xl hover:border-amber-400 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              title="Voir mon panier d'achats"
              aria-label="Mon Panier"
            >
              {/* Glowing pulse aura */}
              <div className="absolute -inset-0.5 bg-amber-500/30 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity" />

              <div className="relative flex items-center gap-1.5 sm:gap-2">
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black shadow-md shrink-0 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-slate-950" />
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-md">
                    {cartCount}
                  </span>
                </div>

                <div className="text-left hidden sm:flex flex-col justify-center">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-amber-400 whitespace-nowrap">
                      Mon Panier
                    </span>
                    <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-mono font-bold leading-none">
                      {cartCount}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-none whitespace-nowrap">
                    Commander
                  </p>
                </div>
                
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform hidden lg:block shrink-0" />
              </div>
            </button>
          </div>
        )}

        {/* FLOATING WHATSAPP COMMUNITY BUTTON */}
        <div className="pointer-events-auto shrink-0">
          <button
            onClick={() => setIsWhatsAppOpen(true)}
            className="group relative flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-[#00D757] hover:bg-[#00c24e] text-slate-950 shadow-[0_8px_32px_rgba(0,215,87,0.4)] backdrop-blur-xl hover:scale-105 active:scale-95 transition-all duration-200 font-black cursor-pointer border border-[#00D757] shrink-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
            title="Rejoindre la Communauté WhatsApp Officielle & Scanner le QR Code"
            aria-label="WhatsApp"
          >
            <div className="absolute -inset-0.5 bg-[#00D757] rounded-full blur-md opacity-50 group-hover:opacity-90 transition-opacity" />
            <div className="relative flex items-center gap-1.5">
              <WhatsAppIcon className="w-5 h-5 sm:w-4.5 sm:h-4.5 fill-slate-950 shrink-0" />
              <span className="text-xs font-black text-slate-950 whitespace-nowrap hidden sm:inline">WhatsApp</span>
            </div>
          </button>
        </div>

        {/* FLOATING AI ASSISTANT (IA SEN AURA) */}
        <div className="pointer-events-auto shrink-0">
          <button
            onClick={onOpenAiDrawer}
            className="group relative flex items-center justify-center p-2.5 sm:px-3.5 sm:py-2.5 rounded-full bg-slate-950/90 border border-indigo-500/80 text-slate-100 shadow-[0_8px_32px_rgba(99,102,241,0.3)] backdrop-blur-xl hover:border-indigo-400 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
            title="Consulter l'Assistant IA Flottant SEN AURA AI"
            aria-label="IA Assistant"
          >
            {/* Glowing pulse aura */}
            <div className="absolute -inset-0.5 bg-indigo-500/30 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center gap-1.5 sm:gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shrink-0 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-300 animate-pulse" />
              </div>

              <div className="text-left hidden sm:flex items-center gap-1">
                <span className="text-xs font-black text-indigo-300 whitespace-nowrap">IA Assistant</span>
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />
              </div>
            </div>
          </button>
        </div>

      </div>

      <WhatsAppGroupModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />
    </>
  );
};
