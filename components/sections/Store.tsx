"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site.config";
import { ProductPopup } from "@/components/ui/ProductPopup";
import { track } from "@/lib/analytics";

/**
 * Fourth page (#tienda) — the store as FIVE illuminated street display cases
 * ("escaparates" like the C.P. Company street lightbox) standing on a wet night
 * plaza in front of the lit Torre Miranda (Cornellà de Llobregat). The scene is
 * a single cinematic image (generated to stay unified with torre-miranda.png);
 * interactive hotspots sit over each lit case.
 *
 * Centre case = the tee (3D render) + EL TONI signature, opens the product.
 * The other four are locked ("Próximamente" floating inside) and capture an
 * email ("Avísame") to build anticipation.
 */

const PRODUCT = site.merch.products[0];

// horizontal centre (% of the 16:9 scene) of each case — measured from the
// generated scene by column brightness; index 2 = product. The tee, ice and
// glow are baked into the scene/video, so the hotspots are invisible click
// zones covering each case.
const PANEL_CX = [11.7, 30.7, 49.7, 68.7, 87.7];
const GLASS = { w: 16, top: 28, h: 56 }; // click zone over each case, % of scene

// twinkling starfield over the sky — seeded so SSR and client match (no hydration
// mismatch) and biased to the sky band, away from the lit centre column.
function seeded(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}
const STARS = (() => {
  const r = seeded(7);
  return Array.from({ length: 36 }, () => {
    const left = r() * 100;
    const top = 2 + r() * 32; // upper sky band
    return {
      left,
      top,
      size: 1 + r() * 2.2,
      delay: (r() * 5).toFixed(2),
      dur: (1.8 + r() * 2.8).toFixed(2),
    };
  });
})();

