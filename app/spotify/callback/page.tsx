"use client";

import { useEffect, useState } from "react";
import {
  exchangeCode,
  readPending,
  clearPending,
  saveTrack,
} from "@/lib/spotify-save";

/**
 * Spotify OAuth landing. Exchanges the returned code for a token, saves the
 * track the user was trying to add, then returns to where they came from.
 */
export default function SpotifyCallback() {
  const [msg, setMsg] = useState("Conectando con Spotify…");

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const pending = readPending();
      const ret = pending?.ret || "/#escuchar";
      const error = params.get("error");
      const code = params.get("code");

      if (error || !code) {
        // user declined → don't dead-end: open the song so they can save it manually
        clearPending();
        setMsg("No se conectó. Abriendo la canción…");
        window.location.href = pending?.url || ret;
        return;
      }

      const token = await exchangeCode(code);
      if (token && pending) {
        const ok = await saveTrack(token, pending.id);
        setMsg(ok ? "✓ Guardada en tu biblioteca de Spotify" : "No se pudo guardar la canción.");
      } else {
        setMsg("No se pudo completar la conexión con Spotify.");
      }
      clearPending();
      setTimeout(() => {
        window.location.href = ret;
      }, 1800);
    })();
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-6 text-center text-cream">
      <p className="text-lg">{msg}</p>
    </main>
  );
}
