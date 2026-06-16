"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires scroll_depth at 25/50/75/100% once each (build spec §6.3). */
export function ScrollDepth() {
  useEffect(() => {
    const fired = new Set<number>();
    const marks = [25, 50, 75, 100] as const;

    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) return;
      const pct = (window.scrollY / scrollable) * 100;
      for (const m of marks) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          track("scroll_depth", { depth: m });
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
