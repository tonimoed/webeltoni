"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MerchFallback } from "@/game/fallback";
import { track } from "@/lib/analytics";

/**
 * Merch "La Taberna" (#tienda). Warm castizo styling.
 * The canvas game is dynamically imported and mounted ONLY once this section
 * scrolls into view — it never ships in the initial bundle / LCP path (spec §8).
 * Reduced-motion / reduced-data / Save-Data users get the accessible fallback
 * with no canvas at all. Buying always works without the game.
 */

const TavernGame = dynamic(() => import("@/game/TavernGame"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-[1.25rem] border border-amber/20 bg-ink/40 text-cream/60 sm:h-[520px]">
      Cargando la taberna…
    </div>
  ),
});

function prefersLite(): boolean {
  if (typeof window === "undefined") return false;
  const rm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const rd = window.matchMedia?.("(prefers-reduced-data: reduce)").matches;
  const saveData = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection?.saveData;
  return Boolean(rm || rd || saveData);
}

export function MerchTavern() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [lite, setLite] = useState(false);

  useEffect(() => {
    setLite(prefersLite());
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          track("store_visit", { product: "lqmqo-tee" });
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="tienda"
      ref={sectionRef}
      className="relative overflow-hidden py-[clamp(4rem,10vw,9rem)] text-cream"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, #7a4a16 0%, #3a2008 45%, #1a1310 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(232,163,61,0.55), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-[1280px] px-5">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber">
          La Taberna
        </p>
        <h2 className="font-display mt-2 text-h2 leading-none">La Tienda de El Toni</h2>
        <p className="mt-4 max-w-xl text-cream/80">
          Entra en la taberna y llévate algo de la casa. Muévete por el local y
          acércate al merch — o usa la lista. Tirada limitada, ligada a las canciones.
        </p>

        <div className="mt-8">
          {inView && !lite ? (
            <TavernGame />
          ) : (
            <div className="rounded-[1.25rem] border border-amber/20 bg-ink/30 p-6 backdrop-blur-sm">
              <MerchFallback />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
