"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { site } from "@/content/site.config";
import { BrandIcon, type IconKey } from "@/components/ui/BrandIcons";
import { track } from "@/lib/analytics";

/**
 * Hero (#inicio) — full-bleed looping videoclip as the whole "first page".
 * Minimal Drake-style framing: wordmark top-left, streaming/social logos
 * top-right, nothing else. Video is muted + looped (paused under reduced
 * motion).
 */

const ALL_LOGOS: { key: IconKey; label: string; href: string }[] = [
  { key: "spotify", label: "Spotify", href: site.socials.spotify },
  { key: "appleMusic", label: "Apple Music", href: site.socials.appleMusic },
  { key: "youtube", label: "YouTube", href: site.socials.youtube },
  { key: "instagram", label: "Instagram", href: site.socials.instagram },
  { key: "tiktok", label: "TikTok", href: site.socials.tiktok },
];
const LOGOS = ALL_LOGOS.filter((l) => l.href.trim().length > 0);

export function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) v.play().catch(() => {});
  }, []);

  return (
    <section
      id="inicio"
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-ink text-cream"
    >
      {/* full-bleed videoclip — page 1 is the whole, clean videoclip */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster={site.latest.cover}
        muted
        loop
        playsInline
        preload="auto"
        aria-label={`Videoclip de ${site.latest.title}`}
      >
        <source src={site.heroVideo} type="video/mp4" />
      </video>

      {/* top scrim for wordmark/logo legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/70 to-transparent"
      />
      {/* top-centre EL TONI logo (signature) — the page's single h1 (SEO/a11y) */}
      <h1 className="absolute left-1/2 top-5 z-20 m-0 -translate-x-1/2">
        <Link href="#inicio" aria-label="EL TONI — urbano latino" className="block">
          <span className="sr-only">EL TONI</span>
          <Image
            src="/assets/brand/signature-cream.png"
            alt="EL TONI"
            width={909}
            height={932}
            unoptimized
            priority
            className="h-16 w-auto [filter:drop-shadow(0_3px_16px_rgba(0,0,0,0.6))] sm:h-20"
          />
        </Link>
      </h1>

      {/* middle navigation spread across the page: Música · Tienda · Vídeos */}
      <nav
        aria-label="Secciones"
        className="hero-nav absolute left-0 top-1/2 z-20 flex w-full -translate-y-1/2 items-center justify-between px-[clamp(1.25rem,7vw,6rem)] text-sm font-semibold uppercase tracking-[0.22em] sm:text-base"
      >
        <Link href="#escuchar" className="hero-link">
          Música
        </Link>
        <Link href="#tienda" className="hero-link">
          Tienda
        </Link>
        <Link href="#videos" className="hero-link">
          Vídeos
        </Link>
      </nav>

      {/* bottom-centre social logos */}
      <nav
        aria-label="Redes sociales"
        className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-5 sm:gap-6"
      >
        {LOGOS.map((l) => (
          <a
            key={l.key}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={l.label}
            onClick={() => track("follow_click", { platform: l.key })}
            className="connect-logo block"
          >
            <BrandIcon name={l.key} className="h-6 w-6 sm:h-7 sm:w-7" />
          </a>
        ))}
      </nav>
    </section>
  );
}
