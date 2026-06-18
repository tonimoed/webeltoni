"use client";

import { useEffect, useRef } from "react";

/**
 * Page 3 (#videos) cosmic backdrop — a vertical "panorama" of the night sky that
 * sits ABOVE the Torre Miranda plaza of page 4. The very top is the deep black
 * of space (so the seam up into page 2 reads black→red); the bottom settles into
 * the same deep navy starfield that crowns the page-4 store scene, so scrolling
 * from page 3 into page 4 feels like one continuous sky.
 *
 * Rendered on a half-res canvas at 30fps: a static sky gradient plus parallax
 * layers of twinkling, slowly-drifting stars, a faint diagonal nebula band, and
 * the occasional shooting star. Pauses off-screen / when hidden / for reduced
 * motion (a CSS gradient on .p3 is the static fallback).
 */

type Star = {
  x: number; // 0..1 of width
  y: number; // 0..1 of height
  r: number; // radius px (at full res)
  b: number; // base brightness 0..1
  tw: number; // twinkle speed
  ph: number; // twinkle phase
  drift: number; // vertical drift (fraction of height per second)
};

const BOTTOM_NAVY = "#04060f"; // near-black space — page 3 stays uniformly dark top→bottom

export default function CosmosBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DPR = Math.min(2, typeof devicePixelRatio !== "undefined" ? devicePixelRatio : 1);
    const SCALE = 0.5 * DPR; // half-res render, sharpened by DPR
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    // deterministic PRNG so the field is stable across resizes (no popping)
    let seed = 0x2f6e2b1;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    const build = () => {
      // ~1 star per 5000 css px², capped — denser than a plain field for depth
      const target = Math.min(420, Math.round((w * h) / 5000));
      stars = Array.from({ length: target }, () => {
        const layer = rnd(); // 0..1 → depth (near stars bigger/brighter/faster)
        return {
          x: rnd(),
          y: rnd(),
          r: (0.35 + layer * 0.9) * SCALE, // small crisp points only — no big blobs
          b: 0.25 + rnd() * 0.75,
          tw: 0.4 + rnd() * 1.8,
          ph: rnd() * Math.PI * 2,
          drift: (0.004 + layer * 0.012) * (rnd() < 0.5 ? -1 : 1),
        };
      });
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * SCALE));
      canvas.height = Math.max(1, Math.round(h * SCALE));
      // build the starfield ONCE — stars are stored in normalised coords, so a
      // resize (e.g. mobile URL-bar show/hide on scroll) must NOT regenerate them
      // or the field visibly "jumps" with no continuity.
      if (stars.length === 0) build();
      if (reduce) drawFrame(0); // paint one static frame
    };

    // shooting stars — rare, brief streaks for life
    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShoot = 3 + Math.random() * 6;

    const paintSky = () => {
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
      g.addColorStop(0, "#000003");
      g.addColorStop(0.4, "#010206");
      g.addColorStop(0.8, "#02040b");
      g.addColorStop(1, BOTTOM_NAVY);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // faint diagonal nebula band (milky-way-ish), low alpha
      const nb = ctx.createLinearGradient(0, canvas.height * 0.1, canvas.width, canvas.height * 0.7);
      nb.addColorStop(0, "rgba(40,40,90,0)");
      nb.addColorStop(0.5, "rgba(70,60,120,0.10)");
      nb.addColorStop(0.62, "rgba(120,90,150,0.06)");
      nb.addColorStop(0.8, "rgba(40,40,90,0)");
      ctx.fillStyle = nb;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    let t0 = 0;
    const drawFrame = (now: number) => {
      const t = now / 1000;
      paintSky();

      ctx.fillStyle = "#fff";
      for (const s of stars) {
        const dy = ((s.y + s.drift * t) % 1 + 1) % 1; // wrap drift
        const tw = reduce ? 1 : 0.55 + 0.45 * Math.sin(s.ph + t * s.tw);
        const alpha = Math.min(1, s.b * tw);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, dy * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // shooting star
      if (!reduce) {
        if (!shooting && t - t0 > nextShoot) {
          shooting = {
            x: (0.2 + Math.random() * 0.6) * canvas.width,
            y: (0.1 + Math.random() * 0.25) * canvas.height,
            vx: (0.18 + Math.random() * 0.12) * canvas.width,
            vy: (0.10 + Math.random() * 0.08) * canvas.height,
            life: 1,
          };
          nextShoot = t - t0 + 7 + Math.random() * 9;
        }
        if (shooting) {
          const s = shooting;
          const tailX = s.x - s.vx * 0.06;
          const tailY = s.y - s.vy * 0.06;
          const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
          grad.addColorStop(0, "rgba(255,255,255,0)");
          grad.addColorStop(1, `rgba(255,255,255,${0.9 * s.life})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4 * SCALE;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
          s.x += s.vx * 0.016;
          s.y += s.vy * 0.016;
          s.life -= 0.02;
          if (s.life <= 0 || s.x > canvas.width || s.y > canvas.height) shooting = null;
        }
      }
    };

    let raf = 0;
    let last = 0;
    const FRAME = 1000 / 30;
    let visible = true;
    let active = true;
    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (now - last < FRAME) return;
      last = now;
      if (!t0) t0 = now / 1000;
      drawFrame(now);
    };
    const start = () => {
      if (raf || reduce || !visible || !active) return;
      last = 0;
      raf = requestAnimationFrame(render);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    window.addEventListener("resize", resize);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);
    const onVis = () => {
      active = !document.hidden;
      if (active) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      stop();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 z-0 h-full w-full" />;
}
