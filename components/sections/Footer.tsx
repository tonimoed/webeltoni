import Link from "next/link";

/** Footer — one quiet legal bar: rights on the left, legal links on the right. */
export function Footer() {
  return (
    <footer className="bg-[#050506]">
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
    </footer>
  );
}
