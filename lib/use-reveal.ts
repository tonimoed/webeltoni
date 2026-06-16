"use client";

import { useEffect, useRef, useState } from "react";

/**
 * IntersectionObserver-based reveal. Adds `.is-visible` once the element
 * enters the viewport. Returns a ref + the visible flag (for tests/aria).
 * Honours prefers-reduced-motion by revealing immediately.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.25, ...options },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [options]);

  return { ref, visible };
}
