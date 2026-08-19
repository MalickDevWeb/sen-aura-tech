import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Bot, Send, Sparkles, User, FileText, ArrowRight } from "lucide-react";
import { store } from "../../database/store";
import { authFetch } from "../../lib/authFetch";

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuoteWithPrompt: (promptText: string) => void;
}

interface Message {
  sender: "user" | "ai";
  text: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onOpenQuoteWithPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Bonjour ! Je suis **SEN AURA AI**, votre conseiller d'architecture technique et projet. Comment puis-je vous guider aujourd'hui ? (Création d'application, installation solaire, recherche d'un professionnel, ou choix de formation ?)",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await authFetch("/api/ai/advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText, context: "Sénégal & Afrique" }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.reply) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "Problème de connexion avec le serveur IA." },
        ]);
      }
    } catch (err) {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Erreur réseau. Veuillez réessayer." },
      ]);
    }
  };

  return createPortal(
    <div
      id="ai-assistant-backdrop"
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
        className="w-full max-w-lg bg-slate-900 border-l border-indigo-500/30 text-slate-100 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">SEN AURA AI</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                  Gemini 3.6
                </span>
              </div>
              <p className="text-xs text-slate-400">Conseiller IA pour Projets Tech & Marketplace</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompt Badges */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex gap-2 overflow-x-auto text-[11px] scrollbar-none">
          <button
            onClick={() => setInput("Combien coûte la création d'une application mobile e-commerce avec Wave ?")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-indigo-400 whitespace-nowrap transition-colors"
          >
            💡 Devis App Mobile + Wave
          </button>
          <button
            onClick={() => setInput("Je cherche un installateur de caméras et solaire à Thiès.")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-indigo-400 whitespace-nowrap transition-colors"
          >
            🎥 Caméras & Solaire Thiès
          </button>
          <button
            onClick={() => setInput("Propose-moi les meilleures formations en IA et Cloud.")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-indigo-400 whitespace-nowrap transition-colors"
          >
            🎓 Formations IA / Cloud
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "ai" && (
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                    : "bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-tl-none whitespace-pre-wrap"
                }`}
              >
                {m.text}

                {m.sender === "ai" && idx === messages.length - 1 && (
                  <div className="mt-3 pt-2 border-t border-slate-700/50 flex justify-end">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenQuoteWithPrompt(m.text.substring(0, 80));
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-[10px] transition-all"
                    >
                      <FileText className="w-3 h-3" /> Transformer en Devis Officiel
                    </button>
                  </div>
                )}
              </div>

              {m.sender === "user" && (
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-indigo-400">
              <Bot className="w-4 h-4 animate-spin" />
              <span>SEN AURA AI analyse votre requête...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question à SEN AURA AI..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
