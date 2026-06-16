"use client";

import { site } from "@/content/site.config";
import { track } from "@/lib/analytics";

const PLATFORMS = [
  {
    key: "spotify",
    name: "Spotify",
    cta: "Seguir",
    href: site.socials.spotify,
    accent: "#1DB954",
  },
  {
    key: "appleMusic",
    name: "Apple Music",
    cta: "Seguir",
    href: site.socials.appleMusic,
    accent: "#FA243C",
  },
  {
    key: "youtube",
    name: "YouTube",
    cta: "Suscribirse",
    href: site.socials.youtube,
    accent: "#FF0000",
  },
] as const;

export function Platforms() {
  return (
    <section id="plataformas" className="bg-ink py-[clamp(4rem,10vw,9rem)] text-cream">
      <div className="mx-auto max-w-[1280px] px-5">
        <h2 className="font-display text-h2 leading-none">
          Sígueme
        </h2>
        <p className="mt-3 max-w-md text-cream/70">
          Cada lanzamiento, primero aquí. Elige tu plataforma.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {PLATFORMS.map((p) => (
            <a
              key={p.key}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("follow_click", { platform: p.key })}
              className="group flex flex-col justify-between rounded-[1.25rem] border border-cream/15 bg-cream/[0.03] p-6 transition-colors hover:border-cream/40"
            >
              <span
                className="inline-block h-2 w-12 rounded-full"
                style={{ backgroundColor: p.accent }}
                aria-hidden="true"
              />
              <div className="mt-10">
                <h3 className="font-display text-3xl">{p.name}</h3>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber group-hover:translate-x-1 transition-transform">
                  {p.cta} →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
