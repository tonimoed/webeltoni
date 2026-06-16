"use client";

import { site } from "@/content/site.config";
import { track } from "@/lib/analytics";

const ALL_SOCIALS = [
  { key: "spotify", label: "Spotify", href: site.socials.spotify },
  { key: "appleMusic", label: "Apple Music", href: site.socials.appleMusic },
  { key: "youtube", label: "YouTube", href: site.socials.youtube },
  { key: "instagram", label: "Instagram", href: site.socials.instagram },
  { key: "tiktok", label: "TikTok", href: site.socials.tiktok },
] as const;

export function Social() {
  const visible = ALL_SOCIALS.filter((s) => s.href.trim().length > 0);

  return (
    <section id="seguir" className="bg-cream py-[clamp(3rem,7vw,6rem)] text-ink">
      <div className="mx-auto max-w-[1280px] px-5 text-center">
        <h2 className="font-display text-h2 leading-none text-red-deep">
          Conecta
        </h2>
        <ul className="mt-8 flex flex-wrap justify-center gap-3">
          {visible.map((s) => (
            <li key={s.key}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("follow_click", { platform: s.key })}
                className="inline-block rounded-full border border-ink/25 px-6 py-3 text-sm font-semibold uppercase tracking-wide hover:border-red hover:text-red"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
