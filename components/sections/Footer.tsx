import Image from "next/image";
import Link from "next/link";

/**
 * Footer — a single quiet bar: the handwritten signature next to the rights line
 * on the left, legal links on the right. No oversized logo block.
 */
export function Footer() {
  return (
    <footer className="bg-[#050506]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-cream/45 sm:flex-row">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/brand/signature-cream.png"
            alt="EL TONI"
            width={909}
            height={932}
            unoptimized
            className="h-6 w-auto opacity-70"
          />
          <p>© 2026 EL TONI. Todos los derechos reservados.</p>
        </div>
        <p className="flex gap-5">
          <Link href="/privacidad" className="hover:text-cream">
            Privacidad
          </Link>
          <Link href="/cookies" className="hover:text-cream">
            Cookies
          </Link>
        </p>
      </div>
    </footer>
  );
}
