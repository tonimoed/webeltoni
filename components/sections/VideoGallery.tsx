"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site.config";
import { BrandIcon } from "@/components/ui/BrandIcons";
import CosmosBackground from "@/components/ui/cosmos-background";
import { YouTubePlayer } from "@/components/ui/YouTubePlayer";
import { pause, resume } from "@/lib/audio-bus";
import { track } from "@/lib/analytics";
import { wrapDelta, placement, SEED_SPREAD, SEED_OFFSET } from "@/lib/coverflow";

/**
 * Third page (#videos) — a STATIC coverflow of the artist's YouTube videoclips,
 * modelled on `WEB/video gallery 2.png`: one clip centred and sharp, the rest
 * peeking left/right at lower opacity. Nothing drifts on its own — the user
 * steps left/right with the arrows (or by clicking a side clip).
 *
 * Clicking the centred clip plays the official YouTube embed (counts as a real
 * view) for a 1-minute taster; then a "Ver en YouTube" card takes over and links
 * to the full video on YouTube. Background is a chromatic near-black with a red
 * glow so it follows page 2 without feeling identical.
 */

const VIDEOS = site.videos;
const N = VIDEOS.length;
// release year per single (shown as a small "anécdota" on the active clip's bar)
const RELEASE_YEAR = new Map(
  site.releases.map((r) => [r.title, new Date(r.date).getFullYear()]),
);
const PREVIEW_MS = 60_000; // 1-minute taster, then send them to YouTube
const BASE_Y = 0; // deck vertically centred (equal margin top/bottom)

const SUBSCRIBE_URL = `${site.socials.youtube}?sub_confirmation=1`;
const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** YouTube thumbnail; maxres isn't always present, so fall back to hq on error. */
function thumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

type Mode = "browse" | "playing" | "cta";

export function VideoGallery() {
  const fanRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const centerRef = useRef(0); // animated front position (eases toward `selected`)
  const reducedRef = useRef(false);

  const [selected, setSelected] = useState(0);
  const selectedRef = useRef(0);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const [mode, setMode] = useState<Mode>("browse");
  const modeRef = useRef<Mode>("browse");
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const timerRef = useRef<number | undefined>(undefined);

  /* ---- manual snap loop: ease the deck toward `selected`, no auto-drift --- */
  useEffect(() => {
    reducedRef.current =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const loop = () => {
      // shortest signed path from the current centre to the selected card
      const target = centerRef.current + wrapDelta(selectedRef.current, centerRef.current, N);
      const ease = reducedRef.current ? 1 : 0.18;
      centerRef.current += (target - centerRef.current) * ease;
      if (Math.abs(target - centerRef.current) < 0.001) centerRef.current = target;
      const center = ((centerRef.current % N) + N) % N;

      const W = fanRef.current?.clientWidth ?? 1000;
      const spread = Math.min(440, W * 0.34);
      for (let i = 0; i < N; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const p = placement(wrapDelta(i, center, N), spread, 0, BASE_Y);
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

  /* ---- playback + audio coordination ----------------------------------- */
  const backToBrowse = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMode("browse");
    resume(); // restore ambient to its prior on/off state
  }, []);

  const playPreview = useCallback((idx: number) => {
    const v = VIDEOS[idx];
    if (!v) return;
    pause(); // silence ambient — the clip has its own audio
    setMode("playing");
    track("listen_click", { platform: "youtube", track: v.title });
    if (timerRef.current) clearTimeout(timerRef.current);
    // after the 1-minute taster, hand off to YouTube
    timerRef.current = window.setTimeout(() => setMode("cta"), PREVIEW_MS);
  }, []);

  // never leave the ambient silenced if we unmount mid-clip
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      resume();
    },
    [],
  );

  const step = useCallback((dir: number) => {
    if (modeRef.current !== "browse") return;
    setSelected((s) => (((s + dir) % N) + N) % N);
  }, []);

  const onCard = useCallback(
    (i: number) => {
      if (modeRef.current !== "browse") return;
      if (i === selectedRef.current) playPreview(i);
      else setSelected(i);
    },
    [playPreview],
  );

  // arrow-key navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const current = VIDEOS[selected];

  return (
    <section
      id="videos"
      className="p3 relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden text-cream"
    >
      <CosmosBackground />
      <h2 className="sr-only">Videoclips de EL TONI</h2>

      {/* static coverflow deck */}
      <div ref={fanRef} className="p2-fan absolute inset-0 z-10">
        {VIDEOS.map((v, i) => {
          const seed = placement(wrapDelta(i, 0, N), SEED_SPREAD, SEED_OFFSET, BASE_Y);
          const isActive = i === selected;
          const isPlaying = isActive && mode === "playing";
          return (
            <button
              key={v.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onClick={() => onCard(i)}
              aria-label={isActive ? `Reproducir ${v.title}` : `Ver ${v.title}`}
              className="p2-card p2-vid-card"
              style={{
                transform: seed.transform,
                opacity: seed.opacity,
                zIndex: seed.zIndex,
                filter: seed.filter,
              }}
            >
              {isPlaying ? (
                <YouTubePlayer
                  videoId={v.id}
                  title={`${v.title} — EL TONI`}
                  className="p2-vid-frame"
                />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb(v.id)}
                    alt={`${v.title} — EL TONI`}
                    draggable={false}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback) {
                        img.dataset.fallback = "1";
                        img.src = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
                      }
                    }}
                  />
                  {/* only the centred clip shows the title bar + play (like the PNG) */}
                  {isActive && (
                    <span className="p3-titlebar" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="shrink-0">
                        <path d="M7 5v14l11-7z" />
                      </svg>
                      <span className="p3-titlebar-name">
                        {v.title}
                        {RELEASE_YEAR.has(v.title) && (
                          <span className="text-cream/45"> · {RELEASE_YEAR.get(v.title)}</span>
                        )}
                      </span>
                      {v.duration && <span className="p3-titlebar-dur">{v.duration}</span>}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* prev / next — the ONLY way the deck moves */}
      <button onClick={() => step(-1)} aria-label="Vídeo anterior" className="p3-arrow left-3 sm:left-6">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button onClick={() => step(1)} aria-label="Vídeo siguiente" className="p3-arrow right-3 sm:right-6">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* after the 1-minute taster → hand off to YouTube */}
      {mode === "cta" && (
        <div className="p3-cta z-30" role="dialog" aria-label="Seguir viendo en YouTube">
          <p className="p3-cta-eyebrow">Has visto el avance de</p>
          <p className="p3-cta-title">{current.title}</p>
          <a
            href={watchUrl(current.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="p2-sub mt-5"
            onClick={() => track("listen_click", { platform: "youtube", track: current.title })}
          >
            <BrandIcon name="youtube" className="h-5 w-5" />
            Ver completo en YouTube
          </a>
          <button onClick={backToBrowse} className="p3-cta-back">
            Volver a los vídeos
          </button>
        </div>
      )}

      {/* subscribe to YouTube — red pill, footer */}
      <div className="absolute bottom-[14vh] left-0 z-20 flex w-full justify-center px-5">
        <a
          href={SUBSCRIBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Suscríbete en YouTube"
          className="p2-sub"
          onClick={() => track("follow_click", { platform: "youtube" })}
        >
          <BrandIcon name="youtube" className="h-[18px] w-[18px]" />
          Suscríbete
        </a>
      </div>
    </section>
  );
}
