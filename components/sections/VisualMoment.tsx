"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { site } from "@/content/site.config";
import { useReveal } from "@/lib/use-reveal";
import { duck, unduck } from "@/lib/audio-bus";

/**
 * Visual moment (#momento). Photo + lyric today; built to accept a future
 * video (site.video) WITHOUT redesign: poster -> muted video, ducks the
 * ambient audio while playing, exposes "Ver en YouTube".
 * No autoplaying media; respects prefers-reduced-motion via useReveal.
 */
export function VisualMoment() {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.4 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const video = site.video;

  function playVideo() {
    const el = videoRef.current;
    if (!el) return;
    duck(); // lower ambient audio while video plays
    el.muted = false;
    el.play().catch(() => {});
    setPlaying(true);
  }

  return (
    <section
      id="momento"
      className="relative h-[90svh] min-h-[520px] w-full overflow-hidden bg-ink"
    >
      <div
        ref={ref}
        data-testid="visual-moment"
        data-visible={visible}
        className={`reveal absolute inset-0 ${visible ? "is-visible" : ""}`}
      >
        {video ? (
          <>
            <video
              ref={videoRef}
              poster={video.poster}
              playsInline
              preload="none"
              controls={playing}
              onEnded={() => {
                unduck();
                setPlaying(false);
              }}
              onPause={() => unduck()}
              className="h-full w-full object-cover"
            >
              <source src={video.src} type="video/mp4" />
            </video>
            {!playing && (
              <button
                type="button"
                onClick={playVideo}
                aria-label="Reproducir vídeo"
                className="absolute inset-0 flex items-center justify-center bg-ink/30"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red text-3xl text-white">
                  ▶
                </span>
              </button>
            )}
          </>
        ) : (
          <Image
            src={site.photos.heroRed}
            alt="EL TONI sobre fondo rojo, retrato editorial"
            fill
            sizes="100vw"
            className="object-cover object-[center_25%]"
          />
        )}
      </div>

      {/* lyric overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-end bg-gradient-to-t from-ink/70 to-transparent">
        <div className="mx-auto w-full max-w-[1280px] px-5 pb-14">
          <p className="font-display text-cream text-[clamp(2.5rem,9vw,7rem)] leading-[0.9] drop-shadow">
            {site.lyricAccent}
          </p>
          {video && (
            <a
              href={video.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto mt-4 inline-block text-sm font-semibold uppercase tracking-wide text-amber hover:text-white"
            >
              Ver en YouTube →
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
