import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site.config";

export const metadata: Metadata = {
  title: "Privacidad — EL TONI",
  robots: { index: false, follow: true },
};

export default function Privacidad() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-32 text-ink">
      <h1 className="font-display text-4xl">Política de privacidad</h1>
      <p className="mt-6 text-muted">
        Esta web recoge únicamente los datos que nos envías por el formulario de
        contacto (nombre, email y mensaje) con el fin de responderte. No se ceden
        a terceros. Para cualquier consulta o para ejercer tus derechos, escribe a{" "}
        <a href={`mailto:${site.email}`} className="text-red underline">
          {site.email}
        </a>
        .
      </p>
      <Link href="/" className="mt-10 inline-block text-red underline">
        ← Volver
      </Link>
    </article>
  );
}
