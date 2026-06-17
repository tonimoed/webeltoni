"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site.config";
import { BrandIcon } from "@/components/ui/BrandIcons";
import { Waveform } from "@/components/ui/Waveform";
import DynamicWaveBackground from "@/components/ui/dynamic-wave-canvas-background";
import { wrapDelta, placement, SEED_SPREAD, SEED_OFFSET } from "@/lib/coverflow";

/**
 * Second page (#escuchar) — the artist (FOTO PERFIL) anchors a full-bleed
 * coverflow of his discography that fills the whole viewport. Covers drift on
 * their own; the glass player shows the latest single (paused) from the start
 * so it reads as listenable, and clicking any cover flicks it to the front and
 * plays it while the covers keep sliding behind. Deep-red press-photo palette.
 */

interface Single {
  title: string;
  cover: string;
  focus: number;
  preview: string;
  spotify: string;
  appleMusic: string;
}

const SINGLES: Single[] = site.releases.map((r) => ({
  title: r.title,
  cover: r.cover,
  focus: r.focus,
  preview: r.preview,
  spotify: r.spotify,
  appleMusic: r.appleMusic,
}));
const N = SINGLES.length;
const DRIFT_PER_SEC = 0.4; // covers per second — always sliding

export function MusicSection() {
  const fanRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // coverflow position (continuous index of the front cover)
  const centerRef = useRef(0);
  const snapRef = useRef<number | null>(null); // quick "card flick" target on click
  const reducedRef = useRef(false);

  // The player shows the latest single (index 0) from the start, paused.
  const [selected, setSelected] = useState<number>(0);
  const [playing, setPlaying] = useState(false);

  /* ---- coverflow drift / snap loop (writes transforms directly) -------- */
  useEffect(() => {
    reducedRef.current =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;

      // On click we set snapRef = target so the deck does a quick card-flick to
      // bring the chosen cover to the centre (advances if it was coming in,
      // rewinds if it was leaving), then drift resumes — motion never stops.
      const snap = snapRef.current;
      if (snap != null) {
        const diff = snap - centerRef.current;
        centerRef.current += diff * 0.2; // fast, card-like
        if (Math.abs(diff) < 0.02) {
          centerRef.current = snap;
          snapRef.current = null;
        }
      } else if (!reducedRef.current) {
        centerRef.current += (DRIFT_PER_SEC * dt) / 1000;
      }
      const center = ((centerRef.current % N) + N) % N;

      const W = fanRef.current?.clientWidth ?? 1000;
      const spread = Math.min(190, W * 0.16);
      // bias the coverflow left so it doesn't sit on the artist (who is right)
      const offsetX = W >= 640 ? -W * 0.16 : 0;
      for (let i = 0; i < N; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const p = placement(wrapDelta(i, center, N), spread, offsetX);
        el.style.transform = p.transform;
        el.style.opacity = String(p.opacity);
        el.style.zIndex = String(p.zIndex);
        el.style.filter = p.filter;
        el.style.pointerEvents = p.opacity < 0.2 ? "none" : "auto";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---- audio wiring ---------------------------------------------------- */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    // Preload the latest single so the player is ready (but stays paused).
    a.src = SINGLES[0].preview;
    a.load();
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  const playIndex = useCallback((i: number) => {
    const idx = ((i % N) + N) % N;
    setSelected(idx);
    // flick the deck so the chosen cover lands at centre via its shortest
    // visible path, then the loop hands control back to the drift.
    snapRef.current = centerRef.current + wrapDelta(idx, centerRef.current, N);
    const a = audioRef.current;
    if (a) {
      a.src = SINGLES[idx].preview;
      a.load();
      a.play().catch(() => {});
    }
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }, []);

  const step = useCallback(
    (dir: number) => {
      playIndex(selected + dir);
    },
    [selected, playIndex],
  );

  const current = SINGLES[selected];

  return (
    <section
      id="escuchar"
      className="p2 relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden text-cream"
    >
      <audio ref={audioRef} preload="none" />

      {/* animated wave canvas — overlays the red background with a fluid dark-red wave texture */}
      <DynamicWaveBackground />

      {/* artist (FOTO PERFIL) — centred on mobile, anchored right on desktop; melts into the red */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-[1] w-[86%] max-w-[680px] -translate-x-1/2 sm:left-auto sm:right-0 sm:w-[50%] sm:translate-x-0">
        <Image
          src={site.photos.heroRed}
          alt="EL TONI"
          fill
          priority={false}
          sizes="(max-width: 640px) 86vw, 50vw"
          className="object-cover object-top p2-artist"
        />
      </div>

      <h2 className="sr-only">Escucha la discografía de EL TONI</h2>

      {/* full-bleed coverflow fan */}
      <div ref={fanRef} className="p2-fan absolute inset-0 z-10">
        {SINGLES.map((s, i) => {
          const seed = placement(wrapDelta(i, 0, N), SEED_SPREAD, SEED_OFFSET);
          return (
          <button
            key={s.title}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            onClick={() => playIndex(i)}
            aria-label={`Reproducir ${s.title}`}
            className={`p2-card ${selected === i ? "is-active" : ""}`}
            style={{
              transform: seed.transform,
              opacity: seed.opacity,
              zIndex: seed.zIndex,
              filter: seed.filter,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.cover} alt={`${s.title} — EL TONI`} draggable={false} />
          </button>
          );
        })}
      </div>

      {/* glass player (click-pagina-2 style) + save buttons BELOW it, outside the card */}
      <div className="pointer-events-none absolute bottom-24 left-0 z-20 flex w-full flex-col items-center gap-3.5 px-5 sm:w-[68%]">
        <div className="p2-glass pointer-events-auto relative w-[min(94vw,560px)] overflow-hidden">
          {/* the playing single's cover IS the card background (blurred + scrim) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.cover}
            src={current.cover}
            alt=""
            aria-hidden="true"
            className="p2-cover-bg"
            style={{ objectPosition: `center ${current.focus}%` }}
            draggable={false}
          />
          <div className="p2-cover-scrim" aria-hidden="true" />

          <div className="relative z-10">
            {/* centered header: title (big) over artist (small) */}
            <div className="text-center">
              <p className="truncate text-2xl font-bold leading-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
                {current.title}
              </p>
              <p className="mt-0.5 truncate text-sm tracking-[0.18em] text-cream/75 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
                EL TONI
              </p>
            </div>

            {/* live audio-reactive waveform — moves with the music */}
            <Waveform audioRef={audioRef} playing={playing} className="mt-5" />

            {/* controls spread across the width: back · play · forward */}
            <div className="mt-3 flex items-center justify-between px-2">
            <button onClick={() => step(-1)} aria-label="Anterior" className="p2-ctrl">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M19 5L8 12l11 7zM5 5h2v14H5z" />
              </svg>
            </button>
            <button
              onClick={toggle}
              aria-label={playing ? "Pausar" : "Reproducir"}
              className="p2-ctrl p2-ctrl-play"
            >
              {playing ? (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M7 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button onClick={() => step(1)} aria-label="Siguiente" className="p2-ctrl">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M5 5l11 7L5 19zM17 5h2v14h-2z" />
              </svg>
            </button>
            </div>
          </div>
        </div>

        {/* save-to-streaming buttons — OUTSIDE the card, Fey-style glowing pills */}
        <div className="pointer-events-auto flex w-[min(94vw,560px)] flex-col gap-2.5 sm:flex-row sm:gap-3">
          <a
            href={current.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="p2-save flex-1"
          >
            <BrandIcon name="spotify" className="h-[18px] w-[18px]" />
            Añadir a Spotify
            <span className="p2-shine" aria-hidden="true" />
          </a>
          <a
            href={current.appleMusic}
            target="_blank"
            rel="noopener noreferrer"
            className="p2-save flex-1"
          >
            <BrandIcon name="appleMusic" className="h-[18px] w-[18px]" />
            Añadir a Apple Music
            <span className="p2-shine" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
