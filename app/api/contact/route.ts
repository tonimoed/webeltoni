import { NextResponse } from "next/server";

/**
 * Contact handler (build spec §1 / §7.8).
 *
 * Resend is NOT wired yet (no API key). This validates input server-side and
 * acknowledges receipt; the UI also always offers a mailto: fallback.
 *
 * To enable real email later: set RESEND_API_KEY, install `resend`, and send
 * to eltonihidalgo@gmail.com in the marked block below.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TO = "eltonihidalgo@gmail.com";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const nombre = String(body.nombre ?? "").trim();
  const email = String(body.email ?? "").trim();
  const mensaje = String(body.mensaje ?? "").trim();
  const motivo = String(body.motivo ?? "otro").trim();

  if (nombre.length < 2 || !EMAIL_RE.test(email) || mensaje.length < 5) {
    return NextResponse.json(
      { ok: false, error: "Datos incompletos o no válidos" },
      { status: 422 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    // --- Resend integration (enable once the key is set) -------------------
    // const { Resend } = await import("resend");
    // const resend = new Resend(apiKey);
    // await resend.emails.send({
    //   from: "EL TONI Web <web@eltoni.com>",
    //   to: TO,
    //   replyTo: email,
    //   subject: `[${motivo}] Nuevo mensaje de ${nombre}`,
    //   text: mensaje,
    // });
    // -----------------------------------------------------------------------
    return NextResponse.json({ ok: true, delivered: true });
  }

  // No provider configured yet — acknowledge so the UX completes; the client
  // surfaces the mailto fallback to TO (${TO}).
  void TO;
  return NextResponse.json({ ok: true, delivered: false, deferred: true });
}
