"use client";

import { useEffect, useRef } from "react";

/**
 * Live, audio-reactive waveform for the page-2 player. Draws a smooth, symmetric
 * soundwave on a canvas from the audio's time-domain data, so it genuinely moves
 * with the rhythm and music (not a static image, not a progress bar). While
 * paused it breathes with a gentle idle wave so the card never looks dead.
 *
 * Attaches ONE Web Audio AnalyserNode to the shared <audio> on first play
 * (createMediaElementSource may run once per element and reroutes audio → must
 * reach ctx.destination). Same-origin previews → real data, no CORS taint.
 * Palette: cream strokes, no orange.
 */

const FFT_SIZE = 1024; // time-domain resolution
const POINTS = 72; // sampled points across the width (smoothed)
type AudioCtor = typeof AudioContext;

export function Waveform({
  audioRef,
  playing,
  className = "",
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playing: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const reduced =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- size (DPR-aware) ----
    let cssW = 0;
    let cssH = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ---- analyser (lazy, on first play) ----
    // createMediaElementSource permanently reroutes the element's output INTO
    // the Web Audio graph — so if we wire it while the AudioContext is still
    // "suspended" (browser autoplay policy), the sound is trapped and the song
    // is silent forever. So we resume first and only build the graph once the
    // context is actually running; until then the element plays natively (and
    // the waveform just idles). Audio playing always wins over reactivity.
    let actx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let buf = new Uint8Array(FFT_SIZE);
    let connected = false;
    const wireGraph = () => {
      if (connected || !audio || !actx || actx.state !== "running") return;
      try {
        analyser = actx.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = 0.72;
        const source = actx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(actx.destination); // keep audio audible
        buf = new Uint8Array(analyser.fftSize);
        connected = true;
      } catch {
        /* Web Audio unavailable / element already bound — leave native audio */
      }
    };
    const connect = () => {
      if (connected || !audio) return;
      const Ctor: AudioCtor | undefined =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: AudioCtor }).webkitAudioContext;
      if (!Ctor) return;
      if (!actx) {
        actx = new Ctor();
        actx.onstatechange = wireGraph; // wire the moment it flips to "running"
      }
      if (actx.state === "suspended") actx.resume().catch(() => {});
      wireGraph();
    };
    audio?.addEventListener("play", connect);
    // Also resume on the first pointer/key gesture anywhere — covers browsers
    // that won't resume from inside the async "play" event.
    const onGesture = () => connect();
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);

    // ---- draw ----
    const env = new Float32Array(POINTS); // smoothed amplitude envelope 0..1
    let raf = 0;

    const draw = (now: number) => {
      const live = analyser && playingRef.current;
      if (live) {
        if (actx?.state === "suspended") actx.resume().catch(() => {});
        analyser!.getByteTimeDomainData(buf);
      }
      const t = now / 1000;
      const seg = Math.floor(buf.length / POINTS);
      for (let i = 0; i < POINTS; i++) {
        let target: number;
        if (live) {
          // rectified peak of this segment = local amplitude
          let peak = 0;
          for (let j = 0; j < seg; j++) {
            const v = Math.abs(buf[i * seg + j] - 128) / 128;
            if (v > peak) peak = v;
          }
          target = Math.min(1, peak * 1.25);
        } else {
          // idle: soft travelling swell so it breathes while paused
          target = 0.1 + 0.07 * (0.5 + 0.5 * Math.sin(t * 1.6 + i * 0.4));
        }
        // ease toward target for fluid motion
        env[i] += (target - env[i]) * (live ? 0.45 : 0.08);
      }

      ctx2d.clearRect(0, 0, cssW, cssH);
      const cy = cssH / 2;
      const amp = cssH * 0.46;
      const dx = cssW / (POINTS - 1);
      // taper the ends so the wave fades in/out at the edges
      const shape = (i: number) => {
        const edge = Math.sin((i / (POINTS - 1)) * Math.PI); // 0..1..0
        return Math.max(2, env[i] * amp * (0.35 + 0.65 * edge));
      };

      // build a smooth symmetric blob (top edge L→R, bottom edge R→L)
      ctx2d.beginPath();
      ctx2d.moveTo(0, cy - shape(0));
      for (let i = 1; i < POINTS; i++) {
        const x = i * dx;
        const px = (i - 1) * dx;
        ctx2d.quadraticCurveTo(px + dx / 2, cy - shape(i - 1), x, cy - shape(i));
      }
      for (let i = POINTS - 1; i > 0; i--) {
        const x = (i - 1) * dx;
        const px = i * dx;
        ctx2d.quadraticCurveTo(px - dx / 2, cy + shape(i), x, cy + shape(i - 1));
      }
      ctx2d.closePath();

      const grad = ctx2d.createLinearGradient(0, 0, 0, cssH);
      grad.addColorStop(0, "rgba(243,236,224,0.85)");
      grad.addColorStop(0.5, "rgba(243,236,224,0.35)");
      grad.addColorStop(1, "rgba(243,236,224,0.85)");
      ctx2d.fillStyle = grad;
      ctx2d.fill();

      // bright centre seam for a crisp soundwave feel
      ctx2d.strokeStyle = "rgba(255,255,255,0.5)";
      ctx2d.lineWidth = 1;
      ctx2d.beginPath();
      ctx2d.moveTo(0, cy);
      ctx2d.lineTo(cssW, cy);
      ctx2d.stroke();

      raf = requestAnimationFrame(draw);
    };

    if (reduced) {
      // static gentle wave, no animation
      for (let i = 0; i < POINTS; i++) env[i] = 0.12;
      draw(0);
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      audio?.removeEventListener("play", connect);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      actx?.close().catch(() => {});
    };
  }, [audioRef]);

  return <canvas ref={canvasRef} className={`p2-wave ${className}`} aria-hidden="true" />;
}
