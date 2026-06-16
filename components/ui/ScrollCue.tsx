"use client";

/** Animated "desliza" scroll hint. Static under prefers-reduced-motion. */
import { motion, useReducedMotion } from "framer-motion";

export function ScrollCue() {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col items-center gap-2 text-cream/70">
      <span className="text-[0.7rem] uppercase tracking-[0.3em]">Desliza</span>
      <motion.span
        aria-hidden="true"
        className="block h-8 w-px bg-cream/50"
        animate={reduce ? undefined : { scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ originY: 0 }}
      />
    </div>
  );
}