export function Store() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const vidTopRef = useRef<HTMLVideoElement>(null);
  const vidBaseRef = useRef<HTMLVideoElement>(null);
  const snowRef = useRef<HTMLCanvasElement>(null);
  const [productOpen, setProductOpen] = useState(false);
  const [soon, setSoon] = useState(0); // >0 shows the transient "Próximamente…" toast
  const soonTimer = useRef<number | undefined>(undefined);
  const [entered, setEntered] = useState(false); // drives the zoom-in on arrival

  const showSoon = () => {
    if (soonTimer.current) clearTimeout(soonTimer.current);
    setSoon((n) => n + 1); // bump key to restart the fade animation
    soonTimer.current = window.setTimeout(() => setSoon(0), 1900);
  };

  // Seamless loop: two copies of the clip offset by half its length; the top one
  // fades out as it nears its loop boundary (where the snow "jumps"), revealing
  // the base copy which is mid-clip there — so the cut is never visible.
  useEffect(() => {
    const top = vidTopRef.current;
    const base = vidBaseRef.current;
    if (!top || !base) return;
    const CF = 0.55; // crossfade window (s)
    let raf = 0;

    const startBase = () => {
      const d = base.duration || 5;
      try {
        base.currentTime = d / 2;
      } catch {
        /* ignore */
      }
      base.play().catch(() => {});
    };
    base.addEventListener("loadedmetadata", startBase);
    if (base.readyState >= 1) startBase();
    top.play().catch(() => {});

    const tick = () => {
      const d = top.duration || 5;
      const t = top.currentTime;
      const edge = Math.min(t, d - t); // distance to nearest loop boundary
      top.style.opacity = String(Math.max(0, Math.min(1, edge / CF)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      base.removeEventListener("loadedmetadata", startBase);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let tracked = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        // re-trigger the arrival zoom every time the section comes back into view
        setEntered(entry.isIntersecting);
        if (entry.isIntersecting && !tracked) {
          track("store_visit", { product: PRODUCT.id });
          tracked = true;
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Snow particle layer drifting in front of the cases (depth + cold), paused
  // off-screen and disabled for reduced-motion.
  useEffect(() => {
    const canvas = snowRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    const flakes: { x: number; y: number; r: number; s: number; d: number }[] = [];

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (flakes.length === 0) {
        const N = Math.round(Math.min(80, (w * h) / 24000));
        for (let i = 0; i < N; i++)
          flakes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.5 + Math.random() * 1.4,
            s: 0.3 + Math.random() * 0.9,
            d: Math.random() * 1.2 - 0.2,
          });
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      for (const f of flakes) {
        f.y += f.s;
        f.x += Math.sin(f.y * 0.012) * 0.5 + f.d + 0.9; // wind to the right
        if (f.y > h + 4) {
          f.y = -4;
          f.x = Math.random() * w;
        }
        if (f.x > w + 4) f.x = -4;
        ctx.globalAlpha = Math.min(0.5, 0.12 + f.r / 6);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
      threshold: 0,
    });
    io.observe(section);
    window.addEventListener("resize", resize);
    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Size/position the hotspot stage to match the 16:9 video content as rendered
  // by object-cover over the full-bleed section, so hotspots track the cases.
  useEffect(() => {
    const R = 16 / 9;
    const fit = () => {
      const s = sectionRef.current;
      const stage = stageRef.current;
      if (!s || !stage) return;
      const w = s.clientWidth;
      const h = s.clientHeight;
      let cw: number;
      let ch: number;
      if (w / h > R) {
        cw = w;
        ch = w / R;
      } else {
        ch = h;
        cw = h * R;
      }
      stage.style.width = `${cw}px`;
      stage.style.height = `${ch}px`;
      stage.style.left = `${(w - cw) / 2}px`;
      stage.style.top = `${(h - ch) / 2}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const openProduct = () => {
    setProductOpen(true);
    track("merch_item_view", { product: PRODUCT.id });
  };

  return (
    <section
      ref={sectionRef}
      id="tienda"
      className="p4 relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden text-cream"
    >
      <h2 className="sr-only">Tienda de EL TONI</h2>

      {/* full-bleed cinematic scene (looping video, object-cover) — immersive.
          wrapper scales from a slight zoom to 1 on arrival ("entering" the place) */}
      <div className={`store-bg${entered ? " is-in" : ""}`}>
        {/* base copy (offset half a loop) — always visible underneath */}
        <video
          ref={vidBaseRef}
          className="store-bg-video"
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/photos/store-scene.webp"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/assets/video/store-scene.mp4" type="video/mp4" />
        </video>
        {/* top copy — fades out across its loop seam to hide the cut */}
        <video
          ref={vidTopRef}
          className="store-bg-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/photos/store-scene.webp"
          aria-label="Escaparates de EL TONI frente a la Torre Miranda de noche"
        >
          <source src="/assets/video/store-scene.mp4" type="video/mp4" />
        </video>
      </div>

      {/* stage matches exactly where the 16:9 video content renders under
          object-cover (computed in JS), so the % hotspots stay aligned */}
      <div ref={stageRef} className="store-stage">
        {/* twinkling stars over the sky */}
        <div className="store-stars" aria-hidden="true">
          {STARS.map((s, i) => (
            <span
              key={i}
              className="store-star"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.dur}s`,
              }}
            />
          ))}
        </div>

        {PANEL_CX.map((cx, i) => {
          const isProduct = i === 2;
          const style = {
            left: `${cx - GLASS.w / 2}%`,
            top: `${GLASS.top}%`,
            width: `${GLASS.w}%`,
            height: `${GLASS.h}%`,
          };
          return (
            <button
              key={i}
              type="button"
              style={style}
              onClick={() => (isProduct ? openProduct() : showSoon())}
              aria-label={isProduct ? `Ver ${PRODUCT.name}` : "Próximo drop — avísame por email"}
              className={`store-hotspot ${isProduct ? "store-hotspot--product" : "store-hotspot--locked"}`}
              data-testid={isProduct ? "case-product" : `case-locked-${i}`}
            />
          );
        })}
      </div>

      {/* snow drifting in front of the scene */}
      <canvas ref={snowRef} className="store-snow" aria-hidden="true" />
      {/* frosty "through-the-glass" frame */}
      <div className="store-frost" aria-hidden="true" />

      {productOpen && (
        <ProductPopup product={PRODUCT} variant="overlay" onClose={() => setProductOpen(false)} />
      )}
      {soon > 0 && (
        <div key={soon} className="store-toast" role="status" data-testid="store-soon-toast">
          Próximamente…
        </div>
      )}
    </section>
  );
}
