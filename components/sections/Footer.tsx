import Link from "next/link";

/** Minimal footer bar: rights bottom-left, legal links bottom-right. */
export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-3 bg-[#050506] px-6 py-5 text-xs text-cream/55 sm:flex-row">
      <p>© 2026 EL TONI. Todos los derechos reservados.</p>
      <p className="flex gap-5">
        <Link href="/privacidad" className="hover:text-cream">
          Privacidad
        </Link>
        <Link href="/cookies" className="hover:text-cream">
          Cookies
        </Link>
      </p>
    </footer>
  );
}
