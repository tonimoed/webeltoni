"use client";

import Link from "next/link";
import { site } from "@/content/site.config";
import { track } from "@/lib/analytics";

const FOOTER_SOCIALS = [
  { key: "spotify", label: "Spotify", href: site.socials.spotify },
  { key: "appleMusic", label: "Apple Music", href: site.socials.appleMusic },
  { key: "youtube", label: "YouTube", href: site.socials.youtube },
  { key: "instagram", label: "Instagram", href: site.socials.instagram },
  { key: "tiktok", label: "TikTok", href: site.socials.tiktok },
].filter((s) => s.href.trim().length > 0);

export function Footer() {
  return (
    <footer className="bg-ink py-12 text-cream/80">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="#inicio" className="font-display text-3xl text-cream">
            {site.artist}
          </Link>
          <p className="mt-2 text-sm">© 2026 EL TONI. Todos los derechos reservados.</p>
        </div>

        <nav aria-label="Redes y enlaces del pie" className="flex flex-col gap-4">
          <ul className="flex flex-wrap gap-4 text-sm">
            {FOOTER_SOCIALS.map((s) => (
              <li key={s.key}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("follow_click", { platform: s.key })}
                  className="hover:text-amber"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap gap-4 text-xs text-cream/55">
            <li>
              <Link href="/privacidad" className="hover:text-amber">
                Privacidad
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-amber">
                Cookies
              </Link>
            </li>
            <li>
              <a href="#inicio" className="hover:text-amber">
                Volver arriba ↑
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
