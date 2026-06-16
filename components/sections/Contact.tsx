"use client";

import { useState } from "react";
import { site } from "@/content/site.config";
import { ActionButton } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

type Motivo = "booking" | "prensa" | "otro";
type Status = "idle" | "submitting" | "success" | "error";

interface Errors {
  nombre?: string;
  email?: string;
  mensaje?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contact() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [motivo, setMotivo] = useState<Motivo>("booking");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  function validate(): Errors {
    const e: Errors = {};
    if (nombre.trim().length < 2) e.nombre = "Dinos tu nombre.";
    if (!EMAIL_RE.test(email)) e.email = "Email no válido.";
    if (mensaje.trim().length < 5) e.mensaje = "Cuéntanos un poco más.";
    return e;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, mensaje, motivo }),
      });
      if (!res.ok) throw new Error("bad status");
      track("contact_submit");
      setStatus("success");
      setNombre("");
      setEmail("");
      setMensaje("");
    } catch {
      setStatus("error");
    }
  }

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(
    `[${motivo}] Contacto desde la web`,
  )}`;

  return (
    <section id="contacto" className="bg-ink py-[clamp(4rem,10vw,9rem)] text-cream">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 md:grid-cols-2">
        <div>
          <h2 className="font-display text-h2 leading-none">
            Contacto
          </h2>
          <p className="mt-4 max-w-md text-cream/75">
            ¿Booking, prensa o una colaboración? Escríbeme. Respondo yo.
          </p>
          <a
            href={mailto}
            onClick={() => track("email_click")}
            className="mt-6 inline-block text-lg font-semibold text-amber underline-offset-4 hover:underline"
            data-testid="mailto-link"
          >
            {site.email}
          </a>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-4" data-testid="contact-form">
          <div>
            <label htmlFor="c-nombre" className="mb-1 block text-sm font-medium">
              Nombre
            </label>
            <input
              id="c-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              aria-invalid={!!errors.nombre}
              aria-describedby={errors.nombre ? "err-nombre" : undefined}
              className="min-h-11 w-full rounded-lg border border-cream/20 bg-cream/5 px-3 text-cream"
            />
            {errors.nombre && (
              <p id="err-nombre" className="mt-1 text-sm text-amber">
                {errors.nombre}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="c-email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="c-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "err-email" : undefined}
              className="min-h-11 w-full rounded-lg border border-cream/20 bg-cream/5 px-3 text-cream"
            />
            {errors.email && (
              <p id="err-email" className="mt-1 text-sm text-amber">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="c-motivo" className="mb-1 block text-sm font-medium">
              Motivo
            </label>
            <select
              id="c-motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value as Motivo)}
              className="min-h-11 w-full rounded-lg border border-cream/20 bg-cream/5 px-3 text-cream"
            >
              <option value="booking">Booking</option>
              <option value="prensa">Prensa</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="c-mensaje" className="mb-1 block text-sm font-medium">
              Mensaje
            </label>
            <textarea
              id="c-mensaje"
              rows={4}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              aria-invalid={!!errors.mensaje}
              aria-describedby={errors.mensaje ? "err-mensaje" : undefined}
              className="w-full rounded-lg border border-cream/20 bg-cream/5 px-3 py-2 text-cream"
            />
            {errors.mensaje && (
              <p id="err-mensaje" className="mt-1 text-sm text-amber">
                {errors.mensaje}
              </p>
            )}
          </div>

          <ActionButton onClick={() => {}} type="submit" className="w-full">
            {status === "submitting" ? "Enviando…" : "Enviar"}
          </ActionButton>

          <p aria-live="polite" className="min-h-5 text-sm">
            {status === "success" && (
              <span className="text-amber">
                ¡Gracias! Te responderé pronto. Si prefieres,{" "}
                <a href={mailto} className="underline">
                  escríbeme directamente
                </a>
                .
              </span>
            )}
            {status === "error" && (
              <span className="text-amber">
                No se pudo enviar. Escríbeme a{" "}
                <a href={mailto} className="underline">
                  {site.email}
                </a>
                .
              </span>
            )}
          </p>
        </form>
      </div>
    </section>
  );
}
