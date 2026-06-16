import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookies — EL TONI",
  robots: { index: false, follow: true },
};

export default function Cookies() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-32 text-ink">
      <h1 className="font-display text-4xl">Política de cookies</h1>
      <p className="mt-6 text-muted">
        Usamos analítica anónima (Vercel Analytics) para entender el tráfico de la
        web, sin perfilado publicitario. El reproductor de Spotify, al cargarlo,
        puede instalar sus propias cookies según su política. No usamos cookies de
        seguimiento propias.
      </p>
      <Link href="/" className="mt-10 inline-block text-red underline">
        ← Volver
      </Link>
    </article>
  );
}
