"use client";

import { useEffect, useRef, useState } from "react";
import type { MerchProduct } from "@/content/site.config";
import { ProductPopup } from "@/components/ui/ProductPopup";
import { track } from "@/lib/analytics";
import { TavernEngine } from "./engine";
import { MerchFallback } from "./fallback";

/**
 * React wrapper for the canvas tavern. Owns the engine lifecycle, the touch
 * joystick, the proximity/tap popup, and the accessible product list toggle.
 * Pauses the render loop when off-screen or the tab is hidden (spec §8).
 */
export default function TavernGame() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<TavernEngine | null>(null);
  const joyRef = useRef<HTMLDivElement | null>(null);

  const [active, setActive] = useState<MerchProduct | null>(null);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let engine: TavernEngine;
    try {
      engine = new TavernEngine(canvas, {
        onStart: () => track("game_start"),
        onProximity: (item) => setActive(item ? item.product : null),
        onItemTap: (item) => setActive(item.product),
      });
    } catch {
      // canvas failed to init — the accessible fallback below still sells
      setShowList(true);
      return;
    }
    engineRef.current = engine;
    // expose for E2E / debugging (read-only handle)
    (window as unknown as { __tavern?: TavernEngine }).__tavern = engine;

    // pause when off-screen
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) engine.resume();
          else engine.pause();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(wrap);

    // pause when tab hidden
    const onVis = () => (document.hidden ? engine.pause() : engine.resume());
    document.addEventListener("visibilitychange", onVis);

    engine.start();

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // fire merch_item_view once per popup open
  useEffect(() => {
    if (active) track("merch_item_view", { product: active.id });
  }, [active]);

  // ---- touch joystick ----------------------------------------------------
  function startJoystick(e: React.PointerEvent) {
    const pad = joyRef.current;
    const engine = engineRef.current;
    if (!pad || !engine) return;
    pad.setPointerCapture(e.pointerId);

    const move = (clientX: number, clientY: number) => {
      const r = pad.getBoundingClientRect();
      const dx = (clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (clientY - (r.top + r.height / 2)) / (r.height / 2);
      engine.setJoystick(clamp(dx), clamp(dy));
    };
    move(e.clientX, e.clientY);

    const onMove = (ev: PointerEvent) => move(ev.clientX, ev.clientY);
    const onUp = () => {
      engine.setJoystick(0, 0);
      pad.removeEventListener("pointermove", onMove);
      pad.removeEventListener("pointerup", onUp);
    };
    pad.addEventListener("pointermove", onMove);
    pad.addEventListener("pointerup", onUp);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative overflow-hidden rounded-[1.25rem] border border-amber/20">
        <canvas
          ref={canvasRef}
          className="block h-[420px] w-full touch-none bg-ink sm:h-[520px]"
          aria-label="Mini-juego La Taberna: muévete con WASD, las flechas, el joystick o tocando la pantalla para acercarte al merch."
          role="img"
          data-testid="tavern-canvas"
        />

        {/* touch joystick (hidden from pointer-less / desktop hover devices) */}
        <div
          ref={joyRef}
          onPointerDown={startJoystick}
          aria-hidden="true"
          className="absolute bottom-5 left-5 h-24 w-24 touch-none rounded-full border border-cream/30 bg-ink/40 backdrop-blur-sm sm:hidden"
        >
          <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/70" />
        </div>

        {/* in-canvas proximity / tap popup */}
        {active && (
          <ProductPopup
            product={active}
            variant="overlay"
            onClose={() => setActive(null)}
          />
        )}
      </div>

      {/* accessible, non-game purchase path */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowList((s) => !s)}
          className="text-sm font-semibold uppercase tracking-wide text-amber underline-offset-4 hover:underline"
          aria-expanded={showList}
          aria-controls="merch-list"
        >
          {showList ? "Ocultar lista" : "Ver productos (lista)"}
        </button>
        {showList && (
          <div id="merch-list" className="mt-4">
            <MerchFallback />
          </div>
        )}
      </div>
    </div>
  );
}

function clamp(v: number) {
  return Math.max(-1, Math.min(1, v));
}
