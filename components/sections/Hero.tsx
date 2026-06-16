"use client";

import Image from "next/image";
import { site } from "@/content/site.config";
import { LinkButton } from "@/components/ui/Button";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { useAudio } from "@/components/audio/AudioProvider";

/**
 * Hero (#inicio) — oversized name over full-bleed portrait on deep red.
 * The portrait is the LCP image: priority + preloaded, no layout shift.
 */
export function Hero() {
  const { enabled, nowPlaying } = useAudio();

  return (
    <section
      id="inicio"
      className="relative flex h-[100svh] min-h-[600px] w-full flex-col justify-end overflow-hidden bg-red-deep"
    >
      <Image
        src={site.photos.heroRed}
        alt="EL TONI con traje color crema sobre fondo rojo intenso"
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-[center_20%]"
      />
      {/* warm gradient for text legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/40"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-16 sm:pb-20">
        <h1 className="font-display text-cream text-hero">
          <span className="block">EL TONI</span>
        </h1>

        <p className="mt-3 max-w-xl text-base text-cream/90 sm:text-lg">
          {site.heroHook}
        </p>
        <p className="mt-1 font-display text-amber text-2xl sm:text-3xl">
          {site.lyricAccent}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <LinkButton href="#escuchar" variant="primary">
            Escuchar ahora
          </LinkButton>
          <LinkButton href="#tienda" variant="ghost">
            Tienda
          </LinkButton>
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.25em] text-cream/70">
          {enabled ? `Ahora suena: ${nowPlaying}` : "Activa el sonido ↗"}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center">
        <ScrollCue />
      </div>
    </section>
  );
}
