/**
 * SEN AURA TECH - Native Lenis Smooth Scroll Engine & Provider
 * Guarantees 60-120 FPS buttery smooth scrolling with automatic mobile touch tuning
 */

import React, { useEffect, useRef, createContext, useContext } from "react";
import Lenis from "lenis";

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | HTMLElement | number, options?: any) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Only initialize smooth scroll on client with window support
    if (typeof window === "undefined") return;

    // Detect if user has prefers-reduced-motion enabled
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Detect mobile touch devices to ensure 100% native frictionless touch scrolling
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    // On mobile devices, native browser scrolling is vastly superior, smoother, and never locks
    if (isTouchDevice) {
      (window as any).__scrollToTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      };
      return;
    }

    // Create optimized Lenis instance for desktop
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.0,
      infinite: false,
      autoResize: true,
      prevent: (node: HTMLElement) => {
        if (!node || typeof node.closest !== "function") return false;
        return (
          node.hasAttribute("data-lenis-prevent") ||
          Boolean(node.closest("[data-lenis-prevent]")) ||
          Boolean(node.closest('[role="dialog"]')) ||
          Boolean(node.closest("#quote-modal-backdrop")) ||
          Boolean(node.closest("#auth-modal-backdrop")) ||
          Boolean(node.closest("#invoice-modal-backdrop")) ||
          Boolean(node.closest("#cart-drawer-backdrop")) ||
          Boolean(node.closest("#ai-assistant-backdrop"))
        );
      },
    });

    lenisRef.current = lenis;
    (window as any).__lenis = lenis;

    // High performance RAF loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Global scroll helper
    (window as any).__scrollToTop = () => {
      lenis.scrollTo(0, { immediate: true });
    };

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).__lenis;
    };
  }, []);

  const scrollTo = (target: string | HTMLElement | number, options?: any) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    } else if (typeof window !== "undefined") {
      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "smooth" });
      } else if (typeof target === "string") {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: "smooth" });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
