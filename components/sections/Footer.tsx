import Image from "next/image";
import Link from "next/link";

/**
 * Footer — deliberately minimal and editorial so it reads as part of the
 * cinematic site, not a filler text block. The handwritten signature anchors it,
 * one editorial line gives category (and is the page's crawlable brand text), and
 * a quiet legal bar closes. The machine-readable artist/discography facts live in
 * the JSON-LD (app/layout.tsx), not here.
 */
export function Footer() {
  return (
    <footer className="bg-[#050506] text-cream/70">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-20 text-center">
        <h2 className="sr-only">EL TONI — urbano latino</h2>
        <Image
          src="/assets/brand/signature-cream.png"
          alt="EL TONI"
          width={909}
          height={932}
          unoptimized
          className="h-20 w-auto opacity-90 [filter:drop-shadow(0_3px_18px_rgba(0,0,0,0.6))]"
        />
      </div>

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
