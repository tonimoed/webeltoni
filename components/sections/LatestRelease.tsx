"use client";

import Image from "next/image";
import { useState } from "react";
import { site } from "@/content/site.config";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

const SPOTIFY_ARTIST_ID = "7s116O3u1tP0IaPaRWhDcH";

/** Click-to-load Spotify facade — keeps the 3rd-party iframe off first load. */
function SpotifyFacade() {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        title="Reproductor de Spotify de EL TONI"
        src={`https://open.spotify.com/embed/artist/${SPOTIFY_ARTIST_ID}?utm_source=generator`}
        width="100%"
        height="352"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        className="rounded-[1.25rem]"
      />
    );
  }

  return (
    <button
      type="button"
      data-testid="spotify-facade"
      onClick={() => {
        setLoaded(true);
        track("listen_click", { platform: "spotify", track: site.latest.title });
      }}
      className="flex min-h-[120px] w-full items-center justify-center gap-3 rounded-[1.25rem] border border-ink/15 bg-white/60 px-5 py-6 text-sm font-semibold text-ink transition-colors hover:border-red hover:text-red"
      aria-label="Cargar el reproductor de Spotify"
    >
      <span aria-hidden="true" className="text-2xl">
        ▶
      </span>
      Reproducir en Spotify
    </button>
  );
}

export function LatestRelease() {
  return (
    <section
      id="escuchar"
      className="bg-cream py-[clamp(4rem,10vw,9rem)] text-ink"
    >
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 lg:grid-cols-2">
        {/* Player column */}
        <div className="order-2 lg:order-1">
          <Badge tone="red">{site.latest.label}</Badge>
          <h2 className="font-display mt-4 text-h2 leading-none">
            {site.latest.title}
          </h2>

          <div className="mt-6 flex items-center gap-5">
            <Image
              src={site.latest.cover}
              alt={`Portada de ${site.latest.title}`}
              width={120}
              height={120}
              className="rounded-xl shadow-lg"
            />
            <div className="space-y-3">
              <LinkButton
                href={site.latest.links.spotify}
                external
                trackEvent={["listen_click", { platform: "spotify", track: site.latest.title }]}
              >
                Escuchar {site.latest.title}
              </LinkButton>
              <div className="flex flex-wrap gap-2 text-sm">
                {(
                  [
                    ["spotify", "Spotify", site.latest.links.spotify],
                    ["appleMusic", "Apple Music", site.latest.links.appleMusic],
                    ["youtube", "YouTube", site.latest.links.youtube],
                  ] as const
                ).map(([platform, label, href]) => (
                  <a
                    key={platform}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("listen_click", { platform })}
                    className="rounded-full border border-ink/25 px-3 py-1.5 font-medium hover:border-red hover:text-red"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Track list */}
          <ol className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            {site.topTracks.map((t, i) => (
              <li key={t}>
                <a
                  href={site.latest.links.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("listen_click", { platform: "spotify", track: t })}
                  className="flex items-center gap-4 py-3 hover:text-red"
                >
                  <span className="w-5 text-sm tabular-nums text-muted">
                    {i + 1}
                  </span>
                  <span className="flex-1 font-medium">{t}</span>
                  <span aria-hidden="true" className="text-muted">
                    ▶
                  </span>
                </a>
              </li>
            ))}
          </ol>

          <div className="mt-6">
            <SpotifyFacade />
          </div>
        </div>

        {/* Portrait column */}
        <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-[1.25rem] shadow-xl lg:order-2">
          <Image
            src={site.photos.lightBg}
            alt="EL TONI tumbado con traje crema sobre fondo claro"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
