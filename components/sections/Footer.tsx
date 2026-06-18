import Link from "next/link";
import { site } from "@/content/site.config";

const LISTEN: { label: string; href: string }[] = [
  { label: "Spotify", href: site.socials.spotify },
  { label: "Apple Music", href: site.socials.appleMusic },
  { label: "YouTube", href: site.socials.youtube },
  { label: "Instagram", href: site.socials.instagram },
  { label: "TikTok", href: site.socials.tiktok },
];

/**
 * Footer — also the site's main block of crawlable text (the rest of the page is
 * video/canvas): artist bio, linked discography, listen-on links and an FAQ that
 * answers the branded search intents. Mirrored into JSON-LD (FAQPage) in layout.
 */
export function Footer() {
  return (
    <footer className="bg-[#050506] text-cream/70">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-14 sm:grid-cols-3">
        <div>
          <h2 className="font-display text-2xl text-cream">EL TONI</h2>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.22em] text-cream/45">
            Urbano latino · España
          </p>
          <p className="mt-4 text-sm leading-relaxed text-cream/65">{site.about}</p>
        </div>

        <nav aria-label="Discografía">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-cream/45">
            Discografía
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {site.releases.map((r) => (
              <li key={r.title}>
                <a
                  href={r.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-cream"
                >
                  {r.title}
                  <span className="text-cream/35"> · {new Date(r.date).getFullYear()}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Escúchame">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-cream/45">
            Escúchame
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {LISTEN.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-cream"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <section aria-label="Preguntas frecuentes" className="mx-auto max-w-5xl px-6 pb-12">
        <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-cream/45">
          Preguntas frecuentes
        </h3>
        <dl className="mt-4 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {site.faq.map((f) => (
            <div key={f.q}>
              <dt className="text-sm font-semibold text-cream/85">{f.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-cream/60">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-cream/45 sm:flex-row">
          <p>© 2026 EL TONI. Todos los derechos reservados.</p>
          <p className="flex gap-5">
            <Link href="/privacidad" className="hover:text-cream">
              Privacidad
            </Link>
            <Link href="/cookies" className="hover:text-cream">
              Cookies
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
